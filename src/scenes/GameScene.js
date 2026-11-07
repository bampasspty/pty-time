import Phaser from 'phaser';
import { SAN_MIGUELITO } from '../world/sanMiguelito.js';
import { NPCS } from '../data/npcs.js';
import { getDialogue } from '../data/dialogues.js';
import { getEnemyDef } from '../data/enemies.js';
import { EARTHQUAKE } from '../data/earthquake.js';
import { events } from '../systems/EventBus.js';
import { inputState } from '../systems/InputState.js';
import { MissionSystem } from '../systems/MissionSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { readSave, sanitizeSave, writeSave } from '../systems/SaveSystem.js';
import { QuakeDrill } from '../systems/QuakeDrill.js';
import { MapBuilder } from '../world/MapBuilder.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Enemy } from '../entities/Enemy.js';
import { Bullet } from '../entities/Bullet.js';
import { cameraZoom, clamp, CSS, textStyle, COLORS } from '../config.js';

const BULLET_POOL = 28;
const AIM_HEIGHT = 10; // las balas salen del torso, no de los pies
const HURT_COOLDOWN = 520;

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
    this.combat = new CombatSystem(this.save);
    this.wasStarted = Boolean(this.save.started);
    this.dialogueOpen = false;
    this.modalOpen = false;
    this.ko = false;
    this.invulnUntil = 0;
    this.reloadKeyDown = false;
    this.aimAngle = 0;
    this.aimWorld = { x: 0, y: 0 };
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
    this.createCombat(built);

    this.setupCamera();
    this.setupInput();

    this.registry.set('playerVariant', this.variant);
    this.registry.set('hud', this.hudPayload());
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

  // ------------------------------------------------------------------ combate

  createCombat(built) {
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: BULLET_POOL });
    this.enemies = (SAN_MIGUELITO.enemies ?? []).map((spawn, index) => {
      const def = getEnemyDef(spawn.id);
      return new Enemy(this, def, spawn, index);
    });

    if (this.enemies.length) {
      this.physics.add.collider(this.enemies, built.staticGroup);
      this.physics.add.collider(this.player, this.enemies);
    }
    this.physics.add.overlap(this.bullets, built.staticGroup, (bullet) => this.killBullet(bullet));

    this.crosshair = this.add.image(0, 0, 'ui-crosshair').setDepth(30000).setVisible(false);
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  onPointerDown(pointer) {
    if (this.dialogueOpen || this.modalOpen || this.ko || this.drill?.active) return;
    if (pointer.button !== 0) return;
    // En el teléfono se dispara con el botón FUEGO (ver UIScene).
    if (pointer.pointerType && pointer.pointerType !== 'mouse') return;
    if (!pointer.positionToCamera) return;
    // No disparar cuando el clic cae sobre un botón de la interfaz.
    try {
      const ui = this.scene.get('UI');
      if (ui?.input?.hitTestPointer) {
        const hits = ui.input.hitTestPointer(pointer);
        if (hits && hits.length > 0) return;
      }
    } catch {
      /* hit test no disponible */
    }
    const world = pointer.positionToCamera(this.cameras.main);
    this.tryShoot(this.time.now, this.angleTo(world.x, world.y));
  }

  updateAim() {
    const pointer = this.input.activePointer;
    const isMouse = pointer.pointerType === 'mouse' || pointer.pointerType === undefined;
    if (!isMouse) {
      this.crosshair.setVisible(false);
      return;
    }
    const world = pointer.positionToCamera(this.cameras.main);
    this.aimWorld.x = world.x;
    this.aimWorld.y = world.y;
    const blocked = this.dialogueOpen || this.modalOpen || this.ko;
    this.crosshair.setPosition(world.x, world.y).setVisible(!blocked);
    this.aimAngle = this.angleTo(world.x, world.y);
  }

  angleTo(x, y) {
    return Math.atan2(y - (this.player.y - AIM_HEIGHT), x - this.player.x);
  }

  facingAngle() {
    const angles = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 };
    return angles[this.player.facing] ?? 0;
  }

  nearestEnemy(maxDistance = 600) {
    let best = null;
    let bestDist = maxDistance;
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const d = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (d < bestDist) {
        best = enemy;
        bestDist = d;
      }
    }
    return best;
  }

  fireAtNearest() {
    if (this.dialogueOpen || this.modalOpen || this.ko || this.drill?.active) return;
    const target = this.nearestEnemy(560);
    const angle = target ? this.angleTo(target.x, target.y - AIM_HEIGHT) : this.facingAngle();
    this.aimAngle = angle;
    this.tryShoot(this.time.now, angle);
  }

  handleFireInput(time) {
    if (this.keys.reload.isDown && !this.reloadKeyDown) {
      this.reloadKeyDown = true;
      this.reloadWeapon();
    } else if (!this.keys.reload.isDown) {
      this.reloadKeyDown = false;
    }

    const pointer = this.input.activePointer;
    const mouseHeld = pointer.isDown && (pointer.pointerType === 'mouse' || pointer.pointerType === undefined);
    if (this.keys.fire.isDown || mouseHeld) this.tryShoot(time);
  }

  reloadWeapon() {
    if (this.combat.startReload(this.time.now)) this.emitHud();
  }

  tryShoot(now, angleOverride = null) {
    this.combat.tick(now);
    const result = this.combat.tryFire(now);
    if (!result.fired) {
      if (result.reason === 'empty' && this.combat.canReload()) {
        this.combat.startReload(now);
        this.emitHud();
      }
      return false;
    }

    const weapon = this.combat.weapon;
    const angle = angleOverride ?? this.aimAngle;
    if (weapon.type === 'melee') {
      this.meleeSwing(now, angle, weapon);
    } else {
      this.spawnBullet(angle, weapon.damage);
      this.cameras.main.shake(55, 0.0018);
    }
    this.alertEnemiesNear(this.player.x, this.player.y, 260);
    this.emitHud();
    return true;
  }

  spawnBullet(angle, damage) {
    const weapon = this.combat.weapon;
    const spread = (Math.random() - 0.5) * 2 * (weapon.spreadRad ?? 0);
    const finalAngle = angle + spread;
    const originY = this.player.y - AIM_HEIGHT;
    const x = this.player.x + Math.cos(finalAngle) * 9;
    const y = originY + Math.sin(finalAngle) * 9;
    const bullet = this.bullets.get(x, y, 'fx-bullet');
    if (!bullet) return;
    bullet.fire(x, y, finalAngle, {
      speed: weapon.bulletSpeed,
      range: weapon.range,
      damage,
    });
    this.showMuzzle(x, y, finalAngle);
  }

  meleeSwing(now, angle, weapon) {
    let hits = 0;
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const d = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (d > weapon.range + 8) continue;
      const enemyAngle = this.angleTo(enemy.x, enemy.y - AIM_HEIGHT);
      const diff = Math.abs(Phaser.Math.Angle.Wrap(enemyAngle - angle));
      if (diff > 1.1) continue;
      this.hitEnemy({ damage: weapon.damage, kill: () => {} }, enemy);
      hits += 1;
    }
    if (hits > 0) this.cameras.main.shake(70, 0.002);
    this.showHit(this.player.x + Math.cos(angle) * 14, this.player.y - AIM_HEIGHT + Math.sin(angle) * 14);
  }

  alertEnemiesNear(x, y, radius) {
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      if (Math.hypot(enemy.x - x, enemy.y - y) <= radius) {
        enemy.alert(this.time.now);
      }
    }
  }

  showMuzzle(x, y, angle) {
    const flash = this.add
      .image(x, y, 'fx-muzzle')
      .setDepth(y + 20000)
      .setRotation(angle + Math.PI / 2)
      .setScale(0.9);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.4,
      duration: 90,
      onComplete: () => flash.destroy(),
    });
  }

  showHit(x, y) {
    const hit = this.add.image(x, y, 'fx-hit').setDepth(y + 21000);
    this.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 1.6,
      duration: 160,
      onComplete: () => hit.destroy(),
    });
  }

  killBullet(bullet) {
    bullet.kill();
  }

  hitEnemy(bullet, enemy) {
    if (!enemy || enemy.dead) return;
    bullet.kill?.();
    const result = enemy.hurt(bullet.damage, this.time.now);
    this.showHit(enemy.x, enemy.y - 12);
    if (result.dead) this.onEnemyDefeated(enemy);
    this.emitHud();
  }

  onEnemyDefeated() {
    this.combat.addDefeat(1);
    const progress = this.mission.handleEnemyDefeated();
    if (progress.progressed) {
      if (progress.done) {
        events.emit('hud:toast', progress.toast);
      } else {
        events.emit('hud:toast', `Matón abajo · ${progress.kills}/${progress.target}`);
      }
      this.updateQuestMarker();
      this.persist();
    }
    this.emitHud();
  }

  updateEnemies(time, delta, frozen = false) {
    if (this.ko) return;
    if (frozen) {
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        enemy.setVelocity(0, 0);
        enemy.anims.stop();
      }
      return;
    }
    for (const enemy of this.enemies) {
      enemy.update(time, delta, this.player, {
        onAttack: (attacker) => this.damagePlayer(attacker.def.damage),
      });
    }
  }

  updateBullets(delta) {
    const bounds = this.physics.world.bounds;
    for (const bullet of this.bullets.getChildren()) {
      if (!bullet.active) continue;
      bullet.updateBullet(delta);
      if (!bullet.active) continue;
      if (bullet.x < bounds.x || bullet.y < bounds.y || bullet.x > bounds.right || bullet.y > bounds.bottom) {
        bullet.kill();
        continue;
      }
      // El cuerpo físico de los personajes está a los pies; las balas vuelan a
      // la altura del torso, así que el impacto se resuelve por distancia.
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - (enemy.y - AIM_HEIGHT);
        if (dx * dx + dy * dy <= 144) {
          this.hitEnemy(bullet, enemy);
          break;
        }
      }
    }
  }

  damagePlayer(amount) {
    if (this.ko || this.combat.dead) return;
    const now = this.time.now;
    if (now < this.invulnUntil) return;
    this.invulnUntil = now + HURT_COOLDOWN;
    const result = this.combat.damage(amount);
    this.cameras.main.flash(110, 90, 10, 10);
    this.player.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (!this.player?.active) return;
      if (this.ko) this.player.setTint(0xda291c);
      else this.player.clearTint();
    });
    this.emitHud();
    if (result.dead) this.playerDown();
  }

  playerDown() {
    if (this.ko) return;
    this.ko = true;
    this.player.setVelocity(0, 0);
    this.player.playIdle();
    this.player.setTint(0xda291c);
    this.hidePrompt();
    this.crosshair.setVisible(false);
    events.emit('player:down', { hp: 0 });
  }

  respawnPlayer() {
    this.combat.respawn();
    this.ko = false;
    this.invulnUntil = this.time.now + 1600;
    this.player.clearTint();
    this.player.setPosition(SAN_MIGUELITO.spawn.x, SAN_MIGUELITO.spawn.y);
    this.playerShadow.setPosition(this.player.x, this.player.y - 1);
    this.cameras.main.flash(200, 255, 255, 255);
    this.emitHud();
    this.persist();
  }

  // Los matones vuelven a aparecer al aceptar la misión de limpieza.
  reviveEnemies() {
    for (const enemy of this.enemies) enemy.revive();
  }

  hudPayload() {
    return {
      ...this.mission.hud(),
      hp: this.combat.hp,
      maxHp: this.combat.maxHp,
      ammo: this.combat.loaded,
      reserve: this.combat.reserve,
      weapon: this.combat.weapon.name,
      weaponType: this.combat.weapon.type,
      reloading: this.combat.isReloadingAt(this.time.now),
      defeats: this.combat.defeats,
      reputation: this.mission.reputation.barrio,
    };
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
      fire: Keyboard.KeyCodes.J,
      fireAlt: Keyboard.KeyCodes.K,
      reload: Keyboard.KeyCodes.R,
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
    this.onUiFire = () => this.fireAtNearest();
    this.onUiReload = () => this.reloadWeapon();
    this.onPlayerRespawn = () => this.respawnPlayer();

    events.on('ui:interact', this.onUiInteract);
    events.on('ui:busy', this.onUiBusy);
    events.on('dialogue:closed', this.onDialogueClosed);
    events.on('drill:request', this.onDrillRequest);
    events.on('drill:start', this.onDrillStart);
    events.on('ui:help', this.onUiHelp);
    events.on('ui:fire', this.onUiFire);
    events.on('ui:reload', this.onUiReload);
    events.on('player:respawn', this.onPlayerRespawn);

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
      events.off('ui:fire', this.onUiFire);
      events.off('ui:reload', this.onUiReload);
      events.off('player:respawn', this.onPlayerRespawn);
      window.removeEventListener('pagehide', this.onPageHide);
      this.drill?.stop();
      this.mapBuilder?.destroy();
      this.input.off('pointerdown', this.onPointerDown, this);
      for (const enemy of this.enemies ?? []) enemy.destroy();
    });
  }

  update(time, delta) {
    if (!this.player) return;

    const locked = this.dialogueOpen || this.modalOpen || this.ko;
    const crouch = !locked && (this.keys.crouch.isDown || inputState.crouch);
    this.player.setCrouching(crouch);
    this.player.updateMovement(delta, locked ? { x: 0, y: 0 } : this.readMovement(), locked);

    this.playerShadow.setPosition(this.player.x, this.player.y - 1).setDepth(this.player.y - 1);

    this.combat.tick(time);
    if (!locked) {
      this.updateAim();
      this.handleFireInput(time);
    } else {
      this.crosshair?.setVisible(false);
    }
    this.updateEnemies(time, delta, this.dialogueOpen || this.modalOpen);
    this.updateBullets(delta);

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
    const blocked = this.dialogueOpen || this.modalOpen || this.ko || this.drill?.active;
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

    if (this.mission.canCollect('chancla')) {
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
    if (this.dialogueOpen || this.modalOpen || this.ko || this.drill?.active) return;
    if (!this.focus) return;
    if (this.focus.type === 'npc') this.openDialogue(this.focus.npc);
    else if (this.focus.type === 'item') this.pickupItem(this.focus.item);
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

  pickupItem(item) {
    const result = this.mission.collectItem(item.id);
    if (!result.collected) return;
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
    if (result.toast) events.emit('hud:toast', result.toast);
  }

  handleMissionAction(action) {
    const result = this.mission.applyAction(action);
    if (!result.changed) return;
    this.persist();
    this.updateItemVisibility();
    this.updateQuestMarker();
    this.emitHud();
    if (result.toast) events.emit('hud:toast', result.toast);

    // Los matones vuelven a aparecer cuando arranca la misión de limpieza.
    if (result.missionId === 'limpia-la-cancha' && result.step === 'deal') {
      this.reviveEnemies();
    }

    if (result.kind === 'finish') {
      events.emit('mission:complete', {
        title: result.title,
        objective: result.objective,
        reward: result.reward,
        body: result.completion?.body ?? null,
        bullets: result.completion?.bullets ?? null,
        drillUnlocked: this.mission.drillUnlocked,
      });
    }
  }

  updateItemVisibility() {
    for (const item of this.items) {
      const visible = item.id === 'chancla' && this.mission.canCollect('chancla') && Boolean(item.sprite);
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
    const npcId = this.mission.markerNpc();
    const target = npcId ? this.npcs.find((n) => n.npcId === npcId) : null;

    if (!target) {
      this.questMarker.setVisible(false);
      return;
    }
    this.questMarker.setVisible(true);
    this.questMarker.setPosition(target.x, target.y - 42);
    this.questMarker.setDepth(target.y + 10000);
  }

  emitHud() {
    const payload = this.hudPayload();
    this.registry.set('hud', payload);
    events.emit('hud:update', payload);
  }

  persist() {
    const missionData = this.mission.toSave();
    const save = {
      ...this.save,
      ...missionData,
      playerVariant: this.variant,
      player: { hp: this.combat.hp, maxHp: this.combat.maxHp },
      combat: this.combat.toSave(),
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
