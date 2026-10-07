/* =====================================================================
   JUGADOR — movimiento, colisiones AABB, escaleras, balanceo, pisadas
   ===================================================================== */
const Player = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, pitch: 0,
  eye: CONFIG.EYE_HEIGHT, crouch: false, camY: 0, surface: 'tile', stair: null,
  stepAcc: 0, stepCount: 0, bobAmp: 0, lastY: 0, moving: false,
  stamina: 1, tired: false, breathT: 2, exert: 0,   // aguante al correr y respiración
  place(sp, zone) {
    this.stamina = 1; this.tired = false; this.exert = 0;
    const g = zone.groundTop(sp.x, sp.z) || { y: 0 };
    this.pos.set(sp.x, g.y, sp.z); this.yaw = sp.yaw; this.pitch = sp.pitch || 0; this.vel.set(0, 0, 0);
    this.camY = g.y + this.eye; this.lastY = g.y; this.stepAcc = 0; this.bobAmp = 0;
  },
  look(dx, dy) {
    const k = CONFIG.MOUSE_SENS * S.sensitivity;
    this.yaw -= dx * k; this.pitch -= dy * k * (S.invertY ? -1 : 1);
    this.pitch = clamp(this.pitch, -1.45, 1.45);
  },
  toggleCrouch() { this.crouch = !this.crouch; AudioSys.rustle(this.crouch ? 0.12 : 0.09); },
  // ¿Cabe el jugador en (x,z)? Debe haber suelo bajo todo su contorno y ningún obstáculo
  canStand(zone, x, z, refY) {
    const r = CONFIG.PLAYER_RADIUS, k = r * 0.707;
    const pts = [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [k, k], [-k, k], [k, -k], [-k, -k]];
    let center = null;
    for (const [ox, oz] of pts) { const g = zone.groundAt(x + ox, z + oz, refY); if (!g) return null; if (!center) center = g; }
    const top = center.y + (this.crouch ? 1.15 : 1.75);
    for (const c of zone.colliders) {
      if (center.y > c.y1 - 0.3 || top < c.y0 || !condOk(c.cond)) continue;
      const nx = clamp(x, c.x0, c.x1), nz = clamp(z, c.z0, c.z1);
      if ((x - nx) ** 2 + (z - nz) ** 2 < r * r) return null;
    }
    return center;
  },
  update(dt, zone) {
    // --- intención de movimiento ---
    let f = 0, s = 0;
    if (Input.down('KeyW') || Input.down('ArrowUp')) f += 1;
    if (Input.down('KeyS') || Input.down('ArrowDown')) f -= 1;
    if (Input.down('KeyD') || Input.down('ArrowRight')) s += 1;
    if (Input.down('KeyA') || Input.down('ArrowLeft')) s -= 1;
    let mag = 1;
    if (Touch.ax || Touch.ay) { f = -Touch.ay; s = Touch.ax; mag = Math.min(1, Math.hypot(f, s)); }   // joystick analógico
    const wantRun = (Input.down('ShiftLeft') || Input.down('ShiftRight') || (Touch.run && mag > 0.5)) && !this.crouch && f > 0.2;
    // aguante: correr cansa; agotado no puedes correr hasta recuperar el aliento
    if (this.stamina <= 0.01) this.tired = true; else if (this.stamina > 0.35) this.tired = false;
    const running = wantRun && !this.tired;
    this.stamina = clamp(this.stamina + (running ? -dt / CONFIG.RUN_TIME : dt / CONFIG.RUN_RECOVER * (1 - Sanity.t * 0.5)), 0, 1);
    this.exert = clamp(this.exert + (running ? dt * 0.25 : -dt * 0.08), 0, 1);
    this.breathT -= dt;
    const pant = Math.max(this.exert, 1 - this.stamina, Sanity.vis * 0.8);
    if (this.breathT <= 0) { this.breathT = lerp(3.6, 0.85, pant); if (pant > 0.25) AudioSys.breath(pant, this.crouch); }
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    let wx = -sy * f + cy * s, wz = -cy * f - sy * s; const wl = Math.hypot(wx, wz); if (wl > 0) { wx /= wl; wz /= wl; }
    let speed = this.crouch ? CONFIG.CROUCH_SPEED : running ? CONFIG.RUN_SPEED : CONFIG.WALK_SPEED;
    if (this.stair) speed *= CONFIG.STAIR_SPEED;
    speed *= mag;
    const a = 1 - Math.exp(-(wl > 0 ? 9 : 11) * dt);
    this.vel.x += (wx * speed - this.vel.x) * a; this.vel.z += (wz * speed - this.vel.z) * a;
    // --- mover con deslizamiento contra paredes ---
    const dx = this.vel.x * dt, dz = this.vel.z * dt, refY = this.pos.y;
    let g = this.canStand(zone, this.pos.x + dx, this.pos.z + dz, refY), moved = 0;
    if (g) { this.pos.x += dx; this.pos.z += dz; moved = Math.hypot(dx, dz); }
    else if ((g = this.canStand(zone, this.pos.x + dx, this.pos.z, refY))) { this.pos.x += dx; moved = Math.abs(dx); this.vel.z *= 0.5; }
    else if ((g = this.canStand(zone, this.pos.x, this.pos.z + dz, refY))) { this.pos.z += dz; moved = Math.abs(dz); this.vel.x *= 0.5; }
    else { this.vel.x *= 0.2; this.vel.z *= 0.2; g = zone.groundAt(this.pos.x, this.pos.z, refY); }
    if (g) { this.pos.y = g.y; this.surface = g.surface; this.stair = g.stair; }
    // --- altura de cámara (suave en escaleras y al agacharse) ---
    const eyeT = this.crouch ? CONFIG.CROUCH_EYE : CONFIG.EYE_HEIGHT;
    this.eye += (eyeT - this.eye) * (1 - Math.exp(-8 * dt));
    this.camY += (this.pos.y + this.eye - this.camY) * (1 - Math.exp(-14 * dt));
    // --- pisadas ---
    const sp = Math.hypot(this.vel.x, this.vel.z);
    this.moving = sp > 0.25;
    let stepLen = this.crouch ? CONFIG.STEP_CROUCH : running ? CONFIG.STEP_RUN : CONFIG.STEP_WALK;
    if (this.stair) stepLen = this.stair.tread * (running ? 2 : 1) * 1.02;
    if (this.moving) {
      this.stepAcc += moved;
      if (this.stepAcc >= stepLen) {
        this.stepAcc -= stepLen; this.stepCount++;
        const dy = this.pos.y - this.lastY; this.lastY = this.pos.y;
        AudioSys.footstep(this.surface, { run: running, crouch: this.crouch, stairs: this.stair ? (dy < -0.02 ? 'down' : 'up') : null });
        Sanity.onStep(this.surface);
      }
    } else if (this.stepAcc > stepLen * 0.45 && sp < 0.08) { // paso final al detenerse
      this.stepAcc = 0; this.stepCount++; AudioSys.footstep(this.surface, { crouch: this.crouch, run: false });
    }
    const target = this.moving ? Math.min(1, sp / CONFIG.WALK_SPEED) * (running ? 1.6 : 1) : 0;
    this.bobAmp += (target - this.bobAmp) * (1 - Math.exp(-6 * dt));
  },
  applyCamera(cam, time) {
    const ph = this.stepAcc / (this.stair ? this.stair.tread : (this.crouch ? CONFIG.STEP_CROUCH : CONFIG.STEP_WALK));
    let bx = 0, by = 0, roll = 0;
    if (S.headBob) {
      const A = CONFIG.HEADBOB * this.bobAmp;
      by = -A * (0.5 + 0.5 * Math.cos(clamp(ph, 0, 1) * PI * 2));
      const side = this.stepCount % 2 ? 1 : -1;
      bx = A * 0.6 * side * Math.sin(clamp(ph, 0, 1) * PI); roll = A * 0.25 * side * Math.sin(clamp(ph, 0, 1) * PI);
    }
    const breathe = Math.sin(time * 1.6) * 0.004;
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    // temblor de cámara (sustos y tensión alta)
    const sh = Sanity.shake, sx = sh ? (Math.sin(time * 47) + Math.sin(time * 31.7)) * 0.5 * sh : 0, sy = sh ? (Math.sin(time * 53.3) + Math.sin(time * 27.1)) * 0.5 * sh : 0;
    cam.position.set(this.pos.x + rx * (bx + sx * 0.02), this.camY + by + breathe + sy * 0.015, this.pos.z + rz * (bx + sx * 0.02));
    cam.rotation.set(this.pitch + Math.sin(time * 0.8) * 0.002 + sy * 0.012, this.yaw + sx * 0.01, roll + sx * 0.008);
  },
};

