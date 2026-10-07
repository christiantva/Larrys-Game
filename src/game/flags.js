/* =====================================================================
   ATAJOS — puertas y persianas que se desbloquean al recorrer el mapa (solo esta sesión)
   ===================================================================== */
const Flags = {};
const condOk = (c) => !c || !!Flags[c.flag] === c.state;
function setFlag(f) { Flags[f] = true; for (const z of Zones.cache.values()) z.refreshVariants(); }


