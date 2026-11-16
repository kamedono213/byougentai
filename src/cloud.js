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
