# 終電後 — after the last train

Juego de terror psicológico en primera persona (navegador, Three.js + Web Audio, cero assets externos).

## Jugar
- **PC:** abre `index.html` con doble clic (Chrome, Edge o Firefox). La primera vez necesita internet para cargar Three.js.
- **Celular:** ábrelo desde una dirección web (por ejemplo GitHub Pages).

## Cómo se juega
Te has quedado dormido en el último tren (0:42) y te despiertas en una estación cerrada. No hay enemigos ni armas:
el miedo viene de la oscuridad, los sonidos y lo que cambia cuando no miras.

| PC | Móvil | Acción |
|---|---|---|
| WASD + ratón | joystick izquierdo + arrastrar a la derecha | moverse / mirar |
| Shift · C | botones | correr · agacharse |
| F | botón linterna | linterna (gasta pilas) |
| R | inventario → Usar | cambiar las pilas |
| E | tocar lo que miras | interactuar / recoger / leer |
| Tab / I | botón mochila | inventario y notas |
| Esc | botón pausa | pausa |

- **Linterna y tensión:** a oscuras y sin linterna la tensión sube (latido, susurros, imagen deformada, visiones).
  Las pilas son escasas: hay que decidir cuándo encenderla.
- **Puzles:** monedas → billete → torniquetes → llave → fusible → clave → tenaza del revisor. Las notas dan las pistas.
- **Guardado automático** al cambiar de zona, recoger objetos o leer notas. «Continuar» en el menú.

## Estructura del código
`index.html` **se genera** a partir de `src/` — no lo edites a mano.

```
src/
  core/      configuración (CONFIG), utilidades, ajustes guardados
  render/    texturas procedurales, materiales, geometría, luz horneada, post-procesado, partículas
  audio/     motor de audio, emisores de ambiente, sonidos de terror, música, silencio dinámico
  player/    teclado/ratón, controles táctiles, jugador, linterna
  gameplay/  objetos, inventario, notas, teclado numérico, tensión, sustos, guardado, final
  zones/     constructor de zonas, las 7 zonas, gestor de carga, carteles y texturas por zona
  game/      estados del juego, bucle principal, arranque
  ui/        menús de opciones y HUD mínimo
  styles/    CSS
  page/      plantilla HTML
build.mjs    une todo en index.html
```

Los archivos de `src/` comparten un mismo ámbito y se concatenan en el orden de `build.mjs`.

## Compilar
```
node build.mjs          # genera index.html
node build.mjs --check  # comprueba que index.html está al día
```
