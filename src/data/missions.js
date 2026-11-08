// Registro de misiones de PTY Time.
//
// El motor de misiones (src/systems/MissionSystem.js) es GENÉRICO: lee estas
// definiciones y no conoce ninguna misión en concreto. Para añadir una misión
// nueva basta con registrarla aquí y darle un NPC que devuelva su acción.
//
// Estructura:
//   initialStep    paso con el que arranca (locked = se desbloquea sola)
//   startStep      paso al aceptar la misión
//   requires       { mission, step } -> se desbloquea cuando esa misión llega a ese paso
//   steps          textos de objetivo por paso (incluye inactive y done)
//   actions        { accion: { from, to, require?, set?, clear?, toast?, reward? } }
//   collectibles   objetos recogibles que avanzan la misión
//   marker         NPC que marca la estrella de objetivo por paso
//   killTarget     misión de limpieza: cuenta enemigos derrotados
//   completion     texto del modal de misión completada
//   reward         recompensa por defecto (también puede ir por acción)

export const MISSION_CATEGORIES = Object.freeze({
  historia: 'Historia principal',
  secundaria: 'Secundaria',
  crimen: 'Crimen',
  supervivencia: 'Supervivencia',
  exploracion: 'Exploración',
  evento: 'Evento especial',
});

export const MISSIONS = Object.freeze({
  'el-mandado': Object.freeze({
    id: 'el-mandado',
    category: 'secundaria',
    title: 'El mandado de Doña Nena',
    description: 'Doña Nena necesita ayuda con un mandado y su nieto Pipe no aparece.',
    initialStep: 'inactive',
    startStep: 'find-pipe',
    requires: null,
    steps: Object.freeze({
      inactive: 'Habla con Doña Nena en la fonda.',
      'find-pipe': 'Busca a Pipe en la cancha de San Isidro.',
      'find-chancla': 'Encuentra la chancleta de Pipe cerca de la parada de bus.',
      'return-pipe': 'Devuélvele la chancleta a Pipe en la cancha.',
      'report-nena': 'Regresa donde Doña Nena para contarle que todo está bien.',
      done: 'Misión completada. El barrio está agradecido.',
    }),
    order: Object.freeze(['find-pipe', 'find-chancla', 'return-pipe', 'report-nena', 'done']),
    actions: Object.freeze({
      startMission: Object.freeze({ from: 'inactive', to: 'find-pipe', toast: 'Nueva misión: El mandado de Doña Nena' }),
      pipeMet: Object.freeze({ from: 'find-pipe', to: 'find-chancla', toast: 'Nuevo objetivo: busca la chancleta' }),
      giveChancla: Object.freeze({
        from: 'return-pipe',
        to: 'report-nena',
        require: 'hasChancla',
        clear: Object.freeze(['hasChancla']),
        toast: 'Pipe ya tiene su chancleta',
      }),
      finishMission: Object.freeze({
        from: 'report-nena',
        to: 'done',
        toast: '¡Misión completada!',
        reward: Object.freeze({ coins: 25, xp: 40, unlock: 'drill' }),
        kind: 'finish',
      }),
    }),
    collectibles: Object.freeze({
      chancla: Object.freeze({
        from: 'find-chancla',
        to: 'return-pipe',
        flag: 'hasChancla',
        toast: 'Recogiste la chancleta de Pipe. Llévasela.',
      }),
    }),
    marker: Object.freeze({ inactive: 'nena', 'find-pipe': 'pipe', 'return-pipe': 'pipe', 'report-nena': 'nena' }),
    killTarget: null,
    completion: Object.freeze({
      body: 'Le llevaste la chancleta a Pipe y Doña Nena te dio la yapa. El barrio está agradecido.',
      bullets: Object.freeze(['+25 de yapa', 'Simulacro de terremoto desbloqueado']),
    }),
  }),

  'limpia-la-cancha': Object.freeze({
    id: 'limpia-la-cancha',
    category: 'crimen',
    title: 'Los matones de la plaza',
    description: 'Unos matones andan cobrando por la plaza de Los Andes. Pipe sabe dónde se paran.',
    initialStep: 'locked',
    startStep: 'deal',
    requires: Object.freeze({ mission: 'el-mandado', step: 'done' }),
    steps: Object.freeze({
      inactive: 'Habla con Pipe: los matones andan cobrando en la plaza.',
      deal: 'Encuentra y tumba a los matones de la plaza.',
      report: 'Vuelve con Pipe y cuéntale que la plaza quedó limpia.',
      done: 'La plaza quedó tranquila. El barrio ya te conoce.',
    }),
    order: Object.freeze(['deal', 'report', 'done']),
    actions: Object.freeze({
      startCrime: Object.freeze({ from: 'inactive', to: 'deal', toast: 'Nueva misión: Los matones de la plaza' }),
      reportCrime: Object.freeze({
        from: 'report',
        to: 'done',
        toast: '¡Misión completada!',
        reward: Object.freeze({ coins: 60, reputation: 10, xp: 80 }),
        kind: 'finish',
      }),
    }),
    collectibles: Object.freeze({}),
    marker: Object.freeze({ inactive: 'pipe', report: 'pipe', done: 'pipe' }),
    killTarget: Object.freeze({
      count: 3,
      from: 'deal',
      to: 'report',
      toast: 'La plaza quedó limpia. Vuelve con Pipe.',
    }),
    completion: Object.freeze({
      body: 'Tumbaste a los matones de la plaza y Pipe te pasó la voz al barrio. Aquí ya saben quién eres.',
      bullets: Object.freeze(['+60 de yapa', '+10 de reputación en el barrio']),
    }),
  }),

  'el-colapso': Object.freeze({
    id: 'el-colapso',
    category: 'historia',
    title: 'Capítulo III · El colapso',
    description: 'Algo raro se siente en San Miguelito. Cuando el barrio despierte, ya nada será igual.',
    initialStep: 'locked',
    startStep: 'survive',
    requires: Object.freeze({ mission: 'limpia-la-cancha', step: 'done' }),
    steps: Object.freeze({
      inactive: 'Algo raro se siente en el barrio.',
      survive: 'Sobrevive a los primeros infectados.',
      refugio: 'Corre a la fonda de Doña Nena.',
      done: 'Capítulo III completado. El barrio ya no es el mismo.',
    }),
    order: Object.freeze(['survive', 'refugio', 'done']),
    actions: Object.freeze({
      collapseStarts: Object.freeze({ from: 'inactive', to: 'survive', toast: 'CAPÍTULO III · EL COLAPSO' }),
      reachShelter: Object.freeze({
        from: 'refugio',
        to: 'done',
        toast: 'Capítulo III completado',
        kind: 'finish',
        reward: Object.freeze({ xp: 120 }),
        completion: Object.freeze({
          body: 'Llegaste a la fonda con Doña Nena. El barrio cambió, pero vos seguís vivo.',
          bullets: Object.freeze([
            'Sobreviviste al primer día',
            'Doña Nena te espera: el refugio es lo que sigue',
          ]),
        }),
      }),
    }),
    collectibles: Object.freeze({}),
    marker: Object.freeze({ inactive: 'nena', refugio: 'nena', done: 'nena' }),
    killTarget: Object.freeze({
      count: 5,
      from: 'survive',
      to: 'refugio',
      toast: 'La horda bajó. Corre a la fonda de Doña Nena.',
    }),
    completion: Object.freeze({
      body: 'Llegaste a la fonda con Doña Nena. El barrio cambió, pero vos seguís vivo.',
      bullets: Object.freeze(['Sobreviviste al primer día']),
    }),
  }),
  'el-ultimo-mandado': Object.freeze({
    id: 'el-ultimo-mandado',
    category: 'secundaria',
    title: 'El último mandado',
    description: 'Doña Nena necesita medicinas para el refugio.',
    initialStep: 'locked',
    startStep: 'find-medicina',
    requires: Object.freeze({ mission: 'el-colapso', step: 'done' }),
    steps: Object.freeze({
      inactive: 'Habla con Doña Nena: necesita medicinas para el refugio.',
      'find-medicina': 'Busca las medicinas cerca de la escuela.',
      deliver: 'Lleva las medicinas a Doña Nena.',
      done: 'Le llevaste medicinas al refugio. Doña Nena te lo agradece.',
    }),
    order: Object.freeze(['find-medicina', 'deliver', 'done']),
    actions: Object.freeze({
      startLastErand: Object.freeze({ from: 'inactive', to: 'find-medicina', toast: 'Nueva misión: El último mandado' }),
      finishLastErand: Object.freeze({
        from: 'deliver',
        to: 'done',
        toast: '¡Misión completada!',
        kind: 'finish',
        reward: Object.freeze({ coins: 80, xp: 90, contact: 'nena' }),
        completion: Object.freeze({
          body: 'Le llevaste las medicinas a Doña Nena. El refugio tiene lo básico gracias a vos.',
          bullets: Object.freeze(['+80 de yapa', '+90 XP', 'Contacto: Doña Nena']),
        }),
      }),
    }),
    collectibles: Object.freeze({
      medicina: Object.freeze({
        from: 'find-medicina',
        to: 'deliver',
        flag: 'hasMedicina',
        toast: 'Recogiste las medicinas. Llévalas al refugio.',
      }),
    }),
    marker: Object.freeze({ inactive: 'nena', 'find-medicina': 'nena', deliver: 'nena', done: 'nena' }),
    killTarget: null,
  }),

  'limpia-la-avenida': Object.freeze({
    id: 'limpia-la-avenida',
    category: 'supervivencia',
    title: 'La avenida está tomada',
    description: 'Don Chen necesita la avenida despejada para repartir comida.',
    initialStep: 'locked',
    startStep: 'deal',
    requires: Object.freeze({ mission: 'el-colapso', step: 'done' }),
    steps: Object.freeze({
      inactive: 'Habla con Don Chen en el minisúper.',
      deal: 'Elimina a los infectados de la avenida.',
      report: 'Vuelve con Don Chen.',
      done: 'La avenida está despejada. Chen puede repartir comida.',
    }),
    order: Object.freeze(['deal', 'report', 'done']),
    actions: Object.freeze({
      startAvenida: Object.freeze({ from: 'inactive', to: 'deal', toast: 'Nueva misión: La avenida está tomada' }),
      finishAvenida: Object.freeze({
        from: 'report',
        to: 'done',
        toast: '¡Misión completada!',
        kind: 'finish',
        reward: Object.freeze({ coins: 90, xp: 100, contact: 'chen' }),
        completion: Object.freeze({
          body: 'Despejaste la avenida y Don Chen ya puede mover la mercancía. El minisúper te lo debe.',
          bullets: Object.freeze(['+90 de yapa', '+100 XP', 'Contacto: Don Chen']),
        }),
      }),
    }),
    collectibles: Object.freeze({}),
    marker: Object.freeze({ inactive: 'chen', report: 'chen', done: 'chen' }),
    killTarget: Object.freeze({
      count: 6,
      from: 'deal',
      to: 'report',
      toast: 'La avenida está limpia. Vuelve con Don Chen.',
    }),
  }),
});

export const MISSION_ORDER = Object.freeze([
  'el-mandado',
  'limpia-la-cancha',
  'el-colapso',
  'el-ultimo-mandado',
  'limpia-la-avenida',
]);

// Compatibilidad con código/versiones anteriores que importaban MISSION.
export const MISSION = MISSIONS['el-mandado'];
export const MISSION_STEP_ORDER = MISSIONS['el-mandado'].order;
