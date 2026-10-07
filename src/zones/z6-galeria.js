/* =====================================================================
   ZONA 6 — Galería comercial abandonada (persianas, una lámpara verdosa)
   ===================================================================== */
function buildZone6() {
  const B = new ZoneCtx('z6');
  B.fog = { color: [0.012, 0.019, 0.009], density: 0.065 };
  B.ambient = [0.007, 0.01, 0.005];
  B.hemi = { sky: 0x2a3a24, ground: 0x0c0e08, I: 0.12 };
  B.reverb = 'gallery';
  const CH = 2.7, sick = 0xc4f0a0, R = mulberry32(606);
  // ---------- Pasillos (suelo, techo y caminable) ----------
  const rects = [[-22, 2.0, -1.2, 1.2], [2.0, 9.0, -5.0, 1.2], [6.6, 9.0, -16.0, -5.0], [-8, 6.6, -11.2, -8.8], [-3.2, -0.8, -8.8, -1.2], [-11.2, -8.8, 1.2, 9.0]];
  for (const [x0, x1, z0, z1] of rects) {
    B.floor('tileOld', x0, x1, z0, z1, 0); B.ceil('ceilPanel', x0, x1, z0, z1, CH, { seg: 1.0 });
    B.ground(x0 - 0.01, x1 + 0.01, z0 - 0.01, z1 + 0.01, 0, 'tile');
  }
  // ---------- Paredes ----------
  const P = 'plasterOld', ao = { ao: { b: 0.4, t: 0.3, rad: 0.3 } };
  B.wallZ(P, -1.2, -22, -3.2, 0, CH, 1, ao); B.wallZ(P, -1.2, -0.8, 2.0, 0, CH, 1, ao);
  B.wallZ(P, 1.2, -22, -11.2, 0, CH, -1, ao); B.wallZ(P, 1.2, -8.8, 9.0, 0, CH, -1, ao);
  B.wallX(P, -22, -1.2, 1.2, 0, CH, 1);
  B.wallZ(P, -5.0, 2.0, 6.6, 0, CH, 1, ao); B.wallX(P, 2.0, -5.0, -1.2, 0, CH, 1, ao);
  B.wallX(P, 9.0, -16.0, 1.2, 0, CH, -1, ao);
  B.wallX(P, 6.6, -16.0, -11.2, 0, CH, 1, ao); B.wallX(P, 6.6, -8.8, -5.0, 0, CH, 1, ao);
  B.wallZ(P, -11.2, -8, 6.6, 0, CH, 1, ao); B.wallZ(P, -8.8, -8, -3.2, 0, CH, -1, ao); B.wallZ(P, -8.8, -0.8, 6.6, 0, CH, -1, ao);
  B.wallX(P, -3.2, -8.8, -1.2, 0, CH, 1, ao); B.wallX(P, -0.8, -8.8, -1.2, 0, CH, -1, ao);
  B.wallX(P, -11.2, 1.2, 9.0, 0, CH, 1, ao); B.wallX(P, -8.8, 1.2, 9.0, 0, CH, -1, ao); B.wallZ(P, 9.0, -11.2, -8.8, 0, CH, -1, ao);
  // ---------- Tiendas cerradas: persiana + rótulo encima ----------
  let si = 0;
  const shop = (axis, c, a, b, facing, idx, opt = {}) => {
    const n = facing, k = idx ?? si++ % 16, u = (k % 2) / 2, v = 1 - (Math.floor(k / 2) + 1) / 8, m = (a + b) / 2, w = b - a;
    if (axis === 'z') {
      B.box('shutter', a, 0, Math.min(c, c + n * 0.06), b, 2.15, Math.max(c, c + n * 0.06), { seg: 0.7, skip: ['ny'] });
      B.box('dark', a - 0.05, 2.15, Math.min(c, c + n * 0.2), b + 0.05, 2.25, Math.max(c, c + n * 0.2));
      (opt.lit ? B.glowSign.bind(B) : B.poster.bind(B))(Signs.shops, [m, 2.45, c], n > 0 ? '+z' : '-z', Math.min(w, 2.4), 0.32, ...(opt.lit ? [opt.lit] : []), { key: opt.lit ? opt.litKey : 'shops', uv: [u, v, u + 0.5, v + 0.125], off: 0.01 });
      if (opt.notice) B.poster(Signs.closing, [m + (R() - 0.5) * 0.6, 1.35, c + n * 0.06], n > 0 ? '+z' : '-z', 0.3, 0.4, { key: 'closing' });
    } else {
      B.box('shutter', Math.min(c, c + n * 0.06), 0, a, Math.max(c, c + n * 0.06), 2.15, b, { seg: 0.7, skip: ['ny'] });
      B.box('dark', Math.min(c, c + n * 0.2), 2.15, a - 0.05, Math.max(c, c + n * 0.2), 2.25, b + 0.05);
      (opt.lit ? B.glowSign.bind(B) : B.poster.bind(B))(Signs.shops, [c, 2.45, m], n > 0 ? '+x' : '-x', Math.min(w, 2.4), 0.32, ...(opt.lit ? [opt.lit] : []), { key: opt.lit ? opt.litKey : 'shops', uv: [u, v, u + 0.5, v + 0.125], off: 0.01 });
      if (opt.notice) B.poster(Signs.closing, [c + n * 0.06, 1.35, m + (R() - 0.5) * 0.6], n > 0 ? '+x' : '-x', 0.3, 0.4, { key: 'closing' });
    }
  };
  // pasillo A
  shop('z', -1.2, -21, -18.4, 1, 3, { notice: true });
  // esta persiana se abre sola cuando le das la espalda
  B.when('z6open', false, () => shop('z', -1.2, -17.6, -15, 1, 6));
  B.when('z6open', true, () => {
    B.box('shutter', -17.6, 1.15, -1.2, -15, 2.15, -1.14, { seg: 0.7, skip: ['ny'] }); B.box('dark', -17.65, 2.15, -1.2, -14.95, 2.25, -1.0);
    B.emissiveBox(0x000000, 0, -17.55, 0, -1.2, -15.05, 1.15, -1.19);
    B.poster(Signs.shops, [-16.3, 2.45, -1.2], '+z', 2.4, 0.32, { key: 'shops', uv: [0, 1 - 4 / 8, 0.5, 1 - 3 / 8], off: 0.01 });
  }); shop('z', -1.2, -14.2, -11.6, 1, 10, { notice: true });
  shop('z', -1.2, -10.8, -8.2, 1, 4); shop('z', -1.2, -7.4, -4.8, 1, 15);
  shop('z', 1.2, -21, -18.4, -1, 8); shop('z', 1.2, -17.6, -15, -1, 13, { notice: true }); shop('z', 1.2, -14.6, -12, -1, 11);
  shop('z', 1.2, -8.2, -5.6, -1, 2); shop('z', 1.2, -4.8, -2.2, -1, 9); shop('z', 1.2, -1.4, 1.2, -1, 7); shop('z', 1.2, 3.0, 5.6, -1, 14, { notice: true }); shop('z', 1.2, 6.4, 8.6, -1, 12);
  // pasillo C (norte)
  shop('x', 6.6, -15.6, -13.2, 1, 5); shop('x', 9.0, -15.4, -12.8, -1, 12); shop('x', 9.0, -12.2, -9.6, -1, 1, { lit: 1.5, litKey: 'shopsLuna' }); shop('x', 9.0, -9.0, -6.4, -1, 6, { notice: true });
  // pasillo E
  shop('z', -11.2, -6.8, -4.2, 1, 9); shop('z', -11.2, -3.4, -0.8, 1, 13, { notice: true }); shop('z', -11.2, 0, 2.6, 1, 12, { lit: 0.7, litKey: 'shopsDim' }); shop('z', -11.2, 3.4, 6.0, 1, 4);
  shop('z', -8.8, -6.8, -4.4, -1, 15); shop('z', -8.8, 0, 2.6, -1, 10); shop('z', -8.8, 3.4, 6.0, -1, 3);
  // pasillos F y D
  shop('x', -3.2, -7.8, -5.2, 1, 11, { notice: true }); shop('x', -0.8, -7.8, -5.2, -1, 8); shop('x', -0.8, -4.6, -2.0, -1, 14);
  shop('x', -11.2, 2.0, 4.6, 1, 2, { notice: true }); shop('x', -11.2, 5.4, 8.0, 1, 7); shop('x', -8.8, 2.0, 4.6, -1, 5);
  // quiosco en la esquina (como en la imagen de referencia): "高品漬物店 TEL 2935"
  B.box('plasterOld', 4.2, 2.25, -3.2, 6.2, CH, -1.7, { skip: ['ny', 'py'] });
  B.box('shutter', 4.25, 0, -3.15, 6.15, 2.25, -1.75, { skip: ['ny', 'py'], seg: 0.7 });
  B.box('dark', 4.1, 2.25, -3.3, 6.3, 2.35, -1.6, { skip: ['py'] });
  B.poster(Signs.shops, [5.2, 2.05, -1.69], '+z', 1.5, 0.22, { key: 'shops', uv: [0, 7 / 8, 0.5, 1], off: 0.003 });
  B.glowSign(Signs.shops, [6.21, 2.05, -2.45], '+x', 1.2, 0.22, 0.7, { key: 'shopsDim', uv: [0, 7 / 8, 0.5, 1], off: 0.003 });
  B.collider(4.2, 6.2, -3.2, -1.7);
  // ---------- Techo: tubos, conductos y paneles que faltan ----------
  for (const [x0, x1, z] of [[-22, 2, -0.7], [-22, 2, -0.5]]) B.cyl('rust', [x0, CH - 0.12, z], [x1, CH - 0.12, z], 0.05, 6);
  B.box('metal', -22, CH - 0.32, 0.4, 9.0, CH - 0.02, 0.9);
  B.cyl('grey', [7.2, CH - 0.15, -16], [7.2, CH - 0.15, 1.2], 0.06, 6); B.cyl('rust', [-8, CH - 0.1, -10.6], [6.6, CH - 0.1, -10.6], 0.045, 6);
  for (let k = 0; k < 14; k++) { const r = rects[k % 5]; const x = lerp(r[0] + 0.6, r[1] - 0.6, R()), z = lerp(r[2] + 0.4, r[3] - 0.4, R()); B.emissiveBox(0x000000, 0, x - 0.3, CH - 0.004, z - 0.3, x + 0.3, CH - 0.003, z + 0.3); }
  for (const [x, z, ax] of [[-15, 0, 'x'], [-6, 0, 'x'], [7.8, -10, 'z'], [-2, -10, 'x'], [-10, 5, 'z']]) B.tube({ p: [x, CH - 0.06, z], axis: ax, len: 1.2, color: 0xd8e4cc, dead: true });
  B.poster(Signs.stain(), [-12, CH - 0.004, 0.1], '-y', 2.0, 2.0, { alpha: true }); B.poster(Signs.stain(), [7.8, CH - 0.004, -12], '-y', 1.6, 1.6, { alpha: true });
  // ---------- Luces ----------
  // la única lámpara colgante verdosa (luz real 0)
  const LX = 3.3, LZ = -0.5, LY = 2.0;
  B.cyl('black', [LX, CH, LZ], [LX, LY + 0.2, LZ], 0.008, 4);
  B.cyl('metal', [LX, LY + 0.2, LZ], [LX, LY + 0.02, LZ], 0.04, 10, { r2: 0.24, caps: true });
  B.emissiveBox(sick, 6, LX - 0.06, LY - 0.06, LZ - 0.06, LX + 0.06, LY + 0.03, LZ + 0.06);
  const g0 = B.glow([LX, LY - 0.05, LZ], scale3(lin(sick), 0.35), 1.6);
  B.realDefs[0] = { p: [LX, LY - 0.15, LZ], color: lin(sick), I: 7, range: 10, group: 'lamp', bake: { p: [LX, LY - 0.15, LZ], color: lin(sick), I: 7, range: 10, dir: [0, -1, 0], dmin: 0.35 } };
  { const g = B.grp('lamp', 'rare'); g.real = 0; g.glows.push(g0); }
  B.glint({ L: [LX, LY, LZ], fy: 0, color: lin(sick), k: 0.5, size: 0.7, len: 1.0, b: [-22, 9, -5, 1.2], group: 'lamp' });
  // rótulo "喫茶 ルナ" aún encendido, con un fallo (luz real 1, parpadeo frecuente)
  B.realDefs[1] = { p: [8.4, 2.3, -10.9], color: lin(0xffc8d8), I: 2.4, range: 6, group: 'luna', bake: { p: [8.4, 2.3, -10.9], color: lin(0xffc8d8), I: 2.4, range: 6, dir: [-1, -0.4, 0], dmin: 0.2 } };
  { const g = B.grp('luna', 'faulty'); g.real = 1; const sb = B.batches.get('G:shopsLuna'); if (sb) g.mats.push({ mat: sb.mat, base: sb.mat.color.clone() }); }
  // luz fría junto a la escalera de salida (luz real 2)
  B.tube({ p: [7.8, CH - 0.06, -14.6], axis: 'z', len: 1.2, color: 0xd8e8d0, I: 4, range: 8, real: 2, group: 'exit', flicker: 'rare' });
  // luces de emergencia tenues
  for (const [x, z, f] of [[-16, -1.18, '+z'], [-10, 8.98, '-z'], [-4, -11.18, '+z'], [-20, 1.18, '-z']]) {
    const nz = f === '+z' ? 1 : -1;
    B.emissiveBox(0xffd8a0, 2.2, x - 0.12, 2.32, Math.min(z, z + nz * 0.06), x + 0.12, 2.4, Math.max(z, z + nz * 0.06));
    B.bake({ p: [x, 2.3, z + nz * 0.3], color: lin(0xffd8a0), I: 0.7, range: 4.5, dir: [0, -0.6, nz], dmin: 0.2 });
    B.glow([x, 2.36, z + nz * 0.1], [0.05, 0.035, 0.02], 0.4);
  }
  // escaparate de comida de plástico (中華そば) con luz tenue
  B.box('glassDark', 0.2, 0.6, -11.18, 2.4, 1.5, -11.0, { skip: ['ny', 'nz'] });
  for (let k = 0; k < 6; k++) B.cyl(pick(['orange', 'cream', 'red', 'yellow']), [0.45 + k * 0.33, 0.66, -11.1], [0.45 + k * 0.33, 0.74, -11.1], 0.12, 10, { caps: true });
  B.bake({ p: [1.3, 1.4, -10.8], color: lin(0xffd8a0), I: 0.8, range: 3, dir: [0, -0.5, 1], dmin: 0.1 });
  // ---------- Detalles: teléfono público, banco, cajas, poste de barbero, máquina rota ----------
  B.box('phoneGreen', -10.9, 0.8, 6.6, -10.5, 1.4, 7.1); B.box('grey', -10.95, 0, 6.7, -10.6, 0.8, 7.0);
  B.poster(Signs.phone(), [-10.48, 1.55, 6.85], '+x', 0.4, 0.15); B.collider(-11.0, -10.45, 6.55, 7.15);
  B.box('dark', -10.5, 1.0, 6.65, -10.44, 1.35, 6.75);                                       // auricular colgado
  B.interact({ x0: -10.95, x1: -10.4, y0: 0.8, y1: 1.5, z0: 6.55, z1: 7.15 }, () => Scares.phoneAnswer(), 'Teléfono');
  B.box('woodBrown', 2.6, 0.42, -4.7, 4.0, 0.47, -4.3); for (const x of [2.7, 3.9]) B.box('dark', x - 0.03, 0, -4.65, x + 0.03, 0.42, -4.35); B.collider(2.55, 4.05, -4.75, -4.25);
  for (const [x, z, s] of [[-19.5, 0.7, 0.5], [-19.0, 0.8, 0.4], [-19.3, 0.75, 0.35]]) B.box('cardboard', x - s / 2, s === 0.35 ? 0.5 : 0, z - s / 2, x + s / 2, (s === 0.35 ? 0.5 : 0) + s, z + s / 2);
  B.collider(-19.8, -18.75, 0.4, 1.2);
  B.cyl('barber', [-8.15, 1.0, 1.05], [-8.15, 1.9, 1.05], 0.08, 10, { caps: true, uvScale: [1, 1] });
  B.box('white', -11.0, 0, 7.95, -10.0, 1.83, 9.0, { skip: ['pz'] });
  B.glowSign(Signs.vending, [-10.5, 0.95, 7.95], '-z', 0.9, 1.72, 0.9, { key: 'vendBroken', off: 0.004 });
  { const g = B.grp('vend', 'faulty'); const sb = B.batches.get('G:vendBroken'); g.mats.push({ mat: sb.mat, base: sb.mat.color.clone() }); }
  B.bake({ p: [-10.5, 1.0, 7.4], color: lin(0xdfeeff), I: 2.2, range: 5, dir: [0, 0, -1], dmin: 0.05 }); B.collider(-11.05, -9.95, 7.9, 9.0);
  { const g = new THREE.CircleGeometry(1, 16); g.rotateX(-PI / 2); B.bt('puddle').geo(g, new THREE.Matrix4().makeScale(0.9, 1, 0.6).setPosition(-12, 0.006, 0.2)); B.surface(-12.7, -11.3, -0.3, 0.6, 0, 'puddle', 3); }
  // ---------- Atajo: persiana hacia el vestíbulo (zona 3) con botonera ----------
  B.box('grey', -8, 2.2, -11.2, -7.7, CH, -8.8);
  B.when('arcade', false, () => {
    B.box('shutter', -8.05, 0, -11.2, -7.95, 2.2, -8.8, { seg: 0.6 }); B.collider(-8.2, -7.85, -11.2, -8.8);
    B.interact({ x0: -8.1, x1: -7.9, y0: 0, y1: 2.2, z0: -11.2, z1: -8.8 }, () => AudioSys.shutterRattle([-8, 1.1, -10]));
  });
  B.when('arcade', true, () => {
    B.floor('tileOld', -10.6, -8, -11.2, -8.8, 0); B.ground(-10.6, -7.99, -11.2, -8.8, 0, 'tile');
    B.wallZ(P, -11.2, -10.6, -8, 0, 2.2, 1); B.wallZ(P, -8.8, -10.6, -8, 0, 2.2, -1); B.ceil('ceilPanel', -10.6, -8, -11.2, -8.8, 2.2);
    B.emissiveBox(0x000000, 0, -10.58, 0, -11.15, -10.57, 2.2, -8.85);
    B.portal({ x0: -11, x1: -9.3, z0: -11.2, z1: -8.8, y0: -1, y1: 3 }, 'z3', 'fromZ6');
  });
  B.emissiveBox(0xffd8a0, 2.2, -7.5, 2.32, -11.2, -7.26, 2.4, -11.14);
  B.bake({ p: [-7.4, 2.25, -10.8], color: lin(0xffd8a0), I: 0.9, range: 4.5, dir: [0, -0.6, 1], dmin: 0.2 });
  B.box('grey', -7.6, 1.0, -11.2, -7.2, 1.6, -11.1);
  B.poster(Signs.buttonBox(), [-7.4, 1.3, -11.1], '+z', 0.3, 0.45, { off: 0.003 });
  B.interact({ x0: -7.65, x1: -7.15, y0: 0.9, y1: 1.7, z0: -11.25, z1: -10.95 }, () => {
    if (Flags.arcade) { AudioSys.buttonPress([-7.4, 1.3, -11]); return; }
    AudioSys.buttonPress([-7.4, 1.3, -11]); AudioSys.shutterMotor([-8, 1.2, -10]); Zones.current.raise('arcade'); setFlag('arcade');
  });
  // ---------- Escalera de salida (sube hacia el atrio, zona 7) ----------
  B.stairs({ axis: 'z', sTop: -20.8, sBot: -16, w0: 6.6, w1: 9.0, yTop: 2.72, yBot: 0, n: 16 });
  B.floor('tileOld', 6.6, 9.0, -21.6, -20.8, 2.72); B.ground(6.6, 9.0, -21.6, -20.79, 2.72, 'tile');
  B.wallX(P, 6.6, -21.6, -16, 0, 2.72 + CH, 1); B.wallX(P, 9.0, -21.6, -16, 0, 2.72 + CH, -1);
  B.slopeCeil('ceilPanel', 'z', -16, -20.8, CH, 2.72 + CH, 6.6, 9.0); B.ceil('ceilPanel', 6.6, 9.0, -21.6, -20.8, 2.72 + CH);
  B.wallZ(P, -21.6, 6.6, 9.0, 2.72 + 2.3, 2.72 + CH, 1);
  B.glowSign(Tex.windowBand().image, [7.8, 2.72 + 1.15, -21.6], '+z', 2.4, 2.3, 0.45, { key: 'door', off: 0.002 });
  for (const x of [6.67, 8.93]) B.rail([[x, 0.85, -15.5], [x, 0.85, -16], [x, 2.72 + 0.85, -20.8], [x, 2.72 + 0.85, -21.2]], [x < 7 ? -1 : 1, 0], { key: 'rust' });
  B.bake({ p: [7.8, 2.72 + 1.2, -21.2], color: lin(0x7a9ae0), I: 2.5, range: 7, dir: [0, -0.2, 1], dmin: 0.2 });
  B.when('code', true, () => B.portal({ x0: 6.6, x1: 9.0, z0: -21.8, z1: -19.8, y0: 1.5, y1: 6 }, 'z7', 'fromZ6'));
  // puerta de cristal con teclado numérico (clave: la hora en que se paró todo)
  B.when('code', false, () => {
    B.box('glass', 6.62, 2.0, -19.62, 8.98, 4.45, -19.58, { seg: 2 }); B.collider(6.6, 9.0, -19.66, -19.5, 1.0, 6);
    for (const x of [7.78, 7.82]) B.box('metal', x - 0.02, 2.0, -19.64, x + 0.02, 4.45, -19.56);
    B.box('metal', 6.6, 4.45, -19.66, 9.0, 4.55, -19.54);
  });
  B.box('dark', 8.94, 3.05, -19.36, 9.0, 3.55, -19.04);
  B.glowSign(Signs.keypadPanel(), [8.935, 3.3, -19.2], '-x', 0.16, 0.26, 0.8, { off: 0.002 });
  B.interact({ x0: 8.7, x1: 9.0, y0: 2.9, y1: 3.7, z0: -19.45, z1: -18.95 }, () => {
    if (Flags.code) { AudioSys.keyBeep(true); Hud.msg('La puerta ya está abierta.'); return; }
    Keypad.open('0042', () => { setFlag('code'); AudioSys.doorOpen([7.8, 3.2, -19.6], 'gate'); Hud.msg('Clic. La puerta de cristal se desbloquea.'); Save.write(); });
  }, 'Teclado');
  B.reverbArea({ x0: 6.6, x1: 9.0, z0: -22, z1: -16, y0: -1, y1: 7 }, 'stairwell');
  // puerta al túnel (vuelta a la zona 5)
  B.box('steel', -22, 0, -0.5, -21.95, 2.0, 0.5, { seg: 0.6 }); B.box('rust', -22, 2.0, -0.56, -21.92, 2.08, 0.56);
  B.cyl('metal', [-21.95, 1.0, 0.35], [-21.88, 1.0, 0.35], 0.018, 6, { caps: true });
  B.door({ box: { x0: -22.1, x1: -21.8, y0: 0, y1: 2.0, z0: -0.5, z1: 0.5 }, to: 'z5', spawn: 'fromZ6', pos: [-21.9, 1, 0] });
  // ---------- Objetos, notas y sustos ----------
  B.note({ id: 'n6', p: [3.3, 0.475, -4.5] });
  shoeProp(B, -4.0, 0, 0.3, 1.0); shoeProp(B, -3.7, 0, 0.5, 1.3); paperProp(B, -19.0, 0, -0.3, 0.7); canProp(B, 7.6, 0, -9.0);
  B.pickup({ id: 'bat6', item: 'battery', p: [8.3, 0.01, -7.4], build: (b) => batteryProp(b, 8.3, 0, -7.4, 2.6) });
  B.decal('hands', Signs.hands, [-13.0, 1.1, -1.12], '+z', 1.6, 1.6, { off: 0.07 });
  B.decal('grafA', () => Signs.graffiti('でられない'), [-5.5, 1.2, 1.2], '-z', 2.4, 0.6, { off: 0.07 });
  B.decal('tally', Signs.tally, [-3.2, 1.3, -6.5], '+x', 1.0, 0.5, { off: 0.07 });
  B.decal('grime', Signs.grime, [9.0, 1.4, -4.0], '-x', 2.6, 2.6); B.decal('grime', Signs.grime, [-22, 1.4, 0.8], '+x', 2.0, 2.0);
  B.decal('crack', Signs.crack, [-2, CH - 0.004, -10], '-y', 1.6, 1.6);
  B.trigger({ x0: -11.2, x1: -8.8, z0: 0, z1: 2.2 }, () => Scares.phoneStart([-10.7, 1.2, 6.85]), { id: 'z6phone' });
  B.trigger({ x0: -14, x1: -12, z0: -1.2, z1: 1.2 }, () => { Scares.slam([-17.5, 1.2, -1.3], 0.8); AudioSys.shutterRattle([-17.5, 1.2, -1.3]); }, { id: 'z6slam' });
  B.trigger({ x0: -10, x1: -8, z0: -1.2, z1: 1.2 }, () => Scares.whenUnseen([-16.3, 1.0, -1.2], () => { setFlag('z6open'); AudioSys.shutterRattle([-16.3, 1.0, -1.2]); Sanity.scare(0.08, 0.2); }), { id: 'z6swap' });
  B.trigger({ x0: 6.6, x1: 9.0, z0: -6.2, z1: -5.0 }, () => Scares.apparition([7.8, 0, -15.4], { stare: 0.5, near: 4, life: 30 }), { id: 'z6fig' });
  // ---------- Sonido ----------
  B.emitter({ type: 'hum', pos: [LX, LY, LZ], gain: 0.05, group: 'lamp', sizzle: 2.0, harm: [0.7, 0.5, 0.3, 0.2] });
  B.emitter({ type: 'sign', pos: [8.9, 2.45, -10.9], gain: 0.04, group: 'luna' });
  B.emitter({ type: 'vending', pos: [-10.5, 0.9, 7.6], gain: 0.05, group: 'vend' });
  B.emitter({ type: 'tick', pos: [-16.3, 1.2, -1.3], gain: 0.12, ref: 1.0 });
  B.emitter({ type: 'vent', pos: [-6, CH - 0.2, 0.6], gain: 0.04, ref: 3 });
  B.emitter({ type: 'drip', pos: [-12, CH - 0.1, 0.2], gain: 0.22, send: 1.0, min: 3, max: 9 });
  B.emitter({ type: 'drip', pos: [7.8, CH - 0.1, -12], gain: 0.18, send: 1.0, min: 5, max: 12 });
  B.emitter({ type: 'creak', pos: [-2, 2.2, -6], gain: 0.2, min: 14, max: 34 });
  B.emitter({ type: 'hum', pos: [7.8, CH - 0.1, -14.6], gain: 0.04, group: 'exit' });
  B.emitter({ type: 'wind', pos: [7.8, 3.5, -20.5], gain: 0.03, ref: 2 });
  B.emitter({ type: 'rumble', gain: 0.18, first: 25 });
  B.emitter({ type: 'roomtone', gain: 0.06 });
  B.spawn('fromZ5', -20.8, 0, -PI / 2);
  B.spawn('fromZ3', -6.6, -10, -PI / 2);
  B.spawn('fromZ7', 7.8, -15.0, PI);
  return B;
}

