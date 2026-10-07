/* =====================================================================
   TENSIÓN — sube a oscuras sin linterna y con los sustos; baja con la luz.
   No mata: deforma la imagen, acelera el latido, trae susurros y visiones.
   ===================================================================== */
const WHISPERS = ['«…まだ…»', '«…ここにいる…»', '«…0:42…»', '«…no mires atrás…»', '«…終電…»', '«…¿por qué bajaste?…»', '«…despierta…»'];
const ANNOUNCES = ['«お客様にお知らせします… 終電は… まいりません»', '«Próximo tren: ninguno. Próximo tren: ninguno.»', '«…三条京阪… 三条京阪… お忘れ物のないよう…»', '«Se ruega a los pasajeros que no miren atrás.»', '«…まだ、ここにいますか…»'];
const _eye = new THREE.Vector3();
const Sanity = {
  t: 0, vis: 0, hit: 0, pulse: 0, shake: 0, light: 1, sampleT: 0, hbT: 1, whT: 30, hallT: 40, dark: false,
  face: 0, faceT: 0, glitch: 0, blink: 0, periT: 30, subT: 60, annT: 40,
  reset(v = 0) {
    this.t = v; this.vis = v; this.hit = 0; this.pulse = 0; this.shake = 0; this.whT = rand(25, 40); this.hallT = rand(35, 60); this.hbT = 1;
    this.face = 0; this.faceT = 0; this.glitch = 0; this.blink = 0; this.periT = rand(25, 45); this.subT = rand(50, 90); this.annT = rand(30, 60);
  },
  // Imagen subliminal: 2-3 fotogramas de una cara + fallo de imagen
  flashFace() { this.face = 0.9; this.faceT = 0.06; this.glitch = 1; AudioSys.staticBurst(0.35); this.t = Math.min(1, this.t + 0.05); this.shake = Math.max(this.shake, 0.3); },
  // Parpadeo (oculta los saltos del pasillo que se repite)
  doBlink() { this.blink = 1; },
  // Cada paso propio: con tensión, a veces otro paso responde detrás (alguien camina a tu ritmo)
  onStep(surface) {
    if (this.t < 0.45 || Math.random() > (this.t - 0.35) * 0.5) return;
    const p = Player.pos, fx = -Math.sin(Player.yaw), fz = -Math.cos(Player.yaw), d = rand(2.2, 3.5);
    const pos = [p.x - fx * d, p.y + 0.1, p.z - fz * d];
    Scares.after(rand(0.16, 0.3), () => AudioSys.stepAt(pos, surface));
  },
  // Susto: sube la tensión de golpe, destello rojo y temblor
  scare(amount = 0.25, shake = 0.8) { this.t = Math.min(1, this.t + amount); this.hit = 1; this.shake = Math.max(this.shake, shake); },
  // Luz que llega a los ojos del jugador: horneada (escalada por los apagones) + luces reales
  lightLevel() {
    const z = Zones.current, p = Player.pos; _eye.set(p.x, p.y + 1.2, p.z);
    const b = z.lightAt([_eye.x, _eye.y, _eye.z]);
    let l = (0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]) * BakeK.value;
    for (const L of World.lights) {
      if (!L.visible || L.intensity <= 0) continue;
      const d2 = L.position.distanceToSquared(_eye), R2 = L.distance * L.distance; if (d2 >= R2) continue;
      const q = d2 / R2, win = (1 - q * q) ** 2, c = L.color;
      l += (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) * L.intensity * win / (d2 + 0.3) / PI * 0.5;
    }
    return l;
  },
  update(dt) {
    const z = Zones.current; if (!z) return;
    const act2 = !!Flags.act2, calm = Game.busy || Game.ui || Game.ending;
    this.sampleT -= dt;
    if (this.sampleT <= 0) { this.sampleT = 0.3; this.light = this.lightLevel(); this.dark = this.light < CONFIG.DARK_LEVEL; }
    if (!calm) {
      let rate;
      if (Flashlight.level > 0.5) rate = this.dark ? -0.006 : -CONFIG.TENSION_FALL;
      else rate = this.dark ? CONFIG.TENSION_RISE * (act2 ? 1.4 : 1) : -CONFIG.TENSION_FALL;
      this.t = clamp(this.t + rate * dt, act2 ? 0.12 : 0, 1);
    }
    this.vis += (this.t - this.vis) * (1 - Math.exp(-1.5 * dt));
    this.hit = Math.max(0, this.hit - dt * 1.4);
    this.pulse = Math.max(0, this.pulse - dt * 3.5);
    this.shake = Math.max(0, this.shake - dt * 1.2, (this.vis - 0.75) * 0.5);
    this.faceT -= dt; if (this.faceT <= 0) this.face = 0;
    this.glitch = Math.max(0, this.glitch - dt * 4); this.blink = Math.max(0, this.blink - dt * 4);
    if (calm) return;
    // algo en el borde de la visión: desaparece en cuanto lo miras
    this.periT -= dt * (0.4 + this.t);
    if (this.t > 0.35 && this.periT <= 0 && !Scares.fig) { this.periT = rand(28, 55); Scares.peripheral(); }
    // imagen subliminal con la tensión muy alta
    this.subT -= dt;
    if (this.t > 0.72 && this.subT <= 0) { this.subT = rand(45, 90); this.flashFace(); }
    // 2º acto: la megafonía habla sola
    if (act2) { this.annT -= dt; if (this.annT <= 0) { this.annT = rand(60, 120); AudioSys.announce(); Hud.sub(pick(ANNOUNCES), 4.5); } }
    // latido
    if (this.vis > 0.35) {
      this.hbT -= dt;
      if (this.hbT <= 0) { const k = (this.vis - 0.35) / 0.65; this.hbT = lerp(1.15, 0.48, k); AudioSys.heartbeat(0.22 + 0.55 * k); this.pulse = 1; }
    }
    // susurros alrededor
    if (this.t > 0.55) {
      this.whT -= dt * this.t;
      if (this.whT <= 0) {
        this.whT = rand(12, 26); const a = rand(0, PI * 2), r = rand(1.5, 3.5), p = Player.pos;
        AudioSys.whisper([p.x + Math.cos(a) * r, p.y + 1.5, p.z + Math.sin(a) * r], 0.3 + this.t * 0.2);
        if (Math.random() < 0.4) Hud.sub(pick(WHISPERS), 2.4);
      }
    }
    // visión fugaz cuando la tensión llega al límite
    this.hallT -= dt;
    if (this.t > 0.85 && this.hallT <= 0) { this.hallT = rand(30, 55); Scares.glimpse(); this.t = 0.68; }
  },
};
