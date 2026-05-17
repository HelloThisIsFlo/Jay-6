# Jay-6 task runner. Run `just` for the list.

set shell := ["bash", "-cu"]

# Default: list recipes.
default:
    @just --list

# Vite dev server, localhost only (Web MIDI works in Chrome/Edge).
dev:
    npm run dev

# Vite dev server bound to 0.0.0.0 (LAN viewers — MIDI still requires localhost).
dev-lan:
    npm run dev:lan

# Cloudflared tunnel to jay-6.kempenich.dev (HTTPS, Web MIDI works in desktop browsers).
# Uses the TheMac tunnel config at ~/.cloudflared/config-themac.yml.
tunnel:
    cloudflared tunnel --config ~/.cloudflared/config-themac.yml run TheMac

# Dev server + Cloudflare tunnel in parallel.
# Open https://jay-6.kempenich.dev once both are up. Ctrl-C kills both.
serve:
    #!/usr/bin/env bash
    set -euo pipefail
    trap 'kill 0' EXIT INT TERM
    just dev &
    just tunnel &
    wait

# Vitest run once.
test:
    npm test

# svelte-check (type errors + accessibility).
check:
    npm run check

# Production build (no deploy — local dev only per PLAN).
build:
    npm run build

# Run check + tests + build.
ci: check test build
