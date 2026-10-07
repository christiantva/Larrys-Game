/* ---------- Texturas de las zonas 3–7 ---------- */
Object.assign(Tex, {
  // Terrazo claro con baldosas oscuras en diagonal (vestíbulo)
  terrazzo: () => tex('terrazzo', () => toTex(stoneCanvas({ size: 1024, nx: 8, ny: 8, base: [204, 202, 194], vary: 6, speck: 0.16, groutCol: [150, 148, 140], grout: 3, seed: 31, cloud: 0.15,
    alt: (i, j) => ((i % 4 === 0 && j % 4 === 0) || (i % 4 === 1 && j % 4 === 1) ? [92, 94, 98] : null) }))),
  // Techo de lamas metálicas lineales
  ceilLinear: () => tex('ceilLinear', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const t = (y % 51) / 51; let v = t < 0.16 ? 46 : 196 - t * 26; v += (hash2(x, y, 7) - 0.5) * 6; o[0] = v; o[1] = v + 1; o[2] = v + 3;
    });
    return toTex(grime(cv, 0.12, 8, 2));
  }),
  bluePanel: () => tex('bluePanel', () => {
    const cv = pixels(256, 256, (x, y, o) => { const v = (hash2(x, y, 3) - 0.5) * 6; o[0] = 30 + v; o[1] = 92 + v; o[2] = 170 + v; });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(160,200,240,0.55)'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 0, 6, 256);
    g.fillStyle = 'rgba(0,0,30,0.35)'; g.fillRect(0, 250, 256, 6); return toTex(grime(cv, 0.15, 5, 2));
  }),
  panelCream: () => tex('panelCream', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 214 + (fbm(x / 512 * 4, y / 512 * 4, 4, 4, 2, 5) - 0.5) * 14; o[0] = v; o[1] = v - 4; o[2] = v - 14; });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(80,70,50,0.45)';
    for (let i = 0; i < 2; i++) g.fillRect(i * 256, 0, 2, 512); for (let j = 0; j < 3; j++) g.fillRect(0, j * 171, 512, 2);
    return toTex(grime(cv, 0.22, 33));
  }),
  wallGrey: () => tex('wallGrey', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 112 + (fbm(x / 512 * 6, y / 512 * 6, 6, 6, 3, 41) - 0.5) * 20 + (hash2(x, y, 4) - 0.5) * 6; o[0] = v; o[1] = v + 2; o[2] = v + 4; });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(20,22,24,0.6)';
    for (let j = 0; j < 6; j++) g.fillRect(0, j * 86, 512, 3); for (let i = 0; i < 2; i++) g.fillRect(i * 256, 0, 3, 512);
    g.fillStyle = 'rgba(255,255,255,0.08)'; for (let j = 0; j < 6; j++) g.fillRect(0, j * 86 + 3, 512, 2);
    return toTex(grime(cv, 0.3, 42));
  }),
  tileSmall: () => tex('tileSmall', () => toTex(tileCanvas({ n: 8, base: [146, 149, 152], groutCol: [96, 98, 100], vary: 10, grout: 0.06, dirt: 0.3, seed: 51 }))),
  tileSmallBump: () => tex('tileSmallBump', () => toTex(tileBump(8, 0.06), { srgb: false })),
  ceilDark: () => tex('ceilDark', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 70 + (hash2(x, y, 2) - 0.5) * 10; o[0] = v; o[1] = v + 1; o[2] = v + 3; });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0.6)'; for (let i = 0; i < 4; i++) { g.fillRect(i * 128, 0, 3, 512); g.fillRect(0, i * 128, 512, 3); }
    return toTex(grime(cv, 0.3, 12));
  }),
  concreteDirty: () => tex('concreteDirty', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const n = fbm(x / 512 * 4, y / 512 * 4, 4, 4, 5, 61), m = fbm(x / 512 * 2, y / 512 * 2, 2, 2, 3, 62), f = hash2(x, y, 9);
      const v = 104 + (n - 0.5) * 80 + (f - 0.5) * 18; o[0] = v * (1.05 + m * 0.12); o[1] = v * (0.98 + m * 0.06); o[2] = v * 0.8;
    });
    const g = cv.getContext('2d'), R = mulberry32(64);
    for (let k = 0; k < 24; k++) { const x = R() * 512, w = 2 + R() * 14, y = R() * 300, l = 80 + R() * 300;
      const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(40,30,10,0.3)'); gr.addColorStop(1, 'rgba(40,30,10,0)'); g.fillStyle = gr; g.fillRect(x, y, w, l); }
    g.fillStyle = 'rgba(20,20,20,0.5)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(64 + i * 128, 64 + j * 128, 5, 0, PI * 2); g.fill(); }
    return toTex(cv);
  }),
  // Balasto: piedras por ruido celular (rápido, se repite sin costuras)
  ballast: () => tex('ballast', () => {
    const N = 24, cs = 512 / N;
    const cv = pixels(512, 512, (x, y, o) => {
      const fx = x / cs, fy = y / cs, ix = Math.floor(fx), iy = Math.floor(fy);
      let d1 = 9, d2 = 9, id = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const cx = ix + i, cy = iy + j, wx = ((cx % N) + N) % N, wy = ((cy % N) + N) % N;
        const px = cx + 0.15 + hash2(wx, wy, 11) * 0.7, py = cy + 0.15 + hash2(wx, wy, 12) * 0.7;
        const d = (px - fx) * (px - fx) + (py - fy) * (py - fy);
        if (d < d1) { d2 = d1; d1 = d; id = wx * 97 + wy; } else if (d < d2) d2 = d;
      }
      const edge = Math.sqrt(d2) - Math.sqrt(d1), h = hash2(id, 3, 13), tint = hash2(id, 5, 14);
      let v = 58 + h * 80; v *= 0.45 + 0.55 * smooth(0.0, 0.45, edge); if (edge < 0.05) v = 22;
      v += (hash2(x, y, 2) - 0.5) * 16;
      o[0] = v * (1.02 + tint * 0.1); o[1] = v; o[2] = v * (0.94 - tint * 0.06);
    });
    return toTex(grime(cv, 0.3, 72, 2));
  }),
  tunnelLining: () => tex('tunnelLining', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const n = fbm(x / 512 * 4, y / 512 * 4, 4, 4, 4, 81); const v = 96 + (n - 0.5) * 50 + (hash2(x, y, 6) - 0.5) * 14;
      o[0] = v * 1.04; o[1] = v; o[2] = v * 0.86;
    });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(15,12,8,0.7)'; g.fillRect(0, 0, 4, 512); g.fillRect(256, 0, 3, 512);
    g.fillStyle = 'rgba(15,12,8,0.4)'; g.fillRect(0, 0, 512, 2);
    for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(12, 64 + j * 128, 5, 0, PI * 2); g.fill(); g.beginPath(); g.arc(268, 64 + j * 128, 5, 0, PI * 2); g.fill(); }
    return toTex(grime(cv, 0.4, 82));
  }),
  rust: () => tex('rust', () => toTex(pixels(256, 256, (x, y, o) => {
    const n = fbm(x / 256 * 6, y / 256 * 6, 6, 6, 4, 91), h = hash2(x, y, 2);
    o[0] = 70 + n * 90 + h * 14; o[1] = 42 + n * 46 + h * 8; o[2] = 26 + n * 20 + h * 6;
  }))),
  plywood: () => tex('plywood', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const gr = Math.sin((x / 512) * 40 + fbm(x / 512 * 2, y / 512 * 8, 2, 8, 3, 5) * 9) * 0.5 + 0.5;
      const v = 150 + gr * 30 + (hash2(x, y, 3) - 0.5) * 10; o[0] = v; o[1] = v * 0.8; o[2] = v * 0.56;
    });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(30,20,10,0.6)'; g.fillRect(0, 254, 512, 4); g.fillRect(254, 0, 4, 512);
    return toTex(grime(cv, 0.35, 7));
  }),
});

/* ---------- Materiales nuevos ---------- */
Object.assign(MDEF, {
  terrazzo: { mat: () => bakedMat('terrazzo', { map: Tex.terrazzo(), std: true, rough: 0.2 }), tex: 4.8 },
  sleeper: paint('pSleeper', 0x4c4a46),
  ceilLinear: { mat: () => bakedMat('ceilLinear', { map: Tex.ceilLinear() }), tex: 1.2 },
  bluePanel: { mat: () => bakedMat('bluePanel', { map: Tex.bluePanel(), std: true, rough: 0.35 }), tex: 1.0 },
  panelCream: { mat: () => bakedMat('panelCream', { map: Tex.panelCream(), std: true, rough: 0.5 }), tex: 1.8 },
  wallGrey: { mat: () => bakedMat('wallGrey', { map: Tex.wallGrey() }), tex: 3.0 },
  tileSmall: { mat: () => bakedMat('tileSmall', { map: Tex.tileSmall(), bump: Tex.tileSmallBump(), bumpScale: 0.5, std: true, rough: 0.28 }), tex: 1.2 },
  ceilDark: { mat: () => bakedMat('ceilDark', { map: Tex.ceilDark() }), tex: 1.2 },
  concreteDirty: { mat: () => bakedMat('concreteDirty', { map: Tex.concreteDirty() }), tex: 2.0 },
  ballast: { mat: () => bakedMat('ballast', { map: Tex.ballast() }), tex: 1.0, seg: 1.0 },
  tunnelLining: { mat: () => bakedMat('tunnelLining', { map: Tex.tunnelLining() }), tex: 2.4 },
  rust: { mat: () => bakedMat('rust', { map: Tex.rust(), std: true, metal: 0.3, rough: 0.75 }), tex: 1.0 },
  plywood: { mat: () => bakedMat('plywood', { map: Tex.plywood() }), tex: 2.4 },
  rail: { mat: () => bakedMat('rail', { map: Tex.metal(), std: true, metal: 0.7, rough: 0.3, color: 0x9ea2a6 }), tex: 1.0 },
  glass: { mat: () => bakedMat('glass', { std: true, rough: 0.04, color: 0x9fb4c4, transparent: true, opacity: 0.16 }), tex: 1.0, seg: 2 },
  gateGrey: paint('pGate', 0xd5d9da, true, 0.4), psdWhite: paint('pPsd', 0xe6e6e0, true, 0.35), psdBeige: paint('pPsdB', 0xb8a688),
  orange: paint('pOrange', 0xd8581a), concreteGrey: paint('pConc', 0x8a8780), olive: paint('pOlive', 0x5a6040), woodBrown: paint('pBrown', 0x5a3a24), seatBlue: paint('pSeat', 0x2a62a8, true, 0.4),
});

