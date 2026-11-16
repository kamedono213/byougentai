const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(4000);
  await p.screenshot({ path: 'shots/title-bg.png' });
  const n = await p.evaluate(() => ({ foes: document.querySelectorAll('.tf').length, drops: document.querySelectorAll('.td').length }));
  await p.evaluate(() => { S.tut = 99; save(); title(); }); await p.waitForTimeout(3000); await p.screenshot({ path: 'shots/title-bg2.png' });
  console.log(n, errs); await b.close();
})();
