HOOK.headless = true;
const ARG = JSON.parse(process.argv[2] || '{}');
for (const [id, v] of Object.entries(ARG)) Object.assign(STAGES.find(s => s.id === id), v);
const TE = { vehra: [['angus', 'flynn', 'leo'], ['angus', 'leo', 'yousuf'], ['david', 'flynn', 'yousuf'], ['gemia', 'leo', 'yousuf']],
  cinder: [['angus', 'flynn', 'yousuf'], ['vehra', 'leo', 'yousuf'], ['david', 'gemia', 'yousuf'], ['angus', 'vehra', 'flynn']],
  hexwall: [['angus', 'flynn', 'yousuf'], ['vehra', 'peguicha', 'yousuf'], ['david', 'gemia', 'leo'], ['angus', 'leo', 'yousuf']],
  hidden: [['angus', 'flynn', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['malakai', 'vehra', 'yousuf'], ['soham', 'peguicha', 'daniel']],
  menagerie: [['angus', 'flynn', 'yousuf'], ['vehra', 'peguicha', 'yousuf'], ['david', 'gemia', 'leo'], ['angus', 'leo', 'yousuf']],
  blurred: [['angus', 'flynn', 'yousuf'], ['lachlan', 'malakai', 'daniel'], ['trigg', 'soham', 'yousuf'], ['vehra', 'peguicha', 'gemia']],
  kingtrial: [['angus', 'flynn', 'yousuf'], ['harry', 'chosen', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['alfred', 'seraphine', 'soham']],
  revels: [['angus', 'flynn', 'yousuf'], ['harry', 'chosen', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['ethan', 'ben', 'gemia']],
  kennels: [['angus', 'flynn', 'yousuf'], ['vehra', 'leo', 'yousuf'], ['david', 'gemia', 'daniel'], ['angus', 'harry', 'yousuf']],
  oldestgrave: [['angus', 'flynn', 'yousuf'], ['harry', 'chosen', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['vehra', 'gemia', 'kingsley']],
  rooftops: [['angus', 'flynn', 'yousuf'], ['harry', 'chosen', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['aamay', 'seraphine', 'soham']],
  archive: [['angus', 'flynn', 'yousuf'], ['harry', 'chosen', 'yousuf'], ['lachlan', 'elphi', 'daniel'], ['kingsley', 'vasco', 'david']] };
(async () => {
  for (const sid of Object.keys(TE)) {
    const st = STAGES.find(s => s.id === sid); let line = sid.padEnd(8) + ` hA ${st.heroAtk} hH ${st.heroHp} |`;
    for (const team of TE[sid]) { let w = 0, hp = 0; for (let i = 0; i < 30; i++) { setupBattle({ team, enemies: stageFoes(st) }); if (await runBattle() === 'win') { w++; hp += B.players.reduce((a, p) => a + (p.alive ? p.hp / p.maxHp : 0), 0) / 3; } } line += ` ${String(Math.round(w / 30 * 100)).padStart(3)}% ${w ? Math.round(hp / w * 100) : 0}hp |`; }
    console.log(line);
  }
})();
