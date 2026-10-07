/* =====================================================================
   ZONA 4 — Andén con puertas de seguridad (casi silencio total)
   ===================================================================== */
function buildZone4() {
  const B = new ZoneCtx('z4');
  B.fog = { color: [0.007, 0.008, 0.010], density: 0.032 };
  B.ambient = [0.005, 0.0055, 0.007];
  B.hemi = { sky: 0x252a30, ground: 0x0c0c0c, I: 0.12 };
  B.reverb = 'platform';
  const X0 = -32, X1 = 22, ZW = -3, ZP = 3, CH = 3.0, cool = 0xe4ecf4;
  const SX0 = 16.5, SX1 = 21.3, SY = 2.72, SZ0 = -3, SZ1 = 0.3, R = mulberry32(404);
  // ---------- Suelo, paredes, techo ----------
  B.floor('tileSmall', X0, SX0, ZW, ZP, 0); B.floor('tileSmall', SX0, X1, SZ1, ZP, 0);
  B.ground(X0, SX0 + 0.01, ZW, ZP, 0, 'tile'); B.ground(SX0, X1, SZ1, ZP, 0, 'tile');
  B.tactile('dots', X0 + 0.4, X1 - 0.4, ZP - 0.85, ZP - 0.55, 0);
  B.tactile('bars', X0 + 2, SX0 - 0.9, -0.15, 0.15, 0, 'x');
  B.tactile('dots', SX0 - 0.6, SX0 - 0.3, SZ0, SZ1, 0);
  B.wallZ('wallGrey', ZW, X0, X1 + 0.6, 0, SY + CH, 1, { ao: { b: 0.35, rad: 0.35 }, seg: 0.6 });
  B.wallX('wallGrey', X0, ZW, ZP + 0.3, 0, CH, 1);
  B.wallX('wallGrey', X1, SZ1 + 0.25, ZP + 0.3, 0, CH, -1);
  B.ceil('ceilDark', X0, SX0 + 0.5, ZW, ZP + 0.4, CH); B.ceil('ceilDark', SX0 + 0.5, X1, SZ1, ZP + 0.4, CH);
  B.box('dark', X0, 0, ZW, X1, 0.12, ZW + 0.02, { skip: ['ny'] });
  // ---------- Puertas de andén (PSD) ----------
  const UNIT = 4.0; let u = 0;
  for (let x = X0 + 0.5; x + UNIT <= X1 - 0.2; x += UNIT, u++) {
    B.box('psdBeige', x, 0, ZP, x + 1.0, 2.0, ZP + 0.18, { skip: ['ny'] });
    const leaves = (sh) => { for (const [a, b, s] of [[x + 1.0, x + 2.1, -1], [x + 2.1, x + 3.2, 1]]) {
      const o = s * sh;
      B.box('psdWhite', a + 0.015 + o, 0, ZP + 0.03, b - 0.015 + o, 1.95, ZP + 0.15, { skip: ['ny'] });
      B.box('glassDark', a + 0.2 + o, 0.95, ZP + 0.024, b - 0.2 + o, 1.75, ZP + 0.03, { skip: ['ny', 'py', 'px', 'nx', 'pz'] });
      B.box('dark', a + 0.48 + o, 0.15, ZP + 0.024, a + 0.62 + o, 0.9, ZP + 0.03, { skip: ['ny', 'py', 'px', 'nx', 'pz'] });
    } };
    // unidad 7: la puerta por la que se sube al último tren (final)
    if (u === 7) {
      B.when('trainHere', false, () => leaves(0));
      B.when('trainHere', true, () => {
        leaves(0.95);
        B.glowSign(trainInteriorCanvas(), [x + 2.1, 1.0, ZP + 0.33], '-z', 2.1, 2.0, 1.15, { off: 0 });
        B.interact({ x0: x + 1.0, x1: x + 3.2, y0: 0, y1: 2.0, z0: ZP - 0.3, z1: ZP + 0.3 }, () => Ending.board(), 'Subir al tren');
      });
    } else leaves(0);
    B.box('psdWhite', x + 3.2, 0, ZP, x + UNIT, 2.0, ZP + 0.18, { skip: ['ny'] });
    const cell = u % 16, cu = (cell % 4) / 4, cv = 1 - (Math.floor(cell / 4) + 1) / 4;
    B.glowSign(Signs.doorNums, [x + 2.1, 2.14, ZP], '-z', 0.2, 0.2, 1.1, { key: 'dn', uv: [cu, cv, cu + 0.25, cv + 0.25], off: 0.005 });
    B.poster(Signs.boardMark, [x + 2.1, 0.005, ZP - 0.72], '+y2', 1.0, 1.0, { key: 'bm', alpha: true });
    B.emissiveBox(R() < 0.12 ? 0xff3a2a : 0x3a1a14, R() < 0.12 ? 2 : 1, x + 1.95, 2.26, ZP - 0.01, x + 2.25, 2.3, ZP + 0.02);
  }
  B.box('psdWhite', X0 + 0.5, 2.0, ZP - 0.02, X1 - 0.2, 2.32, ZP + 0.22);
  B.collider(X0, X1, ZP - 0.02, ZP + 0.3);
  // detrás: foso oscuro (sin vía visible)
  B.floor('concreteDirty', X0, X1, ZP + 0.2, 8, -1.3, { seg: 3 });
  B.wallZ('concreteDirty', 8, X0, X1, -1.3, CH + 0.6, -1, { seg: 3 });
  B.ceil('ceilDark', X0, X1, ZP + 0.4, 8, CH + 0.6, { seg: 3 });
  // ---------- Luminaria larga continua ----------
  B.box('housing', X0 + 1, CH - 0.2, 1.62, X1 - 1, CH - 0.12, 1.88);
  for (let x = X0 + 2; x < X1 - 1; x += 3) B.cyl('metal', [x, CH - 0.12, 1.75], [x, CH, 1.75], 0.01, 4);
  const reals = [{ x: -20, i: 0, g: 'a' }, { x: -4, i: 1, g: 'b' }, { x: 12, i: 2, g: 'c' }];
  for (let x = X0 + 1.7; x < X1 - 1.2; x += 1.3) {
    const r = reals.find((q) => Math.abs(q.x - x) < 0.66), near = reals.find((q) => Math.abs(q.x - x) < 2);
    B.tube({ p: [x, CH - 0.22, 1.75], axis: 'x', len: 1.2, housing: false, color: cool, bake: false, w: 0.045, glowK: 0.14, glowSize: 0.75,
      dead: !near && R() < 0.06, real: r ? r.i : null, I: 5, range: 10, group: near ? near.g : null, flicker: 'rare' });
  }
  B.bake({ p: [(X0 + X1) / 2, CH - 0.3, 1.75], color: lin(cool), I: 40, range: 9, tube: { axis: 'x', len: X1 - X0 - 3, step: 1.5 }, dir: [0, -1, 0], dmin: 0.25 });
  for (let x = X0 + 3; x < X1 - 2; x += 4.5) B.glint({ L: [x, CH - 0.22, 1.75], fy: 0, color: lin(cool), k: 0.35, size: 0.8, len: 1.4, b: [X0, X1, ZW, ZP], group: reals.find((q) => Math.abs(q.x - x) < 2.3)?.g || null });
  // ---------- Detalles: bancos, carteles, papeleras, monitor ----------
  const bench = (b) => {
    for (let s = 0; s < 3; s++) { const x = -0.6 + s * 0.6; b.box(x - 0.25, 0.42, -0.2, x + 0.25, 0.47, 0.22); b.box(x - 0.25, 0.47, -0.26, x + 0.25, 0.88, -0.2); }
    b.box(-0.9, 0.36, -0.2, 0.9, 0.42, 0.1); for (const x of [-0.8, 0.8]) b.box(x - 0.03, 0, -0.16, x + 0.03, 0.38, 0.06);
  };
  const benches = [-24, -12, 0, 9].map((x) => { B.collider(x - 0.95, x + 0.95, ZW, ZW + 0.75); return new THREE.Matrix4().setPosition(x, 0, ZW + 0.45); });
  B.instanced('seatBlue', bench, benches);
  for (const [x, k] of [[-18, 1], [-6, 2], [5, 0]]) {
    B.box('metal', x - 0.48, 0.75, ZW, x + 0.48, 2.25, ZW + 0.03);
    B.glowSign(Signs.ads, [x, 1.5, ZW + 0.03], '+z', 0.86, 1.42, 0.9, { key: 'ads', uv: [k / 4, 0, (k + 1) / 4, 1], off: 0.003 });
    B.bake({ p: [x, 1.4, ZW + 0.6], color: lin(0xf0f2f6), I: 1.0, range: 4, dir: [0, 0, 1], dmin: 0.05, bounce: 0.05 });
  }
  for (const x of [-9, 7]) {
    B.box('dark', x - 1.2, 2.32, -1.06, x + 1.2, 2.78, -0.94);
    B.when('act2', false, () => { B.glowSign(Signs.platformName, [x, 2.55, -1.06], '-z', 2.36, 0.44, 1.2, { key: 'pn', off: 0.003 }); B.glowSign(Signs.platformName, [x, 2.55, -0.94], '+z', 2.36, 0.44, 1.2, { key: 'pn', off: 0.003 }); });
    B.when('act2', true, () => { B.glowSign(Signs.platformNameAct2, [x, 2.55, -1.06], '-z', 2.36, 0.44, 1.2, { key: 'pn2', off: 0.003 }); B.glowSign(Signs.platformNameAct2, [x, 2.55, -0.94], '+z', 2.36, 0.44, 1.2, { key: 'pn2', off: 0.003 }); });
    for (const dx of [-1, 1]) B.cyl('metal', [x + dx, 2.78, -1], [x + dx, CH, -1], 0.01, 4);
  }
  for (const x of [-21, -3, 11]) { B.box('grey', x - 0.25, 0, ZW, x + 0.25, 0.9, ZW + 0.35); B.box('dark', x - 0.2, 0.9, ZW + 0.05, x + 0.2, 0.93, ZW + 0.3); B.collider(x - 0.25, x + 0.25, ZW, ZW + 0.35); }
  B.box('dark', 13.6, 2.25, 0.6, 14.4, 2.75, 0.75); B.emissiveBox(0x8aa4c0, 0.35, 13.65, 2.3, 0.59, 14.35, 2.7, 0.6);
  B.cyl('metal', [14, 2.75, 0.68], [14, CH, 0.68], 0.015, 5);
  for (const x of [-26, -14, -2, 10]) B.box('dark', x - 0.15, CH - 0.15, -2.0, x + 0.15, CH, -1.8);
  B.box('white', -29.5, 0, ZW, -28.5, 1.83, ZW + 0.78, { skip: ['nz'] });
  B.glowSign(Signs.vending, [-29, 0.95, ZW + 0.78], '+z', 0.9, 1.72, 0.75, { key: 'vend', off: 0.004 });
  B.collider(-29.5, -28.5, ZW, ZW + 0.8); B.bake({ p: [-29, 1.1, ZW + 1.3], color: lin(0xe6f0ff), I: 3.5, range: 6, dir: [0, 0, 1], dmin: 0.05 });
  // ---------- Escalera al vestíbulo (extremo este) ----------
  B.stairs({ axis: 'x', sTop: SX1, sBot: SX0, w0: SZ0, w1: SZ1, yTop: SY, yBot: 0, n: 16 });
  B.floor('tileSmall', SX1, X1 + 0.6, SZ0, SZ1, SY); B.ground(SX1 - 0.01, X1 + 0.6, SZ0, SZ1, SY, 'tile');
  B.box('wallGrey', SX0, 0, SZ1, X1, CH, SZ1 + 0.25, { skip: ['ny', 'py'] }); B.collider(SX0, X1, SZ1, SZ1 + 0.25);
  B.wallZ('wallGrey', SZ1, SX0, X1 + 0.6, CH, SY + CH, -1);
  B.slopeCeil('ceilDark', 'x', SX0 + 0.5, SX1, CH, SY + CH - 0.2, SZ0, SZ1);
  B.ceil('ceilDark', SX1, X1 + 0.6, SZ0, SZ1, SY + CH - 0.2);
  B.wallX('wallGrey', X1 + 0.6, SZ0, SZ1, SY, SY + CH, -1);
  for (const z of [ZW + 0.07, SZ1 - 0.07]) B.rail([[SX0 - 0.4, 0.85, z], [SX0, 0.85, z], [SX1, SY + 0.85, z], [SX1 + 0.5, SY + 0.85, z]], [0, z < 0 ? -1 : 1]);
  B.tube({ p: [19.5, SY + CH - 0.3, ZW + 0.08], axis: 'x', len: 1.2, mount: [0, 0, -1], color: cool, I: 3.5, range: 8 });
  B.box('dark', SX0 - 0.2, 2.35, -2.85, SX0 - 0.08, 2.86, 0.2);
  B.glowSign(Signs.stairUp(), [SX0 - 0.2, 2.6, -1.32], '-x', 3.0, 0.47, 1.5, { off: 0.003 });
  B.bake({ p: [SX0 - 0.7, 2.5, -1.3], color: lin(0xffd060), I: 2.4, range: 5, tube: { axis: 'z', len: 2.8 }, dir: [-1, -0.3, 0], dmin: 0.1, bounce: 0.04 });
  B.portal({ x0: 19.8, x1: X1 + 0.7, z0: SZ0, z1: SZ1, y0: 1.2, y1: 5 }, 'z3', 'fromZ4');
  B.reverbArea({ x0: SX0, x1: X1 + 1, z0: SZ0, z1: SZ1, y0: 0.6, y1: 6 }, 'stairwell');
  // ---------- Puerta de mantenimiento (extremo oeste) → túnel en obras ----------
  B.box('steel', X0, 0, -1.0, X0 + 0.05, 2.0, 0.2, { seg: 0.6 });
  B.box('yellow', X0, 2.0, -1.06, X0 + 0.07, 2.08, 0.26); B.box('yellow', X0, 0, -1.06, X0 + 0.07, 2.0, -1.0); B.box('yellow', X0, 0, 0.2, X0 + 0.07, 2.0, 0.26);
  B.poster(Signs.maintenance(), [X0 + 0.05, 1.4, -0.4], '+x', 0.9, 0.45, { off: 0.003 });
  B.cyl('metal', [X0 + 0.05, 1.0, 0.05], [X0 + 0.12, 1.0, 0.05], 0.018, 6, { caps: true });
  B.emissiveBox(0xff2a1a, 2.5, X0, 2.2, -0.5, X0 + 0.08, 2.32, -0.3); B.glow([X0 + 0.15, 2.26, -0.4], [0.3, 0.02, 0.01], 0.6);
  B.door({ box: { x0: X0 - 0.1, x1: X0 + 0.3, y0: 0, y1: 2.0, z0: -1.0, z1: 0.2 }, to: 'z5', spawn: 'fromZ4', pos: [X0 + 0.1, 1, -0.4], kind: 'gate',
    flag: 'maint', item: 'key', msg: 'Cerrada con llave. 関係者以外立入禁止 — solo personal.' });
  // ---------- Objetos, notas y sustos ----------
  B.note({ id: 'n4', p: [-12.25, 0.475, ZW + 0.33] });
  phoneProp(B, 0.35, 0.47, ZW + 0.35); bagProp(B, -24.4, 0.47, ZW + 0.3); paperProp(B, 4.0, 0, -0.8, 0.4); shoeProp(B, -17.0, 0, 1.8, -0.4);
  B.pickup({ id: 'bat4', item: 'battery', p: [9.7, 0.01, ZW + 0.95], build: (b) => batteryProp(b, 9.7, 0, ZW + 0.95, 0.7) });
  B.decal('grime', Signs.grime, [-15, 1.6, ZW], '+z', 2.6, 2.6); B.decal('grime', Signs.grime, [14, 1.3, ZW], '+z', 2.0, 2.0);
  B.decal('crack', Signs.crack, [-26, 1.8, ZW], '+z', 1.6, 1.6);
  B.decal('tally', Signs.tally, [-10.6, 1.25, ZW], '+z', 1.0, 0.5);
  B.decal('hands', Signs.hands, [-22, 1.0, ZP - 0.02], '-z', 1.5, 1.5);
  // al bajar al andén: alguien espera junto a la puerta de mantenimiento
  B.trigger({ x0: 12.5, x1: 16.4, z0: ZW, z1: 0.3, y0: -1, y1: 1 }, () => Scares.apparition([X0 + 1.4, 0, -0.4], { stare: 0.5, near: 7, life: 35 }), { id: 'z4fig' });
  // golpes en las puertas de andén desde el lado de la vía
  B.trigger({ x0: -9, x1: -5, z0: ZW, z1: ZP }, () => Scares.bang([-7, 1.3, ZP + 0.3]), { id: 'z4bang' });
  // 2º acto: con el billete perforado llega el último tren
  B.when('act2', true, () => B.trigger({ x0: X0, x1: 13.5, z0: ZW, z1: ZP, y0: -1, y1: 1 }, () => Ending.arrive()));
  // ---------- Sonido: casi silencio ----------
  for (const r of reals) B.emitter({ type: 'hum', pos: [r.x, CH - 0.25, 1.75], gain: 0.028, group: r.g });
  B.emitter({ type: 'vent', pos: [0, CH, -2], gain: 0.03, ref: 4 });
  B.emitter({ type: 'vending', pos: [-29, 0.9, ZW + 0.9], gain: 0.04 });
  B.emitter({ type: 'rumble', gain: 0.28, first: 14 });
  B.emitter({ type: 'roomtone', gain: 0.06 });
  B.spawn('fromZ3', SX0 - 1.0, -1.35, PI / 2);
  B.spawn('fromZ5', X0 + 1.2, -0.4, -PI / 2);
  return B;
}

