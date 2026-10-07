/* =====================================================================
   POST-PROCESADO — un solo pase: aberración cromática, tono, viñeta, grano, fundido
   ===================================================================== */
const Post = {
  rt: null, scene: new THREE.Scene(), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat: null, w: 1, h: 1,
  init() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uGrain: { value: CONFIG.GRAIN },
        uVig: { value: CONFIG.VIGNETTE }, uCA: { value: CONFIG.CHROMATIC }, uExp: { value: CONFIG.EXPOSURE }, uFade: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime, uGrain, uVig, uCA, uExp, uFade; varying vec2 vUv;
        vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
        float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
        void main(){
          vec2 d = vUv - 0.5; float r2 = dot(d, d); vec3 c;
          if (uCA > 0.0) { vec2 o = d * uCA * (0.6 + r2 * 5.0);
            c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b); }
          else c = texture2D(tDiffuse, vUv).rgb;
          c = aces(c * uExp);
          c = pow(c, vec3(1.0 / 2.2));
          // gradación: sombras ligeramente frías, contraste suave de cámara vieja
          c = mix(c, c * vec3(0.94, 1.0, 1.06), 0.5 * (1.0 - c));
          float v = smoothstep(0.95, 0.25, length(d * vec2(uRes.x / uRes.y, 1.0)) * 0.95);
          c *= mix(1.0, v, uVig);
          float g = hash(vUv * uRes + fract(uTime * 7.31) * 517.0) - 0.5;
          c += g * uGrain * (0.55 + 0.45 * (1.0 - dot(c, vec3(0.33))));
          c *= 1.0 - uFade;
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat); q.frustumCulled = false; this.scene.add(q);
  },
  resize() {
    const sc = Q.scale * DynRes.scale;
    const w = Math.max(2, Math.floor(innerWidth * sc)), h = Math.max(2, Math.floor(innerHeight * sc));
    if (this.rt) this.rt.dispose();
    const ext = World.renderer.extensions, canFloat = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float');
    this.rt = new THREE.WebGLRenderTarget(w, h, { type: canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: Q.samples, depthBuffer: true, stencilBuffer: false });
    this.mat.uniforms.tDiffuse.value = this.rt.texture; this.mat.uniforms.uRes.value.set(w, h); this.w = w; this.h = h;
    GlowMat.uniforms.uScale.value = h / (2 * Math.tan(THREE.MathUtils.degToRad(World.camera.fov) / 2));
  },
  render(t, fade) {
    const u = this.mat.uniforms; u.uTime.value = t; u.uFade.value = fade; u.uExp.value = CONFIG.EXPOSURE * S.brightness; u.uCA.value = Q.ca ? CONFIG.CHROMATIC : 0;
    const r = World.renderer;
    r.setRenderTarget(this.rt); r.render(World.scene, World.camera);
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

