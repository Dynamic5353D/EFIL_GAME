/** The pixel game's fixed numbers. */
export const VIEW_W = 480;
export const VIEW_H = 270;
export const TILE = 16;
/** Character frames are 16x24: the feet sit on the tile, the head pokes 8 px into the tile above. */
export const CHAR_W = 16;
export const CHAR_H = 24;
/** Milliseconds per tile when walking and running. */
export const WALK_MS = 220;
export const RUN_MS = 120;
/** The bitmap font (tools/pixel/font.py) and its line height. */
export const FONT = 'efil-pixel';
export const LINE_H = 12;

/** UI colours (from the master palette in tools/pixel/px.py). */
export const COL = {
  ink: 0x1a1c2c,
  ink2: 0x2b2d45,
  slate: 0x4a5068,
  stone: 0x7a8094,
  mist: 0xb4bac8,
  paper: 0xf4efe0,
  white: 0xfffdf6,
  pod: 0xf6c63c,
  podHi: 0xfde68a,
  blue: 0x3f6fb0,
  blue1: 0x2c4f86,
  red: 0xc23a3a,
  mint: 0x9fdcc0,
  sky: 0x8cc4e8,
} as const;
