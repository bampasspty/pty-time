# CHANGELOG · PTY Time

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

### Notas

- Sin audio, sin modo historia y sin multijugador en esta entrega.
- Falta validar en un teléfono físico de gama baja.
