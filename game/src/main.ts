import Phaser from 'phaser';
import { audio } from './core/AudioSynth';
import { input } from './core/Input';
import { session } from './core/Session';
import { VIEW_H, VIEW_W } from './px/config';
import { applyScale } from './px/scale';
import { BootScene } from './px/scenes/BootScene';
import { LanguageScene } from './px/scenes/LanguageScene';
import { TitleScene } from './px/scenes/TitleScene';
import { MenuScene } from './px/ui/MenuScene';
import { OptionsScene } from './px/ui/OptionsScene';
import { UiScene } from './px/ui/UiScene';
import { OverworldScene } from './px/world/OverworldScene';

input.attach();
window.addEventListener('pointerdown', () => audio.unlock());
input.onAnyKey(() => audio.unlock());

// The pixel game draws at 480x270 and is scaled up with nearest-neighbour filtering (see px/scale.ts).
// Scene order is draw order: overlays come last.
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#0c0d16',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
  input: { gamepad: false },
  scene: [BootScene, LanguageScene, TitleScene, OverworldScene, UiScene, MenuScene, OptionsScene],
});

game.events.once(Phaser.Core.Events.READY, () => applyScale(game));
window.addEventListener('resize', () => applyScale(game));

// Input is polled once per frame, before any scene updates.
game.events.on(Phaser.Core.Events.PRE_STEP, () => input.update());

// Dev builds expose the game for automated play-throughs (tools/playtest).
if (import.meta.env.DEV) Object.assign(window, { game, __efil_state: () => session.state });
