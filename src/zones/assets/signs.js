/* =====================================================================
   CARTELES (canvas) — texto japonés real
   ===================================================================== */
const Signs = {
  canopy() {
    // Banda luminosa de la marquesina (14,1 m ≈ 4096 px → 290 px/m; x mundo = px/290 - 9.45)
    return signCanvas(4096, 136, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbfbf8'); gr.addColorStop(1, '#e8eae6'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(0,0,0,0.06)'; for (let x = 0; x < w; x += 290) g.fillRect(x, 0, 3, h);
      const x0 = 1560;
      txt(g, '☆', x0 - 6, 50, 44, '#202020'); txt(g, '地下鉄', x0 + 42, 48, 54, '#141414', { weight: '900' }); txt(g, 'Subway', x0 + 48, 106, 28, '#2a2a2a', { font: EN, weight: '600' });
      trainIcon(g, x0 + 236, 22, 80, '#ffffff', '#1b1b1b');
      g.fillStyle = '#1b1b1b'; g.fillRect(x0 + 326, 22, 80, 80); g.fillStyle = '#fff';
      g.fillRect(x0 + 340, 40, 10, 48); g.fillRect(x0 + 382, 40, 10, 48); g.fillRect(x0 + 340, 40, 52, 8); g.fillRect(x0 + 356, 56, 20, 6);
      txt(g, '三条京阪駅', 2330, 54, 76, '#101010', { weight: '900' }); txt(g, 'Sanjo Keihan Sta.', 2336, 112, 32, '#2a2a2a', { font: EN, weight: '600' });
      g.fillStyle = '#d42a2f'; g.beginPath(); g.arc(2800, 68, 50, 0, PI * 2); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(2800, 68, 38, 0, PI * 2); g.fill();
      txt(g, 'T', 2800, 48, 26, '#d42a2f', { font: EN, align: 'center' }); txt(g, '11', 2800, 82, 32, '#d42a2f', { font: EN, align: 'center' });
      g.fillStyle = '#1b1b1b'; g.fillRect(3896, 18, 100, 100); txt(g, '2', 3946, 70, 84, '#fff', { font: EN, align: 'center' });
    });
  },
  subwayGates: () => signCanvas(256, 300, (g, w, h) => {
    g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9d9d4'; g.fillRect(0, h - 6, w, 6);
    trainIcon(g, w / 2 - 34, 22, 68, '#fff', '#222');
    txt(g, '地下鉄', w / 2, 140, 46, '#1a1a1a', { align: 'center' }); txt(g, 'のりば', w / 2, 192, 46, '#1a1a1a', { align: 'center' });
    txt(g, 'Subway Gates', w / 2, 248, 26, '#444', { font: EN, weight: '500', align: 'center' });
  }),
  arrowPanel: (dir = 'left') => signCanvas(256, 300, (g, w, h) => { g.fillStyle = '#16191b'; g.fillRect(0, 0, w, h); arrow(g, w / 2, h / 2, 150, dir, '#f2f2f2'); }),
  notice: (seed = 1, title = 'お知らせ') => signCanvas(256, 360, (g, w, h) => {
    g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8282a'; g.fillRect(0, 0, 18, h);
    txt(g, title, 34, 36, 30, '#222'); g.fillStyle = '#c8282a'; g.fillRect(34, 62, w - 60, 3);
    fineLines(g, 34, 84, w - 60, 250, 18, 'rgba(40,40,40,0.55)', seed);
  }),
  busBoard: () => signCanvas(768, 540, (g, w, h) => {
    g.fillStyle = '#eef0ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#18884a'; g.fillRect(0, 0, w, 70); txt(g, 'バスのりば案内', 24, 37, 38, '#fff'); txt(g, 'City Bus Information', 330, 40, 24, '#e8ffe8', { font: EN, weight: '500' });
    g.fillStyle = '#f3f1d8'; g.fillRect(16, 84, 460, 360);
    g.strokeStyle = '#c9c6aa'; g.lineWidth = 10; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(16, 120 + i * 70); g.lineTo(476, 110 + i * 74); g.stroke(); g.beginPath(); g.moveTo(60 + i * 95, 84); g.lineTo(70 + i * 90, 444); g.stroke(); }
    g.strokeStyle = '#4a8fd0'; g.lineWidth = 14; g.beginPath(); g.moveTo(340, 84); g.bezierCurveTo(300, 250, 380, 300, 330, 444); g.stroke();
    [['#e8463c', 150, 200], ['#e8463c', 260, 300], ['#2a62c8', 210, 150], ['#f0a020', 380, 360]].forEach(([c, x, y]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 13, 0, PI * 2); g.fill(); });
    g.fillStyle = '#f0f0f0'; g.fillRect(490, 84, 262, 360);
    for (let r = 0; r < 9; r++) { g.fillStyle = r % 2 ? '#e2e4dc' : '#f4f4ee'; g.fillRect(490, 84 + r * 40, 262, 40); g.fillStyle = ['#e8463c', '#2a62c8', '#18884a', '#f0a020'][r % 4]; g.fillRect(498, 92 + r * 40, 30, 24); fineLines(g, 540, 96 + r * 40, 200, 20, 2, 'rgba(30,30,30,0.6)', r + 3); }
    g.fillStyle = '#ffffff'; g.fillRect(16, 456, w - 32, 68); g.fillStyle = '#2bb673'; g.fillRect(16, 456, 12, 68);
    txt(g, 'くみこクリニック', 44, 490, 30, '#333'); txt(g, '内科・小児科  ☎ 075-761-0000', 330, 492, 20, '#555');
  }),
  vertical: (s, bg = '#c42a25', fg = '#fff') => signCanvas(96, 64 + s.length * 66, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
    [...s].forEach((ch, i) => txt(g, ch, w / 2, 62 + i * 66, 54, fg, { align: 'center' }));
  }),
  noSmoking: () => signCanvas(200, 240, (g, w, h) => {
    g.fillStyle = '#f5f5f2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3a3a'; g.fillRect(40, 92, 100, 18); g.fillStyle = '#d07a30'; g.fillRect(140, 92, 20, 18);
    g.strokeStyle = '#d02828'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, 100, 72, 0, PI * 2); g.stroke();
    g.beginPath(); g.moveTo(w / 2 - 51, 49); g.lineTo(w / 2 + 51, 151); g.stroke();
    txt(g, '禁煙', w / 2, 208, 40, '#d02828', { align: 'center' });
  }),
  traffic: () => signCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#167444'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2f2f2'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    txt(g, '手前信号', 40, 62, 46, '#fff');
    g.strokeStyle = '#fff'; g.lineWidth = 26; g.beginPath(); g.moveTo(330, 230); g.lineTo(330, 120); g.lineTo(200, 120); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(150, 120); g.lineTo(205, 82); g.lineTo(205, 158); g.closePath(); g.fill();
    txt(g, '左折', 360, 132, 64, '#fff'); txt(g, '1200m', 380, 210, 34, '#fff', { font: EN });
    txt(g, 'Left Turn', 40, 210, 26, '#e0ffe8', { font: EN, weight: '500' });
  }),
  busStop: () => signCanvas(256, 256, (g, w, h) => {
    g.fillStyle = '#0000'; g.clearRect(0, 0, w, h);
    g.fillStyle = '#f2f2ee'; g.beginPath(); g.arc(128, 128, 124, 0, PI * 2); g.fill();
    g.strokeStyle = '#1f8a4c'; g.lineWidth = 16; g.beginPath(); g.arc(128, 128, 110, 0, PI * 2); g.stroke();
    txt(g, '市バス', 128, 80, 34, '#1f8a4c', { align: 'center' }); txt(g, '三条京阪前', 128, 132, 36, '#222', { align: 'center' });
    txt(g, 'Sanjo Keihan-mae', 128, 178, 18, '#444', { font: EN, weight: '500', align: 'center' });
  }),
  roadClosed: () => signCanvas(256, 300, (g, w, h) => {
    g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d02828'; g.lineWidth = 14; g.beginPath(); g.arc(128, 116, 92, 0, PI * 2); g.stroke();
    txt(g, '通行止', 128, 118, 50, '#1a3e9a', { align: 'center' }); txt(g, '工事中', 128, 250, 44, '#222', { align: 'center' });
  }),
  staffOnly: () => signCanvas(512, 128, (g, w, h) => {
    g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); txt(g, '関係者以外立入禁止', w / 2, 52, 44, '#c02020', { align: 'center' });
    txt(g, 'STAFF ONLY', w / 2, 104, 26, '#333', { font: EN, align: 'center' });
  }),
  manhole: () => signCanvas(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#4a4e52'; g.beginPath(); g.arc(128, 128, 126, 0, PI * 2); g.fill();
    g.fillStyle = '#6a8fae'; g.beginPath(); g.arc(128, 128, 104, 0, PI * 2); g.fill();
    g.strokeStyle = '#2f4f6a'; g.lineWidth = 5; for (let r = 30; r < 104; r += 18) { g.beginPath(); g.arc(128, 128, r, 0, PI * 2); g.stroke(); }
    g.fillStyle = '#5e9a5a'; g.beginPath(); g.ellipse(128, 128, 40, 30, 0, 0, PI * 2); g.fill();
    g.fillStyle = '#d8c070'; [[-46, -22], [46, -22], [-40, 28], [40, 28]].forEach(([x, y]) => { g.beginPath(); g.ellipse(128 + x, 128 + y, 14, 8, 0, 0, PI * 2); g.fill(); });
    g.beginPath(); g.ellipse(128, 82, 12, 14, 0, 0, PI * 2); g.fill();
    txt(g, '京都市', 128, 214, 22, '#e8e8e0', { align: 'center' });
  }),
  vending: () => signCanvas(256, 512, (g, w, h) => {
    g.fillStyle = '#eef3f6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f5fb4'; g.fillRect(8, 8, w - 16, 38); txt(g, 'COLD DRINKS', w / 2, 28, 22, '#fff', { font: EN, align: 'center' });
    const cols = ['#d62a2a', '#2a7ad6', '#f2f2f2', '#2fa84a', '#e8b020', '#4a2a1a', '#f08a1a', '#8ad0f0'];
    const R = mulberry32(5);
    for (let row = 0; row < 3; row++) {
      const y0 = 56 + row * 96;
      g.fillStyle = '#fbfdff'; g.fillRect(8, y0, w - 16, 90);
      for (let i = 0; i < 7; i++) {
        const x = 14 + i * 33, c = cols[Math.floor(R() * cols.length)];
        g.fillStyle = c; g.fillRect(x, y0 + 8, 24, 50); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x + 3, y0 + 10, 4, 46);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y0 + 30, 24, 6);
        txt(g, '¥' + [100, 130, 160][Math.floor(R() * 3)], x + 12, y0 + 68, 11, '#222', { font: EN, align: 'center' });
        g.fillStyle = R() < 0.2 ? '#e22' : '#3b3'; g.fillRect(x + 4, y0 + 78, 16, 7);
      }
      g.fillStyle = row === 2 ? '#d23a2a' : '#1f5fb4'; g.fillRect(8, y0 + 88, w - 16, 4);
    }
    g.fillStyle = '#b8c0c6'; g.fillRect(0, 352, w, 160);
    g.fillStyle = '#20262a'; g.fillRect(160, 368, 72, 30); txt(g, '- - -', 196, 384, 18, '#ff4a3a', { font: 'monospace', align: 'center' });
    g.fillStyle = '#333'; g.fillRect(186, 412, 20, 40); g.fillStyle = '#111'; g.fillRect(24, 440, 120, 50);
    txt(g, '飲料', 60, 384, 26, '#334', { align: 'center' });
  }),
  // ---- zona 2 ----
  rushPoster: () => signCanvas(300, 420, (g, w, h) => {
    g.fillStyle = '#ffd94a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a4a9a'; g.fillRect(20, 120, 120, 200); g.fillRect(160, 120, 120, 200);
    g.fillStyle = '#9fd0f0'; g.fillRect(36, 140, 88, 80); g.fillRect(176, 140, 88, 80);
    g.fillStyle = '#e02a2a'; g.fillRect(140, 100, 20, 240);
    txt(g, '駆け込み乗車は', w / 2, 40, 32, '#1a1a1a', { align: 'center' }); txt(g, '危険です', w / 2, 82, 40, '#d01818', { align: 'center' });
    txt(g, 'Please do not rush', w / 2, 362, 20, '#1a1a1a', { font: EN, align: 'center' }); txt(g, 'onto the train.', w / 2, 390, 20, '#1a1a1a', { font: EN, align: 'center' });
  }),
  lastTrain: () => signCanvas(300, 420, (g, w, h) => {
    g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#20407a'; g.fillRect(0, 0, w, 76);
    txt(g, '終電のご案内', w / 2, 32, 34, '#fff', { align: 'center' }); txt(g, 'Last Train', w / 2, 62, 18, '#cfe0ff', { font: EN, align: 'center' });
    [['六地蔵 行', '23:52'], ['太秦天神川 行', '0:04'], ['御陵 行', '0:21'], ['京都市役所前 行', '0:27']].forEach(([a, b], i) => {
      const y = 112 + i * 64; g.fillStyle = i % 2 ? '#eceeea' : '#f8f8f4'; g.fillRect(14, y - 26, w - 28, 54);
      txt(g, a, 26, y, 22, '#222'); txt(g, b, w - 26, y, 28, '#c01818', { font: EN, align: 'right' });
    });
    fineLines(g, 20, 372, w - 40, 36, 3, 'rgba(40,40,40,0.5)', 9);
  }),
  manners: () => signCanvas(300, 420, (g, w, h) => {
    g.fillStyle = '#e8f2f8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4ab0d8'; g.beginPath(); g.arc(w / 2, 180, 100, 0, PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, 180, 70, 0, PI * 2); g.fill();
    g.fillStyle = '#4ab0d8'; g.beginPath(); g.arc(w / 2 - 24, 166, 9, 0, PI * 2); g.arc(w / 2 + 24, 166, 9, 0, PI * 2); g.fill();
    g.strokeStyle = '#4ab0d8'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, 186, 32, 0.2, PI - 0.2); g.stroke();
    txt(g, 'マナーを守って', w / 2, 330, 30, '#204060', { align: 'center' }); txt(g, '快適な駅に', w / 2, 372, 30, '#204060', { align: 'center' });
    txt(g, 'みんなの駅', w / 2, 40, 26, '#4a7a9a', { align: 'center' });
  }),
  exitSign: () => signCanvas(256, 128, (g, w, h) => {
    g.fillStyle = '#12a35a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4fff8'; g.fillRect(14, 14, 90, 100);
    g.fillStyle = '#12a35a'; g.fillRect(24, 22, 70, 84);
    g.fillStyle = '#f4fff8'; g.beginPath(); g.arc(150, 34, 10, 0, PI * 2); g.fill();
    g.strokeStyle = '#f4fff8'; g.lineWidth = 11; g.lineCap = 'round';
    g.beginPath(); g.moveTo(146, 50); g.lineTo(132, 78); g.lineTo(150, 96); g.lineTo(138, 116); g.moveTo(132, 78); g.lineTo(112, 94); g.moveTo(144, 56); g.lineTo(166, 66); g.lineTo(178, 58); g.moveTo(142, 58); g.lineTo(124, 66); g.stroke();
    txt(g, '非常口', 228, 44, 28, '#f4fff8', { align: 'center' }); txt(g, 'EXIT', 228, 88, 26, '#f4fff8', { font: EN, align: 'center' });
  }),
  gates: () => signCanvas(512, 128, (g, w, h) => {
    g.fillStyle = '#1d2a44'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.fillRect(0, h - 8, w, 8);
    txt(g, '改札口', 30, 52, 48, '#fff'); txt(g, 'Ticket Gates', 34, 100, 26, '#d8e2f4', { font: EN, weight: '500' });
    arrow(g, w - 80, 62, 92, 'right', '#fff');
  }),
  extinguisher: () => signCanvas(128, 192, (g, w, h) => {
    g.fillStyle = '#c42620'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f4f0'; g.fillRect(14, 16, w - 28, 66);
    txt(g, '消火器', w / 2, 50, 30, '#c42620', { align: 'center' }); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(14, 100, w - 28, 76);
  }),
  shutterNotice: () => signCanvas(256, 200, (g, w, h) => {
    g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#20407a'; g.fillRect(0, 0, w, 10);
    txt(g, 'この出入口は', w / 2, 46, 26, '#222', { align: 'center' }); txt(g, '終電後 閉鎖します', w / 2, 86, 26, '#c01818', { align: 'center' });
    txt(g, 'This exit is closed', w / 2, 130, 17, '#333', { font: EN, align: 'center' }); txt(g, 'after the last train.', w / 2, 154, 17, '#333', { font: EN, align: 'center' });
  }),
  caution: () => signCanvas(200, 260, (g, w, h) => {
    g.fillStyle = '#f2c51c'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
    g.beginPath(); g.moveTo(w / 2, 40); g.lineTo(w / 2 + 52, 132); g.lineTo(w / 2 - 52, 132); g.closePath(); g.fill();
    txt(g, '!', w / 2, 100, 56, '#f2c51c', { font: EN, align: 'center' });
    txt(g, '足元注意', w / 2, 180, 36, '#1a1a1a', { align: 'center' }); txt(g, 'Watch your step', w / 2, 222, 18, '#1a1a1a', { font: EN, align: 'center' });
  }),
  stain: () => signCanvas(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); const R = mulberry32(3);
    for (let i = 0; i < 22; i++) { const x = 128 + (R() - 0.5) * 120, y = 128 + (R() - 0.5) * 120, r = 20 + R() * 60;
      const gr = g.createRadialGradient(x, y, r * 0.5, x, y, r); gr.addColorStop(0, 'rgba(70,58,40,0.18)'); gr.addColorStop(0.85, 'rgba(60,46,30,0.35)'); gr.addColorStop(1, 'rgba(60,46,30,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill(); }
  }),
  binLabel: (t) => signCanvas(128, 64, (g, w, h) => { g.fillStyle = '#2a6ac0'; g.fillRect(0, 0, w, h); txt(g, t, w / 2, h / 2, t.length > 3 ? 18 : 26, '#fff', { align: 'center' }); }),
};

