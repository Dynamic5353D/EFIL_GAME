import Phaser from 'phaser';
import { assets, assetUrl, hasOverride } from '../core/Assets';
import { audio } from '../core/AudioSynth';
import { addItem, isKnownMember, joinParty } from '../core/GameState';
import { ensureTextures, spec } from '../core/Loader';
import { session } from '../core/Session';
import { CHARACTERS, type MemberId } from '../data/characters';
import { ITEMS } from '../data/items';
import { SPEAKERS } from '../data/speakers';
import { FONT_BODY, FONT_DISPLAY, H, W } from '../ui/theme';
import { generateTextures } from '../world/Generated';

/** Loads fonts, the asset manifest, palettes and the small textures every scene needs, then shows the title. */
export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create() {
    const bar = this.add.rectangle(W / 2 - 160, H / 2, 0, 2, 0x9cc9ff).setOrigin(0, 0.5);
    this.add.rectangle(W / 2, H / 2, 320, 2, 0x9cc9ff, 0.15);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => bar.setSize(320 * p, 2));
    void this.boot().catch((e: unknown) => {
      console.error(e);
      this.add.text(W / 2, H / 2 + 40, 'Could not load the game data. See the console.', { color: '#ff8080', fontSize: '20px' }).setOrigin(0.5);
    });
  }

  private async boot() {
    await Promise.all([
      assets.load(),
      document.fonts.load(`24px ${FONT_BODY}`),
      document.fonts.load(`italic 24px ${FONT_BODY}`),
      document.fonts.load(`700 24px ${FONT_BODY}`),
      document.fonts.load(`500 24px ${FONT_DISPLAY}`),
      document.fonts.load(`600 24px ${FONT_DISPLAY}`),
      document.fonts.load(`italic 500 24px ${FONT_DISPLAY}`),
    ].map((p) => p.catch(() => undefined)));
    generateTextures(this);

    const specs: ({ key: string; url: string } | null)[] = [];
    // Protagonist overrides replace the generated silhouettes (README, "Art overrides").
    for (const id of Object.keys(CHARACTERS) as MemberId[]) {
      if (hasOverride(`portraits/${id}.webp`)) specs.push({ key: `portrait:gen:${id}`, url: assetUrl(`assets/portraits/${id}.webp`) });
    }
    for (const it of Object.values(ITEMS)) if (!it.icon.startsWith('gen:')) specs.push(spec('icon', it.icon));
    for (const sp of Object.values(SPEAKERS)) if (sp.portrait && !sp.portrait.startsWith('gen:')) specs.push(spec('portrait', sp.portrait));
    specs.push(spec('bg', 'frozen_pond'), spec('far', 'frozen_pond'));
    await ensureTextures(this, specs);
    if (import.meta.env.DEV && this.devJump()) return;
    this.scene.start('Title');
  }

  /**
   * Dev builds only: `?room=winter_path&flags=a,b&party=ragul,dhanasree&items=acanus_feather` starts a
   * fresh game in slot 3 right in that room, for testing (plan.md, "debug build can jump").
   */
  private devJump(): boolean {
    const q = new URLSearchParams(location.search);
    const room = q.get('room');
    if (!room) return false;
    session.startNew(3);
    const st = session.state;
    st.location.room = room;
    for (const f of (q.get('flags') ?? '').split(',').filter(Boolean)) st.flags[f] = true;
    for (const id of (q.get('party') ?? '').split(',').filter(isKnownMember)) joinParty(st, id, 3);
    for (const it of (q.get('items') ?? '').split(',').filter(Boolean)) addItem(st, it);
    audio.unlock();
    this.scene.start('World', { entry: q.get('entry') ?? undefined });
    return true;
  }
}
