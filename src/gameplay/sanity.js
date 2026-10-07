/* =====================================================================
   TENSIÓN — sube a oscuras sin linterna y con los sustos; baja con la luz.
   No mata: deforma la imagen, acelera el latido, trae susurros y visiones.
   ===================================================================== */
const WHISPERS = ['«…まだ…»', '«…ここにいる…»', '«…0:42…»', '«…no mires atrás…»', '«…終電…»', '«…¿por qué bajaste?…»', '«…despierta…»'];
const _eye = new THREE.Vector3();
const Sanity = {
  t: 0, vis: 0, hit: 0, pulse: 0, shake: 0, light: 1, sampleT: 0, hbT: 1, whT: 30, hallT: 40, dark: false,
  reset(v = 0) { this.t = v; this.vis = v; this.hit = 0; this.pulse = 0; this.shake = 0; this.whT = rand(25, 40); this.hallT = rand(35, 60); this.hbT = 1; },
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
    if (calm) return;
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
