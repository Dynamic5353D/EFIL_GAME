import { audio } from '../../core/AudioSynth';
import { addItem, type GameState } from '../../core/GameState';
import { tr, type Loc } from '../../core/Localization';
import { session } from '../../core/Session';
import { settings } from '../../core/Settings';
import { CODEX } from '../../data/codex';
import { ITEMS } from '../../data/items';
import type { MusicId, SfxId } from '../../data/media';
import { SPEAKERS } from '../../data/speakers';
import { parseStory, type Script } from '../../story/parser';
import { runStory, type FlagValue, type StoryHost } from '../../story/runtime';
import { COL } from '../config';
import { advanceQuests, completeQuest, startQuest, type QuestEvent } from '../quest/logic';
import type { UiScene } from '../ui/UiScene';

const SOURCES = import.meta.glob('../../story/px/*.story', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const cache: Record<string, Script> = {};

/** Scripts are addressed as "px/<file>" (src/story/px/<file>.story). */
export function getScript(name: string): Script {
  if (!cache[name]) {
    const src = SOURCES[`../../story/${name}.story`];
    if (src === undefined) throw new Error(`no story script "${name}"`);
    cache[name] = parseStory(src, `${name}.story`);
  }
  return cache[name]!;
}

/** What the director needs from the overworld. */
export interface WorldHost {
  /** The sprite sheet of an NPC on the map (for portraits), or null. */
  npcSprite(id: string): string | null;
  facePlayer(npcId: string): void;
  shake(): void;
  flash(): void;
  fadeOut(): Promise<void>;
  fadeIn(): Promise<void>;
  gotoMap(map: string, spawn: string): Promise<void>;
  flagsChanged(): void;
}

/**
 * Runs `.story` scripts in the pixel game: lines go to the UI's dialogue box, commands change the game
 * state (items, quests, flags) or the world (camera shakes, map changes).
 */
export class PxDirector implements StoryHost {
  /** The NPC being talked to (for portraits and `@face_player`). */
  private npc: string | null = null;
  running = false;

  constructor(private world: WorldHost, private ui: UiScene) {}

  private get st(): GameState { return session.state; }

  async run(script: string, label: string, npc: string | null = null): Promise<void> {
    this.running = true;
    this.npc = npc;
    try {
      await runStory(getScript(script), this, label);
    } finally {
      this.ui.endTalk();
      this.npc = null;
      this.running = false;
      this.afterFlags();
    }
  }

  private portraitFor(speaker: string): string | null {
    if (speaker === 'narrator') return null;
    const sprite = this.npc ? this.world.npcSprite(this.npc) : null;
    // A generic speaker ("guy", "girl") takes the face of whoever you are talking to.
    if (sprite && (speaker === 'guy' || speaker === 'girl' || speaker === this.npc)) return `portrait-${sprite}`;
    return `portrait-${speaker}`;
  }

  say(speaker: string, _mood: string | undefined, text: Loc): Promise<void> {
    const def = SPEAKERS[speaker];
    return this.ui.say({
      name: speaker === 'narrator' || !def ? '' : tr(def.name),
      color: def?.color ?? COL.white,
      portrait: this.portraitFor(speaker),
      text,
      kind: speaker === 'narrator' ? 'desc' : 'dialogue',
    });
  }
  async title(text: Loc) { await this.ui.caption(text); }
  async caption(text: Loc) { await this.ui.caption(text); }
  async warn(text: Loc) {
    if (settings.get('contentWarnings')) await this.ui.notice(tr({ en: 'Content note', ta: 'Content note' }), tr(text));
  }
  async objective(text: Loc) {
    this.st.objective = { ...text };
    this.ui.toast(tr(text), COL.blue1);
  }
  choose(options: Loc[]): Promise<number> {
    return this.ui.choose(options);
  }

  getFlag(flag: string): FlagValue | undefined { return this.st.flags[flag]; }
  setFlag(flag: string, value: FlagValue): void {
    if (value === false) delete this.st.flags[flag];
    else this.st.flags[flag] = value;
    this.afterFlags();
  }

  private questEvents(ev: QuestEvent[]): void {
    for (const e of ev) {
      const t = tr(e.quest.title);
      if (e.kind === 'started') { this.ui.toast(tr({ en: `New quest: ${t}`, ta: `Pudhu quest: ${t}` }), COL.blue1); this.ui.pin(e.quest.id); audio.sfx('ability', 1.2); }
      if (e.kind === 'step') { this.ui.toast(tr({ en: `Quest updated: ${t}`, ta: `Quest update: ${t}` }), COL.blue1); this.ui.pin(e.quest.id); }
      if (e.kind === 'done') {
        this.ui.toast(tr({ en: `Quest complete: ${t}`, ta: `Quest mudinjadhu: ${t}` }), COL.red);
        for (const [item, n] of Object.entries(e.quest.rewards.items ?? {})) this.ui.toast(this.gotText(item, n), COL.ink);
        if (e.quest.rewards.xp) this.ui.toast(`+${e.quest.rewards.xp} XP`, COL.ink);
        audio.sfx('save');
      }
    }
    this.ui.refreshTracker();
  }

  private afterFlags(): void {
    this.questEvents(advanceQuests(this.st));
    this.world.flagsChanged();
  }

  private gotText(item: string, n: number): string {
    const name = ITEMS[item] ? tr(ITEMS[item]!.name) : item;
    return tr({ en: `Got: ${name}${n > 1 ? ` x${n}` : ''}`, ta: `Kedachadhu: ${name}${n > 1 ? ` x${n}` : ''}` });
  }

  async command(name: string, args: string[]): Promise<void> {
    const a = args[0] ?? '';
    const st = this.st;
    switch (name) {
      case 'quest':
        if (a === 'start') this.questEvents(startQuest(st, args[1]!));
        else if (a === 'done') this.questEvents(completeQuest(st, args[1]!));
        break;
      case 'give': {
        const n = Number(args[1] ?? 1);
        addItem(st, a, n);
        this.ui.toast(this.gotText(a, n));
        audio.sfx('pickup');
        break;
      }
      case 'take': {
        const n = Number(args[1] ?? 1);
        st.inventory[a] = Math.max(0, (st.inventory[a] ?? 0) - n);
        if (!st.inventory[a]) delete st.inventory[a];
        break;
      }
      case 'add': {
        const cur = st.flags[a];
        this.setFlag(a, (typeof cur === 'number' ? cur : 0) + Number(args[1] ?? 1));
        break;
      }
      case 'codex':
        if (!st.codex.includes(a)) {
          st.codex.push(a);
          const e = CODEX[a];
          if (e) this.ui.toast(tr({ en: `Memory: ${tr(e.title)}`, ta: `Ninaivu: ${tr(e.title)}` }), COL.blue1);
        }
        break;
      case 'face_player': {
        const id = a || this.npc;
        if (id) this.world.facePlayer(id);
        break;
      }
      case 'sfx': audio.sfx(a as SfxId); break;
      case 'music': audio.music(a as MusicId); break;
      case 'fx':
        if (a === 'shake') this.world.shake();
        else if (a === 'flash') this.world.flash();
        else if (a === 'fade_out') await this.world.fadeOut();
        else if (a === 'fade_in') await this.world.fadeIn();
        break;
      case 'wait': await new Promise((r) => setTimeout(r, Number(a) || 0)); break;
      case 'room': await this.world.gotoMap(a, args[1] ?? 'start'); break;
      case 'done': st.objective = null; break;
      default: break;
    }
  }
}
