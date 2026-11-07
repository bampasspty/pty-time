# PTY TIME · Esquema de contenido narrativo

Archivos a crear (solo esos):

- `src/data/npcs.js`
- `src/data/missions.js`
- `src/data/dialogues.js`
- `src/data/earthquake.js`

Contenido en **español panameño natural**, cálido y breve. Nada de caricaturas ni
estereotipos. Diálogos de 1-3 líneas por página, máximo 3 páginas por interacción.
El juego se llama PTY Time y transcurre en San Miguelito (San Isidro · Los Andes).

## `src/data/npcs.js`

```js
export const NPCS = {
  nena: {
    name: 'Doña Nena',
    role: 'Dueña de la fonda',
    sprite: 'npc-nena',       // debe existir en public/assets/characters/
    portrait: 'portrait-nena' // debe existir en public/assets/ui/portraits/
  },
  // pipe, chen, melva, kevin, yolanda, ana, chofer
};
```

Los 8 ids exactos: `nena`, `pipe`, `chen`, `melva`, `kevin`, `yolanda`, `ana`, `chofer`.

## `src/data/missions.js`

```js
export const MISSION = {
  id: 'el-mandado',
  title: 'El mandado de Doña Nena',
  description: 'Doña Nena necesita ayuda con un mandado y su nieto Pipe no aparece.',
  startStep: 'find-pipe',
  steps: {
    'find-pipe': 'Busca a Pipe en la cancha de San Isidro.',
    'find-chancla': 'Encuentra la chancleta de Pipe cerca de la parada de bus.',
    'return-pipe': 'Devuélvele la chancleta a Pipe en la cancha.',
    'report-nena': 'Regresa donde Doña Nena para contarle que todo está bien.',
    done: 'Misión completada. Simulacro de terremoto desbloqueado.',
  },
  // solo para el estado inicial, antes de hablar con Nena:
  availableObjective: 'Habla con Doña Nena en la fonda.',
  reward: { coins: 25, unlock: 'earthquake-drill' },
};

export const MISSION_STEP_ORDER = ['find-pipe', 'find-chancla', 'return-pipe', 'report-nena', 'done'];
```

## `src/data/dialogues.js`

Exporta **una función pura**:

```js
export function getDialogue(npcId, ctx) { ... }
```

`ctx`:

```js
{
  step: 'find-pipe' | 'find-chancla' | 'return-pipe' | 'report-nena' | 'done' | 'inactive',
  hasChancla: boolean,
  drillUnlocked: boolean,
}
```

Devuelve:

```js
{
  lines: [
    { speaker: 'Doña Nena', text: '...' },
    { speaker: 'Doña Nena', text: '...' },
  ],
  action: null // o uno de: 'startMission' | 'pipeMet' | 'giveChancla' | 'finishMission'
}
```

Reglas de acciones:

- `nena` con `ctx.step === 'inactive'` → acción `startMission`.
- `pipe` con `ctx.step === 'find-pipe'` → acción `pipeMet`.
- `pipe` con `ctx.step === 'return-pipe'` → acción `giveChancla`.
- `nena` con `ctx.step === 'report-nena'` → acción `finishMission`.
- Cualquier otro caso → `action: null`.

Contexto de ejemplo: la misión empieza con Nena pidiendo el mandado. Pipe está jugando
en la cancha y perdió una chancleta cerca de la parada de bus. El jugador la recoge, se
la devuelve y vuelve con Nena. Nena le da una "yapa" y le enseña lo básico del simulacro
de terremoto (que se desbloquea al terminar). Mensajes de Nena antes de terminar deben
recordar el objetivo actual sin repetir todo.

Diálogos por NPC (mínimo):

- `nena`: offer (inicio), waiting (cuando ya empezó pero falta), finish, after (misión hecha).
- `pipe`: first (find-pipe), waiting (find-chancla), return (return-pipe), after.
- `chen`: 2 páginas sobre el minisúper, la comunidad y algún dato curioso de San Miguelito.
- `melva`: 2 páginas sobre el bus, el metro y el tráfico; chisme amable.
- `kevin`: 2 páginas sobre la cancha y el barrio.
- `yolanda`: 2 páginas sobre la vida de barrio, el calor y las plantas.
- `ana`: 2 páginas sobre la escuela y cuidar el barrio.
- `chofer`: 2 páginas sobre el diablo rojo y la cultura del transporte.
- Si `drillUnlocked`, algunos NPCs pueden comentar el simulacro (opcional, 1 página).

## `src/data/earthquake.js`

```js
export const EARTHQUAKE = {
  title: 'Simulacro de terremoto',
  disclaimer: 'Evento simulado dentro del videojuego. No constituye una alerta real ni una advertencia de emergencia.',
  intro: 'Texto breve que explica que es un simulacro y pide buscar un lugar seguro.',
  steps: [
    'Agáchate, cúbrete la cabeza y el cuello, y sujétate de algo firme.',
    // 3-5 recomendaciones basadas en SINAPROC
  ],
  safeZoneHint: 'Busca un espacio abierto, lejos de edificios, postes y cables.',
  after: 'Texto de cierre: revisar, evacuar con calma, usar escaleras, seguir información oficial.',
  source: 'Basado en recomendaciones de SINAPROC (sinaproc.gob.pa/sismos).',
  sourceUrl: 'https://www.sinaproc.gob.pa/sismos/',
};
```

Las recomendaciones deben ser coherentes con SINAPROC: protegerse bajo/junto a un
elemento firme y cubrir cabeza y cuello; si está en la calle, alejarse de edificios,
postes y cables; después, evacuar con calma, usar escaleras (no ascensores), cortar
gas/electricidad solo si es seguro, usar linterna (no velas) y seguir reportes oficiales.
No inventar alertas ni magnitudes. No prometer predicción de sismos.

## Estilo

- Voz panameña cotidiana: "¿qué xopá?", "pelao", "yapa", "fonda", "chinito", "diablo rojo",
  "bus", "metro", "cancha", "barrio", "¿cómo va la cosa?"; sin exagerar ni ridiculizar.
- Trata a los personajes con respeto. Nada de política partidista.
- Textos cortos para pantalla móvil. Sin emojis.
