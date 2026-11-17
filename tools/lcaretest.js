const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  await p.evaluate(() => { S.tut = 99; save(); lessons(TUT2.findIndex(t => t.man === 'l_care')); });
  await p.waitForTimeout(500); await p.screenshot({ path: 'shots/lcare-1.png' });
  await p.tap('#nx'); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/lcare-2.png' });
  await p.tap('#nx'); await p.waitForTimeout(1500);
  for (let i = 0; i < 4; i++) { const ok = await p.$('.ov button'); if (ok) { await ok.click(); await p.waitForTimeout(400); } }
  const r = await p.evaluate(async () => { B.mode = 'care'; renderBattle(); const fit = [...document.querySelectorAll('.drug.fit')].map(e => e.dataset.d).join(','); const syms = document.querySelector('.syms').textContent; return { fit, syms, foes: B.foes.map(f => f.pid) }; });
  console.log(JSON.stringify(r));
  await p.screenshot({ path: 'shots/lcare-3.png' });
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
