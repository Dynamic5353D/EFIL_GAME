/**
 * Parallax layers for a room, back to front: sky gradient, the blurred far copy of the art, the art
 * itself, a painted ridge, two silhouette tree bands, fog, and a dark foreground. Everything except
 * the art is drawn in code in colours sampled from the art, so the play space matches the painting.
 */
import Phaser from 'phaser';
import { assets, texKey } from '../core/Assets';
import type { RoomDef } from './RoomDef';
import { TILE } from './RoomDef';
import { hexRgb, makeCanvas, mixRgb, Noise, rgbCss, scaleRgb, type RGB } from './Paint';

const VW = 1280, VH = 720;

export const DEPTH = {
  sky: -100, far: -95, backdrop: -90, ridge: -80, treesFar: -70, fogFar: -65, treesNear: -60, fog: -55,
  props: -10, terrain: 0, entities: 10, player: 20, fx: 25, foreground: 30, weather: 40,
};

function layerSize(roomW: number, roomH: number, sx: number, sy: number) {
  return { w: VW + Math.max(0, roomW - VW) * sx + 4, h: VH + Math.max(0, roomH - VH) * sy + 4 };
}

function addCanvasTexture(scene: Phaser.Scene, key: string, c: HTMLCanvasElement) {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, c);
}

export class Scenery {
  objects: Phaser.GameObjects.GameObject[] = [];
  fogColor: RGB;
  constructor(private scene: Phaser.Scene, private room: RoomDef) {
    const pal = assets.palette(room.palette);
    this.fogColor = mixRgb(hexRgb(pal.dominant), hexRgb(pal.highlight), 0.35);
  }

  build(): void {
    const s = this.scene, r = this.room;
    const roomW = r.cols * TILE, roomH = r.rows * TILE;
    const pal = assets.palette(r.palette);
    const top = hexRgb(pal.top), dom = hexRgb(pal.dominant), sh = hexRgb(pal.shadow), hi = hexRgb(pal.highlight);

    // Sky gradient (fixed).
    {
      const { c, g } = makeCanvas(8, VH);
      const gr = g.createLinearGradient(0, 0, 0, VH);
      gr.addColorStop(0, rgbCss(scaleRgb(top, 0.6)));
      gr.addColorStop(1, rgbCss(mixRgb(dom, sh, 0.5)));
      g.fillStyle = gr;
      g.fillRect(0, 0, 8, VH);
      addCanvasTexture(s, `sky:${r.id}`, c);
      this.objects.push(s.add.image(0, 0, `sky:${r.id}`).setOrigin(0).setDisplaySize(VW, VH).setScrollFactor(0).setDepth(DEPTH.sky));
    }
    // Far (blurred) and main backdrop art, cover-scaled over their scroll range.
    const place = (key: string, sx: number, sy: number, depth: number, alpha: number) => {
      if (!s.textures.exists(key)) return;
      const need = layerSize(roomW, roomH, sx, sy);
      const img = s.add.image(0, 0, key).setOrigin(0).setScrollFactor(sx, sy).setDepth(depth).setAlpha(alpha);
      const k = Math.max(need.w / img.width, need.h / img.height);
      img.setScale(k);
      img.setPosition(-(img.displayWidth - need.w) / 2, -(img.displayHeight - need.h) * 0.55);
      this.objects.push(img);
    };
    place(texKey.far(r.backdrop), 0.03, 0.02, DEPTH.far, 1);
    place(texKey.bg(r.backdrop), 0.1, 0.06, DEPTH.backdrop, 0.92);

    // Fade the bottom of the art into fog so the painted layers below blend in.
    {
      const { c, g } = makeCanvas(8, 256);
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, rgbCss(this.fogColor, 0));
      gr.addColorStop(1, rgbCss(scaleRgb(this.fogColor, 0.55), 0.85));
      g.fillStyle = gr;
      g.fillRect(0, 0, 8, 256);
      addCanvasTexture(s, `fade:${r.id}`, c);
      this.objects.push(s.add.image(0, VH * 0.45, `fade:${r.id}`).setOrigin(0).setDisplaySize(VW, VH * 0.55).setScrollFactor(0).setDepth(DEPTH.backdrop + 1));
    }

    const noise = new Noise(r.id.length * 7919 + roomW);
    if (r.scenery.ridge) this.ridge(roomW, roomH, noise, mixRgb(this.fogColor, sh, 0.35), 0.28, DEPTH.ridge, 0.85);
    this.trees(roomW, roomH, noise, 0.45, DEPTH.treesFar, mixRgb(this.fogColor, dom, 0.25), 0.55, 0.6);
    this.fogBand(roomW, roomH, 0.5, DEPTH.fogFar, 0.35);
    this.trees(roomW, roomH, noise, 0.72, DEPTH.treesNear, mixRgb(mixRgb(dom, sh, 0.45), hi, 0.2), 0.85, 0.85);
    this.fogBand(roomW, roomH, 0.85, DEPTH.fog, 0.22);
    this.foreground(roomW, roomH, noise, scaleRgb(sh, 0.35));
  }

  private ridge(roomW: number, roomH: number, noise: Noise, col: RGB, sx: number, depth: number, alpha: number) {
    const s = this.scene;
    const size = layerSize(roomW, roomH, sx, sx * 0.6);
    const key = `ridge:${this.room.id}`;
    if (s.textures.exists(key)) {
      this.objects.push(s.add.image(0, 0, key).setOrigin(0).setScrollFactor(sx, sx * 0.6).setDepth(depth).setAlpha(alpha));
      return;
    }
    const { c, g } = makeCanvas(size.w, size.h);
    const base = size.h * 0.62;
    g.beginPath();
    g.moveTo(0, size.h);
    for (let x = 0; x <= size.w; x += 8) {
      const y = base - noise.fbm(x / 260, 3.1, 4) * size.h * 0.34 - Math.pow(noise.value(x / 90, 9.7), 3) * 40;
      g.lineTo(x, y);
    }
    g.lineTo(size.w, size.h);
    g.closePath();
    const gr = g.createLinearGradient(0, base - size.h * 0.35, 0, size.h);
    gr.addColorStop(0, rgbCss(mixRgb(col, [240, 248, 255], 0.35)));
    gr.addColorStop(0.4, rgbCss(col));
    gr.addColorStop(1, rgbCss(scaleRgb(col, 0.6)));
    g.fillStyle = gr;
    g.fill();
    addCanvasTexture(s, `ridge:${this.room.id}`, c);
    this.objects.push(s.add.image(0, 0, `ridge:${this.room.id}`).setOrigin(0).setScrollFactor(sx, sx * 0.6).setDepth(depth).setAlpha(alpha));
  }

  /** A soft round puff tinted `col`, stamped many times to build frost and foliage. */
  private puff(col: RGB, soft: number): HTMLCanvasElement {
    const { c, g } = makeCanvas(64, 64);
    const gr = g.createRadialGradient(28, 26, 2, 32, 32, 32);
    gr.addColorStop(0, rgbCss(mixRgb(col, [255, 255, 255], 0.35)));
    gr.addColorStop(soft, rgbCss(col, 0.85));
    gr.addColorStop(1, rgbCss(col, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  }

  private trees(roomW: number, roomH: number, noise: Noise, sx: number, depth: number, col: RGB, scale: number, alpha: number) {
    const s = this.scene;
    const key = `trees:${this.room.id}:${depth}`;
    const sy = sx * 0.8;
    if (!s.textures.exists(key)) {
      const size = layerSize(roomW, roomH, sx, sy);
      const { c, g } = makeCanvas(size.w, size.h);
      const style = this.room.scenery.trees;
      const groundY = size.h - VH * 0.12 * scale;
      const spacing = (style === 'arch' ? 150 : 230) * scale / this.room.scenery.density;
      const bark = scaleRgb(col, style === 'pluffine' ? 0.45 : 0.7);
      const frost = mixRgb(col, [245, 250, 255], style === 'pluffine' ? 0.72 : 0.3);
      const frostShade = mixRgb(frost, col, 0.45);
      const puffLit = this.puff(frost, 0.45), puffShade = this.puff(frostShade, 0.5);
      const bead = this.puff([220, 245, 255], 0.2);
      let rnd = 0;
      const r01 = () => noise.value(rnd++ * 0.731, depth * 0.37 + 9.1);
      g.lineCap = 'round';
      // Recursive branch: tapered stroke, children spread upward, frost puffs along the outer limbs.
      const branch = (x: number, y: number, ang: number, len: number, w: number, level: number, maxLevel: number) => {
        const bend = (r01() - 0.5) * 0.5;
        const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
        const cx = x + Math.cos(ang + bend) * len * 0.5, cy = y + Math.sin(ang + bend) * len * 0.5;
        g.strokeStyle = rgbCss(bark);
        g.lineWidth = Math.max(0.8, w);
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
        if (style === 'pluffine' && level >= maxLevel - 2) {
          const n = Math.ceil(len / (5 * scale));
          for (let i = 0; i < n; i++) {
            const t = i / n;
            const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * x1;
            const py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * y1;
            const r = (5 + r01() * 11) * scale * (level === maxLevel ? 1.1 : 0.85);
            g.globalAlpha = 0.55 + r01() * 0.45;
            g.drawImage(r01() > 0.35 ? puffLit : puffShade, px - r + (r01() - 0.5) * 10 * scale, py - r - r01() * 8 * scale, r * 2, r * 2);
          }
          g.globalAlpha = 1;
        }
        if (style === 'arch' && level === maxLevel && r01() < 0.45) {
          // The Winter Path's small glowing beads hang from the outermost twigs.
          const t = 0.4 + r01() * 0.6, rr = (1.5 + r01() * 2) * scale;
          g.drawImage(bead, x + (x1 - x) * t - rr * 1.5, y + (y1 - y) * t - rr * 1.5 + 5 * scale, rr * 3, rr * 3);
        }
        if (level >= maxLevel) return;
        const kids = level === 0 ? 3 : r01() > 0.55 ? 3 : 2;
        for (let k = 0; k < kids; k++) {
          const spread = (k - (kids - 1) / 2) * (style === 'arch' ? 0.7 : 0.5) + (r01() - 0.5) * 0.6;
          const up = style === 'arch' ? 0 : (-Math.PI / 2 - ang) * 0.25;
          branch(x1, y1, ang + spread + up, len * (0.58 + r01() * 0.25), w * 0.62, level + 1, maxLevel);
        }
      };
      const maxLevel = style === 'arch' ? (scale > 0.7 ? 4 : 3) : scale > 0.7 ? 5 : 4;
      for (let x = -60, i = 0; x < size.w + 60; x += spacing * (0.6 + noise.value(i * 1.7, 2.2) * 0.8), i++) {
        const h = (style === 'arch' ? 560 : 420) * scale * (0.7 + noise.value(i * 3.1, 5.5) * 0.6);
        const lean = (noise.value(i * 2.3, 8.1) - 0.5) * 0.18 + (style === 'arch' ? (i % 2 ? 0.3 : -0.3) : 0);
        const trunkW = (style === 'arch' ? 14 : 11) * scale * (0.8 + noise.value(i, 3.3) * 0.5);
        const trunkLen = h * (style === 'pluffine' ? 0.45 : 0.4);
        const tx = x + Math.sin(lean) * trunkLen, ty = groundY - trunkLen;
        g.fillStyle = rgbCss(bark);
        g.beginPath();
        g.moveTo(x - trunkW, groundY);
        g.quadraticCurveTo(x + (tx - x) * 0.4 - trunkW * 0.6, groundY - trunkLen * 0.5, tx - trunkW * 0.45, ty);
        g.lineTo(tx + trunkW * 0.45, ty);
        g.quadraticCurveTo(x + (tx - x) * 0.4 + trunkW * 0.6, groundY - trunkLen * 0.5, x + trunkW, groundY);
        g.closePath();
        g.fill();
        // Snow caught on the lit side of the trunk.
        g.strokeStyle = rgbCss(frost, 0.6);
        g.lineWidth = Math.max(1, trunkW * 0.25);
        g.beginPath(); g.moveTo(x - trunkW * 0.8, groundY); g.quadraticCurveTo(x + (tx - x) * 0.4 - trunkW * 0.5, groundY - trunkLen * 0.5, tx - trunkW * 0.4, ty); g.stroke();
        branch(tx, ty, -Math.PI / 2 + lean * 1.5, h * 0.3, trunkW * 0.8, 0, maxLevel);
      }
      // Snow bank along the bottom.
      g.fillStyle = rgbCss(mixRgb(col, [240, 248, 255], 0.3));
      g.beginPath();
      g.moveTo(0, size.h);
      for (let x = 0; x <= size.w; x += 10) g.lineTo(x, groundY - noise.fbm(x / 120, depth, 3) * 40 * scale);
      g.lineTo(size.w, size.h);
      g.fill();
      s.textures.addCanvas(key, c);
    }
    this.objects.push(s.add.image(0, 0, key).setOrigin(0).setScrollFactor(sx, sy).setDepth(depth).setAlpha(alpha));
  }

  private fogBand(roomW: number, roomH: number, sx: number, depth: number, alpha: number) {
    const s = this.scene;
    const key = `fogband:${this.room.id}`;
    if (!s.textures.exists(key)) {
      const { c, g } = makeCanvas(8, 256);
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, rgbCss(this.fogColor, 0));
      gr.addColorStop(0.6, rgbCss(this.fogColor, 0.8));
      gr.addColorStop(1, rgbCss(this.fogColor, 0.3));
      g.fillStyle = gr;
      g.fillRect(0, 0, 8, 256);
      addCanvasTexture(s, key, c);
    }
    const size = layerSize(roomW, roomH, sx, sx * 0.8);
    this.objects.push(s.add.image(0, size.h - VH * 0.55, key).setOrigin(0).setDisplaySize(size.w, VH * 0.55).setScrollFactor(sx, sx * 0.8).setDepth(depth).setAlpha(alpha));
  }

  private foreground(roomW: number, roomH: number, noise: Noise, col: RGB) {
    const s = this.scene;
    const sx = 1.3;
    const w = VW + Math.max(0, roomW - VW) * sx + 200;
    const h = 220;
    const key = `fg:${this.room.id}`;
    if (s.textures.exists(key)) {
      this.objects.push(s.add.image(0, roomH - h + 30, key).setOrigin(0).setScrollFactor(sx, 1).setDepth(DEPTH.foreground));
      return;
    }
    const { c, g } = makeCanvas(w, h);
    g.fillStyle = rgbCss(col, 0.96);
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const bump = Math.pow(noise.fbm(x / 380, 11.5, 3), 2.2) * 190;
      g.lineTo(x, h - 10 - bump);
    }
    g.lineTo(w, h);
    g.fill();
    // Occasional dark frosted twigs.
    g.strokeStyle = rgbCss(col, 0.95);
    g.lineCap = 'round';
    for (let x = 200; x < w; x += 700 + noise.value(x, 3) * 900) {
      const base = h - 20;
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + 30, base - 90, x + 10, base - 170); g.stroke();
      g.lineWidth = 2.5;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + 15, base - 50 - k * 28); g.lineTo(x + 15 + (k % 2 ? 40 : -35), base - 80 - k * 28); g.stroke(); }
    }
    addCanvasTexture(s, key, c);
    this.objects.push(s.add.image(0, roomH - h + 30, key).setOrigin(0).setScrollFactor(sx, 1).setDepth(DEPTH.foreground));
  }
}
