"""Second-pass art: richer ground tiles, building faces and trees. `tiles.py` imports these over its
first-pass versions (same names and signatures), so maps and the engine don't change.

The look: light from the top left, three or four tones per material, texture from clusters (not single
noise pixels), and small true details: kerb drains, curtain colours, drain pipes, floor ledges.
"""
from __future__ import annotations

import random

from px import PAL, Canvas, RGBA, mix, shade

T = 16
P = PAL


def _h(s: str) -> int:
    h = 2166136261
    for ch in s.encode():
        h = ((h ^ ch) * 16777619) & 0xFFFFFFFF
    return h


def rng(name: str) -> random.Random:
    return random.Random(_h(name))


def _noise(x: int, y: int, seed: int, scale: int) -> float:
    """Cheap smooth value noise in 0..1 that tiles every 16 px (so neighbouring tiles join)."""
    def v(ix: int, iy: int) -> float:
        return (_h(f'{seed}:{ix % (T // scale)}:{iy % (T // scale)}') % 1000) / 1000
    fx, fy = x / scale, y / scale
    ix, iy = int(fx), int(fy)
    tx, ty = fx - ix, fy - iy
    a = v(ix, iy) * (1 - tx) + v(ix + 1, iy) * tx
    b = v(ix, iy + 1) * (1 - tx) + v(ix + 1, iy + 1) * tx
    return a * (1 - ty) + b * ty


# ---------------------------------------------------------------------------------------------- grass
def grass(name: str, flowers: bool = False, tall: bool = False) -> Canvas:
    r = rng(name)
    c = Canvas(T, T, P['grass0'])
    seed = _h(name) % 7
    for y in range(T):
        for x in range(T):
            n = _noise(x, y, 11, 8) * 0.7 + _noise(x, y, 23 + seed, 4) * 0.3
            if n > 0.66:
                c.set(x, y, P['leaf_hi'] if n > 0.8 and (x + y) % 2 == 0 else mix(P['grass0'], P['leaf_hi'], 0.35))
            elif n < 0.34:
                c.set(x, y, P['grass1'])
    # blade tufts: a dark root, a mid blade and a lit tip
    for _ in range(4):
        x, y = r.randrange(1, 15), r.randrange(3, 15)
        c.set(x, y, P['grass2'])
        c.set(x, y - 1, P['grass1'])
        c.set(x - 1, y - 1, P['grass1'])
        c.set(x + 1, y - 2, P['leaf_hi'])
        c.set(x - 1, y - 2, mix(P['leaf_hi'], P['grass0'], 0.5))
    if r.random() < 0.35:
        x, y = r.randrange(2, 14), r.randrange(2, 14)
        c.set(x, y, P['stone']); c.set(x + 1, y, P['mist']); c.set(x, y + 1, P['grass2'])
    if flowers:
        for _ in range(4):
            x, y = r.randrange(2, 14), r.randrange(2, 13)
            col = r.choice([P['pod'], P['white'], P['pink'], P['sky']])
            c.set(x, y, col); c.set(x - 1, y, shade(col, -0.15)); c.set(x + 1, y, shade(col, -0.15))
            c.set(x, y - 1, shade(col, 0.2)); c.set(x, y + 1, P['yellow'] if col != P['pod'] else P['orange'])
            c.set(x, y + 2, P['grass2'])
    if tall:
        for x in range(0, T, 2):
            h = r.randrange(6, 11)
            lean = r.choice([-1, 0, 1])
            for i in range(h):
                yy = T - 1 - i
                xx = x + (lean if i > h * 0.6 else 0)
                col = P['grass2'] if i < 3 else P['grass1'] if i < h - 2 else P['leaf_hi']
                c.set(xx, yy, col)
    return c


def petals(name: str) -> Canvas:
    c = grass(name)
    r = rng(name + 'p')
    for _ in range(11):
        x, y = r.randrange(0, 15), r.randrange(0, 15)
        c.set(x, y, r.choice([P['pod'], P['pod2'], P['pod_hi']]))
        if r.random() < 0.4:
            c.set(x + 1, y, P['pod2'])
    return c


# ---------------------------------------------------------------------------------------------- paths and roads
def path_tile(mask: int, base: RGBA = P['earth0'], name: str = 'path') -> Canvas:
    r = rng(f'{name}{mask}')
    g = grass(f'{name}g{mask}')
    c = Canvas(T, T, base)
    for y in range(T):
        for x in range(T):
            n = _noise(x, y, 5, 4)
            if n > 0.68:
                c.set(x, y, shade(base, 0.1))
            elif n < 0.3:
                c.set(x, y, shade(base, -0.1))
    for _ in range(4):  # pebbles: lit top, dark bottom
        x, y = r.randrange(1, 14), r.randrange(1, 14)
        c.set(x, y, P['sand']); c.set(x + 1, y, shade(base, 0.2)); c.set(x, y + 1, shade(base, -0.3)); c.set(x + 1, y + 1, shade(base, -0.3))
    en, ee, es, ew = not (mask & 1), not (mask & 2), not (mask & 4), not (mask & 8)
    for y in range(T):
        for x in range(T):
            j = (_h(f'{name}{mask}{x}{y}') % 3) - 1
            d = 99
            if en: d = min(d, y)
            if es: d = min(d, T - 1 - y)
            if ew: d = min(d, x)
            if ee: d = min(d, T - 1 - x)
            for cx, cy, on in ((4, 4, en and ew), (11, 4, en and ee), (4, 11, es and ew), (11, 11, es and ee)):
                if on and ((x < 4) if cx == 4 else (x > 11)) and ((y < 4) if cy == 4 else (y > 11)):
                    d = min(d, int(4 - ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5))
            if d + j < 2:
                c.set(x, y, g.get(x, y))
            elif d + j == 2:
                # the grass edge casts a little shadow onto the path
                c.set(x, y, shade(base, -0.25))
    return c


def road(name: str, marking: str | None = None) -> Canvas:
    r = rng(name)
    c = Canvas(T, T, P['tar0'])
    for y in range(T):
        for x in range(T):
            n = _noise(x, y, 3, 4)
            if n > 0.7:
                c.set(x, y, P['tar2'])
            elif n < 0.28:
                c.set(x, y, P['tar1'])
    c.speckle(0, 0, T, T, [P['tar2'], P['stone']], 0.05, r)
    if name.endswith('1'):
        # a patch of newer tar, and a hairline crack
        c.rect(3, 4, 7, 5, P['tar1'])
        c.hline(3, 4, 7, shade(P['tar1'], 0.15))
        for i in range(6):
            c.set(9 + i // 2, 10 + i, P['ink2'])
    if marking == 'dash':
        c.rect(2, 7, 12, 2, P['paper'])
        c.hline(2, 9, 12, shade(P['tar0'], -0.2))
        c.set(5, 7, P['mist']); c.set(10, 8, P['mist'])
    elif marking == 'zebra':
        for x in range(1, T, 5):
            c.rect(x, 0, 3, T, P['paper'])
            c.vline(x + 3, 0, T, shade(P['tar0'], -0.15))
            for y in range(0, T, 5):
                c.set(x + 1, y, P['mist'])
    return c


def kerb(name: str, side: str) -> Canvas:
    """The road edge: kerb stones painted black and yellow, with a drain grate on some tiles."""
    c = road(name)
    drain = name.endswith('d')
    y0 = 0 if side == 'n' else T - 5
    for i in range(0, T, 4):
        col = P['yellow'] if (i // 4) % 2 == 0 else P['ink']
        c.rect(i, y0, 4, 4, col)
        c.hline(i, y0, 4, shade(col, 0.3))
        c.vline(i + 3, y0, 4, shade(col, -0.25))
    if side == 'n':
        c.hline(0, 4, T, shade(P['tar0'], -0.35))  # the kerb's shadow on the road
    else:
        c.hline(0, T - 1, T, P['tar1'])
    if drain:
        gy = 5 if side == 'n' else T - 9
        c.rect(4, gy, 8, 3, P['ink'])
        for x in range(5, 12, 2):
            c.vline(x, gy, 3, P['slate'])
    return c


def pavers(name: str) -> Canvas:
    """Interlocking paver bricks, each bevelled: lit top-left edge, shaded bottom-right."""
    r = rng(name)
    c = Canvas(T, T, P['slate'])
    for by in range(0, T, 4):
        off = 0 if (by // 4) % 2 == 0 else 4
        for bx in range(-8, T, 8):
            x0 = bx + off
            col = r.choice([P['conc0']] * 6 + [P['conc2']] * 2 + [P['brick']])
            for y in range(by, by + 3):
                for x in range(x0, x0 + 7):
                    if 0 <= x < T:
                        c.set(x, y, col)
            for x in range(x0, x0 + 7):
                if 0 <= x < T:
                    c.set(x, by, shade(col, 0.16))
                    c.set(x, by + 2, shade(col, -0.14))
            if 0 <= x0 < T:
                c.vline(x0, by, 3, shade(col, 0.1))
            if 0 <= x0 + 6 < T:
                c.vline(x0 + 6, by, 3, shade(col, -0.16))
            if r.random() < 0.3 and 0 <= x0 + 3 < T:
                c.set(x0 + 3, by + 1, shade(col, -0.08))
    # the odd weed between the bricks
    if r.random() < 0.3:
        x = r.randrange(2, 14)
        c.set(x, 3, P['grass1']); c.set(x + 1, 2, P['leaf_hi'])
    return c


# ---------------------------------------------------------------------------------------------- buildings
STYLES = {
    'hostel': {'wall': P['cream'], 'trim': P['wood1'], 'roof': P['conc0'], 'win': P['sky'], 'door': P['wood0'], 'base': P['earth1']},
    'dept': {'wall': P['brick'], 'trim': P['cream'], 'roof': P['conc1'], 'win': P['sky'], 'door': P['blue1'], 'base': P['conc1']},
    'house': {'wall': P['hostel_green'], 'trim': P['cream'], 'roof': P['terra'], 'win': P['sky'], 'door': P['wood0'], 'base': P['earth1']},
}
CURTAINS = [P['red0'], P['pod'], P['mint'], P['pink'], P['purple'], P['orange']]


def building_parts(style: str) -> dict[str, Canvas]:
    s = STYLES[style]
    out: dict[str, Canvas] = {}
    wall, roof = s['wall'], s['roof']

    def roofc(name: str, edges: str) -> Canvas:
        c = Canvas(T, T, roof)
        for y in range(T):
            for x in range(T):
                n = _noise(x, y, _h(style) % 50, 8)
                if n > 0.66:
                    c.set(x, y, shade(roof, 0.07))
                elif n < 0.3:
                    c.set(x, y, shade(roof, -0.07))
        r = rng(style + name)
        if r.random() < 0.5:  # tar-sealed cracks and rain stains
            x, y = r.randrange(2, 10), r.randrange(3, 12)
            for i in range(5):
                c.set(x + i, y + (i % 2), P['slate'])
        # the parapet wall around the roof: a lit top and its inner shadow
        lip, lip_hi, inner = shade(roof, 0.18), shade(roof, 0.34), shade(roof, -0.28)
        if 'n' in edges:
            c.rect(0, 0, T, 3, lip); c.hline(0, 0, T, lip_hi); c.hline(0, 3, T, inner)
        if 'w' in edges:
            c.rect(0, 0, 3, T, lip); c.vline(0, 0, T, lip_hi); c.vline(3, 3 if 'n' in edges else 0, T, inner)
        if 'e' in edges:
            c.rect(T - 3, 0, 3, T, lip); c.vline(T - 1, 0, T, shade(roof, 0.05)); c.vline(T - 4, 3 if 'n' in edges else 0, T, shade(roof, -0.12))
        return c

    for key, edges in (('roof_nw', 'nw'), ('roof_n', 'n'), ('roof_ne', 'ne'), ('roof_w', 'w'), ('roof_c', ''), ('roof_e', 'e')):
        out[key] = roofc(key, edges)
    # the parapet front: the roof's front lip seen from above, then its thickness, then shadow on the wall
    for key, edges in (('parapet_w', 'w'), ('parapet_c', ''), ('parapet_e', 'e')):
        c = roofc(key, edges)
        c.rect(0, 8, T, 3, shade(roof, 0.2)); c.hline(0, 8, T, shade(roof, 0.36))
        c.rect(0, 11, T, 3, shade(roof, -0.12)); c.hline(0, 13, T, shade(roof, -0.3))
        c.rect(0, 14, T, 2, shade(wall, -0.38))
        out[key] = c

    def wallc(name: str, ledge: bool = False) -> Canvas:
        c = Canvas(T, T, wall)
        for y in range(T):
            for x in range(T):
                n = _noise(x, y, _h(style + 'w') % 50, 4)
                if n > 0.72:
                    c.set(x, y, shade(wall, 0.05))
                elif n < 0.25:
                    c.set(x, y, shade(wall, -0.05))
        if style == 'dept':
            for y in range(0, T, 4):
                c.hline(0, y, T, shade(wall, -0.2))
                c.hline(0, y + 1, T, shade(wall, 0.06))
                off = 0 if (y // 4) % 2 == 0 else 4
                for x in range(off, T, 8):
                    c.vline(x, y, 4, shade(wall, -0.2))
        # rain streaks under the ledges
        r = rng(style + name)
        if r.random() < 0.4 and style != 'dept':
            x = r.randrange(2, 13)
            for y in range(4, r.randrange(8, 14)):
                c.set(x, y, shade(wall, -0.08))
        if ledge:
            # the floor ledge (chajja) running along the building, and its shadow
            c.rect(0, 0, T, 2, shade(s['trim'] if style != 'hostel' else wall, 0.22))
            c.hline(0, 2, T, shade(wall, -0.3))
            c.hline(0, 3, T, shade(wall, -0.14))
        return c

    for lg in ('', '_l'):
        out[f'wall_c{lg}'] = wallc('wall_c', lg == '_l')
        w = wallc('wall_w', lg == '_l'); w.vline(0, 0, T, shade(wall, 0.25)); w.vline(1, 0, T, shade(wall, 0.12)); out[f'wall_w{lg}'] = w
        e = wallc('wall_e', lg == '_l'); e.rect(T - 3, 0, 3, T, shade(wall, -0.24)); e.vline(T - 1, 0, T, shade(wall, -0.36)); out[f'wall_e{lg}'] = e

    # windows: sunshade, frame, grill, glass with a reflection, curtains in different colours
    for i, cur in enumerate(CURTAINS[:3]):
        for lg in ('', '_l'):
            win = wallc(f'window{i}', lg == '_l')
            top = 4 if lg else 1
            win.rect(1, top, 14, 2, shade(s['trim'], 0.12)); win.hline(1, top, 14, shade(s['trim'], 0.3))
            win.hline(2, top + 2, 12, shade(wall, -0.42)); win.hline(2, top + 3, 12, shade(wall, -0.2))
            win.rect(3, top + 3, 10, 15 - top - 4, P['ink2'])
            gx0, gy0, gx1, gy1 = 4, top + 4, 11, 13
            win.rect(gx0, gy0, gx1 - gx0 + 1, gy1 - gy0 + 1, s['win'])
            # curtains drawn to the sides
            curt = cur if style != 'dept' else P['mist']
            win.rect(gx0, gy0, 2, gy1 - gy0 + 1, curt); win.vline(gx0 + 1, gy0, gy1 - gy0 + 1, shade(curt, -0.2))
            win.rect(gx1 - 1, gy0, 2, gy1 - gy0 + 1, shade(curt, -0.1))
            # glass reflection
            for k in range(3):
                win.set(gx0 + 3 + k, gy0 + 2 - k if gy0 + 2 - k >= gy0 else gy0, shade(s['win'], 0.5))
            win.rect(gx0 + 2, gy0, 4, 1, shade(s['win'], 0.3))
            # grills
            for x in (6, 9):
                win.vline(x, gy0, gy1 - gy0 + 1, P['slate'])
            win.hline(gx0, (gy0 + gy1) // 2, gx1 - gx0 + 1, P['slate'])
            win.hline(2, 14, 12, shade(wall, 0.2)); win.hline(2, 15, 12, shade(wall, -0.25))  # sill
            out[f'window{i}{lg}'] = win
    # a drain pipe down the wall
    for lg in ('', '_l'):
        pipe = wallc('pipe', lg == '_l')
        pipe.rect(7, 0, 3, T, P['stone']); pipe.vline(7, 0, T, P['mist']); pipe.vline(9, 0, T, P['slate'])
        pipe.hline(6, 6, 5, P['slate']); pipe.hline(6, 13, 5, P['slate'])
        out[f'pipe{lg}'] = pipe
    # the base row: a skirting band, darker at the ground
    for key, src in (('base_w', 'wall_w'), ('base_c', 'wall_c'), ('base_e', 'wall_e')):
        cc = Canvas(T, T)
        cc.paste(out[src], 0, 0)
        cc.rect(0, 10, T, 6, s['base'])
        cc.hline(0, 10, T, shade(s['base'], 0.25))
        cc.hline(0, 15, T, shade(s['base'], -0.35))
        for x in range(0, T, 5):
            cc.set(x, 12, shade(s['base'], -0.15))
        out[key] = cc
    # the door: a frame, double leaves with panels, a lamp and a step
    top = wallc('door_top')
    top.rect(1, 2, 14, 14, shade(wall, -0.34))
    top.rect(1, 1, 14, 2, shade(s['trim'], 0.15)); top.hline(1, 1, 14, shade(s['trim'], 0.35))
    top.rect(2, 4, 12, 12, s['door'])
    top.vline(7, 4, 12, shade(s['door'], -0.4)); top.vline(8, 4, 12, shade(s['door'], 0.1))
    for x0 in (3, 9):
        top.rect(x0, 6, 4, 6, shade(s['door'], 0.14)); top.hline(x0, 6, 4, shade(s['door'], 0.3)); top.vline(x0 + 3, 6, 6, shade(s['door'], -0.2))
    top.rect(6, 0, 4, 1, P['pod_hi'])  # the lamp over the door
    out['door_top'] = top
    bot = Canvas(T, T, shade(wall, -0.34))
    bot.rect(2, 0, 12, 11, s['door'])
    bot.vline(7, 0, 11, shade(s['door'], -0.4)); bot.vline(8, 0, 11, shade(s['door'], 0.1))
    for x0 in (3, 9):
        bot.rect(x0, 2, 4, 6, shade(s['door'], 0.14)); bot.hline(x0, 2, 4, shade(s['door'], 0.3)); bot.vline(x0 + 3, 2, 6, shade(s['door'], -0.2))
    bot.set(6, 3, P['pod']); bot.set(9, 3, P['pod'])
    bot.rect(0, 11, T, 5, P['conc2']); bot.hline(0, 11, T, P['white']); bot.hline(0, 13, T, P['conc0']); bot.hline(0, 15, T, P['conc1'])
    out['door_bot'] = bot
    # the window variant names the compiler asks for
    out['window'] = out['window0']
    return {f'{style}_{k}': v for k, v in out.items()}


# ---------------------------------------------------------------------------------------------- trees
def _canopy(c: Canvas, clusters: list[tuple[float, float, float]], base: RGBA, hi: RGBA, lo: RGBA, dark: RGBA, seed: str) -> None:
    """Leaf clusters: each a ball lit from the top left, darker where it tucks under its neighbours."""
    r = rng(seed)
    for cx, cy, rad in sorted(clusters, key=lambda t: t[1]):
        for y in range(int(cy - rad) - 1, int(cy + rad) + 2):
            for x in range(int(cx - rad) - 1, int(cx + rad) + 2):
                dx, dy = (x + 0.5 - cx) / rad, (y + 0.5 - cy) / rad
                d2 = dx * dx + dy * dy
                if d2 > 1:
                    continue
                # ragged leafy edge
                if d2 > 0.8 and (_h(f'{seed}{x},{y}') % 3 == 0):
                    continue
                light = -(dx * 0.6 + dy * 0.8)
                col = hi if light > 0.45 else base if light > -0.15 else lo if light > -0.6 else dark
                if col == base and (x * 7 + y * 3) % 11 == 0:
                    col = hi
                c.set(x, y, col)
    # leaf texture flecks
    for _ in range(len(clusters) * 6):
        x, y = r.randrange(0, c.w), r.randrange(0, c.h)
        p = c.get(x, y)
        if p[3] and p in (base, lo):
            c.set(x, y, shade(p, -0.12))


def _trunk(c: Canvas, x0: int, y0: int, w: int, h: int) -> None:
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            t = (x - x0) / max(1, w - 1)
            col = P['wood0'] if t < 0.3 else P['wood1'] if t < 0.75 else P['wood2']
            if (y * 3 + x) % 7 == 0:
                col = shade(col, -0.15)
            c.set(x, y, col)
    # root flare
    c.hline(x0 - 2, y0 + h - 1, w + 4, P['wood1'])
    c.hline(x0 - 1, y0 + h - 2, w + 2, P['wood1'])
    c.set(x0 - 2, y0 + h - 1, P['wood2']); c.set(x0 + w + 1, y0 + h - 1, P['wood2'])


def tree_copperpod():
    from tiles import Prop
    c = Canvas(72, 84)
    c.shadow(37, 79, 26, 6, 80)
    _trunk(c, 33, 50, 7, 30)
    # branches reaching into the canopy
    for i in range(9):
        c.set(32 - i, 49 - i, P['wood1']); c.set(31 - i, 49 - i, P['wood2'])
        c.set(40 + i, 48 - i, P['wood1']); c.set(41 + i, 48 - i, P['wood2'])
    clusters = [(36, 32, 15), (19, 36, 11), (53, 36, 11), (26, 20, 12), (47, 20, 12), (36, 11, 11), (12, 26, 8), (60, 26, 8),
                (36, 42, 10), (22, 46, 7), (50, 46, 7)]
    _canopy(c, clusters, P['grass1'], P['leaf_hi'], P['grass2'], P['grass3'], 'copperpod')
    r = rng('pods')
    # the yellow flower spikes, brighter on the lit side
    for _ in range(260):
        x, y = r.randrange(3, 69), r.randrange(0, 54)
        p = c.get(x, y)
        if p[3] and p not in (P['wood0'], P['wood1'], P['wood2']) and p[1] > 60:
            lit = p in (P['leaf_hi'], P['grass1'])
            c.set(x, y, P['pod_hi'] if lit and r.random() < 0.4 else P['pod'] if lit else P['pod2'])
            if r.random() < 0.5 and c.get(x, y + 1)[3]:
                c.set(x, y + 1, P['pod2'])
    c.outline(lambda n: mix(n, P['ink'], 0.72))
    return Prop(c, (2, 1))


def tree_neem():
    from tiles import Prop
    c = Canvas(60, 74)
    c.shadow(30, 69, 22, 5, 80)
    _trunk(c, 27, 44, 6, 26)
    clusters = [(30, 28, 14), (15, 32, 10), (45, 31, 10), (21, 16, 11), (39, 17, 11), (30, 8, 8), (30, 38, 9)]
    _canopy(c, clusters, P['grass2'], P['grass1'], P['grass3'], P['leaf_lo'], 'neem')
    c.outline(lambda n: mix(n, P['ink'], 0.72))
    return Prop(c, (2, 1))


def palm():
    """A coconut palm: a ringed, gently curving trunk and a crown of arching fronds, lit from the top left."""
    from tiles import Prop
    import math
    c = Canvas(64, 100)
    c.shadow(32, 96, 12, 3.5, 80)
    # trunk
    for y in range(30, 97):
        t = (96 - y) / 66
        x = int(29 + math.sin(t * 2.2) * 5)
        w = 6 if y > 70 else 5
        for i in range(w):
            col = P['wood0'] if i < 2 else P['wood1'] if i < w - 1 else P['wood2']
            c.set(x + i, y, col)
        if y % 4 == 0:
            c.hline(x, y, w, P['wood2'])
            c.set(x, y, P['wood1'])
    top_x = int(29 + math.sin(2.2) * 5) + 2
    # coconuts
    for dx, dy in ((-2, 32), (2, 33), (0, 35), (4, 31)):
        c.ellipse(top_x + dx, dy, 2.2, 2.2, P['khaki'])
        c.set(top_x + dx - 1, dy - 1, P['sand'])
    # fronds: arcs out from the crown, each leaflet a short diagonal stroke
    for ang in (-2.8, -2.2, -1.6, -1.0, -0.45, 0.2, 0.75, 1.3, 1.9, 2.6, 3.1):
        length = 26 if abs(ang) < 1.5 else 22
        for i in range(length):
            f = i / length
            x = top_x + math.cos(ang - math.pi / 2) * i * 1.05
            y = 30 + math.sin(ang - math.pi / 2) * i * 0.75 + (f * f) * 16
            xi, yi = int(x), int(y)
            lit = math.cos(ang - math.pi / 2) < 0.2 and math.sin(ang - math.pi / 2) < 0.3
            rib = P['grass1'] if lit else P['grass2']
            c.set(xi, yi, rib)
            if i > 3 and i % 2 == 0:
                for k in (1, 2, 3):
                    c.set(xi - k if ang < 0 else xi + k, yi + k, P['leaf_hi'] if lit and k == 1 else P['grass2'] if k < 3 else P['grass3'])
                    c.set(xi, yi + k + 1, P['grass3'] if k == 3 else rib)
    c.outline(lambda n: mix(n, P['ink'], 0.72))
    return Prop(c, (1, 1))
