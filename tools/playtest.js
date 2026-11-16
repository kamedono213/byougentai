// 自動で通しプレイして、エラー・つまり・バランスを確かめる。スクショは docs-img/ に保存。
// 実行: node tools/playtest.js [回数] [smart|kid]   (先に node serve.js を起動しておく)
//   smart: 効く薬をえらぶ上手な人 / kid: 検査せずに、ときどき まちがえる子ども
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const path = require('path'), fs = require('fs');
const N = +(process.argv[2] || 1), MODE = process.argv[3] || 'smart', STAGES_ = (process.argv[4] || '1,2,3').split(',').map(Number);
const shots = path.join(__dirname, '../shots'); fs.mkdirSync(shots, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload();
  const shot = async n => { await p.waitForTimeout(250); await p.screenshot({ path: path.join(shots, n + '.png') }); };
  const sleep = ms => p.waitForTimeout(ms);
  await shot('01-title');
  // 1手すすめる(モーダル → ボタン → バトルの1行動)
  const step = () => p.evaluate(async (MODE) => {
    const ov = document.querySelector('.ov .btn'); if (ov) { ov.click(); return 'modal'; }
    const lc = document.querySelector('#leave-confirm [data-a="yes"]'); if (lc) { lc.click(); return 'leave'; }
    if (document.querySelector('.manual #nx')) { document.querySelector('#nx').click(); return 'manual'; }
    if (typeof B !== 'undefined' && B && document.querySelector('.battleScr')) {
      if (B.busy) return 'busy';
      const R = S.run, f = B.foes[B.tgt] && B.foes[B.tgt].hp > 0 ? B.foes[B.tgt] : B.foes.find(x => x.hp > 0); if (!f) return 'wait';
      B.tgt = B.foes.indexOf(f);
      const p = P[f.pid];
      const can = d => learned(d.id) && !(B.cd[d.id] > 0) && !B.usedTurn.has(d.id) && B.ap >= d.cost;
      if (MODE === 'smart' && f.k < 3 && B.ap >= 1 && !(B.tested && B.tested.has(f))) { (B.tested = B.tested || new Set()).add(f); const C = CLINIC[f.pid] || {}; const kind = C.rapid ? 'rapid' : B.ap >= 2 ? 'culture' : 'gram'; B.ap -= kind === 'culture' ? 2 : 1; doTestKind(kind); return 'test'; }
      let list = DRUGS.filter(d => can(d) && effOf(d, p) >= 1 && !f.dots.some(x => x.id === d.id && x.t > 1)).sort((a, b) => (isBest(b, p) - isBest(a, p)) || effOf(b, p) - effOf(a, p) || a.gut - b.gut);
      if (list.length && !p.combo && f.dots.length) list = [];
      if (MODE === 'kid' && Math.random() < 0.25) list = DRUGS.filter(can).sort(() => Math.random() - .5);
      if (!list.length) list = DRUGS.filter(d => can(d) && (R.hp < R.max * .7 ? (d.heal || d.guard) : d.immUp)).sort((a, b) => (b.heal || 0) - (a.heal || 0));
      if (list.length) { B.sel = list[0].id; await useDrug(list[0].id); return 'use ' + list[0].id; }
      endTurn(); return 'end';
    }
    const node = document.querySelector('.node.can'); if (node) { const all = [...document.querySelectorAll('.node.can')]; all[Math.floor(Math.random() * all.length)].click(); return 'node'; }
    const opt = document.querySelector('.reward .opt:not(:disabled)'); if (opt && !document.querySelector('#skip') && document.querySelector('#r1')) { document.querySelector(S.run.hp < S.run.max * .6 ? '#r1' : '#r2:not(:disabled)') ? document.querySelector(S.run.hp < S.run.max * .6 ? '#r1' : '#r2:not(:disabled)').click() : document.querySelector('#r1').click(); return 'rest'; }
    if (document.querySelector('[data-u]')) { document.querySelector('[data-u]').click(); return 'up'; }
    if (opt) { opt.click(); return 'reward'; }
    const buy = document.querySelector('.shop [data-b]:not(:disabled)'); if (buy && Math.random() < .5) { buy.click(); return 'buy'; }
    if (document.querySelector('#out')) { document.querySelector('#out').click(); return 'out'; }
    return 'idle';
  }, MODE);
  // チュートリアル
  await p.click('#tut');
  let shotDone = {};
  for (let i = 0; i < 400; i++) {
    const r = await step();
    const t = await p.evaluate(() => (document.querySelector('.page h3') || {}).textContent || (document.querySelector('.battleScr') ? 'battle' : document.querySelector('.titleScr') ? 'title' : ''));
    if (t && !shotDone[t] && (t.includes('4つ') || t.includes('画面') || t === 'battle')) { shotDone[t] = 1; await shot('02-' + Object.keys(shotDone).length); }
    if (t === 'title' && i > 5) break;
    if (i % 40 === 0) console.log('tut', i, r, t, await p.evaluate(() => S.tut + ' ' + (typeof B !== 'undefined' && B ? B.mode + ' busy=' + B.busy + ' ap=' + B.ap + ' foes=' + B.foes.map(f => f.pid + f.hp).join() : 'noB') + ' ov=' + !!document.querySelector('.ov') + ' app=' + app.className));
    await sleep(r === 'busy' || r === 'end' ? 500 : 120);
  }
  const tut = await p.evaluate(() => S.tut);
  console.log('tutorial', tut === 99 ? 'OK' : 'NG ' + tut);
  const result = [];
  await p.evaluate(() => { const L = lose; window.lose = undefined; lose = async function () { window.lastDeath = { foes: B.foes.map(f => f.pid + ':' + f.hp + '/' + f.max), fl: S.run.fl, res: S.run.resist, gut: S.run.gut, turn: B.turn, lv: JSON.stringify(S.run.lv) }; return L(); }; });
  await p.evaluate(() => { const W = win; window.bst = []; win = async function () { window.bst.push({ s: S.run && S.run.stage, t: B.turn, d: B.dmgTaken }); return W(); }; });
  for (let n = 0; n < N; n++) for (const stage of STAGES_) {
    if (stage === 9) await p.evaluate(() => { S.clear = { 1: 1, 2: 1, 3: 1 }; const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 40, items: ['hint'], mod: {} }); S.run = R; save(); chooseScenario(); });
    else await p.evaluate(st => { S.run = newRun(st, 0); save(); mapScreen(); }, stage);
    if (n === 0) await shot(`1${stage}-map`);
    let battles = 0, out = 'timeout', took = {};
    for (let i = 0; i < (stage === 9 ? 9000 : 3000); i++) {
      const r = await step();
      if (n === 0 && r.startsWith('use') && !took.b) { took.b = 1; await shot(`1${stage}-battle`); }
      if (n === 0 && r === 'reward' && !took.r) { took.r = 1; }
      if (r === 'end') battles++;
      const st = await p.evaluate(() => ({ run: !!S.run, title: !!document.querySelector('.titleScr'), clear: S.clear }));
      if (st.title && !st.run) { out = st.clear[stage] ? 'CLEAR' : 'DEAD'; break; }
      await sleep(r === 'busy' || r === 'end' ? 450 : 60);
    }
    const info = await p.evaluate(() => ({ endless: S.endless.best, learned: Object.keys(S.learned).length, kills: Object.keys(S.kills).length, wins: S.stat.win, death: window.lastDeath })); await p.evaluate(() => { window.lastDeath = null; });
    result.push({ n, stage, out, turns: battles, ...info });
    console.log(JSON.stringify(result[result.length - 1]));
  }
  await p.evaluate(() => zukan('p')); await shot('20-zukan');
  await p.evaluate(() => achScreen()); await shot('21-ach');
  const bs = await p.evaluate(() => window.bst);
  for (const s of [1, 2, 3, 9]) { const a = bs.filter(x => x.s === s); if (a.length) console.log('stage', s, 'battles', a.length, 'avgTurns', (a.reduce((q, x) => q + x.t, 0) / a.length).toFixed(1), 'avgDmg', (a.reduce((q, x) => q + x.d, 0) / a.length).toFixed(1)); }
  console.log('errors', errs.length, errs.slice(0, 8));
  await b.close();
})();
