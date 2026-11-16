// ささえ: 症状に合うか(ぴったり/効きにくい)と、3サイズで ささえ画面が はみ出さないか
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const SIZES = [['se2', 375, 667], ['sense9', 412, 915], ['max', 430, 932]];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    await p.evaluate(() => { S.tut = 99; DRUGS.forEach(d => learn(d.id, true)); PATHO.forEach(x => S.seen[x.id] = 1); save(); lessons(1); });
    await p.waitForTimeout(300); await p.tap('#nx'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const out = {};
      B.foes = [makeFoe('flu', 'battle', 1)]; out.flu = [...symptoms()].join(',') + ' apap=' + careFit(D.apap) + ' ors=' + careFit(D.ors) + ' humid=' + careFit(D.humid) + ' nutri=' + careFit(D.nutri);
      B.foes = [makeFoe('pinworm', 'battle', 1)]; out.pin = [...symptoms()].join(',') + ' apap=' + careFit(D.apap) + ' antih=' + careFit(D.antih);
      B.foes = [makeFoe('flu', 'battle', 1), makeFoe('pinworm', 'battle', 1)];
      B.mode = 'care'; document.querySelectorAll('.toast').forEach(t => t.remove()); renderBattle();
      out.fitTiles = [...document.querySelectorAll('.drug.fit')].map(e => e.dataset.d).join(',');
      out.docH = document.documentElement.scrollHeight; out.winH = innerHeight;
      const s = document.querySelector('.syms'); out.syms = s ? s.textContent : 'none';
      return out;
    });
    console.log(n, JSON.stringify(r));
    await p.screenshot({ path: `shots/care-${n}.png` });
    // apap を 使ってみる(ぴったり)
    const hp = await p.evaluate(async () => { S.run.hp = 5; B.ap = 3; const before = S.run.hp; await useDrug('apap'); return [before, S.run.hp]; }).catch(e => 'err ' + e.message);
    console.log(n, 'apap hp', JSON.stringify(hp));
    await c.close();
  }
  console.log('errors', errs.length, errs.slice(0, 3));
  await b.close();
})();
