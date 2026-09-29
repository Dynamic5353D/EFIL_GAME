import { describe, expect, test } from 'bun:test';
import type { Loc } from '../src/core/Localization';
import { parseStory } from '../src/story/parser';
import { runStory, type FlagValue, type StoryHost } from '../src/story/runtime';

const SAMPLE = `
# a comment
@venture 2 15
@title The Winter Path
  ta: Winter Path
@scene winter_path  @time 1 Blue-1020, morning
RAGUL (shocked): Planet? So this isn't Earth?
  ta: Planet-ah? Appo idhu Boomi illaya?
NARRATOR: Snow falls.
  ta: Pani kottudhu.
@choice home
  - Ask how to get home -> ask
    ta: Veetuku yepdi? -> ask
  - Say nothing -> quiet
    ta: Onnum pesadha
@label ask
@set asked
@if asked -> done
DHANASREE: unreachable
  ta: unreachable
@label quiet
@set quiet = 3
@label done
@battle vale_pair
@give red_rosoar 2
@end
DHANASREE: after end
  ta: after end
`;

class FakeHost implements StoryHost {
  said: string[] = [];
  cmds: string[] = [];
  flags: Record<string, FlagValue> = {};
  constructor(private picks: number[] = []) {}
  async say(speaker: string, mood: string | undefined, text: Loc) { this.said.push(`${speaker}${mood ? `(${mood})` : ''}:${text.en}|${text.ta}`); }
  async title(t: Loc) { this.said.push(`title:${t.en}|${t.ta}`); }
  async warn(t: Loc) { this.said.push(`warn:${t.en}`); }
  async objective(t: Loc) { this.said.push(`objective:${t.en}`); }
  async caption(t: Loc) { this.said.push(`caption:${t.en}`); }
  async choose(o: Loc[]) { return this.picks.shift() ?? 0; }
  async command(name: string, args: string[]): Promise<void> { this.cmds.push([name, ...args].join(' ')); }
  getFlag(f: string) { return this.flags[f]; }
  setFlag(f: string, v: FlagValue) { this.flags[f] = v; }
}

describe('parser', () => {
  test('parses a script without errors', () => {
    const s = parseStory(SAMPLE, 'sample');
    expect(s.errors).toEqual([]);
    const line = s.nodes.find((n) => n.k === 'line');
    expect(line).toMatchObject({ speaker: 'ragul', mood: 'shocked', text: { en: "Planet? So this isn't Earth?", ta: 'Planet-ah? Appo idhu Boomi illaya?' } });
    const choice = s.nodes.find((n) => n.k === 'choice');
    expect(choice).toMatchObject({ id: 'home', options: [{ target: 'ask', text: { ta: 'Veetuku yepdi?' } }, { target: 'quiet' }] });
    expect(s.nodes.filter((n) => n.k === 'cmd').map((n) => n.k === 'cmd' && n.name)).toEqual(['venture', 'scene', 'time', 'battle', 'give']);
  });

  test('reports errors with line numbers', () => {
    const s = parseStory('@goto nowhere\n@bogus x\n  ta: floating\nwhat is this\n@choice\n@scene a b', 'bad');
    const msgs = s.errors.map((e) => `${e.line}:${e.message}`);
    expect(msgs.some((m) => m.startsWith('1:unknown label'))).toBe(true);
    expect(msgs.some((m) => m.startsWith('2:unknown command'))).toBe(true);
    expect(msgs.some((m) => m.startsWith('3:"ta:" must be indented'))).toBe(true);
    expect(msgs.some((m) => m.startsWith("4:can't read"))).toBe(true);
    expect(msgs.some((m) => m.startsWith('5:@choice has no options'))).toBe(true);
    expect(msgs.some((m) => m.startsWith('6:@scene takes 1'))).toBe(true);
  });
});

describe('runtime', () => {
  test('runs lines, choices, flags and commands until @end', async () => {
    const host = new FakeHost([0]);
    await runStory(parseStory(SAMPLE), host);
    expect(host.said[0]).toBe('title:The Winter Path|Winter Path');
    expect(host.said).toContain("ragul(shocked):Planet? So this isn't Earth?|Planet-ah? Appo idhu Boomi illaya?");
    expect(host.said.some((l) => l.includes('unreachable'))).toBe(false);
    expect(host.said.some((l) => l.includes('after end'))).toBe(false);
    expect(host.flags).toMatchObject({ asked: true, 'choice.home': 'ask' });
    expect(host.cmds).toEqual(['venture 2 15', 'scene winter_path', 'time 1 Blue-1020, morning', 'battle vale_pair', 'give red_rosoar 2']);
  });

  test('the other branch sets its own flags', async () => {
    const host = new FakeHost([1]);
    await runStory(parseStory(SAMPLE), host);
    expect(host.flags.quiet).toBe(3);
    expect(host.flags.asked).toBeUndefined();
  });

  test('refuses to run a script with errors', async () => {
    await expect(runStory(parseStory('@goto x'), new FakeHost())).rejects.toThrow();
  });
});
