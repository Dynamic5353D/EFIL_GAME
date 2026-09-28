import { loc, type Loc } from '../core/Localization';

/** Exploration abilities. The story unlocks them; rooms gate areas behind them (plan.md, Game systems). */
export interface AbilityDef {
  id: string;
  name: Loc;
  desc: Loc;
}

export const ABILITIES: Record<string, AbilityDef> = {
  sprint: { id: 'sprint', name: loc('Sprint'), desc: loc('Hold dash on the ground to run faster.') },
  dash: { id: 'dash', name: loc('Dash'), desc: loc('A short burst, on the ground or once in the air.') },
  double_jump: { id: 'double_jump', name: loc('Acanus leap'), desc: loc('Jump again in mid-air.') },
  glide: { id: 'glide', name: loc('Acanus glide'), desc: loc('Hold jump while falling to glide.') },
};
