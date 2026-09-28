import overrideFiles from 'virtual:overrides';

export interface Palette {
  dominant: string;
  shadow: string;
  highlight: string;
  accent: string;
  top: string;
  bottom: string;
  swatches: { c: string; w: number }[];
  light: { x: number; y: number };
  luma: number;
}

export interface ManifestImage {
  name: string;
  kind: 'env' | 'char' | 'creature' | 'item' | 'orb' | 'texture';
  source: string;
  size: [number, number];
  files: Partial<Record<'bg' | 'far' | 'art' | 'cutout' | 'icon' | 'portrait', string>>;
  cutout_size?: [number, number];
  credit?: string;
  note?: string;
  duplicate_of?: string;
  palette?: string;
}

export interface Manifest {
  images: Record<string, ManifestImage>;
  aliases: Record<string, string>;
  licensing: string;
}

const overrides = new Set(overrideFiles);

/** Resolves an asset path ("assets/portraits/x.webp"), preferring a file in assets/override/. */
export function assetUrl(path: string): string {
  const rel = path.replace(/^assets\//, '');
  return overrides.has(rel) ? `assets/override/${rel}` : path;
}

export function hasOverride(rel: string): boolean {
  return overrides.has(rel);
}

export const hexToInt = (h: string) => parseInt(h.replace('#', ''), 16);

class AssetDb {
  manifest: Manifest = { images: {}, aliases: {}, licensing: '' };
  palettes: Record<string, Palette> = {};

  async load(): Promise<void> {
    const [m, p] = await Promise.all([
      fetch('assets/asset-manifest.json').then((r) => r.json() as Promise<Manifest>),
      fetch('assets/palettes.json').then((r) => r.json() as Promise<Record<string, Palette>>),
    ]);
    this.manifest = m;
    this.palettes = p;
  }

  image(slug: string): ManifestImage | undefined {
    return this.manifest.images[slug];
  }

  palette(slug: string): Palette {
    return this.palettes[slug] ?? this.palettes.frozen_pond ?? {
      dominant: '#3a5a80', shadow: '#0b1422', highlight: '#e8f2ff', accent: '#5cc8ff', top: '#1d3350', bottom: '#dfe9f5',
      swatches: [], light: { x: 0, y: -1 }, luma: 0.5,
    };
  }

  credits(): { name: string; credit: string }[] {
    return Object.values(this.manifest.images).filter((i) => i.credit && !i.duplicate_of).map((i) => ({ name: i.name, credit: i.credit! }));
  }
}

export const assets = new AssetDb();

/** Texture keys used by Phaser for manifest files. */
export const texKey = {
  bg: (slug: string) => `bg:${slug}`,
  far: (slug: string) => `far:${slug}`,
  cut: (slug: string) => `cut:${slug}`,
  icon: (slug: string) => `icon:${slug}`,
  portrait: (slug: string) => `portrait:${slug}`,
  art: (slug: string) => `art:${slug}`,
};
