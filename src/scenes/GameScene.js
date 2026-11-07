import Phaser from 'phaser';
import { SAN_MIGUELITO } from '../world/sanMiguelito.js';
import { NPCS } from '../data/npcs.js';
import { getDialogue } from '../data/dialogues.js';
import { MISSION } from '../data/missions.js';
import { EARTHQUAKE } from '../data/earthquake.js';
import { events } from '../systems/EventBus.js';
import { inputState } from '../systems/InputState.js';
import { MissionSystem } from '../systems/MissionSystem.js';
import { readSave, sanitizeSave, writeSave } from '../systems/SaveSystem.js';
import { QuakeDrill } from '../systems/QuakeDrill.js';
import { MapBuilder } from '../world/MapBuilder.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { cameraZoom, clamp, CSS, textStyle, COLORS } from '../config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    const raw = data?.save ?? readSave();
    this.save = sanitizeSave(raw);
    this.variant = data?.variant && /^[mf]-(red|blue|yellow|green)$/.test(data.variant)
      ? data.variant
      : this.save.playerVariant;
    this.mission = new MissionSystem(this.save);
    this.wasStarted = Boolean(this.save.started);
    this.dialogueOpen = false;
    this.modalOpen = false;
    this.dialogueNpc = null;
    this.focus = null;
    this.lastPromptKey = '';
    this.drill = null;
    this.questMarker = null;
  }

  create() {
    this.scale.on('resize', this.handleResize, this);
    this.physics.world.setBounds(0, 0, SAN_MIGUELITO.width * 16, SAN_MIGUELITO.height * 16);
    this.cameras.main.setBackgroundColor('#5fa85f');

    this.mapBuilder = new MapBuilder(this, SAN_MIGUELITO);
    const built = this.mapBuilder.build();
    this.zones = built.zones;

    this.player = new Player(this, SAN_MIGUELITO.spawn.x, SAN_MIGUELITO.spawn.y, this.variant);
    this.player.setDepth(this.player.y);
    this.playerShadow = this.add
      .ellipse(this.player.x, this.player.y - 1, 12, 5, 0x1b1b2b, 0.25)
      .setDepth(this.player.y - 1);

    this.physics.add.collider(this.player, built.staticGroup);

    this.npcs = [];
    this.npcSprites = [];
    for (const spawn of built.npcSpawns) {
      const def = NPCS[spawn.id];
      if (!def) {
        console.warn('[Game] NPC sin datos:', spawn.id);
        continue;
      }
      const npc = new NPC(this, def, spawn);
      this.npcs.push(npc);
      this.npcSprites.push(npc);
    }
    if (this.npcSprites.length) {
      this.physics.add.collider(this.player, this.npcSprites);
      this.physics.add.collider(this.npcSprites, built.staticGroup);
    }

    this.items = built.items;
    this.updateItemVisibility();
    this.createQuestMarker();
    this.createPrompt();

    this.setupCamera();
    this.setupInput();

    this.registry.set('playerVariant', this.variant);
    this.registry.set('hud', {
      missionTitle: this.mission.title,
      objective: this.mission.getObjective(),
      coins: this.mission.coins,
      drillUnlocked: this.mission.drillUnlocked,
      drillCompleted: this.mission.drillCompleted,
      step: this.mission.step,
      missionCompleted: this.mission.completed,
    });
    this.scene.launch('UI');
    this.emitHud();
    this.time.delayedCall(300, () => this.emitHud());
    this.time.delayedCall(750, () => {
      events.emit('area:enter', { title: SAN_MIGUELITO.title, subtitle: SAN_MIGUELITO.subtitle });
    });

    this.bindEvents();
    this.persist();
    events.emit('game:ready', { missionTitle: this.mission.title });

    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  setupCamera() {
    const cam = this.cameras.main;
    const width = SAN_MIGUELITO.width * 16;
    const height = SAN_MIGUELITO.height * 16;
    cam.setBounds(0, 0, width, height);
    cam.setRoundPixels(true);
    cam.setZoom(cameraZoom(this.scale.width, this.scale.height));
    cam.startFollow(this.player, true, 0.13, 0.13);
    cam.setDeadzone(24, 18);
  }

  handleResize(gameSize) {
    if (!this.cameras?.main) return;
    const width = gameSize?.width ?? this.scale.width;
    const height = gameSize?.height ?? this.scale.height;
    this.cameras.main.setZoom(cameraZoom(width, height));
  }

  setupInput() {
    const Keyboard = Phaser.Input.Keyboard;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Keyboard.KeyCodes.W,
      down: Keyboard.KeyCodes.S,
      left: Keyboard.KeyCodes.A,
      right: Keyboard.KeyCodes.D,
      interact: Keyboard.KeyCodes.E,
      interactAlt: Keyboard.KeyCodes.SPACE,
      interactEnter: Keyboard.KeyCodes.ENTER,
      crouch: Keyboard.KeyCodes.C,
      help: Keyboard.KeyCodes.ESC,
    });
    this.input.keyboard.addCapture([
      Keyboard.KeyCodes.UP,
      Keyboard.KeyCodes.DOWN,
      Keyboard.KeyCodes.LEFT,
      Keyboard.KeyCodes.RIGHT,
      Keyboard.KeyCodes.SPACE,
    ]);
  }

  bindEvents() {
    this.onUiInteract = () => this.tryInteract();
    this.onUiBusy = ({ open }) => {
      this.modalOpen = Boolean(open);
      if (open) {
        this.player.setVelocity(0, 0);
        this.hidePrompt();
      }
    };
    this.onDialogueClosed = ({ action } = {}) => {
      this.dialogueOpen = false;
      this.dialogueNpc?.stopTalking();
      this.dialogueNpc = null;
      if (action) this.handleMissionAction(action);
      this.updateItemVisibility();
      this.updateQuestMarker();
    };
    this.onDrillRequest = () => this.requestDrill();
    this.onDrillStart = () => this.startDrill();

    events.on('ui:interact', this.onUiInteract);
    events.on('ui:busy', this.onUiBusy);
    events.on('dialogue:closed', this.onDialogueClosed);
    events.on('drill:request', this.onDrillRequest);
    events.on('drill:start', this.onDrillStart);
    events.on('ui:help', this.onUiHelp);

    this.onPageHide = () => this.persist();
    window.addEventListener('pagehide', this.onPageHide);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      events.off('ui:interact', this.onUiInteract);
      events.off('ui:busy', this.onUiBusy);
      events.off('dialogue:closed', this.onDialogueClosed);
      events.off('drill:request', this.onDrillRequest);
      events.off('drill:start', this.onDrillStart);
      events.off('ui:help', this.onUiHelp);
      window.removeEventListener('pagehide', this.onPageHide);
      this.drill?.stop();
      this.mapBuilder?.destroy();
    });
  }

  update(time, delta) {
    if (!this.player) return;

    const locked = this.dialogueOpen || this.modalOpen;
    const crouch = !locked && (this.keys.crouch.isDown || inputState.crouch);
    this.player.setCrouching(crouch);
    this.player.updateMovement(delta, locked ? { x: 0, y: 0 } : this.readMovement(), locked);

    this.playerShadow.setPosition(this.player.x, this.player.y - 1).setDepth(this.player.y - 1);

    for (const npc of this.npcs) npc.update(time, delta, this.player);
    if (this.drill) this.drill.update(time, delta);

    this.updateFocus();
    this.syncPromptPosition();
  }

  readMovement() {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.keys.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) y += 1;
    x += inputState.moveX;
    y += inputState.moveY;
    x = clamp(x, -1, 1);
    y = clamp(y, -1, 1);
    return { x, y };
  }

  createPrompt() {
    this.promptBg = this.add
      .rectangle(0, 0, 62, 15, 0x0b1020, 0.94)
      .setStrokeStyle(1, COLORS.border, 1)
      .setOrigin(0.5);
    this.promptText = this.add
      .text(0, 0, 'HABLAR', textStyle(7, CSS.yellow))
      .setOrigin(0.5);
    this.prompt = this.add
      .container(0, 0, [this.promptBg, this.promptText])
      .setDepth(20000)
      .setVisible(false);
  }

  updateFocus() {
    const blocked = this.dialogueOpen || this.modalOpen || this.drill?.active;
    if (blocked) {
      this.focus = null;
      this.hidePrompt();
      this.emitPromptState(false, '');
      return;
    }

    let best = null;
    let bestDist = Infinity;

    for (const npc of this.npcs) {
      const d = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
      if (d < 38 && d < bestDist) {
        best = { type: 'npc', npc, label: 'HABLAR', y: npc.y - 30 };
        bestDist = d;
      }
    }

    if (this.mission.canPickupChancla()) {
      for (const item of this.items) {
        if (item.id !== 'chancla' || !item.sprite?.visible) continue;
        const d = Math.hypot(item.x - this.player.x, item.y - this.player.y);
        if (d < 28 && d < bestDist) {
          best = { type: 'item', item, label: 'RECOGER', y: item.y - 16 };
          bestDist = d;
        }
      }
    }

    this.focus = best;
    if (best) {
      this.promptText.setText(best.label);
      this.promptBg.width = Math.max(54, this.promptText.width + 12);
      this.prompt.setPosition(best.type === 'npc' ? best.npc.x : best.item.x, best.y);
      this.prompt.setVisible(true);
      this.emitPromptState(true, best.label);
    } else {
      this.hidePrompt();
      this.emitPromptState(false, '');
    }
  }

  syncPromptPosition() {
    if (!this.prompt?.visible) return;
    if (this.focus?.type === 'npc') {
      this.prompt.setPosition(this.focus.npc.x, this.focus.npc.y - 30);
    } else if (this.focus?.type === 'item') {
      this.prompt.setPosition(this.focus.item.x, this.focus.item.y - 16);
    }
    this.prompt.setDepth(20000);
  }

  emitPromptState(visible, label) {
    const key = `${visible}:${label}`;
    if (key === this.lastPromptKey) return;
    this.lastPromptKey = key;
    events.emit('prompt:update', { visible, label });
  }

  hidePrompt() {
    this.prompt?.setVisible(false);
  }

  tryInteract() {
    if (this.dialogueOpen || this.modalOpen || this.drill?.active) return;
    if (!this.focus) return;
    if (this.focus.type === 'npc') this.openDialogue(this.focus.npc);
    else if (this.focus.type === 'item') this.pickupChancla(this.focus.item);
  }

  openDialogue(npc) {
    const data = getDialogue(npc.npcId, this.mission.getDialogueContext());
    if (!data || !Array.isArray(data.lines) || data.lines.length === 0) return;

    this.dialogueOpen = true;
    this.dialogueNpc = npc;
    npc.talking = true;
    this.player.setVelocity(0, 0);
    this.player.playIdle();
    this.hidePrompt();
    this.emitPromptState(false, '');

    events.emit('dialogue:open', {
      lines: data.lines,
      action: data.action ?? null,
      npc: {
        id: npc.npcId,
        name: npc.displayName,
        role: npc.role,
        portrait: NPCS[npc.npcId]?.portrait ?? `portrait-${npc.npcId}`,
      },
      playerVariant: this.variant,
    });
  }

  pickupChancla(item) {
    if (!this.mission.collectChancla()) return;
    item.sprite?.destroy();
    item.glow?.destroy();
    item.sprite = null;
    item.glow = null;
    this.focus = null;
    this.hidePrompt();
    this.lastPromptKey = '';
    this.emitPromptState(false, '');
    this.updateQuestMarker();
    this.persist();
    this.emitHud();
    events.emit('hud:toast', 'Recogiste la chancleta de Pipe. Llévasela.');
  }

  handleMissionAction(action) {
    const result = this.mission.applyAction(action);
    if (!result.changed) return;
    this.persist();
    this.updateItemVisibility();
    this.updateQuestMarker();
    this.emitHud();
    if (result.toast) events.emit('hud:toast', result.toast);

    if (result.kind === 'finish') {
      events.emit('mission:complete', {
        title: MISSION.title,
        objective: result.objective,
        reward: result.reward,
        drillUnlocked: this.mission.drillUnlocked,
      });
    }
  }

  updateItemVisibility() {
    for (const item of this.items) {
      const visible = item.id === 'chancla' && this.mission.canPickupChancla() && Boolean(item.sprite);
      item.sprite?.setVisible(visible);
      item.glow?.setVisible(visible);
    }
  }

  createQuestMarker() {
    this.questMarker = this.add
      .image(0, 0, 'icon-star')
      .setDepth(21000)
      .setScale(1.2)
      .setVisible(false);
    this.tweens.add({
      targets: this.questMarker,
      y: '-=4',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  updateQuestMarker() {
    if (!this.questMarker) return;
    let target = null;
    if (this.mission.step === 'inactive') target = this.npcs.find((n) => n.npcId === 'nena');
    else if (this.mission.step === 'find-pipe') target = this.npcs.find((n) => n.npcId === 'pipe');
    else if (this.mission.step === 'return-pipe') target = this.npcs.find((n) => n.npcId === 'pipe');
    else if (this.mission.step === 'report-nena') target = this.npcs.find((n) => n.npcId === 'nena');

    if (!target) {
      this.questMarker.setVisible(false);
      return;
    }
    this.questMarker.setVisible(true);
    this.questMarker.setPosition(target.x, target.y - 42);
    this.questMarker.setDepth(target.y + 10000);
  }

  emitHud() {
    const payload = {
      missionTitle: this.mission.title,
      objective: this.mission.getObjective(),
      coins: this.mission.coins,
      drillUnlocked: this.mission.drillUnlocked,
      drillCompleted: this.mission.drillCompleted,
      step: this.mission.step,
      missionCompleted: this.mission.completed,
    };
    this.registry.set('hud', payload);
    events.emit('hud:update', payload);
  }

  persist() {
    const save = {
      ...this.save,
      ...this.mission.toSave(),
      playerVariant: this.variant,
      started: true,
    };
    this.save = sanitizeSave(save);
    writeSave(this.save);
  }

  requestDrill() {
    if (!this.mission.drillUnlocked || this.dialogueOpen || this.drill || this.modalOpen) return;
    events.emit('drill:intro', {
      title: EARTHQUAKE.title,
      disclaimer: EARTHQUAKE.disclaimer,
      intro: EARTHQUAKE.intro,
      steps: EARTHQUAKE.steps,
      source: EARTHQUAKE.source,
      sourceUrl: EARTHQUAKE.sourceUrl,
    });
  }

  startDrill() {
    if (!this.mission.drillUnlocked || this.drill) return;
    if (this.dialogueOpen) return;
    this.modalOpen = false;
    this.player.setVelocity(0, 0);
    this.hidePrompt();
    this.emitPromptState(false, '');
    this.drill = new QuakeDrill(this, {
      player: this.player,
      zones: this.zones,
      onFinish: (success) => {
        const first = this.mission.markDrillCompleted();
        this.persist();
        this.emitHud();
        if (first) events.emit('hud:toast', success ? '¡Simulacro completado!' : 'Simulacro terminado');
        this.drill = null;
      },
    });
    this.drill.begin();
  }
}
