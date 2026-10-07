/* =====================================================================
   MÚSICA OPCIONAL — dark ambient sintetizado: dron + pad lento + campanas suaves
   ===================================================================== */
// Tonalidad por zona: nota MIDI raíz del dron + acordes (semitonos sobre la raíz)
const MUSIC_KEYS = {
  z1: { root: 38, chords: [[12, 15, 19, 22], [10, 14, 17, 21], [8, 12, 15, 19]] },
  z2: { root: 37, chords: [[12, 15, 19, 24], [11, 14, 18, 23], [9, 12, 16, 21]] },
  z3: { root: 40, chords: [[11, 16, 19, 23], [9, 13, 16, 21], [14, 18, 21, 25]] },
  z4: { root: 33, chords: [[12, 15, 19, 22], [10, 15, 17, 22]] },
  z5: { root: 29, chords: [[12, 13, 19, 20], [11, 15, 18, 22]] },
  z6: { root: 32, chords: [[12, 15, 18, 22], [13, 17, 20, 24]] },
  z7: { root: 34, chords: [[11, 16, 19, 26], [9, 14, 17, 24], [12, 16, 19, 23]] },
};
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const Music = {
  layer: null, zone: null,
  // Se llama al cambiar de zona o de ajustes
  sync(zoneId) {
    if (zoneId) this.zone = zoneId;
    const want = AudioSys.ready && S.musicOn && this.zone && MUSIC_KEYS[this.zone];
    if (!want) { this.fadeOut(); return; }
    if (this.layer && this.layer.zone === this.zone) return;
    this.fadeOut(); this.layer = this.makeLayer(this.zone);
  },
  fadeOut() {
    const L = this.layer; if (!L) return; this.layer = null;
    const t = AudioSys.ctx.currentTime; L.out.gain.cancelScheduledValues(t); L.out.gain.setValueAtTime(L.out.gain.value, t); L.out.gain.linearRampToValueAtTime(0, t + 5);
    setTimeout(() => { for (const n of L.nodes) { try { n.stop(); } catch (e) { /* ya parado */ } } try { L.out.disconnect(); } catch (e) { /* nada */ } }, 5600);
  },
  makeLayer(zone) {
    const A = AudioSys, c = A.ctx, K = MUSIC_KEYS[zone], t = c.currentTime;
    const L = { zone, nodes: [], voices: [], chord: 0, next: rand(18, 30), bell: rand(8, 16), out: A.gain(0) };
    L.out.connect(A.music); const send = A.gain(0.55); L.out.connect(send); send.connect(A.revIn);
    L.out.gain.setValueAtTime(0, t); L.out.gain.linearRampToValueAtTime(CONFIG.MUSIC_LEVEL, t + 7);
    // dron
    const lp = A.filt('lowpass', 380, 0.5); lp.connect(L.out);
    for (const [m, type, g] of [[0, 'sine', 0.5], [12, 'triangle', 0.12], [7, 'sine', 0.1]]) {
      const o = c.createOscillator(); o.type = type; o.frequency.value = mtof(K.root + m) * rand(0.999, 1.001);
      const og = A.gain(g); o.connect(og); og.connect(lp); o.start(); L.nodes.push(o);
    }
    // pad de 4 voces (2 sierras desafinadas por voz, filtro con LFO muy lento)
    const pf = A.filt('lowpass', 650, 0.4); pf.connect(L.out);
    const lfo = c.createOscillator(), lg = A.gain(280); lfo.frequency.value = rand(0.03, 0.06); lfo.connect(lg); lg.connect(pf.frequency); lfo.start(); L.nodes.push(lfo);
    K.chords[0].forEach((m) => {
      const v = { oscs: [] }, vg = A.gain(0.045);
      for (const det of [-7, 6]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(K.root + m); o.detune.value = det + rand(-2, 2); o.connect(vg); o.start(); v.oscs.push(o); L.nodes.push(o); }
      const tr = c.createOscillator(), tg = A.gain(0.012); tr.frequency.value = rand(0.07, 0.15); tr.connect(tg); tg.connect(vg.gain); tr.start(); L.nodes.push(tr);
      vg.connect(pf); L.voices.push(v);
    });
    return L;
  },
  update(dt) {
    const L = this.layer; if (!L) return; const A = AudioSys, c = A.ctx, K = MUSIC_KEYS[L.zone];
    L.next -= dt; L.bell -= dt;
    if (L.next <= 0 && K.chords.length > 1) {   // cambio de acorde lentísimo (glissando de 4 s)
      L.next = rand(20, 34); L.chord = (L.chord + 1) % K.chords.length; const ch = K.chords[L.chord], t = c.currentTime;
      L.voices.forEach((v, i) => { for (const o of v.oscs) o.frequency.setTargetAtTime(mtof(K.root + ch[i]), t, 1.6); });
    }
    if (L.bell <= 0) {                          // campana suave, casi inaudible, con mucha cola
      L.bell = rand(10, 22); const ch = K.chords[L.chord], m = K.root + pick(ch) + 24, t = c.currentTime + 0.05;
      const o = c.createOscillator(), o2 = c.createOscillator(), g = A.gain(0); o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2.76;
      const g2 = A.gain(0.18); o2.connect(g2); g2.connect(g); o.connect(g); g.connect(L.out);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0002, t + 6);
      o.start(t); o2.start(t); o.stop(t + 6.2); o2.stop(t + 6.2);
    }
  },
};

