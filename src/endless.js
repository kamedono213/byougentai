// ---------- むげん病院(ステージ1〜3を ぜんぶクリアすると 解放される、ずっと遊べるローグライク)
// 幕ごとに「派遣先」を えらぶ → マップのとちゅうの「分かれ道」で 流行・ボス・きけん度が かわる → ボスをたおすと 次の幕(どんどん強くなる)
// ここでしか 出てこない 病原体と薬がある(src/data.js の PATHO・DRUGS に endless: true で足す)

// ---- むげん病院だけの 病原体
PATHO.push(
  { id: 'mening', ja: '髄膜炎菌', full: '髄膜炎菌', cat: 'bac', gram: '-', shape: 'diplo', col: '#ff7f7f', place: '脳・血液', sym: '高いねつ・頭がいたい・首がかたい', hp: 30, pat: [['atk', 7], ['toxin', 0], ['atk', 6]], endless: true,
    fact: '2つずつペアになった球菌。急に重くなる髄膜炎をおこす。すぐに治療が必要。ワクチンがある。' },
  { id: 'tetanus', ja: '破傷風菌', full: '破傷風菌', cat: 'bac', gram: '+', shape: 'spore', col: '#c9a27a', place: '傷', sym: '口が開きにくい・体がこわばる', hp: 30, pat: [['toxin', 0], ['atk', 6], ['hide', 6]], endless: true,
    fact: '土の中にいる菌。傷から入って どくそを出し、筋肉をこわばらせる。子どもの ワクチン(四種混合など)で 予防する。' },
  { id: 'legion', ja: 'レジオネラ', full: 'レジオネラ・ニューモフィラ', cat: 'bac', gram: '-', shape: 'rod', col: '#7fd1c7', place: '肺', sym: '高いねつ・せき(温泉・循環ぶろのあと)', hp: 30, pat: [['atk', 6], ['grow', 5], ['atk', 6]], endless: true,
    fact: '水の中にいる菌。細胞の中に かくれるので、ペニシリンやセフェム系は 効かない。マクロライド系や ニューキノロン系を使う。' },
  { id: 'pertussis', ja: '百日咳菌', full: '百日咳菌', cat: 'bac', gram: '-', shape: 'rodthin', col: '#ffd0a8', place: '肺', sym: 'はげしいせきが 長く続く', hp: 26, pat: [['atk', 5], ['atk', 5], ['hide', 5]], endless: true,
    fact: '名前のとおり、せきが長く続く。赤ちゃんは とくに危ない。マクロライド系を使う。ワクチン(四種混合など)がある。' },
  { id: 'listeria', ja: 'リステリア', full: 'リステリア・モノサイトゲネス', cat: 'bac', gram: '+', shape: 'rod', col: '#b7e37a', place: '血液・脳', sym: 'ねつ・頭がいたい', hp: 30, pat: [['atk', 6], ['grow', 5], ['atk', 6]], endless: true,
    fact: '冷蔵庫の中でも ふえる菌。セフェム系が 効かないのが 大事な ポイント。アンピシリンを使う。' },
  { id: 'entero', ja: '腸球菌', full: 'エンテロコッカス・フェカーリス', cat: 'bac', gram: '+', shape: 'chain', col: '#8fc0ff', place: 'ぼうこう・血液', sym: 'ねつ・おしっこがいたい', hp: 28, pat: [['atk', 5], ['hide', 5], ['atk', 6]], endless: true,
    fact: 'おなかに いる球菌。セフェム系が 効かない。アンピシリンや バンコマイシンを使う。' },
  { id: 'vre', ja: 'VRE', full: 'バンコマイシン耐性腸球菌', cat: 'bac', gram: '+', shape: 'chain', col: '#4f8ad9', place: '血液', sym: '高いねつ', hp: 52, pat: [['atk', 7], ['hide', 7], ['grow', 6], ['atk', 7]], endless: true, resist: true,
    fact: 'バンコマイシンまで 効かなくなった腸球菌。リネゾリドや ダプトマイシンを使う。' },
  { id: 'cre', ja: 'CRE', full: 'カルバペネム耐性腸内細菌目細菌', cat: 'bac', gram: '-', shape: 'rod', col: '#2a7fa8', place: '血液・ぼうこう', sym: '高いねつ', hp: 60, pat: [['atk', 8], ['grow', 7], ['hide', 8], ['atk', 8]], endless: true, resist: true,
    fact: 'メロペネムなどの カルバペネム系まで 効かない腸内細菌。世界中で もっとも警戒されている耐性菌の ひとつ。' },
  { id: 'typhoid', ja: 'チフス菌', full: 'サルモネラ・チフィ', cat: 'bac', gram: '-', shape: 'rod', col: '#f2b880', place: 'おなか・血液', sym: '高いねつが続く・おなかの不調', hp: 30, pat: [['atk', 6], ['grow', 5], ['atk', 6]], endless: true,
    fact: '腸チフスの原因。旅行先の 食べ物や水から うつる。ニューキノロン系が 効きにくい菌が ふえている。' },
  { id: 'cholera', ja: 'コレラ菌', full: 'コレラ菌', cat: 'bac', gram: '-', shape: 'spiral', col: '#9ad0ff', place: 'おなか', sym: '米のとぎ汁のような 大量のげり', hp: 26, pat: [['atk', 8], ['atk', 7]], endless: true,
    fact: 'いちばん大事な 治療は、水分と塩分を たっぷり 補うこと(経口補水液)。抗菌薬は それを たすける役。' },
  { id: 'scrub', ja: 'ツツガムシ病リケッチア', full: 'オリエンチア・ツツガムシ', cat: 'bac', gram: '-', shape: 'tiny', col: '#e0a3ff', place: 'ひふ・全身', sym: 'ねつ・ほっしん・ダニにさされた あと', hp: 28, pat: [['atk', 6], ['grow', 5], ['atk', 6]], endless: true,
    fact: 'ダニ(ツツガムシ)に さされて うつる。細胞の中で ふえるので、ペニシリン系は効かない。テトラサイクリン系を使う。' },
  { id: 'lyme', ja: 'ライム病ボレリア', full: 'ボレリア', cat: 'bac', gram: '-', shape: 'spiral', col: '#ffb3c7', place: 'ひふ・全身', sym: 'マダニにさされたあとの 赤い輪', hp: 26, pat: [['atk', 5], ['grow', 5], ['atk', 5]], endless: true,
    fact: 'マダニに さされて うつる らせん菌。日本では 北海道に多い。ドキシサイクリンなどを使う。' },
  { id: 'cmv', ja: 'サイトメガロウイルス', full: 'サイトメガロウイルス', cat: 'vir', shape: 'ico', col: '#c38cff', place: '目・肺・血液', sym: 'めんえきが弱った人の ねつ・目の病気', hp: 34, pat: [['atk', 6], ['hide', 6], ['atk', 6]], endless: true,
    fact: 'ヘルペスのなかま。多くの人が 知らないうちに かかっている。めんえきが 弱ると 暴れだす。ガンシクロビルを使う。' },
  { id: 'hbv', ja: 'B型肝炎ウイルス', full: 'B型肝炎ウイルス', cat: 'vir', shape: 'ico', col: '#ffcf6b', place: '肝臓', sym: 'つかれやすい・黄だん', hp: 36, pat: [['atk', 4], ['grow', 7], ['hide', 6], ['atk', 5]], endless: true,
    fact: '血液などで うつる。ワクチンで 予防できる(赤ちゃんの定期接種)。エンテカビルなどで ふえるのを おさえる。' },
  { id: 'hcv', ja: 'C型肝炎ウイルス', full: 'C型肝炎ウイルス', cat: 'vir', shape: 'spike', col: '#ffa45c', place: '肝臓', sym: '長い間 気づかない肝臓の病気', hp: 40, pat: [['atk', 4], ['grow', 8], ['atk', 5]], endless: true,
    fact: '昔は 治りにくかったが、今は 飲み薬(ソホスブビル・ベルパタスビルなど)で ほとんど治るように なった。' },
  { id: 'measles', ja: '麻しんウイルス', full: '麻しん(はしか)ウイルス', cat: 'vir', shape: 'spike', col: '#ff8fa3', place: '全身', sym: '高いねつ・せき・全身の ほっしん', hp: 30, pat: [['atk', 6], ['atk', 7]], endless: true, self: 5,
    fact: 'はしか。うつる力が とても強い。特効薬は ないが、ワクチン(MR)で 予防できる。' },
  { id: 'dengue', ja: 'デングウイルス', full: 'デングウイルス', cat: 'vir', shape: 'ico', col: '#ff9f9f', place: '全身', sym: '高いねつ・体の いたみ(蚊にさされたあと)', hp: 28, pat: [['atk', 6], ['atk', 6]], endless: true, self: 4,
    fact: '蚊が うつす。特効薬は ないので、水分をとって 体をささえる。痛み止めは アセトアミノフェンを使う。' },
  { id: 'pcp', ja: 'ニューモシスチス', full: 'ニューモシスチス・イロベチイ', cat: 'fun', shape: 'yeast', col: '#d9c2ff', place: '肺', sym: '息が くるしい(めんえきが弱った人)', hp: 34, pat: [['atk', 6], ['grow', 6], ['atk', 6]], endless: true,
    fact: '真菌(カビ)の なかまなのに、ふつうの 抗真菌薬は 効かない。抗菌薬の「ST合剤」が 効く めずらしい相手。' },
  { id: 'crypto', ja: 'クリプトコックス', full: 'クリプトコックス・ネオフォルマンス', cat: 'fun', shape: 'yeast', col: '#f5f0c8', place: '脳・肺', sym: '頭がいたい・ねつ', hp: 40, pat: [['atk', 6], ['hide', 7], ['atk', 7]], endless: true, combo: true,
    fact: 'ハトのふんなどに いる酵母の カビ。脳に入ると 重い。アムホテリシンBと フルシトシンを 組み合わせて 使う(併用)。' },
  { id: 'echino', ja: 'エキノコックス', full: 'エキノコックス(多包条虫)', cat: 'par', shape: 'worm', col: '#e9d8b0', place: '肝臓', sym: '何年も かけて 肝臓に できる病気', hp: 44, pat: [['grow', 6], ['atk', 6], ['hide', 7], ['atk', 7]], endless: true,
    fact: '北海道の キタキツネの ふんから うつることがある。沢の水を そのまま飲まない。治療は 手術と アルベンダゾール。' },
  { id: 'amoeba', ja: '赤痢アメーバ', full: '赤痢アメーバ', cat: 'par', shape: 'proto2', col: '#c3e8a4', place: 'おなか・肝臓', sym: '血の まじる げり', hp: 28, pat: [['atk', 6], ['grow', 5], ['atk', 5]], endless: true,
    fact: '生水などから うつる原虫。メトロニダゾールを使う。' },
);
Object.assign(P, Object.fromEntries(PATHO.map(p => [p.id, p])));

// ---- むげん病院だけの 薬
DRUGS.push(
  { id: 'abpc', ja: 'アンピシリン', cls: 'ペニシリン系', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 1, rsk: 1, endless: true, eff: { listeria: 2, entero: 2, strep: 2, pneumo: 2, mening: 1, ecoli: 1 },
    desc: '点滴のペニシリン。セフェム系が 効かない リステリアや 腸球菌に 強い。', fact: 'セフェム系は 世代が新しいほど強い…というわけではない。相手しだい。' },
  { id: 'doxy', ja: 'ドキシサイクリン', cls: 'テトラサイクリン系', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 1, rsk: 1, endless: true, eff: { scrub: 2, lyme: 2, cholera: 2, myco: 2 },
    desc: 'ダニが うつす病気(ツツガムシ病・ライム病)の 代表的な薬。', fact: 'ツツガムシ病は 治療が おくれると 重くなる。山や畑のあとの ねつと ほっしんに注意。' },
  { id: 'st', ja: 'ST合剤', sub: 'スルファメトキサゾール・トリメトプリム', cls: 'サルファ剤', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 1, rsk: 1, endless: true, eff: { pcp: 2, ecoli: 1, staph: 1 },
    desc: '2つの薬を 組み合わせた 抗菌薬。真菌の ニューモシスチスにも 効く。', fact: 'めんえきが弱った人の ニューモシスチス肺炎の 予防にも 使われる。' },
  { id: 'gm', ja: 'ゲンタマイシン', cls: 'アミノグリコシド系', cat: 'abx', cost: 2, cd: 1, dmg: 12, gut: 1, rsk: 2, hurt: 1, endless: true, eff: { ecoli: 2, pseudo: 2, typhoid: 1 },
    desc: 'グラム陰性菌に 強い 点滴の薬。腎臓や 耳への 副作用に 注意する。', fact: '血液中の 量を 測りながら 使う。' },
  { id: 'dap', ja: 'ダプトマイシン', cls: 'リポペプチド系', cat: 'abx', cost: 2, cd: 1, dmg: 13, gut: 1, rsk: 2, endless: true, eff: { vre: 2, mrsa: 2, entero: 2, staph: 2 },
    desc: 'MRSAや VREに 効く グラム陽性菌用の 薬。肺炎には 使えない(肺の中で はたらけない)。', fact: '肺の 表面の 物質に くっついて 効かなくなる。' },
  { id: 'cfpm', ja: 'セフェピム', cls: '第4世代セフェム系', cat: 'abx', cost: 2, cd: 1, dmg: 12, gut: 2, rsk: 2, endless: true, eff: { pseudo: 2, ecoli: 2, mening: 1, strep: 2, pneumo: 2, esbl: 1 },
    desc: '緑膿菌にも 効く セフェム系。', fact: 'それでも 腸球菌と リステリアには 効かない。' },
  { id: 'abz', ja: 'アルベンダゾール', cls: '駆虫薬', cat: 'par', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, endless: true, eff: { echino: 2, pinworm: 2, ascaris: 2 },
    desc: 'エキノコックスなどの 虫に 使う。', fact: 'エキノコックスは 手術で 取りのぞくのが 基本で、薬は それを たすける。' },
  { id: 'gcv', ja: 'ガンシクロビル', cls: '抗ヘルペスウイルス薬', cat: 'vir', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, hurt: 1, endless: true, eff: { cmv: 2 },
    desc: 'サイトメガロウイルスの 薬。血液の細胞が へる 副作用に 注意。', fact: 'アシクロビルの なかまだが、サイトメガロウイルスに よく効く。' },
  { id: 'etv', ja: 'エンテカビル', brand: 'バラクルード', cls: '抗B型肝炎ウイルス薬', cat: 'vir', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 0, endless: true, eff: { hbv: 2 },
    desc: 'B型肝炎ウイルスが ふえるのを おさえる 飲み薬。', fact: '長く 飲みつづけて ウイルスを おさえこむ。' },
  { id: 'sofvel', ja: 'ソホスブビル・ベルパタスビル', brand: 'エプクルーサ', cls: '抗C型肝炎ウイルス薬', cat: 'vir', cost: 2, cd: 1, dmg: 14, gut: 0, rsk: 0, endless: true, eff: { hcv: 2 },
    desc: 'C型肝炎を 飲み薬だけで 治せる 薬。', fact: '昔の注射の 治療より、ずっと 副作用が 少なく よく治る。' },
  { id: 'fc', ja: 'フルシトシン', cls: 'ピリミジン系', cat: 'fun', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 1, endless: true, eff: { crypto: 2, candida: 1 },
    desc: 'クリプトコックスで、アムホテリシンBと 組み合わせて 使う。', fact: '1つだけで 使うと すぐに 耐性が できる。' },
);
Object.assign(D, Object.fromEntries(DRUGS.map(d => [d.id, d])));
// 今までの薬が、新しい病原体に 効くかどうか
const EFF_ADD = {
  pen: { mening: 2, tetanus: 1 }, amox: { lyme: 2, entero: 2, listeria: 2 }, ctrx: { mening: 2, typhoid: 2, lyme: 1 },
  azm: { legion: 2, pertussis: 2, typhoid: 2, cholera: 2 }, cam: { legion: 2, pertussis: 2 }, lvfx: { legion: 2, typhoid: 1 },
  mino: { scrub: 2, lyme: 1 }, mepm: { mening: 2, typhoid: 2 }, vcm: { entero: 2 }, lzd: { entero: 2, vre: 2 },
  mnz: { tetanus: 2, amoeba: 2 }, cl: { cre: 2 }, tazpip: { entero: 2 }, amph: { crypto: 2 }, flcz: { crypto: 2 },
};
for (const [id, e] of Object.entries(EFF_ADD)) Object.assign(D[id].eff, e);

// ---- 派遣先(幕のはじめに 3つから えらぶ)
const SCN = [
  { id: 'winter', em: '⛄', ja: '冬の小学校', patient: 'kid', test: 'cat', bg: '#16324a', pool: ['flu', 'noro', 'strep', 'pneumo', 'adeno', 'pertussis', 'myco', 'rsv'], elites: ['myco', 'pertussis', 'measles'], boss: ['flu_boss', 'measles'], need: 0,
    desc: 'インフルエンザや ノロが はやる 季節。' },
  { id: 'tropic', em: '🌴', ja: '熱帯の国へ 派遣', patient: 'dad', test: 'cat', bg: '#3a2a16', pool: ['dengue', 'typhoid', 'cholera', 'amoeba', 'giardia', 'campy', 'ascaris', 'scabies'], elites: ['typhoid', 'cholera', 'amoeba'], boss: ['malaria', 'dengue'], need: 0,
    desc: '蚊・生水・屋台の 食べ物に 注意。' },
  { id: 'icu', em: '🏥', ja: '病院の ICU', patient: 'gpa', test: 'gram', bg: '#2a1838', pool: ['pseudo', 'esbl', 'candida', 'cdiff', 'entero', 'staph', 'ecoli', 'listeria'], elites: ['mrsa', 'vre', 'esbl'], boss: ['mdrp', 'cre'], need: 0,
    desc: '耐性菌との たたかい。せまい薬を 大事に。' },
  { id: 'er', em: '🚑', ja: '救命救急センター', patient: 'dad', test: 'gram', bg: '#3a1a1a', pool: ['mening', 'tetanus', 'staph', 'strep', 'legion', 'pneumo', 'listeria', 'anisakis'], elites: ['mening', 'tetanus', 'legion'], boss: ['mening', 'mrsa'], need: 0,
    desc: '急に重くなる 病気が 運ばれてくる。' },
  { id: 'forest', em: '🦊', ja: '北海道の 山と森', patient: 'dad', test: 'cat', bg: '#1e3a24', pool: ['lyme', 'scrub', 'campy', 'anisakis', 'tinea', 'ascaris', 'giardia'], elites: ['lyme', 'scrub'], boss: ['echino'], need: 2,
    desc: 'マダニ・キタキツネ・沢の水。むげん病院で 2幕を こえると 解放。' },
  { id: 'immuno', em: '🛡️', ja: 'めんえきが 弱った患者', patient: 'gpa', test: 'gram', bg: '#24243e', pool: ['pcp', 'crypto', 'cmv', 'candida', 'asper', 'listeria', 'tb'], elites: ['crypto', 'cmv', 'asper'], boss: ['pcp', 'asper'], need: 3,
    desc: 'ふだんは 悪さをしない 相手も 暴れる。3幕を こえると 解放。' },
  { id: 'kenshin', em: '🩺', ja: '健康診断で 見つかった', patient: 'dad', test: 'cat', bg: '#2a2a1a', pool: ['hbv', 'hcv', 'pylori', 'tb', 'echino', 'amoeba'], elites: ['hbv', 'tb', 'pylori'], boss: ['hcv', 'hbv'], need: 4,
    desc: '気づかないうちに すすむ 病気。4幕を こえると 解放。' },
];
const SC = Object.fromEntries(SCN.map(s => [s.id, s]));

// ---- 分かれ道(マップの とちゅうで えらぶ。その幕の 敵・ボス・きけん度が かわる)
function forkOptions(R) {
  const s = SC[R.scn], o = [];
  const hot = shuffle(s.pool).slice(0, 2);
  o.push({ ja: `🔥 ${P[hot[0]].ja}が 流行中の 地区へ`, desc: `この幕は ${P[hot[0]].ja}が よく出る。コイン +50%`, fx: { hot: hot[0], coin: 1.5 } });
  o.push({ ja: `🔥 ${P[hot[1]].ja}が 流行中の 地区へ`, desc: `この幕は ${P[hot[1]].ja}が よく出る。コイン +50%`, fx: { hot: hot[1], coin: 1.5 } });
  const bs = shuffle(s.boss.concat(s.elites).filter(b => b !== R.bossId))[0];
  if (bs) o.push({ ja: `👑 ボスの 正体が かわる: ${S.seen[bs] ? P[bs].ja : '???'}`, desc: '強い ボスほど ほうびが 多い。', fx: { boss: bs, coin: 1.2 } });
  o.push({ ja: '🌙 夜勤を 引きうける', desc: 'この幕の 敵の こうげき +1。そのかわり ボスのあとに レリック1つ。', fx: { atk: 1, relic: 1 } });
  o.push({ ja: '☕ ゆっくり いく', desc: '患者の体力 +8。とくに 何も かわらない。', fx: { heal: 8 } });
  return shuffle(o).slice(0, 3);
}

// ---- むげん病院の すすめ方
function endlessStart() {
  const best = (S.endless && S.endless.best) || 0;
  modal(`<b class="big">♾️ むげん病院</b><p>派遣先を えらんで、ボスを たおすたびに 次の幕へ。どこまで 行けるか ちょうせん!</p><p class="note">幕が すすむほど 病原体が 強くなる。ここでしか 出会えない 病原体と 薬が いる。負けたら おわり(図鑑・おぼえた薬は のこる)。</p><p class="note">さいこう記録: ${best ? best + '幕' : 'まだ なし'}</p>
    <div class="row c asc"><span>むずかしさ</span><select id="easc">${Array.from({ length: Math.min(((S.endless && S.endless.asc) || 0) + 1, 10) }, (_, i) => `<option value="${i}">${i ? i : 'ふつう'}</option>`).join('')}</select></div>`, ['はじめる', 'やめる']).then(async i => {
    if (i !== 0) return;
    const asc = +((document.getElementById('easc') || {}).value || 0);
    if (S.run && !await ask('<b>今の つづきは 消えるけど いい?</b>', 'はじめる')) return;
    S.endless = S.endless || { best: 0, runs: 0 }; S.endless.runs++;
    const R = newRun(0, 0); Object.assign(R, { stage: 9, asc, act: 1, coins: 40, items: ['hint'], mod: {} });
    S.run = R; save(); SE.play('start'); chooseScenario();
  });
}
async function chooseScenario() {
  const R = S.run, best = (S.endless && S.endless.best) || 0;
  const open = SCN.filter(s => best >= s.need && s.id !== R.lastScn);
  const three = shuffle(open).slice(0, 3);
  const i = await modal(`<b class="big">${R.act}幕: どこへ 派遣される?</b><p class="note">えらんだ場所で 出てくる 病原体と ボスが きまる。</p>`, three.map(s => `<span class="scnb" style="background:${s.bg}"><b>${s.em} ${s.ja}</b><span class="note">${s.desc}</span><span class="note">患者: ${PATIENTS[s.patient].short} ・ 検査: ${{ name: '名前まで', cat: '分類', gram: 'グラム染色' }[s.test]}</span></span>`));
  const s = three[i];
  R.scn = s.id; R.lastScn = s.id; R.bossId = pick(s.boss); R.mod = {};
  const pt = PATIENTS[s.patient]; R.max = pt.hp + (R.act - 1) * 4; R.hp = R.max; R.gut = 10;
  R.map = makeMap(9); R.pos = null; R.path = []; R.pending = null; R.shop = null; R.evSeen = [];
  save();
  await modal(`<div class="row c">${ART.patient(pt.look, true, 90)}</div><b>${s.em} ${s.ja}</b><p>今回の 患者: ${pt.ja.replace('のどがいたい', '具合のわるい')}</p><p class="note">ボスは まだ ひみつ。とちゅうの 🧭分かれ道で 流れが かわるよ。</p>`, ['しゅっぱつ!']);
  mapScreen();
}
async function forkScreen() {
  const R = S.run, op = forkOptions(R);
  const i = await modal(`<b class="big">🧭 分かれ道</b><p>どうする?</p>`, op.map(o => `<span class="scnb"><b>${o.ja}</b><span class="note">${o.desc}</span></span>`));
  const fx = op[i].fx; R.mod = R.mod || {};
  if (fx.hot) R.mod.hot = fx.hot;
  if (fx.coin) R.mod.coin = Math.max(R.mod.coin || 1, fx.coin);
  if (fx.boss) R.bossId = fx.boss;
  if (fx.atk) R.mod.atk = (R.mod.atk || 0) + fx.atk;
  if (fx.relic) R.mod.relic = (R.mod.relic || 0) + fx.relic;
  if (fx.heal) R.hp = Math.min(R.max, R.hp + fx.heal);
  st('fork'); SE.play('ok'); save(); mapScreen();
}
async function actClear(coin) {
  const R = S.run;
  S.endless.best = Math.max(S.endless.best || 0, R.act);
  if (R.asc >= (S.endless.asc || 0) && R.act >= 3) S.endless.asc = Math.max(S.endless.asc || 0, R.asc + 1);
  S.endless.scn = Object.assign({}, S.endless.scn, { [R.scn]: (S.endless.scn && S.endless.scn[R.scn] || 0) + 1 });
  let got = '';
  for (let k = 0; k < (R.mod.relic || 0) + 1; k++) { const r = pick(RELICS.filter(x => !R.relics.includes(x.id))); if (r) { R.relics.push(r.id); got += `<p class="got">${r.em} <b>${r.ja}</b><br><span class="note">${r.desc}</span></p>`; } }
  R.act++; checkAch(); save(); SE.play('perfect');
  await modal(`<b class="big">🎉 ${R.act - 1}幕 クリア!</b><p>🪙 +${coin}</p>${got}<p>次は <b>${R.act}幕</b>。病原体が もっと 強くなる…!</p><p class="note">さいこう記録: ${S.endless.best}幕</p>`, ['次の 派遣先へ']);
  chooseScenario();
}
async function endlessOver() {
  const R = S.run; S.run = null;
  const reached = R.act - 1 + (R.fl + 1) / 13;
  S.endless.deep = Math.max(S.endless.deep || 0, reached); save(); checkAch();
  await modal(`<b class="big">😵 むげん病院 おしまい</b><p><b>${R.act}幕</b> ${SC[R.scn].em}${SC[R.scn].ja} の ${R.fl + 1}階まで すすんだ。</p><p class="note">さいこう記録: ${S.endless.best || 0}幕 クリア</p><p class="note">図鑑と おぼえた薬は のこる。次は もっと 先へ!</p>`, ['タイトルへ']);
  title();
}
