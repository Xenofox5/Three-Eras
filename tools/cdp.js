/* Minimal Chrome DevTools Protocol driver for the browser tests.
 *
 * No npm dependencies: it uses Node's built-in fetch and WebSocket (Node 22+) and any
 * installed Chromium browser (Chrome, Edge or Chromium). The Playwright tests in this
 * folder need Python, which is not available on every machine the game is developed on.
 *
 * The page is served over http rather than opened as file://, because localStorage and
 * the service worker behave differently on a file origin and the game saves to localStorage.
 */
'use strict';
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (typeof WebSocket === 'undefined') {
  console.error('These tests need Node 22 or newer (for the built-in WebSocket). Node ' + process.version + ' found.');
  process.exit(2);
}

const BROWSERS = [
  process.env.TE_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  (process.env.LOCALAPPDATA || '') + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];
function findBrowser() {
  for (const p of BROWSERS) if (p && fs.existsSync(p)) return p;
  throw new Error('No Chromium browser found. Set TE_BROWSER to the executable path.');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

/* Serves one directory on an unused port. Returns { url, close }. */
function serve(dir) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(root, rel);
    if (!path.resolve(file).startsWith(root)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(buf);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => {
    resolve({ url: 'http://127.0.0.1:' + server.address().port, close: () => server.close() });
  }));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

class Session {
  constructor(ws, proc, profile) {
    this.ws = ws; this.proc = proc; this.profile = profile;
    this.seq = 0; this.pending = new Map();
    this.errors = [];
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id);
        if (m.error) rej(new Error(m.method + ': ' + JSON.stringify(m.error))); else res(m.result);
        return;
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        this.errors.push('PAGEERR ' + (d.exception && d.exception.description || d.text));
      }
      if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
        const t = m.params.args.map(a => (a.value !== undefined ? a.value : a.description || a.type)).join(' ');
        if (!/403|favicon|sourcemap/i.test(t)) this.errors.push(m.params.type + ': ' + t);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  /* Evaluates an expression in the page and returns its value. Awaits promises. */
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error('eval failed: ' + (d.exception && d.exception.description || d.text));
    }
    return r.result.value;
  }
  /* Clicks through the DOM rather than a real mouse, so bobbing target cards are not a problem. */
  async click(selector) {
    const ok = await this.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return false; e.click(); return true; })()`);
    if (!ok) throw new Error('no element to click: ' + selector);
  }
  async exists(selector) { return this.eval(`!!document.querySelector(${JSON.stringify(selector)})`); }
  async text(selector) { return this.eval(`(document.querySelector(${JSON.stringify(selector)}) || {}).innerText || ''`); }
  /* Polls for a selector. Returns true if it appeared, false on timeout. */
  async waitFor(selector, timeout = 60000) {
    return this.waitForExpr(`!!document.querySelector(${JSON.stringify(selector)})`, timeout);
  }
  /* Polls an expression until it is truthy. Evaluation errors are expected while a
   * navigation is in flight (the execution context is replaced), so they just retry. */
  async waitForExpr(expression, timeout = 60000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      try { if (await this.eval(expression)) return true; } catch (e) { /* context not ready */ }
      await sleep(100);
    }
    return false;
  }
  /* The game is one large inline script, so #app exists well before it has run.
   * Readiness is boot() having drawn a screen. */
  async waitForGame(timeout = 30000) {
    const ok = await this.waitForExpr(`typeof GAME_VERSION === 'string' && !!document.querySelector('#app').children.length`, timeout);
    if (!ok) throw new Error('the game did not finish loading');
    return ok;
  }
  async goto(url) {
    await this.send('Page.navigate', { url });
    await this.waitForGame();
  }
  async reload() {
    await this.send('Page.reload', {});
    await this.waitForGame();
  }
  /* e.g. reducedMotion('reduce') or reducedMotion(null) to clear. */
  reducedMotion(value) {
    return this.send('Emulation.setEmulatedMedia', value ? { features: [{ name: 'prefers-reduced-motion', value }] } : { features: [] });
  }
  /* Writes a save and reloads so the game picks it up, like the Playwright tests do. */
  async setSave(obj) {
    await this.eval(`localStorage.setItem('threeEras.save.v2', ${JSON.stringify(JSON.stringify(obj))}); true`);
    await this.reload();
  }
  async close() {
    try { this.ws.close(); } catch (e) { /* already gone */ }
    try { this.proc.kill(); } catch (e) { /* already gone */ }
    await sleep(150);
    try { fs.rmSync(this.profile, { recursive: true, force: true }); } catch (e) { /* leave it */ }
  }
}

/* Launches a headless browser and attaches to its first page. */
async function launch({ width = 390, height = 844 } = {}) {
  const exe = findBrowser();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'te-cdp-'));
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-extensions', '--mute-audio',
    '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find(t => t.type === 'page');
    } catch (e) { /* not listening yet */ }
    if (!target) await sleep(250);
  }
  if (!target) { proc.kill(); throw new Error('the browser did not expose a debugging port'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', () => rej(new Error('could not attach to the page'))); });

  const s = new Session(ws, proc, profile);
  await s.send('Runtime.enable');
  await s.send('Page.enable');
  await s.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
  return s;
}

/* Small result collector so each test file reads the same way. */
function results() {
  const rows = [];
  return {
    check(name, got, want) {
      const pass = JSON.stringify(got) === JSON.stringify(want);
      rows.push({ name, got, want, pass });
      return pass;
    },
    ok(name, pass, detail) { rows.push({ name, got: detail, want: undefined, pass: !!pass, plain: true }); return !!pass; },
    report(extraErrors = []) {
      let bad = 0;
      for (const r of rows) {
        if (!r.pass) bad++;
        let line = `${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`;
        if (!r.pass && !r.plain) line += `\n        got ${JSON.stringify(r.got)}  want ${JSON.stringify(r.want)}`;
        else if (r.got !== undefined && r.plain) line += `  (${r.got})`;
        console.log(line);
      }
      console.log(`\n${rows.length - bad}/${rows.length} passed`);
      if (extraErrors.length) { console.log('\nconsole output:'); extraErrors.slice(0, 15).forEach(e => console.log('  ' + e)); }
      return bad === 0 && extraErrors.length === 0;
    }
  };
}

/* Resolves TE_HTML (default dist/three-eras.html) into a served directory and page URL. */
async function hostGame() {
  const rel = process.env.TE_HTML || 'dist/three-eras.html';
  const file = path.resolve(rel);
  if (!fs.existsSync(file)) throw new Error(`${rel} not found. Run "npm run build" first.`);
  const srv = await serve(path.dirname(file));
  return { url: srv.url + '/' + path.basename(file), close: srv.close };
}

module.exports = { launch, serve, hostGame, results, sleep, findBrowser };
