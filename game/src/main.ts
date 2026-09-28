import '@fontsource/alegreya-sans/400.css';
import '@fontsource/alegreya-sans/400-italic.css';
import '@fontsource/alegreya-sans/700.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import Phaser from 'phaser';
import { effectOf } from './battle/WordCore';
import { audio } from './core/AudioSynth';
import { input } from './core/Input';
import { session } from './core/Session';
import { BattleScene } from './scenes/BattleScene';
import { BootScene } from './scenes/BootScene';
import { ChapterCardScene } from './scenes/ChapterCardScene';
import { CreditsScene } from './scenes/CreditsScene';
import { DialogueScene } from './scenes/DialogueScene';
import { HudScene } from './scenes/HudScene';
import { MenuScene } from './scenes/MenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { TitleScene } from './scenes/TitleScene';
import { WordBattleScene } from './scenes/WordBattleScene';
import { WorldScene } from './scenes/WorldScene';
import { MOVE } from './world/movement';

input.attach();
window.addEventListener('pointerdown', () => audio.unlock());

// Scene order is draw order: overlays come last.
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#05070d',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: MOVE.gravity }, debug: false } },
  input: { gamepad: false },
  scene: [BootScene, TitleScene, WorldScene, BattleScene, WordBattleScene, HudScene, DialogueScene, ChapterCardScene, MenuScene, SettingsScene, CreditsScene],
});

// Input is polled once per frame, before any scene updates.
game.events.on(Phaser.Core.Events.PRE_STEP, () => input.update());

// Dev builds expose the game for automated play-throughs (tools in the test scratchpad).
if (import.meta.env.DEV) Object.assign(window, { game, __efil_state: () => session.state, __efil_word: { effectOf } });
