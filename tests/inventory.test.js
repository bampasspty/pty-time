import test from 'node:test';
import assert from 'node:assert/strict';
import { InventorySystem } from '../src/systems/InventorySystem.js';
import { INVENTORY_SLOTS, ITEMS, STARTING_INVENTORY } from '../src/data/items.js';

function item(id) {
  return ITEMS[id];
}

test('inventario inicial de Calito', () => {
  const inv = new InventorySystem({});
  assert.equal(inv.count('vendaje'), 2);
  assert.equal(inv.count('lata'), 1);
  assert.equal(inv.size, STARTING_INVENTORY.length);
  assert.equal(inv.full, false);
});

test('añadir objetos respeta el tope por pila', () => {
  const inv = new InventorySystem({});
  const first = inv.add('vendaje', 10);
  assert.equal(first.added, 10);
  assert.equal(inv.count('vendaje'), 12);

  const lata = inv.add('lata', 10);
  assert.equal(lata.added, 10);
  assert.equal(inv.count('lata'), 11);
});

test('al llenarse la mochila devuelve lo que no entró', () => {
  const inv = new InventorySystem({ inventory: { slots: [] } });
  const result = inv.add('vendaje', 99);
  assert.equal(inv.full, true);
  assert.equal(inv.size, INVENTORY_SLOTS);
  assert.ok(result.added < 99);
  assert.equal(result.full, true);
});

test('quitar y usar consumibles', () => {
  const inv = new InventorySystem({});
  assert.equal(inv.remove('lata', 1), 1);
  assert.equal(inv.count('lata'), 0);

  const used = inv.use('vendaje');
  assert.equal(used.used, true);
  assert.equal(used.item.id, 'vendaje');
  assert.equal(used.item.heal, item('vendaje').heal);
  assert.equal(inv.count('vendaje'), 1);

  assert.equal(inv.use('balas9').used, false);
});

test('no se puede añadir un objeto desconocido', () => {
  const inv = new InventorySystem({});
  const result = inv.add('tanque', 1);
  assert.equal(result.added, 0);
  assert.equal(inv.count('tanque'), 0);
});

test('sanitiza un guardado inválido', () => {
  const inv = new InventorySystem({
    inventory: {
      slots: [
        { id: 'vendaje', qty: 999 },
        { id: 'fantasma', qty: 3 },
        { id: 'lata', qty: -2 },
        { id: 'balas9', qty: 1 },
      ],
    },
  });
  assert.equal(inv.count('vendaje'), item('vendaje').stack);
  assert.equal(inv.count('fantasma'), 0);
  assert.equal(inv.count('lata'), 0);
  assert.equal(inv.count('balas9'), 1);
});

test('ida y vuelta del inventario', () => {
  const inv = new InventorySystem({});
  inv.add('balas9', 2);
  const restored = new InventorySystem({ inventory: inv.toSave() });
  assert.equal(restored.count('vendaje'), 2);
  assert.equal(restored.count('balas9'), 2);
  assert.deepEqual(restored.list().map((entry) => entry.id).sort(), ['balas9', 'lata', 'vendaje']);
});
