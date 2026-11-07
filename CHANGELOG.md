# CHANGELOG · PTY Time

## [0.3.0] — 2026-11-07 · Slice A cerrado

Entrega que completa el Slice A de la dirección v1.2 y se despliega a producción.

### Añadido

- **Calito como protagonista canónico** (`src/data/calito.js`): nombre, rol, frase de
  identidad y variante por defecto. La pantalla de personaje pasa a ser **apariencia**
  (sólo camisa, cosmética); se retira la elección de cuerpo.
- **Línea de visión para la IA** (`hasLineOfSight` en `GameScene` + `EnemyAI`): los
  matones no detectan, persiguen ni atacan a través de edificios; si pierden de vista
  investigan la última posición conocida y se rinden después de unos segundos.
- **Cambio de arma**: `Q` en teclado y botón **ARMA** en táctil alternan pistola y puño.
- **Botón táctil ARMA** y aviso en el manual de CÓMO JUGAR.
- QA: comprobaciones nuevas de línea de visión, cambio de arma y **disparo real tocando
  FUEGO** en emulación móvil.

### Cambiado

- **Balance del combate**: pistola 14 de daño y cadencia 260 ms; reserva inicial 30 balas;
  matón 30 HP / 8 de daño; matón jefe 60 HP / 12 de daño.
- Pantalla de título: tagline «Calito, del barrio al apocalipsis» y versión v0.3.

### Corregido

- La IA se quedaba en persecución eterna al perder de vista al jugador; ahora investiga
  la última posición y se rinde a los 6 segundos.

### Notas

- Decisión de producto cerrada: **4 filas visuales** de animación con dirección dominante
  y apuntado libre; redibujar diagonales queda como mejora opcional futura.
- Pruebas: **55/55** unitarias; **20/20** QA de regresión; **22/22** QA de combate y
  **9/9** comprobaciones de producción.
- **Desplegado en https://pty-time.vercel.app** (build `index-DRaj8FuF.js`); verificado
  con HTTP 200, 0 errores de consola, 56–58 FPS y 56 FPS en gama baja emulada (CPU 4×).
- Pendiente: probar en teléfono físico y arrancar el Slice B (infección y zombis).

## [0.2.0] — 2026-11-07 · Slice A: combate y crimen en San Miguelito

Primer bloque jugable de la dirección v1.2. **Sólo en local: la URL pública sigue en
v0.1.0 hasta desplegar.**

### Añadido

- **Combate cenital** (`src/systems/CombatSystem.js`, `src/entities/Bullet.js`):
  - pistola «LA 9» con cargador de 8, reserva de 24, recarga de 850 ms y cadencia de 280 ms;
  - puño como arma cuerpo a cuerpo (sin munición);
  - balas con dispersión, alcance y daño; fogonazo, impacto y sacudida de cámara moderada;
  - apuntado libre con ratón; disparo con clic izquierdo o `J`; recarga con `R`.
- **Enemigos con IA** (`src/data/enemies.js`, `src/systems/EnemyAI.js`,
  `src/entities/Enemy.js`): matón y matón jefe con vida, daño y cooldown propios; estados
  idle → persecución → ataque → muerto; se alertan con los disparos cercanos.
- **4 matones en la plaza de Los Andes** (`src/world/sanMiguelito.js` → `enemies`).
- **Vida y daño del jugador**: barra de vida en el HUD, daño con invulnerabilidad breve,
  modal **TE TUMBARON** y reaparición con vida completa.
- **Misión criminal «Los matones de la plaza»**: se abre al terminar el mandado, cuenta
  enemigos derrotados (3/3), da +60 de yapa y +10 de reputación.
- **Registro de misiones**: `src/data/missions.js` pasa a diccionario de misiones con
  categorías, requisitos, marcadores de NPC, recompensas y textos de cierre;
  `MissionSystem` se vuelve genérico (dos misiones sin código específico).
- **Guardado v2** (`src/systems/SaveSystem.js`): vida, munición, yapa, reputación y estado
  de todas las misiones; **migración automática de los guardados v1**.
- **Controles táctiles de combate**: botón FUEGO (apunta al matón más cercano) y botón R.
- **Arte**: 2 hojas nuevas de enemigo 48×96 (`enemy-maton`, `enemy-maton-duro`) generadas
  por `tools/generate_assets.py`; texturas de combate generadas en memoria.
- **QA**: `tools/qa-combat.mjs` (18 comprobaciones E2E) + pruebas unitarias de combate,
  IA y migración de guardado. Suite total: **52/52**.

### Cambiado

- El HUD muestra ahora vida y munición además de misión y yapa.
- El joystick táctil sólo se activa en pantallas táctiles; en escritorio el clic dispara.
- El modal de misión completada usa los textos de cierre de cada misión.
- `tools/qa-final.mjs` adaptado al esquema de guardado v2 y a la API de misiones nueva.
- Documentación actualizada: `README.md`, `HANDOFF.md`, `docs/QA_REPORT.md`,
  `docs/CONTENT_SCHEMA.md`, `docs/MAP_SCHEMA.md`, `docs/ASSET_CONTRACT.md`.

### Corregido

- Los matones quedaban plantados cuando el jugador hablaba: la IA se congela durante
  diálogos y modales.
- Clic en un botón de la interfaz ya no dispara un tiro.
- El crecimiento de la barra de vida usa `setSize` (el ancho del rectángulo no se
  renderizaba al asignarlo directamente).
- Las granadas de texto del modal de misión copian el array antes de añadir líneas
  (los arrays de datos están congelados).

### Notas

- La IA todavía no evalúa línea de visión; la física evita atravesar muros.
- Sin audio y sin 8 direcciones visuales en esta entrega.
- Pendiente desplegar y probar en teléfono físico de gama baja.

## [Unreleased] — dirección v1.2

### Documentación

- Consolidado el **Documento Maestro v1.2** en `docs/MASTER_DOC.md`: nueva dirección de
  acción y supervivencia zombi, Calito como antihéroe, historia en cinco capítulos y
  sistemas objetivo (combate, inventario, fabricación, reputación, supervivencia,
  refugios, vehículos y mapa de Panamá).
- Añadida la **auditoría Fase 1** en `docs/V1.2_AUDIT.md`: inventario de lo reutilizable,
  brechas frente al documento, deuda técnica y plan por slices (Slice A: mecánica
  principal; Slice B: el colapso).
- Actualizados `README.md`, `HANDOFF.md` y la descripción de `package.json` a la nueva
  dirección.

## [0.1.0] — 2026-11-06

Primera entrega jugable (Entrega A · PTY Time Playable) de la demo de San Miguelito.

### Añadido

- Proyecto Phaser 3.90 + Vite 7 con arquitectura modular.
- Pantalla de inicio, ayuda y CONTINUAR/NUEVA PARTIDA con guardado local.
- Creación de personaje: 2 cuerpos × 4 camisas, preview animado.
- Mapa San Miguelito de 64 × 44 tiles (1024 × 704 px):
  - avenida principal con aceras, paso peatonal, líneas de calle y cables;
  - calle Los Andes vertical;
  - cancha de San Isidro con cancha sintética, aros y gradas;
  - fonda, minisúper, metro, parada de bus, escuela, plaza;
  - 17 edificios, 147 props y 8 NPCs.
- Movimiento en 4 direcciones, animaciones de caminar, colisiones, cámara con seguimiento,
  sombras y orden por profundidad.
- Diálogos con retratos, efecto máquina de escribir y múltiples páginas.
- Misión principal **El mandado de Doña Nena** (5 pasos), objeto chancleta, yapa y guardado.
- Simulacro ficticio de terremoto con disclaimer visible y recomendaciones de SINAPROC.
- HUD de misión y yapa, toasts, brújula de objetivo (estrella), ayuda.
- Controles táctiles: joystick virtual, botón HABLAR, botón CUBRIRSE y SIMULACRO.
- 63 assets de pixel art generados por código (42.5 KB) + fuente Press Start 2P (OFL).
- Pruebas unitarias y de assets (24) y scripts de QA con Playwright/Edge.
- Configuración de despliegue para Vercel.

### Corregido durante el desarrollo

- Se eliminaron tiles de línea de carril que se veían como bloques blancos.
- Cancha teal oscura con líneas de baloncesto dibujadas en el mapa.
- Cruce peatonal con blanco hueso para reducir contraste.
- Yolanda con vestido lavanda (ya no parece piel).
- HUD y modales responsivos; banner SAN MIGUELITO escalado a móvil.
- Interacción por teclado migrada a evento keydown para no perder pulsaciones rápidas.
- Joystick visible en dispositivos táctiles y modales que bloquean HUD/controles.

### Desplegado

- Publicado en Vercel: **https://pty-time.vercel.app** (proyecto `gestion14/pty-time`).
- Verificado desde la URL pública: HTTP 200, 0 errores, 0 respuestas 404 y 58 FPS.
- Código publicado en GitHub: **https://github.com/bampasspty/pty-time**.
- Integración GitHub → Vercel conectada: cada push a `main` crea un deployment de
  producción automático (verificado con un push real).

### Notas

- Sin audio, sin modo historia y sin multijugador en esta entrega.
- Falta validar en un teléfono físico de gama baja.
