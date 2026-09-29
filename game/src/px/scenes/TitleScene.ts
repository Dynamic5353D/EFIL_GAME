import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { loc, tr, type Loc } from '../../core/Localization';
import { formatPlaytime, session } from '../../core/Session';
import { saves, SLOT_COUNT } from '../../core/SaveSystem';
import { TILES } from '../assets';
import { COL, FONT, TILE, VIEW_H, VIEW_W } from '../config';
import { ListNav } from '../ui/list';
import { txt, win } from '../ui/widgets';
import type { OverworldData } from '../world/OverworldScene';

/** Title screen: the MIT road at dawn behind the logo, and Continue / New game / Settings. */
export class TitleScene extends Phaser.Scene {
  private nav = new ListNav(3);
  private items: { id: 'continue' | 'new' | 'settings'; label: Loc }[] = [];
  private layer?: Phaser.GameObjects.Container;
  private picking = false;
  private petals: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('Title');
  }

  create(): void {
    this.picking = false;
    this.drawBackdrop();
    const logo = this.add.bitmapText(VIEW_W / 2, 46, FONT, 'EFIL').setOrigin(0.5, 0).setScale(6).setTint(COL.paper);
    logo.setDropShadow(1, 1, COL.ink, 1);
    this.add.bitmapText(VIEW_W / 2 + 1, 47, FONT, 'EFIL').setOrigin(0.5, 0).setScale(6).setTint(COL.blue1).setDepth(-1);
    txt(this, VIEW_W / 2, 112, tr(loc('A story from Chromepet', 'Chromepet-la oru kadhai')), COL.podHi, COL.ink).setOrigin(0.5, 0);

    this.items = [];
    if (saves.latest()) this.items.push({ id: 'continue', label: loc('Continue', 'Thodaru') });
    this.items.push({ id: 'new', label: loc('New game', 'Pudhu game') });
    this.items.push({ id: 'settings', label: loc('Settings', 'Settings') });
    this.nav = new ListNav(this.items.length);
    this.drawMenu();
    audio.music('title');
  }

  private drawBackdrop(): void {
    this.cameras.main.setBackgroundColor(0x2c4f86);
    // sky bands
    const sky = [0x2c4f86, 0x3f6fb0, 0x6f9fd0, 0xe8b88a, 0xf6d6a0];
    sky.forEach((c, i) => this.add.rectangle(0, i * 22, VIEW_W, 22, c).setOrigin(0));
    const rows = ['*', 'p', 'n', '-', 's', 'p', '*'];
    const name = (ch: string, x: number) => ({ '*': x % 2 ? 'petals' : 'petals1', p: x % 3 ? 'pavers' : 'pavers1', n: 'kerb_n', '-': 'road_dash', s: 'kerb_s' } as Record<string, string>)[ch]!;
    const top = VIEW_H - rows.length * TILE;
    this.add.rectangle(0, 110, VIEW_W, top - 110, 0x5f9a4a).setOrigin(0);
    rows.forEach((ch, j) => {
      for (let x = 0; x < VIEW_W / TILE; x++) this.add.image(x * TILE, top + j * TILE, 'tiles', TILES[name(ch, x)]).setOrigin(0);
    });
    for (const [x, y] of [[20, top + 16], [120, top + 16], [330, top + 16], [440, top + 16], [70, VIEW_H], [260, VIEW_H], [400, VIEW_H]] as const) {
      this.add.image(x, y, 'props', 'tree_copperpod').setOrigin(0.5, 1).setDepth(y);
    }
    for (const x of [60, 200, 340]) this.add.image(x, top + 3 * TILE + 8, 'props', 'bunting').setOrigin(0.5, 1).setDepth(500);
    this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0xffe2b0, 0.12).setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY).setDepth(900);
    for (let i = 0; i < 40; i++) this.petals.push(this.add.image(Math.random() * VIEW_W, Math.random() * VIEW_H, 'petal').setDepth(950));
  }

  private drawMenu(): void {
    this.layer?.destroy();
    const c = this.add.container(0, 0).setDepth(1000);
    this.layer = c;
    if (this.picking) return this.drawSlots(c);
    const w = 140, h = this.items.length * 18 + 14;
    const x = (VIEW_W - w) / 2, y = 140;
    c.add(win(this, x, y, w, h));
    this.items.forEach((it, i) => {
      const iy = y + 8 + i * 18;
      if (this.nav.i === i) c.add(this.add.image(x + 12, iy + 5, 'ui', 'cursor'));
      c.add(txt(this, x + 24, iy + 1, tr(it.label), this.nav.i === i ? COL.ink : COL.slate));
      c.add(this.nav.hit(this, i, x + 4, iy - 2, w - 8, 18));
    });
    const latest = saves.latest();
    if (latest && this.items[this.nav.i]?.id === 'continue') {
      c.add(txt(this, VIEW_W / 2, y + h + 6, `${latest.roomName} · Lv ${latest.level} · ${formatPlaytime(latest.playtimeMs)}`, COL.paper, COL.ink).setOrigin(0.5, 0));
    }
    c.add(txt(this, VIEW_W / 2, VIEW_H - 12, tr(loc('Z / Enter: choose   X: back   Arrows: move', 'Z / Enter: therndhedu   X: pinnaadi   Arrow: nagaru')), COL.paper, COL.ink).setOrigin(0.5, 0));
  }

  /** New game: pick a slot. */
  private drawSlots(c: Phaser.GameObjects.Container): void {
    const w = 260, x = (VIEW_W - w) / 2, y = 126;
    c.add(win(this, x, y, w, SLOT_COUNT * 22 + 30));
    c.add(txt(this, x + 14, y + 10, tr(loc('Start in which slot?', 'Endha slot-la aarambikkalaam?')), COL.blue1));
    for (let i = 0; i < SLOT_COUNT; i++) {
      const meta = saves.meta(i + 1);
      const iy = y + 26 + i * 22;
      if (this.nav.i === i) c.add(this.add.rectangle(x + 8, iy - 4, w - 16, 18, COL.podHi).setOrigin(0));
      const desc = meta ? `${meta.roomName} · Lv ${meta.level} (${tr(loc('overwrite', 'mela ezhudhum'))})` : tr(loc('Empty', 'Kaali'));
      c.add(txt(this, x + 16, iy, `${i + 1}.  ${desc}`, this.nav.i === i ? COL.ink : COL.slate));
      c.add(this.nav.hit(this, i, x + 8, iy - 4, w - 16, 18));
    }
  }

  override update(_t: number, delta: number): void {
    for (const p of this.petals) {
      p.x -= delta * 0.012;
      p.y += delta * 0.02;
      if (p.y > VIEW_H) { p.y = -2; p.x = Math.random() * VIEW_W + 40; }
    }
    const before = this.nav.i;
    const r = this.nav.update();
    if (this.picking) {
      if (r === 'cancel') { this.picking = false; this.nav = new ListNav(this.items.length); this.nav.i = this.items.findIndex((i) => i.id === 'new'); this.drawMenu(); return; }
      if (r === 'confirm') { this.startNew(this.nav.i + 1); return; }
    } else if (r === 'confirm') {
      const it = this.items[this.nav.i]!;
      if (it.id === 'settings') {
        this.scene.launch('Options');
        this.scene.bringToTop('Options');
        this.scene.pause();
        this.scene.get('Options').events.once('shutdown', () => { this.scene.resume(); this.drawMenu(); });
        return;
      }
      if (it.id === 'continue') { this.continueGame(); return; }
      if (it.id === 'new') {
        // With no saves at all, start straight away in slot 1.
        if (!saves.list().some(Boolean)) { this.startNew(1); return; }
        this.picking = true;
        this.nav = new ListNav(SLOT_COUNT);
        const empty = saves.list().findIndex((m) => !m);
        this.nav.i = empty >= 0 ? empty : 0;
      }
    }
    if (before !== this.nav.i || r) this.drawMenu();
  }

  private startNew(slot: number): void {
    session.startNew(slot);
    this.enterWorld({ map: 'hostel_room', spawn: 'start', story: { script: 'px/campus', label: 'start' } });
  }

  private continueGame(): void {
    const latest = saves.latest();
    if (!latest || !session.loadSlot(latest.slot)) return;
    const loc0 = session.state.location;
    this.enterWorld(loc0.checkpoint ? { map: loc0.room, spawn: loc0.checkpoint } : { map: loc0.room, x: loc0.x, y: loc0.y, dir: loc0.dir });
  }

  enterWorld(data: OverworldData): void {
    audio.sfx('ui_ok');
    this.cameras.main.fadeOut(300, 12, 13, 22);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.launch('Ui');
      this.scene.start('Overworld', data);
      this.scene.bringToTop('Ui');
    });
  }
}

