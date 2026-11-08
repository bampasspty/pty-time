#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PTY Time :: generador de assets pixel art.

Genera TODOS los PNG descritos en docs/ASSET_CONTRACT.md dentro de
public/assets/, un contact sheet de revision (tools/asset_sheet.png) y
docs/ASSETS_REPORT.md con el inventario.

Reglas:
- pixel art puro (cada pixel se escribe a mano, sin antialiasing),
- paleta cerrada del contrato (+ variaciones minimas justificadas),
- perspectiva 3/4 top-down, luz desde arriba-izquierda, outline #1b1b2b,
- PNG RGBA con compresion, presupuesto total < 1.2 MB.

Uso:  python tools/generate_assets.py
"""

from pathlib import Path
import math
import random

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
TOOLS = ROOT / "tools"
DOCS = ROOT / "docs"


# ==========================================================================
# PALETA (docs/ASSET_CONTRACT.md)
# ==========================================================================
def _rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


INK = _rgb("#1b1b2b")          # outline / tinta
SHADOW = _rgb("#2f2f4a")       # sombra
SKIN_L = _rgb("#f2c49b")       # piel clara
SKIN_M = _rgb("#c98a5e")       # piel media
SKIN_D = _rgb("#8a5a3b")       # piel oscura
HAIR_K = _rgb("#20202e")       # pelo negro
HAIR_BR = _rgb("#5a3825")      # pelo castano
SHIRT_R = _rgb("#e94f4f")
SHIRT_B = _rgb("#2f80ed")
SHIRT_Y = _rgb("#f2c94c")
SHIRT_G = _rgb("#27ae60")
PANTS_B = _rgb("#2d4a7a")
PANTS_D = _rgb("#333344")
LEAF_L = _rgb("#7cb342")
LEAF_M = _rgb("#43a047")
LEAF_D = _rgb("#2e7d32")
ASPHALT = _rgb("#3c3f4a")
ASPHALT_L = _rgb("#454955")
ACERA = _rgb("#b8b8b8")
ACERA_L = _rgb("#d0d0d0")
GRASS = _rgb("#5fa85f")
GRASS_D = _rgb("#4b8a4b")
DIRT = _rgb("#b08968")
ZINC = _rgb("#8d99ae")
ZINC_L = _rgb("#a8b2c1")
ZINC_RUST = _rgb("#9c6644")
WALL_CREAM = _rgb("#f6d365")
WALL_CORAL = _rgb("#f8b195")
WALL_MINT = _rgb("#c1e1c1")
WALL_SKY = _rgb("#a8dadc")
WALL_PEACH = _rgb("#ffd6a5")
PTY_RED = _rgb("#da291c")
PTY_BLUE = _rgb("#005293")
WHITE = _rgb("#ffffff")
TAXI = _rgb("#f7c948")

# Variaciones minimas (justificadas en docs/ASSETS_REPORT.md):
#   - JOINT: junta de losa, acera un paso mas oscura.
#   - ZINC_DARK: sombra de la corrugacion del zinc, un paso mas oscura.
#   - TIRE: caucho de llantas, casi negro.
#   - COURT / COURT_D: cancha sintetica verde-teal (la celeste parecia piscina).
#   - OFFWHITE: blanco hueso para franjas de cruce y lineas de cancha.
#   - LAVENDER: vestido de Yolanda (evita que el coral parezca piel).
#   - ZOMBIE_SKIN / ZOMBIE_SKIN_D: piel verdosa de los infectados (Slice B).
JOINT = _rgb("#9a9a9a")
ZINC_DARK = _rgb("#6e7a8f")
TIRE = _rgb("#26262f")
COURT = _rgb("#2f7f6f")
COURT_D = _rgb("#27685c")
OFFWHITE = _rgb("#e4e4e4")
LAVENDER = _rgb("#9b7ede")
ZOMBIE_SKIN = _rgb("#9db88a")
ZOMBIE_SKIN_D = _rgb("#6f8a61")

PALETTE = {
    "ink": INK, "shadow": SHADOW, "skin_l": SKIN_L, "skin_m": SKIN_M,
    "skin_d": SKIN_D, "hair_k": HAIR_K, "hair_br": HAIR_BR, "shirt_r": SHIRT_R,
    "shirt_b": SHIRT_B, "shirt_y": SHIRT_Y, "shirt_g": SHIRT_G,
    "pants_b": PANTS_B, "pants_d": PANTS_D, "leaf_l": LEAF_L, "leaf_m": LEAF_M,
    "leaf_d": LEAF_D, "asphalt": ASPHALT, "asphalt_l": ASPHALT_L,
    "acera": ACERA, "acera_l": ACERA_L, "grass": GRASS, "grass_d": GRASS_D,
    "dirt": DIRT, "zinc": ZINC, "zinc_l": ZINC_L, "zinc_rust": ZINC_RUST,
    "wall_cream": WALL_CREAM, "wall_coral": WALL_CORAL, "wall_mint": WALL_MINT,
    "wall_sky": WALL_SKY, "wall_peach": WALL_PEACH, "pty_red": PTY_RED,
    "pty_blue": PTY_BLUE, "white": WHITE, "taxi": TAXI,
    "joint": JOINT, "zinc_dark": ZINC_DARK, "tire": TIRE,
    "court": COURT, "court_d": COURT_D, "offwhite": OFFWHITE,
    "lavender": LAVENDER,
    "zombie_skin": ZOMBIE_SKIN, "zombie_skin_d": ZOMBIE_SKIN_D,
}
ALLOWED_COLORS = frozenset(PALETTE.values())


# ==========================================================================
# PRIMITIVAS
# ==========================================================================
def new(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def put(im, x, y, c):
    if c is None:
        return
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), c if len(c) == 4 else (c[0], c[1], c[2], 255))


def rect(im, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            put(im, xx, yy, c)


def hline(im, x, y, w, c):
    rect(im, x, y, w, 1, c)


def vline(im, x, y, h, c):
    rect(im, x, y, 1, h, c)


def span(im, y, x0, x1, c):
    for x in range(x0, x1 + 1):
        put(im, x, y, c)


def rect_outline(im, x, y, w, h, c):
    hline(im, x, y, w, c)
    hline(im, x, y + h - 1, w, c)
    vline(im, x, y, h, c)
    vline(im, x + w - 1, y, h, c)


def outline(im, color=INK):
    """Outline de 1 px por dilatacion 4-vecinos. No rellena huecos internos
    de figuras opacas y no dibuja bajo el borde inferior del canvas."""
    src = im.copy()
    out = im.copy()
    sp = src.load()
    op = out.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            if sp[x, y][3] != 0:
                continue
            near = False
            if x > 0 and sp[x - 1, y][3] != 0:
                near = True
            elif x < w - 1 and sp[x + 1, y][3] != 0:
                near = True
            elif y > 0 and sp[x, y - 1][3] != 0:
                near = True
            elif y < h - 1 and sp[x, y + 1][3] != 0:
                near = True
            if near:
                op[x, y] = (color[0], color[1], color[2], 255)
    return out


def mirror(im):
    return im.transpose(Image.FLIP_LEFT_RIGHT)


def empty(im):
    return im.getbbox() is None


def checkerboard(w, h, a=ACERA_L, b=JOINT, cell=8):
    im = new(w, h)
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            if ((x // cell) + (y // cell)) % 2 == 0:
                rect(im, x, y, min(cell, w - x), min(cell, h - y), a)
            else:
                rect(im, x, y, min(cell, w - x), min(cell, h - y), b)
    return im


# ==========================================================================
# TIPOGRAFIA PIXEL (para letreros dentro del arte)
# ==========================================================================
FONT4 = {
    "A": (".##.", "#..#", "####", "#..#", "#..#"),
    "B": ("###.", "#..#", "###.", "#..#", "###."),
    "C": (".###", "#...", "#...", "#...", ".###"),
    "D": ("###.", "#..#", "#..#", "#..#", "###."),
    "E": ("####", "#...", "###.", "#...", "####"),
    "F": ("####", "#...", "###.", "#...", "#..."),
    "G": (".###", "#...", "#.##", "#..#", ".###"),
    "H": ("#..#", "#..#", "####", "#..#", "#..#"),
    "I": ("####", "..#.", "..#.", "..#.", "####"),
    "J": ("..##", "...#", "...#", "#..#", ".##."),
    "K": ("#..#", "#.#.", "##..", "#.#.", "#..#"),
    "L": ("#...", "#...", "#...", "#...", "####"),
    "M": ("#..#", "####", "####", "#..#", "#..#"),
    "N": ("#..#", "##.#", "#.##", "#..#", "#..#"),
    "O": (".##.", "#..#", "#..#", "#..#", ".##."),
    "P": ("###.", "#..#", "###.", "#...", "#..."),
    "Q": (".##.", "#..#", "#..#", "#.#.", ".#.#"),
    "R": ("###.", "#..#", "###.", "#.#.", "#..#"),
    "S": (".###", "#...", ".##.", "...#", "###."),
    "T": ("####", "..#.", "..#.", "..#.", "..#."),
    "U": ("#..#", "#..#", "#..#", "#..#", ".##."),
    "V": ("#..#", "#..#", "#..#", ".#.#", "..#."),
    "W": ("#..#", "#..#", "####", "####", "#..#"),
    "X": ("#..#", "#..#", "..#.", "#..#", "#..#"),
    "Y": ("#..#", "#..#", ".#.#", "..#.", "..#."),
    "Z": ("####", "...#", "..#.", ".#..", "####"),
    "0": (".##.", "#..#", "#..#", "#..#", ".##."),
    "1": ("..#.", ".##.", "..#.", "..#.", "####"),
    "2": (".##.", "#..#", "..#.", ".#..", "####"),
    "3": ("###.", "...#", ".##.", "...#", "###."),
    "4": ("#..#", "#..#", "####", "...#", "...#"),
    "5": ("####", "#...", "###.", "...#", "###."),
    "6": (".###", "#...", "###.", "#..#", ".##."),
    "7": ("####", "...#", "..#.", ".#..", ".#.."),
    "8": (".##.", "#..#", ".##.", "#..#", ".##."),
    "9": (".##.", "#..#", ".###", "...#", "###."),
    ".": ("....", "....", "....", "....", "..#."),
    "-": ("....", "....", "####", "....", "...."),
    " ": ("....", "....", "....", "....", "...."),
    "Ú": (".##.", "....", "#..#", "#..#", "#..#", "#..#", ".##."),
}

FONT3 = {
    "A": (".#.", "#.#", "###", "#.#", "#.#"),
    "B": ("##.", "#.#", "##.", "#.#", "##."),
    "C": (".##", "#..", "#..", "#..", ".##"),
    "D": ("##.", "#.#", "#.#", "#.#", "##."),
    "E": ("###", "#..", "##.", "#..", "###"),
    "F": ("###", "#..", "##.", "#..", "#.."),
    "G": (".##", "#..", "#.#", "#.#", ".##"),
    "H": ("#.#", "#.#", "###", "#.#", "#.#"),
    "I": ("###", ".#.", ".#.", ".#.", "###"),
    "J": ("..#", "..#", "..#", "#.#", ".#."),
    "K": ("#.#", "#.#", "##.", "#.#", "#.#"),
    "L": ("#..", "#..", "#..", "#..", "###"),
    "M": ("#.#", "###", "###", "#.#", "#.#"),
    "N": ("#.#", "###", "#.#", "#.#", "#.#"),
    "O": (".#.", "#.#", "#.#", "#.#", ".#."),
    "P": ("##.", "#.#", "##.", "#..", "#.."),
    "Q": (".#.", "#.#", "#.#", "###", "..#"),
    "R": ("##.", "#.#", "##.", "#.#", "#.#"),
    "S": (".##", "#..", ".#.", "..#", "##."),
    "T": ("###", ".#.", ".#.", ".#.", ".#."),
    "U": ("#.#", "#.#", "#.#", "#.#", "###"),
    "V": ("#.#", "#.#", "#.#", "#.#", ".#."),
    "W": ("#.#", "#.#", "###", "###", "#.#"),
    "X": ("#.#", "#.#", ".#.", "#.#", "#.#"),
    "Y": ("#.#", "#.#", ".#.", ".#.", ".#."),
    "Z": ("###", "..#", ".#.", "#..", "###"),
    ".": ("...", "...", "...", "...", ".#."),
    "-": ("...", "...", "###", "...", "..."),
    " ": ("...", "...", "...", "...", "..."),
}


def font_width(s, font=FONT4, scale=1, spacing=1):
    if not s:
        return 0
    gw = len(next(iter(font.values()))[0])
    return (len(s) * (gw + spacing) - spacing) * scale


def draw_text(im, s, x, y, color, font=FONT4, scale=1, spacing=1):
    """Dibuja texto pixel. `y` es la fila superior de las letras de 5 px;
    los glifos altos (acentos) se alinean por abajo."""
    if not s:
        return
    gw = len(next(iter(font.values()))[0])
    adv = (gw + spacing) * scale
    for i, ch in enumerate(s.upper()):
        g = font.get(ch)
        if g is None:
            g = font[" "]
        base = 5 - len(g)  # glifos de 6-7 filas suben
        for gy, row in enumerate(g):
            yy = y + (base + gy) * scale
            for gx, c in enumerate(row):
                if c != "#":
                    continue
                for sy in range(scale):
                    for sx in range(scale):
                        put(im, x + i * adv + gx * scale + sx, yy + sy, color)


def plate_with_text(im, x, y, w, h, s, bg, fg, border=INK, font=FONT4,
                    scale=1, shadow=False):
    """Cartel: fondo, borde 1 px y texto centrado."""
    rect(im, x, y, w, h, bg)
    rect_outline(im, x, y, w, h, border)
    if shadow:
        hline(im, x + 1, y + h - 2, w - 2, SHADOW)
    tw = font_width(s, font, scale)
    tx = x + max(1, (w - tw) // 2)
    ty = y + max(1, (h - 5 * scale) // 2)
    draw_text(im, s, tx, ty, fg, font=font, scale=scale)


# ==========================================================================
# PERSONAJES 16x24 (3 columnas x 4 filas = 48x96)
# ==========================================================================
def _spec(**kw):
    base = dict(
        skin=SKIN_M, skin_hi=SKIN_L, skin_sh=SKIN_D,
        hair=HAIR_K, hair_hi=SHADOW,
        shirt=SHIRT_B, shirt_hi=WHITE, pants=PANTS_B, shoes=WHITE,
        dress=None, skirt=None, shorts=False, sandals=False,
        ponytail=False, cap=None, cap_hi=None,
        glasses=False, mustache=False, apron=False, purse=False,
        curly=False, rollers=False, bun=False, kid=False,
        pattern=None, hair_style="short",
    )
    base.update(kw)
    return base


BODIES = {
    "m": _spec(hair=HAIR_K, hair_hi=SHADOW, skin=SKIN_M, skin_hi=SKIN_L,
               skin_sh=SKIN_D, pants=PANTS_B, shoes=WHITE),
    "f": _spec(hair=HAIR_BR, hair_hi=DIRT, skin=SKIN_M, skin_hi=SKIN_L,
               skin_sh=SKIN_D, pants=PANTS_B, shoes=WHITE, ponytail=True),
}
SHIRTS = {"red": SHIRT_R, "blue": SHIRT_B, "yellow": SHIRT_Y, "green": SHIRT_G}

NPCS = {
    "nena": _spec(
        skin=SKIN_L, skin_hi=WHITE, skin_sh=SKIN_M,
        hair=ACERA, hair_hi=ACERA_L,
        dress=WALL_CORAL, apron=True, glasses=True, shoes=SHADOW,
    ),
    "pipe": _spec(
        skin=SKIN_D, skin_hi=SKIN_M, skin_sh=HAIR_BR,
        hair=HAIR_K, shirt=SHIRT_Y, cap=PTY_RED, cap_hi=SHIRT_R,
        shorts=True, sandals=True, shoes=SKIN_D, pattern="plain",
    ),
    "chen": _spec(
        skin=SKIN_L, skin_hi=WHITE, skin_sh=SKIN_M,
        hair=HAIR_K, shirt=SHIRT_R, pants=PANTS_D,
        mustache=True, pattern="hawaiian", shoes=SHADOW,
    ),
    "melva": _spec(
        skin=SKIN_M, skin_hi=SKIN_L, skin_sh=SKIN_D,
        hair=HAIR_K, dress=SHIRT_G, curly=True, purse=True,
        shoes=WHITE,
    ),
    "kevin": _spec(
        skin=SKIN_M, skin_hi=SKIN_L, skin_sh=SKIN_D,
        hair=HAIR_K, shirt=SHIRT_R, shorts=True, kid=True,
        shoes=WHITE, pattern="jersey",
    ),
    "yolanda": _spec(
        skin=SKIN_L, skin_hi=WHITE, skin_sh=SKIN_M,
        hair=HAIR_BR, hair_hi=DIRT, dress=LAVENDER,
        rollers=True, sandals=True, shoes=SKIN_M, pattern="robe",
    ),
    "ana": _spec(
        skin=SKIN_M, skin_hi=SKIN_L, skin_sh=SKIN_D,
        hair=HAIR_BR, hair_hi=DIRT, shirt=WHITE,
        skirt=SHIRT_B, bun=True, shoes=SHADOW,
    ),
    "chofer": _spec(
        skin=SKIN_D, skin_hi=SKIN_M, skin_sh=HAIR_BR,
        hair=HAIR_K, shirt=WALL_SKY, cap=PTY_BLUE, cap_hi=SHIRT_B,
        pants=PANTS_D, mustache=True, shoes=SHADOW,
    ),
}

# Enemigos del Slice A (matones). Misma hoja de personaje 48x96 que los NPC:
# 4 filas (down/left/right/up) x 3 frames (idle, paso A, paso B).
ENEMIES = {
    "maton": _spec(
        skin=SKIN_M, skin_hi=SKIN_L, skin_sh=SKIN_D,
        hair=HAIR_K, shirt=PANTS_D, pants=PANTS_B,
        cap=PTY_RED, cap_hi=SHIRT_R, shoes=SHADOW, pattern="plain",
    ),
    "maton-duro": _spec(
        skin=SKIN_D, skin_hi=SKIN_M, skin_sh=HAIR_BR,
        hair=HAIR_K, shirt=PTY_RED, pants=PANTS_D,
        mustache=True, shoes=SHADOW,
    ),
}

# Zombis del Slice B. Misma hoja 48x96; piel verdosa y ropa sucia.
ZOMBIES = {
    "infectado": _spec(
        skin=ZOMBIE_SKIN, skin_hi=WALL_MINT, skin_sh=ZOMBIE_SKIN_D,
        hair=HAIR_K, hair_hi=SHADOW, shirt=ZINC, pants=PANTS_D,
        shoes=SHADOW, glasses=True,
    ),
}


def _geom(spec):
    if spec["kid"]:
        return dict(head_top=2, head_bot=13, torso_top=14, torso_bot=17,
                    hip=18, leg_top=19, shoe_top=22, t0=4, t1=11)
    return dict(head_top=1, head_bot=10, torso_top=11, torso_bot=17,
                hip=18, leg_top=19, shoe_top=22, t0=4, t1=11)


# ---------------------------------------------------------------- cabeza
FRONT_SPANS = [
    (1, 5, 10), (2, 4, 11), (3, 3, 12), (4, 3, 12), (5, 3, 12),
    (6, 3, 12), (7, 3, 12), (8, 3, 12), (9, 4, 11), (10, 4, 11),
]
KID_SPANS = [
    (2, 4, 11), (3, 3, 12), (4, 2, 13), (5, 2, 13), (6, 2, 13),
    (7, 2, 13), (8, 2, 13), (9, 2, 13), (10, 2, 13), (11, 3, 12),
    (12, 3, 12), (13, 4, 11),
]


def _head_front(im, spec, g):
    top, bot = g["head_top"], g["head_bot"]
    spans = KID_SPANS if spec["kid"] else FRONT_SPANS
    skin, sh = spec["skin"], spec["skin_sh"]
    hair, hhi = spec["hair"], spec["hair_hi"]
    # cara llena
    for y, x0, x1 in spans:
        span(im, y, x0, x1, skin)
    # pelo: parte superior completa + patillas
    fringe = top + 3
    for y, x0, x1 in spans:
        if y <= fringe:
            span(im, y, x0, x1, hair)
    if spec["hair_style"] != "bald":
        for y in (fringe + 1, fringe + 2):
            if top <= y <= bot:
                put(im, spans[y - top][1], y, hair)
                put(im, spans[y - top][2], y, hair)
    # flequillo manga corta
    if spec["curly"]:
        for y, x0, x1 in spans:
            if fringe < y <= fringe + 3:
                put(im, x0, y, hair)
                put(im, x1, y, hair)
    # orejas (un pixel, sombreadas para que no parezcan bloques)
    ey = top + 6
    put(im, 2 - (1 if spec["kid"] else 0), ey, sh)
    put(im, 13 + (1 if spec["kid"] else 0), ey, sh)
    # brillo de pelo arriba-izquierda
    hspan = spans[1]
    put(im, hspan[1] + 1, top + 1, hhi)
    put(im, hspan[1] + 2, top + 2, hhi)
    put(im, hspan[1] + 3, top + 3, hhi)


def _face_front(im, spec, g, blink=False):
    top = g["head_top"]
    if spec["glasses"]:
        # armazon metalico gris con los ojos dentro
        for lx in (3, 10):
            hline(im, lx, top + 5, 3, ZINC_DARK)
            hline(im, lx, top + 7, 3, ZINC_DARK)
            put(im, lx, top + 6, ZINC_DARK)
            put(im, lx + 2, top + 6, ZINC_DARK)
            put(im, lx + 1, top + 6, INK)
        hline(im, 6, top + 6, 4, ZINC_DARK)    # puente
        put(im, 2, top + 6, ZINC_DARK)        # patas
        put(im, 13, top + 6, ZINC_DARK)
        put(im, 7, top + 8, INK)
        put(im, 8, top + 8, INK)
        return
    for ex in (5, 10):
        put(im, ex, top + 5, INK)
        if not blink:
            put(im, ex, top + 6, INK)
    # nariz
    put(im, 7, top + 7, spec["skin_sh"])
    # boca
    put(im, 7, top + 8, INK)
    put(im, 8, top + 8, INK)
    # mejillas
    put(im, 4, top + 7, spec["skin_hi"])
    put(im, 11, top + 7, spec["skin_hi"])


def _head_side(im, spec, g):
    top, bot = g["head_top"], g["head_bot"]
    skin, sh, hi = spec["skin"], spec["skin_sh"], spec["skin_hi"]
    hair, hhi = spec["hair"], spec["hair_hi"]
    # contorno del perfil (mira a la izquierda)
    rows = [
        (top, 4, 10), (top + 1, 3, 11), (top + 2, 2, 12), (top + 3, 2, 12),
        (top + 4, 2, 12), (top + 5, 2, 11), (top + 6, 2, 11),
        (top + 7, 1, 11), (top + 8, 2, 10), (top + 9, 3, 9),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, skin)
    # pelo: casco + nuca + flequillo lateral
    for y, x0, x1 in rows[:5]:
        span(im, y, x0, x1, hair)
    span(im, top + 5, 2, 4, hair)
    span(im, top + 5, 11, 11, hair)
    span(im, top + 6, 2, 3, hair)
    span(im, top + 6, 10, 11, hair)
    span(im, top + 7, 10, 11, hair)
    span(im, top + 8, 10, 10, hair)
    put(im, 9, top + 9, hair)
    # oreja
    put(im, 8, top + 6, sh)
    put(im, 8, top + 7, sh)
    # brillo de pelo
    span(im, top + 1, 4, 5, hhi)
    # ojo, nariz y boca
    put(im, 5, top + 6, INK)
    put(im, 5, top + 7, INK)
    put(im, 1, top + 7, skin)
    put(im, 1, top + 8, sh)
    put(im, 2, top + 8, sh)
    put(im, 3, top + 8, INK)
    # mejilla
    put(im, 4, top + 7, hi)


def _head_up(im, spec, g):
    top, bot = g["head_top"], g["head_bot"]
    spans = KID_SPANS if spec["kid"] else FRONT_SPANS
    hair, hhi = spec["hair"], spec["hair_hi"]
    for y, x0, x1 in spans:
        span(im, y, x0, x1, hair)
    # orejas asomando
    ey = top + 6
    put(im, 2 - (1 if spec["kid"] else 0), ey, spec["skin_sh"])
    put(im, 13 + (1 if spec["kid"] else 0), ey, spec["skin_sh"])
    # remolino, raya y brillo
    hspan = spans[1]
    span(im, top + 1, hspan[1] + 1, hspan[1] + 2, hhi)
    put(im, 8, top + 2, hhi)
    put(im, 7, top + 2, hhi)
    put(im, 8, top + 3, hhi)
    span(im, top + 6, 4, 5, hhi)
    # moño (se ve de espaldas)
    if spec["bun"] and top - 1 >= 0:
        span(im, top - 1, 6, 9, hair)
        put(im, 7, top - 1, hhi)
    # cuello
    span(im, top + 10, 6, 9, spec["skin"])


# ---------------------------------------------------------------- torso
def _torso(im, spec, g, direction, pose):
    t0, t1 = g["torso_top"], g["torso_bot"]
    x0, x1 = g["t0"], g["t1"]
    # vestido y blusa ocupan el torso completo; la camisa solo si no hay vestido
    shirt = spec["dress"] if spec["dress"] else spec["shirt"]
    if direction in ("down", "up"):
        # hombros
        span(im, t0, 3, 12, shirt)
        for y in range(t0 + 1, t1 + 1):
            span(im, y, x0, x1, shirt)
        # cuello
        span(im, t0, 6, 9, spec["skin"])
        if direction == "down":
            put(im, 7, t0, spec["skin_sh"])
            put(im, 8, t0, spec["skin_sh"])
    else:
        # perfil: hombro visible y torso angosto
        span(im, t0, 3, 11, shirt)
        for y in range(t0 + 1, t1 + 1):
            span(im, y, 4, 10, shirt)


def _arms_front(im, spec, g, pose):
    t0, t1 = g["torso_top"], g["torso_bot"]
    shirt = spec["dress"] if spec["dress"] else spec["shirt"]
    skin, sh, hi = spec["skin"], spec["skin_sh"], spec["skin_hi"]
    dy_l, dy_r = (0, 0)
    if pose == "a":
        dy_l, dy_r = -1, 1
    # manga corta + brazo
    for side, dx, dy in ((-1, 2, dy_l), (1, 12, dy_r)):
        yy = t0 + 1 + dy
        rect(im, dx, yy, 2, 2, shirt)
        rect(im, dx, yy + 2, 2, 3, skin)
        # mano
        rect(im, dx, yy + 4, 2, 1, skin)
        put(im, dx + (0 if side < 0 else 1), yy + 4, hi)
        # codo sombra
        put(im, dx + (0 if side < 0 else 1), yy + 2, sh)


def _arms_side(im, spec, g, pose):
    t0 = g["torso_top"]
    shirt = spec["dress"] if spec["dress"] else spec["shirt"]
    skin, sh = spec["skin"], spec["skin_sh"]
    dx = 2
    if pose == "a":
        dx = 1
    elif pose == "b":
        dx = 3
    rect(im, dx, t0, 2, 2, shirt)
    rect(im, dx, t0 + 2, 2, 3, skin)
    rect(im, dx, t0 + 5, 2, 1, skin)
    put(im, dx, t0 + 6, skin)
    put(im, dx + 1, t0 + 2, sh)


# ---------------------------------------------------------------- piernas
def _legs_front(im, spec, g, pose):
    hip, lt, st = g["hip"], g["leg_top"], g["shoe_top"]
    pants = spec["pants"] if not spec["dress"] else spec["dress"]
    dress = spec["dress"]
    skin = spec["skin"]
    shoes = spec["shoes"]
    if dress:
        # falda acampanada
        span(im, hip, 4, 11, dress)
        span(im, hip + 1, 3, 12, dress)
        span(im, hip + 2, 3, 12, dress)
        span(im, hip + 3, 4, 11, dress)
        lx, rx = (5, 6), (9, 10)
        for y in (hip + 4, hip + 5):
            for x in lx:
                put(im, x, y, skin)
            for x in rx:
                put(im, x, y, skin)
        _shoes_front(im, spec, (3, 6), (9, 12), st)
        return
    # pantalon
    span(im, hip, 4, 11, pants)
    span(im, hip + 1, 4, 11, pants)
    if spec["shorts"] or spec["skirt"]:
        if spec["skirt"]:
            span(im, hip + 1, 3, 12, spec["skirt"])
            span(im, hip + 2, 3, 12, spec["skirt"])
            for y in (hip + 3, hip + 4):
                for x in (5, 6, 9, 10):
                    put(im, x, y, skin)
        else:
            for y in (hip + 2, hip + 3):
                for x in (4, 5, 6, 9, 10, 11):
                    put(im, x, y, skin)
        _shoes_front(im, spec, (3, 6), (9, 12), st)
        return
    # piernas largas
    if pose == "idle":
        for y in range(lt, st):
            span(im, y, 4, 6, pants)
            span(im, y, 9, 11, pants)
        _shoes_front(im, spec, (3, 6), (9, 12), st)
    else:  # pose a: pierna izquierda adelante, derecha recogida
        for y in range(lt, st):
            span(im, y, 3, 5, pants)
        span(im, lt, 9, 11, pants)
        span(im, lt + 1, 9, 11, pants)
        _shoes_front(im, spec, (2, 5), (9, 12), st, lift_right=1)


def _shoes_front(im, spec, left, right, st, lift_right=0, lift_left=0):
    shoes = spec["shoes"]
    if spec["sandals"]:
        rect(im, left[0], st, left[1] - left[0] + 1, 2, spec["skin"])
        rect(im, right[0], st, right[1] - right[0] + 1, 2, spec["skin"])
        hline(im, left[0], st + 1, left[1] - left[0] + 1, INK)
        hline(im, right[0], st + 1, right[1] - right[0] + 1, INK)
    else:
        rect(im, left[0], st - lift_left, left[1] - left[0] + 1, 2, shoes)
        rect(im, right[0], st - lift_right, right[1] - right[0] + 1, 2, shoes)
        hline(im, left[0], st + 1 - lift_left, left[1] - left[0] + 1, INK)
        hline(im, right[0], st + 1 - lift_right, right[1] - right[0] + 1, INK)
        # cordones
        put(im, left[0] + 1, st - lift_left, INK)
        put(im, right[0] + 1, st - lift_right, INK)


def _legs_side(im, spec, g, pose):
    hip, lt, st = g["hip"], g["leg_top"], g["shoe_top"]
    pants = spec["pants"] if not spec["dress"] else spec["dress"]
    dress = spec["dress"]
    skin = spec["skin"]
    if dress:
        span(im, hip, 4, 10, dress)
        span(im, hip + 1, 3, 11, dress)
        span(im, hip + 2, 3, 11, dress)
        span(im, hip + 3, 4, 10, dress)
        for y in (hip + 4, hip + 5):
            put(im, 5, y, skin)
            put(im, 6, y, skin)
            put(im, 8, y, skin)
        _shoe_side(im, spec, (3, 7), (8, 12), st)
        return
    span(im, hip, 4, 10, pants)
    span(im, hip + 1, 4, 10, pants)
    if spec["shorts"]:
        for y in (hip + 2, hip + 3):
            put(im, 4, y, skin)
            put(im, 5, y, skin)
            put(im, 8, y, skin)
        _shoe_side(im, spec, (3, 7), (8, 12), st)
        return
    # pierna lejana
    if pose == "a":
        for y in range(lt, st):
            span(im, y, 9, 11, pants)
        _shoe_side(im, spec, None, (9, 12), st)
        for y in range(lt, st):
            span(im, y, 3, 5, pants)
        _shoe_side(im, spec, (1, 4), None, st)
    elif pose == "b":
        for y in range(lt, st):
            span(im, y, 3, 5, pants)
        _shoe_side(im, spec, None, (2, 5), st)
        for y in range(lt, st):
            span(im, y, 6, 8, pants)
        _shoe_side(im, spec, (6, 9), None, st)
    else:
        for y in range(lt, st):
            span(im, y, 8, 10, pants)
        _shoe_side(im, spec, None, (8, 11), st)
        for y in range(lt, st):
            span(im, y, 4, 6, pants)
        _shoe_side(im, spec, (3, 6), None, st)


def _shoe_side(im, spec, left, right, st):
    shoes = spec["shoes"]
    for rng in (left, right):
        if not rng:
            continue
        x0, x1 = rng
        if spec["sandals"]:
            rect(im, x0, st, x1 - x0 + 1, 2, spec["skin"])
            hline(im, x0, st + 1, x1 - x0 + 1, INK)
        else:
            rect(im, x0, st, x1 - x0 + 1, 2, shoes)
            hline(im, x0, st + 1, x1 - x0 + 1, INK)
            put(im, x0 + 1, st, INK)


# ---------------------------------------------------------------- accesorios
def _accessories(im, spec, g, direction, pose, frame):
    if spec["ponytail"]:
        _ponytail(im, spec, g, direction)
    if spec["cap"]:
        _cap(im, spec, g, direction)
    if spec["apron"]:
        _apron(im, spec, g, direction)
    if spec["glasses"] and direction == "left":
        _glasses_side(im, spec, g)
    if spec["purse"]:
        _purse(im, spec, g, direction)
    if spec["mustache"]:
        _mustache(im, spec, g, direction)
    if spec["pattern"] == "jersey":
        for y in (g["torso_top"] + 2, g["torso_bot"]):
            span(im, y, 4, 11, WHITE)
    elif spec["pattern"] == "hawaiian":
        for (x, y, c) in ((5, 13, WHITE), (9, 14, SHIRT_Y), (6, 16, SHIRT_Y), (10, 16, WHITE)):
            if direction in ("down", "up"):
                put(im, x, y, c)
        if direction == "left":
            for (x, y, c) in ((5, 13, WHITE), (8, 15, SHIRT_Y), (5, 16, WHITE)):
                put(im, x, y, c)
    elif spec["pattern"] == "robe":
        dots = ((5, 16), (9, 17), (5, 19), (10, 19), (8, 21))
        for (x, y) in dots:
            if direction == "left":
                x -= 1
            put(im, x, y, WHITE)
    if spec["rollers"]:
        for (x, y, c) in ((5, g["head_top"], WHITE), (8, g["head_top"] + 1, SHIRT_Y),
                          (11, g["head_top"], WALL_SKY)):
            if direction == "left":
                x -= 1
            put(im, x, y, c)
            put(im, x, y + 1, c)


def _ponytail(im, spec, g, direction):
    hair, hhi = spec["hair"], spec["hair_hi"]
    top = g["head_top"]
    if direction == "left":
        # coleta al lado contrario de la cara
        span(im, top + 3, 12, 14, hair)
        span(im, top + 4, 12, 14, hair)
        span(im, top + 5, 12, 13, hair)
        span(im, top + 6, 12, 13, hair)
        put(im, 13, top + 2, hhi)
    elif direction == "up":
        span(im, g["torso_top"], 6, 9, hair)
        span(im, g["torso_top"] + 1, 6, 9, hair)
        span(im, g["torso_top"] + 2, 6, 8, hair)
        put(im, 7, g["torso_top"] + 1, hhi)
    else:
        span(im, top + 4, 13, 13, hair)
        span(im, top + 5, 13, 14, hair)
        span(im, top + 6, 13, 14, hair)
        span(im, top + 7, 13, 13, hair)


def _cap(im, spec, g, direction):
    cap, hi = spec["cap"], spec["cap_hi"]
    top = g["head_top"]
    if direction == "left":
        span(im, top, 4, 10, cap)
        span(im, top + 1, 3, 11, cap)
        span(im, top + 2, 3, 12, cap)
        span(im, top + 3, 2, 12, cap)
        span(im, top + 4, 1, 5, cap)   # visera al frente
        put(im, 5, top + 1, hi)
    elif direction == "up":
        for y in range(top, top + 4):
            span(im, y, 3, 12, cap)
        span(im, top + 4, 4, 11, cap)
        put(im, 6, top + 1, hi)
    else:
        span(im, top, 4, 11, cap)
        span(im, top + 1, 3, 12, cap)
        span(im, top + 2, 3, 12, cap)
        span(im, top + 3, 3, 12, cap)
        span(im, top + 4, 4, 11, hi)   # visera
        put(im, 5, top + 1, hi)


def _apron(im, spec, g, direction):
    t0, t1 = g["torso_top"], g["torso_bot"]
    if direction == "up":
        return
    if direction == "left":
        rect(im, 4, t0 + 2, 6, t1 - t0 - 1, WHITE)
        vline(im, 4, t0 + 2, t1 - t0 - 1, ACERA_L)
        return
    rect(im, 5, t0 + 1, 6, t1 - t0, WHITE)
    vline(im, 5, t0 + 1, t1 - t0, ACERA_L)
    put(im, 5, t0, WHITE)
    put(im, 10, t0, WHITE)


def _glasses_side(im, spec, g):
    top = g["head_top"]
    hline(im, 3, top + 5, 3, ZINC_DARK)
    hline(im, 3, top + 7, 3, ZINC_DARK)
    put(im, 3, top + 6, ZINC_DARK)
    put(im, 5, top + 6, ZINC_DARK)
    put(im, 4, top + 6, INK)
    put(im, 6, top + 6, ZINC_DARK)
    put(im, 7, top + 6, ZINC_DARK)


def _purse(im, spec, g, direction):
    if direction == "left":
        rect(im, 12, g["torso_top"] + 4, 3, 4, ZINC_RUST)
        vline(im, 13, g["torso_top"] + 3, 2, HAIR_BR)
    elif direction == "up":
        rect(im, 12, g["torso_top"] + 4, 3, 4, ZINC_RUST)
    else:
        rect(im, 12, g["torso_top"] + 4, 3, 4, ZINC_RUST)
        vline(im, 13, g["torso_top"] + 3, 2, HAIR_BR)


def _mustache(im, spec, g, direction):
    top = g["head_top"]
    if direction == "left":
        span(im, top + 8, 1, 4, spec["hair"])
    elif direction == "up":
        return
    else:
        span(im, top + 8, 6, 9, spec["hair"])
        put(im, 5, top + 8, spec["hair"])
        put(im, 10, top + 8, spec["hair"])


# ---------------------------------------------------------------- ensamblado
def draw_character(spec, direction, frame):
    if direction == "right":
        return mirror(draw_character(spec, "left", frame))
    if frame == "b" and direction in ("down", "up"):
        return mirror(draw_character(spec, direction, "a"))
    im = new(16, 24)
    g = _geom(spec)
    pose = "idle" if frame == "idle" else "a"
    if direction == "down":
        _legs_front(im, spec, g, pose)
        _torso(im, spec, g, direction, pose)
        _arms_front(im, spec, g, pose)
        _head_front(im, spec, g)
        _face_front(im, spec, g)
        _accessories(im, spec, g, direction, pose, frame)
    elif direction == "left":
        _legs_side(im, spec, g, pose)
        _torso(im, spec, g, direction, pose)
        _arms_side(im, spec, g, pose)
        _head_side(im, spec, g)
        _accessories(im, spec, g, direction, pose, frame)
    else:  # up
        _legs_front(im, spec, g, pose)
        _torso(im, spec, g, direction, pose)
        _arms_front(im, spec, g, pose)
        _head_up(im, spec, g)
        _accessories(im, spec, g, direction, pose, frame)
    return outline(im)


def character_sheet(spec):
    sheet = new(48, 96)
    for row, direction in enumerate(("down", "left", "right", "up")):
        for col, frame in enumerate(("idle", "a", "b")):
            frame_im = draw_character(spec, direction, frame)
            sheet.paste(frame_im, (col * 16, row * 24), frame_im)
    return sheet


# ==========================================================================
# RETRATOS 32x32
# ==========================================================================
HEAD_SPANS_P = [
    (4, 13, 18), (5, 11, 20), (6, 10, 21), (7, 8, 23),
    (8, 8, 23), (9, 8, 23), (10, 8, 23), (11, 8, 23), (12, 8, 23),
    (13, 8, 23), (14, 8, 23), (15, 9, 22), (16, 10, 21), (17, 11, 20),
    (18, 12, 19),
]


def draw_portrait(spec):
    im = new(32, 32)
    skin, hi, sh = spec["skin"], spec["skin_hi"], spec["skin_sh"]
    hair, hhi = spec["hair"], spec["hair_hi"]
    shirt = spec["dress"] if spec["dress"] else spec["shirt"]

    # torso / hombros (busto)
    for y in range(21, 24):
        span(im, y, 5, 26, shirt)
    for y in range(24, 32):
        span(im, y, 6, 25, shirt)
    # cuello
    span(im, 19, 14, 17, skin)
    span(im, 20, 14, 17, skin)
    put(im, 14, 19, sh)
    put(im, 17, 19, sh)
    # cuello de camisa
    span(im, 21, 14, 17, WHITE)
    put(im, 13, 21, shirt)
    put(im, 18, 21, shirt)

    # cabeza
    for y, x0, x1 in HEAD_SPANS_P:
        span(im, y, x0, x1, skin)
    # orejas
    for y in (12, 13, 14):
        put(im, 7, y, skin)
        put(im, 24, y, skin)
        put(im, 7, y, skin if y != 14 else sh)
        put(im, 24, y, skin if y != 14 else sh)
    # pelo base
    for y, x0, x1 in HEAD_SPANS_P[:5]:
        span(im, y, x0, x1, hair)
    span(im, 8, 8, 10, hair)
    put(im, 11, 8, hair)
    put(im, 21, 8, hair)
    span(im, 8, 21, 23, hair)
    for y in range(9, 13):
        put(im, 8, y, hair)
        put(im, 23, y, hair)
    if spec["ponytail"]:
        for y in range(9, 19):
            put(im, 8, y, hair)
            put(im, 23, y, hair)
            if y < 16:
                put(im, 9, y, hair)
                put(im, 22, y, hair)

    # brillo de pelo
    put(im, 12, 5, hhi)
    put(im, 13, 6, hhi)
    put(im, 11, 6, hhi)

    # rasgos
    if spec["glasses"]:
        for lx in (10, 17):
            rect_outline(im, lx, 10, 5, 4, ZINC_DARK)
            put(im, lx + 2, 11, INK)
            put(im, lx + 2, 12, INK)
        span(im, 11, 15, 16, ZINC_DARK)
        put(im, 8, 11, ZINC_DARK)
        put(im, 23, 11, ZINC_DARK)
    else:
        for ex in (12, 19):
            rect(im, ex, 11, 2, 2, INK)
            put(im, ex, 11, WHITE)
        # cejas
        hline(im, 11, 9, 3, hair)
        hline(im, 18, 9, 3, hair)
    # nariz
    put(im, 15, 14, sh)
    put(im, 16, 14, sh)
    put(im, 15, 15, hi)
    # boca
    if spec["mustache"]:
        span(im, 15, 13, 18, hair)
        put(im, 12, 15, hair)
        put(im, 19, 15, hair)
        span(im, 17, 15, 16, INK)
    else:
        put(im, 14, 16, sh)
        put(im, 15, 16, INK)
        put(im, 16, 16, INK)
        put(im, 17, 16, sh)
    # mejillas
    put(im, 10, 15, hi)
    put(im, 11, 15, hi)
    put(im, 20, 15, hi)
    put(im, 21, 15, hi)

    # accesorios
    if spec["curly"]:
        bumps = ((6, 9), (6, 11), (6, 13), (7, 15), (24, 9), (25, 11), (25, 13), (24, 15))
        for (x, y) in bumps:
            put(im, x, y, hair)
            put(im, x, y + 1, hair)
    if spec["cap"]:
        cap, cap_hi = spec["cap"], spec["cap_hi"]
        for y in range(3, 8):
            span(im, y, 9, 22, cap)
        span(im, 8, 8, 23, cap_hi)
        put(im, 11, 4, cap_hi)
        put(im, 12, 5, cap_hi)
    if spec["bun"]:
        rect(im, 22, 2, 4, 4, hair)
        put(im, 21, 3, hair)
        put(im, 25, 3, hair)
        put(im, 23, 3, hhi)
    if spec["rollers"]:
        for (x, y, c) in ((10, 4, WHITE), (13, 3, SHIRT_Y), (17, 4, WALL_SKY), (20, 3, WHITE)):
            put(im, x, y, c)
    if spec["ponytail"]:
        span(im, 10, 24, 27, hair)
        for y in range(11, 18):
            span(im, y, 25, 27, hair)
        put(im, 25, 10, SHIRT_R)  # liga
        put(im, 26, 11, hhi)
    if spec["apron"]:
        rect(im, 10, 23, 12, 9, WHITE)
        vline(im, 10, 21, 3, WHITE)
        vline(im, 21, 21, 3, WHITE)
        vline(im, 10, 23, 9, ACERA_L)
    if spec["pattern"] == "hawaiian":
        for (x, y, c) in ((10, 26, WHITE), (17, 25, SHIRT_Y), (13, 29, SHIRT_Y),
                          (20, 28, WHITE), (8, 29, WHITE)):
            put(im, x, y, c)
    elif spec["pattern"] == "jersey":
        hline(im, 6, 26, 20, WHITE)
        hline(im, 6, 30, 20, WHITE)
    elif spec["pattern"] == "robe":
        for (x, y) in ((9, 27), (16, 30), (21, 27), (12, 24), (18, 23)):
            put(im, x, y, WHITE)

    return outline(im)


# ==========================================================================
# TILESET 256x16 (16 tiles de 16x16)
# ==========================================================================
def _tile_grass(rnd, variant):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, GRASS)
    # manchas suaves de grama oscura
    for _ in range(10):
        x, y = rnd.randrange(16), rnd.randrange(16)
        put(im, x, y, GRASS_D)
    blades = 3 if variant == 0 else 5
    for i in range(blades):
        x = (i * 5 + (1 if variant else 3)) % 15 + 1
        y = (i * 7 + 3) % 13 + 2
        put(im, x, y, LEAF_L)
        put(im, x, y + 1, LEAF_M)
        put(im, x, y + 2, GRASS_D)
    if variant:
        put(im, 4, 3, WHITE)
        put(im, 5, 3, SHIRT_Y)
        put(im, 12, 11, WHITE)
        put(im, 11, 11, SHIRT_Y)
    return im


def _tile_asphalt(rnd, variant):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ASPHALT)
    for _ in range(16):
        x, y = rnd.randrange(16), rnd.randrange(16)
        put(im, x, y, ASPHALT_L if rnd.random() < 0.6 else SHADOW)
    if variant == 0:
        # grieta
        crack = [(3, 1), (4, 2), (4, 3), (5, 4), (5, 5), (6, 6), (6, 7), (7, 8)]
        for (x, y) in crack:
            put(im, x, y, SHADOW)
        for (x, y) in ((9, 12), (10, 11), (11, 10), (12, 10)):
            put(im, x, y, SHADOW)
    else:
        # parche
        rect(im, 6, 8, 8, 6, ASPHALT_L)
        hline(im, 6, 8, 8, SHADOW)
        vline(im, 6, 8, 6, SHADOW)
        for _ in range(5):
            put(im, 7 + rnd.randrange(6), 9 + rnd.randrange(4), ASPHALT)
    return im


def _tile_sidewalk(rnd, variant):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ACERA)
    hline(im, 0, 0, 16, JOINT)
    hline(im, 0, 1, 16, ACERA_L)
    vline(im, 0, 0, 16, JOINT)
    vline(im, 1, 0, 16, ACERA_L)
    for _ in range(10):
        put(im, rnd.randrange(16), rnd.randrange(16), ACERA_L)
    if variant:
        rect(im, 9, 6, 3, 2, JOINT)
        put(im, 12, 7, JOINT)
    return im


def _tile_curb(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ACERA_L)
    hline(im, 0, 2, 16, ACERA)
    hline(im, 0, 10, 16, ACERA)
    hline(im, 0, 11, 16, JOINT)
    rect(im, 0, 12, 16, 4, SHADOW)
    hline(im, 0, 12, 16, INK)
    for x in range(0, 16, 4):
        put(im, x, 0, ACERA)
    return im


def _tile_dirt(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, DIRT)
    for _ in range(18):
        x, y = rnd.randrange(16), rnd.randrange(16)
        put(im, x, y, HAIR_BR if rnd.random() < 0.5 else SKIN_M)
    for _ in range(6):
        put(im, rnd.randrange(16), rnd.randrange(16), ACERA_L)
    return im


def _tile_stairs(rnd):
    im = new(16, 16)
    for i in range(4):
        y = i * 4
        rect(im, 0, y, 16, 3, ACERA_L)
        hline(im, 0, y + 3, 16, JOINT)
        put(im, 0, y, WHITE)
    return im


def _tile_court(rnd):
    im = new(16, 16)
    # cancha sintetica verde-teal (no celeste: parecia piscina)
    rect(im, 0, 0, 16, 16, COURT)
    for _ in range(10):
        put(im, rnd.randrange(16), rnd.randrange(16), COURT_D)
    # desgaste sutil
    for _ in range(4):
        x, y = rnd.randrange(14) + 1, rnd.randrange(14) + 1
        hline(im, x, y, 2, COURT_D)
    # linea de cancha en blanco hueso, con sombra de 1 px
    hline(im, 0, 8, 16, OFFWHITE)
    hline(im, 0, 9, 16, COURT_D)
    return im


def _tile_crosswalk(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ASPHALT)
    # franjas en blanco hueso para no contrastar tanto con el asfalto
    for x in (1, 5, 9, 13):
        rect(im, x, 0, 2, 16, OFFWHITE)
    for _ in range(8):
        x, y = rnd.randrange(16), rnd.randrange(16)
        if im.getpixel((x, y))[:3] == ASPHALT:
            put(im, x, y, ASPHALT_L)
    return im


def _tile_plaza(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ACERA)
    hline(im, 0, 0, 16, JOINT)
    vline(im, 0, 0, 16, JOINT)
    hline(im, 0, 8, 16, JOINT)
    vline(im, 8, 0, 16, JOINT)
    put(im, 2, 2, ACERA_L)
    put(im, 10, 2, ACERA_L)
    put(im, 2, 10, ACERA_L)
    put(im, 10, 10, ACERA_L)
    return im


def _tile_grass_worn(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, GRASS)
    rect(im, 4, 5, 8, 6, DIRT)
    put(im, 3, 4, DIRT)
    put(im, 12, 10, DIRT)
    put(im, 6, 9, GRASS_D)
    put(im, 9, 7, GRASS_D)
    for _ in range(5):
        put(im, 1 + rnd.randrange(14), 1 + rnd.randrange(14), GRASS_D)
    return im


def _tile_asphalt_patch(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ASPHALT)
    rect(im, 3, 4, 10, 8, SHADOW)
    rect_outline(im, 3, 4, 10, 8, ASPHALT_L)
    for _ in range(6):
        put(im, 4 + rnd.randrange(8), 5 + rnd.randrange(6), ASPHALT)
    return im


def _tile_concrete(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, ACERA_L)
    for _ in range(12):
        put(im, rnd.randrange(16), rnd.randrange(16), ACERA)
    put(im, 3, 3, WHITE)
    return im


def _tile_void(rnd):
    im = new(16, 16)
    rect(im, 0, 0, 16, 16, INK)
    for y in range(0, 16, 4):
        for x in range(0, 16, 4):
            put(im, x, y, SHADOW)
    return im


def make_tileset():
    tiles = []
    tiles.append(_tile_grass(random.Random(11), 0))
    tiles.append(_tile_grass(random.Random(12), 1))
    tiles.append(_tile_asphalt(random.Random(21), 0))
    tiles.append(_tile_asphalt(random.Random(22), 1))
    tiles.append(_tile_sidewalk(random.Random(31), 0))
    tiles.append(_tile_sidewalk(random.Random(32), 1))
    tiles.append(_tile_curb(random.Random(41)))
    tiles.append(_tile_dirt(random.Random(51)))
    tiles.append(_tile_stairs(random.Random(61)))
    tiles.append(_tile_court(random.Random(71)))
    tiles.append(_tile_crosswalk(random.Random(81)))
    tiles.append(_tile_plaza(random.Random(91)))
    tiles.append(_tile_grass_worn(random.Random(101)))
    tiles.append(_tile_asphalt_patch(random.Random(111)))
    tiles.append(_tile_concrete(random.Random(121)))
    tiles.append(_tile_void(random.Random(131)))
    sheet = Image.new("RGBA", (256, 16), (0, 0, 0, 255))
    for i, tile in enumerate(tiles):
        sheet.paste(tile, (i * 16, 0))
    return sheet


# ==========================================================================
# PROPS
# ==========================================================================
def _shadow_strip(im, cx, y, w, rows=2):
    x0 = cx - w // 2
    hline(im, x0, y, w, SHADOW)
    if rows > 1:
        hline(im, x0 + 2, y + 1, max(1, w - 4), SHADOW)


def draw_palm():
    im = new(32, 48)
    # tronco curvo
    for i in range(32):
        y = 46 - i
        x = 15 + (i * 8) // 32
        rect(im, x, y, 3, 1, ZINC_RUST)
        put(im, x + 2, y, HAIR_BR)
        if i % 4 == 0:
            hline(im, x, y, 3, HAIR_BR)
    # corona
    cx, cy = 19, 14
    fronds = [(-11, -3), (-8, -8), (-3, -11), (3, -11), (8, -8), (11, -3),
              (-11, 2), (11, 2)]
    for dx, dy in fronds:
        n = max(abs(dx), abs(dy))
        for i in range(1, n + 1):
            xx = cx + int(round(dx * i / n))
            yy = cy + int(round(dy * i / n))
            put(im, xx, yy, LEAF_D if i < n else LEAF_M)
            put(im, xx, yy - 1, LEAF_M)
            put(im, xx, yy + 1, LEAF_D)
            if i % 2 == 0:
                put(im, xx - 1, yy, LEAF_D)
                put(im, xx + 1, yy, LEAF_L)
                put(im, xx, yy - 2, LEAF_M)
    rect(im, cx - 1, cy - 1, 3, 3, LEAF_M)
    put(im, cx, cy, LEAF_L)
    # cocos
    put(im, cx - 4, cy + 4, HAIR_BR)
    put(im, cx + 2, cy + 5, HAIR_BR)
    put(im, cx + 3, cy + 4, ZINC_RUST)
    out = outline(im)
    _shadow_strip(out, 16, 46, 12)
    return out


def draw_mango_tree():
    im = new(32, 40)
    # tronco
    rect(im, 14, 26, 4, 13, ZINC_RUST)
    vline(im, 14, 27, 12, HAIR_BR)
    hline(im, 15, 34, 2, HAIR_BR)
    # copa en capas
    canopy = [
        (16, 8, 9, 7), (16, 14, 12, 8), (16, 21, 12, 7), (16, 28, 8, 5),
    ]
    for cx, cy, rw, rh in canopy:
        for y in range(cy - rh, cy + rh + 1):
            dy = (y - cy) / max(1, rh)
            w = int(rw * math.sqrt(max(0.0, 1 - dy * dy)))
            for x in range(cx - w, cx + w + 1):
                put(im, x, y, LEAF_M if y < cy + rh // 2 else LEAF_D)
    # luces
    for (x, y) in ((11, 10), (13, 7), (17, 8), (21, 12), (8, 16), (24, 17), (14, 22)):
        put(im, x, y, LEAF_L)
        put(im, x + 1, y, LEAF_L)
    # mangos
    for (x, y) in ((8, 19), (25, 15), (19, 24), (12, 25)):
        put(im, x, y, SHIRT_Y)
        put(im, x, y + 1, ZINC_RUST)
    out = outline(im)
    _shadow_strip(out, 16, 38, 16)
    return out


def draw_bush():
    im = new(16, 16)
    rows = [
        (5, 6, 10), (6, 3, 12), (7, 2, 13), (8, 2, 13), (9, 2, 13),
        (10, 3, 12), (11, 4, 11), (12, 5, 10), (13, 6, 9),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, LEAF_M)
    for (x, y) in ((4, 7), (7, 6), (10, 8), (12, 10), (5, 10)):
        put(im, x, y, LEAF_L)
        put(im, x + 1, y, LEAF_L)
    span(im, 12, 5, 10, LEAF_D)
    span(im, 13, 6, 9, LEAF_D)
    out = outline(im)
    _shadow_strip(out, 8, 14, 8, rows=1)
    return out


def draw_power_pole():
    im = new(16, 48)
    # poste de concreto
    rect(im, 7, 6, 3, 41, ACERA)
    vline(im, 7, 6, 41, ACERA_L)
    vline(im, 9, 6, 41, JOINT)
    # travesano de madera
    rect(im, 2, 11, 13, 2, ZINC_RUST)
    hline(im, 2, 11, 13, HAIR_BR)
    # aisladores
    for x in (4, 7, 12):
        put(im, x, 10, ACERA_L)
        put(im, x, 9, WHITE)
    # transformador
    rect(im, 10, 17, 4, 7, ZINC)
    vline(im, 10, 17, 7, ZINC_L)
    vline(im, 13, 17, 7, ZINC_DARK)
    hline(im, 10, 17, 4, ZINC_DARK)
    hline(im, 10, 20, 4, ZINC_DARK)
    hline(im, 10, 23, 4, ZINC_DARK)
    # lampara
    rect(im, 5, 7, 2, 2, SHADOW)
    put(im, 5, 7, SHIRT_Y)
    out = outline(im)
    _shadow_strip(out, 8, 46, 8, rows=1)
    return out


def draw_bench():
    im = new(24, 16)
    # respaldo
    rect(im, 2, 2, 20, 4, ZINC_RUST)
    hline(im, 2, 2, 20, HAIR_BR)
    hline(im, 2, 5, 20, HAIR_BR)
    vline(im, 2, 2, 4, HAIR_BR)
    vline(im, 21, 2, 4, HAIR_BR)
    # asiento
    rect(im, 2, 8, 20, 2, ZINC_RUST)
    hline(im, 2, 8, 20, HAIR_BR)
    # patas metalicas
    rect(im, 3, 10, 2, 5, ACERA)
    rect(im, 19, 10, 2, 5, ACERA)
    vline(im, 3, 10, 5, ACERA_L)
    vline(im, 20, 10, 5, JOINT)
    hline(im, 4, 14, 3, INK)
    hline(im, 18, 14, 3, INK)
    out = outline(im)
    _shadow_strip(out, 12, 14, 18, rows=2)
    return out


def draw_trash():
    im = new(12, 16)
    # cuerpo
    rect(im, 2, 4, 8, 10, SHIRT_B)
    vline(im, 2, 4, 10, WALL_SKY)
    vline(im, 9, 4, 10, PTY_BLUE)
    # tapa
    rect(im, 1, 2, 10, 3, ZINC)
    hline(im, 1, 2, 10, ZINC_L)
    rect(im, 5, 1, 2, 1, INK)
    # banda
    hline(im, 2, 8, 8, ACERA)
    hline(im, 2, 12, 8, SHADOW)
    out = outline(im)
    _shadow_strip(out, 6, 14, 8, rows=1)
    return out


def draw_fence():
    im = new(16, 16)
    # barrotes verticales
    for x in (1, 5, 9, 13):
        rect(im, x, 1, 2, 14, SHADOW)
        vline(im, x, 2, 13, ACERA)
        put(im, x, 1, ACERA_L)
        put(im, x, 0, SHADOW)
    # travesanos
    hline(im, 0, 4, 16, SHADOW)
    hline(im, 0, 5, 16, ACERA)
    hline(im, 0, 11, 16, SHADOW)
    hline(im, 0, 12, 16, ACERA)
    out = outline(im)
    _shadow_strip(out, 8, 15, 14, rows=1)
    return out


def draw_sign():
    im = new(16, 24)
    # poste
    rect(im, 7, 18, 2, 5, ACERA)
    vline(im, 7, 18, 5, ACERA_L)
    vline(im, 8, 18, 5, JOINT)
    # placa verde (nombre de la calle en tres lineas para que sea legible)
    rect(im, 1, 1, 14, 17, LEAF_D)
    rect_outline(im, 1, 1, 14, 17, WHITE)
    hline(im, 2, 15, 12, LEAF_M)
    draw_text(im, "SAN", 2, 2, WHITE, font=FONT3)
    draw_text(im, "ISI", 2, 8, WHITE, font=FONT3)
    draw_text(im, "DRO", 2, 13, WHITE, font=FONT3)
    out = outline(im)
    _shadow_strip(out, 8, 23, 6, rows=1)
    return out


def draw_cone():
    im = new(8, 8)
    rows = [(2, 3, 4), (3, 2, 5), (4, 1, 6), (5, 1, 6), (6, 0, 7)]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, PTY_RED)
    span(im, 4, 2, 5, WHITE)
    span(im, 5, 2, 5, WHITE)
    rect(im, 0, 6, 8, 2, PTY_RED)
    hline(im, 0, 7, 8, INK)
    out = outline(im)
    _shadow_strip(out, 4, 7, 8, rows=1)
    return out


def draw_hoop():
    im = new(16, 24)
    # poste
    rect(im, 7, 10, 3, 14, ACERA)
    vline(im, 7, 10, 14, ACERA_L)
    vline(im, 9, 10, 14, JOINT)
    # tablero
    rect(im, 3, 1, 10, 8, WHITE)
    rect_outline(im, 3, 1, 10, 8, INK)
    hline(im, 5, 2, 6, ZINC)
    # aro
    hline(im, 4, 9, 8, PTY_RED)
    put(im, 3, 9, INK)
    put(im, 12, 9, INK)
    # red
    for x in (5, 7, 9, 11):
        put(im, x, 10, WHITE)
    put(im, 6, 11, WHITE)
    put(im, 9, 11, WHITE)
    out = outline(im)
    _shadow_strip(out, 8, 22, 6, rows=1)
    return out


def draw_stall():
    im = new(40, 32)
    # sombrilla a rayas
    for i, x in enumerate(range(2, 38, 6)):
        c = PTY_RED if i % 2 == 0 else SHIRT_Y
        rect(im, x, 2, 6, 5, c)
    hline(im, 2, 1, 36, PTY_RED)
    hline(im, 2, 6, 36, ZINC_DARK)
    for x in range(2, 38, 6):
        put(im, x, 7, SHIRT_Y if (x // 6) % 2 else PTY_RED)
    # interior oscuro
    rect(im, 5, 7, 30, 11, SHADOW)
    hline(im, 5, 10, 30, ZINC_DARK)
    hline(im, 5, 14, 30, ZINC_DARK)
    # postes
    rect(im, 3, 7, 2, 20, ZINC_RUST)
    rect(im, 35, 7, 2, 20, ZINC_RUST)
    vline(im, 3, 7, 20, ACERA_L)
    vline(im, 36, 7, 20, HAIR_BR)
    # mostrador
    rect(im, 2, 17, 36, 3, ZINC_RUST)
    hline(im, 2, 17, 36, ACERA)
    hline(im, 2, 19, 36, SHADOW)
    rect(im, 2, 20, 36, 9, HAIR_BR)
    for x in range(4, 36, 5):
        put(im, x, 23, ZINC_RUST)
        put(im, x, 26, ZINC_RUST)
    # cajas de fruta sobre el mostrador
    frutas = [
        ("yellow", SHIRT_Y, TAXI),
        ("red", PTY_RED, SHIRT_R),
        ("green", SHIRT_G, LEAF_L),
        ("mixed", SHIRT_Y, PTY_RED),
    ]
    for i, (name, c1, c2) in enumerate(frutas):
        cx = 4 + i * 9
        rect(im, cx, 12, 8, 5, ACERA)
        hline(im, cx, 12, 8, ZINC_RUST)
        hline(im, cx, 16, 8, ZINC_RUST)
        rect(im, cx + 1, 13, 2, 2, c1)
        rect(im, cx + 4, 13, 2, 2, c2)
        rect(im, cx + 2, 15, 2, 1, c1)
        rect(im, cx + 5, 15, 2, 1, c2)
    out = outline(im)
    _shadow_strip(out, 20, 30, 34, rows=2)
    return out


def draw_dog():
    im = new(16, 16)
    # cuerpo
    rect(im, 3, 8, 9, 4, DIRT)
    put(im, 3, 8, DIRT)
    hline(im, 3, 11, 9, SKIN_D)
    # patas
    rect(im, 4, 12, 2, 3, DIRT)
    rect(im, 9, 12, 2, 3, DIRT)
    hline(im, 4, 15, 2, INK)
    hline(im, 9, 15, 2, INK)
    # cabeza
    rect(im, 10, 5, 4, 5, DIRT)
    put(im, 10, 5, DIRT)
    put(im, 13, 6, DIRT)
    # orejas
    put(im, 11, 4, HAIR_BR)
    put(im, 12, 4, HAIR_BR)
    # hocico + ojo + nariz
    put(im, 14, 8, SKIN_D)
    put(im, 15, 8, INK)
    put(im, 12, 7, INK)
    # cola
    put(im, 2, 7, DIRT)
    put(im, 1, 6, DIRT)
    put(im, 1, 5, DIRT)
    out = outline(im)
    _shadow_strip(out, 8, 14, 10, rows=1)
    return out


def draw_puddle():
    im = new(16, 8)
    rows = [(2, 3, 12), (3, 2, 13), (4, 2, 13), (5, 3, 12), (6, 5, 10)]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, WALL_SKY)
    span(im, 3, 4, 7, ACERA_L)
    put(im, 8, 2, WHITE)
    put(im, 9, 2, WHITE)
    return outline(im, SHADOW)


def draw_planter():
    im = new(16, 16)
    # maceta
    rect(im, 3, 9, 10, 4, ZINC_RUST)
    rect(im, 4, 13, 8, 2, ZINC_RUST)
    hline(im, 2, 8, 12, ZINC_RUST)
    hline(im, 2, 8, 12, SKIN_D)
    vline(im, 2, 8, 6, HAIR_BR)
    vline(im, 13, 8, 6, HAIR_BR)
    hline(im, 3, 10, 9, HAIR_BR)
    # planta
    rows = [(2, 6, 9), (3, 5, 10), (4, 4, 11), (5, 5, 9), (6, 6, 8)]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, LEAF_M)
    for (x, y) in ((5, 3), (8, 2), (10, 4), (6, 6), (9, 6)):
        put(im, x, y, LEAF_L)
    out = outline(im)
    _shadow_strip(out, 8, 14, 10, rows=1)
    return out


# ==========================================================================
# VEHICULOS
# ==========================================================================
def draw_car(color, taxi=False):
    im = new(32, 24)
    # carroceria
    rect(im, 2, 12, 28, 8, color)
    rect(im, 3, 20, 26, 1, SHADOW)
    # cabina
    rect(im, 8, 6, 16, 7, color)
    put(im, 8, 6, color)
    put(im, 23, 6, color)
    # ventanas
    rect(im, 9, 7, 6, 4, WALL_SKY)
    rect(im, 17, 7, 6, 4, WALL_SKY)
    put(im, 9, 7, WHITE)
    put(im, 17, 7, WHITE)
    hline(im, 8, 11, 16, SHADOW)
    vline(im, 16, 7, 4, color)
    # puerta
    vline(im, 16, 12, 7, SHADOW)
    put(im, 17, 14, ZINC_RUST)
    # faros
    rect(im, 1, 14, 2, 2, TAXI)
    rect(im, 30, 14, 1, 2, PTY_RED)
    # parachoques
    rect(im, 0, 18, 3, 3, ZINC_DARK)
    rect(im, 29, 18, 3, 3, ZINC_DARK)
    # ruedas
    for wx in (6, 22):
        rect(im, wx, 19, 5, 4, TIRE)
        rect(im, wx + 1, 20, 3, 2, ACERA)
        put(im, wx + 2, 21, SHADOW)
    if taxi:
        # rotulo de taxi
        rect(im, 13, 2, 7, 4, WHITE)
        rect_outline(im, 13, 2, 7, 4, INK)
        span(im, 3, 15, 17, SHIRT_Y)
        # franja a cuadros panameña
        for x in range(4, 29, 4):
            put(im, x, 19, WHITE)
            put(im, x + 1, 19, INK)
    out = outline(im)
    _shadow_strip(out, 16, 22, 28, rows=2)
    return out


def draw_diablo_rojo():
    im = new(64, 32)
    # letrero superior (tablero de destino oscuro con letras claras)
    rect(im, 7, 1, 50, 7, SHADOW)
    rect_outline(im, 7, 1, 50, 7, ACERA_L)
    draw_text(im, "S. MIGUELITO", 9, 2, WHITE, font=FONT3)
    # cuerpo
    rect(im, 1, 7, 62, 22, PTY_RED)
    hline(im, 1, 7, 62, SHIRT_R)
    # banda de ventanas
    rect(im, 2, 9, 59, 7, SHADOW)
    for i in range(8):
        x = 4 + i * 7
        rect(im, x, 10, 5, 5, WALL_SKY)
        put(im, x, 10, WHITE)
        put(im, x + 1, 10, WHITE)
        put(im, x, 11, ACERA_L)
    # parabrisas delantero
    rect(im, 58, 9, 5, 7, WALL_SKY)
    put(im, 58, 9, WHITE)
    # decoracion
    hline(im, 1, 17, 62, SHIRT_Y)
    hline(im, 1, 18, 62, PTY_BLUE)
    hline(im, 1, 19, 62, SHIRT_Y)
    for i in range(0, 60, 8):
        put(im, 2 + i, 21, WHITE)
        put(im, 3 + i, 21, SHIRT_G)
        put(im, 4 + i, 22, SHIRT_Y)
        put(im, 5 + i, 22, PTY_BLUE)
        put(im, 6 + i, 23, WHITE)
    hline(im, 1, 24, 62, SHIRT_Y)
    # puerta y escalones
    rect(im, 52, 16, 6, 11, WALL_SKY)
    rect_outline(im, 52, 16, 6, 11, INK)
    put(im, 54, 20, INK)
    # faros y parachoques
    rect(im, 61, 22, 2, 2, SHIRT_Y)
    rect(im, 57, 27, 6, 2, ZINC_DARK)
    # ruedas
    for wx in (8, 46):
        rect(im, wx, 24, 7, 6, TIRE)
        rect(im, wx + 1, 25, 5, 4, ACERA)
        rect(im, wx + 2, 26, 3, 2, ZINC_DARK)
    out = outline(im)
    _shadow_strip(out, 32, 30, 60, rows=2)
    return out


def draw_chancla():
    im = new(12, 8)
    # suela
    rect(im, 1, 2, 9, 4, DIRT)
    rect(im, 1, 5, 9, 2, HAIR_BR)
    put(im, 2, 2, SKIN_M)
    # correa
    put(im, 3, 3, PTY_RED)
    put(im, 4, 2, PTY_RED)
    put(im, 5, 2, PTY_RED)
    put(im, 6, 3, PTY_RED)
    put(im, 7, 4, PTY_RED)
    return outline(im, WHITE)


# ==========================================================================
# EDIFICIOS (perspectiva 3/4, ancla abajo-centro)
# ==========================================================================
def zinc_roof(im, x, y, w, h, ridge=4, rust=True):
    for i in range(h):
        t = i / (h - 1) if h > 1 else 1.0
        inset = int(round((1 - t) * ridge))
        x0, x1 = x + inset, x + w - 1 - inset
        span(im, y + i, x0, x1, ZINC)
        for xx in range(x0, x1 + 1):
            m = (xx - x) % 4
            if m == 0:
                put(im, xx, y + i, ZINC_L)
            elif m == 2:
                put(im, xx, y + i, ZINC_DARK)
        put(im, x0, y + i, ZINC_DARK)
        put(im, x1, y + i, ZINC_DARK)
    span(im, y, x + ridge, x + w - 1 - ridge, ZINC_L)
    hline(im, x + ridge, y + 1, w - 2 * ridge, ZINC_DARK)
    hline(im, x, y + h - 1, w, ZINC_DARK)
    if rust:
        for (ox, oy) in ((x + 6, y + h - 4), (x + w - 12, y + h - 6),
                         (x + w // 2, y + h - 5)):
            put(im, ox, oy, ZINC_RUST)
            put(im, ox + 1, oy, ZINC_RUST)


def wall(im, x, y, w, h, color):
    rect(im, x, y, w, h, color)
    vline(im, x, y, h, WHITE)
    vline(im, x + w - 1, y, h, SHADOW)
    hline(im, x, y, w, SHADOW)


def window(im, x, y, w, h, reja=False):
    rect(im, x, y, w, h, ACERA_L)
    rect_outline(im, x, y, w, h, INK)
    rect(im, x + 1, y + 1, w - 2, h - 2, WALL_SKY)
    put(im, x + 2, y + 2, WHITE)
    put(im, x + 3, y + 2, WHITE)
    put(im, x + 2, y + 3, WHITE)
    hline(im, x + 1, y + h - 2, w - 2, SHADOW)
    if reja:
        for xx in range(x + 2, x + w - 1, 2):
            vline(im, xx, y + 1, h - 2, INK)
        hline(im, x + 1, y + h // 2, w - 2, INK)


def door(im, x, y, w, h, color=ZINC_RUST, glass=False):
    rect(im, x, y, w, h, ACERA_L)
    rect_outline(im, x, y, w, h, INK)
    rect(im, x + 1, y + 1, w - 2, h - 2, WALL_SKY if glass else color)
    if not glass:
        rect_outline(im, x + 2, y + 2, w - 4, h // 2 - 2, HAIR_BR)
        rect_outline(im, x + 2, y + 2 + h // 2, w - 4, h // 2 - 3, HAIR_BR)
    else:
        vline(im, x + w // 2, y + 1, h - 2, ACERA_L)
        put(im, x + 3, y + 2, WHITE)
    put(im, x + w - 3, y + h // 2, SHIRT_Y)


def base_strip(im, x, y, w):
    rect(im, x, y, w, 3, ACERA)
    hline(im, x, y, w, JOINT)
    hline(im, x, y + 2, w, SHADOW)


def building_shadow(im, W, H, margin=3, rows=3):
    for i in range(rows):
        w = W - margin * 2 - i * 2
        if w <= 0:
            continue
        rect(im, (W - w) // 2, H - rows + i, w, 1, SHADOW)


def panama_flag(im, x, y, w=14, h=10):
    hw, hh = w // 2, h // 2
    rect(im, x, y, hw, hh, WHITE)
    rect(im, x + hw, y, w - hw, hh, PTY_RED)
    rect(im, x, y + hh, hw, h - hh, PTY_BLUE)
    rect(im, x + hw, y + hh, w - hw, h - hh, WHITE)
    star(im, x + 2, y + 1, PTY_BLUE)
    star(im, x + hw + 2, y + hh + 1, PTY_RED)


def star(im, cx, cy, c):
    put(im, cx, cy, c)
    put(im, cx - 1, cy, c)
    put(im, cx + 1, cy, c)
    put(im, cx, cy - 1, c)
    put(im, cx, cy + 1, c)


def flagpole(im, x, y_top, y_bottom):
    rect(im, x, y_top, 2, y_bottom - y_top, ACERA)
    vline(im, x, y_top, y_bottom - y_top, ACERA_L)
    put(im, x, y_top - 1, SHIRT_Y)
    put(im, x + 1, y_top - 1, SHIRT_Y)


def water_tank(im, x, y, w=15, h=13):
    rect(im, x, y + 2, w, h - 4, ZINC)
    rect(im, x + 1, y, w - 2, 2, ZINC_L)
    hline(im, x, y + h - 3, w, ZINC_DARK)
    for xx in range(x + 2, x + w - 1, 3):
        vline(im, xx, y + 4, h - 8, ZINC_DARK)
    rect(im, x + w // 2 - 2, y + h - 2, 2, 2, SHADOW)
    rect(im, x + w - 4, y + h - 2, 2, 2, SHADOW)


def awning(im, x, y, w, h, c1=PTY_RED, c2=SHIRT_Y, stripe=6):
    for i in range(w):
        c = c1 if (i // stripe) % 2 == 0 else c2
        vline(im, x + i, y, h - 2, c)
    hline(im, x, y, w, WHITE)
    hline(im, x, y + h - 3, w, SHADOW)
    for i in range(0, w, 3):
        c = c1 if (i // stripe) % 2 == 0 else c2
        put(im, x + i, y + h - 2, SHADOW)
        put(im, x + i + 1, y + h - 2, c)
        put(im, x + i + 2, y + h - 2, c)
        put(im, x + i + 1, y + h - 1, SHADOW)


def balcony(im, x, y, w, rail_h=8):
    # baranda
    hline(im, x, y, w, ACERA)
    for xx in range(x, x + w, 4):
        vline(im, xx, y + 1, rail_h - 1, SHADOW)
        put(im, xx, y, ACERA_L)
    # losa
    rect(im, x - 2, y + rail_h, w + 4, 3, ACERA)
    hline(im, x - 2, y + rail_h, w + 4, ACERA_L)
    hline(im, x - 2, y + rail_h + 2, w + 4, SHADOW)


def clothesline(im, x1, x2, y, sag=2):
    for x in range(x1, x2):
        t = (x - x1) / max(1, x2 - x1)
        yy = y + int(round(sag * 4 * t * (1 - t)))
        put(im, x, yy, INK)
    clothes = [(x1 + 8, SHIRT_R), (x1 + 26, SHIRT_B), (x1 + 44, SHIRT_Y),
               (x1 + 60, WHITE), (x1 + 76, SHIRT_G)]
    for (cx, c) in clothes:
        if cx > x2 - 6:
            continue
        rect(im, cx, y + sag + 1, 6, 7, c)
        put(im, cx + 1, y + sag, INK)
        put(im, cx + 4, y + sag, INK)
        vline(im, cx + 2, y + sag + 2, 4, SHADOW)


def reja_fence(im, x1, x2, y, h, gap=None):
    x = x1
    while x < x2:
        if gap and gap[0] <= x <= gap[1]:
            x += 1
            continue
        vline(im, x, y, h, SHADOW)
        put(im, x, y, ACERA)
        x += 3
    if not gap:
        hline(im, x1, y, x2 - x1, SHADOW)
        hline(im, x1, y + h - 1, x2 - x1, SHADOW)


def draw_house_a():
    W, H = 80, 64
    im = new(W, H)
    zinc_roof(im, 2, 3, 76, 21, ridge=4)
    wall(im, 6, 23, 68, 34, WALL_CREAM)
    # esquinas
    vline(im, 6, 23, 34, ZINC_RUST)
    vline(im, 73, 23, 34, HAIR_BR)
    window(im, 12, 32, 14, 12)
    window(im, 54, 32, 14, 12, reja=True)
    door(im, 34, 38, 12, 20, ZINC_RUST)
    # escalon
    rect(im, 32, 56, 16, 2, ACERA)
    hline(im, 32, 56, 16, ACERA_L)
    # verja baja al frente
    for (fx0, fx1) in ((7, 30), (50, 73)):
        for px in range(fx0, fx1, 8):
            vline(im, px, 48, 9, ZINC_RUST)
            put(im, px, 47, ACERA_L)
        hline(im, fx0, 51, fx1 - fx0, ZINC_RUST)
        hline(im, fx0, 55, fx1 - fx0, ZINC_RUST)
    base_strip(im, 4, 58, 72)
    out = outline(im)
    # maceta junto a la puerta
    rect(im, 26, 52, 6, 6, ZINC_RUST)
    hline(im, 25, 51, 8, ZINC_RUST)
    put(im, 27, 48, LEAF_M)
    put(im, 28, 47, LEAF_L)
    put(im, 29, 48, LEAF_M)
    out = outline(out)
    building_shadow(out, W, H)
    return out


def draw_house_b():
    W, H = 64, 64
    im = new(W, H)
    zinc_roof(im, 2, 2, 60, 20, ridge=3)
    wall(im, 7, 21, 50, 35, WALL_CORAL)
    vline(im, 7, 21, 35, WHITE)
    window(im, 12, 30, 11, 12)
    door(im, 27, 39, 11, 19, SHIRT_G)
    put(im, 26, 36, SHIRT_Y)
    put(im, 37, 36, SHIRT_Y)
    # macetas
    for (px, leaf) in ((6, SHIRT_R), (51, SHIRT_Y)):
        rect(im, px, 49, 7, 8, ZINC_RUST)
        hline(im, px - 1, 48, 9, ZINC_RUST)
        hline(im, px + 1, 52, 5, HAIR_BR)
        for i in range(4):
            put(im, px + i + 1, 45 - (i % 2), LEAF_M)
            put(im, px + i + 1, 41 - (i % 3), LEAF_L)
        put(im, px + 3, 44, leaf)
    base_strip(im, 5, 55, 54)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_house_c():
    W, H = 96, 80
    im = new(W, H)
    zinc_roof(im, 2, 2, 92, 18, ridge=5)
    wall(im, 6, 19, 84, 53, WALL_MINT)
    hline(im, 6, 46, 84, SHADOW)
    vline(im, 6, 19, 53, WHITE)
    vline(im, 89, 19, 53, SHADOW)
    # piso alto
    for wx in (12, 38, 64):
        window(im, wx, 25, 12, 12, reja=True)
    # tendedero bajo el alero
    clothesline(im, 12, 84, 20, sag=2)
    # balcon
    balcony(im, 10, 39, 76, rail_h=8)
    # piso bajo
    window(im, 12, 57, 12, 11)
    window(im, 70, 57, 12, 11)
    door(im, 41, 51, 14, 21, WALL_CORAL)
    rect(im, 38, 70, 20, 2, ACERA)
    base_strip(im, 4, 72, 88)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_apartment_a():
    W, H = 96, 88
    im = new(W, H)
    # azotea con parapeto
    rect(im, 3, 3, 90, 8, ZINC)
    hline(im, 3, 3, 90, ZINC_L)
    hline(im, 3, 9, 90, ZINC_DARK)
    for xx in range(6, 92, 6):
        put(im, xx, 6, ZINC_DARK)
    wall(im, 5, 10, 86, 68, WALL_MINT)
    # bandas de piso
    for by in (33, 56):
        rect(im, 5, by, 86, 2, WALL_SKY)
        hline(im, 5, by + 1, 86, SHADOW)
    # ventanas con reja (3x3)
    for wx in (12, 39, 66):
        for wy in (16, 39, 62):
            window(im, wx, wy, 12, 11, reja=True)
    # aires acondicionados
    for wx in (12, 66):
        rect(im, wx + 13, 28, 6, 4, ACERA)
        hline(im, wx + 13, 28, 6, ACERA_L)
        hline(im, wx + 13, 30, 6, SHADOW)
    door(im, 42, 63, 12, 15, PTY_BLUE)
    # tanque de agua
    water_tank(im, 65, 1, 16, 14)
    base_strip(im, 4, 78, 88)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_apartment_b():
    W, H = 80, 96
    im = new(W, H)
    rect(im, 2, 2, 76, 9, ZINC)
    hline(im, 2, 2, 76, ZINC_L)
    hline(im, 2, 10, 76, ZINC_DARK)
    wall(im, 4, 10, 59, 76, WALL_PEACH)
    vline(im, 4, 10, 76, WHITE)
    vline(im, 62, 10, 76, SHADOW)
    for by in (33, 56):
        rect(im, 4, by, 59, 2, WALL_CORAL)
        hline(im, 4, by + 1, 59, SHADOW)
    for wx in (10, 36):
        for wy in (16, 39, 62):
            window(im, wx, wy, 12, 11, reja=True)
    door(im, 16, 70, 12, 16, SHIRT_B)
    # escalera externa
    for i in range(15):
        sy = 24 + i * 4
        rect(im, 64, sy, 13, 3, ACERA)
        hline(im, 64, sy + 2, 13, JOINT)
        vline(im, 64, sy, 3, ACERA_L)
        vline(im, 78, sy, 3, SHADOW)
    rect(im, 63, 23, 2, 61, SHADOW)
    rect(im, 77, 23, 2, 61, SHADOW)
    for i in range(0, 15, 2):
        put(im, 63, 24 + i * 4, ACERA_L)
    base_strip(im, 4, 86, 72)
    out = outline(im)
    # cables (se dibujan despues del outline, sobre la fachada)
    for k in range(2):
        base_y = 17 + k * 5
        for i in range(58):
            t = i / 57.0
            yy = base_y + int(round(6 * 4 * t * (1 - t)))
            put(out, 4 + i, yy, INK)
    building_shadow(out, W, H)
    return out


def draw_fonda():
    W, H = 96, 64
    im = new(W, H)
    zinc_roof(im, 2, 2, 92, 15, ridge=5)
    wall(im, 6, 16, 84, 41, WALL_CORAL)
    vline(im, 6, 16, 41, WHITE)
    vline(im, 89, 16, 41, SHADOW)
    # ventana de servicio
    window(im, 20, 38, 26, 12)
    # mostrador
    rect(im, 18, 49, 30, 2, ACERA)
    hline(im, 18, 49, 30, ACERA_L)
    hline(im, 18, 50, 30, SHADOW)
    # puerta
    door(im, 58, 38, 12, 18, SHIRT_G)
    # toldo
    awning(im, 5, 28, 86, 8, PTY_RED, SHIRT_Y)
    # cartel
    rect(im, 13, 16, 70, 11, WHITE)
    rect_outline(im, 13, 16, 70, 11, PTY_RED)
    draw_text(im, "FONDA LA NENA", 16, 19, PTY_RED, font=FONT4)
    # mesas afuera
    for (tx, tc) in ((6, PTY_RED), (72, PTY_RED)):
        rect(im, tx, 46, 18, 3, tc)
        hline(im, tx, 46, 18, SHIRT_R)
        vline(im, tx + 2, 49, 9, ZINC_RUST)
        vline(im, tx + 15, 49, 9, ZINC_RUST)
        vline(im, tx + 8, 49, 9, ZINC_RUST)
        # sillas
        put(im, tx - 2, 52, SHADOW)
        put(im, tx + 19, 52, SHADOW)
        put(im, tx + 20, 51, SHADOW)
    base_strip(im, 4, 57, 88)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_minisuper():
    W, H = 96, 64
    im = new(W, H)
    zinc_roof(im, 2, 2, 92, 14, ridge=5)
    wall(im, 5, 14, 86, 43, WALL_SKY)
    vline(im, 5, 14, 43, WHITE)
    vline(im, 90, 14, 43, SHADOW)
    # cartel
    rect(im, 18, 16, 60, 12, WHITE)
    rect_outline(im, 18, 16, 60, 12, PTY_BLUE)
    draw_text(im, "MINISÚPER", 21, 20, PTY_BLUE, font=FONT4)
    # vitrina con productos
    rect(im, 10, 31, 46, 18, ACERA_L)
    rect_outline(im, 10, 31, 46, 18, INK)
    rect(im, 11, 32, 44, 16, WALL_SKY)
    for row, cols in ((33, (13, 18, 23, 28, 33, 38, 43, 48)),
                      (37, (14, 19, 24, 29, 34, 39, 44, 49)),
                      (42, (13, 18, 23, 28, 33, 38, 43, 48))):
        for i, cx in enumerate(cols):
            c = (PTY_RED, SHIRT_Y, SHIRT_G, WHITE, PTY_BLUE)[i % 5]
            rect(im, cx, row, 2, 2, c)
    hline(im, 10, 39, 46, SHADOW)
    hline(im, 10, 44, 46, SHADOW)
    # reja sobre la vitrina
    for xx in range(12, 54, 3):
        vline(im, xx, 32, 16, INK)
    put(im, 12, 32, INK)
    # puerta de vidrio
    door(im, 60, 30, 12, 27, glass=True)
    put(im, 68, 43, SHIRT_Y)
    # aire acondicionado
    rect(im, 78, 17, 12, 8, ACERA)
    hline(im, 78, 17, 12, ACERA_L)
    hline(im, 78, 20, 12, ZINC_DARK)
    hline(im, 78, 22, 12, ZINC_DARK)
    for xx in (80, 82, 84, 86, 88):
        vline(im, xx, 18, 6, JOINT)
    put(im, 83, 18, SHADOW)
    base_strip(im, 4, 57, 88)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_metro():
    W, H = 80, 56
    im = new(W, H)
    # marquesina
    rect(im, 2, 2, 76, 9, ZINC)
    hline(im, 2, 2, 76, ZINC_L)
    for xx in range(6, 78, 6):
        vline(im, xx, 3, 7, ZINC_DARK)
    hline(im, 2, 10, 76, ZINC_DARK)
    # banda roja/azul de marca
    rect(im, 2, 11, 38, 3, PTY_RED)
    rect(im, 40, 11, 38, 3, PTY_BLUE)
    hline(im, 2, 11, 76, WHITE)
    # cartel METRO
    rect(im, 21, 15, 38, 12, WHITE)
    rect_outline(im, 21, 15, 38, 12, INK)
    draw_text(im, "ME", 27, 19, PTY_RED, font=FONT4)
    draw_text(im, "TRO", 37, 19, PTY_BLUE, font=FONT4)
    # entrada con escalera mecanica
    rect(im, 12, 29, 56, 22, SHADOW)
    # laterales de concreto
    rect(im, 10, 27, 2, 24, ACERA)
    rect(im, 68, 27, 2, 24, ACERA)
    vline(im, 10, 27, 24, ACERA_L)
    vline(im, 69, 27, 24, JOINT)
    # franja de precaucion
    hline(im, 12, 27, 56, SHIRT_Y)
    hline(im, 12, 28, 56, SHADOW)
    # peldaños en perspectiva (mas angostos al fondo)
    for i in range(6):
        sy = 30 + i * 3
        inset = 5 - i
        rect(im, 14 + inset, sy, 52 - inset * 2, 2, ACERA)
        hline(im, 14 + inset, sy + 1, 52 - inset * 2, JOINT)
    # pasamanos diagonales
    for i in range(21):
        put(im, 15 + i // 3, 28 + i, ACERA_L)
        put(im, 64 - i // 3, 28 + i, ACERA_L)
        put(im, 16 + i // 3, 28 + i, SHADOW)
        put(im, 63 - i // 3, 28 + i, SHADOW)
    # postes de la marquesina
    rect(im, 5, 14, 2, 36, ACERA)
    rect(im, 73, 14, 2, 36, ACERA)
    vline(im, 5, 14, 36, ACERA_L)
    vline(im, 74, 14, 36, JOINT)
    base_strip(im, 2, 50, 76)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_bus_stop():
    W, H = 48, 40
    im = new(W, H)
    # techo metalico con alero
    rect(im, 1, 2, 46, 8, ZINC)
    hline(im, 1, 2, 46, ZINC_L)
    for xx in range(4, 47, 4):
        vline(im, xx, 3, 7, ZINC_DARK)
    hline(im, 1, 9, 46, ZINC_DARK)
    # cartel PARADA
    rect(im, 8, 11, 32, 10, PTY_BLUE)
    rect_outline(im, 8, 11, 32, 10, WHITE)
    draw_text(im, "PARADA", 9, 14, WHITE, font=FONT4)
    # postes
    for px in (4, 42):
        rect(im, px, 11, 2, 24, ACERA)
        vline(im, px, 11, 24, ACERA_L)
        vline(im, px + 1, 11, 24, JOINT)
    # banca con respaldo
    rect(im, 10, 21, 28, 2, ZINC_RUST)
    hline(im, 10, 21, 28, HAIR_BR)
    rect(im, 10, 25, 28, 2, ZINC_RUST)
    hline(im, 10, 25, 28, HAIR_BR)
    vline(im, 11, 21, 13, SHADOW)
    vline(im, 36, 21, 13, SHADOW)
    vline(im, 18, 27, 7, SHADOW)
    vline(im, 29, 27, 7, SHADOW)
    base_strip(im, 3, 35, 42)
    out = outline(im)
    building_shadow(out, W, H)
    return out


def draw_school():
    W, H = 112, 80
    im = new(W, H)
    # techo plano con parapeto
    rect(im, 3, 3, 106, 8, ZINC)
    hline(im, 3, 3, 106, ZINC_L)
    hline(im, 3, 10, 106, ZINC_DARK)
    for xx in range(7, 108, 7):
        put(im, xx, 6, ZINC_DARK)
    wall(im, 6, 11, 100, 61, WALL_CREAM)
    # bandas de piso
    hline(im, 6, 44, 100, SHADOW)
    hline(im, 6, 45, 100, WALL_PEACH)
    # cartel ESCUELA
    rect(im, 36, 12, 46, 13, WHITE)
    rect_outline(im, 36, 12, 46, 13, PTY_BLUE)
    draw_text(im, "ESCUELA", 41, 16, PTY_BLUE, font=FONT4)
    # bandera de Panama
    flagpole(im, 8, 14, 72)
    panama_flag(im, 10, 14, 16, 11)
    # ventanas con reja
    for wx in (28, 52, 76):
        window(im, wx, 28, 14, 12, reja=True)
        window(im, wx, 50, 14, 12, reja=True)
    # puerta y escalones
    door(im, 48, 56, 14, 16, PTY_BLUE)
    rect(im, 44, 72, 22, 2, ACERA)
    rect(im, 42, 74, 26, 2, SHADOW)
    # verja frontal
    reja_fence(im, 6, 106, 63, 9, gap=(44, 68))
    base_strip(im, 5, 72, 102)
    out = outline(im)
    building_shadow(out, W, H)
    return out


BUILDINGS = {
    "house-a": draw_house_a,
    "house-b": draw_house_b,
    "house-c": draw_house_c,
    "apartment-a": draw_apartment_a,
    "apartment-b": draw_apartment_b,
    "fonda": draw_fonda,
    "minisuper": draw_minisuper,
    "metro": draw_metro,
    "bus-stop": draw_bus_stop,
    "school": draw_school,
}


# ==========================================================================
# UI: LOGO E ICONOS
# ==========================================================================
FONT5 = {
    "P": ("####.", "#...#", "#...#", "####.", "#....", "#....", "#...."),
    "T": ("#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."),
    "Y": ("#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."),
    "I": ("#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"),
    "M": ("#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"),
    "E": ("#####", "#....", "#....", "####.", "#....", "#....", "#####"),
    " ": (".....", ".....", ".....", ".....", ".....", ".....", "....."),
}


def draw_logo():
    im = new(240, 80)
    # silueta de skyline
    base = 78
    skyline = [
        (0, 18, 20), (20, 14, 27), (36, 22, 17), (60, 12, 24), (74, 20, 13),
        (96, 16, 22), (114, 26, 28), (142, 14, 16), (158, 22, 21),
        (182, 18, 13), (202, 14, 24), (218, 22, 16),
    ]
    rnd = random.Random(9)
    for (x, w, h) in skyline:
        rect(im, x, base - h, w, h, SHADOW)
        hline(im, x, base - h, w, INK)
        for _ in range(w // 4):
            wx = x + 2 + rnd.randrange(max(1, w - 4))
            wy = base - h + 3 + rnd.randrange(max(1, h - 5))
            put(im, wx, wy, TAXI)
    rect(im, 0, base, 240, 1, INK)
    rect(im, 0, base + 1, 240, 1, SHADOW)
    # bandera de Panama con asta (arriba a la izquierda)
    fl = new(240, 80)
    rect(fl, 4, 2, 1, 22, ACERA_L)
    put(fl, 4, 1, SHIRT_Y)
    panama_flag(fl, 6, 3, 16, 11)
    fl = outline(fl)
    im.paste(fl, (0, 0), fl)
    # letras PTY TIME
    txt = "PTY TIME"
    tw = font_width(txt, FONT5, 4)  # 4x scale
    tx = (240 - tw) // 2
    ty = 15
    # sombra de color (rojo PTY, azul TIME)
    sh_lay = new(240, 80)
    draw_text(sh_lay, "PTY", tx + 4, ty + 4, PTY_RED, font=FONT5, scale=4)
    draw_text(sh_lay, "TIME", tx + 4 * 24 + 4, ty + 4, PTY_BLUE, font=FONT5, scale=4)
    im.paste(sh_lay, (0, 0), sh_lay)
    # letras blancas con doble outline
    lay = new(240, 80)
    draw_text(lay, txt, tx, ty, WHITE, font=FONT5, scale=4)
    lay = outline(outline(lay))
    im.paste(lay, (0, 0), lay)
    # pequenas estrellas roja/azul a la derecha
    st = new(240, 80)
    star(st, 230, 12, PTY_RED)
    star(st, 230, 20, PTY_BLUE)
    star(st, 230, 28, WHITE)
    st = outline(st)
    im.paste(st, (0, 0), st)
    return im


def draw_icon_star():
    im = new(16, 16)
    rows = [
        (2, 7, 8), (3, 6, 9), (4, 5, 10), (5, 2, 13), (6, 3, 12),
        (7, 4, 11), (8, 3, 12), (9, 2, 5), (9, 10, 13), (10, 2, 4),
        (10, 11, 13), (11, 1, 3), (11, 12, 14), (12, 1, 2), (12, 13, 14),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, SHIRT_Y)
    put(im, 6, 6, WHITE)
    put(im, 7, 6, WHITE)
    put(im, 4, 5, TAXI)
    return outline(im)


def draw_icon_pin():
    im = new(16, 16)
    rows = [
        (1, 6, 9), (2, 5, 10), (3, 4, 11), (4, 4, 11), (5, 4, 11),
        (6, 5, 10), (7, 6, 9), (8, 7, 8),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, PTY_RED)
    rect(im, 7, 3, 2, 2, WHITE)
    put(im, 7, 4, WHITE)
    return outline(im)


def draw_icon_talk():
    im = new(16, 16)
    rect(im, 1, 2, 12, 9, WHITE)
    rect(im, 2, 11, 3, 2, WHITE)
    put(im, 4, 12, WHITE)
    hline(im, 1, 3, 12, WALL_SKY)
    hline(im, 1, 9, 12, ACERA)
    for dx in (4, 7, 10):
        put(im, dx, 6, PTY_BLUE)
        put(im, dx, 7, PTY_BLUE)
    return outline(im)


def draw_icon_quake():
    im = new(16, 16)
    rows = [
        (1, 7, 8), (2, 7, 8), (3, 6, 9), (4, 6, 9), (5, 5, 10),
        (6, 5, 10), (7, 4, 11), (8, 4, 11), (9, 3, 12), (10, 3, 12),
        (11, 2, 13), (12, 2, 13), (13, 1, 14),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, SHIRT_Y)
    rect(im, 7, 5, 2, 5, INK)
    rect(im, 7, 11, 2, 1, INK)
    put(im, 1, 14, PTY_RED)
    put(im, 14, 14, PTY_RED)
    return outline(im)


def draw_icon_sound():
    im = new(16, 16)
    rect(im, 1, 6, 4, 4, ACERA_L)
    rows = [(4, 4, 4), (5, 4, 5), (6, 3, 6), (7, 3, 6), (8, 3, 6),
            (9, 4, 5), (10, 4, 4)]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, ACERA_L)
    for (x, y) in ((8, 4), (9, 3), (10, 4), (8, 11), (9, 12), (10, 11),
                   (11, 2), (12, 3), (12, 4), (11, 13), (12, 12), (12, 11)):
        put(im, x, y, PTY_BLUE)
    return outline(im)


def draw_icon_back():
    im = new(16, 16)
    rows = [
        (2, 5, 6), (3, 4, 6), (4, 3, 6), (5, 2, 6), (6, 1, 6),
        (7, 1, 14), (8, 1, 14), (9, 1, 6), (10, 2, 6), (11, 3, 6),
        (12, 4, 6), (13, 5, 6),
    ]
    for y, x0, x1 in rows:
        span(im, y, x0, x1, ACERA_L)
    span(im, 6, 6, 13, WHITE)
    span(im, 9, 6, 13, ACERA)
    return outline(im)


UI_ICONS = {
    "icon-star": draw_icon_star,
    "icon-pin": draw_icon_pin,
    "icon-talk": draw_icon_talk,
    "icon-quake": draw_icon_quake,
    "icon-sound": draw_icon_sound,
    "icon-back": draw_icon_back,
}


# ==========================================================================
# CONTACT SHEET (revision, no se carga en el juego)
# ==========================================================================
CHECKER_A = _rgb("#46465e")
CHECKER_B = _rgb("#34344a")


def _label(im, s, x, y, scale=1):
    draw_text(im, s, x + 1, y + 1, INK, font=FONT3, scale=scale)
    draw_text(im, s, x, y, WHITE, font=FONT3, scale=scale)


def _put_item(sheet, im, x, y, name, maxw):
    sheet.paste(im, (x, y), im)
    _label(sheet, name, x, y + im.height + 2)
    return im.width + 8


def make_contact_sheet(players, npcs, portraits, buildings, props):
    margin = 8
    width = 500
    rows = [
        ("TILES", [("tileset", None)], 10),
        ("PLAYERS 48x96 (3x4)", [(n, i) for n, i in players], 8),
        ("NPCS 48x96", [(n, i) for n, i in npcs], 8),
        ("PORTRAITS 32x32", [(n, i) for n, i in portraits], 10),
        ("BUILDINGS", [(n, i) for n, i in buildings[:5]], 8),
        ("BUILDINGS (cont.)", [(n, i) for n, i in buildings[5:]], 8),
        ("PROPS", [(n, i) for n, i in props[:10]], 14),
        ("PROPS (cont.)", [(n, i) for n, i in props[10:]], 14),
        ("UI", [("logo", None), ("icons", None)], 12),
    ]

    # calculo de alto (cada seccion puede tener su propia separacion)
    sizes = {"tileset": (256, 16), "logo": (240, 80), "icons": (6 * 20, 16)}
    heights = []
    for title, items, gap in rows:
        h = 12
        cx = margin
        rowh = 0
        for name, im in items:
            iw, ih = sizes.get(name, (0, 0)) if im is None else im.size
            if cx + iw > width - margin and cx > margin:
                cx = margin
                h += rowh + 10
                rowh = 0
            cx += iw + gap
            rowh = max(rowh, ih + 14)
        h += rowh + 8
        heights.append(h)
    H = sum(heights) + 30
    sheet = checkerboard(width, H, a=CHECKER_A, b=CHECKER_B, cell=8)
    # titulo
    _label(sheet, "PTY TIME  -  ASSET SHEET (contact sheet de revision)", margin, 6, scale=2)
    _label(sheet, "public/assets  -  escala de revision 3x  -  fondo cuadriculado", margin, 18)

    y = 30
    tileset = make_tileset()
    for title, items, gap in rows:
        _label(sheet, title, margin, y, scale=1)
        y += 11
        cx = margin
        rowh = 0
        for name, im in items:
            if name == "tileset":
                im = tileset
            elif name == "logo":
                im = draw_logo()
            elif name == "icons":
                im = new(6 * 20, 16)
                for k, fn in enumerate(UI_ICONS.values()):
                    ic = fn()
                    im.paste(ic, (k * 20, 0), ic)
            if im is None:
                continue
            if cx + im.width > width - margin and cx > margin:
                cx = margin
                y += rowh + 10
                rowh = 0
            sheet.paste(im, (cx, y), im)
            _label(sheet, name, cx, y + im.height + 2)
            cx += im.width + gap
            rowh = max(rowh, im.height + 14)
        y += rowh + 8
    sheet = sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST)
    return sheet


# ==========================================================================
# MAIN / VALIDACION / REPORTE
# ==========================================================================
PLAYERS = [
    (f"player-{b}-{s}", dict(BODIES[b], shirt=SHIRTS[s]))
    for b in ("m", "f") for s in ("red", "blue", "yellow", "green")
]
PORTRAITS = [(f"portrait-{n}", spec) for n, spec in NPCS.items()]
PORTRAITS += [
    ("portrait-player-m", dict(BODIES["m"], shirt=WHITE)),
    ("portrait-player-f", dict(BODIES["f"], shirt=WHITE)),
]
# ==========================================================================
# OBJETOS DE SUMINISTRO 16x16 (Slice B)
# ==========================================================================
def draw_vendaje():
    im = new(16, 16)
    rect(im, 2, 4, 12, 8, WHITE)
    hline(im, 2, 6, 11, OFFWHITE)
    hline(im, 2, 9, 11, ACERA_L)
    rect_outline(im, 2, 4, 12, 8, INK)
    # cruz roja
    rect(im, 9, 5, 4, 6, WHITE)
    rect(im, 10, 6, 2, 4, PTY_RED)
    rect(im, 9, 7, 4, 2, PTY_RED)
    return outline(im)


def draw_lata():
    im = new(16, 16)
    rect(im, 4, 4, 8, 10, ZINC)
    rect(im, 4, 4, 8, 2, OFFWHITE)
    hline(im, 4, 7, 9, PTY_RED)
    hline(im, 4, 9, 9, PTY_RED)
    rect(im, 4, 12, 8, 2, ZINC_DARK)
    rect_outline(im, 4, 4, 8, 10, INK)
    put(im, 5, 11, TAXI)
    return outline(im)


def draw_caja():
    im = new(16, 16)
    rect(im, 2, 5, 12, 9, ZINC_RUST)
    hline(im, 2, 5, 13, ZINC_L)
    vline(im, 8, 6, 12, INK)
    rect_outline(im, 2, 5, 12, 9, INK)
    # balas asomando
    rect(im, 4, 3, 2, 3, TAXI)
    rect(im, 7, 3, 2, 3, TAXI)
    rect(im, 10, 3, 2, 3, TAXI)
    return outline(im)


PROP_DRAWERS = [
    ("palm", draw_palm, (32, 48)),
    ("mango-tree", draw_mango_tree, (32, 40)),
    ("bush", draw_bush, (16, 16)),
    ("power-pole", draw_power_pole, (16, 48)),
    ("bench", draw_bench, (24, 16)),
    ("trash", draw_trash, (12, 16)),
    ("fence", draw_fence, (16, 16)),
    ("sign", draw_sign, (16, 24)),
    ("cone", draw_cone, (8, 8)),
    ("hoop", draw_hoop, (16, 24)),
    ("stall", draw_stall, (40, 32)),
    ("dog", draw_dog, (16, 16)),
    ("puddle", draw_puddle, (16, 8)),
    ("planter", draw_planter, (16, 16)),
    ("taxi", lambda: draw_car(TAXI, True), (32, 24)),
    ("car-blue", lambda: draw_car(PTY_BLUE), (32, 24)),
    ("car-red", lambda: draw_car(PTY_RED), (32, 24)),
    ("diablo-rojo", draw_diablo_rojo, (64, 32)),
    ("chancla", draw_chancla, (12, 8)),
    ("vendaje", draw_vendaje, (16, 16)),
    ("lata", draw_lata, (16, 16)),
    ("caja", draw_caja, (16, 16)),
]
BUILDING_SIZES = {
    "house-a": (80, 64), "house-b": (64, 64), "house-c": (96, 80),
    "apartment-a": (96, 88), "apartment-b": (80, 96), "fonda": (96, 64),
    "minisuper": (96, 64), "metro": (80, 56), "bus-stop": (48, 40),
    "school": (112, 80),
}
ICON_SIZES = {k: (16, 16) for k in UI_ICONS}


def save_png(im, rel):
    path = ASSETS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)
    return path


def expected_files():
    exp = {}
    exp["tiles/tileset.png"] = (256, 16, False)
    for name, _spec in PLAYERS:
        exp[f"characters/{name}.png"] = (48, 96, True)
    for nid in NPCS:
        exp[f"characters/npc-{nid}.png"] = (48, 96, True)
    for eid in ENEMIES:
        exp[f"characters/enemy-{eid}.png"] = (48, 96, True)
    for zid in ZOMBIES:
        exp[f"characters/enemy-{zid}.png"] = (48, 96, True)
    for name, _spec in PORTRAITS:
        exp[f"ui/portraits/{name}.png"] = (32, 32, True)
    for name, size in BUILDING_SIZES.items():
        exp[f"buildings/{name}.png"] = (size[0], size[1], True)
    for name, _fn, size in PROP_DRAWERS:
        exp[f"props/{name}.png"] = (size[0], size[1], True)
    exp["ui/logo.png"] = (240, 80, True)
    for name, size in ICON_SIZES.items():
        exp[f"ui/{name}.png"] = (size[0], size[1], True)
    return exp


def generate_assets():
    save_png(make_tileset(), "tiles/tileset.png")
    for name, spec in PLAYERS:
        save_png(character_sheet(spec), f"characters/{name}.png")
    for nid, spec in NPCS.items():
        save_png(character_sheet(spec), f"characters/npc-{nid}.png")
    for eid, spec in ENEMIES.items():
        save_png(character_sheet(spec), f"characters/enemy-{eid}.png")
    for zid, spec in ZOMBIES.items():
        save_png(character_sheet(spec), f"characters/enemy-{zid}.png")
    for name, spec in PORTRAITS:
        save_png(draw_portrait(spec), f"ui/portraits/{name}.png")
    for name, fn in BUILDINGS.items():
        save_png(fn(), f"buildings/{name}.png")
    for name, fn, _size in PROP_DRAWERS:
        save_png(fn(), f"props/{name}.png")
    save_png(draw_logo(), "ui/logo.png")
    for name, fn in UI_ICONS.items():
        save_png(fn(), f"ui/{name}.png")


def validate(expected):
    n_expected = (1 + len(PLAYERS) + len(NPCS) + len(ENEMIES) + len(ZOMBIES)
                  + len(PORTRAITS) + len(BUILDING_SIZES) + len(PROP_DRAWERS)
                  + len(UI_ICONS) + 1)
    assert len(expected) == n_expected, "faltan archivos en la tabla de esperados"
    errors = []
    total = 0
    for rel, (w, h, transparent) in sorted(expected.items()):
        path = ASSETS / rel
        if not path.exists():
            errors.append(f"falta {rel}")
            continue
        total += path.stat().st_size
        im = Image.open(path)
        if im.size != (w, h):
            errors.append(f"{rel}: tamano {im.size} != {(w, h)}")
        if im.mode != "RGBA":
            errors.append(f"{rel}: modo {im.mode} != RGBA")
            continue
        rgba = im.convert("RGBA")
        alphas = rgba.getchannel("A").getextrema()
        if transparent and alphas[0] != 0:
            errors.append(f"{rel}: sin transparencia")
        if not transparent and alphas[0] != 255:
            errors.append(f"{rel}: deberia ser opaco")
        # sin antialiasing: alfa solo 0 o 255
        hist = rgba.getchannel("A").histogram()
        if sum(hist[1:255]) != 0:
            errors.append(f"{rel}: alfa intermedio (antialiasing)")
        # paleta cerrada (bytes crudos; getcolors con maxcolors enorme es lentisimo)
        raw = rgba.tobytes()
        bad = set()
        for i in range(0, len(raw), 4):
            if raw[i + 3] == 0:
                continue
            col = (raw[i], raw[i + 1], raw[i + 2])
            if col not in ALLOWED_COLORS:
                bad.add(col)
        if bad:
            errors.append(f"{rel}: {len(bad)} colores fuera de paleta: "
                          f"{sorted(bad)[:4]}")
    # fuente incluida intacta
    if not (ASSETS / "ui" / "PressStart2P-Regular.ttf").exists():
        errors.append("falta PressStart2P-Regular.ttf")
    if not (ASSETS / "ui" / "OFL.txt").exists():
        errors.append("falta OFL.txt")
    total_mb = total / (1024 * 1024)
    if total_mb >= 1.2:
        errors.append(f"peso total {total_mb:.2f} MB >= 1.2 MB")
    return errors, total


def make_report(expected, total):
    groups = [
        ("Tiles", "tiles/tileset.png"),
        ("Personajes", "characters/"),
        ("Retratos", "ui/portraits/"),
        ("Edificios", "buildings/"),
        ("Props", "props/"),
        ("UI", "ui/logo.png"),
        ("Iconos UI", "ui/icon-"),
    ]
    lines = []
    lines.append("# PTY Time · Inventario de assets")
    lines.append("")
    lines.append("Generado por `tools/generate_assets.py` (Pillow, pixel art programatico).")
    lines.append("Los PNG se regeneran de forma determinista: el script se puede ejecutar")
    lines.append("las veces que haga falta y produce los mismos archivos.")
    lines.append("")
    lines.append("## Resumen")
    lines.append("")
    lines.append(f"- **{len(expected)} PNG de juego** generados en `public/assets/`.")
    lines.append(f"- **Peso total: {total / 1024:.1f} KB** ({total / (1024 * 1024):.2f} MB) "
                 f"/ presupuesto 1.2 MB.")
    lines.append("- Contact sheet de revision: `tools/asset_sheet.png` (no se carga en el juego).")
    lines.append("- Todos los PNG son RGBA, paleta cerrada y sin antialiasing (alfa 0/255).")
    lines.append("- Sin assets externos con copyright. La fuente Press Start 2P (OFL) se conserva.")
    lines.append("")
    lines.append("## Inventario")
    lines.append("")
    lines.append("| Grupo | Archivo | Tamano | KB |")
    lines.append("|---|---|---|---|")
    for rel in sorted(expected):
        group = "Otros"
        for gname, prefix in groups:
            if prefix.endswith("/"):
                if rel.startswith(prefix):
                    group = gname
                    break
            elif rel == prefix or rel.startswith(prefix):
                group = gname
                break
        w, h, _ = expected[rel]
        kb = (ASSETS / rel).stat().st_size / 1024
        lines.append(f"| {group} | `{rel}` | {w}x{h} | {kb:.1f} |")
    lines.append("")
    lines.append("## Paleta")
    lines.append("")
    lines.append("Se usa la paleta del contrato (`docs/ASSET_CONTRACT.md`). Solo se agregan")
    lines.append("variaciones minimas justificadas (ningun neon ni color fuera de estilo):")
    lines.append("")
    lines.append("| Color | Hex | Uso |")
    lines.append("|---|---|---|")
    lines.append("| acera_junta | `#9a9a9a` | junta de losa (acera un paso mas oscura) |")
    lines.append("| zinc_sombra | `#6e7a8f` | sombra de la corrugacion del zinc |")
    lines.append("| llanta | `#26262f` | caucho de llantas |")
    lines.append("| cancha | `#2f7f6f` | base de cancha sintetica verde-teal |")
    lines.append("| cancha_sombra | `#27685c` | textura/desgaste y sombra de linea de cancha |")
    lines.append("| blanco_hueso | `#e4e4e4` | franjas del cruce y lineas de cancha |")
    lines.append("| lavanda | `#9b7ede` | vestido de Yolanda (evita que parezca piel) |")
    lines.append("")
    lines.append("Los grises del pelo canoso y los lentes usan los colores de acera")
    lines.append("(`#b8b8b8`, `#d0d0d0`) de la propia paleta.")
    lines.append("")
    lines.append("## Desviaciones y notas")
    lines.append("")
    lines.append("- `props/sign.png` (16x24): la placa de calle reparte `SAN ISIDRO` en")
    lines.append("  tres lineas (`SAN` / `ISI` / `DRO`) con letras de 3x5 px; es la unica")
    lines.append("  forma de que el nombre quepa legible en una placa de 16 px de ancho")
    lines.append("  (con una sola linea o comprimido seria ilegible).")
    lines.append("- Las sombras de contacto son opacas (`#2f2f4a`), no semitransparentes, para")
    lines.append("  mantener la paleta cerrada y el pixel art limpio (sin alfa intermedio).")
    lines.append("- `npc-kevin` usa una cabeza mas grande y cuerpo mas corto (proporcion de nino)")
    lines.append("  dentro de la misma hoja 48x96; los pies quedan en la fila inferior.")
    lines.append("- El bus `diablo-rojo` usa letras de 3x5 px (estilo tablero de destino) para que")
    lines.append("  `S. MIGUELITO` quepa en la carroceria de 64 px.")
    lines.append("- Los retratos 32x32 son bustos genericos (misma piel/pelo/ropa que el sprite)")
    lines.append("  y fondo transparente.")
    lines.append("- Pulido final: la cancha (tile 9) es verde-teal sintetica oscura con linea")
    lines.append("  en blanco hueso; las franjas del cruce (tile 10) usan blanco hueso")
    lines.append("  `#e4e4e4`; Yolanda lleva vestido lavanda `#9b7ede` (el coral parecia piel).")
    lines.append("")
    lines.append("## Verificacion")
    lines.append("")
    lines.append("El propio script valida, con asserts, que:")
    lines.append("")
    lines.append("1. existen todos los archivos y cada uno tiene el tamano exacto del contrato,")
    lines.append("2. todos son RGBA,")
    lines.append("3. el alfa es solo 0 o 255 (pixel art puro, sin antialiasing),")
    lines.append("4. no hay pixeles fuera de la paleta permitida,")
    lines.append("5. el peso total queda por debajo de 1.2 MB,")
    lines.append("6. la fuente Press Start 2P y su licencia siguen en `public/assets/ui/`.")
    lines.append("")
    lines.append("```bash")
    lines.append("python tools/generate_assets.py")
    lines.append("```")
    lines.append("")
    report = DOCS / "ASSETS_REPORT.md"
    report.write_text("\n".join(lines), encoding="utf-8")


def main():
    print("PTY Time :: generando assets pixel art...")
    generate_assets()
    expected = expected_files()
    # contact sheet
    players = []
    for name, spec in PLAYERS:
        short = (name.replace("player-", "")
                 .replace("yellow", "yel").replace("blue", "blu")
                 .replace("green", "grn").upper())
        players.append((short, character_sheet(spec)))
    npcs = [(n, character_sheet(s)) for n, s in NPCS.items()]
    npcs += [(f"zombi-{n}", character_sheet(s)) for n, s in ZOMBIES.items()]
    portraits = [(n.replace("portrait-", ""), draw_portrait(s))
                 for n, s in PORTRAITS]
    buildings = [(n, fn()) for n, fn in BUILDINGS.items()]
    props = [(n, fn()) for n, fn, _s in PROP_DRAWERS]
    sheet = make_contact_sheet(players, npcs, portraits, buildings, props)
    sheet.save(TOOLS / "asset_sheet.png", "PNG", optimize=True)
    print(f"  contact sheet: {sheet.width}x{sheet.height} "
          f"({(TOOLS / 'asset_sheet.png').stat().st_size / 1024:.0f} KB)")
    errors, total = validate(expected)
    # PNG inesperados dentro de public/assets (la fuente y la licencia no son PNG)
    known = set(expected)
    for p in ASSETS.rglob("*.png"):
        rel = p.relative_to(ASSETS).as_posix()
        if rel not in known:
            errors.append(f"PNG inesperado fuera del contrato: {rel}")
    if errors:
        print("\nERRORES:")
        for e in errors:
            print("  -", e)
    assert not errors, f"validacion fallida: {errors[:3]}"
    assert total < 1.2 * 1024 * 1024, f"peso total {total} >= 1.2 MB"
    make_report(expected, total)
    print(f"  {len(expected)} PNG OK | total {total / 1024:.1f} KB "
          f"({total / (1024 * 1024):.2f} MB de 1.2 MB)")
    print("  docs/ASSETS_REPORT.md actualizado")
    print("LISTO.")


if __name__ == "__main__":
    main()

