/* ================= UI: menus ================= */
const BIO = {
  angus: 'A swordsman who is very hard to bring down. An aura surrounds him wherever he stands.',
  flynn: 'An electricity user of the First Era.',
  leo: 'Fights by blasting beams of fire.',
  harry: 'A wanderer few people know exists, almost never seen fighting. His real strength is force: he crushes people from the inside at a distance. Present in all three eras. In the Second Era he defeated The Chosen and killed Elphi.',
  chosen: 'A hero known mostly through myth. Fights gracefully with a lance and is masked at all times. Disappeared soon after losing to Harry.',
  elphi: 'One of the most powerful fighters of the Second Era, with a sword made of light. He defeated Yunze. He was protecting something when Harry came for him.',
  daniel: 'Fights with a rapier and a crystal ball that serves as her weapon and her shield. The ball is nearly impossible to crack.',
  yunze: 'A killer who hunts the most powerful people in the world to keep balance. Smiles while he fights. He lost to Elphi, then grew far stronger. Close to immortal.',
  malakai: 'A mysterious alchemist active from the Second Era to now. His deals and customers are among the most elite.',
  lachlan: 'An icon of the people, known for his range from close combat to long-range orbs. Surrounded by a strong round blue shield. Killed by Yunze.',
  yousuf: 'A young prodigy healer, so important that an escort of elite fighters was assigned to guard him. Killed by Yunze along with that escort.',
  gemia: 'One of Yousuf\'s guards, faster than most. She met Yunze alone and lost. He left her alive so others would fear him, and the scars beneath her eyes are from that fight.',
  trigg: 'Peguicha\'s servant and right hand, alongside Vehra. Tall, lanky and wingless, he summons hellish creatures and other things from the pit.',
  alfred: 'A katana user whose eyes see only a mass of blurry lines, which somehow lets him see more clearly. He frames targets with his fingers for sharper clarity and fights with an odd tempo that never stays the same.',
  ethan: 'King of a large and powerful kingdom, known as a talented, merciful ruler. He gives shelter and hospitality to Yousuf, his guards and his followers, and supports their campaign.',
  ben: 'Ethan\'s advisor. Smart and a sycophant, but genuinely useful: he gives the orders the king is too merciful to give himself.',
  kingsley: 'A joyous bard who performs in Ethan\'s palace for Yousuf and his people. There was always an odd depth to him, and it turned out he really was magical. His magic items are borrowed from Vasco.',
  vasco: 'The jester of Ethan\'s castle and the source of Kingsley\'s magic items. He keeps a collection of dark materials and has a far more evil alter ego he rarely shows. Secretly, he is a semi-vessel of Peguicha.',
  aamay: 'A mysterious scribe who works by pen and ink in a dark basement, documenting and chronicling everything that happens.',
  david: 'A spear user and one of Yousuf\'s guards. Killed when Yunze massacred the escort.'
};

/* When an update shipped. The oldest predate the repository and are marked as estimates. */
function verDate(e) {
  if (!e || !e.d) return '';
  const dt = new Date(e.d + 'T12:00:00');
  const txt = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return ` <em class="vdate">${e.about ? 'about ' : ''}${esc(txt)}</em>`;
}
const MOTION_LABEL = { full: 'Full', reduced: 'Reduced', auto: 'Auto' };
const MOTION_NOTE = {
  full: 'Every battle effect plays.',
  reduced: 'No screen shake, lunges or flashes. Damage numbers and hits still show.',
  auto: 'Follows the reduce motion setting on your device.'
};
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function sheet(html, onOpen) {
  closeSheet();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="ib close" aria-label="Close">✕</button>${html}</div>`;
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('.close')) closeSheet(); });
  document.body.appendChild(bg);
  UI.sheet = bg;
  if (onOpen) onOpen(bg);
}
function closeSheet() { if (UI.sheet) { UI.sheet.remove(); UI.sheet = null; } }
const uniq = a => [...new Set(a)];
const eraDots = id => HEROES[id].eras.map(e => `<i style="background:${ERA[e].color}"></i>`).join('');

/* ---------- title ---------- */
function showTitle() {
  UI.bt = null; closeSheet();
  const unlocked = HERO_ORDER.filter(isUnlocked).length;
  app().innerHTML = `<div class="scr">
<button class="ib corner" id="tSnd" aria-label="Sound">${SAVE.sound ? '🔊' : '🔇'}</button>
<div class="title">
  <h1 class="logo">Three Eras</h1><button class="vtag${SAVE.dev ? ' dev' : ''}" id="vtag" title="Tap five times for dev mode">v${esc(GAME_VERSION)}${typeof APPMODE !== 'undefined' && APPMODE ? ' app' : typeof OFFLINE !== 'undefined' && OFFLINE ? ' offline' : ''}${SAVE.dev ? ' dev' : ''}</button>
  <p class="tagline">Build a team of three from across the ages and fight whatever each era throws at you.</p>
  <div class="lineup">${HERO_ORDER.map(id => `<div class="lp ${isUnlocked(id) ? '' : 'locked'}">${heroPortrait(id)}</div>`).join('')}</div>
  <div class="menu">
    <button class="btn big prime" data-go="campaign">Campaign <small>★ ${totalStars()} / ${STAGES.length * 3}</small></button>
    <button class="btn big" data-go="gauntlet">Gauntlet <small>Best: wave ${SAVE.best || 0}</small></button>
    <button class="btn" data-go="custom">Custom battle <small>Heroes vs heroes</small></button>
    <button class="btn" data-go="heroes">Heroes <small>${unlocked} / ${HERO_ORDER.length}</small></button>
    <button class="btn" data-go="stats">Stats <small>Your record and research</small></button>
    <button class="btn" data-go="guide">Guide <small>Rules, stats, changes</small></button>
  </div>
  <p class="savenote"><span id="saveNote"></span> <button class="linkbtn" id="backupBtn">Save backup</button> <button class="linkbtn" id="fxBtn"></button></p>
  ${SAVE.migrated && !SAVE.migrNote ? '<p class="hint" style="max-width:320px">Your old progress carried over. New stages were added between your cleared ones, and some heroes now unlock from them.</p>' : ''}
</div></div>`;
  if (SAVE.migrated && !SAVE.migrNote) { SAVE.migrNote = true; store(); }
  updateSaveNote();
  $('#backupBtn').onclick = backupSheet;
  /* Five taps on the version tag turns dev mode on or off. ?dev in the address does the same. */
  const vt = $('#vtag');
  vt.onclick = () => {
    UI.devTaps = (UI.devTaps || 0) + 1;
    clearTimeout(UI.devTimer);
    UI.devTimer = setTimeout(() => { UI.devTaps = 0; }, 1500);
    if (UI.devTaps < 5) return;
    UI.devTaps = 0;
    SAVE.dev = !SAVE.dev;
    store(); SND.play('gain');
    toast(SAVE.dev ? 'Dev mode on: every hero and stage is unlocked.' : 'Dev mode off.');
    showTitle();
  };
  const fxBtn = $('#fxBtn');
  const drawFx = () => { fxBtn.textContent = 'Effects: ' + MOTION_LABEL[SAVE.motion]; };
  drawFx();
  fxBtn.onclick = () => {
    SAVE.motion = MOTION_MODES[(MOTION_MODES.indexOf(SAVE.motion) + 1) % MOTION_MODES.length];
    store(); applyMotion(); drawFx(); SND.play('click');
    toast(MOTION_NOTE[SAVE.motion]);
  };
  $('#tSnd').onclick = e => { SAVE.sound = !SAVE.sound; store(); e.currentTarget.textContent = SAVE.sound ? '🔊' : '🔇'; SND.play('click'); };
  $$('[data-go]').forEach(b => b.onclick = () => {
    SND.play('click');
    const g = b.dataset.go;
    if (g === 'campaign') showCampaign();
    else if (g === 'gauntlet') showTeam({ mode: 'gauntlet' });
    else if (g === 'heroes') showHeroes();
    else if (g === 'custom') showCustom();
    else if (g === 'stats') showStats('mine');
    else showGuide('basics');
  });
}

/* ---------- campaign ---------- */
function showCampaign() {
  UI.bt = null; closeSheet();
  let html = '', lastEra = null;
  STAGES.forEach((s, i) => {
    if (s.era !== lastEra) {
      const sub = s.era === 'echo' ? '<small>Post-game. Much harder.</small>' : '';
      html += `<div class="era-h" style="--ec:${eraVar(s.era)}">${ERA[s.era].name}${sub}</div>`;
      lastEra = s.era;
    }
    const locked = !stageOpen(i);
    const st = SAVE.stars[s.id] || 0;
    let reward = '';
    if (s.reward) {
      const rs = [].concat(s.reward), got = rs.every(isUnlocked), nm = rs.map(r => HEROES[r].name).join(' and ');
      reward = `<div class="reward ${got ? 'got' : ''}">${rs.map(r => `<span class="rp">${heroPortrait(r)}</span>`).join('')}${got ? `${esc(nm)} unlocked` : `Clear to unlock ${esc(nm)}`}</div>`;
    }
    html += `<button class="stage ${s.boss ? 'boss' : ''} ${locked ? 'locked' : ''}" data-i="${i}" style="--ec:${eraVar(s.era)}">
<div class="no"><span>${locked ? '🔒' : i + 1}</span></div>
<div class="sb2"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><div class="mini">${uniq(s.enemies).map(id => `<div class="m ${isHeroFoe(id) ? 'hf' : ''}">${foePortrait(id)}</div>`).join('')}</div>${reward}</div>
<div class="stars" aria-label="${st} of 3 stars">${[0, 1, 2].map(k => `<span class="${k < st ? 'on' : ''}">★</span>`).join('')}</div></button>`;
  });
  app().innerHTML = `<div class="scr"><div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Campaign<span class="sub">★ ${totalStars()} / ${STAGES.length * 3}. Clear a stage to open the next.</span></h2></div><div class="scroll">${html}</div></div>`;
  $('#back').onclick = showTitle;
  $$('.stage').forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (b.classList.contains('locked')) { toast('Clear the previous stage first.'); return; }
    SND.play('click');
    showTeam({ mode: 'campaign', idx: i });
  });
  const firstOpen = STAGES.findIndex(s => !(SAVE.stars[s.id] > 0));
  if (firstOpen > 2) { const el = $(`.stage[data-i="${firstOpen}"]`); if (el) el.scrollIntoView({ block: 'center' }); }
}

/* ---------- team select ---------- */
function synergyInfo(team) {
  const act = SYNERGIES.filter(s => s.test(team));
  const near = [];
  if (team.length < 3) {
    for (const s of SYNERGIES) {
      if (act.includes(s)) continue;
      const adds = HERO_ORDER.filter(id => isUnlocked(id) && !team.includes(id) && s.test([...team, id]));
      if (!adds.length) continue;
      const need = (s.id === 'first' || s.id === 'second' || s.id === 'current') ? `1 more ${ERA[s.id].name} hero` : adds.map(id => HEROES[id].name).join(' or ');
      near.push({ s, need });
    }
  }
  return { act, near };
}
function rosterCard(id, sel, dim) {
  const h = HEROES[id];
  if (!isUnlocked(id)) {
    const st = STAGES.find(s => s.id === UNLOCK_FROM[id]);
    return `<div class="rc locked" data-id="${id}" role="button" tabindex="0" aria-label="${esc(h.name)} is locked">
<div class="p">${heroPortrait(id)}</div><span class="lk">🔒</span>
<div class="meta"><b>${esc(h.name)}</b><small>Clear ${esc(st ? st.name : 'the campaign')}</small></div></div>`;
  }
  const b = buildOf(id, SAVE.builds[id]);
  return `<div class="rc ${sel ? 'sel' : ''} ${dim ? 'dim' : ''}" data-id="${id}" style="--hc:${h.color}" role="button" tabindex="0" aria-pressed="${sel}">
<div class="p">${heroPortrait(id)}</div><div class="dots">${eraDots(id)}</div>${h.legend ? '<span class="leg">Legend</span>' : ''}
<div class="meta"><b>${esc(h.name)}</b><small>${b.id === 'balanced' ? esc(h.role) : b.icon + ' ' + esc(b.name)}</small></div>
<button class="info" data-info="${id}" aria-label="About ${esc(h.name)}">i</button></div>`;
}
function showTeam(ctx) {
  UI.bt = null; closeSheet();
  UI.tctx = ctx;
  let team = uniq((SAVE.team || []).filter(id => HEROES[id] && isUnlocked(id)));
  const legs = team.filter(id => HEROES[id].legend);
  if (legs.length > 1) team = team.filter(id => !HEROES[id].legend || id === legs[0]);
  UI.team = team.slice(0, 3);
  renderTeam();
}
function buildSheet(id, inTeam) {
  const h = HEROES[id];
  const cur = buildOf(id, SAVE.builds[id]).id;
  sheet(`<div class="head" style="--hc:${h.color}"><div class="p">${heroPortrait(id)}</div><div><h3>${esc(h.name)}</h3><p>Choose a build. It applies everywhere you use ${esc(h.name)}.</p></div></div>
<div class="builds">${BUILDS[id].map(b => `<button class="bopt ${b.id === cur ? 'on' : ''}" data-b="${b.id}" style="--hc:${h.color}"><span class="i">${b.icon}</span><span><b>${esc(b.name)}</b>${buildMods(b)}<p>${esc(b.desc)}</p>${buildStatLine(id, b.id)}</span></button>`).join('')}</div>
<div class="resbtns" style="max-width:none;margin-top:12px"><button class="btn" id="bsInfo">Hero details</button>${inTeam ? '<button class="btn" id="bsRm">Remove from team</button>' : ''}</div>`, bg => {
    $$('.bopt', bg).forEach(o => o.onclick = () => { SAVE.builds[id] = o.dataset.b; store(); SND.play('select'); closeSheet(); if (UI.tctx && $('#fight')) renderTeam(); else if ($('.roster')) showHeroes(); });
    $('#bsInfo', bg).onclick = () => heroSheet(id);
    const rm = $('#bsRm', bg); if (rm) rm.onclick = () => { UI.team = UI.team.filter(x => x !== id); closeSheet(); renderTeam(); };
  });
}
function renderTeam() {
  const ctx = UI.tctx, team = UI.team;
  let head, info;
  if (ctx.mode === 'campaign') {
    const st = STAGES[ctx.idx];
    head = st.name;
    info = `<div class="foes">${uniq(st.enemies).map(id => `<button class="m" data-foe="${id}" aria-label="${esc(foeName(id))}">${foePortrait(id)}</button>`).join('')}<div class="fn"><b style="color:var(--tx)">${esc(uniq(st.enemies).map(foeName).join(', '))}</b><br>${esc(st.desc)}</div></div>`;
  } else {
    head = 'Gauntlet';
    info = `<div class="foes"><div class="fn">Endless waves with a boss every fifth wave. After each win your team heals 30% and you choose a boon. Wounds carry over. Best so far: wave ${SAVE.best || 0}.</div></div>`;
  }
  const { act, near } = synergyInfo(team);
  const slots = [0, 1, 2].map(i => {
    const id = team[i];
    if (!id) return `<div class="slot">Empty</div>`;
    const h = HEROES[id], b = buildOf(id, SAVE.builds[id]);
    return `<div class="slot full" style="--hc:${h.color}"><button class="sl-main" data-slot="${id}" aria-label="${esc(h.name)} build"><div class="p">${heroPortrait(id)}</div><div class="lbl">${esc(h.name)}<small>${b.icon} ${esc(b.name)}</small></div></button><button class="x" data-rm="${id}" aria-label="Remove ${esc(h.name)}">✕</button></div>`;
  }).join('');
  const syns = act.map(s => `<button class="syn" data-syn="${s.id}" style="--sc:${s.color}">${s.icon} ${esc(s.name)}<small>${esc(s.desc)}</small></button>`).join('') +
    near.map(n => `<button class="syn off" data-syn="${n.s.id}" style="--sc:${n.s.color}">${n.s.icon} ${esc(n.s.name)}: add ${esc(n.need)}</button>`).join('');
  const hasLeg = team.some(id => HEROES[id].legend);
  const ordered = HERO_ORDER.filter(isUnlocked).concat(HERO_ORDER.filter(id => !isUnlocked(id)));
  app().innerHTML = `<div class="scr">
<div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Your team<span class="sub">${esc(head)}</span></h2></div>
<div class="scroll">
${info}
<div class="slots">${slots}</div>
<div class="syns">${syns || '<span class="hint" style="margin:4px 0">Heroes who belong together unlock team bonuses.</span>'}</div>
<p class="hint">Tap a hero to add or remove. Tap a hero in a slot to pick their build. One Legend per team.</p>
<div class="roster">${ordered.map(id => rosterCard(id, team.includes(id), !team.includes(id) && (team.length >= 3 || (hasLeg && HEROES[id].legend)))).join('')}</div>
</div>
<div class="footbar"><button class="btn big prime" id="fight" ${team.length === 3 ? '' : 'disabled'}>${team.length === 3 ? (ctx.mode === 'campaign' ? 'Fight' : 'Start run') : `Pick ${3 - team.length} more`}</button></div>
</div>`;
  $('#back').onclick = () => (ctx.mode === 'campaign' ? showCampaign() : showTitle());
  $$('[data-rm]').forEach(b => b.onclick = e => { e.stopPropagation(); UI.team = UI.team.filter(x => x !== b.dataset.rm); SND.play('click'); renderTeam(); });
  $$('[data-slot]').forEach(b => b.onclick = () => buildSheet(b.dataset.slot, true));
  $$('[data-foe]').forEach(b => b.onclick = () => (isHeroFoe(b.dataset.foe) ? heroSheet(foeId(b.dataset.foe)) : enemyInfoSheet(b.dataset.foe, ctx.mode === 'campaign' ? STAGES[ctx.idx] : null)));
  $$('[data-syn]').forEach(b => b.onclick = () => { const s = SYNERGIES.find(x => x.id === b.dataset.syn); sheet(`<h3>${s.icon} ${esc(s.name)}</h3><p style="margin-top:10px">${esc(s.desc)}</p>`); });
  $$('.rc').forEach(c => {
    const toggle = () => {
      const id = c.dataset.id, t = UI.team;
      if (!isUnlocked(id)) { const st = STAGES.find(s => s.id === UNLOCK_FROM[id]); toast(`Clear ${st ? st.name : 'the campaign'} to unlock ${HEROES[id].name}.`); return; }
      if (t.includes(id)) UI.team = t.filter(x => x !== id);
      else if (t.length >= 3) { toast('Your team is full. Tap ✕ on a slot to remove someone.'); return; }
      else if (HEROES[id].legend && t.some(x => HEROES[x].legend)) { toast('Only one Legend per team.'); return; }
      else UI.team = [...t, id];
      SND.play('select');
      const sc = $('.scroll').scrollTop;
      renderTeam();
      $('.scroll').scrollTop = sc;
    };
    c.addEventListener('click', e => { if (e.target.closest('[data-info]')) { e.stopPropagation(); heroSheet(c.dataset.id); return; } toggle(); });
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  $('#fight').onclick = () => {
    if (UI.team.length !== 3) return;
    SAVE.team = UI.team.slice(); store();
    if (ctx.mode === 'campaign') startStage(ctx.idx); else startGauntlet();
  };
}

/* ---------- heroes gallery ---------- */
function showHeroes() {
  UI.bt = null; closeSheet();
  let html = '';
  for (const e of ['first', 'second', 'current']) {
    html += `<div class="era-h" style="--ec:${eraVar(e)}">${ERA[e].name}</div><div class="roster">${HERO_ORDER.filter(id => HEROES[id].eras.includes(e)).map(id => rosterCard(id, false, false)).join('')}</div>`;
  }
  app().innerHTML = `<div class="scr"><div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Heroes<span class="sub">Tap a hero for details and builds. Harry, Yunze and Malakai span several eras.</span></h2></div><div class="scroll">${html}</div></div>`;
  $('#back').onclick = showTitle;
  $$('.rc').forEach(c => c.onclick = e => {
    const id = c.dataset.id;
    if (!isUnlocked(id)) { const st = STAGES.find(s => s.id === UNLOCK_FROM[id]); toast(`Clear ${st ? st.name : 'the campaign'} to unlock ${HEROES[id].name}.`); return; }
    heroSheet(id);
  });
}

/* ---------- info sheets ---------- */
function synergiesFor(id) {
  return SYNERGIES.filter(s => HERO_ORDER.some(a => HERO_ORDER.some(b => a !== b && a !== id && b !== id && s.test([id, a, b]) && !s.test([a, b]))));
}
function abilHTML(ic, name, kind, desc) {
  return `<div class="abil"><div class="ic">${ic}</div><div><b>${esc(name)}</b><span class="k">${kind}</span><p>${esc(desc)}</p></div></div>`;
}
const pctTxt = v => Math.round(v * 100) + '%';
/* What each build mod means, and whether it scales a stat or is added to a chance. */
const MODINFO = {
  hp: { label: 'Max HP', mul: true }, atk: { label: 'ATK', mul: true }, def: { label: 'DEF', mul: true },
  spd: { label: 'SPD', mul: true }, crit: { label: 'Crit chance' }, cdmg: { label: 'Crit damage' },
  eva: { label: 'Evasion' }, dot: { label: 'Burn, Shock, Bleed and Poison' }, heal: { label: 'Healing' },
  shield: { label: 'Shields' }, lifesteal: { label: 'Lifesteal' }, ultGain: { label: 'Ultimate charge' },
  dmg: { label: 'Damage dealt' }, exec: { label: 'Damage below 30% HP' }, acc: { label: 'Accuracy' }
};
const modPct = v => (v > 0 ? '+' : '') + Math.round(v * 100) + '%';
/* The stat changes a build makes, as chips, so a build is never only prose. */
function buildMods(b) {
  const m = (b && b.mods) || {};
  const keys = Object.keys(m).filter(k => m[k] && MODINFO[k]);
  if (!keys.length) return '';
  return `<span class="bmods">${keys.map(k => `<i class="${m[k] > 0 ? 'up' : 'dn'}">${esc(MODINFO[k].label)} ${modPct(m[k])}</i>`).join('')}</span>`;
}
function statRows(s, hc, b) {
  const m = (b && b.mods) || {};
  const row = (l, v, mx, t, was) => `<div class="statrow"><span>${l}</span><div class="bar"><i style="width:${Math.min(100, v / mx * 100)}%"></i></div><span>${t || Math.round(v)}${was ? ` <em class="mchg ${v > was ? 'up' : 'dn'}">was ${was}</em>` : ''}</span></div>`;
  // hp, atk, def and spd scale the base; crit, cdmg and eva are added to it.
  const sc = (v, k) => v * (1 + (m[k] || 0));
  const ad = (v, k) => (v || 0) + (m[k] || 0);
  const chg = (nv, ov, fmt) => (Math.round(nv) !== Math.round(ov) ? (fmt ? fmt(ov) : Math.round(ov)) : 0);
  const hp = sc(s.hp, 'hp'), atk = sc(s.atk, 'atk'), def = sc(s.def, 'def'), spd = sc(s.spd, 'spd');
  const cr = ad(s.crit || 0.08, 'crit'), ev = ad(s.eva || 0, 'eva');
  return `<div style="--hc:${hc}">${row('HP', hp, 1750, null, chg(hp, s.hp))}${row('ATK', atk, 148, null, chg(atk, s.atk))}${row('DEF', def, 130, null, chg(def, s.def))}${row('SPD', spd, 146, null, chg(spd, s.spd))}${row('Crit', cr, 0.2, pctTxt(cr), chg(cr * 100, (s.crit || 0.08) * 100, v => pctTxt(v / 100)))}${row('EVA', ev, 0.25, pctTxt(ev), chg(ev * 100, (s.eva || 0) * 100, v => pctTxt(v / 100)))}${s.acc ? row('ACC', s.acc, 0.15, '+' + pctTxt(s.acc)) : ''}</div>`;
}
function heroSheet(id) {
  const h = HEROES[id];
  const rivals = (RIVALS[id] || []).map(r => HEROES[r].name);
  const huntedBy = Object.keys(RIVALS).filter(k => RIVALS[k].includes(id)).map(k => HEROES[k].name);
  const syns = synergiesFor(id);
  const unlocked = isUnlocked(id);
  const cur = buildOf(id, SAVE.builds[id]).id;
  sheet(`<div class="head" style="--hc:${h.color}"><div class="p">${heroPortrait(id, { glow: id === 'harry' })}</div><div><h3>${esc(h.name)}</h3><p>${esc(h.title)}</p><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${h.eras.map(e => `<span class="chip" style="border-color:${ERA[e].color}">${ERA[e].name}</span>`).join('')}<span class="chip">${esc(h.role)}</span></div></div></div>
<p class="bio" style="--hc:${h.color};margin-top:12px">${esc(BIO[id])}</p>
${heroStatsHTML(id)}
<h4>Stats with ${esc(buildOf(id, SAVE.builds[id]).name)} <button class="qbtn" data-guide="stats">What do these mean?</button></h4>
${statRows(h.stats, h.color, buildOf(id, SAVE.builds[id]))}
<h4>Abilities</h4>
${abilHTML('✦', h.passive.name, 'Passive', h.passive.desc)}
${abilHTML(h.basic.icon, h.basic.name, 'Basic, +1 SP', h.basic.desc)}
${abilHTML(h.skill.icon, h.skill.name, 'Skill, 1 SP', h.skill.desc)}
${abilHTML(h.ult.icon, h.ult.name, 'Ultimate', h.ult.desc)}
${h.alt ? `<h4>His other set, while ${esc(STATUS[h.altWhen].name)} holds him</h4>${abilHTML(h.alt.basic.icon, h.alt.basic.name, 'Basic, +1 SP', h.alt.basic.desc)}${abilHTML(h.alt.skill.icon, h.alt.skill.name, 'Skill, 1 SP', h.alt.skill.desc)}${abilHTML(h.alt.ult.icon, h.alt.ult.name, 'Ultimate', h.alt.ult.desc)}` : ''}
${(() => { const hist = BALANCE.flatMap(v => v.changes.filter(c => c.kind === 'hero' && c.who === id).map(c => Object.assign({ v: v.v }, c))); return hist.length ? `<h4>Balance history <button class="qbtn" data-guide="balance">All changes</button></h4>${hist.map(c => bcRow(c, false).replace('<div class="btx">', `<div class="btx"><span class="bv">v${esc(c.v)}</span> `)).join('')}` : ''; })()}
<h4>Builds</h4>
<div class="builds">${BUILDS[id].map(b => `<button class="bopt ${b.id === cur ? 'on' : ''}" data-b="${b.id}" style="--hc:${h.color}" ${unlocked ? '' : 'disabled'}><span class="i">${b.icon}</span><span><b>${esc(b.name)}${b.id === cur ? ' <em>Equipped</em>' : ''}</b>${buildMods(b)}<p>${esc(b.desc)}</p>${buildStatLine(id, b.id)}</span></button>`).join('')}</div>
${rivals.length || huntedBy.length ? `<h4>Rivals</h4>${rivals.length ? `<p>Deals 20% more damage to ${esc(rivals.join(', '))}.</p>` : ''}${huntedBy.length ? `<p>${esc(huntedBy.join(', '))} ${huntedBy.length > 1 ? 'deal' : 'deals'} 20% more damage to ${esc(h.name)}.</p>` : ''}` : ''}
${syns.length ? `<h4>Team bonuses</h4>${syns.map(sy => `<p><b style="color:var(--tx)">${sy.icon} ${esc(sy.name)}.</b> ${esc(sy.desc)}</p>`).join('')}` : ''}`, bg => {
    $$('.bopt', bg).forEach(o => o.onclick = () => { SAVE.builds[id] = o.dataset.b; store(); SND.play('select'); heroSheet(id); if (UI.tctx && $('#fight')) renderTeam(); });
    $$('[data-guide]', bg).forEach(b => b.onclick = () => { closeSheet(); showGuide(b.dataset.guide); });
    $$('[data-stats]', bg).forEach(b => b.onclick = () => { closeSheet(); showStats('sim'); });
  });
}
function moveDesc(m) {
  const p = [];
  const tgt = { single: 'One hero', all: 'Whole team', self: 'Self', ally: 'One ally', allies: 'All allies' }[m.target];
  if (m.mult) p.push(`${pctTxt(m.mult)} ATK${m.hits ? ` ×${m.hits}` : ''}`);
  if (m.run === 'thousand') p.push('6 strikes of 50% ATK on random heroes');
  if (m.run === 'spendGrace') p.push('plus 15% per Grace stack spent');
  if (m.run === 'transmute') p.push('strips buffs and Shields, then DEF -20%');
  if (m.run === 'summon') p.push(`summons a ${ENEMIES[m.summonId || 'homunculus'].name}`);
  if (m.run === 'charge') p.push(`charges a Cataclysm for its next turn. Deal ${pctTxt(m.breakAt || 0.12)} of its max HP first to break it`);
  if (m.run === 'raise') p.push('raises one fallen ally at 50% HP (each can rise once)');
  if (m.run === 'reforge') p.push('restores 8 plates');
  if (m.pierce === 1) p.push('ignores DEF'); else if (m.pierce) p.push(`ignores ${pctTxt(m.pierce)} of DEF`);
  if (m.sure) p.push('cannot miss');
  if (m.acc) p.push(`${m.acc > 0 ? '+' : ''}${pctTxt(m.acc)} ACC`);
  if (m.pierceTaunt) p.push('ignores Taunt');
  if (m.critBonus) p.push(`+${pctTxt(m.critBonus)} crit chance`);
  if (m.status) p.push((m.status.chance ? pctTxt(m.status.chance) + ' chance of ' : 'applies ') + (m.status.key === 'alch' ? 'a random debuff' : STATUS[m.status.key].name + (m.status.value ? ' ' + pctTxt(m.status.value) : '')));
  if (m.heal) p.push(`heals ${pctTxt(m.heal)} max HP`);
  if (m.shield) p.push(`Shield worth ${pctTxt(m.shield)} max HP`);
  [].concat(m.self || []).filter(s => !s.silent).forEach(s => p.push('gains ' + STATUS[s.key].name + (s.value ? ' ' + pctTxt(s.value) : '')));
  [].concat(m.allies || []).forEach(s => p.push('allies gain ' + STATUS[s.key].name + (s.value ? ' ' + pctTxt(s.value) : '')));
  if (m.cd) p.push(`then rests ${m.cd} turns`);
  return `${tgt}: ${p.join(', ')}.`;
}
function enemyNotes(d) {
  const notes = [];
  if (d.multi) notes.push(`Acts ${d.multi} times per turn.`);
  if (d.half) notes.push(`At half HP: ${d.half.title}. ${d.half.sub}.`);
  if (d.phase2) notes.push('The first time he falls, something changes.');
  if (d.onDeath === 'explode') notes.push('Bursts when it dies, hitting your whole team for 60% ATK.');
  if (d.priority) notes.push('Supports the others. Worth killing first.');
  if (d.charged) notes.push(`Gather the Storm leads into ${d.charged.name} (${pctTxt(d.charged.mult)} ATK to the whole team, cannot miss) unless you break the charge.`);
  if (d === ENEMIES.ironWarden) notes.push('Starts with 10 plates. Each plate halves damage taken. Every direct hit removes one. At zero it is Exposed for 2 turns and loses time.');
  if (d === ENEMIES.elphiBoss) notes.push('Warded while any Light Wisp lives: takes 50% less damage.');
  if (d.ghost) notes.push('An afterimage of Yunze. Counts as Yunze for rivals and for Gemia\'s fear.');
  if (d.boss) notes.push('Bosses cannot be stunned. Stuns push their next turn back instead.');
  return notes;
}
function enemyInfoSheet(id, stage) {
  const d = ENEMIES[id];
  const look = d.heroId ? HEROES[d.heroId].look : d.look;
  const s = d.stats, m = stage ? { atk: stage.atk, hp: stage.hp } : { atk: 1, hp: 1 };
  const sc = Object.assign({}, s, { hp: Math.round(s.hp * m.hp), atk: Math.round(s.atk * m.atk) });
  const notes = enemyNotes(d);
  sheet(`<div class="head" style="--hc:${d.color}"><div class="p">${portraitSVG(look, {})}</div><div><h3>${esc(d.name)}</h3><p>${esc(d.title || (d.boss ? 'Boss' : d.elite ? 'Elite' : d.priority ? 'Support' : 'Enemy'))}</p>${stage ? `<p style="font-size:12px">Stats shown for ${esc(stage.name)}.</p>` : ''}</div></div>
<h4>Stats</h4><div class="chips">${[['HP', sc.hp], ['ATK', sc.atk], ['DEF', s.def], ['SPD', s.spd], ['EVA', pctTxt(s.eva || 0)]].map(([k, v]) => `<span class="chip">${k} <b>${v}</b></span>`).join('')}</div>
<h4>Moves</h4>${d.moves.map(mv => abilHTML(mv.icon, mv.name, '', moveDesc(mv))).join('')}${d.charged ? abilHTML(d.charged.icon, d.charged.name, 'After charging', moveDesc(d.charged)) : ''}
${d.moves2 ? `<h4>Second phase</h4>${d.moves2.map(mv => abilHTML(mv.icon, mv.name, '', moveDesc(mv))).join('')}` : ''}
${notes.length ? `<h4>Notes</h4>${notes.map(n => `<p>${esc(n)}</p>`).join('')}` : ''}`);
}
function statusLine(st, u) {
  const d = STATUS[st.key];
  const name = st.key === 'stance' ? (st.value === 'far' ? 'Far stance' : 'Close stance') : d.name;
  let desc = d.desc || '';
  if (d.stat) desc = `${d.name.split(' ')[0]} ${d.neg ? '-' : '+'}${pctTxt(st.value || 0.2)}.`;
  if (d.dot) desc = `${Math.round((st.dot || 40) * (st.stacks || 1))} damage at the start of each turn.`;
  if (st.key === 'grace') desc = `${st.stacks} stacks, +${st.stacks * 5}% crit chance${u && u.isHero && u.id === 'chosen' ? `, ${st.stacks * 3}% less damage taken` : ''}.`;
  if (st.key === 'channel' && st.target) desc = `Beam on ${st.target.name} at stage ${st.value}. Heat Haze: +12% evasion. Breaks after ${Math.max(0, Math.round(u.maxHp * beamBreak(u) - (st.taken || 0)))} more damage before his next turn.`;
  if (st.key === 'charging') desc = `Needs ${Math.max(0, Math.ceil(st.value - (st.taken || 0)))} more damage before its next turn to break.`;
  if (st.key === 'hexwall') desc = `Strength ${Math.round(st.value)} of ${u ? wallMax(u) : '?'}. Soaks ${Math.round((u ? (bt(u, 'wallSoak') || 0.3) : 0.3) * 100)}% of every direct hit on his team.`;
  if (st.key === 'bracelet') desc = `${st.stacks} beads left on the bracelet.`;
  if (st.key === 'cinder') desc = `${st.stacks} ${st.stacks === 1 ? 'bead' : 'beads'} embedded: ${Math.round((st.dot || 0) * st.stacks)} pain per turn, ATK and DEF -${st.stacks * 8}%.`;
  if (st.key === 'tempo') desc = { allegro: 'Allegro: hits for 80% and his next turn comes 50% sooner.', andante: 'Andante: steady, normal hits.', grave: 'Grave: slow and crushing, hits for 140%.' }[st.value] || '';
  if (st.key === 'pages') desc = `${st.stacks} of ${u ? pageCap(u) : '?'} Pages. The Last Page spends them all: ${Math.round(st.stacks * (u ? (bt(u, 'pageMult') || 0.15) : 0.15) * 100)}% ATK to every enemy right now.`;
  if (st.key === 'vengeance') desc = `${st.stacks} stored. Next Spear Thrust: +${st.stacks * 12}% damage and heals ${st.stacks * 2}% max HP.`;
  if (st.key === 'hunted') desc = `Takes ${pctTxt(st.value || 0.25)} more damage from the Yunze who marked it.`;
  const extra = [];
  if (d.max && st.stacks > 1) extra.push(`×${st.stacks}`);
  if (st.turns < 99) extra.push(`${st.turns} ${st.turns === 1 ? 'turn' : 'turns'} left`);
  const icon = st.key === 'stance' ? (st.value === 'far' ? '🔵' : '👊') : d.icon;
  return `<div><b style="color:${d.color}">${icon} ${esc(name)}</b>${extra.length ? ` <span style="color:var(--tx3)">${extra.join(', ')}</span>` : ''}<br><span style="color:var(--tx2)">${esc(desc)}</span></div>`;
}
function unitSheet(u) {
  const look = lookOf(u);
  const en = u.side === 'enemy';
  const statCell = (l, k, pct) => {
    const v = stat(u, k), b = (k === 'eva' || k === 'acc') ? u.base[k] + (u.mods[k] || 0) : u.base[k] * (1 + (u.mods[k] || 0));
    const col = v > b + 1e-6 ? '#5dff8f' : v < b - 1e-6 ? '#ff6b78' : 'var(--tx)';
    return `<span class="chip">${l} <b style="color:${col}">${pct ? pctTxt(v) : Math.round(v)}</b></span>`;
  };
  let body = `<div class="head" style="--hc:${u.color}"><div class="p">${portraitSVG(look, { glow: !!u.flags.glow })}</div><div><h3>${esc(u.name)}</h3><p>${esc(!u.isHero ? (u.def.title || (u.def.boss ? 'Boss' : u.def.elite ? 'Elite' : u.def.priority ? 'Support' : 'Enemy')) : (en ? 'Opponent: ' : '') + HEROES[u.id].title + (u.build && u.build.id !== 'balanced' ? ', ' + u.build.name : ''))}</p>
<div class="chips"><span class="chip">HP <b>${Math.ceil(u.hp)} / ${u.maxHp}</b></span>${u.shield > 0 ? `<span class="chip">Shield <b>${u.shield}</b></span>` : ''}${statCell('ATK', 'atk')}${statCell('DEF', 'def')}${statCell('SPD', 'spd')}${statCell('Crit', 'crit', 1)}${statCell('EVA', 'eva', 1)}${stat(u, 'acc') ? statCell('ACC', 'acc', 1) : ''}${u.isHero ? `<span class="chip">Ult <b>${Math.floor(u.ult)}%</b></span>` : ''}${u.id === 'yunze' && u.isHero && u.flags.skillCd > 0 ? `<span class="chip">Phantom Switch in <b>${u.flags.skillCd}</b></span>` : ''}</div></div></div>`;
  body += `<h4>Statuses</h4><div class="sts-list">${u.statuses.length ? u.statuses.map(x => statusLine(x, u)).join('') : '<p>None.</p>'}</div>`;
  if (en && !u.isHero) {
    if (u.intents.length) body += `<h4>Next turn</h4>${u.intents.map(it => `<p><b style="color:var(--tx)">${it.move.icon} ${esc(it.move.name)}</b>${it.target && it.move.target === 'single' ? ` on ${esc(it.target.name)}` : ''}. ${esc(moveDesc(it.move))}</p>`).join('')}`;
    body += `<h4>Moves</h4>${movesFor(u).map(m => abilHTML(m.icon, m.name, u.cd[m.id] > 0 ? `resting ${u.cd[m.id]}` : '', moveDesc(m))).join('')}`;
    const notes = enemyNotes(u.def);
    if (notes.length) body += `<h4>Notes</h4>${notes.map(n => `<p>${esc(n)}</p>`).join('')}`;
  } else {
    const h = HEROES[u.id];
    if (en && u.intents.length) body += `<h4>Next turn</h4>${u.intents.map(it => `<p><b style="color:var(--tx)">${it.move.icon} ${esc(it.move.name)}</b>${it.target && it.move.target === 'single' ? ` on ${esc(it.target.name)}` : ''}</p>`).join('')}`;
    const ab = k => abil(u, k);
    body += `<h4>Abilities${h.alt && has(u, h.altWhen) ? ' <span class="chip">' + esc(STATUS[h.altWhen].name) + '</span>' : ''}</h4>${abilHTML('✦', h.passive.name, 'Passive', h.passive.desc)}${abilHTML(ab('basic').icon, ab('basic').name, 'Basic', ab('basic').desc)}${abilHTML(ab('skill').icon, ab('skill').name, 'Skill', ab('skill').desc)}${abilHTML(ab('ult').icon, ab('ult').name, 'Ultimate', ab('ult').desc)}`;
    if (u.build && u.build.id !== 'balanced') body += `<h4>Build</h4>${abilHTML(u.build.icon, u.build.name, 'Build', u.build.desc)}`;
  }
  sheet(body);
}

/* ---------- save backup: move progress between the online and offline versions ---------- */
function saveCode() { return 'TE1:' + btoa(unescape(encodeURIComponent(JSON.stringify(SAVE)))); }
function readCode(txt) {
  const t = String(txt || '').replace(/\s+/g, '');
  if (!t.startsWith('TE1:')) throw new Error('This is not a Three Eras save code.');
  const o = JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));
  if (!o || typeof o !== 'object' || typeof o.stars !== 'object') throw new Error('The save code is damaged.');
  return o;
}
function backupSheet() {
  const offline = typeof OFFLINE !== 'undefined' && OFFLINE;
  const stars = totalStars(), battles = recState().hist.length;
  sheet(`<h3>Save backup</h3><p>Copy this code to keep a backup or to move your progress between the online and offline versions of the game. It holds your stars, team, builds, settings and records.</p>
<p class="hint">This save: ★ ${stars} / ${STAGES.length * 3}, Gauntlet best wave ${SAVE.best || 0}, ${battles} recent battles.</p>
<textarea class="codebox" id="exportCode" readonly rows="4">${esc(saveCode())}</textarea>
<div class="resbtns" style="max-width:none"><button class="btn prime" id="copyCode">Copy code</button>${offline ? '<button class="btn" id="dlCode">Download file</button>' : ''}</div>
<h4>Load a save</h4><p>Paste a code from the other version. Merge keeps the best of both saves (highest stars, best wave, all records). Replace overwrites this save completely.</p>
<textarea class="codebox" id="importCode" rows="4" placeholder="Paste a save code that starts with TE1:"></textarea>
${offline ? '<p class="hint">Or load a backup file: <input type="file" id="importFile" accept=".txt,.json,text/plain"></p>' : ''}
<div class="resbtns" style="max-width:none"><button class="btn" id="mergeCode">Merge</button><button class="btn" id="replaceCode">Replace</button></div>
<p class="hint" id="importMsg"></p>`, bg => {
    $('#copyCode', bg).onclick = () => {
      const ta = $('#exportCode', bg), done = () => toast('Save code copied.');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Select the code and copy it.'); } });
      else { ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Select the code and copy it.'); } }
    };
    const dl = $('#dlCode', bg);
    if (dl) dl.onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([saveCode()], { type: 'text/plain' })); a.download = 'three-eras-save.txt'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
    const fi = $('#importFile', bg);
    if (fi) fi.onchange = () => { const f = fi.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $('#importCode', bg).value = String(r.result || '').trim(); $('#importMsg', bg).textContent = 'File loaded. Choose Merge or Replace.'; }; r.readAsText(f); };
    const apply = mode => {
      let o;
      try { o = readCode($('#importCode', bg).value); } catch (e) { $('#importMsg', bg).textContent = e.message; return; }
      if (mode === 'replace') { for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, saveDefaults(), o); }
      else { mergeSave(o); SAVE.builds = Object.assign({}, o.builds || {}, SAVE.builds); }
      if (!SAVE.stars || typeof SAVE.stars !== 'object') SAVE.stars = {};
      if (!MOTION_MODES.includes(SAVE.motion)) SAVE.motion = 'full';
      applyMotion();
      store(); closeSheet(); showTitle(); toast(mode === 'replace' ? 'Save replaced.' : 'Saves merged.');
    };
    $('#mergeCode', bg).onclick = () => apply('merge');
    $('#replaceCode', bg).onclick = () => apply('replace');
  });
}

/* ---------- custom battle ---------- */
function customState() {
  const c = SAVE.custom || (SAVE.custom = {});
  c.team = uniq((c.team || []).filter(id => HEROES[id] && isUnlocked(id))).slice(0, 3);
  c.foes = uniq((c.foes || []).filter(id => HEROES[id])).slice(0, 5);
  c.foeBuilds = c.foeBuilds || {};
  c.power = c.power || 1;
  if (!c.team.length && !c.foes.length) { c.team = HERO_ORDER.filter(isUnlocked).slice(0, 3); c.foes = ['harry']; }
  return c;
}
function customBuildSheet(id, side) {
  const h = HEROES[id], c = customState();
  const cur = side === 'team' ? buildOf(id, SAVE.builds[id]).id : buildOf(id, c.foeBuilds[id]).id;
  sheet(`<div class="head" style="--hc:${h.color}"><div class="p">${heroPortrait(id)}</div><div><h3>${esc(h.name)}</h3><p>${side === 'team' ? 'Your build. It applies everywhere you use ' + esc(h.name) + '.' : 'Opponent build, used only in custom battles.'}</p></div></div>
<div class="builds">${BUILDS[id].map(b => `<button class="bopt ${b.id === cur ? 'on' : ''}" data-b="${b.id}" style="--hc:${h.color}"><span class="i">${b.icon}</span><span><b>${esc(b.name)}</b><p>${esc(b.desc)}</p>${buildStatLine(id, b.id)}</span></button>`).join('')}</div>
<div class="resbtns" style="max-width:none;margin-top:12px"><button class="btn" id="cbInfo">Hero details</button><button class="btn" id="cbRm">Remove</button></div>`, bg => {
    $$('.bopt', bg).forEach(o => o.onclick = () => { if (side === 'team') SAVE.builds[id] = o.dataset.b; else c.foeBuilds[id] = o.dataset.b; store(); SND.play('select'); closeSheet(); showCustom(); });
    $('#cbInfo', bg).onclick = () => heroSheet(id);
    $('#cbRm', bg).onclick = () => { if (side === 'team') c.team = c.team.filter(x => x !== id); else c.foes = c.foes.filter(x => x !== id); store(); closeSheet(); showCustom(); };
  });
}
function showCustom() {
  UI.bt = null; closeSheet();
  const c = customState();
  UI.cside = UI.cside || 'team';
  const slot = (id, side) => {
    if (!id) return `<div class="slot">Empty</div>`;
    const h = HEROES[id], b = side === 'team' ? buildOf(id, SAVE.builds[id]) : buildOf(id, c.foeBuilds[id]);
    return `<div class="slot full" style="--hc:${h.color}"><button class="sl-main" data-cs="${side}" data-id="${id}"><div class="p">${heroPortrait(id)}</div><div class="lbl">${esc(h.name)}<small>${b.icon} ${esc(b.name)}</small></div></button><button class="x" data-crm="${side}" data-id="${id}" aria-label="Remove ${esc(h.name)}">✕</button></div>`;
  };
  const tSyn = activeSynergies(c.team), fSyn = activeSynergies(c.foes);
  const synRow = list => list.length ? `<div class="syns">${list.map(s => `<span class="syn" style="--sc:${s.color}">${s.icon} ${esc(s.name)}</span>`).join('')}</div>` : '';
  const powers = [0.75, 1, 1.25, 1.5];
  const roster = HERO_ORDER.map(id => {
    const h = HEROES[id], inT = c.team.includes(id), inF = c.foes.includes(id);
    const locked = UI.cside === 'team' && !isUnlocked(id);
    const full = UI.cside === 'team' ? c.team.length >= 3 && !inT : c.foes.length >= 5 && !inF;
    return `<div class="rc ${locked ? 'locked' : ''} ${(UI.cside === 'team' ? inT : inF) ? 'sel' : ''} ${full ? 'dim' : ''}" data-id="${id}" style="--hc:${h.color}" role="button" tabindex="0">
<div class="p">${heroPortrait(id)}</div>${locked ? '<span class="lk">🔒</span>' : ''}<div class="dots">${eraDots(id)}</div>
${inT || inF ? `<span class="sidetag">${inT ? '<i class="you">You</i>' : ''}${inF ? '<i class="foe">Foe</i>' : ''}</span>` : ''}
<div class="meta"><b>${esc(h.name)}</b><small>${esc(h.role)}</small></div><button class="info" data-info="${id}" aria-label="About ${esc(h.name)}">i</button></div>`;
  }).join('');
  app().innerHTML = `<div class="scr">
<div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Custom battle<span class="sub">Heroes against heroes. No effect on progress.</span></h2></div>
<div class="scroll">
<h4 class="ch">Your team <small>${c.team.length} / 3</small></h4>
<div class="slots">${[0, 1, 2].map(i => slot(c.team[i], 'team')).join('')}</div>${synRow(tSyn)}
<h4 class="ch">Opponents <small>${c.foes.length} / 5</small></h4>
<div class="slots five">${[0, 1, 2, 3, 4].map(i => slot(c.foes[i], 'foes')).join('')}</div>${synRow(fSyn)}
<h4 class="ch">Opponent strength</h4>
<div class="bfilters">${powers.map(p => `<button class="bfc ${c.power === p ? 'on' : ''}" data-pw="${p}">${Math.round(p * 100)}%</button>`).join('')}</div>
<p class="hint">Strength scales opponents' HP and ATK.</p>
<div class="seg"><button class="${UI.cside === 'team' ? 'on' : ''}" data-side="team">Add to your team</button><button class="${UI.cside === 'foes' ? 'on' : ''}" data-side="foes">Add to opponents</button></div>
<p class="hint">${UI.cside === 'team' ? 'Your side uses unlocked heroes.' : 'Opponents can be any hero, including ones you haven\'t unlocked and ones also on your team.'} Tap a hero in a slot to change their build.</p>
<div class="roster">${roster}</div>
</div>
<div class="footbar"><button class="btn big prime" id="cgo" ${c.team.length && c.foes.length ? '' : 'disabled'}>${c.team.length && c.foes.length ? `Fight ${c.team.length} vs ${c.foes.length}` : 'Pick both sides'}</button></div></div>`;
  $('#back').onclick = showTitle;
  $$('[data-side]').forEach(b => b.onclick = () => { UI.cside = b.dataset.side; SND.play('click'); const sc = $('.scroll').scrollTop; showCustom(); $('.scroll').scrollTop = sc; });
  $$('[data-pw]').forEach(b => b.onclick = () => { c.power = +b.dataset.pw; store(); SND.play('click'); const sc = $('.scroll').scrollTop; showCustom(); $('.scroll').scrollTop = sc; });
  $$('[data-cs]').forEach(b => b.onclick = () => customBuildSheet(b.dataset.id, b.dataset.cs));
  $$('[data-crm]').forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.dataset.id; if (b.dataset.crm === 'team') c.team = c.team.filter(x => x !== id); else c.foes = c.foes.filter(x => x !== id); store(); showCustom(); });
  $$('.rc').forEach(card => card.addEventListener('click', e => {
    const id = card.dataset.id;
    if (e.target.closest('[data-info]')) { e.stopPropagation(); heroSheet(id); return; }
    if (UI.cside === 'team') {
      if (!isUnlocked(id)) { toast('Unlock this hero in the campaign to use them on your side.'); return; }
      if (c.team.includes(id)) c.team = c.team.filter(x => x !== id);
      else if (c.team.length >= 3) { toast('Your side holds 3 heroes.'); return; }
      else c.team.push(id);
    } else {
      if (c.foes.includes(id)) c.foes = c.foes.filter(x => x !== id);
      else if (c.foes.length >= 5) { toast('Up to 5 opponents.'); return; }
      else c.foes.push(id);
    }
    store(); SND.play('select');
    const sc = $('.scroll').scrollTop; showCustom(); $('.scroll').scrollTop = sc;
  }));
  $('#cgo').onclick = () => { if (c.team.length && c.foes.length) startCustom(); };
}
function startCustom() {
  const c = customState();
  startBattle({ team: c.team.slice(), builds: Object.assign({}, SAVE.builds), enemies: c.foes.map(id => ({ id, hero: true, build: c.foeBuilds[id], atkMul: c.power, hpMul: c.power })), mode: 'custom' },
    { mode: 'custom', era: 'current', title: 'Custom battle', sub: `${c.team.length} vs ${c.foes.length}${c.power !== 1 ? `, opponents at ${Math.round(c.power * 100)}%` : ''}` });
}

/* ---------- guide ---------- */
const GUIDE_TABS = [['basics', 'Basics'], ['stats', 'Stats'], ['statuses', 'Statuses'], ['team', 'Team'], ['builds', 'Builds'], ['enemies', 'Enemies'], ['balance', 'Balance'], ['updates', 'Updates']];
const BTYPE = {
  buff:   { icon: '▲', label: 'Buff',     color: '#22c55e', desc: 'Stronger' },
  nerf:   { icon: '▼', label: 'Nerf',     color: '#ef4444', desc: 'Weaker' },
  rework: { icon: '⟳', label: 'Rework',   color: '#a855f7', desc: 'Works differently' },
  new:    { icon: '✦', label: 'New',      color: '#3b9cff', desc: 'New rule or mechanic' },
  harder: { icon: '▲', label: 'Harder',   color: '#f97316', desc: 'Stage got tougher' },
  easier: { icon: '▼', label: 'Easier',   color: '#14b8a6', desc: 'Stage got gentler' },
  adjust: { icon: '◆', label: 'Adjusted', color: '#d4a017', desc: 'Neutral or mixed change' }
};
const BPORT = {};
function bcWho(c) {
  const key = c.kind + ':' + c.who;
  let pic = BPORT[key], name;
  if (c.kind === 'hero') { name = HEROES[c.who].name; pic = pic || (BPORT[key] = heroPortrait(c.who)); }
  else if (c.kind === 'enemy') { name = ENEMIES[c.who].name; pic = pic || (BPORT[key] = enemyPortrait(c.who)); }
  else if (c.kind === 'stage') {
    const st = STAGES.find(x => x.id === c.who); name = st.name;
    const face = st.enemies.find(id => isHeroFoe(id)) || st.enemies.find(id => ENEMIES[id].boss) || st.enemies[0];
    pic = pic || (BPORT[key] = foePortrait(face));
  } else { name = c.who; pic = '<span class="sysic">⚙️</span>'; }
  return { name, pic };
}
function bcRow(c, showWho = true) {
  const T = BTYPE[c.t], w = bcWho(c);
  const nums = c.from != null ? ` <span class="ft"><span class="fr">${esc(c.from)}</span><span class="ar">→</span><b>${esc(c.to)}</b></span>` : '';
  return `<div class="bc" style="--bc:${T.color}">
<div class="bct"><span class="btag"><i>${T.icon}</i>${T.label}</span>${showWho ? `<span class="bwho"><span class="bp">${w.pic}</span>${esc(w.name)}</span>` : ''}${c.what ? `<span class="bwhat">${esc(c.what)}</span>` : ''}</div>
<div class="btx">${esc(c.text)}${nums}</div>${c.note ? `<div class="bnote">${esc(c.note)}</div>` : ''}</div>`;
}
function balanceBody() {
  const f = UI.bf || 'all';
  const kinds = { heroes: c => c.kind === 'hero', foes: c => c.kind === 'enemy' || c.kind === 'stage', system: c => c.kind === 'system' };
  const match = c => f === 'all' || c.t === f || (kinds[f] && kinds[f](c));
  const all = BALANCE.flatMap(v => v.changes);
  const count = k => all.filter(c => k === 'all' || c.t === k || (kinds[k] && kinds[k](c))).length;
  const chips = [['all', 'All'], ['buff', '▲ Buffs'], ['nerf', '▼ Nerfs'], ['rework', '⟳ Reworks'], ['heroes', 'Heroes'], ['foes', 'Enemies and stages'], ['system', 'Systems']]
    .map(([k, l]) => `<button class="bfc ${f === k ? 'on' : ''}" data-bf="${k}" ${BTYPE[k] ? `style="--bc:${BTYPE[k].color}"` : ''}>${l} <small>${count(k)}</small></button>`).join('');
  const legend = Object.values(BTYPE).map(T => `<span class="lg" style="--bc:${T.color}"><span class="btag"><i>${T.icon}</i>${T.label}</span>${T.desc}</span>`).join('');
  const groups = BALANCE.map(v => {
    const rows = v.changes.filter(match);
    if (!rows.length) return '';
    return `<div class="bver"><h4>v${esc(v.v)}${verDate(v)}${v.old ? ` <em class="wasv">was v${esc(v.old)}</em>` : ''} <span>${esc(v.date)}</span></h4>${rows.map(c => bcRow(c)).join('')}</div>`;
  }).join('');
  return `<p>Only numbers and rules that changed. Features are in Updates. Buff and nerf describe the thing named: a stronger enemy is a buff to that enemy, while stages use Harder and Easier.</p>
<div class="legend">${legend}</div><div class="bfilters">${chips}</div>${groups || '<p>Nothing matches this filter.</p>'}`;
}
function guideBody(tab) {
  if (tab === 'basics') return `
<h4>Turn order</h4><p>Faster units act more often. Each unit waits 10000 ÷ SPD time units between turns, so 150 SPD acts 50% more often than 100 SPD. The strip under the top bar shows the next eight turns, with the current unit enlarged.</p>
<h4>Your turn</h4><p>Pick Basic, Skill or Ultimate, then tap a highlighted target. Every valid target shows a preview: damage, healing or Shield it would receive, its hit chance when below 100%, and KO if the hit should finish it.</p>
<p>Basics give the team 1 skill point (SP). Skills cost 1 SP. The team shares up to 5 SP, shown as blue diamonds. A good rhythm is to alternate basics and skills.</p>
<p>Ultimates charge as a hero acts: +20% for a basic, +30% for a skill and +6% when hit. At 100% the hero glows gold and the button lights up. Using one is the hero's whole turn.</p>
<h4>Reading the enemy</h4><p>Every enemy shows its next move and target above its portrait. Your heroes show ⚠ with the total damage heading their way. Lethal means it will knock them out unless you act: heal, Shield, guard or kill the attacker first.</p>
<p>🎯✕ on an intent means the move ignores Taunt. David's Guard still redirects it.</p>
<p>Tap the <b>i</b> on any card, or press and hold the card, to see its stats, statuses and moves at any time, even while you are picking a target. Turn order icons and the active hero's portrait in the action panel open details too. Tapping a card that isn't a valid target also opens its details.</p>
<h4>Stars</h4><p>One for winning, one if no hero falls, and one if your team's HP averages 50% or more at the end. Fallen heroes count as 0%.</p>
<h4>Unlocking heroes</h4><p>You start with Angus, Flynn and Leo. Clearing certain stages unlocks more heroes. The campaign map shows which stage unlocks whom.</p>
<h4>Gauntlet</h4><p>Endless waves with a boss every fifth wave. After each win the team heals 30% of max HP, the fallen return at 25%, and you pick one of three boons. Wounds and ultimate charge carry over. Only unlocked heroes can enter.</p>
<h4>Battle summary</h4><p>After every fight a table shows each hero's damage, healing, Shields, damage taken, kills, biggest hit, crits, hit rate, dodges, buffs and debuffs landed, actions and ultimates. Gold numbers lead their row. ${IMPACT_NOTE}</p>
<h4>Custom battle</h4><p>Pick up to 3 of your unlocked heroes and up to 5 opponents from the whole roster, with their builds and a strength setting. Opponents are controlled by the game, show their intents like any enemy, use their own SP pool and get their own team bonuses. Custom battles don't affect your progress.</p>
<h4>Controls</h4><p>Speed cycles 1×, 2× and 3×. Auto lets the team fight on its own and stays on between waves. On a keyboard, 1, 2 and 3 pick actions and Enter uses an area move.</p>
<h4>Effects</h4><p>Effects on the title screen sets how much motion the battle screen uses. Full plays everything. Reduced drops screen shake, lunges and flashes but keeps damage numbers, slashes and hit effects, so a fight is still easy to read. Auto follows the reduce motion setting on your device.</p>`;
  if (tab === 'stats') return `
<h4>HP</h4><p>Health. At 0 the unit falls. Shield (blue stripes on the HP bar) absorbs damage before HP.</p>
<h4>ATK</h4><p>Attack. Every ability is a percentage of ATK. Damage over time (Burn, Shock, Bleed, Poison) is also based on the attacker's ATK when applied.</p>
<h4>DEF</h4><p>Defence. Damage is multiplied by 300 ÷ (300 + DEF).</p>
<div class="tbl"><div><b>DEF</b><b>Damage taken</b></div><div><span>50</span><span>86%</span></div><div><span>100</span><span>75%</span></div><div><span>150</span><span>67%</span></div><div><span>200</span><span>60%</span></div></div>
<p>Pierce (Harry's Katana Draw and Crush, for example) ignores part or all of the target's DEF.</p>
<h4>SPD</h4><p>Speed. Decides how often a unit acts. SPD buffs and debuffs change the turn order straight away.</p>
<h4>Crit and crit damage</h4><p>Crit chance is the chance a hit lands as a critical. Crits deal +50% damage by default (+60% for Harry and Yunze). Healing from Yousuf can also crit for +50%.</p>
<h4>EVA (evasion) and ACC (accuracy)</h4><p>Hit chance = 100% + attacker ACC - target EVA, capped at 100% and never below 5%. Blind takes a further 35% off. Afterimage dodges the next attack completely. Moves marked "cannot miss" ignore all of this.</p>
<div class="tbl"><div><b>Unit</b><b>EVA</b></div><div><span>Yunze</span><span>20%</span></div><div><span>Harry</span><span>15%</span></div><div><span>Gemia</span><span>14%</span></div><div><span>The Chosen</span><span>10%</span></div><div><span>Other heroes</span><span>3 to 8%</span></div><div><span>Wolves, wisps, afterimages</span><span>16 to 25%</span></div><div><span>Golems, the Idol, the Warden</span><span>0%</span></div></div>
<p>Some hero moves have bonus ACC (lightning, rapier, Phantom Switch). Heavy enemy attacks have -8% ACC.</p>
<h4>The damage formula</h4><p>ATK × ability % × 300 ÷ (300 + DEF) × (1 + damage bonuses) × damage taken modifiers × crit × a random 92% to 108%.</p>
<p>Damage bonuses add together: rivals +20%, Flynn vs Shocked +25%, Leo vs Burning +20%, Yunze vs the highest max HP enemy +30%, Executioner boon.</p>
<p>Damage taken modifiers multiply: Angus and The Chosen -12% (The Chosen also -3% per Grace stack), Guarding -35%, Stone Form -50%, Warded -50%, Plated -50%, Exposed +50%, Hunted +25% (from the Yunze who marked it only), Yousuf's Guard escort -25% for Yousuf.</p>
<h4>Stat changes</h4><p>Buffs and debuffs to ATK, DEF and SPD add together as percentages of the base stat. A stat can't fall below 25% of its base.</p>`;
  if (tab === 'statuses') return `<p>Solid borders are buffs, dashed borders are debuffs. The number on a badge is turns left, or stacks shown as ×2. A status lasts through its owner's turns: 2 turns means it wears off at the end of the owner's second turn.</p>
<div class="sts-list">${Object.entries(STATUS).filter(([k]) => k !== 'accUp').map(([k, d]) => `<div><b style="color:${d.color}">${d.icon} ${esc(d.name)}</b> <span style="color:var(--tx3)">${d.type === 'buff' ? 'Buff' : 'Debuff'}</span><br><span style="color:var(--tx2)">${esc(d.desc || (d.stat ? `${d.name.split(' ')[0]} ${d.neg ? 'lowered' : 'raised'} by the listed percentage.` : ''))}</span></div>`).join('')}</div>`;
  if (tab === 'team') return `
<h4>Team bonuses</h4>${SYNERGIES.map(s => `<p><b style="color:var(--tx)">${s.icon} ${esc(s.name)}.</b> ${esc(s.desc)}</p>`).join('')}
<p>Harry counts as all three eras. Yunze and Malakai count as Second and Current Era.</p>
<h4>Rivals</h4><p>Rivals deal 20% more damage to each other. Afterimages of Yunze count as Yunze.</p>${Object.entries(RIVALS).map(([a, bs]) => `<p>${esc(HEROES[a].name)} → ${esc(bs.map(b => HEROES[b].name).join(', '))}</p>`).join('')}
<h4>Legends</h4><p>Harry and Yunze are Legends. Only one per team.</p>
<h4>Unlocks</h4><p>Starters: Angus, Flynn and Leo.</p>${STAGES.filter(s => s.reward).flatMap(s => [].concat(s.reward).map(r => `<p>${isUnlocked(r) ? '✓' : '🔒'} ${esc(HEROES[r].name)}: clear ${esc(s.name)}</p>`)).join('')}`;
  if (tab === 'builds') return `<p>Each hero has a Balanced kit and two builds that trade one strength for another. Pick builds on the team screen by tapping a hero in a slot, or from the hero's details. Builds don't cost anything and can be swapped any time outside battle.</p>
${HERO_ORDER.map(id => `<h4 style="color:${HEROES[id].color}">${esc(HEROES[id].name)}${isUnlocked(id) ? '' : ' 🔒'}</h4>${BUILDS[id].slice(1).map(b => `<p><b style="color:var(--tx)">${b.icon} ${esc(b.name)}.</b> ${esc(b.desc)}</p>`).join('')}`).join('')}`;
  if (tab === 'enemies') {
    const ids = uniq(STAGES.flatMap(s => s.enemies).filter(id => !isHeroFoe(id)).concat(['homunculus']));
    return `<p>Every enemy in the campaign. Tap one for its moves. Stats shown are base values; stages scale them up.</p><div class="bestiary">${ids.map(id => `<button class="be" data-e="${id}"><span class="p">${enemyPortrait(id)}</span><b>${esc(ENEMIES[id].name)}</b></button>`).join('')}</div>`;
  }
  if (tab === 'balance') return balanceBody();
  if (tab === 'updates') return `<p>New features and content. Number changes are in Balance.</p>
<h4>How version numbers work</h4>
<p>A version reads <b>0.milestone.patch</b>, so v${esc(GAME_VERSION)} is milestone 0.4, patch ${esc(GAME_VERSION.split('.')[2] || '0')}.</p>
<p><b>The last number</b> moves for everything routine, and there is no limit to it, so v0.4.17 is an ordinary thing to see. It covers bug fixes of any size, balance changes, whole hero reworks, new wording, new art and animation, and work on the tools behind the game.</p>
<p><b>The middle number</b> moves only when the game gains something new to play: a new hero, a new stage or a new mode. Fixing, rebalancing or rewriting what is already here never moves it, however much of it there is. That is why it moves rarely.</p>
<p><b>1.0</b> is not planned yet. It will be decided when the game is close to finished, rather than arrived at by counting.</p>
<p>Everything was renumbered on 7 October 2026, because the old numbers had reached 0.93 with no room left. Every past update was renamed in the same order, with its old number kept beside it.</p>` +
    UPDATES.map(e => `<h4>v${esc(e.v)}${verDate(e)}${e.old ? ` <em class="wasv">was v${esc(e.old)}</em>` : ''}</h4><ul class="chg">${e.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`).join('');
  return '';
}
function showGuide(tab = 'basics') {
  UI.bt = null; closeSheet();
  app().innerHTML = `<div class="scr"><div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Guide</h2></div>
<div class="tabs" role="tablist">${GUIDE_TABS.map(([k, l]) => `<button role="tab" class="tab ${k === tab ? 'on' : ''}" data-t="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}</div>
<div class="scroll guide">${guideBody(tab)}</div></div>`;
  $('#back').onclick = showTitle;
  $$('.tab').forEach(b => b.onclick = () => { SND.play('click'); showGuide(b.dataset.t); });
  $$('[data-e]').forEach(b => b.onclick = () => enemyInfoSheet(b.dataset.e));
  $$('[data-bf]').forEach(b => b.onclick = () => { UI.bf = b.dataset.bf; SND.play('click'); const sc = $('.scroll').scrollTop; showGuide('balance'); $('.scroll').scrollTop = sc; });
  const on = $('.tab.on'); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
}
function showHelp() { showGuide('basics'); }

/* ---------- boot ---------- */
function boot() {
  cloudInit();
  try { showTitle(); } catch (e) { app().innerHTML = '<p style="padding:20px">The game could not start: ' + esc(e.message) + '</p>'; console.error(e); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitBattle());
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
