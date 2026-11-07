import Phaser from 'phaser';
import { TILE_SIZE, TILE_INDEX, BUILDINGS, PROPS } from './defs.js';

// Construye el mundo visual y las cajas de colisión a partir de los datos del mapa.
export class MapBuilder {
  constructor(scene, mapData) {
    this.scene = scene;
    this.map = mapData;
    this.colliders = [];
    this.staticGroup = scene.physics.add.staticGroup();
    this.items = [];
    this.npcSpawns = [];
    this.buildings = [];
    this.props = [];
    this.worldWidth = mapData.width * TILE_SIZE;
    this.worldHeight = mapData.height * TILE_SIZE;
  }

  build() {
    this.buildGround();
    this.buildRoadDetails();
    this.buildZoneDetails();
    this.buildBuildings();
    this.buildProps();
    this.buildCables();
    this.buildItems();
    this.npcSpawns = this.map.npcs ?? [];
    return {
      colliders: this.colliders,
      staticGroup: this.staticGroup,
      items: this.items,
      npcSpawns: this.npcSpawns,
      buildings: this.buildings,
      props: this.props,
      zones: this.map.zones ?? [],
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
    };
  }

  buildGround() {
    const { scene, map } = this;
    const tilemap = scene.make.tilemap({
      width: map.width,
      height: map.height,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = tilemap.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) {
      console.error('[MapBuilder] No se pudo crear el tileset');
      return;
    }
    const layer = tilemap.createBlankLayer('ground', tileset, 0, 0);
    layer.setDepth(-1000);

    const baseIndex = TILE_INDEX[map.ground?.base] ?? TILE_INDEX.grass;
    layer.fill(baseIndex, 0, 0, map.width, map.height);

    for (const rect of map.ground?.rects ?? []) {
      const index = TILE_INDEX[rect.tile];
      if (index === undefined) continue;
      layer.fill(index, rect.tx, rect.ty, rect.tw, rect.th);
    }
    this.groundLayer = layer;
    this.tilemap = tilemap;
  }

  buildRoadDetails() {
    const { scene, map } = this;
    const g = scene.add.graphics().setDepth(-950);
    const rects = (map.ground?.rects ?? []).filter(
      (r) => (r.tile === 'asphalt' || r.tile === 'asphalt2' || r.tile === 'asphaltPatch') && r.tw >= 3 && r.th >= 3
    );

    for (const rect of rects) {
      const x = rect.tx * TILE_SIZE;
      const y = rect.ty * TILE_SIZE;
      const w = rect.tw * TILE_SIZE;
      const h = rect.th * TILE_SIZE;
      g.lineStyle(1, 0x1b1b2b, 0.22);
      g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    // Suaviza apenas el contraste del paso peatonal sobre el asfalto.
    for (const rect of map.ground?.rects ?? []) {
      if (rect.tile !== 'crosswalk') continue;
      g.fillStyle(0x1b1b2b, 0.06);
      g.fillRect(rect.tx * TILE_SIZE, rect.ty * TILE_SIZE, rect.tw * TILE_SIZE, rect.th * TILE_SIZE);
    }

    // Líneas discontinuas en calles largas (solo el eje principal).
    for (const rect of rects) {
      const x = rect.tx * TILE_SIZE;
      const y = rect.ty * TILE_SIZE;
      const w = rect.tw * TILE_SIZE;
      const h = rect.th * TILE_SIZE;
      if (w >= h && w >= 320 && h >= 64) {
        const cy = Math.round(y + h / 2);
        g.fillStyle(0xf2c94c, 0.75);
        for (let px = x + 8; px < x + w - 8; px += 14) g.fillRect(px, cy, 7, 1);
      } else if (h > w && h >= 320 && w >= 64) {
        const cx = Math.round(x + w / 2);
        g.fillStyle(0xf2c94c, 0.75);
        for (let py = y + 8; py < y + h - 8; py += 14) g.fillRect(cx, py, 1, 7);
      }
    }
  }

  buildZoneDetails() {
    const { scene, map } = this;
    const g = scene.add.graphics().setDepth(-940);
    for (const zone of map.zones ?? []) {
      if (zone.type !== 'open') continue;
      const { x, y, w, h } = zone;
      if (zone.id === 'cancha') {
        // Tinte de cancha sintética y líneas de baloncesto.
        g.fillStyle(0x0f5f58, 0.12);
        g.fillRect(x, y, w, h);
        const inset = 9;
        g.lineStyle(1, 0xffffff, 0.7);
        g.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
        const cx = x + w / 2;
        const cy = y + h / 2;
        g.lineBetween(cx, y + inset, cx, y + h - inset);
        g.strokeCircle(cx, cy, Math.min(22, h * 0.18));
        const keyW = Math.min(38, w * 0.2);
        const keyH = Math.min(56, h * 0.4);
        g.strokeRect(x + inset, cy - keyH / 2, keyW, keyH);
        g.strokeRect(x + w - inset - keyW, cy - keyH / 2, keyW, keyH);
        g.strokeCircle(x + inset + keyW + 16, cy, 15);
        g.strokeCircle(x + w - inset - keyW - 16, cy, 15);

        const label = scene.add
          .text(cx, y + 14, 'CANCHA SAN ISIDRO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#eafff7',
            stroke: '#0b3c38',
            strokeThickness: 2,
          })
          .setOrigin(0.5, 0)
          .setAlpha(0.72)
          .setDepth(-930);
        this.zoneLabels = this.zoneLabels ?? [];
        this.zoneLabels.push(label);
      } else if (zone.id === 'plaza') {
        g.fillStyle(0xffd166, 0.08);
        g.fillRect(x, y, w, h);
      }
    }
    this.zoneGraphics = g;
  }

  addStaticBox(x, y, width, height) {
    const zone = this.scene.add.zone(x, y, width, height).setOrigin(0, 0);
    this.scene.physics.add.existing(zone, true);
    this.colliders.push(zone);
    this.staticGroup.add(zone);
    return zone;
  }

  buildBuildings() {
    const { scene, map } = this;
    for (const entry of map.buildings ?? []) {
      const def = BUILDINGS[entry.kind];
      if (!def) {
        console.warn('[MapBuilder] Edificio desconocido:', entry.kind);
        continue;
      }
      const image = scene.add.image(entry.x, entry.y, def.image).setOrigin(0.5, 1).setDepth(entry.y);
      image.setData('id', entry.id ?? entry.kind);
      this.buildings.push(image);

      const body = def.body;
      if (body) {
        this.addStaticBox(
          entry.x - body.width / 2,
          entry.y - body.gap - body.height,
          body.width,
          body.height
        );
      }
    }
  }

  buildProps() {
    const { scene, map } = this;
    for (const entry of map.props ?? []) {
      const def = PROPS[entry.kind];
      if (!def) {
        console.warn('[MapBuilder] Prop desconocido:', entry.kind);
        continue;
      }
      const image = scene.add.image(entry.x, entry.y, def.image).setOrigin(0.5, 1).setDepth(entry.y);
      if (entry.flip) image.setFlipX(true);
      this.props.push(image);

      if (def.solid) {
        this.addStaticBox(
          entry.x - def.solid.width / 2,
          entry.y - def.solid.gap - def.solid.height,
          def.solid.width,
          def.solid.height
        );
      }
    }
  }

  buildCables() {
    const poles = (this.map.props ?? [])
      .filter((p) => p.kind === 'power-pole')
      .sort((a, b) => a.y - b.y || a.x - b.x);
    if (poles.length < 2) return;

    const g = this.scene.add.graphics().setDepth(9000);
    const connected = new Set();
    for (let i = 0; i < poles.length; i++) {
      for (let j = i + 1; j < poles.length; j++) {
        const a = poles[i];
        const b = poles[j];
        const key = `${i}-${j}`;
        if (connected.has(key)) continue;
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        if (dx >= 20 && dx <= 96 && dy <= 10) {
          connected.add(key);
          this.drawCable(g, a.x, a.y - 44, b.x, b.y - 44);
          this.drawCable(g, a.x + 2, a.y - 40, b.x + 2, b.y - 40);
        }
      }
    }
    this.cableGraphics = g;
  }

  drawCable(g, x1, y1, x2, y2) {
    g.lineStyle(1, 0x1b1b2b, 0.55);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + 5;
    const steps = 8;
    g.beginPath();
    g.moveTo(x1, y1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const inv = 1 - t;
      const x = inv * inv * x1 + 2 * inv * t * midX + t * t * x2;
      const y = inv * inv * y1 + 2 * inv * t * midY + t * t * y2;
      g.lineTo(x, y);
    }
    g.strokePath();
  }

  buildItems() {
    const { scene, map } = this;
    for (const entry of map.items ?? []) {
      const def = PROPS[entry.kind];
      if (!def) continue;
      const sprite = scene.add.image(entry.x, entry.y, def.image).setOrigin(0.5, 1).setDepth(entry.y);
      sprite.setData('itemId', entry.id);
      sprite.setData('kind', entry.kind);

      const glow = scene.add.ellipse(entry.x, entry.y - 3, 20, 8, 0xffd166, 0.28).setDepth(entry.y - 1);
      scene.tweens.add({
        targets: sprite,
        y: entry.y - 3,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.15, to: 0.4 },
        scaleX: { from: 0.8, to: 1.15 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.items.push({ ...entry, sprite, glow });
    }
  }

  destroy() {
    this.colliders.forEach((zone) => zone.destroy());
    this.colliders = [];
    this.items.forEach((item) => {
      item.sprite?.destroy();
      item.glow?.destroy();
    });
    this.items = [];
    this.cableGraphics?.destroy();
    this.zoneGraphics?.destroy();
    this.zoneLabels?.forEach((label) => label.destroy());
    this.groundLayer?.destroy();
    this.tilemap?.destroy();
  }
}

export { BUILDINGS, PROPS, TILE_INDEX, TILE_SIZE };
