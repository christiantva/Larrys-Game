/* =====================================================================
   PROPS reutilizables
   ===================================================================== */
// Bicicleta "mamachari" abandonada (cilindros + toros fusionados)
function bicycle(B, x, z, rot) {
  const m = new THREE.Matrix4().makeRotationY(rot).setPosition(x, 0, z);
  const T = (p) => new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(m).toArray();
  const k = 'dark';
  for (const wx of [-0.52, 0.52]) B.bt(k).geo(new THREE.TorusGeometry(0.31, 0.022, 5, 22), m.clone().multiply(new THREE.Matrix4().setPosition(wx, 0.33, 0)));
  const tubes = [[[-0.52, 0.33, 0], [-0.05, 0.3, 0]], [[-0.52, 0.33, 0], [-0.18, 0.84, 0]], [[-0.05, 0.3, 0], [-0.18, 0.84, 0]],
    [[-0.05, 0.3, 0], [0.4, 0.72, 0]], [[0.4, 0.72, 0], [0.37, 0.98, 0]], [[0.4, 0.72, 0], [0.52, 0.33, 0]], [[-0.18, 0.84, 0], [0.38, 0.8, 0]],
    [[0.36, 0.99, -0.26], [0.36, 0.99, 0.26]], [[-0.18, 0.84, 0], [-0.2, 0.92, 0]]];
  for (const [a, b] of tubes) B.cyl('grey', T(a), T(b), 0.016, 6);
  const s = T([-0.21, 0.94, 0]); B.box('black', s[0] - 0.12, s[1], s[2] - 0.08, s[0] + 0.12, s[1] + 0.05, s[2] + 0.08);
  const bk = T([0.62, 0.86, 0]); B.box('grey', bk[0] - 0.17, bk[1] - 0.1, bk[2] - 0.16, bk[0] + 0.17, bk[1] + 0.12, bk[2] + 0.16, { skip: ['py'] });
  const c = T([0, 0, 0]); B.collider(c[0] - 0.8, c[0] + 0.8, c[2] - 0.8, c[2] + 0.8, 0, 1.2);
}
// Vallas de obra rayadas en línea a lo largo de z (cierran la calle)
function barrierZ(B, x, z0, z1, y = 0) {
  for (let z = z0; z < z1 - 0.1; z += 1.7) {
    const za = z, zb = Math.min(z + 1.6, z1);
    B.box('stripes', x - 0.04, y + 0.55, za, x + 0.04, y + 0.85, zb);
    B.box('stripes', x - 0.04, y + 0.15, za, x + 0.04, y + 0.3, zb);
    for (const zz of [za + 0.1, zb - 0.1]) B.box('grey', x - 0.25, y, zz - 0.04, x + 0.25, y + 0.95, zz + 0.04);
  }
}

// ---- Objetos recogibles (modelos pequeños) ----
function batteryProp(B, x, y, z, rot = 0) {
  for (const k of [-1, 1]) {
    const ox = Math.cos(rot) * 0.018 * k, oz = -Math.sin(rot) * 0.018 * k, ax = Math.sin(rot) * 0.025, az = Math.cos(rot) * 0.025;
    B.cyl('dark', [x + ox - ax, y + 0.009, z + oz - az], [x + ox + ax * 0.6, y + 0.009, z + oz + az * 0.6], 0.009, 6, { caps: true });
    B.cyl('yellow', [x + ox + ax * 0.6, y + 0.009, z + oz + az * 0.6], [x + ox + ax, y + 0.009, z + oz + az], 0.009, 6, { caps: true });
  }
}
function keyProp(B, x, y, z) {
  B.cyl('yellow', [x - 0.03, y + 0.003, z], [x + 0.03, y + 0.003, z], 0.004, 4, { caps: true });
  B.cyl('yellow', [x - 0.045, y + 0.003, z], [x - 0.03, y + 0.003, z], 0.012, 8, { caps: true });
  B.box('red', x - 0.09, y, z - 0.012, x - 0.055, y + 0.004, z + 0.012);
}
function fuseProp(B, x, y, z) {
  B.cyl('cream', [x - 0.03, y + 0.012, z], [x + 0.03, y + 0.012, z], 0.012, 8, { caps: true });
  for (const s of [-1, 1]) B.cyl('metal', [x + s * 0.03, y + 0.012, z], [x + s * 0.042, y + 0.012, z], 0.013, 8, { caps: true });
}
function punchProp(B, x, y, z) {
  B.box('metal', x - 0.07, y, z - 0.008, x + 0.04, y + 0.012, z + 0.008); B.box('metal', x - 0.07, y, z + 0.012, x + 0.04, y + 0.012, z + 0.028);
  B.box('dark', x + 0.03, y, z - 0.01, x + 0.07, y + 0.016, z + 0.03);
}
