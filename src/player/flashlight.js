/* =====================================================================
   LINTERNA — SpotLight con retraso al seguir la cámara y leve parpadeo
   ===================================================================== */
const Flashlight = {
  on: false, dir: new THREE.Vector3(0, 0, -1), level: 0, flick: 1, flickT: 0,
  toggle() { this.on = !this.on; AudioSys.flashClick(this.on); },
  update(dt, cam, time) {
    const fwd = _v.set(0, 0, -1).applyQuaternion(cam.quaternion);
    this.dir.lerp(fwd, 1 - Math.exp(-CONFIG.FLASH_LAG * dt)).normalize();
    this.level += ((this.on ? 1 : 0) - this.level) * (1 - Math.exp(-25 * dt));
    this.flickT -= dt;
    if (this.flickT <= 0) { this.flickT = rand(0.05, 0.12); this.flick = Math.random() < 0.025 ? rand(0.35, 0.7) : rand(0.96, 1.0); }
    const L = World.flash;
    const off = new THREE.Vector3(0.16, -0.22, 0).applyQuaternion(cam.quaternion);
    L.position.copy(cam.position).add(off);
    World.flashTarget.position.copy(L.position).add(this.dir);
    L.intensity = CONFIG.FLASH_INTENSITY * this.level * this.flick * (0.97 + Math.sin(time * 31) * 0.015);
  },
};

