# Act I design: Purpose 1, "The world is cruel"

Earth, MIT Chromepet, 29 Sep to 3 Oct 2022. The story is a campus murder mystery, and it is quieter and more grounded than
the Glacia acts: nobody in it has a sword. So the act's "battles" are mostly **word battles** (the plan's
Persuade / Deceive / Endure against a Resolve bar), plus one real turn-based fight inside Ragul's anime daydream (V8).
The action comes from **stealth and chases**.

## Look (no Earth art exists)

The user's 67 images are all Glacia or other fantasy worlds; none shows Chennai. Earth areas therefore use
**code-painted backdrops** built with the same technique as the Glacia layers. These are layered skies, distant rooftops with water tanks and
coconut palms, campus blocks with lit windows, neem and copper-pod trees (the "yellow flowers" of V5) stamped from
soft sprites, and interiors painted as a wall, windows, a door and furniture silhouettes. Each Earth area has a hand-picked
palette (warm dawn, humid noon, gold evening, rain-blue night, fire-orange), so the rim-lit silhouettes, fog and
grading still match the rest of the game. When real Earth art is made, a file in `assets/override/bg/` replaces a painted
backdrop.

Terrain gets materials: asphalt road, grass verge, tiled floors, wooden floors. There is no snow cap on Earth.

## Areas (rooms)

| Room | Used in | Notes |
|---|---|---|
| `hostel_room` | V1, V2, V3 | Ragul and Nithish's room; bed, desk, laptop. Rest point: Ragul's bunk. |
| `hostel_road` | V1, V6, V10 | Boys' hostel, hostel store road, NRI hostel gate. Krishnaa blocks the main road in V1. |
| `cut_road` | V1, V11, V12 | Wall on one side, college on the other. The body, the red shirt, the standoff. |
| `mit_road` | V2, V4, V5, V11, V12 | The long road: Rajam Hall and its statue, library, IT department; yellow flowers fall. |
| `hangar_yard` | V9, V12 | Hangar 1, the rusty vehicle, old fighter planes, maintenance shed, banner, wall gap. |
| `humanities` | V10, V11, V12 | Science & Humanities building: stairs, the big door, the restroom. |
| `nri_hostel` | V10 | Burning corridor (fire escape). |
| `radha_nagar` | V6 | Market street, stalls, alleys, the bridge, bins. |
| `back_gate` | V6 | Back gate, the auto, the rainy road. |
| `dhana_house` | V7, V8, V9 | Hall, kitchen, her mother's locked room; the mirror and the bracelet shelf. |
| `police_station` | V7, V9 | Front desk, interrogation room, cell. |
| `daydream` | V8 | Dhanasree's hallway as Ragul imagines it (anime tint): the fantasy battles. |

Other places are cutscene backdrops only: the shed, the cafés, the mortuary, the hospital, the train, the warehouse
memory.

**Rest points.** There are no Red Rosoar trees on Earth. Rest points are quiet spots such as a hostel bunk, a bench under
the copper-pod tree, or a tea-stall bench. They behave exactly like the trees: rest, heal, save.

## Ventures

Each Venture is a script, `src/story/p01/vNN.story`, that starts at the label `start`. A script can move the player to a room
(`@room`), set the playable party (`@party`), set the objective (`@objective`), add clues (`@clue`) and start fights
(`@battle`, `@wordbattle`). Room triggers carry the Venture forward when the player reaches a place.

| V | Playable | Cinematic | Battles and set-pieces |
|---|---|---|---|
| 1 | Wake up; walk to class avoiding Krishnaa; the man on the road (choice: help / walk away, but the migraine wins) | Shed birthday plan, Dhanasree and the senior, Nithish's mother, the prank, Dharshna and Sneka, the flashmob breakdown and dance, fest cancelled | – |
| 2 | Leaving Rajam Hall | Rajesh and Pugazhendi; Ragul's anime panic; Dharshna's mantra; the café birthday and the bracelet; class | **Word battle: Nithish vs Krishnaa** |
| 3 | Nithish's snow dream (chase Janani into the dark); Ragul's dizzy walk to the restroom | Night talk; mortuary; Janani; the flashback with Janani (Memory Fragment); Dharshna's spark; "Daijobou"; Subramani | – |
| 4 | Investigate around the IT department (talk to classmates for clues) | Memorial; Dhanasree reveals Pugazh sir; Krishnaa and Rithvick; library, team name (choice), the magic-world wish, the red shirt | – |
| 5 | MIT road at dusk; slip out the back of Cheese N Freeze | Nithish's interview; Pranav (choice: step in / stay back, and Ragul grabs his arm either way); the accident | – |
| 6 | **Radha Nagar stealth chase** (hide, disguises); **rain chase** | Dharshna and Sneka; back gate; Nithish is caught; Arun sees the news | – |
| 7 | Dhanasree's house | Booking; "coward"; TV at 8:15 PM ("69 hours"); Arun's lie | **Word battle: Nithish vs the interrogator (Endure)** |
| 8 | – | Nagaraj's missing pistol; the mirror; the bracelet; the hospital (Pranav, Nelson); **the twist**: Ragul framed Nithish | **Ragul's daydream: 2 fights and a boss (the Captain)** |
| 9 | **Hangar 1 flashback**: find the gun, climb the wall gap with Ragul, block it | Nithish overhears; the lullaby memory; Dharshna and the lighter (cut to black); dosa | **Word battle: the gate guard** |
| 10 | **NRI hostel fire escape** (as Dharshna) | Arun; the restroom and her father's locket; the train promise; her mother (implied only); the gun lesson | – |
| 11 | Behind the bin (choice: stay / go to the police, and he goes); **chase: flee Nithish** | Ramanan collapses (implied); Dharshna and Dhanasree | **Word battle: talk Dharshna out (Persuade)** |
| 12 | Humanities hide; **plane-yard stealth, the oil-and-rope trap** (as Nithish) | The gunshot (cut away at impact); hands held; **the Snap** | **Boss word battle: Dhanasree vs Rajesh** |

There are eight battles in all: five word battles and three daydream fights. The two bosses are the Captain in the daydream and
Rajesh at the standoff.

## New systems

- **Word battles** (`battle/WordCore.ts`, `WordBattleScene`). You lower the opponent's **Resolve** to 0 while keeping your
  **Composure** above 0. The opponent takes a stance each round (for example Mocking, Pressing, Wavering, Afraid or Enraged)
  and shows it. Each of your moves works well or badly against a stance: Persuade, Deceive, Endure, and per-character moves
  such as Threaten (Dhanasree with the gun) or Comfort. Every move and stance has its own story line in both languages.
  Losing lets you retry at once; the story never branches on a loss.
- **Stealth**: guards patrol with a visible sight cone. You can hide behind bins, stalls, autos, planes and doors
  (press ↓ while in front of one). Disguises halve how far guards see. Being spotted sends you back to the section start.
- **Chases**: a pursuer runs after you; if it catches you, the chase restarts from its start.
- **Shove** (Nithish only): push crates. **Use**: interact with a place while carrying the right items (oil, rope).
- **Fire hazard** tiles and falling debris (hostel fire).
- **Case board** (menu): the clues gathered about the deaths, pinned as cards. After V8 the board shows the truth.
- **Objective line** in the HUD, and **party switching** per Venture (split POV).
- **Chapters** on the title screen: in this review build every Venture is unlocked, so each one can be replayed directly.

## Content handling

- Pranav's slur is cut; he "spits a filthy word at her".
- Vijayashree's crimes are only implied: "girls went missing", "she was doing something unforgivable", "you're next". The
  warehouse is shown as a cut to black on the gunshot.
- Dharshna's abuse is only her remembered scream, "let me go", then her father. The lighter scene cuts to black before
  it touches her skin, with a content note.
- Officer 3's death, Sneka's burns and the bodies are never shown. The screen cuts away at the moment of impact, and the fire is
  seen as smoke and a doorway.
- Profanity stays, under the profanity filter. The songs are replaced by original music: the flashmob beat, Dhanasree's
  dance and a hummed lullaby with no lyrics.
- Content notes are shown before V1 (suicidal thoughts), V3 (death, grief), V9 (self-harm), V10 (fire, death) and
  V12 (a shooting).
