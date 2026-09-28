import { CHARACTERS, statsAt, xpToNext, type MemberId, type Stats } from '../data/characters';
import { ITEMS } from '../data/items';

export type FlagValue = boolean | number | string;

export interface MemberState {
  level: number;
  xp: number;
  hp: number;
  keepsake: string | null;
}

export interface GameState {
  version: 1;
  playtimeMs: number;
  /** Where the player is. On load they appear at `checkpoint` if set, else at (x, y) in `room`. */
  location: { room: string; x: number; y: number; checkpoint: string | null };
  venture: { purpose: number; venture: number };
  party: MemberId[];
  members: Partial<Record<MemberId, MemberState>>;
  inventory: Record<string, number>;
  riShards: number;
  abilities: string[];
  flags: Record<string, FlagValue>;
  /** Relationship values, keyed "a.b" with ids sorted. */
  relationships: Record<string, number>;
  codex: string[];
  /** One-time pickups and chests already taken. */
  collected: string[];
  /** Enemies beaten since the last rest (they respawn when you rest). */
  defeated: string[];
  /** Bosses and scripted enemies that never respawn. */
  defeatedForever: string[];
  visitedRooms: string[];
  /** Ragul's Soul Hunger, 0 (fed) to 100 (starving). It rises after every battle. */
  soulHunger: number;
  soulsAbsorbed: number;
  /** Dhanasree's handgun: 6 shots per rest. */
  ammo: number;
}

export function newMember(id: MemberId, level = 1): MemberState {
  return { level, xp: 0, hp: statsAt(id, level).maxHp, keepsake: null };
}

export function newGame(): GameState {
  return {
    version: 1,
    playtimeMs: 0,
    location: { room: 'frozen_shore', x: 0, y: 0, checkpoint: null },
    venture: { purpose: 2, venture: 15 },
    party: ['ragul'],
    members: { ragul: newMember('ragul', 2) },
    inventory: { red_rosoar: 2 },
    riShards: 0,
    abilities: ['sprint'],
    flags: {},
    relationships: {},
    codex: [],
    collected: [],
    defeated: [],
    defeatedForever: [],
    visitedRooms: [],
    soulHunger: 35,
    soulsAbsorbed: 0,
    ammo: 6,
  };
}

/** Stats with keepsake bonuses applied. */
export function memberStats(state: GameState, id: MemberId): Stats {
  const m = state.members[id];
  const s = statsAt(id, m?.level ?? 1);
  const mods = m?.keepsake ? ITEMS[m.keepsake]?.mods : undefined;
  if (mods) {
    for (const k of Object.keys(mods) as (keyof Stats)[]) s[k] += mods[k] ?? 0;
  }
  return s;
}

export function joinParty(state: GameState, id: MemberId, level = 1): void {
  if (!state.members[id]) state.members[id] = newMember(id, level);
  if (!state.party.includes(id)) state.party.push(id);
}

export function leaveParty(state: GameState, id: MemberId): void {
  state.party = state.party.filter((p) => p !== id);
}

/** Adds XP and returns the members who levelled up. HP grows with max HP on level-up. */
export function grantXp(state: GameState, amount: number): MemberId[] {
  const up: MemberId[] = [];
  for (const id of state.party) {
    const m = state.members[id];
    if (!m) continue;
    m.xp += amount;
    while (m.xp >= xpToNext(m.level)) {
      const before = memberStats(state, id).maxHp;
      m.xp -= xpToNext(m.level);
      m.level += 1;
      m.hp += memberStats(state, id).maxHp - before;
      if (!up.includes(id)) up.push(id);
    }
  }
  return up;
}

export function addItem(state: GameState, id: string, n = 1): void {
  state.inventory[id] = (state.inventory[id] ?? 0) + n;
  if (state.inventory[id]! <= 0) delete state.inventory[id];
  const grant = ITEMS[id]?.grantsAbility;
  if (grant && n > 0 && !state.abilities.includes(grant)) state.abilities.push(grant);
}

export function relKey(a: string, b: string): string {
  return [a, b].sort().join('.');
}

/** Resting at a Red Rosoar tree: heal everyone, refill the handgun, respawn normal enemies. */
export function rest(state: GameState, checkpoint: string, room: string): void {
  for (const id of state.party) {
    const m = state.members[id];
    if (m) m.hp = memberStats(state, id).maxHp;
  }
  state.ammo = 6;
  state.defeated = [];
  state.location = { room, x: 0, y: 0, checkpoint };
}

export function isKnownMember(id: string): id is MemberId {
  return id in CHARACTERS;
}
