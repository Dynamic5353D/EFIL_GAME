/**
 * Paints a room's solid tiles as one organic, painted surface: edges are softened and roughened with
 * noise, tops get a snow cap, faces get strata and rim light from the backdrop's light direction, and
 * colours come from the palette sampled from the room's backdrop art.
 */
import type { Palette } from '../core/Assets';
import { clamp01, hexRgb, luma, makeCanvas, mixRgb, Noise, scaleRgb, type RGB } from './Paint';
import { TILE } from './RoomDef';

const SCALE = 0.5; // paint at half resolution, then upscale (softer, painterly, 4x fewer pixels)
export const CHUNK = 2048;

export interface TerrainChunks { canvases: HTMLCanvasElement[]; width: number; height: number }

export function paintTerrain(grid: string[], pal: Palette, seed: number): TerrainChunks {
  const rows = grid.length, cols = grid[0]!.length;
  const W = Math.ceil(cols * TILE * SCALE), H = Math.ceil(rows * TILE * SCALE);
  const tp = TILE * SCALE;
  const noise = new Noise(seed);

  // 1. Tile mask, box-blurred twice for rounded corners.
  let mask = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = grid[Math.min(rows - 1, Math.floor(y / tp))]!;
    for (let x = 0; x < W; x++) mask[y * W + x] = row[Math.min(cols - 1, Math.floor(x / tp))] === '#' ? 1 : 0;
  }
  const blur = (src: Float32Array, r: number) => {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[y * W + Math.min(W - 1, Math.max(0, x))]!;
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = acc / (2 * r + 1);
        acc += src[y * W + Math.min(W - 1, x + r + 1)]! - src[y * W + Math.max(0, x - r)]!;
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]!;
      for (let y = 0; y < H; y++) {
        out[y * W + x] = acc / (2 * r + 1);
        acc += tmp[Math.min(H - 1, y + r + 1) * W + x]! - tmp[Math.max(0, y - r) * W + x]!;
      }
    }
    return out;
  };
  mask = blur(blur(mask, 4), 3);

  // 2. Field with noisy edges; alpha from the field.
  const field = new Float32Array(W * H);
  const inside = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = noise.fbm(x / 22, y / 22, 3) - 0.5;
      const v = mask[i]! + n * 0.42;
      field[i] = v;
      inside[i] = v > 0.5 ? 1 : 0;
    }
  }

  // 3. Distances: from the top surface (per column) and to the nearest side (per row).
  const depth = new Float32Array(W * H);
  for (let x = 0; x < W; x++) {
    let d = 0;
    for (let y = 0; y < H; y++) {
      const i = y * W + x;
      d = inside[i] ? d + 1 : 0;
      depth[i] = d;
    }
  }
  const below = new Float32Array(W * H);
  for (let x = 0; x < W; x++) {
    let d = 999;
    for (let y = H - 1; y >= 0; y--) {
      const i = y * W + x;
      d = inside[i] ? d + 1 : 0;
      below[i] = y === H - 1 && inside[i] ? 999 : d;
    }
  }
  const left = new Float32Array(W * H), right = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    let d = 999;
    for (let x = 0; x < W; x++) { const i = y * W + x; d = inside[i] ? d + 1 : 0; left[i] = x === 0 && inside[i] ? 999 : d; }
    d = 999;
    for (let x = W - 1; x >= 0; x--) { const i = y * W + x; d = inside[i] ? d + 1 : 0; right[i] = x === W - 1 && inside[i] ? 999 : d; }
  }

  // 4. Colours from the palette.
  const hi = hexRgb(pal.highlight), dom = hexRgb(pal.dominant), sh = hexRgb(pal.shadow), acc = hexRgb(pal.accent);
  const snow: RGB = mixRgb(hi, [240, 248, 255], 0.55);
  const snowShade: RGB = mixRgb(snow, mixRgb(dom, [60, 90, 140], 0.5), 0.45);
  const darkBase: RGB = luma(sh) > 60 ? scaleRgb(sh, 0.45) : sh;
  const rock: RGB = mixRgb(scaleRgb(mixRgb(darkBase, dom, 0.3), 0.9), [26, 34, 52], 0.35);
  const deep: RGB = mixRgb(scaleRgb(darkBase, 0.35), [6, 9, 16], 0.5);
  const rimCol: RGB = mixRgb(acc, [220, 240, 255], 0.5);
  const lightLeft = pal.light.x <= 0; // light comes from the left if the bright area sits left

  const img = new ImageData(W, H);
  const px = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!inside[i]) continue;
      const f = field[i]!;
      const a = clamp01((f - 0.5) * 9);
      const d = depth[i]!;
      const n1 = noise.fbm(x / 9, y / 9, 3);
      const n2 = noise.value(x / 3.5, y / 3.5);
      const capT = 6 + noise.value(x / 14, 7.3) * 7;
      let c: RGB;
      if (d < capT) {
        const t = d / capT;
        c = mixRgb(snow, snowShade, Math.pow(t, 1.5) * 0.9 + (n2 - 0.5) * 0.12);
        if (d < 1.6) c = mixRgb(c, [255, 255, 255], 0.5);
      } else {
        const t = clamp01((d - capT) / 70);
        c = mixRgb(rock, deep, Math.pow(t, 0.7));
        const strata = Math.sin(y * 0.55 + n1 * 9) * 0.5 + 0.5;
        c = scaleRgb(c, 0.86 + strata * 0.1 + (n2 - 0.5) * 0.18);
        if (d < capT + 4) c = scaleRgb(c, 0.7); // shadow under the snow cap
      }
      // Rim light on the side facing the light, faint bounce on the other.
      const side = lightLeft ? left[i]! : right[i]!;
      const other = lightLeft ? right[i]! : left[i]!;
      if (side < 3 && d >= 2) c = mixRgb(c, rimCol, (1 - side / 3) * 0.7);
      else if (other < 2 && d >= 2) c = mixRgb(c, rimCol, 0.15);
      // Undersides go dark.
      const b = below[i]!;
      if (b < 8) c = scaleRgb(c, 0.55 + (b / 8) * 0.45);
      const o = i * 4;
      px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = a * 255;
    }
  }
  const half = makeCanvas(W, H);
  half.g.putImageData(img, 0, 0);

  // 5. Upscale into chunks.
  const fullW = cols * TILE, fullH = rows * TILE;
  const canvases: HTMLCanvasElement[] = [];
  for (let x0 = 0; x0 < fullW; x0 += CHUNK) {
    const w = Math.min(CHUNK, fullW - x0);
    const ch = makeCanvas(w, fullH);
    ch.g.imageSmoothingEnabled = true;
    ch.g.imageSmoothingQuality = 'high';
    ch.g.drawImage(half.c, x0 * SCALE, 0, w * SCALE, H, 0, 0, w, fullH);
    canvases.push(ch.c);
  }
  return { canvases, width: fullW, height: fullH };
}
