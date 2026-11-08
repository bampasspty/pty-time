import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_LEVEL, ProgressionSystem, xpForLevel } from '../src/systems/ProgressionSystem.js';

test('nivel inicial y tabla de experiencia', () => {
  const progression = new ProgressionSystem({});
  assert.equal(progression.level, 1);
  assert.equal(progression.xp, 0);
  assert.equal(progression.xpNext, xpForLevel(1));
  assert.equal(progression.xpNext, 80);
  assert.equal(xpForLevel(2), 120);
});

test('sube de nivel acumulando experiencia', () => {
  const progression = new ProgressionSystem({});
  const result = progression.addXp(80);
  assert.equal(result.leveledUp, true);
  assert.equal(result.levelsGained, 1);
  assert.equal(progression.level, 2);
  assert.equal(progression.xp, 0);
});

test('un golpe grande puede dar varios niveles', () => {
  const progression = new ProgressionSystem({});
  const result = progression.addXp(80 + 120 + 10);
  assert.equal(result.levelsGained, 2);
  assert.equal(progression.level, 3);
  assert.equal(progression.xp, 10);
});

test('bonificaciones por nivel', () => {
  const progression = new ProgressionSystem({ progression: { level: 5, xp: 0 } });
  assert.equal(progression.maxHpBonus, 40);
  assert.equal(progression.damageMultiplier, 1.2);
  assert.equal(progression.capacityBonus, 2);
  assert.equal(progression.damageFor(10), 12);
});

test('normaliza un guardado con exceso de experiencia', () => {
  const progression = new ProgressionSystem({ progression: { level: 1, xp: 500 } });
  assert.ok(progression.level > 1);
  assert.ok(progression.xp < progression.xpNext);
});

test('respeta el nivel maximo', () => {
  const progression = new ProgressionSystem({ progression: { level: MAX_LEVEL, xp: 0 } });
  const result = progression.addXp(999);
  assert.equal(result.gained, 0);
  assert.equal(progression.level, MAX_LEVEL);
});

test('ida y vuelta al guardado', () => {
  const progression = new ProgressionSystem({});
  progression.addXp(200);
  const restored = new ProgressionSystem({ progression: progression.toSave() });
  assert.equal(restored.level, progression.level);
  assert.equal(restored.xp, progression.xp);
});

test('sanitiza valores invalidos', () => {
  const progression = new ProgressionSystem({ progression: { level: 'x', xp: -50 } });
  assert.equal(progression.level, 1);
  assert.equal(progression.xp, 0);
  const weird = new ProgressionSystem({ progression: { level: 999, xp: 'mucho' } });
  assert.equal(weird.level, MAX_LEVEL);
});
