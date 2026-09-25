---
phase: 04-read-only-suggestion-rail
plan: 03
subsystem: ui
tags: [svelte-5, runes, css-grid, chip-anatomy, balanced-rows]

requires:
  - phase: 04-read-only-suggestion-rail (plan 01)
    provides: Playable SuggestionChip.svelte, desktop/iPad SuggestionRail.svelte, hold-count gate, chipVisualState
provides:
  - Balanced/fitted chip-row math (chipsPerRow, fitChipsPerRow) that steps a column's per-row cap down when measured overflow demands it, so no row ever spills or scrolls
  - Chord-label anatomy helpers (splitChordLabel, isNaturalKey) proven byte-exact across all 1200 canonical labels
  - Shared SuggestionChips.svelte grid, reusable by both the desktop/iPad rail and 04-04's iPhone panel
  - Finished chip anatomy: cream natural-key outline, slash-split main/bass chord text, held state that always beats the outline
  - Rail chrome: steel uppercase eyebrow with count, the locked D-15 empty-bank line, and an iPhone-landscape hide so 04-04's TopBar strip can take over
affects: [04-04 (iPhone strip + panel reuse SuggestionChips.svelte and the same RAIL_COLUMN_MAX_PER_ROW/panelMaxPerRow contracts)]

actuals:
  tokens: 3867
  tasks: 2
  commits: 3
  plan_head_before: 72e4a022bc4ba0f0e5b6e1e21fa0a45db4a5a1f3

tech-stack:
  added: []
  patterns:
    - "Measure-then-fit CSS grid: bind:clientWidth + bind:this drive an $effect that calls fitChipsPerRow with a predicate reading scrollWidth vs clientWidth, writing the accepted candidate to a --per custom property"
    - "chipsPerRow balanced-row formula (rows = ceil(n/cap); per = ceil(n/rows)) shared by the fixed desktop/iPad cap (4) and the general UI-SPEC cap (6) via a parameterized maxPerRow"
    - "CSS specificity pairing (.chip.held, .chip.held[data-color]) to guarantee a stateful class always outranks an attribute-selector visual hint, regardless of source order"

key-files:
  created:
    - src/components/SuggestionChips.svelte
  modified:
    - src/rail.ts
    - test/rail.test.ts
    - src/components/SuggestionChip.svelte
    - src/components/SuggestionRail.svelte

key-decisions:
  - "Column chip cap stays at 4 (RAIL_COLUMN_MAX_PER_ROW), not UI-SPEC's general 6 — sketch 003's validated columns layout caps at 4 for narrow (≥280px) containers; fitChipsPerRow is the safety net for any row that still overflows at that cap."
  - "fitChipsPerRow skips a measurement candidate identical to the one just rejected (lowering the cap further doesn't always change the balanced-row output) and returns 1 at cap 1 without ever calling the predicate, since a single-chip-per-row layout always fits."

patterns-established:
  - "One shared chip-row component (SuggestionChips.svelte) for every rail surface — 04-04's iPhone panel reuses it verbatim with its own maxPerRow, per D-14."

requirements-completed: [RAIL-01, RAIL-02, RAIL-05, RAIL-06, RAIL-07]

coverage:
  - id: D1
    description: "chipsPerRow balances n chips across the fewest rows at or under a cap (0/1/at-cap/over-cap for both cap 4 and cap 6); fitChipsPerRow walks the cap down on a measured-overflow predicate, skipping repeated candidates and returning 1 at cap 1 without asking"
    requirement: "RAIL-06"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#chipsPerRow and #fitChipsPerRow"
        status: pass
    human_judgment: false
  - id: D2
    description: "splitChordLabel splits at the first slash only (bass keeps the slash) and reconstructs every one of the 1200 canonical chord labels across all 100 banks exactly, with bass empty iff the label has no slash"
    requirement: "RAIL-02"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#splitChordLabel"
        status: pass
    human_judgment: false
  - id: D3
    description: "isNaturalKey is true exactly for the 7 natural keys (C, D, E, F, G, A, B) and false for every accidental"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#isNaturalKey"
        status: pass
    human_judgment: false
  - id: D4
    description: "SuggestionChips renders every chip in a balanced grid that measures real scrollWidth vs clientWidth and steps the cap down so no row overflows or scrolls, even for Bank 14's unnamed 'C Oct Stack' chips or a deliberately long stress label, across desktop and iPad viewports"
    requirement: "RAIL-06"
    verification: []
    human_judgment: true
    rationale: "Layout fit against a real rendered column width requires a browser (Vitest runs in node, no jsdom); Task 2's embedded <human-check> stress-tests this explicitly and is deferred to end-of-phase UAT per this project's human_verify_mode=end-of-phase convention."
  - id: D5
    description: "The rail shows a steel uppercase 'SUGGESTIONS · N' eyebrow above populated columns, or the honest locked empty-bank line with no count/button/icon/orange, and disappears entirely at iPhone-landscape heights (max-height: 480px) so the 04-04 TopBar strip can take over"
    requirement: "RAIL-01, RAIL-05, RAIL-07"
    verification:
      - kind: other
        ref: "node bundle check: dist/assets/*.js contains 'No curated suggestions for this bank yet'"
        status: pass
    human_judgment: true
    rationale: "Visual subordination to the pads, eyebrow rendering, and cross-viewport fit (desktop/iPad landscape/iPad portrait) are judgment calls that need real rendering; the bundle check only proves the empty-state copy ships, not that the layout reads correctly. Deferred to Task 2's <human-check> at end-of-phase UAT."

duration: 9min
completed: 2026-09-25
status: complete
---

# Phase 4 Plan 3: Chip Anatomy and Balanced Rows Summary

**Fitted balanced chip-row math (measure scrollWidth, step the per-row cap down) plus finished chip anatomy — cream natural-key outline, slash-split chord text, and a steel eyebrow/honest-empty rail that hides on iPhone landscape.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-25T21:09:30+01:00
- **Completed:** 2026-09-25T21:18:07+01:00
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments

- `src/rail.ts`: `RAIL_COLUMN_MAX_PER_ROW` (4), `chipsPerRow` (balanced-row formula), `fitChipsPerRow` (predicate-driven cap walk with skip-repeated-candidate and cap-1-without-asking behavior), `splitChordLabel` (first-slash-only split), `isNaturalKey` — 39/39 `test/rail.test.ts` cases pass, including the all-1200-canonical-labels round-trip invariant across every bank.
- `SuggestionChips.svelte` (new): the shared chip grid every rail surface will use — binds its own width, measures `scrollWidth` vs `clientWidth` inside an `$effect`, and calls `fitChipsPerRow` to step the per-row cap down until a row actually fits, writing the result to a `--per` CSS custom property.
- `SuggestionChip.svelte`: finished anatomy — `data-color` natural/accidental classification driving the cream outline, chord text split into `.main`/`.bass` spans (bass at 0.72 opacity, breaking only before the slash), and a widened held selector (`.chip.held, .chip.held[data-color]`) so a held natural-key chip's orange always beats the outline instead of tying on CSS specificity.
- `SuggestionRail.svelte`: columns now render through the shared `SuggestionChips` instead of an inline flex row; added the steel uppercase `Suggestions · N` eyebrow, kept the locked D-15 empty-bank line, and added `@media (max-height: 480px) { .rail { display: none; } }` so the rail yields to 04-04's TopBar strip on iPhone landscape.
- Verified end-to-end: `npm test -- test/rail.test.ts` (39/39), `just ci` (152/152 tests, 0 type errors, build succeeds), and a production-bundle check confirming the empty-state copy ships.

## Task Commits

Each task was committed atomically (Task 1 is TDD tracer: RED then GREEN):

1. **Task 1 — RED: failing chip-anatomy and balanced-row tests** - `e1df030` (test)
2. **Task 1 — GREEN: fitted balanced chip rows and finished chip anatomy** - `8893072` (feat)
3. **Task 2: rail chrome — eyebrow, honest empty line, iPhone hide** - `70ed11a` (feat)

**Plan metadata:** pending (this commit)

## TDD Gate Compliance

Task 1 carried `tdd="true"`. Gate sequence verified present and in order:
- RED: `e1df030 test(04-03): add failing chip-anatomy and balanced-row-math tests` — added tests for `chipsPerRow`, `fitChipsPerRow`, `splitChordLabel`, `isNaturalKey` against intentionally-wrong stub bodies in `src/rail.ts` (stubs compile so the failures are genuine assertion failures, not import/fixture crashes); 15/39 tests failed on real assertions, 24 passed incidentally (e.g. `chipsPerRow(0, 4)` where the stub's constant-0 return happened to match).
- GREEN: `8893072 feat(04-03): fitted balanced chip rows and finished chip anatomy` — stubs replaced with the real implementations plus the Svelte component work; 39/39 tests pass, `just ci` green.
- REFACTOR: none needed — the GREEN implementation was already the intended final shape.

This plan's `type: execute` frontmatter (task-level `tdd="true"`, not plan-level `type: tdd`) means the project's stricter `check tdd-red-evidence` verifier (mandatory only for `type: tdd` plans under `workflow.tdd_mode`) does not apply here, but the RED→GREEN discipline was followed in full regardless, matching 04-01's precedent.

## Files Created/Modified

- `src/rail.ts` - Balanced/fitted row math and chord-label/natural-key anatomy helpers (pure, no runes)
- `test/rail.test.ts` - Full behavior-bullet coverage for the four new exports, including the all-banks invariant
- `src/components/SuggestionChips.svelte` - Shared measured chip grid (new)
- `src/components/SuggestionChip.svelte` - Finished chip anatomy (cream outline, slash-split text, widened held selector)
- `src/components/SuggestionRail.svelte` - Rail chrome (eyebrow, empty line, iPhone hide) + delegates chip rows to SuggestionChips

## Decisions Made

- Column chip cap stays at 4 (`RAIL_COLUMN_MAX_PER_ROW`), not UI-SPEC's general cap of 6 — this is a design decision already locked in the plan itself (sketch 003's validated columns layout), not one made during execution; recorded here for traceability.
- `fitChipsPerRow`'s skip-repeated-candidate and cap-1-without-asking behavior were derived directly from the plan's `<behavior>` bullets (predicate call sequences were spelled out exactly), so no interpretation was needed — the algorithm was designed to produce those exact call sequences.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `src/rail.ts` now exports `RAIL_COLUMN_MAX_PER_ROW`, `chipsPerRow`, `fitChipsPerRow`, `ChordLabelParts`, `splitChordLabel`, `isNaturalKey` alongside 04-01's hold-count/chip-visual exports — all stable public contracts for 04-04 to extend (iPhone pager helpers: `PageMemory<T>`, `rememberedPage`, `stepPage`, `panelMaxPerRow`).
- `SuggestionChips.svelte` is ready for 04-04's `SuggestionPanel.svelte` to reuse verbatim with its own `maxPerRow` (the wider UI-SPEC cap of 6), per D-14 ("one chip component everywhere").
- Task 2's `<human-check>` (desktop/iPad/iPad-portrait visual verification, including a Bank 60 long-label stress test) is captured and deferred to end-of-phase UAT per this project's `human_verify_mode=end-of-phase` default — no blocker, just not yet human-confirmed.
- `src/engines/host.ts`, `src/App.svelte`, and `src/suggestions.data.json` are untouched, confirming this plan stayed inside its stated boundary (chip anatomy + rail chrome only, no press/release/echo contract changes).

---
*Phase: 04-read-only-suggestion-rail*
*Completed: 2026-09-25*

## Self-Check: PASSED

All created/modified files present on disk (src/rail.ts, test/rail.test.ts, src/components/SuggestionChips.svelte, src/components/SuggestionChip.svelte, src/components/SuggestionRail.svelte, this SUMMARY.md). All three task commits (e1df030, 8893072, 70ed11a) present in git log. `git rev-list --count 72e4a02..HEAD` = 3, matching `actuals.commits`.
