"""Overworld character sprites (16x24, 4 directions x 3 frames) and dialogue portraits (40x40).

A character is layered from parts: a base body template per direction and frame, then hair, glasses and
cap overlays. Each part letter is coloured from the character's look, shaded with light from the top left,
and wrapped in a dark outline of its own hue.

Part letters: S skin, E eye, T shirt, P trousers, F shoes, H hair, G glasses, C cap, B cap brim, K tunic.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from px import PAL, Canvas, RGBA, mix, shade

W, H = 16, 24
DIRS = ('down', 'up', 'left', 'right')
FRAMES = ('stand', 'walk_a', 'walk_b')

# ---------------------------------------------------------------------------------------------- bodies
UPPER = {
    'down': [
        '................',
        '................',
        '......SSSS......',
        '....SSSSSSSS....',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '...SSESSSSESS...',
        '...SSESSSSESS...',
        '....SSSSSSSS....',
        '.....SSSSSS.....',
        '....TTTSSTTT....',
        '...TTTTTTTTTT...',
        '...TTTTTTTTTT...',
        '...TTTTTTTTTT...',
        '...STTTTTTTTS...',
        '...STTTTTTTTS...',
    ],
    'up': [
        '................',
        '................',
        '......SSSS......',
        '....SSSSSSSS....',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '...SSSSSSSSSS...',
        '....SSSSSSSS....',
        '.....SSSSSS.....',
        '....TTTTTTTT....',
        '...TTTTTTTTTT...',
        '...TTTTTTTTTT...',
        '...TTTTTTTTTT...',
        '...STTTTTTTTS...',
        '...STTTTTTTTS...',
    ],
    'left': [
        '................',
        '................',
        '......SSSS......',
        '.....SSSSSSS....',
        '....SSSSSSSSS...',
        '....SSSSSSSSS...',
        '....SSSSSSSSS...',
        '....SESSSSSSS...',
        '...SSSSSSSSSS...',
        '....SSSSSSSS....',
        '......SSSS......',
        '.....TTTTTT.....',
        '.....TTTTTTT....',
        '.....TTTTTTT....',
        '.....TTTTTTT....',
        '.....TTSTTTT....',
        '.....TTSTTTT....',
    ],
}

LOWER = {
    'down': {
        'stand': ['....PPPPPPPP....', '....PPPPPPPP....', '....PPP..PPP....', '....PPP..PPP....', '....PPP..PPP....', '....FFF..FFF....', '................'],
        'walk_a': ['....PPPPPPPP....', '....PPPPPPPP....', '....PPP..PPP....', '....PPP..PPP....', '....FFF..PPP....', '.........FFF....', '................'],
        'walk_b': ['....PPPPPPPP....', '....PPPPPPPP....', '....PPP..PPP....', '....PPP..PPP....', '....PPP..FFF....', '....FFF.........', '................'],
    },
    'left': {
        'stand': ['.....PPPPPP.....', '.....PPPPPP.....', '......PPPP......', '......PPPP......', '......PPPP......', '.....FFFFF......', '................'],
        'walk_a': ['.....PPPPPP.....', '.....PP..PP.....', '....PP....PP....', '....PP....PP....', '...FFF....FFF...', '................', '................'],
        'walk_b': ['.....PPPPPP.....', '......PPPP......', '.....PP.PP......', '.....PP..PP.....', '....FFF..FFF....', '................', '................'],
    },
}
LOWER['up'] = LOWER['down']

# The hand swings with the step in side views.
SIDE_HAND = {'stand': 7, 'walk_a': 6, 'walk_b': 9}

# ---------------------------------------------------------------------------------------------- hair
def _pad(rows: list[str]) -> list[str]:
    return rows + ['.' * W] * (H - len(rows))


HAIR: dict[str, dict[str, list[str]]] = {
    'short': {
        'down': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...'],
        'up': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
        'left': ['................', '......HHHH......', '.....HHHHHHH....', '....HHHHHHHHH...', '....HHHHHHHHH...', '....HH..HHHHH...', '........HHHHH...', '.........HHHH...', '..........HHH...'],
    },
    'spiky': {
        'down': ['................', '....H.HH.HH.H...', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '...HHH.HH.HHH...', '...H........H...'],
        'up': ['................', '....H.HH.HH.H...', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
        'left': ['................', '.....H.HH.H.....', '....HHHHHHHHH...', '...HHHHHHHHHHH..', '....HHHHHHHHHH..', '....H.HHHHHHH...', '........HHHHH...', '.........HHHH...', '..........HHH...'],
    },
    'messy': {
        'down': ['................', '.....HHHHH.H....', '...HHHHHHHHHH...', '..HHHHHHHHHHH...', '...HHHHHHHHHHH..', '...HH.H..H.HH...', '...H........H...'],
        'up': ['................', '.....HHHHH.H....', '...HHHHHHHHHH...', '..HHHHHHHHHHH...', '...HHHHHHHHHHH..', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
        'left': ['................', '......HHHH.H....', '....HHHHHHHH....', '...HHHHHHHHHH...', '....HHHHHHHHHH..', '....H.H.HHHHH...', '........HHHHH...', '.........HHHH...', '..........HHH...'],
    },
    'long': {
        'down': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHH......HHH..', '..HH........HH..', '..HH........HH..', '..HH........HH..', '..HH........HH..', '..HHH......HHH..', '..HHH......HHH..', '..HH........HH..', '..HH........HH..'],
        'up': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....', '.....HHHHHH.....'],
        'left': ['................', '......HHHH......', '.....HHHHHHH....', '....HHHHHHHHH...', '....HHHHHHHHHH..', '....HH..HHHHHH..', '........HHHHHH..', '.........HHHHH..', '.........HHHHH..', '.........HHHHH..', '.........HHHHH..', '..........HHHH..', '..........HHHH..', '...........HH...'],
    },
    'ponytail': {
        'down': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...', '............HH..', '............HH..', '.............H..'],
        'up': ['................', '......HHHH......', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....', '......HHHH......', '......HHHH......', '.......HH.......', '.......HH.......', '.......H........'],
        'left': ['................', '......HHHH......', '.....HHHHHHH....', '....HHHHHHHHH...', '....HHHHHHHHHH..', '....HH..HHHHHHH.', '........HHHHHHH.', '.........HHHH.HH', '..........HHH.HH', '..............HH', '..............H.'],
    },
    'bun': {
        'down': ['......HHHH......', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...'],
        'up': ['......HHHH......', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
        'left': ['.........HHH....', '......HHHHHHH...', '.....HHHHHHHH...', '....HHHHHHHHH...', '....HHHHHHHHH...', '....HH..HHHHH...', '........HHHHH...', '.........HHHH...', '..........HHH...'],
    },
    'bald': {
        'down': ['................', '................', '................', '................', '................', '................', '...H........H...', '...H........H...'],
        'up': ['................', '................', '................', '................', '................', '................', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
        'left': ['................', '................', '................', '................', '................', '................', '..........HHH...', '.........HHHH...', '..........HHH...'],
    },
}

CAP = {
    'down': ['................', '.....CCCCCC.....', '....CCCCCCCC....', '...CCCCCCCCCC...', '...CCCCCCCCCC...', '..BBBBBBBBBBBB..'],
    'up': ['................', '.....CCCCCC.....', '....CCCCCCCC....', '...CCCCCCCCCC...', '...CCCCCCCCCC...', '...CCCCCCCCCC...'],
    'left': ['................', '......CCCCC.....', '.....CCCCCCCC...', '....CCCCCCCCC...', '....CCCCCCCCC...', '.BBBBBBCCCCCC...'],
}

GLASSES = {
    'down': {6: '....GGG..GGG....', 7: '....GEG..GEG....'},
    'left': {6: '....GGG.........', 7: '....EGGGG.......'},
}


@dataclass
class Look:
    id: str
    skin: str = 'skin0'
    hair: str = 'short'
    hair_color: str = 'hair0'
    shirt: RGBA = PAL['blue0']
    trousers: RGBA = PAL['ink2']
    shoes: RGBA = PAL['wood2']
    glasses: bool = False
    cap: RGBA | None = None
    lower: str = 'pants'  # pants | kurta | skirt
    #: Portrait expression hints.
    beard: bool = False
    extra: dict = field(default_factory=dict)


def _grid(look: Look, d: str, frame: str) -> list[list[str]]:
    base_dir = 'left' if d in ('left', 'right') else d
    rows = [list(r) for r in UPPER[base_dir]] + [list(r) for r in LOWER[base_dir][frame]]
    if base_dir == 'left':
        # Move the hand to swing with the step.
        for y in (15, 16):
            for x in range(W):
                if rows[y][x] == 'S':
                    rows[y][x] = 'T'
            rows[y][SIDE_HAND[frame]] = 'S'
    if look.lower in ('kurta', 'skirt'):
        for y in range(17, 20):
            for x in range(W):
                if rows[y][x] == 'P':
                    rows[y][x] = 'K'
        # The tunic flares a little.
        for y in (18, 19):
            xs = [x for x in range(W) if rows[y][x] == 'K']
            if xs and base_dir != 'left':
                rows[y][xs[0] - 1] = 'K'
                rows[y][xs[-1] + 1] = 'K'
        if look.lower == 'skirt':
            for y in range(20, 22):
                for x in range(W):
                    if rows[y][x] == 'P':
                        rows[y][x] = 'S'
    hair = HAIR[look.hair][base_dir]
    for y, row in enumerate(_pad(hair)):
        for x, ch in enumerate(row):
            if ch == 'H':
                rows[y][x] = 'H'
    if look.cap is not None:
        for y, row in enumerate(CAP[base_dir]):
            for x, ch in enumerate(row):
                if ch != '.':
                    rows[y][x] = ch
    if look.glasses and base_dir in GLASSES:
        for y, row in GLASSES[base_dir].items():
            for x, ch in enumerate(row):
                if ch == 'G':
                    rows[y][x] = 'G'
                elif ch == 'E':
                    rows[y][x] = 'E'
    if d == 'right':
        rows = [list(reversed(r)) for r in rows]
    return rows


def _colors(look: Look) -> dict[str, RGBA]:
    return {
        'S': PAL[look.skin], 'E': PAL['ink'], 'T': look.shirt, 'P': look.trousers, 'F': look.shoes,
        'H': PAL[look.hair_color], 'G': PAL['stone'], 'C': look.cap or PAL['ink'], 'B': shade(look.cap or PAL['ink'], -0.3),
        'K': look.shirt if look.lower == 'kurta' else look.extra.get('skirt', shade(look.shirt, -0.15)),
    }


def render_frame(look: Look, d: str, frame: str) -> Canvas:
    rows = _grid(look, d, frame)
    col = _colors(look)
    c = Canvas(W, H)
    light_from_left = d != 'right'
    for y in range(H):
        for x in range(W):
            p = rows[y][x]
            if p == '.':
                continue
            base = col[p]
            if p in ('E', 'G'):
                c.set(x, y, base)
                continue
            same = lambda xx, yy: 0 <= xx < W and 0 <= yy < H and rows[yy][xx] == p
            k = 0.0
            back = x + 1 if light_from_left else x - 1
            front = x - 1 if light_from_left else x + 1
            if not same(back, y):
                k -= 0.22
            if not same(x, y + 1) and p in ('H', 'T', 'K', 'C'):
                k -= 0.16
            if p in ('H', 'T', 'C', 'K') and (not same(front, y) or not same(x, y - 1)) and k == 0:
                k += 0.16
            # Hair gets a sheen band.
            if p == 'H' and y in (2, 3) and k >= 0 and (x % 3 == 1):
                k += 0.18
            c.set(x, y, shade(base, k) if k else base)
    c.outline(lambda n: mix(n, PAL['ink'], 0.75))
    return c


def sheet(look: Look) -> Canvas:
    """3 frames across (stand, walk_a, walk_b), 4 rows (down, up, left, right)."""
    s = Canvas(W * len(FRAMES), H * len(DIRS))
    for r, d in enumerate(DIRS):
        for f, frame in enumerate(FRAMES):
            s.paste(render_frame(look, d, frame), f * W, r * H)
    return s


# ---------------------------------------------------------------------------------------------- portraits
PW = 40


def portrait(look: Look) -> Canvas:
    """A 40x40 head-and-shoulders portrait, three-quarter view, in the same parts and palette."""
    c = Canvas(PW, PW)
    skin = PAL[look.skin]
    hair = PAL[look.hair_color]
    # shoulders and shirt
    c.ellipse(20, 44, 17, 12, look.shirt)
    for y in range(32, 40):
        for x in range(0, PW):
            p = c.get(x, y)
            if p[3] and x > 26:
                c.set(x, y, shade(look.shirt, -0.2))
    # collar
    for i in range(4):
        c.set(18 - i, 32 + i, shade(look.shirt, 0.25))
        c.set(22 + i, 32 + i, shade(look.shirt, 0.25))
    # neck
    c.rect(16, 26, 8, 7, shade(skin, -0.18))
    c.rect(18, 32, 4, 2, shade(skin, -0.18))
    # back hair (long styles) behind the head
    if look.hair in ('long',):
        c.ellipse(20, 22, 13, 15, shade(hair, -0.1))
    if look.hair == 'ponytail':
        c.ellipse(31, 20, 4, 8, shade(hair, -0.1))
    if look.hair == 'bun':
        c.ellipse(28, 6, 6, 5, hair)
    # head
    c.ellipse(20, 17, 10, 12, skin)
    for y in range(4, 30):
        for x in range(24, 32):
            p = c.get(x, y)
            if p == skin and (x - 20) ** 2 / 100 + (y - 17) ** 2 / 144 > 0.55:
                c.set(x, y, shade(skin, -0.16))
    # ear
    c.ellipse(29, 18, 2, 3, shade(skin, -0.1))
    # hair on top
    style = look.hair
    if style != 'bald':
        c.ellipse(20, 11, 11, 7.5, hair)
        if style == 'spiky':
            for sx, sy in ((10, 5), (14, 2), (19, 1), (24, 2), (29, 5), (31, 9)):
                c.ellipse(sx, sy + 2, 2.2, 3, hair)
            c.ellipse(13, 13, 3, 3, hair)
        elif style in ('messy',):
            for sx, sy in ((11, 7), (17, 4), (25, 5), (30, 9)):
                c.ellipse(sx, sy, 3, 2.5, hair)
        elif style in ('long', 'ponytail', 'bun'):
            # a centre parting, hair framing the face
            c.set(20, 6, shade(hair, 0.25))
            c.rect(9, 12, 3, 12, hair)
            if style == 'long':
                c.rect(29, 12, 3, 14, hair)
        # fringe line
        for x in range(11, 29):
            if c.get(x, 14)[3] and (x % 4 != 0):
                c.set(x, 14, hair)
        # sheen
        for x, y in ((13, 9), (14, 8), (15, 7), (16, 7), (17, 7)):
            c.set(x, y, shade(hair, 0.22))
    else:
        c.rect(9, 15, 3, 5, PAL['hair2'])
        c.rect(28, 15, 3, 5, PAL['hair2'])
    if look.cap is not None:
        c.ellipse(20, 9, 12, 6, look.cap)
        c.rect(7, 12, 26, 2, shade(look.cap, -0.3))
        c.rect(17, 5, 6, 3, PAL['yellow'])
    # face: brows, eyes, nose, mouth
    brow = shade(PAL[look.hair_color], -0.1) if look.hair != 'bald' else PAL['hair2']
    c.hline(13, 15, 4, brow)
    c.hline(22, 15, 4, brow)
    for ex in (14, 23):
        c.hline(ex, 17, 3, shade(skin, -0.45))
        c.rect(ex, 18, 3, 2, PAL['white'])
        c.rect(ex + 1, 18, 2, 2, PAL['ink2'])
        c.set(ex + 1, 18, PAL['mist'])
    c.set(20, 22, shade(skin, -0.28))
    c.set(20, 23, shade(skin, -0.28))
    c.set(21, 23, shade(skin, -0.2))
    c.hline(18, 26, 5, shade(skin, -0.4))
    if look.beard:
        for y in range(24, 30):
            for x in range(11, 30):
                p = c.get(x, y)
                if p[3] and p != PAL['white'] and (x + y) % 2 == 0 and abs(p[0] - skin[0]) < 60:
                    c.set(x, y, shade(hair, 0.1))
    if look.glasses:
        g = PAL['ink2']
        for ex in (13, 22):
            c.hline(ex, 16, 5, g)
            c.hline(ex, 20, 5, g)
            c.vline(ex, 16, 5, g)
            c.vline(ex + 4, 16, 5, g)
        c.hline(18, 17, 4, g)
        c.hline(27, 17, 3, g)
    c.outline(lambda n: mix(n, PAL['ink'], 0.8))
    return c


# ---------------------------------------------------------------------------------------------- the cast (N1)
P = PAL
LOOKS: list[Look] = [
    Look('ragul', skin='skin0', hair='spiky', shirt=P['blue0'], trousers=P['ink2'], glasses=True),
    Look('nithish', skin='skin1', hair='short', shirt=P['red0'], trousers=P['slate']),
    Look('dhanasree', skin='skin3', hair='ponytail', shirt=P['teal'], trousers=P['cream'], lower='kurta'),
    Look('dharshna', skin='skin0', hair='long', hair_color='hair1', shirt=P['yellow'], trousers=P['ink2'], lower='kurta'),
    Look('krishnaa', skin='skin2', hair='short', shirt=P['terra'], trousers=P['ink2'], beard=True),
    Look('kabi', skin='skin1', hair='messy', shirt=P['khaki'], trousers=P['ink2']),
    Look('sneya', skin='skin3', hair='long', shirt=P['orange'], trousers=P['cream'], lower='kurta'),
    Look('sneka', skin='skin0', hair='ponytail', shirt=P['pink'], trousers=P['ink2'], lower='kurta'),
    Look('senior', skin='skin1', hair='messy', shirt=P['ink2'], trousers=P['blue1'], beard=True),
    Look('security', skin='skin2', hair='short', shirt=P['blue1'], trousers=P['ink2'], cap=P['blue1']),
    Look('vendor', skin='skin2', hair='short', hair_color='hair2', shirt=P['white'], trousers=P['cream2'], beard=True),
    Look('guy', skin='skin1', hair='short', shirt=P['slate'], trousers=P['ink2']),
    Look('guy_b', skin='skin0', hair='messy', shirt=P['teal'], trousers=P['khaki']),
    Look('guy_c', skin='skin2', hair='short', shirt=P['mint'], trousers=P['blue1'], glasses=True),
    Look('girl', skin='skin3', hair='long', shirt=P['purple'], trousers=P['cream'], lower='kurta'),
    Look('girl_b', skin='skin1', hair='bun', shirt=P['sky'], trousers=P['ink2'], lower='kurta'),
    Look('veerabhadran', skin='skin1', hair='bald', shirt=P['cream'], trousers=P['slate'], glasses=True),
    Look('police', skin='skin2', hair='short', shirt=P['khaki'], trousers=P['khaki'], cap=P['khaki']),
]
