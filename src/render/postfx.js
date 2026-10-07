/* =====================================================================
   POST-PROCESADO — un solo pase: aberración cromática, tono, viñeta, grano, fundido
   ===================================================================== */
const Post = {
  rt: null, scene: new THREE.Scene(), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat: null, w: 1, h: 1,
  init() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uGrain: { value: CONFIG.GRAIN },
        uVig: { value: CONFIG.VIGNETTE }, uCA: { value: CONFIG.CHROMATIC }, uExp: { value: CONFIG.EXPOSURE }, uFade: { value: 1 },
        uTen: { value: 0 }, uHit: { value: 0 }, uPulse: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime, uGrain, uVig, uCA, uExp, uFade, uTen, uHit, uPulse; varying vec2 vUv;
        vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
        float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
        void main(){
          vec2 uv = vUv;
          // tensión alta: la imagen "respira" y se deforma un poco
          if (uTen > 0.55) { float w = (uTen - 0.55) / 0.45; uv += vec2(sin(uv.y * 17.0 + uTime * 1.7), cos(uv.x * 13.0 + uTime * 1.3)) * 0.0028 * w * w; }
          vec2 d = uv - 0.5; float r2 = dot(d, d); vec3 c;
          float ca = uCA + uTen * uTen * 0.007 + uHit * 0.008;
          if (ca > 0.0) { vec2 o = d * ca * (0.6 + r2 * 5.0);
            c = vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b); }
          else c = texture2D(tDiffuse, uv).rgb;
          c = aces(c * uExp);
          c = pow(c, vec3(1.0 / 2.2));
          // gradación: sombras ligeramente frías, contraste suave de cámara vieja
          c = mix(c, c * vec3(0.94, 1.0, 1.06), 0.5 * (1.0 - c));
          // desaturación con la tensión
          float lu = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(c, vec3(lu) * vec3(0.98, 1.0, 1.03), uTen * 0.6);
          float rr = length(d * vec2(uRes.x / uRes.y, 1.0)) * 0.95;
          float v = smoothstep(0.95 - uTen * 0.3 - uPulse * 0.08, 0.25 - uTen * 0.12, rr);
          c *= mix(1.0, v, min(1.0, uVig + uTen * 0.4));
          // destello rojo en los sustos
          c = mix(c, c * vec3(1.3, 0.45, 0.4) + vec3(0.05, 0.0, 0.0), uHit * 0.55);
          float g = hash(vUv * uRes + fract(uTime * 7.31) * 517.0) - 0.5;
          c += g * uGrain * (1.0 + uTen * 1.6) * (0.55 + 0.45 * (1.0 - dot(c, vec3(0.33))));
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
    u.uTen.value = Sanity.vis; u.uHit.value = Sanity.hit; u.uPulse.value = Sanity.pulse;
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

