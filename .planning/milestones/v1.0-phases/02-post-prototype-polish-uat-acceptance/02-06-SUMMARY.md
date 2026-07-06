---
phase: 02-post-prototype-polish-uat-acceptance
plan: 06
subsystem: transport-sync
tags: [ext-clock, transport, tickSource, engine-alignment, gap-closure]
requires:
  - tickSource (24 PPQ Int/Ext mode machine)
  - engines/host.ts onTransport plumbing
  - clock.ts tick helpers
provides:
  - tickSource.getExternalTick() / resetExternalTick() — OP-1 absolute bar frame
  - clock.ticksUntilDownbeatFrom() + TICKS_PER_BAR — pure bar-alignment math
  - Continue (0xFB) wired as a valid arm-and-align trigger
  - Ext transport observability independent of engine subscription
  - test/tickSource.test.ts Int-leak regression
affects:
  - src/engines/rhythmGate.ts, arp.ts, phraseDuration.ts (Ext first-fire arm)
  - src/engines/host.ts onTransport
tech-stack:
  added: []
  patterns:
    - "Engines align Ext first-fire to OP-1 absolute bar via tickSource.getExternalTick()"
    - "Input listeners attach on setMode('external') — transport observable pre-subscribe"
key-files:
  created:
    - test/tickSource.test.ts
  modified:
    - src/clock.ts
    - src/tickSource.ts
    - src/engines/rhythmGate.ts
    - src/engines/arp.ts
    - src/engines/phraseDuration.ts
    - src/engines/host.ts
    - test/clock.test.ts
decisions:
  - "Bar-alignment (96-tick frame) not quarter-alignment for first-fire; a tuning constant if hardware later prefers quarter"
  - "Continue and Start share the arm-and-align path (debounced) — OP-1 emits Continue on Play, never Start"
  - "Ext input listeners stay bound after last engine unsubscribes; only the Int flip detaches (transport observability vs Int-leak guard)"
metrics:
  duration: ~5min
  completed: 2026-05-20
  tasks: 5
  files: 7
---

# Phase 2 Plan 06: Ext-Clock Transport-Sync Gap Closure Summary

Engines now align their first audible step to the OP-1's **absolute bar position** under Ext clock (not a beat counted from pad-press), OP-1 **Continue** is a valid arm-and-align trigger, inbound transport is **observable independent of engine subscription**, and switching to **Int** is proven fully deaf to OP-1 timing by a new regression suite.

## What Shipped

- **`clock.ts`** — `TICKS_PER_BAR = 96` + pure `ticksUntilDownbeatFrom(absTick)`: ticks to the next bar downbeat (0 when already on a boundary → fire now). Unit-tested per DEC-tests-data-and-math-only.
- **`tickSource.ts`** — `externalTick` counter (advances only under Ext, one per inbound clock byte), `getExternalTick()` / `resetExternalTick()`. Reset on mode flip + input (re)attach.
- **Three engines** (`rhythmGate`, `arp`, `phraseDuration`) — Ext first-fire wait = `ticksUntilDownbeatFrom(getExternalTick())`; `wait === 0` fires now, else defers then resumes step cadence. Int-mode immediate-fire (D-07) unchanged.
- **`host.onTransport`** — Start **and** Continue arm-and-align (shared 200ms debounce, reset external tick); Stop still `panic()`. Added `console.debug('TRANSPORT-IN', kind)` UAT instrumentation.
- **Transport observability** — `setMode('external')` attaches input listeners eagerly; they stay bound after the last engine unsubscribes. `attachInputListener` made idempotent (detach-first) to prevent double-binding.
- **`test/tickSource.test.ts`** — 3-case Int-leak regression (clean detach, no stale subscription, clean re-flip).

## Tasks

| Task | Name | Commits |
| ---- | ---- | ------- |
| 1 | Absolute external-tick counter + ticks-to-downbeat helper (TDD) | `1b66baa` (RED), `31b7572` (GREEN) |
| 2 | Arm all three engines against absolute external-tick position | `fdb6090` |
| 3 | Continue as valid arm trigger + observable transport | `c0816f4` |
| 4 | Audit + harden Int-switch path (TDD) | `3b3b5b9` |
| 5 | TRANSPORT-IN cleanup | _no code change — tracked follow-up below_ |

## Deviations from Plan

None — plan executed as written.

Task 4 audit confirmed the detach path was already airtight (Tasks 1+3 hardening + the pre-existing `detachInputListener` that removes all four listeners). Per the plan's "if airtight, deliverable is the proving test" clause, Task 4 shipped the regression suite + WHY-comment guard with no functional code hole to patch. The test passed on first run, which the plan explicitly allows for this case (it asserts existing state-machine behavior, not new behavior, so the fail-fast RED rule does not apply — there is no implementation gap to fill).

## Tracked Follow-up (Task 5)

**Remove `console.debug('TRANSPORT-IN', kind)` from `src/engines/host.ts` (onTransport) once UAT test 16 step 4 is re-verified on hardware.**

- The instrumentation is intentionally retained because the manual OP-1 hardware re-verify of UAT tests 11/16 is gated to the UAT re-run, NOT this plan.
- It is `console.debug` (not `console.log`) — stays out of the default prod console. No `console.log` / J6DBG-style trace ships persistently.
- After the UAT re-verify confirms transport reaches the engine, delete the line + its WHY-comment.

## Hardware Re-Verify Gate (UAT, out of scope here)

These remain for the UAT re-run on OP-1 over MIDI (Ext clock):

- Note-ons land on OP-1 downbeats (offset ≈ 0, not +278ms) — UAT 11 V04/V06/V08, 16 steps 1/2.
- `TRANSPORT-IN` logs on OP-1 Play (Continue) — UAT 16 step 4.
- **Int-leak acceptance:** with rhythm running under Ext, flip Clock to Int, change OP-1 tempo → Jay-6's rhythm must NOT follow (engines on internal clock only). This is the hardware counterpart to the `test/tickSource.test.ts` regression.

## Verification

- `just check` — 207 files, 0 errors, 0 warnings.
- `just test` — 45 passed (15 clock incl. new `ticksUntilDownbeatFrom`; 3 new tickSource Int-leak cases).

## Self-Check: PASSED

- Created: `test/tickSource.test.ts` — FOUND
- Commits `1b66baa`, `31b7572`, `fdb6090`, `c0816f4`, `3b3b5b9` — all FOUND in git log
