/* =====================================================================
   PARTÍCULAS — polvo que solo se ve dentro del haz de la linterna, y
   destellos sutiles sobre los objetos que se pueden recoger o leer
   ===================================================================== */
const Particles = {
  dust: null, spark: null,
  init() {
    // Polvo: 500 puntos en un cubo de 7 m que "envuelve" a la cámara (todo en la GPU)
    const N = 700, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = Math.random() * 7; pos[i * 3 + 1] = Math.random() * 7; pos[i * 3 + 2] = Math.random() * 7; seed[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uCam: { value: new THREE.Vector3() }, uFP: { value: new THREE.Vector3() }, uFD: { value: new THREE.Vector3() }, uLv: { value: 0 }, uT: { value: 0 }, uScale: GlowMat.uniforms.uScale },
      vertexShader: `attribute float aSeed; uniform vec3 uCam, uFP, uFD; uniform float uLv, uT, uScale; varying float vA;
        void main() {
          vec3 drift = vec3(sin(uT * 0.13 + aSeed * 40.0), -0.35 - aSeed * 0.3, cos(uT * 0.11 + aSeed * 23.0)) * uT * 0.06;
          vec3 p = mod(position + drift - uCam + 3.5, 7.0) + uCam - 3.5;
          vec3 d = p - uFP; float dist = length(d); float c = dot(d / max(dist, 1e-3), uFD);
          vA = uLv * smoothstep(0.9, 0.97, c) * smoothstep(7.0, 1.0, dist) * smoothstep(0.25, 0.8, dist) * (0.5 + 0.5 * sin(uT * 2.0 + aSeed * 50.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(0.016 * uScale / max(-mv.z, 0.1), 1.0, 6.0);
        }`,
      fragmentShader: `varying float vA; void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float r = dot(q, q); if (r > 1.0 || vA < 0.003) discard; gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * vA * 0.55 * (1.0 - r), 1.0); }`,
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    m.userData.shared = true;
    this.dust = new THREE.Points(g, m); this.dust.frustumCulled = false; this.dust.renderOrder = 6; World.scene.add(this.dust);
    // Destellos: hasta 24 puntos, se rellenan al activar cada zona
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24 * 3), 3)); sg.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(24), 1));
    const sm = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uScale: GlowMat.uniforms.uScale },
      vertexShader: `attribute float aSeed; uniform float uT, uScale; varying float vA;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float d = -mv.z;
          float tw = pow(0.5 + 0.5 * sin(uT * 2.3 + aSeed * 6.28), 6.0);
          vA = tw * smoothstep(9.0, 2.0, d) * 0.9; gl_PointSize = clamp(0.09 * uScale / max(d, 0.3), 2.0, 40.0); }`,
      fragmentShader: `varying float vA; void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float r = dot(q, q); float a = exp(-r * 9.0) + max(0.0, 1.0 - abs(q.x) * 14.0) * max(0.0, 1.0 - abs(q.y)) * 0.5 + max(0.0, 1.0 - abs(q.y) * 14.0) * max(0.0, 1.0 - abs(q.x)) * 0.5;
        gl_FragColor = vec4(vec3(0.9, 0.95, 1.0) * a * vA, 1.0); }`,
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    sm.userData.shared = true;
    this.spark = new THREE.Points(sg, sm); this.spark.frustumCulled = false; this.spark.renderOrder = 7; World.scene.add(this.spark);
  },
  update(cam, t) {
    if (!this.dust) return;
    const u = this.dust.material.uniforms; u.uCam.value.copy(cam.position); u.uFP.value.copy(World.flash.position); u.uFD.value.copy(Flashlight.dir);
    u.uLv.value = Flashlight.level * (World.flash.intensity / CONFIG.FLASH_INTENSITY); u.uT.value = t;
    this.spark.material.uniforms.uT.value = t;
    Sparkles.refresh();
  },
};
// Lista de destellos de la zona actual (se ocultan cuando el objeto ya se cogió)
const Sparkles = {
  zone: null, key: '',
  setZone(z) { this.zone = z; this.key = ''; this.refresh(); },
  refresh() {
    const z = this.zone; if (!z || !Particles.spark) return;
    const live = z.sparkles.filter((s) => condOk(s.cond)), key = live.length + ':' + z.id + ':' + live.map((s) => s.cond.flag).join();
    if (key === this.key) return; this.key = key;
    const g = Particles.spark.geometry, P = g.attributes.position, A = g.attributes.aSeed, n = Math.min(24, live.length);
    for (let i = 0; i < n; i++) { P.setXYZ(i, live[i].p[0], live[i].p[1] + 0.05, live[i].p[2]); A.setX(i, (i * 0.37) % 1); }
    P.needsUpdate = true; A.needsUpdate = true; g.setDrawRange(0, n);
  },
};
