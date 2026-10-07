/* =====================================================================
   JUEGO — estados, fundidos, interacción, menús, partida nueva / continuar
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const Game = {
  state: 'loading', fade: 1, fadeTarget: 1, fadeSpeed: 1, fadeDone: null, busy: false, armed: true, target: null, time: 0, optionsFrom: 'menu', started: false,
  ui: null,          // interfaz abierta encima del juego: 'inv' | 'note' | 'keypad' | null
  spawn: 'start',    // punto de entrada de la zona actual (se guarda)
  ending: false,
  fadeTo(v, dur = CONFIG.FADE_TIME) {
    this.fadeTarget = v; this.fadeSpeed = 1 / Math.max(0.01, dur);
    return new Promise((res) => { if (this.fade === v) res(); else this.fadeDone = res; });
  },
  show(id) { for (const s of ['menu', 'pause', 'options', 'loading']) $(s).classList.toggle('hidden', s !== id); if (id === 'menu') refreshMenu(); },
  // Vacía el estado de la partida (o lo carga de un guardado)
  resetRun(sv) {
    for (const k of Object.keys(Flags)) delete Flags[k];
    if (sv) Object.assign(Flags, sv.flags || {});
    for (const a of LOOP_ANOMS) delete Flags['an_' + a];       // anomalías de la escalera: nunca se guardan
    Inv.load(sv ? sv.inv : null); Notes.load(sv ? sv.notes : null);
    Flashlight.battery = sv ? sv.battery ?? CONFIG.BATTERY_START : CONFIG.BATTERY_START;
    Sanity.reset(sv ? sv.tension || 0 : 0); StairLoop.stop(); Scares.reset(sv ? sv.done : null); Ending.reset();
    for (const z of Zones.cache.values()) z.refreshVariants();
  },
  async start(cont = false) {
    if (this.busy) return; this.busy = true;
    AudioSys.init(); applyAudioQuality(); enterFullscreen();
    this.show(null);
    await this.fadeTo(1, 0.6);
    const sv = cont ? Save.load() : null;
    if (!cont) Save.clear();
    this.resetRun(sv);
    const zid = sv && ZONE_DEFS[sv.zone] ? sv.zone : 'z1', sp = sv ? sv.spawn : 'start';
    const z = Zones.activate(zid, sp); Zones.prebuild(); z.startAudio();
    AudioSys.resetReverb(); z.updateReverb(true); Music.sync(zid); Silence.reset();
    Flashlight.on = false; Player.crouch = false; Player.eye = CONFIG.EYE_HEIGHT;
    this.state = 'playing'; this.started = true; this.armed = false; this.spawn = sp; this.ui = null;
    Input.requestLock(); Touch.show(true); Hud.show(true);
    AudioSys.setWorld(1, 0.8);
    Post.render(this.time, 1); await nextFrame();
    await this.fadeTo(0, 1.6);
    this.busy = false;
    if (!cont) { Hud.sub('…me he quedado dormido. El último tren ya se ha ido.', 5); setTimeout(() => Hud.msg(Touch.enabled ? 'Linterna: botón de la linterna · Inventario: botón de la mochila' : 'F linterna · Tab inventario · E interactuar', 6), 5200); }
    else Hud.msg('Partida cargada', 2.5);
    Save.write();
  },
  pause() {
    if (this.state !== 'playing') return;
    if (this.ui) this.closeUI(true);
    this.state = 'paused'; Input.keys.clear(); this.show('pause'); $('resume').classList.add('hidden'); Touch.show(false); Hud.show(false);
    AudioSys.setWorld(0.25, 0.25); $('dot').classList.remove('on'); Hud.label(null);
  },
  resume() {
    this.state = 'playing'; this.show(null); AudioSys.setWorld(1, 0.3); Input.requestLock(); Hud.show(true);
    if (Touch.enabled) { enterFullscreen(); Touch.show(true); if (AudioSys.ctx && AudioSys.ctx.state !== 'running') AudioSys.ctx.resume(); }
  },
  async quit() {
    if (this.busy) return; this.busy = true; this.show(null); Touch.show(false); Hud.show(false);
    Save.write();
    AudioSys.setWorld(0, 0.3);
    await this.fadeTo(1, 0.6);
    if (document.pointerLockElement) document.exitPointerLock();
    this.state = 'menu'; this.ui = null; Scares.clear(); Power.k = 1;
    const z = Zones.activate('z1', null); z.stopAudio(); Music.zone = null; Music.sync();
    Flashlight.on = false;
    this.show('menu');
    await this.fadeTo(0, 1.2);
    this.busy = false;
  },
  openOptions(from) { this.optionsFrom = from; syncOptionsUI(); this.show('options'); },
  closeOptions() { this.show(this.optionsFrom); },
  // ---------- Interfaces encima del juego (inventario, nota, teclado numérico) ----------
  openUI(name) {
    if (this.state !== 'playing' || this.busy) return false;
    this.ui = name; Input.keys.clear(); Touch.show(false); Hud.label(null); $('dot').classList.remove('on');
    if (document.pointerLockElement) document.exitPointerLock();
    AudioSys.rustle(0.08);
    return true;
  },
  closeUI(silent) {
    if (!this.ui) return;
    const was = this.ui; this.ui = null;
    if (was === 'inv') Inventory.hide(); else if (was === 'note') Notes.hide(); else if (was === 'keypad') Keypad.hide();
    if (silent) return;
    Input.requestLock(); Touch.show(true);
  },
  // Cambio de zona con fundido a negro
  async transition(to, spawn, wait = 0) {
    if (this.busy) return; this.busy = true;
    if (wait) await new Promise((r) => setTimeout(r, wait * 1000));
    AudioSys.setWorld(0, 0.25);
    await this.fadeTo(1, CONFIG.FADE_TIME);
    StairLoop.stop(); Scares.clear();
    if (Ending.phase) { Ending.reset(); delete Flags.trainHere; for (const zz of Zones.cache.values()) zz.refreshVariants(); }   // el tren se va si te alejas
    const z = Zones.activate(to, spawn);
    Zones.prebuild();
    AudioSys.resetReverb(); z.updateReverb(true); Music.sync(to);
    this.armed = false; this.spawn = spawn;
    Save.write();
    Post.render(this.time, 1);                 // calienta shaders/texturas con la pantalla en negro
    await nextFrame();
    AudioSys.setWorld(1, 0.6);
    await this.fadeTo(0, CONFIG.FADE_TIME * 1.3);
    this.busy = false;
  },
  checkPortals() {
    const z = Zones.current, p = Player.pos; let inside = null;
    for (const pt of z.portals) { const b = pt.box; if (!condOk(pt.cond)) continue; if (p.x >= b.x0 && p.x <= b.x1 && p.z >= b.z0 && p.z <= b.z1 && p.y >= b.y0 && p.y <= b.y1) { inside = pt; break; } }
    if (!inside) { this.armed = true; return; }
    if (this.armed && ZONE_DEFS[inside.to]) { this.armed = false; this.transition(inside.to, inside.spawn); }
  },
  // Volúmenes de sustos/eventos: se disparan al entrar (los que tienen id, una sola vez por partida)
  checkTriggers() {
    const z = Zones.current, p = Player.pos;
    for (const t of z.triggers) {
      const b = t.box, inside = condOk(t.cond) && p.x >= b.x0 && p.x <= b.x1 && p.z >= b.z0 && p.z <= b.z1 && p.y >= (b.y0 ?? -99) && p.y <= (b.y1 ?? 99);
      if (inside && !t.inside && !(t.id && Scares.done[t.id])) { if (t.id) Scares.done[t.id] = true; t.fn(z); }
      t.inside = inside;
    }
  },
  checkInteract(cam) {
    const z = Zones.current, o = cam.position, d = _v.set(0, 0, -1).applyQuaternion(cam.quaternion);
    let best = null, bd = CONFIG.INTERACT_DIST;
    for (const it of z.inter) { if (!condOk(it.cond)) continue; const t = rayBox(o, d, it.box); if (t !== null && t < bd) { bd = t; best = it; } }
    this.target = best; $('dot').classList.toggle('on', !!best);
    Hud.label(best ? (typeof best.label === 'function' ? best.label() : best.label) || 'Interactuar' : null);
  },
  interact() { if (this.target && !this.busy && !this.ui) this.target.action(); },
};
function rayBox(o, d, b) {
  let t0 = 0, t1 = Infinity;
  for (const [oa, da, mn, mx] of [[o.x, d.x, b.x0, b.x1], [o.y, d.y, b.y0, b.y1], [o.z, d.z, b.z0, b.z1]]) {
    if (Math.abs(da) < 1e-9) { if (oa < mn || oa > mx) return null; continue; }
    let ta = (mn - oa) / da, tb = (mx - oa) / da; if (ta > tb) { const s = ta; ta = tb; tb = s; }
    t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return null;
  }
  return t0;
}
// Menú principal: "Continuar" solo si hay partida guardada
function refreshMenu() {
  const has = Save.exists();
  $('btnContinue').classList.toggle('hidden', !has);
  $('btnStart').textContent = has ? 'Nueva partida' : 'Iniciar';
}
