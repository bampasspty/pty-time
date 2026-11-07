// QA del Slice A (combate + enemigos + misión criminal + guardado v2).
// Requiere el servidor de desarrollo en http://127.0.0.1:5173 y Edge instalado.
//
// Uso:  node tools/qa-combat.mjs

import { chromium } from 'playwright-core';
import fs from 'node:fs';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://127.0.0.1:5173/';
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

async function enterGame() {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await sceneReady('Title');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
  await sceneReady('Character');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
  await sceneReady('Game');
  await page.waitForTimeout(1500);
}

const inGame = (fn, arg) =>
  page.evaluate(
    ({ source, arg }) => {
      const gs = window.__PTY_GAME__.scene.getScene('Game');
      // eslint-disable-next-line no-new-func
      const run = new Function('gs', 'arg', `return (${source})(gs, arg);`);
      return run(gs, arg);
    },
    { source: fn.toString(), arg },
  );

async function closeModal() {
  await page.evaluate(() => {
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    if (ui.modal?.isOpen) ui.modal.handleButton(0);
  });
  await page.waitForTimeout(300);
}

await enterGame();

// ---------------------------------------------------------------- estado base
const boot = await inGame((gs) => ({
  enemies: gs.enemies.length,
  alive: gs.enemies.filter((e) => !e.dead).length,
  ammo: gs.combat.loaded,
  reserve: gs.combat.reserve,
  hp: gs.combat.hp,
  mission: gs.mission.current,
  hud: gs.registry.get('hud'),
}));
check('se crean los 4 matones del mapa', boot.enemies === 4 && boot.alive === 4, JSON.stringify(boot));
check('el HUD trae vida y munición', boot.hud?.hp === 100 && boot.hud?.ammo === 8 && boot.hud?.reserve === 30);
check('la misión activa es el mandado', boot.mission === 'el-mandado');

await page.screenshot({ path: `${OUT}/combat-map.png` });

// ------------------------------------------------------------ apuntar y disparar
const shot = await inGame((gs) => {
  const enemy = gs.enemies[0];
  gs.player.setPosition(enemy.x - 64, enemy.y);
  gs.player.body.reset(enemy.x - 64, enemy.y);
  const angle = gs.angleTo(enemy.x, enemy.y - 10);
  gs.aimAngle = angle;
  const fired = gs.tryShoot(gs.time.now, angle);
  return { fired, ammo: gs.combat.loaded, enemyHp: enemy.hp };
});
await page.waitForTimeout(800);
const afterShot = await inGame((gs) => ({
  ammo: gs.combat.loaded,
  hit: gs.enemies.some((e) => e.hp < e.maxHp),
  hudAmmo: gs.registry.get('hud')?.ammo,
}));
check('disparar descuenta munición', shot.fired === true && afterShot.ammo === 7, JSON.stringify({ shot, afterShot }));
check('la bala golpea al matón', afterShot.hit === true);
check('el HUD refleja la munición', afterShot.hudAmmo === 7);

// recarga manual
const reload = await inGame((gs) => {
  gs.reloadWeapon();
  return { reloading: gs.combat.isReloadingAt(gs.time.now) };
});
await page.waitForTimeout(1100);
const afterReload = await inGame((gs) => ({ loaded: gs.combat.loaded, reserve: gs.combat.reserve }));
check('R/botón recarga el cargador', reload.reloading === true && afterReload.loaded === 8, JSON.stringify(afterReload));

// cambio de arma y línea de visión
const weapon = await inGame((gs) => {
  gs.toggleWeapon();
  const melee = { id: gs.combat.weaponId, hudWeapon: gs.registry.get('hud')?.weapon };
  gs.toggleWeapon();
  const pistol = { id: gs.combat.weaponId, hudWeapon: gs.registry.get('hud')?.weapon };
  return { melee, pistol };
});
check(
  'Q/botón ARMA alterna pistola y puño',
  weapon.melee.id === 'puno' && weapon.melee.hudWeapon === 'EL PUÑO' && weapon.pistol.id === 'pistola',
  JSON.stringify(weapon),
);

const los = await inGame((gs) => ({
  blocked: gs.hasLineOfSight(60, 250, 190, 250),
  clear: gs.hasLineOfSight(400, 350, 500, 350),
}));
check('la línea de visión detecta muros', los.blocked === false && los.clear === true, JSON.stringify(los));

// --------------------------------------------------- misión criminal completa
const crime = await inGame((gs) => {
  gs.handleMissionAction('startMission');
  gs.handleMissionAction('pipeMet');
  gs.mission.collectItem('chancla');
  gs.handleMissionAction('giveChancla');
  gs.handleMissionAction('finishMission');
  const mandado = {
    step: gs.mission.getState('el-mandado').step,
    coins: gs.mission.coins,
    drill: gs.mission.drillUnlocked,
    crimeStep: gs.mission.getState('limpia-la-cancha').step,
  };
  return mandado;
});
await closeModal();
const started = await inGame((gs) => {
  gs.handleMissionAction('startCrime');
  return {
    crimeStep: gs.mission.getState('limpia-la-cancha').step,
    alive: gs.enemies.filter((e) => !e.dead).length,
  };
});
check('el mandado termina y paga 25', crime.step === 'done' && crime.coins === 25 && crime.drill === true);
check('el crimen se abre al terminar el mandado', crime.crimeStep === 'inactive');
check('startCrime activa la misión y revive matones', started.crimeStep === 'deal' && started.alive === 4, JSON.stringify(started));

const kills = await inGame((gs) => {
  const fake = { damage: 999, kill() {} };
  for (const enemy of gs.enemies.slice(0, 3)) {
    if (!enemy.dead) gs.hitEnemy(fake, enemy);
  }
  return {
    step: gs.mission.getState('limpia-la-cancha').step,
    kills: gs.mission.getState('limpia-la-cancha').kills,
    defeats: gs.combat.defeats,
  };
});
check('tres matones avanzan la misión a report', kills.step === 'report' && kills.kills === 3, JSON.stringify(kills));
check('el contador de derrotas del HUD sube', kills.defeats === 3);

await page.screenshot({ path: `${OUT}/combat-crime.png` });

const finish = await inGame((gs) => {
  gs.handleMissionAction('reportCrime');
  return {
    step: gs.mission.getState('limpia-la-cancha').step,
    coins: gs.mission.coins,
    rep: gs.mission.reputation.barrio,
  };
});
await closeModal();
check('reportCrime paga 60 y da 10 de reputación', finish.step === 'done' && finish.coins === 85 && finish.rep === 10, JSON.stringify(finish));

// ------------------------------------------------------ daño, KO y reaparición
const down = await inGame((gs) => {
  gs.invulnUntil = 0;
  gs.damagePlayer(200);
  const ui = window.__PTY_GAME__.scene.getScene('UI');
  return { ko: gs.ko, hp: gs.combat.hp, modal: ui.modal.isOpen, title: ui.modal.data?.title };
});
check('la vida llega a cero y sale el modal de KO', down.ko === true && down.hp === 0 && down.modal === true, JSON.stringify(down));
await page.screenshot({ path: `${OUT}/combat-ko.png` });

await closeModal();
const respawn = await inGame((gs) => ({ ko: gs.ko, hp: gs.combat.hp }));
check('reaparece con vida completa', respawn.ko === false && respawn.hp === 100, JSON.stringify(respawn));

// -------------------------------------------------------- guardado v2 en disco
const saved = await inGame((gs) => {
  gs.persist();
  const raw = JSON.parse(window.localStorage.getItem('pty-time-save-v1'));
  return {
    version: raw.version,
    mandado: raw.missions?.['el-mandado']?.step,
    crime: raw.missions?.['limpia-la-cancha']?.step,
    coins: raw.wallet?.coins,
    defeats: raw.combat?.defeats,
  };
});
check(
  'guardado v2 con misiones, yapa y derrotas',
  saved.version === 2 && saved.mandado === 'done' && saved.crime === 'done' && saved.coins === 85 && saved.defeats === 3,
  JSON.stringify(saved),
);

// --------------------------------------------------------------- móvil táctil
const mobile = await browser.newContext({
  viewport: { width: 844, height: 390 },
  hasTouch: true,
  isMobile: true,
});
const mpage = await mobile.newPage();
mpage.on('pageerror', (e) => results.errors.push('mobile pageerror: ' + e.message));
mpage.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('favicon')) results.errors.push('mobile console: ' + m.text());
});
await mpage.goto(URL, { waitUntil: 'domcontentloaded' });
await mpage.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 60000 });
await mpage.waitForTimeout(900);
await mpage.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
await mpage.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Character'), { timeout: 20000 });
await mpage.waitForTimeout(400);
await mpage.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
await mpage.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Game'), { timeout: 20000 });
await mpage.waitForTimeout(1400);

const mobileUi = await mpage.evaluate(() => {
  const ui = window.__PTY_GAME__.scene.getScene('UI');
  return {
    fire: ui.fireButton.container.visible,
    reload: ui.reloadButton.container.visible,
    weapon: ui.weaponButton.container.visible,
    joystick: ui.joyBase.visible,
    firePos: { x: ui.fireButton.container.x, y: ui.fireButton.container.y },
  };
});
check(
  'controles táctiles de combate visibles',
  mobileUi.fire && mobileUi.reload && mobileUi.weapon && mobileUi.joystick,
  JSON.stringify(mobileUi),
);

const mobileBefore = await mpage.evaluate(() => {
  const gs = window.__PTY_GAME__.scene.getScene('Game');
  return { loaded: gs.combat.loaded, weapon: gs.combat.weaponId };
});
await mpage.touchscreen.tap(mobileUi.firePos.x, mobileUi.firePos.y);
await mpage.waitForTimeout(350);
const mobileAfter = await mpage.evaluate(() => {
  const gs = window.__PTY_GAME__.scene.getScene('Game');
  return { loaded: gs.combat.loaded, weapon: gs.combat.weaponId };
});
check(
  'tocar FUEGO dispara en el teléfono',
  mobileAfter.loaded === mobileBefore.loaded - 1,
  JSON.stringify({ mobileBefore, mobileAfter }),
);

const weaponPos = await mpage.evaluate(() => {
  const ui = window.__PTY_GAME__.scene.getScene('UI');
  return { x: ui.weaponButton.container.x, y: ui.weaponButton.container.y };
});
await mpage.touchscreen.tap(weaponPos.x, weaponPos.y);
await mpage.waitForTimeout(250);
const mobileWeapon = await mpage.evaluate(
  () => window.__PTY_GAME__.scene.getScene('Game').combat.weaponId,
);
check('tocar ARMA cambia de arma en el teléfono', mobileWeapon === 'puno', mobileWeapon);
await mpage.screenshot({ path: `${OUT}/combat-mobile.png` });

// frame rate aproximado en el mapa con enemigos
const fps = await page.evaluate(
  () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Math.round(window.__PTY_GAME__.loop.actualFps)), 1500);
    }),
);
check('FPS razonables en escritorio', fps >= 40, `${fps} fps`);

await browser.close();

const failed = results.checks.filter((c) => !c.ok);
console.log('');
console.log(`Checks: ${results.checks.length - failed.length}/${results.checks.length}`);
console.log(`Errores de consola: ${results.errors.length}`);
for (const error of results.errors) console.log('  -', error);
fs.writeFileSync(`${OUT}/combat-report.txt`, JSON.stringify(results, null, 2));
if (results.errors.length || failed.length) process.exitCode = 1;
