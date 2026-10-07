/* =====================================================================
   POST-PROCESADO — resplandor (bloom) a 1/4 de resolución + pase final:
   aberración, tono, adaptación del ojo, viñeta, grano, efectos de tensión
   ===================================================================== */
// Cara subliminal (aparece 2-3 fotogramas cuando la tensión es extrema)
function faceCanvas() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
  // rostro pálido y alargado, sin rasgos definidos: cuencas hundidas y boca entreabierta, todo difuminado
  g.filter = 'blur(3px)';
  const sk = g.createRadialGradient(128, 112, 8, 128, 128, 112); sk.addColorStop(0, 'rgba(196,190,180,0.95)'); sk.addColorStop(0.55, 'rgba(120,114,108,0.8)'); sk.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sk; g.beginPath(); g.ellipse(128, 126, 70, 108, 0, 0, PI * 2); g.fill();
  const hole = (x, y, rx, ry, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.6, `rgba(10,8,8,${a * 0.8})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, PI * 2); g.fill(); };
  hole(100, 104, 24, 20, 1); hole(156, 106, 24, 20, 1); hole(128, 140, 8, 14, 0.5); hole(128, 194, 15, 26, 0.95);
  g.filter = 'none'; const R = mulberry32(3), im = g.getImageData(0, 0, 256, 256), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 40; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(im, 0, 0);
  return cv;
}
const BLUR_FS = `uniform sampler2D tIn; uniform vec2 uDir; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tIn, vUv).rgb * 0.227;
    c += (texture2D(tIn, vUv + uDir * 1.385).rgb + texture2D(tIn, vUv - uDir * 1.385).rgb) * 0.316;
    c += (texture2D(tIn, vUv + uDir * 3.231).rgb + texture2D(tIn, vUv - uDir * 3.231).rgb) * 0.070;
    gl_FragColor = vec4(c, 1.0); }`;
const Post = {
  rt: null, scene: new THREE.Scene(), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat: null, w: 1, h: 1,
  b1: null, b2: null, brightMat: null, blurMat: null, quad: null, adapt: 1,
  init() {
    const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    this.brightMat = new THREE.ShaderMaterial({ uniforms: { tIn: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 0.55 } }, vertexShader: vs, depthTest: false, depthWrite: false,
      fragmentShader: `uniform sampler2D tIn; uniform vec2 uTexel; uniform float uThr; varying vec2 vUv;
        void main(){ vec3 c = (texture2D(tIn, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tIn, vUv + uTexel * vec2(1.0, -1.0)).rgb
          + texture2D(tIn, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tIn, vUv + uTexel * vec2(1.0, 1.0)).rgb) * 0.25;
          float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * max(l - uThr, 0.0) / max(l, 1e-4), 1.0); }` });
    this.blurMat = new THREE.ShaderMaterial({ uniforms: { tIn: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: vs, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false });
    const face = new THREE.CanvasTexture(faceCanvas());
    this.mat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uGrain: { value: CONFIG.GRAIN },
        uVig: { value: CONFIG.VIGNETTE }, uCA: { value: CONFIG.CHROMATIC }, uExp: { value: CONFIG.EXPOSURE }, uFade: { value: 1 },
        uTen: { value: 0 }, uHit: { value: 0 }, uPulse: { value: 0 }, tBloom: { value: null }, uBloom: { value: 0 },
        tFace: { value: face }, uFace: { value: 0 }, uGlitch: { value: 0 }, uBlink: { value: 0 }, uHaze: { value: 0 }, uHazeC: { value: new THREE.Vector2(0.5, 0.5) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime, uGrain, uVig, uCA, uExp, uFade, uTen, uHit, uPulse, uBloom, uFace, uGlitch, uBlink, uHaze; uniform vec2 uHazeC; uniform sampler2D tBloom, tFace; varying vec2 vUv;
        vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
        float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
        void main(){
          vec2 uv = vUv;
          // tensión alta: la imagen "respira" y se deforma un poco
          if (uTen > 0.55) { float w = (uTen - 0.55) / 0.45; uv += vec2(sin(uv.y * 17.0 + uTime * 1.7), cos(uv.x * 13.0 + uTime * 1.3)) * 0.0028 * w * w; }
          // fallo de imagen: bandas horizontales desplazadas
          if (uGlitch > 0.0) { float band = floor(uv.y * 24.0 + floor(uTime * 30.0) * 7.0); float h = hash(vec2(band, floor(uTime * 30.0)));
            if (h > 0.6) uv.x += (h - 0.8) * 0.12 * uGlitch; }
          vec2 d = uv - 0.5; float r2 = dot(d, d); vec3 c;
          float ca = uCA + uTen * uTen * 0.007 + uHit * 0.008;
          if (ca > 0.0) { vec2 o = d * ca * (0.6 + r2 * 5.0);
            c = vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b); }
          else c = texture2D(tDiffuse, uv).rgb;
          c += texture2D(tBloom, uv).rgb * uBloom;                // resplandor de las luces
          // la linterna ilumina el aire (polvo, humedad): neblina suave alrededor del haz
          if (uHaze > 0.0) { vec2 hd = (uv - uHazeC) * vec2(uRes.x / uRes.y, 1.0);
            float sw = 0.8 + 0.2 * sin(uv.x * 9.0 + uTime * 0.6) * sin(uv.y * 7.0 - uTime * 0.45);
            c += vec3(1.0, 0.92, 0.78) * uHaze * (exp(-dot(hd, hd) * 7.0) * 0.8 + exp(-dot(hd, hd) * 1.6) * 0.25) * sw; }
          c = aces(c * uExp);
          c = pow(c, vec3(1.0 / 2.2));
          // gradación: sombras ligeramente frías, contraste suave de cámara vieja
          c = mix(c, c * vec3(0.94, 1.0, 1.06), 0.5 * (1.0 - c));
          // desaturación con la tensión
          float lu = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(c, vec3(lu) * vec3(0.98, 1.0, 1.03), uTen * 0.6);
          float rr = length(d * vec2(uRes.x / uRes.y, 1.0)) * 0.95;
          float v = smoothstep(0.95 - uTen * 0.3 - uPulse * 0.08, 0.25 - uTen * 0.12, rr);
          c *= mix(1.0, v, min(1.0, uVig + uTen * 0.4));
          // cara subliminal
          if (uFace > 0.0) { vec2 fu = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.15 + 0.5; vec4 f = texture2D(tFace, fu);
            c = mix(c, f.rgb * vec3(0.9, 0.9, 0.92), f.a * uFace * 0.75); }
          // destello rojo en los sustos
          c = mix(c, c * vec3(1.3, 0.45, 0.4) + vec3(0.05, 0.0, 0.0), uHit * 0.55);
          float g = hash(vUv * uRes + fract(uTime * 7.31) * 517.0) - 0.5;
          c += g * uGrain * (1.0 + uTen * 1.6) * (0.55 + 0.45 * (1.0 - dot(c, vec3(0.33))));
          c *= (1.0 - uFade) * (1.0 - uBlink);
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat); q.frustumCulled = false; this.scene.add(q); this.quad = q;
  },
  resize() {
    const sc = Q.scale * DynRes.scale;
    const w = Math.max(2, Math.floor(innerWidth * sc)), h = Math.max(2, Math.floor(innerHeight * sc));
    if (this.rt) this.rt.dispose();
    const ext = World.renderer.extensions, canFloat = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float');
    this.rt = new THREE.WebGLRenderTarget(w, h, { type: canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: Q.samples, depthBuffer: true, stencilBuffer: false });
    this.mat.uniforms.tDiffuse.value = this.rt.texture; this.mat.uniforms.uRes.value.set(w, h); this.w = w; this.h = h;
    // resplandor: dos objetivos a 1/4 de resolución
    if (this.b1) { this.b1.dispose(); this.b2.dispose(); }
    const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2), bo = { type: this.rt.texture.type, depthBuffer: false, stencilBuffer: false };
    this.b1 = new THREE.WebGLRenderTarget(bw, bh, bo); this.b2 = new THREE.WebGLRenderTarget(bw, bh, bo);
    this.brightMat.uniforms.uTexel.value.set(1 / w, 1 / h); this.bw = bw; this.bh = bh;
    this.mat.uniforms.tBloom.value = this.b1.texture;
    GlowMat.uniforms.uScale.value = h / (2 * Math.tan(THREE.MathUtils.degToRad(World.camera.fov) / 2));
  },
  render(t, fade) {
    const u = this.mat.uniforms; u.uTime.value = t; u.uFade.value = fade; u.uExp.value = CONFIG.EXPOSURE * S.brightness; u.uCA.value = Q.ca ? CONFIG.CHROMATIC : 0;
    u.uTen.value = Sanity.vis; u.uHit.value = Sanity.hit; u.uPulse.value = Sanity.pulse;
    u.uFace.value = Sanity.face; u.uGlitch.value = Sanity.glitch; u.uBlink.value = Sanity.blink;
    // adaptación del ojo: a oscuras la vista se acostumbra poco a poco (y se deslumbra rápido)
    const lum = Sanity.light + Flashlight.level * 0.12, target = Game.state === 'playing' ? clamp(Math.sqrt(0.14 / Math.max(lum, 0.01)), 0.85, 1.65) : 1;
    const dt = Math.min(0.1, Math.max(0, t - (this.lastT ?? t))); this.lastT = t;
    this.adapt += (target - this.adapt) * (1 - Math.exp(-dt / (target > this.adapt ? 3.5 : 0.5)));
    u.uExp.value *= this.adapt;
    // neblina de la linterna: centro = hacia dónde apunta en pantalla
    if (Q.cone && Flashlight.level > 0.02) {
      _v.copy(World.flash.position).addScaledVector(Flashlight.dir, 4).project(World.camera);
      u.uHazeC.value.set(_v.x * 0.5 + 0.5, _v.y * 0.5 + 0.5);
      u.uHaze.value = 0.05 * (World.flash.intensity / CONFIG.FLASH_INTENSITY) * clamp(World.scene.fog.density / 0.04, 0.6, 1.8);
    } else u.uHaze.value = 0;
    const r = World.renderer;
    r.setRenderTarget(this.rt); r.render(World.scene, World.camera);
    u.uBloom.value = Q.bloom ? 0.45 : 0;
    if (Q.bloom) {
      this.quad.material = this.brightMat; this.brightMat.uniforms.tIn.value = this.rt.texture; r.setRenderTarget(this.b1); r.render(this.scene, this.cam);
      this.quad.material = this.blurMat; const bu = this.blurMat.uniforms;
      for (let i = 0; i < 2; i++) {
        bu.tIn.value = this.b1.texture; bu.uDir.value.set((1 + i) / this.bw, 0); r.setRenderTarget(this.b2); r.render(this.scene, this.cam);
        bu.tIn.value = this.b2.texture; bu.uDir.value.set(0, (1 + i) / this.bh); r.setRenderTarget(this.b1); r.render(this.scene, this.cam);
      }
      this.quad.material = this.mat;
    }
    r.setRenderTarget(null); r.render(this.scene, this.cam);
  },
};

// Resolución dinámica: si el equipo no llega (~40 fps), baja la resolución interna; si sobra, la sube
const DynRes = {
  scale: 1, acc: 0, n: 0, slow: 0, fast: 0, last: performance.now(),
  update() {
    const now = performance.now(), dt = now - this.last; this.last = now;
    if (!CONFIG.DYNAMIC_RES || Game.state !== 'playing' || Game.busy || dt > 250) return;
    this.acc += dt; this.n++;
    if (this.acc < 1000) return;
    const avg = this.acc / this.n; this.acc = 0; this.n = 0;
    if (avg > 24) { this.slow++; this.fast = 0; } else if (avg < 15) { this.fast++; this.slow = 0; } else { this.slow = 0; this.fast = 0; }
    if (this.slow >= 2 && this.scale > 0.55) { this.scale = Math.max(0.55, this.scale - 0.12); this.slow = 0; Post.resize(); }
    else if (this.fast >= 6 && this.scale < 1) { this.scale = Math.min(1, this.scale + 0.08); this.fast = 0; Post.resize(); }
  },
};

