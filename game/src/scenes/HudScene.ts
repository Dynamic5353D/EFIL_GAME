import Phaser from 'phaser';
import { bus } from '../core/EventBus';
import { memberStats } from '../core/GameState';
import { tr, type Loc } from '../core/Localization';
import { session } from '../core/Session';
import { settings } from '../core/Settings';
import { CHARACTERS } from '../data/characters';
import { TIPS } from '../data/tips';
import { tipBody } from '../core/Tips';
import { addText, bar, C, drawGlowPanel, glow, W } from '../ui/theme';

/** Exploration HUD: party health, Soul Hunger, RI shards, ammo, toasts and area banners. */
export class HudScene extends Phaser.Scene {
  private g!: Phaser.GameObjects.Graphics;
  private texts: Phaser.GameObjects.GameObject[] = [];
  private toasts: Phaser.GameObjects.Container[] = [];
  private offs: (() => void)[] = [];
  private tipQueue: string[] = [];
  private tipCard: Phaser.GameObjects.Container | null = null;

  constructor() { super({ key: 'Hud' }); }

  create() {
    this.g = this.add.graphics();
    this.refresh();
    this.offs.push(bus.on('hud', () => this.refresh()));
    this.offs.push(bus.on('toast', ({ text, icon }) => this.toast(text, icon)));
    this.offs.push(bus.on('tip', ({ id }) => { this.tipQueue.push(id); if (!this.tipCard) this.nextTip(); }));
    this.events.once('shutdown', () => this.offs.forEach((o) => o()));
  }

  refresh() {
    this.g.clear();
    this.texts.forEach((t) => t.destroy());
    this.texts = [];
    const st = session.state;
    let x = 28;
    const y = 24;
    for (const id of st.party) {
      const m = st.members[id];
      if (!m) continue;
      const c = CHARACTERS[id];
      const max = memberStats(st, id).maxHp;
      const key = `portrait:gen:${id}`;
      if (this.textures.exists(key)) {
        const p = this.add.image(x + 26, y + 26, key).setDisplaySize(52, 52);
        this.texts.push(p);
      }
      this.g.lineStyle(2, c.vein, 0.8).strokeCircle(x + 26, y + 26, 27);
      this.texts.push(addText(this, x + 62, y + 2, tr(c.name), { size: 17, bold: true }));
      bar(this.g, x + 62, y + 26, 120, 8, m.hp / max, m.hp / max < 0.3 ? C.hpLow : C.hp);
      this.texts.push(addText(this, x + 186, y + 21, `${m.hp}`, { size: 14, color: C.textDim }));
      if (id === 'ragul') {
        bar(this.g, x + 62, y + 40, 120, 5, st.soulHunger / 100, st.soulHunger >= 70 ? 0xff5a7a : 0x9a7cff);
        this.texts.push(addText(this, x + 186, y + 35, 'hunger', { size: 12, color: C.textFaint }));
      }
      if (id === 'dhanasree') {
        for (let i = 0; i < 6; i++) {
          this.g.fillStyle(i < st.ammo ? 0xffd98a : 0x2a3348, 1).fillRect(x + 62 + i * 9, y + 41, 6, 4);
        }
      }
      x += 250;
    }
    const shardY = 26;
    this.g.fillStyle(0x86d8ff, 1);
    this.g.fillPoints([{ x: W - 110, y: shardY }, { x: W - 102, y: shardY + 10 }, { x: W - 110, y: shardY + 24 }, { x: W - 118, y: shardY + 10 }] as Phaser.Math.Vector2[], true);
    this.texts.push(addText(this, W - 94, shardY + 2, String(st.riShards), { size: 20, bold: true }));
  }

  toast(text: string, icon?: string) {
    const y = 110 + this.toasts.length * 46;
    const c = this.add.container(W - 30, y);
    const t = addText(this, 0, 0, text, { size: 19 }).setOrigin(1, 0.5);
    const g = this.add.graphics();
    g.fillStyle(0x0b1220, 0.85).fillRoundedRect(-t.width - (icon ? 60 : 24), -19, t.width + (icon ? 72 : 36), 38, 8);
    g.lineStyle(1, 0x9cc9ff, 0.3).strokeRoundedRect(-t.width - (icon ? 60 : 24), -19, t.width + (icon ? 72 : 36), 38, 8);
    c.add([g, t]);
    if (icon) {
      const key = icon.startsWith('gen:') ? `icon:${icon}` : `icon:${icon}`;
      if (this.textures.exists(key)) c.add(this.add.image(-t.width - 32, 0, key).setDisplaySize(30, 30));
      else c.add(this.add.image(-t.width - 32, 0, 'fx:spark').setDisplaySize(26, 26).setTint(0xbfe6ff));
    }
    c.setAlpha(0).setX(W + 20);
    this.toasts.push(c);
    this.tweens.add({ targets: c, alpha: 1, x: W - 30, duration: settings.get('reducedMotion') ? 1 : 300, ease: 'Cubic.Out' });
    this.time.delayedCall(3200, () => {
      this.tweens.add({
        targets: c, alpha: 0, duration: 400, onComplete: () => {
          c.destroy();
          this.toasts = this.toasts.filter((x) => x !== c);
          this.toasts.forEach((o, i) => this.tweens.add({ targets: o, y: 110 + i * 46, duration: 200 }));
        },
      });
    });
  }

  /** First-time tip card, top centre. Tips queue up and each stays long enough to read. */
  private nextTip() {
    const id = this.tipQueue.shift();
    const t = id ? TIPS[id] : undefined;
    if (!t) { this.tipCard = null; return; }
    const w = 660, x = W / 2 - w / 2, y = 96;
    const title = glow(addText(this, x + 22, y + 14, `${tr(t.title)}`, { size: 22, display: true, bold: true, color: C.warm }), C.warm, 8);
    const body = addText(this, x + 22, y + 46, tipBody(t), { size: 19, color: '#f2f6ff', wordWrap: { width: w - 44 }, lineSpacing: 3 });
    const h = body.height + 64;
    const g = this.add.graphics();
    drawGlowPanel(g, x, y, w, h, C.warmInt, 0.93, 12);
    const tag = addText(this, x + w - 18, y + 16, 'TIP', { size: 13, color: C.warm, letterSpacing: 3, bold: true }).setOrigin(1, 0);
    const c = this.add.container(0, 0, [g, title, body, tag]).setAlpha(0);
    this.tipCard = c;
    const calm = settings.get('reducedMotion');
    c.y = calm ? 0 : -12;
    this.tweens.add({ targets: c, alpha: 1, y: 0, duration: calm ? 1 : 350, ease: 'Cubic.Out' });
    const readMs = Math.max(6500, 2500 + body.text.length * 55);
    this.time.delayedCall(readMs, () => {
      this.tweens.add({ targets: c, alpha: 0, duration: 400, onComplete: () => { c.destroy(); this.nextTip(); } });
    });
  }

  /** Big area title, Hollow Knight style. */
  banner(name: Loc, sub?: string) {
    const t = addText(this, W / 2, 290, tr(name), { size: 50, display: true, bold: true }).setOrigin(0.5).setAlpha(0);
    const s = addText(this, W / 2, 340, sub ?? '', { size: 18, color: C.textDim, letterSpacing: 4 }).setOrigin(0.5).setAlpha(0);
    const l = this.add.rectangle(W / 2, 322, 0, 1, 0x9cc9ff, 0.5);
    this.tweens.add({ targets: [t, s], alpha: 1, duration: 900, hold: 1800, yoyo: true, onComplete: () => { t.destroy(); s.destroy(); } });
    this.tweens.add({ targets: l, width: 360, duration: 900, hold: 1800, yoyo: true, onComplete: () => l.destroy() });
  }
}
