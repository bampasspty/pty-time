// Objetos e inventario de PTY TIME (Fase 3 y 4).
//
// Categorias del §5.3: armas, municiones, alimentos, medicamentos, materiales,
// herramientas y objetos de mision. Aqui viven los consumibles, materiales y
// recetas de fabricacion.

export const ITEMS = Object.freeze({
  vendaje: Object.freeze({
    id: 'vendaje',
    name: 'Vendaje',
    category: 'medicina',
    description: 'Cura 25 de vida.',
    heal: 25,
    stack: 5,
    sprite: 'prop-vendaje',
  }),
  botiquin: Object.freeze({
    id: 'botiquin',
    name: 'Botiquín',
    category: 'medicina',
    description: 'Cura 60 de vida. Se fabrica en el taller.',
    heal: 60,
    stack: 3,
    sprite: 'prop-botiquin',
  }),
  lata: Object.freeze({
    id: 'lata',
    name: 'Lata de atún',
    category: 'alimento',
    description: 'Comida para el hambre.',
    hunger: 25,
    stack: 5,
    sprite: 'prop-lata',
  }),
  balas9: Object.freeze({
    id: 'balas9',
    name: 'Caja de balas',
    category: 'municion',
    description: 'Suma 8 balas a la reserva de la 9.',
    ammo: 8,
    ammoType: 'pistola',
    stack: 9,
    sprite: 'prop-caja',
  }),
  trapo: Object.freeze({
    id: 'trapo',
    name: 'Trapo',
    category: 'material',
    description: 'Tela para vendajes y botiquines.',
    stack: 10,
    sprite: 'prop-trapo',
  }),
  polvora: Object.freeze({
    id: 'polvora',
    name: 'Pólvora',
    category: 'material',
    description: 'Con chatarra se convierte en balas.',
    stack: 10,
    sprite: 'prop-polvora',
  }),
  metal: Object.freeze({
    id: 'metal',
    name: 'Chatarra',
    category: 'material',
    description: 'Metal para fabricar munición.',
    stack: 10,
    sprite: 'prop-metal',
  }),
  medicina: Object.freeze({
    id: 'medicina',
    name: 'Medicina',
    category: 'objetivo',
    description: 'Medicinas para Doña Nena.',
    stack: 1,
    sprite: 'prop-medicina',
  }),
});

export const ITEM_IDS = Object.freeze(Object.keys(ITEMS));

export function getItem(id) {
  return ITEMS[id] ?? null;
}

export const STARTING_INVENTORY = Object.freeze([
  Object.freeze({ id: 'vendaje', qty: 2 }),
  Object.freeze({ id: 'lata', qty: 1 }),
]);

// Total de objetos que puede cargar Calito sin mejoras de progresión.
export const INVENTORY_SLOTS = 12;

// Recetas del taller (§5.4). inputs: item -> cantidad; output: item -> cantidad.
export const RECIPES = Object.freeze({
  vendaje: Object.freeze({
    id: 'vendaje',
    name: 'Vendaje',
    inputs: Object.freeze({ trapo: 2 }),
    output: Object.freeze({ id: 'vendaje', qty: 1 }),
  }),
  botiquin: Object.freeze({
    id: 'botiquin',
    name: 'Botiquín',
    inputs: Object.freeze({ vendaje: 2, trapo: 1 }),
    output: Object.freeze({ id: 'botiquin', qty: 1 }),
  }),
  balas9: Object.freeze({
    id: 'balas9',
    name: 'Caja de balas',
    inputs: Object.freeze({ polvora: 1, metal: 1 }),
    output: Object.freeze({ id: 'balas9', qty: 1 }),
  }),
});

export const RECIPE_IDS = Object.freeze(Object.keys(RECIPES));
