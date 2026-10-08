'use strict';
/* ================= ENGINE ================= */
let UID = 0;
let BATTLE_ID = 0;
const B = {};
const HOOK = {
  headless: false,
  sleep: () => Promise.resolve(),
  fx: async () => {},
  float: () => {},
  hurt: () => {},
  update: () => {},
  log: () => {},
  banner: async () => {},
  ult: async () => {},
  actName: () => {},
  ko: async () => {},
  revive: async () => {},
  choose: async () => null,
  rebuild: () => {},
  sfx: () => {}
};
const wait = ms => HOOK.sleep(ms);
const rnd = () => Math.random();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const isUp = u => !!u && u.alive && u.hp > 0;
const foesOf = u => (u.side === 'player' ? B.enemies : B.players).filter(isUp);
const friendsOf = u => (u.side === 'player' ? B.players : B.enemies).filter(isUp);
const getSt = (u, k) => u.statuses.find(s => s.key === k);
const has = (u, k) => !!getSt(u, k);
const hpPct = u => u.hp / u.maxHp;
const lowest = arr => (arr.length ? arr.reduce((a, b) => (hpPct(b) < hpPct(a) ? b : a)) : null);

const bt = (u, k) => (u && u.build && u.build.tags && u.build.tags[k]) || 0;
function defOf(id, side, hero) { return hero ? HEROES[id] : ENEMIES[id]; }
const sideList = u => (u.side === 'player' ? B.players : B.enemies);
const spOf = u => (u.side === 'player' ? B.sp : (B.spE || 0));
function addSp(u, n) { if (u.side === 'player') B.sp = clamp(B.sp + n, 0, B.spMax); else B.spE = clamp((B.spE || 0) + n, 0, B.spMaxE || 5); }
function newStats() { return { falls: 0, dmg: 0, heal: 0, shield: 0, taken: 0, kills: 0, crits: 0, hits: 0, misses: 0, dodges: 0, big: 0, acts: 0, ults: 0, buffs: 0, debuffs: 0, absorbed: 0 }; }
function lookOf(u) {
  const h = u.def.heroId ? HEROES[u.def.heroId] : (u.isHero ? HEROES[u.id] : null);
  if (h && h.altLook && h.altLookWhen && (u.statuses || []).some(s => s.key === h.altLookWhen)) return h.altLook;
  return h ? h.look : u.def.look;
}

function makeUnit(id, side, slot, o = {}) {
  const isHero = !o.minion && (side === 'player' || !!o.hero);
  let def = defOf(id, side, isHero);
  if (isHero && o.boss) def = Object.assign(Object.create(def), { boss: true, title: o.title || def.title });
  const s = def.stats;
  return {
    uid: ++UID, id, def, side, slot, isHero,
    heroId: def.heroId || (isHero ? id : null),
    name: def.name, color: def.color || '#ccc',
    base: { hp: s.hp * (o.hpMul || 1), atk: s.atk * (o.atkMul || 1), def: s.def, spd: s.spd, crit: s.crit ?? 0.08, cdmg: s.cdmg ?? 0.5, eva: s.eva ?? 0.05, acc: s.acc ?? 0 },
    build: isHero ? buildOf(id, o.build) : null,
    scale: { hpMul: o.hpMul || 1, atkMul: o.atkMul || 1 },
    mods: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, cdmg: 0, eva: 0, acc: 0, dmg: 0, heal: 0, shield: 0, dot: 0, lifesteal: 0, ultGain: 0, exec: 0 },
    statuses: [], shield: 0, gauge: 10000, ult: 0, alive: true, flags: {}, cd: {}, intents: [],
    dr: isHero && (id === 'angus' || id === 'chosen') ? 0.12 : 0
  };
}
function finalize(u) { u.maxHp = Math.round(u.base.hp * (1 + u.mods.hp)); u.hp = u.maxHp; }

function stat(u, k) {
  let add = u.mods[k] || 0;
  for (const st of u.statuses) {
    const d = STATUS[st.key];
    if (d.stat === k) add += (d.neg ? -1 : 1) * (st.value || 0);
    if (d.mods && d.mods[k]) add += d.mods[k];
    if (d.perStack && d.perStack[k]) add += d.perStack[k] * (st.stacks || 1);
  }
  if (k === 'crit') return clamp(u.base.crit + add, 0, 1);
  if (k === 'eva') return clamp(u.base.eva + add, 0, 0.6);
  if (k === 'acc') return u.base.acc + add;
  if (k === 'cdmg') return u.base.cdmg + add;
  return u.base[k] * Math.max(0.25, 1 + add);
}

/* ---------- statuses ---------- */
function statusLabel(key, v, st) {
  const d = STATUS[key];
  if (d.stat) return `${d.icon} ${d.name}${v ? ' ' + (d.neg ? '-' : '+') + Math.round(v * 100) + '%' : ''}`;
  if (key === 'stance') return st && st.value === 'far' ? '🔵 Far stance' : '👊 Close stance';
  if (key === 'mixture') return `🧪 Next: ${MIXTURE[(st && st.value) || 0].name}`;
  return `${d.icon} ${d.name}`;
}
function addStatus(t, key, turns, o = {}) {
  if (!isUp(t)) return false;
  if (key === 'alch') key = pick(['poison', 'atkDown', 'defDown']);
  const d = STATUS[key];
  if (key === 'stun') {
    if (t.def.stunImmune || (t.isHero && t.id === 'harry') || has(t, 'riled') || has(t, 'rabid') || has(t, 'stone') || has(t, 'hexshield')) { HOOK.float(t, 'IMMUNE', 'info'); return false; }
    if (t.def.boss) { t.gauge = Math.min(16000, t.gauge + 2500); HOOK.float(t, '⏳ DELAYED', 'info'); return false; }
    if (chanOf(t)) endChannel(t, 'broken');
  }
  if (key === 'terrified' && has(t, 'resolute')) return false;
  if (key === 'blind' && t.isHero && t.id === 'alfred') return false;
  if (o.value == null) {
    if (key === 'poison' || key === 'burn' || key === 'bleed' || key === 'shock') { /* dot carried */ }
    else if (d.stat) o.value = 0.2;
  }
  let st = getSt(t, key);
  if (st) {
    st.turns = Math.max(st.turns, turns);
    if (o.value != null) st.value = Math.max(st.value || 0, o.value);
    if (d.max) st.stacks = Math.min(d.max, (st.stacks || 1) + (o.stacks || 1));
    if (o.dot != null) st.dot = Math.max(st.dot || 0, o.dot);
    if (o.src) st.src = o.src;
  } else {
    st = { key, turns, value: o.value, stacks: d.max ? Math.min(d.max, o.stacks || 1) : 1, src: o.src, dot: o.dot };
    t.statuses.push(st);
    const by = o.src || B.actor;
    if (by && !d.fixed && key !== 'grace' && key !== 'stance') { if (by.side !== t.side && d.type === 'debuff') tally(by, 'debuffs'); else if (by.side === t.side && t !== by && d.type === 'buff') tally(by, 'buffs'); }
  }
  st.fresh = (B.actor === t);
  if (!o.silent) {
    let lbl = statusLabel(key, o.value, st);
    if (d.max && st.stacks > 1) lbl += ' ×' + st.stacks;
    HOOK.float(t, lbl, d.type === 'buff' ? 'buff' : 'debuff');
  }
  return true;
}
function removeStatus(t, key) { t.statuses = t.statuses.filter(s => s.key !== key); }
function cleanse(t, n = 99) {
  let c = 0;
  t.statuses = t.statuses.filter(s => { const d = STATUS[s.key]; if (c < n && d.type === 'debuff' && !d.fixed) { c++; return false; } return true; });
  if (c) HOOK.float(t, '✧ CLEANSED', 'buff');
  return c;
}
const sellable = t => t.statuses.filter(s => STATUS[s.key].type === 'debuff' && !STATUS[s.key].fixed);
function stripBuffs(t) {
  const before = t.statuses.length + (t.shield > 0 ? 1 : 0);
  t.statuses = t.statuses.filter(s => { const d = STATUS[s.key]; return !(d.type === 'buff' && !d.fixed); });
  t.shield = 0;
  if (before > t.statuses.length) HOOK.float(t, '⚗️ STRIPPED', 'debuff');
}
function applyOnHit(u, t, s) {
  if (!s || !isUp(t)) return;
  if (rnd() >= (s.chance ?? 1)) return;
  const dot = s.dot ? s.dot * stat(u, 'atk') * (1 + (u.mods.dot || 0)) : undefined;
  addStatus(t, s.key, s.turns, { value: s.value, dot, stacks: s.stacks, src: u });
}

/* ---------- damage ---------- */
function isRival(a, t) { const r = RIVALS[a.heroId]; return !!(r && t.heroId && r.includes(t.heroId)); }
/* Sends a single-target hit to the guardian, and pays David for taking it. Both strike() and
   resolveHit() route through here; whoever gets there first wins, because a guardian is never
   itself guarded, so the second call finds nothing to redirect. */
function interceptFor(t, u) {
  const g = guardian(t);
  if (!g || g === u) return t;
  HOOK.float(t, '🛡 GUARDED', 'info');
  if (g.isHero && g.id === 'david' && isUp(g)) heal(g, g, g.maxHp * (bt(g, 'guardHeal') || 0.03), { noCrit: true, tick: true });
  return g;
}
function guardian(t) {
  const s = getSt(t, 'guarded');
  if (s && s.src && isUp(s.src) && s.src !== t && s.src.side === t.side) return s.src;
  return null;
}
function dmgBonus(u, t) {
  let m = 0;
  if (u.isHero && u.id === 'flynn' && has(t, 'shock')) m += 0.25;
  if (u.isHero && u.id === 'leo' && has(t, 'burn')) m += 0.2;
  if (u.isHero && u.id === 'vehra' && hpPct(t) < 0.5) m += bt(u, 'bloodlust') || 0.3;
  if (u.side && u.id !== 'ethan' && sideList(u).some(p => isUp(p) && p.isHero && p.id === 'ethan')) m += 0.08;
  if (u.isHero && u.id === 'ben' && (t.flags.delayed || has(t, 'stun'))) m += 0.55;
  if (has(t, 'withered')) m += (u.isHero && u.id === 'hbenjamin') ? 0.2 : 0.12;
  /* Isaac only gets the ambush once per vanish: the first blow out of sight, not every blow
     while the status happens to still be on him. */
  if (u.isHero && u.id === 'isaac' && has(u, 'invisible')) m += bt(u, 'ambush') || 0.18;
  if (u.flags && u.flags.pact && t.statuses.some(x => STATUS[x.key].type === 'debuff')) m += 0.15;
  if (u.isHero && u.id === 'yunze') {
    const f = foesOf(u);
    if (f.length >= 2 && t === f.reduce((a, b) => (b.maxHp > a.maxHp ? b : a))) m += 0.3;
  }
  if (u.mods.exec && hpPct(t) < 0.3) m += u.mods.exec;
  return m;
}
function takenMult(t, u) {
  let m = 1 - (t.dr || 0);
  if (has(t, 'guarding')) m *= 1 - (bt(t, 'guardDr') || 0.5);
  if (t.isHero && t.id === 'chosen') { const g = getSt(t, 'grace'); if (g) m *= 1 - 0.02 * g.stacks; }
  if (has(t, 'stone')) m *= 1 - (bt(t, 'stoneDr') || 0.5);
  // Frail on his feet and stubborn once he is down, which is the whole shape of him.
  if (has(t, 'corpse')) m *= 1 - (t.flags.corpseDR || bt(t, 'corpseDR') || 0.55);
  /* The thing wearing him is harder to put down than he is. Locked into it the Vessel fell in
     75% of fights against the jester 50%, and the owner asked for its damage cut, not its
     survival, so the gap closes here. */
  if (has(t, 'plated')) m *= 0.5;
  if (has(t, 'exposed')) m *= 1.5;
  if (has(t, 'warded')) m *= 0.5;
  if (t.flags.escort) m *= 0.75;
  const hs = getSt(t, 'hunted'); if (hs && (!hs.src || hs.src === u)) m *= 1 + (hs.value || 0.25);
  return m;
}
function calcDmg(u, t, mult, o = {}, est = false) {
  const atk = stat(u, 'atk');
  const def = stat(t, 'def') * (1 - (o.pierce || 0));
  let d = atk * mult * (300 / (300 + Math.max(0, def)));
  let bonus = 1 + (u.mods.dmg || 0) + dmgBonus(u, t) + (o.bonus || 0) + (has(u, 'unsealed') ? 0.35 : 0);
  const rival = isRival(u, t);
  if (rival) bonus += 0.2;
  d *= bonus * takenMult(t, u) * suddenDeath();
  if (est) return { dmg: Math.round(d), rival };
  const crit = !o.noCrit && (o.forceCrit || rnd() < stat(u, 'crit') + (o.critBonus || 0) + (has(t, 'framed') ? 0.15 : 0));
  if (crit) d *= 1 + stat(u, 'cdmg');
  d *= 0.92 + rnd() * 0.16;
  return { dmg: Math.max(1, Math.round(d)), crit, rival };
}
function hitChance(u, t, o = {}) {
  if (o.sure || o.canMiss === false) return 1;
  if (has(t, 'framed')) return 1;
  let h = 1 + stat(u, 'acc') + (o.acc || 0) - stat(t, 'eva') * (u.isHero && u.id === 'alfred' ? 0.5 : 1);
  h = Math.min(1, h);
  if (has(u, 'blind')) h -= 0.35;
  return clamp(h, 0.05, 1);
}
function syncBeads(u) {
  removeStatus(u, 'bracelet');
  if (u.flags.beads > 0) addStatus(u, 'bracelet', 99, { stacks: u.flags.beads, silent: true });
}
function returnBeads(victim) {
  const c = getSt(victim, 'cinder');
  if (c && c.src && c.src.flags && isUp(c.src)) { c.src.flags.beads = Math.min(c.src.flags.beadMax || 5, (c.src.flags.beads || 0) + (c.stacks || 1)); syncBeads(c.src); HOOK.float(c.src, `📿 +${c.stacks || 1}`, 'buff'); }
}
const wallMax = u => Math.round(u.maxHp * 0.55);
const witherTurns = u => (u.def && u.def.boss) ? 1 : 2;
// How far he has to be mended before he can stand up again.
const riseAt = u => u.flags.riseAt || bt(u, 'riseAt') || 0.35;
/* The first fall is not one. He comes apart into a Corpse that keeps acting with a weaker set
   of moves and two Skulls that fight on their own, and mending the Corpse puts him back
   together. It happens once: after he stands up, the next fall is a real one. */
/* The only thing that drives Ephraim is his own health bar, so the state is computed from it
   rather than applied by anything. Checked on his turn and again whenever he is hit, so the
   badge and the ATK are never out of step with the bar the player is looking at. */
function rageCheck(u) {
  if (!u.isHero || u.id !== 'ephraim' || !isUp(u)) return;
  const pct = u.hp / u.maxHp;
  const want = pct <= (bt(u, 'rabidAt') || 0.25) ? 'rabid' : pct <= (bt(u, 'riledAt') || 0.5) ? 'riled' : null;
  for (const k of ['riled', 'rabid']) if (k !== want && has(u, k)) removeStatus(u, k);
  if (want && !has(u, want)) {
    addStatus(u, want, 99, { silent: true });
    HOOK.float(u, want === 'rabid' ? '🩸 RABID' : '😤 RILED', 'buff');
  }
}
function collapseBenjamin(u) {
  u.flags.bargainSpent = true;
  u.hp = Math.max(1, Math.round(u.maxHp * 0.25));
  addStatus(u, 'corpse', 99, { silent: true });
  HOOK.float(u, '\u{1F480} HE COMES APART', 'special');
  HOOK.log(`${u.name} falls apart, and the pieces keep moving.`, 'i');
  HOOK.fx('skullspend', { tgt: u });
}
// Back on his feet.
function riseBenjamin(u, pct) {
  removeStatus(u, 'corpse');
  u.hp = Math.max(u.hp, Math.round(u.maxHp * pct));
  HOOK.float(u, '\u{1F56F} HE GETS UP', 'buff');
  HOOK.fx('secondbreath', { src: u, tgts: [u] });
}
/* The skulls at his hands are the thing his art has always shown, so that is what they do:
   they feed on whatever he has just marked and hand it back to him. One per mark, so it pays
   for doing the thing he is for rather than for standing still. */
function skullFeed(u, t) {
  if (!isUp(u) || !t) return;
  const back = Math.round(u.maxHp * (u.def.boss ? 0.025 : (bt(u, 'feedPct') || 0.07)));
  if (back <= 0) return;
  HOOK.fx('skullfeed', { src: t, tgt: u });
  heal(u, u, back, { noCrit: true });
}
function giveHex(src, t, amt, hits) {
  if (!isUp(t)) return;
  const before = t.shield;
  addShield(src, t, amt);
  const got = t.shield - before;
  const h = getSt(t, 'hexshield');
  if (h) { h.value += got; h.hits = Math.max(h.hits, hits); h.src = src; }
  else { addStatus(t, 'hexshield', 99, { silent: true }); const n = getSt(t, 'hexshield'); n.value = got; n.hits = hits; n.src = src; }
  HOOK.float(t, `⬡ +${got} (${hits} hits)`, 'shield');
}
function shatterHex(t, why) {
  const h = getSt(t, 'hexshield'); if (!h) return;
  const rest = Math.min(t.shield, Math.max(0, Math.round(h.value)));
  t.shield -= rest;
  removeStatus(t, 'hexshield');
  if (why === 'hits') { HOOK.float(t, '⬡ HEX SHATTERED', 'debuff'); HOOK.fx('shieldbreak', { tgt: t }); HOOK.sfx('break'); }
  const so = h.src;
  if (so && isUp(so) && bt(so, 'hexBlast')) { HOOK.float(t, '💥 HEX BURST', 'special'); HOOK.fx('hexburst', { src: t, owner: so, tgts: foesOf(so) }); for (const e of foesOf(so)) resolveHit(so, e, bt(so, 'hexBlast'), { aoe: true, sure: true }); }
}
/* Who cannot be aimed at with a single-target attack. Out of Sight is a status anyone can
   carry, so it shows on the card and counts down where the player can see it. Seraphine is the
   standing case: only a living hero is cover, never a creature, and a boss sees her regardless. */
const unseen = (p, by) => has(p, 'hidden')
  || (p.isHero && p.id === 'aamay'
    && !(by && by.def && by.def.boss)
    && sideList(p).some(x => x !== p && isUp(x) && x.isHero));
const seenOnly = (list, by) => { const v = list.filter(p => !unseen(p, by)); return v.length ? v : list; };
function wallFor(t) { return sideList(t).find(p => isUp(p) && p.isHero && p.id === 'soham' && has(p, 'hexwall')); }
function raiseWall(u, amt) {
  const w = getSt(u, 'hexwall');
  if (w) w.value = Math.min(wallMax(u), w.value + amt);
  else addStatus(u, 'hexwall', 99, { value: Math.min(wallMax(u), amt), silent: true });
}
const creaturesOf = u => sideList(u).filter(x => isUp(x) && x.owner === u);
function summonCreature(owner, kind) {
  const list = sideList(owner), def = ENEMIES[kind], court = owner.flags.court ? 1.2 : 1;
  const SHARE = { imp: [0.32, 0.75] };
  const [hpBase, atkBase] = SHARE[kind] || [0.7, 0.9];
  const hpF = hpBase * (bt(owner, 'creatureHp') || 1) * court;
  const atkF = atkBase * (kind === 'imp' ? (bt(owner, 'impAtk') || 1) : 1) * court;
  const slot = list.reduce((m, x) => Math.max(m, x.slot), -1) + 1;
  const c = makeUnit(kind, owner.side, slot, { minion: true, hpMul: owner.maxHp * hpF / def.stats.hp, atkMul: stat(owner, 'atk') * atkF / def.stats.atk });
  finalize(c); c.owner = owner; c.creature = true; c.gauge = 10000;
  list.push(c);
  B.units = [...B.players, ...B.enemies]; B.st[c.uid] = newStats();
  HOOK.rebuild(); HOOK.float(c, '✦ SUMMONED', 'info');
  return c;
}
const TEMPO = { allegro: { icon: '⏩', name: 'Allegro' }, andante: { icon: '🎵', name: 'Andante' }, grave: { icon: '🐢', name: 'Grave' } };
const MIXTURE = [
  { key: 'poison', icon: '☠️', name: 'Venom' },
  { key: 'atkDown', icon: '💤', name: 'Sedative' },
  { key: 'defDown', icon: '⚗️', name: 'Solvent' }
];
const mixSlot = u => { const st = getSt(u, 'mixture'); return st ? st.value : 0; };
// Toxicologist throws the order away and mixes Venom every time.
const mixOf = u => MIXTURE[bt(u, 'alwaysPoison') ? 0 : mixSlot(u)];
function shiftMix(u) {
  const nx = (mixSlot(u) + 1) % MIXTURE.length;
  removeStatus(u, 'mixture'); addStatus(u, 'mixture', 99, { value: nx, silent: true });
}
function tempoOf(u) { const st = getSt(u, 'tempo'); return st ? st.value : 'andante'; }
function tempoMult(u) { const t = tempoOf(u), w = bt(u, 'wild'); return t === 'allegro' ? (w ? 0.9 : 0.8) : t === 'grave' ? (w ? 1.55 : 1.3) : 1; }
/* What each tempo is for beyond the number: Andante never misses, Grave cuts through armour. */
const tempoOpts = u => { const t = tempoOf(u); return t === 'andante' ? { sure: true } : t === 'grave' ? { pierce: 0.3 } : {}; };
function shiftTempo(u, first) {
  const cur = first ? null : tempoOf(u);
  const opts = (bt(u, 'wild') ? ['allegro', 'grave'] : bt(u, 'noGrave') ? ['allegro', 'andante'] : ['allegro', 'andante', 'grave']).filter(x => x !== cur);
  const nx = pick(opts);
  removeStatus(u, 'tempo'); addStatus(u, 'tempo', 99, { value: nx, silent: true });
  if (!first) HOOK.float(u, `${TEMPO[nx].icon} ${TEMPO[nx].name.toUpperCase()}`, 'info');
}
function delayUnit(t, f) { if (!isUp(t)) return; t.gauge = Math.min(16000, t.gauge + 10000 * f); t.flags.delayed = true; HOOK.float(t, '⏳ DELAYED', 'info'); }
function silence(t, turns) { if (!isUp(t)) return; addStatus(t, 'silenced', turns); if (!t.isHero) t.intents = []; HOOK.float(t, '🖋 SILENCED', 'debuff'); }
/* How many Pages the Chronicle can hold: its base, plus 2 for every hero who has fallen on
   either side. The longer and costlier the fight, the more there is to write down. */
function pageCap(a) {
  const fallen = B.units.filter(x => x.isHero && !x.alive).length;
  return (bt(a, 'pageMax') || 20) + 2 * fallen;
}
/* A Page is written when an enemy of his acts, not when anyone acts. Pairing him with a fast
   hero used to fill the Chronicle twice as quickly, which is what made Yunze beside him absurd. */
function bumpPages(actor) {
  for (const a of B.units) if (isUp(a) && a.isHero && a.id === 'aamay') {
    if (actor && actor.side === a.side) continue;
    const st = getSt(a, 'pages'), max = pageCap(a);
    const n = a.flags.report ? 2 : 1;
    if (!st) addStatus(a, 'pages', 99, { stacks: Math.min(max, n), silent: true }); else st.stacks = Math.min(max, st.stacks + n);
  }
}
/* He climbs back out of it. Waking at 40% and sleeping only above 60% leaves a gap, so he does
   not flicker between faces every time he is healed a point. */
async function sleepVessel(u) {
  if (!has(u, 'vessel')) return;
  u.flags.vessel = false;
  removeStatus(u, 'vessel');
  HOOK.float(u, '🃏 THE MASK RETURNS', 'special');
  HOOK.log(`The thing behind ${u.name} sinks back out of sight.`, 'i');
  HOOK.update();
}
async function wakeVessel(u) {
  if (u.flags.vessel) return;
  u.flags.vessel = true; addStatus(u, 'vessel', 99, { silent: true }); HOOK.update();
  HOOK.float(u, '😈 THE VESSEL WAKES', 'special'); HOOK.log('Something darker looks out from behind Vasco\'s face.', 'i');
  HOOK.fx('vesselwake', { src: u });
  await HOOK.banner('The Vessel wakes', 'Peguicha looks out through Vasco\'s eyes', '#d1203a');
}
const BEAM_RAMP = [1.25, 1.7, 2.1, 2.5];
const beamRamp = u => bt(u, 'ramp') || BEAM_RAMP;
const beamBreak = u => bt(u, 'beamBreak') || 0.3;
const chanOf = u => getSt(u, 'channel');
function endChannel(u, why) {
  const c = chanOf(u); if (!c) return;
  removeStatus(u, 'channel');
  if (why === 'broken') { HOOK.float(u, '💥 BEAM BROKEN', 'debuff'); HOOK.sfx('break'); HOOK.log(`${u.name}'s beam is broken.`, 'i'); }
  else if (why === 'target') { HOOK.float(u, 'Beam ends', 'info'); }
  else if (why === 'release') { HOOK.float(u, 'Beam released', 'info'); }
  HOOK.update();
}
const SUDDEN_TURN = 150;
const aloneHero = u => !sideList(u).some(x => x !== u && isUp(x) && x.isHero);
const suddenDeath = () => (B.turn > SUDDEN_TURN ? 1 + 0.05 * Math.floor((B.turn - SUDDEN_TURN) / 10 + 1) : 1);
function tally(u, k, n = 1) { const s = u && B.st[u.uid]; if (s) s[k] = (s[k] || 0) + n; }
/* A creature's work belongs to whoever summoned it. Creatures are removed from their side when
   they die, so without this the damage Trigg's imps soaked and dealt never reaches the summary.
   Turn counts are left out: they describe the owner's own turns. */
const CREDIT = ['dmg', 'heal', 'shield', 'taken', 'kills', 'crits', 'hits', 'misses', 'dodges', 'buffs', 'debuffs', 'absorbed'];
function creditCreature(c) {
  const os = c && c.owner && B.st[c.owner.uid], cs = c && B.st[c.uid];
  if (!cs || !os || cs.credited) return;
  for (const k of CREDIT) os[k] = (os[k] || 0) + (cs[k] || 0);
  os.big = Math.max(os.big || 0, cs.big || 0);
  cs.credited = true;
}
function resolveHit(u, t, mult, o = {}) {
  if (!isUp(t)) return null;
  /* Guard belongs here, not only in strike(). Crush, Phantom Switch, Finger Frame, Seal in Ink
     and a dozen other single-target skills call resolveHit directly and used to walk straight
     past David. strike() redirects before it gets here, and a guardian is never itself guarded,
     so this never fires twice for one hit. */
  if (!o.aoe && !o.reflected && u.side !== t.side) { t = interceptFor(t, u); if (!isUp(t)) return null; }
  if (o.canMiss !== false && !o.sure) {
    if (has(t, 'afterimage') || has(t, 'airborne')) {
      removeStatus(t, has(t, 'afterimage') ? 'afterimage' : 'airborne');
      HOOK.float(t, 'DODGE', 'miss'); HOOK.fx('dodge', { tgt: t }); HOOK.sfx('miss');
      tally(u, 'misses'); tally(t, 'dodges');
      return { miss: true, target: t };
    }
    if (rnd() >= hitChance(u, t, o)) { HOOK.float(t, 'MISS', 'miss'); HOOK.fx('dodge', { tgt: t }); HOOK.sfx('miss'); tally(u, 'misses'); tally(t, 'dodges'); return { miss: true, target: t }; }
  }
  if (has(t, 'crystal')) {
    removeStatus(t, 'crystal');
    HOOK.float(t, '💎 BLOCKED', 'shield'); HOOK.fx('crystalblock', { tgt: t }); HOOK.sfx('shield');
    return { blocked: true, target: t };
  }
  const r = calcDmg(u, t, mult, o);
  tally(u, 'hits'); if (r.crit) tally(u, 'crits');
  const res = applyDamage(t, r.dmg, { src: u, crit: r.crit, rival: r.rival });
  const pl = getSt(t, 'plated');
  if (pl && isUp(t)) {
    pl.stacks--;
    if (pl.stacks <= 0) {
      removeStatus(t, 'plated');
      addStatus(t, 'exposed', 2, { silent: true });
      t.gauge = Math.min(16000, t.gauge + 3000);
      HOOK.float(t, '🔩 ARMOUR SHATTERED', 'special'); HOOK.sfx('break'); HOOK.fx('shieldbreak', { tgt: t });
      HOOK.log(`${t.name}'s plates shatter. It is Exposed.`, 'i');
    }
  }
  return Object.assign(res, { crit: r.crit, target: t });
}
function applyDamage(t, dmg, o = {}) {
  if (!isUp(t)) return { dmg: 0 };
  if (o.src && o.src.side !== t.side && !o.dot && !o.reflected && !o.pure) {
    const so = wallFor(t);
    if (so) {
      const w = getSt(so, 'hexwall'), cut = Math.min(Math.round(dmg * (bt(so, 'wallSoak') || 0.3)), Math.round(w.value));
      if (cut > 0) {
        dmg -= cut; w.value -= cut; tally(so, 'shield', cut);
        if (w.value <= 0) {
          removeStatus(so, 'hexwall');
          HOOK.float(so, '⬡ WALL BROKEN', 'debuff'); HOOK.fx('shieldbreak', { tgt: so }); HOOK.sfx('break');
          HOOK.log(`${so.name}'s wall breaks.`, 'i');
          if (bt(so, 'wallBlast')) { HOOK.fx('wallblast', { src: so, tgts: foesOf(so) }); for (const e of foesOf(so)) resolveHit(so, e, bt(so, 'wallBlast'), { aoe: true, sure: true }); }
        }
      }
    }
  }
  let left = dmg, absorbed = 0;
  if (t.shield > 0 && !o.pure) {
    const breaker = o.src && has(o.src, 'vessel') ? 2 : 1;
    absorbed = Math.min(t.shield, left * breaker); t.shield -= absorbed; left -= Math.ceil(absorbed / breaker);
    const hx = getSt(t, 'hexshield');
    if (hx && absorbed > 0) { hx.value -= absorbed; hx.hits--; if (hx.value <= 0 || t.shield <= 0) shatterHex(t, 'spent'); else if (hx.hits <= 0) shatterHex(t, 'hits'); }
    if (t.shield <= 0) { t.shield = 0; HOOK.float(t, 'SHIELD BROKEN', 'info'); HOOK.fx('shieldbreak', { tgt: t }); HOOK.sfx('break'); }
  }
  let nh = t.hp - left;
  if (nh <= 0 && has(t, 'undying')) nh = 1;
  // He has one bargain and he spends it the first time he would go down.
  if (nh <= 0 && t.isHero && t.id === 'hbenjamin' && !t.flags.bargainSpent) { nh = 1; t.flags.collapsing = true; }
  if (nh <= 0 && t.flags.cheat) { t.flags.cheat = false; nh = 1; HOOK.float(t, 'NOT YET', 'special'); }
  const real = t.hp - Math.max(0, nh);
  t.hp = Math.max(0, nh);
  // The collapse runs once the blow has landed, so the number on screen stays honest.
  if (t.flags.collapsing) { t.flags.collapsing = false; collapseBenjamin(t); }
  if (t.isHero && t.id === 'ephraim') rageCheck(t);
  const total = real + absorbed;
  if (o.src && o.src.side !== t.side && B.st[o.src.uid]) {
    const ss = B.st[o.src.uid]; ss.dmg += total; if (!o.dot && total > ss.big) ss.big = total;
    if (t.hp <= 0) ss.kills++;
    if (t.hp <= 0) t.flags.lastHitBy = o.src;
  }
  if (absorbed > 0) tally(t, 'absorbed', absorbed);
  if (o.src && has(o.src, 'vessel') && !o.dot && total > 0 && isUp(o.src)) heal(o.src, o.src, total * (bt(o.src, 'vesselSteal') || 0.35), { tick: true, noCrit: true });
  if (t.isHero && t.id === 'angus' && o.src && o.src.side !== t.side && !o.dot && isUp(o.src) && total > 0) addStatus(o.src, 'sapped', 1, { silent: true, src: t });
  if (t.isHero && t.hp > 0 && hpPct(t) < 0.3 && !t.flags.vowed) {
    const el = sideList(t).find(p => isUp(p) && p.isHero && p.id === 'elphi');
    if (el) { t.flags.vowed = true; HOOK.fx('lastlight', { src: el, tgt: t }); addShield(el, t, el.maxHp * 0.1); HOOK.float(t, '✨ LAST LIGHT', 'shield'); HOOK.log(`Elphi's light shields ${t.name}.`, 'p'); }
  }
  const ch = getSt(t, 'charging');
  if (ch && t.hp > 0) {
    ch.taken = (ch.taken || 0) + total;
    if (ch.taken >= ch.value) {
      removeStatus(t, 'charging'); t.intents = [];
      t.gauge = Math.min(16000, t.gauge + 3000);
      addStatus(t, 'exposed', 1, { silent: true });
      HOOK.float(t, '⚡ CHARGE BROKEN', 'special'); HOOK.sfx('break');
      HOOK.log(`${t.name}'s charge is broken.`, 'i');
    }
  }
  if (t.isHero && t.id === 'david' && o.src && o.src.side !== t.side && !o.dot && total > 0 && t.hp > 0) addStatus(t, 'vengeance', 99, { stacks: 1, silent: true });
  const cb = chanOf(t);
  if (cb && t.hp > 0) { cb.taken = (cb.taken || 0) + total; if (cb.taken >= t.maxHp * beamBreak(t)) endChannel(t, 'broken'); }
  if (has(t, 'mirror') && o.src && o.src.side !== t.side && !o.dot && !o.reflected && isUp(o.src) && total > 0) {
    const back = Math.max(1, Math.round(total * 0.4));
    HOOK.fx('reflect', { src: t, tgt: o.src });
    applyDamage(o.src, back, { reflected: true, cls: 'reflect' });
  }
  if (B.st[t.uid]) B.st[t.uid].taken += total;
  if (t.isHero && !o.dot) gainUlt(t, 6);
  if (absorbed > 0) HOOK.float(t, '🛡 -' + absorbed, 'absorb');
  if (real > 0 || absorbed === 0) HOOK.float(t, String(real), o.crit ? 'crit' : (o.cls || 'dmg'), o.rival);
  HOOK.hurt(t, !!o.crit, real);
  if (!o.dot) HOOK.sfx(o.crit ? 'crit' : 'hit');
  if (o.src && o.src.mods && o.src.mods.lifesteal && o.src.side !== t.side && !o.dot && isUp(o.src)) heal(o.src, o.src, total * o.src.mods.lifesteal);
  return { dmg: total, real, absorbed };
}
function heal(src, t, amt, o = {}) {
  if (!isUp(t)) return 0;
  const wthr = getSt(t, 'withered');
  if (wthr) {
    const fromBoss = wthr.src && wthr.src.def && wthr.src.def.boss;
    if (!fromBoss) { HOOK.float(t, '🥀 NO MENDING', 'info'); return 0; }
    amt *= 0.4; HOOK.float(t, '🥀 SMOTHERED', 'info');
  }
  let a = amt * (1 + (src && src.mods ? src.mods.heal : 0)) * (B.turn > SUDDEN_TURN ? 0.5 : 1);
  if (src && src === t && src.isHero && (src.id === 'yousuf' || src.id === 'kingsley')) a *= 0.9;
  if (src && src.isHero && (src.id === 'yousuf' || src.id === 'kingsley') && t === src) a *= 0.9;
  const yh = src && src.isHero && src.id === 'yousuf' && !o.tick;
  if (yh && has(t, 'mended')) a *= 0.75;
  let crit = false;
  if (src && src.isHero && src.id === 'yousuf' && !o.noCrit && rnd() < stat(src, 'crit')) { a *= 1.5; crit = true; }
  a = Math.round(a);
  const real = Math.min(t.maxHp - t.hp, a);
  t.hp += real;
  if (src && B.st[src.uid]) B.st[src.uid].heal += real;
  if (real > 0) HOOK.float(t, (crit ? '✦ ' : '') + '+' + real, crit ? 'healcrit' : 'heal');
  if (real > 0 && t.isHero && t.id === 'ephraim') rageCheck(t);
  if (yh) addStatus(t, 'mended', 2, { silent: true });
  return real;
}
function gainUlt(u, amt) {
  if (!u.isHero || has(u, 'unsealed') || has(u, 'spent')) return;
  if (u.id === 'harry') amt *= 0.55;
  if (u.id === 'yunze') amt *= 0.7;
  if (u.id === 'peguicha' && !bt(u, 'hellRate')) amt *= 0.7;
  if (u.id === 'aamay') amt *= 0.6;
  if (u.id === 'vasco') amt *= 1.8;
  u.ult = Math.min(100, u.ult + amt);
}
function addShield(src, t, amt, cap = 0.8) {
  if (!isUp(t)) return 0;
  const a = Math.round(amt * (1 + (src && src.mods ? src.mods.shield : 0)));
  const before = t.shield;
  t.shield = Math.min(Math.round(t.maxHp * cap), Math.max(t.shield, 0) + a);
  const gained = t.shield - before;
  if (src && B.st[src.uid]) B.st[src.uid].shield += gained;
  if (gained > 0) { HOOK.float(t, '+' + gained + ' 🛡', 'shield'); HOOK.sfx('shield'); }
  return gained;
}
function revive(u, pct) {
  u.alive = true; u.hp = Math.max(1, Math.round(u.maxHp * pct)); u.shield = 0;
  u.statuses = u.statuses.filter(s => STATUS[s.key].fixed && s.key !== 'terrified');
  u.gauge = 10000;
  HOOK.float(u, '✚ REVIVED', 'heal');
}

/* ---------- attack helper with fx + guard + counters ---------- */
async function strike(u, t, mult, o = {}) {
  if (!isUp(t) || !isUp(u)) return null;
  if (t.side !== u.side && !o.aoe) t = interceptFor(t, u);
  await HOOK.fx(o.fx || 'slash', { src: u, tgt: t, color: o.color || u.color, i: o.i || 0 });
  const r = resolveHit(u, t, mult, o);
  if (r && !r.miss && !r.blocked && o.status) applyOnHit(u, t, o.status);
  const foeHit = r && t.isHero && t.side !== u.side && isUp(t) && isUp(u) && !o.noCounter;
  if (foeHit && t.id === 'daniel' && !r.miss && (r.blocked || rnd() < (bt(t, 'counter') || 0.32))) {
    await wait(140);
    HOOK.float(t, '🤺 RIPOSTE', 'special');
    await HOOK.fx('rapier', { src: t, tgt: u, color: '#ffe066' });
    resolveHit(t, u, bt(t, 'ripMult') || 1.15, { sure: true, noCounter: true, critBonus: 0.25 });
  }
  const blCh = t.id === 'harry' ? (bt(t, 'backlash') || 0) + (has(t, 'unsealed') ? 0.4 : 0) : 0;
  if (foeHit && blCh > 0 && t.flags.blTurn !== B.turn && (r.miss || rnd() < blCh)) {
    t.flags.blTurn = B.turn;
    await wait(140);
    HOOK.float(t, '✊ BACKLASH', 'special');
    t.flags.glow = true; HOOK.update();
    await HOOK.fx('crush', { src: t, tgt: u, quick: true });
    resolveHit(t, u, 1.4, { pierce: 1, sure: true, noCounter: true });
    t.flags.glow = false;
  }
  if (r) r.target = t;
  return r;
}
const hitOK = r => r && !r.miss && !r.blocked;
/* The jester deals one of these at random. Every card helps the whole team, so the gamble is
   which kind of help arrives, never whether any arrives at all. */
const WILDCARD = {
  hearts:   { face: '♥ HEARTS',   what: 'the team is healed' },
  spades:   { face: '♠ SPADES',   what: 'the team sharpens' },
  clubs:    { face: '♣ CLUBS',    what: 'the team is shielded' },
  diamonds: { face: '♦ DIAMONDS', what: 'the coffers open' },
  joker:    { face: '🃏 THE JOKER', what: 'all four at once, at half' }
};

/* ---------- battle setup ---------- */
function activeSynergies(team) { return SYNERGIES.filter(s => s.test(team)); }

function setupBattle(cfg) {
  for (const k of Object.keys(B)) delete B[k];
  Object.assign(B, { id: ++BATTLE_ID, players: [], enemies: [], units: [], sp: 3, spMax: 5, turn: 0, actor: null, over: false, result: null, kos: 0, st: {}, cfg, auto: !!cfg.auto });
  cfg.team.forEach((id, i) => {
    const u = makeUnit(id, 'player', i, { build: (cfg.builds || {})[id] });
    const m = u.build && u.build.mods; if (m) for (const k in m) u.mods[k] += m[k];
    B.players.push(u);
  });
  cfg.enemies.forEach((e, i) => {
    const u = makeUnit(e.id, 'enemy', i, e);
    const m = u.build && u.build.mods; if (m) for (const k in m) u.mods[k] += m[k];
    B.enemies.push(u);
  });
  B.spE = 3; B.spMaxE = 5;
  B.slots = Math.max(cfg.enemies.length, 1);
  B.synergies = activeSynergies(cfg.team);
  B.synergies.forEach(s => s.apply(B.players, B));
  const eh = B.enemies.filter(e => e.isHero);
  B.enemySynergies = eh.length ? activeSynergies(eh.map(e => e.id)) : [];
  B.enemySynergies.forEach(s => s.apply(eh, B));
  if (B.startSpE) B.spE = B.startSpE;
  (cfg.boons || []).forEach(b => { if (BOONS[b].apply) BOONS[b].apply(B.players, B); });
  B.units = [...B.players, ...B.enemies];
  B.units.forEach(finalize);
  B.units.forEach(u => { B.st[u.uid] = newStats(); });
  B.sp = Math.min(B.spMax, (B.startSp || 3) + (B.bonusSp || 0));
  if (cfg.carry) B.players.forEach(p => { const c = cfg.carry[p.id]; if (c) { p.hp = Math.max(1, Math.round(p.maxHp * c.hp)); p.ult = Math.max(p.ult, c.ult || 0); } });
  if (B.headStart) B.players.forEach(p => { p.gauge = 4000; });
  for (const u of B.units) battleStart(u);
}
function battleStart(u) {
  if (u.isHero) {
    if (u.id === 'lachlan') { u.shield = Math.round(u.maxHp * lachCap(u)); addStatus(u, 'stance', 99, { value: 'close', silent: true }); }
    if (u.id === 'harry') u.flags.cheat = true;
    if (u.id === 'alfred') shiftTempo(u, true);
    if (u.id === 'malakai') addStatus(u, 'mixture', 99, { value: 0, silent: true });
    if (u.id === 'isaac') addStatus(u, 'invisible', 99, { silent: true });
    if (u.id === 'yunze' && u.flags.oldestDebt) u.flags.cheat = true;
    if (u.id === 'peguicha') { u.flags.beadMax = bt(u, 'beads') || 5; u.flags.beads = u.flags.beadMax; syncBeads(u); }
    if (u.id === 'gemia' && B.units.some(x => x !== u && x.heroId === 'yunze')) addStatus(u, 'terrified', 99, { silent: true });
    if (u.id === 'vasco' && u.flags.startVessel) { u.flags.vessel = true; addStatus(u, 'vessel', 99, { silent: true }); }
    if (u.flags.wallShield) u.shield += Math.round(u.maxHp * 0.1);
  } else {
    if (u.id === 'elphiBoss' && B.enemies.some(x => x.id === 'wisp')) addStatus(u, 'warded', 99, { silent: true });
    if (u.id === 'ironWarden') addStatus(u, 'plated', 99, { stacks: 10, silent: true });
    if (u.heroId === 'gemia') { /* not used */ }
  }
}
const lachCap = u => bt(u, 'shieldCap') || 0.25;
function checkEnd() {
  if (!B.enemies.some(isUp)) return 'win';
  if (!B.players.some(p => isUp(p) && p.isHero)) return 'lose';
  return null;
}

/* ---------- turn order ---------- */
function nextActor() {
  const up = B.units.filter(isUp);
  let best = null, bt = Infinity;
  for (const u of up) { const t = u.gauge / stat(u, 'spd'); if (t < bt - 1e-9) { bt = t; best = u; } }
  for (const u of up) u.gauge -= stat(u, 'spd') * bt;
  best.gauge = 0;
  return best;
}
function turnOrder(n) {
  const arr = B.units.filter(isUp).map(u => ({ u, g: u.gauge, s: stat(u, 'spd') }));
  const out = [];
  if (B.actor && isUp(B.actor)) {
    out.push(B.actor);
    const a = arr.find(x => x.u === B.actor);
    if (a) a.g = 10000 * (1 - (B.actor.flags.advance || 0));
  }
  let guard = 0;
  while (out.length < n && arr.length && guard++ < 100) {
    let best = null, bt = Infinity;
    for (const x of arr) { const t = x.g / x.s; if (t < bt - 1e-9) { bt = t; best = x; } }
    for (const x of arr) x.g -= x.s * bt;
    out.push(best.u); best.g = 10000;
  }
  return out;
}

/* ---------- turn start / end ---------- */
async function turnStart(u) {
  for (const st of [...u.statuses]) {
    const d = STATUS[st.key];
    if (d.dot && isUp(u)) {
      let amt = (st.dot || 40) * (st.stacks || 1);
      if (st.src && st.src.flags && st.src.flags.storm && (st.key === 'burn' || st.key === 'shock')) amt *= 1.3;
      await HOOK.fx('dot', { tgt: u, color: d.color, key: st.key });
      const dr = applyDamage(u, Math.max(1, Math.round(amt)), { src: st.src, dot: true, cls: st.key });
      if (st.key === 'cinder' && st.src && isUp(st.src) && dr && dr.dmg) heal(st.src, st.src, dr.dmg * 0.3, { tick: true, noCrit: true });
      HOOK.sfx('dot');
      HOOK.update();
      await wait(320);
    }
  }
  if (!isUp(u)) return;
  if (u.isHero && u.id === 'seraphine' && !has(u, 'taunt')) {
    removeStatus(u, 'hidden');
    u.flags.veilTurn = (u.flags.veilTurn || 0) + 1;
    const every = bt(u, 'hideEvery') || 3;
    if (u.flags.veilTurn % every === 0 && sideList(u).some(x => x !== u && isUp(x) && x.isHero)) {
      addStatus(u, 'hidden', 1, { silent: true });
      HOOK.float(u, '🕯 OUT OF SIGHT', 'buff');
    }
  }
  const rg = getSt(u, 'regen');
  if (rg) heal(rg.src || u, u, u.maxHp * (rg.value || 0.05), { noCrit: true, tick: true });
  if (u.isHero && u.id === 'angus') heal(u, u, u.maxHp * 0.03);
  if (u.isHero && u.id === 'ephraim') {
    rageCheck(u);
    const m = has(u, 'rabid') ? 0.07 : has(u, 'riled') ? 0.05 : 0;
    if (m) heal(u, u, u.maxHp * m * (bt(u, 'rageMend') || 1) * (u.flags.kennel ? 1.33 : 1), { noCrit: true });
  }
  // Mended far enough, he puts himself back together at the start of his own turn.
  if (u.isHero && u.id === 'hbenjamin' && has(u, 'corpse') && u.hp >= u.maxHp * riseAt(u)) riseBenjamin(u, u.hp / u.maxHp);
  u.flags.delayed = false;
  if (u.isHero && u.id === 'ethan' && spOf(u) < (bt(u, 'treasuryBelow') || 3)) { addSp(u, 1); HOOK.float(u, '💰 +1 SP', 'buff'); }
  const sg = getSt(u, 'song'); if (sg) { cleanse(u, 1); heal(sg.src || u, u, u.maxHp * (sg.value || 0.06), { tick: true, noCrit: true }); }
  if (has(u, 'stone')) { heal(u, u, u.maxHp * 0.09, { noCrit: true }); HOOK.float(u, '🗿 Stone mends', 'buff'); }
  if (u.isHero && u.id === 'lachlan') {
    const cap = Math.round(u.maxHp * lachCap(u));
    if (u.shield < cap) { const g = Math.min(cap - u.shield, Math.round(u.maxHp * (bt(u, 'shieldRegen') || 0.05))); u.shield += g; HOOK.float(u, '+' + g + ' 🛡', 'shield'); }
  }
  if (has(u, 'stun')) { removeStatus(u, 'stun'); u.flags.skip = true; }
}
function turnEnd(u) {
  for (const st of u.statuses) { if (st.fresh) { st.fresh = false; continue; } if (st.turns < 99) st.turns--; }
  u.statuses = u.statuses.filter(s => s.turns > 0);
  u.gauge = 10000 * (1 - (u.flags.advance || 0));
  u.flags.advance = 0;
  if (u.flags.skillCd > 0) u.flags.skillCd--;
}

/* ---------- deaths and phases ---------- */
async function processDeaths() {
  let changed = true, guard = 0;
  while (changed && guard++ < 12) {
    changed = false;
    for (const u of [...B.units]) {
      if (isUp(u) && u.def.half && !u.flags.half && hpPct(u) <= 0.5) {
        u.flags.half = true;
        await HOOK.banner(u.def.half.title, u.def.half.sub, u.color, 'phase', u);
        u.def.half.run(u);
        HOOK.update();
        changed = true;
      }
      if (u.alive && u.hp <= 0) {
        if (u.def.phase2 && !u.flags.phase2) { u.flags.phase2 = true; await phaseTwo(u); changed = true; continue; }
        if (u.isHero && u.id === 'elphi' && !u.flags.secondLife) { u.flags.secondLife = true; await secondLight(u); changed = true; continue; }
        if (u.side === 'player' && B.phoenix) {
          B.phoenix = false;
          await HOOK.ko(u);
          await wait(350);
          revive(u, 0.3);
          HOOK.float(u, '🪶 PHOENIX ASH', 'special');
          await HOOK.revive(u);
          changed = true; continue;
        }
        returnBeads(u);
        const sk = getSt(u, 'shock');
        if (sk && sk.src && sk.src.isHero && sk.src.id === 'flynn') {
          const next = foesOf(sk.src).filter(x => x !== u && !has(x, 'shock'))[0] || foesOf(sk.src).find(x => x !== u);
          if (next) { await HOOK.fx('bolt', { src: u, tgt: next, color: '#9fe6ff', chain: true }); addStatus(next, 'shock', 2, { stacks: sk.stacks, dot: sk.dot, src: sk.src }); HOOK.float(next, '⚡ ARCED', 'debuff'); }
        }
        u.alive = false; u.statuses = []; u.shield = 0; u.intents = [];
        if (u.side === 'player' && u.isHero) B.kos++;
        tally(u, 'falls');
        HOOK.log(`${u.name} falls.`, 'ko');
        HOOK.sfx('ko');
        await HOOK.ko(u);
        if (u.creature) {
          const ow = u.owner;
          if (ow && isUp(ow) && bt(ow, 'deathBurst')) { await HOOK.fx('hellgate', { src: u, tgts: foesOf(ow) }); for (const e of foesOf(ow)) resolveHit(ow, e, bt(ow, 'deathBurst'), { aoe: true, sure: true }); }
          creditCreature(u);
          const L = sideList(u), ix = L.indexOf(u); if (ix >= 0) L.splice(ix, 1);
          B.units = [...B.players, ...B.enemies]; HOOK.rebuild();
        }
        if (u.isHero && u.id === 'trigg') for (const c of sideList(u).filter(x => x.owner === u && isUp(x))) { c.hp = 0; HOOK.float(c, 'crumbles', 'info'); changed = true; }
        if (u.def.onDeath === 'explode') {
          const ts = foesOf(u);
          HOOK.float(u, '💥 BURSTS', 'special');
          await HOOK.fx('explode', { src: u, tgt: u, tgts: ts });
          ts.forEach(x => resolveHit(u, x, 0.6, { canMiss: false, noCrit: true }));
          HOOK.update();
          await wait(250);
        }
        changed = true;
      }
    }
    for (const e of B.enemies) {
      if (isUp(e) && has(e, 'warded') && !B.enemies.some(w => isUp(w) && w.id === 'wisp')) {
        removeStatus(e, 'warded');
        HOOK.float(e, 'WARD SHATTERED', 'special');
        HOOK.sfx('break');
      }
    }
  }
  HOOK.update();
}
/* Elphi rises once per battle with a fraction of the health and a great deal more fight. */
async function secondLight(u) {
  await HOOK.ko(u);
  await wait(300);
  u.alive = true;
  u.maxHp = Math.max(1, Math.round(u.maxHp * (bt(u, 'riseHp') || 0.3)));
  u.hp = u.maxHp;
  u.shield = 0;
  u.statuses = u.statuses.filter(s => STATUS[s.key].fixed && s.key !== 'terrified');
  u.gauge = 10000;
  addStatus(u, 'determined', 99, { silent: true });
  HOOK.float(u, '🔆 HE RISES', 'special');
  HOOK.log(`${u.name} will not stay down.`, 'p');
  HOOK.update();
  await HOOK.revive(u);
  await HOOK.banner('He will not fall', 'Less left to lose, and far more will to spend', '#fff2a8', 'phase', u);
}
async function phaseTwo(u) {
  u.hp = Math.round(u.maxHp * 0.55);
  u.statuses = u.statuses.filter(s => STATUS[s.key].type === 'buff');
  u.flags.glow = true; u.cd = {};
  addStatus(u, 'unbound', 99, { silent: true });
  HOOK.update();
  await HOOK.banner(u.def.phase2.title, u.def.phase2.sub, '#3dff9a', 'phase', u);
  planIntents(u);
  HOOK.update();
}

/* ---------- hero kits ---------- */
const toggleStance = u => { const s = getSt(u, 'stance'); if (s) { s.value = s.value === 'far' ? 'close' : 'far'; HOOK.float(u, statusLabel('stance', 0, s), 'buff'); } };
const KIT = {
  trigg: {
    async basic(u, t) { await strike(u, t, 0.95, { fx: 'lash' }); },
    async skill(u) {
      const cap = bt(u, 'creatureCap') || 2, mine = creaturesOf(u);
      if (mine.length < cap) { await HOOK.fx('summon', { src: u, color: '#e0502a' }); summonCreature(u, 'imp'); }
      else { await HOOK.fx('heal', { tgts: mine }); for (const c of mine) heal(u, c, c.maxHp * 0.25, { noCrit: true }); }
    },
    async ult(u) {
      const mine = creaturesOf(u);
      if (mine.length) {
        await HOOK.fx('hellgate', { src: u, tgts: foesOf(u) });
        for (const c of mine) { for (const e of foesOf(u)) resolveHit(u, e, 1.1, { aoe: true, sure: true }); c.hp = 0; HOOK.float(c, '🔥 BURSTS', 'special'); }
        await processDeaths();
      }
      if (!isUp(u)) return;
      await HOOK.fx('summon', { src: u, color: '#ff6a2a' });
      const hd = summonCreature(u, 'hellhound'); addStatus(hd, 'taunt', 1);
    }
  },
  alfred: {
    async basic(u, t) {
      const fc = u.flags.frameCrit === t.uid && has(t, 'framed');
      await strike(u, t, 1.12 * tempoMult(u), { fx: 'katana', forceCrit: fc, acc: 0.05, ...tempoOpts(u) });
      if (fc) u.flags.frameCrit = null;
    },
    async skill(u, t) {
      await HOOK.fx('frame', { src: u, tgt: t });
      resolveHit(u, t, 0.95 * tempoMult(u), { acc: 0.1 });
      if (isUp(t)) { addStatus(t, 'framed', bt(u, 'frameTurns') || 2, { src: u }); u.flags.frameCrit = t.uid; HOOK.float(t, '👌 FRAMED', 'debuff'); }
    },
    async ult(u) {
      const w = bt(u, 'wild');
      const tempos = [w ? 0.9 : 0.8, 1, w ? 1.55 : 1.3];
      for (let i = 0; i < 6; i++) {
        const f = foesOf(u); if (!f.length) break;
        const fr = f.filter(e => has(e, 'framed'));
        const e = fr.length && rnd() < 0.6 ? pick(fr) : pick(f);
        await HOOK.fx('dash', { src: u, tgt: e, i });
        resolveHit(u, e, 0.75 * tempos[i % 3], { aoe: true, acc: 0.1, forceCrit: has(e, 'framed') });
        HOOK.update();
      }
    }
  },
  ethan: {
    async basic(u, t) { await strike(u, t, 1.15, { fx: 'slash' }); },
    async skill(u) {
      const turns = u.flags.counsel ? 3 : 2, sp = bt(u, 'decreeSpd') || 0.1;
      await HOOK.fx('decree', { src: u, tgts: friendsOf(u) });
      for (const a of friendsOf(u)) { addStatus(a, 'atkUp', turns, { value: bt(u, 'decreeAtk') || 0.2 }); if (sp > 0.01) addStatus(a, 'spdUp', turns, { value: sp }); }
    },
    async ult(u) {
      await HOOK.fx('shelter', { src: u, tgts: friendsOf(u) });
      for (const a of friendsOf(u)) { addShield(u, a, u.maxHp * (bt(u, 'shelter') || 0.15)); cleanse(a); for (const st of a.statuses) if (STATUS[st.key].type === 'buff' && st.turns < 99) st.turns++; }
      addSp(u, 2); HOOK.float(u, '💰 +2 SP', 'buff');
    }
  },
  ben: {
    async basic(u, t) { await strike(u, t, bt(u, 'wordMult') || 1.35, { fx: 'quill' }); if (isUp(t)) delayUnit(t, bt(u, 'wordDelay') || 0.2); },
    async skill(u, t) {
      await HOOK.fx('order', { src: u, tgt: t });
      t.gauge = 0; addStatus(t, 'atkUp', 1, { value: bt(u, 'orderAtk') || 0.2 }); if (t.isHero) t.ult = Math.min(100, t.ult + 20);
      if (u.flags.counsel) addSp(u, 1);
      HOOK.float(t, '☝️ ORDERED', 'buff');
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('decision', { src: u, tgts: f });
      for (const e of f) { delayUnit(e, e.def.boss ? 0.2 : 0.4); addStatus(e, 'atkDown', 2, { value: 0.2 }); }
      const top = f.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a), f[0]);
      if (top) addStatus(top, 'exposed', 2);
    }
  },
  kingsley: {
    async basic(u, t) {
      await strike(u, t, 0.95, { fx: 'note' });
      const l = lowest(friendsOf(u)); if (l) { addStatus(l, 'song', 2, { src: u, value: bt(u, 'songHeal') || 0.07 }); HOOK.fx('song', { tgts: [l] }); }
    },
    async skill(u) {
      const k = (bt(u, 'trinket') || 1) * (u.flags.borrowed ? 1.25 : 1);
      const item = pick(['lantern', 'mirror', 'bell', 'spark', 'dice']);
      HOOK.float(u, { lantern: '🏮 LANTERN', mirror: '🪞 MIRROR CHARM', bell: '🔔 JESTER\'S BELL', spark: '🎆 SPARK BOX', dice: '🎲 LOADED DICE' }[item], 'special');
      await HOOK.fx('trinket', { src: u, item, tgts: (item === 'lantern' || item === 'dice') ? friendsOf(u) : foesOf(u) });
      if (item === 'lantern') { for (const a of friendsOf(u)) heal(u, a, a.maxHp * 0.14 * k); HOOK.sfx('heal'); }
      else if (item === 'mirror') { const l = lowest(friendsOf(u)); if (l) addShield(u, l, u.maxHp * 0.22 * k); }
      else if (item === 'bell') { const f = foesOf(u); for (const e of f) addStatus(e, 'blind', 1); const e = pick(f); if (e && rnd() < Math.min(1, 0.5 * k)) addStatus(e, 'stun', 1); }
      else if (item === 'dice') { addSp(u, 2); HOOK.float(u, '🔷 +2 SP', 'buff'); for (const a of friendsOf(u)) addStatus(a, 'critUp', 2, { value: 0.12 * k }); }
      else { for (const e of foesOf(u)) resolveHit(u, e, 0.75 * k, { aoe: true }); }
    },
    async ult(u) {
      await HOOK.fx('blessing', { tgts: friendsOf(u), color: '#7ad06a' });
      for (const a of friendsOf(u)) { addStatus(a, 'song', 3, { src: u, value: bt(u, 'songHeal') || 0.07 }); addStatus(a, 'spdUp', 2, { value: 0.15 }); cleanse(a); }
    }
  },
  vasco: {
    async basic(u, t) {
      if (has(u, 'vessel')) { await strike(u, t, 1.15, { fx: 'hellmark', status: { key: 'burn', turns: 2, dot: 0.3 } }); return; }
      const r = await strike(u, t, 1.3, { fx: 'cards' });
      const n = bt(u, 'noTrick') ? 0 : (bt(u, 'doubleTrick') ? 3 : 2);
      if (hitOK(r) && isUp(t) && n) for (const k of shuffle(['blind', 'atkDown', 'spdDown']).slice(0, n)) addStatus(t, k, 3, { value: 0.25 });
    },
    async skill(u, t) {
      if (has(u, 'vessel')) {
        const f = foesOf(u);
        await HOOK.fx('curtain', { src: u, tgts: f });
        for (const e of f) {
          const r = resolveHit(u, e, 0.82, { aoe: true, acc: 0.05 });
          if (hitOK(r) && isUp(e)) stripBuffs(e);
        }
        return;
      }
      const joker = rnd() < (bt(u, 'jokerCh') || 0.1);
      const f = joker ? 0.45 : 1;
      const card = joker ? 'joker' : pick(['hearts', 'spades', 'clubs', 'diamonds']);
      const mates = friendsOf(u);
      HOOK.float(u, WILDCARD[card].face, 'special');
      HOOK.log(`${u.name} deals ${WILDCARD[card].face.toLowerCase()}: ${WILDCARD[card].what}.`, 'p');
      await HOOK.fx('wildcard', { src: u, card, tgts: mates });
      if (card === 'hearts' || joker) { for (const a of mates) heal(u, a, a.maxHp * 0.13 * f); HOOK.sfx('heal'); }
      if (card === 'spades' || joker) for (const a of mates) addStatus(a, 'atkUp', 2, { value: 0.22 * f });
      if (card === 'clubs' || joker) for (const a of mates) addShield(u, a, u.maxHp * 0.14 * f);
      if (card === 'diamonds' || joker) { addSp(u, 2); gainUlt(u, 35); HOOK.float(u, '🔷 +2 SP', 'buff'); }
    },
    async ult(u) {
      await HOOK.fx('curtain', { src: u, tgts: foesOf(u) });
      if (has(u, 'vessel')) await sleepVessel(u); else await wakeVessel(u);
      /* A full turn that deals nothing cannot compete with the 200% to 300% ultimate every other
         hero fires, so changing face does not really cost him a turn: he acts again at once with
         the kit he has just picked up. */
      u.flags.advance = 1;
      HOOK.float(u, '⏩ HE ACTS AGAIN AT ONCE', 'buff');
      HOOK.update();
    }
  },
  aamay: {
    async basic(u, t) { const r = await strike(u, t, 0.85, { fx: 'ink' }); if (hitOK(r) && isUp(t) && rnd() < (bt(u, 'flickCh') || 0.3)) silence(t, 1); },
    async skill(u, t) {
      await HOOK.fx('seal', { src: u, tgt: t });
      resolveHit(u, t, 0.55, { acc: 0.1 });
      if (isUp(t)) { silence(t, t.def.boss ? 1 : (bt(u, 'sealTurns') || 2)); addStatus(t, 'spdDown', 3, { value: 0.3 }); addStatus(t, 'atkDown', 3, { value: 0.2 }); }
    },
    async ult(u) {
      const pg = getSt(u, 'pages'), n = pg ? pg.stacks : 0;
      removeStatus(u, 'pages');
      const f = foesOf(u);
      await HOOK.fx('lastpage', { src: u, tgts: f, n });
      for (const e of f) { resolveHit(u, e, Math.max(0.4, (bt(u, 'pageMult') || 0.15) * n), { aoe: true, sure: true }); if (isUp(e)) silence(e, 1); }
      HOOK.float(u, `📖 ${n} PAGES`, 'special');
    }
  },
  peguicha: {
    async basic(u, t) { const n = bt(u, 'reapHits') || 2; for (let i = 0; i < n; i++) { if (!isUp(t)) break; await strike(u, t, bt(u, 'reapMult') || 0.78, { fx: 'scythe', i }); } },
    async skill(u, t) {
      await HOOK.fx('cinderbead', { src: u, tgt: t });
      const r = resolveHit(u, t, 1.0, { acc: 0.05 });
      const cap = bt(u, 'beadMax') || 3, cur = getSt(t, 'cinder');
      if (hitOK(r) && isUp(t) && (!cur || cur.stacks < cap) && u.flags.beads > 0) {
        u.flags.beads--; syncBeads(u);
        addStatus(t, 'cinder', 99, { stacks: 1, dot: 0.38 * stat(u, 'atk') * (1 + u.mods.dot), src: u });
        const c2 = getSt(t, 'cinder'); if (c2 && c2.stacks > cap) c2.stacks = cap;
        HOOK.float(t, '📿 EMBEDDED', 'debuff');
      }
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('hellfire', { src: u, tgts: f });
      for (const e of f) {
        const c = getSt(e, 'cinder'), n = c ? c.stacks : 0;
        const r = resolveHit(u, e, 2.1 + (bt(u, 'ignite') || 0.5) * n, { aoe: true, sure: true });
        if (hitOK(r)) addStatus(e, 'burn', 2, { stacks: 1, dot: 0.25 * stat(u, 'atk') * (1 + u.mods.dot), src: u });
        if (n) { returnBeads(e); removeStatus(e, 'cinder'); HOOK.float(e, `🔥 IGNITED ×${n}`, 'special'); }
      }
    }
  },
  vehra: {
    async basic(u, t) {
      const r = await strike(u, t, 1.1, { fx: 'rend', status: { key: 'bleed', turns: 2, chance: 0.4, dot: 0.22 } });
      if (hitOK(r) && r.dmg) heal(u, u, r.dmg * (bt(u, 'lifesteal') || 0.2), { noCrit: true });
      if (isUp(u)) { addStatus(u, 'aloft', 1, { silent: true }); HOOK.float(u, '🦇 ALOFT', 'buff'); }
    },
    async skill(u) {
      await HOOK.fx('stone', { src: u, tgt: u });
      removeStatus(u, 'aloft');
      addStatus(u, 'stone', 1); addStatus(u, 'taunt', 1);
      if (bt(u, 'stoneShield')) addShield(u, u, u.maxHp * bt(u, 'stoneShield'));
      HOOK.float(u, '🗿 STONE FORM', 'buff');
    },
    async ult(u, t) {
      const others = foesOf(u).filter(e => e !== t);
      await HOOK.fx('stonewing', { src: u, tgt: t, tgts: [t, ...others] });
      const r = resolveHit(u, t, 2.2, { sure: true });
      if (hitOK(r) && isUp(t) && rnd() < 0.5) addStatus(t, 'stun', 1);
      for (const o of others) resolveHit(u, o, 0.8, { aoe: true });
      for (const a of friendsOf(u)) heal(u, a, a.maxHp * 0.08, { noCrit: true });
      HOOK.sfx('heal');
      if (isUp(u)) addStatus(u, 'aloft', 1, { silent: true });
    }
  },
  soham: {
    async basic(u, t) { await strike(u, t, bt(u, 'palmMult') || 1.0, { fx: 'palm' }); },
    async skill(u, t) {
      const m = bt(u, 'hexMult') || 1;
      if (t === u && !aloneHero(u)) {
        await HOOK.fx('hexraise', { src: u, tgts: friendsOf(u) });
        for (const a of friendsOf(u)) giveHex(u, a, u.maxHp * (bt(u, 'teamHex') || 0.1) * m, 2);
        HOOK.float(u, '⬡ HEX WALL', 'buff');
      } else {
        await HOOK.fx('hexsingle', { src: u, tgt: t });
        giveHex(u, t, u.maxHp * (bt(u, 'singleHex') || 0.29) * m, bt(u, 'singleHits') || 3);
      }
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('hexcrush', { src: u, tgts: f });
      for (const e of f) { const r = resolveHit(u, e, 1.7, { aoe: true }); if (hitOK(r) && rnd() < 0.35) addStatus(e, 'stun', 1); }
      for (const a of friendsOf(u)) giveHex(u, a, u.maxHp * 0.13 * (bt(u, 'hexMult') || 1), 2);
    }
  },
  seraphine: {
    async basic(u, t) {
      const r = await strike(u, t, 1.0, { fx: 'halo' });
      if (hitOK(r) && isUp(t)) { await HOOK.fx('severmark', { src: u, tgt: t, n: 1 }); addStatus(t, 'sever', 99, { stacks: 1 }); }
    },
    async skill(u, t) {
      await HOOK.fx('orbit', { src: u, tgt: t });
      const r = resolveHit(u, t, 0.8, { acc: 0.05 });
      if (hitOK(r) && isUp(t)) { await HOOK.fx('severmark', { src: u, tgt: t, n: 2 }); addStatus(t, 'sever', 99, { stacks: 2 }); }
      if (hitOK(r) && isUp(t)) addStatus(t, 'encircled', 2, { dot: 0.6 * stat(u, 'atk') * (1 + u.mods.dot), src: u });
    },
    async ult(u) {
      for (let i = 0; i < 8; i++) {
        const f = foesOf(u); if (!f.length) break;
        const enc = f.filter(e => has(e, 'encircled'));
        const e = enc.length && rnd() < 0.6 ? pick(enc) : pick(f);
        await HOOK.fx('halo', { src: u, tgt: e, i, quick: true });
        resolveHit(u, e, 0.45, { aoe: true, acc: 0.1 });
        HOOK.update();
      }
      for (const e of foesOf(u)) { const sv = getSt(e, 'sever'); if (sv) { removeStatus(e, 'sever'); await HOOK.fx('sever', { tgt: e, n: sv.stacks }); resolveHit(u, e, 0.3 * sv.stacks, { aoe: true, sure: true }); HOOK.float(e, `✂ SEVERED ×${sv.stacks}`, 'special'); } }
      let puppet = friendsOf(u).find(a => a.isHero && a.id === 'chosen');
      if (!puppet && bt(u, 'anyPuppet')) puppet = friendsOf(u).filter(a => a !== u).sort((a, b) => stat(b, 'atk') - stat(a, 'atk'))[0];
      if (puppet) {
        await HOOK.fx('hiddenhand', { src: u, tgt: puppet });
        puppet.gauge = 0; HOOK.float(puppet, '🎭 HIDDEN HAND', 'special');
        HOOK.log(`${puppet.name} moves at Seraphine's word.`, 'i');
      }
    }
  },
  angus: {
    async basic(u, t) { await strike(u, t, bt(u, 'basicMult') || 1.3, { fx: 'slash' }); },
    async skill(u) {
      await HOOK.fx('aura', { tgt: u, color: '#ff9a3c' });
      addStatus(u, 'taunt', bt(u, 'tauntTurns') || 2); addShield(u, u, u.maxHp * 0.12); addStatus(u, 'defUp', 2, { value: 0.2 });
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('quake', { src: u, tgts: f, color: '#ff9a3c' });
      for (const e of f) resolveHit(u, e, 1.6, { aoe: true });
      addStatus(u, 'undying', 2); addStatus(u, 'spent', 4);
      for (const a of friendsOf(u)) addStatus(a, 'defUp', 2, { value: 0.25 });
    }
  },
  flynn: {
    async basic(u, t) { await strike(u, t, 1.0, { fx: 'bolt', acc: 0.05, status: { key: 'shock', turns: 2, chance: bt(u, 'sureShock') ? 1 : (bt(u, 'shockCh') || 0.5), dot: 0.3 } }); },
    async skill(u, t) {
      const r = await strike(u, t, 1.2, { fx: 'bolt', acc: 0.05, status: { key: 'shock', turns: 2, dot: 0.3 } });
      let prev = (r && r.target) || t;
      const others = shuffle(foesOf(u).filter(e => e !== prev)).slice(0, 2);
      for (const o of others) {
        await HOOK.fx('bolt', { src: prev, tgt: o, color: '#9fe6ff', chain: true });
        const rr = resolveHit(u, o, bt(u, 'arcMult') || 0.6, { aoe: true, acc: 0.05 });
        if (hitOK(rr)) applyOnHit(u, o, { key: 'shock', turns: 2, dot: 0.3 });
        prev = o;
      }
    },
    async ult(u) {
      for (let i = 0; i < 6; i++) {
        const f = foesOf(u); if (!f.length) break;
        const e = pick(f);
        const was = has(e, 'shock');
        await HOOK.fx('skybolt', { tgt: e, color: '#9fe6ff', i });
        const r = resolveHit(u, e, 0.65, { aoe: true, acc: 0.1 });
        if (hitOK(r)) { applyOnHit(u, e, { key: 'shock', turns: 2, dot: 0.3 }); if (was && rnd() < 0.25) addStatus(e, 'stun', 1); }
        HOOK.update();
        await wait(60);
      }
    }
  },
  leo: {
    async basic(u, t) { await strike(u, t, 1.0, { fx: 'fireball', status: bt(u, 'noBoltBurn') ? null : { key: 'burn', turns: 2, dot: 0.25 } }); },
    async skill(u, t) {
      const c = chanOf(u), ramp = beamRamp(u);
      const burn = { key: 'burn', turns: 2, dot: 0.25, stacks: bt(u, 'beamBurn') || 1 };
      if (c && isUp(c.target)) {
        const stage = Math.min(ramp.length, c.value + 1);
        c.value = stage; c.taken = 0;
        t = c.target;
        await HOOK.fx('beam', { src: u, tgt: t, tgts: [t], color: '#ff7a2f', stage });
        const r = resolveHit(u, t, ramp[stage - 1], { acc: 0.1 });
        if (hitOK(r)) applyOnHit(u, t, burn);
        HOOK.float(u, `🔥 BEAM ×${stage}`, 'buff');
      } else {
        const others = foesOf(u).filter(e => e !== t);
        await HOOK.fx('beam', { src: u, tgt: t, tgts: [t, ...others], color: '#ff7a2f', stage: 1 });
        const r = resolveHit(u, t, ramp[0], { acc: 0.1 });
        if (hitOK(r)) applyOnHit(u, t, burn);
        for (const o of others) resolveHit(u, o, bt(u, 'beamSide') || 0.5, { aoe: true });
        if (isUp(t) && isUp(u)) { addStatus(u, 'channel', 99, { value: 1, silent: true }); const st = chanOf(u); if (st) { st.target = t; st.taken = 0; HOOK.float(u, '🔥 CHANNELLING', 'buff'); } }
      }
      if (!isUp(t)) endChannel(u, 'target');
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('inferno', { src: u, tgts: f, color: '#ff7a2f' });
      for (const e of f) { const r = resolveHit(u, e, 1.9, { aoe: true, sure: true }); if (hitOK(r)) addStatus(e, 'burn', 3, { stacks: bt(u, 'infernoStacks') || 2, dot: 0.25 * stat(u, 'atk') * (1 + u.mods.dot), src: u }); }
    }
  },
  harry: {
    async basic(u, t) { await strike(u, t, 0.92, { fx: 'katana', pierce: 0.3 }); },
    async skill(u, t) {
      u.flags.glow = true; HOOK.update();
      await HOOK.fx('crush', { src: u, tgt: t });
      const r = resolveHit(u, t, bt(u, 'crushMult') || 1.45, { pierce: 1, sure: true });
      if (hitOK(r)) applyOnHit(u, t, { key: 'bleed', turns: 2, dot: 0.3 });
      await wait(250);
      u.flags.glow = false;
    },
    async ult(u) {
      u.flags.glow = true; HOOK.update();
      const f = foesOf(u);
      await HOOK.fx('crushAll', { src: u, tgts: f });
      for (const e of f) resolveHit(u, e, 2.6, { pierce: 1, sure: true, aoe: true });
      HOOK.update();
      await wait(250);
      addStatus(u, 'unsealed', 3);
      u.flags.glow = false;
      HOOK.float(u, '🔓 UNSEALED', 'special');
      await HOOK.banner('Unsealed', 'More damage, far higher crit chance, hard to hit', '#3dff9a', 'phase', u);
    }
  },
  chosen: {
    async basic(u, t) { await strike(u, t, 1.05, { fx: 'lance' }); },
    async skill(u, t) {
      const n = bt(u, 'danceHits') || 3;
      for (let i = 0; i < n; i++) { if (!isUp(t)) break; await strike(u, t, 0.55, { fx: 'lance', i }); }
      addStatus(u, 'grace', 99, { stacks: 1, silent: true });
      if (!bt(u, 'noDanceShield')) { await HOOK.fx('shieldall', { tgts: [u], color: '#ffd56b' }); addShield(u, u, u.maxHp * 0.1); }
    },
    async ult(u, t) {
      const st = getSt(u, 'grace'); const n = st ? st.stacks : 0;
      removeStatus(u, 'grace');
      await HOOK.fx('wings', { src: u, tgt: t, color: '#ffd56b' });
      resolveHit(u, t, 2.6 + (bt(u, 'gracePer') || 0.2) * n, { sure: true });
      HOOK.update();
      await wait(200);
      heal(u, u, u.maxHp * 0.15);
      HOOK.sfx('heal');
    }
  },
  elphi: {
    async basic(u, t) { const r = await strike(u, t, 1.2, { fx: 'lightslash' }); if (hitOK(r)) heal(u, u, r.dmg * 0.15); },
    async skill(u) {
      const f = foesOf(u);
      await HOOK.fx('radiant', { src: u, tgts: f, color: '#fff2a8' });
      for (const e of f) { const r = resolveHit(u, e, bt(u, 'arcMult') || 0.85, { aoe: true }); if (hitOK(r) && rnd() < (bt(u, 'blindCh') || 0.6)) addStatus(e, 'blind', 1); }
    },
    async ult(u, t) {
      await HOOK.fx('giantblade', { src: u, tgt: t, color: '#fff2a8' });
      resolveHit(u, t, 3.0, { sure: true });
      HOOK.update();
      await wait(200);
      await HOOK.fx('shieldall', { tgts: friendsOf(u), color: '#fff2a8' });
      for (const a of friendsOf(u)) addShield(u, a, u.maxHp * (bt(u, 'ultShield') || 0.11));
    }
  },
  daniel: {
    async basic(u, t) { await strike(u, t, 1.1, { fx: 'rapier', acc: 0.05, critBonus: 0.2 }); },
    async skill(u, t) {
      await HOOK.fx('crystalshield', { src: u, tgt: t, color: '#ffe066' });
      addShield(u, t, u.maxHp * 0.14 * (bt(u, 'wardMult') || 1), bt(u, 'wardCap') || 0.35); addStatus(t, 'defUp', 2, { value: 0.15 });
    },
    async ult(u, t) {
      await HOOK.fx('sphere', { tgts: friendsOf(u), color: '#ffe066' });
      for (const a of friendsOf(u)) addStatus(a, 'crystal', 2);
      await strike(u, t, 1.8, { fx: 'crystalbolt', sure: true, status: { key: 'stun', turns: 1 } });
    }
  },
  yunze: {
    async basic(u, t) {
      for (let i = 0; i < 2; i++) { if (!isUp(t)) break; await strike(u, t, 0.4, { fx: 'dagger', i, acc: 0.05 }); }
      if (bt(u, 'basicImage') && rnd() < bt(u, 'basicImage')) addStatus(u, 'afterimage', 2);
    },
    async skill(u, t) {
      await HOOK.fx('phantom', { src: u, tgt: t });
      const r = resolveHit(u, t, 1.25, { critBonus: 0.4, acc: 0.15 });
      if (hitOK(r)) addStatus(t, 'hunted', 2, { value: bt(u, 'hunt') || 0.25, src: u });
      addStatus(u, 'afterimage', 2);
    },
    async ult(u) {
      await HOOK.fx('afterimages', { src: u });
      for (let i = 0; i < 7; i++) {
        const f = foesOf(u); if (!f.length) break;
        const h = f.filter(e => has(e, 'hunted'));
        const e = h.length && rnd() < 0.5 ? pick(h) : pick(f);
        await HOOK.fx('dash', { src: u, tgt: e, i });
        resolveHit(u, e, 0.4, { critBonus: 0.2, aoe: true, acc: 0.1 });
        HOOK.update();
      }
      u.flags.advance = 0.5;
      HOOK.float(u, '⏩ NEXT TURN SOONER', 'buff');
    }
  },
  malakai: {
    async basic(u, t) {
      const m = mixOf(u), phial = { key: m.key, turns: 2, dot: 0.3, value: 0.22 };
      const house = mixSlot(u) === 2;
      const others = foesOf(u).filter(e => e !== t);
      const r = await strike(u, t, 1.0, { fx: 'flask' });
      if (r && hitOK(r)) applyOnHit(u, r.target, phial);
      if (house) {
        HOOK.float(u, '🧪 ON THE HOUSE', 'buff');
        if (others.length) {
          await HOOK.fx('splash', { src: t, tgts: others, color: '#ffb23d' });
          for (const o of others) { resolveHit(u, o, 0.45, { aoe: true, sure: true }); applyOnHit(u, o, phial); }
        }
        addSp(u, 1);
      }
      shiftMix(u);
    },
    async skill(u, t) {
      await HOOK.fx('bargain', { src: u, tgt: t, color: '#ffb23d' });
      if (bt(u, 'freeBargain')) heal(u, t, t.maxHp * (bt(u, 'bargainHeal') || 0.1));
      else { const cost = Math.floor(t.hp * 0.08); if (cost > 0 && t.hp > cost) { t.hp -= cost; HOOK.float(t, '-' + cost + ' price', 'cost'); } }
      /* The transmutation. Whatever ails the ally is sold on to the strongest enemy, so the deal
         reads off the board rather than doing the same thing every time, and the buyer always
         gets the worse end of it. */
      const f = foesOf(u);
      const mark = f.length ? f.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a), f[0]) : null;
      const sold = sellable(t);
      if (mark) {
        await HOOK.fx('transmute', { tgts: [mark], color: '#ffb23d' });
        if (sold.length) {
          for (const s of sold) addStatus(mark, s.key, Math.max(2, s.turns), { value: s.value, dot: s.dot, stacks: s.stacks, src: u });
          HOOK.float(mark, '⚗️ SOLD ON ×' + sold.length, 'debuff');
        } else addStatus(mark, 'poison', 2, { dot: 0.3 * stat(u, 'atk') * (1 + u.mods.dot), src: u });
      }
      if (sold.length) cleanse(t);
      addStatus(t, 'atkUp', 2, { value: bt(u, 'bargainAtk') || 0.3 }); addStatus(t, 'spdUp', 2, { value: 0.2 });
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('transmute', { tgts: [...f, ...friendsOf(u)], color: '#ffb23d' });
      for (const e of f) {
        stripBuffs(e);
        addStatus(e, 'poison', 3, { stacks: 2, dot: 0.35 * stat(u, 'atk') * (1 + u.mods.dot), src: u });
        addStatus(e, 'defDown', 2, { value: 0.3 });
      }
      for (const a of friendsOf(u)) { cleanse(a); heal(u, a, a.maxHp * (bt(u, 'transHeal') || 0.2)); }
      HOOK.sfx('heal');
    }
  },
  /* H. Benjamin. He predates the record and whatever he did to keep himself going is where the
     near-immortality of Harry and Yunze comes from. Withered is the aggressive half: nothing he
     has marked can be mended at all. */
  hbenjamin: {
    async basic(u, t) {
      if (has(u, 'corpse')) {
        const cr = await strike(u, t, 0.6, { fx: 'whisper' });
        if (hitOK(cr) && isUp(cr.target) && !has(cr.target, 'withered')) { addStatus(cr.target, 'withered', witherTurns(u), { src: u }); skullFeed(u, cr.target); }
        return;
      }
      const all = bt(u, 'witherAll');
      const r = await strike(u, t, bt(u, 'whisperMult') || 1.3, { fx: 'whisper' });
      if (hitOK(r) && isUp(r.target) && !has(r.target, 'withered')) { addStatus(r.target, 'withered', witherTurns(u), { src: u }); skullFeed(u, r.target); }
      if (all) for (const e of foesOf(u)) if (e !== r.target && !has(e, 'withered')) { addStatus(e, 'withered', witherTurns(u), { src: u }); skullFeed(u, e); }
    },
    async skill(u, t) {
      await HOOK.fx('marrow', { src: u, tgt: t });
      // Feed: weaker, but it takes back far more, because it is how he gets off the floor.
      if (has(u, 'corpse')) {
        const cr = resolveHit(u, t, 0.8, { acc: 0.05 });
        if (hitOK(cr)) heal(u, u, Math.round(cr.dmg * 1.1), { noCrit: true });
        if (isUp(t) && !has(t, 'withered')) { addStatus(t, 'withered', witherTurns(u), { src: u }); skullFeed(u, t); }
        return;
      }
      const dry = has(t, 'withered');
      const r = resolveHit(u, t, 1.5, { acc: 0.05 });
      if (hitOK(r)) {
        const take = Math.round(r.dmg * (bt(u, 'drawSteal') || 1) * (dry ? 1 : 0.5));
        if (take > 0) { heal(u, u, take, { noCrit: true }); }
      }
      if (isUp(t) && !has(t, 'withered')) { addStatus(t, 'withered', witherTurns(u), { src: u }); skullFeed(u, t); }
    },
    /* The old one handed the whole team two turns of not dying and gave him his Skulls back,
       which he could then do again. He is a debuffer, so it takes the room apart instead. */
    async ult(u) {
      // The Corpse spends its ultimate hauling itself upright instead.
      if (has(u, 'corpse')) { riseBenjamin(u, 0.35); return; }
      const f = foesOf(u);
      await HOOK.fx('secondbreath', { src: u, tgts: f });
      for (const e of f) {
        const fresh = !has(e, 'withered');
        addStatus(e, 'withered', u.def.boss ? 1 : 3, { src: u });
        if (fresh) skullFeed(u, e);
        addStatus(e, 'atkDown', 3, { value: 0.25 });
        addStatus(e, 'defDown', 3, { value: 0.25 });
      }
    }
  },
  /* Ephraim. The meter is the health bar: the more of it is gone the harder he bites, so there
     is nothing to count and nothing he can lose by being hit. */
  ephraim: {
    async basic(u, t) {
      const m = bt(u, 'knuckle') || 0.48;
      // Too close to miss, so the hits are sure rather than accurate.
      for (let i = 0; i < 3; i++) { if (!isUp(t)) break; await strike(u, t, m, { fx: 'knuckle', i, sure: true }); }
    },
    async skill(u, t) {
      const r = await strike(u, t, 1.12, { fx: 'seize', status: { key: 'bleed', turns: 3, dot: 0.3 } });
      // He bites down and drags it back rather than letting it act.
      if (hitOK(r) && isUp(t)) delayUnit(t, t.def.boss ? 0.18 : (bt(u, 'dragDelay') || 0.35));
      return r;
    },
    async ult(u, t) {
      await HOOK.fx('wontlet', { src: u, tgt: t });
      for (let i = 0; i < 5; i++) {
        let e = isUp(t) ? t : foesOf(u).find(x => isUp(x)) || foesOf(u)[0];
        if (!e) break;
        const r = await strike(u, e, 0.62, { fx: 'knuckle', i, sure: true, pierce: 0.4 });
        if (hitOK(r)) heal(u, u, u.maxHp * 0.03, { noCrit: true });
      }
    }
  },
  /* Isaac. The other two who hide are passive about it: Aamay is covered while a hero stands and
     Seraphine slips out on a timer. Isaac spends his: he is unseen until he strikes, and the
     strike out of sight is the one worth waiting for. */
  isaac: {
    async basic(u, t) {
      const ambush = has(u, 'invisible');
      const r = await strike(u, t, 1.0, { fx: 'quickword', forceCrit: ambush });
      if (ambush) { removeStatus(u, 'invisible'); HOOK.float(u, '👁 SEEN', 'info'); }
      return r;
    },
    async skill(u) {
      await HOOK.fx('slipaway', { src: u });
      addStatus(u, 'invisible', 99, { silent: true });
      HOOK.float(u, '🫥 INVISIBLE', 'buff');
      addStatus(u, 'spdUp', 2, { value: 0.3 });
      if (bt(u, 'courier')) for (const a of friendsOf(u)) if (a !== u) addStatus(a, 'spdUp', 2, { value: 0.1 });
      if (bt(u, 'noMark')) return;
      // He reports what he has seen: the hardest hitter is marked for everyone.
      const f = foesOf(u);
      if (f.length) addStatus(f.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a), f[0]), 'exposed', 2, { src: u });
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('everything', { src: u, tgts: f });
      for (const e of f) addStatus(e, 'exposed', 2, { src: u });
      for (const a of friendsOf(u)) addStatus(a, 'critUp', 2, { value: 0.2 });
      if (f.length) {
        const top = f.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a), f[0]);
        resolveHit(u, top, 2.0, { sure: true });
      }
      addStatus(u, 'invisible', 99, { silent: true });
      HOOK.float(u, '🫥 INVISIBLE', 'buff');
    }
  },
  lachlan: {
    async basic(u, t) {
      const s = getSt(u, 'stance');
      if (!s || s.value !== 'far') { for (let i = 0; i < 2; i++) { if (!isUp(t)) break; await strike(u, t, 0.65, { fx: 'punch', i }); } }
      else {
        const others = foesOf(u).filter(e => e !== t);
        await HOOK.fx('orb', { src: u, tgt: t, color: '#4f8dff' });
        resolveHit(u, t, 0.85, { acc: 0.05 });
        if (others.length) { await HOOK.fx('splash', { src: t, tgts: others, color: '#7fb0ff' }); for (const o of others) resolveHit(u, o, bt(u, 'splash') || 0.35, { aoe: true, sure: true }); }
      }
    },
    async skill(u, t) {
      await strike(u, t, 1.6, { fx: 'bigorb', status: { key: 'defDown', turns: 2, value: 0.25 } });
      addShield(u, u, u.maxHp * 0.08, lachCap(u));
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('nova', { src: u, tgts: f, color: '#4f8dff' });
      for (const e of f) resolveHit(u, e, 2.0, { aoe: true, sure: true });
      // Half a wall back, not the whole of it: the Shield has to be able to run out.
      addShield(u, u, u.maxHp * lachCap(u) * 0.5, lachCap(u));
    }
  },
  yousuf: {
    async basic(u, t) {
      const r = await strike(u, t, 1.0, { fx: 'staff' });
      const l = lowest(friendsOf(u));
      if (hitOK(r) && l) { await HOOK.fx('healpulse', { tgt: l }); heal(u, l, r.dmg * (bt(u, 'staffHeal') || 0.6)); }
    },
    async skill(u, t) {
      await HOOK.fx('healbeam', { src: u, tgt: t, color: '#5dff8f' });
      cleanse(t, 1); heal(u, t, t.maxHp * 0.13 + stat(u, 'atk') * 1.2); addStatus(t, 'regen', 2, { value: 0.055, src: u });
      HOOK.sfx('heal');
    },
    async ult(u) {
      await HOOK.fx('blessing', { tgts: sideList(u), color: '#5dff8f' });
      const dead = sideList(u).find(p => !p.alive);
      if (dead) { revive(dead, 0.35); await HOOK.revive(dead); }
      for (const a of friendsOf(u)) { cleanse(a); heal(u, a, a.maxHp * 0.22); addStatus(a, 'regen', 2, { value: 0.055, src: u, silent: true }); }
      HOOK.sfx('heal');
    }
  },
  gemia: {
    async basic(u, t) {
      if (has(u, 'flow')) { for (let i = 0; i < 2; i++) { if (!isUp(t)) break; await strike(u, t, 0.6, { fx: 'swift', i, acc: 0.05 }); } }
      else await strike(u, t, 1.1, { fx: 'swift', acc: 0.05 });
      u.flags.advance = bt(u, 'advance') || 0.2;
    },
    async skill(u, t) {
      const n = bt(u, 'flurryHits') || 4;
      for (let i = 0; i < n; i++) { if (!isUp(t)) break; await strike(u, t, 0.52, { fx: 'swift', i, status: { key: 'bleed', turns: 2, chance: bt(u, 'bleedCh') || 0.25, dot: 0.2 } }); }
    },
    async ult(u, t) {
      if (has(u, 'terrified')) { removeStatus(u, 'terrified'); HOOK.update(); await HOOK.banner('She faces her fear', 'Gemia is Resolute', '#ff6f91', 'phase', u); }
      if (!has(u, 'resolute')) addStatus(u, 'resolute', 99, { silent: true });
      await strike(u, t, 2.8, { fx: 'resolve', sure: true });
      addStatus(u, 'flow', 3);
      HOOK.float(u, '🌸 FLOW', 'buff');
    }
  },
  david: {
    async basic(u, t) {
      const v = getSt(u, 'vengeance'), n = v ? v.stacks : 0;
      if (n) { removeStatus(u, 'vengeance'); HOOK.float(u, `⚡ VENGEANCE ×${n}`, 'special'); }
      await strike(u, t, 1.15 * (1 + 0.16 * n), { fx: n >= 3 ? 'resolve' : 'spear', status: { key: 'defDown', turns: 2, value: bt(u, 'spearDef') || 0.15 } });
      if (n) heal(u, u, u.maxHp * 0.02 * n);
    },
    async skill(u, t) {
      await HOOK.fx('guard', { src: u, tgt: t, color: '#c9d2e6' });
      if (t === u) addStatus(u, 'taunt', 2);
      else {
        for (const p of sideList(u)) { const g = getSt(p, 'guarded'); if (g && g.src === u) removeStatus(p, 'guarded'); }
        addStatus(t, 'guarded', 2, { src: u }); addStatus(u, 'guarding', 2);
      }
      addStatus(u, 'defUp', 2, { value: 0.25 });
    },
    async ult(u) {
      const f = foesOf(u);
      await HOOK.fx('sweep', { src: u, tgts: f, color: '#c9d2e6' });
      for (const e of f) resolveHit(u, e, 1.7, { aoe: true });
      for (const a of friendsOf(u)) addStatus(a, 'defUp', 2, { value: 0.3 });
      addStatus(u, 'taunt', 1);
    }
  }
};

/* ---------- previews for targeting ---------- */
function D(u, t, mult, o = {}) {
  const e = calcDmg(u, t, mult, o, true);
  const total = e.dmg * (o.hits || 1);
  const hit = o.sure ? 1 : hitChance(u, t, o);
  return { dmg: total, ko: total >= t.hp + t.shield && !has(t, 'crystal') && hit >= 1, note: o.note, rival: e.rival, hit, dodge: has(t, 'afterimage') && !o.sure, mirror: has(t, 'mirror') };
}
function previewFor(u, kind, t) {
  const key = u.id + '.' + kind;
  const far = has(u, 'stance') && getSt(u, 'stance').value === 'far';
  switch (key) {
    case 'peguicha.basic': return D(u, t, bt(u, 'reapMult') || 0.78, { hits: bt(u, 'reapHits') || 2 });
    case 'peguicha.skill': { const c = getSt(t, 'cinder'), cap = bt(u, 'beadMax') || 3; return D(u, t, 1.0, { acc: 0.05, note: c && c.stacks >= cap ? 'bead cap' : `📿 ${u.flags.beads || 0} left` }); }
    case 'peguicha.ult': { const c = getSt(t, 'cinder'); return D(u, t, 2.1 + (bt(u, 'ignite') || 0.5) * (c ? c.stacks : 0), { sure: true, note: c ? `ignites ×${c.stacks}` : '' }); }
    case 'vehra.basic': return D(u, t, 1.1);
    case 'vehra.skill': return { txt: '🗿 Stone Form' };
    case 'vehra.ult': return D(u, t, 2.2, { sure: true, note: 'others 80%' });
    case 'soham.basic': return D(u, t, bt(u, 'palmMult') || 1.0);
    case 'soham.skill': { const m = bt(u, 'hexMult') || 1; if (t === u && !aloneHero(u)) return { txt: `⬡ Team ${Math.round(u.maxHp * (bt(u, 'teamHex') || 0.1) * m)}` }; return { shield: Math.round(u.maxHp * (bt(u, 'singleHex') || 0.29) * m * (1 + u.mods.shield)), note: `${bt(u, 'singleHits') || 3} hits` }; }
    case 'soham.ult': return D(u, t, 1.7);
    case 'seraphine.basic': return D(u, t, 1.0);
    case 'seraphine.skill': return D(u, t, 0.8, { acc: 0.05, note: '+Encircled' });
    case 'seraphine.ult': return D(u, t, 0.45, { note: 'per cut', acc: 0.1 });
    case 'trigg.basic': return D(u, t, 0.95);
    case 'trigg.skill': { const cap = bt(u, 'creatureCap') || 2, n = creaturesOf(u).length; return { txt: n < cap ? `👹 Imp (${n + 1}/${cap})` : '✚ Mend creatures' }; }
    case 'trigg.ult': { const n = creaturesOf(u).length; return n ? D(u, t, 1.1 * n, { sure: true, note: `${n} burst + Hellhound` }) : { txt: '🐺 Hellhound' }; }
    case 'alfred.basic': return D(u, t, 1.12 * tempoMult(u), { acc: 0.05, note: TEMPO[tempoOf(u)].name, ...tempoOpts(u) });
    case 'alfred.skill': return D(u, t, 0.95 * tempoMult(u), { acc: 0.1, note: '+Framed' });
    case 'alfred.ult': return D(u, t, 0.75, { note: 'per cut', acc: 0.1 });
    case 'ethan.basic': return D(u, t, 1.15);
    case 'ethan.skill': return { txt: `📜 ATK +${Math.round((bt(u, 'decreeAtk') || 0.2) * 100)}%` };
    case 'ethan.ult': return { shield: Math.round(u.maxHp * (bt(u, 'shelter') || 0.15) * (1 + u.mods.shield)) };
    case 'ben.basic': return D(u, t, bt(u, 'wordMult') || 1.35, { note: 'delays' });
    case 'ben.skill': return { txt: '☝️ Acts now' };
    case 'ben.ult': return { txt: t.def.boss ? '⏳ Delay 20%' : '⏳ Delay 40%' };
    case 'kingsley.basic': return D(u, t, 0.8);
    case 'kingsley.skill': return { txt: '🎁 Random trinket' };
    case 'kingsley.ult': return { txt: '🎶 Song' };
    case 'vasco.basic': return D(u, t, has(u, 'vessel') ? 1.15 : 1.3, { note: has(u, 'vessel') ? '+Burn' : '+ 2 random tricks' });
    case 'vasco.skill': { if (has(u, 'vessel')) return D(u, t, 0.82, { note: 'every enemy, strips buffs' }); return { txt: '🃏 Deal a card' }; }
    case 'vasco.ult': return { txt: has(u, 'vessel') ? '🃏 Back to the jester' : '😈 Let it out' };
    case 'aamay.basic': return D(u, t, 0.85);
    case 'aamay.skill': return D(u, t, 0.55, { acc: 0.1, note: 'Silence, SPD and ATK down' });
    case 'aamay.ult': { const pg = getSt(u, 'pages'), n = pg ? pg.stacks : 0; return D(u, t, Math.max(0.4, (bt(u, 'pageMult') || 0.15) * n), { sure: true, note: `${n} of ${pageCap(u)} pages` }); }
    case 'angus.basic': return D(u, t, bt(u, 'basicMult') || 1.3);
    case 'angus.skill': return { txt: '🎯 Taunt +🛡' };
    case 'angus.ult': return D(u, t, 1.6);
    case 'flynn.basic': return D(u, t, 1, { acc: 0.05 });
    case 'flynn.skill': return D(u, t, 1.2, { acc: 0.05 });
    case 'flynn.ult': return D(u, t, 0.65, { note: 'per bolt', acc: 0.1 });
    case 'leo.basic': return D(u, t, 1);
    case 'leo.skill': { const c = chanOf(u), ramp = beamRamp(u); if (c && isUp(c.target)) { const st = Math.min(ramp.length, c.value + 1); return D(u, t, ramp[st - 1], { acc: 0.1, note: 'Beam ×' + st }); } return D(u, t, ramp[0], { acc: 0.1, note: 'starts beam' }); }
    case 'leo.ult': return D(u, t, 1.9, { sure: true });
    case 'harry.basic': return D(u, t, 0.92, { pierce: 0.3 });
    case 'harry.skill': return D(u, t, bt(u, 'crushMult') || 1.45, { pierce: 1, sure: true });
    case 'harry.ult': return D(u, t, 2.6, { pierce: 1, sure: true });
    case 'chosen.basic': return D(u, t, 1.05);
    case 'chosen.skill': return D(u, t, 0.55, { hits: bt(u, 'danceHits') || 3, note: bt(u, 'noDanceShield') ? '' : '+Shield' });
    case 'chosen.ult': { const st = getSt(u, 'grace'); return D(u, t, 2.6 + (bt(u, 'gracePer') || 0.2) * (st ? st.stacks : 0), { sure: true }); }
    case 'elphi.basic': return D(u, t, 1.2);
    case 'elphi.skill': return D(u, t, bt(u, 'arcMult') || 0.85);
    case 'elphi.ult': return D(u, t, 3, { sure: true });
    case 'daniel.basic': return D(u, t, 1.1, { acc: 0.05, critBonus: 0.2 });
    case 'daniel.skill': { const add = Math.round(u.maxHp * 0.14 * (bt(u, 'wardMult') || 1) * (1 + u.mods.shield)); const room = Math.max(0, Math.round(t.maxHp * (bt(u, 'wardCap') || 0.35)) - t.shield); return { shield: Math.min(add, room) }; }
    case 'daniel.ult': return D(u, t, 1.8, { sure: true });
    case 'yunze.basic': return D(u, t, 0.4, { hits: 2, acc: 0.05 });
    case 'yunze.skill': return D(u, t, 1.25, { acc: 0.15 });
    case 'yunze.ult': return D(u, t, 0.4, { note: 'per hit', acc: 0.1 });
    case 'hbenjamin.basic': return has(u, 'corpse') ? D(u, t, 0.6, { note: '+Withered' }) : D(u, t, bt(u, 'whisperMult') || 1.3, { note: '+Withered' });
    case 'hbenjamin.skill': return has(u, 'corpse') ? D(u, t, 0.8, { acc: 0.05, note: 'mends him 110%' })
      : D(u, t, 1.5, { acc: 0.05, note: has(t, 'withered') ? 'drains it all' : 'drains half' });
    case 'hbenjamin.ult': return has(u, 'corpse') ? { txt: '🕯 get up' } : { txt: '🥀 rot the room' };
    case 'ephraim.basic': return D(u, t, bt(u, 'knuckle') || 0.48, { sure: true, hits: 3 });
    case 'ephraim.skill': return D(u, t, 1.12, { note: '+Bleed, delays' });
    case 'ephraim.ult': return D(u, t, 0.62, { sure: true, hits: 5, pierce: 0.4 });
    case 'isaac.basic': return D(u, t, 1.0, { forceCrit: has(u, 'invisible'), note: has(u, 'invisible') ? 'unseen' : undefined });
    case 'isaac.skill': return { txt: '🫥 vanish, 💨▲' };
    case 'isaac.ult': return D(u, t, 2.0, { sure: true, note: 'on the hardest hitter' });
    case 'malakai.basic': return D(u, t, 1.0, { note: mixOf(u).name + (mixSlot(u) === 2 ? ', on the house' : '') });
    case 'malakai.skill': { const n = sellable(t).length; return { txt: (n ? '⚗️▸' + n + ' ' : '') + '⚔️▲ 💨▲' + (bt(u, 'freeBargain') ? ' ✚' : '') }; }
    case 'malakai.ult': return { txt: '⚗️ strip' };
    case 'lachlan.basic': return far ? D(u, t, 0.85, { acc: 0.05 }) : D(u, t, 0.65, { hits: 2 });
    case 'lachlan.skill': return D(u, t, 1.6);
    case 'lachlan.ult': return D(u, t, 2, { sure: true });
    case 'yousuf.basic': return D(u, t, 1);
    case 'yousuf.skill': { const m = has(t, 'mended') ? 0.75 : 1; const r = { heal: Math.min(t.maxHp - t.hp, Math.round((t.maxHp * 0.13 + stat(u, 'atk') * 1.2) * (1 + u.mods.heal) * m)) }; if (m < 1) r.mended = true; return r; }
    case 'yousuf.ult': return t.alive ? { heal: Math.min(t.maxHp - t.hp, Math.round(t.maxHp * 0.22 * (1 + u.mods.heal) * (has(t, 'mended') ? 0.75 : 1))), mended: has(t, 'mended') } : { txt: 'Revive' };
    case 'gemia.basic': return has(u, 'flow') ? D(u, t, 0.6, { hits: 2, acc: 0.05, note: 'Flow' }) : D(u, t, 1.1, { acc: 0.05 });
    case 'gemia.skill': return D(u, t, 0.52, { hits: bt(u, 'flurryHits') || 4 });
    case 'gemia.ult': return D(u, t, 2.8 / (has(u, 'terrified') ? 0.7 : 1), { sure: true });
    case 'david.basic': { const v = getSt(u, 'vengeance'), n = v ? v.stacks : 0; return D(u, t, 1.15 * (1 + 0.16 * n), { note: n ? 'Vengeance ×' + n : '' }); }
    case 'david.skill': return { txt: t === u ? '🎯 Taunt' : '🛡 Guard' };
    case 'david.ult': return D(u, t, 1.7);
  }
  return null;
}
function validTargets(u, kind) {
  if (kind === 'skill' && u.id === 'ben' && u.isHero) return friendsOf(u).filter(x => x !== u);
  if (kind === 'skill' && u.id === 'leo' && chanOf(u) && isUp(chanOf(u).target)) return [chanOf(u).target];
  const tt = abil(u, kind).target;
  if (tt === 'enemy') { const f = seenOnly(foesOf(u), u), tn = f.filter(x => has(x, 'taunt')); return tn.length ? tn : f; }
  if (tt === 'allEnemies') return foesOf(u);
  if (tt === 'ally' || tt === 'allAllies') return friendsOf(u);
  if (tt === 'self') return [u];
  return [];
}
const skillCost = u => (abil(u, 'skill') || {}).cost || 1;
/* Whether a basic earns the team a point. The Vessel fights for itself and pays nothing in. */
const basicPays = u => !(u.id === 'yunze') && !(u.id === 'vasco' && has(u, 'vessel'));
function canUse(u, kind) {
  if ((kind === 'skill' || kind === 'ult') && has(u, 'silenced')) return false;
  if (kind === 'skill' && u.id === 'leo' && chanOf(u) && isUp(chanOf(u).target)) return true;
  if (kind === 'skill' && u.id === 'peguicha' && !(u.flags.beads > 0)) return false;
  if (kind === 'skill' && u.id === 'soham' && u.flags.skillCd > 0) return false;
  if (kind === 'skill' && u.id === 'isaac' && u.flags.skillCd > 0) return false;
  if (kind === 'skill' && u.id === 'ben' && (!friendsOf(u).some(x => x !== u) || u.flags.skillCd > 0)) return false;
  if (kind === 'skill') return u.id === 'yunze' ? !(u.flags.skillCd > 0) : spOf(u) >= (abil(u, 'skill').cost || 1);
  if (kind === 'ult') return u.ult >= 100;
  return true;
}

/* ---------- hero action ---------- */
async function heroAct(u, ch) {
  const kind = ch.kind; let t = ch.target;
  const a = abil(u, kind);
  if (!canUse(u, kind)) return heroAct(u, { kind: 'basic', target: foesOf(u)[0] });
  const vt = validTargets(u, kind);
  if (!vt.includes(t)) t = (a.target === 'self') ? u : (a.target === 'ally' || a.target === 'allAllies') ? lowest(vt) : vt[0];
  const lone = u.id === 'yunze';
  const sustaining = u.id === 'leo' && kind === 'skill' && chanOf(u) && isUp(chanOf(u).target);
  if (u.id === 'leo' && kind !== 'skill' && chanOf(u)) endChannel(u, 'release');
  if (kind === 'skill' && !sustaining) { if (lone) u.flags.skillCd = 3; else if (u.id === 'ben') u.flags.skillCd = 3; else addSp(u, -(a.cost || 1)); if (u.id === 'soham') u.flags.skillCd = 2; if (u.id === 'isaac') u.flags.skillCd = 2; }
  if (kind === 'basic' && basicPays(u)) addSp(u, 1);
  tally(u, 'acts'); if (kind === 'ult') tally(u, 'ults');
  HOOK.log(`${u.name} uses ${sustaining ? 'Sustain Beam' : a.name}.`, 'p');
  if (kind === 'ult') { u.ult = 0; HOOK.update(); await HOOK.ult(u, a); }
  else { HOOK.actName(u, sustaining ? 'Sustain Beam' : a.name, kind); HOOK.update(); }
  bumpPages(u);
  await KIT[u.id][kind](u, t);
  if (u.isHero && u.id === 'alfred' && isUp(u)) { const t0 = tempoOf(u); u.flags.advance = t0 === 'allegro' ? 0.5 : 0; shiftTempo(u); }
  if (u.isHero && u.id === 'seraphine' && isUp(u)) {
    for (let i = 0; i < 2; i++) {
      const f = foesOf(u); if (!f.length) break;
      const e = pick(f);
      await HOOK.fx('halo', { src: u, tgt: e, i, quick: true, small: true });
      const hr = resolveHit(u, e, bt(u, 'haloMult') || 0.28, { aoe: true });
      if (hitOK(hr) && isUp(e)) addStatus(e, 'sever', 99, { stacks: 1, silent: true });
    }
  }
  if (kind !== 'ult') gainUlt(u, (kind === 'basic' ? 20 : 30) * (1 + u.mods.ultGain));
  else if (u.id !== 'harry') u.ult = Math.min(100, 5);
  if (u.id === 'chosen' && isUp(u)) addStatus(u, 'grace', 99, { stacks: 1, silent: true });
  if (u.id === 'lachlan' && kind !== 'ult' && isUp(u)) toggleStance(u);
  HOOK.update();
}

/* ---------- hero AI (auto battle) ---------- */
function pickFocus(u, en) {
  const chg = en.filter(e => has(e, 'charging'));
  if (chg.length) return chg[0];
  const nm = en.filter(e => !has(e, 'mirror'));
  if (nm.length) en = nm;
  const pri = en.filter(e => e.def.priority);
  const pool = pri.length ? pri : en;
  return pool.reduce((a, b) => ((b.hp + b.shield) < (a.hp + a.shield) ? b : a));
}
function aiChoose(u) {
  const enAll = foesOf(u); const en = seenOnly(enAll, u); const al = friendsOf(u);
  if (!en.length) return { kind: 'basic', target: null };
  const lowA = lowest(al);
  const focus = pickFocus(u, en);
  const boss = en.find(e => e.def.boss);
  const taunter = en.find(e => has(e, 'taunt'));
  const tgtFor = kind => { const tt = abil(u, kind).target; if (tt === 'enemy') return taunter || ((kind === 'ult' && boss) ? boss : focus); if (tt === 'ally') return lowA; return u; };
  const sp = spOf(u), mine = sideList(u);
  if (u.ult >= 100) {
    if (u.id === 'yousuf') { if (hpPct(lowA) < 0.65 || mine.some(p => !p.alive)) return { kind: 'ult', target: u }; }
    else if (u.id === 'vasco') {
      const vessel = has(u, 'vessel');
      if (!vessel) return { kind: 'ult', target: u };
      if (spOf(u) < 2) return { kind: 'ult', target: u };
    }
    else return { kind: 'ult', target: tgtFor('ult') };
  }
  if (canUse(u, 'skill')) {
    switch (u.id) {
      case 'angus': if (!has(u, 'taunt')) return { kind: 'skill', target: u }; break;
      case 'yousuf': if (hpPct(lowA) < 0.6) return { kind: 'skill', target: lowA }; break;
      case 'daniel': { const c = al.filter(a => a.shield < a.maxHp * 0.1).sort((a, b) => hpPct(a) - hpPct(b))[0]; if (c && hpPct(c) < 0.75) return { kind: 'skill', target: c }; break; }
      case 'david': {
        if (!mine.some(p => isUp(p) && has(p, 'guarded'))) { const o = al.filter(a => a !== u); if (o.length) return { kind: 'skill', target: lowest(o) }; }
        break;
      }
      // Wither first, then drain: the draw takes everything from something already marked.
      case 'hbenjamin': {
        if (has(u, 'corpse')) { if (sp >= skillCost(u)) return { kind: 'skill', target: tgtFor('skill') }; break; }
        const dry = en.filter(e => has(e, 'withered'));
        if (sp >= skillCost(u) && (dry.length || hpPct(u) < 0.6)) return { kind: 'skill', target: dry.length ? lowest(dry) : tgtFor('skill') };
        break;
      }
      case 'ephraim': { if (sp >= skillCost(u) + 1) return { kind: 'skill', target: tgtFor('skill') }; break; }
      // Vanish when he is seen, strike when he is not. The cooldown stops him doing only that.
      case 'isaac': { if (!has(u, 'invisible') && sp >= skillCost(u) && !(u.flags.skillCd > 0)) return { kind: 'skill', target: u }; break; }
      case 'malakai': {
        const pool = al.filter(a => a !== u && hpPct(a) > 0.4 && (sellable(a).length || !has(a, 'atkUp')));
        const c = pool.sort((a, b) => (sellable(b).length - sellable(a).length) || (stat(b, 'atk') - stat(a, 'atk')))[0];
        if (c && sp >= skillCost(u) + 1) return { kind: 'skill', target: c };
        break;
      }
      case 'yunze': return { kind: 'skill', target: tgtFor('skill') };
      case 'trigg': if (sp >= 1 && creaturesOf(u).length < (bt(u, 'creatureCap') || 2)) return { kind: 'skill', target: u }; break;
      case 'alfred': {
        if (sp >= 1 && !en.some(e => has(e, 'framed'))) return { kind: 'skill', target: taunter || boss || en.reduce((a, b) => (b.hp > a.hp ? b : a)) };
        const fr = en.find(e => has(e, 'framed')); if (fr && !taunter) return { kind: 'basic', target: fr };
        break;
      }
      case 'ethan': if (sp >= 1 && mine.filter(a => isUp(a) && a.isHero).some(a => !has(a, 'atkUp'))) return { kind: 'skill', target: u }; break;
      case 'ben': { const others = mine.filter(a => isUp(a) && a !== u && a.isHero); if (!(u.flags.skillCd > 0) && others.length) return { kind: 'skill', target: others.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a)) }; break; }
      case 'kingsley': if (sp >= 1 && hpPct(lowA) < 0.65) return { kind: 'skill', target: u }; break;
      case 'vasco': {
        if (sp < skillCost(u)) break;
        if (has(u, 'vessel')) return { kind: 'skill', target: tgtFor('skill') };
        // A card is worth drawing when somebody could use any of the four.
        if (hpPct(lowA) < 0.8 || sp >= 3 || al.some(x => !has(x, 'atkUp'))) return { kind: 'skill', target: u };
        break;
      }
      case 'aamay': { const t2 = en.filter(e => !has(e, 'silenced')); if (sp >= skillCost(u) && t2.length) return { kind: 'skill', target: taunter || (t2.includes(boss) ? boss : t2.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a))) }; break; }
      case 'peguicha': {
        if (sp >= 1 && u.flags.beads > 0) { const cap = bt(u, 'beadMax') || 3; const c = en.filter(e => { const x = getSt(e, 'cinder'); return !x || x.stacks < cap; }); if (c.length) { const pickT = taunter || (c.includes(boss) ? boss : c.reduce((a, b) => (b.hp > a.hp ? b : a))); return { kind: 'skill', target: pickT }; } }
        break;
      }
      case 'vehra': {
        if (sp >= 1 && !has(u, 'stone') && (hpPct(u) < 0.4 || (hpPct(lowA) < 0.3 && lowA !== u))) return { kind: 'skill', target: u };
        const prey = lowest(en);
        if (prey && !taunter) return { kind: 'basic', target: prey };
        break;
      }
      case 'soham': {
        if (sp < 1 || u.flags.skillCd > 0) break;
        const bare = mine.filter(a => isUp(a) && !has(a, 'hexshield'));
        const hurt = bare.filter(a => hpPct(a) < 0.8);
        if (hurt.length >= 2) return { kind: 'skill', target: u };
        const one = bare.filter(a => hpPct(a) < 0.65).sort((a, b) => hpPct(a) - hpPct(b))[0];
        if (one) return { kind: 'skill', target: one };
        if (bare.length === mine.filter(isUp).length && sp >= 2) return { kind: 'skill', target: u };
        break;
      }
      case 'seraphine': { const free = en.filter(e => !has(e, 'encircled')); if (sp >= skillCost(u) && free.length) return { kind: 'skill', target: taunter || (free.includes(boss) ? boss : free.reduce((a, b) => (b.hp > a.hp ? b : a))) }; break; }
      case 'leo': {
        const c = chanOf(u);
        if (c && isUp(c.target)) { const risk = (c.taken || 0) > u.maxHp * beamBreak(u) * 0.5 && hpPct(u) < 0.4; if (!risk) return { kind: 'skill', target: c.target }; break; }
        if (sp >= 1) { const sturdy = en.reduce((a, b) => ((b.hp + b.shield) > (a.hp + a.shield) ? b : a)); return { kind: 'skill', target: taunter || boss || sturdy }; }
        break;
      }
      default: { const c = skillCost(u); if (sp >= c + 1 || (sp >= c && boss)) return { kind: 'skill', target: tgtFor('skill') }; }
    }
  }
  return { kind: 'basic', target: taunter || focus };
}

/* ---------- enemy AI ---------- */
function movesFor(e) { return (e.flags.phase2 && e.def.moves2) ? e.def.moves2 : e.def.moves; }
function weighted(ms) { const tot = ms.reduce((a, m) => a + (m.w || 1), 0); let r = rnd() * tot; for (const m of ms) { r -= (m.w || 1); if (r <= 0) return m; } return ms[ms.length - 1]; }
function pickTarget(e, m) {
  if (m.target === 'all' || m.target === 'self' || m.target === 'allies') return null;
  if (m.target === 'ally') {
    const fr = friendsOf(e);
    if (m.tp === 'boss') { const b = fr.find(x => x.def.boss); if (b) return b; }
    return fr.length ? lowest(fr) : e;
  }
  const ps = seenOnly(foesOf(e), e);
  if (!ps.length) return null;
  const taunt = ps.find(p => has(p, 'taunt'));
  let t;
  if (taunt && !m.pierceTaunt) t = taunt;
  else if (m.tp === 'lowest') t = lowest(ps);
  else if (m.tp === 'strongest') t = ps.reduce((a, b) => (stat(b, 'atk') > stat(a, 'atk') ? b : a));
  else if (m.tp === 'squishy') t = ps.reduce((a, b) => (stat(b, 'def') < stat(a, 'def') ? b : a));
  else {
    const r = rnd(), focus = e.def.boss ? 0.45 : 0.3;
    const chan = ps.find(p => chanOf(p));
    if (chan && rnd() < 0.25) t = chan;
    else if (r < focus) t = lowest(ps);
    else if (r < focus + 0.15) t = ps.reduce((a, b) => (stat(b, 'def') < stat(a, 'def') ? b : a));
    else t = pick(ps);
  }
  const g = guardian(t);
  return g || t;
}
const HERO_TT = { enemy: 'single', allEnemies: 'all', self: 'self', ally: 'ally', allAllies: 'allies' };
function planHeroIntent(e) {
  const ch = aiChoose(e);
  const a = abil(e, ch.kind);
  e.intents = [{ move: { id: ch.kind, name: a.name, icon: a.icon, target: HERO_TT[a.target], heroKind: ch.kind }, target: ch.target, plan: ch }];
}
function planIntents(e) {
  e.intents = [];
  if (!isUp(e)) return;
  if (e.isHero) return planHeroIntent(e);
  if (has(e, 'charging') && e.def.charged) { e.intents = [{ move: e.def.charged, target: null }]; return; }
  const n = e.def.multi || 1;
  const used = {};
  for (let i = 0; i < n; i++) {
    let ms = movesFor(e).filter(m => !(e.cd[m.id] > 0) && !used[m.id] && (!m.cond || m.cond(e)));
    if (has(e, 'silenced')) ms = [movesFor(e).find(x => x.mult && x.target === 'single') || movesFor(e)[0]];
    if (!ms.length) ms = movesFor(e).filter(m => !m.cd && !m.cond);
    if (!ms.length) break;
    const m = weighted(ms);
    used[m.id] = true;
    e.intents.push({ move: m, target: pickTarget(e, m) });
  }
}
function refreshIntents() {
  for (const u of B.units) { const c = isUp(u) && chanOf(u); if (c && !isUp(c.target)) endChannel(u, 'target'); }
  for (const e of B.enemies) {
    if (!isUp(e)) { e.intents = []; continue; }
    if (!e.intents.length) { planIntents(e); continue; }
    if (e.isHero) {
      const it = e.intents[0], ch = it.plan;
      const bad = !canUse(e, ch.kind) || (it.target && !isUp(it.target)) || (it.move.target === 'single' && !validTargets(e, ch.kind).includes(it.target));
      if (bad) planHeroIntent(e);
      continue;
    }
    for (const it of e.intents) {
      const m = it.move;
      if (m.target === 'single') {
        const ps = foesOf(e);
        const taunt = ps.find(p => has(p, 'taunt'));
        if (taunt && it.target !== taunt && !m.pierceTaunt) it.target = taunt;
        else if (!isUp(it.target) || unseen(it.target, e)) it.target = pickTarget(e, m);
        if (it.target) { const g = guardian(it.target); if (g) it.target = g; }
      } else if (m.target === 'ally' && !isUp(it.target)) it.target = pickTarget(e, m);
    }
  }
}
function intentEstimate(e, it, p) {
  const m = it.move;
  if (!isUp(p)) return 0;
  if (m.heroKind) {
    if (!(m.target === 'all' || (m.target === 'single' && it.target === p))) return 0;
    const r = previewFor(e, m.heroKind, p);
    return r && r.dmg ? Math.round(r.dmg * (r.hit != null ? 1 : 1)) : 0;
  }
  if (m.run === 'thousand') return calcDmg(e, p, 0.5, {}, true).dmg * 2;
  if (!m.mult) return 0;
  if (m.target === 'all' || (m.target === 'single' && it.target === p)) return calcDmg(e, p, m.mult, { pierce: m.pierce }, true).dmg * (m.hits || 1);
  return 0;
}
const SPECIAL = {
  async transmute(e) { for (const p of foesOf(e)) stripBuffs(p); for (const p of foesOf(e)) addStatus(p, 'defDown', 2, { value: 0.2 }); },
  async summon(e, t, m) {
    const cap = Math.max(3, B.slots || 3);
    let slot = null;
    for (let i = 0; i < cap; i++) if (!B.enemies.some(x => x.slot === i && isUp(x))) { slot = i; break; }
    if (slot == null) return;
    B.slots = Math.max(B.slots || 0, slot + 1);
    await HOOK.fx('summon', { src: e, color: e.color });
    const u = makeUnit(m && m.summonId || 'homunculus', 'enemy', slot, e.scale);
    finalize(u);
    B.enemies = B.enemies.filter(x => x.slot !== slot);
    B.enemies.push(u); B.enemies.sort((a, b) => a.slot - b.slot);
    B.units = [...B.players, ...B.enemies];
    B.st[u.uid] = newStats();
    u.gauge = 10000;
    planIntents(u);
    HOOK.rebuild();
    HOOK.float(u, '✦ SUMMONED', 'info');
  },
  async charge(e, t, m) {
    await HOOK.fx('charge', { src: e, tgt: e, color: e.color });
    addStatus(e, 'charging', 99, { value: Math.round(e.maxHp * (m.breakAt || 0.12)), silent: true });
    const st = getSt(e, 'charging'); st.taken = 0; st.fresh = false;
    HOOK.float(e, '🔋 CHARGING', 'special');
    await HOOK.banner(e.name + ' is charging', `Deal ${st.value} damage before its next turn to break it`, e.color, 'phase', e);
  },
  async raise(e) {
    const dead = B.enemies.filter(x => !x.alive && !x.def.boss && !x.flags.raised);
    if (!dead.length) return;
    const x = dead[0];
    x.flags.raised = true;
    await HOOK.fx('summon', { src: x, color: '#ffd56b' });
    revive(x, 0.5);
    x.cd = {}; x.intents = [];
    await HOOK.revive(x);
    HOOK.log(`${x.name} rises again.`, 'e');
  },
  async reforge(e) {
    await HOOK.fx('aura', { tgt: e, color: '#ff9a5a' });
    addStatus(e, 'plated', 99, { stacks: 8, silent: true });
    HOOK.float(e, '🔩 REFORGED ×8', 'special');
  },
  async spendGrace(e, t, m) {
    const st = getSt(e, 'grace'); const n = st ? st.stacks : 0;
    removeStatus(e, 'grace');
    if (!isUp(t)) t = pickTarget(e, m);
    if (!t) return;
    await HOOK.fx('wings', { src: e, tgt: t, color: '#ffd56b' });
    resolveHit(e, t, m.mult + 0.15 * n, { sure: true });
  },
  async thousand(e) {
    await HOOK.fx('afterimages', { src: e });
    for (let i = 0; i < 6; i++) {
      const f = foesOf(e); if (!f.length) break;
      const p = pick(f);
      await HOOK.fx('dash', { src: e, tgt: p, i });
      resolveHit(e, p, 0.5, { critBonus: 0.15 });
      HOOK.update();
    }
  }
};
async function execMove(e, m, t) {
  if (m.mult && !m.run) {
    if (m.target === 'all') {
      const ts = foesOf(e);
      await HOOK.fx(m.fx || 'wave', { src: e, tgts: ts, color: e.color });
      for (const x of ts) { const r = resolveHit(e, x, m.mult, { aoe: true, pierce: m.pierce, sure: m.sure, acc: m.acc }); if (hitOK(r) && m.status) applyOnHit(e, x, m.status); }
      if (m.id === 'cataclysm') removeStatus(e, 'charging');
    } else {
      for (let i = 0; i < (m.hits || 1); i++) {
        if (!isUp(t)) { if (i > 0) break; t = pickTarget(e, m); }
        if (!t) break;
        const r = await strike(e, t, m.mult, { fx: m.fx || 'claw', i, pierce: m.pierce, critBonus: m.critBonus, status: m.status, sure: m.sure, acc: m.acc });
        if (r && r.target) t = r.target;
      }
    }
  } else if (m.status && (m.target === 'all' || m.target === 'single') && !m.run) {
    const ts = m.target === 'all' ? foesOf(e) : (isUp(t) ? [t] : [pickTarget(e, m)].filter(Boolean));
    await HOOK.fx(m.fx || 'hex', { src: e, tgt: ts[0], tgts: ts, color: e.color });
    for (const x of ts) applyOnHit(e, x, m.status);
  }
  if (m.run) await SPECIAL[m.run](e, t, m);
  if (m.heal) {
    const ts = m.target === 'allies' ? friendsOf(e) : m.target === 'self' ? [e] : [isUp(t) ? t : e];
    await HOOK.fx('heal', { tgts: ts, color: '#5dff8f' });
    for (const x of ts) heal(e, x, x.maxHp * m.heal);
    HOOK.sfx('heal');
  }
  if (m.shield) {
    const ts = m.target === 'allies' ? friendsOf(e) : m.target === 'ally' ? [isUp(t) ? t : e] : [e];
    await HOOK.fx('shieldall', { tgts: ts, color: '#7fb2ff' });
    for (const x of ts) addShield(e, x, x.maxHp * m.shield);
  }
  if (m.self || m.allies) {
    if (!m.mult) await HOOK.fx('buff', { tgts: m.allies ? friendsOf(e) : [e], color: e.color });
    for (const s of [].concat(m.self || [])) addStatus(e, s.key, s.turns, { value: s.value, stacks: s.stacks, silent: s.silent });
    if (m.allies) for (const x of friendsOf(e)) for (const s of [].concat(m.allies)) addStatus(x, s.key, s.turns, { value: s.value });
  }
}
async function enemyAct(e) {
  if (e.isHero) {
    const it = e.intents[0];
    let ch = it && it.plan;
    if (!ch || !canUse(e, ch.kind)) ch = aiChoose(e);
    e.intents = [];
    await heroAct(e, ch);
    return;
  }
  bumpPages(e);
  if (!e.intents.length) planIntents(e);
  const list = e.intents.slice();
  for (let i = 0; i < list.length; i++) {
    if (!isUp(e)) break;
    const it = list[i];
    let m = it.move;
    if (m === e.def.charged && !has(e, 'charging')) continue;
    if (has(e, 'silenced') && m !== movesFor(e)[0]) { m = movesFor(e).find(x => x.mult && x.target === 'single') || movesFor(e)[0]; it.target = null; HOOK.float(e, '🖋 SILENCED', 'debuff'); }
    if (m.cond && !m.cond(e)) m = movesFor(e).find(x => !x.cond && !x.cd) || m;
    let t = it.target;
    if ((m.target === 'single' || m.target === 'ally') && !isUp(t)) t = pickTarget(e, m);
    if (m.target === 'single') { const ps = seenOnly(foesOf(e), e); const tn = ps.find(p => has(p, 'taunt')); if (tn && !m.pierceTaunt) t = tn; }
    HOOK.actName(e, m.name, 'enemy');
    HOOK.log(`${e.name} uses ${m.name}${t && m.target === 'single' ? ' on ' + t.name : ''}.`, 'e');
    await execMove(e, m, t);
    if (m.cd) e.cd[m.id] = m.cd;
    e.intents = e.intents.filter(x => x !== it);
    HOOK.update();
    await processDeaths();
    if (checkEnd()) break;
    if (i < list.length - 1) await wait(380);
  }
  for (const k in e.cd) if (e.cd[k] > 0) e.cd[k]--;
  e.intents = [];
}

/* ---------- main loop ---------- */
async function runBattle() {
  const myId = B.id;
  const gone = () => B.abort || B.id !== myId;
  refreshIntents();
  HOOK.update();
  let safety = 0;
  while (safety++ < 2000) {
    await processDeaths();
    if (gone()) return 'abort';
    const end = checkEnd();
    if (end) { B.units.forEach(x => { if (x.creature) creditCreature(x); }); B.over = true; B.result = end; B.actor = null; HOOK.update(); return end; }
    if (gone()) return 'abort';
    if (B.turn === SUDDEN_TURN && !B.sudden) { B.sudden = true; HOOK.log('Sudden death: damage rises every 10 turns and healing is halved.', 'i'); await HOOK.banner('Sudden death', 'Damage rises every 10 turns. Healing is halved.', '#ff6a2a'); }
    const a = nextActor();
    B.actor = a; B.turn++;
    HOOK.update();
    await turnStart(a);
    await processDeaths();
    if (checkEnd()) continue;
    if (!isUp(a)) { B.actor = null; continue; }
    if (a.flags.skip) {
      a.flags.skip = false;
      HOOK.float(a, '💫 STUNNED', 'debuff'); HOOK.log(`${a.name} is stunned and loses the turn.`, 'i');
      await wait(650);
      if (a.side === 'enemy') { a.intents = []; for (const k in a.cd) if (a.cd[k] > 0) a.cd[k]--; }
      turnEnd(a); B.actor = null; refreshIntents(); HOOK.update();
      continue;
    }
    if (a.side === 'player' && a.isHero) {
      let ch = (B.auto || HOOK.headless) ? aiChoose(a) : await HOOK.choose(a);
      if (gone()) return 'abort';
      if (!ch) ch = aiChoose(a);
      if (B.auto && !HOOK.headless) await wait(250);
      await heroAct(a, ch);
    } else {
      await enemyAct(a);
    }
    await processDeaths();
    if (a.alive) turnEnd(a);
    B.actor = null;
    refreshIntents();
    HOOK.update();
    await wait(240);
  }
  return 'lose';
}

/* ---------- gauntlet waves ---------- */
const COUNT_SCALE = { 1: [1.6, 1.25], 2: [1.3, 1.15], 3: [1, 1], 4: [0.8, 0.88], 5: [0.68, 0.8] };
function gauntletEnemies(w) {
  const hpMul = 1 + 0.15 * (w - 1), atkMul = 1.5 + 0.085 * (w - 1);
  let ids;
  if (w % 5 === 0) ids = GAUNTLET_BOSSES[(w / 5 - 1) % GAUNTLET_BOSSES.length];
  else {
    const pool = GAUNTLET_POOL[w < 5 ? 0 : w < 10 ? 1 : 2];
    const n = w < 3 ? 2 + Math.floor(rnd() * 2) : w < 8 ? 2 + Math.floor(rnd() * 3) : 3 + Math.floor(rnd() * 3);
    ids = Array.from({ length: n }, () => pick(pool));
    let golems = 0;
    ids = ids.map(x => { if (x === 'golem' && golems++) return 'brute'; return x; });
  }
  const [ch, ca] = ids.length === 1 || ids.some(id => ENEMIES[id].boss) ? [1, 1] : COUNT_SCALE[ids.length];
  return ids.map(id => {
    const boss = ENEMIES[id].boss;
    const solo = ids.length === 1;
    return { id, hpMul: hpMul * ch * (boss ? (solo ? 0.75 : 0.6) : 1), atkMul: atkMul * ca * (boss ? 0.72 : 1) };
  });
}
