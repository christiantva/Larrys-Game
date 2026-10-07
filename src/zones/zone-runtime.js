/* =====================================================================
   ZONA en ejecución — activar/desactivar, parpadeos, reflejos, sonido
   ===================================================================== */
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
const _v = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color(), _yAxis = new THREE.Vector3(0, 1, 0);
class Zone {
  constructor(ctx, realActive, fx) {
    this.id = ctx.id; this.group = ctx.group; this.grounds = ctx.grounds; this.surfaces = ctx.surfaces; this.colliders = ctx.colliders;
    this.portals = ctx.portals; this.inter = ctx.inter; this.spawns = ctx.spawns; this.emitterDefs = ctx.emitters;
    this.groups = ctx.groups; this.revAreas = ctx.revAreas; this.owned = ctx.owned; this.tubes = ctx.tubes; this.glints = ctx.glints;
    this.fog = ctx.fog; this.hemi = ctx.hemi; this.reverb = ctx.reverb; this.real = realActive; this.menuCamSpec = ctx.menuCam || null;
    this.matKeys = ctx.matKeys; this.variants = this.group.children.filter((o) => o.userData.cond);
    this.tubeMesh = fx.tubeMesh; this.glowGeo = fx.glowGeo; this.glintMesh = fx.glintMesh;
    this.emitters = []; this.active = false; this.flicks = [];
    this.nextFlicker = rand(CONFIG.FLICKER_MIN * 0.4, CONFIG.FLICKER_MAX * 0.6);
    for (const g of Object.values(this.groups)) if (g.mode === 'faulty') g.next = rand(3, 9);
  }
  // Muestra la geometría que corresponde al estado actual de los atajos
  refreshVariants() { for (const o of this.variants) if (!o.userData.rising) o.visible = condOk(o.userData.cond); }
  // Anima hacia arriba (persiana) la geometría que desaparece al desbloquear 'flag'
  raise(flag) {
    this.rising = this.variants.filter((o) => o.userData.cond.flag === flag && o.userData.cond.state === false);
    for (const o of this.rising) o.userData.rising = true; this.riseT = 0;
  }
  activate() {
    this.refreshVariants();
    World.scene.add(this.group);
    const fc = this.fog.color; World.scene.fog.color.setRGB(fc[0], fc[1], fc[2]); World.scene.background.setRGB(fc[0], fc[1], fc[2]);
    World.scene.fog.density = this.fog.density * Q.fog * CONFIG.FOG_MULT; GlowMat.uniforms.uFog.value = World.scene.fog.density;
    World.hemi.color.set(this.hemi.sky); World.hemi.groundColor.set(this.hemi.ground); World.hemi.intensity = this.hemi.I;
    World.lights.forEach((L, i) => {
      const d = this.real[i];
      if (d) { L.position.set(d.p[0], d.p[1], d.p[2]); L.color.setRGB(d.color[0], d.color[1], d.color[2]); L.intensity = d.I; L.distance = d.range; L.userData.base = d.I; }
      else { L.intensity = 0; L.userData.base = 0; }
    });
    this.active = true; this.revCur = null;
    for (const g of Object.values(this.groups)) this.setLevel(g, 1);
    if (AudioSys.ready) this.startAudio();
  }
  deactivate() {
    World.scene.remove(this.group); this.stopAudio(); this.active = false; this.flicks = [];
  }
  startAudio() {
    if (this.emitters.length || !AudioSys.ready) return;
    this.emitters = this.emitterDefs.map((d) => AudioSys.makeEmitter(d));
    for (const g of Object.values(this.groups)) for (const i of g.emitters) if (this.emitters[i]) this.emitters[i].setLevel(g.level > 0.5 ? 1 : 0, 0.05);
    this.revCur = null; this.updateReverb(true);
  }
  stopAudio() { for (const e of this.emitters) e.stop(); this.emitters = []; }
  // Nivel de un grupo de luces (0 = apagado, 1 = normal)
  setLevel(g, lv) {
    g.level = lv;
    if (this.tubeMesh && g.tubes.length) {
      for (const i of g.tubes) { const t = this.tubes[i]; _c.setRGB(lerp(t.off[0], t.color[0], lv), lerp(t.off[1], t.color[1], lv), lerp(t.off[2], t.color[2], lv)); this.tubeMesh.setColorAt(i, _c); }
      this.tubeMesh.instanceColor.needsUpdate = true;
    }
    if (this.glowGeo && g.glows.length) {
      const a = this.glowGeo.attributes.aColor, b = this.glowGeo.userData.base;
      for (const i of g.glows) a.setXYZ(i, b[i * 3] * lv, b[i * 3 + 1] * lv, b[i * 3 + 2] * lv);
      a.needsUpdate = true;
    }
    if (g.real != null && this.real[g.real]) { const L = World.lights[g.real]; L.intensity = (L.userData.base || 0) * lv; }
    for (const m of g.mats) m.mat.color.copy(m.base).multiplyScalar(lerp(0.04, 1, lv));
    for (const i of g.emitters) { const e = this.emitters[i]; if (e) e.setLevel(lv > 0.45 ? Math.min(1, lv * 1.1) : 0, 0.008); }
  }
  flicker(g, long) {
    if (this.flicks.some((f) => f.g === g)) return;
    const seq = [], n = randi(2, 7);
    for (let i = 0; i < n; i++) { seq.push([rand(0, 0.12), rand(0.03, 0.12)]); seq.push([rand(0.55, 1), rand(0.02, 0.16)]); }
    if (long) seq.push([0, rand(1.4, 3.6)]);
    seq.push([0, rand(0.06, 0.25)]); seq.push([1, 0]);
    this.flicks.push({ g, seq, i: -1, t: 0, prev: 1 });
  }
  update(dt, time, cam) {
    if (this.rising) {
      this.riseT += dt; const k = smooth(0, 2.6, this.riseT);
      for (const o of this.rising) { o.position.y = k * 2.15; o.updateMatrix(); o.updateMatrixWorld(true); }
      if (this.riseT >= 2.6) { for (const o of this.rising) { o.userData.rising = false; o.position.y = 0; o.updateMatrix(); } this.rising = null; this.refreshVariants(); }
    }
    // --- parpadeos aleatorios ---
    const gl = Object.values(this.groups);
    this.nextFlicker -= dt;
    if (this.nextFlicker <= 0) {
      this.nextFlicker = rand(CONFIG.FLICKER_MIN, CONFIG.FLICKER_MAX);
      const rare = gl.filter((g) => g.mode === 'rare'); if (rare.length) this.flicker(pick(rare), Math.random() < 0.25);
    }
    for (const g of gl) if (g.mode === 'faulty') { g.next -= dt; if (g.next <= 0) { g.next = rand(4, 13); this.flicker(g, Math.random() < 0.15); } }
    for (let k = this.flicks.length - 1; k >= 0; k--) {
      const f = this.flicks[k]; f.t -= dt;
      while (f.t <= 0) {
        f.i++; if (f.i >= f.seq.length) break;
        const [lv, dur] = f.seq[f.i]; f.t += dur;
        if (lv > 0.5 && f.prev < 0.3) this.tink(f.g);
        f.prev = lv; this.setLevel(f.g, lv);
      }
      if (f.i >= f.seq.length) this.flicks.splice(k, 1);
    }
    // --- reflejos falsos en el suelo ---
    if (this.glintMesh) this.updateGlints(cam);
    // --- emisores con eventos ---
    for (const e of this.emitters) if (e.update) e.update(dt);
    this.updateReverb(false);
  }
  tink(g) { if (!AudioSys.ready) return; for (const i of g.emitters) { const d = this.emitterDefs[i]; if (d && d.pos) AudioSys.tink(d.pos); } }
  updateReverb(force) {
    if (!AudioSys.ready) return;
    const p = Player.pos; let preset = this.reverb;
    for (const a of this.revAreas) { const b = a.box; if (p.x >= b.x0 && p.x <= b.x1 && p.z >= b.z0 && p.z <= b.z1 && p.y >= b.y0 && p.y <= b.y1) { preset = a.preset; break; } }
    if (force || preset !== this.revCur) { this.revCur = preset; AudioSys.setReverb(preset, force ? 0.05 : 1.4); }
  }
  // Reflejo especular falso: punto donde la luz espejada se ve en el suelo, estirado hacia la cámara
  updateGlints(cam) {
    const C = cam.position, M = this.glintMesh, fogD = World.scene.fog.density;
    for (let i = 0; i < this.glints.length; i++) {
      const g = this.glints[i], L = g.L, fy = g.fy;
      const lv = g.group ? this.groups[g.group].level : 1;
      const ch = C.y - fy, ly = 2 * fy - L[1];
      let vis = ch > 0.05 && L[1] > fy && lv > 0.02;
      let px = 0, pz = 0, t = 0;
      if (vis) { t = ch / (C.y - ly); px = C.x + (L[0] - C.x) * t; pz = C.z + (L[2] - C.z) * t; const b = g.b; vis = px > b[0] && px < b[1] && pz > b[2] && pz < b[3]; }
      if (!vis) { _m4.makeScale(0, 0, 0); M.setMatrixAt(i, _m4); continue; }
      const dx = px - C.x, dz = pz - C.z, hd = Math.hypot(dx, dz) + 1e-4;
      const graze = hd / ch; // tangente del ángulo de incidencia
      const len = g.size * g.len * (0.8 + Math.min(graze, 6) * 0.9), wid = g.size * 0.55;
      _q.setFromAxisAngle(_yAxis, Math.atan2(dx, dz));
      _m4.compose(_v.set(px, fy + 0.012, pz), _q, _s.set(wid, 1, len)); M.setMatrixAt(i, _m4);
      const dist = Math.hypot(hd, ch), fog = Math.exp(-Math.pow(fogD * dist, 2));
      const k = g.k * lv * fog * (0.45 + 0.55 * Math.min(1, graze / 3));
      M.setColorAt(i, _c.setRGB(g.color[0] * k, g.color[1] * k, g.color[2] * k));
    }
    M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true;
  }
  // Altura del suelo y superficie bajo (x,z)
  groundAt(x, z, refY) {
    let best = -Infinity, surf = 'tile', stair = null;
    for (const g of this.grounds) {
      if (x < g.x0 || x > g.x1 || z < g.z0 || z > g.z1) continue;
      const h = g.h(x, z); if (h > refY + 0.5 || h < refY - 0.6) continue;
      if (h > best) { best = h; surf = g.surface; stair = g.stair ? g : null; }
    }
    if (best === -Infinity) return null;
    let prio = 0;
    for (const s of this.surfaces) if (s.prio > prio && x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1 && Math.abs(s.y - best) < 0.35) { prio = s.prio; surf = s.surface; }
    return { y: best, surface: surf, stair };
  }
  // Suelo más alto en (x,z) sin importar la altura actual (para apariciones)
  groundTop(x, z) {
    let best = null;
    for (const g of this.grounds) { if (x < g.x0 || x > g.x1 || z < g.z0 || z > g.z1) continue; const h = g.h(x, z); if (best === null || h > best) best = h; }
    return best === null ? null : this.groundAt(x, z, best);
  }
  dispose() {
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && !o.material.userData.shared) o.material.dispose();
      if (o.isInstancedMesh) o.dispose();
    });
    for (const t of this.owned.tex) t.dispose();
    for (const m of this.owned.mat) m.dispose();
    this.group.clear();
  }
}

