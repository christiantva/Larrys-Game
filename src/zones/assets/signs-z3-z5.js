/* ---------- Carteles de las zonas 3–5 ---------- */
function jrLogo(g, x, y, s) { g.fillStyle = '#1aa04a'; g.fillRect(x, y, s * 1.3, s); txt(g, 'JR', x + s * 0.65, y + s * 0.52, s * 0.72, '#fff', { font: EN, align: 'center', weight: '900' }); }
function ticketIcon(g, x, y, s, c) { g.fillStyle = c; g.fillRect(x, y + s * 0.2, s, s * 0.6); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x + s * 0.15, y + s * 0.35, s * 0.5, s * 0.08); g.fillRect(x + s * 0.15, y + s * 0.52, s * 0.35, s * 0.08); }
Object.assign(Signs, {
  // Cartel colgante bilingüe (inspirado en la imagen de referencia del vestíbulo)
  hallSign: () => signCanvas(2048, 176, (g, w, h) => {
    g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#20252a'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
    arrow(g, 54, 88, 70, 'left', '#1a1a1a');
    g.fillStyle = '#e4002b'; g.beginPath(); g.arc(130, 70, 22, 0, PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(130, 70, 10, 0, PI * 2); g.fill();
    txt(g, '丸ノ内線', 160, 70, 40, '#1a1a1a'); txt(g, 'きっぷうりば', 112, 120, 40, '#1a1a1a'); txt(g, 'Marunouchi Line Tickets', 112, 154, 18, '#444', { font: EN, weight: '500' });
    g.fillStyle = '#f2c230'; g.fillRect(420, 6, 460, h - 12);
    arrow(g, 470, 88, 74, 'up', '#1a1a1a');
    txt(g, '東口方面', 530, 46, 34, '#1a1a1a'); txt(g, '西武東口方面', 530, 92, 34, '#1a1a1a'); txt(g, '西武口方面', 530, 138, 34, '#1a1a1a');
    txt(g, 'For East Exit', 760, 46, 18, '#333', { font: EN }); txt(g, 'Seibu East Exit', 760, 92, 18, '#333', { font: EN }); txt(g, 'Seibu Exit', 760, 138, 18, '#333', { font: EN });
    g.fillStyle = '#20252a'; g.fillRect(880, 6, 4, h - 12);
    g.fillStyle = '#1a1a1a'; g.fillRect(912, 26, 52, 52); trainIcon(g, 912, 26, 52, '#fff', '#1a1a1a');
    txt(g, '西武池袋線', 980, 52, 40, '#1a1a1a'); txt(g, 'Seibu Ikebukuro Line', 1220, 56, 20, '#444', { font: EN, weight: '500' });
    g.strokeStyle = '#c1a470'; g.lineWidth = 9; g.beginPath(); g.arc(938, 126, 22, 0, PI * 2); g.stroke();
    txt(g, '有楽町線', 980, 126, 40, '#1a1a1a'); txt(g, 'Yurakucho Line', 1170, 130, 20, '#444', { font: EN, weight: '500' });
    g.fillStyle = '#20252a'; g.fillRect(1440, 6, 4, h - 12);
    txt(g, 'きっぷうりば', 1470, 64, 42, '#1a1a1a'); txt(g, 'Tickets', 1470, 116, 24, '#444', { font: EN, weight: '600' });
    ticketIcon(g, 1730, 40, 64, '#1a1a1a');
    jrLogo(g, 1812, 44, 56); txt(g, 'JR東日本', 1812, 128, 30, '#1a1a1a');
    arrow(g, 1990, 88, 70, 'right', '#1a1a1a');
  }),
  platformYellow: () => signCanvas(1024, 160, (g, w, h) => {
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
    arrow(g, 70, h / 2, 90, 'down', '#1a1a1a'); txt(g, 'のりば', 140, 62, 54, '#1a1a1a'); txt(g, 'Platforms', 142, 122, 30, '#1a1a1a', { font: EN, weight: '600' });
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(560, 80, 46, 0, PI * 2); g.fill(); txt(g, '1', 560, 82, 60, '#f2c230', { font: EN, align: 'center', weight: '900' });
    g.beginPath(); g.arc(680, 80, 46, 0, PI * 2); g.fill(); txt(g, '2', 680, 82, 60, '#f2c230', { font: EN, align: 'center', weight: '900' });
    txt(g, '六地蔵・太秦天神川 方面', 760, 80, 26, '#1a1a1a');
  }),
  exit2: () => signCanvas(1024, 160, (g, w, h) => {
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); arrow(g, 70, h / 2, 90, 'left', '#1a1a1a');
    txt(g, '出口', 140, 62, 54, '#1a1a1a'); txt(g, 'Exit', 142, 122, 30, '#1a1a1a', { font: EN, weight: '600' });
    g.fillStyle = '#1a1a1a'; g.fillRect(330, 30, 100, 100); txt(g, '2', 380, 82, 80, '#f2c230', { font: EN, align: 'center', weight: '900' });
    txt(g, '三条京阪・川端通', 460, 62, 40, '#1a1a1a'); txt(g, 'Sanjo Keihan / Kawabata-dori', 462, 116, 24, '#222', { font: EN, weight: '500' });
  }),
  ledBoard: () => signCanvas(1024, 136, (g, w, h) => {
    g.fillStyle = '#060504'; g.fillRect(0, 0, w, h);
    txt(g, '本日の運転は終了しました', w / 2, 44, 46, '#ff8a1a', { align: 'center' });
    txt(g, 'Service has ended for today.', w / 2, 100, 36, '#ff8a1a', { font: 'monospace', align: 'center' });
    g.fillStyle = 'rgba(6,5,4,0.75)'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1.5, h); for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1.5);
  }),
  ticketMachine: () => signCanvas(256, 420, (g, w, h) => {
    g.fillStyle = '#cfd5d9'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#0d2c58'; g.fillRect(20, 24, w - 40, 190);
    const gr = g.createLinearGradient(0, 30, 0, 210); gr.addColorStop(0, '#2a6fc9'); gr.addColorStop(1, '#174a8c'); g.fillStyle = gr; g.fillRect(26, 30, w - 52, 178);
    txt(g, 'きっぷ', 64, 62, 22, '#fff', { align: 'center' }); txt(g, 'ICチャージ', 172, 62, 20, '#fff', { align: 'center' });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { g.fillStyle = '#e8f0ff'; g.fillRect(36 + i * 64, 88 + j * 28, 56, 22); txt(g, String(170 + (i + j * 3) * 30), 64 + i * 64, 100 + j * 28, 14, '#123', { font: EN, align: 'center' }); }
    g.fillStyle = '#20262a'; g.fillRect(40, 240, 60, 10); g.fillRect(140, 236, 80, 18); g.fillRect(60, 300, 140, 16);
    txt(g, '硬貨', 70, 266, 14, '#333', { align: 'center' }); txt(g, '紙幣', 180, 266, 14, '#333', { align: 'center' }); txt(g, 'きっぷ・おつり', 130, 334, 14, '#333', { align: 'center' });
    g.fillStyle = '#e04020'; g.beginPath(); g.arc(w - 30, 380, 8, 0, PI * 2); g.fill();
  }),
  fareMap: () => signCanvas(1024, 160, (g, w, h) => {
    g.fillStyle = '#fafaf6'; g.fillRect(0, 0, w, h); const R = mulberry32(9);
    const lines = [['#e4002b', 40], ['#1aa04a', 70], ['#c1a470', 98], ['#2a62c8', 126]];
    for (const [c, y] of lines) { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.moveTo(10, y); for (let x = 60; x < w; x += 60) g.lineTo(x, y + (R() - 0.5) * 30); g.stroke(); }
    for (let i = 0; i < 60; i++) { const x = 20 + R() * (w - 40), y = 24 + R() * 110; g.fillStyle = '#fff'; g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 5, 0, PI * 2); g.fill(); g.stroke(); txt(g, String(140 + Math.floor(R() * 12) * 30), x + 8, y - 8, 11, '#333', { font: EN, weight: '500' }); }
    g.fillStyle = '#d42a2f'; g.fillRect(w / 2 - 6, h / 2 - 6, 12, 12); txt(g, '現在地', w / 2 + 12, h / 2, 16, '#d42a2f');
  }),
  kippu: () => signCanvas(1024, 96, (g, w, h) => {
    g.fillStyle = '#20252a'; g.fillRect(0, 0, w, h); ticketIcon(g, 24, 16, 64, '#f4f4ef');
    txt(g, 'きっぷうりば', 110, 48, 50, '#fff'); txt(g, 'Tickets  /  ICカードチャージ  IC Card Charge', 450, 50, 28, '#d9e2ea', { font: JP, weight: '500' });
  }),
  gateEnd: () => signCanvas(128, 128, (g, w, h) => {
    g.fillStyle = '#16191b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1aa04a'; g.beginPath(); g.moveTo(26, 40); g.lineTo(78, 40); g.lineTo(78, 24); g.lineTo(108, 52); g.lineTo(78, 80); g.lineTo(78, 64); g.lineTo(26, 64); g.closePath(); g.fill();
    g.fillStyle = '#2a7ad6'; g.fillRect(30, 92, 68, 26); txt(g, 'IC', 64, 106, 20, '#fff', { font: EN, align: 'center', weight: '900' });
  }),
  gateStop: () => signCanvas(128, 128, (g, w, h) => {
    g.fillStyle = '#16191b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e02a2a'; g.lineWidth = 14; g.beginPath(); g.moveTo(34, 24); g.lineTo(94, 84); g.moveTo(94, 24); g.lineTo(34, 84); g.stroke();
    g.fillStyle = '#2a7ad6'; g.fillRect(30, 92, 68, 26); txt(g, 'IC', 64, 106, 20, '#fff', { font: EN, align: 'center', weight: '900' });
  }),
  office: () => signCanvas(512, 96, (g, w, h) => { g.fillStyle = '#20252a'; g.fillRect(0, 0, w, h); txt(g, '駅事務室', 24, 48, 44, '#fff'); txt(g, 'Station Office', 250, 52, 26, '#cdd6de', { font: EN }); }),
  clock: () => signCanvas(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#f4f4f0'; g.beginPath(); g.arc(128, 128, 120, 0, PI * 2); g.fill();
    g.strokeStyle = '#222'; g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; g.lineWidth = i % 3 ? 4 : 8; g.beginPath(); g.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); g.lineTo(128 + Math.sin(a) * 110, 128 - Math.cos(a) * 110); g.stroke(); }
    const hand = (a, l, wd) => { g.lineWidth = wd; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l); g.stroke(); };
    hand((0 + 42 / 60) / 12 * PI * 2, 58, 9); hand(42 / 60 * PI * 2, 88, 6); g.strokeStyle = '#c02020'; hand(17 / 60 * PI * 2, 96, 2);
  }),
  mall: () => signCanvas(1024, 160, (g, w, h) => {
    g.fillStyle = '#1d2a44'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ab8e0'; g.fillRect(0, h - 8, w, 8);
    txt(g, '地下街', 40, 62, 56, '#fff'); txt(g, 'Underground Mall', 44, 124, 28, '#d8e2f4', { font: EN, weight: '500' });
    txt(g, '三条名店街', 400, 64, 40, '#fff'); txt(g, '(営業時間外)', 400, 118, 28, '#9fb0c8');
    arrow(g, w - 80, h / 2, 96, 'down', '#fff');
  }),
  ads: () => signCanvas(1024, 512, (g, w, h) => {
    // atlas 4 pósters (256x512 cada uno)
    let x = 0;
    g.fillStyle = '#f6f6f2'; g.fillRect(x, 0, 256, 512); g.fillStyle = '#1f5fb4'; g.fillRect(x, 0, 256, 120);
    txt(g, 'TOEIC', x + 128, 50, 50, '#fff', { font: EN, align: 'center', weight: '900' }); txt(g, 'TOEFL', x + 128, 98, 34, '#e0ecff', { font: EN, align: 'center', weight: '700' });
    txt(g, 'ビジネス英語', x + 128, 170, 30, '#1a1a1a', { align: 'center' }); txt(g, '英会話スクール', x + 128, 214, 26, '#1a1a1a', { align: 'center' });
    g.fillStyle = '#e8463c'; g.fillRect(x + 30, 260, 196, 80); txt(g, '無料体験', x + 128, 300, 34, '#fff', { align: 'center' });
    txt(g, '日米英語学院', x + 128, 420, 26, '#1f5fb4', { align: 'center' }); txt(g, '池袋駅 徒歩3分', x + 128, 460, 18, '#444', { align: 'center' });
    x = 256; const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#1a2440'); gr.addColorStop(1, '#c86a4a'); g.fillStyle = gr; g.fillRect(x, 0, 256, 512);
    g.fillStyle = '#100c10'; g.beginPath(); g.moveTo(x + 40, 400); g.lineTo(x + 128, 300); g.lineTo(x + 216, 400); g.fill(); g.fillRect(x + 70, 400, 116, 60); g.fillRect(x + 60, 330, 136, 10);
    g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(x + 190, 110, 26, 0, PI * 2); g.fill();
    txt(g, '冬の京都', x + 128, 190, 44, '#fff', { align: 'center' }); txt(g, 'そうだ 京都、行こう。', x + 128, 240, 20, '#f4e8d8', { align: 'center' });
    x = 512; g.fillStyle = '#0c0c0e'; g.fillRect(x, 0, 256, 512); g.fillStyle = '#d0d4d8';
    for (let i = 0; i < 6; i++) g.fillRect(x + 20 + i * 38, 300 - i * 18, 20, 120 + i * 18);
    txt(g, '終着駅', x + 128, 110, 54, '#e8e2d0', { align: 'center' }); txt(g, 'TERMINAL', x + 128, 160, 24, '#9a9488', { font: EN, align: 'center', weight: '600' });
    txt(g, '近日公開', x + 128, 470, 24, '#e8e2d0', { align: 'center' });
    x = 768; g.fillStyle = '#e8f4ea'; g.fillRect(x, 0, 256, 512); g.fillStyle = '#2a9a5a'; g.fillRect(x, 400, 256, 112);
    g.fillStyle = '#2a9a5a'; g.beginPath(); g.arc(x + 128, 190, 90, 0, PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = `bold 120px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', x + 128, 192);
    txt(g, 'お忘れ物に', x + 128, 330, 30, '#1a3a2a', { align: 'center' }); txt(g, 'ご注意ください', x + 128, 368, 26, '#1a3a2a', { align: 'center' });
    txt(g, 'Lost & Found', x + 128, 456, 28, '#fff', { font: EN, align: 'center', weight: '700' });
  }),
  fareAdjust: () => signCanvas(512, 96, (g, w, h) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); txt(g, 'のりこし精算機', 20, 48, 40, '#1a1a1a'); txt(g, 'Fare Adjustment', 316, 52, 24, '#1a1a1a', { font: EN, weight: '600' }); }),
  // ---- zona 4 ----
  platformName: () => signCanvas(1024, 192, (g, w, h) => {
    g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#1aa04a'; g.fillRect(0, h - 22, w, 22);
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(90, 86, 58, 0, PI * 2); g.fill(); txt(g, '1', 90, 90, 80, '#fff', { font: EN, align: 'center', weight: '900' });
    txt(g, '番線', 170, 86, 46, '#1a1a1a'); txt(g, '六地蔵 方面', 340, 66, 54, '#1a1a1a'); txt(g, 'for Rokujizo', 344, 132, 30, '#444', { font: EN, weight: '500' });
    txt(g, 'さんじょうけいはん', 760, 60, 24, '#555'); txt(g, '三条京阪', 760, 110, 50, '#1a1a1a');
  }),
  stairUp: () => signCanvas(1024, 160, (g, w, h) => {
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); arrow(g, 70, h / 2, 90, 'up', '#1a1a1a');
    txt(g, '改札', 140, 62, 54, '#1a1a1a'); txt(g, 'Ticket Gates', 142, 122, 28, '#1a1a1a', { font: EN, weight: '600' });
    arrow(g, 520, h / 2, 90, 'up', '#1a1a1a'); txt(g, '出口', 590, 62, 54, '#1a1a1a'); txt(g, 'Exit', 592, 122, 28, '#1a1a1a', { font: EN, weight: '600' });
    txt(g, '1 – 4', 820, 82, 54, '#1a1a1a', { font: EN, weight: '900' });
  }),
  doorNums: () => signCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#1b1f22'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { const cx = (i % 4) * 128 + 64, cy = Math.floor(i / 4) * 128 + 64; txt(g, `${Math.floor(i / 2) + 1}-${(i % 2) + 1}`, cx, cy, 50, '#f2f2f2', { font: EN, align: 'center', weight: '700' }); }
  }),
  boardMark: () => signCanvas(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(240,240,236,0.92)';
    for (const x of [40, 216]) { g.beginPath(); g.moveTo(x - 22, 230); g.lineTo(x - 22, 90); g.lineTo(x - 40, 90); g.lineTo(x, 30); g.lineTo(x + 40, 90); g.lineTo(x + 22, 90); g.lineTo(x + 22, 230); g.fill(); }
    g.fillStyle = 'rgba(42,150,90,0.92)'; g.fillRect(84, 120, 88, 110); txt(g, '乗車', 128, 160, 30, '#fff', { align: 'center' }); txt(g, '位置', 128, 200, 30, '#fff', { align: 'center' });
  }),
  maintenance: () => signCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#f2c51c'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a';
    for (let i = -2; i < 12; i++) { g.beginPath(); g.moveTo(i * 48, 40); g.lineTo(i * 48 + 24, 40); g.lineTo(i * 48 + 48, 0); g.lineTo(i * 48 + 24, 0); g.fill(); }
    txt(g, '危険', w / 2, 92, 54, '#c01818', { align: 'center' }); txt(g, '関係者以外立入禁止', w / 2, 158, 40, '#1a1a1a', { align: 'center' });
    txt(g, 'DANGER  STAFF ONLY', w / 2, 214, 28, '#1a1a1a', { font: EN, align: 'center', weight: '700' });
  }),
  // ---- zona 5 ----
  safety: () => signCanvas(256, 300, (g, w, h) => {
    g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f9a4a'; g.fillRect(98, 30, 60, 160); g.fillRect(48, 80, 160, 60);
    txt(g, '安全第一', w / 2, 248, 50, '#1f6a3a', { align: 'center' });
  }),
  helmet: () => signCanvas(256, 300, (g, w, h) => {
    g.fillStyle = '#1f5fb4'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 70, PI, 0); g.fill(); g.fillRect(48, 124, 160, 16);
    txt(g, 'ヘルメット', w / 2, 210, 36, '#fff', { align: 'center' }); txt(g, '着用', w / 2, 262, 40, '#fff', { align: 'center' });
  }),
  construction: () => signCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d02828'; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20);
    txt(g, '工事中', w / 2, 92, 80, '#d02828', { align: 'center' }); txt(g, 'この先 立入禁止', w / 2, 180, 42, '#1a1a1a', { align: 'center' });
    txt(g, 'UNDER CONSTRUCTION', w / 2, 226, 22, '#333', { font: EN, align: 'center', weight: '700' });
  }),
  service: () => signCanvas(512, 128, (g, w, h) => { g.fillStyle = '#1b5e3a'; g.fillRect(0, 0, w, h); txt(g, '連絡通路', 24, 52, 50, '#fff'); txt(g, 'Service Passage', 260, 56, 26, '#d8f0e0', { font: EN }); arrow(g, w - 40, 98, 34, 'right', '#fff'); }),
  voltage: () => signCanvas(256, 256, (g, w, h) => {
    g.fillStyle = '#f2c51c'; g.beginPath(); g.moveTo(128, 14); g.lineTo(244, 214); g.lineTo(12, 214); g.closePath(); g.fill();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#1a1a1a';
    g.beginPath(); g.moveTo(140, 70); g.lineTo(100, 140); g.lineTo(132, 140); g.lineTo(112, 196); g.lineTo(160, 120); g.lineTo(128, 120); g.closePath(); g.fill();
    txt(g, '高圧注意', 128, 240, 30, '#1a1a1a', { align: 'center' });
  }),
});

