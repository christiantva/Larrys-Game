/* =====================================================================
   GEOMETRÍA — lotes fusionados (pocas llamadas de dibujo)
   ===================================================================== */
class Batch {
  constructor(material, o = {}) {
    this.mat = material; this.tex = o.tex ?? 1; this.seg = o.seg ?? 0.5; this.noBake = !!o.noBake; this.order = o.order ?? 0;
    this.p = []; this.n = []; this.uv = []; this.ao = []; this.ix = [];
  }
  get vc() { return this.p.length / 3; }
  // Cuadrilátero subdividido: origen o, aristas a y b. normal opcional para orientar.
  quad(o, a, b, opt = {}) {
    const la = Math.hypot(a[0], a[1], a[2]), lb = Math.hypot(b[0], b[1], b[2]);
    if (la < 1e-5 || lb < 1e-5) return;
    const seg = opt.seg ?? this.seg, tx = opt.tex ?? this.tex;
    const nu = Math.max(1, Math.ceil(la / seg - 1e-6)), nv = Math.max(1, Math.ceil(lb / seg - 1e-6));
    const ua = [a[0] / la, a[1] / la, a[2] / la], vb = [b[0] / lb, b[1] / lb, b[2] / lb];
    let nx = ua[1] * vb[2] - ua[2] * vb[1], ny = ua[2] * vb[0] - ua[0] * vb[2], nz = ua[0] * vb[1] - ua[1] * vb[0];
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    let flip = false;
    if (opt.normal) { const w = opt.normal; if (nx * w[0] + ny * w[1] + nz * w[2] < 0) { flip = true; nx = -nx; ny = -ny; nz = -nz; } }
    const base = this.vc, A = opt.ao, R = (A && A.rad) || 0.5;
    const local = opt.uv === 'local', rep = opt.repeat || [1, 1], off = opt.offset || [0, 0];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const s = i / nu, t = j / nv;
      const x = o[0] + a[0] * s + b[0] * t, y = o[1] + a[1] * s + b[1] * t, z = o[2] + a[2] * s + b[2] * t;
      this.p.push(x, y, z); this.n.push(nx, ny, nz);
      if (local) this.uv.push(off[0] + s * rep[0], off[1] + t * rep[1]);
      else this.uv.push((x * ua[0] + y * ua[1] + z * ua[2]) / tx + off[0], (x * vb[0] + y * vb[1] + z * vb[2]) / tx + off[1]);
      let k = 1;
      if (A) {
        if (A.b) k *= 1 - A.b * (1 - smooth(0, R, t * lb));
        if (A.t) k *= 1 - A.t * (1 - smooth(0, R, (1 - t) * lb));
        if (A.l) k *= 1 - A.l * (1 - smooth(0, R, s * la));
        if (A.r) k *= 1 - A.r * (1 - smooth(0, R, (1 - s) * la));
      }
      this.ao.push(k);
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const k = base + j * (nu + 1) + i, k1 = k + 1, k2 = k + nu + 2, k3 = k + nu + 1;
      if (flip) this.ix.push(k, k2, k1, k, k3, k2); else this.ix.push(k, k1, k2, k, k2, k3);
    }
  }
  // Caja de 6 caras (skip: caras a omitir)
  box(x0, y0, z0, x1, y1, z1, o = {}) {
    const sk = o.skip || [], dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
    if (!sk.includes('py')) this.quad([x0, y1, z1], [dx, 0, 0], [0, 0, -dz], { ...o, normal: [0, 1, 0] });
    if (!sk.includes('ny')) this.quad([x0, y0, z0], [dx, 0, 0], [0, 0, dz], { ...o, normal: [0, -1, 0] });
    if (!sk.includes('pz')) this.quad([x0, y0, z1], [dx, 0, 0], [0, dy, 0], { ...o, normal: [0, 0, 1] });
    if (!sk.includes('nz')) this.quad([x1, y0, z0], [-dx, 0, 0], [0, dy, 0], { ...o, normal: [0, 0, -1] });
    if (!sk.includes('px')) this.quad([x1, y0, z1], [0, 0, -dz], [0, dy, 0], { ...o, normal: [1, 0, 0] });
    if (!sk.includes('nx')) this.quad([x0, y0, z0], [0, 0, dz], [0, dy, 0], { ...o, normal: [-1, 0, 0] });
  }
  // Cuadrilátero general por 4 esquinas (interpolación bilineal); UV local o del mundo
  quad4(p00, p10, p11, p01, opt = {}) {
    const L = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const seg = opt.seg ?? this.seg, tx = opt.tex ?? this.tex;
    const nu = Math.max(1, Math.ceil(Math.max(L(p00, p10), L(p01, p11)) / seg)), nv = Math.max(1, Math.ceil(Math.max(L(p00, p01), L(p10, p11)) / seg));
    const e1 = [p10[0] - p00[0], p10[1] - p00[1], p10[2] - p00[2]], e2 = [p01[0] - p00[0], p01[1] - p00[1], p01[2] - p00[2]];
    const l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1, ua = e1.map((v) => v / l1), vb = e2.map((v) => v / l2);
    let n = [ua[1] * vb[2] - ua[2] * vb[1], ua[2] * vb[0] - ua[0] * vb[2], ua[0] * vb[1] - ua[1] * vb[0]];
    const nl = Math.hypot(...n) || 1; n = n.map((v) => v / nl);
    let flip = false; if (opt.normal && n[0] * opt.normal[0] + n[1] * opt.normal[1] + n[2] * opt.normal[2] < 0) { flip = true; n = n.map((v) => -v); }
    const base = this.vc, rep = opt.repeat || [1, 1], off = opt.offset || [0, 0];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const s = i / nu, t = j / nv, P = [0, 1, 2].map((k) => lerp(lerp(p00[k], p10[k], s), lerp(p01[k], p11[k], s), t));
      this.p.push(P[0], P[1], P[2]); this.n.push(n[0], n[1], n[2]); this.ao.push(1);
      if (opt.uv === 'local') this.uv.push(off[0] + s * rep[0], off[1] + t * rep[1]);
      else this.uv.push((P[0] * ua[0] + P[1] * ua[1] + P[2] * ua[2]) / tx + off[0], (P[0] * vb[0] + P[1] * vb[1] + P[2] * vb[2]) / tx + off[1]);
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const k = base + j * (nu + 1) + i, k1 = k + 1, k2 = k + nu + 2, k3 = k + nu + 1;
      if (flip) this.ix.push(k, k2, k1, k, k3, k2); else this.ix.push(k, k1, k2, k, k2, k3);
    }
  }
  // Añade una geometría de three.js transformada
  geo(g, m, opt = {}) {
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    const nm = new THREE.Matrix3().getNormalMatrix(m), v = new THREE.Vector3(), base = this.vc;
    const us = opt.uvScale || [1, 1];
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m); this.p.push(v.x, v.y, v.z);
      v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); this.n.push(v.x, v.y, v.z);
      if (uv) this.uv.push(uv.getX(i) * us[0], uv.getY(i) * us[1]); else this.uv.push(0, 0);
      this.ao.push(opt.ao ?? 1);
    }
    if (g.index) for (let i = 0; i < g.index.count; i++) this.ix.push(base + g.index.getX(i));
    else for (let i = 0; i < pos.count; i++) this.ix.push(base + i);
    g.dispose();
  }
  // Cilindro entre dos puntos (r en a, r2 en b)
  cyl(a, b, r, seg = 8, opt = {}) {
    const A = new THREE.Vector3(a[0], a[1], a[2]), Bv = new THREE.Vector3(b[0], b[1], b[2]);
    const d = Bv.clone().sub(A), len = d.length(); if (len < 1e-4) return;
    const g = new THREE.CylinderGeometry(opt.r2 ?? r, r, len, seg, 1, !opt.caps);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    this.geo(g, new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)), opt);
  }
  build(baker) {
    if (!this.p.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    const col = new Float32Array(this.vc * 3);
    if (this.noBake) col.fill(1); else baker(this.p, this.n, this.ao, col);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(this.ix);
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, this.mat);
    mesh.matrixAutoUpdate = false; mesh.renderOrder = this.order; mesh.userData.cond = this.cond || null;
    this.p = this.n = this.uv = this.ao = this.ix = null;
    return mesh;
  }
}

