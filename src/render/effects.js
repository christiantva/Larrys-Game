/* ---------- Materiales globales de efectos ---------- */
const GlowMat = new THREE.ShaderMaterial({
  uniforms: { uScale: { value: 400 }, uFog: { value: 0.04 }, uK: { value: 1 } },
  vertexShader: `attribute vec3 aColor; attribute float aSize; uniform float uScale; uniform float uFog; uniform float uK; varying vec3 vC;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
      float d = -mv.z;
      gl_PointSize = clamp(aSize * uScale / max(d, 0.05), 1.0, 700.0);
      float f = exp(-pow(uFog * d, 2.0));
      vC = aColor * f * smoothstep(0.2, 1.3, d) * uK;
    }`,
  fragmentShader: `varying vec3 vC;
    void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float r2 = dot(p, p); if (r2 > 1.0) discard;
      float a = exp(-r2 * 4.5) - 0.011; gl_FragColor = vec4(vC * max(a, 0.0), 1.0); }`,
  blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
});
GlowMat.userData.shared = true;
let GlintMat = null;
function getGlintMat() {
  if (!GlintMat) { GlintMat = new THREE.MeshBasicMaterial({ map: Tex.streak(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); GlintMat.userData.shared = true; }
  return GlintMat;
}
const TubeMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); TubeMat.userData.shared = true;

