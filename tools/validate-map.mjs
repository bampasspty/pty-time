// Validador del mapa. Uso: node tools/validate-map.mjs
// Comprueba límites, colisiones, ids requeridos y coherencia del esquema.
import { SAN_MIGUELITO as map } from '../src/world/sanMiguelito.js';
import { TILE_SIZE, TILE_INDEX, BUILDINGS, PROPS, NPC_IDS, ZONE_TYPES } from '../src/world/defs.js';

const errors = [];
const warnings = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };
const warn = (cond, msg) => { if (!cond) warnings.push(msg); };

const worldW = map.width * TILE_SIZE;
const worldH = map.height * TILE_SIZE;

function bodyRect(x, y, body) {
  if (!body) return null;
  return { x: x - body.width / 2, y: y - body.gap - body.height, w: body.width, h: body.height };
}
function overlap(a, b, pad = 0) {
  return !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);
}
function inside(px, py, rect, pad = 2) {
  return px >= rect.x - pad && px <= rect.x + rect.w + pad && py >= rect.y - pad && py <= rect.y + rect.h + pad;
}
function pointBlocked(px, py, pad = 2) {
  for (const b of map.buildings) {
    const def = BUILDINGS[b.kind];
    if (def && inside(px, py, bodyRect(b.x, b.y, def.body), pad)) return `edificio ${b.id ?? b.kind}`;
  }
  for (const p of map.props) {
    const def = PROPS[p.kind];
    if (def?.solid && inside(px, py, bodyRect(p.x, p.y, def.solid), pad)) return `prop ${p.kind} (${p.x},${p.y})`;
  }
  return null;
}

// --- estructura general ---
assert(map.width === 64 && map.height === 44, `Dimensiones deben ser 64x44, son ${map.width}x${map.height}`);
for (const key of ['id', 'title', 'subtitle', 'spawn', 'ground', 'buildings', 'props', 'npcs', 'items', 'zones']) {
  assert(map[key] !== undefined, `Falta la clave ${key}`);
}
assert(map.spawn.x > 0 && map.spawn.x < worldW && map.spawn.y > 0 && map.spawn.y < worldH, 'spawn fuera del mapa');

// --- ground ---
assert(TILE_INDEX[map.ground.base] !== undefined, `Tile base inválido: ${map.ground.base}`);
for (const [i, r] of map.ground.rects.entries()) {
  assert(TILE_INDEX[r.tile] !== undefined, `ground.rects[${i}] tile inválido: ${r.tile}`);
  assert(r.tw > 0 && r.th > 0, `ground.rects[${i}] tamaño inválido`);
  assert(r.tx >= 0 && r.ty >= 0 && r.tx + r.tw <= map.width && r.ty + r.th <= map.height,
    `ground.rects[${i}] fuera del mapa (${r.tx},${r.ty},${r.tw},${r.th})`);
}

// --- edificios ---
const buildingBoxes = [];
for (const [i, b] of map.buildings.entries()) {
  const def = BUILDINGS[b.kind];
  assert(def, `buildings[${i}] kind inválido: ${b.kind}`);
  if (!def) continue;
  const img = { x: b.x - def.width / 2, y: b.y - def.height, w: def.width, h: def.height };
  assert(img.x >= 0 && img.y >= 0 && img.x + img.w <= worldW && img.y + img.h <= worldH,
    `Edificio ${b.id ?? b.kind} fuera del mapa (${b.x},${b.y})`);
  buildingBoxes.push({ ...img, id: b.id ?? b.kind, body: bodyRect(b.x, b.y, def.body) });
}
for (let i = 0; i < buildingBoxes.length; i++) {
  for (let j = i + 1; j < buildingBoxes.length; j++) {
    assert(!overlap(buildingBoxes[i], buildingBoxes[j], -2),
      `Edificios solapados: ${buildingBoxes[i].id} y ${buildingBoxes[j].id}`);
  }
}

// --- props ---
for (const [i, p] of map.props.entries()) {
  const def = PROPS[p.kind];
  assert(def, `props[${i}] kind inválido: ${p.kind}`);
  if (!def) continue;
  assert(p.x - def.width / 2 >= 0 && p.y - def.height >= 0 && p.x + def.width / 2 <= worldW && p.y <= worldH,
    `Prop ${p.kind} fuera del mapa (${p.x},${p.y})`);
  if (def.solid) {
    const pr = bodyRect(p.x, p.y, def.solid);
    for (const bb of buildingBoxes) {
      assert(!overlap(pr, bb), `Prop sólido ${p.kind} (${p.x},${p.y}) encima de ${bb.id}`);
    }
  }
}

// --- npcs ---
const npcSet = new Set();
for (const [i, n] of map.npcs.entries()) {
  assert(NPC_IDS.includes(n.id), `npcs[${i}] id inválido: ${n.id}`);
  assert(!npcSet.has(n.id), `NPC duplicado: ${n.id}`);
  npcSet.add(n.id);
  assert(Number.isFinite(n.x) && Number.isFinite(n.y), `NPC ${n.id} sin posición`);
  const blocked = pointBlocked(n.x, n.y, 3);
  assert(!blocked, `NPC ${n.id} dentro de ${blocked}`);
  assert(n.wander >= 0 && n.wander <= 64, `NPC ${n.id}: wander debe ser 0-64`);
}
for (const id of NPC_IDS) assert(npcSet.has(id), `Falta el NPC ${id}`);

// --- items ---
for (const [i, it] of map.items.entries()) {
  const def = PROPS[it.kind];
  assert(def, `items[${i}] kind inválido: ${it.kind}`);
  const blocked = pointBlocked(it.x, it.y, 3);
  assert(!blocked, `Item ${it.id} dentro de ${blocked}`);
}
assert(map.items.some((it) => it.id === 'chancla'), 'Falta el item chancla');

// --- zones ---
for (const [i, z] of map.zones.entries()) {
  assert(ZONE_TYPES[z.type], `zones[${i}] type inválido: ${z.type}`);
  assert(z.w > 0 && z.h > 0, `zones[${i}] tamaño inválido`);
  assert(z.x >= 0 && z.y >= 0 && z.x + z.w <= worldW && z.y + z.h <= worldH, `Zona ${z.id} fuera del mapa`);
}
for (const id of ['cancha', 'plaza']) {
  const z = map.zones.find((zz) => zz.id === id);
  assert(z && z.type === 'open', `Falta zona abierta ${id} (type open)`);
}

// --- spawn y conectividad básica ---
const spawnBlocked = pointBlocked(map.spawn.x, map.spawn.y, 4);
assert(!spawnBlocked, `Spawn bloqueado por ${spawnBlocked}`);
for (const n of map.npcs) {
  const d = Math.hypot(n.x - map.spawn.x, n.y - map.spawn.y);
  warn(d >= 40, `NPC ${n.id} demasiado cerca del spawn (${Math.round(d)} px)`);
}

// --- contenido mínimo ---
warn(map.buildings.length >= 10, `Pocos edificios: ${map.buildings.length} (se esperan >= 10)`);
warn(map.props.length >= 30, `Pocos props: ${map.props.length} (se esperan >= 30)`);

if (warnings.length) {
  console.log(`Advertencias (${warnings.length}):`);
  for (const w of warnings) console.log('  - ' + w);
}
if (errors.length) {
  console.error(`MAP ERRORS (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`MAP OK · ${map.buildings.length} edificios · ${map.props.length} props · ${map.npcs.length} NPCs · ${map.zones.length} zonas`);
