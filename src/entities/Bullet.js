import Phaser from 'phaser';

// Bala de pistola: sprite de física reciclado desde un pool del grupo.
// La escena controla el daño y las colisiones; aquí sólo viven movimiento,
// alcance y devolución al pool.
export class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x = 0, y = 0, key = 'fx-bullet') {
    super(scene, x, y, key);
    this.damage = 0;
    this.travelled = 0;
    this.maxRange = 0;
    this.setDepth(25000);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y, angle, { speed = 420, range = 420, damage = 10 } = {}) {
    this.setPosition(x, y);
    this.setRotation(angle);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(y + 20000);
    this.damage = damage;
    this.travelled = 0;
    this.maxRange = range;
    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
      this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
    }
    return this;
  }

  updateBullet(delta) {
    if (!this.active) return true;
    if (!this.body) return true;
    this.travelled += (Math.hypot(this.body.velocity.x, this.body.velocity.y) * delta) / 1000;
    if (this.travelled > this.maxRange) {
      this.kill();
      return false;
    }
    this.setDepth(this.y + 20000);
    return true;
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.stop();
      this.body.enable = false;
    }
  }
}
