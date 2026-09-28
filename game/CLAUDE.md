# EFIL: The Game

A 2D side-scrolling story RPG (16+), adapted from the user's novel and art.

**Paths** (absolute, so they work from any working directory):
- Story: `/home/ragul/Documents/EFIL: The Game/Story/PURPOSE 1..10/Venture 1..120.docx`
- Art: `/home/ragul/Documents/EFIL: The Game/images/`
- Game code: `/home/ragul/Documents/EFIL: The Game/game/`. Run all build/dev commands from here.

**`/home/ragul/CLAUDE.md` is the HumanDex spec, which is a different project. Ignore it here.**

## Source of truth
- `game/docs/plan.md`: the approved implementation plan (stack, visuals, systems, content rules, the act table, milestones). Follow it.
- `game/docs/story-bible.md`: a condensed, chapter-by-chapter reference for all 120 Ventures. Use it when writing each act's script, and re-read the original `.docx` when a scene needs more detail:
  `pandoc "/home/ragul/Documents/EFIL: The Game/Story/PURPOSE N/Venture M.docx" -t plain --wrap=none`
- Never modify `Story/` or `images/`.

## User decisions (fixed)
- Hollow Knight-style real-time **side-scrolling exploration** combined with **turn-based battles**. The party is set by the story; there is no free character swapping. The priority is constant progression and variety: areas, abilities, gear, collectibles, revelations.
- The user's artwork is the canonical visual style. Keep everything consistent with it (palette-sampled terrain, cut-outs, rim-lit silhouettes). The four protagonists have no art yet, so they use stylized rim-lit silhouettes and can be swapped out through `game/public/assets/override/`.
- Dialogue is English by default, with a **Tanglish toggle**. Every line needs both `en` and `ta`.
- Build **one Purpose (act) per milestone**. Stop for the user's review after each one.
- `rembg` is approved for cut-outs. Install it in a venv at `game/tools/.venv`, not system pip.

## Content rules (non-negotiable)
- Sexual abuse involving minors is **only ever implied**: no depiction, no description. This covers Dharshna's godown assault, Ragul and Nithin, the trafficking ring, and God and Eshwari.
- Venture 18 and Ragul's memory of it in Venture 80 (Shreesha) are reworked as a **non-sexual** cruelty beat.
- Gore cuts away at the moment of impact. Slurs are removed.
- Keep the content warnings, the profanity filter, and the Tele-MANAS 14416 note.
- Don't use the copyrighted songs ("Makkamishi", "On the Floor"). Write original music.
- Never remove watermarks. The third-party images must be replaced before any public release.

## Environment
- bun is at `~/.bun/bin/bun` (add it to PATH). node and npm are **not** installed. Python 3.12, PIL, ImageMagick and pandoc are available.
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
- [ ] M2: Act I (Purpose 1)
- [ ] M3–M11: Acts II–X
- [ ] M12: polish

Update this Status list at the end of each milestone, and add one line per spec-changing decision to `game/docs/decisions.md`.
