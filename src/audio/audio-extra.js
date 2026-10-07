/* ---------- Audio de las zonas 3–7 ---------- */
Object.assign(REVERBS, {
  platform: { dur: 2.8, rt: 1.9, pre: 0.016, damp: [0.65, 0.17], wet: 0.36, er: [[0.018, 0.4], [0.036, 0.3], [0.061, 0.2]] },
  gallery:  { dur: 1.7, rt: 1.05, pre: 0.006, damp: [0.7, 0.2], wet: 0.3, er: [[0.007, 0.5], [0.014, 0.4]], flutter: 0.0072, fb: 0.38 },
});
Object.assign(STEPS, {
  gravel: { bp: 1500, q: 0.6, hp: 300, dur: 0.07, thumpF: 78, thump: 0.55, toe: 0.35, scuff: 0.18, vol: 0.26, wet: 0.45, crunch: 1 },
  marble: { bp: 3000, q: 1.2, hp: 600, dur: 0.045, thumpF: 120, thump: 0.45, toe: 0.6, scuff: 0.04, vol: 0.34, wet: 1.0 },
});
Object.assign(AudioSys, {
  crunch(t, v, send) { for (let i = 0; i < 9; i++) this.hit(t + rand(0, 0.11), rand(1600, 4800), 1.4, 800, rand(0.008, 0.022), v * rand(0.18, 0.45), send); },
  // Puerta que se abre: pestillo + chirrido + golpe sordo
  doorOpen(pos, kind = 'door') {
    if (!this.ready) return; const d = this.at(pos, 0.8), c = this.ctx, t = c.currentTime + 0.01;
    if (kind === 'shutter') { this.shutterMotor(pos); return; }
    this.metalHit(d, t, 0.22, kind === 'gate' ? 300 : 900); this.click(d, 0.25, 2500);
    const s = c.createBufferSource(); s.buffer = this.white; const bp = this.filt('bandpass', 700, 9), g = this.gain(0);
    bp.frequency.setValueAtTime(rand(650, 800), t + 0.08); bp.frequency.exponentialRampToValueAtTime(rand(260, 360), t + 0.75);
    g.gain.setValueAtTime(0, t + 0.08); g.gain.linearRampToValueAtTime(kind === 'gate' ? 0.05 : 0.12, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.85);
    s.connect(bp); bp.connect(g); g.connect(d); s.start(t + 0.08, Math.random() * 2, 0.9);
    this.thumpTo(d, t + 0.55, 62, 0.35);
  },
  // Persiana que sube: traqueteo continuo + motor
  shutterMotor(pos) {
    if (!this.ready) return; const d = this.at(pos, 0.9, 1.6), c = this.ctx, t0 = c.currentTime + 0.05, dur = 2.6;
    for (let tt = 0; tt < dur; tt += rand(0.035, 0.07)) this.metalHit(d, t0 + tt, 0.09 * rand(0.5, 1), rand(240, 340));
    const o = c.createOscillator(), lp = this.filt('lowpass', 300), g = this.gain(0); o.type = 'sawtooth'; o.frequency.value = 52;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.06, t0 + 0.3); g.gain.setValueAtTime(0.06, t0 + dur - 0.3); g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(lp); lp.connect(g); g.connect(d); o.start(t0); o.stop(t0 + dur + 0.1);
    this.thumpTo(d, t0 + dur, 70, 0.4);
  },
  buttonPress(pos) { if (!this.ready) return; const d = this.at(pos, 0.5); this.click(d, 0.3, 2200); this.thumpTo(d, this.ctx.currentTime + 0.05, 140, 0.15); },
  // Crujido metálico lejano (estructura que se enfría)
  creakAt(dest) {
    const c = this.ctx, t = c.currentTime + 0.02;
    if (Math.random() < 0.5) { this.metalHit(dest, t, rand(0.05, 0.12), rand(180, 420)); return; }
    const s = c.createBufferSource(); s.buffer = this.white; const bp = this.filt('bandpass', rand(300, 600), 14), g = this.gain(0), dur = rand(0.6, 1.6);
    bp.frequency.setValueAtTime(bp.frequency.value, t); bp.frequency.linearRampToValueAtTime(bp.frequency.value * rand(0.7, 1.3), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rand(0.1, 0.22), t + dur * 0.3); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(bp); bp.connect(g); g.connect(dest); s.start(t, Math.random() * 2, dur + 0.05);
  },
});
const _footstep = AudioSys.footstep;
AudioSys.footstep = function (surface, o = {}) {
  _footstep.call(this, surface, o);
  const P = STEPS[surface]; if (this.ready && P && P.crunch) this.crunch(this.ctx.currentTime + 0.004, P.vol * (o.run ? 1.4 : o.crouch ? 0.4 : 1) * P.crunch, P.wet);
};
Object.assign(EMIT, {
  // Máquinas de billetes / electrónica: zumbido + pitidos y relés ocasionales
  machines(A, em, def) {
    const c = A.ctx, o = c.createOscillator(), g = A.gain(0.18); o.frequency.value = 100; o.connect(g); g.connect(em.out);
    const sq = c.createOscillator(); sq.type = 'square'; sq.frequency.value = 100; const bp = A.filt('bandpass', 3600, 2), sg = A.gain(0.02); sq.connect(bp); bp.connect(sg); sg.connect(em.out);
    o.start(); sq.start(); em.nodes.push(o, sq);
    let t = rand(3, 9); em.update = (dt) => {
      t -= dt; if (t > 0) return; t = rand(6, 20); const now = c.currentTime;
      if (Math.random() < 0.6) A.click(em.out, rand(0.1, 0.25), rand(1500, 3000));
      else { const b = c.createOscillator(), bg = A.gain(0); b.frequency.value = pick([1318, 1568, 2093]); bg.gain.setValueAtTime(0, now); bg.gain.linearRampToValueAtTime(0.05, now + 0.005); bg.gain.setValueAtTime(0.05, now + 0.06); bg.gain.linearRampToValueAtTime(0, now + 0.07); b.connect(bg); bg.connect(em.out); b.start(now); b.stop(now + 0.1); }
    };
  },
  // Panel LED: zumbido agudo muy tenue
  led(A, em, def) {
    const c = A.ctx, o = c.createOscillator(), g = A.gain(0.04); o.frequency.value = rand(7600, 8200); o.connect(g); g.connect(em.out);
    const h = c.createOscillator(), hg = A.gain(0.12); h.frequency.value = 120; h.connect(hg); hg.connect(em.out); o.start(); h.start(); em.nodes.push(o, h);
  },
  // Gran ventilador industrial: retumbo con pulso de aspas
  fan(A, em, def) {
    const c = A.ctx, s = A.loop('brown'), lp = A.filt('lowpass', 280), g = A.gain(0.8); s.connect(lp); lp.connect(g); g.connect(em.out);
    const lfo = c.createOscillator(), lg = A.gain(0.35); lfo.frequency.value = def.rate || 5.5; lfo.connect(lg); lg.connect(g.gain);
    const o = c.createOscillator(), og = A.gain(0.25); o.frequency.value = 37; o.connect(og); og.connect(em.out);
    lfo.start(); o.start(); em.nodes.push(s, lfo, o);
  },
  // Crujidos metálicos aleatorios
  creak(A, em, def) { let t = rand(4, 12); em.update = (dt) => { t -= dt; if (t <= 0) { t = rand(def.min || 9, def.max || 26); A.creakAt(em.out); } }; },
  // Reloj detrás de una persiana
  tick(A, em, def) { let t = 0.5, k = 0; em.update = (dt) => { t -= dt; if (t <= 0) { t += 1; k++; A.click(em.out, k % 2 ? 0.12 : 0.09, k % 2 ? 3200 : 2700); } }; },
  // "Respiración" del espacio: tono de sala casi inaudible (no se apaga en los silencios)
  roomtone(A, em, def) {
    const s = A.loop('brown'), lp = A.filt('lowpass', def.f || 140), g = A.gain(1); s.connect(lp); lp.connect(g); g.connect(em.out);
    const h = A.loop('pink'), bp = A.filt('bandpass', 2400, 0.4), hg = A.gain(0.04); h.connect(bp); bp.connect(hg); hg.connect(em.out); em.nodes.push(s, h);
  },
});


