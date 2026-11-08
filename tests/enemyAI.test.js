import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/data/enemies.js';
import { ZOMBIES } from '../src/data/zombies.js';
import { alertAI, createAI, isAlerted, killAI, stepAI } from '../src/systems/EnemyAI.js';

const DEF = ENEMIES.maton;

function ctx(overrides = {}) {
  return {
    now: 1000,
    x: 100,
    y: 100,
    player: { x: 400, y: 100 },
    def: DEF,
    worldWidth: 1024,
    worldHeight: 704,
    ...overrides,
  };
}

test('idle cuando el jugador está lejos', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const result = stepAI(ai, ctx());
  assert.equal(result.state, 'idle');
  assert.equal(result.attack, false);
});

test('persigue cuando el jugador entra en el radio de detección', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const near = { x: 100 + DEF.detectRange - 10, y: 100 };
  const result = stepAI(ai, ctx({ player: near }));
  assert.equal(result.state, 'chase');
  assert.ok(result.vx > 0, 'se mueve hacia el jugador');
  assert.equal(result.facing, 'right');
});

test('ataca al llegar al rango de ataque y respeta el cooldown', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const close = { x: 100 + DEF.attackRange - 4, y: 100 };
  const first = stepAI(ai, ctx({ player: close, now: 2000 }));
  assert.equal(first.state, 'attack');
  assert.equal(first.attack, true);

  const second = stepAI(ai, ctx({ player: close, now: 2100 }));
  assert.equal(second.state, 'attack');
  assert.equal(second.attack, false, 'no pega dos veces seguidas');

  const later = stepAI(ai, ctx({ player: close, now: 2000 + DEF.attackCooldownMs }));
  assert.equal(later.attack, true);
});

test('vuelve a idle si el jugador se aleja y no está alertado', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  ai.state = 'chase';
  const result = stepAI(ai, ctx({ player: { x: 900, y: 100 }, now: 5000 }));
  assert.equal(result.state, 'idle');
});

test('un disparo cercano lo deja alertado y persigue', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  alertAI(ai, 1000, 4000);
  assert.equal(isAlerted(ai, 1500), true);
  assert.equal(isAlerted(ai, 6000), false);

  const result = stepAI(ai, ctx({ player: { x: 900, y: 100 }, now: 1500 }));
  assert.equal(result.state, 'chase');
  assert.ok(result.vx > 0);
});

test('el patrón de mirada es de cuatro direcciones', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const below = stepAI(ai, ctx({ player: { x: 100, y: 100 + DEF.detectRange - 5 } }));
  assert.equal(below.facing, 'down');
  const left = stepAI(ai, ctx({ player: { x: 100 - DEF.detectRange + 5, y: 100 } }));
  assert.equal(left.facing, 'left');
});

test('un enemigo muerto no hace nada', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  killAI(ai);
  const result = stepAI(ai, ctx({ player: { x: 100, y: 100 } }));
  assert.equal(result.state, 'dead');
  assert.equal(result.vx, 0);
  assert.equal(result.vy, 0);
  assert.equal(result.attack, false);
});

test('no detecta al jugador si no tiene línea de visión', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const near = { x: 100 + DEF.detectRange - 10, y: 100 };
  const result = stepAI(ai, ctx({ player: near, hasLineOfSight: false }));
  assert.equal(result.state, 'idle');
});

test('si pierde de vista persigue la última posición conocida y luego se rinde', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  const seen = { x: 160, y: 100 };
  const first = stepAI(ai, ctx({ player: seen, now: 1000 }));
  assert.equal(first.state, 'chase');
  assert.equal(ai.lastSeenX, 160);

  const lost = stepAI(ai, ctx({ player: { x: 900, y: 100 }, now: 1200, hasLineOfSight: false }));
  assert.equal(lost.state, 'chase');
  assert.ok(lost.vx > 0, 'va hacia la última posición conocida');

  const arrived = stepAI(ai, {
    ...ctx({ player: { x: 900, y: 100 }, now: 1300, hasLineOfSight: false }),
    x: 160,
    y: 100,
  });
  assert.equal(arrived.state, 'idle');
});

test('sin línea de visión no ataca aunque esté cerca', () => {
  const ai = createAI({ homeX: 100, homeY: 100 });
  alertAI(ai, 1000, 4000);
  const close = { x: 100 + DEF.attackRange - 4, y: 100 };
  const result = stepAI(ai, ctx({ player: close, now: 1200, hasLineOfSight: false }));
  assert.equal(result.attack, false);
  assert.notEqual(result.state, 'attack');
});

test('los dos tipos de matón tienen datos completos', () => {
  for (const [id, def] of Object.entries(ENEMIES)) {
    assert.equal(def.id, id);
    assert.ok(def.sprite.startsWith('enemy-'), id);
    assert.ok(def.maxHp > 0, id);
    assert.ok(def.damage > 0, id);
    assert.ok(def.attackCooldownMs > 0, id);
  }
});

test('los zombis detectan y persiguen sin línea de visión', () => {
  const zombie = ZOMBIES.infectado;
  const ai = createAI({ homeX: 100, homeY: 100 });
  const near = { x: 100 + zombie.detectRange - 10, y: 100 };
  const result = stepAI(ai, {
    now: 1000,
    x: 100,
    y: 100,
    player: near,
    def: zombie,
    hasLineOfSight: false,
  });
  assert.equal(result.state, 'chase');
  assert.ok(result.vx > 0);
});

test('los zombis atacan aunque no tengan línea de visión', () => {
  const zombie = ZOMBIES.infectado;
  const ai = createAI({ homeX: 100, homeY: 100 });
  const close = { x: 100 + zombie.attackRange - 4, y: 100 };
  const first = stepAI(ai, {
    now: 2000,
    x: 100,
    y: 100,
    player: close,
    def: zombie,
    hasLineOfSight: false,
  });
  assert.equal(first.state, 'attack');
  assert.equal(first.attack, true);
});

test('el infectado tiene datos completos y comportamiento zombi', () => {
  assert.equal(ZOMBIES.infectado.behavior, 'zombie');
  assert.equal(ZOMBIES.infectado.sprite, 'enemy-infectado');
  assert.ok(ZOMBIES.infectado.maxHp > 0);
  assert.ok(ZOMBIES.infectado.damage > 0);
  assert.ok(ZOMBIES.infectado.speed < ENEMIES.maton.speed, 'el zombi camina más lento que el matón');
});
