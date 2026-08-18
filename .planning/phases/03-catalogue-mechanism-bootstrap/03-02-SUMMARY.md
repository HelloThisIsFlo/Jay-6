---
phase: 03-catalogue-mechanism-bootstrap
plan: 02
subsystem: data
tags: [typescript, json, validation, canonical-resolution, vitest]

requires:
  - phase: 03-catalogue-mechanism-bootstrap
    provides: Fail-first catalogue validator, production fixture, and resolver contract from Plan 03-01
provides:
  - Exact three-record agent-editable suggestion catalogue
  - Pure staged runtime validation with deterministic structured diagnostics
  - Canonical bank-aware resolver returning fresh inert readonly views
affects: [04-read-only-suggestion-rail, catalogue-curation]

actuals:
  tokens: 2697
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns: [unknown-to-validated static data boundary, valid-record-only duplicate checks, filter-map source ordering]

key-files:
  created: [src/suggestions.data.json, src/suggestions.ts]
  modified: []

key-decisions:
  - "Catalogue imports cross an explicit unknown boundary and expose only fresh validated projections."
  - "Bank lookup validates integer bounds before direct canonical access and returns inert text-only views in source order."

patterns-established:
  - "Staged catalogue validation: entry and field diagnostics precede valid-record-only duplicate checks."
  - "Canonical suggestion resolution: filter the validated catalogue, then map keys through banks and labelFor() without sorting."

requirements-completed: [PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, BOOT-01]

coverage:
  - id: D1
    description: "One flat JSON catalogue contains exactly the two locked Bank 1 progressions and one Bank 14 movement."
    requirement: PROG-01
    verification:
      - kind: unit
        ref: "node locked-bootstrap deep-equality verification from 03-02-PLAN.md"
        status: pass
    human_judgment: false
  - id: D2
    description: "Pure staged validation rejects malformed fields, keys, banks, kinds, duplicate IDs, and same-bank duplicate sequences with deterministic diagnostics."
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "test/suggestions.test.ts#suggestion catalogue validation"
        status: pass
    human_judgment: false
  - id: D3
    description: "Bank lookup resolves canonical names and fallbacks into fresh inert views while preserving catalogue order and honest empty results."
    requirement: PROG-04
    verification:
      - kind: integration
        ref: "test/suggestions.test.ts#canonical suggestion resolution and suggestion lookup"
        status: pass
    human_judgment: false
  - id: D4
    description: "Strict checks, all 94 tests, and the production build pass with no external API coverage matrix required."
    requirement: PROG-07
    verification:
      - kind: other
        ref: "just ci"
        status: pass
      - kind: other
        ref: "api-coverage detector: detected false"
        status: pass
    human_judgment: false

duration: 5 min
completed: 2026-08-18
status: complete
---

# Phase 3 Plan 2: Validated Catalogue and Canonical Resolver Summary

**A three-record JSON catalogue now fails closed through staged runtime validation and resolves canonical bank labels into fresh inert read-only views.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-18T17:50:54Z
- **Completed:** 2026-08-18T17:55:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added the exact locked bootstrap catalogue with only five authoring fields and no duplicated canonical or speculative metadata.
- Implemented pure deterministic validation across exact shape, values, ordered pad keys, and valid-record-only cross-entry uniqueness.
- Added guarded canonical resolution that preserves source order, keeps raw blank chord names, derives display fallbacks through `labelFor()`, and exposes no MIDI or mutable bank authority.
- Passed the 41-test focused contract, all 94 project tests, strict Svelte/TypeScript checks, and the production build.

## Task Commits

1. **Task 1: Author the exact three-record catalogue** - `23e4034` (feat)
2. **Task 2: Implement staged validation and canonical bank resolution** - `f8753a8` (feat)

## Files Created/Modified

- `src/suggestions.data.json` - Sole flat authoring source with the exact three bootstrap records.
- `src/suggestions.ts` - Public contracts, pure staged validator, fail-closed static loader, and canonical resolver.

## Decisions Made

- Kept validation as an explicit `unknown` boundary with fresh projections so TypeScript assertions cannot substitute for runtime safety.
- Used direct guarded `banks[bankIndex - 1]` access and `filter().map()` so invalid indexes never wrap and catalogue order remains authoritative.
- Returned only suggestion text identity and resolved chord labels, leaving MIDI notes, callbacks, engines, timing, and state outside the boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Narrowed unknown bank indexes before numeric comparison**

- **Found during:** Task 2 (`just ci` strict type gate)
- **Issue:** The initial type guard called numeric predicates but compared the still-unknown value directly, causing two strict TypeScript errors.
- **Fix:** Added an explicit `typeof value === 'number'` narrowing before integer, finite, and bounds checks.
- **Files modified:** `src/suggestions.ts`
- **Verification:** `just ci` passed with zero Svelte/TypeScript errors, 94 tests, and a successful production build.
- **Committed in:** `f8753a8`

**2. [Rule 1 - Bug] Repaired malformed generated planning metadata**

- **Found during:** Plan close-out
- **Issue:** The state decision helper emitted `Phase ?` labels, and the roadmap progress helper removed table-cell spacing while updating the Phase 3 row.
- **Fix:** Replaced both placeholder labels with `Phase 03` and restored the roadmap table's canonical spacing and empty-date marker.
- **Files modified:** `.planning/STATE.md`, `.planning/ROADMAP.md`
- **Verification:** Final planning diff and markdown structure inspection passed.
- **Committed in:** Plan metadata commit

---

**Total deviations:** 2 auto-fixed bugs.
**Impact on plan:** Both fixes were required for correct code or metadata and did not change scope or the locked runtime contract.

## Issues Encountered

None beyond the auto-fixed issues above.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None. Empty arrays in the validator are working accumulators and honest empty-bank results, not UI or data stubs.

## Next Phase Readiness

- Phase 4 can consume `getSuggestionsForBank()` without importing canonical MIDI notes or mutable bank objects.
- Direct catalogue edits now receive deterministic validation failures without application-logic changes.
- No UI, playback, transport, storage, dependency, or external service was added.

## Self-Check: PASSED

- Both created source files and this summary exist.
- Task commits `23e4034` and `f8753a8` exist.
- The focused 41-test catalogue suite passes after the final implementation.
- `just ci` passed strict checks, all 94 tests, and the production build.
- The API coverage detector reported `detected: false`; no `COVERAGE.md` was created.

---
*Phase: 03-catalogue-mechanism-bootstrap*
*Completed: 2026-08-18*
