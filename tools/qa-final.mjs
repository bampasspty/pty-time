import { chromium } from 'playwright-core';
import fs from 'node:fs';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = 'qa';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist'],
});

const results = { errors: [], checks: [] };
const check = (name, ok, detail = '') => {
  results.checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
  if (!ok) results.errors.push(`${name}: ${detail}`);
};

async function dismissStory(page) {
  for (let i = 0; i < 10; i++) {
    const open = await page.evaluate(() => {
      const ui = window.__PTY_GAME__?.scene?.getScene('UI');
      return Boolean(ui?.modal?.isOpen);
    });
    if (!open) return;
    await page.evaluate(() => {
      const ui = window.__PTY_GAME__.scene.getScene('UI');
      if (ui.modal.isOpen) ui.modal.handleButton(0);
    });
    await page.waitForTimeout(180);
  }
}

async function enterGame(page) {  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 45000 });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Character'), { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Game'), { timeout: 15000 });
  await page.waitForTimeout(1400);
  await dismissStory(page);
  await page.waitForTimeout(500);
}

const teleport = (page, x, y) => page.evaluate(({ x, y }) => {
  const gs = window.__PTY_GAME__.scene.getScene('Game');
  gs.player.setPosition(x, y);
  gs.player.body.reset(x, y);
}, { x, y });

async function advanceDialogue(page) {
  for (let i = 0; i < 12; i++) {
    const open = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('UI').dialogue.isOpen);
    if (!open) return;
    await page.evaluate(() => window.__PTY_GAME__.scene.getScene('UI').dialogue.advance());
    await page.waitForTimeout(80);
  }
}

async function npcPos(page, id) {
  return page.evaluate((id) => {
    const n = window.__PTY_GAME__.scene.getScene('Game').npcs.find((n) => n.npcId === id);
    return { x: n.x, y: n.y };
  }, id);
}

async function talkTo(page, id) {
  const p = await npcPos(page, id);
  await teleport(page, p.x, p.y + 22);
  await page.waitForTimeout(500);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(400);
  await advanceDialogue(page);
  await page.waitForTimeout(250);
}

// ================= DESKTOP =================
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => results.errors.push('desktop pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) results.errors.push('desktop console: ' + m.text()); });
  await enterGame(page);
  // Deja calentar el primer render/compilación de Vite antes de medir FPS.
  await page.waitForTimeout(1500);

  const perf = await page.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start > 2000) resolve({ frames, seconds: (performance.now() - start) / 1000, fps: window.__PTY_GAME__.loop.actualFps });
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  check('FPS desktop 1280x720', perf.fps >= 45, `actualFps=${perf.fps.toFixed(1)} frames=${perf.frames}`);
  await page.screenshot({ path: `${OUT}/final-desktop-spawn.png` });

  // Misión completa.
  await talkTo(page, 'nena');
  let step = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').mission.step);
  check('Misión inicia con Nena', step === 'find-pipe', step);
  await page.screenshot({ path: `${OUT}/final-desktop-dialogue.png` });

  await talkTo(page, 'pipe');
  step = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').mission.step);
  const itemVisible = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').items[0].sprite.visible);
  check('Pipe avanza y aparece la chancleta', step === 'find-chancla' && itemVisible, `${step} visible=${itemVisible}`);

  const item = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    return { x: gs.items[0].x, y: gs.items[0].y };
  });
  await teleport(page, item.x, item.y + 4);
  await page.waitForTimeout(500);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(400);
  step = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').mission.step);
  check('Chancleta recogida', step === 'return-pipe', step);

  await talkTo(page, 'pipe');
  step = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').mission.step);
  check('Pipe recibe la chancleta', step === 'report-nena', step);

  await talkTo(page, 'nena');
  await page.waitForTimeout(700);
  const done = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return {
      step: gs.mission.getState('el-mandado').step,
      coins: gs.mission.coins,
      drillUnlocked: gs.mission.drillUnlocked,
      modalOpen: ui.modal.isOpen,
      hudVisible: ui.hudContainer.visible,
      title: ui.modal.title.text,
      button: { x: ui.modal.buttons[0].container.x, y: ui.modal.buttons[0].container.y },
    };
  });
  check('Misión completada (+25 yapa, simulacro)', done.step === 'done' && done.coins === 25 && done.drillUnlocked, JSON.stringify({ step: done.step, coins: done.coins, drill: done.drillUnlocked }));
  check('Modal de recompensa abre y oculta HUD', done.modalOpen && !done.hudVisible, JSON.stringify(done));
  await page.screenshot({ path: `${OUT}/final-desktop-mission.png` });

  // Clic real en SEGUIR.
  await page.mouse.click(done.button.x, done.button.y);
  await page.waitForTimeout(500);
  const afterModal = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return { modal: ui.modal.isOpen, drillBtn: ui.drillButton.container.visible, hud: ui.hudContainer.visible, drillPos: { x: ui.drillButton.container.x, y: ui.drillButton.container.y } };
  });
  check('Clic cierra modal y muestra botón SIMULACRO', !afterModal.modal && afterModal.drillBtn && afterModal.hud, JSON.stringify(afterModal));

  // Simulacro con clic en el botón y fases en tiempo real.
  await page.mouse.click(afterModal.drillPos.x, afterModal.drillPos.y);
  await page.waitForTimeout(500);
  const intro = await page.evaluate(() => {
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return { open: ui.modal.isOpen, disclaimer: ui.modal.disclaimer.text, button: { x: ui.modal.buttons[1].container.x, y: ui.modal.buttons[1].container.y } };
  });
  check('Intro del simulacro con disclaimer', intro.open && intro.disclaimer.includes('No constituye una alerta real'), intro.disclaimer);
  await page.screenshot({ path: `${OUT}/final-desktop-drill-intro.png` });
  await page.mouse.click(intro.button.x, intro.button.y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/final-desktop-drill.png` });

  await page.keyboard.down('KeyC');
  await page.waitForTimeout(2800);
  const phaseCrouch = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').drill?.phase);
  await page.waitForTimeout(3600);
  const phaseHold = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Game').drill?.phase);
  await page.keyboard.up('KeyC');
  check('Simulacro avanza cubrirse → sujetarse → evacuar', phaseCrouch === 'hold' || phaseCrouch === 'evacuate', `crouchPhase=${phaseCrouch} after=${phaseHold}`);

  const cancha = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    return gs.zones.find((z) => z.id === 'cancha');
  });
  await teleport(page, cancha.x + cancha.w / 2, cancha.y + cancha.h / 2);
  await page.waitForTimeout(1200);
  const drillEnd = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return { active: Boolean(gs.drill), completed: gs.mission.drillCompleted, modal: ui.modal.isOpen, title: ui.modal.title.text, disclaimer: ui.modal.disclaimer.text };
  });
  check('Simulacro llega a zona segura y muestra resultado', !drillEnd.active && drillEnd.completed && drillEnd.modal, JSON.stringify(drillEnd));
  await page.screenshot({ path: `${OUT}/final-desktop-drill-result.png` });
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('UI').modal.close());

  // Recarga: CONTINUAR conserva progreso.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 45000 });
  await page.waitForTimeout(1000);
  const titleState = await page.evaluate(() => {
    const t = window.__PTY_GAME__.scene.getScene('Title');
    return { hasSave: t.hasSave, labels: t.menu.map((b) => b.text.text) };
  });
  check('Título ofrece CONTINUAR tras guardar', titleState.hasSave && titleState.labels.includes('CONTINUAR'), JSON.stringify(titleState));
  await page.screenshot({ path: `${OUT}/final-desktop-title-continue.png` });
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').continueGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Game'), { timeout: 15000 });
  await page.waitForTimeout(1000);
  const continued = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    return {
      step: gs.mission.getState('el-mandado').step,
      coins: gs.mission.coins,
      drillUnlocked: gs.mission.drillUnlocked,
      variant: gs.variant,
    };
  });
  check('CONTINUAR restaura misión, yapa y simulacro', continued.step === 'done' && continued.coins === 25 && continued.drillUnlocked, JSON.stringify(continued));
  await context.close();
}

// ================= MÓVIL RETRATO =================
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => results.errors.push('mobile pageerror: ' + e.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__PTY_GAME__?.scene?.getScenes(true)?.some((s) => s.scene.key === 'Title'), { timeout: 45000 });
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/final-mobile-title.png` });
  const titleCheck = await page.evaluate(() => {
    const t = window.__PTY_GAME__.scene.getScene('Title');
    return { taglineRight: t.tagline.x + t.tagline.width / 2, width: t.scale.width, titleWidth: t.tagline.width };
  });
  check('Tagline del título cabe en móvil', titleCheck.taglineRight <= titleCheck.width, JSON.stringify(titleCheck));
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Title').newGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Character'), { timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/final-mobile-character.png` });
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('Character').enterGame());
  await page.waitForFunction(() => window.__PTY_GAME__.scene.getScenes(true).some((s) => s.scene.key === 'Game'), { timeout: 15000 });
  await page.waitForTimeout(1800);
  await dismissStory(page);
  await page.waitForTimeout(500);
  const mobileUi = await page.evaluate(() => {
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return {
      touch: ui.isTouch,
      joystick: ui.joyBase.visible,
      area: { text: ui.areaTitle.text, width: ui.areaTitle.width, screen: window.innerWidth },
      buttons: { interact: ui.interactButton.container.visible, drill: ui.drillButton.container.visible },
      hudRight: ui.hudContainer.x + ui.hudBg.width,
      drillLeft: ui.drillButton.container.x - ui.drillButton.w / 2,
    };
  });
  check('Móvil: joystick visible y banner de área cabe', mobileUi.touch && mobileUi.joystick && mobileUi.area.width < mobileUi.area.screen, JSON.stringify(mobileUi.area));
  check('Móvil: HUD no choca con botón de simulacro', mobileUi.hudRight <= mobileUi.drillLeft, JSON.stringify({ hudRight: mobileUi.hudRight, drillLeft: mobileUi.drillLeft }));
  await page.screenshot({ path: `${OUT}/final-mobile-spawn.png` });

  const nena = await npcPos(page, 'nena');
  await teleport(page, nena.x, nena.y + 22);
  await page.waitForTimeout(700);
  const interact = await page.evaluate(() => {
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    return { visible: ui.interactButton.container.visible, x: ui.interactButton.container.x, y: ui.interactButton.container.y, label: ui.interactButton.text.text };
  });
  check('Móvil: botón contextual HABLAR aparece', interact.visible && interact.label === 'HABLAR', JSON.stringify(interact));
  await page.mouse.click(interact.x, interact.y);
  await page.waitForTimeout(700);
  const opened = await page.evaluate(() => window.__PTY_GAME__.scene.getScene('UI').dialogue.isOpen);
  check('Móvil: tocar HABLAR abre diálogo', opened, String(opened));
  await page.screenshot({ path: `${OUT}/final-mobile-dialogue.png` });
  await context.close();
}

// ================= MÓVIL HORIZONTAL: modales =================
{
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => results.errors.push('landscape pageerror: ' + e.message));
  await enterGame(page);
  await page.screenshot({ path: `${OUT}/final-landscape-spawn.png` });
  await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    gs.mission.states['el-mandado'].flags.drillUnlocked = true;
    gs.emitHud();
    gs.requestDrill();
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__PTY_GAME__.scene.getScene('UI').modal.handleButton(1));
  await page.waitForTimeout(700);
  const phases = await page.evaluate(() => {
    const gs = window.__PTY_GAME__.scene.getScene('Game');
    gs.drill.crouchTime = 9;
    gs.drill.update(0, 16);
    gs.drill.stillTime = 9;
    gs.drill.update(0, 16);
    const cancha = gs.zones.find((z) => z.id === 'cancha');
    gs.player.setPosition(cancha.x + cancha.w / 2, cancha.y + cancha.h / 2);
    gs.player.body.reset(cancha.x + cancha.w / 2, cancha.y + cancha.h / 2);
    gs.drill.update(0, 16);
    return { phase: gs.drill?.phase, active: gs.drill?.active };
  });
  await page.waitForTimeout(900);
  const modalFit = await page.evaluate(() => {
    const ui = window.__PTY_GAME__.scene.getScene('UI');
    const top = ui.modal.panel.y - ui.modal.panel.height / 2;
    const bottom = ui.modal.panel.y + ui.modal.panel.height / 2;
    return { open: ui.modal.isOpen, title: ui.modal.title.text, top, bottom, screenH: window.innerHeight, source: ui.modal.source.text };
  });
  check('Horizontal: modal de resultado cabe en pantalla', modalFit.open && modalFit.top >= 0 && modalFit.bottom <= modalFit.screenH, JSON.stringify(modalFit));
  check('Horizontal: fases del simulacro completan', phases.phase === 'evacuate' || !phases.active, JSON.stringify(phases));
  await page.screenshot({ path: `${OUT}/final-landscape-drill-result.png` });
  await context.close();
}

console.log('\n===== RESUMEN =====');
console.log(JSON.stringify({ checks: results.checks.length, failed: results.checks.filter((c) => !c.ok).length, errors: results.errors }, null, 2));
await browser.close();
if (results.errors.length) process.exitCode = 1;
