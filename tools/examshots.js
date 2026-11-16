const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const cases = [['pneumo', 'xray'], ['ecoli', 'urine'], ['malaria', 'micro'], ['myco', 'blood'], ['mening', 'csf'], ['strep', 'exam'], ['tb', 'xray']];
  for (const [pid, kind] of cases) {
    await p.evaluate(([pid]) => { document.querySelectorAll('.ov').forEach(e => e.remove()); S.tut = 99; S.seen[pid] = 1; S.run = newRun(2, 0); save(); startBattle({ foes: [pid], node: 'battle' }); }, [pid]);
    await p.waitForTimeout(700);
    while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(250); }
    await p.evaluate(k => { B.tgt = 0; doTestKind(k); }, kind); await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/exam-${pid}-${kind}.png` });
    const txt = await p.evaluate(() => document.querySelector('.ov') && document.querySelector('.ov').innerText.replace(/\s+/g, ' ').slice(0, 160));
    console.log(pid, kind, '→', txt);
  }
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(e => e.remove()); testMenu(); }); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/exam-menu.png' });
  console.log('errs', errs); await b.close();
})();
