import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BUILDINGS, PROPS, PLAYER_VARIANTS, NPC_IDS } from '../src/world/defs.js';
import { ENEMIES } from '../src/data/enemies.js';

const ROOT = path.resolve('public/assets');

function pngSize(relPath) {
  const full = path.join(ROOT, relPath);
  assert.ok(fs.existsSync(full), `Falta ${relPath}`);
  const buf = fs.readFileSync(full);
  assert.equal(buf.toString('ascii', 1, 4), 'PNG', `${relPath} no es PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

test('tileset y fuente/logo existen con dimensiones exactas', () => {
  const tiles = pngSize('tiles/tileset.png');
  assert.deepEqual([tiles.width, tiles.height], [256, 16]);
  assert.equal(pngSize('ui/logo.png').width, 240);
  assert.equal(pngSize('ui/logo.png').height, 80);
  assert.ok(fs.existsSync(path.join(ROOT, 'ui/PressStart2P-Regular.ttf')), 'Falta la fuente OFL');
  assert.ok(fs.existsSync(path.join(ROOT, 'ui/OFL.txt')), 'Falta la licencia OFL');
});

test('hojas de personajes 48x96 y retratos 32x32', () => {
  for (const variant of PLAYER_VARIANTS) {
    const size = pngSize(`characters/player-${variant.id}.png`);
    assert.deepEqual([size.width, size.height], [48, 96], variant.id);
  }
  for (const id of NPC_IDS) {
    const size = pngSize(`characters/npc-${id}.png`);
    assert.deepEqual([size.width, size.height], [48, 96], id);
    const portrait = pngSize(`ui/portraits/portrait-${id}.png`);
    assert.deepEqual([portrait.width, portrait.height], [32, 32], id);
  }
  for (const p of ['portrait-player-m', 'portrait-player-f']) {
    const size = pngSize(`ui/portraits/${p}.png`);
    assert.deepEqual([size.width, size.height], [32, 32], p);
  }
});

test('hojas de enemigos 48x96 con el sprite declarado en data/enemies.js', () => {
  for (const [id, def] of Object.entries(ENEMIES)) {
    assert.equal(def.sprite, `enemy-${id}`);
    const size = pngSize(`characters/enemy-${id}.png`);
    assert.deepEqual([size.width, size.height], [48, 96], id);
  }
});

test('edificios y props coinciden con defs.js', () => {
  for (const [kind, def] of Object.entries(BUILDINGS)) {
    const size = pngSize(`buildings/${kind}.png`);
    assert.deepEqual([size.width, size.height], [def.width, def.height], kind);
  }
  for (const [kind, def] of Object.entries(PROPS)) {
    const size = pngSize(`props/${kind}.png`);
    assert.deepEqual([size.width, size.height], [def.width, def.height], kind);
  }
});

test('iconos de interfaz 16x16 y presupuesto de assets', () => {
  for (const icon of ['icon-back', 'icon-pin', 'icon-quake', 'icon-sound', 'icon-star', 'icon-talk']) {
    const size = pngSize(`ui/${icon}.png`);
    assert.deepEqual([size.width, size.height], [16, 16], icon);
  }
  let total = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else total += fs.statSync(full).size;
    }
  };
  walk(ROOT);
  assert.ok(total < 1.5 * 1024 * 1024, `Assets demasiado pesados: ${total} bytes`);
  console.log(`Assets total: ${(total / 1024).toFixed(1)} KB`);
});

test('hoja del zombi 48x96 y objetos de suministro 16x16', () => {
  const zombie = pngSize('characters/enemy-infectado.png');
  assert.deepEqual([zombie.width, zombie.height], [48, 96]);
  for (const prop of ['vendaje', 'lata', 'caja']) {
    const size = pngSize(`props/${prop}.png`);
    assert.deepEqual([size.width, size.height], [16, 16], prop);
  }
});
