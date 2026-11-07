// Estado de combate del jugador (PURA, sin Phaser): vida, arma equipada,
// cargador, reserva, recarga, cadencia y enemigos derrotados.
//
// La escena sólo pregunta "¿puedo disparar?" y ejecuta el efecto visual; toda
// la aritmética (munición, daño, tiempos) vive aquí y se prueba con node:test.

import { DEFAULT_WEAPON, STARTING_AMMO, getWeapon } from '../data/weapons.js';

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

export class CombatSystem {
  constructor(save = {}) {
    const src = save?.combat && typeof save.combat === 'object' ? save.combat : save ?? {};
    const player = save?.player && typeof save.player === 'object' ? save.player : {};

    const weapon = getWeapon(src.weaponId);
    this.weaponId = weapon.id;
    this.maxHp = Math.max(1, asInt(src.maxHp ?? player.maxHp, DEFAULT_MAX_HP));
    this.hp = Math.min(this.maxHp, asInt(src.hp ?? player.hp, this.maxHp)) || this.maxHp;

    const defaultMag = weapon.magazine > 0 ? { [weapon.id]: weapon.magazine } : {};
    const defaultReserve = weapon.ammoType ? { [weapon.ammoType]: STARTING_AMMO[weapon.ammoType] ?? 0 } : {};
    this.magazines = sanitizeAmmo(src.magazines, defaultMag);
    this.reserves = sanitizeAmmo(src.reserves, defaultReserve);
    if (weapon.magazine > 0) {
      this.magazines[weapon.id] = Math.min(weapon.magazine, asInt(this.magazines[weapon.id], weapon.magazine));
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

  isReloadingAt(now) {
    return this.reloadingUntil > now;
  }

  reloadRemaining(now) {
    return Math.max(0, this.reloadingUntil - now);
  }

  equip(weaponId) {
    if (!getWeapon(weaponId) || getWeapon(weaponId).id !== weaponId) return false;
    if (weaponId === this.weaponId) return false;
    this.weaponId = weaponId;
    this.cooldownUntil = 0;
    this.reloadingUntil = 0;
    return true;
  }

  canFire(now) {
    if (this.dead) return { ok: false, reason: 'dead' };
    if (this.isReloadingAt(now)) return { ok: false, reason: 'reloading' };
    if (now < this.cooldownUntil) return { ok: false, reason: 'cooldown' };
    if (this.weapon.magazine > 0 && this.loaded <= 0) return { ok: false, reason: 'empty' };
    return { ok: true, reason: null };
  }

  // Devuelve { fired, reason, damage }. Si dispara, descuenta munición y fija
  // el próximo instante en que se puede volver a disparar.
  tryFire(now) {
    const check = this.canFire(now);
    if (!check.ok) return { fired: false, reason: check.reason, damage: 0 };

    this.cooldownUntil = now + this.weapon.cooldownMs;
    if (this.weapon.magazine > 0) {
      this.magazines[this.weaponId] = Math.max(0, this.loaded - 1);
    }
    return { fired: true, reason: null, damage: this.weapon.damage };
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
      magazines: { ...this.magazines },
      reserves: { ...this.reserves },
      defeats: this.defeats,
    };
  }
}
