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
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, c);
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
    this.trees(roomW, roomH, noise, 0.72, DEPTH.treesNear, mixRgb(mixRgb(dom, sh, 0.55), hi, 0.12), 0.85, 0.85);
    this.fogBand(roomW, roomH, 0.85, DEPTH.fog, 0.22);
    this.foreground(roomW, roomH, noise, scaleRgb(sh, 0.35));
  }

  private ridge(roomW: number, roomH: number, noise: Noise, col: RGB, sx: number, depth: number, alpha: number) {
    const s = this.scene;
    const size = layerSize(roomW, roomH, sx, sx * 0.6);
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

  private trees(roomW: number, roomH: number, noise: Noise, sx: number, depth: number, col: RGB, scale: number, alpha: number) {
    const s = this.scene;
    const sy = sx * 0.8;
    const size = layerSize(roomW, roomH, sx, sy);
    const { c, g } = makeCanvas(size.w, size.h);
    const style = this.room.scenery.trees;
    const groundY = size.h - VH * 0.12 * scale;
    const spacing = (style === 'arch' ? 150 : 210) * scale / this.room.scenery.density;
    const hiCol = mixRgb(col, [245, 250, 255], style === 'pluffine' ? 0.7 : 0.25);
    for (let x = -60, i = 0; x < size.w + 60; x += spacing * (0.6 + noise.value(i * 1.7, 2.2) * 0.8), i++) {
      const h = (style === 'arch' ? 560 : 380) * scale * (0.7 + noise.value(i * 3.1, 5.5) * 0.6);
      const lean = (noise.value(i * 2.3, 8.1) - 0.5) * 0.25 + (style === 'arch' ? (i % 2 ? 0.28 : -0.28) : 0);
      const trunkW = (style === 'arch' ? 16 : 12) * scale;
      // Trunk as a tapered curve.
      g.fillStyle = rgbCss(scaleRgb(col, 0.7));
      g.beginPath();
      const tx = x + Math.sin(lean) * h;
      g.moveTo(x - trunkW, groundY);
      g.quadraticCurveTo(x + (tx - x) * 0.3, groundY - h * 0.6, tx, groundY - h);
      g.quadraticCurveTo(x + (tx - x) * 0.3 + trunkW * 0.3, groundY - h * 0.6, x + trunkW, groundY);
      g.closePath();
      g.fill();
      if (style === 'pluffine') {
        // Fluffy frosted canopy: clusters of soft circles, lit from above.
        for (let k = 0; k < 9; k++) {
          const a = noise.value(i * 5 + k, 1.3) * Math.PI * 2;
          const rr = (40 + noise.value(k * 2.2, i * 1.1) * 50) * scale;
          const cx = tx + Math.cos(a) * rr * 0.9, cy = groundY - h + Math.sin(a) * rr * 0.5 + rr * 0.2;
          const gr = g.createRadialGradient(cx - rr * 0.3, cy - rr * 0.4, rr * 0.1, cx, cy, rr);
          gr.addColorStop(0, rgbCss(hiCol));
          gr.addColorStop(1, rgbCss(mixRgb(hiCol, col, 0.6)));
          g.fillStyle = gr;
          g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill();
        }
      } else if (style === 'arch') {
        // Branches reaching over the path, with small glowing beads.
        g.strokeStyle = rgbCss(scaleRgb(col, 0.8));
        g.lineCap = 'round';
        for (let k = 0; k < 6; k++) {
          const by = groundY - h * (0.45 + k * 0.09);
          const bx = x + (tx - x) * (0.45 + k * 0.09);
          const len = (90 + noise.value(i + k, 4.4) * 120) * scale;
          const dir = (k + i) % 2 ? 1 : -1;
          g.lineWidth = Math.max(1, (6 - k) * scale);
          g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + dir * len * 0.5, by - len * 0.5, bx + dir * len, by - len * 0.2); g.stroke();
          g.fillStyle = 'rgba(220,245,255,0.8)';
          for (let q = 0; q < 3; q++) {
            const t = 0.4 + q * 0.25;
            g.beginPath(); g.arc(bx + dir * len * t, by - len * 0.35 * t + 8 * scale, 2.2 * scale, 0, Math.PI * 2); g.fill();
          }
        }
      } else {
        g.strokeStyle = rgbCss(scaleRgb(col, 0.7));
        for (let k = 0; k < 5; k++) {
          const by = groundY - h * (0.5 + k * 0.1);
          g.lineWidth = 3 * scale;
          g.beginPath(); g.moveTo(x + (tx - x) * (0.5 + k * 0.1), by); g.lineTo(x + (tx - x) * 0.6 + (k % 2 ? 60 : -60) * scale, by - 50 * scale); g.stroke();
        }
      }
    }
    // Snow bank along the bottom.
    g.fillStyle = rgbCss(mixRgb(col, [240, 248, 255], 0.3));
    g.beginPath();
    g.moveTo(0, size.h);
    for (let x = 0; x <= size.w; x += 10) g.lineTo(x, groundY - noise.fbm(x / 120, depth, 3) * 40 * scale);
    g.lineTo(size.w, size.h);
    g.fill();
    const key = `trees:${this.room.id}:${depth}`;
    addCanvasTexture(s, key, c);
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
    const key = `fg:${this.room.id}`;
    addCanvasTexture(s, key, c);
    this.objects.push(s.add.image(0, roomH - h + 30, key).setOrigin(0).setScrollFactor(sx, 1).setDepth(DEPTH.foreground));
  }
}
