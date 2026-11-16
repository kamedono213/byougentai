// ---------- 場面ごとの 効果音(Web Audio で その場で 作る。音声ファイルは 使わない)
// うまくいった時ほど 気持ちいい音に。SE の「音あり/なし」に したがう
const SFX = (() => {
  let ctx = null, master = null;
  const ac = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  // 1つの音: 波の形・高さ(Hz)・始まり・長さ・大きさ・高さの変化
  function tone(type, f, t0, dur, vol = 0.3, f2 = null, delay = 0) {
    const c = ac(), t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    if (delay) { const d = c.createDelay(); d.delayTime.value = delay; const fb = c.createGain(); fb.gain.value = 0.25; g.connect(d); d.connect(fb); fb.connect(d); fb.connect(master); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.2, f1 = 800, f2 = 3000, type = 'bandpass') {
    const c = ac(), t = c.currentTime + t0, len = Math.max(1, c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = 1;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // MIDIの番号 → Hz
  const arp = (notes, step, type = 'triangle', vol = 0.25, len = 0.25, delay = 0) => notes.forEach((n, i) => tone(type, N(n), i * step, len, vol, null, delay));
  const SOUNDS = {
    hit: () => { noise(0, 0.12, 0.35, 2000, 300, 'lowpass'); tone('square', 220, 0, 0.1, 0.15, 110); },                       // 効いた
    hitSoft: () => { noise(0, 0.08, 0.2, 1200, 400, 'lowpass'); },                                                           // 効きにくい
    best: () => { tone('sine', N(84), 0, 0.12, 0.2); arp([72, 76, 79, 84, 88], 0.06, 'triangle', 0.28, 0.35, 0.12); noise(0.3, 0.5, 0.12, 6000, 12000, 'highpass'); [0.32, 0.42, 0.52].forEach((d, i) => tone('sine', N(96 + i * 2), d, 0.18, 0.08)); }, // こうかばつぐん!
    miss: () => { tone('sawtooth', 160, 0, 0.32, 0.18, 110); tone('sawtooth', 150, 0.03, 0.3, 0.12, 100); },                  // ブッブー(効かない)
    kill: () => { noise(0, 0.15, 0.3, 300, 3000); tone('sine', N(79), 0.05, 0.12, 0.25); arp([84, 91], 0.08, 'triangle', 0.22, 0.3, 0.1); }, // ポンッ キラン
    hurt: () => { tone('sine', 140, 0, 0.25, 0.4, 60); noise(0, 0.12, 0.2, 600, 150, 'lowpass'); },                          // こうげきを うけた
    heal: () => arp([67, 71, 74, 79], 0.07, 'sine', 0.2, 0.35, 0.1),                                                          // 回復
    guard: () => { tone('triangle', N(74), 0, 0.15, 0.2); tone('triangle', N(81), 0.06, 0.25, 0.18); },
    drug: () => { tone('sine', 660, 0, 0.06, 0.15, 990); noise(0.02, 0.1, 0.12, 3000, 6000, 'highpass'); },                // 薬を 使った(シュッ)
    select: () => tone('sine', 880, 0, 0.05, 0.12),
    test: () => { [0, 0.09, 0.18].forEach((d, i) => tone('square', 1200 + i * 200, d, 0.06, 0.08)); tone('sine', 1760, 0.3, 0.2, 0.12); }, // ピピピ…ピーン
    reveal: () => arp([76, 79, 83, 88], 0.05, 'triangle', 0.2, 0.3, 0.1),                                                   // 正体が わかった
    newFoe: () => { tone('sawtooth', N(57), 0, 0.18, 0.15); tone('sawtooth', N(60), 0.18, 0.18, 0.15); tone('sawtooth', N(64), 0.36, 0.4, 0.15); }, // ジャジャーン
    learn: () => { arp([72, 76, 79], 0.1, 'triangle', 0.25, 0.3); arp([84, 88, 91, 96], 0.07, 'sine', 0.2, 0.4, 0.15); },    // 新しい薬
    win: () => { arp([67, 72, 76, 79], 0.09, 'square', 0.12, 0.2); tone('triangle', N(84), 0.4, 0.6, 0.25, null, 0.15); },    // やっつけた!
    coin: () => { tone('square', N(88), 0, 0.07, 0.12); tone('square', N(93), 0.07, 0.25, 0.12); },                          // コイン
    clear: () => { const m = [72, 72, 72, 76, 79, 76, 79, 84]; const tt = [0, .12, .24, .36, .6, .78, .9, 1.1]; m.forEach((n, i) => tone('square', N(n), tt[i], i === 7 ? 0.8 : 0.16, 0.13)); [60, 64, 67].forEach(n => tone('triangle', N(n), 1.1, 0.9, 0.12)); }, // ステージクリア
    rankS: () => { arp([79, 83, 86, 91, 95, 98], 0.05, 'sine', 0.2, 0.5, 0.15); noise(0.3, 0.9, 0.1, 8000, 14000, 'highpass'); },
    siren: () => { for (let i = 0; i < 3; i++) { tone('sawtooth', 700, i * 0.4, 0.2, 0.12, 1000); tone('sawtooth', 1000, i * 0.4 + 0.2, 0.2, 0.12, 700); } }, // 重症化!
    saved: () => { arp([60, 64, 67, 72, 76, 79, 84], 0.06, 'triangle', 0.2, 0.4, 0.12); },                                   // 正しい 対処
    bad: () => { tone('triangle', N(64), 0, 0.3, 0.2); tone('triangle', N(60), 0.25, 0.3, 0.2); tone('triangle', N(55), 0.5, 0.6, 0.2); }, // しっぱい
    deesc: () => { arp([79, 84, 88], 0.08, 'sine', 0.22, 0.3, 0.1); tone('triangle', N(91), 0.26, 0.5, 0.2, null, 0.15); },
    turn: () => tone('sine', 520, 0, 0.08, 0.1, 780),                                                                         // ターン終了
    ach: () => { arp([88, 91, 96], 0.07, 'square', 0.1, 0.18); noise(0.2, 0.4, 0.08, 8000, 12000, 'highpass'); },
  };
  return { play(n) { try { if (SE.muted || !SOUNDS[n]) return; SOUNDS[n](); } catch (e) { /* 音が出なくても 遊べる */ } } };
})();
