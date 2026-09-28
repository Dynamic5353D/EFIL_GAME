# Decisions log

One line per decision that changes or refines `plan.md`.

- 2026-09-28 · **Phaser 4.2.1 instead of Phaser 3.** v4 is the stable release. It keeps Arcade physics and lighting (`setLighting(true)` + `lights.addLight`, with self-shadow and PointLight glows). `Mesh`/`Plane` were removed, but `Mesh2D` (added in 4.2.0) is a textured triangle mesh with editable vertices, which is what the puppet warp needs. FX are now Filters (camera colour grade, vignette, glow, blur).
- 2026-09-28 · **Toolchain versions:** vite 8.3.1, typescript 7.0.2 (native compiler), bun 1.3.14.
- 2026-09-28 · **The `:` in "EFIL: The Game" breaks three tools:** Python refuses to create a venv there, `node_modules/.bin` can't go on PATH, and Vite's fs allow-list mis-parses it. So the rembg venv lives at `~/.local/share/efil-game/venv` with `game/tools/.venv` as a symlink to it; package scripts call `node_modules/<pkg>/bin/...` directly; and Vite's `server.fs.strict` is off (local dev only).
- 2026-09-28 · **Cut-out methods per image:** rembg `isnet-general-use` by default; `u2net` for Kanagaraj and the Large Liquid Shadow (cleaner); luminance keys for the Vale (dark silhouette on fog) and the Frozen Phoenix (glow on blue, drawn with additive blend). The Vale's eyes are added in code in burning blue, as the text describes (the art has orange eyes).
- 2026-09-28 · **Codex art:** every non-environment image also gets `assets/art/<slug>.webp` (≤1280 px) for the Memory Fragment viewer; environments use `assets/bg/`.
- 2026-09-28 · **Fonts:** Cormorant Garamond (titles, Venture cards) and Alegreya Sans (UI, dialogue), bundled from `@fontsource` (OFL) so the game works offline.
- 2026-09-28 · **Saving happens at Red Rosoar trees only** (plus three slots on the title screen). There is no save-anywhere. Losing a battle reloads the last rest; with no save yet, the party is healed and the room restarts.
- 2026-09-28 · **Mesh2D has no tint in Phaser 4**, so the puppets' hit flash is a ColorMatrix filter that is created on the first hit and toggled after that.
- 2026-09-28 · **Painted room layers (scenery, terrain) are cached as textures for the session**, because textures outlive scene restarts. Revisiting a room is instant.
- 2026-09-28 · **Frost trees are recursive branches with stamped frost puffs**, drawn from one pre-rendered sprite, so they match the Pluffine Forest and Winter Path art (the first version read as grey balloons).
- 2026-09-28 · **Dev-only URL jump** (`?room=…&flags=…&party=…&items=…&fast`) goes straight to a room with the given state. It is the first step toward the plan's chapter-select debug jump.
- 2026-09-28 · **Jump tuning after the first playtest:** jump 900 and double jump 780 px/s. A held jump clears 4 tiles; 5 or more needs the Acanus leap. `tests/reach.test.ts` checks every room with the same numbers (reachable destinations, real gates marked `needs`, no dead ends), so every new room must pass it.
- 2026-09-28 · **First-time tips and battle tutorials** (`data/tips.ts`, EN + Tanglish) show once per save and stay readable in the pause menu's Guide. They can be turned off in Settings.
- 2026-09-28 · **Battle readability:** the room's colour grade applies to the battle backdrop only, never to fighters or UI. Every fighter has a nameplate, and a goal card states the win condition and how Vales die.
