import Phaser from 'phaser';
import type { Dir } from '../../core/GameState';
import { TILE, WALK_MS } from '../config';

export const DIRS: Dir[] = ['down', 'up', 'left', 'right'];
export const DELTA: Record<Dir, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };

export const opposite = (d: Dir): Dir => ({ down: 'up', up: 'down', left: 'right', right: 'left' } as const)[d];

/**
 * Someone who walks the grid: the player or an NPC. The sprite's feet sit on the tile's bottom edge;
 * depth is the feet's y, so people and props sort by how far down the screen they stand.
 */
export class Walker {
  readonly sprite: Phaser.GameObjects.Sprite;
  tx: number;
  ty: number;
  dir: Dir;
  moving = false;
  private stepParity = 0;

  constructor(private scene: Phaser.Scene, readonly sheet: string, tx: number, ty: number, dir: Dir) {
    this.tx = tx;
    this.ty = ty;
    this.dir = dir;
    this.sprite = scene.add.sprite(0, 0, `char-${sheet}`, ROW[dir] * 3).setOrigin(0.5, 1);
    this.place();
  }

  get px() { return this.tx * TILE + TILE / 2; }
  get py() { return this.ty * TILE + TILE; }

  place(): void {
    this.sprite.setPosition(this.px, this.py);
    this.sprite.setDepth(this.py);
    this.stand();
  }

  face(d: Dir): void {
    this.dir = d;
    if (!this.moving) this.stand();
  }

  stand(): void {
    this.sprite.setFrame(ROW[this.dir] * 3);
  }

  /** Steps one tile in `d` (the caller has checked it is free). Resolves when the step lands. */
  step(d: Dir, ms = WALK_MS): Promise<void> {
    this.dir = d;
    this.moving = true;
    const [dx, dy] = DELTA[d];
    this.tx += dx;
    this.ty += dy;
    const frame = ROW[d] * 3 + 1 + (this.stepParity++ % 2);
    this.sprite.setFrame(frame);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.px,
        y: this.py,
        duration: ms,
        onUpdate: (tw) => {
          this.sprite.setDepth(this.sprite.y);
          if (tw.progress > 0.5) this.sprite.setFrame(ROW[this.dir] * 3);
        },
        onComplete: () => {
          this.moving = false;
          this.sprite.setPosition(this.px, this.py);
          this.sprite.setDepth(this.py);
          resolve();
        },
      });
    });
  }

  /** The tile in front. */
  ahead(): [number, number] {
    const [dx, dy] = DELTA[this.dir];
    return [this.tx + dx, this.ty + dy];
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
