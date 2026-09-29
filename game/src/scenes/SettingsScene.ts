import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { input } from '../core/Input';
import { ACTIONS, settings, type Action } from '../core/Settings';
import { MenuList, type MenuItem } from '../ui/MenuList';
import { addText, C, drawPanel, H, W } from '../ui/theme';

export interface OverlayData { onClose?: () => void }

const SPEEDS = [25, 40, 55, 80, 120, 0];
const speedName = (v: number) => (v === 0 ? 'Instant' : v <= 25 ? 'Slow' : v <= 40 ? 'Relaxed' : v <= 55 ? 'Normal' : v <= 80 ? 'Fast' : 'Very fast');
const ACTION_NAMES: Record<Action, string> = {
  left: 'Move left', right: 'Move right', up: 'Up / look up', down: 'Down / drop', jump: 'Jump', dash: 'Dash / sprint',
  attack: 'Attack', interact: 'Interact / talk', menu: 'Menu', bag: 'Bag (items)', confirm: 'Confirm', cancel: 'Back', language: 'Switch language',
};

/** Settings overlay, opened from the title screen or the pause menu. */
export class SettingsScene extends Phaser.Scene {
  private menu!: MenuList;
  private hint!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;
  private data_: OverlayData = {};
  private capturing: Action | null = null;

  constructor() { super({ key: 'Settings' }); }

  create(data: OverlayData) {
    this.data_ = data;
    this.capturing = null;
    this.add.rectangle(0, 0, W, H, 0x03050a, 0.78).setOrigin(0);
    const g = this.add.graphics();
    drawPanel(g, W / 2 - 400, 50, 800, 640, 0.95, 14);
    this.title = addText(this, W / 2, 68, 'Settings', { size: 36, display: true, bold: true }).setOrigin(0.5, 0);
    this.hint = addText(this, W / 2, 660, '', { size: 16, color: C.textDim, align: 'center', wordWrap: { width: 740 } }).setOrigin(0.5);
    const back = settings.get('bindings').cancel.map((k) => input.keyLabel(k)).join(' / ');
    addText(this, W / 2 + 380, 76, `${back}  Back`, { size: 15, color: C.textFaint }).setOrigin(1, 0);
    this.showMain();
    input.consume();
  }

  private setMenu(items: MenuItem[], onCancel: () => void, rows = 11) {
    this.menu?.destroy();
    this.menu = new MenuList(this, W / 2 - 360, 122, items.map((it) => ({ ...it, onFocus: () => this.hint.setText(it.hint?.() ?? '') })), {
      width: 720, lineHeight: 41, size: 22, rows, onCancel, leftCancels: false, idleCursor: true,
    });
    this.hint.setText(items[0]?.hint?.() ?? '');
  }

  private toggle(key: 'reducedMotion' | 'screenShake' | 'contentWarnings' | 'profanityFilter' | 'showTips', label: string, hint: string): MenuItem {
    const flip = () => settings.set(key, !settings.get(key));
    return { label: () => label, value: () => (settings.get(key) ? 'On' : 'Off'), onLeft: flip, onRight: flip, hint: () => hint };
  }

  private volume(key: 'masterVolume' | 'musicVolume' | 'sfxVolume', label: string): MenuItem {
    const step = (d: number) => {
      settings.set(key, Math.round(Math.min(1, Math.max(0, settings.get(key) + d)) * 10) / 10);
      audio.sfx('ui_move');
    };
    return { label: () => label, value: () => `${Math.round(settings.get(key) * 100)}%`, onLeft: () => step(-0.1), onRight: () => step(0.1) };
  }

  private showMain() {
    this.title.setText('Settings');
    const speedStep = (d: number) => {
      const i = Math.max(0, SPEEDS.indexOf(settings.get('textSpeed')));
      settings.set('textSpeed', SPEEDS[(i + d + SPEEDS.length) % SPEEDS.length]!);
    };
    const lang = () => settings.set('language', settings.get('language') === 'en' ? 'ta' : 'en');
    this.setMenu([
      { label: () => 'Dialogue language', value: () => (settings.get('language') === 'ta' ? 'Tanglish' : 'English'), onLeft: lang, onRight: lang,
        hint: () => `English, or the original Tanglish. ${input.label('language')} switches it at any time during dialogue.` },
      { label: () => 'Text speed', value: () => speedName(settings.get('textSpeed')), onLeft: () => speedStep(-1), onRight: () => speedStep(1) },
      this.volume('masterVolume', 'Master volume'),
      this.volume('musicVolume', 'Music'),
      this.volume('sfxVolume', 'Sound effects'),
      this.toggle('reducedMotion', 'Reduced motion', 'Calmer camera and effects: no drifting backdrops, fewer particles, no distortion.'),
      this.toggle('screenShake', 'Screen shake', 'Camera shake on hits and impacts.'),
      this.toggle('contentWarnings', 'Content notes', 'Short notes before chapters with difficult themes.'),
      this.toggle('profanityFilter', 'Profanity filter', 'Masks strong language in dialogue (English and Tanglish).'),
      this.toggle('showTips', 'Tips and key hints', 'Short tips the first time you meet something new, and the key hints at the bottom left. Seen tips stay in the menu\'s Guide.'),
      { label: () => 'Controls', onSelect: () => this.showControls(), hint: () => 'Rebind keyboard keys. Gamepads use a standard layout.' },
      { label: () => 'Back', onSelect: () => this.close() },
    ], () => this.close(), 12);
  }

  private showControls() {
    this.title.setText('Controls');
    const items: MenuItem[] = ACTIONS.map((a) => ({
      label: () => ACTION_NAMES[a],
      value: () => (this.capturing === a ? 'press a key…' : settings.get('bindings')[a].map((k) => input.keyLabel(k)).join('  /  ')),
      onSelect: () => this.capture(a),
      hint: () => `${input.label('confirm')} to set a new key. It replaces the first key and keeps the others.`,
    }));
    items.push({ label: () => 'Reset to defaults', onSelect: () => { settings.resetBindings(); this.menu.refresh(); } });
    items.push({ label: () => 'Back', onSelect: () => this.showMain() });
    this.setMenu(items, () => this.showMain(), 11);
  }

  private capture(a: Action) {
    this.capturing = a;
    this.menu.active = false;
    this.menu.refresh();
    this.hint.setText('Press the new key. Esc cancels (except when binding Menu or Back).');
    input.capture = (code) => {
      this.capturing = null;
      if (!(code === 'Escape' && a !== 'menu' && a !== 'cancel')) {
        const b = structuredClone(settings.get('bindings'));
        b[a] = [code, ...b[a].filter((k) => k !== code)].slice(0, 3);
        settings.set('bindings', b);
        audio.sfx('ui_ok');
      }
      this.time.delayedCall(50, () => { this.menu.active = true; this.menu.refresh(); input.consume(); });
    };
  }

  private close() {
    input.capture = null;
    this.data_.onClose?.();
    this.scene.stop();
  }

  override update(time: number) {
    if (!this.capturing) this.menu.update(time);
  }
}
