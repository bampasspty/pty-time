# PTY TIME

Videojuego panameño de **acción y supervivencia zombi** en pixel art 2D con cámara
cenital. Acompaña a **Calito**, un antihéroe de San Miguelito, desde la vida de barrio
hasta el apocalipsis. Pensado para correr en navegador, tanto en computadora como en
teléfono.

> **Nueva dirección creativa (v1.2):** PTY TIME pasa de aventura relajante de exploración
> a **aventura narrativa de supervivencia**, conservando Panamá, sus personajes y su
> identidad cultural. El documento de referencia es
> [`docs/MASTER_DOC.md`](docs/MASTER_DOC.md) y la auditoría de adaptación, con lo que ya
> existe y lo que falta, está en [`docs/V1.2_AUDIT.md`](docs/V1.2_AUDIT.md).

## Estado de la demo actual (v0.4.0 · Slice B y MVP cerrados)

La versión jugable ya cierra el **MVP del Documento Maestro**:

- **Introducción narrativa** de Calito al empezar partida nueva.
- **El colapso (Slice B)**: PTY Alerta ficticia con disclaimer, matones que huyen,
  **horda de infectados**, capítulo **«El colapso»** (sobrevive a 5 y corre a la fonda)
  y mundo en fase apocalipsis.
- **Zombis**: el infectado detecta y persigue sin línea de visión, se alerta con los
  disparos y cada uno camina a distinta velocidad.
- **Inventario básico**: vendajes, latas y cajas de balas, panel MOCHILA con uso de
  objetos y **suministros repartidos por el mapa**.
- **Guardado v3** con mundo, historia e inventario; migra solo desde v1 y v2.
- **Calito como protagonista**: identidad fija; la camisa es cosmética.
- **Combate**: pistola «LA 9» con cargador, reserva, recarga y cadencia; puño cuerpo a
  cuerpo; cambio de arma con `Q` o botón ARMA; apuntado libre.
- **Matones con IA**: 4 enemigos con línea de visión, investigación de la última posición
  conocida y reacción a los disparos.
- **Misión criminal** *Los matones de la plaza* y misión **El mandado de Doña Nena**.
- **Controles táctiles**: joystick, FUEGO, R, ARMA, MOCHILA y HABLAR.

Sigue la base anterior: mapa de San Miguelito, 8 NPCs con diálogos, simulacro de terremoto
con PTY Alerta y guardado local.

> **Dirección visual:** el personaje se mueve en diagonal y apunta libre, pero las hojas
> de animación mantienen **4 filas visuales** (arriba/abajo/izquierda/derecha) con la
> dirección dominante. Es una decisión de producto tomada en la auditoría para no
> redibujar todo el arte; las diagonales quedan como mejora opcional futura.

> **Estado de publicación:** https://pty-time.vercel.app sirve la **v0.4.0**.

> **Evento sísmico:** el simulacro de terremoto es ficción dentro del videojuego. No es
> una alerta real, no se conecta a sistemas de monitoreo y no sustituye información
> oficial. Recomendaciones basadas en [SINAPROC](https://www.sinaproc.gob.pa/sismos/).

![Pantalla de título](docs/screenshots/title.png)
![Exploración en San Miguelito](docs/screenshots/game.png)
![Diálogo con Doña Nena](docs/screenshots/dialogue.png)
![Simulacro de terremoto](docs/screenshots/drill.png)
![Vista móvil](docs/screenshots/mobile.png)

## Demo publicada

- **Jugar:** https://pty-time.vercel.app (v0.4.0)
- **Repositorio:** https://github.com/bampasspty/pty-time

Desplegada en Vercel (proyecto `pty-time`). Verificación automatizada contra la URL
pública: HTTP 200, 10/10 comprobaciones (`tools/qa-prod.mjs`), 0 errores de consola,
56–58 FPS en Edge headless y 56 FPS en gama baja emulada (CPU 4×, 844×390 táctil).

## Estado

Demo jugable con el **MVP cerrado** (Slices A y B). Incluye:

- Pantalla de inicio, ayuda y apariencia de Calito (camisa cosmética).
- **Calito** controlable, con animación de caminar y profundidad; movimiento diagonal.
- **Introducción narrativa** y **el colapso** con PTY Alerta ficticia y disclaimer.
- Mapa de San Miguelito de 64 × 44 tiles: avenida, calle Los Andes, aceras, escaleras,
  cancha, fonda, minisúper, metro, parada, escuela, casas y apartamentos.
- Colisiones con edificios, mobiliario y límites del mundo; cámara que sigue al jugador.
- 8 NPCs con diálogos propios y paseo ligero.
- Misión **El mandado de Doña Nena** con 5 pasos y recompensa.
- Misión criminal **Los matones de la plaza** con combatientes y recompensa.
- **Capítulo III · El colapso**: sobrevive a los infectados y llega a la fonda.
- Combate cenital con pistola, puño, munición, recarga y enemigos con IA.
- **Horda de zombis** (infectados) con IA propia y suministros en el mapa.
- **Inventario básico** con panel MOCHILA, vendajes, latas y cajas de balas.
- Vida, daño, KO y reaparición; barra de vida y munición en el HUD.
- Guardado automático **v3** en `localStorage` (migra v1 y v2) y opción CONTINUAR.
- Simulacro de terremoto desbloqueable con advertencia visible y recomendaciones
  educativas.
- HUD de misión, yapa, munición y mochila; ayuda, controles táctiles y toasts.
- Assets de pixel art generados por código (69 PNG, 46.6 KB) y fuente Press Start 2P.

## Requisitos

- Node.js **20.19 o superior** (probado con Node 24.21).
- pnpm **11.x** (el repo fija `packageManager: pnpm@11.28.5`).
- Para regenerar arte: Python 3.12 + Pillow 12 (solo desarrollo).

## Ejecutar en local

```bash
pnpm install
pnpm dev
```

Abrir **http://localhost:5173/**.

```bash
pnpm build      # build de producción en dist/
pnpm preview    # sirve dist/ en http://localhost:4173/
pnpm test       # pruebas unitarias y de assets (node:test)
```

## Controles

| Acción | Computadora | Teléfono |
|---|---|---|
| Caminar | WASD o flechas | Joystick virtual (abajo-izquierda) |
| Apuntar | Ratón | Automático al matón más cercano |
| Disparar | Clic izquierdo o J | Botón FUEGO |
| Recargar | R | Botón R |
| Cambiar arma | Q | Botón ARMA |
| Mochila | I o TAB | Botón MOCHILA |
| Hablar / recoger suministros | E, ESPACIO, ENTER o botón HABLAR | Botón HABLAR |
| Agacharse / cubrirse | C o botón CUBRIRSE durante el simulacro | Botón CUBRIRSE |
| Ayuda | ? o ESC | Botón ? |
| Simulacro | Botón SIMULACRO (cuando está desbloqueado) | Botón SIMULACRO |

La estrella amarilla marca al NPC del objetivo actual. El HUD superior muestra la
misión, la vida, el arma con su munición y la yapa acumulada.

## Juego: misiones, combate y simulacro

### El mandado de Doña Nena

1. Habla con **Doña Nena** en la fonda para aceptar el mandado.
2. Busca a **Pipe** en la cancha de San Isidro.
3. Encuentra su **chancleta** cerca de la parada de bus.
4. Devuélvesela a Pipe y vuelve con Nena.
5. Nena te da **25 de yapa** y desbloquea el **simulacro de terremoto**.

### Los matones de la plaza (misión criminal)

1. Al terminar el mandado, **Pipe** te cuenta que unos matones cobran por la plaza de
   Los Andes.
2. Acepta la misión: los 4 matones aparecen en la plaza (esquina suroeste del mapa).
3. Tumba a **3** con la pistola o el puño; el HUD lleva la cuenta.
4. Vuelve con Pipe: **+60 de yapa** y **+10 de reputación** en el barrio.

### El colapso (Capítulo III)

1. Al terminar la misión criminal, el país empieza a caer: aparece **PTY Alerta** (aviso
   ficticio con disclaimer) y el barrio se llena de **infectados**.
2. Sobrevive a **5 infectados**; el HUD lleva la cuenta.
3. Corre a la **fonda de Doña Nena**: al llegar se cierra el capítulo y el mundo queda en
   apocalipsis. El barrio ya no es el mismo.

Durante el colapso aparecen **suministros** (vendajes, latas, cajas de balas) que puedes
recoger con el botón HABLAR y usar desde la **MOCHILA**.

Si te tumban, reapareces en el punto de partida con la vida completa.

Durante el simulacro el juego muestra el aviso:

> Evento simulado dentro del videojuego. No constituye una alerta real ni una advertencia
> de emergencia.

El simulacro pide agacharse/cubrirse, sujetarse y llegar a una zona abierta (cancha o
plaza). Al terminar se muestran recomendaciones basadas en SINAPROC (
[sinaproc.gob.pa/sismos](https://www.sinaproc.gob.pa/sismos/)). No hay predicción de
sismos ni alertas reales.

## Arquitectura

```
src/
├── main.js                 configuración de Phaser y arranque
├── config.js               constantes visuales, cámara, tipografía
├── scenes/
│   ├── BootScene.js        carga de assets, animaciones y texturas de combate
│   ├── TitleScene.js       pantalla de inicio
│   ├── CharacterScene.js   apariencia de Calito
│   ├── GameScene.js        mundo, jugador, NPCs, misiones, combate, colapso e inventario
│   └── UIScene.js          HUD, historia, mochila, diálogos, modales y táctil
├── entities/               Player, NPC, Enemy, Bullet
├── systems/                MissionSystem, CombatSystem, EnemyAI, InventorySystem,
│                           SaveSystem, QuakeDrill, EventBus, InputState
├── world/                  mapa de San Miguelito, defs y MapBuilder
├── ui/                     DialogueBox, Modal, PixelButton, Backdrop
└── data/                   Calito, historia, NPCs, diálogos, misiones, armas,
                            enemigos, zombis, objetos y simulacro
public/assets/              tiles, personajes, enemigos, edificios, props, UI y fuente
tools/generate_assets.py    generador de pixel art (Pillow)
tools/qa-final.mjs          QA E2E de la demo (misión, simulacro, móvil)
tools/qa-combat.mjs         QA E2E del Slice A y B (combate, colapso, inventario)
tools/qa-prod.mjs           verificación de la URL pública de Vercel
tests/                      pruebas node:test (lógica, mapa, assets, combate, IA, inventario)
docs/                       maestro, auditoría, backlog, contratos, assets y QA
```

La lógica de juego pesada es pura y testeable, sin Phaser: `MissionSystem` (registro de
misiones), `CombatSystem` (vida, cargador, cadencia, recarga), `EnemyAI` (matones y
zombis) e `InventorySystem` (pilas y capacidad). `SaveSystem` guarda el esquema v3 y migra
partidas v1/v2. Los diálogos se resuelven con `getDialogue(npcId, ctx)`; `GameScene` aplica
el cambio, actualiza el HUD y guarda.

## Rendimiento

- Phaser 3.90 + Vite 7; bundle de producción ≈ 1.35 MB (≈ 375 KB gzip).
- Assets de juego: **46.6 KB** de 69 PNG.
- Un solo tilemap para el suelo; ~17 edificios, 147 props, 8 NPCs, 4 matones y hasta
  10 infectados.
- Efectos de combate con texturas generadas en memoria y tweens cortos; sin partículas.
- QA automatizado en Edge headless con GPU: **57–60 FPS a 1280 × 720** con combate y
  colapso activos, y **50–57 FPS a 844 × 390** (ver `docs/QA_REPORT.md`). Falta validar
  en un teléfono físico de gama baja.

## Publicación en Vercel

La demo está publicada en **https://pty-time.vercel.app** y el proyecto Vercel está
**conectado a GitHub**: cada push a `main` en
https://github.com/bampasspty/pty-time genera un deployment de producción automático.

`vercel.json` define Vite, `pnpm build`, salida `dist/` y cache de assets. Para volver a
desplegar desde este repo (requiere estar autenticado con una cuenta de Vercel):

```bash
pnpm deploy:vercel
# equivalente: pnpm exec vercel deploy --prod --yes --project pty-time
```

El proyecto quedó vinculado a la cuenta `gestion14`. Para publicar desde otra cuenta,
hay que crear un proyecto nuevo con `vercel login` y `vercel deploy --prod`.

Repositorio de código: **https://github.com/bampasspty/pty-time** (rama `main`).

## Assets y licencias

- Pixel art generado por `tools/generate_assets.py` (determinista) y revisado en
  `tools/asset_sheet.png`. Ver `docs/ASSETS_REPORT.md`.
- Fuente **Press Start 2P** (SIL Open Font License 1.1) en
  `public/assets/ui/PressStart2P-Regular.ttf`; licencia en `public/assets/ui/OFL.txt`.
- Sin assets de terceros con copyright.
- Información educativa del simulacro basada en SINAPROC:
  <https://www.sinaproc.gob.pa/sismos/>.

## Limitaciones conocidas

- Una sola zona jugable (San Miguelito); falta la expansión de mapa del documento.
- Un solo tipo de zombi (infectado) y un inventario básico; los sistemas completos de
  acción, crimen y supervivencia quedan para las siguientes fases (ver `docs/BACKLOG.md`).
- Las animaciones mantienen 4 filas visuales; el movimiento diagonal usa la dirección
  dominante (decisión de producto, ver `docs/V1.2_AUDIT.md` §6).
- Sin música ni efectos de sonido en esta entrega.
- El arte es programático y minimalista, no una reproducción real de calles.
- El simulacro es una simulación educativa y las alertas del colapso son ficción con
  disclaimer; no son avisos oficiales.
- Falta probar en hardware físico de gama baja; el objetivo es que funcione en móviles
  modernos con WebGL.
