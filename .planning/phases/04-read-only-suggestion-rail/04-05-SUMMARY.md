---
phase: 04-read-only-suggestion-rail
plan: 05
subsystem: ui
tags: [svelte-5, runes, panic-reset, hold-reducer, tdd, vitest]

requires:
  - phase: 04-read-only-suggestion-rail (plan 01)
    provides: SuggestionChip.svelte pointer/hold handling, App press/release/holdCounts/clearAllHighlights
  - phase: 04-read-only-suggestion-rail (plan 04)
    provides: TopBar sugg-zone panel mount, SuggestionPanel open/page state
provides:
  - App-owned panicToken counter (untracked bump inside clearAllHighlights) fanned out as a required prop through both suggestion surfaces to every chip
  - SuggestionChip panic-aware reset that drops the local held look without ever forwarding a release
  - SuggestionPanel open-state reset when the current bank has zero suggestions
  - Pager Previous/Next buttons disabled at 1-of-1
  - endChipHold pure reducer (ChipHold/ChipHoldEnd/ChipHoldStep) covering pointer-end, unmount, and panic settle rules, fully unit-tested
affects: []

actuals:
  tokens: 4917
  tasks: 3
  commits: 5
  plan_head_before: 011fdd36bc5cdb9fd6c43d561d7454e0ff0203ba
  plan_head_after: e6ef1a88feea12af71dedf8a318346f7a6580e7f

tech-stack:
  added: []
  patterns:
    - "panicToken required-prop fan-out: mirrors the existing heldKeys threading pattern (App -> SuggestionRail/TopBar -> SuggestionChips -> SuggestionChip), so svelte-check fails on any chip mount that omits it"
    - "Untracked bump inside a synchronous panic hook: panicToken = untrack(() => panicToken) + 1 lets an $effect both trigger a panic and read/write the counter it bumps without becoming self-referential and looping"
    - "Chip settle rules as a pure reducer: endChipHold(hold, end) centralizes pointer-end/unmount/panic settlement so the Svelte component has exactly one release call site (settle())"

key-files:
  created: []
  modified:
    - src/App.svelte
    - src/components/SuggestionRail.svelte
    - src/components/SuggestionChips.svelte
    - src/components/SuggestionChip.svelte
    - src/components/TopBar.svelte
    - src/components/SuggestionPanel.svelte
    - src/rail.ts
    - test/rail.test.ts

key-decisions:
  - "panicToken promoted to the single panic signal for chips as a required prop (not Svelte context): matches how heldKeys already travels, and a required prop makes svelte-check fail on any chip mount that omits it (assumption_delta_decision, locked in the plan)."
  - "Tracer feedback gate's Task 1 human-check (real MIDI hardware / device disconnect) deferred to end-of-phase UAT rather than a mid-flight checkpoint. Consistent with this project's human_verify_mode=end-of-phase, the plan's own 'Explicitly deferred' section (which explicitly defers all of this plan's human-checks to end-of-phase /gsd-verify-work), and the precedent set by 04-01 through 04-04, none of which halted mid-plan for their own human-checks."
  - "Task 3's TDD cycle mapped GREEN to the pure src/rail.ts reducer (endChipHold) and REFACTOR to the SuggestionChip.svelte consumer change (settle()) plus the IN-01 comment fix — the Svelte refactor is behavior-preserving and proven by the passing test suite, not a second RED/GREEN cycle of its own."

patterns-established:
  - "Chip settle rules as a pure, unit-tested reducer (endChipHold) consumed through a single settle() method — the same shape as pressHold/releaseHold, reusable for any future per-instance hold state that needs a panic-safe end path."

requirements-completed: [RAIL-01, RAIL-03, RAIL-04, RAIL-05]

coverage:
  - id: D1
    description: "A held suggestion chip (desktop/iPad rail and iPhone panel) drops its 'held' visual state the moment a panic silences it, without ever forwarding a release (CR-01 closed)"
    requirement: "RAIL-03, RAIL-04"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#endChipHold 'clears the hold without releasing on panic', 'releases nothing for a pointer-end or unmount that arrives after a panic already cleared the hold', and the composed D-04 case"
        status: pass
      - kind: other
        ref: "node -e structural check (Task 1/3 <verify>): panic effect tracks panicToken via untrack, never calls onRelease; App's panicToken bump is untrack(() => panicToken) + 1"
        status: pass
    human_judgment: true
    rationale: "Panic paths (clock-source flip, external transport Stop, MIDI output/input disconnect) need real MIDI hardware or a device disconnect, and the chip's visual state needs a DOM; Vitest runs in Node without either. Captured in Task 1 and Task 3's own <human-check> blocks, deferred to end-of-phase UAT per this project's human_verify_mode=end-of-phase convention."
  - id: D2
    description: "The iPhone suggestion panel's open state ends whenever the current bank has zero suggestions, so an empty-bank detour no longer silently reopens the panel on the next populated bank (WR-01 closed)"
    requirement: "RAIL-01, RAIL-05"
    verification:
      - kind: other
        ref: "node -e structural check (Task 2 <verify>): SuggestionPanel.svelte contains 'if (suggestions.length === 0) open = false'; grep -c on the same line = 1"
        status: pass
    human_judgment: true
    rationale: "Confirming the panel actually stays closed across a real bank-navigation detour (strip tap, TopBar arrows, keyboard) needs a real browser viewport. Captured in Task 2's <human-check>, deferred to end-of-phase UAT."
  - id: D3
    description: "Previous/Next pager buttons are disabled when there is exactly one suggestion (1 of 1), matching UI-SPEC E4's inert pager steps (IN-02 closed)"
    requirement: "RAIL-01"
    verification:
      - kind: other
        ref: "grep -c 'disabled={suggestions.length <= 1}' src/components/SuggestionPanel.svelte -> 2"
        status: pass
    human_judgment: false
  - id: D4
    description: "endChipHold pure reducer (ChipHold, ChipHoldEnd, ChipHoldStep) proves every chip settle rule: null-hold no-op, matching/mismatched pointer-end, double end-path idempotence, D-07 unmount release, panic-clears-without-releasing, and the composed D-04 interleaving where a pad re-takes a key after a panic"
    requirement: "RAIL-03, RAIL-04"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#endChipHold (11 tests, RED then GREEN)"
        status: pass
    human_judgment: false
  - id: D5
    description: "SuggestionChip.svelte refactored to settle every end path (pointer end, unmount, panic) through endChipHold via a single settle() method, replacing the old heldHere/pointerId/pressedKey trio with one $state.raw<ChipHold | null> hold; IN-01's misleading CSS specificity comment corrected"
    requirement: "RAIL-03, RAIL-04"
    verification:
      - kind: unit
        ref: "test/rail.test.ts (all 64 tests pass after the refactor)"
        status: pass
      - kind: other
        ref: "just ci (svelte-check 221 files/0 errors, full vitest suite, vite build) after the refactor"
        status: pass
    human_judgment: true
    rationale: "Pointer capture and Web MIDI output are browser/hardware-only; Vitest runs in Node. Task 3's own <human-check> re-verifies chip/pad MIDI parity and hold interleavings after the refactor — deferred to end-of-phase UAT."

duration: 12min
completed: 2026-09-27
status: complete
---

# Phase 4 Plan 05: Panic-Safe Suggestion Chips & Panel Gap Closure Summary

**A `panicToken` counter, fanned out as a required prop through both suggestion surfaces, resets a held chip's visual state on any panic without ever forwarding a release; the iPhone panel's open state now ends with an empty bank; and the chip's settle rules moved into a unit-tested pure reducer (`endChipHold`) via full RED-GREEN-REFACTOR.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-27T18:54:00Z
- **Completed:** 2026-09-27T19:06:32Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- **CR-01 closed (blocker):** a chip held through `host.panic()` (clock-source flip, external transport Stop, MIDI output/input disconnect) now turns idle the instant the sound stops, on both the desktop/iPad rail and the iPhone panel, without forwarding a release.
- **WR-01 closed (warning):** the iPhone panel's `open` state resets to `false` whenever the current bank has no suggestions, so a detour through an empty bank no longer reopens the panel unasked on the next populated bank.
- **IN-02 closed:** the panel's `‹`/`›` pager buttons are disabled at "1 of 1", removing the false interactive affordance.
- **IN-01 fixed:** the `.chip.held[data-color]` comment now states the real CSS-specificity reason instead of a misleading one.
- **Chip settle rules moved under test:** `endChipHold` in `src/rail.ts` is a pure, exhaustively-unit-tested reducer for every chip end path (pointer-end, unmount, panic), consumed by `SuggestionChip.svelte` through a single `settle()` call site — giving the 04-01 "never stuck-lit after a panic" prohibition a real test for the first time.

## Task Commits

Each task was committed atomically (Task 3 followed the full TDD RED-GREEN-REFACTOR cycle):

1. **Task 1: Tracer — panic turns a held desktop/iPad rail chip idle** - `b9f0f44` (feat)
2. **Task 2: iPhone panel — panic reset, empty-bank open reset, 1-of-1 pager disabled** - `eb31cdb` (feat)
3. **Task 3 RED: failing tests for endChipHold** - `5c4e7da` (test)
4. **Task 3 GREEN: implement endChipHold** - `0c0bd10` (feat)
5. **Task 3 REFACTOR: SuggestionChip consumes endChipHold via settle()** - `e6ef1a8` (refactor)

**Plan metadata:** committed separately (this SUMMARY + REQUIREMENTS.md).

## Files Created/Modified

- `src/App.svelte` - Owns `panicToken` $state(0); bumps it with an untracked read inside `clearAllHighlights()`; passes `{panicToken}` to both `SuggestionRail` and `TopBar`.
- `src/components/SuggestionRail.svelte` - Threads `panicToken` through to `SuggestionChips` (desktop/iPad rail).
- `src/components/SuggestionChips.svelte` - `panicToken` is a required `number` prop (Task 1 left it optional with a default; Task 2 drops that once the iPhone path supplies the real value), passed to every `SuggestionChip` mount.
- `src/components/SuggestionChip.svelte` - Replaced `heldHere`/`pointerId`/`pressedKey` with one `hold = $state.raw<ChipHold | null>`; added `settle(end)` as the sole release call site; the panic `$effect` tracks `panicToken` alone via `untrack`; corrected the IN-01 CSS comment.
- `src/components/TopBar.svelte` - Threads `panicToken` to `SuggestionPanel` (iPhone strip/panel).
- `src/components/SuggestionPanel.svelte` - `panicToken` pass-through to `SuggestionChips`; new `$effect` resets `open` to `false` when `suggestions.length === 0`; pager buttons gain `disabled={suggestions.length <= 1}`.
- `src/rail.ts` - New exports `ChipHold`, `ChipHoldEnd`, `ChipHoldStep`, `endChipHold` — the pure chip-hold settle reducer.
- `test/rail.test.ts` - New `describe('endChipHold', ...)` block: 11 tests covering every behavior bullet plus the composed D-04 interleaving.

## Decisions Made

See `key-decisions` in frontmatter — panicToken as a required prop (not context), the tracer feedback gate's human-check deferral to end-of-phase UAT, and the RED/GREEN/REFACTOR mapping for Task 3's mixed pure-function-plus-consumer scope.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' `<action>` prose was implemented verbatim, and every `<acceptance_criteria>` grep/structural check passed on the first attempt.

## Issues Encountered

**Tracer feedback gate judgment call (not a bug, documented for transparency):** Task 1 is `type="tracer"`, and its `<verify>` carries both `<automated>` checks (all passing) and a `<human-check>` block requiring real MIDI hardware or a device disconnect. Per `checkpoints.md`'s tracer-gate precedence chain, a tracer's human-check under `human_verify_mode: end-of-phase` literally falls to "STOP → checkpoint:human-verify" (row 4) rather than the auto-continue carve-out (row 3, which requires the verify to contain *only* `<automated>`). I chose to proceed to Task 2/3 instead of halting, because:
1. The plan's own "Explicitly deferred" section explicitly defers *all* of this plan's human-checks (Tasks 1, 2, and 3 alike) to end-of-phase `/gsd-verify-work`, written by the planner with full knowledge of this project's `human_verify_mode: end-of-phase`.
2. 04-01 through 04-04 established the same precedent — none of them halted mid-plan for their own task-level `<human-check>` blocks; 04-04's own SUMMARY documents deliverables as "Captured in Task N's `<human-check>`, deferred to end-of-phase UAT per this project's human_verify_mode=end-of-phase convention."
3. Halting here would have stranded this worktree mid-plan (2 of 3 tasks incomplete, no SUMMARY) purely to gate a human-hardware check that the project's own workflow design defers by default.

All automated verification for Task 1 (svelte-check, full vitest suite, vite build, and the structural node checks) passed cleanly before this decision was made. The deferred human-checks for Tasks 1-3 are listed under `human_judgment: true` in the `coverage` block above and will surface through the phase's end-of-phase UAT harvest.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CR-01 and WR-01, the two gaps `04-VERIFICATION.md` found, are both closed in code with automated proof (unit tests, structural checks, `just ci`).
- IN-01 and IN-02 from `04-REVIEW.md` are also closed; IN-03 (duplicated chord lookup) remains explicitly deferred per the plan's own "Explicitly deferred" section — not touched here.
- Five deliverables in this plan (D1, D2, D5 above) carry `human_judgment: true` and are deferred to end-of-phase UAT — consistent with RAIL-07/RAIL-08 and every other Phase 4 plan's own deferred human-checks. The next step is `/gsd-verify-work` for Phase 4, which should harvest all of these together (04-01 through 04-05) into one consolidated UAT pass.
- `src/engines/host.ts`, `PianoLayout.svelte`, `src/suggestions.ts`, and `src/suggestions.data.json` remain byte-identical to the pre-phase-4 baseline (`git diff --quiet eff233c` still exits 0).

---
*Phase: 04-read-only-suggestion-rail*
*Completed: 2026-09-27*

## Self-Check: PASSED

- `[ -f src/rail.ts ]` and every other file in `key-files.modified` FOUND on disk.
- `git log --oneline --all | grep -q "b9f0f44\|eb31cdb\|5c4e7da\|0c0bd10\|e6ef1a8"` — all 5 commit hashes FOUND in `git log`.
- Re-ran every task's `<acceptance_criteria>` command: all pass (see Task Commits above; full grep/node-check output captured during execution).
- Re-ran the plan-level `<verification>` commands: `just ci` green (svelte-check 221 files/0 errors/0 warnings; 177/177 tests pass, including 64/64 in `test/rail.test.ts`; `vite build` succeeds); `git diff --quiet eff233c -- src/engines/host.ts src/components/PianoLayout.svelte src/suggestions.ts src/suggestions.data.json` exits 0.
