/* =====================================================================
   CARTELES Y CALCOMANÍAS DE TERROR — notas, anomalías del 2º acto, suciedad
   ===================================================================== */
// Mancha de spray / tinta con bordes irregulares
function blot(g, x, y, r, color, R) {
  g.fillStyle = color;
  for (let i = 0; i < 26; i++) { const a = R() * PI * 2, d = R() * r; g.globalAlpha = 0.08 + R() * 0.2; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.2 + R() * 0.5), 0, PI * 2); g.fill(); }
  g.globalAlpha = 1;
}
Object.assign(Signs, {
  // Atlas de 4 papeles (notas) con letra a mano simulada
  paper: () => signCanvas(1024, 330, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let k = 0; k < 4; k++) {
      const R = mulberry32(80 + k), x0 = k * 256 + 8, y0 = 6, pw = 240, ph = 316;
      g.save(); g.translate(x0 + pw / 2, y0 + ph / 2); g.rotate((R() - 0.5) * 0.04); g.translate(-pw / 2, -ph / 2);
      g.fillStyle = ['#ece6d6', '#e6e2d2', '#f0ead8', '#dcd6c4'][k]; g.fillRect(0, 0, pw, ph);
      g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, ph * 0.5, pw, 2);                         // doblez
      g.strokeStyle = 'rgba(40,40,60,0.75)'; g.lineWidth = 2;
      for (let r = 0; r < 11; r++) {
        let x = 16, y = 28 + r * 24; const end = 16 + (pw - 32) * (0.5 + R() * 0.5);
        g.beginPath(); g.moveTo(x, y);
        while (x < end) { x += 4 + R() * 7; g.lineTo(x, y + (R() - 0.5) * 7); }
        g.stroke();
      }
      blot(g, pw * R(), ph * R(), 16, 'rgba(90,70,40,1)', R);                                  // manchas de café/humedad
      g.restore();
    }
  }),
  canopyAct2() {
    const cv = Signs.canopy(), g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 136); gr.addColorStop(0, '#fbfbf8'); gr.addColorStop(1, '#e8eae6'); g.fillStyle = gr; g.fillRect(2300, 0, 620, 136);
    txt(g, '終着駅', 2330, 54, 76, '#2a0c0c', { weight: '900' }); txt(g, 'Terminal.', 2336, 112, 32, '#5a1a1a', { font: EN, weight: '600' });
    const R = mulberry32(13); blot(g, 2700, 70, 40, '#5a0a08', R);
    return cv;
  },
  ledBoardAct2: () => signCanvas(1024, 136, (g, w, h) => {
    g.fillStyle = '#060504'; g.fillRect(0, 0, w, h);
    txt(g, 'あなたはまだここにいます', w / 2, 44, 46, '#ff3a1a', { align: 'center' });
    txt(g, 'You are still here.', w / 2, 100, 36, '#ff3a1a', { font: 'monospace', align: 'center' });
    g.fillStyle = 'rgba(6,5,4,0.75)'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1.5, h); for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1.5);
  }),
  platformNameAct2: () => signCanvas(1024, 192, (g, w, h) => {
    g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1a1a'; g.fillRect(0, h - 22, w, 22);
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(90, 86, 58, 0, PI * 2); g.fill(); txt(g, '0', 90, 90, 80, '#fff', { font: EN, align: 'center', weight: '900' });
    txt(g, '番線', 170, 86, 46, '#1a1a1a'); txt(g, '終点 方面', 340, 66, 54, '#1a1a1a'); txt(g, 'for Terminal', 344, 132, 30, '#444', { font: EN, weight: '500' });
    txt(g, 'しゅうちゃくえき', 760, 60, 24, '#555'); txt(g, '終着駅', 760, 110, 50, '#1a1a1a');
  }),
  // Póster tachado con letras rojas (2º acto, escalera)
  scrawl: () => signCanvas(300, 420, (g, w, h) => {
    g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, w, h); const R = mulberry32(31);
    for (let i = 0; i < 6; i++) blot(g, R() * w, R() * h, 50, '#2a2420', R);
    g.save(); g.translate(w / 2, h / 2); g.rotate(-0.06);
    txt(g, 'まだ', 0, -130, 80, '#8a0e0a', { align: 'center', weight: '900' }); txt(g, 'ここに', 0, -20, 80, '#8a0e0a', { align: 'center', weight: '900' }); txt(g, 'いる', 0, 100, 80, '#8a0e0a', { align: 'center', weight: '900' });
    g.restore();
    g.fillStyle = 'rgba(120,10,8,0.8)'; for (let i = 0; i < 9; i++) { const x = 40 + R() * 220; g.fillRect(x, 300 + R() * 40, 3, 30 + R() * 80); }
  }),
  // Cuadro eléctrico de la obra
  fuseBox: () => signCanvas(256, 384, (g, w, h) => {
    g.fillStyle = '#8c9296'; g.fillRect(0, 0, w, h); g.fillStyle = '#6c7276'; g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f2c230'; g.fillRect(24, 22, w - 48, 44); txt(g, '分電盤 ⚡', w / 2, 46, 26, '#1a1a1a', { align: 'center' });
    for (let i = 0; i < 4; i++) { g.fillStyle = '#2a2d30'; g.fillRect(40 + i * 46, 100, 34, 90); g.fillStyle = i === 2 ? '#111' : '#d8d8d0'; g.fillRect(46 + i * 46, 112, 22, 30); }
    g.strokeStyle = '#d42a2f'; g.lineWidth = 4; g.strokeRect(126, 96, 42, 98); txt(g, 'FUSE 30A', w / 2, 220, 20, '#fff', { font: EN, align: 'center' });
    fineLines(g, 30, 260, w - 60, 90, 8, 'rgba(255,255,255,0.4)', 4);
  }),
  keypadPanel: () => signCanvas(160, 256, (g, w, h) => {
    g.fillStyle = '#3a4044'; g.fillRect(0, 0, w, h); g.fillStyle = '#0c1a12'; g.fillRect(16, 16, w - 32, 40);
    txt(g, '- - - -', w / 2, 37, 22, '#3a9a60', { font: 'monospace', align: 'center' });
    for (let i = 0; i < 12; i++) { const c = i % 3, r = Math.floor(i / 3); g.fillStyle = '#b8bec2'; g.fillRect(22 + c * 40, 76 + r * 42, 32, 32); txt(g, '123456789*0#'[i], 38 + c * 40, 93 + r * 42, 18, '#222', { font: EN, align: 'center' }); }
  }),
  // ---- calcomanías con alfa (suciedad, pintadas, grietas, cinta) ----
  tally: () => signCanvas(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(57); g.strokeStyle = 'rgba(20,18,16,0.85)'; g.lineCap = 'round';
    // 正 = 5 noches; alguien lleva la cuenta en la pared
    for (let k = 0; k < 9; k++) {
      const x = 30 + (k % 5) * 92 + R() * 8, y = 30 + Math.floor(k / 5) * 110 + R() * 8, s = 70, n = k === 8 ? 3 : 5; g.lineWidth = 5 + R() * 2;
      const st = [[0, 0, s, 0], [s / 2, 0, s / 2, s], [s / 2, s / 2, s * 0.9, s / 2], [s * 0.15, s * 0.35, s * 0.15, s], [-0.05 * s, s, s * 1.05, s]];
      for (let i = 0; i < n; i++) { const q = st[i]; g.beginPath(); g.moveTo(x + q[0] + R() * 3, y + q[1] + R() * 3); g.lineTo(x + q[2] + R() * 3, y + q[3] + R() * 3); g.stroke(); }
    }
  }),
  graffiti: (text = 'でられない', color = 'rgba(150,20,16,0.85)') => signCanvas(1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(text.length * 7);
    g.save(); g.translate(w / 2, h / 2); g.rotate(-0.05); txt(g, text, 0, 0, 150, color, { align: 'center', weight: '900' }); g.restore();
    g.fillStyle = color; for (let i = 0; i < 14; i++) { const x = 100 + R() * 820, y = 150 + R() * 40; g.fillRect(x, y, 3 + R() * 3, 20 + R() * 70); }
  }),
  crack: () => signCanvas(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(77); g.strokeStyle = 'rgba(12,10,8,0.9)'; g.lineCap = 'round';
    const branch = (x, y, a, len, wd) => { if (wd < 0.6 || len < 6) return; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len; g.lineTo(nx, ny); g.stroke();
      branch(nx, ny, a + (R() - 0.5) * 0.9, len * (0.7 + R() * 0.25), wd * 0.82); if (R() < 0.35) branch(nx, ny, a + (R() < 0.5 ? -1 : 1) * (0.6 + R() * 0.6), len * 0.6, wd * 0.6); };
    for (let k = 0; k < 4; k++) branch(256, 256, k * PI / 2 + R(), 40, 4);
  }),
  grime: () => signCanvas(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(91);
    for (let i = 0; i < 40; i++) { const x = 80 + R() * 350, y = 60 + R() * 200; const gr = g.createRadialGradient(x, y, 0, x, y, 30 + R() * 70); gr.addColorStop(0, 'rgba(18,14,8,0.22)'); gr.addColorStop(1, 'rgba(18,14,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < 26; i++) { const x = 80 + R() * 350, y = 180 + R() * 80, l = 60 + R() * 220; const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(20,14,8,0.35)'); gr.addColorStop(1, 'rgba(20,14,8,0)'); g.fillStyle = gr; g.fillRect(x, y, 2 + R() * 5, l); }
  }),
  tape: () => signCanvas(1024, 64, (g, w, h) => {
    g.fillStyle = '#e8c21a'; g.fillRect(0, 0, w, h); g.fillStyle = '#141414';
    for (let x = -64; x < w; x += 64) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 32, 0); g.lineTo(x + 56, 0); g.lineTo(x + 24, h); g.fill(); }
    for (let x = 60; x < w; x += 340) { g.fillStyle = '#e8c21a'; g.fillRect(x - 6, 10, 230, 44); txt(g, '立入禁止 KEEP OUT', x, 33, 26, '#141414'); }
  }),
  hands: () => signCanvas(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(5);
    for (let k = 0; k < 5; k++) {
      const x = 80 + R() * 340, y = 80 + R() * 300, a = (R() - 0.5) * 0.8; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(25,18,14,0.55)';
      g.beginPath(); g.ellipse(0, 20, 26, 32, 0, 0, PI * 2); g.fill();
      for (let f = 0; f < 4; f++) { g.beginPath(); g.ellipse(-21 + f * 14, -26 - (f === 1 || f === 2 ? 8 : 0), 6, 20, 0, 0, PI * 2); g.fill(); }
      g.beginPath(); g.ellipse(30, 6, 6, 16, -0.8, 0, PI * 2); g.fill();
      g.fillRect(-14, 48, 4, 40 + R() * 60); g.restore();
    }
  }),
});
