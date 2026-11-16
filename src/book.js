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
    el.innerHTML = `<div class="bk"><div class="bktop"><button class="btn sm" id="bkx">✕ とじる</button><button class="btn sm" id="bkb" ${hist.length ? '' : 'disabled'}>↩ もどる</button><button class="btn sm" id="bkt">📑 目次</button><input class="txt" id="bkq" placeholder="🔍 さがす(例: 抗菌薬・肺・グラム陰性)"></div>${inner}</div>`;
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
