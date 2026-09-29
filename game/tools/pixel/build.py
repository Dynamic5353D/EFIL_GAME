"""Builds the pixel game's art into game/public/assets/pixel/ (committed) and preview sheets.

    python3 tools/pixel/build.py            # writes the atlases
    python3 tools/pixel/build.py --preview  # also writes 3x contact sheets to tools/pixel/preview/

Outputs:
  tiles.png + tiles.json       16x16 tiles in a 16-column grid; json maps name -> index
  props.png + props.json       free-size props, shelf-packed; json has frame rect, footprint, flags
  ui.png + ui.json             window skins, cursor, icons (frame rects)
  chars/<id>.png               16x24 sheets, 3 frames x 4 directions (down, up, left, right)
  portraits/<id>.png           40x40 portraits
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from characters import LOOKS, portrait, sheet  # noqa: E402
from font import build as build_font  # noqa: E402
from px import PAL, Canvas  # noqa: E402
from tiles import props, tiles  # noqa: E402
from ui import ui  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'assets' / 'pixel'
PREVIEW = Path(__file__).parent / 'preview'


def pack(items: dict[str, Canvas], width: int = 256) -> tuple[Canvas, dict[str, dict]]:
    """Shelf-packs sprites (tallest first) into one sheet with 1 px padding."""
    order = sorted(items, key=lambda k: (-items[k].h, k))
    x = y = shelf = 0
    rects: dict[str, dict] = {}
    for k in order:
        c = items[k]
        if x + c.w > width:
            x, y, shelf = 0, y + shelf + 1, 0
        rects[k] = {'x': x, 'y': y, 'w': c.w, 'h': c.h}
        x += c.w + 1
        shelf = max(shelf, c.h)
    sheet_c = Canvas(width, y + shelf)
    for k, r in rects.items():
        sheet_c.paste(items[k], r['x'], r['y'])
    return sheet_c, rects


def main() -> None:
    preview = '--preview' in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'chars').mkdir(exist_ok=True)
    (OUT / 'portraits').mkdir(exist_ok=True)

    t = tiles()
    names = list(t)
    cols = 16
    rows = (len(names) + cols - 1) // cols
    ts = Canvas(cols * 16, rows * 16)
    for i, n in enumerate(names):
        ts.paste(t[n], (i % cols) * 16, (i // cols) * 16)
    ts.img.save(OUT / 'tiles.png')
    (OUT / 'tiles.json').write_text(json.dumps({n: i for i, n in enumerate(names)}, indent=0))

    pr = props()
    ps, rects = pack({k: v.c for k, v in pr.items()})
    ps.img.save(OUT / 'props.png')
    meta = {k: {**rects[k], 'foot': list(v.foot), 'solid': v.solid, 'above': v.above} for k, v in pr.items()}
    (OUT / 'props.json').write_text(json.dumps(meta, indent=0))

    u = ui()
    us, urects = pack(u, 128)
    us.img.save(OUT / 'ui.png')
    (OUT / 'ui.json').write_text(json.dumps(urects, indent=0))

    fc, fxml = build_font()
    fc.img.save(OUT / 'font.png')
    (OUT / 'font.xml').write_text(fxml)

    for look in LOOKS:
        sheet(look).img.save(OUT / 'chars' / f'{look.id}.png')
        portrait(look).img.save(OUT / 'portraits' / f'{look.id}.png')
    (OUT / 'chars.json').write_text(json.dumps([l.id for l in LOOKS]))

    print(f'{len(names)} tiles, {len(pr)} props, {len(u)} ui pieces, {len(LOOKS)} characters -> {OUT}')

    if preview:
        PREVIEW.mkdir(exist_ok=True)
        for name, c in (('tiles', ts), ('props', ps), ('ui', us), ('font', fc)):
            bg = Canvas(c.w, c.h, PAL['grass0'] if name != 'ui' else PAL['slate'])
            bg.paste(c, 0, 0)
            bg.img.resize((c.w * 3, c.h * 3), 0).save(PREVIEW / f'{name}.png')


if __name__ == '__main__':
    main()
