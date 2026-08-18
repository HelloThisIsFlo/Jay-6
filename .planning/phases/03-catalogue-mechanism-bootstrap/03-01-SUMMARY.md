---
phase: 03-catalogue-mechanism-bootstrap
plan: 01
subsystem: testing
tags: [vitest, typescript, static-data, validation]

requires:
  - phase: 02.1-visual-redesign-adoption
    provides: Shipped Jay-6 application and canonical bank data layer
provides:
  - Fail-first staged catalogue validator contract
  - Exact three-record bootstrap and canonical resolution contract
  - Exhaustive bank lookup and invalid-index contract
affects: [03-02-catalogue-mechanism-bootstrap, 04-read-only-suggestion-rail]

actuals:
  tokens: 3558
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns: [synthetic unknown fixtures, exact ordered diagnostics, exhaustive bank loops]

key-files:
  created: [test/suggestions.test.ts]
  modified: []

key-decisions:
  - "Catalogue diagnostics use twelve stable issue codes with exact JSONPath-like locations and deterministic expected-rule text."
  - "Validation issues are staged by entry and field before valid-record-only duplicate checks."

patterns-established:
  - "Wave 0 contract: production implementation remains absent while the focused suite fails only at that module boundary."
  - "Canonical resolution assertions compare complete inert view objects so extra playback or MIDI authority cannot leak in."

requirements-completed: [PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, BOOT-01]

coverage:
  - id: D1
    description: Pure validator contract covers exact shape, canonical values, purity, deterministic diagnostics, and valid-record-only duplicates.
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "node static validator-contract verification from 03-01-PLAN.md"
        status: pass
    human_judgment: false
  - id: D2
    description: Bootstrap, canonical resolution, inert views, exhaustive empty-bank lookup, and non-wrapping index behavior are fixed before implementation.
    requirement: BOOT-01
    verification:
      - kind: other
        ref: "npm test -- test/suggestions.test.ts (expected missing-module fail-first gate)"
        status: pass
    human_judgment: false

duration: 4 min
completed: 2026-08-18
status: complete
---

# Phase 3 Plan 1: Fail-First Suggestion Contract Summary

**A 483-line Vitest contract fixes the complete catalogue validator, bootstrap, canonical resolution, and bank lookup behavior before production code exists.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-18T17:42:54Z
- **Completed:** 2026-08-18T17:47:03Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Validator tests cover exact fields, canonical keys, supported kinds, bank bounds, empty steps, Unicode preservation, purity, deterministic issue ordering, and duplicate semantics.
- Production tests lock the exact three-record catalogue and canonical Bank 1 and Bank 14 labels without duplicating factory data.
- Lookup tests exhaust all 100 banks, prove the other 98 return `[]`, and require `RangeError` before invalid indexes can wrap.

## Task Commits

1. **Task 1: Specify the pure staged validator contract** - `a5b2715` (test)
2. **Task 2: Specify bundled data, canonical resolution, and lookup** - `dded8bf` (test)

## Files Created/Modified

- `test/suggestions.test.ts` - Wave 0 validator, bootstrap, resolver, and lookup contract.

## Decisions Made

- Fixed twelve machine-stable issue codes and exact rule strings so Plan 03-02 has one deterministic implementation target.
- Kept malformed records out of duplicate checks while preserving field, step, source, and duplicate order.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The focused and full test runs fail only because the planned `src/suggestions.ts` module is intentionally absent; all 53 pre-existing tests pass.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None. The missing production module is the intentional Wave 0 boundary implemented by Plan 03-02, not a stub introduced by this plan.

## Next Phase Readiness

- Ready for Plan 03-02 to implement the exact validator and resolver contract.
- No UI, MIDI, timing, storage, dependency, or canonical bank-data changes were introduced.

## Self-Check: PASSED

- `test/suggestions.test.ts` exists.
- Task commits `a5b2715` and `dded8bf` exist.
- The focused failure is exclusively the absent `../src/suggestions` module.
- No file under `src/` changed.

---
*Phase: 03-catalogue-mechanism-bootstrap*
*Completed: 2026-08-18*
