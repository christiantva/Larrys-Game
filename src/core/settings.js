/* =====================================================================
   Ajustes (localStorage) y niveles de calidad
   ===================================================================== */
const SETTINGS_KEY = 'shuden-go-settings-v1';
const S = {
  master: 0.8, ambient: 0.85, musicOn: false, music: 0.5,
  quality: 'medium', brightness: 1.0,
  sensitivity: 1.0, invertY: false, headBob: true,
};
function loadSettings() {
  try { const d = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); for (const k in S) if (k in d && typeof d[k] === typeof S[k]) S[k] = d[k]; } catch (e) { /* sin localStorage */ }
  if (!QUALITY[S.quality]) S.quality = 'medium';
}
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(S)); } catch (e) { /* ignorar */ } }

// Calidad: resolución interna, MSAA, luces reales, post-procesado, distancia de dibujo, audio
const QUALITY = {
  low:    { scale: 0.6,  samples: 0, realLights: 1, ca: false, hrtf: false, far: 45,  fog: 1.2,  irMax: 2.2 },
  medium: { scale: 0.8,  samples: 0, realLights: 2, ca: true,  hrtf: true,  far: 70,  fog: 1.0,  irMax: 3.5 },
  high:   { scale: 1.0,  samples: 4, realLights: 3, ca: true,  hrtf: true,  far: 100, fog: 0.9,  irMax: 5.0 },
};
let Q = QUALITY.medium;

