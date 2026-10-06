/* ================= UI: records and stats ================= */
const REC_FIELDS = ['dmg', 'heal', 'shield', 'taken', 'kills', 'falls', 'acts', 'ults', 'crits', 'hits', 'misses', 'dodges', 'buffs', 'debuffs'];
function recState() {
  const r = SAVE.rec || (SAVE.rec = {});
  r.heroes = r.heroes || {};
  r.hist = r.hist || [];
  return r;
}
function recordBattle(res, extra = {}) {
  if (!B || !B.players || !B.players.length || UI.recorded === B.id) return;
  const PL = B.players.filter(p => p.isHero);
  UI.recorded = B.id;
  const r = recState(), win = res === 'win', ctx = UI.ctx || {};
  const S = PL.map(p => B.st[p.uid] || newStats());
  const imps = S.map(impactOf);
  const mvpI = imps.indexOf(Math.max(...imps));
  PL.forEach((p, i) => {
    const bid = p.build ? p.build.id : 'balanced';
    const h = r.heroes[p.id] || (r.heroes[p.id] = {});
    const a = h[bid] || (h[bid] = { n: 0, w: 0, imp: 0, mvp: 0, big: 0 });
    const s = S[i];
    a.n++; if (win) a.w++;
    a.imp += imps[i]; if (i === mvpI) a.mvp++;
    a.big = Math.max(a.big || 0, s.big || 0);
    for (const k of REC_FIELDS) a[k] = (a[k] || 0) + (s[k] || 0);
  });
  const name = ctx.mode === 'campaign' ? ctx.stage.name : ctx.mode === 'gauntlet' ? `Gauntlet wave ${ctx.wave}` : `Custom ${PL.length} vs ${B.enemies.filter(e => e.isHero).length}`;
  r.hist.unshift({
    t: Date.now(), m: ctx.mode || 'campaign', name, r: win ? 'w' : 'l', turns: B.turn, stars: extra.stars,
    team: PL.map((p, i) => [p.id, p.build ? p.build.id : 'balanced', imps[i], Math.round(S[i].dmg), Math.round(S[i].heal + S[i].shield), S[i].falls ? 1 : 0]),
    mvp: PL[mvpI].id,
    foes: uniq(B.enemies.filter(e => !e.creature).map(e => (e.isHero ? 'h:' : '') + e.id)).slice(0, 6)
  });
  if (r.hist.length > 50) r.hist.length = 50;
  store();
}
function mergeRec(remote) {
  if (!remote || !remote.rec) return;
  const L = recState(), R = remote.rec;
  for (const [h, bs] of Object.entries(R.heroes || {})) {
    const lh = L.heroes[h] || (L.heroes[h] = {});
    for (const [b, a] of Object.entries(bs)) if (!lh[b] || (a.n || 0) > (lh[b].n || 0)) lh[b] = a;
  }
  const seen = new Set(L.hist.map(e => e.t));
  for (const e of R.hist || []) if (!seen.has(e.t)) L.hist.push(e);
  L.hist.sort((a, b) => b.t - a.t);
  if (L.hist.length > 50) L.hist.length = 50;
}
function heroRec(id) {
  const bs = recState().heroes[id] || {};
  const tot = { n: 0, w: 0, imp: 0, mvp: 0, big: 0 };
  for (const a of Object.values(bs)) { for (const k of ['n', 'w', 'imp', 'mvp', ...REC_FIELDS]) tot[k] = (tot[k] || 0) + (a[k] || 0); tot.big = Math.max(tot.big, a.big || 0); }
  return { tot, bs };
}
const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '-');
const per = (a, n) => (n ? Math.round(a / n) : '-');
function ago(t) {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  const d = Math.floor(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago';
}
function foeFace(f) { return f.startsWith('h:') ? heroPortrait(f.slice(2)) : enemyPortrait(f); }
function winBar(v) { const c = v >= 60 ? '#22c55e' : v <= 45 ? '#ef4444' : '#d4a017'; return `<span class="wbar"><i style="width:${Math.max(2, Math.min(100, v))}%;background:${c}"></i><b class="mid50"></b></span>`; }

function statsMine() {
  const r = recState();
  const ids = HERO_ORDER.filter(id => heroRec(id).tot.n > 0);
  const all = r.hist.length;
  if (!ids.length) return `<p>No battles recorded yet. Every battle you finish from now on is recorded here, per hero and per build. Your record is saved with your progress.</p>`;
  const rows = ids.map(id => {
    const { tot, bs } = heroRec(id), h = HEROES[id];
    const main = `<tr class="hr"><td><span class="tp" style="--c:${h.color}">${heroPortrait(id)}</span>${esc(h.name)}</td><td>${tot.n}</td><td>${pct(tot.w, tot.n)}</td><td>${per(tot.imp, tot.n)}</td><td>${per(tot.dmg, tot.n)}</td><td>${per(tot.heal + tot.shield, tot.n)}</td><td>${pct(tot.falls, tot.n)}</td><td>${tot.mvp}</td><td>${tot.big}</td></tr>`;
    const used = BUILDS[id].filter(b => bs[b.id] && bs[b.id].n);
    const sub = used.length > 1 || (used.length === 1 && used[0].id !== 'balanced') ? used.map(b => { const a = bs[b.id]; return `<tr class="br"><td>${b.icon} ${esc(b.name)}</td><td>${a.n}</td><td>${pct(a.w, a.n)}</td><td>${per(a.imp, a.n)}</td><td>${per(a.dmg, a.n)}</td><td>${per((a.heal || 0) + (a.shield || 0), a.n)}</td><td>${pct(a.falls || 0, a.n)}</td><td>${a.mvp}</td><td>${a.big || 0}</td></tr>`; }).join('') : '';
    return main + sub;
  }).join('');
  const wins = r.hist.filter(e => e.r === 'w').length;
  return `<p>Every battle you finish is recorded. Numbers are per battle unless noted. Best is how many times that hero was the battle's Best. Recent results: ${wins} wins from the last ${all} battles.</p>
<div class="stbl-wrap light"><table class="stbl rec"><tr><th>Hero</th><th>Battles</th><th>Win %</th><th>Impact</th><th>Damage</th><th>Heal + Shield</th><th>Fell</th><th>Best</th><th>Top hit</th></tr>${rows}</table></div>
<p class="hint">Build rows appear under a hero once you've used a build other than Balanced.</p>`;
}
function statsHistory() {
  const r = recState();
  if (!r.hist.length) return '<p>No battles yet. Your last 50 battles will be listed here.</p>';
  return `<p>Your last ${r.hist.length} battles, newest first. Tap one for details.</p><div class="hist">${r.hist.map((e, i) => `<button class="he ${e.r === 'w' ? 'w' : 'l'}" data-h="${i}">
<div class="ht"><span class="hres ${e.r}">${e.r === 'w' ? 'Victory' : 'Defeat'}</span><b>${esc(e.name)}</b>${e.stars != null ? `<span class="hs">${'★'.repeat(e.stars)}${'☆'.repeat(3 - e.stars)}</span>` : ''}<small>${ago(e.t)}</small></div>
<div class="hb"><span class="hteam">${e.team.map(m => `<span class="hp2 ${m[0] === e.mvp ? 'mvpf' : ''}" style="--c:${HEROES[m[0]].color}">${heroPortrait(m[0])}${m[5] ? '<i class="ko">✕</i>' : ''}</span>`).join('')}</span><span class="vs">vs</span><span class="hfoes">${e.foes.map(f => `<span class="hp2 f">${foeFace(f)}</span>`).join('')}</span><small>${e.turns} turns</small></div></button>`).join('')}</div>`;
}
function histSheet(e) {
  const rows = e.team.map(m => { const h = HEROES[m[0]], b = buildOf(m[0], m[1]); return `<tr><td><span class="tp" style="--c:${h.color}">${heroPortrait(m[0])}</span>${esc(h.name)}${m[0] === e.mvp ? ' <span class="mvp">Best</span>' : ''}<br><small>${b.icon} ${esc(b.name)}</small></td><td>${m[2]}</td><td>${m[3]}</td><td>${m[4]}</td><td>${m[5] ? 'Yes' : 'No'}</td></tr>`; }).join('');
  sheet(`<h3>${esc(e.name)}</h3><p>${e.r === 'w' ? 'Victory' : 'Defeat'} in ${e.turns} turns, ${new Date(e.t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.${e.stars != null ? ` ${e.stars} of 3 stars.` : ''}</p>
<div class="stbl-wrap light" style="margin-top:10px"><table class="stbl rec"><tr><th>Hero</th><th>Impact</th><th>Damage</th><th>Heal + Shield</th><th>Fell</th></tr>${rows}</table></div>`);
}
function statsSim() {
  const S = SIM_STATS, view = UI.simView || 'core';
  const comp = h => (S.heroes[h].win + (S.team3 ? S.team3[h] : S.heroes[h].win)) / 2;
  const ids = HERO_ORDER.slice().sort((a, b) => comp(b) - comp(a));
  const name = id => `<td><span class="tp" style="--c:${HEROES[id].color}">${heroPortrait(id)}</span>${esc(HEROES[id].name)}</td>`;
  const seg = `<div class="seg small three"><button class="${view === 'core' ? 'on' : ''}" data-sv="core">Overview</button><button class="${view === 'grid' ? 'on' : ''}" data-sv="grid">1v1 grid</button><button class="${view === 'detail' ? 'on' : ''}" data-sv="detail">Detail</button></div>`;
  let body = '';
  if (view === 'grid') {
    const M = S.matrix, col = v => { const x = (v - 50) / 50; return x >= 0 ? `rgba(34,197,94,${0.15 + x * 0.75})` : `rgba(239,68,68,${0.15 - x * 0.75})`; };
    const order = HERO_ORDER.slice().sort((a, b) => S.duel[b] - S.duel[a]);
    body = `<p><b>Read a row.</b> The hero down the left side is the one winning: each cell is how often they beat the hero along the top. So the cell where Ben&rsquo;s row meets Kingsley&rsquo;s column is how often <b>Ben</b> wins.</p>
<p>Green favours the row hero, red the column hero. The last column is their win rate across every opponent. Every pair was played ${S.duelN} times from both sides, so a cell is accurate to a point or two; anything near 50 is a close matchup rather than a precise number. Supports and defenders are built for teams, so they lose most duels by design.</p>
<div class="gridwrap"><table class="mgrid"><tr><th class="gcorner"><i>&darr; winner</i><b>beat</b><i>loser &rarr;</i></th>${order.map(b => `<th title="Lost to the hero on the left: ${esc(HEROES[b].name)}"><span class="gp" style="--c:${HEROES[b].color}">${heroPortrait(b)}</span></th>`).join('')}<th>All</th></tr>
${order.map(a => `<tr><th title="${esc(HEROES[a].name)} wins this row"><span class="gp" style="--c:${HEROES[a].color}">${heroPortrait(a)}</span></th>${order.map(b => a === b ? '<td class="self"></td>' : `<td style="background:${col(M[a][b])}" title="${esc(HEROES[a].name)} beat ${esc(HEROES[b].name)} in ${Math.round(M[a][b])}% of ${S.duelN} duels">${Math.round(M[a][b])}</td>`).join('')}<td class="tot">${Math.round(S.duel[a])}</td></tr>`).join('')}</table></div>`;
  } else if (view === 'detail') {
    body = `<div class="stbl-wrap light"><table class="stbl rec sim"><tr><th>Hero</th><th>Turn share</th><th>Ults /fight</th><th>Crit %</th><th>Hit %</th><th>Taken</th><th>Dmg share</th></tr>${ids.map(id => { const s = S.heroes[id]; return `<tr>${name(id)}<td>${s.acts}%</td><td>${s.ults}</td><td>${s.crit}%</td><td>${s.hit}%</td><td>${s.taken}%</td><td>${s.share}%</td></tr>`; }).join('')}</table></div>
<p class="hint">From campaign fights. Turn share: percentage of all turns taken by this hero. Taken: damage absorbed per fight as a percentage of max HP. Dmg share: their part of the team's damage.</p>`;
  } else {
    body = `<div class="stbl-wrap light"><table class="stbl rec sim"><tr><th>Hero</th><th>Campaign</th><th>3v3</th><th>1v1</th><th>Impact</th><th>Fell</th></tr>${ids.map(id => { const s = S.heroes[id]; return `<tr>${name(id)}<td><b>${Math.round(s.win)}%</b>${winBar(s.win)}</td><td><b>${Math.round(S.team3[id])}%</b>${winBar(S.team3[id])}</td><td>${Math.round(S.duel[id])}%</td><td>${Math.round(s.imp)}</td><td>${Math.round(s.falls)}%</td></tr>`; }).join('')}</table></div>
<p class="hint">Sorted by the average of Campaign and 3v3, the two team measures. 1v1 shows solo strength only.</p>
<h4>Builds</h4><p>Campaign team win rate for each build. The marker on each bar is 50%.</p>${HERO_ORDER.map(id => `<div class="sbh"><div class="sbn"><span class="tp" style="--c:${HEROES[id].color}">${heroPortrait(id)}</span>${esc(HEROES[id].name)}</div>${BUILDS[id].map(b => { const x = S.builds[id][b.id]; return `<div class="sbr"><span class="bn">${b.icon} ${esc(b.name)}</span><span class="bw"><b>${Math.round(x.win)}%</b>${winBar(x.win)}</span><span class="bi">${Math.round(x.imp)} impact, ${Math.round(x.falls)}% fell</span></div>`; }).join('')}</div>`).join('')}`;
  }
  const n = S.heroes[HERO_ORDER[0]].n;
  return `<p>From the v${esc(S.v)} balance simulator, three ways:</p>
<p><b>Campaign:</b> ${n} battles per hero with random teammates across 11 mid and late campaign fights. How often teams with that hero won. Monsters favour heroes who heal and protect.</p>
<p><b>3v3:</b> ${S.games3} battles of random hero teams against random hero teams, both run by the same AI. The fairest single measure.</p>
<p><b>1v1:</b> every hero duels every other hero. Shows solo strength, not overall worth.</p>
<p class="hint">All results are AI against AI, so a hero that rewards clever play can do better in your hands. Differences under about 5 points are within noise.</p>
${seg}${body}`;
}
function showStats(tab = 'mine') {
  UI.bt = null; closeSheet();
  const tabs = [['mine', 'Your heroes'], ['history', 'Battles'], ['sim', 'Simulated']];
  const body = tab === 'mine' ? statsMine() : tab === 'history' ? statsHistory() : statsSim();
  app().innerHTML = `<div class="scr"><div class="top"><button class="ib" id="back" aria-label="Back">←</button><h2>Stats</h2></div>
<div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" class="tab ${k === tab ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</div>
<div class="scroll guide">${body}</div></div>`;
  $('#back').onclick = showTitle;
  $$('.tab').forEach(b => b.onclick = () => { SND.play('click'); showStats(b.dataset.t); });
  $$('[data-h]').forEach(b => b.onclick = () => histSheet(recState().hist[+b.dataset.h]));
  $$('[data-sv]').forEach(b => b.onclick = () => { UI.simView = b.dataset.sv; showStats('sim'); });
}
function heroStatsHTML(id) {
  const s = SIM_STATS.heroes[id], { tot } = heroRec(id);
  return `<h4>Stats <button class="qbtn" data-stats="1">All stats</button></h4>
<div class="hsbox"><div><small>Simulated (v${esc(SIM_STATS.v)})</small>Campaign <b>${Math.round(s.win)}%</b><br>3v3 <b>${Math.round(SIM_STATS.team3[id])}%</b>, 1v1 <b>${Math.round(SIM_STATS.duel[id])}%</b><br><b>${Math.round(s.imp)}</b> impact per turn</div>
<div><small>Your record</small>${tot.n ? `<b>${tot.n}</b> battles, <b>${pct(tot.w, tot.n)}</b> won<br><b>${per(tot.imp, tot.n)}</b> impact per battle<br>Best ${tot.mvp} times, top hit ${tot.big}` : 'No battles yet.'}</div></div>`;
}
function buildStatLine(id, bid) {
  const s = SIM_STATS.builds[id] && SIM_STATS.builds[id][bid];
  const a = (recState().heroes[id] || {})[bid];
  return `<span class="bstat">Simulated: ${s ? Math.round(s.win) + '% team win' : '-'}${a && a.n ? `. You: ${a.n} ${a.n === 1 ? 'battle' : 'battles'}, ${pct(a.w, a.n)} won` : ''}</span>`;
}
