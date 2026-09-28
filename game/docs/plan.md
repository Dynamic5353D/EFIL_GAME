# EFIL: The Game — Implementation Plan

## Context
The folder `/home/ragul/Documents/EFIL: The Game/` holds the user's story and art:
- `Story/PURPOSE 1..10/Venture 1..120.docx`: a ~420k-word screenplay-style novel, mostly Tanglish plus English. Four MIT Chromepet students (Ragul, Dhanasree, Nithish, Dharshna) carry shards of RIVA after God dies on their college road. They fall into Glacia and other worlds (Dynamica, Lushglade, Arizal, Elnarius, Requalam…) while clone-linked deaths sweep Tamil Nadu.
- `images/`: 67 painterly concept images covering characters (Kanagaraj, Zitabye, Kaviya, Jeevitha/White-dressed girl, Armored Guy…), creatures, locations, items and the RIVA orbs.

The user wants a **2D story RPG, rated 16+, with beautiful graphics, covering the whole story**. Their decisions:
- **Language:** English dialogue by default, with a toggle to the original Tanglish.
- **Style:** a hand-crafted 2D **side-scroller** in the spirit of Hollow Knight/Silksong. Interconnected areas, platforms, NPCs, checkpoints, collectibles, ability-gated progression, and layered painted backgrounds with foreground elements, particles, lighting and camera work. **The user's artwork is the canonical visual reference**, and the style must stay consistent: no switching between generic assets and their art.
- **Combat:** real-time exploration with **turn-based battles**. Progression and variety matter more than combat complexity. The party is set by the story (no free character swapping). Constant meaningful progress: areas, abilities, gear, revelations, enemies, collectibles, upgrades. These are balanced with cinematic, emotional character moments.
- **Build order:** the full game, **one Purpose (act) at a time**, with the user reviewing after each.

Note: `/home/ragul/CLAUDE.md` is the unrelated HumanDex spec. It does not apply to this project.

---

## Tech stack
- **Phaser 3** (latest stable, verified with `bun pm view phaser version` at install), **TypeScript (strict)**, **Vite**, and **bun** (available at `~/.bun/bin/bun`; node/npm are not installed). Phaser covers WebGL rendering, Light2D, particles, cameras, tweens, Arcade physics for the platformer, and mesh deformation for puppet animation.
- The game runs in any browser and is tested in the app's browser pane. Desktop packaging (Tauri) is an optional final step.
- **Asset pipeline:** Python 3.12, with PIL (installed) and ImageMagick (installed). It needs `rembg` (a pip package that downloads the ~170 MB u2net model) to cut characters and creatures out of their backgrounds. **I'll ask before installing it.** The fallback is flood-fill masking, which is fine for images with plain grey or black backgrounds.
- **Tests:** `bun test` for battle math, the script parser, save/load, and the content linter.
- **Project location:** `/home/ragul/Documents/EFIL: The Game/game/` (the source `Story/` and `images/` are left untouched), then `git init`.

## Visual approach (keeping the art consistent)
1. **Environments.** Each area is built from one of the user's images:
   - **Far layer:** the image blurred and darkened, slowest parallax.
   - **Main backdrop:** the image itself, cover-scaled. Tall images become vertical shafts (Cascades, Majestic Hills). Wide images become long rooms (the bioluminescent underworld).
   - **Foreground:** code-drawn silhouettes of branches, icicles, grass and crystals, coloured from a **palette sampled from that image**.
   - **Terrain and platforms:** painted-noise fills in the image's palette, with rim light matching the image's light direction.
   - A per-area colour grade, Light2D point lights (glowing crystals, fire), and weather particles (snow, embers, fireflies, pink fog, the crimson-moon snow).
2. **Cut-outs from the user's art** are used directly wherever it exists, with background removal:
   - battle sprites for enemies, bosses and guest allies (Vales, Large Liquid Shadow, Armored Guy, White Tiger, Frozen Phoenix, Rami, Acanus, Kambu, Deer, the cone-hat, fluffy and Kin creatures);
   - static NPCs placed in scenes (Majesty Kaviya in her pool);
   - item icons (Rosoars, locket, bracelet, staff, Ice Blade, Zitabye's axe, orbs).
   Puppet animation brings them to life: mesh-warp breathing and idle sway, attack lunges, hit flashes and squash, plus VFX particles.
3. **Dialogue portraits:** crops of the character art.
4. **Playable explorers** need many animation frames, so they get a **procedural rim-lit silhouette rig**: layered vector parts with skeletal animation for idle, run, jump, fall, dash, climb, interact and hurt. Colours and silhouette come from each character's reference and story description, with glowing vein accents (Ragul blue, Dhanasree green, Nithish red, Dharshna yellow). The same rig, scaled up, is used in battle.
5. **Missing art: the four protagonists (Ragul, Dhanasree, Nithish, Dharshna) have no reference images.** They get stylized silhouette portraits in the same rim-lit style. There is an **art-override folder**: dropping `portraits/ragul.webp` (or a sprite sheet) into it replaces the generated version with no code change, and the same works for any asset.
6. **Pipeline script** `game/tools/build_assets.py` reads `../images/` and writes:
   - resized WebP files (≤2048 px) and layer variants;
   - `palettes.json` (dominant, shadow and highlight colours per image);
   - cut-outs;
   - an `asset-manifest.json` mapping story names to files, with a note on which images are duplicates (`download.jpeg` is the same as `Acanus.jpg`).
7. **Licensing note:** several images carry third-party watermarks or credits (Deer Mount ©Eran Fowler, Acanus @13033303, and others). They are fine for a private build, but **must be replaced or licensed before any public release**. Watermarks are never removed.

## Game systems
**Exploration (real time)**
- Tuned platformer feel: acceleration curves, coyote time, jump buffering, variable jump height and camera look-ahead.
- Abilities are unlocked by the story and gate areas, all taken from the text:
  - Acanus glide and double jump
  - Deer dash-ride
  - Light Cube (dispels shadow walls, lights dark rooms)
  - Resonance Cube (breaks cracked ice and rock)
  - Fire (melts ice walls, burns Vale gates)
  - Snap (teleport between RIVA marks, and later between worlds)
  - Golden Rosoar hoverboard and shield
  - Water flick-swim (Ragul, Act VI)
  - Green Ring scent trail
  - White Rosoar sense-void puzzles
- Rooms connect through transitions. Each act has a map screen.

**Checkpoints: Red Rosoar trees**
- Resting heals the party, saves the game, and respawns normal enemies.
- **Dhanasree's Loop Sense** acts as the "death" rule in her chapters: dying rewinds you to the last Rosoar tree and keeps discovered knowledge.

**Collectibles and progression**
- **Memory Fragments:** codex and lore entries, viewed in "Kaviya's Pool" with the user's art.
- **RI Shards:** currency.
- **Pluffine Wool:** crafting material.
- **Red Rosoar fruit:** healing.
- **Keepsakes:** equippable charms such as Dharshna's locket and Dhanasree's bracelet.
- **Crafting with Anushri:** staff and weapon upgrades.
- Levels come from XP.
- Each act adds at least one new ability, 2–3 gear pieces, a set of new enemies and codex pages.

**Turn-based battles**
- They start when you touch a visible enemy, or at story set-pieces.
- A **side-view battle on the current area's painted backdrop**, with a timeline turn order (the order is shown on screen).
- The party is fixed by the story: 1–4 active members, plus guests.
- Each character's mechanic is built from their story powers:
  - **Ragul, Death Touch:** marks a target with Doom, which kills normal enemies after 3 turns. It **fails against armour** until the armour is broken. Soul Absorb heals him from a doomed target. A **Soul Hunger** meter decays across battles, so he has to feed, which carries a moral weight.
  - **Dhanasree:** staff strikes; the Light Cube (blinds, strips shadow form); the Resonance Cube (breaks armour); a handgun with 6 shots per rest; **Loop Sense** (preview the enemy's next move); **Rewind** (once per battle, undo the last round).
  - **Nithish:** strength attacks; Guard (protect an ally); **Snap** (reposition, delay an enemy, or escape).
  - **Dharshna:** fire whip, fire triangles, fire laser. A **Heat** gauge rises when the party is hurt and falls under Fear. **Only fire kills Vales permanently**; other damage lets them regenerate.
  - **Jeevitha (White-dressed girl):** Golden Rosoar stances (Blade, Shield, Gauntlets, Knives) and Aura Sight (reveals weaknesses and emotions).
  - **Asmitha:** nail-summoned armour and blossom-ant thorn walls.
  - **Kanagaraj:** red energy blasts and a "Qwehehehe" combo chain.
  - **Guests:** the Armored Guy (shadow step, ice sword), the Frozen Phoenix (freeze and heal summon), Shreesha (Black Rosoar sound that pierces guard), and Zitabye.
- Enemy rules taken from the lore:
  - **Vales** regenerate unless burned, shattered or put in water. They can switch to a 2D ghost form (immune but unable to act) and die in light.
  - **Glacian mobs** have a Magic Guard. They are handled by story means such as the "God has come to Blue Rose!" lie, or by the Black Rosoar's sound.
  - The **Armored Guy** boss is multi-phase and follows Venture 41–43 beat by beat.
- **"Word battles":** some story confrontations use the same battle UI with Persuade, Deceive and Endure actions against a Resolve bar. Examples: interrogations, Dhanasree's lies, Ragul's "Blue colour" con, talking Dharshna out of the restroom, and the suicide standoffs.

**Story presentation**
- **Venture title cards:** "Purpose 1 · Venture 3", with the in-story date and time.
- **Cutscenes:** camera pans across the painted art, portrait dialogue, screen effects (migraine distortion, the loop's "TICK" rewind, the red snap flash, the purple Shroud).
- **Choices:** they change dialogue, relationships and small outcomes, but the canonical plot stays fixed. Example: in Venture 1 you can *choose* to help the man on the road, but Ragul's migraine overrides you ("the world is cruel"). That pays off when he learns the man was God.
- **Chapter select:** unlocks for replay, and a debug build can jump to any Venture.

**Script format and localisation**
- Story files: `src/story/p01/v01.story`, one per Venture, in a writer-friendly text format that is parsed and validated at build time:

  ```
  @scene hostel_room  @time "29/09/2022 6:05 AM"
  RAGUL: This headache again... will it ever leave me alone?
    ta: Otha! Inaikum indha thalavazhi vandhuruchu...
  @battle fantasy_soldiers
  @choice help_man | "Help him" -> v01_help | "Walk away" -> v01_walk
  ```
- Every line has an `en` and a `ta` version. The English is my faithful, condensed translation. The Tanglish is adapted from the user's original lines.
- **A content linter** (`bun run lint:story`) fails the build on a missing translation, an unknown asset, battle or flag, or a banned-content tag.

**Audio**
- No audio assets exist, so music and sound effects are **generated in code with WebAudio**: ambient pads per area, battle themes, UI sounds, snow and wind.
- There is a drop-in folder for real audio later.
- The copyrighted songs in the story ("Makkamishi", "On the Floor") are replaced with original music in the flashmob and dance scenes.

**Saves and settings**
- Save slots use localStorage, wrapped in try/catch, with autosave at Rosoar trees.
- Settings: language (EN/Tanglish), text speed, volume, **reduced motion**, a screen-shake toggle, a **content-warnings toggle**, and a **profanity filter**.
- Controls: keyboard and gamepad (Phaser gamepad), with rebinding.

## Handling mature content (16+)
**Kept:** violence and deaths, the mass-death horror, the protagonists' moral darkness (Ragul's killings and cowardice, Dhanasree's manipulation, and the Venture 24 newborn cut away to off-screen), grief and trauma, strong language (slurs removed), and suicidal ideation handled with care.

**Implied only, never shown or described:** every instance of sexual abuse involving minors, including:
- Dharshna's godown assault;
- the trafficking ring;
- Ragul's abuse by Nithin;
- Ragul being coerced to hurt Dharshna (Ventures 69–71);
- Eshwari's assault.

These appear only as abstracted memory (a locked godown door, the lotus locket, a cut to black) and characters referring to "what happened in the godown". The weight and the reveals (Asmitha recognising Ragul, Ragul's confession) are kept.

**Reworked or cut:**
- **Venture 18 (Ragul undressing the teenage Shreesha): removed.** It is replaced with a non-sexual cruelty beat. Ragul decides "nothing is wrong here", then exploits Shreesha's naivety in a dangerous "game" to test his power. Asmitha's interruption ("murderous beasts") and his punishment are kept.
- **Adult intimacy (God and Zitabye, Venture 56):** fade to black.
- **Abinaya's book:** drawn from her shadow-chest instead.
- **Poba/Buraga mating scenes:** cut.
- **Cannibalism:** implied off-screen.
- **Final-boss deaths** (the beheadings, Dharshna's severed legs, the Phoenix cut in two, Ragul using corpses as shields in the loop): the moment of impact cuts away, and the loop's corpse-shield attempts become a single abstract flash.
- **Slurs** (including the homophobic contact name): removed.

**Player care:**
- A start-up content notice and short warnings per chapter.
- A settings/credits note with India's Tele-MANAS helpline (14416).

## Act structure (one Purpose = one act, each built and reviewed in turn)
| Act | Worlds and main areas | Playable party and POV | New abilities and gear | Bosses and set-pieces |
|---|---|---|---|---|
| **I. Purpose 1: "The world is cruel"** (Earth, 29 Sep–3 Oct 2022) | MIT campus hub (hostel, cut road, Rajam Hall, IT dept, library, Hangar 1, NRI hostel, Humanities block), Radha Nagar market, Dhanasree's house, police station | Ragul, Nithish, Dhanasree, Dharshna (split POV) | Sprint and hide, shove objects (Nithish), Dhanasree's handgun, case board with clues | Ragul's anime-fantasy tutorial battle (V8), market stealth chase, rain chase, hostel fire escape, plane-yard oil-and-rope trap, standoff with Rajesh, **the Snap** |
| **II. Purpose 2: "Glacia"** | Blue Rose, the Acanus race, Pluffine Forest, Winter Path, Neva Sanctuary, Red Lily and the Elliptical Valley, Lavender Forest, Ice Cavern, the Cascades underworld; an Earth hospital | Split: Ragul and Dhanasree; Nithish and Jeevitha; Dharshna and Kanagaraj | Acanus glide, deer dash, Golden Rosoar stances, Snap | Armored Guy ambushes (survive and escape), Asmitha, the burning Lavender Forest, cone-hat collapse escape, **Cascades: Vales and the Large Liquid Shadow**, hospital escape |
| **III. Purpose 3: "Red"** | Sanctuary mob chase, Water Cliffs and the crater, Majestic Hills and Kaviya's cave, the train (Earth), Dindigul, loop flashback begins | Dhanasree, Ragul, Dharshna; Nithish (Earth) | Staff with Light and Resonance Cubes (crafted by Anushri), deer riding, Nithish strength puzzles | Mob chase set-piece, "Blue colour" word battle, Dharshna's eruption, train rescue, ICU snap |
| **IV. Purpose 4: "EFIL"** | Dhanasree's loops (campus replayed across loops), Crimson Pluffine Forest, Frozen Pond, Apex of Requalam, Mula Fog Towers, Blue Lily | Dhanasree's loop runs, then the full party | Loop Sense and Rewind, fire whip and triangles, fluffy-creature light field | Loop puzzles (the death spreadsheet), **multi-phase Armored Guy boss** in which the Frozen Phoenix rescues the party, Abinaya's transformation, Blue Lily defence |
| **V. Purpose 5** | Blue Lily, Purple Silence, Majestic Hills, the Summit, Dynamica, Shroud collapse, Lushglade arrival | Dharshna and the Armored Guy; Nithish, Ragul and Dhanasree | Phoenix summon, Monster-Polathal combo (the Glacians smash, Dharshna burns) | Merged Vale giant, Winged Guy, the Summit climb, 4:59 PM clone rescue, Shroud escape, Lushglade |
| **VI. Purpose 6** | Lushglade canopy, Root Trenches, Soft Meadows, the Lushglade Sea, Elnarius (Nithish's mind-travel), Arizal and the White Rosoar temple | Jeevitha (solo), Dhanasree with Ko, Ragul, Nithish (Earth) | Aura Sight, flick-swim, White Rosoar | **Pale Wind-Leech** (Jeevitha), Shalini, River Camp exposure and chase, Abyssal Devourer chase, the temple, the Kanagaraj army |
| **VII. Purpose 7: "Sand Sails"** | Arizal red dunes, timeline rifts, Asmitha's orange Embura shelter (voice-locked); Elnarius red tile (8-second escape); Lushglade Purple Woods, Toxic Pine Woods, Aureate Shallows; the Poba–Buraga war; inside the Shroud (Ragul's void); the Blossom-Ant barricade cliff; the Great Tree's Root Cave | Ragul, Zitabye, Kanagaraj, Shreesha (Arizal); Jeevitha solo; Dhanasree (captive, then free); Nithish (Earth and Elnarius); Asmitha (guest); Dharshna | Green Rosoar scent-ghosts, White Rosoar numb-sprint (8-second shadow lag), sand half-pipe "physics-hop", Crimson-Moon Scythe (Asmitha), fire-thrust flight | **Clone Zitabye mirror duel**, Sand Sail horde (Death Touch one-shots soulless clones), the shelter password vs the Shroud timer, Poba–Buraga war (Ko's end), Vale convoy chase, Asmitha's farewell, **Dharshna vs Abinaya, part 1** (Pink Rosoar blast) |
| **VIII. Purpose 8: "The Architect"** | Great Tree crater (glass and violet tide), the burned lake, River Camp defence, Ragul alone in Lushglade (ancient oak, poppy field), Autumn Clearing graves; Earth (Rajesh's house, helicopter escape); **God's memory** through the Book (the Architect's desk, the creation of EFIL, Elnarius) | Dharshna, Jeevitha, Dhanasree, the Armored Guy (camp), Ragul solo; then the reunited party; Nithish's Earth team | Dharshna's fire-sword and full flight, **Vale Command** (Dhanasree's Prime Vale arm: turns Vales into platforms and lotus bridges), Will Sword (Ragul), the Pink Rosoar heal | **Dharshna vs Abinaya, part 2** (mercy choice; Jeevitha ends it), camp defence (escort Eshwari), **Bloom-Crawler** plus the Fungal Sprite and hologram viper (Ragul), Eshwari's gift, the **V91 reckoning word battle** (to the truce), Earth helicopter escape, the playable Architect memory (V94–96) |
| **IX. Purpose 9: "Live"** | Earth in collapse (Fort St. George bunker, burning Chennai, Trisulam quarry), the Lushglade Sea dive, Requalam and the Archive Temple (image26 underworld, image13 sea cave), Elnarius (Plaza, Canopy, Spheres, Waters, the Zitabye-statue palace), the vortex, the Palace of All | Nithish's Earth team (Phoenix, Armored Guy, Winged Guy); the dive team (Ragul, Dhanasree, Dharshna, Jeevitha, Shreesha, Kanagaraj, Large Buraga) | Inverse-kinesis swim, **Smile meter** (Elnarius stealth: negative emotion lets the Blo AI take over), Green Rosoar ghost trails, teleport umbrellas, Chase parkour, Will Sword and **Som** ride | Non-lethal Fort raid and state broadcast, the **Shalini pursuit** (can't be fought; ends when Som arrives), Light of Free Will, Shreesha's death, the Guardian's memory (RIVA shattered by Zitabye's axe), "I choose them" |
| **X. Purpose 10: "EFIL"** | Palace of All (colour-sky arena), the Infinite White, MIT reset (29 Sep 2022, 8:15 AM), EFIL epilogues (Blue Plains, Lushglade, Ice Cavern, Red Lily, freed Elnarius), Parvathy Hospital, graduation April 2026 | Everyone, then Ragul alone | **Soul Sky** (each fighter's colour stance changes their skills, e.g. Royal Blue for resolve, Pure White for selfless love), Sleek Black Armor shadow-dive | **Final boss Zitabye, five phases:** (1) Embura makes outside hits useless, so the team works to set up the choke; (2) White Rosoar berserk, with the scripted deaths; (3) Zitabye absorbs the fire and snap, then Nithish's self-erasure and Dhanasree's trade; (4) **the loop gauntlet** as a short roguelike retry section (the deaths and attempts are compressed); (5) **the 3-minute survival finale** after the embrace. Then RIVA is restored, the reset happens, the epilogue vignettes play (playable PTSD moments, the hospital vigil), and the final **"Daijobou" reunion** under the yellow petals rolls into the EFIL title card |

**Ending twist handled in-game:** Ragul is Zitabye reborn, and his migraine is the "defect" of that rebirth. The reveal is foreshadowed through collectible Memory Fragments across all acts (the dream of the glowing ball, the migraine, the Embura echo), so the V115 revelation pays off. The deaths in Act X are shown in the 16+ way described above: impact cut away, no lingering gore.

**Story reference:** all five reports are saved in `game/docs/story-bible.md`, the canonical reference for writing each act's script. Ventures 80 and 94 hold more material that is implied only (Ragul's memory of Shreesha is handled like the Venture 18 rework; God's assault on Eshwari is never shown).

Each act delivers:
- **all 12 Ventures** as playable or cinematic segments;
- 4–8 connected areas, 6–15 battles, 1–2 bosses, and new abilities and gear;
- codex entries, collectibles, and one checkpoint tree per area.

## Code layout (`game/`)
- **Root config:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.claude/launch.json` (dev server for preview).
- **`tools/`:**
  - `build_assets.py`: the image pipeline.
  - `extract_story.py`: pandoc to `tools/story_raw/` (a reference only, gitignored).
  - `lint_story.ts`: the content linter.
- **`public/assets/`:** `bg/`, `cutouts/`, `portraits/`, `items/`, `override/`, and `asset-manifest.json`.
- **`src/core/`:** EventBus, SaveSystem, Settings, Localization, StoryState (flags and relationships), AudioSynth, Input.
- **`src/scenes/`:** Boot, Title, ChapterCard, World, Battle, Dialogue (overlay), Cutscene, Menu (party, gear, codex, map), Settings, Credits.
- **`src/world/`:** PlayerController, CharacterRig, Room and RoomLoader, Parallax, AreaLighting, Weather, Interactables (NPC, chest, Rosoar tree, ability gate, room transition), Camera.
- **`src/battle/`:** BattleSystem (timeline), actions and skills, statuses (Doom, Regenerate, ShadowForm, Armored, Blind, Fear, Heat), enemy AI, BattleUI, and WordBattle.
- **`src/story/`:** the parser, runtime and `pNN/vNN.story` files.
- **`src/data/`:** characters, skills, enemies, items, areas (room layouts as data), and codex.
- **`tests/`**.

## Milestones
Each milestone ends with a commit and a stop for the user to review.
- **M0: Setup.** Scaffold the project, run the asset pipeline (ask about installing `rembg`), extract the story, `git init`, and add a launch config.
- **M1: Engine vertical slice.** Movement feel, parallax, lighting and weather in one Glacia test room built from real art. One battle with the timeline, skills and statuses. Dialogue with the EN/Tanglish toggle. Save/load, menus and settings.
- **M2: Act I (Purpose 1)** fully playable, then review.
- **M3–M11: Acts II–X**, one per milestone, each reviewed. The ending and credits come in M11.
- **M12: Polish.** Balance pass, performance, accessibility review, optional Tauri desktop build.

## Verification
- `bun test` covers battle math and status rules (Doom timing, Vale regeneration versus fire, armour blocking Death Touch, Rewind), the parser, save round-trips, and the linter.
- `bun run lint:story` runs clean: every line has both EN and TA, and every asset, battle and flag reference resolves.
- Manual play in the browser pane (`preview_start` with `.claude/launch.json`) using the chapter-select debug jump:
  - play through each Venture of the act;
  - take screenshots of each area and battle;
  - check the console for errors;
  - check the frame rate (target 60 fps at 1280×720).
- Before sign-off on each act, check it against the story report for that Purpose: every Venture's key beats are present, and the mature-content rules above are applied.
