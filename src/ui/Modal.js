import Phaser from 'phaser';
import { COLORS, CSS, clamp, textStyle } from '../config.js';
import { events } from '../systems/EventBus.js';

// Modal reutilizable: intro del simulacro, ayuda, recompensa y resultado.
export class Modal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.buttons = [];
    this.data = null;

    this.container = scene.add.container(0, 0).setDepth(10000).setVisible(false);
    this.overlay = scene.add
      .rectangle(0, 0, 10, 10, 0x050912, 0.76)
      .setOrigin(0, 0)
      .setInteractive();
    this.panel = scene.add
      .rectangle(0, 0, 10, 10, 0x0b1020, 0.98)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, COLORS.border, 1);
    this.accent = scene.add.rectangle(0, 0, 10, 4, COLORS.yellow, 1).setOrigin(0.5, 0);
    this.title = scene.add.text(0, 0, '', textStyle(14, CSS.yellow)).setOrigin(0.5, 0);
    this.body = scene.add.text(0, 0, '', textStyle(10, CSS.soft)).setOrigin(0.5, 0).setAlign('center');
    this.bullets = scene.add.text(0, 0, '', textStyle(9, CSS.white)).setOrigin(0, 0).setAlign('left');
    this.disclaimerBox = scene.add
      .rectangle(0, 0, 10, 10, 0x2a1c0a, 1)
      .setOrigin(0.5, 0)
      .setStrokeStyle(1, COLORS.yellow, 0.8);
    this.disclaimer = scene.add.text(0, 0, '', textStyle(8, CSS.yellow)).setOrigin(0.5, 0).setAlign('center');
    this.source = scene.add.text(0, 0, '', textStyle(7, CSS.gray)).setOrigin(0.5, 0).setAlign('center');

    this.container.add([
      this.overlay,
      this.panel,
      this.accent,
      this.title,
      this.body,
      this.bullets,
      this.disclaimerBox,
      this.disclaimer,
      this.source,
    ]);
  }

  open(data) {
    if (this.isOpen) this.close(false);
    this.data = data;
    this.isOpen = true;
    this.container.setVisible(true).setAlpha(0);
    this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 140 });

    this.title.setText(data.title ?? '');
    this.body.setText(data.body ?? '');
    this.bullets.setText((data.bullets ?? []).map((b) => `> ${b}`).join('\n'));
    this.disclaimer.setText(data.disclaimer ?? '');
    this.source.setText(data.source ?? '');

    this.buildButtons(data.buttons ?? [{ label: 'CERRAR', value: 'close' }]);
    this.layout(this.scene.scale.width, this.scene.scale.height);
    events.emit('ui:busy', { open: true });
  }

  buildButtons(buttons) {
    for (const b of this.buttons) b.container.destroy();
    this.buttons = [];
    const palette = [COLORS.yellow, 0x2f3a5a, 0x2f3a5a];
    for (let i = 0; i < buttons.length; i++) {
      const spec = buttons[i];
      const container = this.scene.add.container(0, 0);
      const bg = this.scene.add
        .rectangle(0, 0, 120, 30, spec.primary ? COLORS.yellow : 0x1b2440, 1)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(2, spec.primary ? COLORS.border : 0x46557a, 1)
        .setInteractive({ useHandCursor: true });
      const label = this.scene.add
        .text(0, 0, spec.label, textStyle(9, spec.primary ? CSS.ink : CSS.white))
        .setOrigin(0.5, 0.5);
      container.add([bg, label]);
      const index = i;
      bg.on('pointerover', () => bg.setFillStyle(spec.primary ? 0xffe18a : 0x26324f));
      bg.on('pointerout', () => bg.setFillStyle(spec.primary ? COLORS.yellow : 0x1b2440));
      bg.on('pointerdown', (_pointer, _x, _y, event) => {
        event?.stopPropagation?.();
        this.handleButton(index);
      });
      this.buttons.push({ container, bg, label, spec, color: palette[i] ?? 0x2f3a5a });
      this.container.add(container);
    }
  }

  handleButton(index) {
    const button = this.buttons[index];
    if (!button) return;
    const data = this.data;
    const spec = button.spec;
    const shouldClose = spec.close !== false;
    if (shouldClose) this.close(true);
    spec.onClick?.();
    data?.onButton?.(spec.value ?? button.spec.label, spec);
  }

  layout(width, height) {
    this.width = width;
    this.height = height;
    const panelW = Math.min(width - 20, 660);
    this.overlay.setSize(width, height);

    const titleSize = clamp(Math.round(height / 30), 12, 20);
    const bodySize = clamp(Math.round(height / 46), 9, 13);
    const bulletSize = clamp(Math.round(height / 48), 9, 12);
    const pad = clamp(Math.round(panelW * 0.06), 14, 26);
    const wrapW = panelW - pad * 2;

    this.title.setStyle(textStyle(titleSize, CSS.yellow)).setWordWrapWidth(wrapW, true);
    this.body.setStyle(textStyle(bodySize, CSS.soft)).setWordWrapWidth(wrapW, true);
    this.bullets.setStyle(textStyle(bulletSize, CSS.white)).setWordWrapWidth(wrapW, true);
    this.disclaimer.setStyle(textStyle(clamp(bodySize - 1, 8, 12), CSS.yellow)).setWordWrapWidth(wrapW, true);
    this.source.setStyle(textStyle(clamp(bodySize - 2, 7, 10), CSS.gray)).setWordWrapWidth(wrapW, true);

    const buttonH = 34;
    const buttonRowH = this.buttons.length ? buttonH + 14 : 0;
    let contentH = 18 + this.title.height + 10;
    if (this.body.text) contentH += this.body.height + 10;
    if (this.bullets.text) contentH += this.bullets.height + 10;
    if (this.disclaimer.text) contentH += this.disclaimer.height + 18;
    if (this.source.text) contentH += this.source.height + 4;
    contentH += buttonRowH + pad;
    const panelH = Math.min(height - 16, Math.max(150, contentH + pad));
    const panelX = width / 2;
    const panelY = height / 2;

    this.panel.setPosition(panelX, panelY).setSize(panelW, panelH);
    this.accent.setPosition(panelX, panelY - panelH / 2).setSize(panelW, 4);

    let y = panelY - panelH / 2 + 18;
    this.title.setPosition(panelX, y);
    y += this.title.height + 10;
    if (this.body.text) {
      this.body.setPosition(panelX, y);
      y += this.body.height + 10;
    }
    if (this.bullets.text) {
      this.bullets.setPosition(panelX - wrapW / 2, y);
      y += this.bullets.height + 10;
    }
    this.disclaimerBox.setVisible(Boolean(this.disclaimer.text));
    if (this.disclaimer.text) {
      const boxH = this.disclaimer.height + 12;
      this.disclaimerBox.setPosition(panelX, y).setSize(wrapW + 4, boxH).setVisible(true);
      this.disclaimer.setPosition(panelX, y + 6);
      y += boxH + 6;
    } else {
      this.disclaimerBox.setVisible(false);
    }
    if (this.source.text) {
      this.source.setPosition(panelX, y);
      y += this.source.height + 4;
    }

    const n = this.buttons.length;
    if (n) {
      const gap = 10;
      const bw = Math.min(200, (panelW - pad * 2 - gap * (n - 1)) / Math.max(1, n));
      const totalW = bw * n + gap * (n - 1);
      let bx = panelX - totalW / 2 + bw / 2;
      const by = panelY + panelH / 2 - pad - buttonH / 2;
      const btnFont = clamp(Math.round(height / 52), 9, 13);
      for (const b of this.buttons) {
        b.container.setPosition(bx, by);
        b.bg.setSize(bw, buttonH);
        b.label
          .setStyle(textStyle(btnFont, b.spec.primary ? CSS.ink : CSS.white))
          .setWordWrapWidth(bw - 12, false);
        bx += bw + gap;
      }
    }
  }

  close(emitBusy = true) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);
    const data = this.data;
    this.data = null;
    if (emitBusy) events.emit('ui:busy', { open: false });
    data?.onClose?.();
  }

  destroy() {
    this.container.destroy(true);
  }
}
