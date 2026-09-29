import Phaser from 'phaser';
import { assets } from '../core/Assets';
import { input } from '../core/Input';
import { addText, C, drawPanel, H, W } from '../ui/theme';
import type { OverlayData } from './SettingsScene';

/** Credits, third-party art notes and the helpline (plan.md, "Player care" and "Licensing note"). */
export class CreditsScene extends Phaser.Scene {
  private data_: OverlayData = {};
  private body!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;

  constructor() { super({ key: 'Credits' }); }

  create(data: OverlayData) {
    this.data_ = data;
    this.scrollY = 0;
    this.add.rectangle(0, 0, W, H, 0x03050a, 0.82).setOrigin(0);
    const g = this.add.graphics();
    drawPanel(g, W / 2 - 420, 50, 840, 620, 0.95, 14);
    addText(this, W / 2, 70, 'Credits', { size: 36, display: true, bold: true }).setOrigin(0.5, 0);
    this.body = this.add.container(0, 0);
    const lines: [string, string, number?][] = [
      ['EFIL', C.warm, 28],
      ['Adapted from the EFIL novel and its concept art.', C.text],
      ['', C.text],
      ['Engine and code', C.accent, 22],
      ['Phaser 4 (MIT licence), TypeScript, Vite, bun.', C.text],
      ['Music and sound are generated in code; all compositions are original.', C.text],
      ['Fonts: Cormorant Garamond and Alegreya Sans (SIL Open Font Licence).', C.text],
      ['', C.text],
      ['Third-party art in this private build', C.accent, 22],
      ['These images carry other artists\' marks. They are kept as they are and must be replaced or licensed before any public release.', C.textDim],
      ...assets.credits().map((c): [string, string] => [`${c.name}: ${c.credit}`, C.text]),
      ['', C.text],
      ['If you need someone to talk to', C.accent, 22],
      ['In India, Tele-MANAS is free and open any time: call 14416 or 1-800-891-4416.', C.warm],
      ['Elsewhere, please reach out to a local helpline or someone you trust.', C.text],
    ];
    let y = 130;
    for (const [text, color, size] of lines) {
      const t = addText(this, W / 2, y, text, { size: size ?? 19, color, align: 'center', wordWrap: { width: 740 }, bold: !!size }).setOrigin(0.5, 0);
      this.body.add(t);
      y += Math.max(size ? 40 : 28, t.height + 8);
    }
    this.maxScroll = Math.max(0, y - 610);
    addText(this, W / 2, 646, `↑↓ Scroll    ${input.label('cancel')} Back`, { size: 15, color: C.textFaint }).setOrigin(0.5);
    input.consume();
  }

  override update(_t: number, dms: number) {
    const d = (input.isDown('down') ? 1 : 0) - (input.isDown('up') ? 1 : 0);
    this.scrollY = Phaser.Math.Clamp(this.scrollY + d * dms * 0.4, 0, this.maxScroll);
    this.body.y = -this.scrollY;
    // Lines outside the panel are hidden rather than masked (cheaper, and no filter pass).
    for (const t of this.body.list as Phaser.GameObjects.Text[]) {
      const y = t.y + this.body.y;
      t.setVisible(y > 118 && y + t.height < 628);
    }
    if (input.pressed('cancel') || input.pressed('confirm') || input.pressed('menu')) {
      input.consume();
      this.data_.onClose?.();
      this.scene.stop();
    }
  }
}
