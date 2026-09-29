import type { Dir } from '../../core/GameState';
import type { Loc } from '../../core/Localization';
import type { MusicId } from '../../data/media';

/**
 * A map is authored as ASCII rows (one character per 16 px tile) plus lists of buildings, props, people
 * and events. `compileMap` turns it into tile layers and a collision grid.
 *
 * Ground characters:
 *   .  grass        ,  flowers      ;  tall grass    *  fallen copper-pod petals
 *   #  laterite path (auto-tiled)   p  paver bricks  =  tar road     -  road centre dash   z  zebra crossing
 *   n  road with kerb on its north edge              s  road with kerb on its south edge
 *   m  mosaic floor  r  red-oxide floor              E  exit mat (a warp usually sits on it)
 *   W  interior wall (auto: top, face, skirting)     w  interior window
 *   ~  water (solid)                                 X  nothing (solid, black)
 */
export interface MapDef {
  id: string;
  name: Loc;
  music: MusicId;
  /** Time-of-day colour over the map. */
  tint?: 'morning' | 'noon' | 'dusk' | 'night' | 'indoor';
  /** Falling copper-pod petals. */
  petals?: boolean;
  ground: string[];
  buildings?: BuildingDef[];
  props?: PropPlace[];
  npcs?: NpcDef[];
  warps?: WarpDef[];
  spawns: Record<string, { x: number; y: number; dir: Dir }>;
  /** Things to read or look at: press A facing the tile. */
  looks?: LookDef[];
  /** Story that runs when the player steps onto a tile. */
  triggers?: TriggerDef[];
  /** Story that runs each time the map is entered, while its flags allow (usually `unless` a flag it sets). */
  enter?: Omit<TriggerDef, 'x' | 'y' | 'w' | 'h'>;
}

export interface BuildingDef {
  /** Top-left tile of the roof. */
  x: number;
  y: number;
  /** Width in tiles, roof rows (the last is the front parapet), wall rows (the last holds the door). */
  w: number;
  roof: number;
  wall: number;
  style: 'hostel' | 'dept' | 'house';
  /** The door's column, counted from the building's left edge, and where it leads. */
  door?: { dx: number; to: string; spawn: string; locked?: boolean };
  /** A name board over the door. */
  sign?: Loc;
}

export interface PropPlace {
  kind: string;
  /** Bottom-left tile of the prop's footprint. */
  x: number;
  y: number;
  /** Mirror the sprite. */
  flip?: boolean;
  /** Shown only while this flag is set / unset. */
  requires?: string;
  unless?: string;
}

/** A line to show, or a story label to run. */
export type TalkRef = { text: Loc } | { script: string; label: string };

export type NpcMove =
  | { kind: 'stand' }
  /** Looks around now and then. */
  | { kind: 'look' }
  /** Wanders within `r` tiles of home. */
  | { kind: 'wander'; r: number }
  /** Walks a loop of waypoints (tile coordinates). */
  | { kind: 'patrol'; path: [number, number][] };

export interface NpcDef {
  id: string;
  /** Sprite sheet (a Look id in tools/pixel/characters.py). */
  sprite: string;
  /** Speaker id for the name tab and portrait (src/data/speakers.ts). */
  speaker: string;
  x: number;
  y: number;
  dir: Dir;
  move?: NpcMove;
  talk: TalkRef;
  requires?: string;
  unless?: string;
}

export interface WarpDef {
  x: number;
  y: number;
  to: string;
  spawn: string;
  /** The direction the player must be moving to take it (a door you walk up into, an edge you walk off). */
  dir?: Dir;
}

export interface LookDef {
  x: number;
  y: number;
  talk: TalkRef;
  requires?: string;
  unless?: string;
}

export interface TriggerDef {
  x: number;
  y: number;
  w?: number;
  h?: number;
  script: string;
  label: string;
  requires?: string;
  unless?: string;
}
