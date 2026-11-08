// Progresion de Calito (PURA, sin Phaser): experiencia, niveles y bonificaciones.
//
// El Documento Maestro (§5.5) pide mejorar salud, precision, combate y capacidad
// con la experiencia. En esta fase cada nivel da:
//   - +10 de vida maxima (y cura ese extra),
//   - +5% de dano con todas las armas,
//   - +1 espacio de inventario cada 2 niveles.
// La escena aplica las bonificaciones al subir de nivel.

export const MAX_LEVEL = 30;

// Experiencia necesaria para pasar del nivel actual al siguiente.
export function xpForLevel(level) {
  const safe = Math.max(1, Math.floor(Number(level) || 1));
  return 80 + (safe - 1) * 40;
}

const clampInt = (value, min, max, fallback = min) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
};

export class ProgressionSystem {
  constructor(save = {}) {
    const src = save?.progression && typeof save.progression === 'object' ? save.progression : save ?? {};
    this.level = clampInt(src.level, 1, MAX_LEVEL, 1);
    this.xp = clampInt(src.xp, 0, 9999999, 0);
    // Normaliza guardados que tengan mas XP que el nivel actual.
    while (this.level < MAX_LEVEL && this.xp >= xpForLevel(this.level)) {
      this.xp -= xpForLevel(this.level);
      this.level += 1;
    }
    if (this.level >= MAX_LEVEL) this.xp = Math.min(this.xp, xpForLevel(MAX_LEVEL));
  }

  get xpNext() {
    return xpForLevel(this.level);
  }

  get progress() {
    return this.xpNext > 0 ? Math.min(1, this.xp / this.xpNext) : 0;
  }

  get maxLevel() {
    return this.level >= MAX_LEVEL;
  }

  get maxHpBonus() {
    return (this.level - 1) * 10;
  }

  get damageMultiplier() {
    return 1 + (this.level - 1) * 0.05;
  }

  get capacityBonus() {
    return Math.floor((this.level - 1) / 2);
  }

  damageFor(baseDamage) {
    return Math.max(1, Math.round(Number(baseDamage || 0) * this.damageMultiplier));
  }

  addXp(amount) {
    const gained = clampInt(amount, 0, 999999, 0);
    if (gained === 0 || this.maxLevel) {
      return { gained: 0, levelsGained: 0, level: this.level, xp: this.xp, xpNext: this.xpNext, leveledUp: false };
    }
    this.xp += gained;
    let levelsGained = 0;
    while (this.level < MAX_LEVEL && this.xp >= xpForLevel(this.level)) {
      this.xp -= xpForLevel(this.level);
      this.level += 1;
      levelsGained += 1;
    }
    if (this.level >= MAX_LEVEL) {
      this.level = MAX_LEVEL;
      this.xp = Math.min(this.xp, xpForLevel(MAX_LEVEL));
    }
    return {
      gained,
      levelsGained,
      level: this.level,
      xp: this.xp,
      xpNext: this.xpNext,
      leveledUp: levelsGained > 0,
    };
  }

  toSave() {
    return { level: this.level, xp: this.xp };
  }
}
