---
phase: 02-post-prototype-polish-uat-acceptance
plan: 04
subsystem: midi
tags: [webmidi, transport-sync, midi-clock, svelte5, vitest, op-1]

# Dependency graph
requires:
  - phase: 02-post-prototype-polish-uat-acceptance
    provides: "nextDownbeatTick() pure helper in src/clock.ts (plan 02-02)"
  - phase: 02-post-prototype-polish-uat-acceptance
    provides: "iPad CSS + black-key visibility (plan 02-03) — owns App.svelte <style> block"
provides:
  - "Outbound 24 PPQ MIDI clock send when Int (D-02)"
  - "Outbound Start/Stop on engine first-press / last-release (D-02 cont.)"
  - "Inbound Start/Stop/Continue receive routed to host with 200ms debounce (D-04 / D-05)"
  - "Rhythm engines (arp / phraseDuration / rhythmGate) defer first audible hit to next tick%24==0 under Ext (D-06)"
  - "Mode-switch hard stop via host.panicForModeSwitch() (D-03)"
  - "EngineHost.getArmedPosition() — exposes 'fresh' | 'resume' | null lifecycle state for future sequencer consumers"
affects: [02-05-uat-walkthrough, milestone-v1-close, future-sequencer-v2]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "performance.now() (not Date.now()) for sub-second browser debounce — NTP-immune"
    - "Engine-lifecycle state lives on host (armedPosition), not in state.svelte.ts"
    - "Optional-chain WebMidi.getOutputById(id)?.sendX() mirrors midi.ts:107-112 getChannel defensive pattern"
    - "Decision-ID comments (D-02, D-04, D-06, Pitfall N) tie code to CONTEXT.md"

key-files:
  created: []
  modified:
    - "src/tickSource.ts"
    - "src/engines/host.ts"
    - "src/engines/rhythmGate.ts"
    - "src/engines/phraseDuration.ts"
    - "src/engines/arp.ts"
    - "src/App.svelte"

key-decisions:
  - "rhythmGate resets tickCount=0 on the downbeat after the arm wait — pattern starts at step 0, not step 4 (Rule 1 fix; aligns D-04 'reset position to 0' with D-06 'first step on downbeat')"
  - "EngineHost.getArmedPosition() public getter satisfies tsconfig noUnusedLocals while documenting that 'resume' branch is wired for future sequencer consumer (Rule 3 fix)"
  - "App.svelte EngineHost constructor receives clockMode in Task 1 (not deferred to Task 3) — keeps build green between tasks (Rule 3 fix)"
  - "test/banks.test.ts already has 7 anchor assertions (≥5 reconciled per D-19); verify-only, no additions"

patterns-established:
  - "Mode-switch hard-stop ordering: panic() → setClockMode() → tickSource.setMode() (panic first, then flip)"
  - "Engine arming-then-fire: arm fields are `<thing>Until` numbers + null guard; onTick short-circuits while non-null"

requirements-completed:
  - REQ-clock-send-transport-sync
  - REQ-rhythm-phase-alignment-ext-clock
  - REQ-voicing-second-pass-audit

# Metrics
duration: 2min
completed: 2026-05-18
---

# Phase 2 Plan 04: Transport sync wiring + Ext-clock rhythm alignment Summary

**Bidirectional MIDI master/slave transport (Clock send when Int, Start/Stop/Continue receive when Ext) with 200ms double-trigger guard, mode-switch hard stop, and next-downbeat alignment on all three rhythmic engines — wiring only, zero new dependencies.**

## Performance

- **Duration:** ~2 min (111 s)
- **Started:** 2026-05-18T20:47:43Z
- **Completed:** 2026-05-18T20:49:34Z
- **Tasks:** 3 / 3
- **Files modified:** 6
- **Test counts:** `svelte-check` 0 errors / 0 warnings; `vitest` 39/39 passing; `vite build` 210 KB JS (49.6 KB gzip)

## Accomplishments

- **Outbound side wired (D-02)** — `tickSource.emitTick()` now calls `sendClock()` on every internal tick when mode=internal; `host.sendTransport()` fires `sendStart` on first-press and `sendStop` on last-release. Both use the existing midi.ts `getMidiState()` + `WebMidi.getOutputById(id)?.send*()` defensive pattern.
- **Inbound side wired (D-04)** — `App.svelte` subscribes to `tickSource.subscribeTransport()` and forwards to `host.onTransport()`. Host dispatches start/stop/continue, applies the 200ms `performance.now()` debounce on Start (D-05), uses `panic()` on Stop (Pitfall 5).
- **All three rhythmic engines aligned to downbeat under Ext (D-06)** — `rhythmGate` uses `nextDownbeatTick()` + an `armUntilTick` latch; `arp` and `phraseDuration` use the simpler `TICKS_PER_QUARTER` countdown variant. Int-mode immediate-fire preserved across the board (D-07).
- **Mode-switch hard stop (D-03)** — App.svelte `$effect` now calls `panicForModeSwitch()` → `setClockMode()` → `setMode()` in order.
- **`Math.floor()` stepIndex fix in rhythmGate (Pitfall 4)** — defensive against dropped ticks under Ext clock; CONCERNS.md callout closed.
- **Voicing anchors verified (D-19)** — `test/banks.test.ts` already had 7 anchor assertions from commit `f2d5d59`; ≥5 reconciled satisfies the spec; zero additions.

## Task Commits

1. **Task 1: Outbound clock + transport** — `0e0cb94` (feat)
2. **Task 2: Inbound transport receive + engine downbeat alignment** — `89a933d` (feat)
3. **Task 3: App.svelte wiring + voicing-anchor verification** — `fbc22a1` (feat)

**Plan metadata commit:** (pending — applies to this SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified

Per-file line delta (insertions / deletions):

- `src/tickSource.ts` — +8 / -0 — imports `getMidiState`, `emitTick` calls `sendClock()` gated on internal mode
- `src/engines/host.ts` — +63 / -2 — `clockMode` field on HostConfig, `setClockMode`, `sendTransport` (outbound), `onTransport` (inbound with 200ms debounce), `panicForModeSwitch`, `getArmedPosition`, `armedPosition` lifecycle field, `lastStartMs`
- `src/engines/rhythmGate.ts` — +29 / -2 — `armUntilTick` field, downbeat alignment in `start()`, onTick short-circuit while arming, `tickCount=0` reset on downbeat landing, `Math.floor()` stepIndex
- `src/engines/phraseDuration.ts` — +9 / -2 — `TICKS_PER_QUARTER` import, Ext-mode `ticksUntilNext` countdown, gated immediate `fire()`
- `src/engines/arp.ts` — +8 / -2 — `TICKS_PER_QUARTER` import, Ext-mode `ticksUntilNext` countdown, gated immediate `fireNext()`
- `src/App.svelte` — +12 / -1 — `clockMode: ui.clockSource` constructor field, three-step mode-switch `$effect`, second `onMount` for `subscribeTransport`

**Total:** 127 insertions / 11 deletions across 6 files — well within the "Phase 2 is wiring, not building" thesis.

## Decisions Made

- **Constructor field added in Task 1, not deferred to Task 3.** The plan split `clockMode` across tasks but Task 1 made it required on `HostConfig` — App.svelte's constructor would break the build until Task 3 if left alone. Pulled it forward to keep `just check` green between commits (Rule 3 blocking fix).
- **Added `EngineHost.getArmedPosition()` public getter.** The plan specified setting `armedPosition` on Start/Continue but didn't wire a reader — tsconfig `noUnusedLocals` flagged it. Exposing as a getter both satisfies the type-checker AND documents that the 'resume' branch is intentionally available for a future sequencer consumer (Rule 3 fix).
- **`tickCount = 0` reset on downbeat landing in rhythmGate.** Without this the pattern would start at step 4 instead of step 0 under Ext clock (24/6 = 4) — silently violating both D-04 ("reset position to 0") and D-06 ("first step on downbeat"). Rule 1 correctness fix; matches Int-mode behavior where `start()` initializes `tickCount=0` and immediately evaluates step 0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] App.svelte constructor field pulled forward from Task 3 to Task 1**

- **Found during:** Task 1 (Outbound clock + transport)
- **Issue:** The plan made `clockMode` a required field on `HostConfig` in Task 1 but explicitly deferred the App.svelte constructor update to Task 3. That would have left `just check` red between Task 1 and Task 3 commits, violating per-task verify gates.
- **Fix:** Added `clockMode: ui.clockSource` to the constructor call in App.svelte as part of Task 1.
- **Files modified:** `src/App.svelte`
- **Verification:** `just check` reports 0 errors after Task 1 commit.
- **Committed in:** `0e0cb94` (Task 1 commit)

**2. [Rule 3 — Blocking] Added `getArmedPosition()` public getter to satisfy `noUnusedLocals`**

- **Found during:** Task 2 (Inbound transport receive)
- **Issue:** Plan instructed setting `armedPosition` on Start/Continue but didn't wire a reader. tsconfig has `noUnusedLocals: true` → `svelte-check` errored: `'armedPosition' is declared but its value is never read.`
- **Fix:** Added a public `getArmedPosition(): 'fresh' | 'resume' | null` getter. Documents that the 'resume' branch is set today but consumed by a future sequencer in v2 (no current engine reads it).
- **Files modified:** `src/engines/host.ts`
- **Verification:** `just check` reports 0 errors after the addition.
- **Committed in:** `89a933d` (Task 2 commit)

**3. [Rule 1 — Bug] `tickCount = 0` reset on downbeat landing in rhythmGate**

- **Found during:** Task 2 (Engine downbeat alignment)
- **Issue:** With `armUntilTick = 24` and `tickCount = 0` at start, the count would reach 24 by the time the latch dropped. `evaluateStep()` then computes `floor(24/6) % 16 = 4`, putting the first audible hit at step 4 instead of step 0. Violates D-04 ("reset position to 0") + D-06 ("first step lands on downbeat") jointly.
- **Fix:** After `armUntilTick = null` and before `evaluateStep()`, set `this.tickCount = 0`. Matches the Int-mode invariant (start initializes tickCount=0, evaluateStep fires step 0).
- **Files modified:** `src/engines/rhythmGate.ts`
- **Verification:** Logic walkthrough — at downbeat landing, tickCount→0, evaluateStep computes `floor(0/6)%16 = 0` → step 0 fires. Full UAT will exercise audibly against the OP-1.
- **Committed in:** `89a933d` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 3 blocking, 1 Rule 1 bug)
**Impact on plan:** All three preserve plan intent — none expand scope. The Rule 1 fix is a meaningful correctness improvement that the plan/research missed; without it Ext-mode rhythm patterns would start mid-bar.

## Issues Encountered

None beyond the three deviations above. Wave order (02-02 ships `nextDownbeatTick`, 02-03 owns App.svelte `<style>`, 02-04 owns App.svelte `<script>` + engines + host + tickSource) prevented every file collision the plan anticipated.

## Known Stubs

- **`EngineHost.armedPosition === 'resume'` branch is set but not read by any engine.** Intentional: the live-instrument hybrid model (D-04) means pad presses fire immediately regardless of armed position; alignment is the only Ext-mode adjustment in v1. The 'resume' distinction matters when a sequencer consumer (v2) needs to know whether to start a pattern from position 0 (Start) or keep the saved position (Continue). Exposed via `getArmedPosition()` getter so a future engine can consume without refactoring host internals.

## User Setup Required

None — no env vars, no external services. Hardware verification (OP-1 + browser Web MIDI) is the UAT walkthrough's job (Plan 02-05 + `/gsd:verify-work`).

## Next Phase Readiness

- All three Phase 2 transport-sync requirements satisfied at the wiring level.
- All Phase 1 functionality preserved under Int (D-07): hold + arp + phraseDuration + rhythmGate engines fire on press as before; mode flips while engine playing now hard-stop instead of leaving stuck notes.
- `just ci` green: svelte-check 0/0/0, vitest 39/39, vite build 210 KB.
- **UAT sections that will exercise this work:**
  - **§15 Clock + transport sync** — Int-mode clock send, Ext-mode Start/Stop/Continue receive, mode-switch hard stop (D-03), Ext-mode "no echo back" (Pitfall 8)
  - **§19 Edge cases** — Mode flip mid-playback, double-Start chatter from OP-1 Record, hot-plug under Ext mode
- **Blocker watch:** UAT §15.6 ("Ext mode does not send clock pulses downstream") is the live verification of T-02-04-03; logic is correct but only a real OP-1 + MIDI monitor confirms it.

## Self-Check: PASSED

- Created files: none (verify-only plan)
- Modified files (all verified present):
  - `src/tickSource.ts` ✓
  - `src/engines/host.ts` ✓
  - `src/engines/rhythmGate.ts` ✓
  - `src/engines/phraseDuration.ts` ✓
  - `src/engines/arp.ts` ✓
  - `src/App.svelte` ✓
- Commits (verified in git log):
  - `0e0cb94` ✓
  - `89a933d` ✓
  - `fbc22a1` ✓

---

*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-18*
