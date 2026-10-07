/* =====================================================================
   ATAJOS — puertas y persianas que se desbloquean al recorrer el mapa (solo esta sesión)
   ===================================================================== */
const Flags = {};
// c = { flag, state } o una lista de ellas (todas deben cumplirse)
const condOk = (c) => !c || (Array.isArray(c) ? c.every(condOk) : !!Flags[c.flag] === c.state);
const condKey = (c) => (!c ? '' : Array.isArray(c) ? c.map(condKey).join('&') : c.flag + ':' + c.state);
function setFlag(f) { Flags[f] = true; for (const z of Zones.cache.values()) z.refreshVariants(); }


