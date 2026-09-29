import { describe, expect, test } from 'bun:test';
import { addItem, grantXp, joinParty, memberStats, newGame, rest } from '../src/core/GameState';
import { SaveSystem, sanitizeState } from '../src/core/SaveSystem';
import { MemoryKV } from '../src/core/Storage';

describe('saves', () => {
  test('round-trips a game state through a slot', () => {
    const kv = new MemoryKV();
    const saves = new SaveSystem(kv);
    const s = newGame();
    joinParty(s, 'dhanasree', 3);
    addItem(s, 'acanus_feather');
    s.flags.slice_intro_done = true;
    s.flags.count = 3;
    s.codex.push('glacia');
    s.members.ragul!.keepsake = 'pluffine_wrap';
    s.location = { room: 'winter_path', x: 120, y: 400, checkpoint: 'tree_a' };
    expect(saves.save(2, s, 'Winter Path')).not.toBeNull();
    const back = saves.load(2)!;
    expect(back).toEqual(s);
    expect(back.abilities).toContain('glide');
    expect(saves.meta(2)).toMatchObject({ slot: 2, roomName: 'Winter Path', level: 3 });
    expect(saves.latest()?.slot).toBe(2);
    expect(saves.load(1)).toBeNull();
  });

  test('bad or tampered data never crashes the loader', () => {
    const kv = new MemoryKV();
    const saves = new SaveSystem(kv);
    kv.set('efil.save.1', '{not json');
    expect(saves.load(1)).toBeNull();
    kv.set('efil.save.1', JSON.stringify({ format: 'efil-save', state: { version: 1, party: ['ragul', 'bob'], members: { ragul: { level: 'x', hp: 5 }, bob: {} }, ammo: 99, flags: { a: {} } } }));
    const s = saves.load(1)!;
    expect(s.party).toEqual(['ragul']);
    expect(s.members.ragul!.level).toBe(1);
    expect(s.ammo).toBe(6);
    expect(s.flags).toEqual({});
    expect(sanitizeState({ version: 2 })).toBeNull();
  });

  test('levels, keepsakes and resting', () => {
    const s = newGame();
    const hp0 = memberStats(s, 'ragul').maxHp;
    s.members.ragul!.keepsake = 'pluffine_wrap';
    expect(memberStats(s, 'ragul').maxHp).toBe(hp0 + 12);
    expect(grantXp(s, 500)).toEqual(['ragul']);
    s.members.ragul!.hp = 1;
    s.ammo = 0;
    s.defeated = ['e1'];
    rest(s, 'tree_a', 'frozen_shore');
    expect(s.members.ragul!.hp).toBe(memberStats(s, 'ragul').maxHp);
    expect(s.ammo).toBe(6);
    expect(s.defeated).toEqual([]);
  });
});
