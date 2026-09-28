import { newGame, type GameState } from './GameState';
import { saves, type SaveMeta } from './SaveSystem';

/** The game currently being played and the save slot it belongs to. */
class Session {
  state: GameState = newGame();
  slot = 1;
  private startedAt = 0;

  startNew(slot: number): void {
    this.state = newGame();
    this.slot = slot;
    this.startedAt = performance.now();
  }

  loadSlot(slot: number): boolean {
    const s = saves.load(slot);
    if (!s) return false;
    this.state = s;
    this.slot = slot;
    this.startedAt = performance.now();
    return true;
  }

  /** Folds elapsed real time into the play-time counter. */
  tickPlaytime(): void {
    const now = performance.now();
    if (this.startedAt) this.state.playtimeMs += now - this.startedAt;
    this.startedAt = now;
  }

  save(roomName: string): SaveMeta | null {
    this.tickPlaytime();
    return saves.save(this.slot, this.state, roomName);
  }
}

export const session = new Session();

export function formatPlaytime(ms: number): string {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}
