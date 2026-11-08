// Supervivencia (PURA, sin Phaser): hambre y resistencia de Calito (§7).
//
// - El hambre baja con el tiempo; a 0 Calito se mueve más lento.
// - La resistencia se gasta al correr (SHIFT) y se recupera parado.
// - Comer (lata) recupera hambre; el descanso recupera resistencia.

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const HUNGER_DRAIN_MS = 15000; // 1 punto de hambre cada 15 s
export const STAMINA_SPRINT_PER_S = 12;
export const STAMINA_REGEN_PER_S = 6;
export const SPRINT_FACTOR = 1.45;

export class SurvivalSystem {
  constructor(save = {}) {
    const src = save?.survival && typeof save.survival === 'object' ? save.survival : save ?? {};
    const hunger = Number(src.hunger);
    const stamina = Number(src.stamina);
    this.hunger = Number.isFinite(hunger) ? clamp(hunger, 0, 100) : 100;
    this.stamina = Number.isFinite(stamina) ? clamp(stamina, 0, 100) : 100;
  }

  get hungry() {
    return this.hunger <= 0;
  }

  get speedFactor() {
    return this.hungry ? 0.88 : 1;
  }

  get canSprint() {
    return this.stamina > 5 && !this.hungry;
  }

  tick(deltaMs, { sprinting = false } = {}) {
    const dt = Math.max(0, Number(deltaMs) || 0);
    this.hunger = clamp(this.hunger - dt / HUNGER_DRAIN_MS, 0, 100);
    if (sprinting && this.stamina > 0) {
      this.stamina = clamp(this.stamina - (dt / 1000) * STAMINA_SPRINT_PER_S, 0, 100);
    } else {
      this.stamina = clamp(this.stamina + (dt / 1000) * STAMINA_REGEN_PER_S, 0, 100);
    }
    return { hunger: this.hunger, stamina: this.stamina };
  }

  eat(amount) {
    this.hunger = clamp(this.hunger + Math.max(0, Number(amount) || 0), 0, 100);
    return this.hunger;
  }

  rest(amount) {
    this.stamina = clamp(this.stamina + Math.max(0, Number(amount) || 0), 0, 100);
    return this.stamina;
  }

  toSave() {
    return { hunger: Math.round(this.hunger * 10) / 10, stamina: Math.round(this.stamina * 10) / 10 };
  }
}
