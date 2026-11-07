// Misión principal de PTY Time.
// El paso inicial es 'inactive' (antes de hablar con Doña Nena); al aceptar el
// mandado, el motor de juego usa MISSION.startStep y avanza con MISSION_STEP_ORDER.

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
