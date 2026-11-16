const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tut = 99; ['ors', 'apap', 'nutri', 'sleep', 'osel'].forEach(id => learn(id, true)); S.seen.adeno = 1; S.seen.flu = 1; S.run = newRun(1, 0); save(); startBattle({ foes: ['adeno'], node: 'battle' }); });
  await p.waitForTimeout(800);
  const hp0 = await p.evaluate(() => B.foes[0].hp);
  await p.tap('[data-c] >> nth=0'); await p.waitForTimeout(900);
  const r1 = await p.evaluate(() => ({ cellUsed: B.cellUsed, hp: B.foes[0].hp, cells: B.cells }));
  await p.tap('#wait'); 
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(500); const st = await p.evaluate(() => ({ auto: !!(B && B.auto), turn: B && B.turn, done: !B || !document.querySelector('.battleScr') })); if (!st.auto) { console.log('auto stopped at turn', st.turn, 'done', st.done); break; } }
  console.log('cell', hp0, '→', r1.hp, r1.cellUsed, r1.cells, 'errs', errs);
  await b.close();
})();
