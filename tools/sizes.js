// 3つの画面サイズで バトル画面が はみ出さないか 撮る(小 SE2 / 中 AQUOS sense9 / 大)
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const SIZES = [['se2', 375, 667], ['sense9', 412, 915], ['max', 430, 932]];
(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    await p.evaluate(() => { S.tut = 99; DRUGS.forEach(d => learn(d.id, true)); PATHO.forEach(x => S.seen[x.id] = 1); save(); lessons(1); });
    await p.waitForTimeout(300); await p.tap('#nx'); await p.waitForTimeout(900);
    await p.evaluate(() => { B.tgt = 0; doTestKind('gram'); doTestKind('ask'); B.tgt = 1; doTestKind('gram'); document.querySelectorAll('.toast').forEach(t => t.remove()); renderBattle(); });
    await p.waitForTimeout(400);
    const m = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, winH: innerHeight, shelfBottom: Math.round(document.querySelector('.shelf').getBoundingClientRect().bottom), drugsH: Math.round(document.querySelector('.drugs').getBoundingClientRect().height) }));
    console.log(n, JSON.stringify(m));
    await p.screenshot({ path: `shots/size-${n}.png` });
    await c.close();
  }
  await b.close();
})();
