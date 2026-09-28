/**
 * Reachability checker for room layouts. It works on the tile grid with the real movement numbers,
 * so a unit test can prove that every pickup, chest, NPC and exit can be reached, that gated ones
 * really need their ability, and that no pit is a dead end.
 *
 * Model: the player stands in a tile whose cell below is '#' or '=' (never '^'), and needs the cell
 * above free too (the body is about 1.6 tiles tall). From a standing cell it can walk to a neighbour,
 * or jump/fall to another standing cell if the height is within the jump and the horizontal distance
 * within what run speed covers during that air time. The path is checked as an L: rise in the start
 * column, cross at the higher of the two rows, drop in the target column. One-way platforms ('=')
 * never block movement. It is deliberately a little conservative (no sprint, no dash).
 */
import { BASE_ABILITIES } from '../data/abilities';
import { MOVE, jumpHeight } from './movement';
import { TILE, type EntityDef, type RoomDef } from './RoomDef';

export interface Cell { x: number; y: number }

const key = (x: number, y: number) => `${x},${y}`;

export class ReachMap {
  private g: string[];
  readonly cols: number;
  readonly rows: number;

  constructor(room: Pick<RoomDef, 'grid' | 'cols' | 'rows'>) {
    this.g = room.grid;
    this.cols = room.cols;
    this.rows = room.rows;
  }

  private at(x: number, y: number): string {
    if (x < 0 || x >= this.cols) return '#';
    if (y < 0) return '.';
    if (y >= this.rows) return '.';
    return this.g[y]![x]!;
  }

  /** Blocks movement through it. */
  solid(x: number, y: number) { return this.at(x, y) === '#'; }

  /** Can stand in (x, y): support below, body room here and above, no spikes. */
  stand(x: number, y: number): boolean {
    const below = this.at(x, y + 1);
    if (below !== '#' && below !== '=') return false;
    if (y + 1 >= this.rows) return false;
    const here = this.at(x, y), above = this.at(x, y - 1);
    return here !== '#' && here !== '^' && here !== '=' && above !== '#' && above !== '^';
  }

  standingCells(): Cell[] {
    const out: Cell[] = [];
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) if (this.stand(x, y)) out.push({ x, y });
    return out;
  }

  /** Air time (s) when landing `dyPx` above the take-off height, or null if too high. */
  private airTime(dyPx: number, double: boolean): number | null {
    const g = MOVE.gravity, gFall = g * MOVE.fallMult;
    const h1 = jumpHeight(MOVE.jump) - 6; // a little margin: nobody times a jump perfectly
    const single = dyPx <= h1 ? MOVE.jump / g + Math.sqrt((2 * (h1 - dyPx)) / gFall) : null;
    if (!double) return single;
    const h = h1 + jumpHeight(MOVE.doubleJump) - 6;
    const both = dyPx <= h ? MOVE.jump / g + MOVE.doubleJump / g + Math.sqrt((2 * (h - dyPx)) / gFall) : null;
    return Math.max(single ?? 0, both ?? 0) || null;
  }

  /** The L-shaped path between two standing cells is free of solid tiles (body two cells tall). */
  private clear(a: Cell, b: Cell): boolean {
    const top = Math.min(a.y, b.y);
    for (let y = top - 1; y <= a.y; y++) if (this.solid(a.x, y)) return false;
    const dir = Math.sign(b.x - a.x);
    for (let x = a.x; x !== b.x; x += dir) if (this.solid(x, top) || this.solid(x, top - 1)) return false;
    for (let y = top - 1; y <= b.y; y++) if (this.solid(b.x, y)) return false;
    return true;
  }

  canMove(a: Cell, b: Cell, abilities: ReadonlySet<string>): boolean {
    if (a.x === b.x && a.y === b.y) return false;
    if (a.y === b.y && Math.abs(a.x - b.x) === 1) return true; // walk
    const t = this.airTime((a.y - b.y) * TILE, abilities.has('double_jump'));
    if (t === null) return false;
    const reach = MOVE.run * t + TILE * 0.6;
    if (Math.abs(b.x - a.x) * TILE > reach) return false;
    return this.clear(a, b);
  }

  /** Movement graph over standing cells: index -> indices you can move to. */
  graph(abilities: ReadonlySet<string>): { cells: Cell[]; index: Map<string, number>; out: number[][] } {
    const cells = this.standingCells();
    const index = new Map(cells.map((c, i) => [key(c.x, c.y), i]));
    const out = cells.map((a) => cells.flatMap((b, j) => (this.canMove(a, b, abilities) ? [j] : [])));
    return { cells, index, out };
  }

  /** Every standing cell reachable from `starts` (keys "x,y"). */
  reachable(starts: Cell[], abilities: ReadonlySet<string> = new Set()): Set<string> {
    const { cells, index, out } = this.graph(abilities);
    return this.search(starts, cells, index, out);
  }

  search(starts: Cell[], cells: Cell[], index: Map<string, number>, out: number[][]): Set<string> {
    const seen = new Set<number>();
    const queue: number[] = [];
    for (const s of starts) {
      const c = this.settle(s);
      const i = c ? index.get(key(c.x, c.y)) : undefined;
      if (i !== undefined && !seen.has(i)) { seen.add(i); queue.push(i); }
    }
    while (queue.length) {
      for (const j of out[queue.shift()!]!) if (!seen.has(j)) { seen.add(j); queue.push(j); }
    }
    return new Set([...seen].map((i) => key(cells[i]!.x, cells[i]!.y)));
  }

  /** The standing cell a marker placed at `c` rests on (it may float a little above the ground). */
  settle(c: Cell): Cell | null {
    for (let y = c.y; y < Math.min(this.rows, c.y + 4); y++) if (this.stand(c.x, y)) return { x: c.x, y };
    return null;
  }

  /** Whether a marker at `c` can be touched from the reachable set (standing on it, or jumping up to it). */
  touches(c: Cell, reach: Set<string>): boolean {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = c.y; y <= c.y + 3; y++) if (reach.has(key(c.x + dx, y))) return true;
    }
    return false;
  }
}

/** Entity kinds the player has to be able to get to. */
export function isDestination(d: EntityDef): boolean {
  return ['pickup', 'chest', 'tree', 'npc', 'trigger', 'exit', 'enemy'].includes(d.type);
}

export interface ReachReport {
  /** Entities that should be reachable but aren't. */
  unreachable: string[];
  /** Entities marked `needs` that are reachable without that ability (the gate isn't real). */
  leaky: string[];
  /** Reachable standing cells from which no spawn or exit can be reached (dead ends). */
  deadEnds: Cell[];
}

const label = (d: EntityDef, x: number, y: number) => `${d.type}${'id' in d ? ` ${d.id}` : ''} @${x},${y}`;

/** Checks a room with the base abilities and with each ability its entities declare as `needs`. */
export function checkRoom(room: RoomDef, base: string[] = BASE_ABILITIES): ReachReport {
  const m = new ReachMap(room);
  const spawns = room.entities.filter((e) => e.def.type === 'spawn' || e.def.type === 'exit').map((e) => ({ x: e.tx, y: e.ty }));
  const baseSet = new Set(base);
  const reachBase = m.reachable(spawns, baseSet);
  const report: ReachReport = { unreachable: [], leaky: [], deadEnds: [] };
  for (const e of room.entities) {
    if (!isDestination(e.def)) continue;
    const needs = 'needs' in e.def ? e.def.needs : undefined;
    const c = { x: e.tx, y: e.ty };
    if (!needs) {
      if (!m.touches(c, reachBase)) report.unreachable.push(label(e.def, e.tx, e.ty));
      continue;
    }
    const withIt = m.reachable(spawns, new Set([...base, needs]));
    if (!m.touches(c, withIt)) report.unreachable.push(`${label(e.def, e.tx, e.ty)} (even with ${needs})`);
    if (m.touches(c, reachBase)) report.leaky.push(`${label(e.def, e.tx, e.ty)} (reachable without ${needs})`);
  }
  // Dead ends: with every ability, from each reachable cell you must be able to get back to a spawn or exit.
  const g = m.graph(new Set([...base, 'double_jump']));
  const forward = m.search(spawns, g.cells, g.index, g.out);
  const reverse: number[][] = g.cells.map(() => []);
  g.out.forEach((targets, i) => targets.forEach((j) => reverse[j]!.push(i)));
  const canReturn = m.search(spawns, g.cells, g.index, reverse);
  for (const k of forward) {
    if (canReturn.has(k)) continue;
    const [x, y] = k.split(',').map(Number) as [number, number];
    report.deadEnds.push({ x, y });
  }
  return report;
}
