---
phase: 03-catalogue-mechanism-bootstrap
plan: 03
subsystem: data
tags: [typescript, validation, sparse-arrays, reflection, vitest]

requires:
  - phase: 03-catalogue-mechanism-bootstrap
    provides: Staged unknown-to-validated catalogue boundary and canonical resolver from Plan 03-02
provides:
  - Dense validation of every physical catalogue and step-array position
  - Exact five-field enforcement across string, symbol, enumerable, and non-enumerable own keys
  - Executable fresh-reference guarantees for validator and resolver projections
affects: [04-read-only-suggestion-rail, catalogue-curation, catalogue-validation]

actuals:
  tokens: 1722
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns: [dense unknown-array traversal, Reflect.ownKeys exact-shape validation, fresh known-field projection]

key-files:
  created: []
  modified: [test/suggestions.test.ts, src/suggestions.ts]

key-decisions:
  - "Every declared array position is validation input, including holes read as undefined."
  - "Exact catalogue records are checked with Reflect.ownKeys, while trusted projections copy only the five allowed fields."

patterns-established:
  - "Dense boundary validation: indexed loops inspect every physical slot before typed projection."
  - "All-own-key validation: symbol paths use bracketed String(symbol) diagnostics; string keys retain dot notation."

requirements-completed: [PROG-02, PROG-03, PROG-07]

coverage:
  - id: D1
    description: "Sparse catalogue and steps arrays fail at their exact physical positions instead of entering trusted projections."
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "test/suggestions.test.ts#rejects a sparse top-level catalogue slot and rejects sparse steps at each physical slot"
        status: pass
    human_judgment: false
  - id: D2
    description: "Non-enumerable string and symbol extras fail the exact five-field catalogue contract with deterministic diagnostics."
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "test/suggestions.test.ts#unexpected own field regressions"
        status: pass
    human_judgment: false
  - id: D3
    description: "Validator and resolver outputs own fresh arrays, records, nested step arrays, and resolved step objects."
    requirement: PROG-07
    verification:
      - kind: integration
        ref: "test/suggestions.test.ts#fresh projection identity assertions"
        status: pass
      - kind: other
        ref: "just ci"
        status: pass
    human_judgment: false

duration: 2 min
completed: 2026-08-18
status: complete
---

# Phase 3 Plan 3: Catalogue Boundary Hardening Summary

**Dense sparse-array validation and all-own-key exact-shape enforcement now close the catalogue trust boundary without changing its public API.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-08-18T18:47:27Z
- **Completed:** 2026-08-18T18:49:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added fail-first public regressions for sparse catalogue slots, sparse steps, non-enumerable extras, and symbol extras.
- Replaced hole-skipping callbacks and predicates with dense indexed validation and fresh typed step collection.
- Proved validator and resolver results never share caller-owned or prior-result arrays and nested objects.
- Passed the 46-test focused suite, all 99 project tests, strict Svelte/TypeScript checks, and the production build.

## Task Commits

1. **Task 1: Add fail-first adversarial boundary and identity regressions** - `bf59ee9` (test)
2. **Task 2: Make the unknown boundary dense and exact over every own key** - `2625172` (feat)

## Files Created/Modified

- `test/suggestions.test.ts` - Sparse-array, hidden-own-key, and fresh-reference behavior contracts.
- `src/suggestions.ts` - Dense indexed traversal and complete own-key exact-record enforcement.

## Decisions Made

- Treat an array's declared length as authoritative boundary input, so omitted slots are diagnosed as `undefined` at their physical indexes.
- Use `Reflect.ownKeys` for exact record validation, with deterministic dot paths for strings and bracketed `String(symbol)` paths for symbols.
- Accumulate validated keys into a fresh typed array instead of using a hole-skipping predicate as the trust gate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Repaired generated planning metadata**

- **Found during:** Plan close-out
- **Issue:** State decision entries used `Phase ?`, and the roadmap helper removed table-cell spacing and the empty-date marker.
- **Fix:** Restored the `Phase 03` decision labels and canonical roadmap table formatting.
- **Files modified:** `.planning/STATE.md`, `.planning/ROADMAP.md`
- **Verification:** Final planning diff and markdown structure inspection passed.
- **Committed in:** Plan metadata commit

---

**Total deviations:** 1 auto-fixed bug.
**Impact on plan:** Metadata correctness was restored without changing runtime scope.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None. Empty arrays in the validator and empty-bank resolver paths are intentional working values, not incomplete UI or data wiring.

## TDD Gate Compliance

- **RED:** `bf59ee9` committed four intended failing public-boundary regressions while 42 prior and identity assertions remained green.
- **GREEN:** `2625172` made all 46 focused assertions pass without changing public types, catalogue data, or canonical bank data.
- **REFACTOR:** No separate cleanup was needed.

## Next Phase Readiness

- Phase 4 can consume the resolver with executable proof that malformed sparse or hidden-key inputs cannot cross the typed boundary.
- Catalogue and canonical bank data remain unchanged, and no dependency, UI, playback, MIDI, or state surface was added.

## Self-Check: PASSED

- Both modified source files and this summary exist.
- Task commits `bf59ee9` and `2625172` exist.
- The focused 46-test suite passes after the final implementation.
- `just check` and `just ci` passed with 99 project tests and a successful production build.

---
*Phase: 03-catalogue-mechanism-bootstrap*
*Completed: 2026-08-18*
