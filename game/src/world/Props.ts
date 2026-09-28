/** Canvas-painted props, in the same rim-lit painterly treatment as the terrain. */
import Phaser from 'phaser';
import type { Palette } from '../core/Assets';
import { hexRgb, makeCanvas, mixRgb, Noise, rgbCss, scaleRgb } from './Paint';

function add(scene: Phaser.Scene, key: string, c: HTMLCanvasElement) {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, c);
  return key;
}

/** A Red Rosoar tree: dark twisted trunk, crimson canopy, glowing fruit. Checkpoint and save point. */
export function rosoarTree(scene: Phaser.Scene): string {
  const key = 'prop:rosoar_tree';
  if (scene.textures.exists(key)) return key;
  const W = 360, H = 420;
  const { c, g } = makeCanvas(W, H);
  const n = new Noise(42);
  // Trunk.
  g.fillStyle = '#1c1114';
  g.beginPath();
  g.moveTo(160, H);
  g.bezierCurveTo(170, 330, 140, 280, 172, 210);
  g.bezierCurveTo(186, 180, 176, 150, 180, 130);
  g.lineTo(196, 130);
  g.bezierCurveTo(200, 170, 214, 200, 202, 250);
  g.bezierCurveTo(190, 300, 214, 350, 210, H);
  g.fill();
  g.strokeStyle = 'rgba(255,170,140,0.35)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(163, H - 4); g.bezierCurveTo(172, 330, 143, 280, 174, 212); g.stroke();
  // Branches.
  g.strokeStyle = '#1c1114';
  g.lineCap = 'round';
  for (const [x0, y0, x1, y1, w] of [[182, 190, 90, 120, 9], [190, 170, 280, 110, 8], [186, 150, 150, 70, 7], [188, 150, 240, 60, 6]] as const) {
    g.lineWidth = w;
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 - 30, x1, y1); g.stroke();
  }
  // Canopy: dark crimson clusters with warm rim.
  for (let i = 0; i < 26; i++) {
    const a = n.value(i * 1.3, 0.7) * Math.PI * 2;
    const r = 30 + n.value(i, 5.1) * 32;
    const cx = 185 + Math.cos(a) * (60 + n.value(i, 2) * 70), cy = 110 + Math.sin(a) * (45 + n.value(i, 3) * 40);
    const gr = g.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.1, cx, cy, r);
    gr.addColorStop(0, '#7a1f2c');
    gr.addColorStop(0.7, '#3f0e1a');
    gr.addColorStop(1, 'rgba(40,8,16,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  }
  // Snow resting on top.
  g.fillStyle = 'rgba(235,242,255,0.85)';
  for (let i = 0; i < 9; i++) {
    const x = 110 + i * 18 + n.value(i, 9) * 10, y = 52 + Math.abs(i - 4) * 9;
    g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2); g.fill();
  }
  // Glowing fruit.
  for (let i = 0; i < 16; i++) {
    const x = 110 + n.value(i * 2.7, 1.1) * 150, y = 90 + n.value(i * 1.9, 4.2) * 90;
    g.save();
    g.shadowColor = 'rgba(255,60,70,0.9)';
    g.shadowBlur = 14;
    g.fillStyle = '#ff4a55';
    g.beginPath(); g.arc(x, y, 5.5, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = 'rgba(255,220,220,0.8)';
    g.beginPath(); g.arc(x - 1.8, y - 1.8, 1.6, 0, Math.PI * 2); g.fill();
  }
  // Roots in snow.
  g.fillStyle = 'rgba(230,240,255,0.9)';
  g.beginPath(); g.ellipse(185, H - 6, 90, 12, 0, 0, Math.PI * 2); g.fill();
  return add(scene, key, c);
}

export function crystal(scene: Phaser.Scene, color: number): string {
  const key = `prop:crystal:${color.toString(16)}`;
  if (scene.textures.exists(key)) return key;
  const { c, g } = makeCanvas(120, 130);
  const base = hexRgb(color);
  const shards = [[60, 130, 12, 110, 0], [42, 130, 10, 70, -0.35], [78, 130, 11, 82, 0.3], [28, 130, 7, 40, -0.6], [92, 130, 8, 46, 0.55]] as const;
  for (const [x, y, w, h, a] of shards) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    const gr = g.createLinearGradient(-w, 0, w, 0);
    gr.addColorStop(0, rgbCss(mixRgb(base, [255, 255, 255], 0.75)));
    gr.addColorStop(0.5, rgbCss(base));
    gr.addColorStop(1, rgbCss(scaleRgb(base, 0.35)));
    g.fillStyle = gr;
    g.shadowColor = rgbCss(base, 0.9);
    g.shadowBlur = 16;
    g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.8, -h * 0.8); g.lineTo(0, -h); g.lineTo(w * 0.8, -h * 0.75); g.lineTo(w, 0); g.closePath(); g.fill();
    g.restore();
  }
  return add(scene, key, c);
}

export function chest(scene: Phaser.Scene, open: boolean): string {
  const key = open ? 'prop:chest_open' : 'prop:chest';
  if (scene.textures.exists(key)) return key;
  const { c, g } = makeCanvas(96, 80);
  g.fillStyle = '#16202e';
  g.fillRect(8, 36, 80, 42);
  g.strokeStyle = 'rgba(160,210,255,0.8)';
  g.lineWidth = 2;
  g.strokeRect(8, 36, 80, 42);
  g.fillStyle = '#a8d8ff';
  g.fillRect(42, 48, 12, 14);
  if (!open) {
    g.fillStyle = '#1d2a3c';
    g.beginPath(); g.moveTo(4, 38); g.quadraticCurveTo(48, 6, 92, 38); g.closePath(); g.fill();
    g.stroke();
  } else {
    g.save();
    g.shadowColor = 'rgba(180,230,255,1)';
    g.shadowBlur = 20;
    g.fillStyle = 'rgba(200,240,255,0.7)';
    g.fillRect(14, 30, 68, 8);
    g.restore();
  }
  g.fillStyle = 'rgba(240,248,255,0.9)';
  g.beginPath(); g.ellipse(48, 78, 48, 6, 0, 0, Math.PI * 2); g.fill();
  return add(scene, key, c);
}

/** A snowy branch/ice ledge for one-way platforms. */
export function ledge(scene: Phaser.Scene, w: number, pal: Palette): string {
  const key = `prop:ledge:${w}:${pal.dominant}`;
  if (scene.textures.exists(key)) return key;
  const { c, g } = makeCanvas(w + 20, 40);
  const dark = scaleRgb(hexRgb(pal.shadow), 0.55);
  g.fillStyle = rgbCss(dark);
  g.beginPath();
  g.moveTo(4, 12);
  g.quadraticCurveTo((w + 20) / 2, 26, w + 16, 12);
  g.lineTo(w + 12, 22);
  g.quadraticCurveTo((w + 20) / 2, 38, 8, 22);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(238,246,255,0.95)';
  g.beginPath();
  g.moveTo(2, 12);
  g.quadraticCurveTo((w + 20) / 2, 4, w + 18, 12);
  g.quadraticCurveTo((w + 20) / 2, 20, 2, 12);
  g.fill();
  g.fillStyle = 'rgba(200,230,255,0.5)';
  for (let x = 14; x < w; x += 22) { g.beginPath(); g.moveTo(x, 22); g.lineTo(x + 3, 32 + (x % 3) * 3); g.lineTo(x + 6, 22); g.fill(); }
  return add(scene, key, c);
}

export function spikes(scene: Phaser.Scene, w: number): string {
  const key = `prop:spikes:${w}`;
  if (scene.textures.exists(key)) return key;
  const { c, g } = makeCanvas(w, 44);
  for (let x = 0; x < w; x += 14) {
    const h = 26 + ((x * 7) % 16);
    const gr = g.createLinearGradient(x, 44, x + 7, 44 - h);
    gr.addColorStop(0, 'rgba(90,140,190,1)');
    gr.addColorStop(1, 'rgba(235,250,255,1)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x, 44); g.lineTo(x + 7, 44 - h); g.lineTo(x + 14, 44); g.fill();
  }
  return add(scene, key, c);
}
