/* ---------- Texturas de las zonas 6–7 ---------- */
Object.assign(Tex, {
  // Baldosa vieja a dos tonos (galería comercial)
  tileOld: () => tex('tileOld', () => {
    const n = 8, ts = 512 / n;
    const cv = pixels(512, 512, (x, y, o) => {
      const i = Math.floor(x / ts), j = Math.floor(y / ts);
      if (x % ts < 2 || y % ts < 2) { o[0] = 40; o[1] = 42; o[2] = 34; return; }
      const dark = (i + j) % 2 === 0, h = hash2(i, j, 7), n2 = (fbm(x / 512 * 8, y / 512 * 8, 8, 8, 2, 4) - 0.5) * 20;
      const c = dark ? [96 + h * 10, 104 + h * 8, 82] : [176 + h * 10, 170 + h * 8, 140];
      o[0] = c[0] + n2; o[1] = c[1] + n2; o[2] = c[2] + n2;
    });
    const g = cv.getContext('2d'), R = mulberry32(17); g.strokeStyle = 'rgba(20,20,10,0.5)'; g.lineWidth = 1.2;
    for (let k = 0; k < 7; k++) { let x = R() * 512, y = R() * 512; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
    return toTex(grime(cv, 0.45, 18, 3));
  }),
  plasterOld: () => tex('plasterOld', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const n = fbm(x / 512 * 4, y / 512 * 4, 4, 4, 4, 23), m = fbm(x / 512 * 2, y / 512 * 2, 2, 2, 3, 24);
      const v = 170 + (n - 0.5) * 50 + (hash2(x, y, 3) - 0.5) * 10; o[0] = v * (0.92 + m * 0.06); o[1] = v * (0.98 + m * 0.04); o[2] = v * 0.8;
    });
    const g = cv.getContext('2d'), R = mulberry32(25);
    for (let k = 0; k < 18; k++) { const x = R() * 512, w = 3 + R() * 18, y = R() * 260, l = 80 + R() * 260;
      const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(50,46,20,0.35)'); gr.addColorStop(1, 'rgba(50,46,20,0)'); g.fillStyle = gr; g.fillRect(x, y, w, l); }
    g.fillStyle = 'rgba(30,34,20,0.5)'; g.fillRect(0, 440, 512, 72);
    return toTex(grime(cv, 0.45, 26));
  }),
  marble: () => tex('marble', () => {
    const cv = pixels(1024, 1024, (x, y, o) => {
      const i = Math.floor(x / 256), j = Math.floor(y / 256);
      if (x % 256 < 2 || y % 256 < 2) { o[0] = 120; o[1] = 120; o[2] = 124; return; }
      const v1 = fbm(x / 1024 * 6 + i * 3.1, y / 1024 * 6, 6, 6, 4, 31 + i + j * 4);
      const vein = Math.pow(1 - Math.abs(Math.sin((x + y * 0.6) / 1024 * 18 + v1 * 9)), 14);
      const h = hash2(i, j, 5) * 10, v = 196 + h - vein * 34 + (v1 - 0.5) * 18;
      o[0] = v; o[1] = v - 2; o[2] = v - 6;
    });
    return toTex(cv);
  }),
  marbleWall: () => tex('marbleWall', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 190 + (fbm(x / 512 * 4, y / 512 * 4, 4, 4, 3, 41) - 0.5) * 22; o[0] = v; o[1] = v - 4; o[2] = v - 12; });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(60,50,40,0.5)'; for (let i = 0; i < 2; i++) { g.fillRect(i * 256, 0, 2, 512); g.fillRect(0, i * 256, 512, 2); }
    return toTex(grime(cv, 0.15, 42));
  }),
  galleryWall: () => tex('galleryWall', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 120 + (hash2(x, y, 3) - 0.5) * 8; o[0] = v; o[1] = v; o[2] = v + 6; });
    const g = cv.getContext('2d');
    g.fillStyle = '#0d1016'; g.fillRect(60, 120, 180, 300); g.fillRect(300, 120, 160, 300);
    g.fillStyle = 'rgba(120,150,200,0.12)'; g.fillRect(70, 130, 60, 280); g.fillRect(310, 130, 50, 280);
    g.fillStyle = '#3a3e46'; g.fillRect(146, 120, 6, 300); g.fillRect(376, 120, 6, 300);
    return toTex(grime(cv, 0.2, 44));
  }),
  windowBand: () => tex('windowBand', () => {
    const cv = mkCanvas(256, 256), g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#9fc2ff'); gr.addColorStop(0.55, '#6f98e6'); gr.addColorStop(1, '#38549a');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(20, 256); g.lineTo(120, 0); g.lineTo(160, 0); g.lineTo(60, 256); g.fill();
    g.fillStyle = '#10141c'; for (let i = 0; i <= 4; i++) g.fillRect(i * 64 - 4, 0, 8, 256); for (let j = 0; j <= 4; j++) g.fillRect(0, j * 64 - 3, 256, 6);
    return toTex(cv);
  }),
  skylight: () => tex('skylight', () => {
    const cv = mkCanvas(256, 256), g = cv.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#d8e6ff'); gr.addColorStop(1, '#5a7cc0');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = '#121620';
    for (let i = 0; i < 6; i++) { g.fillRect(i * 51, 0, 5, 256); g.fillRect(0, i * 51, 256, 5); }
    return toTex(cv, { repeat: false });
  }),
  patch: () => tex('patch', () => {
    const cv = mkCanvas(256, 256), g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    g.filter = 'blur(6px)'; g.fillStyle = '#fff';
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) g.fillRect(30 + i * 104, 20 + j * 74, 90, 62);
    g.filter = 'none'; return toTex(cv, { repeat: false });
  }),
  shaft: () => tex('shaft', () => {
    const cv = mkCanvas(128, 256), g = cv.getContext('2d');
    const gy = g.createLinearGradient(0, 0, 0, 256); gy.addColorStop(0, '#fff'); gy.addColorStop(1, '#000'); g.fillStyle = gy; g.fillRect(0, 0, 128, 256);
    g.globalCompositeOperation = 'multiply'; const gx = g.createLinearGradient(0, 0, 128, 0);
    gx.addColorStop(0, '#000'); gx.addColorStop(0.3, '#fff'); gx.addColorStop(0.7, '#fff'); gx.addColorStop(1, '#000'); g.fillStyle = gx; g.fillRect(0, 0, 128, 256);
    return toTex(cv, { repeat: false });
  }),
  barber: () => tex('barber', () => {
    const cv = mkCanvas(128, 256), g = cv.getContext('2d'); g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, 128, 256);
    for (let k = -6; k < 12; k++) { g.fillStyle = k % 2 ? '#c42020' : '#2040a0'; g.beginPath(); g.moveTo(0, k * 32); g.lineTo(128, k * 32 + 64); g.lineTo(128, k * 32 + 80); g.lineTo(0, k * 32 + 16); g.fill(); }
    return toTex(cv);
  }),
});

/* ---------- Materiales nuevos (zonas 6–7) ---------- */
Object.assign(MDEF, {
  tileOld: { mat: () => bakedMat('tileOld', { map: Tex.tileOld(), std: true, rough: 0.55 }), tex: 1.6 },
  plasterOld: { mat: () => bakedMat('plasterOld', { map: Tex.plasterOld() }), tex: 2.0 },
  marble: { mat: () => bakedMat('marble', { map: Tex.marble(), std: true, rough: 0.09 }), tex: 4.8, seg: 1.0 },
  marbleWall: { mat: () => bakedMat('marbleWall', { map: Tex.marbleWall(), std: true, rough: 0.35 }), tex: 2.4 },
  galleryWall: { mat: () => bakedMat('galleryWall', { map: Tex.galleryWall() }), tex: 3.0 },
  barber: { mat: () => bakedMat('barber', { map: Tex.barber() }), tex: 0.5 },
  leaf: paint('pLeaf', 0x22402a), soil: paint('pSoil', 0x1e1610), seatGrey: paint('pSeatG', 0x565a62), cardboard: paint('pCard', 0x8a6a42),
  phoneGreen: paint('pPhone', 0x2f8a52, true, 0.4), trunk: paint('pTrunk', 0x3a2a1c),
});

