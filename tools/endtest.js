// むげん病院: スタートの薬だな・正体が かくれているか・問診で くわしく・おかゆの ルール・からだづくり
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const W = +(process.argv[2] || 375), H = +(process.argv[3] || 553);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  // ステージ3まで クリアずみ・薬は たくさん おぼえている 人
  await p.evaluate(() => { S.tut = 99; S.tut2 = 99; S.clear = { 1: 1, 2: 1, 3: 1 }; DRUGS.forEach(d => learn(d.id, true)); save(); });
  // からだづくり
  await p.evaluate(() => { S.meta = { pt: 300, lv: {} }; save(); metaScreen(); });
  await p.waitForTimeout(400); await p.screenshot({ path: 'shots/end-meta.png' });
  const metaFit = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, winH: innerHeight }));
  await p.evaluate(() => { document.querySelector('[data-m="run"]').click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector('[data-m="study"]').click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector('[data-m="lab"]').click(); }); await p.waitForTimeout(300);
  const meta = await p.evaluate(() => JSON.stringify(S.meta));
  console.log('meta', meta, 'fit', JSON.stringify(metaFit));
  // むげん病院 スタート(endlessStart の 中身を そのまま)
  const st = await p.evaluate(async () => {
    endlessStart(); await new Promise(r => setTimeout(r, 400));
    const btn = [...document.querySelectorAll('.ov button')].find(x => /はじめる/.test(x.textContent)); btn.click();
    await new Promise(r => setTimeout(r, 600));
    return { deck: S.run.deck.join(','), max: S.run.max, coins: S.run.coins };
  });
  console.log('start', JSON.stringify(st));
  // 派遣先を えらぶ → バトル
  await p.screenshot({ path: 'shots/end-tips.png' });
const bt = await p.evaluate(async () => {
    { const w = [...document.querySelectorAll('.ov button')].find(x => /わかった/.test(x.textContent)); if (w) { w.click(); await new Promise(r => setTimeout(r, 500)); } }
    document.querySelector('.ov button').click(); await new Promise(r => setTimeout(r, 500));
    { const g = [...document.querySelectorAll('.ov button')].find(x => /しゅっぱつ/.test(x.textContent)); if (g) g.click(); } await new Promise(r => setTimeout(r, 500));
    const R = S.run; const pool = SG(R).enemies;
    startBattle({ foes: [pool[0], pool[1] || pool[0]], node: 'battle' }); await new Promise(r => setTimeout(r, 1500));
    for (let i = 0; i < 4; i++) { const ok = [...document.querySelectorAll('.ov button')].pop(); if (ok) ok.click(); await new Promise(r => setTimeout(r, 400)); }
    const notes = [...document.querySelectorAll('.foe .note')].map(e => e.textContent);
    const ks = B.foes.map(f => f.pid + ':k' + f.k);
    const shelf = [...document.querySelectorAll('.drug')].map(e => e.dataset.d);
    return { ks, notes, shelf: shelf.join(','), freeTest: B.freeTest };
  });
  console.log('battle', JSON.stringify(bt));
  await p.screenshot({ path: 'shots/end-battle.png' });
  const ask = await p.evaluate(async () => { B.tgt = 0; doTestKind('ask'); await new Promise(r => setTimeout(r, 300)); document.querySelectorAll('.ov').forEach(o => o.remove()); renderBattle(); return [...document.querySelectorAll('.foe .note')].map(e => e.textContent); });
  console.log('after ask', JSON.stringify(ask));
  // おかゆの ルール(ノロ: はく・げり)
  const ok = await p.evaluate(() => {
    B.foes = [makeFoe('noro', 'battle', 3)];
    const r = {};
    S.run.hp = S.run.max; r.full = [...symptoms()].join(',') + ' okayu=' + careFit(D.okayu) + ' ors=' + careFit(D.ors) + ' drip=' + careFit(D.drip);
    S.run.hp = Math.floor(S.run.max * 0.4); r.low = [...symptoms()].join(',') + ' okayu=' + careFit(D.okayu) + ' ors=' + careFit(D.ors) + ' drip=' + careFit(D.drip);
    B.foes = [makeFoe('strep', 'battle', 3)]; S.run.hp = S.run.max; r.strep = [...symptoms()].join(',') + ' okayu=' + careFit(D.okayu);
    return r;
  });
  console.log('okayu', JSON.stringify(ok));
  // 負けて ポイント
  const over = await p.evaluate(async () => { const before = S.meta.pt; S.run.hp = 0; lose(); await new Promise(r => setTimeout(r, 600)); return { before, after: S.meta.pt, ov: !!document.querySelector('.ov') }; });
  console.log('over', JSON.stringify(over));
  await p.screenshot({ path: 'shots/end-over.png' });
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
