const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const SIZES = [['se2', 375, 667], ['sense9', 412, 915], ['max', 430, 932]];
(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    const res = [];
    const meas = async (name, fn) => { await p.evaluate(fn); await p.waitForTimeout(400); const v = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight); res.push(name + (v > 2 ? ' はみ出し' + v : ' OK')); if (n === 'se2') await p.screenshot({ path: `shots/se2-${name}.png` }); };
    await meas('title', () => { S.tut = 99; S.tut2 = 99; S.clear = { 1: 1, 2: 1, 3: 1 }; S.run = newRun(1, 0); save(); title(); });
    await meas('map', () => { mapScreen(); });
    await meas('reward', () => { rewardScreen('elite'); });
    await meas('shop', () => { shopScreen(); });
    await meas('stages', () => { stageSelect(); });
    console.log(n, res.join(' / '));
    await c.close();
  }
  await b.close();
})();
