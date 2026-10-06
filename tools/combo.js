const fs = require('fs');
const H = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), t = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), d = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const rows = HERO_ORDER.map(h => { const A = H[h + ':balanced']; const c = A.win / A.n * 100; return [h, c, t.team[h], d.duel[h], (c + t.team[h]) / 2, A.kos / A.n * 100]; }).sort((a, b) => b[4] - a[4]);
console.log('hero       campaign  3v3   1v1   composite  falls');
for (const r of rows) console.log(r[0].padEnd(10), r[1].toFixed(0).padStart(7), r[2].toFixed(0).padStart(6), r[3].toFixed(0).padStart(5), r[4].toFixed(1).padStart(9), r[5].toFixed(0).padStart(6));
