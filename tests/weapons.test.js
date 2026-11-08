import test from 'node:test';
import assert from 'node:assert/strict';
import { AMMO_TYPES, STARTING_WEAPONS, WEAPON_IDS, WEAPONS, getWeapon } from '../src/data/weapons.js';
import { CombatSystem } from '../src/systems/CombatSystem.js';

test('catalogo de armas completo', () => {
  assert.deepEqual([...WEAPON_IDS].sort(), ['escopeta', 'pistola', 'puno', 'rifle', 'subfusil', 'tubo']);
  for (const id of WEAPON_IDS) {
    const weapon = WEAPONS[id];
    assert.equal(weapon.id, id);
    assert.ok(weapon.name.length > 0);
    assert.ok(['melee', 'pistol', 'smg', 'shotgun', 'rifle'].includes(weapon.type), id);
    assert.ok(weapon.damage > 0, id);
    assert.ok(weapon.cooldownMs > 0, id);
  }
  assert.deepEqual([...AMMO_TYPES].sort(), ['escopeta', 'pistola', 'rifle', 'subfusil']);
  assert.deepEqual([...STARTING_WEAPONS], ['puno', 'pistola']);
});

test('Calito empieza con puno y pistola y puede ciclar', () => {
  const combat = new CombatSystem({});
  assert.deepEqual(combat.owned, ['puno', 'pistola']);
  assert.equal(combat.weaponId, 'pistola');
  assert.equal(combat.cycleWeapon(), true);
  assert.equal(combat.weaponId, 'puno');
  assert.equal(combat.cycleWeapon(), true);
  assert.equal(combat.weaponId, 'pistola');
});

test('recoger un arma nueva le da cargador y munición inicial', () => {
  const combat = new CombatSystem({});
  assert.equal(combat.addWeapon('subfusil'), true);
  assert.equal(combat.owns('subfusil'), true);
  assert.equal(combat.addWeapon('subfusil'), false);
  assert.equal(combat.equip('subfusil'), true);
  assert.equal(combat.weaponId, 'subfusil');
  assert.equal(combat.loaded, WEAPONS.subfusil.magazine);
  assert.equal(combat.reserve, WEAPONS.subfusil.starterAmmo);
  assert.equal(combat.cycleWeapon(), true);
  assert.notEqual(combat.weaponId, 'subfusil');
});

test('no se puede equipar un arma que no se tiene', () => {
  const combat = new CombatSystem({});
  assert.equal(combat.equip('rifle'), false);
  assert.equal(combat.weaponId, 'pistola');
});

test('la escopeta dispara perdigones', () => {
  const combat = new CombatSystem({});
  combat.addWeapon('escopeta');
  combat.equip('escopeta');
  const shot = combat.tryFire(1000);
  assert.equal(shot.fired, true);
  assert.equal(shot.pellets, 5);
  assert.equal(shot.damage, WEAPONS.escopeta.damage);
  assert.equal(combat.loaded, WEAPONS.escopeta.magazine - 1);
});

test('cada arma usa su propia munición', () => {
  const combat = new CombatSystem({});
  combat.addWeapon('subfusil');
  const reservePistola = combat.reserves.pistola;
  combat.equip('subfusil');
  combat.tryFire(1000);
  assert.equal(combat.reserves.pistola, reservePistola);
  assert.equal(combat.reserves.subfusil, WEAPONS.subfusil.starterAmmo);
  assert.equal(combat.magazines.subfusil, WEAPONS.subfusil.magazine - 1);
});

test('el arma equipada se guarda y se restaura', () => {
  const combat = new CombatSystem({});
  combat.addWeapon('rifle');
  combat.equip('rifle');
  const restored = new CombatSystem({ combat: combat.toSave() });
  assert.deepEqual(restored.owned, ['puno', 'pistola', 'rifle']);
  assert.equal(restored.weaponId, 'rifle');
  assert.equal(restored.magazines.rifle, WEAPONS.rifle.magazine);
  assert.equal(restored.reserves.rifle, WEAPONS.rifle.starterAmmo);
});

test('la vida máxima extra de nivel se aplica sin curar de más', () => {
  const combat = new CombatSystem({ combat: { hp: 40, maxHp: 100 } });
  combat.setMaxHp(120);
  assert.equal(combat.maxHp, 120);
  assert.equal(combat.hp, 60);
});

test('getWeapon tolera ids inválidos', () => {
  assert.equal(getWeapon('tanque').id, 'pistola');
});
