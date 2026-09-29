import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { newGame } from '../src/core/GameState';
import { FLAGS } from '../src/data/flags';
import { ITEMS } from '../src/data/items';
import { advanceQuests, completeQuest, currentStep, questList, startQuest } from '../src/px/quest/logic';
import { QUESTS } from '../src/px/quest/quests';

describe('quests', () => {
  test('definitions: both languages, known flags and items', () => {
    for (const q of Object.values(QUESTS)) {
      for (const t of [q.title, q.summary, ...q.steps.map((s) => s.text)]) {
        expect(t.en.trim().length, q.id).toBeGreaterThan(0);
        expect(t.ta.trim().length, q.id).toBeGreaterThan(0);
      }
      for (const s of q.steps) if (s.until) expect(FLAGS[s.until.flag], `${q.id}: ${s.until.flag}`).toBeDefined();
      for (const it of Object.keys(q.rewards.items ?? {})) expect(ITEMS[it], it).toBeDefined();
    }
  });

  test('counted steps advance in any order, and completing hands out rewards', () => {
    const st = newGame();
    startQuest(st, 'posters');
    expect(currentStep(st, 'posters')!.progress).toBe(' (0/3)');
    st.flags.px_posters_up = 2;
    expect(advanceQuests(st)).toEqual([]);
    expect(currentStep(st, 'posters')!.progress).toBe(' (2/3)');
    st.flags.px_posters_up = 3;
    expect(advanceQuests(st).map((e) => e.kind)).toEqual(['step']);
    expect(currentStep(st, 'posters')!.step.text.en).toContain('Richard');
    completeQuest(st, 'posters');
    expect(st.inventory.fest_pass).toBe(1);
    expect(st.members.ragul!.xp).toBeGreaterThan(0);
    expect(currentStep(st, 'posters')).toBeNull();
    expect(completeQuest(st, 'posters')).toEqual([]);
  });

  test('a quest taken late skips steps already done; main quests list first', () => {
    const st = newGame();
    st.flags.px_saw_road = true;
    startQuest(st, 'posters');
    startQuest(st, 'morning');
    expect(st.quests.morning!.step).toBe(1);
    expect(questList(st).map((q) => q.def.id)).toEqual(['morning', 'posters']);
  });

  test('every @quest in the scripts names a real quest', () => {
    const src = readFileSync(new URL('../src/story/px/campus.story', import.meta.url), 'utf8');
    for (const m of src.matchAll(/@quest (start|done) (\w+)/g)) expect(QUESTS[m[2]!], m[2]).toBeDefined();
  });
});
