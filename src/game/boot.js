/* =====================================================================
   ARRANQUE
   ===================================================================== */
async function boot() {
  loadSettings(); Q = QUALITY[S.quality];
  initWorld(); fitCamera(); Post.init(); applyQuality(false); initInput(); Touch.init(); bindUI(); bindGameplayUI(); syncOptionsUI();
  Particles.init(); Scares.init();
  if (DEBUG) $('fps').classList.remove('hidden');
  await nextFrame(); await nextFrame();
  const z = Zones.activate('z1', 'start');
  Zones.prebuild();
  Game.state = 'menu';
  requestAnimationFrame(frame);
  await nextFrame();
  window.__booted = true;
  Game.show('menu');
  Game.fadeTo(0, 2.0);
  if (DEBUG) window.__game = { Flags, Music, TEXT, Tex, TEX, Game, Zones, Player, AudioSys, World, Flashlight, S, Q: () => Q, CONFIG,
    Inv, Notes, Sanity, Scares, Save, Ending, Keypad, Inventory, Hud, Power, setFlag,
    tp(id, spawn) { return Game.transition(id, spawn); },
    act(label, n = 0) { const l = Zones.current.inter.filter((i) => condOk(i.cond) && (typeof i.label === 'function' ? i.label() : i.label) === label); if (l[n]) { l[n].action(); return true; } return false; },
    set(x, z, yaw = Player.yaw, pitch = 0) { const g = Zones.current.groundTop(x, z); Player.pos.set(x, g ? g.y : Player.pos.y, z); Player.camY = Player.pos.y + Player.eye; Player.yaw = yaw; Player.pitch = pitch; } };
  return z;
}
boot().catch((e) => {
  console.error(e);
  const f = $('fatal'); f.classList.remove('hidden'); f.textContent = 'Error al iniciar: ' + (e && e.message ? e.message : e);
});
