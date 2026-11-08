# PTY TIME · Contrato de assets (v1)

Todos los recursos los genera `tools/generate_assets.py` con Pillow. El script es la
fuente de verdad: se puede volver a ejecutar y debe producir exactamente los mismos PNG.
No se usan assets externos con copyright. Fuente: Press Start 2P (OFL, incluida en
`public/assets/ui/PressStart2P-Regular.ttf`).

Reglas de estilo obligatorias:

- Pixel art puro, sin antialiasing, sin filtros, sin degradados suaves. 1 px de outline
  oscuro (`#1b1b2b`) en personajes, edificios y objetos.
- Perspectiva 3/4 top-down tipo RPG clásico (fachada visible + techo en la parte superior),
  luz desde arriba-izquierda y sombra corta abajo.
- Fondo transparente en todos los sprites (excepto tiles y logo).
- Usar la paleta de abajo, con variaciones mínimas. Nada de colores neón fuera de paleta.
- Coherencia total: mismo grosor de línea, mismas proporciones, mismo nivel de detalle.
- Los textos dentro del arte (letreros) son en español y con letras de 4-5 px.
- Optimizar: PNG indexado o RGBA con compresión; presupuesto total < 1.2 MB.

## Paleta

| Uso | Hex |
|---|---|
| Outline / tinta | `#1b1b2b` |
| Sombra | `#2f2f4a` |
| Piel clara | `#f2c49b` |
| Piel media | `#c98a5e` |
| Piel oscura | `#8a5a3b` |
| Pelo negro | `#20202e` |
| Pelo castaño | `#5a3825` |
| Camisa roja | `#e94f4f` |
| Camisa azul | `#2f80ed` |
| Camisa amarilla | `#f2c94c` |
| Camisa verde | `#27ae60` |
| Pantalón azul | `#2d4a7a` |
| Pantalón oscuro | `#333344` |
| Hoja clara | `#7cb342` |
| Hoja media | `#43a047` |
| Hoja oscura | `#2e7d32` |
| Asfalto | `#3c3f4a` |
| Asfalto claro | `#454955` |
| Acera | `#b8b8b8` |
| Acera clara | `#d0d0d0` |
| Grama | `#5fa85f` |
| Grama oscura | `#4b8a4b` |
| Tierra | `#b08968` |
| Techo zinc | `#8d99ae` |
| Techo zinc claro | `#a8b2c1` |
| Techo óxido | `#9c6644` |
| Pared crema | `#f6d365` |
| Pared coral | `#f8b195` |
| Pared menta | `#c1e1c1` |
| Pared celeste | `#a8dadc` |
| Pared durazno | `#ffd6a5` |
| Rojo Panamá | `#da291c` |
| Azul Panamá | `#005293` |
| Blanco | `#ffffff` |
| Amarillo taxi | `#f7c948` |

## 1. Tiles — `public/assets/tiles/tileset.png`

- Tamaño: 256 x 16 px (16 tiles de 16x16 en una fila horizontal).
- Sin transparencia, sin bordes negros entre tiles; deben verse continuos.
- Índices (columna):

| # | nombre | descripción |
|---|---|---|
| 0 | grass | grama base con 2-3 briznas |
| 1 | grass2 | variante con más briznas / florecitas |
| 2 | asphalt | asfalto con moteado sutil |
| 3 | asphalt2 | variante con grieta / parche |
| 4 | sidewalk | acera con junta de losa |
| 5 | sidewalk2 | variante con manchita |
| 6 | curb | borde de acera claro (1 tile completo) |
| 7 | dirt | tierra / caliche |
| 8 | stairs | escalera de concreto (3-4 peldaños horizontales) |
| 9 | court | cancha celeste/verde con línea blanca sutil |
| 10 | crosswalk | paso peatonal: franjas blancas sobre asfalto |
| 11 | plaza | losa de plaza con patrón |
| 12 | grass_worn | grama pisoteada con tierra |
| 13 | asphalt_patch | asfalto con parche más oscuro |
| 14 | concrete | concreto liso claro |
| 15 | void | oscuro para bordes (no se usa en juego) |

## 2. Personajes — `public/assets/characters/`

- Frame: **16 x 24 px**. Hoja: **48 x 96 px** (3 columnas x 4 filas).
- Columnas: 0 = idle, 1 = paso A, 2 = paso B.
- Filas en este orden exacto: **0 down, 1 left, 2 right, 3 up**.
- Pies apoyados en la última fila de píxeles del frame; sin margen inferior.
- Cabeza grande (chibi), cuerpo 1 px outline, ropa y pelo con personalidad panameña.
- Las columnas 1 y 2 deben ser un ciclo de caminar (piernas alternas, brazos contrarios).
- Idle = pose neutral. La animación se reproduce a 6 fps.

Jugador (8 hojas), nombre `player-{cuerpo}-{camisa}.png`:
- cuerpos: `m` (masculino, pelo corto) y `f` (femenino, coleta/ponytail)
- camisas: `red`, `blue`, `yellow`, `green` (colores de la paleta)
- mismo cuerpo, misma piel, mismo pantalón; solo cambia el color de la camisa.

NPCs (8 hojas), nombre `npc-{id}.png`, mismo layout 48x96:
| id | personaje | notas visuales |
|---|---|---|
| `nena` | Doña Nena, señora mayor dueña de fonda | delantal, pelo canoso, lentes |
| `pipe` | Pipe, pelao skater | gorra, camiseta, pantalón corto, chancletas |
| `chen` | Don Chen, dueño del minisúper | camisa hawaiana, bigote |
| `melva` | Melva, señora del bus | vestido, cartera, pelo rizado |
| `kevin` | Kevin, niño de la cancha | camiseta de fútbol, balón no |
| `yolanda` | Yolanda, vecina | ropa de casa, rodillos |
| `ana` | Profe Ana, maestra | blusa, falda, libros no |
| `chofer` | Chofer de bus | camisa celeste, gorra, bigote |

Enemigos del Slice A (2 hojas), nombre `enemy-{id}.png`, mismo layout 48x96:

| id | enemigo | notas visuales |
|---|---|---|
| `maton` | Matón de la plaza | gorra roja, camiseta oscura, pantalón azul |
| `maton-duro` | Matón jefe | camiseta roja, bigote, pantalón oscuro |

Zombis del Slice B (1 hoja), nombre `enemy-{id}.png`, mismo layout 48x96:

| id | zombi | notas visuales |
|---|---|---|
| `infectado` | Infectado común | piel verdosa (`#9db88a`/`#6f8a61`), ropa gris sucia, lentes |

Objetos de suministro 16x16 en `props/`: `vendaje.png` (cruz roja), `lata.png`
(comida) y `caja.png` (caja de balas).

Armas recogibles 16x16 en `props/` (Fase 3): `tubo.png`, `subfusil.png`,
`escopeta.png` y `rifle.png`.

Los efectos de combate (bala, fogonazo, impacto y mira) **no son PNG del contrato**:
se generan en memoria en `BootScene.createFxTextures()`.

## 3. Retratos — `public/assets/ui/portraits/`

- **32 x 32 px**, fondo transparente, busto del NPC mirando al frente.
- Mismo rostro/ropa que la hoja de personaje. Para el jugador: `player-m.png`, `player-f.png`
  (busto genérico con camisa blanca).
- Nombres: `portrait-nena.png`, `portrait-pipe.png`, etc., y `portrait-player-m.png` etc.

## 4. Edificios — `public/assets/buildings/`

PNG transparente, anclado abajo-centro en el mapa. Tamaños exactos (no negociables):

| archivo | tamaño | descripción |
|---|---|---|
| `house-a.png` | 80x64 | casa de 1 piso, techo de zinc a dos aguas, pared crema, verja baja, puerta y ventana |
| `house-b.png` | 64x64 | casa pequeña coral, techo zinc, macetas |
| `house-c.png` | 96x80 | casa de 2 pisos, balcón con baranda, ropa colgada |
| `apartment-a.png` | 96x88 | edificio de 3 pisos, paredes menta/celeste, ventanas con rejas, tanque de agua arriba |
| `apartment-b.png` | 80x96 | edificio de 3 pisos, pared durazno, escalera externa, cables |
| `fonda.png` | 96x64 | fonda de barrio: toldo rojo/amarillo, letrero "FONDA LA NENA", mesas afuera |
| `minisuper.png` | 96x64 | minisúper: letrero "MINISÚPER", rejas, productos en vitrina, aire acondicionado |
| `metro.png` | 80x56 | estación de metro: letrero "METRO" rojo/azul, escalera mecánica insinuada |
| `bus-stop.png` | 48x40 | parada de bus: techo metálico, banca, letrero "PARADA" |
| `school.png` | 112x80 | escuela pública: letrero "ESCUELA", bandera de Panamá, verja |

Los edificios deben tener una base sólida (no flotar) y una sombra de 2-3 px en el borde
inferior. Los letreros deben leerse a tamaño 1x.

## 5. Props — `public/assets/props/`

| archivo | tamaño | descripción / colisión sugerida |
|---|---|---|
| `palm.png` | 32x48 | palmera tropical, tronco curvo |
| `mango-tree.png` | 32x40 | árbol frondoso, mango |
| `bush.png` | 16x16 | arbusto |
| `power-pole.png` | 16x48 | poste de luz con transformador; los cables se dibujan por código |
| `bench.png` | 24x16 | banca de metal/madera |
| `trash.png` | 12x16 | zafacón |
| `fence.png` | 16x16 | tramo de verja metálica (tileable horizontal) |
| `sign.png` | 16x24 | letrero de calle ("SAN ISIDRO") |
| `cone.png` | 8x8 | cono de tránsito |
| `hoop.png` | 16x24 | aro de baloncesto con tablero |
| `stall.png` | 40x32 | puesto de frutas con toldo |
| `dog.png` | 16x16 | perrito callejero |
| `puddle.png` | 16x8 | charco |
| `planter.png` | 16x16 | maceta con planta |
| `taxi.png` | 32x24 | taxi amarillo panameño |
| `car-blue.png` | 32x24 | carro azul |
| `car-red.png` | 32x24 | carro rojo |
| `diablo-rojo.png` | 64x32 | bus "diablo rojo" decorado con colores vivos, letrero "S. MIGUELITO" |
| `chancla.png` | 12x8 | chancleta perdida (item de misión), contorno claro para brillar |

## 6. UI — `public/assets/ui/`

- `logo.png`: **240x80**, transparente. "PTY TIME" en letras pixel grandes, con detalles
  de la bandera panameña (rojo/azul/blanco) y una silueta de skyline. Debe verse bien
  sobre fondo oscuro y sobre fondo claro.
- `icon-star.png`, `icon-pin.png`, `icon-talk.png`, `icon-quake.png`, `icon-sound.png`,
  `icon-back.png`: **16x16**, transparente, outline oscuro, relleno claro.
- No generar fuentes bitmap: la fuente Press Start 2P ya está incluida.

## 7. Contact sheet

`tools/asset_sheet.png` con todos los assets sobre fondo cuadriculado, para revisión visual.
No se carga en el juego.

## 8. Verificación

Antes de terminar:

1. Ejecutar `python tools/generate_assets.py` dos veces y comprobar que no falla.
2. Revisar `tools/asset_sheet.png` con `read_image` y corregir defectos visibles.
3. Comprobar tamaños exactos con Pillow (assert en el script).
4. Comprobar que todos los PNG tienen canal alfa donde corresponde.
5. Reportar al Lead: archivos generados, tamaño total y cualquier desviación.
