// Fabricacion (PURA, sin Phaser): recetas del taller sobre el inventario.
import { RECIPES, getItem } from '../data/items.js';

export class CraftingSystem {
  // Lista de recetas con lo que falta para poder fabricarlas.
  list(inventory) {
    return Object.keys(RECIPES).map((id) => {
      const recipe = RECIPES[id];
      const inputs = Object.entries(recipe.inputs).map(([itemId, qty]) => ({
        id: itemId,
        name: getItem(itemId)?.name ?? itemId,
        qty,
        have: inventory.count(itemId),
        ok: inventory.count(itemId) >= qty,
      }));
      return { ...recipe, inputs, canCraft: inputs.every((entry) => entry.ok) };
    });
  }

  canCraft(inventory, recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return false;
    return Object.entries(recipe.inputs).every(([id, qty]) => inventory.count(id) >= qty);
  }

  // Consume los materiales y entrega el objeto. No toca el inventario si falta algo.
  craft(inventory, recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return { crafted: false, reason: 'unknown-recipe' };
    if (!this.canCraft(inventory, recipeId)) return { crafted: false, reason: 'missing-materials' };
    for (const [id, qty] of Object.entries(recipe.inputs)) inventory.remove(id, qty);
    const output = getItem(recipe.output.id);
    const added = inventory.add(recipe.output.id, recipe.output.qty);
    if (added.added <= 0) {
      // Sin espacio: devuelve los materiales para no perderlos.
      for (const [id, qty] of Object.entries(recipe.inputs)) inventory.add(id, qty);
      return { crafted: false, reason: 'inventory-full' };
    }
    return {
      crafted: true,
      recipe,
      item: output,
      qty: added.added,
      message: 'Fabricaste: ' + (output?.name ?? recipeId),
    };
  }
}
