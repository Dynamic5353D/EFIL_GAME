import Phaser from 'phaser';
import { assets, assetUrl, texKey } from './Assets';

export type TexKind = 'bg' | 'far' | 'cut' | 'icon' | 'portrait' | 'art';

const FILE_OF: Record<TexKind, 'bg' | 'far' | 'cutout' | 'icon' | 'portrait' | 'art'> = {
  bg: 'bg', far: 'far', cut: 'cutout', icon: 'icon', portrait: 'portrait', art: 'art',
};

/** Texture key + URL for a manifest image; null if the manifest has no such file. */
export function spec(kind: TexKind, slug: string): { key: string; url: string } | null {
  const img = assets.image(slug);
  const file = img?.files[FILE_OF[kind]];
  if (!file) return null;
  return { key: texKey[kind](slug), url: assetUrl(file) };
}

/** Loads any of the given textures that aren't loaded yet. Resolves when done (missing files are skipped). */
export function ensureTextures(scene: Phaser.Scene, specs: ({ key: string; url: string } | null)[]): Promise<void> {
  const todo = specs.filter((s): s is { key: string; url: string } => !!s && !scene.textures.exists(s.key));
  if (!todo.length) return Promise.resolve();
  return new Promise((resolve) => {
    for (const s of todo) scene.load.image(s.key, s.url);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => resolve());
    scene.load.start();
  });
}
