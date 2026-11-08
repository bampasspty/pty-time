# PTY TIME · Esquema de contenido narrativo

Archivos a crear (solo esos):

- `src/data/npcs.js`
- `src/data/missions.js`
- `src/data/dialogues.js`
- `src/data/earthquake.js`
- `src/data/weapons.js` (Slice A y Fase 3: catálogo de 6 armas con munición propia)
- `src/data/enemies.js` (Slice A: matones)
- `src/data/zombies.js` (Slice B: infectados)
- `src/data/items.js` (Slice B: inventario)
- `src/data/story.js` (Slice B: intro y colapso con PTY Alerta)

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

Desde v0.2.0 es un **registro de misiones**; el motor (`src/systems/MissionSystem.js`)
es genérico y no conoce ninguna misión concreta.

```js
export const MISSIONS = {
  'el-mandado': {
    id: 'el-mandado',
    category: 'secundaria',          // historia | secundaria | crimen | supervivencia | exploracion | evento
    title: 'El mandado de Doña Nena',
    description: '...',
    initialStep: 'inactive',         // 'locked' = se desbloquea con `requires`
    startStep: 'find-pipe',
    requires: null,                  // o { mission: 'el-mandado', step: 'done' }
    steps: { inactive: '...', 'find-pipe': '...', done: '...' },
    actions: {
      // acción que devuelve getDialogue -> transición de estado
      startMission: { from: 'inactive', to: 'find-pipe', toast: 'Nueva misión: ...' },
      finishMission: {
        from: 'report-nena', to: 'done',
        reward: { coins: 25, unlock: 'drill' }, // coins | reputation | unlock:'drill'
        kind: 'finish',                        // 'finish' muestra el modal de recompensa
      },
    },
    collectibles: {
      chancla: { from: 'find-chancla', to: 'return-pipe', flag: 'hasChancla', toast: '...' },
    },
    marker: { inactive: 'nena', 'find-pipe': 'pipe' }, // NPC de la estrella por paso
    killTarget: null,                                  // o { count, from, to, toast }
    completion: { body: '...', bullets: ['...'] },     // texto del modal al terminar
  },
  'limpia-la-cancha': {
    id: 'limpia-la-cancha',
    category: 'crimen',
    initialStep: 'locked',
    requires: { mission: 'el-mandado', step: 'done' },
    killTarget: { count: 3, from: 'deal', to: 'report', toast: '...' },
    // ... misma estructura
  },
};

export const MISSION_ORDER = ['el-mandado', 'limpia-la-cancha'];
```

El estado de cada misión (`step`, flags, `kills`, `completed`) se guarda en
`save.missions[id]`. `MISSION` y `MISSION_STEP_ORDER` se mantienen como alias de la
primera misión por compatibilidad.

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
  // misión criminal (v0.2.0): 'locked' | 'inactive' | 'deal' | 'report' | 'done'
  crimeStep: '...',
  // capítulo del colapso (v0.4.0): 'locked' | 'inactive' | 'survive' | 'refugio' | 'done'
  collapseStep: '...',
  kills: number,
}
```

Devuelve:

```js
{
  lines: [
    { speaker: 'Doña Nena', text: '...' },
    { speaker: 'Doña Nena', text: '...' },
  ],
  // o una acción del registro de misiones:
  action: null // 'startMission' | 'pipeMet' | 'giveChancla' | 'finishMission'
               // | 'startCrime' | 'reportCrime'
}
```

Reglas de acciones:

- `nena` con `ctx.step === 'inactive'` → acción `startMission`.
- `pipe` con `ctx.step === 'find-pipe'` → acción `pipeMet`.
- `pipe` con `ctx.step === 'return-pipe'` → acción `giveChancla`.
- `nena` con `ctx.step === 'report-nena'` → acción `finishMission`.
- `pipe` con `ctx.step === 'done'` y `ctx.crimeStep === 'inactive'` → acción `startCrime`.
- `pipe` con `ctx.crimeStep === 'report'` → acción `reportCrime`.
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

## `src/data/story.js`, `src/data/items.js` y `src/data/zombies.js`

- **`story.js`**: secuencias narrativas como listas de páginas (`intro`, `collapse`).
  Cada página: `{ title, body, bullets?, disclaimer? }`. Las alertas del apocalipsis son
  ficción y **siempre** llevan el disclaimer: «Alerta ficticia del videojuego. No es un
  aviso oficial ni información real de emergencia.». Nunca se presentan como avisos
  oficiales ni usan datos reales de emergencia.
- **`items.js`**: objetos del inventario con `category`, `stack`, `sprite` y efecto
  (`heal`, `ammo`). Iniciales: `vendaje`, `lata`, `balas9`; `STARTING_INVENTORY` y
  `INVENTORY_SLOTS`.
- **`zombies.js`**: tipos de zombi con `behavior: 'zombie'` (detectan sin línea de visión
  y persiguen), `maxHp`, `speed`, `damage`, `attackCooldownMs`, `alertNoise` y `sprite`.

## `src/data/missions.js` (registro completo)

Además de `el-mandado` y `limpia-la-cancha`, el registro incluye **`el-colapso`**
(categoría `historia`): se abre al terminar la misión criminal, `killTarget` de 5
infectados hasta el paso `refugio`, y `reachShelter` cierra el capítulo. El motor no
cambia: solo se añade la definición y `MISSION_ORDER` la incluye.

## Estilo

- Voz panameña cotidiana: "¿qué xopá?", "pelao", "yapa", "fonda", "chinito", "diablo rojo",
  "bus", "metro", "cancha", "barrio", "¿cómo va la cosa?"; sin exagerar ni ridiculizar.
- Trata a los personajes con respeto. Nada de política partidista.
- Textos cortos para pantalla móvil. Sin emojis.
