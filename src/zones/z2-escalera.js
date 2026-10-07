/* =====================================================================
   ZONA 2 — Escalera descendente (fluorescentes fríos, azulejo cuadriculado)
   ===================================================================== */
function buildZone2() {
  const B = new ZoneCtx('z2');
  B.fog = { color: [0.006, 0.009, 0.014], density: 0.055 };
  B.ambient = [0.006, 0.008, 0.012];
  B.hemi = { sky: 0x2a3a50, ground: 0x0b0e12, I: 0.16 };
  B.reverb = 'stairwell';
  const W = 1.3, CH = 2.6, cool = 0xcfe2ff;
  const Y1 = -4.08, Y2 = -7.14, UPY = 2.04;      // rellanos
  const ceilF1 = (z) => CH + (z / 7.2) * 4.08;    // techo inclinado del tramo 1 (z ∈ [-7.2, 0])
  const ceilF2 = (x) => Y1 + CH - ((x - 4) / 5.4) * 3.06;
  const stairF1 = (z) => (z / 7.2) * 4.08;
  // ---------- Suelos y escaleras ----------
  B.floor('floorTile', -W, W, 0, 2.4, 0); B.ground(-W, W, -0.01, 2.41, 0, 'tile');
  B.stairs({ axis: 'z', sTop: 6.0, sBot: 2.4, w0: -W, w1: W, yTop: UPY, yBot: 0, n: 12 });
  B.floor('floorTile', -W, W, 6.0, 8.0, UPY); B.ground(-W, W, 5.99, 8.0, UPY, 'tile');
  B.stairs({ axis: 'z', sTop: 0, sBot: -7.2, w0: -W, w1: W, yTop: 0, yBot: Y1, n: 24 });
  B.floor('floorTile', -W, 4.0, -10.2, -7.2, Y1); B.ground(-W, 4.0, -10.2, -7.19, Y1, 'tile');
  B.stairs({ axis: 'x', sTop: 4.0, sBot: 9.4, w0: -10.2, w1: -7.2, yTop: Y1, yBot: Y2, n: 18 });
  B.floor('floorTile', 9.4, 13.0, -10.2, -7.2, Y2); B.ground(9.39, 13.0, -10.2, -7.2, Y2, 'tile');
  // pasillo tras la persiana abierta (lleva al vestíbulo, zona 3)
  B.floor('floorTile', 13.0, 17.2, -8.6, -7.2, Y2); B.ground(12.99, 17.2, -8.6, -7.2, Y2, 'tile');
  B.wallZ('concreteDirty', -8.6, 13.0, 17.2, Y2, Y2 + 2.3, 1); B.wallZ('concreteDirty', -7.2, 13.0, 17.2, Y2, Y2 + 2.3, -1);
  B.ceil('ceilRough', 13.0, 17.2, -8.6, -7.2, Y2 + 2.3); B.wallX('concreteDirty', 17.2, -8.6, -7.2, Y2, Y2 + 2.3, -1);
  B.bake({ p: [16.6, Y2 + 2.0, -7.9], color: lin(0xdfe8f2), I: 1.6, range: 5, dir: [-1, -0.3, 0], dmin: 0.3 });
  B.portal({ x0: 15.4, x1: 17.4, z0: -8.7, z1: -7.1, y0: Y2 - 1, y1: Y2 + 2 }, 'z3', 'fromZ2');
  // ---------- Paredes ----------
  const aoW = { ao: { b: 0.0, rad: 0.3 } };
  B.wallX('tileB', -W, -10.2, 8.0, -4.3, 4.75, 1, aoW);
  B.wallX('tileB', W, -7.2, 8.0, -4.3, 4.75, -1, aoW);
  B.wallZ('tileB', 8.0, -W, W, UPY - 0.1, UPY + CH + 0.05, -1);
  B.wallZ('tileB', -10.2, -W, 13.0, Y2 - 0.1, Y1 + CH + 0.05, 1, { ao: { b: 0.35, rad: 0.3 } });
  B.wallZ('tileB', -7.2, W, 13.0, Y2 - 0.1, Y1 + CH + 0.05, -1);
  B.wallX('tileB', 13.0, -10.2, -8.6, Y2 - 0.1, Y2 + CH + 0.05, -1); B.wallX('tileB', 13.0, -8.6, -7.2, Y2 + 2.3, Y2 + CH + 0.05, -1);
  // ---------- Techos (textura rugosa) ----------
  B.ceil('ceilRough', -W, W, 6.0, 8.0, UPY + CH);
  B.slopeCeil('ceilRough', 'z', 6.0, 2.4, UPY + CH, CH, -W, W);
  B.ceil('ceilRough', -W, W, 0, 2.4, CH);
  B.slopeCeil('ceilRough', 'z', 0, -7.2, CH, ceilF1(-7.2), -W, W);
  B.ceil('ceilRough', -W, 4.0, -10.2, -7.2, Y1 + CH);
  B.slopeCeil('ceilRough', 'x', 4.0, 9.4, Y1 + CH, Y2 + CH, -10.2, -7.2);
  B.ceil('ceilRough', 9.4, 13.0, -10.2, -7.2, Y2 + CH);
  B.poster(Signs.stain(), [11.8, Y2 + CH - 0.005, -9.1], '-y', 1.6, 1.6, { alpha: true, off: 0.004 });
  // ---------- Pasamanos dobles en ambas paredes ----------
  for (const h of [0.68, 0.86]) {
    for (const [x, w] of [[-W + 0.07, [-1, 0]], [W - 0.07, [1, 0]]]) {
      B.rail([[x, UPY + h, 6.4], [x, UPY + h, 6.0], [x, h, 2.4], [x, h, 0], [x, Y1 + h, -7.2], [x, Y1 + h, -7.7]], w, { every: 1.6 });
    }
    B.rail([[3.6, Y1 + h, -10.13], [4.0, Y1 + h, -10.13], [9.4, Y2 + h, -10.13], [9.9, Y2 + h, -10.13]], [0, -1], { every: 1.6 });
    B.rail([[3.6, Y1 + h, -7.27], [4.0, Y1 + h, -7.27], [9.4, Y2 + h, -7.27], [9.9, Y2 + h, -7.27]], [0, 1], { every: 1.6 });
    B.rail([[-1.2, Y1 + h, -10.13], [-0.65, Y1 + h, -10.13]], [0, -1]); B.rail([[0.65, Y1 + h, -10.13], [3.3, Y1 + h, -10.13]], [0, -1]);
  }
  // ---------- Podotáctiles ----------
  B.tactile('dots', -W, W, 0.3, 0.6, 0); B.tactile('dots', -W, W, 1.8, 2.1, 0);
  B.tactile('dots', -W, W, 6.3, 6.6, UPY);
  B.tactile('dots', -W, W, -7.8, -7.5, Y1); B.tactile('dots', 3.4, 3.7, -10.2, -7.2, Y1);
  B.tactile('dots', 9.7, 10.0, -10.2, -7.2, Y2);
  B.tactile('bars', -0.15, 0.15, -10.2, -7.8, Y1, 'z'); B.tactile('bars', 0.15, 3.4, -8.85, -8.55, Y1, 'x');
  // ---------- Puerta cerrada al fondo del rellano ----------
  B.box('white', -0.5, Y1, -10.2, 0.5, Y1 + 2.05, -10.165, { seg: 0.6 });
  B.box('grey', -0.56, Y1 + 2.05, -10.2, 0.56, Y1 + 2.11, -10.15); B.box('grey', -0.56, Y1, -10.2, -0.5, Y1 + 2.05, -10.15); B.box('grey', 0.5, Y1, -10.2, 0.56, Y1 + 2.05, -10.15);
  B.cyl('metal', [0.36, Y1 + 1.0, -10.16], [0.36, Y1 + 1.0, -10.1], 0.02, 6, { caps: true }); B.cyl('metal', [0.36, Y1 + 1.0, -10.1], [0.22, Y1 + 1.0, -10.1], 0.016, 6, { caps: true });
  B.poster(Signs.staffOnly(), [0, Y1 + 1.55, -10.16], '+z', 0.56, 0.14, { off: 0.003 });
  // puerta de servicio: atajo hacia el túnel en obras (se desbloquea desde el otro lado)
  B.door({ box: { x0: -0.5, x1: 0.5, y0: Y1, y1: Y1 + 2.05, z0: -10.25, z1: -10.1 }, to: 'z5', spawn: 'fromZ2', flag: 'svcDoor', pos: [0, Y1 + 1.0, -10.1], msg: 'Solo personal. Cerrada desde el otro lado.' });
  B.glowSign(Signs.exitSign(), [0, Y1 + 2.35, -10.16], '+z', 0.5, 0.25, 1.4);
  B.bake({ p: [0, Y1 + 2.3, -10.0], color: lin(0x2aff8a), I: 0.22, range: 3, dir: [0, 0, 1], dmin: 0.1, bounce: 0.02 });
  B.glow([0, Y1 + 2.35, -10.05], [0.02, 0.12, 0.05], 0.8);
  // ---------- Carteles y detalles de "vida pasada" ----------
  B.when('act2', false, () => {
    B.poster(Signs.rushPoster(), [-W, stairF1(-2.4) + 1.55, -2.4], '+x', 0.6, 0.84, { off: 0.02 });
    B.poster(Signs.lastTrain(), [-W, stairF1(-4.9) + 1.55, -4.9], '+x', 0.6, 0.84, { off: 0.02 });
    B.poster(Signs.manners(), [W, stairF1(-3.6) + 1.55, -3.6], '-x', 0.6, 0.84, { off: 0.02 });
  });
  // 2º acto: los tres pósters dicen lo mismo
  B.when('act2', true, () => {
    for (const [x, z, f] of [[-W, -2.4, '+x'], [-W, -4.9, '+x'], [W, -3.6, '-x']]) B.poster(Signs.scrawl, [x, stairF1(z) + 1.55, z], f, 0.6, 0.84, { off: 0.02, key: 'scrawl' });
    // paraguas olvidados que antes no estaban
    for (let k = 0; k < 4; k++) { const x = 1.6 + k * 0.5; B.cyl('dark', [x, Y1 + 0.02, -10.1], [x + 0.05, Y1 + 0.86, -10.0], 0.009, 5); B.cyl('umbrella', [x + 0.005, Y1 + 0.18, -10.1], [x + 0.045, Y1 + 0.82, -10.02], 0.016, 10, { r2: 0.075 }); }
  });
  B.poster(Signs.notice(21, 'お願い'), [W, 1.5, 1.4], '-x', 0.32, 0.45);
  for (const [z, r] of [[-2.4, 0], [-4.9, 0], [-3.6, 1]]) { const y = stairF1(z) + 1.55, x0 = r ? W - 0.015 : -W, x1 = r ? W : -W + 0.015; B.box('metal', x0, y - 0.45, z - 0.33, x1, y + 0.45, z + 0.33, { skip: [r ? 'px' : 'nx'] }); }
  B.glowSign(Signs.gates(), [2.4, Y1 + 2.1, -10.17], '+z', 1.6, 0.4, 1.1);
  B.box('red', -W, Y1 + 0.75, -9.55, -W + 0.18, Y1 + 1.35, -9.15); B.poster(Signs.extinguisher(), [-W + 0.18, Y1 + 1.05, -9.35], '+x', 0.36, 0.56, { off: 0.003 });
  B.collider(-W, -W + 0.2, -9.6, -9.1);
  // paraguas de plástico olvidado, apoyado en la esquina
  B.cyl('dark', [3.82, Y1 + 0.02, -7.42], [3.9, Y1 + 0.86, -7.3], 0.009, 5);
  B.cyl('umbrella', [3.825, Y1 + 0.18, -7.41], [3.89, Y1 + 0.82, -7.32], 0.016, 10, { r2: 0.075 });
  B.cyl('dark', [3.9, Y1 + 0.86, -7.3], [3.86, Y1 + 0.95, -7.3], 0.012, 5);
  // cámara de seguridad
  B.box('dark', 2.35, Y1 + CH - 0.12, -7.7, 2.6, Y1 + CH, -7.45); B.cyl('gloss', [2.47, Y1 + CH - 0.12, -7.57], [2.47, Y1 + CH - 0.2, -7.57], 0.07, 10, { caps: true, r2: 0.05 });
  // rejilla de ventilación y aviso en el rellano inferior
  B.box('grate', 11.55, Y2 + 1.7, -10.2, 12.45, Y2 + 2.2, -10.16);
  B.poster(Signs.shutterNotice(), [12.9, Y2 + 1.5, -9.3], '-x', 0.42, 0.33, { off: 0.006 });
  // dos persianas: la derecha cerrada, la izquierda subida (paso al vestíbulo)
  B.box('shutter', 12.9, Y2, -9.95, 13.0, Y2 + 2.3, -8.65, { seg: 0.6 });
  B.box('grey', 12.7, Y2 + 2.3, -10.2, 13.0, Y2 + 2.55, -7.2);
  B.collider(12.85, 13.05, -10.2, -8.6);
  B.interact({ x0: 12.8, x1: 13.0, y0: Y2, y1: Y2 + 2.3, z0: -9.95, z1: -8.65 }, () => { AudioSys.shutterRattle([12.9, Y2 + 1.1, -9.3]); Hud.msg('La persiana no se mueve.'); }, 'Persiana');
  B.reverbArea({ x0: 13.0, x1: 17.5, z0: -8.7, z1: -7.1, y0: Y2 - 1, y1: Y2 + 3 }, 'corridor');
  // cartel de precaución + charco
  B.poster(Signs.caution(), [10.9, Y2 + 0.42, -7.7], '-x', 0.36, 0.48, { off: 0.0 });
  B.box('yellow', 10.9, Y2, -7.95, 10.94, Y2 + 0.05, -7.45);
  B.collider(10.7, 11.1, -8.0, -7.4);
  { const g = new THREE.CircleGeometry(1, 18); g.rotateX(-PI / 2); B.bt('puddle').geo(g, new THREE.Matrix4().makeScale(0.75, 1, 0.5).setPosition(11.9, Y2 + 0.006, -9.2)); B.surface(11.3, 12.5, -9.6, -8.8, Y2, 'puddle', 3); }
  // ---------- Luces ----------
  // rellano superior (luz real 0)
  B.tube({ p: [0, CH - 0.06, 1.3], axis: 'x', len: 1.2, color: cool, I: 6, range: 9, real: 0, group: 'u', flicker: 'rare' });
  B.glint({ L: [0, CH, 1.3], fy: 0, color: lin(cool), k: 0.5, size: 0.8, b: [-W, W, 0, 2.4], group: 'u' });
  // tramo de subida y rellano alto (hacia la calle)
  B.tube({ p: [-W + 0.08, 3.3, 4.2], axis: 'z', len: 1.2, mount: [-1, 0, 0], color: cool, I: 3, range: 8 });
  B.tube({ p: [0, UPY + CH - 0.06, 7.2], axis: 'x', len: 1.2, color: 0xe0eaff, I: 4.5, range: 8 });
  // tramo 1: tubos en lo alto de las paredes
  for (const z of [-1.5, -4.3]) B.tube({ p: [-W + 0.08, ceilF1(z) - 0.32, z], axis: 'z', len: 1.2, mount: [-1, 0, 0], color: cool, I: 3.4, range: 8 });
  B.tube({ p: [W - 0.08, ceilF1(-0.2) - 0.32, -0.2], axis: 'z', len: 1.2, mount: [1, 0, 0], color: cool, I: 3.4, range: 8 });
  B.tube({ p: [W - 0.08, ceilF1(-2.9) - 0.32, -2.9], axis: 'z', len: 1.2, mount: [1, 0, 0], color: cool, dead: true });
  B.tube({ p: [W - 0.08, ceilF1(-5.6) - 0.32, -5.6], axis: 'z', len: 1.2, mount: [1, 0, 0], color: cool, I: 3, range: 8 });
  // rellano 1 (luz real 1)
  B.tube({ p: [1.3, Y1 + CH - 0.06, -8.7], axis: 'x', len: 1.2, color: cool, I: 7, range: 10, real: 1, group: 'l1', flicker: 'rare' });
  B.tube({ p: [-0.6, Y1 + CH - 0.06, -8.0], axis: 'z', len: 1.2, color: cool, I: 3.5, range: 8 });
  B.glint({ L: [1.3, Y1 + CH, -8.7], fy: Y1, color: lin(cool), k: 0.55, size: 0.85, b: [-W, 4.0, -10.2, -7.2], group: 'l1' });
  B.glint({ L: [-0.6, Y1 + CH, -8.0], fy: Y1, color: lin(cool), k: 0.4, size: 0.8, b: [-W, 4.0, -10.2, -7.2] });
  // tramo 2: un tubo averiado (luz real 2) y uno muerto
  B.tube({ p: [5.6, ceilF2(5.6) - 0.3, -7.28], axis: 'x', len: 1.2, mount: [0, 0, 1], color: 0xc8dcff, I: 4, range: 7, real: 2, group: 'f2', flicker: 'faulty' });
  B.tube({ p: [8.2, ceilF2(8.2) - 0.3, -10.12], axis: 'x', len: 1.2, mount: [0, 0, -1], color: cool, dead: true });
  // rellano inferior: luz tenue
  B.tube({ p: [11.2, Y2 + CH - 0.06, -8.7], axis: 'z', len: 1.2, color: 0xbcd2ff, I: 3, range: 7, power: 2.4, glowK: 0.13 });
  B.glint({ L: [11.2, Y2 + CH, -8.7], fy: Y2, color: lin(0xbcd2ff), k: 0.3, size: 0.7, b: [9.4, 13, -10.2, -7.2] });
  B.occluder(-W - 0.3, -W, -8, 6, -10.5, 8.2); B.occluder(W, W + 0.3, -4.2, 6, -7.2, 8.2);
  B.occluder(W, 13.2, Y2 - 0.2, Y1 + CH + 0.3, -7.2, -6.9);
  // ---------- Objetos, notas y sustos ----------
  B.note({ id: 'n2', p: [10.6, Y2 + 1.45, -10.2], facing: '+z', w: 0.24, h: 0.31 });
  B.pickup({ id: 'key', item: 'key', p: [10.6, Y2 + 0.01, -9.85], build: (b) => keyProp(b, 10.6, Y2 + 0.004, -9.85), label: 'Recoger llave', msg: 'Una llave con etiqueta: «ホーム西» — andén, lado oeste.' });
  B.pickup({ id: 'bat2', item: 'battery', p: [-0.95, Y1 + 0.01, -8.4], build: (b) => batteryProp(b, -0.95, Y1, -8.4, 1.2) });
  B.decal('tally', Signs.tally, [3.0, Y1 + 1.35, -10.2], '+z', 1.0, 0.5, { off: 0.02 });
  B.decal('grime', Signs.grime, [11.5, Y2 + 1.4, -10.2], '+z', 2.2, 2.2);
  paperProp(B, 2.4, Y1, -8.0, 1.2); canProp(B, 12.3, Y2, -7.6);
  B.decal('crack', Signs.crack, [-W, ceilF1(-6) - 0.9, -6], '+x', 1.2, 1.2);
  B.decal('grafA', () => Signs.graffiti('でられない'), [6.7, Y1 + 0.2, -10.2], '+z', 2.4, 0.6);
  // pasos que bajan detrás de ti por el primer tramo
  B.trigger({ x0: -W, x1: W, z0: -4.4, z1: -3.2 }, () => Scares.steps(6, 'stair', 0.5), { id: 'z2steps' });
  // el tubo averiado del segundo tramo revienta al pasar
  B.trigger({ x0: 6.2, x1: 7.6, z0: -10.2, z1: -7.2 }, (z) => Scares.lampBurst(z, 'f2', [5.6, ceilF2(5.6) - 0.3, -7.3]), { id: 'z2pop' });
  B.when('act2', true, () => B.trigger({ x0: -W, x1: 3.0, z0: -9.0, z1: -7.6 }, () => Scares.slam([0, Y1 + 1.0, -10.1]), { id: 'z2slam' }));
  // ---------- Sonido ----------
  B.emitter({ type: 'hum', pos: [0, CH - 0.1, 1.3], gain: 0.06, group: 'u' });
  B.emitter({ type: 'hum', pos: [-W + 0.1, ceilF1(-3) - 0.3, -3], gain: 0.045 });
  B.emitter({ type: 'hum', pos: [1.3, Y1 + CH - 0.1, -8.7], gain: 0.06, group: 'l1' });
  B.emitter({ type: 'hum', pos: [5.6, ceilF2(5.6) - 0.3, -7.35], gain: 0.05, group: 'f2', sizzle: 2.6 });
  B.emitter({ type: 'wind', pos: [0, UPY + 1.6, 7.6], gain: 0.07, ref: 2 });
  B.emitter({ type: 'drip', pos: [11.9, Y2 + CH - 0.1, -9.2], gain: 0.28, send: 1.0, min: 2.5, max: 8 });
  B.emitter({ type: 'vent', pos: [12.0, Y2 + 1.95, -10.1], gain: 0.05 });
  B.emitter({ type: 'rumble', gain: 0.22, first: 18 });
  // ---------- Conexiones ----------
  B.portal({ x0: -W - 0.1, x1: W + 0.1, z0: 6.7, z1: 8.3, y0: 0, y1: 5 }, 'z1', 'fromBelow');
  B.spawn('top', 0, 1.7, 0);
  B.spawn('fromZ3', 14.4, -7.9, yawTo(-1, 0));
  B.spawn('fromZ5', 0, -9.4, PI);
  return B;
}

