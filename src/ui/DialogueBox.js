import Phaser from 'phaser';
import { COLORS, CSS, clamp, textStyle } from '../config.js';

// Caja de diálogo con retrato, efecto máquina de escribir y páginas.
export class DialogueBox {
  constructor(scene, { onClose } = {}) {
    this.scene = scene;
    this.onClose = onClose;
    this.lines = [];
    this.index = 0;
    this.typing = false;
    this.typeEvent = null;
    this.fullText = '';
    this.isOpen = false;
    this.action = null;
    this.npc = null;

    this.container = scene.add.container(0, 0).setDepth(5000).setVisible(false);

    this.bg = scene.add.rectangle(0, 0, 10, 10, 0x0b1020, 0.96).setOrigin(0, 0);
    this.border = scene.add
      .rectangle(0, 0, 10, 10, 0x000000, 0)
      .setOrigin(0, 0)
      .setStrokeStyle(2, COLORS.border, 1);
    this.inner = scene.add
      .rectangle(0, 0, 10, 10, 0x151b33, 0.5)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x2f3a5a, 1);

    this.portraitFrame = scene.add
      .rectangle(0, 0, 64, 64, 0x1b1b2b, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, COLORS.border, 1);
    this.portrait = scene.add.image(0, 0, 'portrait-nena').setOrigin(0.5, 0.5);

    this.nameBg = scene.add.rectangle(0, 0, 80, 16, COLORS.yellow, 1).setOrigin(0, 0);
    this.nameText = scene.add.text(0, 0, '', textStyle(8, CSS.ink)).setOrigin(0, 0.5);
    this.bodyText = scene.add.text(0, 0, '', textStyle(12, CSS.white)).setOrigin(0, 0);
    this.hintText = scene.add.text(0, 0, 'E', textStyle(8, CSS.yellow)).setOrigin(1, 1);
    this.arrow = scene.add.text(0, 0, '>', textStyle(10, CSS.yellow)).setOrigin(1, 1);

    this.container.add([
      this.bg,
      this.inner,
      this.border,
      this.portraitFrame,
      this.portrait,
      this.nameBg,
      this.nameText,
      this.bodyText,
      this.hintText,
      this.arrow,
    ]);

    this.tweens = scene.tweens.add({
      targets: this.arrow,
      alpha: { from: 0.25, to: 1 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  layout(width, height) {
    this.width = width;
    this.height = height;
    const panelW = Math.min(width - 16, 820);
    const panelH = clamp(Math.round(height * 0.3), 96, 162);
    const x = Math.round((width - panelW) / 2);
    const y = height - panelH - 10;
    this.panel = { x, y, w: panelW, h: panelH };

    this.bg.setPosition(x, y).setSize(panelW, panelH);
    this.inner.setPosition(x + 4, y + 4).setSize(panelW - 8, panelH - 8);
    this.border.setPosition(x, y).setSize(panelW, panelH);

    const portraitSize = Math.min(panelH - 22, 86);
    const px = x + 12;
    const py = y + 12;
    this.portraitFrame.setPosition(px, py).setSize(portraitSize, portraitSize);
    this.portrait.setDisplaySize(portraitSize - 6, portraitSize - 6).setPosition(px + portraitSize / 2, py + portraitSize / 2);

    const textX = px + portraitSize + 12;
    const nameSize = clamp(Math.round(portraitSize * 0.13), 8, 11);
    this.nameBg.setPosition(textX - 4, y + 8).setSize(Math.max(100, panelW - (textX - x) - 16), nameSize + 8);
    this.nameText.setStyle(textStyle(nameSize, CSS.ink)).setPosition(textX, y + 8 + (nameSize + 8) / 2);

    const bodySize = clamp(Math.round(panelH * 0.115), 10, 16);
    const wrapW = Math.max(160, panelW - (textX - x) - 18);
    this.bodyText
      .setStyle(textStyle(bodySize, CSS.white))
      .setPosition(textX, y + nameSize + 22)
      .setWordWrapWidth(wrapW, true);

    this.hintText.setStyle(textStyle(clamp(Math.round(panelH * 0.07), 7, 10), CSS.yellow)).setPosition(x + panelW - 12, y + panelH - 8);
    this.arrow.setStyle(textStyle(bodySize, CSS.yellow)).setPosition(x + panelW - 12, y + panelH - 9);
    this.hintText.setPosition(x + panelW - 38, y + panelH - 8);
  }

  open({ lines, action, npc, playerVariant }) {
    if (!lines || !lines.length) return;
    this.lines = lines;
    this.index = 0;
    this.action = action ?? null;
    this.npc = npc;
    this.isOpen = true;

    const portraitKey = npc?.portrait || 'portrait-player-m';
    if (this.scene.textures.exists(portraitKey)) {
      this.portrait.setTexture(portraitKey);
    } else if (this.scene.textures.exists(`portrait-player-${playerVariant?.[0] ?? 'm'}`)) {
      this.portrait.setTexture(`portrait-player-${playerVariant?.[0] ?? 'm'}`);
    }

    this.hintText.setText(this.scene.sys.game.device.input.touch ? 'TOCA' : 'E');
    this.container.setVisible(true);
    this.showPage();
    this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0.4, to: 1 },
      duration: 120,
      ease: 'Sine.easeOut',
    });
  }

  showPage() {
    const line = this.lines[this.index];
    if (!line) {
      this.close();
      return;
    }
    this.nameText.setText((line.speaker || this.npc?.name || 'Vecino').slice(0, 26));
    this.fullText = line.text ?? '';
    this.bodyText.setText('');
    this.hintText.setVisible(false);
    this.typing = true;
    let i = 0;
    this.typeEvent?.remove();
    this.typeEvent = this.scene.time.addEvent({
      delay: 17,
      loop: true,
      callback: () => {
        i += 1;
        this.bodyText.setText(this.fullText.slice(0, i));
        if (i >= this.fullText.length) {
          this.finishTyping();
        }
      },
    });
  }

  finishTyping() {
    this.typeEvent?.remove();
    this.typeEvent = null;
    this.typing = false;
    this.bodyText.setText(this.fullText);
    this.hintText.setVisible(true);
  }

  advance() {
    if (!this.isOpen) return;
    if (this.typing) {
      this.finishTyping();
      return;
    }
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.close();
      return;
    }
    this.showPage();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.typeEvent?.remove();
    this.typeEvent = null;
    this.container.setVisible(false);
    const action = this.action;
    this.action = null;
    this.onClose?.(action);
  }

  destroy() {
    this.typeEvent?.remove();
    this.tweens?.remove();
    this.container.destroy(true);
  }
}
