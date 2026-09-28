# Decisions log

One line per decision that changes or refines `plan.md`.

- 2026-09-28 · **Phaser 4.2.1 instead of Phaser 3.** v4 is the stable release. It keeps Arcade physics and lighting (`setLighting(true)` + `lights.addLight`, with self-shadow and PointLight glows). `Mesh`/`Plane` were removed, but `Mesh2D` (added in 4.2.0) is a textured triangle mesh with editable vertices, which is what the puppet warp needs. FX are now Filters (camera colour grade, vignette, glow, blur).
- 2026-09-28 · **Toolchain versions:** vite 8.3.1, typescript 7.0.2 (native compiler), bun 1.3.14.
- 2026-09-28 · **The `:` in "EFIL: The Game" breaks three tools:** Python refuses to create a venv there, `node_modules/.bin` can't go on PATH, and Vite's fs allow-list mis-parses it. So the rembg venv lives at `~/.local/share/efil-game/venv` with `game/tools/.venv` as a symlink to it; package scripts call `node_modules/<pkg>/bin/...` directly; and Vite's `server.fs.strict` is off (local dev only).
- 2026-09-28 · **Cut-out methods per image:** rembg `isnet-general-use` by default; `u2net` for Kanagaraj and the Large Liquid Shadow (cleaner); luminance keys for the Vale (dark silhouette on fog) and the Frozen Phoenix (glow on blue, drawn with additive blend). The Vale's eyes are added in code in burning blue, as the text describes (the art has orange eyes).
- 2026-09-28 · **Codex art:** every non-environment image also gets `assets/art/<slug>.webp` (≤1280 px) for the Memory Fragment viewer; environments use `assets/bg/`.
- 2026-09-28 · **Fonts:** Cormorant Garamond (titles, Venture cards) and Alegreya Sans (UI, dialogue), bundled from `@fontsource` (OFL) so the game works offline.
