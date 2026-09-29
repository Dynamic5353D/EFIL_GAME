/**
 * Movement tuning (px, seconds), shared by the Player and the reachability checker (reach.ts).
 *
 * Level-design rule that follows from these numbers (TILE = 40 px):
 * - a held single jump rises about 4.7 tiles; the double jump (a basic move) adds about 3.5 more,
 *   so ledges up to 7 tiles above you are reachable. Anything higher needs a later ability.
 * - the Acanus glide caps the fall speed while jump is held, for long gaps.
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
  glideFall: 130,
};

/** How high a jump rises (px) with jump held all the way. */
export const jumpHeight = (v: number) => (v * v) / (2 * MOVE.gravity);
