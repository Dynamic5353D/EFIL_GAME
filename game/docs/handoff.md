# Handoff: pixel RPG, N1 (29 Sep 2026)

Branch `claude/pixel-rpg` (from `claude/brave-brown-yda06o`). Read `CLAUDE.md`, then `docs/plan-pixel.md`.

## Where things stand
- The user paused the side-scroller after play-testing Act I and asked for an NDS-era pixel RPG: one playable
  character (Ragul), a semi-open world full of people, inspired by the novel, very good UI, and separate language
  defaults for dialogue and descriptions.
- The side-scroller is kept at git tag `side-scroller-act1`; its page https://claude.ai/artifact/VqaFmJqdwTLLdQvQXn2weh
  was accidentally overwritten by the pixel page (v8) and restored from the tag (v9).
- **N1 is built and published:** https://claude.ai/artifact/Ufei2xKb45qjqJdpAeoSi4. Waiting for the user's review
  of the look and feel before N2 (the MIT campus and Chromepet slice).

## Verified
- `bun run typecheck`, `bun test` (41 tests: maps compile and are reachable, doors both ways, quests), `bun run lint:story`.
- Autopilot from a new game: every NPC and look visited, the posters quest done, the morning quest advanced,
  no console errors. `pxmenu.mjs`: journal, bag, Ragul, save to slot 1, reload, language questions, Continue.

## Publishing
- `bun run build && python3 tools/artifact/make_page.py`, then copy `dist/page/index.html` to `dist/pixel/efil-pixel.html`
  and publish **that path** with `url: https://claude.ai/artifact/Ufei2xKb45qjqJdpAeoSi4`. Never publish the pixel
  page to the side-scroller's URL.

## Next (N2)
- More maps (campus buildings, Chromepet streets, the station, the market, Dhanasree's house, the police station)
  joined by edge warps; routes open in story waves (barricades and guards already show the pattern).
- Purpose 1 main quests in waves, drawn from `legacy/story/p01/`; about 10 side quests; battles and word battles
  restyled in pixel UI; the user's art pixelized into battle sprites.
- Chiptune instruments in `AudioSynth`; time of day; item and quest icons.
