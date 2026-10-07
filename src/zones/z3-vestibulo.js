/* =====================================================================
   ZONA 3 — Vestíbulo de boletería (techo bajo de lamas, pilares azules, máquinas)
   ===================================================================== */
function buildZone3() {
  const B = new ZoneCtx('z3');
  B.fog = { color: [0.009, 0.010, 0.013], density: 0.03 };
  B.ambient = [0.008, 0.009, 0.011];
  B.hemi = { sky: 0x2a3340, ground: 0x12110e, I: 0.14 };
  B.reverb = 'hall';
  const CH = 2.9, X0 = -15, X1 = 16, Z0 = -8, Z1 = 8;   // vestíbulo
  const CX0 = -25, CW = 1.5, CCH = 2.6;                // pasillo hacia la zona 2
  const SW0 = 10.5, SW1 = 16, SZ = 1.6, SY = -2.72;     // hueco de la escalera al andén
  const AX0 = -6, AX1 = -3;                            // pasaje al centro comercial (atajo)
  const cool = 0xdfe8f2, R = mulberry32(303);
  // ---------- Pasillo desde la zona 2 ----------
  B.floor('terrazzo', CX0, X0, -CW, CW, 0); B.ground(CX0, X0 + 0.01, -CW, CW, 0, 'marble');
  B.wallZ('panelCream', -CW, CX0, X0, 0, CCH, 1, { ao: { b: 0.35, rad: 0.3 } });
  B.wallZ('panelCream', CW, CX0, X0, 0, CCH, -1, { ao: { b: 0.35, rad: 0.3 } });
  B.ceil('ceilPanel', CX0, X0, -CW, CW, CCH);
  B.wallX('concreteDirty', CX0, -CW, CW, 0, CCH, 1);
  B.box('grey', CX0, 2.15, -CW, CX0 + 0.35, CCH, CW);                 // caja de persiana enrollada
  B.emissiveBox(0x000000, 0, CX0 + 0.01, 0, -CW + 0.05, CX0 + 0.02, 2.15, CW - 0.05);  // oscuridad hacia la escalera
  for (const x of [-21.8, -17.6]) B.tube({ p: [x, CCH - 0.05, 0], axis: 'x', len: 1.2, color: cool, I: 3.6, range: 8 });
  B.box('dark', -19.06, 2.08, -1.0, -18.94, 2.44, 1.0);
  B.glowSign(Signs.exit2(), [-19.06, 2.26, 0], '-x', 2.0, 0.32, 1.25, { off: 0.003 });
  B.glowSign(Signs.exit2(), [-18.94, 2.26, 0], '+x', 2.0, 0.32, 1.25, { off: 0.003 });
  B.portal({ x0: CX0 - 1, x1: -23.6, z0: -CW, z1: CW, y0: -1, y1: 3 }, 'z2', 'fromZ3');
  B.reverbArea({ x0: CX0 - 1, x1: X0, z0: -CW, z1: CW, y0: -1, y1: 4 }, 'corridor');
  // ---------- Vestíbulo: suelo con el hueco de la escalera ----------
  B.floor('terrazzo', X0, X1, Z0, -SZ, 0); B.floor('terrazzo', X0, X1, SZ, Z1, 0); B.floor('terrazzo', X0, SW0, -SZ, SZ, 0);
  B.ground(X0, X1, Z0, -SZ, 0, 'marble'); B.ground(X0, X1, SZ, Z1, 0, 'marble'); B.ground(X0, SW0 + 0.01, -SZ, SZ, 0, 'marble');
  const aoW = { ao: { b: 0.35, t: 0.25, rad: 0.3 } };
  B.wallZ('panelCream', Z0, X0, X1, 0, CH, 1, aoW);
  B.wallZ('panelCream', Z1, X0, AX0, 0, CH, -1, aoW); B.wallZ('panelCream', Z1, AX1, X1, 0, CH, -1, aoW); B.wallZ('panelCream', Z1, AX0, AX1, 2.4, CH, -1);
  B.wallX('panelCream', X1, Z0, Z1, 0, CH, -1, aoW);
  B.wallX('panelCream', X0, Z0, -CW, 0, CH, 1, aoW); B.wallX('panelCream', X0, CW, Z1, 0, CH, 1, aoW); B.wallX('panelCream', X0, -CW, CW, CCH, CH, 1);
  for (const [a, b, z, n] of [[X0, X1, Z0 + 0.02, 1], [X0, AX0, Z1 - 0.02, -1], [AX1, X1, Z1 - 0.02, -1]]) B.box('dark', a, 0, Math.min(z, z + n * 0.02), b, 0.1, Math.max(z, z + n * 0.02), { skip: ['ny'] });
  B.ceil('ceilLinear', X0, X1, Z0, Z1, CH, { seg: 1.0 });
  // ---------- Filas de luz empotradas en el techo (3 de ellas son luces reales) ----------
  const reals = [{ x: -11.2, z: 2.4, i: 0, g: 'ent', mode: 'rare' }, { x: -3.6, z: -6, i: 1, g: 'mach', mode: 'rare' }, { x: 7.4, z: 2.4, i: 2, g: 'gate', mode: 'faulty' }];
  for (const z of [-6, -2.4, 2.4, 6]) {
    for (let x = X0 + 1.2; x < X1 - 0.7; x += 1.35) {
      const r = reals.find((q) => q.z === z && Math.abs(q.x - x) < 0.7), near = reals.find((q) => q.z === z && Math.abs(q.x - x) < 2.1);
      const dead = !near && R() < 0.07;
      B.tube({ p: [x, CH - 0.03, z], axis: 'x', len: 1.2, w: 0.06, housing: false, color: cool, bake: false, dead, glowK: 0.13, glowSize: 0.7,
        real: r ? r.i : null, I: 5, range: 9, group: near ? near.g : null, flicker: near ? near.mode : undefined });
    }
    B.bake({ p: [(X0 + X1) / 2, CH - 0.1, z], color: lin(cool), I: 30, range: 9, tube: { axis: 'x', len: X1 - X0 - 2, step: 1.6 }, dir: [0, -1, 0], dmin: 0.2 });
    B.emissiveBox(0x101214, 1, X0, CH - 0.004, z - 0.09, X1, CH - 0.002, z + 0.09);
  }
  for (const x of [-12, -1, 9]) B.glint({ L: [x, CH, 2.4], fy: 0, color: lin(cool), k: 0.3, size: 0.9, len: 1.4, b: [X0, X1, Z0, Z1] });
  for (const x of [-8, 3]) B.glint({ L: [x, CH, -2.4], fy: 0, color: lin(cool), k: 0.3, size: 0.9, len: 1.4, b: [X0, X1, Z0, Z1] });
  B.glint({ L: [7.4, CH, 2.4], fy: 0, color: lin(cool), k: 0.45, size: 0.9, len: 1.4, b: [X0, X1, Z0, Z1], group: 'gate' });
  // rejillas de ventilación en el techo
  for (const x of [-9, 1, 11]) B.box('grate', x - 0.4, CH - 0.02, -0.4, x + 0.4, CH, 0.4, { skip: ['py'] });
  // ---------- Pilares azules con vitrinas iluminadas ----------
  let ad = 0;
  for (const x of [-10, -4, 2]) for (const z of [-3.5, 3.5]) {
    B.box('bluePanel', x - 0.5, 0, z - 0.5, x + 0.5, 2.25, z + 0.5, { skip: ['ny'] });
    B.box('white', x - 0.48, 2.25, z - 0.48, x + 0.48, CH, z + 0.48, { skip: ['ny', 'py'] });
    B.collider(x - 0.5, x + 0.5, z - 0.5, z + 0.5);
    for (const f of [-1, 1]) {
      const k = ad++ % 4, fx = x + f * 0.5;
      B.box('metal', Math.min(fx, fx + f * 0.015), 0.66, z - 0.36, Math.max(fx, fx + f * 0.015), 1.86, z + 0.36);
      B.glowSign(Signs.ads, [fx + f * 0.015, 1.26, z], f > 0 ? '+x' : '-x', 0.62, 1.1, 0.95, { key: 'ads', uv: [k / 4, 0, (k + 1) / 4, 1], off: 0.003 });
      B.bake({ p: [fx + f * 0.5, 1.2, z], color: lin(0xf2f4f8), I: 0.9, range: 3.5, dir: [f, 0, 0], dmin: 0.05, bounce: 0.05 });
    }
  }
  // ---------- Cartel colgante bilingüe ----------
  B.box('dark', -8.06, 2.0, -3.65, -7.94, 2.65, 3.65);
  B.glowSign(Signs.hallSign, [-8.06, 2.32, 0], '-x', 7.2, 0.62, 1.35, { key: 'hall', off: 0.003 });
  B.glowSign(Signs.hallSign, [-7.94, 2.32, 0], '+x', 7.2, 0.62, 1.35, { key: 'hall', off: 0.003 });
  for (const z of [-3.2, 3.2]) B.cyl('metal', [-8, 2.65, z], [-8, CH, z], 0.012, 5);
  for (const f of [-1, 1]) B.bake({ p: [-8 + f * 0.5, 2.3, 0], color: lin(0xf4f4ee), I: 4, range: 6, tube: { axis: 'z', len: 6.8 }, dir: [f, -0.3, 0], dmin: 0.1, bounce: 0.05 });
  // ---------- Máquinas de billetes ----------
  for (let i = 0; i < 6; i++) {
    const x = -6 + i * 0.84;
    B.box('gateGrey', x, 0, Z0, x + 0.78, 1.78, Z0 + 0.62, { skip: ['nz'] });
    B.box('dark', x + 0.04, 1.78, Z0, x + 0.74, 1.84, Z0 + 0.52);
    B.glowSign(Signs.ticketMachine, [x + 0.39, 1.02, Z0 + 0.62], '+z', 0.66, 1.08, 1.05, { key: 'tm', off: 0.003 });
  }
  B.collider(-6, -6 + 6 * 0.84, Z0, Z0 + 0.66);
  // comprar un billete con las monedas
  B.interact({ x0: -6, x1: -6 + 6 * 0.84, y0: 0.4, y1: 1.7, z0: Z0 + 0.5, z1: Z0 + 0.7 }, () => {
    const pos = [-3.5, 1.1, Z0 + 0.7]; AudioSys.beep(pos);
    if (Inv.has('ticket') || Inv.has('punched')) { Hud.msg('Ya tienes un billete.'); return; }
    if (!Inv.has('coins')) { Hud.msg('きっぷ — Necesitas monedas. La máquina no acepta billetes a esta hora.'); return; }
    Inv.take('coins'); AudioSys.ticketPrint(pos); Hud.msg('Las monedas caen dentro. La máquina imprime un billete…', 3);
    Scares.after(1.6, () => Inv.add('ticket'));
  }, 'Máquina de billetes');
  B.glowSign(Signs.kippu(), [-3.5, 2.66, Z0], '+z', 5.0, 0.3, 1.3);
  B.glowSign(Signs.fareMap(), [-3.5, 2.15, Z0], '+z', 4.0, 0.62, 1.0);
  B.bake({ p: [-3.5, 1.3, Z0 + 1.2], color: lin(0xdfe8ff), I: 7, range: 7, tube: { axis: 'x', len: 5 }, dir: [0, 0, 1], dmin: 0.1 });
  B.poster(Signs.clock(), [3.6, 2.3, Z0], '+z', 0.46, 0.46, { alpha: true });
  // máquinas expendedoras (pared sur)
  for (const x of [-13.6, -12.5]) {
    B.box('white', x, 0, Z1 - 0.78, x + 1.0, 1.83, Z1, { skip: ['pz'] });
    B.glowSign(Signs.vending, [x + 0.5, 0.95, Z1 - 0.78], '-z', 0.9, 1.72, 1.2, { key: 'vend', off: 0.004 });
  }
  B.collider(-13.6, -11.5, Z1 - 0.8, Z1);
  B.bake({ p: [-12.5, 1.1, Z1 - 1.4], color: lin(0xe6f0ff), I: 6, range: 7, dir: [0, 0, -1], dmin: 0.05 });
  B.glint({ L: [-12.5, 1.4, Z1 - 0.8], fy: 0, color: lin(0xe6f0ff), k: 0.4, size: 0.9, len: 0.8, b: [X0, X1, Z0, Z1] });
  B.interact({ x0: -13.6, x1: -11.5, y0: 0.2, y1: 1.8, z0: Z1 - 0.9, z1: Z1 - 0.7 }, () => { AudioSys.beep([-12.5, 1.0, Z1 - 0.8]); Hud.msg('売切 — agotado.'); }, 'Máquina expendedora');
  for (const [x, t] of [[-10.9, 'かん・びん'], [-10.45, 'ペットボトル']]) { B.box('blue', x, 0, Z1 - 0.45, x + 0.4, 0.95, Z1); B.poster(Signs.binLabel(t), [x + 0.2, 0.72, Z1 - 0.45], '-z', 0.36, 0.18); }
  B.collider(-10.9, -10.05, Z1 - 0.45, Z1);
  // ---------- Torniquetes (改札) ----------
  const GX0 = 6.3, GX1 = 7.7;
  for (let i = 0; i < 12; i++) {
    const zc = -5.225 + i * 0.95, stop = i === 3 || i === 9;
    B.box('gateGrey', GX0, 0, zc - 0.12, GX1, 1.0, zc + 0.12, { skip: ['ny'] });
    B.box('dark', GX0 + 0.05, 1.0, zc - 0.1, GX1 - 0.05, 1.03, zc + 0.1, { skip: ['ny'] });
    B.glowSign(stop ? Signs.gateStop : Signs.gateEnd, [GX0, 0.82, zc], '-x', 0.2, 0.2, 1.3, { key: stop ? 'gs' : 'ge', off: 0.003 });
    B.glowSign(Signs.gateEnd, [GX1, 0.82, zc], '+x', 0.2, 0.2, 1.3, { key: 'ge', off: 0.003 });
    B.emissiveBox(0x3a8ae0, 1.8, GX0 + 0.25, 1.03, zc - 0.07, GX0 + 0.45, 1.04, zc + 0.07);
    B.collider(GX0, GX1, zc - 0.12, zc + 0.12);
  }
  for (const [a, b] of [[Z0, -5.35], [5.35, Z1]]) { B.box('metal', GX0 + 0.66, 0, a, GX0 + 0.72, 1.05, b); B.collider(GX0 + 0.55, GX0 + 0.85, a, b); }
  // sin billete las aletas de los torniquetes están cerradas
  B.when('gate', false, () => {
    for (let i = 0; i < 11; i++) { const za = -5.225 + i * 0.95 + 0.12, zb = za + 0.71; B.box('red', GX0 + 0.58, 0.5, za, GX0 + 0.64, 0.92, za + 0.3); B.box('red', GX0 + 0.58, 0.5, zb - 0.3, GX0 + 0.64, 0.92, zb); }
    B.collider(GX0, GX1, -5.35, 5.35);
    B.interact({ x0: GX0 - 0.25, x1: GX0 + 0.1, y0: 0, y1: 1.2, z0: -5.35, z1: 5.35 }, () => {
      const pos = [GX0, 0.9, Player.pos.z];
      if (Inv.has('ticket') || Inv.has('punched')) { AudioSys.gateOpen(pos); setFlag('gate'); Hud.msg('El torniquete se traga el billete y lo devuelve. Las aletas se abren.'); }
      else { AudioSys.keyBeep(false); Hud.msg('改札 — Necesitas un billete.'); }
    }, 'Torniquete');
  });
  B.bake({ p: [GX0 - 0.3, 0.9, 0], color: lin(0x6ab0ff), I: 1.2, range: 3, tube: { axis: 'z', len: 10.5 }, dir: [-1, 0, 0], dmin: 0.2, bounce: 0.02 });
  // panel LED "servicio terminado" sobre los torniquetes
  B.box('dark', 5.94, 2.2, -1.8, 6.08, 2.7, 1.8);
  B.when('act2', false, () => { B.glowSign(Signs.ledBoard, [5.94, 2.45, 0], '-x', 3.4, 0.45, 1.7, { key: 'led', off: 0.003 }); B.glowSign(Signs.ledBoard, [6.08, 2.45, 0], '+x', 3.4, 0.45, 1.7, { key: 'led', off: 0.003 }); });
  B.when('act2', true, () => { B.glowSign(Signs.ledBoardAct2, [5.94, 2.45, 0], '-x', 3.4, 0.45, 1.9, { key: 'led2', off: 0.003 }); B.glowSign(Signs.ledBoardAct2, [6.08, 2.45, 0], '+x', 3.4, 0.45, 1.9, { key: 'led2', off: 0.003 }); });
  for (const z of [-1.5, 1.5]) B.cyl('metal', [6.01, 2.7, z], [6.01, CH, z], 0.012, 5);
  B.bake({ p: [5.6, 2.4, 0], color: lin(0xff8a2a), I: 1.4, range: 4, tube: { axis: 'z', len: 3 }, dir: [-1, -0.2, 0], dmin: 0.2, bounce: 0.03 });
  // lado de pago: máquinas de ajuste, oficina
  for (let i = 0; i < 2; i++) {
    const x = 8.5 + i * 0.84;
    B.box('gateGrey', x, 0, Z0, x + 0.78, 1.78, Z0 + 0.62, { skip: ['nz'] });
    B.glowSign(Signs.ticketMachine, [x + 0.39, 1.02, Z0 + 0.62], '+z', 0.66, 1.08, 1.05, { key: 'tm', off: 0.003 });
  }
  B.collider(8.5, 10.2, Z0, Z0 + 0.66);
  B.glowSign(Signs.fareAdjust(), [9.34, 2.3, Z0], '+z', 1.7, 0.32, 1.2);
  B.box('glassDark', 11.0, 0.9, Z0, 15.4, 2.3, Z0 + 0.04, { skip: ['ny', 'nz'] });
  B.box('gateGrey', 11.0, 0, Z0, 15.4, 0.9, Z0 + 0.3);
  B.collider(11.0, 15.4, Z0, Z0 + 0.32);
  B.glowSign(Signs.office(), [13.2, 2.55, Z0], '+z', 1.9, 0.36, 1.1);
  B.bake({ p: [12.0, 1.6, Z0 - 1.0], color: lin(0xfff0d0), I: 0.6, range: 4, dir: [0, 0, 1], dmin: 0.1, occ: false });
  // ---------- Escalera al andén ----------
  B.stairs({ axis: 'x', sTop: SW0, sBot: 15.3, w0: -SZ, w1: SZ, yTop: 0, yBot: SY, n: 16 });
  B.floor('terrazzo', 15.3, SW1, -SZ, SZ, SY); B.ground(15.29, SW1, -SZ, SZ, SY, 'marble');
  B.wallZ('panelCream', -SZ, SW0, SW1, SY - 0.1, 0, 1); B.wallZ('panelCream', SZ, SW0, SW1, SY - 0.1, 0, -1);
  B.wallX('panelCream', SW1, -SZ, SZ, SY - 0.1, 0, -1);
  for (const z of [-SZ, SZ]) {
    B.box('glass', SW0 + 0.1, 0.02, z - 0.012, SW1, 1.0, z + 0.012, { seg: 3 });
    B.cyl('metal', [SW0 + 0.1, 1.04, z], [SW1, 1.04, z], 0.025, 8);
    for (let x = SW0 + 0.1; x <= SW1; x += 1.37) B.cyl('metal', [x, 0, z], [x, 1.04, z], 0.02, 6);
    B.rail([[SW0 - 0.2, 0.85, z * 0.95], [SW0, 0.85, z * 0.95], [15.3, SY + 0.85, z * 0.95], [15.8, SY + 0.85, z * 0.95]], [0, Math.sign(z)], { ends: false });
  }
  B.tube({ p: [SW1 - 0.06, -0.55, 0], axis: 'z', len: 1.2, mount: [1, 0, 0], color: cool, I: 3, range: 7 });
  B.box('dark', SW0 - 0.36, 2.2, -1.6, SW0 - 0.24, 2.72, 1.6);
  B.glowSign(Signs.platformYellow(), [SW0 - 0.36, 2.46, 0], '-x', 3.2, 0.5, 1.4, { off: 0.003 });
  B.bake({ p: [SW0 - 0.8, 2.4, 0], color: lin(0xffd060), I: 2.2, range: 5, tube: { axis: 'z', len: 3 }, dir: [-1, -0.3, 0], dmin: 0.1, bounce: 0.04 });
  B.portal({ x0: 13.6, x1: SW1 + 1, z0: -SZ, z1: SZ, y0: -4, y1: -0.8 }, 'z4', 'fromZ3');
  B.reverbArea({ x0: SW0 + 0.6, x1: SW1 + 1, z0: -SZ, z1: SZ, y0: -4, y1: -0.3 }, 'stairwell');
  B.occluder(SW0, SW1, -0.4, -0.05, -8, -SZ); B.occluder(SW0, SW1, -0.4, -0.05, SZ, 8);
  // ---------- Pasaje al centro comercial (atajo desde la zona 6) ----------
  B.floor('terrazzo', AX0, AX1, Z1, 11.6, 0); B.ground(AX0, AX1, Z1 - 0.01, 11.3, 0, 'marble');
  B.wallX('panelCream', AX0, Z1, 11.6, 0, 2.4, 1); B.wallX('panelCream', AX1, Z1, 11.6, 0, 2.4, -1);
  B.ceil('ceilPanel', AX0, AX1, Z1, 11.6, 2.4);
  B.wallZ('concreteDirty', 11.6, AX0, AX1, 0, 2.4, -1);
  B.box('grey', AX0, 2.2, 10.2, AX1, 2.4, 10.5);
  B.when('arcade', false, () => {
    B.box('shutter', AX0, 0, 10.25, AX1, 2.2, 10.35, { seg: 0.6 }); B.collider(AX0, AX1, 10.2, 10.4);
    B.poster(Signs.shutterNotice(), [-4.5, 1.4, 10.25], '-z', 0.42, 0.33);
    B.interact({ x0: AX0, x1: AX1, y0: 0, y1: 2.2, z0: 10.0, z1: 10.4 }, () => AudioSys.shutterRattle([-4.5, 1.1, 10.3]));
  });
  B.when('arcade', true, () => {
    B.emissiveBox(0x000000, 0, AX0 + 0.02, 0, 11.55, AX1 - 0.02, 2.39, 11.58);
    B.portal({ x0: AX0, x1: AX1, z0: 10.7, z1: 12, y0: -1, y1: 3 }, 'z6', 'fromZ3');
  });
  B.glowSign(Signs.mall(), [-4.5, 2.62, Z1], '-z', 2.6, 0.4, 1.2, { off: 0.01 });
  B.tube({ p: [-4.5, 2.36, 9.2], axis: 'z', len: 1.2, color: 0xd0dcea, I: 2, range: 6, power: 2.4 });
  B.reverbArea({ x0: AX0, x1: AX1, z0: Z1, z1: 12, y0: -1, y1: 4 }, 'corridor');
  // ---------- Suelo podotáctil ----------
  B.tactile('bars', CX0 + 0.6, -3.65, -0.15, 0.15, 0, 'x'); B.tactile('dots', -3.65, -3.35, -0.15, 0.15, 0);
  B.tactile('bars', -3.65, -3.35, Z0 + 1.1, -0.15, 0, 'z'); B.tactile('dots', -3.65, -3.35, Z0 + 0.8, Z0 + 1.1, 0);
  B.tactile('bars', -3.35, 5.55, -0.15, 0.15, 0, 'x'); B.tactile('dots', 5.55, 5.85, -0.45, 0.45, 0);
  B.tactile('bars', 8.1, SW0 - 0.6, -0.15, 0.15, 0, 'x'); B.tactile('dots', SW0 - 0.6, SW0 - 0.3, -SZ, SZ, 0);
  B.tactile('dots', -5.35, -5.05, -0.15, 0.15, 0); B.tactile('bars', -5.35, -5.05, 0.15, Z1 + 1.5, 0, 'z');
  // ---------- Objetos, notas y sustos ----------
  B.note({ id: 'n3', p: [-1.0, 0.004, -6.95] });
  bagProp(B, 1.3, 0, -3.0); shoeProp(B, 3.6, 0, 5.2, 2.2, 'woodBrown'); canProp(B, -11.6, 0, 6.8, false); paperProp(B, -7.2, 0, 5.8, 2.6);
  B.pickup({ id: 'bat3', item: 'battery', p: [-4.0, 0.01, 4.25], build: (b) => batteryProp(b, -4.0, 0, 4.25, 2.1) });
  B.decal('grime', Signs.grime, [13.2, 1.6, Z0], '+z', 3.0, 2.4);
  B.decal('tape', Signs.tape, [13.2, 1.2, Z0 + 0.05], '+z', 4.4, 0.12, { off: 0.03 });
  B.decal('tally', Signs.tally, [-24.9, 1.3, 0], '+x', 1.2, 0.6, { off: 0.01 });
  B.decal('crack', Signs.crack, [0, 0.004, 5.5], '+y', 2.0, 2.0);
  // al cruzar los torniquetes: apagón, y al volver la luz hay alguien en la escalera
  B.trigger({ x0: 8.2, x1: 10.2, z0: -4, z1: 4 }, (z) => Scares.blackout(4.2, () => { const g = z.groundTop(12.8, 0); Scares.apparition([12.8, g ? g.y : -1.2, 0.2], { stare: 0.35, near: 3, life: 20 }); }), { id: 'z3black', cond: { flag: 'gate', state: true } });
  // 2º acto: el pasillo desde la escalera se repite (parpadeas y vuelves a estar atrás)
  B.when('act2', true, () => B.trigger({ x0: -16.9, x1: -15.1, z0: -CW, z1: CW }, () => Scares.corridorLoop(5.6)));
  B.when('act2', true, () => B.trigger({ x0: -14, x1: -10, z0: -1.5, z1: 1.5 }, () => { Hud.sub('«まもなく…終点です»', 3); AudioSys.whisper(null, 0.3); }, { id: 'z3wh' }));
  // ---------- Sonido ----------
  B.emitter({ type: 'hum', pos: [-11.2, CH - 0.1, 2.4], gain: 0.045, group: 'ent' });
  B.emitter({ type: 'hum', pos: [-3.6, CH - 0.1, -6], gain: 0.045, group: 'mach' });
  B.emitter({ type: 'hum', pos: [7.4, CH - 0.1, 2.4], gain: 0.045, group: 'gate', sizzle: 2.2 });
  B.emitter({ type: 'hum', pos: [2, CH - 0.1, -2.4], gain: 0.03 });
  B.emitter({ type: 'vending', pos: [-12.5, 0.9, Z1 - 0.9], gain: 0.06 });
  B.emitter({ type: 'machines', pos: [-3.5, 1.2, Z0 + 0.7], gain: 0.05 });
  B.emitter({ type: 'machines', pos: [9.3, 1.2, Z0 + 0.7], gain: 0.035 });
  B.emitter({ type: 'led', pos: [6, 2.45, 0], gain: 0.035 });
  B.emitter({ type: 'vent', pos: [1, CH, 0], gain: 0.05, ref: 3 });
  B.emitter({ type: 'wind', pos: [CX0 + 0.5, 1.2, 0], gain: 0.04, ref: 2 });
  B.emitter({ type: 'rumble', gain: 0.2, first: 30 });
  B.emitter({ type: 'roomtone', gain: 0.05 });
  // ---------- Apariciones ----------
  B.spawn('fromZ2', -22.8, 0, -PI / 2);
  B.spawn('fromZ4', 9.4, 0, PI / 2);
  B.spawn('fromZ6', -4.5, 9.6, 0);
  return B;
}

