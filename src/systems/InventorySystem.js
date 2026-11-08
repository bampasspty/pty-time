// Inventario básico de Calito (PURA, sin Phaser).
//
// Slots con cantidad y tope por objeto; capacidad total del §5.3 sin peso todavía.
// El motor de juego decide el efecto de "usar" (curar, sumar balas, etc.).

import { INVENTORY_SLOTS, ITEMS, STARTING_INVENTORY, getItem } from '../data/items.js';

const clampInt = (value, fallback = 0, max = 999) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(max, Math.floor(n)));
};

export class InventorySystem {
  constructor(save = {}) {
    const raw = save?.inventory?.slots ?? save?.slots;
    this.slots = [];
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (this.slots.length >= INVENTORY_SLOTS) break;
        const item = getItem(entry?.id);
        if (!item) continue;
        const qty = clampInt(entry?.qty, 0, item.stack);
        if (qty > 0) this.slots.push({ id: item.id, qty });
      }
    } else {
      for (const entry of STARTING_INVENTORY) this.slots.push({ ...entry });
    }
  }

  get capacity() {
    return INVENTORY_SLOTS;
  }

  get size() {
    return this.slots.length;
  }

  get full() {
    return this.slots.length >= INVENTORY_SLOTS;
  }

  count(id) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot.id === id) total += slot.qty;
    }
    return total;
  }

  has(id, qty = 1) {
    return this.count(id) >= qty;
  }

  // Lista enriquecida para la UI y los toasts.
  list() {
    return this.slots.map((slot) => ({ ...getItem(slot.id), qty: slot.qty }));
  }

  // Devuelve cuánto entró realmente (puede ser 0 si está llena o no existe).
  add(id, qty = 1) {
    const item = getItem(id);
    const amount = clampInt(qty, 0, 99);
    if (!item || amount === 0) return { added: 0, full: this.full };

    let remaining = amount;
    const slot = this.slots.find((entry) => entry.id === id);
    if (slot) {
      const space = item.stack - slot.qty;
      const add = Math.min(space, remaining);
      slot.qty += add;
      remaining -= add;
    }
    while (remaining > 0 && !this.full) {
      const add = Math.min(item.stack, remaining);
      this.slots.push({ id, qty: add });
      remaining -= add;
    }
    return { added: amount - remaining, full: this.full && remaining > 0 };
  }

  remove(id, qty = 1) {
    const amount = clampInt(qty, 0, 999);
    let remaining = amount;
    for (let i = this.slots.length - 1; i >= 0 && remaining > 0; i--) {
      const slot = this.slots[i];
      if (slot.id !== id) continue;
      const take = Math.min(slot.qty, remaining);
      slot.qty -= take;
      remaining -= take;
      if (slot.qty === 0) this.slots.splice(i, 1);
    }
    return amount - remaining;
  }

  // Usa un objeto: devuelve { used, item }. No aplica el efecto (lo hace la escena).
  use(id) {
    const item = getItem(id);
    if (!item || this.count(id) <= 0) return { used: false, item: null };
    this.remove(id, 1);
    return { used: true, item };
  }

  toSave() {
    return { slots: this.slots.map((slot) => ({ ...slot })) };
  }
}
