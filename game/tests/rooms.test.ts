import { expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { CHAPTERS } from '../src/data/chapters';
import { ROOMS } from '../src/data/rooms';
import { parseStory } from '../src/story/parser';

const storyDir = join(import.meta.dir, '..', 'src', 'story');
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.story') ? [p] : [];
});
const scripts = Object.fromEntries(walk(storyDir).map((f) => [relative(storyDir, f).replace(/\.story$/, ''), parseStory(readFileSync(f, 'utf8'), f)]));

test('every room hook points at a real script label, every exit at a real room and spawn', () => {
  for (const room of Object.values(ROOMS)) {
    for (const e of room.entities) {
      const d = e.def as { type: string; script?: string; label?: string; fail?: string; to?: string; entry?: string };
      const where = `${room.id}: ${d.type} @${e.tx},${e.ty}`;
      if (d.script) {
        const s = scripts[d.script];
        expect(s, `${where} script ${d.script}`).toBeDefined();
        for (const l of [d.label, d.fail].filter(Boolean) as string[]) expect(l in s!.labels, `${where} label ${l}`).toBe(true);
      }
      if (d.type === 'exit') {
        const to = ROOMS[d.to!];
        expect(to, `${where} exit to ${d.to}`).toBeDefined();
        expect(to!.entities.some((x) => x.def.type === 'spawn' && (x.def as { id: string }).id === d.entry), `${where} entry ${d.entry}`).toBe(true);
      }
    }
  }
});

test('@room and @warp targets exist, and chapters start somewhere real', () => {
  for (const [name, s] of Object.entries(scripts)) {
    for (const n of s.nodes) {
      if (n.k !== 'cmd' || n.name !== 'room') continue;
      const room = ROOMS[n.args[0]!];
      expect(room, `${name}:${n.line} room ${n.args[0]}`).toBeDefined();
      expect(room!.entities.some((x) => x.def.type === 'spawn' && (x.def as { id: string }).id === n.args[1]), `${name}:${n.line} spawn ${n.args[1]}`).toBe(true);
    }
  }
  for (const c of CHAPTERS) {
    expect(ROOMS[c.room], `chapter ${c.venture} room`).toBeDefined();
    if (scripts[c.script]) expect('start' in scripts[c.script]!.labels, `chapter ${c.venture} start label`).toBe(true);
  }
});
