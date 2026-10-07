/* =====================================================================
   CONTROLES TÁCTILES — joystick flotante (izquierda), arrastrar para mirar
   (derecha), toque corto = interactuar, y botones de correr/agacharse/linterna
   ===================================================================== */
const IS_TOUCH = /[?&]touch/.test(location.search) || (!/[?&]desk/.test(location.search) && matchMedia('(hover: none) and (pointer: coarse)').matches);
const Touch = {
  enabled: IS_TOUCH, run: false, ax: 0, ay: 0, joy: null, look: null, state: {},
  init() {
    if (!this.enabled) return;
    document.body.classList.add('touch');
    const L = (this.el = $('touch')), joy = $('joy'), knob = $('knob'), R = 58;
    const place = (x, y) => { joy.style.left = x + 'px'; joy.style.top = y + 'px'; };
    this.resetJoy = () => { place(Math.max(90, innerWidth * 0.15), innerHeight - Math.max(95, innerHeight * 0.26)); joy.classList.remove('on'); knob.style.transform = ''; this.ax = this.ay = 0; };
    L.addEventListener('pointerdown', (e) => {
      if (Game.state !== 'playing' || Game.ui) return;
      e.preventDefault();
      if (e.clientX < innerWidth * 0.42 && !this.joy) { this.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY }; place(e.clientX, e.clientY); joy.classList.add('on'); }
      else if (!this.look) this.look = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() };
    });
    L.addEventListener('pointermove', (e) => {
      if (this.joy && e.pointerId === this.joy.id) {
        let dx = e.clientX - this.joy.x0, dy = e.clientY - this.joy.y0; const d = Math.hypot(dx, dy);
        if (d > R) { // la base sigue al dedo si se aleja demasiado
          const k = (d - R) / d; this.joy.x0 += dx * k; this.joy.y0 += dy * k; place(this.joy.x0, this.joy.y0); dx *= R / d; dy *= R / d;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        const m = Math.min(1, Math.hypot(dx, dy) / R), k = m < 0.14 ? 0 : (m - 0.14) / 0.86, dd = Math.hypot(dx, dy) || 1;
        this.ax = (dx / dd) * k; this.ay = (dy / dd) * k;
      } else if (this.look && e.pointerId === this.look.id) {
        const dx = e.clientX - this.look.x, dy = e.clientY - this.look.y; this.look.x = e.clientX; this.look.y = e.clientY;
        Player.look(dx * CONFIG.TOUCH_LOOK, dy * CONFIG.TOUCH_LOOK);
      }
    });
    const end = (e) => {
      if (this.joy && e.pointerId === this.joy.id) { this.joy = null; this.resetJoy(); }
      else if (this.look && e.pointerId === this.look.id) {
        const lk = this.look; this.look = null;
        // toque corto sin arrastrar: interactuar con lo que hay delante (puertas, botones...)
        if (e.type === 'pointerup' && performance.now() - lk.t0 < 300 && Math.hypot(e.clientX - lk.x0, e.clientY - lk.y0) < 14) Game.interact();
      }
    };
    L.addEventListener('pointerup', end); L.addEventListener('pointercancel', end);
    const btn = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (Game.state === 'playing') fn(); });
    btn('tbUse', () => Game.interact());
    btn('tbFlash', () => Flashlight.toggle());
    btn('tbCrouch', () => Player.toggleCrouch());
    btn('tbRun', () => { this.run = !this.run; });
    btn('tbPause', () => Game.pause());
    btn('tbInv', () => Inventory.show());
    this.resetJoy();
    addEventListener('resize', () => { this.resetJoy(); });
  },
  show(on) {
    if (!this.enabled) return;
    this.el.classList.toggle('hidden', !on);
    this.joy = this.look = null; this.resetJoy();
  },
  // Estado visual de los botones (solo se toca el DOM si algo cambió)
  update() {
    if (!this.enabled || Game.state !== 'playing') return;
    const st = { tbUse: !!Game.target, tbFlash: Flashlight.on, tbCrouch: Player.crouch, tbRun: this.run };
    for (const k in st) if (this.state[k] !== st[k]) { this.state[k] = st[k]; $(k).classList.toggle(k === 'tbUse' ? 'ready' : 'on', st[k]); }
  },
};
// Pantalla completa + horizontal (Android). En iPhone no existe y se ignora.
function enterFullscreen() {
  const d = document.documentElement, rf = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!Touch.enabled || !rf || document.fullscreenElement || document.webkitFullscreenElement) return;
  try {
    const p = rf.call(d, { navigationUI: 'hide' });
    const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* no soportado */ } };
    if (p && p.then) p.then(lock).catch(() => {}); else lock();
  } catch (e) { /* no soportado */ }
}
// En vertical se abre el campo de visión para no ver "por un tubo"
function fitCamera() {
  const cam = World.camera, a = innerWidth / innerHeight;
  const need = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(CONFIG.MIN_HFOV) / 2) / a));
  cam.fov = clamp(Math.max(CONFIG.FOV, need), CONFIG.FOV, 100); cam.aspect = a; cam.updateProjectionMatrix();
  $('rotate').classList.toggle('hidden', !(Touch.enabled && a < 1));
}

