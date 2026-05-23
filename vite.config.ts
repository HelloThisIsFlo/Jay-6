import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Dev build-id: a value that changes on every source edit (handleHotUpdate) and is baked
// into the served bundle. A stale/cached client therefore shows the OLD id while a fresh
// one shows the NEW id — a true "am I on the latest code?" signal (the footer prints it
// dev-only). Solves on-device UAT where iOS has no hard-refresh and a load-timestamp would
// lie (cached code still stamps a current time). Exposed as `virtual:build-id`.
function buildId(): Plugin {
  const VIRTUAL = 'virtual:build-id';
  const RESOLVED = '\0' + VIRTUAL;
  const gen = (): string =>
    Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5);
  let id = gen();
  return {
    name: 'jay6-build-id',
    resolveId(source) {
      return source === VIRTUAL ? RESOLVED : null;
    },
    load(resolved) {
      return resolved === RESOLVED ? `export const BUILD_ID = ${JSON.stringify(id)};` : null;
    },
    handleHotUpdate({ server }) {
      // Any source change → new id; drop the cached virtual module so the next fetch
      // (e.g. a phone reload) re-runs load() and serves the fresh id.
      id = gen();
      const mod = server.moduleGraph.getModuleById(RESOLVED);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
  };
}

export default defineConfig({
  plugins: [svelte(), buildId()],
  server: {
    host: true,         // bind 0.0.0.0
    allowedHosts: true, // allow LAN hostnames / IPs (dev-only convenience)
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
