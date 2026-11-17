// 小窓・攻略本: 右上の ✕ と 外タップで とじる(つかう は 押されない)
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const SIZES = [['se2', 375, 553], ['sense9', 412, 760], ['iplus', 430, 740]];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    await p.evaluate(() => { S.tut = 99; DRUGS.forEach(d => learn(d.id, true)); save(); lessons(1); }); await p.waitForTimeout(300); await p.tap('#nx'); await p.waitForTimeout(1200);
    await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
    // 長おしの 薬カード → ✕
    const ap0 = await p.evaluate(() => { B.ap = 3; B.busy = false; renderBattle(); void drugInfo('pen', true); return B.ap; });
    await p.waitForTimeout(300); await p.screenshot({ path: `shots/close-${n}-card.png` });
    const xr = await p.evaluate(() => { const r = document.querySelector('.ov .mx').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), innerWidth]; });
    await p.tap('.ov .mx'); await p.waitForTimeout(300);
    const a1 = await p.evaluate(() => ({ ov: !!document.querySelector('.ov'), ap: B.ap }));
    // 外を タップ
    await p.evaluate(() => { void drugInfo('pen', true); }); await p.waitForTimeout(300);
    await p.mouse.click(5, h - 5); await p.waitForTimeout(300);
    const a2 = await p.evaluate(() => ({ ov: !!document.querySelector('.ov'), ap: B.ap }));
    // ボタンが 1つだけの 決定(✕は 出ない)
    await p.evaluate(() => { void modal('<b>テスト</b>', ['しゅっぱつ!']); }); await p.waitForTimeout(200);
    const a3 = await p.evaluate(() => !!document.querySelector('.ov .mx'));
    await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
    // 攻略本
    await p.evaluate(() => BOOK.open(null, true)); await p.waitForTimeout(400); await p.screenshot({ path: `shots/close-${n}-book.png` });
    await p.tap('#bkx'); await p.waitForTimeout(300);
    const a4 = await p.evaluate(() => !!document.getElementById('book'));
    console.log(n, 'ap', ap0, 'x at', xr, 'afterX', JSON.stringify(a1), 'afterOutside', JSON.stringify(a2), 'decisionHasX', a3, 'bookOpen', a4);
    await c.close();
  }
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
