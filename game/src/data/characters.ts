import { loc, type Loc } from '../core/Localization';

export type MemberId = 'ragul' | 'dhanasree' | 'nithish' | 'dharshna';

export interface Stats {
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface CharacterDef {
  id: MemberId;
  name: Loc;
  /** Glowing vein colour (plan: Ragul blue, Dhanasree green, Nithish red, Dharshna yellow). */
  vein: number;
  /** Silhouette body colours for the procedural rig. */
  body: number;
  cloth: number;
  base: Stats;
  growth: Stats;
  skills: string[];
  /** Rig proportions (1 = default). */
  build: { height: number; width: number; hair: 'short' | 'long' | 'ponytail' | 'messy'; glasses?: boolean };
}

export const CHARACTERS: Record<MemberId, CharacterDef> = {
  ragul: {
    id: 'ragul',
    name: loc('Ragul'),
    vein: 0x5cc8ff,
    body: 0x10141f,
    cloth: 0x1d3a66,
    base: { maxHp: 72, atk: 11, def: 7, spd: 10 },
    growth: { maxHp: 7, atk: 1.4, def: 0.8, spd: 0.5 },
    skills: ['strike', 'death_touch', 'soul_absorb'],
    build: { height: 1.0, width: 1.0, hair: 'messy', glasses: true },
  },
  dhanasree: {
    id: 'dhanasree',
    name: loc('Dhanasree'),
    vein: 0x6dffa8,
    body: 0x11161a,
    cloth: 0x2c3b35,
    base: { maxHp: 64, atk: 12, def: 6, spd: 13 },
    growth: { maxHp: 6, atk: 1.5, def: 0.7, spd: 0.7 },
    skills: ['staff_strike', 'light_cube', 'resonance_cube', 'handgun', 'loop_sense', 'rewind'],
    build: { height: 0.94, width: 0.9, hair: 'ponytail' },
  },
  nithish: {
    id: 'nithish',
    name: loc('Nithish'),
    vein: 0xff5a5a,
    body: 0x17120f,
    cloth: 0x5a1f1f,
    base: { maxHp: 95, atk: 14, def: 9, spd: 8 },
    growth: { maxHp: 9, atk: 1.7, def: 1.0, spd: 0.4 },
    skills: ['strike'],
    build: { height: 1.06, width: 1.15, hair: 'short' },
  },
  dharshna: {
    id: 'dharshna',
    name: loc('Dharshna'),
    vein: 0xffc94a,
    body: 0x17130f,
    cloth: 0x4a3322,
    base: { maxHp: 58, atk: 10, def: 5, spd: 11 },
    growth: { maxHp: 5, atk: 1.3, def: 0.6, spd: 0.6 },
    skills: ['fire_whip', 'fire_triangles', 'fire_laser'],
    build: { height: 0.92, width: 0.88, hair: 'long' },
  },
};

export function xpToNext(level: number): number {
  return Math.round(24 + level * 18 + level * level * 2);
}

export function statsAt(id: MemberId, level: number): Stats {
  const c = CHARACTERS[id];
  const l = level - 1;
  return {
    maxHp: Math.round(c.base.maxHp + c.growth.maxHp * l),
    atk: Math.round(c.base.atk + c.growth.atk * l),
    def: Math.round(c.base.def + c.growth.def * l),
    spd: Math.round(c.base.spd + c.growth.spd * l),
  };
}
