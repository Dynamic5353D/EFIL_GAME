/**
 * Act I rooms: MIT Chromepet and around it, 29 Sep to 3 Oct 2022 (docs/act1.md, "Areas"). The
 * backdrops are painted in code (data/earthScenes.ts). Story beats are triggers and NPCs that point at
 * labels in src/story/p01/vNN.story; flags gate who is where in which Venture.
 */
import { loc } from '../core/Localization';
import { RoomBuilder, type RoomDef } from '../world/RoomDef';

const V = (n: number) => `p01/v${String(n).padStart(2, '0')}`;

const DAY = { brightness: 1.12, saturation: 1.12, contrast: 0.06 };
const INDOOR = { brightness: 0.98, saturation: 0.95, contrast: 0.06, tint: 0xffd9a8, tintAmount: 0.06 };

function finish(b: RoomBuilder, def: Omit<RoomDef, 'cols' | 'rows' | 'grid' | 'entities'>): RoomDef {
  return { ...def, cols: b.cols, rows: b.rows, grid: b.rows_(), entities: b.entities };
}

/** Ragul and Nithish's room in the boys' hostel. */
function hostelRoom(): RoomDef {
  const b = new RoomBuilder(36, 18);
  b.rect(0, 0, 2, 18).rect(34, 0, 2, 18);
  b.ground(2, 32, 15);
  b.rect(18, 10, 3, 1, '=');            // top of the bookshelf
  b.at(8, 14, { type: 'spawn', id: 'start' });
  b.at(30, 14, { type: 'spawn', id: 'door' });
  b.at(33, 14, { type: 'exit', id: 'out', to: 'hostel_road', entry: 'hostel', height: 5 });
  b.at(5, 14, { type: 'rest', id: 'ragul_bunk', visual: 'bed' });
  b.at(13, 14, { type: 'prop', visual: 'bed_sleeper', hideIf: 'v01_left_room' });
  b.at(13, 14, { type: 'prop', visual: 'bed', requires: 'v01_left_room' });
  b.at(13, 14, { type: 'use', id: 'look_nithish', items: [], script: V(1), label: 'look_nithish', prompt: loc('Look', 'Paaru'), unless: 'v01_left_room' });
  b.at(19, 14, { type: 'prop', visual: 'shelf' });
  b.at(19, 9, { type: 'pickup', id: 'p01_notebook', script: V(1), label: 'notebook', visual: 'fragment' });
  b.at(24, 14, { type: 'prop', visual: 'desk' });
  b.at(24, 14, { type: 'use', id: 'laptop', items: [], script: V(1), label: 'laptop', prompt: loc('Look', 'Paaru') });
  b.at(28, 14, { type: 'prop', visual: 'mirror' });
  b.at(31, 14, { type: 'prop', visual: 'door' });
  return finish(b, {
    id: 'hostel_room', name: loc('Hostel room 214', 'Hostel room 214'), area: 'mit',
    backdrop: 'gen:hostel_room', palette: 'gen:hostel_room', music: 'campus', ambient: 0xb8a890,
    grade: INDOOR, weather: ['dust'], interior: true, terrain: 'tile',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 0, y: 0, w: 4, h: 2 },
    variants: [{ flag: 'at_night', backdrop: 'gen:hostel_room_night', music: 'campus_night', ambient: 0x7a88a8 }],
  });
}

/** The road from the boys' hostel toward the college, with a wall-top path above it. */
function hostelRoad(): RoomDef {
  const b = new RoomBuilder(124, 22);
  b.ground(0, 124, 18);
  b.ground(40, 3, 16);                   // planter step
  b.ground(43, 3, 14);                   // higher step
  b.rect(46, 12, 28, 1, '=');            // wall-top walkway over the road
  b.rect(96, 14, 5, 1, '=');             // bus-stop roof
  b.at(3, 17, { type: 'spawn', id: 'hostel' });
  b.at(0, 17, { type: 'exit', id: 'to_room', to: 'hostel_room', entry: 'door', height: 6 });
  b.at(120, 17, { type: 'spawn', id: 'east' });
  b.at(123, 17, { type: 'exit', id: 'to_cut', to: 'cut_road', entry: 'west', height: 6 });
  b.at(6, 17, { type: 'sign', text: loc('Boys\' Hostel', 'Boys Hostel') });
  b.at(14, 17, { type: 'pickup', id: 'p01_fest_poster', script: V(1), label: 'poster', visual: 'fragment' });
  b.at(24, 17, { type: 'prop', visual: 'lamp' });
  b.at(34, 17, { type: 'section', id: 'before_krishnaa' });
  b.at(30, 17, { type: 'trigger', id: 'see_krishnaa', script: V(1), label: 'see_krishnaa', requires: 'v01_awake', unless: 'v01_saw_krishnaa', height: 6 });
  b.at(52, 17, { type: 'hide', id: 'road_bin', visual: 'bin' });
  b.at(62, 17, { type: 'guard', id: 'krishnaa', rig: 'krishnaa', patrol: 0, range: 9, facing: -1, requires: 'v01_saw_krishnaa', hideIf: 'v01_passed_krishnaa', script: V(1), fail: 'krishnaa_sees' });
  b.at(65, 17, { type: 'npc', id: 'kfriend', speaker: 'kfriend', rig: 'guy', radius: 0, face: 1, requires: 'v01_saw_krishnaa', hideIf: 'v01_passed_krishnaa' });
  b.at(80, 17, { type: 'section', id: 'after_krishnaa' });
  b.at(80, 17, { type: 'trigger', id: 'passed_krishnaa', script: V(1), label: 'passed_krishnaa', requires: 'v01_saw_krishnaa', unless: 'v01_passed_krishnaa', height: 8 });
  b.at(84, 17, { type: 'prop', visual: 'lamp' });
  b.at(98, 17, { type: 'prop', visual: 'bench' });
  b.at(98, 13, { type: 'pickup', id: 'p01_airpods', script: V(1), label: 'airpods', visual: 'fragment' });
  b.at(104, 17, { type: 'trigger', id: 'monologue', script: V(1), label: 'monologue', requires: 'v01_passed_krishnaa', unless: 'v01_monologue', height: 8 });
  b.at(110, 17, { type: 'prop', visual: 'lamp' });
  // Venture 11: the hostel gate during the fire. The bin, the jeep, Ramanan; then Nithish gives chase (to the right).
  b.at(30, 17, { type: 'spawn', id: 'gate' });
  b.at(24, 17, { type: 'hide', id: 'gate_bin', visual: 'bin' });
  b.at(14, 17, { type: 'prop', visual: 'jeep', requires: 'v11_gate', hideIf: 'v11_done' });
  b.at(18, 17, { type: 'npc', id: 'ramanan_v11', speaker: 'ramanan', radius: 0, face: 1, requires: 'v11_gate', hideIf: 'v11_ramanan_down' });
  b.at(18, 17, { type: 'npc', id: 'ramanan_down', speaker: 'ramanan', radius: 0, pose: 'ko', requires: 'v11_ramanan_down', hideIf: 'v11_done' });
  b.at(12, 17, { type: 'npc', id: 'nithish_jeep', speaker: 'nithish', radius: 0, face: 1, cuffed: true, requires: 'v11_gate', hideIf: 'v11_chase' });
  b.at(26, 17, { type: 'trigger', id: 'v11_bin', script: V(11), label: 'bin', requires: 'v11_gate', unless: 'v11_went_out', height: 6 });
  b.at(13, 17, { type: 'chaser', id: 'nithish_chase', rig: 'nithish', speed: 300, delay: 1.0, requires: 'v11_chase', unless: 'v11_done' });
  b.at(21, 17, { type: 'section', id: 'chase_start' });
  b.at(118, 17, { type: 'trigger', id: 'chase_meanwhile', script: V(11), label: 'meanwhile', requires: 'v11_chase', unless: 'v11_door_open', height: 8 });
  // Venture 3: the veranda at night, the restroom and Subramani.
  b.at(8, 17, { type: 'spawn', id: 'veranda' });
  b.at(10, 17, { type: 'npc', id: 'nithish_veranda', speaker: 'nithish', radius: 0, pose: 'sit', requires: 'v03_veranda', hideIf: 'v03_done' });
  b.at(20, 17, { type: 'prop', visual: 'door', requires: 'v03_veranda', hideIf: 'v03_done' });
  b.at(20, 17, { type: 'trigger', id: 'restroom', script: V(3), label: 'restroom', requires: 'v03_veranda', unless: 'v03_vomited', height: 6 });
  b.at(15, 17, { type: 'npc', id: 'subramani', speaker: 'subramani', radius: 90, script: V(3), label: 'subramani', requires: 'v03_vomited', once: 'v03_touched', hideIf: 'v03_done' });
  b.at(9, 17, { type: 'trigger', id: 'back_to_veranda', script: V(3), label: 'veranda_talk', requires: 'v03_touched', unless: 'v03_done', height: 6 });
  return finish(b, {
    id: 'hostel_road', name: loc('Hostel road', 'Hostel road'), area: 'mit',
    backdrop: 'gen:hostel_morning', palette: 'gen:hostel_morning', music: 'campus', ambient: 0xd8c8a8,
    grade: DAY, weather: ['dust'], terrain: 'asphalt',
    scenery: { trees: 'neem', density: 1, ridge: false, icicles: false },
    mapPos: { x: 4, y: 0, w: 6, h: 2 },
    variants: [
      { flag: 'hostel_fire', backdrop: 'gen:campus_cloudy', weather: ['smoke', 'embers'], music: 'fire', ambient: 0xd8a080,
        grade: { brightness: 0.95, saturation: 1, contrast: 0.08, tint: 0xff9a5a, tintAmount: 0.1 } },
      { flag: 'at_night', backdrop: 'gen:campus_night', music: 'campus_night', ambient: 0x7a88b0 },
    ],
  });
}

/** The cut road: a wall on one side, the college on the other. Where the first body was found. */
function cutRoad(): RoomDef {
  const b = new RoomBuilder(110, 22);
  b.ground(0, 110, 18);
  b.ground(20, 5, 17);                   // kerb
  b.rect(72, 14, 6, 1, '=');             // low wall top
  b.at(2, 17, { type: 'spawn', id: 'west' });
  b.at(0, 17, { type: 'exit', id: 'to_hostel', to: 'hostel_road', entry: 'east', height: 6 });
  b.at(106, 17, { type: 'spawn', id: 'east' });
  b.at(109, 17, { type: 'exit', id: 'to_mit', to: 'mit_road', entry: 'west', height: 6 });
  b.at(10, 17, { type: 'sign', text: loc('Cut road', 'Cut road') });
  b.at(44, 17, { type: 'spawn', id: 'body' });
  b.at(56, 17, { type: 'spawn', id: 'standoff' });
  // Venture 1: the man on the road, the red shirt in the distance.
  b.at(46, 17, { type: 'prop', visual: 'lying', requires: 'v01_left_room', hideIf: 'v01_passed_body' });
  b.at(38, 17, { type: 'trigger', id: 'man', script: V(1), label: 'man', requires: 'v01_monologue', unless: 'v01_passed_body', height: 6 });
  b.at(92, 17, { type: 'npc', id: 'red_shirt', speaker: 'guy', rig: 'red_shirt', radius: 0, face: 1, requires: 'v01_monologue', hideIf: 'v01_passed_body' });
  // Venture 11: the chase ends where the first body lay. Venture 12: the standoff.
  b.at(9, 17, { type: 'spawn', id: 'chase_in' });
  b.at(1, 17, { type: 'chaser', id: 'nithish_chase_cut', rig: 'nithish', speed: 300, delay: 1.2, requires: 'v11_chase', unless: 'v11_done' });
  b.at(9, 17, { type: 'section', id: 'cut_chase' });
  b.at(44, 17, { type: 'trigger', id: 'nithish_trips', script: V(11), label: 'trips', requires: 'v11_chase', unless: 'v11_done', height: 8 });
  b.at(42, 17, { type: 'npc', id: 'nithish_down', speaker: 'nithish', radius: 0, pose: 'kneel', cuffed: true, requires: 'v11_done', hideIf: 'v12_fled' });
  b.at(36, 17, { type: 'npc', id: 'rajesh_standoff', speaker: 'rajesh', radius: 0, face: 1, requires: 'v11_done', hideIf: 'v12_fled' });
  b.at(60, 17, { type: 'npc', id: 'ragul_standoff', speaker: 'ragul', radius: 0, face: -1, requires: 'v12_standoff', hideIf: 'v12_fled' });
  // End of V11 (you are Ragul): Dhanasree arrives with the gun. In V12 you are her.
  b.at(52, 17, { type: 'npc', id: 'dhanasree_gun', speaker: 'dhanasree', radius: 0, face: -1, pose: 'point', requires: 'v11_done', hideIf: 'v12_standoff' });
  b.at(55, 17, { type: 'npc', id: 'dharshna_standoff', speaker: 'dharshna', radius: 0, face: -1, requires: 'v11_done', hideIf: 'v12_fled' });
  // After the first death the spot stays taped off for a few days.
  b.at(46, 17, { type: 'prop', visual: 'tape', requires: 'v01_fest_cancelled', hideIf: 'v06_started' });
  b.at(66, 17, { type: 'prop', visual: 'lamp' });
  b.at(86, 17, { type: 'prop', visual: 'lamp' });
  b.at(75, 13, { type: 'pickup', id: 'p01_wall_note', script: V(4), label: 'wall_note', visual: 'fragment' });
  return finish(b, {
    id: 'cut_road', name: loc('The cut road', 'Cut road'), area: 'mit',
    backdrop: 'gen:campus_cloudy', palette: 'gen:campus_cloudy', music: 'mystery', ambient: 0xc8c8c0,
    grade: { brightness: 0.98, saturation: 0.92, contrast: 0.06 }, weather: ['dust'], terrain: 'asphalt',
    scenery: { trees: 'neem', density: 0.8, ridge: false, icicles: false },
    mapPos: { x: 10, y: 0, w: 5, h: 2 },
  });
}

/** The long MIT road: Rajam Hall and its statue, the library, the IT department. */
function mitRoad(): RoomDef {
  const b = new RoomBuilder(150, 22);
  b.ground(0, 150, 18);
  b.ground(24, 12, 17);                  // Rajam Hall steps
  b.ground(27, 6, 16);
  b.rect(52, 13, 6, 1, '=');             // library portico
  b.rect(112, 14, 8, 1, '=');            // IT department ledge
  b.rect(122, 11, 4, 1, '=');
  b.at(2, 17, { type: 'spawn', id: 'west' });
  b.at(0, 17, { type: 'exit', id: 'to_cut', to: 'cut_road', entry: 'east', height: 6 });
  b.at(146, 17, { type: 'spawn', id: 'east' });
  b.at(149, 17, { type: 'exit', id: 'to_hangar', to: 'hangar_yard', entry: 'west', height: 6 });
  b.at(30, 15, { type: 'spawn', id: 'rajam' });
  b.at(30, 15, { type: 'prop', visual: 'statue' });
  b.at(24, 16, { type: 'sign', text: loc('Rajam Hall', 'Rajam Hall') });
  b.at(55, 17, { type: 'sign', text: loc('Library', 'Library') });
  b.at(108, 17, { type: 'sign', text: loc('Dept. of Information Technology', 'IT Department') });
  b.at(70, 17, { type: 'spawn', id: 'crowd' });
  b.at(115, 17, { type: 'spawn', id: 'it' });
  for (const x of [16, 44, 64, 86, 100, 130]) b.at(x, 17, { type: 'prop', visual: 'lamp' });
  b.at(38, 17, { type: 'rest', id: 'copperpod_bench', visual: 'bench' });
  b.at(124, 10, { type: 'pickup', id: 'p01_yellow_flower', script: V(4), label: 'yellow_flower', visual: 'fragment' });
  // Venture 1: the flashmob.
  for (const [x, rig] of [[62, 'dance_guy'], [65, 'dance_girl'], [68, 'dance_guy'], [71, 'dance_girl'], [74, 'dance_guy']] as const) {
    b.at(x, 17, { type: 'npc', id: `dancer_${x}`, speaker: 'guy', rig, radius: 0, face: -1, pose: 'dance', requires: 'v01_flashmob', hideIf: 'v01_dhana_dance' });
  }
  b.at(68, 17, { type: 'npc', id: 'dhana_dance', speaker: 'dhanasree', radius: 0, face: -1, pose: 'dance', requires: 'v01_dhana_dance', hideIf: 'v01_fest_cancelled' });
  b.at(77, 17, { type: 'npc', id: 'senior_mic', speaker: 'senior', radius: 0, face: -1, requires: 'v01_dhana_dance', hideIf: 'v01_fest_cancelled' });
  b.at(62, 17, { type: 'trigger', id: 'dance_end', script: V(1), label: 'dance_end', requires: 'v01_time_stopped', unless: 'v01_fest_cancelled', height: 8 });
  for (const [x, rig] of [[52, 'girl'], [55, 'guy'], [58, 'sneya'], [79, 'guy'], [82, 'girl'], [85, 'kabi']] as const) {
    b.at(x, 17, { type: 'npc', id: `crowd_${x}`, speaker: 'guy', rig, radius: 0, requires: 'v01_flashmob', hideIf: 'v01_fest_cancelled' });
  }
  // Venture 12: Nithish reaches Rajam Hall.
  b.at(40, 17, { type: 'trigger', id: 'rajam_final', script: V(12), label: 'rajam', requires: 'v12_slipped', unless: 'v12_snap', height: 8 });
  // Venture 5: the walk at dusk, Pranav and Krishnaa on the bike.
  b.at(84, 17, { type: 'trigger', id: 'pranav_call', script: V(5), label: 'pranav_call', requires: 'v05_walk', unless: 'v05_pranav_called', height: 6 });
  b.at(98, 17, { type: 'prop', visual: 'bike', requires: 'v05_pranav_called', hideIf: 'v05_left_pranav', flip: true });
  b.at(96, 17, { type: 'npc', id: 'pranav_v5', speaker: 'pranav', radius: 0, face: -1, requires: 'v05_pranav_called', hideIf: 'v05_left_pranav' });
  b.at(100, 17, { type: 'npc', id: 'krishnaa_v5', speaker: 'krishnaa', radius: 0, face: -1, requires: 'v05_pranav_called', hideIf: 'v05_left_pranav' });
  b.at(92, 17, { type: 'trigger', id: 'pranav', script: V(5), label: 'pranav', requires: 'v05_pranav_called', unless: 'v05_left_pranav', height: 6 });
  b.at(144, 17, { type: 'trigger', id: 'to_cafe', script: V(5), label: 'to_cafe', requires: 'v05_left_pranav', unless: 'v05_at_cafe', height: 6 });
  // Venture 4: asking around near the IT department.
  const ask = (x: number, id: string, speaker: string, label: string, face: 1 | -1 = -1) =>
    b.at(x, 17, { type: 'npc', id, speaker, radius: 0, talk: true, face, script: V(4), label, requires: 'v04_investigate', hideIf: 'v04_done' });
  ask(104, 'rawin_v4', 'rawin', 'ask_rawin');
  ask(118, 'sneya_v4', 'sneya', 'ask_sneya', 1);
  ask(128, 'security_v4', 'security', 'ask_security');
  ask(136, 'mahil_v4', 'mahil', 'ask_mahil');
  b.at(96, 17, { type: 'npc', id: 'dhana_v4', speaker: 'dhanasree', radius: 0, talk: true, face: 1, script: V(4), label: 'ask_dhanasree', requires: 'v04_investigate', hideIf: 'v04_done' });
  // Venture 2: leaving Rajam Hall, Krishnaa waiting outside.
  b.at(44, 17, { type: 'npc', id: 'krishnaa_v2', speaker: 'krishnaa', radius: 0, face: -1, requires: 'v02_leaving', hideIf: 'v02_done' });
  b.at(47, 17, { type: 'npc', id: 'kabi_v2', speaker: 'kabi', radius: 0, face: -1, requires: 'v02_leaving', hideIf: 'v02_done' });
  b.at(41, 17, { type: 'trigger', id: 'trip', script: V(2), label: 'trip', requires: 'v02_leaving', unless: 'v02_done', height: 6 });
  b.at(50, 17, { type: 'trigger', id: 'flashmob', script: V(1), label: 'flashmob', requires: 'v01_flashmob', unless: 'v01_dhana_dance', height: 8 });
  return finish(b, {
    id: 'mit_road', name: loc('MIT road', 'MIT road'), area: 'mit',
    backdrop: 'gen:campus_noon', palette: 'gen:campus_noon', music: 'campus', ambient: 0xe0d8c0,
    grade: DAY, weather: ['petals'], terrain: 'asphalt',
    scenery: { trees: 'copperpod', density: 1.1, ridge: false, icicles: false },
    mapPos: { x: 15, y: 0, w: 7, h: 2 },
    variants: [
      { flag: 'mit_dusk', backdrop: 'gen:campus_dusk', music: 'mystery', ambient: 0xd8a070,
        grade: { brightness: 0.96, saturation: 1.05, contrast: 0.07, tint: 0xffa860, tintAmount: 0.08 } },
      { flag: 'mit_cloudy', backdrop: 'gen:campus_cloudy', music: 'standoff', ambient: 0xb8b8b8, weather: ['petals', 'dust'],
        grade: { brightness: 0.94, saturation: 0.9, contrast: 0.08 } },
    ],
  });
}

/** Nithish's dream (V3): a snowy place he has never seen, which is Glacia. Janani runs into a darkness. */
function snowDream(): RoomDef {
  const b = new RoomBuilder(96, 22);
  b.ground(0, 96, 18);
  b.ground(22, 3, 16).ground(25, 2, 17);  // snow drifts to jump
  b.ground(40, 4, 15).ground(44, 2, 16);
  b.ground(58, 3, 16);
  b.rect(95, 0, 1, 22);
  b.at(4, 17, { type: 'spawn', id: 'start' });
  b.at(12, 17, { type: 'npc', id: 'janani_dream', speaker: 'janani', radius: 0, face: 1, walkTo: 86, walkSpeed: 330, walkFlag: 'v03_janani_runs' });
  b.at(70, 17, { type: 'npc', id: 'dream_girl', speaker: 'girl', rig: 'girl', radius: 0, face: 1, pose: 'ko', requires: 'v03_janani_runs' });
  b.at(88, 17, { type: 'prop', visual: 'abyss', scale: 1.2, front: true });
  b.at(8, 17, { type: 'trigger', id: 'dream_start', script: V(3), label: 'dream_run', unless: 'v03_janani_runs', height: 8 });
  b.at(72, 17, { type: 'trigger', id: 'dream_end', script: V(3), label: 'dream_end', requires: 'v03_janani_runs', height: 8 });
  for (const [x, c] of [[16, 0x9fd8ff], [34, 0xc8b8ff], [52, 0x9fd8ff]] as const) b.at(x, 17, { type: 'crystal', color: c });
  return finish(b, {
    id: 'snow_dream', name: loc('A dream of snow', 'Pani kanavu'), area: 'mit',
    backdrop: 'frozen_pond', palette: 'frozen_pond', music: 'lullaby', ambient: 0x9aa8c8,
    grade: { brightness: 1.05, saturation: 0.55, contrast: 0.04, tint: 0xd8e8ff, tintAmount: 0.12 },
    weather: ['snow', 'mist'], terrain: 'snow',
    scenery: { trees: 'pluffine', density: 0.8, ridge: true, icicles: false },
    mapPos: { x: 0, y: 3, w: 4, h: 1 },
  });
}

/** Cheese N Freeze (V5): yellow lights, plastic flowers. Police at the front; out through the back. */
function cheeseFreeze(): RoomDef {
  const b = new RoomBuilder(44, 18);
  b.rect(0, 0, 2, 18).rect(42, 0, 2, 18);
  b.ground(2, 40, 15);
  b.ground(11, 3, 14);                   // the counter
  b.at(24, 14, { type: 'spawn', id: 'table' });
  b.at(4, 14, { type: 'prop', visual: 'door' });
  b.at(39, 14, { type: 'prop', visual: 'door' });
  b.at(21, 14, { type: 'hide', id: 'table_a', visual: 'desk' });
  b.at(16, 14, { type: 'hide', id: 'shelf_b', visual: 'shelf' });
  b.at(28, 14, { type: 'prop', visual: 'desk' });
  b.at(33, 14, { type: 'prop', visual: 'chair' });
  b.at(24, 14, { type: 'section', id: 'cafe_start' });
  b.at(33, 14, { type: 'guard', id: 'cafe_police', rig: 'police', patrol: 6, range: 7, facing: -1, speed: 55, requires: 'v05_police_in', hideIf: 'v05_escaped' });
  b.at(4, 14, { type: 'trigger', id: 'back_door', script: V(5), label: 'back_door', requires: 'v05_police_in', unless: 'v05_escaped', height: 5 });
  return finish(b, {
    id: 'cheese_freeze', name: loc('Cheese N Freeze', 'Cheese N Freeze'), area: 'mit',
    backdrop: 'gen:cheese_freeze', palette: 'gen:cheese_freeze', music: 'stealth', ambient: 0xe8c890,
    grade: INDOOR, weather: [], interior: true, terrain: 'tile',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 22, y: 0, w: 3, h: 2 },
  });
}

/** Radha Nagar market (V6): the crowd, an alley between buildings, the market street, the bridge. */
function radhaNagar(): RoomDef {
  const b = new RoomBuilder(150, 22);
  b.ground(0, 150, 18);
  // The alley: rubbish, crates and a low wall to climb.
  b.ground(44, 2, 17).ground(47, 3, 16).ground(52, 2, 17).ground(56, 4, 15);
  b.rect(62, 13, 5, 1, '=');
  b.ground(64, 3, 16);
  // Market street stalls with awnings to stand on.
  b.rect(86, 13, 5, 1, '=');
  b.rect(104, 13, 5, 1, '=');
  // The bridge ramp.
  b.ground(124, 4, 17).ground(128, 12, 16).ground(140, 4, 17);
  b.at(3, 17, { type: 'spawn', id: 'start' });
  b.at(8, 17, { type: 'sign', text: loc('Radha Nagar', 'Radha Nagar') });
  for (const [x, rig] of [[14, 'guy'], [18, 'girl'], [22, 'vendor'], [27, 'guy'], [31, 'girl']] as const) {
    b.at(x, 17, { type: 'npc', id: `rn_crowd_${x}`, speaker: 'guy', rig, radius: 0 });
  }
  b.at(20, 17, { type: 'prop', visual: 'stall' });
  b.at(34, 17, { type: 'prop', visual: 'stall', flip: true });
  b.at(10, 17, { type: 'trigger', id: 'phones', script: V(6), label: 'phones', unless: 'v06_phones', height: 6 });
  b.at(38, 17, { type: 'section', id: 'alley' });
  b.at(38, 17, { type: 'trigger', id: 'followed', script: V(6), label: 'followed', requires: 'v06_phones', unless: 'v06_alley', height: 6 });
  b.at(44, 16, { type: 'prop', visual: 'bin' });
  b.at(52, 16, { type: 'prop', visual: 'crate' });
  // The market street: stalls to hide behind, a scarf stall, two plain-clothes policemen.
  b.at(72, 17, { type: 'section', id: 'market' });
  b.at(72, 17, { type: 'trigger', id: 'market', script: V(6), label: 'market', requires: 'v06_alley', unless: 'v06_market', height: 8 });
  b.at(76, 17, { type: 'use', id: 'scarf_stall', items: [], script: V(6), label: 'disguise', prompt: loc('Grab a scarf', 'Scarf edu'), requires: 'v06_market', unless: 'disguised' });
  b.at(76, 17, { type: 'prop', visual: 'stall' });
  b.at(88, 17, { type: 'hide', id: 'stall_a', visual: 'stall' });
  b.at(97, 17, { type: 'hide', id: 'bin_a', visual: 'bin' });
  b.at(106, 17, { type: 'hide', id: 'stall_b', visual: 'stall' });
  b.at(94, 17, { type: 'guard', id: 'mufti_a', rig: 'mufti', patrol: 4, range: 8, facing: -1, speed: 60, requires: 'v06_market', hideIf: 'v06_run' });
  b.at(112, 17, { type: 'guard', id: 'mufti_b', rig: 'mufti', patrol: 3, range: 8, facing: -1, speed: 50, requires: 'v06_market', hideIf: 'v06_run' });
  b.at(116, 17, { type: 'npc', id: 'vendor_v6', speaker: 'vendor', radius: 0, face: -1 });
  b.at(118, 17, { type: 'trigger', id: 'vendor', script: V(6), label: 'vendor', requires: 'v06_market', unless: 'v06_run', height: 8 });
  b.at(118, 17, { type: 'section', id: 'run' });
  b.at(114, 17, { type: 'chaser', id: 'cop3', rig: 'mufti', speed: 380, delay: 0.8, requires: 'v06_run', unless: 'v06_hidden' });
  b.at(134, 15, { type: 'sign', text: loc('Bridge', 'Palam') });
  b.at(146, 17, { type: 'prop', visual: 'bin' });
  b.at(147, 17, { type: 'trigger', id: 'bins', script: V(6), label: 'bins', requires: 'v06_run', unless: 'v06_hidden', height: 8 });
  for (const x of [26, 62, 82, 100, 122]) b.at(x, 17, { type: 'prop', visual: 'lamp' });
  return finish(b, {
    id: 'radha_nagar', name: loc('Radha Nagar', 'Radha Nagar'), area: 'mit',
    backdrop: 'gen:market_evening', palette: 'gen:market_evening', music: 'stealth', ambient: 0xe0a070,
    grade: { brightness: 1.05, saturation: 1.1, contrast: 0.06, tint: 0xffa860, tintAmount: 0.06 }, weather: ['dust'], terrain: 'asphalt',
    scenery: { trees: 'palm', density: 0.6, ridge: false, icicles: false },
    mapPos: { x: 22, y: 2, w: 7, h: 2 },
  });
}

/** Outside the MIT back gate in the rain (V6): the gate, the auto, the slippery road away from it. */
function backGate(): RoomDef {
  const b = new RoomBuilder(120, 22);
  b.ground(0, 120, 18);
  b.ground(62, 6, 17);
  b.rect(92, 14, 5, 1, '=');
  b.at(48, 17, { type: 'spawn', id: 'start' });
  b.at(24, 17, { type: 'prop', visual: 'gate' });
  b.at(20, 17, { type: 'sign', text: loc('MIT back gate', 'MIT back gate') });
  b.at(29, 17, { type: 'npc', id: 'gate_police', speaker: 'police', radius: 0, face: 1, hideIf: 'v06_rain_run' });
  b.at(32, 17, { type: 'npc', id: 'gate_security', speaker: 'security', radius: 0, face: -1, hideIf: 'v06_rain_run' });
  b.at(38, 17, { type: 'hide', id: 'auto', visual: 'auto' });
  b.at(96, 17, { type: 'npc', id: 'dharshna_walk', speaker: 'dharshna', radius: 0, face: -1, walkTo: 46, walkSpeed: 90, walkFlag: 'v06_dharshna_near', hideIf: 'v06_nithish_fell' });
  b.at(42, 17, { type: 'trigger', id: 'back_gate', script: V(6), label: 'back_gate', unless: 'v06_rain_run', height: 6 });
  b.at(42, 17, { type: 'section', id: 'rain_start' });
  b.at(30, 17, { type: 'chaser', id: 'rajesh_chase', rig: 'rajesh', speed: 330, delay: 1.2, requires: 'v06_rain_run', unless: 'v06_nithish_fell' });
  b.at(82, 17, { type: 'trigger', id: 'fall', script: V(6), label: 'fall', requires: 'v06_rain_run', unless: 'v06_nithish_fell', height: 8 });
  b.at(116, 17, { type: 'trigger', id: 'escaped', script: V(6), label: 'escaped', requires: 'v06_nithish_fell', unless: 'v06_done', height: 8 });
  for (const x of [8, 52, 74, 104]) b.at(x, 17, { type: 'prop', visual: 'lamp' });
  return finish(b, {
    id: 'back_gate', name: loc('MIT back gate', 'MIT back gate'), area: 'mit',
    backdrop: 'gen:rain_night', palette: 'gen:rain_night', music: 'chase', ambient: 0x6a7a98,
    grade: { brightness: 0.95, saturation: 0.9, contrast: 0.08, tint: 0x8aa8d8, tintAmount: 0.08 }, weather: ['rain', 'mist'], terrain: 'asphalt',
    scenery: { trees: 'neem', density: 0.8, ridge: false, icicles: false },
    mapPos: { x: 29, y: 2, w: 5, h: 2 },
  });
}

/** Dhanasree's house (V7-V9): the hall and TV, the kitchen, her mother's locked room. */
function dhanaHouse(): RoomDef {
  const b = new RoomBuilder(50, 18);
  b.rect(0, 0, 2, 18).rect(48, 0, 2, 18);
  b.ground(2, 46, 15);
  b.rect(19, 10, 4, 1, '=');             // loft shelf above the kitchen
  b.rect(30, 3, 1, 9);                   // wall between the hall and her mother's room (a doorway below)
  b.at(4, 14, { type: 'spawn', id: 'door' });
  b.at(12, 14, { type: 'spawn', id: 'hall' });
  b.at(38, 14, { type: 'spawn', id: 'mother_room' });
  b.at(3, 14, { type: 'prop', visual: 'door' });
  b.at(9, 14, { type: 'prop', visual: 'bench' });
  b.at(14, 14, { type: 'prop', visual: 'tv' });
  b.at(14, 14, { type: 'use', id: 'tv', items: [], script: V(7), label: 'tv', prompt: loc('Switch on the TV', 'TV podu'), requires: 'v07_washed', unless: 'v07_tv' });
  b.at(21, 14, { type: 'prop', visual: 'desk' });
  b.at(21, 14, { type: 'use', id: 'kitchen', items: [], script: V(7), label: 'kitchen', prompt: loc('Wash your hands', 'Kai kazhuvu'), requires: 'v07_house', unless: 'v07_washed' });
  b.at(20, 9, { type: 'pickup', id: 'p01_family_photo', script: V(7), label: 'family_photo', visual: 'fragment' });
  b.at(26, 14, { type: 'prop', visual: 'shelf' });
  b.at(31, 14, { type: 'prop', visual: 'door' });
  b.at(36, 14, { type: 'rest', id: 'mother_bed', visual: 'bed' });
  b.at(41, 14, { type: 'prop', visual: 'mirror', hideIf: 'v08_house' });
  b.at(45, 14, { type: 'prop', visual: 'shelf' });
  b.at(45, 14, { type: 'use', id: 'gun_shelf', items: [], script: V(9), label: 'shelf', prompt: loc('Open the shelf', 'Shelf-a thira'), requires: 'v09_house', unless: 'v09_gun' });
  return finish(b, {
    id: 'dhana_house', name: loc('Dhanasree\'s house', 'Dhanasree veedu'), area: 'mit',
    backdrop: 'gen:house_night', palette: 'gen:house_night', music: 'campus_night', ambient: 0xd8b888,
    grade: INDOOR, weather: ['dust'], interior: true, terrain: 'wood',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 0, y: 5, w: 4, h: 2 },
    variants: [{ flag: 'house_day', backdrop: 'gen:house_day', music: 'mystery', ambient: 0xe8d8c0 }],
  });
}

/** Ragul's daydream (V8): Dhanasree's hallway as an anime set, soldiers with glowing blue eyes. */
function daydream(): RoomDef {
  const b = new RoomBuilder(80, 18);
  b.rect(0, 0, 2, 18).rect(78, 0, 2, 18);
  b.ground(2, 76, 15);
  b.ground(34, 4, 14).ground(38, 4, 13).ground(42, 4, 12);   // the stairs
  b.ground(46, 32, 12);
  b.rect(24, 10, 4, 1, '=');
  b.at(5, 14, { type: 'spawn', id: 'start' });
  b.at(4, 14, { type: 'npc', id: 'dream_dhana', speaker: 'dhanasree', radius: 0, face: 1, hideIf: 'v08_dream_done' });
  b.at(8, 14, { type: 'trigger', id: 'dream_start', script: V(8), label: 'dream_start', unless: 'v08_dream_started', height: 6 });
  b.at(20, 14, { type: 'enemy', id: 'dream_pair', enemy: 'dream_soldier', battle: 'dream_hallway', patrol: 3 });
  b.at(52, 11, { type: 'enemy', id: 'dream_trio', enemy: 'dream_soldier', battle: 'dream_stairs', patrol: 3 });
  b.at(70, 11, { type: 'npc', id: 'captain', speaker: 'captain', rig: 'captain', radius: 0, face: -1, hideIf: 'v08_dream_done' });
  b.at(64, 11, { type: 'trigger', id: 'captain_fight', script: V(8), label: 'captain', unless: 'v08_dream_done', height: 6 });
  b.at(26, 9, { type: 'pickup', id: 'p01_hero_pose', script: V(8), label: 'hero_pose', visual: 'fragment' });
  return finish(b, {
    id: 'daydream', name: loc('Superhero Ragul', 'Superhero Ragul'), area: 'mit',
    backdrop: 'gen:daydream', palette: 'gen:daydream', music: 'daydream', ambient: 0xd8a8ff,
    grade: { brightness: 1.1, saturation: 1.35, contrast: 0.1, tint: 0xff7ad8, tintAmount: 0.1 }, weather: ['motes'], interior: true, terrain: 'wood',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 4, y: 5, w: 4, h: 2 },
  });
}

/** Hangar 1 and the plane yard (V9 flashback, V12): the rusty vehicle, old fighter planes, the maintenance shed, the wall gap. */
function hangarYard(): RoomDef {
  const b = new RoomBuilder(132, 22);
  b.ground(0, 132, 18);
  b.ground(116, 2, 15);                  // crates stacked below the gap
  b.rect(120, 3, 2, 15);                 // the wall...
  b.rect(120, 9, 2, 3, '.');             // ...with a gap in it
  b.ground(124, 2, 15);                  // steps back up on the far side
  b.at(3, 17, { type: 'spawn', id: 'west' });
  b.at(0, 17, { type: 'exit', id: 'to_mit', to: 'mit_road', entry: 'east', height: 6 });
  b.at(127, 17, { type: 'spawn', id: 'far_side' });
  b.at(8, 17, { type: 'sign', text: loc('Hangar 1', 'Hangar 1') });
  b.at(30, 17, { type: 'prop', visual: 'jeep' });
  b.at(30, 17, { type: 'use', id: 'rusty_vehicle', items: [], script: V(9), label: 'jeep', prompt: loc('Search the rusty vehicle', 'Thuru vandiya thedu'), requires: 'flashback', unless: 'v09_gun_found' });
  b.at(52, 17, { type: 'hide', id: 'plane_a', visual: 'plane' });
  b.at(70, 17, { type: 'hide', id: 'plane_b', visual: 'plane' });
  b.at(86, 17, { type: 'hide', id: 'banner', visual: 'banner' });
  b.at(101, 17, { type: 'prop', visual: 'shed' });
  b.at(4, 17, { type: 'chaser', id: 'hangar_cop', rig: 'police', speed: 300, delay: 1.5, requires: 'v09_gun_found', unless: 'v09_wall' });
  b.at(121, 11, { type: 'trigger', id: 'wall_gap', script: V(9), label: 'wall_gap', requires: 'v09_gun_found', unless: 'v09_wall', height: 3 });
  b.at(28, 17, { type: 'section', id: 'jeep' });
  // Venture 12: the plane yard as Nithish.
  b.at(68, 17, { type: 'spawn', id: 'yard' });
  b.at(68, 17, { type: 'section', id: 'yard' });
  b.at(56, 17, { type: 'guard', id: 'officer4', rig: 'police', patrol: 6, range: 8, facing: 1, speed: 60, requires: 'v12_planes', hideIf: 'v12_slipped' });
  b.at(92, 17, { type: 'guard', id: 'officer5', rig: 'police', patrol: 5, range: 8, facing: -1, speed: 55, requires: 'v12_planes', hideIf: 'v12_slipped' });
  b.at(78, 17, { type: 'section', id: 'banner' });
  b.at(104, 17, { type: 'use', id: 'shed_search', items: [], script: V(12), label: 'shed', prompt: loc('Search the shed', 'Shed-a thedu'), requires: 'v12_planes', unless: 'v12_have_things' });
  b.at(97, 17, { type: 'use', id: 'pour_oil', items: ['oil_can'], script: V(12), label: 'oil', prompt: loc('Pour the oil', 'Oil-a oothu'), requires: 'v12_have_things', unless: 'v12_oiled' });
  b.at(106, 17, { type: 'use', id: 'tie_rope', items: ['rope'], script: V(12), label: 'rope', prompt: loc('Tie the rope inside', 'Ulla kayiru kattu'), requires: 'v12_oiled', unless: 'v12_roped' });
  b.at(110, 17, { type: 'trigger', id: 'decoy', script: V(12), label: 'decoy', requires: 'v12_roped', unless: 'v12_slipped', height: 6 });
  for (const x of [16, 44, 76, 112]) b.at(x, 17, { type: 'prop', visual: 'lamp' });
  return finish(b, {
    id: 'hangar_yard', name: loc('Hangar 1', 'Hangar 1'), area: 'mit',
    backdrop: 'gen:hangar_day', palette: 'gen:hangar_day', music: 'stealth', ambient: 0xc8c0b0,
    grade: { brightness: 1.02, saturation: 0.95, contrast: 0.07 }, weather: ['dust'], terrain: 'concrete',
    scenery: { trees: 'palm', density: 0.5, ridge: false, icicles: false },
    mapPos: { x: 22, y: 4, w: 7, h: 2 },
    variants: [{ flag: 'hangar_rain', backdrop: 'gen:hangar_rain', music: 'chase', weather: ['rain', 'mist'], ambient: 0x6a7a98,
      grade: { brightness: 0.92, saturation: 0.85, contrast: 0.08, tint: 0x8aa8d8, tintAmount: 0.1 } }],
  });
}

/** The NRI girls' hostel on fire (V10): a burning corridor, Dharshna running for the stairs. */
function nriHostel(): RoomDef {
  const b = new RoomBuilder(70, 18);
  b.rect(0, 0, 2, 18).rect(68, 0, 2, 18);
  b.ground(2, 66, 15);
  // Burning debris and fallen ceiling: fire on the floor to jump, a ledge to cross over the worst of it.
  b.rect(52, 14, 3, 1, 'x');
  b.rect(40, 14, 2, 1, 'x');
  b.ground(33, 3, 14);
  b.rect(24, 14, 5, 1, 'x');
  b.rect(22, 10, 9, 1, '=');
  b.rect(12, 14, 2, 1, 'x');
  b.at(62, 14, { type: 'spawn', id: 'room' });
  b.at(64, 14, { type: 'prop', visual: 'door' });
  b.at(58, 14, { type: 'section', id: 'room_door' });
  b.at(36, 13, { type: 'section', id: 'middle' });
  b.at(6, 14, { type: 'section', id: 'stairs' });
  b.at(4, 14, { type: 'trigger', id: 'out', script: V(10), label: 'out', requires: 'v10_fire', unless: 'v10_out', height: 6 });
  b.at(3, 14, { type: 'prop', visual: 'door' });
  return finish(b, {
    id: 'nri_hostel', name: loc('NRI girls\' hostel', 'NRI girls hostel'), area: 'mit',
    backdrop: 'gen:hostel_fire', palette: 'gen:hostel_fire', music: 'fire', ambient: 0xff9a5a,
    grade: { brightness: 1.0, saturation: 1.1, contrast: 0.1, tint: 0xff8a3a, tintAmount: 0.1 }, weather: ['smoke', 'embers'], interior: true, terrain: 'tile',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 10, y: 3, w: 4, h: 2 },
  });
}

/** The Department of Applied Science and Humanities (V10-V12): two floors, the girls' restroom, the big door upstairs. */
function humanities(): RoomDef {
  const b = new RoomBuilder(64, 24);
  b.rect(0, 0, 2, 16).rect(62, 0, 2, 24);   // the entrance is open on the left
  b.ground(0, 62, 21);
  b.rect(14, 12, 48, 2);                  // the first floor
  b.rect(4, 18, 3, 1, '=').rect(8, 15, 3, 1, '=');   // the stairs up
  b.rect(11, 12, 3, 1, '=');
  b.at(4, 20, { type: 'spawn', id: 'entrance' });
  b.at(0, 20, { type: 'exit', id: 'to_hangar', to: 'hangar_yard', entry: 'west', height: 6 });
  b.at(20, 11, { type: 'spawn', id: 'upstairs' });
  b.at(8, 20, { type: 'sign', text: loc('Dept. of Applied Science and Humanities', 'Science & Humanities') });
  b.at(44, 20, { type: 'prop', visual: 'door' });
  b.at(46, 20, { type: 'sign', text: loc('Girls\' restroom', 'Girls restroom') });
  b.at(42, 20, { type: 'trigger', id: 'restroom_v10', script: V(10), label: 'restroom', requires: 'v10_out', unless: 'v10_locked', height: 6 });
  b.at(40, 20, { type: 'trigger', id: 'restroom_v11', script: V(11), label: 'restroom', requires: 'v11_find_dharshna', unless: 'v11_door_open', height: 6 });
  // Venture 12: hiding upstairs behind the big door while the police search.
  b.at(36, 11, { type: 'hide', id: 'big_door', visual: 'door', w: 3 });
  b.at(30, 11, { type: 'trigger', id: 'police_in', script: V(12), label: 'police_in', requires: 'v12_hum', unless: 'v12_search', height: 4 });
  b.at(26, 11, { type: 'section', id: 'upper' });
  b.at(50, 11, { type: 'guard', id: 'search_a', rig: 'police', patrol: 8, range: 9, facing: -1, speed: 60, requires: 'v12_search', hideIf: 'v12_escaped_hum' });
  b.at(30, 20, { type: 'guard', id: 'search_b', rig: 'police', patrol: 6, range: 8, facing: 1, speed: 50, requires: 'v12_search', hideIf: 'v12_escaped_hum' });
  b.at(3, 20, { type: 'trigger', id: 'hum_escape', script: V(12), label: 'hum_escape', requires: 'v12_search', unless: 'v12_escaped_hum', height: 6 });
  for (const x of [20, 34, 52]) b.at(x, 20, { type: 'prop', visual: 'lamp', scale: 0.6 });
  return finish(b, {
    id: 'humanities', name: loc('Science & Humanities', 'Science & Humanities'), area: 'mit',
    backdrop: 'gen:corridor_day', palette: 'gen:corridor_day', music: 'mystery', ambient: 0xd8d0b8,
    grade: INDOOR, weather: ['dust'], interior: true, terrain: 'tile',
    scenery: { trees: 'none', density: 1, ridge: false, icicles: false },
    mapPos: { x: 14, y: 3, w: 4, h: 3 },
  });
}

export const P01_ROOMS: RoomDef[] = [hostelRoom(), hostelRoad(), cutRoad(), mitRoad(), snowDream(), cheeseFreeze(), radhaNagar(), backGate(), dhanaHouse(), daydream(), hangarYard(), nriHostel(), humanities()];
export const P01_AREA = { name: loc('MIT Chromepet', 'MIT Chromepet'), rooms: P01_ROOMS.map((r) => r.id) };
