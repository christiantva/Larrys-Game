/* =====================================================================
   FINAL — con el billete perforado, el último tren por fin llega al andén
   ===================================================================== */
function trainSideCanvas() {
  return signCanvas(2048, 256, (g, w, h) => {
    g.fillStyle = '#3a4038'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a7a4a'; g.fillRect(0, 196, w, 14);                         // franja verde (Keihan)
    for (let k = 0; k < 4; k++) {
      const x0 = k * 512;
      g.fillStyle = '#1c201c'; g.fillRect(x0 + 40, 60, 60, 190); g.fillRect(x0 + 412, 60, 60, 190);    // puertas
      g.fillStyle = '#fff4dc'; g.fillRect(x0 + 50, 74, 40, 70); g.fillRect(x0 + 422, 74, 40, 70);
      const gr = g.createLinearGradient(0, 70, 0, 170); gr.addColorStop(0, '#fff6e2'); gr.addColorStop(1, '#ffe2b0');
      g.fillStyle = gr; g.fillRect(x0 + 120, 70, 272, 100);                     // ventanas
      g.fillStyle = '#2e2a24'; for (const x of [x0 + 210, x0 + 300]) g.fillRect(x, 70, 6, 100);
      g.fillStyle = 'rgba(90,60,40,0.55)'; g.fillRect(x0 + 120, 150, 272, 20);   // respaldos de los asientos
    }
    txt(g, '終点', 1300, 40, 30, '#ffb060');
  });
}
// Interior del vagón visto a través de la puerta abierta
function trainInteriorCanvas() {
  return signCanvas(512, 512, (g, w, h) => {
    const vx = w / 2, vy = h * 0.46;
    g.fillStyle = '#d9cdb4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(vx + 70, vy - 60); g.lineTo(vx - 70, vy - 60); g.fill();           // techo
    for (const s of [-1, 1]) { g.fillStyle = '#fff8e6'; g.beginPath(); g.moveTo(vx + s * 150, 0); g.lineTo(vx + s * 190, 0); g.lineTo(vx + s * 22, vy - 60); g.lineTo(vx + s * 14, vy - 60); g.fill(); }  // luces
    g.fillStyle = '#7a7466'; g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(vx + 70, vy + 50); g.lineTo(vx - 70, vy + 50); g.fill();        // suelo
    for (const s of [-1, 1]) {
      g.fillStyle = '#1e1a16'; g.beginPath(); g.moveTo(vx + s * w * 0.5, 70); g.lineTo(vx + s * 70, vy - 50); g.lineTo(vx + s * 70, vy); g.lineTo(vx + s * w * 0.5, 250); g.fill();   // ventanas negras
      g.fillStyle = '#2a6a4a'; g.beginPath(); g.moveTo(vx + s * w * 0.5, 330); g.lineTo(vx + s * 70, vy + 14); g.lineTo(vx + s * 70, vy + 34); g.lineTo(vx + s * w * 0.5, 420); g.fill();  // asientos verdes
      g.strokeStyle = '#b8b4a8'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { const t = k / 5, x = lerp(vx + s * w * 0.45, vx + s * 75, t), y0 = lerp(30, vy - 55, t); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + lerp(60, 10, t)); g.stroke(); g.beginPath(); g.arc(x, y0 + lerp(68, 12, t), lerp(9, 2, t), 0, PI * 2); g.stroke(); }  // asideros
    }
    g.fillStyle = '#3a3630'; g.fillRect(vx - 70, vy - 60, 140, 110); g.fillStyle = '#ffb060'; txt(g, '次は 終点', vx, vy - 40, 18, '#ffb060', { align: 'center' });
    const gr = g.createRadialGradient(vx, vy, 20, vx, vy, w * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,24,10,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
const Ending = {
  phase: null, t: 0, train: null, X0: -150, XS: -1.4, DUR: 9,
  reset() { this.phase = null; this.t = 0; Game.ending = false; if (this.train) { World.scene.remove(this.train); this.train.geometry.dispose(); this.train.material.map.dispose(); this.train.material.dispose(); this.train = null; } $('ending').classList.add('hidden'); },
  // Disparador del andén (zona 4)
  arrive() {
    if (this.phase || !Flags.act2 || !Inv.has('punched')) return;
    this.phase = 'call'; AudioSys.chime();
    Hud.sub('まもなく、電車がまいります。— Va a efectuar su entrada el tren.', 4.5);
    Scares.after(4.5, () => {
      AudioSys.trainArrive(this.DUR);
      const t = toTex(trainSideCanvas(), { repeat: true }); t.repeat.set(5, 1);
      const m = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.25, 1.25, 1.25) });
      this.train = new THREE.Mesh(new THREE.PlaneGeometry(100, 3.6), m);
      this.train.position.set(this.X0, 1.0, 3.6); this.train.rotation.y = PI; World.scene.add(this.train);
      this.phase = 'moving'; this.t = 0;
    });
  },
  update(dt) {
    if (this.phase !== 'moving' || !this.train) return;
    this.t += dt; const k = Math.min(1, this.t / this.DUR), e = 1 - Math.pow(1 - k, 2.6);
    const x = lerp(this.X0, this.XS, e); this.train.position.x = x;
    const L = World.lights[0];           // la luz del tren barre el andén a través de las puertas
    L.position.set(clamp(Player.pos.x + (x - Player.pos.x) * 0.15, -30, 20), 1.6, 3.9); L.color.setRGB(1, 0.86, 0.66); L.distance = 16; L.userData.base = 9 * Math.min(1, k * 3); L.userData.lv = 1;
    Sanity.shake = Math.max(Sanity.shake, 0.25 * (1 - k));
    if (k >= 1) {
      this.phase = 'stopped';
      Scares.after(2.2, () => { setFlag('trainHere'); AudioSys.doorOpen([-1.4, 1, 3.2], 'gate'); Hud.msg('Las puertas del tren se abren.', 4); });
    }
  },
  async board() {
    if (Game.busy || Game.ending) return;
    Game.ending = true; Game.busy = true; Hud.show(false); Touch.show(false); Hud.label(null); $('dot').classList.remove('on');
    AudioSys.doorOpen([-1.4, 1, 3.2], 'gate');
    await Game.fadeTo(1, 2.5);
    AudioSys.setWorld(0, 2); Music.fadeOut();
    if (document.pointerLockElement) document.exitPointerLock();
    Save.clear();
    const el = $('ending'); el.classList.remove('hidden', 'done'); void el.offsetWidth; el.classList.add('run');
    Game.busy = false;
  },
  async toMenu() {
    $('ending').classList.add('hidden'); $('ending').classList.remove('run');
    Game.state = 'playing';
    await Game.quit();                      // (no guarda: Game.ending sigue activo)
    this.reset(); Save.clear(); Game.resetRun(null); refreshMenu();
  },
};
// Atril del atrio: con la tenaza se perfora el billete y empieza el segundo acto
function punchTicket() {
  if (!Inv.has('ticket')) { Hud.msg('Necesitas un billete que perforar.'); return; }
  Inv.take('ticket'); Inv.take('punch'); AudioSys.click(AudioSys.tmp(1, 0.4), 0.5, 1800);
  Hud.msg('Perforas el billete. El chasquido resuena por todo el atrio.', 4);
  Inv.add('punched');
  Scares.after(2.0, () => Scares.blackout(3.2, () => {
    Hud.sub('«…vuelve al andén…»', 4); AudioSys.whisper(null, 0.45, 2.4);
    Scares.apparition([-6.0, 0, 4.4], { stare: 0.3, near: 2.5, life: 20 });
  }));
  Scares.after(2.6, () => { setFlag('act2'); Save.write(); });
}
