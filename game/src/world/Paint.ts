/** Small colour and noise helpers shared by the procedural painters. */

export type RGB = [number, number, number];

export const hexRgb = (h: string | number): RGB => {
  const n = typeof h === 'number' ? h : parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbInt = (c: RGB) => (Math.round(c[0]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[2]);
export const rgbCss = (c: RGB, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const scaleRgb = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
export const luma = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Deterministic 2D value noise + fBm. */
export class Noise {
  private p: Uint8Array;
  constructor(seed = 1) {
    this.p = new Uint8Array(512);
    const perm = Array.from({ length: 256 }, (_, i) => i);
    let s = seed >>> 0 || 1;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j]!, perm[i]!];
    }
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255]!;
  }
  private h(x: number, y: number) {
    return this.p[(this.p[x & 255]! + y) & 511]! / 255;
  }
  value(x: number, y: number): number {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = this.h(xi, yi), b = this.h(xi + 1, yi), c = this.h(xi, yi + 1), d = this.h(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  fbm(x: number, y: number, oct = 4): number {
    let sum = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += this.value(x * f, y * f) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2.03;
    }
    return sum / norm;
  }
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return { c, g: c.getContext('2d')! };
}
