/* =====================================================================
   ZONA 1 — Entrada exterior de la estación (三条京阪駅, salida 2)
   ===================================================================== */
function buildZone1() {
  const B = new ZoneCtx('z1');
  B.fog = { color: [0.0045, 0.0055, 0.0085], density: 0.036 };
  B.ambient = [0.0045, 0.005, 0.0085];
  B.hemi = { sky: 0x1b2433, ground: 0x0c0b0a, I: 0.16 };
  B.reverb = 'exterior';
  const XL = -27, XR = 27;                    // extensión visual de la calle
  const FX0 = -9.4, FX1 = 4.6, FZ = -3.0;     // fachada del edificio de la entrada
  const OX0 = -2.2, OX1 = 1.6, CY = 2.7;      // hueco de la entrada y altura de la marquesina
  const SY = -3.06, S2Y = -5.1;               // rellanos inferiores

  // ---------- Suelos exteriores ----------
  B.floor('paver', XL, XR, FZ, 2.85, 0, { seg: 0.8 });
  B.ground(-24, 24, FZ, 2.86, 0, 'stone');
  B.box('concrete', XL, -0.14, 2.85, XR, 0, 3.0, { skip: ['ny', 'nx', 'px'], seg: 1 });
  B.ground(-24, 24, 2.85, 3.02, 0, 'stone');
  B.floor('asphalt', XL, XR, 3.0, 12.0, -0.12, { seg: 1.0 });
  B.ground(-24, 24, 3.0, 12.0, -0.12, 'asphalt');
  B.box('concrete', XL, -0.14, 12.0, XR, 0, 12.15, { skip: ['ny', 'nx', 'px'], seg: 1 });
  B.floor('paver', XL, XR, 12.15, 15.5, 0, { seg: 1.5 });
  B.ground(-24, 24, 12.0, 15.2, 0, 'stone');
  // marcas viales
  for (let i = 0; i < 6; i++) { const x = -4.6 + i * 0.9; B.floor('roadPaint', x, x + 0.45, 3.6, 11.4, -0.114, { seg: 1.5 }); }
  for (let x = XL; x < XR; x += 4) if (x + 2 < -5 || x > 0.6) B.floor('roadPaint', x, x + 2, 7.42, 7.58, -0.114, { seg: 2 });
  for (const [a, b] of [[XL, -5], [0.6, XR]]) { B.floor('roadPaint', a, b, 3.25, 3.37, -0.114, { seg: 2 }); B.floor('roadPaint', a, b, 11.63, 11.75, -0.114, { seg: 2 }); }
  // charcos (llovió hace poco)
  const puddle = (x, z, rx, rz, y) => {
    const g = new THREE.CircleGeometry(1, 18); g.rotateX(-PI / 2);
    B.bt('puddle').geo(g, new THREE.Matrix4().makeScale(rx, 1, rz).setPosition(x, y + 0.007, z));
    B.surface(x - rx * 0.8, x + rx * 0.8, z - rz * 0.8, z + rz * 0.8, y, 'puddle', 3);
  };
  puddle(3.4, 3.55, 1.0, 0.42, -0.12); puddle(4.3, 3.8, 0.5, 0.3, -0.12); puddle(9.3, 3.4, 0.9, 0.3, -0.12);
  puddle(-8.0, 2.0, 0.7, 0.45, 0); puddle(12.5, 10.2, 1.2, 0.6, -0.12); puddle(-14, 6.5, 1.4, 0.5, -0.12);
  // podotáctiles: línea guía a lo largo de la acera + ramal hacia la entrada
  B.tactile('bars', -24, -0.45, 0.6, 0.9, 0, 'x'); B.tactile('bars', -0.15, 24, 0.6, 0.9, 0, 'x');
  B.tactile('dots', -0.45, -0.15, 0.6, 0.9, 0);
  B.tactile('bars', -0.45, -0.15, -3.0, 0.6, 0, 'z');
  // ---------- Edificio de la entrada ----------
  B.wallZ('tileW', FZ, FX0, OX0, 0, CY, 1, { ao: { b: 0.4, rad: 0.35 } });
  B.wallZ('tileW', FZ, OX1, FX1, 0, CY, 1, { ao: { b: 0.4, rad: 0.35 } });
  B.wallX('tileW', OX0, -3.2, FZ, 0, CY, 1);
  B.wallZ('brown', FZ, FX0, FX1, 3.2, 6.6, 1, { seg: 0.7 });
  B.box('grey', FX0 - 0.05, 6.6, -3.1, FX1 + 0.05, 6.75, -2.94);
  for (const [x, f] of [[FX0, -1], [FX1, 1]]) { B.wallX('tileW', x, -7.0, FZ, 0, CY, f); B.wallX('brown', x, -7.0, FZ, CY, 6.6, f, { seg: 0.8 }); }
  // marquesina luminosa
  B.box('white', FX0 - 0.05, 3.2, -3.0, FX1 + 0.05, 3.27, -2.28, { skip: ['ny'] });
  B.ceil('ceilPanel', FX0 - 0.05, FX1 + 0.05, -3.0, -2.28, CY);
  // 2º acto: el nombre de la estación ha cambiado
  B.when('act2', false, () => B.glowSign(Signs.canopy(), [(FX0 + FX1) / 2, (CY + 3.2) / 2, -2.28], '+z', FX1 - FX0 + 0.1, 3.2 - CY, 2.1, { off: 0.001 }));
  B.when('act2', true, () => B.glowSign(Signs.canopyAct2(), [(FX0 + FX1) / 2, (CY + 3.2) / 2, -2.28], '+z', FX1 - FX0 + 0.1, 3.2 - CY, 2.1, { off: 0.001, key: 'canopy2' }));
  B.emissiveBox(0xf2f4f6, 1.7, FX0 - 0.06, CY, -3.0, FX0 - 0.05, 3.2, -2.28);
  B.emissiveBox(0xf2f4f6, 1.7, FX1 + 0.05, CY, -3.0, FX1 + 0.06, 3.2, -2.28);
  B.bake({ p: [-2.4, 2.95, -2.2], color: lin(0xeef3ff), I: 26, range: 15, tube: { axis: 'x', len: 13.6, step: 1.1 }, dir: [0, -0.35, 0.94], dmin: 0.06 });
  for (const x of [-6, -0.3, 3.2]) {
    B.emissiveBox(0xfff3dc, 2.4, x - 0.12, CY - 0.01, -2.72, x + 0.12, CY, -2.56);
    B.bake({ p: [x, CY - 0.08, -2.64], color: lin(0xfff1dc), I: 2.4, range: 7, dir: [0, -1, 0], dmin: 0.05 });
    B.glow([x, CY - 0.06, -2.64], scale3(lin(0xfff1dc), 0.12), 0.6);
  }
  for (let x = -8.8; x <= 4.2; x += 1.3) B.glint({ L: [x, 2.95, -2.28], fy: 0, color: lin(0xeef3ff), k: 0.16, size: 1.25, len: 1.1, b: [-24, 24, FZ, 2.85] });
  for (const x of [-6, -0.5, 3]) B.glint({ L: [x, 2.95, -2.28], fy: -0.12, color: lin(0xeef3ff), k: 0.22, size: 1.0, len: 1.4, b: [-24, 24, 3.0, 12] });
  // carteles de la fachada
  B.glowSign(Signs.busBoard(), [-5.7, 1.5, FZ], '+z', 1.5, 1.05, 0.75);
  B.box('metal', -6.5, 0.95, FZ, -4.9, 0.98, FZ + 0.04);
  B.poster(Signs.vertical('特別警戒実施中'), [-3.05, 1.82, FZ], '+z', 0.2, 0.62);
  B.poster(Signs.noSmoking(), [-3.05, 1.18, FZ], '+z', 0.26, 0.31);
  B.poster(Signs.staffOnly(), [2.95, 2.35, FZ], '+z', 0.8, 0.2);
  // puerta de servicio de acero
  B.box('steel', 2.45, 0, FZ, 3.45, 2.12, FZ + 0.035, { seg: 0.6 });
  B.box('grey', 2.4, 2.12, FZ, 3.5, 2.17, FZ + 0.05); B.box('grey', 2.4, 0, FZ, 2.45, 2.12, FZ + 0.05); B.box('grey', 3.45, 0, FZ, 3.5, 2.12, FZ + 0.05);
  B.cyl('metal', [3.28, 1.0, FZ + 0.04], [3.28, 1.0, FZ + 0.1], 0.02, 6, { caps: true }); B.cyl('metal', [3.28, 1.0, FZ + 0.1], [3.15, 1.0, FZ + 0.1], 0.016, 6, { caps: true });
  B.box('steel', 3.75, 0.9, FZ, 4.15, 1.45, FZ + 0.12); // caja eléctrica
  B.door({ box: { x0: 2.45, x1: 3.45, y0: 0, y1: 2.12, z0: FZ - 0.05, z1: FZ + 0.1 }, to: 'z7', spawn: 'fromZ1', flag: 'steel', pos: [2.95, 1.0, FZ + 0.1], msg: 'Puerta de servicio. Está cerrada por dentro.' });
  // ---------- Rellano superior ----------
  B.floor('floorTile', OX0, OX1, -5.8, FZ, 0);
  B.ground(OX0 - 0.02, OX1, -5.8, FZ + 0.01, 0, 'tile');
  B.ceil('ceilPanel', OX0, OX1, -5.8, FZ, CY);
  B.wallX('tileW', OX1, -5.8, FZ, 0, CY, -1, { ao: { b: 0.4, t: 0.3, rad: 0.35 } });
  B.wallZ('tileW', -5.8, -7.6, OX1, -3.3, CY, 1, { ao: { t: 0.3, rad: 0.35 } });
  B.floor('grate', OX0, OX1, -3.12, -2.88, 0.003, { seg: 2 }); B.surface(OX0, OX1, -3.12, -2.88, 0, 'metal', 2);
  B.poster(Signs.manhole(), [0.55, 0.005, -3.75], '+y', 0.62, 0.62, { alpha: true }); B.surface(0.25, 0.85, -4.05, -3.45, 0, 'metal', 2);
  B.tactile('bars', -0.45, -0.15, -4.35, FZ, 0, 'z');
  B.tactile('dots', -0.45, -0.15, -4.65, -4.35, 0);
  B.tactile('bars', -1.6, -0.45, -4.65, -4.35, 0, 'x');
  B.tactile('dots', -1.9, -1.6, -5.8, -3.2, 0);
  // carteles del rellano (fondo, visibles desde la calle)
  B.glowSign(Signs.subwayGates(), [0.95, 1.78, -5.8], '+z', 0.42, 0.5, 1.15);
  B.glowSign(Signs.arrowPanel('left'), [0.95, 1.22, -5.8], '+z', 0.42, 0.5, 1.0);
  B.poster(Signs.notice(3), [0.3, 1.62, -5.8], '+z', 0.3, 0.42);
  B.poster(Signs.notice(8, '工事のお知らせ'), [0.3, 1.1, -5.8], '+z', 0.3, 0.42);
  B.poster(Signs.vertical('防犯カメラ作動中', '#e8e6de', '#c42a25'), [OX1, 1.8, -4.2], '-x', 0.16, 0.56);
  B.box('dark', 1.4, 2.5, -3.55, 1.6, 2.6, -3.35); B.box('gloss', 1.3, 2.52, -3.5, 1.42, 2.58, -3.4); // cámara de seguridad
  // luz del rellano (luz real 0)
  B.emissiveBox(0xeef4ff, 3.0, -0.95, CY - 0.03, -4.55, 0.35, CY - 0.005, -4.25);
  B.box('white', -1.0, CY - 0.04, -4.6, 0.4, CY - 0.03, -4.2);
  B.glow([-0.3, CY - 0.1, -4.4], scale3(lin(0xe6efff), 0.22), 1.3);
  B.realDefs[0] = { p: [-0.3, 2.42, -4.4], color: lin(0xe6efff), I: 7, range: 11, group: 'land',
    bake: { p: [-0.3, 2.6, -4.4], color: lin(0xe6efff), I: 7, range: 11, dir: [0, -1, 0], dmin: 0.25 } };
  const gl = B.grp('land', 'rare'); gl.real = 0; gl.glows.push(B.glowsP.length - 1);
  B.glint({ L: [-0.3, CY, -4.4], fy: 0, color: lin(0xe6efff), k: 0.5, size: 1.0, len: 1.0, b: [OX0, OX1, -5.8, FZ], group: 'land' });
  // ---------- Escalera 1 (baja hacia -x) ----------
  B.stairs({ axis: 'x', sTop: OX0, sBot: -7.6, w0: -5.8, w1: -3.2, yTop: 0, yBot: SY, n: 18 });
  B.wallZ('tileW', -3.2, -9.2, OX0, -5.3, CY, -1, { ao: { t: 0.25, rad: 0.3 } });
  B.slopeCeil('ceilRough', 'x', OX0, -7.6, CY, SY + CY, -5.8, -3.2);
  B.floor('floorTile', -9.2, -7.6, -5.8, -3.2, SY);
  B.ground(-9.2, -7.58, -5.8, -3.2, SY, 'tile');
  B.ceil('ceilRough', -9.2, -7.6, -5.8, -3.2, SY + CY);
  B.wallX('tileW', -9.2, -11, -3.2, -5.4, CY, 1);
  B.tactile('dots', -8.2, -7.9, -5.8, -3.2, SY);
  for (const [z, w] of [[-3.27, [0, 1]], [-5.73, [0, -1]]]) B.rail([[OX0 + 0.5, 0.85, z], [OX0, 0.85, z], [-7.6, SY + 0.85, z], [-8.1, SY + 0.85, z]], w);
  B.cyl('metal', [OX0 + 0.5, 0, -3.35], [OX0 + 0.5, 0.85, -3.35], 0.024, 8); B.cyl('metal', [OX0 + 0.5, 0.85, -3.35], [OX0 + 0.5, 0.85, -3.27], 0.022, 8);
  B.collider(OX0 + 0.42, OX0 + 0.58, -3.43, -3.27, 0, 1);
  // tubo de la escalera (luz real 1, montado en la pared del fondo)
  B.tube({ p: [-6.6, -0.18, -5.72], axis: 'x', len: 1.2, mount: [0, 0, -1], color: 0xd6e4ff, I: 5, range: 8, real: 1, group: 'stair1', flicker: 'rare' });
  B.glint({ L: [-6.6, -0.18, -5.6], fy: SY, color: lin(0xd6e4ff), k: 0.45, size: 0.8, b: [-9.2, -7.6, -5.8, -3.2], group: 'stair1' });
  B.poster(Signs.notice(5, 'ご案内'), [-4.4, -0.2, -3.2], '-z', 0.32, 0.45);
  // ---------- Escalera 2 (sigue bajando hacia -z, lleva a la zona 2) ----------
  B.stairs({ axis: 'z', sTop: -5.8, sBot: -9.4, w0: -9.2, w1: -7.6, yTop: SY, yBot: S2Y, n: 12 });
  B.wallX('tileW', -7.6, -11, -5.8, -5.4, 0.2, -1);
  B.slopeCeil('ceilRough', 'z', -5.8, -9.4, SY + CY, S2Y + CY, -9.2, -7.6);
  B.floor('floorTile', -9.2, -7.6, -11, -9.4, S2Y); B.ground(-9.2, -7.6, -11, -9.39, S2Y, 'tile');
  B.ceil('ceilRough', -9.2, -7.6, -11, -9.4, S2Y + CY);
  B.wallZ('tileW', -11, -9.2, -7.6, S2Y - 0.2, S2Y + CY, 1);
  for (const [x, w] of [[-9.13, [-1, 0]], [-7.67, [1, 0]]]) B.rail([[x, SY + 0.85, -5.4], [x, SY + 0.85, -5.8], [x, S2Y + 0.85, -9.4], [x, S2Y + 0.85, -10.2]], w);
  B.tube({ p: [-8.4, S2Y + CY - 0.06, -10.3], axis: 'x', len: 1.2, color: 0xcfe0ff, I: 4, range: 8 });
  B.tube({ p: [-9.12, -1.7, -7.6], axis: 'z', len: 1.2, mount: [-1, 0, 0], color: 0xd2e2ff, I: 2.6, range: 7 });
  B.portal({ x0: -9.3, x1: -7.5, z0: -11.2, z1: -7.3, y0: -7, y1: -1 }, 'z2', 'top');
  // oclusores (para que la luz horneada no atraviese muros)
  B.occluder(FX0, OX0, -6, CY, -3.2, -3.0);
  B.occluder(FX0, FX1, CY, 6.6, -3.2, -3.0);
  B.occluder(OX1, FX1, 0, CY, -3.2, -3.0);
  B.occluder(-7.6, OX1, -6, CY, -6.0, -5.8);
  B.occluder(OX1, OX1 + 0.2, 0, CY, -6.0, -3.0);
  B.occluder(OX0, OX1, -1, -0.02, -5.8, -3.0);
  B.occluder(FX0, OX0, CY, 6.6, -6.0, -3.2);
  // ---------- Edificios vecinos ----------
  // callejón oscuro a la izquierda
  B.wallX('concrete', -10.6, -8, FZ, 0, 9, 1); B.wallZ('concrete', -8, -10.6, FX0, 0, 9, 1);
  B.floor('concrete', -10.6, FX0, -8, FZ, 0.01, { seg: 1 });
  B.cyl('grey', [-10.0, 0, -7.6], [-10.0, 8, -7.6], 0.05, 6);
  const neighbor = (x0, x1, z, shutters, h) => {
    B.wallZ('concrete', z, x0, x1, 0, 3.4, 1, { seg: 0.8, ao: { b: 0.4, rad: 0.3 } });
    B.wallZ('facade', z, x0, x1, 3.4, h, 1, { seg: 2 });
    B.box('dark', x0, 3.2, z, x1, 3.45, z + 0.35);
    for (const [a, b] of shutters) { B.box('shutter', a, 0, z, b, 2.6, z + 0.06, { seg: 0.8 }); B.box('grey', a - 0.05, 2.6, z, b + 0.05, 2.95, z + 0.3); }
  };
  neighbor(XL, -10.6, FZ, [[-16.2, -11.4], [-23.5, -17.6]], 11);
  neighbor(FX1, XR, FZ, [[7.4, 12.8], [14.4, 19.8]], 13);
  B.wallX('concrete', XL, -8, FZ, 0, 11, 1);
  B.poster(Signs.vertical('たばこ', '#c42a25', '#fff'), [-11.2, 3.9, FZ + 0.4], '+x', 0.3, 0.9);
  B.poster(Signs.vertical('たばこ', '#c42a25', '#fff'), [-11.2, 3.9, FZ + 0.4], '-x', 0.3, 0.9);
  B.box('grey', -11.25, 3.4, FZ, -11.15, 4.4, FZ + 0.42);
  // escaparate oscuro con puerta de cristal a la derecha
  B.box('glassDark', 21.0, 0.05, FZ, 24.0, 2.6, FZ + 0.04);
  B.box('metal', 22.47, 0.05, FZ, 22.53, 2.6, FZ + 0.06);
  // ---------- Acera de enfrente: edificios con algunas ventanas encendidas ----------
  const R = mulberry32(42);
  B.wallZ('dark', 15.5, XL - 3, XR + 3, 0, 16, -1, { seg: 2.5 });
  for (let x = XL - 2; x < XR + 2; x += 1.8) for (let y = 3.6; y < 15.5; y += 2.7) {
    const lit = R() < 0.07, w = 1.2, h = 1.1;
    if (lit) { const warm = R() < 0.6; B.emissiveBox(warm ? 0xffcf8a : 0xbfd4f0, warm ? 0.55 : 0.4, x, y, 15.47, x + w, y + h, 15.49); }
    else B.box('glassDark', x, y, 15.46, x + w, y + h, 15.49, { skip: ['ny', 'py', 'px', 'nx'] });
  }
  for (let x = XL; x < XR; x += 6.5) B.box('shutter', x, 0, 15.4, x + 4.8, 2.7, 15.5, { seg: 1.2, skip: ['pz'] });
  // luz roja de aviso en una azotea (parpadea lento)
  B.emissiveBox(0xff2a1a, 3, 6.9, 16.1, 15.9, 7.1, 16.3, 16.1); B.glow([7, 16.2, 15.8], [0.5, 0.04, 0.02], 1.4);
  // ---------- Farola (luz real 2) ----------
  const LX = 14.6, LZ = 2.62;
  B.cyl('grey', [LX, 0, LZ], [LX, 6.2, LZ], 0.075, 10, { r2: 0.06 });
  B.cyl('grey', [LX, 6.1, LZ], [LX, 6.3, LZ + 1.8], 0.045, 8);
  B.box('grey', LX - 0.2, 6.18, LZ + 1.55, LX + 0.2, 6.32, LZ + 2.15);
  B.emissiveBox(0xffb064, 9, LX - 0.15, 6.15, LZ + 1.62, LX + 0.15, 6.18, LZ + 2.08);
  B.glow([LX, 6.05, LZ + 1.85], scale3(lin(0xffa860), 0.55), 2.6);
  B.collider(LX - 0.15, LX + 0.15, LZ - 0.15, LZ + 0.15);
  B.realDefs[2] = { p: [LX, 5.9, LZ + 1.85], color: lin(0xffa860), I: 42, range: 24, group: null,
    bake: { p: [LX, 5.9, LZ + 1.85], color: lin(0xffa860), I: 42, range: 24, dir: [0, -1, 0], dmin: 0.35 } };
  B.glint({ L: [LX, 6.1, LZ + 1.85], fy: -0.12, color: lin(0xffa860), k: 1.3, size: 0.9, len: 1.5, b: [-24, 24, 3.0, 12] });
  B.glint({ L: [LX, 6.1, LZ + 1.85], fy: 0, color: lin(0xffa860), k: 0.8, size: 0.8, len: 1.2, b: [-24, 24, FZ, 2.85] });
  // ---------- Cartel de tráfico lejano ----------
  const TX = 20.6;
  B.cyl('grey', [TX, 0, 2.7], [TX, 5.0, 2.7], 0.08, 8); B.cyl('grey', [TX, 4.6, 2.7], [TX, 4.6, 5.6], 0.05, 6);
  B.glowSign(Signs.traffic(), [TX - 0.04, 4.3, 4.6], '-x', 2.2, 1.1, 0.75);
  B.box('grey', TX - 0.03, 3.7, 3.5, TX + 0.02, 4.9, 5.7);
  B.bake({ p: [TX - 0.6, 4.3, 4.6], color: lin(0xb8f0cc), I: 2.5, range: 6, dir: [-1, 0, 0], dmin: 0.1 });
  B.glint({ L: [TX - 0.1, 4.3, 4.6], fy: -0.12, color: lin(0x9fe8bc), k: 0.25, size: 1.2, len: 1.0, b: [-24, 24, 3.0, 12] });
  B.collider(TX - 0.15, TX + 0.15, 2.55, 2.85);
  // ---------- Máquina expendedora + papeleras ----------
  const VX0 = 4.9, VX1 = 5.9, VZ1 = -2.22;
  B.box('white', VX0, 0, FZ, VX1, 1.83, VZ1, { skip: ['nz'] });
  B.glowSign(Signs.vending(), [(VX0 + VX1) / 2, 0.95, VZ1], '+z', 0.9, 1.72, 1.35, { off: 0.004 });
  B.bake({ p: [5.4, 1.1, -1.85], color: lin(0xe6f0ff), I: 4.5, range: 8, dir: [0, 0, 1], dmin: 0.04 });
  B.glow([5.4, 1.2, -2.1], scale3(lin(0xdfeeff), 0.06), 1.8);
  B.glint({ L: [5.4, 1.3, -2.2], fy: 0, color: lin(0xe6f0ff), k: 0.35, size: 0.8, len: 0.8, b: [-24, 24, -2.2, 2.85] });
  B.collider(VX0, VX1, FZ, VZ1);
  // la palanca de devolución suelta unas monedas olvidadas (primer objeto)
  B.interact({ x0: VX0, x1: VX1, y0: 0.2, y1: 1.8, z0: VZ1 - 0.1, z1: VZ1 + 0.05 }, () => {
    AudioSys.beep([5.4, 1.0, VZ1]);
    if (Flags.coinsGot) { Hud.msg('La máquina no tiene nada más que darte.'); return; }
    setFlag('coinsGot'); AudioSys.coins([5.4, 0.3, VZ1]); Hud.msg('Tiras de la palanca de devolución… caen unas monedas.'); Inv.add('coins');
  }, 'Máquina expendedora');
  B.sparkles.push({ p: [5.62, 0.42, VZ1 + 0.02], cond: { flag: 'coinsGot', state: false } });
  B.emitter({ type: 'vending', pos: [5.4, 0.9, -2.4], gain: 0.07 });
  for (const [x, t] of [[6.05, 'かん・びん'], [6.55, 'ペットボトル']]) {
    B.box('blue', x, 0, -2.95, x + 0.42, 0.95, -2.5); B.box('dark', x + 0.08, 0.95, -2.85, x + 0.34, 0.97, -2.6);
    B.poster(Signs.binLabel(t), [x + 0.21, 0.72, -2.5], '+z', 0.36, 0.18);
  }
  B.collider(6.05, 6.97, -2.95, -2.5);
  // ---------- Parada de bus, poste eléctrico, aparcabicis, valla ----------
  B.cyl('grey', [-5.6, 0, 2.55], [-5.6, 2.5, 2.55], 0.04, 8);
  B.poster(Signs.busStop(), [-5.6, 2.62, 2.55], '-z', 0.55, 0.55, { alpha: true }); B.poster(Signs.busStop(), [-5.6, 2.62, 2.55], '+z', 0.55, 0.55, { alpha: true });
  B.box('grey', -5.82, 0.9, 2.5, -5.38, 1.7, 2.6); B.poster(Signs.notice(11, '時刻表'), [-5.6, 1.3, 2.6], '+z', 0.4, 0.74, { off: 0.003 });
  B.collider(-5.85, -5.35, 2.45, 2.65);
  const PX = -12.6, PZ = 2.7;
  B.cyl('concrete', [PX, 0, PZ], [PX, 9.5, PZ], 0.17, 10, { r2: 0.13 });
  B.box('grey', PX - 0.9, 8.6, PZ - 0.06, PX + 0.9, 8.72, PZ + 0.06);
  B.cyl('dark', [PX + 0.35, 7.2, PZ + 0.3], [PX + 0.35, 8.1, PZ + 0.3], 0.22, 10, { caps: true });
  B.collider(PX - 0.2, PX + 0.2, PZ - 0.2, PZ + 0.2);
  const wire = (a, b, sag) => { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) - Math.sin(t * PI) * sag, lerp(a[2], b[2], t)]); } for (let i = 0; i < 8; i++) B.cyl('black', pts[i], pts[i + 1], 0.012, 4); };
  for (const dy of [0, 0.25, -0.3]) { wire([PX - 0.8, 8.66 + dy, PZ], [XL - 4, 8.4 + dy, PZ], 0.6); wire([PX + 0.8, 8.66 + dy, PZ], [LX + 12, 8.6 + dy, PZ], 1.2); }
  wire([PX, 8.2, PZ], [PX + 3, 7.5, 15.5], 0.8); wire([PX + 0.4, 8.0, PZ], [-1, 6.4, FZ - 0.1], 0.5);
  for (let x = -20; x <= -15; x += 0.7) { B.cyl('metal', [x, 0, -2.6], [x, 0.7, -2.6], 0.018, 6); B.cyl('metal', [x, 0.7, -2.6], [x, 0.7, -1.9], 0.018, 6); B.cyl('metal', [x, 0.7, -1.9], [x, 0, -1.9], 0.018, 6); }
  B.cyl('metal', [-20.2, 0.35, -2.25], [-14.8, 0.35, -2.25], 0.02, 6); B.collider(-20.2, -14.8, -2.7, -1.8);
  bicycle(B, -10.4, -2.0, 0.25);
  for (let x = 6; x <= 23.5; x += 1.5) B.cyl('white', [x, 0, 2.78], [x, 0.85, 2.78], 0.035, 8);
  for (const y of [0.55, 0.8]) B.cyl('white', [6, y, 2.78], [23.5, y, 2.78], 0.03, 8);
  B.collider(5.9, 23.6, 2.7, 2.86);
  // vallas de obra en los extremos (fin del mapa)
  for (const x of [-24.3, 24.3]) {
    barrierZ(B, x, -2.9, 2.9, 0); barrierZ(B, x, 3.05, 11.95, -0.12); barrierZ(B, x, 12.2, 15.3, 0);
    B.poster(Signs.roadClosed(), [x + (x < 0 ? 0.06 : -0.06), 1.35, 1.6], x < 0 ? '+x' : '-x', 0.6, 0.7);
    B.box('grey', x - 0.03, 0, 1.55, x + 0.03, 1.0, 1.65);
  }
  // ---------- Objetos, notas y eventos ----------
  B.note({ id: 'n1', p: [0.9, 0.004, 0.2] });
  shoeProp(B, -3.6, 0, 1.9, 0.6); canProp(B, 8.4, 0, 0.8); paperProp(B, -6.6, 0, 1.2, 0.3);
  B.pickup({ id: 'bat1', item: 'battery', p: [6.27, 0.98, -2.72], build: (b) => batteryProp(b, 6.27, 0.97, -2.72, 0.4), msg: 'Pilas. Ahorra la linterna: sin luz, la estación se te mete en la cabeza.' });
  B.decal('grime', Signs.grime, [-1.0, 1.0, -5.8], '+z', 2.0, 2.0);
  for (const y of [0.75, 1.15]) B.decal('tape', Signs.tape, [-10.0, y, -3.05], '+z', 1.2, 0.08);   // callejón precintado
  // 2º acto: tu propia nota y alguien al otro lado de la calle
  B.when('act2', true, () => {
    B.note({ id: 'n8', p: [-0.3, 0.004, -4.0] });
    B.decal('hands', Signs.hands, [-1.2, 1.3, -5.8], '+z', 1.4, 1.4);
    B.trigger({ x0: 1.8, x1: 4.2, z0: -2.8, z1: -0.6 }, () => Scares.apparition([13.6, -0.12, 7.6], { stare: 0.7, near: 5, life: 45 }), { id: 'z1fig' });
    B.trigger({ x0: -1.6, x1: 1.0, z0: -5.4, z1: -3.6 }, () => { Hud.sub('«…ya has estado aquí…»', 3); AudioSys.whisper([-1, 1.6, -5], 0.4); }, { id: 'z1wh' });
  });
  // ---------- Sonido ----------
  B.emitter({ type: 'city', gain: 0.1 });
  B.emitter({ type: 'hum', pos: [-0.3, 2.6, -4.4], gain: 0.05, group: 'land' });
  B.emitter({ type: 'hum', pos: [-6.6, -0.2, -5.6], gain: 0.05, group: 'stair1' });
  B.emitter({ type: 'sign', pos: [-1.5, 2.95, -2.25], gain: 0.03 });
  B.emitter({ type: 'lamp', pos: [LX, 6.0, LZ + 1.85], gain: 0.035, ref: 2.5 });
  B.emitter({ type: 'wind', pos: [-8.4, -4.0, -9.0], gain: 0.07, ref: 2 });
  B.reverbArea({ x0: FX0, x1: OX1, z0: -12, z1: FZ - 0.05, y0: -8, y1: 3 }, 'entrance');
  // ---------- Puntos de aparición ----------
  B.spawn('start', 3.4, 1.5, yawTo(-3.4, -5.7));
  B.spawn('fromBelow', -8.4, -4.6, yawTo(1, 0));
  B.spawn('steelDoor', 2.95, -2.2, PI);
  B.menuCam = { p: [4.3, 1.5, 2.3], t: [-1.0, 1.25, -4.4] };
  return B;
}

