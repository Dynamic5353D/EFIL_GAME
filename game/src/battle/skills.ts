import { loc, type Loc } from '../core/Localization';
import type { Element, Resources } from './types';

export type TargetKind = 'enemy' | 'all_enemies' | 'ally' | 'self' | 'party';

export interface SkillDef {
  id: string;
  name: Loc;
  desc: Loc;
  target: TargetKind;
  element: Element;
  power: number;
  /** Turn-time multiplier: 1 is a normal action, higher delays the user's next turn. */
  delay: number;
  cost?: Partial<Record<keyof Resources, number>>;
  /** Minimum resource needed (e.g. Heat) without spending it all. */
  needs?: Partial<Record<keyof Resources, number>>;
  /** Doesn't end the turn (once per turn). */
  free?: boolean;
  oncePerBattle?: boolean;
  /** Can hit a Vale that has burst into ink. */
  hitsInk?: boolean;
  /** Ignores this fraction of defence. */
  pierce?: number;
  sfx?: string;
  vfx?: string;
}

const S = (d: SkillDef) => d;

export const SKILLS: Record<string, SkillDef> = {
  // ---------------------------------------------------------------- shared
  strike: S({ id: 'strike', name: loc('Strike', 'Adi'), desc: loc('A desperate punch.', 'Oru adi.'), target: 'enemy', element: 'physical', power: 1, delay: 1, sfx: 'hit', vfx: 'slash' }),
  defend: S({ id: 'defend', name: loc('Defend', 'Thadu'), desc: loc('Halve damage until your next turn.', 'Adutha turn varaikkum damage paadhi.'), target: 'self', element: 'none', power: 0, delay: 0.8, sfx: 'guard' }),
  item: S({ id: 'item', name: loc('Red Rosoar', 'Red Rosoar'), desc: loc('Eat a Red Rosoar fruit: restore 45% HP to an ally.', 'Red Rosoar saapdu: 45% HP.'), target: 'ally', element: 'none', power: 0, delay: 1, sfx: 'heal' }),
  flee: S({ id: 'flee', name: loc('Run', 'Odu'), desc: loc('Try to get away.', 'Thappikka try pannu.'), target: 'self', element: 'none', power: 0, delay: 1, sfx: 'dash' }),

  // ---------------------------------------------------------------- Ragul
  death_touch: S({
    id: 'death_touch', name: loc('Death Touch', 'Saavu Thodal'),
    desc: loc('Touch a foe and mark it with Doom: it dies in 3 turns. Fails against armour, Magic Guard and the strongest foes.',
      'Thottu Doom podu: 3 turn-la saavum. Armour, Magic Guard, periya edhirigal mela velai seiyyadhu.'),
    target: 'enemy', element: 'soul', power: 0.25, delay: 1, sfx: 'doom', vfx: 'doom',
  }),
  soul_absorb: S({
    id: 'soul_absorb', name: loc('Soul Absorb', 'Aanma Urinju'),
    desc: loc('Drink the soul of a Doomed foe. It is gone for good. Heals Ragul and eases his Soul Hunger.',
      'Doom aana edhiriyoda aanmava urinju. Adhu thirumba varadhu. Ragul-ku HP varum, pasi kuraiyum.'),
    target: 'enemy', element: 'soul', power: 0, delay: 1.2, sfx: 'absorb', vfx: 'absorb',
  }),

  // ---------------------------------------------------------------- Dhanasree
  staff_strike: S({ id: 'staff_strike', name: loc('Staff strike', 'Kambu adi'), desc: loc('A quick blow with the staff.', 'Kambu vechu oru adi.'), target: 'enemy', element: 'physical', power: 1, delay: 0.9, sfx: 'hit', vfx: 'slash' }),
  light_cube: S({
    id: 'light_cube', name: loc('Light Cube', 'Velicha Cube'),
    desc: loc('A burst of pure light. Blinds, tears Vales out of shadow form, and finishes them for good.',
      'Suththamaana velicham. Kanna kuruda aakum, Vale-a nizhal-la irundhu veliya izhukum, mudichu vidum.'),
    target: 'enemy', element: 'light', power: 1.1, delay: 1, cost: { ce: 2 }, hitsInk: true, sfx: 'light', vfx: 'light',
  }),
  resonance_cube: S({
    id: 'resonance_cube', name: loc('Resonance Cube', 'Adhirvu Cube'),
    desc: loc('A shattering hum. Breaks armour and shatters Vales for good.', 'Norukura adhirvu. Armour-a udaikum, Vale-a norukkum.'),
    target: 'enemy', element: 'shatter', power: 0.9, delay: 1, cost: { ce: 2 }, hitsInk: true, sfx: 'shatter', vfx: 'shatter',
  }),
  handgun: S({
    id: 'handgun', name: loc('Handgun', 'Thuppakki'),
    desc: loc('A heavy shot that ignores half of the target\'s defence. 6 shots, refilled when you rest.',
      'Periya shot, defence-la paadhi kanakku illa. 6 thotta, rest pannumbodhu refill.'),
    target: 'enemy', element: 'physical', power: 2, delay: 1.1, cost: { ammo: 1 }, pierce: 0.5, sfx: 'gun', vfx: 'gun',
  }),
  loop_sense: S({
    id: 'loop_sense', name: loc('Loop Sense', 'Loop Unarvu'),
    desc: loc('Remember how this goes: see every enemy\'s next move for 3 turns. Doesn\'t use your turn.',
      'Idhu yepdi nadakkum-nu nyabagam: 3 turn-ku edhiriyoda adutha move theriyum. Turn pogadhu.'),
    target: 'self', element: 'none', power: 0, delay: 0, cost: { ce: 1 }, free: true, sfx: 'tick',
  }),
  rewind: S({
    id: 'rewind', name: loc('Rewind', 'Pinnadi'),
    desc: loc('Once per battle: TICK. Everything since your last turn is undone. You remember it; they don\'t.',
      'Oru battle-ku oru dhadava: TICK. Un last turn-la irundhu nadandhadhu ellam azhiyum. Unaku nyabagam irukum.'),
    target: 'self', element: 'none', power: 0, delay: 0, oncePerBattle: true, sfx: 'rewind',
  }),

  // ---------------------------------------------------------------- Dharshna
  fire_whip: S({
    id: 'fire_whip', name: loc('Fire whip', 'Neruppu saattai'),
    desc: loc('A lash of flame. Builds Heat. Fire finishes Vales for good.', 'Neruppu saattai. Heat yerum. Neruppu Vale-a mudikum.'),
    target: 'enemy', element: 'fire', power: 0.9, delay: 1, hitsInk: true, sfx: 'fire', vfx: 'fire',
  }),
  fire_triangles: S({
    id: 'fire_triangles', name: loc('Fire triangles', 'Neruppu mukkonam'),
    desc: loc('Spinning triangles of fire hit every foe. Needs 30 Heat.', 'Ellaa edhirigalayum adikum. 30 Heat venum.'),
    target: 'all_enemies', element: 'fire', power: 0.75, delay: 1.2, cost: { heat: 30 }, hitsInk: true, sfx: 'fire', vfx: 'fire',
  }),
  fire_laser: S({
    id: 'fire_laser', name: loc('Fire laser', 'Neruppu laser'),
    desc: loc('A searing beam. Needs 70 Heat.', 'Kodumaiyaana neruppu kadhir. 70 Heat venum.'),
    target: 'enemy', element: 'fire', power: 2.6, delay: 1.4, cost: { heat: 70 }, hitsInk: true, sfx: 'laser', vfx: 'laser',
  }),

  // ---------------------------------------------------------------- Ragul's daydream (V8)
  dream_slash: S({
    id: 'dream_slash', name: loc('Hero slash', 'Hero slash'), desc: loc('A blade of light that only exists in his head.', 'Avan thalaikkulla mattum irukura oru velicha vaal.'),
    target: 'enemy', element: 'physical', power: 1.3, delay: 1, sfx: 'slash', vfx: 'slash',
  }),
  dream_burst: S({
    id: 'dream_burst', name: loc('Sky-splitter', 'Vaanam pilakkum adi'), desc: loc('He shouts the move\'s name. It hits everyone.', 'Move peraye kathi solraan. Ellarayum adikkum.'),
    target: 'all_enemies', element: 'physical', power: 0.85, delay: 1.3, sfx: 'laser', vfx: 'light',
  }),
  dream_shield: S({
    id: 'dream_shield', name: loc('"Stand behind me"', '"En pinnadi nil"'), desc: loc('Heals Ragul by a third. It\'s his daydream.', 'Ragul-ku moonula oru pangu HP. Idhu avan kanavu.'),
    target: 'self', element: 'none', power: 0, delay: 1, sfx: 'heal',
  }),

  // ---------------------------------------------------------------- enemies
  lash: S({ id: 'lash', name: loc('Vine lash', 'Kodi adi'), desc: loc('Arms become blades.'), target: 'enemy', element: 'physical', power: 1, delay: 1, sfx: 'slash', vfx: 'slash' }),
  crush: S({ id: 'crush', name: loc('Ice crush', 'Pani nasukku'), desc: loc('A heavy, frozen blow.'), target: 'enemy', element: 'physical', power: 1.45, delay: 1.3, sfx: 'hit', vfx: 'slash' }),
  drain: S({ id: 'drain', name: loc('Drain', 'Urinju'), desc: loc('Drinks life to mend itself.'), target: 'enemy', element: 'soul', power: 0.8, delay: 1, sfx: 'absorb', vfx: 'absorb' }),
  dread: S({ id: 'dread', name: loc('Dread whisper', 'Bayam'), desc: loc('A voice that makes the heart go cold. Inflicts Fear.'), target: 'enemy', element: 'none', power: 0, delay: 0.9, sfx: 'dread' }),
  rifle_butt: S({ id: 'rifle_butt', name: loc('Rifle butt', 'Thuppakki kattai'), desc: loc('A heavy swing.'), target: 'enemy', element: 'physical', power: 1, delay: 1, sfx: 'hit', vfx: 'slash' }),
  volley: S({ id: 'volley', name: loc('Volley', 'Vedi mazhai'), desc: loc('Wild shots at everyone.'), target: 'all_enemies', element: 'physical', power: 0.55, delay: 1.2, sfx: 'gun', vfx: 'gun' }),
  saber: S({ id: 'saber', name: loc('Sabre cut', 'Vaal vettu'), desc: loc('A trained cut.'), target: 'enemy', element: 'physical', power: 1.5, delay: 1.2, sfx: 'slash', vfx: 'slash' }),
  shadow_meld: S({ id: 'shadow_meld', name: loc('Shadow meld', 'Nizhal'), desc: loc('Sinks into a flat shadow. Only light can touch it there.'), target: 'self', element: 'none', power: 0, delay: 1, sfx: 'meld' }),
};

/** Party commands shown in the battle menu, per member (the "Skills" submenu lists the rest). */
export const BASIC_COMMANDS = ['attack', 'skills', 'defend', 'item', 'flee'] as const;
