// 薬局マス・お店に薬がないこと・めんえき隊のレベルアップ
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  await p.evaluate(() => { S.tut = 99; save(); const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 200, items: [], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu'], scn: SCN[0].id, bossId: SCN[0].boss[0], fl: 3 }); R.map = makeMap(9); S.run = R; save(); });
  // 地図に 薬局が 出るか(100枚 作って 数える)
  const cnt = await p.evaluate(() => { let n = 0; for (let k = 0; k < 100; k++) makeMap(9).forEach(r => r.forEach(x => { if (x.type === 'pharm') n++; })); return n / 100; });
  console.log('pharm per map', cnt);
  await p.evaluate(() => pharmScreen()); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/pharm.png' });
  const ph = await p.evaluate(() => S.run.pharm.list.map(o => o.k + ':' + o.id + ':' + o.price).join(' '));
  console.log('pharm list', ph);
  await p.evaluate(() => document.querySelector('[data-b="0"]').click()); await p.waitForTimeout(500);
  const got = await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.remove()); return S.run.deck.join(',') + ' coins ' + S.run.coins; });
  console.log('after buy', got);
  await p.evaluate(() => shopScreen()); await p.waitForTimeout(300);
  console.log('shop kinds', await p.evaluate(() => [...new Set(S.run.shop.list.filter(Boolean).map(o => o.k))].join(',')));
  // めんえき隊
  const lv = await p.evaluate(async () => { const out = []; for (let k = 0; k < 12; k++) { immGood(2, 'test'); out.push(S.run.immLv); } return out.join(','); });
  console.log('immLv steps', lv);
  await p.evaluate(async () => { startBattle({ foes: ['ecoli'], node: 'battle' }); await new Promise(r => setTimeout(r, 1500)); document.querySelectorAll('.ov').forEach(o => o.remove()); B.mode = 'care'; dealCells(); renderBattle(); });
  await p.waitForTimeout(300);
  console.log('cells', await p.evaluate(() => B.cells.length + ' ' + document.querySelector('.cl-h').textContent));
  await p.screenshot({ path: 'shots/immlv.png' });
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
