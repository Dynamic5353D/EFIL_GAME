"""UI pieces: 9-slice window skins, cursor, the 'more' arrow and 16x16 menu icons.

The window look is our own: warm paper inside an ink-blue frame with a thin gold line, and a small
kolam-style dot motif at each corner.
"""
from __future__ import annotations

from px import PAL, Canvas, RGBA, shade

P = PAL
SLICE = 8  # corner size of the 9-slice windows (the skin is 24x24)


def window(fill: RGBA, frame: RGBA, line: RGBA, dot: RGBA) -> Canvas:
    c = Canvas(24, 24)
    # rounded outer frame
    c.rect(1, 0, 22, 24, frame)
    c.rect(0, 1, 24, 22, frame)
    # inner fill
    c.rect(3, 2, 18, 20, fill)
    c.rect(2, 3, 20, 18, fill)
    # the thin gold line
    for i in range(3, 21):
        c.set(i, 3, line)
        c.set(i, 20, line)
        c.set(3, i, line)
        c.set(20, i, line)
    for x, y in ((3, 3), (20, 3), (3, 20), (20, 20)):
        c.set(x, y, fill)
    # kolam dots in the corners
    for x, y in ((1, 1), (22, 1), (1, 22), (22, 22)):
        c.set(x, y, dot)
    # a faint top highlight and bottom shade on the frame
    c.hline(2, 0, 20, shade(frame, 0.25))
    c.hline(2, 23, 20, shade(frame, -0.35))
    return c


def cursor() -> Canvas:
    c = Canvas(8, 8)
    for i in range(4):
        c.vline(1 + i, 1 + i, 7 - 2 * i, P['ink'])
        c.vline(1 + i, 1 + i, 7 - 2 * i, P['ink'])
    for i in range(3):
        c.vline(1 + i, 2 + i, 5 - 2 * i, P['red0'])
    return c


def more_arrow() -> Canvas:
    c = Canvas(8, 6)
    for i in range(4):
        c.hline(i, i, 8 - 2 * i, P['ink'])
    for i in range(3):
        c.hline(1 + i, i, 6 - 2 * i, P['red0'])
    return c


def icon(kind: str) -> Canvas:
    c = Canvas(16, 16)
    if kind == 'party':
        c.ellipse(6, 5, 3, 3, P['skin0']); c.rect(3, 9, 7, 5, P['blue0'])
        c.ellipse(11, 6, 3, 3, P['skin1']); c.rect(8, 10, 7, 5, P['teal'])
        c.hline(3, 3, 6, P['hair0']); c.hline(9, 4, 5, P['hair0'])
    elif kind == 'bag':
        c.rect(3, 5, 10, 9, P['earth0']); c.rect(3, 5, 10, 3, P['earth1'])
        c.rect(6, 2, 4, 3, P['earth1']); c.rect(7, 3, 2, 2, (0, 0, 0, 0))
        c.rect(7, 8, 2, 2, P['pod'])
    elif kind == 'journal':
        c.rect(3, 2, 10, 12, P['red1']); c.rect(4, 3, 8, 10, P['paper'])
        for y in (5, 7, 9, 11):
            c.hline(5, y, 6, P['stone'])
        c.vline(3, 2, 12, P['red0'])
    elif kind == 'case':
        c.rect(2, 3, 12, 10, P['wood1']); c.rect(3, 4, 10, 8, P['khaki'])
        c.rect(4, 5, 3, 3, P['white']); c.rect(9, 7, 3, 3, P['paper'])
        c.hline(6, 6, 4, P['red0']); c.set(10, 7, P['red0'])
    elif kind == 'map':
        c.rect(2, 3, 12, 10, P['cream']); c.rect(2, 3, 4, 10, P['cream2']); c.rect(10, 3, 4, 10, P['cream2'])
        c.hline(3, 8, 10, P['earth0']); c.set(9, 6, P['red0']); c.set(9, 7, P['red0'])
    elif kind == 'save':
        c.rect(3, 2, 10, 12, P['blue1']); c.rect(5, 2, 6, 4, P['mist']); c.rect(5, 9, 6, 5, P['paper'])
    elif kind == 'settings':
        c.ellipse(8, 8, 5, 5, P['stone']); c.ellipse(8, 8, 2, 2, P['paper'])
        for x, y in ((8, 2), (8, 13), (2, 8), (13, 8)):
            c.rect(x - 1, y - 1, 2, 2, P['stone'])
    elif kind == 'quest':
        c.rect(6, 2, 4, 8, P['pod']); c.rect(6, 12, 4, 2, P['pod'])
    elif kind == 'talk':
        c.rect(2, 3, 12, 8, P['white']); c.set(5, 11, P['white']); c.set(4, 12, P['white'])
        for x in (5, 8, 11):
            c.set(x, 7, P['ink'])
    c.outline()
    return c


def ui() -> dict[str, Canvas]:
    out = {
        'win_paper': window(P['paper'], P['blue1'], P['pod'], P['pod_hi']),
        'win_ink': window(P['ink2'], P['ink'], P['pod2'], P['pod']),
        'win_name': window(P['blue1'], P['ink'], P['blue0'], P['pod']),
        'cursor': cursor(),
        'more': more_arrow(),
    }
    for k in ('party', 'bag', 'journal', 'case', 'map', 'save', 'settings', 'quest', 'talk'):
        out[f'icon_{k}'] = icon(k)
    return out
