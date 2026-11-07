// Lógica pura de la misión principal. Sin Phaser, testeable con node:test.
import { MISSION } from '../data/missions.js';

const STEPS = new Set(['inactive', 'find-pipe', 'find-chancla', 'return-pipe', 'report-nena', 'done']);

export class MissionSystem {
  constructor(save = {}) {
    this.step = STEPS.has(save.step) ? save.step : 'inactive';
    this.hasChancla = Boolean(save.hasChancla);
    this.coins = Number.isFinite(save.coins) ? Math.max(0, Math.floor(save.coins)) : 0;
    this.drillUnlocked = Boolean(save.drillUnlocked) || this.step === 'done';
    this.drillCompleted = Boolean(save.drillCompleted);
    this.completed = Boolean(save.completed) || this.step === 'done';
    if (this.step === 'done') this.hasChancla = false;
  }

  get active() {
    return this.step !== 'inactive' && this.step !== 'done';
  }

  get finished() {
    return this.step === 'done';
  }

  get title() {
    return MISSION.title;
  }

  getObjective() {
    if (this.step === 'inactive') return MISSION.availableObjective;
    if (this.step === 'done') return MISSION.steps.done;
    return MISSION.steps[this.step] ?? '';
  }

  getDialogueContext() {
    return {
      step: this.step,
      hasChancla: this.hasChancla,
      drillUnlocked: this.drillUnlocked,
    };
  }

  canPickupChancla() {
    return this.step === 'find-chancla' && !this.hasChancla;
  }

  applyAction(action) {
    switch (action) {
      case 'startMission':
        if (this.step !== 'inactive') return { changed: false };
        this.step = 'find-pipe';
        return {
          changed: true,
          kind: 'start',
          objective: this.getObjective(),
          toast: `Nueva misión: ${MISSION.title}`,
        };

      case 'pipeMet':
        if (this.step !== 'find-pipe') return { changed: false };
        this.step = 'find-chancla';
        return {
          changed: true,
          kind: 'progress',
          objective: this.getObjective(),
          toast: 'Nuevo objetivo: busca la chancleta',
        };

      case 'giveChancla':
        if (this.step !== 'return-pipe' || !this.hasChancla) return { changed: false };
        this.step = 'report-nena';
        this.hasChancla = false;
        return {
          changed: true,
          kind: 'progress',
          objective: this.getObjective(),
          toast: 'Pipe ya tiene su chancleta',
        };

      case 'finishMission':
        if (this.step !== 'report-nena') return { changed: false };
        this.step = 'done';
        this.completed = true;
        this.drillUnlocked = true;
        this.hasChancla = false;
        this.coins += MISSION.reward?.coins ?? 0;
        return {
          changed: true,
          kind: 'finish',
          objective: this.getObjective(),
          toast: '¡Misión completada!',
          reward: MISSION.reward ?? null,
        };

      default:
        return { changed: false };
    }
  }

  collectChancla() {
    if (!this.canPickupChancla()) return false;
    this.hasChancla = true;
    this.step = 'return-pipe';
    return true;
  }

  markDrillCompleted() {
    if (this.drillCompleted) return false;
    this.drillCompleted = true;
    return true;
  }

  toSave() {
    return {
      step: this.step,
      hasChancla: this.hasChancla,
      coins: this.coins,
      drillUnlocked: this.drillUnlocked,
      drillCompleted: this.drillCompleted,
      completed: this.completed,
      started: this.step !== 'inactive',
    };
  }
}
