/* =====================================================================
   SILENCIO DINÁMICO — a ratos se apagan los ambientes, queda la "respiración"
   del espacio y luego suena algo lejano y sutil (nunca un susto)
   ===================================================================== */
Object.assign(AudioSys, {
  // Atenúa ambientes (no la sala ni las pisadas)
  duck(v, time) { if (!this.ready) return; const t = this.ctx.currentTime; for (const g of [this.duckG, this.duckS]) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + time); } },
  // Un sonido lejano y sutil, con mucha reverberación
  distantEvent() {
    if (!this.ready) return; const c = this.ctx, t = c.currentTime + 0.05;
    const out = this.gain(0.6), wet = this.gain(1.0), lp = this.filt('lowpass', 900, 0.5);
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = rand(-0.8, 0.8); lp.connect(p); p.connect(out); p.connect(wet); } else { lp.connect(out); lp.connect(wet); }
    out.connect(this.sfx); wet.connect(this.sfxSend);
    const kind = pick(['clank', 'door', 'shutter', 'gust', 'clank', 'door']);
    if (kind === 'clank') { this.metalHit(lp, t, 0.25, rand(180, 320)); this.metalHit(lp, t + rand(0.3, 0.7), 0.12, rand(200, 300)); }
    else if (kind === 'door') { this.thumpTo(lp, t, 55, 0.5); this.metalHit(lp, t + 0.02, 0.08, 600); }
    else if (kind === 'shutter') { for (let k = 0; k < 10; k++) this.metalHit(lp, t + k * rand(0.04, 0.08), 0.06 * Math.exp(-k / 5), rand(200, 300)); }
    else { const s = this.loop('pink'), bp = this.filt('bandpass', 380, 0.8), g = this.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 2); g.gain.linearRampToValueAtTime(0, t + 5); s.connect(bp); bp.connect(g); g.connect(lp); s.stop(t + 5.2); }
    setTimeout(() => { try { out.disconnect(); wet.disconnect(); } catch (e) { /* nada */ } }, 9000);
  },
});
const Silence = {
  phase: 'idle', next: rand(70, 130), t: 0,
  update(dt) {
    if (!AudioSys.ready || Game.state !== 'playing') return;
    if (this.phase === 'idle') { this.next -= dt; if (this.next <= 0) { this.phase = 'quiet'; this.t = rand(9, 16); AudioSys.duck(0.1, 4); } }
    else if (this.phase === 'quiet') { this.t -= dt; if (this.t <= 0) { this.phase = 'event'; this.t = rand(3, 5); AudioSys.distantEvent(); } }
    else { this.t -= dt; if (this.t <= 0) { this.phase = 'idle'; this.next = rand(CONFIG.SILENCE_MIN, CONFIG.SILENCE_MAX); AudioSys.duck(1, 7); } }
  },
  reset() { this.phase = 'idle'; this.next = rand(70, 130); AudioSys.duck(1, 0.5); },
};

