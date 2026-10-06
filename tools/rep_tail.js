HOOK.headless = true;
const [mode, heroArg, runsArg] = process.argv.slice(2);
const HEROS = heroArg.split(',');
const RUNS = +runsArg;
const STG = ['cult', 'prophet', 'malakai', 'mirror', 'elphi', 'chosen', 'gate', 'warden', 'shadows', 'yunze', 'harry'].map(id => STAGES.find(s => s.id === id));
function mates(h) {
  const pool = HERO_ORDER.filter(x => x !== h);
  for (;;) { const a = shuffle(pool).slice(0, 2); const team = [h, ...a]; if (team.filter(x => HEROES[x].legend).length <= 1) return team; }
}
(async () => {
  const out = {};
  for (const h of HEROS) {
    const builds = mode === 'builds' ? BUILDS[h].map(b => b.id) : ['balanced'];
    for (const bid of builds) {
      const A = { n: 0, win: 0, dmg: 0, heal: 0, shield: 0, taken: 0, kos: 0, acts: 0, turns: 0, ults: 0, crits: 0, hits: 0, misses: 0, dodges: 0, attacked: 0, teamDmg: 0, maxHp: 0, kills: 0, buffs: 0, debuffs: 0 };
      for (const st of STG) for (let r = 0; r < RUNS; r++) {
        const team = mates(h);
        setupBattle({ team, builds: { [h]: bid }, enemies: stageFoes(st) });
        const u = B.players[0];
        let fell = false; const pu = HOOK.update; HOOK.update = () => { if (!u.alive) fell = true; };
        const res = await runBattle(); HOOK.update = pu;
        const s = B.st[u.uid];
        A.n++; if (res === 'win') A.win++;
        A.dmg += s.dmg; A.heal += s.heal; A.shield += s.shield; A.taken += s.taken; A.kos += (fell || !u.alive) ? 1 : 0;
        A.acts += s.acts; A.turns += B.turn; A.ults += s.ults; A.crits += s.crits; A.hits += s.hits; A.misses += s.misses; A.dodges += s.dodges; A.kills += s.kills;
        A.buffs += s.buffs; A.debuffs += s.debuffs; A.maxHp += u.maxHp;
        A.teamDmg += B.players.reduce((a, p) => a + B.st[p.uid].dmg, 0);
      }
      out[h + ':' + bid] = A;
    }
  }
  console.log(JSON.stringify(out));
})();
