import type { MapDef, WarpDef } from './types';

/** Tile name -> index in tiles.png (public/assets/pixel/tiles.json). */
export type TileIndex = Record<string, number>;

/** Prop name -> footprint and flags (public/assets/pixel/props.json). */
export type PropIndex = Record<string, { x: number; y: number; w: number; h: number; foot: [number, number]; solid: boolean; above: boolean }>;

export interface CompiledMap {
  def: MapDef;
  w: number;
  h: number;
  /** Tile index per cell for the ground layer. */
  ground: number[][];
  /** Tile index per cell for buildings (-1 where there is none). */
  building: number[][];
  solid: boolean[][];
  warps: Map<string, WarpDef>;
}

export const key = (x: number, y: number) => `${x},${y}`;

/** Cheap stable hash for picking tile variants. */
function h2(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) % 1000;
}

const SOLID_GROUND = new Set(['~', 'X', 'W', 'w']);

export function compileMap(def: MapDef, tiles: TileIndex, props: PropIndex): CompiledMap {
  const h = def.ground.length;
  const w = def.ground[0]!.length;
  const at = (x: number, y: number) => (y >= 0 && y < h && x >= 0 && x < w ? def.ground[y]![x]! : 'X');
  const T = (name: string) => {
    const i = tiles[name];
    if (i === undefined) throw new Error(`${def.id}: no tile "${name}"`);
    return i;
  };
  const ground: number[][] = [];
  const solid: boolean[][] = [];
  for (let y = 0; y < h; y++) {
    if (def.ground[y]!.length !== w) throw new Error(`${def.id}: row ${y} is ${def.ground[y]!.length} wide, expected ${w}`);
    const row: number[] = [];
    const srow: boolean[] = [];
    for (let x = 0; x < w; x++) {
      const c = at(x, y);
      const r = h2(x, y);
      let name: string;
      switch (c) {
        case '.': name = r < 700 ? 'grass0' : r < 850 ? 'grass1' : 'grass2'; break;
        case ',': name = 'grass_flowers'; break;
        case ';': name = 'grass_tall'; break;
        case '*': name = r < 500 ? 'petals' : 'petals1'; break;
        case '#': {
          const same = (xx: number, yy: number) => at(xx, yy) === '#' || at(xx, yy) === 'E';
          const m = (same(x, y - 1) ? 1 : 0) | (same(x + 1, y) ? 2 : 0) | (same(x, y + 1) ? 4 : 0) | (same(x - 1, y) ? 8 : 0);
          name = `path${m}`;
          break;
        }
        case 'p': name = r < 500 ? 'pavers' : 'pavers1'; break;
        case '=': name = r < 600 ? 'road' : 'road1'; break;
        case '-': name = 'road_dash'; break;
        case 'z': name = 'zebra'; break;
        case 'n': name = x % 7 === 3 ? 'kerb_nd' : 'kerb_n'; break;
        case 's': name = x % 7 === 5 ? 'kerb_sd' : 'kerb_s'; break;
        case 'm': name = 'mosaic'; break;
        case 'r': name = 'redoxide'; break;
        case 'E': name = 'exit_mat'; break;
        case '~': name = 'water0'; break;
        case 'W': {
          const below = at(x, y + 1);
          const below2 = at(x, y + 2);
          const wallish = (ch: string) => ch === 'W' || ch === 'w' || ch === 'X';
          name = !wallish(below) ? 'iwall_base' : !wallish(below2) ? 'iwall' : 'iwall_top';
          break;
        }
        case 'w': name = 'iwindow'; break;
        case 'X': name = 'iwall_top'; break;
        default: throw new Error(`${def.id}: unknown ground "${c}" at ${x},${y}`);
      }
      row.push(T(name));
      srow.push(SOLID_GROUND.has(c));
    }
    ground.push(row);
    solid.push(srow);
  }

  const building = ground.map((r) => r.map(() => -1));
  const warps = new Map<string, WarpDef>();
  for (const b of def.buildings ?? []) {
    const s = b.style;
    const rows = b.roof + b.wall;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < b.w; i++) {
        const x = b.x + i, y = b.y + j;
        if (x < 0 || y < 0 || x >= w || y >= h) throw new Error(`${def.id}: building outside the map at ${x},${y}`);
        const col = i === 0 ? 'w' : i === b.w - 1 ? 'e' : 'c';
        let part: string;
        if (j < b.roof - 1) part = j === 0 ? (col === 'c' ? 'roof_n' : `roof_n${col}`) : `roof_${col}`;
        else if (j === b.roof - 1) part = `parapet_${col}`;
        else {
          const wj = j - b.roof;
          const isDoor = b.door && i === b.door.dx;
          if (isDoor && wj === b.wall - 2) part = 'door_top';
          else if (isDoor && wj === b.wall - 1) part = 'door_bot';
          else if (wj === b.wall - 1) part = `base_${col}`;
          else {
            // Upper floors get a ledge along their top; windows alternate with wall, a pipe near each end.
            const lg = wj > 0 ? '_l' : '';
            const nearDoor = b.door && Math.abs(i - b.door.dx) < 1;
            if (col === 'c' && (i === 2 || i === b.w - 3) && !nearDoor && b.w > 7) part = `pipe${lg}`;
            else if (col === 'c' && i % 2 === 1 && !nearDoor) part = `window${h2(x, y) % 3}${lg}`;
            else part = `wall_${col}${lg}`;
          }
        }
        building[y]![x] = T(`${s}_${part}`);
        // A locked door is part of the wall: you can only knock (a look on the door tile).
        solid[y]![x] = part !== 'door_bot' || !!b.door?.locked;
      }
    }
    if (b.door && !b.door.locked) {
      const dx = b.x + b.door.dx, dy = b.y + rows - 1;
      warps.set(key(dx, dy), { x: dx, y: dy, to: b.door.to, spawn: b.door.spawn, dir: 'up' });
    }
  }

  for (const p of def.props ?? []) {
    const meta = props[p.kind];
    if (!meta) throw new Error(`${def.id}: no prop "${p.kind}"`);
    // Props that come and go with flags are solid only while shown; the scene re-applies them.
    if (!meta.solid || p.requires || p.unless) continue;
    const [fw, fh] = meta.foot;
    for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) {
      const x = p.x + i, y = p.y - j;
      if (y >= 0 && y < h && x >= 0 && x < w) solid[y]![x] = true;
    }
  }
  for (const wd of def.warps ?? []) warps.set(key(wd.x, wd.y), wd);
  return { def, w, h, ground, building, solid, warps };
}
