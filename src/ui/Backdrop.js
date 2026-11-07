// Fondo pixel art generado por código para título y creación de personaje.
// Se cachea como textura 480x270 y se escala con nearest-neighbor.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ensureTitleBackdrop(scene) {
  const key = 'title-bg';
  if (scene.textures.exists(key)) return key;

  const W = 480;
  const H = 270;
  const tex = scene.textures.createCanvas(key, W, H);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const rand = mulberry32(20261106);

  const skyBands = ['#110f26', '#1d1738', '#2c1d4a', '#472657', '#6b3260', '#93425f', '#c25b5a', '#e77a54', '#f29b63'];
  const bandH = Math.ceil(180 / skyBands.length);
  skyBands.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * bandH, W, bandH + 1);
  });

  // Estrellas.
  ctx.fillStyle = '#fff4c2';
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rand() * W);
    const y = Math.floor(rand() * 130);
    const s = rand() > 0.85 ? 2 : 1;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // Sol tropical.
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(372, 118, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(372, 118, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(372, 118, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Nubes pixeladas.
  const cloud = (x, y, w) => {
    ctx.fillStyle = 'rgba(255, 214, 165, 0.22)';
    ctx.fillRect(x, y, w, 4);
    ctx.fillRect(x + 8, y - 4, w - 20, 4);
    ctx.fillRect(x + 18, y + 4, w - 34, 3);
  };
  cloud(40, 52, 76);
  cloud(220, 34, 58);
  cloud(300, 80, 46);

  // Cerros lejanos.
  ctx.fillStyle = '#2a2444';
  ctx.beginPath();
  ctx.moveTo(0, 178);
  ctx.lineTo(60, 142);
  ctx.lineTo(110, 170);
  ctx.lineTo(170, 132);
  ctx.lineTo(230, 174);
  ctx.lineTo(300, 148);
  ctx.lineTo(380, 176);
  ctx.lineTo(440, 150);
  ctx.lineTo(480, 172);
  ctx.lineTo(480, 214);
  ctx.lineTo(0, 214);
  ctx.closePath();
  ctx.fill();

  // Skyline de la ciudad.
  ctx.fillStyle = '#1b1b2b';
  const buildings = [
    [4, 166, 24, 58], [30, 180, 18, 44], [52, 158, 30, 66], [86, 174, 20, 50],
    [110, 162, 26, 62], [140, 184, 16, 40], [160, 150, 34, 74], [198, 170, 22, 54],
    [224, 160, 30, 64], [258, 178, 18, 46], [280, 148, 38, 76], [322, 168, 24, 56],
    [350, 158, 28, 66], [382, 176, 20, 48], [406, 154, 30, 70], [440, 168, 34, 56],
  ];
  for (const [x, y, w, h] of buildings) {
    ctx.fillStyle = '#1b1b2b';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#312c4f';
    ctx.fillRect(x + 2, y - 3, w - 4, 3);
    for (let wy = y + 6; wy < y + h - 4; wy += 8) {
      for (let wx = x + 4; wx < x + w - 4; wx += 7) {
        if (rand() > 0.55) {
          ctx.fillStyle = rand() > 0.4 ? '#ffd166' : '#f2994a';
          ctx.fillRect(wx, wy, 2, 3);
        }
      }
    }
  }

  // Antenas.
  ctx.fillStyle = '#1b1b2b';
  ctx.fillRect(174, 128, 2, 24);
  ctx.fillRect(296, 122, 2, 28);
  ctx.fillStyle = '#da291c';
  ctx.fillRect(295, 120, 4, 2);
  ctx.fillStyle = '#005293';
  ctx.fillRect(173, 126, 4, 2);

  // Palmeras en silueta.
  const palm = (x, baseY, scale = 1) => {
    ctx.strokeStyle = '#141225';
    ctx.fillStyle = '#141225';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + 6 * scale, baseY - 26 * scale, x + 2 * scale, baseY - 52 * scale);
    ctx.stroke();
    ctx.lineWidth = 1;
    const topY = baseY - 52 * scale;
    for (let a = 0; a < 7; a++) {
      const angle = (Math.PI * 2 * a) / 7 - Math.PI / 2;
      const len = (14 + (a % 2) * 6) * scale;
      ctx.beginPath();
      ctx.moveTo(x + 2 * scale, topY);
      ctx.quadraticCurveTo(
        x + 2 * scale + Math.cos(angle) * len * 0.6,
        topY + Math.sin(angle) * len * 0.6 - 4,
        x + 2 * scale + Math.cos(angle) * len,
        topY + Math.sin(angle) * len + 2
      );
      ctx.stroke();
    }
  };
  palm(28, 232, 1.1);
  palm(448, 238, 1.3);

  // Suelo y avenida.
  ctx.fillStyle = '#14251a';
  ctx.fillRect(0, 210, W, 60);
  ctx.fillStyle = '#0f1a13';
  ctx.fillRect(0, 236, W, 34);
  ctx.fillStyle = '#2f2f4a';
  ctx.fillRect(0, 232, W, 3);
  ctx.fillStyle = '#f2c94c';
  for (let x = 0; x < W; x += 22) ctx.fillRect(x, 252, 12, 2);
  ctx.fillStyle = '#2f2f4a';
  ctx.fillRect(0, 268, W, 2);

  // Luces de casa.
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 7; i++) {
    const x = 20 + i * 68;
    ctx.fillRect(x, 222 + (i % 2) * 8, 3, 3);
  }

  tex.refresh();
  return key;
}
