/* =====================================================================
   AUDIO — todo sintetizado con Web Audio (sin archivos)
   ===================================================================== */
// Reverberaciones por espacio (impulsos generados): rt = segundos hasta -60 dB
const REVERBS = {
  exterior:  { dur: 1.1, rt: 0.5, pre: 0.018, damp: [0.5, 0.12], wet: 0.12, er: [[0.031, 0.5], [0.074, 0.32], [0.142, 0.2]] },
  entrance:  { dur: 2.0, rt: 1.25, pre: 0.008, damp: [0.75, 0.22], wet: 0.34, er: [[0.009, 0.55], [0.017, 0.45], [0.029, 0.35], [0.041, 0.25]] },
  stairwell: { dur: 2.8, rt: 1.9, pre: 0.011, damp: [0.8, 0.2], wet: 0.42, er: [[0.012, 0.5], [0.021, 0.42], [0.034, 0.3]], flutter: 0.0093, fb: 0.32 },
  corridor:  { dur: 1.4, rt: 0.8, pre: 0.006, damp: [0.6, 0.18], wet: 0.25, er: [[0.007, 0.5], [0.015, 0.35]] },
  hall:      { dur: 3.0, rt: 2.1, pre: 0.02, damp: [0.7, 0.18], wet: 0.4, er: [[0.023, 0.4], [0.047, 0.3], [0.071, 0.25]] },
  tunnel:    { dur: 4.0, rt: 3.0, pre: 0.025, damp: [0.55, 0.14], wet: 0.5, er: [[0.04, 0.4], [0.09, 0.3]], flutter: 0.0061, fb: 0.55 },
  atrium:    { dur: 5.5, rt: 4.6, pre: 0.045, damp: [0.7, 0.16], wet: 0.55, er: [[0.06, 0.35], [0.11, 0.28], [0.19, 0.2]] },
};
// Pisadas por superficie: frecuencia/Q del golpe, peso grave, punta, arrastre, extras
const STEPS = {
  tile:     { bp: 2700, q: 1.1, hp: 500, dur: 0.05, thumpF: 115, thump: 0.5, toe: 0.55, scuff: 0.06, vol: 0.34, wet: 0.8 },
  stone:    { bp: 1900, q: 0.9, hp: 300, dur: 0.055, thumpF: 95, thump: 0.6, toe: 0.5, scuff: 0.14, vol: 0.3, wet: 0.55, grit: 0.25 },
  concrete: { bp: 1400, q: 0.8, hp: 220, dur: 0.065, thumpF: 85, thump: 0.7, toe: 0.45, scuff: 0.28, vol: 0.32, wet: 0.6, grit: 0.5 },
  asphalt:  { bp: 1150, q: 0.7, hp: 160, dur: 0.06, thumpF: 80, thump: 0.6, toe: 0.4, scuff: 0.36, vol: 0.26, wet: 0.35, grit: 0.7 },
  metal:    { bp: 3100, q: 1.6, hp: 600, dur: 0.04, thumpF: 140, thump: 0.4, toe: 0.5, scuff: 0.04, vol: 0.32, wet: 0.75, ring: 1 },
  stair:    { bp: 2300, q: 1.0, hp: 300, dur: 0.06, thumpF: 98, thump: 0.95, toe: 0.3, scuff: 0.1, vol: 0.34, wet: 0.8 },
  tactile:  { bp: 2000, q: 0.9, hp: 350, dur: 0.05, thumpF: 100, thump: 0.6, toe: 0.6, scuff: 0.08, vol: 0.3, wet: 0.65, rattle: 1 },
  puddle:   { bp: 1700, q: 0.6, hp: 400, dur: 0.11, thumpF: 90, thump: 0.4, toe: 0.3, scuff: 0, vol: 0.3, wet: 0.6, splash: 1 },
};

function makeNoise(c, kind, secs) {
  const len = Math.floor(c.sampleRate * secs), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'white') d[i] = w;
    else if (kind === 'pink') {
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  }
  if (kind === 'brown') { const drift = d[len - 1] - d[0]; for (let i = 0; i < len; i++) d[i] -= drift * (i / len); }
  // fundido corto en el bucle para evitar clics
  const f = Math.min(2000, len >> 4); for (let i = 0; i < f; i++) { const k = i / f; d[len - 1 - i] = d[len - 1 - i] * k + d[i] * (1 - k); }
  return b;
}

const AudioSys = {
  ctx: null, ready: false, irCache: new Map(), curReverb: null, slot: 0,
  init() {
    if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = (this.ctx = new AC({ latencyHint: 'interactive' }));
    this.out = c.createGain();
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.knee.value = 10; this.comp.ratio.value = 4; this.comp.attack.value = 0.004; this.comp.release.value = 0.3;
    this.out.connect(this.comp); this.comp.connect(c.destination);
    this.analyser = c.createAnalyser(); this.analyser.fftSize = 2048; this.comp.connect(this.analyser);
    this.world = c.createGain(); this.world.gain.value = 0; this.world.connect(this.out);   // fundidos de mundo
    this.duckG = c.createGain(); this.duckG.connect(this.world);                          // silencio dinámico
    this.amb = c.createGain(); this.amb.connect(this.duckG);  // ambiente seco
    this.room = c.createGain(); this.room.connect(this.world); // tono de sala (no se atenúa)
    this.ambSend = c.createGain();                                                            // ambiente → reverb
    this.sfx = c.createGain(); this.sfx.connect(this.world);                                  // pisadas y acciones
    this.sfxSend = c.createGain();
    this.music = c.createGain(); this.music.connect(this.out);
    this.revIn = c.createGain(); this.duckS = c.createGain(); this.ambSend.connect(this.duckS); this.duckS.connect(this.revIn); this.sfxSend.connect(this.revIn);
    this.slots = [0, 1].map(() => { const g = c.createGain(); g.gain.value = 0; g.connect(this.world); return { conv: null, gain: g }; });
    this.white = makeNoise(c, 'white', 3); this.pink = makeNoise(c, 'pink', 5); this.brown = makeNoise(c, 'brown', 5);
    this.ready = true; this.applyVolumes();
  },
  applyVolumes() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.out.gain.setTargetAtTime(S.master * CONFIG.MASTER, t, 0.05);
    const a = S.ambient * CONFIG.AMBIENT_MULT;
    this.amb.gain.setTargetAtTime(a, t, 0.05); this.ambSend.gain.setTargetAtTime(a, t, 0.05); this.room.gain.setTargetAtTime(a, t, 0.05);
    this.sfx.gain.setTargetAtTime(CONFIG.FOOTSTEP_VOLUME, t, 0.05); this.sfxSend.gain.setTargetAtTime(CONFIG.FOOTSTEP_VOLUME, t, 0.05);
    this.music.gain.setTargetAtTime(S.musicOn ? S.music : 0, t, 0.3);
    Music.sync();
  },
  setWorld(v, tc = 0.3) { if (this.ready) this.world.gain.setTargetAtTime(v, this.ctx.currentTime, tc); },
  level() { // RMS de la salida (para pruebas)
    if (!this.ready) return 0; const a = new Float32Array(this.analyser.fftSize); this.analyser.getFloatTimeDomainData(a);
    let s = 0; for (const v of a) s += v * v; return Math.sqrt(s / a.length);
  },
  // ---------- Reverberación ----------
  getIR(name) {
    const key = name + '@' + Q.irMax; if (this.irCache.has(key)) return this.irCache.get(key);
    const P = REVERBS[name], c = this.ctx, sr = c.sampleRate, dur = Math.min(P.dur, Q.irMax), len = Math.ceil(sr * dur);
    const buf = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch), R = mulberry32(ch * 977 + name.length * 131 + 7), pre = Math.floor(P.pre * sr);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / sr, x = i / len;
        const env = Math.exp(-6.91 * t / P.rt) * (1 - smooth(0.82, 1, x));
        lp += lerp(P.damp[0], P.damp[1], Math.min(1, t / P.rt)) * ((R() * 2 - 1) - lp);
        d[i] = lp * env;
      }
      for (const [tt, gg] of P.er || []) { const k = Math.floor((tt + (ch ? 0.0013 : 0)) * sr); for (let j = 0; j < 24 && k + j < len; j++) d[k + j] += gg * (R() * 2 - 1) * Math.exp(-j / 6); }
      if (P.flutter) { const D = Math.floor(P.flutter * sr * (ch ? 1.07 : 1)); for (let i = D; i < len; i++) d[i] += d[i - D] * P.fb; }
    }
    this.irCache.set(key, buf); return buf;
  },
  setReverb(name, fade = 1.2) {
    if (!this.ready || !REVERBS[name]) return;
    if (name === this.curReverb) return; this.curReverb = name;
    const c = this.ctx, now = c.currentTime, old = this.slots[this.slot];
    this.slot ^= 1; const s = this.slots[this.slot];
    if (s.conv) { try { this.revIn.disconnect(s.conv); s.conv.disconnect(); } catch (e) { /* ya desconectado */ } }
    s.conv = c.createConvolver(); s.conv.buffer = this.getIR(name); this.revIn.connect(s.conv); s.conv.connect(s.gain);
    const ramp = (g, v) => { g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(v, now + fade); };
    ramp(s.gain, REVERBS[name].wet * CONFIG.REVERB_MULT); ramp(old.gain, 0);
  },
  resetReverb() { this.curReverb = null; },
  // ---------- Utilidades ----------
  loop(kind, rate = 1) { const s = this.ctx.createBufferSource(); s.buffer = this[kind]; s.loop = true; s.playbackRate.value = rate; s.start(0, Math.random() * (s.buffer.duration - 0.1)); return s; },
  filt(type, f, q = 0.707) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; },
  gain(v) { const g = this.ctx.createGain(); g.gain.value = v; return g; },
  panner(pos, ref = 1.2, roll = 1.3) {
    const p = this.ctx.createPanner();
    p.panningModel = Q.hrtf ? 'HRTF' : 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; p.maxDistance = 80;
    if (p.positionX) { p.positionX.value = pos[0]; p.positionY.value = pos[1]; p.positionZ.value = pos[2]; } else p.setPosition(pos[0], pos[1], pos[2]);
    return p;
  },
  env(g, t, peak, att, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + att + dec); },
  // Nodo temporal posicionado para sonidos sueltos (se desconecta solo)
  at(pos, send = 0.7, ref = 1.2) {
    const g = this.gain(1), p = this.panner(pos, ref, 1.2), s = this.gain(send);
    g.connect(p); p.connect(this.sfx); p.connect(s); s.connect(this.sfxSend);
    setTimeout(() => { try { g.disconnect(); p.disconnect(); s.disconnect(); } catch (e) { /* nada */ } }, 6000);
    return g;
  },
  toSfx(node, send) { node.connect(this.sfx); if (send > 0) { const s = this.gain(send); node.connect(s); s.connect(this.sfxSend); } },
  updateListener(cam) {
    if (!this.ready) return;
    const L = this.ctx.listener, p = cam.position;
    const f = _v.set(0, 0, -1).applyQuaternion(cam.quaternion), fx = f.x, fy = f.y, fz = f.z;
    const u = _v.set(0, 1, 0).applyQuaternion(cam.quaternion);
    if (L.positionX) {
      L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z;
      L.forwardX.value = fx; L.forwardY.value = fy; L.forwardZ.value = fz; L.upX.value = u.x; L.upY.value = u.y; L.upZ.value = u.z;
    } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(fx, fy, fz, u.x, u.y, u.z); }
  },
  // ---------- Emisores de ambiente ----------
  makeEmitter(def) {
    const c = this.ctx, em = { def, nodes: [], level: 1, update: null, dead: false };
    em.gain = (def.gain ?? 0.05) * (def.type === 'hum' || def.type === 'sign' ? CONFIG.HUM_VOLUME : 1);
    em.out = this.gain(0); em.send = this.gain(def.send ?? 0.6);
    const bus = def.type === 'roomtone' ? this.room : this.amb;
    if (def.pos) { em.panner = this.panner(def.pos, def.ref ?? 1.2, def.roll ?? 1.3); em.out.connect(em.panner); em.panner.connect(bus); em.panner.connect(em.send); }
    else { em.out.connect(bus); em.out.connect(em.send); }
    if (def.type === 'roomtone') em.send.gain.value = 0.15;
    em.send.connect(this.ambSend);
    (EMIT[def.type] || EMIT.hum)(this, em, def);
    em.out.gain.setTargetAtTime(em.gain, c.currentTime, 0.5);
    em.setLevel = (lv, tc = 0.012) => { em.level = lv; if (!em.dead) em.out.gain.setTargetAtTime(em.gain * lv, c.currentTime, tc); };
    em.stop = () => {
      if (em.dead) return; em.dead = true; em.out.gain.setTargetAtTime(0, c.currentTime, 0.08);
      setTimeout(() => { for (const n of em.nodes) { try { n.stop(); } catch (e) { /* ya parado */ } } try { em.out.disconnect(); em.send.disconnect(); if (em.panner) em.panner.disconnect(); } catch (e) { /* nada */ } }, 700);
    };
    return em;
  },
  // ---------- Pisadas ----------
  footstep(surface, o = {}) {
    if (!this.ready) return;
    const P = STEPS[surface] || STEPS.tile, t = this.ctx.currentTime + 0.004;
    const v = P.vol * rand(0.78, 1.12) * (o.run ? 1.4 : o.crouch ? 0.42 : 1);
    const pitch = rand(0.9, 1.1) * (o.crouch ? 0.85 : 1) * (o.run ? 1.08 : 1);
    const down = o.stairs === 'down';
    this.hit(t, P.bp * pitch, P.q, P.hp, P.dur * (o.run ? 0.85 : 1), v, P.wet);
    this.thump(t, P.thumpF * rand(0.88, 1.1), v * P.thump * (down ? 1.35 : 1) * (o.crouch ? 0.6 : 1));
    const t2 = t + (o.run ? rand(0.028, 0.048) : rand(0.055, 0.095));
    this.hit(t2, P.bp * pitch * 1.15, P.q, P.hp, P.dur * 0.7, v * P.toe * (down ? 0.6 : 1), P.wet);
    if (P.scuff > 0) this.scuff(t + rand(0, 0.03), P.bp * 0.55, v * P.scuff * (o.run ? 1.6 : 1), o.run ? 0.08 : 0.13, P.wet);
    if (P.grit) this.grit(t, v * P.grit, P.wet);
    if (P.ring) this.ring(t, v * 0.32, P.wet);
    if (P.splash) this.splash(t, v, P.wet);
    if (P.rattle) this.hit(t + rand(0.012, 0.025), 4300, 2, 2200, 0.015, v * 0.3, P.wet);
  },
  hit(t, bp, q, hp, dur, v, send) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.white; s.playbackRate.value = rand(0.85, 1.15);
    const f1 = this.filt('bandpass', bp, q), f2 = this.filt('highpass', hp), g = this.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.0015); g.gain.exponentialRampToValueAtTime(0.0003, t + dur);
    s.connect(f1); f1.connect(f2); f2.connect(g); this.toSfx(g, send); s.start(t, Math.random() * 2.5, dur + 0.05);
  },
  thump(t, f, v) {
    const c = this.ctx, o = c.createOscillator(), g = this.gain(0);
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.08);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.13);
    o.connect(g); this.toSfx(g, 0.2); o.start(t); o.stop(t + 0.16);
  },
  scuff(t, f, v, dur, send) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.white;
    const lp = this.filt('lowpass', f * rand(0.8, 1.2), 0.6), hp = this.filt('highpass', 300), g = this.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0003, t + dur);
    s.connect(lp); lp.connect(hp); hp.connect(g); this.toSfx(g, send * 0.6); s.start(t, Math.random() * 2.5, dur + 0.05);
  },
  grit(t, v, send) { for (let i = 0; i < 4; i++) this.hit(t + rand(0, 0.07), rand(3500, 6000), 2.5, 2500, 0.012, v * rand(0.15, 0.35), send * 0.5); },
  ring(t, v, send) {
    const f0 = rand(330, 520);
    [[1, 0.28, 0.3], [2.32, 0.16, 0.2], [4.25, 0.08, 0.12]].forEach(([m, dec, a]) => {
      const o = this.ctx.createOscillator(), g = this.gain(0); o.frequency.value = f0 * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0002, t + dec);
      o.connect(g); this.toSfx(g, send); o.start(t); o.stop(t + dec + 0.02);
    });
  },
  splash(t, v, send) {
    this.hit(t, 1400, 0.5, 300, 0.18, v * 0.9, send); this.hit(t + 0.04, 2400, 0.6, 600, 0.12, v * 0.5, send);
    for (let i = 0; i < 3; i++) {
      const tt = t + rand(0.02, 0.14), o = this.ctx.createOscillator(), g = this.gain(0), f = rand(500, 900);
      o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * rand(1.6, 2.4), tt + 0.03);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(v * 0.18, tt + 0.003); g.gain.exponentialRampToValueAtTime(0.0002, tt + 0.05);
      o.connect(g); this.toSfx(g, send); o.start(tt); o.stop(tt + 0.07);
    }
  },
  // ---------- Sonidos sueltos ----------
  click(dest, v = 0.3, f = 4200) {
    const c = this.ctx, t = c.currentTime + 0.005, s = c.createBufferSource(); s.buffer = this.white;
    const bp = this.filt('bandpass', f, 3), g = this.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0002, t + 0.012);
    s.connect(bp); bp.connect(g); g.connect(dest); s.start(t, Math.random(), 0.03);
  },
  flashClick(on) {
    if (!this.ready) return; const d = this.gain(1); this.toSfx(d, 0.15);
    this.click(d, 0.25, on ? 3800 : 3200); setTimeout(() => this.click(d, 0.12, 5200), 35);
  },
  rustle(v = 0.12) {
    if (!this.ready) return; const c = this.ctx, t = c.currentTime + 0.01, s = c.createBufferSource(); s.buffer = this.pink;
    const bp = this.filt('bandpass', 1300, 0.5), g = this.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.38);
    s.connect(bp); bp.connect(g); this.toSfx(g, 0.2); s.start(t, Math.random() * 4, 0.45);
  },
  metalHit(dest, t, v, f0 = 420) {
    const s = this.ctx.createBufferSource(); s.buffer = this.white;
    const bp = this.filt('bandpass', rand(1500, 2400), 3), g = this.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0002, t + 0.06);
    s.connect(bp); bp.connect(g); g.connect(dest); s.start(t, Math.random() * 2, 0.08);
    [[1, 0.18], [2.71, 0.1], [5.1, 0.05]].forEach(([m, dec]) => {
      const o = this.ctx.createOscillator(), og = this.gain(0); o.frequency.value = f0 * m * rand(0.97, 1.03);
      og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(v * 0.25, t + 0.002); og.gain.exponentialRampToValueAtTime(0.0002, t + dec);
      o.connect(og); og.connect(dest); o.start(t); o.stop(t + dec + 0.02);
    });
  },
  doorRattle(pos) {
    if (!this.ready) return; const d = this.at(pos, 0.8), t0 = this.ctx.currentTime + 0.01; let t = t0;
    for (let i = 0; i < randi(3, 5); i++) { this.metalHit(d, t, rand(0.25, 0.4), rand(380, 460)); t += rand(0.07, 0.14); }
    const o = this.ctx.createOscillator(), g = this.gain(0); o.frequency.setValueAtTime(75, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 0.2);
    this.env(g, t0 + 0.02, 0.35, 0.004, 0.25); o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 0.4);
  },
  shutterRattle(pos) {
    if (!this.ready) return; const d = this.at(pos, 0.9, 1.5), t0 = this.ctx.currentTime + 0.01; let t = t0;
    for (let i = 0; i < 18; i++) { this.metalHit(d, t, 0.22 * Math.exp(-i / 8) * rand(0.6, 1), rand(250, 340)); t += rand(0.02, 0.06); }
    const o = this.ctx.createOscillator(), g = this.gain(0); o.frequency.setValueAtTime(88, t0); o.frequency.exponentialRampToValueAtTime(70, t0 + 0.8);
    this.env(g, t0, 0.3, 0.01, 0.9); o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 1.1);
  },
  beep(pos) {
    if (!this.ready) return; const d = this.at(pos, 0.5), t = this.ctx.currentTime + 0.01;
    [[2093, 0], [1568, 0.16]].forEach(([f, dt]) => {
      const o = this.ctx.createOscillator(), lp = this.filt('lowpass', 3500), g = this.gain(0); o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.05, t + dt + 0.005); g.gain.setValueAtTime(0.05, t + dt + 0.09); g.gain.linearRampToValueAtTime(0, t + dt + 0.1);
      o.connect(lp); lp.connect(g); g.connect(d); o.start(t + dt); o.stop(t + dt + 0.12);
    });
  },
  tink(pos) { // re-encendido de un fluorescente
    if (!this.ready) return; const d = this.at(pos, 0.6), t = this.ctx.currentTime + 0.005;
    this.click(d, 0.18, 5000); this.metalHit(d, t + 0.01, 0.05, 1900);
  },
  drip(dest, t) {
    const o = this.ctx.createOscillator(), g = this.gain(0), f0 = rand(650, 1500);
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * rand(1.7, 2.5), t + 0.045);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rand(0.35, 0.7), t + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, t + rand(0.05, 0.09));
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.12);
    const s = this.ctx.createBufferSource(); s.buffer = this.white; const hp = this.filt('highpass', 3500), g2 = this.gain(0);
    this.env(g2, t, 0.12, 0.001, 0.006); s.connect(hp); hp.connect(g2); g2.connect(dest); s.start(t, Math.random(), 0.02);
  },
  carPass(dest) {
    const c = this.ctx, t = c.currentTime + 0.05, dur = rand(5, 9), dir = Math.random() < 0.5 ? -1 : 1;
    const s = this.loop('pink'), bp = this.filt('bandpass', 250, 0.9), lp = this.filt('lowpass', 1800), g = this.gain(0);
    bp.frequency.setValueAtTime(220, t); bp.frequency.linearRampToValueAtTime(rand(600, 1000), t + dur * 0.5); bp.frequency.linearRampToValueAtTime(200, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(rand(0.4, 0.8), t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const eng = c.createOscillator(), elp = this.filt('lowpass', 220), eg = this.gain(0.25); eng.type = 'sawtooth';
    const ef = rand(42, 70); eng.frequency.setValueAtTime(ef * 1.04, t); eng.frequency.linearRampToValueAtTime(ef * 0.95, t + dur);
    let out = g;
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.setValueAtTime(-0.85 * dir, t); p.pan.linearRampToValueAtTime(0.85 * dir, t + dur); g.connect(p); out = p; }
    s.connect(bp); bp.connect(lp); lp.connect(g); eng.connect(elp); elp.connect(eg); eg.connect(g); out.connect(dest);
    eng.start(t); s.stop(t + dur + 0.1); eng.stop(t + dur + 0.1);
  },
  distantTrain(dest) {
    const c = this.ctx, t = c.currentTime + 0.05, dur = rand(9, 14), pk = t + dur * rand(0.35, 0.55);
    const s = this.loop('brown'), lp = this.filt('lowpass', 140), g = this.gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, pk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(lp); lp.connect(g);
    const o1 = c.createOscillator(), o2 = c.createOscillator(), og = this.gain(0.35); o1.frequency.value = rand(29, 34); o2.frequency.value = rand(44, 49);
    o1.connect(og); o2.connect(og); og.connect(g);
    const sq = this.loop('white'), bp = this.filt('bandpass', rand(2300, 2900), 7), sg = this.gain(0);
    sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(0, pk - 1.5); sg.gain.linearRampToValueAtTime(0.012, pk); sg.gain.linearRampToValueAtTime(0, pk + 2);
    sq.connect(bp); bp.connect(sg);
    let out = this.gain(1); g.connect(out); sg.connect(out);
    if (c.createStereoPanner) { const p = c.createStereoPanner(); const d = Math.random() < 0.5 ? -1 : 1; p.pan.setValueAtTime(-0.6 * d, t); p.pan.linearRampToValueAtTime(0.6 * d, t + dur); out.connect(p); out = p; }
    out.connect(dest);
    // golpeteo de juntas de vía, muy lejano
    for (let k = 0; k < 10; k++) { const tt = pk - 1.6 + k * 0.32 + (k % 2) * 0.12; this.thumpTo(out, tt, 60, 0.12); }
    for (const n of [o1, o2]) { n.start(t); n.stop(t + dur + 0.1); } s.stop(t + dur + 0.1); sq.stop(t + dur + 0.1);
  },
  thumpTo(dest, t, f, v) {
    const o = this.ctx.createOscillator(), g = this.gain(0); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.08);
    this.env(g, t, v, 0.004, 0.12); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.2);
  },
};

// Constructores de emisores (ambientes)
const EMIT = {
  // Zumbido de fluorescente: armónicos de 120 Hz (red de 60 Hz) + chisporroteo + leve modulación
  hum(A, em, def) {
    const c = A.ctx, f = (def.freq || 120) * rand(0.997, 1.003), mix = A.gain(1); mix.connect(em.out);
    (def.harm || [1, 0.45, 0.22, 0.1, 0.05]).forEach((a, i) => { const o = c.createOscillator(); o.frequency.value = f * (i + 1) * (i ? rand(0.999, 1.001) : 1); const g = A.gain(a * 0.5); o.connect(g); g.connect(mix); o.start(); em.nodes.push(o); });
    const sq = c.createOscillator(); sq.type = 'square'; sq.frequency.value = f;
    const bp = A.filt('bandpass', def.sizzleF || 3200, 1.2), sg = A.gain(0.03 * (def.sizzle ?? 1));
    sq.connect(bp); bp.connect(sg); sg.connect(mix); sq.start(); em.nodes.push(sq);
    const lfo = c.createOscillator(), lg = A.gain(0.16); lfo.frequency.value = rand(0.07, 0.3); lfo.connect(lg); lg.connect(mix.gain); lfo.start(); em.nodes.push(lfo);
  },
  // Rótulo luminoso: más chisporroteo que zumbido
  sign(A, em, def) { EMIT.hum(A, em, { ...def, harm: [0.4, 0.3, 0.2, 0.12, 0.08, 0.05], sizzle: 2.4, sizzleF: 4200 }); },
  // Farola de sodio: zumbido grave + crepitar ocasional
  lamp(A, em, def) {
    EMIT.hum(A, em, { ...def, harm: [0.5, 0.35, 0.2, 0.12], sizzle: 1.6, sizzleF: 2600 });
    let t = rand(2, 6); em.update = (dt) => { t -= dt; if (t <= 0) { t = rand(1.5, 8); for (let i = 0; i < randi(1, 4); i++) setTimeout(() => !em.dead && A.click(em.out, rand(0.1, 0.3), rand(2500, 6000)), i * rand(20, 70)); } };
  },
  // Viento canalizado por la escalera
  wind(A, em, def) {
    const s = A.loop('pink'), bp = A.filt('bandpass', 420, 0.7), lp = A.filt('lowpass', 1500), g = A.gain(0.6);
    s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(em.out);
    const s2 = A.loop('brown'), lp2 = A.filt('lowpass', 170), g2 = A.gain(0.55); s2.connect(lp2); lp2.connect(g2); g2.connect(em.out);
    em.nodes.push(s, s2);
    let t = 0; em.update = (dt) => {
      t -= dt; if (t > 0) return; t = rand(0.8, 2.6);
      const now = A.ctx.currentTime, gust = Math.pow(Math.random(), 1.5);
      bp.frequency.setTargetAtTime(rand(260, 520) * (0.75 + gust * 0.8), now, 0.9); g.gain.setTargetAtTime(0.22 + gust * 0.85, now, 1.0); g2.gain.setTargetAtTime(0.4 + gust * 0.4, now, 1.2);
    };
  },
  // Ventilación lejana: ruido grave + motor
  vent(A, em, def) {
    const s = A.loop('brown'), lp = A.filt('lowpass', 260), g = A.gain(0.9); s.connect(lp); lp.connect(g); g.connect(em.out);
    const h = A.loop('pink'), bp = A.filt('bandpass', 1100, 0.5), hg = A.gain(0.05); h.connect(bp); bp.connect(hg); hg.connect(em.out);
    const o = A.ctx.createOscillator(), og = A.gain(0.12); o.frequency.value = rand(46, 50); o.connect(og); og.connect(em.out);
    const o2 = A.ctx.createOscillator(), og2 = A.gain(0.05); o2.frequency.value = o.frequency.value * 2.01; o2.connect(og2); og2.connect(em.out);
    o.start(); o2.start(); em.nodes.push(s, h, o, o2);
  },
  // Goteo con eco
  drip(A, em, def) {
    let t = rand(1, 4); em.update = (dt) => {
      t -= dt; if (t > 0) return; t = rand(def.min || 2.5, def.max || 9);
      const now = A.ctx.currentTime; A.drip(em.out, now + 0.01); if (Math.random() < 0.35) A.drip(em.out, now + rand(0.35, 0.9));
    };
  },
  // Ciudad lejana: lecho grave de tráfico + coches que pasan a lo lejos
  city(A, em, def) {
    const s = A.loop('brown'), lp = A.filt('lowpass', 300), g = A.gain(0.8); s.connect(lp); lp.connect(g); g.connect(em.out);
    const h = A.loop('pink'), bp = A.filt('bandpass', 700, 0.4), hg = A.gain(0.1); h.connect(bp); bp.connect(hg); hg.connect(em.out);
    em.nodes.push(s, h);
    let t = rand(3, 8), sw = 0; em.update = (dt) => {
      t -= dt; sw -= dt;
      if (sw <= 0) { sw = rand(3, 7); g.gain.setTargetAtTime(rand(0.5, 1.0), A.ctx.currentTime, 2.5); }
      if (t <= 0) { t = rand(7, 22); A.carPass(em.out); }
    };
  },
  // Máquina expendedora: compresor que arranca y para + balasto + relés
  vending(A, em, def) {
    const c = A.ctx, comp = A.gain(0); comp.connect(em.out);
    const o1 = c.createOscillator(); o1.type = 'triangle'; o1.frequency.value = 59; const g1 = A.gain(0.35); o1.connect(g1); g1.connect(comp);
    const o2 = c.createOscillator(); o2.frequency.value = 118.5; const g2 = A.gain(0.15); o2.connect(g2); g2.connect(comp);
    const s = A.loop('brown'), lp = A.filt('lowpass', 420), g3 = A.gain(0.35); s.connect(lp); lp.connect(g3); g3.connect(comp);
    const o3 = c.createOscillator(); o3.frequency.value = 120; const g4 = A.gain(0.07); o3.connect(g4); g4.connect(em.out);
    const sq = c.createOscillator(); sq.type = 'square'; sq.frequency.value = 120; const bp = A.filt('bandpass', 2600, 1.5), g5 = A.gain(0.015); sq.connect(bp); bp.connect(g5); g5.connect(em.out);
    [o1, o2, o3, sq].forEach((o) => o.start()); em.nodes.push(o1, o2, o3, sq, s);
    let on = Math.random() < 0.6, t = rand(5, 25), ck = rand(4, 12);
    comp.gain.value = on ? 1 : 0;
    em.update = (dt) => {
      t -= dt; ck -= dt;
      if (t <= 0) { on = !on; t = on ? rand(30, 60) : rand(12, 30); const now = c.currentTime; comp.gain.setTargetAtTime(on ? 1 : 0, now, on ? 0.5 : 0.25); A.thumpTo(em.out, now + 0.01, 70, 0.4); A.click(em.out, 0.25, 2000); }
      if (ck <= 0) { ck = rand(5, 18); A.click(em.out, rand(0.08, 0.2), rand(1800, 3500)); }
    };
  },
  // Tren lejano en las profundidades (global)
  rumble(A, em, def) {
    let t = rand(def.first ?? 25, (def.first ?? 25) + 30); em.update = (dt) => { t -= dt; if (t <= 0) { t = rand(55, 120); A.distantTrain(em.out); } };
  },
};


