// IA de enemigos como máquina de estados PURA (sin Phaser).
//
// Estados: idle -> chase -> attack -> dead
//   idle    patrulla cerca de casa; si el jugador entra en detectRange (o el
//           matón está alertado por un disparo/daño) pasa a chase.
//   chase   persigue al jugador; al llegar a attackRange pasa a attack.
//   attack  pega con cooldown; si el jugador se aleja, vuelve a chase.
//   dead    no hace nada.
//
// stepAI muta el estado `ai` (timers y objetivo de patrulla) y devuelve la
// intención del frame: velocidad, dirección visual y si toca atacar.

export const AI_STATES = Object.freeze(['idle', 'chase', 'attack', 'dead']);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createAI({ homeX, homeY, facing = 'down', seed = 0 } = {}) {
  return {
    state: 'idle',
    homeX: Number(homeX) || 0,
    homeY: Number(homeY) || 0,
    facing: facing,
    cooldownUntil: 0,
    alertUntil: 0,
    wanderX: Number(homeX) || 0,
    wanderY: Number(homeY) || 0,
    nextThink: 900 + seed * 137,
    lastSeenX: Number(homeX) || 0,
    lastSeenY: Number(homeY) || 0,
    lostSightAt: 0,
    lineOfSight: true,
  };
}

// Un disparo cerca (o un golpe) deja al matón alertado por unos segundos.
export function alertAI(ai, now, durationMs = 4500) {
  if (!ai || ai.state === 'dead') return;
  ai.alertUntil = Math.max(ai.alertUntil, now + durationMs);
}

export function killAI(ai) {
  if (ai) ai.state = 'dead';
}

export function isAlerted(ai, now) {
  return Boolean(ai) && now < ai.alertUntil;
}

function faceTo(ai, dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) ai.facing = dx > 0 ? 'right' : 'left';
  else ai.facing = dy > 0 ? 'down' : 'up';
  return ai.facing;
}

export function stepAI(ai, ctx) {
  const { now, x, y, player, def, dt = 16, hasLineOfSight = true } = ctx;
  const out = { state: ai.state, vx: 0, vy: 0, facing: ai.facing, attack: false };
  if (ai.state === 'dead') {
    out.state = 'dead';
    return out;
  }

  const px = Number(player?.x) || 0;
  const py = Number(player?.y) || 0;
  const dist = Math.hypot(px - x, py - y);
  const alerted = isAlerted(ai, now);

  if (ai.state === 'idle' && ((dist <= def.detectRange && hasLineOfSight) || alerted)) {
    ai.state = 'chase';
  }

  // Si ve al jugador y este se escapa demasiado, deja de perseguir. Si perdió
  // la vista, sigue investigando la última posición conocida.
  if ((ai.state === 'chase' || ai.state === 'attack') && dist > def.loseRange && !alerted && hasLineOfSight) {
    ai.state = 'idle';
    ai.wanderX = ai.homeX;
    ai.wanderY = ai.homeY;
    ai.nextThink = now + 600;
  }

  if (ai.state === 'attack' && (dist > def.attackRange * 1.25 || !hasLineOfSight)) {
    ai.state = 'chase';
  }

  if (ai.state === 'idle') {
    if (now >= ai.nextThink) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 18 + Math.random() * 26;
      ai.wanderX = clamp(ai.homeX + Math.cos(angle) * radius, 12, ctx.worldWidth ?? 1024);
      ai.wanderY = clamp(ai.homeY + Math.sin(angle) * radius, 18, ctx.worldHeight ?? 704);
      ai.nextThink = now + 1600 + Math.random() * 1800;
    }
    const dx = ai.wanderX - x;
    const dy = ai.wanderY - y;
    const d = Math.hypot(dx, dy);
    if (d > 4) {
      const speed = def.speed * 0.42;
      out.vx = (dx / d) * speed;
      out.vy = (dy / d) * speed;
      out.facing = faceTo(ai, dx, dy);
    }
    out.state = 'idle';
    out.facing = ai.facing;
    return out;
  }

  // chase / attack: si ve al jugador, guarda su posición; si no, investiga la
  // última posición conocida y se rinde después de un rato.
  if (hasLineOfSight) {
    ai.lastSeenX = px;
    ai.lastSeenY = py;
    ai.lostSightAt = 0;
    ai.lineOfSight = true;
  } else {
    ai.lineOfSight = false;
    if (!ai.lostSightAt) ai.lostSightAt = now;
  }

  const targetX = hasLineOfSight ? px : ai.lastSeenX;
  const targetY = hasLineOfSight ? py : ai.lastSeenY;
  const targetDist = Math.hypot(targetX - x, targetY - y);
  out.facing = faceTo(ai, targetX - x, targetY - y);

  if (ai.state === 'chase') {
    if (hasLineOfSight && dist <= def.attackRange) {
      ai.state = 'attack';
    } else if (!hasLineOfSight && (targetDist <= 6 || now - ai.lostSightAt > 6000)) {
      ai.state = 'idle';
      ai.lostSightAt = 0;
    } else {
      const d = Math.max(0.001, targetDist);
      out.vx = ((targetX - x) / d) * def.speed;
      out.vy = ((targetY - y) / d) * def.speed;
      out.state = 'chase';
      return out;
    }
  }

  if (ai.state === 'attack') {
    if (!hasLineOfSight) {
      ai.state = 'chase';
    } else {
      if (now >= ai.cooldownUntil) {
        ai.cooldownUntil = now + def.attackCooldownMs;
        out.attack = true;
      }
      out.state = 'attack';
      return out;
    }
  }

  // Nunca debería llegar aquí, pero deja un frame seguro.
  ai.state = 'idle';
  out.state = 'idle';
  out.facing = ai.facing;
  void dt;
  return out;
}
