/* Engine tests. Run with: npm run test:engine
 * Concatenated after data.js and engine.js by tools/engine_tests.sh, because data.js is too
 * big to pass to node -e. No browser and no dependencies: this is the headless engine only.
 */
HOOK.headless = true;
const nlOf = t => (t.includes("\r\n") ? "\r\n" : "\n");
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

  // ---- Malakai mixes in a fixed order, and every third flask is on the house ----
  setupBattle({ team: ["malakai", "flynn", "leo"], enemies: [{ id: "brute" }, { id: "brute" }] });
  const mk = B.players[0], e1 = B.enemies[0], e2 = B.enemies[1];
  mk.mods.acc = 5;  // A missed flask applies no phial, which is correct but not the thing under test.
  ok("he starts on Venom", mixOf(mk).name === "Venom", mixOf(mk).name);
  await KIT.malakai.basic(mk, e1);
  ok("the first flask Poisons", has(e1, "poison"));
  ok("then Sedative is next", mixOf(mk).name === "Sedative", mixOf(mk).name);
  await KIT.malakai.basic(mk, e1);
  ok("the second lowers ATK", has(e1, "atkDown"));
  ok("then Solvent is next", mixOf(mk).name === "Solvent", mixOf(mk).name);
  const spBefore = B.sp, e2Before = e2.hp;
  await KIT.malakai.basic(mk, e1);
  ok("the third splashes the other enemy", e2.hp < e2Before && has(e2, "defDown"));
  ok("and pays the team a point", B.sp === spBefore + 1, `${spBefore} to ${B.sp}`);
  ok("then the order comes round again", mixOf(mk).name === "Venom", mixOf(mk).name);

  // The bargain sells on whatever ails the ally, so it never does the same thing twice.
  setupBattle({ team: ["malakai", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const ma = B.players[0], mate = B.players[1], buyer = B.enemies[0];
  addStatus(mate, "poison", 2, { dot: 40 }); addStatus(mate, "defDown", 2, { value: 0.2 });
  addStatus(mate, "taunt", 2);
  await KIT.malakai.skill(ma, mate);
  ok("the ally is clean afterwards", !has(mate, "poison") && !has(mate, "defDown"));
  ok("the buyer takes both debuffs", has(buyer, "poison") && has(buyer, "defDown"));
  ok("a Taunt is not a debuff to sell", has(mate, "taunt") && !has(buyer, "taunt"));
  ok("the ally still gets the deal", has(mate, "atkUp") && has(mate, "spdUp"));
  setupBattle({ team: ["malakai", "flynn", "leo"], enemies: [{ id: "brute" }] });
  await KIT.malakai.skill(B.players[0], B.players[1]);
  ok("with nothing to sell the buyer is Poisoned anyway", has(B.enemies[0], "poison"));

  // ---- Angus cannot stand in Unbreakable forever ----
  setupBattle({ team: ["angus", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const an = B.players[0];
  await KIT.angus.ult(an);
  ok("Unbreakable holds him up", has(an, "undying"));
  ok("and leaves him Spent", has(an, "spent"));
  an.ult = 0; gainUlt(an, 60);
  ok("Spent means no charge at all", an.ult === 0, `ult ${an.ult}`);
  removeStatus(an, "spent"); gainUlt(an, 60);
  ok("and he charges again once it passes", an.ult > 0, `ult ${an.ult}`);

  // ---- Alfred: each tempo does its own thing, at the numbers the text prints ----
  setupBattle({ team: ["alfred", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const al2 = B.players[0];
  removeStatus(al2, "tempo"); addStatus(al2, "tempo", 99, { value: "andante", silent: true });
  ok("Andante cannot miss", tempoOpts(al2).sure === true);
  ok("Andante hits at full strength", tempoMult(al2) === 1, tempoMult(al2));
  removeStatus(al2, "tempo"); addStatus(al2, "tempo", 99, { value: "grave", silent: true });
  ok("Grave cuts through armour", tempoOpts(al2).pierce === 0.3);
  ok("Grave hits for the 130% the text says", tempoMult(al2) === 1.3, tempoMult(al2));
  removeStatus(al2, "tempo"); addStatus(al2, "tempo", 99, { value: "allegro", silent: true });
  ok("Allegro has neither, it buys time instead", !tempoOpts(al2).sure && !tempoOpts(al2).pierce);
  ok("Allegro hits for the 80% the text says", Math.abs(tempoMult(al2) - 0.8) < 1e-9, tempoMult(al2));

  // ---- Kingsley has a fifth item in the bag ----
  setupBattle({ team: ["kingsley", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const kg = B.players[0];
  const pulls = new Set();
  let dice = 0;
  for (let i = 0; i < 400; i++) { B.sp = 0; await KIT.kingsley.skill(kg); if (B.sp > 0) dice++; kg.statuses = kg.statuses.filter(x => x.key !== "critUp"); }
  // One item in five, so 400 pulls should turn up the dice somewhere near eighty times.
  ok("Loaded Dice comes up about one pull in five", dice > 40 && dice < 130, `${dice} of 400`);
  const named = HEROES.kingsley.skill.desc;
  ["Lantern", "Mirror Charm", "Bell", "Spark Box", "Loaded Dice"].forEach(n => pulls.add(named.includes(n)));
  ok("and all five are named in the description", !pulls.has(false));

  // ---- H. Benjamin: frail standing up, hard to finish off once he is down ----
  setupBattle({ team: ["hbenjamin", "flynn", "leo"], enemies: [{ id: "brute" }, { id: "brute" }] });
  const hb = B.players[0], hbFoe = B.enemies[0];
  hb.mods.acc = 5;  // A missed flask Withers nothing, which is correct but not the thing under test.
  await KIT.hbenjamin.basic(hb, hbFoe);
  ok("Grave Whisper Withers", has(hbFoe, "withered"));
  const hbHp = hbFoe.hp;
  heal(hb, hbFoe, 500);
  ok("a Withered enemy cannot be mended at all", hbFoe.hp === hbHp, `${hbHp} to ${hbFoe.hp}`);
  // Marking something new feeds him, which is the whole of what the skulls do.
  setupBattle({ team: ["hbenjamin", "flynn", "leo"], enemies: [{ id: "brute" }, { id: "brute" }] });
  const fb = B.players[0], fresh = B.enemies[1];
  fb.mods.acc = 5;
  fb.hp = Math.round(fb.maxHp * 0.5);
  await KIT.hbenjamin.basic(fb, fresh);
  ok("marking something new hands him a Skull", (getSt(fb, "skulls") || {}).stacks === 1, (getSt(fb, "skulls") || {}).stacks);
  await KIT.hbenjamin.basic(fb, fresh);
  ok("but marking the same one again does not", (getSt(fb, "skulls") || {}).stacks === 1, (getSt(fb, "skulls") || {}).stacks);
  // Anything that dies anywhere belongs to him, which is the necromancy doing something.
  B.enemies[0].flags.lastHitBy = fb; B.enemies[0].hp = 0;
  await processDeaths();
  ok("and so does anything that falls", (getSt(fb, "skulls") || {}).stacks === 2, (getSt(fb, "skulls") || {}).stacks);
  // What he is carrying mends him every turn, which is the whole of his sustain.
  const carried = fb.hp;
  turnStart(fb);
  ok("the Skulls mend him on his turn", fb.hp > carried, `${carried} to ${fb.hp}`);

  // A blow that never lands must not mark anything or feed him: the drain was guarded, the mark was not.
  setupBattle({ team: ["hbenjamin", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const mb = B.players[0], mf = B.enemies[0];
  addStatus(mf, 'afterimage', 2);  // a guaranteed dodge, so this never comes down to a roll
  B.sp = 5;
  const mbHp = mb.hp;
  await KIT.hbenjamin.skill(mb, mf);
  ok("a dodged Marrow Draw Withers nothing", !has(mf, "withered"));
  ok("and feeds him nothing", !getSt(mb, "skulls") && mb.hp === mbHp, `hp ${mbHp} to ${mb.hp}`);
  // The mark has to survive a cleanse, or every healer in the game simply undoes it first.
  cleanse(hbFoe);
  ok("and no cleanse takes the mark off", has(hbFoe, "withered"));
  heal(hb, hbFoe, 500);
  ok("so it still cannot be mended after a cleanse", hbFoe.hp === hbHp, `${hbHp} to ${hbFoe.hp}`);

  // The first fall is not one: he comes apart and the pieces keep going.
  const unitsBefore = sideList(hb).length;
  hb.hp = 40;
  applyDamage(hb, 9999, { src: hbFoe });
  ok("the first killing blow does not kill him", isUp(hb) && hb.hp > 1, `hp ${hb.hp}`);
  ok("he comes apart instead", has(hb, "corpse"));
  // The Skulls are his, not extra cards in the team row.
  ok("and nothing else joins the board", sideList(hb).length === unitsBefore, `${unitsBefore} to ${sideList(hb).length}`);
  ok("the Corpse uses his other three moves", abil(hb, "basic").name === "Gnaw", abil(hb, "basic").name);
  ok("and it wears a different face", lookOf(hb).collapsed === true);
  // Hard to finish off: the same blow lands for far less while he is down.
  const asCorpse = takenMult(hb, hbFoe);
  removeStatus(hb, "corpse");
  const standing = takenMult(hb, hbFoe);
  addStatus(hb, "corpse", 99, { silent: true });
  ok("a Corpse takes 65% less", Math.abs(asCorpse / standing - 0.35) < 0.01, (asCorpse / standing).toFixed(3));

  // Mended far enough, he stands up and the Skulls go with him.
  hb.hp = Math.round(hb.maxHp * 0.45);
  turnStart(hb);
  ok("mended past 40% he gets back up", !has(hb, "corpse"), `hp ${Math.round(hb.hp / hb.maxHp * 100)}%`);
  ok("and still nothing else is on the board", sideList(hb).length === unitsBefore);
  // He only had the one bargain.
  hb.hp = 40;
  applyDamage(hb, 9999, { src: hbFoe });
  ok("the second fall is a real one", hb.hp === 0 && !has(hb, "corpse"));

  // The ultimate is a debuff, not a thing he can cycle at 1 HP.
  setupBattle({ team: ["hbenjamin", "flynn", "leo"], enemies: [{ id: "brute" }, { id: "brute" }] });
  const hb2 = B.players[0];
  await KIT.hbenjamin.ult(hb2);
  ok("The Long Rot rots the whole room", B.enemies.every(e => has(e, "withered") && has(e, "atkDown") && has(e, "defDown")));
  ok("and hands out no immortality at all", !B.players.some(a => has(a, "undying")));

  // ---- Ephraim: everything he does reads off his own health bar ----
  setupBattle({ team: ["ephraim", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const ep = B.players[0];
  const calm = stat(ep, "atk");
  ok("at full health he is just a brawler", !has(ep, "riled") && !has(ep, "rabid"));
  ok("and anything can stun him", addStatus(ep, "stun", 1));
  removeStatus(ep, "stun");
  // Under half he is Riled, and the badge arrives the moment the bar crosses.
  ep.hp = Math.round(ep.maxHp * 0.6); rageCheck(ep);
  ok("under 65% health he is Riled", has(ep, "riled") && !has(ep, "rabid"));
  ok("Riled is 22% more ATK", Math.abs(stat(ep, "atk") / calm - 1.22) < 0.02, (stat(ep, "atk") / calm).toFixed(3));
  ok("and nothing stuns him while he is", !addStatus(ep, "stun", 1));
  // Under a quarter it changes again, and only one of the two is ever on him.
  ep.hp = Math.round(ep.maxHp * 0.25); rageCheck(ep);
  ok("under 30% he is Rabid", has(ep, "rabid"));
  ok("and never both at once", !has(ep, "riled"));
  ok("Rabid is 42% more", Math.abs(stat(ep, "atk") / calm - 1.42) < 0.02, (stat(ep, "atk") / calm).toFixed(3));
  // Mend him and it goes away again, so the badge always matches the bar.
  ep.hp = ep.maxHp; rageCheck(ep);
  ok("mended back up he calms down", !has(ep, "riled") && !has(ep, "rabid"));
  // He mends himself while he is worked up, which is the only sustain he has.
  ep.hp = Math.round(ep.maxHp * 0.4); rageCheck(ep);
  const epBefore = ep.hp;
  turnStart(ep);
  ok("Riled mends him on his own turn", ep.hp > epBefore, `${epBefore} to ${ep.hp}`);
  // Nothing he does marks an enemy any more, which was the confusing part.
  ok("no status is left on the enemy by any of it", !B.enemies[0].statuses.some(x => x.key === "quarry"));

  // ---- Isaac: hard to hit, not impossible to pick ----
  setupBattle({ team: ["isaac", "flynn", "leo"], enemies: [{ id: "brute" }] });
  const is = B.players[0], isFoe = B.enemies[0];
  ok("he starts Invisible", has(is, "invisible"));
  const seenEva = (removeStatus(is, "invisible"), stat(is, "eva"));
  addStatus(is, "invisible", 99, { silent: true });
  ok("Invisible is harder to hit", stat(is, "eva") > seenEva + 0.2, `${seenEva.toFixed(2)} to ${stat(is, "eva").toFixed(2)}`);
  // The point of the change: it is worth the same when he is the only one left.
  B.players.filter(a => a !== is).forEach(a => { a.hp = 0; a.alive = false; });
  ok("it still works when he is the last one standing", stat(is, "eva") > seenEva + 0.2);
  ok("and he can still be picked, so he is not unkillable", !unseen(is, isFoe));
  await KIT.isaac.basic(is, isFoe);
  ok("striking gives him away", !has(is, "invisible"));
  B.sp = 5; is.flags.skillCd = 0;
  await KIT.isaac.skill(is);
  ok("Slipping Away puts him back", has(is, "invisible"));
  ok("and marks the hardest hitter", has(isFoe, "exposed"));
  is.flags.skillCd = 2;
  ok("he cannot vanish twice running", !canUse(is, "skill"));

  // ---- the things that say "at random" are ----
  {
    const N = 6000, tol = 0.035;
    const share = (counts, key) => (counts[key] || 0) / N;

    // Kingsley pulls one of five trinkets. Each should come up a fifth of the time.
    setupBattle({ team: ["kingsley", "flynn", "leo"], enemies: [{ id: "brute" }] });
    const kg = B.players[0];
    const trinkets = {};
    for (let i = 0; i < N; i++) {
      const item = pick(['lantern', 'mirror', 'bell', 'spark', 'dice']);
      trinkets[item] = (trinkets[item] || 0) + 1;
    }
    const tOff = ['lantern', 'mirror', 'bell', 'spark', 'dice'].map(k => Math.abs(share(trinkets, k) - 0.2));
    ok("each of the five trinkets comes up a fifth of the time", Math.max(...tOff) < tol,
      ['lantern', 'mirror', 'bell', 'spark', 'dice'].map(k => k + ' ' + (share(trinkets, k) * 100).toFixed(1) + '%').join(', '));

    // Vasco draws a Joker a tenth of the time and otherwise one of four suits evenly.
    setupBattle({ team: ["vasco", "flynn", "leo"], enemies: [{ id: "brute" }] });
    const vs = B.players[0];
    const cards = {};
    for (let i = 0; i < N; i++) {
      const joker = rnd() < (bt(vs, 'jokerCh') || 0.1);
      const card = joker ? 'joker' : pick(['hearts', 'spades', 'clubs', 'diamonds']);
      cards[card] = (cards[card] || 0) + 1;
    }
    ok("the Joker is about one draw in ten", Math.abs(share(cards, "joker") - 0.1) < 0.02, (share(cards, "joker") * 100).toFixed(1) + "%");
    const sOff = ['hearts', 'spades', 'clubs', 'diamonds'].map(k => Math.abs(share(cards, k) - 0.225));
    ok("and the four suits split the rest evenly", Math.max(...sOff) < tol,
      ['hearts', 'spades', 'clubs', 'diamonds'].map(k => k + ' ' + (share(cards, k) * 100).toFixed(1) + '%').join(', '));

    // Vasco pulls two of three tricks on a Prank, so each trick should appear two thirds of the time.
    const tricks = {};
    for (let i = 0; i < N; i++) {
      for (const k of shuffle(['blind', 'atkDown', 'spdDown']).slice(0, 2)) tricks[k] = (tricks[k] || 0) + 1;
    }
    const kOff = ['blind', 'atkDown', 'spdDown'].map(k => Math.abs(share(tricks, k) - 2 / 3));
    ok("Prank picks its two tricks evenly", Math.max(...kOff) < tol,
      ['blind', 'atkDown', 'spdDown'].map(k => k + ' ' + (share(tricks, k) * 100).toFixed(1) + '%').join(', '));
  }

  // Every new hero has to be reachable, priced and described.
  ["hbenjamin", "ephraim", "isaac"].forEach(id => {
    ok(`${id} is in the roster`, HERO_ORDER.includes(id));
    ok(`${id} unlocks from a stage`, !!UNLOCK_FROM[id], UNLOCK_FROM[id]);
    ok(`${id} has two builds beside balanced`, (BUILDS[id] || []).length === 3, (BUILDS[id] || []).length);
    const h = HEROES[id];
    ok(`${id} has all four descriptions`, !!(h.passive.desc && h.basic.desc && h.skill.desc && h.ult.desc));
    ok(`${id} previews all three moves`, ["basic", "skill", "ult"].every(k => {
      setupBattle({ team: [id, "flynn", "leo"], enemies: [{ id: "brute" }] });
      const r = previewFor(B.players[0], k, B.enemies[0]);
      return r && (r.dmg !== undefined || r.txt !== undefined || r.heal !== undefined);
    }));
  });

console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
