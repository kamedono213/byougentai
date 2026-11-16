// PWA用アイコン: 紺の地に、インフルエンザウイルスと カプセル。Playwright で撮る。
// 実行: node tools/make-icons.js
const { chromium } = require('C:/Users/user/Desktop/自作ゲーム/2_カードゲーム/DigimonCard/node_modules/playwright');
const path = require('path'), fs = require('fs');
const vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, '../src/art.js'), 'utf8') + '\nthis.svg = ART.patho(P.flu, 3, 100);', ctx);
const out = path.join(__dirname, '../app/icons');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  for (const [name, size, pad] of [['icon-192.png', 192, 0.08], ['icon-512.png', 512, 0.08], ['maskable-512.png', 512, 0.2], ['apple-touch-icon.png', 180, 0.08]]) {
    await p.setViewportSize({ width: size, height: size });
    const u = size * (1 - pad * 2) / 100;
    await p.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0"><div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 50% 30%,#2b5a8f,#0e1a2b);display:grid;place-items:center">
      <div style="position:relative;width:${u * 100}px;height:${u * 100}px">
        <div style="position:absolute;left:${u * 6}px;top:${u * 4}px;width:${u * 74}px;height:${u * 74}px">${ctx.svg.replace('width="100" height="100"', `width="${u * 74}" height="${u * 74}"`)}</div>
        <div style="position:absolute;left:${u * 46}px;top:${u * 62}px;width:${u * 52}px;height:${u * 22}px;border-radius:${u * 11}px;overflow:hidden;transform:rotate(-30deg);box-shadow:0 ${u * 2}px 0 #0007;display:flex"><i style="flex:1;background:#fff"></i><i style="flex:1;background:#ff8a3d"></i></div>
      </div></div>`);
    await p.screenshot({ path: path.join(out, name), clip: { x: 0, y: 0, width: size, height: size } });
  }
  await b.close(); console.log('icons written');
})();
