/* =====================================================================
   ZONA 7 — Atrio circular con tragaluces (luz de luna, eco larguísimo)
   ===================================================================== */
function buildZone7() {
  const B = new ZoneCtx('z7');
  B.fog = { color: [0.011, 0.016, 0.03], density: 0.02 };
  B.ambient = [0.01, 0.014, 0.026];
  B.hemi = { sky: 0x34466e, ground: 0x0a0c12, I: 0.2 };
  B.reverb = 'atrium';
  const RA = 14, N = 40, moon = 0x8fb0ff, H1 = 4.5, H2 = 9.0, HW = 12.4, HT = 15.6, RI = 11;
  const P = (r, a, y) => [r * Math.cos(a), y, r * Math.sin(a)];
  const inCorr = (a) => Math.abs(Math.cos(a) * RA) < 1.7 && Math.sin(a) > 0;   // hueco del pasillo sur
  // ---------- Suelo pulido ----------
  B.floor('marble', -RA, RA, -RA, RA, 0, { seg: 1.0 });
  for (let z = -RA; z < RA; z += 1.0) { const zf = Math.max(Math.abs(z), Math.abs(z + 1)), hw = Math.sqrt(Math.max(0, (RA - 0.5) ** 2 - zf * zf)); if (hw > 0.6) B.ground(-hw, hw, z, z + 1.0, 0, 'marble'); }
  // ---------- Muro circular, galerías, ventanal corrido y techo ----------
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * PI * 2, a1 = ((i + 1) / N) * PI * 2, am = (a0 + a1) / 2, nIn = [-Math.cos(am), 0, -Math.sin(am)];
    if (!inCorr(am)) B.bt('marbleWall').quad4(P(RA, a0, 0), P(RA, a1, 0), P(RA, a1, H1), P(RA, a0, H1), { normal: nIn });
    else B.bt('marbleWall').quad4(P(RA, a0, 3.0), P(RA, a1, 3.0), P(RA, a1, H1), P(RA, a0, H1), { normal: nIn });
    for (const [y0, y1] of [[H1, H2], [H2 + 0.3, HW]]) B.bt('galleryWall').quad4(P(RA, a0, y0 + 0.3), P(RA, a1, y0 + 0.3), P(RA, a1, y1), P(RA, a0, y1), { normal: nIn, uv: 'local', repeat: [1, 1] });
    for (const y of [H1, H2]) {                     // losas de las galerías
      B.bt('ceilPanel').quad4(P(RI, a0, y), P(RA, a0, y), P(RA, a1, y), P(RI, a1, y), { normal: [0, -1, 0] });
      B.bt('white').quad4(P(RI, a0, y), P(RI, a1, y), P(RI, a1, y + 0.3), P(RI, a0, y + 0.3), { normal: [Math.cos(am), 0, Math.sin(am)] });
      B.bt('glass').quad4(P(RI + 0.05, a0, y + 0.3), P(RI + 0.05, a1, y + 0.3), P(RI + 0.05, a1, y + 1.4), P(RI + 0.05, a0, y + 1.4), { normal: [Math.cos(am), 0, Math.sin(am)] });
      B.cyl('metal', P(RI + 0.05, a0, y + 1.42), P(RI + 0.05, a1, y + 1.42), 0.025, 6);
    }
    B.glowSign(Tex.windowBand().image, P(RA - 0.05, am, (HW + HT) / 2), null, 0, 0, 1.25, { key: 'win', quad: [P(RA - 0.05, a0, HW), P(RA - 0.05, a1, HW), P(RA - 0.05, a1, HT), P(RA - 0.05, a0, HT)], normal: nIn });
    B.bt('ceilDark').quad4(P(4, a0, HT), P(RA, a0, HT), P(RA, a1, HT), P(4, a1, HT), { normal: [0, -1, 0] });
    if (i % 2 === 0) {                                // luz de luna que entra por el ventanal (horneada)
      const lp = P(RA - 0.6, am, (HW + HT) / 2);
      B.bake({ p: lp, color: lin(moon), I: 26, range: 34, dir: [-Math.cos(am) * 0.7, -0.7, -Math.sin(am) * 0.7], dmin: 0.12, bounce: 0.1 });
    }
    if (i % 3 === 0) B.glint({ L: P(RA - 0.1, am, (HW + HT) / 2), fy: 0, color: lin(moon), k: 0.32, size: 1.6, len: 1.8, b: [-RA + 0.5, RA - 0.5, -RA + 0.5, RA - 0.5] });
  }
  // tragaluz circular
  B.glowSign(Tex.skylight().image, [0, HT + 0.02, 0], '-y', 8, 8, 0.9, { key: 'sky' });
  B.bake({ p: [0, HT - 0.5, 0], color: lin(0xa8c4ff), I: 40, range: 30, dir: [0, -1, 0], dmin: 0.2, occ: false });
  B.glint({ L: [0, HT, 0], fy: 0, color: lin(0xa8c4ff), k: 0.5, size: 3.0, len: 1.4, b: [-RA, RA, -RA, RA] });
  // haces de luz (planos aditivos muy tenues)
  for (const [a, x, z] of [[0, 0, 0], [PI / 2.6, 0.6, -0.4], [-PI / 3, -0.5, 0.5]]) {
    const ca = Math.cos(a) * 3, sa = Math.sin(a) * 3;
    B.glowSign(Tex.shaft().image, [x, 7.8, z], null, 0, 0, 0.06, { key: 'shaft', additive: true, quad: [[x - ca, 0.2, z - sa], [x + ca, 0.2, z + sa], [x + ca, HT, z + sa], [x - ca, HT, z - sa]], twoSided: true });
  }
  // manchas de luz de luna en el suelo
  for (let k = 0; k < 5; k++) { const a = PI * 0.15 + k * 0.32; B.glowSign(Tex.patch().image, [Math.cos(a) * 7.5, 0.012, Math.sin(a) * 7.5 - 2], '+y', 2.4, 2.0, 0.08, { key: 'patch', additive: true }); }
  // columnas
  for (let k = 0; k < 8; k++) { const a = (k / 8) * PI * 2 + PI / 8, p = P(RI + 0.35, a, 0); B.cyl('marbleWall', p, [p[0], HT, p[2]], 0.32, 12); B.collider(p[0] - 0.35, p[0] + 0.35, p[2] - 0.35, p[2] + 0.35); }
  // ---------- Jardinera central con árbol ----------
  B.cyl('marbleWall', [0, 0, 0], [0, 0.48, 0], 2.2, 24); B.collider(-2.2, 2.2, -2.2, 2.2);
  { const g = new THREE.CircleGeometry(2.15, 24); g.rotateX(-PI / 2); B.bt('soil').geo(g, new THREE.Matrix4().setPosition(0, 0.44, 0)); }
  B.cyl('trunk', [0, 0.4, 0], [0.15, 3.6, 0.1], 0.14, 8, { r2: 0.07 });
  for (const [x, y, z, r] of [[0.1, 3.9, 0, 1.2], [-0.6, 3.3, 0.4, 0.9], [0.7, 3.4, -0.4, 0.95], [0.2, 4.6, 0.3, 0.8], [-0.3, 4.3, -0.5, 0.75]]) {
    const g = new THREE.IcosahedronGeometry(r, 1); B.bt('leaf').geo(g, new THREE.Matrix4().makeScale(1, 0.75, 1).setPosition(x, y, z));
  }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * PI * 2 + 0.3, p = P(RA - 0.8, a, 0); if (inCorr(a) || Math.abs(a - PI * 1.5) < 0.3) continue;
    B.cyl('dark', p, [p[0], 0.55, p[2]], 0.3, 10, { caps: true, r2: 0.34 }); const g = new THREE.IcosahedronGeometry(0.5, 1); B.bt('leaf').geo(g, new THREE.Matrix4().setPosition(p[0], 0.95, p[2])); B.collider(p[0] - 0.35, p[0] + 0.35, p[2] - 0.35, p[2] + 0.35); }
  // ---------- Sillas vacías en fila frente a un estandarte ----------
  const chair = (b) => {
    b.box(-0.22, 0.43, -0.22, 0.22, 0.49, 0.22); b.box(0.17, 0.49, -0.22, 0.23, 0.92, 0.22);
    for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) b.box(x - 0.015, 0, z - 0.015, x + 0.015, 0.43, z + 0.015);
  };
  const chairs = [], turned = [], R2 = mulberry32(707);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const x = -4.2 - r * 0.95, z = -3.2 + c * 0.8; if (r === 3 && c === 6) continue;   // falta una silla
    chairs.push(new THREE.Matrix4().makeRotationY((R2() - 0.5) * 0.12).setPosition(x + (R2() - 0.5) * 0.06, 0, z));
    turned.push(new THREE.Matrix4().makeRotationY(PI + (R2() - 0.5) * 0.08).setPosition(x, 0, z));      // 2º acto: miran hacia ti
  }
  B.when('act2', false, () => B.instanced('seatGrey', chair, chairs));
  B.when('act2', true, () => B.instanced('seatGrey', chair, turned));
  for (let r = 0; r < 4; r++) B.collider(-4.45 - r * 0.95, -3.95 - r * 0.95, -3.5, 3.5);
  B.poster(Signs.banner(), [-RA + 0.12, 2.5, 0], '+x', 1.6, 3.2, { off: 0.02 });
  B.box('woodBrown', -11.8, 0, -0.5, -11.2, 1.1, 0.5); B.collider(-11.85, -11.15, -0.55, 0.55);
  // atril: el diario del revisor y su tenaza
  B.note({ id: 'n7', p: [-11.5, 1.105, 0.25], box: { x0: -11.85, x1: -11.15, y0: 0.9, y1: 1.4, z0: 0.02, z1: 0.5 } });
  B.pickup({ id: 'punch', item: 'punch', p: [-11.5, 1.12, -0.25], box: { x0: -11.85, x1: -11.15, y0: 0.9, y1: 1.4, z0: -0.5, z1: -0.02 },
    build: (b) => punchProp(b, -11.5, 1.1, -0.25), label: 'Coger la tenaza', onTake: () => Scares.after(1.2, punchTicket) });
  // caballetes con pósters (exposición)
  for (let k = 0; k < 5; k++) {
    const a = PI * 0.62 + k * 0.17, p = P(9.2, a, 0), yaw = Math.atan2(-p[0], -p[2]), fx = Math.sin(yaw), fz = Math.cos(yaw);
    const c = [p[0], 1.45, p[2]], rx = Math.cos(yaw), rz = -Math.sin(yaw);
    for (const s of [-1, 1]) B.cyl('woodBrown', [p[0] + rx * 0.35 * s, 0, p[2] + rz * 0.35 * s], [p[0] + rx * 0.28 * s - fx * 0.05, 2.0, p[2] + rz * 0.28 * s - fz * 0.05], 0.02, 5);
    B.cyl('woodBrown', [p[0] - fx * 0.05, 1.9, p[2] - fz * 0.05], [p[0] - fx * 0.45, 0, p[2] - fz * 0.45], 0.02, 5);
    const ku = (k % 4) / 4;
    B.poster(Signs.expo, c, null, 0, 0, { key: 'expo', uv: [ku, 0, ku + 0.25, 1], quad: [[c[0] - rx * 0.36, 0.9, c[2] - rz * 0.36], [c[0] + rx * 0.36, 0.9, c[2] + rz * 0.36], [c[0] + rx * 0.36, 2.0, c[2] + rz * 0.36], [c[0] - rx * 0.36, 2.0, c[2] - rz * 0.36]], normal: [fx, 0, fz] });
    B.collider(p[0] - 0.4, p[0] + 0.4, p[2] - 0.4, p[2] + 0.4);
  }
  // ---------- Pasillo sur con escalera hacia la galería (zona 6) ----------
  B.floor('marble', -1.6, 1.6, RA - 0.6, 18, 0); B.ground(-1.6, 1.6, RA - 0.7, 18.01, 0, 'marble');
  B.wallX('marbleWall', -1.6, RA - 0.4, 22, -2.8, 3.0, 1); B.wallX('marbleWall', 1.6, RA - 0.4, 22, -2.8, 3.0, -1);
  B.ceil('ceilPanel', -1.6, 1.6, RA - 0.4, 22, 3.0);
  B.stairs({ axis: 'z', sTop: 18, sBot: 22, w0: -1.6, w1: 1.6, yTop: 0, yBot: -2.4, n: 14, surface: 'stair' });
  B.wallZ('marbleWall', 22, -1.6, 1.6, -2.8, 3.0, -1);
  B.tube({ p: [0, 2.94, 16.5], axis: 'z', len: 1.2, color: 0xd8e4f0, I: 3, range: 7 });
  B.portal({ x0: -1.7, x1: 1.7, z0: 20.2, z1: 22.2, y0: -4, y1: 1 }, 'z6', 'fromZ7');
  B.reverbArea({ x0: -1.7, x1: 1.7, z0: RA - 0.2, z1: 22.5, y0: -4, y1: 4 }, 'corridor');
  // ---------- Puerta de emergencia → calle (zona 1) ----------
  B.box('steel', -0.8, 0, -RA + 0.25, 0.8, 2.2, -RA + 0.32, { seg: 0.6 });
  B.box('grey', -0.86, 2.2, -RA + 0.2, 0.86, 2.28, -RA + 0.36); B.cyl('metal', [-0.5, 1.0, -RA + 0.36], [0.5, 1.0, -RA + 0.36], 0.02, 6);
  B.glowSign(Signs.exitSign(), [0, 2.55, -RA + 0.3], '+z', 0.56, 0.28, 1.4, { off: 0.01 });
  B.door({ box: { x0: -0.85, x1: 0.85, y0: 0, y1: 2.2, z0: -RA + 0.1, z1: -RA + 0.45 }, to: 'z1', spawn: 'steelDoor', unlock: 'steel', pos: [0, 1, -RA + 0.4], label: 'Salida de emergencia' });
  // luces reales: luna cenital, verde de emergencia, cálida sobre la exposición
  B.realDefs[0] = { p: [0, 12, 0], color: lin(0x9ab4ff), I: 70, range: 34, group: null, bake: { p: [0, 12, 0], color: lin(0x9ab4ff), I: 70, range: 34, dir: [0, -1, 0], dmin: 0.3 } };
  B.realDefs[1] = { p: [0, 2.4, -RA + 0.9], color: lin(0x30ff90), I: 1.6, range: 6, group: null, bake: { p: [0, 2.4, -RA + 0.9], color: lin(0x30ff90), I: 1.6, range: 6, dir: [0, -0.3, 1], dmin: 0.2 } };
  B.realDefs[2] = { p: [-9.5, 3.4, 0], color: lin(0xffd8a8), I: 6, range: 9, group: null, bake: { p: [-9.5, 3.4, 0], color: lin(0xffd8a8), I: 6, range: 9, dir: [-1, -0.5, 0], dmin: 0.3 } };
  B.glow([0, 2.55, -RA + 0.45], [0.02, 0.1, 0.05], 0.8);
  // ---------- Sonido ----------
  B.emitter({ type: 'vent', pos: [0, HT - 1, 0], gain: 0.05, ref: 6 });
  B.emitter({ type: 'wind', pos: [RA - 1, HW + 1, 0], gain: 0.025, ref: 4 });
  B.emitter({ type: 'wind', pos: [-RA + 1, HW + 1, 3], gain: 0.02, ref: 4 });
  B.emitter({ type: 'hum', pos: [0, 2.55, -RA + 0.5], gain: 0.02 });
  B.emitter({ type: 'creak', pos: [6, 8, -6], gain: 0.15, min: 20, max: 45 });
  B.emitter({ type: 'rumble', gain: 0.12, first: 40 });
  B.emitter({ type: 'roomtone', gain: 0.05, f: 160 });
  // ---------- Objetos y sustos ----------
  B.pickup({ id: 'bat7', item: 'battery', p: [-5.15, 0.5, 0.8], build: (b) => batteryProp(b, -5.15, 0.49, 0.8, 0.3) });
  B.decal('grime', Signs.grime, [0, 1.6, -RA + 0.32], '+z', 3.0, 3.0, { off: 0.01 });
  B.decal('crack', Signs.crack, [4, 0.004, 4], '+y', 2.2, 2.2);
  B.trigger({ x0: -1.6, x1: 1.6, z0: 10.5, z1: 12.5 }, () => Scares.apparition([-3.2, H1 + 0.02, -11.9], { stare: 0.7, near: 3, life: 60 }), { id: 'z7fig' });
  B.spawn('fromZ6', 0, 16.4, 0);
  B.spawn('fromZ1', 0, -RA + 1.6, PI);
  B.menuCam = null;
  return B;
}

