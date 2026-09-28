/** Weather and ambient particles per room (plan.md, Visual approach 1). Screen-space, so cost is flat. */
import Phaser from 'phaser';
import { settings } from '../core/Settings';
import type { RoomDef } from './RoomDef';
import { DEPTH } from './Scenery';

const VW = 1280, VH = 720;

export function addWeather(scene: Phaser.Scene, room: RoomDef, tint: number): Phaser.GameObjects.GameObject[] {
  const calm = settings.get('reducedMotion') ? 0.4 : 1;
  const out: Phaser.GameObjects.GameObject[] = [];
  const add = (key: string, cfg: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig, depth: number, sf: number) => {
    const e = scene.add.particles(0, 0, key, cfg).setDepth(depth).setScrollFactor(sf);
    out.push(e);
    return e;
  };
  for (const w of room.weather) {
    switch (w) {
      case 'snow':
      case 'heavy_snow': {
        const heavy = w === 'heavy_snow';
        // Far flakes: small, slow, behind the play space.
        add('fx:dot', {
          x: { min: -60, max: VW + 60 }, y: -10, lifespan: 12000, speedY: { min: 25, max: 50 }, speedX: { min: -15, max: 20 },
          scale: { min: 0.06, max: 0.14 }, alpha: { start: 0.7, end: 0.2 }, frequency: (heavy ? 40 : 90) / calm, tint: 0xeaf4ff,
        }, DEPTH.fog + 1, 0);
        // Near flakes: bigger, faster, in front of everything.
        add('fx:flake', {
          x: { min: -100, max: VW + 100 }, y: -20, lifespan: 5000, speedY: { min: 90, max: 160 }, speedX: { min: -40, max: 30 },
          scale: { min: 0.25, max: 0.55 }, alpha: { start: 0.9, end: 0.3 }, rotate: { min: 0, max: 360 },
          frequency: (heavy ? 60 : 200) / calm, tint: 0xf4f9ff,
        }, DEPTH.weather, 0);
        break;
      }
      case 'motes':
        add('fx:soft', {
          x: { min: 0, max: VW }, y: { min: 0, max: VH }, lifespan: { min: 5000, max: 9000 }, speed: { min: 4, max: 18 },
          scale: { start: 0, end: 0.12, ease: 'Sine.Out' }, alpha: { start: 0.9, end: 0 }, frequency: 260 / calm,
          tint: tint, blendMode: Phaser.BlendModes.ADD,
        }, DEPTH.fx, 0);
        break;
      case 'beads':
        // The Winter Path's glowing beads, drifting down from the arching branches.
        add('fx:soft', {
          x: { min: 0, max: VW }, y: { min: -20, max: VH * 0.5 }, lifespan: { min: 6000, max: 10000 }, speedY: { min: 6, max: 22 },
          speedX: { min: -8, max: 8 }, scale: { start: 0.02, end: 0.09 }, alpha: { onEmit: () => 0, onUpdate: (_p, _k, t) => Math.sin(t * Math.PI) },
          frequency: 180 / calm, tint: [0xbff0ff, 0xd9c8ff, 0xfff0c8], blendMode: Phaser.BlendModes.ADD,
        }, DEPTH.fx, 0);
        break;
      case 'rain':
        // Slanted streaks, far and near, and a cool haze.
        add('fx:streak', {
          x: { min: -100, max: VW + 200 }, y: -40, lifespan: 1400, speedY: { min: 700, max: 900 }, speedX: -140, rotate: 10,
          scale: { min: 0.3, max: 0.6 }, alpha: { start: 0.35, end: 0.2 }, frequency: 12 / calm, tint: 0xbcd4f0,
        }, DEPTH.fog + 1, 0);
        add('fx:streak', {
          x: { min: -100, max: VW + 200 }, y: -40, lifespan: 1000, speedY: { min: 1100, max: 1400 }, speedX: -220, rotate: 10,
          scale: { min: 0.8, max: 1.3 }, alpha: { start: 0.5, end: 0.3 }, frequency: 30 / calm, tint: 0xdfeaff,
        }, DEPTH.weather, 0);
        break;
      case 'petals':
        // Copper-pod blossoms drifting down.
        add('fx:petal', {
          x: { min: -50, max: VW + 50 }, y: -20, lifespan: 9000, speedY: { min: 30, max: 60 }, speedX: { min: -30, max: 30 },
          scale: { min: 0.35, max: 0.7 }, rotate: { start: 0, end: 540 }, alpha: { start: 0.95, end: 0.6 },
          frequency: 420 / calm, tint: [0xf2c53a, 0xf6d860, 0xe8a820],
        }, DEPTH.weather, 0);
        break;
      case 'smoke':
        add('fx:soft', {
          x: { min: 0, max: VW }, y: VH + 40, lifespan: 9000, speedY: { min: -60, max: -30 }, speedX: { min: -10, max: 20 },
          scale: { start: 2, end: 6 }, alpha: { onEmit: () => 0, onUpdate: (_p, _k, t) => Math.sin(t * Math.PI) * 0.22 },
          frequency: 240 / calm, tint: 0x2a2428,
        }, DEPTH.fog + 2, 0);
        break;
      case 'embers':
        add('fx:soft', {
          x: { min: 0, max: VW }, y: VH + 10, lifespan: { min: 2500, max: 5000 }, speedY: { min: -140, max: -60 }, speedX: { min: -30, max: 30 },
          scale: { start: 0.08, end: 0 }, alpha: { start: 1, end: 0 }, frequency: 70 / calm, tint: [0xff9a3a, 0xffcf6a, 0xff5a2a],
          blendMode: Phaser.BlendModes.ADD,
        }, DEPTH.fx, 0);
        break;
      case 'dust':
        add('fx:soft', {
          x: { min: 0, max: VW }, y: { min: 0, max: VH }, lifespan: { min: 6000, max: 11000 }, speed: { min: 3, max: 10 },
          scale: { start: 0, end: 0.06, ease: 'Sine.Out' }, alpha: { start: 0.7, end: 0 }, frequency: 300 / calm,
          tint: 0xffe8c0, blendMode: Phaser.BlendModes.ADD,
        }, DEPTH.fx, 0);
        break;
      case 'mist':
        add('fx:soft', {
          x: { min: -200, max: VW }, y: { min: VH * 0.45, max: VH }, lifespan: 14000, speedX: { min: 8, max: 24 },
          scale: { min: 2.5, max: 4.5 }, alpha: { onEmit: () => 0, onUpdate: (_p, _k, t) => Math.sin(t * Math.PI) * 0.14 }, frequency: 900 / calm, tint: 0xdfeeff,
        }, DEPTH.fog + 2, 0);
        break;
    }
  }
  return out;
}
