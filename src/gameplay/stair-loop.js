/* =====================================================================
   ESCALERA INFINITA (2º acto) — al bajar hacia el andén, la escalera se
   repite. Regla: si ves algo raro, da la vuelta; si no, sigue bajando.
   Hay que acertar 8 veces seguidas; un error devuelve a B1.
   ===================================================================== */
const LOOP_ANOMS = ['fig', 'exit', 'dark', 'umb', 'door', 'mirror'];
const StairLoop = {
  on: false, n: 0, anom: null, visited: false, sign: null, cv: null, tex: null,
  active() { return this.on && Zones.current && Zones.current.id === 'z2'; },
  start() {
    if (this.on || Flags.loopDone || !Flags.act2) return;
    this.on = true; this.n = 0; this.roll(true);
    Hud.sub('…otra vez esta escalera.', 3);
  },
  stop() { if (!this.on) return; this.on = false; this.clearAnom(); },
  // Nueva vuelta: a veces aparece una anomalía
  roll(first) {
    this.clearAnom(); this.visited = false;
    this.anom = !first && Math.random() < 0.5 ? pick(LOOP_ANOMS) : null;
    const a = this.anom;
    if (a === 'exit' || a === 'umb' || a === 'door') setFlag('an_' + a);
    else if (a === 'dark') Scares.pw = { to: 0.04, speed: 4 };
    else if (a === 'fig') Scares.apparition([2.7, -4.08, -9.75], { stare: 999, near: 1.1, life: 9999, quiet: true });
    this.drawSign(a === 'mirror');
  },
  clearAnom() {
    let ch = false;
    for (const a of LOOP_ANOMS) if (Flags['an_' + a]) { delete Flags['an_' + a]; ch = true; }
    if (ch) for (const z of Zones.cache.values()) z.refreshVariants();
    if (this.anom === 'fig' && Scares.fig) { Scares.fig = null; Scares.mesh.visible = false; }
    if (this.anom === 'dark') Scares.pw = { to: 1, speed: 4 };
    this.anom = null;
  },
  // Cartel del piso en el rellano (se redibuja en cada vuelta)
  drawSign(mirror) {
    const z = Zones.current; if (!z || z.id !== 'z2') return;
    const m = z.group.getObjectByName('loopSign'); if (!m) return;
    const g = m.userData.cv.getContext('2d'), w = 512, h = 256, f = this.n + 1;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#16191b'; g.fillRect(0, 0, w, h);
    if (mirror) { g.translate(w, 0); g.scale(-1, 1); }
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, 150, h);
    txt(g, 'B' + f, 75, h / 2 + 4, 92, '#16191b', { font: EN, align: 'center', weight: '900' });
    txt(g, `地下${f}階`, 175, 92, 54, '#f2f2f2'); txt(g, `Floor B${f}`, 178, 168, 36, '#9aa4aa', { font: EN, weight: '500' });
    m.material.map.needsUpdate = true;
  },
  visit() { if (this.on) this.visited = true; },
  // Volver a subir: correcto solo si había algo raro
  back() {
    if (!this.on || !this.visited) return;
    this.judge(!!this.anom);
    Sanity.doBlink(); Player.yaw += PI; AudioSys.staticBurst(0.08);
  },
  // Seguir bajando: correcto solo si no había nada raro
  down() {
    if (!this.on || !this.visited) return;
    const ok = !this.anom;
    if (ok && this.n + 1 >= 8) { this.finish(); return; }
    this.judge(ok);
    const P = Player.pos, lat = clamp(P.z + 8.7, -1.0, 1.0), s = clamp(P.x - 9.7, 0, 0.8);
    Sanity.doBlink(); AudioSys.staticBurst(0.08);
    P.set(lat, 0, 0.9 - s); Player.yaw += PI / 2; Player.camY = P.y + Player.eye; Player.lastY = 0;
  },
  judge(ok) {
    if (ok) { this.n++; if (this.n >= 5) AudioSys.whisper(null, 0.25, 1.2); }
    else { this.n = 0; AudioSys.stinger(0.35); Sanity.scare(0.12, 0.4); Scares.after(0.5, () => Hud.sub('B1', 1.5)); }
    this.roll(false);
  },
  finish() {
    this.n = 8; this.stop(); setFlag('loopDone'); Save.write();
    Hud.sub('…la escalera por fin se acaba.', 4); AudioSys.chime();
  },
};
