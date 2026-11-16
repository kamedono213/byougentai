const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 760, height: 1100 }, deviceScaleFactor: 1.5 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.waitForTimeout(600);
  await p.evaluate(() => { document.body.innerHTML = '<div id="g" style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px;background:#0e1a2b;color:#fff;font:12px sans-serif"></div>'; const g = document.getElementById('g'); for (const [k, f] of Object.entries(FAM)) { g.insertAdjacentHTML('beforeend', `<div style="grid-column:1/-1;font-weight:800;margin-top:4px">${f.ja}</div>`); f.ids.forEach(id => g.insertAdjacentHTML('beforeend', `<div style="background:#fff8ea;color:#222;border-radius:8px;text-align:center;padding:2px">${ART.hero(D[id], 70)}<br>${D[id].ja}</div>`)); } });
  await p.waitForTimeout(300); await p.screenshot({ path: 'shots/heroes.png', fullPage: true }); console.log('errs', errs); await b.close();
})();
