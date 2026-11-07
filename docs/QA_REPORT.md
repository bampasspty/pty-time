# QA REPORT · PTY Time v0.2.0 (Slice A)

Fecha: 2026-11-07 · Navegador: Microsoft Edge headless (Playwright `playwright-core`),
Windows. Servidor: Vite 7 en `http://127.0.0.1:5173`.

Alcance de esta entrega: **núcleo jugable del Slice A** — combate, matones con IA, misión
criminal, vida/munición, guardado v2 y controles táctiles de disparo.

## 1. Pruebas automáticas (`node --test "tests/*.test.js"`)

Resultado: **52/52 pruebas pasan**.

| Archivo | Pruebas | Cobertura |
|---|---|---|
| `tests/mission.test.js` | 8 | mandado completo, desbloqueo de la misión criminal, conteo de enemigos, recompensas, marcador de NPC, acciones fuera de orden |
| `tests/dialogues.test.js` | 7 | 8 NPCs × 6 pasos × 5 pasos criminales; acciones exactas; contexto inválido |
| `tests/save.test.js` | 9 | ida/vuelta v2, **migración v1 → v2**, sanitización, JSON corrupto, `hasProgress` |
| `tests/combat.test.js` | 9 | cadencia, cargador, recarga, arma cuerpo a cuerpo, daño/muerte/reaparición, ida y vuelta al guardado |
| `tests/enemyAI.test.js` | 8 | estados idle → chase → attack → dead, cooldown de ataque, alerta por ruido, mirada, datos de enemigos |
| `tests/map.test.js` | 6 | dimensiones, kinds, NPCs, chancleta, zonas, **spawns de matones** |
| `tests/assets.test.js` | 5 | 65 PNG, hojas de personaje y **enemigos 48×96**, retratos, edificios/props, presupuesto |

## 2. QA E2E de combate (`tools/qa-combat.mjs`)

Resultado: **18/18 comprobaciones pasan, 0 errores de consola/página**.

- Spawn de 4 matones y HUD con vida (100) y munición (8/24).
- Disparo: consume munición, la bala golpea al matón y el HUD se actualiza.
- Recarga manual (`R` / botón): el cargador vuelve a 8 y baja la reserva.
- Mandado de Doña Nena completo → +25 de yapa y simulacro desbloqueado.
- La misión criminal se abre al terminar el mandado; `startCrime` revive a los 4 matones.
- Tres matones derrotados → contador `3/3` → paso `report`.
- `reportCrime` → +60 de yapa, +10 de reputación y modal de misión completada.
- Vida a 0 → modal **TE TUMBARON** → REAPARECER restaura vida completa.
- Guardado v2 en `localStorage`: versión 2, misiones `done`, 85 de yapa, 3 derrotas.
- Móvil táctil 844×390: botones FUEGO y R visibles junto al joystick.
- Rendimiento: **59 FPS** en escritorio durante el combate.

## 3. QA E2E de regresión (`tools/qa-final.mjs`)

Resultado: **20/20 comprobaciones pasan, 0 errores**. La demo anterior sigue funcionando:

- Título, creación de personaje, FPS (59.1 tras calentar el primer frame).
- Misión del mandado paso a paso con la API nueva de misiones.
- Modal de recompensa, desbloqueo del simulacro y simulacro completo (cubrirse →
  sujetarse → evacuar) con disclaimer y fuente SINAPROC.
- CONTINUAR restaura misión `done`, 25 de yapa y simulacro desde el guardado v2.
- Móvil retrato: joystick, banners, HABLAR y diálogos.
- Móvil horizontal: el modal largo del simulacro cabe en 390 px de alto.

## 4. Rendimiento

| Viewport | FPS |
|---|---|
| 1280×720 (con 4 matones y combate) | 51–59 |
| 844×390 (móvil horizontal) | 50–57 |

- Assets de juego: **44.9 KB** en 65 PNG (2 hojas nuevas de enemigo).
- Bundle de producción: **1,329.32 KB** (369.58 KB gzip).
- Efectos de combate por texturas en memoria (sin PNG extra).
- Sigue pendiente la validación en un teléfono físico de gama baja.

## 5. Build de producción

- `pnpm build` → OK. `dist/index.html` 2.11 KB, JS 1,329.32 KB (gzip 369.58 KB).
- **La URL pública https://pty-time.vercel.app sigue sirviendo la v0.1.0**: esta entrega
  está confirmada en local y queda lista para desplegar (`pnpm deploy:vercel` o push).

## 6. Capturas (`qa/`, ignorado por git)

- `combat-map.png` — HUD con vida/munición al entrar al barrio.
- `combat-crime.png` — matones en la plaza de Los Andes y objetivo `report`.
- `combat-ko.png` — modal TE TUMBARON.
- `combat-mobile.png` — botones FUEGO y R en móvil horizontal.
- Capturas de regresión: `final-desktop-*.png`, `final-mobile-*.png`.

## 7. Bloqueos / riesgos conocidos

1. **La IA de matones no evalúa línea de visión**: persiguen aunque haya un edificio en
   medio (la física les impide atravesarlo, pero pueden quedarse empujando).
2. **8 direcciones visuales sigue pendiente**: el movimiento diagonal existe y el
   apuntado es libre, pero las hojas de personaje mantienen 4 filas.
3. Sin audio todavía.
4. El combate se probó en emulación táctil; falta el teléfono físico.
5. Los matones reaparecen al aceptar la misión criminal; no hay respawn durante el juego.
