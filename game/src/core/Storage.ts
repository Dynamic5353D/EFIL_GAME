/** Key/value storage. Uses localStorage when it works, otherwise an in-memory map (private windows,
 * blocked storage, tests). Every access is wrapped: storage failures never break the game. */
export interface KV {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  remove(key: string): void;
  keys(): string[];
}

export class MemoryKV implements KV {
  private map = new Map<string, string>();
  get(key: string) { return this.map.get(key) ?? null; }
  set(key: string, value: string) { this.map.set(key, value); return true; }
  remove(key: string) { this.map.delete(key); }
  keys() { return [...this.map.keys()]; }
}

class LocalKV implements KV {
  private fallback = new MemoryKV();
  private ok: boolean;
  constructor() {
    this.ok = false;
    try {
      const probe = '__efil_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      this.ok = true;
    } catch { /* storage blocked: use memory */ }
  }
  get(key: string) {
    if (!this.ok) return this.fallback.get(key);
    try { return localStorage.getItem(key); } catch { return this.fallback.get(key); }
  }
  set(key: string, value: string) {
    this.fallback.set(key, value);
    if (!this.ok) return false;
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
  remove(key: string) {
    this.fallback.remove(key);
    try { if (this.ok) localStorage.removeItem(key); } catch { /* ignore */ }
  }
  keys() {
    if (!this.ok) return this.fallback.keys();
    try { return Object.keys(localStorage); } catch { return this.fallback.keys(); }
  }
  get persistent() { return this.ok; }
}

export const storage: KV = typeof localStorage === 'undefined' ? new MemoryKV() : new LocalKV();

export function readJSON<T>(kv: KV, key: string): T | null {
  const raw = kv.get(key);
  if (raw == null) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function writeJSON(kv: KV, key: string, value: unknown): boolean {
  try { return kv.set(key, JSON.stringify(value)); } catch { return false; }
}
