---
phase: 04-read-only-suggestion-rail
plan: 02
subsystem: data
tags: [typescript, vitest, vite, validation, catalogue]

requires:
  - phase: 03-catalogue-mechanism-bootstrap
    provides: validateSuggestionCatalogue(), the staged/deterministic/actionable CatalogueIssue diagnostic style, the duplicate-id/duplicate-sequence grouping-loop precedent
provides:
  - "too-many-suggestions CatalogueIssueCode: one issue per entry past the 6th in a bank, in source order, with value = running count and relatedPath to the bank's 6th entry"
  - "MAX_SUGGESTIONS_PER_BANK (6) exported constant, D-16's iPad-scroll-lock limit made enforceable"
  - "vite.config.ts side-effect import of ./src/suggestions — an invalid catalogue now fails vite build, vite dev, and every vitest run at config load"
affects: [04-03, 04-04]

actuals:
  tokens: 2743
  tasks: 2
  commits: 3
  plan_head_before: 92b39ae5101a722a20473c4603fa08b5b55b536f

tech-stack:
  added: []
  patterns:
    - "Per-bank running-count check added to the existing cross-entry duplicate-id/duplicate-sequence loop in src/suggestions.ts, tracking a bank's 6th-entry path and emitting one issue per offending entry in source order — same shape as the duplicate-* precedent"
    - "Config-time side-effect import (vite.config.ts imports ./src/suggestions) turns a module-level import-time throw into a build/dev/test gate, not just a runtime browser-load gate"

key-files:
  created: []
  modified:
    - src/suggestions.ts
    - test/suggestions.test.ts
    - vite.config.ts

key-decisions:
  - "Duplicate-id/duplicate-sequence entries still count toward the per-bank cap (they are validEntries, just also flagged) — matches the plan's own behavior bullet: a 7th entry that duplicates an id or sequence yields both issues, in [duplicate-*, too-many-suggestions] order."

patterns-established:
  - "Cap enforcement lives in the same single cross-entry loop as duplicate-id/duplicate-sequence — no second pass over validEntries, keeping emission order (per-entry, source order) automatic rather than requiring a separate sort step."

requirements-completed: [RAIL-05]

coverage:
  - id: D1
    description: "A 7th suggestion in one bank yields exactly one too-many-suggestions issue with the exact path/value/expected/relatedPath shape, and MAX_SUGGESTIONS_PER_BANK equals 6"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "test/suggestions.test.ts#per-bank suggestion cap"
        status: pass
    human_judgment: false
  - id: D2
    description: "The cap is pinned at the exact boundary (6 valid, 8 = two issues), independent per bank across interleaved source order, skips malformed entries, and orders after duplicate-id/duplicate-sequence for the same entry"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "test/suggestions.test.ts#per-bank suggestion cap"
        status: pass
    human_judgment: false
  - id: D3
    description: "An over-cap catalogue fails vite config loading (the shared first step of vite build, vite dev, and vitest) instead of only throwing when the app bundle loads in a browser"
    requirement: "RAIL-05"
    verification:
      - kind: other
        ref: "node temp-copy gate proof: vite.loadConfigFromFile rejects with a message containing too-many-suggestions for a 7-entry bank"
        status: pass
    human_judgment: false
  - id: D4
    description: "The real, valid production vite.config.ts still evaluates src/suggestions.ts as a config dependency and loads cleanly"
    requirement: "RAIL-05"
    verification:
      - kind: other
        ref: "node dependency check: vite.loadConfigFromFile(...).dependencies includes src/suggestions.ts"
        status: pass
    human_judgment: false
  - id: D5
    description: "Production catalogue, resolver, and all Phase 3 pins stay unchanged and green; full suite and build stay green"
    requirement: "RAIL-05"
    verification:
      - kind: unit
        ref: "npm test (133/133 across 9 files)"
        status: pass
      - kind: other
        ref: "just ci (svelte-check 0 errors, vitest 133/133, vite build succeeds)"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-09-25
status: complete
---

# Phase 4 Plan 2: Per-Bank Suggestion Cap Summary

**D-17's `too-many-suggestions` diagnostic caps every bank at 6 suggestions inside the existing staged validator, and `vite.config.ts` now imports the catalogue at config load so an over-cap (or otherwise invalid) catalogue fails `vite build`, `vite` dev start, and every vitest run instead of only the browser bundle.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-25T21:03:16+01:00 (RED commit)
- **Completed:** 2026-09-25T21:07:01+01:00 (final pin commit)
- **Tasks:** 2
- **Files modified:** 3 (0 created, 3 modified)

## Accomplishments

- `src/suggestions.ts`: `CatalogueIssueCode` gains `'too-many-suggestions'`; `MAX_SUGGESTIONS_PER_BANK = 6` exported beside the other rule constants (D-16: iPad body-scroll lock, 3×2 grid). The existing cross-entry loop (same one that emits `duplicate-id`/`duplicate-sequence`) now also tracks a per-bank running count and the path of each bank's 6th valid entry, emitting one `too-many-suggestions` issue per entry past the cap, in source order, with `value` = the running count and `relatedPath` pointing at the bank's 6th entry.
- `vite.config.ts`: a side-effect `import './src/suggestions'` runs the module's import-time validation at config load, so `vite build`, `vite` dev start, and every vitest run now fail loudly on an invalid catalogue instead of only the app bundle throwing once loaded in a browser.
- `test/suggestions.test.ts`: a new `per-bank suggestion cap` describe block (9 tests) pins the constant, the exact 7th-entry diagnostic shape, the 6-valid/8-two-issues boundary, per-bank independence across interleaved source order (including a bank interleaved with another bank capping at its own source-order position, not the array length), that malformed entries never count toward the cap, and that a 7th entry which also duplicates an id or sequence yields both issues in `[duplicate-*, too-many-suggestions]` order.
- Verified the build-time gate directly: a temp-copy `vite.loadConfigFromFile` run against a 7-entry-in-one-bank catalogue rejects with a message containing `too-many-suggestions`; the same call against the real (valid, 3-record) catalogue succeeds and lists `src/suggestions.ts` among its config dependencies.
- `just ci` is green: 133/133 tests (up from 124 after 04-01), 0 svelte-check errors, production build succeeds.

## Task Commits

Each task was committed atomically (Task 1 is TDD tracer: RED then GREEN; Task 2 adds pins directly against the already-correct implementation):

1. **Task 1 — RED: failing per-bank cap tests** - `20428ef` (test)
2. **Task 1 — GREEN: too-many-suggestions diagnostic + vite config-time gate** - `ede387d` (feat)
3. **Task 2: pin cap boundaries, bank independence, and diagnostic order** - `5004418` (test)

**Plan metadata:** pending (this commit)

## TDD Gate Compliance

Task 1 carried `tdd="true"`. Gate sequence verified present and in order:
- RED: `20428ef test(04-02): add failing per-bank suggestion cap tests` — ran before `MAX_SUGGESTIONS_PER_BANK` existed or the cap check was implemented; 2/2 new tests failed on genuine assertions (validator returned `ok: true` for the 7-entry fixture instead of the expected issue; the imported constant was `undefined`, not `6`). No import/fixture crash — 51/53 other tests in the file still passed.
- GREEN: `ede387d feat(04-02): enforce D-17 per-bank suggestion cap at validation and config load` — 53/53 tests passed after implementing the constant, the issue code, the per-bank count tracking, and the vite config import.
- REFACTOR: none needed — the GREEN implementation mirrors the existing duplicate-id/duplicate-sequence loop shape exactly; Task 2's 8 additional pins (60/60 total) passed against it unchanged on the first run, confirming no hidden edge-case gaps.

Task 2 carried `tdd="true"` but is `type="auto"` (not `type="tracer"`): its tests pin behavior against Task 1's already-correct implementation rather than driving new implementation; all pins passed immediately.

This plan's own `type: execute` frontmatter (not `type: tdd`) means the project's stricter `check tdd-red-evidence` verifier (mandatory only for `type: tdd` plans, and only when `workflow.tdd_mode` is enabled — it is `false` in this project's config) does not apply here, but the RED→GREEN discipline was followed in full regardless.

## Files Created/Modified

- `src/suggestions.ts` - `too-many-suggestions` issue code, `MAX_SUGGESTIONS_PER_BANK` constant, per-bank count tracking in the cross-entry loop
- `test/suggestions.test.ts` - `per-bank suggestion cap` describe block: 9 tests covering the exact diagnostic shape, boundary, independence, interleaving, malformed-entry exclusion, and duplicate-* ordering
- `vite.config.ts` - side-effect import of `./src/suggestions` so config load evaluates the catalogue

## Decisions Made

- Entries that also trip `duplicate-id` or `duplicate-sequence` still count toward the per-bank cap (they remain in `validEntries` from the first pass — only per-entry field validity removes an entry from that list). This was already implied by the plan's own behavior bullet ("a 7th entry reusing the first entry's id yields `[duplicate-id, too-many-suggestions]`") and required no new judgment call, just confirming the existing loop structure already produces it.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The per-bank cap is now structurally impossible to violate silently: it fails Vitest, `vite build`, `vite` dev start, and therefore any Docker image build that runs `npm run build`.
- `src/suggestions.data.json` is untouched (only 3 records, both banks well under the cap) — confirmed via `git diff --quiet -- src/suggestions.data.json` before committing, per the plan's own acceptance criterion that the gate proof must run against a temp copy only.
- 04-03 (chip row balancing/anatomy) and 04-04 (iPhone strip + panel) can build on `getSuggestionsForBank` exactly as before — no change to its return shape, only a new failure mode for catalogue authors who exceed the cap.
- Lifting the cap remains explicitly out of scope, tracked in `.planning/todos/pending/2026-09-25-suggestion-rail-more-than-six-per-bank.md`.

---
*Phase: 04-read-only-suggestion-rail*
*Completed: 2026-09-25*

## Self-Check: PASSED

All modified files present (src/suggestions.ts, test/suggestions.test.ts, vite.config.ts, this SUMMARY.md). All three task commits (20428ef, ede387d, 5004418) present in git log. Re-ran `npm test -- test/suggestions.test.ts` (60/60 pass), the temp-copy gate proof (exit 0), the dependency check (exit 0), and `just ci` (133/133 tests, 0 check errors, build succeeds) — all match the results reported above.
