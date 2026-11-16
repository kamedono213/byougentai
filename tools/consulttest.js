// 専門医に 相談: 正解の ルート と まちがいの ルート
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const c = await b.newContext({ viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:5411/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  const setup = async pid => p.evaluate(async pid => {
    S.tut = 99; save();
    const R = newRun(0, 0); Object.assign(R, { stage: 9, asc: 0, act: 1, coins: 40, items: [], mod: {}, deck: ['pen', 'osel', 'sleep', 'ors', 'okayu'], scn: SCN[0].id, bossId: SCN[0].boss[0] }); S.run = R; save();
    startBattle({ foes: [pid], node: 'battle' }); await new Promise(r => setTimeout(r, 1200));
    document.querySelectorAll('.ov').forEach(o => o.remove()); B.ap = 3; B.consulted = false; renderBattle();
  }, pid);
  const clickBy = async fn => { await p.waitForSelector('.ov button'); await p.waitForTimeout(250); await p.evaluate(fn); await p.waitForTimeout(300); };
  // 正解ルート(大腸菌など 細菌)
  await setup('ecoli');
  await p.evaluate(() => { consult(); });
  await p.waitForTimeout(400); await p.screenshot({ path: 'shots/consult-q1.png' });
  await clickBy(() => { const pj = P[B.foes[0].pid].ja; [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes(pj)).click(); });
  await p.waitForTimeout(300); await p.screenshot({ path: 'shots/consult-q2.png' });
  await clickBy(() => { const p0 = P[B.foes[0].pid]; const ok = DRUGS.filter(d => effOf(d, p0) === 2).map(d => d.ja); [...document.querySelectorAll('.ov button')].find(x => ok.some(n => x.textContent.includes(n))).click(); });
  await p.waitForTimeout(300);
  const r1 = await p.evaluate(() => ({ k: B.foes[0].k, deck: S.run.deck.join(','), ap: B.ap, ov: document.querySelector('.ov b') && document.querySelector('.ov b').textContent }));
  console.log('right', JSON.stringify(r1));
  await clickBy(() => document.querySelector('.ov button').click());
  // 2回目は できない
  const again = await p.evaluate(async () => { await consult(); return document.querySelector('.toast') && document.querySelector('.toast').textContent; });
  console.log('again', again);
  // まちがいルート
  await setup('ecoli');
  await p.evaluate(() => { consult(); });
  await clickBy(() => { const pj = P[B.foes[0].pid].ja; [...document.querySelectorAll('.ov button')].find(x => !x.textContent.includes(pj)).click(); });
  const r2 = await p.evaluate(() => ({ k: B.foes[0].k, deck: S.run.deck.join(','), ov: document.querySelector('.ov b') && document.querySelector('.ov b').textContent }));
  console.log('wrong', JSON.stringify(r2));
  // 特効薬の ない 相手(ノロ)
  await setup('noro');
  await p.evaluate(() => { consult(); });
  await clickBy(() => { [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes('ノロ')).click(); });
  await p.waitForTimeout(300); await p.screenshot({ path: 'shots/consult-self.png' });
  await clickBy(() => { [...document.querySelectorAll('.ov button')].find(x => x.textContent.includes('ささえ')).click(); });
  const r3 = await p.evaluate(() => document.querySelector('.ov b') && document.querySelector('.ov b').textContent);
  console.log('self', r3);
  console.log('errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
