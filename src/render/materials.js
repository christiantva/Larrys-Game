/* =====================================================================
   MATERIALES — luz "horneada" en colores de vértice + pocas luces reales
   ===================================================================== */
// Parche de shader: el color de vértice (luz horneada) se suma como emisión
// multiplicada por el albedo. Así hay decenas de fluorescentes "gratis" y las
// 3 luces reales + la linterna siguen iluminando encima.
// BakeK escala toda la luz horneada a la vez (apagones: solo queda la linterna y las luces reales)
const BakeK = { value: 1 };
function bakePatch(shader) {
  shader.uniforms.uBake = BakeK;
  shader.fragmentShader = 'uniform float uBake;\n' + shader.fragmentShader
    .replace('#include <color_fragment>', '')
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
  totalEmissiveRadiance += diffuseColor.rgb * vColor * uBake;
#endif`);
}
const MATS = {};
function bakedMat(key, o = {}) {
  if (MATS[key]) return MATS[key];
  const p = { color: o.color ?? 0xffffff, map: o.map || null, vertexColors: true };
  if (o.bump) { p.bumpMap = o.bump; p.bumpScale = o.bumpScale ?? 1; }
  if (o.transparent) { p.transparent = true; p.opacity = o.opacity ?? 0.5; p.depthWrite = false; p.side = THREE.DoubleSide; }
  if (o.emissive) p.emissive = o.emissive;
  const m = o.std ? new THREE.MeshStandardMaterial({ ...p, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0 }) : new THREE.MeshLambertMaterial(p);
  m.onBeforeCompile = bakePatch;
  m.userData.shared = true; m.userData.key = key;
  return (MATS[key] = m);
}
const paint = (key, color, std = false, rough = 0.6) => ({ mat: () => bakedMat(key, { color, std, rough }), tex: 1 });
// Definición de lotes: material + tamaño de textura en metros
const MDEF = {
  tileW: { mat: () => bakedMat('tileW', { map: Tex.tileWhite(), bump: Tex.tileWhiteBump(), bumpScale: 0.6, std: true, rough: 0.3 }), tex: 1.0 },
  tileB: { mat: () => bakedMat('tileB', { map: Tex.tileBlue(), bump: Tex.tileBlueBump(), bumpScale: 0.6, std: true, rough: 0.28 }), tex: 1.0 },
  brown: { mat: () => bakedMat('brown', { map: Tex.brownTile() }), tex: 1.0 },
  paver: { mat: () => bakedMat('paver', { map: Tex.paver(), std: true, rough: 0.42 }), tex: 1.2 },
  asphalt: { mat: () => bakedMat('asphalt', { map: Tex.asphalt(), std: true, rough: 0.36 }), tex: 3.0 },
  floorTile: { mat: () => bakedMat('floorTile', { map: Tex.floorTile(), std: true, rough: 0.24 }), tex: 1.2 },
  ceilPanel: { mat: () => bakedMat('ceilPanel', { map: Tex.ceilPanel() }), tex: 1.2 },
  ceilRough: { mat: () => bakedMat('ceilRough', { map: Tex.ceilRough() }), tex: 1.0 },
  tread: { mat: () => bakedMat('tread', { map: Tex.tread(), std: true, rough: 0.55 }), tex: 1.0 },
  riser: { mat: () => bakedMat('riser', { map: Tex.riser() }), tex: 1.0 },
  tactDots: { mat: () => bakedMat('tactDots', { map: Tex.tactile('dots'), bump: Tex.tactileBump('dots'), bumpScale: 1.2, std: true, rough: 0.5 }), tex: 0.3 },
  tactBars: { mat: () => bakedMat('tactBars', { map: Tex.tactile('bars'), bump: Tex.tactileBump('bars'), bumpScale: 1.2, std: true, rough: 0.5 }), tex: 0.3 },
  metal: { mat: () => bakedMat('metal', { map: Tex.metal(), std: true, metal: 0.55, rough: 0.3, color: 0xc8ccd0 }), tex: 0.5 },
  steel: { mat: () => bakedMat('steel', { map: Tex.metal(), std: true, metal: 0.2, rough: 0.45, color: 0xdfe1e1 }), tex: 1.0 },
  concrete: { mat: () => bakedMat('concrete', { map: Tex.concrete() }), tex: 2.0 },
  shutter: { mat: () => bakedMat('shutter', { map: Tex.shutter(), std: true, metal: 0.3, rough: 0.5 }), tex: 1.5 },
  grate: { mat: () => bakedMat('grate', { map: Tex.grate(), std: true, metal: 0.5, rough: 0.45 }), tex: 0.5 },
  facade: { mat: () => bakedMat('facade', { map: Tex.facade() }), tex: 6.0, seg: 2.0 },
  stripes: { mat: () => bakedMat('stripes', { map: Tex.stripes() }), tex: 1.0 },
  puddle: { mat: () => bakedMat('puddle', { std: true, rough: 0.05, color: 0x090a0c }), tex: 1.0, seg: 2 },
  roadPaint: { mat: () => bakedMat('roadPaint', { std: true, rough: 0.5, color: 0xc4c4bc }), tex: 1.0, seg: 2 },
  glassDark: { mat: () => bakedMat('glassDark', { std: true, rough: 0.08, color: 0x0b0d11 }), tex: 1.0, seg: 2 },
  umbrella: { mat: () => bakedMat('umbrella', { color: 0xe8eef2, transparent: true, opacity: 0.45 }), tex: 1.0 },
  white: paint('pWhite', 0xe4e4e0), grey: paint('pGrey', 0x8a8f94), dark: paint('pDark', 0x2a2d30),
  red: paint('pRed', 0xa8261f), yellow: paint('pYellow', 0xd4a21c), green: paint('pGreen', 0x1f6b44),
  black: paint('pBlack', 0x0c0d0e), blue: paint('pBlue', 0x2b5d9e), cream: paint('pCream', 0xd8d0bc),
  gloss: paint('pGloss', 0x1a1c1e, true, 0.25),
  housing: { mat: () => bakedMat('housing', { color: 0xdedfe0, emissive: 0x1c2026 }), tex: 1 },
};


