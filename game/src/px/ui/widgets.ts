import Phaser from 'phaser';
import { glyphWidths } from '../assets';
import { COL, FONT, LINE_H } from '../config';

export type Skin = 'win_paper' | 'win_ink' | 'win_name';

/** A 9-slice window from the UI atlas. (x, y) is the top-left corner. */
export function win(scene: Phaser.Scene, x: number, y: number, w: number, h: number, skin: Skin = 'win_paper'): Phaser.GameObjects.NineSlice {
  const n = scene.add.nineslice(x, y, 'ui', skin, w, h, 8, 8, 8, 8);
  n.setOrigin(0, 0);
  return n;
}

/** Glyphs the font doesn't have, mapped to ones it does. */
export function normalize(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/₹/g, 'Rs')
    .replace(/×/g, 'x');
}

/** Bitmap text with a soft 1 px shadow. Dark text by default (for paper windows). */
export function txt(scene: Phaser.Scene, x: number, y: number, s: string, color: number = COL.ink, shadow: number | null = COL.mist): Phaser.GameObjects.BitmapText {
  const t = scene.add.bitmapText(x, y, FONT, normalize(s));
  t.setTint(color);
  if (shadow !== null) t.setDropShadow(1, 1, shadow, 1);
  return t;
}

/** Word-wraps to a pixel width using the font's advances. Keeps explicit newlines. */
export function wrap(scene: Phaser.Scene, s: string, maxW: number): string[] {
  const adv = glyphWidths(scene);
  const width = (w: string) => [...w].reduce((a, c) => a + adv(c), 0);
  const out: string[] = [];
  for (const para of normalize(s).split('\n')) {
    let line = '';
    for (const word of para.split(/ +/)) {
      const next = line ? `${line} ${word}` : word;
      if (width(next) <= maxW || !line) line = next;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

export function textWidth(scene: Phaser.Scene, s: string): number {
  const adv = glyphWidths(scene);
  return [...normalize(s)].reduce((a, c) => a + adv(c), 0);
}

/** Splits wrapped lines into pages of `n` lines. */
export function pages(lines: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i += n) out.push(lines.slice(i, i + n).join('\n'));
  return out.length ? out : [''];
}

export { LINE_H };
