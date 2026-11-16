// ---------- 重症化イベント(バトルのあと、条件しだいで 確率で おきる。その場で 対処を えらぶ)
// 対処は 実際の 臨床の 考え方に そろえている(薬の量は 書かない)。docs: SOURCES.md
const SEVERE = [
  { id: 'anaphy', ja: 'アナフィラキシー', when: o => o.betaLactam, base: 0.05,
    text: '薬を 使った あと、急に 全身に じんましん。ゼーゼーして、顔色が 悪い。血圧も 下がってきた!',
    vital: '血圧 低下 ・ 呼吸 ゼーゼー ・ 全身の じんましん',
    choices: [['アドレナリンを 太ももの外側に 筋肉注射', 1], ['かゆみ止め(抗ヒスタミン薬)を 飲ませて 様子をみる', 0], ['ねかせて しばらく 様子をみる', 0]],
    ok: 'アナフィラキシーは、まず アドレナリンの 筋肉注射が いちばん大事。足を 上げて ねかせ、酸素や 点滴も 用意する。原因の 薬は この先 使わない。',
    ng: 'アナフィラキシーでは、かゆみ止めや 様子見では 間に合わないことがある。まず アドレナリンの 筋肉注射。' },
  { id: 'sepsis', ja: '敗血症', when: o => o.bac && o.low, base: 0.25,
    text: '細菌が 血液に 入って 全身に 広がってきた。意識が ぼんやりして、呼吸が 速い。血圧も 下がってきた。',
    vital: '意識 ぼんやり ・ 呼吸が 速い ・ 血圧 低下(qSOFA 3点)',
    choices: [['血液培養を 2セット とってから、すぐに 抗菌薬と 点滴', 1], ['培養の 結果が 出るまで 抗菌薬を 待つ', 0], ['熱さましを 使って 様子をみる', 0]],
    ok: '敗血症は 時間との 勝負。血液培養を とったら、できるだけ早く(1時間を めやすに)抗菌薬と 点滴を 始める。結果が 出たら 薬を しぼる。',
    ng: '敗血症で 抗菌薬が おくれると 命に かかわる。培養を とったら、すぐ 抗菌薬と 点滴。' },
  { id: 'dehyd', ja: 'ひどい 脱水', when: o => o.gi, base: 0.2,
    text: 'げりと はくのが 止まらない。ぐったりして、半日 おしっこが 出ていない。口の中も カラカラ。',
    vital: 'ぐったり ・ おしっこが 出ない ・ 脈が 速い',
    choices: [['点滴(輸液)で 水分と 塩分を 入れる', 1], ['げり止めを 飲ませる', 0], ['ジュースを 少しずつ 飲ませる', 0]],
    ok: '軽い 脱水なら 経口補水液で よいが、ぐったりして 飲めない・おしっこが 出ない ほどなら 点滴(輸液)。感染性の げりに げり止めは ふつう 使わない(菌や 毒を 出せなくなる)。',
    ng: 'ここまで ひどい 脱水は 点滴(輸液)が 必要。感染性の げりに げり止めは ふつう 使わない。' },
  { id: 'enceph', ja: 'インフルエンザ脳症の うたがい', when: o => o.flu && o.kid, base: 0.12,
    text: '熱が 出て すぐ、子どもが「へんな ものが 見える」と 言いだし、よびかけへの 反応が にぶい。けいれんも おきた。',
    vital: '意識が おかしい ・ 異常な ことば ・ けいれん',
    choices: [['すぐに 救急車をよび、大きな 病院で 治療', 1], ['解熱剤を 追加して ねかせる', 0], ['朝まで 様子をみる', 0]],
    ok: '意識が おかしい・けいれん・おかしな言動が 続く時は、脳症の おそれ。すぐ 救急へ。インフルエンザの時は 子どもを ひとりに しないことも 大事。',
    ng: '意識の 変化や けいれんは 様子見しては いけない サイン。すぐ 救急へ。' },
  { id: 'resp', ja: '呼吸不全', when: o => o.lung && o.low, base: 0.2,
    text: '肺の 炎症が 強くなって、息が とても くるしそう。くちびるが 少し 青い。',
    vital: 'SpO2(血液中の 酸素) 88% ・ 呼吸が 速い',
    choices: [['酸素を すう(酸素投与)', 1], ['せき止めを 飲ませる', 0], ['熱さましを 使う', 0]],
    ok: '血液中の 酸素が 足りない時は、まず 酸素投与。足りなければ 人工呼吸器も 考える。',
    ng: '酸素が 足りない時に まず 必要なのは 酸素投与。せき止めや 熱さましでは 酸素は ふえない。' },
  { id: 'postflu', ja: 'インフルエンザのあとの 肺炎', when: o => o.flu && !o.kid, base: 0.15,
    text: 'インフルエンザが 治りかけたのに、また 高い熱。黄色い たんが からむ せきが 出てきた。',
    vital: '熱 再上昇 ・ 黄色い たん ・ 呼吸が 速い',
    choices: [['胸のレントゲンと たんの グラム染色を して、細菌の 肺炎の 治療', 1], ['タミフルを もう一度 飲ませる', 0], ['インフルエンザの なごりなので 様子をみる', 0]],
    ok: 'インフルエンザの あとは、肺炎球菌や 黄色ブドウ球菌などの 細菌の 肺炎が おきやすい。検査で 確かめて 抗菌薬で 治療する。',
    ng: '一度 よくなってから また 悪くなるのは、細菌の 肺炎の サイン。検査して 抗菌薬を 考える。' },
  { id: 'malaria_sev', ja: '重症マラリア', when: o => o.malaria, base: 0.3,
    text: 'マラリアの 治療中、意識が にぶくなり、白目が 黄色くなってきた。',
    vital: '意識障害 ・ 黄だん ・ 血液中の 原虫が とても多い',
    choices: [['集中治療室で、アルテスネートの 注射に 切りかえる', 1], ['今の 飲み薬を 続ける', 0], ['解熱剤で 熱を 下げる', 0]],
    ok: '重症マラリアは 注射の アルテスネートで、集中治療室で 治療する。熱帯熱マラリアは 急に 悪くなるので 要注意。',
    ng: '意識障害などが ある 重症マラリアは、注射の 薬と 集中治療が 必要。' },
];
// その バトルの ようすから、重症化しやすい 条件を あつめる
function severeCheck() {
  const R = S.run; if (!R || !R.stage || !B || B.o.tut) return null;
  const pids = B.foes.map(f => P[f.pid].base || f.pid);
  const sg = SG(R);
  const o = {
    kid: sg.patient === 'kid', bac: B.foes.some(f => P[f.pid].cat === 'bac'),
    gi: pids.some(id => ['noro', 'campy', 'cholera', 'giardia', 'typhoid', 'amoeba', 'cdiff'].includes(id)),
    flu: pids.includes('flu'), lung: pids.some(id => ['pneumo', 'myco', 'covid', 'rsv', 'pcp', 'legion', 'pseudo', 'flu'].includes(id)),
    malaria: pids.includes('malaria'), betaLactam: B.usedIds && [...B.usedIds].some(id => /ペニシリン|セフェム|カルバペネム/.test(D[id].cls)),
    low: R.hp < R.max * 0.45,
  };
  // 重症化しやすさ: 体力が 少ない・善玉菌が 少ない・生活の みだれ(めんえきダウン)・お年より・むげん病院の 幕
  let risk = (o.low ? 0.15 : 0) + (R.gut <= 3 ? 0.08 : 0) + (B.immDown > 0 ? 0.1 : 0) + (sg.patient === 'gpa' ? 0.06 : 0) + (R.stage === 9 ? Math.min(0.1, (R.act || 1) * 0.01) : 0) + R.asc * 0.02;
  const can = SEVERE.filter(s => s.when(o));
  for (const s of shuffle(can)) if (Math.random() < Math.min(0.5, s.base * (s.id === 'anaphy' ? 1 : 0.5) + (s.id === 'anaphy' ? 0 : risk))) return s;
  return null;
}
async function severeEvent() {
  const s = severeCheck(); if (!s) return;
  const R = S.run; SFX.play('siren'); st('severe');
  const ch = shuffle(s.choices);
  const i = await modal(`<b class="big">🚨 重症化! ${s.ja}</b><p>${s.text}</p><p class="vital">📟 ${s.vital}</p><p>どうする?</p>`, ch.map(c => c[0]));
  const good = ch[i] && ch[i][1];
  if (good) { R.hp = Math.max(1, R.hp - 2); R.coins += 10; st('severeOk'); SFX.play('saved'); }
  else { const pen = Math.max(6, Math.round(R.max * 0.25)); R.hp = Math.max(1, R.hp - pen); R.wrong++; SFX.play('bad'); }
  S.seenSevere = Object.assign({}, S.seenSevere, { [s.id]: 1 });
  save();
  await modal(`<b class="big">${good ? '✅ 正しい対処!' : '❌ 対処が おくれた…'}</b><p>${good ? s.ok : s.ng}</p>${good ? '<p class="note">患者さんは もちなおした(体力 -2・🪙+10)</p>' : `<p class="note">患者さんの 体力が 大きく へった</p><p class="note">正解: ${s.choices.find(c => c[1])[0]}</p>`}<p class="note">※ ゲームの中の話。本当の治療は お医者さんが 決める。</p>`, ['OK']);
}
