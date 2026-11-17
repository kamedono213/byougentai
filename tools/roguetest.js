// むげん病院の 新しい しくみ: 条件・耐性表・ミステリーボス・ビルド・返却・ささえる切替・短いバトル
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const run = (fn, arg) => p.evaluate(fn, arg);
  await run(() => { S.tut = 99; save(); const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 40, items: [], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu', 'amox', 'ctrx', 'gm', 'loxo'], scn: 'school', bossId: 'flu' }); R.abg = rollAbg(); R.cond = ['pcal', 'child']; R.condKnown = false; R.map = makeMap(9); S.run = R; save(); });
  console.log('abg', await run(() => JSON.stringify(S.run.abg)));
  // 条件: ペニシリンアレルギー
  const t1 = await run(async () => { startBattle({ foes: ['strep'], node: 'battle' }); await new Promise(r => setTimeout(r, 1500)); document.querySelectorAll('.ov').forEach(o => o.remove()); B.ap = 3; renderBattle(); const chips = document.querySelector('.conds') ? document.querySelector('.conds').textContent : 'none'; const hp0 = S.run.hp, fhp0 = B.foes[0].hp; await useDrug('pen'); return { chips, hpLoss: hp0 - S.run.hp, foeDmg: fhp0 - B.foes[0].hp, known: S.run.condKnown }; });
  console.log('pcal', JSON.stringify(t1));
  await p.screenshot({ path: 'shots/rogue-cond.png' });
  // ささえるへ いつでも
  console.log('toCare button', await run(() => { B.mode = 'rx'; B.busy = false; renderBattle(); return !!document.querySelector('#toCare'); }));
  // 耐性: strep に 耐性を つけて 使う
  const t2 = await run(async () => { document.querySelectorAll('.ov').forEach(o => o.remove()); B.ap = 3; B.busy = false; B.foes[0].rd = 'ctrx'; const hp0 = B.foes[0].hp; await useDrug('ctrx'); return { foeDmg: hp0 - B.foes[0].hp, rdKnown: B.foes[0].rdKnown }; });
  console.log('abg resist', JSON.stringify(t2));
  // ミステリーボス
  const t3 = await run(async () => { document.querySelectorAll('.ov').forEach(o => o.remove()); B = null; startBattle({ foes: ['flu'], node: 'boss' }); await new Promise(r => setTimeout(r, 1200)); const has = [...document.querySelectorAll('.ov b')].map(x => x.textContent).join('|'); document.querySelectorAll('.ov').forEach(o => o.remove()); await new Promise(r => setTimeout(r, 600)); document.querySelectorAll('.ov').forEach(o => o.remove()); const f = B.foes[0]; renderBattle(); const n0 = document.querySelector('.foe .note').textContent; B.tgt = 0; doTestKind('rapid'); const k1 = f.k; doTestKind('ask'); const k2 = f.k; return { modal: has, myst: f.myst, decoy: f.decoy, noteBefore: n0, k1, k2 }; });
  console.log('myst', JSON.stringify(t3));
  await p.screenshot({ path: 'shots/rogue-myst.png' });
  // 耐性表の 小窓
  await run(() => { document.querySelectorAll('.ov').forEach(o => o.remove()); void abgModal(); }); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/rogue-abg.png' });
  await run(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
  // からだづくり 返却
  const t4 = await run(async () => { B = null; S.meta = { pt: 200, lv: {} }; save(); metaScreen(); document.querySelector('[data-m="run"]').click(); await new Promise(r => setTimeout(r, 100)); document.querySelector('[data-m="run"]').click(); await new Promise(r => setTimeout(r, 100)); const mid = S.meta.pt; document.querySelector('[data-mr="run"]').click(); await new Promise(r => setTimeout(r, 100)); return { afterBuy2: mid, afterRefund1: S.meta.pt, lv: S.meta.lv.run }; });
  console.log('meta', JSON.stringify(t4));
  await p.screenshot({ path: 'shots/rogue-meta.png' });
  // 敵の 体力(短く)
  console.log('hp strep stage9 vs stage1', await run(() => { const a = scaleFoe('strep', 'battle').hp; S.run.stage = 1; const b2 = scaleFoe('strep', 'battle').hp; S.run.stage = 9; return a + ' vs ' + b2; }));
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
