# QA REPORT · PTY Time v0.1.0

Fecha: 2026-11-06 · Navegador usado: Microsoft Edge headless (Playwright
`playwright-core`), Windows. Servidor: Vite 7 en `http://127.0.0.1:5173`.

## 1. Pruebas automáticas (`pnpm test`)

Resultado: **24/24 pruebas pasan** con `node --test`.

| Archivo | Cobertura |
|---|---|
| `tests/mission.test.js` | flujo completo, acciones fuera de orden, chancleta, simulacro, guardado |
| `tests/dialogues.test.js` | 8 NPCs × 6 pasos × hasChancla × drillUnlocked; acciones exactas; NPC desconocido |
| `tests/save.test.js` | ida/vuelta localStorage, sanitización, JSON corrupto, coherencia |
| `tests/map.test.js` | dimensiones, kinds, 8 NPCs, chancleta, zonas abiertas, ground rects, cámara |
| `tests/assets.test.js` | 63 PNG presentes y con tamaños exactos según `defs.js`/contrato; peso total |

## 2. Pruebas E2E de juego (`tools/qa-final.mjs`)

Resultado: **20/20 comprobaciones pasan, 0 errores de consola/página**.

### Escritorio 1280×720

- Pantalla de título y creación de personaje.
- FPS medidos: **52.2 FPS** (`actualFps`, 121 frames en 2 s) con el mapa completo.
- Misión: Nena → Pipe → chancleta → Pipe → Nena:
  - `inactive → find-pipe → find-chancla → return-pipe → report-nena → done`.
  - Chancleta visible durante `find-chancla`; se recoge; Pipe la recibe.
  - Recompensa: +25 yapa y `drillUnlocked=true`.
- Modal de misión completada abre, oculta HUD, el clic en SEGUIR lo cierra y aparece
  el botón SIMULACRO.
- Simulacro:
  - intro con disclaimer textual exacto;
  - fases reales cubrirse → sujetarse → evacuar;
  - zona segura (cancha) detectada;
  - resultado con recomendaciones, disclaimer y fuente SINAPROC;
  - `drillCompleted=true`.
- Recarga de página: el título ofrece CONTINUAR y restaura paso `done`, 25 de yapa,
  simulacro desbloqueado y variante del personaje.

### Móvil retrato 390×844 (táctil)

- Título: tagline cabe en pantalla (289 px de ancho en 390 px).
- Personaje: controles y botón "ENTRAR AL BARRIO" visibles.
- Juego: joystick visible, banner SAN MIGUELITO escalado (277 px en 390 px).
- HUD no choca con el botón SIMULACRO (`hudRight=208`, `drillLeft=260`).
- Botón contextual HABLAR aparece y, al tocarlo con el mouse, abre el diálogo.
- Sin errores de página.

### Móvil horizontal 844×390

- Modal largo de resultado del simulacro cabe dentro de la pantalla
  (`top=8`, `bottom=382`, `screenH=390`); contenido y botón ENTENDIDO visibles.
- Fases del simulacro completadas y modal abierto.

## 3. Rendimiento

Medido con Edge headless + GPU (`--enable-gpu --ignore-gpu-blocklist`):

| Viewport | FPS |
|---|---|
| 1280×720 | 52.2 |
| 844×390 | 50–57 (mediciones sucesivas) |

Notas:

- Con SwiftShader (sin GPU) bajó a 11–12 FPS, como era de esperar por renderizado
  software; no es representativo de un teléfono con WebGL.
- Assets 42.5 KB; bundle JS 1.30 MB (≈360 KB gzip). Un tilemap de suelo y ~200 sprites.
- Falta la validación en un dispositivo físico de gama baja.

## 4. Build de producción y preview

- `pnpm build` → **exit 0**. Salida: `dist/index.html` 2.11 KB, JS 1,300.31 KB
  (gzip 360.42 KB).
- `pnpm preview --port 4173` + Edge: 0 errores de consola, 0 respuestas 404,
  74 texturas en título y 88 en juego, 8 NPCs, 149 colliders, 49 FPS a 1280×720.
- El build se sirve desde `dist/` con rutas absolutas de assets (`/assets/...`), listo
  para raíz de dominio en Vercel.

## 5. Criterios del MVP (documento maestro)

| Criterio | Resultado |
|---|---|
| El juego abre desde enlace web | Local sí (`localhost:5173`); Vercel pendiente por credenciales |
| Se puede jugar desde teléfono | Verificado en emulación táctil; joystick y botones funcionan |
| Personaje se mueve correctamente | Sí (teclado y joystick) |
| Colisiones funcionales | Sí; verificado contra un edificio (se detiene en el borde) |
| Cámara sigue al personaje | Sí; zoom entero 2–4 |
| Tres NPCs interactivos | 8 NPCs interactivos |
| Misión completable | Sí, flujo completo verificado |
| Coherencia visual | Colección generada con paleta, outlines y perspectiva comunes |
| Sin errores críticos | 0 errores en la sesión E2E final |
| Rendimiento aceptable | 50–57 FPS en Edge con GPU; físico pendiente |
| Demo publicada en Vercel | **Pendiente** (sin token/cuenta en el entorno) |

## 6. Capturas

Generadas en `qa/` (ignorado por git):

- `final-desktop-spawn.png`, `final-desktop-dialogue.png`
- `final-desktop-mission.png`, `final-desktop-drill.png`, `final-desktop-drill-result.png`
- `final-mobile-title.png`, `final-mobile-character.png`, `final-mobile-spawn.png`
- `final-landscape-drill-result.png`

## 7. Bloqueos / riesgos

- Publicación Vercel/GitHub: sin credenciales en el entorno.
- Hardware físico de gama baja no probado.
- Sin audio en esta entrega.
- El simulacro no debe presentarse como alerta real: el disclaimer está en intro,
  banner y resultado.
