/* Browser smoke test: boots the built game, fights a spread of campaign stages and one
 * Gauntlet wave on auto, and checks the battle screen actually draws its effects.
 *
 * Needs only Node 22+ and an installed Chromium browser. Run with: npm run test:smoke
 * Point it at another build with TE_HTML=dist/three-eras-offline.html.
 */
'use strict';
const { launch, hostGame, results, sleep } = require('./cdp');

const STAGE_SAMPLE = [0, 5, 10, 15, 17, 20];
const STAGE_MS = 120000;
const since = t => ((Date.now() - t) / 1000).toFixed(0) + 's';

/* speed 40 is far past the in-game 1/2/3, but T() just divides by it, so battles resolve fast. */
const fastSave = extra => Object.assign({ speed: 40, sound: false, motion: 'full' }, extra);
const starsFor = ids => Object.fromEntries(ids.map(id => [id, 1]));

(async () => {
  const host = await hostGame();
  const s = await launch();
  const R = results();
  try {
    await s.goto(host.url);
    R.ok('game boots to the title screen', await s.exists('.logo'));
    R.check('version tag is rendered', typeof await s.eval('GAME_VERSION'), 'string');

    // Every stage unlocked so the sample can be reached directly.
    const stars = starsFor(await s.eval('STAGES.map(x => x.id)'));

    for (const si of STAGE_SAMPLE) {
      await s.setSave(fastSave({ team: ['yunze', 'malakai', 'yousuf'], stars }));
      await s.eval(`showTeam({ mode: 'campaign', idx: ${si} }); true`);
      await s.click('#fight');
      await sleep(300);
      await s.click('#bAuto');
      const t0 = Date.now();
      const done = await s.waitFor('.res', STAGE_MS);
      const name = await s.eval(`STAGES[${si}].name`);
      const outcome = done ? (await s.text('.res h2')).trim() : 'TIMEOUT';
      R.ok(`stage ${si + 1} resolves (${name})`, done && /Victory|Defeated/.test(outcome), `${outcome}, ${since(t0)}`);
    }

    // Gauntlet should finish a wave and offer boons.
    await s.setSave(fastSave({ team: ['angus', 'flynn', 'yousuf'], stars: { road: 1 } }));
    await s.eval(`showTeam({ mode: 'gauntlet' }); true`);
    await s.click('#fight');
    await sleep(300);
    await s.click('#bAuto');
    const gDone = await s.waitFor('.res', STAGE_MS);
    R.ok('gauntlet wave 1 resolves', gDone);
    R.ok('gauntlet offers a boon after a win', await s.exists('.boon') || !await s.eval(`B.result === 'win'`));

    /* Reduced motion. Windows reports prefers-reduced-motion: reduce whenever animation
     * effects are switched off, which once hid every attack, number and hit on desktop. */
    await s.reducedMotion('reduce');
    await s.setSave(fastSave({ team: ['angus', 'flynn', 'leo'], stars }));
    R.check('device asks for reduced motion', await s.eval(`matchMedia('(prefers-reduced-motion: reduce)').matches`), true);
    R.check('full mode ignores it', await s.eval('[SAVE.motion, REDUCED]'), ['full', false]);
    R.check('damage numbers keep their animation', await s.eval(`
      (() => { const d = document.createElement('div'); d.className = 'fl dmg'; document.body.appendChild(d);
        const v = getComputedStyle(d).animationDuration; d.remove(); return v; })()`), '1.15s');

    // Count what a real fight puts on screen while the device asks for reduced motion.
    await s.eval(`
      window.__fx = 0; window.__num = 0;
      new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.parentElement && n.parentElement.id === 'fx') __fx++;
        if (n.classList.contains('fl')) __num++;
      } }).observe(document.body, { childList: true, subtree: true });
      showTeam({ mode: 'campaign', idx: 0 }); true`);
    await s.click('#fight');
    await sleep(300);
    await s.click('#bAuto');
    await s.waitFor('.res', STAGE_MS);
    const fx = await s.eval('__fx'), num = await s.eval('__num');
    R.ok('battle effects reach the screen under reduced motion', fx > 20, `${fx} effects`);
    R.ok('damage numbers reach the screen under reduced motion', num > 5, `${num} numbers`);

    // Reduced should be softer, not empty.
    await s.eval(`SAVE.motion = 'reduced'; applyMotion(); true`);
    R.check('reduced mode suppresses shake', await s.eval(`
      (() => { const d = document.createElement('div'); d.className = 'shake'; document.body.appendChild(d);
        const v = getComputedStyle(d).animationName; d.remove(); return v; })()`), 'none');
    R.check('reduced mode keeps damage numbers', await s.eval(`
      (() => { const d = document.createElement('div'); d.className = 'fl dmg'; document.body.appendChild(d);
        const v = getComputedStyle(d).animationDuration; d.remove(); return v; })()`), '1.15s');
    await s.reducedMotion(null);
  } catch (e) {
    R.ok('ran without throwing', false, e.message);
  } finally {
    const ok = R.report(s.errors);
    await s.close();
    host.close();
    process.exit(ok ? 0 : 1);
  }
})();
