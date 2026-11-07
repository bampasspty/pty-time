import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SAVE,
  SAVE_KEY,
  clearSave,
  hasProgress,
  readSave,
  sanitizeSave,
  writeSave,
} from '../src/systems/SaveSystem.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('ida y vuelta del guardado', () => {
  const storage = memoryStorage();
  assert.equal(writeSave({ ...DEFAULT_SAVE, playerVariant: 'f-red', step: 'find-chancla', coins: 3 }, storage), true);
  const loaded = readSave(storage);
  assert.equal(loaded.playerVariant, 'f-red');
  assert.equal(loaded.step, 'find-chancla');
  assert.equal(loaded.coins, 3);
});

test('sanitiza valores inválidos', () => {
  const save = sanitizeSave({
    playerVariant: 'x-neon',
    step: 'hack',
    coins: -10,
    hasChancla: 'sí',
    drillUnlocked: 1,
  });
  assert.equal(save.playerVariant, DEFAULT_SAVE.playerVariant);
  assert.equal(save.step, 'inactive');
  assert.equal(save.coins, 0);
  assert.equal(save.hasChancla, false);
  assert.equal(save.drillUnlocked, false);
});

test('un guardado terminado desbloquea el simulacro', () => {
  const save = sanitizeSave({ step: 'done', drillUnlocked: false, completed: false, hasChancla: true });
  assert.equal(save.drillUnlocked, true);
  assert.equal(save.completed, true);
  assert.equal(save.hasChancla, false);
});

test('JSON corrupto no rompe la carga', () => {
  const storage = memoryStorage();
  storage.setItem(SAVE_KEY, '{no es json');
  assert.deepEqual(readSave(storage), DEFAULT_SAVE);
});

test('hasProgress detecta partida iniciada y clearSave la borra', () => {
  const storage = memoryStorage();
  assert.equal(hasProgress(storage), false);
  writeSave({ ...DEFAULT_SAVE, started: true }, storage);
  assert.equal(hasProgress(storage), true);
  clearSave(storage);
  assert.equal(hasProgress(storage), false);
});
