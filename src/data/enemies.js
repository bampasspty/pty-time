// Enemigos del Slice A: matones del barrio (todavía sin zombis).
//
// sprite       -> public/assets/characters/enemy-{id}.png (48x96, 4 filas x 3 columnas)
// detectRange  -> distancia a la que el matón se da cuenta del jugador
// loseRange    -> distancia a la que deja de perseguir (si no está alertado)
// attackRange  -> distancia a la que pega
// alertNoise   -> radio al que lo alerta un disparo

export const ENEMIES = Object.freeze({
  maton: Object.freeze({
    id: 'maton',
    name: 'Matón',
    sprite: 'enemy-maton',
    maxHp: 30,
    speed: 54,
    damage: 8,
    attackRange: 20,
    detectRange: 150,
    loseRange: 260,
    attackCooldownMs: 900,
    alertNoise: 180,
    rewardCoins: 6,
    xp: 14,
  }),
  'maton-duro': Object.freeze({
    id: 'maton-duro',
    name: 'Matón de la plaza',
    sprite: 'enemy-maton-duro',
    maxHp: 60,
    speed: 44,
    damage: 12,
    attackRange: 22,
    detectRange: 170,
    loseRange: 280,
    attackCooldownMs: 1150,
    alertNoise: 200,
    rewardCoins: 12,
    xp: 30,
  }),
});

export const ENEMY_IDS = Object.freeze(Object.keys(ENEMIES));

export function getEnemyDef(id) {
  return ENEMIES[id] ?? ENEMIES.maton;
}
