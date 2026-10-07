/* ================= UI: battle screen ================= */
const app = () => document.getElementById('app');
const MINI = {};
function miniPortrait(u) {
  const k = u.uid + (u.flags.glow || (has(u, 'unsealed') || has(u, 'vessel')) ? 'g' : '');
  return MINI[k] || (MINI[k] = unitPortrait(u));
}
function eraVar(e) { return e === 'first' ? 'var(--e1)' : e === 'second' ? 'var(--e2)' : 'var(--e3)'; }

function cardHTML(u) {
  const en = u.side === 'enemy';
  const solo = en && B.enemies.length === 1;
  const many = en && B.enemies.length >= 4;
  const tag = u.isHero ? HEROES[u.id].role : (u.creature || u.def.creature) ? 'Creature' : (u.def.boss ? 'Boss' : u.def.elite ? 'Elite' : u.def.priority ? 'Support' : '');
  return `<div class="card ${en ? 'en' : 'pl'} ${u.def.boss ? 'boss' : ''} ${solo ? 'solo' : ''} ${u.def.ghost ? 'ghostly' : ''}" data-uid="${u.uid}" style="--c:${u.color}">
${en ? `<div class="intent" style="min-height:${(u.def.multi || 1) * (many ? 23 : 31)}px"></div>` : ''}
<div class="por"><div class="pi">${unitPortrait(u)}</div><button class="ci" aria-label="Details for ${esc(u.name)}">i</button><div class="hit"></div><div class="bub"></div><div class="kotag">Fallen</div><div class="turnflag">${en ? 'Acting' : 'Your turn'}</div>${en ? '' : '<div class="inc hide"></div>'}</div>
<div class="nm"><span>${esc(u.name)}</span><em>${tag}</em></div>
<div class="hp"><i class="g"></i><i class="f"></i><i class="s"></i><i class="hx"></i><b></b></div>
${u.isHero ? '<div class="ult"><i></i></div>' : ''}
<div class="sts"></div>
</div>`;
}

function renderBattle(ctx) {
  UI.ctx = ctx; UI.log = []; UI.cards = {}; UI.pending = null; UI.tlKey = '';
  closeSheet();
  app().innerHTML = `<div class="scr scr-battle era-${ctx.era}">
<div class="bt-top">
  <button class="ib" id="bRetreat" aria-label="Leave battle">✕</button>
  <div class="st-name">${esc(ctx.title)}<small>${esc(ctx.sub)}</small></div>
  <button class="tog" id="bSpeed" aria-label="Battle speed">${SAVE.speed}×</button>
  <button class="tog ${B.auto ? 'on' : ''}" id="bAuto">Auto</button>
  <button class="ib" id="bSnd" aria-label="Sound">${SAVE.sound ? '🔊' : '🔇'}</button>
  <button class="ib" id="bLog" aria-label="Battle log">📜</button>
</div>
<div class="tl" id="tl"></div>
<div class="arena" id="arena">
  <div class="row en" id="rowE"></div>
  <div class="mid" id="mid"></div>
  <div class="row pl" id="rowP"></div>
  <div class="fx" id="fx"></div>
  <div class="spe hide" id="spE"></div>
</div>
<div class="act" id="act"></div>
</div>`;
  UI.bt = $('.scr-battle'); UI.arena = $('#arena'); UI.fx = $('#fx');
  renderRows();
  $('#bRetreat').onclick = confirmLeave;
  $('#bSpeed').onclick = e => { SAVE.speed = SAVE.speed >= 3 ? 1 : SAVE.speed + 1; store(); e.currentTarget.textContent = SAVE.speed + '×'; SND.play('click'); };
  $('#bAuto').onclick = e => {
    B.auto = !B.auto; UI.autoPref = B.auto; e.currentTarget.classList.toggle('on', B.auto); SND.play('click');
    if (B.auto && UI.pending) { const p = UI.pending; UI.pending = null; clearTargets(); actIdle(); p.res(aiChoose(p.u)); }
    else if (!UI.pending) actIdle();
  };
  $('#bSnd').onclick = e => { SAVE.sound = !SAVE.sound; store(); e.currentTarget.textContent = SAVE.sound ? '🔊' : '🔇'; SND.play('click'); };
  $('#bLog').onclick = showLog;
  const unitOf = c => c && B.units.find(x => String(x.uid) === c.dataset.uid);
  UI.arena.addEventListener('click', e => {
    if (UI.lpDone) { UI.lpDone = false; return; }
    const c = e.target.closest('.card'); const u = unitOf(c); if (!u) return;
    if (e.target.closest('.ci')) { e.stopPropagation(); SND.play('click'); unitSheet(u); return; }
    if (UI.pending && c.classList.contains('tgt')) chooseTarget(u);
    else unitSheet(u);
  });
  // press and hold any card to inspect it, even when it is a valid target
  const lpCancel = () => { clearTimeout(UI.lpTimer); UI.lpTimer = null; };
  UI.arena.addEventListener('pointerdown', e => {
    const c = e.target.closest('.card'); const u = unitOf(c); if (!u || e.target.closest('.ci')) return;
    UI.lpX = e.clientX; UI.lpY = e.clientY;
    lpCancel();
    UI.lpTimer = setTimeout(() => { UI.lpTimer = null; UI.lpDone = true; if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) { /* ignore */ } unitSheet(u); }, 430);
  });
  UI.arena.addEventListener('pointermove', e => { if (UI.lpTimer && Math.hypot(e.clientX - UI.lpX, e.clientY - UI.lpY) > 10) lpCancel(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => UI.arena.addEventListener(n, lpCancel));
  UI.arena.addEventListener('contextmenu', e => { if (e.target.closest('.card')) e.preventDefault(); });
  $('#tl').addEventListener('click', e => { const t = e.target.closest('.t'); const u = t && B.units.find(x => String(x.uid) === t.dataset.uid); if (u) unitSheet(u); });
}
function renderRows() {
  const rowE = $('#rowE'), rowP = $('#rowP'); if (!rowE) return;
  const ens = B.enemies.slice().sort((a, b) => a.slot - b.slot);
  rowE.innerHTML = ens.map(cardHTML).join('');
  rowE.style.setProperty('--n', Math.max(1, ens.length));
  rowE.classList.toggle('many', ens.length >= 4);
  rowE.classList.toggle('five', ens.length >= 5);
  rowP.innerHTML = B.players.map(cardHTML).join('');
  rowP.style.setProperty('--n', Math.max(3, B.players.length));
  rowP.classList.toggle('many', B.players.length >= 4);
  UI.cards = {};
  $$('.card', UI.arena).forEach(c => { UI.cards[c.dataset.uid] = c; });
  if (UI.pending) markTargets();
  fitBattle();
}
function fitBattle() {
  if (!UI.bt || !UI.arena) return;
  const rowE = $('#rowE'), rowP = $('#rowP');
  const pe = rowE && rowE.querySelector('.por'), pp = rowP && rowP.querySelector('.por');
  if (!pe || !pp) return;
  const exE = rowE.offsetHeight - pe.offsetHeight, exP = rowP.offsetHeight - pp.offsetHeight;
  const cs = getComputedStyle(UI.arena);
  const avail = UI.arena.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - exE - exP - 46;
  UI.fitKey = rowE.offsetHeight - pe.offsetHeight + ':' + (rowP.offsetHeight - pp.offsetHeight) + ':' + UI.arena.clientHeight;
  /* Width comes from the row, not from the card. CSS caps the card at --ph to keep portraits
     square, so measuring the card here would feed that cap back in and shrink it every pass. */
  const n = Math.max(3, B.players.length);
  const natural = Math.min(168, (rowP.clientWidth - (n - 1) * 6) / n) || 100;
  const h = Math.max(50, Math.min(Math.floor(avail / 2), Math.round(natural * 1.05)));
  UI.bt.style.setProperty('--ph', h + 'px');
  /* The enemy row packs more cards into the same width, so it gets its own square size.
     Without this, five foes are 72 wide and 128 tall. */
  const ne = Math.max(1, B.enemies.length);
  const naturalE = Math.min(168, (rowE.clientWidth - (ne - 1) * 6) / ne) || 100;
  UI.bt.style.setProperty('--phe', Math.max(50, Math.min(h, Math.round(naturalE))) + 'px');
}
window.addEventListener('resize', () => { if (UI.bt) { fitBattle(); } });

/* ---------- live updates ---------- */
function badge(st) {
  const d = STATUS[st.key];
  let icon = d.icon, num = '';
  if (st.key === 'stance') icon = st.value === 'far' ? '🔵' : '👊';
  if (d.stat) icon += d.neg ? '▼' : '▲';
  if (st.key === 'charging') num = Math.max(0, Math.ceil(st.value - (st.taken || 0)));
  else if (st.key === 'channel') num = '×' + st.value;
  else if (st.key === 'hexwall') num = Math.round(st.value);
  else if (st.key === 'hexshield') num = st.hits + '✦';
  else if (st.key === 'tempo') { icon = (TEMPO[st.value] || TEMPO.andante).icon; num = ''; }
  else if (st.key === 'mixture') { icon = MIXTURE[st.value || 0].icon; num = ''; }
  else if (st.key === 'skulls') num = st.stacks;
  else if (d.max && st.stacks > 1) num = '×' + st.stacks;
  else if (st.turns < 99) num = st.turns;
  return `<span class="sb ${d.type}" style="--c:${d.color}">${icon}${num !== '' ? `<b>${num}</b>` : ''}</span>`;
}
function intentHTML(e, it) {
  const m = it.move;
  let cls = '';
  if (m.heroKind) cls = m.heroKind === 'ult' ? 'ultint' : (m.target === 'ally' || m.target === 'allies' || m.target === 'self') ? 'buff' : '';
  else if (!m.mult && m.run !== 'thousand') cls = (m.heal || m.shield || m.self || m.allies || m.run === 'summon') && m.target !== 'single' ? 'buff' : 'spec';
  let tg = '';
  if (m.target === 'single') tg = it.target ? '→ ' + it.target.name : '';
  else if (m.target === 'all') tg = '→ Whole team';
  else if (m.target === 'self') tg = 'Self';
  else if (m.target === 'allies') tg = 'All allies';
  else if (m.target === 'ally') tg = it.target && it.target !== e ? '→ ' + it.target.name : 'Self';
  return `<div class="ip ${cls} ${m.pierceTaunt ? 'pierce' : ''}"><span>${m.icon}</span><span class="mv">${esc(m.name)}</span><span class="tg">${esc(tg)}${m.pierceTaunt ? ' <i title="Ignores Taunt">🎯✕</i>' : ''}</span></div>`;
}
function updateUnit(u) {
  const c = cardEl(u); if (!c) return;
  const up = isUp(u);
  c.classList.toggle('ko', !u.alive);
  c.classList.toggle('now', B.actor === u && up);
  c.classList.toggle('shielded', up && u.shield > 0);
  c.classList.toggle('crys', up && has(u, 'crystal'));
  c.classList.toggle('stone', up && has(u, 'stone'));
  c.classList.toggle('aloft', up && has(u, 'aloft'));
  c.classList.toggle('afterimg', up && has(u, 'afterimage'));
  c.classList.toggle('vessel', up && has(u, 'vessel'));
  c.classList.toggle('silenced', up && has(u, 'silenced'));
  c.classList.toggle('hexed', up && has(u, 'hexshield'));
  c.classList.toggle('unseen', up && unseen(u));
  if (u.isHero) c.classList.toggle('ready', up && u.ult >= 100);
  const glow = !!u.flags.glow || has(u, 'unsealed') || has(u, 'vessel');
  if (c._glow !== glow) { if (c._glow !== undefined) c.querySelector('.pi').innerHTML = unitPortrait(u); c._glow = glow; }
  const hpP = Math.max(0, u.hp / u.maxHp * 100), shP = Math.min(100, u.shield / u.maxHp * 100);
  const f = c.querySelector('.hp .f'), g = c.querySelector('.hp .g'), s = c.querySelector('.hp .s'), b = c.querySelector('.hp b');
  f.style.width = hpP + '%'; g.style.width = hpP + '%';
  f.classList.toggle('low', u.side === 'player' && hpP < 30);
  const hxSt = getSt(u, 'hexshield'), hxV = hxSt ? Math.max(0, Math.min(u.shield, Math.round(hxSt.value))) : 0, blV = u.shield - hxV;
  const hxP = Math.min(100, hxV / u.maxHp * 100), blP = Math.min(100, blV / u.maxHp * 100);
  const start = hpP + shP <= 100 ? hpP : Math.max(0, 100 - shP);
  const hxEl = c.querySelector('.hp .hx');
  if (blP > 0) { s.style.display = 'block'; s.style.left = start + '%'; s.style.width = blP + '%'; } else s.style.display = 'none';
  if (hxEl) { if (hxP > 0) { hxEl.style.display = 'block'; hxEl.style.left = Math.min(100 - hxP, start + blP) + '%'; hxEl.style.width = hxP + '%'; } else hxEl.style.display = 'none'; }
  const compact = (u.side === 'enemy' && B.enemies.length >= 4) || (u.side === 'player' && B.players.length >= 4);
  const shTxt = (blV > 0 ? ` <span style="color:#cfe8ff">+${blV}🛡</span>` : '') + (hxV > 0 ? ` <span style="color:#ffe066">+${hxV}⬡</span>` : '');
  const txt = compact ? `${Math.ceil(u.hp)}` : u.shield > 0 ? `${Math.ceil(u.hp)}${shTxt}` : `${Math.ceil(u.hp)} / ${u.maxHp}`;
  if (b._t !== txt) { b.innerHTML = txt; b._t = txt; }
  const ul = c.querySelector('.ult i'); if (ul) ul.style.width = u.ult + '%';
  let sh = '';
  if (up) { const list = u.statuses; const max = u.side === 'enemy' && B.enemies.length >= 4 ? 3 : 5; sh = list.slice(0, max).map(badge).join('') + (list.length > max ? `<span class="sb more">+${list.length - max}</span>` : ''); }
  const se = c.querySelector('.sts'); if (se._t !== sh) { se.innerHTML = sh; se._t = sh; }
  if (u.side === 'enemy') {
    const ih = up ? u.intents.map(it => intentHTML(u, it)).join('') : '';
    const ie = c.querySelector('.intent'); if (ie._t !== ih) { ie.innerHTML = ih; ie._t = ih; }
  }
}
function spHTML() {
  let s = '<div class="sp" aria-label="Skill points">SP ';
  for (let i = 0; i < B.spMax; i++) s += `<i class="${i < B.sp ? 'on' : ''}"></i>`;
  return s + '</div>';
}
function update() {
  if (!UI.bt) return;
  for (const u of B.units) updateUnit(u);
  const inc = {};
  for (const e of B.enemies) if (isUp(e)) for (const it of e.intents) for (const p of B.players) { const v = intentEstimate(e, it, p); if (v) inc[p.uid] = (inc[p.uid] || 0) + v; }
  for (const p of B.players) {
    const c = cardEl(p); if (!c) continue;
    const el = c.querySelector('.inc'); const v = inc[p.uid] || 0;
    if (!isUp(p) || !v) { el.className = 'inc hide'; continue; }
    const safe = has(p, 'undying') || has(p, 'crystal') || p.flags.cheat;
    const lethal = !safe && v >= p.hp + p.shield;
    el.className = 'inc' + (lethal ? ' lethal' : '');
    el.textContent = lethal ? `☠ Lethal ${v}` : `⚠ ${v}`;
  }
  const sp = $('#act .sp');
  if (sp) {
    const on = $$('i.on', sp).length;
    if (on !== B.sp || sp.children.length !== B.spMax) { sp.outerHTML = spHTML(); if (B.sp > on) { const pips = $$('#act .sp i.on'); const last = pips[pips.length - 1]; if (last) restartClass(last, 'gain'); } }
  }
  renderTL();
  drawChannels();
  drawWalls();
  const se = $('#spE');
  if (se) {
    const on = B.enemies.some(e => e.isHero);
    se.classList.toggle('hide', !on);
    if (on) { const h = `Foe SP ${Array.from({ length: B.spMaxE || 5 }, (_, i) => `<i class="${i < B.spE ? 'on' : ''}"></i>`).join('')}`; if (se._t !== h) { se.innerHTML = h; se._t = h; } }
  }
  const rE = $('#rowE'), rP = $('#rowP');
  if (rE && rP && UI.arena) {
    const pe = rE.querySelector('.por'), pp = rP.querySelector('.por');
    if (pe && pp) { const k = rE.offsetHeight - pe.offsetHeight + ':' + (rP.offsetHeight - pp.offsetHeight) + ':' + UI.arena.clientHeight; if (k !== UI.fitKey) fitBattle(); }
  }
}
function drawWalls() {
  for (const [rowId, list] of [['rowP', B.players], ['rowE', B.enemies]]) {
    const row = document.getElementById(rowId); if (!row) continue;
    const so = list.find(p => isUp(p) && p.isHero && p.id === 'soham' && has(p, 'hexwall'));
    let el = row.querySelector('.hexw');
    if (!so) { if (el) el.remove(); continue; }
    if (!el) { el = document.createElement('div'); el.className = 'hexw'; el.innerHTML = '<span></span>'; row.appendChild(el); }
    const w = getSt(so, 'hexwall'), f = Math.max(0, Math.min(1, w.value / wallMax(so)));
    el.style.setProperty('--f', f.toFixed(2));
    el.classList.toggle('wtop', rowId === 'rowE');
    el.querySelector('span').textContent = `⬡ ${Math.round(w.value)}`;
  }
}
function drawChannels() {
  if (!UI.fx) return;
  const live = new Set();
  for (const u of B.units) {
    const c = isUp(u) && chanOf(u);
    if (!c || !isUp(c.target) || !cardEl(u) || !cardEl(c.target)) continue;
    live.add(String(u.uid));
    let el = UI.fx.querySelector(`.chan[data-u="${u.uid}"]`);
    if (!el) { el = document.createElement('div'); el.className = 'chan'; el.dataset.u = u.uid; el.innerHTML = '<i></i>'; UI.fx.appendChild(el); }
    const a = P(u), b = P(c.target);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const w = 6 + c.value * 4;
    Object.assign(el.style, { left: a.x + 'px', top: (a.y - w / 2) + 'px', width: len + 'px', height: w + 'px', transform: `rotate(${ang}deg)` });
  }
  UI.fx.querySelectorAll('.chan').forEach(el => { if (!live.has(el.dataset.u)) el.remove(); });
}
function renderTL() {
  const tl = $('#tl'); if (!tl) return;
  const order = B.over ? [] : turnOrder(8);
  const key = order.map(u => u.uid + (u.flags.glow || (has(u, 'unsealed') || has(u, 'vessel')) ? 'g' : '')).join(',') + '|' + (B.actor ? B.actor.uid : '');
  if (key === UI.tlKey) return;
  UI.tlKey = key;
  tl.innerHTML = '<span class="tlab">Next</span>' + order.map((u, i) => `<div class="t ${u.side === 'enemy' ? 'e' : ''} ${i === 0 && B.actor === u ? 'now' : ''}" style="--c:${u.side === 'enemy' ? '#ff5a68' : u.color}" title="${esc(u.name)}" data-uid="${u.uid}" role="button" aria-label="${esc(u.name)} details">${miniPortrait(u)}</div>`).join('');
}

/* ---------- player actions ---------- */
function actIdle() {
  const a = $('#act'); if (!a) return;
  const act = B.actor;
  let msg = '';
  if (B.over) msg = '';
  if (B.auto) msg = 'Auto battle is on. Tap Auto to take control.';
  else if (act && act.side === 'enemy') msg = `${esc(act.name)} is acting`;
  a.innerHTML = `<div class="who">${spHTML()}</div><div class="waitmsg">${msg}</div>`;
}
function showActions() {
  const p = UI.pending; if (!p) return;
  const u = p.u;
  const a = $('#act');
  const chan = u.id === 'leo' && chanOf(u) && isUp(chanOf(u).target) ? chanOf(u) : null;
  const btns = ['basic', 'skill', 'ult'].map(k => {
    let ab = abil(u, k); const ok = canUse(u, k);
    if (k === 'skill' && chan) ab = { name: 'Sustain Beam', icon: '🔥' };
    const lone = u.id === 'yunze';
    const noBeads = k === 'skill' && u.id === 'peguicha' && !(u.flags.beads > 0);
    const hexCd = k === 'skill' && u.id === 'soham' && u.flags.skillCd > 0;
    const cost = skillCost(u);
    const sub = hexCd ? `Ready in ${u.flags.skillCd}` : noBeads ? 'No beads' : k === 'skill' && chan ? `Free, ×${Math.min(beamRamp(u).length, chan.value + 1)}` : k === 'basic' ? (basicPays(u) ? '+1 SP' : 'No SP') : k === 'skill' ? (lone ? (ok ? 'Free, ready' : `Ready in ${u.flags.skillCd}`) : (ok ? `Costs ${cost} SP` : `Need ${cost} SP`)) : (u.ult >= 100 ? 'Ready' : Math.floor(u.ult) + '%');
    return `<button class="ab ${k === 'ult' ? 'ul' : ''} ${k === 'ult' && ok ? 'rdy' : ''} ${k === 'skill' && chan ? 'sustain' : ''} ${p.kind === k ? 'sel' : ''}" data-k="${k}" ${ok ? '' : 'disabled'} style="--c:${u.color}"><span class="i">${ab.icon}</span><b>${esc(ab.name)}</b><small>${sub}</small></button>`;
  }).join('');
  const bd = u.build && u.build.id !== 'balanced' ? u.build.name : HEROES[u.id].role;
  a.innerHTML = `<div class="who" style="--c:${u.color}"><div class="p">${miniPortrait(u)}</div><div class="wn"><b>${esc(u.name)}</b> <small>${esc(bd)}</small></div>${spHTML()}</div><div class="abtn">${btns}</div><div class="descrow" id="descrow"></div>`;
  $$('.ab', a).forEach(bt => bt.onclick = () => selectKind(bt.dataset.k));
  const who = $('.who', a); if (who) { who.style.cursor = 'pointer'; who.onclick = e => { if (!e.target.closest('.sp')) unitSheet(u); }; }
  renderDesc(); markTargets();
}
function selectKind(k) {
  const p = UI.pending; if (!p || !canUse(p.u, k)) return;
  if (p.kind === k) { const tt = abil(p.u, k).target; if (tt !== 'enemy' && tt !== 'ally') { confirmAoE(); return; } }
  p.kind = k; SND.play('select');
  $$('#act .ab').forEach(b => b.classList.toggle('sel', b.dataset.k === k));
  renderDesc(); markTargets();
}
function renderDesc() {
  const p = UI.pending; if (!p) return;
  let a = abil(p.u, p.kind);
  const ch = p.u.id === 'leo' && chanOf(p.u) && isUp(chanOf(p.u).target) ? chanOf(p.u) : null;
  if (ch && p.kind === 'skill') {
    const ramp = beamRamp(p.u), nx = Math.min(ramp.length, ch.value + 1);
    a = { name: 'Sustain Beam', target: 'enemy', desc: `Keep burning ${ch.target.name} for ${Math.round(ramp[nx - 1] * 100)}% ATK and re-apply Burn. Free, but gives no SP.${nx < ramp.length ? ` Next: ${Math.round(ramp[nx] * 100)}%.` : ' Full power.'} Breaks if Leo takes ${Math.round(p.u.maxHp * beamBreak(p.u))} damage before his next turn.` };
  } else if (ch) a = Object.assign({}, a, { desc: 'This releases the beam. ' + a.desc });
  const hint = { enemy: 'Tap an enemy.', ally: 'Tap an ally.', self: 'Tap Use, or tap ' + p.u.name + '.', allEnemies: 'Hits every enemy. Tap Use or any enemy.', allAllies: 'Affects the whole team. Tap Use or any ally.' }[a.target];
  const needsBtn = a.target !== 'enemy' && a.target !== 'ally';
  $('#descrow').innerHTML = `<button class="desc" id="desc" aria-label="Full ability details"><span class="hint">${esc(hint)}</span> ${esc(a.desc)}</button>${needsBtn ? `<button class="btn prime use" id="useBtn">Use</button>` : ''}`;
  const ub = $('#useBtn'); if (ub) ub.onclick = confirmAoE;
  $('#desc').onclick = () => unitSheet(p.u);
}
function confirmAoE() { const p = UI.pending; if (!p) return; const vt = validTargets(p.u, p.kind); chooseTarget(vt.includes(p.u) ? p.u : vt[0] || p.u); }
function clearTargets() { $$('.card.tgt', UI.arena || document).forEach(c => c.classList.remove('tgt', 'ally')); $$('.pv', UI.arena || document).forEach(x => x.remove()); }
function pvHTML(r) {
  if (!r) return '';
  if (r.txt) return `<div class="pv txt">${esc(r.txt)}</div>`;
  if (r.heal != null) return `<div class="pv heal">+${r.heal}${r.mended ? '<small>🩹 Mended -25%</small>' : ''}</div>`;
  if (r.shield != null) return `<div class="pv shield">+${r.shield} 🛡</div>`;
  const lines = [];
  if (r.ko) lines.push('KO'); else if (r.note) lines.push(r.note); else if (r.rival) lines.push('Rival +20%');
  if (r.dodge) lines.push('Will dodge');
  else if (r.hit != null && r.hit < 1) lines.push(Math.round(r.hit * 100) + '% hit');
  if (r.mirror) lines.push('Reflects 40%');
  return `<div class="pv ${r.ko ? 'ko' : ''} ${r.mirror ? 'mir' : ''}">-${r.dmg}${lines.map(l => `<small>${esc(l)}</small>`).join('')}</div>`;
}
function markTargets() {
  clearTargets();
  const p = UI.pending; if (!p) return;
  for (const t of validTargets(p.u, p.kind)) {
    const c = cardEl(t); if (!c) continue;
    c.classList.add('tgt'); if (t.side === 'player') c.classList.add('ally');
    c.querySelector('.por').insertAdjacentHTML('beforeend', pvHTML(previewFor(p.u, p.kind, t)));
  }
}
function chooseTarget(t) {
  const p = UI.pending; if (!p) return;
  if (!validTargets(p.u, p.kind).includes(t)) return;
  UI.pending = null; clearTargets(); actIdle(); SND.play('click');
  p.res({ kind: p.kind, target: t });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheet(); return; }
  if (!UI.pending || UI.sheet) return;
  if (e.key === '1') selectKind('basic');
  else if (e.key === '2') selectKind('skill');
  else if (e.key === '3') selectKind('ult');
  else if (e.key === 'Enter' && $('#useBtn')) confirmAoE();
});

/* ---------- start, leave, results ---------- */
async function startBattle(cfg, ctx) {
  SND.unlock();
  cfg.auto = !!UI.autoPref;
  setupBattle(cfg);
  renderBattle(ctx);
  update(); actIdle(); fitBattle();
  const myId = B.id;
  await W(250);
  const boss = B.enemies.find(e => e.def.boss);
  if (ctx.mode === 'gauntlet') await HOOK.banner('Wave ' + ctx.wave, boss ? `${boss.name}: ${boss.def.title}` : (ctx.wave % 5 === 4 ? 'A boss waits on the next wave' : ''), boss ? boss.color : '#ffdf8a');
  else if (ctx.mode === 'custom') await HOOK.banner('Heroes clash', `${B.players.filter(p => p.isHero).length} against ${B.enemies.length}`, '#ffdf8a');
  else if (boss) await HOOK.banner(boss.name, boss.def.title, boss.color);
  else await HOOK.banner(ctx.stage.name, ERA[ctx.stage.era].name, ERA[ctx.stage.era].color);
  if (B.id !== myId || !UI.bt) return;
  const g = B.players.find(p => has(p, 'terrified'));
  if (g) { HOOK.float(g, '😨 Terrified', 'debuff'); HOOK.log('Gemia freezes. Yunze is here.', 'i'); }
  const res = await runBattle();
  if (res === 'abort' || B.id !== myId || !UI.bt) return;
  actIdle();
  $('#act .waitmsg') && ($('#act .waitmsg').textContent = '');
  await W(500);
  if (B.id !== myId || !UI.bt) return;
  showResult(res);
}
function confirmLeave() {
  const g = UI.ctx && UI.ctx.mode === 'gauntlet';
  sheet(`<h3>Leave the battle?</h3><p>${g ? 'This ends your Gauntlet run. Waves you already cleared still count towards your best.' : 'Progress in this fight is lost.'}</p><div class="resbtns" style="max-width:none;margin-top:14px"><button class="btn" id="stay">Stay</button><button class="btn prime" id="leave">Leave</button></div>`, bg => {
    $('#stay', bg).onclick = closeSheet;
    $('#leave', bg).onclick = () => { closeSheet(); leaveBattle(); };
  });
}
function leaveBattle() {
  B.abort = true;
  if (UI.pending) { const p = UI.pending; UI.pending = null; p.res(null); }
  const ctx = UI.ctx;
  UI.bt = null; UI.arena = null; UI.fx = null;
  $$('.cine,.flash').forEach(x => x.remove());
  if (ctx && ctx.mode === 'gauntlet') { recordBest(G.wave - 1); showTitle(); }
  else if (ctx && ctx.mode === 'custom') showCustom();
  else showCampaign();
}
const IMPACT_NOTE = 'Best is the highest Impact: damage dealt + healing + 75% of Shields given + 35% of damage taken + 120 per kill + 30 per buff or debuff landed.';
function impactOf(s) { return Math.round(s.dmg + s.heal + 0.75 * s.shield + 0.35 * s.taken + 120 * s.kills + 30 * (s.buffs + s.debuffs)); }
const STAT_ROWS = [
  ['impact', '⭐ Impact', s => impactOf(s), 'max'],
  ['dmg', '⚔️ Damage dealt', s => s.dmg, 'max'],
  ['heal', '✚ Healing', s => s.heal, 'max'],
  ['shield', '🛡 Shields given', s => s.shield, 'max'],
  ['taken', '💢 Damage taken', s => s.taken, null],
  ['kills', '☠ Kills', s => s.kills, 'max'],
  ['big', '💥 Biggest hit', s => s.big, 'max'],
  ['crits', '✦ Crits', s => s.crits, 'max'],
  ['acc', '🎯 Hit rate', s => (s.hits + s.misses ? s.hits / (s.hits + s.misses) : null), 'max', v => v == null ? '-' : Math.round(v * 100) + '%'],
  ['dodges', '💨 Dodges', s => s.dodges, 'max'],
  ['buffs', '▲ Buffs given', s => s.buffs, 'max'],
  ['debuffs', '▼ Debuffs landed', s => s.debuffs, 'max'],
  ['acts', '⏱ Actions', s => s.acts, 'max'],
  ['ults', '🌟 Ultimates', s => s.ults, 'max']
];
function statsTable(units) {
  const S = units.map(u => B.st[u.uid] || newStats());
  const imp = S.map(impactOf);
  const best = imp.indexOf(Math.max(...imp));
  const fmtN = v => (v >= 10000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v)));
  const head = `<tr><th></th>${units.map((u, i) => `<th class="${i === best ? 'bestc' : ''}" style="--c:${u.color}"><span class="p">${miniPortrait(u)}</span><span class="nm2">${esc(u.name)}</span>${i === best ? '<span class="mvp">Best</span>' : ''}</th>`).join('')}</tr>`;
  const body = STAT_ROWS.map(([k, label, get, better, fmt]) => {
    const vals = S.map(get);
    const nums = vals.filter(v => v != null);
    const top = better && nums.length ? Math.max(...nums) : null;
    return `<tr class="${k === 'impact' ? 'imp' : ''}"><td>${label}</td>${vals.map((v, i) => `<td class="${top != null && v === top && v > 0 && units.length > 1 ? 'lead' : ''} ${i === best ? 'bestc' : ''}">${fmt ? fmt(v) : fmtN(v || 0)}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="stbl-wrap"><table class="stbl">${head}${body}</table></div>`;
}
function statsHTML() {
  const foes = B.enemies.filter(e => e.isHero);
  const tabs = foes.length ? `<div class="sttabs"><button class="on" data-st="p">Your team</button><button data-st="e">Opponents</button></div>` : '';
  return `<div class="stats2">${tabs}<div data-stp="p">${statsTable(B.players.filter(p => p.isHero))}</div>${foes.length ? `<div data-stp="e" class="hide">${statsTable(foes)}</div>` : ''}<p class="impnote">${IMPACT_NOTE} Gold numbers lead their row.</p></div>`;
}
function wireStatTabs(o) {
  $$('[data-st]', o).forEach(b => b.onclick = () => {
    $$('[data-st]', o).forEach(x => x.classList.toggle('on', x === b));
    $$('[data-stp]', o).forEach(x => x.classList.toggle('hide', x.dataset.stp !== b.dataset.st));
  });
}
const TIPS = [
  'Watch the ⚠ numbers on your heroes. Shield, heal or taunt for anyone marked Lethal.',
  'Basic attacks refill SP. Alternate basics and skills so you never run dry.',
  'Kill healers and wisps first. Enemies marked Support keep the others standing.',
  'Bosses cannot be stunned, but stuns still push their next turn back.',
  'Team bonuses add up. Check the tags on the team screen before a hard fight.',
  'Hold an ultimate for the turn a boss reveals a big attack.'
];
function showResult(res) {
  const ctx = UI.ctx, win = res === 'win';
  SND.play(win ? 'win' : 'lose');
  const o = document.createElement('div'); o.className = 'res';
  if (ctx.mode === 'custom') {
    recordBattle(res);
    o.innerHTML = `<h2 class="${win ? 'win' : 'lose'}">${win ? 'Victory' : 'Defeated'}</h2>
<p style="margin:0;color:var(--tx2);text-align:center">${B.turn} turns. Custom battles don't affect your progress.</p>
${statsHTML()}
<div class="resbtns"><button class="btn" data-a="edit">Edit teams</button><button class="btn prime" data-a="again">Rematch</button></div>`;
    wrapRes(o); wireStatTabs(o);
    o.querySelector('[data-a=edit]').onclick = () => showCustom();
    o.querySelector('[data-a=again]').onclick = () => startCustom();
    return;
  }
  if (ctx.mode === 'campaign') {
    const heroes = B.players.filter(p => p.isHero);
    const avg = heroes.reduce((a, p) => a + (p.alive ? p.hp / p.maxHp : 0), 0) / heroes.length;
    const conds = [['Win the battle', win], ['No hero falls', win && B.kos === 0], ['Team HP averages 50% or more', win && avg >= 0.5]];
    const stars = conds.filter(c => c[1]).length;
    const before = new Set(HERO_ORDER.filter(isUnlocked));
    const echoesBefore = stageOpen(STAGES.findIndex(s => s.era === 'echo'));
    if (win) { SAVE.stars[ctx.stage.id] = Math.max(SAVE.stars[ctx.stage.id] || 0, stars); store(); }
    recordBattle(res, { stars: win ? stars : 0 });
    const newly = HERO_ORDER.filter(id => isUnlocked(id) && !before.has(id));
    const echoesNow = !echoesBefore && stageOpen(STAGES.findIndex(s => s.era === 'echo'));
    const last = ctx.idx === STAGES.length - 1;
    const storyEnd = ctx.stage.id === 'harry';
    o.innerHTML = `<h2 class="${win ? 'win' : 'lose'}">${win ? 'Victory' : 'Defeated'}</h2>
<div class="bigstars">${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>
${newly.map(id => `<div class="unlock" style="--c:${HEROES[id].color}"><div class="p">${heroPortrait(id)}</div><div><b>${esc(HEROES[id].name)} joins your roster</b><p>${esc(HEROES[id].title)}. Two builds available.</p></div></div>`).join('')}
${win && storyEnd ? '<p class="endtxt">The Wanderer lowers his katana and walks away. You have seen every era.</p>' : ''}
${echoesNow ? '<p class="endtxt" style="color:#ff9aa5">The Echoes are open: four post-game fights built to be hard.</p>' : ''}
${win && last ? '<p class="endtxt">You have beaten every Echo.</p>' : ''}
<div class="conds">${conds.map(c => `<div class="${c[1] ? 'ok' : ''}">${c[1] ? '✓' : '✗'} ${c[0]}</div>`).join('')}</div>
${statsHTML()}
${win ? '' : `<p style="margin:0;font-size:13px;color:var(--tx2);max-width:330px">${TIPS[Math.floor(Math.random() * TIPS.length)]}</p>`}
<div class="resbtns"><button class="btn" data-a="map">Map</button><button class="btn ${win && !last ? '' : 'prime'}" data-a="retry">${win ? 'Replay' : 'Try again'}</button>${win && !last ? '<button class="btn prime" data-a="next">Next</button>' : ''}</div>`;
    wrapRes(o); wireStatTabs(o);
    o.querySelector('[data-a=map]').onclick = () => showCampaign();
    o.querySelector('[data-a=retry]').onclick = () => startStage(ctx.idx);
    const nx = o.querySelector('[data-a=next]'); if (nx) nx.onclick = () => showTeam({ mode: 'campaign', idx: ctx.idx + 1 });
    return;
  }
  // gauntlet
  recordBattle(res);
  if (win) {
    recordBest(G.wave);
    G.carry = {};
    B.players.filter(p => p.isHero).forEach(p => { G.carry[p.id] = { hp: p.alive ? Math.min(1, p.hp / p.maxHp + 0.3) : 0.25, ult: p.alive ? p.ult : 0 }; });
    const keys = shuffle(Object.keys(BOONS)).slice(0, 3);
    o.innerHTML = `<h2 class="win" style="font-size:48px">Wave ${G.wave} cleared</h2>
<p style="margin:0;color:var(--tx2);font-size:13.5px;text-align:center">Your team heals 30% of max HP. The fallen return at 25%. Choose one boon.</p>
<div class="boons">${keys.map(k => `<button class="boon" data-b="${k}"><span class="i">${BOONS[k].icon}</span><span><b>${esc(BOONS[k].name)}</b><p>${esc(BOONS[k].desc)}</p></span></button>`).join('')}</div>
${G.boons.length ? `<div class="owned" title="Boons you hold">${G.boons.map(b => BOONS[b].icon).join('')}</div>` : ''}`;
    wrapRes(o);
    $$('.boon', o).forEach(b => b.onclick = () => {
      const k = b.dataset.b;
      SND.play('gain');
      if (BOONS[k].instant) Object.keys(G.carry).forEach(id => { G.carry[id].hp = 1; });
      else G.boons.push(k);
      G.wave++;
      startGauntletWave();
    });
  } else {
    const cleared = G.wave - 1;
    recordBest(cleared);
    o.innerHTML = `<h2 class="lose" style="font-size:52px">Run over</h2>
<p style="margin:0;color:var(--tx2);text-align:center">You cleared ${cleared} ${cleared === 1 ? 'wave' : 'waves'}. Your best is ${SAVE.best}.</p>
${G.boons.length ? `<div class="owned">${G.boons.map(b => BOONS[b].icon).join('')}</div>` : ''}
${statsHTML()}
<div class="resbtns"><button class="btn" data-a="title">Title</button><button class="btn prime" data-a="again">New run</button></div>`;
    wrapRes(o); wireStatTabs(o);
    o.querySelector('[data-a=title]').onclick = () => showTitle();
    o.querySelector('[data-a=again]').onclick = () => showTeam({ mode: 'gauntlet' });
  }
}
function wrapRes(o) {
  const inner = document.createElement('div'); inner.className = 'res-in';
  while (o.firstChild) inner.appendChild(o.firstChild);
  o.appendChild(inner);
  UI.bt.appendChild(o);
}
function recordBest(w) { if (w > (SAVE.best || 0)) { SAVE.best = w; store(); } }

/* ---------- modes ---------- */
function startStage(idx) {
  const st = STAGES[idx];
  const team = SAVE.team.filter(isUnlocked);
  startBattle({ team, builds: Object.assign({}, SAVE.builds), enemies: stageFoes(st), mode: 'campaign' },
    { mode: 'campaign', idx, stage: st, era: st.era === 'echo' ? 'current' : st.era, title: st.name, sub: `${ERA[st.era].name}, stage ${idx + 1} of ${STAGES.length}` });
}
const G = { team: [], wave: 1, boons: [], carry: null };
function startGauntlet() {
  G.team = SAVE.team.filter(isUnlocked); G.builds = Object.assign({}, SAVE.builds); G.wave = 1; G.boons = []; G.carry = null;
  SAVE.runs = (SAVE.runs || 0) + 1; store();
  startGauntletWave();
}
function startGauntletWave() {
  const era = G.wave < 5 ? 'first' : G.wave < 10 ? 'second' : 'current';
  startBattle({ team: G.team, builds: G.builds, enemies: gauntletEnemies(G.wave), boons: G.boons.slice(), carry: G.carry, mode: 'gauntlet' },
    { mode: 'gauntlet', wave: G.wave, era, title: 'Gauntlet', sub: `Wave ${G.wave}${G.wave % 5 === 0 ? ', boss' : ''}` });
}
function showLog() {
  const rows = UI.log.slice().reverse().map(([t, c]) => `<div class="${c}">${esc(t)}</div>`).join('') || '<div class="i">Nothing has happened yet.</div>';
  sheet(`<h3>Battle log</h3><div class="logbox" style="margin-top:10px">${rows}</div>`);
}
