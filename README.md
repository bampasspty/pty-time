# PTY TIME · Demo v0.1.0

Videojuego panameño de exploración, aventura y cultura en pixel art 2D con cámara
cenital. Esta primera entrega es **San Miguelito** (inspirado en San Isidro, Los Andes y
sus alrededores) y está pensada para correr en navegador, tanto en computadora como en
teléfono.

> **Evento sísmico:** el simulacro de terremoto es ficción dentro del videojuego. No es
> una alerta real, no se conecta a sistemas de monitoreo y no sustituye información
> oficial. Recomendaciones basadas en [SINAPROC](https://www.sinaproc.gob.pa/sismos/).

![Pantalla de título](docs/screenshots/title.png)
![Exploración en San Miguelito](docs/screenshots/game.png)
![Diálogo con Doña Nena](docs/screenshots/dialogue.png)
![Simulacro de terremoto](docs/screenshots/drill.png)
![Vista móvil](docs/screenshots/mobile.png)

## Demo publicada

- **Jugar:** https://pty-time.vercel.app
- **Repositorio:** https://github.com/bampasspty/pty-time

Desplegada en Vercel (proyecto `pty-time`). Verificada desde la URL pública:
HTTP 200, 0 errores, 0 assets faltantes y 58 FPS en Edge con GPU.

## Estado

Demo jugable completa (Entrega A). Incluye:

- Pantalla de inicio, ayuda y creación de personaje (2 cuerpos × 4 colores de camisa).
- Personaje controlable en 4 direcciones, con animación de caminar y profundidad.
- Mapa de San Miguelito de 64 × 44 tiles: avenida, calle Los Andes, aceras, escaleras,
  cancha, fonda, minisúper, metro, parada, escuela, casas y apartamentos.
- Colisiones con edificios, mobiliario y límites del mundo; cámara que sigue al jugador.
- 8 NPCs con diálogos propios y paseo ligero.
- Misión principal **El mandado de Doña Nena** con 5 pasos y recompensa.
- Chancleta de Pipe como objeto de misión.
- Guardado automático en `localStorage` y opción CONTINUAR.
- Simulacro de terremoto desbloqueable: cubrirse, sujetarse y evacuar a zona abierta,
  con advertencia visible y recomendaciones educativas.
- HUD de misión, yapa, ayuda, controles táctiles (joystick + botones) y toasts.
- Assets de pixel art generados por código (63 PNG, 42.5 KB) y fuente Press Start 2P.

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
| Hablar / recoger | E, ESPACIO, ENTER o botón HABLAR | Botón HABLAR |
| Agacharse / cubrirse | C o botón CUBRIRSE durante el simulacro | Botón CUBRIRSE |
| Ayuda | ? o ESC | Botón ? |
| Simulacro | Botón SIMULACRO (cuando está desbloqueado) | Botón SIMULACRO |

La estrella amarilla marca al NPC del objetivo actual. El HUD superior muestra la
misión y la yapa acumulada.

## Juego: misión y simulacro

1. Habla con **Doña Nena** en la fonda para aceptar el mandado.
2. Busca a **Pipe** en la cancha de San Isidro.
3. Encuentra su **chancleta** cerca de la parada de bus.
4. Devuélvesela a Pipe y vuelve con Nena.
5. Nena te da **25 de yapa** y desbloquea el **simulacro de terremoto**.

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
│   ├── BootScene.js        carga de assets + animaciones
│   ├── TitleScene.js       pantalla de inicio
│   ├── CharacterScene.js   creación de personaje
│   ├── GameScene.js        mundo, jugador, NPCs, misión, simulacro
│   └── UIScene.js          HUD, diálogos, modales, controles táctiles
├── entities/               Player, NPC
├── systems/                MissionSystem, SaveSystem, QuakeDrill, EventBus, InputState
├── world/                  mapa de San Miguelito, defs y MapBuilder
├── ui/                     DialogueBox, Modal, PixelButton, Backdrop
└── data/                   NPCs, diálogos, misión, contenido del simulacro
public/assets/              tiles, personajes, edificios, props, UI y fuente
tools/generate_assets.py    generador de pixel art (Pillow)
tests/                      pruebas node:test (lógica, mapa, assets)
docs/                       contratos, reporte de assets y QA
```

El estado de misión es puro y testeable. `MissionSystem` no depende de Phaser. Los
diálogos se resuelven con `getDialogue(npcId, ctx)` y devuelven la acción de misión
correspondiente; `GameScene` aplica el cambio y guarda.

## Rendimiento

- Phaser 3.90 + Vite 7; bundle de producción ≈ 1.30 MB (≈ 360 KB gzip).
- Assets de juego: **42.5 KB** de 63 PNG.
- Un solo tilemap para el suelo; ~17 edificios, 147 props y 8 NPCs.
- Sin partículas ni efectos costosos; simulacro con `camera.shake` moderado.
- Prueba automatizada en Edge headless con GPU: **50–57 FPS a 844 × 390** en el mapa
  completo (ver `docs/QA_REPORT.md`). Falta validar en un teléfono físico de gama baja.

## Publicación en Vercel

La demo está publicada en **https://pty-time.vercel.app**.

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

- Una sola zona jugable (San Miguelito). No hay modo historia ni multijugador.
- Sin música ni efectos de sonido en esta entrega.
- El arte es programático y minimalista, no una reproducción real de calles.
- El simulacro es una simulación educativa, no una alerta ni un sistema de emergencia.
- Falta probar en hardware físico de gama baja; el objetivo es que funcione en móviles
  modernos con WebGL.
