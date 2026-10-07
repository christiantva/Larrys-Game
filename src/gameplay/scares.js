/* =====================================================================
   SUSTOS — sin enemigos: siluetas que desaparecen al mirarlas, apagones,
   pasos detrás de ti, portazos, teléfonos que suenan... Cada uno, una vez.
   ===================================================================== */
function silhouetteCanvas() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 320; const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 5;
  g.beginPath(); g.ellipse(64, 34, 17, 22, 0, 0, PI * 2); g.fill();                       // cabeza
  g.beginPath();                                                                           // cuello, hombros, torso, brazos y piernas
  g.moveTo(56, 52); g.lineTo(72, 52); g.lineTo(74, 66);
  g.quadraticCurveTo(102, 70, 106, 92); g.lineTo(110, 176); g.quadraticCurveTo(110, 196, 102, 196); g.lineTo(98, 120);
  g.lineTo(94, 186); g.lineTo(90, 314); g.lineTo(70, 314); g.lineTo(66, 200); g.lineTo(62, 200); g.lineTo(58, 314); g.lineTo(38, 314);
  g.lineTo(34, 186); g.lineTo(30, 120); g.lineTo(26, 196); g.quadraticCurveTo(18, 196, 18, 176); g.lineTo(22, 92);
  g.quadraticCurveTo(26, 70, 54, 66); g.closePath(); g.fill();
  return cv;
}
const _toF = new THREE.Vector3(), _fw = new THREE.Vector3();
const Scares = {
  done: {}, fig: null, mesh: null, seqs: [], phone: null, pw: null,
  init() {
    const t = new THREE.CanvasTexture(silhouetteCanvas()); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshLambertMaterial({ map: t, color: 0x2c2c30, alphaTest: 0.45, side: THREE.DoubleSide }); m.userData.shared = true;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.8), m); this.mesh.visible = false; World.scene.add(this.mesh);
    // con sombras activas, la silueta proyecta su forma con la linterna
    this.mesh.castShadow = true; this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.45 });
  },
  reset(done) { this.done = done ? { ...done } : {}; this.loops = 0; this.clear(); },
  // Corta todo lo que esté en marcha (al cambiar de zona o salir al menú)
  clear() {
    if (this.mesh) this.mesh.visible = false; this.fig = null; this.seqs = []; this.unseen = [];
    if (this.phone) { this.phone.stop(); this.phone = null; }
    if (this.pw) { this.pw = null; Power.k = 1; AudioSys.duck(1, 0.5); }
  },
  // Línea de tiempo propia (se congela en pausa, a diferencia de setTimeout)
  after(sec, fn) { this.seqs.push({ t: sec, fn }); },
  update(dt, cam) {
    this.checkUnseen(cam);
    for (let i = this.seqs.length - 1; i >= 0; i--) { const s = this.seqs[i]; s.t -= dt; if (s.t <= 0) { this.seqs.splice(i, 1); s.fn(); } }
    if (this.pw) {                     // animación de la corriente (apagones)
      const p = this.pw; Power.k += (p.to - Power.k) * (1 - Math.exp(-p.speed * dt));
      if (Math.abs(Power.k - p.to) < 0.01) { Power.k = p.to; if (p.to === 1) this.pw = null; }
    }
    const f = this.fig; if (!f) return;
    const M = this.mesh; M.position.copy(f.p); M.position.y += 0.9;
    M.rotation.set(0, Math.atan2(cam.position.x - M.position.x, cam.position.z - M.position.z), 0);
    _toF.subVectors(M.position, cam.position); const dist = _toF.length(); _toF.divideScalar(dist || 1);
    _fw.set(0, 0, -1).applyQuaternion(cam.quaternion);
    const look = _fw.dot(_toF), lit = Flashlight.level > 0.5 && Flashlight.dir.dot(_toF) > 0.95 && dist < 14;
    if ((look > f.lookCos && dist < 24) || lit) f.seen += dt * (lit ? 3 : 1);
    f.life -= dt;
    if (f.seen > f.stare || dist < f.near) this.gone(true);
    else if (f.life <= 0) this.gone(false);
  },
  // Silueta inmóvil en 'p' (pies). Desaparece si la miras fijamente, la alumbras o te acercas
  apparition(p, o = {}) {
    if (!this.mesh) return;
    this.fig = { p: new THREE.Vector3(p[0], p[1], p[2]), seen: 0, lookCos: o.lookCos ?? 0.975, stare: o.stare ?? 0.4, near: o.near ?? 3.2, life: o.life ?? 30, scare: o.scare ?? 0.2, quiet: !!o.quiet, onGone: o.onGone || null };
    this.mesh.visible = true;
  },
  gone(seen) {
    const f = this.fig; if (!f) return; this.fig = null; this.mesh.visible = false;
    if (seen && !f.quiet) { AudioSys.vanish([f.p.x, f.p.y + 1.5, f.p.z]); Sanity.scare(f.scare, 0.5); }
    if (f.onGone) f.onGone(seen);
  },
  // Presencia periférica: una figura en el límite de la visión que se esfuma al mirarla
  peripheral() {
    const z = Zones.current, p = Player.pos;
    for (let k = 0; k < 8; k++) {
      const side = Math.random() < 0.5 ? -1 : 1, a = Player.yaw + side * rand(0.85, 1.05), r = rand(5, 10);
      const x = p.x - Math.sin(a) * r, zz = p.z - Math.cos(a) * r, g = z.groundTop(x, zz);
      if (g && Math.abs(g.y - p.y) < 1.2) { this.apparition([x, g.y, zz], { lookCos: 0.88, stare: 0.02, near: 3.5, life: rand(4, 8), quiet: true }); return; }
    }
  },
  // Ejecuta fn cuando el punto p quede fuera de la vista (cosas que cambian cuando no miras)
  whenUnseen(p, fn) { this.unseen = this.unseen || []; this.unseen.push({ p, fn }); },
  checkUnseen(cam) {
    if (!this.unseen || !this.unseen.length) return;
    _fw.set(0, 0, -1).applyQuaternion(cam.quaternion);
    for (let i = this.unseen.length - 1; i >= 0; i--) {
      const u = this.unseen[i]; _toF.set(u.p[0] - cam.position.x, u.p[1] - cam.position.y, u.p[2] - cam.position.z); const d = _toF.length();
      if (d > 2.5 && _fw.dot(_toF.divideScalar(d)) < 0.15) { this.unseen.splice(i, 1); u.fn(); }
    }
  },
  // Pasillo que se repite: tres vueltas, cada una peor
  corridorLoop(len) {
    if (this.done.z3loop) return;
    this.loops = (this.loops || 0) + 1;
    Sanity.doBlink(); Player.pos.x -= len; Player.camY = Player.pos.y + Player.eye; AudioSys.staticBurst(0.1);
    if (this.loops === 1) this.after(0.6, () => Hud.sub('…¿no acabo de pasar por aquí?', 3));
    else if (this.loops === 2) { this.after(0.4, () => { Hud.sub('«…otra vez…»', 3); AudioSys.whisper(null, 0.45, 1.8); }); Sanity.scare(0.12, 0.3); }
    else { this.done.z3loop = true; this.after(0.3, () => this.blackout(3.5, () => this.steps(6, 'marble', 0.42))); }
  },
  // Visión fugaz delante del jugador (tensión al límite)
  glimpse() {
    const z = Zones.current, p = Player.pos;
    for (let k = 0; k < 6; k++) {
      const a = Player.yaw + rand(-0.4, 0.4), r = rand(5, 9), x = p.x - Math.sin(a) * r, zz = p.z - Math.cos(a) * r;
      const g = z.groundTop(x, zz);
      if (g && Math.abs(g.y - p.y) < 1.5) { this.apparition([x, g.y, zz], { stare: 0.12, near: 4, life: 1.6, scare: 0.08 }); AudioSys.stinger(0.25); return; }
    }
    AudioSys.whisper(null, 0.4);
  },
  // Apagón general: solo quedan la linterna y los carteles de emergencia
  blackout(dur = 3.5, onBack) {
    AudioSys.powerDown(); AudioSys.duck(0.12, 0.15); Sanity.scare(0.15, 0.35);
    this.pw = { to: 0, speed: 30 };
    this.after(dur, () => {
      AudioSys.powerUp(); this.pw = { to: 1, speed: 2.5 };
      for (const g of Object.values(Zones.current.groups)) Zones.current.flicker(g, false);
      AudioSys.duck(1, 2.0); if (onBack) onBack();
    });
  },
  // Pasos de alguien que se acerca por detrás y se detiene
  steps(n = 5, surface = null, gap = 0.55) {
    const p = Player.pos.clone(), fx = -Math.sin(Player.yaw), fz = -Math.cos(Player.yaw), surf = surface || Player.surface;
    for (let i = 0; i < n; i++) {
      const d = 6 - i * 0.6, pos = [p.x - fx * d, p.y + 0.1, p.z - fz * d];
      this.after(i * gap * rand(0.92, 1.08), () => AudioSys.stepAt(pos, surf));
    }
    this.after(n * gap + 0.3, () => Sanity.scare(0.12, 0.2));
  },
  slam(pos, v = 0.9) { AudioSys.slam(pos, v); Sanity.scare(0.18, 1.0); },
  bang(pos) { AudioSys.bang(pos, 4); Sanity.scare(0.15, 0.6); },
  lampBurst(zone, gid, pos) {
    const g = zone.groups[gid]; if (!g) return;
    AudioSys.lampPop(pos); zone.setLevel(g, 0); g.mode = 'none'; zone.flicks = zone.flicks.filter((f) => f.g !== g);
    Sanity.scare(0.12, 0.4);
  },
  phoneStart(pos) { if (!this.phone) this.phone = AudioSys.phoneRing(pos); },
  phoneAnswer() {
    if (!this.phone) { AudioSys.click(AudioSys.tmp(1, 0.1), 0.2, 2000); Hud.sub('Silencio. Ni siquiera hay tono.', 3); return; }
    this.phone.stop(); this.phone = null; AudioSys.phoneVoice();
    this.after(1.0, () => Hud.sub('«…¿sigues ahí abajo?…»', 3));
    this.after(3.4, () => Hud.sub('«…el último tren… no ha salido todavía…»', 3.5));
    this.after(6.0, () => Sanity.scare(0.15, 0.3));
  },
};
