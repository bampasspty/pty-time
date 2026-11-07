import Phaser from 'phaser';
import { WORLD, GAME_VERSION } from '../config.js';

const DIRS = ['down', 'left', 'right', 'up'];
const ROW = { down: 0, left: 1, right: 2, up: 3 };

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, variantId) {
    super(scene, x, y, `player-${variantId}`, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.variantId = variantId;
    this.setOrigin(0.5, 1);
    this.setDepth(y);
    this.setCollideWorldBounds(true);
    this.body.setSize(10, 8);
    this.body.setOffset(3, 16);
    this.body.setMaxVelocity(140, 140);

    this.facing = 'down';
    this.walking = false;
    this.crouching = false;
    this.speed = WORLD.speed;
    this.lastAnim = '';
  }

  get feetY() {
    return this.y;
  }

  setVariant(variantId) {
    this.variantId = variantId;
    this.setTexture(`player-${variantId}`, ROW[this.facing] * 3);
    this.lastAnim = '';
  }

  setCrouching(value) {
    const crouch = Boolean(value);
    if (crouch === this.crouching) return;
    this.crouching = crouch;
    this.setScale(1, crouch ? 0.78 : 1);
    if (crouch) {
      this.anims.stop();
      this.setFrame(ROW[this.facing] * 3);
      this.lastAnim = '';
    }
  }

  updateMovement(dt, input, locked = false) {
    let x = input.x;
    let y = input.y;
    const len = Math.hypot(x, y);
    if (locked || this.crouching || len < 0.12) {
      this.setVelocity(0, 0);
      this.playIdle();
      this.setDepth(this.y);
      return;
    }

    x /= len;
    y /= len;
    const speed = this.speed;
    this.setVelocity(x * speed, y * speed);

    if (Math.abs(x) > Math.abs(y)) {
      this.facing = x > 0 ? 'right' : 'left';
    } else {
      this.facing = y > 0 ? 'down' : 'up';
    }

    const key = `player-${this.variantId}-walk-${this.facing}`;
    if (this.lastAnim !== key) {
      this.play(key, true);
      this.lastAnim = key;
    }
    this.walking = true;
    this.setDepth(this.y);
  }

  playIdle() {
    if (this.lastAnim === '') return;
    this.anims.stop();
    this.setFrame(ROW[this.facing] * 3);
    this.lastAnim = '';
    this.walking = false;
  }

  // Los pies están en this.y; el body ya está alineado con los pies.
  get interactPoint() {
    return { x: this.x, y: this.y - 4 };
  }

  snapshot() {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
      variant: this.variantId,
      version: GAME_VERSION,
    };
  }
}

export const PLAYER_DIRECTIONS = DIRS;
