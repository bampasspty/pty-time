// Guardado local del progreso. Sin dependencias para poder probarlo con node:test.
export const SAVE_KEY = 'pty-time-save-v1';

export const DEFAULT_SAVE = Object.freeze({
  version: 1,
  playerVariant: 'm-blue',
  step: 'inactive',
  hasChancla: false,
  coins: 0,
  drillUnlocked: false,
  drillCompleted: false,
  completed: false,
  started: false,
});

const VALID_STEPS = new Set([
  'inactive',
  'find-pipe',
  'find-chancla',
  'return-pipe',
  'report-nena',
  'done',
]);

export function sanitizeSave(raw) {
  const save = { ...DEFAULT_SAVE };
  if (!raw || typeof raw !== 'object') return save;
  if (typeof raw.playerVariant === 'string' && /^[mf]-(red|blue|yellow|green)$/.test(raw.playerVariant)) {
    save.playerVariant = raw.playerVariant;
  }
  if (VALID_STEPS.has(raw.step)) save.step = raw.step;
  if (Number.isFinite(raw.coins) && raw.coins >= 0) save.coins = Math.floor(raw.coins);
  for (const key of ['hasChancla', 'drillUnlocked', 'drillCompleted', 'completed', 'started']) {
    if (typeof raw[key] === 'boolean') save[key] = raw[key];
  }
  // Coherencia: si la misión terminó, el simulacro queda desbloqueado.
  if (save.step === 'done') {
    save.completed = true;
    save.drillUnlocked = true;
    save.hasChancla = false;
  }
  return save;
}

export function readSave(storage = globalThis.localStorage) {
  if (!storage) return { ...DEFAULT_SAVE };
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return sanitizeSave(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SAVE };
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
  return save.started || save.step !== 'inactive' || save.coins > 0;
}
