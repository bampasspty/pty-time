// Diálogos de PTY Time.
//
// getDialogue(npcId, ctx) es una función PURA: no guarda estado, no modifica ctx
// y siempre devuelve la misma respuesta para el mismo npcId + ctx.
// El motor de juego aplica la acción devuelta y avanza el paso de la misión:
//   startMission  -> arranca "El mandado de Doña Nena" (find-pipe)
//   pipeMet       -> pipe ya contó lo de la chancleta (find-chancla)
//   giveChancla   -> pipe recuperó su chancleta (report-nena)
//   finishMission -> nena da la yapa y desbloquea el simulacro (done)
//
// Formato: 1-3 líneas (páginas) por interacción, frases cortas para pantalla móvil.

import { NPCS } from './npcs.js';

const STEPS = new Set([
  'inactive',
  'find-pipe',
  'find-chancla',
  'return-pipe',
  'report-nena',
  'done',
]);

// Paso de la misión criminal ("Los matones de la plaza"). 'locked' = todavía
// no está disponible; 'unknown' = contexto incompleto o inválido.
const CRIME_STEPS = new Set(['locked', 'inactive', 'deal', 'report', 'done']);

// Una "página" de diálogo.
const page = (speaker, text) => ({ speaker, text });

// Respuesta completa. action === null cuando no hay nada que ejecutar.
const reply = (lines, action = null) => ({ lines, action });

// Normaliza el contexto sin mutarlo. Un step desconocido se trata como neutro:
// da conversación normal pero NUNCA dispara una acción de misión.
function normalizeContext(ctx) {
  const raw = ctx && typeof ctx === 'object' ? ctx : {};
  return {
    step: STEPS.has(raw.step) ? raw.step : 'unknown',
    hasChancla: raw.hasChancla === true,
    drillUnlocked: raw.drillUnlocked === true,
    crimeStep: CRIME_STEPS.has(raw.crimeStep) ? raw.crimeStep : 'unknown',
    kills: Number.isFinite(raw.kills) ? Math.max(0, Math.floor(raw.kills)) : 0,
  };
}

function nenaDialogue(ctx) {
  const speaker = NPCS.nena.name;

  if (ctx.step === 'inactive') {
    return reply(
      [
        page(speaker, '¿Cómo va la cosa, mijo? ¿Me puedes hacer un mandado?'),
        page(speaker, 'Pipe salió para la cancha y no ha vuelto. Ve a buscarlo, que la comida se enfría.'),
      ],
      'startMission',
    );
  }

  if (ctx.step === 'find-pipe') {
    return reply([
      page(speaker, 'Pipe está en la cancha de San Isidro, con los pelaos.'),
      page(speaker, 'Dile que venga, o que por lo menos avise.'),
    ]);
  }

  if (ctx.step === 'find-chancla') {
    if (ctx.hasChancla) {
      return reply([
        page(speaker, '¿Esa es la chancleta de Pipe? Llévasela, que ese pelao anda descalzo.'),
      ]);
    }
    return reply([
      page(speaker, '¿Se le perdió la chancleta? Búscala cerca de la parada de bus.'),
      page(speaker, 'Ese muchacho pierde hasta la sombra.'),
    ]);
  }

  if (ctx.step === 'return-pipe') {
    return reply([
      page(speaker, 'Devuélvele la chancleta a Pipe, que no ande descalzo por la calle.'),
      page(speaker, 'Después vienes, que te tengo algo.'),
    ]);
  }

  if (ctx.step === 'report-nena') {
    return reply(
      [
        page(speaker, '¿Ya está todo? Bendito sea. Siéntate, que te tengo tu yapa.'),
        page(speaker, 'Y te enseño lo del simulacro: agacharse, cubrirse y sujetarse.'),
      ],
      'finishMission',
    );
  }

  if (ctx.step === 'done') {
    return reply([
      page(speaker, 'Ese mandado te quedó bien, mijo. La yapa fue bien ganada.'),
      page(
        speaker,
        ctx.drillUnlocked
          ? 'Cuando quieras practicamos el simulacro. Aquí te espero.'
          : 'Si necesitas algo, aquí estoy.',
      ),
    ]);
  }

  return reply([page(speaker, 'Aquí estoy, mijo. Si necesitas algo, me dices.')]);
}

function pipeDialogue(ctx) {
  const speaker = NPCS.pipe.name;

  if (ctx.step === 'find-pipe') {
    return reply(
      [
        page(speaker, '¡Epa! ¿Tú eres el que ayuda a mi abuela?'),
        page(speaker, 'Me pelé la chancleta. Se me cayó cerca de la parada de bus.'),
        page(speaker, 'Búscala, ¿sí? No quiero volver descalzo.'),
      ],
      'pipeMet',
    );
  }

  if (ctx.step === 'find-chancla') {
    return reply([
      page(speaker, '¿Ya la encontraste? Busca bien cerca de la parada, entre la grama.'),
      page(speaker, 'Si la ves, tráemela. Aquí el piso quema.'),
    ]);
  }

  if (ctx.step === 'return-pipe') {
    return reply(
      [
        page(speaker, '¡Ahí está mi chancleta! ¿Dónde estaba?'),
        page(speaker, 'Gracias, socio. Dile a mi abuela que ahora voy.'),
      ],
      'giveChancla',
    );
  }

  if (ctx.step === 'report-nena') {
    return reply([
      page(speaker, '¿Vas donde mi abuela? Dile que ya voy, que estoy terminando el picado.'),
    ]);
  }

  if (ctx.step === 'done') {
    if (ctx.crimeStep === 'inactive') {
      return reply(
        [
          page(speaker, 'Oye, socio… ¿tú no andas buscando cómo hacerte de algo?'),
          page(speaker, 'Unos matones se están parando en la plaza de Los Andes. Cobran hasta por pasar.'),
          page(speaker, 'Si los sacas de ahí, el barrio te lo agradece. Y te sueltan alguito.'),
        ],
        'startCrime',
      );
    }

    if (ctx.crimeStep === 'deal') {
      return reply([
        page(speaker, '¿Todavía están esos matones en la plaza? Mira que son varios.'),
        page(speaker, 'Dale con cuidado, socio. Pero no te me achiques.'),
      ]);
    }

    if (ctx.crimeStep === 'report') {
      return reply(
        [
          page(speaker, '¿Ya limpiaste la plaza? ¡Epa! No me lo esperaba tan rápido.'),
          page(speaker, 'Toma, esto es tuyo. Y de aquí en adelante, aquí tienes un socio.'),
        ],
        'reportCrime',
      );
    }

    if (ctx.crimeStep === 'done') {
      return reply([
        page(speaker, 'En la plaza ya no se para nadie. La gente volvió a pasar tranquila.'),
        page(speaker, 'Se corrió la voz, socio. Aquí ya saben quién eres.'),
      ]);
    }

    return reply([
      page(speaker, 'Gracias otra vez, socio. Un día de estos jugamos un picado.'),
      page(
        speaker,
        ctx.drillUnlocked
          ? 'Y ya sé: agacharse, cubrirse y sujetarse. Lo practiqué.'
          : 'Si mi abuela te manda otro mandado, me avisas.',
      ),
    ]);
  }

  if (ctx.step === 'inactive') {
    return reply([page(speaker, '¿Qué xopá? Aquí andamos, matando el rato en la cancha.')]);
  }

  return reply([page(speaker, '¿Qué xopá? Aquí andamos, en la cancha.')]);
}

// Vecinos del barrio: dos páginas fijas de conversación; si la misión está activa
// pueden soltar una pista del paso actual y, ya desbloqueado el simulacro, un
// comentario sobre el simulacro. Nunca pasan de 3 páginas.
const NEIGHBORS = {
  chen: {
    base: [
      'Aquí todo se consigue: el pan, el jabón y hasta el chisme del día.',
      'San Miguelito es de los lugares más poblados del país. Por eso este minisúper nunca cierra temprano.',
    ],
    hints: {
      'find-pipe': 'Pipe pasó por aquí y se fue con un jugo para la cancha.',
      'find-chancla': 'Oye, vi algo tirado cerca de la parada de bus. Ve a ver.',
    },
    crimeHints: {
      deal: 'La plaza está mala desde que llegaron esos tipos. Ten cuidado, mijo.',
    },
    drill: 'Y cuando suene el simulacro: agáchate, cúbrete y sujétate. Aquí nos ayudamos.',
  },
  melva: {
    base: [
      'Ay, mijo, el bus viene lleno y el metro ni se diga. Una sale apretando la cartera.',
      'Pero no me quejo: aquí una llega a la casa y el barrio la saluda.',
    ],
    hints: {
      'find-pipe': '¿Buscas a Pipe? Lo vi corriendo para la cancha, con una chancleta menos.',
      'find-chancla': 'Una chancleta en la parada de bus. Cosas de pelao.',
    },
    crimeHints: {
      deal: 'Esos matones de la plaza no dejan ni pasar. Yo ya no voy por ahí con la cartera.',
    },
    drill: 'Eso sí, si tiembla no corras por las escaleras mecánicas. Con calma.',
  },
  kevin: {
    base: [
      'La cancha es lo mejor del barrio. Si no hay balón, se juega con una lata.',
      'Todos los días caemos aquí después de la escuela.',
    ],
    hints: {
      'find-pipe': 'Pipe está allá, tirando al aro. Está de mal humor por la chancleta.',
      'find-chancla': 'Yo vi una chancleta cerca de la parada. No la toqué, por si acaso.',
    },
    crimeHints: {
      deal: 'Los matones de la plaza me quitaron el balón. Si los sacas, te lo agradezco.',
    },
    drill: 'Yo ya practiqué: agacharse, cubrirse y sujetarse. Me salió bien.',
  },
  yolanda: {
    base: [
      'Aquí el calor pega duro, pero mis plantas aguantan. Riego temprano y a la sombra.',
      'Cuando se va la luz, todo el mundo saca la silla a la puerta. Así es el barrio.',
    ],
    hints: {
      'find-pipe': 'Pipe anda en la cancha. Ese pelao no se pierde un picado.',
      'report-nena': '¿Ya terminaste el mandado? Pasa donde Nena, que te tiene tu yapa.',
    },
    crimeHints: {
      deal: 'Yo ya no paso por la plaza con la cartera. Ojalá alguien les ponga freno.',
    },
    drill: 'Ten a mano una linterna, no velas. Eso lo aprendí en el simulacro.',
  },
  ana: {
    base: [
      'En la escuela les enseño a querer el barrio. Recoger la basura también es quererlo.',
      'Los muchachos aprenden rápido. A veces nos enseñan ellos a nosotros.',
    ],
    hints: {
      'find-pipe': 'Los pelaos están en la cancha. A esta hora todavía andan por allá.',
    },
    drill: 'Y no se olviden del simulacro: cubrirse la cabeza y el cuello.',
  },
  chofer: {
    base: [
      'El diablo rojo no es solo un bus, es parte del barrio. Cada uno tiene su nombre y su historia.',
      'Yo llevo gente desde las cinco de la mañana. Y a veces traigo la rumba de vuelta.',
    ],
    hints: {
      'find-chancla': 'En la parada siempre se pierde algo. Busque bien, que la ruta es larga.',
    },
    drill: 'Si tiembla, el bus se para y uno se baja con calma. Nada de correr.',
  },
};

function neighborDialogue(npcId, ctx) {
  const character = NEIGHBORS[npcId];
  const speaker = NPCS[npcId].name;
  const lines = character.base.map((text) => page(speaker, text));

  const hint = character.hints[ctx.step];
  if (hint) {
    lines.push(page(speaker, hint));
  } else if (ctx.drillUnlocked && character.drill) {
    lines.push(page(speaker, character.drill));
  }

  // Pista de la misión criminal mientras está activa (nunca pasa de 3 páginas).
  const crimeHint = character.crimeHints?.[ctx.crimeStep];
  if (crimeHint && lines.length < 3) {
    lines.push(page(speaker, crimeHint));
  }

  return reply(lines);
}

export function getDialogue(npcId, ctx) {
  const state = normalizeContext(ctx);

  switch (npcId) {
    case 'nena':
      return nenaDialogue(state);
    case 'pipe':
      return pipeDialogue(state);
    case 'chen':
    case 'melva':
    case 'kevin':
    case 'yolanda':
    case 'ana':
    case 'chofer':
      return neighborDialogue(npcId, state);
    default:
      // NPC desconocido: respuesta vacía y sin acción, nunca undefined.
      return reply([]);
  }
}
