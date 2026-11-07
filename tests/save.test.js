import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SAVE,
  SAVE_KEY,
  SAVE_VERSION,
  clearSave,
  defaultSave,
  hasProgress,
  migrateSave,
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

test('ida y vuelta del guardado v2', () => {
  const storage = memoryStorage();
  const save = defaultSave();
  save.playerVariant = 'f-red';
  save.started = true;
  save.missions['el-mandado'].step = 'find-chancla';
  save.wallet.coins = 3;
  save.player.hp = 76;
  save.combat.magazines.pistola = 5;
  save.combat.defeats = 2;

  assert.equal(writeSave(save, storage), true);
  const loaded = readSave(storage);
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.playerVariant, 'f-red');
  assert.equal(loaded.missions['el-mandado'].step, 'find-chancla');
  assert.equal(loaded.wallet.coins, 3);
  assert.equal(loaded.player.hp, 76);
  assert.equal(loaded.combat.magazines.pistola, 5);
  assert.equal(loaded.combat.defeats, 2);
});

test('migra un guardado v1 de la demo anterior', () => {
  const storage = memoryStorage();
  storage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 1,
      playerVariant: 'm-green',
      step: 'report-nena',
      hasChancla: true,
      coins: 25,
      drillUnlocked: false,
      drillCompleted: true,
      completed: false,
      started: true,
    }),
  );
  const loaded = readSave(storage);
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.playerVariant, 'm-green');
  assert.equal(loaded.missions['el-mandado'].step, 'report-nena');
  assert.equal(loaded.missions['el-mandado'].flags.hasChancla, true);
  assert.equal(loaded.missions['el-mandado'].flags.drillCompleted, true);
  assert.equal(loaded.wallet.coins, 25);
  assert.equal(loaded.started, true);
});

test('migrar un v1 terminado desbloquea el simulacro y abre la misión criminal', () => {
  const migrated = sanitizeSave({ version: 1, step: 'done', hasChancla: true, coins: 25, started: true });
  assert.equal(migrated.missions['el-mandado'].flags.drillUnlocked, true);
  assert.equal(migrated.missions['el-mandado'].flags.hasChancla, false);
  assert.equal(migrated.missions['el-mandado'].completed, true);
});

test('migrateSave conserva el esquema v2 intacto', () => {
  const save = defaultSave();
  assert.equal(migrateSave(save), save);
});

test('sanitiza valores inválidos', () => {
  const save = sanitizeSave({
    version: 2,
    playerVariant: 'x-neon',
    player: { hp: -10, maxHp: 'mucho' },
    combat: { weaponId: 'lanzacohetes', magazines: { pistola: -4 }, defeats: 'x' },
    wallet: { coins: -10 },
    reputation: { barrio: 'alto' },
    missions: {
      'el-mandado': { step: 'hack', flags: { hasChancla: 'sí', drillUnlocked: 1 } },
      'limpia-la-cancha': { step: 'nope', kills: -3 },
    },
  });
  assert.equal(save.playerVariant, DEFAULT_SAVE.playerVariant);
  assert.equal(save.player.hp, DEFAULT_SAVE.player.maxHp);
  assert.equal(save.player.maxHp, DEFAULT_SAVE.player.maxHp);
  assert.equal(save.combat.weaponId, DEFAULT_SAVE.combat.weaponId);
  assert.equal(save.combat.magazines.pistola, 0);
  assert.equal(save.combat.defeats, 0);
  assert.equal(save.wallet.coins, 0);
  assert.equal(save.reputation.barrio, 0);
  assert.equal(save.missions['el-mandado'].step, 'inactive');
  assert.equal(save.missions['el-mandado'].flags.hasChancla, false);
  assert.equal(save.missions['el-mandado'].flags.drillUnlocked, false);
  assert.equal(save.missions['limpia-la-cancha'].step, 'locked');
  assert.equal(save.missions['limpia-la-cancha'].kills, 0);
});

test('el estado de misión desconocido vuelve al inicial', () => {
  const save = sanitizeSave({ version: 2, missions: { 'el-mandado': { step: 'paso-inventado' } } });
  assert.equal(save.missions['el-mandado'].step, 'inactive');
});

test('JSON corrupto no rompe la carga', () => {
  const storage = memoryStorage();
  storage.setItem(SAVE_KEY, '{no es json');
  assert.deepEqual(readSave(storage), defaultSave());
});

test('hasProgress detecta partida iniciada y clearSave la borra', () => {
  const storage = memoryStorage();
  assert.equal(hasProgress(storage), false);

  const save = defaultSave();
  save.started = true;
  writeSave(save, storage);
  assert.equal(hasProgress(storage), true);

  clearSave(storage);
  assert.equal(hasProgress(storage), false);
});

test('hasProgress también detecta progreso de misión sin bandera started', () => {
  const storage = memoryStorage();
  const save = defaultSave();
  save.missions['el-mandado'].step = 'find-pipe';
  writeSave(save, storage);
  assert.equal(hasProgress(storage), true);
});
