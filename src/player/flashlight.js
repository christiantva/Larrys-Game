/* =====================================================================
   LINTERNA — SpotLight con retraso al seguir la cámara, parpadeo y pilas
   ===================================================================== */
const Flashlight = {
  on: false, dir: new THREE.Vector3(0, 0, -1), level: 0, flick: 1, flickT: 0, battery: CONFIG.BATTERY_START, warned: false,
  toggle() {
    if (!this.on && this.battery <= 0) {
      AudioSys.flashClick(true);
      Hud.msg('La linterna no tiene pilas.' + (Inv.has('battery') ? (Touch.enabled ? ' Usa unas pilas desde el inventario.' : ' Pulsa R para cambiarlas.') : ''));
      return;
    }
    this.on = !this.on; AudioSys.flashClick(this.on);
  },
  // Cambiar las pilas (tecla R o desde el inventario)
  reload() {
    if (!Inv.has('battery')) { Hud.msg('No tienes pilas.'); return false; }
    if (this.battery > 90) { Hud.msg('La linterna aún tiene carga.'); return false; }
    Inv.take('battery'); this.battery = Math.min(100, this.battery + CONFIG.BATTERY_PACK); this.warned = false;
    AudioSys.batterySwap(); Hud.msg('Cambias las pilas de la linterna.'); Save.write();
    return true;
  },
  update(dt, cam, time) {
    if (this.on && Game.state === 'playing' && !Game.busy) {
      this.battery = Math.max(0, this.battery - CONFIG.BATTERY_DRAIN * dt);
      if (this.battery < 15 && !this.warned) { this.warned = true; Hud.msg('La linterna se está quedando sin pilas…'); }
      if (this.battery <= 0) { this.on = false; AudioSys.flashClick(false); Hud.msg('La linterna se ha apagado. Sin pilas.'); }
    }
    const fwd = _v.set(0, 0, -1).applyQuaternion(cam.quaternion);
    this.dir.lerp(fwd, 1 - Math.exp(-CONFIG.FLASH_LAG * dt)).normalize();
    this.level += ((this.on ? 1 : 0) - this.level) * (1 - Math.exp(-25 * dt));
    const low = this.battery < 15;
    this.flickT -= dt;
    if (this.flickT <= 0) {
      this.flickT = rand(0.05, 0.12);
      this.flick = Math.random() < (low ? 0.16 : 0.025) ? rand(low ? 0.05 : 0.35, 0.7) : rand(0.96, 1.0);
    }
    const weak = this.battery < 25 ? 0.45 + 0.55 * (this.battery / 25) : 1;
    const L = World.flash;
    const off = new THREE.Vector3(0.16, -0.22, 0).applyQuaternion(cam.quaternion);
    L.position.copy(cam.position).add(off);
    World.flashTarget.position.copy(L.position).add(this.dir);
    L.intensity = CONFIG.FLASH_INTENSITY * this.level * this.flick * weak * (0.97 + Math.sin(time * 31) * 0.015);
    L.shadow.autoUpdate = L.castShadow && this.level > 0.01;
  },
};
