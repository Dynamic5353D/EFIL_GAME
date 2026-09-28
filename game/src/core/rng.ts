/** Small seeded RNG (mulberry32). The state is a plain number so it can live inside saved/snapshotted state. */
export function nextRandom(state: { seed: number }): number {
  let t = (state.seed = (state.seed + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randRange(state: { seed: number }, min: number, max: number): number {
  return min + (max - min) * nextRandom(state);
}

export function pickWeighted<T>(state: { seed: number }, items: readonly { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  let r = nextRandom(state) * total;
  for (const i of items) {
    r -= Math.max(0, i.weight);
    if (r <= 0) return i.item;
  }
  return items[items.length - 1]!.item;
}
