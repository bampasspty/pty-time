import Phaser from 'phaser';
import { ensureTitleBackdrop } from '../ui/Backdrop.js';
import { PixelButton } from '../ui/PixelButton.js';
import { Modal } from '../ui/Modal.js';
import { clearSave, hasProgress, readSave } from '../systems/SaveSystem.js';
import { CSS, clamp, textStyle } from '../config.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.hasSave = hasProgress();
    ensureTitleBackdrop(this);
    this.add.image(0, 0, 'title-bg').setOrigin(0.5, 0.5).setName('bg');
    this.bg = this.children.getByName('bg');

    this.logo = this.add.image(0, 0, 'logo').setOrigin(0.5, 0.5);
    this.subtitle = this.add
      .text(0, 0, 'SAN MIGUELITO · PANAMÁ', textStyle(10, CSS.yellow, { stroke: '#0b1020', strokeThickness: 4 }))
      .setOrigin(0.5);
    this.tagline = this.add
      .text(0, 0, 'Calito, del barrio al apocalipsis', textStyle(8, CSS.soft, { stroke: '#0b1020', strokeThickness: 3 }))
      .setOrigin(0.5)
      .setAlign('center');
    this.footer = this.add
      .text(0, 0, 'v1.0 · HECHO EN PANAMÁ', textStyle(7, CSS.gray))
      .setOrigin(0.5);

    this.createBus();

    this.menu = [];
    if (this.hasSave) {
      this.menu.push(new PixelButton(this, { label: 'CONTINUAR', primary: true, onClick: () => this.continueGame() }));
      this.menu.push(new PixelButton(this, { label: 'NUEVA PARTIDA', onClick: () => this.confirmNewGame() }));
    } else {
      this.menu.push(new PixelButton(this, { label: 'JUGAR', primary: true, onClick: () => this.newGame() }));
    }
    this.menu.push(new PixelButton(this, { label: 'CÓMO JUGAR', onClick: () => this.showHelp() }));

    this.modal = new Modal(this);
    this.scale.on('resize', this.onResize, this);
    this.layout(this.scale.width, this.scale.height);
    this.cameras.main.fadeIn(320, 0, 0, 0);

    this.input.keyboard.on('keydown', this.onKeyDown, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
      this.input.keyboard.off('keydown', this.onKeyDown, this);
      this.modal?.destroy();
    });
  }

  createBus() {
    this.bus = this.add.container(0, 0).setDepth(100);
    const body = this.add.rectangle(0, 0, 74, 22, 0xda291c, 1).setStrokeStyle(2, 0x1b1b2b, 1);
    const roof = this.add.rectangle(0, -12, 64, 3, 0xf2c94c, 1);
    const stripe = this.add.rectangle(0, 3, 74, 4, 0xf2c94c, 1);
    const winColor = 0x9be7ff;
    const windows = [];
    for (let i = 0; i < 4; i++) {
      windows.push(this.add.rectangle(-27 + i * 18, -3, 12, 8, winColor, 0.92).setStrokeStyle(1, 0x1b1b2b, 1));
    }
    const wheel1 = this.add.circle(-22, 12, 5, 0x1b1b2b, 1);
    const wheel2 = this.add.circle(22, 12, 5, 0x1b1b2b, 1);
    const hub1 = this.add.circle(-22, 12, 2, 0x8d99ae, 1);
    const hub2 = this.add.circle(22, 12, 2, 0x8d99ae, 1);
    this.bus.add([roof, body, stripe, ...windows, wheel1, wheel2, hub1, hub2]);
    this.bus.setScale(2);
    this.busTween = this.tweens.add({
      targets: this.bus,
      x: { from: -120, to: this.scale.width + 120 },
      duration: 16000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  continueGame() {
    if (this.modal.isOpen) return;
    const save = readSave();
    this.scene.start('Game', { save });
  }

  newGame() {
    if (this.modal.isOpen) return;
    clearSave();
    this.scene.start('Character', { variant: readSave().playerVariant });
  }

  confirmNewGame() {
    if (this.modal.isOpen) return;
    this.modal.open({
      title: 'NUEVA PARTIDA',
      body: 'Se borrará el progreso guardado de esta demo. ¿Quieres empezar de cero?',
      buttons: [
        { label: 'CANCELAR', value: 'cancel' },
        { label: 'EMPEZAR', value: 'start', primary: true },
      ],
      dismissible: true,
      onButton: (value) => {
        if (value === 'start') {
          clearSave();
          this.scene.start('Character', { variant: 'm-blue' });
        }
      },
      onClose: () => this.layout(this.scale.width, this.scale.height),
    });
  }

  showHelp() {
    if (this.modal.isOpen) return;
    this.modal.open({
      title: 'CÓMO JUGAR',
      body: 'PTY Time es una demo de exploración ambientada en San Miguelito. Camina, saluda y ayuda a Doña Nena.',
      bullets: [
        'WASD o flechas: caminar.',
        'E, ESPACIO o botón HABLAR: conversar.',
        'En el teléfono: joystick y botones en pantalla.',
        'La estrella amarilla marca a quién buscar.',
        'El simulacro de terremoto es ficción, no una alerta real.',
      ],
      buttons: [{ label: 'CERRAR', primary: true }],
      dismissible: true,
      onClose: () => this.layout(this.scale.width, this.scale.height),
    });
  }

  onKeyDown(event) {
    if (this.modal.isOpen) {
      if (event.code === 'Escape') this.modal.close();
      return;
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      if (this.hasSave) this.continueGame();
      else this.newGame();
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
    const busY = height * 0.86;
    this.bus.setPosition(this.bus.x || -120, busY);
    if (this.busTween) {
      this.busTween.updateTo('x', width + 120, true);
    }

    const logoW = Math.min(width * 0.62, 440);
    this.logo.setDisplaySize(logoW, logoW / 3).setPosition(width / 2, height * 0.18);
    const subSize = clamp(Math.min(Math.round(height / 30), Math.floor((width * 0.92) / (23 * 0.95))), 8, 16);
    this.subtitle.setFontSize(subSize).setPosition(width / 2, height * 0.18 + logoW / 6 + 12);
    this.tagline
      .setFontSize(clamp(Math.round(height / 48), 7, 11))
      .setWordWrapWidth(width * 0.86, true)
      .setPosition(width / 2, this.subtitle.y + this.subtitle.height + 8);
    this.footer.setPosition(width / 2, height - 14);

    const btnW = Math.min(width * 0.62, 320);
    const btnH = clamp(Math.round(height * 0.052), 30, 44);
    const gap = clamp(Math.round(height * 0.018), 8, 14);
    const fontSize = clamp(Math.round(height / 46), 8, 12);
    let y = height * 0.52;
    for (const b of this.menu) {
      b.setSize(btnW, btnH);
      b.text.setFontSize(fontSize);
      b.setPosition(width / 2, y);
      y += btnH + gap;
    }
    if (this.modal?.isOpen) this.modal.layout(width, height);
  }
}
