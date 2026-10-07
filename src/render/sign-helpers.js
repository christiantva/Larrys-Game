/* ---------- Carteles (texto japonés real renderizado en canvas) ---------- */
function signCanvas(w, h, draw) { const cv = mkCanvas(w, h); draw(cv.getContext('2d'), w, h); return cv; }
function txt(g, s, x, y, size, color, { font = JP, weight = 'bold', align = 'left', base = 'middle', spacing = 0 } = {}) {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = base;
  if (spacing && 'letterSpacing' in g) g.letterSpacing = spacing + 'px';
  g.fillText(s, x, y);
  if ('letterSpacing' in g) g.letterSpacing = '0px';
}
function arrow(g, cx, cy, s, dir, color) {
  g.save(); g.translate(cx, cy); g.rotate({ left: PI, right: 0, up: -PI / 2, down: PI / 2 }[dir]); g.fillStyle = color;
  g.beginPath(); g.moveTo(s * 0.5, 0); g.lineTo(0, -s * 0.42); g.lineTo(0, -s * 0.16); g.lineTo(-s * 0.5, -s * 0.16);
  g.lineTo(-s * 0.5, s * 0.16); g.lineTo(0, s * 0.16); g.lineTo(0, s * 0.42); g.closePath(); g.fill(); g.restore();
}
// Texto de relleno (líneas que simulan letra pequeña)
function fineLines(g, x, y, w, h, rows, color, seed = 1) {
  const R = mulberry32(seed); g.fillStyle = color;
  for (let r = 0; r < rows; r++) { const lw = w * (0.45 + R() * 0.55); g.fillRect(x, y + r * (h / rows), lw, Math.max(1, h / rows * 0.42)); }
}
function trainIcon(g, x, y, s, fg, bg) {
  g.fillStyle = bg; g.fillRect(x, y, s, s); g.fillStyle = fg;
  g.fillRect(x + s * 0.24, y + s * 0.14, s * 0.52, s * 0.56);
  g.fillStyle = bg; g.fillRect(x + s * 0.3, y + s * 0.22, s * 0.4, s * 0.2);
  g.beginPath(); g.arc(x + s * 0.36, y + s * 0.56, s * 0.05, 0, PI * 2); g.arc(x + s * 0.64, y + s * 0.56, s * 0.05, 0, PI * 2); g.fill();
  g.fillStyle = fg; g.fillRect(x + s * 0.28, y + s * 0.74, s * 0.08, s * 0.12); g.fillRect(x + s * 0.64, y + s * 0.74, s * 0.08, s * 0.12);
}

