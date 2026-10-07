/* =====================================================================
   TECLADO NUMÉRICO — puerta de cristal de la galería (clave de 4 cifras)
   ===================================================================== */
const Keypad = {
  code: '', answer: '0042', onOk: null, lockT: 0,
  open(answer, onOk) {
    if (!Game.openUI('keypad')) return;
    this.answer = answer; this.onOk = onOk; this.code = ''; this.draw();
    $('keypad').classList.remove('hidden');
  },
  hide() { $('keypad').classList.add('hidden'); },
  draw() { $('kpDisp').textContent = (this.code + '____').slice(0, 4).split('').join(' '); },
  press(k) {
    if (performance.now() < this.lockT) return;
    if (k === 'C') { this.code = ''; AudioSys.keyBeep(); this.draw(); return; }
    if (k === 'OK') { this.check(); return; }
    if (this.code.length >= 4) return;
    this.code += k; AudioSys.keyBeep(); this.draw();
    if (this.code.length === 4) setTimeout(() => this.check(), 250);
  },
  check() {
    if (Game.ui !== 'keypad') return;
    const el = $('kpDisp');
    if (this.code === this.answer) {
      AudioSys.keyBeep(true); el.classList.add('ok');
      setTimeout(() => { el.classList.remove('ok'); Game.closeUI(); if (this.onOk) this.onOk(); }, 650);
    } else {
      AudioSys.keyBeep(false); el.classList.add('bad'); this.lockT = performance.now() + 700;
      setTimeout(() => { el.classList.remove('bad'); this.code = ''; this.draw(); }, 700);
    }
  },
  // Teclado físico: cifras, retroceso, Enter. Devuelve true si consumió la tecla
  key(e) {
    const m = /^(?:Digit|Numpad)(\d)$/.exec(e.code);
    if (m) { this.press(m[1]); return true; }
    if (e.code === 'Backspace') { this.code = this.code.slice(0, -1); this.draw(); return true; }
    if (e.code === 'Enter' || e.code === 'NumpadEnter') { this.check(); return true; }
    return false;
  },
  bind() {
    const g = $('kpKeys');
    for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK']) {
      const b = document.createElement('button'); b.textContent = k; b.className = k.length > 1 || k === 'C' ? 'fn' : '';
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.press(k); });
      g.appendChild(b);
    }
    $('kpClose').addEventListener('click', (e) => { e.stopPropagation(); Game.closeUI(); });
  },
};
