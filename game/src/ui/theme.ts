import Phaser from 'phaser';

export const W = 1280;
export const H = 720;

export const FONT_DISPLAY = '"Cormorant Garamond", Georgia, serif';
export const FONT_BODY = '"Alegreya Sans", "Segoe UI", sans-serif';

/** UI colours: frost blues from the Glacia art, one warm accent (the Rosoar red-gold). */
export const C = {
  ink: 0x070b14,
  panel: 0x0b1220,
  panelEdge: 0x9cc9ff,
  text: '#e8f0ff',
  textDim: '#8fa3bf',
  textFaint: '#5d6f88',
  accent: '#7fd4ff',
  accentInt: 0x7fd4ff,
  warm: '#ffd98a',
  warmInt: 0xffd98a,
  danger: '#ff8080',
  dangerInt: 0xff8080,
  good: '#8dffbd',
  goodInt: 0x8dffbd,
  hp: 0x7fe0a0,
  hpLow: 0xff7070,
};

export type TextOpts = Partial<Phaser.Types.GameObjects.Text.TextStyle> & { size?: number; display?: boolean; bold?: boolean };

export function textStyle(o: TextOpts = {}): Phaser.Types.GameObjects.Text.TextStyle {
  const { size = 22, display = false, bold = false, ...rest } = o;
  return {
    fontFamily: display ? FONT_DISPLAY : FONT_BODY,
    fontSize: `${size}px`,
    fontStyle: bold ? (display ? '600' : '700') : display ? '500' : '400',
    color: C.text,
    resolution: Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
    ...rest,
  };
}

export function addText(scene: Phaser.Scene, x: number, y: number, text: string, o: TextOpts = {}) {
  return scene.add.text(x, y, text, textStyle(o));
}

/** A frosted panel: dark translucent fill, thin light edge, brighter top rim. */
export function drawPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, alpha = 0.86, radius = 10) {
  g.fillStyle(C.panel, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(1, C.panelEdge, 0.28);
  g.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, radius);
  g.lineStyle(1, 0xffffff, 0.16);
  g.beginPath();
  g.moveTo(x + radius, y + 1.5);
  g.lineTo(x + w - radius, y + 1.5);
  g.strokePath();
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, alpha = 0.86) {
  const g = scene.add.graphics();
  drawPanel(g, x, y, w, h, alpha);
  return g;
}

export function bar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, frac: number, color: number, back = 0x1a2438) {
  g.fillStyle(back, 0.9);
  g.fillRoundedRect(x, y, w, h, h / 2);
  const f = Math.max(0, Math.min(1, frac));
  if (f > 0) {
    g.fillStyle(color, 1);
    g.fillRoundedRect(x, y, Math.max(h, w * f), h, h / 2);
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(x + h / 2, y + 1, Math.max(0, w * f - h), Math.max(1, h * 0.25));
  }
}
