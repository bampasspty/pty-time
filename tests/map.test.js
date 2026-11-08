import test from 'node:test';
import assert from 'node:assert/strict';
import { SAN_MIGUELITO as map } from '../src/world/sanMiguelito.js';
import { BUILDINGS, PROPS, NPC_IDS, TILE_SIZE, ZONE_TYPES, TILE_INDEX } from '../src/world/defs.js';
import { ENEMIES } from '../src/data/enemies.js';
import { cameraZoom, clamp } from '../src/config.js';

test('mapa con dimensiones y esquema válidos', () => {
  assert.equal(map.width, 64);
  assert.equal(map.height, 44);
  assert.equal(map.width * TILE_SIZE, 1024);
  assert.equal(map.height * TILE_SIZE, 704);
  assert.ok(map.spawn.x > 0 && map.spawn.x < 1024);
  assert.ok(map.spawn.y > 0 && map.spawn.y < 704);
  assert.ok(TILE_INDEX[map.ground.base] !== undefined);
});

test('todos los edificios y props usan kinds definidos', () => {
  assert.ok(map.buildings.length >= 10);
  assert.ok(map.props.length >= 30);
  for (const b of map.buildings) assert.ok(BUILDINGS[b.kind], b.kind);
  for (const p of map.props) assert.ok(PROPS[p.kind], p.kind);
});

test('están los 8 NPCs, la chancleta y las zonas abiertas', () => {
  assert.deepEqual(map.npcs.map((n) => n.id).sort(), [...NPC_IDS].sort());
  assert.ok(map.items.some((i) => i.id === 'chancla'));
  assert.ok(map.zones.some((z) => z.id === 'cancha' && z.type === 'open'));
  assert.ok(map.zones.some((z) => z.id === 'plaza' && z.type === 'open'));
  for (const z of map.zones) assert.ok(ZONE_TYPES[z.type], z.type);
});

test('ground rects dentro del mapa', () => {
  for (const r of map.ground.rects) {
    assert.ok(TILE_INDEX[r.tile] !== undefined, r.tile);
    assert.ok(r.tx >= 0 && r.ty >= 0 && r.tx + r.tw <= map.width && r.ty + r.th <= map.height, JSON.stringify(r));
  }
});

test('los matones del Slice A usan tipos definidos y quedan dentro del mapa', () => {
  assert.ok(Array.isArray(map.enemies), 'el mapa declara enemigos');
  assert.ok(map.enemies.length >= 3, 'al menos 3 matones para la misión de limpieza');
  for (const spawn of map.enemies) {
    assert.ok(ENEMIES[spawn.id], `tipo de enemigo desconocido: ${spawn.id}`);
    assert.ok(spawn.x > 0 && spawn.x < map.width * TILE_SIZE, JSON.stringify(spawn));
    assert.ok(spawn.y > 0 && spawn.y < map.height * TILE_SIZE, JSON.stringify(spawn));
  }
});

test('utilidades de cámara y clamp', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(cameraZoom(844, 390), 2);
  assert.equal(cameraZoom(1920, 1080), 4);
  assert.equal(cameraZoom(390, 844), 2);
});

test('spawns de zombis y suministros del Slice B son válidos', () => {
  assert.ok(Array.isArray(map.zombieSpawns), 'hay spawns de infectados');
  assert.ok(map.zombieSpawns.length >= 5);
  for (const spawn of map.zombieSpawns) {
    assert.ok(spawn.id === 'infectado', spawn.id);
    assert.ok(spawn.x > 0 && spawn.x < map.width * TILE_SIZE, JSON.stringify(spawn));
    assert.ok(spawn.y > 0 && spawn.y < map.height * TILE_SIZE, JSON.stringify(spawn));
  }
  assert.ok(Array.isArray(map.supplies), 'hay suministros');
  assert.ok(map.supplies.length >= 3);
  for (const supply of map.supplies) {
    assert.ok(['vendaje', 'lata', 'caja'].includes(supply.id), supply.id);
    assert.ok(supply.x > 0 && supply.x < map.width * TILE_SIZE, JSON.stringify(supply));
    assert.ok(supply.y > 0 && supply.y < map.height * TILE_SIZE, JSON.stringify(supply));
  }
});
