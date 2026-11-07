import test from 'node:test';
import assert from 'node:assert/strict';
import { getDialogue } from '../src/data/dialogues.js';
import { NPCS } from '../src/data/npcs.js';
import { NPC_IDS } from '../src/world/defs.js';

const STEPS = ['inactive', 'find-pipe', 'find-chancla', 'return-pipe', 'report-nena', 'done'];
const CRIME_STEPS = ['locked', 'inactive', 'deal', 'report', 'done'];
const ACTIONS = new Set([
  'startMission',
  'pipeMet',
  'giveChancla',
  'finishMission',
  'startCrime',
  'reportCrime',
]);

test('los 8 NPCs tienen datos completos', () => {
  assert.deepEqual(Object.keys(NPCS).sort(), [...NPC_IDS].sort());
  for (const id of NPC_IDS) {
    const npc = NPCS[id];
    assert.ok(npc.name, id);
    assert.ok(npc.role, id);
    assert.equal(npc.sprite, `npc-${id}`);
    assert.equal(npc.portrait, `portrait-${id}`);
  }
});

test('getDialogue responde para todas las combinaciones sin romperse', () => {
  for (const id of NPC_IDS) {
    for (const step of STEPS) {
      for (const crimeStep of CRIME_STEPS) {
        for (const hasChancla of [false, true]) {
          for (const drillUnlocked of [false, true]) {
            const result = getDialogue(id, { step, crimeStep, hasChancla, drillUnlocked });
            assert.ok(Array.isArray(result.lines), `${id}/${step}/${crimeStep}`);
            assert.ok(result.lines.length >= 1, `${id}/${step}/${crimeStep} sin líneas`);
            assert.ok(result.lines.length <= 3, `${id}/${step}/${crimeStep} demasiadas líneas`);
            assert.ok(
              result.action === null || ACTIONS.has(result.action),
              `${id}/${step}/${crimeStep} acción inválida: ${result.action}`,
            );
            for (const line of result.lines) {
              assert.ok(line.speaker && line.text, `${id}/${step}/${crimeStep} línea incompleta`);
              assert.ok(line.text.length <= 180, `${id}/${step}/${crimeStep} línea muy larga`);
            }
          }
        }
      }
    }
  }
});

test('acciones de misión exactas del mandado', () => {
  const base = { hasChancla: false, drillUnlocked: false };
  assert.equal(getDialogue('nena', { ...base, step: 'inactive' }).action, 'startMission');
  assert.equal(getDialogue('nena', { ...base, step: 'find-pipe' }).action, null);
  assert.equal(getDialogue('pipe', { ...base, step: 'find-pipe' }).action, 'pipeMet');
  assert.equal(getDialogue('pipe', { ...base, step: 'return-pipe', hasChancla: true }).action, 'giveChancla');
  assert.equal(getDialogue('nena', { ...base, step: 'report-nena' }).action, 'finishMission');
  assert.equal(getDialogue('nena', { ...base, step: 'done' }).action, null);
});

test('acciones de la misión criminal desde Pipe', () => {
  const base = { step: 'done', hasChancla: false, drillUnlocked: true };
  assert.equal(getDialogue('pipe', { ...base, crimeStep: 'inactive' }).action, 'startCrime');
  assert.equal(getDialogue('pipe', { ...base, crimeStep: 'deal' }).action, null);
  assert.equal(getDialogue('pipe', { ...base, crimeStep: 'report' }).action, 'reportCrime');
  assert.equal(getDialogue('pipe', { ...base, crimeStep: 'done' }).action, null);
  assert.equal(getDialogue('pipe', { ...base, crimeStep: 'locked' }).action, null);
});

test('la misión criminal no se dispara si el mandado no terminó', () => {
  for (const step of ['inactive', 'find-pipe', 'find-chancla', 'return-pipe', 'report-nena']) {
    const result = getDialogue('pipe', { step, crimeStep: 'inactive' });
    assert.notEqual(result.action, 'startCrime', step);
  }
});

test('nunca dispara acciones en pasos intermedios', () => {
  const base = { hasChancla: false, drillUnlocked: false };
  for (const id of ['chen', 'melva', 'kevin', 'yolanda', 'ana', 'chofer']) {
    for (const step of STEPS) {
      for (const crimeStep of CRIME_STEPS) {
        assert.equal(getDialogue(id, { ...base, step, crimeStep }).action, null, `${id}/${step}/${crimeStep}`);
      }
    }
  }
});

test('NPC desconocido y contexto inválido son seguros', () => {
  assert.deepEqual(getDialogue('nadie', { step: 'inactive' }), { lines: [], action: null });
  const result = getDialogue('nena', null);
  assert.ok(Array.isArray(result.lines));
  assert.equal(result.action, null);
});
