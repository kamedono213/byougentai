const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tut = 99; S.seen.strep = 1; S.seen.flu = 1; S.run = newRun(1, 0); save(); startBattle({ foes: ['strep', 'flu'], node: 'battle' }); });
  await p.waitForTimeout(700); while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(200); }
  await p.evaluate(() => { B.foes.forEach(f => f.k = 3); B.tgt = 1; renderBattle(); });
  await p.tap('#bk'); await p.waitForTimeout(400); const t1 = await p.textContent('.bpage h3');
  await p.screenshot({ path: 'shots/peek-book.png' });
  const el = p.locator('.bpage .dc-foe[data-did] >> nth=0'); const bb = await el.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(400);
  const t2 = await p.textContent('.bpage h3'); const pop = await p.evaluate(() => !!document.querySelector('.ov .dcard'));
  await p.screenshot({ path: 'shots/peek-pop.png' });
  console.log('book opened:', t1, '| after longpress page:', t2, 'popup:', pop, errs); await b.close();
})();
