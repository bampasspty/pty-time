import { chromium } from 'playwright-core';
import fs from 'node:fs';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = process.env.PTY_URL ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const errors = [];
const failed = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 45000 });
await page.waitForTimeout(1000);
const title = await page.evaluate(() => {
  const g = window.__PTY_GAME__;
  return {
    scenes: g.scene.getScenes(true).map((s) => s.scene.key),
    textures: g.textures.getTextureKeys().length,
    font: getComputedStyle(document.body).fontFamily,
    hasLogo: g.textures.exists('logo'),
    hasPlayer: g.textures.exists('player-m-blue'),
  };
});
await page.screenshot({ path: 'qa/prod-title.png' });
await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Character'), { timeout: 15000 });
await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Game'), { timeout: 15000 });
await page.waitForTimeout(1600);
const game = await page.evaluate(() => {
  const g = window.__PTY_GAME__;
  const gs = g.scene.getScene('Game');
  return {
    player: { x: gs.player.x, y: gs.player.y },
    npcs: gs.npcs.length,
    colliders: gs.mapBuilder.colliders.length,
    mission: gs.mission.step,
    fps: Math.round(g.loop.actualFps),
    textures: g.textures.getTextureKeys().length,
  };
});
await page.screenshot({ path: 'qa/prod-game.png' });
console.log(JSON.stringify({ title, game, failed, errors }, null, 2));
await browser.close();
if (errors.length || failed.length) process.exitCode = 1;
