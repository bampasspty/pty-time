# PTY TIME · Documento Maestro v1.2

**De la vida en el barrio al apocalipsis panameño**

| Campo | Valor |
|---|---|
| Versión | 1.2 (nueva dirección creativa aprobada) |
| Fecha de consolidación | 2026-11-07 |
| Estado | Dirección aprobada · MVP y Fases 3-4 cerrados · release pública v1.0.0 (Fases 5-7 como DLC) |
| Proyecto | Videojuego independiente · SAVAGE GAMES |
| Plataforma | Web, con adaptación móvil |
| Motor | Phaser 3 + Vite (proyecto existente: `pty-time`) |
| Estilo | Pixel art 2D, vista cenital (top-down) |
| Género | Acción, RPG, mundo abierto, crimen y supervivencia zombi |
| Protagonista | Calito |
| Ambientación | República de Panamá (versión ficticia) |

> Este documento es la referencia principal para la dirección creativa, narrativa,
> técnica y funcional de PTY TIME. Las modificaciones futuras se integran sobre esta
> base sin perder las decisiones anteriores ni el progreso existente.

> **Cambio de dirección respecto a v0.1.0:** PTY TIME deja de ser principalmente una
> aventura relajante de exploración y pasa a ser una **aventura narrativa de
> supervivencia**. Se conservan Panamá, sus personajes, sus provincias y su identidad
> cultural.

---

## 1. Visión general

PTY TIME es un videojuego de acción y supervivencia ambientado en una versión ficticia
de Panamá.

El jugador acompaña a **Calito**, un joven de San Miguelito que comienza su historia
enfrentándose a las dificultades de la vida en el barrio. A través de decisiones,
misiones, conflictos y oportunidades, Calito se involucra en el mundo criminal hasta
convertirse en una figura importante del bajo mundo del distrito.

Cuando su vida parece haber alcanzado otro nivel, ocurre una catástrofe que cambia
completamente el país: **un apocalipsis zombi**. El mundo que Calito conocía desaparece.
Las pandillas, los negocios, los territorios y las relaciones que construyó ahora tienen
un propósito diferente: **sobrevivir**.

PTY TIME combina:

- Exploración de mundo abierto.
- Combate con armas de fuego y cuerpo a cuerpo.
- Misiones principales y secundarias.
- Sistema de reputación.
- Economía y negocios.
- Vehículos.
- Inventario y fabricación.
- Supervivencia.
- Construcción de refugios.
- Reclutamiento de personajes.
- Exploración de Panamá.
- Humor negro y sátira social.

La intención es crear una experiencia con **identidad panameña auténtica**, no
simplemente colocar zombis en una ciudad genérica.

## 2. Identidad del juego

### 2.1 Referencia jugable

La referencia principal de diseño es **Bad 2 Bad: Apocalypse**. Se estudian sus sistemas
de: movimiento cenital, combate y apuntado, armas y equipamiento, enemigos, inventario,
recolección de recursos, fabricación, exploración, refugios y progresión del personaje.

No se copiarán sus personajes, mapas, recursos gráficos ni identidad. PTY TIME tendrá
sistemas, narrativa y contenido **originales**.

### 2.2 Identidad visual

Pixel art retro con perspectiva cenital, conservando la estructura técnica ya
desarrollada:

- Personajes reconocibles.
- Animaciones sencillas y fluidas.
- Entornos detallados sin exceso de elementos.
- Calles y edificios inspirados en Panamá.
- Ciclos de iluminación.
- Efectos de combate.
- Animaciones de zombis.
- Interfaz clara y compacta.

Prioridad: buena experiencia en **teléfonos de gama baja**.

## 3. Protagonista: Calito

### 3.1 Personalidad

Calito no es un héroe tradicional: es un **antihéroe** con ambición, carácter fuerte,
sentido del humor y una moral propia.

- Sarcástico, astuto y desconfiado.
- Ambicioso, con facilidad para meterse en problemas.
- Leal con las personas que considera cercanas.
- Capaz de tomar decisiones cuestionables; no siempre mide las consecuencias.
- Callejero, inteligente.
- El humor negro será parte fundamental de sus diálogos y reacciones.

No debe convertirse en un personaje caricaturesco: debe sentirse como alguien que podría
existir en un barrio panameño.

### 3.2 Evolución

Tres estados narrativos, con transformación progresiva:

1. **El muchacho del barrio.**
2. **El criminal que construye su propio poder.**
3. **El superviviente que intenta mantener el control en un mundo destruido.**

## 4. Historia principal

### Capítulo I — El barrio

Ubicación: San Miguelito. Calito enfrenta los problemas cotidianos de su entorno, con
pocos recursos, contactos limitados y muchas necesidades. El jugador deberá: conseguir
dinero, conocer personajes, explorar el barrio, realizar trabajos, resolver conflictos,
ganarse el respeto de determinados grupos y conseguir sus primeras armas y vehículos.

Las misiones combinan acción, humor y situaciones propias de Panamá.

### Capítulo II — Subiendo de nivel

Calito gana reputación. Aparecen nuevas oportunidades y nuevos enemigos. El jugador
podrá: participar en negocios ilegales ficticios, administrar recursos, conseguir
propiedades, construir relaciones, reclutar colaboradores, competir por territorios y
mejorar armas y vehículos.

La historia presenta personajes con intereses propios y decisiones con consecuencias.

### Capítulo III — El colapso

Una serie de acontecimientos extraños empieza a afectar Panamá. Los primeros incidentes
parecen aislados; después aparecen reportes de personas violentas, hospitales colapsados,
interrupciones del transporte y problemas de comunicación. Las autoridades pierden
progresivamente el control. El apocalipsis comienza. Calito tendrá que escapar de una
situación que nunca imaginó enfrentar.

### Capítulo IV — Sobrevivir

El país ha cambiado: recursos limitados, ciudades deterioradas y diferentes grupos de
supervivientes. Calito deberá: encontrar refugio, conseguir alimentos, buscar
medicamentos, conseguir municiones, defenderse de los zombis, reclutar supervivientes,
recuperar vehículos, construir una base e investigar qué ocurrió.

### Capítulo V — El nuevo Panamá

Existen asentamientos, organizaciones, bandas y grupos de supervivientes. El jugador
podrá recuperar territorios, establecer alianzas y descubrir nuevos acontecimientos
relacionados con el origen del apocalipsis. La historia debe permitir futuras
expansiones.

## 5. Sistema de juego

### 5.1 Movimiento

- Movimiento en **ocho direcciones**.
- Teclado en PC; joystick virtual y controles táctiles en móviles.
- Movimiento y apuntado independientes cuando el sistema de combate lo permita.

### 5.2 Combate

Sistema de combate cenital. Categorías de armas: pistolas, subfusiles, escopetas,
rifles, armas improvisadas y cuerpo a cuerpo.

Características: munición limitada, recarga, daño por tipo de arma, distancias de
combate, mejoras, equipamiento, animaciones y diferentes comportamientos enemigos.

### 5.3 Inventario

Organizado por categorías: armas, municiones, alimentos, medicamentos, materiales,
herramientas y objetos de misión. Debe permitir administrar peso o capacidad cuando el
sistema esté suficientemente optimizado.

### 5.4 Fabricación

Crear y reparar objetos con recursos recolectados: municiones, herramientas, botiquines,
barricadas, equipamiento y mejoras para refugios.

### 5.5 Progresión

Calito podrá mejorar: salud, resistencia, precisión, combate, capacidad de inventario,
velocidad de fabricación y habilidades de supervivencia. La progresión está relacionada
con la experiencia y las acciones del jugador.

## 6. Sistema de crimen y reputación

La primera parte del juego necesita un sistema de progresión independiente del
apocalipsis. Calito construye reputación mediante sus acciones. Variables: dinero,
reputación, influencia, contactos, territorios, relaciones y enemigos.

Las decisiones previas al apocalipsis producen consecuencias durante la supervivencia:

- Contactos que pueden ayudarlo.
- Enemigos que buscan venganza.
- Vehículos que puede utilizar para escapar.
- Propiedades que pueden convertirse en refugios.
- Recursos acumulados antes del colapso.

No todas las consecuencias tienen que ser positivas.

## 7. Sistema de supervivencia

Después del apocalipsis se incorporan necesidades de supervivencia. Variables
principales: salud, hambre, resistencia, munición, recursos y estado del refugio.

Los sistemas deben generar decisiones interesantes sin convertirse en tareas repetitivas.

### 7.1 Zombis

Tipos iniciales: infectado común, infectado rápido, infectado resistente, infectado de
ataque pesado e infectado especial. Cada tipo tendrá velocidad, resistencia,
comportamiento y daño diferenciados.

### 7.2 Inteligencia artificial

Los enemigos deben poder detectar al jugador, perseguirlo, atacar, reaccionar a sonidos,
cambiar de objetivo e interactuar con obstáculos cuando corresponda. Los zombis no deben
comportarse todos de la misma manera.

## 8. Refugios y supervivientes

El jugador podrá construir y mejorar refugios: almacenamiento, barricadas, taller, área
médica, generación de recursos, defensa y dormitorios.

Supervivientes con diferentes habilidades: médico, mecánico, combatiente, recolector y
constructor. El jugador podrá asignar tareas y administrar el grupo.

## 9. Vehículos

Los vehículos son parte importante de la identidad panameña. Modelos ficticios
inspirados en: diablos rojos, taxis, pickups, sedanes, camionetas, motocicletas y
autobuses.

Características: combustible, condición mecánica, reparaciones, capacidad,
almacenamiento, mejoras y daños. Permiten desplazarse y transportar recursos.

## 10. El mapa de Panamá

Expansión geográfica progresiva y modular. No se construirá todo Panamá de una sola vez.

### Primera región: San Miguelito

Inspiración en San Isidro, Los Andes, zonas comerciales, barriadas, calles
residenciales, áreas de transporte y comercios populares. Será el escenario de
introducción y la primera región completamente desarrollada.

### Expansión: Ciudad de Panamá

Zonas comerciales, áreas residenciales, hospitales, estaciones de transporte, edificios
y zonas urbanas deterioradas.

### Expansión: Panamá Oeste

Comunidades, carreteras, comercios, zonas residenciales y áreas de abastecimiento.

### Expansión: Interior del país

Regiones inspiradas en las provincias panameñas. Cada región tendrá identidad visual, NPC
propios, misiones, recursos, enemigos, historias locales y puntos de interés.

## 11. Identidad panameña

Pilar principal del proyecto. PTY TIME debe incorporar: jerga panameña natural, humor
local, comercios de barrio, transporte público, diablos rojos, metro y Metrobús, taxis,
chinitos, personajes cotidianos, música y ambiente urbano original, referencias
culturales, arquitectura y paisajes reconocibles.

Los diálogos deben evitar una traducción artificial del español neutro. El humor negro
surge de las situaciones, las personalidades y las reacciones de los personajes; no se
debe abusar de los chistes ni convertir cada diálogo en una caricatura.

## 12. Misiones

- **Historia principal:** evolución de Calito.
- **Secundarias:** historias de NPC y situaciones locales.
- **Crimen:** conflictos, negocios, encargos y territorios.
- **Supervivencia:** alimentos, medicamentos, armas y recursos.
- **Exploración:** descubrir ubicaciones y secretos.
- **Eventos especiales:** situaciones inesperadas en el mundo.

Las misiones deben tener objetivos claros, recompensas y consecuencias cuando
corresponda.

## 13. PTY Alerta

Se conserva el concepto PTY Alerta del diseño original. Su función es complementar el
universo del juego mediante información de emergencias, prevención y eventos sísmicos
educativos. Durante la historia podrán aparecer alertas ficticias que expliquen el
deterioro del país.

> **Límite ético obligatorio:** las alertas narrativas del apocalipsis deben estar
> claramente separadas de cualquier información real de emergencia. Nunca se deben
> presentar acontecimientos ficticios como avisos oficiales.

## 14. Estructura técnica

Tecnología base: Phaser 3, Vite, JavaScript o TypeScript según la estructura existente,
HTML5, CSS y arquitectura modular.

Organización lógica:

| Módulo | Responsabilidad |
|---|---|
| Core | Inicialización, configuración, escenas, gestión de estados |
| Player | Movimiento, animaciones, salud, inventario, combate, progresión |
| World | Mapas, colisiones, edificios, NPC, vehículos, objetos interactivos |
| Missions | Misiones principales, secundarias, objetivos, recompensas |
| Combat | Armas, proyectiles, daño, enemigos, inteligencia artificial |
| Survival | Recursos, hambre, fabricación, refugios, supervivientes |
| UI | Menús, inventario, mapa, misiones, indicadores, configuración |

La organización definitiva debe adaptarse al repositorio existente. **No crear carpetas
o módulos duplicados si ya existen implementaciones equivalentes.**

## 15. Rendimiento

Prioridad a teléfonos de gama baja: carga progresiva de recursos, sprites optimizados,
atlas de texturas, mapas divididos por regiones, gestión de objetos, evitar procesos
innecesarios, reducir partículas, optimizar inteligencia artificial, evitar cargar todo
el mundo simultáneamente, guardado eficiente e interfaz adaptable.

La experiencia debe ser fluida tanto en navegador de escritorio como en Safari móvil.

## 16. Guardado y progreso

El jugador debe poder continuar su partida. Guardar: posición, estado de Calito,
inventario, dinero, misiones, reputación, relaciones, vehículos, refugios y progreso
regional.

La arquitectura de guardado debe permitir migrar a almacenamiento persistente en
servidor cuando sea necesario.

## 17. Multijugador y expansiones futuras

No es prioridad para el primer lanzamiento. Se contempla a futuro: cooperativo,
intercambio de recursos, refugios compartidos, misiones grupales, eventos especiales,
nuevas regiones, nuevos personajes y nuevos tipos de zombis.

La arquitectura debe evitar bloquear estas posibilidades, pero no debe complicar el MVP.

## 18. MVP — Primera versión jugable

El objetivo no es construir todo el juego inmediatamente. Primero un **vertical slice**
que demuestre que la nueva dirección funciona.

Contenido mínimo:

- Pantalla de inicio.
- Introducción narrativa.
- Calito como personaje jugable.
- Mapa inicial de San Miguelito.
- Movimiento en ocho direcciones.
- NPC con diálogos.
- Una misión principal.
- Un sistema básico de combate.
- Armas iniciales.
- Enemigos.
- Una primera situación de infección.
- Transición narrativa hacia el apocalipsis.
- Un tipo de zombi.
- Inventario básico.
- Guardado de progreso.

Después de validar el funcionamiento se ampliarán los sistemas.

## 19. Hoja de ruta

| Fase | Contenido |
|---|---|
| 1 | Auditoría y adaptación: revisar el proyecto actual, identificar componentes reutilizables y evitar reconstrucciones innecesarias |
| 2 | Calito y San Miguelito: protagonista, mapa, NPC, movimiento, misiones y primeras actividades |
| 3 | Sistemas de acción: combate, armas, enemigos, inventario y progresión |
| 4 | Historia criminal: reputación, contactos, negocios, conflictos y evolución de Calito |
| 5 | Apocalipsis: infección, zombis, recursos, supervivencia y transición narrativa |
| 6 | Mundo de supervivencia: refugios, vehículos, fabricación, supervivientes y expansión |
| 7 | Optimización y publicación: pruebas móviles, rendimiento, corrección de errores y publicación |

## 20. Reglas de desarrollo para DeepSeek

DeepSeek será la herramienta principal de apoyo para programación y desarrollo. Debe
trabajar bajo estas reglas:

1. Revisar primero el código existente.
2. No reconstruir funcionalidades que ya estén implementadas.
3. No eliminar decisiones ni sistemas anteriores sin justificación.
4. No duplicar archivos, funciones o componentes.
5. Mantener una arquitectura modular.
6. Trabajar por tareas pequeñas y verificables.
7. Entregar código funcional, no solamente ejemplos conceptuales.
8. Corregir errores antes de agregar nuevas funcionalidades.
9. Optimizar para dispositivos móviles desde el principio.
10. Evitar dependencias innecesarias.
11. Mantener documentación técnica actualizada.
12. Registrar cambios y avances.
13. No gastar créditos en repetir análisis ya realizados.
14. No modificar múltiples sistemas sin necesidad.
15. Comprobar que cada nueva funcionalidad funciona con las anteriores.
16. Antes de modificar cualquier archivo debe identificar su contenido y sus
    dependencias.

Cada entrega debe incluir: archivos modificados, funcionalidades implementadas, errores
corregidos, pruebas realizadas, pendientes reales y próxima tarea recomendada.

## 21. Filosofía del proyecto

PTY TIME debe tener personalidad propia. No buscamos hacer una copia de otro videojuego.
Buscamos construir una experiencia que combine: la cultura panameña, la vida de barrio,
el humor negro, la acción, la criminalidad ficticia, la supervivencia y el apocalipsis
zombi.

Calito no empieza siendo un salvador. Empieza intentando sobrevivir a su realidad. Y
cuando finalmente consigue construir algo para sí mismo, el mundo entero se viene abajo.

> **Frase central del proyecto:**
> “En Panamá siempre hemos sabido resolver como sea. El problema es que ahora los muertos
> también quieren su parte.”

---

## Anexo · Decisiones de producción recomendadas (no cambian el documento)

1. **No intentar construir todo Bad 2 Bad desde el principio.** Primero Calito debe
   caminar, disparar, enfrentarse a enemigos y completar misiones en San Miguelito.
2. **Evitar una introducción criminal demasiado larga** antes de experimentar la mecánica
   principal. El combate aparece temprano; el apocalipsis llega cuando el jugador ya
   domina lo básico.
3. **Reutilizar la base técnica existente** (Phaser 3 + Vite, escenas, mapa, NPC,
   diálogos, misiones puras, guardado y UI táctil) en lugar de reconstruirla.
4. **Dividir el MVP en dos incrementos verificables** en lugar de un único vertical
   slice:
   - **Slice A — Calito en San Miguelito:** protagonista, movimiento 8 direcciones,
     combate básico, armas iniciales, enemigos, misión principal criminal y guardado.
   - **Slice B — El colapso:** primera infección, un tipo de zombi, inventario,
     transición narrativa y arranque de supervivencia.

   Así se valida la mecánica principal antes de invertir en el sistema de supervivencia.
