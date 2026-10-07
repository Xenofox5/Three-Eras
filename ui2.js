/* ================= UI: effects map ================= */
const W = ms => new Promise(r => setTimeout(r, T(ms)));
const allP = (d) => (d.tgts || []).map(P);
const FX = {
  slash: d => melee(d, {}),
  katana: d => melee(d, { color: '#e8f6ff', n: 2, angle: -20, thick: 3, len: 1.35 }),
  lightslash: d => melee(d, { color: '#fff2a8', n: 2, angle: -40, thick: 6, extra: p => ring(p, { color: '#fff2a8', size: 70 }) }),
  rapier: d => melee(d, { color: '#ffe9a0', angle: -8, thick: 3, f: 0.5, len: 1.3 }),
  dagger: d => { ghost(d.src, -14, 6, 300, '#4fb3ff'); return melee(d, { color: '#7fd0ff', angle: (d.i % 2 ? 35 : -35), f: 0.5, thick: 4 }); },
  swift: d => { ghost(d.src, 0, 10, 260, '#ff6f91'); return melee(d, { color: '#ff8fae', angle: -30 + (d.i || 0) * 45, f: 0.48, thick: 4 }); },
  spear: d => melee(d, { color: '#dfe6f2', angle: -70, thick: 4, f: 0.5, len: 1.4 }),
  lance: d => melee(d, { color: '#ffd56b', angle: -65 + (d.i || 0) * 20, thick: 5, f: 0.5, len: 1.4, extra: p => burst(p, { color: '#fff4c8', n: 5, spread: 40 }) }),
  punch: d => melee(d, { color: '#7fb0ff', angle: 0, f: 0.5, thick: 7, len: 0.7, extra: p => ring(p, { color: '#7fb0ff', size: 60, dur: 300 }) }),
  staff: d => melee(d, { color: '#5dff8f', angle: -45, thick: 6 }),
  claw: d => melee(d, { color: '#ff8a5a', n: 3, angle: -55, parallel: true, thick: 3 }),
  smash: d => melee(d, { color: '#ffb070', angle: 10, thick: 9, len: 0.9, sfx: 'hit', extra: p => { ring(p, { color: '#ffb070', size: 100 }); shakeArena(false); } }),
  dust: d => melee(d, { color: '#c9c3b0', extra: p => burst(p, { color: '#b9bdd0', n: 16, spread: 50, size: 10 }) }),
  resolve: async d => {
    flash('#ff6f91', 0.25, 250);
    await melee(d, { color: '#ff6f91', n: 3, angle: -50, thick: 8, f: 0.6, len: 1.6, extra: p => { ring(p, { color: '#ff6f91', size: 160, width: 5 }); burst(p, { color: '#ffd0dc', n: 18, spread: 80 }); shakeArena(true); } });
  },
  sweep: async d => {
    SND.play('whoosh');
    const back = await lungeIn(d.src, d.tgts && d.tgts[0], 0.25);
    allP(d).forEach((p, i) => later(() => { slashAt(p, { color: '#dfe6f2', angle: 4, len: p.w * 1.8, thick: 8 }); burst(p, { color: '#dfe6f2', n: 8 }); }, i * 60));
    shakeArena(true);
    later(back, 200);
    await W(220);
  },
  bolt: async d => {
    SND.play('zap');
    zap(P(d.src), P(d.tgt), { color: d.color || '#9fe6ff' });
    burst(P(d.tgt), { color: '#9fe6ff', n: 10, spread: 46 });
    await W(150);
  },
  skybolt: async d => {
    SND.play('zap');
    const p = P(d.tgt);
    zap({ x: p.x + (Math.random() * 60 - 30), y: -30 }, p, { color: '#9fe6ff', jag: 22, dur: 320 });
    ring(p, { color: '#9fe6ff', size: 80 });
    burst(p, { color: '#e8fbff', n: 12, spread: 50 });
    if ((d.i || 0) % 2 === 0) flash('#cfefff', 0.18, 160);
    await W(120);
  },
  fireball: async d => {
    SND.play('fire');
    await projectile(P(d.src), P(d.tgt), { color: '#ff7a2f', size: 26, dur: 300 });
    const p = P(d.tgt);
    burst(p, { color: '#ff9a3c', n: 14, spread: 50, up: 20 });
    ring(p, { color: '#ff7a2f', size: 70, dur: 300 });
  },
  beam: async d => {
    SND.play('fire');
    const a = P(d.src);
    beam(a, P(d.tgt), { color: '#ff7a2f', width: 16 + (d.stage || 1) * 7, dur: 520 });
    if ((d.stage || 1) >= 3) { flash('#ff7a2f', 0.12 * d.stage, 260); shakeArena(d.stage >= 4); }
    (d.tgts || []).slice(1).forEach(t => beam(a, P(t), { color: '#ffb057', width: 9, dur: 460 }));
    await W(220);
    allP(d).forEach(p => burst(p, { color: '#ffb057', n: 10, spread: 44, up: 16 }));
    shakeArena(false);
  },
  inferno: async d => {
    SND.play('fire');
    flash('#ff7a2f', 0.3, 380);
    allP(d).forEach((p, i) => later(() => column(p, { color: '#ff7a2f', width: p.w * 0.9, dur: 560 }), i * 70));
    await W(320);
    allP(d).forEach(p => burst(p, { color: '#ffd56b', n: 16, spread: 60, up: 30 }));
    shakeArena(true);
  },
  crush: async d => {
    const p = P(d.tgt);
    if (!d.quick) { ring(P(d.src), { color: '#3dff9a', size: 110, from: 1, to: 0.3, dur: 380 }); await W(240); }
    SND.play('crush');
    await ring(p, { color: '#3dff9a', size: p.w * 1.8, from: 1.2, to: 0.15, dur: d.quick ? 200 : 320, width: 4 });
    const c = cardEl(d.tgt); if (c) restartClass(c.querySelector('.por'), 'jerk');
    burst({ x: p.x, y: p.y + p.h * 0.12 }, { color: '#c8102e', n: 14, spread: 40, size: 6, up: -24 });
    shakeArena(false);
  },
  crushAll: async d => {
    flash('#3dff9a', 0.22, 420);
    ring(P(d.src), { color: '#3dff9a', size: 220, from: 1, to: 0.2, dur: 420, width: 5 });
    await W(320);
    SND.play('crush');
    allP(d).forEach(p => ring(p, { color: '#3dff9a', size: p.w * 1.8, from: 1.2, to: 0.15, dur: 300, width: 4 }));
    await W(260);
    (d.tgts || []).forEach(t => { const c = cardEl(t); if (c) restartClass(c.querySelector('.por'), 'jerk'); const p = P(t); burst({ x: p.x, y: p.y + p.h * 0.12 }, { color: '#c8102e', n: 12, spread: 40, size: 6, up: -24 }); });
    shakeArena(true);
  },
  wings: async d => {
    const p = P(d.tgt);
    SND.play('whoosh');
    ghost(d.src, 0, -60, 360, '#ffd56b');
    await W(160);
    flash('#ffe9a0', 0.3, 300);
    await column(p, { color: '#ffd56b', width: p.w * 0.7, dur: 460 });
    ring(p, { color: '#ffd56b', size: 150, width: 5 });
    burst(p, { color: '#fff8e0', n: 20, spread: 80 });
    shakeArena(true);
  },
  radiant: async d => {
    SND.play('shield');
    ring(P(d.src), { color: '#fff2a8', size: 240, dur: 520, width: 5 });
    flash('#fff8d0', 0.22, 300);
    await W(200);
    allP(d).forEach(p => { slashAt(p, { color: '#fff2a8', angle: -30, len: p.w * 1.3, thick: 6 }); burst(p, { color: '#fff8d0', n: 10 }); });
  },
  giantblade: async d => {
    const p = P(d.tgt);
    SND.play('whoosh');
    flash('#fff8d0', 0.35, 380);
    await column(p, { color: '#fff2a8', width: Math.max(34, p.w * 0.45), dur: 520 });
    ring(p, { color: '#fff2a8', size: 180, width: 6 });
    burst(p, { color: '#fffbe6', n: 22, spread: 90 });
    shakeArena(true);
  },
  shieldall: async d => { SND.play('shield'); allP(d).forEach(p => ring(p, { color: d.color || '#6fb8ff', size: p.w * 1.3, from: 0.6, to: 1.1, dur: 420, width: 4 })); await W(240); },
  crystalshield: async d => { await projectile(P(d.src), P(d.tgt), { color: '#ffe066', size: 18, dur: 260 }); ring(P(d.tgt), { color: '#ffe066', size: P(d.tgt).w * 1.3, from: 0.6, to: 1.1, width: 4 }); },
  sphere: async d => { SND.play('shield'); flash('#ffe066', 0.2, 300); allP(d).forEach(p => { ring(p, { color: '#ffe066', size: p.w * 1.35, from: 0.4, to: 1.1, dur: 520, width: 5 }); burst(p, { color: '#fff3a0', n: 8, spread: 40 }); }); await W(320); },
  crystalbolt: async d => { await projectile(P(d.src), P(d.tgt), { color: '#ffd21f', size: 24, dur: 260 }); const p = P(d.tgt); ring(p, { color: '#ffe066', size: 80 }); burst(p, { color: '#fff3a0', n: 10 }); },
  crystalblock: async d => { const p = P(d.tgt); ring(p, { color: '#ffe066', size: p.w * 1.4, width: 5 }); burst(p, { color: '#fff8c0', n: 12, spread: 50 }); },
  phantom: async d => {
    const c = cardEl(d.src);
    SND.play('whoosh');
    if (c) anim(c, [{ opacity: 1 }, { opacity: 0.1 }], 110);
    ghost(d.src, 0, 0, 300, '#4fb3ff');
    await W(130);
    const p = P(d.tgt);
    const g = fxEl('', { left: (p.x + p.w * 0.45) + 'px', top: (p.y - p.h * 0.4) + 'px', width: p.w * 0.7 + 'px', height: p.w * 0.7 + 'px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 0 14px #4fb3ff' });
    if (c && !REDUCED) { g.innerHTML = c.querySelector('.pi').innerHTML; anim(g, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 0, transform: 'translateX(-20px)' }], 520).then(() => g.remove()); } else g.remove();
    await W(110);
    slashAt(p, { color: '#4fb3ff', angle: -40, len: p.w * 1.4, thick: 6 });
    slashAt(p, { color: '#bfe6ff', angle: 40, len: p.w * 1.2, thick: 4 });
    burst(p, { color: '#9fd0ff', n: 12, spread: 50 });
    if (c) anim(c, [{ opacity: 0.1 }, { opacity: 1 }], 220).then(a => a && a.cancel && a.cancel());
  },
  afterimages: async d => {
    SND.play('whoosh');
    flash('#4fb3ff', 0.18, 360);
    for (let i = 0; i < 5; i++) ghost(d.src, (i - 2) * 26, -18 - i * 4, 520, '#4fb3ff');
    await W(300);
  },
  dash: async d => {
    const p = P(d.tgt);
    SND.play('whoosh');
    const ang = Math.random() * 160 - 80;
    slashAt(p, { color: '#4fb3ff', angle: ang, len: p.w * 1.3, thick: 4, dur: 200 });
    burst(p, { color: '#bfe6ff', n: 6, spread: 36 });
    await W(90);
  },
  flask: async d => { await projectile(P(d.src), P(d.tgt), { color: '#ffb23d', size: 16, dur: 300 }); const p = P(d.tgt); burst(p, { color: '#ffb23d', n: 10 }); burst(p, { color: '#9be05a', n: 8, spread: 40, up: 20 }); SND.play('break'); },
  bargain: async d => { SND.play('gain'); await projectile(P(d.src), P(d.tgt), { color: '#ffd56b', size: 14, dur: 300 }); ring(P(d.tgt), { color: '#ffb23d', size: 90, width: 4 }); },
  transmute: async d => { SND.play('ult'); flash('#ffb23d', 0.25, 420); allP(d).forEach(p => { ring(p, { color: '#ffb23d', size: p.w * 1.5, from: 1, to: 0.3, dur: 460, width: 4 }); burst(p, { color: '#9be05a', n: 8 }); }); await W(380); },
  orb: async d => { SND.play('zap'); await projectile(P(d.src), P(d.tgt), { color: '#4f8dff', size: 22, dur: 280 }); ring(P(d.tgt), { color: '#7fb0ff', size: 70 }); },
  splash: async d => { allP(d).forEach(p => { burst(p, { color: '#7fb0ff', n: 8 }); ring(p, { color: '#7fb0ff', size: 50, dur: 300 }); }); await W(120); },
  bigorb: async d => { SND.play('zap'); await projectile(P(d.src), P(d.tgt), { color: '#4f8dff', size: 40, dur: 320 }); const p = P(d.tgt); ring(p, { color: '#7fb0ff', size: 130, width: 5 }); burst(p, { color: '#cfe4ff', n: 16, spread: 60 }); shakeArena(false); },
  nova: async d => {
    SND.play('ult');
    const a = P(d.src);
    ring(a, { color: '#4f8dff', size: 160, from: 0.2, to: 2.6, dur: 620, width: 8 });
    flash('#4f8dff', 0.3, 420);
    await W(300);
    allP(d).forEach(p => { ring(p, { color: '#7fb0ff', size: 110, width: 5 }); burst(p, { color: '#cfe4ff', n: 16, spread: 60 }); });
    shakeArena(true);
  },
  healpulse: async d => { const p = P(d.tgt); ring(p, { color: '#5dff8f', size: p.w * 1.2, from: 0.5, to: 1.1 }); burst(p, { color: '#5dff8f', n: 8, spread: 30, up: 40 }); await W(120); },
  healbeam: async d => { SND.play('heal'); beam(P(d.src), P(d.tgt), { color: '#5dff8f', width: 10, dur: 420 }); await W(200); const p = P(d.tgt); ring(p, { color: '#5dff8f', size: p.w * 1.3, from: 0.5, to: 1.1 }); burst(p, { color: '#b8ffcf', n: 12, spread: 34, up: 50 }); },
  blessing: async d => { SND.play('heal'); flash('#5dff8f', 0.25, 460); (d.tgts || []).forEach(t => { const p = P(t); ring(p, { color: '#5dff8f', size: p.w * 1.4, from: 0.4, to: 1.1, dur: 560, width: 5 }); burst(p, { color: '#b8ffcf', n: 14, spread: 40, up: 60 }); }); await W(380); },
  guard: async d => { SND.play('shield'); if (d.tgt !== d.src) beam(P(d.src), P(d.tgt), { color: '#c9d2e6', width: 6, dur: 380 }); await W(160); ring(P(d.tgt), { color: '#c9d2e6', size: P(d.tgt).w * 1.3, width: 4 }); },
  aura: async d => { SND.play('shield'); const p = P(d.tgt); ring(p, { color: '#ff9a3c', size: p.w * 1.8, from: 0.4, to: 1.2, dur: 520, width: 6 }); burst(p, { color: '#ffc27a', n: 14, spread: 50, up: 20 }); await W(300); },
  quake: async d => {
    SND.play('crush');
    const back = await lungeIn(d.src, d.tgts && d.tgts[0], 0.2);
    shakeArena(true);
    flash(d.color || '#ff9a3c', 0.18, 300);
    allP(d).forEach(p => { ring(p, { color: d.color || '#ffb070', size: 110, width: 5 }); burst({ x: p.x, y: p.y + p.h * 0.35 }, { color: '#b89a70', n: 12, spread: 50, up: 30 }); });
    later(back, 180);
    await W(260);
  },
  buff: async d => { SND.play('gain'); allP(d).forEach(p => { ring(p, { color: d.color || '#ffd56b', size: p.w * 1.2, from: 0.6, to: 1.1 }); burst(p, { color: d.color || '#ffd56b', n: 8, spread: 30, up: 50 }); }); await W(260); },
  heal: async d => { SND.play('heal'); allP(d).forEach(p => burst(p, { color: '#5dff8f', n: 10, spread: 30, up: 50 })); await W(260); },
  hex: async d => { await projectile(P(d.src), P(d.tgt), { color: '#b066ff', size: 16, dur: 300 }); ring(P(d.tgt), { color: '#b066ff', size: 80, from: 1, to: 0.3 }); },
  arrow: async d => { SND.play('whoosh'); await projectile(P(d.src), P(d.tgt), { color: '#e8d27a', size: 10, dur: 200, ease: 'linear' }); burst(P(d.tgt), { color: '#e8d27a', n: 5, spread: 26 }); },
  volley: async d => {
    SND.play('whoosh');
    (d.tgts || []).forEach(t => { const p = P(t); for (let k = 0; k < 3; k++) later(() => projectile({ x: p.x + (k - 1) * 18 - 30, y: -20 }, { x: p.x + (k - 1) * 12, y: p.y }, { color: '#e8d27a', size: 9, dur: 240, ease: 'linear' }), k * 70); });
    await W(420);
    allP(d).forEach(p => burst(p, { color: '#e8d27a', n: 6 }));
  },
  rock: async d => { await projectile(P(d.src), P(d.tgt), { color: '#b8a888', size: 16, dur: 260 }); burst(P(d.tgt), { color: '#b8a888', n: 8 }); },
  firebreath: async d => {
    SND.play('fire');
    const a = P(d.src);
    allP(d).forEach(p => beam(a, p, { color: '#ff5a2a', width: 26, dur: 560 }));
    flash('#ff5a2a', 0.22, 400);
    await W(280);
    allP(d).forEach(p => burst(p, { color: '#ffb057', n: 12, spread: 46, up: 24 }));
  },
  roar: async d => { SND.play('banner'); const a = P(d.src); for (let k = 0; k < 3; k++) later(() => ring(a, { color: '#ff5a2a', size: 200, from: 0.2, to: 1.6, dur: 520, width: 4 }), k * 120); shakeArena(true); await W(420); },
  darkbolt: async d => { await projectile(P(d.src), P(d.tgt), { color: '#b066ff', size: 20, dur: 280 }); burst(P(d.tgt), { color: '#d8b0ff', n: 10 }); },
  acid: async d => { await projectile(P(d.src), P(d.tgt), { color: '#9be05a', size: 14, dur: 260 }); burst(P(d.tgt), { color: '#9be05a', n: 10, up: -10 }); },
  acidrain: async d => {
    (d.tgts || []).forEach(t => { const p = P(t); for (let k = 0; k < 4; k++) later(() => projectile({ x: p.x + (Math.random() * 60 - 30), y: -20 }, { x: p.x + (Math.random() * 30 - 15), y: p.y }, { color: '#9be05a', size: 10, dur: 260, ease: 'linear' }), k * 60); });
    await W(420);
    allP(d).forEach(p => burst(p, { color: '#9be05a', n: 8 }));
  },
  light: async d => { await projectile(P(d.src), P(d.tgt), { color: '#fff2a8', size: 16, dur: 260 }); burst(P(d.tgt), { color: '#fffbe0', n: 8 }); },
  summon: async d => { SND.play('gain'); const a = P(d.src); ring(a, { color: '#ffb23d', size: 140, width: 5 }); burst(a, { color: '#ffb23d', n: 14, spread: 60 }); await W(300); },
  explode: async d => { SND.play('break'); const a = P(d.src); flash('#ffb23d', 0.25, 300); ring(a, { color: '#ffb23d', size: 200, width: 7 }); burst(a, { color: '#ff8a1f', n: 24, spread: 100 }); shakeArena(true); await W(260); },
  dot: async d => { const p = P(d.tgt); burst(p, { color: d.color || '#ff7a2f', n: 7, spread: 26, up: 20, size: 6 }); await W(140); },
  dodge: d => { const c = cardEl(d.tgt); if (c && c.animate && !REDUCED) c.animate([{ transform: 'none' }, { transform: 'translateX(22px) skewX(-8deg)', opacity: 0.4, offset: 0.4 }, { transform: 'none', opacity: 1 }], { duration: T(320), easing: 'ease-out' }); ghost(d.tgt, -20, 0, 300); },
  shieldbreak: d => { const p = P(d.tgt); burst(p, { color: '#8fd0ff', n: 16, spread: 60, size: 8 }); ring(p, { color: '#8fd0ff', size: p.w * 1.4, from: 1, to: 1.6, width: 4 }); },
  reflect: d => { if (!live()) return; const a = P(d.src), b = P(d.tgt); SND.play('shield'); projectile(a, b, { color: '#cfe8ff', size: 14, dur: 220, ease: 'linear' }); ring(a, { color: '#cfe8ff', size: a.w * 1.3, from: 0.9, to: 1.2, width: 3 }); },
  charge: async d => { SND.play('ult'); const p = P(d.src); for (let k = 0; k < 3; k++) later(() => ring(p, { color: '#9fe6ff', size: 220, from: 1.2, to: 0.2, dur: 420, width: 4 }), k * 130); zap({ x: p.x - 60, y: p.y - 80 }, p, { color: '#9fe6ff' }); zap({ x: p.x + 60, y: p.y - 80 }, p, { color: '#9fe6ff' }); await W(450); },
  cataclysm: async d => {
    SND.play('zap'); flash('#cfefff', 0.45, 500); shakeArena(true);
    (d.tgts || []).forEach((t, i) => { const p = P(t); for (let k = 0; k < 3; k++) later(() => { zap({ x: p.x + (Math.random() * 80 - 40), y: -30 }, p, { color: '#9fe6ff', jag: 26, dur: 320 }); burst(p, { color: '#e8fbff', n: 10, spread: 50 }); }, i * 60 + k * 110); });
    await W(520); shakeArena(true);
  },
  staticfield: async d => { SND.play('zap'); const a = P(d.src); allP(d).forEach(p => zap(a, p, { color: '#6fd6ff', jag: 18 })); ring(a, { color: '#6fd6ff', size: 160, width: 4 }); await W(260); allP(d).forEach(p => burst(p, { color: '#9fe6ff', n: 8 })); },
  scythe: d => melee(d, { color: '#ff4a5c', angle: (d.i % 2 ? 50 : -50), len: 1.4, thick: 6, extra: p => burst(p, { color: '#8a1020', n: 6, spread: 34 }) }),
  cinderbead: async d => {
    SND.play('whoosh');
    await projectile(P(d.src), P(d.tgt), { color: '#d1203a', size: 12, dur: 260 });
    const p = P(d.tgt); ring(p, { color: '#d1203a', size: 60, from: 1, to: 0.2, dur: 300 }); burst(p, { color: '#ff4a5c', n: 10, spread: 30 });
    const c = cardEl(d.tgt); if (c) restartClass(c.querySelector('.por'), 'jerk');
  },
  hellfire: async d => {
    SND.play('fire'); flash('#5a0a14', 0.45, 520); shakeArena(true);
    allP(d).forEach((p, i) => later(() => { column(p, { color: '#d1203a', width: p.w * 0.95, dur: 600 }); burst(p, { color: '#ff6a2a', n: 18, spread: 60, up: 40 }); }, i * 80));
    await W(420); shakeArena(true);
  },
  wingdive: async d => {
    SND.play('whoosh'); ghost(d.src, 0, -70, 320, '#c0507a');
    await W(150);
    const p = P(d.tgt); await column(p, { color: '#c0507a', width: p.w * 0.6, dur: 380 });
    slashAt(p, { color: '#ffd0dc', angle: -60, len: p.w * 1.4, thick: 6 }); slashAt(p, { color: '#ff3b6b', angle: 60, len: p.w * 1.2, thick: 4 });
    burst(p, { color: '#ff3b6b', n: 14, spread: 50 }); shakeArena(false);
  },
  palm: d => melee(d, { color: '#ffe066', angle: 0, thick: 8, len: 0.8, f: 0.5, sfx: 'hit', extra: p => ring(p, { color: '#ffe066', size: 70, dur: 300 }) }),
  hexraise: async d => { SND.play('shield'); flash('#ffe066', 0.18, 300); allP(d).forEach(p => ring(p, { color: '#ffe066', size: p.w * 1.3, from: 0.4, to: 1.1, dur: 480, width: 4 })); await W(300); },
  hexcrush: async d => {
    SND.play('crush'); const a = P(d.src);
    allP(d).forEach(p => beam(a, p, { color: '#ffe066', width: 30, dur: 520 }));
    flash('#fff3a0', 0.3, 360); await W(260);
    allP(d).forEach(p => { ring(p, { color: '#ffe066', size: 120, width: 6 }); burst(p, { color: '#fff3a0', n: 12, spread: 50 }); });
    shakeArena(true);
  },
  wallblast: d => { flash('#ffe066', 0.35, 360); shakeArena(true); allP(d).forEach(p => { ring(p, { color: '#ffe066', size: 140, width: 6 }); burst(p, { color: '#fff3a0', n: 16, spread: 60 }); }); },
  halo: async d => {
    if (!d.quick) SND.play('whoosh');
    const a = P(d.src), b = P(d.tgt);
    await projectile(a, b, { color: '#e8dcff', size: d.small ? 14 : 22, dur: d.quick ? 180 : 260, ease: 'linear' });
    slashAt(b, { color: '#ffffff', angle: (d.i || 0) % 2 ? 30 : -30, len: b.w * (d.small ? 0.9 : 1.3), thick: d.small ? 3 : 5 });
    burst(b, { color: '#e8dcff', n: d.small ? 4 : 8, spread: 30 });
  },
  orbit: async d => {
    SND.play('whoosh'); const p = P(d.tgt);
    await projectile(P(d.src), p, { color: '#e8dcff', size: 20, dur: 240 });
    for (let k = 0; k < 2; k++) later(() => ring(p, { color: '#e8dcff', size: p.w * 1.2, from: 1.1, to: 0.8, dur: 380, width: 3 }), k * 120);
    slashAt(p, { color: '#fff', angle: -20, len: p.w * 1.3, thick: 4 }); await W(200);
  },
  rend: d => melee(d, { color: '#ff3b6b', angle: -55, len: 1.5, thick: 8, sfx: 'hit', extra: p => burst(p, { color: '#8a0a20', n: 10, spread: 40 }) }),
  stone: async d => { SND.play('crush'); const p = P(d.src); ring(p, { color: '#a8a29a', size: p.w * 1.5, from: 1.2, to: 0.6, dur: 420, width: 6 }); burst(p, { color: '#8a857c', n: 16, spread: 50, size: 8 }); await W(320); },
  stonewing: async d => {
    SND.play('whoosh'); ghost(d.src, 0, -70, 300, '#a8a29a'); await W(150);
    const p = P(d.tgt); flash('#a8a29a', 0.25, 300);
    await column(p, { color: '#a8a29a', width: p.w * 0.8, dur: 420 });
    ring(p, { color: '#c8c2b8', size: 150, width: 7 }); burst(p, { color: '#8a857c', n: 24, spread: 90, size: 9 });
    (d.tgts || []).slice(1).forEach(t => burst(P(t), { color: '#8a857c', n: 8 })); shakeArena(true);
  },
  hexsingle: async d => { SND.play('shield'); beam(P(d.src), P(d.tgt), { color: '#ffe066', width: 8, dur: 360 }); await W(160); const p = P(d.tgt); ring(p, { color: '#ffe066', size: p.w * 1.4, from: 0.4, to: 1.1, dur: 460, width: 6 }); burst(p, { color: '#fff3a0', n: 10, spread: 40 }); },
  sever: async d => { const p = P(d.tgt); for (let k = 0; k < Math.min(5, d.n || 1); k++) later(() => slashAt(p, { color: '#fff', angle: -60 + k * 30, len: p.w * 1.2, thick: 3, dur: 220 }), k * 50); burst(p, { color: '#e8dcff', n: 10, spread: 40 }); await W(160); },
  lastlight: d => { if (!live()) return; SND.play('shield'); const p = P(d.tgt); beam(P(d.src), p, { color: '#fff2a8', width: 6, dur: 360 }); ring(p, { color: '#fff2a8', size: p.w * 1.5, from: 0.3, to: 1.1, dur: 520, width: 5 }); burst(p, { color: '#fffbe0', n: 12, spread: 40, up: 30 }); },
  lash: d => melee(d, { color: '#ff6a2a', angle: -20, len: 1.6, thick: 5, extra: p => burst(p, { color: '#ff8a2a', n: 8, spread: 36 }) }),
  hellgate: async d => {
    SND.play('fire'); flash('#5a0a06', 0.4, 480); shakeArena(true);
    const a = P(d.src); ring(a, { color: '#ff6a2a', size: 200, from: 0.2, to: 1.6, dur: 520, width: 7 });
    await W(220); allP(d).forEach(p => { column(p, { color: '#ff4a1a', width: p.w * 0.8, dur: 520 }); burst(p, { color: '#ffb057', n: 14, spread: 60, up: 30 }); });
    await W(240);
  },
  frame: async d => {
    SND.play('select'); const p = P(d.tgt);
    const f = fxEl('frame', { left: (p.x - p.w * 0.45) + 'px', top: (p.y - p.h * 0.45) + 'px', width: p.w * 0.9 + 'px', height: p.h * 0.9 + 'px' });
    await anim(f, [{ opacity: 0, transform: 'scale(1.6) rotate(-8deg)' }, { opacity: 1, transform: 'scale(1) rotate(0)' }], 260);
    slashAt(p, { color: '#c8d4ff', angle: -35, len: p.w * 1.3, thick: 4 });
    anim(f, [{ opacity: 1 }, { opacity: 0 }], 360).then(() => f.remove());
  },
  decree: async d => { SND.play('banner'); flash('#f0d070', 0.2, 360); allP(d).forEach(p => { ring(p, { color: '#f0d070', size: p.w * 1.3, from: 0.5, to: 1.1, width: 4 }); burst(p, { color: '#fff3a0', n: 8, spread: 30, up: 50 }); }); await W(320); },
  shelter: async d => { SND.play('shield'); flash('#f0d070', 0.25, 420); allP(d).forEach(p => { ring(p, { color: '#f0d070', size: p.w * 1.5, from: 0.3, to: 1.1, dur: 560, width: 6 }); }); await W(380); },
  order: async d => { SND.play('select'); beam(P(d.src), P(d.tgt), { color: '#c8a070', width: 6, dur: 320 }); await W(150); const p = P(d.tgt); ring(p, { color: '#f0d070', size: p.w * 1.2, from: 1.2, to: 0.7, dur: 300, width: 4 }); },
  decision: async d => { SND.play('banner'); allP(d).forEach(p => ring(p, { color: '#c8a070', size: p.w * 1.4, from: 0.6, to: 1.2, dur: 480, width: 4 })); flash('#2a2016', 0.3, 400); await W(360); },
  quill: d => melee(d, { color: '#f0ece0', angle: -60, thick: 3, f: 0.45, len: 1.1 }),
  note: async d => { SND.play('gain'); await projectile(P(d.src), P(d.tgt), { color: '#7ad06a', size: 14, dur: 260 }); burst(P(d.tgt), { color: '#b8ffcf', n: 8 }); },
  song: d => { (d.tgts || []).forEach(t => { const p = P(t); burst(p, { color: '#7ad06a', n: 8, spread: 30, up: 50 }); }); },
  trinket: async d => {
    SND.play('gain'); const a = P(d.src);
    const col = { lantern: '#ffd56b', mirror: '#cfe8ff', bell: '#f0c040', spark: '#ff6a2a' }[d.item] || '#fff';
    ring(a, { color: col, size: 90, width: 4 }); burst(a, { color: col, n: 12, spread: 40, up: 30 });
    await W(220); allP(d).forEach(p => { ring(p, { color: col, size: p.w * 1.2, dur: 360 }); burst(p, { color: col, n: 8 }); });
    if (d.item === 'spark') shakeArena(false);
  },
  cards: async d => { SND.play('whoosh'); const a = P(d.src), b = P(d.tgt); for (let k = 0; k < 3; k++) later(() => projectile(a, { x: b.x + (k - 1) * 10, y: b.y }, { color: '#f4f0e8', size: 10, dur: 220, ease: 'linear' }), k * 60); await W(300); burst(b, { color: '#a050d0', n: 8 }); },
  hellmark: d => melee(d, { color: '#d1203a', angle: 40, thick: 7, len: 1.4, extra: p => burst(p, { color: '#ff4a2a', n: 10, up: 20 }) }),
  mimic: async d => { SND.play('whoosh'); ghost(d.src, 0, 0, 380, '#a050d0'); await projectile(P(d.src), P(d.tgt), { color: '#a050d0', size: 20, dur: 260 }); ring(P(d.tgt), { color: '#d8a8ff', size: 80 }); },
  gift: async d => { SND.play('break'); const p = P(d.tgt); beam(P(d.src), p, { color: '#d1203a', width: 16, dur: 420 }); await W(200); burst(p, { color: '#8fd0ff', n: 16, spread: 60, size: 8 }); burst(p, { color: '#d1203a', n: 10 }); shakeArena(false); },
  curtain: async d => { SND.play('ult'); flash('#3a0a3a', 0.45, 500); const a = P(d.src); ring(a, { color: '#d1203a', size: 220, from: 0.2, to: 1.8, dur: 560, width: 7 }); await W(300); allP(d).forEach(p => { burst(p, { color: '#d1203a', n: 16, spread: 60 }); ring(p, { color: '#a050d0', size: 110, width: 5 }); }); shakeArena(true); },
  vesselwake: d => { if (!live()) return; const p = P(d.src); flash('#5a0010', 0.5, 600); shakeArena(true); ring(p, { color: '#d1203a', size: p.w * 2.2, from: 1.4, to: 0.4, dur: 520, width: 8 }); burst(p, { color: '#ff2a3a', n: 24, spread: 80, size: 8 }); SND.play('crush'); },
  ink: async d => { await projectile(P(d.src), P(d.tgt), { color: '#2a2e44', size: 14, dur: 240 }); burst(P(d.tgt), { color: '#1a1c26', n: 12, spread: 34, size: 8 }); },
  seal: async d => { SND.play('break'); const p = P(d.tgt); await projectile(P(d.src), p, { color: '#7a8ab0', size: 18, dur: 260 }); ring(p, { color: '#1a1c26', size: p.w * 1.4, from: 1.3, to: 0.6, dur: 420, width: 8 }); burst(p, { color: '#7a8ab0', n: 10 }); },
  lastpage: async d => { SND.play('ult'); flash('#0e1018', 0.5, 520); const a = P(d.src); for (let k = 0; k < Math.min(8, Math.max(2, Math.ceil((d.n || 2) / 2))); k++) later(() => projectile(a, P(pick(d.tgts || [d.src])), { color: '#e8ecff', size: 10, dur: 300 }), k * 60); await W(420); allP(d).forEach(p => burst(p, { color: '#7a8ab0', n: 12, spread: 50 })); shakeArena(true); },
  hexburst: d => {
    if (!live()) return;
    const p = P(d.src); SND.play('break'); flash('#ffe066', 0.35, 360); shakeArena(true);
    const h = fxEl('hexfx', { left: p.x + 'px', top: p.y + 'px', width: p.w * 1.1 + 'px', height: p.w * 1.1 + 'px' });
    anim(h, [{ transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.6) rotate(40deg)', opacity: 0 }], 560).then(() => h.remove());
    for (let k = 0; k < 6; k++) { const ang = k * Math.PI / 3; const sh = fxEl('hexshard', { left: p.x + 'px', top: p.y + 'px' }); anim(sh, [{ transform: 'translate(-50%,-50%) rotate(' + (k * 60) + 'deg)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * p.w * 1.2}px), calc(-50% + ${Math.sin(ang) * p.w * 1.2}px)) rotate(${k * 60 + 120}deg)`, opacity: 0 }], 520).then(() => sh.remove()); }
    later(() => (d.tgts || []).forEach(t => { const q = P(t); zap(p, q, { color: '#ffe066', jag: 10 }); ring(q, { color: '#ffe066', size: q.w * 1.2, width: 5 }); burst(q, { color: '#fff3a0', n: 10 }); }), 220);
  },
  wave: async d => { const a = P(d.src); ring(a, { color: d.color || '#fff', size: 200, from: 0.2, to: 1.8, dur: 500, width: 5 }); await W(260); allP(d).forEach(p => burst(p, { color: d.color || '#fff', n: 8 })); }
};

/* ================= UI: engine hooks ================= */
const live = () => !!UI.bt && !B.abort;
HOOK.sleep = ms => new Promise(r => setTimeout(r, T(ms)));
HOOK.fx = async (name, d) => {
  if (!live()) return;
  try { await (FX[name] || FX.slash)(d || {}); } catch (e) { console.warn('fx', name, e); }
};
HOOK.sfx = n => { if (live()) SND.play(n); };
HOOK.float = (u, text, cls, rival) => {
  if (!live()) return;
  const c = cardEl(u); if (!c) return;
  const por = c.querySelector('.por');
  const now = performance.now();
  const st = c._fl || (c._fl = { t: 0, n: 0 });
  st.n = (now - st.t < 380) ? st.n + 1 : 0; st.t = now;
  const s = document.createElement('div');
  s.className = 'fl ' + (cls || 'dmg');
  s.innerHTML = esc(text) + (rival ? '<span class="rv">Rival +20%</span>' : '');
  s.style.marginTop = (-Math.min(st.n, 5) * 22) + 'px';
  const dur = T(cls === 'crit' ? 1300 : 1150);
  s.style.animationDuration = dur + 'ms';
  por.appendChild(s);
  setTimeout(() => s.remove(), dur + 60);
};
HOOK.hurt = (u, crit, real) => {
  if (!live()) return;
  const c = cardEl(u); if (!c) return;
  const por = c.querySelector('.por');
  restartClass(por, crit || real > u.maxHp * 0.2 ? 'shake2' : 'shake');
  const hit = c.querySelector('.hit');
  if (hit) anim(hit, [{ opacity: crit ? 0.8 : 0.55 }, { opacity: 0 }], 300);
  if (crit) { shakeArena(false); flash('#fff1c0', 0.16, 160); }
  updateUnit(u);
};
HOOK.update = () => { if (UI.bt) update(); };
HOOK.log = (t, cls) => { UI.log.push([t, cls]); if (UI.log.length > 300) UI.log.shift(); };
HOOK.actName = (u, name, kind) => {
  if (!live()) return;
  let icon = '';
  if (u.isHero) { const ab = abil(u, kind) || ['basic', 'skill', 'ult'].map(k => abil(u, k)).find(x => x && x.name === name); icon = ab ? ab.icon : ''; }
  else { const m = (movesFor(u) || []).find(x => x.name === name); icon = m ? m.icon : ''; }
  caption(`${icon} ${esc(name)} <small>${esc(u.name)}</small>`, u.color);
};
HOOK.banner = async (title, sub, color) => {
  if (!live()) return;
  SND.play('banner');
  const b = document.createElement('div');
  b.className = 'banner'; b.style.setProperty('--c', color || '#ffdf8a');
  b.innerHTML = `<h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}`;
  UI.arena.appendChild(b);
  await anim(b, [{ opacity: 0, transform: 'translateY(-50%) scaleY(.2)' }, { opacity: 1, transform: 'translateY(-50%) scaleY(1)' }], 240);
  await W(1150);
  await anim(b, [{ opacity: 1 }, { opacity: 0 }], 260);
  b.remove();
};
HOOK.ult = async (u, a) => {
  if (!live()) return;
  SND.play('ult');
  const rev = u.side === 'enemy';
  const c = document.createElement('div');
  c.className = 'cine' + (rev ? ' rev' : '');
  c.style.setProperty('--c', u.color);
  c.innerHTML = `<div class="band"></div><div class="cp" style="${rev ? 'right' : 'left'}:5%">${portraitSVG(lookOf(u), { glow: u.heroId === 'harry' })}</div><div class="ct"><h2>${esc(a.name)}</h2><p>${esc(u.name)}</p></div>`;
  document.body.appendChild(c);
  const band = c.querySelector('.band'), cp = c.querySelector('.cp'), ct = c.querySelector('.ct');
  anim(band, [{ transform: 'skewY(-8deg) scaleY(0)' }, { transform: 'skewY(-8deg) scaleY(1)' }], 200);
  anim(cp, [{ transform: `translateX(${rev ? 120 : -120}%)` }, { transform: 'translateX(0)' }], 300, { easing: 'cubic-bezier(.2,.9,.3,1.1)' });
  await anim(ct, [{ opacity: 0, transform: `translateY(-50%) translateX(${rev ? -40 : 40}px)` }, { opacity: 1, transform: 'translateY(-50%) translateX(0)' }], 320);
  await W(650);
  await anim(c, [{ opacity: 1 }, { opacity: 0 }], 220);
  c.remove();
  flash(u.color, 0.25, 260);
};
HOOK.ko = async u => {
  if (!live()) return;
  updateUnit(u);
  const c = cardEl(u);
  if (c) { c.classList.add('ko'); burst(P(u), { color: '#888', n: 16, spread: 60, size: 8 }); }
  await W(380);
};
HOOK.revive = async u => {
  if (!live()) return;
  const c = cardEl(u);
  if (c) c.classList.remove('ko');
  const p = P(u);
  ring(p, { color: '#5dff8f', size: p.w * 1.6, width: 5 });
  burst(p, { color: '#b8ffcf', n: 18, spread: 50, up: 60 });
  SND.play('heal');
  update();
  await W(360);
};
HOOK.rebuild = () => { if (UI.bt) { renderRows(); update(); } };
HOOK.choose = u => new Promise(res => {
  if (!UI.bt) return res(null);
  UI.pending = { u, res, kind: 'basic' };
  showActions();
});

function caption(html, color) {
  const m = $('#mid'); if (!m) return;
  m.innerHTML = `<div class="caption" style="--c:${color}">${html}</div>`;
}
