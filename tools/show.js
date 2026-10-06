const fs = require('fs');
const H = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), Bd = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const imp = A => A.dmg + A.heal + 0.75 * A.shield + 0.35 * A.taken + 120 * A.kills + 30 * (A.buffs + A.debuffs);
const R = A => ({ win: A.win / A.n * 100, imp: imp(A) / A.turns, dmg: A.dmg / A.turns, sup: (A.heal + A.shield) / A.turns, fall: A.kos / A.n * 100 });
const rows = HERO_ORDER.map(h => [h, R(H[h + ':balanced'])]).sort((a, b) => b[1].win - a[1].win);
for (const [h, r] of rows) console.log(HEROES[h].name.padEnd(11), 'win', r.win.toFixed(0).padStart(3), ' imp', r.imp.toFixed(0).padStart(3), ' dmg', r.dmg.toFixed(0).padStart(3), ' sup', r.sup.toFixed(0).padStart(3), ' falls', r.fall.toFixed(0).padStart(3));
const all = rows.map(r => r[1].win); console.log('spread', Math.min(...all).toFixed(0), '-', Math.max(...all).toFixed(0));
for (const h of HERO_ORDER) console.log(HEROES[h].name.padEnd(11), BUILDS[h].map(b => b.name + ' ' + R(Bd[h + ':' + b.id]).win.toFixed(0)).join(' | '));
