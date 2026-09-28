/**
 * Battle and world sprites painted in code for foes that have no art: the masked soldiers and their
 * Captain from Ragul's anime daydream (Act I, V8). They register as `cut:<slug>` textures so the
 * Puppet deforms them exactly like the cut-outs made from the user's art.
 */
import Phaser from 'phaser';
import { makeCanvas } from './Paint';

type G = CanvasRenderingContext2D;

function limb(g: G, x0: number, y0: number, x1: number, y1: number, w: number) {
  g.lineWidth = w;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
}

/** A stylised soldier: helmet with a glowing visor, armour plates, a rifle held across the body. */
function soldier(captain: boolean): HTMLCanvasElement {
  const W = captain ? 300 : 240, H = captain ? 560 : 500;
  const { c, g } = makeCanvas(W, H);
  const cx = W / 2;
  const body = captain ? '#1a1420' : '#161a22';
  const plate = captain ? '#4a2a3a' : '#2c3444';
  const rim = 'rgba(255,120,160,0.75)';
  g.lineCap = 'round';
  g.strokeStyle = body;
  // Legs.
  limb(g, cx - 18, H * 0.55, cx - 34, H - 16, 30);
  limb(g, cx + 18, H * 0.55, cx + 30, H - 16, 30);
  g.fillStyle = '#0c0c10';
  g.fillRect(cx - 56, H - 26, 44, 20); g.fillRect(cx + 12, H - 26, 44, 20);
  // Torso.
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(cx - 48, H * 0.2); g.lineTo(cx + 48, H * 0.2); g.lineTo(cx + 40, H * 0.58); g.lineTo(cx - 40, H * 0.58); g.closePath(); g.fill();
  g.fillStyle = plate;
  g.beginPath();
  g.moveTo(cx - 40, H * 0.22); g.lineTo(cx + 40, H * 0.22); g.lineTo(cx + 34, H * 0.42); g.lineTo(cx - 34, H * 0.42); g.closePath(); g.fill();
  if (captain) {
    // Long coat tails and epaulettes.
    g.fillStyle = '#2a1a26';
    g.beginPath(); g.moveTo(cx - 44, H * 0.5); g.lineTo(cx - 70, H * 0.85); g.lineTo(cx - 20, H * 0.8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx + 44, H * 0.5); g.lineTo(cx + 70, H * 0.85); g.lineTo(cx + 20, H * 0.8); g.closePath(); g.fill();
    g.fillStyle = '#c8a040';
    g.fillRect(cx - 62, H * 0.2, 26, 8); g.fillRect(cx + 36, H * 0.2, 26, 8);
  }
  // Arms.
  g.strokeStyle = body;
  limb(g, cx - 44, H * 0.24, cx - 30, H * 0.44, 24);
  limb(g, cx + 44, H * 0.24, cx + 40, H * 0.44, 24);
  // Weapon: rifle across the body, or a sabre held low.
  if (captain) {
    g.strokeStyle = '#d8dce8';
    limb(g, cx + 40, H * 0.46, cx + 110, H * 0.12, 6);
    g.strokeStyle = '#c8a040';
    limb(g, cx + 34, H * 0.48, cx + 48, H * 0.42, 10);
  } else {
    g.strokeStyle = '#0a0a0e';
    limb(g, cx - 60, H * 0.5, cx + 70, H * 0.3, 12);
    limb(g, cx + 70, H * 0.3, cx + 100, H * 0.26, 6);
  }
  // Head and helmet.
  g.fillStyle = body;
  g.beginPath(); g.ellipse(cx, H * 0.12, 30, 36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = plate;
  g.beginPath(); g.ellipse(cx, H * 0.1, 34, 30, 0, Math.PI, 0); g.fill();
  if (captain) {
    g.fillStyle = '#2a1a26';
    g.fillRect(cx - 44, H * 0.08, 88, 10);
  }
  // Rim light down the left edge.
  g.strokeStyle = rim;
  g.lineWidth = 3;
  g.beginPath(); g.ellipse(cx, H * 0.1, 34, 30, 0, Math.PI, Math.PI * 1.45); g.stroke();
  g.beginPath(); g.moveTo(cx - 48, H * 0.2); g.lineTo(cx - 40, H * 0.58); g.stroke();
  g.beginPath(); g.moveTo(cx - 20, H * 0.56); g.lineTo(cx - 36, H - 20); g.stroke();
  // Visor.
  g.fillStyle = 'rgba(80,190,255,0.95)';
  g.fillRect(cx - 22, H * 0.12, 44, 7);
  return c;
}

const PAINTERS: Record<string, () => HTMLCanvasElement> = {
  gen_soldier: () => soldier(false),
  gen_captain: () => soldier(true),
};

/** Paints any `gen_*` sprite in the list that isn't a texture yet. */
export function ensureGenSprites(scene: Phaser.Scene, slugs: string[]): void {
  for (const slug of slugs) {
    const paint = PAINTERS[slug];
    const key = `cut:${slug}`;
    if (paint && !scene.textures.exists(key)) scene.textures.addCanvas(key, paint());
  }
}
