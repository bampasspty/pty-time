// Motor de misiones (PURA, sin Phaser): lee el registro de src/data/missions.js
// y mantiene el estado de cada misión, la billetera y la reputación.
//
// Sigue siendo una máquina de estados testeable con node:test: la escena sólo
// pregunta `¿cambió?` y aplica el efecto visual (toast, modal, guardado).

import { MISSIONS, MISSION_ORDER } from '../data/missions.js';

const clampInt = (value, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(999999, Math.floor(n)));
};

const FLAGS = ['hasChancla', 'drillUnlocked', 'drillCompleted'];

function createState(def, raw = {}, legacy = null) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const old = legacy && typeof legacy === 'object' ? legacy : {};
  const validSteps = new Set(Object.keys(def.steps));
  let step = source.step ?? old.step;
  if (!validSteps.has(step)) step = def.initialStep;

  const flags = {};
  for (const name of FLAGS) {
    const value = source.flags?.[name] ?? source[name] ?? old[name];
    flags[name] = value === true;
  }

  const state = {
    step,
    flags,
    kills: clampInt(source.kills, 0),
    completed: step === 'done' || source.completed === true,
  };

  if (step === 'done') {
    state.completed = true;
    state.flags.hasChancla = false;
    if (def.id === 'el-mandado') state.flags.drillUnlocked = true;
  }
  return state;
}

export class MissionSystem {
  constructor(save = {}) {
    this.states = {};
    for (const id of MISSION_ORDER) {
      const def = MISSIONS[id];
      const raw = save?.missions?.[id];
      // Guardados v1: los campos de "El mandado" venían en la raíz.
      const legacy = id === 'el-mandado' ? save : null;
      this.states[id] = createState(def, raw, legacy);
    }
    this.wallet = { coins: clampInt(save?.wallet?.coins ?? save?.coins, 0) };
    this.reputation = { barrio: clampInt(save?.reputation?.barrio, 0) };
    this.refreshAvailability();
  }

  getDef(id) {
    return MISSIONS[id] ?? null;
  }

  getState(id) {
    return this.states[id] ?? null;
  }

  get coins() {
    return this.wallet.coins;
  }

  get drillUnlocked() {
    return Boolean(this.states['el-mandado']?.flags.drillUnlocked);
  }

  get drillCompleted() {
    return Boolean(this.states['el-mandado']?.flags.drillCompleted);
  }

  isActive(id) {
    const def = MISSIONS[id];
    const state = this.states[id];
    if (!def || !state) return false;
    return state.step !== def.initialStep && state.step !== 'done' && !state.completed;
  }

  // Misión que manda en el HUD: la activa, si no la próxima disponible, y si
  // ya no hay nada, la última del registro.
  get current() {
    const active = MISSION_ORDER.find((id) => this.isActive(id));
    if (active) return active;
    const available = MISSION_ORDER.find((id) => this.states[id].step === 'inactive');
    if (available) return available;
    return MISSION_ORDER[MISSION_ORDER.length - 1];
  }

  get step() {
    return this.states[this.current].step;
  }

  get title() {
    return MISSIONS[this.current].title;
  }

  get completed() {
    return this.states[this.current].completed;
  }

  getObjectiveFor(id) {
    const def = MISSIONS[id];
    const state = this.states[id];
    if (!def || !state) return '';
    let text = def.steps[state.step] ?? def.steps[def.initialStep] ?? '';
    const target = def.killTarget;
    if (target && state.step === target.from) {
      text = `${text} · ${Math.min(state.kills, target.count)}/${target.count}`;
    }
    return text;
  }

  getObjective() {
    return this.getObjectiveFor(this.current);
  }

  getDialogueContext() {
    const mandado = this.states['el-mandado'];
    const crime = this.states['limpia-la-cancha'];
    return {
      step: mandado.step,
      hasChancla: mandado.flags.hasChancla,
      drillUnlocked: this.drillUnlocked,
      crimeStep: crime.step,
      kills: crime.kills,
      targetKills: MISSIONS['limpia-la-cancha'].killTarget.count,
    };
  }

  // Un paso 'locked' pasa a 'inactive' cuando su misión requisito llegó al
  // paso pedido (por ejemplo: la misión criminal se abre al terminar el mandado).
  refreshAvailability() {
    for (const id of MISSION_ORDER) {
      const def = MISSIONS[id];
      const state = this.states[id];
      if (state.step !== 'locked') continue;
      const requires = def.requires;
      if (!requires) {
        state.step = 'inactive';
        continue;
      }
      const required = this.states[requires.mission];
      if (required && required.step === requires.step) state.step = 'inactive';
    }
  }

  applyAction(action) {
    for (const id of MISSION_ORDER) {
      const def = MISSIONS[id];
      const state = this.states[id];
      const transition = def.actions?.[action];
      if (!transition) continue;
      if (state.step !== transition.from) continue;
      if (transition.require && !state.flags[transition.require]) continue;

      state.step = transition.to;
      for (const flag of transition.clear ?? []) state.flags[flag] = false;
      for (const flag of transition.set ?? []) state.flags[flag] = true;
      if (transition.to === 'done') {
        state.completed = true;
        if (def.id === 'el-mandado') state.flags.drillUnlocked = true;
      }
      if (def.killTarget && transition.to === def.killTarget.from) state.kills = 0;

      const reward = transition.reward ?? null;
      if (reward?.coins) this.wallet.coins += reward.coins;
      if (reward?.reputation) this.reputation.barrio += reward.reputation;
      if (reward?.unlock === 'drill') {
        this.states['el-mandado'].flags.drillUnlocked = true;
      }

      this.refreshAvailability();
      const kind = transition.kind ?? 'progress';
      return {
        changed: true,
        missionId: id,
        title: def.title,
        kind,
        toast: transition.toast ?? null,
        reward,
        objective: this.getObjectiveFor(id),
        completion: kind === 'finish' ? def.completion ?? null : null,
        step: state.step,
      };
    }
    return { changed: false };
  }

  canCollect(itemId) {
    for (const id of MISSION_ORDER) {
      const collectible = MISSIONS[id].collectibles?.[itemId];
      if (!collectible) continue;
      const state = this.states[id];
      if (state.step === collectible.from && !state.flags[collectible.flag]) return true;
    }
    return false;
  }

  collectItem(itemId) {
    for (const id of MISSION_ORDER) {
      const collectible = MISSIONS[id].collectibles?.[itemId];
      if (!collectible) continue;
      const state = this.states[id];
      if (state.step !== collectible.from || state.flags[collectible.flag]) continue;
      state.flags[collectible.flag] = true;
      state.step = collectible.to;
      return { collected: true, missionId: id, toast: collectible.toast ?? null };
    }
    return { collected: false };
  }

  // La escena llama esto por cada enemigo derrotado. Sólo cuenta para misiones
  // de limpieza que estén en su paso de combate.
  handleEnemyDefeated() {
    for (const id of MISSION_ORDER) {
      const def = MISSIONS[id];
      const target = def.killTarget;
      if (!target) continue;
      const state = this.states[id];
      if (state.step !== target.from) continue;
      state.kills += 1;
      if (state.kills >= target.count) {
        state.step = target.to;
        return {
          progressed: true,
          done: true,
          missionId: id,
          title: def.title,
          toast: target.toast,
          objective: this.getObjectiveFor(id),
        };
      }
      return {
        progressed: true,
        done: false,
        missionId: id,
        title: def.title,
        kills: state.kills,
        target: target.count,
        objective: this.getObjectiveFor(id),
      };
    }
    return { progressed: false };
  }

  markDrillCompleted() {
    const state = this.states['el-mandado'];
    if (state.flags.drillCompleted) return false;
    state.flags.drillCompleted = true;
    return true;
  }

  // NPC al que apunta la estrella de objetivo de la misión actual.
  markerNpc() {
    const id = this.current;
    const def = MISSIONS[id];
    const state = this.states[id];
    return def.marker?.[state.step] ?? null;
  }

  hud() {
    const id = this.current;
    const def = MISSIONS[id];
    const state = this.states[id];
    return {
      missionId: id,
      missionTitle: def.title,
      objective: this.getObjectiveFor(id),
      coins: this.coins,
      drillUnlocked: this.drillUnlocked,
      drillCompleted: this.drillCompleted,
      step: state.step,
      missionCompleted: state.completed,
    };
  }

  toSave() {
    const missions = {};
    for (const id of MISSION_ORDER) {
      const state = this.states[id];
      missions[id] = {
        step: state.step,
        flags: { ...state.flags },
        kills: state.kills,
        completed: state.completed,
      };
    }
    return {
      missions,
      wallet: { ...this.wallet },
      reputation: { ...this.reputation },
    };
  }
}
