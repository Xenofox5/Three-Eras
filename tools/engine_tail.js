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
  let r = resolveHit(foe, ally, 1.0, { sure: true });            // a direct single-target hit, as Crush does
  ok('direct resolveHit is redirected to David', r.target === david && took(david) > d0 && took(ally) === a0,
     `David +${took(david) - d0}, ally +${took(ally) - a0}`);

  d0 = took(david); a0 = took(ally);
  r = resolveHit(foe, ally, 1.0, { aoe: true, sure: true });   // sure, so a 5% miss cannot flake the test     // area hits must still ignore Guard
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

  // ---- 4. Last Stand is gone ----
  setupBattle({ team: ["david", "flynn", "leo"], enemies: [{ id: "brute" }] });
  B.players[1].hp = 0; B.players[2].hp = 0;
  await processDeaths();
  ok("no Last Stand when alone", !has(B.players[0], "laststand") && !STATUS.laststand);

  // ---- 5. Aamay is hidden only by a living hero, and never from a boss ----
  setupBattle({ team: ["aamay", "trigg", "flynn"], enemies: [{ id: "brute" }, { id: "wyvern", boss: true }] });
  const ser = B.players[0], trig = B.players[1], fly = B.players[2];
  const brute2 = B.enemies[0], boss2 = B.enemies[1];
  ok("hidden from an ordinary enemy while heroes stand", !seenOnly(foesOf(brute2), brute2).includes(ser));
  ok("a boss sees her anyway", seenOnly(foesOf(boss2), boss2).includes(ser));
  await KIT.trigg.skill(trig);
  trig.hp = 0; fly.hp = 0;
  await processDeaths();
  ok("a summoned creature is not cover", seenOnly(foesOf(brute2), brute2).includes(ser),
     `units left on her side: ${sideList(ser).filter(isUp).length}`);

  // ---- 6. David is paid for intercepting ----
  setupBattle({ team: ["david", "flynn", "leo"], enemies: [{ id: "harry", hero: true }] });
  const dv = B.players[0], ally2 = B.players[1], foe2 = B.enemies[0];
  await KIT.david.skill(dv, ally2);
  dv.hp = Math.round(dv.maxHp * 0.5);
  const hpBefore = dv.hp;
  resolveHit(foe2, ally2, 0.01, { sure: true, noCrit: true });
  ok("intercepting heals David", dv.hp > hpBefore, `hp ${hpBefore} -> ${dv.hp}`);

  // ---- 7. Aamay only records what the enemy does ----
  setupBattle({ team: ["aamay", "yunze", "flynn"], enemies: [{ id: "brute" }] });
  const am = B.players[0], yz = B.players[1], br = B.enemies[0];
  const pages = () => { const st = getSt(am, "pages"); return st ? st.stacks : 0; };
  await heroAct(yz, { kind: "basic", target: br });
  ok("an ally acting writes nothing", pages() === 0, `pages ${pages()}`);
  bumpPages(br);
  ok("an enemy acting writes a Page", pages() === 1, `pages ${pages()}`);

  // The cap rises as heroes fall, on either side.
  const capBefore = pageCap(am);
  B.players[2].hp = 0;
  await processDeaths();
  ok("a fallen hero raises the Chronicle cap", pageCap(am) === capBefore + 2, `${capBefore} -> ${pageCap(am)}`);

  // Seraphine steps out of sight on a fixed cycle, which the player can count.
  setupBattle({ team: ["seraphine", "angus", "flynn"], enemies: [{ id: "brute" }] });
  const am2 = B.players[0], br2 = B.enemies[0];
  const seen = [];
  for (let turn = 1; turn <= 6; turn++) { await turnStart(am2); seen.push(has(am2, "hidden") ? "hidden" : "open"); turnEnd(am2); }
  ok("out of sight on every third turn", seen.join(",") === "open,open,hidden,open,open,hidden", seen.join(","));

  await turnStart(am2); await turnStart(am2); await turnStart(am2);
  ok("enemies cannot aim at him while hidden", has(am2, "hidden") && !seenOnly(foesOf(br2), br2).includes(am2));
  removeStatus(am2, "hidden");
  ok("and can again once it lapses", seenOnly(foesOf(br2), br2).includes(am2));
  // ---- 8. Elphi rises once ----
  setupBattle({ team: ["elphi", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const el = B.players[0];
  const fullHp = el.maxHp, atkBefore = stat(el, "atk");
  el.hp = 0;
  await processDeaths();
  ok("he does not stay down", el.alive && el.hp > 0, `hp ${el.hp}`);
  ok("he comes back smaller", el.maxHp === Math.round(fullHp * 0.3), `${fullHp} -> ${el.maxHp}`);
  ok("and angrier", has(el, "determined") && stat(el, "atk") > atkBefore,
     `atk ${Math.round(atkBefore)} -> ${Math.round(stat(el, "atk"))}`);
  el.hp = 0;
  await processDeaths();
  ok("only once per battle", !el.alive);

  // ---- 9. Vasco changes face because he chooses to ----
  setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }] });
  const vs = B.players[0];
  ok("starts as the jester", !has(vs, "vessel") && abil(vs, "basic").name === "Prank");
  await KIT.vasco.ult(vs);
  ok("the ultimate hands it over", has(vs, "vessel") && abil(vs, "basic").name === "Hellmark");
  ok("and he acts again at once", vs.flags.advance === 1, `advance ${vs.flags.advance}`);
  await KIT.vasco.ult(vs);
  ok("and hands it back again", !has(vs, "vessel") && abil(vs, "basic").name === "Prank");

  // Losing health no longer changes anything on its own.
  vs.hp = Math.round(vs.maxHp * 0.1);
  applyDamage(vs, 1, { src: B.enemies[0] });
  await turnStart(vs);
  ok("being hurt does not change his face", !has(vs, "vessel"), `hp ${Math.round(hpPct(vs) * 100)}%`);

  // The jester funds the team, the Vessel does not.
  setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }] });
  const v2 = B.players[0];
  B.sp = 0;
  await heroAct(v2, { kind: "basic", target: B.enemies[0] });
  ok("the jester earns the team a Skill Point", B.sp === 1, `sp ${B.sp}`);
  await KIT.vasco.ult(v2);
  B.sp = 0;
  await heroAct(v2, { kind: "basic", target: B.enemies[0] });
  ok("the Vessel earns none", B.sp === 0, `sp ${B.sp}`);

  // A rework has to leave the team bonuses that mention the hero still meaning something.
  setupBattle({ team: ["vasco", "peguicha", "flynn"], enemies: [{ id: "brute" }] });
  ok("the Peguicha pairing starts him unmasked", has(B.players[0], "vessel"));
  setupBattle({ team: ["vasco", "kingsley", "flynn"], enemies: [{ id: "brute" }] });
  ok("the Kingsley pairing still sharpens him", stat(B.players[0], "crit") > HEROES.vasco.stats.crit,
     `crit ${stat(B.players[0], "crit").toFixed(2)}`);
  setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }] });
  ok("and he starts masked without either", !has(B.players[0], "vessel"));

  // ---- 10. Wild Card always helps, whichever card turns over ----
  const suits = new Set();
  let dud = -1;
  for (let i = 0; i < 200; i++) {
    setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }] });
    const vc = B.players[0];
    B.players.forEach(x => { x.hp = Math.round(x.maxHp * 0.6); });
    const sp0 = B.sp, hp0 = B.players.map(x => x.hp), sh0 = B.players.map(x => x.shield);
    await KIT.vasco.skill(vc, vc);
    const healed = B.players.some((x, k) => x.hp > hp0[k]);
    const shielded = B.players.some((x, k) => x.shield > sh0[k]);
    const sharpened = B.players.some(x => has(x, "atkUp"));
    const paid = B.sp > sp0;
    if (healed) suits.add("hearts");
    if (sharpened) suits.add("spades");
    if (shielded) suits.add("clubs");
    if (paid) suits.add("diamonds");
    if (!(healed || shielded || sharpened || paid) && dud < 0) dud = i;
  }
  ok("every card helps somebody", dud < 0, dud < 0 ? "200 draws" : `draw ${dud} did nothing`);
  ok("all four suits come up", suits.size === 4, [...suits].sort().join(","));

  // It supports the team rather than attacking, so it should never touch an enemy.
  setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }, { id: "bandit" }] });
  const vc2 = B.players[0];
  const foeHp = B.enemies.map(e => e.hp);
  await KIT.vasco.skill(vc2, vc2);
  ok("it never touches the enemy", B.enemies.every((e, k) => e.hp === foeHp[k]));
  // ---- 11. Skills that cost two Skill Points ----
  setupBattle({ team: ["harry", "angus", "flynn"], enemies: [{ id: "brute" }] });
  const hh = B.players[0];
  ok("Crush is priced at two", skillCost(hh) === 2, `cost ${skillCost(hh)}`);
  B.sp = 1;
  ok("one point is not enough", !canUse(hh, "skill"));
  B.sp = 2;
  ok("two points is", canUse(hh, "skill"));
  await heroAct(hh, { kind: "skill", target: B.enemies[0] });
  ok("and using it spends both", B.sp === 0, `sp left ${B.sp}`);

  // A basic pays one back, unless the hero is one that does not fund the team.
  setupBattle({ team: ["vasco", "angus", "flynn"], enemies: [{ id: "brute" }] });
  const vv = B.players[0];
  ok("the jester funds the team", basicPays(vv));
  await KIT.vasco.ult(vv);
  ok("the Vessel does not", !basicPays(vv));

  // Nothing should be free by accident: every hero skill has a price the engine agrees with.
  setupBattle({ team: ["vasco", "seraphine", "flynn"], enemies: [{ id: "brute" }] });
  ok("Wild Card is priced at two", skillCost(B.players[0]) === 2, `cost ${skillCost(B.players[0])}`);
  const twos = HERO_ORDER.filter(id => (HEROES[id].skill.cost || 1) === 2);
  ok("only a few skills cost two", twos.length === 2, twos.join(","));

console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
