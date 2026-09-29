import { addItem, grantXp, type GameState } from '../../core/GameState';
import { QUESTS, type QuestDef, type QuestStep } from './quests';

export type QuestEvent = { kind: 'started' | 'step' | 'done'; quest: QuestDef };

const stepMet = (st: GameState, s: QuestStep): boolean => {
  if (!s.until) return false;
  const v = st.flags[s.until.flag];
  const n = s.until.n;
  return n === undefined ? !!v : typeof v === 'number' && v >= n;
};

/** Moves every active quest past the steps whose conditions now hold. Returns what changed. */
export function advanceQuests(st: GameState): QuestEvent[] {
  const out: QuestEvent[] = [];
  for (const [id, q] of Object.entries(st.quests)) {
    const def = QUESTS[id];
    if (!def || q.done) continue;
    const before = q.step;
    while (q.step < def.steps.length && stepMet(st, def.steps[q.step]!)) q.step++;
    if (q.step !== before) out.push({ kind: 'step', quest: def });
  }
  return out;
}

export function startQuest(st: GameState, id: string): QuestEvent[] {
  const def = QUESTS[id];
  if (!def) throw new Error(`no quest "${id}"`);
  if (st.quests[id]) return [];
  st.quests[id] = { step: 0, done: false };
  // Steps already met (a board posted before the quest was taken) are skipped at once.
  advanceQuests(st);
  return [{ kind: 'started', quest: def }];
}

/** Finishes a quest and hands out its rewards. */
export function completeQuest(st: GameState, id: string): QuestEvent[] {
  const def = QUESTS[id];
  if (!def) throw new Error(`no quest "${id}"`);
  const q = st.quests[id] ?? (st.quests[id] = { step: 0, done: false });
  if (q.done) return [];
  q.step = def.steps.length;
  q.done = true;
  for (const [item, n] of Object.entries(def.rewards.items ?? {})) addItem(st, item, n);
  if (def.rewards.xp) grantXp(st, def.rewards.xp);
  for (const c of def.rewards.codex ?? []) if (!st.codex.includes(c)) st.codex.push(c);
  return [{ kind: 'done', quest: def }];
}

/** The step the player is on, with progress like (2/3) for counted steps. */
export function currentStep(st: GameState, id: string): { step: QuestStep; progress: string } | null {
  const def = QUESTS[id];
  const q = st.quests[id];
  if (!def || !q || q.done) return null;
  const step = def.steps[Math.min(q.step, def.steps.length - 1)]!;
  let progress = '';
  if (step.until?.n) {
    const v = st.flags[step.until.flag];
    progress = ` (${Math.min(step.until.n, typeof v === 'number' ? v : 0)}/${step.until.n})`;
  }
  return { step, progress };
}

/** Active quests first (main before side), then finished ones. */
export function questList(st: GameState): { def: QuestDef; done: boolean }[] {
  return Object.entries(st.quests)
    .filter(([id]) => QUESTS[id])
    .map(([id, q]) => ({ def: QUESTS[id]!, done: q.done }))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.def.kind === b.def.kind ? 0 : a.def.kind === 'main' ? -1 : 1));
}
