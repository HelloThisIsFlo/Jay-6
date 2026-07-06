---
phase: 02-post-prototype-polish-uat-acceptance
plan: 08
subsystem: ui
tags: [svelte, pointer-events, keyboard, midi, uat-gap-closure]

# Dependency graph
requires:
  - phase: 02-post-prototype-polish-uat-acceptance
    provides: "UAT findings (test 4 stuck-note race, tests 14/15 page-scroll) and prior gap-closure plans 02-06/02-07"
provides:
  - "Idempotent pad release on every pointer-end path (pointerup/pointercancel/lostpointercapture) — no hanging MIDI note"
  - "Non-passive keydown listener + preventDefault on all app-consumed keys (Space, ←/→, ↑/↓) — no page scroll"
affects: [uat-re-verify, input-handling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-pad captured-pointerId map gates an idempotent endPress() so any one of multiple end events fires note-off exactly once"
    - "Non-passive window keydown listener ({ passive: false }) so preventDefault is honored on scroll-default keys"

key-files:
  created: []
  modified:
    - src/components/PianoLayout.svelte
    - src/App.svelte

key-decisions:
  - "Cover cancel + lostpointercapture (not pointerleave) — capture means leave shouldn't end a press; a leave-release would break drag-hold"
  - "preventDefault unbound ↑/↓ to stop scroll without wiring them to variation-cycling (Polish Backlog, out of scope)"

patterns-established:
  - "Pointer end-path idempotency: track captured pointerId per element, no-op a second end for the same pointer"
  - "Scroll-default keys need a non-passive listener for preventDefault to take effect"

requirements-completed: [REQ-chord-pad-ui, REQ-keyboard-shortcuts]

# Metrics
duration: ~4min
completed: 2026-05-20
---

# Phase 02 Plan 08: Input-Handling Gap Closure Summary

**Pad presses now release on every pointer-end path (up/cancel/lost-capture) so no MIDI note hangs, and all app-consumed keys (Space + arrows) are swallowed via a non-passive listener so the page never scrolls.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-20T20:37Z
- **Completed:** 2026-05-20T20:38Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Pad release is now idempotent across pointerup, pointercancel, and lostpointercapture — closes the UAT test-4 stuck-note race
- keydown listener registered non-passive; Space + ←/→ preventDefault now actually honored
- Previously-unbound ↑/↓ now swallowed so they no longer scroll the page (UAT test 15)

## Task Commits

Each task was committed atomically:

1. **Task 1: Make every pad pointer-end path release (cancel + lost-capture races)** - `c9abfb4` (fix)
2. **Task 2: Guarantee preventDefault on all app-consumed keys (Space + arrows)** - `47f0359` (fix)

## Files Created/Modified
- `src/components/PianoLayout.svelte` - Added `captured` pointerId map + `endPress()` idempotent release; wired `onpointercancel` and `onlostpointercapture` (alongside `onpointerup`) on both black and white pad buttons
- `src/App.svelte` - Registered keydown listener with `{ passive: false }`; added `ev.preventDefault()` for ArrowUp/ArrowDown

## Decisions Made
- **Cancel + lost-capture, not pointerleave:** with `setPointerCapture` set, pointer-leave shouldn't end a press; a naive leave-release would break drag-hold. The fix targets the events `pointerup` actually misses (touch/gesture interruption, OS yanking capture).
- **Idempotency via captured pointerId map:** `lostpointercapture` fires right after `releasePointerCapture()`, so the second end-event for the same pointer is a guaranteed no-op (pointer already removed from the map) — prevents a double note-off.
- **↑/↓ preventDefault only:** swallowed to stop scroll but deliberately NOT bound to variation-cycling — that's a Polish Backlog idea, out of gap-closure scope.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. `just check` (0 errors, 0 warnings) and `just test` (45/45 passing) green after each task. Per project convention (DEC-tests-data-and-math-only), pointer/keyboard side-effects get no unit tests — verification is typecheck + manual UAT re-run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Manual UAT re-verify gate still pending (human): test 4 rapid press→drag-off→release ×10 (no stuck pad/note), tests 14/15 (Space + arrows don't scroll).
- No blockers introduced.

## Self-Check: PASSED

- `02-08-SUMMARY.md` exists
- Commit `c9abfb4` (Task 1) present
- Commit `47f0359` (Task 2) present

---
*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-20*
