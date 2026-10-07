// =====================================================================
// build.mjs — une el código de src/ en un único index.html jugable
// (doble clic en PC o abrir desde una web en el celular).
//
//   node build.mjs          → genera index.html
//   node build.mjs --check  → comprueba que index.html está al día
//
// Los archivos de src/ comparten un mismo ámbito (se concatenan dentro de un
// único <script type="module">), por eso el ORDEN de esta lista importa:
// cada archivo puede usar lo que definieron los anteriores.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');

export const ORDER = [
  // --- núcleo: configuración, utilidades, ajustes guardados ---
  'core/config.js',
  'core/utils.js',
  'core/settings.js',
  // --- render: texturas procedurales, materiales ---
  'render/textures.js',
  'render/sign-helpers.js',
  'render/materials.js',
  'zones/assets/textures-z6-z7.js',
  'game/flags.js',
  'zones/assets/textures-z3-z5.js',
  // --- render: geometría, luz horneada, efectos ---
  'render/batch.js',
  'render/bake.js',
  'render/effects.js',
  // --- zonas: constructor y ejecución ---
  'zones/zone-builder.js',
  'zones/zone-runtime.js',
  // --- audio ---
  'audio/audio-core.js',
  'audio/audio-extra.js',
  'audio/audio-horror.js',
  'audio/music.js',
  'audio/silence.js',
  // --- mundo, post-procesado, entrada, jugador ---
  'render/world.js',
  'render/postfx.js',
  'render/particles.js',
  'player/input.js',
  'player/touch.js',
  'player/player.js',
  'player/flashlight.js',
  // --- jugabilidad: inventario, notas, tensión, sustos, anomalías, guardado ---
  'gameplay/items.js',
  'gameplay/inventory.js',
  'gameplay/notes.js',
  'gameplay/keypad.js',
  'gameplay/sanity.js',
  'gameplay/scares.js',
  'gameplay/stair-loop.js',
  'gameplay/save.js',
  'gameplay/ending.js',
  // --- carteles y props ---
  'zones/assets/signs.js',
  'zones/assets/signs-z3-z5.js',
  'zones/assets/signs-z6-z7.js',
  'zones/assets/signs-horror.js',
  'zones/props.js',
  // --- las 7 zonas ---
  'zones/z1-exterior.js',
  'zones/z2-escalera.js',
  'zones/z3-vestibulo.js',
  'zones/z4-anden.js',
  'zones/z5-tunel.js',
  'zones/z6-galeria.js',
  'zones/z7-atrio.js',
  'zones/manager.js',
  // --- juego: estados, menús, bucle, arranque ---
  'game/game.js',
  'ui/options.js',
  'ui/hud.js',
  'game/loop.js',
  'game/boot.js',
];
export const STYLES = ['styles/main.css', 'styles/gameplay.css'];
export const BODY = ['page/body.html', 'page/gameplay.html'];

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(SRC, p));

export function build({ banners = true } = {}) {
  const tmpl = read('page/template.html');
  const join = (list, banner) => list.filter(exists).map((f) => (banners && banner ? banner(f) : '') + read(f).replace(/\n$/, '')).join('\n');
  const css = join(STYLES, (f) => `/* ---- src/${f} ---- */\n`);
  const body = join(BODY, (f) => `<!-- ---- src/${f} ---- -->\n`);
  const js = join(ORDER, (f) => `// ==== src/${f} ====\n`);
  return tmpl.replace('/*@CSS@*/', () => css).replace('<!--@BODY@-->', () => body).replace('//@JS@', () => js);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const missing = [...ORDER, ...STYLES, ...BODY].filter((f) => !exists(f));
  const out = build({ banners: !process.argv.includes('--plain') });
  const target = path.join(ROOT, 'index.html');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (cur !== out) { console.error('index.html NO está al día: ejecuta  node build.mjs'); process.exit(1); }
    console.log('index.html al día.');
  } else {
    fs.writeFileSync(target, out);
    console.log(`index.html generado (${(out.length / 1024).toFixed(0)} KB)` + (missing.length ? ` · aún no existen: ${missing.join(', ')}` : ''));
  }
}
