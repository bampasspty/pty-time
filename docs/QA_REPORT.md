# QA REPORT · PTY Time v1.0.0 (release pública · Fases 1-4)

Fecha: 2026-11-08 · Navegador: Microsoft Edge headless (Playwright `playwright-core`),
Windows. Servidor local: Vite 7 en `http://127.0.0.1:5173`. Producción:
**https://pty-time.vercel.app**.

Alcance: primer bloque de la Fase 3 — 4 armas nuevas con munición propia, armas recogibles
en el mapa, progresión con XP y niveles, HUD actualizado y guardado v4.

## 1. Pruebas automáticas (`node --test "tests/*.test.js"`)

Resultado: **93/93 pruebas pasan**.

| Archivo | Pruebas | Cobertura |
|---|---|---|
| `tests/weapons.test.js` | 9 | catálogo de 6 armas, munición por arma, perdigones, arsenal, ciclado, vida extra |
| `tests/progression.test.js` | 8 | XP, niveles, bonificaciones, normalización y guardado |
| `tests/save.test.js` | 12 | ida/vuelta v4, migraciones v1/v2/v3 → v4, armas, progresión, corrupción |
| `tests/mission.test.js` | 11 | mandado, crimen, Capítulo III, recompensas, marcadores |
| `tests/enemyAI.test.js` | 14 | matones y zombis, línea de visión, cooldown, alerta, mirada |
| `tests/combat.test.js` | 9 | cadencia, cargador, recarga, cuerpo a cuerpo, daño/muerte |
| `tests/dialogues.test.js` | 8 | todos los NPCs y combinaciones de contexto sin romperse |
| `tests/inventory.test.js` | 7 | pilas, capacidad, uso, sanitización |
| `tests/map.test.js` | 8 | dimensiones, kinds, NPCs, zonas, zombis, suministros y armas |
| `tests/assets.test.js` | 7 | 73 PNG, personajes, infectado, suministros y armas 16×16 |

## 2. QA E2E de combate + Fase 3 (`tools/qa-combat.mjs`)

Resultado: **35/35 comprobaciones pasan, 0 errores de consola/página**.

- HUD con vida, munición, nivel, armas y mochila; 4 matones y línea de visión.
- Disparo, impacto, recarga y ciclado de armas.
- **4 armas repartidas** en el mapa; recoger el subfusil lo suma al arsenal (3 armas).
- **La recortada dispara 5 perdigones** por disparo y gasta 1 bala de escopeta.
- Mandado y misión criminal completos; el colapso arranca solo y aparecen 10 infectados
  y 5 suministros.
- KO y reaparición con la vida máxima del nivel actual.
- Capítulo III completo: 5 infectados → fonda → mundo en apocalipsis.
- Inventario: recoger suministro y usar vendaje.
- **Progresión**: tras misiones y bajas sube a nivel 3, con 120 de vida máxima y el HUD
  sincronizado.
- **Guardado v4**: armas en propiedad, progresión, armas recogidas, fase e inventario.
- Móvil táctil: FUEGO, R, ARMA y MOCHILA visibles y funcionando por toque.
- **59–60 FPS** en escritorio (modo desarrollo).

## 3. QA E2E de regresión (`tools/qa-final.mjs`)

Resultado: **20/20 comprobaciones pasan, 0 errores**.

- Título, pantalla de Calito, intro cerrada, misión del mandado paso a paso.
- Simulacro completo con disclaimer y fuente SINAPROC; CONTINUAR restaura el guardado.
- **53.4 FPS** a 1280×720.
- Móvil retrato y horizontal: joystick, HABLAR, diálogos y modales caben con el HUD nuevo.

## 4. QA de producción (`tools/qa-prod.mjs`)

Resultado: **12/12 comprobaciones pasan, 0 errores de consola**, contra la URL pública.

- Producción sirve la build v0.5 (`index-SFuLZVbb.js`) con footer `DEMO v0.5`.
- Intro narrativa, Calito y 4 matones; HUD con nivel y armas.
- Línea de visión, 4 armas en el mapa y disparo funcionando.
- Gama baja emulada: 844×390 táctil con CPU limitada 4×, jugable.

## 5. Rendimiento

| Entorno | FPS |
|---|---|
| Producción 1280×720 | 49–58 |
| Local 1280×720 (armas + colapso) | 53–60 |
| Local 844×390 (móvil horizontal) | 50–57 |

- Assets: **47.4 KB** en 73 PNG (+4 iconos de arma).
- Bundle: **1,354.73 KB** (377.38 KB gzip).
- Sin coste extra de IA: los proyectiles y efectos se generan en memoria.

## 6. Capturas (`qa/`, ignorado por git)

- `prod-title.png`, `prod-intro.png`, `prod-combat.png`, `prod-lowend.png`.
- `combat-colapso.png`, `combat-pty-alerta.png`, `combat-ko.png`, `combat-mobile.png`.
- Capturas de regresión: `final-desktop-*.png`, `final-mobile-*.png`.

## 7. Decisiones y riesgos conocidos

1. **Armas por progresión**: el jugador empieza con puño y pistola; subfusil, escopeta,
   rifle y tubo se recogen en el mapa. No hay compra ni crafting todavía.
2. **Progresión lineal** por XP: +10 de vida y +5 % de daño por nivel, sin árbol de
   habilidades (queda para el resto de la Fase 3).
3. La fabricación y el hambre/resistencia siguen pendientes.
4. Sin audio; falta probar en teléfono físico.
5. Un solo tipo de zombi y un solo mapa.
