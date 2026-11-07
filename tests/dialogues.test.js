import test from 'node:test';
import assert from 'node:assert/strict';
import { getDialogue } from '../src/data/dialogues.js';
import { NPCS } from '../src/data/npcs.js';
import { NPC_IDS } from '../src/world/defs.js';

const STEPS = ['inactive', 'find-pipe', 'find-chancla', 'return-pipe', 'report-nena', 'done'];
const ACTIONS = new Set(['startMission', 'pipeMet', 'giveChancla', 'finishMission']);

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
      for (const hasChancla of [false, true]) {
        for (const drillUnlocked of [false, true]) {
          const result = getDialogue(id, { step, hasChancla, drillUnlocked });
          assert.ok(Array.isArray(result.lines), `${id}/${step}`);
          assert.ok(result.lines.length >= 1, `${id}/${step} sin líneas`);
          assert.ok(result.lines.length <= 3, `${id}/${step} demasiadas líneas`);
          assert.ok(result.action === null || ACTIONS.has(result.action), `${id}/${step} acción inválida`);
          for (const line of result.lines) {
            assert.ok(line.speaker && line.text, `${id}/${step} línea incompleta`);
            assert.ok(line.text.length <= 180, `${id}/${step} línea muy larga`);
          }
        }
      }
    }
  }
});

test('acciones de misión exactas', () => {
  const base = { hasChancla: false, drillUnlocked: false };
  assert.equal(getDialogue('nena', { ...base, step: 'inactive' }).action, 'startMission');
  assert.equal(getDialogue('nena', { ...base, step: 'find-pipe' }).action, null);
  assert.equal(getDialogue('pipe', { ...base, step: 'find-pipe' }).action, 'pipeMet');
  assert.equal(getDialogue('pipe', { ...base, step: 'return-pipe', hasChancla: true }).action, 'giveChancla');
  assert.equal(getDialogue('nena', { ...base, step: 'report-nena' }).action, 'finishMission');
  assert.equal(getDialogue('nena', { ...base, step: 'done' }).action, null);
});

test('nunca dispara acciones en pasos intermedios', () => {
  const base = { hasChancla: false, drillUnlocked: false };
  for (const id of ['chen', 'melva', 'kevin', 'yolanda', 'ana', 'chofer']) {
    for (const step of STEPS) {
      assert.equal(getDialogue(id, { ...base, step }).action, null, `${id}/${step}`);
    }
  }
});

test('NPC desconocido y contexto inválido son seguros', () => {
  assert.deepEqual(getDialogue('nadie', { step: 'inactive' }), { lines: [], action: null });
  const result = getDialogue('nena', null);
  assert.ok(Array.isArray(result.lines));
  assert.equal(result.action, null);
});
