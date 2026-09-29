import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { input } from '../../core/Input';
import { langFor, tr, type Loc, type TextKind } from '../../core/Localization';
import { session } from '../../core/Session';
import { settings } from '../../core/Settings';
import { COL, LINE_H, VIEW_H, VIEW_W } from '../config';
import { currentStep, questList } from '../quest/logic';
import { pages, textWidth, txt, win, wrap } from './widgets';

export interface SayOpts {
  name: string;
  /** Name-tab colour. */
  color: number;
  portrait: string | null;
  text: Loc;
  kind: TextKind;
}

const BOX = { x: 6, y: VIEW_H - 64, w: VIEW_W - 12, h: 58 };

/**
 * Everything drawn over the world: the dialogue box, choices, notices, captions, the location banner,
 * toasts and the quest tracker. Runs above the Overworld scene.
 */
export class UiScene extends Phaser.Scene {
  private box?: Phaser.GameObjects.Container;
  private tracker?: Phaser.GameObjects.Container;
  private banner?: Phaser.GameObjects.Container;
  private toasts: Phaser.GameObjects.Container[] = [];
  private pinned: string | null = null;
  /** True while a dialogue, choice or notice waits for the player. */
  busy = false;

  constructor() {
    super('Ui');
  }

  create(): void {
    this.refreshTracker();
  }

  // ------------------------------------------------------------------ dialogue
  say(o: SayOpts): Promise<void> {
    this.busy = true;
    this.hideTracker();
    return new Promise((resolve) => {
      const kind = o.kind;
      const c = this.add.container(0, 0).setDepth(100);
      this.box?.destroy();
      this.box = c;
      c.add(win(this, BOX.x, BOX.y, BOX.w, BOX.h));
      let tx = BOX.x + 12;
      if (o.portrait && this.textures.exists(o.portrait)) {
        c.add(this.add.rectangle(BOX.x + 8, BOX.y + 8, 42, 42, COL.ink2).setOrigin(0));
        c.add(this.add.rectangle(BOX.x + 9, BOX.y + 9, 40, 40, COL.sky).setOrigin(0));
        c.add(this.add.image(BOX.x + 9, BOX.y + 9, o.portrait).setOrigin(0));
        tx = BOX.x + 58;
      }
      if (o.name) {
        const w = textWidth(this, o.name) + 18;
        c.add(win(this, BOX.x + 6, BOX.y - 14, w, 18, 'win_name'));
        c.add(txt(this, BOX.x + 15, BOX.y - 9, o.name, o.color, COL.ink));
      }
      const maxW = BOX.x + BOX.w - 14 - tx;
      const text = txt(this, tx, BOX.y + 9, '', kind === 'desc' && !o.name ? COL.ink2 : COL.ink);
      c.add(text);
      const more = this.add.image(BOX.x + BOX.w - 14, BOX.y + BOX.h - 9, 'ui', 'more').setVisible(false);
      c.add(more);
      this.tweens.add({ targets: more, y: more.y + 2, duration: 300, yoyo: true, repeat: -1 });

      let pg: string[] = [];
      let page = 0;
      let shown = 0;
      let acc = 0;
      const layout = () => {
        pg = pages(wrap(this, tr(o.text, langFor(kind)), maxW), 3);
        page = Math.min(page, pg.length - 1);
      };
      layout();
      const cps = settings.get('textSpeed');
      const full = () => pg[page]!;
      const onUpdate = (_t: number, dt: number) => {
        if (input.pressed('language')) {
          settings.set(kind === 'dialogue' ? 'dialogueLang' : 'descLang', langFor(kind) === 'en' ? 'ta' : 'en');
          layout();
          shown = full().length;
          audio.sfx('ui_move');
        }
        if (shown < full().length) {
          if (cps <= 0) shown = full().length;
          else {
            acc += (dt / 1000) * cps * (input.isDown('confirm') ? 3 : 1);
            const n = Math.floor(acc);
            if (n > 0) { acc -= n; shown = Math.min(full().length, shown + n); if (shown % 3 === 0) audio.sfx('blip', 1.4); }
          }
          text.setText(full().slice(0, shown));
          more.setVisible(false);
          if (input.pressed('confirm')) { shown = full().length; text.setText(full()); input.consume('confirm'); }
          return;
        }
        text.setText(full());
        more.setVisible(true);
        if (input.pressed('confirm') || input.pressed('cancel')) {
          input.consume('confirm', 'cancel');
          audio.sfx('ui_ok', 1.2);
          if (page < pg.length - 1) { page++; shown = 0; acc = 0; return; }
          this.events.off('update', onUpdate);
          resolve();
        }
      };
      this.events.on('update', onUpdate);
    });
  }

  /** Closes the dialogue box (the director calls this when a script ends). */
  endTalk(): void {
    this.box?.destroy();
    this.box = undefined;
    this.busy = false;
    this.refreshTracker();
  }

  choose(options: Loc[]): Promise<number> {
    this.busy = true;
    return new Promise((resolve) => {
      const labels = options.map((o) => tr(o, langFor('dialogue')));
      const w = Math.max(...labels.map((l) => textWidth(this, l))) + 30;
      const h = labels.length * 14 + 12;
      const x = VIEW_W - w - 8;
      const y = BOX.y - h - 4;
      const c = this.add.container(0, 0).setDepth(110);
      c.add(win(this, x, y, w, h));
      labels.forEach((l, i) => c.add(txt(this, x + 20, y + 8 + i * 14, l)));
      const cur = this.add.image(x + 10, y + 12, 'ui', 'cursor');
      c.add(cur);
      let i = 0;
      const onUpdate = () => {
        if (input.pressed('up')) { i = (i + labels.length - 1) % labels.length; audio.sfx('ui_move'); }
        if (input.pressed('down')) { i = (i + 1) % labels.length; audio.sfx('ui_move'); }
        cur.y = y + 12 + i * 14;
        if (input.pressed('confirm')) {
          input.consume('confirm');
          audio.sfx('ui_ok');
          this.events.off('update', onUpdate);
          c.destroy();
          resolve(i);
        }
      };
      this.events.on('update', onUpdate);
    });
  }

  /** A centred notice (content notes) that waits for the player. */
  notice(title: string, body: string): Promise<void> {
    this.busy = true;
    this.hideTracker();
    return new Promise((resolve) => {
      const w = 320;
      const lines = wrap(this, body, w - 32);
      const h = 40 + lines.length * LINE_H + 16;
      const x = (VIEW_W - w) / 2;
      const y = (VIEW_H - h) / 2;
      const c = this.add.container(0, 0).setDepth(120);
      c.add(this.add.rectangle(0, 0, VIEW_W, VIEW_H, COL.ink, 0.7).setOrigin(0));
      c.add(win(this, x, y, w, h));
      c.add(txt(this, x + 16, y + 12, title, COL.red));
      c.add(txt(this, x + 16, y + 30, lines.join('\n')));
      const ok = txt(this, x + w - 16, y + h - 16, tr({ en: 'Z: continue', ta: 'Z: thodarunga' }), COL.stone, null).setOrigin(1, 0);
      c.add(ok);
      const onUpdate = () => {
        if (input.pressed('confirm')) {
          input.consume('confirm');
          audio.sfx('ui_ok');
          this.events.off('update', onUpdate);
          c.destroy();
          this.busy = false;
          resolve();
        }
      };
      this.events.on('update', onUpdate);
    });
  }

  /** A place-and-time card across the top of the screen. */
  caption(text: Loc): Promise<void> {
    const s = tr(text);
    const w = textWidth(this, s) + 28;
    const c = this.add.container(0, -30).setDepth(90);
    c.add(win(this, (VIEW_W - w) / 2, 8, w, 22, 'win_ink'));
    c.add(txt(this, VIEW_W / 2, 14, s, COL.podHi, COL.ink).setOrigin(0.5, 0));
    this.tweens.add({ targets: c, y: 0, duration: 350, ease: 'Quad.easeOut' });
    this.time.delayedCall(3200, () => this.tweens.add({ targets: c, y: -30, duration: 350, onComplete: () => c.destroy() }));
    return new Promise((r) => this.time.delayedCall(900, r));
  }

  /** The location sign that slides in when you enter a map. */
  showBanner(name: string): void {
    this.banner?.destroy();
    const w = Math.max(90, textWidth(this, name) + 26);
    const c = this.add.container(-w - 10, 0).setDepth(80);
    c.add(win(this, 6, 6, w, 22, 'win_paper'));
    c.add(this.add.rectangle(12, 12, 3, 10, COL.pod).setOrigin(0));
    c.add(txt(this, 20, 12, name));
    this.banner = c;
    this.tweens.add({ targets: c, x: 0, duration: 300, ease: 'Quad.easeOut' });
    this.time.delayedCall(2600, () => {
      if (this.banner === c) this.tweens.add({ targets: c, x: -w - 10, duration: 300, onComplete: () => c.destroy() });
    });
  }

  /** A short message stacked at the top right. */
  toast(s: string, color: number = COL.ink): void {
    const w = textWidth(this, s) + 20;
    // Stacked down the left, under the location banner (the quest tracker has the right).
    const y = 34 + this.toasts.length * 20;
    const c = this.add.container(-w - 4, y).setDepth(95);
    c.add(win(this, 0, 0, w, 18, 'win_paper'));
    c.add(txt(this, 10, 5, s, color));
    this.toasts.push(c);
    this.tweens.add({ targets: c, x: 6, duration: 250, ease: 'Quad.easeOut' });
    this.time.delayedCall(2800, () => {
      this.tweens.add({
        targets: c, x: -w - 4, duration: 250,
        onComplete: () => { c.destroy(); this.toasts = this.toasts.filter((t) => t !== c); },
      });
    });
  }

  pin(questId: string): void {
    this.pinned = questId;
    this.refreshTracker();
  }

  hideTracker(): void {
    this.tracker?.setVisible(false);
  }

  /** The small quest line at the top right: the pinned quest, else the first active one. */
  refreshTracker(): void {
    this.tracker?.destroy();
    this.tracker = undefined;
    const st = session.state;
    const active = questList(st).filter((q) => !q.done).map((q) => q.def.id);
    const id = this.pinned && active.includes(this.pinned) ? this.pinned : active[0];
    if (!id || this.busy) return;
    const cur = currentStep(st, id);
    if (!cur) return;
    const w = 170;
    const lines = wrap(this, tr(cur.step.text) + cur.progress, w - 16);
    const h = 18 + lines.length * LINE_H;
    const c = this.add.container(VIEW_W - w - 6, 6).setDepth(70).setAlpha(0.92);
    c.add(win(this, 0, 0, w, h, 'win_ink'));
    c.add(this.add.image(10, 10, 'ui', 'icon_quest').setScale(0.75));
    c.add(txt(this, 20, 6, lines.join('\n'), COL.paper, COL.ink));
    this.tracker = c;
  }
}
