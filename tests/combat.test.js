import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSystem } from '../src/systems/CombatSystem.js';

test('estado inicial del jugador', () => {
  const combat = new CombatSystem({});
  assert.equal(combat.hp, 100);
  assert.equal(combat.maxHp, 100);
  assert.equal(combat.weaponId, 'pistola');
  assert.equal(combat.loaded, 8);
  assert.equal(combat.reserve, 24);
  assert.equal(combat.defeats, 0);
});

test('disparar descuenta munición y respeta la cadencia', () => {
  const combat = new CombatSystem({});
  const t0 = 1000;
  const first = combat.tryFire(t0);
  assert.equal(first.fired, true);
  assert.equal(combat.loaded, 7);

  const tooSoon = combat.tryFire(t0 + 10);
  assert.equal(tooSoon.fired, false);
  assert.equal(tooSoon.reason, 'cooldown');
  assert.equal(combat.loaded, 7);

  const later = combat.tryFire(t0 + 400);
  assert.equal(later.fired, true);
  assert.equal(combat.loaded, 6);
});

test('sin balas obliga a recargar y la recarga consume reserva', () => {
  const combat = new CombatSystem({});
  let now = 1000;
  for (let i = 0; i < 8; i++) {
    assert.equal(combat.tryFire(now).fired, true);
    now += 300;
  }
  assert.equal(combat.loaded, 0);

  const empty = combat.tryFire(now);
  assert.equal(empty.fired, false);
  assert.equal(empty.reason, 'empty');

  assert.equal(combat.startReload(now), true);
  assert.equal(combat.isReloadingAt(now + 100), true);
  assert.equal(combat.tick(now + 100).reloaded, false);
  assert.equal(combat.tick(now + 900).reloaded, true);
  assert.equal(combat.loaded, 8);
  assert.equal(combat.reserve, 16);
});

test('recarga manual rellena solo lo que falta', () => {
  const combat = new CombatSystem({});
  combat.tryFire(1000);
  combat.tryFire(1400);
  assert.equal(combat.loaded, 6);
  assert.equal(combat.startReload(1500), true);
  combat.tick(2500);
  assert.equal(combat.loaded, 8);
  assert.equal(combat.reserve, 22);
});

test('sin reserva no se puede recargar', () => {
  const combat = new CombatSystem({ combat: { reserves: { pistola: 0 }, magazines: { pistola: 0 } } });
  assert.equal(combat.canReload(), false);
  assert.equal(combat.startReload(1000), false);
});

test('el arma cuerpo a cuerpo no gasta munición', () => {
  const combat = new CombatSystem({});
  assert.equal(combat.equip('puno'), true);
  assert.equal(combat.weapon.type, 'melee');
  assert.equal(combat.canFire(1000).ok, true);
  assert.equal(combat.tryFire(1000).fired, true);
  assert.equal(combat.canReload(), false);
  assert.equal(combat.tryFire(1000 + 500).fired, true);
});

test('daño, muerte y reaparición', () => {
  const combat = new CombatSystem({});
  const hurt = combat.damage(35);
  assert.equal(hurt.hp, 65);
  assert.equal(hurt.dead, false);

  const dead = combat.damage(100);
  assert.equal(dead.hp, 0);
  assert.equal(dead.dead, true);
  assert.equal(combat.canFire(1000).ok, false);

  combat.respawn();
  assert.equal(combat.hp, 100);
  assert.equal(combat.dead, false);
});

test('la reaparición rellena el cargador desde la reserva', () => {
  const combat = new CombatSystem({});
  combat.tryFire(1000);
  combat.tryFire(1400);
  combat.respawn();
  assert.equal(combat.loaded, 8);
  assert.equal(combat.reserve, 22);
});

test('ida y vuelta del estado de combate al guardado', () => {
  const combat = new CombatSystem({});
  combat.damage(30);
  combat.tryFire(1000);
  combat.addDefeat(2);
  combat.addAmmo('pistola', 10);

  const restored = new CombatSystem({ combat: combat.toSave() });
  assert.equal(restored.hp, 70);
  assert.equal(restored.loaded, 7);
  assert.equal(restored.reserve, 34);
  assert.equal(restored.defeats, 2);
});
