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
  const R = S.run; if (!R || !R.stage || B.o.tut || B.turn < 2) return;
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
