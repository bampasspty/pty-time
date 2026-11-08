// Zombis del Slice B (primer tipo del §7.1 del Documento Maestro).
//
// behavior: 'zombie' cambia la IA (EnemyAI.stepAI):
//   - detecta sin línea de visión (oye y huele),
//   - persigue aunque haya muros de por medio,
//   - se alerta con los disparos y con las peleas cercanas.
//
// sprite -> public/assets/characters/enemy-{id}.png (48x96, 4 filas x 3 columnas)

export const ZOMBIES = Object.freeze({
  infectado: Object.freeze({
    id: 'infectado',
    kind: 'zombie',
    behavior: 'zombie',
    name: 'Infectado',
    sprite: 'enemy-infectado',
    maxHp: 40,
    speed: 26,
    damage: 10,
    attackRange: 18,
    detectRange: 150,
    loseRange: 340,
    attackCooldownMs: 1300,
    alertNoise: 320,
    rewardCoins: 2,
  }),
});

export const ZOMBIE_IDS = Object.freeze(Object.keys(ZOMBIES));

export function getZombieDef(id) {
  return ZOMBIES[id] ?? ZOMBIES.infectado;
}
