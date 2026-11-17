// 幕の はじめの「攻略本の ここを 読もう」→ 本を 開く → とじると 案内に もどる → はじめる
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2 });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const btns = () => p.evaluate(() => [...document.querySelectorAll('.ov button')].map(x => x.textContent.trim()));
  const click = t => p.evaluate(t => { const x = [...document.querySelectorAll('.ov button')].find(y => y.textContent.includes(t)); if (x) x.click(); return !!x; }, t);
  // はじめての むげん病院
  await p.evaluate(() => { S.tut = 99; S.clear = { 1: 1, 2: 1, 3: 1 }; save(); endlessStart(); }); await p.waitForTimeout(400);
  await click('はじめる'); await p.waitForTimeout(500);
  console.log('tips', await btns());
  await click('わかった!'); await p.waitForTimeout(400);
  console.log('guide1', await btns());
  await p.screenshot({ path: 'shots/guide-1.png' });
  await click('患者さんの 条件'); await p.waitForTimeout(500);
  console.log('book page', await p.evaluate(() => document.querySelector('#book h3') && document.querySelector('#book h3').textContent));
  await p.screenshot({ path: 'shots/guide-book.png' });
  await p.click('#bkx'); await p.waitForTimeout(500);
  console.log('back to guide', await btns());
  await click('はじめる'); await p.waitForTimeout(500);
  console.log('scenario', (await btns()).slice(0, 3));
  // 2幕の はじめ
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.remove()); S.run.act = 2; chooseScenario(); }); await p.waitForTimeout(500);
  await p.evaluate(() => { const x = document.querySelector('.ov button'); x.click(); }); await p.waitForTimeout(500);
  console.log('act2', await btns());
  await click('迅速検査'); await p.waitForTimeout(500);
  console.log('act2 book', await p.evaluate(() => document.querySelector('#book h3') && document.querySelector('#book h3').textContent));
  await p.click('#bkx'); await p.waitForTimeout(500);
  await click('はじめる'); await p.waitForTimeout(500);
  console.log('act2 next', (await btns()).slice(0, 3));
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
