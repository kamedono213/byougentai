// 見本の画面を撮る(公開版)。実行: node tools/shots.js [URL]
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const path = require('path'), fs = require('fs');
const URL = process.argv[2] || 'https://kamedono213.github.io/byougentai/';
const out = path.join(__dirname, '../docs-img'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: path.join(out, n + '.png') }); };
  await shot('a-title');
  await p.evaluate(() => { S.tut = 99; S.clear = { 1: 1, 2: 1, 3: 1 }; ['pen', 'amox', 'cez', 'ctrx', 'azm', 'osel', 'tbf', 'pyr', 'ors', 'vcm', 'mepm', 'flcz'].forEach(id => learn(id, true)); S.seen.strep = 1; S.seen.flu = 1; S.seen.staph = 1; save(); title(); });
  await shot('b-title-endless');
  await p.evaluate(() => { const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 40, items: ['hint'], mod: {} }); S.run = R; save(); setTimeout(chooseScenario, 0); });
  await shot('c-scenario');
  await p.click('.ov .btn'); await p.waitForTimeout(300); await p.click('.ov .btn'); await shot('d-map');
  await p.evaluate(() => { forkScreen(); }); await shot('e-fork');
  await p.click('.ov .btn');
  await p.evaluate(() => startBattle({ foes: ['staph', 'strep'], node: 'battle' })); await p.waitForTimeout(500);
  await p.evaluate(() => { B.sel = 'cez'; renderBattle(); }); await shot('f-battle');
  console.log('errors', errs);
  await b.close();
})();
