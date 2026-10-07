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

