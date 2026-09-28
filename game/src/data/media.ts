/** Names the story scripts may use with @music, @sfx and @fx. The linter checks against these. */
export const MUSIC = ['none', 'title', 'glacia', 'winter_path', 'battle', 'tense', 'rest'] as const;
export const SFX = [
  'ui_move', 'ui_ok', 'ui_back', 'jump', 'land', 'dash', 'pickup', 'shard', 'hurt', 'hit', 'slash', 'guard', 'heal',
  'doom', 'absorb', 'light', 'shatter', 'gun', 'fire', 'laser', 'tick', 'rewind', 'dread', 'meld', 'save', 'slap',
  'ability', 'ink', 'reform', 'destroy', 'blip',
] as const;
export const FX = ['shake', 'flash', 'red_flash', 'migraine', 'tick', 'fade_out', 'fade_in', 'slap'] as const;
export type MusicId = (typeof MUSIC)[number];
export type SfxId = (typeof SFX)[number];

/** Content tags a script may never carry (plan.md, "Handling mature content"). */
export const BANNED_TAGS = ['sexual_minor', 'csam', 'explicit_sexual', 'explicit_gore', 'slur', 'lingering_gore'];
/** Words that must never appear in any line (slurs are removed from the adaptation). */
export const BANNED_WORDS: RegExp[] = [/\bthevdiya\w*/i, /\bthevidiya\w*/i, /\bgay\s+contact\b/i, /\bfaggot\w*/i, /\bchakka\b/i];
