# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-18)

**Core value:** Drive the OP-1 (USB or BT) with the J-6's chord library + playback styles from a browser, without owning the J-6 hardware.
**Current focus:** Phase 2 — Post-prototype polish + UAT acceptance.

## Current Position

Phase: 2 of 3 (Post-prototype polish + UAT acceptance)
Plan: 0 of TBD in current phase
Status: In progress (carried in from existing prototype + Phase 2 work done before GSD bootstrap)
Last activity: 2026-05-18 — bootstrapped `.planning/` (PROJECT / REQUIREMENTS / ROADMAP / STATE) from `.planning/intel/` synthesis.

Progress: [██████░░░░] ~60% — Phase 1 shipped (informal); Phase 2 done items: clock receive, deploys, LAN, latched-pad highlight. Open: transport sync + clock send, rhythm phase alignment, voicing audit, iPad polish, UAT walkthrough.

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (GSD plans — pre-GSD work shipped without plan files)
- Average duration: N/A
- Total execution time: N/A

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Prototype | retrospective | — | — |
| 2. Post-prototype polish + UAT | 0 / TBD | — | — |
| 3. Sequencer | 0 / TBD | — | — |

**Recent Trend:**
- Last 5 plans: N/A (no GSD plans yet)
- Trend: N/A

*Updated after each plan completion.*

## Accumulated Context

### Decisions

Full decision log in PROJECT.md "Key Decisions" + `.planning/intel/decisions.md`. Currently load-bearing for Phase 2:

- DEC-tick-source-24-ppq + DEC-engines-time-source-agnostic — Phase 2 transport sync + rhythm phase alignment must respect these.
- DEC-engine-orchestrator — latch state machine flagged fragile in `.planning/codebase/CONCERNS.md`; touch carefully when wiring transport.
- DEC-banks-data-json-canonical — voicing audit is a JSON edit, never a code change.
- DEC-web-midi-locality — clarifies why `jay-6.kempenich.dev` (local tunnel) and `jay-6.kempenich.ai` (always-on K8s) coexist; second is browseable from anywhere but can't drive the OP-1.

### Pending Todos

(`/gsd:capture --list` once GSD todo system is in use.)

None yet.

### Blockers/Concerns

- **Rhythm phase alignment bug under Ext clock** — engine `start()` fires immediately → off-beat. Phase 2 open. (`src/engines/rhythmGate.ts` line 48; also `phraseDuration.ts` + `arp.ts`.)
- **`subscribeTransport` plumbing exists but is unwired** — OP-1 Start/Stop/Continue is silently dropped. Phase 2 transport-sync work must wire `host.ts` (or `App.svelte`) to it.
- **No MIDI clock send** despite infrastructure being in place. Phase 2 work.
- **~30% of `banks.data.json` slots inferred** from a divergent extraction diff. Phase 2 voicing audit.
- **iPad TopBar text-selection on long-press** — missing `user-select: none` on `src/components/TopBar.svelte`. Phase 2 polish.
- **REQ-gate-slider flagged suspect** — retest during UAT to distinguish code bug from OP-1 envelope masking (MIDI monitor evidence in `.research/UAT.md` §12).
- **Latch state machine fragile** — four parallel booleans across host + App.svelte with zero unit-test coverage. Any latch refactor must trace all paths through `padPressed` / `padReleased` / `setLatch` / `panic`. (`.planning/codebase/CONCERNS.md`.)

## Deferred Items

Items acknowledged + tracked elsewhere; not blocking Phase 2.

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Backlog | M9 Style 6–9 phrases (no Roland data) | Out of Scope (see PROJECT.md) | 2026-05-18 |
| Backlog | Velocity control | Out of Scope | 2026-05-18 |
| Backlog | Persist bank / BPM / port | Out of Scope (Phase 3+) | 2026-05-18 |
| Backlog | Save/recall presets | Out of Scope (Phase 3+) | 2026-05-18 |
| Tech debt | Web Audio scheduler (replace `setInterval`) | Out of Scope until drift is a real-use problem | 2026-05-18 |

## Session Continuity

Last session: 2026-05-18 — GSD bootstrap (`new-project-from-ingest`).
Stopped at: PROJECT / REQUIREMENTS / ROADMAP / STATE written from `.planning/intel/` synthesis + prompt-supplied phase mapping.
Resume file: None — next step is either `/gsd:plan-phase 2` to start formal planning of Phase 2 open items, or `say "run uat"` to start the UAT walkthrough via the `uat-agent` skill.
