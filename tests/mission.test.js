import test from 'node:test';
import assert from 'node:assert/strict';
import { MissionSystem } from '../src/systems/MissionSystem.js';
import { MISSION } from '../src/data/missions.js';

test('flujo completo de la misión principal', () => {
  const mission = new MissionSystem({});
  assert.equal(mission.getObjective(), MISSION.availableObjective);

  const start = mission.applyAction('startMission');
  assert.equal(start.changed, true);
  assert.equal(mission.step, 'find-pipe');
  assert.equal(mission.active, true);
  assert.match(mission.getObjective(), /Pipe/);

  const pipe = mission.applyAction('pipeMet');
  assert.equal(pipe.changed, true);
  assert.equal(mission.step, 'find-chancla');
  assert.equal(mission.canPickupChancla(), true);

  assert.equal(mission.collectChancla(), true);
  assert.equal(mission.step, 'return-pipe');
  assert.equal(mission.hasChancla, true);
  assert.equal(mission.canPickupChancla(), false);

  const give = mission.applyAction('giveChancla');
  assert.equal(give.changed, true);
  assert.equal(mission.step, 'report-nena');
  assert.equal(mission.hasChancla, false);

  const finish = mission.applyAction('finishMission');
  assert.equal(finish.changed, true);
  assert.equal(finish.kind, 'finish');
  assert.equal(mission.step, 'done');
  assert.equal(mission.completed, true);
  assert.equal(mission.drillUnlocked, true);
  assert.equal(mission.coins, MISSION.reward.coins);
});

test('las acciones fuera de orden no cambian el estado', () => {
  const mission = new MissionSystem({});
  for (const action of ['pipeMet', 'giveChancla', 'finishMission', 'nope']) {
    const result = mission.applyAction(action);
    assert.equal(result.changed, false, action);
    assert.equal(mission.step, 'inactive');
  }
  assert.equal(mission.collectChancla(), false);
  assert.equal(mission.coins, 0);
});

test('no se puede recoger la chancleta dos veces', () => {
  const mission = new MissionSystem({ step: 'find-chancla' });
  assert.equal(mission.collectChancla(), true);
  assert.equal(mission.collectChancla(), false);
  assert.equal(mission.step, 'return-pipe');
});

test('un guardado terminado mantiene coherencia', () => {
  const mission = new MissionSystem({
    step: 'done',
    hasChancla: true,
    coins: 25,
    completed: false,
    drillUnlocked: false,
  });
  assert.equal(mission.hasChancla, false);
  assert.equal(mission.drillUnlocked, true);
  assert.equal(mission.completed, true);
  assert.equal(mission.toSave().started, true);
});

test('markDrillCompleted solo se aplica una vez', () => {
  const mission = new MissionSystem({});
  assert.equal(mission.markDrillCompleted(), true);
  assert.equal(mission.markDrillCompleted(), false);
  assert.equal(mission.drillCompleted, true);
});
