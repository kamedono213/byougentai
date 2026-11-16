// ---------- めんえき隊(毎ターン 3まいから 1まい えらんで 使える。処方ポイント 0)
// 相手しだいで 強い細胞が かわる(細菌 → 好中球、ウイルス → キラーT細胞・NK細胞、寄生虫 → 好酸球)
const CELLS = [
  { id: 'neut', ja: '好中球', col: '#7fc8ff', desc: '細菌や カビに とびかかって 食べる。いちばん先に かけつける。', fx: (p, pow) => ({ dmg: Math.round((3 + pow) * (p.cat === 'bac' ? 1.6 : p.cat === 'fun' ? 1.3 : .5)) }) },
  { id: 'mac', ja: 'マクロファージ', col: '#ffb36b', desc: '何でも 食べる 大食いの 細胞。体の そうじも して 少し 回復。', fx: (p, pow) => ({ dmg: 2 + Math.floor(pow / 2), heal: 3 }) },
  { id: 'killt', ja: 'キラーT細胞', col: '#ff6b9a', desc: 'ウイルスに のっとられた 細胞を こわす。ウイルスに 強い。', fx: (p, pow) => ({ dmg: Math.round((3 + pow) * (p.cat === 'vir' ? 1.8 : .5)) }) },
  { id: 'nk', ja: 'NK細胞', col: '#c59bff', desc: 'ナチュラルキラー。ウイルスに 強いが、ときどき 見のがす。', fx: (p, pow) => Math.random() < .25 ? { dmg: 0, miss: 1 } : ({ dmg: Math.round((4 + pow) * (p.cat === 'vir' ? 1.7 : .7)) }) },
  { id: 'anti', ja: '抗体', col: '#ffd34d', desc: 'B細胞が 作る 目じるし。病原体に くっついて こうげきを 弱める(🛡️+5、どくそを 消す)。', fx: (p, pow, f) => ({ guard: 5 + Math.floor(pow / 2), detox: f.toxin }) },
  { id: 'eos', ja: '好酸球', col: '#ff8080', desc: '寄生虫と たたかう 細胞。虫には とても 強い。', fx: (p, pow) => ({ dmg: Math.round((3 + pow) * (p.cat === 'par' ? 2 : .5)) }) },
  { id: 'helper', ja: 'ヘルパーT細胞', col: '#7ad36b', desc: 'めんえき隊の 司令官。このバトルの間 めんえきを +1。', fx: () => ({ immUp: 1 }) },
];
const CL = Object.fromEntries(CELLS.map(c => [c.id, c]));
ART.cell = (id, size = 40) => {
  const c = CL[id], col = c.col;
  const eyes = `<circle cx="42" cy="50" r="5" fill="#fff"/><circle cx="58" cy="50" r="5" fill="#fff"/><circle cx="43" cy="51" r="2.5" fill="#222"/><circle cx="59" cy="51" r="2.5" fill="#222"/><path d="M44 60 q6 5 12 0" stroke="#222" stroke-width="2" fill="none"/>`;
  const B = {
    neut: `<circle cx="50" cy="52" r="36" fill="${col}" stroke="#3a7fb0" stroke-width="3"/><path d="M30 34 q8 -8 14 0 q6 -8 14 0 q6 -8 12 2" stroke="#5a4aa0" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    mac: `<path d="M50 14 q30 2 36 26 q10 30 -12 46 q-24 16 -48 -4 q-20 -20 -4 -48 q10 -20 28 -20z" fill="${col}" stroke="#c4702a" stroke-width="3"/><circle cx="70" cy="34" r="6" fill="#c4702a" opacity=".5"/>`,
    killt: `<circle cx="50" cy="52" r="34" fill="${col}" stroke="#c43a6a" stroke-width="3"/>${[0, 60, 120, 180, 240, 300].map(a => `<line x1="${50 + Math.cos(a * Math.PI / 180) * 34}" y1="${52 + Math.sin(a * Math.PI / 180) * 34}" x2="${50 + Math.cos(a * Math.PI / 180) * 44}" y2="${52 + Math.sin(a * Math.PI / 180) * 44}" stroke="#c43a6a" stroke-width="4"/>`).join('')}<path d="M34 34 l32 0" stroke="#222" stroke-width="5"/>`,
    nk: `<circle cx="50" cy="52" r="34" fill="${col}" stroke="#7a4abf" stroke-width="3"/>${[[30, 72], [70, 70], [26, 44], [74, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#7a4abf"/>`).join('')}`,
    anti: `<path d="M50 90 v-34 l-24 -32 M50 56 l24 -32" stroke="#c48a00" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M50 90 v-34 l-24 -32 M50 56 l24 -32" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    eos: `<circle cx="50" cy="52" r="34" fill="#ffe0e0" stroke="#c44a4a" stroke-width="3"/>${[[34, 34], [62, 30], [30, 64], [70, 66], [50, 76], [72, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${col}"/>`).join('')}`,
    helper: `<circle cx="50" cy="56" r="32" fill="${col}" stroke="#3a8a3a" stroke-width="3"/><path d="M28 30 l22 -14 l22 14z" fill="#3a5a8a"/><rect x="40" y="10" width="20" height="8" fill="#ffd34d"/>`,
  };
  const ey = id === 'anti' ? '' : eyes;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="cz">${B[id]}${ey}</svg>`;
};
// ターンの はじめに 3まい くばる(相手に 強い 細胞が 1まいは 入りやすい)
function dealCells() {
  const f = B.foes.find(x => x.hp > 0); const p = f ? P[f.pid] : null;
  const good = p ? { bac: 'neut', vir: 'killt', fun: 'neut', par: 'eos' }[p.cat] : null;
  const pool = shuffle(CELLS.map(c => c.id));
  let hand = pool.slice(0, 3);
  if (good && !hand.includes(good) && Math.random() < 0.6) hand[rnd(3)] = good;
  B.cells = hand; B.cellUsed = false;
}
async function useCell(id) {
  if (!B || B.busy || B.cellUsed) return;
  if (B.cellExtra) { B.cellExtra = 0; setTimeout(() => { if (B) { B.cellUsed = false; renderBattle(); } }, 50); }
  const R = S.run; let ti = B.tgt; if (!B.foes[ti] || B.foes[ti].hp <= 0) ti = B.foes.findIndex(f => f.hp > 0);
  const f = B.foes[ti], p = P[f.pid];
  const pow = clamp(B.immUp - B.immDown + Math.round(R.hp / R.max * 2), 0, 6);
  const r = CL[id].fx(p, pow, f); B.cellUsed = true; st('cell');
  if (r.immUp) { B.immUp = Math.min(4, B.immUp + r.immUp); SFX.play('guard'); floatTxt('🛡️めんえき UP', null, 'heal'); }
  if (r.guard) { B.guard += r.guard; SFX.play('guard'); floatTxt('🛡️+' + r.guard, null, 'heal'); }
  if (id === 'anti') { f.mark = 2; if (f.sp === 'tox') f.spDetox = true; floatTxt('🎯 目じるし(薬が 効きやすい)', ti, 'good'); }
  if (id === 'neut' && f.sp === 'hide') { f.spBroken = true; floatTxt('膜を こわした!', ti, 'good'); }
  if (r.detox) { f.toxin = false; floatTxt('どくそを 消した!', ti, 'good'); }
  if (r.heal) { R.hp = Math.min(R.max, R.hp + r.heal); floatTxt('❤️+' + r.heal, null, 'heal'); }
  if (r.miss) { SFX.play('hitSoft'); renderBattle(); floatTxt('見のがした…', ti, 'bad'); return; }
  if (r.dmg) {
    let dmg = r.dmg; const co = f.dots.length > 0; if (co) dmg = Math.round(dmg * 1.5);
    const blk = Math.min(f.block, dmg); f.block -= blk; dmg -= blk;
    f.hp = Math.max(0, f.hp - dmg); SFX.play(r.dmg >= 8 ? 'best' : 'hit'); renderBattle(); await fx('hit', ti); floatTxt(`${CL[id].ja} -${dmg}`, ti);
    if (co) { banner('🤝 薬と めんえきの 協力 コンボ!', 'best'); st('combo'); } else if (r.dmg >= 8) banner(`💪 ${CL[id].ja} 大かつやく!`, 'best');
    if (f.hp <= 0) await killFoe(ti);
  }
  afterAction();
}
