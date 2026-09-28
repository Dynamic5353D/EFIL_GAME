/**
 * Builds everything visible and solid in a room: parallax scenery, painted terrain, platforms,
 * spikes, lighting, weather and the per-room colour grade.
 */
import Phaser from 'phaser';
import { assets } from '../core/Assets';
import { earthLedge } from './EarthProps';
import { ensureEarthTextures } from './EarthPainter';
import { hexRgb, luma, mixRgb, rgbInt } from './Paint';
import { ledge, spikes } from './Props';
import { mergeTiles, TILE, type Rect, type RoomDef } from './RoomDef';
import { DEPTH, Scenery } from './Scenery';
import { paintTerrain, CHUNK } from './TerrainPainter';
import { addWeather } from './Weather';

export interface RoomPhysics {
  solids: Phaser.Physics.Arcade.StaticGroup;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  spikes: Rect[];
  /** Fire tiles ('x'): they burn like spikes. */
  fires: Rect[];
}

/** A 4×5 colour matrix that pulls colours toward `tint` by `amount`, keeping their brightness. */
export function tintMatrix(tint: number, amount: number): number[] {
  const [r, g, b] = hexRgb(tint).map((v) => v / 255) as [number, number, number];
  const k = 1 / Math.max(r, g, b, 0.01);
  const t = [r * k, g * k, b * k];
  const L = [0.2126, 0.7152, 0.0722];
  const m: number[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) m.push((row === col ? 1 - amount : 0) + amount * t[row]! * L[col]!);
    m.push(0, 0);
  }
  m.push(0, 0, 0, 1, 0);
  return m;
}

/** Adds the room's colour grade (brightness, saturation, contrast, tint) to a filter list. */
export function addGrade(list: Phaser.GameObjects.Components.FilterList, grade: RoomDef['grade']) {
  const cm = list.addColorMatrix();
  cm.colorMatrix.brightness(grade.brightness);
  cm.colorMatrix.saturate(grade.saturation - 1, true);
  cm.colorMatrix.contrast(grade.contrast, true);
  if (grade.tint !== undefined && grade.tintAmount) cm.colorMatrix.multiply(tintMatrix(grade.tint, grade.tintAmount), true);
  return cm;
}

export function applyGrade(cam: Phaser.Cameras.Scene2D.Camera, grade: RoomDef['grade'], vignette = true) {
  cam.filters.internal.clear();
  cam.filters.external.clear();
  const cm = addGrade(cam.filters.internal, grade);
  if (vignette) cam.filters.external.addVignette(0.5, 0.5, 0.8, 0.45);
  return cm;
}

export function buildRoom(scene: Phaser.Scene, room: RoomDef): RoomPhysics {
  const pal = assets.palette(room.palette);
  const roomW = room.cols * TILE, roomH = room.rows * TILE;
  const earth = room.backdrop.startsWith('gen:');
  ensureEarthTextures(scene, room.backdrop);

  new Scenery(scene, room).build();

  // Terrain, painted once into canvas chunks and lit by the room lights.
  // Textures outlive the scene, so a room is painted once per session.
  const chunks = Math.ceil(roomW / CHUNK);
  if (!scene.textures.exists(`terrain:${room.id}:0`)) {
    paintTerrain(room.grid, pal, room.id.length * 131 + room.cols, room.terrain ?? (earth ? 'concrete' : 'snow')).canvases.forEach((c, i) => scene.textures.addCanvas(`terrain:${room.id}:${i}`, c));
  }
  for (let i = 0; i < chunks; i++) scene.add.image(i * CHUNK, 0, `terrain:${room.id}:${i}`).setOrigin(0).setDepth(DEPTH.terrain).setLighting(true);

  const solids = scene.physics.add.staticGroup();
  for (const r of mergeTiles(room.grid, '#')) {
    const z = scene.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
    solids.add(z);
  }
  const platforms = scene.physics.add.staticGroup();
  for (const r of mergeTiles(room.grid, '=')) {
    for (let row = 0; row < r.h / TILE; row++) {
      const y = r.y + row * TILE;
      const z = scene.add.zone(r.x + r.w / 2, y + 7, r.w, 14);
      platforms.add(z);
      const tex = earth ? earthLedge(scene, r.w, room.terrain === 'wood' || room.terrain === 'grass') : ledge(scene, r.w, pal);
      scene.add.image(r.x - 10, y - 4, tex).setOrigin(0).setDepth(DEPTH.terrain + 1).setLighting(true);
    }
  }
  const spikeRects = mergeTiles(room.grid, '^');
  for (const r of spikeRects) scene.add.image(r.x, r.y + r.h - 44, spikes(scene, r.w)).setOrigin(0).setDepth(DEPTH.terrain + 1).setLighting(true);
  const fireRects = mergeTiles(room.grid, 'x');
  for (const r of fireRects) addFire(scene, r);

  // Light: ambient from the room, brighter for pale art so snow still reads as snow.
  const bright = luma(hexRgb(pal.highlight)) / 255;
  scene.lights.enable().setAmbientColor(rgbInt(mixRgb(hexRgb(room.ambient), [255, 255, 255], bright > 0.8 ? 0.5 : 0.35)));

  addWeather(scene, room, rgbInt(hexRgb(pal.highlight)));
  scene.physics.world.setBounds(0, 0, roomW, roomH + 200);
  const cam = scene.cameras.main;
  cam.setBounds(0, 0, roomW, roomH);
  applyGrade(cam, room.grade);
  return { solids, platforms, spikes: spikeRects, fires: fireRects };
}

/** Flames over a strip of fire tiles: rising tongues, a hot core, smoke and a flickering light. */
function addFire(scene: Phaser.Scene, r: Rect) {
  const bottom = r.y + r.h;
  scene.add.particles(0, 0, 'fx:soft', {
    x: { min: r.x + 6, max: r.x + r.w - 6 }, y: bottom - 6, lifespan: { min: 500, max: 900 }, speedY: { min: -170, max: -90 },
    speedX: { min: -14, max: 14 }, scale: { start: 0.55, end: 0.05 }, alpha: { start: 0.9, end: 0 },
    tint: [0xff5a1a, 0xff8a2a, 0xffc24a], blendMode: Phaser.BlendModes.ADD, frequency: Math.max(8, 400 / (r.w / TILE)),
  }).setDepth(DEPTH.entities + 1);
  scene.add.particles(0, 0, 'fx:soft', {
    x: { min: r.x, max: r.x + r.w }, y: bottom - 50, lifespan: 2400, speedY: { min: -60, max: -30 }, scale: { start: 0.8, end: 2.4 },
    alpha: { start: 0.35, end: 0 }, tint: 0x1a1414, frequency: Math.max(40, 1200 / (r.w / TILE)),
  }).setDepth(DEPTH.entities);
  const light = scene.lights.addLight(r.x + r.w / 2, bottom - 40, 220 + r.w * 0.6, 0xff8a3a, 1.6);
  scene.tweens.addCounter({ from: 0, to: 1, duration: 140, repeat: -1, yoyo: true, onUpdate: () => { light.intensity = 1.3 + Math.random() * 0.6; } });
}
