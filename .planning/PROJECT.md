# Jay-6

## What This Is

Browser app that turns J-6-style chord pads into MIDI — primarily for the Teenage Engineering OP-1 (incl. OP-1 field over Bluetooth MIDI). Solo tool for Flo. Click (or keyboard-press) a chord pad → MIDI flows out to the OP-1 → the OP-1 plays. Goal: reproduce the Roland J-6 chord-pad experience in any (Web-MIDI-capable) browser, extensible toward a Phase 3 sequencer.

## Core Value

**Drive the OP-1 (USB or BT) with the J-6's chord library + playback styles from a browser, without owning the J-6 hardware.**

If everything else regresses, *that loop must still work*: pick a bank → press a pad → OP-1 plays the right chord through the right style.

## Requirements

### Validated

<!-- Shipped + verified informally on hardware. UAT walkthrough still gates formal Phase 1 sign-off. -->

- ✓ **REQ-data-chord-banks** — Phase 1 (shipped, voicing audit open in Phase 2)
- ✓ **REQ-data-phrases** — Phase 1
- ✓ **REQ-midi-output** — Phase 1
- ✓ **REQ-midi-input** — Phase 1
- ✓ **REQ-chord-pad-ui** — Phase 1
- ✓ **REQ-top-bar-layout** — Phase 1
- ✓ **REQ-bank-navigation** — Phase 1
- ✓ **REQ-transpose** — Phase 1
- ✓ **REQ-arpeggiator** — Phase 1
- ✓ **REQ-phrase-duration** — Phase 1
- ✓ **REQ-rhythm-gate** — Phase 1 (gate-slider flagged suspect, retest in UAT)
- ✓ **REQ-clock** — Phase 1
- ✓ **REQ-bpm** — Phase 1
- ✓ **REQ-latch** — Phase 1
- ✓ **REQ-style-selector** — Phase 1
- ✓ **REQ-hold-engine** — Phase 1
- ✓ **REQ-keyboard-shortcuts** — Phase 1
- ✓ **REQ-op-1-end-to-end** — Phase 1 (M8 hands-on)
- ✓ **REQ-clock-receive** — Phase 2 (done)
- ✓ **REQ-deploy-cloudflare-dev** — Phase 2 (done)
- ✓ **REQ-deploy-k8s-always-on** — Phase 2 (done)
- ✓ **REQ-lan-exposure** — Phase 2 (done)
- ✓ **REQ-ipad-web-midi-browser** — Phase 2 (done)

> Note: "Validated" here = shipped + author-tested. **Formal validation happens at UAT walkthrough (REQ-uat-walkthrough), which gates Phase 2 close and retroactively signs off Phase 1.**

### Active

<!-- Current scope. Phase 2 close + Phase 3 placeholder. -->

- [ ] **REQ-gate-slider** — verify gate-length is audibly distinguishable (Phase 2 / UAT)
- [ ] **REQ-rhythm-phase-alignment-ext-clock** — bug fix: anchor first step to next tick-mod-24 (Phase 2)
- [ ] **REQ-clock-send-transport-sync** — 24 PPQ out + Start/Stop/Continue/Record both ways (Phase 2)
- [ ] **REQ-voicing-second-pass-audit** — tighten ~30% inferred chord slots (Phase 2)
- [ ] **REQ-ipad-polish** — `user-select: none` on TopBar + touch ergonomics re-review (Phase 2)
- [ ] **REQ-uat-walkthrough** — run `.research/UAT.md` end-to-end via `uat-agent` skill (Phase 2 gate)
- [ ] **REQ-edge-cases** — hot-plug + refresh + style-swap regressions (verified during UAT)
- [ ] **REQ-phase-3-sequencer** — Phase 3 placeholder, scope TBD

### Out of Scope

<!-- Explicit, with reasoning. Captured from REQ-out-of-scope-prototype + project conventions. -->

- **Style 6–9 phrases** — Roland publishes no note data; reverse-engineering or hand-rolling is high-cost / low-confidence. May revisit if Phase 3 needs them.
- **Velocity control** — prototype intentionally fixed-velocity; adds complexity without changing the core loop.
- **Persistence (last bank / BPM / port / latch)** — deferred to Phase 3+; current "load with defaults" is fine for a solo tool.
- **Save/recall favourite presets** — Phase 3+ alongside persistence.
- **Web Audio API scheduler** — `setInterval` is "good enough" per DEC-no-premature-features; revisit only if drift becomes a real-use problem.
- **Safari / Firefox support** — no Web MIDI implementation. iPad workaround = "Web MIDI Browser" app.
- **Multi-channel / multi-output routing** — single output, single channel by design.
- **User-defined banks / chord import** — Roland J-6 factory set is the whole point.
- **Backend / accounts / multi-user** — solo tool, static SPA, no server logic.

## Context

- **Solo developer + Claude.** No team, no stakeholders, no sprints. Flo is the visionary + product owner; Claude is the implementer.
- **Hardware target.** Teenage Engineering OP-1 (class-compliant USB MIDI) and OP-1 field (Bluetooth MIDI). Other MIDI synths work as a bonus.
- **Phase 1 already shipped + hardware-verified informally** — formal UAT walkthrough (Phase 2 deliverable) is the gate that retroactively signs Phase 1 off.
- **Already deployed.**
  - `https://jay-6.kempenich.dev` — `just serve` (local Mac, dev tunnel — use when OP-1 is plugged into the Mac).
  - `https://jay-6.kempenich.ai` — always-on K8s cluster behind a cluster-wide Cloudflare Tunnel.
- **Known open bugs (Phase 2 scope).**
  - Rhythm-engine first step fires immediately under external clock → off-beat.
  - `subscribeTransport` plumbing exists in `tickSource.ts` but nothing wires it → OP-1 Start/Stop/Continue is silently dropped.
  - No 24 PPQ clock send despite infrastructure being there.
  - ~30% of `banks.data.json` slots are inferred from a divergent two-extraction diff.
- **Codebase intel.** Full audit at `.planning/codebase/` (ARCHITECTURE / STACK / STRUCTURE / TESTING / CONVENTIONS / CONCERNS / INTEGRATIONS).

## Constraints

- **Tech stack**: Vite 6 + Svelte 5 (runes) + TypeScript strict + Vitest 2 + WEBMIDI.js v3 — DEC-stack + DEC-midi-lib. Locked for v1.
- **Web MIDI platform**: Chrome / Edge desktop only. iPad requires "Web MIDI Browser" (Yonemoto). Safari / Firefox excluded — no Web MIDI implementation.
- **Secure-context requirement**: Web MIDI only works on `localhost` OR HTTPS. Plain `http://` LAN IPs are denied — drives the `just serve` tunnel + K8s HTTPS setup.
- **Web MIDI locality**: OP-1 must be plugged into the same machine as the browser session. MIDI cannot be proxied over the Cloudflare tunnel.
- **Single timing source**: 24 PPQ TickSource in `src/tickSource.ts`. Engines subscribe — they never own timers (DEC-tick-source-24-ppq + DEC-engines-time-source-agnostic).
- **Engine orchestration**: All pad routing + latch + transpose go through `engines/host.ts`. Latch state lives in the host, not engines (DEC-engine-orchestrator).
- **State location**: UI state in `src/state.svelte.ts` (`$state` runes); `App.svelte` bridges to imperative host + tickSource via `$effect` (DEC-state-location).
- **Chord data source of truth**: `src/banks.data.json` is the verified Roland extraction. Hand-edits forbidden — fix the JSON only (DEC-banks-data-json-canonical).
- **Test scope**: Vitest covers data + math only. Web MIDI + Svelte component mounting out of scope. UI smoke-tested in browser (DEC-tests-data-and-math-only).
- **Comments**: WHY only — identifiers do the WHAT (DEC-comments-why-only).
- **No premature features**: No Web Audio scheduler, no presets, no persistence, no velocity until Phase 3+ (DEC-no-premature-features).

## Key Decisions

<!-- Promoted from .planning/intel/decisions.md — items load-bearing for current + Phase 2/3 work. Full set lives in intel/decisions.md. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **DEC-tick-source-24-ppq** — Single 24 PPQ TickSource (internal `setInterval` OR external MIDI clock); engines subscribe | Decouples timing from engines; one knob switches Int↔Ext clock | ✓ Good |
| **DEC-engines-time-source-agnostic** — Engines count ticks, never call `Date.now()` / `setInterval` | Engines are testable + clock-source-portable | ✓ Good |
| **DEC-engine-orchestrator** — `engines/host.ts` routes pad press; applies latch + transpose at the boundary | Engines don't know what a pad is; latch state has one home | ⚠️ Revisit — fragile latch state machine (see `.planning/codebase/CONCERNS.md`) |
| **DEC-state-location** — UI state in `state.svelte.ts` (`$state` runes); `App.svelte` bridges via `$effect` | Reactive state + imperative engines stay cleanly separated | ✓ Good |
| **DEC-banks-data-json-canonical** — `src/banks.data.json` is the verified Roland extraction; never hand-edit | Single source of truth; voicing fixes are JSON-only | ⚠️ Revisit — Phase 2 voicing audit will rewrite ~30% of slots |
| **DEC-no-premature-features** — No Web Audio scheduler, no velocity, no persistence, no presets until Phase 3+ | Keeps prototype small + the surface area honest | ✓ Good |
| **DEC-web-midi-locality** — OP-1 must be on same machine as browser; cannot proxy MIDI over the tunnel | Hard Web-MIDI constraint; drives `just serve` (local) vs `kempenich.ai` (always-on but no MIDI) split | ✓ Good |
| **DEC-deploy-cloudflare-tunnel + K8s** — `jay-6.kempenich.dev` for local dev tunnel, `jay-6.kempenich.ai` for always-on cluster | Secure context for Web MIDI on iPad + always-on URL for any-browser browsing | ✓ Good |
| **DEC-browser-target-chrome-edge** — Desktop Chrome/Edge only; iPad via "Web MIDI Browser" app | Only browsers with Web MIDI; iPad workaround is documented | ✓ Good |

---
*Last updated: 2026-05-18 — initial bootstrap from existing prototype + Phase 2 in-progress state.*
