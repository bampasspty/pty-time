import test from 'node:test';
import assert from 'node:assert/strict';
import { CraftingSystem } from '../src/systems/CraftingSystem.js';
import { SurvivalSystem } from '../src/systems/SurvivalSystem.js';
import { InventorySystem } from '../src/systems/InventorySystem.js';

test('fabricar un vendaje consume 2 trapos', () => {
  const inv = new InventorySystem({ inventory: { slots: [{ id: 'trapo', qty: 3 }] } });
  const crafting = new CraftingSystem();
  assert.equal(crafting.canCraft(inv, 'vendaje'), true);
  const result = crafting.craft(inv, 'vendaje');
  assert.equal(result.crafted, true);
  assert.equal(inv.count('trapo'), 1);
  assert.equal(inv.count('vendaje'), 1);
});

test('fabricar un botiquín y munición', () => {
  const inv = new InventorySystem({
    inventory: {
      slots: [
        { id: 'vendaje', qty: 2 },
        { id: 'trapo', qty: 1 },
        { id: 'polvora', qty: 1 },
        { id: 'metal', qty: 1 },
      ],
    },
  });
  const crafting = new CraftingSystem();
  assert.equal(crafting.craft(inv, 'botiquin').crafted, true);
  assert.equal(inv.count('botiquin'), 1);
  assert.equal(crafting.craft(inv, 'balas9').crafted, true);
  assert.equal(inv.count('balas9'), 1);
  assert.equal(inv.count('polvora'), 0);
});

test('no se fabrica sin materiales', () => {
  const inv = new InventorySystem({ inventory: { slots: [] } });
  const crafting = new CraftingSystem();
  const result = crafting.craft(inv, 'vendaje');
  assert.equal(result.crafted, false);
  assert.equal(result.reason, 'missing-materials');
});

test('el hambre y la resistencia evolucionan', () => {
  const survival = new SurvivalSystem({});
  assert.equal(survival.hunger, 100);
  survival.tick(15000, { sprinting: false });
  assert.ok(survival.hunger < 100);
  survival.eat(25);
  assert.ok(survival.hunger >= 99);
  survival.tick(1000, { sprinting: true });
  assert.ok(survival.stamina < 100);
  assert.equal(survival.canSprint, true);
});

test('sin hambre no se puede correr y se va más lento', () => {
  const survival = new SurvivalSystem({ survival: { hunger: 0, stamina: 100 } });
  assert.equal(survival.hungry, true);
  assert.equal(survival.canSprint, false);
  assert.ok(survival.speedFactor < 1);
});

test('la supervivencia se guarda y se restaura', () => {
  const survival = new SurvivalSystem({});
  survival.tick(60000, { sprinting: true });
  const restored = new SurvivalSystem({ survival: survival.toSave() });
  assert.equal(restored.hunger, survival.hunger);
  assert.equal(restored.stamina, survival.stamina);
});
