"""Builds the single-file review page from `bun run build` output.

    cd game && bun run build && python3 tools/artifact/make_page.py

Writes dist/page/index.html: page_template.html with the game bundle inlined. The pixel game's art is
already inlined in the bundle as data URLs, so the page is self-contained: publish only index.html.
(The side-scroller's page builder, which also inlined fonts, is at git tag side-scroller-act1.)
"""
import glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
D = os.path.join(GAME, 'dist', 'assets') + '/'
OUT = os.path.join(GAME, 'dist', 'page')
js = open(glob.glob(D + 'index-*.js')[0]).read()
assert '</script' not in js
tpl = open(os.path.join(HERE, 'page_template.html')).read()
page = tpl.replace('/*GAME*/', js)
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w').write(page)
print(len(page) // 1024, 'KB page ->', os.path.join(OUT, 'index.html'))
