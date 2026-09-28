import { ACTIONS, settings, type Action } from './Settings';

/** Standard-mapping gamepad buttons for each action. */
const PAD: Record<Action, number[]> = {
  left: [14], right: [15], up: [12], down: [13],
  jump: [0], dash: [5, 7], attack: [2], interact: [3],
  menu: [9, 8], confirm: [0], cancel: [1], language: [4],
};

const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace']);

/**
 * Polled input. Keyboard state comes from DOM events (KeyboardEvent.code, so bindings follow key
 * position), gamepads from navigator.getGamepads(). `update()` runs once per frame before scenes.
 */
class InputManager {
  private down = new Set<string>();
  private tapped = new Set<string>();
  private cur = {} as Record<Action, boolean>;
  private prev = {} as Record<Action, boolean>;
  private tap = {} as Record<Action, boolean>;
  private padPrev = new Set<number>();
  axisX = 0;
  axisY = 0;
  lastDevice: 'keyboard' | 'gamepad' = 'keyboard';
  /** While set, the next key press goes here instead of the game (key rebinding). */
  capture: ((code: string) => void) | null = null;
  private attached = false;
  private listeners: ((code: string) => void)[] = [];

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      this.lastDevice = 'keyboard';
      if (this.capture) {
        e.preventDefault();
        const cb = this.capture;
        this.capture = null;
        cb(e.code);
        return;
      }
      if (!e.repeat) this.tapped.add(e.code);
      this.down.add(e.code);
      this.listeners.forEach((l) => l(e.code));
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
    for (const a of ACTIONS) this.cur[a] = this.prev[a] = this.tap[a] = false;
  }

  /** Called for every raw key press (used to unlock audio on first input). */
  onAnyKey(fn: (code: string) => void) { this.listeners.push(fn); }

  update(): void {
    const b = settings.get('bindings');
    let pad: Gamepad | null = null;
    try {
      for (const g of navigator.getGamepads?.() ?? []) if (g && g.connected) { pad = g; break; }
    } catch { /* gamepads unavailable */ }
    const padDown = new Set<number>();
    let ax = 0, ay = 0;
    if (pad) {
      pad.buttons.forEach((btn, i) => { if (btn.pressed || btn.value > 0.5) padDown.add(i); });
      ax = Math.abs(pad.axes[0] ?? 0) > 0.35 ? pad.axes[0]! : 0;
      ay = Math.abs(pad.axes[1] ?? 0) > 0.35 ? pad.axes[1]! : 0;
      if (padDown.size || ax || ay) this.lastDevice = 'gamepad';
    }
    for (const a of ACTIONS) {
      this.prev[a] = this.cur[a];
      const keys = b[a] ?? [];
      let d = keys.some((k) => this.down.has(k));
      let t = keys.some((k) => this.tapped.has(k));
      const pb = PAD[a];
      if (pb.some((i) => padDown.has(i))) { d = true; if (pb.some((i) => !this.padPrev.has(i) && padDown.has(i))) t = true; }
      if (a === 'left' && ax < -0.35) d = true;
      if (a === 'right' && ax > 0.35) d = true;
      if (a === 'up' && ay < -0.5) d = true;
      if (a === 'down' && ay > 0.5) d = true;
      this.cur[a] = d || t;
      this.tap[a] = t || (d && !this.prev[a]);
    }
    const kx = (this.cur.right ? 1 : 0) - (this.cur.left ? 1 : 0);
    this.axisX = ax && !kx ? ax : kx;
    this.axisY = (this.cur.down ? 1 : 0) - (this.cur.up ? 1 : 0);
    this.padPrev = padDown;
    this.tapped.clear();
  }

  isDown(a: Action) { return this.cur[a]; }
  pressed(a: Action) { return this.tap[a]; }
  released(a: Action) { return this.prev[a] && !this.cur[a]; }
  /** Forget presses so an input that closed one screen doesn't also trigger the next. */
  consume(...a: Action[]) { for (const x of a.length ? a : ACTIONS) this.tap[x] = false; }

  keyLabel(code: string): string {
    const named: Record<string, string> = {
      ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc', Backspace: 'Bksp',
      ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt',
    };
    return named[code] ?? code.replace(/^(Key|Digit)/, '');
  }

  /** Short label for an action's first binding, for on-screen prompts. */
  label(a: Action): string {
    if (this.lastDevice === 'gamepad') {
      return ({ jump: 'A', confirm: 'A', cancel: 'B', attack: 'X', interact: 'Y', dash: 'RB', menu: 'Start', language: 'LB' } as Partial<Record<Action, string>>)[a] ?? a;
    }
    const k = settings.get('bindings')[a]?.[0];
    return k ? this.keyLabel(k) : '—';
  }
}

export const input = new InputManager();
