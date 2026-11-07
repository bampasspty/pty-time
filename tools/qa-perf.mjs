import { chromium } from 'playwright-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function run(label, args) {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true, args });
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 45000 });
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Character'), { timeout: 15000 });
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Game'), { timeout: 15000 });
  const samples = [];
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(1200);
    samples.push(await page.evaluate(() => {
      const g = window.__PTY_GAME__;
      return { fps: Math.round(g.loop.actualFps), delta: Math.round(g.loop.delta), renderer: g.renderer.type };
    }));
  }
  console.log(label, JSON.stringify(samples), 'errors', errors);
  await browser.close();
}

await run('gpu-enabled', ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist']);
await run('swiftshader', ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']);
