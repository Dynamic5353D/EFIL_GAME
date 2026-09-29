# Handoff: play-test round 2 (29 Sep 2026)

For the next session, picking up on branch `claude/brave-brown-yda06o` (PR Dynamic5353D/EFIL_GAME#1).
Read `CLAUDE.md` (the project rules) first, then this.

## Where things stand

- **M2 (Act I) is built**, and the user is play-testing it. The user asked for round-2 changes (below). Those changes
  are all **committed and pushed**, but **not yet fully verified or republished**.
- **Playable page:** https://claude.ai/artifact/VqaFmJqdwTLLdQvQXn2weh (private artifact).
  - Its current version (v5) is **older than this round**: it has the exit markers and the Bag key, but not the menu
    rework or the stage.
  - Republish to the **same URL** (see "Republish" below).
- **Last commits:**
  - `c8be251`: stage V8–V12.
  - `b669715`: stage V2–V7.
  - `a374916`: the stage system and V1.
  - `28e60d7`: the menu rework, no vignette, powers waking at the dance.
  - `bdcabf3`: docs.

## The user's round-2 feedback, and what was done

1. **The menu:** Esc shouldn't be the only back key; arrows didn't move through lists; the Guide text overlapped; the
   Map was a cramped flow chart. **Done** in `scenes/MenuScene.ts` (rewritten):
   - Two levels: → or Enter opens a section; ←, Esc, Backspace or X goes back; P also pauses.
   - A footer shows the keys.
   - Lists no longer draw twice (that caused the overlap and the two cursors).
   - Party shows live figures; Items is a grid with a detail card; the Case Board is a corkboard.
   - The Map is a pannable view (its own camera), with room cards showing the backdrop thumbnail, the ground shape
     and the paths between rooms.
   - The Act I item icons were redrawn with shading.
2. **"Images slightly realistic":**
   - Figures now wear shirts and trousers (`world/CharacterRig.ts`).
   - Item icons are shaded (`world/Generated.ts`, `earthIcons`).
3. **New places with no characters, just text (important):** **done**.
   - `scenes/StageScene.ts`: a `@scene` opens a stage with the people in it.
   - Everyone who speaks in the section is cast automatically (`story/Director.ts`, `autoCast`).
   - The camera frames whoever is speaking, and the others turn to face them.
   - Every staged scene in V1–V12 was hand-directed with `@cast`, `@prop`, `@caption`, `@enter`, `@exit`, `@pose` and
     `@shot`.
   - Scenes that mixed several places were split (V3, V5, V11).
4. **A cinematic "3D" camera for key moments, and falling flowers:** **done**.
   - Stage layers sit at different depths, so `@shot orbit` / `pan` / `push` show parallax.
   - `@shot` also works in rooms (`WorldScene.shot`), and room dialogue eases the camera onto the speakers, with
     letterbox bars.
   - Copper-pod petals fall thicker on the MIT road and lie on the ground (`WorldScene.scatterPetals`,
     `world/Weather.ts`).
5. **Memory Fragments, and Ragul's powers:**
   - The powers now wake at the V1 dance. Time slows (a playable slow-motion walk, with flag `slowmo`) and there are
     cut-ins of the other three.
   - Veins stay hidden until flag `powers_awakened`, via `CharacterRig.powers`.
   - Fragments give +5 max HP per 3 gathered (`GameState.fragmentBonus`).
6. **No vignette in battles and pauses:** done.
7. **Too much reading after the dance:** the user clarified: "let there be reading, just add more playing,
   interactive beats and cinematic shots."
   - Added choices: take her hand (V4); how Nithish answers the inspector (V5); step in while time slows (V5); dance to
     her song (V7).
   - Slow motion and close-ups on key beats; the V12 climax is fully staged.

Details of each decision are in `docs/decisions.md` (the entries dated 2026-09-29).

## What to do next

1. **Verify.** Start the dev server, then run the full autopilot (next section).
   - Each `tools/playtest/full<N>.log` must end with `REACHED V<N+1>` (or `CREDITS` for V12) and `no console errors`.
   - The last run in the old session covered only the first batch:
     - **V2 and V3 passed.**
     - **V1 got stuck.** The flashmob trigger stayed live after its story paused for the slow-motion walk, so it could
       fire again. Fixed (the trigger now retires at `v01_dhana_dance`), and a new test catches it ("every story
       trigger is retired by its own story").
   - Re-run V1 and V4–V12.
   - Before the staging work, every Venture passed.
   - Watch for soft-locks from the new choices, the `slowmo` walk in V1 (trigger `dance_end` at x=62 on the MIT road),
     and staged `@room` changes.
2. **Look at the staged scenes.**
   - Run `stagerun.mjs` per Venture and build contact sheets with `sheet.mjs`.
   - Especially check the V8 twist montage, V9 (Dhanasree drawn as a child via `dhanasree=little_dhana`), and the V12
     climax.
   - Things to look for:
     - figures overlapping;
     - props too big or too small (props are painted at `PROP_K` = 1.8);
     - sitting figures not on their seats;
     - close-ups that feel crude.
   - Headless Chromium caps Phaser's frame delta, so camera moves take longer there than in a real browser. Judge the
     composition, not the timing.
3. **Republish** the playable page to the same URL, then tell the user what changed. Use the list above, kept short.
4. Ask the user to play-test again. Then Act II (M3) begins, one Purpose per milestone, stopping for review.

## Tools (now in the repo)

The environment is a cloud container: node is at `/opt/node22/bin/node`, bun at `~/.bun/bin/bun`, and Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (override with `CHROME=`).

```bash
export PATH=$HOME/.bun/bin:$PATH
cd game && bun run dev                      # dev server on :5173, keep it running in the background
cd game/tools/playtest && npm i             # playwright-core, once
./runall.sh                                 # autopilot V1..V12, about an hour; logs full<N>.log
node drive.mjs ./auto.mjs t "?venture=5&fast" # one Venture
EVERY=3 MAXN=80 node drive.mjs ./stagerun.mjs v8 "?venture=8"   # screenshots of staged lines -> shots/
node sheet.mjs v8- ../../dist/v8sheet.png 4   # contact sheet of shots/v8-*.png
```

- **Dev jumps** (dev server only):
  - `?venture=N` starts a Venture; add `&label=X` to start at a label and `&room=Y` to start it in another room
    (for example `?venture=1&label=crowd&room=mit_road&flags=v01_flashmob`).
  - `?room=…&flags=…&party=…&items=…` starts free roam in a room.
- **Autopilot** (`auto.mjs`): it switches off guards and chasers, answers choices with the first option, wins word
  battles and teleports to triggers. When a room has nothing left to do, it prefers exits that don't lead straight
  back.
- Don't edit `src` while headless runs are going: Vite hot reload restarts them.

### Republish

```bash
cd game && bun run build && python3 tools/artifact/make_page.py   # -> dist/page/index.html
```

Then publish with the Artifact tool, passing `url: https://claude.ai/artifact/VqaFmJqdwTLLdQvQXn2weh` and
`file_path: game/dist/page/index.html`.
- Read the artifact first if the tool asks you to.
- The art in `assets/...` is already stored with the artifact, so only the page needs publishing.
- Ignore the "download link" warning: it comes from Phaser's unused JSON-export helper.

## Staging reference (story commands)

- `@scene gen:<place>`: opens a stage and casts the section's speakers unless a `@cast` follows.
- `@scene none`: closes it.
- `@cast id[=rig][@x][<|>][^][:pose] …`
  - `x` is 0..1 across the stage.
  - `<` / `>` set facing; `^` puts the figure further back.
  - Poses: idle, talk, sit, kneel, dance, phone, think, point, cross, ko, run, hurt, cast.
- `@enter id left|right|x [x]`, `@exit id [left|right]`, `@pose id pose`, `@face id left|right|other`.
- `@prop visual@x[<][^] …`: furniture behind the cast. A figure in the `sit` pose sits on the nearest chair, bed or
  bench.
- `@caption Place, time` with an indented `ta:` line.
- `@shot auto|wide|on X|close X|two X Y|push [X]|pull|pan left|right|orbit [X]|dutch|level|shake|flash|slow|normal|memory|present`.
  - In rooms, X can be `player`, an NPC, guard or chaser id, a follower's member id, or any entity id.
- Room flag `slowmo`: the room stays in slow motion while it is set.
- Every speaker needs a figure to be cast: `data/speakers.ts` (`rigFor`) and `data/rigs.ts`. Voices with no figure
  stay off stage (a phone, the news).
- Lint checks casts, props and shots: `bun run lint:story`.
