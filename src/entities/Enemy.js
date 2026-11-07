import Phaser from 'phaser';
import { createAI, stepAI, alertAI, killAI } from '../systems/EnemyAI.js';

const ROW = { down: 0, left: 1, right: 2, up: 3 };

// Matón del barrio: sprite con vida y una IA de estados (ver systems/EnemyAI.js).
// La escena se encarga del daño al jugador y de las colisiones.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, def, spawn, index = 0) {
    super(scene, spawn.x, spawn.y, def.sprite, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.def = def;
    this.spawn = spawn;
    this.enemyIndex = index;
    this.maxHp = def.maxHp;
    this.hp = def.maxHp;
    this.dead = false;
    this.ai = createAI({
      homeX: spawn.x,
      homeY: spawn.y,
      facing: spawn.facing ?? 'down',
      seed: index,
    });

    this.setOrigin(0.5, 1);
    this.setDepth(spawn.y);
    this.body.setSize(10, 8);
    this.body.setOffset(3, 16);
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(300, 300);
    this.setFrame(ROW[this.ai.facing] * 3);

    this.shadow = scene.add
      .ellipse(spawn.x, spawn.y - 1, 12, 5, 0x1b1b2b, 0.26)
      .setDepth(spawn.y - 1);
  }

  get deadOrDying() {
    return this.dead || this.hp <= 0;
  }

  update(time, delta, player, hooks = {}) {
    if (this.dead) return;
    const result = stepAI(this.ai, {
      now: time,
      dt: delta,
      x: this.x,
      y: this.y,
      player,
      def: this.def,
      worldWidth: this.scene.physics.world.bounds.width,
      worldHeight: this.scene.physics.world.bounds.height,
    });

    this.setVelocity(result.vx, result.vy);
    const dir = result.facing ?? 'down';
    if (result.vx !== 0 || result.vy !== 0) {
      const key = `${this.def.sprite}-walk-${dir}`;
      if (this.scene.anims.exists(key)) this.play(key, true);
      else this.setFrame(ROW[dir] * 3);
    } else {
      this.anims.stop();
      this.setFrame(ROW[dir] * 3);
    }

    if (result.attack && typeof hooks.onAttack === 'function') {
      hooks.onAttack(this, this.def.damage);
    }

    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y - 1).setDepth(this.y - 1);
  }

  hurt(amount, now = 0) {
    if (this.dead) return { dead: true, hp: 0 };
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
    alertAI(this.ai, now, 5000);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) {
      this.die();
      return { dead: true, hp: 0 };
    }
    return { dead: false, hp: this.hp };
  }

  alert(now = 0) {
    if (this.dead) return;
    alertAI(this.ai, now, 5000);
  }

  // Los matones vuelven a aparecer cuando arranca la misión de limpieza.
  revive() {
    this.scene.tweens.killTweensOf(this);
    this.dead = false;
    this.hp = this.maxHp;
    this.setAlpha(1).setVisible(true).setActive(true);
    this.clearTint();
    this.setPosition(this.spawn.x, this.spawn.y);
    if (this.body) {
      this.body.enable = true;
      this.body.reset(this.spawn.x, this.spawn.y);
      this.body.setSize(10, 8);
      this.body.setOffset(3, 16);
    }
    this.ai.state = 'idle';
    this.ai.alertUntil = 0;
    this.ai.cooldownUntil = 0;
    this.ai.nextThink = this.scene.time.now + 700;
    if (!this.shadow) {
      this.shadow = this.scene.add
        .ellipse(this.x, this.y - 1, 12, 5, 0x1b1b2b, 0.26)
        .setDepth(this.y - 1);
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    killAI(this.ai);
    this.anims.stop();
    if (this.body) this.body.enable = false;
    this.setVelocity(0, 0);
    this.clearTint();
    this.setTint(0x6b3f3f);
    this.shadow?.destroy();
    this.shadow = null;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 420,
      onComplete: () => {
        this.setVisible(false);
        this.setActive(false);
      },
    });
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    this.shadow = null;
    super.destroy(fromScene);
  }
}
