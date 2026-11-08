// Mapa de San Miguelito (San Isidro · Los Andes).
// Esquema completo en docs/MAP_SCHEMA.md. Editar solo este archivo.
// Las coordenadas de objetos están en píxeles; las de ground en tiles.
//
// Composición general (64 x 44 tiles = 1024 x 704 px):
//   - Avenida principal horizontal, ty 20-25, con aceras de 2 tiles, línea
//     central discontinua y dos pasos peatonales.
//   - Calle vertical (Los Andes) tx 30-33 que cruza la avenida y sube/baja el mapa.
//   - Terraza noroeste (dirt) con escalinata, muro de contención y casas.
//   - Terraza de la cancha (noreste) con escalinata, verjas y cancha abierta.
//   - Bloque residencial sur con callejones de tierra, escaleras y casas.
//   - Plaza abierta en el suroeste y escuela con patio en el sureste.

export const SAN_MIGUELITO = {
  id: 'san-miguelito',
  title: 'San Miguelito',
  subtitle: 'San Isidro · Los Andes',
  width: 64,
  height: 44,

  // Pie en la acera este de la calle vertical, centro-sur, despejado.
  spawn: { x: 560, y: 464 },

  ground: {
    base: 'grass',
    rects: [
      // --- Terraza noroeste: patio de tierra, escalinata y muro ---
      { tile: 'dirt', tx: 2, ty: 3, tw: 26, th: 10 },
      { tile: 'grassWorn', tx: 2, ty: 12, tw: 26, th: 2 },
      { tile: 'dirt', tx: 1, ty: 12, tw: 3, th: 1 },
      { tile: 'stairs', tx: 1, ty: 13, tw: 3, th: 4 },
      { tile: 'concrete', tx: 1, ty: 17, tw: 3, th: 1 },
      { tile: 'dirt', tx: 11, ty: 17, tw: 3, th: 1 },

      // --- Terraza de la cancha (noreste): losa, cancha y escalinata ---
      { tile: 'concrete', tx: 36, ty: 3, tw: 16, th: 12 },
      { tile: 'court', tx: 37, ty: 4, tw: 14, th: 10 },
      { tile: 'stairs', tx: 40, ty: 15, tw: 6, th: 2 },
      { tile: 'concrete', tx: 38, ty: 17, tw: 10, th: 1 },

      // --- Avenida principal ---
      { tile: 'sidewalk', tx: 0, ty: 18, tw: 64, th: 2 },
      { tile: 'asphalt', tx: 0, ty: 20, tw: 64, th: 6 },
      { tile: 'sidewalk', tx: 0, ty: 26, tw: 64, th: 2 },
      { tile: 'curb', tx: 0, ty: 19, tw: 64, th: 1 },
      { tile: 'curb', tx: 0, ty: 26, tw: 64, th: 1 },
      // líneas de carril (ty 22, entre las dos vías)
      // parches de asfalto
      { tile: 'asphalt2', tx: 10, ty: 21, tw: 4, th: 2 },
      { tile: 'asphalt2', tx: 44, ty: 23, tw: 5, th: 2 },
      { tile: 'asphaltPatch', tx: 20, ty: 24, tw: 3, th: 1 },
      { tile: 'asphaltPatch', tx: 56, ty: 21, tw: 4, th: 1 },

      // --- Calle vertical Los Andes (se pinta encima para abrir la boca) ---
      { tile: 'sidewalk', tx: 28, ty: 0, tw: 2, th: 44 },
      { tile: 'sidewalk', tx: 34, ty: 0, tw: 2, th: 44 },
      { tile: 'curb', tx: 29, ty: 0, tw: 1, th: 18 },
      { tile: 'curb', tx: 29, ty: 28, tw: 1, th: 16 },
      { tile: 'curb', tx: 34, ty: 0, tw: 1, th: 18 },
      { tile: 'curb', tx: 34, ty: 28, tw: 1, th: 16 },
      { tile: 'asphalt', tx: 30, ty: 0, tw: 4, th: 44 },

      // --- Pasos peatonales sobre la avenida ---
      { tile: 'crosswalk', tx: 16, ty: 20, tw: 4, th: 6 },
      { tile: 'crosswalk', tx: 34, ty: 20, tw: 4, th: 6 },

      // --- Bahía de la parada de bus ---
      { tile: 'sidewalk', tx: 37, ty: 28, tw: 9, th: 4 },

      // --- Plaza abierta (suroeste) ---
      { tile: 'concrete', tx: 2, ty: 29, tw: 9, th: 7 },
      { tile: 'plaza', tx: 3, ty: 30, tw: 7, th: 6 },

      // --- Escuela y su patio (sureste) ---
      { tile: 'concrete', tx: 48, ty: 36, tw: 16, th: 6 },
      { tile: 'dirt', tx: 50, ty: 38, tw: 10, th: 2 },
      { tile: 'concrete', tx: 52, ty: 28, tw: 6, th: 3 },

      // --- Bloque sur: callejones, terrazas y escaleras ---
      { tile: 'dirt', tx: 2, ty: 28, tw: 26, th: 1 },
      { tile: 'dirt', tx: 10, ty: 28, tw: 2, th: 9 },
      { tile: 'dirt', tx: 18, ty: 28, tw: 2, th: 9 },
      { tile: 'grassWorn', tx: 2, ty: 37, tw: 26, th: 5 },
      { tile: 'dirt', tx: 2, ty: 42, tw: 26, th: 2 },
      { tile: 'dirt', tx: 2, ty: 35, tw: 26, th: 2 },
      { tile: 'stairs', tx: 5, ty: 35, tw: 2, th: 2 },
      { tile: 'stairs', tx: 15, ty: 35, tw: 2, th: 2 },

      // --- Variaciones de grama y acera ---
      { tile: 'grass2', tx: 55, ty: 1, tw: 9, th: 7 },
      { tile: 'grass2', tx: 56, ty: 10, tw: 8, th: 3 },
      { tile: 'grass2', tx: 8, ty: 40, tw: 8, th: 2 },
      { tile: 'grass2', tx: 2, ty: 1, tw: 8, th: 1 },
      { tile: 'sidewalk2', tx: 6, ty: 27, tw: 4, th: 1 },
      { tile: 'sidewalk2', tx: 40, ty: 19, tw: 3, th: 1 },
      { tile: 'sidewalk2', tx: 36, ty: 27, tw: 3, th: 1 },
    ],
  },

  // Ancla inferior-central. Todos los edificios quedan separados para dejar
  // pasillos caminables de 2+ tiles entre ellos.
  buildings: [
    // Comercios de la avenida (dan al norte de la acera norte) --------
    { id: 'fonda-nena', kind: 'fonda', x: 120, y: 288 },
    { id: 'minisuper', kind: 'minisuper', x: 248, y: 288 },
    { id: 'estacion-metro', kind: 'metro', x: 400, y: 288 },

    // Terraza noroeste: casas y apartamento mirando al pasillo ---------
    { id: 'casa-terraza-1', kind: 'house-b', x: 56, y: 192 },
    { id: 'casa-terraza-2', kind: 'house-a', x: 152, y: 192 },
    { id: 'casa-terraza-3', kind: 'house-c', x: 272, y: 192 },
    { id: 'apartamento-terraza', kind: 'apartment-b', x: 400, y: 192 },

    // Parada de bus ------------------------------------------------
    { id: 'parada-bus', kind: 'bus-stop', x: 648, y: 480 },

    // Escuela ------------------------------------------------------
    { id: 'escuela', kind: 'school', x: 880, y: 576 },

    // Bloque residencial suroeste ----------------------------------
    { id: 'casa-sur-1', kind: 'house-c', x: 240, y: 560 },
    { id: 'apartamento-sur', kind: 'apartment-a', x: 368, y: 560 },
    { id: 'casa-sur-2', kind: 'house-b', x: 64, y: 656 },
    { id: 'casa-sur-3', kind: 'house-a', x: 192, y: 656 },
    { id: 'casa-sur-4', kind: 'house-c', x: 320, y: 672 },

    // Bloque residencial sureste -----------------------------------
    { id: 'casa-este-1', kind: 'house-a', x: 648, y: 608 },
    { id: 'casa-este-2', kind: 'house-b', x: 752, y: 608 },
    { id: 'casa-este-3', kind: 'house-a', x: 920, y: 688 },
  ],

  // Props decorativos. x,y = base (pies). kind válido de src/world/defs.js.
  props: [
    // Palmeras -----------------------------------------------------
    { kind: 'palm', x: 200, y: 72 },
    { kind: 'palm', x: 24, y: 120 },
    { kind: 'palm', x: 48, y: 520 },
    { kind: 'palm', x: 176, y: 536 },
    { kind: 'palm', x: 872, y: 116 },
    { kind: 'palm', x: 1000, y: 400 },
    { kind: 'palm', x: 1000, y: 656 },
    { kind: 'palm', x: 592, y: 600 },
    { kind: 'palm', x: 24, y: 600 },

// Árboles de mango ---------------------------------------------
    { kind: 'mango-tree', x: 48, y: 56 },
    { kind: 'mango-tree', x: 144, y: 56 },
    { kind: 'mango-tree', x: 240, y: 56 },
    { kind: 'mango-tree', x: 336, y: 56 },
    { kind: 'mango-tree', x: 424, y: 56 },
    { kind: 'mango-tree', x: 864, y: 64 },
    { kind: 'mango-tree', x: 960, y: 64 },
    { kind: 'mango-tree', x: 96, y: 504 },
    { kind: 'mango-tree', x: 848, y: 160 },
    { kind: 'mango-tree', x: 944, y: 240 },
    { kind: 'mango-tree', x: 816, y: 640 },
    { kind: 'mango-tree', x: 128, y: 688 },
    { kind: 'mango-tree', x: 416, y: 688 },
    { kind: 'mango-tree', x: 704, y: 688 },

    // Arbustos (decorativos, atravesables) -------------------------
    { kind: 'bush', x: 864, y: 136 },
    { kind: 'bush', x: 984, y: 200 },
    { kind: 'bush', x: 176, y: 552 },
    { kind: 'bush', x: 800, y: 600 },
    { kind: 'bush', x: 400, y: 688 },
    { kind: 'bush', x: 984, y: 560 },

    // Postes de luz (el sistema dibuja los cables entre cercanos) ---
    { kind: 'power-pole', x: 40, y: 312 },
    { kind: 'power-pole', x: 200, y: 312 },
    { kind: 'power-pole', x: 344, y: 312 },
    { kind: 'power-pole', x: 456, y: 312 },
    { kind: 'power-pole', x: 600, y: 312 },
    { kind: 'power-pole', x: 744, y: 312 },
    { kind: 'power-pole', x: 888, y: 312 },
    { kind: 'power-pole', x: 1000, y: 312 },
    { kind: 'power-pole', x: 88, y: 440 },
    { kind: 'power-pole', x: 280, y: 440 },
    { kind: 'power-pole', x: 464, y: 440 },
    { kind: 'power-pole', x: 776, y: 440 },
    { kind: 'power-pole', x: 960, y: 440 },
    { kind: 'power-pole', x: 568, y: 112 },
    { kind: 'power-pole', x: 568, y: 208 },
    { kind: 'power-pole', x: 568, y: 560 },

    // Verjas: muro de contención de la terraza noroeste -------------
    { kind: 'fence', x: 72, y: 212 },
    { kind: 'fence', x: 88, y: 212 },
    { kind: 'fence', x: 104, y: 212 },
    { kind: 'fence', x: 120, y: 212 },
    { kind: 'fence', x: 136, y: 212 },
    { kind: 'fence', x: 152, y: 212 },
    { kind: 'fence', x: 168, y: 212 },
    { kind: 'fence', x: 184, y: 212 },
    { kind: 'fence', x: 200, y: 212 },
    { kind: 'fence', x: 216, y: 212 },
    { kind: 'fence', x: 232, y: 212 },
    { kind: 'fence', x: 248, y: 212 },
    { kind: 'fence', x: 264, y: 212 },
    { kind: 'fence', x: 280, y: 212 },
    { kind: 'fence', x: 296, y: 212 },
    { kind: 'fence', x: 312, y: 212 },
    { kind: 'fence', x: 328, y: 212 },
    { kind: 'fence', x: 344, y: 212 },
    { kind: 'fence', x: 360, y: 212 },
    { kind: 'fence', x: 376, y: 212 },
    { kind: 'fence', x: 392, y: 212 },
    { kind: 'fence', x: 408, y: 212 },
    { kind: 'fence', x: 424, y: 212 },
    { kind: 'fence', x: 440, y: 212 },

    // Verjas que flanquean la escalinata noroeste -------------------
    { kind: 'fence', x: 8, y: 236 },
    { kind: 'fence', x: 8, y: 256 },
    { kind: 'fence', x: 8, y: 276 },
    { kind: 'fence', x: 64, y: 236 },
    { kind: 'fence', x: 64, y: 256 },
    { kind: 'fence', x: 64, y: 276 },

    // Verjas de contención de la terraza de la cancha ---------------
    { kind: 'fence', x: 592, y: 242 },
    { kind: 'fence', x: 608, y: 242 },
    { kind: 'fence', x: 624, y: 242 },
    { kind: 'fence', x: 752, y: 242 },
    { kind: 'fence', x: 768, y: 242 },
    { kind: 'fence', x: 784, y: 242 },
    { kind: 'fence', x: 800, y: 242 },
    { kind: 'fence', x: 816, y: 242 },

    // Verjas del patio de la escuela (con portón central) -----------
    { kind: 'fence', x: 816, y: 584 },
    { kind: 'fence', x: 832, y: 584 },
    { kind: 'fence', x: 848, y: 584 },
    { kind: 'fence', x: 944, y: 584 },
    { kind: 'fence', x: 960, y: 584 },
    { kind: 'fence', x: 976, y: 584 },

    // Verjas junto a las escaleras del bloque sur -------------------
    { kind: 'fence', x: 72, y: 576 },
    { kind: 'fence', x: 120, y: 576 },
    { kind: 'fence', x: 232, y: 576 },
    { kind: 'fence', x: 280, y: 576 },

    // Cierre del borde inferior ------------------------------------
    { kind: 'fence', x: 8, y: 700 },
    { kind: 'fence', x: 24, y: 700 },
    { kind: 'fence', x: 40, y: 700 },
    { kind: 'fence', x: 456, y: 700 },
    { kind: 'fence', x: 560, y: 700 },
    { kind: 'fence', x: 1000, y: 700 },
    { kind: 'fence', x: 1016, y: 700 },

    // Cierre del borde superior derecho ----------------------------
    { kind: 'fence', x: 848, y: 72 },
    { kind: 'fence', x: 880, y: 72 },
    { kind: 'fence', x: 912, y: 72 },
    { kind: 'fence', x: 944, y: 72 },
    { kind: 'fence', x: 976, y: 72 },
    { kind: 'fence', x: 1000, y: 72 },

    // Bancas -------------------------------------------------------
    { kind: 'bench', x: 72, y: 544 },
    { kind: 'bench', x: 144, y: 560 },
    { kind: 'bench', x: 690, y: 480 },
    { kind: 'bench', x: 600, y: 200 },
    { kind: 'bench', x: 888, y: 152 },
    { kind: 'bench', x: 856, y: 616 },

    // Zafacones ----------------------------------------------------
    { kind: 'trash', x: 136, y: 320 },
    { kind: 'trash', x: 296, y: 320 },
    { kind: 'trash', x: 736, y: 232 },
    { kind: 'trash', x: 928, y: 592 },

    // Letreros -----------------------------------------------------
    { kind: 'sign', x: 432, y: 316 },
    { kind: 'sign', x: 580, y: 424 },
    { kind: 'sign', x: 792, y: 620 },
    { kind: 'sign', x: 48, y: 472 },

    // Conos de tránsito -------------------------------------------
    { kind: 'cone', x: 368, y: 404 },
    { kind: 'cone', x: 388, y: 408 },
    { kind: 'cone', x: 352, y: 412 },

    // Aros de baloncesto ------------------------------------------
    { kind: 'hoop', x: 600, y: 160 },
    { kind: 'hoop', x: 808, y: 160 },

    // Puestos de fruta --------------------------------------------
    { kind: 'stall', x: 168, y: 320 },
    { kind: 'stall', x: 112, y: 552 },
    { kind: 'stall', x: 824, y: 312 },

    // Perros callejeros -------------------------------------------
    { kind: 'dog', x: 48, y: 676 },
    { kind: 'dog', x: 912, y: 168 },

    // Charcos ------------------------------------------------------
    { kind: 'puddle', x: 400, y: 384 },
    { kind: 'puddle', x: 880, y: 360 },
    { kind: 'puddle', x: 296, y: 552 },
    { kind: 'puddle', x: 720, y: 200 },

    // Macetas ------------------------------------------------------
    { kind: 'planter', x: 88, y: 320 },
    { kind: 'planter', x: 224, y: 320 },
    { kind: 'planter', x: 368, y: 216 },
    { kind: 'planter', x: 864, y: 600 },
    { kind: 'planter', x: 344, y: 576 },
    { kind: 'planter', x: 272, y: 576 },
    { kind: 'planter', x: 40, y: 568 },
    { kind: 'planter', x: 160, y: 568 },

    // Vehículos en la avenida -------------------------------------
    { kind: 'taxi', x: 232, y: 404 },
    { kind: 'taxi', x: 824, y: 404 },
    { kind: 'car-blue', x: 944, y: 404 },
    { kind: 'car-red', x: 136, y: 336 },
    { kind: 'diablo-rojo', x: 648, y: 402 },
  ],

  npcs: [
    // Doña Nena, frente a la fonda.
    { id: 'nena', x: 120, y: 310, facing: 'down', wander: 0 },
    // Pipe y Kevin, en la cancha.
    { id: 'pipe', x: 624, y: 144, facing: 'down', wander: 24 },
    { id: 'kevin', x: 720, y: 160, facing: 'down', wander: 32 },
    // Don Chen, frente al minisúper.
    { id: 'chen', x: 248, y: 308, facing: 'down', wander: 0 },
    // Melva, esperando en la parada de bus.
    { id: 'melva', x: 700, y: 492, facing: 'left', wander: 0 },
    // Yolanda, junto a la ventana del apartamento de la terraza.
    { id: 'yolanda', x: 392, y: 218, facing: 'up', wander: 0 },
    // Profe Ana, en el patio de la escuela.
    { id: 'ana', x: 880, y: 600, facing: 'down', wander: 0 },
    // Chofer, junto al diablo rojo y la parada.
    { id: 'chofer', x: 706, y: 432, facing: 'left', wander: 0 },
  ],

  items: [
    // Chancleta perdida en la bahía de la parada, a la vista.
    { id: 'chancla', kind: 'chancla', x: 680, y: 502 },
  ],

  // Matones del Slice A: se paran por la plaza de Los Andes (misión criminal).
  // id = tipo de enemigo (ver src/data/enemies.js).
  enemies: [
    { id: 'maton', x: 128, y: 492, facing: 'down' },
    { id: 'maton', x: 152, y: 500, facing: 'left' },
    { id: 'maton-duro', x: 120, y: 528, facing: 'up' },
    { id: 'maton', x: 64, y: 528, facing: 'right' },
  ],

  // Slice B: infectados que aparecen durante el colapso (ver data/zombies.js).
  zombieSpawns: [
    { id: 'infectado', x: 200, y: 384 },
    { id: 'infectado', x: 480, y: 350 },
    { id: 'infectado', x: 760, y: 384 },
    { id: 'infectado', x: 920, y: 388 },
    { id: 'infectado', x: 120, y: 520 },
    { id: 'infectado', x: 640, y: 210 },
    { id: 'infectado', x: 700, y: 470 },
    { id: 'infectado', x: 860, y: 620 },
  ],

  // Suministros repartidos tras el colapso (id = objeto de items.js).
  supplies: [
    { id: 'vendaje', x: 140, y: 322 },
    { id: 'caja', x: 420, y: 350 },
    { id: 'vendaje', x: 660, y: 460 },
    { id: 'lata', x: 860, y: 560 },
    { id: 'caja', x: 300, y: 600 },
  ],

  zones: [
    // Zonas abiertas (refugio del simulacro de terremoto).
    { id: 'cancha', name: 'Cancha de San Isidro', type: 'open', x: 592, y: 64, w: 224, h: 160 },
    { id: 'plaza', name: 'Plaza de Los Andes', type: 'open', x: 32, y: 464, w: 144, h: 112 },

    // Landmarks.
    { id: 'fonda', name: 'Fonda La Nena', type: 'landmark', x: 64, y: 224, w: 112, h: 96 },
    { id: 'minisuper', name: 'Minisúper El Chen', type: 'landmark', x: 192, y: 224, w: 112, h: 96 },
    { id: 'metro', name: 'Estación de Metro San Isidro', type: 'landmark', x: 352, y: 224, w: 112, h: 96 },
    { id: 'parada', name: 'Parada de Bus', type: 'landmark', x: 592, y: 432, w: 144, h: 96 },
    { id: 'escuela', name: 'Escuela de San Miguelito', type: 'landmark', x: 768, y: 472, w: 176, h: 136 },
  ],
};
