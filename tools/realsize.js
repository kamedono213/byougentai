// 実機で「見える」高さ(ブラウザのバーを引いた)で、処方・ささえ画面の薬だなが何段見えるか測る
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
// SE2/SE3 Safari 375×553、AQUOS sense9 Chrome 412×760、大きいiPhone Safari 430×740、大きいAndroid 412×860
const SIZES = [['se2', 375, 553], ['sense9', 412, 760], ['iplus', 430, 740], ['tall', 412, 860]];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    await p.evaluate(() => { S.tut = 99; DRUGS.forEach(d => learn(d.id, true)); PATHO.forEach(x => S.seen[x.id] = 1); save(); lessons(1); });
    await p.waitForTimeout(300); await p.tap('#nx'); await p.waitForTimeout(900);
    for (const mode of ['rx', 'care', 'rxsel', 'gram', 'gram1', 'gram3']) {
      const m = await p.evaluate(mode => {
        const bac = PATHO.filter(x => x.gram && !x.endless).slice(0, 3).map(x => x.id); B.foes = mode.startsWith('gram') ? (mode === 'gram1' ? [makeFoe(bac[0], 'battle', 1)] : bac.slice(0, mode === 'gram3' ? 3 : 2).map(id => makeFoe(id, 'battle', 1))) : [makeFoe('flu', 'battle', 1), makeFoe('pinworm', 'battle', 1)]; B.busy = false; if (mode.startsWith('gram')) { B.foes.forEach((f, i) => { B.tgt = i; doTestKind('gram'); doTestKind('ask'); }); B.tgt = 0; window.__bac = bac.join(','); }
        B.mode = mode === 'care' ? 'care' : 'rx'; B.sel = mode === 'rxsel' ? 'osel' : null; B.ap = 3;
        if (mode === 'care') B.cells = B.cells || ['neut', 'mac', 'nk'];
        document.querySelectorAll('.toast,.ov').forEach(t => t.remove()); renderBattle();
        const dr = document.querySelector('.drugs').getBoundingClientRect();
        const tiles = [...document.querySelectorAll('.drug')].map(e => e.getBoundingClientRect());
        const full = tiles.filter(r => r.top >= dr.top - 1 && r.bottom <= dr.bottom + 1).length;
        const tileH = tiles[0] ? Math.round(tiles[0].height) : 0;
        return { docH: document.documentElement.scrollHeight, winH: innerHeight, drugsH: Math.round(dr.height), tileH, fullTiles: full, total: tiles.length, scene: Math.round(document.querySelector('.scene').getBoundingClientRect().height), sceneOver: [...document.querySelectorAll('.foe')].map(e => { const sc = document.querySelector('.scene').getBoundingClientRect(), a = e.firstElementChild.getBoundingClientRect(), z = e.lastElementChild.getBoundingClientRect(); return Math.round(Math.max(0, sc.top - a.top, e.getBoundingClientRect().top - a.top, z.bottom - sc.bottom)) + (e.scrollWidth > e.clientWidth + 1 ? 'W' : ''); }).join('/'), bac: window.__bac };
      }, mode);
      console.log(n, mode, JSON.stringify(m));
      await p.screenshot({ path: `shots/real-${n}-${mode}.png` });
    }
    await c.close();
  }
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
