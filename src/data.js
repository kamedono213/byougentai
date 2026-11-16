// ---------- データ: 病原体・薬・患者・ステージ・レリック・アイテム・イベント
// 相性(eff)は docs/sources.md の資料で確かめた分け方にそろえている。ゲームなので「よく効く=2 / 効きにくいことがある=1 / 効かない=0」に単純化。
// 薬の量・飲み方は書かない。
const CAT = {
  bac: { ja: '細菌', col: '#4fb3ff', em: '🦠', desc: '1つの細胞でできた小さな生き物。自分でふえる。' },
  vir: { ja: 'ウイルス', col: '#ff6b9a', em: '🧬', desc: '細菌よりずっと小さい。人の細胞の中に入りこんでふえる。' },
  fun: { ja: '真菌', col: '#c59bff', em: '🍄', desc: 'カビやキノコのなかま。人と同じ「しんかく」をもつ細胞。' },
  par: { ja: '寄生虫', col: '#7ad36b', em: '🪱', desc: '人の体にすみつく虫や、小さな生き物(原虫・ダニ)。' },
};
const GRAM = { '+': 'グラム陽性', '-': 'グラム陰性', none: '細胞壁なし', acid: '抗酸菌' };

// shape: 絵の形。stage: 出てくるステージ(0=チュートリアル)。pat: 敵の行動のくり返し [種類, 数]
//   atk=こうげき grow=ふえる(HP回復) toxin=どくそ(次のこうげき2倍) hide=かくれる(次に受けるダメージを減らす)
// self: 薬なしでも めんえきで自然に治るまでのターン数(特効薬のないウイルスなど)
// combo: 2種類以上の薬を同じターンに使わないと効きが弱い(併用が必要)
const PATHO = [
  // ---- 細菌
  { id: 'strep', ja: '溶連菌', full: 'A群溶血性レンサ球菌', cat: 'bac', gram: '+', shape: 'chain', col: '#ff8a5c', place: 'のど', sym: 'のどがいたい・ねつ', hp: 16, pat: [['atk', 4], ['grow', 3], ['atk', 5]], stage: [0, 1],
    fact: '球の形の菌がくさりのようにつながる。のどの炎症の原因になる。ペニシリンのなかまがよく効く。' },
  { id: 'pneumo', ja: '肺炎球菌', full: '肺炎レンサ球菌', cat: 'bac', gram: '+', shape: 'diplo', col: '#ffb347', place: '肺・耳', sym: 'せき・ねつ・耳がいたい', hp: 20, pat: [['atk', 5], ['hide', 4], ['atk', 6]], stage: [1, 3],
    fact: '2つずつペアになった球菌。肺炎や中耳炎の原因になる。ワクチンがある。日本ではマクロライド系が効かない菌が多い。' },
  { id: 'staph', ja: '黄色ブドウ球菌', full: '黄色ブドウ球菌(MSSA)', cat: 'bac', gram: '+', shape: 'grape', col: '#f5d33b', place: 'ひふ', sym: 'ひふが赤くはれる・うみ', hp: 20, pat: [['atk', 5], ['toxin', 0], ['atk', 4]], stage: [1, 3],
    fact: 'ブドウの房のように集まる球菌。とびひや傷の化のうの原因。多くがペニシリンをこわす酵素(ペニシリナーゼ)をもつ。' },
  { id: 'mrsa', ja: 'MRSA', full: 'メチシリン耐性黄色ブドウ球菌', cat: 'bac', gram: '+', shape: 'grape', col: '#e0a020', place: '傷・血液', sym: 'なかなか治らない傷・ねつ', hp: 48, pat: [['atk', 7], ['hide', 6], ['toxin', 0], ['atk', 6]], stage: [3], resist: true,
    fact: '黄色ブドウ球菌が、ペニシリンやセフェム系(β-ラクタム系)の薬に耐性をもったもの。病院で問題になる。バンコマイシンなどを使う。' },
  { id: 'ecoli', ja: '大腸菌', full: '大腸菌', cat: 'bac', gram: '-', shape: 'rod', col: '#5ec8e5', place: 'ぼうこう', sym: 'おしっこがいたい・ねつ', hp: 22, pat: [['atk', 5], ['grow', 4], ['atk', 6]], stage: [2, 3],
    fact: 'おなかの中にふつうにいる棒の形の菌。ぼうこうに入ると膀胱炎や腎盂腎炎をおこす。' },
  { id: 'esbl', ja: 'ESBL産生大腸菌', full: 'ESBL産生大腸菌', cat: 'bac', gram: '-', shape: 'rod', col: '#2f9fc4', place: 'ぼうこう・血液', sym: 'おしっこがいたい・高いねつ', hp: 40, pat: [['atk', 7], ['grow', 5], ['atk', 8]], stage: [3], resist: true,
    fact: 'ESBLという酵素で、セフェム系などの薬をこわす大腸菌。カルバペネム系が使われる。' },
  { id: 'myco', ja: 'マイコプラズマ', full: '肺炎マイコプラズマ', cat: 'bac', gram: 'none', shape: 'tiny', col: '#9bd4a0', place: '肺', sym: 'しつこいせき・ねつ', hp: 22, pat: [['atk', 4], ['atk', 4], ['grow', 4]], stage: [1, 2],
    fact: '細胞壁をもたないとても小さい細菌。だから細胞壁をこわすペニシリンやセフェム系は効かない。マクロライド系などを使う。' },
  { id: 'campy', ja: 'カンピロバクター', full: 'カンピロバクター・ジェジュニ', cat: 'bac', gram: '-', shape: 'spiral', col: '#d98cff', place: 'おなか', sym: 'げり・おなかがいたい・ねつ', hp: 20, pat: [['atk', 5], ['atk', 5], ['grow', 3]], stage: [2],
    fact: 'らせんの形の菌。生や生焼けの鶏肉から感染しやすい。多くは自然に治るが、重いときはマクロライド系を使う。' },
  { id: 'pseudo', ja: '緑膿菌', full: '緑膿菌', cat: 'bac', gram: '-', shape: 'rod', col: '#4cc38a', place: '肺(入院中)', sym: 'せき・ねつ', hp: 32, pat: [['atk', 6], ['hide', 6], ['atk', 7]], stage: [3],
    fact: '水まわりにいる棒の形の菌。体が弱っている人に感染する。もともと効かない薬が多く、使える薬が限られる。' },
  { id: 'mdrp', ja: '多剤耐性緑膿菌', full: '多剤耐性緑膿菌(MDRP)', cat: 'bac', gram: '-', shape: 'rod', col: '#1f8a5a', place: '肺・血液', sym: '高いねつ・息がくるしい', hp: 76, pat: [['atk', 7], ['hide', 8], ['grow', 6], ['toxin', 0], ['atk', 7]], stage: [3], resist: true, boss: true,
    fact: 'カルバペネム系・アミノグリコシド系・ニューキノロン系のどれも効かなくなった緑膿菌。コリスチンなど、とっておきの薬にたよる。' },
  { id: 'cdiff', ja: 'ディフィシル菌', full: 'クロストリディオイデス・ディフィシル', cat: 'bac', gram: '+', shape: 'spore', col: '#b08968', place: 'おなか', sym: '抗菌薬のあとのげり', hp: 24, pat: [['atk', 5], ['toxin', 0], ['atk', 4]], stage: [2, 3],
    fact: '抗菌薬でおなかの善玉菌がへると、すきをついてふえる菌。どくそを出してげりをおこす。バンコマイシン(飲み薬)などを使う。' },
  { id: 'tb', ja: '結核菌', full: '結核菌', cat: 'bac', gram: 'acid', shape: 'rodthin', col: '#e6c07b', place: '肺', sym: '2週間以上つづくせき・やせる', hp: 44, pat: [['atk', 5], ['hide', 8], ['grow', 6], ['atk', 6]], stage: [3], combo: true,
    fact: 'ゆっくりふえる菌。1つの薬だけだと耐性ができやすいので、何種類もの薬を組み合わせて長く飲む(併用)。' },
  { id: 'pylori', ja: 'ピロリ菌', full: 'ヘリコバクター・ピロリ', cat: 'bac', gram: '-', shape: 'spiral', col: '#ff9ecb', place: '胃', sym: '胃がいたい', hp: 30, pat: [['atk', 4], ['hide', 6], ['atk', 5]], stage: [2], combo: true,
    fact: '胃の強い酸の中でも生きられるらせんの菌。胃酸をおさえる薬と、2種類の抗菌薬を組み合わせて「除菌」する。' },
  // ---- ウイルス
  { id: 'flu', ja: 'インフルエンザウイルス', full: 'インフルエンザウイルス', cat: 'vir', shape: 'spike', col: '#ff5d8f', place: 'のど・肺', sym: '高いねつ・体がいたい', hp: 18, pat: [['atk', 5], ['grow', 3], ['atk', 6]], stage: [0, 1, 2],
    fact: '冬に流行する。表面のトゲ(ノイラミニダーゼ)をじゃまするタミフルなどが効く。ワクチンもある。' },
  { id: 'adeno', ja: 'アデノウイルス', full: 'アデノウイルス', cat: 'vir', shape: 'ico', col: '#ff9f68', place: 'のど・目', sym: 'ねつ・のど・目が赤い', hp: 18, pat: [['atk', 3], ['atk', 4]], stage: [1], self: 4,
    fact: 'プール熱(咽頭結膜熱)の原因。特効薬はない。水分をとって休めば、めんえきがやっつけてくれる。' },
  { id: 'noro', ja: 'ノロウイルス', full: 'ノロウイルス', cat: 'vir', shape: 'ico', col: '#8fd3ff', place: 'おなか', sym: 'はく・げり', hp: 16, pat: [['atk', 4], ['atk', 3]], stage: [1, 2], self: 3,
    fact: '冬のはき気・げりの代表。特効薬はない。いちばん大事なのは水分と塩分をとること(経口補水液)。アルコール消毒が効きにくい。' },
  { id: 'rsv', ja: 'RSウイルス', full: 'RSウイルス', cat: 'vir', shape: 'spike', col: '#ffa3c4', place: '肺', sym: 'せき・ゼーゼー', hp: 18, pat: [['atk', 3], ['atk', 4]], stage: [1], self: 4,
    fact: '赤ちゃんや小さい子のせきの原因。特効薬はなく、体をささえる治療をする。' },
  { id: 'covid', ja: '新型コロナウイルス', full: 'SARS-CoV-2', cat: 'vir', shape: 'spike', col: '#ff6f61', place: 'のど・肺', sym: 'ねつ・のどがいたい・せき', hp: 26, pat: [['atk', 5], ['grow', 5], ['atk', 6]], stage: [2, 3],
    fact: '2019年に見つかったコロナウイルス。ウイルスがふえるのをじゃまする飲み薬・点滴の薬がある。' },
  { id: 'vzv', ja: '水痘・帯状疱疹ウイルス', full: '水痘・帯状疱疹ウイルス', cat: 'vir', shape: 'ico', col: '#f7a6ff', place: 'ひふ', sym: '水ぶくれ・ピリピリいたい', hp: 24, pat: [['atk', 5], ['hide', 4], ['atk', 5]], stage: [1, 3],
    fact: '子どもでは水ぼうそう。治ったあとも体の神経にかくれて、年をとってから帯状疱疹として出てくることがある。アシクロビルなどが効く。' },
  { id: 'hsv', ja: '単純ヘルペスウイルス', full: '単純ヘルペスウイルス', cat: 'vir', shape: 'ico', col: '#e98cff', place: '口のまわり', sym: '口のまわりの水ぶくれ', hp: 18, pat: [['atk', 4], ['hide', 4]], stage: [2],
    fact: '口のまわりなどに水ぶくれを作る。神経にかくれて、つかれた時にまた出てくる。アシクロビルなどが効く。' },
  // ---- 真菌
  { id: 'tinea', ja: '白癬菌', full: '白癬菌(皮膚糸状菌)', cat: 'fun', shape: 'mold', col: '#d7b5ff', place: '足', sym: '足がかゆい・皮がむける', hp: 18, pat: [['atk', 3], ['grow', 4], ['atk', 4]], stage: [0, 1, 2],
    fact: '水虫の原因になるカビ。ひふの角質を食べてすみつく。テルビナフィンなどの抗真菌薬を使う。' },
  { id: 'candida', ja: 'カンジダ', full: 'カンジダ・アルビカンス', cat: 'fun', shape: 'yeast', col: '#f0e6ff', place: '口・血液', sym: '口の中が白くなる・ねつ', hp: 26, pat: [['atk', 5], ['grow', 4], ['atk', 5]], stage: [2, 3],
    fact: 'ふだんから体にいる酵母のカビ。抗菌薬で細菌がへったり、体が弱ったりするとふえる。フルコナゾールなどを使う。' },
  { id: 'asper', ja: 'アスペルギルス', full: 'アスペルギルス', cat: 'fun', shape: 'mold', col: '#9fd18b', place: '肺(入院中)', sym: 'せき・ねつ・血の混じるたん', hp: 40, pat: [['atk', 6], ['grow', 6], ['atk', 7]], stage: [3],
    fact: '空気中にふつうにいるカビ。めんえきがとても弱った人の肺に入ると重い病気になる。ボリコナゾールなどを使う。' },
  // ---- 寄生虫
  { id: 'pinworm', ja: 'ぎょう虫', full: 'ぎょう虫(蟯虫)', cat: 'par', shape: 'worm', col: '#f3e2b3', place: 'おしり', sym: 'おしりがかゆい', hp: 16, pat: [['atk', 3], ['grow', 3], ['atk', 4]], stage: [0, 1],
    fact: '夜におしりのまわりに卵をうむ小さな虫。家族みんなで治療し、手洗いとつめ切りが大事。ピランテルなどを使う。' },
  { id: 'ascaris', ja: '回虫', full: '回虫', cat: 'par', shape: 'worm', col: '#f7d6c4', place: 'おなか', sym: 'おなかがいたい', hp: 22, pat: [['atk', 4], ['grow', 4], ['atk', 5]], stage: [2],
    fact: '土や野菜についた卵を口から入れると感染する大きな虫。ピランテルやメベンダゾールを使う。' },
  { id: 'anisakis', ja: 'アニサキス', full: 'アニサキス(幼虫)', cat: 'par', shape: 'larva', col: '#fff3e8', place: '胃', sym: '生の魚を食べたあと、急に胃がいたい', hp: 20, pat: [['atk', 7], ['atk', 7]], stage: [2], noDrug: true,
    fact: 'サバやイカなどにいる虫の幼虫。効く薬はなく、胃カメラ(内視鏡)で取り出す。よく加熱するか、冷凍すると死ぬ。' },
  { id: 'malaria', ja: 'マラリア原虫', full: '熱帯熱マラリア原虫', cat: 'par', shape: 'proto', col: '#ff7b7b', place: '血液', sym: '高いねつをくりかえす', hp: 40, pat: [['atk', 7], ['grow', 6], ['atk', 8], ['atk', 6]], stage: [2], boss: true,
    fact: '蚊にさされてうつる小さな生き物(原虫)。赤血球の中でふえる。旅行のあとの高いねつは要注意。アルテメテル・ルメファントリンなどを使う。' },
  { id: 'giardia', ja: 'ジアルジア', full: 'ランブル鞭毛虫', cat: 'par', shape: 'proto2', col: '#a4e8d0', place: 'おなか', sym: 'げり(生水を飲んだあと)', hp: 20, pat: [['atk', 4], ['grow', 4], ['atk', 4]], stage: [2],
    fact: '生水などからうつる原虫。顔のような形が有名。メトロニダゾールなどを使う。' },
  { id: 'scabies', ja: 'ヒゼンダニ', full: 'ヒゼンダニ(疥癬)', cat: 'par', shape: 'mite', col: '#e7c9a9', place: 'ひふ', sym: '夜にとてもかゆい', hp: 24, pat: [['atk', 4], ['grow', 5], ['atk', 4]], stage: [3],
    fact: 'ひふの中にトンネルをほってすむダニ。疥癬という病気をおこす。イベルメクチンの飲み薬や、ぬり薬を使う。' },
];
const P = Object.fromEntries(PATHO.map(p => [p.id, p]));

// 薬。cat: abx=抗菌薬 vir=抗ウイルス薬 fun=抗真菌薬 par=抗寄生虫薬 sup=体をささえる
// cost=処方ポイント cd=使ったあと休むターン dmg=基本のダメージ gut=善玉菌へのえいきょう rsk=耐性メーターがたまる量
// eff: { 病原体id: 2(よく効く) / 1(効きにくいことがある) }。書いていない相手には効かない(0)
const DRUGS = [
  // ---- 抗菌薬
  { id: 'pen', ja: 'ペニシリン', sub: 'ベンジルペニシリン', cls: 'ペニシリン系', cat: 'abx', cost: 1, cd: 0, dmg: 7, gut: 1, rsk: 1, eff: { strep: 2, pneumo: 2 },
    desc: '世界で最初の抗生物質。細菌の「細胞壁」を作れなくする。', fact: '1928年、フレミングがアオカビから見つけた。' },
  { id: 'amox', ja: 'アモキシシリン', cls: 'ペニシリン系', cat: 'abx', cost: 1, cd: 0, dmg: 7, gut: 1, rsk: 1, eff: { strep: 2, pneumo: 2, ecoli: 1, pylori: 2 },
    desc: '飲み薬のペニシリン。のどの溶連菌の第一選択。ピロリ菌の除菌にも使う。', fact: '日本では「サワシリン」「パセトシン」などの名前で売られている。' },
  { id: 'cez', ja: 'セファゾリン', cls: '第1世代セフェム系', cat: 'abx', cost: 1, cd: 0, dmg: 7, gut: 1, rsk: 1, eff: { staph: 2, strep: 2, ecoli: 1 },
    desc: 'グラム陽性菌によく効くセフェム系。ペニシリンが効かない黄色ブドウ球菌(MSSA)に強い。', fact: '手術の前に感染予防でよく使われる点滴の薬。' },
  { id: 'ctrx', ja: 'セフトリアキソン', cls: '第3世代セフェム系', cat: 'abx', cost: 2, cd: 0, dmg: 10, gut: 2, rsk: 2, eff: { pneumo: 2, strep: 2, ecoli: 2, staph: 1 },
    desc: 'グラム陰性菌にも広く効く点滴の薬。強いが、善玉菌もへらす。', fact: '1日1回の点滴ですむので、外来でも使われる。' },
  { id: 'azm', ja: 'アジスロマイシン', cls: 'マクロライド系', cat: 'abx', cost: 1, cd: 0, dmg: 7, gut: 1, rsk: 1, eff: { myco: 2, campy: 2, strep: 1, pneumo: 1 },
    desc: '細菌がタンパク質を作るのをじゃまする。細胞壁のないマイコプラズマにも効く。', fact: '日本の肺炎球菌は、マクロライド系が効かない菌がとても多い。' },
  { id: 'cam', ja: 'クラリスロマイシン', cls: 'マクロライド系', cat: 'abx', cost: 1, cd: 0, dmg: 7, gut: 1, rsk: 1, eff: { myco: 2, pylori: 2, campy: 1, strep: 1, pneumo: 1 },
    desc: 'マクロライド系。ピロリ菌の除菌で、アモキシシリンと組み合わせて使う。', fact: 'ピロリ菌のクラリスロマイシン耐性がふえていて、除菌の薬の組み合わせが見直されてきた。' },
  { id: 'mino', ja: 'ミノサイクリン', cls: 'テトラサイクリン系', cat: 'abx', cost: 1, cd: 1, dmg: 8, gut: 1, rsk: 1, eff: { myco: 2, staph: 1, mrsa: 1 },
    desc: 'マイコプラズマに効く。小さい子どもでは歯に色がつくので、ふつうは使わない。', fact: 'マクロライド系が効かないマイコプラズマに使われることがある。' },
  { id: 'lvfx', ja: 'レボフロキサシン', cls: 'ニューキノロン系', cat: 'abx', cost: 2, cd: 1, dmg: 11, gut: 2, rsk: 3, eff: { ecoli: 2, pneumo: 2, myco: 2, pseudo: 2, campy: 1, tb: 1 },
    desc: 'DNAの複製をじゃまする。とても広く効くが、耐性もできやすい。', fact: '広く効くので「とっておき」にしておきたい薬の1つ。' },
  { id: 'tazpip', ja: 'タゾバクタム・ピペラシリン', cls: 'ペニシリン系+β-ラクタマーゼ阻害薬', cat: 'abx', cost: 2, cd: 1, dmg: 12, gut: 3, rsk: 2, eff: { pseudo: 2, ecoli: 2, staph: 2, strep: 2, pneumo: 2, esbl: 1 },
    desc: '緑膿菌にも効く強いペニシリン。薬をこわす酵素をじゃまする成分が入っている。', fact: '入院中の重い感染症で使われる点滴の薬。' },
  { id: 'mepm', ja: 'メロペネム', cls: 'カルバペネム系', cat: 'abx', cost: 3, cd: 2, dmg: 18, gut: 4, rsk: 4, eff: { ecoli: 2, esbl: 2, pseudo: 2, pneumo: 2, strep: 2, staph: 2 },
    desc: 'とても広く効く最終兵器のひとつ。ただし善玉菌も大きくへらし、使いすぎると耐性菌を生む。', fact: 'MRSAには効かない。むやみに使わないことが世界中で大事にされている。' },
  { id: 'vcm', ja: 'バンコマイシン', cls: 'グリコペプチド系', cat: 'abx', cost: 2, cd: 1, dmg: 12, gut: 2, rsk: 2, eff: { mrsa: 2, staph: 2, strep: 2, pneumo: 2, cdiff: 2 },
    desc: 'MRSAの代表的な薬。グラム陰性菌には効かない。飲み薬はディフィシル菌に使う。', fact: '腎臓に負担がかかるので、血液中の量を測りながら使う。' },
  { id: 'lzd', ja: 'リネゾリド', cls: 'オキサゾリジノン系', cat: 'abx', cost: 2, cd: 1, dmg: 12, gut: 1, rsk: 2, eff: { mrsa: 2, staph: 2, strep: 2, pneumo: 2 },
    desc: 'MRSAに効く飲み薬・点滴の薬。グラム陽性菌用。', fact: '長く使うと血小板がへることがある。' },
  { id: 'mnz', ja: 'メトロニダゾール', cls: 'ニトロイミダゾール系', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 1, rsk: 1, eff: { cdiff: 2, giardia: 2 },
    desc: '酸素がきらいな菌(嫌気性菌)と、原虫の両方に効くめずらしい薬。', fact: 'ジアルジアや赤痢アメーバなどの原虫にも使う。' },
  { id: 'fdx', ja: 'フィダキソマイシン', cls: 'マクロライド系(大環状)', cat: 'abx', cost: 2, cd: 1, dmg: 13, gut: 0, rsk: 1, eff: { cdiff: 2 },
    desc: 'ディフィシル菌によくねらって効き、善玉菌をあまりへらさない。', fact: 'ねらいがせまい薬ほど、おなかの善玉菌を守れる。' },
  { id: 'cl', ja: 'コリスチン', cls: 'ポリペプチド系', cat: 'abx', cost: 3, cd: 1, dmg: 22, gut: 2, rsk: 3, hurt: 3, eff: { mdrp: 2, pseudo: 2, esbl: 2, ecoli: 2 },
    desc: 'ほかの薬が効かない多剤耐性菌の「とっておき」。腎臓などへの副作用が強い。', fact: '副作用が強いので一度は使われなくなったが、耐性菌がふえて再び使われるようになった。' },
  { id: 'inh', ja: 'イソニアジド', cls: '抗結核薬', cat: 'abx', cost: 1, cd: 0, dmg: 9, gut: 0, rsk: 1, eff: { tb: 2 },
    desc: '結核菌の細胞壁(ミコール酸)を作れなくする。ほかの抗結核薬と組み合わせて使う。', fact: '結核の治療はふつう4種類の薬から始めて、6か月ほどつづける。' },
  { id: 'rfp', ja: 'リファンピシン', cls: '抗結核薬', cat: 'abx', cost: 1, cd: 0, dmg: 9, gut: 1, rsk: 1, eff: { tb: 2 },
    desc: '結核菌がRNAを作るのをじゃまする。おしっこや汗がオレンジ色になる。', fact: 'ほかの薬の効き方を変えてしまうので、飲み合わせに注意する。' },
  { id: 'vpz', ja: 'ボノプラザン', cls: '胃酸をおさえる薬', cat: 'sup', cost: 1, cd: 0, dmg: 4, gut: 0, rsk: 0, eff: { pylori: 2 },
    desc: '胃酸をおさえて、抗菌薬が効きやすくする。ピロリ菌の除菌で抗菌薬2つと組み合わせる。', fact: 'ひとつだけでは菌はいなくならない。組み合わせて使う薬。' },
  // ---- 抗ウイルス薬
  { id: 'osel', ja: 'オセルタミビル', brand: 'タミフル', cls: 'ノイラミニダーゼ阻害薬', cat: 'vir', cost: 1, cd: 0, dmg: 7, gut: 0, rsk: 0, eff: { flu: 2 },
    desc: 'インフルエンザウイルスが細胞から出ていくのをじゃまする飲み薬。', fact: 'はやく飲むほど効く(熱が出て48時間以内)。' },
  { id: 'zana', ja: 'ザナミビル', brand: 'リレンザ', cls: 'ノイラミニダーゼ阻害薬', cat: 'vir', cost: 1, cd: 0, dmg: 7, gut: 0, rsk: 0, eff: { flu: 2 },
    desc: '口から吸いこむインフルエンザの薬。', fact: '吸う薬なので、うまく吸えるかが大事。' },
  { id: 'bxm', ja: 'バロキサビル', brand: 'ゾフルーザ', cls: 'キャップ依存性エンドヌクレアーゼ阻害薬', cat: 'vir', cost: 2, cd: 2, dmg: 13, gut: 0, rsk: 1, eff: { flu: 2 },
    desc: '1回飲むだけのインフルエンザの薬。ウイルスがふえるしくみの別の場所をじゃまする。', fact: '耐性ウイルスが出やすいことが報告されていて、使う相手が考えられている。' },
  { id: 'nmv', ja: 'ニルマトレルビル・リトナビル', brand: 'パキロビッド', cls: '抗コロナウイルス薬', cat: 'vir', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { covid: 2 },
    desc: '新型コロナウイルスがふえるのに必要な酵素をじゃまする飲み薬。', fact: '飲み合わせの悪い薬がとても多い。' },
  { id: 'ens', ja: 'エンシトレルビル', brand: 'ゾコーバ', cls: '抗コロナウイルス薬', cat: 'vir', cost: 1, cd: 1, dmg: 9, gut: 0, rsk: 0, eff: { covid: 2 },
    desc: '日本で作られた新型コロナの飲み薬。', fact: '日本の製薬会社と大学が共同で開発した。' },
  { id: 'rdv', ja: 'レムデシビル', brand: 'ベクルリー', cls: '抗コロナウイルス薬', cat: 'vir', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { covid: 2 },
    desc: 'ウイルスの遺伝子のコピーをじゃまする点滴の薬。', fact: 'エボラ出血熱の治療薬としても研究されていた。' },
  { id: 'acv', ja: 'アシクロビル', brand: 'ゾビラックス', cls: '抗ヘルペスウイルス薬', cat: 'vir', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 0, eff: { vzv: 2, hsv: 2 },
    desc: 'ヘルペスのなかまのウイルスがふえるのをじゃまする。', fact: 'この薬を見つけた研究は、ノーベル賞の対象になった。' },
  { id: 'vacv', ja: 'バラシクロビル', brand: 'バルトレックス', cls: '抗ヘルペスウイルス薬', cat: 'vir', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { vzv: 2, hsv: 2 },
    desc: '体の中でアシクロビルに変わる。吸収がよく、飲む回数が少なくてすむ。', fact: '帯状疱疹はなるべく早く飲みはじめるのが大事。' },
  // ---- 抗真菌薬
  { id: 'tbf', ja: 'テルビナフィン', brand: 'ラミシール', cls: 'アリルアミン系', cat: 'fun', cost: 1, cd: 0, dmg: 7, gut: 0, rsk: 0, eff: { tinea: 2 },
    desc: '水虫(白癬菌)によく効く。ぬり薬と飲み薬がある。', fact: '水虫は見た目が治っても、しばらくぬり続けるのが大事。' },
  { id: 'flcz', ja: 'フルコナゾール', brand: 'ジフルカン', cls: 'アゾール系', cat: 'fun', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 1, eff: { candida: 2 },
    desc: 'カンジダによく効く。アスペルギルスには効かない。', fact: 'カンジダの中にも、効きにくい種類がいる。' },
  { id: 'vrcz', ja: 'ボリコナゾール', brand: 'ブイフェンド', cls: 'アゾール系', cat: 'fun', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 1, eff: { asper: 2, candida: 2 },
    desc: 'アスペルギルスの代表的な薬。', fact: '飲み始めに、見え方がかわる副作用が出ることがある。' },
  { id: 'mcfg', ja: 'ミカファンギン', brand: 'ファンガード', cls: 'キャンディン系', cat: 'fun', cost: 2, cd: 1, dmg: 11, gut: 0, rsk: 1, eff: { candida: 2, asper: 1 },
    desc: 'カビの細胞壁を作れなくする点滴の薬。人の細胞には細胞壁がないので副作用が少ない。', fact: '日本で開発された抗真菌薬。' },
  { id: 'amph', ja: 'アムホテリシンB', cls: 'ポリエン系', cat: 'fun', cost: 3, cd: 2, dmg: 20, gut: 0, rsk: 1, hurt: 3, eff: { candida: 2, asper: 2 },
    desc: 'とても広く強く効くが、腎臓などへの副作用が強い「とっておき」。', fact: '副作用をへらした「リポソーム製剤」も作られた。' },
  // ---- 抗寄生虫薬
  { id: 'pyr', ja: 'ピランテル', brand: 'コンバントリン', cls: '駆虫薬', cat: 'par', cost: 1, cd: 0, dmg: 7, gut: 0, rsk: 0, eff: { pinworm: 2, ascaris: 2 },
    desc: '虫の筋肉をまひさせて、うんちといっしょに出す。', fact: 'ぎょう虫はたまごに効かないので、2週間あけてもう1回飲む。' },
  { id: 'mbz', ja: 'メベンダゾール', cls: '駆虫薬', cat: 'par', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 0, eff: { pinworm: 2, ascaris: 2 },
    desc: '虫が栄養をとりこめなくする。', fact: 'ぎょう虫や回虫など、いろいろな線虫に効く。' },
  { id: 'ivm', ja: 'イベルメクチン', brand: 'ストロメクトール', cls: '駆虫薬', cat: 'par', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { scabies: 2 },
    desc: 'ヒゼンダニ(疥癬)や糞線虫に効く飲み薬。', fact: '大村智さんがもとになる物質を見つけ、2015年にノーベル賞を受けた。' },
  { id: 'phen', ja: 'フェノトリン', brand: 'スミスリン', cls: 'ぬり薬(殺虫成分)', cat: 'par', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 0, eff: { scabies: 2 },
    desc: '疥癬のぬり薬。首から下の全身にぬる。', fact: 'シラミ用のシャンプーにも同じなかまの成分が使われる。' },
  { id: 'al', ja: 'アルテメテル・ルメファントリン', brand: 'リアメット', cls: '抗マラリア薬', cat: 'par', cost: 2, cd: 1, dmg: 13, gut: 0, rsk: 0, eff: { malaria: 2 },
    desc: 'ヨモギのなかまからとれるアルテミシニンを使ったマラリアの薬。', fact: 'アルテミシニンを見つけた屠呦呦さんは、2015年にノーベル賞を受けた。' },
  { id: 'apg', ja: 'アトバコン・プログアニル', brand: 'マラロン', cls: '抗マラリア薬', cat: 'par', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { malaria: 2 },
    desc: 'マラリアの治療と予防に使う。', fact: 'マラリアのある国へ行く時は、予防のために飲むことがある。' },
  // ---- 体をささえる(どの病原体にもダメージはないが、患者を守る)
  { id: 'ors', ja: '経口補水液', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 6, gut: 0, rsk: 0, eff: {},
    desc: '水分と塩分をすばやく補う。げり・はくときにいちばん大事。患者の体力を回復する。', fact: 'ふつうの水やお茶より、体にすばやく吸収されるように作られている。' },
  { id: 'apap', ja: 'アセトアミノフェン', brand: 'カロナール', cls: '解熱鎮痛薬', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 4, guard: 3, gut: 0, rsk: 0, eff: {},
    desc: '熱やいたみをやわらげて、患者を楽にする(病原体はやっつけない)。次のこうげきを少しへらす。', fact: '子どもの熱にもよく使われる薬。' },
  { id: 'endo', ja: '内視鏡', cls: '処置', cat: 'sup', cost: 2, cd: 1, dmg: 0, gut: 0, rsk: 0, eff: { anisakis: 2 }, fixed: 99,
    desc: '胃カメラ。アニサキスを直接つまんで取り出す。', fact: '薬ではなく、取り出すことで治す病気もある。' },
];
const D = Object.fromEntries(DRUGS.map(d => [d.id, d]));
const DCAT = { abx: '抗菌薬', vir: '抗ウイルス薬', fun: '抗真菌薬', par: '抗寄生虫薬', sup: '体をささえる' };

// 効かない理由(画面に1行で出す)
function whyNot(d, p) {
  const want = { abx: 'bac', vir: 'vir', fun: 'fun', par: 'par' }[d.cat];
  if (d.cat === 'sup') return d.heal || d.guard ? `${d.ja}は 体をささえる薬。病原体はやっつけない` : `${d.ja}は ${p.ja}には つかえない`;
  if (want && want !== p.cat) return `${DCAT[d.cat]}は ${CAT[want].ja}の薬。${CAT[p.cat].ja}には 効かない`;
  if (p.noDrug) return `${p.ja}に 効く薬は ない。内視鏡で 取り出そう`;
  if (p.self) return `${p.ja}に 効く特効薬は ない。体をささえて、めんえきを たすけよう`;
  if (d.cat === 'vir') return `${d.ja}は べつのウイルスの薬。${p.ja}には 効かない`;
  if (d.cat === 'fun' && p.id === 'pcp') return 'ニューモシスチスは 真菌なのに、ふつうの 抗真菌薬が 効かない。ST合剤を使う';
  if (d.cat === 'fun') return p.id === 'asper' ? `${d.ja}は アスペルギルスに 効かない` : `${d.ja}は ${p.ja}に 効かない`;
  if (d.cat === 'par') return `${d.ja}は べつの寄生虫の薬`;
  if ((p.id === 'listeria' || p.id === 'entero') && /セフェム/.test(d.cls)) return `${p.ja}には セフェム系が 効かない(アンピシリンなどを使う)`;
  if ((p.id === 'legion' || p.id === 'scrub') && /ペニシリン|セフェム|カルバペネム/.test(d.cls)) return `${p.ja}は 細胞の中に かくれるので、細胞壁をこわす薬は とどかない`;
  if (p.id === 'vre' && d.id === 'vcm') return 'VREは バンコマイシンが 効かなくなった 腸球菌';
  if (p.id === 'cre') return 'CREは カルバペネム系まで 効かない。とっておきの薬が 必要';
  if (p.id === 'myco' && /ペニシリン|セフェム|カルバペネム|グリコペプチド/.test(d.cls)) return 'マイコプラズマは 細胞壁が ない。細胞壁をこわす薬は 効かない';
  if (p.id === 'staph' && d.id === 'pen') return '黄色ブドウ球菌の多くは ペニシリンをこわす酵素を もつ';
  if (p.id === 'mrsa') return 'MRSAには ペニシリン系・セフェム系・カルバペネム系が 効かない';
  if (p.id === 'esbl') return 'ESBLという酵素で セフェム系を こわしてしまう';
  if (p.id === 'mdrp') return '多剤耐性緑膿菌は いつもの薬が ほとんど 効かない';
  if (p.gram === '-' && ['vcm', 'lzd', 'cez', 'pen'].includes(d.id)) return `${d.ja}は グラム陰性菌には とどかない(効く範囲の外)`;
  if (p.id === 'pseudo') return '緑膿菌は もともと 効かない薬が 多い';
  if (p.id === 'tb') return '結核菌には 専用の薬(抗結核薬)を 組み合わせて使う';
  if (p.id === 'cdiff') return 'ディフィシル菌には バンコマイシン・フィダキソマイシン・メトロニダゾールを使う';
  return `${d.ja}は ${p.ja}に 効く範囲(スペクトラム)の外`;
}

// 患者
const PATIENTS = {
  kid: { ja: 'のどがいたい子ども', short: 'こども', hp: 30, look: 'kid' },
  dad: { ja: '旅行から帰ったお父さん', short: 'お父さん', hp: 42, look: 'dad' },
  gpa: { ja: '入院中のおじいちゃん', short: 'おじいちゃん', hp: 44, look: 'gpa' },
};

// ステージ。enemies: ふつうのバトルの候補 / elites: 強敵 / boss: ボス
// test: 検査でわかること(name=名前まで / cat=分類だけ / gram=分類+グラム染色)
const STAGES = [
  { n: 1, ja: 'ステージ1 ほいくえん・学校', patient: 'kid', bg: '#16324a', test: 'name', retry: true,
    enemies: ['strep', 'flu', 'adeno', 'noro', 'pinworm', 'tinea', 'pneumo', 'rsv'], elites: ['myco', 'staph', 'vzv'], boss: ['flu_boss'],
    intro: '保育園や学校で はやる病気。分類を思い出して、合う薬を えらぼう。' },
  { n: 2, ja: 'ステージ2 旅行から帰ったお父さん', patient: 'dad', bg: '#3a2a16', test: 'cat',
    enemies: ['campy', 'noro', 'giardia', 'ascaris', 'ecoli', 'hsv', 'anisakis', 'covid', 'candida'], elites: ['pylori', 'myco', 'cdiff'], boss: ['malaria'],
    intro: '旅行先の食べ物や生水、蚊に注意。検査では「分類」まで わかる。' },
  { n: 3, ja: 'ステージ3 入院中のおじいちゃん', patient: 'gpa', bg: '#2a1838', test: 'gram',
    enemies: ['staph', 'ecoli', 'pseudo', 'candida', 'pneumo', 'vzv', 'covid', 'cdiff', 'scabies'], elites: ['mrsa', 'esbl', 'tb', 'asper'], boss: ['mdrp'],
    intro: '病院の中の感染症。耐性菌に気をつけて、せまい薬から えらぼう。検査は「グラム染色」。' },
];
// ステージ1のボスは強いインフルエンザ(大流行)
PATHO.push({ ...P.flu, id: 'flu_boss', ja: 'インフルエンザ大流行', hp: 46, pat: [['atk', 6], ['grow', 6], ['atk', 7], ['toxin', 0], ['atk', 5]], boss: true, stage: [1], base: 'flu',
  fact: '学校で一気に広がった インフルエンザ。タミフルなどで たたかおう。ワクチンや手洗いで 広がりを ふせげる。' });
P.flu_boss = PATHO[PATHO.length - 1];
// ボス版は もとの病原体と同じ薬が効く
for (const d of DRUGS) if (d.eff.flu) d.eff.flu_boss = d.eff.flu;

// 耐性菌へのかわり先(耐性メーターがたまると、ふつうの菌が耐性菌になって出てくる)
const RESIST_TO = { staph: 'mrsa', ecoli: 'esbl', pseudo: 'mdrp' };

// レリック(そのステージのあいだずっと効く)
const RELICS = [
  { id: 'loupe', em: '🔍', ja: '名医のルーペ', desc: 'バトルごとに 1回、ヒントが タダで使える' },
  { id: 'soap', em: '🧼', ja: '手洗いせっけん', desc: 'バトルの はじめに 病原体の体力が 10% へる' },
  { id: 'mask', em: '😷', ja: 'マスク', desc: 'のど・肺の病原体の こうげきが 1 へる' },
  { id: 'fluvac', em: '💉', ja: 'インフルエンザワクチン', desc: 'インフルエンザの 体力が 半分で 出てくる' },
  { id: 'pcv', em: '💉', ja: '肺炎球菌ワクチン', desc: '肺炎球菌の 体力が 半分で 出てくる' },
  { id: 'yogurt', em: '🥛', ja: 'ヨーグルト', desc: 'バトルのあと 善玉菌が さらに +1' },
  { id: 'coat', em: '🥼', ja: 'ベテランの白衣', desc: '処方ポイントが 毎ターン +1', rare: true },
  { id: 'steth', em: '🩺', ja: '聴診器', desc: 'バトルの はじめに 病原体の 分類が わかる' },
  { id: 'scope', em: '🔬', ja: '顕微鏡', desc: '検査の 処方ポイントが 0 になる' },
  { id: 'kit', em: '🧰', ja: '救急箱', desc: '休けいで 回復する量が 1.5倍' },
  { id: 'ast', em: '🎖️', ja: '適正使用バッジ', desc: '善玉菌を へらさない薬(0〜1)の ダメージ +3' },
  { id: 'chart', em: '📋', ja: 'カルテ', desc: '一度 たおした病原体は、はじめから 名前が わかる' },
  { id: 'thermo', em: '🌡️', ja: '体温計', desc: 'バトルの はじめに 患者の体力 +3' },
  { id: 'gloves', em: '🧤', ja: '手ぶくろ', desc: '「かくれる」で ふせがれる量が 半分' },
];
const RM = Object.fromEntries(RELICS.map(r => [r.id, r]));

// アイテム(使うとなくなる。3こまで)
const ITEMS = [
  { id: 'hint', em: '💡', ja: 'ヒント', desc: '病原体の 名前が わかる', price: 25 },
  { id: 'probio', em: '🫙', ja: 'プロバイオティクス', desc: '善玉菌 +4', price: 30 },
  { id: 'drink', em: '🥤', ja: '栄養ドリンク', desc: '患者の体力 +10', price: 30 },
  { id: 'rapid', em: '🧪', ja: '迅速検査キット', desc: '処方ポイントを使わずに 検査できる', price: 20 },
];
const IT = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// イベント(❓のマス)。choices: [ことば, 結果] 結果は main.js の eventApply で処理
const EVENTS = [
  { id: 'stop', ja: '抗菌薬、とちゅうでやめる?', text: '患者さんが言った。「薬をもらったけど、元気になったから もうやめていい?」',
    choices: [['最後まで飲もうね、と伝える', { resist: -3, msg: '決められた日数を飲みきると、生き残った菌が 耐性をもつのを ふせげる。耐性メーター -3' }],
      ['じゃあ やめていいよ', { resist: 4, coins: 15, msg: '中途半端に やめると、しぶとい菌だけ 生き残って 耐性菌が 生まれやすい。耐性メーター +4' }]] },
  { id: 'cold', ja: 'かぜに抗菌薬?', text: '「かぜを はやく治したいから、抗菌薬を ください」とたのまれた。',
    choices: [['ウイルスには効かないと説明する', { item: 'hint', msg: 'かぜの ほとんどは ウイルス。抗菌薬は 効かない。ヒントを 1つ もらった' }],
      ['とりあえず出す', { resist: 3, gut: -2, coins: 10, msg: '効かない薬を 飲むと、善玉菌が へって 耐性菌も ふえる。耐性メーター +3、善玉菌 -2' }]] },
  { id: 'water', ja: '旅行先の生水', text: '暑い国の屋台で、氷の入った ジュースを すすめられた。',
    choices: [['ことわって、ペットボトルの水を買う', { coins: -5, heal: 4, msg: '生水や氷から、げりの菌や原虫が うつることがある。体力 +4' }],
      ['ありがたく飲む', { fight: 'giardia', msg: 'おなかが ゴロゴロ…… ジアルジアだ!' }]] },
  { id: 'fish', ja: 'とれたての魚', text: 'つったばかりの サバを、その場で 刺身にして 食べようと さそわれた。',
    choices: [['よく加熱して 食べる', { heal: 5, msg: 'アニサキスは 加熱や 冷凍(-20℃で24時間以上)で 死ぬ。体力 +5' }],
      ['生で 食べる', { fight: 'anisakis', msg: '数時間後、胃が はげしく いたい……!' }]] },
  { id: 'vaccine', ja: 'ワクチンの日', text: '病院で ワクチンを うけられる日だ。',
    choices: [['インフルエンザワクチン(20コイン)', { coins: -20, relic: 'fluvac', msg: 'ワクチンで、かかりにくく・重くなりにくくなる' }],
      ['肺炎球菌ワクチン(20コイン)', { coins: -20, relic: 'pcv', msg: '肺炎球菌ワクチンは 子どもと お年よりに すすめられている' }],
      ['今日は やめておく', { msg: 'またの きかいに' }]] },
  { id: 'fleming', ja: 'フレミングの話', text: '古い研究室で、アオカビの はえた ペトリ皿を 見つけた。カビの まわりだけ、菌が 生えていない……',
    choices: [['よく観察する', { upgrade: 'pen', msg: 'これが ペニシリン発見の きっかけ(1928年)。ペニシリンが 強くなった!' }],
      ['そうじする', { coins: 10, msg: 'きれいになった。10コイン' }]] },
  { id: 'wash', ja: '手洗い教室', text: '子どもたちに 手洗いを 教えてほしいと たのまれた。',
    choices: [['ていねいに 教える', { relic: 'soap', msg: '石けんで 30秒、指の間・つめ・手首まで。手洗いせっけんを 手に入れた!' }],
      ['いそがしいので ことわる', { coins: 15, msg: '15コイン' }]] },
  { id: 'yogurt', ja: 'おなかの話', text: '「抗菌薬を飲むと、おなかが ゆるくなるのは なぜ?」と聞かれた。',
    choices: [['善玉菌の話をする', { gut: 4, msg: '抗菌薬は おなかの いい菌も へらす。だから ねらいの せまい薬が 大事。善玉菌 +4' }],
      ['わからない', { coins: 5, msg: '5コイン' }]] },
  { id: 'nurse', ja: 'ベテラン看護師', text: 'ベテランの看護師さんが、検査のコツを 教えてくれるという。',
    choices: [['教えてもらう', { relic: 'scope', msg: '顕微鏡の 使い方を おそわった!' }],
      ['休ませてもらう', { heal: 8, msg: '体力 +8' }]] },
  { id: 'lab', ja: '研究室', text: '製薬会社の研究室に 招かれた。新しい薬の 研究を 手伝えるらしい。',
    choices: [['研究を 手伝う(体力 -6)', { hurt: 6, upgradeAny: true, msg: '薬を 1つ 強くできる!' }],
      ['見学だけ', { coins: 10, msg: '10コイン' }]] },
];
