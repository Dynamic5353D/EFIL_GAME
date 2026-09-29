import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { input } from '../../core/Input';

/**
 * Keyboard/gamepad cursor over a vertical list, with mouse and touch too: hovering an item selects it,
 * clicking it confirms. Call `update()` every frame; it returns 'confirm', 'cancel' or null.
 */
export class ListNav {
  i = 0;
  private clicked = -1;
  constructor(public count: number, private wrap = true) {}

  update(): 'confirm' | 'cancel' | 'left' | 'right' | null {
    if (this.clicked >= 0) { this.i = this.clicked; this.clicked = -1; audio.sfx('ui_ok'); return 'confirm'; }
    if (!this.count) return input.pressed('cancel') ? this.back() : null;
    if (input.pressed('up')) this.move(-1);
    if (input.pressed('down')) this.move(1);
    if (input.pressed('left')) { input.consume('left'); return 'left'; }
    if (input.pressed('right')) { input.consume('right'); return 'right'; }
    if (input.pressed('confirm')) { input.consume('confirm'); audio.sfx('ui_ok'); return 'confirm'; }
    if (input.pressed('cancel') || input.pressed('menu')) return this.back();
    return null;
  }

  private back(): 'cancel' {
    input.consume('cancel', 'menu');
    audio.sfx('ui_back');
    return 'cancel';
  }

  move(d: number): void {
    const n = this.i + d;
    this.i = this.wrap ? (n + this.count) % this.count : Math.max(0, Math.min(this.count - 1, n));
    audio.sfx('ui_move');
  }

  /** Makes a rectangle clickable as item `index`. */
  hit(scene: Phaser.Scene, index: number, x: number, y: number, w: number, h: number): Phaser.GameObjects.Zone {
    const z = scene.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => { if (this.i !== index) { this.i = index; audio.sfx('ui_move'); } });
    z.on('pointerdown', () => { this.clicked = index; });
    return z;
  }
}
