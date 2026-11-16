// ---------- やっつけ!びょうげんたい 本体
const $ = (q, r = document) => r.querySelector(q);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const app = document.getElementById('app');
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- 保存
const SAVE_KEY = 'byougen-save-v1';
const S_DEF = { v: 1, t: 0, id: null, cloudAt: 0, look: 'boy', learned: {}, seen: {}, kills: {}, used: {}, clear: {}, best: {}, ach: {}, stat: {}, run: null, tut: 0, tut2: 0, newAch: 0, endless: { best: 0, runs: 0 } };
const RANKS = ['C', 'B', 'A', 'S'];
let S = (() => { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (d) return Object.assign(JSON.parse(JSON.stringify(S_DEF)), d); } catch (e) { /* 新しく始める */ } return JSON.parse(JSON.stringify(S_DEF)); })();
function save() { S.t = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 容量不足でも遊べる */ } if (typeof CLOUD !== 'undefined') CLOUD.queue(); }
const st = (k, n = 1) => { S.stat[k] = (S.stat[k] || 0) + n; };

function toast(t, ms = 2200) { let box = document.getElementById('toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); } const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = t; box.appendChild(d); setTimeout(() => d.classList.add('out'), ms); setTimeout(() => d.remove(), ms + 400); }
function screen(html, cls = 'fitScr', keep) { if (keep) { app.className = cls; app.innerHTML = html; return; } app.className = cls; app.innerHTML = html; app.scrollTop = 0; window.scrollTo(0, 0); }
function topBar(title, back, opt = {}) {
  return `<div class="top">${back ? `<button class="back" id="${opt.confirm ? 'quit' : 'back'}" ${opt.confirm ? '' : 'data-noconfirm'}>← ${opt.label || 'もどる'}</button>` : '<span></span>'}<h2>${title}</h2><span></span></div>`;
}
function bindBack(fn) { const b = $('#back') || $('#quit'); if (b) b.onclick = () => { SE.play('select'); fn(); }; }
function modal(html, btns) {
  return new Promise(res => {
    const d = document.createElement('div'); d.className = 'ov';
    d.innerHTML = `<div class="box">${html}<div class="acts">${btns.map((b, i) => `<button class="btn ${i === 0 ? 'main' : ''}" data-i="${i}">${b}</button>`).join('')}</div></div>`;
    document.body.appendChild(d);
    d.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { d.remove(); res(+b.dataset.i); });
  });
}
const ask = async (html, yes) => (await modal(html, [yes, 'やめる'])) === 0;
const learned = id => !!S.learned[id];
function learn(id, silent) { if (S.learned[id]) return false; S.learned[id] = Date.now(); if (!silent) st('learn'); return true; }

// ---------- じっせき
const ACH = [];
const A = (id, em, ja, desc, test) => ACH.push({ id, em, ja, desc, test });
A('tut', '🎓', 'けんしゅう 修了', 'チュートリアルを さいごまで やる', () => S.tut >= 99);
A('tut2', '🔬', '検査けんしゅう 修了', '問診・グラム染色・迅速検査・培養の 練習を さいごまで やる', () => S.tut2 >= 99);
A('deesc', '🎯', 'しぼりこみ上手', '広い薬から ねらいの せまい薬に 5回 切りかえる', () => (S.stat.deesc || 0) >= 5);
A('win1', '⚔️', 'はじめての 治療', 'バトルに 1回 勝つ', () => (S.stat.win || 0) >= 1);
A('win10', '⚔️', '10人を すくった', 'バトルに 10回 勝つ', () => (S.stat.win || 0) >= 10);
A('win50', '🏥', '町の お医者さん', 'バトルに 50回 勝つ', () => (S.stat.win || 0) >= 50);
A('win150', '👑', '名医', 'バトルに 150回 勝つ', () => (S.stat.win || 0) >= 150);
A('s1', '🏫', 'ステージ1 クリア', 'ほいくえん・学校を クリア', () => !!S.clear[1]);
A('s2', '✈️', 'ステージ2 クリア', '旅行から帰ったお父さんを すくう', () => !!S.clear[2]);
A('s3', '🏨', 'ステージ3 クリア', '入院中のおじいちゃんを すくう', () => !!S.clear[3]);
A('asc1', '🔥', 'むずかしさ1', 'どれかのステージを むずかしさ1で クリア', () => Object.values(S.clear).some(v => v >= 2));
A('asc3', '🔥', 'むずかしさ3', 'どれかのステージを むずかしさ3で クリア', () => Object.values(S.clear).some(v => v >= 4));
A('asc5', '🌋', 'むずかしさ5', 'どれかのステージを むずかしさ5で クリア', () => Object.values(S.clear).some(v => v >= 6));
A('z10', '📕', '図鑑 10', '病原体を 10種類 たおす', () => Object.keys(S.kills).length >= 10);
A('z20', '📗', '図鑑 20', '病原体を 20種類 たおす', () => Object.keys(S.kills).length >= 20);
A('zall', '📚', '病原体はかせ', '病原体を ぜんぶ たおす', () => PATHO.every(p => p.base || S.kills[p.id]));
A('d15', '💊', '薬 15こ', '薬を 15こ おぼえる', () => Object.keys(S.learned).length >= 15);
A('dall', '🧰', '薬はかせ', '薬を ぜんぶ おぼえる', () => DRUGS.every(d => S.learned[d.id]));
A('mrsa', '🛡️', 'MRSAに 勝つ', 'MRSAを たおす', () => !!S.kills.mrsa);
A('mdrp', '🏆', '最強の耐性菌に 勝つ', '多剤耐性緑膿菌を たおす', () => !!S.kills.mdrp);
A('tb', '🤝', '併用の ちから', '結核菌を たおす(薬を組み合わせる)', () => !!S.kills.tb);
A('pylori', '🍽️', '除菌せいこう', 'ピロリ菌を たおす', () => !!S.kills.pylori);
A('anisakis', '🎣', 'つまみ出し', 'アニサキスを 内視鏡で とり出す', () => !!S.kills.anisakis);
A('malaria', '🦟', 'マラリアに 勝つ', 'マラリア原虫を たおす', () => !!S.kills.malaria);
A('narrow', '🎯', 'ねらいうち', 'メロペネムを 使わずに ステージ2か3を クリア', () => !!S.stat.narrowClear);
A('gut', '🥛', 'おなか 名人', '善玉菌を 一度も 0にせず ステージを クリア', () => !!S.stat.gutClear);
A('lowres', '🌱', '耐性を ふやさない', '耐性メーター 5以下で ステージを クリア', () => !!S.stat.lowResClear);
A('nohint', '🧠', 'ヒントなし', 'ヒントを 使わずに ステージを クリア', () => !!S.stat.noHintClear);
A('test30', '🔬', '検査の たつじん', '検査を 30回 する', () => (S.stat.test || 0) >= 30);
A('self5', '💧', 'めんえきを 信じる', '特効薬のない ウイルスを 抗菌薬を使わずに 5回 のりきる', () => (S.stat.selfOk || 0) >= 5);
A('perfect', '✨', 'ノーダメージ', '患者が 1も ダメージを うけずに バトルに勝つ', () => (S.stat.perfect || 0) >= 1);
A('right20', '✅', 'まちがえない', '1回の ステージで 効かない薬を 1回も 使わずに クリア', () => !!S.stat.noWrongClear);
A('event15', '❓', 'いろんな 出来事', 'イベントを 15回 見る', () => (S.stat.event || 0) >= 15);
A('rankS', '🌟', '名医ランクS', 'ステージを ランクSで クリア(患者の体力・まちがい・耐性・ヒント・メロペネムで 決まる)', () => (S.stat.rankS || 0) >= 1);
A('e1', '♾️', 'むげん病院へ', 'むげん病院で 1幕 クリア', () => (S.endless.best || 0) >= 1);
A('e3', '♾️', '3幕 とっぱ', 'むげん病院で 3幕 クリア', () => (S.endless.best || 0) >= 3);
A('e5', '💠', '5幕 とっぱ', 'むげん病院で 5幕 クリア', () => (S.endless.best || 0) >= 5);
A('e10', '👑', '伝説の 名医', 'むげん病院で 10幕 クリア', () => (S.endless.best || 0) >= 10);
A('scn', '🗺️', 'どこでも 名医', 'むげん病院の 派遣先を ぜんぶ クリア', () => SCN.every(s => S.endless.scn && S.endless.scn[s.id]));
A('best30', '✨', 'ばっちり 名医', 'こうか ばつぐんを 30回 出す(相手に ぴったりの 薬)', () => (S.stat.best || 0) >= 30);
A('mitate10', '🩺', '見立て名人', '問診だけで 当たりを つけて 治療し、10回 正体を 当てる', () => (S.stat.mitate || 0) >= 10);
A('apap5', '🌡️', '解熱剤の えらび方', 'インフルエンザや 水ぼうそうの時に アセトアミノフェンを 5回 えらぶ', () => (S.stat.apapOk || 0) >= 5);
A('severe5', '🚑', '救急の たつじん', '重症化に 5回 正しく 対処する', () => (S.stat.severeOk || 0) >= 5);
A('shop10', '🏪', 'お買いもの', 'ショップで 10回 買う', () => (S.stat.buy || 0) >= 10);
function checkAch() {
  const got = [];
  for (const a of ACH) if (!S.ach[a.id] && a.test()) { S.ach[a.id] = Date.now(); S.newAch = (S.newAch || 0) + 1; got.push(a); }
  if (got.length) { SFX.play('ach'); toast(got.length <= 2 ? got.map(a => `🏅 じっせき「${a.ja}」`).join('<br>') : `🏅 じっせきを ${got.length}こ ゲット! <span class="note">タイトルの「じっせき」で 見られるよ</span>`, 2600); }
  save();
}

// ---------- 説明書(イラストつき)
function catCard(c, eg) { const p = P[eg]; return `<div class="cat" style="border-color:${CAT[c].col}">${ART.patho(p, 3, 64)}<b style="color:${CAT[c].col}">${CAT[c].ja}</b><span>${CAT[c].desc}</span><span class="note">れい: ${p.ja}</span></div>`; }
const MANUAL = {
  intro: [
    { t: 'きみは 新人の お医者さん!', b: `<div class="row c">${ART.doctor(S.look, 90)}${ART.patient('kid', true, 80)}</div><p>病気の原因になる 小さな「<b>病原体</b>」を、<b>薬</b>で やっつけて 患者さんを 助けよう。</p><p class="note">病原体は 本物の名前、薬も 本物の名前だよ。</p>` },
    { t: '病原体は 大きく 4つ!', b: `<div class="cats">${catCard('bac', 'strep')}${catCard('vir', 'flu')}${catCard('fun', 'tinea')}${catCard('par', 'pinworm')}</div>` },
    { t: '病原体によって 効く薬が ちがう', b: `<div class="map4"><div><b style="color:${CAT.bac.col}">細菌</b> → 抗菌薬</div><div><b style="color:${CAT.vir.col}">ウイルス</b> → 抗ウイルス薬</div><div><b style="color:${CAT.fun.col}">真菌</b> → 抗真菌薬</div><div><b style="color:${CAT.par.col}">寄生虫</b> → 抗寄生虫薬</div></div><p>ちがう分類の薬は <b>効かない</b>。たとえば「抗菌薬」は ウイルスには 効かない。</p>` },
    { t: 'バトルの 画面', b: `<div class="mini"><div class="mtop">❤️ 患者の体力 ・ 🥛 善玉菌 ・ ⚠️ 耐性メーター</div><div class="mmid"><span>${ART.doctor(S.look, 44)}👨‍⚕️ きみと 患者</span><span>病原体 ${ART.patho(P.strep, 3, 44)}</span></div><div class="mbot">💊 薬だな(自分のターンに 出てくる)</div></div><p>薬を <b>タップ</b>で えらんで「つかう」。<b>長おし</b>で くわしい説明が 見られる。</p><p>右の病原体の上の マークは、<b>次に してくること</b>。⚔️は こうげき。</p><p>薬は 1回 使うと <b>3ターン 効きつづける</b>。同じ薬を 何回も 使う 必要は ない。患者の <b>めんえき</b>も 毎ターン 病原体を こうげきする。体力と 善玉菌が 多いほど 強いよ。</p>` },
    { t: '最初の薬を 2つ もらった!', b: `<div class="row c"><div class="drugcard big" style="--c:${CAT.bac.col}"><b>ペニシリン</b><span>抗菌薬</span></div><div class="drugcard big" style="--c:${CAT.vir.col}"><b>オセルタミビル</b><span>タミフル・抗ウイルス薬</span></div></div><p>ペニシリンは 細菌の薬、タミフルは インフルエンザウイルスの薬。</p><p class="note">※ ゲームの中の話だよ。本当の治療は お医者さんが 決めるよ。</p>` },
  ],
  virus: [{ t: 'こんどは ウイルス!', b: `<div class="row c">${ART.patho(P.flu, 3, 90)}</div><p>インフルエンザは <b>ウイルス</b>。ウイルスには <b>抗ウイルス薬</b>(タミフルなど)を 使おう。</p><p>ペニシリン(抗菌薬)は ウイルスには 効かないよ。</p>` }],
  test: [{ t: '正体が わからない時は「検査」', b: `<div class="row c">${ART.patho(P.strep, 0, 80)}<span style="font-size:28px">→🔬→</span>${ART.patho(P.strep, 3, 80)}</div><p>本当の病気では、はじめから 病原体の名前は わからない。<b>どこが</b>・<b>どんな症状か</b> を見て考えよう。</p><p>わからない時は <b>🔬検査</b>。<b>問診</b>(話を聞く)・<b>グラム染色</b>(細菌の形)・<b>迅速検査</b>(決まった相手だけ すぐ わかる)・<b>培養・PCR</b>(じっくり)を 組み合わせよう。</p><p>検査で 確かめなくても、<b>問診から 見立てて 治療を 始めても いい</b>。当たれば 正体が わかる。相手に いちばん 合う薬(<b>第一選択</b>)を 出すと「<b>こうか ばつぐん</b>」! 効く範囲の 薬なら ふつうに 効くよ。</p>` }],
  fungus: [{ t: 'カビの なかま=真菌', b: `<div class="row c">${ART.patho(P.tinea, 3, 90)}</div><p>水虫の原因「<b>白癬菌</b>」は 真菌(カビ)。<b>抗真菌薬</b>の <b>テルビナフィン</b>を おぼえた!</p><p class="note">抗菌薬は 細菌の薬。カビには 効かない。</p>` }],
  parasite: [{ t: '体にすみつく 寄生虫', b: `<div class="row c">${ART.patho(P.pinworm, 3, 90)}</div><p>おしりが かゆくなる「<b>ぎょう虫</b>」。<b>抗寄生虫薬</b>の <b>ピランテル</b>を おぼえた!</p><p class="note">手洗いと、つめを 短く切るのが 予防になる。</p>` }],
  gut: [
    { t: '善玉菌と 耐性菌', b: `<p>おなかには、体を守る <b>善玉菌</b>が たくさん いる。<b>抗菌薬</b>は 悪い菌だけでなく 善玉菌も へらしてしまう。</p><div class="meter"><span>🥛 善玉菌</span><i style="width:80%"></i></div><p>広く効く強い薬(<b>セフトリアキソン</b>など)ほど 善玉菌を へらす。0になると げりに なったり、べつの菌が ふえたりする。</p>` },
    { t: '耐性メーター', b: `<div class="meter warn"><span>⚠️ 耐性</span><i style="width:45%"></i></div><p>抗菌薬を たくさん使ったり、効かない相手に 使ったりすると <b>耐性メーター</b>が たまる。たまると、薬が 効かない「<b>耐性菌</b>」が 出てくるように なる。</p><p><b>相手に 合った、ねらいの せまい薬</b>を えらぶのが 名医への道!</p>` },
    { t: '特効薬の ない ウイルス', b: `<div class="row c">${ART.patho(P.adeno, 3, 80)}</div><p>かぜの ウイルスの 多くは、<b>効く薬が ない</b>。でも 体の「<b>めんえき</b>」が 何日かで やっつけてくれる。</p><p>そんな時は <b>経口補水液</b>で 体をささえて、のりきろう。<b>抗菌薬を 使っても 意味がない</b>よ。</p><p>セフトリアキソンと 経口補水液を おぼえた!</p>` },
  ],
  done: [{ t: 'けんしゅう 修了!', b: `<div class="row c">${ART.doctor(S.look, 100)}</div><p>これで きみも 一人前の お医者さん。<b>ステージ1</b>に 進もう!</p><p>はじめて出会う病原体は、正体と 効く薬を 教えてもらえる。<b>2回目からは 自分で 思い出して</b> たたかおう。</p>` }],
};
async function manual(key, after) {
  const pages = MANUAL[key]; let i = 0;
  const draw = () => {
    const pg = typeof pages[i] === 'function' ? pages[i]() : pages[i];
    screen(`${topBar('せつめいしょ', after)}<div class="page"><h3>${pg.t}</h3>${pg.b}</div>
      <div class="pnav"><button class="btn" id="pv" ${i ? '' : 'disabled'}>← まえ</button><span>${i + 1} / ${pages.length}</span><button class="btn main" id="nx">${i < pages.length - 1 ? 'つぎ →' : 'OK!'}</button></div>`, 'manual');
    bindBack(after);
    $('#pv').onclick = () => { SE.play('select'); i--; draw(); };
    $('#nx').onclick = () => { SE.play('ok'); if (i < pages.length - 1) { i++; draw(); } else after(); };
  };
  draw();
}
// 説明書の まとめ版(タイトルから いつでも読める)
function manualAll() { MANUAL.all = [...MANUAL.intro.slice(0, 4), ...MANUAL.test, ...MANUAL.gut]; manual('all', title); }

// ---------- タイトル
function title() {
  S.run && S.run.stage === 0 && (S.run = null);
  screen(`<div class="title"><div class="logo"><span>${ART.patho(P.flu, 3, 70)}</span><h1>やっつけ!<br>びょうげんたい</h1><span>${ART.patho(P.strep, 3, 70)}</span></div>
    <div class="row c">${ART.doctor(S.look, 80)}</div>
    ${S.run ? `<button class="btn main big" id="cont">▶ つづきから(${S.run.stage === 9 ? `むげん病院 ${S.run.act}幕` : STAGES[S.run.stage - 1].ja.split(' ')[0]})</button>` : ''}
    ${S.tut < 99 ? `<button class="btn main big" id="tut">🎓 けんしゅうを はじめる</button>` : `<button class="btn ${S.run ? '' : 'main'} big" id="play">🏥 ステージを えらぶ</button>`}
    ${S.clear[3] ? `<button class="btn big endless" id="endless">♾️ むげん病院${S.endless && S.endless.best ? ` <span class="note">さいこう ${S.endless.best}幕</span>` : ''}</button>` : S.tut >= 99 ? '<p class="note c">🔒 ステージ3まで クリアすると「♾️ むげん病院」が 解放</p>' : ''}
    ${S.tut >= 99 ? `<button class="btn ${S.tut2 >= 99 ? '' : 'main'}" id="tut2">🔬 検査けんしゅう${S.tut2 >= 99 ? ' ✓' : '(グラム染色など)'}</button>` : ''}
    <div class="grid2"><button class="btn" id="zukan">📚 図鑑</button><button class="btn" id="ach">🏅 じっせき${S.newAch ? ` <i class="dot">${S.newAch}</i>` : ''}</button><button class="btn" id="man">📖 せつめいしょ</button><button class="btn" id="bookbtn">📕 攻略本</button><button class="btn" id="look">👩‍⚕️ 見た目</button></div>
    ${S.tut < 99 && S.tut > 0 ? '<button class="btn" id="tutr">🎓 けんしゅうを はじめから</button>' : ''}
    <p class="note c"><a href="#" id="keep">${S.id ? '☁️ ID「' + esc(S.id) + '」で ほぞん中' : '💾 きろくを ネットにも ほぞんする'}</a> ・ <a href="#" id="upd">🔄 さいしんに こうしん</a> ・ <span data-furi-slot></span></p>
    <p class="note c tiny">ゲームの中の話です。本当の治療は お医者さんが 決めます。</p></div>`, 'titleScr');
  const on = (id, f) => { const e = $('#' + id); if (e) e.onclick = ev => { ev.preventDefault(); SE.play('select'); f(); }; };
  on('cont', resumeRun); on('tut2', () => lessons(S.tut2 >= 99 ? 0 : S.tut2 || 0)); on('endless', endlessStart); on('tut', () => tutorial(S.tut || 0)); on('tutr', () => tutorial(0)); on('play', stageSelect);
  on('zukan', () => zukan('p')); on('ach', achScreen); on('man', manualAll); on('look', lookScreen); on('bookbtn', () => BOOK.open()); on('keep', keepScreen); on('upd', appUpdate);
}
function lookScreen() {
  screen(`${topBar('お医者さんの 見た目', title)}<div class="looks">${ART.LOOKS.map(L => { const ok = !L.need || S.ach[L.need]; return `<button class="look ${S.look === L.id ? 'on' : ''}" data-l="${L.id}" ${ok ? '' : 'disabled'}>${ART.doctor(L.id, 70)}<b>${ok ? L.ja : '🔒'}</b>${ok ? '' : `<span class="note">${ACH.find(a => a.id === L.need).ja}で 解放</span>`}</button>`; }).join('')}</div>`);
  bindBack(title);
  app.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { SE.play('ok'); S.look = b.dataset.l; save(); lookScreen(); });
}

// ---------- チュートリアル(段階式)
const TUT = [
  { man: 'intro', give: ['pen', 'osel'], foe: 'strep', known: 3, tip: '溶連菌は 細菌。細菌には 抗菌薬の「ペニシリン」! ためしに タミフルも 使ってみると…?' },
  { man: 'virus', foe: 'flu', known: 3, tip: 'インフルエンザは ウイルス。こんどは タミフル(オセルタミビル)の 出番!' },
  { man: 'test', foe: ['strep', 'flu'], known: 0, tip: '正体が わからない。まず 🔬検査 を してみよう。' },
  { man: 'fungus', give: ['tbf'], foe: 'tinea', known: 3, tip: '白癬菌は 真菌(カビ)。抗真菌薬の テルビナフィンを 使おう。' },
  { man: 'parasite', give: ['pyr'], foe: 'pinworm', known: 3, tip: 'ぎょう虫は 寄生虫。ピランテルで やっつけよう。' },
  { man: 'gut', give: ['ctrx', 'ors'], foe: 'adeno', known: 3, tip: 'アデノウイルスに 効く薬は ない。経口補水液で 体をささえて、めんえきを たすけよう。' },
];
function tutorial(step) {
  if (step === 0) { S.learned = Object.assign({}, S.learned); }
  if (step >= TUT.length) { S.tut = 99; save(); checkAch(); return manual('done', title); }
  const T = TUT[step];
  S.tut = step; save();
  manual(T.man, () => {
    (T.give || []).forEach(id => learn(id, true)); save();
    const foe = Array.isArray(T.foe) ? pick(T.foe) : T.foe;
    S.run = newRun(0); S.run.tutStep = step;
    startBattle({ foes: [foe], known: T.known, tip: T.tip, tut: true, onWin: () => { S.run = null; B = null; tutorial(step + 1); } });
  });
}

// ---------- ステージ・ラン
function stageSelect() {
  screen(`${topBar('ステージを えらぶ', title)}<div class="stages">${STAGES.map(s => {
    const open = s.n === 1 ? S.tut >= 99 : !!S.clear[s.n - 1];
    const best = S.clear[s.n] || 0;
    return `<div class="stage ${open ? '' : 'lock'}" style="background:${s.bg}"><div class="row">${ART.patient(PATIENTS[s.patient].look, false, 54)}<div><b>${s.ja}</b><span class="note">${open ? s.intro : '🔒 前のステージを クリアすると 解放'}</span></div></div>
      ${open ? `<div class="row asc"><span>むずかしさ</span><select data-s="${s.n}">${Array.from({ length: Math.min(best + 1, 8) }, (_, i) => `<option value="${i}" ${i === Math.max(0, best - 1) ? 'selected' : ''}>${i === 0 ? 'ふつう' : i}</option>`).join('')}</select><button class="btn main" data-go="${s.n}">はじめる</button></div>${best ? `<span class="note">クリア済み ${best > 1 ? `(むずかしさ${best - 1}まで)` : ''} ・ ランク ${Array.from({ length: best }, (_, a) => S.best[s.n + '-' + a] ? (a ? a + ':' : 'ふつう:') + S.best[s.n + '-' + a] : '').filter(Boolean).join(' ')}</span>` : ''}` : ''}</div>`;
  }).join('')}</div><p class="note c">ステージ1は 負けても そのバトルから やりなおせる。ステージ2・3は 負けると はじめから。</p>`);
  bindBack(title);
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = async () => {
    const n = +b.dataset.go, asc = +$(`select[data-s="${n}"]`).value;
    if (S.run && !await ask('<b>今の つづきは 消えるけど いい?</b>', 'はじめる')) return;
    SE.play('start'); S.run = newRun(n, asc); save();
    const sg = STAGES[n - 1];
    await modal(`<div class="row c">${ART.patient(PATIENTS[sg.patient].look, true, 90)}</div><b>${sg.ja}</b><p>患者: ${PATIENTS[sg.patient].ja}</p><p class="note">${sg.intro}</p>`, ['しゅっぱつ!']);
    mapScreen();
  });
}
function newRun(stage, asc = 0) {
  const pt = stage ? PATIENTS[STAGES[stage - 1].patient] : PATIENTS.kid;
  if (stage >= 1) { learn('apap', true); learn('nutri', true); learn('sleep', true); } if (stage >= 2) learn('bif', true);
  const R = { stage, asc, hp: pt.hp, max: pt.hp, gut: 10, resist: 0, coins: 30, relics: [], items: stage ? ['hint'] : [], lv: {}, pos: null, map: stage ? makeMap(stage) : null, wrong: 0, hintUsed: 0, mepm: 0, gutZero: 0, fl: 0 };
  return R;
}
function resumeRun() { const R = S.run; if (!R) return title(); if (R.pending) return enterNode(R.pending.f, R.pending.i, true); mapScreen(); }

// ---------- マップ(スレイザスパイアのように 下から上へ すすむ)
function SG(R) {
  if (R.stage !== 9) return STAGES[R.stage - 1];
  const s = SC[R.scn] || SCN[0];
  return { n: 9, ja: `むげん病院 ${R.act}幕 ${s.em}${s.ja}`, patient: s.patient, test: s.test, bg: s.bg, enemies: s.pool, elites: s.elites, boss: [R.bossId || s.boss[0]] };
}
const GI = { abx: '🦠抗菌', vir: '🧬抗ウイルス', fun: '🍄抗真菌', par: '🪱抗寄生虫', sup: '❤️ささえる' };
const NODE = { fork: ['🧭', '分かれ道'], battle: ['⚔️', 'バトル'], elite: ['🔥', '強敵'], event: ['❓', 'イベント'], shop: ['🏪', 'ショップ'], rest: ['🛏️', '休けい'], treasure: ['🎁', '宝箱'], boss: ['👑', 'ボス'] };
function makeMap(stage) {
  const H = stage === 1 ? 9 : stage === 9 ? 13 : 11, floors = [];
  for (let f = 0; f < H; f++) {
    const n = f === H - 1 ? 1 : 2 + rnd(3);
    floors.push(Array.from({ length: n }, (_, i) => ({ f, i, x: n === 1 ? 0.5 : (i + 0.5) / n + (Math.random() - 0.5) * 0.08, type: 'battle', to: [] })));
  }
  const W = [['battle', 40], ['event', 26], ['elite', 12], ['shop', 10], ['rest', 12]];
  floors.forEach((row, f) => row.forEach(nd => {
    if (f === H - 1) nd.type = 'boss';
    else if (f === H - 2) nd.type = 'rest';
    else if (f === 0) nd.type = 'battle';
    else if (f === Math.floor(H / 2)) nd.type = 'treasure';
    else if (stage === 9 && (f === 3 || f === 7)) nd.type = 'fork';
    else { let r = rnd(100); for (const [t, w] of W) { if (r < w) { nd.type = t; break; } r -= w; } if (f < 3 && (nd.type === 'elite' || nd.type === 'rest')) nd.type = 'battle'; if (f < 2 && nd.type === 'shop') nd.type = 'event'; }
  }));
  for (let f = 0; f < H - 1; f++) {
    const a = floors[f], b = floors[f + 1];
    a.forEach(nd => { const near = b.map((m, j) => [Math.abs(m.x - nd.x), j]).sort((p, q) => p[0] - q[0]); nd.to.push(near[0][1]); if (near[1] && Math.random() < 0.55) nd.to.push(near[1][1]); });
    b.forEach((m, j) => { if (!a.some(nd => nd.to.includes(j))) { const k = a.map((nd, i) => [Math.abs(nd.x - m.x), i]).sort((p, q) => p[0] - q[0])[0][1]; a[k].to.push(j); } });
    a.forEach(nd => nd.to = [...new Set(nd.to)].sort());
  }
  return floors;
}
function statusBar(R) {
  const gutPct = R.gut * 10, resPct = Math.min(100, R.resist * 5);
  return `<div class="status"><div class="sb hp"><span>❤️</span><div class="bar"><i style="width:${R.hp / R.max * 100}%"></i></div><b>${R.hp}/${R.max}</b></div>
    <div class="sb gut" title="善玉菌"><span>🥛</span><div class="bar"><i style="width:${gutPct}%"></i></div><b>${R.gut}</b></div>
    <div class="sb res" title="耐性メーター"><span>⚠️</span><div class="bar"><i style="width:${resPct}%"></i></div><b>${R.resist}</b></div>
    <div class="sb coin">🪙${R.coins}</div></div>
    <div class="relics"><span class="relic bkbtn" id="bk">📕攻略本</span>${R.relics.map(r => `<span class="relic" data-r="${r}">${RL(r).em}</span>`).join('')}${R.items.map((it, i) => `<span class="item" data-it="${i}">${IT[it].em}</span>`).join('')}</div>`;
}
const RL = id => RM[id];
function bindStatus(inBattle) {
  const bk = $('#bk'); if (bk) bk.onclick = () => BOOK.open();
  app.querySelectorAll('[data-r]').forEach(e => e.onclick = () => { const r = RL(e.dataset.r); modal(`<b>${r.em} ${r.ja}</b><p>${r.desc}</p>`, ['OK']); });
  app.querySelectorAll('[data-it]').forEach(e => e.onclick = async () => {
    const R = S.run, i = +e.dataset.it, it = IT[R.items[i]];
    const usable = inBattle || ['drink', 'probio', 'okayu', 'sports', 'sweets'].includes(it.id);
    if (!usable) return modal(`<b>${it.em} ${it.ja}</b><p>${it.desc}</p><p class="note">バトルの中で 使えるよ</p>`, ['OK']);
    if (await ask(`<b>${it.em} ${it.ja}</b><p>${it.desc}</p>`, 'つかう')) useItem(i);
  });
}
function mapScreen() {
  const R = S.run; if (!R) return title();
  B = null; if (R.pending) { R.pending = null; save(); }
  const sg = SG(R), M = R.map;
  const avail = R.pos ? M[R.pos.f][R.pos.i].to.map(j => M[R.pos.f + 1][j]) : M[0];
  const H = M.length, rowH = 74, W = 340;
  let svg = '';
  M.forEach((row, f) => row.forEach(nd => nd.to.forEach(j => { const m = M[f + 1][j]; const done = R.pos && R.pos.f >= f + 1 && R.path && R.path.some(p => p.f === f && p.i === nd.i) && R.path.some(p => p.f === f + 1 && p.i === j); svg += `<line x1="${nd.x * W}" y1="${(H - 1 - f) * rowH + 30}" x2="${m.x * W}" y2="${(H - 2 - f) * rowH + 30}" class="${done ? 'done' : ''}"/>`; })));
  const nodes = M.map((row, f) => row.map(nd => {
    const can = avail.includes(nd), cur = R.pos && R.pos.f === f && R.pos.i === nd.i, past = R.path && R.path.some(p => p.f === f && p.i === nd.i);
    return `<button class="node ${nd.type} ${can ? 'can' : ''} ${cur ? 'cur' : ''} ${past ? 'past' : ''}" style="left:${nd.x * W - 22}px;top:${(H - 1 - f) * rowH + 8}px" ${can ? `data-f="${f}" data-i="${nd.i}"` : 'disabled'}>${NODE[nd.type][0]}</button>`;
  }).join('')).join('');
  screen(`${topBar((R.stage === 9 ? `♾️${R.act}幕 ${SC[R.scn].em}` : sg.ja.split(' ')[0]) + (R.asc ? ` 🔥${R.asc}` : ''), title, { label: 'タイトル' })}${statusBar(R)}
    <div class="mapwrap" id="mw"><div class="map" style="height:${H * rowH + 20}px;width:${W}px"><svg width="${W}" height="${H * rowH + 20}">${svg}</svg>${nodes}</div></div>
    <p class="note c">${Object.entries(NODE).filter(([k]) => M.some(r => r.some(n => n.type === k))).map(([, v]) => v.join('')).join(' ')}</p>`, 'mapScr');
  bindBack(title); bindStatus(false);
  const mw = $('#mw'); const curY = R.pos ? (H - 1 - R.pos.f) * rowH : (H - 1) * rowH; mw.scrollTop = Math.max(0, curY - mw.clientHeight + 160);
  app.querySelectorAll('.node.can').forEach(b => b.onclick = () => { SE.play('select'); enterNode(+b.dataset.f, +b.dataset.i); });
}
function enterNode(f, i, resume) {
  const R = S.run, nd = R.map[f][i];
  if (resume) { if (R.snap) Object.assign(R, JSON.parse(R.snap)); }
  else { R.pos = { f, i }; R.path = (R.path || []).concat([{ f, i }]); R.fl = f; }
  R.pending = { f, i }; save();
  const sg = SG(R);
  if (nd.type === 'fork') return forkScreen();
  if (nd.type === 'battle') return startBattle({ foes: pickFoes(sg.enemies, f), node: 'battle' });
  if (nd.type === 'elite') return startBattle({ foes: [pick(sg.elites)], node: 'elite' });
  if (nd.type === 'boss') return startBattle({ foes: [pick(sg.boss)], node: 'boss' });
  if (nd.type === 'event') return eventScreen();
  if (nd.type === 'shop') return shopScreen();
  if (nd.type === 'rest') return restScreen();
  if (nd.type === 'treasure') return treasureScreen();
}
function pickFoes(pool, f) {
  const R = S.run;
  const two = R.stage >= 2 && f >= 4 && Math.random() < 0.25;
  const a = R.mod && R.mod.hot && Math.random() < 0.45 ? R.mod.hot : pick(pool); if (!two || P[a].noDrug) return [a];
  const rest = pool.filter(x => x !== a && !P[x].noDrug && !P[x].self); return rest.length ? [a, pick(rest)] : [a];
}

// ---------- バトル
let B = null;
const effOf = (d, p) => d.eff[p.id] || 0;
function scaleFoe(pid, node) {
  const R = S.run, p = P[pid];
  let hp = Math.round(p.hp * (R.stage ? 1.2 : 1)), atkAdd = 0;
  if (R.stage >= 2) hp = Math.round(hp * (1 + (R.stage - 1) * 0.1));
  if (node === 'elite') { hp = Math.round(hp * 1.3); atkAdd += 1; }
  if (R.stage === 9) { hp = Math.round(hp * (1 + (R.act - 1) * 0.15)); atkAdd += Math.floor((R.act - 1) / 2) + ((R.mod && R.mod.atk) || 0); if (node === 'boss' && !p.boss) hp = Math.round(hp * 1.5); }
  hp = Math.round(hp * (1 + R.asc * 0.12)); atkAdd += Math.floor(R.asc / 2);
  if (R.relics.includes('fluvac') && (pid === 'flu' || pid === 'flu_boss')) hp = Math.ceil(hp / 2);
  if (R.relics.includes('pcv') && pid === 'pneumo') hp = Math.ceil(hp / 2);
  return { hp, atkAdd };
}
function makeFoe(pid, node, known) {
  const R = S.run; const sg = R.stage ? SG(R) : null;
  let conv = false;
  if (R.stage >= 2 && RESIST_TO[pid] && R.resist >= (pid === 'pseudo' ? 18 : 8) && Math.random() < (R.resist - 6) / 12) { pid = RESIST_TO[pid]; conv = true; }
  const p = P[pid]; let { hp, atkAdd } = scaleFoe(pid, node);
  if (conv && node !== 'elite' && node !== 'boss') hp = Math.round(hp * 0.7);
  let k = known != null ? known : 0;
  const first = !S.seen[pid];
  if (first) k = 3;
  if (R.relics.includes('chart') && S.kills[pid]) k = 3;
  if (R.relics.includes('steth')) k = Math.max(k, 1);
  if (!sg) k = known != null ? known : k;
  let h = hp; if (R.relics.includes('soap')) h = Math.ceil(h * 0.9);
  return { pid, hp: h, max: hp, atkAdd, k, pi: 0, block: 0, dots: [], toxin: false, self: p.self ? p.self + (R.asc >= 3 ? 1 : 0) : 0, combo: new Set(), first, conv };
}
function startBattle(o) {
  const R = S.run;
  R.snap = JSON.stringify({ hp: R.hp, gut: R.gut, resist: R.resist, items: R.items, coins: R.coins });
  B = { o, foes: o.foes.map(pid => makeFoe(pid, o.node, o.known)), turn: 0, ap: 0, apMax: 3 + (R.relics.includes('coat') ? 1 : 0), cd: {}, usedTurn: new Set(), sel: null, tgt: 0, guard: 0, free: R.relics.includes('loupe') ? 1 : 0, dmgTaken: 0, wrong: 0, abxOnSelf: false, cdSpawned: false, busy: false, log: [], immUp: 0, immDown: R.imm > 0 ? 2 : 0 };
  if (R.relics.includes('thermo')) R.hp = Math.min(R.max, R.hp + 3);
  if (R.imm > 0) { R.imm--; setTimeout(() => toast('😪 めんえきが 下がっていて、病原体が 強い…', 2600), 400); }
  if (R.cdNext && o.node !== 'boss' && !o.tut) { R.cdNext = false; B.foes = [B.foes[0], makeFoe('cdiff', 'battle', 0)]; B.foes[1].k = 3; B.foes[1].first = false; }
  save(); introFoes().then(async () => { if (B.foes.some(f => f.pid === 'cdiff') && !B.o.cdShown) { B.o.cdShown = 1; await cdHelp('前の治療で 善玉菌が へって、ディフィシル菌が ふえていた!'); } playerTurn(); });
}
async function ensureCombo(p) {
  // 併用が必要な相手には、効く薬を かならず 2つ以上 持たせる(1つでは 勝てないので)
  const own = DRUGS.filter(d => learned(d.id) && effOf(d, p) >= 1);
  if (own.length >= 2) return;
  const add = DRUGS.filter(d => !learned(d.id) && effOf(d, p) === 2).sort((a, b) => a.cost - b.cost).slice(0, 2 - own.length);
  if (!add.length) return;
  add.forEach(d => learn(d.id)); save();
  await modal(`<div class="row c">${ART.patho(p, 3, 80)}</div><b>🤝 ${p.ja}には 併用が 必要!</b><p>1つの薬だけでは 耐性が できやすいので、2つ以上を 同じターンに 使おう。</p><p class="got">💊 ${add.map(d => '<b>' + d.ja + '</b>').join('・')}を おぼえた!</p>`, ['たたかう']);
}
async function introFoes() {
  for (const f of B.foes) if (P[f.pid].combo) await ensureCombo(P[f.pid]);
  for (const f of B.foes) {
    const p = P[f.pid];
    if (f.conv) await modal(`<div class="row c">${ART.patho(p, 3, 90)}</div><b>⚠️ 耐性菌に なっていた!</b><p>耐性メーターが たまっていたので、<b>${p.ja}</b>が あらわれた。</p><p class="note">${p.fact}</p>`, ['たたかう']);
    if (!f.first) continue;
    S.seen[p.base || p.id] = S.seen[p.base || p.id] || Date.now(); S.seen[p.id] = S.seen[p.id] || Date.now();
    const has = DRUGS.filter(d => learned(d.id) && effOf(d, p) === 2);
    let give = null;
    if (!has.length) { give = DRUGS.filter(d => effOf(d, p) === 2).sort((a, b) => a.gut - b.gut || a.cost - b.cost)[0] || (p.self ? D.ors : null); if (give && !learned(give.id)) learn(give.id); else if (p.self && !learned('ors')) { give = D.ors; learn('ors'); } else give = null; }
    const how = p.noDrug ? '効く薬は ない。<b>内視鏡</b>で 取り出そう' : p.self ? '特効薬は ない。体をささえて めんえきを 待とう' : `効く薬: <b>${DRUGS.filter(d => effOf(d, p) === 2 && d.cat !== 'sup').map(d => d.ja).slice(0, 4).join('・')}</b>${p.combo ? '<br>⚠️ 2つ以上を 同じターンに 組み合わせて使う(併用)' : ''}`;
    f.first = false;
    SFX.play('newFoe');
    const effD = DRUGS.filter(d => effOf(d, p) === 2 && learned(d.id)).sort((a, b) => isBest(b, p) - isBest(a, p)).slice(0, 4);
    await modal(`<div class="meet"><span class="meet-new">NEW!</span>${ART.patho(p, 3, 120)}</div><span class="tag" style="background:${CAT[p.cat].col}">${CAT[p.cat].em} ${CAT[p.cat].ja}${p.gram ? '・' + GRAM[p.gram] : ''}</span><b class="big">${p.ja}</b><p class="note">📍${p.place} 🤒${p.sym}</p>${p.noDrug ? '<p>💊 薬は 効かない → <b>内視鏡</b>で とり出そう</p>' : p.self ? '<p>💊 特効薬は ない → 体を ささえて めんえきを 待とう</p>' : `<p class="meet-d">💊 ${effD.map(d => `<span class="mini ${isBest(d, p) ? 'best' : ''}">${drugArt(d, 36)}<b>${d.ja}</b></span>`).join('')}</p>`}${p.combo ? '<p class="warn">🤝 2つ以上を 同じターンに 使おう(併用)</p>' : ''}${give ? `<p class="got">🎁 <b>${give.ja}</b>を おぼえた!</p>` : ''}<details class="dc-more"><summary>📝 もっと 知る</summary><p>${p.fact}</p></details><p class="note">次からは 自分で 思い出して たたかおう!</p>`, ['たたかう!']);
  }
  save();
}
const DOT_T = 3;
// 患者の めんえき(毎ターン 病原体を こうげき)。体力・善玉菌が 多いほど 強く、ステロイドなどで 弱くなる
function immPower() { const R = S.run; return clamp(1 + Math.round(R.hp / R.max * 2) + (R.gut >= 6 ? 1 : 0) + B.immUp - B.immDown, 0, 9); }
function foeIntent(f) { const p = P[f.pid]; const [k, v] = p.pat[f.pi % p.pat.length]; return [k, k === 'atk' ? Math.max(0, v + f.atkAdd) * (f.toxin ? 2 : 1) - (maskOn(p) ? 1 : 0) : v]; }
const maskOn = p => S.run.relics.includes('mask') && /のど|肺/.test(p.place);
function intentHtml(f) {
  const p = P[f.pid];
  if (f.self) { const [k, v] = foeIntent(f); return `<span class="intent">${k === 'atk' ? '⚔️' + v : '…'}</span><span class="intent self">⏳あと${f.self}</span>`; }
  const [k, v] = foeIntent(f);
  return `<span class="intent ${k}">${{ atk: '⚔️' + v, grow: f.dots.length ? '⬆️(薬で止まる)' : '⬆️ふえる', toxin: '☠️どくそ', hide: '🛡️かくれる' }[k]}</span>`;
}
function foeLabel(f) {
  const p = P[f.pid];
  if (f.k >= 3) return `<b>${p.ja}</b>`;
  if (f.k === 2) return `<b style="color:${CAT[p.cat].col}">${p.gram ? GRAM[p.gram] + '菌' : CAT[p.cat].ja}</b>`;
  if (f.k === 1) return `<b style="color:${CAT[p.cat].col}">${CAT[p.cat].ja}</b>`;
  return '<b>???</b>';
}
function renderBattle() {
  const R = S.run;
  const foes = B.foes.map((f, i) => {
    const p = P[f.pid]; if (f.hp <= 0) return '';
    return `<div class="foe ${B.tgt === i ? 'tgt' : ''}" data-t="${i}"><div class="ints">${intentHtml(f)}</div>${ART.patho(p, f.k, B.foes.filter(x => x.hp > 0).length > 1 ? 82 : 110)}${foeLabel(f)}<span class="note">${p.place}|${p.sym}</span>${f.info && f.info.gram && p.cat === 'bac' && p.gram !== 'none' && p.gram !== 'acid' ? gramSVG(p, 40) : ''}${f.info && f.info.lines ? `<span class="finfo">${f.info.lines.slice(-3).map(esc).join('<br>')}</span>` : ''}
      ${f.dots.length ? `<div class="dots">${f.dots.map(x => `<span>💊${esc(D[x.id].ja.slice(0, 6))} ${x.t}</span>`).join('')}</div>` : ''}<div class="bar fhp"><i style="width:${f.hp / f.max * 100}%"></i><em>${f.hp}/${f.max}${f.block ? ` 🛡️${f.block}` : ''}</em></div>${p.combo && f.k >= 3 ? '<span class="note warn">併用が必要</span>' : ''}</div>`;
  }).join('');
  const tip = B.o.tip ? `<div class="tip">💡 ${B.o.tip}</div>` : '';
  const testCost = R.relics.includes('scope') ? 0 : 1;
  const shelf = DRUGS.filter(d => learned(d.id));
  const tabs = ['all', 'abx', 'vir', 'fun', 'par', 'sup'].filter(c => c === 'all' || shelf.some(d => d.cat === c));
  B.tab = B.tab && tabs.includes(B.tab) ? B.tab : 'all';
  const sel = B.sel && D[B.sel];
  const tf = B.foes[B.tgt];
  const keepY = window.scrollY, keepS = ($('.drugs') || {}).scrollTop || 0;
  screen(`${statusBar(R)}<button class="pause" id="quit">⏸</button>${tip}
    <div class="scene"><div class="left">${ART.doctor(S.look, 70)}<div class="patbox">${ART.patient(R.stage ? PATIENTS[SG(R).patient].look : 'kid', R.hp < R.max * 0.5, 66)}${B.guard ? `<span class="guard">🛡️${B.guard}</span>` : ''}<span class="imm">🛡️めんえき ${immPower()}</span></div></div><div class="right">${foes}</div></div>
    <div class="shelf ${B.busy ? 'hide' : ''}">
      <div class="shtop"><span class="ap">${Array.from({ length: B.apMax }, (_, i) => `<i class="${i < B.ap ? 'on' : ''}"></i>`).join('')}</span>
        <button class="btn sm" id="test" ${tf && !B.busy ? '' : 'disabled'}>🔬検査</button>
        <button class="btn sm" id="hint" ${tf && tf.k < 3 && (B.free || R.items.includes('hint')) ? '' : 'disabled'}>💡${B.free ? 'タダ' : '×' + R.items.filter(x => x === 'hint').length}</button>
        <button class="btn sm end ${B.ap === 0 && !B.busy ? 'pulse' : ''}" id="end">ターン終了</button></div>
      <div class="tabs">${tabs.map(c => `<button class="tab ${B.tab === c ? 'on' : ''}" data-tab="${c}">${c === 'all' ? 'ぜんぶ' : DCAT[c].replace('薬', '')}</button>`).join('')}</div>
      <div class="drugs">${shelf.filter(d => B.tab === 'all' || d.cat === B.tab).map(d => { const cd = B.cd[d.id] || 0, used = B.usedTurn.has(d.id), lv = R.lv[d.id] || 1; const off = cd > 0 || used || B.ap < d.cost; return `<button class="drug ${off ? 'off' : ''} ${B.sel === d.id ? 'sel' : ''}" data-d="${d.id}" style="--c:${dCol(d)}"><span class="cost">${'●'.repeat(d.cost)}</span>${drugArt(d, 34)}<b class="${d.ja.length > 9 ? 'l3' : d.ja.length > 6 ? 'l2' : ''}">${d.ja}</b>${lv > 1 ? `<span class="lv">Lv${lv}</span>` : ''}${cd > 0 ? `<span class="cd">あと${cd}</span>` : used ? '<span class="cd">使った</span>' : ''}</button>`; }).join('')}</div>
      <div class="usebar">${sel ? `<span><b>${sel.ja}</b> を ${tf ? (tf.k >= 3 ? P[tf.pid].ja : '???') : ''}に</span><button class="btn main" id="use">つかう</button>` : (B.ap ? '<span class="note">薬 → 病原体を タップ。長おしで カード</span>' : '<span class="note warn">処方ポイントが なくなった。ターン終了を おそう</span>')}</div>
    </div>`, 'battleScr', true);
  const dr = $('.drugs'); if (dr) dr.scrollTop = keepS; window.scrollTo(0, keepY);
  bindStatus(true);
  app.querySelectorAll('[data-t]').forEach(e => e.onclick = () => { B.tgt = +e.dataset.t; SE.play('select'); if (B.sel && !B.busy) return useDrug(B.sel); renderBattle(); });
  app.querySelectorAll('[data-tab]').forEach(e => e.onclick = () => { B.tab = e.dataset.tab; renderBattle(); });
  app.querySelectorAll('[data-d]').forEach(e => {
    let tm = null, long = false;
    const start = () => { long = false; tm = setTimeout(() => { long = true; drugInfo(e.dataset.d, true); }, 450); };
    const stop = () => clearTimeout(tm);
    e.addEventListener('pointerdown', start); e.addEventListener('pointerup', stop); e.addEventListener('pointerleave', stop); e.addEventListener('pointercancel', stop);
    e.addEventListener('contextmenu', ev => ev.preventDefault());
    e.onclick = () => { if (long) return; if (B.busy) return; SE.play('select'); B.sel = B.sel === e.dataset.d ? null : e.dataset.d; renderBattle(); };
  });
  const u = $('#use'); if (u) u.onclick = () => useDrug(B.sel);
  $('#end').onclick = () => endTurn();
  $('#quit').onclick = () => { B = null; title(); };
  const t = $('#test'); if (t) t.onclick = () => testMenu();
  const h = $('#hint'); if (h) h.onclick = () => doHint();
}
async function drugInfo(id, canUse) {
  const d = D[id], R = S.run, lv = R ? (R.lv[id] || 1) : 1;
  const body = drugCard(d, lv) + `<p class="stats">💊処方ポイント ${d.cost}${d.dmg && !d.fixed ? ` ・ ${DOT_T}ターン 効きつづける` : ''}${d.cd ? ` ・ ⏳使ったあと ${d.cd}ターン 休み` : ''}${d.hurt ? ` ・ 副作用❤️-${d.hurt}` : ''}${d.immDown ? ` ・ ⚠️めんえき-${d.immDown}` : ''}</p>`;
  if (canUse && B && !B.busy) { const off = (B.cd[id] || 0) > 0 || B.usedTurn.has(id) || B.ap < d.cost; const r = await modal(body, off ? ['とじる'] : ['つかう', 'とじる']); if (!off && r === 0) useDrug(id); }
  else modal(body, ['とじる']);
}
const drugArt = (d, size) => d.cat === 'sup' ? ART.drug(d, size) : ART.hero(d, size);
const dCol = d => d.cat === 'sup' ? '#ff8fa3' : CAT[{ abx: 'bac', vir: 'vir', fun: 'fun', par: 'par' }[d.cat]].col;
const stars = d => d.endless || d.cost >= 3 ? 3 : d.cost === 2 ? 2 : 1;
function bar(label, v, max, col) { const n = Math.round(clamp(v / max, 0, 1) * 5); return `<div class="dbar"><span>${label}</span><i>${('<b style="background:' + col + '"></b>').repeat(n)}${'<b></b>'.repeat(5 - n)}</i></div>`; }
function drugCard(d, lv = 1) {
  const targets = PATHO.filter(p => !p.base && effOf(d, p) >= 1);
  const best = new Set(PATHO.filter(p => isBest(d, p)).map(p => p.id));
  const sorted = targets.sort((a, b) => best.has(b.id) - best.has(a.id));
  return `<div class="dcard" style="--c:${dCol(d)}"><div class="dc-top"><span class="dc-cost">${'●'.repeat(d.cost)}</span><span class="dc-genre">${GI[d.cat]}</span><span class="dc-star">${'★'.repeat(stars(d))}${'☆'.repeat(3 - stars(d))}</span></div>
    <div class="dc-art">${drugArt(d, 92)}</div><b class="dc-name">${d.ja}</b>${famOf(d.id) ? `<span class="dc-fam">👥 ${famOf(d.id).f.ja}</span>` : ''}<span class="dc-sub">${[d.brand, FORM_JA[FORM[d.id]]].filter(Boolean).join('・')}</span>
    <div class="dc-stats">${d.dmg ? bar('⚔️ つよさ', dmgOf(d, lv), 20, '#ff6b6b') : bar('❤️ かいふく', (d.heal || 0) + (d.guard || 0) / 2 + (d.gutUp || 0) + (d.immUp || 0) * 2, 10, '#ff8fa3')}${bar('🥛 おなかに やさしい', 4 - (d.gut || 0), 4, '#6bd18c')}${bar('🌱 耐性に なりにくい', 4 - (d.rsk || 0), 4, '#7fc8ff')}</div>
    ${sorted.length ? `<div class="dc-foes"><span>とくいな 相手</span><div>${sorted.slice(0, 10).map(p => `<span class="dc-foe ${best.has(p.id) ? 'best' : ''} ${effOf(d, p) === 1 ? 'so' : ''}" title="${esc(p.ja)}">${ART.patho(p, S.seen[p.id] ? 3 : 0, 34)}${best.has(p.id) ? '<i>✨</i>' : ''}</span>`).join('')}</div></div>` : ''}
    <p class="dc-desc">${d.desc}</p><details class="dc-more"><summary>📝 もっと 知る</summary><p>${d.fact}</p><p class="note">${d.cls}${d.sub ? '・' + d.sub : ''}</p></details></div>`;
}
const danger = p => p.boss || p.resist && p.hp >= 60 ? 3 : p.resist || p.combo || p.hp >= 36 ? 2 : 1;
function pathoCard(p, opt = {}) {
  const C = CLINIC[p.id] || {}, col = CAT[p.cat].col;
  const atk = Math.max(...p.pat.filter(x => x[0] === 'atk').map(x => x[1]), 0);
  const grow = p.pat.filter(x => x[0] === 'grow').reduce((a, x) => a + x[1], 0);
  const hide = p.pat.some(x => x[0] === 'hide'), tox = p.pat.some(x => x[0] === 'toxin');
  const drugs = DRUGS.filter(d => effOf(d, p) >= 1).sort((a, b) => isBest(b, p) - isBest(a, p) || effOf(b, p) - effOf(a, p));
  const skill = [hide ? '🛡️かくれる' : '', tox ? '☠️どくそ' : '', grow ? '⬆️ふえる' : '', p.self ? '⏳自然に 治る' : '', p.combo ? '🤝併用が 必要' : '', p.resist ? '⚠️耐性菌' : '', p.noDrug ? '🔦内視鏡で とる' : ''].filter(Boolean);
  return `<div class="dcard pcard" style="--c:${col}"><div class="dc-top"><span class="dc-genre">${CAT[p.cat].em} ${CAT[p.cat].ja}</span>${p.gram ? `<span class="dc-gram">${GRAM[p.gram]}</span>` : '<span></span>'}<span class="dc-star" title="てごわさ">${'💀'.repeat(danger(p))}</span></div>
    <div class="dc-art">${ART.patho(p, 3, 100)}</div><b class="dc-name">${p.ja}</b><span class="dc-sub">${p.full}</span>
    <div class="dc-place"><span>📍${p.place}</span><span>🤒${p.sym}</span></div>
    <div class="dc-stats">${bar('⚔️ こうげき', atk, 9, '#ff6b6b')}${bar('❤️ タフさ', p.hp, 60, '#ff9f43')}${bar('⬆️ ふえる 力', grow, 10, '#c59bff')}</div>
    ${skill.length ? `<div class="dc-skill">${skill.map(s => `<span>${s}</span>`).join('')}</div>` : ''}
    ${drugs.length ? `<div class="dc-foes"><span>${p.noDrug ? '' : '効く 薬'}</span><div>${drugs.slice(0, 10).map(d => `<span class="dc-foe ${isBest(d, p) ? 'best' : ''} ${effOf(d, p) === 1 ? 'so' : ''}" title="${esc(d.ja)}">${learned(d.id) || opt.all ? drugArt(d, 32) : '<span class="q">?</span>'}${isBest(d, p) ? '<i>✨</i>' : ''}</span>`).join('')}</div></div>` : `<p class="dc-desc">${p.self ? '💊 特効薬は ない → 体を ささえて めんえきを 待とう' : ''}</p>`}
    ${C.hist ? `<details class="dc-more"><summary>🗣️ 問診の ヒント</summary><p>${C.hist}</p></details>` : ''}<details class="dc-more"><summary>📝 もっと 知る</summary><p>${p.fact}</p>${C.rapid ? '<p class="note">🧪 迅速検査で わかる</p>' : ''}</details>
    ${opt.kills != null ? `<p class="note">たおした数: ${opt.kills}</p>` : ''}</div>`;
}
const dmgOf = (d, lv) => Math.round(d.dmg * (1 + (lv - 1) * 0.3));
async function fx(cls, i) { const el = app.querySelector(`[data-t="${i}"]`); if (el) { el.classList.remove('hit', 'miss', 'heal'); void el.offsetWidth; el.classList.add(cls); } await wait(380); }
function floatTxt(t, i, cls = '') { const el = i == null ? app.querySelector('.patbox') : app.querySelector(`[data-t="${i}"]`); if (!el) return; const s = document.createElement('span'); s.className = 'float ' + cls; s.innerHTML = t; el.appendChild(s); setTimeout(() => s.remove(), 1200); }
async function useDrug(id) {
  const R = S.run, d = D[id]; if (!d || B.busy) return;
  if ((B.cd[id] || 0) > 0 || B.usedTurn.has(id) || B.ap < d.cost) return;
  let ti = B.tgt; if (!B.foes[ti] || B.foes[ti].hp <= 0) ti = B.foes.findIndex(f => f.hp > 0);
  const f = B.foes[ti], p = P[f.pid];
  B.ap -= d.cost; B.usedTurn.add(id); (B.usedIds = B.usedIds || new Set()).add(id); if (d.cd) B.cd[id] = d.cd + 1; B.sel = null;
  S.used[id] = (S.used[id] || 0) + 1;
  const lv = R.lv[id] || 1;
  // インフルエンザ・水ぼうそうの時の 解熱剤の えらび方(NSAIDsは さける・アセトアミノフェンが よい)
  const viral = B.foes.some(x => x.hp > 0 && ['flu', 'flu_boss', 'vzv'].includes(x.pid));
  const kid = !R.stage || SG(R).patient === 'kid';
  if (viral && d.nsaid) {
    const pen = kid ? (d.nsaid >= 2 ? 6 : 4) : 2; R.hp -= pen; B.wrong++; R.wrong++; st('nsaidNg');
    SE.play('ng'); floatTxt('❤️-' + pen, null, 'bad');
    toast(kid ? `⚠️ インフルエンザ・水ぼうそうの 子どもに ${d.ja}(NSAIDs)は ✕。脳症などが 重くなる おそれ。アセトアミノフェンを 使おう` : `⚠️ インフルエンザ・水ぼうそうの時は NSAIDsを さけて、アセトアミノフェンを 使うのが 安全`, 4200);
    if (kid) { renderBattle(); return afterAction(); }
  }
  if (viral && d.id === 'apap') { R.hp = Math.min(R.max, R.hp + 2); st('apapOk'); toast('◎ インフルエンザ・水ぼうそうの 熱には アセトアミノフェン。正解!', 2400); }
  if (d.heal || d.guard || d.gutUp || d.immUp) {
    if (d.heal) { R.hp = Math.min(R.max, R.hp + d.heal + (lv - 1) * 2); floatTxt('❤️+' + (d.heal + (lv - 1) * 2), null, 'heal'); }
    if (d.guard) B.guard += d.guard;
    if (d.gutUp) R.gut = Math.min(10, R.gut + d.gutUp);
    if (d.hurt) { R.hp -= d.hurt; toast(`💊 ${d.ja}の 副作用 ❤️-${d.hurt}`); }
    if (d.immUp) { B.immUp = Math.min(4, B.immUp + d.immUp); floatTxt('🛡️めんえき UP', null, 'heal'); }
    if (d.immDown) { B.immDown += d.immDown; B.foes.forEach(f => { if (f.self) f.self++; }); toast('⚠️ めんえきが 下がった…(病原体への こうげきが 弱くなる)', 2600); }
    SFX.play(d.heal ? 'heal' : 'guard'); renderBattle(); return afterAction();
  }
  // 抗菌薬の 体への えいきょう(善玉菌・耐性)
  if (d.cat === 'abx' || d.gut) {
    const before = R.gut;
    if (before === 0 && d.gut) { R.hp -= 1; floatTxt('げり❤️-1', null, 'bad'); }
    R.gut = Math.max(0, R.gut - (p.combo ? Math.ceil(d.gut / 2) : d.gut));
    if (before > 0 && R.gut === 0) B.gutHit = true;
    R.resist += d.rsk;
    if (id === 'mepm') R.mepm++;
    if (R.gut === 0) R.gutZero++;
  }
  if (d.hurt) { R.hp -= d.hurt; floatTxt('副作用❤️-' + d.hurt, null, 'bad'); }
  if (p.self && d.cat === 'abx') B.abxOnSelf = true;
  const e = effOf(d, p);
  if (!e) {
    B.wrong++; R.wrong++;
    if (d.cat === 'abx') R.resist += 1;
    const pen = R.stage <= 1 ? 1 : 2; R.hp -= pen;
    SFX.play('miss'); renderBattle(); await fx('miss', ti); floatTxt('こうかが ない…', ti, 'bad'); floatTxt('❤️-' + pen, null, 'bad');
    if (f.k < 3 && R.stage >= 2) f.k = Math.max(f.k, 0);
    toast(`❌ ${whyNot(d, p)}`, 3200);
    return afterAction();
  }
  let base = d.fixed || dmgOf(d, lv);
  if (R.relics.includes('ast') && d.gut <= 1 && !d.fixed) base += 3;
  let mult = e === 1 ? 0.5 : 1, note = e === 1 ? '効きにくいことがある…' : '';
  if (d.cat === 'vir' && B.turn <= 2 && !d.fixed) { mult *= 1.4; note = '早めの 投与で よく効く!'; }
  if (e === 2 && isBest(d, p) && !d.fixed) { mult *= 1.5; note = '✨ こうか ばつぐん! ばっちりの 薬だ'; st('best');
    const broad = f.dots.filter(x => D[x.id].gut >= 3);
    if (broad.length && d.gut <= 2 && f.k >= 3) { f.dots = f.dots.filter(x => D[x.id].gut < 3); R.resist = Math.max(0, R.resist - 2); R.gut = Math.min(10, R.gut + 1); st('deesc'); note = '🎯 しぼりこみ成功! 広い薬を やめて ねらいの薬へ(耐性 -2・善玉菌 +1)'; } }
  let dmg = 0;
  const old = f.dots.find(x => x.id === id);
  if (d.fixed) dmg = d.fixed;
  else if (old) { old.t = DOT_T; note = 'もう 効いている。効く期間が のびただけ'; }
  else { f.dots.push({ id, per: Math.max(1, Math.round(base * 0.5 * mult)), t: DOT_T }); dmg = Math.round(base * 0.4 * mult); }
  if (p.combo && !d.fixed) { if (new Set(f.dots.map(x => x.id)).size < 2) { dmg = Math.ceil(dmg * 0.35); note = '1つだけでは 弱い。もう1つ 組み合わせよう!'; } else note = '併用で 効いている!'; }
  const blk = Math.min(f.block, dmg); f.block -= blk; dmg -= blk;
  f.hp = Math.max(0, f.hp - dmg);
  if (f.k < 3 && e === 2) { if (f.info && f.info.ask) { f.k = 3; st('mitate'); setTimeout(() => toast(`🩺 見立てどおり! 正体は <b>${p.ja}</b>(治療しながら わかった)`, 3000), 500); } else f.k = Math.max(f.k, 1); }
  SFX.play('drug'); renderBattle(); await fx('hit', ti); SFX.play(e === 2 ? 'hit' : 'hitSoft'); floatTxt('-' + dmg + (blk ? `(🛡️${blk})` : ''), ti); if (note) { if (/ばつぐん/.test(note)) { banner('✨ こうか ばつぐん!', 'best'); SFX.play('best'); } else if (/しぼりこみ/.test(note)) { banner('🎯 しぼりこみ 成功!', 'best'); SFX.play('deesc'); } else toast(note, 1800); }
  if (f.hp <= 0) await killFoe(ti);
  afterAction();
}
function banner(t, cls = '') { const d = document.createElement('div'); d.className = 'banner ' + cls; d.innerHTML = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1300); }
async function killFoe(i) {
  const el = app.querySelector(`[data-t="${i}"]`); if (el) el.classList.add('dead');
  const f = B.foes[i], p = P[f.pid];
  S.kills[p.id] = (S.kills[p.id] || 0) + 1; if (p.base) S.kills[p.base] = (S.kills[p.base] || 0) + 1;
  S.seen[p.id] = S.seen[p.id] || Date.now();
  SFX.play('kill'); floatTxt('やっつけた!', i, 'good');
  if (f.k < 3) { f.k = 3; await wait(200); SFX.play('reveal'); toast(`正体は <b>${p.ja}</b> だった!`, 2400); }
  await wait(450);
}
function afterAction() {
  const R = S.run;
  // 善玉菌が 0 → ステージ2以降は ディフィシル菌が ふえる
  if (B.gutHit && R.stage >= 2 && !B.cdSpawned && !B.foes.some(f => f.pid === 'cdiff' && f.hp > 0)) {
    B.cdSpawned = true;
    if (B.foes.every(f => f.hp <= 0) || B.foes.some(f => P[f.pid].combo)) { R.cdNext = true; toast('🥛 善玉菌が 0に… 次のバトルで ディフィシル菌が 出るかも。休けいや ヨーグルトで 善玉菌を ふやそう', 3600); }
    else { const nf = makeFoe('cdiff', 'battle', 0); nf.hp = nf.max = Math.ceil(nf.max * 0.6); nf.k = 3; nf.first = false; B.foes.push(nf); cdHelp('善玉菌が いなくなって、ディフィシル菌が ふえた!'); }
  }
  if (R.hp <= 0) return lose();
  if (B.foes.every(f => f.hp <= 0)) return win();
  renderBattle();
}
async function cdHelp(head) {
  S.seen.cdiff = S.seen.cdiff || Date.now();
  const ok = ['fdx', 'mnz', 'vcm'].filter(learned);
  let got = '';
  if (!ok.length) { learn('mnz'); got = '<p class="got">💊 <b>メトロニダゾール</b>を おぼえた!</p>'; }
  await modal(`<div class="row c">${ART.patho(P.cdiff, 3, 80)}</div><b>🥛 ${head}</b><p>抗菌薬で おなかの善玉菌が へると、ディフィシル菌が ふえる。</p><p>効く薬: <b>${['fdx', 'mnz', 'vcm'].map(id => D[id].ja + (learned(id) ? '(持っている)' : '')).join('・')}</b></p>${got}<p class="note">フィダキソマイシンは 善玉菌を へらさない。</p>`, ['たたかう']);
  save(); if (B) renderBattle();
}
async function testMenu() {
  const R = S.run, f = B.foes[B.tgt]; if (!f || B.busy) return;
  const cost = t => B.freeTest ? 0 : Math.max(0, t.cost - (R.relics.includes('scope') ? 1 : 0));
  const done = f.info || {};
  const i = await modal(`<b class="big">🔬 どの 検査を する?</b><p class="note">処方ポイント のこり ${B.ap}${B.freeTest ? '(次の 検査は タダ)' : ''}</p>`,
    TESTS.map(t => `<span class="scnb"><b>${t.em} ${t.ja} ${done[t.id] ? '(した)' : '・' + cost(t)}</b><span class="note">${t.desc}</span></span>`).concat(['やめる']));
  const t = TESTS[i]; if (!t || done[t.id]) return;
  if (B.ap < cost(t)) return toast('処方ポイントが 足りない');
  B.ap -= cost(t); B.freeTest = 0; doTestKind(t.id);
}
async function doTestKind(kind) {
  const f = B.foes[B.tgt], p = P[f.pid], t = TESTS.find(x => x.id === kind);
  f.info = f.info || {}; f.info[kind] = 1; st('test');
  const r = examResult(kind, p);
  const before = f.k; f.k = Math.max(f.k, r.k);
  f.info.lines = (f.info.lines || []).concat(r.lines.map(l => t.em + ' ' + l));
  SFX.play('test'); renderBattle();
  await modal(`<div class="evem">${t.em}</div><b class="big">${t.ja}の 結果</b>${r.img ? `<div class="row c">${r.img}</div>` : ''}<div class="result">${r.lines.map(l => `<p>${l}</p>`).join('')}</div>${f.k >= 3 && before < 3 ? `<p class="got">🎯 正体が わかった: <b>${p.ja}</b></p>` : ''}`, ['OK']);
  if (f.k >= 3 && before < 3) SFX.play('reveal');
  renderBattle();
}
async function doTest(free) {
  const R = S.run, f = B.foes[B.tgt]; if (!f || f.k >= 3) return;
  const cost = free || R.relics.includes('scope') ? 0 : 1; if (B.ap < cost) return;
  B.ap -= cost; st('test');
  const mode = R.stage ? SG(R).test : 'name';
  const p = P[f.pid];
  if (mode === 'name') f.k = 3; else if (mode === 'cat') f.k = Math.max(f.k, 1); else f.k = Math.max(f.k, p.cat === 'bac' ? 2 : 1);
  SE.play('ok');
  const msg = f.k >= 3 ? `迅速検査: <b>${p.ja}</b>!` : f.k === 2 ? `グラム染色: <b>${CAT[p.cat].ja}・${GRAM[p.gram]}</b>` : `検査: <b>${CAT[p.cat].ja}</b> のようだ`;
  toast('🔬 ' + msg, 2600); renderBattle();
}
function doHint() {
  const R = S.run, f = B.foes[B.tgt]; if (!f || f.k >= 3) return;
  if (B.free) B.free--; else { const i = R.items.indexOf('hint'); if (i < 0) return; R.items.splice(i, 1); R.hintUsed++; }
  f.k = 3; SFX.play('reveal'); toast(`💡 正体は <b>${P[f.pid].ja}</b>!`, 2400); renderBattle();
}
function useItem(i) {
  const R = S.run, it = R.items[i];
  if (it === 'hint') { if (B) return doHint(); return; }
  if (it === 'rapid') { if (!B) return; R.items.splice(i, 1); B.freeTest = 1; toast('🧪 次の 検査が タダ'); return renderBattle(); }
  R.items.splice(i, 1);
  if (it === 'probio') R.gut = Math.min(10, R.gut + 4);
  if (it === 'drink') R.hp = Math.min(R.max, R.hp + 10);
  if (it === 'okayu') { R.hp = Math.min(R.max, R.hp + 8); R.gut = Math.min(10, R.gut + 1); }
  if (it === 'sports') R.hp = Math.min(R.max, R.hp + 6);
  if (it === 'sweets') { R.hp = Math.min(R.max, R.hp + 14); R.gut = Math.max(0, R.gut - 2); toast('🍩 体力は もどったけど、善玉菌が へった…'); }
  if (it === 'energy') { if (!B) { R.items.splice(i, 0, it); return; } B.ap += 2; B.immDown += 2; toast('⚡ 処方ポイント +2! でも ねむれず めんえきが 下がった'); }
  SE.play('ok'); save(); B ? renderBattle() : mapScreen();
}
async function playerTurn() {
  const R = S.run;
  B.turn++; B.ap = B.apMax; B.usedTurn = new Set(); B.busy = false;
  for (const k in B.cd) if (B.cd[k] > 0) B.cd[k]--;
  B.foes.forEach(f => f.combo = new Set());
  if (R.gut <= 0 && R.stage <= 1 && B.turn > 1) { R.hp -= 1; toast('🥛 善玉菌が へって おなかが ゆるい… ❤️-1'); if (R.hp <= 0) return lose(); }
  if (B.tgt == null || !B.foes[B.tgt] || B.foes[B.tgt].hp <= 0) B.tgt = B.foes.findIndex(f => f.hp > 0);
  renderBattle();
}
async function endTurn() {
  if (B.busy) return; B.busy = true; SFX.play('turn'); renderBattle();
  const R = S.run;
  const imm = immPower();
  for (let i = 0; i < B.foes.length; i++) {
    const f = B.foes[i], p = P[f.pid]; if (f.hp <= 0) continue;
    const two = new Set(f.dots.map(x => x.id)).size >= 2;
    let med = 0; for (const x of f.dots) { med += p.combo && !two ? Math.ceil(x.per * 0.35) : x.per; x.t--; }
    f.dots = f.dots.filter(x => x.t > 0);
    if (!med && !imm) continue;
    f.hp = Math.max(0, f.hp - med - imm);
    renderBattle(); await fx('hit', i); floatTxt((med ? '💊-' + med + ' ' : '') + (imm ? '🛡️-' + imm : ''), i);
    if (f.hp <= 0) await killFoe(i);
  }
  if (B.foes.every(f => f.hp <= 0)) { renderBattle(); return win(); }
  for (let i = 0; i < B.foes.length; i++) {
    const f = B.foes[i], p = P[f.pid]; if (f.hp <= 0) continue;
    await wait(300);
    const [k, v] = foeIntent(f);
    if (k === 'atk') {
      let dmg = v; const g = Math.min(B.guard, dmg); B.guard -= g; dmg -= g;
      R.hp -= dmg; B.dmgTaken += dmg; f.toxin = false;
      SFX.play('hurt'); await fx('atk', i); floatTxt('❤️-' + dmg + (g ? `(🛡️${g})` : ''), null, 'bad'); const pb = app.querySelector('.patbox'); if (pb) { pb.classList.remove('hurt'); void pb.offsetWidth; pb.classList.add('hurt'); }
    } else if (k === 'grow') { if (f.dots.length) { floatTxt('薬が効いていて ふえられない', i); } else { f.hp = Math.min(Math.round(f.max * 1.2), f.hp + v); floatTxt('⬆️+' + v, i); } await wait(250); }
    else if (k === 'toxin') { f.toxin = true; floatTxt('☠️ どくそを ためた', i); await wait(250); }
    else if (k === 'hide') { f.block += R.relics.includes('gloves') ? Math.ceil(v / 2) : v; floatTxt('🛡️かくれた', i); await wait(250); }
    f.pi++;
    if (f.self) { f.self--; if (f.self <= 0) { f.hp = 0; toast(`🛡️ めんえきが ${f.k >= 3 ? p.ja : '病原体'}を やっつけた!`, 2600); await killFoe(i); } }
    if (R.hp <= 0) return lose();
  }
  B.guard = 0;
  renderBattle();
  if (B.foes.every(f => f.hp <= 0)) return win();
  await wait(250); playerTurn();
}
async function win() {
  const R = S.run; B.busy = true;
  st('win'); if (!B.dmgTaken) st('perfect');
  if (B.foes.some(f => P[f.pid].self) && !B.abxOnSelf) st('selfOk');
  R.gut = Math.min(10, R.gut + 2 + (R.relics.includes('yogurt') ? 1 : 0));
  checkAch(); save();
  banner('🎉 やっつけた!', 'best'); SFX.play('win');
  await wait(900);
  if (!B.o.onWin) { await severeEvent(); checkAch(); }
  if (B.o.onWin) { SE.play('clear'); await modal(`<b class="big">🎉 治った!</b><p>患者さんが 元気に なったよ。</p>`, ['つぎへ']); return B.o.onWin(); }
  rewardScreen(B.o.node);
}
async function lose() {
  const R = S.run; B.busy = true; SE.play('over');
  if (B.o.tut || (R.stage === 1)) {
    const s = JSON.parse(R.snap); Object.assign(R, s); R.hp = Math.max(R.hp, Math.ceil(R.max * 0.5)); save();
    await modal(`<b class="big">😵 患者さんが ぐったり…</b><p>もう一度 この バトルから やりなおそう。</p><p class="note">${B.o.tip || '分類を 思い出して、合う薬を えらぼう。わからない時は 🔬検査!'}</p>`, ['やりなおす']);
    if (B.o.onLose) return B.o.onLose();
    return startBattle(B.o);
  }
  if (R.stage === 9) return endlessOver();
  const fl = R.fl; S.run = null; save();
  await modal(`<b class="big">😵 治療 しっぱい…</b><p>${SG(R).ja} の ${fl + 1}階で 力つきた。</p><p class="note">図鑑と おぼえた薬は のこるよ。もう一度 チャレンジ!</p>`, ['タイトルへ']);
  title();
}

// ---------- ほうしゅう
function rewardPool(R) {
  const sg = SG(R);
  const want = new Set(); [...sg.enemies, ...sg.elites, ...sg.boss].forEach(pid => DRUGS.forEach(d => { if (effOf(d, P[pid])) want.add(d.id); }));
  ['apap', 'ors', 'drip', 'loxo', 'dclf', 'pred', 'bif', 'o2', 'nutri', 'sleep'].forEach(x => want.add(x));
  if (R.stage === 9) DRUGS.filter(d => d.endless).forEach(d => want.add(d.id));
  return [...want].filter(id => !learned(id));
}
function rewardScreen(node) {
  const R = S.run;
  const coin = Math.round((node === 'boss' ? 60 : node === 'elite' ? 28 : 12 + rnd(8)) * ((R.mod && R.mod.coin) || 1));
  R.coins += coin;
  if (node === 'boss') return R.stage === 9 ? actClear(coin) : stageClear();
  setTimeout(() => SFX.play('coin'), 150);
  const opts = [];
  const pool = shuffle(rewardPool(R));
  if (pool.length) opts.push({ k: 'learn', id: pool[0] });
  const ups = shuffle(DRUGS.filter(d => learned(d.id) && d.dmg && (R.lv[d.id] || 1) < 4));
  if (ups.length) opts.push({ k: 'up', id: ups[0].id });
  if (pool.length > 1 && Math.random() < 0.5) opts.push({ k: 'learn', id: pool[1] }); else if (ups[1]) opts.push({ k: 'up', id: ups[1].id });
  opts.push({ k: 'item', id: pick(ITEMS).id });
  let relic = null;
  if (node === 'elite') { relic = pick(RELICS.filter(r => !R.relics.includes(r.id) && !r.rare)); if (relic) R.relics.push(relic.id); }
  save();
  screen(`${topBar('ほうしゅう', null)}${statusBar(R)}<div class="reward"><p>🪙 ${coin} コイン ゲット!</p>${relic ? `<p class="got">${relic.em} <b>${relic.ja}</b> を 手に入れた!<br><span class="note">${relic.desc}</span></p>` : ''}
    <p>1つ えらぼう:</p>${opts.map((o, i) => {
      if (o.k === 'learn') { const d = D[o.id]; return `<button class="btn opt optd" data-o="${i}" style="--c:${dCol(d)}">${drugArt(d, 46)}<span><span class="note">🎁 新しい薬</span><b>${d.ja}</b><span class="note">${GI[d.cat]}・${'★'.repeat(stars(d))}</span></span></button>`; }
      if (o.k === 'up') { const d = D[o.id]; const lv = R.lv[d.id] || 1; return `<button class="btn opt optd" data-o="${i}" style="--c:${dCol(d)}">${drugArt(d, 46)}<span><span class="note">⬆️ 強くする Lv${lv}→${lv + 1}</span><b>${d.ja}</b><span class="note">⚔️ ${dmgOf(d, lv)} → ${dmgOf(d, lv + 1)}</span></span></button>`; }
      return `<button class="btn opt optd" data-o="${i}"><span class="bigem">${IT[o.id].em}</span><span><span class="note">🎒 アイテム</span><b>${IT[o.id].ja}</b><span class="note">${IT[o.id].desc}</span></span></button>`;
    }).join('')}<button class="btn" id="skip">いらない</button></div>`);
  bindStatus(false);
  app.querySelectorAll('[data-o]').forEach(b => b.onclick = async () => {
    const o = opts[+b.dataset.o]; SE.play('ok');
    if (o.k === 'learn') { learn(o.id); const d = D[o.id]; SFX.play('learn'); await modal(`<b class="big">🎁 新しい薬を おぼえた!</b>${drugCard(d)}`, ['やった!']); }
    if (o.k === 'up') R.lv[o.id] = (R.lv[o.id] || 1) + 1;
    if (o.k === 'item') { if (R.items.length < 3) R.items.push(o.id); else toast('アイテムは 3こまで'); }
    checkAch(); save(); mapScreen();
  });
  $('#skip').onclick = () => { SE.play('select'); mapScreen(); };
}
async function stageClear() {
  const R = S.run, n = R.stage;
  S.clear[n] = Math.max(S.clear[n] || 0, R.asc + 1);
  if (n >= 2 && !R.mepm) S.stat.narrowClear = 1;
  if (!R.gutZero) S.stat.gutClear = 1;
  if (R.resist <= 5) S.stat.lowResClear = 1;
  if (!R.hintUsed) S.stat.noHintClear = 1;
  if (!R.wrong) S.stat.noWrongClear = 1;
  const score = Math.round(Math.max(0, R.hp) / R.max * 40 + Math.max(0, 20 - R.wrong * 4) + Math.max(0, 20 - R.resist * 2) + (R.hintUsed ? 0 : 10) + (R.mepm ? 0 : 10));
  const rank = score >= 85 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : 'C';
  const key = n + '-' + R.asc; const prev = S.best[key];
  if (!prev || RANKS.indexOf(rank) > RANKS.indexOf(prev)) S.best[key] = rank;
  if (rank === 'S') S.stat.rankS = (S.stat.rankS || 0) + 1;
  S.run = null; checkAch(); save();
  SFX.play('clear'); if (rank === 'S') setTimeout(() => SFX.play('rankS'), 1500);
  await modal(`<div class="row c">${ART.doctor(S.look, 80)}${ART.patient(PATIENTS[STAGES[n - 1].patient].look, false, 70)}</div><b class="big">🎉 ステージ${n} クリア!</b><div class="rank r${rank}">名医ランク <b>${rank}</b><span class="note">${score}点</span></div><p>${PATIENTS[STAGES[n - 1].patient].ja}は すっかり 元気に なった!</p>
    <p class="note">効かない薬を 使った回数: ${R.wrong} ・ 耐性メーター: ${R.resist} ・ ヒント: ${R.hintUsed}</p>${n < 3 ? `<p>ステージ${n + 1} が 解放された!</p>` : '<p>全ステージ クリア! むずかしさを 上げて ちょうせんしよう。</p>'}<p class="note">むずかしさ${R.asc + 1} が えらべるように なった。</p>`, ['やったね!']);
  title();
}

// ---------- ショップ・休けい・宝箱・イベント
function shopScreen() {
  const R = S.run;
  if (!R.shop || R.shop.f !== R.fl) {
    const rel = shuffle(RELICS.filter(r => !R.relics.includes(r.id)))[0];
    const ups = shuffle(DRUGS.filter(d => learned(d.id) && d.dmg && (R.lv[d.id] || 1) < 4)).slice(0, 2);
    const nd = shuffle(rewardPool(R))[0];
    R.shop = { f: R.fl, list: [...ITEMS.map(i => ({ k: 'item', id: i.id, price: i.price })), rel && { k: 'relic', id: rel.id, price: rel.rare ? 110 : 70 }, ...ups.map(d => ({ k: 'up', id: d.id, price: 40 })), nd && { k: 'learn', id: nd, price: 45 }, { k: 'heal', price: 20 }, { k: 'gut', price: 15 }].filter(Boolean), sold: [] };
  }
  const L = R.shop;
  const name = o => o.k === 'item' ? `<span class="bigem">${IT[o.id].em}</span><b>${IT[o.id].ja}</b><span class="note">${IT[o.id].desc}</span>` : o.k === 'relic' ? `<span class="bigem">${RL(o.id).em}</span><b>${RL(o.id).ja}</b><span class="note">ずっと効く: ${RL(o.id).desc}</span>` : o.k === 'up' ? `${drugArt(D[o.id], 44)}<b>${D[o.id].ja}</b><span class="note">⬆️ 強くする Lv${R.lv[o.id] || 1}→${(R.lv[o.id] || 1) + 1}</span>` : o.k === 'learn' ? `${drugArt(D[o.id], 44)}<b>${D[o.id].ja}</b><span class="note">🎁 新しい薬・${GI[D[o.id].cat]}</span>` : o.k === 'heal' ? '<span class="bigem">💧</span><b>点滴で 休む</b><span class="note">体力 +12</span>' : '<span class="bigem">🥛</span><b>ヨーグルト</b><span class="note">善玉菌 +5</span>';
  screen(`${topBar('🏪 ショップ', null)}${statusBar(R)}<div class="shop">${L.list.map((o, i) => `<button class="btn opt stile" data-b="${i}" ${L.sold.includes(i) || R.coins < o.price ? 'disabled' : ''}>${name(o)}<em>${L.sold.includes(i) ? '売りきれ' : '🪙' + o.price}</em></button>`).join('')}<button class="btn main" id="out">店を出る</button></div>`);
  bindStatus(false);
  app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => {
    const i = +b.dataset.b, o = L.list[i]; if (R.coins < o.price) return;
    if (o.k === 'item' && R.items.length >= 3) return toast('アイテムは 3こまで');
    R.coins -= o.price; L.sold.push(i); st('buy'); SFX.play('coin');
    if (o.k === 'item') R.items.push(o.id);
    if (o.k === 'relic') R.relics.push(o.id);
    if (o.k === 'up') R.lv[o.id] = (R.lv[o.id] || 1) + 1;
    if (o.k === 'learn') learn(o.id);
    if (o.k === 'heal') R.hp = Math.min(R.max, R.hp + 12);
    if (o.k === 'gut') R.gut = Math.min(10, R.gut + 5);
    checkAch(); save(); shopScreen();
  });
  $('#out').onclick = () => { SE.play('select'); mapScreen(); };
}
function restScreen() {
  const R = S.run; const heal = Math.round(R.max * 0.3 * (R.relics.includes('kit') ? 1.5 : 1));
  const ups = DRUGS.filter(d => learned(d.id) && d.dmg && (R.lv[d.id] || 1) < 4);
  screen(`${topBar('🛏️ 休けい', null)}${statusBar(R)}<div class="reward"><p>ひと休み。どうする?</p>
    <button class="btn opt optd" id="r1"><span class="bigem">😴</span><span><b>休む</b><span class="note">体力 +${heal}</span></span></button>
    <button class="btn opt optd" id="r2" ${ups.length ? '' : 'disabled'}><span class="bigem">📖</span><span><b>勉強する</b><span class="note">薬を 1つ 強くする</span></span></button>
    <button class="btn opt optd" id="r3"><span class="bigem">🥛</span><span><b>ヨーグルトを 食べる</b><span class="note">善玉菌が 満タン・耐性メーター -2</span></span></button></div>`);
  bindStatus(false);
  $('#r1').onclick = () => { SE.play('ok'); R.hp = Math.min(R.max, R.hp + heal); save(); mapScreen(); };
  $('#r2').onclick = () => upgradePick(() => mapScreen());
  $('#r3').onclick = () => { SE.play('ok'); R.gut = 10; R.resist = Math.max(0, R.resist - 2); save(); mapScreen(); };
}
function upgradePick(done) {
  const R = S.run; const ups = DRUGS.filter(d => learned(d.id) && d.dmg && (R.lv[d.id] || 1) < 4);
  screen(`${topBar('どの薬を 強くする?', null)}<div class="reward">${ups.map(d => `<button class="btn opt optd" data-u="${d.id}" style="--c:${dCol(d)}">${drugArt(d, 40)}<span><b>${d.ja}</b><span class="note">Lv${R.lv[d.id] || 1}→${(R.lv[d.id] || 1) + 1} ・ ⚔️${dmgOf(d, R.lv[d.id] || 1)}→${dmgOf(d, (R.lv[d.id] || 1) + 1)}</span></span></button>`).join('')}</div>`);
  app.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { SE.play('ok'); R.lv[b.dataset.u] = (R.lv[b.dataset.u] || 1) + 1; save(); done(); });
}
async function treasureScreen() {
  const R = S.run; const r = pick(RELICS.filter(x => !R.relics.includes(x.id) && !x.rare)) || RELICS[0];
  if (!R.relics.includes(r.id)) R.relics.push(r.id); R.coins += 15; save(); SFX.play('learn');
  await modal(`<b class="big">🎁 宝箱!</b><p>${r.em} <b>${r.ja}</b></p><p class="note">${r.desc}</p><p>🪙 +15</p>`, ['やった!']);
  mapScreen();
}
async function eventScreen() {
  const R = S.run; st('event');
  const seen = R.evSeen || (R.evSeen = []);
  const ev = pick(EVENTS.filter(e => !seen.includes(e.id)).length ? EVENTS.filter(e => !seen.includes(e.id)) : EVENTS); seen.push(ev.id);
  const EM = { stop: '💊', cold: '🤧', water: '🥤', fish: '🐟', vaccine: '💉', fleming: '🧫', wash: '🧼', yogurt: '🥛', nurse: '👩‍⚕️', lab: '🔬', night: '🌙', stress: '💼' };
  const i = await modal(`<div class="evem">${EM[ev.id] || '❓'}</div><b class="big">${ev.ja}</b><p>${ev.text}</p>`, ev.choices.map(c => c[0]));
  const c = ev.choices[i][1];
  if (c.coins < 0 && R.coins < -c.coins) { await modal('<b>コインが たりない…</b>', ['OK']); return mapScreen(); }
  if (c.coins) R.coins += c.coins; if (c.resist) R.resist = Math.max(0, R.resist + c.resist); if (c.gut) R.gut = clamp(R.gut + c.gut, 0, 10);
  if (c.heal) R.hp = Math.min(R.max, R.hp + c.heal); if (c.hurt) R.hp = Math.max(1, R.hp - c.hurt);
  if (c.item && R.items.length < 3) R.items.push(c.item);
  if (c.imm) R.imm = (R.imm || 0) + c.imm;
  if (c.relic && !R.relics.includes(c.relic)) R.relics.push(c.relic);
  if (c.upgrade && learned(c.upgrade)) R.lv[c.upgrade] = (R.lv[c.upgrade] || 1) + 1;
  save(); SE.play(c.fight ? 'ng' : 'ok');
  await modal(`<div class="evem">${c.fight ? '😱' : c.resist > 0 || c.imm ? '😟' : '😊'}</div><p>${c.msg}</p>`, ['OK']);
  if (c.fight) return startBattle({ foes: [c.fight], node: 'battle' });
  if (c.upgradeAny) return upgradePick(() => mapScreen());
  mapScreen();
}

// ---------- 図鑑
function zukan(tab) {
  const pz = PATHO.filter(p => !p.base);
  const body = tab === 'p'
    ? `<div class="zgrid">${pz.map(p => { const s = S.seen[p.id], k = S.kills[p.id] || 0; return `<button class="zc ${s ? '' : 'no'}" data-zp="${p.id}" ${s ? '' : 'disabled'}>${ART.patho(p, s ? 3 : 0, 58)}<b>${s ? p.ja : '???'}</b>${s ? `<span class="tag" style="background:${CAT[p.cat].col}">${CAT[p.cat].ja}</span><span class="note">たおした ${k}</span>` : ''}</button>`; }).join('')}</div>`
    : `<div class="zlist">${['abx', 'vir', 'fun', 'par', 'sup'].map(c => `<h4>${GI[c]} <span class="note">${DRUGS.filter(d => d.cat === c && learned(d.id)).length}/${DRUGS.filter(d => d.cat === c).length}</span></h4><div class="zdg">${DRUGS.filter(d => d.cat === c).map(d => learned(d.id) ? `<button class="zdc" data-zd="${d.id}" style="--c:${dCol(d)}">${drugArt(d, 44)}<b>${d.ja}</b><span class="dc-star">${'★'.repeat(stars(d))}</span></button>` : '<div class="zdc no"><span class="q">?</span><b>???</b></div>').join('')}</div>`).join('')}</div>`;
  screen(`${topBar('図鑑', title)}<div class="tabs big"><button class="tab ${tab === 'p' ? 'on' : ''}" data-zt="p">🦠 病原体 ${pz.filter(p => S.seen[p.id]).length}/${pz.length}</button><button class="tab ${tab === 'd' ? 'on' : ''}" data-zt="d">💊 薬 ${DRUGS.filter(d => learned(d.id)).length}/${DRUGS.length}</button></div>${body}`);
  bindBack(title);
  app.querySelectorAll('[data-zt]').forEach(b => b.onclick = () => { SE.play('select'); zukan(b.dataset.zt); });
  app.querySelectorAll('[data-zp]').forEach(b => b.onclick = () => {
    const p = P[b.dataset.zp]; SE.play('select');
    modal(pathoCard(p, { kills: S.kills[p.id] || 0 }), ['とじる', '📕 攻略本で 見る']).then(i => { if (i === 1) BOOK.open(p.ja); });
  });
  app.querySelectorAll('[data-zd]').forEach(b => b.onclick = () => { SE.play('select'); drugInfo(b.dataset.zd, false); });
}
function achScreen() {
  S.newAch = 0; save();
  const n = ACH.filter(a => S.ach[a.id]).length;
  screen(`${topBar(`じっせき ${n}/${ACH.length}`, title)}<div class="achs">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? 'on' : ''}"><span>${S.ach[a.id] ? a.em : '🔒'}</span><div><b>${a.ja}</b><span class="note">${a.desc}</span></div></div>`).join('')}</div><p class="note c">じっせきで 新しい お医者さんの 見た目が 解放されるよ。</p>`);
  bindBack(title);
}
