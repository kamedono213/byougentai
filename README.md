# やっつけ!びょうげんたい

病原体(本物の名前)を、薬(本物の名前)でやっつけながら、病原体と薬の名前・相性を自然に覚えるローグライクゲーム。
子ども向けの研修(チュートリアル)から始まり、ステージが進むほど本格的になる(検査でわかることが 名前→分類→グラム染色 と減り、耐性菌・併用・抗菌薬の適正使用が出てくる)。

- 公開: https://kamedono213.github.io/byougentai/
- 作り: `src/`(data・art・main・cloud)→ `node tools/assemble.js` で `app/app.js` → `node D:\onze.ltd\tools\furigana\make-furi.js .` → `node tools/build-pages.js` で `docs/`
- 自動の通しプレイ: `node serve.js` を起動して `node tools/playtest.js 3 smart`(結果とスクショは `shots/`)
- 記録のクラウド保存: Firebase Realtime Database `byougenSaves/<ID>`(ルールは DigimonCard の firebase.rules.json)
- 相性の根拠: `SOURCES.md`
