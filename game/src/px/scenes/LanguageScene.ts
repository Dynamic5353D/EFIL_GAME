import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { settings } from '../../core/Settings';
import { COL, VIEW_H, VIEW_W } from '../config';
import { ListNav } from '../ui/list';
import { txt, win } from '../ui/widgets';

/**
 * First launch: two questions, each asked in both languages. Dialogue (spoken lines) and descriptions
 * (narration, items, quests, menus) can be set apart, e.g. Tanglish dialogue with English descriptions.
 */
const QUESTIONS = [
  {
    key: 'dialogueLang' as const,
    en: 'What language should people speak in?',
    ta: 'Characters endha mozhi-la pesanum?',
    note: 'Spoken lines. Press L during a conversation to switch.',
  },
  {
    key: 'descLang' as const,
    en: 'And for descriptions and menus?',
    ta: 'Vivarangal, menu ellam endha mozhi-la?',
    note: 'Narration, items, quests and menus.',
  },
];
const OPTIONS = [
  { value: 'en' as const, label: 'English' },
  { value: 'ta' as const, label: 'Tanglish (Tamil in English letters)' },
];

export class LanguageScene extends Phaser.Scene {
  private q = 0;
  private nav = new ListNav(2);
  private layer?: Phaser.GameObjects.Container;

  constructor() {
    super('Language');
  }

  create(): void {
    this.q = 0;
    this.nav = new ListNav(2);
    this.cameras.main.setBackgroundColor(COL.ink);
    this.draw();
  }

  private draw(): void {
    this.layer?.destroy();
    const c = this.add.container(0, 0);
    this.layer = c;
    const Q = QUESTIONS[this.q]!;
    const w = 340, h = 124, x = (VIEW_W - w) / 2, y = (VIEW_H - h) / 2;
    c.add(win(this, x, y, w, h));
    c.add(txt(this, x + 16, y + 12, `${this.q + 1}/2`, COL.stone));
    c.add(txt(this, x + 16, y + 26, Q.en, COL.ink));
    c.add(txt(this, x + 16, y + 40, Q.ta, COL.blue1));
    OPTIONS.forEach((o, i) => {
      const iy = y + 62 + i * 18;
      if (this.nav.i === i) c.add(this.add.image(x + 22, iy + 5, 'ui', 'cursor'));
      c.add(txt(this, x + 34, iy + 1, o.label, this.nav.i === i ? COL.ink : COL.slate));
      c.add(this.nav.hit(this, i, x + 12, iy - 2, w - 24, 18));
    });
    c.add(txt(this, x + 16, y + h - 16, Q.note, COL.stone, null));
  }

  override update(): void {
    const before = this.nav.i;
    const r = this.nav.update();
    if (r === 'confirm') {
      settings.set(QUESTIONS[this.q]!.key, OPTIONS[this.nav.i]!.value);
      audio.sfx('ui_ok');
      if (this.q === 0) {
        this.q = 1;
        // Suggest the same answer for the second question.
        this.draw();
        return;
      }
      settings.set('langChosen', true);
      this.scene.start('Title');
      return;
    }
    if (r === 'cancel' && this.q === 1) { this.q = 0; this.draw(); return; }
    if (before !== this.nav.i) this.draw();
  }
}
