import Phaser from 'phaser';
import { isKnownMember, joinParty } from '../../core/GameState';
import { session } from '../../core/Session';
import { settings } from '../../core/Settings';
import { preloadPixelArt, registerPixelArt } from '../assets';
import type { OverworldData } from '../world/OverworldScene';

/** Loads the (inlined) art, then the language questions on first launch, else the title. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    preloadPixelArt(this.load);
  }

  create(): void {
    registerPixelArt(this);
    if (import.meta.env.DEV && this.devJump()) return;
    this.scene.start(settings.get('langChosen') ? 'Title' : 'Language');
  }

  /**
   * Dev builds only: `?map=mit_road&x=20&y=14&flags=a,b&items=chai&quest=posters` starts in slot 3 there;
   * `?new` starts a new game straight away.
   */
  private devJump(): boolean {
    const q = new URLSearchParams(location.search);
    if (!q.has('map') && !q.has('new')) return false;
    session.startNew(3);
    const st = session.state;
    for (const f of (q.get('flags') ?? '').split(',').filter(Boolean)) {
      const [k, v] = f.split('=');
      st.flags[k!] = v === undefined ? true : Number.isNaN(Number(v)) ? v : Number(v);
    }
    for (const it of (q.get('items') ?? '').split(',').filter(Boolean)) st.inventory[it] = (st.inventory[it] ?? 0) + 1;
    for (const m of (q.get('party') ?? '').split(',').filter(Boolean)) if (isKnownMember(m)) joinParty(st, m);
    for (const qu of (q.get('quest') ?? '').split(',').filter(Boolean)) st.quests[qu] = { step: 0, done: false };
    if (!q.has('lang')) settings.data.langChosen = true;
    const data: OverworldData = q.has('new')
      ? { map: 'hostel_room', spawn: 'start', story: { script: 'px/campus', label: 'start' } }
      : { map: q.get('map')!, x: Number(q.get('x') ?? 2), y: Number(q.get('y') ?? 2), dir: 'down' };
    this.scene.launch('Ui');
    this.scene.start('Overworld', data);
    this.scene.bringToTop('Ui');
    return true;
  }
}
