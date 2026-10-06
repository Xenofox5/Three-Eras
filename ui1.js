/* ================= UI: core ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Motion. REDUCED is live, not a load-time constant: the player can override the device
   preference from the title screen, and 'auto' must react when that preference changes.
   Reduced drops shake, lunges and full-screen flashes; it keeps damage numbers, slashes,
   bursts and rings, because those carry the information the battle screen runs on. */
const MOTION_MODES = ['full', 'reduced', 'auto'];
const MOTION_MQ = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
let REDUCED = false;
const NS = 'http://www.w3.org/2000/svg';

const SAVE_KEY = 'threeEras.save.v2';
function loadSave() {
  try {
    const v2 = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (v2) return v2;
    const v1 = JSON.parse(localStorage.getItem('threeEras.save.v1'));
    if (v1) {
      const ids = ['road', 'pack', 'quarry', 'wyvern', 'cult', 'malakai', 'elphi', 'chosen', 'yunze', 'harry'];
      const stars = {};
      (v1.stars || []).forEach((n, i) => { if (n && ids[i]) stars[ids[i]] = n; });
      return { stars, team: v1.team || [], best: v1.best || 0, sound: v1.sound !== false, speed: v1.speed || 1, migrated: true };
    }
  } catch (e) { /* storage unavailable */ }
  return {};
}
function saveDefaults() { return { stars: {}, team: [], best: 0, runs: 0, sound: true, speed: 1, motion: 'full', builds: {}, seenUnlock: {} }; }
const SAVE = Object.assign(saveDefaults(), loadSave());
if (Array.isArray(SAVE.stars) || typeof SAVE.stars !== 'object' || !SAVE.stars) SAVE.stars = {};
if (!SAVE.builds) SAVE.builds = {};
if (!SAVE.seenUnlock) SAVE.seenUnlock = {};
if (!MOTION_MODES.includes(SAVE.motion)) SAVE.motion = 'full';
function reducedNow() { return SAVE.motion === 'reduced' || (SAVE.motion === 'auto' && !!(MOTION_MQ && MOTION_MQ.matches)); }
function applyMotion() { REDUCED = reducedNow(); if (document.body) document.body.classList.toggle('reduced', REDUCED); }
applyMotion();
if (MOTION_MQ && MOTION_MQ.addEventListener) MOTION_MQ.addEventListener('change', applyMotion);
/* Dev mode opens every hero and stage so a change can be tested without replaying the
   campaign. It only lifts the locks: stars, records and the Gauntlet best are untouched. */
if (new URLSearchParams(location.search).has('dev')) SAVE.dev = true;
const isUnlocked = id => !!SAVE.dev || STARTERS.includes(id) || (SAVE.stars[UNLOCK_FROM[id]] || 0) > 0;
const stageOpen = i => !!SAVE.dev || i === 0 || (SAVE.stars[STAGES[i - 1].id] || 0) > 0 || (SAVE.stars[STAGES[i].id] || 0) > 0;
const totalStars = () => STAGES.reduce((a, s) => a + (SAVE.stars[s.id] || 0), 0);
/* ---------- saving: device storage plus a private copy on the player's Claude account ---------- */
const CLOUD = { ref: null, status: 'local', writing: false, dirty: false, timer: null };
function store() {
  SAVE.updated = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* storage unavailable */ }
  if (CLOUD.ref) { clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(cloudWrite, 1200); }
}
async function cloudWrite() {
  CLOUD.timer = null;
  if (!CLOUD.ref) return;
  if (CLOUD.writing) { CLOUD.dirty = true; return; }
  CLOUD.writing = true;
  const body = { json: JSON.stringify(SAVE), updated: SAVE.updated || Date.now(), v: 2 };
  try { await CLOUD.ref.set(body); CLOUD.status = 'cloud'; }
  catch (e) {
    if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 700 + Math.random() * 800)); try { await CLOUD.ref.set(body); } catch (e2) { CLOUD.status = 'error'; } }
    else if (e && (e.code === 'revoked' || e.code === 'not_granted' || e.code === 'capability_disabled' || e.code === 'capability_removed')) { CLOUD.ref = null; CLOUD.status = 'local'; }
    else CLOUD.status = 'error';
  }
  CLOUD.writing = false;
  updateSaveNote();
  if (CLOUD.dirty) { CLOUD.dirty = false; cloudWrite(); }
}
function mergeSave(r) {
  if (!r || typeof r !== 'object') return;
  for (const [k, v] of Object.entries(r.stars || {})) SAVE.stars[k] = Math.max(SAVE.stars[k] || 0, +v || 0);
  SAVE.best = Math.max(SAVE.best || 0, r.best || 0);
  SAVE.runs = Math.max(SAVE.runs || 0, r.runs || 0);
  Object.assign(SAVE.seenUnlock, r.seenUnlock || {});
  if (r.migrNote) SAVE.migrNote = true;
  try { mergeRec(r); } catch (e) { /* ignore malformed records */ }
  if ((r.updated || 0) > (SAVE.updated || 0)) {
    if (Array.isArray(r.team)) SAVE.team = r.team;
    SAVE.builds = Object.assign({}, SAVE.builds, r.builds || {});
    if (r.speed) SAVE.speed = r.speed;
    if (typeof r.sound === 'boolean') SAVE.sound = r.sound;
    if (MOTION_MODES.includes(r.motion)) SAVE.motion = r.motion;
    SAVE.updated = r.updated;
  } else SAVE.builds = Object.assign({}, r.builds || {}, SAVE.builds);
}
function cloudInit() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  Promise.all([window.claude.use('db'), window.claude.use('user')]).then(async ([db, user]) => {
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    const ref = db.doc('data/users/' + uid + '/save');
    let snap = null;
    for (let i = 0; i < 2 && !snap; i++) {
      try { snap = await ref.get(); } catch (e) { if (!e || e.code !== 'unavailable') return; await new Promise(r => setTimeout(r, 600 + Math.random() * 800)); }
    }
    if (!snap) return;
    CLOUD.ref = ref; CLOUD.status = 'cloud';
    let remote = null;
    if (snap.exists) { try { remote = JSON.parse((snap.data() || {}).json || 'null'); } catch (e) { remote = null; } }
    const before = JSON.stringify(SAVE);
    if (remote) mergeSave(remote);
    const after = JSON.stringify(SAVE);
    try { localStorage.setItem(SAVE_KEY, after); } catch (e) { /* ignore */ }
    if (after !== before) onSaveMerged();
    const hasProgress = Object.keys(SAVE.stars).length || (SAVE.team || []).length || SAVE.best;
    if (hasProgress && (!remote || JSON.stringify(remote) !== after)) cloudWrite();
    updateSaveNote();
  }).catch(() => {});
}
function onSaveMerged() {
  if (UI.bt) return;
  if ($('#tSnd')) showTitle();
  else if ($('.stage')) showCampaign();
  else if (UI.tctx && $('#fight')) showTeam(UI.tctx);
}
function updateSaveNote() {
  const el = document.getElementById('saveNote'); if (!el) return;
  el.textContent = CLOUD.status === 'cloud' ? '☁ Progress is saved to your Claude account.' : CLOUD.status === 'error' ? 'Couldn\'t reach your account. Progress is saved on this device.' : 'Progress is saved on this device.';
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && CLOUD.timer) { clearTimeout(CLOUD.timer); cloudWrite(); } });

const UI = { bt: null, arena: null, fx: null, pending: null, log: [], ctx: null, cards: {} };
const T = ms => (B.abort ? 0 : ms / (SAVE.speed || 1));

/* ---------- sound ---------- */
const SND = (() => {
  let ctx = null, master = null, noiseBuf = null, last = {};
  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, d, type = 'sine', v = 0.3, slide = 0, delay = 0) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, v = 0.3, freq = 1200, q = 1, type = 'bandpass', delay = 0) {
    const t = ctx.currentTime + delay;
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + 0.03);
  }
  const S = {
    hit() { noise(0.12, 0.5, 900, 0.8); tone(120, 0.12, 'sine', 0.4, 0.5); },
    crit() { noise(0.22, 0.6, 1500, 0.7); tone(90, 0.22, 'square', 0.22, 0.4); tone(1400, 0.16, 'triangle', 0.14, 1.5, 0.02); },
    miss() { noise(0.2, 0.25, 2600, 2, 'highpass'); },
    shield() { tone(880, 0.18, 'triangle', 0.16, 1.3); tone(1320, 0.22, 'sine', 0.09, 1.2, 0.03); },
    break() { noise(0.35, 0.4, 3200, 0.6, 'highpass'); tone(620, 0.3, 'square', 0.1, 0.3); },
    dot() { tone(300, 0.08, 'triangle', 0.12, 0.7); },
    ko() { tone(320, 0.55, 'sawtooth', 0.16, 0.25); noise(0.35, 0.22, 400, 1, 'lowpass'); },
    heal() { [523, 659, 784].forEach((f, i) => tone(f, 0.26, 'sine', 0.12, 1, i * 0.06)); },
    zap() { noise(0.16, 0.35, 4200, 3); tone(1900, 0.12, 'square', 0.07, 0.3); },
    fire() { noise(0.38, 0.38, 650, 0.5, 'lowpass'); tone(160, 0.3, 'sawtooth', 0.06, 0.6); },
    ult() { tone(110, 0.9, 'sawtooth', 0.16, 4); noise(0.8, 0.18, 800, 0.5, 'lowpass'); tone(880, 0.5, 'triangle', 0.1, 1.5, 0.4); },
    click() { tone(660, 0.05, 'square', 0.05); },
    select() { tone(880, 0.06, 'triangle', 0.07, 1.2); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.38, 'triangle', 0.15, 1, i * 0.11)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.42, 'sine', 0.14, 1, i * 0.16)); },
    banner() { tone(196, 0.8, 'sawtooth', 0.1, 1.01); tone(294, 0.8, 'sawtooth', 0.07, 1.01, 0.05); },
    crush() { tone(58, 0.45, 'sine', 0.55, 0.5); noise(0.16, 0.4, 300, 1, 'lowpass'); },
    whoosh() { noise(0.16, 0.22, 1800, 1.5); },
    gain() { tone(1046, 0.08, 'triangle', 0.06, 1.2); }
  };
  return {
    play(n) {
      if (!SAVE.sound || !init()) return;
      const now = performance.now();
      if (last[n] && now - last[n] < 45) return;
      last[n] = now;
      if (ctx.state === 'suspended') ctx.resume();
      try { S[n] && S[n](); } catch (e) { /* ignore */ }
    },
    unlock() { if (SAVE.sound && init() && ctx.state === 'suspended') ctx.resume(); }
  };
})();
document.addEventListener('pointerdown', () => SND.unlock(), { once: true });

/* ---------- animation helpers ---------- */
function anim(el, kf, dur, o = {}) {
  if (!el) return Promise.resolve();
  const d = T(dur);
  if (!el.animate || d <= 0) return new Promise(r => setTimeout(r, d));
  try {
    const a = el.animate(kf, Object.assign({ duration: d, easing: 'ease-out', fill: 'forwards' }, o));
    return a.finished.then(() => a).catch(() => a);
  } catch (e) { return new Promise(r => setTimeout(r, d)); }
}
const later = (fn, ms) => setTimeout(fn, T(ms));
const MDUR = ms => REDUCED ? Math.min(ms, 150) : ms;
function restartClass(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); later(() => el.classList.remove(cls), 500); }

function cardEl(u) { return u && UI.cards[u.uid] && document.contains(UI.cards[u.uid]) ? UI.cards[u.uid] : null; }
function P(u) {
  const c = cardEl(u);
  if (!c || !UI.arena) { const a = UI.arena ? UI.arena.getBoundingClientRect() : { width: 300, height: 300 }; return { x: a.width / 2, y: a.height / 2, w: 60, h: 60 }; }
  const r = c.querySelector('.por').getBoundingClientRect(), a = UI.arena.getBoundingClientRect();
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2, w: r.width, h: r.height };
}
function fxEl(cls, css = {}) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.style.position = 'absolute';
  Object.assign(d.style, css);
  if (UI.fx) UI.fx.appendChild(d);
  return d;
}

/* ---------- FX primitives ---------- */
async function projectile(a, b, { color = '#fff', size = 16, dur = 300, ease = 'ease-in' } = {}) {
  dur = MDUR(dur);
  const d = fxEl('pj', { left: a.x + 'px', top: a.y + 'px', width: size + 'px', height: size + 'px',
    background: `radial-gradient(circle,#fff 0 22%,${color} 50%,transparent 72%)`, boxShadow: `0 0 ${size}px ${color}` });
  await anim(d, [{ left: a.x + 'px', top: a.y + 'px', transform: 'translate(-50%,-50%) scale(.6)' }, { left: b.x + 'px', top: b.y + 'px', transform: 'translate(-50%,-50%) scale(1.1)' }], dur, { easing: ease });
  d.remove();
}
async function beam(a, b, { color = '#fff', width = 14, dur = 420 } = {}) {
  dur = MDUR(dur);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
  const d = fxEl('', { left: a.x + 'px', top: (a.y - width / 2) + 'px', width: len + 'px', height: width + 'px', transformOrigin: '0 50%', borderRadius: width + 'px',
    background: `linear-gradient(180deg,transparent,${color} 22%,#fff 50%,${color} 78%,transparent)`, boxShadow: `0 0 22px ${color}` });
  await anim(d, [{ transform: `rotate(${ang}deg) scaleX(0)` }, { transform: `rotate(${ang}deg) scaleX(1)` }], dur * 0.4);
  anim(d, [{ opacity: 1, transform: `rotate(${ang}deg) scaleX(1) scaleY(1)` }, { opacity: 0, transform: `rotate(${ang}deg) scaleX(1) scaleY(.15)` }], dur * 0.7).then(() => d.remove());
}
function zap(a, b, { color = '#9fe6ff', dur = 280, jag = 14 } = {}) {
  if (!UI.fx) return;
  dur = MDUR(dur);
  const svg = document.createElementNS(NS, 'svg');
  const n = 9, pts = [];
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = (i === 0 || i === n) ? 0 : (Math.random() * 2 - 1) * jag;
    pts.push((a.x + dx * t + nx * off).toFixed(1) + ',' + (a.y + dy * t + ny * off).toFixed(1));
  }
  const p = pts.join(' ');
  svg.innerHTML = `<polyline points="${p}" fill="none" stroke="${color}" stroke-width="9" stroke-linejoin="round" opacity=".45"/><polyline points="${p}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  UI.fx.appendChild(svg);
  anim(svg, [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0 }], dur, { easing: 'linear' }).then(() => svg.remove());
}
function slashAt(p, { color = '#fff', angle = -32, len = 90, off = 0, dur = 260, thick = 5 } = {}) {
  const d = fxEl('slashfx', { left: (p.x - len / 2) + 'px', top: (p.y - thick / 2 + off) + 'px', width: len + 'px', height: thick + 'px' });
  d.style.setProperty('--c', color);
  anim(d, [{ transform: `rotate(${angle}deg) scaleX(0)`, opacity: 1 }, { transform: `rotate(${angle}deg) scaleX(1.1)`, opacity: 1, offset: 0.45 }, { transform: `rotate(${angle}deg) scaleX(1.2) scaleY(.3)`, opacity: 0 }], dur).then(() => d.remove());
}
function burst(p, { color = '#fff', n = 10, spread = 55, dur = 520, size = 7, up = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, r = spread * (0.45 + Math.random() * 0.7), s = size * (0.6 + Math.random() * 0.8);
    const d = fxEl('part', { left: p.x + 'px', top: p.y + 'px', width: s + 'px', height: s + 'px' });
    d.style.setProperty('--c', color);
    anim(d, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r - up}px)) scale(.2)`, opacity: 0 }], dur * (0.7 + Math.random() * 0.5), { easing: 'cubic-bezier(.1,.7,.3,1)' }).then(() => d.remove());
  }
}
function ring(p, { color = '#fff', size = 90, dur = 460, from = 0.2, to = 1, width = 3 } = {}) {
  const d = fxEl('ring', { left: p.x + 'px', top: p.y + 'px', width: size + 'px', height: size + 'px', borderWidth: width + 'px', boxShadow: `0 0 14px ${color}, inset 0 0 10px ${color}` });
  d.style.setProperty('--c', color);
  return anim(d, [{ transform: `translate(-50%,-50%) scale(${from})`, opacity: 1 }, { transform: `translate(-50%,-50%) scale(${to})`, opacity: 0 }], dur).then(() => d.remove());
}
async function column(p, { color = '#fff', width = 44, dur = 420 } = {}) {
  const d = fxEl('colfx', { left: p.x + 'px', width: width + 'px', height: (p.y + 40 + p.h * 0.3) + 'px', transformOrigin: '50% 0' });
  d.style.setProperty('--c', color);
  await anim(d, [{ transform: 'translateX(-50%) scaleY(0)', opacity: 1 }, { transform: 'translateX(-50%) scaleY(1)', opacity: 1 }], dur * 0.45, { easing: 'ease-in' });
  anim(d, [{ opacity: 1, transform: 'translateX(-50%) scaleY(1) scaleX(1)' }, { opacity: 0, transform: 'translateX(-50%) scaleY(1) scaleX(1.8)' }], dur * 0.7).then(() => d.remove());
}
function flash(color = '#fff', op = 0.35, dur = 300) {
  if (REDUCED) return;
  const d = document.createElement('div'); d.className = 'flash'; d.style.background = color;
  document.body.appendChild(d);
  anim(d, [{ opacity: op }, { opacity: 0 }], dur).then(() => d.remove());
}
function shakeArena(strong) { if (!REDUCED && UI.arena) restartClass(UI.arena, strong ? 'shake2' : 'shake'); }
async function lungeIn(u, t, f = 0.42, dur = 170) {
  const c = cardEl(u);
  if (!c || !t || REDUCED || !c.animate) return () => {};
  const a = P(u), b = P(t);
  const dx = (b.x - a.x) * f, dy = (b.y - a.y) * f;
  const k = `translate(${dx}px,${dy}px) scale(1.07)`;
  c.style.zIndex = 8;
  const a1 = c.animate([{ transform: 'none' }, { transform: k }], { duration: T(dur), easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
  await a1.finished.catch(() => {});
  return () => {
    const a2 = c.animate([{ transform: k }, { transform: 'none' }], { duration: T(230), easing: 'ease-out', fill: 'forwards' });
    a2.finished.then(() => { a1.cancel(); a2.cancel(); c.style.zIndex = ''; }).catch(() => { c.style.zIndex = ''; });
  };
}
function ghost(u, dx, dy, dur = 420, color) {
  const c = cardEl(u);
  if (!c || REDUCED || !UI.fx) return;
  const p = P(u);
  const g = fxEl('', { left: (p.x - p.w / 2) + 'px', top: (p.y - p.h / 2) + 'px', width: p.w + 'px', height: p.h + 'px', borderRadius: '12px', overflow: 'hidden', filter: `drop-shadow(0 0 8px ${color || u.color}) saturate(1.5)`, opacity: 0.6 });
  g.innerHTML = c.querySelector('.pi').innerHTML;
  anim(g, [{ transform: 'translate(0,0)', opacity: 0.65 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }], dur).then(() => g.remove());
}

async function melee(d, { color, n = 1, angle = -32, f = 0.42, len = 1.15, thick = 5, sfx = 'whoosh', parallel = false, extra } = {}) {
  const tgt = d.tgt; if (!tgt) return;
  color = color || d.color || '#fff';
  SND.play(sfx);
  const back = await lungeIn(d.src, tgt, f);
  const p = P(tgt);
  for (let k = 0; k < n; k++) {
    const ang = parallel ? angle : angle + k * 55 + (d.i || 0) * 38;
    later(() => slashAt(p, { color, angle: ang, len: p.w * len, off: parallel ? (k - (n - 1) / 2) * 12 : 0, thick }), k * 40);
  }
  burst(p, { color, n: 7, spread: 34, size: 6 });
  if (extra) extra(p);
  later(back, 120);
}
