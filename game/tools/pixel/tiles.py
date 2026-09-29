"""Terrain tiles (16x16), building parts and props for the campus maps.

Tiles are ground and building faces; props are free-size sprites with a footprint (y-sorted in game).
Everything is drawn from the master palette with seeded noise, so a rebuild gives identical images.
"""
from __future__ import annotations

import random

from px import PAL, Canvas, RGBA, mix, shade

T = 16
P = PAL


def rng(name: str) -> random.Random:
    return random.Random(hash_str(name))


def hash_str(s: str) -> int:
    h = 2166136261
    for ch in s.encode():
        h = ((h ^ ch) * 16777619) & 0xFFFFFFFF
    return h


# ---------------------------------------------------------------------------------------------- ground
def grass(name: str, flowers: bool = False, tall: bool = False) -> Canvas:
    r = rng(name)
    c = Canvas(T, T, P['grass0'])
    c.speckle(0, 0, T, T, [P['grass1']], 0.22, r)
    # blades: little V shapes
    for _ in range(5):
        x, y = r.randrange(1, 15), r.randrange(2, 15)
        c.set(x, y, P['grass2'])
        c.set(x - 1, y - 1, P['grass1'])
        c.set(x + 1, y - 1, P['leaf_hi'] if r.random() < 0.5 else P['grass1'])
    if flowers:
        for _ in range(3):
            x, y = r.randrange(2, 14), r.randrange(2, 14)
            col = r.choice([P['pod'], P['white'], P['pink']])
            c.set(x, y, col)
            c.set(x + 1, y, shade(col, -0.2))
            c.set(x, y + 1, P['grass2'])
    if tall:
        for x in range(1, 15, 3):
            h = r.randrange(5, 9)
            for y in range(15 - h, 15):
                c.set(x, y, P['grass2'] if y > 11 else P['grass1'])
                c.set(x + 1, y, P['leaf_hi'] if y < 10 else P['grass1'])
    return c


def petals(name: str) -> Canvas:
    """Grass with fallen copper-pod petals (the yellow carpet under the trees)."""
    c = grass(name)
    r = rng(name + 'p')
    for _ in range(9):
        x, y = r.randrange(0, 15), r.randrange(0, 15)
        c.set(x, y, r.choice([P['pod'], P['pod2'], P['pod_hi']]))
    return c


def path_tile(mask: int, base: RGBA = P['earth0'], name: str = 'path') -> Canvas:
    """Auto-tiled laterite path. mask bits: 1 N, 2 E, 4 S, 8 W are also path."""
    r = rng(f'{name}{mask}')
    g = grass(f'{name}g{mask}')
    c = Canvas(T, T, base)
    c.speckle(0, 0, T, T, [shade(base, -0.12), shade(base, 0.1)], 0.18, r)
    for _ in range(3):
        x, y = r.randrange(1, 15), r.randrange(1, 15)
        c.set(x, y, P['sand'])
        c.set(x + 1, y, shade(base, -0.25))
    edge_n, edge_e, edge_s, edge_w = not (mask & 1), not (mask & 2), not (mask & 4), not (mask & 8)
    for y in range(T):
        for x in range(T):
            j = (hash_str(f'{name}{mask}{x}{y}') % 3) - 1
            d = 99
            if edge_n: d = min(d, y)
            if edge_s: d = min(d, T - 1 - y)
            if edge_w: d = min(d, x)
            if edge_e: d = min(d, T - 1 - x)
            # round the corners where two edges meet
            if edge_n and edge_w: d = min(d, int(((x - 5) ** 2 + (y - 5) ** 2) ** 0.5 * -1 + 5) if x < 5 and y < 5 else d)
            if edge_n and edge_e: d = min(d, int(5 - ((x - 10) ** 2 + (y - 5) ** 2) ** 0.5) if x > 10 and y < 5 else d)
            if edge_s and edge_w: d = min(d, int(5 - ((x - 5) ** 2 + (y - 10) ** 2) ** 0.5) if x < 5 and y > 10 else d)
            if edge_s and edge_e: d = min(d, int(5 - ((x - 10) ** 2 + (y - 10) ** 2) ** 0.5) if x > 10 and y > 10 else d)
            if d + j < 2:
                c.set(x, y, g.get(x, y))
            elif d + j == 2:
                c.set(x, y, shade(base, -0.2))
    return c


def road(name: str, marking: str | None = None) -> Canvas:
    r = rng(name)
    c = Canvas(T, T, P['tar0'])
    c.speckle(0, 0, T, T, [P['tar1'], P['tar2']], 0.3, r)
    if marking == 'dash':
        c.rect(3, 7, 10, 2, P['white'])
        c.set(12, 8, P['mist'])
    elif marking == 'zebra':
        for x in range(0, T, 4):
            c.rect(x, 0, 2, T, P['white'])
    return c


def kerb(name: str, side: str) -> Canvas:
    """Road tile with the kerb stones painted black and yellow along one edge (as on Indian campus roads)."""
    c = road(name)
    for i in range(0, T, 4):
        col = P['yellow'] if (i // 4) % 2 == 0 else P['ink']
        if side == 'n':
            c.rect(i, 0, 4, 3, col)
            c.hline(i, 3, 4, shade(col, -0.4))
        else:
            c.rect(i, T - 4, 4, 3, col)
            c.hline(i, T - 1, 4, P['tar1'])
            c.hline(i, T - 4, 4, shade(col, 0.2))
    return c


def pavers(name: str) -> Canvas:
    """Interlocking paver bricks, the grey-and-red kind on campus walkways."""
    r = rng(name)
    c = Canvas(T, T, P['conc1'])
    for by in range(0, T, 4):
        off = 0 if (by // 4) % 2 == 0 else 4
        for bx in range(-8, T, 8):
            x0 = bx + off
            col = P['conc0'] if r.random() < 0.8 else P['brick']
            for y in range(by, by + 3):
                for x in range(x0, x0 + 7):
                    if 0 <= x < T:
                        c.set(x, y, col)
            for x in range(x0, x0 + 7):
                if 0 <= x < T:
                    c.set(x, by, shade(col, 0.12))
    return c


def floor(name: str, kind: str) -> Canvas:
    r = rng(name)
    if kind == 'mosaic':
        c = Canvas(T, T, P['conc2'])
        c.speckle(0, 0, T, T, [P['conc0'], P['mist'], P['earth1'], P['slate']], 0.28, r)
        c.hline(0, 0, T, P['conc0'])
        c.vline(0, 0, T, P['conc0'])
        return c
    # red oxide floor with a cool sheen (old hostels)
    c = Canvas(T, T, P['brick'])
    c.speckle(0, 0, T, T, [shade(P['brick'], 0.08)], 0.2, r)
    c.hline(0, 0, T, P['brick2'])
    c.vline(0, 0, T, P['brick2'])
    for i in range(3):
        c.set(3 + i, 3 + i, shade(P['brick'], 0.25))
    return c


def water_tile(name: str, frame: int) -> Canvas:
    c = Canvas(T, T, P['blue1'])
    r = rng(name)
    c.speckle(0, 0, T, T, [P['blue0']], 0.2, r)
    for i in range(3):
        y = (i * 5 + frame * 2) % T
        x = (i * 7 + frame * 3) % 12
        c.hline(x, y, 4, P['sky'])
    return c


# ---------------------------------------------------------------------------------------------- buildings
STYLES = {
    # the hostel: cream plaster, brown sunshades, a pale concrete roof
    'hostel': {'wall': P['cream'], 'trim': P['wood1'], 'roof': P['conc0'], 'win': P['sky'], 'door': P['wood0']},
    # the departments: warm brick with cream bands
    'dept': {'wall': P['brick'], 'trim': P['cream'], 'roof': P['conc1'], 'win': P['sky'], 'door': P['blue1']},
    # shops and houses in Chromepet: pastel walls
    'house': {'wall': P['hostel_green'], 'trim': P['cream'], 'roof': P['terra'], 'win': P['sky'], 'door': P['wood0']},
}


def building_parts(style: str) -> dict[str, Canvas]:
    s = STYLES[style]
    out: dict[str, Canvas] = {}
    wall, roof = s['wall'], s['roof']

    def roofc(name: str, edges: str) -> Canvas:
        r = rng(style + name)
        c = Canvas(T, T, roof)
        c.speckle(0, 0, T, T, [shade(roof, -0.08), shade(roof, 0.06)], 0.25, r)
        # rain stains
        if r.random() < 0.4:
            x = r.randrange(2, 12)
            c.rect(x, r.randrange(2, 10), 3, 2, shade(roof, -0.15))
        lip = shade(roof, 0.25)
        if 'n' in edges:
            c.rect(0, 0, T, 3, lip)
            c.hline(0, 3, T, shade(roof, -0.25))
        if 'w' in edges:
            c.rect(0, 0, 3, T, lip)
            c.vline(3, 'n' in edges and 3 or 0, T, shade(roof, -0.2))
        if 'e' in edges:
            c.rect(T - 3, 0, 3, T, lip)
            c.vline(T - 4, 0, T, shade(roof, -0.1))
        return c

    for key, edges in (('roof_nw', 'nw'), ('roof_n', 'n'), ('roof_ne', 'ne'), ('roof_w', 'w'), ('roof_c', ''), ('roof_e', 'e')):
        out[key] = roofc(key, edges)
    # the parapet: the roof's front lip, seen from above, with its shadow on the wall below
    for key, edges in (('parapet_w', 'w'), ('parapet_c', ''), ('parapet_e', 'e')):
        c = roofc(key, edges)
        c.rect(0, 9, T, 4, shade(roof, 0.2))
        c.hline(0, 13, T, shade(roof, -0.3))
        c.rect(0, 14, T, 2, shade(wall, -0.35))
        out[key] = c

    def wallc(name: str) -> Canvas:
        r = rng(style + name)
        c = Canvas(T, T, wall)
        c.speckle(0, 0, T, T, [shade(wall, -0.06), shade(wall, 0.05)], 0.2, r)
        if style == 'dept':
            for y in range(0, T, 4):
                c.hline(0, y, T, shade(wall, -0.18))
                off = 0 if (y // 4) % 2 == 0 else 4
                for x in range(off, T, 8):
                    c.vline(x, y, 4, shade(wall, -0.18))
        return c

    out['wall_c'] = wallc('wall_c')
    w = wallc('wall_w'); w.vline(0, 0, T, shade(wall, 0.2)); w.vline(1, 0, T, shade(wall, 0.1)); out['wall_w'] = w
    e = wallc('wall_e'); e.rect(T - 3, 0, 3, T, shade(wall, -0.22)); out['wall_e'] = e
    # a window with a sunshade (chajja) and grills
    win = wallc('window')
    win.rect(1, 1, 14, 2, shade(s['trim'], 0.1))
    win.hline(1, 3, 14, shade(wall, -0.4))
    win.rect(3, 4, 10, 10, P['ink2'])
    win.rect(4, 5, 8, 8, s['win'])
    win.rect(4, 5, 8, 3, shade(s['win'], 0.3))
    for x in (6, 9):
        win.vline(x, 5, 8, P['slate'])
    win.hline(4, 9, 8, P['slate'])
    win.hline(3, 14, 10, shade(wall, 0.2))
    out['window'] = win
    # the base row: skirting paint
    for key in ('base_w', 'base_c', 'base_e'):
        c = out[{'base_w': 'wall_w', 'base_c': 'wall_c', 'base_e': 'wall_e'}[key]].img.copy()
        cc = Canvas(T, T)
        cc.img = c
        cc.px = cc.img.load()
        cc.rect(0, 11, T, 5, shade(s['trim'], -0.1))
        cc.hline(0, 11, T, shade(s['trim'], 0.15))
        out[key] = cc
    # the door: two tiles tall, double leaf, with a step
    top = wallc('door_top')
    top.rect(1, 2, 14, 14, shade(wall, -0.3))
    top.rect(2, 4, 12, 12, s['door'])
    top.vline(8, 4, 12, shade(s['door'], -0.35))
    top.rect(3, 6, 4, 5, shade(s['door'], 0.15))
    top.rect(9, 6, 4, 5, shade(s['door'], 0.15))
    top.hline(1, 2, 14, shade(s['trim'], 0.1))
    out['door_top'] = top
    bot = Canvas(T, T, shade(wall, -0.3))
    bot.rect(2, 0, 12, 12, s['door'])
    bot.vline(8, 0, 12, shade(s['door'], -0.35))
    bot.set(7, 3, P['yellow'])
    bot.set(9, 3, P['yellow'])
    bot.rect(3, 4, 4, 6, shade(s['door'], 0.1))
    bot.rect(9, 4, 4, 6, shade(s['door'], 0.1))
    bot.rect(0, 12, T, 4, P['conc2'])
    bot.hline(0, 12, T, P['white'])
    out['door_bot'] = bot
    return {f'{style}_{k}': v for k, v in out.items()}


def interior_parts() -> dict[str, Canvas]:
    out: dict[str, Canvas] = {}
    paint = P['hostel_green']
    top = Canvas(T, T, P['ink2'])
    top.hline(0, T - 1, T, P['slate'])
    out['iwall_top'] = top
    w = Canvas(T, T, paint)
    w.speckle(0, 0, T, T, [shade(paint, -0.05)], 0.2, rng('iw'))
    w.rect(0, 0, T, 2, shade(paint, -0.3))
    out['iwall'] = w
    b = Canvas(T, T, paint)
    b.rect(0, 0, T, 2, shade(paint, -0.3)) if False else None
    b.speckle(0, 0, T, T, [shade(paint, -0.05)], 0.2, rng('ib'))
    b.rect(0, 9, T, 7, shade(paint, -0.25))
    b.hline(0, 9, T, shade(paint, 0.15))
    out['iwall_base'] = b
    win = Canvas(T, T, paint)
    win.rect(0, 0, T, 2, shade(paint, -0.3))
    win.rect(2, 3, 12, 11, P['wood1'])
    win.rect(3, 4, 10, 9, P['sky'])
    win.rect(3, 4, 10, 3, shade(P['sky'], 0.35))
    for x in (5, 8, 11):
        win.vline(x, 4, 9, P['slate'])
    out['iwindow'] = win
    mat = floor('exitmat', 'mosaic')
    mat.rect(2, 4, 12, 10, P['red1'])
    mat.rect(3, 5, 10, 8, P['red0'])
    for x in range(4, 12, 2):
        mat.vline(x, 5, 8, shade(P['red0'], 0.15))
    out['exit_mat'] = mat
    return out


# ---------------------------------------------------------------------------------------------- props
class Prop:
    def __init__(self, c: Canvas, foot: tuple[int, int], solid: bool = True, above: bool = False):
        self.c, self.foot, self.solid, self.above = c, foot, solid, above


def tree_copperpod() -> Prop:
    c = Canvas(48, 60)
    c.shadow(24, 56, 16, 4)
    r = rng('copperpod')
    # trunk
    c.rect(21, 34, 7, 22, P['wood1'])
    c.vline(21, 34, 22, shade(P['wood1'], 0.2))
    c.vline(27, 34, 22, P['wood2'])
    c.rect(18, 52, 13, 3, P['wood1'])
    # canopy: clusters of leaves, then the yellow flower spikes
    for cx, cy, rx, ry in ((24, 20, 20, 15), (12, 26, 10, 9), (36, 26, 10, 9), (24, 10, 13, 9)):
        c.ellipse(cx, cy, rx, ry, P['grass2'])
    for cx, cy, rx, ry in ((22, 17, 16, 11), (13, 23, 7, 6), (34, 22, 8, 7), (24, 9, 10, 6)):
        c.ellipse(cx, cy, rx, ry, P['grass1'])
    c.speckle(6, 2, 36, 32, [P['leaf_hi'], P['grass0']], 0.12, r)
    for y in range(34):
        for x in range(48):
            p = c.get(x, y)
            if p[3] and p in (P['grass1'], P['grass2']) and x > 30 and y > 18:
                c.set(x, y, P['grass3'])
    for _ in range(90):
        x, y = r.randrange(5, 43), r.randrange(2, 34)
        if c.get(x, y)[3] and c.get(x, y) != P['wood1']:
            col = P['pod'] if y > 10 or r.random() < 0.6 else P['pod_hi']
            c.set(x, y, col)
            if r.random() < 0.5:
                c.set(x, y + 1, P['pod2'])
    c.outline(lambda n: mix(n, P['ink'], 0.7))
    return Prop(c, (2, 1))


def tree_neem() -> Prop:
    c = Canvas(44, 56)
    c.shadow(22, 52, 14, 4)
    r = rng('neem')
    c.rect(19, 32, 6, 20, P['wood1'])
    c.vline(24, 32, 20, P['wood2'])
    c.vline(19, 32, 20, shade(P['wood1'], 0.2))
    for cx, cy, rx, ry in ((22, 19, 19, 16), (10, 26, 9, 8), (34, 25, 9, 8)):
        c.ellipse(cx, cy, rx, ry, P['grass3'])
    for cx, cy, rx, ry in ((20, 15, 13, 10), (12, 22, 6, 5), (31, 20, 7, 6)):
        c.ellipse(cx, cy, rx, ry, P['grass2'])
    c.speckle(4, 3, 36, 32, [P['grass1'], P['leaf_lo']], 0.25, r)
    for _ in range(40):
        x, y = r.randrange(8, 32), r.randrange(4, 22)
        if c.get(x, y)[3]:
            c.set(x, y, P['leaf_hi'])
    c.outline(lambda n: mix(n, P['ink'], 0.7))
    return Prop(c, (2, 1))


def palm() -> Prop:
    c = Canvas(40, 64)
    c.shadow(20, 61, 9, 3)
    # the curved trunk with rings
    for y in range(20, 62):
        x = 19 + int(((62 - y) / 42) ** 2 * 3)
        c.rect(x, y, 4, 1, P['wood0'] if y % 3 else P['wood1'])
        c.set(x + 3, y, P['wood2'])
    # fronds
    for ang, ln in ((-1, 16), (1, 16), (-0.4, 13), (0.4, 13), (-1.4, 12), (1.4, 12), (0, 10)):
        for i in range(ln):
            x = int(21 + ang * i)
            y = int(20 - i * 0.9 + (i * i) * 0.06 * abs(ang))
            c.set(x, y, P['grass1'])
            c.set(x, y + 1, P['grass2'])
            if i % 2 == 0:
                c.set(x, y + 2, P['grass3'])
                c.set(x + (1 if ang >= 0 else -1), y - 1, P['leaf_hi'])
    c.ellipse(21, 21, 3, 2, P['wood1'])
    c.set(19, 23, P['khaki']); c.set(22, 23, P['khaki']); c.set(21, 24, P['khaki'])
    c.outline(lambda n: mix(n, P['ink'], 0.7))
    return Prop(c, (1, 1))


def lamp() -> Prop:
    c = Canvas(14, 40)
    c.shadow(7, 38, 4, 1.5)
    c.rect(6, 6, 2, 32, P['slate'])
    c.vline(6, 6, 32, P['stone'])
    c.rect(4, 36, 6, 3, P['slate'])
    c.rect(2, 3, 10, 3, P['ink2'])
    c.rect(3, 6, 8, 2, P['pod_hi'])
    c.outline()
    return Prop(c, (1, 1))


def bench() -> Prop:
    c = Canvas(32, 20)
    c.shadow(16, 17, 14, 3)
    c.rect(2, 4, 28, 4, P['conc0'])
    c.hline(2, 4, 28, P['conc2'])
    c.rect(2, 9, 28, 5, P['conc0'])
    c.hline(2, 9, 28, P['conc2'])
    c.hline(2, 13, 28, P['conc1'])
    c.rect(4, 14, 3, 4, P['conc1'])
    c.rect(25, 14, 3, 4, P['conc1'])
    c.outline()
    return Prop(c, (2, 1))


def notice_board() -> Prop:
    c = Canvas(28, 30)
    c.shadow(14, 28, 10, 2)
    c.rect(4, 14, 2, 14, P['wood1'])
    c.rect(22, 14, 2, 14, P['wood1'])
    c.rect(1, 1, 26, 17, P['wood1'])
    c.rect(2, 2, 24, 15, P['khaki'])
    r = rng('nb')
    for x, y, w, h in ((3, 3, 6, 7), (10, 4, 7, 5), (18, 3, 6, 8), (11, 10, 6, 6)):
        col = r.choice([P['white'], P['paper'], P['pod_hi'], P['mint']])
        c.rect(x, y, w, h, col)
        c.hline(x + 1, y + 2, w - 2, P['stone'])
        c.set(x + w // 2, y, P['red0'])
    c.outline()
    return Prop(c, (2, 1))


def scooter(color: RGBA) -> Prop:
    c = Canvas(28, 20)
    c.shadow(14, 17, 12, 2.5)
    c.ellipse(6, 14, 4, 4, P['ink'])
    c.ellipse(22, 14, 4, 4, P['ink'])
    c.ellipse(6, 14, 2, 2, P['stone'])
    c.ellipse(22, 14, 2, 2, P['stone'])
    c.rect(6, 8, 14, 5, color)
    c.rect(16, 4, 7, 9, color)
    c.hline(16, 4, 7, shade(color, 0.3))
    c.rect(7, 6, 8, 3, P['ink2'])
    c.rect(20, 1, 2, 4, P['slate'])
    c.hline(17, 1, 7, P['slate'])
    c.set(24, 8, P['pod_hi'])
    c.outline()
    return Prop(c, (2, 1))


def tea_stall() -> Prop:
    """A petti kadai: a small wooden tea stall with a blue tarp and glass jars."""
    c = Canvas(56, 48)
    c.shadow(28, 45, 26, 3)
    c.rect(4, 18, 48, 26, P['wood1'])
    c.rect(5, 19, 46, 24, P['wood0'])
    for x in range(8, 50, 8):
        c.vline(x, 19, 24, P['wood1'])
    # counter with jars
    c.rect(2, 16, 52, 4, P['wood2'])
    for i, col in enumerate((P['pod'], P['red0'], P['earth0'], P['mint'], P['pod_hi'])):
        x = 6 + i * 9
        c.rect(x, 9, 7, 8, P['mist'])
        c.rect(x + 1, 11, 5, 5, col)
        c.hline(x, 9, 7, P['blue1'])
    # kettle and glasses
    c.ellipse(46, 13, 4, 3, P['stone'])
    c.set(50, 11, P['stone'])
    # tarp roof
    for y in range(0, 7):
        c.hline(0 + (6 - y) // 2, y, 56 - (6 - y), P['blue0'] if y % 3 else P['blue1'])
    c.hline(0, 7, 56, P['blue1'])
    # posts
    c.rect(1, 7, 2, 38, P['wood2'])
    c.rect(53, 7, 2, 38, P['wood2'])
    # hanging banana bunch and snack packets
    c.rect(24, 8, 3, 5, P['yellow'])
    for i in range(4):
        c.rect(30 + i * 4, 8, 3, 4, [P['red0'], P['orange'], P['blue0'], P['pink']][i])
    c.outline()
    return Prop(c, (3, 1))


def flowerpot() -> Prop:
    c = Canvas(12, 14)
    c.shadow(6, 12, 5, 1.5)
    c.rect(2, 7, 8, 6, P['terra'])
    c.hline(1, 7, 10, shade(P['terra'], 0.2))
    c.vline(9, 8, 5, shade(P['terra'], -0.3))
    c.ellipse(6, 5, 5, 4, P['grass1'])
    c.set(4, 3, P['pink']); c.set(7, 2, P['red0']); c.set(8, 5, P['pink'])
    c.outline()
    return Prop(c, (1, 1))


def dustbin() -> Prop:
    c = Canvas(12, 16)
    c.shadow(6, 14, 5, 1.5)
    c.rect(2, 4, 8, 10, P['blue0'])
    c.vline(2, 4, 10, shade(P['blue0'], 0.2))
    c.vline(9, 4, 10, P['blue1'])
    c.rect(1, 2, 10, 3, P['blue1'])
    c.set(5, 8, P['white']); c.set(6, 8, P['white']); c.set(5, 9, P['white'])
    c.outline()
    return Prop(c, (1, 1))


def signpost() -> Prop:
    c = Canvas(22, 28)
    c.shadow(11, 26, 6, 2)
    c.rect(10, 10, 2, 16, P['slate'])
    c.rect(1, 2, 20, 10, P['blue1'])
    c.rect(2, 3, 18, 8, P['blue0'])
    c.hline(4, 5, 12, P['white'])
    c.hline(4, 8, 9, P['white'])
    c.outline()
    return Prop(c, (1, 1))


def hedge() -> Prop:
    c = Canvas(16, 20)
    c.ellipse(8, 11, 8, 8, P['grass2'])
    c.ellipse(7, 9, 6, 6, P['grass1'])
    c.speckle(1, 3, 14, 14, [P['leaf_hi'], P['grass3']], 0.18, rng('hedge'))
    c.rect(0, 14, 16, 5, P['grass3'])
    c.outline()
    return Prop(c, (1, 1))


def compound_wall() -> Prop:
    c = Canvas(16, 22)
    c.rect(0, 4, 16, 16, P['cream2'])
    c.rect(0, 2, 16, 3, P['cream'])
    c.hline(0, 2, 16, P['white'])
    c.rect(0, 17, 16, 3, shade(P['cream2'], -0.25))
    c.speckle(0, 5, 16, 12, [shade(P['cream2'], -0.1)], 0.2, rng('cw'))
    c.outline()
    return Prop(c, (1, 1))


def bunting() -> Prop:
    """A string of fest flags, drawn above everything (not solid)."""
    c = Canvas(64, 12)
    cols = [P['red0'], P['pod'], P['blue0'], P['mint'], P['pink'], P['orange']]
    for x in range(64):
        y = int(2 + 3 * (1 - ((x - 32) / 32) ** 2))
        c.set(x, y, P['ink2'])
        if x % 6 == 2:
            col = cols[(x // 6) % len(cols)]
            for i in range(4):
                c.hline(x - 2 + i // 2, y + 1 + i, 5 - i, col)
    return Prop(c, (4, 1), solid=False, above=True)


def dog_sleep() -> Prop:
    """A campus dog asleep in the shade."""
    c = Canvas(20, 12)
    c.shadow(10, 9, 9, 2)
    body = P['sand']
    c.ellipse(9, 7, 7, 3.5, body)
    c.ellipse(15, 6, 3.5, 3, body)
    c.set(17, 4, shade(body, -0.3)); c.set(16, 3, shade(body, -0.3))
    c.hline(13, 5, 2, shade(body, -0.35))
    c.hline(2, 7, 3, shade(body, -0.15))
    c.set(18, 7, P['ink'])
    c.hline(4, 9, 10, shade(body, -0.25))
    c.outline()
    return Prop(c, (1, 1))


# interior props
def cot() -> Prop:
    c = Canvas(18, 34)
    c.rect(1, 2, 16, 30, P['slate'])
    c.rect(2, 3, 14, 28, P['blue1'])
    c.rect(2, 3, 14, 6, P['white'])
    c.hline(2, 9, 14, P['mist'])
    for y in range(12, 30, 4):
        c.hline(3, y, 12, shade(P['blue1'], 0.15))
    c.rect(1, 31, 2, 3, P['ink2']); c.rect(15, 31, 2, 3, P['ink2'])
    c.outline()
    return Prop(c, (1, 2))


def study_table() -> Prop:
    c = Canvas(26, 24)
    c.shadow(13, 22, 12, 2)
    c.rect(1, 8, 24, 6, P['wood0'])
    c.hline(1, 8, 24, shade(P['wood0'], 0.2))
    c.rect(1, 14, 24, 8, P['wood1'])
    c.rect(2, 14, 2, 8, P['wood2']); c.rect(22, 14, 2, 8, P['wood2'])
    # laptop, lit
    c.rect(6, 1, 12, 8, P['ink2'])
    c.rect(7, 2, 10, 6, P['sky'])
    c.hline(7, 2, 10, shade(P['sky'], 0.4))
    c.rect(5, 9, 14, 2, P['stone'])
    c.set(20, 10, P['white']); c.set(21, 10, P['white'])
    c.outline()
    return Prop(c, (2, 1))


def almirah() -> Prop:
    """The steel almirah every hostel room has."""
    c = Canvas(18, 32)
    c.shadow(9, 30, 8, 2)
    c.rect(1, 1, 16, 29, P['stone'])
    c.vline(1, 1, 29, P['mist'])
    c.vline(16, 1, 29, P['slate'])
    c.vline(9, 3, 25, P['slate'])
    c.rect(7, 13, 2, 4, P['ink2'])
    c.rect(10, 13, 2, 4, P['ink2'])
    c.hline(1, 1, 16, P['mist'])
    c.outline()
    return Prop(c, (1, 1))


def bucket() -> Prop:
    c = Canvas(12, 12)
    c.shadow(6, 10, 5, 1.5)
    c.rect(2, 3, 8, 7, P['red0'])
    c.hline(2, 3, 8, shade(P['red0'], 0.25))
    c.vline(9, 4, 6, P['red1'])
    c.rect(8, 1, 3, 3, P['blue0'])
    c.outline()
    return Prop(c, (1, 1))


def shelf() -> Prop:
    c = Canvas(24, 28)
    c.rect(1, 1, 22, 26, P['wood1'])
    r = rng('shelf')
    for sy in (2, 10, 18):
        c.rect(2, sy, 20, 7, P['wood2'])
        x = 3
        while x < 21:
            w = r.choice([1, 2, 2, 3])
            c.rect(x, sy + r.randrange(0, 2), w, 7 - r.randrange(0, 2), r.choice([P['red0'], P['blue0'], P['pod'], P['mint'], P['cream'], P['purple']]))
            x += w
        c.hline(2, sy + 7, 20, P['wood0'])
    c.outline()
    return Prop(c, (2, 1))


def cot_sleeper() -> Prop:
    """The roommate's cot: someone asleep with the sheet over his face."""
    p = cot()
    c = p.c
    c.ellipse(9, 7, 5, 3, P['white'])
    c.ellipse(9, 18, 6, 9, P['mint'])
    c.ellipse(8, 16, 4, 6, shade(P['mint'], 0.2))
    for y in range(12, 28, 3):
        c.hline(4, y, 10, shade(P['mint'], -0.15))
    return Prop(c, (1, 2))


def barricade() -> Prop:
    """A striped fest barricade."""
    c = Canvas(18, 18)
    c.shadow(9, 16, 8, 2)
    c.rect(2, 9, 2, 7, P['slate']); c.rect(14, 9, 2, 7, P['slate'])
    for x in range(0, 18):
        col = P['yellow'] if (x // 3) % 2 == 0 else P['ink']
        c.vline(x, 4, 5, col)
    c.hline(0, 4, 18, shade(P['yellow'], 0.3))
    c.outline()
    return Prop(c, (1, 1))


def poster() -> Prop:
    c = Canvas(14, 16)
    c.rect(1, 1, 12, 14, P['ink2'])
    c.rect(2, 2, 10, 12, P['purple'])
    c.ellipse(7, 7, 3, 3, P['pod'])
    c.hline(3, 11, 8, P['white'])
    return Prop(c, (1, 1), solid=False)


def props() -> dict[str, Prop]:
    return {
        'tree_copperpod': tree_copperpod(), 'tree_neem': tree_neem(), 'palm': palm(), 'lamp': lamp(), 'bench': bench(),
        'notice_board': notice_board(), 'scooter_red': scooter(P['red0']), 'scooter_blue': scooter(P['blue0']),
        'tea_stall': tea_stall(), 'flowerpot': flowerpot(), 'dustbin': dustbin(), 'signpost': signpost(), 'hedge': hedge(),
        'compound_wall': compound_wall(), 'bunting': bunting(), 'dog_sleep': dog_sleep(),
        'cot': cot(), 'cot_sleeper': cot_sleeper(), 'barricade': barricade(), 'study_table': study_table(), 'almirah': almirah(), 'bucket': bucket(), 'shelf': shelf(), 'poster': poster(),
    }


def tiles() -> dict[str, Canvas]:
    out: dict[str, Canvas] = {}
    for i in range(3):
        out[f'grass{i}'] = grass(f'grass{i}')
    out['grass_flowers'] = grass('grassf', flowers=True)
    out['grass_tall'] = grass('grasst', tall=True)
    out['petals'] = petals('petals0')
    out['petals1'] = petals('petals1')
    for m in range(16):
        out[f'path{m}'] = path_tile(m)
    out['road'] = road('road0')
    out['road1'] = road('road1')
    out['road_dash'] = road('roadd', 'dash')
    out['zebra'] = road('zebra', 'zebra')
    out['kerb_n'] = kerb('kerbn', 'n')
    out['kerb_s'] = kerb('kerbs', 's')
    out['kerb_nd'] = kerb('kerbnd', 'n')
    out['kerb_sd'] = kerb('kerbsd', 's')
    out['pavers'] = pavers('pav0')
    out['pavers1'] = pavers('pav1')
    out['mosaic'] = floor('mos', 'mosaic')
    out['redoxide'] = floor('red', 'redoxide')
    for f in range(3):
        out[f'water{f}'] = water_tile('water', f)
    for st in STYLES:
        out.update(building_parts(st))
    out.update(interior_parts())
    return out


# ---------------------------------------------------------------------------------------------- second pass
# Richer ground, building faces and trees (tiles_hd.py) replace the first-pass versions above.
from tiles_hd import (  # noqa: E402
    STYLES, building_parts, grass, kerb, palm, path_tile, pavers, petals, road, tree_copperpod, tree_neem,
)
