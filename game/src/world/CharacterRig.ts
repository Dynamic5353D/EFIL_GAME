/**
 * Procedural rim-lit silhouette for the playable characters (they have no art yet).
 * A small skeleton is posed every frame and drawn as capsules: first in the rim colour nudged toward
 * the light, then in the body colour on top, which leaves a crescent of light on one edge. Veins glow
 * in the character's colour, and a scarf trails with simple verlet physics.
 */
import Phaser from 'phaser';
import { rigStyle, type Hair, type RigStyle } from '../data/rigs';

export type RigState = 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'hurt' | 'attack' | 'interact' | 'battle' | 'cast' | 'ko' | 'dance' | 'sit' | 'kneel'
  // Staged scenes (StageScene):
  | 'talk' | 'phone' | 'think' | 'point' | 'cross';

interface Pose {
  lean: number; bob: number; head: number;
  thighF: number; shinF: number; thighB: number; shinB: number;
  armF: number; foreF: number; armB: number; foreB: number;
}

const ZERO: Pose = { lean: 0, bob: 0, head: 0, thighF: 0, shinF: 0, thighB: 0, shinB: 0, armF: 0, foreF: 0, armB: 0, foreB: 0 };

function mixPose(a: Pose, b: Pose, t: number): Pose {
  const o = { ...a };
  for (const k of Object.keys(a) as (keyof Pose)[]) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}

const mixColor = (a: number, b: number, t: number) => {
  const c = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return (c(16) << 16) | (c(8) << 8) | c(0);
};

export class CharacterRig {
  /**
   * How awake the four protagonists' powers are, 0..1: their glowing veins and eyes, and a rim light in
   * their power colour. 0 until the dance in Venture 1 (they look like anyone else), then it fades up.
   */
  static powers = 1;
  readonly g: Phaser.GameObjects.Graphics;
  readonly glow: Phaser.GameObjects.Graphics;
  state: RigState = 'idle';
  facing = 1;
  scale = 1;
  private t = 0;
  private phase = 0;
  private pose: Pose = { ...ZERO };
  private stateTime = 0;
  private scarf: { x: number; y: number; px: number; py: number }[] = [];
  private lastX = 0;
  private lastY = 0;
  /** Horizontal speed used for the run cycle and scarf (px/s). */
  speed = 0;
  vy = 0;
  alpha = 1;
  flash = 0;
  /** Hands cuffed together in front (Nithish, Ventures 11-12). */
  cuffed = false;
  private readonly body: number;
  private readonly rimVein: number;
  private readonly rimCiv: number;
  private readonly vein: number;
  private readonly cloth: number;
  private readonly hair: Hair;
  private readonly glasses: boolean;
  private readonly h: number;
  private readonly w: number;
  private readonly style: RigStyle;

  /** `who` is a party member id, an NPC rig id (data/rigs.ts) or a full style. */
  constructor(scene: Phaser.Scene, who: string | RigStyle, depth: number) {
    const c = typeof who === 'string' ? rigStyle(who) : who;
    this.style = c;
    this.body = c.body;
    this.vein = c.vein;
    // Protagonists are rim-lit in their vein colour; everyone else in a pale version of their clothes.
    this.rimVein = c.veins ? mixColor(c.vein, 0xffffff, 0.6) : mixColor(c.cloth, 0xdfe8f5, 0.62);
    this.rimCiv = mixColor(c.cloth, 0xdfe8f5, 0.62);
    this.cloth = c.cloth;
    this.hair = c.hair;
    this.glasses = !!c.glasses;
    this.h = c.height;
    this.w = c.width;
    this.g = scene.add.graphics().setDepth(depth);
    this.glow = scene.add.graphics().setDepth(depth + 1).setBlendMode(Phaser.BlendModes.ADD);
  }

  /** Power level for this rig: the protagonists follow `CharacterRig.powers`; the soldiers always glow. */
  private get pw() { return this.style.veins ? CharacterRig.powers : 0; }
  private get rim() { return this.style.veins ? mixColor(this.rimCiv, this.rimVein, this.pw) : this.rimCiv; }

  setState(s: RigState) {
    if (s !== this.state) { this.state = s; this.stateTime = 0; }
  }

  private target(): Pose {
    const p = this.phase, st = this.stateTime;
    switch (this.state) {
      case 'run': {
        const s = Math.sin(p), c = Math.cos(p);
        return {
          lean: 0.2, bob: Math.abs(c) * 3 - 1.5, head: -0.1,
          thighF: s * 0.95, shinF: s * 0.95 - Math.max(0, -c) * 1.4 - 0.2,
          thighB: -s * 0.95, shinB: -s * 0.95 - Math.max(0, c) * 1.4 - 0.2,
          armF: -s * 0.85, foreF: -s * 0.85 + 1.1, armB: s * 0.85, foreB: s * 0.85 + 1.1,
        };
      }
      case 'jump':
        return { ...ZERO, lean: 0.1, bob: -2, thighF: 1.0, shinF: 0.1, thighB: 0.25, shinB: -0.9, armF: -2.3, foreF: -2.6, armB: -1.6, foreB: -1.3, head: -0.1 };
      case 'fall':
        return { ...ZERO, lean: 0.05, thighF: 0.45, shinF: -0.2, thighB: -0.15, shinB: -0.7, armF: -1.9, foreF: -1.3, armB: -1.4, foreB: -0.8, head: 0.1 };
      case 'dash':
        return { ...ZERO, lean: 0.6, bob: 2, thighF: 1.1, shinF: 0.3, thighB: -0.9, shinB: -1.4, armF: -1.2, foreF: -0.8, armB: -1.5, foreB: -1.0, head: -0.3 };
      case 'hurt':
        return { ...ZERO, lean: -0.45, thighF: 0.5, shinF: 0.2, thighB: -0.3, shinB: -0.6, armF: 1.9, foreF: 2.4, armB: 1.5, foreB: 1.9, head: 0.4 };
      case 'attack': {
        const k = Math.min(1, st / 0.14);
        const swing = -1.8 + k * 3.6;
        return { ...ZERO, lean: 0.25, thighF: 0.5, shinF: 0.1, thighB: -0.4, shinB: -0.6, armF: swing, foreF: swing + 0.1, armB: -0.6, foreB: -0.2 };
      }
      case 'interact':
        return { ...ZERO, lean: 0.12, armF: 1.35, foreF: 1.5, armB: 0.1, foreB: 0.3, bob: Math.sin(this.t * 2) };
      case 'cast':
        return { ...ZERO, lean: 0.1, bob: -1, thighF: 0.3, shinF: 0.1, thighB: -0.3, shinB: -0.4, armF: 1.9, foreF: 1.7, armB: 1.2, foreB: 1.6, head: -0.15 };
      case 'ko':
        return { ...ZERO, lean: 1.3, bob: 22, thighF: 1.4, shinF: -0.4, thighB: 1.2, shinB: -1.2, armF: 0.9, foreF: 0.4, armB: 0.4, foreB: 0.2, head: 0.5 };
      case 'dance': {
        const b = Math.sin(this.t * 7.8), c = Math.cos(this.t * 3.9);
        return {
          lean: c * 0.12, bob: Math.abs(b) * 4 - 2, head: -c * 0.15,
          thighF: 0.25 + b * 0.35, shinF: -0.2 - Math.max(0, b) * 0.5, thighB: -0.2 - b * 0.3, shinB: -0.3 - Math.max(0, -b) * 0.5,
          armF: -2.2 + c * 0.9, foreF: -2.6 + c * 0.6, armB: -1.4 - c * 0.9, foreB: -1.0 - c * 0.7,
        };
      }
      case 'sit':
        return { ...ZERO, bob: 16, thighF: 1.5, shinF: 0, thighB: 1.4, shinB: -0.1, armF: 0.6, foreF: 1.3, armB: 0.4, foreB: 1.1, head: 0.2 + Math.sin(this.t * 1.2) * 0.03 };
      case 'kneel':
        return { ...ZERO, lean: 0.35, bob: 14, thighF: 1.4, shinF: -0.2, thighB: 0.1, shinB: -1.5, armF: 1.1, foreF: 1.3, armB: 0.6, foreB: 0.9, head: 0.4 };
      // Staging poses. Angles: 0 points down, positive swings toward the facing side, π points up.
      case 'talk': {
        const a = Math.sin(this.t * 3.2), b = Math.sin(this.t * 4.1 + 1);
        return { ...ZERO, bob: Math.sin(this.t * 1.8) * 0.8, head: Math.sin(this.t * 5) * 0.05, armF: 0.55 + a * 0.35, foreF: 1.45 + b * 0.4, armB: 0.1 + b * 0.08, foreB: 0.4, thighF: 0.05, thighB: -0.05 };
      }
      case 'phone':
        return { ...ZERO, bob: Math.sin(this.t * 1.6) * 0.6, head: -0.08, armF: 1.3, foreF: 3.7, armB: 0.05, foreB: 0.2, thighF: 0.05, thighB: -0.05 };
      case 'think':
        return { ...ZERO, bob: Math.sin(this.t * 1.2) * 0.5, head: 0.12, armF: 0.6, foreF: 3.1, armB: 0.7, foreB: 2.0, thighF: 0.05, thighB: -0.05 };
      case 'point':
        return { ...ZERO, lean: 0.06, bob: 0, head: -0.05, armF: 1.5, foreF: 1.6, armB: -0.1, foreB: 0.2, thighF: 0.25, shinF: 0.05, thighB: -0.2, shinB: -0.2 };
      case 'cross':
        return { ...ZERO, bob: Math.sin(this.t * 1.4) * 0.5, head: -0.04, armF: 0.45, foreF: 2.1, armB: 0.5, foreB: 2.3, thighF: 0.08, thighB: -0.08 };
      case 'battle':
        return { ...ZERO, lean: 0.1, bob: Math.sin(this.t * 2.4) * 1.2, thighF: 0.35, shinF: 0.05, thighB: -0.3, shinB: -0.45, armF: 0.5, foreF: 1.5, armB: 0.3, foreB: 1.3, head: 0 };
      default: {
        const b = Math.sin(this.t * 1.8);
        return { ...ZERO, bob: b * 0.8, armF: 0.08 + b * 0.03, foreF: 0.18, armB: -0.06, foreB: 0.14, head: b * 0.03, thighF: 0.05, thighB: -0.05 };
      }
    }
  }

  /** x, y are the feet position in world space. */
  update(dt: number, x: number, y: number) {
    this.t += dt;
    this.stateTime += dt;
    if (this.state === 'run') this.phase += dt * (6 + Math.abs(this.speed) / 34);
    const snap = this.state === 'attack' || this.state === 'dash' ? 0.6 : 0.25;
    const tgt = this.target();
    if (this.cuffed) { tgt.armF = 0.45; tgt.foreF = 1.25; tgt.armB = 0.55; tgt.foreB = 1.35; }
    this.pose = mixPose(this.pose, tgt, 1 - Math.pow(1 - snap, dt * 60));
    this.flash = Math.max(0, this.flash - dt * 4);
    this.draw(x, y, dt);
  }

  private draw(x: number, y: number, dt: number) {
    const g = this.g, gl = this.glow;
    g.clear();
    gl.clear();
    g.setAlpha(this.alpha);
    gl.setAlpha(this.alpha);
    const f = this.facing, S = this.scale * this.h, Wd = this.scale * this.w;
    const P = this.pose;
    // Local -> world. Angles: 0 points down, positive rotates toward the facing direction.
    const pt = (lx: number, ly: number) => ({ x: x + lx * f * Wd, y: y + ly * S });
    const hipY = -37 + P.bob;
    const hip = { x: 0, y: hipY };
    const torsoLen = 25;
    const chest = { x: Math.sin(P.lean) * torsoLen, y: hipY - Math.cos(P.lean) * torsoLen };
    const neck = { x: chest.x + Math.sin(P.lean + P.head) * 5, y: chest.y - Math.cos(P.lean + P.head) * 5 };
    const headC = { x: neck.x + Math.sin(P.lean + P.head) * 8.5, y: neck.y - Math.cos(P.lean + P.head) * 8.5 };
    const limb = (ox: number, oy: number, a1: number, l1: number, a2: number, l2: number) => {
      const j = { x: ox + Math.sin(a1) * l1, y: oy + Math.cos(a1) * l1 };
      const e = { x: j.x + Math.sin(a2) * l2, y: j.y + Math.cos(a2) * l2 };
      return [j, e] as const;
    };
    const [kneeF, footF] = limb(hip.x + 1.5, hip.y, P.thighF, 19, P.shinF, 19);
    const [kneeB, footB] = limb(hip.x - 1.5, hip.y, P.thighB, 19, P.shinB, 19);
    const sh = { x: chest.x + Math.sin(P.lean) * 2, y: chest.y + 3 };
    const [elbF, handF] = limb(sh.x + 2, sh.y, P.armF + P.lean * 0.5, 14, P.foreF + P.lean * 0.5, 14);
    const [elbB, handB] = limb(sh.x - 2, sh.y, P.armB + P.lean * 0.5, 14, P.foreB + P.lean * 0.5, 14);

    const cap = (a: { x: number; y: number }, b: { x: number; y: number }, r: number, dx = 0, dy = 0) => {
      const A = pt(a.x, a.y), B = pt(b.x, b.y);
      A.x += dx; A.y += dy; B.x += dx; B.y += dy;
      const rr = r * this.scale;
      const ang = Math.atan2(B.y - A.y, B.x - A.x) + Math.PI / 2;
      const ox = Math.cos(ang) * rr, oy = Math.sin(ang) * rr;
      g.fillCircle(A.x, A.y, rr);
      g.fillCircle(B.x, B.y, rr * 0.92);
      g.fillPoints([{ x: A.x + ox, y: A.y + oy }, { x: B.x + ox * 0.92, y: B.y + oy * 0.92 }, { x: B.x - ox * 0.92, y: B.y - oy * 0.92 }, { x: A.x - ox, y: A.y - oy }] as Phaser.Math.Vector2[], true);
    };
    const torso = (dx: number, dy: number) => {
      const lean = P.lean;
      const nx = Math.cos(lean), ny = Math.sin(lean);
      const pts = [
        pt(hip.x - 6 * nx, hip.y - 6 * ny), pt(hip.x + 6 * nx, hip.y + 6 * ny),
        pt(chest.x + 8.5 * nx, chest.y + 8.5 * ny), pt(chest.x - 7.5 * nx, chest.y - 7.5 * ny),
      ].map((p) => ({ x: p.x + dx, y: p.y + dy }));
      g.fillPoints(pts as Phaser.Math.Vector2[], true);
      const c = pt(chest.x, chest.y);
      g.fillEllipse(c.x + dx, c.y + dy + 2 * this.scale, 17 * this.scale * this.w, 11 * this.scale);
    };
    const head = (dx: number, dy: number) => {
      const c = pt(headC.x, headC.y);
      g.fillCircle(c.x + dx, c.y + dy, 8.2 * this.scale);
      // Hair mass.
      const hx = c.x + dx - f * 1.5 * this.scale, hy = c.y + dy - 2 * this.scale;
      if (this.hair === 'messy') {
        for (let i = 0; i < 5; i++) g.fillTriangle(hx - 8 * this.scale, hy, hx + 8 * this.scale, hy, hx + (i - 2) * 4.5 * this.scale - f * 5 * this.scale, hy - (8 + (i % 2) * 3) * this.scale);
        g.fillCircle(hx, hy - 2 * this.scale, 8 * this.scale);
      } else if (this.hair === 'ponytail') {
        g.fillCircle(hx, hy - 1 * this.scale, 8.6 * this.scale);
        const sw = Math.sin(this.t * 3 + this.speed * 0.01) * 3;
        g.fillTriangle(hx - f * 6 * this.scale, hy - 4 * this.scale, hx - f * 6 * this.scale, hy + 3 * this.scale, hx - f * (18 + Math.abs(this.speed) * 0.02) * this.scale, hy + (12 + sw) * this.scale);
      } else if (this.hair === 'long') {
        g.fillCircle(hx, hy - 1 * this.scale, 8.8 * this.scale);
        g.fillRect(hx - f * 9 * this.scale - (f < 0 ? 0 : 0), hy - 2 * this.scale, 9 * this.scale * f, 20 * this.scale);
      } else if (this.hair === 'bun') {
        g.fillCircle(hx, hy - 1 * this.scale, 8.5 * this.scale);
        g.fillCircle(hx - f * 7 * this.scale, hy - 6 * this.scale, 4.5 * this.scale);
      } else if (this.hair !== 'bald') {
        g.fillCircle(hx, hy - 2 * this.scale, 8.2 * this.scale);
      }
      if (this.style.cap !== undefined) {
        const cc = this.style.cap;
        g.fillStyle(cc, 1);
        g.fillEllipse(hx + f * 1 * this.scale, hy - 5 * this.scale, 19 * this.scale, 8 * this.scale);
        g.fillRect(hx - 8 * this.scale, hy - 10 * this.scale, 16 * this.scale, 5 * this.scale);
        g.fillEllipse(hx + f * 8 * this.scale, hy - 4 * this.scale, 10 * this.scale, 3 * this.scale);
      }
    };

    // --- scarf (verlet), anchored at the neck
    const anchor = pt(neck.x, neck.y + 2);
    if (!this.scarf.length) for (let i = 0; i < 7; i++) this.scarf.push({ x: anchor.x, y: anchor.y + i * 3, px: anchor.x, py: anchor.y + i * 3 });
    this.scarf[0]!.x = anchor.x; this.scarf[0]!.y = anchor.y;
    const wind = Math.sin(this.t * 1.7) * 18;
    for (let i = 1; i < this.scarf.length; i++) {
      const p = this.scarf[i]!;
      const vx = (p.x - p.px) * 0.9, vy = (p.y - p.py) * 0.9;
      p.px = p.x; p.py = p.y;
      p.x += vx + (wind - f * 30) * dt * dt * 60 * this.scale;
      p.y += vy + 260 * dt * dt * this.scale;
    }
    for (let it = 0; it < 3; it++) {
      for (let i = 1; i < this.scarf.length; i++) {
        const a = this.scarf[i - 1]!, b = this.scarf[i]!;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, L = 5 * this.scale;
        const k = (d - L) / d;
        b.x -= dx * k; b.y -= dy * k;
      }
    }
    this.lastX = x; this.lastY = y;

    // --- rim pass (offset toward upper-left light), then body pass
    const rimDx = -1.3 * this.scale, rimDy = -1.1 * this.scale;
    const body = this.flash > 0 ? mixColor(this.body, 0xffffff, this.flash) : this.body;
    const back = mixColor(body, 0x000000, 0.35);
    const drawAll = (col: number, backCol: number, dx: number, dy: number, alpha: number) => {
      g.fillStyle(backCol, alpha);
      cap(sh, elbB, 3.1, dx, dy); cap(elbB, handB, 2.7, dx, dy);
      cap(hip, kneeB, 4, dx, dy); cap(kneeB, footB, 3.3, dx, dy);
      g.fillStyle(col, alpha);
      torso(dx, dy);
      head(dx, dy);
      cap(hip, kneeF, 4.2, dx, dy); cap(kneeF, footF, 3.4, dx, dy);
      // feet
      const F1 = pt(footF.x + 2.5, footF.y), F2 = pt(footB.x + 2.5, footB.y);
      g.fillEllipse(F1.x + dx, F1.y + dy - 1, 9 * this.scale, 4.5 * this.scale);
      g.fillStyle(backCol, alpha);
      g.fillEllipse(F2.x + dx, F2.y + dy - 1, 9 * this.scale, 4.5 * this.scale);
      g.fillStyle(col, alpha);
      cap(sh, elbF, 3.2, dx, dy); cap(elbF, handF, 2.8, dx, dy);
    };
    drawAll(this.rim, mixColor(this.rim, 0x000000, 0.4), rimDx, rimDy, 0.9);
    drawAll(body, back, 0, 0, 1);

    // Clothes over the silhouette, a touch inside its edge so the dark outline and the rim light stay:
    // a shirt with sleeves, trousers. The four wear dark clothes; everyone else their own colour.
    const mid = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const shirt = this.style.veins ? mixColor(this.cloth, body, 0.7) : mixColor(this.style.cloth, body, 0.3);
    const uniform = this.style.cap !== undefined && this.style.cap === this.style.cloth;
    const pants = uniform ? mixColor(shirt, 0x000000, 0.18) : mixColor(0x26324a, body, this.style.veins ? 0.55 : 0.4);
    const dim = (c: number) => mixColor(c, 0x000000, 0.38);
    g.fillStyle(dim(shirt), 1);
    cap(sh, elbB, 2.7); cap(elbB, mid(elbB, handB, 0.55), 2.3);
    g.fillStyle(dim(pants), 1);
    cap(hip, kneeB, 3.6); cap(kneeB, mid(kneeB, footB, 0.82), 2.9);
    g.fillStyle(pants, 1);
    cap(hip, kneeF, 3.8); cap(kneeF, mid(kneeF, footF, 0.82), 3.0);
    g.fillStyle(shirt, 1);
    torso(0, 0);
    // A soft fold of light down the lit side of the shirt.
    g.fillStyle(mixColor(shirt, 0xffffff, 0.12), 0.55);
    cap(mid(hip, chest, 0.2), mid(hip, chest, 0.85), 2.2, -2.4 * this.scale * f, 0);
    g.fillStyle(shirt, 1);
    cap(sh, elbF, 2.8); cap(elbF, mid(elbF, handF, 0.55), 2.4);
    if (!this.style.scarf) {
      // Collar.
      const c = pt(neck.x, neck.y + 2.5);
      g.fillStyle(mixColor(shirt, 0xffffff, 0.18), 1);
      g.fillEllipse(c.x, c.y, 11 * this.scale * this.w, 4 * this.scale);
    }
    if (this.style.scarf) g.lineStyle(4.2 * this.scale, this.cloth, 1);
    else g.lineStyle(0, 0, 0);
    g.beginPath();
    this.scarf.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    if (this.style.scarf) {
      g.strokePath();
      g.lineStyle(1.2 * this.scale, mixColor(this.cloth, 0xffffff, 0.35), 0.8);
      g.beginPath();
      this.scarf.forEach((p, i) => (i ? g.lineTo(p.x, p.y - 1.5) : g.moveTo(p.x, p.y - 1.5)));
      g.strokePath();
    }

    // Glasses glint / eyes.
    const hc = pt(headC.x, headC.y);
    const eyeX = hc.x + f * 3.5 * this.scale, eyeY = hc.y - 0.5 * this.scale;
    if (this.glasses) {
      g.lineStyle(1.1 * this.scale, this.rim, 0.9);
      g.strokeRect(eyeX - 2.5 * this.scale, eyeY - 1.8 * this.scale, 5 * this.scale, 3.4 * this.scale);
    }
    if ((this.style.veins && this.pw > 0.05) || this.style.glowEyes) {
      gl.fillStyle(this.vein, 0.95 * (this.style.glowEyes ? 1 : this.pw));
      gl.fillRect(eyeX - 1.6 * this.scale, eyeY - 0.5 * this.scale, 3.2 * this.scale, 1.2 * this.scale);
      if (this.style.glowEyes) { gl.fillStyle(this.vein, 0.35); gl.fillCircle(eyeX, eyeY, 4 * this.scale); }
    } else {
      g.fillStyle(0xe8eef8, 0.55);
      g.fillRect(eyeX - 1.2 * this.scale, eyeY - 0.4 * this.scale, 2.4 * this.scale, 1 * this.scale);
    }
    const pw = this.pw;
    if (!this.style.veins || pw <= 0.01) return;

    // Veins: glowing lines along the forearms and neck, plus a soft halo.
    const vein = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const A = pt(a.x, a.y), B = pt(b.x, b.y);
      gl.lineStyle(4 * this.scale, this.vein, 0.18 * pw);
      gl.lineBetween(A.x, A.y, B.x, B.y);
      gl.lineStyle(1.1 * this.scale, this.vein, 0.95 * pw);
      gl.lineBetween(A.x, A.y, B.x, B.y);
    };
    vein(elbF, handF);
    vein({ x: neck.x, y: neck.y + 1 }, { x: chest.x + 1, y: chest.y + 8 });
    const hF = pt(handF.x, handF.y);
    gl.fillStyle(this.vein, 0.35 * pw);
    gl.fillCircle(hF.x, hF.y, 3.2 * this.scale);
  }

  /** World position of the front hand (for effects). */
  handPos(x: number, y: number) {
    return { x: x + this.facing * 16 * this.scale, y: y - 50 * this.scale * this.h };
  }

  setVisible(v: boolean) { this.g.setVisible(v); this.glow.setVisible(v); }

  destroy() { this.g.destroy(); this.glow.destroy(); }
}
