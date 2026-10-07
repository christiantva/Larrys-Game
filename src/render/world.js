/* =====================================================================
   MUNDO — renderer, escena, cámara, luces compartidas
   ===================================================================== */
const World = { renderer: null, scene: null, camera: null, lights: [], hemi: null, flash: null, flashTarget: null };
function initWorld() {
  const r = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
  r.setPixelRatio(1);                      // pixelRatio limitado a 1
  r.setSize(innerWidth, innerHeight);
  r.shadowMap.enabled = false;             // sin sombras (luz horneada)
  r.info.autoReset = false;
  document.body.prepend(r.domElement);
  MAX_ANISO = Math.min(4, r.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.05); scene.background = new THREE.Color(0, 0, 0);
  const cam = new THREE.PerspectiveCamera(CONFIG.FOV, innerWidth / innerHeight, 0.05, Q.far);
  cam.rotation.order = 'YXZ';
  // Pool fijo de 3 luces puntuales reales (cantidad constante = sin recompilar shaders al cambiar de zona)
  const lights = [0, 1, 2].map(() => { const L = new THREE.PointLight(0xffffff, 0, 10, 2); scene.add(L); return L; });
  const hemi = new THREE.HemisphereLight(0x202a38, 0x08090a, 0.2); scene.add(hemi);
  // Linterna
  const flash = new THREE.SpotLight(0xfff0d8, 0, CONFIG.FLASH_RANGE, 0.42, 0.6, 2);
  const flashTarget = new THREE.Object3D(); flash.target = flashTarget; scene.add(flash, flashTarget);
  // sombras de la linterna (solo en calidad alta; el mapa se actualiza solo con la linterna encendida)
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  flash.shadow.mapSize.set(1024, 1024); flash.shadow.camera.near = 0.15; flash.shadow.camera.far = CONFIG.FLASH_RANGE; flash.shadow.bias = -0.0004; flash.shadow.normalBias = 0.03;
  Object.assign(World, { renderer: r, scene, camera: cam, lights, hemi, flash, flashTarget });
}

