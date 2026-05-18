# Decisions Intel

> Extracted from the ingest set. No standalone ADR documents were classified — the entries below come from PRD-embedded decision logs (`.research/PLAN.md` "Decisions" section) and convention statements in `CLAUDE.md` / `CURRENT-STATE.md` that are decision-like.
> Treat as PROPOSED decisions (no `locked: true` markers from ingest). Downstream roadmapper may promote selected items to ADRs.

---

## DEC-platform-web
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: product platform
- **decision**: Web (browser) — iOS considered, dropped for prototype speed.

## DEC-stack-vite-svelte-ts-vitest
- **source**: `.research/PLAN.md` (Decisions → Closed); reinforced in `CLAUDE.md` + `CURRENT-STATE.md`
- **status**: closed
- **scope**: build / framework / language / test stack
- **decision**: Vite 6 + Svelte 5 (runes: `$state`, `$derived`, `$effect`) + TypeScript (strict) + Vitest 2.

## DEC-midi-lib-webmidijs
- **source**: `.research/PLAN.md` (Decisions → Closed); reinforced in `CLAUDE.md` + `CURRENT-STATE.md`
- **status**: closed
- **scope**: MIDI access library
- **decision**: WEBMIDI.js v3 wrapper for Web MIDI.

## DEC-browser-target-chrome-edge
- **source**: `.research/PLAN.md` (Decisions → Closed); reinforced in `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`
- **status**: closed
- **scope**: supported browsers (desktop)
- **decision**: Chrome / Edge on desktop only. Safari and Firefox lack Web MIDI. iPad needs the "Web MIDI Browser" app (Yonemoto).

## DEC-input-mouse-keyboard
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: input modalities
- **decision**: Mouse clicks + keyboard (Ableton "Computer MIDI Keyboard" mapping).

## DEC-repo-name
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: project identity
- **decision**: Repo name = `jay-6`.

## DEC-file-structure-modular
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: source layout
- **decision**: Modular layout (Vite/Svelte default — component-per-file; modules for `banks.ts`, `phrases.ts`, MIDI, clock). Concrete tree documented in `CURRENT-STATE.md` "Where things live".

## DEC-ui-layout-5-7-piano
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: chord pad UI layout
- **decision**: Mirror J-6 hardware: 5 black-key pads on top row (C#, D#, F#, G#, A#), 7 white-key pads on bottom row (C, D, E, F, G, A, B).

## DEC-bank-selector
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: bank navigation UI
- **decision**: Dropdown listing all 100 banks ("01 — [bank name]") + prev/next arrow buttons.

## DEC-pad-feedback
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: chord pad visual feedback
- **decision**: Pressed pad fills with accent colour (J-6 orange) + subtle outer glow.

## DEC-midi-channel-selectable
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: MIDI output channel
- **decision**: Selectable in UI (default channel 1).

## DEC-enharmonic-preserve
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: chord-bank data fidelity
- **decision**: Preserve Roland's enharmonic spellings as-published (`Bb` stays `Bb`, `A#` stays `A#`).

## DEC-chord-data-shape
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: chord data type
- **decision**: `{ name: string; notes: [number, number, number, number] }`.

## DEC-bank-label-fallback
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: chord-pad labels when chord-name is empty
- **decision**: Fallback to `"${key} ${bankName}"` (e.g. `"C Oct Stack"`).

## DEC-verification-two-extractions
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: J-6 chord-bank data sourcing
- **decision**: Verify by running extraction twice via independent agents, diff outputs, investigate mismatches.

## DEC-sequencing-scope-styles-1-5
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: phrase / playback styles in scope
- **decision**: Styles 1–5 in scope; Styles 6–9 out (Roland publishes no note data).

## DEC-clock-setinterval-prototype
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: clock implementation strategy
- **decision**: Use `setInterval` for prototype clock. Move to Web Audio API scheduler post-prototype only if needed. Reinforced by `CLAUDE.md` / `CURRENT-STATE.md` ("no premature features").

## DEC-latch-in-prototype
- **source**: `.research/PLAN.md` (Decisions → Closed)
- **status**: closed
- **scope**: latch feature inclusion
- **decision**: Latch included in prototype scope.

## DEC-bpm-startup-on-demand
- **source**: `.research/PLAN.md` (Decisions → Resolved during build)
- **status**: closed
- **scope**: clock startup behaviour
- **decision**: Clock starts on demand — engines lazy-create their `setInterval` on first `start()`. No surprise sound on load.

## DEC-latch-space-binding
- **source**: `.research/PLAN.md` (Decisions → Resolved during build)
- **status**: closed
- **scope**: keyboard shortcut for latch
- **decision**: `Space` key toggles latch. No conflict observed.

## DEC-latched-chord-swap-strategy
- **source**: `.research/PLAN.md` (Decisions → Resolved during build)
- **status**: closed
- **scope**: latched chord transition behaviour
- **decision**: Engines implement `setNotes()` for hot-swap. Hold / Phrase Dur release-old-then-play-new (single MIDI-event pair gap, inaudible). Arp keeps timeline position. Rhythm Gate swaps the in-flight hit if one is sounding.

## DEC-tick-source-24-ppq
- **source**: `CURRENT-STATE.md` (Architecture); reinforced in `CLAUDE.md` (Project conventions)
- **status**: closed (convention)
- **scope**: timing architecture
- **decision**: Single 24 PPQ tick stream (`tickSource.ts`), sourced from internal `setInterval` (BPM-driven) or external MIDI input port's `clock` events. Every time-driven engine subscribes to TickSource — engines never own timers.

## DEC-state-location
- **source**: `CURRENT-STATE.md` (Architecture); reinforced in `CLAUDE.md` (Project conventions)
- **status**: closed (convention)
- **scope**: reactive UI state
- **decision**: UI state lives in `src/state.svelte.ts` (`$state` runes). `App.svelte` bridges to imperative host + tickSource via `$effect`.

## DEC-engine-orchestrator
- **source**: `CURRENT-STATE.md` (Architecture / Conventions)
- **status**: closed (convention)
- **scope**: engine orchestration
- **decision**: `engines/host.ts` is the orchestrator. Pad press routes through the active engine, with latch + transpose applied at the boundary. Latch tracking lives in the host, not engines — engines don't know what a pad is.

## DEC-engines-time-source-agnostic
- **source**: `CURRENT-STATE.md` (Conventions); reinforced in `CLAUDE.md`
- **status**: closed (convention)
- **scope**: engine implementation rule
- **decision**: Engines count ticks, never call `Date.now()` or `setInterval` themselves. TickSource owns timing.

## DEC-style-data-structured
- **source**: `CURRENT-STATE.md` (Conventions)
- **status**: closed (convention)
- **scope**: phrase / variation data
- **decision**: Style data is structured (typed `ArpVariation` / `PhraseDurationVariation` / `RhythmVariation`), not stringly-typed. Pattern strings (`o_o_o~o_…`) are parsed once via `parseRhythmPattern`.

## DEC-tests-data-and-math-only
- **source**: `CURRENT-STATE.md` (Conventions)
- **status**: closed (convention)
- **scope**: testing strategy
- **decision**: Vitest covers data + math only. Web MIDI and Svelte 5 mounting are out of scope for vitest — UI smoke-tested in the browser.

## DEC-comments-why-only
- **source**: `CURRENT-STATE.md` (Conventions); reinforced in `CLAUDE.md`
- **status**: closed (convention)
- **scope**: code comment style
- **decision**: Comments explain WHY only. Identifiers carry WHAT. Don't restate the code.

## DEC-no-premature-features
- **source**: `CURRENT-STATE.md` (Conventions); reinforced in `CLAUDE.md`
- **status**: closed (convention)
- **scope**: feature-creep guardrail
- **decision**: Prototype intentionally skips Web Audio API scheduler, velocity, presets, persistence. These live in the Phase 3 backlog.

## DEC-banks-data-json-canonical
- **source**: `CLAUDE.md` (Project conventions)
- **status**: closed (convention)
- **scope**: chord-bank source of truth
- **decision**: `src/banks.data.json` is the verified Roland extraction. Don't edit by hand — if voicings need correcting, fix the JSON.

## DEC-update-current-state
- **source**: `CLAUDE.md` (Project conventions); reinforced in `CURRENT-STATE.md` "Updating this file"
- **status**: closed (convention)
- **scope**: documentation discipline
- **decision**: After meaningful changes, update `CURRENT-STATE.md` so the next agent (or future-self) lands oriented.

## DEC-deploy-cloudflare-tunnel
- **source**: `.research/PLAN.md` (Phase 2 → Deploy); `TUNNEL-SETUP.md`; `CURRENT-STATE.md`
- **status**: closed
- **scope**: public hosting
- **decision**: Cloudflare Tunnel routes `https://jay-6.kempenich.dev` (local Mac via `just serve`) and `https://jay-6.kempenich.ai` (always-on cluster tunnel → `jay-6.jay-6.svc.cluster.local:80`).

## DEC-deploy-k8s-ghcr
- **source**: `.research/PLAN.md` (Phase 2 → Deploy); `CURRENT-STATE.md`
- **status**: closed
- **scope**: always-on deployment pipeline
- **decision**: Dockerfile (`nginx:alpine`) + `k8s.yaml` + GHCR GitHub Action + `./deploy.sh`. Cluster-wide Cloudflare Tunnel exposes the service at `jay-6.kempenich.ai`.

## DEC-web-midi-locality
- **source**: `CURRENT-STATE.md` (MIDI / serving caveats); `TUNNEL-SETUP.md`; `README.md`
- **status**: closed (constraint)
- **scope**: Web MIDI deployment limitation
- **decision**: Web MIDI cannot be proxied across the Cloudflare tunnel — the OP-1 must be plugged into the same machine as the browser session. Web MIDI also requires a secure context (`localhost` OR HTTPS); plain `http://` LAN IPs are denied.
