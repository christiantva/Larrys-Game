import * as THREE from 'three';

/* =====================================================================
   CONFIG — constantes fáciles de tocar
   ===================================================================== */
const CONFIG = {
  // --- Jugador ---
  WALK_SPEED: 1.45,        // m/s caminando
  RUN_SPEED: 2.9,          // m/s corriendo (Shift)
  CROUCH_SPEED: 0.75,      // m/s agachado (C)
  STAIR_SPEED: 0.62,       // multiplicador de velocidad en escaleras
  EYE_HEIGHT: 1.6,         // altura de los ojos de pie
  CROUCH_EYE: 1.0,         // altura de los ojos agachado
  PLAYER_RADIUS: 0.28,
  MOUSE_SENS: 0.0022,      // radianes por píxel (se multiplica por la sensibilidad del menú)
  TOUCH_LOOK: 1.7,         // multiplicador al mirar arrastrando el dedo (móvil)
  MIN_HFOV: 62,            // campo de visión horizontal mínimo (pantallas verticales)
  HEADBOB: 0.026,          // amplitud vertical del balanceo de cámara
  STEP_WALK: 0.74,         // metros por paso caminando
  STEP_RUN: 1.05,          // metros por paso corriendo
  STEP_CROUCH: 0.55,
  INTERACT_DIST: 2.2,      // alcance de la tecla E
  // --- Visual ---
  FOV: 70,
  FOG_MULT: 1.0,           // multiplicador global de la niebla
  GRAIN: 0.07,             // grano de película
  VIGNETTE: 0.9,           // viñeteado
  CHROMATIC: 0.0022,       // aberración cromática
  EXPOSURE: 1.45,          // exposición base (el brillo del menú la multiplica)
  FADE_TIME: 0.75,         // segundos del fundido a negro entre zonas
  FLICKER_MIN: 16,         // segundos mínimos entre parpadeos de luces
  FLICKER_MAX: 50,
  FLASH_INTENSITY: 9,      // linterna (candelas)
  FLASH_RANGE: 16,
  FLASH_LAG: 9,            // cuanto más alto, menos retraso al seguir la cámara
  DYNAMIC_RES: true,       // baja la resolución interna sola si los fps caen por debajo de ~40
  // --- Audio ---
  MASTER: 0.9,
  HUM_VOLUME: 1.0,         // zumbido de fluorescentes
  FOOTSTEP_VOLUME: 0.75,
  AMBIENT_MULT: 1.0,       // resto de ambientes
  REVERB_MULT: 1.0,
  MUSIC_LEVEL: 0.085,      // nivel de la música opcional (se mezcla con el ambiente, sin dominarlo)
  SILENCE_MIN: 90,         // segundos entre "momentos de silencio" (mín./máx.)
  SILENCE_MAX: 170,
};

const DEBUG = /[?&]debug/.test(location.search);

