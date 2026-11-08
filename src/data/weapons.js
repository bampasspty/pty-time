// Armas de PTY TIME (Fase 3 del Documento Maestro, §5.2).
//
// type: 'melee'   -> golpe cuerpo a cuerpo (sin munición)
//       'pistol'  -> arma de fuego semiautomática
//       'smg'     -> automática, mucha cadencia y dispersión
//       'shotgun' -> perdigones en cono, daño brutal de cerca
//       'rifle'   -> daño alto, cadencia lenta, mucho alcance
//
// magazine  -> balas por cargador (0 = no usa cargador)
// ammoType  -> clave de la reserva de munición (null en cuerpo a cuerpo)
// pellets   -> cantidad de proyectiles por disparo (escopeta)
// starterAmmo -> reserva que se entrega al conseguir el arma por primera vez

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
    pellets: 1,
    starterAmmo: 0,
  }),
  tubo: Object.freeze({
    id: 'tubo',
    name: 'EL TUBO',
    type: 'melee',
    damage: 17,
    cooldownMs: 540,
    range: 32,
    spreadRad: 0,
    magazine: 0,
    reloadMs: 0,
    bulletSpeed: 0,
    ammoType: null,
    pellets: 1,
    starterAmmo: 0,
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
    pellets: 1,
    starterAmmo: 30,
  }),
  subfusil: Object.freeze({
    id: 'subfusil',
    name: 'LA MICRO',
    type: 'smg',
    damage: 9,
    cooldownMs: 105,
    range: 380,
    spreadRad: 0.1,
    magazine: 24,
    reloadMs: 1150,
    bulletSpeed: 470,
    ammoType: 'subfusil',
    pellets: 1,
    starterAmmo: 48,
  }),
  escopeta: Object.freeze({
    id: 'escopeta',
    name: 'LA RECORTADA',
    type: 'shotgun',
    damage: 8,
    cooldownMs: 850,
    range: 230,
    spreadRad: 0.22,
    magazine: 6,
    reloadMs: 1400,
    bulletSpeed: 360,
    ammoType: 'escopeta',
    pellets: 5,
    starterAmmo: 18,
  }),
  rifle: Object.freeze({
    id: 'rifle',
    name: 'EL 22',
    type: 'rifle',
    damage: 26,
    cooldownMs: 620,
    range: 620,
    spreadRad: 0.02,
    magazine: 10,
    reloadMs: 1300,
    bulletSpeed: 640,
    ammoType: 'rifle',
    pellets: 1,
    starterAmmo: 20,
  }),
});

export const WEAPON_IDS = Object.freeze(Object.keys(WEAPONS));

// Armas que Calito tiene desde el principio.
export const STARTING_WEAPONS = Object.freeze(['puno', 'pistola']);

export const DEFAULT_WEAPON = 'pistola';

// Reserva inicial al empezar una partida nueva.
export const STARTING_AMMO = Object.freeze({
  pistola: 30,
  subfusil: 0,
  escopeta: 0,
  rifle: 0,
});

// Tipos de munición del juego (para sanear guardados).
export const AMMO_TYPES = Object.freeze(
  [...new Set(Object.values(WEAPONS).map((weapon) => weapon.ammoType).filter(Boolean))],
);

export function getWeapon(id) {
  return WEAPONS[id] ?? WEAPONS[DEFAULT_WEAPON];
}

export function isWeaponId(id) {
  return Boolean(WEAPONS[id]);
}

export function ammoTypeOf(weaponId) {
  return WEAPONS[weaponId]?.ammoType ?? null;
}
