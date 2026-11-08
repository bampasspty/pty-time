// Guardado local del progreso. Sin dependencias de Phaser para poder probarlo
// con node:test.
//
// Esquema v3 (Slice B): agrega el estado del mundo (barrio/colapso/apocalipsis),
// las banderas de historia (intro y colapso vistos) y el inventario básico.
// Los guardados v1 (campos en la raíz) y v2 (sin mundo/inventario) se migran
// automáticamente al leer.

import { MISSIONS, MISSION_ORDER } from '../data/missions.js';
import { CALITO } from '../data/calito.js';
import { DEFAULT_WEAPON, STARTING_AMMO, WEAPONS } from '../data/weapons.js';
import { STARTING_INVENTORY } from '../data/items.js';
import { InventorySystem } from './InventorySystem.js';

// La clave se mantiene para no perder las partidas de la demo v0.1.0.
export const SAVE_KEY = 'pty-time-save-v1';
export const SAVE_VERSION = 3;

const PLAYER_VARIANTS = /^[mf]-(red|blue|yellow|green)$/;
const FLAGS = ['hasChancla', 'drillUnlocked', 'drillCompleted'];
const WORLD_PHASES = ['barrio', 'colapso', 'apocalipsis'];

export function defaultSave() {
  const missions = {};
  for (const id of MISSION_ORDER) {
    missions[id] = {
      step: MISSIONS[id].initialStep,
      flags: { hasChancla: false, drillUnlocked: false, drillCompleted: false },
      kills: 0,
      completed: false,
    };
  }
  return {
    version: SAVE_VERSION,
    playerVariant: CALITO.defaultVariant,
    started: false,
    player: { hp: 100, maxHp: 100 },
    combat: {
      weaponId: DEFAULT_WEAPON,
      magazines: { [DEFAULT_WEAPON]: WEAPONS[DEFAULT_WEAPON].magazine },
      reserves: { ...STARTING_AMMO },
      defeats: 0,
    },
    wallet: { coins: 0 },
    reputation: { barrio: 0 },
    missions,
    world: { phase: 'barrio', suppliesTaken: [] },
    story: { introSeen: false, collapseSeen: false },
    inventory: { slots: STARTING_INVENTORY.map((entry) => ({ ...entry })) },
  };
}

export const DEFAULT_SAVE = Object.freeze(defaultSave());

const asInt = (value, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(999999, Math.floor(n)));
};

// Convierte cualquier guardado anterior (v1 con campos en la raíz, v2 sin mundo
// ni inventario) al esquema v3.
export function migrateSave(raw) {
  if (!raw || typeof raw !== 'object') return defaultSave();
  if (raw.version === SAVE_VERSION && raw.missions && raw.world && raw.story && raw.inventory) {
    return raw;
  }

  const legacyMission = {
    step: raw.step,
    flags: {
      hasChancla: raw.hasChancla,
      drillUnlocked: raw.drillUnlocked,
      drillCompleted: raw.drillCompleted,
    },
    kills: raw.kills,
    completed: raw.completed,
  };

  return {
    version: SAVE_VERSION,
    playerVariant: raw.playerVariant,
    started: raw.started,
    player: raw.player,
    combat: raw.combat,
    wallet: raw.wallet ?? (raw.coins !== undefined ? { coins: raw.coins } : undefined),
    reputation: raw.reputation,
    missions: {
      'el-mandado': raw.missions?.['el-mandado'] ?? legacyMission,
      'limpia-la-cancha': raw.missions?.['limpia-la-cancha'],
      'el-colapso': raw.missions?.['el-colapso'],
    },
    world: raw.world,
    story: raw.story,
    inventory: raw.inventory,
  };
}

function sanitizeMission(def, raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const validSteps = new Set(Object.keys(def.steps));
  const state = {
    step: validSteps.has(source.step) ? source.step : def.initialStep,
    flags: {},
    kills: asInt(source.kills, 0),
    completed: source.completed === true,
  };
  for (const flag of FLAGS) {
    state.flags[flag] = source.flags?.[flag] === true || source[flag] === true;
  }
  if (state.step === 'done') {
    state.completed = true;
    state.flags.hasChancla = false;
    if (def.id === 'el-mandado') state.flags.drillUnlocked = true;
  }
  return state;
}

export function sanitizeSave(raw) {
  const save = defaultSave();
  const source = migrateSave(raw);

  if (typeof source.playerVariant === 'string' && PLAYER_VARIANTS.test(source.playerVariant)) {
    save.playerVariant = source.playerVariant;
  }
  if (source.started === true) save.started = true;

  const maxHp = asInt(source.player?.maxHp, save.player.maxHp);
  save.player.maxHp = Math.max(1, maxHp);
  const hp = asInt(source.player?.hp, save.player.maxHp);
  save.player.hp = Math.min(save.player.maxHp, hp || save.player.maxHp);

  const weaponId = WEAPONS[source.combat?.weaponId] ? source.combat.weaponId : DEFAULT_WEAPON;
  save.combat.weaponId = weaponId;
  for (const type of Object.keys(save.combat.magazines)) {
    save.combat.magazines[type] = asInt(source.combat?.magazines?.[type], save.combat.magazines[type]);
  }
  for (const type of Object.keys(save.combat.reserves)) {
    save.combat.reserves[type] = asInt(source.combat?.reserves?.[type], save.combat.reserves[type]);
  }
  save.combat.defeats = asInt(source.combat?.defeats, 0);

  save.wallet.coins = asInt(source.wallet?.coins, 0);
  save.reputation.barrio = asInt(source.reputation?.barrio, 0);

  for (const id of MISSION_ORDER) {
    save.missions[id] = sanitizeMission(MISSIONS[id], source.missions?.[id]);
  }

  // --- Slice B: mundo, historia e inventario -----------------------------
  const collapseStep = save.missions['el-colapso'].step;
  let phase = WORLD_PHASES.includes(source.world?.phase) ? source.world.phase : 'barrio';
  // Coherencia: el mundo no puede ir por delante (ni por detrás) de la misión.
  if (collapseStep === 'done') phase = 'apocalipsis';
  else if (collapseStep === 'survive' || collapseStep === 'refugio') phase = 'colapso';
  else if (phase === 'apocalipsis') phase = collapseStep === 'done' ? 'apocalipsis' : 'barrio';
  save.world.phase = phase;

  const taken = Array.isArray(source.world?.suppliesTaken) ? source.world.suppliesTaken : [];
  save.world.suppliesTaken = taken
    .filter((id) => typeof id === 'string' && id.length <= 40)
    .slice(0, 40);

  save.story.introSeen = source.story?.introSeen === true;
  // Si el jugador ya vivió el colapso, la bandera queda fija aunque falte el flag.
  save.story.collapseSeen = source.story?.collapseSeen === true || phase !== 'barrio';

  save.inventory = new InventorySystem(source).toSave();

  // Todo lo que no sea una partida empezada se descarta a neutro.
  if (!save.started && MISSION_ORDER.every((id) => save.missions[id].step === MISSIONS[id].initialStep)) {
    save.wallet.coins = 0;
    save.combat.defeats = 0;
    save.player.hp = save.player.maxHp;
    save.world.phase = 'barrio';
    save.world.suppliesTaken = [];
    save.story.introSeen = false;
    save.story.collapseSeen = false;
    save.inventory = new InventorySystem({}).toSave();
  }
  return save;
}

export function readSave(storage = globalThis.localStorage) {
  if (!storage) return defaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    return sanitizeSave(JSON.parse(raw));
  } catch {
    return defaultSave();
  }
}

export function writeSave(save, storage = globalThis.localStorage) {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(sanitizeSave(save)));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(storage = globalThis.localStorage) {
  if (!storage) return;
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function hasProgress(storage = globalThis.localStorage) {
  const save = readSave(storage);
  const playedMission = MISSION_ORDER.some((id) => {
    const step = save.missions[id].step;
    return step !== MISSIONS[id].initialStep && step !== 'locked';
  });
  return (
    save.started ||
    playedMission ||
    save.wallet.coins > 0 ||
    save.combat.defeats > 0 ||
    save.world.phase !== 'barrio' ||
    save.story.introSeen
  );
}
