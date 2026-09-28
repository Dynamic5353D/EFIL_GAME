import { expect, test } from 'bun:test';
import { ACTIONS } from '../src/core/Settings';
import { TIPS } from '../src/data/tips';

const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();

test('every tip has English and Tanglish text with the same, valid key placeholders', () => {
  for (const t of Object.values(TIPS)) {
    for (const part of [t.title, t.body]) {
      expect(part.en.trim().length, t.id).toBeGreaterThan(0);
      expect(part.ta.trim().length, t.id).toBeGreaterThan(0);
      expect(holes(part.ta), t.id).toEqual(holes(part.en));
      for (const h of holes(part.en)) expect((ACTIONS as readonly string[]).includes(h), `${t.id}: {${h}}`).toBe(true);
    }
  }
});
