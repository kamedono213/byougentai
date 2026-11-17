// ごほうび・薬局・相談の 薬を 長おし → カードが 出て、えらばれない
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2 });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const longPress = async sel => { const el = await p.$(sel); if (!el) return 'no element ' + sel; const bx = await el.boundingBox(); const x = bx.x + bx.width * 0.7, y = bx.y + bx.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(400); return p.evaluate(() => { const o = document.querySelector('.ov .dcard, .ov .dc, .ov'); return o ? (document.querySelector('.ov').textContent.slice(0, 30)) : 'no modal'; }); };
  await p.evaluate(() => { S.tut = 99; save(); const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 300, items: [], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu'], scn: 'winter', bossId: 'flu', cond: [], condKnown: true, abg: {}, fl: 3 }); R.map = makeMap(9); S.run = R; save(); });
  // ごほうび
  await p.evaluate(() => rewardScreen('battle')); await p.waitForTimeout(400);
  const deck0 = await p.evaluate(() => S.run.deck.length);
  const r1 = await longPress('.opt[data-did]');
  const deck1 = await p.evaluate(() => S.run.deck.length);
  await p.screenshot({ path: 'shots/peek-reward.png' });
  console.log('reward', r1, 'deck', deck0, '->', deck1, 'screen still reward', await p.evaluate(() => !!document.querySelector('[data-o]')));
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
  // 薬局
  await p.evaluate(() => pharmScreen()); await p.waitForTimeout(400);
  const c0 = await p.evaluate(() => S.run.coins);
  const r2 = await longPress('.stile[data-did]');
  console.log('pharm', r2, 'coins', c0, '->', await p.evaluate(() => S.run.coins));
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
  // 相談の 薬の えらびかた
  await p.evaluate(async () => { startBattle({ foes: ['ecoli'], node: 'battle' }); await new Promise(r => setTimeout(r, 1400)); document.querySelectorAll('.ov').forEach(o => o.remove()); B.ap = 3; B.consulted = false; consult(); await new Promise(r => setTimeout(r, 300)); [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes('大腸菌')).click(); await new Promise(r => setTimeout(r, 400)); });
  const r3 = await longPress('.ov .optd2[data-did]');
  console.log('consult', r3, 'overlays', await p.evaluate(() => document.querySelectorAll('.ov').length));
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
