import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/data/enemies.js';
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

test('los dos tipos de matón tienen datos completos', () => {
  for (const [id, def] of Object.entries(ENEMIES)) {
    assert.equal(def.id, id);
    assert.ok(def.sprite.startsWith('enemy-'), id);
    assert.ok(def.maxHp > 0, id);
    assert.ok(def.damage > 0, id);
    assert.ok(def.attackCooldownMs > 0, id);
  }
});
