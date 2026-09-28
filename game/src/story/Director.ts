import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { addItem, isKnownMember, joinParty, leaveParty, relKey } from '../core/GameState';
import { loc, tr, type Loc } from '../core/Localization';
import { session } from '../core/Session';
import { settings } from '../core/Settings';
import { ABILITIES } from '../data/abilities';
import { CHARACTERS } from '../data/characters';
import { CODEX } from '../data/codex';
import { ITEMS } from '../data/items';
import type { MusicId, SfxId } from '../data/media';
import type { DialogueScene } from '../scenes/DialogueScene';
import { parseStory, type Script } from './parser';
import { runStory, type FlagValue, type StoryHost } from './runtime';

const SOURCES = import.meta.glob('./**/*.story', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const cache: Record<string, Script> = {};

/** Scripts are addressed by path without extension, e.g. "slice/glacia_slice". */
export function getScript(name: string): Script {
  if (!cache[name]) {
    const src = SOURCES[`./${name}.story`];
    if (src === undefined) throw new Error(`no story script "${name}"`);
    cache[name] = parseStory(src, `${name}.story`);
  }
  return cache[name]!;
}

/** What the director needs from the scene hosting the story (usually the World). */
export interface StoryStage {
  scene: Phaser.Scene;
  fx(name: string): Promise<void>;
  runBattle(id: string): Promise<'won' | 'lost' | 'fled'>;
  partyChanged(): void;
}

export class Director implements StoryHost {
  private cardTitle: Loc | null = null;
  private time = '';
  private cancelled = false;

  constructor(private stage: StoryStage) {}

  private get dialogue(): DialogueScene {
    return this.stage.scene.scene.get('Dialogue') as DialogueScene;
  }

  async run(scriptName: string, label?: string): Promise<void> {
    try {
      this.cancelled = false;
      await runStory(getScript(scriptName), this, label, () => this.cancelled);
    } finally {
      this.dialogue.hide();
      await this.dialogue.setBackdrop(null);
    }
  }

  /** Stops the running script at the next line (e.g. after a lost battle). */
  cancel() { this.cancelled = true; }

  say(speaker: string, mood: string | undefined, text: Loc) { return this.dialogue.say(speaker, mood, text); }
  async title(text: Loc) { this.cardTitle = text; }
  async warn(text: Loc) {
    if (settings.get('contentWarnings')) await this.dialogue.notice('Content note', tr(text));
  }
  choose(options: Loc[]) { return this.dialogue.choose(options); }
  getFlag(flag: string): FlagValue | undefined { return session.state.flags[flag]; }
  setFlag(flag: string, value: FlagValue) { session.state.flags[flag] = value; }

  private toast(text: string, icon?: string) { bus.emit('toast', { text, icon }); }

  async command(name: string, args: string[]): Promise<void> {
    const st = session.state;
    const a = args[0] ?? '';
    switch (name) {
      case 'venture': st.venture = { purpose: Number(args[0]), venture: Number(args[1]) }; break;
      case 'time': this.time = a; break;
      case 'card': {
        this.dialogue.hide();
        await new Promise<void>((res) => {
          const plugin = this.stage.scene.scene;
          plugin.launch('ChapterCard', { purpose: st.venture.purpose, venture: st.venture.venture, title: this.cardTitle, time: this.time, done: res });
          plugin.bringToTop('ChapterCard');
        });
        break;
      }
      case 'music': audio.music(a as MusicId); break;
      case 'sfx': audio.sfx(a as SfxId); break;
      case 'fx': await this.stage.fx(a); break;
      case 'wait': await new Promise((r) => setTimeout(r, Number(a) || 0)); break;
      case 'scene': await this.dialogue.setBackdrop(a); break;
      case 'battle': {
        this.dialogue.hide();
        const result = await this.stage.runBattle(a);
        st.flags.won = result === 'won';
        break;
      }
      case 'give':
      case 'take': {
        const n = (Number(args[1]) || 1) * (name === 'take' ? -1 : 1);
        addItem(st, a, n);
        const item = ITEMS[a];
        if (item && n > 0) {
          audio.sfx(item.grantsAbility ? 'ability' : 'pickup');
          this.toast(`${tr(item.name)}${n > 1 ? ` ×${n}` : ''}`, item.icon);
          if (item.grantsAbility) this.toast(`New ability: ${tr(ABILITIES[item.grantsAbility]?.name ?? loc(item.grantsAbility))}`);
        }
        bus.emit('hud', undefined);
        break;
      }
      case 'ability':
        if (!st.abilities.includes(a)) st.abilities.push(a);
        audio.sfx('ability');
        this.toast(`New ability: ${tr(ABILITIES[a]?.name ?? loc(a))}`);
        break;
      case 'join':
        if (isKnownMember(a)) {
          joinParty(st, a, Number(args[1]) || 1);
          this.toast(`${tr(CHARACTERS[a].name)} joins the party`);
          this.stage.partyChanged();
          bus.emit('hud', undefined);
        }
        break;
      case 'leave':
        if (isKnownMember(a)) { leaveParty(st, a); this.stage.partyChanged(); bus.emit('hud', undefined); }
        break;
      case 'codex':
        if (!st.codex.includes(a)) {
          st.codex.push(a);
          audio.sfx('pickup', 0.8);
          this.toast(`Memory Fragment: ${tr(CODEX[a]?.title ?? loc(a))}`, 'gen:fragment');
        }
        break;
      case 'rel': {
        const k = relKey(args[0]!, args[1]!);
        st.relationships[k] = (st.relationships[k] ?? 0) + Number(args[2] ?? 0);
        break;
      }
      default: break; // tag, portrait: metadata only
    }
  }
}
