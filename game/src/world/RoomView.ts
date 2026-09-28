/**
 * Builds everything visible and solid in a room: parallax scenery, painted terrain, platforms,
 * spikes, lighting, weather and the per-room colour grade.
 */
import Phaser from 'phaser';
import { assets } from '../core/Assets';
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

  new Scenery(scene, room).build();

  // Terrain, painted once into canvas chunks and lit by the room lights.
  // Textures outlive the scene, so a room is painted once per session.
  const chunks = Math.ceil(roomW / CHUNK);
  if (!scene.textures.exists(`terrain:${room.id}:0`)) {
    paintTerrain(room.grid, pal, room.id.length * 131 + room.cols).canvases.forEach((c, i) => scene.textures.addCanvas(`terrain:${room.id}:${i}`, c));
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
      scene.add.image(r.x - 10, y - 4, ledge(scene, r.w, pal)).setOrigin(0).setDepth(DEPTH.terrain + 1).setLighting(true);
    }
  }
  const spikeRects = mergeTiles(room.grid, '^');
  for (const r of spikeRects) scene.add.image(r.x, r.y + r.h - 44, spikes(scene, r.w)).setOrigin(0).setDepth(DEPTH.terrain + 1).setLighting(true);

  // Light: ambient from the room, brighter for pale art so snow still reads as snow.
  const bright = luma(hexRgb(pal.highlight)) / 255;
  scene.lights.enable().setAmbientColor(rgbInt(mixRgb(hexRgb(room.ambient), [255, 255, 255], bright > 0.8 ? 0.5 : 0.35)));

  addWeather(scene, room, rgbInt(hexRgb(pal.highlight)));
  scene.physics.world.setBounds(0, 0, roomW, roomH + 200);
  const cam = scene.cameras.main;
  cam.setBounds(0, 0, roomW, roomH);
  applyGrade(cam, room.grade);
  return { solids, platforms, spikes: spikeRects };
}
