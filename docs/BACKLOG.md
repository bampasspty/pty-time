# BACKLOG · PTY TIME

**Estado:** v0.3.0 · Slice A cerrado y desplegado (https://pty-time.vercel.app)
**Referencia:** `docs/MASTER_DOC.md` (v1.2) y `docs/V1.2_AUDIT.md`
**Última revisión:** 2026-11-07

Este documento lista **lo que falta** para llegar al MVP del Documento Maestro y después
a la visión completa. Lo hecho está en `HANDOFF.md` y `CHANGELOG.md`; aquí solo huecos.

---

## 0. Resumen ejecutivo

- **MVP del documento (§18): ~60%.** Están pantalla, Calito, mapa, NPC, combate, armas
  iniciales, enemigos, misiones y guardado. Faltan los cinco puntos narrativos:
  introducción, primera infección, un zombi, transición al apocalipsis e inventario.
- **Hoja de ruta (§19):** Fase 1 ✅ · Fase 2 ✅ (salvo 8 direcciones visuales, decisión
  tomada) · Fase 3 parcial (combate y enemigos sí; inventario y progresión no) ·
  Fases 4 a 6 sin empezar.
- **El siguiente paso natural es el Slice B**, que es exactamente el resto del MVP.

## 1. Completar el MVP (Slice B) — prioridad máxima

| # | Falta | Dónde entra | Nota |
|---|---|---|---|
| B1 | Introducción narrativa de Calito | Escena nueva `IntroScene` o modal narrado tras NUEVA PARTIDA | Presentar San Miguelito, su ambición y sus códigos antes del mandado |
| B2 | Primera situación de infección | Misión principal nueva del Capítulo III | Reportes en PTY Alerta, un vecino mordido, caos inicial |
| B3 | Un tipo de zombi jugable | `src/data/zombies.js`, `src/entities/Zombie.js`, `src/systems/ZombieAI.js` | Infectado común: lento, torpe, atrae a otros; distinto al matón |
| B4 | Transición narrativa al apocalipsis | Secuencia de capítulo + cambio de estado del mundo | El mapa pasa de barrio a zona de supervivencia |
| B5 | Inventario básico | `src/systems/InventorySystem.js`, panel en `UIScene` | Categorías del §5.3; munición, comida, botiquín |
| B6 | Guardado v3 | `SaveSystem` | Añadir inventario, estado del mundo (pre/post apocalipsis), hambre |
| B7 | Pruebas del Slice B | `tests/` + `tools/qa-*.mjs` | Zombi, infección, inventario y migración v2 → v3 |

## 2. Sistemas de acción del §5 y §7 que faltan

- **Armas completas (§5.2):** subfusil, escopeta, rifle, armas improvisadas (tubo,
  machete). Hoy solo pistola y puño.
- **Progresión (§5.5):** experiencia, subir salud/resistencia/precisión/combate/
  capacidad/velocidad de fabricación/habilidades de supervivencia. Hoy no hay XP.
- **Fabricación (§5.4):** munición, botiquines, herramientas, barricadas, mejoras de
  refugio.
- **Inventario con capacidad/peso (§5.3)** y economía de recursos.
- **Supervivencia (§7):** hambre, resistencia, estado del refugio. Salud y munición ya están.
- **Tipos de zombi §7.1:** común, rápido, resistente, ataque pesado, especial.
- **IA §7.2 ampliada:** reaccionar a sonidos, cambiar de objetivo, interactuar con
  obstáculos, comportamientos distintos por tipo. La base humana ya tiene detección,
  persecución, ataque, ruido y línea de visión.

## 3. Crimen, reputación y consecuencias (§6)

- **Reputación real:** hoy solo hay un contador `reputation.barrio` que sube al terminar
  la misión criminal. Faltan consecuencias, niveles y reacción de NPCs.
- **Influencia, contactos, territorios, relaciones y enemigos:** no existen.
- **Dinero gastable:** la yapa se acumula; faltan tiendas, sobornos, negocios y
  propiedades.
- **Puente pre-apocalipsis → supervivencia:** contactos que ayudan, enemigos que vuelven,
  propiedades que se vuelven refugios, vehículos para escapar. Es el corazón narrativo
  del documento y no está.
- **Negocios ilegales ficticios y competencia por territorios (§4 Cap. II).**

## 4. Mundo de supervivencia (§8 y §9)

- **Refugios:** almacenamiento, barricadas, taller, área médica, defensa, dormitorios.
- **Supervivientes reclutables:** médico, mecánico, combatiente, recolector, constructor,
  con asignación de tareas.
- **Vehículos reales:** diablos rojos, taxis, pickups, buses… hoy son props decorativos.
  Faltan combustible, condición, reparación, capacidad, almacenamiento y daños.

## 5. Mapa de Panamá (§10)

Solo existe **San Miguelito**. Faltan, de forma modular:

1. Ciudad de Panamá (comercial, residencial, hospitales, transporte).
2. Panamá Oeste (comunidades, carreteras, comercios).
3. Interior del país (provincias, cultura local).

Cada región necesita identidad visual, NPC, misiones, recursos, enemigos, historias y
puntos de interés. Requiere **carga por regiones** (§15) para no cargar todo el mundo.

## 6. Narrativa e identidad (§4, §11, §12, §13)

- **Guion de los cinco capítulos** y evolución de Calito en tres estados.
- **Calito con voz propia:** hoy hay ficha e identidad visual, pero sin diálogos narrados.
  `DialogueBox` necesita retratos por línea para mezclar a Calito con NPCs.
- **PTY Alerta narrativa:** el simulacro sísmico educativo existe; faltan las alertas
  ficticias del colapso, siempre separadas de información real de emergencia.
- **Categorías de misión restantes:** historia principal, supervivencia, exploración y
  eventos especiales. Hoy solo hay secundaria y crimen.
- **Humor negro y sátira panameña** más allá de los diálogos actuales.

## 7. Técnico y pulido (§14 a §17)

- **Audio:** no hay música ni efectos. El combate necesita disparo, impacto, recarga y
  daño como mínimo.
- **8 direcciones visuales:** decisión tomada (4 filas + dirección dominante); queda como
  mejora opcional si el resultado no convence.
- **Línea de visión:** aproximada por muestreo; suficiente para el mapa actual, a revisar
  con zombis y multitudes.
- **Atlas de texturas:** 65 PNG sueltos; conviene agrupar UI/personajes antes de duplicar
  assets con armas, zombis y regiones.
- **Teléfono físico de gama baja:** único QA externo pendiente (emulado con CPU 4× a 56 FPS).
- **CI:** no hay GitHub Action que corra pruebas/build antes de desplegar; Vercel solo
  construye.
- **Menú de pausa y ajustes:** no existen (volumen, calidad, reinicio de partida).
- **Guardado en servidor:** la arquitectura v2 es local; el documento pide poder migrar
  a almacenamiento persistente.
- **Gamepad** (§5.1 menciona teclado/joystick virtual; mando físico no).
- **Preparación multijugador (§17):** la separación por sistemas ayuda, pero no hay diseño
  de estado compartido ni red; no bloquear, no complicar el MVP.

## 8. Orden recomendado

1. **Slice B completo** (B1–B7): cierra el MVP del documento. Es lo que más se nota al
   jugar y lo que permite enseñar la nueva dirección.
2. **Sistemas de acción §5/§7**: armas, progresión, inventario con capacidad, fabricación
   y supervivencia.
3. **Crimen y consecuencias §6**: reputación real, contactos, propiedades y el puente
   pre-apocalipsis → supervivencia.
4. **Mundo de supervivencia §8/§9**: refugios, supervivientes y vehículos.
5. **Expansión de mapa §10**: Ciudad de Panamá → Panamá Oeste → Interior.
6. **Pulido y publicación:** audio, atlas, CI, ajustes, teléfono físico y rendimiento.

## 9. Checklist del MVP (§18 del Documento Maestro)

| Contenido mínimo | Estado |
|---|---|
| Pantalla de inicio | ✅ |
| Introducción narrativa | ❌ (B1) |
| Calito como personaje jugable | ✅ |
| Mapa inicial de San Miguelito | ✅ |
| Movimiento en ocho direcciones | ⚠️ movimiento sí; animación de 4 filas (decisión) |
| NPC con diálogos | ✅ |
| Una misión principal | ⚠️ hay mandado + criminal; falta la historia principal |
| Un sistema básico de combate | ✅ |
| Armas iniciales | ✅ |
| Enemigos | ✅ (humanos) |
| Una primera situación de infección | ❌ (B2) |
| Transición narrativa hacia el apocalipsis | ❌ (B4) |
| Un tipo de zombi | ❌ (B3) |
| Inventario básico | ❌ (B5) |
| Guardado de progreso | ✅ v2 |
