import { COLORS, CSS, textStyle } from '../config.js';

// Botón rectangular pixelado reutilizable en menús.
export class PixelButton {
  constructor(scene, { x = 0, y = 0, width = 240, height = 36, label = '', primary = false, fontSize = 10, onClick = null } = {}) {
    this.scene = scene;
    this.primary = primary;
    this.enabled = true;
    this.container = scene.add.container(x, y);
    this.bg = scene.add
      .rectangle(0, 0, width, height, primary ? COLORS.yellow : 0x0b1020, primary ? 0.96 : 0.86)
      .setOrigin(0.5)
      .setStrokeStyle(2, primary ? COLORS.border : 0x46557a, 1)
      .setInteractive({ useHandCursor: true });
    this.text = scene.add.text(0, 0, label, textStyle(fontSize, primary ? CSS.ink : CSS.white)).setOrigin(0.5);
    this.container.add([this.bg, this.text]);
    this.container.setDepth(3200);
    this.width = width;
    this.height = height;

    this.bg.on('pointerover', () => {
      if (this.enabled) this.bg.setFillStyle(primary ? 0xffe18a : 0x1b2440, primary ? 1 : 0.92);
    });
    this.bg.on('pointerout', () => this.applyBaseStyle());
    this.bg.on('pointerdown', () => {
      if (!this.enabled) return;
      this.scene.tweens.add({ targets: this.container, scale: { from: 0.97, to: 1 }, duration: 80 });
      onClick?.();
    });
  }

  applyBaseStyle() {
    this.bg.setFillStyle(this.primary ? COLORS.yellow : 0x0b1020, this.primary ? 0.96 : 0.86);
    this.bg.setStrokeStyle(2, this.primary ? COLORS.border : 0x46557a, 1);
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
    return this;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.bg.setSize(width, height);
    return this;
  }

  setLabel(label) {
    this.text.setText(label);
    return this;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.45);
    return this;
  }

  destroy() {
    this.container.destroy(true);
  }
}
