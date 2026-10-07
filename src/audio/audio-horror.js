/* =====================================================================
   AUDIO DE TERROR — latido, susurros, golpes, teléfono, tren... (todo sintetizado)
   ===================================================================== */
// Permite redirigir las pisadas a un punto del espacio (pasos "de otro")
AudioSys.toSfx = function (node, send) {
  node.connect(this._dest || this.sfx);
  if (send > 0) { const s = this.gain(send); node.connect(s); s.connect(this.sfxSend); }
};
Object.assign(AudioSys, {
  _dest: null,
  // nodo no posicional temporal (se desconecta solo)
  tmp(v = 1, send = 0.3, ms = 8000) {
    const g = this.gain(v); this.toSfx(g, send);
    setTimeout(() => { try { g.disconnect(); } catch (e) { /* nada */ } }, ms);
    return g;
  },
  noiseBurst(dest, t, type, f, q, v, att, dec, kind = 'white') {
    const s = this.ctx.createBufferSource(); s.buffer = this[kind];
    const fl = this.filt(type, f, q), g = this.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(0.0002, t + att + dec);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 2, att + dec + 0.05);
    return fl;
  },
  tone(dest, t, f, v, att, dec, type = 'sine', f2 = null) {
    const o = this.ctx.createOscillator(), g = this.gain(0); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + att + dec);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(0.0002, t + att + dec);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + att + dec + 0.05);
  },
  // ---------- Objetos ----------
  pickup() {
    if (!this.ready) return; const d = this.tmp(1, 0.25), t = this.ctx.currentTime + 0.01;
    this.rustle(0.1); this.click(d, 0.2, 3000); this.tone(d, t + 0.05, 880, 0.02, 0.01, 0.5); this.tone(d, t + 0.05, 1320, 0.012, 0.01, 0.7);
  },
  paper() { if (!this.ready) return; const d = this.tmp(1, 0.2), t = this.ctx.currentTime + 0.01; for (let i = 0; i < 5; i++) this.noiseBurst(d, t + i * rand(0.03, 0.07), 'bandpass', rand(2500, 5000), 1.2, rand(0.04, 0.09), 0.005, rand(0.03, 0.08)); },
  unlock(pos) { if (!this.ready) return; const d = this.at(pos, 0.6), t = this.ctx.currentTime + 0.01; this.metalHit(d, t, 0.15, 1300); this.metalHit(d, t + 0.18, 0.22, 900); this.click(d, 0.3, 2400); },
  batterySwap() { if (!this.ready) return; const d = this.tmp(1, 0.1), t = this.ctx.currentTime; this.click(d, 0.25, 2600); setTimeout(() => this.click(d, 0.3, 1800), 260); setTimeout(() => this.click(d, 0.22, 3400), 520); },
  keyBeep(ok) {
    if (!this.ready) return; const d = this.tmp(1, 0.2), t = this.ctx.currentTime + 0.005;
    if (ok === true) { [0, 0.12, 0.24].forEach((dt, i) => this.tone(d, t + dt, [1318, 1568, 2093][i], 0.035, 0.004, 0.12, 'square')); }
    else if (ok === false) this.tone(d, t, 180, 0.07, 0.005, 0.45, 'sawtooth');
    else this.tone(d, t, 1760, 0.03, 0.003, 0.07, 'square');
  },
  // ---------- Tensión ----------
  heartbeat(v) {
    if (!this.ready) return; const d = this.tmp(1, 0, 3000), t = this.ctx.currentTime + 0.01, lp = this.filt('lowpass', 120); lp.connect(d);
    this.tone(lp, t, 62, v, 0.012, 0.16, 'sine', 40); this.tone(lp, t + 0.24, 55, v * 0.7, 0.012, 0.2, 'sine', 38);
  },
  // Susurro: ruido con formantes que cambian (sílabas sin sentido), muy reverberado
  whisper(pos, v = 0.35, dur = rand(1.4, 2.6)) {
    if (!this.ready) return; const c = this.ctx, t = c.currentTime + 0.05;
    const d = pos ? this.at(pos, 1.4, 1.0) : this.tmp(1, 0.8);
    const s = this.loop('white'), hp = this.filt('highpass', 900), f1 = this.filt('bandpass', 1200, 6), f2 = this.filt('bandpass', 2600, 7), g = this.gain(0), m = this.gain(1);
    s.connect(hp); hp.connect(f1); hp.connect(f2); f1.connect(m); f2.connect(m); m.connect(g); g.connect(d);
    const n = Math.max(3, Math.round(dur / 0.17));
    g.gain.setValueAtTime(0, t);
    for (let i = 0; i < n; i++) {
      const tt = t + (i / n) * dur, a = rand(0.4, 1) * v * Math.sin(PI * (i + 0.5) / n);
      g.gain.linearRampToValueAtTime(a, tt + 0.04); g.gain.linearRampToValueAtTime(a * 0.15, tt + dur / n * 0.9);
      f1.frequency.setValueAtTime(rand(500, 1300), tt); f2.frequency.setValueAtTime(rand(1700, 3200), tt);
    }
    g.gain.linearRampToValueAtTime(0, t + dur + 0.1); s.stop(t + dur + 0.2);
  },
  // Golpe seco de terror: grave + metal + ruido, para sustos
  stinger(v = 0.5) {
    if (!this.ready) return; const d = this.tmp(1, 0.9), t = this.ctx.currentTime + 0.01;
    this.tone(d, t, 48, v, 0.005, 1.6, 'sine', 30); this.noiseBurst(d, t, 'lowpass', 900, 0.7, v * 0.6, 0.004, 0.5, 'brown');
    for (const f of [311, 330, 466]) this.tone(d, t, f, v * 0.05, 0.02, 2.2, 'sawtooth', f * 0.97);
  },
  // Desaparición de una silueta: aspiración inversa + grave
  vanish(pos) {
    if (!this.ready) return; const d = pos ? this.at(pos, 1.2, 3) : this.tmp(1, 0.8), c = this.ctx, t = c.currentTime + 0.01;
    const s = this.loop('pink'), bp = this.filt('bandpass', 400, 1.2), g = this.gain(0);
    bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3000, t + 0.7);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 0.75);
    s.connect(bp); bp.connect(g); g.connect(d); s.stop(t + 0.8);
    this.tone(this.tmp(1, 0.5), t + 0.7, 40, 0.5, 0.005, 1.2, 'sine', 28);
  },
  // Portazo lejano / cercano
  slam(pos, v = 0.9) {
    if (!this.ready) return; const d = this.at(pos, 1.2, 2.5), t = this.ctx.currentTime + 0.01;
    this.thumpTo(d, t, 55, v); this.thumpTo(d, t + 0.01, 90, v * 0.6); this.metalHit(d, t, v * 0.5, 260); this.metalHit(d, t + 0.05, v * 0.3, 520);
    this.noiseBurst(d, t, 'lowpass', 1500, 0.7, v * 0.5, 0.002, 0.35);
  },
  // Golpes en las puertas de andén, desde el lado de la vía
  bang(pos, n = 3) {
    if (!this.ready) return; const d = this.at(pos, 1.0, 2.0), t0 = this.ctx.currentTime + 0.02;
    for (let i = 0; i < n; i++) { const t = t0 + i * rand(0.38, 0.6); this.thumpTo(d, t, 70, 0.8); this.metalHit(d, t, 0.18, 350); this.noiseBurst(d, t, 'bandpass', 700, 1, 0.2, 0.002, 0.15); }
  },
  // Apagón: chasquido grave + zumbido que cae
  powerDown() {
    if (!this.ready) return; const d = this.tmp(1, 0.9), t = this.ctx.currentTime + 0.01;
    this.thumpTo(d, t, 60, 0.7); this.metalHit(d, t, 0.2, 180);
    this.tone(d, t, 120, 0.08, 0.005, 1.4, 'sawtooth', 30);
  },
  powerUp() {
    if (!this.ready) return; const d = this.tmp(1, 0.6), t = this.ctx.currentTime + 0.01;
    this.tone(d, t, 40, 0.05, 0.4, 0.8, 'sawtooth', 120); for (let i = 0; i < 4; i++) this.click(d, 0.15, rand(3000, 5000));
  },
  // Fluorescente que revienta
  lampPop(pos) {
    if (!this.ready) return; const d = this.at(pos, 1.0, 1.5), t = this.ctx.currentTime + 0.01;
    this.noiseBurst(d, t, 'highpass', 1200, 0.7, 0.6, 0.001, 0.08);
    for (let i = 0; i < 9; i++) this.tone(d, t + 0.05 + rand(0, 0.5), rand(3000, 7000), rand(0.02, 0.06), 0.001, rand(0.05, 0.15));
  },
  // Pasos de alguien más (posicionales), n pasos acercándose desde 'from' hacia 'to'
  stepAt(pos, surface) {
    if (!this.ready) return; const d = this.at(pos, 0.9, 1.4); this._dest = d;
    try { this.footstep(surface, { run: false }); } finally { this._dest = null; }
  },
  // Teléfono público japonés: timbre electrónico (dos tonos alternos), en bucle hasta parar
  phoneRing(pos) {
    if (!this.ready) return null; const c = this.ctx, out = this.gain(1), p = this.panner(pos, 0.7, 1.2), snd = this.gain(0.7);
    out.connect(p); p.connect(this.sfx); p.connect(snd); snd.connect(this.sfxSend);
    let alive = true;
    const ring = () => {
      if (!alive) return; const t = c.currentTime + 0.02;
      for (let i = 0; i < 20; i++) { const tt = t + i * 0.05; this.tone(out, tt, i % 2 ? 960 : 800, 0.06, 0.002, 0.045, 'square'); }
      setTimeout(ring, 2000);
    };
    ring();
    return { stop() { alive = false; setTimeout(() => { try { out.disconnect(); p.disconnect(); snd.disconnect(); } catch (e) { /* nada */ } }, 1200); } };
  },
  // Al descolgar: estática + voz susurrada lejana
  phoneVoice() {
    if (!this.ready) return; const d = this.tmp(1, 0.2), t = this.ctx.currentTime + 0.05;
    const s = this.loop('white'), bp = this.filt('bandpass', 1800, 0.8), g = this.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.1); g.gain.setValueAtTime(0.05, t + 5); g.gain.linearRampToValueAtTime(0, t + 5.5);
    s.connect(bp); bp.connect(g); g.connect(d); s.stop(t + 5.6);
    setTimeout(() => this.whisper(null, 0.25, 2.2), 900); setTimeout(() => this.whisper(null, 0.3, 1.6), 3200);
    this.tone(d, t + 5.6, 400, 0.04, 0.005, 0.2, 'square');
  },
  // Melodía de andén (chime)
  chime() {
    if (!this.ready) return; const d = this.at([0, 2.8, 0], 1.0, 8), t = this.ctx.currentTime + 0.05;
    [659, 523, 587, 392, 0, 392, 587, 659, 523].forEach((f, i) => { if (!f) return; const tt = t + i * 0.36; this.tone(d, tt, f, 0.06, 0.01, 0.9); this.tone(d, tt, f * 2, 0.012, 0.01, 0.5); });
  },
  // Llegada del tren: retumbar creciente, chirrido de frenos, golpe de parada
  trainArrive(dur = 9) {
    if (!this.ready) return; const c = this.ctx, t = c.currentTime + 0.05, d = this.tmp(1, 0.9, (dur + 6) * 1000);
    const s = this.loop('brown'), lp = this.filt('lowpass', 160), g = this.gain(0);
    lp.frequency.setValueAtTime(90, t); lp.frequency.linearRampToValueAtTime(420, t + dur * 0.7); lp.frequency.linearRampToValueAtTime(140, t + dur + 1.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.2, t + dur * 0.65); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 2.5);
    s.connect(lp); lp.connect(g); g.connect(d); s.stop(t + dur + 3);
    for (let k = 0; k < 22; k++) { const tt = t + dur * 0.3 + k * (0.18 + k * 0.012); if (tt < t + dur) { this.thumpTo(d, tt, 55, 0.25 * Math.min(1, k / 6)); } }
    const sq = this.loop('white'), bp = this.filt('bandpass', 3200, 18), sg = this.gain(0);
    bp.frequency.setValueAtTime(3400, t + dur * 0.55); bp.frequency.linearRampToValueAtTime(2600, t + dur);
    sg.gain.setValueAtTime(0, t + dur * 0.55); sg.gain.linearRampToValueAtTime(0.1, t + dur * 0.75); sg.gain.linearRampToValueAtTime(0, t + dur + 0.2);
    sq.connect(bp); bp.connect(sg); sg.connect(d); sq.stop(t + dur + 0.4);
    this.thumpTo(d, t + dur, 45, 0.6);
    // aire de las puertas al abrirse
    this.noiseBurst(d, t + dur + 2.2, 'bandpass', 1400, 0.6, 0.25, 0.05, 0.9, 'pink');
  },
});
Object.assign(AudioSys, {
  coins(pos) { if (!this.ready) return; const d = this.at(pos, 0.6), t = this.ctx.currentTime + 0.05; for (let i = 0; i < 6; i++) this.metalHit(d, t + i * rand(0.05, 0.12), rand(0.08, 0.16), rand(1800, 2600)); },
  ticketPrint(pos) {
    if (!this.ready) return; const d = this.at(pos, 0.5), t = this.ctx.currentTime + 0.05;
    for (let i = 0; i < 4; i++) this.metalHit(d, t + i * 0.09, 0.06, 2200);
    this.noiseBurst(d, t + 0.4, 'bandpass', 900, 1.5, 0.15, 0.05, 0.9);
    this.tone(d, t + 1.4, 1568, 0.04, 0.005, 0.15, 'square'); this.click(d, 0.25, 3000);
  },
  gateOpen(pos) { if (!this.ready) return; const d = this.at(pos, 0.6), t = this.ctx.currentTime + 0.02; this.tone(d, t, 1760, 0.04, 0.004, 0.1, 'square'); this.thumpTo(d, t + 0.15, 120, 0.3); this.metalHit(d, t + 0.18, 0.12, 700); },
});
Object.assign(AudioSys, {
  // Respiración del jugador: inspiración + espiración con ruido filtrado (más fuerte y rápida al cansarse)
  breath(k, quiet) {
    if (!this.ready) return; const d = this.tmp(1, 0.05, 4000), t = this.ctx.currentTime + 0.02, v = (0.05 + 0.13 * k) * (quiet ? 0.6 : 1);
    const inD = lerp(0.9, 0.35, k), outD = lerp(1.1, 0.45, k);
    this.noiseBurst(d, t, 'bandpass', rand(1100, 1500), 1.1, v * 0.7, inD * 0.6, inD * 0.4, 'pink');
    this.noiseBurst(d, t + inD + 0.05, 'bandpass', rand(700, 950), 0.9, v, outD * 0.3, outD * 0.7, 'pink');
  },
  // Chasquido de estática (imágenes subliminales)
  staticBurst(v = 0.3) {
    if (!this.ready) return; const d = this.tmp(1, 0.3), t = this.ctx.currentTime + 0.005;
    this.noiseBurst(d, t, 'highpass', 1500, 0.7, v, 0.003, 0.18); this.tone(d, t, 60, v * 0.6, 0.003, 0.25, 'square', 40);
  },
  // Megafonía distorsionada: carillón + voz que no se entiende, con mucha reverberación
  announce() {
    if (!this.ready) return; const c = this.ctx, t = c.currentTime + 0.05, d = this.tmp(1, 1.2, 12000);
    [784, 659, 523].forEach((f, i) => this.tone(d, t + i * 0.42, f, 0.05, 0.01, 1.2));
    const t0 = t + 1.7, dur = rand(3.2, 4.5);
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(rand(105, 130), t0);
    const vib = c.createOscillator(), vg = this.gain(6); vib.frequency.value = 5; vib.connect(vg); vg.connect(o.frequency);
    const f1 = this.filt('bandpass', 600, 5), f2 = this.filt('bandpass', 1500, 6), hp = this.filt('highpass', 350), lp = this.filt('lowpass', 3000), g = this.gain(0);
    o.connect(f1); o.connect(f2); f1.connect(hp); f2.connect(hp); hp.connect(lp); lp.connect(g); g.connect(d);
    const n = Math.round(dur / 0.16);
    for (let i = 0; i < n; i++) {
      const tt = t0 + (i / n) * dur; f1.frequency.setValueAtTime(rand(300, 850), tt); f2.frequency.setValueAtTime(rand(900, 2400), tt);
      o.frequency.setTargetAtTime(rand(95, 140) * (i > n * 0.7 ? 0.8 : 1), tt, 0.05);       // la voz se hunde al final
      g.gain.setValueAtTime(rand(0.06, 0.16), tt); g.gain.setValueAtTime(rand(0, 0.03), tt + dur / n * 0.8);
    }
    g.gain.setValueAtTime(0, t0 + dur); o.start(t0); vib.start(t0); o.stop(t0 + dur + 0.1); vib.stop(t0 + dur + 0.1);
    this.noiseBurst(d, t0, 'bandpass', 2500, 0.6, 0.012, 0.2, dur, 'white');
  },
});
