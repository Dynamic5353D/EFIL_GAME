import { describe, expect, test } from 'bun:test';
import { ROOMS } from '../src/data/rooms';
import { checkRoom, ReachMap } from '../src/world/reach';
import { RoomBuilder } from '../src/world/RoomDef';

describe('reachability model', () => {
  const room = (build: (b: RoomBuilder) => void) => {
    const b = new RoomBuilder(30, 20);
    build(b);
    return { grid: b.rows_(), cols: b.cols, rows: b.rows };
  };

  test('a single jump clears 4 tiles but not 5; the Acanus leap clears 5', () => {
    const m = new ReachMap(room((b) => { b.ground(0, 30, 18); b.rect(10, 14, 4, 1, '='); b.rect(20, 13, 4, 1, '='); }));
    const base = m.reachable([{ x: 2, y: 17 }]);
    expect(base.has('11,13')).toBe(true);   // 4 tiles up
    expect(base.has('21,12')).toBe(false);  // 5 tiles up
    expect(m.reachable([{ x: 2, y: 17 }], new Set(['double_jump'])).has('21,12')).toBe(true);
  });

  test('walls block a jump that would otherwise reach', () => {
    const m = new ReachMap(room((b) => { b.ground(0, 30, 18); b.rect(8, 0, 1, 18); }));
    expect(m.reachable([{ x: 2, y: 17 }]).has('12,17')).toBe(false);
  });
});

describe('rooms', () => {
  for (const r of Object.values(ROOMS)) {
    test(`${r.id}: everything is reachable, gates are real, no dead ends`, () => {
      const rep = checkRoom(r);
      expect(rep.unreachable).toEqual([]);
      expect(rep.leaky).toEqual([]);
      expect(rep.deadEnds).toEqual([]);
    });
  }
});
