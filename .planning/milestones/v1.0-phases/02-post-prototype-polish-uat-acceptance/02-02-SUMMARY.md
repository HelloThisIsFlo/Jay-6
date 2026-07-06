---
phase: 02-post-prototype-polish-uat-acceptance
plan: 02
subsystem: timing

tags: [vitest, clock, midi-tick, downbeat-math]

# Dependency graph
requires:
  - phase: 02-post-prototype-polish-uat-acceptance
    provides: "TICKS_PER_QUARTER constant + clock.ts helper family (existing pre-phase code)"
provides:
  - "nextDownbeatTick(currentTick) pure helper in src/clock.ts"
  - "Boundary-case Vitest coverage for at-zero, just-before, at-boundary, just-past, and arbitrary mid-range cases"
affects:
  - "02-04 (engine arm gating under Ext clock — Wave 2 will import nextDownbeatTick)"
  - "engines/arp, engines/phraseDuration, engines/rhythmGate"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure-math helper in src/clock.ts unit-tested via Vitest (DEC-tests-data-and-math-only)"
    - "Decision-ID comment style (D-06) on new exports per project convention"

key-files:
  created: []
  modified:
    - "src/clock.ts (added nextDownbeatTick export)"
    - "test/clock.test.ts (new describe block + import extension)"

key-decisions:
  - "Formula (Math.floor(currentTick / TICKS_PER_QUARTER) + 1) * TICKS_PER_QUARTER — always next, never current (Pitfall 3)"
  - "No Math.max(0, ...) clamp — engines pass non-negative ticks only; helper stays pure"
  - "Sibling describe block (not merged into existing 'clock' describe) — mirrors file's one-describe-per-helper-family style"

patterns-established:
  - "Pattern: at-boundary edge cases get their own it() block separate from partial-tick rounding — splits the two failure modes a future regression would surface"

requirements-completed:
  - REQ-rhythm-phase-alignment-ext-clock

# Metrics
duration: 1min
completed: 2026-05-18
---

# Phase 2 Plan 2: nextDownbeatTick boundary helper Summary

**Pure-math `nextDownbeatTick(currentTick)` in `src/clock.ts` with 7-assertion Vitest coverage — the testable surface of REQ-rhythm-phase-alignment-ext-clock per DEC-tests-data-and-math-only.**

## Performance

- **Duration:** ~1 min (39 seconds wall clock)
- **Started:** 2026-05-18T20:38:38Z
- **Completed:** 2026-05-18T20:39:17Z
- **Tasks:** 1 (TDD: RED + GREEN, no REFACTOR needed)
- **Files modified:** 2

## Accomplishments

- `nextDownbeatTick(currentTick: number): number` exported from `src/clock.ts`
- Formula uses `TICKS_PER_QUARTER` constant (no literal `24` in body)
- 7 assertions across 2 `it()` blocks pin D-06 boundary semantics
- Pitfall 3 explicitly defended: `nextDownbeatTick(0) === 24` (never returns current tick)
- Vitest suite: 39/39 passing (was 37/37 before this plan)
- svelte-check: 0 errors / 0 warnings

## Task Commits

TDD cycle commits:

1. **Task 1 RED: failing tests for nextDownbeatTick** — `3d7c175` (test)
2. **Task 1 GREEN: implement nextDownbeatTick helper** — `d7412ca` (feat)

REFACTOR phase skipped — the helper is a single expression; nothing to clean up.

**Plan metadata commit:** (this commit, including SUMMARY.md + STATE.md + ROADMAP.md updates)

## Files Created/Modified

- `src/clock.ts` — added `nextDownbeatTick(currentTick)` export, placed below `arpTicksPerStep` in the same helper family; WHY-only comment cites D-06 + the at-zero edge semantics
- `test/clock.test.ts` — extended import block with `nextDownbeatTick`; appended sibling `describe('nextDownbeatTick', ...)` block with 2 `it()` cases (3 assertions for at-boundary edge, 4 assertions for partial-tick rounding)

## Decisions Made

- **Formula choice: `(Math.floor(currentTick / TICKS_PER_QUARTER) + 1) * TICKS_PER_QUARTER`** — RESEARCH.md Pitfall 3 explicitly walked the alternatives (`Math.ceil(currentTick / 24) * 24` would return `currentTick` itself at boundaries — wrong per D-06). The +1-after-floor variant is the only one that satisfies "first step lands on a downbeat, never the current tick."
- **No input validation / clamping** — Plan action step explicitly forbade `Math.max(0, ...)`. Helper stays pure; engines own input correctness.
- **Sibling describe block, not merged** — Plan behavior step required this to mirror the file's "one describe per helper family" convention. Pre-existing `describe('clock', ...)` covers the 24-PPQ math family; `describe('nextDownbeatTick', ...)` is its own family because it's the only boundary-semantic helper.
- **Two `it()` blocks split by failure mode** — at-boundary cases (`0→24, 24→48, 96→120`) and partial-tick rounding (`1→24, 23→24, 25→48, 47→48`) test different aspects of the formula. A regression in one mode (e.g., dropping the `+1`) would only break the at-boundary block; splitting them makes the failure message diagnostic on its own.

## Deviations from Plan

None - plan executed exactly as written.

The plan was sharply scoped (one helper, one describe block, formula already specified in RESEARCH.md). RED → GREEN ran clean on first attempt. No deviation rules triggered.

## Issues Encountered

None.

## User Setup Required

None — pure-math change, no external services, no env vars, no infra.

## Threat Surface

`<threat_model>` mitigations satisfied:

- **T-02-02-01 (Tampering of musical state via wrong math):** mitigated. Tests pin both the at-zero edge (`nextDownbeatTick(0) === 24`) and the just-past-boundary edge (`nextDownbeatTick(24) === 48`) — the exact off-by-one risk flagged in RESEARCH.md Pitfall 3.
- **T-02-02-02 (Information Disclosure):** accepted as documented; pure math, no PII or device data crosses this boundary.

No new threat surface introduced.

## TDD Gate Compliance

- RED commit: `3d7c175` (test) — failing tests confirmed before any implementation
- GREEN commit: `d7412ca` (feat) — implementation makes RED tests pass
- REFACTOR: skipped (single-expression helper; nothing to refactor)

Gate sequence valid.

## Next Phase Readiness

Plan 02-04 (Wave 2 — engine arm gating) can now:
```typescript
import { nextDownbeatTick } from '../clock';
```
in `engines/arp.ts`, `engines/phraseDuration.ts`, and `engines/rhythmGate.ts` to gate `start()` under `tickSource.getMode() === 'external'`. The math is verified; engines only need to wire the call.

## Self-Check: PASSED

Verified post-write:

- `src/clock.ts` contains `export function nextDownbeatTick` — FOUND (line 59)
- `src/clock.ts` body references `TICKS_PER_QUARTER` (not literal `24`) — FOUND
- `test/clock.test.ts` contains `describe('nextDownbeatTick'` — FOUND (line 68)
- `test/clock.test.ts` covers `nextDownbeatTick(0) === 24` — FOUND
- `test/clock.test.ts` covers `nextDownbeatTick(23) === 24` — FOUND
- Commit `3d7c175` exists in git log — FOUND
- Commit `d7412ca` exists in git log — FOUND
- `just test` exits 0 — VERIFIED (39 passed)
- `just check` exits 0 — VERIFIED (0 errors)

---
*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-18*
