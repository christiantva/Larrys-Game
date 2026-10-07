/* =====================================================================
   INVENTARIO (interfaz) — objetos y notas encontradas. Tab / I / botón
   ===================================================================== */
const Inventory = {
  tab: 'items', sel: null,
  show(tab) {
    if (!Game.openUI('inv')) return;
    if (tab) this.tab = tab;
    $('inv').classList.remove('hidden'); this.render();
  },
  hide() { $('inv').classList.add('hidden'); },
  render() {
    const root = $('inv'); if (!root || root.classList.contains('hidden')) return;
    root.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === this.tab));
    const list = $('invList'), info = $('invInfo'); list.innerHTML = ''; info.innerHTML = '';
    if (this.tab === 'items') {
      if (!Inv.items.some((s) => s.id === this.sel)) this.sel = Inv.items[0] ? Inv.items[0].id : null;
      for (let i = 0; i < 8; i++) {
        const s = Inv.items[i], el = document.createElement('button'); el.className = 'slot';
        if (s) {
          el.innerHTML = `<img src="${ItemIcon.get(s.id)}" alt="">` + (s.n > 1 ? `<b>${s.n}</b>` : '');
          el.classList.toggle('on', s.id === this.sel);
          el.addEventListener('click', () => { this.sel = s.id; this.render(); });
        } else el.disabled = true;
        list.appendChild(el);
      }
      const it = this.sel && ITEMS[this.sel];
      if (it) {
        info.innerHTML = `<h4>${it.name} <span>${it.jp}</span></h4><p>${it.desc}</p>`;
        if (it.use) { const b = document.createElement('button'); b.className = 'm sm'; b.textContent = 'Usar'; b.addEventListener('click', () => { it.use(); this.render(); }); info.appendChild(b); }
      } else info.innerHTML = '<p class="dim">No llevas nada.</p>';
      const bat = document.createElement('div'); bat.className = 'bat';
      bat.innerHTML = `linterna <i><s style="width:${Flashlight.battery.toFixed(0)}%"></s></i> ${Flashlight.battery.toFixed(0)}%`;
      info.appendChild(bat);
    } else {
      list.classList.add('notes');
      if (!Notes.found.length) info.innerHTML = '<p class="dim">Aún no has encontrado ninguna nota.</p>';
      for (const id of Notes.found) {
        const n = NOTES[id], el = document.createElement('button'); el.className = 'noteRow'; el.innerHTML = `${n.title}<span>${n.place}</span>`;
        el.addEventListener('click', () => { Game.closeUI(true); Notes.read(id, true); });
        list.appendChild(el);
      }
    }
    list.classList.toggle('notes', this.tab === 'notes');
  },
};
function bindGameplayUI() {
  document.querySelectorAll('#inv [data-tab]').forEach((b) => b.addEventListener('click', () => { Inventory.tab = b.dataset.tab; Inventory.render(); }));
  for (const id of ['invClose', 'noteClose']) $(id).addEventListener('click', (e) => { e.stopPropagation(); Game.closeUI(); });
  $('noteView').addEventListener('click', (e) => { if (e.target.id === 'noteView') Game.closeUI(); });
  Keypad.bind();
}
