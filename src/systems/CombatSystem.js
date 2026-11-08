// Estado de combate del jugador (PURA, sin Phaser): vida, armas en propiedad,
// cargador, reserva, recarga, cadencia y enemigos derrotados.
//
// La escena sólo pregunta "¿puedo disparar?" y ejecuta el efecto visual; toda
// la aritmética (munición, daño, tiempos) vive aquí y se prueba con node:test.

import {
  AMMO_TYPES,
  DEFAULT_WEAPON,
  STARTING_AMMO,
  STARTING_WEAPONS,
  WEAPONS,
  getWeapon,
  isWeaponId,
} from '../data/weapons.js';

const DEFAULT_MAX_HP = 100;
const AMMO_TYPE = /^[a-z][a-z0-9-]{1,15}$/i;

const asInt = (value, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(9999, Math.floor(n)));
};

function sanitizeAmmo(raw, fallback) {
  const out = { ...fallback };
  if (!raw || typeof raw !== 'object') return out;
  for (const [type, amount] of Object.entries(raw)) {
    if (AMMO_TYPE.test(type)) out[type] = asInt(amount, out[type] ?? 0);
  }
  return out;
}

function defaultMagazines() {
  const mags = {};
  for (const weapon of Object.values(WEAPONS)) {
    if (weapon.magazine > 0) mags[weapon.id] = weapon.magazine;
  }
  return mags;
}

function sanitizeOwned(raw) {
  const owned = [];
  const source = Array.isArray(raw) ? raw : [];
  for (const id of source) {
    if (isWeaponId(id) && !owned.includes(id)) owned.push(id);
  }
  for (const id of STARTING_WEAPONS) {
    if (!owned.includes(id)) owned.push(id);
  }
  return owned;
}

export class CombatSystem {
  constructor(save = {}) {
    const src = save?.combat && typeof save.combat === 'object' ? save.combat : save ?? {};
    const player = save?.player && typeof save.player === 'object' ? save.player : {};

    this.owned = sanitizeOwned(src.owned);
    const wanted = isWeaponId(src.weaponId) && this.owned.includes(src.weaponId)
      ? src.weaponId
      : this.owned.includes(DEFAULT_WEAPON)
        ? DEFAULT_WEAPON
        : this.owned[0];
    this.weaponId = wanted;

    this.maxHp = Math.max(1, asInt(src.maxHp ?? player.maxHp, DEFAULT_MAX_HP));
    this.hp = Math.min(this.maxHp, asInt(src.hp ?? player.hp, this.maxHp)) || this.maxHp;

    this.magazines = sanitizeAmmo(src.magazines, defaultMagazines());
    for (const weapon of Object.values(WEAPONS)) {
      if (weapon.magazine <= 0) continue;
      this.magazines[weapon.id] = Math.min(
        weapon.magazine,
        asInt(this.magazines[weapon.id], weapon.magazine),
      );
    }

    const reserveDefaults = {};
    for (const type of AMMO_TYPES) reserveDefaults[type] = asInt(STARTING_AMMO[type], 0);
    this.reserves = sanitizeAmmo(src.reserves, reserveDefaults);
    for (const type of AMMO_TYPES) {
      if (!Number.isFinite(this.reserves[type])) this.reserves[type] = 0;
    }

    this.cooldownUntil = 0;
    this.reloadingUntil = 0;
    this.reloadWeaponId = null;
    this.defeats = asInt(src.defeats, 0);
  }

  get weapon() {
    return getWeapon(this.weaponId);
  }

  get loaded() {
    return this.magazines[this.weaponId] ?? 0;
  }

  get reserve() {
    const type = this.weapon.ammoType;
    return type ? this.reserves[type] ?? 0 : 0;
  }

  get maxLoaded() {
    return this.weapon.magazine;
  }

  get dead() {
    return this.hp <= 0;
  }

  owns(weaponId) {
    return this.owned.includes(weaponId);
  }

  isReloadingAt(now) {
    return this.reloadingUntil > now;
  }

  reloadRemaining(now) {
    return Math.max(0, this.reloadingUntil - now);
  }

  equip(weaponId) {
    if (!isWeaponId(weaponId) || !this.owns(weaponId)) return false;
    if (weaponId === this.weaponId) return false;
    this.weaponId = weaponId;
    this.cooldownUntil = 0;
    this.reloadingUntil = 0;
    return true;
  }

  // Consigue un arma nueva. Devuelve true sólo la primera vez.
  addWeapon(weaponId) {
    if (!isWeaponId(weaponId) || this.owns(weaponId)) return false;
    this.owned.push(weaponId);
    const weapon = getWeapon(weaponId);
    if (weapon.magazine > 0 && (this.magazines[weapon.id] ?? 0) <= 0) {
      this.magazines[weapon.id] = weapon.magazine;
    }
    if (weapon.ammoType && (this.reserves[weapon.ammoType] ?? 0) <= 0 && weapon.starterAmmo > 0) {
      this.reserves[weapon.ammoType] = weapon.starterAmmo;
    }
    return true;
  }

  // Cicla entre las armas en propiedad.
  cycleWeapon(step = 1) {
    if (this.owned.length <= 1) return false;
    const index = Math.max(0, this.owned.indexOf(this.weaponId));
    const next = (index + (step >= 0 ? 1 : -1) + this.owned.length) % this.owned.length;
    return this.equip(this.owned[next]);
  }

  // Ajusta la vida máxima (bonificaciones de nivel) y cura la diferencia.
  setMaxHp(target) {
    const value = Math.max(1, asInt(target, this.maxHp));
    if (value === this.maxHp) return this.hp;
    const delta = value - this.maxHp;
    this.maxHp = value;
    const healed = Math.max(0, Math.min(delta, value - this.hp));
    this.hp = Math.min(value, Math.max(1, this.hp + healed));
    return this.hp;
  }

  canFire(now) {
    if (this.dead) return { ok: false, reason: 'dead' };
    if (this.isReloadingAt(now)) return { ok: false, reason: 'reloading' };
    if (now < this.cooldownUntil) return { ok: false, reason: 'cooldown' };
    if (this.weapon.magazine > 0 && this.loaded <= 0) return { ok: false, reason: 'empty' };
    return { ok: true, reason: null };
  }

  // Devuelve { fired, reason, damage, pellets }. Si dispara, descuenta munición
  // y fija el próximo instante en que se puede volver a disparar.
  tryFire(now) {
    const check = this.canFire(now);
    if (!check.ok) return { fired: false, reason: check.reason, damage: 0, pellets: 1 };

    this.cooldownUntil = now + this.weapon.cooldownMs;
    if (this.weapon.magazine > 0) {
      this.magazines[this.weaponId] = Math.max(0, this.loaded - 1);
    }
    return {
      fired: true,
      reason: null,
      damage: this.weapon.damage,
      pellets: this.weapon.pellets ?? 1,
    };
  }

  canReload() {
    const type = this.weapon.ammoType;
    if (!type) return false;
    return this.loaded < this.weapon.magazine && (this.reserves[type] ?? 0) > 0;
  }

  startReload(now) {
    if (!this.canReload() || this.isReloadingAt(now)) return false;
    this.reloadingUntil = now + this.weapon.reloadMs;
    this.reloadWeaponId = this.weaponId;
    return true;
  }

  // Debe llamarse cada frame: completa la recarga cuando corresponde.
  tick(now) {
    if (!this.reloadingUntil || this.reloadingUntil > now) return { reloaded: false };
    const weapon = getWeapon(this.reloadWeaponId ?? this.weaponId);
    const type = weapon.ammoType;
    if (type) {
      const missing = weapon.magazine - (this.magazines[weapon.id] ?? 0);
      const available = this.reserves[type] ?? 0;
      const moved = Math.min(missing, available);
      this.magazines[weapon.id] = (this.magazines[weapon.id] ?? 0) + moved;
      this.reserves[type] = available - moved;
    }
    this.reloadingUntil = 0;
    this.reloadWeaponId = null;
    return { reloaded: true };
  }

  addAmmo(type, amount) {
    if (!type) return 0;
    const add = asInt(amount, 0);
    this.reserves[type] = (this.reserves[type] ?? 0) + add;
    return add;
  }

  damage(amount) {
    const dmg = asInt(amount, 0);
    this.hp = Math.max(0, this.hp - dmg);
    return { hp: this.hp, dead: this.dead };
  }

  heal(amount) {
    const heal = asInt(amount, 0);
    this.hp = Math.min(this.maxHp, this.hp + heal);
    return this.hp;
  }

  addDefeat(count = 1) {
    this.defeats += asInt(count, 1);
    return this.defeats;
  }

  // Revivir en el punto de reaparición: vida completa y cargador lleno si hay reserva.
  respawn() {
    this.hp = this.maxHp;
    this.cooldownUntil = 0;
    this.reloadingUntil = 0;
    if (this.weapon.magazine > 0) {
      const type = this.weapon.ammoType;
      const missing = this.weapon.magazine - this.loaded;
      const available = type ? this.reserves[type] ?? 0 : 0;
      const moved = Math.min(missing, available);
      this.magazines[this.weaponId] = this.loaded + moved;
      if (type) this.reserves[type] = available - moved;
    }
    return this.hp;
  }

  toSave() {
    return {
      maxHp: this.maxHp,
      hp: this.hp,
      weaponId: this.weaponId,
      owned: [...this.owned],
      magazines: { ...this.magazines },
      reserves: { ...this.reserves },
      defeats: this.defeats,
    };
  }
}
