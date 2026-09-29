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

test('every flag a room hook waits for is set somewhere else first (no self-locking triggers)', () => {
  // Where each flag is set to a truthy value: script name and node index.
  const sets: Record<string, { script: string; at: number }[]> = {};
  for (const [name, s] of Object.entries(scripts)) {
    s.nodes.forEach((n, i) => {
      if (n.k === 'set' && n.value !== false && n.value !== 0) (sets[n.flag] ??= []).push({ script: name, at: i });
      if (n.k === 'cmd' && n.name === 'add') (sets[n.args[0]!] ??= []).push({ script: name, at: i });
    });
  }
  // Flags the engine sets itself.
  const engine = new Set(['disguised', 'won']);
  const section = (script: string, label: string): [number, number] => {
    const s = scripts[script]!;
    const start = s.labels[label]!;
    let end = s.nodes.findIndex((n, i) => i > start && n.k === 'end');
    if (end < 0) end = s.nodes.length;
    return [start, end];
  };
  for (const room of Object.values(ROOMS)) {
    for (const e of room.entities) {
      const d = e.def as { type: string; requires?: string; script?: string; label?: string };
      if (!d.requires || engine.has(d.requires) || d.requires.startsWith('slice_')) continue;
      const where = `${room.id}: ${d.type} @${e.tx},${e.ty} requires ${d.requires}`;
      const at = sets[d.requires] ?? [];
      expect(at.length, `${where}: never set`).toBeGreaterThan(0);
      if (d.script && d.label && scripts[d.script]) {
        const [a, b] = section(d.script, d.label);
        const elsewhere = at.some((x) => x.script !== d.script || x.at < a || x.at > b);
        expect(elsewhere, `${where}: only set by its own script section`).toBe(true);
      }
    }
  }
});

test('every story trigger is retired by its own story (it would fire again while you stand on it)', () => {
  const leaves = new Set(['room', 'next', 'credits']);
  for (const room of Object.values(ROOMS)) {
    for (const e of room.entities) {
      const d = e.def as { type: string; unless?: string; script?: string; label?: string };
      if (d.type !== 'trigger' || !d.script || !d.label || !scripts[d.script]) continue;
      const s = scripts[d.script]!;
      const start = s.labels[d.label]!;
      let end = s.nodes.findIndex((n, i) => i > start && n.k === 'end');
      if (end < 0) end = s.nodes.length;
      const part = s.nodes.slice(start, end);
      const retired = part.some((n) => (n.k === 'set' && n.flag === d.unless && n.value !== false) || (n.k === 'cmd' && leaves.has(n.name)));
      expect(retired, `${room.id}: trigger ${d.label} @${e.tx},${e.ty} (unless ${d.unless ?? '-'}) is not retired by its story`).toBe(true);
    }
  }
});
