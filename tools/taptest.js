const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2] || 'http://localhost:5411/'); await p.waitForTimeout(800);
  const at = async sel => { const r = await p.locator(sel).first().boundingBox(); if (!r) return sel + ' (no box)'; const top = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.className || e.tagName) + '' : 'none'; }, [r.x + r.width / 2, r.y + r.height / 2]); return sel + ' top=' + top; };
  const out = [];
  for (const s of ['#zukan', '#bookbtn', '#man', '#look', '#ach']) out.push(await at(s));
  await p.tap('#zukan'); await p.waitForTimeout(300); out.push('after tap zukan: ' + await p.evaluate(() => document.querySelector('.top h2') && document.querySelector('.top h2').textContent));
  await p.evaluate(() => { S.tut = 99; S.run = newRun(2, 0); save(); resumeRun(); }); await p.waitForTimeout(300);
  await p.tap('.node.can'); await p.waitForTimeout(900);
  while (await p.locator('.ov .btn').count()) { await p.tap('.ov .btn >> nth=0'); await p.waitForTimeout(300); }
  for (const s of ['[data-d]', '#end', '#test', '#bk', '.pause', '.foe']) out.push(await at(s));
  await p.tap('[data-d] >> nth=0'); await p.waitForTimeout(300); out.push('sel=' + await p.evaluate(() => B && B.sel));
  await p.screenshot({ path: 'shots/tap.png' });
  console.log(out.join('\n')); console.log('errs', errs);
  await b.close();
})();
