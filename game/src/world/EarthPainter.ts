/**
 * Paints Earth backdrops in code (there is no art of Chennai): skies, rooftops with water tanks, coconut
 * palms, lecture blocks with lit windows, market stalls, the hangar and its planes, and interiors. The
 * same soft-stamp technique as the Glacia scenery keeps the look painterly and consistent.
 */
import Phaser from 'phaser';
import { assets, hasOverride } from '../core/Assets';
import { EARTH_SCENES, earthPalette, type EarthScene } from '../data/earthScenes';
import { hexRgb, makeCanvas, mixRgb, rgbCss, scaleRgb, type RGB } from './Paint';

type G = CanvasRenderingContext2D;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const col = (h: string) => hexRgb(h);

function puff(color: RGB, soft = 0.5): HTMLCanvasElement {
  const { c, g } = makeCanvas(64, 64);
  const gr = g.createRadialGradient(28, 26, 2, 32, 32, 32);
  gr.addColorStop(0, rgbCss(mixRgb(color, [255, 255, 255], 0.25)));
  gr.addColorStop(soft, rgbCss(color, 0.85));
  gr.addColorStop(1, rgbCss(color, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return c;
}

// ---------------------------------------------------------------- outdoor pieces
function sky(g: G, w: number, h: number, s: EarthScene, r: () => number) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, s.top);
  gr.addColorStop(1, s.bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const L = s.light;
  const lg = g.createRadialGradient(L.x * w, L.y * h, 0, L.x * w, L.y * h, L.size * w);
  lg.addColorStop(0, rgbCss(col(L.color), 0.4 * L.strength));
  lg.addColorStop(0.3, rgbCss(col(L.color), 0.12 * L.strength));
  lg.addColorStop(1, rgbCss(col(L.color), 0));
  g.fillStyle = lg;
  g.fillRect(0, 0, w, h);
  if (s.stars) {
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`;
      const sz = r() < 0.08 ? 2 : 1;
      g.fillRect(r() * w, r() * h * 0.6, sz, sz);
    }
  }
  if (s.clouds) {
    const cloudCol = mixRgb(col(s.top), col(s.bottom), 0.6);
    const lit = mixRgb(cloudCol, col(L.color), 0.4);
    const p = puff(mixRgb(lit, [255, 255, 255], 0.3), 0.55);
    for (let k = 0; k < s.clouds; k++) {
      const cx = r() * w, cy = (0.08 + r() * 0.35) * h, cw = (0.12 + r() * 0.22) * w;
      g.globalAlpha = 0.25 + r() * 0.25;
      for (let i = 0; i < 18; i++) {
        const rr = (0.03 + r() * 0.05) * w;
        g.drawImage(p, cx + (r() - 0.5) * cw - rr, cy + (r() - 0.5) * cw * 0.12 - rr * 0.6, rr * 2, rr * 1.2);
      }
    }
    g.globalAlpha = 1;
  }
}

function palm(g: G, x: number, base: number, h: number, c: string, r: () => number) {
  const lean = (r() - 0.5) * 0.5;
  const tx = x + Math.sin(lean) * h, ty = base - h;
  g.strokeStyle = c;
  g.lineWidth = Math.max(2, h * 0.035);
  g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + (tx - x) * 0.2, base - h * 0.5, tx, ty); g.stroke();
  g.lineWidth = Math.max(1.5, h * 0.018);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.42 + (r() - 0.5) * 0.2;
    const len = h * (0.32 + r() * 0.12);
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.6 + len * 0.35;
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.5 - len * 0.1, ex, ey); g.stroke();
  }
}

function skyline(g: G, w: number, base: number, scale: number, c: string, r: () => number) {
  g.fillStyle = c;
  g.strokeStyle = c;
  let x = -20;
  while (x < w + 20) {
    const bw = (40 + r() * 90) * scale, bh = (30 + r() * 110) * scale;
    g.fillRect(x, base - bh, bw, bh + 4);
    if (r() < 0.5) { // water tank on the roof
      const tw = 14 * scale, th = 12 * scale;
      g.fillRect(x + bw * (0.2 + r() * 0.5), base - bh - th, tw, th);
    }
    if (r() < 0.2) { g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + bw * 0.5, base - bh); g.lineTo(x + bw * 0.5, base - bh - 26 * scale); g.stroke(); }
    if (r() < 0.35) palm(g, x + bw + 6 * scale, base, (60 + r() * 50) * scale, c, r);
    x += bw + (r() * 20 - 4) * scale;
  }
}

function windows(g: G, x: number, y: number, w: number, h: number, lamp: string, lit: number, r: () => number, cols = 0) {
  const ww = 14, wh = 18, gap = 12;
  const nx = cols || Math.max(1, Math.floor((w - gap) / (ww + gap)));
  const ny = Math.max(1, Math.floor((h - gap) / (wh + gap)));
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const on = r() < lit;
      g.fillStyle = on ? rgbCss(col(lamp), 0.75) : 'rgba(10,14,22,0.35)';
      g.fillRect(x + gap + i * (ww + gap), y + gap + j * (wh + gap), ww, wh);
    }
  }
}

function lectureBlocks(g: G, w: number, base: number, s: EarthScene, r: () => number, night: boolean) {
  const wall = mixRgb(col(s.shade), col(s.bottom), 0.45);
  let x = 30;
  while (x < w - 60) {
    const bw = 220 + r() * 260, bh = 170 + r() * 150;
    const face = mixRgb(wall, col(s.light.color), 0.12 + r() * 0.08);
    g.fillStyle = rgbCss(face);
    g.fillRect(x, base - bh, bw, bh);
    g.fillStyle = rgbCss(scaleRgb(face, 0.8));
    g.fillRect(x, base - bh, bw, 12);
    // Columns along the front (Rajam Hall style).
    if (r() < 0.5) {
      g.fillStyle = rgbCss(mixRgb(face, [255, 255, 255], 0.15));
      for (let cx = x + 16; cx < x + bw - 10; cx += 34) g.fillRect(cx, base - bh * 0.42, 8, bh * 0.42);
    }
    windows(g, x + 6, base - bh + 18, bw - 12, bh * 0.5, s.lamp, night ? 0.55 : 0.12, r);
    x += bw + 60 + r() * 120;
  }
}

function hostelBlocks(g: G, w: number, base: number, s: EarthScene, r: () => number, night: boolean) {
  const wall = mixRgb(col(s.shade), col(s.bottom), 0.38);
  let x = 10;
  while (x < w) {
    const bw = 300 + r() * 220, floors = 3 + Math.floor(r() * 2), fh = 62;
    const face = mixRgb(wall, col(s.light.color), 0.1);
    g.fillStyle = rgbCss(face);
    g.fillRect(x, base - floors * fh, bw, floors * fh);
    for (let f = 0; f < floors; f++) {
      const y = base - (f + 1) * fh;
      g.fillStyle = rgbCss(scaleRgb(face, 0.72));
      g.fillRect(x, y + fh - 10, bw, 4); // balcony rail
      for (let k = x + 10; k < x + bw - 20; k += 34) {
        g.fillStyle = r() < (night ? 0.5 : 0.1) ? rgbCss(col(s.lamp), 0.8) : 'rgba(10,14,22,0.35)';
        g.fillRect(k, y + 14, 16, 26);
        if (r() < 0.25) { // clothes drying on the rail
          g.fillStyle = rgbCss(mixRgb(col(['#c85a5a', '#5a7ac8', '#e8c85a', '#e8e8e8'][Math.floor(r() * 4)]!), face, 0.4));
          g.fillRect(k + 4, y + fh - 10, 10, 14);
        }
      }
    }
    x += bw + 40 + r() * 80;
  }
}

function marketStalls(g: G, w: number, base: number, s: EarthScene, r: () => number) {
  // Dense two-storey shops with signboards, awnings, bulb strings and a crowd.
  let x = 0;
  const wall = mixRgb(col(s.shade), col(s.bottom), 0.3);
  while (x < w) {
    const bw = 120 + r() * 120, bh = 150 + r() * 120;
    g.fillStyle = rgbCss(mixRgb(wall, [255, 255, 255], r() * 0.08));
    g.fillRect(x, base - bh, bw, bh);
    const signs = ['#e84a5a', '#3aa8e8', '#f0c83a', '#5ac87a', '#e87a3a'];
    g.fillStyle = rgbCss(mixRgb(col(signs[Math.floor(r() * signs.length)]!), wall, 0.35));
    g.fillRect(x + 8, base - bh + 20, bw - 16, 26);
    g.fillStyle = rgbCss(col(s.lamp), 0.55);
    g.fillRect(x + 14, base - 90, bw - 28, 60); // lit shop front
    const aw = signs[Math.floor(r() * signs.length)]!;
    for (let k = 0; k < bw; k += 16) {
      g.fillStyle = rgbCss(mixRgb(col(k % 32 ? aw : '#f0e8d8'), wall, 0.3));
      g.beginPath(); g.moveTo(x + k, base - 100); g.lineTo(x + k + 16, base - 100); g.lineTo(x + k + 20, base - 80); g.lineTo(x + k - 4, base - 80); g.fill();
    }
    x += bw + 4;
  }
  // Bulb strings.
  for (let k = 0; k < 4; k++) {
    const y0 = base - 180 - k * 30;
    g.strokeStyle = 'rgba(20,16,20,0.6)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, y0); for (let xx = 0; xx <= w; xx += 40) g.lineTo(xx, y0 + Math.sin(xx / 90) * 12); g.stroke();
    for (let xx = 10; xx <= w; xx += 26) {
      const yy = y0 + Math.sin(xx / 90) * 12 + 3;
      const gl = g.createRadialGradient(xx, yy, 0, xx, yy, 9);
      gl.addColorStop(0, rgbCss(col(s.lamp), 0.95));
      gl.addColorStop(1, rgbCss(col(s.lamp), 0));
      g.fillStyle = gl;
      g.fillRect(xx - 9, yy - 9, 18, 18);
    }
  }
  // Crowd silhouettes.
  g.fillStyle = rgbCss(scaleRgb(wall, 0.55));
  for (let xx = 0; xx < w; xx += 14 + r() * 18) {
    const hh = 60 + r() * 26;
    g.beginPath(); g.ellipse(xx, base - hh, 8, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(xx - 11, base - hh + 8, 22, hh - 8);
  }
}

/** A side-on fighter plane silhouette. Also used as a hiding prop in the hangar yard. */
export function drawPlane(g: G, x: number, base: number, scale: number, c: string, rim?: string) {
  const s = scale;
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(x, base - 40 * s);
  g.quadraticCurveTo(x + 20 * s, base - 62 * s, x + 90 * s, base - 64 * s);
  g.lineTo(x + 260 * s, base - 60 * s);
  g.lineTo(x + 300 * s, base - 110 * s); // tail fin
  g.lineTo(x + 322 * s, base - 110 * s);
  g.lineTo(x + 318 * s, base - 52 * s);
  g.lineTo(x + 330 * s, base - 46 * s);
  g.lineTo(x + 250 * s, base - 34 * s);
  g.lineTo(x + 40 * s, base - 30 * s);
  g.closePath();
  g.fill();
  g.beginPath(); // wing
  g.moveTo(x + 110 * s, base - 44 * s); g.lineTo(x + 200 * s, base - 44 * s); g.lineTo(x + 150 * s, base - 14 * s); g.lineTo(x + 110 * s, base - 14 * s); g.fill();
  g.beginPath(); // canopy
  g.ellipse(x + 70 * s, base - 64 * s, 26 * s, 10 * s, -0.1, Math.PI, 0); g.fill();
  g.fillRect(x + 80 * s, base - 30 * s, 6 * s, 30 * s); // landing gear
  g.fillRect(x + 220 * s, base - 34 * s, 6 * s, 34 * s);
  g.beginPath(); g.arc(x + 83 * s, base - 4 * s, 7 * s, 0, Math.PI * 2); g.arc(x + 223 * s, base - 4 * s, 7 * s, 0, Math.PI * 2); g.fill();
  if (rim) {
    g.strokeStyle = rim;
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(x + 4 * s, base - 42 * s); g.quadraticCurveTo(x + 20 * s, base - 62 * s, x + 90 * s, base - 64 * s); g.lineTo(x + 260 * s, base - 60 * s); g.stroke();
  }
}

function hangar(g: G, w: number, base: number, s: EarthScene) {
  const c = rgbCss(mixRgb(col(s.shade), col(s.bottom), 0.25));
  g.fillStyle = c;
  const hx = w * 0.12, hw = w * 0.55, hh = 300;
  g.beginPath();
  g.moveTo(hx, base);
  g.lineTo(hx, base - hh * 0.55);
  g.quadraticCurveTo(hx + hw / 2, base - hh * 1.25, hx + hw, base - hh * 0.55);
  g.lineTo(hx + hw, base);
  g.fill();
  g.fillStyle = rgbCss(scaleRgb(mixRgb(col(s.shade), col(s.bottom), 0.25), 0.6));
  g.fillRect(hx + hw * 0.2, base - hh * 0.5, hw * 0.6, hh * 0.5); // open door
  g.fillStyle = rgbCss(col(s.lamp), 0.35);
  g.fillRect(hx + hw * 0.2, base - hh * 0.5, hw * 0.6, 6);
  g.font = 'bold 28px sans-serif';
  g.fillStyle = rgbCss(mixRgb(col(s.shade), [255, 255, 255], 0.25), 0.8);
  g.fillText('HANGAR 1', hx + hw * 0.38, base - hh * 0.62);
  drawPlane(g, w * 0.64, base, 0.7, rgbCss(scaleRgb(mixRgb(col(s.shade), col(s.bottom), 0.3), 0.8)));
}

function trees(g: G, w: number, base: number, s: EarthScene, r: () => number, count: number, scale: number, alpha: number) {
  const leaf = col(s.leaf);
  const lit = mixRgb(leaf, col(s.light.color), 0.35);
  const pLeaf = puff(lit, 0.5), pDark = puff(scaleRgb(leaf, 0.75), 0.5);
  const pBloom = s.bloom ? puff(col(s.bloom), 0.45) : null;
  g.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const x = (i + r() * 0.8) * (w / count);
    const h = (180 + r() * 140) * scale;
    const trunk = rgbCss(scaleRgb(mixRgb(leaf, [40, 30, 24], 0.7), 0.7));
    g.strokeStyle = trunk;
    g.lineWidth = 8 * scale;
    g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + (r() - 0.5) * 30, base - h * 0.5, x + (r() - 0.5) * 20, base - h * 0.7); g.stroke();
    const cx = x, cy = base - h * 0.78, cw = (110 + r() * 60) * scale;
    const bloom = pBloom && r() < 0.6;
    for (let k = 0; k < 70; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      const px = cx + Math.cos(a) * cw * d, py = cy + Math.sin(a) * cw * 0.55 * d;
      const rr = (10 + r() * 16) * scale;
      const img = bloom && r() < 0.45 ? pBloom! : py < cy ? pLeaf : pDark;
      g.drawImage(img, px - rr, py - rr, rr * 2, rr * 2);
    }
  }
  g.globalAlpha = 1;
}

function haze(g: G, w: number, h: number, base: number, s: EarthScene) {
  const gr = g.createLinearGradient(0, base - 160, 0, h);
  const c = mixRgb(col(s.bottom), col(s.light.color), 0.3);
  gr.addColorStop(0, rgbCss(c, 0));
  gr.addColorStop(0.5, rgbCss(c, 0.35));
  gr.addColorStop(1, rgbCss(scaleRgb(c, 0.7), 0.7));
  g.fillStyle = gr;
  g.fillRect(0, base - 160, w, h - base + 160);
}

function paintOutdoor(g: G, w: number, h: number, s: EarthScene, seed: number) {
  const r = rng(seed);
  const night = !!s.stars || s.id.includes('night') || s.id.includes('rain');
  sky(g, w, h, s, r);
  const base = h * 0.78;
  if (s.skyline) skyline(g, w, base - 40, 1, rgbCss(mixRgb(col(s.shade), col(s.top), 0.45)), r);
  if (s.campus === 'lecture') lectureBlocks(g, w, base, s, r, night);
  if (s.campus === 'hostel') hostelBlocks(g, w, base, s, r, night);
  if (s.campus === 'market') marketStalls(g, w, base + 10, s, r);
  if (s.campus === 'hangar') hangar(g, w, base, s);
  if (s.campus !== 'market') trees(g, w, base + 20, s, r, Math.round(w / 260), 1, 0.9);
  haze(g, w, h, base, s);
}

// ---------------------------------------------------------------- interiors
function paintIndoor(g: G, w: number, h: number, s: EarthScene, seed: number) {
  const r = rng(seed);
  const wall = g.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, s.top);
  wall.addColorStop(1, s.bottom);
  g.fillStyle = wall;
  g.fillRect(0, 0, w, h);
  const shade = col(s.shade);
  const furn = (a = 0.9) => rgbCss(shade, a);
  const floorY = h * 0.8;
  // Wainscot and skirting.
  g.fillStyle = rgbCss(scaleRgb(col(s.bottom), 0.85), 0.8);
  g.fillRect(0, floorY - 90, w, 90);
  g.fillStyle = furn(0.5);
  g.fillRect(0, floorY - 92, w, 3);
  const L = s.light;
  const addLight = (x: number, y: number, rad: number, a: number) => {
    const lg = g.createRadialGradient(x, y, 0, x, y, rad);
    lg.addColorStop(0, rgbCss(col(L.color), a));
    lg.addColorStop(1, rgbCss(col(L.color), 0));
    g.fillStyle = lg;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };
  const windowAt = (x: number, y: number, ww: number, wh: number, outside: string) => {
    g.fillStyle = outside;
    g.fillRect(x, y, ww, wh);
    g.strokeStyle = furn(0.95);
    g.lineWidth = 6;
    g.strokeRect(x, y, ww, wh);
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + wh); g.moveTo(x, y + wh / 2); g.lineTo(x + ww, y + wh / 2); g.stroke();
    // Grille bars, common on Chennai windows.
    g.lineWidth = 1.5;
    for (let k = x + 10; k < x + ww; k += 12) { g.beginPath(); g.moveTo(k, y); g.lineTo(k, y + wh); g.stroke(); }
    // Light shaft.
    const sh = g.createLinearGradient(x, y, x + ww * 0.8, floorY);
    sh.addColorStop(0, rgbCss(col(L.color), 0.22 * L.strength));
    sh.addColorStop(1, rgbCss(col(L.color), 0));
    g.fillStyle = sh;
    g.beginPath(); g.moveTo(x, y + wh); g.lineTo(x + ww, y + wh); g.lineTo(x + ww + 160, floorY); g.lineTo(x + 100, floorY); g.fill();
  };
  const door = (x: number, ww = 90, hh = 200) => {
    g.fillStyle = furn(0.95);
    g.fillRect(x, floorY - hh, ww, hh);
    g.fillStyle = rgbCss(mixRgb(shade, col(s.top), 0.25));
    g.fillRect(x + 8, floorY - hh + 8, ww - 16, hh - 8);
    g.fillStyle = rgbCss(col(s.lamp), 0.8);
    g.fillRect(x + ww - 20, floorY - hh * 0.5, 6, 6);
  };
  const shelf = (x: number, y: number, ww: number) => {
    g.fillStyle = furn();
    g.fillRect(x, y, ww, 8);
    for (let k = x + 4; k < x + ww - 8; k += 9 + r() * 6) {
      const bh = 22 + r() * 14;
      g.fillStyle = rgbCss(mixRgb(col(['#8a3a3a', '#3a5a8a', '#8a7a3a', '#4a6a4a'][Math.floor(r() * 4)]!), shade, 0.4));
      g.fillRect(k, y - bh, 7, bh);
    }
  };
  const outside = rgbCss(mixRgb(col(L.color), col(s.top), 0.3));
  switch (s.room) {
    case 'hostel': {
      for (let x = 160; x < w; x += 620) {
        windowAt(x, h * 0.22, 150, 130, outside);
        g.fillStyle = furn(); // cot
        g.fillRect(x - 120, floorY - 60, 260, 20); g.fillRect(x - 116, floorY - 40, 10, 40); g.fillRect(x + 126, floorY - 40, 10, 40);
        g.fillStyle = rgbCss(mixRgb(col('#5a7ac8'), shade, 0.5)); // bedsheet
        g.fillRect(x - 118, floorY - 72, 220, 14);
        g.fillStyle = furn(); // desk + laptop
        g.fillRect(x + 200, floorY - 110, 150, 12); g.fillRect(x + 206, floorY - 98, 10, 98); g.fillRect(x + 334, floorY - 98, 10, 98);
        g.fillStyle = rgbCss(col(s.lamp), 0.6);
        g.fillRect(x + 240, floorY - 140, 56, 30);
        shelf(x + 380, h * 0.36, 140);
      }
      // Ceiling fan.
      for (let x = 300; x < w; x += 620) {
        g.fillStyle = furn(); g.fillRect(x - 3, 0, 6, h * 0.12);
        g.beginPath(); g.ellipse(x, h * 0.12, 90, 8, 0, 0, Math.PI * 2); g.fill();
      }
      break;
    }
    case 'house': {
      for (let x = 120; x < w; x += 560) {
        windowAt(x, h * 0.2, 170, 150, outside);
        door(x + 280);
        shelf(x + 420, h * 0.4, 110);
        g.fillStyle = furn(); // sofa
        g.fillRect(x - 60, floorY - 70, 220, 50); g.fillRect(x - 70, floorY - 100, 30, 80); g.fillRect(x + 150, floorY - 100, 30, 80);
        // Framed photo.
        g.strokeStyle = furn(); g.lineWidth = 4; g.strokeRect(x + 440, h * 0.18, 60, 76);
      }
      break;
    }
    case 'station': {
      for (let x = 100; x < w; x += 520) {
        windowAt(x, h * 0.2, 120, 110, outside);
        g.fillStyle = furn(); // desk and file stacks
        g.fillRect(x + 180, floorY - 100, 220, 14); g.fillRect(x + 186, floorY - 86, 12, 86); g.fillRect(x + 382, floorY - 86, 12, 86);
        for (let k = 0; k < 4; k++) g.fillRect(x + 200 + k * 30, floorY - 130 - r() * 30, 24, 30 + r() * 20);
        g.fillStyle = rgbCss(mixRgb(col('#c8b890'), shade, 0.3)); // notice board
        g.fillRect(x + 430, h * 0.22, 70, 90);
      }
      // Cell bars at the far end.
      g.strokeStyle = furn(); g.lineWidth = 6;
      for (let x = w - 300; x < w; x += 22) { g.beginPath(); g.moveTo(x, h * 0.15); g.lineTo(x, floorY); g.stroke(); }
      break;
    }
    case 'interrogation': {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let k = 0; k < 7; k++) { g.fillRect(r() * w, r() * floorY, 2, 60 + r() * 120); } // cracks
      g.fillStyle = furn(); g.fillRect(w / 2 - 2, 0, 4, h * 0.14); // bulb cord
      addLight(w / 2, h * 0.16, h * 0.9, 0.4);
      g.fillStyle = rgbCss(col(s.lamp)); g.beginPath(); g.arc(w / 2, h * 0.16, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = furn(); g.fillRect(w / 2 - 160, floorY - 90, 320, 16); g.fillRect(w / 2 - 150, floorY - 74, 12, 74); g.fillRect(w / 2 + 138, floorY - 74, 12, 74);
      break;
    }
    case 'corridor': {
      for (let x = 80; x < w; x += 300) {
        if ((x / 300) % 2 < 1) windowAt(x, h * 0.2, 110, 150, outside); else door(x + 10);
        g.fillStyle = furn(0.5); g.fillRect(x + 200, 0, 20, floorY); // pillar
      }
      break;
    }
    case 'restroom': {
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
      for (let y = 0; y < floorY; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      for (let x = 0; x < w; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, floorY); g.stroke(); }
      for (let x = 200; x < w; x += 260) door(x, 110, 230);
      break;
    }
    case 'cafe': {
      for (let x = 60; x < w; x += 240) {
        g.strokeStyle = furn(); g.lineWidth = 4; g.strokeRect(x, h * 0.2, 90 + r() * 30, 70 + r() * 30); // art frames
        g.fillStyle = rgbCss(mixRgb(col(['#ff7ab8', '#7ad8ff', '#ffd07a'][Math.floor(r() * 3)]!), shade, 0.3), 0.6);
        g.fillRect(x + 4, h * 0.2 + 4, 82, 62);
        g.fillStyle = furn(); g.fillRect(x + 40, floorY - 70, 110, 10); g.fillRect(x + 90, floorY - 60, 8, 60); // table
      }
      for (let x = 0; x < w; x += 22) { // fairy lights
        const y = h * 0.08 + Math.sin(x / 70) * 14;
        const gl = g.createRadialGradient(x, y, 0, x, y, 10);
        gl.addColorStop(0, rgbCss(col(s.lamp), 1)); gl.addColorStop(1, rgbCss(col(s.lamp), 0));
        g.fillStyle = gl; g.fillRect(x - 10, y - 10, 20, 20);
      }
      break;
    }
    case 'shed': {
      g.fillStyle = furn(); for (let x = 0; x < w; x += 160) g.fillRect(x, 0, 14, floorY);
      g.fillRect(0, h * 0.1, w, 12);
      addLight(w * 0.4, h * 0.15, h * 0.7, 0.3);
      break;
    }
    case 'classroom': {
      for (let x = 120; x < w; x += 700) {
        g.fillStyle = rgbCss(mixRgb(col('#1e3a2a'), shade, 0.3)); g.fillRect(x, h * 0.18, 360, 150); // blackboard
        g.strokeStyle = furn(); g.lineWidth = 6; g.strokeRect(x, h * 0.18, 360, 150);
        windowAt(x + 450, h * 0.2, 140, 130, outside);
      }
      g.fillStyle = furn(); for (let x = 40; x < w; x += 150) { g.fillRect(x, floorY - 60, 120, 10); g.fillRect(x + 6, floorY - 50, 8, 50); } // benches
      break;
    }
    case 'library': {
      // Tall shelves of coloured spines, reading tables, warm lamps.
      const spines = ['#8a2a24', '#2a4a7a', '#b89a3a', '#3a6a3a', '#6a3a7a', '#c8b8a0'];
      for (let x = 60; x < w; x += 260) {
        g.fillStyle = furn(); g.fillRect(x, h * 0.12, 180, floorY - h * 0.12);
        for (let row = 0; row < 7; row++) {
          const y = h * 0.14 + row * ((floorY - h * 0.16) / 7);
          for (let bx = x + 8; bx < x + 172; bx += 9 + r() * 5) {
            g.fillStyle = rgbCss(mixRgb(col(spines[Math.floor(r() * spines.length)]!), shade, 0.35));
            const bh = (floorY - h * 0.16) / 7 - 8 - r() * 10;
            g.fillRect(bx, y + ((floorY - h * 0.16) / 7 - 4 - bh), 7, bh);
          }
        }
      }
      g.fillStyle = furn(); for (let x = 200; x < w; x += 520) { g.fillRect(x, floorY - 70, 200, 12); g.fillRect(x + 10, floorY - 58, 10, 58); g.fillRect(x + 180, floorY - 58, 10, 58); }
      for (let x = 300; x < w; x += 520) addLight(x, floorY - 120, 160, 0.35);
      break;
    }
    case 'hospital': {
      for (let x = 100; x < w; x += 420) {
        g.fillStyle = rgbCss(mixRgb(col('#a8d0d0'), shade, 0.2), 0.8); // curtain
        for (let k = 0; k < 8; k++) g.fillRect(x + k * 16, h * 0.12, 12, floorY - h * 0.12 - 20);
        g.fillStyle = furn(); g.fillRect(x + 160, floorY - 70, 200, 16); g.fillRect(x + 164, floorY - 54, 8, 54); g.fillRect(x + 350, floorY - 54, 8, 54);
      }
      break;
    }
    case 'train': {
      for (let x = 60; x < w; x += 260) {
        g.fillStyle = rgbCss(mixRgb(col(L.color), col('#6a9a5a'), 0.4)); // passing green blur
        g.fillRect(x, h * 0.22, 170, 110);
        g.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 6; k++) g.fillRect(x, h * 0.22 + r() * 110, 170, 2);
        g.strokeStyle = furn(); g.lineWidth = 8; g.strokeRect(x, h * 0.22, 170, 110);
      }
      g.fillStyle = furn(); for (let x = 0; x < w; x += 130) g.fillRect(x + 40, h * 0.1, 4, 50); // grab handles
      break;
    }
    case 'warehouse': {
      g.fillStyle = furn(); for (let x = 40; x < w; x += 180) { g.fillRect(x, floorY - 90 - r() * 60, 110, 200); }
      addLight(w * 0.5, h * 0.1, h * 0.6, 0.35);
      break;
    }
    default: break;
  }
  const ceil = g.createLinearGradient(0, 0, 0, h * 0.25);
  ceil.addColorStop(0, 'rgba(0,0,0,0.35)');
  ceil.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = ceil;
  g.fillRect(0, 0, w, h * 0.25);
  addLight(L.x * w, L.y * h, L.size * w, 0.18 * L.strength);
}

/** Paints an Earth scene at the given size. */
export function paintEarth(id: string, w: number, h: number, seed = 7): HTMLCanvasElement {
  const s = EARTH_SCENES[id] ?? EARTH_SCENES.campus_noon!;
  const { c, g } = makeCanvas(w, h);
  if (s.kind === 'outdoor') paintOutdoor(g, w, h, s, seed + id.length * 97);
  else paintIndoor(g, w, h, s, seed + id.length * 97);
  return c;
}

/** Makes sure bg:gen:<id> and far:gen:<id> exist (painted, unless an override was loaded under that key). */
export function ensureEarthTextures(scene: Phaser.Scene, slug: string): void {
  if (!slug.startsWith('gen:')) return;
  const id = slug.slice(4);
  if (!scene.textures.exists(`bg:${slug}`)) scene.textures.addCanvas(`bg:${slug}`, paintEarth(id, 1600, 1000));
  if (!scene.textures.exists(`far:${slug}`)) {
    const far = paintEarth(id, 400, 250, 3);
    const { c, g } = makeCanvas(800, 500);
    g.filter = 'blur(6px)';
    g.drawImage(far, 0, 0, 800, 500);
    scene.textures.addCanvas(`far:${slug}`, c);
  }
}

/** Earth scenes whose override art exists (assets/override/bg/<id>.webp) load that file instead of painting. */
export function earthOverrideSpec(slug: string): { key: string; url: string } | null {
  if (!slug.startsWith('gen:')) return null;
  const id = slug.slice(4);
  return hasOverride(`bg/${id}.webp`) ? { key: `bg:${slug}`, url: `assets/override/bg/${id}.webp` } : null;
}

/** Registers every Earth scene's terrain palette under "gen:<id>" so rooms can use it. */
export function registerEarthPalettes(): void {
  for (const s of Object.values(EARTH_SCENES)) assets.palettes[`gen:${s.id}`] = earthPalette(s);
}
