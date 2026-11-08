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

test('el guardado v3 trae mundo, historia e inventario', () => {
  const save = defaultSave();
  assert.equal(save.version, SAVE_VERSION);
  assert.deepEqual(save.world.phase, 'barrio');
  assert.equal(save.story.introSeen, false);
  assert.equal(save.story.collapseSeen, false);
  assert.ok(Array.isArray(save.inventory.slots));
  assert.ok(save.inventory.slots.length > 0);
});

test('ida y vuelta del guardado v3', () => {
  const storage = memoryStorage();
  const save = defaultSave();
  save.playerVariant = 'f-red';
  save.started = true;
  save.missions['el-mandado'].step = 'find-chancla';
  save.wallet.coins = 3;
  save.player.hp = 76;
  save.combat.magazines.pistola = 5;
  save.combat.defeats = 2;
  save.world.phase = 'colapso';
  save.world.suppliesTaken = ['vendaje-0'];
  save.story.introSeen = true;
  save.story.collapseSeen = true;
  save.missions['el-colapso'].step = 'survive';
  save.inventory.slots = [{ id: 'vendaje', qty: 1 }, { id: 'balas9', qty: 2 }];

  assert.equal(writeSave(save, storage), true);
  const loaded = readSave(storage);
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.playerVariant, 'f-red');
  assert.equal(loaded.missions['el-mandado'].step, 'find-chancla');
  assert.equal(loaded.missions['el-colapso'].step, 'survive');
  assert.equal(loaded.wallet.coins, 3);
  assert.equal(loaded.player.hp, 76);
  assert.equal(loaded.combat.magazines.pistola, 5);
  assert.equal(loaded.combat.defeats, 2);
  assert.equal(loaded.world.phase, 'colapso');
  assert.deepEqual(loaded.world.suppliesTaken, ['vendaje-0']);
  assert.equal(loaded.story.introSeen, true);
  assert.equal(loaded.story.collapseSeen, true);
  assert.deepEqual(loaded.inventory.slots, [{ id: 'vendaje', qty: 1 }, { id: 'balas9', qty: 2 }]);
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
  // v1 no tenía mundo ni inventario: se agregan por defecto.
  assert.equal(loaded.world.phase, 'barrio');
  assert.equal(loaded.story.introSeen, false);
  assert.ok(loaded.inventory.slots.length > 0);
});

test('migra un guardado v2 (Slice A) y le agrega el Slice B', () => {
  const v2 = {
    version: 2,
    playerVariant: 'm-blue',
    started: true,
    player: { hp: 80, maxHp: 100 },
    combat: { weaponId: 'pistola', magazines: { pistola: 6 }, reserves: { pistola: 12 }, defeats: 4 },
    wallet: { coins: 85 },
    reputation: { barrio: 10 },
    missions: {
      'el-mandado': { step: 'done', flags: { drillUnlocked: true }, completed: true },
      'limpia-la-cancha': { step: 'done', flags: {}, kills: 3, completed: true },
    },
  };
  const loaded = sanitizeSave(v2);
  // El guardado deja 'locked'; MissionSystem la abre al construirse.\n  assert.equal(loaded.missions['el-colapso'].step, 'locked');
  assert.equal(loaded.world.phase, 'barrio');
  assert.equal(loaded.story.collapseSeen, false);
  assert.ok(loaded.inventory.slots.length > 0);
  assert.equal(loaded.wallet.coins, 85);
});

test('el mundo se sincroniza con el estado de la misión del colapso', () => {
  const surviving = sanitizeSave({
    version: 3,
    missions: { 'el-colapso': { step: 'survive', kills: 2 } },
    world: { phase: 'barrio' },
    inventory: { slots: [] },
  });
  assert.equal(surviving.world.phase, 'colapso');
  assert.equal(surviving.story.collapseSeen, true);

  const done = sanitizeSave({
    version: 3,
    missions: { 'el-colapso': { step: 'done' } },
    world: { phase: 'barrio' },
  });
  assert.equal(done.world.phase, 'apocalipsis');

  const corrupted = sanitizeSave({
    version: 3,
    missions: { 'el-mandado': { step: 'inactive' } },
    world: { phase: 'apocalipsis' },
  });
  assert.equal(corrupted.world.phase, 'barrio');
});

test('migrar un v1 terminado desbloquea el simulacro y abre la misión criminal', () => {
  const migrated = sanitizeSave({ version: 1, step: 'done', hasChancla: true, coins: 25, started: true });
  assert.equal(migrated.missions['el-mandado'].flags.drillUnlocked, true);
  assert.equal(migrated.missions['el-mandado'].flags.hasChancla, false);
  assert.equal(migrated.missions['el-mandado'].completed, true);
});

test('sanitiza valores inválidos', () => {
  const save = sanitizeSave({
    version: 3,
    playerVariant: 'x-neon',
    player: { hp: -10, maxHp: 'mucho' },
    combat: { weaponId: 'lanzacohetes', magazines: { pistola: -4 }, defeats: 'x' },
    wallet: { coins: -10 },
    reputation: { barrio: 'alto' },
    world: { phase: 'guerra', suppliesTaken: 'todo' },
    story: { introSeen: 'sí', collapseSeen: 1 },
    inventory: { slots: [{ id: 'fantasma', qty: 9 }] },
    missions: {
      'el-mandado': { step: 'hack', flags: { hasChancla: 'sí', drillUnlocked: 1 } },
      'limpia-la-cancha': { step: 'nope', kills: -3 },
      'el-colapso': { step: 'inventado' },
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
  assert.equal(save.world.phase, 'barrio');
  assert.deepEqual(save.world.suppliesTaken, []);
  assert.equal(save.story.introSeen, false);
  assert.equal(save.story.collapseSeen, false);
  assert.deepEqual(save.inventory.slots, [{ id: 'vendaje', qty: 2 }, { id: 'lata', qty: 1 }]);
  assert.equal(save.missions['el-mandado'].step, 'inactive');
  assert.equal(save.missions['el-mandado'].flags.hasChancla, false);
  assert.equal(save.missions['limpia-la-cancha'].step, 'locked');
  assert.equal(save.missions['limpia-la-cancha'].kills, 0);
  assert.equal(save.missions['el-colapso'].step, 'locked');
});

test('migrateSave conserva el esquema v3 intacto', () => {
  const save = defaultSave();
  assert.equal(migrateSave(save), save);
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

test('hasProgress también detecta progreso de misión e historia', () => {
  const storage = memoryStorage();
  const save = defaultSave();
  save.missions['el-mandado'].step = 'find-pipe';
  writeSave(save, storage);
  assert.equal(hasProgress(storage), true);

  storage.removeItem(SAVE_KEY);
  const intro = defaultSave();
  intro.started = true;
  intro.story.introSeen = true;
  writeSave(intro, storage);
  assert.equal(hasProgress(storage), true);
});
