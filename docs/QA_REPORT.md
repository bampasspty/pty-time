# QA REPORT · PTY Time v0.4.0 (Slice B · MVP cerrado)

Fecha: 2026-11-07 · Navegador: Microsoft Edge headless (Playwright `playwright-core`),
Windows. Servidor local: Vite 7 en `http://127.0.0.1:5173`. Producción:
**https://pty-time.vercel.app**.

Alcance: cierre del MVP — introducción narrativa, colapso con PTY Alerta, infectados,
Capítulo III, inventario básico, suministros y guardado v3.

## 1. Pruebas automáticas (`node --test "tests/*.test.js"`)

Resultado: **73/73 pruebas pasan**.

| Archivo | Pruebas | Cobertura |
|---|---|---|
| `tests/mission.test.js` | 11 | mandado, crimen, **Capítulo III**, recompensas, marcadores |
| `tests/dialogues.test.js` | 8 | 8 NPCs × 6 pasos × 5 criminales × 5 del colapso; acciones; contexto inválido |
| `tests/save.test.js` | 11 | ida/vuelta v3, **migración v1/v2 → v3**, mundo, historia, inventario, corrupción |
| `tests/combat.test.js` | 9 | cadencia, cargador, recarga, cuerpo a cuerpo, daño/muerte/reaparición |
| `tests/enemyAI.test.js` | 11 | matones y **zombis** (sin línea de visión), cooldown, alerta, mirada |
| `tests/inventory.test.js` | 7 | pilas, capacidad, uso, sanitización e ida/vuelta |
| `tests/map.test.js` | 7 | dimensiones, kinds, NPCs, zonas, **spawns de zombis y suministros** |
| `tests/assets.test.js` | 6 | 69 PNG, personajes, **infectado**, objetos de suministro 16×16 |

## 2. QA E2E de combate + Slice B (`tools/qa-combat.mjs`)

Resultado: **30/30 comprobaciones pasan, 0 errores de consola/página**.

- Intro narrativa, 4 matones, HUD con vida/munición/mochila y fase del mundo.
- Disparo, impacto, recarga, cambio de arma y línea de visión.
- Mandado completo → misión criminal → **el colapso arranca solo** tras la recompensa.
- **PTY Alerta** con disclaimer visible y banner **EL COLAPSO**.
- **10 infectados** (8 del mapa + 2 cerca de Calito) y **5 suministros** en el mapa.
- KO y reaparición siguen funcionando con la horda activa.
- Cinco infectados derrotados → paso `refugio`; llegar a la fonda → `done` y mundo en
  `apocalipsis`.
- Recoger un suministro suma al inventario; usar un vendaje cura y gasta el objeto;
  el panel MOCHILA abre con sus botones.
- Guardado v3 en disco: versión 3, misiones `done`, fase `apocalipsis`, banderas de
  historia e inventario presentes.
- Móvil táctil: FUEGO, R, ARMA y **MOCHILA** visibles y funcionando por toque.
- **60 FPS** en escritorio (modo desarrollo).

## 3. QA E2E de regresión (`tools/qa-final.mjs`)

Resultado: **20/20 comprobaciones pasan, 0 errores**.

- Título, pantalla de Calito, intro cerrada, misión del mandado paso a paso.
- Simulacro completo con disclaimer y fuente SINAPROC; CONTINUAR restaura el guardado v3.
- **58.6 FPS** a 1280×720.
- Móvil retrato y horizontal: joystick, HABLAR, diálogos y modales caben en pantalla.

## 4. QA de producción (`tools/qa-prod.mjs`)

Resultado: **10/10 comprobaciones pasan, 0 errores de consola**, contra la URL pública.

- Producción sirve la build v0.4 (`index-uPsAXgjD.js`) con footer `DEMO v0.4`.
- Intro narrativa aparece, se cierra y deja jugar.
- Calito, 4 matones, HUD 8/30, línea de visión y disparo funcionando.
- **Gama baja emulada:** 844×390 táctil con CPU limitada 4×, 10 infectados y suministros
  listos: se mantiene jugable. Aproximación; falta el teléfono físico.

## 5. Rendimiento

| Entorno | FPS |
|---|---|
| Producción 1280×720 | 49–58 |
| Local 1280×720 (combate + colapso) | 57–60 |
| Local 844×390 (móvil horizontal) | 50–57 |

- Assets: **46.6 KB** en 69 PNG.
- Bundle: **1,347.14 KB** (375.06 KB gzip).
- La IA de zombis no calcula línea de visión (leen el mundo por sonido/hambre); la de
  matones se cachea 120 ms por enemigo.

## 6. Capturas (`qa/`, ignorado por git)

- `prod-title.png`, `prod-intro.png`, `prod-combat.png`, `prod-lowend.png`.
- `combat-colapso.png`, `combat-pty-alerta.png`, `combat-ko.png`, `combat-mobile.png`.
- Capturas de regresión: `final-desktop-*.png`, `final-mobile-*.png`.

## 7. Decisiones y riesgos conocidos

1. **8 direcciones visuales:** decisión cerrada — 4 filas con dirección dominante,
   movimiento diagonal y apuntado libre.
2. Las alertas del apocalipsis son ficción con disclaimer visible; no se presentan como
   avisos oficiales y no usan datos reales de emergencia.
3. La horda y los suministros aparecen al caer el colapso; no hay respawn continuo.
4. Sin audio.
5. Falta probar en teléfono físico.
6. Los zombis se apoyan en la IA existente: sin navegación de obstáculos avanzada
   (la física les impide atravesar muros, pero pueden quedarse empujando una pared).
