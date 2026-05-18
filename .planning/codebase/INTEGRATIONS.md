# External Integrations

**Analysis Date:** 2026-05-18

## MIDI

**Web MIDI API (browser native):**
- Purpose: communicate with USB-connected MIDI hardware (primary target: OP-1)
- Requires: Chrome or Edge desktop; secure context (localhost or HTTPS)
- Integration layer: `src/midi.ts` — wraps `WebMidi.enable()`, port enumeration, `sendNoteOn` / `sendNoteOff` / `sendAllNotesOff`
- Not mockable in unit tests; validated manually in browser

**WEBMIDI.js v3 (`webmidi` 3.1.16):**
- SDK: `import { WebMidi, type Output, type OutputChannel, type Input } from 'webmidi'`
- Used in: `src/midi.ts`, `src/tickSource.ts`
- Handles: output port management, note messages, incoming MIDI clock (`clock`, `start`, `stop`, `continue` events)
- Auth: none (browser permission prompt via `navigator.requestMIDIAccess`)
- Docs: https://webmidijs.org/docs/

**OP-1 (Roland/Teenage Engineering) — hardware target:**
- Not an SDK — a USB MIDI device
- Jay-6 sends Note On/Off on any user-selected output port + channel (1–16)
- Jay-6 can also receive MIDI clock _from_ the OP-1 (external clock mode in `src/tickSource.ts`)
- Web MIDI cannot be proxied over network — OP-1 must be physically connected to the machine running the browser

**"Web MIDI Browser" app (iOS workaround):**
- By: Yonemoto; available on App Store
- Purpose: fills the Web MIDI gap in iOS Safari/Chrome
- No code change needed; exposes the same Web MIDI API to the browser engine
- iPad users open `https://jay-6.kempenich.ai` inside this app

## Data Storage

**Databases:** None

**File Storage:** None

**Caching:**
- Static assets served with `Cache-Control: public, immutable, max-age=1y` by nginx (`nginx.conf`)
- No runtime cache service

## Authentication & Identity

**Auth Provider:** None — app is fully public, no login

## Build & CI/CD

**CI Pipeline:**
- GitHub Actions — `.github/workflows/build.yml`
- Trigger: push to `main` branch
- Steps: checkout → GHCR login (`docker/login-action@v3`) → build + push (`docker/build-push-action@v6`)
- Platforms: `linux/amd64`
- Tags: `:latest` + `:<git-sha>`
- Auth: `secrets.GITHUB_TOKEN` (GitHub-injected; no stored secret needed)

**Container Registry:**
- GitHub Container Registry (GHCR)
- Image: `ghcr.io/hellothisisflo/jay-6`
- Pulled by Kubernetes with `imagePullPolicy: Always`

## Deployment

**Kubernetes:**
- Manifest: `k8s.yaml` — Deployment (1 replica) + ClusterIP Service in namespace `jay-6`
- Image: `ghcr.io/hellothisisflo/jay-6:latest`
- Resources: 5m–50m CPU, 32–64Mi RAM, 128Mi ephemeral storage
- Health probes: `GET /healthz` → nginx returns `200 ok`
- Deploy script: `deploy.sh` — creates namespace, applies `k8s.yaml`, forces rollout restart, waits for rollout

**Cloudflare Tunnel (production — always-on):**
- Exposes the K8s ClusterIP service at `https://jay-6.kempenich.ai`
- Cluster-wide shared tunnel (also serves `sketchpad.kempenich.ai`, `gprmax.kempenich.ai`)
- Route: `jay-6.kempenich.ai` → `jay-6.jay-6.svc.cluster.local:80`
- Managed in Cloudflare Zero Trust dashboard (Networks > Tunnels > Public Hostname)
- No cloudflared pod config in this repo — tunnel is cluster-level infrastructure

**Cloudflare Tunnel (local dev — `just serve`):**
- `cloudflared tunnel --config ~/.cloudflared/config-themac.yml run TheMac`
- Routes `https://jay-6.kempenich.dev` → `localhost:5173`
- Config lives on the developer's Mac, not in the repo
- Use case: HTTPS dev session when OP-1 is plugged into the same Mac

## Monitoring & Observability

**Error Tracking:** None

**Logs:**
- Browser console only (dev)
- Nginx access logs in container (not collected/forwarded)

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## External Reference Data

**Roland J-6 chord/phrase documentation:**
- Chord list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- Phrase list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Source data extracted into `src/banks.data.json` (100 chord banks, verified two-extraction diff)
- Do not edit `src/banks.data.json` by hand; correct via the JSON if voicings are wrong

## Environment Configuration

**Required env vars:** None for the app itself

**CI secrets:**
- `GITHUB_TOKEN` — auto-injected by GitHub Actions; used for GHCR push; not stored manually

**Secrets location:** No secrets stored in this repo

---

*Integration audit: 2026-05-18*
