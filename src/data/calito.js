// Calito: protagonista canónico de PTY TIME.
//
// El jugador puede cambiarle la camisa (cosmético), pero Calito es Calito:
// un muchacho de San Miguelito, antihéroe, sarcástico y con sus propios códigos.
// Cuando existan retratos propios y líneas narradas, esta ficha es la referencia.

export const CALITO = Object.freeze({
  name: 'Calito',
  fullName: 'Carlos "Calito" — nadie le dice Carlos',
  role: 'Muchacho de San Miguelito',
  defaultVariant: 'm-blue',
  home: 'San Miguelito',
  tagline: 'Del barrio al apocalipsis',
  traits: Object.freeze(['ambicioso', 'callejero', 'inteligente', 'sarcástico', 'con códigos']),
  // Frases de identidad para HUD, ayuda y futuros diálogos narrados.
  lines: Object.freeze({
    intro: 'En San Miguelito uno resuelve como sea. El problema es que ahora los muertos también quieren su parte.',
    crimeIntro: 'Esos cobran por pasar por la plaza. Aquí eso no se queda así.',
    reload: 'Sin balas no hay respeto.',
  }),
});

export const PLAYER_NAME = CALITO.name;
