// Definiciones compartidas del mundo. Las dimensiones de imagen deben coincidir
// exactamente con docs/ASSET_CONTRACT.md.
//
// body: caja de colisión relativa al ancla inferior-central del sprite.
//   width/height en píxeles; gap = separación entre el borde inferior del sprite
//   y el borde inferior de la caja (normalmente 2-6 px).
// depth se calcula con la Y del ancla (pies), así que los objetos se ordenan solos.

export const TILE_SIZE = 16;

export const TILE_INDEX = Object.freeze({
  grass: 0,
  grass2: 1,
  asphalt: 2,
  asphalt2: 3,
  sidewalk: 4,
  sidewalk2: 5,
  curb: 6,
  dirt: 7,
  stairs: 8,
  court: 9,
  crosswalk: 10,
  plaza: 11,
  grassWorn: 12,
  asphaltPatch: 13,
  concrete: 14,
  void: 15,
});

export const BUILDINGS = Object.freeze({
  'house-a': { image: 'building-house-a', width: 80, height: 64, body: { width: 74, height: 44, gap: 4 } },
  'house-b': { image: 'building-house-b', width: 64, height: 64, body: { width: 58, height: 44, gap: 4 } },
  'house-c': { image: 'building-house-c', width: 96, height: 80, body: { width: 90, height: 58, gap: 4 } },
  'apartment-a': { image: 'building-apartment-a', width: 96, height: 88, body: { width: 90, height: 64, gap: 4 } },
  'apartment-b': { image: 'building-apartment-b', width: 80, height: 96, body: { width: 74, height: 72, gap: 4 } },
  fonda: { image: 'building-fonda', width: 96, height: 64, body: { width: 90, height: 46, gap: 4 } },
  minisuper: { image: 'building-minisuper', width: 96, height: 64, body: { width: 90, height: 46, gap: 4 } },
  metro: { image: 'building-metro', width: 80, height: 56, body: { width: 74, height: 38, gap: 4 } },
  'bus-stop': { image: 'building-bus-stop', width: 48, height: 40, body: { width: 42, height: 22, gap: 4 } },
  school: { image: 'building-school', width: 112, height: 80, body: { width: 106, height: 58, gap: 4 } },
});

// solid = caja de colisión; null = decorativo (se puede atravesar).
export const PROPS = Object.freeze({
  palm: { image: 'prop-palm', width: 32, height: 48, solid: { width: 8, height: 8, gap: 2 } },
  'mango-tree': { image: 'prop-mango-tree', width: 32, height: 40, solid: { width: 8, height: 8, gap: 2 } },
  bush: { image: 'prop-bush', width: 16, height: 16, solid: null },
  'power-pole': { image: 'prop-power-pole', width: 16, height: 48, solid: { width: 6, height: 6, gap: 2 } },
  bench: { image: 'prop-bench', width: 24, height: 16, solid: { width: 22, height: 8, gap: 2 } },
  trash: { image: 'prop-trash', width: 12, height: 16, solid: { width: 10, height: 8, gap: 1 } },
  fence: { image: 'prop-fence', width: 16, height: 16, solid: { width: 16, height: 6, gap: 2 } },
  sign: { image: 'prop-sign', width: 16, height: 24, solid: { width: 6, height: 5, gap: 1 } },
  cone: { image: 'prop-cone', width: 8, height: 8, solid: null },
  hoop: { image: 'prop-hoop', width: 16, height: 24, solid: { width: 10, height: 6, gap: 1 } },
  stall: { image: 'prop-stall', width: 40, height: 32, solid: { width: 36, height: 18, gap: 2 } },
  dog: { image: 'prop-dog', width: 16, height: 16, solid: null },
  puddle: { image: 'prop-puddle', width: 16, height: 8, solid: null },
  planter: { image: 'prop-planter', width: 16, height: 16, solid: { width: 14, height: 8, gap: 1 } },
  taxi: { image: 'prop-taxi', width: 32, height: 24, solid: { width: 30, height: 16, gap: 2 } },
  'car-blue': { image: 'prop-car-blue', width: 32, height: 24, solid: { width: 30, height: 16, gap: 2 } },
  'car-red': { image: 'prop-car-red', width: 32, height: 24, solid: { width: 30, height: 16, gap: 2 } },
  'diablo-rojo': { image: 'prop-diablo-rojo', width: 64, height: 32, solid: { width: 62, height: 24, gap: 2 } },
  chancla: { image: 'prop-chancla', width: 12, height: 8, solid: null, pickup: true },
  // Suministros del Slice B (no se colocan en el mapa: los instancia la escena).
  vendaje: { image: 'prop-vendaje', width: 16, height: 16, solid: null, pickup: true },
  lata: { image: 'prop-lata', width: 16, height: 16, solid: null, pickup: true },
  caja: { image: 'prop-caja', width: 16, height: 16, solid: null, pickup: true },
  // Armas que se recogen del mapa (Fase 3).
  tubo: { image: 'prop-tubo', width: 16, height: 16, solid: null, pickup: true },
  subfusil: { image: 'prop-subfusil', width: 16, height: 16, solid: null, pickup: true },
  escopeta: { image: 'prop-escopeta', width: 16, height: 16, solid: null, pickup: true },
  rifle: { image: 'prop-rifle', width: 16, height: 16, solid: null, pickup: true },
  // Materiales y objetos de la fase 3/4.
  trapo: { image: 'prop-trapo', width: 16, height: 16, solid: null, pickup: true },
  polvora: { image: 'prop-polvora', width: 16, height: 16, solid: null, pickup: true },
  metal: { image: 'prop-metal', width: 16, height: 16, solid: null, pickup: true },
  botiquin: { image: 'prop-botiquin', width: 16, height: 16, solid: null, pickup: true },
  medicina: { image: 'prop-medicina', width: 16, height: 16, solid: null, pickup: true },
});

export const PLAYER_VARIANTS = Object.freeze([
  { id: 'm-red', body: 'm', shirt: 'red', label: 'Camisa roja' },
  { id: 'm-blue', body: 'm', shirt: 'blue', label: 'Camisa azul' },
  { id: 'm-yellow', body: 'm', shirt: 'yellow', label: 'Camisa amarilla' },
  { id: 'm-green', body: 'm', shirt: 'green', label: 'Camisa verde' },
  { id: 'f-red', body: 'f', shirt: 'red', label: 'Camisa roja' },
  { id: 'f-blue', body: 'f', shirt: 'blue', label: 'Camisa azul' },
  { id: 'f-yellow', body: 'f', shirt: 'yellow', label: 'Camisa amarilla' },
  { id: 'f-green', body: 'f', shirt: 'green', label: 'Camisa verde' },
]);

export const NPC_IDS = Object.freeze([
  'nena',
  'pipe',
  'chen',
  'melva',
  'kevin',
  'yolanda',
  'ana',
  'chofer',
]);

export const ZONE_TYPES = Object.freeze({
  open: { label: 'Zona abierta', safe: true },
  landmark: { label: 'Lugar', safe: false },
});
