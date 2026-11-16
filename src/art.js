// ---------- 絵(SVGで その場で描く。画像ファイルは使わない)
const ART = (() => {
  const eyes = (x, y, s = 1, mad = true) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="-7" cy="0" rx="5.5" ry="6.5" fill="#fff"/><ellipse cx="7" cy="0" rx="5.5" ry="6.5" fill="#fff"/>
    <circle cx="-6" cy="1.5" r="3" fill="#222"/><circle cx="8" cy="1.5" r="3" fill="#222"/>
    ${mad ? '<path d="M-13 -9 L-3 -5 M13 -9 L3 -5" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>' : ''}
    <path d="M-5 10 Q0 6 5 10" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  const dk = (c, k = 0.75) => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(v * k).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  const ball = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${dk(c)}" stroke-width="2.5"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#fff" opacity=".35"/>`;
  const shapes = {
    chain: c => [[18, 62], [34, 54], [50, 50], [66, 54], [82, 62]].map(([x, y]) => ball(x, y, 9.5, c)).join('') + eyes(50, 50, 0.55),
    diplo: c => `<ellipse cx="36" cy="50" rx="20" ry="15" fill="${c}" stroke="${dk(c)}" stroke-width="3"/><ellipse cx="64" cy="50" rx="20" ry="15" fill="${c}" stroke="${dk(c)}" stroke-width="3"/><ellipse cx="50" cy="50" rx="40" ry="26" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="5"/>` + eyes(50, 50, 0.8),
    grape: c => [[50, 30], [34, 40], [66, 40], [42, 56], [58, 56], [26, 58], [74, 58], [50, 72], [36, 72], [64, 72]].map(([x, y]) => ball(x, y, 10, c)).join('') + eyes(50, 52, 0.7),
    rod: c => `<g stroke="${dk(c)}" stroke-width="2" fill="none">${[[18, 40, 4, 30], [18, 60, 2, 72], [82, 42, 97, 30], [82, 58, 98, 72], [40, 32, 36, 14], [60, 68, 64, 88]].map(([a, b, x, y]) => `<path d="M${a} ${b} Q${(a + x) / 2 + 6} ${(b + y) / 2} ${x} ${y}"/>`).join('')}</g><rect x="14" y="32" width="72" height="36" rx="18" fill="${c}" stroke="${dk(c)}" stroke-width="3"/>` + eyes(50, 49, 0.8),
    rodthin: c => `<rect x="10" y="40" width="80" height="18" rx="9" fill="${c}" stroke="${dk(c)}" stroke-width="3" transform="rotate(-12 50 50)"/><rect x="18" y="62" width="64" height="12" rx="6" fill="${c}" opacity=".7" transform="rotate(8 50 68)"/>` + eyes(48, 46, 0.6),
    spiral: c => `<path d="M12 60 C24 30 36 30 44 50 S64 70 72 50 S84 30 90 40" stroke="${dk(c)}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M12 60 C24 30 36 30 44 50 S64 70 72 50 S84 30 90 40" stroke="${c}" stroke-width="15" fill="none" stroke-linecap="round"/>` + eyes(46, 50, 0.6),
    tiny: c => `<path d="M30 40 Q36 22 54 28 Q76 26 74 46 Q84 62 66 70 Q50 82 36 70 Q18 62 30 40Z" fill="${c}" stroke="${dk(c)}" stroke-width="3" stroke-dasharray="3 2"/>` + eyes(52, 50, 0.7),
    spore: c => `<rect x="12" y="36" width="68" height="30" rx="15" fill="${c}" stroke="${dk(c)}" stroke-width="3"/><ellipse cx="82" cy="51" rx="12" ry="16" fill="#f4ead5" stroke="${dk(c)}" stroke-width="3"/>` + eyes(44, 50, 0.7),
    spike: c => { let s = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x1 = 50 + Math.cos(a) * 30, y1 = 50 + Math.sin(a) * 30, x2 = 50 + Math.cos(a) * 43, y2 = 50 + Math.sin(a) * 43; s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dk(c)}" stroke-width="3"/><circle cx="${x2}" cy="${y2}" r="4" fill="${i % 2 ? '#ffe36e' : c}" stroke="${dk(c)}" stroke-width="1.5"/>`; } return s + `<circle cx="50" cy="50" r="31" fill="${c}" stroke="${dk(c)}" stroke-width="3"/>` + eyes(50, 50, 0.85); },
    ico: c => { let pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 - Math.PI / 2; pts.push([50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38]); } return pts.map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${50 + (x - 50) * 1.22}" y2="${50 + (y - 50) * 1.22}" stroke="${dk(c)}" stroke-width="3"/><circle cx="${50 + (x - 50) * 1.25}" cy="${50 + (y - 50) * 1.25}" r="4" fill="${c}" stroke="${dk(c)}"/>`).join('') + `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${c}" stroke="${dk(c)}" stroke-width="3"/><polygon points="${pts.map(([x, y]) => [50 + (x - 50) * .55, 50 + (y - 50) * .55].join(',')).join(' ')}" fill="#fff" opacity=".15"/>` + eyes(50, 50, 0.8); },
    mold: c => `<g stroke="${dk(c)}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M10 80 Q30 70 40 50 T60 20"/><path d="M40 50 Q55 55 70 40 T88 26"/><path d="M28 66 Q20 50 14 40"/><path d="M60 46 Q70 64 86 70"/></g>${[[60, 18], [90, 24], [12, 36], [88, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${dk(c)}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="2 3"/>`).join('')}<ellipse cx="44" cy="58" rx="18" ry="14" fill="${c}" stroke="${dk(c)}" stroke-width="3"/>` + eyes(44, 58, 0.55),
    yeast: c => `<ellipse cx="44" cy="54" rx="30" ry="24" fill="${c}" stroke="${dk(c, .6)}" stroke-width="3"/><ellipse cx="80" cy="34" rx="13" ry="11" fill="${c}" stroke="${dk(c, .6)}" stroke-width="3"/>` + eyes(44, 54, 0.8),
    worm: c => `<path d="M12 70 C26 40 40 86 54 56 S80 30 88 44" stroke="${dk(c)}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M12 70 C26 40 40 86 54 56 S80 30 88 44" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>` + eyes(84, 40, 0.42),
    larva: c => `<path d="M50 50 m-26 0 a26 26 0 1 0 52 0 a18 18 0 1 0 -36 0 a10 10 0 1 0 20 0" stroke="#c9b9a6" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M50 50 m-26 0 a26 26 0 1 0 52 0 a18 18 0 1 0 -36 0 a10 10 0 1 0 20 0" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>` + eyes(22, 46, 0.4),
    proto: c => `<circle cx="50" cy="50" r="40" fill="#e45555" stroke="#a83232" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="#f07b7b"/><circle cx="56" cy="44" r="14" fill="none" stroke="#7a3fbf" stroke-width="5"/><circle cx="64" cy="38" r="5" fill="#7a3fbf"/>` + eyes(44, 58, 0.6),
    proto2: c => `<g stroke="${dk(c)}" stroke-width="2.5" fill="none"><path d="M40 82 Q34 94 26 98"/><path d="M60 82 Q66 94 74 98"/><path d="M30 60 Q14 66 8 80"/><path d="M70 60 Q86 66 92 80"/></g><path d="M50 12 C80 14 82 50 70 72 Q50 90 30 72 C18 50 20 14 50 12Z" fill="${c}" stroke="${dk(c)}" stroke-width="3"/>` + eyes(50, 42, 0.75, false),
    mite: c => `<g stroke="${dk(c)}" stroke-width="4" stroke-linecap="round">${[-1, 1].map(s => [30, 42, 58, 70].map(y => `<line x1="${50 + s * 24}" y1="${y}" x2="${50 + s * 42}" y2="${y + (y < 50 ? -8 : 8)}"/>`).join('')).join('')}</g><ellipse cx="50" cy="52" rx="28" ry="26" fill="${c}" stroke="${dk(c)}" stroke-width="3"/>` + eyes(50, 50, 0.7),
  };
  function patho(p, known = 3, size = 100) {
    if (known < 3) {
      const c = known >= 1 ? CAT[p.cat].col : '#8a93a8';
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="pz"><circle cx="50" cy="52" r="34" fill="${c}" opacity=".35"/><circle cx="50" cy="52" r="34" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="6 5"/><text x="50" y="66" text-anchor="middle" font-size="42" font-weight="900" fill="#fff">?</text></svg>`;
    }
    const f = shapes[p.shape] || shapes.tiny;
    return `<svg viewBox="-4 -4 108 108" width="${size}" height="${size}" class="pz">${f(p.col)}</svg>`;
  }
  // 医者(見た目をえらべる)
  const LOOKS = [
    { id: 'boy', ja: '男の子', skin: '#f6d2b0', hair: '#3b2a1e', style: 'short', need: null },
    { id: 'girl', ja: '女の子', skin: '#f8d6bb', hair: '#5a3220', style: 'pony', need: null },
    { id: 'man', ja: 'お兄さん', skin: '#eac09a', hair: '#1f1f1f', style: 'side', need: 'tut' },
    { id: 'woman', ja: 'お姉さん', skin: '#f3cfb1', hair: '#7a4a2a', style: 'long', need: 'tut' },
    { id: 'hakase', ja: '博士', skin: '#f1c8a5', hair: '#e8e8e8', style: 'bald', need: 's1' },
    { id: 'robo', ja: 'ロボ先生', skin: '#9fb6c9', hair: '#4b6a85', style: 'robo', need: 's3' },
  ];
  function doctor(look, size = 110) {
    const L = LOOKS.find(l => l.id === look) || LOOKS[0];
    const hair = {
      short: `<path d="M28 34 Q30 14 50 14 Q70 14 72 34 Q64 24 50 26 Q36 24 28 34Z" fill="${L.hair}"/>`,
      pony: `<path d="M27 36 Q28 12 50 13 Q72 12 73 36 Q66 22 50 24 Q34 22 27 36Z" fill="${L.hair}"/><path d="M72 28 Q88 34 80 56" stroke="${L.hair}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="73" cy="27" r="4" fill="#ff7aa8"/>`,
      side: `<path d="M27 36 Q26 12 52 13 Q74 14 73 32 Q60 20 40 26 Q32 28 27 36Z" fill="${L.hair}"/>`,
      long: `<path d="M26 60 Q22 14 50 13 Q78 14 74 60 L68 58 Q70 26 50 25 Q30 26 32 58Z" fill="${L.hair}"/>`,
      bald: `<path d="M27 38 Q24 30 30 26 M73 38 Q76 30 70 26" stroke="${L.hair}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M36 50 Q50 60 64 50" stroke="${L.hair}" stroke-width="6" fill="none"/>`,
      robo: `<rect x="44" y="4" width="12" height="10" fill="${L.hair}"/><circle cx="50" cy="4" r="4" fill="#ff5d5d"/>`,
    }[L.style];
    const face = L.style === 'robo' ? `<rect x="28" y="16" width="44" height="40" rx="8" fill="${L.skin}" stroke="${L.hair}" stroke-width="3"/><rect x="34" y="28" width="12" height="8" rx="2" fill="#59f0ff"/><rect x="54" y="28" width="12" height="8" rx="2" fill="#59f0ff"/><rect x="40" y="44" width="20" height="4" rx="2" fill="${L.hair}"/>`
      : `<ellipse cx="50" cy="38" rx="22" ry="23" fill="${L.skin}"/><circle cx="42" cy="38" r="2.6" fill="#222"/><circle cx="58" cy="38" r="2.6" fill="#222"/><path d="M44 47 Q50 52 56 47" stroke="#a0522d" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="37" cy="45" r="3.5" fill="#ff9a9a" opacity=".5"/><circle cx="63" cy="45" r="3.5" fill="#ff9a9a" opacity=".5"/>`;
    return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" class="doc"><path d="M20 120 Q20 70 50 66 Q80 70 80 120Z" fill="#fff" stroke="#c9d3e0" stroke-width="2"/><path d="M50 66 L42 120 M50 66 L58 120" stroke="#c9d3e0" stroke-width="2"/><path d="M40 70 Q34 92 46 96 Q56 98 54 86" stroke="#334" stroke-width="3" fill="none"/><circle cx="54" cy="84" r="4" fill="#9aa"/><rect x="60" y="84" width="10" height="12" rx="2" fill="#7fb3ff"/>${face}${hair}</svg>`;
  }
  // 患者(ベッドに すわっている)
  function patient(look, hurt, size = 96) {
    const L = { kid: { skin: '#f8d6bb', hair: '#2b2b2b', pj: '#ffd166', small: true }, dad: { skin: '#e8b98f', hair: '#2a1d14', pj: '#6fb7ff' }, gpa: { skin: '#efc6a3', hair: '#d9d9d9', pj: '#a7e0c0' } }[look];
    const s = L.small ? 0.85 : 1;
    const mouth = hurt ? '<path d="M44 50 Q50 45 56 50" stroke="#a0522d" stroke-width="2" fill="none"/>' : '<path d="M44 48 Q50 53 56 48" stroke="#a0522d" stroke-width="2" fill="none"/>';
    return `<svg viewBox="0 0 120 100" width="${size * 1.2}" height="${size}" class="pat"><rect x="4" y="66" width="112" height="22" rx="6" fill="#dfe8f5"/><rect x="4" y="84" width="8" height="16" fill="#9aa8bd"/><rect x="108" y="84" width="8" height="16" fill="#9aa8bd"/><rect x="74" y="54" width="36" height="16" rx="6" fill="#fff"/>
      <g transform="translate(${L.small ? 8 : 0} ${L.small ? 8 : 0}) scale(${s})"><path d="M28 70 Q30 50 50 48 Q70 50 72 70Z" fill="${L.pj}"/><circle cx="50" cy="36" r="17" fill="${L.skin}"/><path d="M33 32 Q36 18 50 18 Q64 18 67 32 Q58 26 50 27 Q42 26 33 32Z" fill="${L.hair}"/>${look === 'gpa' ? '<circle cx="43" cy="36" r="5" fill="none" stroke="#555" stroke-width="1.5"/><circle cx="57" cy="36" r="5" fill="none" stroke="#555" stroke-width="1.5"/>' : ''}<circle cx="43" cy="36" r="2" fill="#222"/><circle cx="57" cy="36" r="2" fill="#222"/>${mouth}${hurt ? '<rect x="40" y="14" width="20" height="8" rx="3" fill="#bfe3ff"/>' : ''}</g>
      <path d="M2 70 Q60 60 118 70 L118 90 L2 90Z" fill="#b9d3f2"/></svg>`;
  }
  return { patho, doctor, patient, LOOKS };
})();
