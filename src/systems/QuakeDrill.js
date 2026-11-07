import { EARTHQUAKE } from '../data/earthquake.js';
import { events } from './EventBus.js';
import { clamp } from '../config.js';

// Simulacro ficticio de terremoto. No hay alertas reales ni datos sísmicos.
// Fases: cubrirse (2.5 s) -> sujetarse (3 s) -> evacuar a zona abierta.
export class QuakeDrill {
  constructor(scene, { player, zones, onFinish }) {
    this.scene = scene;
    this.player = player;
    this.zones = (zones ?? []).filter((z) => z.type === 'open');
    this.onFinish = onFinish;
    this.active = false;
    this.phase = '';
    this.progress = 0;
    this.crouchTime = 0;
    this.stillTime = 0;
    this.phaseElapsed = 0;
    this.totalElapsed = 0;
    this.lastEmit = 0;
    this.markers = null;
    this.markerTexts = [];
    this.shakeStarted = 0;
    this.zoneName = '';
  }

  begin() {
    this.active = true;
    this.totalElapsed = 0;
    this.phaseElapsed = 0;
    this.crouchTime = 0;
    this.stillTime = 0;
    this.progress = 0;
    this.phase = 'crouch';
    this.shakeStarted = 0;
    this.scene.cameras.main.shake(6000, 0.0026, true);
    events.emit('toast', 'SIMULACRO: mantén la calma');
    this.emitState(true);
    this.emitPromptTimer = this.scene.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => this.emitState(),
    });
  }

  update(_time, delta) {
    if (!this.active) return;
    const dt = Math.min(delta, 80) / 1000;
    this.totalElapsed += dt;
    this.phaseElapsed += dt;

    if (this.phase === 'crouch') {
      if (this.player.crouching) this.crouchTime += dt;
      else this.crouchTime = Math.max(0, this.crouchTime - dt * 2);
      this.progress = clamp(this.crouchTime / 2.5, 0, 1);
      if (this.progress >= 1 || this.phaseElapsed > 20) this.nextPhase('hold');
    } else if (this.phase === 'hold') {
      const speed = this.player.body ? this.player.body.velocity.length() : 0;
      if (this.player.crouching && speed < 8) this.stillTime += dt;
      else this.stillTime = Math.max(0, this.stillTime - dt * 2);
      this.progress = clamp(this.stillTime / 3, 0, 1);
      if (this.progress >= 1 || this.phaseElapsed > 18) this.nextPhase('evacuate');
    } else if (this.phase === 'evacuate') {
      this.progress = clamp(1 - this.phaseElapsed / 45, 0, 1);
      if (this.isInsideOpenZone()) {
        this.finish(true);
      } else if (this.phaseElapsed > 45) {
        this.finish(false);
      }
    }
  }

  nextPhase(phase) {
    this.phase = phase;
    this.phaseElapsed = 0;
    this.progress = 0;
    if (phase === 'hold') {
      this.scene.cameras.main.shake(4000, 0.0022, true);
      events.emit('toast', 'Ahora sujétate y quédate quieto');
    } else if (phase === 'evacuate') {
      this.scene.cameras.main.shakeEffect?.reset();
      this.createMarkers();
      events.emit('toast', 'Busca una zona abierta');
    }
    this.emitState(true);
  }

  emitState(force = false) {
    if (!this.active) return;
    const now = this.scene.time.now;
    if (!force && now - this.lastEmit < 90) return;
    this.lastEmit = now;

    let text = '';
    let detail = '';
    let showCrouch = false;
    if (this.phase === 'crouch') {
      text = 'AGÁCHATE Y CÚBRETE';
      detail = 'Mantén presionado CUBRIRSE. Protege tu cabeza y cuello.';
      showCrouch = true;
    } else if (this.phase === 'hold') {
      text = 'SUJÉTATE Y QUÉDATE QUIETO';
      detail = 'Cuenta hasta tres sin moverte, junto a algo firme.';
      showCrouch = true;
    } else if (this.phase === 'evacuate') {
      text = 'VE A UNA ZONA ABIERTA';
      detail = EARTHQUAKE.safeZoneHint;
      this.zoneName = this.nearestZoneName();
      showCrouch = false;
    }

    events.emit('drill:state', {
      active: true,
      phase: this.phase,
      text,
      detail,
      progress: this.progress,
      showCrouch,
      zoneName: this.zoneName,
      banner: EARTHQUAKE.disclaimer,
      title: EARTHQUAKE.title,
    });
  }

  createMarkers() {
    if (this.markers) return;
    const g = this.scene.add.graphics().setDepth(8500);
    this.markers = g;
    for (const zone of this.zones) {
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      g.lineStyle(2, 0x7ee081, 0.85);
      g.strokeEllipse(cx, cy, Math.min(zone.w * 0.7, 90), Math.min(zone.h * 0.7, 54));
      g.lineStyle(1, 0x7ee081, 0.35);
      g.strokeEllipse(cx, cy, Math.min(zone.w * 0.7, 90) + 8, Math.min(zone.h * 0.7, 54) + 6);
      const label = this.scene.add
        .text(cx, cy - 30, 'ZONA SEGURA', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: '#7ee081',
          stroke: '#0b1020',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(8501);
      this.markerTexts.push(label);
    }
    this.scene.tweens.add({
      targets: g,
      alpha: { from: 1, to: 0.45 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  nearestZoneName() {
    if (!this.zones.length) return 'la cancha';
    let best = null;
    let bestDist = Infinity;
    for (const zone of this.zones) {
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      const d = Math.hypot(this.player.x - cx, this.player.y - cy);
      if (d < bestDist) {
        bestDist = d;
        best = zone;
      }
    }
    return best ? best.name : 'la cancha';
  }

  isInsideOpenZone() {
    const px = this.player.x;
    const py = this.player.y;
    return this.zones.some((z) => px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h);
  }

  finish(success) {
    if (!this.active) return;
    this.active = false;
    this.emitPromptTimer?.remove();
    this.emitPromptTimer = null;
    this.scene.cameras.main.shakeEffect?.reset();
    this.destroyMarkers();
    events.emit('drill:state', { active: false });
    events.emit('drill:end', {
      success,
      title: EARTHQUAKE.title,
      disclaimer: EARTHQUAKE.disclaimer,
      steps: EARTHQUAKE.steps,
      after: EARTHQUAKE.after,
      source: EARTHQUAKE.source,
      sourceUrl: EARTHQUAKE.sourceUrl,
      message: success
        ? 'Llegaste a una zona abierta. Así se ve un buen refugio.'
        : 'El simulacro terminó. Recuerda: en un sismo real, aléjate de edificios, postes y cables.',
    });
    this.onFinish?.(success);
  }

  destroyMarkers() {
    if (this.markers) {
      this.scene.tweens.killTweensOf(this.markers);
      this.markers.destroy();
      this.markers = null;
    }
    for (const t of this.markerTexts) t.destroy();
    this.markerTexts = [];
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.emitPromptTimer?.remove();
    this.scene.cameras.main.shakeEffect?.reset();
    this.destroyMarkers();
    events.emit('drill:state', { active: false });
  }
}
