"""Overworld character sprites (24x32, 4 directions x 3 frames) and dialogue portraits (48x48).

A figure is painted as a grid of part labels (skin, hair, shirt, collar, strap...) from exact coordinates
for each direction and walk frame, then every part is shaded as a form lit from the top left (highlight,
base, shadow), and wrapped in a selective outline: a dark tone of the colour it touches.

Proportions follow the later handheld RPGs: a big readable head (12 px), a 16 px wide body with arms,
and legs that stride. Feet sit on the bottom of the 16 px tile; the head rises into the tile above.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from px import PAL, Canvas, RGBA, mix, shade

W, H = 24, 32
DIRS = ('down', 'up', 'left', 'right')
FRAMES = ('stand', 'walk_a', 'walk_b')
P = PAL


@dataclass
class Look:
    id: str
    skin: str = 'skin0'
    hair: str = 'short'
    hair_color: str = 'hair0'
    shirt: RGBA = P['blue0']
    trousers: RGBA = P['ink2']
    shoes: RGBA = P['wood2']
    #: shirt (collar + buttons), tshirt, kurta (long tunic + leggings), uniform (khaki, belt, badges), saree
    top: str = 'shirt'
    collar: RGBA | None = None
    glasses: bool = False
    cap: RGBA | None = None
    bag: RGBA | None = None
    dupatta: RGBA | None = None
    lanyard: bool = False
    beard: bool = False
    #: Kept for compatibility with older looks (kurta / skirt).
    lower: str = 'pants'
    extra: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------------------------- the part grid
class Grid:
    def __init__(self) -> None:
        self.g = [['.'] * W for _ in range(H)]

    def px(self, p: str, x: int, y: int) -> None:
        if 0 <= x < W and 0 <= y < H:
            self.g[y][x] = p

    def row(self, p: str, y: int, x0: int, x1: int) -> None:
        for x in range(x0, x1 + 1):
            self.px(p, x, y)

    def rect(self, p: str, x0: int, y0: int, x1: int, y1: int) -> None:
        for y in range(y0, y1 + 1):
            self.row(p, y, x0, x1)

    def only(self, p: str, x: int, y: int, over: str) -> None:
        """Paint only over a given part (e.g. a collar over the shirt)."""
        if 0 <= x < W and 0 <= y < H and self.g[y][x] in over:
            self.g[y][x] = p

    def shift(self, dy: int, y_max: int) -> None:
        """Moves rows 0..y_max up (dy<0) or down: the bob of a step."""
        if dy == 0:
            return
        top = [r[:] for r in self.g[: y_max + 1]]
        for y in range(y_max + 1):
            src = y - dy
            self.g[y] = top[src][:] if 0 <= src <= y_max else ['.'] * W

    def mirror(self) -> None:
        self.g = [list(reversed(r)) for r in self.g]


# Head outline rows (y: x0, x1) for the front/back and the profile.
HEAD_FRONT = {3: (8, 15), 4: (7, 16), 5: (6, 17), 6: (6, 17), 7: (6, 17), 8: (6, 17), 9: (6, 17), 10: (6, 17), 11: (6, 17), 12: (6, 17), 13: (7, 16), 14: (8, 15)}
HEAD_SIDE = {3: (9, 14), 4: (8, 15), 5: (7, 16), 6: (7, 16), 7: (7, 16), 8: (7, 16), 9: (7, 16), 10: (7, 16), 11: (7, 16), 12: (7, 16), 13: (8, 15), 14: (9, 14)}


def body_front(g: Grid, look: Look, frame: str, back: bool) -> None:
    # head
    for y, (a, b) in HEAD_FRONT.items():
        g.row('S', y, a, b)
    if not back:
        for y in (9, 10, 11):
            g.px('s', 5, y)
            g.px('s', 18, y)
    g.rect('s', 10, 15, 13, 15)  # neck
    # torso and arms
    long_top = look.top in ('kurta', 'saree')
    g.row('T', 16, 7, 16)
    g.rect('T', 6, 17, 17, 23 if not long_top else 26)
    if long_top:
        g.row('T', 26, 5, 18)
        g.row('T', 25, 6, 17)
    g.rect('A', 4, 16, 5, 19)
    g.rect('A', 18, 16, 19, 19)
    sw = {'stand': (0, 0), 'walk_a': (-1, 1), 'walk_b': (1, -1)}[frame]
    for side, x0, dy in ((0, 4, sw[0]), (1, 18, sw[1])):
        g.rect('K', x0, 20 + dy, x0 + 1, 22 + dy)
        g.rect('k', x0, 23 + dy, x0 + 1, 23 + dy)
    # belt and legs
    if not long_top:
        g.row('B', 24, 6, 17)
    top_leg = 27 if long_top else 25
    lift_l = {'stand': 0, 'walk_a': 2, 'walk_b': 0}[frame]
    lift_r = {'stand': 0, 'walk_a': 0, 'walk_b': 2}[frame]
    for x0, lift in ((7, lift_l), (13, lift_r)):
        g.rect('P', x0, top_leg, x0 + 3, 29 - lift)
        g.row('F', 30 - lift, x0 - (1 if x0 == 7 else 0), x0 + 3 + (1 if x0 == 13 else 0))
    if look.top == 'saree':
        # the saree falls to the ankles; only the feet show
        g.rect('T', 6, 26, 17, 29)
        g.row('T', 29, 5, 18)
    # details
    if not back:
        if look.top == 'shirt':
            g.px('C', 9, 16); g.px('C', 10, 16); g.px('C', 13, 16); g.px('C', 14, 16)
            g.px('s', 11, 16); g.px('s', 12, 16)
            for y in (18, 20, 22):
                g.only('c', 12, y, 'T')
            g.only('Q', 8, 18, 'T'); g.only('Q', 9, 18, 'T')  # pocket
        elif look.top == 'tshirt':
            g.row('C', 16, 10, 13)
            g.rect('Q', 10, 19, 13, 20)  # a small print
        elif look.top == 'uniform':
            g.row('C', 16, 9, 14)
            g.px('s', 11, 16); g.px('s', 12, 16)
            g.px('Y', 7, 17); g.px('Y', 16, 17)  # shoulder badges
            g.px('Y', 9, 19)  # name badge
            for y in (18, 20, 22):
                g.only('c', 12, y, 'T')
        elif look.top in ('kurta', 'saree'):
            g.row('C', 16, 10, 13)
            g.only('C', 11, 17, 'T'); g.only('C', 12, 17, 'T')
            for y in range(18, 25, 2):
                g.only('c', 11, y, 'T')
        if look.lanyard:
            for (x, y) in ((9, 17), (10, 18), (13, 18), (14, 17)):
                g.only('x', x, y, 'T')
            g.rect('Z', 11, 19, 12, 20)
    else:
        g.row('C', 16, 9, 14)
    if look.dupatta is not None:
        # a dupatta over both shoulders, falling at the back / front
        if back:
            g.rect('D', 7, 16, 16, 17)
            g.rect('D', 9, 18, 14, 21)
        else:
            g.rect('D', 6, 16, 7, 23)
            g.rect('D', 16, 16, 17, 23)
    if look.bag is not None:
        if back:
            g.rect('X', 8, 17, 15, 23)
            g.row('x', 17, 8, 15)
            g.rect('x', 10, 20, 13, 21)
        else:
            for y in range(16, 22):
                g.only('x', 7, y, 'TCcQD')
                g.only('x', 16, y, 'TCcQD')
    # face
    if not back:
        g.row('L', 9, 8, 9); g.row('L', 9, 14, 15)
        g.rect('E', 8, 10, 9, 11); g.rect('E', 14, 10, 15, 11)
        g.px('W', 8, 10); g.px('W', 14, 10)
        g.px('n', 11, 12); g.px('n', 12, 12)
        g.row('M', 13, 11, 12)
        if look.beard:
            for (x, y) in ((7, 12), (8, 13), (9, 14), (10, 14), (13, 14), (14, 14), (15, 13), (16, 12)):
                g.px('b', x, y)
            g.row('b', 14, 10, 13)
            g.px('M', 11, 13); g.px('M', 12, 13)
        if look.glasses:
            g.row('G', 9, 7, 10); g.row('G', 9, 13, 16)
            g.px('G', 7, 10); g.px('G', 10, 10); g.px('G', 13, 10); g.px('G', 16, 10)
            g.row('G', 12, 7, 10); g.row('G', 12, 13, 16)
            g.px('G', 11, 10); g.px('G', 12, 10)
            for (x, y) in ((8, 11), (9, 11), (14, 11), (15, 11)):
                g.px('g', x, y)


def body_side(g: Grid, look: Look, frame: str) -> None:
    for y, (a, b) in HEAD_SIDE.items():
        g.row('S', y, a, b)
    g.px('S', 6, 11)  # nose
    g.px('s', 6, 12)
    g.rect('s', 12, 9, 13, 11)  # ear
    g.rect('s', 10, 15, 13, 15)  # neck
    long_top = look.top in ('kurta', 'saree')
    g.rect('T', 8, 16, 15, 23 if not long_top else 26)
    if long_top:
        g.row('T', 26, 7, 16)
    if look.bag is not None:
        g.rect('X', 15, 17, 17, 23)
        g.row('x', 16, 12, 15)
    if not long_top:
        g.row('B', 24, 8, 15)
    top_leg = 27 if long_top else 25
    if frame == 'stand':
        g.rect('P', 9, top_leg, 14, 29)
        g.row('F', 30, 7, 13)
    elif frame == 'walk_a':
        # front leg reaching forward (left), back leg pushing off (right)
        for y in range(top_leg, 30):
            t = y - top_leg
            g.row('P', y, 9 - t // 2, 11 - t // 2)
            g.row('P', y, 12 + t // 2, 14 + t // 2)
        g.row('F', 30, 5, 9)
        g.row('F', 29, 15, 18)
    else:
        # passing: legs together, the back one bent
        g.rect('P', 10, top_leg, 13, 29)
        g.rect('P', 13, 26, 15, 28)
        g.row('F', 30, 8, 12)
        g.row('F', 28, 14, 16)
    if look.top == 'saree':
        g.rect('T', 8, 26, 16, 29)
    # the near arm swings with the step
    if frame == 'stand':
        g.rect('a', 10, 16, 12, 19); g.rect('K', 11, 20, 12, 22); g.px('k', 11, 23); g.px('k', 12, 23)
    elif frame == 'walk_a':
        g.rect('a', 12, 16, 14, 19); g.rect('K', 14, 20, 15, 21); g.px('k', 15, 22)
    else:
        g.rect('a', 9, 16, 11, 18); g.rect('K', 8, 19, 9, 20); g.px('k', 7, 21); g.px('k', 8, 21)
    if look.dupatta is not None:
        g.rect('D', 12, 16, 15, 17)
        g.rect('D', 14, 18, 15, 23)
    # face
    g.row('L', 9, 8, 9)
    g.rect('E', 8, 10, 8, 11)
    g.px('W', 8, 10)
    g.px('M', 8, 13)
    if look.beard:
        g.rect('b', 8, 13, 11, 14)
        g.px('M', 8, 13)
    if look.glasses:
        g.row('G', 9, 7, 9); g.px('G', 7, 10); g.px('G', 9, 10); g.row('G', 11, 7, 9); g.row('G', 10, 10, 12)
        g.px('g', 8, 11)
    if look.top == 'uniform':
        g.px('Y', 12, 17)


# ---------------------------------------------------------------------------------------------- hair
def hair(g: Grid, look: Look, d: str) -> None:
    st = look.hair
    H_ = 'H'
    if st == 'bald':
        if d == 'down':
            g.rect(H_, 6, 8, 6, 10); g.rect(H_, 17, 8, 17, 10)
        elif d == 'up':
            g.rect(H_, 6, 9, 17, 12); g.row(H_, 13, 7, 16)
        else:
            g.rect(H_, 12, 7, 16, 9); g.rect(H_, 14, 10, 16, 12)
        return
    if d == 'down':
        # the crown, a fringe and the sides
        g.row(H_, 2, 9, 14)
        g.row(H_, 3, 7, 16)
        g.rect(H_, 6, 4, 17, 6)
        g.row(H_, 7, 6, 17)
        g.rect(H_, 5, 5, 5, 9); g.rect(H_, 18, 5, 18, 9)
        # fringe shape per style
        if st == 'short':
            g.row('S', 7, 9, 16); g.px('S', 8, 7)
            g.px(H_, 12, 7); g.px(H_, 13, 7)  # a side part
        elif st == 'spiky':
            for x in (7, 9, 11, 14, 16):
                g.px(H_, x, 1)
            g.row(H_, 2, 7, 16)
            g.row('S', 7, 8, 15)
            for x in (9, 12, 15):
                g.px(H_, x, 7)
            g.px(H_, 4, 5); g.px(H_, 19, 5)
        elif st == 'messy':
            g.row('S', 7, 8, 15)
            for x in (8, 10, 13, 15):
                g.px(H_, x, 7)
            g.px(H_, 10, 1); g.px(H_, 15, 2)
        elif st == 'curly':
            for x in range(6, 18, 2):
                g.px(H_, x, 2)
            g.row('S', 7, 8, 15)
            g.px(H_, 9, 7); g.px(H_, 14, 7)
            g.rect(H_, 4, 6, 5, 10); g.rect(H_, 18, 6, 19, 10)
        elif st in ('long', 'ponytail', 'braid', 'bun'):
            # a centre parting and hair framing the face
            g.row('S', 7, 8, 15)
            g.px('h', 11, 3); g.px('h', 12, 3)
            if st == 'long':
                g.rect(H_, 5, 7, 6, 21); g.rect(H_, 17, 7, 18, 21)
                g.rect(H_, 4, 12, 4, 20); g.rect(H_, 19, 12, 19, 20)
            else:
                g.rect(H_, 5, 7, 6, 11); g.rect(H_, 17, 7, 18, 11)
            if st == 'bun':
                g.rect(H_, 9, 0, 14, 2)
        if look.cap is not None:
            g.rect('O', 6, 2, 17, 6); g.row('O', 1, 8, 15)
            g.row('o', 7, 5, 18)
            g.rect('Y', 11, 3, 12, 4)
    elif d == 'up':
        g.row(H_, 2, 9, 14)
        g.row(H_, 3, 7, 16)
        g.rect(H_, 6, 4, 17, 12)
        g.row(H_, 13, 7, 16)
        g.rect(H_, 5, 5, 5, 11); g.rect(H_, 18, 5, 18, 11)
        if st == 'spiky':
            for x in (7, 9, 11, 14, 16):
                g.px(H_, x, 1)
            g.px(H_, 4, 6); g.px(H_, 19, 6); g.px(H_, 8, 14); g.px(H_, 15, 14)
        elif st == 'messy':
            g.px(H_, 10, 1); g.px(H_, 8, 14); g.px(H_, 14, 14)
        elif st == 'curly':
            for x in range(6, 18, 2):
                g.px(H_, x, 2)
            g.rect(H_, 4, 6, 5, 12); g.rect(H_, 18, 6, 19, 12)
        elif st == 'long':
            g.rect(H_, 5, 12, 18, 21); g.row(H_, 22, 7, 16)
        elif st == 'ponytail':
            g.rect(H_, 10, 13, 13, 16); g.rect(H_, 11, 17, 12, 20); g.px('h', 11, 13)
            g.rect('R', 10, 13, 13, 13)
        elif st == 'braid':
            for y in range(13, 25):
                g.row(H_, y, 10 + (y % 2), 12 + (y % 2))
            g.rect('R', 10, 24, 13, 24)
        elif st == 'bun':
            g.rect(H_, 9, 0, 14, 2); g.rect(H_, 9, 11, 14, 14); g.row('R', 10, 9, 14)
        if look.cap is not None:
            g.rect('O', 6, 2, 17, 7); g.row('O', 1, 8, 15)
    else:  # left profile (right is mirrored)
        g.row(H_, 2, 9, 14)
        g.row(H_, 3, 8, 16)
        g.rect(H_, 7, 4, 17, 6)
        g.rect(H_, 11, 7, 17, 8)
        g.rect(H_, 14, 9, 17, 11)
        g.rect(H_, 15, 12, 16, 13)
        g.px(H_, 7, 7)
        if st == 'spiky':
            for x in (8, 10, 12, 15):
                g.px(H_, x, 1)
            g.px(H_, 18, 4); g.px(H_, 18, 6); g.px(H_, 6, 5)
        elif st == 'messy':
            g.px(H_, 10, 1); g.px(H_, 18, 5); g.px(H_, 6, 6)
        elif st == 'curly':
            g.rect(H_, 16, 4, 18, 12)
        elif st == 'long':
            g.rect(H_, 13, 9, 17, 21); g.row(H_, 22, 14, 16)
        elif st == 'ponytail':
            g.rect(H_, 17, 8, 19, 10); g.rect(H_, 18, 11, 19, 17); g.px('R', 17, 9)
        elif st == 'braid':
            for y in range(12, 24):
                g.row(H_, y, 15, 16)
        elif st == 'bun':
            g.rect(H_, 15, 2, 18, 5); g.px('R', 16, 6)
        if look.cap is not None:
            g.rect('O', 7, 2, 17, 6); g.row('O', 1, 9, 15)
            g.row('o', 7, 4, 11)
            g.px('Y', 9, 4)


def build_grid(look: Look, d: str, frame: str) -> Grid:
    g = Grid()
    if d in ('down', 'up'):
        body_front(g, look, frame, back=(d == 'up'))
        if d == 'down' and look.hair in ('long', 'ponytail', 'braid'):
            # long hair falls behind the shoulders; paint it first so the body covers it
            pass
    else:
        body_side(g, look, frame)
    hair(g, look, 'down' if d == 'down' else 'up' if d == 'up' else 'left')
    # glasses and eyes sit over the hair fringe edge
    if d == 'down' and look.glasses:
        g.row('G', 9, 7, 10); g.row('G', 9, 13, 16)
    if frame != 'stand':
        # the bob: head and body rise a pixel on the stride frames
        g.shift(-1, 24)
    if d == 'right':
        g.mirror()
    return g


# ---------------------------------------------------------------------------------------------- colour and shading
def palette(look: Look) -> dict[str, RGBA]:
    skin = P[look.skin]
    hairc = P[look.hair_color]
    shirt = look.shirt
    trousers = look.trousers if look.top not in ('kurta',) else look.trousers
    return {
        'S': skin, 's': shade(skin, -0.14), 'K': skin, 'k': shade(skin, -0.06),
        'n': shade(skin, -0.2), 'M': shade(skin, -0.42), 'b': mix(hairc, skin, 0.35),
        'L': shade(hairc, -0.2), 'E': P['ink'], 'W': P['white'],
        'H': hairc, 'h': shade(hairc, 0.35), 'R': P['red0'],
        'T': shirt, 'A': shirt, 'a': shade(shirt, 0.1), 'C': look.collar or shade(shirt, 0.3), 'c': shade(shirt, -0.22), 'Q': shade(shirt, -0.12),
        'P': trousers, 'B': P['wood2'] if look.top != 'uniform' else P['wood1'], 'F': look.shoes,
        'G': P['ink2'], 'g': P['sky'],
        'O': look.cap or P['ink'], 'o': shade(look.cap or P['ink'], -0.3), 'Y': P['pod'],
        'X': look.bag or P['slate'], 'x': shade(look.bag or P['slate'], -0.3), 'Z': P['white'],
        'D': look.dupatta or P['pink'],
    }


FLAT = set('EWGgMYZRLn')
FORM = set('SKHTACaPDXOFb')


def render_frame(look: Look, d: str, frame: str) -> Canvas:
    g = build_grid(look, d, frame).g
    col = palette(look)
    c = Canvas(W, H)
    lit_left = d != 'right'
    for y in range(H):
        spans: dict[str, tuple[int, int]] = {}
        for x in range(W):
            p = g[y][x]
            if p != '.':
                a, b = spans.get(p, (x, x))
                spans[p] = (min(a, x), max(b, x))
        for x in range(W):
            p = g[y][x]
            if p == '.':
                continue
            base = col[p]
            if p in FLAT:
                c.set(x, y, base)
                continue
            same = lambda xx, yy: 0 <= xx < W and 0 <= yy < H and g[yy][xx] == p
            a, b = spans[p]
            t = (x - a) / max(1, b - a)
            if not lit_left:
                t = 1 - t
            k = 0.0
            # form shading across the part: lit side, base, shadow side
            if b - a >= 3:
                if t > 0.72:
                    k -= 0.2
                elif t < 0.22:
                    k += 0.1
            # under an overhang (hair over the forehead, the chin over the neck, a belt over the legs)
            if not same(x, y - 1) and y > 0 and g[y - 1][x] not in '.' and p in 'STPK':
                k -= 0.14
            # bottom edges fall into shadow
            if not same(x, y + 1) and p in 'HTDXO':
                k -= 0.12
            # hair sheen: a lighter band across the crown, and strands
            if p == 'H' and y in (3, 4) and 0.2 < t < 0.6:
                k += 0.3
            elif p == 'H' and y > 4 and (x + y * 2) % 5 == 0 and t < 0.7 and k >= 0:
                k += 0.14
            c.set(x, y, shade(base, k) if k else base)
    # selective outline: dark on the shadow side, softer on the lit side
    src = [[c.get(x, y) for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            if src[y][x][3]:
                continue
            best = None
            for dx, dy, soft in ((0, 1, False), (1 if lit_left else -1, 0, False), (0, -1, True), (-1 if lit_left else 1, 0, True)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and src[ny][nx][3]:
                    n = src[ny][nx]
                    best = mix(n, P['ink'], 0.62 if soft else 0.8)
                    if not soft:
                        break
            if best:
                c.set(x, y, best)
    return c


def sheet(look: Look) -> Canvas:
    """3 frames across (stand, walk_a, walk_b), 4 rows (down, up, left, right)."""
    s = Canvas(W * len(FRAMES), H * len(DIRS))
    for r, d in enumerate(DIRS):
        for f, frame in enumerate(FRAMES):
            s.paste(render_frame(look, d, frame), f * W, r * H)
    return s


# ---------------------------------------------------------------------------------------------- portraits
PW = 48


def portrait(look: Look) -> Canvas:
    """A 48x48 head-and-shoulders portrait, three-quarter view, painted with the same parts and palette."""
    c = Canvas(PW, PW)
    col = palette(look)
    skin, hairc, shirt = col['S'], col['H'], look.shirt
    sk_sh, sk_dk = shade(skin, -0.16), shade(skin, -0.3)

    def ell(cx, cy, rx, ry, color, cond=None):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1 and (cond is None or cond(x, y)):
                    c.set(x, y, color)

    # back hair (long styles) behind everything
    if look.hair == 'long':
        ell(23, 27, 15, 19, shade(hairc, -0.15))
    if look.hair in ('ponytail', 'braid'):
        ell(36, 24, 5, 10, shade(hairc, -0.15))
    if look.hair == 'bun':
        ell(33, 7, 7, 6, hairc)
    # shoulders and clothes
    ell(24, 52, 22, 15, shirt)
    for y in range(38, 48):
        for x in range(PW):
            p = c.get(x, y)
            if p[3] and p == shirt and x > 31:
                c.set(x, y, shade(shirt, -0.2))
            elif p[3] and p == shirt and x < 13:
                c.set(x, y, shade(shirt, 0.08))
    if look.dupatta is not None:
        ell(10, 44, 7, 9, look.dupatta)
        ell(38, 44, 6, 9, shade(look.dupatta, -0.15))
    if look.bag is not None:
        for y in range(38, 48):
            c.set(14 + (y - 38) // 3, y, col['x'])
            c.set(15 + (y - 38) // 3, y, col['x'])
    # neck
    c.rect(18, 30, 11, 9, sk_sh)
    c.rect(18, 30, 11, 2, sk_dk)
    # collar / neckline
    collar = col['C']
    if look.top in ('shirt', 'uniform'):
        for i in range(5):
            c.set(17 - i // 2, 37 + i, collar); c.set(18 - i // 2, 37 + i, collar)
            c.set(29 + i // 2, 37 + i, collar); c.set(30 + i // 2, 37 + i, collar)
        c.rect(23, 41, 2, 7, col['c'])
        if look.top == 'uniform':
            c.rect(10, 39, 4, 2, P['pod']); c.rect(35, 39, 4, 2, P['pod'])
    else:
        ell(24, 38, 6, 3, sk_sh, lambda x, y: y >= 37)
    if look.lanyard:
        for y in range(38, 48):
            c.set(19 - (y - 38) // 4, y, P['red0']); c.set(29 + (y - 38) // 4, y, P['red0'])
    # head: an egg, lit from the top left
    ell(24, 20, 12, 14, skin)
    for y in range(5, 36):
        for x in range(10, 38):
            if c.get(x, y) == skin:
                dx, dy = (x - 24) / 12, (y - 20) / 14
                if dx + dy * 0.4 > 0.55:
                    c.set(x, y, sk_sh)
                if dx + dy * 0.5 > 0.9:
                    c.set(x, y, sk_dk)
    # jaw/chin shadow under the face
    ell(24, 31, 7, 2.5, sk_sh, lambda x, y: y >= 31 and c.get(x, y)[3] and c.get(x, y) in (skin, sk_sh))
    # ears
    ell(12, 21, 2, 3.5, sk_sh); ell(36, 21, 2, 3.5, sk_dk)
    # hair
    st = look.hair
    if st != 'bald':
        ell(24, 11, 13.5, 8.5, hairc)
        ell(24, 7, 11, 5, hairc)
        if st == 'spiky':
            for sx, sy, r in ((11, 6, 3), (15, 2.5, 3), (21, 1.5, 3), (27, 2, 3), (33, 4, 3), (37, 9, 2.5), (10, 12, 2.5)):
                ell(sx, sy + 2, r * 0.8, r, hairc)
            for sx in (17, 23, 29):
                ell(sx, 15, 2.2, 3, hairc)
        elif st == 'messy':
            for sx, sy in ((12, 8), (19, 4), (28, 4), (35, 9), (16, 15), (26, 15)):
                ell(sx, sy, 3, 2.6, hairc)
        elif st == 'curly':
            for sx in range(10, 40, 5):
                for sy in (4, 9, 14):
                    ell(sx, sy, 3, 3, hairc)
        elif st == 'short':
            ell(20, 15, 7, 2.5, hairc)
            ell(31, 14, 4, 2.2, hairc)
        elif st in ('long', 'ponytail', 'braid', 'bun'):
            # centre parting, hair sweeping down both sides of the face
            for y in range(3, 16):
                c.set(24, y, shade(hairc, 0.25) if y < 9 else hairc)
            c.rect(10, 12, 4, 16 if st == 'long' else 10, hairc)
            c.rect(34, 12, 4, 16 if st == 'long' else 10, shade(hairc, -0.12))
        # sheen: a curved highlight across the crown
        for x, y in ((15, 8), (16, 7), (17, 6), (18, 6), (19, 5), (20, 5), (21, 5), (16, 8), (22, 5)):
            if c.get(x, y) == hairc:
                c.set(x, y, shade(hairc, 0.28))
        for y in range(3, 20):
            for x in range(30, 40):
                if c.get(x, y) == hairc and (x - 24) > 7:
                    c.set(x, y, shade(hairc, -0.15))
    else:
        c.rect(11, 17, 3, 8, P['hair2'])
        c.rect(34, 17, 3, 8, P['hair2'])
        ell(20, 10, 4, 2, shade(skin, 0.18))
    if look.cap is not None:
        ell(24, 10, 14, 7, look.cap)
        c.rect(8, 14, 32, 3, shade(look.cap, -0.3))
        c.rect(21, 5, 6, 4, P['pod'])
    # brows, eyes (white, iris, pupil, highlight, lid), nose, mouth
    brow = shade(hairc, -0.1) if st != 'bald' else P['hair2']
    c.hline(15, 17, 5, brow); c.set(14, 18, brow)
    c.hline(27, 17, 5, brow); c.set(32, 18, brow)
    for ex in (15, 27):
        c.hline(ex, 19, 5, shade(skin, -0.5))
        c.rect(ex, 20, 5, 3, P['white'])
        c.rect(ex + 1, 20, 3, 3, shade(hairc, 0.1) if st != 'bald' else P['wood2'])
        c.rect(ex + 2, 20, 2, 2, P['ink'])
        c.set(ex + 1, 20, P['white'])
        c.hline(ex, 23, 5, sk_sh)
    # nose: a shadow on the far side and the tip
    c.vline(25, 22, 4, sk_sh)
    c.set(23, 26, sk_dk); c.set(24, 26, sk_dk); c.set(25, 26, sk_sh)
    # mouth
    c.hline(21, 29, 6, shade(skin, -0.45))
    c.hline(22, 30, 4, shade(skin, -0.2))
    if look.beard:
        for y in range(24, 35):
            for x in range(11, 38):
                p = c.get(x, y)
                if p[3] and p in (skin, sk_sh, sk_dk) and (y > 27 or x < 15 or x > 33):
                    c.set(x, y, mix(hairc, p, 0.3) if (x * 3 + y) % 4 else shade(hairc, 0.15))
        c.hline(21, 29, 6, shade(hairc, -0.2))
    if look.glasses:
        gl = P['ink2']
        for ex in (14, 26):
            c.hline(ex, 18, 7, gl); c.hline(ex, 24, 7, gl)
            c.vline(ex, 18, 7, gl); c.vline(ex + 6, 18, 7, gl)
            c.set(ex + 5, 19, P['white']); c.set(ex + 4, 20, P['sky'])
        c.hline(21, 20, 5, gl)
        c.hline(33, 19, 4, gl)
    c.outline(lambda n: mix(n, P['ink'], 0.78))
    return c


# ---------------------------------------------------------------------------------------------- the cast
LOOKS: list[Look] = [
    Look('ragul', skin='skin0', hair='spiky', shirt=P['blue0'], trousers=P['ink2'], glasses=True, top='shirt', collar=P['sky'], bag=P['slate']),
    Look('nithish', skin='skin1', hair='short', shirt=P['red0'], trousers=P['slate'], top='tshirt', bag=P['khaki']),
    Look('dhanasree', skin='skin3', hair='ponytail', shirt=P['teal'], trousers=P['cream'], top='kurta', dupatta=P['cream'], shoes=P['wood1']),
    Look('dharshna', skin='skin0', hair='braid', hair_color='hair1', shirt=P['yellow'], trousers=P['ink2'], top='kurta', dupatta=P['orange'], shoes=P['wood1']),
    Look('krishnaa', skin='skin2', hair='short', shirt=P['terra'], trousers=P['ink2'], top='tshirt', beard=True),
    Look('kabi', skin='skin1', hair='messy', shirt=P['khaki'], trousers=P['ink2'], top='shirt'),
    Look('sneya', skin='skin3', hair='long', shirt=P['orange'], trousers=P['cream'], top='kurta', dupatta=P['pod'], bag=P['purple']),
    Look('sneka', skin='skin0', hair='ponytail', shirt=P['pink'], trousers=P['ink2'], top='kurta', dupatta=P['white']),
    Look('senior', skin='skin1', hair='messy', shirt=P['ink2'], trousers=P['blue1'], top='tshirt', beard=True, lanyard=True),
    Look('security', skin='skin2', hair='short', shirt=P['blue1'], trousers=P['ink2'], cap=P['blue1'], top='uniform', beard=True),
    Look('vendor', skin='skin2', hair='short', hair_color='hair2', shirt=P['white'], trousers=P['cream2'], top='shirt', beard=True, shoes=P['wood1']),
    Look('guy', skin='skin1', hair='short', shirt=P['slate'], trousers=P['ink2'], top='shirt', bag=P['blue1'], lanyard=True),
    Look('guy_b', skin='skin0', hair='curly', shirt=P['teal'], trousers=P['khaki'], top='tshirt', bag=P['red1']),
    Look('guy_c', skin='skin2', hair='short', shirt=P['mint'], trousers=P['blue1'], glasses=True, top='shirt', lanyard=True),
    Look('girl', skin='skin3', hair='long', shirt=P['purple'], trousers=P['cream'], top='kurta', dupatta=P['pink']),
    Look('girl_b', skin='skin1', hair='bun', shirt=P['sky'], trousers=P['ink2'], top='kurta', dupatta=P['blue1'], bag=P['earth1']),
    Look('veerabhadran', skin='skin1', hair='bald', shirt=P['cream'], trousers=P['slate'], glasses=True, top='shirt', shoes=P['ink']),
    Look('police', skin='skin2', hair='short', shirt=P['khaki'], trousers=P['khaki'], cap=P['khaki'], top='uniform', beard=True, shoes=P['ink']),
]
