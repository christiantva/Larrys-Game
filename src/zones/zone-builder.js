/* =====================================================================
   CONSTRUCTOR DE ZONAS — helpers para levantar espacios rápidamente
   ===================================================================== */
class ZoneCtx {
  constructor(id) {
    this.id = id; this.group = new THREE.Group(); this.group.name = id;
    this.batches = new Map(); this.grounds = []; this.surfaces = []; this.colliders = []; this.occ = [];
    this.portals = []; this.inter = []; this.spawns = {}; this.lights = []; this.realDefs = [];
    this.tubes = []; this.glowsP = []; this.glints = []; this.emitters = []; this.groups = {}; this.revAreas = [];
    this.owned = { tex: [], mat: [] }; this.deferred = []; this.cond = null; this.matKeys = new Set();
    this.fog = { color: [0.01, 0.012, 0.016], density: 0.05 }; this.ambient = [0.01, 0.01, 0.012];
    this.hemi = { sky: 0x202a38, ground: 0x08090a, I: 0.2 }; this.reverb = 'stairwell';
  }
  bt(key) {
    if (typeof key !== 'string') return key; // ya es un lote
    const k = this.cond ? key + '§' + this.cond.flag + ':' + this.cond.state : key;
    let B = this.batches.get(k);
    if (!B) { const d = MDEF[key]; B = new Batch(d.mat(), d); B.cond = this.cond; this.batches.set(k, B); if (B.mat.userData.key) this.matKeys.add(B.mat.userData.key); }
    return B;
  }
  // Geometría/colisiones/interacciones que solo existen si un atajo está (o no) desbloqueado
  when(flag, state, fn) { const prev = this.cond; this.cond = { flag, state }; fn(); this.cond = prev; }
  // Lote propio con clave (para atlas de carteles/pósters compartidos por varios planos)
  ownBatch(key, make) {
    const k = key + (this.cond ? '§' + this.cond.flag + ':' + this.cond.state : '');
    let B = this.batches.get(k); if (!B) { B = make(); B.cond = this.cond; this.batches.set(k, B); } return B;
  }
  // --- Superficies básicas ---
  floor(key, x0, x1, z0, z1, y, o = {}) { this.bt(key).quad([x0, y, z1], [x1 - x0, 0, 0], [0, 0, -(z1 - z0)], { normal: [0, 1, 0], ...o }); }
  floorRot(key, x0, x1, z0, z1, y, o = {}) { this.bt(key).quad([x1, y, z1], [0, 0, -(z1 - z0)], [-(x1 - x0), 0, 0], { normal: [0, 1, 0], ...o }); }
  ceil(key, x0, x1, z0, z1, y, o = {}) { this.bt(key).quad([x0, y, z0], [x1 - x0, 0, 0], [0, 0, z1 - z0], { normal: [0, -1, 0], ...o }); }
  wallZ(key, z, x0, x1, y0, y1, f, o = {}) {
    if (f > 0) this.bt(key).quad([x0, y0, z], [x1 - x0, 0, 0], [0, y1 - y0, 0], { normal: [0, 0, 1], ...o });
    else this.bt(key).quad([x1, y0, z], [x0 - x1, 0, 0], [0, y1 - y0, 0], { normal: [0, 0, -1], ...o });
  }
  wallX(key, x, z0, z1, y0, y1, f, o = {}) {
    if (f > 0) this.bt(key).quad([x, y0, z1], [0, 0, z0 - z1], [0, y1 - y0, 0], { normal: [1, 0, 0], ...o });
    else this.bt(key).quad([x, y0, z0], [0, 0, z1 - z0], [0, y1 - y0, 0], { normal: [-1, 0, 0], ...o });
  }
  slopeCeil(key, axis, s0, s1, y0, y1, w0, w1, o = {}) {
    const P = (s, w, y) => (axis === 'z' ? [w, y, s] : [s, y, w]);
    const O = P(s0, w0, y0), A = P(s0, w1, y0), Bp = P(s1, w0, y1);
    this.bt(key).quad(O, [A[0] - O[0], A[1] - O[1], A[2] - O[2]], [Bp[0] - O[0], Bp[1] - O[1], Bp[2] - O[2]], { normal: [0, -1, 0], ...o });
  }
  box(key, x0, y0, z0, x1, y1, z1, o = {}) {
    this.bt(key).box(x0, y0, z0, x1, y1, z1, o);
    if (o.collide) this.collider(x0, x1, z0, z1, y0, y1);
    if (o.occlude) this.occluder(x0, x1, y0, y1, z0, z1);
  }
  cyl(key, a, b, r, seg = 8, o = {}) { this.bt(key).cyl(a, b, r, seg, o); }
  // Marco de un plano pegado a una pared (u hacia la derecha del observador)
  frame(c, facing, w, h, off = 0.006) {
    let a, b = [0, h, 0], n;
    switch (facing) {
      case '+z': a = [w, 0, 0]; n = [0, 0, 1]; break;
      case '-z': a = [-w, 0, 0]; n = [0, 0, -1]; break;
      case '+x': a = [0, 0, -w]; n = [1, 0, 0]; break;
      case '-x': a = [0, 0, w]; n = [-1, 0, 0]; break;
      case '+y': a = [w, 0, 0]; b = [0, 0, -h]; n = [0, 1, 0]; break;
      case '+y2': a = [-w, 0, 0]; b = [0, 0, h]; n = [0, 1, 0]; break;
      default: a = [w, 0, 0]; b = [0, 0, h]; n = [0, -1, 0];
    }
    const o = [c[0] - a[0] / 2 - b[0] / 2 + n[0] * off, c[1] - a[1] / 2 - b[1] / 2 + n[1] * off, c[2] - a[2] / 2 - b[2] / 2 + n[2] * off];
    return { o, a, b, n };
  }
  // Póster/cartel iluminado por la escena (textura propia de la zona)
  // Póster/cartel iluminado por la escena. o.key reutiliza el lote (atlas); o.uv = [u0,v0,u1,v1]
  poster(cv, c, facing, w, h, o = {}) {
    const B = this.ownBatch('P:' + (o.key || 'poster' + this.batches.size), () => {
      const t = toTex(typeof cv === 'function' ? cv() : cv, { repeat: false }); this.owned.tex.push(t);
      const m = new THREE.MeshLambertMaterial({ map: t, vertexColors: true, transparent: !!o.alpha, alphaTest: o.alpha ? 0.5 : 0 }); m.onBeforeCompile = bakePatch; this.owned.mat.push(m);
      return new Batch(m, { seg: o.seg ?? 0.5 });
    });
    this.placeQuad(B, c, facing, w, h, o);
    return B;
  }
  // Coloca un plano con UV local: marco frente a una pared, o 4 esquinas libres (o.quad)
  placeQuad(B, c, facing, w, h, o) {
    const r = o.uv || [0, 0, 1, 1], uvo = { uv: 'local', offset: [r[0], r[1]], repeat: [r[2] - r[0], r[3] - r[1]], seg: o.seg };
    if (o.quad) { const q = o.quad; B.quad4(q[0], q[1], q[2], q[3], { ...uvo, normal: o.normal }); return; }
    const f = this.frame(c, facing, w, h, o.off ?? 0.006); B.quad(f.o, f.a, f.b, { ...uvo, normal: f.n });
  }
  // Cartel con luz propia (emisivo, valores HDR). Mismas opciones que poster()
  glowSign(cv, c, facing, w, h, k = 1.6, o = {}) {
    const B = this.ownBatch('G:' + (o.key || 'gsign' + this.batches.size), () => {
      const t = toTex(typeof cv === 'function' ? cv() : cv, { repeat: false }); this.owned.tex.push(t);
      const m = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(k, k, k), transparent: !!o.alpha || !!o.additive, alphaTest: o.alpha ? 0.5 : 0 });
      if (o.additive) { m.blending = THREE.AdditiveBlending; m.depthWrite = false; }
      if (o.twoSided) m.side = THREE.DoubleSide;
      this.owned.mat.push(m);
      return new Batch(m, { noBake: true, seg: 10, order: o.additive ? 3 : 0 });
    });
    this.placeQuad(B, c, facing, w, h, { ...o, seg: 10 });
    return B;
  }
  emissiveBox(color, k, x0, y0, z0, x1, y1, z1, o = {}) {
    const B = this.ownBatch('emis_' + color + '_' + k, () => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...scale3(lin(color), k)) }); this.owned.mat.push(m); return new Batch(m, { noBake: true, seg: 10 }); });
    this.box(B, x0, y0, z0, x1, y1, z1, o);
  }
  // Props repetidos (sillas, bancos, traviesas...) como InstancedMesh con luz horneada por instancia
  instanced(matKey, build, matrices) {
    const cond = this.cond;
    this.deferred.push((baker) => {
      const pb = new Batch(null, { noBake: true }); build(pb); const geo = pb.build(null).geometry;
      const mat = MDEF[matKey].mat(); if (mat.userData.key) this.matKeys.add(mat.userData.key);
      const im = new THREE.InstancedMesh(geo, mat, matrices.length), c = new THREE.Color(), v = new THREE.Vector3();
      matrices.forEach((m, i) => { im.setMatrixAt(i, m); v.setFromMatrixPosition(m); const b = baker.at([v.x, v.y + 0.45, v.z]); im.setColorAt(i, c.setRGB(b[0], b[1], b[2])); });
      im.instanceColor.needsUpdate = true; im.computeBoundingSphere(); im.userData.cond = cond; this.group.add(im);
    });
  }
  // Bóveda de túnel (semicírculo en el plano z-y) a lo largo de x, con caras hacia dentro
  arch(key, x0, x1, zc, yb, r, n = 14, o = {}) {
    const B = this.bt(key), seg = (PI * r) / n, tx = B.tex;
    for (let i = 0; i < n; i++) {
      const a0 = (PI * i) / n, a1 = (PI * (i + 1)) / n, am = (a0 + a1) / 2;
      const p0 = [x0, yb + r * Math.sin(a0), zc + r * Math.cos(a0)], p1 = [x0, yb + r * Math.sin(a1), zc + r * Math.cos(a1)];
      B.quad(p0, [x1 - x0, 0, 0], [0, p1[1] - p0[1], p1[2] - p0[2]], { normal: [0, -Math.sin(am), -Math.cos(am)], uv: 'local',
        repeat: [(x1 - x0) / tx, seg / tx], offset: [x0 / tx, (i * seg) / tx], seg: o.seg ?? 1.0 });
    }
  }
  // Puerta: con E cambia de zona. flag = atajo requerido; unlock = atajo que desbloquea al usarla
  door({ box, to, spawn, flag = null, unlock = null, pos, kind = 'door' }) {
    this.interact(box, () => {
      if ((flag && !Flags[flag]) || !ZONE_DEFS[to]) { if (kind === 'shutter') AudioSys.shutterRattle(pos); else AudioSys.doorRattle(pos); return; }
      if (unlock) setFlag(unlock);
      AudioSys.doorOpen(pos, kind);
      Game.transition(to, spawn, kind === 'shutter' ? 1.4 : 0.35);
    });
  }
  // --- Escaleras: peldaños visibles + rampa invisible para caminar ---
  stairs({ axis, sTop, sBot, w0, w1, yTop, yBot, n, surface = 'stair', tread = 'tread', riser = 'riser' }) {
    const d = Math.sign(sBot - sTop), L = Math.abs(sBot - sTop), t = L / n, r = (yTop - yBot) / n;
    const P = (s, w, y) => (axis === 'z' ? [w, y, s] : [s, y, w]);
    const W = w1 - w0, sub = (A, B) => [A[0] - B[0], A[1] - B[1], A[2] - B[2]];
    const ax = axis === 'z' ? [0, 0, d] : [d, 0, 0];
    for (let i = 0; i < n; i++) {
      const sR = sTop + d * i * t, yHi = yTop - i * r, yLo = yTop - (i + 1) * r;
      // contrahuella: mira hacia abajo de la escalera
      const o = P(sR, w0, yLo);
      this.bt(riser).quad(o, sub(P(sR, w1, yLo), o), [0, r, 0], { normal: ax, seg: 2 });
      // huella: v=0 en el borde (nariz)
      const o2 = P(sR + d * t, w0, yLo);
      this.bt(tread).quad(o2, sub(P(sR + d * t, w1, yLo), o2), sub(P(sR, w0, yLo), o2), { normal: [0, 1, 0], uv: 'local', repeat: [W / 1.0, 1], seg: 1.2 });
    }
    const x0 = axis === 'z' ? w0 : Math.min(sTop, sBot), x1 = axis === 'z' ? w1 : Math.max(sTop, sBot);
    const z0 = axis === 'z' ? Math.min(sTop, sBot) : w0, z1 = axis === 'z' ? Math.max(sTop, sBot) : w1;
    this.grounds.push({ x0, x1, z0, z1, surface, stair: true, tread: t,
      h: (x, z) => { const s = axis === 'z' ? z : x; return lerp(yTop, yBot, clamp((s - sTop) / (sBot - sTop), 0, 1)); } });
  }
  // --- Física / lógica ---
  ground(x0, x1, z0, z1, y, surface = 'tile') { this.grounds.push({ x0, x1, z0, z1, surface, h: () => y }); }
  surface(x0, x1, z0, z1, y, surface, prio = 1) { this.surfaces.push({ x0, x1, z0, z1, y, surface, prio }); }
  collider(x0, x1, z0, z1, y0 = -100, y1 = 100) { this.colliders.push({ x0, x1, z0, z1, y0, y1, cond: this.cond }); }
  occluder(x0, x1, y0, y1, z0, z1) { this.occ.push({ x0, x1, y0, y1, z0, z1 }); }
  portal(box, to, spawn) { this.portals.push({ box, to, spawn, cond: this.cond }); }
  interact(box, action) { this.inter.push({ box, action, cond: this.cond }); }
  spawn(name, x, z, yaw, pitch = 0) { this.spawns[name] = { x, z, yaw, pitch }; }
  emitter(def) { this.emitters.push(def); if (def.group) this.grp(def.group).emitters.push(this.emitters.length - 1); }
  reverbArea(box, preset) { this.revAreas.push({ box, preset }); }
  // Suelo podotáctil amarillo (dots = advertencia, bars = guía). dir: orientación de las barras
  tactile(kind, x0, x1, z0, z1, y, dir = 'z') {
    const key = kind === 'dots' ? 'tactDots' : 'tactBars';
    if (dir === 'x') this.floorRot(key, x0, x1, z0, z1, y + 0.004, { seg: 1 }); else this.floor(key, x0, x1, z0, z1, y + 0.004, { seg: 1 });
    this.surface(x0, x1, z0, z1, y, 'tactile', 2);
  }
  // Pasamanos: polilínea de tubos + soportes hacia la pared
  rail(pts, wall, o = {}) {
    const key = o.key || 'metal', r = o.r ?? 0.022, every = o.every ?? 1.3, dist = o.dist ?? 0.065;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      this.cyl(key, a, b, r, 8);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.floor(len / every);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1), p = [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
        if (wall) this.cyl(key, p, [p[0] + wall[0] * dist, p[1] - 0.04, p[2] + wall[1] * dist], 0.009, 5);
      }
    }
    if (wall && o.ends !== false) for (const e of [pts[0], pts[pts.length - 1]]) this.cyl(key, e, [e[0] + wall[0] * dist, e[1], e[2] + wall[1] * dist], r, 8);
  }
  // --- Iluminación ---
  grp(id, mode) { const g = this.groups[id] || (this.groups[id] = { id, mode: 'rare', tubes: [], glows: [], glints: [], mats: [], real: null, emitters: [], level: 1 }); if (mode) g.mode = mode; return g; }
  bake(L) { this.lights.push(L); }
  glow(p, color, size) { this.glowsP.push({ p, color, size }); return this.glowsP.length - 1; }
  glint(o) {
    this.glints.push({ L: o.L, fy: o.fy, color: o.color, k: o.k ?? 1, size: o.size ?? 0.6, len: o.len ?? 1, b: o.b, group: o.group ?? null });
    if (o.group) this.grp(o.group).glints.push(this.glints.length - 1);
  }
  // Fluorescente: carcasa + tubo emisivo + halo + luz (horneada o real) + grupo de parpadeo
  tube(o) {
    const col = lin(o.color ?? 0xd8e6ff), len = o.len ?? 1.2, axis = o.axis ?? 'x', m = o.mount ?? [0, 1, 0], p = o.p;
    if (o.housing !== false) {
      const hl = len / 2 + 0.06, hw = 0.055, hd = 0.03;
      const ext = [axis === 'x' ? hl : (m[0] ? hd : hw), axis === 'y' ? hl : (m[1] ? hd : hw), axis === 'z' ? hl : (m[2] ? hd : hw)];
      const c = [p[0] + m[0] * 0.045, p[1] + m[1] * 0.045, p[2] + m[2] * 0.045];
      this.box(o.housingKey || 'housing', c[0] - ext[0], c[1] - ext[1], c[2] - ext[2], c[0] + ext[0], c[1] + ext[1], c[2] + ext[2]);
    }
    const ti = this.tubes.length, w = o.w ?? 0.034;
    this.tubes.push({ p, axis, len, w, color: scale3(col, o.dead ? 0.025 : (o.power ?? 3.4)), off: scale3(col, 0.025) });
    const gIdx = [];
    if (!o.dead && o.glow !== false) {
      const n = Math.max(1, Math.round(len / 0.7));
      for (let k = 0; k < n; k++) {
        const off = ((k + 0.5) / n - 0.5) * len;
        const gp = [p[0] - m[0] * 0.07 + (axis === 'x' ? off : 0), p[1] - m[1] * 0.07 + (axis === 'y' ? off : 0), p[2] - m[2] * 0.07 + (axis === 'z' ? off : 0)];
        gIdx.push(this.glow(gp, scale3(col, o.glowK ?? 0.2), o.glowSize ?? 0.95));
      }
    }
    const L = { p: [p[0] - m[0] * 0.09, p[1] - m[1] * 0.09, p[2] - m[2] * 0.09], color: col, I: o.I ?? 4, range: o.range ?? 10,
      tube: { axis, len }, dir: [-m[0], -m[1], -m[2]], dmin: o.dmin ?? 0.3 };
    if (!o.dead) {
      if (o.real != null) this.realDefs[o.real] = { p: L.p, color: col, I: o.realI ?? o.I ?? 4, range: L.range, group: o.group, bake: L };
      else if (o.bake !== false) this.lights.push(L);
    }
    if (o.group) { const G = this.grp(o.group, o.flicker); G.tubes.push(ti); G.glows.push(...gIdx); if (o.real != null) G.real = o.real; }
    return ti;
  }
  // Convierte el constructor en una zona lista (hornea luz, crea mallas)
  finalize() {
    const lights = this.lights.slice(), realActive = [];
    // luces reales activas: solo se hornea su "rebote"; las que la calidad desactiva se hornean completas
    this.realDefs.forEach((d, i) => { if (!d) return; if (i < Q.realLights) { realActive[i] = d; lights.push({ ...d.bake, bounceOnly: true }); } else lights.push(d.bake); });
    const baker = makeBaker(lights, this.occ, this.ambient);
    for (const B of this.batches.values()) { const m = B.build(baker); if (m) this.group.add(m); }
    this.cond = null;
    for (const fn of this.deferred) fn(baker, this);
    let tubeMesh = null, glowGeo = null, glintMesh = null;
    if (this.tubes.length) {
      tubeMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), TubeMat, this.tubes.length);
      const m4 = new THREE.Matrix4(), c = new THREE.Color();
      this.tubes.forEach((t, i) => {
        const s = t.axis === 'x' ? [t.len, t.w, t.w] : t.axis === 'z' ? [t.w, t.w, t.len] : [t.w, t.len, t.w];
        m4.makeScale(s[0], s[1], s[2]).setPosition(t.p[0], t.p[1], t.p[2]); tubeMesh.setMatrixAt(i, m4); tubeMesh.setColorAt(i, c.setRGB(...t.color));
      });
      tubeMesh.instanceColor.needsUpdate = true; tubeMesh.computeBoundingSphere(); this.group.add(tubeMesh);
    }
    if (this.glowsP.length) {
      const n = this.glowsP.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
      this.glowsP.forEach((g, i) => { pos.set(g.p, i * 3); col.set(g.color, i * 3); sz[i] = g.size; });
      glowGeo = new THREE.BufferGeometry();
      glowGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      glowGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      glowGeo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
      glowGeo.userData.base = col.slice();
      const pts = new THREE.Points(glowGeo, GlowMat); pts.frustumCulled = false; pts.renderOrder = 5; this.group.add(pts);
    }
    if (this.glints.length) {
      const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-PI / 2);
      glintMesh = new THREE.InstancedMesh(g, getGlintMat(), this.glints.length);
      glintMesh.frustumCulled = false; glintMesh.renderOrder = 4;
      glintMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const c = new THREE.Color(0, 0, 0); for (let i = 0; i < this.glints.length; i++) glintMesh.setColorAt(i, c);
      this.group.add(glintMesh);
    }
    this.group.updateMatrixWorld(true);
    return new Zone(this, realActive, { tubeMesh, glowGeo, glintMesh });
  }
}

