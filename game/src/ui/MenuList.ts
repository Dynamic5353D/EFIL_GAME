import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { input } from '../core/Input';
import { addText, C } from './theme';

export interface MenuItem {
  label: () => string;
  /** Right-aligned value (settings). */
  value?: () => string;
  onSelect?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  disabled?: () => boolean;
  /** Shown in the hint line when focused. */
  hint?: () => string;
  onFocus?: () => void;
}

export interface MenuOpts {
  width: number;
  lineHeight?: number;
  size?: number;
  display?: boolean;
  align?: 'left' | 'center';
  /** Max rows visible; the list scrolls beyond this. */
  rows?: number;
  onCancel?: () => void;
}

/** A vertical list driven by up/down/confirm/cancel (+ left/right for values), with mouse support. */
export class MenuList {
  index = 0;
  active = true;
  readonly container: Phaser.GameObjects.Container;
  private rowsObjs: { label: Phaser.GameObjects.Text; value?: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone }[] = [];
  private cursor: Phaser.GameObjects.Graphics;
  private repeatAt = 0;
  private scroll = 0;
  private lh: number;

  constructor(private scene: Phaser.Scene, x: number, y: number, public items: MenuItem[], private o: MenuOpts) {
    this.lh = o.lineHeight ?? 44;
    this.container = scene.add.container(x, y);
    this.cursor = scene.add.graphics();
    this.container.add(this.cursor);
    this.build();
    while (this.items[this.index]?.disabled?.() && this.index < this.items.length - 1) this.index++;
    this.refresh();
  }

  private get visibleRows() { return Math.min(this.items.length, this.o.rows ?? this.items.length); }

  private build() {
    for (const r of this.rowsObjs) { r.label.destroy(); r.value?.destroy(); r.zone.destroy(); }
    this.rowsObjs = [];
    const center = this.o.align === 'center';
    for (let i = 0; i < this.visibleRows; i++) {
      const y = i * this.lh;
      const label = addText(this.scene, center ? this.o.width / 2 : 18, y + this.lh / 2, '', { size: this.o.size ?? 24, display: this.o.display }).setOrigin(center ? 0.5 : 0, 0.5);
      const value = this.items.some((it) => it.value)
        ? addText(this.scene, this.o.width - 16, y + this.lh / 2, '', { size: (this.o.size ?? 24) - 2, color: C.accent }).setOrigin(1, 0.5)
        : undefined;
      const zone = this.scene.add.zone(0, y, this.o.width, this.lh).setOrigin(0).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { if (this.active) this.focus(this.scroll + i); });
      zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (!this.active) return;
        this.focus(this.scroll + i);
        const it = this.items[this.index];
        if (!it || it.disabled?.()) return;
        const localX = p.x - this.container.x;
        if (it.onRight && localX > this.o.width * 0.55) { it.onRight(); audio.sfx('ui_move'); this.refresh(); }
        else if (it.onLeft && localX > this.o.width * 0.4) { it.onLeft(); audio.sfx('ui_move'); this.refresh(); }
        else if (it.onSelect) { audio.sfx('ui_ok'); it.onSelect(); }
      });
      this.container.add([label, ...(value ? [value] : []), zone]);
      this.rowsObjs.push({ label, value, zone });
    }
  }

  setItems(items: MenuItem[]) {
    this.items = items;
    this.index = Math.min(this.index, items.length - 1);
    this.scroll = 0;
    this.build();
    this.refresh();
  }

  focus(i: number) {
    if (i === this.index || i < 0 || i >= this.items.length) return;
    this.index = i;
    audio.sfx('ui_move');
    this.items[i]?.onFocus?.();
    this.refresh();
  }

  refresh() {
    const n = this.visibleRows;
    if (this.index < this.scroll) this.scroll = this.index;
    if (this.index >= this.scroll + n) this.scroll = this.index - n + 1;
    this.rowsObjs.forEach((r, i) => {
      const it = this.items[this.scroll + i];
      const sel = this.scroll + i === this.index;
      const dis = it?.disabled?.() ?? false;
      r.label.setText(it ? it.label() : '');
      r.label.setColor(dis ? C.textFaint : sel ? '#ffffff' : C.textDim);
      if (r.value) {
        const v = it?.value?.() ?? '';
        r.value.setText(v && (it?.onLeft || it?.onRight) ? `‹  ${v}  ›` : v);
        r.value.setColor(sel ? C.accent : C.textDim);
      }
    });
    const y = (this.index - this.scroll) * this.lh;
    this.cursor.clear();
    if (!this.items.length) return;
    this.cursor.fillStyle(C.accentInt, 0.12);
    this.cursor.fillRoundedRect(0, y + 3, this.o.width, this.lh - 6, 6);
    this.cursor.fillStyle(C.accentInt, 0.9);
    this.cursor.fillRoundedRect(2, y + this.lh * 0.28, 3, this.lh * 0.44, 1.5);
  }

  get current(): MenuItem | undefined { return this.items[this.index]; }

  /** Call every frame. */
  update(time: number) {
    if (!this.active || !this.items.length) return;
    const now = time;
    const step = (d: number) => {
      let i = this.index;
      for (let k = 0; k < this.items.length; k++) {
        i = (i + d + this.items.length) % this.items.length;
        if (!this.items[i]?.disabled?.()) break;
      }
      this.focus(i);
    };
    const held = (a: 'up' | 'down') => input.isDown(a) && now > this.repeatAt;
    if (input.pressed('up')) { step(-1); this.repeatAt = now + 380; }
    else if (input.pressed('down')) { step(1); this.repeatAt = now + 380; }
    else if (held('up')) { step(-1); this.repeatAt = now + 90; }
    else if (held('down')) { step(1); this.repeatAt = now + 90; }
    const it = this.items[this.index];
    if (!it) return;
    if (input.pressed('left') && it.onLeft && !it.disabled?.()) { it.onLeft(); audio.sfx('ui_move'); this.refresh(); }
    if (input.pressed('right') && it.onRight && !it.disabled?.()) { it.onRight(); audio.sfx('ui_move'); this.refresh(); }
    if (input.pressed('confirm') && !it.disabled?.()) {
      input.consume('confirm', 'jump');
      if (it.onSelect) { audio.sfx('ui_ok'); it.onSelect(); } else if (it.onRight) { it.onRight(); audio.sfx('ui_move'); this.refresh(); }
      return;
    }
    if (input.pressed('cancel') && this.o.onCancel) {
      input.consume('cancel', 'menu');
      audio.sfx('ui_back');
      this.o.onCancel();
    }
  }

  get height() { return this.visibleRows * this.lh; }

  destroy() { this.container.destroy(); }
}
