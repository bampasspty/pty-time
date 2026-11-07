import test from 'node:test';
import assert from 'node:assert/strict';
import { MissionSystem } from '../src/systems/MissionSystem.js';
import { MISSIONS } from '../src/data/missions.js';

const MANDADO = MISSIONS['el-mandado'];
const CRIME = MISSIONS['limpia-la-cancha'];

test('flujo completo del mandado de Doña Nena', () => {
  const mission = new MissionSystem({});
  assert.equal(mission.getObjective(), MANDADO.steps.inactive);

  const start = mission.applyAction('startMission');
  assert.equal(start.changed, true);
  assert.equal(mission.getState('el-mandado').step, 'find-pipe');
  assert.match(mission.getObjective(), /Pipe/);

  const pipe = mission.applyAction('pipeMet');
  assert.equal(pipe.changed, true);
  assert.equal(mission.canCollect('chancla'), true);
  assert.equal(mission.collectItem('chancla').collected, true);
  assert.equal(mission.getState('el-mandado').step, 'return-pipe');
  assert.equal(mission.canCollect('chancla'), false);

  const give = mission.applyAction('giveChancla');
  assert.equal(give.changed, true);
  assert.equal(mission.getState('el-mandado').step, 'report-nena');

  const finish = mission.applyAction('finishMission');
  assert.equal(finish.changed, true);
  assert.equal(finish.kind, 'finish');
  assert.equal(mission.getState('el-mandado').step, 'done');
  assert.equal(mission.getState('el-mandado').completed, true);
  assert.equal(mission.drillUnlocked, true);
  assert.equal(mission.coins, 25);
  assert.ok(finish.completion?.body, 'la misión trae texto de cierre');
});

test('la misión criminal arranca bloqueada y se abre al terminar el mandado', () => {
  const fresh = new MissionSystem({});
  assert.equal(fresh.getState('limpia-la-cancha').step, 'locked');
  assert.equal(fresh.applyAction('startCrime').changed, false);

  const done = new MissionSystem({ missions: { 'el-mandado': { step: 'done' } } });
  assert.equal(done.getState('limpia-la-cancha').step, 'inactive');
  assert.equal(done.applyAction('startCrime').changed, true);
  assert.equal(done.getState('limpia-la-cancha').step, 'deal');
  assert.match(done.getObjective(), /matones/i);
});

test('la misión criminal cuenta enemigos y paga recompensa', () => {
  const mission = new MissionSystem({
    wallet: { coins: 25 },
    missions: { 'el-mandado': { step: 'done' } },
  });
  mission.applyAction('startCrime');

  const first = mission.handleEnemyDefeated();
  assert.equal(first.progressed, true);
  assert.equal(first.done, false);
  assert.match(mission.getObjective(), /1\/3/);

  mission.handleEnemyDefeated();
  const third = mission.handleEnemyDefeated();
  assert.equal(third.done, true);
  assert.equal(mission.getState('limpia-la-cancha').step, 'report');
  assert.match(mission.getObjective(), /Pipe/);

  const finish = mission.applyAction('reportCrime');
  assert.equal(finish.changed, true);
  assert.equal(finish.kind, 'finish');
  assert.equal(mission.coins, 25 + 60);
  assert.equal(mission.reputation.barrio, 10);
  assert.equal(finish.completion?.bullets?.length, 2);
});

test('las acciones fuera de orden no cambian el estado', () => {
  const mission = new MissionSystem({});
  for (const action of ['pipeMet', 'giveChancla', 'finishMission', 'reportCrime', 'nope']) {
    const result = mission.applyAction(action);
    assert.equal(result.changed, false, action);
  }
  assert.equal(mission.getState('el-mandado').step, 'inactive');
  assert.equal(mission.getState('limpia-la-cancha').step, 'locked');
  assert.equal(mission.collectItem('chancla').collected, false);
  assert.equal(mission.coins, 0);
});

test('no se puede recoger la chancleta dos veces', () => {
  const mission = new MissionSystem({ missions: { 'el-mandado': { step: 'find-chancla' } } });
  assert.equal(mission.collectItem('chancla').collected, true);
  assert.equal(mission.collectItem('chancla').collected, false);
  assert.equal(mission.getState('el-mandado').step, 'return-pipe');
});

test('un guardado terminado mantiene coherencia', () => {
  const mission = new MissionSystem({
    step: 'done',
    hasChancla: true,
    coins: 25,
    completed: false,
    drillUnlocked: false,
  });
  assert.equal(mission.getState('el-mandado').flags.hasChancla, false);
  assert.equal(mission.drillUnlocked, true);
  assert.equal(mission.getState('el-mandado').completed, true);
  assert.equal(mission.toSave().missions['el-mandado'].step, 'done');
});

test('markDrillCompleted solo se aplica una vez', () => {
  const mission = new MissionSystem({});
  assert.equal(mission.markDrillCompleted(), true);
  assert.equal(mission.markDrillCompleted(), false);
  assert.equal(mission.drillCompleted, true);
});

test('la estrella de objetivo apunta al NPC correcto', () => {
  const fresh = new MissionSystem({});
  assert.equal(fresh.markerNpc(), 'nena');

  const finding = new MissionSystem({ missions: { 'el-mandado': { step: 'find-pipe' } } });
  assert.equal(finding.markerNpc(), 'pipe');

  const done = new MissionSystem({ missions: { 'el-mandado': { step: 'done' } } });
  assert.equal(done.markerNpc(), 'pipe', 'sin mandado pendiente apunta a Pipe (misión criminal)');
  assert.equal(done.title, CRIME.title);
});
