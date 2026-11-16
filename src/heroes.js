// ---------- 薬の キャラクター(ヒーロー)。同じ系統は 同じ 体の形と エンブレム → 仲間だと わかる
// 色は ジャンルの色、胸に 名前の 1文字目、ひとりずつ ちがう 飾り
const FAM = {
  pen: { ja: 'ペニシリン隊', ids: ['pen', 'amox', 'abpc', 'tazpip'], shape: 'round', emb: 'ring', acc: '#ffd34d' },
  ceph: { ja: 'セフェム隊', ids: ['cez', 'ctrx', 'cfpm'], shape: 'shield', emb: 'num', acc: '#9fe0ff' },
  carba: { ja: 'カルバペネム', ids: ['mepm'], shape: 'knight', emb: 'crown', acc: '#ffd700' },
  macro: { ja: 'マクロライド隊', ids: ['azm', 'cam', 'fdx'], shape: 'donut', emb: 'none', acc: '#ffb3d9' },
  tetra: { ja: 'テトラ兄弟', ids: ['mino', 'doxy'], shape: 'quad', emb: 'none', acc: '#c7f27a' },
  quino: { ja: 'キノロン', ids: ['lvfx'], shape: 'bolt', emb: 'bolt', acc: '#fff06a' },
  gp: { ja: 'MRSAガード隊', ids: ['vcm', 'lzd', 'dap'], shape: 'tower', emb: 'shield', acc: '#c0c8d8' },
  nitro: { ja: 'ニトロ', ids: ['mnz'], shape: 'round', emb: 'gas', acc: '#9be7c4' },
  last: { ja: 'とっておき', ids: ['cl', 'gm'], shape: 'star', emb: 'warn', acc: '#ff7b7b' },
  sulfa: { ja: 'ST', ids: ['st'], shape: 'twin', emb: 'none', acc: '#ffe08a' },
  tb: { ja: '結核バスターズ', ids: ['inh', 'rfp', 'pza', 'eb'], shape: 'round', emb: 'band', acc: '#ffffff' },
  fluv: { ja: 'インフル隊', ids: ['osel', 'zana', 'bxm'], shape: 'round', emb: 'antenna', acc: '#ffd1e3' },
  covv: { ja: 'コロナ隊', ids: ['nmv', 'ens', 'rdv'], shape: 'shield', emb: 'crownx', acc: '#ffc2b8' },
  herp: { ja: 'ヘルペス隊', ids: ['acv', 'vacv', 'gcv'], shape: 'hood', emb: 'none', acc: '#f3c7ff' },
  hep: { ja: '肝炎隊', ids: ['etv', 'sofvel'], shape: 'heart', emb: 'none', acc: '#ffe39a' },
  azole: { ja: 'アゾール隊', ids: ['flcz', 'vrcz'], shape: 'wizard', emb: 'none', acc: '#e3d0ff' },
  fun2: { ja: 'カビたいじ', ids: ['mcfg', 'amph', 'tbf', 'fc'], shape: 'round', emb: 'leaf', acc: '#e3d0ff' },
  worm: { ja: '虫くだし隊', ids: ['pyr', 'mbz', 'abz'], shape: 'round', emb: 'net', acc: '#d8ffcf' },
  mite: { ja: 'ダニたいじ', ids: ['ivm', 'phen'], shape: 'shield', emb: 'medal', acc: '#d8ffcf' },
  mal: { ja: 'マラリアたいじ', ids: ['al', 'apg'], shape: 'round', emb: 'netm', acc: '#ffd0d0' },
};
const FAM_OF = {}; for (const [k, f] of Object.entries(FAM)) f.ids.forEach((id, i) => { FAM_OF[id] = { k, f, i }; });
const famOf = id => FAM_OF[id];
// ささえる薬は ひとりずつの キャラ
const SUPCHAR = { ors: 'drop', apap: 'thermo', drip: 'bag', loxo: 'nsaid', dclf: 'nsaid', pred: 'muscle', bif: 'friend', o2: 'cloud', nutri: 'onigiri', sleep: 'pillow', vpz: 'stomach', endo: 'robot' };
ART.hero = (d, size = 48) => {
  const col = d.cat === 'sup' ? '#ff8fa3' : CAT[{ abx: 'bac', vir: 'vir', fun: 'fun', par: 'par' }[d.cat]].col;
  const dk = (c, k = .7) => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(v * k).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  const fm0 = famOf(d.id), idx = fm0 ? fm0.i : 0;
  const base = col;
  const col2 = d.cat === 'sup' ? base : [base, dk(base, .82), dk(base, 1.12 > 1 ? .92 : .9), dk(base, .7)][idx % 4];
  const s = dk(col2);
  const fm = fm0; const acc = fm ? fm.f.acc : '#fff';
  // 顔: ヒーローらしい きりっとした目と えがお
  const face = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="-7" cy="0" rx="5" ry="6" fill="#fff"/><ellipse cx="7" cy="0" rx="5" ry="6" fill="#fff"/><circle cx="-6" cy="1" r="2.8" fill="#222"/><circle cx="8" cy="1" r="2.8" fill="#222"/><circle cx="-5" cy="-.5" r="1" fill="#fff"/><circle cx="9" cy="-.5" r="1" fill="#fff"/><path d="M-12 -8 L-3 -6 M12 -8 L3 -6" stroke="#222" stroke-width="2" stroke-linecap="round"/><path d="M-5 8 Q0 13 5 8" stroke="#222" stroke-width="2" fill="#fff" stroke-linecap="round"/></g>`;
  const letter = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${acc}" stroke="${s}" stroke-width="2"/><text x="${x}" y="${y + r * .38}" font-size="${r * 1.1}" text-anchor="middle" font-weight="900" fill="${s}">${d.ja[0]}</text>`;
  // ひとりずつの 飾り(同じ系統でも 番号で かわる)
  const ACC = [
    () => `<path d="M24 46 q-14 24 -6 46 l14 -10 l8 12 l8 -12 l14 10 q8 -22 -6 -46z" fill="${acc}" opacity=".9" stroke="${s}" stroke-width="2"/>`, // マント
    () => `<rect x="26" y="30" width="48" height="10" rx="5" fill="#222" opacity=".85"/>`, // マスク
    () => `<path d="M28 22 q22 -22 44 0 v6 h-44z" fill="${acc}" stroke="${s}" stroke-width="2"/><rect x="46" y="8" width="8" height="10" rx="3" fill="${acc}" stroke="${s}" stroke-width="2"/>`, // ヘルメット
    () => `<path d="M30 20 l-8 -14 l14 8z M70 20 l8 -14 l-14 8z" fill="${acc}" stroke="${s}" stroke-width="2"/>`, // つの
  ];
  let body = '';
  const sh = fm ? fm.f.shape : null;
  if (d.cat === 'sup') {
    const t = SUPCHAR[d.id] || 'drop';
    const B = {
      drop: `<path d="M50 6 Q80 46 74 66 Q66 92 50 92 Q34 92 26 66 Q20 46 50 6Z" fill="#7fd0ff" stroke="#3a8fc4" stroke-width="3"/>`,
      thermo: `<rect x="38" y="8" width="24" height="64" rx="12" fill="#fff" stroke="#c43a5a" stroke-width="3"/><circle cx="50" cy="78" r="16" fill="#ff6b6b" stroke="#c43a5a" stroke-width="3"/><rect x="46" y="30" width="8" height="44" fill="#ff6b6b"/>`,
      bag: `<path d="M26 14 h48 v56 q0 18 -24 18 q-24 0 -24 -18z" fill="#e8f6ff" stroke="#4aa3ff" stroke-width="3"/><path d="M28 50 h44 v20 q0 15 -22 15 q-22 0 -22 -15z" fill="#9fd8ff"/>`,
      nsaid: `<path d="M50 8 L90 82 H10Z" fill="#ffd34d" stroke="#c48a00" stroke-width="3"/><text x="50" y="76" font-size="18" text-anchor="middle" font-weight="900" fill="#c43a00">!</text>`,
      muscle: `<circle cx="50" cy="56" r="34" fill="#ff9f68" stroke="#c4602a" stroke-width="3"/><path d="M14 56 q-8 -20 6 -26 q10 -2 10 10z M86 56 q8 -20 -6 -26 q-10 -2 -10 10z" fill="#ff9f68" stroke="#c4602a" stroke-width="3"/>`,
      friend: `<rect x="20" y="30" width="60" height="40" rx="20" fill="#9be7a0" stroke="#3aa060" stroke-width="3"/><path d="M50 30 v-14 M40 16 h20" stroke="#3aa060" stroke-width="3"/>`,
      cloud: `<path d="M24 70 q-16 0 -14 -16 q2 -14 18 -12 q2 -20 22 -20 q18 0 22 18 q16 -2 18 14 q2 16 -16 16z" fill="#eaf6ff" stroke="#7fb3d6" stroke-width="3"/>`,
      onigiri: `<path d="M50 10 Q88 70 80 82 Q50 92 20 82 Q12 70 50 10Z" fill="#fff" stroke="#bbb" stroke-width="3"/><rect x="30" y="66" width="40" height="22" rx="4" fill="#2f4a2f"/>`,
      pillow: `<rect x="14" y="30" width="72" height="44" rx="20" fill="#d8e4ff" stroke="#7f8fd6" stroke-width="3"/><text x="78" y="26" font-size="14" fill="#7fc8ff" font-weight="900">Zz</text>`,
      stomach: `<path d="M30 20 q30 -10 40 14 q10 28 -6 44 q-20 18 -40 -2 q-10 -14 6 -18 q14 -4 6 -20z" fill="#ffb3c7" stroke="#c45a7a" stroke-width="3"/>`,
      robot: `<rect x="22" y="24" width="56" height="50" rx="10" fill="#c0c8d8" stroke="#5a6478" stroke-width="3"/><circle cx="50" cy="12" r="6" fill="#ff6b6b"/><path d="M50 18 v6" stroke="#5a6478" stroke-width="3"/>`,
    };
    body = (B[t] || B.drop) + face(50, t === 'thermo' ? 40 : t === 'onigiri' ? 54 : 50, t === 'thermo' ? .7 : .9);
    return `<svg viewBox="-4 -4 108 108" width="${size}" height="${size}" class="hz">${body}</svg>`;
  }
  const shapes = {
    round: () => `<circle cx="50" cy="56" r="34" fill="${col2}" stroke="${s}" stroke-width="3"/>`,
    shield: () => `<path d="M50 14 L84 26 Q84 70 50 92 Q16 70 16 26Z" fill="${col2}" stroke="${s}" stroke-width="3"/>`,
    knight: () => `<path d="M20 30 h60 v40 q0 22 -30 22 q-30 0 -30 -22z" fill="${col2}" stroke="${s}" stroke-width="3"/><path d="M24 36 h52" stroke="${s}" stroke-width="2"/>`,
    donut: () => `<circle cx="50" cy="54" r="36" fill="${col2}" stroke="${s}" stroke-width="3"/><circle cx="50" cy="54" r="11" fill="#fff" stroke="${s}" stroke-width="3"/>`,
    quad: () => [[34, 40], [66, 40], [34, 70], [66, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18" fill="${col2}" stroke="${s}" stroke-width="3"/>`).join(''),
    bolt: () => `<path d="M58 6 L22 56 H46 L36 94 L80 40 H56Z" fill="${col2}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>`,
    tower: () => `<rect x="24" y="16" width="52" height="76" rx="10" fill="${col2}" stroke="${s}" stroke-width="3"/><path d="M24 16 h8 v-8 h8 v8 h8 v-8 h8 v8 h8 v-8 h8 v8" fill="${col2}" stroke="${s}" stroke-width="3"/>`,
    star: () => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 20 : 42; p += `${50 + Math.cos(a) * r},${56 + Math.sin(a) * r} `; } return `<polygon points="${p}" fill="${col2}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>`; },
    twin: () => `<circle cx="34" cy="58" r="24" fill="${col2}" stroke="${s}" stroke-width="3"/><circle cx="66" cy="58" r="24" fill="${acc}" stroke="${s}" stroke-width="3"/>`,
    hood: () => `<path d="M50 8 Q88 20 84 64 Q80 92 50 92 Q20 92 16 64 Q12 20 50 8Z" fill="${col2}" stroke="${s}" stroke-width="3"/><ellipse cx="50" cy="54" rx="24" ry="22" fill="#fff6e8"/>`,
    heart: () => `<path d="M50 90 Q14 64 16 40 Q18 18 38 20 Q48 22 50 32 Q52 22 62 20 Q82 18 84 40 Q86 64 50 90Z" fill="${col2}" stroke="${s}" stroke-width="3"/>`,
    wizard: () => `<circle cx="50" cy="62" r="30" fill="${col2}" stroke="${s}" stroke-width="3"/><path d="M24 40 L50 2 L76 40Z" fill="${acc}" stroke="${s}" stroke-width="3"/><circle cx="50" cy="20" r="4" fill="#ffd34d"/>`,
  };
  body = (shapes[sh] || shapes.round)();
  const eyeY = { quad: 40, donut: 34, bolt: 44, tower: 40, star: 50, twin: 52, hood: 50, heart: 46, wizard: 58, knight: 50, shield: 44 }[sh] || 50;
  const embl = {
    ring: `<rect x="40" y="62" width="20" height="20" fill="${acc}" stroke="${s}" stroke-width="3"/><path d="M50 62 v20" stroke="${s}" stroke-width="2"/>`, // β-ラクタム環(4つの角)
    num: `<text x="50" y="80" font-size="18" text-anchor="middle" font-weight="900" fill="${acc}" stroke="${s}" stroke-width="1">${{ cez: 1, ctrx: 3, cfpm: 4 }[d.id] || ''}</text>`,
    crown: `<path d="M30 30 l6 -18 l8 12 l6 -16 l6 16 l8 -12 l6 18z" fill="#ffd700" stroke="#b08a00" stroke-width="2"/>`,
    bolt: '', shield: `<path d="M50 62 l12 4 q0 14 -12 20 q-12 -6 -12 -20z" fill="${acc}" stroke="${s}" stroke-width="2"/>`,
    gas: `<rect x="34" y="60" width="32" height="16" rx="8" fill="#555"/><circle cx="42" cy="68" r="4" fill="#9be7c4"/><circle cx="58" cy="68" r="4" fill="#9be7c4"/>`,
    warn: `<text x="50" y="84" font-size="16" text-anchor="middle" font-weight="900" fill="#fff">!</text>`,
    band: `<rect x="17" y="34" width="66" height="9" fill="${['#ffffff', '#ff8a3d', '#ffd34d', '#7fc8ff'][idx]}" stroke="${s}" stroke-width="2"/><path d="M83 38 l10 -4 l-2 10z" fill="${['#ffffff', '#ff8a3d', '#ffd34d', '#7fc8ff'][idx]}"/>`,
    antenna: `<path d="M38 24 l-6 -16 M62 24 l6 -16" stroke="${s}" stroke-width="3"/><circle cx="32" cy="8" r="5" fill="${acc}"/><circle cx="68" cy="8" r="5" fill="${acc}"/>`,
    crownx: `<path d="M34 14 l32 0" stroke="${s}" stroke-width="4"/><path d="M40 6 l20 16 M60 6 l-20 16" stroke="#ff4d4d" stroke-width="4"/>`,
    leaf: `<path d="M50 22 q14 -18 26 -8 q-6 16 -26 8z" fill="#7ad36b" stroke="#3a8a3a" stroke-width="2"/>`,
    net: `<path d="M30 74 h40 M34 66 l-4 16 M50 66 v16 M66 66 l4 16" stroke="${s}" stroke-width="2"/>`,
    medal: `<circle cx="50" cy="74" r="8" fill="#ffd700" stroke="#b08a00" stroke-width="2"/><path d="M44 62 l6 8 l6 -8" stroke="#ff4d6d" stroke-width="3" fill="none"/>`,
    netm: `<path d="M24 22 q26 -16 52 0" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="3 3"/>`,
    none: '',
  }[fm ? fm.f.emb : 'none'] || '';
  const accessory = (fm && fm.f.ids.length > 1) || sh === 'round' ? ACC[idx % ACC.length]() : '';
  const back = accessory.includes('M24 46') ? accessory : '';
  const front = back ? '' : accessory;
  const chest = letter(78, 82, 12);
  return `<svg viewBox="-4 -4 108 108" width="${size}" height="${size}" class="hz">${back}${body}${embl}${front}${face(50, eyeY, sh === 'quad' ? .8 : .9)}${chest}</svg>`;
};
