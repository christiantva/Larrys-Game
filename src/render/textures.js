/* =====================================================================
   TEXTURAS PROCEDURALES (canvas) — cero assets externos
   ===================================================================== */
const JP = '"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic","YuGothic","Meiryo","Noto Sans JP","Noto Sans CJK JP","Source Han Sans JP","IPAGothic","IPAPGothic","MS PGothic",sans-serif';
const EN = '"Helvetica Neue",Arial,"Segoe UI",sans-serif';
let MAX_ANISO = 4;
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
// Lienzos en CPU (willReadFrequently): leemos sus píxeles, así se evita esperar a la GPU
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); return c; }

// Ruido de valor periódico (para que las texturas se repitan sin costuras)
function hash2(x, y, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, px, py, s) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const x0 = ((xi % px) + px) % px, y0 = ((yi % py) + py) % py, x1 = (x0 + 1) % px, y1 = (y0 + 1) % py;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0, s), b = hash2(x1, y0, s), c = hash2(x0, y1, s), d = hash2(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// fbm: x,y en [0,px) x [0,py)
function fbm(x, y, px, py, oct, s) {
  let sum = 0, amp = 0.5, norm = 0;
  for (let o = 0; o < oct; o++) { sum += vnoise(x, y, px, py, s + o * 17) * amp; norm += amp; x *= 2; y *= 2; px *= 2; py *= 2; amp *= 0.5; }
  return sum / norm;
}
// Rellena un canvas píxel a píxel
function pixels(w, h, fn) {
  const cv = mkCanvas(w, h), g = cv.getContext('2d');
  const im = g.createImageData(w, h), d = im.data, o = [0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    fn(x, y, o); const i = (y * w + x) * 4;
    d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return cv;
}
// Suciedad multiplicativa
function grime(cv, amount, seed, sc = 3) {
  if (amount <= 0) return cv;
  const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbm(x / w * sc, y / h * sc, sc, sc, 4, seed);
    const k = 1 - amount * Math.max(0, n - 0.38) * 1.8 - (hash2(x, y, seed) - 0.5) * 0.035;
    const i = (y * w + x) * 4; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
  }
  g.putImageData(im, 0, 0); return cv;
}
function toTex(cv, { srgb = true, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = MAX_ANISO;
  return t;
}

// Caché de texturas compartidas entre zonas (no se liberan al cambiar de zona)
const TEX = {};
const TEXT = {};
const tex = (key, make) => { if (TEX[key]) return TEX[key]; const t0 = performance.now(); TEX[key] = make(); if (DEBUG) TEXT[key] = Math.round(performance.now() - t0); return TEX[key]; };

// Mosaico de azulejos (paredes)
function tileCanvas({ size = 512, n = 10, grout = 0.07, base, vary = 8, groutCol, accentP = 0, accents = [], dirt = 0.25, seed = 1 }) {
  const R = mulberry32(seed);
  const cv = mkCanvas(size, size), g = cv.getContext('2d');
  g.fillStyle = rgb(groutCol); g.fillRect(0, 0, size, size);
  const ts = size / n, gw = Math.max(1.5, ts * grout), bev = Math.max(1, ts * 0.06);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    let c = base; if (R() < accentP) c = accents[Math.floor(R() * accents.length)];
    const v = (R() - 0.5) * vary, x = i * ts + gw / 2, y = j * ts + gw / 2, w = ts - gw;
    g.fillStyle = rgb([c[0] + v, c[1] + v, c[2] + v]); g.fillRect(x, y, w, w);
    g.fillStyle = 'rgba(255,255,255,0.13)'; g.fillRect(x, y, w, bev);
    g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(x, y + w - bev, w, bev);
  }
  return grime(cv, dirt, seed + 3);
}
function tileBump(n, grout, size = 256) {
  const cv = mkCanvas(size, size), g = cv.getContext('2d');
  g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, size, size);
  const ts = size / n, gw = Math.max(1.2, ts * grout);
  g.fillStyle = '#e8e8e8';
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g.fillRect(i * ts + gw / 2, j * ts + gw / 2, ts - gw, ts - gw);
  return cv;
}
// Baldosas de piedra moteada (granito / terrazo)
function stoneCanvas({ size = 512, nx = 4, ny = 4, base = [140, 140, 138], vary = 8, speck = 0.1, groutCol = [70, 70, 70], grout = 2, seed = 3, cloud = 0.3, alt = null }) {
  const tw = size / nx, th = size / ny;
  return pixels(size, size, (x, y, o) => {
    const i = Math.floor(x / tw), j = Math.floor(y / th);
    if (x % tw < grout || y % th < grout) { o[0] = groutCol[0]; o[1] = groutCol[1]; o[2] = groutCol[2]; return; }
    const c = (alt && alt(i, j)) || base;
    const tv = (hash2(i, j, seed) - 0.5) * vary;
    const n = (fbm(x / size * 4, y / size * 4, 4, 4, 3, seed) - 0.5) * cloud * 60;
    const h = hash2(x, y, seed + 7);
    const sp = h < speck ? -45 * (1 - h / speck) : h > 1 - speck * 0.4 ? 28 : 0;
    const v = tv + n + sp;
    o[0] = c[0] + v; o[1] = c[1] + v; o[2] = c[2] + v;
  });
}

const Tex = {
  tileWhite: () => tex('tileWhite', () => toTex(tileCanvas({ n: 10, base: [228, 230, 226], groutCol: [150, 152, 148], accentP: 0.035,
    accents: [[176, 160, 128], [150, 132, 104], [196, 186, 160]], dirt: 0.22, seed: 11 }))),
  tileWhiteBump: () => tex('tileWhiteBump', () => toTex(tileBump(10, 0.07), { srgb: false })),
  tileBlue: () => tex('tileBlue', () => toTex(tileCanvas({ n: 12, base: [218, 224, 228], groutCol: [128, 136, 142], vary: 10, dirt: 0.2, seed: 21 }))),
  tileBlueBump: () => tex('tileBlueBump', () => toTex(tileBump(12, 0.08), { srgb: false })),
  paver: () => tex('paver', () => toTex(stoneCanvas({ nx: 4, ny: 4, base: [120, 121, 122], vary: 14, speck: 0.12, groutCol: [58, 58, 60], grout: 3, seed: 5 }))),
  floorTile: () => tex('floorTile', () => toTex(stoneCanvas({ nx: 4, ny: 4, base: [168, 168, 166], vary: 8, speck: 0.08, groutCol: [96, 96, 94], grout: 2, seed: 9, cloud: 0.2 }))),
  asphalt: () => tex('asphalt', () => toTex(pixels(512, 512, (x, y, o) => {
    const n = fbm(x / 512 * 6, y / 512 * 6, 6, 6, 4, 11), h = hash2(x, y, 5);
    let v = 30 + n * 22; if (h > 0.985) v += 34 * (h - 0.985) / 0.015; else if (h < 0.025) v -= 10;
    v *= 0.78 + 0.34 * fbm(x / 512 * 2, y / 512 * 2, 2, 2, 3, 21);
    o[0] = v; o[1] = v; o[2] = v * 1.05;
  }))),
  concrete: () => tex('concrete', () => {
    const cv = pixels(512, 512, (x, y, o) => {
      const n = fbm(x / 512 * 4, y / 512 * 4, 4, 4, 5, 31), f = hash2(x, y, 9);
      const v = 116 + (n - 0.5) * 70 + (f - 0.5) * 14; o[0] = v * 1.02; o[1] = v; o[2] = v * 0.94;
    });
    const g = cv.getContext('2d'), R = mulberry32(77);
    for (let k = 0; k < 16; k++) {
      const x = R() * 512, w = 3 + R() * 10, y = R() * 200, l = 120 + R() * 320;
      const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(30,26,20,0.16)'); gr.addColorStop(1, 'rgba(30,26,20,0)');
      g.fillStyle = gr; g.fillRect(x, y, w, l);
    }
    g.fillStyle = 'rgba(30,30,30,0.5)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(64 + i * 128, 64 + j * 128, 4, 0, PI * 2); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, 512, 2); g.fillRect(0, 0, 2, 512);
    return toTex(cv);
  }),
  ceilRough: () => tex('ceilRough', () => toTex(pixels(512, 512, (x, y, o) => {
    const n = fbm(x / 512 * 48, y / 512 * 48, 48, 48, 2, 41), m = fbm(x / 512 * 6, y / 512 * 6, 6, 6, 2, 43), h = hash2(x, y, 12);
    const v = 156 + (n - 0.5) * 70 + (m - 0.5) * 24 + (h - 0.5) * 64; o[0] = v * 0.95; o[1] = v * 0.98; o[2] = v;
  }))),
  ceilPanel: () => tex('ceilPanel', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 212 + (hash2(x, y, 3) - 0.5) * 8; o[0] = v; o[1] = v; o[2] = v * 0.985; });
    const g = cv.getContext('2d');
    g.fillStyle = 'rgba(70,70,70,0.55)';
    for (let i = 0; i < 4; i++) { g.fillRect(i * 128, 0, 2, 512); g.fillRect(0, i * 128, 512, 2); }
    g.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 9; k++) for (let l = 0; l < 9; l++)
      g.fillRect(i * 128 + 14 + k * 12, j * 128 + 14 + l * 12, 1.5, 1.5);
    return toTex(grime(cv, 0.15, 4));
  }),
  tread: () => tex('tread', () => {
    const W = 512, H = 256, s = 0.84 * H;
    const cv = pixels(W, H, (x, y, o) => {
      if (y > s) { const gv = ((y - s) % 9) < 2 ? 22 : 40; const v = gv + (hash2(x, y, 4) - 0.5) * 6; o[0] = v; o[1] = v; o[2] = v + 2; return; }
      const h = hash2(x, y, 8); const n = fbm(x / W * 4, y / H * 2, 4, 2, 3, 6);
      const v = 128 + (n - 0.5) * 30 + (h < 0.09 ? -40 : h > 0.97 ? 26 : 0); o[0] = v; o[1] = v + 1; o[2] = v + 3;
    });
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, s - 2, W, 2);
    return toTex(grime(cv, 0.25, 15));
  }),
  riser: () => tex('riser', () => toTex(grime(pixels(256, 256, (x, y, o) => {
    const v = 150 + (fbm(x / 256 * 4, y / 256 * 4, 4, 4, 3, 8) - 0.5) * 26 + (hash2(x, y, 2) - 0.5) * 10; o[0] = v; o[1] = v; o[2] = v + 3;
  }), 0.3, 18))),
  brownTile: () => tex('brownTile', () => {
    const tw = 64, th = 512 / 12;
    return toTex(pixels(512, 512, (x, y, o) => {
      const i = Math.floor(x / tw), j = Math.floor(y / th);
      if (x % tw < 2 || (y % th) < 2) { o[0] = 52; o[1] = 46; o[2] = 40; return; }
      const h = hash2(i, j, 13), dark = hash2(i, j, 19) < 0.12;
      const c = dark ? [70, 52, 38] : [lerp(92, 140, h), lerp(66, 104, h), lerp(46, 76, h)];
      const n = (fbm(x / 512 * 8, y / 512 * 8, 8, 8, 2, 3) - 0.5) * 16 + (hash2(x, y, 1) - 0.5) * 8;
      const gl = (y % th) < 5 ? 10 : 0;
      o[0] = c[0] + n + gl; o[1] = c[1] + n + gl; o[2] = c[2] + n + gl;
    }));
  }),
  metal: () => tex('metal', () => toTex(pixels(256, 256, (x, y, o) => {
    const n = fbm(x / 256 * 2, y / 256 * 64, 2, 64, 3, 51), f = hash2(x, y, 3);
    const v = 150 + (n - 0.5) * 50 + (f - 0.5) * 12; o[0] = v; o[1] = v + 2; o[2] = v + 5;
  }))),
  shutter: () => tex('shutter', () => {
    const cv = pixels(256, 512, (x, y, o) => {
      const t = (y % 21) / 21; const v = t < 0.15 ? 165 : t < 0.8 ? lerp(142, 104, (t - 0.15) / 0.65) : 62;
      const n = (fbm(x / 256 * 2, y / 512 * 32, 2, 32, 2, 7) - 0.5) * 18; o[0] = v + n; o[1] = v + n + 2; o[2] = v + n + 5;
    });
    return toTex(grime(cv, 0.4, 61, 2));
  }),
  tactile: (kind) => tex('tact_' + kind, () => toTex(grime(tactileCanvas(kind, false), 0.3, 71))),
  tactileBump: (kind) => tex('tactB_' + kind, () => toTex(tactileCanvas(kind, true), { srgb: false })),
  grate: () => tex('grate', () => {
    const cv = mkCanvas(256, 256), g = cv.getContext('2d');
    g.fillStyle = '#5a5c5e'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#0c0c0c'; for (let i = 0; i < 16; i++) g.fillRect(i * 16 + 4, 0, 8, 256);
    g.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 16; i++) g.fillRect(i * 16 + 2, 0, 2, 256);
    return toTex(grime(cv, 0.4, 3));
  }),
  facade: () => tex('facade', () => {
    const cv = pixels(512, 512, (x, y, o) => { const v = 40 + (fbm(x / 512 * 4, y / 512 * 4, 4, 4, 3, 91) - 0.5) * 20; o[0] = v; o[1] = v; o[2] = v + 2; });
    const g = cv.getContext('2d');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const x = i * 128 + 22, y = j * 170 + 34, w = 84, h = 100;
      g.fillStyle = '#16181b'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#0b0d10'); gr.addColorStop(0.6, '#14181d'); gr.addColorStop(1, '#090a0c');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = '#202327'; g.fillRect(x + w / 2 - 1, y, 2, h);
      g.fillStyle = '#2a2c2f'; g.fillRect(x - 6, y + h + 3, w + 12, 5);
    }
    return toTex(grime(cv, 0.3, 92));
  }),
  stripes: () => tex('stripes', () => {
    const cv = mkCanvas(256, 64), g = cv.getContext('2d');
    g.fillStyle = '#d8b21c'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#151515';
    for (let i = -2; i < 10; i++) { g.beginPath(); g.moveTo(i * 32, 64); g.lineTo(i * 32 + 16, 64); g.lineTo(i * 32 + 48, 0); g.lineTo(i * 32 + 32, 0); g.fill(); }
    return toTex(grime(cv, 0.35, 5, 2));
  }),
  streak: () => tex('streak', () => {
    const cv = mkCanvas(64, 256), g = cv.getContext('2d');
    g.save(); g.translate(32, 128); g.scale(1, 4);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 31);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(-32, -32, 64, 64); g.restore();
    return toTex(cv, { srgb: false, repeat: false });
  }),
};

function tactileCanvas(kind, bump) {
  const size = 256, cv = mkCanvas(size, size), g = cv.getContext('2d');
  g.fillStyle = bump ? '#141414' : '#cf9c12'; g.fillRect(0, 0, size, size);
  if (!bump) { g.strokeStyle = 'rgba(60,40,0,0.6)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, size - 3, size - 3); }
  if (kind === 'dots') {
    const n = 5, sp = size / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const cx = (i + 0.5) * sp, cy = (j + 0.5) * sp, r = sp * 0.33;
      const gr = g.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 0, cx, cy, r);
      if (bump) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#a0a0a0'); gr.addColorStop(1, '#141414'); }
      else { gr.addColorStop(0, '#ffe066'); gr.addColorStop(0.55, '#e0aa18'); gr.addColorStop(1, '#8a6406'); }
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, PI * 2); g.fill();
    }
  } else {
    const n = 4, sp = size / n;
    for (let i = 0; i < n; i++) {
      const cx = (i + 0.5) * sp, w = sp * 0.36;
      const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      if (bump) { gr.addColorStop(0, '#303030'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#303030'); }
      else { gr.addColorStop(0, '#9a7008'); gr.addColorStop(0.4, '#ffd94e'); gr.addColorStop(1, '#a87a0a'); }
      g.fillStyle = gr;
      g.beginPath(); g.roundRect ? g.roundRect(cx - w / 2, size * 0.06, w, size * 0.88, w / 2) : g.rect(cx - w / 2, size * 0.06, w, size * 0.88); g.fill();
    }
  }
  return cv;
}

