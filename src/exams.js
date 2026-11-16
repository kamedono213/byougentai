// ---------- 実際の 診療で する 検査(結果は 画面の 真ん中に 出して、OKまで 残す)
// 結果の 中身は 教科書的な 所見に そろえている(SOURCES.md)
TESTS.splice(0, TESTS.length,
  { id: 'ask', em: '🗣️', ja: '問診', cost: 1, desc: 'いつ・どこで・だれから? 話を 聞く' },
  { id: 'exam', em: '🩺', ja: '診察', cost: 1, desc: '見る・さわる・聴診器で 音を 聞く' },
  { id: 'blood', em: '🩸', ja: '血液検査', cost: 1, desc: '白血球・CRP など(細菌? ウイルス? カビ?)' },
  { id: 'xray', em: '🩻', ja: '胸の レントゲン', cost: 1, desc: '肺に 影が あるか 見る' },
  { id: 'urine', em: '🧻', ja: '尿検査', cost: 1, desc: 'おしっこに 白血球や 細菌が いるか' },
  { id: 'micro', em: '🔍', ja: '顕微鏡検査', cost: 1, desc: '便・血液・ひふを 見て、虫・原虫・カビを さがす' },
  { id: 'gram', em: '🔬', ja: 'グラム染色', cost: 1, desc: 'たん・うみの 細菌の 色と 形を 見る' },
  { id: 'rapid', em: '🧪', ja: '迅速検査', cost: 1, desc: '決まった 相手なら 15分で 名前が わかる' },
  { id: 'csf', em: '💉', ja: '髄液検査', cost: 2, desc: '腰から 針で 髄液を とる(髄膜炎の うたがい)' },
  { id: 'culture', em: '🧫', ja: '培養・PCR', cost: 2, desc: 'じっくり 調べて 名前と 効く薬まで' },
);
// 診察で わかること(身体所見)
const PHYS = {
  strep: 'のどが 真っ赤で、白い うみが ついている。首の リンパ節が はれている。せきは ない。', pneumo: '聴診で 片側の 肺に ブツブツ という 音(または 鼓膜が 赤く はれている)。',
  staph: 'ひふが 赤く はれて 熱を もち、うみが たまっている。', mrsa: '傷が 赤く はれて うみが 出ている。', ecoli: '背中(腰の 上あたり)を たたくと ひびいて いたい。', esbl: '背中(腰の 上あたり)を たたくと いたい。',
  myco: '聴診では 音が あまり しないのに、せきが はげしい。', campy: 'おなかを 押すと いたい。', pseudo: '聴診で ブツブツ音。人工呼吸器が ついている。', mdrp: '聴診で ブツブツ音。熱が 下がらない。',
  cdiff: 'おなかが はって、げりが 何回も 出る。', tb: '聴診で 肺の 上の方に 音。やせている。', pylori: 'みぞおちを 押すと いたい。',
  flu: '高い熱。のどが 少し 赤い。体が だるそう。', flu_boss: '高い熱。体が だるそう。', adeno: 'のどが 赤く、目が 赤い(結膜炎)。', noro: 'おなかの 音が 多い。少し 脱水ぎみ。', rsv: 'ゼーゼー という 音(喘鳴)。呼吸が 速い。',
  covid: 'のどが 赤い。においが わかりにくいと 言う。', vzv: '水ぶくれが 体の 片側に 帯のように(子どもは 全身に ぽつぽつ)。', hsv: '口の まわりに 小さな 水ぶくれが かたまっている。',
  tinea: '足の 指の間が 白く ふやけて、皮が むけている。', candida: '口の中に 白い こけ(ぬぐうと とれる)。', asper: '聴診で ブツブツ音。熱が 下がらない。',
  pinworm: 'おしりの まわりが 赤く、かきこわしている。', ascaris: 'おなかが いたい。', anisakis: 'みぞおちが はげしく いたい。', malaria: '熱。ひ臓が はれていて、白目が 少し 黄色い。',
  giardia: 'おなかが はって、においの強い げり。', scabies: '指の間や 手首に 線のような あと(疥癬トンネル)。', mening: '首を 前に 曲げられない(項部硬直)。ひふに 小さな 出血の 点。',
  tetanus: '口が 開きにくく、体の 筋肉が こわばっている。', legion: '聴診で ブツブツ音。少し ぼんやりしている。', pertussis: 'せきこむ 発作の あと、ヒューと 息を 吸う。',
  listeria: '熱。首が かたい。', entero: '背中を たたくと いたい。おしっこの 管が 入っている。', vre: '熱。管が 入っている。', cre: '熱。管が 入っている。',
  typhoid: '熱が 高いのに、脈が ゆっくり(比較的徐脈)。おなかに うすい 赤い ぽつぽつ。', cholera: 'ひふを つまむと なかなか 戻らない(ひどい 脱水)。',
  scrub: '黒い かさぶた(さされた あと)と、全身の ほっしん。', lyme: 'さされた 所から 赤い輪のように 広がる ほっしん。', cmv: '目の奥(網膜)に 出血。',
  hbv: '白目が 少し 黄色い。または 症状が ほとんど ない。', hcv: '症状は ほとんど ない。', measles: '口の中に 白い 点(コプリック斑)。全身の ほっしん。', dengue: 'ほっしん。腕を しばると 小さな 出血点が 出る。',
  pcp: '呼吸が 速く、少し 動くと 息が くるしい。', crypto: '頭痛。首が 少し かたい。', echino: '右上の おなかに しこり(肝臓が はれている)。', amoeba: '右上の おなかが いたい・または 血の まじる げり。',
};
// 胸の レントゲンの かげの パターン
const XRAY = { pneumo: 'lobar', legion: 'lobar', pseudo: 'lobar', mdrp: 'lobar', myco: 'patchy', covid: 'ggo', pcp: 'ggo', rsv: 'hyper', tb: 'cavity', asper: 'nodule', flu_boss: 'none' };
const XRAY_JA = { lobar: '片方の 肺に、白く べったりした 影(肺炎)。', patchy: 'まだらに うすい 影(ばらばらの 肺炎)。', ggo: '両方の 肺に、すりガラスのような うすい 影。', hyper: '肺が ふくらみすぎ(空気が たまっている)。', cavity: '肺の 上の方に、穴の あいた 影(空洞)。', nodule: '丸い かたまりの 影。', none: '肺は きれい。' };
function xraySVG(pat, size = 200) {
  const lung = (x, flip) => `<path d="M${x} 40 q${flip * 30} -18 ${flip * 46} 18 q${flip * 10} 50 ${flip * 4} 96 q${flip * -20} 12 ${flip * -46} 0 q-${flip * 6} -60 0 -114z" fill="#1d1d24"/>`;
  const shade = { lobar: '<ellipse cx="60" cy="118" rx="26" ry="22" fill="#e8e8e8" opacity=".75"/>', patchy: [[56, 90], [70, 118], [138, 104], [130, 128], [60, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#ddd" opacity=".5"/>`).join(''), ggo: '<ellipse cx="62" cy="100" rx="30" ry="44" fill="#ccc" opacity=".35"/><ellipse cx="138" cy="100" rx="30" ry="44" fill="#ccc" opacity=".35"/>', hyper: '<path d="M30 152 h140" stroke="#bbb" stroke-width="2" opacity=".5"/>', cavity: '<circle cx="64" cy="62" r="15" fill="#ddd" opacity=".7"/><circle cx="64" cy="62" r="8" fill="#1d1d24"/>', nodule: '<circle cx="132" cy="96" r="12" fill="#e0e0e0" opacity=".8"/>', none: '' }[pat] || '';
  const ribs = Array.from({ length: 6 }, (_, i) => `<path d="M100 ${46 + i * 18} q-46 -6 -66 ${10 + i * 2} M100 ${46 + i * 18} q46 -6 66 ${10 + i * 2}" stroke="#666" stroke-width="2.5" fill="none" opacity=".55"/>`).join('');
  return `<svg viewBox="0 0 200 180" width="${size}" height="${size * 0.9}" class="xray"><rect width="200" height="180" rx="10" fill="#050507"/>${lung(52, 1)}${lung(148, -1)}${ribs}<path d="M92 20 h16 v130 h-16z" fill="#888" opacity=".6"/><path d="M90 110 q30 -10 34 30 q-24 16 -40 0z" fill="#aaa" opacity=".55"/>${shade}<text x="10" y="20" fill="#888" font-size="12">R</text></svg>`;
}
// 検査の 結果を つくる → { lines: [..], k: わかった度合い, img, name(名前まで わかったか) }
function examResult(kind, p) {
  const C = CLINIC[p.id] || {}, pid = p.base || p.id, r = { lines: [], k: 0 };
  const worm = ['ascaris', 'echino', 'anisakis'].includes(pid);
  if (kind === 'ask') r.lines.push(C.hist || '特に 思いあたることは ない。');
  if (kind === 'exam') r.lines.push(PHYS[pid] || '特に 目立つ 所見は ない。');
  if (kind === 'blood') {
    if (pid === 'hbv') { r.lines.push('肝臓の 数値(AST・ALT)が 高い。', 'HBs抗原: 陽性 → B型肝炎ウイルス!'); r.k = 3; }
    else if (pid === 'hcv') { r.lines.push('肝臓の 数値が 少し 高い。', 'HCV抗体: 陽性 → C型肝炎ウイルス!'); r.k = 3; }
    else if (pid === 'cmv') { r.lines.push('CMV抗原: 陽性 → サイトメガロウイルス!'); r.k = 3; }
    else if (pid === 'crypto') { r.lines.push('β-Dグルカン: ふつう(この カビは 上がりにくい)', 'クリプトコックス抗原: 陽性!'); r.k = 3; }
    else if (p.cat === 'bac') {
      if (pid === 'myco') r.lines.push('白血球: ふつう ・ CRP: 少し 高い(細菌なのに おだやか)');
      else if (pid === 'typhoid') r.lines.push('白血球: 少なめ ・ CRP: 高い');
      else r.lines.push('白血球: 多い ⬆️ ・ CRP: 高い ⬆️(細菌の 感染を うたがう)');
      if (pid === 'legion') r.lines.push('ナトリウムが 低い(レジオネラで よく ある)');
      if (['scrub', 'lyme'].includes(pid)) r.lines.push('肝臓の 数値が 少し 高い');
      if (p.boss || p.resist) r.lines.push('プロカルシトニン: 高い(重い 細菌感染の サイン)');
    } else if (p.cat === 'vir') {
      r.lines.push(pid === 'dengue' ? '白血球: 少ない ・ 血小板: 少ない ⬇️' : '白血球: ふつう〜少なめ ・ CRP: 少し 高いだけ(ウイルスっぽい)');
    } else if (p.cat === 'fun') {
      r.lines.push(['candida', 'asper', 'pcp'].includes(pid) ? 'β-Dグルカン: 高い ⬆️(カビの なかまを うたがう)' : 'β-Dグルカン: ふつう(ひふだけの カビでは 上がらない)');
    } else {
      if (pid === 'malaria') r.lines.push('血小板: 少ない ⬇️ ・ 貧血(赤血球が こわれている)');
      else r.lines.push(worm ? '好酸球(白血球の なかま): 多い ⬆️(寄生虫を うたがう)' : '大きな 異常は ない。');
    }
  }
  if (kind === 'xray') { const pat = XRAY[pid] || 'none'; r.img = xraySVG(pat); r.lines.push(XRAY_JA[pat]); if (pat !== 'none') r.lines.push('→ 肺の 感染が ありそう'); }
  if (kind === 'urine') {
    if (['ecoli', 'esbl'].includes(pid)) r.lines.push('白血球: たくさん ・ 細菌: いる ・ 亜硝酸: 陽性 → 尿路感染(大腸菌などの グラム陰性菌が 多い)');
    else if (pid === 'entero') r.lines.push('白血球: たくさん ・ 細菌: いる ・ 亜硝酸: 陰性(腸球菌は 亜硝酸を 作らない)');
    else if (['legion', 'pneumo'].includes(pid)) r.lines.push('尿は ふつう。(尿中抗原の 迅速検査なら わかるかも)');
    else r.lines.push('とくに 異常は ない。');
  }
  if (kind === 'micro') {
    const M = { pinworm: 'おしりに はった セロハンテープに、ぎょう虫の 卵!', ascaris: '便の中に 回虫の 卵!', giardia: '便の中に、顔のような 形の 原虫(ジアルジア)!', amoeba: '便の中に、赤血球を 食べた アメーバ!', malaria: '血液の 塗抹標本で、赤血球の 中に 指輪のような 原虫(マラリア)!', scabies: 'ひふを こすって 見ると、ヒゼンダニが いた!', tinea: 'ひふを KOHで とかして 見ると、糸状の カビ(白癬菌)!', candida: '酵母と 糸のような カビ(カンジダ)!', campy: '便の グラム染色で、カモメが 飛ぶような らせん菌(カンピロバクター)!' };
    if (M[pid]) { r.lines.push(M[pid]); r.k = 3; } else r.lines.push('虫・原虫・カビは 見つからない。');
  }
  if (kind === 'gram') {
    if (p.cat === 'bac') {
      if (p.gram === 'none') r.lines.push('グラム染色では 何も 見えない(細胞壁が ない菌かも)');
      else if (p.gram === 'acid') { r.lines.push('染まりにくい 細長い菌(抗酸菌かも → 抗酸菌染色へ)'); r.k = 1; }
      else { r.lines.push((GRAM_SHAPE[p.shape] || '') + ' ' + GRAM[p.gram] + '菌'); r.k = 2; r.img = gramSVG(p, 90); }
    } else if (p.cat === 'fun') { r.lines.push(p.shape === 'mold' ? '糸のような カビが 見えた' : '酵母のような 丸い カビが 見えた'); r.k = 1; }
    else r.lines.push('細菌は 見えない(ウイルスか 寄生虫かも)');
  }
  if (kind === 'rapid') { if (C.rapid) { r.lines.push('陽性: ' + p.ja + '!'); r.k = 3; } else r.lines.push('陰性(この検査で わかる 相手では なさそう)'); }
  if (kind === 'csf') {
    if (['mening', 'listeria'].includes(pid)) { r.lines.push('髄液が にごっている。白血球が とても 多く、糖が 少ない → 細菌性髄膜炎!', '髄液の グラム染色: ' + (GRAM_SHAPE[p.shape] || '') + GRAM[p.gram] + '菌'); r.k = 2; }
    else if (pid === 'crypto') { r.lines.push('髄液の 墨汁染色で、まわりが すきとおった 丸い 酵母(莢膜) → クリプトコックス!'); r.k = 3; }
    else r.lines.push('髄液は きれい(髄膜炎では なさそう)。');
  }
  if (kind === 'culture') {
    const best = (C.best || []).map(id => D[id].ja);
    r.lines.push(p.ja + (p.cat === 'vir' ? '(PCRで わかった)' : '(培養で 育った)'));
    if (best.length && (p.cat === 'bac' || p.cat === 'fun')) r.lines.push('よく効く 薬: ' + best.join('・'));
    r.k = 3;
  }
  return r;
}
