import Phaser from 'phaser';
import { NPC_IDS } from '../world/defs.js';

const ROW = { down: 0, left: 1, right: 2, up: 3 };

let uid = 0;

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, def, spawn) {
    super(scene, spawn.x, spawn.y, `npc-${spawn.id}`, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.npcId = spawn.id;
    this.def = def;
    this.displayName = def?.name ?? spawn.id;
    this.role = def?.role ?? '';
    this.homeX = spawn.x;
    this.homeY = spawn.y;
    this.wanderRadius = spawn.wander ?? 0;
    this.facing = spawn.facing ?? 'down';
    this.talking = false;
    this.walking = false;
    this.lastAnim = '';
    this.targetX = spawn.x;
    this.targetY = spawn.y;
    this.nextThink = 800 + Math.random() * 2000;
    this.uid = ++uid;

    this.setOrigin(0.5, 1);
    this.setDepth(spawn.y);
    this.body.setSize(10, 8);
    this.body.setOffset(3, 16);
    this.body.setImmovable(true);
    this.body.pushable = false;
    this.setFrame(ROW[this.facing] * 3);

    this.shadow = scene.add
      .ellipse(spawn.x, spawn.y - 1, 12, 5, 0x1b1b2b, 0.28)
      .setDepth(spawn.y - 1);
  }

  update(time, delta, player) {
    if (this.talking || this.wanderRadius <= 0) {
      this.idleAndSyncShadow();
      return;
    }

    const distanceToPlayer = player ? Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) : 999;
    if (distanceToPlayer < 42) {
      this.setVelocity(0, 0);
      this.idleAndSyncShadow();
      // Mirar al jugador cuando está cerca.
      if (player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        this.anims.stop();
        this.setFrame(ROW[this.facing] * 3);
        this.lastAnim = '';
      }
      return;
    }

    if (time > this.nextThink) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.wanderRadius;
      this.targetX = Phaser.Math.Clamp(this.homeX + Math.cos(angle) * radius, 12, this.scene.physics.world.bounds.width - 12);
      this.targetY = Phaser.Math.Clamp(this.homeY + Math.sin(angle) * radius, 18, this.scene.physics.world.bounds.height - 8);
      this.nextThink = time + 2200 + Math.random() * 2600;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) {
      this.setVelocity(0, 0);
      this.idleAndSyncShadow();
      return;
    }

    const speed = 22;
    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    const key = `npc-${this.npcId}-walk-${this.facing}`;
    if (this.lastAnim !== key) {
      this.play(key, true);
      this.lastAnim = key;
    }
    this.walking = true;
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y - 1).setDepth(this.y - 1);
  }

  idleAndSyncShadow() {
    if (this.walking) {
      this.anims.stop();
      this.setFrame(ROW[this.facing] * 3);
      this.lastAnim = '';
      this.walking = false;
    }
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y - 1).setDepth(this.y - 1);
  }

  stopTalking() {
    this.talking = false;
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}

export function validNpcId(id) {
  return NPC_IDS.includes(id);
}
