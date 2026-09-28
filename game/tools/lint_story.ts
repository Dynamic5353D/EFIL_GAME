/** `bun run lint:story`: lints every src/story/**\/*.story file. Exits 1 on any issue. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { lintStory } from '../src/story/lint';

const root = join(import.meta.dir, '..');
const storyDir = join(root, 'src', 'story');
const manifest = JSON.parse(readFileSync(join(root, 'public', 'assets', 'asset-manifest.json'), 'utf8')) as {
  images: Record<string, { kind: string; duplicate_of?: string }>;
};
const scenes = new Set(Object.entries(manifest.images).filter(([, r]) => r.kind === 'env' && !r.duplicate_of).map(([s]) => s));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.story') ? [p] : [];
  });
}

const files = walk(storyDir);
let issues = 0;
for (const f of files) {
  const rel = relative(root, f);
  for (const i of lintStory(readFileSync(f, 'utf8'), rel, { scenes })) {
    console.log(`${i.file}:${i.line}: ${i.message}`);
    issues++;
  }
}
console.log(`${files.length} script(s), ${issues} issue(s)`);
process.exit(issues ? 1 : 0);
