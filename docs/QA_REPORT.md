# QA REPORT · PTY Time v0.3.0 (Slice A cerrado)

Fecha: 2026-11-07 · Navegador: Microsoft Edge headless (Playwright `playwright-core`),
Windows. Servidor local: Vite 7 en `http://127.0.0.1:5173`. Producción:
**https://pty-time.vercel.app**.

Alcance: cierre del **Slice A** — Calito canónico, combate, matones con IA y línea de
visión, misión criminal, vida/munición, cambio de arma, guardado v2 y controles táctiles.

## 1. Pruebas automáticas (`node --test "tests/*.test.js"`)

Resultado: **55/55 pruebas pasan**.

| Archivo | Pruebas | Cobertura |
|---|---|---|
| `tests/mission.test.js` | 8 | mandado, desbloqueo criminal, conteo de enemigos, recompensas, marcador |
| `tests/dialogues.test.js` | 7 | 8 NPCs × 6 pasos × 5 pasos criminales; acciones exactas; contexto inválido |
| `tests/save.test.js` | 9 | ida/vuelta v2, migración v1 → v2, sanitización, JSON corrupto, `hasProgress` |
| `tests/combat.test.js` | 9 | cadencia, cargador, recarga, cuerpo a cuerpo, daño/muerte/reaparición, guardado |
| `tests/enemyAI.test.js` | 11 | estados, cooldown, alerta por ruido, **línea de visión**, investigación, mirada, datos |
| `tests/map.test.js` | 6 | dimensiones, kinds, NPCs, chancleta, zonas, spawns de matones |
| `tests/assets.test.js` | 5 | 65 PNG, hojas de personaje/enemigos 48×96, retratos, edificios/props |

## 2. QA E2E de combate (`tools/qa-combat.mjs`)

Resultado: **22/22 comprobaciones pasan, 0 errores de consola/página**.

- 4 matones, HUD con vida (100) y munición (8/30).
- Disparo: consume munición, golpea al matón y actualiza el HUD.
- Recarga manual (R / botón) y **cambio de arma** (Q / botón ARMA).
- **Línea de visión**: bloqueada por edificio, libre en la calle.
- Mandado completo → +25 yapa y simulacro; crimen se abre y `startCrime` revive matones.
- 3 matones derrotados → `3/3` → `report`; `reportCrime` → +60 yapa, +10 reputación.
- Vida a 0 → modal TE TUMBARON → reaparición con vida completa.
- Guardado v2: misiones `done`, 85 yapa, 3 derrotas.
- Móvil táctil: botones FUEGO/R/ARMA visibles, **tocar FUEGO dispara** y **tocar ARMA
  cambia de arma**.
- Rendimiento medido en el flujo completo: 42–59 FPS (modo desarrollo, Edge headless GPU).

## 3. QA E2E de regresión (`tools/qa-final.mjs`)

Resultado: **20/20 comprobaciones pasan, 0 errores**.

- Título, pantalla de Calito (apariencia), misión del mandado paso a paso.
- Modal de recompensa, simulacro completo (cubrirse → sujetarse → evacuar) con disclaimer
  y fuente SINAPROC; CONTINUAR restaura el guardado v2.
- **59.2 FPS** a 1280×720 tras calentar el primer frame.
- Móvil retrato y horizontal: joystick, HABLAR, diálogos y modales caben en pantalla.

## 4. QA de producción (`tools/qa-prod.mjs`)

Resultado: **8/8 comprobaciones pasan, 0 errores de consola**, contra la URL pública.

- Producción sirve la build v0.3 (`index-DRaj8FuF.js`).
- Título «Calito, del barrio al apocalipsis», footer `DEMO v0.3`.
- Pantalla CALITO, 4 matones, HUD 8/30, línea de visión y disparo funcionando.
- **58 FPS** en la URL pública.

## 5. Rendimiento

| Entorno | FPS |
|---|---|
| Producción 1280×720 (Vercel) | 58 |
| Local 1280×720 (combate activo) | 42–59 |
| Local 844×390 (móvil horizontal) | 50–57 |

- Assets: **44.9 KB** en 65 PNG (2 hojas de enemigo; efectos de combate en memoria).
- Bundle: **1,330.79 KB** (370.17 KB gzip).
- La línea de visión se cachea 120 ms por enemigo para no castigar móviles.
- Sigue pendiente la validación en un teléfono físico de gama baja.

## 6. Capturas (`qa/`, ignorado por git)

- `prod-title.png`, `prod-combat.png` — verificación de producción.
- `combat-map.png`, `combat-crime.png`, `combat-ko.png`, `combat-mobile.png`.
- Capturas de regresión: `final-desktop-*.png`, `final-mobile-*.png`.

## 7. Decisiones y riesgos conocidos

1. **8 direcciones visuales:** decisión cerrada — 4 filas de animación con dirección
   dominante, movimiento diagonal y apuntado libre. Redibujar diagonales es opcional.
2. La IA usa línea de visión aproximada por muestreo de cuerpos estáticos (no visión
   exacta por geometría); suficiente para el mapa actual.
3. Sin audio.
4. Falta probar en teléfono físico.
5. El Slice B (infección, zombi, inventario y supervivencia) todavía no está implementado.
