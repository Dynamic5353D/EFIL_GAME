type Handler<T> = (payload: T) => void;

/** Tiny typed pub/sub used between scenes and systems. */
export class Emitter<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<Handler<never>>>();

  on<K extends keyof Events>(event: K, fn: Handler<Events[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) this.handlers.set(event, (set = new Set()));
    set.add(fn as Handler<never>);
    return () => set!.delete(fn as Handler<never>);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.handlers.get(event)?.forEach((fn) => (fn as Handler<Events[K]>)(payload));
  }
}

export interface GameEvents extends Record<string, unknown> {
  settings: { key: string };
  language: { lang: 'en' | 'ta' };
  toast: { text: string; icon?: string };
  tip: { id: string };
  hud: undefined;
}

export const bus = new Emitter<GameEvents>();
