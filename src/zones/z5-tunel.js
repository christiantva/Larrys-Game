/* =====================================================================
   ZONA 5 — Túnel en construcción (hormigón crudo, vía con balasto, luz amarilla sucia)
   ===================================================================== */
function buildZone5() {
  const B = new ZoneCtx('z5');
  B.fog = { color: [0.026, 0.02, 0.01], density: 0.045 };
  B.ambient = [0.016, 0.012, 0.006];
  B.hemi = { sky: 0x3a3020, ground: 0x100c06, I: 0.16 };
  B.reverb = 'tunnel';
  const NX0 = -12, NX1 = 20, LZ0 = -3, LZ1 = 0, TY = -1.1, TZ1 = 5.4, CH = 3.8;
  const AZ = 2.2, AR = 3.1, AYB = TY + 1.2, AX0 = -58, SY = 3.4;
  const dirty = 0xe8eec4, sodium = 0xffc477, R = mulberry32(505);
  // ---------- Repisa (andén sin terminar) ----------
  B.floor('concreteDirty', NX0, NX1, LZ0, LZ1, 0, { seg: 0.8 });
  B.ground(NX0, 4.51, LZ0, LZ1, 0, 'concrete'); B.ground(4.5, NX1, -1.6, LZ1, 0, 'concrete'); B.ground(12, NX1, LZ0, -1.6, 0, 'concrete');
  B.wallZ('concreteDirty', LZ1, NX0, NX1, TY, 0, 1);
  B.floor('yellow', NX0, NX1, -0.28, -0.12, 0.003, { seg: 4 });
  B.wallX('concreteDirty', NX0, LZ0, LZ1, TY, 0, -1);
  // ---------- Vía con balasto, carriles y traviesas ----------
  B.floor('ballast', NX0, NX1, LZ1, TZ1, TY, { seg: 1.2 });
  B.floor('ballast', AX0, NX0, AZ - AR, AZ + AR, TY, { seg: 1.2 });
  B.ground(NX0, -8, LZ1 + 0.02, 1.8, TY, 'gravel'); B.ground(-6.4, NX1, LZ1 + 0.02, 1.8, TY, 'gravel'); B.ground(NX0, NX1, 1.8, TZ1 - 0.05, TY, 'gravel');
  B.ground(AX0 + 0.3, NX0 + 0.02, AZ - AR + 0.15, AZ + AR - 0.15, TY, 'gravel');
  B.stairs({ axis: 'z', sTop: LZ1, sBot: 1.8, w0: -8, w1: -6.4, yTop: 0, yBot: TY, n: 6, surface: 'concrete', tread: 'concreteGrey', riser: 'concreteGrey' });
  for (const z of [1.75, 3.19]) B.box('rail', AX0, TY + 0.16, z - 0.035, NX1, TY + 0.3, z + 0.035, { skip: ['ny'], seg: 4 });
  const sleepers = []; for (let x = AX0 + 0.4; x < NX1; x += 0.62) sleepers.push(new THREE.Matrix4().makeRotationY((R() - 0.5) * 0.03).setPosition(x, TY, 2.47 + (R() - 0.5) * 0.04));
  B.instanced('sleeper', (b) => b.box(-0.12, 0, -1.25, 0.12, 0.16, 1.25, { skip: ['ny'] }), sleepers);
  const puddle = (x, z, rx, rz) => { const g = new THREE.CircleGeometry(1, 16); g.rotateX(-PI / 2); B.bt('puddle').geo(g, new THREE.Matrix4().makeScale(rx, 1, rz).setPosition(x, TY + 0.03, z)); B.surface(x - rx * 0.8, x + rx * 0.8, z - rz * 0.8, z + rz * 0.8, TY, 'puddle', 3); };
  puddle(-20, 2.5, 1.1, 0.5); puddle(-34, 1.0, 0.8, 0.4); puddle(-45, 4.1, 0.9, 0.5); puddle(6, 4.4, 1.0, 0.45); puddle(14, 2.4, 0.7, 0.35);
  // ---------- Sección rectangular: paredes, techo, vigas ----------
  B.wallZ('concreteDirty', LZ0, NX0, NX1, 0, CH, 1, { seg: 0.8, ao: { b: 0.4, rad: 0.3 } });
  B.wallZ('concreteDirty', LZ0, 4.5, 12, CH, 7, 1);
  B.wallZ('concreteDirty', TZ1, NX0, NX1, TY, CH, -1, { seg: 0.8, ao: { b: 0.4, rad: 0.3 } });
  B.wallX('concreteDirty', NX1, LZ0, TZ1, TY, CH, -1);
  for (let k = 0; k < 14; k++) { const z = LZ0 + 0.4 + R() * 8, y = 0.4 + R() * 3; B.cyl('rust', [NX1, y, z], [NX1 - 0.25 - R() * 0.3, y + (R() - 0.5) * 0.2, z + (R() - 0.5) * 0.2], 0.012, 4); }
  B.ceil('concreteDirty', NX0, 4.5, LZ0, TZ1, CH); B.ceil('concreteDirty', 12, NX1, LZ0, TZ1, CH); B.ceil('concreteDirty', 4.5, 12, -1.6, TZ1, CH);
  for (let x = NX0 + 1.5; x < NX1; x += 3) B.box('rust', x - 0.12, CH - 0.45, LZ0, x + 0.12, CH, TZ1, { skip: ['py'] });
  B.box('rust', NX0, 3.05, LZ0, NX1, 3.12, LZ0 + 0.45);                                   // bandeja de cables
  for (const dz of [0.1, 0.2, 0.3]) B.cyl('black', [NX0, 3.15, LZ0 + dz], [NX1, 3.15, LZ0 + dz], 0.018, 5);
  for (let k = 0; k < 9; k++) { const x = NX0 + 1 + R() * 30, z = LZ1 + 0.5 + R() * 4.5, l = 0.8 + R() * 1.4; B.cyl('black', [x, CH - 0.45, z], [x + (R() - 0.5) * 0.3, CH - 0.45 - l, z + (R() - 0.5) * 0.3], 0.012, 4); }
  // ---------- Muro de transición con boca de túnel en arco ----------
  const segs = 14;
  for (const f of [1, -1]) {
    for (let i = 0; i < segs; i++) {
      const a0 = (PI * i) / segs, a1 = (PI * (i + 1)) / segs;
      const z0 = AZ + AR * Math.cos(a0), y0 = AYB + AR * Math.sin(a0), z1 = AZ + AR * Math.cos(a1), y1 = AYB + AR * Math.sin(a1);
      B.bt('concreteDirty').quad4([NX0, y0, z0], [NX0, y1, z1], [NX0, CH, z1], [NX0, CH, z0], { normal: [f, 0, 0] });
    }
    B.bt('concreteDirty').quad4([NX0, TY, AZ + AR], [NX0, TY, TZ1], [NX0, CH, TZ1], [NX0, CH, AZ + AR], { normal: [f, 0, 0] });
    B.bt('concreteDirty').quad4([NX0, 0, LZ0], [NX0, 0, AZ - AR], [NX0, CH, AZ - AR], [NX0, CH, LZ0], { normal: [f, 0, 0] });
  }
  B.wallX('concreteDirty', NX0, AZ - AR, LZ1, TY, 0, -1);
  // ---------- Bóveda del túnel ----------
  B.arch('tunnelLining', AX0, NX0, AZ, AYB, AR, 16);
  B.wallZ('tunnelLining', AZ - AR, AX0, NX0, TY, AYB, 1); B.wallZ('tunnelLining', AZ + AR, AX0, NX0, TY, AYB, -1);
  B.wallX('plywood', AX0, AZ - AR, AZ + AR, TY, AYB + AR, 1);                                 // tabique de obra al fondo
  B.box('steel', AX0, TY, 1.7, AX0 + 0.05, TY + 2.0, 2.7, { seg: 0.6 });
  B.box('rust', AX0, TY + 2.0, 1.64, AX0 + 0.08, TY + 2.08, 2.76); B.box('rust', AX0, TY, 1.64, AX0 + 0.08, TY + 2.0, 1.7); B.box('rust', AX0, TY, 2.7, AX0 + 0.08, TY + 2.0, 2.76);
  B.poster(Signs.construction(), [AX0, TY + 1.5, 3.9], '+x', 1.0, 0.5, { off: 0.01 });
  B.door({ box: { x0: AX0 - 0.1, x1: AX0 + 0.3, y0: TY, y1: TY + 2.0, z0: 1.7, z1: 2.7 }, to: 'z6', spawn: 'fromZ5', pos: [AX0 + 0.2, TY + 1, 2.2] });
  // cables colgando a lo largo de la bóveda
  const hookZ = AZ - Math.sqrt(AR * AR - 1) + 0.08;
  for (const dy of [0.95, 1.2]) for (let x = AX0 + 2; x < NX0 - 1; x += 4) {
    const a = [x, AYB + dy, hookZ], b = [x + 4, AYB + dy, hookZ];
    let prev = a; for (let i = 1; i <= 6; i++) { const t = i / 6, p = [lerp(a[0], b[0], t), a[1] - Math.sin(t * PI) * 0.3, hookZ]; B.cyl('black', prev, p, 0.014, 4); prev = p; }
  }
  // ---------- Escalera de hormigón hacia el andén (sube junto a la pared) ----------
  B.stairs({ axis: 'x', sTop: 10.5, sBot: 4.5, w0: LZ0, w1: -1.6, yTop: SY, yBot: 0, n: 20, surface: 'concrete', tread: 'concreteGrey', riser: 'concreteGrey' });
  B.bt('concreteDirty').quad4([4.5, 0, -1.6], [10.5, 0, -1.6], [10.5, SY, -1.6], [4.5, 0.02, -1.6], { normal: [0, 0, 1] });
  B.floor('concreteDirty', 10.5, 12, LZ0, -1.6, SY); B.ground(10.49, 12, LZ0, -1.6, SY, 'concrete');
  B.wallZ('concreteDirty', -1.6, 10.5, 12, 0, SY, 1); B.wallX('concreteDirty', 12, LZ0, -1.6, 0, SY, 1);
  B.wallX('concreteDirty', 4.5, LZ0, -1.6, CH, 7, 1); B.wallX('concreteDirty', 12, LZ0, -1.6, SY, 7, -1);
  B.wallZ('concreteDirty', -1.6, 4.5, 12, CH, 7, -1); B.ceil('concreteDirty', 4.5, 12, LZ0, -1.6, 7);
  for (let x = 4.6; x <= 12; x += 1.5) { const y = x < 10.5 ? ((x - 4.5) / 6) * SY : SY; B.cyl('rust', [x, y, -1.62], [x, y + 1.0, -1.62], 0.022, 6); }
  B.rail([[4.5, 1.0, -1.62], [10.5, SY + 1.0, -1.62], [12, SY + 1.0, -1.62]], null, { key: 'rust', r: 0.024 });
  B.rail([[4.5, 0.85, LZ0 + 0.06], [10.5, SY + 0.85, LZ0 + 0.06], [11.8, SY + 0.85, LZ0 + 0.06]], [0, -1], { key: 'rust' });
  B.box('steel', 11.95, SY, -2.75, 12, SY + 2.0, -1.85, { seg: 0.6 });
  B.box('rust', 11.92, SY + 2.0, -2.81, 12, SY + 2.08, -1.79);
  B.poster(Signs.maintenance(), [11.95, SY + 2.35, -2.3], '-x', 0.8, 0.4);
  B.door({ box: { x0: 11.8, x1: 12.1, y0: SY, y1: SY + 2.0, z0: -2.75, z1: -1.85 }, to: 'z4', spawn: 'fromZ5', pos: [11.95, SY + 1, -2.3], kind: 'gate' });
  B.reverbArea({ x0: 4.5, x1: 12.2, z0: LZ0, z1: -1.6, y0: 1.2, y1: 8 }, 'stairwell');
  // ---------- Puerta de servicio (atajo hacia la escalera de la zona 2) ----------
  B.box('steel', 15.5, 0, LZ0, 16.4, 2.0, LZ0 + 0.05, { seg: 0.6 });
  B.box('rust', 15.44, 2.0, LZ0, 16.46, 2.08, LZ0 + 0.08);
  B.cyl('metal', [15.6, 1.0, LZ0 + 0.09], [16.3, 1.0, LZ0 + 0.09], 0.02, 6);
  B.glowSign(Signs.service(), [15.95, 2.32, LZ0], '+z', 1.0, 0.25, 1.1, { off: 0.005 });
  B.bake({ p: [15.95, 2.2, LZ0 + 0.6], color: lin(0x60e090), I: 0.5, range: 3, dir: [0, 0, 1], dmin: 0.1, bounce: 0.02 });
  B.door({ box: { x0: 15.5, x1: 16.4, y0: 0, y1: 2.0, z0: LZ0 - 0.1, z1: LZ0 + 0.15 }, to: 'z2', spawn: 'fromZ5', unlock: 'svcDoor', pos: [15.95, 1, LZ0 + 0.1] });
  // ---------- Carteles y materiales de obra ----------
  B.poster(Signs.safety(), [-4, 1.7, LZ0], '+z', 0.5, 0.58); B.poster(Signs.helmet(), [-3.2, 1.7, LZ0], '+z', 0.5, 0.58);
  B.poster(Signs.voltage(), [17.6, 1.6, LZ0], '+z', 0.45, 0.45, { alpha: true });
  B.box('grey', 17.2, 0.8, LZ0, 18.0, 1.3, LZ0 + 0.25); B.collider(17.2, 18.0, LZ0, LZ0 + 0.27);
  B.cyl('plywood', [-1.5, 0.62, -2.6], [-1.5, 0.62, -2.0], 0.62, 14, { caps: true }); B.collider(-2.15, -0.85, -2.65, -1.95);
  for (let k = 0; k < 5; k++) B.box('concreteGrey', 13.4, k * 0.17, -2.9 + (k % 2) * 0.05, 15.2, k * 0.17 + 0.16, -2.6 + (k % 2) * 0.05);
  B.collider(13.4, 15.2, -2.95, -2.55);
  for (const [x, z] of [[-8.3, -0.5], [-6.1, -0.45], [3.2, -0.6]]) { B.cyl('orange', [x, 0, z], [x, 0.7, z], 0.17, 10, { r2: 0.03, caps: true }); B.box('dark', x - 0.2, 0, z - 0.2, x + 0.2, 0.03, z + 0.2); }
  { const g = new THREE.SphereGeometry(0.15, 10, 6, 0, PI * 2, 0, PI / 2); B.bt('yellow').geo(g, new THREE.Matrix4().setPosition(1.1, 0.0, -0.7)); }
  B.box('blue', -10.5, 0, -2.9, -8.5, 0.35, -1.6); B.collider(-10.5, -8.5, -2.9, -1.6);
  for (const x of [-9.8, -9.2]) B.cyl('grey', [x, 0.35, -2.2], [x, 0.75, -2.2], 0.15, 10, { caps: true });
  for (const x of [0.5, 2.1]) for (const z of [-2.9, -1.9]) B.cyl('rust', [x, 0, z], [x, 3.0, z], 0.024, 6);
  for (const y of [0.9, 1.9, 2.9]) { B.cyl('rust', [0.5, y, -2.9], [2.1, y, -2.9], 0.024, 6); B.cyl('rust', [0.5, y, -1.9], [2.1, y, -1.9], 0.024, 6); }
  B.box('plywood', 0.45, 1.9, -2.95, 2.15, 1.94, -1.85); B.collider(0.4, 2.2, -2.95, -1.85);
  // ---------- Luces: tubos sucios en la pared, lámparas colgantes, piloto rojo ----------
  for (const x of [-10, -6, -2, 2, 14, 18]) {
    const real = x === 2 ? 0 : null, faulty = x === 18;
    B.tube({ p: [x, 2.7, LZ0 + 0.08], axis: 'x', len: 1.2, mount: [0, 0, -1], color: dirty, I: 3.4, range: 8, housingKey: 'rust', dead: x === -6,
      real, group: real === 0 ? 'n0' : faulty ? 'n1' : null, flicker: faulty ? 'faulty' : 'rare' });
  }
  B.tube({ p: [4.6, 5.6, -2.3], axis: 'z', len: 1.0, mount: [-1, 0, 0], color: dirty, I: 3, range: 7, housingKey: 'rust' });
  B.tube({ p: [11.0, 6.94, -2.3], axis: 'x', len: 1.0, color: dirty, I: 6, range: 10, housingKey: 'rust' });
  for (const x of [-16, -27, -38, -49]) {
    const topY = AYB + AR, by = topY - 0.75, dead = x === -38, real = x === -27 ? 1 : null;
    B.cyl('black', [x, topY, AZ + 0.4], [x, by + 0.12, AZ + 0.4], 0.01, 4);
    B.cyl('rust', [x, by + 0.12, AZ + 0.4], [x, by + 0.02, AZ + 0.4], 0.11, 8, { r2: 0.05, caps: true });
    B.emissiveBox(dead ? 0x2a2418 : sodium, dead ? 1 : 6, x - 0.05, by - 0.08, AZ + 0.35, x + 0.05, by + 0.02, AZ + 0.45);
    if (dead) continue;
    const gi = B.glow([x, by - 0.05, AZ + 0.4], scale3(lin(sodium), 0.3), 1.3);
    const L = { p: [x, by - 0.1, AZ + 0.4], color: lin(sodium), I: 14, range: 14, dmin: 0.6, dir: [0, -1, 0], bounce: 0.2 };
    if (real != null) { B.realDefs[real] = { p: L.p, color: L.color, I: 12, range: 14, group: 'w1', bake: L }; const g = B.grp('w1', 'rare'); g.real = real; g.glows.push(gi); }
    else B.bake(L);
    B.glint({ L: L.p, fy: TY + 0.03, color: lin(sodium), k: 0.6, size: 0.7, len: 1.2, b: [x - 6, x + 6, -0.5, 5], group: real != null ? 'w1' : null });
  }
  B.emissiveBox(0xff2010, 6, AX0 + 0.02, TY + 2.45, 2.1, AX0 + 0.14, TY + 2.62, 2.3);
  const rg = B.glow([AX0 + 0.25, TY + 2.53, 2.2], [0.6, 0.03, 0.01], 1.6);
  B.realDefs[2] = { p: [AX0 + 0.4, TY + 2.5, 2.2], color: lin(0xff2a14), I: 2.6, range: 8, group: 'red',
    bake: { p: [AX0 + 0.4, TY + 2.5, 2.2], color: lin(0xff2a14), I: 2.6, range: 8, dir: [1, 0, 0], dmin: 0.3 } };
  { const g = B.grp('red', 'none'); g.real = 2; g.glows.push(rg); }
  B.glint({ L: [AX0 + 0.3, TY + 2.5, 2.2], fy: TY + 0.03, color: lin(0xff2a14), k: 0.5, size: 0.6, len: 1.4, b: [AX0, AX0 + 14, 1, 4] });
  B.occluder(4.5, 12, CH, 7.1, -1.7, -1.6);
  // ---------- Sonido ----------
  B.emitter({ type: 'hum', pos: [2, 2.65, LZ0 + 0.2], gain: 0.05, group: 'n0', sizzle: 2.4 });
  B.emitter({ type: 'hum', pos: [18, 2.65, LZ0 + 0.2], gain: 0.05, group: 'n1', sizzle: 3.2 });
  B.emitter({ type: 'fan', pos: [AX0 - 1, 2.0, 2.2], gain: 0.12, ref: 3 });
  B.emitter({ type: 'drip', pos: [-20, AYB + AR - 0.1, 2.5], gain: 0.26, send: 1.0, min: 2.5, max: 7 });
  B.emitter({ type: 'drip', pos: [-44, AYB + AR - 0.1, 3.8], gain: 0.22, send: 1.0, min: 4, max: 10 });
  B.emitter({ type: 'drip', pos: [6, CH - 0.1, 4.2], gain: 0.22, send: 1.0, min: 3, max: 9 });
  B.emitter({ type: 'creak', pos: [-30, 2.2, 2.2], gain: 0.3, ref: 3 });
  B.emitter({ type: 'wind', pos: [AX0 + 4, 0.8, 2.2], gain: 0.05, ref: 3 });
  B.emitter({ type: 'rumble', gain: 0.34, first: 9 });
  B.emitter({ type: 'roomtone', gain: 0.07, f: 110 });
  B.spawn('fromZ4', 11.2, -2.3, PI / 2);
  B.spawn('fromZ2', 15.95, -2.1, PI);
  B.spawn('fromZ6', AX0 + 1.5, 2.2, -PI / 2);
  return B;
}

