import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { input } from '../core/Input';
import { tr, type Loc } from '../core/Localization';
import { ensureTextures, spec } from '../core/Loader';
import { settings } from '../core/Settings';
import { SPEAKERS } from '../data/speakers';
import type { CastEntry, StageScene } from './StageScene';
import { MenuList } from '../ui/MenuList';
import { addText, C, drawPanel, H, W } from '../ui/theme';

const BOX = { x: 60, y: 500, w: 1160, h: 196 };

/**
 * Overlay for story text. Other code awaits `say`, `choose` and `notice`; the scene resolves the
 * promise when the player advances. The language key re-renders the current line in the other language.
 */
export class DialogueScene extends Phaser.Scene {
  private root!: Phaser.GameObjects.Container;
  private box!: Phaser.GameObjects.Graphics;
  private portrait!: Phaser.GameObjects.Image;
  private portraitFrame!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private langChip!: Phaser.GameObjects.Text;
  private nextArrow!: Phaser.GameObjects.Text;
  private shade!: Phaser.GameObjects.Rectangle;
  private bars!: Phaser.GameObjects.Graphics;
  private barState = { h: 0 };
  private barsOn = false;

  private current: { speaker: string; mood?: string; text: Loc } | null = null;
  private full = '';
  private shown = 0;
  private typing = false;
  private resolve: (() => void) | null = null;
  private menu: MenuList | null = null;
  private menuBox: Phaser.GameObjects.Graphics | null = null;
  private lastBlip = 0;

  constructor() { super({ key: 'Dialogue' }); }

  create() {
    this.shade = this.add.rectangle(0, 0, W, H, 0x000000, 0).setOrigin(0);
    this.bars = this.add.graphics();
    this.barState = { h: 0 };
    this.barsOn = false;
    this.root = this.add.container(0, 0).setVisible(false);
    this.box = this.add.graphics();
    drawPanel(this.box, BOX.x, BOX.y, BOX.w, BOX.h, 0.9, 14);
    this.portraitFrame = this.add.graphics();
    this.portrait = this.add.image(BOX.x + 96, BOX.y + BOX.h / 2, '__DEFAULT').setVisible(false);
    this.nameText = addText(this, BOX.x + 200, BOX.y + 20, '', { size: 26, display: true, bold: true, color: C.accent });
    this.bodyText = addText(this, BOX.x + 200, BOX.y + 60, '', { size: 24, wordWrap: { width: BOX.w - 250 }, lineSpacing: 6 });
    this.langChip = addText(this, BOX.x + BOX.w - 18, BOX.y + 16, '', { size: 15, color: C.textDim }).setOrigin(1, 0);
    this.nextArrow = addText(this, BOX.x + BOX.w - 30, BOX.y + BOX.h - 34, '▼', { size: 18, color: C.accent }).setVisible(false);
    this.root.add([this.box, this.portraitFrame, this.portrait, this.nameText, this.bodyText, this.langChip, this.nextArrow]);
    this.tweens.add({ targets: this.nextArrow, y: '+=5', duration: 500, yoyo: true, repeat: -1 });
    bus.on('language', () => this.rerender());
  }

  get busy() { return !!this.resolve || !!this.menu; }

  // ------------------------------------------------------------------ public API
  say(speaker: string, mood: string | undefined, text: Loc): Promise<void> {
    return new Promise((res) => {
      this.resolve = res;
      this.current = { speaker, mood, text };
      this.root.setVisible(true);
      void this.showSpeaker(speaker, mood).then(() => this.startLine());
    });
  }

  choose(options: Loc[]): Promise<number> {
    return new Promise((res) => {
      this.root.setVisible(true);
      this.nextArrow.setVisible(false);
      const rowH = 46;
      const w = 620, h = options.length * rowH + 24;
      const x = W - w - 80, y = BOX.y - h - 14;
      this.menuBox = this.add.graphics();
      drawPanel(this.menuBox, x, y, w, h, 0.93, 12);
      this.menu = new MenuList(this, x, y + 12, options.map((o, i) => ({
        label: () => tr(o),
        onSelect: () => {
          this.menu?.destroy(); this.menuBox?.destroy();
          this.menu = null; this.menuBox = null;
          res(i);
        },
      })), { width: w, lineHeight: rowH, size: 23 });
      input.consume();
    });
  }

  /** Full-screen notice (content warnings, "Venture complete" and so on). */
  notice(title: string, body: string): Promise<void> {
    return new Promise((res) => {
      this.root.setVisible(false);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.72).fillRect(0, 0, W, H);
      drawPanel(g, W / 2 - 360, H / 2 - 130, 720, 260, 0.95, 14);
      const t1 = addText(this, W / 2, H / 2 - 90, title, { size: 30, display: true, bold: true, color: C.warm }).setOrigin(0.5);
      const t2 = addText(this, W / 2, H / 2 - 40, body, { size: 22, align: 'center', wordWrap: { width: 640 }, color: C.text }).setOrigin(0.5, 0);
      const t3 = addText(this, W / 2, H / 2 + 100, `${input.label('confirm')}  Continue`, { size: 17, color: C.textDim }).setOrigin(0.5);
      input.consume();
      this.resolve = () => { g.destroy(); t1.destroy(); t2.destroy(); t3.destroy(); res(); };
    });
  }

  /** `@scene`: opens the Stage (a place with its cast, filmed) under this scene, or closes it. */
  async setBackdrop(slug: string | null, cast: CastEntry[] = []) {
    const stage = this.scene.get('Stage') as StageScene | null;
    if (!stage) return;
    if (!slug) { stage.close(); return; }
    if (!this.scene.isActive('Stage')) {
      this.scene.launch('Stage');
      await new Promise<void>((r) => { const t = () => (stage.sys.isActive() ? r() : this.time.delayedCall(16, t)); t(); });
    }
    await stage.open(slug, cast);
    this.scene.bringToTop('Stage');
    this.scene.bringToTop('Dialogue');
    this.letterbox(true);
  }

  /** Cinematic bars, top and bottom: on while a story plays. */
  letterbox(on: boolean) {
    if (on === this.barsOn) return;
    this.barsOn = on;
    bus.emit('cinema', { on });
    this.tweens.killTweensOf(this.barState);
    this.tweens.add({
      targets: this.barState, h: on ? 42 : 0, duration: settings.get('reducedMotion') ? 1 : 450, ease: 'Sine.InOut',
      onUpdate: () => this.drawBars(),
    });
  }

  private drawBars() {
    const h = this.barState.h;
    this.bars.clear();
    if (h <= 0.5) return;
    this.bars.fillStyle(0x000000, 1).fillRect(0, 0, W, h).fillRect(0, H - h * 0.45, W, h * 0.45);
  }

  hide() {
    this.root.setVisible(false);
    this.current = null;
  }

  // ------------------------------------------------------------------ internals
  private async showSpeaker(id: string, mood?: string) {
    const sp = SPEAKERS[id];
    const narr = id === 'narrator' || !sp;
    this.portraitFrame.clear();
    const textX = narr ? BOX.x + 44 : BOX.x + 200;
    this.bodyText.setX(textX).setWordWrapWidth(BOX.x + BOX.w - 60 - textX);
    this.nameText.setX(textX);
    this.nameText.setText(narr ? '' : tr(sp.name) + (mood === 'thinking' ? '  ·  thinking' : ''));
    this.nameText.setColor(sp ? '#' + sp.color.toString(16).padStart(6, '0') : C.accent);
    this.bodyText.setY(narr ? BOX.y + 36 : BOX.y + 64);
    const italic = narr || mood === 'thinking';
    this.bodyText.setFontStyle(italic ? 'italic' : 'normal');
    this.bodyText.setColor(narr ? '#c9d6e8' : mood === 'thinking' ? '#b8c8e0' : C.text);
    if (narr || !sp.portrait) { this.portrait.setVisible(false); return; }
    let key: string;
    if (sp.portrait.startsWith('gen:')) key = `portrait:${sp.portrait}`;
    else {
      const s = spec('portrait', sp.portrait);
      if (s) await ensureTextures(this, [s]);
      key = s?.key ?? '__MISSING';
    }
    if (!this.textures.exists(key)) { this.portrait.setVisible(false); return; }
    const px = BOX.x + 96, py = BOX.y + BOX.h / 2;
    this.portrait.setTexture(key).setVisible(true).setPosition(px, py);
    this.portrait.setDisplaySize(156, 156);
    this.portraitFrame.lineStyle(2, sp.color, 0.6).strokeRoundedRect(px - 80, py - 80, 160, 160, 12);
    this.portraitFrame.lineStyle(1, 0xffffff, 0.15).strokeRoundedRect(px - 83, py - 83, 166, 166, 14);
    if ((mood === 'shouting' || mood === 'shocked') && !settings.get('reducedMotion')) {
      this.tweens.add({ targets: this.portrait, x: px + 4, duration: 40, yoyo: true, repeat: 3 });
    }
  }

  private startLine() {
    if (!this.current) return;
    this.full = tr(this.current.text);
    const speed = settings.get('textSpeed');
    this.shown = speed <= 0 || settings.get('reducedMotion') && speed > 80 ? this.full.length : 0;
    this.typing = this.shown < this.full.length;
    this.bodyText.setText(this.full.slice(0, this.shown));
    this.nextArrow.setVisible(!this.typing);
    this.updateChip();
  }

  private rerender() {
    if (!this.current || !this.root.visible) return;
    const done = !this.typing;
    this.full = tr(this.current.text);
    this.shown = done ? this.full.length : Math.min(this.shown, this.full.length);
    this.bodyText.setText(this.full.slice(0, this.shown));
    const sp = SPEAKERS[this.current.speaker];
    if (sp && this.current.speaker !== 'narrator') this.nameText.setText(tr(sp.name) + (this.current.mood === 'thinking' ? '  ·  thinking' : ''));
    this.updateChip();
  }

  private updateChip() {
    const ta = settings.get('language') === 'ta';
    this.langChip.setText(`${ta ? 'Tanglish' : 'English'}  ·  ${input.label('language')} to switch`);
  }

  override update(time: number, delta: number) {
    if (this.menu) { this.menu.update(time); return; }
    if (input.pressed('language')) {
      settings.set('language', settings.get('language') === 'en' ? 'ta' : 'en');
      audio.sfx('ui_move');
    }
    if (this.typing) {
      const cps = settings.get('textSpeed');
      this.shown = Math.min(this.full.length, this.shown + (cps * delta) / 1000);
      this.bodyText.setText(this.full.slice(0, Math.floor(this.shown)));
      if (time - this.lastBlip > 70 && this.current?.speaker !== 'narrator') { audio.sfx('blip'); this.lastBlip = time; }
      if (this.shown >= this.full.length) { this.typing = false; this.nextArrow.setVisible(true); }
    }
    const adv = input.pressed('confirm') || input.pressed('interact') || input.pressed('attack');
    if (adv && this.resolve) {
      input.consume('confirm', 'interact', 'attack', 'jump');
      if (this.typing) {
        this.shown = this.full.length;
        this.bodyText.setText(this.full);
        this.typing = false;
        this.nextArrow.setVisible(true);
        return;
      }
      const r = this.resolve;
      this.resolve = null;
      this.nextArrow.setVisible(false);
      r();
    }
  }
}
