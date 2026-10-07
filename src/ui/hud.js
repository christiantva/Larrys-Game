/* =====================================================================
   HUD — mensajes breves, etiqueta de interacción, subtítulos, pila
   ===================================================================== */
const Hud = {
  visible: false, lastLabel: undefined, subT: 0, batShown: false,
  show(on) { this.visible = on; $('hud').classList.toggle('hidden', !on); },
  // Mensaje en la parte baja (se apilan como mucho 3)
  msg(text, dur = 3.2) {
    const box = $('toasts'), el = document.createElement('div'); el.className = 'toast'; el.innerHTML = text;
    box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
    requestAnimationFrame(() => el.classList.add('on'));
    setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 600); }, dur * 1000);
  },
  pickup(id, n) {
    const it = ITEMS[id];
    this.msg(`<img src="${ItemIcon.get(id)}" alt=""> ${it.name}${n > 1 ? ' ×' + n : ''} <span>${it.jp}</span>`, 3.5);
  },
  // Texto bajo el punto de mira con lo que hará la tecla E / el toque
  label(text) {
    if (text === this.lastLabel) return; this.lastLabel = text;
    const el = $('hint'); if (!text) { el.classList.remove('on'); return; }
    el.innerHTML = (Touch.enabled ? '' : '<kbd>E</kbd> ') + text; el.classList.add('on');
  },
  // Subtítulo (voces, susurros, megafonía)
  sub(text, dur = 3) { const el = $('sub'); el.textContent = text; el.classList.add('on'); this.subT = dur; },
  update(dt) {
    if (this.subT > 0) { this.subT -= dt; if (this.subT <= 0) $('sub').classList.remove('on'); }
    if (!this.visible) return;
    // indicador de pila: visible con la linterna encendida o con poca carga
    const b = Flashlight.battery, show = Flashlight.on || b < 25;
    if (show !== this.batShown) { this.batShown = show; $('batt').classList.toggle('on', show); }
    if (show) { const s = $('battFill'); s.style.width = b.toFixed(0) + '%'; s.classList.toggle('low', b < 15); }
    // aguante: solo se ve mientras no está lleno
    const st = Player.stamina, sv = st < 0.98;
    if (sv !== this.stamShown) { this.stamShown = sv; $('stam').classList.toggle('on', sv); }
    if (sv) { const s = $('stamFill'); s.style.width = (st * 100).toFixed(0) + '%'; s.classList.toggle('low', Player.tired); }
  },
};
