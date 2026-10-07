/* =====================================================================
   OBJETOS — definición, iconos dibujados en canvas y bolsa del jugador
   ===================================================================== */
const ITEMS = {
  coins:   { name: 'Monedas', jp: '小銭', desc: 'Tres monedas de 100 yenes que salieron por la devolución de la máquina expendedora.' },
  ticket:  { name: 'Billete', jp: 'きっぷ', desc: 'Billete sencillo de 210 yenes comprado en la máquina. Impreso: 0:42.' },
  key:     { name: 'Llave de mantenimiento', jp: '鍵', desc: 'Llave con una etiqueta de plástico: «ホーム西 扉» — andén, puerta oeste.' },
  fuse:    { name: 'Fusible', jp: 'ヒューズ', desc: 'Fusible cerámico de 30 A. Sigue intacto.' },
  punch:   { name: 'Tenaza de revisor', jp: '改札鋏', desc: 'Una tenaza de perforar billetes. Está fría, como si nadie la hubiera tocado en años.', use: () => punchTicket() },
  punched: { name: 'Billete perforado', jp: '入鋏済みきっぷ', desc: 'El billete tiene ahora la muesca del revisor. Válido para el último tren.' },
  battery: { name: 'Pilas', jp: '電池', desc: 'Pilas para la linterna. Úsalas desde aquí o pulsando R.', stack: true, use: () => Flashlight.reload() },
};
// Iconos (canvas → dataURL, se generan una sola vez)
const ItemIcon = {
  cache: {},
  get(id) {
    if (this.cache[id]) return this.cache[id];
    const cv = document.createElement('canvas'); cv.width = cv.height = 96; const g = cv.getContext('2d');
    g.lineCap = 'round'; g.lineJoin = 'round';
    const draw = {
      coins() {
        for (const [x, y] of [[36, 58], [58, 44], [44, 34]]) {
          g.fillStyle = '#8a8f93'; g.beginPath(); g.ellipse(x, y + 4, 22, 20, 0, 0, PI * 2); g.fill();
          g.fillStyle = '#c9cfd3'; g.beginPath(); g.ellipse(x, y, 22, 20, 0, 0, PI * 2); g.fill();
          g.strokeStyle = '#9aa0a4'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 16, 14, 0, 0, PI * 2); g.stroke();
        }
        txt(g, '100', 44, 35, 13, '#6c7276', { font: EN, align: 'center' });
      },
      ticket(punched) {
        g.save(); g.translate(48, 48); g.rotate(-0.25);
        g.fillStyle = '#e9d9a8'; g.fillRect(-36, -20, 72, 40); g.fillStyle = '#c58a3a'; g.fillRect(-36, -20, 72, 7);
        txt(g, 'きっぷ', -26, 2, 13, '#3a2a1a'); txt(g, '210', 26, 10, 12, '#3a2a1a', { font: EN, align: 'right' });
        g.fillStyle = '#5a4a3a'; g.fillRect(-26, 12, 30, 2);
        if (punched) { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(18, -20); g.lineTo(28, -20); g.lineTo(23, -11); g.fill(); g.globalCompositeOperation = 'source-over'; }
        g.restore();
      },
      key() {
        g.strokeStyle = '#b8a46a'; g.lineWidth = 7; g.beginPath(); g.arc(30, 40, 13, 0, PI * 2); g.stroke();
        g.fillStyle = '#b8a46a'; g.fillRect(41, 37, 40, 7); g.fillRect(66, 44, 5, 10); g.fillRect(74, 44, 5, 7);
        g.fillStyle = '#d24a3a'; g.fillRect(14, 58, 24, 16); txt(g, '西', 26, 66, 12, '#fff', { align: 'center' });
        g.strokeStyle = '#777'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(26, 52); g.lineTo(26, 58); g.stroke();
      },
      fuse() {
        g.save(); g.translate(48, 48); g.rotate(-0.6);
        g.fillStyle = '#e8e4da'; g.fillRect(-26, -12, 52, 24); g.fillStyle = '#a7a9ab'; g.fillRect(-38, -14, 12, 28); g.fillRect(26, -14, 12, 28);
        txt(g, '30A', 0, 0, 12, '#444', { font: EN, align: 'center' }); g.restore();
      },
      punch() {
        g.strokeStyle = '#8d9296'; g.lineWidth = 8; g.beginPath(); g.moveTo(20, 76); g.lineTo(52, 36); g.moveTo(40, 80); g.lineTo(58, 40); g.stroke();
        g.fillStyle = '#6c7175'; g.beginPath(); g.arc(56, 38, 9, 0, PI * 2); g.fill();
        g.fillStyle = '#9aa0a4'; g.beginPath(); g.moveTo(58, 30); g.lineTo(82, 18); g.lineTo(86, 26); g.lineTo(64, 42); g.fill();
      },
      punched() { draw.ticket(true); },
      battery() {
        for (const x of [30, 58]) {
          g.fillStyle = '#2a2d30'; g.fillRect(x - 11, 26, 22, 50); g.fillStyle = '#c8a03a'; g.fillRect(x - 11, 26, 22, 14);
          g.fillStyle = '#9aa0a4'; g.fillRect(x - 4, 20, 8, 6); txt(g, '+', x, 33, 12, '#2a2d30', { font: EN, align: 'center' });
        }
      },
    };
    (draw[id] || draw.coins)();
    return (this.cache[id] = cv.toDataURL());
  },
};
const Inv = {
  items: [],             // [{ id, n }]
  find(id) { return this.items.find((s) => s.id === id); },
  has(id) { const s = this.find(id); return !!s && s.n > 0; },
  count(id) { const s = this.find(id); return s ? s.n : 0; },
  add(id, n = 1) {
    const s = this.find(id);
    if (s) s.n += n; else this.items.push({ id, n });
    Hud.pickup(id, n); Inventory.render(); Save.write();
  },
  take(id, n = 1) {
    const s = this.find(id); if (!s) return false;
    s.n -= n; if (s.n <= 0) this.items.splice(this.items.indexOf(s), 1);
    Inventory.render(); return true;
  },
  load(list) { this.items = Array.isArray(list) ? list.filter((s) => ITEMS[s.id]).map((s) => ({ id: s.id, n: s.n | 0 || 1 })) : []; },
};
