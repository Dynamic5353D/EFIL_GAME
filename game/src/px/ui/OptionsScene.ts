import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { tr, type Loc } from '../../core/Localization';
import { loc } from '../../core/Localization';
import { settings, type SettingsData } from '../../core/Settings';
import { COL, VIEW_H, VIEW_W } from '../config';
import { applyScale } from '../scale';
import { ListNav } from './list';
import { txt, win } from './widgets';

type Row = { label: Loc; values: Loc[]; get: () => number; set: (i: number) => void };

const ENTA = [loc('English'), loc('Tanglish')];
const ONOFF = [loc('On', 'On'), loc('Off', 'Off')];
const bool = (k: keyof SettingsData): Pick<Row, 'get' | 'set'> => ({
  get: () => (settings.get(k) ? 0 : 1),
  set: (i) => settings.set(k, (i === 0) as never),
});
const SPEEDS = [30, 55, 90, 0];
const vol = (k: 'musicVolume' | 'sfxVolume'): Pick<Row, 'get' | 'set'> => ({
  get: () => Math.round(settings.get(k) * 10),
  set: (i) => { settings.set(k, i / 10); audio.applyVolumes(); if (k === 'sfxVolume') audio.sfx('ui_move'); },
});

const ROWS: Row[] = [
  { label: loc('Dialogue language', 'Pechu mozhi'), values: ENTA, get: () => (settings.get('dialogueLang') === 'en' ? 0 : 1), set: (i) => settings.set('dialogueLang', i ? 'ta' : 'en') },
  { label: loc('Description language', 'Vivaram mozhi'), values: ENTA, get: () => (settings.get('descLang') === 'en' ? 0 : 1), set: (i) => settings.set('descLang', i ? 'ta' : 'en') },
  { label: loc('Text speed', 'Ezhuthu vegam'), values: [loc('Slow', 'Mella'), loc('Normal'), loc('Fast', 'Vegam'), loc('Instant', 'Udane')], get: () => Math.max(0, SPEEDS.indexOf(settings.get('textSpeed'))), set: (i) => settings.set('textSpeed', SPEEDS[i]!) },
  { label: loc('Music volume', 'Isai sathham'), values: Array.from({ length: 11 }, (_, i) => loc(String(i))), ...vol('musicVolume') },
  { label: loc('Sound volume', 'Oli sathham'), values: Array.from({ length: 11 }, (_, i) => loc(String(i))), ...vol('sfxVolume') },
  { label: loc('Sharp pixels', 'Koorana pixel'), values: ONOFF, ...bool('pixelPerfect') },
  { label: loc('Profanity filter', 'Kettavaarthai filter'), values: ONOFF, ...bool('profanityFilter') },
  { label: loc('Content notes', 'Content note'), values: ONOFF, ...bool('contentWarnings') },
];

/** Settings, reachable from the title screen and the start menu. */
export class OptionsScene extends Phaser.Scene {
  private nav = new ListNav(ROWS.length);
  private layer?: Phaser.GameObjects.Container;

  constructor() {
    super('Options');
  }

  create(): void {
    this.nav = new ListNav(ROWS.length + 1);
    this.draw();
  }

  private draw(): void {
    this.layer?.destroy();
    const c = this.add.container(0, 0);
    this.layer = c;
    c.add(this.add.rectangle(0, 0, VIEW_W, VIEW_H, COL.ink, 0.75).setOrigin(0));
    const x = 60, y = 24, w = VIEW_W - 120, h = VIEW_H - 48;
    c.add(win(this, x, y, w, h));
    c.add(txt(this, x + 16, y + 12, tr(loc('Settings', 'Settings')), COL.blue1));
    ROWS.forEach((r, i) => {
      const ry = y + 34 + i * 20;
      const sel = this.nav.i === i;
      if (sel) c.add(this.add.rectangle(x + 10, ry - 4, w - 20, 18, COL.podHi).setOrigin(0));
      c.add(txt(this, x + 20, ry, tr(r.label), sel ? COL.ink : COL.slate));
      const v = tr(r.values[r.get()]!);
      c.add(txt(this, x + w - 24, ry, `< ${v} >`, sel ? COL.red : COL.ink).setOrigin(1, 0));
      c.add(this.nav.hit(this, i, x + 10, ry - 4, w - 20, 18));
    });
    const by = y + 34 + ROWS.length * 20 + 2;
    const sel = this.nav.i === ROWS.length;
    if (sel) c.add(this.add.rectangle(x + 10, by - 4, w - 20, 18, COL.podHi).setOrigin(0));
    c.add(txt(this, x + 20, by, tr(loc('Back', 'Pinnaadi')), sel ? COL.ink : COL.slate));
    c.add(this.nav.hit(this, ROWS.length, x + 10, by - 4, w - 20, 18));
    c.add(txt(this, x + w - 16, y + h - 16, tr(loc('Left/Right: change   X: back', 'Left/Right: maathu   X: pinnaadi')), COL.stone, null).setOrigin(1, 0));
  }

  override update(): void {
    const before = this.nav.i;
    const r = this.nav.update();
    const row = ROWS[this.nav.i];
    if (r === 'cancel' || (r === 'confirm' && !row)) { this.close(); return; }
    if (row && (r === 'left' || r === 'right' || r === 'confirm')) {
      const n = row.values.length;
      const cur = row.get();
      const next = r === 'left' ? Math.max(0, cur - 1) : r === 'right' ? Math.min(n - 1, cur + 1) : (cur + 1) % n;
      if (next !== cur) { row.set(next); audio.sfx('ui_move'); if (row === ROWS[5]) applyScale(this.game); }
      this.draw();
      return;
    }
    if (before !== this.nav.i) this.draw();
  }

  private close(): void {
    this.scene.stop();
  }
}
