# HANDOFF · PTY Time

**Última actualización:** 2026-11-06 (demo v0.1.0 publicada y subida a GitHub)
**Estado:** Entrega A jugable y **publicada**:
- Vercel: **https://pty-time.vercel.app** (proyecto `gestion14/pty-time`)
- GitHub: **https://github.com/bampasspty/pty-time** (rama `main`)

## Lo que ya está funcionando

- Proyecto Phaser 3.90 + Vite 7 con arquitectura modular y fuente Press Start 2P.
- Pantalla de inicio con CONTINUAR / NUEVA PARTIDA / CÓMO JUGAR, guardado local.
- Creación de personaje (2 cuerpos × 4 camisas) y persistencia de la elección.
- Mapa San Miguelito 64×44 tiles: avenida, calle Los Andes, aceras, escaleras, cancha,
  fonda, minisúper, metro, parada, escuela, plaza, 17 edificios, 147 props, 8 NPCs.
- Movimiento 4 direcciones, colisiones, cámara, animaciones, sombras, profundidad.
- Diálogos con retrato y máquina de escribir; 8 NPCs interactivos.
- Misión principal "El mandado de Doña Nena" (5 pasos) + chancleta + 25 de yapa.
- Simulacro de terremoto desbloqueable con disclaimer visible y fuentes SINAPROC.
- HUD, toasts, brújula de objetivo, ayuda, controles táctiles (joystick + botones).
- 63 PNG de pixel art generados por código (42.5 KB) + contact sheet + generador.
- Pruebas: **24/24** unitarias/assets y **20/20** comprobaciones E2E (ver
  `docs/QA_REPORT.md`).
- Build de producción verificado y desplegado; URL pública con HTTP 200, 0 errores,
  0 respuestas 404 y 58 FPS en Edge.

## Cómo retomar

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # dist/
pnpm preview      # http://localhost:4173
pnpm test         # 24 pruebas
```

En Windows de este entorno, Node y pnpm vienen del runtime de DSH; usar:
`C:\Users\liziv\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe`
y `...\pnpm\bin\pnpm.mjs`. En una máquina normal basta `pnpm`.

QA E2E (requiere Edge instalado y servidor de desarrollo en 5173):

```bash
node tools/qa-final.mjs
```

## Pendiente / siguiente tarea concreta

1. **Probar en teléfono físico de gama baja** (el QA fue Edge headless con GPU).
2. Opcional para la Entrega B: audio ligero, segundo sector de San Miguelito, más
   misiones, modo historia, eventos y multijugador (evaluar).
3. Para re-desplegar: `pnpm deploy:vercel` (CLI de Vercel ya instalado como devDependency).
4. Para publicar cambios: `git push origin main`.

## Publicación actual

- Producción: **https://pty-time.vercel.app**
- Proyecto: `gestion14/pty-time` · framework Vite · build `pnpm build` · salida `dist`.
- **GitHub conectado a Vercel**: cada push a `main` despliega automáticamente.
  Verificado con el commit `406197d` → deployment `pty-time-m0jxd769w-gestion14.vercel.app`
  en estado READY, target production.
- Para re-desplegar manualmente: `pnpm deploy:vercel`.

## Bloqueos actuales

- No se probó en hardware físico; la meta de rendimiento está medida en emulación con GPU.
- Vercel pertenece a la cuenta que ya estaba autenticada en el CLI (`gestion14`).
- GitHub pertenece a la cuenta `bampasspty`; el remoto `origin` ya está configurado.

## Archivos clave

- `src/scenes/GameScene.js` — mundo, jugador, NPCs, misión y disparo del simulacro.
- `src/scenes/UIScene.js` — HUD, diálogos, modales, controles táctiles.
- `src/systems/MissionSystem.js` — máquina de estados pura de la misión.
- `src/systems/QuakeDrill.js` — fases del simulacro.
- `src/systems/SaveSystem.js` — guardado `localStorage` (clave `pty-time-save-v1`).
- `src/world/sanMiguelito.js` — layout del mapa (editable sin tocar el motor).
- `src/world/MapBuilder.js` — tiles, colisiones, cables, cancha y detalles.
- `src/data/` — NPCs, diálogos, misión, contenido del simulacro.
- `public/assets/` — arte generado; `tools/generate_assets.py` lo regenera.
- `docs/` — contratos, reporte de assets, QA.

## Decisiones tomadas (para no re-debatir)

- JavaScript ES modules (sin TypeScript) para menor fricción y build rápido.
- Todo el arte es generado por código y se cachea como PNG; el juego no descarga arte
  externo.
- Un tilemap para el suelo + sprites con colisión estática para edificios/props.
- Física Arcade, cámara con zoom entero (2–4) para mantener el pixel art nítido.
- Eventos por un EventBus propio; el estado de misión no depende de Phaser.
- El simulacro es 100% ficticio; sin alertas ni datos sísmicos reales.
- La primera entrega no incluye audio, modo historia ni multijugador.
