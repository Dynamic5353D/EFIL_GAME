import type { Loc } from '../core/Localization';
import type { Stats } from '../data/characters';

export type Side = 'party' | 'enemy';
export type Element = 'physical' | 'fire' | 'light' | 'shatter' | 'water' | 'soul' | 'none';

export type StatusId =
  | 'doom'      // dies when the count reaches 0 (Death Touch)
  | 'regen'     // Vale: bursts into ink instead of dying, unless finished by fire/light/shatter/water
  | 'ink'       // a burst Vale; re-forms when the count reaches 0
  | 'shadow'    // Vale ghost form: immune to everything but light, cannot act
  | 'armored'   // blocks Death Touch, halves physical damage; broken by shatter
  | 'blind'     // physical attacks miss half the time
  | 'fear'      // attack -30%; Dharshna's Heat drains
  | 'foresight' // Loop Sense: enemy intents are visible
  | 'guard'     // defending: damage halved until the unit's next turn
  | 'starving'; // Ragul's Soul Hunger is high: attack -20%, may lose a turn to a migraine

export interface Status {
  id: StatusId;
  /** Turns left, counted down at the start of the owner's turn. -1 = until removed. */
  turns: number;
}

export interface Resources {
  ce?: number;      // Dhanasree's cube energy
  ceMax?: number;
  ammo?: number;    // Dhanasree's handgun
  heat?: number;    // Dharshna's Heat, 0-100
}

export interface Intent {
  skill: string;
  target: string;
}

export interface Unit {
  id: string;
  kind: string;          // member id or enemy def id
  side: Side;
  name: Loc;
  stats: Stats;
  hp: number;
  statuses: Status[];
  tags: string[];
  skills: string[];
  ai?: string;
  /** Timeline position of this unit's next turn. Lowest acts first. */
  next: number;
  /** Party: knocked out. Enemy: destroyed for good. */
  dead: boolean;
  intent?: Intent;
  res: Resources;
  xp?: number;
  shards?: number;
  drops?: { item: string; chance: number }[];
  /** Turns since this enemy last used Shadow Meld. */
  meldCooldown?: number;
}

export type BattleEvent =
  | { t: 'turn'; unit: string }
  | { t: 'act'; unit: string; skill: string; targets: string[] }
  | { t: 'damage'; target: string; amount: number; element: Element; miss?: boolean; blocked?: 'armored' | 'immune' | 'guard'; weak?: boolean }
  | { t: 'heal'; target: string; amount: number }
  | { t: 'status'; target: string; status: StatusId; on: boolean }
  | { t: 'ink'; target: string }
  | { t: 'reform'; target: string }
  | { t: 'destroy'; target: string; how: Element | 'doom' | 'absorb' }
  | { t: 'ko'; target: string }
  | { t: 'doom'; target: string; left: number }
  | { t: 'fail'; unit: string; reason: Loc }
  | { t: 'resource'; unit: string; key: keyof Resources; value: number }
  | { t: 'rewind' }
  | { t: 'outcome'; result: 'won' | 'lost' | 'fled' };

export interface BattleState {
  id: string;
  units: Unit[];
  time: number;
  turns: number;
  rng: { seed: number };
  active: string | null;
  /** True while waiting for the player to pick a command for `active`. */
  awaitingInput: boolean;
  events: BattleEvent[];
  rewindUsed: boolean;
  /** State at the start of each Dhanasree turn, oldest first (for Rewind). */
  snapshots: string[];
  outcome: null | 'won' | 'lost' | 'fled';
  canFlee: boolean;
  /** A daydream fight: no Soul Hunger, no rewards. */
  dream: boolean;
  soulHunger: number;
  soulsAbsorbed: number;
  inventory: Record<string, number>;
  /** Free (turn-keeping) skills already used this turn. */
  freeUsed: string[];
}
