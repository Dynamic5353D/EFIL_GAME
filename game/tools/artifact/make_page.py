"""Builds the single-file review page from `bun run build` output.

    cd game && bun run build && python3 tools/artifact/make_page.py

Writes dist/page/index.html: page_template.html with the game bundle and the fonts inlined. The art
(public/assets/...) is not inlined: the published Artifact already holds it as supporting files at
assets/..., which persist across republishes, so only index.html needs publishing again.
"""
import base64, glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
D = os.path.join(GAME, 'dist', 'assets') + '/'
OUT = os.path.join(GAME, 'dist', 'page')
faces = [('Alegreya Sans', 'normal', 400, 'alegreya-sans-latin-400-normal'), ('Alegreya Sans', 'italic', 400, 'alegreya-sans-latin-400-italic'),
         ('Alegreya Sans', 'normal', 700, 'alegreya-sans-latin-700-normal'), ('Cormorant Garamond', 'normal', 500, 'cormorant-garamond-latin-500-normal'),
         ('Cormorant Garamond', 'italic', 500, 'cormorant-garamond-latin-500-italic'), ('Cormorant Garamond', 'normal', 600, 'cormorant-garamond-latin-600-normal')]
css = ''
for fam, style, w, stem in faces:
    f = glob.glob(D + stem + '-*.woff2')[0]
    b = base64.b64encode(open(f, 'rb').read()).decode()
    css += f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{w};font-display:block;src:url(data:font/woff2;base64,{b}) format('woff2')}}\n"
js = open(glob.glob(D + 'index-*.js')[0]).read()
assert '</script' not in js
tpl = open(os.path.join(HERE, 'page_template.html')).read()
page = tpl.replace('/*FONTS*/', css).replace('/*GAME*/', js)
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w').write(page)
print(len(page) // 1024, 'KB page ->', os.path.join(OUT, 'index.html'))
