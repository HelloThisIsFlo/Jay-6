# Jay-6

## What This Is

Browser app that turns J-6-style chord pads into MIDI — primarily for the Teenage Engineering OP-1 (incl. OP-1 field over Bluetooth MIDI). Solo tool for Flo. Click (or keyboard-press) a chord pad → MIDI flows out to the OP-1 → the OP-1 plays. Jay-6 is evolving into a musical companion that helps players discover useful chord combinations without taking over performance or musical decisions.

## Core Value

**Drive the OP-1 (USB or BT) with the J-6's chord library + playback styles from a browser, without owning the J-6 hardware.**

If everything else regresses, *that loop must still work*: pick a bank → press a pad → OP-1 plays the right chord through the right style.

## Current Milestone: v2.0 Musical Companion

**Goal:** Help players discover useful chord combinations while keeping performance and musical decisions in their hands.

**Target features:**

- Bank-aware chord-progression suggestions backed by a plain, agent-editable catalogue with useful initial content.
- Implement the previously designed chord-chip rail beneath the pads.
- Complete focused performance polish: Up/Down variation cycling, queued-change toast feedback, and measured external-clock BPM.

## Requirements

### Validated

<!-- All 31 v1 requirements shipped + signed off by the UAT walkthrough (11/11 PASS on hardware, 2026-05-23). -->

**Phase 1 — Prototype (v1.0):**

- ✓ **REQ-data-chord-banks** — v1.0 (voicing audit closed in Phase 2)
- ✓ **REQ-data-phrases** — v1.0
- ✓ **REQ-midi-output** — v1.0
- ✓ **REQ-midi-input** — v1.0
- ✓ **REQ-chord-pad-ui** — v1.0
- ✓ **REQ-top-bar-layout** — v1.0
- ✓ **REQ-bank-navigation** — v1.0
- ✓ **REQ-transpose** — v1.0
- ✓ **REQ-arpeggiator** — v1.0
- ✓ **REQ-phrase-duration** — v1.0
- ✓ **REQ-rhythm-gate** — v1.0
- ✓ **REQ-clock** — v1.0
- ✓ **REQ-bpm** — v1.0
- ✓ **REQ-latch** — v1.0
- ✓ **REQ-style-selector** — v1.0
- ✓ **REQ-hold-engine** — v1.0
- ✓ **REQ-keyboard-shortcuts** — v1.0
- ✓ **REQ-op-1-end-to-end** — v1.0 (M8 hands-on + UAT)

**Phase 2 — Polish + acceptance (v1.0):**

- ✓ **REQ-clock-receive** — v1.0
- ✓ **REQ-clock-send-transport-sync** — v1.0 (24 PPQ out + Start/Stop/Continue/Record both ways; downbeat-aligned, double-trigger guarded)
- ✓ **REQ-rhythm-phase-alignment-ext-clock** — v1.0 (first step anchors to next bar downbeat under Ext clock)
- ✓ **REQ-gate-slider** — v1.0 (UAT-confirmed audibly distinguishable; suspect flag cleared)
- ✓ **REQ-voicing-second-pass-audit** — v1.0 (~30% inferred slots tightened against manual/hardware)
- ✓ **REQ-ipad-polish** — v1.0 (app-wide `user-select:none`, touch ergonomics, iPhone landscape reachability)
- ✓ **REQ-ipad-web-midi-browser** — v1.0
- ✓ **REQ-edge-cases** — v1.0 (single clear-all/panic path; hot-plug + reload + style-swap)
- ✓ **REQ-user-manual** — v1.0 (MANUAL.md at repo root, consumer-product voice)
- ✓ **REQ-uat-walkthrough** — v1.0 (11/11 PASS on hardware, 2026-05-23 — the v1 acceptance gate)
- ✓ **REQ-deploy-cloudflare-dev** — v1.0
- ✓ **REQ-deploy-k8s-always-on** — v1.0
- ✓ **REQ-lan-exposure** — v1.0

**Pre-v2 visual redesign (Phase 02.1):**

- ✓ **REQ-visual-redesign-v3** — shared visual tokens, TopBar C2, lifted pad surface, and per-style variation controls adopted
- ✓ **REQ-responsive-redesign-coverage** — desktop, iPad-sized, and iPhone-landscape layouts browser-verified
- ✓ **REQ-existing-behavior-preservation** — existing routing, tempo, variation, pointer, keyboard, and latch paths preserved

### Active

<!-- v2.0 scope. Refined into requirement IDs after milestone research. -->

- [ ] **Bank-aware progression suggestions** — show useful chord combinations for the selected factory bank without automating playback.
- [ ] **Agent-editable progression catalogue** — keep progression content simple to inspect and extend with an agent.
- [ ] **Initial progression content** — ship a useful starting catalogue rather than an empty authoring mechanism.
- [ ] **Previously designed chord-chip rail** — render suggestions beneath the pads while keeping the performance surface primary.
- [ ] **Variation keyboard cycling** — Up/Down cycles the current style's variations with wraparound.
- [ ] **Queued variation toast** — confirm slow pending changes using the existing toast design.
- [ ] **Measured external-clock BPM** — show a stable BPM derived from incoming 24 PPQ MIDI clock while preserving the internal BPM setting.

### Out of Scope

<!-- Explicit, with reasoning. Captured from REQ-out-of-scope-prototype + project conventions. -->

- **Sequencer** — v2.0 suggests what to play but never schedules or performs a progression for the player.
- **Host-owned play/latch architecture refactor** — valuable technical debt, but unrelated to the focused musical-companion outcome.
- **OP-1 transport reset / record sync** — deferred; v2.0 does not expand transport behavior.
- **Touch-oriented Bank and Channel selector exploration** — separate UX exploration, not required for the progression companion.
- **Style 6–9 phrases or other new styles** — Roland publishes no note data; reverse-engineering or hand-rolling is high-cost / low-confidence.
- **Velocity control** — prototype intentionally fixed-velocity; adds complexity without changing the core loop.
- **Persistence (last bank / BPM / port / latch)** — current "load with defaults" is fine for a solo tool.
- **Save/recall favourite presets** — Phase 3+ alongside persistence.
- **Web Audio API scheduler** — `setInterval` is "good enough" per DEC-no-premature-features; revisit only if drift becomes a real-use problem.
- **Safari / Firefox support** — no Web MIDI implementation. iPad workaround = "Web MIDI Browser" app.
- **Multi-channel / multi-output routing** — single output, single channel by design.
- **User-defined banks / chord import** — Roland J-6 factory set is the whole point; the editable catalogue describes progressions, not banks.
- **Backend / accounts / multi-user** — solo tool, static SPA, no server logic.

## Context

- **Shipped v1.0** (2026-05-23) — ~2,133 LOC TS/Svelte, 45/45 unit tests green, **UAT 11/11 PASS on hardware**. v1 = full J-6 chord-pad → OP-1 loop + 6 styles + latch + keyboard + bidirectional transport sync.
- **Solo developer + Claude.** No team, no stakeholders, no sprints. Flo is the visionary + product owner; Claude is the implementer.
- **Hardware target.** Teenage Engineering OP-1 (class-compliant USB MIDI) and OP-1 field (Bluetooth MIDI). Other MIDI synths work as a bonus.
- **Deployed.**
  - `https://jay-6.kempenich.dev` — `just serve` (local Mac, dev tunnel — use when OP-1 is plugged into the Mac).
  - `https://jay-6.kempenich.ai` — always-on K8s cluster behind a cluster-wide Cloudflare Tunnel.
- **v1 bugs closed.** All Phase 2 open bugs resolved + verified: Ext-clock first-step downbeat alignment, OP-1 Start/Stop/Continue wired, 24 PPQ clock send, voicing audit (~30% inferred slots tightened).
- **Pre-v2 visual refresh shipped** (2026-07-10) — Jay-6 v3 treatment verified across desktop, iPad-sized, and iPhone-landscape layouts without changing playback behavior.
- **v2.0 focus:** bank-aware progression discovery plus three already-defined performance improvements: variation keyboard cycling, queued-change feedback, and measured external-clock BPM.
- **Progression rail design exists, implementation does not.** The approved chord-chip rail sits below the pads, resolves pad letters to the current bank's chord names, and remains visually subordinate to the performance surface.
- **Deferred technical debt remains explicit.** Host-owned play/latch truth and transport-reset record sync stay captured as todos but are not part of v2.0.
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
| **DEC-engine-orchestrator** — `engines/host.ts` routes pad press; applies latch + transpose at the boundary | Engines don't know what a pad is; latch state has one home | ⚠️ Revisit later — fragile latch state machine is captured technical debt but explicitly excluded from v2.0 |
| **DEC-state-location** — UI state in `state.svelte.ts` (`$state` runes); `App.svelte` bridges via `$effect` | Reactive state + imperative engines stay cleanly separated | ✓ Good |
| **DEC-banks-data-json-canonical** — `src/banks.data.json` is the verified Roland extraction; never hand-edit | Single source of truth; voicing fixes are JSON-only | ✓ Good — v1 voicing audit tightened the ~30% inferred slots; JSON-only fix held |
| **DEC-no-premature-features** — No Web Audio scheduler, no velocity, no persistence, no presets until Phase 3+ | Keeps prototype small + the surface area honest | ✓ Good |
| **DEC-web-midi-locality** — OP-1 must be on same machine as browser; cannot proxy MIDI over the tunnel | Hard Web-MIDI constraint; drives `just serve` (local) vs `kempenich.ai` (always-on but no MIDI) split | ✓ Good |
| **DEC-deploy-cloudflare-tunnel + K8s** — `jay-6.kempenich.dev` for local dev tunnel, `jay-6.kempenich.ai` for always-on cluster | Secure context for Web MIDI on iPad + always-on URL for any-browser browsing | ✓ Good |
| **DEC-browser-target-chrome-edge** — Desktop Chrome/Edge only; iPad via "Web MIDI Browser" app | Only browsers with Web MIDI; iPad workaround is documented | ✓ Good |
| **DEC-ui-small-token-layer** — Shared CSS tokens plus scoped component styles | Captures the approved instrument language without introducing a component framework | ✓ Good — Phase 02.1 |
| **DEC-variation-models-derived** — Variation controls derive from phrase metadata and remain stateless | Prevents duplicated mappings and preserves the existing `ui.variation` path | ✓ Good — Phase 02.1 |
| **DEC-orange-means-sounding** — Orange is reserved for sounding or latched pads | Keeps active playback distinct from setup, selection, and system state | ✓ Good — Phase 02.1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-29 after starting milestone v2.0 Musical Companion.*
