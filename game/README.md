# EFIL: The Game

A 2D side-scrolling story RPG (16+) adapted from the EFIL novel and art. Phaser 4 + TypeScript + Vite, run with bun.

## Run it

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
bun run dev          # http://localhost:5173
bun test             # unit tests
bun run typecheck
bun run lint:story   # story script linter
bun run build        # production build in dist/
```

## Dev shortcuts

With the dev server running, `http://localhost:5173/?room=winter_path&flags=slice_intro_done&party=dhanasree`
starts a fresh game (slot 3) in that room with those flags, party members and items (`&items=acanus_feather`).
Add `&fast` to run battles at 6× speed. The game object is `window.game` and the save state is `window.__efil_state()`.

## Asset pipeline

The source art in `../images/` and the novel in `../Story/` are read-only.

```bash
bun run assets                                      # incremental; add -- --force to rebuild all
tools/.venv/bin/python tools/build_assets.py --only vale,kin
python3 tools/extract_story.py                      # Ventures -> tools/story_raw/ (gitignored)
```

`build_assets.py` writes backdrops, far layers, cut-outs, icons, portraits, `palettes.json` and
`asset-manifest.json` into `public/assets/`. The manifest records which images carry third-party
watermarks or credits: **those must be replaced or licensed before any public release**.

`tools/.venv` is a symlink to `~/.local/share/efil-game/venv` (Python refuses to create a venv in a path
containing `:`). To recreate it:

```bash
python3 -m venv ~/.local/share/efil-game/venv
ln -sfn ~/.local/share/efil-game/venv tools/.venv
tools/.venv/bin/pip install "rembg[cpu]" pillow numpy
```

## Art overrides

Drop a file into `public/assets/override/` using the same relative path as the asset it replaces
(for example `portraits/ragul.webp` or `cutouts/vale.webp`). It is picked up with no code change.
The four protagonists have no art yet, so their portraits and sprites are generated; overrides replace them.

## Docs

- `docs/plan.md`: the approved plan. `docs/story-bible.md`: per-Venture reference. `docs/decisions.md`: changes to the plan.
