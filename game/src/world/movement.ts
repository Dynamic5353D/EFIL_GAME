/**
 * Movement tuning (px, seconds), shared by the Player and the reachability checker (reach.ts).
 *
 * Level-design rule that follows from these numbers (TILE = 40 px):
 * - a held single jump rises about 4.7 tiles, so ledges up to 4 tiles above you are reachable;
 * - 5 tiles or more needs the Acanus leap (double jump), which adds about 3.5 tiles.
 */
export const MOVE = {
  run: 290,
  sprint: 410,
  accelGround: 2600,
  accelAir: 1700,
  decelGround: 3000,
  gravity: 2150,
  fallMult: 1.35,
  maxFall: 960,
  jump: 900,
  doubleJump: 780,
  jumpCut: 0.45,
  coyote: 0.1,
  buffer: 0.12,
  dashSpeed: 640,
  dashTime: 0.16,
  dashCooldown: 0.35,
};

/** How high a jump rises (px) with jump held all the way. */
export const jumpHeight = (v: number) => (v * v) / (2 * MOVE.gravity);
