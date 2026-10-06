/* Description audit. Run with: npm run check:desc
 *
 * Every effect a hero applies has to be stated in words somewhere the player can read.
 * This reads the KIT source for each hero, collects the statuses their abilities apply, and
 * checks the hero's own descriptions mention each one. It cannot judge wording, only absence,
 * so a clean run means nothing is missing, not that everything reads well.
 */
'use strict';

// Statuses the player never needs told about by name: bookkeeping, or named differently in prose.
const SILENT = new Set(['stance', 'tempo', 'channel', 'grace', 'vengeance', 'pages', 'bracelet',
  'hexwall', 'hexshield', 'laststand', 'vessel', 'flow', 'resolute', 'aloft', 'sever', 'cinder',
  'song', 'mended', 'guarding', 'guarded', 'charging', 'plated', 'warded', 'unbound', 'terrified']);

// Words that count as mentioning a status, beyond the status name itself.
const ALIAS = {
  atkUp: ['atk', 'attack'], atkDown: ['atk', 'attack'], defUp: ['def', 'defence'], defDown: ['def', 'defence'],
  spdUp: ['spd', 'speed'], spdDown: ['spd', 'speed'], accUp: ['acc', 'accuracy'],
  afterimage: ['afterimage', 'dodge'], undying: ['unbreakable', 'cannot fall'], crystal: ['crystal', 'block'],
  taunt: ['taunt'], regen: ['regen', 'heals'], hunted: ['hunted', 'mark'], exposed: ['exposed'],
  silenced: ['silence'], framed: ['framed', 'frame'], blind: ['blind'], stun: ['stun'],
  burn: ['burn'], shock: ['shock'], bleed: ['bleed'], poison: ['poison'], mirror: ['mirror'],
  encircled: ['encircled', 'encircle'], unsealed: ['unsealed'], alch: ['random debuff', 'poison', 'atk', 'def']
};

const src = KIT_SOURCE;           // set by tools/desc_check.sh
let problems = 0, checked = 0;

function textFor(id) {
  const h = HEROES[id];
  const build = (BUILDS[id] || []).map(b => b.desc || '').join(' ');
  return [h.passive.desc, h.basic.desc, h.skill.desc, h.ult.desc, build].join(' ').toLowerCase();
}

/* Pulls out each hero's slice of the KIT object so statuses are attributed to the right hero. */
function kitSlice(id) {
  const start = src.indexOf('\n  ' + id + ': {');
  if (start < 0) return '';
  let depth = 0, i = src.indexOf('{', start);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(i, j + 1); }
  }
  return src.slice(i);
}

for (const id of HERO_ORDER) {
  const slice = kitSlice(id);
  if (!slice) { console.log(`?     ${id}: no KIT entry found`); continue; }
  const text = textFor(id);
  const found = new Set();
  for (const m of slice.matchAll(/addStatus\([^,]+,\s*'([a-zA-Z]+)'/g)) found.add(m[1]);
  for (const m of slice.matchAll(/key:\s*'([a-zA-Z]+)'/g)) found.add(m[1]);
  for (const key of found) {
    if (SILENT.has(key)) continue;
    const d = STATUS[key];
    const names = [key.toLowerCase(), ...(d ? [d.name.toLowerCase()] : []), ...(ALIAS[key] || [])];
    checked++;
    if (!names.some(n => text.includes(n))) {
      problems++;
      console.log(`MISSING  ${HEROES[id].name}: applies ${d ? d.name : key} but no description says so`);
    }
  }
}


/* A hero is also responsible for what the creatures they summon do. This is where the real
   gap was: nothing in the text said the imps set anything on fire. */
for (const id of HERO_ORDER) {
  const slice = kitSlice(id);
  if (!slice) continue;
  const text = textFor(id);
  const kinds = new Set([...slice.matchAll(/summonCreature\([^,]+,\s*'([a-zA-Z]+)'/g)].map(m => m[1]));
  for (const kind of kinds) {
    const def = ENEMIES[kind];
    if (!def) continue;
    checked++;
    if (!text.includes(def.name.toLowerCase())) {
      problems++;
      console.log(`MISSING  ${HEROES[id].name}: summons a ${def.name} but no description names it`);
    }
    for (const mv of def.moves || []) {
      if (!mv.status) continue;
      const d = STATUS[mv.status.key];
      const names = [mv.status.key.toLowerCase(), ...(d ? [d.name.toLowerCase()] : []), ...(ALIAS[mv.status.key] || [])];
      checked++;
      if (!names.some(n => text.includes(n))) {
        problems++;
        console.log(`MISSING  ${HEROES[id].name}: its ${def.name} applies ${d ? d.name : mv.status.key} but no description says so`);
      }
    }
  }
}

console.log(`\n${checked - problems}/${checked} effects are described. ${problems ? problems + ' missing.' : 'Nothing missing.'}`);
process.exit(problems ? 1 : 0);
