const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  const out = [];
  for (const s of ['#zukan', '#bookbtn', '#man', '#look']) { await p.evaluate(() => title()); await p.tap(s); await p.waitForTimeout(250); out.push(s + ' -> ' + await p.evaluate(() => document.querySelector('#book') ? 'book' : (document.querySelector('.top h2') || document.querySelector('.page h3') || {}).textContent)); if (await p.locator('#bkx').count()) await p.tap('#bkx'); }
  await p.evaluate(() => title()); await p.tap('#bookbtn'); await p.waitForTimeout(800);
  await p.tap('#bkt'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelectorAll('.bpage details').forEach(d => d.open = true));
  out.push('toc scrollable: ' + await p.evaluate(() => { const e = document.querySelector('.bpage'); e.scrollTop = 600; return e.scrollHeight + '>' + e.clientHeight + ' top=' + e.scrollTop; }));
  await p.screenshot({ path: 'shots/book-toc.png' });
  await p.evaluate(() => { document.querySelector('.bpage').scrollTop = 0; }); 
  await p.tap('.bpage [data-i] >> nth=5'); await p.waitForTimeout(800); const t1 = await p.textContent('.bpage h3');
  await p.tap('.bdrug >> nth=0'); await p.waitForTimeout(800); const t2 = await p.textContent('.bpage h3');
  await p.tap('#bkb'); await p.waitForTimeout(800); const t3 = await p.textContent('.bpage h3');
  await p.tap('#bkb'); await p.waitForTimeout(500); const t4 = await p.textContent('.bpage h3');
  out.push(`toc→${t1} → link→${t2} → back→${t3} → back→${t4}`);
  await p.tap('#bkx');
  await p.evaluate(() => { S.tut = 99; S.run = newRun(2, 0); save(); startBattle({ foes: ['flu'], node: 'battle' }); }); await p.waitForTimeout(900);
  while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(300); }
  await p.tap('#bk'); await p.waitForTimeout(600); out.push('battle book: ' + !!(await p.locator('#book').count()));
  await p.screenshot({ path: 'shots/book-battle.png' });
  await p.tap('#bkx'); await p.waitForTimeout(200); await p.tap('[data-d] >> nth=0'); await p.waitForTimeout(200); out.push('sel=' + await p.evaluate(() => B.sel));
  await p.screenshot({ path: 'shots/battle-mobile.png' });
  console.log(out.join('\n')); console.log('errs', errs); await b.close();
})();
