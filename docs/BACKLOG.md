# BACKLOG · PTY TIME

**Estado:** v0.4.0 · **MVP del Documento Maestro cerrado** (Slice A + Slice B)
**Referencia:** `docs/MASTER_DOC.md` (v1.2) y `docs/V1.2_AUDIT.md`
**Última revisión:** 2026-11-07

El §18 del Documento Maestro ya está completo. Lo que sigue es la visión del documento
más allá del MVP: sistemas de acción, crimen, supervivencia, mapa y pulido. Lo hecho está
en `HANDOFF.md` y `CHANGELOG.md`; aquí solo huecos.

---

## 0. Resumen ejecutivo

- **MVP (§18): ✅ cerrado.** Pantalla, intro narrativa, Calito, mapa, NPC, combate,
  armas iniciales, enemigos, misión, infección, zombi, transición al apocalipsis,
  inventario y guardado v3.
- **Hoja de ruta (§19):** Fase 1 ✅ · Fase 2 ✅ · Fase 3 parcial (combate y enemigos ✅;
  armas, progresión, inventario ampliado y fabricación ❌) · Fases 4–6 sin empezar ·
  Fase 7 parcial (desplegado y QA ✅; audio, atlas, CI y teléfono físico ❌).
- **Siguiente bloque recomendado:** cerrar la Fase 3 (armas, progresión, fabricación,
  supervivencia básica) antes de entrar a la Fase 4 (crimen y reputación).

## 1. Sistemas de acción pendientes (§5, §7)

| Falta | Nota |
|---|---|
| Armas completas (§5.2) | Subfusil, escopeta, rifle, improvisadas. Hoy pistola y puño. |
| Progresión (§5.5) | Experiencia y mejoras de salud/resistencia/precisión/combate/capacidad/velocidad de fabricación/supervivencia. |
| Fabricación (§5.4) | Munición, botiquines, herramientas, barricadas, mejoras de refugio. |
| Inventario ampliado (§5.3) | Categorías completas, peso/capacidad real, armas y materiales. Hoy solo consumibles y munición. |
| Supervivencia (§7) | Hambre, resistencia y estado del refugio. Salud y munición ya están. |
| Zombis (§7.1) | Faltan rápido, resistente, ataque pesado y especial. |
| IA ampliada (§7.2) | Obstáculos, cambio de objetivo, sonidos ambientales; base ya implementada. |

## 2. Crimen y consecuencias (§6)

- **Reputación real**: niveles, reacción de NPCs y consecuencias. Hoy es un contador.
- **Influencia, contactos, territorios, relaciones y enemigos**.
- **Dinero gastable**: tiendas, sobornos, negocios y propiedades.
- **Puente pre-apocalipsis → supervivencia**: contactos que ayudan, enemigos que vuelven,
  propiedades que se vuelven refugios y vehículos para escapar.
- **Negocios ilegales ficticios y competencia por territorios** (Capítulo II).

## 3. Mundo de supervivencia (§8, §9)

- **Refugios**: almacenamiento, barricadas, taller, área médica, defensa y dormitorios.
- **Supervivientes reclutables**: médico, mecánico, combatiente, recolector y constructor,
  con asignación de tareas.
- **Vehículos jugables**: diablos rojos, taxis, pickups, buses; combustible, condición,
  reparación, capacidad, almacenamiento y daños.

## 4. Mapa de Panamá (§10)

Solo existe San Miguelito. Faltan, de forma modular y con carga por regiones:

1. Ciudad de Panamá (comercial, residencial, hospitales, transporte).
2. Panamá Oeste (comunidades, carreteras, comercios).
3. Interior del país (provincias, cultura local).

Cada región necesita identidad visual, NPC, misiones, recursos, enemigos, historias y
puntos de interés.

## 5. Narrativa e identidad (§4, §11–§13)

- **Capítulos IV y V**: sobrevivir y el nuevo Panamá.
- **Calito con diálogos narrados**: hoy hay ficha e identidad visual; el `DialogueBox`
  necesita retratos por línea para mezclar a Calito con NPCs.
- **PTY Alerta narrativa continua**: la primera alerta ficticia del colapso ya existe;
  faltan las siguientes (el país deteriorándose, origen del brote).
- **Categorías de misión restantes**: supervivencia, exploración y eventos especiales.
- Más humor negro y sátira panameña (hay base, no sistema).

## 6. Técnico y pulido (§14–§17)

- **Audio**: música y efectos (disparo, impacto, recarga, gruñidos de zombi).
- **Atlas de texturas**: 69 PNG sueltos; conviene agrupar antes de duplicar assets.
- **Teléfono físico de gama baja**: único QA externo pendiente.
- **CI**: ninguna Action corre pruebas/build antes de desplegar.
- **Menú de pausa y ajustes** (volumen, calidad, reiniciar partida).
- **Guardado en servidor**: la arquitectura actual es local.
- **Gamepad** y preparación no bloqueante para multijugador futuro.

## 7. Orden recomendado

1. **Fase 3 completa**: armas, progresión, inventario ampliado, fabricación y hambre/
   resistencia. Es lo que más profundidad añade sobre lo que ya se juega.
2. **Fase 4**: crimen, reputación real, contactos, propiedades y el puente al apocalipsis.
3. **Fase 6**: refugios, supervivientes y vehículos.
4. **Fase 5/10**: expansión del mapa y capítulos IV–V.
5. **Fase 7**: audio, atlas, CI, ajustes, teléfono físico y publicación.

## 8. Checklist del MVP (§18 del Documento Maestro)

| Contenido mínimo | Estado |
|---|---|
| Pantalla de inicio | ✅ |
| Introducción narrativa | ✅ v0.4.0 |
| Calito como personaje jugable | ✅ |
| Mapa inicial de San Miguelito | ✅ |
| Movimiento en ocho direcciones | ⚠️ movimiento sí; animación de 4 filas (decisión) |
| NPC con diálogos | ✅ |
| Una misión principal | ✅ mandado + criminal + Capítulo III |
| Un sistema básico de combate | ✅ |
| Armas iniciales | ✅ pistola y puño |
| Enemigos | ✅ matones + infectados |
| Una primera situación de infección | ✅ v0.4.0 |
| Transición narrativa hacia el apocalipsis | ✅ v0.4.0 |
| Un tipo de zombi | ✅ infectado |
| Inventario básico | ✅ v0.4.0 |
| Guardado de progreso | ✅ v3 |
