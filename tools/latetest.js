// 後半の 状態(おまもり たくさん・アイテム3・条件・症状の波・敵3体)で 画面が 使いやすいか
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const SIZES = [['se2', 375, 553], ['sense9', 412, 760]];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [n, w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
    await p.evaluate(async () => {
      S.tut = 99; save();
      const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 3, coins: 140, items: ['hint', 'drink', 'rapid'], mod: {}, deck: DRUGS.filter(d => !d.endless).slice(0, 30).map(d => d.id).concat(['sleep', 'ors', 'okayu', 'apap', 'humid']), scn: 'icu', bossId: 'mrsa', cond: ['kidney', 'elder', 'pcal'], condKnown: true, relics: RELICS.slice(0, 10).map(r => r.id), immLv: 2 });
      R.abg = rollAbg(); R.map = makeMap(9); R.fl = 6; S.run = R; save();
      startBattle({ foes: ['ecoli', 'pneumo', 'staph'], node: 'battle' }); await new Promise(r => setTimeout(r, 1500)); document.querySelectorAll('.ov').forEach(o => o.remove());
      B.foes.forEach((f, i) => { B.tgt = i; doTestKind('blood'); doTestKind('ask'); }); document.querySelectorAll('.ov').forEach(o => o.remove());
      B.flare = 'fever'; B.tgt = 0; B.ap = 3; B.busy = false; renderBattle();
    });
    await p.waitForTimeout(400); await p.screenshot({ path: `shots/late-${n}-rx.png` });
    const m = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, winH: innerHeight, drugsH: Math.round(document.querySelector('.drugs').getBoundingClientRect().height), leftH: Math.round(document.querySelector('.sceneleft').getBoundingClientRect().height), sceneH: Math.round(document.querySelector('.scene').getBoundingClientRect().height) }));
    console.log(n, 'battle', JSON.stringify(m));
    await p.evaluate(() => { B.karte = true; renderBattle(); }); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/late-' + n + '-karte.png' }); await p.evaluate(() => { B.karte = false; B.mode = 'care'; dealCells(); renderBattle(); }); await p.waitForTimeout(300); await p.screenshot({ path: `shots/late-${n}-care.png` });
    await p.evaluate(() => { B.karte = true; renderBattle(); document.querySelector('[data-bag]').click(); }); await p.waitForTimeout(300); await p.screenshot({ path: `shots/late-${n}-bag.png` });
    await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
    await p.evaluate(() => { B.tgt = 0; B.foes[0].info.blood = 0; doTestKind('blood'); }); await p.waitForTimeout(400); await p.screenshot({ path: `shots/late-${n}-blood.png` });
    await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
    await p.evaluate(() => { B = null; mapScreen(); }); await p.waitForTimeout(400); await p.screenshot({ path: `shots/late-${n}-map.png` });
    await p.evaluate(() => { void eventScreen(); }); await p.waitForTimeout(400); await p.screenshot({ path: `shots/late-${n}-event.png` });
    await c.close();
  }
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
