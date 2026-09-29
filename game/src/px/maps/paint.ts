/** A tiny helper for authoring map ground: start from a fill, paint rectangles and rows of characters. */
export class Ground {
  private rows: string[][];
  constructor(readonly w: number, readonly h: number, fill = '.') {
    this.rows = Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
  }
  rect(x: number, y: number, w: number, h: number, ch: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.rows[j]?.[i] !== undefined) this.rows[j]![i] = ch;
    return this;
  }
  row(y: number, ch: string, x0 = 0, x1 = this.w - 1): this {
    return this.rect(x0, y, x1 - x0 + 1, 1, ch);
  }
  set(x: number, y: number, ch: string): this {
    return this.rect(x, y, 1, 1, ch);
  }
  get(x: number, y: number): string | undefined {
    return this.rows[y]?.[x];
  }
  /** Paint `ch` over one character only (e.g. petals only where there is grass). */
  replace(x: number, y: number, w: number, h: number, from: string, to: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.rows[j]?.[i] === from) this.rows[j]![i] = to;
    return this;
  }
  done(): string[] {
    return this.rows.map((r) => r.join(''));
  }
}
