import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { lintStory } from '../src/story/lint';

const ctx = { scenes: new Set(['winter_path']) };
const msgs = (src: string) => lintStory(src, 't.story', ctx).map((i) => `${i.line}:${i.message}`);

test('flags missing translations, unknown references and banned content', () => {
  const m = msgs([
    'RAGUL: Hello',                 // 1 missing ta
    'BOB: Hi', '  ta: Hi',          // 2 unknown speaker
    '@scene nowhere',               // 4
    '@battle nope',                 // 5
    '@set not_a_flag',              // 6
    '@tag sexual_minor',            // 7
    'RAGUL: thevdiya', '  ta: x',   // 8 banned word
  ].join('\n'));
  expect(m.some((x) => x.startsWith('1:missing Tanglish'))).toBe(true);
  expect(m.some((x) => x.startsWith('2:unknown speaker'))).toBe(true);
  expect(m.some((x) => x.startsWith('4:unknown scene'))).toBe(true);
  expect(m.some((x) => x.startsWith('5:unknown battle'))).toBe(true);
  expect(m.some((x) => x.startsWith('6:unknown flag'))).toBe(true);
  expect(m.some((x) => x.startsWith('7:banned content tag'))).toBe(true);
  expect(m.some((x) => x.startsWith('8:banned word'))).toBe(true);
});

test('the campus script is clean', () => {
  const src = readFileSync(new URL('../src/story/px/campus.story', import.meta.url), 'utf8');
  expect(msgs(src)).toEqual([]);
});
