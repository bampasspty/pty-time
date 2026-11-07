import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { CharacterScene } from './scenes/CharacterScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  banner: false,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
    powerPreference: 'low-power',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
      tileBias: 16,
      fps: 60,
    },
  },
  input: {
    activePointers: 3,
  },
  audio: {
    noAudio: true,
  },
  scene: [BootScene, TitleScene, CharacterScene, GameScene, UIScene],
};

async function boot() {
  try {
    await document.fonts.load('16px "Press Start 2P"');
    await document.fonts.ready;
  } catch {
    /* La fuente local debería estar disponible; el juego sigue con monospace. */
  }

  try {
    const game = new Phaser.Game(config);
    window.__PTY_GAME__ = game;
  } catch (error) {
    console.error('[PTY Time] Error al iniciar Phaser:', error);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.remove('hidden');
      loading.textContent = 'No se pudo iniciar PTY Time. Revisa la consola.';
    }
  }
}

boot();

window.addEventListener('error', (event) => {
  const loading = document.getElementById('loading');
  if (loading && !loading.classList.contains('hidden')) {
    loading.textContent = `Error: ${event.message}`;
  }
});
