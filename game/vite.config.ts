import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const OVERRIDE_DIR = join(__dirname, 'public', 'assets', 'override');

function listOverrides(dir = OVERRIDE_DIR): string[] {
  try {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) return listOverrides(p);
      return /\.(webp|png|jpe?g|json)$/i.test(f) ? [relative(OVERRIDE_DIR, p).split('\\').join('/')] : [];
    });
  } catch {
    return [];
  }
}

/** `virtual:overrides` exports the files in public/assets/override/, so dropping art in needs no code change. */
function overrides(): Plugin {
  const id = 'virtual:overrides';
  const resolved = '\0' + id;
  return {
    name: 'efil-overrides',
    resolveId: (s) => (s === id ? resolved : null),
    load: (s) => (s === resolved ? `export default ${JSON.stringify(listOverrides())};` : null),
    configureServer(server) {
      server.watcher.add(OVERRIDE_DIR);
      const refresh = (file: string) => {
        if (!file.startsWith(OVERRIDE_DIR)) return;
        const mod = server.moduleGraph.getModuleById(resolved);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [overrides()],
  server: {
    port: 5173,
    strictPort: true,
    // The project path contains ':' ("EFIL: The Game"), which Vite's fs allow-list check mis-parses.
    // This is a local-only dev server, so the strict check is turned off.
    fs: { strict: false },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
});
