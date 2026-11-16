const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5411/'); await p.waitForTimeout(700);
  await p.evaluate(() => BOOK.open('肺炎球菌')); await p.waitForTimeout(500); await p.screenshot({ path: 'docs-img/i-book-page.png' });
  await p.fill('#bkq', '抗菌薬'); await p.press('#bkq', 'Enter'); await p.waitForTimeout(400); await p.screenshot({ path: 'docs-img/j-book-search.png' });
  await b.close();
})();
