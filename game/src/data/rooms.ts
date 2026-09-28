import { loc } from '../core/Localization';
import { RoomBuilder, type RoomDef } from '../world/RoomDef';

const SLICE = 'slice/glacia_slice';

/** Frozen Shore: Ragul wakes here. Teaches movement, the Rosoar tree, and shows a ledge he can't reach yet. */
function frozenShore(): RoomDef {
  const b = new RoomBuilder(110, 30);
  b.rect(0, 0, 2, 30);               // left wall
  b.ground(2, 17, 25);               // start
  b.ground(19, 11, 23);              // step up
  b.ground(30, 4, 28).rect(30, 27, 4, 1, '^'); // spike pit
  b.ground(34, 6, 23);
  b.ground(40, 14, 26);              // frozen pond hollow
  b.rect(43, 22, 5, 1, '=');         // platform A
  b.rect(47, 17, 6, 1, '#');         // high ledge B (needs the Acanus leap)
  b.ground(54, 14, 24);
  b.ground(68, 13, 23);
  b.rect(72, 19, 4, 1, '=');
  b.ground(81, 20, 24);
  b.ground(101, 9, 24);

  b.at(6, 24, { type: 'spawn', id: 'start' });
  b.at(107, 23, { type: 'spawn', id: 'east' });
  b.at(109, 23, { type: 'exit', id: 'to_path', to: 'winter_path', entry: 'west', height: 6 });
  b.at(60, 23, { type: 'tree', id: 'shore_tree' });
  b.at(90, 23, { type: 'enemy', id: 'shore_vale', enemy: 'vale', battle: 'vale_lone', patrol: 7 });
  b.at(49, 16, { type: 'pickup', id: 'shore_dream', script: SLICE, label: 'dream', visual: 'fragment' });
  for (const [x, y] of [[10, 24], [12, 24], [14, 24], [44, 21], [46, 21], [73, 18], [74, 18], [93, 23], [96, 23], [22, 22]] as const) {
    b.at(x, y, { type: 'pickup', id: `shore_shard_${x}_${y}`, shards: 3, visual: 'shard' });
  }
  b.at(66, 23, { type: 'pickup', id: 'shore_fruit', item: 'red_rosoar', visual: 'item' });
  for (const [x, y, c] of [[38, 22, 0x7fe8ff], [52, 25, 0x9f8cff], [78, 22, 0x7fe8ff], [104, 23, 0x9fd8ff], [17, 24, 0x9f8cff]] as const) {
    b.at(x, y, { type: 'crystal', color: c });
  }

  return {
    id: 'frozen_shore', name: loc('Frozen Shore', 'Urainja Karai'), area: 'glacia_test',
    cols: b.cols, rows: b.rows, grid: b.rows_(), entities: b.entities,
    backdrop: 'frozen_pond', palette: 'frozen_pond', music: 'glacia',
    ambient: 0x8a9cc0,
    grade: { brightness: 1.0, saturation: 1.05, contrast: 0.06, tint: 0x9fc4ff, tintAmount: 0.08 },
    weather: ['snow', 'motes'],
    scenery: { trees: 'pluffine', density: 1, ridge: true, icicles: false },
    mapPos: { x: 0, y: 1, w: 11, h: 3 },
  };
}

/** Winter Path: an arch of trees with glowing beads. Dhanasree, the Vale pack, the Acanus feather. */
function winterPath(): RoomDef {
  const b = new RoomBuilder(96, 26);
  b.ground(0, 30, 22);
  b.ground(30, 8, 21);
  b.ground(38, 22, 22);
  b.ground(60, 16, 19);              // raised bank
  b.ground(76, 18, 22);
  b.rect(94, 0, 2, 26);              // right wall
  b.rect(76, 18, 4, 1, '=');
  b.rect(81, 13, 7, 1, '#');         // high ledge with the chest (needs the Acanus leap)
  b.rect(30, 17, 5, 1, '=');         // low branch (4 tiles up)
  b.rect(46, 18, 4, 1, '=');         // stepping branch
  b.rect(52, 15, 4, 1, '=');         // high branch, 3 above the stepping one

  b.at(3, 21, { type: 'spawn', id: 'west' });
  b.at(0, 21, { type: 'exit', id: 'to_shore', to: 'frozen_shore', entry: 'east', height: 6 });
  b.at(22, 21, { type: 'npc', id: 'dhanasree', speaker: 'dhanasree', script: SLICE, label: 'dhanasree', radius: 230, hideIf: 'slice_met_dhanasree' });
  b.at(46, 21, { type: 'trigger', id: 'pack', script: SLICE, label: 'pack', unless: 'slice_vale_pack_defeated', requires: 'slice_met_dhanasree', height: 8 });
  b.at(55, 21, { type: 'tree', id: 'path_tree' });
  b.at(70, 18, { type: 'pickup', id: 'feather', script: SLICE, label: 'feather', visual: 'feather' });
  b.at(84, 12, { type: 'chest', id: 'path_chest', item: 'pluffine_wrap' });
  for (const [x, y] of [[12, 21], [14, 21], [31, 16], [33, 16], [47, 17], [53, 14], [64, 18], [66, 18], [90, 21]] as const) {
    b.at(x, y, { type: 'pickup', id: `path_shard_${x}_${y}`, shards: 3, visual: 'shard' });
  }
  for (const [x, y] of [[36, 20], [78, 21], [92, 21]] as const) b.at(x, y, { type: 'crystal', color: 0x8fe0ff });

  return {
    id: 'winter_path', name: loc('The Winter Path', 'Winter Path'), area: 'glacia_test',
    cols: b.cols, rows: b.rows, grid: b.rows_(), entities: b.entities,
    backdrop: 'winter_path', palette: 'winter_path', music: 'winter_path',
    ambient: 0x7fa6c4,
    grade: { brightness: 0.95, saturation: 1.08, contrast: 0.08, tint: 0x7fe0ff, tintAmount: 0.06 },
    weather: ['snow', 'beads', 'mist'],
    scenery: { trees: 'arch', density: 1.2, ridge: false, icicles: false },
    mapPos: { x: 11, y: 1, w: 10, h: 3 },
  };
}

export const ROOMS: Record<string, RoomDef> = {
  frozen_shore: frozenShore(),
  winter_path: winterPath(),
};

export const AREAS: Record<string, { name: ReturnType<typeof loc>; rooms: string[] }> = {
  glacia_test: { name: loc('Glacia (engine test)'), rooms: ['frozen_shore', 'winter_path'] },
};
