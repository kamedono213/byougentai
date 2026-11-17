'use strict';
// 勉強アプリ共通: 「もどる」確認スニペット。app.js の 'use strict' 直後に貼り、ROUTED をアプリに合わせる
// 「もどる」「やめる」を押したら、本当にもどるか確かめる(スマホの「戻る」操作も)。
// 画面のボタンは id="back" / id="quit"。もともと確認があるボタンは data-noconfirm をつけて除く
(() => {
  let bypass = false, ignorePop = false;
  const pass = fn => { bypass = true; fn(); setTimeout(() => { bypass = false; }, 500); };
  const ask = onYes => {
    if (document.getElementById('leave-confirm')) return;
    const d = document.createElement('div');
    d.id = 'leave-confirm'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:16px';
    d.innerHTML = '<div style="background:#fff;color:#222;border-radius:16px;padding:20px 18px;max-width:320px;width:100%;display:grid;gap:14px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25)">'
      + '<b style="font-size:18px">本当にもどりますか？</b><span style="font-size:14px;color:#555">いまの続きは消えることがあります。</span>'
      + '<div style="display:flex;gap:10px"><button type="button" data-a="no" style="flex:1;padding:12px;border-radius:12px;border:1px solid #ccc;background:#fff;color:#222;font:inherit;font-weight:700">つづける</button>'
      + '<button type="button" data-a="yes" style="flex:1;padding:12px;border-radius:12px;border:0;background:#2f6fd0;color:#fff;font:inherit;font-weight:700">もどる</button></div></div>';
    d.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (!a && e.target !== d) return;
      d.remove();
      if (a && a.dataset.a === 'yes') onYes();
    });
    document.body.appendChild(d);
    d.querySelector('[data-a="no"]').focus();
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('#back, #quit');
    if (!b || bypass || b.hasAttribute('data-noconfirm')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    ask(() => pass(() => b.click()));
  }, true);
  // ROUTED: このアプリが画面ごとに履歴を積むか。積まないアプリは、戻る操作を受け止める「しおり」を1つ積んでおく
  const ROUTED = false; // 画面ごとに history.pushState するアプリは true
  const guard = () => history.pushState({ leaveGuard: 1 }, '');
  if (!ROUTED) guard();
  window.addEventListener('popstate', e => {
    if (ignorePop) { ignorePop = false; e.stopImmediatePropagation(); return; }
    if (bypass) return;
    e.stopImmediatePropagation();
    if (!ROUTED) {
      const b = document.querySelector('#back, #quit');
      if (!b) { history.back(); return; }                 // メニュー画面ではそのままアプリを閉じる
      guard();
      if (b.hasAttribute('data-noconfirm')) { b.click(); return; }
      ask(() => pass(() => b.click()));
      return;
    }
    ignorePop = true; history.go(1); // いったん元の画面にとどまる
    ask(() => pass(() => history.back()));
  }, true);
})();

// ---------- ふりがな(ちりパズルと同じく、漢字の上に小さく読みを出す)
// 辞書 window.FURI は furi.js(onze.ltd/tools/furigana/make-furi.js が自動生成)。
// 画面に出た文字を自動で包むので、各画面のコードは変えなくてよい。答え合わせに使う textContent は変わらない(読みは CSS で表示)。
// 切りかえボタンは、data-furi-slot を付けた場所に自動で入る。設定はアプリごとに保存
(() => {
  const D = window.FURI || {};
  // 先頭の1文字ごとに、長い順に並べておく(文まるごと → 単語の順に当てはめる)
  const byHead = {};
  Object.keys(D).sort((a, b) => b.length - a.length).forEach(k => (byHead[k[0]] = byHead[k[0]] || []).push(k));
  const KEY = 'furi:' + location.pathname;
  let on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) { /* 保存できなくても動く */ }
  const css = document.createElement('style');
  // アプリ側の「span に〜」という指定が効かないように、ルビの span は !important で固める
  css.textContent = '.rbw,.rb{margin:0!important;border:0!important;background:none!important;min-width:0!important;font:inherit!important;color:inherit!important;letter-spacing:inherit!important;text-indent:0!important}'
    + '.rbw{display:inline!important;padding:0!important}'
    + '.rb{display:inline-block!important;position:relative!important;padding:0!important}'
    // ふりがなありの時は行の高さを広げ、読みは行間(漢字の上のすき間)に置く。行ごとに高さがばらつかない
    + 'html.furi body{line-height:2.2}'
    + 'html.furi .rb{line-height:max(2.2em, 1em + 17px)!important}'
    + 'html.furi .rb::before{content:attr(data-rt);position:absolute;bottom:calc(50% + 1.02em);left:50%;transform:translateX(-50%);font-size:max(.5em,7.5px);font-weight:700;line-height:1.1;white-space:nowrap;letter-spacing:0;pointer-events:none}'
    + '.furi-tools{display:inline-flex;flex-wrap:wrap;gap:6px;justify-self:start;align-self:center;width:auto;flex:none;line-height:1.4}'
    + '.furi-toggle{width:auto;flex:none;line-height:1.4;border:1.5px solid rgba(127,127,127,.4);background:transparent;color:inherit;border-radius:999px;padding:4px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}'
    + '.furi-toggle[aria-pressed="true"]{border-color:currentColor}';
  document.head.appendChild(css);
  const apply = () => document.documentElement.classList.toggle('furi', on);
  apply();
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'TITLE']);
  const ok = el => {
    for (let e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (e.namespaceURI === 'http://www.w3.org/2000/svg') return false;
      if (e.classList.contains('rb') || e.classList.contains('rbw') || e.hasAttribute('data-nofuri')) return false;
      if (e.lang && !/^ja/i.test(e.lang)) return false; // 外国語の文字(中国語の漢字など)には付けない
      if (SKIP.has(e.tagName)) return false;
    }
    return true;
  };
  function wrapText(node) {
    const t = node.nodeValue;
    if (!/[一-鿿々]/.test(t)) return;
    const frag = document.createDocumentFragment();
    let last = 0, hit = false;
    for (let i = 0; i < t.length;) {
      const k = (byHead[t[i]] || []).find(x => t.startsWith(x, i));
      if (!k) { i++; continue; }
      hit = true;
      if (i > last) frag.appendChild(document.createTextNode(t.slice(last, i)));
      for (const seg of D[k]) {
        if (typeof seg === 'string') { frag.appendChild(document.createTextNode(seg)); continue; }
        const s = document.createElement('span'); s.className = 'rb'; s.dataset.rt = seg[1]; s.textContent = seg[0];
        frag.appendChild(s);
      }
      i = last = i + k.length;
    }
    if (!hit) return;
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    // 1つの span にまとめて入れる(flex や grid の中で、ルビごとに改行されないように)
    const w = document.createElement('span'); w.className = 'rbw'; w.appendChild(frag);
    node.replaceWith(w);
  }
  // 切りかえボタンを入れる箱(効果音ボタンもここに入る)
  function tools(slot) {
    let box = slot.querySelector(':scope > .furi-tools');
    if (!box) { box = document.createElement('span'); box.className = 'furi-tools'; box.setAttribute('data-nofuri', ''); slot.appendChild(box); }
    return box;
  }
  function toggleHtml() { return `<button type="button" class="furi-toggle" data-furi-toggle aria-pressed="${on}">ふりがな ${on ? 'あり' : 'なし'}</button>`; }
  function scan(root) {
    if (root.nodeType === 3) { if (ok(root.parentNode)) wrapText(root); return; }
    if (root.nodeType !== 1 || !ok(root)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
    let n; while ((n = w.nextNode())) if (ok(n.parentNode)) list.push(n);
    list.forEach(wrapText);
    const slots = root.querySelectorAll ? [...root.querySelectorAll('[data-furi-slot]')] : [];
    if (root.hasAttribute && root.hasAttribute('data-furi-slot')) slots.push(root);
    slots.forEach(s => { if (!s.querySelector('[data-furi-toggle]')) tools(s).insertAdjacentHTML('afterbegin', toggleHtml()); });
  }
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) scan(n); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-furi-toggle]'); if (!b) return;
    on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (err) { /* 保存できなくても切りかわる */ }
    apply();
    document.querySelectorAll('[data-furi-toggle]').forEach(x => { x.setAttribute('aria-pressed', on); x.textContent = 'ふりがな ' + (on ? 'あり' : 'なし'); });
  });
  window.furiTools = tools;
  if (document.body) scan(document.body);
})();

// ---------- 効果音(Web Audio で合成。音声ファイルは使わない)
// SE.play('ok') のように呼ぶ。音の名前: start / select / ok / ng / star / result / perfect / land / clear / over
// SE.chain(n) は連鎖の n 段目(段ごとに高くなる)。
// 「音あり/なし」ボタンは data-furi-slot の場所に自動で入る(ふりがなボタンのとなり)。設定はアプリごとに保存
const SE = (() => {
  const KEY = 'se-muted:' + location.pathname;
  let muted = false, ctx = null;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* 保存できなくても動く */ }
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // 1音: 周波数・開始(秒)・長さ・波形・音量・(最後の周波数)
  function tone(freq, at, dur, type = 'sine', vol = 0.18, slideTo = null) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const SOUNDS = {
    start: () => { tone(523, 0, 0.09, 'triangle'); tone(784, 0.08, 0.14, 'triangle'); },
    select: () => tone(660, 0, 0.06, 'triangle', 0.12),
    ok: () => { tone(880, 0, 0.12, 'sine', 0.2); tone(1319, 0.1, 0.28, 'sine', 0.2); },
    ng: () => tone(220, 0, 0.32, 'square', 0.07, 150),
    star: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.07, 0.22, 'sine', 0.14)),
    result: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.11, 0.18, 'triangle')),
    perfect: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.16, 'triangle')); [1047, 1319, 1568].forEach(f => tone(f, 0.42, 0.6, 'sine', 0.1)); },
    land: () => tone(180, 0, 0.08, 'triangle', 0.16, 110),
    clear: () => { [659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.14, 'triangle')); tone(1319, 0.3, 0.45, 'sine', 0.12); },
    over: () => [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.26, 'triangle', 0.14)),
  };
  function play(name) { if (muted || !SOUNDS[name]) return; try { SOUNDS[name](); } catch (e) { /* 音が出せない環境でも遊べる */ } }
  function chain(n) {
    if (muted) return;
    try { const f = 440 * Math.pow(2, Math.min(n - 1, 9) * 2 / 12); tone(f, 0, 0.1, 'triangle', 0.16); tone(f * 1.5, 0.07, 0.18, 'sine', 0.12); } catch (e) { /* 同上 */ }
  }
  const btn = () => `<button type="button" class="furi-toggle" data-se-toggle aria-pressed="${!muted}">${muted ? '🔇 音なし' : '🔊 音あり'}</button>`;
  function addButtons(root) {
    if (!root.querySelectorAll) return;
    const slots = [...root.querySelectorAll('[data-furi-slot]')];
    if (root.hasAttribute && root.hasAttribute('data-furi-slot')) slots.push(root);
    slots.forEach(s => { if (!s.querySelector('[data-se-toggle]')) (window.furiTools ? window.furiTools(s) : s).insertAdjacentHTML('beforeend', btn()); });
  }
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) addButtons(n); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-se-toggle]'); if (!b) return;
    muted = !muted; try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (err) { /* 保存できなくても切りかわる */ }
    document.querySelectorAll('[data-se-toggle]').forEach(x => { x.setAttribute('aria-pressed', !muted); x.textContent = muted ? '🔇 音なし' : '🔊 音あり'; });
    play('select');
  });
  if (document.body) addButtons(document.body);
  return { play, chain, get muted() { return muted; } };
})();

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
  { id: 'cdiff', ja: 'ディフィシル菌', full: 'クロストリディオイデス・ディフィシル(CD)', cat: 'bac', gram: '+', shape: 'spore', col: '#b08968', place: 'おなか', sym: '抗菌薬のあとのげり', hp: 24, pat: [['atk', 5], ['toxin', 0], ['atk', 4]], stage: [2, 3],
    fact: '抗菌薬でおなかの善玉菌がへると、すきをついてふえる菌。どくそを出してげりをおこす。前はクロストリジウム・ディフィシルとよばれていて、病院では「CD」とよぶ。検査では GDH抗原と どくそ(トキシン)を しらべる。バンコマイシン(飲み薬)などを使う。' },
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
  { id: 'pza', ja: 'ピラジナミド', cls: '抗結核薬', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 1, eff: { tb: 2 },
    desc: '酸性の場所に いる 結核菌に 効く。治療の はじめの 2か月に 使う。', fact: '結核の 標準治療は イソニアジド・リファンピシン・ピラジナミド・エタンブトールの 4剤で はじめる。' },
  { id: 'eb', ja: 'エタンブトール', cls: '抗結核薬', cat: 'abx', cost: 1, cd: 0, dmg: 8, gut: 0, rsk: 1, eff: { tb: 2 },
    desc: '結核菌の 細胞壁づくりを じゃまする。目(視力)への 副作用に 注意する。', fact: '色の 見え方が かわる 副作用が 出ることがある。' },
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
    desc: 'ヨモギのなかまからとれるアルテミシニンを使ったマラリアの薬。', fact: 'アルテミシニンを見つけたトゥ・ヨウヨウさん(中国)は、2015年にノーベル賞を受けた。' },
  { id: 'apg', ja: 'アトバコン・プログアニル', brand: 'マラロン', cls: '抗マラリア薬', cat: 'par', cost: 2, cd: 1, dmg: 12, gut: 0, rsk: 0, eff: { malaria: 2 },
    desc: 'マラリアの治療と予防に使う。', fact: 'マラリアのある国へ行く時は、予防のために飲むことがある。' },
  // ---- 体をささえる(どの病原体にもダメージはないが、患者を守る)
  { id: 'ors', ja: '経口補水液', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 6, gut: 0, rsk: 0, eff: {},
    desc: '水分と塩分をすばやく補う。げり・はくときにいちばん大事。患者の体力を回復する。', fact: 'ふつうの水やお茶より、体にすばやく吸収されるように作られている。' },
  { id: 'apap', ja: 'アセトアミノフェン', brand: 'カロナール', cls: '解熱鎮痛薬', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 4, guard: 3, gut: 0, rsk: 0, eff: {},
    desc: '熱やいたみをやわらげて、患者を楽にする(病原体はやっつけない)。次のこうげきを少しへらす。インフルエンザや 水ぼうそうの 熱にも 使える。', fact: '子どもの熱や、インフルエンザの熱に すすめられる 解熱剤。' },
  { id: 'drip', ja: '点滴(輸液)', cls: '体をささえる', cat: 'sup', cost: 2, cd: 1, dmg: 0, heal: 9, gut: 0, rsk: 0, eff: {},
    desc: '血管から 水分と 塩分・栄養を 入れて、体力を 大きく 回復する。', fact: '口から 飲めないほど ぐったりした時に 使う。' },
  { id: 'dclf', ja: 'ジクロフェナク', brand: 'ボルタレン', cls: '解熱鎮痛薬(NSAIDs)', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 9, guard: 4, hurt: 1, nsaid: 2, gut: 0, rsk: 0, eff: {},
    desc: '強い 痛み止め・熱さまし。<b>インフルエンザの 子どもには 使わない</b>(脳症が 重くなる おそれ)。胃も あれやすい。', fact: '日本では、インフルエンザの 子どもに ジクロフェナクや メフェナム酸を 使わないように 決められている。' },
  { id: 'loxo', ja: 'ロキソプロフェン', brand: 'ロキソニン', cls: '解熱鎮痛薬(NSAIDs)', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 6, guard: 3, hurt: 1, nsaid: 1, gut: 0, rsk: 0, eff: {},
    desc: '熱と いたみを しっかり おさえる。ただし 胃が あれやすい(副作用 ❤️-1)。インフルエンザ・水ぼうそうの時は さける。', fact: 'インフルエンザの 熱には アセトアミノフェンが すすめられる。' },
  { id: 'pred', ja: 'プレドニゾロン', cls: 'ステロイド', cat: 'sup', cost: 1, cd: 2, dmg: 0, heal: 8, guard: 5, immDown: 3, gut: 0, rsk: 0, eff: {},
    desc: '炎症を 強く おさえて 体を 楽にする。でも <b>めんえきも 下げる</b>(めんえき -3)。', fact: 'ステロイドは よく効く 大事な薬。でも 感染症の時は 使い方に 注意が いる。' },
  { id: 'bif', ja: '整腸剤', sub: 'ビフィズス菌・酪酸菌など', brand: 'ビオフェルミン・ミヤBM', cls: '体をささえる', cat: 'sup', cost: 1, cd: 0, dmg: 0, heal: 2, gutUp: 3, gut: 0, rsk: 0, eff: {},
    desc: 'おなかの 善玉菌を ふやす(善玉菌 +3)。', fact: '抗菌薬と いっしょに 出されることが 多い。' },
  { id: 'o2', ja: '酸素', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 1, guard: 6, gut: 0, rsk: 0, eff: {},
    desc: '息を 楽にして、次の こうげきを 大きく へらす(🛡️+6)。', fact: '肺の 病気で 血液の 酸素が へった時に 使う。' },
  { id: 'nutri', ja: '栄養', sub: 'バランスのよい 食事', cls: 'めんえきサポート', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 2, immUp: 2, gut: 0, rsk: 0, eff: {},
    desc: 'しっかり 食べて、めんえきを 強くする(めんえき +2、このバトルの間)。', fact: 'タンパク質や ビタミンが 足りないと、めんえきが はたらきにくい。' },
  { id: 'sleep', ja: '安静', sub: 'よく ねる', cls: 'めんえきサポート', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 3, immUp: 1, gut: 0, rsk: 0, eff: {},
    desc: 'ゆっくり 休んで、体力と めんえきを 守る(体力 +3・めんえき +1)。', fact: 'ねむりが 足りないと、かぜを ひきやすくなる という 研究がある。' },
  { id: 'okayu', ja: 'おかゆ', sub: 'おなかに やさしい ごはん', cls: '体をささえる', cat: 'sup', cost: 1, cd: 0, dmg: 0, heal: 3, guard: 1, gutUp: 1, gut: 0, rsk: 0, eff: {},
    desc: 'やわらかくて 消化に いい。げりの時の エネルギーに。<b>はいている時は 経口補水液が 先</b>。はげしく はく時は 逆効果。', fact: 'げりや はき気が おさまってきたら、おかゆ・うどんなど 消化の いいものから 少しずつ。' },
  { id: 'cool', ja: 'クーリング', sub: 'おでこ・わきの下を 冷やす', cls: '体をささえる', cat: 'sup', cost: 1, cd: 0, dmg: 0, heal: 2, guard: 2, gut: 0, rsk: 0, eff: {},
    desc: '冷たいタオルや 保冷剤で 冷やして 楽にする。薬を 使わない ささえ。', fact: '首・わきの下・足のつけねなど、太い血管の 通る所を 冷やすと 気持ちいい。' },
  { id: 'humid', ja: '加湿器', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 2, guard: 3, gut: 0, rsk: 0, eff: {},
    desc: '部屋の 空気を しめらせて、のどや 鼻を 楽にする。', fact: '空気が かわくと のどの ねんまくが 弱りやすい。冬は とくに 大事。' },
  { id: 'honey', ja: 'はちみつ', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 3, guard: 1, gut: 0, rsk: 0, eff: {},
    desc: '子どもの せきを やわらげる。<b>1歳未満の 赤ちゃんには ぜったい あげない</b>。', fact: '1歳未満は ボツリヌス症の おそれが あるので、はちみつは 食べさせない。' },
  { id: 'dxm', ja: 'デキストロメトルファン', brand: 'メジコン', cls: '鎮咳薬(せき止め)', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 3, guard: 2, gut: 0, rsk: 0, eff: {},
    desc: 'せきを 出す 脳の 命令を おさえる せき止め。', fact: 'せきは 体を 守る はたらきでも あるので、止めすぎない ことも 大事。' },
  { id: 'carbo', ja: 'カルボシステイン', brand: 'ムコダイン', cls: '去痰薬(たんを 出しやすく)', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 3, guard: 2, gut: 0, rsk: 0, eff: {},
    desc: 'ねばねばの たんを さらさらにして 出しやすくする。', fact: '子どもの かぜや 中耳炎でも よく 出される 薬。' },
  { id: 'domp', ja: 'ドンペリドン', brand: 'ナウゼリン', cls: '制吐薬(はき気止め)', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 3, guard: 2, gut: 0, rsk: 0, eff: {},
    desc: 'はき気を おさえて、水分を とれるように する。', fact: 'はき気が おさまったら、経口補水液を 少しずつ。' },
  { id: 'antih', ja: '抗ヒスタミン薬', sub: 'かゆみ止め', cls: '体をささえる', cat: 'sup', cost: 1, cd: 1, dmg: 0, heal: 2, guard: 3, gut: 0, rsk: 0, eff: {},
    desc: 'かゆみを おさえて、かきこわしを ふせぐ。', fact: 'かきこわすと、そこから 細菌が 入って とびひに なることも。' },
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
  { id: 'tantei', em: '🕵️', ja: '名探偵の 手帳', desc: '正体を 見ぬいた 相手には 薬の ダメージ +30%(検査で しらべる 型)' },
  { id: 'pin', em: '🎯', ja: 'ピンポイント', desc: 'ばっちりの 薬(第一選択)の ダメージ +40%。広く 効く 薬は -30%(ねらいうち 型)' },
  { id: 'immb', em: '🦠', ja: 'めんえき ブースト', desc: 'めんえき隊を 1ターンに 2回 使える(めんえき 型)' },
  { id: 'carem', em: '🫖', ja: 'ささえ 名人', desc: 'ぴったりの ささえの 効果が もっと 大きく、めんえき隊も 早く 育つ(ささえ 型)' },
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
  { id: 'okayu', em: '🍚', ja: 'おかゆ', desc: '患者の体力 +8・善玉菌 +1', price: 25 },
  { id: 'sports', em: '🧃', ja: 'スポーツドリンク', desc: '患者の体力 +6', price: 15 },
  { id: 'sweets', em: '🍩', ja: 'お菓子の山', desc: '患者の体力 +14。でも 善玉菌 -2(かたよった 食事)', price: 20 },
  { id: 'energy', em: '⚡', ja: 'エナジードリンク', desc: '処方ポイント +2(このターン)。でも 夜 ねむれず めんえき ダウン(敵の体力 +4)', price: 25 },
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
  { id: 'night', ja: '夜ふかし', text: '患者さんが「ねむれないから、夜おそくまで ゲームしてもいい?」と 聞いてきた。',
    choices: [['早く ねようね、と 伝える', { heal: 6, msg: 'ねむりは めんえきを 守る。体力 +6' }],
      ['今日だけ いいよ', { coins: 15, imm: 2, msg: 'ねぶそくで めんえきが 下がった…。次の 2回の バトルは 病原体が 強い。15コイン' }]] },
  { id: 'stress', ja: 'いそがしい毎日', text: '仕事が いそがしくて、食事も ねむりも 足りていない 患者さん。',
    choices: [['しっかり 休むよう すすめる', { heal: 8, coins: -5, msg: '休むのも 治療のうち。体力 +8' }],
      ['がんばって もらう', { coins: 20, imm: 2, msg: 'つかれと ストレスで めんえきが 下がった…。次の 2回の バトルは 病原体が 強い。20コイン' }]] },
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
  modal(`<b class="big">♾️ むげん病院</b><p>派遣先を えらんで、ボスを たおすたびに 次の幕へ。どこまで 行けるか ちょうせん!</p><p class="note">幕が すすむほど 病原体が 強くなる。ここでしか 出会えない 病原体と 薬が いる。</p><p class="note">💊 毎回 <b>ペニシリン・タミフル・安静・経口補水液・おかゆ</b>だけで スタート。薬は ごほうびや お店で ふやす。負けたら その回の 薬は なくなるけど、<b>💪けんこうポイント</b>で きたえた 体は ずっと のこる。</p><p class="note">💪 ${mpt()}ポイント</p><p class="note">さいこう記録: ${best ? best + '幕' : 'まだ なし'}</p>
    <div class="row c asc"><span>むずかしさ</span><select id="easc">${Array.from({ length: Math.min(((S.endless && S.endless.asc) || 0) + 1, 10) }, (_, i) => `<option value="${i}">${i ? i : 'ふつう'}</option>`).join('')}</select></div>`, ['はじめる', '💪 からだづくり', 'やめる']).then(async i => {
    if (i === 1) return metaScreen();
    if (i !== 0) return;
    const asc = +((document.getElementById('easc') || {}).value || 0);
    if (S.run && !await ask('<b>今の つづきは 消えるけど いい?</b>', 'はじめる')) return;
    S.endless = S.endless || { best: 0, runs: 0 }; S.endless.runs++;
    const R = newRun(0, 0); Object.assign(R, { stage: 9, asc, act: 1, coins: 40 + 20 * mlv('coin'), items: ['hint'], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu'] });
    R.abg = rollAbg();
    const extra = shuffle(DRUGS.filter(d => !d.endless && d.cost === 1 && !R.deck.includes(d.id) && (d.cat !== 'sup' || CARE_FOR[d.id]))).slice(0, mlv('study'));
    extra.forEach(d => { R.deck.push(d.id); learn(d.id, true); });
    S.run = R; save(); SE.play('start');
    if (S.endless.runs === 1) await modal('<b class="big">💡 むげん病院の チップス</b><div class="tips"><div>❓ 病原体は <b>正体が わからない</b> 状態で 出てくる。最初は 大まかな 症状だけ。<b>🗣️問診</b>や 検査で しぼりこもう</div><div>💊 薬は 毎回 <b>5つ</b>から スタート。ごほうびや <b>💊薬局</b>で ふやす</div><div>📞 合う薬が ない時は 検査の 中の <b>専門医に 相談</b>。病原体と 薬を 当てたら その薬が もらえる</div><div>💪 負けても <b>けんこうポイント</b>が たまる。<b>からだづくり</b>で 体を きたえると 次から 有利</div></div>', ['わかった!']);
    chooseScenario();
  });
}
async function chooseScenario() {
  const R = S.run, best = (S.endless && S.endless.best) || 0;
  const open = SCN.filter(s => best >= s.need && s.id !== R.lastScn);
  const three = shuffle(open).slice(0, 3);
  const i = await modal(`<b class="big">${R.act}幕: どこへ 派遣される?</b><p class="note">えらんだ場所で 出てくる 病原体と ボスが きまる。</p>`, three.map(s => `<span class="scnb" style="background:${s.bg}"><b>${s.em} ${s.ja}</b><span class="note">${s.desc}</span><span class="note">患者: ${PATIENTS[s.patient].short} ・ 検査: ${{ name: '名前まで', cat: '分類', gram: 'グラム染色' }[s.test]}</span></span>`));
  const s = three[i];
  R.scn = s.id; R.lastScn = s.id; R.bossId = pick(s.boss); R.mod = {};
  R.cond = rollConds(R, s.patient); R.condKnown = false;
  const pt = PATIENTS[s.patient]; R.max = pt.hp + (R.act - 1) * 4 + 3 * mlv('run'); R.hp = R.max; R.gut = 10;
  R.map = makeMap(9); R.pos = null; R.path = []; R.pending = null; R.shop = null; R.evSeen = [];
  save();
  await modal(`<div class="row c">${ART.patient(pt.look, true, 90)}</div><b>${s.em} ${s.ja}</b><p>今回の 患者: ${pt.ja.replace('のどがいたい', '具合のわるい')}</p><p class="note">ボスは まだ ひみつ(🕵️ミステリーボス)。とちゅうの 🧭分かれ道で 流れが かわるよ。</p>${R.cond.filter(c => CD[c].auto).length ? `<p>${R.cond.filter(c => CD[c].auto).map(c => CD[c].em + ' <b>' + CD[c].ja + '</b>').join('・')}</p>` : ''}<p class="note">🗣️ アレルギーや 持病は 問診で 聞こう。📊 この病院の 耐性表も 見ておこう。</p>`, ['📊 耐性表を 見る', 'しゅっぱつ!']).then(async i => { if (i === 0) await abgModal(); });
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
  R.act++; checkAch(); save(); SFX.play('clear');
  await modal(`<b class="big">🎉 ${R.act - 1}幕 クリア!</b><p>🪙 +${coin}</p>${got}<p>次は <b>${R.act}幕</b>。病原体が もっと 強くなる…!</p><p class="note">さいこう記録: ${S.endless.best}幕</p>`, ['次の 派遣先へ']);
  chooseScenario();
}
async function endlessOver() {
  const R = S.run; S.run = null;
  const reached = R.act - 1 + (R.fl + 1) / 13;
  S.endless.deep = Math.max(S.endless.deep || 0, reached);
  const pts = Math.round(reached * 20) + 5; S.meta = S.meta || { pt: 0, lv: {} }; S.meta.pt += pts; S.meta.total = (S.meta.total || 0) + pts; save(); checkAch();
  const oi = await modal(`${angelHtml()}<b class="big">👼 患者さんは 天国へ 旅立った…</b><p class="note">見送った 患者さん: <b>${(S.lost || []).length}人</b></p><b>むげん病院 おしまい</b><p><b>${R.act}幕</b> ${SC[R.scn].em}${SC[R.scn].ja} の ${R.fl + 1}階まで すすんだ。</p><p class="note">治した 患者さん ${R.wins9 || 0}人 ・ 入院日数 平均 ${R.wins9 ? (R.days / R.wins9).toFixed(1) : '-'}日</p><p class="note">さいこう記録: ${S.endless.best || 0}幕 クリア</p><p class="got">💪 けんこうポイント <b>+${pts}</b>(ぜんぶで ${mpt()})</p><p class="note">図鑑は のこる。ポイントで 体を きたえて、次は もっと 先へ!</p>`, ['💪 からだづくり', 'タイトルへ']);
  if (oi === 0) return metaScreen();
  title();
}

// ---- からだづくり(むげん病院の ずっと のこる 強化)
const META = [
  { id: 'run', em: '🏃', ja: '運動', sub: 'ランニング・なわとび', max: 5, base: 20, step: 15, fx: l => '患者の 体力の 上限 +' + 3 * l, why: '体力が つくと、病気で 弱っても もちこたえやすい。' },
  { id: 'food', em: '🥦', ja: '栄養', sub: 'バランスの いい ごはん', max: 3, base: 40, step: 35, fx: l => 'めんえき +' + l + '(いつも)', why: 'たんぱく質・ビタミンは めんえきの 材料。' },
  { id: 'sleep', em: '😴', ja: '早ね早おき', sub: 'たっぷり ねむる', max: 3, base: 30, step: 25, fx: l => 'バトルの はじめに 体力 +' + 2 * l, why: 'ねている間に 体が なおる。ねぶそくだと かぜを ひきやすい。' },
  { id: 'wash', em: '🧼', ja: '手あらい・うがい', sub: '外から 帰ったら', max: 5, base: 25, step: 15, fx: l => '病原体の 体力 -' + 4 * l + '%', why: '体に 入る 病原体の 数を へらせる。いちばん かんたんな 予防。' },
  { id: 'ferm', em: '🥛', ja: '発酵食品', sub: 'ヨーグルト・なっとう', max: 3, base: 30, step: 25, fx: l => '抗菌薬で 善玉菌が へるのを バトルごとに ' + l + '回 ふせぐ', why: 'おなかの 善玉菌を 元気に たもつ。' },
  { id: 'study', em: '📚', ja: '勉強', sub: '医学の 本を 読む', max: 3, base: 50, step: 40, fx: l => 'スタートの 薬が ' + l + 'つ ふえる(ランダム)', why: '知っている 薬が 多いほど、えらべる 手が ふえる。' },
  { id: 'lab', em: '🔬', ja: '検査の 練習', sub: '顕微鏡に なれる', max: 1, base: 80, step: 0, fx: () => '毎バトル 最初の 検査が タダ', why: 'すばやく 正体を 見ぬける。' },
  { id: 'coin', em: '🐷', ja: 'ちょきん', sub: 'おこづかいを ためる', max: 3, base: 20, step: 20, fx: l => 'スタートの コイン +' + 20 * l, why: 'お店で 薬や 道具を 買える。' },
];
const mlv = id => (S.meta && S.meta.lv && S.meta.lv[id]) || 0;
const mpt = () => (S.meta && S.meta.pt) || 0;
const mcost = (x, l) => x.base + x.step * l;
function metaScreen(keep) {
  S.meta = S.meta || { pt: 0, lv: {} }; S.meta.lv = S.meta.lv || {};
  const card = x => {
    const l = mlv(x.id), done = l >= x.max, c = mcost(x, l);
    const dots = Array.from({ length: x.max }, (_, i) => '<i class="' + (i < l ? 'on' : '') + '"></i>').join('');
    return '<div class="meta ' + (done ? 'done' : '') + '"><span class="mem">' + x.em + '</span><div class="mtx"><b>' + x.ja + ' <span class="note">' + x.sub + '</span></b><span class="mlv">' + dots + '</span><span class="mfx">' + (l ? '今: ' + x.fx(l) : x.fx(1)) + '</span><span class="note">' + x.why + '</span></div><button class="btn sm ' + (!done && mpt() >= c ? 'main' : '') + '" data-m="' + x.id + '" ' + (done || mpt() < c ? 'disabled' : '') + '>' + (done ? 'MAX' : '💪' + c) + '</button>' + (l ? '<button class="btn sm mminus" data-mr="' + x.id + '">− もどす</button>' : '') + '</div>';
  };
  screen(topBar('💪 からだづくり', title) + '<p class="note">むげん病院で すすむほど <b>けんこうポイント</b>が もらえる。きたえた 体は ずっと のこる。</p><div class="mpt">💪 <b>' + mpt() + '</b> ポイント</div><div class="metas">' + META.map(card).join('') + '</div>' + (Object.values(S.meta.lv).some(v => v) ? '<button class="btn" id="mall">↩ ポイントを ぜんぶ もどす</button>' : '') + '<button class="btn main" id="mgo">♾️ むげん病院へ</button>', '', keep);
  app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const x = META.find(y => y.id === b.dataset.m), l = mlv(x.id), c = mcost(x, l); if (l >= x.max || mpt() < c) return; S.meta.pt -= c; S.meta.lv[x.id] = l + 1; save(); SFX.play('learn'); toast(x.em + ' ' + x.ja + ' Lv' + (l + 1) + '! ' + x.fx(l + 1), 2200); metaScreen(true); });
  app.querySelectorAll('[data-mr]').forEach(b => b.onclick = () => { const x = META.find(y => y.id === b.dataset.mr), l = mlv(x.id); if (!l) return; S.meta.pt += mcost(x, l - 1); S.meta.lv[x.id] = l - 1; save(); SFX.play('coin'); toast(`${x.em} ${x.ja} Lv${l - 1}(💪${mcost(x, l - 1)} もどした)`, 1800); metaScreen(true); });
  const ma = $('#mall'); if (ma) ma.onclick = async () => { if (!await ask('<b>ポイントを ぜんぶ もどす?</b><p class="note">きたえた 体が もとに もどり、ポイントが かえってくる。</p>', 'もどす')) return; let back = 0; META.forEach(x => { for (let l = mlv(x.id); l > 0; l--) back += mcost(x, l - 1); S.meta.lv[x.id] = 0; }); S.meta.pt += back; save(); SFX.play('coin'); toast(`💪 ${back}ポイント もどった`, 1800); metaScreen(true); };
  $('#mgo').onclick = () => endlessStart();
}

// ---- 患者さんの 条件(むげん病院)
const COND = [
  { id: 'pcal', em: '🚫', ja: 'ペニシリン アレルギー', who: ['kid', 'dad', 'gpa'], stop: true, hit: 8, bad: d => /ペニシリン/.test(d.cls), msg: 'じんましん・息苦しさ… アナフィラキシー! ペニシリン系は 使えない', why: 'ペニシリン系に アレルギーが ある人には 使わない。別の 系統の 薬を えらぶ。' },
  { id: 'child', em: '👶', ja: '小さい子', who: ['kid'], auto: true, hit: 3, bad: d => /テトラサイクリン|キノロン/.test(d.cls), msg: '小さい子には ふつう 使わない 薬(歯や 関節への えいきょう)', why: 'テトラサイクリン系(歯の 色)・キノロン系(関節)は 小さい子には ふつう さける。' },
  { id: 'kidney', em: '🫘', ja: '腎臓が 弱い', who: ['dad', 'gpa'], hit: 4, bad: d => /アミノグリコシド|グリコペプチド/.test(d.cls), msg: '腎臓に 負担が かかった…', why: 'アミノグリコシド系・バンコマイシンは 腎臓に 負担。腎臓が 弱い人では さけるか 量を へらす。' },
  { id: 'elder', em: '👴', ja: 'お年より', who: ['gpa'], auto: true, hit: 3, bad: d => !!d.nsaid, msg: 'お年よりに 痛み止め(NSAIDs)で 胃や 腎臓に 負担', why: 'お年よりは NSAIDsで 胃かいようや 腎臓の 負担が おきやすい。熱・痛みには アセトアミノフェンが 安心。' },
];
const CD = Object.fromEntries(COND.map(c => [c.id, c]));
function rollConds(R, patient) {
  const pool = COND.filter(c => c.who.includes(patient));
  const n = R.act >= 2 ? 1 : (Math.random() < 0.5 ? 1 : 0);
  return pool.filter(c => c.auto).map(c => c.id).concat(shuffle(pool.filter(c => !c.auto)).slice(0, n).map(c => c.id));
}
const condsOf = () => (S.run && S.run.stage === 9 && S.run.cond) || [];
const contraFor = d => condsOf().map(id => CD[id]).filter(c => c.bad(d));
function condChips() {
  const R = S.run; if (!R || R.stage !== 9 || !R.cond) return '';
  const show = R.cond.filter(c => CD[c].auto || R.condKnown), hidden = R.cond.length - show.length;
  return '<span class="conds" data-cond="1">' + show.map(c => '<i>' + CD[c].em + '<b>' + CD[c].ja + '</b></i>').join('') + (!R.condKnown ? '<i class="q">❔<b>問診で 持病・アレルギー</b></i>' : '') + '</span>';
}
function condModal() {
  const R = S.run;
  modal('<b class="big">🧑‍⚕️ この 患者さんの 条件</b>' + (R.cond.length ? R.cond.map(c => (CD[c].auto || R.condKnown) ? '<p class="got">' + CD[c].em + ' <b>' + CD[c].ja + '</b><br><span class="note">' + CD[c].why + '</span></p>' : '').join('') : '') + (!R.condKnown ? '<p class="note">❔ アレルギーや 持病は 🗣️問診で わかる。わからないまま 薬を えらぶと…?</p>' : '') + (R.condKnown && !R.cond.length ? '<p>とくに なし</p>' : ''), ['とじる']);
}
// ---- 病院の 耐性表(アンチバイオグラム)
function rollAbg() {
  const pids = [...new Set(SCN.flatMap(s => s.pool.concat(s.elites)))].filter(id => P[id] && P[id].cat === 'bac' && !P[id].base);
  const out = {};
  for (const pid of shuffle(pids)) {
    const eff = DRUGS.filter(d => effOf(d, P[pid]) === 2 && d.cat === 'abx');
    if (eff.length < 2) continue;
    const best = eff.filter(d => isBest(d, P[pid]));
    const d = pick(best.length && Math.random() < 0.6 ? best : eff);
    out[pid] = { d: d.id, pct: 30 + rnd(5) * 10 };
    if (Object.keys(out).length >= 4) break;
  }
  return out;
}
function abgModal() {
  const R = S.run; if (!R || !R.abg) return;
  const rows = Object.entries(R.abg).map(([pid, x]) => '<tr><td>' + P[pid].ja + '</td><td>' + D[x.d].ja + '</td><td><b>' + x.pct + '%</b></td></tr>').join('');
  return modal('<b class="big">📊 この 病院の 耐性表</b><p class="note">この 病院では、次の 菌の 一部が その薬に 耐性(効かない)。いつもの 第一選択が 効かない ことも。🧫培養で 確かめられる。</p><table class="abg"><tr><th>菌</th><th>効かないかも</th><th>割合</th></tr>' + rows + '</table>', ['とじる']);
}

// ---------- 診断のための 情報(問診で わかること・迅速検査・第一選択の薬)
// best: その相手に「ばっちり」な薬(第一選択の考え方)。当てると こうかばつぐん。スペクトラム内なら ふつうに効く
// hist: 問診で わかること(どこで・だれから・どんなふうに)
// rapid: 迅速検査で 名前まで わかるか
const CLINIC = {
  strep: { best: ['amox', 'pen'], rapid: 1, hist: 'きょうだいも のどが いたい。せきは あまり出ない。のどが 真っ赤。' },
  pneumo: { best: ['amox'], rapid: 1, hist: 'かぜの あとに 耳が いたくなった/高い熱と たんの からむ せき。' },
  staph: { best: ['cez'], hist: '虫さされを かきこわした あとが、赤く はれて うみが出た。' },
  mrsa: { best: ['vcm', 'lzd', 'dap'], hist: '入院が 長い。前に 抗菌薬を 何回も 使っている。' },
  ecoli: { best: ['ctrx'], hist: 'おしっこが 近い・いたい。せなか(腰)を たたくと ひびく。' },
  esbl: { best: ['mepm'], hist: 'おしっこの 感染を くりかえしていて、前の薬が 効かなかった。' },
  myco: { best: ['azm', 'cam'], rapid: 1, hist: '熱のわりに 元気。かわいた せきが 何週間も 続く。学校で はやっている。' },
  campy: { best: ['azm'], hist: '3日ほど前に 焼き鳥・鶏の たたきを 食べた。' },
  pseudo: { best: ['tazpip', 'cfpm'], hist: '入院中で、人工呼吸器や 管が 入っている。' },
  mdrp: { best: ['cl'], hist: '入院中。カルバペネム系も ニューキノロン系も 効かなかった。' },
  cdiff: { best: ['fdx', 'vcm'], rapid: 1, hist: '最近、抗菌薬を 使っていた。そのあと げりが 続く。' },
  tb: { best: ['inh', 'rfp', 'pza', 'eb'], hist: '2週間以上 せきが 続く。体重が へり、夜に 汗をかく。' },
  pylori: { best: ['amox', 'cam', 'vpz'], hist: '胃が いたい・胃カメラで 胃かいようが 見つかった。' },
  flu: { best: ['osel', 'zana', 'bxm'], rapid: 1, hist: 'クラスで はやっている。急に 38度以上の 熱が出て、体の ふしぶしが いたい。' },
  flu_boss: { best: ['osel', 'zana', 'bxm'], rapid: 1, hist: '学校中で はやっている。急な 高い熱。' },
  adeno: { rapid: 1, hist: 'プールの あとから、高い熱・のどの いたみ・目が赤い。' },
  noro: { rapid: 1, hist: '家族も はいている。カキ(貝)を 食べた。' },
  rsv: { rapid: 1, hist: '小さい子。鼻水のあと ゼーゼーいう せき。' },
  covid: { best: ['nmv', 'ens', 'rdv'], rapid: 1, hist: '家族に 陽性の 人がいる。のどの いたみと 熱。においが わかりにくい。' },
  vzv: { best: ['vacv'], hist: '体の 片側だけ ピリピリ いたくて、帯のように 水ぶくれ。' },
  hsv: { best: ['vacv', 'acv'], hist: 'つかれると 口の まわりに 水ぶくれが 出る。前にも あった。' },
  tinea: { best: ['tbf'], hist: '部活で 毎日 くつを はいている。足の 指の間が かゆい。' },
  candida: { best: ['flcz', 'mcfg'], hist: '抗菌薬や ステロイドを 使っている。口の中に 白い こけ。' },
  asper: { best: ['vrcz'], hist: 'めんえきを 下げる 治療中。工事現場の そばの 病院。' },
  pinworm: { best: ['pyr'], hist: '夜、おしりを かいている。セロハンテープ検査で 卵。' },
  ascaris: { best: ['pyr', 'mbz'], hist: '洗っていない 野菜を 食べた。' },
  anisakis: { best: ['endo'], hist: '数時間前に しめサバ・イカの 刺身を 食べた。' },
  malaria: { best: ['al', 'apg'], rapid: 1, hist: 'アフリカから 帰ってきた。予防薬は 飲んでいない。' },
  giardia: { best: ['mnz'], hist: '海外で 生水や 氷を 口にした。においの 強い げり。' },
  scabies: { best: ['ivm', 'phen'], hist: '施設で 同じ部屋の 人も かゆがっている。手首や 指の間に 線のような あと。' },
  mening: { best: ['ctrx'], hist: '寮で 暮らしている。急な 頭痛と 高い熱、首を 前に 曲げられない。' },
  tetanus: { best: ['mnz'], hist: '畑仕事で 古いクギを ふんだ。ワクチンを 打ったか わからない。' },
  legion: { best: ['lvfx', 'azm'], rapid: 1, hist: '1週間前に 温泉・ジャグジーに 行った。' },
  pertussis: { best: ['azm', 'cam'], hist: '息を 吸うときに ヒューと 音がする はげしい せきが 何週間も。' },
  listeria: { best: ['abpc'], hist: 'ナチュラルチーズや 生ハムが 好き。にんしん中・高齢。' },
  entero: { best: ['abpc'], hist: 'おしっこの 管が 入っている。セフェム系を 使っていた。' },
  vre: { best: ['lzd', 'dap'], hist: '入院中。バンコマイシンを 長く 使っていた。' },
  cre: { best: ['cl'], hist: '海外の 病院で 入院していた。カルバペネム系も 効かない。' },
  typhoid: { best: ['ctrx', 'azm'], hist: '南アジアへの 旅行から 帰ってから、熱が 下がらない。' },
  cholera: { best: ['doxy', 'azm'], hist: '水の よごれた 地域。米のとぎ汁のような げりが 大量に。' },
  scrub: { best: ['doxy', 'mino'], hist: '秋に 山や 畑に 入った。黒い かさぶたの ような さされあと。' },
  lyme: { best: ['doxy'], hist: '北海道の 森で マダニに さされた。さされた所が 赤い輪のように 広がる。' },
  cmv: { best: ['gcv'], hist: '臓器移植の あと、めんえきを 下げる 薬を 飲んでいる。' },
  hbv: { best: ['etv'], hist: '健康診断で 肝臓の 数値が 高かった。家族にも B型肝炎の 人がいる。' },
  hcv: { best: ['sofvel'], hist: '健康診断で 肝臓の 数値が 高い。昔、輸血を うけた ことがある。' },
  measles: { rapid: 0, hist: 'ワクチンを 打っていない。高い熱、せき、口の中に 白い ぽつぽつ(コプリック斑)。' },
  dengue: { hist: '東南アジアから 帰ってきた。蚊に たくさん さされた。' },
  pcp: { best: ['st'], hist: 'めんえきが とても 弱っている。動くと すぐ 息が くるしい。' },
  crypto: { best: ['amph', 'fc'], hist: 'めんえきが 弱っている。家の 近くに ハトが 多い。' },
  echino: { best: ['abz'], hist: '北海道で 沢の水を 飲んだり、キタキツネに さわったり した。' },
  amoeba: { best: ['mnz'], hist: '海外で 生水を 飲んだ。血の まじる げり。' },
};
const isBest = (d, p) => !!(CLINIC[p.id] && CLINIC[p.id].best && CLINIC[p.id].best.includes(d.id));

// 検査のメニュー
const TESTS = [
  { id: 'ask', em: '🗣️', ja: '問診', cost: 1, desc: 'いつ・どこで・だれから? 話を聞いて ヒントを さがす' },
  { id: 'gram', em: '🔬', ja: 'グラム染色', cost: 1, desc: '顕微鏡で 細菌の 形と 色を 見る(細菌かどうかも わかる)' },
  { id: 'rapid', em: '🧪', ja: '迅速検査', cost: 1, desc: 'インフルエンザ・溶連菌など 決まった相手なら 15分で 名前が わかる' },
  { id: 'culture', em: '🧫', ja: '培養・PCR', cost: 2, desc: 'じっくり 調べて 名前まで わかる(時間が かかるので 処方ポイント2)' },
];
const GRAM_SHAPE = { chain: 'くさりのように 並んだ', diplo: '2つずつ ペアの', grape: 'ブドウの房のような', rod: '棒の形の', rodthin: '細長い 棒の形の', spiral: 'らせん形の', spore: '芽胞をもつ 棒の形の', tiny: 'とても小さな' };

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
  // 主人公: 肌の色・髪型・髪の色・服・小物を 組み合わせる(look は プリセットの id か、{skin,style,hair,coat,acc})
  const SKINS = ['#ffe0c4', '#f6d2b0', '#e8b98f', '#c98e62', '#a8693f', '#7a4a2a'];
  const HAIRC = ['#1f1f1f', '#3b2a1e', '#7a4a2a', '#c9873a', '#f0d27a', '#e8e8e8', '#d94a4a', '#4a7ad9', '#7ad36b', '#ff8fc0'];
  const STYLES = [['short', 'みじかい'], ['side', 'わけめ'], ['spiky', 'つんつん'], ['curly', 'くるくる'], ['bob', 'ボブ'], ['pony', 'ポニーテール'], ['twin', 'ツインテール'], ['bun', 'おだんご'], ['long', 'ロング'], ['braid', 'みつあみ'], ['afro', 'アフロ'], ['bald', 'つるつる'], ['robo', 'ロボ']];
  const COATS = [['#ffffff', '白衣'], ['#7fb3ff', '青の スクラブ'], ['#7ad3a0', '緑の スクラブ'], ['#ff9ec4', 'ピンクの スクラブ'], ['#b49cff', 'むらさき'], ['#333a48', '黒']];
  const ACCS = [['none', 'なし'], ['glasses', 'めがね'], ['round', 'まるめがね'], ['cap', 'ナースキャップ'], ['mirror', '額帯鏡'], ['mask', 'マスク'], ['band', 'ヘアバンド'], ['crown', 'おうかん']];
  function lookObj(look) {
    if (look && typeof look === 'object') return look;
    const L = LOOKS.find(l => l.id === look) || LOOKS[0];
    return { skin: L.skin, style: L.style, hair: L.hair, coat: '#ffffff', acc: L.style === 'bald' ? 'round' : 'none' };
  }
  function doctor(look, size = 110) {
    const L = lookObj(look), H = L.hair;
    const hair = {
      short: `<path d="M28 34 Q30 14 50 14 Q70 14 72 34 Q64 24 50 26 Q36 24 28 34Z" fill="${H}"/>`,
      side: `<path d="M27 36 Q26 12 52 13 Q74 14 73 32 Q60 20 40 26 Q32 28 27 36Z" fill="${H}"/>`,
      spiky: `<path d="M28 34 L30 16 L38 22 L42 8 L50 20 L58 6 L62 20 L70 12 L72 34 Q60 24 50 26 Q38 24 28 34Z" fill="${H}"/>`,
      curly: [[32, 22], [42, 15], [54, 14], [65, 20], [72, 30], [28, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${H}"/>`).join(''),
      bob: `<path d="M26 50 Q22 12 50 13 Q78 12 74 50 L68 48 Q70 26 50 26 Q30 26 32 48Z" fill="${H}"/>`,
      pony: `<path d="M27 36 Q28 12 50 13 Q72 12 73 36 Q66 22 50 24 Q34 22 27 36Z" fill="${H}"/><path d="M72 28 Q88 34 80 56" stroke="${H}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="73" cy="27" r="4" fill="#ff7aa8"/>`,
      twin: `<path d="M27 36 Q28 12 50 13 Q72 12 73 36 Q66 22 50 24 Q34 22 27 36Z" fill="${H}"/><path d="M28 28 Q12 36 18 58 M72 28 Q88 36 82 58" stroke="${H}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="28" cy="27" r="4" fill="#ffd34d"/><circle cx="72" cy="27" r="4" fill="#ffd34d"/>`,
      bun: `<path d="M27 36 Q28 14 50 14 Q72 14 73 36 Q66 22 50 24 Q34 22 27 36Z" fill="${H}"/><circle cx="50" cy="8" r="9" fill="${H}"/>`,
      long: `<path d="M26 60 Q22 14 50 13 Q78 14 74 60 L68 58 Q70 26 50 25 Q30 26 32 58Z" fill="${H}"/>`,
      braid: `<path d="M27 36 Q28 12 50 13 Q72 12 73 36 Q66 22 50 24 Q34 22 27 36Z" fill="${H}"/>${[40, 48, 56, 64].map(y => `<ellipse cx="74" cy="${y}" rx="5" ry="5" fill="${H}"/>`).join('')}`,
      afro: `<circle cx="50" cy="24" r="27" fill="${H}"/>`,
      bald: `<path d="M27 38 Q24 30 30 26 M73 38 Q76 30 70 26" stroke="${H}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M36 50 Q50 60 64 50" stroke="${H}" stroke-width="6" fill="none"/>`,
      robo: `<rect x="44" y="4" width="12" height="10" fill="${H}"/><circle cx="50" cy="4" r="4" fill="#ff5d5d"/>`,
    }[L.style] || '';
    const behind = L.style === 'afro' ? hair : '';
    const front = L.style === 'afro' ? '' : hair;
    const face = L.style === 'robo' ? `<rect x="28" y="16" width="44" height="40" rx="8" fill="${L.skin}" stroke="${H}" stroke-width="3"/><rect x="34" y="28" width="12" height="8" rx="2" fill="#59f0ff"/><rect x="54" y="28" width="12" height="8" rx="2" fill="#59f0ff"/><rect x="40" y="44" width="20" height="4" rx="2" fill="${H}"/>`
      : `<ellipse cx="50" cy="38" rx="22" ry="23" fill="${L.skin}"/><circle cx="42" cy="38" r="2.6" fill="#222"/><circle cx="58" cy="38" r="2.6" fill="#222"/><path d="M44 47 Q50 52 56 47" stroke="#7a3a1d" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="37" cy="45" r="3.5" fill="#ff9a9a" opacity=".45"/><circle cx="63" cy="45" r="3.5" fill="#ff9a9a" opacity=".45"/>`;
    const acc = {
      glasses: '<rect x="35" y="33" width="12" height="9" rx="2" fill="none" stroke="#333" stroke-width="2"/><rect x="53" y="33" width="12" height="9" rx="2" fill="none" stroke="#333" stroke-width="2"/><path d="M47 37 h6" stroke="#333" stroke-width="2"/>',
      round: '<circle cx="42" cy="38" r="6" fill="none" stroke="#555" stroke-width="2"/><circle cx="58" cy="38" r="6" fill="none" stroke="#555" stroke-width="2"/><path d="M48 38 h4" stroke="#555" stroke-width="2"/>',
      cap: '<path d="M34 18 h32 l-4 -10 h-24z" fill="#fff" stroke="#c9d3e0" stroke-width="2"/><path d="M47 10 h6 M50 7 v6" stroke="#ff6b6b" stroke-width="2.5"/>',
      mirror: '<path d="M28 22 Q50 14 72 22" stroke="#555" stroke-width="3" fill="none"/><circle cx="50" cy="16" r="7" fill="#e8f2ff" stroke="#888" stroke-width="2"/><circle cx="50" cy="16" r="2" fill="#333"/>',
      mask: '<path d="M34 44 Q50 40 66 44 L64 56 Q50 60 36 56Z" fill="#cfe9ff" stroke="#8ab" stroke-width="1.5"/>',
      band: '<path d="M28 26 Q50 16 72 26" stroke="#ff6b6b" stroke-width="5" fill="none"/>',
      crown: '<path d="M36 14 l4 -10 l6 7 l4 -9 l4 9 l6 -7 l4 10z" fill="#ffd700" stroke="#b08a00" stroke-width="1.5"/>',
    }[L.acc] || '';
    const coat = L.coat || '#fff', lab = coat === '#ffffff';
    return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" class="doc">${behind}<path d="M20 120 Q20 70 50 66 Q80 70 80 120Z" fill="${coat}" stroke="#c9d3e0" stroke-width="2"/>${lab ? '<path d="M50 66 L42 120 M50 66 L58 120" stroke="#c9d3e0" stroke-width="2"/>' : '<path d="M40 68 L50 80 L60 68" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>'}<path d="M40 70 Q34 92 46 96 Q56 98 54 86" stroke="#334" stroke-width="3" fill="none"/><circle cx="54" cy="84" r="4" fill="#9aa"/><rect x="60" y="84" width="10" height="12" rx="2" fill="#7fb3ff"/>${face}${front}${acc}</svg>`;
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
  return { patho, doctor, patient, LOOKS, SKINS, HAIRC, STYLES, COATS, ACCS, lookObj };
})();

// ---------- 薬の絵(飲み薬・カプセル・点滴・吸入・ぬり薬…。色は ジャンルの色)
const FORM = { pen: 'iv', amox: 'capsule', cez: 'iv', ctrx: 'iv', azm: 'pill', cam: 'pill', mino: 'capsule', lvfx: 'pill', tazpip: 'iv', mepm: 'iv', vcm: 'iv', lzd: 'pill', mnz: 'pill', fdx: 'pill', cl: 'iv', inh: 'pill', rfp: 'capsule', pza: 'pill', eb: 'pill', vpz: 'pill', osel: 'capsule', zana: 'inhale', bxm: 'pill', nmv: 'pill', ens: 'pill', rdv: 'iv', acv: 'pill', vacv: 'pill', tbf: 'cream', flcz: 'capsule', vrcz: 'pill', mcfg: 'iv', amph: 'iv', pyr: 'syrup', mbz: 'pill', ivm: 'pill', phen: 'cream', al: 'pill', apg: 'pill', ors: 'bottle', apap: 'pill', cool: 'ice', okayu: 'bowl', humid: 'humid', honey: 'honey', dxm: 'syrup', carbo: 'powder', domp: 'pill', antih: 'cream', drip: 'bag', loxo: 'pill', dclf: 'pill', pred: 'pill', bif: 'powder', o2: 'mask', nutri: 'food', sleep: 'bed', endo: 'scope', abpc: 'iv', doxy: 'capsule', st: 'pill', gm: 'iv', dap: 'iv', cfpm: 'iv', abz: 'pill', gcv: 'iv', etv: 'pill', sofvel: 'pill', fc: 'capsule' };
const FORM_JA = { pill: '飲み薬(錠剤)', capsule: '飲み薬(カプセル)', iv: '点滴・注射', bag: '点滴', inhale: '吸入', cream: 'ぬり薬', syrup: 'シロップ', bottle: '飲みもの', powder: '粉薬', mask: '酸素マスク', food: '食事', bed: 'ねる', scope: '内視鏡' };
ART.drug = (d, size = 48) => {
  const col = d.cat === 'sup' ? '#ff8fa3' : CAT[{ abx: 'bac', vir: 'vir', fun: 'fun', par: 'par' }[d.cat]].col;
  const dk = c => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(v * .7).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  const s = dk(col);
  const F = {
    pill: `<ellipse cx="50" cy="58" rx="34" ry="14" fill="${s}"/><ellipse cx="50" cy="50" rx="34" ry="14" fill="${col}" stroke="${s}" stroke-width="3"/><line x1="30" y1="50" x2="70" y2="50" stroke="#fff" stroke-width="3" opacity=".7"/><ellipse cx="38" cy="45" rx="8" ry="3" fill="#fff" opacity=".5"/>`,
    capsule: `<g transform="rotate(-35 50 50)"><rect x="14" y="36" width="72" height="28" rx="14" fill="#fff" stroke="${s}" stroke-width="3"/><path d="M50 36 h22 a14 14 0 0 1 0 28 h-22 z" fill="${col}"/><rect x="22" y="41" width="20" height="5" rx="2.5" fill="#fff" opacity=".8"/></g>`,
    iv: `<rect x="34" y="14" width="32" height="10" rx="3" fill="#bbb"/><rect x="28" y="22" width="44" height="58" rx="8" fill="#eaf6ff" stroke="${s}" stroke-width="3"/><rect x="32" y="44" width="36" height="32" rx="5" fill="${col}"/><rect x="34" y="30" width="32" height="8" rx="3" fill="#fff"/><path d="M46 80 v10 M54 80 v10" stroke="#999" stroke-width="3"/>`,
    bag: `<path d="M26 18 h48 v52 q0 14 -24 14 q-24 0 -24 -14z" fill="#eaf6ff" stroke="${s}" stroke-width="3"/><path d="M28 46 h44 v24 q0 12 -22 12 q-22 0 -22 -12z" fill="${col}" opacity=".85"/><rect x="40" y="8" width="20" height="10" rx="3" fill="#aaa"/><path d="M50 84 v12" stroke="#999" stroke-width="4"/>`,
    inhale: `<rect x="36" y="10" width="28" height="50" rx="8" fill="${col}" stroke="${s}" stroke-width="3"/><path d="M30 56 h40 v16 h-14 v14 h-12 v-14 h-14z" fill="#f2f2f2" stroke="${s}" stroke-width="3"/><circle cx="50" cy="28" r="6" fill="#fff" opacity=".7"/>`,
    cream: `<g transform="rotate(-20 50 50)"><path d="M18 38 h50 l14 8 v8 l-14 8 h-50z" fill="#fff" stroke="${s}" stroke-width="3"/><rect x="18" y="38" width="28" height="24" fill="${col}"/><rect x="82" y="44" width="10" height="12" rx="2" fill="${s}"/></g><path d="M74 72 q10 6 4 14" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    syrup: `<rect x="34" y="12" width="32" height="12" rx="3" fill="${s}"/><path d="M30 24 h40 v54 q0 10 -10 10 h-20 q-10 0 -10 -10z" fill="#fff6e8" stroke="${s}" stroke-width="3"/><path d="M32 50 h36 v28 q0 8 -8 8 h-20 q-8 0 -8 -8z" fill="${col}"/>`,
    bottle: `<rect x="40" y="8" width="20" height="10" rx="3" fill="#4aa3ff"/><path d="M36 18 h28 l6 12 v54 q0 8 -8 8 h-24 q-8 0 -8 -8 v-54z" fill="#e8f6ff" stroke="#4aa3ff" stroke-width="3"/><rect x="32" y="44" width="36" height="20" fill="${col}"/><text x="50" y="58" font-size="10" text-anchor="middle" fill="#fff" font-weight="900">ORS</text>`,
    powder: `<path d="M24 22 h52 v58 h-52z" fill="#fff" stroke="${s}" stroke-width="3"/><path d="M24 22 l6 -8 h40 l6 8" fill="${col}"/><circle cx="40" cy="52" r="4" fill="${col}"/><circle cx="56" cy="44" r="3" fill="${col}"/><circle cx="58" cy="62" r="4" fill="${col}"/>`,
    mask: `<path d="M24 40 q26 -26 52 0 l-6 30 q-20 12 -40 0z" fill="#e8f6ff" stroke="${s}" stroke-width="3"/><path d="M50 70 q0 14 18 22" stroke="#7fc8ff" stroke-width="5" fill="none"/><text x="50" y="58" font-size="14" text-anchor="middle" fill="${s}" font-weight="900">O₂</text>`,
    food: `<path d="M18 50 h64 q0 30 -32 30 q-32 0 -32 -30z" fill="#fff" stroke="${s}" stroke-width="3"/><ellipse cx="50" cy="50" rx="32" ry="8" fill="#ffe9b0"/><circle cx="40" cy="48" r="4" fill="#ff7b7b"/><circle cx="56" cy="47" r="4" fill="#7ad36b"/><path d="M38 34 q4 -10 0 -18 M50 34 q4 -10 0 -18 M62 34 q4 -10 0 -18" stroke="#ccc" stroke-width="3" fill="none"/>`,
    bed: `<rect x="12" y="52" width="76" height="18" rx="4" fill="${col}"/><rect x="12" y="38" width="10" height="44" fill="${s}"/><rect x="18" y="44" width="22" height="12" rx="5" fill="#fff"/><text x="70" y="38" font-size="16" fill="#7fc8ff" font-weight="900">Zz</text>`,
    bowl: `<path d="M18 50 h64 q-2 30 -32 32 q-30 -2 -32 -32z" fill="#fff" stroke="#c9a26b" stroke-width="3"/><ellipse cx="50" cy="50" rx="32" ry="8" fill="#fffaf0" stroke="#c9a26b" stroke-width="3"/><circle cx="44" cy="49" r="2.5" fill="#f0e3c8"/><circle cx="55" cy="51" r="2.5" fill="#f0e3c8"/><circle cx="50" cy="47" r="5" fill="#e2553a"/><path d="M38 36 q-4 -8 2 -14 M52 34 q-4 -8 2 -14" stroke="#ddd" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M66 30 l14 -16" stroke="#c9a26b" stroke-width="4" stroke-linecap="round"/>`,
    ice: `<rect x="22" y="30" width="56" height="44" rx="10" fill="#bfe9ff" stroke="#4aa3ff" stroke-width="3"/><path d="M34 44 l8 8 M58 42 l-6 10 M46 60 l6 -6" stroke="#fff" stroke-width="3"/><text x="50" y="26" font-size="14" text-anchor="middle">❄</text>`,
    humid: `<rect x="28" y="40" width="44" height="50" rx="12" fill="#fff" stroke="#7fb3d6" stroke-width="3"/><rect x="34" y="60" width="32" height="22" rx="5" fill="#9fd8ff"/><path d="M42 36 q-6 -10 2 -18 M50 34 q-6 -12 2 -22 M58 36 q-6 -10 2 -18" stroke="#cfe9ff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    honey: `<rect x="30" y="20" width="40" height="10" rx="3" fill="#c48a00"/><path d="M26 30 h48 v46 q0 12 -12 12 h-24 q-12 0 -12 -12z" fill="#ffc83d" stroke="#c48a00" stroke-width="3"/><path d="M36 50 h28" stroke="#fff" stroke-width="3" opacity=".6"/><circle cx="50" cy="64" r="6" fill="#fff3b0"/>`,
    scope: `<path d="M20 80 q10 -50 40 -50 q20 0 20 20" stroke="#333" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="80" cy="52" r="8" fill="${col}" stroke="#333" stroke-width="3"/><circle cx="80" cy="52" r="3" fill="#fff"/>`,
  };
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="dz">${F[FORM[d.id]] || F.pill}</svg>`;
};

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
  if (!B) return;
  const f = B.foes.find(x => x.hp > 0); const p = f ? P[f.pid] : null;
  const good = p ? { bac: 'neut', vir: 'killt', fun: 'neut', par: 'eos' }[p.cat] : null;
  const pool = shuffle(CELLS.map(c => c.id));
  const n = (S.run && S.run.immLv >= 2) ? 4 : 3;
  let hand = pool.slice(0, n);
  if (good && !hand.includes(good) && Math.random() < 0.6) hand[rnd(n)] = good;
  B.cells = hand; B.cellUsed = false; B.cell2 = 0;
}
async function useCell(id) {
  if (!B || B.busy || B.cellUsed) return;
  if (B.cellExtra) { B.cellExtra = 0; setTimeout(() => { if (B) { B.cellUsed = false; renderBattle(); } }, 50); }
  const R = S.run; let ti = B.tgt; if (!B.foes[ti] || B.foes[ti].hp <= 0) ti = B.foes.findIndex(f => f.hp > 0);
  const f = B.foes[ti], p = P[f.pid];
  const pow = clamp(B.immUp - B.immDown + Math.round(R.hp / R.max * 2), 0, 6) + (R.immLv || 0);
  const r = CL[id].fx(p, pow, f); B.cellUsed = true; st('cell');
  if (R.relics.includes('immb') && !B.cell2) { B.cell2 = 1; setTimeout(() => { if (B) { B.cellUsed = false; renderBattle(); } }, 60); } if (f.dots.length) immGood(1, '薬と めんえきの 協力');
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

// ---------- 場面ごとの 効果音(Web Audio で その場で 作る。音声ファイルは 使わない)
// うまくいった時ほど 気持ちいい音に。SE の「音あり/なし」に したがう
const SFX = (() => {
  let ctx = null, master = null;
  const ac = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  // 1つの音: 波の形・高さ(Hz)・始まり・長さ・大きさ・高さの変化
  function tone(type, f, t0, dur, vol = 0.3, f2 = null, delay = 0) {
    const c = ac(), t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    if (delay) { const d = c.createDelay(); d.delayTime.value = delay; const fb = c.createGain(); fb.gain.value = 0.25; g.connect(d); d.connect(fb); fb.connect(d); fb.connect(master); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.2, f1 = 800, f2 = 3000, type = 'bandpass') {
    const c = ac(), t = c.currentTime + t0, len = Math.max(1, c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = 1;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // MIDIの番号 → Hz
  const arp = (notes, step, type = 'triangle', vol = 0.25, len = 0.25, delay = 0) => notes.forEach((n, i) => tone(type, N(n), i * step, len, vol, null, delay));
  const SOUNDS = {
    hit: () => { noise(0, 0.12, 0.35, 2000, 300, 'lowpass'); tone('square', 220, 0, 0.1, 0.15, 110); },                       // 効いた
    hitSoft: () => { noise(0, 0.08, 0.2, 1200, 400, 'lowpass'); },                                                           // 効きにくい
    best: () => { tone('sine', N(84), 0, 0.12, 0.2); arp([72, 76, 79, 84, 88], 0.06, 'triangle', 0.28, 0.35, 0.12); noise(0.3, 0.5, 0.12, 6000, 12000, 'highpass'); [0.32, 0.42, 0.52].forEach((d, i) => tone('sine', N(96 + i * 2), d, 0.18, 0.08)); }, // こうかばつぐん!
    miss: () => { tone('sawtooth', 160, 0, 0.32, 0.18, 110); tone('sawtooth', 150, 0.03, 0.3, 0.12, 100); },                  // ブッブー(効かない)
    kill: () => { noise(0, 0.15, 0.3, 300, 3000); tone('sine', N(79), 0.05, 0.12, 0.25); arp([84, 91], 0.08, 'triangle', 0.22, 0.3, 0.1); }, // ポンッ キラン
    hurt: () => { tone('sine', 140, 0, 0.25, 0.4, 60); noise(0, 0.12, 0.2, 600, 150, 'lowpass'); },                          // こうげきを うけた
    heal: () => arp([67, 71, 74, 79], 0.07, 'sine', 0.2, 0.35, 0.1),                                                          // 回復
    guard: () => { tone('triangle', N(74), 0, 0.15, 0.2); tone('triangle', N(81), 0.06, 0.25, 0.18); },
    drug: () => { tone('sine', 660, 0, 0.06, 0.15, 990); noise(0.02, 0.1, 0.12, 3000, 6000, 'highpass'); },                // 薬を 使った(シュッ)
    select: () => tone('sine', 880, 0, 0.05, 0.12),
    test: () => { [0, 0.09, 0.18].forEach((d, i) => tone('square', 1200 + i * 200, d, 0.06, 0.08)); tone('sine', 1760, 0.3, 0.2, 0.12); }, // ピピピ…ピーン
    reveal: () => arp([76, 79, 83, 88], 0.05, 'triangle', 0.2, 0.3, 0.1),                                                   // 正体が わかった
    newFoe: () => { tone('sawtooth', N(57), 0, 0.18, 0.15); tone('sawtooth', N(60), 0.18, 0.18, 0.15); tone('sawtooth', N(64), 0.36, 0.4, 0.15); }, // ジャジャーン
    learn: () => { arp([72, 76, 79], 0.1, 'triangle', 0.25, 0.3); arp([84, 88, 91, 96], 0.07, 'sine', 0.2, 0.4, 0.15); },    // 新しい薬
    win: () => { arp([67, 72, 76, 79], 0.09, 'square', 0.12, 0.2); tone('triangle', N(84), 0.4, 0.6, 0.25, null, 0.15); },    // やっつけた!
    coin: () => { tone('square', N(88), 0, 0.07, 0.12); tone('square', N(93), 0.07, 0.25, 0.12); },                          // コイン
    clear: () => { const m = [72, 72, 72, 76, 79, 76, 79, 84]; const tt = [0, .12, .24, .36, .6, .78, .9, 1.1]; m.forEach((n, i) => tone('square', N(n), tt[i], i === 7 ? 0.8 : 0.16, 0.13)); [60, 64, 67].forEach(n => tone('triangle', N(n), 1.1, 0.9, 0.12)); }, // ステージクリア
    rankS: () => { arp([79, 83, 86, 91, 95, 98], 0.05, 'sine', 0.2, 0.5, 0.15); noise(0.3, 0.9, 0.1, 8000, 14000, 'highpass'); },
    siren: () => { for (let i = 0; i < 3; i++) { tone('sawtooth', 700, i * 0.4, 0.2, 0.12, 1000); tone('sawtooth', 1000, i * 0.4 + 0.2, 0.2, 0.12, 700); } }, // 重症化!
    saved: () => { arp([60, 64, 67, 72, 76, 79, 84], 0.06, 'triangle', 0.2, 0.4, 0.12); },                                   // 正しい 対処
    bad: () => { tone('triangle', N(64), 0, 0.3, 0.2); tone('triangle', N(60), 0.25, 0.3, 0.2); tone('triangle', N(55), 0.5, 0.6, 0.2); }, // しっぱい
    deesc: () => { arp([79, 84, 88], 0.08, 'sine', 0.22, 0.3, 0.1); tone('triangle', N(91), 0.26, 0.5, 0.2, null, 0.15); },
    turn: () => tone('sine', 520, 0, 0.08, 0.1, 780),                                                                         // ターン終了
    ach: () => { arp([88, 91, 96], 0.07, 'square', 0.1, 0.18); noise(0.2, 0.4, 0.08, 8000, 12000, 'highpass'); },
  };
  return { play(n) { try { if (SE.muted || !SOUNDS[n]) return; SOUNDS[n](); } catch (e) { /* 音が出なくても 遊べる */ } } };
})();

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
    const ci = btns.findIndex(b => typeof b === 'string' && /^(とじる|やめる|もどる|いらない|OK)$/.test(b.replace(/<[^>]*>/g, '').trim()));
    const cancel = ci >= 0 && (btns.length === 1 ? /とじる|もどる/.test(btns[0]) : true) ? ci : -1;
    d.innerHTML = `<div class="boxw">${cancel >= 0 ? '<button class="mx" aria-label="とじる">✕</button>' : ''}<div class="box">${html}<div class="acts">${btns.map((b, i) => `<button class="btn ${i === 0 ? 'main' : ''}" data-i="${i}">${b}</button>`).join('')}</div></div></div>`;
    document.body.appendChild(d);
    const done = i => { if (!d.isConnected) return; d.remove(); res(i); };
    d.querySelectorAll('[data-i]').forEach(b => b.onclick = () => done(+b.dataset.i));
    if (cancel >= 0) { d.querySelector('.mx').onclick = () => { SE.play('select'); done(cancel); }; d.addEventListener('click', e => { if (e.target === d) done(cancel); }); }
  });
}
const ask = async (html, yes) => (await modal(html, [yes, 'やめる'])) === 0;
const learned = id => !!S.learned[id];
// むげん病院は その回だけの 薬だな(R.deck)。図鑑には ずっと のこる
const has = id => S.run && S.run.deck ? S.run.deck.includes(id) : learned(id);
function gain(id, silent) { const R = S.run; let nw = false; if (R && R.deck && !R.deck.includes(id)) { R.deck.push(id); nw = true; } return learn(id, silent) || nw; }
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
A('care10', '💧', 'ささえ上手', '症状に ぴったりの ささえを 10回 えらぶ', () => (S.stat.careBest || 0) >= 10);
A('consult5', '📞', 'たよれる 相談役', '専門医の クイズに 5回 正解', () => (S.stat.consultOk || 0) >= 5);
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
    { t: 'バトルの 画面', b: `<div class="mini"><div class="mtop">❤️ 患者の体力 ・ 🥛 善玉菌 ・ ⚠️ 耐性メーター</div><div class="mmid"><span>${ART.doctor(S.look, 44)}👨‍⚕️ きみと 患者</span><span>病原体 ${ART.patho(P.strep, 3, 44)}</span></div><div class="mbot">💊 薬だな(自分のターンに 出てくる)</div></div><p>薬を <b>タップ</b>で えらんで「つかう」。<b>長おし</b>で くわしい説明が 見られる。</p><p>右の病原体の上の マークは、<b>次に してくること</b>。⚔️は こうげき。</p><p>薬は 1回 使うと <b>3ターン 効きつづける</b>。同じ薬を 何回も 使う 必要は ない。患者の <b>めんえき</b>も 毎ターン 病原体を こうげきする。体力と 善玉菌が 多いほど 強いよ。</p><p>🛡️ <b>めんえき隊</b>(好中球・キラーT細胞など)も 毎ターン 1つ 使える。相手に 合う 細胞を えらぼう。薬が 効いて 待つだけの時は <b>⏩様子見</b>。</p><p>🛌 ささえは <b>症状に 合わせて</b>。熱なら 解熱剤、げりなら 経口補水液や 点滴、せきや 息苦しさなら 酸素。合うと「ぴったり」で 効果アップ、合わないと あまり 効かない。</p>` },
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
  titleBG();
  on('cont', resumeRun); on('tut2', () => lessons(S.tut2 >= 99 ? 0 : S.tut2 || 0)); on('endless', endlessStart); on('tut', () => tutorial(S.tut || 0)); on('tutr', () => tutorial(0)); on('play', stageSelect);
  on('zukan', () => zukan('p')); on('ach', achScreen); on('man', manualAll); on('look', lookScreen); on('bookbtn', () => BOOK.open()); on('keep', keepScreen); on('upd', appUpdate);
}
function lookScreen() {
  const L = Object.assign({}, ART.lookObj(S.look));
  const lockStyle = s => (s === 'bald' && !S.ach.s1) || (s === 'robo' && !S.ach.s3);
  const lockAcc = a => a === 'crown' && !S.ach.s3;
  const row = (title, key, items, draw) => `<div class="lrow"><b>${title}</b><div class="lopts">${items.map(([v, ja], i) => { const lk = (key === 'style' && lockStyle(v)) || (key === 'acc' && lockAcc(v)); return `<button class="lopt ${L[key] === v ? 'on' : ''}" data-k="${key}" data-v="${v}" ${lk ? 'disabled' : ''} title="${ja}">${lk ? '🔒' : draw(v, ja, i)}</button>`; }).join('')}</div></div>`;
  screen(`${topBar('お医者さんの 見た目', title)}<div class="lookwrap"><div class="lprev">${ART.doctor(L, 110)}<button class="btn sm" id="rnd">🎲 おまかせ</button></div>
    <div class="lrows">${row('肌の 色', 'skin', ART.SKINS.map(c => [c, '']), v => `<i class="sw" style="background:${v}"></i>`)}
    ${row('髪型', 'style', ART.STYLES, v => ART.doctor(Object.assign({}, L, { style: v, acc: 'none' }), 40))}
    ${row('髪の 色', 'hair', ART.HAIRC.map(c => [c, '']), v => `<i class="sw" style="background:${v}"></i>`)}
    ${row('服', 'coat', ART.COATS, (v, ja) => `<i class="sw" style="background:${v}"></i><span>${ja}</span>`)}
    ${row('小物', 'acc', ART.ACCS, (v, ja) => `<span>${ja}</span>`)}</div></div><p class="note c">🔒の ものは じっせきで 解放(ステージ1・3 クリア)</p>`);
  bindBack(title);
  app.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { SE.play('select'); L[b.dataset.k] = b.dataset.v; S.look = L; save(); lookScreen(); });
  $('#rnd').onclick = () => { SE.play('ok'); const okS = ART.STYLES.filter(s => !lockStyle(s[0])), okA = ART.ACCS.filter(a => !lockAcc(a[0])); S.look = { skin: pick(ART.SKINS), style: pick(okS)[0], hair: pick(ART.HAIRC), coat: pick(ART.COATS)[0], acc: pick(okA)[0] }; save(); lookScreen(); };
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
    (T.give || []).forEach(id => gain(id, true)); save();
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
  if (stage >= 1) { gain('apap', true); gain('nutri', true); gain('sleep', true); gain('cool', true); } if (stage >= 2) gain('bif', true);
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
const NODE = { fork: ['🧭', '分かれ道'], battle: ['⚔️', 'バトル'], elite: ['🔥', '強敵'], event: ['❓', 'イベント'], shop: ['🏪', 'ショップ'], pharm: ['💊', '薬局'], rest: ['🛏️', '休けい'], treasure: ['🎁', '宝箱'], boss: ['👑', 'ボス'] };
function makeMap(stage) {
  const H = stage === 1 ? 9 : stage === 9 ? 13 : 11, floors = [];
  for (let f = 0; f < H; f++) {
    const n = f === H - 1 ? 1 : 2 + rnd(3);
    floors.push(Array.from({ length: n }, (_, i) => ({ f, i, x: n === 1 ? 0.5 : (i + 0.5) / n + (Math.random() - 0.5) * 0.08, type: 'battle', to: [] })));
  }
  const W = [['battle', 38], ['event', 24], ['elite', 12], ['shop', 7], ['pharm', 8], ['rest', 11]];
  floors.forEach((row, f) => row.forEach(nd => {
    if (f === H - 1) nd.type = 'boss';
    else if (f === H - 2) nd.type = 'rest';
    else if (f === 0) nd.type = 'battle';
    else if (f === Math.floor(H / 2)) nd.type = 'treasure';
    else if (stage === 9 && (f === 3 || f === 7)) nd.type = 'fork';
    else { let r = rnd(100); for (const [t, w] of W) { if (r < w) { nd.type = t; break; } r -= w; } if (f < 3 && (nd.type === 'elite' || nd.type === 'rest')) nd.type = 'battle'; if (f < 2 && (nd.type === 'shop' || nd.type === 'pharm')) nd.type = 'event'; }
  }));
  for (let f = 0; f < H - 1; f++) {
    const a = floors[f], b = floors[f + 1];
    a.forEach(nd => { const near = b.map((m, j) => [Math.abs(m.x - nd.x), j]).sort((p, q) => p[0] - q[0]); nd.to.push(near[0][1]); if (near[1] && Math.random() < 0.55) nd.to.push(near[1][1]); });
    b.forEach((m, j) => { if (!a.some(nd => nd.to.includes(j))) { const k = a.map((nd, i) => [Math.abs(nd.x - m.x), i]).sort((p, q) => p[0] - q[0])[0][1]; a[k].to.push(j); } });
    a.forEach(nd => nd.to = [...new Set(nd.to)].sort());
  }
  return floors;
}
function statusBar(R, split) {
  const gutPct = R.gut * 10, resPct = Math.min(100, R.resist * 5);
  return `<div class="status"><div class="sb hp"><span>❤️</span><div class="bar"><i style="width:${R.hp / R.max * 100}%"></i></div><b>${R.hp}/${R.max}</b></div>
    <div class="sb gut" title="善玉菌"><span>🥛</span><div class="bar"><i style="width:${gutPct}%"></i></div><b>${R.gut}</b></div>
    <div class="sb res" title="耐性メーター"><span>⚠️</span><div class="bar"><i style="width:${resPct}%"></i></div><b>${R.resist}</b></div>
    <div class="sb coin">🪙${R.coins}</div>${split ? '<button class="sbtn" id="bk">📕<small>攻略本</small></button><button class="sbtn" id="quit">⏸</button>' : ''}</div>
    ${split ? '' : relicsRow(R)}`;
}
function relicsRow(R, noBook) {
  return `<div class="relics">${noBook ? '' : '<span class="relic bkbtn" id="bk">📕攻略本</span>'}${R.abg ? '<span class="relic" data-abg="1">📊</span>' : ''}${R.relics.map(r => `<span class="relic" data-r="${r}">${RL(r).em}</span>`).join('')}${R.items.map((it, i) => `<span class="item" data-it="${i}">${IT[it].em}</span>`).join('')}</div>`;
}
const RL = id => RM[id];
function bindStatus(inBattle) {
  const bk = $('#bk'); if (bk) bk.onclick = () => { const f = B && B.foes ? B.foes[B.tgt] || B.foes.find(x => x.hp > 0) : null; BOOK.open(f && f.k >= 3 ? P[P[f.pid].base || f.pid].ja : null, !!B); };
  app.querySelectorAll('[data-r]').forEach(e => e.onclick = () => { const r = RL(e.dataset.r); modal(`<b>${r.em} ${r.ja}</b><p>${r.desc}</p>`, ['とじる']); });
  app.querySelectorAll('[data-abg]').forEach(e => e.onclick = () => abgModal());
  app.querySelectorAll('[data-cond]').forEach(e => e.onclick = () => condModal());
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
  if (nd.type === 'pharm') return pharmScreen();
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
  if (R.stage === 9) { hp = Math.round(hp * 0.7 * (1 + (R.act - 1) * 0.15)); atkAdd += Math.floor((R.act - 1) / 2) + ((R.mod && R.mod.atk) || 0); if (node === 'boss' && !p.boss) hp = Math.round(hp * 1.5); }
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
  let first = !S.seen[pid];
  const fresh = R.stage === 9 && first; if (fresh) first = false;
  if (first) k = 3;
  if (R.relics.includes('chart') && S.kills[pid]) k = 3;
  if (R.relics.includes('steth')) k = Math.max(k, 1);
  if (!sg) k = known != null ? known : k;
  let h = hp; if (R.relics.includes('soap')) h = Math.ceil(h * 0.9);
  if (R.stage === 9 && mlv('wash')) h = Math.ceil(h * (1 - 0.04 * mlv('wash')));
  let rd = null, myst = false, decoy = null;
  if (R.stage === 9 && R.abg && R.abg[pid] && Math.random() * 100 < R.abg[pid].pct) rd = R.abg[pid].d;
  if (R.stage === 9 && node === 'boss') { myst = true; const o = PATHO.filter(x => x.cat !== p.cat && !x.base && x.id !== pid && /[^ ]/.test(x.sym)); decoy = pick(o).id; }
  return { pid, rd, myst, decoy, hp: h, max: hp, atkAdd, k, pi: 0, block: 0, dots: [], fresh, toxin: false, self: p.self ? p.self + (R.asc >= 3 ? 1 : 0) : 0, combo: new Set(), first, conv };
}
function startBattle(o) {
  const R = S.run;
  R.snap = JSON.stringify({ hp: R.hp, gut: R.gut, resist: R.resist, items: R.items, coins: R.coins });
  B = { o, foes: o.foes.map(pid => makeFoe(pid, o.node, o.known)), turn: 0, ap: 0, apMax: 3 + (R.relics.includes('coat') ? 1 : 0), cd: {}, usedTurn: new Set(), sel: null, tgt: 0, guard: 0, free: R.relics.includes('loupe') ? 1 : 0, dmgTaken: 0, wrong: 0, abxOnSelf: false, cdSpawned: false, busy: false, log: [], immUp: 0, immDown: R.imm > 0 ? 2 : 0 };
  if (R.relics.includes('thermo')) R.hp = Math.min(R.max, R.hp + 3);
  if (R.stage === 9) { if (mlv('sleep')) R.hp = Math.min(R.max, R.hp + 2 * mlv('sleep')); if (mlv('lab')) B.freeTest = 1; B.ferm = mlv('ferm'); }
  if (R.imm > 0) { R.imm--; setTimeout(() => toast('😪 めんえきが 下がっていて、病原体が 強い…', 2600), 400); }
  if (R.cdNext && o.node !== 'boss' && !o.tut) { R.cdNext = false; B.foes = [B.foes[0], makeFoe('cdiff', 'battle', 0)]; B.foes[1].k = 3; B.foes[1].first = false; }
  save(); introFoes().then(async () => { if (B.foes.some(f => f.pid === 'cdiff') && !B.o.cdShown) { B.o.cdShown = 1; await cdHelp('前の治療で 善玉菌が へって、ディフィシル菌が ふえていた!'); } playerTurn(); });
}
async function ensureCombo(p) {
  // 併用が必要な相手には、効く薬を かならず 2つ以上 持たせる(1つでは 勝てないので)
  const own = DRUGS.filter(d => has(d.id) && effOf(d, p) >= 1);
  if (own.length >= 2) return;
  const add = DRUGS.filter(d => !has(d.id) && effOf(d, p) === 2).sort((a, b) => a.cost - b.cost).slice(0, 2 - own.length);
  if (!add.length) return;
  add.forEach(d => gain(d.id)); save();
  await modal(`<div class="row c">${ART.patho(p, 3, 80)}</div><b>🤝 ${p.ja}には 併用が 必要!</b><p>1つの薬だけでは 耐性が できやすいので、2つ以上を 同じターンに 使おう。</p><p class="got">💊 ${add.map(d => '<b>' + d.ja + '</b>').join('・')}を おぼえた!</p>`, ['たたかう']);
}
async function introFoes() {
  for (const f of B.foes) if (P[f.pid].combo) await ensureCombo(P[f.pid]);
  for (const f of B.foes) if (f.myst && !f.mystShown) { f.mystShown = true; SFX.play('newFoe'); await modal('<b class="big">🕵️ ミステリーボス!</b><p>この ボスは <b>症状が まぎらわしい</b>。見た目の 症状に だまされないで。</p><p class="note">検査を <b>2つ 以上</b> すると 正体に せまれる。</p>', ['しらべる!']); }
  for (const f of B.foes) {
    const p = P[f.pid];
    if (f.conv) await modal(`<div class="row c">${ART.patho(p, 3, 90)}</div><b>⚠️ 耐性菌に なっていた!</b><p>耐性メーターが たまっていたので、<b>${p.ja}</b>が あらわれた。</p><p class="note">${p.fact}</p>`, ['たたかう']);
    if (!f.first) continue;
    S.seen[p.base || p.id] = S.seen[p.base || p.id] || Date.now(); S.seen[p.id] = S.seen[p.id] || Date.now();
    const owned = DRUGS.filter(d => has(d.id) && effOf(d, p) === 2);
    let give = null;
    if (!owned.length) { give = DRUGS.filter(d => effOf(d, p) === 2).sort((a, b) => a.gut - b.gut || a.cost - b.cost)[0] || (p.self ? D.ors : null); if (give && !has(give.id)) gain(give.id); else if (p.self && !has('ors')) { give = D.ors; gain('ors'); } else give = null; }
    const how = p.noDrug ? '効く薬は ない。<b>内視鏡</b>で 取り出そう' : p.self ? '特効薬は ない。体をささえて めんえきを 待とう' : `効く薬: <b>${DRUGS.filter(d => effOf(d, p) === 2 && d.cat !== 'sup').map(d => d.ja).slice(0, 4).join('・')}</b>${p.combo ? '<br>⚠️ 2つ以上を 同じターンに 組み合わせて使う(併用)' : ''}`;
    f.first = false;
    SFX.play('newFoe');
    const effD = DRUGS.filter(d => effOf(d, p) === 2 && has(d.id)).sort((a, b) => isBest(b, p) - isBest(a, p)).slice(0, 4);
    await modal(`<div class="meet"><span class="meet-new">NEW!</span>${ART.patho(p, 3, 120)}</div><span class="tag" style="background:${CAT[p.cat].col}">${CAT[p.cat].em} ${CAT[p.cat].ja}${p.gram ? '・' + GRAM[p.gram] : ''}</span><b class="big">${p.ja}</b><p class="note">📍${p.place} 🤒${p.sym}</p>${p.noDrug ? '<p>💊 薬は 効かない → <b>内視鏡</b>で とり出そう</p>' : p.self ? '<p>💊 特効薬は ない → 体を ささえて めんえきを 待とう</p>' : `<p class="meet-d">💊 ${effD.map(d => `<span class="mini ${isBest(d, p) ? 'best' : ''}" data-did="${d.id}">${drugArt(d, 36)}<b>${d.ja}</b></span>`).join('')}</p>`}${p.combo ? '<p class="warn">🤝 2つ以上を 同じターンに 使おう(併用)</p>' : ''}${give ? `<p class="got">🎁 <b>${give.ja}</b>を おぼえた!</p>` : ''}<details class="dc-more"><summary>📝 もっと 知る</summary><p>${p.fact}</p></details><p class="note">次からは 自分で 思い出して たたかおう!</p>`, ['たたかう!']);
  }
  save();
}
const DOT_T = 3;
// 患者の めんえき(毎ターン 病原体を こうげき)。体力・善玉菌が 多いほど 強く、ステロイドなどで 弱くなる
function immPower() { const R = S.run; return clamp(1 + Math.round(R.hp / R.max * 2) + (R.gut >= 6 ? 1 : 0) + B.immUp - B.immDown + (R.stage === 9 ? mlv('food') : 0), 0, 9); }
function foeIntent(f) { const p = P[f.pid]; const [k, v] = p.pat[f.pi % p.pat.length]; return [k, k === 'atk' ? Math.max(0, v + f.atkAdd) * (f.toxin ? 2 : 1) - (maskOn(p) ? 1 : 0) : v]; }
const maskOn = p => S.run.relics.includes('mask') && /のど|肺/.test(p.place);
function intentHtml(f) {
  const p = P[f.pid];
  if (f.sp) { const s = SPECIALS[f.sp]; return `<span class="intent sp">${s.em} ${s.ja}</span>`; }
  if (f.self) { const [k, v] = foeIntent(f); return `<span class="intent">${k === 'atk' ? '⚔️' + v : '…'}</span><span class="intent self">⏳あと${f.self}</span>`; }
  const [k, v] = foeIntent(f);
  return `<span class="intent ${k}">${{ atk: '⚔️' + v, grow: f.dots.length ? '⬆️(薬で止まる)' : '⬆️ふえる', toxin: '☠️どくそ', hide: '🛡️かくれる' }[k]}</span>`;
}
function foeLabel(f) {
  const p = P[f.pid];
  if (f.k >= 3) return `<b>${p.ja}</b>`;
  if (f.k === 2) return `<b style="color:${CAT[p.cat].col}">${p.gram ? GRAM[p.gram] + '菌' : CAT[p.cat].ja}</b>`;
  if (f.k === 1) return `<b style="color:${CAT[p.cat].col}">${CAT[p.cat].ja}</b>`;
  return S.run && S.run.stage === 9 ? '' : '<b>???</b>';
}
function renderBattle() {
  if (!B || !S.run) return;
  for (const f of B.foes) if (f.fresh && f.k >= 3) { f.fresh = false; const p = P[f.pid]; S.seen[p.base || p.id] = S.seen[p.base || p.id] || Date.now(); S.seen[p.id] = S.seen[p.id] || Date.now(); save(); setTimeout(() => { toast(`🆕 はじめて 見つけた! ${p.ja} が 図鑑に のった`, 2600); SFX.play('newFoe'); }, 200); }
  const R = S.run;
  const foes = B.foes.map((f, i) => {
    const p = P[f.pid]; if (f.hp <= 0) return '';
    return `<div class="foe ${B.tgt === i ? 'tgt' : ''} ${f.info && f.info.lines ? 'inf' : ''}" data-t="${i}" ${f.k >= 3 ? `data-pid="${p.base || p.id}"` : ''}><div class="ints">${intentHtml(f)}</div><div class="pw">${ART.patho(p, f.k, B.foes.filter(x => x.hp > 0).length > 1 ? 82 : 110)}${f.info && f.info.gram && p.cat === 'bac' && p.gram !== 'none' && p.gram !== 'acid' ? `<span class="gb">${gramSVG(p, 40)}</span>` : ''}</div>${foeLabel(f)}<span class="note">${S.run.stage === 9 && f.k < 3 && !(f.info && f.info.ask) ? vague(f.myst && (f.tests || 0) < 2 ? P[f.decoy] : p) : p.place + '|' + p.sym}${f.myst && f.k < 3 ? '<b class="myst">🕵️ミステリー</b>' : ''}${f.rdKnown ? `<b class="rdk">😈${D[f.rd].ja}✕</b>` : ''}</span>${f.info && f.info.lines ? `<span class="finfo">${f.info.lines.slice(-3).map(x => '<i>' + esc(x) + '</i>').join('')}</span>` : ''}
      ${f.dots.length ? `<div class="dots">${f.dots.map(x => `<span>💊${esc(D[x.id].ja.slice(0, 6))} ${x.t}</span>`).join('')}</div>` : ''}<div class="bar fhp"><i style="width:${f.hp / f.max * 100}%"></i><em>${f.hp}/${f.max}${f.block ? ` 🛡️${f.block}` : ''}</em></div>${p.combo && f.k >= 3 ? '<span class="note warn">併用が必要</span>' : ''}</div>`;
  }).join('');
  const tip = B.o.tip ? `<div class="tip">💡 ${B.o.tip}</div>` : '';
  const testCost = R.relics.includes('scope') ? 0 : 1;
  B.mode = B.mode || 'rx';
  const isRx = d => d.cat !== 'sup' || Object.keys(d.eff).length > 0;
  const shelf = DRUGS.filter(d => has(d.id) && (B.mode === 'rx' ? isRx(d) : !isRx(d)));
  const anyDots = B.foes.some(f => f.hp > 0 && f.dots.length), selfOnly = B.foes.filter(f => f.hp > 0).every(f => P[f.pid].self || P[f.pid].noDrug && false);
  const tabs = B.mode === 'rx' ? ['all', 'abx', 'vir', 'fun', 'par', 'sup'].filter(c => c === 'all' || shelf.some(d => d.cat === c)) : [];
  B.tab = B.tab && tabs.includes(B.tab) ? B.tab : 'all';
  const sel = B.sel && D[B.sel];
  const tf = B.foes[B.tgt];
  const keepY = window.scrollY, keepS = ($('.drugs') || {}).scrollTop || 0;
  screen(`${statusBar(R, true)}${tip}
    <div class="scene n${B.foes.filter(x => x.hp > 0).length}">${bgSVG(bgTheme(R))}<div class="sceneleft"><span class="syms">${[...symptoms()].map(x => `<i title="${SYM[x][1]}">${SYM[x][0]}<b>${SYM[x][1]}</b></i>`).join('')}</span>${condChips()}${R.relics.length || R.items.length || R.abg ? relicsRow(R, true) : ''}</div><div class="left">${ART.doctor(S.look, 70)}<div class="patbox">${ART.patient(R.stage ? PATIENTS[SG(R).patient].look : 'kid', R.hp < R.max * 0.5, 66)}${B.guard ? `<span class="guard">🛡️${B.guard}</span>` : ''}<span class="imm">🛡️めんえき ${immPower()}</span></div></div><div class="right">${foes}</div></div>
    <div class="shelf ${B.busy ? 'hide' : ''}">
      <div class="shtop"><span class="ap">${Array.from({ length: B.apMax }, (_, i) => `<i class="${i < B.ap ? 'on' : ''}"></i>`).join('')}</span>
        <button class="btn sm" id="test" ${tf && !B.busy ? '' : 'disabled'}>🔬検査</button>
        <button class="btn sm" id="hint" ${tf && tf.k < 3 && (B.free || R.items.includes('hint')) ? '' : 'disabled'}>💡${B.free ? 'タダ' : '×' + R.items.filter(x => x === 'hint').length}</button>
        <button class="btn sm wait" id="wait" ${B.busy ? 'disabled' : ''}>⏩様子見</button><button class="btn sm end ${B.ap === 0 && !B.busy ? 'pulse' : ''}" id="end">ターン終了</button></div>
      ${B.cells && B.mode === 'care' ? `<div class="cells"><span class="cl-h">🛡️めんえき隊${S.run.immLv ? " Lv" + (S.run.immLv + 1) : ""}<br><small>${B.cellUsed ? 'つかった' : '1つ えらぶ'}</small></span>${B.cells.map(id => `<button class="cell ${B.cellUsed ? 'off' : ''}" data-c="${id}" style="--c:${CL[id].col}">${ART.cell(id, 30)}<b>${CL[id].ja}</b></button>`).join('')}</div>` : ''}
      <div class="modebar">${B.mode === 'rx' ? `<span class="mode-t">💊 処方</span><div class="tabs">${tabs.map(c => `<button class="tab ${B.tab === c ? 'on' : ''}" data-tab="${c}">${c === 'all' ? 'ぜんぶ' : DCAT[c].replace('薬', '')}</button>`).join('')}</div><button class="btn sm modesw" id="toCare">🛌 ${anyDots ? 'ささえるへ' : 'ささえる'}</button>` : `<span class="mode-t care">🛌 ささえる</span><button class="btn sm modesw" id="toRx">💊 処方を かえる・足す</button>`}</div>
            <div class="drugs">${shelf.filter(d => B.tab === 'all' || d.cat === B.tab).map(d => { const cd = B.cd[d.id] || 0, used = B.usedTurn.has(d.id), lv = R.lv[d.id] || 1; const off = cd > 0 || used || B.ap < d.cost; return `<button class="drug ${off ? 'off' : ''} ${B.sel === d.id ? 'sel' : ''} ${B.mode === 'care' && careFit(d) === 2 ? 'fit' : ''}" data-d="${d.id}" style="--c:${dCol(d)}"><span class="cost">${'●'.repeat(d.cost)}</span>${drugArt(d, 34)}<b class="${d.ja.length > 9 ? 'l3' : d.ja.length > 6 ? 'l2' : ''}">${d.ja}</b>${lv > 1 ? `<span class="lv">Lv${lv}</span>` : ''}${cd > 0 ? `<span class="cd">あと${cd}</span>` : used ? '<span class="cd">使った</span>' : ''}</button>`; }).join('')}</div>
      <div class="usebar ${sel || !B.ap ? '' : 'idle'}">${sel ? `<span><b>${sel.ja}</b> を ${tf ? (tf.k >= 3 ? P[tf.pid].ja : '???') : ''}に</span><button class="btn main" id="use">つかう</button>` : (B.ap ? '<span class="note">薬 → 病原体を タップ。長おしで カード</span>' : '<span class="note warn">処方ポイントが なくなった。ターン終了を おそう</span>')}</div>
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
  $('#end').onclick = () => { B.auto = false; endTurn(); };
  const tc = $('#toCare'); if (tc) tc.onclick = () => { SFX.play('select'); B.mode = 'care'; B.sel = null; renderBattle(); };
  const tr = $('#toRx'); if (tr) tr.onclick = () => { SFX.play('select'); B.mode = 'rx'; B.sel = null; renderBattle(); };
  const wt = $('#wait'); if (wt) wt.onclick = () => { if (B.busy) return; B.auto = { turns: 0, hp: S.run.hp, kills: B.foes.filter(f => f.hp <= 0).length }; toast('⏩ 様子を みる(何か かわったら 止まるよ)', 1800); endTurn(); };
  app.querySelectorAll('[data-c]').forEach(e => {
    let tm = null, long = false;
    e.addEventListener('pointerdown', () => { long = false; tm = setTimeout(() => { long = true; const c = CL[e.dataset.c]; modal(`<div class="row c">${ART.cell(c.id, 90)}</div><b class="big">${c.ja}</b><p>${c.desc}</p><p class="note">めんえき隊は 毎ターン 1つ 使える(処方ポイント 0)。栄養・安静で 強くなり、ステロイドや 夜ふかしで 弱くなる。</p>`, ['OK']); }, 450); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => e.addEventListener(ev, () => clearTimeout(tm)));
    e.onclick = () => { if (long || B.cellUsed || B.busy) return; useCell(e.dataset.c); };
  });
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
function drugCard(d, lv = 1, opt = {}) {
  const targets = PATHO.filter(p => !p.base && effOf(d, p) >= 1);
  const best = new Set(PATHO.filter(p => isBest(d, p)).map(p => p.id));
  const sorted = targets.sort((a, b) => best.has(b.id) - best.has(a.id));
  return `<div class="dcard" style="--c:${dCol(d)}"><div class="dc-top"><span class="dc-cost">${'●'.repeat(d.cost)}</span><span class="dc-genre">${GI[d.cat]}</span><span class="dc-star">${'★'.repeat(stars(d))}${'☆'.repeat(3 - stars(d))}</span></div>
    <div class="dc-art">${drugArt(d, 92)}</div><b class="dc-name">${d.ja}</b>${famOf(d.id) ? `<span class="dc-fam">👥 ${famOf(d.id).f.ja}</span>` : ''}<span class="dc-sub">${[d.brand, FORM_JA[FORM[d.id]]].filter(Boolean).join('・')}</span>
    <div class="dc-stats">${d.dmg ? bar('⚔️ つよさ', dmgOf(d, lv), 20, '#ff6b6b') : bar('❤️ かいふく', (d.heal || 0) + (d.guard || 0) / 2 + (d.gutUp || 0) + (d.immUp || 0) * 2, 10, '#ff8fa3')}${bar('🥛 おなかに やさしい', 4 - (d.gut || 0), 4, '#6bd18c')}${bar('🌱 耐性に なりにくい', 4 - (d.rsk || 0), 4, '#7fc8ff')}</div>
    ${sorted.length ? `<div class="dc-foes"><span>とくいな 相手</span><div>${sorted.slice(0, 10).map(p => `<span class="dc-foe ${best.has(p.id) ? 'best' : ''} ${effOf(d, p) === 1 ? 'so' : ''}" title="${esc(p.ja)}" data-k="${esc(p.ja)}" data-pid="${p.id}">${ART.patho(p, S.seen[p.id] || opt.all ? 3 : 0, opt.big ? 46 : 34)}${best.has(p.id) ? '<i>✨</i>' : ''}</span>`).join('')}</div></div>` : ''}
    ${COND.filter(c => c.bad(d)).length ? `<p class="dc-ng">🚫 気をつける人: ${COND.filter(c => c.bad(d)).map(c => c.em + c.ja).join('・')}</p>` : ''}${CARE_FOR[d.id] ? `<p class="dc-when">👉 こんな時に: ${CARE_FOR[d.id].map(x => SYM[x][0] + SYM[x][1]).join('・')}</p>` : ''}<p class="dc-desc">${d.desc}</p><details class="dc-more"><summary>📝 もっと 知る</summary><p>${d.fact}</p><p class="note">${d.cls}${d.sub ? '・' + d.sub : ''}</p></details></div>`;
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
    ${drugs.length ? `<div class="dc-foes"><span>${p.noDrug ? '' : '効く 薬'}</span><div>${drugs.slice(0, 10).map(d => `<span class="dc-foe ${isBest(d, p) ? 'best' : ''} ${effOf(d, p) === 1 ? 'so' : ''}" title="${esc(d.ja)}" data-k="${esc(d.ja)}" data-did="${d.id}">${has(d.id) || opt.all ? drugArt(d, opt.big ? 48 : 32) : '<span class="q">?</span>'}${isBest(d, p) ? '<i>✨</i>' : ''}</span>`).join('')}</div></div>` : `<p class="dc-desc">${p.self ? '💊 特効薬は ない → 体を ささえて めんえきを 待とう' : ''}</p>`}
    ${C.hist ? `<details class="dc-more"><summary>🗣️ 問診の ヒント</summary><p>${C.hist}</p></details>` : ''}<details class="dc-more"><summary>📝 もっと 知る</summary><p>${p.fact}</p>${C.rapid ? '<p class="note">🧪 迅速検査で わかる</p>' : ''}</details>
    ${opt.kills != null ? `<p class="note">たおした数: ${opt.kills}</p>` : ''}</div>`;
}
// 薬や 病原体の 絵を 長おし → ページを 移らずに 小窓で 見る
function peek(el) {
  const did = el.dataset.did, pid = el.dataset.pid;
  if (did && D[did]) { SFX.play('select'); modal(drugCard(D[did], 1, { all: true }), ['とじる']).then(() => {}); return true; }
  if (pid && P[pid]) { SFX.play('select'); modal(pathoCard(P[pid], { all: true }), ['とじる']); return true; }
  return false;
}
(() => {
  let tm = null, el = null, fired = false;
  const sel = '[data-did], [data-pid]';
  document.addEventListener('pointerdown', e => { const t = e.target.closest && e.target.closest(sel); if (!t || t.closest('.drug')) return; el = t; fired = false; clearTimeout(tm); tm = setTimeout(() => { if (el) { fired = peek(el); } }, 450); }, true);
  const stop = () => { clearTimeout(tm); el = null; };
  ['pointerup', 'pointercancel', 'pointerleave', 'scroll'].forEach(ev => document.addEventListener(ev, stop, true));
  document.addEventListener('click', e => { if (fired) { fired = false; e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest(sel)) e.preventDefault(); }, true);
})();
const SYM = { fever: ['🤒', '熱'], pain: ['😣', 'いたみ'], gi: ['💩', 'げり'], vomit: ['🤮', 'はく'], vomitS: ['🤮', 'はげしく はく'], resp: ['😮‍💨', 'せき'], itch: ['🫳', 'かゆみ'] };
function symOf(p) { const s = new Set(), t = p.sym + ' ' + p.place; if (/ねつ|熱/.test(t)) s.add('fever'); if (/いたい|いたみ|痛/.test(t)) s.add('pain'); if (/げり/.test(t)) s.add('gi'); if (/はく|吐|はき気/.test(t)) s.add('vomit'); if (/せき|息|ゼーゼー|肺/.test(t)) s.add('resp'); if (/かゆ/.test(t)) s.add('itch'); return s; }
function vague(p) { const s = [...symOf(p)]; return s.length ? s.map(x => SYM[x][0] + SYM[x][1]).join(' ') : '😐 なんとなく 具合が わるい'; }
function symptoms() {
  const s = new Set();
  for (const f of (B ? B.foes : [])) {
    if (f.hp <= 0) continue; const p = P[f.pid], t = p.sym + ' ' + p.place;
    if (/ねつ|熱/.test(t)) s.add('fever');
    if (/いたい|いたみ|痛/.test(t)) s.add('pain');
    if (/げり/.test(t)) s.add('gi'); if (/はく|吐|はき気/.test(t)) s.add('vomit');
    if (/せき|息|ゼーゼー|肺/.test(t)) s.add('resp');
    if (/かゆ/.test(t)) s.add('itch');
  }
  if (S.run && S.run.gut <= 0) s.add('gi');
  if (s.has('vomit') && S.run && S.run.hp <= S.run.max * 0.5) { s.delete('vomit'); s.add('vomitS'); }
  return s;
}
// ささえる薬が 合う 症状
const CARE_FOR = { apap: ['fever', 'pain'], loxo: ['fever', 'pain'], dclf: ['fever', 'pain'], cool: ['fever'], ors: ['gi', 'vomit', 'vomitS'], okayu: ['gi'], drip: ['gi', 'vomitS'], bif: ['gi'], domp: ['vomit', 'vomitS'], o2: ['resp'], humid: ['resp'], honey: ['resp'], dxm: ['resp'], carbo: ['resp'], antih: ['itch'] };
function careFit(d) { const need = CARE_FOR[d.id]; if (!need) return 1;
  { const s = symptoms(); if (d.id === 'okayu') { if (s.has('vomitS')) return -1; if (s.has('vomit')) return 1; if (!need.some(x => s.has(x))) return 1; } if (d.id === 'ors' && s.has('vomitS')) return 1; } if (d.nsaid && B && B.foes.some(x => x.hp > 0 && ['flu', 'flu_boss', 'vzv'].includes(x.pid))) return 1; const s = symptoms(); return need.some(x => s.has(x)) ? 2 : 0; }
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
  // 患者さんの 条件(むげん病院)
  { const bad = contraFor(d); if (bad.length) { const c = bad[0]; R.hp -= c.hit; B.wrong++; R.wrong++; R.condKnown = true; st('contraNg'); immGood(-1); SE.play('ng'); floatTxt('❤️-' + c.hit, null, 'bad'); banner(`${c.em} ${c.ja}!`, 'bad'); toast(`⚠️ ${c.msg}`, 3400); if (c.stop) { renderBattle(); if (R.hp <= 0) return lose(); return afterAction(); } } }
  // インフルエンザ・水ぼうそうの時の 解熱剤の えらび方(NSAIDsは さける・アセトアミノフェンが よい)
  const viral = B.foes.some(x => x.hp > 0 && ['flu', 'flu_boss', 'vzv'].includes(x.pid));
  const kid = !R.stage || SG(R).patient === 'kid';
  if (viral && d.nsaid) {
    const pen = kid ? (d.nsaid >= 2 ? 6 : 4) : 2; R.hp -= pen; B.wrong++; R.wrong++; st('nsaidNg'); immGood(-1);
    SE.play('ng'); floatTxt('❤️-' + pen, null, 'bad');
    toast(kid ? `⚠️ インフルエンザ・水ぼうそうの 子どもに ${d.ja}(NSAIDs)は ✕。脳症などが 重くなる おそれ。アセトアミノフェンを 使おう` : `⚠️ インフルエンザ・水ぼうそうの時は NSAIDsを さけて、アセトアミノフェンを 使うのが 安全`, 4200);
    if (kid) { renderBattle(); return afterAction(); }
  }
  if (viral && d.id === 'apap') { R.hp = Math.min(R.max, R.hp + 2); st('apapOk'); toast('◎ インフルエンザ・水ぼうそうの 熱には アセトアミノフェン。正解!', 2400); }
  if (d.heal || d.guard || d.gutUp || d.immUp) {
    const fit = careFit(d), cm = fit === 2 ? (R.relics.includes('carem') ? 2.4 : 1.6) : fit === 0 ? 0.3 : fit === -1 ? 0 : 1;
    if (fit === -1) { R.hp -= 2; floatTxt('❤️-2', null, 'bad'); SE.play('ng'); toast('🤮 はげしく はいている時に おかゆは 逆効果… まず 点滴(輸液)で 水分を', 3200); st('careMiss'); }
    else if (d.id === 'okayu' && symptoms().has('vomit')) toast('🤮 はいている時は、おかゆより 経口補水液を 少しずつが 先', 2800);
    else if (d.id === 'ors' && symptoms().has('vomitS')) toast('🤮 はげしく はいて 飲めない時は、点滴(輸液)の ほうが いい', 2800);
    const heal = Math.round((d.heal || 0) * cm + (d.heal ? (lv - 1) * 2 : 0)), guard = Math.round((d.guard || 0) * cm);
    if (heal) { R.hp = Math.min(R.max, R.hp + heal); floatTxt('❤️+' + heal, null, 'heal'); }
    if (guard) B.guard += guard;
    if (d.gutUp) R.gut = Math.min(10, R.gut + Math.round(d.gutUp * (fit === 2 ? 1.5 : 1)));
    if (fit === 2) immGood(R.relics.includes('carem') ? 4 : 2, 'ぴったりの ささえ'); else if (fit === 1 && d.cat === 'sup') immGood(1, 'ささえ'); else if (fit <= 0) immGood(-1);
    if (fit === 2) { banner('✨ ぴったりの ささえ!', 'best'); SFX.play('best'); st('careBest'); const need = CARE_FOR[d.id].filter(x => symptoms().has(x)).map(x => SYM[x][1]).join('・'); setTimeout(() => toast(`◎ ${need}に ${d.ja}。効果 アップ!`, 2400), 300); }
    else if (fit === 0) { const need = CARE_FOR[d.id].map(x => SYM[x][1]).join('や'); toast(`△ ${need}が ないので、${d.ja}は あまり 効かない`, 2800); st('careMiss'); }
    if (d.hurt) { R.hp -= d.hurt; toast(`💊 ${d.ja}の 副作用 ❤️-${d.hurt}`); }
    if (d.immUp) { B.immUp = Math.min(4, B.immUp + d.immUp); floatTxt('🛡️めんえき UP', null, 'heal'); }
    if (d.immDown) { B.immDown += d.immDown; B.foes.forEach(f => { if (f.self) f.self++; }); toast('⚠️ めんえきが 下がった…(病原体への こうげきが 弱くなる)', 2600); }
    SFX.play(d.heal ? 'heal' : 'guard'); renderBattle(); return afterAction();
  }
  // 抗菌薬の 体への えいきょう(善玉菌・耐性)
  if (d.cat === 'abx' || d.gut) {
    const before = R.gut;
    if (before === 0 && d.gut) { R.hp -= 1; floatTxt('げり❤️-1', null, 'bad'); }
    let gl = p.combo ? Math.ceil(d.gut / 2) : d.gut; if (gl > 0 && B.ferm > 0) { gl--; B.ferm--; floatTxt('🥛まもった', null, 'heal'); }
    R.gut = Math.max(0, R.gut - gl);
    if (before > 0 && R.gut === 0) B.gutHit = true;
    R.resist += d.rsk;
    if (id === 'mepm') R.mepm++;
    if (R.gut === 0) R.gutZero++;
  }
  if (d.hurt) { R.hp -= d.hurt; floatTxt('副作用❤️-' + d.hurt, null, 'bad'); }
  if (p.self && d.cat === 'abx') B.abxOnSelf = true;
  const e = effOf(d, p);
  // 病院の 耐性表: この 菌は この薬に 耐性だった
  if (e && f.rd === id) {
    B.wrong++; R.resist += 1; f.rdKnown = true; const pen = 2; R.hp -= pen; st('abgHit');
    SFX.play('miss'); renderBattle(); await fx('miss', ti); floatTxt('😈 耐性!', ti, 'bad'); floatTxt('❤️-' + pen, null, 'bad');
    toast(`😈 この ${f.k >= 3 ? p.ja : '菌'}は ${d.ja}に 耐性だった! 📊耐性表と 🧫培養を 見て 別の 薬を`, 3600);
    return afterAction();
  }
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
  if (R.relics.includes('tantei') && f.k >= 3) mult *= 1.3;
  if (R.relics.includes('pin')) { if (e === 2 && isBest(d, p)) mult *= 1.4; else if (d.gut >= 3) mult *= 0.7; }
  if (e === 2 && isBest(d, p) && !d.fixed) { mult *= 1.5; note = '✨ こうか ばつぐん! ばっちりの 薬だ'; st('best');
    const broad = f.dots.filter(x => D[x.id].gut >= 3);
    if (broad.length && d.gut <= 2 && f.k >= 3) { f.dots = f.dots.filter(x => D[x.id].gut < 3); R.resist = Math.max(0, R.resist - 2); R.gut = Math.min(10, R.gut + 1); st('deesc'); note = '🎯 しぼりこみ成功! 広い薬を やめて ねらいの薬へ(耐性 -2・善玉菌 +1)'; } }
  let dmg = 0;
  const old = f.dots.find(x => x.id === id);
  if (d.fixed) dmg = d.fixed;
  else if (old) { old.t = DOT_T; note = 'もう 効いている。効く期間が のびただけ'; }
  else { f.dots.push({ id, per: Math.max(1, Math.round(base * 0.5 * mult)), t: DOT_T }); dmg = Math.round(base * 0.4 * mult); if (!p.combo || new Set(f.dots.map(x => x.id)).size >= 2) B.toCare = true; }
  if (p.combo && !d.fixed) { if (new Set(f.dots.map(x => x.id)).size < 2) { dmg = Math.ceil(dmg * 0.35); note = '1つだけでは 弱い。もう1つ 組み合わせよう!'; } else note = '併用で 効いている!'; }
  const blk = Math.min(f.block, dmg); f.block -= blk; dmg -= blk;
  f.hp = Math.max(0, f.hp - dmg);
  if (f.k < 3 && e === 2) { if (f.info && f.info.ask) { f.k = 3; st('mitate'); setTimeout(() => toast(`🩺 見立てどおり! 正体は <b>${p.ja}</b>(治療しながら わかった)`, 3000), 500); } else f.k = Math.max(f.k, 1); }
  SFX.play('drug'); renderBattle(); await fx('hit', ti); SFX.play(e === 2 ? 'hit' : 'hitSoft'); floatTxt('-' + dmg + (blk ? `(🛡️${blk})` : ''), ti); if (note) { if (/ばつぐん/.test(note)) { banner('✨ こうか ばつぐん!', 'best'); SFX.play('best'); } else if (/しぼりこみ/.test(note)) { banner('🎯 しぼりこみ 成功!', 'best'); SFX.play('deesc'); } else toast(note, 1800); }
  if (f.hp <= 0) await killFoe(ti);
  if (f.hp > 0 && f.sp === 'hide' && dmg >= 10) f.spBroken = true;
  if (B.toCare && B.mode === 'rx') { B.toCare = false; B.mode = 'care'; B.sel = null; setTimeout(() => toast('💊 処方 かんりょう! → 🛌 ささえる・めんえき隊で 待とう', 2600), 300); }
  B.toCare = false;
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
  const ok = ['fdx', 'mnz', 'vcm'].filter(has);
  let got = '';
  if (!ok.length) { gain('mnz'); got = '<p class="got">💊 <b>メトロニダゾール</b>を おぼえた!</p>'; }
  await modal(`<div class="row c">${ART.patho(P.cdiff, 3, 80)}</div><b>🥛 ${head}</b><p>抗菌薬で おなかの善玉菌が へると、ディフィシル菌が ふえる。</p><p>効く薬: <b>${['fdx', 'mnz', 'vcm'].map(id => D[id].ja + (has(id) ? '(持っている)' : '')).join('・')}</b></p>${got}<p class="note">フィダキソマイシンは 善玉菌を へらさない。</p>`, ['たたかう']);
  save(); if (B) renderBattle();
}
async function testMenu() {
  const R = S.run, f = B.foes[B.tgt]; if (!f || B.busy) return;
  const cost = t => B.freeTest ? 0 : Math.max(0, t.cost - (R.relics.includes('scope') ? 1 : 0));
  const done = f.info || {};
  const i = await modal(`<b class="big">🔬 どの 検査を する?</b><p class="note">処方ポイント のこり ${B.ap}${B.freeTest ? '(次の 検査は タダ)' : ''}</p>`,
    TESTS.map(t => `<span class="scnb"><b>${t.em} ${t.ja} ${done[t.id] ? '(した)' : '・' + cost(t)}</b><span class="note">${t.desc}</span></span>`).concat(R.stage === 9 ? [`<span class="scnb consult"><b>📞 専門医に 相談 ${B.consulted ? '(した)' : '・1'}</b><span class="note">病原体と 効く薬を 当てたら、その薬を もらえる(1バトル 1回)</span></span>`] : []).concat(['やめる']));
  if (R.stage === 9 && i === TESTS.length) return consult();
  const t = TESTS[i]; if (!t || done[t.id]) return;
  if (B.ap < cost(t)) return toast('処方ポイントが 足りない');
  B.ap -= cost(t); B.freeTest = 0; doTestKind(t.id);
}
// 専門医に 相談: ① 病原体を 当てる ② 効く薬を 当てる → 両方 正解で その薬を もらえる
async function consult() {
  const R = S.run, f = B.foes[B.tgt]; if (!f || f.hp <= 0) return;
  if (B.consulted) return toast('相談は 1バトルに 1回まで');
  if (B.ap < 1) return toast('処方ポイントが 足りない');
  B.ap -= 1; B.consulted = true; save();
  const p = P[f.pid], sg = SG(R);
  const clue = [(f.info && f.info.ask) || f.k >= 3 ? '📍 ' + p.place + ' / ' + p.sym : vague(p)].concat((f.info && f.info.lines) || []).map(esc).join('<br>');
  // ① 病原体
  const near = [...new Set([...sg.enemies, ...sg.elites, ...sg.boss].concat(PATHO.filter(x => x.cat === p.cat).map(x => x.id)))].filter(id => id !== p.id && P[id] && !P[id].base);
  const same = near.filter(id => P[id].cat === p.cat), other = near.filter(id => P[id].cat !== p.cat);
  const wrongP = shuffle(f.k >= 1 ? same : shuffle(same).slice(0, 2).concat(other)).slice(0, 3);
  const optP = shuffle([p.id, ...wrongP]);
  SFX.play('select');
  const a1 = await modal(`<b class="big">📞 専門医: 「どの 病原体だと 思う?」</b><p class="clue">${clue}</p><p class="note">わかっている 所見から 考えよう。攻略本の 病原体の ページが ヒント。</p>`, optP.map(id => `<span class="scnb"><b>${CAT[P[id].cat].em} ${P[id].ja}</b></span>`));
  if (optP[a1] !== p.id) {
    SE.play('ng'); st('consultNg');
    await modal(`<b class="big">🙅 ちがうみたい…</b><p>所見を もう一度 見なおそう。検査を ふやすと しぼりこみやすい。</p><p class="note">(相談は この バトルでは おしまい)</p>`, ['OK']);
    return renderBattle();
  }
  f.k = 3; SFX.play('best'); renderBattle();
  // ② 効く薬
  const eff = DRUGS.filter(d => effOf(d, p) === 2 && d.cat !== 'sup');
  if (!eff.length) {
    const a = await modal(`<b class="big">⭕ 正解! ${p.ja}</b><p>専門医: 「では、どう 治療する?」</p>`, ['💊 抗菌薬で たたく', '🛌 体を ささえて めんえきで なおす', '🔪 すぐ 手術']);
    const okA = p.noDrug ? -1 : 1;
    if (a === okA) { SFX.play('best'); st('consultOk'); if (!has('ors')) gain('ors'); await modal(`<b class="big">⭕ そのとおり!</b><p>${p.ja}には 特効薬が ない。経口補水液・安静・栄養で ささえて、めんえきが たおすのを 待つ。</p>`, ['OK']); }
    else { SE.play('ng'); await modal(`<b class="big">🙅 ざんねん</b><p>${p.noDrug ? '内視鏡などで 取りのぞく 相手。' : p.ja + 'に 効く 薬は ない。体を ささえて めんえきを 待とう。'}</p>`, ['OK']); }
    return renderBattle();
  }
  const okE = eff.filter(d => !contraFor(d).length); const eff2 = okE.length ? okE : eff;
  const right = eff2.filter(d => !has(d.id) && d.id !== f.rd).sort((a, b) => isBest(b, p) - isBest(a, p))[0] || eff2.sort((a, b) => isBest(b, p) - isBest(a, p))[0];
  const dc = { bac: 'abx', vir: 'vir', fun: 'fun', par: 'par' }[p.cat]; const pool = DRUGS.filter(d => d.cat !== 'sup' && !d.endless && effOf(d, p) === 0 && !eff.includes(d)); const wrongD = shuffle(pool.filter(d => d.cat === dc)).slice(0, 2).concat(shuffle(pool.filter(d => d.cat !== dc)).slice(0, 1)); while (wrongD.length < 3) { const x = pool.find(d => !wrongD.includes(d)); if (!x) break; wrongD.push(x); }
  const optD = shuffle([right, ...wrongD]);
  const a2 = await modal(`<b class="big">⭕ 正解! ${p.ja}</b><p>専門医: 「では、どの 薬が 効く?」</p>`, optD.map(d => `<span class="scnb optd2">${drugArt(d, 36)}<b>${d.ja}</b><span class="note">${d.cls}</span></span>`));
  if (optD[a2] === right) {
    const nw = gain(right.id); save(); SFX.play('learn'); st('consultOk');
    await modal(`<b class="big">🎁 ${nw ? '薬を もらった!' : 'そのとおり!'}</b>${drugCard(right)}<p class="note">${p.ja}には ${eff.map(d => d.ja).slice(0, 4).join('・')} など。</p>`, ['やった!']);
  } else {
    SE.play('ng');
    await modal(`<b class="big">🙅 おしい!</b><p>${p.ja}に 効くのは <b>${eff.map(d => d.ja).slice(0, 4).join('・')}</b> など。</p><p class="note">攻略本の ${p.ja}の ページに のっているよ。正体は わかったので、手もちの 薬で がんばろう。</p>`, ['OK']);
  }
  renderBattle();
}
async function doTestKind(kind) {
  const f = B.foes[B.tgt], p = P[f.pid], t = TESTS.find(x => x.id === kind);
  f.info = f.info || {}; f.info[kind] = 1; st('test');
  const r = examResult(kind, p);
  const before = f.k; f.k = Math.max(f.k, r.k);
  if (f.myst) { f.tests = (f.tests || 0) + 1; if (f.tests < 2) f.k = Math.min(f.k, 2); }
  f.info.lines = (f.info.lines || []).concat(r.lines.map(l => t.em + ' ' + l));
  if (kind === 'ask' && S.run.stage === 9 && S.run.cond && S.run.cond.length && !S.run.condKnown) { S.run.condKnown = true; f.info.lines.push('🗣️ ' + S.run.cond.map(c => CD[c].em + CD[c].ja).join('・')); setTimeout(() => toast('🗣️ 問診で わかった: ' + S.run.cond.map(c => CD[c].em + ' ' + CD[c].ja).join('、'), 3200), 300); }
  if (kind === 'culture' && f.k >= 3 && S.run.stage === 9) { f.info.lines.push(f.rd ? `🧫 感受性: ${D[f.rd].ja}に 耐性(効かない)` : '🧫 感受性: 耐性なし'); if (f.rd) f.rdKnown = true; }
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
  if (!B) return;
  const R = S.run;
  B.turn++; B.ap = B.apMax; B.usedTurn = new Set(); B.busy = false;
  for (const k in B.cd) if (B.cd[k] > 0) B.cd[k]--;
  B.foes.forEach(f => f.combo = new Set());
  if (R.gut <= 0 && R.stage <= 1 && B.turn > 1) { R.hp -= 1; toast('🥛 善玉菌が へって おなかが ゆるい… ❤️-1'); if (R.hp <= 0) return lose(); }
  if (B.tgt == null || !B.foes[B.tgt] || B.foes[B.tgt].hp <= 0) B.tgt = B.foes.findIndex(f => f.hp > 0);
  if (R.stage >= 1 && !B.o.tut) dealCells();
  const alive = B.foes.filter(f => f.hp > 0);
  if (B.mode === 'care' && alive.some(f => !f.dots.length && !P[f.pid].self && !P[f.pid].noDrug)) { B.mode = 'rx'; if (B.turn > 1) toast('⌛ 薬が 切れた → 💊 処方を 見なおそう', 2600); }
  renderBattle();
  for (const f of alive) if (f.sp && !f.spShown) { f.spShown = true; B.auto = false; await cutIn(f); if (!B) return; renderBattle(); }
  if (!B) return;
  if (!B.auto) { await midEvent(); if (!B) return; if (R.hp <= 0) return lose(); renderBattle(); }
  if (B.auto) {
    const a = B.auto; a.turns++;
    const why = B.foes.filter(f => f.hp <= 0).length > a.kills ? '病原体を たおした' : R.hp < a.hp * 0.7 ? '体力が へってきた' : !B.foes.some(f => f.hp > 0 && (f.dots.length || f.self)) ? '薬が 切れた' : a.turns >= 6 ? '6ターン たった' : '';
    if (why) { B.auto = false; toast(`⏸ 様子を みるのを 止めた(${why})`, 2400); renderBattle(); }
    else setTimeout(() => { if (B && B.auto && !B.busy) endTurn(); }, 500);
  }
}
async function endTurn() {
  if (!B || B.busy) return; B.busy = true; SFX.play('turn'); renderBattle();
  const R = S.run;
  const imm = immPower();
  for (let i = 0; i < B.foes.length; i++) {
    const f = B.foes[i], p = P[f.pid]; if (f.hp <= 0) continue;
    const two = new Set(f.dots.map(x => x.id)).size >= 2;
    let med = 0; for (const x of f.dots) { med += p.combo && !two ? Math.ceil(x.per * 0.35) : x.per; x.t--; }
    if (f.mark > 0 && med) { med = Math.round(med * 1.3); f.mark--; }
    f.dots = f.dots.filter(x => x.t > 0);
    if (!med && !imm) continue;
    f.hp = Math.max(0, f.hp - med - imm);
    renderBattle(); await fx('hit', i); if (!B) return; floatTxt((med ? '💊-' + med + ' ' : '') + (imm ? '🛡️-' + imm : ''), i);
    if (f.hp <= 0) await killFoe(i);
  }
  if (B.foes.every(f => f.hp <= 0)) { renderBattle(); return win(); }
  for (let i = 0; i < B.foes.length; i++) {
    const f = B.foes[i], p = P[f.pid]; if (f.hp <= 0) continue;
    await wait(300);
    if (f.sp) {
      const s = SPECIALS[f.sp], ok = s.ok(f);
      if (ok) { banner('✨ 作戦を やぶった!', 'best'); SFX.play('best'); st('spBreak'); floatTxt(s.em + ' やぶった!', i, 'good'); }
      else if (f.sp === 'tox') { let dmg = Math.round(Math.max(1, (p.pat.find(x => x[0] === 'atk') || ['atk', 5])[1] + f.atkAdd) * 2.5); const g = Math.min(B.guard, dmg); B.guard -= g; dmg -= g; R.hp -= dmg; B.dmgTaken += dmg; SFX.play('hurt'); await fx('atk', i); floatTxt('☠️❤️-' + dmg, null, 'bad'); }
      else if (f.sp === 'grow') { const v2 = Math.round(f.max * 0.35); f.hp = Math.min(Math.round(f.max * 1.2), f.hp + v2); floatTxt('⬆️ 大増殖 +' + v2, i, 'bad'); }
      else if (f.sp === 'hide') { f.block += 12; floatTxt('🛡️ バイオフィルム +12', i, 'bad'); }
      f.sp = null; f.spShown = false;
      if (R.hp <= 0) return lose();
      await wait(300); continue;
    }
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
  if (R.stage >= 1 && !B.o.tut) B.foes.forEach(planSpecial);
  renderBattle();
  if (B.foes.every(f => f.hp <= 0)) return win();
  await wait(250); if (B) playerTurn();
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
  if (R.stage === 9 && !B.o.onWin) { const days = Math.max(1, B.turn), bonus = days <= 2 ? 12 : days <= 3 ? 6 : 0; R.days = (R.days || 0) + days; R.wins9 = (R.wins9 || 0) + 1; R.coins += bonus; if (days <= 2) st('fastOut'); save(); await modal(`<b class="big">🏥 入院 ${days}日で 退院!</b>${bonus ? `<p class="got">🏃 スピード退院 🪙+${bonus}</p>` : '<p class="note">3日いないなら ボーナス。早く 見ぬいて ばっちりの 薬を!</p>'}`, ['つぎへ']); }
  if (B.o.onWin) { SE.play('clear'); await modal(`<b class="big">🎉 治った!</b><p>患者さんが 元気に なったよ。</p>`, ['つぎへ']); return B.o.onWin(); }
  rewardScreen(B.o.node);
}
async function lose() {
  if (!B || !S.run || B.lost) return; B.lost = true;
  const R = S.run; B.busy = true; SE.play('over');
  if (B.o.tut || (R.stage === 1)) {
    const s = JSON.parse(R.snap); Object.assign(R, s); R.hp = Math.max(R.hp, Math.ceil(R.max * 0.5)); save();
    await modal(`<b class="big">😵 患者さんが ぐったり…</b><p>もう一度 この バトルから やりなおそう。</p><p class="note">${B.o.tip || '分類を 思い出して、合う薬を えらぼう。わからない時は 🔬検査!'}</p>`, ['やりなおす']);
    if (B.o.onLose) return B.o.onLose();
    return startBattle(B.o);
  }
  S.lost = S.lost || []; S.lost.push({ t: Date.now(), who: PATIENTS[SG(R).patient].short, where: SG(R).ja, foes: B.foes.filter(f => f.hp > 0).map(f => f.pid) }); save();
  if (R.stage === 9) return endlessOver();
  const fl = R.fl; S.run = null; save();
  await modal(`${angelHtml()}<b class="big">👼 患者さんは 天国へ 旅立った…</b><p>${SG(R).ja} の ${fl + 1}階で 力が およばなかった。</p><p class="note">見送った 患者さん: <b>${S.lost.length}人</b>。この 数を わすれずに、次の 患者さんを 助けよう。</p><p class="note">図鑑と おぼえた薬は のこるよ。もう一度 チャレンジ!</p>`, ['タイトルへ']);
  title();
}

// ---------- ほうしゅう
function rewardPool(R) {
  const sg = SG(R);
  const want = new Set(); [...sg.enemies, ...sg.elites, ...sg.boss].forEach(pid => DRUGS.forEach(d => { if (effOf(d, P[pid])) want.add(d.id); }));
  ['apap', 'ors', 'drip', 'loxo', 'dclf', 'pred', 'bif', 'o2', 'nutri', 'sleep', 'cool', 'humid', 'honey', 'dxm', 'carbo', 'domp', 'antih', 'okayu'].forEach(x => want.add(x));
  if (R.stage === 9) DRUGS.filter(d => d.endless).forEach(d => want.add(d.id));
  return [...want].filter(id => !has(id));
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
  const ups = shuffle(DRUGS.filter(d => has(d.id) && d.dmg && (R.lv[d.id] || 1) < 4));
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
    if (o.k === 'learn') { gain(o.id); const d = D[o.id]; SFX.play('learn'); await modal(`<b class="big">🎁 新しい薬を おぼえた!</b>${drugCard(d)}`, ['やった!']); }
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
    R.shop = { f: R.fl, list: [...ITEMS.map(i => ({ k: 'item', id: i.id, price: i.price })), rel && { k: 'relic', id: rel.id, price: rel.rare ? 110 : 70 }, { k: 'heal', price: 20 }, { k: 'gut', price: 15 }].filter(Boolean), sold: [] };
  }
  const L = R.shop;
  const name = o => o.k === 'item' ? `<span class="bigem">${IT[o.id].em}</span><b>${IT[o.id].ja}</b><span class="note">${IT[o.id].desc}</span>` : o.k === 'relic' ? `<span class="bigem">${RL(o.id).em}</span><b>${RL(o.id).ja}</b><span class="note">ずっと効く: ${RL(o.id).desc}</span>` : o.k === 'up' ? `<span data-did="${o.id}">${drugArt(D[o.id], 44)}</span><b>${D[o.id].ja}</b><span class="note">⬆️ 強くする Lv${R.lv[o.id] || 1}→${(R.lv[o.id] || 1) + 1}</span>` : o.k === 'learn' ? `<span data-did="${o.id}">${drugArt(D[o.id], 44)}</span><b>${D[o.id].ja}</b><span class="note">🎁 新しい薬・${GI[D[o.id].cat]}</span>` : o.k === 'heal' ? '<span class="bigem">💧</span><b>点滴で 休む</b><span class="note">体力 +12</span>' : '<span class="bigem">🥛</span><b>ヨーグルト</b><span class="note">善玉菌 +5</span>';
  screen(`${topBar('🏪 ショップ', null)}${statusBar(R)}<div class="shop">${L.list.map((o, i) => `<button class="btn opt stile" data-b="${i}" ${L.sold.includes(i) || R.coins < o.price ? 'disabled' : ''}>${name(o)}<em>${L.sold.includes(i) ? '売りきれ' : '🪙' + o.price}</em></button>`).join('')}<button class="btn main" id="out">店を出る</button></div>`);
  bindStatus(false);
  app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => {
    const i = +b.dataset.b, o = L.list[i]; if (R.coins < o.price) return;
    if (o.k === 'item' && R.items.length >= 3) return toast('アイテムは 3こまで');
    R.coins -= o.price; L.sold.push(i); st('buy'); SFX.play('coin');
    if (o.k === 'item') R.items.push(o.id);
    if (o.k === 'relic') R.relics.push(o.id);
    if (o.k === 'up') R.lv[o.id] = (R.lv[o.id] || 1) + 1;
    if (o.k === 'learn') gain(o.id);
    if (o.k === 'heal') R.hp = Math.min(R.max, R.hp + 12);
    if (o.k === 'gut') R.gut = Math.min(10, R.gut + 5);
    checkAch(); save(); shopScreen();
  });
  $('#out').onclick = () => { SE.play('select'); mapScreen(); };
}
// 💊 薬局: 新しい薬を 買う・薬を 強くする
function pharmScreen() {
  const R = S.run;
  if (!R.pharm || R.pharm.f !== R.fl) {
    const pool = rewardPool(R).filter(id => !D[id].endless || R.stage === 9);
    const rx = shuffle(pool.filter(id => D[id].cat !== 'sup')).slice(0, 3), sup = shuffle(pool.filter(id => D[id].cat === 'sup')).slice(0, 1);
    const ups = shuffle(DRUGS.filter(d => has(d.id) && d.dmg && (R.lv[d.id] || 1) < 4)).slice(0, 2);
    R.pharm = { f: R.fl, sold: [], list: [...rx.map(id => ({ k: 'learn', id, price: 40 + D[id].cost * 10 })), ...sup.map(id => ({ k: 'learn', id, price: 25 })), ...ups.map(d => ({ k: 'up', id: d.id, price: 40 }))] };
  }
  const L = R.pharm;
  const name = o => { const d = D[o.id]; return `<span data-did="${d.id}">${drugArt(d, 46)}</span><b>${d.ja}</b><span class="note">${o.k === 'up' ? '⬆️ 強くする Lv' + (R.lv[d.id] || 1) + '→' + ((R.lv[d.id] || 1) + 1) : '🆕 ' + d.cls}</span>`; };
  screen(`${topBar('💊 薬局', null)}${statusBar(R)}<p class="note">薬剤師さん「どんな 薬が いりますか?」 長おしで 薬の カード。</p><div class="shop">${L.list.map((o, i) => `<button class="btn opt stile" data-b="${i}" ${L.sold.includes(i) || R.coins < o.price ? 'disabled' : ''}>${name(o)}<em>${L.sold.includes(i) ? '売りきれ' : '🪙' + o.price}</em></button>`).join('')}</div><button class="btn" id="out">出る</button>`);
  bindStatus(false);
  app.querySelectorAll('[data-b]').forEach(b => b.onclick = async () => {
    const i = +b.dataset.b, o = L.list[i]; if (R.coins < o.price || L.sold.includes(i)) return;
    R.coins -= o.price; L.sold.push(i); st('buy'); SFX.play('coin');
    if (o.k === 'learn') { gain(o.id); save(); SFX.play('learn'); await modal(`<b class="big">💊 新しい薬を 手に入れた!</b>${drugCard(D[o.id])}`, ['OK']); }
    if (o.k === 'up') R.lv[o.id] = (R.lv[o.id] || 1) + 1;
    checkAch(); save(); pharmScreen();
  });
  $('#out').onclick = () => { SE.play('select'); mapScreen(); };
}
// 🛡️ めんえき隊の レベル: 体に いいことを 続けると 内部の 数字が たまる
const IMM_NEED = [0, 8, 20, 36, 56];
function immGood(n, why) {
  const R = S.run; if (!R) return;
  R.immXP = Math.max(0, (R.immXP || 0) + n); R.immLv = R.immLv || 0;
  while (R.immLv < 4 && R.immXP >= IMM_NEED[R.immLv + 1]) {
    R.immLv++; save();
    const lv = R.immLv;
    setTimeout(() => { banner(`🛡️ めんえき隊 レベルアップ! Lv${lv + 1}`, 'best'); SFX.play('clear'); toast(`体に いいことを 続けたので めんえき隊が 強くなった(${why || ''})${lv >= 2 ? '。えらべる 細胞が 4つに' : ''}`, 3000); }, 500);
  }
}
function restScreen() {
  const R = S.run; const heal = Math.round(R.max * 0.3 * (R.relics.includes('kit') ? 1.5 : 1));
  const ups = DRUGS.filter(d => has(d.id) && d.dmg && (R.lv[d.id] || 1) < 4);
  screen(`${topBar('🛏️ 休けい', null)}${statusBar(R)}<div class="reward"><p>ひと休み。どうする?</p>
    <button class="btn opt optd" id="r1"><span class="bigem">😴</span><span><b>休む</b><span class="note">体力 +${heal}</span></span></button>
    <button class="btn opt optd" id="r2" ${ups.length ? '' : 'disabled'}><span class="bigem">📖</span><span><b>勉強する</b><span class="note">薬を 1つ 強くする</span></span></button>
    <button class="btn opt optd" id="r3"><span class="bigem">🥛</span><span><b>ヨーグルトを 食べる</b><span class="note">善玉菌が 満タン・耐性メーター -2</span></span></button></div>`);
  bindStatus(false);
  $('#r1').onclick = () => { SE.play('ok'); R.hp = Math.min(R.max, R.hp + heal); immGood(3, 'よく 休んだ'); save(); mapScreen(); };
  $('#r2').onclick = () => upgradePick(() => mapScreen());
  $('#r3').onclick = () => { SE.play('ok'); R.gut = 10; R.resist = Math.max(0, R.resist - 2); immGood(2, 'おなかを 元気に'); save(); mapScreen(); };
}
function upgradePick(done) {
  const R = S.run; const ups = DRUGS.filter(d => has(d.id) && d.dmg && (R.lv[d.id] || 1) < 4);
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
  if ((c.heal > 0) || (c.gut > 0) || (c.resist < 0)) immGood(2, '体に いい えらび方'); else if ((c.imm > 0) || (c.gut < 0) || (c.hurt > 0)) immGood(-1);
  if (c.upgrade && has(c.upgrade)) R.lv[c.upgrade] = (R.lv[c.upgrade] || 1) + 1;
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
function angelHtml() {
  return '<div class="angel"><svg viewBox="0 0 100 100" width="84" height="84"><ellipse cx="50" cy="16" rx="22" ry="7" fill="none" stroke="#ffd34d" stroke-width="5"/><path d="M14 58 q-12 -22 8 -30 q8 10 14 24z M86 58 q12 -22 -8 -30 q-8 10 -14 24z" fill="#fff" stroke="#cfe0ff" stroke-width="2"/><circle cx="50" cy="48" r="20" fill="#ffe0bd"/><path d="M42 47 q3 3 6 0 M52 47 q3 3 6 0" stroke="#5a3a20" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M45 56 q5 4 10 0" stroke="#c0605a" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M34 70 q16 26 32 0z" fill="#fff" stroke="#cfe0ff" stroke-width="2"/></svg></div>';
}
function achScreen() {
  S.newAch = 0; save();
  const n = ACH.filter(a => S.ach[a.id]).length;
  screen(`${topBar(`じっせき ${n}/${ACH.length}`, title)}${(S.lost || []).length ? `<div class="lostbox">${angelHtml()}<div><b>👼 見送った 患者さん ${S.lost.length}人</b><span class="note">治療が 間に合わなかった 患者さんの 数。へらすことは できない。</span><span class="note">${S.lost.slice(-5).reverse().map(x => `${new Date(x.t).getMonth() + 1}/${new Date(x.t).getDate()} ${esc(x.where)}`).join('<br>')}</span></div></div>` : ''}<div class="achs">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? 'on' : ''}"><span>${S.ach[a.id] ? a.em : '🔒'}</span><div><b>${a.ja}</b><span class="note">${a.desc}</span></div></div>`).join('')}</div><p class="note c">じっせきで 新しい お医者さんの 見た目が 解放されるよ。</p>`);
  bindBack(title);
}

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

MANUAL.l_care = [
  { t: '🛌 ささえは 症状に 合わせる', b: `<p>病原体を やっつけるのは 薬と めんえき。そのあいだ 体を 楽にするのが <b>ささえ</b>。<b>今 出ている 症状</b>に 合わせて えらぶ。</p><div class="map4"><div>🤒 熱・😣いたみ → <b>アセトアミノフェン</b>・クーリング</div><div>💩 げり → <b>経口補水液</b>・おかゆ</div><div>🤮 はく → <b>経口補水液を 少しずつ</b>(おかゆは あとで)</div><div>🤮 はげしく はいて ぐったり → <b>点滴(輸液)</b>。おかゆは 逆効果</div><div>😮‍💨 せき → 加湿器・はちみつ(1歳未満は ダメ)・せき止め</div><div>🫳 かゆみ → 抗ヒスタミン薬</div></div><p>合うと <b>✨ぴったり</b>で 効果アップ。熱が ないのに 解熱剤など、合わないと あまり 効かない。患者さんの 横の <b>症状の しるし</b>を 見よう。</p>` },
  { t: '🛡️ めんえき隊は 体しだいで 強くなる', b: `<p>ぴったりの ささえ・よく 休む・ヨーグルトで おなかを 元気に・薬と めんえきの 協力… <b>体に いいことを 続けると</b>、めんえき隊が <b>レベルアップ</b>する。</p><p class="note">合わない 薬や 体に わるい えらび方を すると、少し 遠のく。</p>` },
];
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
  { man: 'l_care', foe: 'noro', give: ['ors', 'okayu', 'drip', 'apap', 'sleep'], tip: 'ノロウイルスは はく・げり。熱は ない。まず 🛌ささえるで 経口補水液! 解熱剤は 熱が ないので 効きにくい。' },
  { man: 'l_more', next: 'l_cult', foe: 'ecoli', give: ['mepm', 'ctrx'], tip: 'まず メロペネムで 始めて、🧫培養 で 大腸菌と わかったら セフトリアキソンに 切りかえよう(しぼりこみ)。' },
];
function lessons(step) {
  if (step >= TUT2.length) { S.tut2 = 99; save(); checkAch(); modal('<b class="big">🎓 検査けんしゅう 修了!</b><p>問診・グラム染色・迅速検査・培養を 組み合わせて、正体を しぼりこもう。ささえは 症状に 合わせて。</p>', ['OK']).then(title); return; }
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

// ---------- 重症化イベント(バトルのあと、条件しだいで 確率で おきる。その場で 対処を えらぶ)
// 対処は 実際の 臨床の 考え方に そろえている(薬の量は 書かない)。docs: SOURCES.md
const SEVERE = [
  { id: 'anaphy', ja: 'アナフィラキシー', when: o => o.betaLactam, base: 0.05,
    text: '薬を 使った あと、急に 全身に じんましん。ゼーゼーして、顔色が 悪い。血圧も 下がってきた!',
    vital: '血圧 低下 ・ 呼吸 ゼーゼー ・ 全身の じんましん',
    choices: [['アドレナリンを 太ももの外側に 筋肉注射', 1], ['かゆみ止め(抗ヒスタミン薬)を 飲ませて 様子をみる', 0], ['ねかせて しばらく 様子をみる', 0]],
    ok: 'アナフィラキシーは、まず アドレナリンの 筋肉注射が いちばん大事。足を 上げて ねかせ、酸素や 点滴も 用意する。原因の 薬は この先 使わない。',
    ng: 'アナフィラキシーでは、かゆみ止めや 様子見では 間に合わないことがある。まず アドレナリンの 筋肉注射。' },
  { id: 'sepsis', ja: '敗血症', when: o => o.bac && o.low, base: 0.25,
    text: '細菌が 血液に 入って 全身に 広がってきた。意識が ぼんやりして、呼吸が 速い。血圧も 下がってきた。',
    vital: '意識 ぼんやり ・ 呼吸が 速い ・ 血圧 低下(qSOFA 3点)',
    choices: [['血液培養を 2セット とってから、すぐに 抗菌薬と 点滴', 1], ['培養の 結果が 出るまで 抗菌薬を 待つ', 0], ['熱さましを 使って 様子をみる', 0]],
    ok: '敗血症は 時間との 勝負。血液培養を とったら、できるだけ早く(1時間を めやすに)抗菌薬と 点滴を 始める。結果が 出たら 薬を しぼる。',
    ng: '敗血症で 抗菌薬が おくれると 命に かかわる。培養を とったら、すぐ 抗菌薬と 点滴。' },
  { id: 'dehyd', ja: 'ひどい 脱水', when: o => o.gi, base: 0.2,
    text: 'げりと はくのが 止まらない。ぐったりして、半日 おしっこが 出ていない。口の中も カラカラ。',
    vital: 'ぐったり ・ おしっこが 出ない ・ 脈が 速い',
    choices: [['点滴(輸液)で 水分と 塩分を 入れる', 1], ['げり止めを 飲ませる', 0], ['ジュースを 少しずつ 飲ませる', 0]],
    ok: '軽い 脱水なら 経口補水液で よいが、ぐったりして 飲めない・おしっこが 出ない ほどなら 点滴(輸液)。感染性の げりに げり止めは ふつう 使わない(菌や 毒を 出せなくなる)。',
    ng: 'ここまで ひどい 脱水は 点滴(輸液)が 必要。感染性の げりに げり止めは ふつう 使わない。' },
  { id: 'enceph', ja: 'インフルエンザ脳症の うたがい', when: o => o.flu && o.kid, base: 0.12,
    text: '熱が 出て すぐ、子どもが「へんな ものが 見える」と 言いだし、よびかけへの 反応が にぶい。けいれんも おきた。',
    vital: '意識が おかしい ・ 異常な ことば ・ けいれん',
    choices: [['すぐに 救急車をよび、大きな 病院で 治療', 1], ['解熱剤を 追加して ねかせる', 0], ['朝まで 様子をみる', 0]],
    ok: '意識が おかしい・けいれん・おかしな言動が 続く時は、脳症の おそれ。すぐ 救急へ。インフルエンザの時は 子どもを ひとりに しないことも 大事。',
    ng: '意識の 変化や けいれんは 様子見しては いけない サイン。すぐ 救急へ。' },
  { id: 'resp', ja: '呼吸不全', when: o => o.lung && o.low, base: 0.2,
    text: '肺の 炎症が 強くなって、息が とても くるしそう。くちびるが 少し 青い。',
    vital: 'SpO2(血液中の 酸素) 88% ・ 呼吸が 速い',
    choices: [['酸素を すう(酸素投与)', 1], ['せき止めを 飲ませる', 0], ['熱さましを 使う', 0]],
    ok: '血液中の 酸素が 足りない時は、まず 酸素投与。足りなければ 人工呼吸器も 考える。',
    ng: '酸素が 足りない時に まず 必要なのは 酸素投与。せき止めや 熱さましでは 酸素は ふえない。' },
  { id: 'postflu', ja: 'インフルエンザのあとの 肺炎', when: o => o.flu && !o.kid, base: 0.15,
    text: 'インフルエンザが 治りかけたのに、また 高い熱。黄色い たんが からむ せきが 出てきた。',
    vital: '熱 再上昇 ・ 黄色い たん ・ 呼吸が 速い',
    choices: [['胸のレントゲンと たんの グラム染色を して、細菌の 肺炎の 治療', 1], ['タミフルを もう一度 飲ませる', 0], ['インフルエンザの なごりなので 様子をみる', 0]],
    ok: 'インフルエンザの あとは、肺炎球菌や 黄色ブドウ球菌などの 細菌の 肺炎が おきやすい。検査で 確かめて 抗菌薬で 治療する。',
    ng: '一度 よくなってから また 悪くなるのは、細菌の 肺炎の サイン。検査して 抗菌薬を 考える。' },
  { id: 'malaria_sev', ja: '重症マラリア', when: o => o.malaria, base: 0.3,
    text: 'マラリアの 治療中、意識が にぶくなり、白目が 黄色くなってきた。',
    vital: '意識障害 ・ 黄だん ・ 血液中の 原虫が とても多い',
    choices: [['集中治療室で、アルテスネートの 注射に 切りかえる', 1], ['今の 飲み薬を 続ける', 0], ['解熱剤で 熱を 下げる', 0]],
    ok: '重症マラリアは 注射の アルテスネートで、集中治療室で 治療する。熱帯熱マラリアは 急に 悪くなるので 要注意。',
    ng: '意識障害などが ある 重症マラリアは、注射の 薬と 集中治療が 必要。' },
];
// その バトルの ようすから、重症化しやすい 条件を あつめる
function severeCheck() {
  const R = S.run; if (!R || !R.stage || !B || B.o.tut) return null;
  const pids = B.foes.map(f => P[f.pid].base || f.pid);
  const sg = SG(R);
  const o = {
    kid: sg.patient === 'kid', bac: B.foes.some(f => P[f.pid].cat === 'bac'),
    gi: pids.some(id => ['noro', 'campy', 'cholera', 'giardia', 'typhoid', 'amoeba', 'cdiff'].includes(id)),
    flu: pids.includes('flu'), lung: pids.some(id => ['pneumo', 'myco', 'covid', 'rsv', 'pcp', 'legion', 'pseudo', 'flu'].includes(id)),
    malaria: pids.includes('malaria'), betaLactam: B.usedIds && [...B.usedIds].some(id => /ペニシリン|セフェム|カルバペネム/.test(D[id].cls)),
    low: R.hp < R.max * 0.45,
  };
  // 重症化しやすさ: 体力が 少ない・善玉菌が 少ない・生活の みだれ(めんえきダウン)・お年より・むげん病院の 幕
  let risk = (o.low ? 0.15 : 0) + (R.gut <= 3 ? 0.08 : 0) + (B.immDown > 0 ? 0.1 : 0) + (sg.patient === 'gpa' ? 0.06 : 0) + (R.stage === 9 ? Math.min(0.1, (R.act || 1) * 0.01) : 0) + R.asc * 0.02;
  const can = SEVERE.filter(s => s.when(o));
  for (const s of shuffle(can)) if (Math.random() < Math.min(0.5, s.base * (s.id === 'anaphy' ? 1 : 0.5) + (s.id === 'anaphy' ? 0 : risk))) return s;
  return null;
}
async function severeEvent() {
  const s = severeCheck(); if (!s) return;
  const R = S.run; SFX.play('siren'); st('severe');
  const ch = shuffle(s.choices);
  const i = await modal(`<b class="big">🚨 重症化! ${s.ja}</b><p>${s.text}</p><p class="vital">📟 ${s.vital}</p><p>どうする?</p>`, ch.map(c => c[0]));
  const good = ch[i] && ch[i][1];
  if (good) { R.hp = Math.max(1, R.hp - 2); R.coins += 10; st('severeOk'); SFX.play('saved'); }
  else { const pen = Math.max(6, Math.round(R.max * 0.25)); R.hp = Math.max(1, R.hp - pen); R.wrong++; SFX.play('bad'); }
  S.seenSevere = Object.assign({}, S.seenSevere, { [s.id]: 1 });
  save();
  await modal(`<b class="big">${good ? '✅ 正しい対処!' : '❌ 対処が おくれた…'}</b><p>${good ? s.ok : s.ng}</p>${good ? '<p class="note">患者さんは もちなおした(体力 -2・🪙+10)</p>' : `<p class="note">患者さんの 体力が 大きく へった</p><p class="note">正解: ${s.choices.find(c => c[1])[0]}</p>`}<p class="note">※ ゲームの中の話。本当の治療は お医者さんが 決める。</p>`, ['OK']);
}

// ---------- バトルの 背景・病原体の 作戦(カットイン)・ピンチとチャンス
// 背景: ステージや 派遣先に 合わせる
function bgTheme(R) {
  if (!R || !R.stage) return 'clinic';
  if (R.stage === 9) return { winter: 'winter', tropic: 'jungle', icu: 'hospital', er: 'er', forest: 'forest', immuno: 'clean', kenshin: 'clinic' }[R.scn] || 'hospital';
  return { 1: 'school', 2: 'jungle', 3: 'hospital' }[R.stage];
}
function bgSVG(t) {
  const W = 400, H = 300;
  const T = {
    clinic: `<rect width="${W}" height="${H}" fill="#dbe9f5"/><rect y="200" width="${W}" height="100" fill="#b9cfe0"/><rect x="40" y="40" width="90" height="70" rx="6" fill="#fff" stroke="#9fb6cc" stroke-width="4"/><path d="M85 40 v70 M40 75 h90" stroke="#9fb6cc" stroke-width="3"/><rect x="260" y="60" width="90" height="120" rx="6" fill="#f7fbff" stroke="#9fb6cc" stroke-width="3"/><path d="M290 90 h30 M305 75 v30" stroke="#ff6b6b" stroke-width="8"/>`,
    school: `<rect width="${W}" height="${H}" fill="#cfe9ff"/><rect y="210" width="${W}" height="90" fill="#c9a77a"/><rect x="30" y="30" width="200" height="110" rx="4" fill="#2f5d3a" stroke="#8a6a3a" stroke-width="8"/><text x="130" y="95" text-anchor="middle" font-size="26" fill="#fff" opacity=".7">てあらい・うがい</text><rect x="270" y="40" width="90" height="70" rx="4" fill="#fff" stroke="#9fb6cc" stroke-width="4"/><circle cx="315" cy="165" r="22" fill="#fff" stroke="#555" stroke-width="3"/><path d="M315 165 v-14 M315 165 h10" stroke="#333" stroke-width="3"/>`,
    winter: `<rect width="${W}" height="${H}" fill="#d9e6f7"/><rect y="210" width="${W}" height="90" fill="#f4f8ff"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 53) % W}" cy="${(i * 37) % 200}" r="${2 + i % 3}" fill="#fff"/>`).join('')}<path d="M40 210 l40 -60 l40 60z" fill="#7aa3c9"/><rect x="250" y="120" width="120" height="90" fill="#c9a77a"/><path d="M240 120 l70 -40 l70 40z" fill="#b34d4d"/>`,
    jungle: `<rect width="${W}" height="${H}" fill="#bfe8c0"/><circle cx="330" cy="60" r="30" fill="#ffe36e"/><rect y="220" width="${W}" height="80" fill="#9a7a4a"/>${[[40, 220], [120, 230], [300, 225], [370, 230]].map(([x, y]) => `<rect x="${x - 6}" y="${y - 110}" width="12" height="110" fill="#8a5a2a"/><path d="M${x} ${y - 110} q-40 -10 -60 20 M${x} ${y - 110} q40 -10 60 20 M${x} ${y - 110} q-20 -30 -50 -30 M${x} ${y - 110} q20 -30 50 -30" stroke="#3a9a4a" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}`,
    hospital: `<rect width="${W}" height="${H}" fill="#e3f0f6"/><rect y="210" width="${W}" height="90" fill="#c8dbe4"/><rect x="20" y="30" width="120" height="150" fill="#cfe4ef" stroke="#9fb6cc" stroke-width="3"/><path d="M80 30 v150" stroke="#9fb6cc" stroke-width="2"/><rect x="290" y="40" width="80" height="60" rx="4" fill="#1d2b36"/><path d="M296 70 l12 0 l6 -14 l8 28 l6 -14 l40 0" stroke="#4cd38a" stroke-width="3" fill="none"/><rect x="318" y="100" width="6" height="110" fill="#9fb6cc"/><rect x="300" y="110" width="40" height="50" rx="6" fill="#eaf6ff" stroke="#7fb3d6" stroke-width="2"/>`,
    er: `<rect width="${W}" height="${H}" fill="#f1e1e1"/><rect y="210" width="${W}" height="90" fill="#d6c4c4"/><rect x="30" y="40" width="340" height="40" fill="#c43a3a"/><text x="200" y="70" text-anchor="middle" font-size="24" fill="#fff" font-weight="900">救命救急センター</text><circle cx="60" cy="150" r="20" fill="#ff4d4d" opacity=".5"/><circle cx="340" cy="150" r="20" fill="#4d7dff" opacity=".5"/>`,
    forest: `<rect width="${W}" height="${H}" fill="#cfe8d8"/><rect y="215" width="${W}" height="85" fill="#7aa36a"/>${[[50, 215], [130, 215], [280, 215], [360, 215]].map(([x, y]) => `<path d="M${x} ${y} l-40 0 l40 -110 l40 110z" fill="#2f6a3a"/>`).join('')}<path d="M180 215 q20 -20 40 0" stroke="#7fc8ff" stroke-width="10" fill="none"/>`,
    clean: `<rect width="${W}" height="${H}" fill="#eef5f2"/><rect y="210" width="${W}" height="90" fill="#d4e4dd"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${20 + i * 64} 20 q16 90 0 190" stroke="#bfe0d2" stroke-width="22" fill="none" opacity=".7"/>`).join('')}`,
  };
  return `<svg class="bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${T[t] || T.clinic}<rect width="${W}" height="${H}" fill="#0e1a2b" opacity=".45"/></svg>`;
}

// ---- 病原体の 作戦(B)。ときどき 大技を 予告 → 合う手で やぶれる
const SPECIALS = {
  tox: { ja: 'どくそ 大放出', em: '☠️', desc: '次の こうげきが 2.5倍!', counter: '抗体(めんえき隊)で どくそを 消すか、ガードで ふせごう', ok: f => !f.toxin && f.spDetox },
  grow: { ja: '大増殖', em: '⬆️', desc: '体力を 大きく 回復する!', counter: '薬が 効いている間は ふえられない。処方しておこう', ok: f => f.dots.length > 0 },
  hide: { ja: 'バイオフィルム', em: '🛡️', desc: 'ねばねばの 膜で かくれて、ダメージを 大きく ふせぐ!', counter: '好中球で こわすか、強い 薬で 押しきろう', ok: f => f.spBroken },
};
const SP_FOR = { bac: ['tox', 'hide', 'grow'], vir: ['grow'], fun: ['hide', 'grow'], par: ['grow'] };
// 敵の ターンの はじめに、次の 作戦を きめる
function planSpecial(f) {
  const p = P[f.pid], R = S.run;
  if (f.hp <= 0 || p.self || p.noDrug || f.sp) return;
  const every = R.stage === 1 ? 4 : 3;
  f.spCount = (f.spCount || 0) + 1;
  if (f.spCount % every !== 0) return;
  const list = SP_FOR[p.cat] || ['grow'];
  f.sp = pick(list); f.spDetox = false; f.spBroken = false;
}
// カットイン(論破みたいに 斜めに 入りこむ)
function cutIn(f) {
  return new Promise(res => {
    const p = P[f.pid], s = SPECIALS[f.sp];
    const d = document.createElement('div'); d.className = 'cutin';
    d.innerHTML = `<div class="ci-band ci-a"></div><div class="ci-band ci-b"></div><div class="ci-art">${ART.patho(p, Math.max(f.k, 1) >= 3 ? 3 : f.k, 150)}</div><div class="ci-txt"><span class="ci-who">${f.k >= 3 ? p.ja : '???'}の 作戦!</span><b>${s.em} ${s.ja}</b><span class="ci-desc">${s.desc}</span></div>`;
    document.body.appendChild(d); SFX.play('siren');
    setTimeout(() => { d.classList.add('out'); }, 1700);
    setTimeout(() => { d.remove(); toast(`💡 たいさく: ${s.counter}`, 3600); res(); }, 2100);
  });
}

// ---- ピンチと チャンス(C)。ターンの はじめに ときどき おきる
const EVENTS_IN = [
  { id: 'wbc', good: 1, ja: '白血球が 集まってきた!', desc: 'このターン めんえき隊を もう1回 使える', fx: () => { B.cellUsed = false; B.cellExtra = 1; } },
  { id: 'cool', good: 1, ja: '熱が 少し 下がってきた', desc: '体力 +4', fx: () => { S.run.hp = Math.min(S.run.max, S.run.hp + 4); } },
  { id: 'lab', good: 1, ja: '検査室から 連絡!', desc: '次の 検査が タダ', fx: () => { B.freeTest = 1; } },
  { id: 'fever', good: 0, ja: '熱が 上がってきた!', desc: '体力 -3(解熱剤で 楽にしよう)', fx: () => { S.run.hp -= 3; } },
  { id: 'dry', good: 0, ja: '脱水ぎみ…', desc: '体力 -2・善玉菌 -1(水分を とろう)', fx: () => { S.run.hp -= 2; S.run.gut = Math.max(0, S.run.gut - 1); } },
];
async function midEvent() {
  const R = S.run; if (!B || !R || !R.stage || B.o.tut || B.turn < 2) return;
  // 重症化は バトル中にも おきることがある(体力が 少ない時)
  if (R.hp < R.max * 0.35 && Math.random() < 0.18 && !B.severeDone) { B.severeDone = true; await severeEvent(); renderBattle(); return; }
  if (Math.random() > 0.22) return;
  const e = pick(EVENTS_IN); e.fx();
  SFX.play(e.good ? 'learn' : 'hurt'); banner(`${e.good ? '✨ チャンス' : '⚠️ ピンチ'}: ${e.ja}`, e.good ? 'best' : 'pinch');
  toast(`${e.good ? '✨' : '⚠️'} ${e.ja} ${e.desc}`, 3200);
}

// ---------- タイトルの 背景: 病原体が ふわふわ浮いて、薬が 降ってきて ぶつかると ポンッと 消える
function titleBG() {
  const root = document.querySelector('.titleScr'); if (!root) return;
  const box = document.createElement('div'); box.className = 'tbg'; root.prepend(box);
  const W = () => box.clientWidth || 360, H = () => box.clientHeight || 640;
  const foes = [], drops = [];
  const pool = PATHO.filter(p => !p.base), meds = DRUGS.filter(d => d.cat !== 'sup');
  const spawnFoe = () => { const p = pick(pool), s = 46 + rnd(26), e = document.createElement('div'); e.className = 'tf'; e.innerHTML = ART.patho(p, 3, s); box.appendChild(e); foes.push({ e, s, x: rnd(W() - s), y: 60 + rnd(H() - 160), vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .4, ph: Math.random() * 6 }); };
  const spawnDrop = () => { const d = pick(meds), s = 40, e = document.createElement('div'); e.className = 'td'; e.innerHTML = ART.hero(d, s); box.appendChild(e); drops.push({ e, s, x: rnd(W() - s), y: -s, vy: 1.2 + Math.random() * 1.3, r: (Math.random() - .5) * 2, a: 0 }); };
  for (let i = 0; i < 6; i++) spawnFoe();
  let t = 0, last = 0;
  const step = ts => {
    if (!document.body.contains(box)) return;
    if (ts - last > 1300) { last = ts; if (drops.length < 4) spawnDrop(); }
    t += 1;
    for (const f of foes) { if (f.pop) continue; f.ph += .03; f.x += f.vx; f.y += f.vy + Math.sin(f.ph) * .3; if (f.x < 0 || f.x > W() - f.s) f.vx *= -1; if (f.y < 40 || f.y > H() - f.s - 20) f.vy *= -1; f.e.style.transform = `translate(${f.x}px,${f.y}px) rotate(${Math.sin(f.ph) * 8}deg)`; }
    for (const d of drops) {
      if (d.dead) continue; d.y += d.vy; d.a += d.r; d.e.style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.a}deg)`;
      if (d.y > H()) { d.dead = 1; d.e.remove(); continue; }
      for (const f of foes) {
        if (f.pop) continue;
        const dx = (f.x + f.s / 2) - (d.x + d.s / 2), dy = (f.y + f.s / 2) - (d.y + d.s / 2);
        if (dx * dx + dy * dy < ((f.s + d.s) / 2.4) ** 2) {
          f.pop = 1; f.e.classList.add('pop'); d.dead = 1; d.e.classList.add('pop');
          const bx = document.createElement('div'); bx.className = 'tboom'; bx.style.transform = `translate(${f.x + f.s / 2 - 20}px,${f.y + f.s / 2 - 20}px)`; bx.textContent = '💥'; box.appendChild(bx);
          setTimeout(() => { bx.remove(); f.e.remove(); d.e.remove(); foes.splice(foes.indexOf(f), 1); if (document.body.contains(box)) spawnFoe(); }, 650);
          break;
        }
      }
    }
    for (let i = drops.length - 1; i >= 0; i--) if (drops[i].dead && !drops[i].e.isConnected) drops.splice(i, 1);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- 攻略本(ゲームの中で 読める。最初から ぜんぶ のっている。ページを めくる・目次・検索)
const COLUMNS = [
  { t: 'お医者さんの 考え方(臨床推論)', b: '病気の 原因を さがす時は、①どこの 感染か(のど・肺・おしっこ…)、②どんな 人か(子ども・お年より・旅行帰り・入院中)、③そこで よくある 原因は 何か、を 順に 考える。そして ④いちばん 合う 薬(第一選択)で 治療を 始め、⑤検査で 確かめて しぼりこむ。ゲームの 問診・検査・薬えらびは、この 流れに なっている。' },
  { t: 'グラム染色の 読み方', b: '細菌を 色で 2つに 分ける 検査。<b style="color:#6a3fb5">紫(陽性)</b>は 細胞壁が 厚い菌、<b style="color:#e05a7a">赤(陰性)</b>は 外側に うすい膜が ある菌。形も 大事で、紫の ブドウの房なら ブドウ球菌、紫の くさりなら レンサ球菌、紫の 2つ組なら 肺炎球菌、赤い 棒なら 大腸菌などの 腸内細菌。数分で わかるので、治療の 最初の 手がかりになる。' },
  { t: 'かぜに 抗菌薬が 効かない わけ', b: 'かぜの ほとんどは ウイルスが 原因。抗菌薬は 細菌の 細胞壁や タンパク質工場を こわす薬なので、それを もたない ウイルスには 効かない。効かないのに 飲むと、善玉菌が へったり 耐性菌が 生まれたり する。だから「かぜに 抗菌薬は いらない」が 基本。' },
  { t: '薬剤耐性(AMR)と 適正使用', b: '抗菌薬を 使うほど、生き残った 菌が 耐性を もちやすくなる。世界中で 耐性菌が ふえていて、大きな 問題に なっている。必要な時に、必要な 薬を、必要な 期間だけ 使うのが「適正使用」。ゲームの 耐性メーターは、この 考え方を 表している。' },
  { t: 'しぼりこみ(デエスカレーション)', b: '重い 感染症では、原因が わかる前に 広く効く 薬で 治療を 始めることがある。でも 培養で 正体と 効く薬が わかったら、ねらいの せまい 薬に 切りかえる。善玉菌を 守り、耐性菌を ふやさないためだ。' },
  { t: '善玉菌と ディフィシル菌(CD)', b: 'おなかには たくさんの 細菌が すんでいて、悪い菌が ふえるのを ふせいでいる。抗菌薬で それが へると、ディフィシル菌が ふえて どくそを 出し、げりを おこすことがある。抗菌薬の あとの げりには 注意。' },
  { t: 'インフルエンザと 解熱剤', b: 'インフルエンザや 水ぼうそうの 熱には、アセトアミノフェンが すすめられる。ジクロフェナクや メフェナム酸などは、子どもの インフルエンザ脳症を 重くする おそれが あり、使わないことに なっている。アスピリンも、子どもでは ライ症候群に 注意が 必要。' },
  { t: '敗血症は 時間との 勝負', b: '細菌などが 血液に 入って 全身に 広がり、体の はたらきが こわれていく 状態。意識が ぼんやりする・呼吸が 速い・血圧が 下がる、は 危ない サイン。血液培養を とったら、できるだけ 早く 抗菌薬と 点滴を 始める。' },
  { t: 'アナフィラキシーと アドレナリン', b: '薬や 食べ物で おきる、全身の 強い アレルギー。じんましん・ゼーゼー・血圧低下が 急に おきる。まず アドレナリンの 筋肉注射(太ももの外側)。エピペンは、本人や 家族が その場で 打てるように 作られた 注射。' },
  { t: '脱水と 経口補水液', b: 'げりや はくことで、水分と 塩分が 失われる。軽い 脱水なら 経口補水液を 少しずつ 何回も。ぐったりして 飲めない・おしっこが 出ない ほどなら 点滴。感染性の げりに げり止めは ふつう 使わない。' },
  { t: '「併用」が 必要な 相手', b: '結核は、1種類の 薬だけだと すぐに 耐性が できるので、4種類の 薬で 始めて 長く 続ける。ピロリ菌は、胃酸を おさえる薬と 2種類の 抗菌薬を いっしょに 使う。クリプトコックスも 2つの 薬を 組み合わせる。' },
  { t: '迅速検査の「陽性」「陰性」', b: '迅速検査は 15分ほどで 結果が 出る 便利な 検査。でも 陰性でも 100% ちがうとは 言えない(発症してすぐ・ウイルスが 少ない時)。だから 問診や 症状と 合わせて 考える。' },
  { t: 'ワクチンと 手洗い', b: 'いちばん よい 治療は、かからないこと。インフルエンザ・肺炎球菌・麻しん・百日咳・B型肝炎などは ワクチンで 予防できる。石けんで 30秒の 手洗いも 多くの 感染症を ふせぐ。' },
];
const BOOK = (() => {
  let pages = null, idx = 0, el = null, hist = [];
  let actx = null;
  function flip() {
    if (SE.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, len = 0.28, buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) { const x = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 2) * (x < 0.08 ? x / 0.08 : 1); }
      const src = actx.createBufferSource(); src.buffer = buf;
      const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8; bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3500, t + len);
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(bp); bp.connect(g); g.connect(actx.destination); src.start(t); src.stop(t + len);
    } catch (e) { /* 音が出せなくても読める */ }
  }
  const kana = s => String(s || '').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const gi = d => GI[d.cat] || '';
  const where = p => { const st = STAGES.filter(s => [...s.enemies, ...s.elites, ...s.boss].includes(p.id)).map(s => s.ja.split(' ')[0]); const sc = SCN.filter(s => [...s.pool, ...s.elites, ...s.boss].includes(p.id)).map(s => s.em + s.ja); return [...st, ...sc].join('・') || (p.base ? 'ステージ1 ボス' : 'イベントなど'); };
  function build() {
    pages = [];
    const add = (ch, title, html, keys = '') => pages.push({ ch, title, html, key: kana(title + ' ' + keys) });
    add('はじめに', '攻略本へ ようこそ', `<div class="row c">${ART.patho(P.flu, 3, 70)}${ART.doctor(S.look, 60)}${ART.patho(P.strep, 3, 70)}</div><p>この本には、ゲームに 出てくる <b>病原体・薬・検査・レリック・イベント・重症化</b>が ぜんぶ のっている。</p><p>右下の →で ページを めくる。薬や 病原体の 絵を <b>タップ</b>すると その ページへ、<b>長おし</b>すると 小窓で 見られる。<b>目次</b>から とんだり、<b>🔍</b>で さがしたり できる(「抗菌薬」「グラム陰性」「肺」なども さがせる)。</p><p class="note">※ ゲームの中の話。本当の治療は お医者さんが 決める。</p>`, 'はじめに');
    COLUMNS.slice(0, 1).forEach(c => add('コラム', '📝 ' + c.t, `<p>${c.b}</p>`, 'コラム ' + c.b));
    // 病原体
    for (const c of ['bac', 'vir', 'fun', 'par']) {
      const list = PATHO.filter(p => p.cat === c && !p.base);
      add('病原体', `${CAT[c].em} ${CAT[c].ja}(${list.length})`, `<p>${CAT[c].desc}</p><div class="bgrid">${list.map(p => `<button class="bjump" data-k="${esc(p.ja)}">${ART.patho(p, 3, 44)}<span>${p.ja}</span></button>`).join('')}</div>`, CAT[c].ja + ' ' + list.map(p => p.ja).join(' '));
      for (const p of list) {
        const C = CLINIC[p.id] || {}, best = (C.best || []).map(id => D[id]);
        const good = DRUGS.filter(d => effOf(d, p) === 2 && !(C.best || []).includes(d.id));
        const so = DRUGS.filter(d => effOf(d, p) === 1);
        const dl = ds => ds.map(d => `<span class="bdrug" data-k="${esc(d.ja)}" data-did="${d.id}">${drugArt(d, 30)}${d.ja}</span>`).join('');
        add('病原体', p.ja, `${pathoCard(p, { all: true, big: true })}<p>✨ <b>第一選択(ばっちり)</b>: ${best.length ? dl(best) : p.noDrug ? '薬は なし → 内視鏡で 取り出す' : p.self ? '特効薬は なし → 体を ささえる' : '—'}</p>${good.length ? `<p>💊 そのほか 効く薬: ${dl(good)}</p>` : ''}${so.length ? `<p>△ 効きにくいことがある: ${dl(so)}</p>` : ''}<p class="note">出てくる所: ${where(p)}</p>`,
          [p.full, CAT[p.cat].ja, p.gram ? GRAM[p.gram] : '', p.place, p.sym, C.hist, best.map(d => d.ja + ' 第一選択').join(' '), good.map(d => d.ja).join(' '), p.resist ? '耐性菌' : '', p.combo ? '併用' : '', p.self ? '特効薬なし' : '', C.rapid ? '迅速検査' : ''].join(' '));
      }
    }
    // 薬
    for (const c of ['abx', 'vir', 'fun', 'par', 'sup']) {
      const list = DRUGS.filter(d => d.cat === c);
      add('薬', `${gi({ cat: c })}(${list.length})`, `<div class="blist">${list.map(d => `<button class="bjump" data-k="${esc(d.ja)}">${d.ja}${d.brand ? `<span class="note">${d.brand}</span>` : ''}</button>`).join('')}</div>`, DCAT[c] + ' ' + list.map(d => d.ja).join(' '));
      for (const d of list) {
        const bestFor = PATHO.filter(p => !p.base && CLINIC[p.id] && (CLINIC[p.id].best || []).includes(d.id));
        const okFor = PATHO.filter(p => !p.base && effOf(d, p) === 2 && !bestFor.includes(p));
        const soFor = PATHO.filter(p => !p.base && effOf(d, p) === 1);
        const pl = ps => ps.map(p => `<span class="bdrug" data-k="${esc(p.ja)}" data-pid="${p.id}">${ART.patho(p, 3, 30)}${p.ja}</span>`).join('');
        add('薬', d.ja, `${drugCard(d, 1, { all: true, big: true })}<p class="stats">💊処方ポイント ${d.cost}${d.dmg ? ` ・ ⚔️${d.dmg}(3ターン 効く)` : ''}${d.heal ? ` ・ ❤️+${d.heal}` : ''}${d.guard ? ` ・ 🛡️+${d.guard}` : ''}${d.gutUp ? ` ・ 🥛+${d.gutUp}` : ''}${d.immUp ? ` ・ めんえき+${d.immUp}` : ''}${d.immDown ? ` ・ めんえき-${d.immDown}` : ''}${d.cd ? ` ・ ⏳休み${d.cd}` : ''}${d.gut ? ` ・ 🥛-${d.gut}` : ''}${d.rsk ? ` ・ ⚠️耐性+${d.rsk}` : ''}${d.hurt ? ` ・ 副作用❤️-${d.hurt}` : ''}</p>
          ${bestFor.length ? `<p>✨ 第一選択に なる 相手: ${pl(bestFor)}</p>` : ''}${okFor.length ? `<p>💊 効く 相手: ${pl(okFor)}</p>` : ''}${soFor.length ? `<p>△ 効きにくいことがある: ${pl(soFor)}</p>` : ''}${d.nsaid ? '<p class="warn">⚠️ インフルエンザ・水ぼうそうの時は さける(とくに 子ども)</p>' : ''}`,
          [DCAT[d.cat], d.brand, d.sub, d.cls, d.desc, bestFor.map(p => p.ja).join(' '), okFor.map(p => p.ja).join(' '), d.endless ? 'むげん病院' : ''].join(' '));
      }
    }
    // 検査
    add('検査', '🔬 検査の しかた', `${TESTS.map(t => `<p><b>${t.em} ${t.ja}</b>(処方ポイント${t.cost})<br>${t.desc}</p>`).join('')}<div class="row c">${gramSVG({ gram: '+', shape: 'grape' }, 60)}${gramSVG({ gram: '+', shape: 'chain' }, 60)}${gramSVG({ gram: '-', shape: 'rod' }, 60)}</div><p class="note">💡ヒント(アイテム)でも 名前が わかる。検査で 確かめずに 問診から 見立てて 治療しても よい。</p>`, '検査 問診 グラム染色 迅速検査 培養 PCR ヒント');
    // コラム
    COLUMNS.slice(1).forEach(c => add('コラム', '📝 ' + c.t, `<p>${c.b}</p>`, 'コラム ' + c.b));
    // 重症化
    add('重症化', '🚨 重症化イベント', `<p>体力が 少ない・善玉菌が 少ない・夜ふかしなどで めんえきが 下がっている時は、バトルの あとに 重症化することがある。正しく 対処しよう。</p>${SEVERE.map(s => `<p><b>${s.ja}</b><br><span class="note">${s.vital}</span><br>→ ${s.choices.find(c => c[1])[0]}</p>`).join('')}`, '重症化 ' + SEVERE.map(s => s.ja + ' ' + s.ok).join(' '));
    // レリック・アイテム・イベント・派遣先
    add('道具', '🧰 レリック(ずっと 効く)', RELICS.map(r => `<p>${r.em} <b>${r.ja}</b><br><span class="note">${r.desc}</span></p>`).join(''), 'レリック ' + RELICS.map(r => r.ja + r.desc).join(' '));
    add('道具', '🎒 アイテム(使うと なくなる)', ITEMS.map(r => `<p>${r.em} <b>${r.ja}</b> 🪙${r.price}<br><span class="note">${r.desc}</span></p>`).join(''), 'アイテム ' + ITEMS.map(r => r.ja + r.desc).join(' '));
    add('道具', '❓ イベント', EVENTS.map(e => `<p><b>${e.ja}</b><br><span class="note">${e.text}</span><br>${e.choices.map(c => '・' + c[0]).join('<br>')}</p>`).join(''), 'イベント ' + EVENTS.map(e => e.ja + e.text).join(' '));
    add('むげん病院', '♾️ むげん病院の 派遣先', SCN.map(s => `<p>${s.em} <b>${s.ja}</b>${s.need ? `(${s.need}幕で 解放)` : ''}<br><span class="note">${s.desc}</span><br>ボス: ${s.boss.map(b => P[b].ja).join('・')}</p>`).join('') + '<p class="note">🧭分かれ道で、流行・ボス・夜勤などを えらぶと、その幕の 敵や ボスが かわる。</p>', 'むげん病院 派遣先 分かれ道 ' + SCN.map(s => s.ja).join(' '));
    pages.forEach((p, i) => p.n = i + 1);
  }
  const chapters = () => { const m = []; pages.forEach((p, i) => { const last = m[m.length - 1]; if (!last || last.ch !== p.ch) m.push({ ch: p.ch, i, items: [] }); m[m.length - 1].items.push({ t: p.title, i }); }); return m; };
  function frame(inner) {
    if (!el) { el = document.createElement('div'); el.id = 'book'; document.body.appendChild(el); }
    el.innerHTML = `<div class="bk"><div class="bktop"><button class="btn sm" id="bkb" ${hist.length ? '' : 'disabled'}>↩ もどる</button><button class="btn sm" id="bkt">📑 目次</button><input class="txt" id="bkq" placeholder="🔍 さがす(例: 抗菌薬・肺・グラム陰性)"></div>${inner}</div>`;
    el.querySelector('.bk').insertAdjacentHTML('afterbegin', '<button class="mx bkmx" id="bkx" aria-label="とじる">✕</button>');
    el.onclick = e => { if (e.target === el) { SE.play('select'); el.remove(); el = null; } };
    el.querySelector('#bkx').onclick = () => { SE.play('select'); el.remove(); el = null; };
    el.querySelector('#bkt').onclick = () => { SE.play('select'); jumpFrom(); toc(); };
    el.querySelector('#bkb').onclick = () => { if (!hist.length) return; const h = hist.pop(); if (h === 'toc') return toc(); if (h && h.q) { inList = true; return search(h.q); } flip(); show(h, 'r'); };
    const q = el.querySelector('#bkq'); q.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) search(q.value); }; q.onchange = () => search(q.value);
  }
  let inList = false; // 目次・検索の画面にいる時
  function jumpFrom() { hist.push(inList ? 'toc' : idx); if (hist.length > 50) hist.shift(); }
  function show(i, dir) {
    inList = false;
    idx = clamp(i, 0, pages.length - 1); const p = pages[idx];
    frame(`<div class="bpage ${dir ? 'turn' + dir : ''}"><span class="bch">${p.ch}</span><h3>${p.title}</h3>${p.html}</div><div class="bnav"><button class="btn" id="bkp" ${idx ? '' : 'disabled'}>←</button><span>${idx + 1} / ${pages.length}</span><button class="btn main" id="bkn" ${idx < pages.length - 1 ? '' : 'disabled'}>→</button></div>`);
    el.querySelector('#bkp').onclick = () => { flip(); show(idx - 1, 'r'); };
    el.querySelector('#bkn').onclick = () => { flip(); show(idx + 1, 'l'); };
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; const j = pages.findIndex(x => x.title === k); if (j >= 0) { jumpFrom(); flip(); show(j, 'l'); } });
    const pg = el.querySelector('.bpage'); let x0 = null;
    pg.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    pg.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) { if (dx < 0 && idx < pages.length - 1) { flip(); show(idx + 1, 'l'); } else if (dx > 0 && idx) { flip(); show(idx - 1, 'r'); } } });
  }
  function toc() {
    inList = true;
    frame(`<div class="bpage"><h3>📑 目次</h3>${chapters().map(c => `<details ${c.ch === pages[idx].ch ? 'open' : ''}><summary><b>${c.ch}</b> <span class="note">p.${c.i + 1}〜</span></summary><div class="blist">${c.items.map(it => `<button class="bjump" data-i="${it.i}">${it.t}<span class="note">p.${it.i + 1}</span></button>`).join('')}</div></details>`).join('')}</div>`);
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { hist.push('toc'); flip(); show(+b.dataset.i, 'l'); });
  }
  function search(q) {
    if (!inList) jumpFrom();
    inList = true;
    const k = kana(q).trim(); if (!k) return;
    const words = k.split(/\s+/);
    const hit = pages.filter(p => words.every(w => p.key.includes(w)));
    frame(`<div class="bpage"><h3>🔍「${esc(q)}」 ${hit.length}件</h3><div class="blist">${hit.map(p => `<button class="bjump" data-i="${p.n - 1}">${p.title}<span class="note">${p.ch} ・ p.${p.n}</span></button>`).join('') || '<p class="note">見つからなかった</p>'}</div></div>`);
    el.querySelector('#bkq').value = q;
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const q2 = q; hist.push({ q: q2 }); flip(); show(+b.dataset.i, 'l'); });
  }
  return { open(key, fromHome) { if (!pages) build(); SE.play('select'); const j = key ? pages.findIndex(p => p.title === key) : -1; if (fromHome) hist = j >= 0 ? [0] : []; flip(); show(j >= 0 ? j : fromHome ? 0 : idx); } };
})();

// ---------- ふりがなが 漢字より 長い時、漢字の間を 広げて となりと 重ならないようにする
(() => {
  const fix = root => {
    if (!document.documentElement.classList.contains('furi')) return;
    (root.querySelectorAll ? root : document).querySelectorAll('.rb:not([data-fx])').forEach(e => {
      e.setAttribute('data-fx', '1');
      const rt = e.getAttribute('data-rt') || ''; const base = e.textContent.length; if (!rt || !base) return;
      const fs = parseFloat(getComputedStyle(e).fontSize) || 14;
      const rtW = rt.length * Math.max(fs * 0.5, 7.5) * 0.9, w = e.getBoundingClientRect().width;
      if (rtW > w * 1.12 + 2) { const add = (rtW - w) / base; e.style.setProperty('letter-spacing', add.toFixed(1) + 'px', 'important'); e.style.setProperty('padding-right', '0', 'important'); }
    });
  };
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) fix(n); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.furi-toggle')) setTimeout(() => { document.querySelectorAll('.rb[data-fx]').forEach(x => { x.removeAttribute('data-fx'); x.style.removeProperty('letter-spacing'); }); fix(document); }, 50); });
  setTimeout(() => fix(document), 300);
})();

// ---------- 記録のクラウド保存(ひなはるコレクト・げんそラボと同じ方式: 自分で決めた「ID」で もどせる。パスワードなし)
// 場所は Firebase Realtime Database の byougenSaves/<ID>
const FB = { key: 'AIzaSyBtHJIu3qhfg0g7gfG64euPs97xSBmLAq8', db: 'https://digimoncard-ia1c84-default-rtdb.firebaseio.com' };
let fbTok = null, fbExp = 0;
async function fbAuth() {
  if (fbTok && Date.now() < fbExp) return fbTok;
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FB.key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' });
  const j = await r.json(); if (!j.idToken) throw new Error('auth');
  fbTok = j.idToken; fbExp = Date.now() + 50 * 60 * 1000; return fbTok;
}
const CLOUD = (() => {
  const normId = v => String(v || '').normalize('NFKC').trim().toLowerCase();
  const idOk = id => /^[a-z0-9ぁ-んァ-ヶー_-]{2,12}$/.test(id);
  const u = async id => `${FB.db}/byougenSaves/${encodeURIComponent(id)}.json?auth=${await fbAuth()}`;
  let DEV = null, timer = null, last = 0;
  try { DEV = localStorage.getItem('byougen-dev'); if (!DEV) { DEV = Math.random().toString(36).slice(2, 12); localStorage.setItem('byougen-dev', DEV); } } catch (e) { DEV = 'x' + Math.random().toString(36).slice(2, 12); }
  const keep = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 同上 */ } };
  const api = { normId, idOk };
  api.head = async id => { const r = await fetch(await u(id)); if (!r.ok) throw new Error('net'); const d = await r.json(); return d && d.data ? { at: d.at, dev: d.dev || null } : null; };
  api.load = async id => { const r = await fetch(await u(id)); if (!r.ok) throw new Error('net'); const d = await r.json(); return d && d.data ? JSON.parse(d.data) : null; };
  api.save = async force => {
    if (!S.id) return false;
    try {
      if (!force && S.cloudAt) {
        const h = await api.head(S.id);
        if (!h || (h.dev !== DEV && h.at > S.cloudAt)) { const old = S.id; S.id = null; S.cloudAt = 0; keep(); toast(`ID「${old}」は ほかのスマホで つかわれたので、このスマホの 自動保存を とめたよ`, 4000); return false; }
      }
      const at = Date.now();
      const r = await fetch(await u(S.id), { method: 'PUT', body: JSON.stringify({ data: JSON.stringify(S), at, dev: DEV }) });
      if (!r.ok) return false;
      S.cloudAt = at; last = at; keep(); return true;
    } catch (e) { return false; }
  };
  api.queue = () => { if (!S.id || timer) return; timer = setTimeout(() => { timer = null; api.save(); }, Math.max(4000, 20000 - (Date.now() - last))); };
  api.adopt = (data, id) => { S = Object.assign(JSON.parse(JSON.stringify(S_DEF)), data, { id, cloudAt: 0 }); keep(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.id) api.save(); });
  return api;
})();
const sumOf = d => `図鑑 ${Object.keys(d.seen || {}).filter(k => P[k] && !P[k].base).length} ・ 薬 ${Object.keys(d.learned || {}).length} ・ 勝ち ${(d.stat && d.stat.win) | 0} ・ クリア ${Object.keys(d.clear || {}).length}`;
function keepScreen(note) {
  screen(`${topBar('きろくの ほぞん', title)}
    <div class="prog c">${S.id
      ? `<b>☁️ ID「<span data-nofuri>${esc(S.id)}</span>」で ほぞん中</b>
        <span class="note">記録は、あそぶたびに 自動で ネットにも ほぞんされる。<br>アプリのデータが消えても、スマホをかえても、この ID でログインすれば もどせる。</span>
        <span class="note">${S.cloudAt ? 'さいごの ほぞん: ' + new Date(S.cloudAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'まだ ネットに ほぞんできていない'}</span>
        <button class="btn main" id="now">☁️ いま ほぞんする</button>`
      : `<b>まだ この端末の中だけに ほぞんされている</b>
        <span class="note">ID を きめると、ネットにも ほぞんされる。アプリのデータが消えても、スマホをかえても もどせるよ。</span>`}</div>
    <div class="prog"><b>${S.id ? 'べつの ID で ほぞんする' : 'ID を きめて ほぞんする'}</b>
      <input class="txt" id="nid" maxlength="12" placeholder="すきな ID(2〜12文字)" autocomplete="off" autocapitalize="off">
      <span class="note">ひらがな・カタカナ・英数字。パスワードは いらない。ほかの人と 同じ ID は つかえない。</span>
      <button class="btn ${S.id ? '' : 'main'}" id="mkid">この ID で ほぞんする</button></div>
    <div class="prog"><b>ID で ログイン(記録を よみこむ)</b>
      <input class="txt" id="lid" maxlength="12" placeholder="まえに きめた ID" autocomplete="off" autocapitalize="off">
      <button class="btn" id="login">ログイン</button>
      <span class="note">ログインすると、この端末の 今の記録は その ID の記録に 入れかわる。</span></div>
    <p class="note c" id="kmsg" style="color:var(--accent)">${note || ''}</p>`);
  bindBack(title);
  const msg = t => { $('#kmsg').textContent = t; SE.play('ng'); };
  const now = $('#now'); if (now) now.onclick = async () => { now.disabled = true; const ok = await CLOUD.save(); keepScreen(ok ? '☁️ ほぞんした!' : S.id ? 'ほぞんできなかった(インターネットを たしかめてね)' : ''); };
  $('#mkid').onclick = async () => {
    const id = CLOUD.normId($('#nid').value);
    if (!CLOUD.idOk(id)) return msg('ID は 2〜12文字。ひらがな・カタカナ・英数字で きめてね');
    if (id === S.id) return msg('いま つかっている ID だよ');
    let used; try { used = await CLOUD.load(id); } catch (e) { return msg('インターネットに つながらない'); }
    if (used) {
      if (!await ask(`<b>ID「${esc(id)}」は もう つかわれている</b><p>${sumOf(used)}</p><p class="note">自分の ID なら「ログイン」の方を つかってね。<br>この記録を 消して、今の記録で 上書きする?</p>`, '上書きする')) return;
      if (!await ask(`<b>ほんとうに 上書きする?</b><p class="note">ID「${esc(id)}」に入っていた記録(${sumOf(used)})は 消えて、もどせない。</p>`, '消して 上書きする')) return;
    }
    const before = S.id, bAt = S.cloudAt; S.id = id; S.cloudAt = 0;
    if (!await CLOUD.save(true)) { S.id = before; S.cloudAt = bAt; return msg('ほぞんできなかった。もういちど ためしてね'); }
    SE.play('perfect'); keepScreen(`☁️ ID「${id}」で ほぞんした!`);
  };
  $('#login').onclick = async () => {
    const id = CLOUD.normId($('#lid').value);
    if (!CLOUD.idOk(id)) return msg('ID は 2〜12文字。ひらがな・カタカナ・英数字だよ');
    if (id === S.id) return msg('いま つかっている ID だよ');
    let d; try { d = await CLOUD.load(id); } catch (e) { return msg('インターネットに つながらない'); }
    if (!d) return msg(`ID「${id}」の記録は 見つからなかった`);
    if (!await ask(`<b>ID「${esc(id)}」で ログインする?</b><p>${sumOf(d)}</p><p class="note">この端末の 今の記録(${sumOf(S)})は 入れかわるよ。</p>`, 'ログインする')) return;
    CLOUD.adopt(d, id); await CLOUD.save(true); SE.play('perfect'); keepScreen('ログインした!');
  };
}

// ---------- 最新に こうしん(ひなはるコレクトと同じ しくみ)
const UPD_BAK = 'byougen-update-backup', UPD_FLAG = 'byougen-relogin';
async function appUpdate() {
  if (!await ask('<b>ゲームを 最新に こうしんする?</b><p class="note">記録は そのまま のこるよ</p>', '🔄 こうしんする')) return;
  const d = document.createElement('div'); d.className = 'ov'; d.innerHTML = '<div class="box"><b>🔄 こうしん中…</b><p class="note" id="upMsg"></p></div>'; document.body.appendChild(d);
  const msg = t => { const e = d.querySelector('#upMsg'); if (e) e.textContent = t; };
  const fail = t => { d.remove(); SE.play('ng'); modal(`<b>こうしん できなかった</b><p>${t}</p><p class="note">記録は そのままだよ。あとで もう一度 ためしてね</p>`, ['OK']); };
  msg('① この スマホに 保存して たしかめています');
  save();
  const snap = JSON.stringify(S);
  let local = null; try { local = localStorage.getItem(SAVE_KEY); } catch (e) { /* 下で止める */ }
  if (local !== snap) return fail('この スマホに 保存できなかった');
  msg('② 控えを 作っています');
  let bak = false;
  try { localStorage.setItem(UPD_BAK, snap); bak = localStorage.getItem(UPD_BAK) === snap; } catch (e) { bak = false; }
  msg('③ インターネットを たしかめています');
  try { const r = await fetch('index.html?u=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw 0; } catch (e) { return fail('インターネットに つながっていない'); }
  let cloud = false;
  if (S.id) {
    msg(`④ ID「${S.id}」に 保存して たしかめています`);
    if (!await CLOUD.save(true) || !S.id) return fail('ID に 保存できなかった(ほかの スマホで つかわれているかも)');
    try { const c = await CLOUD.load(S.id); cloud = !!c && (c.t || 0) === (S.t || 0); } catch (e) { cloud = false; }
    if (!cloud) return fail('ID の 記録を たしかめられなかった');
  }
  if (!bak && !cloud) return fail('控えが 作れなかった(スマホの 空きが 少ないかも)。ID を きめてから ためしてね');
  msg('⑤ 最新の ゲームを 読みこみます');
  try { localStorage.setItem(UPD_FLAG, JSON.stringify({ id: S.id || '', t: S.t || 0 })); } catch (e) { /* なくても記録はのこる */ }
  try { if (window.caches) for (const k of await caches.keys()) await caches.delete(k); } catch (e) { /* 消せなくても読みなおす */ }
  try { if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) { /* 同じ */ }
  location.replace(location.pathname + '?u=' + Date.now());
}
function updateAfter() {
  let f = null; try { f = JSON.parse(localStorage.getItem(UPD_FLAG) || 'null'); } catch (e) { f = null; }
  if (!f) return;
  try { localStorage.removeItem(UPD_FLAG); } catch (e) { /* 次の起動でまた確かめるだけ */ }
  history.replaceState(null, '', location.pathname);
  const done = () => { toast(`🔄 最新に なったよ${S.id ? `(ID「${S.id}」で ログイン中)` : ''}`, 3000); try { localStorage.removeItem(UPD_BAK); } catch (e) { /* のこってもよい */ } };
  if ((S.t || 0) >= f.t && (S.id || '') === f.id) { done(); return; }
  let b = null; try { b = JSON.parse(localStorage.getItem(UPD_BAK) || 'null'); } catch (e) { b = null; }
  const keep = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 同上 */ } };
  if (b && (b.t || 0) >= f.t) { S = Object.assign(JSON.parse(JSON.stringify(S_DEF)), b); keep(); title(); done(); return; }
  if (f.id) CLOUD.load(f.id).then(c => { if (c) { CLOUD.adopt(c, f.id); title(); done(); } }).catch(() => toast('記録を もどせなかった。「ID で ログイン」を ためしてね', 4000));
}

// ---------- 起動
title();
updateAfter();
