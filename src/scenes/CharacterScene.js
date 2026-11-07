import Phaser from 'phaser';
import { ensureTitleBackdrop } from '../ui/Backdrop.js';
import { PixelButton } from '../ui/PixelButton.js';
import { CALITO } from '../data/calito.js';
import { CSS, clamp, textStyle } from '../config.js';

const SHIRTS = [
  { id: 'red', color: 0xe94f4f, label: 'roja' },
  { id: 'blue', color: 0x2f80ed, label: 'azul' },
  { id: 'yellow', color: 0xf2c94c, label: 'amarilla' },
  { id: 'green', color: 0x27ae60, label: 'verde' },
];

export class CharacterScene extends Phaser.Scene {
  constructor() {
    super('Character');
  }

  init(data) {
    const initial = data?.variant ?? CALITO.defaultVariant;
    // Calito es el protagonista: el cuerpo queda fijo y la camisa es cosmética.
    this.bodyType = 'm';
    this.shirt = initial.split('-')[1] ?? 'blue';
    if (!SHIRTS.some((s) => s.id === this.shirt)) this.shirt = 'blue';
    this.variant = `${this.bodyType}-${this.shirt}`;
  }

  create() {
    ensureTitleBackdrop(this);
    this.bg = this.add.image(0, 0, 'title-bg').setOrigin(0.5, 0.5);
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0b1020, 0.58).setOrigin(0, 0);

    this.title = this.add
      .text(0, 0, CALITO.name.toUpperCase(), textStyle(20, CSS.yellow, { stroke: '#0b1020', strokeThickness: 4 }))
      .setOrigin(0.5);
    this.subtitle = this.add
      .text(0, 0, 'Muchacho de San Miguelito · elige la camisa', textStyle(8, CSS.soft))
      .setOrigin(0.5);

    this.shadow = this.add.ellipse(0, 0, 110, 26, 0x1b1b2b, 0.4);
    this.preview = this.add.sprite(0, 0, `player-${this.variant}`, 0).setOrigin(0.5, 1);
    this.preview.play(`player-${this.variant}-walk-down`);

    this.shirtLabel = this.add.text(0, 0, 'CAMISA', textStyle(8, CSS.yellow)).setOrigin(0.5);

    this.shirtButtons = SHIRTS.map((shirt) => {
      const container = this.add.container(0, 0);
      const bg = this.add
        .rectangle(0, 0, 44, 34, shirt.color, 1)
        .setStrokeStyle(2, 0x1b1b2b, 1)
        .setInteractive({ useHandCursor: true });
      const glow = this.add
        .rectangle(0, 0, 50, 40, 0x000000, 0)
        .setStrokeStyle(3, 0xffffff, 0.95)
        .setVisible(false);
      container.add([bg, glow]);
      bg.on('pointerdown', () => this.setShirt(shirt.id));
      return { container, bg, glow, id: shirt.id, color: shirt.color };
    });

    this.backButton = new PixelButton(this, { label: 'VOLVER', onClick: () => this.scene.start('Title') });
    this.startButton = new PixelButton(this, { label: 'ENTRAR AL BARRIO', primary: true, onClick: () => this.enterGame() });

    this.scale.on('resize', this.onResize, this);
    this.layout(this.scale.width, this.scale.height);
    this.updateSelectionUI();
    this.cameras.main.fadeIn(280, 0, 0, 0);
    this.input.keyboard.on('keydown', this.onKeyDown, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
      this.input.keyboard.off('keydown', this.onKeyDown, this);
    });
  }

  setShirt(shirt) {
    if (shirt === this.shirt) return;
    this.shirt = shirt;
    this.refreshPreview();
  }

  refreshPreview() {
    this.variant = `${this.bodyType}-${this.shirt}`;
    this.preview.setTexture(`player-${this.variant}`, 0);
    this.preview.play(`player-${this.variant}-walk-down`);
    this.updateSelectionUI();
  }

  updateSelectionUI() {
    for (const sw of this.shirtButtons) {
      const active = sw.id === this.shirt;
      sw.glow.setVisible(active);
      sw.bg.setStrokeStyle(active ? 3 : 2, active ? 0xffffff : 0x1b1b2b, 1);
    }
  }

  enterGame() {
    this.scene.start('Game', { variant: this.variant });
  }

  onKeyDown(event) {
    if (event.code === 'Enter' || event.code === 'Space') {
      this.enterGame();
    } else if (event.code === 'Escape') {
      this.scene.start('Title');
    } else if (event.code === 'KeyA' || event.code === 'ArrowLeft' || event.code === 'KeyW') {
      const i = SHIRTS.findIndex((s) => s.id === this.shirt);
      this.setShirt(SHIRTS[(i + SHIRTS.length - 1) % SHIRTS.length].id);
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight' || event.code === 'KeyS') {
      const i = SHIRTS.findIndex((s) => s.id === this.shirt);
      this.setShirt(SHIRTS[(i + 1) % SHIRTS.length].id);
    }
  }

  onResize(gameSize) {
    this.layout(gameSize.width, gameSize.height);
  }

  layout(width, height) {
    this.width = width;
    this.height = height;
    const cover = Math.max(width / 480, height / 270);
    this.bg.setDisplaySize(480 * cover, 270 * cover).setPosition(width / 2, height / 2);
    this.overlay.setSize(width, height);

    const titleFit = Math.floor((width * 0.9) / (18 * 1.05));
    this.title.setFontSize(clamp(Math.min(Math.round(height / 24), titleFit), 12, 22));
    this.subtitle.setFontSize(clamp(Math.round(height / 50), 7, 10));

    const landscape = width > height * 1.15;
    const previewScale = clamp(Math.round(height / 80), 3, 6);
    const pw = 16 * previewScale;
    const ph = 24 * previewScale;

    if (landscape) {
      this.title.setPosition(width * 0.5, 26);
      this.subtitle.setPosition(width * 0.5, 26 + this.title.height + 6);
      const previewX = Math.round(width * 0.26);
      const previewY = Math.round(height * 0.62);
      this.preview.setScale(previewScale).setPosition(previewX, previewY);
      this.shadow.setPosition(previewX, previewY - 2).setSize(pw * 0.9, ph * 0.16);
      this.positionControls(width * 0.62, height * 0.35, Math.min(width * 0.34, 280));
    } else {
      this.title.setPosition(width / 2, 22);
      this.subtitle.setPosition(width / 2, 22 + this.title.height + 6);
      const previewX = Math.round(width / 2);
      const previewY = Math.round(height * 0.38);
      this.preview.setScale(previewScale).setPosition(previewX, previewY);
      this.shadow.setPosition(previewX, previewY - 2).setSize(pw * 0.9, ph * 0.16);
      this.positionControls(width / 2, height * 0.55, Math.min(width - 32, 300));
    }

    this.title.setDepth(10);
    this.preview.setDepth(5);
    this.shadow.setDepth(4);
  }

  positionControls(centerX, topY, contentW) {
    const btnH = clamp(Math.round(this.height * 0.05), 30, 40);
    let y = topY;

    this.shirtLabel.setPosition(centerX, y);
    y += 18;
    const swW = 44;
    const swGap = 10;
    const total = this.shirtButtons.length * swW + (this.shirtButtons.length - 1) * swGap;
    let sx = centerX - total / 2 + swW / 2;
    for (const sw of this.shirtButtons) {
      sw.container.setPosition(sx, y + 16);
      sw.bg.setSize(swW, 32);
      sw.glow.setSize(swW + 8, 38);
      sx += swW + swGap;
    }
    y += 52;

    const actionW = Math.min(contentW, 320);
    this.backButton.setSize(actionW * 0.4, btnH).setPosition(centerX - actionW * 0.3, y + btnH / 2);
    this.startButton.setSize(actionW * 0.6, btnH).setPosition(centerX + actionW * 0.2, y + btnH / 2);
    this.backButton.text.setFontSize(clamp(Math.round(this.height / 55), 7, 9));
    this.startButton.text.setFontSize(clamp(Math.round(this.height / 55), 7, 9));
  }
}
