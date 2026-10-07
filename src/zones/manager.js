/* =====================================================================
   GESTOR DE ZONAS — solo la zona actual y las adyacentes viven en memoria
   ===================================================================== */
// Grafo del recorrido (semilineal). [zona, atajo]: vecina solo si el atajo ya está abierto
const ZONE_DEFS = {
  z1: { build: buildZone1, adj: ['z2', ['z7', 'steel']] },
  z2: { build: buildZone2, adj: ['z1', 'z3', ['z5', 'svcDoor']] },
  z3: { build: buildZone3, adj: ['z2', 'z4', ['z6', 'arcade']] },
  z4: { build: buildZone4, adj: ['z3', 'z5'] },
  z5: { build: buildZone5, adj: ['z4', 'z6', ['z2', 'svcDoor']] },
  z6: { build: buildZone6, adj: ['z5', 'z7', ['z3', 'arcade']] },
  z7: { build: buildZone7, adj: ['z6', ['z1', 'steel']] },
};
const adjOf = (id) => ZONE_DEFS[id].adj.filter((a) => typeof a === 'string' || Flags[a[1]]).map((a) => (typeof a === 'string' ? a : a[0])).filter((a) => ZONE_DEFS[a]);
const Zones = {
  cache: new Map(), current: null,
  get(id) {
    if (!this.cache.has(id)) {
      const t0 = performance.now();
      const ctx = ZONE_DEFS[id].build(), t1 = performance.now();
      const z = ctx.finalize();
      this.cache.set(id, z);
      if (DEBUG) console.log(`[zona] ${id} construida en ${(performance.now() - t0).toFixed(0)} ms (geometría+texturas ${(t1 - t0).toFixed(0)} ms, horneado ${(performance.now() - t1).toFixed(0)} ms)`);
    }
    return this.cache.get(id);
  },
  activate(id, spawnName) {
    if (this.current && this.current.id !== id) this.current.deactivate();
    const z = this.get(id);
    if (this.current !== z || !z.active) z.activate();
    this.current = z;
    if (spawnName && z.spawns[spawnName]) Player.place(z.spawns[spawnName], z);
    this.prune();
    return z;
  },
  // Construye las zonas vecinas y precompila sus shaders. Se llama con la pantalla
  // en negro (carga inicial y fundidos) para que nunca haya tirones al caminar.
  prebuild() {
    if (!this.current) return;
    for (const id of adjOf(this.current.id)) {
      if (!ZONE_DEFS[id] || this.cache.has(id)) continue;
      const z = this.get(id);
      try { World.renderer.compile(z.group, World.camera, World.scene); } catch (e) { /* opcional */ }
    }
  },
  // Libera (dispose) las zonas que no son la actual ni adyacentes
  prune() {
    const keep = new Set([this.current.id, ...adjOf(this.current.id)]);
    let freed = false;
    for (const [id, z] of this.cache) if (!keep.has(id)) { if (z.active) z.deactivate(); z.dispose(); this.cache.delete(id); freed = true; if (DEBUG) console.log('[zona] liberada', id); }
    if (freed) gcShared();
  },
  // Reconstruye todo (cambio de calidad: cambia qué luces son reales y cuáles horneadas)
  rebuild() {
    if (!this.current) return;
    const id = this.current.id; this.current.deactivate();
    for (const z of this.cache.values()) z.dispose();
    this.cache.clear(); this.current = null;
    this.activate(id, null);
  },
};

// Libera materiales y texturas compartidos que ya no usa ninguna zona en memoria
function gcShared() {
  const used = new Set(); for (const z of Zones.cache.values()) for (const k of z.matKeys) used.add(k);
  for (const k of Object.keys(MATS)) if (!used.has(k)) { MATS[k].dispose(); delete MATS[k]; }
  const live = new Set(); for (const m of Object.values(MATS)) { if (m.map) live.add(m.map); if (m.bumpMap) live.add(m.bumpMap); }
  for (const [k, t] of Object.entries(TEX)) if (k !== 'streak' && !live.has(t)) { t.dispose(); delete TEX[k]; }
}

