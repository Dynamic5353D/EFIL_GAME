/**
 * Earth scenes have no art, so their backdrops are painted in code (world/EarthPainter.ts). This file is
 * the data half: which scenes exist, their colours, and what goes in them. Rooms use a scene as
 * `backdrop: 'gen:<id>'`, story scripts as `@scene gen:<id>`. A file at assets/override/bg/<id>.webp
 * replaces the painted version.
 */
import type { Palette } from '../core/Assets';

export type SceneKind = 'outdoor' | 'indoor';

export interface EarthScene {
  id: string;
  kind: SceneKind;
  /** Sky (outdoor) or wall (indoor) gradient, top to bottom. */
  top: string;
  bottom: string;
  /** Light source: glow colour and position (0..1). */
  light: { color: string; x: number; y: number; size: number; strength: number };
  /** Silhouette colour of the far layers (outdoor) or furniture (indoor). */
  shade: string;
  /** Window/lamp glow colour. */
  lamp: string;
  /** Foliage colour and the blossom colour of copper-pod trees. */
  leaf: string;
  bloom?: string;
  stars?: boolean;
  clouds?: number;
  /** Outdoor furniture of the scene. */
  skyline?: boolean;
  campus?: 'lecture' | 'hostel' | 'market' | 'hangar' | 'none';
  /** Indoor furniture of the scene. */
  room?: 'hostel' | 'house' | 'station' | 'interrogation' | 'corridor' | 'cafe' | 'shed' | 'classroom' | 'hospital' | 'train' | 'warehouse' | 'restroom';
  /** Terrain palette. */
  ground: { dominant: string; shadow: string; highlight: string; accent: string };
}

const S = (s: EarthScene) => s;

export const EARTH_SCENES: Record<string, EarthScene> = {
  campus_morning: S({
    id: 'campus_morning', kind: 'outdoor', top: '#9cbfdc', bottom: '#f4d7a8', light: { color: '#ffe2a8', x: 0.18, y: 0.62, size: 0.5, strength: 0.8 },
    shade: '#6c7c8e', lamp: '#fff2c8', leaf: '#4f7a45', bloom: '#f2c53a', clouds: 5, skyline: true, campus: 'lecture',
    ground: { dominant: '#8a8577', shadow: '#2a2a2c', highlight: '#d8d0bc', accent: '#c8a868' },
  }),
  campus_noon: S({
    id: 'campus_noon', kind: 'outdoor', top: '#7fb0de', bottom: '#e8ecd8', light: { color: '#fffbe8', x: 0.62, y: 0.12, size: 0.45, strength: 0.6 },
    shade: '#7c8a98', lamp: '#fff6d8', leaf: '#4a7c3e', bloom: '#f2c53a', clouds: 6, skyline: true, campus: 'lecture',
    ground: { dominant: '#8e8a7c', shadow: '#2c2c2e', highlight: '#e0dac8', accent: '#b8a878' },
  }),
  campus_dusk: S({
    id: 'campus_dusk', kind: 'outdoor', top: '#6a6aa0', bottom: '#f2a660', light: { color: '#ffb866', x: 0.8, y: 0.66, size: 0.55, strength: 0.9 },
    shade: '#5a4a62', lamp: '#ffd890', leaf: '#3e5a38', bloom: '#f0b830', clouds: 4, skyline: true, campus: 'lecture',
    ground: { dominant: '#7a6a62', shadow: '#241c20', highlight: '#e8c8a0', accent: '#e0a060' },
  }),
  campus_cloudy: S({
    id: 'campus_cloudy', kind: 'outdoor', top: '#8a96a6', bottom: '#d6d2c6', light: { color: '#f0ece0', x: 0.5, y: 0.2, size: 0.7, strength: 0.35 },
    shade: '#5e6672', lamp: '#fff0c8', leaf: '#3f5f3c', bloom: '#d8b040', clouds: 10, skyline: true, campus: 'lecture',
    ground: { dominant: '#7e7c76', shadow: '#26272a', highlight: '#cfcbc0', accent: '#a09a88' },
  }),
  campus_night: S({
    id: 'campus_night', kind: 'outdoor', top: '#0a1024', bottom: '#2a3050', light: { color: '#9cb8ff', x: 0.75, y: 0.14, size: 0.2, strength: 0.6 },
    shade: '#141a2c', lamp: '#ffcf7a', leaf: '#1a2a24', stars: true, skyline: true, campus: 'hostel',
    ground: { dominant: '#3a3e4a', shadow: '#0c0e14', highlight: '#8a90a8', accent: '#ffcf7a' },
  }),
  hostel_morning: S({
    id: 'hostel_morning', kind: 'outdoor', top: '#a8c4dc', bottom: '#f2d8b0', light: { color: '#ffe0a0', x: 0.15, y: 0.6, size: 0.5, strength: 0.75 },
    shade: '#707a88', lamp: '#fff2c8', leaf: '#4f7a45', bloom: '#f2c53a', clouds: 4, skyline: true, campus: 'hostel',
    ground: { dominant: '#8a8577', shadow: '#2a2a2c', highlight: '#d8d0bc', accent: '#c8a868' },
  }),
  market_evening: S({
    id: 'market_evening', kind: 'outdoor', top: '#4a4a7a', bottom: '#e0906a', light: { color: '#ffb070', x: 0.3, y: 0.7, size: 0.5, strength: 0.7 },
    shade: '#3a2e3e', lamp: '#ffd27a', leaf: '#34502e', clouds: 3, skyline: true, campus: 'market',
    ground: { dominant: '#6e5e56', shadow: '#1e1618', highlight: '#d8b898', accent: '#ffb060' },
  }),
  rain_night: S({
    id: 'rain_night', kind: 'outdoor', top: '#0c1222', bottom: '#28344c', light: { color: '#8aa8d8', x: 0.5, y: 0.1, size: 0.6, strength: 0.25 },
    shade: '#101626', lamp: '#ffc870', leaf: '#16241e', clouds: 12, skyline: true, campus: 'hostel',
    ground: { dominant: '#2e3440', shadow: '#080a10', highlight: '#7a8aa8', accent: '#ffc870' },
  }),
  hangar_rain: S({
    id: 'hangar_rain', kind: 'outdoor', top: '#0e1424', bottom: '#2a3246', light: { color: '#b8c8ff', x: 0.3, y: 0.08, size: 0.5, strength: 0.3 },
    shade: '#121826', lamp: '#d8e0ff', leaf: '#16241e', clouds: 12, skyline: false, campus: 'hangar',
    ground: { dominant: '#343844', shadow: '#0a0c12', highlight: '#8090a8', accent: '#c8d0e8' },
  }),
  hangar_day: S({
    id: 'hangar_day', kind: 'outdoor', top: '#8c98a8', bottom: '#d8d4c8', light: { color: '#f4f0e0', x: 0.4, y: 0.18, size: 0.6, strength: 0.35 },
    shade: '#5a626e', lamp: '#fff0c8', leaf: '#3f5f3c', bloom: '#d8b040', clouds: 9, skyline: true, campus: 'hangar',
    ground: { dominant: '#7e7a70', shadow: '#26262a', highlight: '#cfcab8', accent: '#9a9486' },
  }),
  hostel_fire: S({
    id: 'hostel_fire', kind: 'indoor', top: '#2a1410', bottom: '#6a2a14', light: { color: '#ff8a3a', x: 0.7, y: 0.5, size: 0.8, strength: 1 },
    shade: '#1a0c0a', lamp: '#ffb050', leaf: '#000000', room: 'corridor',
    ground: { dominant: '#5a3a30', shadow: '#140a08', highlight: '#e8a070', accent: '#ff7a2a' },
  }),
  hostel_room: S({
    id: 'hostel_room', kind: 'indoor', top: '#b8b0a0', bottom: '#7a7468', light: { color: '#ffe6b0', x: 0.72, y: 0.35, size: 0.5, strength: 0.7 },
    shade: '#3a3630', lamp: '#fff0c8', leaf: '#4f7a45', room: 'hostel',
    ground: { dominant: '#6a5a4a', shadow: '#1e1814', highlight: '#c8b090', accent: '#e0c080' },
  }),
  hostel_room_night: S({
    id: 'hostel_room_night', kind: 'indoor', top: '#2a2c3a', bottom: '#15161e', light: { color: '#9cb0ff', x: 0.72, y: 0.35, size: 0.4, strength: 0.45 },
    shade: '#0e0f16', lamp: '#fff0c8', leaf: '#1a2a24', room: 'hostel',
    ground: { dominant: '#3a3430', shadow: '#0c0a08', highlight: '#8a7c6c', accent: '#9cb0ff' },
  }),
  house_night: S({
    id: 'house_night', kind: 'indoor', top: '#5a4a3a', bottom: '#2a2018', light: { color: '#ffd08a', x: 0.35, y: 0.25, size: 0.5, strength: 0.8 },
    shade: '#1e1712', lamp: '#ffd08a', leaf: '#34502e', room: 'house',
    ground: { dominant: '#6a5040', shadow: '#1a120c', highlight: '#d8b088', accent: '#ffd08a' },
  }),
  house_day: S({
    id: 'house_day', kind: 'indoor', top: '#d8cbb4', bottom: '#9a8c74', light: { color: '#fff0d0', x: 0.25, y: 0.3, size: 0.55, strength: 0.7 },
    shade: '#4a3e30', lamp: '#fff0d0', leaf: '#4f7a45', room: 'house',
    ground: { dominant: '#7a6250', shadow: '#241a12', highlight: '#e0c8a8', accent: '#e8c890' },
  }),
  station: S({
    id: 'station', kind: 'indoor', top: '#8a8a6e', bottom: '#4a4a3a', light: { color: '#f0f0c8', x: 0.5, y: 0.1, size: 0.5, strength: 0.6 },
    shade: '#2a2a20', lamp: '#f4f4d0', leaf: '#3f5f3c', room: 'station',
    ground: { dominant: '#6a6658', shadow: '#1a1a14', highlight: '#c8c4a8', accent: '#d8d0a0' },
  }),
  interrogation: S({
    id: 'interrogation', kind: 'indoor', top: '#3a3a36', bottom: '#1a1a18', light: { color: '#fff4c8', x: 0.5, y: 0.12, size: 0.3, strength: 0.9 },
    shade: '#0e0e0c', lamp: '#fff4c8', leaf: '#000000', room: 'interrogation',
    ground: { dominant: '#4a4844', shadow: '#0c0c0a', highlight: '#a8a498', accent: '#fff4c8' },
  }),
  corridor_day: S({
    id: 'corridor_day', kind: 'indoor', top: '#c8c0ae', bottom: '#8a8474', light: { color: '#fff4dc', x: 0.3, y: 0.3, size: 0.6, strength: 0.55 },
    shade: '#3e3a32', lamp: '#fff4dc', leaf: '#4a7c3e', room: 'corridor',
    ground: { dominant: '#7a7466', shadow: '#22201c', highlight: '#d8d0bc', accent: '#b8b098' },
  }),
  restroom: S({
    id: 'restroom', kind: 'indoor', top: '#a8b4b8', bottom: '#6a7478', light: { color: '#e8f4ff', x: 0.5, y: 0.1, size: 0.5, strength: 0.5 },
    shade: '#2a3236', lamp: '#e8f4ff', leaf: '#000000', room: 'restroom',
    ground: { dominant: '#6a7478', shadow: '#1a2024', highlight: '#c8d4d8', accent: '#a8c0c8' },
  }),
  cafe: S({
    id: 'cafe', kind: 'indoor', top: '#6a3a5a', bottom: '#2a1a2a', light: { color: '#ffb0d8', x: 0.5, y: 0.2, size: 0.7, strength: 0.7 },
    shade: '#1e1020', lamp: '#ffd8a0', leaf: '#4f7a45', room: 'cafe',
    ground: { dominant: '#5a3a4a', shadow: '#180c14', highlight: '#e0a8c8', accent: '#ffd8a0' },
  }),
  cheese_freeze: S({
    id: 'cheese_freeze', kind: 'indoor', top: '#e0c070', bottom: '#8a6a30', light: { color: '#fff0a0', x: 0.5, y: 0.2, size: 0.8, strength: 0.8 },
    shade: '#3a2a10', lamp: '#fff0a0', leaf: '#6a9a4a', room: 'cafe',
    ground: { dominant: '#7a6a4a', shadow: '#241a0c', highlight: '#f0d898', accent: '#fff0a0' },
  }),
  shed: S({
    id: 'shed', kind: 'indoor', top: '#4a4238', bottom: '#1e1a16', light: { color: '#ffd8a0', x: 0.4, y: 0.15, size: 0.4, strength: 0.6 },
    shade: '#14100c', lamp: '#ffd8a0', leaf: '#000000', room: 'shed',
    ground: { dominant: '#4a4034', shadow: '#100c08', highlight: '#a89478', accent: '#ffd8a0' },
  }),
  classroom: S({
    id: 'classroom', kind: 'indoor', top: '#c8c4b0', bottom: '#8a8672', light: { color: '#fffbe8', x: 0.85, y: 0.3, size: 0.6, strength: 0.6 },
    shade: '#3a3830', lamp: '#fffbe8', leaf: '#4a7c3e', room: 'classroom',
    ground: { dominant: '#7a7466', shadow: '#22201c', highlight: '#d8d0bc', accent: '#c8b890' },
  }),
  hospital: S({
    id: 'hospital', kind: 'indoor', top: '#c8d8d8', bottom: '#8aa0a0', light: { color: '#f0ffff', x: 0.5, y: 0.1, size: 0.7, strength: 0.6 },
    shade: '#2a3a3a', lamp: '#f0ffff', leaf: '#4a7c3e', room: 'hospital',
    ground: { dominant: '#7a8a8a', shadow: '#1a2222', highlight: '#d8e8e8', accent: '#b8d0d0' },
  }),
  mortuary: S({
    id: 'mortuary', kind: 'indoor', top: '#8aa0a8', bottom: '#3a4a50', light: { color: '#d8f0ff', x: 0.5, y: 0.08, size: 0.4, strength: 0.7 },
    shade: '#141c20', lamp: '#d8f0ff', leaf: '#000000', room: 'hospital',
    ground: { dominant: '#5a6a70', shadow: '#10161a', highlight: '#b8c8d0', accent: '#d8f0ff' },
  }),
  train: S({
    id: 'train', kind: 'indoor', top: '#8a9aa8', bottom: '#4a5460', light: { color: '#fff4dc', x: 0.8, y: 0.4, size: 0.6, strength: 0.7 },
    shade: '#1e242c', lamp: '#fff4dc', leaf: '#4a7c3e', room: 'train',
    ground: { dominant: '#5a626c', shadow: '#14181c', highlight: '#c0c8d0', accent: '#fff4dc' },
  }),
  warehouse: S({
    id: 'warehouse', kind: 'indoor', top: '#1a1a20', bottom: '#08080c', light: { color: '#c8a870', x: 0.5, y: 0.1, size: 0.3, strength: 0.6 },
    shade: '#050507', lamp: '#c8a870', leaf: '#000000', room: 'warehouse',
    ground: { dominant: '#2a2826', shadow: '#060606', highlight: '#6a6458', accent: '#c8a870' },
  }),
  fest: S({
    id: 'fest', kind: 'outdoor', top: '#80b4e0', bottom: '#f0e0c0', light: { color: '#fffbe8', x: 0.5, y: 0.1, size: 0.5, strength: 0.6 },
    shade: '#6a7488', lamp: '#fff6d8', leaf: '#4a7c3e', bloom: '#f2c53a', clouds: 5, skyline: true, campus: 'lecture',
    ground: { dominant: '#8e8a7c', shadow: '#2c2c2e', highlight: '#e0dac8', accent: '#ff7aa8' },
  }),
  daydream: S({
    id: 'daydream', kind: 'indoor', top: '#3a1a5a', bottom: '#0e0a2a', light: { color: '#ff7ad8', x: 0.5, y: 0.4, size: 0.8, strength: 1 },
    shade: '#0a0618', lamp: '#7ad8ff', leaf: '#000000', room: 'house',
    ground: { dominant: '#3a2a5a', shadow: '#0a0618', highlight: '#c8a8ff', accent: '#ff7ad8' },
  }),
};

/** A Palette (the shape Glacia rooms sample from their art) for an Earth scene. */
export function earthPalette(s: EarthScene): Palette {
  return {
    dominant: s.ground.dominant, shadow: s.ground.shadow, highlight: s.ground.highlight, accent: s.ground.accent,
    top: s.top, bottom: s.bottom, swatches: [], light: { x: s.light.x < 0.5 ? -0.5 : 0.5, y: -0.6 }, luma: 0.5,
  };
}

/** Scene names scripts may use with @scene: every Earth scene as "gen:<id>". */
export const EARTH_SCENE_NAMES = Object.keys(EARTH_SCENES).map((id) => `gen:${id}`);
