/* Browser regression test: fights every campaign stage on auto with rotating teams and
 * non-default builds, plus a custom battle and four Gauntlet waves. Slower than the smoke
 * test, so it runs in two halves.
 *
 * Needs only Node 22+ and an installed Chromium browser.
 *   npm run test:regression          both halves
 *   node tools/browser_regression.js 0   first half only
 * Point it at another build with TE_HTML=dist/three-eras-offline.html.
 */
'use strict';
const { launch, hostGame, results, sleep } = require('./cdp');

const TEAMS = [
  ['trigg', 'alfred', 'yousuf'], ['ethan', 'ben', 'gemia'], ['kingsley', 'vasco', 'david'],
  ['aamay', 'harry', 'daniel'], ['soham', 'vehra', 'seraphine'], ['trigg', 'ethan', 'kingsley']
];
const BUILDS = { trigg: 'packmaster', alfred: 'chaos', ethan: 'warking', ben: 'schemer',
  kingsley: 'collector', vasco: 'hollow', aamay: 'archivist', soham: 'breaker' };

const part = process.argv[2] === undefined ? null : Number(process.argv[2]);
/* Generous: a 3-vs-5 of heroes can run past 120 turns into sudden death, and the browser
 * slows down over a long session. Elapsed time is reported so a creeping fight is visible. */
const STAGE_MS = 120000, LONG_MS = 240000;
const since = t => ((Date.now() - t) / 1000).toFixed(0) + 's';
const fastSave = extra => Object.assign({ speed: 40, sound: false, motion: 'full' }, extra);

(async () => {
  const host = await hostGame();
  const s = await launch();
  const R = results();
  try {
    await s.goto(host.url);
    const ids = await s.eval('STAGES.map(x => x.id)');
    const stars = Object.fromEntries(ids.map(id => [id, 1]));
    const half = Math.ceil(ids.length / 2);
    const range = part === 0 ? [0, half] : part === 1 ? [half, ids.length] : [0, ids.length];

    for (let si = range[0]; si < range[1]; si++) {
      const team = TEAMS[si % TEAMS.length];
      await s.setSave(fastSave({ team, builds: BUILDS, stars }));
      await s.eval(`showTeam({ mode: 'campaign', idx: ${si} }); true`);
      await s.click('#fight');
      await sleep(250);
      await s.click('#bAuto');
      const t0 = Date.now();
      const done = await s.waitFor('.res', STAGE_MS);
      const outcome = done ? (await s.text('.res h2')).trim() : 'TIMEOUT';
      R.ok(`stage ${si + 1} ${ids[si]} with ${team.join('/')}`, done && /Victory|Defeated/.test(outcome), `${outcome}, ${since(t0)}`);
    }

    if (part !== 0) {
      // Custom battle: heroes on the enemy side, which exercises the hero-as-foe paths.
      await s.setSave(fastSave({ stars: { road: 1 },
        custom: { team: ['angus', 'flynn', 'leo'], foes: ['trigg', 'alfred', 'ethan', 'ben', 'kingsley'], power: 1 } }));
      await s.eval('showCustom(); true');
      await s.click('#cgo');
      await sleep(300);
      await s.click('#bAuto');
      const ct = Date.now();
      const cDone = await s.waitFor('.res', LONG_MS);
      R.ok('custom battle, 3 heroes vs 5 heroes', cDone, `${cDone ? (await s.text('.res h2')).trim() : 'TIMEOUT'}, ${since(ct)}`);

      // Four Gauntlet waves in a row, taking a boon each time, so carry-over is covered.
      await s.setSave(fastSave({ team: ['trigg', 'vasco', 'aamay'], stars }));
      await s.eval(`showTeam({ mode: 'gauntlet' }); true`);
      await s.click('#fight');
      await sleep(300);
      await s.click('#bAuto');
      let waves = 0;
      while (waves < 4) {
        if (!await s.waitFor('.res', STAGE_MS)) break;
        if (!await s.exists('.boon')) break;
        await s.click('.boon');
        waves++;
        await sleep(500);
      }
      R.ok('gauntlet clears 4 waves with boons', waves === 4, `${waves} waves`);
    }
  } catch (e) {
    R.ok('ran without throwing', false, e.message);
  } finally {
    const ok = R.report(s.errors);
    await s.close();
    host.close();
    process.exit(ok ? 0 : 1);
  }
})();
