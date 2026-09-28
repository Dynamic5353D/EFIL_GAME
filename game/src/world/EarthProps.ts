/**
 * Earth props, painted in code: bins, market stalls, an auto-rickshaw, the hangar's old planes, the
 * Rajam Hall statue, lamps, furniture. Each is a dark silhouette with a warm rim on its upper-left
 * edges and a few lit details, in the same treatment as the Glacia props, and is lit by the room lights.
 */
import Phaser from 'phaser';
import type { PropVisual } from './RoomDef';
import { makeCanvas } from './Paint';

type G = CanvasRenderingContext2D;

interface PropSpec {
  w: number;
  h: number;
  draw(g: G, w: number, h: number): void;
}

const RIM = 'rgba(255,226,180,0.55)';

function rr(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Fills a box with a vertical gradient and strokes a rim along its top and left edges. */
function box(g: G, x: number, y: number, w: number, h: number, top: string, bottom: string, r = 3, rim = RIM) {
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  g.fillStyle = gr;
  rr(g, x, y, w, h, r);
  g.fill();
  g.strokeStyle = rim;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + 1, y + h - r);
  g.lineTo(x + 1, y + r);
  g.quadraticCurveTo(x + 1, y + 1, x + r, y + 1);
  g.lineTo(x + w - r, y + 1);
  g.stroke();
}

function wheel(g: G, x: number, y: number, r: number) {
  g.fillStyle = '#0c0d10';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a3c42';
  g.beginPath(); g.arc(x, y, r * 0.45, 0, Math.PI * 2); g.fill();
  g.strokeStyle = RIM;
  g.lineWidth = 1.5;
  g.beginPath(); g.arc(x, y, r - 1, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
}

function glowDot(g: G, x: number, y: number, r: number, color: string) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}

export function drawPlaneShape(g: G, x: number, base: number, s: number, body: string, rim?: string) {
  g.fillStyle = body;
  g.beginPath();
  // Fuselage, nose to the left.
  g.moveTo(x, base - 40 * s);
  g.quadraticCurveTo(x + 10 * s, base - 62 * s, x + 60 * s, base - 64 * s);
  g.lineTo(x + 250 * s, base - 70 * s);
  g.lineTo(x + 300 * s, base - 130 * s);
  g.lineTo(x + 322 * s, base - 130 * s);
  g.lineTo(x + 318 * s, base - 64 * s);
  g.lineTo(x + 330 * s, base - 52 * s);
  g.lineTo(x + 60 * s, base - 36 * s);
  g.quadraticCurveTo(x + 14 * s, base - 30 * s, x, base - 40 * s);
  g.fill();
  // Wing.
  g.beginPath();
  g.moveTo(x + 120 * s, base - 50 * s);
  g.lineTo(x + 210 * s, base - 50 * s);
  g.lineTo(x + 150 * s, base - 16 * s);
  g.lineTo(x + 110 * s, base - 16 * s);
  g.fill();
  // Canopy.
  g.fillStyle = 'rgba(120,150,170,0.55)';
  g.beginPath(); g.ellipse(x + 70 * s, base - 66 * s, 26 * s, 9 * s, -0.05, Math.PI, 0); g.fill();
  // Landing gear.
  g.strokeStyle = body;
  g.lineWidth = 4 * s;
  for (const gx of [70, 200]) { g.beginPath(); g.moveTo(x + gx * s, base - 40 * s); g.lineTo(x + gx * s, base - 12 * s); g.stroke(); }
  wheel(g, x + 70 * s, base - 9 * s, 9 * s);
  wheel(g, x + 200 * s, base - 9 * s, 9 * s);
  if (rim) {
    g.strokeStyle = rim;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 2, base - 42 * s);
    g.quadraticCurveTo(x + 10 * s, base - 62 * s, x + 60 * s, base - 64 * s);
    g.lineTo(x + 250 * s, base - 70 * s);
    g.lineTo(x + 300 * s, base - 130 * s);
    g.stroke();
  }
}

const SPECS: Record<PropVisual, PropSpec> = {
  bin: { w: 70, h: 96, draw(g, w, h) {
    box(g, 6, 16, w - 12, h - 16, '#2f5a3a', '#12241a', 4);
    box(g, 2, 8, w - 4, 14, '#3b6c47', '#1b3324', 3);
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 2;
    for (let x = 18; x < w - 12; x += 12) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, h - 8); g.stroke(); }
  } },
  stall: { w: 230, h: 200, draw(g, w, h) {
    // Awning in stripes, a counter, crates of fruit and a hanging bulb.
    g.fillStyle = '#1a1512';
    g.fillRect(14, 40, 8, h - 40); g.fillRect(w - 22, 40, 8, h - 40);
    const stripes = ['#b8402c', '#e8d2a0'];
    for (let i = 0; i < 9; i++) {
      g.fillStyle = stripes[i % 2]!;
      g.beginPath();
      g.moveTo(4 + i * (w - 8) / 9, 26); g.lineTo(4 + (i + 1) * (w - 8) / 9, 26);
      g.lineTo(4 + (i + 1) * (w - 8) / 9, 58); g.quadraticCurveTo(4 + (i + 0.5) * (w - 8) / 9, 66, 4 + i * (w - 8) / 9, 58);
      g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.fillRect(4, 26, w - 8, 8);
    box(g, 8, h - 78, w - 16, 78, '#5a3e2a', '#24180f', 2);
    const fruit = ['#e8a030', '#c83a28', '#7ab040', '#f0d040'];
    for (let i = 0; i < 16; i++) {
      g.fillStyle = fruit[i % 4]!;
      g.beginPath(); g.arc(24 + (i % 8) * 25, h - 86 + Math.floor(i / 8) * 10, 8, 0, Math.PI * 2); g.fill();
    }
    glowDot(g, w / 2, 76, 34, 'rgba(255,214,140,0.8)');
    g.fillStyle = '#fff2c0';
    g.beginPath(); g.arc(w / 2, 76, 5, 0, Math.PI * 2); g.fill();
  } },
  auto: { w: 210, h: 150, draw(g, w, h) {
    // A Chennai auto-rickshaw: black canopy, yellow body.
    g.fillStyle = '#16140f';
    g.beginPath();
    g.moveTo(30, 60); g.quadraticCurveTo(40, 10, 110, 12); g.lineTo(190, 16); g.lineTo(196, 70); g.lineTo(30, 70); g.fill();
    const gr = g.createLinearGradient(0, 60, 0, h - 20);
    gr.addColorStop(0, '#e8c040'); gr.addColorStop(1, '#8a6a14');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(10, h - 30); g.lineTo(18, 80); g.quadraticCurveTo(30, 60, 60, 62); g.lineTo(200, 66); g.lineTo(204, h - 30); g.closePath(); g.fill();
    g.fillStyle = '#2a4a30';
    g.fillRect(60, 80, 70, 40);
    g.strokeStyle = RIM; g.lineWidth = 2;
    g.beginPath(); g.moveTo(32, 58); g.quadraticCurveTo(40, 12, 110, 14); g.lineTo(188, 18); g.stroke();
    glowDot(g, 14, 96, 16, 'rgba(255,240,190,0.9)');
    wheel(g, 36, h - 20, 18); wheel(g, 176, h - 20, 18);
  } },
  plane: { w: 360, h: 150, draw(g, _w, h) {
    drawPlaneShape(g, 10, h, 1, '#3a4148', RIM);
    g.fillStyle = 'rgba(160,60,40,0.35)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(90 + i * 28, h - 56 + (i % 2) * 6, 6 + (i % 3) * 3, 0, Math.PI * 2); g.fill(); }
  } },
  statue: { w: 120, h: 300, draw(g, w, h) {
    box(g, 10, h - 90, w - 20, 90, '#8a8274', '#403c34', 2);
    box(g, 20, h - 104, w - 40, 16, '#9a927f', '#5a5446', 2);
    // A standing figure in bronze.
    g.fillStyle = '#3a2c1c';
    g.beginPath(); g.arc(w / 2, 40, 16, 0, Math.PI * 2); g.fill();
    g.beginPath();
    g.moveTo(w / 2 - 26, h - 104); g.lineTo(w / 2 - 22, 70); g.quadraticCurveTo(w / 2, 56, w / 2 + 22, 70);
    g.lineTo(w / 2 + 26, h - 104); g.fill();
    g.strokeStyle = 'rgba(255,200,130,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.arc(w / 2, 40, 15, Math.PI, Math.PI * 1.6); g.stroke();
    g.beginPath(); g.moveTo(w / 2 - 25, h - 108); g.lineTo(w / 2 - 21, 72); g.stroke();
  } },
  lamp: { w: 60, h: 300, draw(g, w, h) {
    g.fillStyle = '#1a1c20';
    g.fillRect(w / 2 - 4, 30, 8, h - 30);
    g.fillRect(w / 2 - 10, h - 16, 20, 16);
    g.fillRect(w / 2 - 24, 24, 48, 10);
    glowDot(g, w / 2, 40, 28, 'rgba(255,230,170,0.9)');
    g.fillStyle = '#fff6d8';
    g.fillRect(w / 2 - 16, 33, 32, 5);
  } },
  bench: { w: 150, h: 70, draw(g, w, h) {
    box(g, 4, 10, w - 8, 12, '#5a4632', '#2a2016', 2);
    box(g, 4, 30, w - 8, 10, '#5a4632', '#2a2016', 2);
    g.fillStyle = '#1a1612';
    g.fillRect(14, 40, 8, h - 40); g.fillRect(w - 22, 40, 8, h - 40); g.fillRect(14, 10, 6, 30); g.fillRect(w - 20, 10, 6, 30);
  } },
  chair: { w: 70, h: 110, draw(g, w, h) {
    box(g, 8, 4, w - 20, 54, '#4a3a2c', '#241a12', 3);
    box(g, 4, 56, w - 8, 12, '#5a4632', '#2a2016', 2);
    g.fillStyle = '#1a1612';
    g.fillRect(8, 68, 6, h - 68); g.fillRect(w - 14, 68, 6, h - 68);
  } },
  shed: { w: 300, h: 220, draw(g, w, h) {
    g.fillStyle = '#2a2622';
    g.beginPath(); g.moveTo(0, 60); g.lineTo(w / 2, 10); g.lineTo(w, 60); g.lineTo(w - 10, 70); g.lineTo(10, 70); g.fill();
    box(g, 16, 64, w - 32, h - 64, '#3c3a36', '#1a1916', 1);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3;
    for (let x = 36; x < w - 20; x += 24) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, h); g.stroke(); }
    box(g, w / 2 - 36, h - 120, 72, 120, '#24201c', '#0e0c0a', 2);
    g.strokeStyle = RIM; g.lineWidth = 2;
    g.beginPath(); g.moveTo(2, 60); g.lineTo(w / 2, 11); g.stroke();
  } },
  banner: { w: 260, h: 220, draw(g, w, h) {
    g.fillStyle = '#1c1c1e';
    g.fillRect(10, 20, 8, h - 20); g.fillRect(w - 18, 20, 8, h - 20);
    box(g, 4, 20, w - 8, 110, '#d8c8a0', '#9a8a68', 2);
    g.fillStyle = '#7a2a20';
    g.fillRect(20, 40, w - 40, 16);
    g.fillStyle = 'rgba(40,40,60,0.7)';
    for (let i = 0; i < 4; i++) g.fillRect(24, 68 + i * 13, (w - 60) * (0.5 + ((i * 37) % 10) / 20), 6);
  } },
  jeep: { w: 250, h: 150, draw(g, w, h) {
    // The rusty vehicle behind Hangar 1.
    box(g, 10, 50, w - 20, 70, '#5a3a24', '#26180e', 4);
    g.fillStyle = '#4a3020';
    g.beginPath(); g.moveTo(60, 50); g.lineTo(80, 14); g.lineTo(150, 14); g.lineTo(170, 50); g.fill();
    g.fillStyle = 'rgba(110,140,150,0.4)';
    g.beginPath(); g.moveTo(88, 46); g.lineTo(100, 22); g.lineTo(144, 22); g.lineTo(156, 46); g.fill();
    g.fillStyle = 'rgba(160,80,30,0.5)';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(30 + i * 23, 70 + (i % 3) * 12, 5 + (i % 2) * 4, 0, Math.PI * 2); g.fill(); }
    wheel(g, 56, h - 22, 22); wheel(g, w - 56, h - 22, 22);
  } },
  crate: { w: 80, h: 80, draw(g, w, h) {
    box(g, 2, 2, w - 4, h - 4, '#7a5a38', '#3a2a18', 2);
    g.strokeStyle = 'rgba(30,20,10,0.6)'; g.lineWidth = 4;
    g.strokeRect(8, 8, w - 16, h - 16);
    g.beginPath(); g.moveTo(10, 10); g.lineTo(w - 10, h - 10); g.stroke();
  } },
  door: { w: 110, h: 200, draw(g, w, h) {
    box(g, 0, 0, w, h, '#2c2420', '#141010', 2);
    box(g, 10, 10, w - 20, h - 10, '#5a3e2c', '#2a1c12', 2);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
    g.strokeRect(20, 22, w - 40, 70); g.strokeRect(20, 106, w - 40, h - 120);
    g.fillStyle = '#d8b060';
    g.beginPath(); g.arc(w - 24, h / 2 + 10, 4, 0, Math.PI * 2); g.fill();
  } },
  car: { w: 260, h: 120, draw(g, w, h) {
    g.fillStyle = '#2a2e38';
    g.beginPath();
    g.moveTo(8, h - 26); g.lineTo(12, 58); g.quadraticCurveTo(40, 50, 70, 46); g.lineTo(96, 16); g.lineTo(186, 16); g.lineTo(214, 48);
    g.quadraticCurveTo(246, 52, 252, 64); g.lineTo(252, h - 26); g.closePath(); g.fill();
    g.fillStyle = 'rgba(120,150,180,0.45)';
    g.beginPath(); g.moveTo(102, 22); g.lineTo(140, 22); g.lineTo(140, 46); g.lineTo(80, 46); g.fill();
    g.beginPath(); g.moveTo(148, 22); g.lineTo(182, 22); g.lineTo(204, 46); g.lineTo(148, 46); g.fill();
    g.strokeStyle = RIM; g.lineWidth = 2;
    g.beginPath(); g.moveTo(14, 58); g.quadraticCurveTo(40, 50, 70, 46); g.lineTo(96, 16); g.lineTo(186, 16); g.stroke();
    glowDot(g, 252, 70, 14, 'rgba(255,240,200,0.9)');
    wheel(g, 60, h - 22, 20); wheel(g, 200, h - 22, 20);
  } },
  bed: { w: 230, h: 100, draw(g, w, h) {
    box(g, 0, 20, 16, h - 20, '#4a3624', '#241a10', 2);
    box(g, 10, 50, w - 10, 30, '#3a3440', '#1c1820', 3);
    box(g, 20, 36, 60, 20, '#d8d4e0', '#9a96a8', 8);
    box(g, 80, 42, w - 90, 16, '#4a5a8a', '#2a3450', 6);
    g.fillStyle = '#1a1410';
    g.fillRect(14, 80, 8, h - 80); g.fillRect(w - 14, 80, 8, h - 80);
  } },
  desk: { w: 190, h: 140, draw(g, w, h) {
    box(g, 0, 60, w, 12, '#6a4a30', '#3a2818', 2);
    g.fillStyle = '#241a12';
    g.fillRect(8, 72, 10, h - 72); g.fillRect(w - 18, 72, 10, h - 72);
    box(g, w - 70, 72, 52, 40, '#4a3424', '#241810', 2);
    // A laptop with its screen glowing.
    g.fillStyle = '#1a1c22';
    g.beginPath(); g.moveTo(40, 58); g.lineTo(110, 58); g.lineTo(116, 62); g.lineTo(34, 62); g.fill();
    g.fillStyle = '#20242c';
    g.beginPath(); g.moveTo(46, 58); g.lineTo(54, 14); g.lineTo(118, 14); g.lineTo(110, 58); g.fill();
    g.fillStyle = 'rgba(150,200,255,0.85)';
    g.beginPath(); g.moveTo(52, 54); g.lineTo(58, 19); g.lineTo(113, 19); g.lineTo(106, 54); g.fill();
    glowDot(g, 84, 36, 50, 'rgba(140,190,255,0.35)');
  } },
  shelf: { w: 120, h: 200, draw(g, w, h) {
    box(g, 0, 0, w, h, '#4a3624', '#1e160e', 2);
    const cols = ['#a83a30', '#3a6aa8', '#d8b040', '#5a8a4a', '#8a5ab0', '#d8d0c0'];
    for (let row = 0; row < 4; row++) {
      g.fillStyle = '#1a120c';
      g.fillRect(6, 10 + row * 46, w - 12, 40);
      for (let i = 0; i < 7; i++) {
        g.fillStyle = cols[(row * 3 + i) % cols.length]!;
        const bw = 9 + ((row + i) % 3) * 3;
        g.fillRect(10 + i * 14, 18 + row * 46 + ((i * 5) % 7), bw, 32 - ((i * 5) % 7));
      }
    }
  } },
  bike: { w: 170, h: 100, draw(g, w, h) {
    wheel(g, 32, h - 26, 26); wheel(g, w - 32, h - 26, 26);
    g.strokeStyle = '#2a2c34'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(32, h - 26); g.lineTo(70, 40); g.lineTo(120, 40); g.lineTo(w - 32, h - 26); g.stroke();
    box(g, 62, 26, 70, 22, '#8a1e24', '#40090c', 8);
    g.strokeStyle = '#1a1c20'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(130, 30); g.lineTo(146, 12); g.stroke();
    glowDot(g, w - 12, 46, 12, 'rgba(255,240,200,0.9)');
  } },
  gate: { w: 280, h: 240, draw(g, w, h) {
    box(g, 0, 20, 34, h - 20, '#6a6258', '#2a2620', 2);
    box(g, w - 34, 20, 34, h - 20, '#6a6258', '#2a2620', 2);
    g.strokeStyle = '#1a1c20'; g.lineWidth = 4;
    for (let x = 44; x < w - 40; x += 16) { g.beginPath(); g.moveTo(x, 50); g.lineTo(x, h); g.stroke(); }
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(34, 60); g.lineTo(w - 34, 60); g.moveTo(34, h - 40); g.lineTo(w - 34, h - 40); g.stroke();
    glowDot(g, 17, 20, 22, 'rgba(255,230,170,0.8)');
    glowDot(g, w - 17, 20, 22, 'rgba(255,230,170,0.8)');
  } },
  tv: { w: 170, h: 150, draw(g, w, h) {
    box(g, 10, h - 40, w - 20, 40, '#4a3424', '#1e140c', 2);
    box(g, 0, 0, w, h - 50, '#141418', '#08080a', 4);
    const gr = g.createLinearGradient(0, 8, 0, h - 58);
    gr.addColorStop(0, 'rgba(160,200,255,0.9)'); gr.addColorStop(1, 'rgba(80,110,170,0.9)');
    g.fillStyle = gr;
    g.fillRect(8, 8, w - 16, h - 66);
    g.fillStyle = 'rgba(200,30,40,0.9)';
    g.fillRect(8, h - 78, w - 16, 12);
    glowDot(g, w / 2, (h - 50) / 2, 90, 'rgba(140,180,255,0.25)');
  } },
  mirror: { w: 90, h: 160, draw(g, w, h) {
    box(g, 0, 0, w, h - 30, '#6a5238', '#2e2216', 30);
    const gr = g.createLinearGradient(0, 8, w, h);
    gr.addColorStop(0, 'rgba(200,220,240,0.9)'); gr.addColorStop(0.5, 'rgba(120,140,170,0.9)'); gr.addColorStop(1, 'rgba(200,220,240,0.8)');
    g.fillStyle = gr;
    rr(g, 8, 8, w - 16, h - 46, 24); g.fill();
    box(g, 20, h - 30, w - 40, 30, '#4a3424', '#1e140c', 2);
  } },
  firetruck: { w: 330, h: 160, draw(g, w, h) {
    box(g, 70, 30, w - 76, 96, '#a01e1a', '#4a0a08', 4);
    box(g, 6, 44, 76, 82, '#b8261e', '#500c0a', 6);
    g.fillStyle = 'rgba(140,170,200,0.55)';
    g.fillRect(16, 54, 44, 30);
    g.strokeStyle = '#d8d8d8'; g.lineWidth = 3;
    for (let x = 90; x < w - 20; x += 22) { g.beginPath(); g.moveTo(x, 22); g.lineTo(x + 10, 22); g.stroke(); }
    g.beginPath(); g.moveTo(90, 22); g.lineTo(w - 12, 22); g.stroke();
    glowDot(g, 40, 38, 18, 'rgba(80,140,255,0.9)');
    glowDot(g, 60, 38, 18, 'rgba(255,60,60,0.9)');
    wheel(g, 50, h - 24, 24); wheel(g, w - 60, h - 24, 24); wheel(g, w - 118, h - 24, 24);
  } },
};

/** Size in px of a prop visual (before scaling). */
export function propSize(v: PropVisual): { w: number; h: number } {
  const s = SPECS[v];
  return { w: s.w, h: s.h };
}

/** Texture key of a painted Earth prop (painted once per session). */
export function earthProp(scene: Phaser.Scene, v: PropVisual): string {
  const key = `prop:earth:${v}`;
  if (scene.textures.exists(key)) return key;
  const s = SPECS[v];
  const { c, g } = makeCanvas(s.w, s.h);
  s.draw(g, s.w, s.h);
  scene.textures.addCanvas(key, c);
  return key;
}

/** A one-way platform on Earth: a wooden plank or a concrete slab, with a lit top edge. */
export function earthLedge(scene: Phaser.Scene, w: number, wood: boolean): string {
  const key = `prop:earthledge:${w}:${wood ? 'w' : 'c'}`;
  if (scene.textures.exists(key)) return key;
  const { c, g } = makeCanvas(w + 20, 40);
  box(g, 6, 8, w + 8, 16, wood ? '#7a5a3a' : '#8a8680', wood ? '#3a2818' : '#4a4844', 3, 'rgba(255,236,200,0.7)');
  g.fillStyle = 'rgba(0,0,0,0.35)';
  g.fillRect(10, 24, w, 6);
  if (wood) {
    g.strokeStyle = 'rgba(30,18,8,0.5)';
    g.lineWidth = 1.5;
    for (let x = 40; x < w; x += 60) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x, 22); g.stroke(); }
  }
  scene.textures.addCanvas(key, c);
  return key;
}
