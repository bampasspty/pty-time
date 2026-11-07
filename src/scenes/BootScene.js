import Phaser from 'phaser';
import { BUILDINGS, PROPS, PLAYER_VARIANTS, NPC_IDS } from '../world/defs.js';
import { ENEMY_IDS } from '../data/enemies.js';
import { events } from '../systems/EventBus.js';

const UI_IMAGES = [
  ['logo', 'assets/ui/logo.png'],
  ['icon-star', 'assets/ui/icon-star.png'],
  ['icon-pin', 'assets/ui/icon-pin.png'],
  ['icon-talk', 'assets/ui/icon-talk.png'],
  ['icon-quake', 'assets/ui/icon-quake.png'],
  ['icon-sound', 'assets/ui/icon-sound.png'],
  ['icon-back', 'assets/ui/icon-back.png'],
];

const DIRECTIONS = ['down', 'left', 'right', 'up'];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.cameras.main.setBackgroundColor('#0b1020');
    this.buildProgressUi();

    this.load.on('loaderror', (file) => {
      console.error('[Boot] No se pudo cargar:', file.src);
      this.loadErrors = (this.loadErrors || 0) + 1;
    });

    this.load.spritesheet('tiles', 'assets/tiles/tileset.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

    for (const variant of PLAYER_VARIANTS) {
      this.load.spritesheet(`player-${variant.id}`, `assets/characters/player-${variant.id}.png`, {
        frameWidth: 16,
        frameHeight: 24,
      });
    }

    for (const id of NPC_IDS) {
      this.load.spritesheet(`npc-${id}`, `assets/characters/npc-${id}.png`, {
        frameWidth: 16,
        frameHeight: 24,
      });
    }

    for (const id of ENEMY_IDS) {
      this.load.spritesheet(`enemy-${id}`, `assets/characters/enemy-${id}.png`, {
        frameWidth: 16,
        frameHeight: 24,
      });
    }

    for (const [kind, def] of Object.entries(BUILDINGS)) {
      this.load.image(def.image, `assets/buildings/${kind}.png`);
    }

    for (const [kind, def] of Object.entries(PROPS)) {
      this.load.image(def.image, `assets/props/${kind}.png`);
    }

    for (const id of NPC_IDS) {
      this.load.image(`portrait-${id}`, `assets/ui/portraits/portrait-${id}.png`);
    }
    this.load.image('portrait-player-m', 'assets/ui/portraits/portrait-player-m.png');
    this.load.image('portrait-player-f', 'assets/ui/portraits/portrait-player-f.png');

    for (const [key, path] of UI_IMAGES) this.load.image(key, path);
  }

  buildProgressUi() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0b1020).setDepth(0);
    const barW = Math.min(280, width * 0.6);
    const barH = 10;
    this.add
      .text(width / 2, height / 2 - 38, 'PTY TIME', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ffd166',
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.add
      .text(width / 2, height / 2 - 16, 'SAN MIGUELITO', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#8d99ae',
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.track = this.add.rectangle(width / 2, height / 2 + 16, barW, barH, 0x151b33).setDepth(2);
    this.fill = this.add
      .rectangle(width / 2 - barW / 2, height / 2 + 16, 0, barH - 2, 0xffd166)
      .setOrigin(0, 0.5)
      .setDepth(3);
    this.barW = barW;
    this.add
      .text(width / 2, height / 2 + 40, 'Cargando el barrio…', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#c9d1e6',
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.load.on('progress', (value) => {
      this.fill.width = Math.max(1, (this.barW - 2) * value);
    });
    bg.setDepth(1);
  }

  create() {
    this.createFxTextures();
    this.createAnimations();
    document.getElementById('loading')?.classList.add('hidden');
    if (this.loadErrors) console.warn(`[Boot] ${this.loadErrors} assets no cargaron; revisa rutas.`);
    events.emit('boot:ready', { loadErrors: this.loadErrors || 0 });
    this.scene.start('Title');
  }

  // Texturas mínimas de combate generadas en memoria (no son PNG del contrato
  // de assets): bala, fogonazo, impacto y mira. Se crean una sola vez.
  createFxTextures() {
    const make = (key, width, height, draw) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      draw(g);
      g.generateTexture(key, width, height);
      g.destroy();
    };

    make('fx-bullet', 4, 2, (g) => {
      g.fillStyle(0xfff3b0, 1);
      g.fillRect(0, 0, 4, 1);
      g.fillStyle(0xffd166, 1);
      g.fillRect(0, 1, 4, 1);
    });

    make('fx-muzzle', 10, 10, (g) => {
      g.fillStyle(0xfff3b0, 1);
      g.fillRect(4, 0, 2, 10);
      g.fillRect(0, 4, 10, 2);
      g.fillStyle(0xffd166, 0.9);
      g.fillRect(4, 2, 2, 6);
      g.fillRect(2, 4, 6, 2);
    });

    make('fx-hit', 6, 6, (g) => {
      g.fillStyle(0xffd166, 1);
      g.fillRect(2, 0, 2, 6);
      g.fillRect(0, 2, 6, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRect(2, 2, 2, 2);
    });

    make('ui-crosshair', 13, 13, (g) => {
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(0, 6, 4, 1);
      g.fillRect(9, 6, 4, 1);
      g.fillRect(6, 0, 1, 4);
      g.fillRect(6, 9, 1, 4);
      g.fillStyle(0xffd166, 1);
      g.fillRect(6, 6, 1, 1);
    });
  }

  createAnimations() {
    const keys = [
      ...PLAYER_VARIANTS.map((v) => `player-${v.id}`),
      ...NPC_IDS.map((id) => `npc-${id}`),
      ...ENEMY_IDS.map((id) => `enemy-${id}`),
    ];

    for (const key of keys) {
      for (let row = 0; row < 4; row++) {
        const dir = DIRECTIONS[row];
        const animKey = `${key}-walk-${dir}`;
        if (this.anims.exists(animKey)) continue;
        const base = row * 3;
        this.anims.create({
          key: animKey,
          frames: [
            { key, frame: base + 1 },
            { key, frame: base },
            { key, frame: base + 2 },
            { key, frame: base },
          ],
          frameRate: 6,
          repeat: -1,
        });
      }
    }
  }
}
