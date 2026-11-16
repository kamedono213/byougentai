const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tut = 99; save(); lessons(1); });
  await p.waitForTimeout(400); await p.screenshot({ path: 'docs-img/g-gram-manual.png' });
  await p.click('#nx'); await p.waitForTimeout(800);
  await p.evaluate(() => { B.tgt = 0; doTestKind('gram'); B.tgt = 1; doTestKind('gram'); B.tgt = 0; doTestKind('ask'); renderBattle(); });
  await p.waitForTimeout(400); await p.screenshot({ path: 'docs-img/h-gram-battle.png' });
  await b.close();
})();
