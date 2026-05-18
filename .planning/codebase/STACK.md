# Technology Stack

**Analysis Date:** 2026-05-18

## Languages

**Primary:**
- TypeScript 5.9.3 — all source files under `src/` and `test/`
- Svelte 5.55.7 — UI components (`src/App.svelte`, `src/components/`)

**Secondary:**
- JavaScript — `svelte.config.js`, `scripts/diff-chord-extractions.mjs`

## Runtime

**Environment:**
- Browser (Chrome/Edge desktop required for Web MIDI API)
- Node.js 20 (Dockerfile builder stage, `node:20-alpine`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- Svelte 5.55.7 — UI framework using runes (`$state`, `$derived`, `$effect`); no SvelteKit, plain Vite app
- Vite 6.4.2 — dev server + production bundler

**Testing:**
- Vitest 2.1.9 — unit test runner; globals mode, node environment; config inline in `vite.config.ts`
- No browser-level test runner (Web MIDI not mockable in vitest; UI smoke-tested manually)

**Build/Dev:**
- `@sveltejs/vite-plugin-svelte` 5.1.1 — Svelte integration for Vite; preprocessor via `vitePreprocess()`
- `svelte-check` 4.x — TypeScript + accessibility linting for `.svelte` files
- Just — task runner (`Justfile`); wraps npm scripts + cloudflared + docker/k8s ops

## Key Dependencies

**Critical:**
- `webmidi` 3.1.16 — WEBMIDI.js v3; wraps the Web MIDI API; used in `src/midi.ts` and `src/tickSource.ts` for output port management, note on/off, and incoming MIDI clock

**Infrastructure:**
- `tslib` 2.x — TypeScript helper library
- `@tsconfig/svelte` 5.0.4 — base tsconfig preset extended by `tsconfig.json`

## Configuration

**TypeScript:**
- `tsconfig.json` — strict mode on, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`; extends `@tsconfig/svelte`; targets ESNext; moduleResolution: bundler
- `tsconfig.node.json` — covers `vite.config.ts` only

**Build:**
- `vite.config.ts` — single plugin (`svelte()`), server binds `0.0.0.0`, `allowedHosts: true`; vitest config inline (globals, node env, `test/**/*.test.ts`)
- `svelte.config.js` — only preprocessor: `vitePreprocess()`

**Environment:**
- No `.env` files present
- No runtime env vars required for the app itself (Web MIDI is a browser API)
- CI uses `secrets.GITHUB_TOKEN` (auto-injected by GitHub Actions) for GHCR push

**Nginx (production container):**
- `nginx.conf` — SPA fallback (`try_files … /index.html`), 1-year immutable cache on `/assets/`, `/healthz` health probe

## Platform Requirements

**Development:**
- Chrome or Edge (Web MIDI API required); Firefox/Safari unsupported
- `localhost` or HTTPS context mandatory for Web MIDI (plain LAN http:// is denied)
- `just dev` → `localhost:5173`
- `just serve` → `just dev` + Cloudflare tunnel → `https://jay-6.kempenich.dev`
- iPad: "Web MIDI Browser" (Yonemoto) app required; Safari/Chrome on iOS lack Web MIDI

**Production:**
- Docker image: `node:20-alpine` builder → `nginx:alpine` server
- Registry: `ghcr.io/hellothisisflo/jay-6:latest`
- Kubernetes: single-replica Deployment in `jay-6` namespace; 50m CPU / 64Mi RAM limit
- Exposed via Cloudflare Tunnel at `https://jay-6.kempenich.ai`

---

*Stack analysis: 2026-05-18*
