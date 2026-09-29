import { expect, test } from 'bun:test';
import { createWord, effectOf, MOVES, playRound, STANCES, type MoveId, type WordState } from '../src/battle/WordCore';
import { SPEAKERS } from '../src/data/speakers';
import { WORD_BATTLES } from '../src/data/wordbattles';

const texts = (d: (typeof WORD_BATTLES)[string]) => [
  d.title, d.goal, d.lose, ...d.hurt, ...d.shrug,
  ...d.intro.map((l) => l.text), ...d.win.map((l) => l.text),
  ...d.moves.flatMap((m) => [m.name, m.desc, ...m.lines]),
  ...d.stances.flatMap((s) => s.lines),
];

test('every word battle is complete, in both languages, with known speakers', () => {
  for (const d of Object.values(WORD_BATTLES)) {
    expect(SPEAKERS[d.you], d.id).toBeDefined();
    expect(SPEAKERS[d.foe], d.id).toBeDefined();
    expect(d.moves.length, d.id).toBeGreaterThan(1);
    for (const m of d.moves) expect(m.lines.length, `${d.id} ${m.move}`).toBeGreaterThan(0);
    for (const s of d.stances) expect(s.lines.length, `${d.id} ${s.stance}`).toBeGreaterThan(0);
    for (const t of texts(d)) {
      expect(t.en.trim().length, d.id).toBeGreaterThan(0);
      expect(t.ta.trim().length, `${d.id}: ${t.en}`).toBeGreaterThan(0);
    }
  }
});

test('every stance a battle uses has an answer among that battle\'s moves', () => {
  for (const d of Object.values(WORD_BATTLES)) {
    const moves = d.moves.map((m) => m.move);
    for (const s of d.stances) {
      expect(moves.some((m) => effectOf(s.stance, m) === 'strong'), `${d.id}: nothing answers ${s.stance}`).toBe(true);
    }
  }
});

function play(id: string, pick: (st: WordState, moves: MoveId[]) => MoveId, seed: number) {
  const d = WORD_BATTLES[id]!;
  const st = createWord(d, seed);
  const moves = d.moves.map((m) => m.move);
  for (let i = 0; i < 60 && !st.outcome; i++) playRound(st, pick(st, moves));
  return st;
}

const best = (st: WordState, moves: MoveId[]) =>
  moves.find((m) => effectOf(st.stance, m) === 'strong') ?? moves.find((m) => effectOf(st.stance, m) === 'normal') ?? moves[0]!;
const worst = (st: WordState, moves: MoveId[]) =>
  moves.find((m) => effectOf(st.stance, m) === 'weak') ?? moves.find((m) => effectOf(st.stance, m) === 'normal') ?? moves[0]!;

test('reading the stances wins every battle; ignoring them usually loses', () => {
  for (const id of Object.keys(WORD_BATTLES)) {
    let wins = 0, worstWins = 0;
    for (let seed = 1; seed <= 40; seed++) {
      if (play(id, best, seed).outcome === 'won') wins++;
      if (play(id, worst, seed * 7).outcome === 'won') worstWins++;
    }
    expect(wins, `${id} with good play`).toBe(40);
    expect(worstWins, `${id} with bad play`).toBeLessThan(30);
  }
});

test('stance tables are consistent', () => {
  for (const s of Object.values(STANCES)) {
    for (const m of s.strong) expect(s.weak.includes(m), `${s.id} ${m}`).toBe(false);
    for (const m of [...s.strong, ...s.weak]) expect(MOVES[m]).toBeDefined();
  }
});
