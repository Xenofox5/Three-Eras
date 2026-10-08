/* Visual check for the things a number cannot verify: that a badge or an animation actually
 * reaches the screen and says what it is meant to say. Run with: npm run check:visual
 *
 * It fights on auto with the heroes under test and screenshots the battle, then asserts on the
 * rendered DOM rather than on the engine, because the engine is already covered by test:engine.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { launch, hostGame, results, sleep } = require('./cdp');

const OUT = path.join(__dirname, '..', 'sim-results', 'visual');
const fastSave = extra => Object.assign({ speed: 8, sound: false, motion: 'full' }, extra);
const starsFor = ids => Object.fromEntries(ids.map(id => [id, 1]));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const host = await hostGame();
  const s = await launch();
  const R = results();
  try {
    await s.goto(host.url);
    const stars = starsFor(await s.eval('STAGES.map(x => x.id)'));

    // Malakai's next phial, Kingsley's trinket and Alfred's tempo all live on the battle screen.
    await s.setSave(fastSave({ team: ['malakai', 'kingsley', 'alfred'], stars }));
    await s.eval("showTeam({ mode: 'campaign', idx: 0 }); true");
    await s.click('#fight');
    await s.waitForExpr('typeof B === "object" && B && B.players && B.players.length === 3', 10000);

    const badge = await s.eval(`(() => {
      const u = B.players.find(p => p.id === 'malakai');
      const st = u && u.statuses.find(x => x.key === 'mixture');
      return st ? { has: true, label: statusLabel('mixture', 0, st), icon: MIXTURE[st.value].icon } : { has: false };
    })()`);
    R.ok('Malakai carries a Mixture badge from the first turn', badge.has === true);
    R.check('and it names the phial that is next', badge.label, '🧪 Next: Venom');

    /* The badge has to be drawn on the card, not merely sitting on the unit. The battle screen
       only paints badges on an update tick, so give it one and then wait for the icon. */
    await s.eval('HOOK.update(); true');
    const drawnOK = await s.waitForExpr(`(() => {
      const u = B.players.find(p => p.id === 'malakai');
      const card = UI.cards[u.uid];
      if (!card) return false;  // the timeline chip shares data-uid, so go through UI.cards
      return [...card.querySelectorAll('.sb')].some(e => e.textContent.includes(MIXTURE[0].icon));
    })()`, 8000);
    R.ok('the phial icon is drawn on his card', drawnOK);

    await s.click('#bAuto');

    /* Kingsley pulls a trinket at some point on auto. The animation builds a floating element
       with the item's face, so catching any of the five proves the player can see which it was. */
    const seen = await s.eval(`(async () => {
      const faces = ['🏮', '🪞', '🔔', '🎆', '🎲'];
      window.__sawTrinket = null;
      const t0 = Date.now();
      while (Date.now() - t0 < 60000) {
        const el = document.querySelector('.te-trinket');
        if (el) { const t = (el.textContent || '').trim(); if (faces.includes(t)) { window.__sawTrinket = t; return t; } }
        if (document.querySelector('.res')) break;
        await new Promise(r => setTimeout(r, 40));
      }
      return window.__sawTrinket;
    })()`);
    R.ok('a trinket shows its own face on screen', seen !== null && seen !== undefined, String(seen));

    await s.screenshot(path.join(OUT, 'battle.png'));
    R.ok('a battle screenshot was written', fs.existsSync(path.join(OUT, 'battle.png')));

    /* The Skill Point labels on the info sheet. They went missing once when the sheet grew its
       two-faces view, and nothing noticed, so they are asserted on the rendered panel. */
    const sheet = await s.eval(`(() => {
      const u = B.players.find(p => p.id === 'malakai');
      unitSheet(u);
      const t = (document.querySelector('.sheet') || document.querySelector('.modal') || document.body).innerText;
      return t;
    })()`);
    R.ok('the info sheet says what a basic pays in', /Basic, \+1 SP/.test(sheet));
    R.ok('and what the skill costs', /Skill, 1 SP/.test(sheet), (sheet.match(/Skill, \d SP/) || ['none'])[0]);

    // Vasco is the hard case: two faces, one of which earns nothing, and a skill that costs two.
    await s.eval("closeSheet && closeSheet(); true").catch(() => {});
    await s.setSave(fastSave({ team: ['vasco', 'flynn', 'leo'], stars }));
    await s.eval("showTeam({ mode: 'campaign', idx: 0 }); true");
    await s.click('#fight');
    await s.waitForExpr('typeof B === "object" && B && B.players && B.players.length === 3', 10000);
    const vsheet = await s.eval(`(() => {
      const u = B.players.find(p => p.id === 'vasco');
      unitSheet(u);
      return (document.querySelector('.sheet') || document.querySelector('.modal') || document.body).innerText;
    })()`);
    R.ok('Wild Card is priced at two on the sheet', /Skill, 2 SP/.test(vsheet));
    R.ok('the jester basic still pays a point', /Basic, \+1 SP/.test(vsheet));
    R.ok('and the Vessel basic says it pays nothing', /Basic, no SP/.test(vsheet));

    /* Soham holds two kinds of shield at once and they sit side by side on the same bar, so the
       two segments have to be different colours or the player cannot tell where one ends. */
    await s.eval('closeSheet(); true');
    await s.setSave(fastSave({ team: ['soham', 'flynn', 'leo'], stars }));
    await s.eval("showTeam({ mode: 'campaign', idx: 0 }); true");
    await s.click('#fight');
    await s.waitForExpr('typeof B === "object" && B && B.players && B.players.length === 3', 10000);
    const bars = await s.eval(`(() => {
      const u = B.players.find(p => p.id === 'soham');
      /* Both at once. The hexshield is a slice of the same shield pool, so it has to go on
         through giveHex or the bar has nothing to split. */
      u.shield = 0; removeStatus(u, 'hexshield');
      addShield(u, u, u.maxHp * 0.15);
      giveHex(u, u, u.maxHp * 0.15, 3);
      HOOK.update();
      const card = UI.cards[u.uid];
      const seg = k => { const e = card.querySelector('.hp .' + k); if (!e) return null;
        const c = getComputedStyle(e);
        return { shown: c.display !== 'none', bg: c.backgroundImage, left: e.style.left, width: e.style.width }; };
      return { s: seg('s'), hx: seg('hx') };
    })()`);
    R.ok('the ordinary Shield segment is drawn', !!(bars.s && bars.s.shown));
    R.ok('and so is his hexshield, beside it', !!(bars.hx && bars.hx.shown), `${bars.s && bars.s.left} + ${bars.s && bars.s.width} then ${bars.hx && bars.hx.left}`);
    R.ok('they are not the same colour', !!(bars.s && bars.hx && bars.s.bg !== bars.hx.bg));
    R.ok('the ordinary one stays blue', /143, 208, 255|8fd0ff/.test((bars.s || {}).bg || ''), ((bars.s || {}).bg || '').slice(0, 60));
    R.ok('and his own is the yellow one', /255, 243, 160|fff3a0/.test((bars.hx || {}).bg || ''), ((bars.hx || {}).bg || '').slice(0, 60));

    /* Seraphine lays Severance marks and moves an ally with the Hidden Hand, and both used to
       happen with nothing on screen. Count the elements each effect puts in the overlay. */
    await s.setSave(fastSave({ team: ['seraphine', 'chosen', 'flynn'], stars }));
    await s.eval("showTeam({ mode: 'campaign', idx: 0 }); true");
    await s.click('#fight');
    await s.waitForExpr('typeof B === "object" && B && B.players && B.players.length === 3', 10000);
    const fx = await s.eval(`(async () => {
      const u = B.players.find(p => p.id === 'seraphine');
      const chosen = B.players.find(p => p.id === 'chosen');
      const foe = B.enemies.find(e => e.alive);
      /* At this speed the whole effect is over inside a frame or two, so count the nodes it
         adds to the overlay rather than sampling how many are present at one moment. */
      const watch = async fn => {
        let n = 0;
        const mo = new MutationObserver(ms => ms.forEach(m => { n += m.addedNodes.length; }));
        mo.observe(UI.fx, { childList: true });
        await fn();
        await new Promise(r => setTimeout(r, 150));
        mo.disconnect();
        return n;
      };
      const duringMark = await watch(() => FX.severmark({ src: u, tgt: foe, n: 2 }));
      const duringHand = await watch(() => FX.hiddenhand({ src: u, tgt: chosen }));
      return { before: 0, duringMark, duringHand };
    })()`);
    R.ok('laying a Severance mark draws something', fx.duringMark > fx.before, `${fx.duringMark} elements drawn`);
    R.ok('the Hidden Hand draws its strings', fx.duringHand > fx.before, `${fx.duringHand} elements drawn`);

    // And the mark itself now announces the count instead of landing silently.
    const marked = await s.eval(`(() => {
      const u = B.players.find(p => p.id === 'seraphine');
      const foe = B.enemies.find(e => e.alive);
      removeStatus(foe, 'sever');
      addStatus(foe, 'sever', 99, { stacks: 2, src: u });
      const st = foe.statuses.find(x => x.key === 'sever');
      return st ? st.stacks : 0;
    })()`);
    R.check('two marks land as two', marked, 2);

    /* Isaac being invisible has to be the first thing you notice about his card, not a badge
       among five others, so the card itself fades and takes a dashed outline. */
    await s.setSave(fastSave({ team: ['isaac', 'ephraim', 'hbenjamin'], stars }));
    await s.eval("showTeam({ mode: 'campaign', idx: 0 }); true");
    await s.click('#fight');
    await s.waitForExpr('typeof B === "object" && B && B.players && B.players.length === 3', 10000);
    const inv = await s.eval(`(() => {
      const is = B.players.find(p => p.id === 'isaac');
      HOOK.update();
      const card = UI.cards[is.uid];
      const faded = getComputedStyle(card.querySelector('.pi')).opacity;
      const onCard = card.classList.contains('invis');
      removeStatus(is, 'invisible'); HOOK.update();
      const seen = getComputedStyle(card.querySelector('.pi')).opacity;
      return { onCard, faded: Number(faded), seen: Number(seen) };
    })()`);
    R.ok('an invisible hero is marked on his card', inv.onCard === true);
    R.ok('and his portrait fades out', inv.faded < inv.seen - 0.3, `${inv.faded} invisible against ${inv.seen} seen`);

    /* H. Benjamin is the anti-healer, and the thing that broke him was that every healer in the
       game cleanses before it heals, so the mark came straight back off. */
    const wither = await s.eval(`(() => {
      const hb = B.players.find(p => p.id === 'hbenjamin');
      const foe = B.enemies.find(e => e.alive);
      addStatus(foe, 'withered', 3, { src: hb });
      cleanse(foe);
      const after = foe.statuses.some(x => x.key === 'withered');
      foe.hp = Math.round(foe.maxHp * 0.5);
      const before = foe.hp;
      heal(hb, foe, 1000);
      return { survivesCleanse: after, healed: foe.hp - before };
    })()`);
    R.ok('a cleanse does not lift Withered', wither.survivesCleanse === true);
    R.check('and nothing mends a Withered enemy', wither.healed, 0);

    /* Twenty-seven heroes in a phone-width column is five across on a desktop window with nine
       hundred pixels going spare, and nothing in a menu should scroll sideways at any size. */
    for (const [w, h, least] of [[1440, 900, 7], [1024, 800, 5], [390, 844, 3]]) {
      await s.viewport(w, h);
      await s.eval('showHeroes(); true');
      await new Promise(r => setTimeout(r, 250));
      const grid = await s.eval(`(() => {
        const r = document.querySelector('.roster');
        const cols = getComputedStyle(r).gridTemplateColumns.split(' ').length;
        const d = document.documentElement;
        return { cols, sideways: d.scrollWidth > d.clientWidth + 1 };
      })()`);
      R.ok(`the hero grid fits ${least}+ across at ${w}px`, grid.cols >= least, `${grid.cols} columns`);
      R.ok(`and nothing scrolls sideways at ${w}px`, grid.sideways === false);
    }
    await s.viewport(430, 900);
  } finally {
    await s.close();
    host.close();
  }
  const ok = R.report(s.errors);
  process.exit(ok ? 0 : 1);
})();
