---
phase: 04-read-only-suggestion-rail
plan: 04
subsystem: ui
tags: [svelte-5, runes, css-grid, pager, escape-key, viewport-cap]

requires:
  - phase: 04-read-only-suggestion-rail (plan 01)
    provides: Playable SuggestionChip.svelte, hold-count gate, App press/release/displayKeys
  - phase: 04-read-only-suggestion-rail (plan 03)
    provides: Shared SuggestionChips.svelte grid, RAIL_COLUMN_MAX_PER_ROW, chip anatomy
provides:
  - iPhone-landscape (max-height 480px) TopBar strip that opens a nonmodal panel over the top bar, never covering a pad
  - Identity-keyed page memory (rememberedPage/stepPage) so the panel keeps its page across close/reopen and resets to 1 of N on any bank change
  - Viewport-width chip cap (panelMaxPerRow) for the wide iPhone panel
  - TopBar pass-through props (onPress/onRelease/heldKeys) so the panel's chips play through the same path as every other pad alias
affects: []

actuals:
  tokens: 3466
  tasks: 2
  commits: 3
  plan_head_before: 5b79b17f78b7e17660e3f4bb1ba847dd39530cb

tech-stack:
  added: []
  patterns:
    - "Identity-keyed page memory: PageMemory<T> stores {list, index}; rememberedPage compares list with === (never structural equality), so a freshly-derived array (bank change) always resets while the same reference (close/reopen) keeps its page — no $effect needed"
    - "Component-local svelte:window (bind:innerWidth + onkeydown) mirrors TopBar's own Escape pattern and coexists with App's separate keydown listener"

key-files:
  created:
    - src/components/SuggestionPanel.svelte
  modified:
    - src/App.svelte
    - src/components/TopBar.svelte
    - src/rail.ts
    - test/rail.test.ts

key-decisions:
  - "Height-gated (max-height: 480px), not width-gated: iPhone-landscape widths (~650-930px) straddle the existing 900px width rule in both directions, so the new sugg grid area keys off the same fold as PianoLayout's compact-pad rule and SuggestionRail's hide rule (locks 04-RESEARCH.md Open Question 1)."
  - "No backdrop dismissal on the panel (deliberate divergence from TopBar's own popover pattern): D-12 locks close via × / collapse control / Escape only, so a tap on a pad while the panel is open never closes it."

patterns-established:
  - "Identity-keyed page/selection memory via $state.raw + === comparison — reusable anywhere a derived list needs 'keep position across a no-op refresh, reset on a real change' semantics."

requirements-completed: [RAIL-01, RAIL-03, RAIL-04, RAIL-05, RAIL-07, RAIL-08]

coverage:
  - id: D1
    description: "rememberedPage keeps the page index only when the list reference is unchanged (resets to 0 for a structurally-equal-but-different reference or null); stepPage wraps both directions and is inert at count <= 1; panelMaxPerRow returns 4 below 720px and 6 at/above"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#rememberedPage, #stepPage, #panelMaxPerRow"
        status: pass
    human_judgment: false
  - id: D2
    description: "The iPhone TopBar gains a sugg grid area at max-height:480px ('pill sugg transpose' / 'bank style latch'), the strip sits in row 1 at 44px min-height with zero added height, and every other TopBar layout (desktop, iPad, narrow width) is unchanged above that height"
    requirement: "RAIL-05, RAIL-07"
    verification:
      - kind: other
        ref: "grep: TopBar.svelte contains 'pill sugg transpose' and @media (max-height: 480px); production bundle contains the panel's locked copy strings"
        status: pass
    human_judgment: true
    rationale: "Cross-viewport visual fit (desktop/iPad/iPhone-landscape at multiple frame sizes) is a judgment call that needs a real browser; the grep/bundle checks only prove the CSS rules and markup ship, not that the layout reads correctly. Captured in Task 2's <human-check>, deferred to end-of-phase UAT per this project's human_verify_mode=end-of-phase convention."
  - id: D3
    description: "The panel opens as a nonmodal overlay anchored to the top bar (max-height 100% of the bar, so it can never cover a pad), closes only via ×, the header's collapse control, or Escape — never a backdrop or outside tap — and shows exactly one suggestion (label, kind, '‹ i of N ›' pager) with its chip row"
    requirement: "RAIL-05, RAIL-07"
    verification:
      - kind: other
        ref: "grep: SuggestionPanel.svelte has aria-expanded={open}, 'Close suggestions', zero 'backdrop' occurrences, zero contenteditable/input/textarea/select/form occurrences"
        status: pass
    human_judgment: true
    rationale: "Confirming the panel actually never covers a pad, and that tapping a pad/empty space does not close it, requires rendering in a real viewport. Captured in Task 2's <human-check>, deferred to end-of-phase UAT."
  - id: D4
    description: "Opening, paging, closing the panel, and bank-driven re-render emit no MIDI and touch no latch/engine/transport/clock state; a chip held when the panel closes or pages away releases immediately via the existing D-07 unmount teardown"
    requirement: "RAIL-03, RAIL-08"
    verification:
      - kind: other
        ref: "grep: SuggestionPanel.svelte contains zero occurrences of engines/host, ../midi, tickSource, setBank, setStyle, setVariation, toggleLatch, bumpTranspose, setBpm, setClockSource, setGatePercent"
        status: pass
    human_judgment: true
    rationale: "Web MIDI is browser/hardware-only and excluded from Vitest (environment: 'node', no jsdom). The import-boundary grep proves the panel has no code path to reach the engine/MIDI layer during browsing, but confirming zero MIDI bytes cross the wire (and correct hold-and-release-together behavior) needs a real MIDI monitor. Captured in Task 2's <human-check>, deferred to end-of-phase UAT."
  - id: D5
    description: "The page index survives close/reopen while the bank is unchanged and resets to 1 of N after any bank change, including a return to the same bank"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#rememberedPage (same-reference keep, different-reference/null reset)"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-09-25
status: complete
---

# Phase 4 Plan 4: iPhone Strip and Panel Summary

**A `Suggestions · N` strip in TopBar row 1 opens a nonmodal panel anchored over the top bar — one suggestion at a time with identity-keyed page memory, Escape/×/collapse close, and playable chips sized to the viewport.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-25T20:20:12Z
- **Completed:** 2026-09-25T20:27:26Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments

- `App.svelte`: `TopBar` now receives `press`/`release`/`displayKeys` so the panel's chips play through the exact same path as pads and the desktop/iPad rail (D-14).
- `TopBar.svelte`: new `Props` (`onPress`, `onRelease`, `heldKeys`) threaded through to a new `sugg-zone`; a height-gated `@media (max-height: 480px)` block (last in the stylesheet, so it wins at every width) turns the bar into `'pill sugg transpose' / 'bank style latch'` with zero added height, matching PianoLayout's own iPhone-landscape breakpoint. Every other layout (900px, 620px, default) is untouched.
- `SuggestionPanel.svelte` (new): the strip (`Suggestions · N`, chevron, `aria-expanded`) and, when open, a nonmodal `section.panel` anchored to the top bar (`max-height: 100%` — never covers a pad) with a header (collapse control, label + kind, `‹ i of N ›` pager, ×) and a body rendering the shared `SuggestionChips` grid. No backdrop dismissal layer exists (D-12 deliberately diverges from TopBar's own popover pattern). The empty-bank state renders only the locked 12px centred line — no strip, so the panel can never open.
- `src/rail.ts`: `PageMemory<T>`, `rememberedPage` (identity-keyed via `===`, resets on any different reference or `null`), `stepPage` (wraps both directions, inert at count ≤ 1), `panelMaxPerRow` (4 below 720px, 6 at/above) — 53/53 `test/rail.test.ts` cases pass.
- Verified end-to-end: Task 1's tracer `<verify>` (build + bundle-content check) and Task 2's `npm test -- test/rail.test.ts` both re-ran clean; `just ci` (166/166 tests, 0 type errors, build succeeds) is green.

## Task Commits

Each task was committed atomically (Task 2 is TDD: RED then GREEN):

1. **Task 1 — Tracer: iPhone strip opens a panel with playable chips** - `0f121d0` (feat)
2. **Task 2 — RED: failing pager and viewport-cap tests** - `d78d223` (test)
3. **Task 2 — GREEN: pager, page memory, Escape close, viewport chip cap** - `eff233c` (feat)

**Plan metadata:** pending (this commit)

## TDD Gate Compliance

Task 2 carried `tdd="true"`. Gate sequence verified present and in order:
- RED: `d78d223 test(04-04): add failing pager and viewport-cap tests` — added tests for `rememberedPage`, `stepPage`, `panelMaxPerRow` against intentionally-wrong stub bodies in `src/rail.ts` (stubs compile so the failures are genuine assertion failures, not import/fixture crashes); 6/53 tests failed on real assertions, 47 passed incidentally (all pre-existing tests plus a few new cases where the stub's constant return happened to match, e.g. `stepPage(0, 1, 0) -> 0`).
- GREEN: `eff233c feat(04-04): pager with page memory, Escape close, viewport chip cap` — stubs replaced with the real implementations plus the `SuggestionPanel.svelte` pager/Escape/viewport-cap wiring; 53/53 rail tests pass, `just ci` green (166/166 total).
- REFACTOR: none needed — the GREEN implementation was already the intended final shape.

This plan's `type: execute` frontmatter (task-level `tdd="true"`, not plan-level `type: tdd`) means the project's stricter `check tdd-red-evidence` verifier (mandatory only for `type: tdd` plans under `workflow.tdd_mode`, which is `false` in this project's config) does not apply here, but the RED→GREEN discipline was followed in full, matching the 04-01 and 04-03 precedent.

## Files Created/Modified

- `src/App.svelte` - TopBar mount now passes `press`/`release`/`displayKeys`
- `src/components/TopBar.svelte` - `sugg-zone`, pass-through props, height-gated `@media (max-height: 480px)` grid
- `src/components/SuggestionPanel.svelte` - Strip + anchored nonmodal panel, pager, Escape close, viewport chip cap (new)
- `src/rail.ts` - `PageMemory<T>`, `rememberedPage`, `stepPage`, `panelMaxPerRow`
- `test/rail.test.ts` - Full behavior-bullet coverage for the three new exports

## Decisions Made

- Height-gated (`max-height: 480px`), not width-gated: this was already locked in the plan itself (04-RESEARCH.md Open Question 1, confirmed by CONTEXT.md D-10), not a decision made during execution — recorded here for traceability.
- No backdrop dismissal layer on `SuggestionPanel` (D-12): the closest analog (`TopBar`'s own popovers) uses a click-outside backdrop, but this panel deliberately omits it so a pad press while the panel is open never closes it. Confirmed against 04-PATTERNS.md's own flagged divergence.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- This is the last plan in Phase 4. All six of this plan's requirements (RAIL-01, RAIL-03, RAIL-04, RAIL-05, RAIL-07, RAIL-08) are now covered by shipped code; RAIL-05 and RAIL-07 move from Pending to Complete in `REQUIREMENTS.md` as part of this plan's close-out (no sibling plan in this phase still declares them).
- Task 1's tracer `<verify>` and Task 2's `<human-check>` together cover the full iPhone-landscape UAT surface (strip appearance, panel open/page/close via all three paths, page-memory across close/reopen and bank change, MIDI-monitor silence during browsing, held-chip release on page/close/Escape, Bank 14/Bank 2 content, and the >480px regression check) — deferred to end-of-phase UAT per this project's `human_verify_mode=end-of-phase` default, no blocker.
- `src/engines/host.ts` and `src/suggestions.data.json` are untouched, confirming this plan stayed inside its stated boundary (iPhone strip/panel only, no press/release/echo contract changes, no catalogue content change).
- Phase 4's own remaining follow-up (>6 suggestions per bank) is tracked in the existing pending todo, unaffected by this plan.

---
*Phase: 04-read-only-suggestion-rail*
*Completed: 2026-09-25*

## Self-Check: PASSED

All created/modified files present on disk (src/App.svelte, src/components/TopBar.svelte, src/components/SuggestionPanel.svelte, src/rail.ts, test/rail.test.ts, this SUMMARY.md). All three task commits (0f121d0, d78d223, eff233c) present in git log. `git rev-list --count 5b79b17..HEAD` = 3, matching `actuals.commits`.
