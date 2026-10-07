/* =====================================================================
   GUARDADO — automático (al cambiar de zona, recoger algo, leer una nota...)
   ===================================================================== */
const SAVE_KEY = 'shuden-go-save-v1';
const Save = {
  exists() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },
  write() {
    if (!Game.started || Game.ending || Game.state === 'menu' || !Zones.current) return;
    const d = { v: 1, zone: Zones.current.id, spawn: Game.spawn, flags: { ...Flags }, inv: Inv.items, battery: +Flashlight.battery.toFixed(1),
      notes: Notes.found, tension: +Sanity.t.toFixed(2), done: Scares.done, at: Date.now() };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ }
  },
  load() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && d.v === 1 ? d : null; } catch (e) { return null; } },
  clear() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* nada */ } },
};
