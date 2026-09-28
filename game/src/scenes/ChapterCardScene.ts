import Phaser from 'phaser';
import { input } from '../core/Input';
import { tr, type Loc } from '../core/Localization';
import { settings } from '../core/Settings';
import { addText, C, H, W } from '../ui/theme';

export interface CardData { purpose: number; venture: number; title: Loc | null; time: string; done: () => void }

/** "Purpose 2 · Venture 15" title card with the in-story date and time. */
export class ChapterCardScene extends Phaser.Scene {
  constructor() { super({ key: 'ChapterCard' }); }

  create(data: CardData) {
    const fast = settings.get('reducedMotion');
    const bg = this.add.rectangle(0, 0, W, H, 0x03050a, 1).setOrigin(0).setAlpha(0);
    const line = this.add.rectangle(W / 2, H / 2 + 6, 0, 1, 0x9cc9ff, 0.6);
    const top = addText(this, W / 2, H / 2 - 64, `PURPOSE ${data.purpose}  ·  VENTURE ${data.venture}`, { size: 18, color: C.textDim, letterSpacing: 6 }).setOrigin(0.5).setAlpha(0);
    const title = addText(this, W / 2, H / 2 - 24, data.title ? tr(data.title) : '', { size: 54, display: true, bold: true }).setOrigin(0.5).setAlpha(0);
    const time = addText(this, W / 2, H / 2 + 36, data.time, { size: 20, display: true, color: C.accent, fontStyle: 'italic' }).setOrigin(0.5).setAlpha(0);
    const d = fast ? 200 : 700;
    this.tweens.add({ targets: bg, alpha: 1, duration: d });
    this.tweens.add({ targets: line, width: 420, duration: d * 1.6, delay: d, ease: 'Cubic.Out' });
    this.tweens.add({ targets: [top, title, time], alpha: 1, duration: d * 1.2, delay: d * 1.2 });
    let closing = false;
    const close = () => {
      if (closing) return;
      closing = true;
      this.tweens.add({
        targets: [bg, line, top, title, time], alpha: 0, duration: d,
        onComplete: () => { data.done(); this.scene.stop(); },
      });
    };
    this.time.delayedCall(fast ? 1800 : 3600, close);
    this.events.on('update', () => {
      if (input.pressed('confirm') || input.pressed('cancel')) { input.consume(); close(); }
    });
  }
}
