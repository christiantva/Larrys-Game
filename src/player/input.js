/* =====================================================================
   INPUT — teclado + ratón (Pointer Lock)
   ===================================================================== */
const Input = {
  keys: new Set(), locked: false, lockTime: 0,
  down(code) { return this.keys.has(code); },
  requestLock() {
    if (Touch.enabled) return;
    const el = World.renderer.domElement;
    try { const p = el.requestPointerLock(); if (p && p.catch) p.catch(() => onLockError()); } catch (e) { onLockError(); }
  },
};
function initInput() {
  addEventListener('keydown', (e) => {
    if (e.code === 'Tab') e.preventDefault();
    Input.keys.add(e.code);
    if (Game.state !== 'playing' || e.repeat) return;
    // con una interfaz abierta (inventario, nota, teclado numérico) las teclas van a ella
    if (Game.ui) {
      if (Game.ui === 'keypad' && Keypad.key(e)) return;
      if (e.code === 'Escape' || e.code === 'Tab' || e.code === 'KeyI' || (Game.ui === 'note' && e.code === 'KeyE')) Game.closeUI();
      return;
    }
    if (e.code === 'KeyF') Flashlight.toggle();
    if (e.code === 'KeyE') Game.interact();
    if (e.code === 'KeyC') Player.toggleCrouch();
    if (e.code === 'KeyR') Flashlight.reload();
    if (e.code === 'Tab' || e.code === 'KeyI') Inventory.show();
    if (e.code === 'Escape') { Game.pause(); if (document.pointerLockElement) document.exitPointerLock(); }
  });
  addEventListener('keyup', (e) => Input.keys.delete(e.code));
  addEventListener('blur', () => Input.keys.clear());
  addEventListener('mousemove', (e) => {
    if (!Input.locked || Game.state !== 'playing' || Game.ui) return;
    // Al bloquear el ratón algunos navegadores mandan un "salto" falso (recentrado del cursor): se ignora
    const m = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
    if ((performance.now() - Input.lockTime < 600 && m > 40) || m > 500) return;
    Player.look(clamp(e.movementX, -200, 200), clamp(e.movementY, -200, 200));
  });
  document.addEventListener('pointerlockchange', () => {
    Input.locked = document.pointerLockElement === World.renderer.domElement;
    if (Input.locked) Input.lockTime = performance.now();
    if (Input.locked) document.getElementById('resume').classList.add('hidden');
    else if (Game.state === 'playing' && !Game.ui) Game.pause();
  });
  document.addEventListener('pointerlockerror', onLockError);
  World.renderer.domElement.addEventListener('click', () => { if (Game.state === 'playing' && !Input.locked && !Game.ui) Input.requestLock(); });
}
function onLockError() {
  if (DEBUG) return; // en pruebas automáticas se juega sin bloquear el ratón
  if (Game.state === 'playing' && !Game.ui) document.getElementById('resume').classList.remove('hidden');
}

