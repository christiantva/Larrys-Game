/* =====================================================================
   Utilidades
   ===================================================================== */
const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const yawTo = (dx, dz) => Math.atan2(-dx, -dz);
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Color hex (sRGB) -> array lineal
const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const scale3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

