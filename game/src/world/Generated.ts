/**
 * Textures drawn in code at boot: the four protagonists' portraits (they have no art yet; a file in
 * assets/override/portraits/<id>.webp replaces them), particle sprites and a few icons.
 */
import Phaser from 'phaser';
import { hasOverride } from '../core/Assets';
import { CHARACTERS, type MemberId } from '../data/characters';
import { rigStyle, type RigStyle } from '../data/rigs';
import { SPEAKERS } from '../data/speakers';

const css = (n: number, a = 1) => `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
const mix = (a: number, b: number, t: number) => {
  const c = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return (c(16) << 16) | (c(8) << 8) | c(0);
};

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, g: c.getContext('2d')! };
}

function addCanvas(scene: Phaser.Scene, key: string, c: HTMLCanvasElement) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, c);
}

/** Head-and-shoulders silhouette, rim-lit from the upper left, with glowing veins in the character colour. */
function drawPortrait(style: RigStyle, size = 384): HTMLCanvasElement {
  const glowCol = style.veins || style.glowEyes ? style.vein : mix(style.cloth, 0xc8d6ea, 0.4);
  const ch = { vein: glowCol, body: style.body, cloth: style.cloth, build: { width: style.width, hair: style.hair, glasses: style.glasses } };
  const { c, g } = canvas(size, size);
  const s = size / 384;
  g.scale(s, s);
  // Backdrop: dark vignette tinted by the vein colour.
  const bg = g.createRadialGradient(150, 130, 20, 192, 200, 300);
  bg.addColorStop(0, css(mix(ch.vein, 0x0a1020, 0.72)));
  bg.addColorStop(0.55, css(mix(ch.vein, 0x060910, 0.88)));
  bg.addColorStop(1, '#04060b');
  g.fillStyle = bg;
  g.fillRect(0, 0, 384, 384);
  // Floating motes.
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % 384, y = (i * 53 + 40) % 384, r = 1 + (i % 3);
    g.fillStyle = css(ch.vein, 0.08 + (i % 4) * 0.04);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const wide = ch.build.width;
  const shape = (dx: number, dy: number) => {
    g.beginPath();
    // shoulders and neck
    g.moveTo(40 + dx, 384);
    g.bezierCurveTo(52 + dx, 318 + dy, 118 - 20 * (wide - 1) + dx, 296 + dy, 160 + dx, 286 + dy);
    g.lineTo(166 + dx, 246 + dy);
    // head
    g.bezierCurveTo(128 + dx, 232 + dy, 118 + dx, 170 + dy, 124 + dx, 132 + dy);
    g.bezierCurveTo(132 + dx, 84 + dy, 176 + dx, 64 + dy, 204 + dx, 68 + dy);
    g.bezierCurveTo(248 + dx, 72 + dy, 270 + dx, 108 + dy, 266 + dx, 150 + dy);
    g.bezierCurveTo(264 + dx, 196 + dy, 248 + dx, 232 + dy, 220 + dx, 246 + dy);
    g.lineTo(224 + dx, 286 + dy);
    g.bezierCurveTo(268 + 20 * (wide - 1) + dx, 296 + dy, 332 + dx, 318 + dy, 344 + dx, 384);
    g.closePath();
  };
  const hair = (dx: number, dy: number) => {
    g.beginPath();
    switch (ch.build.hair) {
      case 'messy':
        g.moveTo(118 + dx, 150 + dy);
        for (let i = 0; i <= 10; i++) {
          const a = Math.PI * (1.05 + i * 0.09);
          const r = i % 2 ? 84 : 100;
          g.lineTo(196 + dx + Math.cos(a) * r, 140 + dy + Math.sin(a) * r * 0.85);
        }
        g.lineTo(272 + dx, 150 + dy);
        g.bezierCurveTo(250 + dx, 110 + dy, 150 + dx, 110 + dy, 118 + dx, 150 + dy);
        break;
      case 'ponytail':
        g.moveTo(120 + dx, 160 + dy);
        g.bezierCurveTo(112 + dx, 70 + dy, 280 + dx, 50 + dy, 272 + dx, 160 + dy);
        g.bezierCurveTo(300 + dx, 150 + dy, 318 + dx, 210 + dy, 296 + dx, 300 + dy);
        g.bezierCurveTo(290 + dx, 240 + dy, 276 + dx, 200 + dy, 262 + dx, 176 + dy);
        g.bezierCurveTo(240 + dx, 120 + dy, 150 + dx, 110 + dy, 120 + dx, 160 + dy);
        break;
      case 'long':
        g.moveTo(112 + dx, 300 + dy);
        g.bezierCurveTo(90 + dx, 180 + dy, 110 + dx, 58 + dy, 200 + dx, 58 + dy);
        g.bezierCurveTo(290 + dx, 58 + dy, 300 + dx, 180 + dy, 284 + dx, 300 + dy);
        g.bezierCurveTo(266 + dx, 250 + dy, 262 + dx, 150 + dy, 240 + dx, 124 + dy);
        g.bezierCurveTo(200 + dx, 104 + dy, 150 + dx, 120 + dy, 136 + dx, 180 + dy);
        g.bezierCurveTo(130 + dx, 230 + dy, 128 + dx, 270 + dy, 112 + dx, 300 + dy);
        break;
      case 'bun':
        g.moveTo(120 + dx, 150 + dy);
        g.bezierCurveTo(116 + dx, 66 + dy, 276 + dx, 60 + dy, 270 + dx, 150 + dy);
        g.bezierCurveTo(240 + dx, 110 + dy, 156 + dx, 110 + dy, 120 + dx, 150 + dy);
        g.moveTo(236 + dx, 70 + dy);
        g.arc(226 + dx, 58 + dy, 26, 0, Math.PI * 2);
        break;
      case 'bald':
        g.moveTo(126 + dx, 150 + dy);
        g.bezierCurveTo(124 + dx, 132 + dy, 132 + dx, 122 + dy, 140 + dx, 118 + dy);
        g.lineTo(136 + dx, 150 + dy);
        g.moveTo(262 + dx, 150 + dy);
        g.bezierCurveTo(264 + dx, 132 + dy, 256 + dx, 122 + dy, 248 + dx, 118 + dy);
        g.lineTo(252 + dx, 150 + dy);
        break;
      default:
        g.moveTo(120 + dx, 146 + dy);
        g.bezierCurveTo(116 + dx, 62 + dy, 276 + dx, 58 + dy, 270 + dx, 146 + dy);
        g.bezierCurveTo(240 + dx, 108 + dy, 156 + dx, 108 + dy, 120 + dx, 146 + dy);
    }
    g.closePath();
  };
  // Rim: the silhouette in light, offset toward the light, then the body over it.
  const rim = mix(ch.vein, 0xffffff, 0.55);
  g.save();
  g.shadowColor = css(ch.vein, 0.8);
  g.shadowBlur = 24;
  g.fillStyle = css(rim, 0.95);
  shape(-4, -3); g.fill();
  hair(-4, -3); g.fill();
  g.restore();
  const body = g.createLinearGradient(100, 60, 300, 384);
  body.addColorStop(0, css(mix(ch.body, ch.vein, 0.08)));
  body.addColorStop(1, css(ch.body));
  g.fillStyle = body;
  shape(0, 0); g.fill();
  // Clothing band across the shoulders.
  g.save();
  shape(0, 0); g.clip();
  g.fillStyle = css(mix(ch.cloth, 0x000000, 0.35));
  g.fillRect(0, 300, 384, 90);
  g.fillStyle = css(ch.cloth, 0.55);
  g.beginPath(); g.moveTo(150, 290); g.quadraticCurveTo(195, 330, 238, 290); g.lineTo(250, 310); g.quadraticCurveTo(195, 350, 138, 310); g.fill();
  g.restore();
  g.fillStyle = css(mix(ch.body, 0x000000, 0.3));
  hair(0, 0); g.fill();
  // Police cap.
  if (style.cap !== undefined) {
    g.fillStyle = css(style.cap);
    g.beginPath(); g.ellipse(196, 96, 96, 34, 0, Math.PI, 0); g.fill();
    g.fillRect(100, 92, 192, 20);
    g.beginPath(); g.ellipse(250, 112, 60, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = css(mix(style.cap, 0xffd98a, 0.5));
    g.beginPath(); g.arc(196, 88, 9, 0, Math.PI * 2); g.fill();
  }
  // Veins: glowing lines down the neck (the protagonists only).
  g.save();
  if (!style.veins) g.globalAlpha = 0;
  g.strokeStyle = css(ch.vein, 0.9);
  g.shadowColor = css(ch.vein, 1);
  g.shadowBlur = 12;
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  for (const [x0, y0, x1, y1, x2, y2] of [[176, 240, 170, 270, 182, 300], [214, 236, 222, 262, 212, 296], [196, 252, 200, 280, 190, 312]] as const) {
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke();
  }
  // Eyes: two faint slits, or glasses glints.
  if (ch.build.glasses) {
    g.strokeStyle = css(rim, 0.85);
    g.lineWidth = 2;
    g.strokeRect(150, 156, 36, 22);
    g.strokeRect(202, 156, 36, 22);
    g.beginPath(); g.moveTo(186, 164); g.lineTo(202, 164); g.stroke();
    g.fillStyle = css(0xffffff, 0.35);
    g.fillRect(154, 159, 10, 3);
    g.fillRect(206, 159, 10, 3);
  }
  g.globalAlpha = 1;
  g.fillStyle = css(style.veins || style.glowEyes ? ch.vein : 0xe8eef8, style.veins || style.glowEyes ? 0.9 : 0.5);
  g.shadowBlur = style.veins || style.glowEyes ? 16 : 0;
  g.fillRect(158, 166, 20, 3);
  g.fillRect(210, 166, 20, 3);
  g.restore();
  // Soft top-left light.
  const lg = g.createRadialGradient(60, 40, 10, 60, 40, 260);
  lg.addColorStop(0, 'rgba(255,255,255,0.10)');
  lg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = lg;
  g.fillRect(0, 0, 384, 384);
  return c;
}

function dot(scene: Phaser.Scene, key: string, r: number, soft: boolean) {
  const { c, g } = canvas(r * 2, r * 2);
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(soft ? 0.25 : 0.6, soft ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, r * 2, r * 2);
  addCanvas(scene, key, c);
}

function flake(scene: Phaser.Scene) {
  const { c, g } = canvas(32, 32);
  g.translate(16, 16);
  g.strokeStyle = 'rgba(255,255,255,0.95)';
  g.lineWidth = 2;
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    g.rotate(Math.PI / 3);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 12); g.moveTo(0, 7); g.lineTo(4, 10); g.moveTo(0, 7); g.lineTo(-4, 10); g.stroke();
  }
  addCanvas(scene, 'fx:flake', c);
}

function spark(scene: Phaser.Scene) {
  const { c, g } = canvas(48, 48);
  const gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.15, 'rgba(255,255,255,0.6)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 48, 48);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath(); g.moveTo(24, 0); g.lineTo(26, 22); g.lineTo(48, 24); g.lineTo(26, 26); g.lineTo(24, 48); g.lineTo(22, 26); g.lineTo(0, 24); g.lineTo(22, 22); g.fill();
  addCanvas(scene, 'fx:spark', c);
}

function shard(scene: Phaser.Scene) {
  const { c, g } = canvas(28, 40);
  const gr = g.createLinearGradient(0, 0, 28, 40);
  gr.addColorStop(0, '#e8fbff');
  gr.addColorStop(0.5, '#86d8ff');
  gr.addColorStop(1, '#8a6cff');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(14, 0); g.lineTo(26, 16); g.lineTo(14, 40); g.lineTo(2, 16); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.beginPath(); g.moveTo(14, 2); g.lineTo(18, 16); g.lineTo(14, 30); g.closePath(); g.fill();
  addCanvas(scene, 'gen:shard', c);
}

function rosoarFruit(scene: Phaser.Scene) {
  const { c, g } = canvas(256, 256);
  g.save();
  g.shadowColor = 'rgba(255,60,60,0.8)';
  g.shadowBlur = 40;
  const gr = g.createRadialGradient(110, 110, 10, 128, 140, 90);
  gr.addColorStop(0, '#ffb0a8');
  gr.addColorStop(0.35, '#e8323c');
  gr.addColorStop(1, '#5a0a1a');
  g.fillStyle = gr;
  g.beginPath(); g.arc(128, 140, 80, 0, Math.PI * 2); g.fill();
  g.restore();
  g.fillStyle = '#2e5a3a';
  g.beginPath(); g.ellipse(150, 58, 34, 12, -0.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(128, 64); g.lineTo(122, 40); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath(); g.ellipse(100, 108, 16, 26, -0.6, 0, Math.PI * 2); g.fill();
  addCanvas(scene, 'icon:gen:red_rosoar', c);
}

function feather(scene: Phaser.Scene) {
  const { c, g } = canvas(256, 256);
  g.translate(128, 128);
  g.rotate(-0.7);
  g.shadowColor = 'rgba(180,220,255,0.9)';
  g.shadowBlur = 30;
  const gr = g.createLinearGradient(0, -110, 0, 110);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(1, '#bcd4ee');
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(0, -112);
  g.bezierCurveTo(46, -60, 40, 60, 4, 104);
  g.lineTo(-4, 104);
  g.bezierCurveTo(-40, 60, -46, -60, 0, -112);
  g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(120,150,190,0.8)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, -100); g.lineTo(0, 120); g.stroke();
  g.lineWidth = 1;
  for (let y = -80; y < 90; y += 12) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(30, y - 14); g.moveTo(0, y); g.lineTo(-30, y - 14); g.stroke();
  }
  addCanvas(scene, 'icon:gen:feather', c);
}

function fragment(scene: Phaser.Scene) {
  const { c, g } = canvas(256, 256);
  const gr = g.createRadialGradient(128, 128, 4, 128, 128, 120);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.18, 'rgba(210,235,255,0.95)');
  gr.addColorStop(0.45, 'rgba(140,190,255,0.35)');
  gr.addColorStop(1, 'rgba(120,160,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(255,255,255,0.8)';
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.ellipse(128, 128, 70 - i * 12, 18 + i * 4, i * 0.8, 0, Math.PI * 2);
    g.stroke();
  }
  addCanvas(scene, 'icon:gen:fragment', c);
}

export function generateTextures(scene: Phaser.Scene): void {
  for (const id of Object.keys(CHARACTERS) as MemberId[]) {
    if (!hasOverride(`portraits/${id}.webp`)) addCanvas(scene, `portrait:gen:${id}`, drawPortrait(rigStyle(id)));
  }
  // Speakers without art get a silhouette portrait from their rig style.
  for (const sp of Object.values(SPEAKERS)) {
    const p = sp.portrait;
    if (!p?.startsWith('gen:')) continue;
    const id = p.slice(4);
    if (id in CHARACTERS || scene.textures.exists(`portrait:${p}`)) continue;
    addCanvas(scene, `portrait:${p}`, drawPortrait(rigStyle(id), 256));
  }
  dot(scene, 'fx:dot', 16, false);
  dot(scene, 'fx:soft', 64, true);
  flake(scene);
  spark(scene);
  shard(scene);
  rosoarFruit(scene);
  feather(scene);
  fragment(scene);
  const { c, g } = canvas(4, 4);
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 4, 4);
  addCanvas(scene, 'fx:px', c);
  // A rain streak and a small petal (tinted per use).
  {
    const { c, g } = canvas(4, 40);
    const gr = g.createLinearGradient(0, 0, 0, 40);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(1, 'rgba(255,255,255,0.9)');
    g.fillStyle = gr;
    g.fillRect(1, 0, 2, 40);
    addCanvas(scene, 'fx:streak', c);
  }
  {
    const { c, g } = canvas(24, 16);
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(12, 8, 10, 5, 0.3, 0, Math.PI * 2); g.fill();
    addCanvas(scene, 'fx:petal', c);
  }
}
