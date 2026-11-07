// Verificación de la build PÚBLICA de Vercel (no requiere servidor local).
//
// Uso:  node tools/qa-prod.mjs

import { chromium } from 'playwright-core';
import fs from 'node:fs';

const URL = process.env.PTY_URL ?? 'https://pty-time.vercel.app/';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = 'qa';
fs.mkdirSync(OUT, { recursive: true });

const results = { errors: [], checks: [] };
const check = (name, ok, detail = '') => {
  results.checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on('pageerror', (e) => results.errors.push('pageerror: ' + (e.stack ?? e.message)));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('favicon')) results.errors.push('console: ' + m.text());
});

const sceneReady = (key) =>
  page.waitForFunction(
    (k) => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === k),
    key,
    { timeout: 60000 },
  );

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await sceneReady('Title');
await page.waitForTimeout(1000);

const title = await page.evaluate(() => {
  const t = window.__PTY_GAME__.scene.getScene('Title');
  return { footer: t.footer.text, tagline: t.tagline.text, hasSave: t.hasSave };
});
check('producción sirve la v0.3', title.footer.includes('v0.3'), JSON.stringify(title));
check('tagline de Calito', title.tagline.includes('Calito'), title.tagline);
await page.screenshot({ path: `${OUT}/prod-title.png` });

await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
await sceneReady('Character');
await page.waitForTimeout(500);
const character = await page.evaluate(() => {
  const c = window.__PTY_GAME__.scene.getScene('Character');
  return { title: c.title.text, variant: c.variant };
});
check('pantalla de Calito (apariencia)', character.title === 'CALITO' && character.variant === 'm-blue', JSON.stringify(character));
await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
await sceneReady('Game');
await page.waitForTimeout(1500);

const game = await page.evaluate(() => {
  const gs = window.__PTY_GAME__.scene.getScene('Game');
  return {
    enemies: gs.enemies.length,
    alive: gs.enemies.filter((e) => !e.dead).length,
    hud: gs.registry.get('hud'),
    losWorks: gs.hasLineOfSight(60, 250, 190, 250) === false,
  };
});
check('4 matones en producción', game.enemies === 4 && game.alive === 4, JSON.stringify({ enemies: game.enemies }));
check('HUD de combate en producción', game.hud?.hp === 100 && game.hud?.ammo === 8 && game.hud?.reserve === 30);
check('línea de visión activa en producción', game.losWorks === true);

const shot = await page.evaluate(() => {
  const gs = window.__PTY_GAME__.scene.getScene('Game');
  const ammoBefore = gs.combat.loaded;
  gs.tryShoot(gs.time.now, gs.angleTo(gs.player.x + 100, gs.player.y));
  return { ammoBefore, ammoAfter: gs.combat.loaded };
});
check('disparo funciona en producción', shot.ammoAfter === shot.ammoBefore - 1, JSON.stringify(shot));

await page.screenshot({ path: `${OUT}/prod-combat.png` });
const fps = await page.evaluate(
  () => new Promise((resolve) => setTimeout(() => resolve(Math.round(window.__PTY_GAME__.loop.actualFps)), 1500)),
);
check('FPS producción aceptables', fps >= 40, `${fps} fps`);

// ------------------------------------------------ emulación de gama baja
// Viewport de teléfono horizontal + CPU 4x más lenta (aproxima un móvil económico).
const lowCtx = await browser.newContext({
  viewport: { width: 844, height: 390 },
  hasTouch: true,
  isMobile: true,
});
const lowPage = await lowCtx.newPage();
lowPage.on('pageerror', (e) => results.errors.push('low-end pageerror: ' + (e.stack ?? e.message)));
lowPage.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('favicon')) results.errors.push('low-end console: ' + m.text());
});
const cdp = await lowCtx.newCDPSession(lowPage);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await lowPage.goto(URL, { waitUntil: 'domcontentloaded' });
await lowPage.waitForFunction(
  () => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'),
  { timeout: 90000 },
);
await lowPage.waitForTimeout(1200);
await lowPage.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
await lowPage.waitForFunction(
  () => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Character'),
  { timeout: 30000 },
);
await lowPage.waitForTimeout(600);
await lowPage.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
await lowPage.waitForFunction(
  () => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Game'),
  { timeout: 30000 },
);
await lowPage.waitForTimeout(2000);

const lowEnd = await lowPage.evaluate(
  () =>
    new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - start > 2500) {
          resolve({
            fps: Math.round(window.__PTY_GAME__.loop.actualFps),
            frames,
            enemies: window.__PTY_GAME__.scene.getScene('Game').enemies.length,
            touch: window.__PTY_GAME__.scene.getScene('UI').isTouch,
          });
        } else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }),
);
check(
  'gama baja emulada (CPU 4x, 844×390) se mantiene jugable',
  lowEnd.fps >= 25 && lowEnd.enemies === 4,
  JSON.stringify(lowEnd),
);
await lowPage.screenshot({ path: `${OUT}/prod-lowend.png` });
await lowCtx.close();

await browser.close();
const failed = results.checks.filter((c) => !c.ok);
console.log('');
console.log(`Checks: ${results.checks.length - failed.length}/${results.checks.length} · errores de consola: ${results.errors.length}`);
for (const error of results.errors) console.log('  -', error);
fs.writeFileSync(`${OUT}/prod-report.txt`, JSON.stringify({ url: URL, ...results }, null, 2));
if (results.errors.length || failed.length) process.exitCode = 1;
