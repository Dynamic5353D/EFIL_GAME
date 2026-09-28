/**
 * Word battles (battle/WordCore.ts): two portraits facing each other over the room's backdrop, the
 * opponent's Resolve (or the rounds left to hold out) and your Composure, the stance they have taken,
 * and your moves. Losing offers an immediate retry; the story never branches on a loss.
 */
import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { input } from '../core/Input';
import { tr, type Loc } from '../core/Localization';
import { ensureTextures, spec } from '../core/Loader';
import { settings } from '../core/Settings';
import { takeTip, tipBody } from '../core/Tips';
import { createWord, effectOf, lineFor, playRound, STANCES, stanceLines, type WordBattleDef, type WordLine, type WordState } from '../battle/WordCore';
import type { MusicId } from '../data/media';
import { SPEAKERS } from '../data/speakers';
import { WORD_BATTLES } from '../data/wordbattles';
import { MenuList } from '../ui/MenuList';
import { addText, bar, C, drawGlowPanel, glow, H, W } from '../ui/theme';
import { ensureEarthTextures } from '../world/EarthPainter';

export interface WordBattleData {
  battle: string;
  backdrop: string;
  onDone: (won: boolean) => void;
}

const BOX = { x: 150, y: 470, w: 980, h: 118 };
const STANCE_COLOR: Record<string, number> = {
  mocking: 0xffb070, pressing: 0xff8a6a, wavering: 0x8dffbd, afraid: 0xa8c8ff, enraged: 0xff5a5a,
  guarded: 0xc8b8ff, cold: 0x9fd8ff, grieving: 0xd8a8ff, pleading: 0xffd98a,
};
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

export class WordBattleScene extends Phaser.Scene {
  private data_!: WordBattleData;
  private def!: WordBattleDef;
  private st!: WordState;
  private g!: Phaser.GameObjects.Graphics;
  private bars!: Phaser.GameObjects.Graphics;
  private speaker!: Phaser.GameObjects.Text;
  private body!: Phaser.GameObjects.Text;
  private stanceName!: Phaser.GameObjects.Text;
  private stanceHint!: Phaser.GameObjects.Text;
  private stanceBox!: Phaser.GameObjects.Graphics;
  private youImg!: Phaser.GameObjects.Image;
  private foeImg!: Phaser.GameObjects.Image;
  private labels: Phaser.GameObjects.Text[] = [];
  private menu: MenuList | null = null;
  private menuBox: Phaser.GameObjects.Graphics | null = null;
  private moveHint: Phaser.GameObjects.Text | null = null;
  private shown = { resolve: 1, composure: 1 };

  constructor() { super({ key: 'WordBattle' }); }

  create(data: WordBattleData) {
    this.data_ = data;
    const def = WORD_BATTLES[data.battle];
    if (!def) { data.onDone(true); return; }
    this.def = def;
    this.labels = [];
    this.menu = null;
    ensureEarthTextures(this, data.backdrop);
    const portraits = [def.you, def.foe].map((id) => SPEAKERS[id]?.portrait).filter((p): p is string => !!p && !p.startsWith('gen:'));
    void ensureTextures(this, [spec('bg', data.backdrop), ...portraits.map((p) => spec('portrait', p))]).then(() => {
      this.build();
      void this.run();
    });
  }

  private portraitKey(id: string): string {
    const p = SPEAKERS[id]?.portrait;
    if (!p) return '__DEFAULT';
    return p.startsWith('gen:') ? `portrait:${p}` : `portrait:${p}`;
  }

  private build() {
    const d = this.def;
    audio.music((d.music as MusicId) ?? 'words');
    const cam = this.cameras.main;
    cam.setBackgroundColor(0x05070d);
    if (this.textures.exists(`bg:${this.data_.backdrop}`)) {
      const bg = this.add.image(W / 2, H / 2, `bg:${this.data_.backdrop}`);
      bg.setScale(Math.max(W / bg.width, H / bg.height) * 1.1).setAlpha(0.55);
      bg.enableFilters();
      const cm = bg.filters!.internal.addColorMatrix();
      cm.colorMatrix.brightness(0.55);
      cm.colorMatrix.saturate(-0.35, true);
      bg.filters!.internal.addBlur(1, 2, 2, 1.2);
    }
    cam.filters.external.addVignette(0.5, 0.5, 0.75, 0.55);
    this.g = this.add.graphics();
    this.bars = this.add.graphics();

    // Title and goal.
    glow(addText(this, W / 2, 26, tr(d.title), { size: 34, display: true, bold: true, color: C.warm }), C.warm, 14).setOrigin(0.5, 0);
    addText(this, W / 2, 72, tr(d.goal), { size: 18, color: '#dfe8f8' }).setOrigin(0.5, 0);

    // Portraits.
    const frame = (x: number, color: number) => {
      drawGlowPanel(this.g, x - 110, 120, 220, 250, color, 0.9, 16);
    };
    const youCol = SPEAKERS[d.you]?.color ?? C.accentInt;
    const foeCol = SPEAKERS[d.foe]?.color ?? C.dangerInt;
    frame(200, youCol);
    frame(W - 200, foeCol);
    this.youImg = this.add.image(200, 245, this.portraitKey(d.you));
    this.youImg.setScale(200 / Math.max(this.youImg.width, this.youImg.height));
    this.foeImg = this.add.image(W - 200, 245, this.portraitKey(d.foe)).setFlipX(true);
    this.foeImg.setScale(200 / Math.max(this.foeImg.width, this.foeImg.height));
    glow(addText(this, 200, 380, tr(SPEAKERS[d.you]?.name ?? { en: d.you, ta: d.you }), { size: 22, bold: true, color: hex(youCol) }), hex(youCol), 8).setOrigin(0.5, 0);
    glow(addText(this, W - 200, 380, tr(SPEAKERS[d.foe]?.name ?? { en: d.foe, ta: d.foe }), { size: 22, bold: true, color: hex(foeCol) }), hex(foeCol), 8).setOrigin(0.5, 0);

    // Stance chip in the middle.
    this.stanceBox = this.add.graphics();
    this.stanceName = addText(this, W / 2, 190, '', { size: 30, display: true, bold: true }).setOrigin(0.5);
    this.stanceHint = addText(this, W / 2, 232, '', { size: 18, color: '#e6eefc', align: 'center', wordWrap: { width: 470 } }).setOrigin(0.5, 0);
    addText(this, W / 2, 142, 'STANCE', { size: 13, bold: true, color: C.textDim, letterSpacing: 3 }).setOrigin(0.5);

    // Dialogue box.
    drawGlowPanel(this.g, BOX.x, BOX.y, BOX.w, BOX.h, 0x9cc9ff, 0.92, 14);
    this.speaker = addText(this, BOX.x + 24, BOX.y + 14, '', { size: 20, bold: true, color: C.accent });
    this.body = addText(this, BOX.x + 24, BOX.y + 44, '', { size: 21, color: '#f2f6ff', wordWrap: { width: BOX.w - 48 }, lineSpacing: 4 });
    this.drawBars(true);
  }

  private drawBars(instant = false) {
    const d = this.def, st = this.st;
    const res = d.mode === 'resolve' ? (st ? st.resolve / d.resolve : 1) : st ? 1 - st.round / (d.rounds ?? 6) : 1;
    const com = st ? st.composure / d.composure : 1;
    const k = instant ? 1 : 0.2;
    this.shown.resolve += (res - this.shown.resolve) * k;
    this.shown.composure += (com - this.shown.composure) * k;
    const b = this.bars;
    b.clear();
    bar(b, 90, 420, 220, 12, this.shown.composure, this.shown.composure < 0.3 ? C.hpLow : 0x7fd4ff);
    bar(b, W - 310, 420, 220, 12, this.shown.resolve, d.mode === 'resolve' ? 0xffb070 : 0xffd98a);
    if (!this.labels.length) {
      this.labels.push(addText(this, 90, 436, 'Composure', { size: 14, color: C.textDim }));
      this.labels.push(addText(this, W - 90, 436, d.mode === 'resolve' ? 'Resolve' : 'Rounds to hold out', { size: 14, color: C.textDim }).setOrigin(1, 0));
      this.labels.push(addText(this, W - 90, 402, '', { size: 14, color: '#f2f6ff' }).setOrigin(1, 0));
      this.labels.push(addText(this, 310, 402, '', { size: 14, color: '#f2f6ff' }).setOrigin(1, 0));
    }
    if (st) {
      this.labels[2]!.setText(d.mode === 'resolve' ? `${st.resolve}` : `${Math.max(0, (d.rounds ?? 6) - st.round)}`);
      this.labels[3]!.setText(`${st.composure}`);
    }
  }

  private showStance() {
    const s = STANCES[this.st.stance];
    const col = STANCE_COLOR[s.id] ?? C.accentInt;
    this.stanceBox.clear();
    drawGlowPanel(this.stanceBox, W / 2 - 260, 160, 520, 130, col, 0.9, 14);
    glow(this.stanceName.setText(tr(s.name)).setColor(hex(col)), hex(col), 12);
    this.stanceHint.setText(tr(s.hint));
    this.stanceBox.setAlpha(0);
    this.tweens.add({ targets: [this.stanceBox, this.stanceName, this.stanceHint], alpha: { from: 0, to: 1 }, duration: 250 });
  }

  // ------------------------------------------------------------------ flow
  private wait(ms: number) { return new Promise<void>((r) => this.time.delayedCall(ms, () => r())); }

  /** Shows a line and waits for confirm. */
  private line(who: WordLine['who'], text: Loc): Promise<void> {
    const id = who === 'you' ? this.def.you : who === 'foe' ? this.def.foe : null;
    const sp = id ? SPEAKERS[id] : null;
    this.speaker.setText(sp ? tr(sp.name) : '').setColor(sp ? hex(sp.color) : C.accent);
    this.body.setText(tr(text)).setY(sp ? BOX.y + 44 : BOX.y + 30).setFontStyle(sp ? 'normal' : 'italic');
    if (id === this.def.you) this.pulse(this.youImg);
    if (id === this.def.foe) this.pulse(this.foeImg);
    audio.sfx('blip');
    return this.confirm();
  }

  private pulse(img: Phaser.GameObjects.Image) {
    if (settings.get('reducedMotion')) return;
    const s = img.scale;
    this.tweens.add({ targets: img, scale: s * 1.04, duration: 120, yoyo: true });
  }

  private confirm(): Promise<void> {
    input.consume();
    return new Promise((resolve) => {
      const t0 = this.time.now;
      const check = () => {
        if (this.time.now - t0 > 250 && (input.pressed('confirm') || input.pressed('interact') || input.pressed('jump'))) {
          input.consume();
          this.events.off('update', check);
          resolve();
        }
      };
      this.events.on('update', check);
    });
  }

  private tutorial(): Promise<void> {
    const t = takeTip('words');
    if (!t) return Promise.resolve();
    return new Promise((resolve) => {
      const w = 660, x = W / 2 - w / 2;
      const shade = this.add.rectangle(0, 0, W, H, 0x02040a, 0.6).setOrigin(0);
      const title = glow(addText(this, x + 28, 0, tr(t.title), { size: 30, display: true, bold: true, color: C.warm }), C.warm, 12);
      const body = addText(this, x + 28, 0, tipBody(t), { size: 21, color: '#f2f6ff', wordWrap: { width: w - 56 }, lineSpacing: 5 });
      const h = body.height + 132, y = H / 2 - h / 2 - 20;
      title.setY(y + 22);
      body.setY(y + 72);
      const hint = addText(this, W / 2, y + h - 30, `${input.label('confirm')}  Got it`, { size: 17, bold: true, color: '#cfe6ff' }).setOrigin(0.5);
      const g = this.add.graphics();
      drawGlowPanel(g, x, y, w, h, C.warmInt, 0.96, 14);
      const c = this.add.container(0, 0, [shade, g, title, body, hint]).setDepth(1300);
      void this.confirm().then(() => { c.destroy(); resolve(); });
    });
  }

  private chooseMove(): Promise<number> {
    return new Promise((resolve) => {
      const moves = this.def.moves;
      const rowH = 42;
      const w = 420, h = moves.length * rowH + 20;
      const x = BOX.x, y = BOX.y - h - 12;
      this.menuBox = this.add.graphics();
      drawGlowPanel(this.menuBox, x, y, w, h, 0x9cc9ff, 0.95, 12);
      this.moveHint = addText(this, x + w + 18, y + h - 10, '', { size: 18, color: '#dfe8f8', wordWrap: { width: BOX.x + BOX.w - x - w - 18 } }).setOrigin(0, 1);
      this.menu = new MenuList(this, x, y + 10, moves.map((m, i) => ({
        label: () => tr(m.name),
        hint: () => tr(m.desc),
        onFocus: () => this.moveHint?.setText(tr(m.desc)),
        onSelect: () => resolve(i),
      })), { width: w, lineHeight: rowH, size: 21 });
      this.moveHint.setText(tr(moves[0]!.desc));
    });
  }

  private closeMenu() {
    this.menu?.destroy();
    this.menu = null;
    this.menuBox?.destroy();
    this.menuBox = null;
    this.moveHint?.destroy();
    this.moveHint = null;
  }

  private async run() {
    const d = this.def;
    for (const l of d.intro) await this.line(l.who, l.text);
    await this.tutorial();
    for (;;) {
      this.st = createWord(d, (Date.now() ^ (Math.random() * 1e9)) | 0);
      this.drawBars(true);
      const won = await this.fight();
      if (won) break;
      audio.sfx('hurt');
      await this.line('narrator', d.lose);
    }
    audio.music('none');
    audio.sfx('ability');
    for (const l of d.win) await this.line(l.who, l.text);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    await this.wait(420);
    this.data_.onDone(true);
  }

  private async fight(): Promise<boolean> {
    const st = this.st, d = this.def;
    while (!st.outcome) {
      this.showStance();
      await this.line('foe', lineFor(st, `stance:${st.stance}`, stanceLines(st)));
      this.speaker.setText('');
      this.body.setText('');
      const i = await this.chooseMove();
      this.closeMenu();
      const m = d.moves[i]!;
      const effect = effectOf(st.stance, m.move);
      await this.line('you', lineFor(st, `move:${m.move}`, m.lines));
      const r = playRound(st, m.move);
      if (effect === 'strong') {
        audio.sfx('hit');
        this.flashOn(this.foeImg, 0xffd98a);
        this.popup(W - 200, 190, d.mode === 'resolve' ? `It lands!  -${r.damage}` : 'You hold steady.', C.warm);
      } else if (effect === 'weak') {
        audio.sfx('ui_back');
        this.popup(W - 200, 190, d.mode === 'resolve' ? `It glances off.  -${r.damage}` : 'That made it worse.', '#b9c7dd');
      } else if (d.mode === 'resolve') this.popup(W - 200, 190, `-${r.damage}`, '#f2f6ff');
      if (r.healed > 0) this.popup(200, 300, `+${r.healed}`, C.good);
      await this.animateBars();
      if (st.outcome === 'won') return true;
      await this.line('foe', lineFor(st, effect === 'weak' ? 'shrug' : 'hurt', effect === 'weak' ? d.shrug : d.hurt));
      if (r.taken > 0) {
        this.flashOn(this.youImg, 0xff6a6a);
        if (settings.get('screenShake') && !settings.get('reducedMotion')) this.cameras.main.shake(140, 0.005);
        audio.sfx('dread', 1.4);
        this.popup(200, 190, `-${r.taken}`, C.danger);
        await this.animateBars();
      }
      if (st.outcome === 'lost') return false;
    }
    return st.outcome === 'won';
  }

  private animateBars(): Promise<void> {
    return new Promise((resolve) => {
      let n = 0;
      const step = () => {
        this.drawBars();
        if (++n > 24) { this.drawBars(true); this.events.off('update', step); resolve(); }
      };
      this.events.on('update', step);
    });
  }

  private flashOn(img: Phaser.GameObjects.Image, color: number) {
    img.setTint(color);
    this.time.delayedCall(160, () => img.clearTint());
  }

  private popup(x: number, y: number, text: string, color: string) {
    const t = glow(addText(this, x, y, text, { size: 26, bold: true, color, stroke: '#05070d', strokeThickness: 5 }), color, 10).setOrigin(0.5).setDepth(900);
    this.tweens.add({ targets: t, y: y - 50, alpha: { from: 1, to: 0 }, duration: 1200, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  override update(time: number) {
    this.menu?.update(time);
  }
}
