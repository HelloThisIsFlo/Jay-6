# Constraints Intel

> No standalone SPEC documents were classified. Constraints below are extracted from PRD + DOC sources where they describe contracts (data shapes, protocol details, NFRs, deployment routing). Treat as advisory for downstream specs; promote to formal SPECs only if the roadmapper deems necessary.

---

## CON-chord-data-shape
- **source**: `.research/PLAN.md` (M1 → Chord banks)
- **type**: schema
- **content**:
  - `Bank = { index: number; name: string; chords: Chord[] }`
  - `Chord = { name: string; notes: [number, number, number, number] }`
  - 100 banks × 12 chords per bank (one per chromatic key C through B).
  - MIDI integers (C4 = 60). Scientific notation (`C4`, `G3`) is the source format on Roland's page; converted at extraction time.
  - Enharmonic spellings preserved as-published.

## CON-phrase-rhythm-notation
- **source**: `.research/PLAN.md` (M1 → Phrase data; M5)
- **type**: schema / protocol
- **content**:
  - Style 4+5 rhythm patterns encoded as 16-step strings: `o`=16th hit, `_`=16th rest, `o~`=8th, `o~~`=dotted 8th.
  - Strings parsed once into per-step events via `parseRhythmPattern` (see `src/phrases.ts`).
  - Style data is typed (`ArpVariation` / `PhraseDurationVariation` / `RhythmVariation`), not stringly-typed at use sites.

## CON-tick-source-protocol
- **source**: `CURRENT-STATE.md` (Architecture); reinforced in `CLAUDE.md`
- **type**: protocol
- **content**:
  - 24 PPQ tick stream (`src/tickSource.ts`).
  - Source = internal `setInterval` (BPM-driven) OR external MIDI input port `clock` events.
  - Every time-driven engine (`arp`, `phraseDuration`, `rhythmGate`) subscribes to TickSource and fires on its own tick modulus:
    - 8th = 12 ticks
    - 16th = 6 ticks
    - Triplet 8th = 8 ticks
  - Engines NEVER call `Date.now()` or `setInterval`. TickSource owns timing.

## CON-engine-interface
- **source**: `CURRENT-STATE.md` (Conventions); `.research/PLAN.md` (Resolved during build → latched chord swap)
- **type**: api-contract
- **content**:
  - `Engine.setNotes(notes)` = "swap chord, keep timeline". Used for smooth latched chord swaps.
  - `Engine.start()` = "fresh start, fire first hit immediately". Note: this is the source of the Phase 2 phase-alignment bug under external clock.
  - Engine interface lives at `src/engines/types.ts`.
  - Engines: `hold.ts`, `arp.ts`, `phraseDuration.ts`, `rhythmGate.ts`.
  - Orchestration: `src/engines/host.ts` (routes pad press → active engine; applies latch + transpose at boundary).

## CON-state-bridge-pattern
- **source**: `CURRENT-STATE.md` (Architecture); `CLAUDE.md` (Project conventions)
- **type**: api-contract
- **content**:
  - Global UI state in `src/state.svelte.ts` using Svelte 5 `$state` runes.
  - `App.svelte` bridges every state field into the imperative host + tickSource via `$effect`.
  - Setters live alongside state in `state.svelte.ts`.

## CON-midi-channel-default
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **type**: api-contract / behaviour
- **content**:
  - MIDI output channel selectable in UI; default = channel 1.
  - Range surfaced in UI = 1–16.

## CON-bpm-range
- **source**: `.research/UAT.md` §5; `.research/PLAN.md` (M6)
- **type**: nfr / contract
- **content**:
  - BPM input accepts 40 (slow) through 240 (fast).
  - Default on load = 110.
  - Live tempo updates: BPM changes apply audibly without engine restart.

## CON-transpose-range
- **source**: `.research/UAT.md` §4
- **type**: nfr / contract
- **content**:
  - Transpose unit = 12 semitones (octave) per button press / key.
  - Clamp range: `-36` to `+36`. Further presses are no-ops at the clamp.

## CON-web-midi-secure-context
- **source**: `CURRENT-STATE.md` (MIDI / serving caveats); `README.md`; `TUNNEL-SETUP.md`
- **type**: nfr / platform constraint
- **content**:
  - Web MIDI requires a secure context: `localhost` OR HTTPS.
  - Plain `http://` LAN IPs are denied MIDI access in Chrome/Edge.
  - Web MIDI cannot be proxied across the Cloudflare tunnel — OP-1 must be plugged into the same machine as the browser session.
  - Browser support: Chrome / Edge desktop only. Safari + Firefox lack Web MIDI. iPad needs the "Web MIDI Browser" app (Yonemoto) on iOS.

## CON-deploy-cluster-route
- **source**: `TUNNEL-SETUP.md`; `CURRENT-STATE.md` Phase 2
- **type**: api-contract / deployment routing
- **content**:
  - Cluster-wide Cloudflare Tunnel (also serves `sketchpad.kempenich.ai`, `gprmax.kempenich.ai`).
  - Public hostname route:
    - Subdomain: `jay-6`
    - Domain: `kempenich.ai`
    - Path: _(empty)_
    - Service Type: HTTP
    - URL: `jay-6.jay-6.svc.cluster.local:80`
  - Configuration location: Cloudflare Zero Trust > Networks > Tunnels > _tunnel_ > Public Hostname.
  - Cleanup: remove the `jay-6.kempenich.ai` entry from the Public Hostname tab; run `./cleanup.sh` to delete the K8s namespace.

## CON-deploy-just-serve
- **source**: `TUNNEL-SETUP.md`; `CURRENT-STATE.md` (Commands)
- **type**: api-contract / dev workflow
- **content**:
  - `just serve` runs Vite dev server + Cloudflare tunnel from the local Mac.
  - Tunnel exposes `https://jay-6.kempenich.dev` → `localhost:5173`.
  - Intended use: OP-1 plugged into the same Mac as the browser session.

## CON-just-recipes
- **source**: `CURRENT-STATE.md` (Commands); `CLAUDE.md` (Common commands); `README.md`
- **type**: api-contract / dev workflow
- **content**:
  - `just` — list recipes
  - `just dev` — Vite on `localhost:5173` (use this for Web MIDI dev)
  - `just dev-lan` — Vite on `0.0.0.0` (LAN viewers; MIDI requires localhost or HTTPS)
  - `just tunnel` — `cloudflared tunnel run TheMac` (HTTPS at jay-6.kempenich.dev)
  - `just serve` — `dev` + `tunnel` in parallel (Ctrl-C kills both)
  - `just test` — `vitest run`
  - `just check` — `svelte-check`
  - `just build` — `vite build`
  - `just ci` — `check + test + build`
  - `just docker-build` — local image sanity check (CI does the real push to GHCR)
  - `just deploy` — `./deploy.sh` (apply `k8s.yaml` to current `kubectl` context)

## CON-keyboard-mapping
- **source**: `.research/PLAN.md` (Keyboard shortcuts); `.research/UAT.md` §14; `README.md` (Keyboard); `CURRENT-STATE.md` (Phase 1)
- **type**: api-contract (UX contract)
- **content**:
  - Whites (bottom row pads): `A`=C, `S`=D, `D`=E, `F`=F, `G`=G, `H`=A, `J`=B.
  - Blacks (top row pads): `W`=C#, `E`=D#, `T`=F#, `Y`=G#, `U`=A#.
  - `Z` = transpose -1 octave, `X` = +1 octave.
  - `←` / `→` = bank prev / next.
  - `Space` = toggle latch.
  - `1`–`6` = switch style.
  - Active only when no input field is focused.

## CON-test-scope
- **source**: `CURRENT-STATE.md` (Conventions); `.research/PLAN.md` (Tech Stack)
- **type**: nfr (test discipline)
- **content**:
  - Vitest covers data correctness + parsing + clock math only.
  - Web MIDI and Svelte 5 component mounting are out of scope for vitest.
  - UI is smoke-tested in the browser.

## CON-source-of-truth-banks-json
- **source**: `CLAUDE.md` (Project conventions); `CURRENT-STATE.md` (Where things live)
- **type**: api-contract (data source-of-truth)
- **content**:
  - `src/banks.data.json` is the verified Roland extraction.
  - Do not edit by hand. If voicings need correcting, fix the JSON.
  - Loaded via `src/banks.data.ts` thin loader; consumed via `src/banks.ts` types + helpers (`getBank`, `labelFor`).
