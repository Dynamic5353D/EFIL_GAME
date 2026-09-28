/** First-time tips: which ones this save has seen, and their text with the current key names filled in. */
import { TIPS, type TipDef } from '../data/tips';
import { bus } from './EventBus';
import { input } from './Input';
import { tr } from './Localization';
import { session } from './Session';
import { ACTIONS, settings, type Action } from './Settings';

const flag = (id: string) => `tip.${id}`;

export function tipSeen(id: string): boolean {
  return !!session.state.flags[flag(id)];
}

/** Tips this save has seen, in the order they are defined. */
export function seenTips(): TipDef[] {
  return Object.values(TIPS).filter((t) => tipSeen(t.id));
}

export function tipBody(t: TipDef): string {
  return tr(t.body).replace(/\{(\w+)\}/g, (m, a: string) => ((ACTIONS as readonly string[]).includes(a) ? input.label(a as Action) : m));
}

/**
 * Marks a tip as seen and returns it if it should be shown now (tips on, not seen before).
 * World code calls `showTip`; the battle scene uses this directly to show its own modal.
 */
export function takeTip(id: string): TipDef | null {
  const t = TIPS[id];
  if (!t || tipSeen(id)) return null;
  session.state.flags[flag(id)] = true;
  return settings.get('showTips') ? t : null;
}

/** Shows a world tip in the HUD, once per save. */
export function showTip(id: string): void {
  const t = takeTip(id);
  if (t) bus.emit('tip', { id: t.id });
}
