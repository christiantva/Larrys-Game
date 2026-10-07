/* =====================================================================
   BUCLE PRINCIPAL
   ===================================================================== */
const clock = new THREE.Clock();
let fpsT = performance.now(), fpsN = 0;
function menuCamera(t) {
  const cam = World.camera, mc = Zones.current && Zones.current.menuCamSpec;
  const p = mc ? mc.p : [4.3, 1.5, 2.3], tg = mc ? mc.t : [-1, 1.25, -4.4];
  cam.position.set(p[0] + Math.sin(t * 0.05) * 0.5, p[1] + Math.sin(t * 0.11) * 0.03, p[2] + Math.sin(t * 0.037) * 0.25);
  cam.lookAt(tg[0] + Math.sin(t * 0.03) * 0.6, tg[1], tg[2]);
}
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.066); Game.time += dt;
  World.renderer.info.reset(); DynRes.update();
  const cam = World.camera, z = Zones.current;
  // fundido
  if (Game.fade !== Game.fadeTarget) {
    const s = dt * Game.fadeSpeed;
    Game.fade = Game.fadeTarget > Game.fade ? Math.min(Game.fadeTarget, Game.fade + s) : Math.max(Game.fadeTarget, Game.fade - s);
    if (Game.fade === Game.fadeTarget && Game.fadeDone) { const r = Game.fadeDone; Game.fadeDone = null; r(); }
  }
  if (z) {
    if (Game.state === 'playing') {
      if (!Game.busy) Player.update(dt, z);
      Player.applyCamera(cam, Game.time);
      if (!Game.busy) { Game.checkPortals(); Game.checkInteract(cam); }
    } else if (Game.state === 'menu' || Game.state === 'loading') menuCamera(Game.time);
    else if (Game.state === 'paused') Player.applyCamera(cam, Game.time);
    cam.updateMatrixWorld();
    Flashlight.update(dt, cam, Game.time);
    z.update(dt, Game.time, cam);
    AudioSys.updateListener(cam);
    Music.update(dt); Silence.update(dt); Touch.update();
  }
  Post.render(Game.time, Game.fade);
  if (DEBUG) {
    fpsN++; const now = performance.now();
    if (now - fpsT > 500) {
      const info = World.renderer.info.render;
      $('fps').textContent = `${(fpsN * 1000 / (now - fpsT)).toFixed(0)} fps  res ${(Q.scale * DynRes.scale).toFixed(2)}  calls ${info.calls}  tris ${info.triangles}\n${z ? z.id : ''} ${Player.surface} ${Player.pos.x.toFixed(1)},${Player.pos.y.toFixed(2)},${Player.pos.z.toFixed(1)}`;
      fpsT = now; fpsN = 0;
    }
  }
}
addEventListener('resize', () => {
  World.renderer.setSize(innerWidth, innerHeight);
  fitCamera();
  Post.resize();
});
// Si la app pasa a segundo plano (cambio de pestaña, llamada...), se pausa
document.addEventListener('visibilitychange', () => { if (document.hidden && Game.state === 'playing') Game.pause(); });

