// Objetos del inventario básico (Slice B, §5.3 del Documento Maestro).
//
// Categorías ya previstas en el documento: armas, municiones, alimentos,
// medicamentos, materiales, herramientas y objetos de misión. En este primer
// inventario solo hay consumibles y munición; armas/materiales llegan después.

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
  lata: Object.freeze({
    id: 'lata',
    name: 'Lata de atún',
    category: 'alimento',
    description: 'Comida para cuando el hambre apriete.',
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
