// むげん病院 2〜3幕の むずかしさ と 症状の波
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const clear = () => p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.remove()));
  const setup = (act, foes) => p.evaluate(async ([act, foes]) => {
    S.tut = 99; save(); B = null;
    const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act, coins: 40, items: [], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu', 'apap', 'ctrx'], scn: 'winter', bossId: 'flu', cond: [], condKnown: true, abg: {} }); R.map = makeMap(9); S.run = R; save();
    startBattle({ foes, node: 'battle' }); await new Promise(r => setTimeout(r, 1400)); document.querySelectorAll('.ov').forEach(o => o.remove()); B.ap = 9; renderBattle();
  }, [act, foes]);
  // 2幕: 血液検査は 数字+基準
  await setup(2, ['strep']);
  console.log('act2 blood', await p.evaluate(async () => { B.tgt = 0; const pr = doTestKind('blood'); await new Promise(r => setTimeout(r, 200)); document.querySelectorAll('.ov').forEach(o => o.remove()); return B.foes[0].info.lines.join(' / '); }));
  // 3幕: 基準なし
  await setup(3, ['flu']);
  console.log('act3 blood', await p.evaluate(async () => { B.tgt = 0; doTestKind('blood'); await new Promise(r => setTimeout(r, 200)); document.querySelectorAll('.ov').forEach(o => o.remove()); return B.foes[0].info.lines.join(' / '); }));
  // 迅速検査の にせ陰性(何回か ためす)
  let neg = 0;
  for (let i = 0; i < 12; i++) { await setup(2, ['flu']); neg += await p.evaluate(async () => { B.turn = 1; doTestKind('rapid'); await new Promise(r => setTimeout(r, 150)); document.querySelectorAll('.ov').forEach(o => o.remove()); return B.foes[0].k === 3 ? 0 : 1; }); }
  console.log('rapid false-neg', neg, '/ 12');
  // 培養は 次の日
  await setup(2, ['ecoli']);
  const cu = await p.evaluate(async () => { B.tgt = 0; doTestKind('culture'); await new Promise(r => setTimeout(r, 300)); document.querySelectorAll('.ov').forEach(o => o.remove()); const k0 = B.foes[0].k, at = B.foes[0].cultAt; B.busy = false; { const pt = playerTurn(); for (let z = 0; z < 8; z++) { await new Promise(r => setTimeout(r, 120)); document.querySelectorAll('.ov button').forEach(x => x.click()); } } await new Promise(r => setTimeout(r, 400)); document.querySelectorAll('.ov').forEach(o => o.remove()); return { k0, at, k1: B.foes[0].k, last: B.foes[0].info.lines.slice(-2).join(' / ') }; });
  console.log('culture', JSON.stringify(cu));
  // 症状の波
  await setup(1, ['flu']);
  const fl = await p.evaluate(async () => { let tries = 0; do { B.flare = null; B.busy = false; { const pt = playerTurn(); for (let z = 0; z < 8; z++) { await new Promise(r => setTimeout(r, 120)); document.querySelectorAll('.ov button').forEach(x => x.click()); } } document.querySelectorAll('.ov').forEach(o => o.remove()); tries++; } while (!B.flare && tries < 10); const f0 = B.flare; B.ap = 9; B.mode = 'care'; renderBattle(); const chip = document.querySelector('.syms .flare') ? document.querySelector('.syms .flare').textContent : 'none'; const care = Object.keys(CARE_FOR).find(id => CARE_FOR[id].includes(f0) && has(id) && careFit(D[id]) === 2); if (care) await useDrug(care); return { flare: f0, chip, care, ok: B.flareOk }; });
  console.log('flare', JSON.stringify(fl));
  await p.screenshot({ path: 'shots/flare.png' });
  // 放っておくと へる
  const fl2 = await p.evaluate(async () => { let tries = 0; do { B.flare = null; B.busy = false; { const pt = playerTurn(); for (let z = 0; z < 8; z++) { await new Promise(r => setTimeout(r, 120)); document.querySelectorAll('.ov button').forEach(x => x.click()); } } document.querySelectorAll('.ov').forEach(o => o.remove()); tries++; } while (!B.flare && tries < 10); const hp0 = S.run.hp; B.busy = false; { const pt = playerTurn(); for (let z = 0; z < 8; z++) { await new Promise(r => setTimeout(r, 120)); document.querySelectorAll('.ov button').forEach(x => x.click()); } } document.querySelectorAll('.ov').forEach(o => o.remove()); return { lost: hp0 - S.run.hp }; });
  console.log('flare ignored', JSON.stringify(fl2));
  // 敵の数(3幕)
  console.log('foes per battle act1/act3', await p.evaluate(() => { const cnt = act => { S.run.act = act; let n = 0; for (let i = 0; i < 300; i++) n += pickFoes(SC.winter.pool, 5).length; return (n / 300).toFixed(2); }; return cnt(1) + ' / ' + cnt(3); }));
  await setup(1, ['anisakis']);
  const an = await p.evaluate(async () => { B.consulted = false; B.ap = 3; consult(); await new Promise(r => setTimeout(r, 300)); [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes('アニサキス')).click(); await new Promise(r => setTimeout(r, 400)); const opts = [...document.querySelectorAll('.ov button')].map(x => x.textContent.trim()); const ok = [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes('内視鏡')); if (ok) ok.click(); await new Promise(r => setTimeout(r, 300)); return { opts, got: S.run.deck.includes('endo') }; });
  console.log('anisakis', JSON.stringify(an));
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
