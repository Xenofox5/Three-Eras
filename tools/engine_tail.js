/* Engine tests. Run with: npm run test:engine
 * Concatenated after data.js and engine.js by tools/engine_tests.sh, because data.js is too
 * big to pass to node -e. No browser and no dependencies: this is the headless engine only.
 */
HOOK.headless = true;
let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  (' + detail + ')' : ''}`); };
// Flynn and Leo in place of Angus: the Angus + David pair grants a starting shield that would
// soak the test hits and hide where the damage landed.
const guardSetup = () => {
  setupBattle({ team: ['david', 'flynn', 'leo'], enemies: [{ id: 'harry', hero: true }] });
  return { david: B.players[0], ally: B.players[1], foe: B.enemies[0] };
};
const took = u => B.st[u.uid].taken;

(async () => {
  // ---- 1. David's Guard now covers skills that call resolveHit directly ----
  let { david, ally, foe } = guardSetup();
  await KIT.david.skill(david, ally);
  ok('David guarding an ally', has(ally, 'guarded') && has(david, 'guarding'));

  let d0 = took(david), a0 = took(ally);
  let r = resolveHit(foe, ally, 1.0, {});            // a direct single-target hit, as Crush does
  ok('direct resolveHit is redirected to David', r.target === david && took(david) > d0 && took(ally) === a0,
     `David +${took(david) - d0}, ally +${took(ally) - a0}`);

  d0 = took(david); a0 = took(ally);
  r = resolveHit(foe, ally, 1.0, { aoe: true });     // area hits must still ignore Guard
  ok('area hits still ignore Guard', r.target === ally && took(ally) > a0 && took(david) === d0,
     `David +${took(david) - d0}, ally +${took(ally) - a0}`);

  d0 = took(david); a0 = took(ally);
  r = await strike(foe, ally, 1.0, { sure: true });  // the strike() path must still work
  ok('strike() path still redirects', r.target === david && took(david) > d0 && took(ally) === a0);

  // Harry's Crush is the headline case: pierce 1, sure, straight to resolveHit.
  ({ david, ally, foe } = guardSetup());
  await KIT.david.skill(david, ally);
  d0 = took(david); a0 = took(ally);
  await KIT.harry.skill(foe, ally);
  ok('Harry\'s Crush respects Guard', took(david) > d0 && took(ally) === a0,
     `David +${took(david) - d0}, ally +${took(ally) - a0}`);

  // Alfred's Finger Frame was another direct caller.
  ({ david, ally, foe } = guardSetup());
  setupBattle({ team: ['david', 'flynn', 'leo'], enemies: [{ id: 'alfred', hero: true }] });
  david = B.players[0]; ally = B.players[1]; const alf = B.enemies[0];
  await KIT.david.skill(david, ally);
  d0 = took(david); a0 = took(ally);
  await KIT.alfred.skill(alf, ally);
  ok('Alfred\'s Finger Frame respects Guard', took(david) > d0 && took(ally) === a0,
     `David +${took(david) - d0}, ally +${took(ally) - a0}`);

  // ---- 2. Creature work is credited to its summoner ----
  setupBattle({ team: ['trigg', 'angus', 'flynn'], enemies: [{ id: 'brute' }] });
  const trigg = B.players[0], brute = B.enemies[0];
  await KIT.trigg.skill(trigg);
  const imp = B.players.find(p => p.creature);
  ok('Trigg summoned a creature', !!imp, imp && imp.name);
  const before = B.st[trigg.uid].taken;
  applyDamage(imp, 200, { src: brute });
  ok('creature damage is not yet on Trigg', B.st[trigg.uid].taken === before);
  imp.hp = 0;
  await processDeaths();
  ok('creature taken is credited on death', B.st[trigg.uid].taken > before,
     `Trigg taken ${before} -> ${B.st[trigg.uid].taken}`);
  const after = B.st[trigg.uid].taken;
  creditCreature(imp);
  ok('crediting twice does nothing', B.st[trigg.uid].taken === after);

  // Survivors are credited when the battle ends, not only when they die.
  setupBattle({ team: ['trigg', 'angus', 'flynn'], enemies: [{ id: 'bandit' }] });
  const t2 = B.players[0];
  await KIT.trigg.skill(t2);
  const imp2 = B.players.find(p => p.creature);
  applyDamage(imp2, 150, { src: B.enemies[0] });
  B.enemies[0].hp = 0;
  const b2 = B.st[t2.uid].taken;
  await runBattle();
  ok('a surviving creature is credited at the end', B.st[t2.uid].taken > b2,
     `Trigg taken ${b2} -> ${B.st[t2.uid].taken}`);

  // ---- 3. Vasco copies what actually happened ----
  setupBattle({ team: ['vasco', 'angus', 'flynn'], enemies: [{ id: 'leo', hero: true }] });
  const vasco = B.players[0], leo = B.enemies[0];
  await heroAct(leo, { kind: 'basic', target: vasco });   // Flame Bolt: 100% ATK and Burn
  const lh = B.lastHit && B.lastHit.player;
  ok('an enemy hero action is recorded', !!lh, lh && lh.name + ' x' + lh.mult);
  ok('the recorded multiplier is the real one', lh && lh.mult === 1, lh && lh.mult);
  ok('the recorded move carries its status', !!(lh && lh.status && lh.status.key === 'burn'),
     lh && lh.status && lh.status.key);
  const hadBurn = has(leo, 'burn');
  await KIT.vasco.skill(vasco, leo);
  ok('Mimic applies the copied status', !hadBurn && has(leo, 'burn'));

  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
