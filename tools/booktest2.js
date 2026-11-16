const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tut = 99; S.seen.strep = 1; S.run = newRun(1, 0); save(); startBattle({ foes: ['strep'], node: 'battle' }); });
  await p.waitForTimeout(700); while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(200); }
  await p.evaluate(() => { B.foes[0].k = 3; renderBattle(); });
  await p.tap('#bk'); await p.waitForTimeout(400); const t1 = await p.textContent('.bpage h3');
  await p.tap('#bkb'); await p.waitForTimeout(400); const t2 = await p.textContent('.bpage h3');
  console.log(t1, '→', t2, errs); await b.close();
})();
