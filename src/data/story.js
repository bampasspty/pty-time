// Secuencias narrativas del Slice B.
//
// Cada secuencia es una lista de páginas que se muestran con el modal reutilizable
// (UIScene.showStory). El motor de juego recibe `story:finished` con el id y aplica
// el cambio de mundo.
//
// LÍMITE ÉTICO (§13 del Documento Maestro): las alertas del apocalipsis son
// FICCIÓN del videojuego. Nunca se presentan como avisos oficiales: cada página
// lleva el disclaimer visible y no se usan datos reales de emergencia.

export const STORY_PAGES = Object.freeze({
  intro: Object.freeze({
    id: 'intro',
    pages: Object.freeze([
      Object.freeze({
        title: 'SAN MIGUELITO · PANAMÁ',
        body: 'Calito no es un santo. Es un muchacho del barrio con hambre de algo mejor y pocas ganas de pedir permiso.',
      }),
      Object.freeze({
        title: 'CALITO',
        body: 'Sarcástico, callejero, ambicioso y con sus propios códigos. Hoy tiene un mandado. Mañana, quién sabe.',
      }),
      Object.freeze({
        title: 'EL BARRIO',
        body: 'Doña Nena, Pipe, la cancha, el diablo rojo. Todo eso es suyo, aunque nadie se lo haya dado.',
        bullets: ['Camina con WASD o el joystick.', 'Habla con E o el botón HABLAR.'],
      }),
    ]),
  }),

  collapse: Object.freeze({
    id: 'collapse',
    pages: Object.freeze([
      Object.freeze({
        title: 'PTY ALERTA · AVISO FICTICIO',
        body: 'Reportes de personas violentas en San Miguelito. Hospitales colapsados. El transporte no responde.',
        disclaimer:
          'Alerta ficticia del videojuego. No es un aviso oficial ni información real de emergencia.',
      }),
      Object.freeze({
        title: 'EL COLAPSO',
        body: 'La calle se vació en una tarde. Los que quedaron ya no son los mismos. Y están caminando hacia vos.',
        disclaimer:
          'Alerta ficticia del videojuego. No es un aviso oficial ni información real de emergencia.',
      }),
      Object.freeze({
        title: 'CALITO',
        body: 'En Panamá siempre hemos sabido resolver como sea. El problema es que ahora los muertos también quieren su parte.',
        bullets: ['Sobrevive a los primeros infectados.', 'Después corre a la fonda de Doña Nena.'],
        disclaimer:
          'Alerta ficticia del videojuego. No es un aviso oficial ni información real de emergencia.',
      }),
    ]),
  }),
});

export const STORY_IDS = Object.freeze(Object.keys(STORY_PAGES));
