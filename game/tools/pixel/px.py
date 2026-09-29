"""Shared helpers for the code-drawn pixel art: the master palette, colour maths and a tiny canvas API.

Everything in the pixel game is drawn from PAL, so the whole world shares one colour language.
Colours are warm and slightly dusty (Chennai sun), with deep ink-blue shadows instead of black.
"""
from __future__ import annotations

import random
from PIL import Image

RGBA = tuple[int, int, int, int]


def hexc(h: str) -> RGBA:
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


# The master palette (about 48 colours). Names say what they are for, not what they look like.
PAL: dict[str, RGBA] = {k: hexc(v) for k, v in {
    # ink and neutrals
    'ink': '1a1c2c', 'ink2': '2b2d45', 'slate': '4a5068', 'stone': '7a8094', 'mist': 'b4bac8', 'paper': 'f4efe0',
    'white': 'fffdf6', 'cream': 'eadcb8', 'cream2': 'd6c396', 'sand': 'c9a978', 'khaki': '9c8454',
    # greens (dry-season campus lawns, neem, hedges)
    'grass0': '5f9a4a', 'grass1': '4f8640', 'grass2': '3d6d36', 'grass3': '2d5231', 'leaf_hi': '8cbf5a', 'leaf_lo': '26452c',
    # the copper-pod tree's yellow
    'pod': 'f6c63c', 'pod2': 'e09a24', 'pod_hi': 'fde68a',
    # earth, brick, wood
    'earth0': 'b86a3c', 'earth1': '9a5230', 'earth2': '7a3e26', 'brick': 'a5463a', 'brick2': '7e3230',
    'wood0': '9a6a3e', 'wood1': '744a2c', 'wood2': '4f3020', 'terra': 'c4643c',
    # road, concrete
    'tar0': '4d4f5c', 'tar1': '3e404c', 'tar2': '5b5d6a', 'conc0': 'a8a294', 'conc1': '8c8678', 'conc2': 'c4bfae',
    # paint and fabric accents
    'blue0': '3f6fb0', 'blue1': '2c4f86', 'sky': '8cc4e8', 'teal': '2f8a8a', 'red0': 'c23a3a', 'red1': '8e2630',
    'yellow': 'f2d54a', 'orange': 'e07a2e', 'pink': 'e27aa0', 'purple': '7a54a8', 'mint': '9fdcc0', 'hostel_green': '9cc4a0',
    # skin (warm South Indian browns), hair
    'skin0': 'c8865a', 'skin1': 'a86a44', 'skin2': '8a5234', 'skin3': 'd89a6c',
    'hair0': '1e1a22', 'hair1': '3a2a24', 'hair2': '8a8a90',
}.items()}

CLEAR: RGBA = (0, 0, 0, 0)


def clamp(v: float) -> int:
    return max(0, min(255, int(round(v))))


def mix(a: RGBA, b: RGBA, t: float) -> RGBA:
    return (clamp(a[0] + (b[0] - a[0]) * t), clamp(a[1] + (b[1] - a[1]) * t), clamp(a[2] + (b[2] - a[2]) * t), 255)


def shade(c: RGBA, k: float) -> RGBA:
    """k < 0 darkens toward ink blue (shadows are cool), k > 0 lightens toward warm paper."""
    return mix(c, PAL['ink'], -k) if k < 0 else mix(c, PAL['white'], k)


class Canvas:
    """A small RGBA image with pixel-art drawing helpers."""

    def __init__(self, w: int, h: int, fill: RGBA = CLEAR):
        self.w, self.h = w, h
        self.img = Image.new('RGBA', (w, h), fill)
        self.px = self.img.load()

    def set(self, x: int, y: int, c: RGBA) -> None:
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[x, y] = c

    def get(self, x: int, y: int) -> RGBA:
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[x, y]
        return CLEAR

    def rect(self, x: int, y: int, w: int, h: int, c: RGBA) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def hline(self, x: int, y: int, w: int, c: RGBA) -> None:
        self.rect(x, y, w, 1, c)

    def vline(self, x: int, y: int, h: int, c: RGBA) -> None:
        self.rect(x, y, 1, h, c)

    def ellipse(self, cx: float, cy: float, rx: float, ry: float, c: RGBA) -> None:
        for yy in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for xx in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((xx + 0.5 - cx) / rx) ** 2 + ((yy + 0.5 - cy) / ry) ** 2 <= 1:
                    self.set(xx, yy, c)

    def speckle(self, x: int, y: int, w: int, h: int, colors: list[RGBA], density: float, rng: random.Random) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if rng.random() < density and self.get(xx, yy)[3]:
                    self.set(xx, yy, rng.choice(colors))

    def paste(self, other: 'Canvas', x: int, y: int) -> None:
        self.img.alpha_composite(other.img, (x, y))
        self.px = self.img.load()

    def outline(self, color_of=None) -> None:
        """Adds a 1 px outline around opaque pixels. The outline takes a dark shade of the pixel it wraps."""
        src = self.img.copy().load()
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y][3]:
                    continue
                for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and src[nx, ny][3] > 128:
                        n = src[nx, ny]
                        self.px[x, y] = color_of(n) if color_of else mix(n, PAL['ink'], 0.72)
                        break

    def shadow(self, cx: float, cy: float, rx: float, ry: float, alpha: int = 70) -> None:
        """A soft ground shadow (drawn first, under the object)."""
        for yy in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for xx in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((xx + 0.5 - cx) / rx) ** 2 + ((yy + 0.5 - cy) / ry) ** 2 <= 1:
                    self.set(xx, yy, (26, 28, 44, alpha))


def ascii_layer(rows: list[str], colors: dict[str, RGBA]) -> Canvas:
    """Draws ASCII pixel art: each character maps to a colour; '.' is transparent."""
    h, w = len(rows), len(rows[0])
    c = Canvas(w, h)
    for y, row in enumerate(rows):
        assert len(row) == w, f'row {y} is {len(row)} wide, expected {w}: {row!r}'
        for x, ch in enumerate(row):
            if ch != '.' and ch in colors:
                c.set(x, y, colors[ch])
    return c
