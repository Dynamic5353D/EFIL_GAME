import { loc, type Loc } from '../core/Localization';
import type { MemberId, Stats } from './characters';

export interface EnemyDef {
  id: string;
  name: Loc;
  stats: Stats;
  tags: string[];              // vale, boss, glacian, soulless ...
  statuses: { id: string; turns: number }[]; // starting statuses (turns -1 = until removed)
  skills: string[];
  ai: string;
  xp: number;
  shards: number;
  drops?: { item: string; chance: number }[];
  /** Battle/world sprite: manifest cut-out slug and display height in px. */
  sprite: { slug: string; height: number; eyes?: { x: number; y: number; color: number }[]; blend?: 'add' };
  codex?: string;
}

export const ENEMIES: Record<string, EnemyDef> = {
  vale: {
    id: 'vale',
    name: loc('Vale', 'Vale'),
    stats: { maxHp: 46, atk: 10, def: 4, spd: 9 },
    tags: ['vale'],
    statuses: [{ id: 'regen', turns: -1 }],
    skills: ['lash', 'drain', 'dread', 'shadow_meld'],
    ai: 'vale',
    xp: 14,
    shards: 6,
    drops: [{ item: 'red_rosoar', chance: 0.2 }],
    sprite: { slug: 'vale', height: 250, eyes: [{ x: 0.66, y: 0.155, color: 0x49b8ff }, { x: 0.715, y: 0.16, color: 0x49b8ff }] },
    codex: 'vales',
  },
  vale_husk: {
    id: 'vale_husk',
    name: loc('Ice-crusted Vale', 'Pani-moodiya Vale'),
    stats: { maxHp: 62, atk: 12, def: 7, spd: 7 },
    tags: ['vale'],
    statuses: [{ id: 'regen', turns: -1 }, { id: 'armored', turns: -1 }],
    skills: ['crush', 'lash', 'dread'],
    ai: 'vale',
    xp: 22,
    shards: 10,
    drops: [{ item: 'red_rosoar', chance: 0.35 }],
    sprite: { slug: 'vale', height: 290, eyes: [{ x: 0.66, y: 0.155, color: 0x9fe8ff }, { x: 0.715, y: 0.16, color: 0x9fe8ff }] },
    codex: 'vales',
  },
  // Ragul's anime daydream (Act I, Venture 8). The sprites are painted in code (world/GenSprites.ts).
  dream_soldier: {
    id: 'dream_soldier',
    name: loc('Masked soldier', 'Mugamoodi sippai'),
    stats: { maxHp: 38, atk: 9, def: 4, spd: 9 },
    tags: ['dream'],
    statuses: [],
    skills: ['rifle_butt', 'volley'],
    ai: 'soldier',
    xp: 0,
    shards: 0,
    sprite: { slug: 'gen_soldier', height: 250, eyes: [{ x: 0.56, y: 0.13, color: 0x49b8ff }] },
  },
  dream_captain: {
    id: 'dream_captain',
    name: loc('The Captain', 'Captain'),
    stats: { maxHp: 150, atk: 12, def: 6, spd: 10 },
    tags: ['dream', 'boss'],
    statuses: [],
    skills: ['saber', 'volley', 'rifle_butt'],
    ai: 'soldier',
    xp: 0,
    shards: 0,
    sprite: { slug: 'gen_captain', height: 320, eyes: [{ x: 0.55, y: 0.11, color: 0x49b8ff }] },
  },
};

export interface BattleDef {
  id: string;
  enemies: string[];
  canFlee: boolean;
  music: string;
  intro?: Loc;
  /** Losing restarts the fight at full health instead of ending the story (fights that must be won). */
  retry?: boolean;
  /** Replaces a member's skills for this fight (Ragul's imagined moves in the daydream). */
  skills?: Partial<Record<MemberId, string[]>>;
  /** No Soul Hunger, XP or rewards (not a real fight). */
  dream?: boolean;
}

export const BATTLES: Record<string, BattleDef> = {
  vale_lone: { id: 'vale_lone', enemies: ['vale'], canFlee: true, music: 'battle', intro: loc('A Vale unfolds from the shadows!', 'Nizhalula irundhu oru Vale veliya varudhu!') },
  vale_pair: { id: 'vale_pair', enemies: ['vale', 'vale'], canFlee: true, music: 'battle', intro: loc('Two Vales slide out of the dark!', 'Irutla irundhu rendu Vale vandhuchu!') },
  dream_hallway: {
    id: 'dream_hallway', enemies: ['dream_soldier', 'dream_soldier'], canFlee: false, music: 'daydream', retry: true, dream: true,
    skills: { ragul: ['dream_slash', 'dream_burst', 'dream_shield'] },
    intro: loc('Two soldiers kick the door in. Not today.', 'Rendu sippaigal kadhava odachu ulla varaanga. Inniku illa.'),
  },
  dream_stairs: {
    id: 'dream_stairs', enemies: ['dream_soldier', 'dream_soldier', 'dream_soldier'], canFlee: false, music: 'daydream', retry: true, dream: true,
    skills: { ragul: ['dream_slash', 'dream_burst', 'dream_shield'] },
    intro: loc('More of them on the stairs.', 'Padikattula innum neraya.'),
  },
  dream_captain: {
    id: 'dream_captain', enemies: ['dream_captain'], canFlee: false, music: 'daydream', retry: true, dream: true,
    skills: { ragul: ['dream_slash', 'dream_burst', 'dream_shield'] },
    intro: loc('The Captain draws his sabre. "You\'re just a student."', 'Captain vaala uruvuraan. "Nee verum oru student."'),
  },
  vale_pack: { id: 'vale_pack', enemies: ['vale', 'vale_husk', 'vale'], canFlee: false, music: 'battle', intro: loc('The Vales have followed you out of the Cascades.', 'Cascades-la irundhu Vales pinnadiye vandhuruchu.') },
};
