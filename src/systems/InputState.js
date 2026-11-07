// Estado de entrada compartido entre la escena de juego y los controles táctiles.
// moveX/moveY van de -1 a 1; crouch se mantiene mientras se presiona el botón.
export const inputState = {
  moveX: 0,
  moveY: 0,
  crouch: false,
  touchActive: false,
};

export function resetInput() {
  inputState.moveX = 0;
  inputState.moveY = 0;
  inputState.crouch = false;
  inputState.touchActive = false;
}
