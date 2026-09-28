import { isKnownMember, newGame, type GameState } from './GameState';
import { readJSON, storage, writeJSON, type KV } from './Storage';

export const SLOT_COUNT = 3;
const PREFIX = 'efil.save.';

export interface SaveMeta {
  slot: number;
  savedAt: string;
  playtimeMs: number;
  roomName: string;
  venture: { purpose: number; venture: number };
  level: number;
}

interface SaveFile {
  format: 'efil-save';
  version: 1;
  meta: SaveMeta;
  state: GameState;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/**
 * Rebuilds a GameState from untrusted JSON: unknown fields are dropped, missing fields get defaults,
 * so an old or hand-edited save never crashes the game. Returns null when it isn't a save at all.
 */
export function sanitizeState(raw: unknown): GameState | null {
  if (!isObj(raw) || raw.version !== 1) return null;
  const d = newGame();
  const s: GameState = { ...d };
  const num = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) ? v : def);
  s.playtimeMs = num(raw.playtimeMs, 0);
  if (isObj(raw.location) && typeof raw.location.room === 'string') {
    s.location = {
      room: raw.location.room,
      x: num(raw.location.x, 0),
      y: num(raw.location.y, 0),
      checkpoint: typeof raw.location.checkpoint === 'string' ? raw.location.checkpoint : null,
    };
  }
  if (isObj(raw.venture)) s.venture = { purpose: num(raw.venture.purpose, 1), venture: num(raw.venture.venture, 1) };
  s.party = strArr(raw.party).filter(isKnownMember);
  s.members = {};
  if (isObj(raw.members)) {
    for (const [id, m] of Object.entries(raw.members)) {
      if (!isKnownMember(id) || !isObj(m)) continue;
      s.members[id] = {
        level: Math.max(1, Math.floor(num(m.level, 1))),
        xp: Math.max(0, num(m.xp, 0)),
        hp: Math.max(0, num(m.hp, 1)),
        keepsake: typeof m.keepsake === 'string' ? m.keepsake : null,
      };
    }
  }
  s.party = s.party.filter((id) => s.members[id]);
  if (!s.party.length) return null;
  s.inventory = {};
  if (isObj(raw.inventory)) {
    for (const [k, v] of Object.entries(raw.inventory)) if (typeof v === 'number' && v > 0) s.inventory[k] = Math.floor(v);
  }
  s.riShards = Math.max(0, Math.floor(num(raw.riShards, 0)));
  s.abilities = strArr(raw.abilities);
  s.flags = {};
  if (isObj(raw.flags)) {
    for (const [k, v] of Object.entries(raw.flags)) {
      if (typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string') s.flags[k] = v;
    }
  }
  s.relationships = {};
  if (isObj(raw.relationships)) {
    for (const [k, v] of Object.entries(raw.relationships)) if (typeof v === 'number') s.relationships[k] = v;
  }
  s.codex = strArr(raw.codex);
  s.collected = strArr(raw.collected);
  s.defeated = strArr(raw.defeated);
  s.defeatedForever = strArr(raw.defeatedForever);
  s.visitedRooms = strArr(raw.visitedRooms);
  s.soulHunger = Math.min(100, Math.max(0, num(raw.soulHunger, d.soulHunger)));
  s.soulsAbsorbed = Math.max(0, Math.floor(num(raw.soulsAbsorbed, 0)));
  s.ammo = Math.min(6, Math.max(0, Math.floor(num(raw.ammo, 6))));
  return s;
}

export class SaveSystem {
  constructor(private kv: KV = storage) {}

  save(slot: number, state: GameState, roomName: string): SaveMeta | null {
    if (slot < 1 || slot > SLOT_COUNT) return null;
    const meta: SaveMeta = {
      slot,
      savedAt: new Date().toISOString(),
      playtimeMs: state.playtimeMs,
      roomName,
      venture: { ...state.venture },
      level: Math.max(...state.party.map((id) => state.members[id]?.level ?? 1)),
    };
    const file: SaveFile = { format: 'efil-save', version: 1, meta, state: structuredClone(state) };
    return writeJSON(this.kv, PREFIX + slot, file) ? meta : null;
  }

  load(slot: number): GameState | null {
    const file = readJSON<Partial<SaveFile>>(this.kv, PREFIX + slot);
    if (!file || file.format !== 'efil-save') return null;
    return sanitizeState(file.state);
  }

  meta(slot: number): SaveMeta | null {
    const file = readJSON<Partial<SaveFile>>(this.kv, PREFIX + slot);
    if (!file || file.format !== 'efil-save' || !isObj(file.meta)) return null;
    return file.meta as SaveMeta;
  }

  list(): (SaveMeta | null)[] {
    return Array.from({ length: SLOT_COUNT }, (_, i) => this.meta(i + 1));
  }

  latest(): SaveMeta | null {
    return this.list()
      .filter((m): m is SaveMeta => !!m)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0] ?? null;
  }

  remove(slot: number): void {
    this.kv.remove(PREFIX + slot);
  }
}

export const saves = new SaveSystem();
