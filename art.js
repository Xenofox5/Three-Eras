/* ================= ART ================= */
let ARTID = 0;
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
};

function svgWrap(inner, bg, id) {
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="pt" aria-hidden="true">
<defs>
<radialGradient id="bg${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${shade(bg, 0.18)}"/><stop offset="1" stop-color="${shade(bg, -0.6)}"/></radialGradient>
<filter id="gl${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="gs${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1"/></filter>
</defs>
<rect width="100" height="100" fill="url(#bg${id})"/>${inner}</svg>`;
}

function weaponArt(w, L, id) {
  switch (w) {
    case 'sword': return `<g transform="rotate(-32 80 70)"><rect x="77.5" y="18" width="5" height="58" rx="1" fill="#d7dbe4"/><rect x="79.3" y="20" width="1.4" height="54" fill="#fff" opacity=".6"/><rect x="71" y="74" width="18" height="4" rx="1.5" fill="${L.trim || '#c9a25a'}"/><rect x="78" y="78" width="4" height="12" fill="#3a2a1e"/></g>`;
    case 'katana': return `<g transform="rotate(-38 80 70)"><path d="M79 12 Q83 40 80.5 76 L78 76 Q80 40 77 12Z" fill="#e8ecf2"/><rect x="74" y="75" width="10" height="3" rx="1.5" fill="#222"/><rect x="77.5" y="78" width="3.5" height="14" fill="#1a1a1a"/><path d="M77.5 80 l3.5 2 M77.5 84 l3.5 2 M77.5 88 l3.5 2" stroke="#666" stroke-width=".8"/></g>`;
    case 'dagger': return `<g transform="rotate(28 78 74)"><path d="M78 42 L81 44 L80.5 70 L77.5 70Z" fill="#e8f2ff"/><rect x="74" y="69.5" width="11" height="3" rx="1.5" fill="#1a2238"/><rect x="77.6" y="72" width="3" height="10" fill="#111"/><path d="M78 44 L80.5 70" stroke="${L.trim}" stroke-width=".6" opacity=".9"/></g>`;
    case 'lance': return `<g transform="rotate(-24 80 60)"><rect x="78.6" y="14" width="3" height="86" fill="#c79a3a"/><path d="M80 2 L85 20 L80 24 L75 20Z" fill="#fff4c8" stroke="#d9a93a" stroke-width=".8"/><path d="M73 22 h14" stroke="#d9a93a" stroke-width="2.4" stroke-linecap="round"/></g>`;
    case 'spear': return `<g transform="rotate(-20 80 60)"><rect x="78.8" y="16" width="2.6" height="84" fill="#6b5a44"/><path d="M80 2 L84 18 L80 22 L76 18Z" fill="#d6dbe4" stroke="#8a909c" stroke-width=".6"/><path d="M77 22 q3 3 6 0" stroke="#8e2b2b" stroke-width="1.6" fill="none"/></g>`;
    case 'staff': return `<g transform="rotate(-14 82 60)"><rect x="80" y="20" width="3" height="80" rx="1.4" fill="#8a6a3a"/><circle cx="81.5" cy="17" r="6" fill="${L.trim}" opacity=".35" filter="url(#gl${id})"/><circle cx="81.5" cy="17" r="4" fill="none" stroke="#e9e4d2" stroke-width="1.6"/><circle cx="81.5" cy="17" r="2" fill="${L.trim}"/></g>`;
    case 'lightsword': return `<g transform="rotate(-30 80 70)"><rect x="76" y="14" width="8" height="62" rx="4" fill="#fff6c0" opacity=".55" filter="url(#gl${id})"/><rect x="78" y="16" width="4" height="60" rx="2" fill="#fffbe6"/><rect x="72" y="75" width="16" height="3.5" rx="1.5" fill="#8a909c"/><rect x="78.2" y="78" width="3.6" height="12" fill="#3a3a44"/></g>`;
    case 'crystal': return `<g><circle cx="78" cy="78" r="14" fill="#ffe066" opacity=".55" filter="url(#gl${id})"/><circle cx="78" cy="78" r="9.5" fill="#fff3a0" stroke="#ffe066" stroke-width="1"/><circle cx="78" cy="78" r="9.5" fill="#ffd21f" opacity=".45"/><ellipse cx="74.5" cy="74" rx="3" ry="2" fill="#fff" opacity=".9"/><path d="M14 98 L30 62" stroke="#d7dbe4" stroke-width="1.8"/></g>`;
    case 'flask': return `<g><circle cx="81" cy="80" r="11" fill="#ffb23d" opacity=".35" filter="url(#gl${id})"/><path d="M78 66 h6 v6 l6 12 q2 6 -4 7 h-10 q-6 -1 -4 -7 l6 -12z" fill="#ffefc8" opacity=".85" stroke="#7a5a2a" stroke-width=".8"/><path d="M74 83 q7 -3 14 0 q2 6 -4 7 h-10 q-6 -1 0 -7z" fill="#ff8a1f"/><circle cx="80" cy="85" r="1.3" fill="#fff"/></g>`;
    case 'orb': return `<g><circle cx="81" cy="79" r="13" fill="#4f8dff" opacity=".5" filter="url(#gl${id})"/><circle cx="81" cy="79" r="8" fill="#8fc0ff"/><circle cx="81" cy="79" r="5" fill="#e6f1ff"/></g>`;
    case 'flame': return `<g><path d="M80 94 q-12 -8 -6 -22 q2 6 6 6 q-3 -10 6 -20 q0 10 6 16 q6 10 -2 20z" fill="#ff7a2f" opacity=".75" filter="url(#gs${id})"/><path d="M81 92 q-6 -5 -2 -13 q2 4 4 4 q0 -6 3 -9 q2 8 2 12 q0 5 -7 6z" fill="#ffd56b"/></g>`;
    case 'bolt': return `<g><path d="M84 58 L74 78 L81 78 L76 96 L90 72 L83 72 L88 58Z" fill="#9fe6ff" filter="url(#gs${id})"/><path d="M84 58 L74 78 L81 78 L76 96 L90 72 L83 72 L88 58Z" fill="#e8fbff"/></g>`;
    case 'scythes': return `<g>${[[-1, 0], [1, 1]].map(([dir]) => `<g transform="translate(${dir < 0 ? 0 : 100},0) scale(${dir < 0 ? 1 : -1},1)"><path d="M10 96 L30 24" stroke="#3a2a2a" stroke-width="3" stroke-linecap="round"/><path d="M30 24 Q6 14 -2 32 Q14 22 28 30Z" fill="#cfd4dc" stroke="#7a1020" stroke-width="1"/><path d="M28 28 Q10 22 2 30" stroke="#ff4a5c" stroke-width=".8" fill="none" opacity=".8"/></g>`).join('')}</g>`;
    case 'claws': return `<g><g filter="url(#gs${id})" opacity=".7"><path d="M70 98 Q74 76 86 66 M76 98 Q80 78 92 70 M82 98 Q86 82 96 76" stroke="#ff3b6b" stroke-width="5" fill="none"/></g><path d="M70 98 Q74 76 86 66 M76 98 Q80 78 92 70 M82 98 Q86 82 96 76" stroke="#ffd0dc" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
    case 'hex': return `<g><g filter="url(#gl${id})"><path d="M81 64 L93 71 L93 85 L81 92 L69 85 L69 71Z" fill="#ffe066" opacity=".55"/></g><path d="M81 64 L93 71 L93 85 L81 92 L69 85 L69 71Z" fill="none" stroke="#fff3a0" stroke-width="2"/><path d="M81 70 L88 74 L88 82 L81 86 L74 82 L74 74Z" fill="#ffe066" opacity=".35" stroke="#fff3a0" stroke-width=".8"/><circle cx="81" cy="78" r="1.6" fill="#fffbe0"/></g>`;
    case 'halos': return `<g>${[[17, 80], [83, 80]].map(([x, y]) => `<g filter="url(#gl${id})"><ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="none" stroke="#e8dcff" stroke-width="4"/></g><ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="none" stroke="#fffaff" stroke-width="1.6"/>`).join('')}</g>`;
    case 'chains': return `<g><path d="M70 98 Q74 80 82 72 Q90 64 92 50" stroke="#5a2a20" stroke-width="5" fill="none" stroke-dasharray="4 2.5"/><path d="M70 98 Q74 80 82 72 Q90 64 92 50" stroke="#ff6a2a" stroke-width="1.6" fill="none" stroke-dasharray="4 2.5" opacity=".9"/><g filter="url(#gs${id})"><circle cx="92" cy="49" r="4" fill="#ff8a2a"/></g></g>`;
    case 'lute': return `<g transform="rotate(-28 80 80)"><ellipse cx="80" cy="86" rx="11" ry="13" fill="#b07a3a" stroke="#6a4420" stroke-width="1.2"/><circle cx="80" cy="84" r="3" fill="#3a2410"/><rect x="78.5" y="52" width="3" height="24" fill="#6a4420"/><rect x="76" y="48" width="8" height="6" rx="1" fill="#4a2e14"/><path d="M79 56 L79 98 M81 56 L81 98" stroke="#f0e0b0" stroke-width=".4"/></g>`;
    case 'quill': return `<g transform="rotate(-25 80 80)"><path d="M80 98 L82 60 Q90 52 86 40 Q78 52 79 60Z" fill="#f0ece0" stroke="#9a9488" stroke-width=".8"/><path d="M80.5 96 L81.5 60" stroke="#9a9488" stroke-width=".6"/><circle cx="80" cy="99" r="1.6" fill="#1a1a2a"/></g>`;
    case 'cards': return `<g>${[[70, 82, -18, '#f4f0e8'], [78, 79, -4, '#f4f0e8'], [86, 82, 12, '#f4f0e8']].map(([x, y, r, c], i) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 5}" y="${y - 7}" width="10" height="14" rx="1.5" fill="${c}" stroke="#5a1a6a" stroke-width=".8"/><text x="${x}" y="${y + 2.5}" font-size="7" text-anchor="middle" fill="${i === 1 ? '#c8102e' : '#1a1a2a'}">${['♠', '♥', '♣'][i]}</text></g>`).join('')}</g>`;
    case 'scroll': return `<g transform="rotate(-20 80 82)"><rect x="70" y="70" width="20" height="24" rx="2" fill="#f2e6c4" stroke="#a88a4a" stroke-width="1"/><rect x="68" y="67" width="24" height="5" rx="2.5" fill="#d8c08a" stroke="#a88a4a" stroke-width=".8"/><rect x="68" y="92" width="24" height="5" rx="2.5" fill="#d8c08a" stroke="#a88a4a" stroke-width=".8"/><path d="M74 77 H86 M74 81 H86 M74 85 H82" stroke="#8a7a5a" stroke-width=".8"/><circle cx="84" cy="90" r="3" fill="#b8202a"/></g>`;
    case 'book': return `<g><g filter="url(#gl${id})" opacity=".7"><circle cx="18" cy="74" r="7" fill="#ffb84a"/></g><rect x="16.6" y="76" width="2.8" height="12" fill="#e8dcc0"/><path d="M18 69 Q15.5 73 18 76 Q20.5 73 18 69Z" fill="#ffd56b"/><path d="M60 86 Q70 80 80 84 Q90 80 98 86 L98 98 Q90 93 80 96 Q70 93 60 98Z" fill="#efe4c8" stroke="#6a5a3a" stroke-width="1"/><path d="M80 84 L80 96" stroke="#6a5a3a" stroke-width=".8"/><path d="M64 88 H76 M64 91 H75 M84 88 H95 M84 91 H93" stroke="#3a3a4a" stroke-width=".6"/><path d="M86 66 Q94 60 92 52 Q87 60 85 66 L84 84" stroke="#e8e4d8" stroke-width="2.4" fill="none"/></g>`;
    case 'club': return `<g transform="rotate(-30 80 70)"><path d="M77 30 q3 -4 7 0 l2 44 h-11z" fill="#6b4a2a"/><circle cx="80" cy="34" r=".9" fill="#aaa"/><circle cx="83" cy="42" r=".9" fill="#aaa"/></g>`;
  }
  return '';
}

function backHair(L) {
  const c = L.hair;
  if (L.hairStyle === 'long') return `<path d="M31 42 Q28 70 34 92 L44 92 Q38 68 40 48Z M69 42 Q72 70 66 92 L56 92 Q62 68 60 48Z" fill="${c}"/><path d="M33 50 Q31 70 36 88" stroke="${shade(c, -0.25)}" stroke-width="1" fill="none"/>`;
  if (L.hairStyle === 'wild') return `<path d="M30 40 Q24 62 28 86 L32 78 L34 90 L38 76 L40 84 L42 60 Q38 50 40 44Z M70 40 Q76 62 72 86 L68 78 L66 90 L62 76 L60 84 L58 60 Q62 50 60 44Z" fill="${c}"/>`;
  if (L.hairStyle === 'ponytail') return `<path d="M64 34 Q80 40 76 70 Q74 62 68 56 Q70 46 62 40Z" fill="${c}"/>`;
  return '';
}

function frontHair(L) {
  const c = L.hair, d = shade(c, -0.3);
  switch (L.hairStyle) {
    case 'short': return `<path d="M32.5 46 C31 27 42 21.5 50 21.5 C59 21.5 69.5 27 67.5 46 C66 38 62 33 56 32 C52 35 44 35 40 33 C36 35 34 40 32.5 46Z" fill="${c}"/><path d="M40 33 q4 3 9 1 M52 33 q4 2 8 0" stroke="${d}" stroke-width=".9" fill="none"/>`;
    case 'spiky': return `<path d="M31.5 47 L30 30 L37 33 L36 21 L44 28 L48 16 L53 27 L60 18 L61 29 L70 25 L67 36 L71 44 L66 42 C64 36 60 33 55 33 L52 38 L48 33 L44 37 L40 33 C36 36 33.5 41 31.5 47Z" fill="${c}"/><path d="M44 28 L46 33 M53 27 L52 32 M61 29 L58 33" stroke="${d}" stroke-width=".7"/>`;
    case 'swept': return `<path d="M32.5 47 C30 26 42 20.5 51 20.5 C61 20.5 70 27 67.5 45 C66 38 63 33 58 31.5 C52 34 44 38 34 47Z" fill="${c}"/><path d="M58 31.5 C50 33 42 37 36 44 M62 34 C56 34 48 38 41 44" stroke="${d}" stroke-width=".9" fill="none"/>`;
    case 'messy': return `<path d="M31.5 48 C29 27 41 20 50 20 C60 20 71 26 68.5 47 L66 40 L64 44 L61 35 L58 41 L55 33 L52 40 L49 33 L46 40 L43 34 L40 41 L38 35 L35 42Z" fill="${c}"/><path d="M36 26 Q33 19 39 21 Q41 15 47 19 Q51 13 55 19 Q61 15 62 22 Q68 20 66 27Z" fill="${c}"/>`;
    case 'parted': return `<path d="M32.5 46 C30 27 41 21 50 21 C60 21 70 27 67.5 46 C66 37 62 31 56 30 L44 31 C39 33 34 39 32.5 46Z" fill="${c}"/><path d="M44 31 Q47 24 52 22" stroke="${d}" stroke-width="1.2" fill="none"/><path d="M44 31 Q56 30 64 37" stroke="${d}" stroke-width=".8" fill="none"/>`;
    case 'wild': return `<path d="M31 50 C28 26 41 19 50 19 C60 19 72 26 69 50 L67 41 L64 47 L62 37 L58 44 L56 34 L52 42 L50 33 L47 42 L44 34 L42 44 L38 36 L36 46 L33 40Z" fill="${c}"/><path d="M38 22 L33 14 L41 19 L45 11 L50 18 L56 10 L58 19 L66 13 L63 23Z" fill="${c}"/>`;
    case 'long': return `<path d="M31 50 C28 26 41 20 50 20 C59 20 72 26 69 50 C67 40 64 33 57 31 C52 33 47 33 43 31 C37 33 33 40 31 50Z" fill="${c}"/>`;
    case 'ponytail': return `<path d="M32.5 46 C31 27 42 21.5 50 21.5 C59 21.5 69.5 27 67.5 46 C66 38 62 32 52 31 C46 33 40 34 32.5 46Z" fill="${c}"/><rect x="62" y="35" width="5" height="4" rx="1.5" fill="${L.trim || '#ff8fae'}" transform="rotate(30 64 37)"/>`;
    case 'bun': return `<path d="M32.5 46 C31 27 42 21.5 50 21.5 C59 21.5 69.5 27 67.5 46 C66 38 62 33 56 32 C50 34 44 34 40 32 C36 35 34 40 32.5 46Z" fill="${c}"/><circle cx="50" cy="17" r="7" fill="${c}"/><path d="M44 19 Q50 22 56 19" stroke="${d}" stroke-width="1" fill="none"/>`;
    case 'bald': return `<ellipse cx="45" cy="30" rx="5" ry="2.5" fill="#fff" opacity=".18"/>`;
  }
  return '';
}

function bodyArt(L) {
  const b = L.bodyColor, t = L.trim, dk = shade(b, -0.35), lt = shade(b, 0.2);
  if (L.body === 'armour') return `
<path d="M14 100 Q16 76 34 70 L66 70 Q84 76 86 100Z" fill="${b}"/>
<path d="M34 70 L66 70 L62 100 L38 100Z" fill="${lt}"/>
<path d="M50 72 L50 100" stroke="${dk}" stroke-width="1.2"/>
<path d="M38 82 Q50 88 62 82" stroke="${t}" stroke-width="1.6" fill="none"/>
<ellipse cx="24" cy="81" rx="12" ry="8" fill="${lt}" stroke="${t}" stroke-width="1.4"/>
<ellipse cx="76" cy="81" rx="12" ry="8" fill="${lt}" stroke="${t}" stroke-width="1.4"/>
<path d="M15 83 Q24 77 33 83 M67 83 Q76 77 85 83" stroke="${dk}" stroke-width="1" fill="none"/>
<path d="M40 70 L50 77 L60 70" stroke="${t}" stroke-width="1.4" fill="none"/>`;
  if (L.body === 'robe') return `
<path d="M12 100 Q14 74 36 68 L64 68 Q86 74 88 100Z" fill="${b}"/>
<path d="M38 68 L50 90 L62 68" fill="${dk}"/>
<path d="M36 68 L50 92 L64 68" stroke="${t}" stroke-width="2.2" fill="none"/>
<path d="M22 100 Q24 84 30 78 M78 100 Q76 84 70 78" stroke="${dk}" stroke-width="1.2" fill="none"/>`;
  return `
<path d="M12 100 Q14 75 34 69 L66 69 Q86 75 88 100Z" fill="${b}"/>
<path d="M34 69 L41 60 L50 80 Z" fill="${lt}" stroke="${t}" stroke-width="1"/>
<path d="M66 69 L59 60 L50 80 Z" fill="${lt}" stroke="${t}" stroke-width="1"/>
<path d="M50 80 L50 100" stroke="${t}" stroke-width="1.3"/>
<circle cx="47" cy="88" r="1" fill="${t}"/><circle cx="47" cy="95" r="1" fill="${t}"/>`;
}

function eyesArt(L, glow, id) {
  const col = glow && L.glowEye ? L.glowEye : L.eye;
  const glowing = (glow && L.glowEye) || L.eyeGlow;
  const big = L.young ? 1.12 : 1;
  const eye = x => `<ellipse cx="${x}" cy="48" rx="${3.7 * big}" ry="${2.5 * big}" fill="#f6f2ec"/><circle cx="${x}" cy="48.2" r="${2 * big}" fill="${col}"/><circle cx="${x}" cy="48.2" r="${0.9 * big}" fill="${glowing ? '#fff' : '#0a0a0e'}"/><circle cx="${x + 0.8}" cy="47.3" r=".55" fill="#fff"/>`;
  let s = '';
  if (glowing) s += `<g filter="url(#gl${id})" opacity=".95"><ellipse cx="43" cy="48" rx="6" ry="3.6" fill="${col}"/><ellipse cx="57" cy="48" rx="6" ry="3.6" fill="${col}"/></g>`;
  s += eye(43) + eye(57);
  if (L.lines) s += `<g opacity=".55" stroke="#c8d4ff" stroke-width=".7"><path d="M36 45.5 L64 45.5 M35 47.5 L65 47.5 M36 49.5 L64 49.5 M38 51.2 L62 51.2"/></g>`;
  if (L.lashes) s += `<path d="M39 46.2 l-1.6 -1.4 M41 45.5 l-1 -1.8 M61 46.2 l1.6 -1.4 M59 45.5 l1 -1.8" stroke="#2a1a10" stroke-width=".9" stroke-linecap="round"/>`;
  return s;
}

function heroFace(L, o, id) {
  const sk = L.skin, sd = shade(sk, -0.18);
  let s = '';
  if (L.aura) s += `<circle cx="50" cy="56" r="44" fill="none" stroke="${L.aura}" stroke-width="5" opacity=".45" filter="url(#gl${id})"/><circle cx="50" cy="56" r="38" fill="${L.aura}" opacity=".12"/>`;
  if (o.glow && L.glowEye) s += `<circle cx="50" cy="50" r="40" fill="${L.glowEye}" opacity=".14" filter="url(#gl${id})"/>`;
  const front = ['crystal', 'flask', 'orb', 'flame', 'bolt', 'claws', 'hex', 'halos', 'lute', 'cards', 'chains', 'scroll', 'book'].includes(L.weapon);
  if (L.wings === 'demon') s += `<g fill="#2a0c18" stroke="#c0507a" stroke-width="1"><path d="M38 66 Q20 40 2 34 Q8 44 6 52 Q12 48 16 54 Q14 60 20 62 Q24 58 28 64 Q30 66 34 70Z"/><path d="M62 66 Q80 40 98 34 Q92 44 94 52 Q88 48 84 54 Q86 60 80 62 Q76 58 72 64 Q70 66 66 70Z"/></g><path d="M36 64 Q22 46 6 38 M64 64 Q78 46 94 38" stroke="#5a1a30" stroke-width="1" fill="none"/>`;
  if (!front) s += weaponArt(L.weapon, L, id);
  s += backHair(L);
  s += `<rect x="44" y="58" width="12" height="14" fill="${sd}"/>`;
  s += bodyArt(L);
  if (L.chain) s += `<path d="M36 74 Q50 92 64 74" stroke="#e8b830" stroke-width="2" fill="none" stroke-dasharray="2.5 1.2"/><circle cx="50" cy="86" r="3.4" fill="#e8b830" stroke="#8a6410" stroke-width=".8"/><circle cx="50" cy="86" r="1.3" fill="#c8102e"/>`;
  if (front) s += weaponArt(L.weapon, L, id);
  if (L.beads) { const bx = [64, 69, 74, 79, 84, 89], by = [92, 90, 89, 89, 90, 92]; s += `<path d="M62 93 Q76 86 91 93" stroke="#3a1a1a" stroke-width="1" fill="none"/>` + bx.map((x, i) => `<circle cx="${x}" cy="${by[i]}" r="2.3" fill="${['#5a0a14', '#8a1020', '#d1203a', '#a8102a', '#6a0a18', '#c01a34'][i]}" stroke="#ff8a9a" stroke-width=".4"/><circle cx="${x - 0.7}" cy="${by[i] - 0.8}" r=".6" fill="#ffd0d8" opacity=".8"/>`).join(''); }
  if (L.bandana) s += `<path d="M36 70 Q50 80 64 70 L62 76 Q50 84 38 76Z" fill="${L.bandana}"/>`;
  const rx = L.big ? 18.5 : 17;
  s += `<ellipse cx="32.8" cy="49" rx="2.4" ry="3.6" fill="${sd}"/><ellipse cx="67.2" cy="49" rx="2.4" ry="3.6" fill="${sd}"/>`;
  s += `<path d="M${50 - rx} 44 Q${50 - rx} 66 50 68 Q${50 + rx} 66 ${50 + rx} 44 Q${50 + rx} 24 50 24 Q${50 - rx} 24 ${50 - rx} 44Z" fill="${sk}"/>`;
  s += `<path d="M${50 - rx + 2} 56 Q50 70 ${50 + rx - 2} 56 Q${50 + rx - 4} 66 50 67.6 Q${50 - rx + 4} 66 ${50 - rx + 2} 56Z" fill="${sd}" opacity=".35"/>`;
  if (L.helm === 'jester') {
    const s2 = s;
    s += eyesArt(L, o.glow, id);
    s += `<path d="M45.5 60.5 Q50 64 54.5 60.5" stroke="#5a2a2a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M31 40 Q50 26 69 40 L66 42 Q50 32 34 42Z" fill="#f0c040"/>`;
    s += `<path d="M33 40 Q22 22 10 26 Q18 30 20 40Z" fill="#5a1a6a" stroke="#f0c040" stroke-width=".8"/><path d="M67 40 Q78 22 90 26 Q82 30 80 40Z" fill="#c8102e" stroke="#f0c040" stroke-width=".8"/>`;
    s += `<path d="M34 41 Q50 22 66 41Z" fill="#a050d0"/><circle cx="10" cy="26" r="3" fill="#f0c040"/><circle cx="90" cy="26" r="3" fill="#f0c040"/>`;
    s += `<path d="M40 52 L42 56 M60 52 L58 56" stroke="#1a1a2a" stroke-width="1"/>`;
    return s;
  }
  if (L.helm === 'mask') {
    s += frontHair(L);
    s += `<path d="M34 42 Q34 30 50 29 Q66 30 66 42 L65 56 Q59 66 50 67 Q41 66 35 56Z" fill="#f4f0f8" stroke="#b89cff" stroke-width="1"/>`;
    s += `<path d="M38 47 Q43 43.5 47 47 Q43 49.5 38 47Z M53 47 Q57 43.5 62 47 Q57 49.5 53 47Z" fill="#1a1428"/>`;
    s += `<g filter="url(#gs${id})"><circle cx="43" cy="47" r="1.6" fill="${L.eye}"/><circle cx="57" cy="47" r="1.6" fill="${L.eye}"/></g>`;
    s += `<path d="M50 32 L50 40 M46 36 L54 36" stroke="#b89cff" stroke-width=".9"/><path d="M45 59 Q50 61 55 59" stroke="#b89cff" stroke-width=".9" fill="none"/>`;
    s += `<path d="M40 52 Q42 55 44 52 M56 52 Q58 55 60 52" stroke="#d8c8f0" stroke-width=".7" fill="none"/>`;
    return s;
  }
  if (L.helm === 'visor') {
    const hb = L.bodyColor, ht = L.trim, hd = shade(hb, -0.35), vg = L.visorGlow || '#ffd56b';
    s += `<path d="M31 50 Q30 20 50 18 Q70 20 69 50 L68 64 Q60 70 50 70 Q40 70 32 64Z" fill="${hb}" stroke="${ht}" stroke-width="1.2"/>`;
    s += `<path d="M50 18 L50 70" stroke="${hd}" stroke-width="1.2"/>`;
    s += `<path d="M34 46 L66 46 L65 52 L35 52Z" fill="#0a0c14"/>`;
    s += `<g filter="url(#gl${id})"><rect x="37" y="47.5" width="10" height="3" rx="1.5" fill="${vg}"/><rect x="53" y="47.5" width="10" height="3" rx="1.5" fill="${vg}"/></g>`;
    s += `<rect x="37" y="47.8" width="10" height="2.4" rx="1.2" fill="#fff"/><rect x="53" y="47.8" width="10" height="2.4" rx="1.2" fill="#fff"/>`;
    s += `<path d="M40 58 h20 M41 62 h18" stroke="${hd}" stroke-width="1.1"/><path d="M34 30 Q50 22 66 30" stroke="${ht}" stroke-width="1" fill="none"/>`;
    return s;
  }
  if (L.helm === 'winged') {
    s += frontHair(L);
    s += `<path d="M33 42 Q33 22 50 20 Q67 22 67 42 L67 46 L33 46Z" fill="${L.bodyColor}" stroke="${L.trim}" stroke-width="1.2"/>`;
    s += `<path d="M50 20 L50 46" stroke="${L.trim}" stroke-width="1.6"/>`;
    s += `<path d="M33 36 Q16 26 6 10 Q20 18 24 18 Q16 10 18 4 Q28 18 34 30Z" fill="#fff8e0" stroke="${L.trim}" stroke-width=".8"/>`;
    s += `<path d="M67 36 Q84 26 94 10 Q80 18 76 18 Q84 10 82 4 Q72 18 66 30Z" fill="#fff8e0" stroke="${L.trim}" stroke-width=".8"/>`;
    s += `<path d="M34 44 Q50 41 66 44 L65 56 Q58 64 50 64 Q42 64 35 56Z" fill="#f2c94c" stroke="#a87b1c" stroke-width="1"/>`;
    s += `<path d="M38 49 Q43 46 47 49 Q43 51 38 49Z M53 49 Q57 46 62 49 Q57 51 53 49Z" fill="#1a1406"/>`;
    s += `<path d="M50 52 L50 58 M45 60 Q50 62 55 60" stroke="#a87b1c" stroke-width=".9" fill="none"/>`;
    return s;
  }
  s += eyesArt(L, o.glow, id);
  const brow = L.brow === 'firm' ? 'M38 43 L47 44.4 M53 44.4 L62 43' : 'M38.5 43.5 Q43 41.5 47 43 M53 43 Q57 41.5 61.5 43.5';
  s += `<path d="${brow}" stroke="${shade(L.hair === L.skin ? '#3a2a1a' : L.hair, -0.35)}" stroke-width="1.7" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M50 50 Q49 55 50.5 56" stroke="${shade(sk, -0.3)}" stroke-width="1" fill="none"/>`;
  if (L.smile) s += `<path d="M42.5 59 Q50 66 57.5 59" stroke="#5a2a2a" stroke-width="1.5" fill="#fff" stroke-linejoin="round"/>`;
  else s += `<path d="M45.5 60.5 Q50 61.8 54.5 60.5" stroke="${shade(sk, -0.4)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  if (L.scars) s += `<path d="M39 52 L44.5 55.5 M39.6 54.6 L44 57.6 M61 52 L55.5 55.5 M60.4 54.6 L56 57.6" stroke="#b0405a" stroke-width="1.1" stroke-linecap="round"/>`;
  if (L.beard) s += `<path d="M34 54 Q36 70 50 74 Q64 70 66 54 Q62 62 56 60 Q50 63 44 60 Q38 62 34 54Z" fill="${L.beard}"/><path d="M44.5 60.5 Q50 62.5 55.5 60.5" stroke="#3a1a10" stroke-width="1.2" fill="none"/>`;
  if (L.gaunt) s += `<path d="M37 55 Q39 62 43 64 M63 55 Q61 62 57 64" stroke="${shade(sk, -0.35)}" stroke-width="1.6" fill="none" opacity=".6"/><path d="M38.5 51.5 Q43 53.5 47 51.5 M53 51.5 Q57 53.5 61.5 51.5" stroke="#3a1a2a" stroke-width="1.3" fill="none" opacity=".55"/>`;
  if (L.ink) s += `<path d="M57 55 Q60 53 62 56 Q60 58 58 57Z" fill="#1a1c2a" opacity=".75"/><circle cx="63.5" cy="58" r=".8" fill="#1a1c2a" opacity=".7"/>`;
  if (L.glasses) s += `<g fill="rgba(220,235,255,.18)" stroke="#c8a24a" stroke-width="1.3"><circle cx="43" cy="48" r="4.6"/><circle cx="57" cy="48" r="4.6"/></g><path d="M47.6 47.6 Q50 46.2 52.4 47.6 M38.4 47 L34 45.5 M61.6 47 L66 45.5" stroke="#c8a24a" stroke-width="1.1" fill="none"/>`;
  s += frontHair(L);
  if (L.helm === 'cowl') s += `<path d="M26 92 Q22 60 30 38 Q38 16 50 15 Q62 16 70 38 Q78 60 74 92 L66 92 Q68 66 66 50 Q64 30 50 28 Q36 30 34 50 Q32 66 34 92Z" fill="#14141c" stroke="#2a2c3a" stroke-width="1"/><path d="M34 50 Q36 32 50 29 Q64 32 66 50" stroke="#2a2c3a" stroke-width="1.6" fill="none"/>`;
  if (L.hat === 'bard') s += `<path d="M30 34 Q34 18 52 18 Q70 20 72 34 Q56 28 30 34Z" fill="#2a6a3a" stroke="#183018" stroke-width="1"/><path d="M30 34 Q50 29 72 34 L71 37 Q50 32 31 37Z" fill="#f0c040"/><path d="M62 22 Q78 4 84 10 Q76 14 66 26Z" fill="#c8302a"/><path d="M64 24 Q76 10 82 10" stroke="#7a1a14" stroke-width=".7" fill="none"/>`;
  if (L.bandana) s += `<path d="M32 38 Q50 30 68 38 L68 42 Q50 34 32 42Z" fill="${L.bandana}"/>`;
  if (L.crown) s += `<g filter="url(#gs${id})" opacity=".6"><path d="M34 26 L36 12 L43 20 L50 8 L57 20 L64 12 L66 26Z" fill="#ffd56b"/></g><path d="M34 26 L36 12 L43 20 L50 8 L57 20 L64 12 L66 26Z" fill="#e8b830" stroke="#8a6410" stroke-width="1"/><circle cx="50" cy="20" r="2" fill="#c8102e"/><circle cx="40" cy="22" r="1.4" fill="#2f8fd0"/><circle cx="60" cy="22" r="1.4" fill="#2f8fd0"/>`;
  return s;
}

function monsterArt(L, id) {
  const e = L.eye || '#fff';
  const eyePair = (x1, x2, y, r = 2.6) => `<g filter="url(#gl${id})"><circle cx="${x1}" cy="${y}" r="${r * 1.8}" fill="${e}" opacity=".8"/><circle cx="${x2}" cy="${y}" r="${r * 1.8}" fill="${e}" opacity=".8"/></g><circle cx="${x1}" cy="${y}" r="${r}" fill="${e}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${e}"/><circle cx="${x1}" cy="${y}" r="${r * 0.4}" fill="#fff"/><circle cx="${x2}" cy="${y}" r="${r * 0.4}" fill="#fff"/>`;
  switch (L.kind) {
    case 'wolf': {
      const f = L.fur, d = shade(f, -0.35), l = shade(f, 0.25);
      return `<path d="M22 22 L34 44 L28 46Z M78 22 L66 44 L72 46Z" fill="${d}"/><path d="M25 26 L32 42 M75 26 L68 42" stroke="#ff7a4a" stroke-width="1.4" opacity=".6"/>
<path d="M18 100 Q20 66 50 62 Q80 66 82 100Z" fill="${d}"/>
<path d="M26 50 Q28 30 50 30 Q72 30 74 50 Q72 64 62 70 L58 86 Q50 92 42 86 L38 70 Q28 64 26 50Z" fill="${f}"/>
<path d="M40 66 Q50 60 60 66 L58 84 Q50 90 42 84Z" fill="${l}"/>
<ellipse cx="50" cy="84" rx="5" ry="3.4" fill="#141418"/>
<path d="M43 89 l2 4 l2 -4 M53 89 l2 4 l2 -4" fill="#f4f4f4"/>
${eyePair(40, 60, 52, 2.6)}<path d="M34 46 L45 50 M66 46 L55 50" stroke="${d}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M30 60 l-6 2 M30 64 l-6 4 M70 60 l6 2 M70 64 l6 4" stroke="${l}" stroke-width=".8"/>`;
    }
    case 'golem': {
      const r = L.rock, d = shade(r, -0.4), l = shade(r, 0.2);
      return `<path d="M8 100 L14 70 L34 62 L66 62 L86 70 L92 100Z" fill="${d}"/>
<path d="M24 28 L40 18 L64 20 L78 32 L76 62 L60 72 L38 72 L24 62Z" fill="${r}"/>
<path d="M40 18 L46 34 L38 46 M64 20 L58 32 L66 44 M24 62 L36 56 M76 62 L64 58" stroke="${d}" stroke-width="1.4" fill="none"/>
<path d="M26 32 L40 22 L60 23" stroke="${l}" stroke-width="1.4" fill="none"/>
<path d="M32 44 L46 47 L44 51 L32 49Z M68 44 L54 47 L56 51 L68 49Z" fill="#0d1416"/>
${eyePair(39, 61, 48.5, 2.2)}
<path d="M40 62 L60 62" stroke="#0d1416" stroke-width="2.4"/><path d="M42 62 L58 62" stroke="${e}" stroke-width=".8" opacity=".7"/>
<circle cx="18" cy="76" r="6" fill="${r}"/><circle cx="82" cy="76" r="6" fill="${r}"/>${L.plates ? `<path d="M22 30 L40 20 L44 30 L26 40Z M78 30 L60 20 L56 30 L74 40Z M30 64 L50 70 L70 64 L66 76 L34 76Z" fill="${shade(r, 0.3)}" stroke="#2a2a30" stroke-width="1.2"/><circle cx="30" cy="31" r="1.3" fill="#2a2a30"/><circle cx="70" cy="31" r="1.3" fill="#2a2a30"/><circle cx="40" cy="72" r="1.3" fill="#2a2a30"/><circle cx="60" cy="72" r="1.3" fill="#2a2a30"/>` : ''}`;
    }
    case 'sprite': {
      const r = L.rock, d = shade(r, -0.4);
      return `<ellipse cx="50" cy="90" rx="20" ry="4" fill="#000" opacity=".35"/>
<path d="M30 46 L40 28 L60 26 L72 40 L70 64 L54 74 L36 70 L28 58Z" fill="${r}"/>
<path d="M40 28 L46 40 L36 52 M60 26 L58 38 L70 46" stroke="${d}" stroke-width="1.2" fill="none"/>
<circle cx="51" cy="50" r="10" fill="#101a1c"/>
<g filter="url(#gl${id})"><circle cx="51" cy="50" r="8" fill="${e}" opacity=".9"/></g><circle cx="51" cy="50" r="5" fill="${e}"/><circle cx="51" cy="50" r="2" fill="#fff"/>
<path d="M22 40 L26 36 L28 42Z M78 56 L84 52 L82 60Z M30 78 L34 74 L36 80Z" fill="${shade(r, 0.15)}"/>`;
    }
    case 'wyvern': {
      const c = L.scale, d = shade(c, -0.45), l = shade(c, 0.25);
      return `${L.horns ? `<path d="M30 34 Q14 22 12 6 Q22 18 36 26Z M70 34 Q86 22 88 6 Q78 18 64 26Z" fill="#e8dcc0"/>` : `<path d="M34 32 Q24 22 22 14 Q30 22 38 28Z M66 32 Q76 22 78 14 Q70 22 62 28Z" fill="#cdbfa0"/>`}
<path d="M14 100 Q18 70 50 66 Q82 70 86 100Z" fill="${d}"/>
<path d="M28 40 Q32 22 50 22 Q68 22 72 40 L70 60 Q66 76 58 84 L42 84 Q34 76 30 60Z" fill="${c}"/>
<path d="M36 64 Q50 70 64 64 L60 82 L40 82Z" fill="${l}"/>
<path d="M40 80 L42 86 L44 80 M48 81 L50 87 L52 81 M56 80 L58 86 L60 80" fill="#f4f0e4"/>
<path d="M30 46 L46 50 L44 54 L32 52Z M70 46 L54 50 L56 54 L68 52Z" fill="#1a0a06"/>
${eyePair(39, 61, 51.5, 2.2)}<path d="M39 49 v5 M61 49 v5" stroke="#1a0a06" stroke-width="1"/>
<path d="M44 30 Q50 26 56 30 M42 36 Q50 32 58 36" stroke="${d}" stroke-width="1" fill="none"/>
<circle cx="45" cy="70" r="1.2" fill="#1a0a06"/><circle cx="55" cy="70" r="1.2" fill="#1a0a06"/>`;
    }
    case 'hood': {
      const c = L.cloak, d = shade(c, -0.5), l = shade(c, 0.25);
      return `${L.halo ? `<ellipse cx="50" cy="18" rx="20" ry="5" fill="none" stroke="#fff0a0" stroke-width="2.2" filter="url(#gs${id})"/><ellipse cx="50" cy="18" rx="20" ry="5" fill="none" stroke="#fff8d0" stroke-width="1"/>` : ''}
<path d="M10 100 Q14 70 30 64 L70 64 Q86 70 90 100Z" fill="${c}"/>
<path d="M24 66 Q22 28 50 22 Q78 28 76 66 Q66 74 50 74 Q34 74 24 66Z" fill="${c}"/>${L.hat ? `<path d="M50 -4 Q58 8 66 26 L34 26 Q44 14 50 -4Z" fill="${d}"/><path d="M14 30 Q50 18 86 30 Q50 36 14 30Z" fill="${d}" stroke="${l}" stroke-width="1"/><path d="M36 25 Q50 21 64 25" stroke="${e}" stroke-width="1.6" fill="none" opacity=".8"/>` : ''}
<path d="M32 62 Q32 36 50 32 Q68 36 68 62 Q60 68 50 68 Q40 68 32 62Z" fill="${d}"/>
<path d="M24 66 Q22 28 50 22" stroke="${l}" stroke-width="1.2" fill="none"/>
${eyePair(42, 58, 50, 2.3)}
<path d="M50 74 L50 100" stroke="${d}" stroke-width="1.4"/>`;
    }
    case 'blob': {
      const g = L.goo, d = shade(g, -0.4), l = shade(g, 0.3);
      return `<ellipse cx="50" cy="92" rx="30" ry="5" fill="#000" opacity=".35"/>
<path d="M18 88 Q14 60 30 42 Q42 28 54 32 Q78 34 82 62 Q86 82 80 88 Q74 84 70 90 Q64 84 58 90 Q52 84 46 90 Q40 84 34 90 Q26 84 18 88Z" fill="${g}"/>
<path d="M30 46 Q40 34 52 36" stroke="${l}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
<circle cx="50" cy="58" r="11" fill="#fffbe6"/><circle cx="52" cy="59" r="6" fill="${e}"/><circle cx="52" cy="59" r="2.6" fill="#1a1006"/>
<circle cx="34" cy="66" r="3" fill="${d}"/><circle cx="68" cy="72" r="4" fill="${d}"/><circle cx="64" cy="44" r="2" fill="${l}"/>`;
    }
    case 'shard': {
      const g = L.glow;
      return `<g filter="url(#gl${id})"><path d="M50 14 L70 46 L50 88 L30 46Z" fill="${g}" opacity=".5"/></g>
<path d="M50 14 L70 46 L50 88 L30 46Z" fill="#dfeeff" stroke="#fff" stroke-width="1"/>
<path d="M50 14 L56 46 L50 88 L44 46Z" fill="#ffffff" opacity=".55"/><path d="M30 46 L70 46" stroke="#9fb8d8" stroke-width="1"/>
<path d="M22 30 L28 26 L26 34Z M76 66 L82 62 L80 70Z" fill="#dfeeff"/>
<circle cx="45" cy="44" r="2.2" fill="#2a4a7a"/><circle cx="55" cy="44" r="2.2" fill="#2a4a7a"/>`;
    }
    case 'wisp': {
      const g = L.glow;
      return `<g filter="url(#gl${id})"><circle cx="50" cy="54" r="26" fill="${g}" opacity=".55"/></g>
<path d="M50 20 Q66 38 64 56 Q62 72 50 74 Q38 72 36 56 Q34 38 50 20Z" fill="${g}" opacity=".85"/>
<path d="M50 30 Q60 44 58 58 Q56 68 50 69 Q44 68 42 58 Q40 44 50 30Z" fill="#fffef0"/>
<circle cx="45.5" cy="56" r="1.8" fill="#6a5a10"/><circle cx="54.5" cy="56" r="1.8" fill="#6a5a10"/>
<circle cx="24" cy="34" r="1.6" fill="#fffbe0"/><circle cx="78" cy="44" r="1.2" fill="#fffbe0"/><circle cx="72" cy="80" r="1.6" fill="#fffbe0"/><circle cx="28" cy="76" r="1" fill="#fffbe0"/>`;
    }
  }
  return '';
}

function portraitSVG(look, o = {}) {
  const id = ++ARTID;
  const inner = (look.kind && look.kind !== 'human') ? monsterArt(look, id) : heroFace(look, o, id);
  return svgWrap(inner, look.bg || '#333', id);
}
function unitPortrait(u) { return portraitSVG(lookOf(u), { glow: !!u.flags.glow || (u.statuses || []).some(x => x.key === 'unsealed' || x.key === 'vessel') }); }
function heroPortrait(id, o) { return portraitSVG(HEROES[id].look, o); }
function enemyPortrait(id) { const d = ENEMIES[id]; return portraitSVG(d.heroId ? HEROES[d.heroId].look : d.look); }

function foePortrait(x) { return isHeroFoe(x) ? heroPortrait(foeId(x)) : enemyPortrait(x); }
