# EFIL: pivot to a pixel-art, NDS-era top-down RPG

## Context
The user play-tested Act I of the side-scroller (the Hollow Knight-style build, published as v7). They liked it but want to pause it and change direction:
- **Look:** pixel art in the spirit of the Gen 3–5 handheld RPGs (Emerald, Diamond, Black/White).
- **Play:** top-down exploration with **one playable character, Ragul**. The world is full of NPCs. The game is *inspired by* the novel: it doesn't retell it line by line like a visual novel, and the player isn't forced through it in order.
- **UI:** very good, polished pixel UI.
- **Language:** two separate defaults the player chooses: **dialogue** language (English / Tanglish) and **description** language (narration, captions, item text, UI descriptions).

Their answers:
- Hero: Ragul.
- Screen: single screen, 16:9.
- Art: code-drawn pixel art, plus the user's paintings converted to pixel sprites.
- First slice: MIT campus + Chromepet.

The goal is original work in that era's *style*: no Pokémon names, creatures, UI layouts, sounds or fonts, and no creature collecting.

## Direction
- **Native resolution 480×270** (16:9), integer-scaled with `pixelArt: true` and `roundPixels`. Tiles are 16×16.
  Characters are 16×24 sprites with 4 directions and 3 walk frames, plus run.
- **Grid movement** as in that era: tap to turn, hold to walk, B to run, with smooth tile-to-tile tweening.
  Doors and stairs warp between maps. Interiors are separate small maps with a fade.
- **Semi-open world** (user, 29 Sep): connected maps you walk between freely (campus, Chromepet streets, the station, later Glacia). Routes open in story waves, the way roads open in the handheld RPGs, shown in the world itself (a barricade, a guard, a locked gate).
- **Nonlinear, story-inspired structure.** One open hub (MIT campus + Chromepet). **Main quests** come from Purpose 1's key beats (the fest, the first death, the investigation, Dhanasree, the police). They unlock in waves by flags, and the player picks the order within each wave. Around 10 **side quests** use campus and town life. A Journal tracks all quests.
- **Battles:** keep the turn-based system (`BattleCore`) and **word battles**, restyled in pixel UI. Enemies and challengers are shown with front sprites made from the user's art; Ragul's party appears with back sprites, like the handhelds, but with an original layout.
- **Keep the side-scroller.** Tag the current state `side-scroller-act1`, publish the pixel game as a **new** artifact, and leave the v7 page as it is.

## Reuse (engine-independent, keep as is or with small changes)
- `src/core/`: `GameState`, `SaveSystem` (bump the save version), `Settings`, `Input`, `AudioSynth` (add chiptune instruments: square, triangle, noise), `Localization` (profanity filter), `EventBus`, `rng`, `Tips`.
- `src/story/`: `parser.ts`, `Director.ts`, `lint.ts`.
  - The Director talks to the world only through the `StoryStage` interface (`Director.ts:58`). The new overworld implements it.
  - Room commands like `@shot` map to simple camera pans. `@scene`/`@cast` in the overworld use the NPCs on the map.
- `src/battle/`: `BattleCore.ts`, `skills.ts`, `WordCore.ts`, plus `data/enemies.ts`, `wordbattles.ts`, `items.ts`, `clues.ts`, `codex.ts`, `characters.ts`, `speakers.ts`, `flags.ts`.
- Tests: `battle`, `words`, `save`, `story`, `lint`, `localization` and `tips` stay. `rooms` and `reach` get replaced by map tests.
- Asset pipeline `tools/build_assets.py` (cut-outs, palettes). Its outputs feed the pixelizer.
- Play-test tools `tools/playtest/*` (the driver, sheets). `auto.mjs` is rewritten for grid maps.

Side-scroller-only code gets retired on the new branch (it stays in git history under the tag): `WorldScene`, `StageScene`, `Player`, `TerrainPainter`, `Earth*`, `Scenery`, `Puppet`, `CharacterRig`, `rooms_p01.ts`.

## New systems
1. **Language settings** (asked for mid-planning).
   - `Settings`: replace `language` with `dialogueLang` and `descLang`, each `'en' | 'ta'`.
   - `tr(text, kind)`: `kind` is `'dialogue' | 'desc'`. Spoken lines use `dialogueLang`. Narrator lines, captions, item, codex and quest text use `descLang`.
   - First launch shows a two-question language screen. The in-dialogue `L` toggle still flips the dialogue language.
   - Migrate old saves and settings.
   - Note: "Tamil" here is the novel's Tanglish (Latin script). Tamil script would need a Tamil pixel font and translated text, so it's a later option.
2. **Tile engine** (`src/overworld/`):
   - Maps are authored as **ASCII layers in TS**: ground, objects, collision derived from the tile legend, plus entity lists (NPCs, doors, signs, items, triggers). Rendered into a Phaser Tilemap from a generated atlas.
   - Includes autotiling (paths, grass edges, water), a y-sorted object layer and animated tiles (water, flowers, the copper-pod petals).
   - `OverworldScene` implements `StoryStage`. Also: `Warp`/door fades and a camera clamped to the map.
3. **NPCs:**
   - Behaviours: stand, face, wander in an area, patrol a path, and schedules by time of day.
   - Talk on A, facing the player. **Line-of-sight challengers** walk up and start a word battle or a fight.
   - Crowds for the fest.
   - NPC defs are data (`data/npcs_campus.ts`). Each NPC has a short `talk` in both languages, or a `script` label.
4. **Quests** (`src/quest/`):
   - Each quest def has an id, main or side, a wave, a `requires` flag, steps (each step has a flag to set and a hint), and rewards: items, XP, clues, Memory Fragments.
   - Quests are started and finished from story scripts (`@quest start/step/done`).
   - The Journal UI lists quests, and the map shows markers for them.
5. **Pixel UI kit** (`src/ui/pixel/`):
   - 9-slice windows in two themes (campus daylight, Glacia later), a typewriter text box with a pixel portrait and name tab, choice list, cursor, number and HP bars, and a toast.
   - Start menu: Party · Bag · Journal · Case Board · Map · Save · Settings.
   - Battle UI panels.
   - Pixel font: our own bitmap font, EFIL Pixel (`tools/pixel/font.py`), so text stays sharp at 480×270 (see decisions.md).
6. **Pixel art generation** (`tools/pixel/`, Python + PIL, outputs committed to `public/assets/pixel/`):
   - One master **palette** of about 48 colours, derived from the existing `palettes.json` so the user's colour world carries over.
   - **Tiles:** code-drawn generators for grass, paths, tar road, campus buildings (walls, windows, doors, roofs), trees (including copper-pod), lamp posts, benches, fences, stalls, interiors (beds, desks, laptops, shelves) and water. Each has 2–3 variants to avoid repetition.
   - **Characters:** a layered sprite generator. Body, skin tone, hair, shirt, trousers and accessories are composed per character from `characters.ts` and `rigs.ts` descriptions, giving 4-direction walk sheets. The protagonists keep their vein colours as a subtle pixel accent once `powers_awakened` is set.
   - **User's art turned into pixel sprites:** cut-outs are downscaled to 64–96 px, quantized to the palette with ordered dithering, and outlined. They become battle front sprites, dialogue portraits (48×48) and item icons (16×16).
   - The override folder `public/assets/override/` still swaps any generated asset.
   - Contact-sheet previews are generated for review.
7. **Atmosphere:** time-of-day tint (morning, noon, dusk, night), weather (petals, rain), light spots at night, a screen shake for key beats, and chiptune versions of the existing music themes.

## First milestone (N1): engine + look test, then stop for review
- Tag, create the new branch, retire side-scroller scenes, and set up the 480×270 config.
- Build the language settings, the tile engine, grid movement, the text box, and one start-menu stub.
- Build **one** real map: the MIT road with the hostel exterior, about 10 NPCs and one small quest.
- Publish it as a new artifact.
- **The user reviews the look and feel before content is scaled up.** Art direction is the biggest risk, so it's validated first.

## Second milestone (N2): the MIT campus + Chromepet slice
- **Maps:**
  - Outdoors: hostel, MIT road, IT department, library, canteen and café, Rajam Hall, the humanities block, Chromepet streets, market, railway station, police station, Dhanasree's house.
  - Interiors: hostel room, classrooms, library, café, station, police station, and the rooms of Dhanasree's house.
- **People:** about 40–60 NPCs, including all the named Act I characters in their places.
- **Main quests** (Purpose 1, in waves): the fest morning and the flashmob (with the slow-time power awakening as a playable beat), the death on campus, the police questioning, the investigation (clues onto the Case Board through talking and word battles), Dhanasree, and the Act I climax at Rajam Hall. Existing `p01/*.story` text is reused and trimmed into quest scripts. Long monologues become short scenes plus optional "remember" entries in the Codex.
- **Side quests:** about 10, for example the lost AirPods, the canteen rush, library returns, a stray dog, the bike repair, the fest stall and a senior's errand.
- **Collectibles:** Memory Fragments, codex entries and items.
- **Battles:** word battles with key characters, and turn-based fights for the daydream fights and set pieces.
- **Content rules unchanged:** implied-only for abuse, gore cuts away, slurs removed, the profanity filter, content warnings and the Tele-MANAS 14416 note.

## Docs to update
- `game/CLAUDE.md`: User decisions (pixel top-down, Ragul only, nonlinear and inspired-by, 16:9) and Status (new milestones N1…).
- `game/docs/plan-pixel.md`: this plan in the repo.
- `game/docs/decisions.md`: one line per decision (pivot, resolution, font, language split, art pipeline).

## Verification
- `bun run typecheck`, `bun test`, and new **map tests**:
  - Every door links both ways.
  - Every NPC and trigger is reachable (grid BFS).
  - Every text has `en` and `ta`.
  - Every quest can be completed from the flags that scripts set.
- `bun run lint:story`, extended with `@quest` checks.
- **Autopilot** (`tools/playtest/auto.mjs` rewritten): it BFS-walks the grid to the next quest target, talks, answers choices, and wins battles, until all main quests in the slice are done with no console errors. Side quests are covered by a second pass.
- **Screenshots and contact sheets** of every map and UI screen at 1×/3× scale, reviewed for readability, overlapping sprites and palette consistency.
- **Manual check** in the browser pane (`efil-dev` launch config): movement feel, menus with keyboard and mouse, both language settings.
- Build → `tools/artifact/make_page.py` → publish as a **new** artifact. The side-scroller page (VqaFmJqdwTLLdQvQXn2weh) stays as it is.
