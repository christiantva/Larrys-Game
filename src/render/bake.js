/* ---------- Horneado de luz por vértice (con oclusión por cajas) ---------- */
function occluded(ax, ay, az, bx, by, bz, list) {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  outer: for (let k = 0; k < list.length; k++) {
    const o = list[k]; let t0 = 0, t1 = 1, ta, tb;
    if (Math.abs(dx) < 1e-9) { if (ax < o.x0 || ax > o.x1) continue; }
    else { ta = (o.x0 - ax) / dx; tb = (o.x1 - ax) / dx; if (ta > tb) { const s = ta; ta = tb; tb = s; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 >= t1) continue outer; }
    if (Math.abs(dy) < 1e-9) { if (ay < o.y0 || ay > o.y1) continue; }
    else { ta = (o.y0 - ay) / dy; tb = (o.y1 - ay) / dy; if (ta > tb) { const s = ta; ta = tb; tb = s; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 >= t1) continue outer; }
    if (Math.abs(dz) < 1e-9) { if (az < o.z0 || az > o.z1) continue; }
    else { ta = (o.z0 - az) / dz; tb = (o.z1 - az) / dz; if (ta > tb) { const s = ta; ta = tb; tb = s; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 >= t1) continue outer; }
    if (t1 - t0 > 1e-4) return true;
  }
  return false;
}
// L: { p, color (lineal), I (candelas aprox.), range, dir?, dmin?, tube? {axis,len} }
function makeBaker(lights, occ, amb) {
  const SM = [];
  for (const L of lights) {
    const n = L.tube ? Math.max(1, Math.ceil(L.tube.len / (L.tube.step || 0.9))) : 1;
    for (let k = 0; k < n; k++) {
      let x = L.p[0], y = L.p[1], z = L.p[2];
      if (L.tube) { const off = ((k + 0.5) / n - 0.5) * L.tube.len; if (L.tube.axis === 'x') x += off; else if (L.tube.axis === 'z') z += off; else y += off; }
      const I = L.I / n;
      SM.push({ x, y, z, r: L.color[0] * I, g: L.color[1] * I, b: L.color[2] * I, R2: L.range * L.range, dir: L.dir || null,
        dmin: L.dmin ?? 0.25, dexp: L.dexp ?? 1, soft: L.soft ?? 0.2, occ: L.occ !== false, bounce: L.bounce ?? 0.14, only: !!L.bounceOnly });
    }
  }
  const fn = (P, N, AO, out) => {
    const cnt = P.length / 3;
    for (let i = 0; i < cnt; i++) {
      const px = P[i * 3], py = P[i * 3 + 1], pz = P[i * 3 + 2], nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
      const hk = 0.72 + 0.28 * ny;
      let r = amb[0] * hk, g = amb[1] * hk, b = amb[2] * hk;
      const ox = px + nx * 0.04, oy = py + ny * 0.04, oz = pz + nz * 0.04;
      for (let s = 0; s < SM.length; s++) {
        const L = SM[s]; const dx = L.x - px, dy = L.y - py, dz = L.z - pz, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= L.R2) continue;
        const d = Math.sqrt(d2) || 1e-4, lx = dx / d, ly = dy / d, lz = dz / d;
        // luz directa (Lambert) + un poco de "rebote" sin orientación que imita la luz indirecta
        const ndl = (L.only ? 0 : Math.max(0, (nx * lx + ny * ly + nz * lz + 0.08) / 1.08)) + L.bounce;
        let f = 1; if (L.dir) { const c = -(lx * L.dir[0] + ly * L.dir[1] + lz * L.dir[2]); f = L.dmin + (1 - L.dmin) * Math.pow(Math.max(0, c), L.dexp); }
        const q = d2 / L.R2, win = 1 - q * q;
        const k = ndl * f * win * win / (d2 + L.soft) / PI;
        if (k < 1.5e-4) continue;
        if (L.occ && occ.length && occluded(ox, oy, oz, L.x, L.y, L.z, occ)) continue;
        r += L.r * k; g += L.g * k; b += L.b * k;
      }
      const a = AO[i]; out[i * 3] = r * a; out[i * 3 + 1] = g * a; out[i * 3 + 2] = b * a;
    }
  };
  // muestra puntual (para props instanciados)
  fn.at = (p, n = [0, 1, 0]) => { const o = new Float32Array(3); fn(p, n, [1], o); return [o[0], o[1], o[2]]; };
  return fn;
}

