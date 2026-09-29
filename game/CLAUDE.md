# EFIL: The Game

A 2D side-scrolling story RPG (16+), adapted from the user's novel and art.

**Paths** (absolute, so they work from any working directory):
- Story: `/home/ragul/Documents/EFIL: The Game/Story/PURPOSE 1..10/Venture 1..120.docx`
- Art: `/home/ragul/Documents/EFIL: The Game/images/`
- Game code: `/home/ragul/Documents/EFIL: The Game/game/`. Run all build/dev commands from here.

**`/home/ragul/CLAUDE.md` is the HumanDex spec, which is a different project. Ignore it here.**

## Source of truth
- `game/docs/plan-pixel.md`: the current plan (the pixel RPG). `game/docs/plan.md` is the side-scroller plan: its content rules, story analysis and act table still apply, but not its visuals or controls.
- `game/docs/story-bible.md`: a condensed, chapter-by-chapter reference for all 120 Ventures. Use it when writing each act's script, and re-read the original `.docx` when a scene needs more detail:
  `pandoc "/home/ragul/Documents/EFIL: The Game/Story/PURPOSE N/Venture M.docx" -t plain --wrap=none`
- Never modify `Story/` or `images/`.

## User decisions (fixed)
- **Pixel-art top-down RPG** in the style of the NDS-era handheld RPGs (Gen 3–5: Emerald, Diamond, Black/White), but all original: no Pokémon names, creatures, UI layouts, sounds or fonts, and no creature collecting. Decided 2026-09-29, after the side-scroller play-test. See `docs/plan-pixel.md`.
  - The Hollow Knight-style side-scroller (Act I) is paused, not deleted: git tag `side-scroller-act1`, playable page https://claude.ai/artifact/VqaFmJqdwTLLdQvQXn2weh (v7).
- **One playable character: Ragul.** The other three are NPCs, partners and quest-givers. Turn-based battles and word battles stay.
- The game is **inspired by** the novel, not a line-by-line retelling: an open hub full of NPCs, main quests in waves (any order within a wave), and side quests. Constant progression and variety.
- **Single screen, 16:9:** 480×270, 16 px tiles, scaled up with nearest-neighbour filtering. The UI must be very good.
- **Art:** code-drawn pixel art in one palette, plus the user's paintings converted into pixel battle sprites, portraits and icons. Anything can be swapped through `game/public/assets/override/`.
- **Language:** English or Tanglish, with **separate defaults for dialogue and for descriptions** (narration, captions, items, quests), chosen on first launch. Every line needs both `en` and `ta`.
- Build one milestone at a time, and stop for the user's review after each one.
- `rembg` is approved for cut-outs. Install it in a venv at `game/tools/.venv`, not system pip.

## Content rules (non-negotiable)
- Sexual abuse involving minors is **only ever implied**: no depiction, no description. This covers Dharshna's godown assault, Ragul and Nithin, the trafficking ring, and God and Eshwari.
- Venture 18 and Ragul's memory of it in Venture 80 (Shreesha) are reworked as a **non-sexual** cruelty beat.
- Gore cuts away at the moment of impact. Slurs are removed.
- Keep the content warnings, the profanity filter, and the Tele-MANAS 14416 note.
- Don't use the copyrighted songs ("Makkamishi", "On the Floor"). Write original music.
- Never remove watermarks. The third-party images must be replaced before any public release.

## Environment
- bun is at `~/.bun/bin/bun` (add it to PATH). node and npm are **not** installed; for the play-test tools, put a `node` symlink to bun on PATH and set `CHROME=/usr/bin/google-chrome`. Python 3.12, PIL, ImageMagick and pandoc are available.
- Latest versions checked on 2026-09-28: **phaser 4.2.1**, vite 8.3.1, typescript 7.0.2.
  - **The plan says Phaser 3, but Phaser 4 is now the stable release.** Before scaffolding, check the Phaser 4 docs for Light2D/lighting, Mesh/Plane (puppet warp), and the Arcade physics APIs. Prefer v4 if it supports what the plan needs. Log the choice in `game/docs/decisions.md`.
- Dev server: add `.claude/launch.json` (bun + vite) and preview it in the browser pane.

## Status
- [x] Story analysed (5 reports saved in `game/docs/story-bible.md`), all images catalogued, plan approved
- [x] **M0 (setup):** Phaser 4.2.1 + Vite 8 + TS 7 scaffold, git repo, asset pipeline run (66 images), story extracted, launch config. See `docs/decisions.md`.
  - Run scripts through `bun run <script>`; the `:` in the path breaks `node_modules/.bin` on PATH, so scripts call binaries by path.
  - `tools/.venv` is a symlink to `~/.local/share/efil-game/venv`.
- [x] **M1 (engine vertical slice):** built, **awaiting the user's review**. Two Glacia test rooms (Frozen Shore, Winter Path) built from the user's art, with parallax, painted terrain, lighting, weather, colour grade and the platforming feel. Also: Rosoar-tree rest and save, three save slots, Vale encounters leading into turn-based battles (timeline, Death Touch/Doom, Vale ink and re-forming, cubes, handgun, Loop Sense, Rewind, results), dialogue with the EN/Tanglish toggle and choices, the chapter card, the pause menu (party and keepsakes, items, Memory Fragments, map), settings with key rebinding, and credits with the Tele-MANAS note. The script is `src/story/slice/glacia_slice.story`.
  - Dev jump (dev server only): `?room=winter_path&flags=a,b&party=dhanasree&items=acanus_feather` starts in slot 3 in that room. Add `&fast` to run battles at 6× speed.
  - A room's painted layers are drawn on the CPU on first visit and then cached for the session. That took about 3.5 s in headless Chromium, which renders in software; it has not been timed on real hardware.
- [x] **M2 (Act I, Purpose 1):** built, **awaiting the user's review**. New game starts at Venture 1; Title, Chapters starts any Venture (all unlocked in this build) or the M1 Glacia slice. See `docs/act1.md` and `docs/decisions.md`.
  - 13 Earth rooms with code-painted backdrops (`data/rooms_p01.ts`), 12 scripts `src/story/p01/v01..v12.story` in English and the novel's Tanglish, 5 word battles, the daydream fights, stealth, chases, the Case Board and Memory Fragments.
  - Dev jump: `?venture=5` starts that Venture in slot 3; add `&label=walk` to start at a label (and `&room=mit_road` to start that label in another room), `&fast` for fast battles.
  - Play-test round 2 (29 Sep): staged story scenes with a cinematic camera (`scenes/StageScene.ts`, commands in `story/parser.ts`), the pause menu rework, the powers waking at the V1 dance, Memory Fragment bonuses. See `docs/decisions.md`.
- [ ] **Pixel RPG** (`docs/plan-pixel.md`, branch `claude/pixel-rpg`). **Paused by the user on 2026-09-29, after art pass 2**, to rethink the direction. Nothing is lost: both versions can be resumed.
  - [x] **N1: engine + look test:** built, **awaiting the user's review**. Playable page: https://claude.ai/artifact/Ufei2xKb45qjqJdpAeoSi4 (a separate artifact; the side-scroller keeps its own URL).
    - Code: `src/px/` (scenes, overworld, UI, maps, quests, director), scripts in `src/story/px/`. Art: `python3 tools/pixel/build.py [--preview]` writes `public/assets/pixel/` (tiles, props, UI, bitmap font, 18 characters with portraits).
    - Maps: `hostel_room`, `mit_road` (ASCII ground plus buildings, props, NPCs, looks, warps, triggers, `enter` scripts). Quests: `src/px/quest/quests.ts`, `@quest start|done id`.
    - Dev jumps: `?new` starts a new game; `?map=mit_road&x=20&y=13&flags=a,b=2&items=chai&quest=posters` starts in slot 3.
    - Autopilot: `node drive.mjs ./pxauto.mjs px "?new"` (walks the grid, talks to everyone, must finish `GOAL`, default `posters`); `pxmenu.mjs` checks the menu, saving and Continue.
    - The old Act I scripts are in `legacy/story/` as source material.
  - [ ] N2: MIT campus + Chromepet slice (Purpose 1 as main quests in waves, about 10 side quests, battles).
- (Paused) side-scroller M3–M12.

Update this Status list at the end of each milestone, and add one line per spec-changing decision to `game/docs/decisions.md`.
