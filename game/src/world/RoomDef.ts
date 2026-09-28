import type { Loc } from '../core/Localization';
import type { MusicId } from '../data/media';
import type { TerrainMaterial } from './TerrainPainter';

export const TILE = 40;

export type EntityDef =
  | { type: 'spawn'; id: string }
  | { type: 'tree'; id: string }
  | { type: 'enemy'; id: string; enemy: string; battle: string; patrol: number }
  | { type: 'pickup'; id: string; item?: string; shards?: number; script?: string; label?: string; visual: 'shard' | 'item' | 'fragment' | 'feather'; needs?: string }
  /**
   * A character standing in the room. With `talk` the player presses interact to start the script;
   * otherwise it starts when the player comes within `radius` px. `rig` defaults to the speaker id.
   */
  | { type: 'npc'; id: string; speaker: string; script?: string; label?: string; radius: number; hideIf?: string; requires?: string; talk?: boolean; rig?: string; face?: 1 | -1; once?: string }
  | { type: 'trigger'; id: string; script: string; label: string; unless?: string; requires?: string; height: number }
  | { type: 'exit'; id: string; to: string; entry: string; height: number }
  | { type: 'crystal'; color: number }
  | { type: 'chest'; id: string; item: string; needs?: string }
  | { type: 'gate'; ability: string; hint: Loc; height: number }
  /** Shows a first-time tip (data/tips.ts) when the player comes within `radius` tiles. */
  | { type: 'tip'; tip: string; radius: number }
  /** A rest point on Earth (there are no Rosoar trees there): same as a tree, different look. */
  | { type: 'rest'; id: string; visual: 'bench' | 'bed' | 'chair' }
  /** Stealth: a patrolling watcher with a sight cone. Being seen restarts the section, or runs `fail`. */
  | { type: 'guard'; id: string; rig: string; patrol: number; range: number; facing?: 1 | -1; speed?: number; requires?: string; hideIf?: string; fail?: string; script?: string }
  /** Cover: press down in front of it to hide. */
  | { type: 'hide'; id: string; visual: PropVisual; w?: number }
  /** A pursuer. Catching the player restarts the chase from the last section marker. */
  | { type: 'chaser'; id: string; rig: string; speed: number; delay?: number; requires?: string; unless?: string }
  /** Nithish can push these (the shove ability). */
  | { type: 'crate'; id: string; w: number; h: number }
  /** Interact here while carrying every item in `items` to run the script label. */
  | { type: 'use'; id: string; items: string[]; script: string; label: string; prompt: Loc; requires?: string; unless?: string }
  /** Scenery object (no collision). */
  | { type: 'prop'; visual: PropVisual; flip?: boolean; scale?: number; front?: boolean }
  /** Stealth and chase restart point. */
  | { type: 'section'; id: string };

export type PropVisual = 'bin' | 'chair' | 'stall' | 'auto' | 'plane' | 'statue' | 'lamp' | 'bench' | 'shed' | 'banner' | 'jeep'
  | 'crate' | 'door' | 'car' | 'bed' | 'desk' | 'shelf' | 'bike' | 'gate' | 'tv' | 'mirror' | 'firetruck';

export interface PlacedEntity { def: EntityDef; x: number; y: number; tx: number; ty: number }

export interface RoomDef {
  id: string;
  name: Loc;
  area: string;
  cols: number;
  rows: number;
  /** Tile grid: '#' solid, '=' one-way platform, '^' spikes, 'x' fire, '.' empty. */
  grid: string[];
  entities: PlacedEntity[];
  backdrop: string;
  palette: string;
  music: MusicId;
  /** Ambient light colour for lit objects. */
  ambient: number;
  grade: { brightness: number; saturation: number; contrast: number; tint?: number; tintAmount?: number };
  weather: ('snow' | 'heavy_snow' | 'motes' | 'mist' | 'beads' | 'rain' | 'petals' | 'smoke' | 'embers' | 'dust')[];
  /** Silhouette layers between backdrop and play area. */
  scenery: { trees: 'pluffine' | 'arch' | 'bare' | 'neem' | 'copperpod' | 'palm' | 'none'; density: number; ridge: boolean; icicles: boolean };
  /** Indoors: the backdrop is a wall close behind the play space (no sky, no tree bands). */
  interior?: boolean;
  /** Surface material of the terrain (default snow). */
  terrain?: TerrainMaterial;
  /** Position on the area map, in tiles of the map screen. */
  mapPos: { x: number; y: number; w: number; h: number };
}

/** Builds a tile grid plus entities with readable calls instead of hand-typed ASCII. */
export class RoomBuilder {
  grid: string[][];
  entities: PlacedEntity[] = [];
  constructor(public cols: number, public rows: number) {
    this.grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
  }
  set(x: number, y: number, c: string) {
    if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) this.grid[y]![x] = c;
    return this;
  }
  rect(x: number, y: number, w: number, h: number, c = '#') {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    return this;
  }
  /** Solid ground from row `top` to the bottom, columns x..x+w-1. */
  ground(x: number, w: number, top: number) {
    this.rect(x, 0, w, this.rows, '.');
    return this.rect(x, top, w, this.rows - top, '#');
  }
  /** Places an entity standing on top of tile row `ty` (i.e. inside the empty tile above the ground at ty+1). */
  at(tx: number, ty: number, def: EntityDef) {
    this.entities.push({ def, tx, ty, x: tx * TILE + TILE / 2, y: (ty + 1) * TILE });
    return this;
  }
  rows_(): string[] { return this.grid.map((r) => r.join('')); }
}

export interface Rect { x: number; y: number; w: number; h: number }

/** Greedy-merges tiles of one kind into rectangles (pixels). */
export function mergeTiles(grid: string[], ch: string): Rect[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const used = grid.map((r) => Array.from(r, () => false));
  const out: Rect[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (used[y]![x] || grid[y]![x] !== ch) continue;
      let w = 1;
      while (x + w < cols && grid[y]![x + w] === ch && !used[y]![x + w]) w++;
      let h = 1;
      outer: while (y + h < rows) {
        for (let i = x; i < x + w; i++) if (grid[y + h]![i] !== ch || used[y + h]![i]) break outer;
        h++;
      }
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) used[j]![i] = true;
      out.push({ x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE });
    }
  }
  return out;
}
