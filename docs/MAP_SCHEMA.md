# PTY TIME · Esquema del mapa San Miguelito

Archivo a editar: `src/world/sanMiguelito.js` (exporta `SAN_MIGUELITO`).
Dimensiones: **64 x 44 tiles de 16 px = 1024 x 704 px**. No cambiar ancho/alto.
Sistema de coordenadas: origen arriba-izquierda. Todas las posiciones de objetos,
NPCs, ítems y zonas están en **píxeles** (no en tiles). Las rectas de `ground` sí
están en tiles.

## Estructura

```js
export const SAN_MIGUELITO = {
  id: 'san-miguelito',
  title: 'San Miguelito',
  subtitle: 'San Isidro · Los Andes',
  width: 64,
  height: 44,
  spawn: { x: 400, y: 540 },       // pies del jugador, debe ser transitable
  ground: {
    base: 'grass',                 // tile de fondo
    rects: [                       // se pintan en orden
      { tile: 'asphalt', tx: 0, ty: 20, tw: 64, th: 6 },
      { tile: 'sidewalk', tx: 0, ty: 18, tw: 64, th: 2 },
      // ...
    ],
  },
  buildings: [
    // x,y = ancla inferior-central del sprite
    { id: 'fonda-nena', kind: 'fonda', x: 300, y: 400 },
  ],
  props: [
    { kind: 'palm', x: 180, y: 300 },
    { kind: 'fence', x: 240, y: 320 },
  ],
  npcs: [
    { id: 'nena', x: 300, y: 420, facing: 'down', wander: 0 },
  ],
  items: [
    { id: 'chancla', kind: 'chancla', x: 900, y: 470 },
  ],
  enemies: [
    // id = tipo de enemigo de src/data/enemies.js (maton, maton-duro)
    { id: 'maton', x: 128, y: 492, facing: 'down' },
  ],
  zones: [
    { id: 'cancha', name: 'Cancha de San Isidro', type: 'open', x: 720, y: 100, w: 240, h: 180 },
  ],
};
```

## Reglas de autoría

1. **Base del mapa**: grama. Pinta calles, aceras, patios y plazas con `rects` en orden.
   - Avenida principal horizontal (ej. `ty: 20..25`) y una calle vertical.
   - Aceras a ambos lados de cada calle, de 2 tiles de ancho.
   - La avenida debe tener paso peatonal (`crosswalk`) y líneas de calle.
   - Usa `stairs` para conectar terrazas (San Miguelito tiene pendientes). Acompaña
     las escaleras con muros/verjas para que se lean como desniveles.
   - La cancha debe ser una zona grande con `court` y líneas.
2. **Edificios**: solo los `kind` listados en `src/world/defs.js`. No solapar edificios
   entre sí ni con el spawn. Deja 2-3 tiles de espacio transitable delante de cada uno.
   Ubica la fonda, el minisúper, la parada y el metro cerca de la avenida principal;
   casas y apartamentos en los bloques residenciales; la escuela y la cancha en zonas
   abiertas.
3. **Props**: solo `kind` válidos de `defs.js`. Úsalos para dar identidad:
   palmeras, árboles de mango, postes con cables (el sistema dibuja los cables),
   verjas, bancas, zafacones, letreros, puestos de fruta, taxis, carros, el diablo rojo.
   No amontones props; deja aceras y calles caminables.
4. **NPCs**: deben aparecer los 8 ids (`nena`, `pipe`, `chen`, `melva`, `kevin`,
   `yolanda`, `ana`, `chofer`) exactamente una vez. Colócalos en sitios coherentes:
   - nena → frente a la fonda
   - pipe → cancha
   - chen → frente al minisúper
   - melva → parada de bus
   - kevin → cancha
   - yolanda → jardín/ventana de un apartamento
   - ana → escuela
   - chofer → junto al bus/diablo rojo o metro
   `wander` es el radio en píxeles (0 = quieto, 24-48 = pasea). No debe atravesar muros
   (el sistema de física lo evita, pero evita radios que crucen edificios).
5. **Ítems**: debe existir `{ id: 'chancla', kind: 'chancla', ... }` cerca de la parada
   de bus, en una zona transitable y visible.
6. **Zonas**: define al menos:
   - `cancha` (`type: 'open'`) para el simulacro de terremoto.
   - `plaza` (`type: 'open'`) pequeña área abierta.
   - `fonda`, `minisuper`, `metro`, `parada`, `escuela`, `cancha` como `landmark`.
   Las zonas `open` se usan para verificar el refugio seguro del simulacro.
7. **Spawn**: en una acera o patio, sin colisión cercana, cerca del centro-sur del mapa.
8. **Bordes**: el mapa debe sentirse cerrado; usa árboles, verjas y edificios en los
   bordes. El sistema agrega colisión en el límite del mundo.
9. **Enemigos**: `enemies` es opcional. Cada spawn usa un `id` válido de
   `src/data/enemies.js` y una posición transitable. Para la misión de limpieza debe
   haber al menos 3 matones en la misma zona (`plaza` de Los Andes en el mapa actual).
   Evita colocarlos junto a NPCs importantes para no interrumpir los diálogos.

## Validación

Ejecutar:

```bash
node tools/validate-map.mjs
```

Debe imprimir `MAP OK`. Corrige todo antes de entregar. El validador revisa límites,
solapes de edificios, props sólidos sobre edificios, spawn/NPCs/ítems dentro de
colisiones, ids requeridos y zonas.

## Referencia visual

Mapa inspirado en San Isidro y Los Andes, San Miguelito: calles con pendiente, escaleras,
casas de zinc, apartamentos, fondas, minisúper, parada de bus, metro, cancha, cables,
palmeras y mucho movimiento. No es una copia a escala; es un mapa condensado reconocible.
