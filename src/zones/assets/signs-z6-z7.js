/* ---------- Carteles de las zonas 6–7 ---------- */
const SHOPS = [
  ['高品漬物店', 'TEL 2935', '#f2efe2', '#1a1a1a', '#b02020'], ['喫茶 ルナ', 'COFFEE', '#f4e4ea', '#8a2a4a', '#4a2a1a'],
  ['理容 ミヤコ', 'BARBER', '#e8eef4', '#1a3a7a', '#c02020'], ['古書 一文堂', '古本 買入', '#efe4cc', '#3a2a14', '#6a4a20'],
  ['クリーニング', '白鳥', '#e4f0f4', '#1a5a7a', '#1a5a7a'], ['たばこ・塩', '', '#c42a25', '#ffffff', '#ffe0a0'],
  ['時計・メガネ', '正確堂', '#f0f0e6', '#1a1a1a', '#2a5a2a'], ['和菓子 松屋', '', '#2a4a2a', '#f4e8c8', '#f4e8c8'],
  ['鮮魚 魚よし', '', '#e8f2f8', '#103a6a', '#c02020'], ['靴修理', '合鍵', '#f2f2ea', '#4a2a10', '#c06010'],
  ['質 大黒屋', '', '#1a1a1a', '#f0d070', '#f0d070'], ['手芸 ひまわり', '毛糸', '#f8ecc0', '#a05a10', '#a05a10'],
  ['中華そば 昇龍', 'ラーメン', '#c41e1e', '#fff4c8', '#fff4c8'], ['写真 フジ', 'DPE', '#f0f4f0', '#1a6a3a', '#c02020'],
  ['化粧品 ハナ', '', '#f8e8f0', '#8a2060', '#8a2060'], ['貸店舗', '入居者募集', '#f4f4f0', '#3a3a3a', '#c02020'],
];
Object.assign(Signs, {
  shops: () => signCanvas(1024, 1024, (g, w, h) => {
    SHOPS.forEach(([a, b, bg, fg, ac], i) => {
      const x = (i % 2) * 512, y = Math.floor(i / 2) * 128;
      g.fillStyle = bg; g.fillRect(x + 4, y + 6, 504, 116); g.strokeStyle = ac; g.lineWidth = 5; g.strokeRect(x + 10, y + 12, 492, 104);
      txt(g, a, x + (b ? 30 : 256), y + 66, a.length > 6 ? 46 : 56, fg, { align: b ? 'left' : 'center', weight: '900' });
      if (b) txt(g, b, x + 488, y + 70, 30, ac, { align: 'right', font: /[A-Z]/.test(b) ? EN : JP });
      g.fillStyle = 'rgba(40,30,10,0.25)'; g.fillRect(x + 4, y + 96, 504, 26);
    });
    grime(g.canvas, 0.35, 77, 4);
  }),
  closing: () => signCanvas(256, 340, (g, w, h) => {
    g.fillStyle = '#f2eee0'; g.fillRect(0, 0, w, h); txt(g, '閉店のお知らせ', w / 2, 38, 30, '#1a1a1a', { align: 'center' });
    g.fillStyle = '#1a1a1a'; g.fillRect(24, 64, w - 48, 2);
    txt(g, '長い間ご愛顧いただき', w / 2, 98, 18, '#222', { align: 'center' }); txt(g, '誠にありがとうございました', w / 2, 126, 18, '#222', { align: 'center' });
    fineLines(g, 30, 160, w - 60, 110, 7, 'rgba(30,30,30,0.5)', 5); txt(g, '店主', w - 40, 300, 18, '#222', { align: 'right' });
    grime(g.canvas, 0.3, 6, 2);
  }),
  phone: () => signCanvas(256, 96, (g, w, h) => { g.fillStyle = '#2f8a52'; g.fillRect(0, 0, w, h); txt(g, '公衆電話', w / 2, 50, 46, '#fff', { align: 'center' }); }),
  buttonBox: () => signCanvas(128, 192, (g, w, h) => {
    g.fillStyle = '#8a8e90'; g.fillRect(0, 0, w, h); g.fillStyle = '#20262a'; g.fillRect(14, 14, w - 28, 40); txt(g, 'シャッター', w / 2, 34, 20, '#fff', { align: 'center' });
    g.fillStyle = '#2aa04a'; g.beginPath(); g.arc(40, 100, 20, 0, PI * 2); g.fill(); g.fillStyle = '#c42020'; g.beginPath(); g.arc(88, 100, 20, 0, PI * 2); g.fill();
    txt(g, '開', 40, 146, 26, '#111', { align: 'center' }); txt(g, '閉', 88, 146, 26, '#111', { align: 'center' });
  }),
  banner: () => signCanvas(320, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d5a52'); gr.addColorStop(1, '#0e2e3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8e4d0'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, 470 + k * 30); for (let x = 0; x <= w; x += 20) g.lineTo(x, 470 + k * 30 + Math.sin(x / 30 + k) * 12); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.globalAlpha = 0.25 + k * 0.15; g.fill(); }
    g.globalAlpha = 1; g.fillStyle = '#1a2a2a'; g.beginPath(); g.moveTo(70, 460); g.lineTo(250, 460); g.lineTo(220, 500); g.lineTo(100, 500); g.fill(); g.fillRect(156, 330, 8, 130);
    g.fillStyle = '#e8e0c8'; g.beginPath(); g.moveTo(164, 340); g.lineTo(240, 440); g.lineTo(164, 440); g.fill();
    ['北', '前', '船'].forEach((c, i) => txt(g, c, w / 2, 80 + i * 78, 70, '#f4efe0', { align: 'center', weight: '900' }));
    txt(g, '寄港地 展', w / 2, 304, 26, '#f4efe0', { align: 'center' });
  }),
  expo: () => signCanvas(1024, 512, (g, w, h) => {
    const cells = [
      (x) => { g.fillStyle = '#d8c8a4'; g.fillRect(x, 0, 256, 512); g.fillStyle = '#5a4a32'; g.fillRect(x + 30, 80, 196, 150); g.fillStyle = '#2a2014'; g.fillRect(x + 60, 150, 140, 60); txt(g, '鉄道の歴史展', x + 128, 290, 30, '#3a2a14', { align: 'center' }); fineLines(g, x + 30, 330, 196, 140, 8, 'rgba(60,40,20,0.5)', 3); },
      (x) => { g.fillStyle = '#f2f2ec'; g.fillRect(x, 0, 256, 512); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(x + 80, 230, 34, 0, PI * 2); g.arc(x + 170, 230, 34, 0, PI * 2); g.fill(); g.fillRect(x + 40, 140, 170, 70); g.fillRect(x + 180, 100, 30, 50); txt(g, '蒸気機関車', x + 128, 330, 30, '#1a1a1a', { align: 'center' }); fineLines(g, x + 30, 370, 196, 110, 6, 'rgba(30,30,30,0.5)', 4); },
      (x) => { g.fillStyle = '#e8f0e4'; g.fillRect(x, 0, 256, 512); g.strokeStyle = '#2a62c8'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 30, 400); g.bezierCurveTo(x + 90, 200, x + 160, 300, x + 230, 80); g.stroke(); g.strokeStyle = '#e4002b'; g.beginPath(); g.moveTo(x + 20, 200); g.lineTo(x + 236, 260); g.stroke(); txt(g, '路線の変遷', x + 128, 460, 30, '#1a3a1a', { align: 'center' }); },
      (x) => { g.fillStyle = '#1f3e7a'; g.fillRect(x, 0, 256, 512); g.strokeStyle = 'rgba(220,235,255,0.8)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.strokeRect(x + 30 + i * 6, 60 + i * 30, 196 - i * 12, 120); } txt(g, '駅舎 設計図', x + 128, 420, 30, '#e0ecff', { align: 'center' }); },
    ];
    cells.forEach((f, i) => f(i * 256));
  }),
});

