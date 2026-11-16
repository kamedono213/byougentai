const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const clr = async () => { while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(250); } };
  await p.evaluate(() => { S.tut = 99; ['cez', 'ctrx', 'ors', 'apap', 'nutri', 'sleep', 'pen'].forEach(id => learn(id, true)); S.seen.staph = 1; S.run = newRun(2, 0); save(); startBattle({ foes: ['staph'], node: 'battle' }); });
  await p.waitForTimeout(800); await clr();
  await p.screenshot({ path: 'shots/tac-1-rx.png' });
  const m0 = await p.evaluate(() => B.mode);
  await p.tap('[data-d="cez"]'); await p.waitForTimeout(200); await p.tap('.foe'); await p.waitForTimeout(1200);
  const m1 = await p.evaluate(() => ({ mode: B.mode, cells: !!document.querySelector('.cells'), shelf: [...document.querySelectorAll('[data-d]')].map(e => e.dataset.d) }));
  await p.screenshot({ path: 'shots/tac-2-care.png' });
  await p.evaluate(() => { B.foes[0].sp = 'tox'; B.foes[0].spShown = false; });
  await p.evaluate(() => playerTurn()); await p.waitForTimeout(700); await p.screenshot({ path: 'shots/tac-3-cutin.png' }); await p.waitForTimeout(2200); await clr();
  // 抗体で やぶる
  await p.evaluate(() => { B.cells = ['anti', 'neut', 'mac']; B.cellUsed = false; renderBattle(); });
  await p.tap('[data-c="anti"]'); await p.waitForTimeout(600);
  const hp0 = await p.evaluate(() => S.run.hp);
  await p.evaluate(() => endTurn()); await p.waitForTimeout(3500); await clr();
  const r = await p.evaluate(() => ({ sp: B && B.foes[0].sp, hpLoss: 0, brk: S.stat.spBreak || 0 }));
  for (const t of ['school', 'jungle', 'hospital', 'er', 'forest', 'winter']) { await p.evaluate(t => { const s = document.querySelector('.scene .bg'); if (s) s.outerHTML = bgSVG(t); }, t); await p.waitForTimeout(150); await p.screenshot({ path: `shots/bg-${t}.png`, clip: { x: 0, y: 140, width: 412, height: 300 } }); }
  console.log(JSON.stringify({ m0, m1, hp0, r }), 'errs', errs);
  await b.close();
})();
