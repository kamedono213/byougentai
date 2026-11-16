const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tut = 99; S.ach.s1 = 1; save(); lookScreen(); }); await p.waitForTimeout(300);
  await p.tap('.lopt[data-k="skin"] >> nth=4'); await p.tap('.lopt[data-k="style"] >> nth=10'); await p.tap('.lopt[data-k="coat"] >> nth=2'); await p.tap('.lopt[data-k="acc"] >> nth=4'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/look.png' });
  const over = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await p.evaluate(() => title()); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/look-title.png' });
  console.log('over', over, errs); await b.close();
})();
