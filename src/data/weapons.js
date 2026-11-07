// Armas del Slice A. Datos puros: los leen el sistema de combate y la escena.
//
// type: 'melee'  -> golpe cuerpo a cuerpo (sin munición)
//       'pistol' -> arma de fuego (cargador + reserva)
// cooldownMs controla la cadencia; magazine 0 = no usa cargador.

export const WEAPONS = Object.freeze({
  puno: Object.freeze({
    id: 'puno',
    name: 'EL PUÑO',
    type: 'melee',
    damage: 10,
    cooldownMs: 420,
    range: 26,
    spreadRad: 0,
    magazine: 0,
    reloadMs: 0,
    bulletSpeed: 0,
    ammoType: null,
  }),
  pistola: Object.freeze({
    id: 'pistola',
    name: 'LA 9',
    type: 'pistol',
    damage: 14,
    cooldownMs: 260,
    range: 420,
    spreadRad: 0.05,
    magazine: 8,
    reloadMs: 850,
    bulletSpeed: 430,
    ammoType: 'pistola',
  }),
});

export const DEFAULT_WEAPON = 'pistola';

// Munición inicial al empezar una partida nueva.
export const STARTING_AMMO = Object.freeze({ pistola: 30 });

export function getWeapon(id) {
  return WEAPONS[id] ?? WEAPONS[DEFAULT_WEAPON];
}
