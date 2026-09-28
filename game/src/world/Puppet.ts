/**
 * Brings a static cut-out to life with a Mesh2D grid that is re-shaped every frame: breathing,
 * sway that grows toward the top, a travelling ripple (for the Vales' vines), squash on hits and
 * lunges. Optional glowing eyes follow the deformation.
 */
import Phaser from 'phaser';
import { texKey } from '../core/Assets';

export interface PuppetOpts {
  height: number;
  cols?: number;
  rows?: number;
  sway?: number;      // px at the top
  breathe?: number;   // fraction
  ripple?: number;    // px
  speed?: number;
  eyes?: { x: number; y: number; color: number }[];
  blend?: 'add';
  depth?: number;
  lit?: boolean;
}

export class Puppet {
  readonly mesh: Phaser.GameObjects.Mesh2D;
  private rest: number[] = [];
  private w: number;
  private h: number;
  private t = Math.random() * 10;
  private squash = 0;
  private squashV = 0;
  flip = false;
  eyes: Phaser.GameObjects.Image[] = [];
  private eyeDefs: { x: number; y: number; color: number }[];
  private flashT = 0;
  private flashFilter: Phaser.Filters.ColorMatrix | null = null;
  lean = 0;

  constructor(private scene: Phaser.Scene, slug: string, x: number, y: number, private o: PuppetOpts) {
    const key = texKey.cut(slug);
    const frame = scene.textures.getFrame(key);
    const aspect = frame.width / frame.height;
    this.h = o.height;
    this.w = o.height * aspect;
    const cols = o.cols ?? 6, rows = o.rows ?? 10;
    const verts: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const u = i / cols, v = j / rows; // v = 0 at the top of the image
        const lx = (u - 0.5) * this.w, ly = -this.h + v * this.h;
        verts.push(lx, ly, u, 1 - v);
        this.rest.push(lx, ly);
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
        idx.push(a, c, b, 0, b, c, d, 0);
      }
    }
    this.mesh = scene.add.mesh2d(x, y, key, verts, idx);
    this.mesh.buildOrderedIndices(1, true);
    if (o.depth !== undefined) this.mesh.setDepth(o.depth);
    if (o.blend === 'add') this.mesh.setBlendMode(Phaser.BlendModes.ADD);
    if (o.lit) this.mesh.setLighting(true);
    this.eyeDefs = o.eyes ?? [];
    for (const e of this.eyeDefs) {
      const img = scene.add.image(x, y, 'fx:soft').setBlendMode(Phaser.BlendModes.ADD).setTint(e.color).setScale(0.22 * (o.height / 250));
      if (o.depth !== undefined) img.setDepth(o.depth + 1);
      this.eyes.push(img);
    }
  }

  get x() { return this.mesh.x; }
  get y() { return this.mesh.y; }
  get width() { return this.w; }
  get height() { return this.h; }

  setPosition(x: number, y: number) { this.mesh.setPosition(x, y); return this; }

  /** A springy squash (positive = flatten), e.g. 0.25 on a hit. */
  hit(amount = 0.22) { this.squashV += amount * 14; this.flashT = 0.12; }

  setAlpha(a: number) { this.mesh.setAlpha(a); this.eyes.forEach((e) => e.setAlpha(a)); }
  setVisible(v: boolean) { this.mesh.setVisible(v); this.eyes.forEach((e) => e.setVisible(v)); }

  private deform(lx: number, ly: number, out: { x: number; y: number }) {
    const o = this.o;
    const k = -ly / this.h; // 0 bottom .. 1 top
    const t = this.t * (o.speed ?? 1);
    const sway = Math.sin(t * 1.3) * (o.sway ?? 6) * k * k + this.lean * this.h * 0.35 * k;
    const ripple = Math.sin(t * 3.1 + ly * 0.045) * (o.ripple ?? 0) * k;
    const breathe = 1 + Math.sin(t * 2.1) * (o.breathe ?? 0.015) * k;
    const sq = this.squash;
    out.x = (lx * (1 + sq * 0.6) + sway + ripple) * (this.flip ? -1 : 1);
    out.y = ly * breathe * (1 - sq);
  }

  update(dt: number) {
    this.t += dt;
    // Damped spring for squash.
    this.squashV += (-this.squash * 180 - this.squashV * 14) * dt;
    this.squash += this.squashV * dt;
    const v = this.mesh.vertices;
    const p = { x: 0, y: 0 };
    for (let i = 0, n = this.rest.length / 2; i < n; i++) {
      this.deform(this.rest[i * 2]!, this.rest[i * 2 + 1]!, p);
      v[i * 4] = p.x;
      v[i * 4 + 1] = p.y;
    }
    this.flashT = Math.max(0, this.flashT - dt);
    // Mesh2D has no tint, so the hit flash is a colour-matrix filter, created on the first hit.
    if (this.flashT > 0 && !this.flashFilter) {
      this.mesh.enableFilters();
      this.flashFilter = this.mesh.filters!.internal.addColorMatrix();
      this.flashFilter.colorMatrix.brightness(2.6);
    }
    this.flashFilter?.setActive(this.flashT > 0);
    this.eyeDefs.forEach((e, i) => {
      this.deform((e.x - 0.5) * this.w, -this.h + e.y * this.h, p);
      const img = this.eyes[i]!;
      img.setPosition(this.mesh.x + p.x * this.mesh.scaleX, this.mesh.y + p.y * this.mesh.scaleY);
      img.setAlpha(this.mesh.alpha * (0.75 + Math.sin(this.t * 5 + i) * 0.25));
    });
  }

  destroy() { this.mesh.destroy(); this.eyes.forEach((e) => e.destroy()); }
}
