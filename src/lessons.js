// ---------- 検査けんしゅう(短い練習ステージ)と、臨床の考え方
// グラム染色の 見え方(紫=陽性、赤=陰性)を 小さな絵で
function gramSVG(p, size = 64) {
  const pos = p.gram === '+', col = pos ? '#6a3fb5' : '#e05a7a';
  const dot = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
  const rod = (x, y, a = 0, l = 14) => `<rect x="${x - l / 2}" y="${y - 3}" width="${l}" height="6" rx="3" fill="${col}" transform="rotate(${a} ${x} ${y})"/>`;
  const shapes = {
    chain: [[16, 30], [24, 34], [32, 36], [40, 34], [48, 30], [20, 52], [28, 56], [36, 58]].map(([x, y]) => dot(x, y)).join(''),
    diplo: [[20, 28], [29, 28], [40, 46], [49, 46], [18, 56], [27, 56]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" fill="${col}"/>`).join(''),
    grape: [[30, 30], [37, 30], [33, 36], [26, 36], [40, 37], [30, 43], [37, 44], [48, 52], [52, 57], [45, 58]].map(([x, y]) => dot(x, y)).join(''),
    rod: [[22, 26, 10], [40, 30, -20], [28, 46, 40], [48, 50, 0], [20, 58, -10]].map(([x, y, a]) => rod(x, y, a)).join(''),
    rodthin: [[22, 30, 10], [40, 40, -30], [30, 54, 20]].map(([x, y, a]) => rod(x, y, a, 18)).join(''),
    spiral: '<path d="M14 40 q6 -10 12 0 t12 0 t12 0" stroke="' + col + '" stroke-width="4" fill="none"/><path d="M20 56 q6 -8 12 0 t12 0" stroke="' + col + '" stroke-width="4" fill="none"/>',
    spore: [[24, 30, 0], [42, 44, 30]].map(([x, y, a]) => rod(x, y, a, 18) + `<circle cx="${x + 9}" cy="${y}" r="3" fill="#fff"/>`).join(''),
    tiny: '',
  };
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="gram"><circle cx="32" cy="32" r="30" fill="#fff6e8" stroke="#c9b88f" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="#f3c9d4" opacity=".6"/><circle cx="46" cy="22" r="5" fill="#f3c9d4" opacity=".6"/>${shapes[p.shape] || ''}</svg>`;
}

MANUAL.reason = [
  { t: 'お医者さんの 考え方(臨床推論)', b: `<div class="map4"><div>① <b>どこの</b> 感染? (のど・肺・おしっこ・ひふ…)</div><div>② <b>だれ</b>が? (子ども・旅行帰り・入院中…)</div><div>③ そこで <b>よくある</b> 原因は?</div><div>④ それに <b>ばっちりの薬</b>(第一選択)で 治療を 始める</div><div>⑤ <b>検査</b>で 確かめて、薬を しぼる</div></div><p>検査を 待たずに 見立てで 治療を 始めるのも 本物の 治療。<b>当たりを つける</b>のが 名医の うで!</p>` },
];
MANUAL.l_ask = [{ t: '🗣️ 問診(話を 聞く)', b: `<p>「いつから?」「まわりで はやっている?」「どこへ 行った?」「何を 食べた?」</p><p>問診だけで 正体の 見当が つくことも 多い。たとえば <b>学校で はやっていて・急に 高い熱・体の ふしぶしが いたい</b> → インフルエンザかも。</p><p class="note">見当が ついたら、検査で 確かめなくても 治療を 始めて いい。当たれば 正体が わかる(<b>見立てどおり!</b>)。</p>` }];
MANUAL.l_gram = [{ t: '🔬 グラム染色(細菌の 色と 形)', b: `<div class="row c">${gramSVG({ gram: '+', shape: 'grape' }, 70)}${gramSVG({ gram: '-', shape: 'rod' }, 70)}</div><p><b style="color:#6a3fb5">紫</b>=<b>グラム陽性</b>(細胞壁が 厚い)、<b style="color:#e05a7a">赤</b>=<b>グラム陰性</b>(外側に うすい膜)。</p><div class="map4"><div>紫・ブドウの房 → <b>ブドウ球菌</b> → セファゾリン</div><div>紫・くさり → <b>レンサ球菌</b> → ペニシリン系</div><div>紫・2つずつ → <b>肺炎球菌</b> → アモキシシリン</div><div>赤・棒 → <b>大腸菌など</b> → セフトリアキソン</div></div><p class="note">ウイルスや 寄生虫は グラム染色では 見えない。</p>` }];
MANUAL.l_rapid = [{ t: '🧪 迅速検査(決まった相手だけ すぐ わかる)', b: `<p>インフルエンザ・新型コロナ・溶連菌・アデノ・RS・ノロ・マイコプラズマ・肺炎球菌やレジオネラ(おしっこの検査)・ディフィシル菌・マラリア など。</p><p><b>陽性</b>なら 名前が わかる。<b>陰性</b>なら「この相手では ないかも」と 考えなおそう。</p><p class="note">陰性でも 100% ちがうとは 言えないのが 本物の 検査。</p>` }];
MANUAL.l_cult = [{ t: '🧫 培養・PCR と「しぼりこみ」', b: `<p>重い時は、まず <b>広く効く薬</b>で 治療を 始める。そして 培養で 正体と <b>よく効く薬</b>が わかったら、<b>ねらいの せまい薬に 切りかえる</b>(デエスカレーション)。</p><p>そうすると 善玉菌を 守れて、耐性菌も ふえにくい。ゲームでも 切りかえると ボーナス!</p><p class="note">培養・PCRは 処方ポイント2。</p>` }];

MANUAL.l_more = [{ t: '🩺 いろいろな 検査を 組み合わせる', b: `<div class="map4"><div>🩺 <b>診察</b>: のどの 赤み・聴診器の 音・おなかや 背中の いたみ</div><div>🩸 <b>血液検査</b>: 白血球・CRP が 高い → 細菌? / β-Dグルカン → カビ? / 好酸球 → 寄生虫?</div><div>🩻 <b>胸の レントゲン</b>: 肺に 影が あるか(肺炎・結核の 空洞…)</div><div>🧻 <b>尿検査</b>: おしっこの 感染か</div><div>🔍 <b>顕微鏡検査</b>: 便・血液・ひふで 虫・原虫・カビを さがす</div><div>💉 <b>髄液検査</b>: 髄膜炎の うたがい</div></div><p>どれも 処方ポイントを 使う。<b>あやしい 検査から</b> えらぶのが 名医の うで!</p>` }];
const TUT2 = [
  { man: 'reason', next: 'l_ask', foe: 'flu', give: ['osel'], tip: 'まず 🔬検査 → 🗣️問診。学校で はやっていて、急な 高熱・ふしぶしの いたみ なら インフルエンザ。タミフルで 治療を 始めよう!' },
  { man: 'l_gram', foe: ['staph', 'ecoli'], give: ['cez', 'ctrx'], tip: '🔬グラム染色 で、紫の ブドウの房なら セファゾリン、赤い 棒なら セフトリアキソン!' },
  { man: 'l_rapid', foe: ['strep', 'adeno'], give: ['amox', 'ors'], tip: '🧪迅速検査 で 陽性なら 名前が わかる。溶連菌なら アモキシシリン、アデノなら 薬は いらない(体をささえる)。' },
  { man: 'l_more', next: 'l_cult', foe: 'ecoli', give: ['mepm', 'ctrx'], tip: 'まず メロペネムで 始めて、🧫培養 で 大腸菌と わかったら セフトリアキソンに 切りかえよう(しぼりこみ)。' },
];
function lessons(step) {
  if (step >= TUT2.length) { S.tut2 = 99; save(); checkAch(); modal('<b class="big">🎓 検査けんしゅう 修了!</b><p>問診・グラム染色・迅速検査・培養を 組み合わせて、正体を しぼりこもう。</p>', ['OK']).then(title); return; }
  const T = TUT2[step]; S.tut2 = step; save();
  const go = () => {
    (T.give || []).forEach(id => learn(id, true)); save();
    const foes = Array.isArray(T.foe) ? (step === 1 ? T.foe : [pick(T.foe)]) : [T.foe];
    S.run = newRun(0); S.run.tutStep = step;
    foes.forEach(pid => { S.seen[pid] = S.seen[pid] || Date.now(); });
    startBattle({ foes, known: 0, tip: T.tip, tut: true, lesson: true, onWin: () => { S.run = null; B = null; lessons(step + 1); } });
  };
  manual(T.man, T.next ? () => manual(T.next, go) : go);
}
