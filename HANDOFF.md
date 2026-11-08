# HANDOFF · PTY Time

**Última actualización:** 2026-11-08 (v1.0.0 · primera release pública: Fases 1-4)
**Versión del repo:** 1.0.0 (`package.json`, `src/config.js` GAME_VERSION)
**Demo publicada:** **https://pty-time.vercel.app** (auto-deploy desde `main`)
**Repositorio:** **https://github.com/bampasspty/pty-time** (rama `main`)

## Dirección vigente: v1.2 (acción y supervivencia zombi)

PTY TIME es una **aventura narrativa de supervivencia** con Calito como antihéroe y un
apocalipsis zombi, ambientada en una Panamá ficticia. El MVP del Documento Maestro ya está
cerrado en v0.4.0 (Slice A + Slice B).

- Documento de referencia: `docs/MASTER_DOC.md` (Documento Maestro v1.2).
- Auditoría de adaptación y brechas: `docs/V1.2_AUDIT.md`.
- **Lo que falta, priorizado:** `docs/BACKLOG.md`.
- Plan por slices: **Slice A** ✅ (combate y crimen) → **Slice B** ✅ (infección, zombi,
  inventario y transición) → siguiente: sistemas de acción y crimen del §5–§9.

## Estado: v1.0.0 · primera release pública (Fases 1-4)

Publicada en https://pty-time.vercel.app. Las Fases 5-7 quedan como DLC/actualizaciones.

### Ya funciona

- Proyecto Phaser 3.90 + Vite 7, arquitectura modular, fuente Press Start 2P.
- Pantalla de inicio con CONTINUAR / NUEVA PARTIDA / CÓMO JUGAR.
- **Calito** como protagonista canónico (`src/data/calito.js`); apariencia cosmética.
- **Introducción narrativa** de tres páginas al empezar partida nueva (`story.js`).
- Mapa San Miguelito 64×44: avenida, calle Los Andes, cancha, plaza, 17 edificios,
  147 props, 8 NPCs, 7 zonas.
- Movimiento diagonal con normalización, colisiones, cámara, animaciones y profundidad.
- Diálogos con retrato y máquina de escribir; 8 NPCs interactivos.
- Misión **El mandado de Doña Nena** (5 pasos) + chancleta + 25 de yapa.
- Misión criminal **Los matones de la plaza**: 4 enemigos con IA y línea de visión,
  +60 de yapa y +10 de reputación.
- **Combate**: pistola «LA 9», puño, cargador/reserva/recarga, cambio de arma (Q/ARMA),
  proyectiles, fogonazos, impactos y apuntado libre.
- **Arsenal (Fase 3)**: tubo, subfusil «LA MICRO», escopeta «LA RECORTADA» y rifle «EL 22»,
  cada uno con munición propia; armas repartidas por el mapa para recoger.
- **Progresión**: XP por enemigos y misiones, niveles con +10 de vida máxima y +5 % de daño,
  HUD con nivel y experiencia.
- **Vida y daño**: barra de vida, munición en HUD, modal de KO y reaparición.
- **El colapso (Slice B)**: PTY Alerta ficticia con disclaimer, horda de 10 infectados
  (8 del mapa + 2 cerca de Calito), matones que huyen, **Capítulo III** (sobrevivir a 5 y
  llegar a la fonda) y mundo en fase `apocalipsis`.
- **Zombis**: infectado (40 HP, lento, detecta y persigue sin línea de visión, alerta por
  disparos, velocidad variable por individuo).
- **Inventario básico**: vendajes, latas y cajas de balas; 12 espacios con apilado;
  panel MOCHILA con USAR VENDAJE / ABRIR CAJA; 5 suministros en el mapa.
- Simulacro de terremoto desbloqueable con disclaimer y fuentes SINAPROC.
- **Guardado v4** en `localStorage` (`pty-time-save-v1`): vida, munición, armas en
  propiedad, progresión, misiones, mundo, historia e inventario; **migración automática
  desde v1, v2 y v3**.
- 73 PNG de pixel art (47.4 KB) + generador determinista; efectos en memoria.
- Pruebas: **93/93** unitarias, **20/20** E2E de regresión, **35/35** E2E de combate y
  **12/12** comprobaciones contra la URL pública (0 errores de consola).
- Build de producción OK: 1,354.73 KB (377.38 KB gzip).

### Pendiente real

1. **Probar en teléfono físico de gama baja** (QA en emulación Edge con GPU + CPU 4×).
2. **DLC/actualizaciones de contenido** (Fases 5-7): apocalipsis ampliado, refugios y
   supervivientes, vehículos, expansión de mapa (Ciudad de Panamá, Panamá Oeste, Interior)
   y capítulos IV-V.
3. **Pulido**: audio, atlas de texturas, CI, menú de pausa/ajustes, guardado en servidor,
   territorios/propiedades y más tipos de zombi.
4. Opcional: 8 direcciones visuales (decisión actual: 4 filas + dirección dominante).

## Cómo retomar

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # dist/
pnpm preview      # http://localhost:4173
pnpm test         # 93 pruebas
```

En Windows de este entorno, Node y pnpm vienen del runtime de DSH; usar:
`C:\Users\liziv\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe`
y `...\pnpm\bin\pnpm.mjs`. En una máquina normal basta `pnpm`.

QA E2E (requiere Edge instalado y servidor de desarrollo en 5173):

```bash
node tools/qa-final.mjs    # regresión: misión, simulacro, CONTINUAR, móvil
node tools/qa-combat.mjs   # combate, armas, progresion, colapso, inventario, v4
node tools/qa-prod.mjs     # verifica la build pública de Vercel (sin servidor local)
```

## Publicación

- Producción: **https://pty-time.vercel.app** (v0.5.0, auto-deploy desde `main`).
- Verificación 2026-11-08: build `index-SFuLZVbb.js`, HTTP 200, 12/12 comprobaciones de
  producción (`tools/qa-prod.mjs`), 0 errores de consola, 56 FPS a 1280×720 y 50 FPS en
  gama baja emulada (CPU 4×, 844×390 táctil).
- Proyecto: `gestion14/pty-time` · framework Vite · build `pnpm build` · salida `dist`.
- **GitHub conectado a Vercel**: cada push a `main` despliega automáticamente.
- Para desplegar manualmente: `pnpm deploy:vercel`.

## Bloqueos actuales

- No se probó en hardware físico; el rendimiento está medido en emulación con GPU.
- Vercel pertenece a la cuenta autenticada en el CLI (`gestion14`).
- GitHub pertenece a la cuenta `bampasspty`; el remoto `origin` ya está configurado.

## Archivos clave

- `src/scenes/GameScene.js` — mundo, jugador, NPCs, misiones, combate, colapso e inventario.
- `src/scenes/UIScene.js` — HUD, historia, mochila, diálogos, modales y táctil.
- `src/scenes/CharacterScene.js` — apariencia de Calito (camisa cosmética).
- `src/systems/MissionSystem.js` — registro de misiones puro (3 misiones).
- `src/systems/CombatSystem.js` — vida, armas en propiedad, cargador, cadencia y recarga.
- `src/systems/ProgressionSystem.js` — experiencia, niveles y bonificaciones (puro).
- `src/systems/EnemyAI.js` — IA de matones y zombis (puro, con línea de visión).
- `src/systems/InventorySystem.js` — inventario con pilas y capacidad (puro).
- `src/systems/SaveSystem.js` — guardado v4 + migración desde v1/v2/v3.
- `src/systems/QuakeDrill.js` — fases del simulacro.
- `src/entities/` — Player, NPC, Enemy, Bullet.
- `src/world/sanMiguelito.js` — layout del mapa (enemigos, zombis y suministros).
- `src/data/` — Calito, historia, NPCs, diálogos, misiones, armas, enemigos, zombis,
  objetos y simulacro.
- `public/assets/` — arte generado; `tools/generate_assets.py` lo regenera.
- `docs/` — maestro, auditoría, backlog, contratos, assets y QA.

## Decisiones tomadas (para no re-debatir)

- JavaScript ES modules (sin TypeScript) para menor fricción y build rápido.
- Todo el arte es generado por código y se cachea como PNG; el juego no descarga arte
  externo. Los efectos de combate se generan en memoria (sin PNG).
- Un tilemap para el suelo + sprites con colisión estática para edificios/props.
- Física Arcade, cámara con zoom entero (2–4) para mantener el pixel art nítido.
- Eventos por un EventBus propio; misión, combate, IA e inventario no dependen de Phaser.
- El simulacro es 100% ficticio; las alertas del colapso son ficción con disclaimer visible.
- Calito es el protagonista canónico y la apariencia es cosmética (camisa).
- **4 filas visuales** de animación con dirección dominante, movimiento diagonal y
  apuntado libre; redibujar diagonales queda como mejora opcional.
- Balance actual: pistola 14 de daño, subfusil 9, escopeta 8×5 perdigones, rifle 26,
  tubo 17, matón 30 HP, matón jefe 60 HP, infectado 40 HP, reserva inicial 30 balas,
  2 vendajes + 1 lata de inicio.
- **Arsenal por progresión:** el jugador empieza con puño y pistola; las otras 4 armas se
  recogen en el mapa (tubo, subfusil, escopeta, rifle) y cada una usa su propia munición.
- **Progresión:** XP por enemigo (matón 14, jefe 30, infectado 12) y por misión (40/80/120);
  cada nivel da +10 de vida máxima, +5 % de daño y el HUD muestra nivel y XP.
- Los zombis se comportan distinto a los matones (sin línea de visión, velocidad variable);
  la horda y los suministros aparecen al caer el colapso.
