import Phaser from 'phaser';
import { COLORS, CSS, clamp, textStyle } from '../config.js';
import { events } from '../systems/EventBus.js';
import { inputState } from '../systems/InputState.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { Modal } from '../ui/Modal.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.hudState = this.registry.get('hud') ?? {
      missionTitle: 'El mandado de Doña Nena',
      objective: 'Habla con Doña Nena en la fonda.',
      coins: 0,
      drillUnlocked: false,
      drillCompleted: false,
    };
    this.promptState = { visible: false, label: '' };
    this.drillState = null;
    this.joystickPointer = null;
    this.toastTimer = null;
    this.toastQueue = [];
    this.isTouch = Boolean(this.sys.game.device.input.touch);
    try {
      this.isTouch = this.isTouch || window.matchMedia('(pointer: coarse)').matches;
    } catch {
      /* matchMedia no disponible */
    }

    this.createHud();
    this.createAreaBanner();
    this.createToast();
    this.createTouchControls();
    this.createDrillOverlay();

    this.dialogue = new DialogueBox(this, {
      onClose: (action) => {
        this.dialogue.visible = false;
        events.emit('dialogue:closed', { action });
        this.time.delayedCall(0, () => this.refreshControls());
      },
    });
    this.dialogue.visible = false;

    this.modal = new Modal(this);
    this.bindEvents();
    this.layout(this.scale.width, this.scale.height);
    this.scale.on('resize', this.onResize, this);
    this.events.once('shutdown', () => this.cleanup());
  }

  createHud() {
    this.hudContainer = this.add.container(0, 0).setDepth(1000);
    this.hudBg = this.add
      .rectangle(0, 0, 260, 52, 0x0b1020, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x31405f, 0.9);
    this.hudAccent = this.add.rectangle(0, 0, 3, 52, COLORS.yellow, 1).setOrigin(0, 0);
    this.hudLabel = this.add.text(0, 0, 'MISIÓN', textStyle(10, CSS.yellow)).setOrigin(0, 0);
    this.hudObjective = this.add.text(0, 0, '', textStyle(13, CSS.white)).setOrigin(0, 0);
    this.coinsText = this.add.text(0, 0, 'YAPA 0', textStyle(11, CSS.yellow)).setOrigin(1, 0).setDepth(1000);

    // Panel de combate dentro del mismo HUD: vida y munición.
    this.hpBarBg = this.add
      .rectangle(0, 0, 96, 9, 0x2a1420, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x46557a, 1);
    this.hpBarFill = this.add.rectangle(0, 0, 96, 9, COLORS.red, 1).setOrigin(0, 0);
    this.combatText = this.add.text(0, 0, 'LA 9 8/30', textStyle(8, CSS.soft)).setOrigin(0, 0);
    this.xpText = this.add.text(0, 0, 'NIVEL 1 · 0/80 XP', textStyle(8, CSS.yellow)).setOrigin(0, 0);
    this.survivalText = this.add.text(0, 0, 'HAMBRE 100 · RESIST 100', textStyle(8, CSS.soft)).setOrigin(0, 0);

    this.hudContainer.add([
      this.hudBg,
      this.hudAccent,
      this.hudLabel,
      this.hudObjective,
      this.hpBarBg,
      this.hpBarFill,
      this.combatText,
      this.xpText,
      this.survivalText,
    ]);
  }

  createAreaBanner() {
    this.areaContainer = this.add.container(0, 0).setDepth(4000).setAlpha(0);
    this.areaTitle = this.add
      .text(0, 0, '', textStyle(24, CSS.white, { stroke: '#1b1b2b', strokeThickness: 4 }))
      .setOrigin(0.5);
    this.areaSubtitle = this.add
      .text(0, 0, '', textStyle(9, CSS.yellow, { stroke: '#1b1b2b', strokeThickness: 3 }))
      .setOrigin(0.5);
    this.areaContainer.add([this.areaTitle, this.areaSubtitle]);
  }

  createToast() {
    this.toastContainer = this.add.container(0, 0).setDepth(6100).setVisible(false).setAlpha(0);
    this.toastBg = this.add
      .rectangle(0, 0, 240, 28, 0x0b1020, 0.94)
      .setOrigin(0.5)
      .setStrokeStyle(1, COLORS.yellow, 1);
    this.toastText = this.add.text(0, 0, '', textStyle(8, CSS.white)).setOrigin(0.5);
    this.toastContainer.add([this.toastBg, this.toastText]);
  }

  createTouchControls() {
    this.joyBase = this.add
      .circle(0, 0, 38, 0x0b1020, 0.34)
      .setStrokeStyle(2, 0xffffff, 0.28)
      .setDepth(2000);
    this.joyRing = this.add
      .circle(0, 0, 24, 0x000000, 0)
      .setStrokeStyle(1, COLORS.yellow, 0.25)
      .setDepth(2000);
    this.joyThumb = this.add
      .circle(0, 0, 13, COLORS.yellow, 0.62)
      .setStrokeStyle(2, 0x1b1b2b, 0.8)
      .setDepth(2001);
    this.joyBase.setVisible(false).setAlpha(0.5);
    this.joyRing.setVisible(false);
    this.joyThumb.setVisible(false);

    this.interactButton = this.createCircleButton(0, 0, 33, 'HABLAR', () => {
      events.emit('ui:interact');
    }, null, null, 9);
    this.crouchButton = this.createCircleButton(0, 0, 38, 'CUBRIRSE', null, () => {
      inputState.crouch = true;
      this.setCrouchPressed(true);
    }, () => {
      inputState.crouch = false;
      this.setCrouchPressed(false);
    }, 8);
    this.crouchButton.container.setVisible(false);

    this.helpButton = this.createTextButton(0, 0, 40, 32, '?', () => this.openHelp(), false, 11);
    this.drillButton = this.createTextButton(0, 0, 120, 32, 'SIMULACRO', () => events.emit('drill:request'), true, 7);
    this.drillButton.container.setVisible(false);

    this.fireButton = this.createCircleButton(0, 0, 31, 'FUEGO', () => {
      events.emit('ui:fire');
    }, null, null, 8);
    this.fireButton.container.setVisible(false);
    this.reloadButton = this.createCircleButton(0, 0, 19, 'R', () => {
      events.emit('ui:reload');
    }, null, null, 9);
    this.reloadButton.container.setVisible(false);
    this.weaponButton = this.createTextButton(0, 0, 60, 26, 'ARMA', () => events.emit('ui:weapon'), false, 7);
    this.weaponButton.container.setVisible(false);
    this.mochilaButton = this.createTextButton(0, 0, 78, 26, 'MOCHILA', () => events.emit('ui:inventory'), false, 7);
    this.mochilaButton.container.setVisible(false);
  }

  createCircleButton(x, y, radius, label, onClick, onDown, onUp, fontSize = 8) {
    const container = this.add.container(x, y).setDepth(3000).setVisible(false);
    const circle = this.add
      .circle(0, 0, radius, COLORS.yellow, 0.92)
      .setStrokeStyle(3, 0x1b1b2b, 0.9)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, textStyle(fontSize, CSS.ink)).setOrigin(0.5);
    const icon = this.add.image(0, -radius * 0.42, 'icon-talk').setDisplaySize(14, 14).setVisible(false);
    container.add([circle, icon, text]);
    if (onClick) {
      circle.on('pointerdown', () => {
        this.tweens.add({ targets: container, scale: { from: 0.92, to: 1 }, duration: 90 });
        onClick();
      });
    }
    if (onDown) circle.on('pointerdown', onDown);
    if (onUp) {
      circle.on('pointerup', onUp);
      circle.on('pointerout', onUp);
      circle.on('pointerupoutside', onUp);
    }
    return { container, circle, text, icon, radius, label };
  }

  createTextButton(x, y, w, h, label, onClick, accent = false, fontSize = 8) {
    const container = this.add.container(x, y).setDepth(3000);
    const bg = this.add
      .rectangle(0, 0, w, h, accent ? COLORS.yellow : 0x0b1020, accent ? 0.95 : 0.82)
      .setOrigin(0.5)
      .setStrokeStyle(1, accent ? 0x1b1b2b : 0x46557a, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(0, 0, label, textStyle(fontSize, accent ? CSS.ink : CSS.white))
      .setOrigin(0.5);
    const icon = this.add.image(-w / 2 + 14, 0, 'icon-quake').setDisplaySize(12, 12).setVisible(false);
    container.add([bg, icon, text]);
    bg.on('pointerover', () => bg.setFillStyle(accent ? 0xffe18a : 0x1b2440, 1));
    bg.on('pointerout', () => bg.setFillStyle(accent ? COLORS.yellow : 0x0b1020, accent ? 0.95 : 0.82));
    bg.on('pointerdown', onClick);
    return { container, bg, text, w, h };
  }

  createDrillOverlay() {
    this.drillContainer = this.add.container(0, 0).setDepth(6000).setVisible(false);
    this.drillBannerBg = this.add
      .rectangle(0, 0, 400, 22, COLORS.yellow, 0.96)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x1b1b2b, 1);
    this.drillBanner = this.add.text(0, 0, '', textStyle(7, CSS.ink)).setOrigin(0.5);
    this.drillPanel = this.add
      .rectangle(0, 0, 440, 88, 0x0b1020, 0.94)
      .setOrigin(0.5)
      .setStrokeStyle(1, COLORS.border, 1);
    this.drillTitle = this.add.text(0, 0, '', textStyle(11, CSS.yellow)).setOrigin(0.5, 0);
    this.drillDetail = this.add
      .text(0, 0, '', textStyle(8, CSS.white))
      .setOrigin(0.5, 0)
      .setAlign('center');
    this.drillProgressBg = this.add
      .rectangle(0, 0, 300, 8, 0x46557a, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x8d99ae, 1);
    this.drillProgress = this.add.rectangle(0, 0, 0, 8, COLORS.yellow, 1).setOrigin(0, 0.5);
    this.drillContainer.add([
      this.drillBannerBg,
      this.drillBanner,
      this.drillPanel,
      this.drillTitle,
      this.drillDetail,
      this.drillProgressBg,
      this.drillProgress,
    ]);
  }

  bindEvents() {
    this.onHudUpdate = (payload) => {
      this.hudState = payload;
      this.updateHud();
    };
    this.onToast = (text) => this.showToast(text);
    this.onPrompt = ({ visible, label }) => {
      this.promptState = { visible, label };
      this.refreshControls();
    };
    this.onDialogueOpen = (payload) => {
      this.dialogue.visible = true;
      this.dialogue.open(payload);
      this.refreshControls();
    };
    this.onAreaEnter = ({ title, subtitle }) => this.showAreaBanner(title, subtitle);
    this.onDrillIntro = (data) => this.openDrillIntro(data);
    this.onDrillState = (state) => this.updateDrill(state);
    this.onDrillEnd = (data) => this.showDrillResult(data);
    this.onMissionComplete = (data) => this.showMissionComplete(data);
    this.onHelp = () => this.openHelp();
    this.onBusy = () => this.refreshControls();
    this.onPlayerDown = () => this.showPlayerDown();
    this.onStoryRequest = (data) => this.showStory(data);
    this.onInventoryOpen = (data) => this.showInventory(data);
    this.onCraftOpen = (data) => this.showCrafting(data);
    this.onShopOpen = (data) => this.showShop(data);

    events.on('hud:update', this.onHudUpdate);
    events.on('hud:toast', this.onToast);
    events.on('prompt:update', this.onPrompt);
    events.on('dialogue:open', this.onDialogueOpen);
    events.on('area:enter', this.onAreaEnter);
    events.on('drill:intro', this.onDrillIntro);
    events.on('drill:state', this.onDrillState);
    events.on('drill:end', this.onDrillEnd);
    events.on('mission:complete', this.onMissionComplete);
    events.on('ui:help', this.onHelp);
    events.on('ui:busy', this.onBusy);
    events.on('player:down', this.onPlayerDown);
    events.on('story:request', this.onStoryRequest);
    events.on('inventory:open', this.onInventoryOpen);
    events.on('craft:open', this.onCraftOpen);
    events.on('shop:open', this.onShopOpen);

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointerupoutside', this.onPointerUp, this);

    this.input.keyboard.on('keydown', this.onKeyDown, this);
  }

  onKeyDown(event) {
    const code = event.code;
    if (this.modal.isOpen) {
      if (code === 'Escape' && this.modal.data?.dismissible) this.modal.close();
      return;
    }
    if (this.dialogue.isOpen) {
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') this.dialogue.advance();
      return;
    }
    if ((code === 'KeyI' || code === 'Tab') && !this.drillState?.active) {
      events.emit('ui:inventory');
      return;
    }
    if (code === 'KeyF' && !this.drillState?.active) {
      events.emit('ui:craft');
      return;
    }
    if (code === 'Escape') {
      if (!this.drillState?.active) this.openHelp();
      return;
    }
    if ((code === 'KeyE' || code === 'Space' || code === 'Enter') && !this.drillState?.active) {
      events.emit('ui:interact');
    }
  }

  onPointerDown(pointer) {
    if (this.modal.isOpen) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    // El joystick es sólo táctil: en computadora el clic izquierdo dispara.
    if (!this.isTouch && pointer.pointerType !== 'touch') return;
    if (pointer.x < this.scale.width * 0.5 && pointer.y > this.scale.height * 0.45) {
      this.startJoystick(pointer);
    }
  }

  startJoystick(pointer) {
    if (this.joystickPointer) return;
    this.joystickPointer = pointer.id;
    this.joyBase.setVisible(true).setAlpha(0.6);
    this.joyRing.setVisible(true);
    this.joyThumb.setVisible(true);
    this.updateJoystick(pointer);
    inputState.touchActive = true;
  }

  onPointerMove(pointer) {
    if (this.joystickPointer === pointer.id) this.updateJoystick(pointer);
  }

  onPointerUp(pointer) {
    if (this.joystickPointer !== pointer.id) return;
    this.joystickPointer = null;
    inputState.moveX = 0;
    inputState.moveY = 0;
    inputState.touchActive = false;
    this.joyThumb.setPosition(this.joyCenter.x, this.joyCenter.y);
    this.refreshControls();
  }

  updateJoystick(pointer) {
    if (!this.joyCenter) return;
    const dx = pointer.x - this.joyCenter.x;
    const dy = pointer.y - this.joyCenter.y;
    const dist = Math.hypot(dx, dy);
    const max = this.joyRadius;
    const clamped = Math.min(dist, max);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 0;
    this.joyThumb.setPosition(this.joyCenter.x + nx * clamped, this.joyCenter.y + ny * clamped);
    const dead = 6;
    if (dist < dead) {
      inputState.moveX = 0;
      inputState.moveY = 0;
    } else {
      const strength = Math.min(1, (dist - dead) / (max - dead));
      inputState.moveX = nx * strength;
      inputState.moveY = ny * strength;
    }
  }

  setCrouchPressed(pressed) {
    this.crouchButton.circle.setFillStyle(pressed ? 0xffe18a : COLORS.yellow, 0.95);
    this.crouchButton.container.setScale(pressed ? 1.06 : 1);
  }

  updateHud() {
    if (!this.hudObjective) return;
    const width = this.scale.width;
    const wrap = Math.min(360, Math.max(180, width * 0.55));
    this.hudLabel.setText('MISIÓN');
    this.hudObjective.setWordWrapWidth(wrap, true);
    this.hudObjective.setText(this.hudState?.objective ?? '');
    this.coinsText.setText(`YAPA ${this.hudState?.coins ?? 0} · ${this.hudState?.repLabel ?? 'DESCONOCIDO'}`);
    this.layoutHud();
    this.updateCombatHud();
  }

  updateCombatHud() {
    if (!this.hpBarFill) return;
    const hp = Number(this.hudState?.hp ?? 100);
    const maxHp = Math.max(1, Number(this.hudState?.maxHp ?? 100));
    const ratio = clamp(hp / maxHp, 0, 1);
    this.hpBarFill.setSize(Math.max(0, Math.round(this.hpBarBg.width * ratio)), 9);
    const color = ratio > 0.5 ? COLORS.green : ratio > 0.25 ? COLORS.yellow : COLORS.red;
    this.hpBarFill.setFillStyle(color, 1);

    const isMelee = this.hudState?.weaponType === 'melee';
    const ammo = isMelee
      ? 'CUERPO A CUERPO'
      : `${this.hudState?.ammo ?? 0}/${this.hudState?.reserve ?? 0}`;
    const label = this.hudState?.reloading ? 'RECARGANDO…' : ammo;
    this.combatText.setText(`${this.hudState?.weapon ?? 'LA 9'} · ${label}`);
    const level = this.hudState?.level ?? 1;
    const xp = this.hudState?.xp ?? 0;
    const xpNext = this.hudState?.xpNext ?? 80;
    this.xpText.setText(`NIVEL ${level} · ${xp}/${xpNext} XP`);
    const hunger = Math.round(Number(this.hudState?.hunger ?? 100));
    const stamina = Math.round(Number(this.hudState?.stamina ?? 100));
    this.survivalText.setText(`HAMBRE ${hunger} · RESIST ${stamina}`);
    this.survivalText.setColor(hunger <= 20 || stamina <= 20 ? CSS.red : CSS.soft);
  }

  layoutHud() {
    const H = this.height || this.scale.height;
    const W = this.width || this.scale.width;
    const labelSize = clamp(Math.round(H / 62), 8, 11);
    const objSize = clamp(Math.round(H / 50), 10, 15);
    this.hudLabel.setStyle(textStyle(labelSize, CSS.yellow));
    this.hudObjective.setStyle(textStyle(objSize, CSS.white));
    const wrap = Math.min(360, Math.max(160, W * (W < 520 ? 0.44 : 0.55)));
    this.hudObjective.setWordWrapWidth(wrap, true);

    this.hudLabel.setPosition(12, 8);
    this.hudObjective.setPosition(12, 8 + this.hudLabel.height + 6);
    const combatY = 8 + this.hudLabel.height + 6 + this.hudObjective.height + 8;

    this.combatText.setStyle(textStyle(clamp(Math.round(H / 60), 8, 11), CSS.soft));
    const maxHudW = W < 520 ? Math.max(170, W * 0.55) : 380;
    const w = Math.min(maxHudW, Math.max(170, Math.max(
      this.hudObjective.width + 28,
      this.combatText.width + 28,
      this.xpText.width + 28,
      this.survivalText.width + 28,
    )));
    const barW = Math.max(64, Math.min(96, w - 24));
    this.hpBarBg.setSize(barW, 9).setPosition(12, combatY);
    this.hpBarFill.setPosition(12, combatY);
    this.combatText.setPosition(12, combatY + 12);
    this.xpText.setStyle(textStyle(clamp(Math.round(H / 62), 7, 10), CSS.yellow));
    this.xpText.setPosition(12, combatY + 12 + this.combatText.height + 2);
    this.survivalText.setStyle(textStyle(clamp(Math.round(H / 62), 7, 10), CSS.soft));
    this.survivalText.setPosition(12, combatY + 12 + this.combatText.height + 2 + this.xpText.height + 2);

    const h = combatY + 12 + this.combatText.height + 2 + this.xpText.height + 2 + this.survivalText.height + 8;
    this.hudBg.setSize(w, h);
    this.hudAccent.setSize(3, h);
    this.hudContainer.setPosition(8, 8);
    this.coinsText.setStyle(textStyle(clamp(Math.round(H / 54), 9, 12), CSS.yellow));
  }

  showToast(text) {
    const H = this.height || this.scale.height;
    this.toastText.setStyle(textStyle(clamp(Math.round(H / 54), 9, 12), CSS.white));
    this.toastText.setText(text);
    const wrap = Math.min(this.scale.width - 60, 460);
    this.toastText.setWordWrapWidth(wrap, true);
    const w = Math.min(this.scale.width - 24, Math.max(200, this.toastText.width + 30));
    const h = this.toastText.height + 16;
    this.toastBg.setSize(w, h);
    this.toastBg.setPosition(0, 0);
    this.toastText.setPosition(0, 0);
    this.toastContainer.setPosition(this.scale.width / 2, this.toastY ?? 70);
    this.toastContainer.setVisible(true);
    this.tweens.killTweensOf(this.toastContainer);
    this.toastContainer.setAlpha(1);
    this.toastTimer?.remove();
    this.toastTimer = this.time.delayedCall(2700, () => {
      this.tweens.add({
        targets: this.toastContainer,
        alpha: 0,
        duration: 260,
        onComplete: () => this.toastContainer.setVisible(false),
      });
    });
  }

  showAreaBanner(title, subtitle) {
    this.areaTitle.setText(title.toUpperCase());
    this.areaSubtitle.setText((subtitle ?? '').toUpperCase());
    const maxW = this.scale.width * 0.82;
    const fit = Math.floor(maxW / Math.max(1, title.length * 1.15));
    this.areaTitle.setFontSize(clamp(Math.min(Math.round(this.scale.height / 17), fit), 12, 34));
    this.areaTitle.setPosition(this.scale.width / 2, this.scale.height * 0.32);
    this.areaSubtitle.setPosition(this.scale.width / 2, this.scale.height * 0.32 + this.areaTitle.height + 8);
    this.areaContainer.setAlpha(0);
    this.tweens.killTweensOf(this.areaContainer);
    this.tweens.add({ targets: this.areaContainer, alpha: 1, duration: 350, hold: 2400, yoyo: true });
  }

  refreshControls() {
    const busy = this.modal?.isOpen || this.dialogue?.isOpen || this.drillState?.active;
    const showInteract = this.promptState.visible && !busy;
    if (showInteract) {
      this.interactButton.label = this.promptState.label;
      this.interactButton.text.setText(this.promptState.label);
      this.interactButton.circle.setDisplaySize(62, 62);
      this.interactButton.container.setVisible(true);
      this.positionCircleButton(this.interactButton, this.scale.width - 58, this.scale.height - 58);
    } else {
      this.interactButton.container.setVisible(false);
    }

    const showJoystick = !busy && (this.isTouch || Boolean(this.joystickPointer));
    this.joyBase.setVisible(showJoystick);
    this.joyRing.setVisible(showJoystick);
    this.joyThumb.setVisible(showJoystick);
    if (showJoystick && !this.joystickPointer && this.joyCenter) {
      this.joyThumb.setPosition(this.joyCenter.x, this.joyCenter.y);
      this.joyBase.setAlpha(0.38);
    }
    if (!showJoystick && this.joystickPointer) {
      this.joystickPointer = null;
      inputState.moveX = 0;
      inputState.moveY = 0;
    }

    this.helpButton.container.setVisible(!busy);
    const showCombat = !busy && Boolean(this.isTouch);
    this.fireButton.container.setVisible(showCombat);
    this.reloadButton.container.setVisible(showCombat);
    this.weaponButton.container.setVisible(showCombat);
    this.mochilaButton.container.setVisible(showCombat);
    const showDrill = this.hudState?.drillUnlocked && !busy && !this.drillState?.active && !this.dialogue?.isOpen;
    this.drillButton.container.setVisible(Boolean(showDrill));
    this.crouchButton.container.setVisible(Boolean(this.drillState?.active && this.drillState?.showCrouch));
    this.hudContainer.setVisible(!this.drillState?.active && !this.modal?.isOpen);
    this.coinsText.setVisible(!this.drillState?.active && !this.modal?.isOpen);
  }

  positionCircleButton(btn, x, y) {
    btn.container.setPosition(x, y);
    btn.container.setDepth(3000);
  }

  openHelp() {
    if (this.modal.isOpen) return;
    this.modal.open({
      title: 'CÓMO JUGAR',
      body: 'Calito anda en San Miguelito. Camina, dispara y hazte respetar en el barrio.',
      bullets: [
        'WASD o flechas: caminar. En el teléfono usa el joystick.',
        'CLIC izquierdo o J: disparar. R: recargar. Q: cambiar de arma.',
        'I o TAB: abrir la mochila. En el tel\u00e9fono, bot\u00f3n MOCHILA.',
        'F: taller de fabricación. SHIFT: correr (gasta resistencia).',
        'E, ESPACIO o el botón HABLAR: conversar y avanzar diálogos.',
        'C o CUBRIRSE: agacharte y protegerte.',
        'Sigue la estrella amarilla para saber con quién hablar o dónde pelear.',
        'El botón SIMULACRO se desbloquea al terminar el mandado de Doña Nena.',
      ],
      disclaimer: 'El simulacro de terremoto es ficción dentro del juego. No es una alerta real.',
      buttons: [{ label: 'CERRAR', value: 'close', primary: true }],
      dismissible: true,
      onClose: () => this.refreshControls(),
    });
  }

  openDrillIntro(data) {
    if (this.modal.isOpen) return;
    this.modal.open({
      title: data.title.toUpperCase(),
      body: data.intro,
      bullets: [
        'Evento ficticio dentro del videojuego.',
        'Sin conexión a sistemas de monitoreo sísmico.',
        'Recomendaciones basadas en información de SINAPROC.',
      ],
      disclaimer: data.disclaimer,
      source: data.source,
      buttons: [
        { label: 'CANCELAR', value: 'cancel' },
        { label: 'COMENZAR', value: 'start', primary: true },
      ],
      dismissible: true,
      onButton: (value) => {
        if (value === 'start') events.emit('drill:start');
      },
      onClose: () => this.refreshControls(),
    });
  }

  updateDrill(state) {
    if (!state.active) {
      this.drillState = null;
      this.drillContainer.setVisible(false);
      this.crouchButton.container.setVisible(false);
      inputState.crouch = false;
      this.refreshControls();
      return;
    }
    this.drillState = state;
    this.drillContainer.setVisible(true);
    this.drillBanner.setText('SIMULACRO · EVENTO FICTICIO · NO ES UNA ALERTA REAL');
    this.drillTitle.setText(state.text);
    this.drillDetail.setText(state.detail ?? '');
    this.drillPanel.setSize(Math.min(this.scale.width - 24, 480), 100);
    this.drillBannerBg.setSize(Math.min(this.scale.width - 16, 560), 22);
    this.drillTitle.setFontSize(clamp(Math.round(this.scale.height / 38), 9, 13));
    this.drillDetail.setFontSize(clamp(Math.round(this.scale.height / 52), 7, 10));
    this.drillDetail.setWordWrapWidth(this.drillPanel.width - 28, true);
    this.drillBanner.setFontSize(clamp(Math.round(this.scale.height / 62), 6, 8));
    this.drillProgressBg.setSize(this.drillPanel.width - 34, 8);
    this.drillProgress.setSize((this.drillPanel.width - 34) * clamp(state.progress ?? 0, 0, 1), 8);
    this.layoutDrillOverlay();
    this.crouchButton.container.setVisible(Boolean(state.showCrouch));
    if (this.crouchButton.container.visible) {
      this.positionCircleButton(this.crouchButton, this.scale.width - 62, this.scale.height - 62);
      this.crouchButton.container.setDepth(6500);
    }
    this.refreshControls();
  }

  layoutDrillOverlay() {
    const w = this.scale.width;
    const bannerW = Math.min(w - 16, 560);
    const panelW = Math.min(w - 24, 480);
    const panelY = 62 + 50;
    this.drillBannerBg.setPosition(w / 2, 18).setSize(bannerW, 22);
    this.drillBanner.setPosition(w / 2, 18);
    this.drillPanel.setPosition(w / 2, panelY).setSize(panelW, 100);
    this.drillTitle.setPosition(w / 2, panelY - 40);
    this.drillDetail.setPosition(w / 2, panelY - 16);
    this.drillDetail.setWordWrapWidth(panelW - 30, true);
    this.drillProgressBg.setPosition(w / 2, panelY + 38).setSize(panelW - 34, 8);
    this.drillProgress.setPosition(w / 2 - (panelW - 34) / 2, panelY + 38);
    this.drillProgress.setSize((panelW - 34) * clamp(this.drillState?.progress ?? 0, 0, 1), 8);
  }

  // ------------------------------------------------------------- Slice B

  showStory({ id, pages }) {
    if (!Array.isArray(pages) || pages.length === 0) return;
    this.storyQueue = { id, pages: [...pages], index: 0 };
    this.showStoryPage();
  }

  showStoryPage() {
    const queue = this.storyQueue;
    if (!queue) return;
    if (queue.index >= queue.pages.length) {
      this.storyQueue = null;
      events.emit('story:finished', { id: queue.id });
      return;
    }
    const page = queue.pages[queue.index];
    const last = queue.index === queue.pages.length - 1;
    this.modal.open({
      title: page.title,
      body: page.body,
      bullets: page.bullets ?? [],
      disclaimer: page.disclaimer,
      buttons: [{ label: last ? 'ENTENDIDO' : 'SIGUIENTE', value: 'next', primary: true }],
      dismissible: false,
      onClose: () => {
        queue.index += 1;
        this.time.delayedCall(70, () => this.showStoryPage());
        this.refreshControls();
      },
    });
  }

  showInventory(data) {
    const items = Array.isArray(data.items) ? data.items : [];
    const bullets = items.length
      ? items.map((item) => item.name + ' x' + item.qty)
      : ['La mochila est\u00e1 vac\u00eda.'];
    const buttons = [];
    if (data.canHeal) buttons.push({ label: 'USAR VENDAJE', value: 'heal', primary: true });
    if (data.canAmmo) buttons.push({ label: 'ABRIR CAJA', value: 'ammo', primary: !data.canHeal });
    buttons.push({ label: 'FABRICAR', value: 'craft' });
    buttons.push({ label: 'CERRAR', value: 'close', primary: buttons.length === 0 });
    this.modal.open({
      title: 'MOCHILA ' + (data.size ?? 0) + '/' + (data.capacity ?? 12),
      bullets,
      buttons,
      dismissible: true,
      onButton: (value) => {
        if (value === 'heal') events.emit('ui:use-item', { id: 'vendaje' });
        if (value === 'ammo') events.emit('ui:use-item', { id: 'balas9' });
        if (value === 'craft') events.emit('ui:craft');
      },
      onClose: () => this.refreshControls(),
    });
  }

  showCrafting(data) {
    const recipes = Array.isArray(data.recipes) ? data.recipes : [];
    const bullets = recipes.map((recipe) => {
      const parts = recipe.inputs.map((input) => input.name + ' ' + input.have + '/' + input.qty).join(' + ');
      return (recipe.canCraft ? '> ' : '- ') + recipe.name + ': ' + parts;
    });
    if (!bullets.length) bullets.push('No hay recetas.');
    const craftable = recipes.filter((recipe) => recipe.canCraft).slice(0, 3);
    const buttons = craftable.map((recipe) => ({ label: recipe.name, value: recipe.id, primary: true }));
    buttons.push({ label: 'CERRAR', value: 'close', primary: buttons.length === 0 });
    this.modal.open({
      title: 'TALLER ' + (data.size ?? 0) + '/' + (data.capacity ?? 12),
      bullets,
      buttons,
      dismissible: true,
      onButton: (value) => {
        if (value !== 'close') events.emit('craft:item', { id: value });
      },
      onClose: () => this.refreshControls(),
    });
  }

  showShop(data) {
    const items = Array.isArray(data.items) ? data.items : [];
    const bullets = items.map((item) => item.name + ' · ' + item.price + ' yapa');
    bullets.push('Yapa: ' + (data.coins ?? 0));
    const discount = Math.round((data.discount ?? 0) * 100);
    if (discount > 0) bullets.push('Descuento por reputación: ' + discount + '%');
    const buttons = items.slice(0, 4).map((item) => ({ label: item.name + ' ' + item.price, value: item.id }));
    buttons.push({ label: 'CERRAR', value: 'close', primary: true });
    this.modal.open({
      title: 'MINISÚPER EL CHEN',
      bullets,
      buttons,
      dismissible: true,
      onButton: (value) => {
        if (value !== 'close') events.emit('shop:buy', { id: value });
      },
      onClose: () => this.refreshControls(),
    });
  }

  showMissionComplete(data) {
    const reward = data.reward?.coins ?? 0;
    const bullets = Array.isArray(data.bullets) && data.bullets.length
      ? [...data.bullets]
      : [`+${reward} de yapa`, 'El barrio te lo agradece'];
    if (data.drillUnlocked) bullets.push('Simulacro de terremoto disponible');
    this.modal.open({
      title: '¡MISIÓN COMPLETADA!',
      body: data.body ?? 'Terminaste el trabajo y el barrio lo notó.',
      bullets,
      buttons: [{ label: 'SEGUIR', value: 'ok', primary: true }],
      onClose: () => this.refreshControls(),
    });
  }

  showPlayerDown() {
    if (this.modal.isOpen) return;
    this.modal.open({
      title: 'TE TUMBARON',
      body: 'Los matones del barrio te dejaron en el suelo. Pero esto no se acaba aquí.',
      bullets: [
        'Reapareces en el punto de partida con la vida completa.',
        'La munición que te quedaba se mantiene.',
      ],
      buttons: [{ label: 'REAPARECER', value: 'ok', primary: true }],
      dismissible: false,
      onClose: () => {
        events.emit('player:respawn');
        this.refreshControls();
      },
    });
  }

  showDrillResult(data) {
    this.modal.open({
      title: data.success ? '¡BIEN HECHO!' : 'SIMULACRO TERMINADO',
      body: data.message,
      bullets: data.steps ?? [],
      disclaimer: data.disclaimer,
      source: [data.after, data.source].filter(Boolean).join('\n'),
      buttons: [{ label: 'ENTENDIDO', value: 'ok', primary: true }],
      onClose: () => this.refreshControls(),
    });
  }

  onResize(gameSize) {
    this.layout(gameSize.width, gameSize.height);
  }

  layout(width, height) {
    this.width = width;
    this.height = height;
    this.joyCenter = { x: 74, y: height - 74 };
    this.joyRadius = 34;
    this.joyBase.setPosition(this.joyCenter.x, this.joyCenter.y);
    this.joyRing.setPosition(this.joyCenter.x, this.joyCenter.y);
    this.joyThumb.setPosition(this.joyCenter.x, this.joyCenter.y);
    this.positionCircleButton(this.interactButton, width - 58, height - 58);
    this.positionCircleButton(this.crouchButton, width - 62, height - 62);
    this.positionCircleButton(this.fireButton, width - 58, height - 138);
    this.positionCircleButton(this.reloadButton, width - 126, height - 104);
    this.weaponButton.container.setPosition(width - 130, height - 168);
    this.mochilaButton.container.setPosition(width - 196, height - 168);
    this.helpButton.container.setPosition(width - 30, 30);
    this.drillButton.container.setPosition(width - 70, 72);
    this.coinsText.setPosition(width - 62, 24);
    this.coinsText.setStyle(textStyle(clamp(Math.round(height / 54), 9, 12), CSS.yellow));
    this.toastY = Math.round(height * 0.17);
    if (this.toastContainer.visible) this.toastContainer.setPosition(width / 2, this.toastY);
    this.layoutHud();
    this.areaTitle.setPosition(width / 2, height * 0.32);
    this.areaSubtitle.setPosition(width / 2, height * 0.32 + this.areaTitle.height + 8);
    this.dialogue.layout(width, height);
    if (this.modal.isOpen) this.modal.layout(width, height);
    this.layoutDrillOverlay();
    this.refreshControls();
  }

  cleanup() {
    this.scale.off('resize', this.onResize, this);
    events.off('hud:update', this.onHudUpdate);
    events.off('hud:toast', this.onToast);
    events.off('prompt:update', this.onPrompt);
    events.off('dialogue:open', this.onDialogueOpen);
    events.off('area:enter', this.onAreaEnter);
    events.off('drill:intro', this.onDrillIntro);
    events.off('drill:state', this.onDrillState);
    events.off('drill:end', this.onDrillEnd);
    events.off('mission:complete', this.onMissionComplete);
    events.off('ui:help', this.onHelp);
    events.off('ui:busy', this.onBusy);
    events.off('player:down', this.onPlayerDown);
    events.off('story:request', this.onStoryRequest);
    events.off('inventory:open', this.onInventoryOpen);
    events.off('craft:open', this.onCraftOpen);
    events.off('shop:open', this.onShopOpen);
    this.dialogue?.destroy();
    this.modal?.destroy();
  }
}
