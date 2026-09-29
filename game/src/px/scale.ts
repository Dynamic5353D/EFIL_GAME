import Phaser from 'phaser';
import { settings } from '../core/Settings';
import { VIEW_H, VIEW_W } from './config';

/**
 * Scales the 480x270 screen to the window. With "Sharp pixels" on, only whole-number zooms are used
 * (every game pixel is the same size); otherwise it fills the window.
 */
export function applyScale(game: Phaser.Game): void {
  const w = window.innerWidth, h = window.innerHeight;
  const fit = Math.min(w / VIEW_W, h / VIEW_H);
  const zoom = settings.get('pixelPerfect') && fit >= 1 ? Math.floor(fit) : fit;
  const canvas = game.canvas;
  canvas.style.width = `${Math.floor(VIEW_W * zoom)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * zoom)}px`;
  canvas.style.imageRendering = 'pixelated';
  game.scale.refresh();
}
