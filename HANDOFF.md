# HANDOFF · PTY Time

**Última actualización:** 2026-11-07 (v0.3.0 · Slice A cerrado; desplegado a Vercel)
**Versión del repo:** 0.3.0 (`package.json`, `src/config.js` GAME_VERSION)
**Demo publicada:** **https://pty-time.vercel.app** (auto-deploy desde `main`)
**Repositorio:** **https://github.com/bampasspty/pty-time** (rama `main`)

## Dirección vigente: v1.2 (acción y supervivencia zombi)

PTY TIME deja de ser una aventura relajante de exploración y pasa a ser una **aventura
narrativa de supervivencia** con Calito como antihéroe y un apocalipsis zombi. La base
v0.1.0 se conserva como cimiento técnico.

- Documento de referencia: `docs/MASTER_DOC.md` (Documento Maestro v1.2).
- Auditoría de adaptación y brechas: `docs/V1.2_AUDIT.md`.
- Plan por slices: **Slice A** (combate y crimen en San Miguelito) → **Slice B**
  (infección, zombis, inventario, transición narrativa y supervivencia).

## Estado: v0.3.0 · Slice A cerrado

### Ya funciona

- Proyecto Phaser 3.90 + Vite 7, arquitectura modular, fuente Press Start 2P.
- Pantalla de inicio con CONTINUAR / NUEVA PARTIDA / CÓMO JUGAR.
- **Calito** como protagonista canónico (`src/data/calito.js`); la apariencia es solo
  cosmética (camisa).
- Mapa San Miguelito 64×44: avenida, calle Los Andes, cancha, plaza, 17 edificios,
  147 props, 8 NPCs, 7 zonas.
- Movimiento diagonal con normalización, colisiones, cámara, animaciones y profundidad.
- Diálogos con retrato y máquina de escribir; 8 NPCs interactivos.
- Misión **El mandado de Doña Nena** (5 pasos) + chancleta + 25 de yapa.
- Misión criminal **Los matones de la plaza**: 4 enemigos (matón y matón jefe), contador
  de bajas, +60 de yapa y +10 de reputación.
- **Combate**: pistola «LA 9» (cargador/reserva/recarga/cadencia), puño cuerpo a cuerpo,
  cambio de arma con `Q`/botón ARMA, proyectiles, fogonazos, impactos y apuntado libre.
- **Vida y daño**: barra de vida, munición en HUD, modal de KO y reaparición.
- **IA de matones**: estados idle → chase → attack → dead, **línea de visión** (no ven ni
  atacan a través de edificios), investigación de la última posición conocida y alerta
  por disparos cercanos.
- Simulacro de terremoto desbloqueable con disclaimer y fuentes SINAPROC.
- Guardado v2 en `localStorage` (`pty-time-save-v1`, versión 2) con **migración v1**.
- 65 PNG de pixel art (44.9 KB) + generador determinista; texturas de combate en memoria.
- Pruebas: **55/55** unitarias, **20/20** E2E de regresión, **22/22** E2E de combate y
  **8/8** comprobaciones contra la URL pública (0 errores de consola en todas).
- Build de producción OK y **desplegada**: bundle 1,330.79 KB (370.17 KB gzip) y 58 FPS
  en producción (Edge headless con GPU).

### Pendiente real

1. **Probar en teléfono físico de gama baja** (QA en emulación Edge con GPU).
2. **Slice B**: infección, primer zombi, inventario básico, transición narrativa y
   arranque de supervivencia (hambre/resistencia/refugio).
3. Mejoras opcionales del Slice A: más tipos de arma, diálogos narrados de Calito,
   redibujar diagonales si se decide, audio ligero.

## Cómo retomar

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # dist/
pnpm preview      # http://localhost:4173
pnpm test         # 52 pruebas
```

En Windows de este entorno, Node y pnpm vienen del runtime de DSH; usar:
`C:\Users\liziv\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe`
y `...\pnpm\bin\pnpm.mjs`. En una máquina normal basta `pnpm`.

QA E2E (requiere Edge instalado y servidor de desarrollo en 5173):

```bash
node tools/qa-final.mjs    # regresión: misión, simulacro, CONTINUAR, móvil
node tools/qa-combat.mjs   # combate, misión criminal, KO, guardado v2, táctil
node tools/qa-prod.mjs     # verifica la build pública de Vercel (sin servidor local)
```

## Publicación

- Producción: **https://pty-time.vercel.app** (v0.3.0, auto-deploy desde `main`).
- Verificación 2026-11-07: build `index-DRaj8FuF.js`, HTTP 200, 8/8 comprobaciones de
  producción (`tools/qa-prod.mjs`), 0 errores de consola y 58 FPS a 1280×720.
- Proyecto: `gestion14/pty-time` · framework Vite · build `pnpm build` · salida `dist`.
- **GitHub conectado a Vercel**: cada push a `main` despliega automáticamente.
- Para desplegar manualmente: `pnpm deploy:vercel`.

## Bloqueos actuales

- No se probó en hardware físico; la meta de rendimiento está medida en emulación con GPU.
- Vercel pertenece a la cuenta autenticada en el CLI (`gestion14`).
- GitHub pertenece a la cuenta `bampasspty`; el remoto `origin` ya está configurado.

## Archivos clave

- `src/scenes/GameScene.js` — mundo, jugador, NPCs, misiones, combate y simulacro.
- `src/scenes/UIScene.js` — HUD (misión, vida, munición), diálogos, modales, táctil.
- `src/scenes/CharacterScene.js` — apariencia de Calito (camisa cosmética).
- `src/systems/MissionSystem.js` — registro de misiones puro (2 misiones, recompensas).
- `src/systems/CombatSystem.js` — vida, cargador, cadencia, recarga, derrotas (puro).
- `src/systems/EnemyAI.js` — máquina de estados de los matones (puro, con LOS).
- `src/systems/SaveSystem.js` — guardado v2 + migración desde v1.
- `src/systems/QuakeDrill.js` — fases del simulacro.
- `src/entities/` — Player, NPC, Enemy, Bullet.
- `src/world/sanMiguelito.js` — layout del mapa (incluye `enemies`).
- `src/data/` — Calito, NPCs, diálogos, misiones, armas, enemigos y simulacro.
- `public/assets/` — arte generado; `tools/generate_assets.py` lo regenera.
- `docs/` — maestro, auditoría, contratos, assets y QA.

## Decisiones tomadas (para no re-debatir)

- JavaScript ES modules (sin TypeScript) para menor fricción y build rápido.
- Todo el arte es generado por código y se cachea como PNG; el juego no descarga arte
  externo. Los efectos de combate se generan en memoria (sin PNG).
- Un tilemap para el suelo + sprites con colisión estática para edificios/props.
- Física Arcade, cámara con zoom entero (2–4) para mantener el pixel art nítido.
- Eventos por un EventBus propio; misión, combate e IA no dependen de Phaser.
- El simulacro es 100% ficticio; sin alertas ni datos sísmicos reales.
- La munición de la pistola se guarda en el save v2 (cargador + reserva).
- **Calito es el protagonista canónico** y la apariencia es cosmética (camisa): no se
  vuelve a ofrecer creador de personaje completo.
- **4 filas visuales de animación** (arriba/abajo/izquierda/derecha) con dirección
  dominante, movimiento diagonal y apuntado libre; redibujar diagonales queda como
  mejora opcional futura.
- El balance del Slice A es: pistola 14 de daño, matón 30 HP, matón jefe 60 HP, reserva
  inicial 30 balas.
