const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2 });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.screenshot({ path: 'shots/set-title.png' });
  await p.click('#setting'); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/set-1.png' });
  await p.click('#chlog'); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/set-log.png' });
  await p.click('#back'); await p.waitForTimeout(300);
  console.log('back to setting', await p.evaluate(() => !!document.querySelector('#chlog')));
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
