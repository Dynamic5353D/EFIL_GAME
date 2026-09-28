import { bus } from './EventBus';
import { readJSON, storage, writeJSON, type KV } from './Storage';

export type Lang = 'en' | 'ta';

export const ACTIONS = [
  'left', 'right', 'up', 'down', 'jump', 'dash', 'attack', 'interact', 'menu', 'confirm', 'cancel', 'language',
] as const;
export type Action = (typeof ACTIONS)[number];

/** Keyboard bindings use KeyboardEvent.code values, so they follow key position, not layout. */
export const DEFAULT_BINDINGS: Record<Action, string[]> = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyZ'],
  dash: ['ShiftLeft', 'KeyC'],
  attack: ['KeyX', 'KeyJ'],
  interact: ['KeyE', 'ArrowUp'],
  menu: ['Escape', 'Tab'],
  confirm: ['Enter', 'Space', 'KeyZ'],
  cancel: ['Escape', 'Backspace', 'KeyX'],
  language: ['KeyL'],
};

export interface SettingsData {
  language: Lang;
  /** Characters per second for dialogue; 0 shows text instantly. */
  textSpeed: number;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  screenShake: boolean;
  contentWarnings: boolean;
  profanityFilter: boolean;
  bindings: Record<Action, string[]>;
}

export const DEFAULT_SETTINGS: SettingsData = {
  language: 'en',
  textSpeed: 55,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  reducedMotion: false,
  screenShake: true,
  contentWarnings: true,
  profanityFilter: false,
  bindings: DEFAULT_BINDINGS,
};

const KEY = 'efil.settings.v1';

function clamp01(n: unknown, d: number) {
  return typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : d;
}

/** Validates untrusted stored data field by field, falling back to defaults. */
export function sanitizeSettings(raw: unknown): SettingsData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<SettingsData>;
  const d = DEFAULT_SETTINGS;
  const bindings = { ...d.bindings };
  if (r.bindings && typeof r.bindings === 'object') {
    for (const a of ACTIONS) {
      const b = (r.bindings as Record<string, unknown>)[a];
      if (Array.isArray(b) && b.every((k) => typeof k === 'string')) bindings[a] = b.slice(0, 3) as string[];
    }
  }
  return {
    language: r.language === 'ta' ? 'ta' : 'en',
    textSpeed: typeof r.textSpeed === 'number' && r.textSpeed >= 0 && r.textSpeed <= 200 ? r.textSpeed : d.textSpeed,
    masterVolume: clamp01(r.masterVolume, d.masterVolume),
    musicVolume: clamp01(r.musicVolume, d.musicVolume),
    sfxVolume: clamp01(r.sfxVolume, d.sfxVolume),
    reducedMotion: typeof r.reducedMotion === 'boolean' ? r.reducedMotion : d.reducedMotion,
    screenShake: typeof r.screenShake === 'boolean' ? r.screenShake : d.screenShake,
    contentWarnings: typeof r.contentWarnings === 'boolean' ? r.contentWarnings : d.contentWarnings,
    profanityFilter: typeof r.profanityFilter === 'boolean' ? r.profanityFilter : d.profanityFilter,
    bindings,
  };
}

class SettingsStore {
  data: SettingsData;
  constructor(private kv: KV) {
    const stored = readJSON<unknown>(kv, KEY);
    this.data = sanitizeSettings(stored);
    if (stored == null && typeof matchMedia !== 'undefined') {
      try { this.data.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    }
  }
  get<K extends keyof SettingsData>(key: K): SettingsData[K] { return this.data[key]; }
  set<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    this.data[key] = value;
    writeJSON(this.kv, KEY, this.data);
    bus.emit('settings', { key });
    if (key === 'language') bus.emit('language', { lang: value as Lang });
  }
  resetBindings() { this.set('bindings', structuredClone(DEFAULT_BINDINGS)); }
}

export const settings = new SettingsStore(storage);
