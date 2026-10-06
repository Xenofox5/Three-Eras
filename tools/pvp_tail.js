HOOK.headless = true;
const MODE = process.argv[2], N = +process.argv[3];
async function fight(a, b) {
  // a = player-side hero ids, b = enemy-side hero ids. Returns 1 win for a, 0 loss, 0.5 draw (400 turns).
  setupBattle({ team: a, enemies: b.map(id => ({ id, hero: true })) });
  const pu = HOOK.update; HOOK.update = () => { if (B.turn > 400) B.abort = true; };
  const r = await runBattle(); HOOK.update = pu;
  return r === 'win' ? 1 : r === 'abort' ? 0.5 : 0;
}
const IDS = HERO_ORDER.slice();
function team3() { for (;;) { const t = shuffle(IDS).slice(0, 3); if (t.filter(x => HEROES[x].legend).length <= 1) return t; } }
(async () => {
  const out = {};
  if (MODE === 'duel') {
    /* Each unordered pair is played once, N fights from each side, and the mirror cell is
       its complement. Looping over ordered pairs instead sampled every matchup twice
       independently, so M[a][b] and M[b][a] were two different answers to the same question
       and disagreed by up to 29 points. It also did double the work. */
    const M = {}; IDS.forEach(a => { M[a] = {}; });
    for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) {
      const a = IDS[i], b = IDS[j];
      let s = 0;
      for (let k = 0; k < N; k++) { s += await fight([a], [b]); s += 1 - await fight([b], [a]); }
      const pa = Math.round(s / (2 * N) * 1000) / 10;
      M[a][b] = pa;
      M[b][a] = Math.round((100 - pa) * 10) / 10;
    }
    out.matrix = M;
    out.perPair = 2 * N;
    out.duel = {}; IDS.forEach(a => { const v = IDS.filter(b => b !== a).map(b => M[a][b]); out.duel[a] = Math.round(v.reduce((x, y) => x + y, 0) / v.length * 10) / 10; });
  } else {
    const W = {}, C = {}; IDS.forEach(a => { W[a] = 0; C[a] = 0; });
    let draws = 0;
    for (let i = 0; i < N; i++) {
      const A = team3(), Bt = team3();
      const r = await fight(A, Bt); if (r === 0.5) draws++;
      A.forEach(h => { W[h] += r; C[h]++; }); Bt.forEach(h => { W[h] += 1 - r; C[h]++; });
    }
    out.team = {}; IDS.forEach(a => { out.team[a] = Math.round(W[a] / C[a] * 1000) / 10; });
    out.draws = draws; out.games = N;
  }
  console.log(JSON.stringify(out));
})();
