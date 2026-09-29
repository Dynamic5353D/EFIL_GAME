/**
 * Word battles (plan.md, "Persuade / Deceive / Endure against a Resolve bar"): arguments,
 * interrogations and pleas fought with words. Pure logic, no Phaser, so it is unit-tested.
 *
 * Each round the opponent shows a stance. Every move works well, normally or badly against a stance.
 * You win by bringing the opponent's Resolve to 0 (or, in `endure` battles, by holding out for a
 * number of rounds) while keeping your Composure above 0.
 */
import { loc, type Loc } from '../core/Localization';
import { nextRandom } from '../core/rng';

type Rng = { seed: number };

export type StanceId = 'mocking' | 'pressing' | 'wavering' | 'afraid' | 'enraged' | 'guarded' | 'cold' | 'grieving' | 'pleading';
export type MoveId = 'persuade' | 'deceive' | 'endure' | 'threaten' | 'comfort' | 'truth' | 'deny';

export interface StanceDef {
  id: StanceId;
  name: Loc;
  /** A short read of the stance, shown on screen. */
  hint: Loc;
  strong: MoveId[];
  weak: MoveId[];
  /** Composure damage the opponent deals this round (before modifiers). */
  pressure: number;
}

export interface MoveDef {
  id: MoveId;
  /** Resolve damage before modifiers. */
  power: number;
  /** Multiplier on the pressure taken this round. */
  guard: number;
  /** Composure restored. */
  heal: number;
}

export const STANCES: Record<StanceId, StanceDef> = {
  mocking: {
    id: 'mocking', name: loc('Mocking', 'Kindal'), pressure: 15,
    hint: loc('Wants a reaction. Staying calm takes the sting out; arguing feeds it.', 'Reaction-ukkaaga kaathirukaan. Amaidhiya iru; vaadham panna adhukku theeni.'),
    strong: ['endure', 'truth'], weak: ['persuade', 'comfort'],
  },
  pressing: {
    id: 'pressing', name: loc('Pressing', 'Nerukkudhal'), pressure: 21,
    hint: loc('Pushing hard for an answer. Anything you give away is used against you; hold firm or deny.', 'Badhil venum-nu nerukkuraanga. Nee solradhu ellam unakke edhira thirumbum; urudhiya iru, illa maru.'),
    strong: ['endure', 'deny'], weak: ['deceive', 'comfort', 'truth'],
  },
  wavering: {
    id: 'wavering', name: loc('Wavering', 'Thadumaattam'), pressure: 7,
    hint: loc('Unsure now. This is the moment to reason, or to reach out.', 'Ippo sandhegam. Idhu dhaan pesura neram, illa kai neetura neram.'),
    strong: ['persuade', 'comfort', 'truth'], weak: ['threaten'],
  },
  afraid: {
    id: 'afraid', name: loc('Afraid', 'Bayam'), pressure: 8,
    hint: loc('Frightened. Gentleness gets through; force makes it worse.', 'Bayandhu irukaanga. Menmai ulla pogum; vegam mosamaakkum.'),
    strong: ['comfort', 'truth'], weak: ['threaten', 'deceive'],
  },
  enraged: {
    id: 'enraged', name: loc('Enraged', 'Kobam'), pressure: 25,
    hint: loc('Furious. Words bounce off; weather it, or stand your ground.', 'Kadum kobam. Vaarthai ottaadhu; thaangu, illa nilaiya nillu.'),
    strong: ['endure', 'threaten'], weak: ['persuade', 'deceive'],
  },
  guarded: {
    id: 'guarded', name: loc('Guarded', 'Ushaar'), pressure: 13,
    hint: loc('Walls up. Only something real, or a clever angle, gets past.', 'Suvar potrukaanga. Unmai, illa oru saamarthiyam dhaan thaandum.'),
    strong: ['truth', 'deceive'], weak: ['persuade'],
  },
  cold: {
    id: 'cold', name: loc('Cold', 'Kalla manasu'), pressure: 17,
    hint: loc('Unmoved. Kindness slides off; only pressure or proof lands.', 'Asaiyala. Anbu vazhukkum; azhuththam, illa aadhaaram dhaan padum.'),
    strong: ['threaten', 'truth'], weak: ['comfort', 'endure'],
  },
  grieving: {
    id: 'grieving', name: loc('Grieving', 'Sogam'), pressure: 10,
    hint: loc('Hurting. Be there; don\'t argue.', 'Valikkudhu. Kooda iru; vaadham venaam.'),
    strong: ['comfort', 'endure'], weak: ['persuade', 'threaten', 'deceive'],
  },
  pleading: {
    id: 'pleading', name: loc('Pleading', 'Kenjal'), pressure: 14,
    hint: loc('Begging you to stop. Holding firm hurts; giving an inch loses everything.', 'Niruththa sollikenjuraanga. Urudhiya irukradhu valikkum; konjam vitta ellam pogum.'),
    strong: ['deny', 'truth'], weak: ['comfort', 'deceive'],
  },
};

export const MOVES: Record<MoveId, MoveDef> = {
  persuade: { id: 'persuade', power: 20, guard: 1, heal: 0 },
  deceive: { id: 'deceive', power: 24, guard: 1.1, heal: 0 },
  endure: { id: 'endure', power: 8, guard: 0.4, heal: 6 },
  threaten: { id: 'threaten', power: 26, guard: 1.15, heal: 0 },
  comfort: { id: 'comfort', power: 17, guard: 0.9, heal: 4 },
  truth: { id: 'truth', power: 21, guard: 1, heal: 2 },
  deny: { id: 'deny', power: 14, guard: 0.7, heal: 3 },
};

export type Effect = 'strong' | 'normal' | 'weak';

export function effectOf(stance: StanceId, move: MoveId): Effect {
  const s = STANCES[stance];
  return s.strong.includes(move) ? 'strong' : s.weak.includes(move) ? 'weak' : 'normal';
}

/** A line in a word battle's intro or ending, said by your side, the opponent or the narrator. */
export interface WordLine { who: 'you' | 'foe' | 'narrator'; text: Loc }

/** A move as a particular battle presents it: its name and the lines the speaker says with it. */
export interface WordMove {
  move: MoveId;
  name: Loc;
  desc: Loc;
  lines: Loc[];
}

export interface WordBattleDef {
  id: string;
  title: Loc;
  /** Your side's speaker and the opponent's (data/speakers.ts). */
  you: string;
  foe: string;
  /** 'resolve': bring Resolve to 0. 'endure': keep Composure above 0 for `rounds` rounds. */
  mode: 'resolve' | 'endure';
  resolve: number;
  composure: number;
  rounds?: number;
  moves: WordMove[];
  /** Stances the opponent takes, with weights, and what they say in each. */
  stances: { stance: StanceId; weight: number; lines: Loc[] }[];
  intro: WordLine[];
  /** Said by the opponent when a move lands well, or badly. */
  hurt: Loc[];
  shrug: Loc[];
  win: WordLine[];
  lose: Loc;
  /** The goal as shown under the title. */
  goal: Loc;
  music?: string;
}

export interface WordState {
  def: WordBattleDef;
  rng: Rng;
  resolve: number;
  composure: number;
  round: number;
  stance: StanceId;
  /** How many times each opponent line has been used, to vary them. */
  used: Record<string, number>;
  outcome: 'won' | 'lost' | null;
  last: StanceId | null;
}

export interface RoundResult {
  effect: Effect;
  damage: number;
  taken: number;
  healed: number;
}

const rand = (st: WordState) => nextRandom(st.rng);

export function createWord(def: WordBattleDef, seed: number): WordState {
  const st: WordState = {
    def, rng: { seed: seed | 0 }, resolve: def.resolve, composure: def.composure, round: 0,
    stance: def.stances[0]!.stance, used: {}, outcome: null, last: null,
  };
  st.stance = pickStance(st);
  return st;
}

/** Chooses the next stance: weighted, rarely the same twice, and more often wavering when nearly beaten. */
export function pickStance(st: WordState): StanceId {
  const low = st.def.mode === 'resolve' && st.resolve < st.def.resolve * 0.35;
  const opts = st.def.stances.map((s) => {
    let w = s.weight;
    if (s.stance === st.last) w *= 0.35;
    if (low && (s.stance === 'wavering' || s.stance === 'afraid' || s.stance === 'grieving')) w *= 2.5;
    return { s: s.stance, w };
  });
  const total = opts.reduce((a, o) => a + o.w, 0);
  let r = rand(st) * total;
  for (const o of opts) {
    r -= o.w;
    if (r <= 0) return o.s;
  }
  return opts[opts.length - 1]!.s;
}

/** Plays one round with the player's move. Mutates the state and returns what happened. */
export function playRound(st: WordState, move: MoveId): RoundResult {
  if (st.outcome) return { effect: 'normal', damage: 0, taken: 0, healed: 0 };
  const m = MOVES[move];
  const effect = effectOf(st.stance, move);
  const k = effect === 'strong' ? 1.8 : effect === 'weak' ? 0.45 : 1;
  const jitter = () => 0.85 + rand(st) * 0.3;
  const damage = st.def.mode === 'resolve' ? Math.round(m.power * k * jitter()) : 0;
  st.resolve = Math.max(0, st.resolve - damage);
  const healed = Math.min(st.def.composure - st.composure, Math.round(m.heal * (effect === 'weak' ? 0.5 : 1)));
  st.composure += healed;
  st.round += 1;
  let taken = 0;
  const won = st.def.mode === 'resolve' ? st.resolve <= 0 : st.round >= (st.def.rounds ?? 6);
  if (!won) {
    // A wrong answer leaves you open, however defensive the move.
    const guard = effect === 'weak' ? Math.max(1, m.guard) * 1.3 : effect === 'strong' ? m.guard * 0.55 : m.guard;
    const pressure = STANCES[st.stance].pressure * guard;
    taken = Math.round(pressure * jitter());
    st.composure = Math.max(0, st.composure - taken);
  }
  if (won) st.outcome = 'won';
  else if (st.composure <= 0) st.outcome = 'lost';
  else {
    st.last = st.stance;
    st.stance = pickStance(st);
  }
  return { effect, damage, taken, healed };
}

/** Picks one of several lines, cycling so the same one isn't repeated back to back. */
export function lineFor(st: WordState, key: string, lines: Loc[]): Loc {
  if (!lines.length) return loc('...');
  const n = st.used[key] ?? 0;
  st.used[key] = n + 1;
  return lines[n % lines.length]!;
}

export function stanceLines(st: WordState): Loc[] {
  return st.def.stances.find((s) => s.stance === st.stance)?.lines ?? [];
}
