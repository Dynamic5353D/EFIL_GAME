import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { input } from '../core/Input';
import type { MemberId } from '../data/characters';
import { CharacterRig } from './CharacterRig';
import { MOVE } from './movement';
import { DEPTH } from './Scenery';

export { MOVE };

export class Player {
  readonly body: Phaser.Physics.Arcade.Image;
  readonly rig: CharacterRig;
  facing = 1;
  locked = false;
  abilities = new Set<string>();
  private sinceGround = 99;
  private bufferT = 99;
  private jumping = false;
  private usedDouble = false;
  private dashT = 0;
  private dashCd = 0;
  private airDashUsed = false;
  private attackT = 0;
  private hurtT = 0;
  invuln = 0;
  private wasGround = true;
  /** Last safe place to stand, for respawning after hazards. */
  safe = { x: 0, y: 0 };
  private safeT = 0;
  dropThrough = 0;
  gliding = false;
  /** Scales running speed (Ragul's dizzy walk in V3). */
  speedMul = 1;
  onAttack: ((hitbox: Phaser.Geom.Rectangle) => void) | null = null;
  private dust: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(private scene: Phaser.Scene, x: number, y: number, member: MemberId | string) {
    this.body = scene.physics.add.image(x, y - 32, 'fx:px').setVisible(false);
    this.body.setSize(4, 4);
    const b = this.body.body as Phaser.Physics.Arcade.Body;
    b.setSize(26, 62);
    b.setOffset(-11, -29);
    b.setMaxVelocityY(MOVE.maxFall);
    b.setCollideWorldBounds(true);
    this.rig = new CharacterRig(scene, member, DEPTH.player);
    this.safe = { x, y };
    this.dust = scene.add.particles(0, 0, 'fx:dot', {
      lifespan: 450, speed: { min: 20, max: 90 }, angle: { min: 200, max: 340 }, scale: { start: 0.28, end: 0 },
      alpha: { start: 0.7, end: 0 }, tint: 0xe8f4ff, gravityY: 120, emitting: false,
    }).setDepth(DEPTH.fx);
  }

  get arcade() { return this.body.body as Phaser.Physics.Arcade.Body; }
  get x() { return this.body.x; }
  /** Feet y. */
  get y() { return this.arcade.bottom; }
  get onGround() { return this.arcade.blocked.down || this.arcade.touching.down; }

  setMember(id: MemberId | string) {
    this.rig.destroy();
    (this as { rig: CharacterRig }).rig = new CharacterRig(this.scene, id, DEPTH.player);
  }

  teleport(x: number, feetY: number) {
    this.body.setPosition(x, feetY - 31);
    this.arcade.reset(x, feetY - 31);
    this.arcade.setVelocity(0, 0);
    this.safe = { x, y: feetY };
  }

  hurt(fromX: number) {
    if (this.invuln > 0) return false;
    this.hurtT = 0.35;
    this.invuln = 1.1;
    this.arcade.setVelocity((this.x < fromX ? -1 : 1) * 320, -420);
    this.rig.flash = 1;
    audio.sfx('hurt');
    return true;
  }

  update(dt: number) {
    const b = this.arcade;
    const ground = this.onGround;
    const can = (a: string) => this.abilities.has(a);
    this.sinceGround = ground ? 0 : this.sinceGround + dt;
    this.bufferT += dt;
    this.dashCd -= dt;
    this.attackT -= dt;
    this.hurtT -= dt;
    this.invuln -= dt;
    this.dropThrough -= dt;
    if (ground) { this.usedDouble = false; this.airDashUsed = false; this.jumping = false; }
    if (ground && !this.wasGround && b.velocity.y >= 0) {
      audio.sfx('land');
      this.dust.explode(6, this.x, this.y);
    }
    this.wasGround = ground;
    if (ground) {
      this.safeT += dt;
      if (this.safeT > 0.25) this.safe = { x: this.x, y: this.y };
    } else this.safeT = 0;

    const ctl = !this.locked && this.hurtT <= 0;
    const ax = ctl ? input.axisX : 0;

    // Dash (tap) — a burst that ignores gravity.
    if (ctl && input.pressed('dash') && can('dash') && this.dashCd <= 0 && (ground || !this.airDashUsed)) {
      this.dashT = MOVE.dashTime;
      this.dashCd = MOVE.dashCooldown + MOVE.dashTime;
      if (!ground) this.airDashUsed = true;
      if (ax) this.facing = Math.sign(ax);
      audio.sfx('dash');
      this.dust.explode(8, this.x, this.y - 20);
    }
    if (this.dashT > 0) {
      this.dashT -= dt;
      b.setAllowGravity(false);
      b.setVelocity(this.facing * MOVE.dashSpeed, 0);
    } else {
      b.setAllowGravity(true);
      // Horizontal: accelerate toward the target speed.
      const sprint = ctl && can('sprint') && input.isDown('dash') && ground ? MOVE.sprint : MOVE.run;
      const target = ax * (Math.abs(b.velocity.x) > MOVE.run + 10 && !ground ? Math.abs(b.velocity.x) : sprint) * this.speedMul;
      const accel = ground ? (ax ? MOVE.accelGround : MOVE.decelGround) : MOVE.accelAir;
      const dv = target - b.velocity.x;
      b.setVelocityX(b.velocity.x + Math.sign(dv) * Math.min(Math.abs(dv), accel * dt));
      if (ax && this.attackT <= 0) this.facing = Math.sign(ax);

      // Jump: buffered presses, coyote time, variable height, Acanus leap.
      if (ctl && input.pressed('jump')) {
        if (input.isDown('down') && ground) this.dropThrough = 0.25;
        else this.bufferT = 0;
      }
      if (this.bufferT < MOVE.buffer && this.sinceGround < MOVE.coyote && !this.jumping) {
        b.setVelocityY(-MOVE.jump);
        this.jumping = true;
        this.bufferT = 99;
        this.sinceGround = 99;
        audio.sfx('jump');
        this.dust.explode(5, this.x, this.y);
      } else if (this.bufferT < 0.02 && !ground && this.sinceGround >= MOVE.coyote && can('double_jump') && !this.usedDouble) {
        b.setVelocityY(-MOVE.doubleJump);
        this.usedDouble = true;
        this.jumping = true;
        this.bufferT = 99;
        audio.sfx('jump', 1.3);
        this.featherPuff();
      }
      if (input.released('jump') && b.velocity.y < 0 && this.jumping) b.setVelocityY(b.velocity.y * MOVE.jumpCut);
      b.setGravityY(b.velocity.y > 0 ? MOVE.gravity * (MOVE.fallMult - 1) : 0);
      // Acanus glide: holding jump while falling caps the fall speed.
      this.gliding = ctl && !ground && can('glide') && input.isDown('jump') && b.velocity.y > MOVE.glideFall;
      if (this.gliding) b.setVelocityY(MOVE.glideFall);
    }

    // Attack: a quick swipe in front. Hitting an enemy starts a battle with the first move.
    if (ctl && input.pressed('attack') && this.attackT <= -0.15) {
      this.attackT = 0.22;
      audio.sfx('slash');
      this.onAttack?.(new Phaser.Geom.Rectangle(this.x + (this.facing > 0 ? 0 : -70), this.y - 60, 70, 56));
    }

    // Rig state.
    const r = this.rig;
    r.facing = this.facing;
    r.speed = b.velocity.x;
    r.vy = b.velocity.y;
    if (this.hurtT > 0) r.setState('hurt');
    else if (this.dashT > 0) r.setState('dash');
    else if (this.attackT > 0) r.setState('attack');
    else if (!ground) r.setState(b.velocity.y < 0 ? 'jump' : 'fall');
    else if (Math.abs(b.velocity.x) > 30) r.setState('run');
    else r.setState(this.locked ? 'idle' : 'idle');
    r.alpha = this.invuln > 0 && Math.floor(this.invuln * 14) % 2 === 0 ? 0.45 : 1;
    r.update(dt, this.x, this.y);
  }

  private featherPuff() {
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.image(this.x + (Math.random() - 0.5) * 30, this.y - 10, 'fx:soft').setScale(0.12).setTint(0xeaf6ff).setDepth(DEPTH.fx).setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({ targets: p, y: p.y + 30 + Math.random() * 30, x: p.x + (Math.random() - 0.5) * 40, alpha: 0, scale: 0.02, duration: 500, onComplete: () => p.destroy() });
    }
  }

  destroy() { this.rig.destroy(); this.body.destroy(); this.dust.destroy(); }
}
