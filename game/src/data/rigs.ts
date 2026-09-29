/**
 * Looks for the procedural silhouette rig. The four protagonists come from characters.ts; everyone else
 * (classmates, police, the daydream soldiers) is defined here. Colours are the silhouette body, the
 * clothing accent (scarf, collar band, cap) and, for the protagonists, the glowing veins.
 */
import { CHARACTERS, type MemberId } from './characters';

export type Hair = 'short' | 'long' | 'ponytail' | 'messy' | 'bun' | 'bald';

export interface RigStyle {
  id: string;
  body: number;
  cloth: number;
  /** Vein / eye glow colour. */
  vein: number;
  height: number;
  width: number;
  hair: Hair;
  glasses?: boolean;
  /** Police cap in this colour. */
  cap?: number;
  /** Trailing scarf (the protagonists). */
  scarf?: boolean;
  /** Glowing vein lines (the protagonists only; the powers are theirs). */
  veins?: boolean;
  /** Eyes glow in `vein` (the daydream soldiers). */
  glowEyes?: boolean;
}

const civ = (id: string, cloth: number, height: number, width: number, hair: Hair, extra: Partial<RigStyle> = {}): RigStyle => ({
  id, body: 0x14161c, cloth, vein: 0xd8e2f0, height, width, hair, ...extra,
});
const KHAKI = 0x8a7448;

export const NPC_RIGS: Record<string, RigStyle> = {
  arun: civ('arun', 0x3c5a7a, 1.0, 1.0, 'short'),
  krishnaa: civ('krishnaa', 0x6a3a2a, 1.12, 1.08, 'short'),
  kabi: civ('kabi', 0x4a4a2a, 1.0, 1.02, 'messy'),
  rawin: civ('rawin', 0x2a4a3a, 0.98, 0.95, 'short'),
  subramani: civ('subramani', 0x5a5a6a, 0.98, 1.0, 'short'),
  pranav: civ('pranav', 0x2a2a44, 1.04, 1.0, 'messy'),
  nelson: civ('nelson', 0x4a6a4a, 1.0, 0.98, 'short'),
  prassanna: civ('prassanna', 0x6a5a3a, 0.98, 1.0, 'short'),
  rithvick: civ('rithvick', 0x7a6a2a, 1.0, 1.05, 'messy'),
  senior: civ('senior', 0x1f1f2a, 1.06, 1.02, 'messy'),
  guy: civ('guy', 0x3a3a4a, 1.0, 1.0, 'short'),
  sneka: civ('sneka', 0x7a3a5a, 0.92, 0.9, 'ponytail'),
  sneya: civ('sneya', 0xb0602a, 0.9, 0.88, 'long'),
  vamika: civ('vamika', 0x5a3a7a, 0.92, 0.88, 'bun'),
  janani: civ('janani', 0x7a5aa0, 0.9, 0.88, 'long'),
  mahil: civ('mahil', 0x3a6a6a, 0.9, 0.88, 'ponytail'),
  girl: civ('girl', 0x6a4a5a, 0.9, 0.88, 'long'),
  veerabhadran: civ('veerabhadran', 0x9a9a8a, 0.96, 1.12, 'bald', { glasses: true }),
  dhanajay: civ('dhanajay', 0x5a5a5a, 1.0, 1.05, 'short', { glasses: true }),
  pugazhendi: civ('pugazhendi', 0x7a7a7a, 0.98, 1.05, 'bald'),
  vendor: civ('vendor', 0x8a5a2a, 0.96, 1.08, 'short'),
  security: civ('security', 0x3a4a6a, 1.0, 1.05, 'short', { cap: 0x2a3a5a }),
  rajesh: civ('rajesh', KHAKI, 1.1, 1.12, 'short', { cap: KHAKI }),
  police: civ('police', KHAKI, 1.04, 1.06, 'short', { cap: KHAKI }),
  ramanan: civ('ramanan', KHAKI, 1.02, 1.1, 'short', { cap: KHAKI }),
  nagaraj: civ('nagaraj', KHAKI, 1.0, 1.14, 'short', { cap: KHAKI }),
  mufti: civ('mufti', 0x4a4038, 1.04, 1.06, 'short'),
  // The man in the red shirt on the morning of the first death (it was Nithish).
  red_shirt: civ('red_shirt', 0x9a2020, 1.06, 1.15, 'short'),
  dance_girl: civ('dance_girl', 0xb0306a, 0.92, 0.88, 'ponytail'),
  // Parents and elders (Act I).
  mother: civ('mother', 0x8a4a3a, 0.9, 1.02, 'bun'),
  amsa: civ('amsa', 0x3a6a4a, 0.9, 1.04, 'bun'),
  appa: civ('appa', 0x6a6a7a, 1.02, 1.06, 'short', { glasses: true }),
  vijaya: civ('vijaya', 0x6a1a2a, 0.98, 0.94, 'long'),
  dance_guy: civ('dance_guy', 0x2a6aa0, 1.02, 1.0, 'messy'),
  soldier: { id: 'soldier', body: 0x07080c, cloth: 0x10131c, vein: 0x49b8ff, height: 1.08, width: 1.05, hair: 'short', glowEyes: true },
  captain: { id: 'captain', body: 0x06070a, cloth: 0x1a2440, vein: 0x7fd4ff, height: 1.22, width: 1.2, hair: 'messy', glowEyes: true },
};

export function rigStyle(id: string): RigStyle {
  const m = CHARACTERS[id as MemberId];
  if (m) {
    return {
      id, body: m.body, cloth: m.cloth, vein: m.vein, height: m.build.height, width: m.build.width, hair: m.build.hair,
      glasses: m.build.glasses, scarf: true, veins: true,
    };
  }
  return NPC_RIGS[id] ?? NPC_RIGS.guy!;
}
