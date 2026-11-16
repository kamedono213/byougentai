// 小学生のつもりで 1ステージ 遊んで、画面を ぜんぶ 撮る(手ざわりの 確認用)
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  let k = 0; const shot = async n => p.screenshot({ path: `shots/kid-${String(++k).padStart(2, '0')}-${n}.png` });
  await p.evaluate(() => { S.tut = 99; ['pen', 'osel', 'tbf', 'pyr', 'ctrx', 'ors', 'amox', 'cez', 'azm'].forEach(id => learn(id, true)); save(); S.run = newRun(1, 0); save(); mapScreen(); });
  await shot('map'); await p.tap('.node.can >> nth=0', { force: true }); await p.waitForTimeout(900); await shot('first');
  while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(300); }
  await shot('battle');
  await p.tap('[data-d] >> nth=0'); await p.waitForTimeout(300); await shot('select');
  const d = p.locator('[data-d] >> nth=1'); const bb = await d.boundingBox(); await p.mouse.move(bb.x + 20, bb.y + 20); await p.mouse.down(); await p.waitForTimeout(600); await p.mouse.up(); await p.waitForTimeout(300); await shot('detail');
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(e => e.remove()));
  await p.evaluate(() => zukan('d')); await p.waitForTimeout(300); await shot('zukan-d');
  await p.evaluate(() => drugInfo('amox', false)); await p.waitForTimeout(300); await shot('zukan-card');
  await b.close();
})();
