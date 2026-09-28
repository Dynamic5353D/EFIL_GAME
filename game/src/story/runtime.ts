import type { Loc } from '../core/Localization';
import { toLoc, type Cond, type Script, type StoryNode } from './parser';

export type FlagValue = boolean | number | string;

/** What a running script needs from the game. Scenes implement this; tests use a fake. */
export interface StoryHost {
  say(speaker: string, mood: string | undefined, text: Loc): Promise<void>;
  title(text: Loc): Promise<void>;
  warn(text: Loc): Promise<void>;
  choose(options: Loc[], id?: string): Promise<number>;
  /** scene, time, music, sfx, fx, wait, battle, give, ability, join, leave, codex, rel, tag, venture, card */
  command(name: string, args: string[]): Promise<void>;
  getFlag(flag: string): FlagValue | undefined;
  setFlag(flag: string, value: FlagValue): void;
}

export function evalCond(cond: Cond, get: (f: string) => FlagValue | undefined): boolean {
  const v = get(cond.flag);
  switch (cond.op) {
    case 'truthy': return !!v;
    case 'falsy': return !v;
    case '==': return v === cond.value || (v === undefined && cond.value === false);
    case '!=': return !(v === cond.value || (v === undefined && cond.value === false));
    default: {
      const a = typeof v === 'number' ? v : 0;
      const b = typeof cond.value === 'number' ? cond.value : 0;
      return cond.op === '>' ? a > b : cond.op === '>=' ? a >= b : cond.op === '<' ? a < b : a <= b;
    }
  }
}

const MAX_STEPS = 100_000;

/** Runs a script from the start (or a label) to `@end` or the last node. */
export async function runStory(script: Script, host: StoryHost, from?: string, isCancelled?: () => boolean): Promise<void> {
  if (script.errors.length) {
    throw new Error(`${script.file}: ${script.errors.map((e) => `line ${e.line}: ${e.message}`).join('; ')}`);
  }
  let pc = from ? script.labels[from] ?? -1 : 0;
  if (pc < 0) throw new Error(`${script.file}: unknown start label "${from}"`);
  const jump = (label: string) => {
    const t = script.labels[label];
    if (t === undefined) throw new Error(`${script.file}: unknown label "${label}"`);
    pc = t;
  };
  for (let steps = 0; pc < script.nodes.length; steps++) {
    if (steps > MAX_STEPS) throw new Error(`${script.file}: script appears to loop forever`);
    if (isCancelled?.()) return;
    const n: StoryNode = script.nodes[pc++]!;
    switch (n.k) {
      case 'line': await host.say(n.speaker, n.mood, toLoc(n.text)); break;
      case 'title': await host.title(toLoc(n.text)); break;
      case 'warn': await host.warn(toLoc(n.text)); break;
      case 'choice': {
        const i = await host.choose(n.options.map((o) => toLoc(o.text)), n.id);
        const opt = n.options[Math.max(0, Math.min(n.options.length - 1, i))]!;
        if (n.id) host.setFlag(`choice.${n.id}`, opt.target);
        jump(opt.target);
        break;
      }
      case 'cmd': await host.command(n.name, n.args); break;
      case 'set': host.setFlag(n.flag, n.value); break;
      case 'if': if (evalCond(n.cond, (f) => host.getFlag(f))) jump(n.target); break;
      case 'goto': jump(n.target); break;
      case 'label': break;
      case 'end': return;
    }
  }
}
