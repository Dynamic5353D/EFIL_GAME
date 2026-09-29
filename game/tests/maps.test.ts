import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { compileMap, key, type PropIndex, type TileIndex } from '../src/px/maps/compile';
import { MAPS } from '../src/px/maps/index';
import type { MapDef, TalkRef } from '../src/px/maps/types';
import { parseStory } from '../src/story/parser';

const json = (p: string) => JSON.parse(readFileSync(new URL(`../public/assets/pixel/${p}`, import.meta.url), 'utf8'));
const TILES = json('tiles.json') as TileIndex;
const PROPS = json('props.json') as PropIndex;
const SPRITES = new Set(json('chars.json') as string[]);
const script = (name: string) => parseStory(readFileSync(new URL(`../src/story/${name}.story`, import.meta.url), 'utf8'), name);

/** Tiles the player can reach by walking from any spawn (NPCs don't block; they move). */
function reachable(def: MapDef): Set<string> {
  const m = compileMap(def, TILES, PROPS);
  const seen = new Set<string>();
  const q: [number, number][] = Object.values(def.spawns).map((s) => [s.x, s.y]);
  for (const [x, y] of q) seen.add(key(x, y));
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || m.solid[ny]![nx] || seen.has(key(nx, ny))) continue;
      seen.add(key(nx, ny));
      q.push([nx, ny]);
    }
  }
  return seen;
}

const nextTo = (seen: Set<string>, x: number, y: number) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => seen.has(key(x + dx!, y + dy!)));

function checkTalk(t: TalkRef, where: string): void {
  if ('text' in t) {
    expect(t.text.en.trim().length, where).toBeGreaterThan(0);
    expect(t.text.ta.trim().length, where).toBeGreaterThan(0);
  } else {
    expect(script(t.script).labels[t.label], `${where}: ${t.script}#${t.label}`).toBeDefined();
  }
}

describe('maps', () => {
  for (const def of Object.values(MAPS)) {
    test(`${def.id} compiles and every place in it is reachable`, () => {
      const m = compileMap(def, TILES, PROPS);
      expect(def.name.en && def.name.ta).toBeTruthy();
      const seen = reachable(def);
      for (const [name, s] of Object.entries(def.spawns)) expect(m.solid[s.y]![s.x], `spawn ${name} is solid`).toBe(false);
      for (const n of def.npcs ?? []) {
        expect(SPRITES.has(n.sprite), `${n.id} sprite`).toBe(true);
        expect(m.solid[n.y]![n.x], `${n.id} stands in a wall`).toBe(false);
        expect(nextTo(seen, n.x, n.y), `${n.id} can't be reached`).toBe(true);
        checkTalk(n.talk, `${def.id}/${n.id}`);
      }
      for (const l of def.looks ?? []) {
        expect(nextTo(seen, l.x, l.y) || seen.has(key(l.x, l.y)), `look at ${l.x},${l.y} can't be reached`).toBe(true);
        checkTalk(l.talk, `${def.id}/look ${l.x},${l.y}`);
      }
      for (const t of def.triggers ?? []) {
        expect(seen.has(key(t.x, t.y)), `trigger ${t.label}`).toBe(true);
        expect(script(t.script).labels[t.label]).toBeDefined();
      }
      if (def.enter) expect(script(def.enter.script).labels[def.enter.label], `${def.id} enter`).toBeDefined();
      for (const w of m.warps.values()) {
        expect(seen.has(key(w.x, w.y)) || nextTo(seen, w.x, w.y), `warp at ${w.x},${w.y}`).toBe(true);
        const target = MAPS[w.to];
        expect(target, `warp to ${w.to}`).toBeDefined();
        expect(target!.spawns[w.spawn], `spawn ${w.spawn} in ${w.to}`).toBeDefined();
      }
    });
  }

  test('doors lead both ways', () => {
    for (const def of Object.values(MAPS)) {
      const m = compileMap(def, TILES, PROPS);
      for (const w of m.warps.values()) {
        const back = compileMap(MAPS[w.to]!, TILES, PROPS);
        expect([...back.warps.values()].some((b) => b.to === def.id), `${w.to} has no way back to ${def.id}`).toBe(true);
      }
    }
  });
});
