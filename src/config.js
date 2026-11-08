// Constantes visuales y de juego compartidas.
export const GAME_VERSION = '0.4.0';

export const WORLD = Object.freeze({
  tile: 16,
  speed: 92,
  runSpeed: 128,
  interactRadius: 34,
  cameraLerp: 0.12,
});

export const COLORS = Object.freeze({
  ink: 0x1b1b2b,
  panel: 0x0b1020,
  panelLight: 0x151b33,
  border: 0xffd166,
  yellow: 0xffd166,
  red: 0xda291c,
  blue: 0x005293,
  cyan: 0x56ccf2,
  green: 0x43a047,
  white: 0xffffff,
  gray: 0xa8b2c1,
});

export const FONT_FAMILY = '"Press Start 2P", "Lucida Console", monospace';

export const CSS = Object.freeze({
  ink: '#1b1b2b',
  panel: '#0b1020',
  border: '#ffd166',
  yellow: '#ffd166',
  red: '#da291c',
  blue: '#56ccf2',
  white: '#ffffff',
  soft: '#c9d1e6',
  green: '#7ee081',
  gray: '#8d99ae',
});

export function textStyle(size, color = CSS.white, extra = {}) {
  return {
    fontFamily: FONT_FAMILY,
    fontSize: `${Math.max(6, Math.round(size))}px`,
    color,
    align: 'left',
    lineSpacing: Math.max(4, Math.round(size * 0.7)),
    padding: { x: 0, y: 0 },
    ...extra,
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function uiScale(width, height) {
  return clamp(Math.min(width / 480, height / 270), 1, 2.4);
}

// Escala de cámara entera para mantener el pixel art nítido.
export function cameraZoom(width, height) {
  const raw = Math.min(width / 480, height / 270);
  return clamp(Math.ceil(raw), 2, 4);
}
