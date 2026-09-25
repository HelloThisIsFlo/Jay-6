---
phase: 04-read-only-suggestion-rail
plan: 01
subsystem: ui
tags: [svelte-5, runes, midi, pointer-capture, hold-count]

requires:
  - phase: 03-catalogue-mechanism-bootstrap
    provides: getSuggestionsForBank(), ResolvedSuggestion/ResolvedSuggestionStep with displayLabel fallback
provides:
  - Ref-counted hold-count gate (src/rail.ts) so a pad, keyboard key, and rail chip can hold the same key concurrently without desyncing the host or the highlight
  - Playable SuggestionChip.svelte — a true pad alias through App's own press/release path
  - Desktop/iPad SuggestionRail.svelte mounted under the pads, including the RAIL-01 empty-bank line
  - Per-source single-hold guards in PianoLayout, App's keyboard handler, and SuggestionChip
affects: [04-02 (catalogue >6 validator), 04-03 (chip row balancing/anatomy), 04-04 (iPhone strip + panel)]

actuals:
  tokens: 5513
  tasks: 2
  commits: 3
  plan_head_before: 2becc9118bbe445628206916500fa17ffa0bed5f

tech-stack:
  added: []
  patterns:
    - "Hold-count gate: Map<Key, number> ref-counting in App.svelte's press/release, forwarding to host only on the 0-to-1 press / 1-to-0 release transition"
    - "Chip-local heldHere state (not derived from the shared Set) drives held/echo/idle precedence via chipVisualState"
    - "onMount(() => () => releaseHeld()) teardown idiom for D-07 unmount-triggered release"

key-files:
  created:
    - src/rail.ts
    - test/rail.test.ts
    - src/components/SuggestionChip.svelte
    - src/components/SuggestionRail.svelte
  modified:
    - src/App.svelte
    - src/components/PianoLayout.svelte

key-decisions:
  - "Second-press-is-a-no-op (not retrigger) resolves the CONTEXT.md 'Claude's Discretion' item: a second source pressing an already-held key never reaches host.padPressed, per the simplest-implementation guidance and the hard no-hang invariant."
  - "SuggestionRail renders the RAIL-01/D-15 empty-bank line ('No curated suggestions for this bank yet') even though Task 1's action text only detailed the non-empty branch — required by this plan's own requirements list and already locked verbatim in UI-SPEC/RESEARCH.md."

patterns-established:
  - "Pattern 1 (RESEARCH.md): App-level ref-counted hold-count gate for any future third input source"
  - "Pattern 2 (RESEARCH.md): per-chip local heldHere + idempotent pointer-capture release, mirroring PianoLayout's captured Map"

requirements-completed: [RAIL-01, RAIL-02, RAIL-03, RAIL-04, RAIL-08]

coverage:
  - id: D1
    description: "pressHold/releaseHold hold-count reducer forwards exactly one press and one release per hold episode across any pad/keyboard/chip interleaving, including stray releases and panic reset"
    requirement: "RAIL-03"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#multi-source interleavings"
        status: pass
    human_judgment: false
  - id: D2
    description: "padNotesFor returns the exact same array object as the canonical bank lookup for every step of every Bank 1 and Bank 14 suggestion"
    requirement: "RAIL-03"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#padNotesFor"
        status: pass
    human_judgment: false
  - id: D3
    description: "chipVisualState precedence: held > echo > idle"
    requirement: "RAIL-04"
    verification:
      - kind: unit
        ref: "test/rail.test.ts#chipVisualState"
        status: pass
    human_judgment: false
  - id: D4
    description: "SuggestionRail renders Bank 1's suggestions as playable chips under the pads, or the honest empty-bank line, in the production bundle"
    requirement: "RAIL-01, RAIL-02"
    verification:
      - kind: other
        ref: "node bundle check: dist/assets/*.js contains aria-label=\"Suggestions\""
        status: pass
    human_judgment: false
  - id: D5
    description: "A chip press is indistinguishable from its pad press on the MIDI monitor; chip+pad held together releases correctly in either order; a chip torn down mid-hold (bank change) releases exactly once; core loop unaffected"
    requirement: "RAIL-08"
    verification: []
    human_judgment: true
    rationale: "Web MIDI is browser/hardware-only and explicitly excluded from Vitest (environment: 'node', no jsdom) — this is Task 2's embedded <human-check>, deferred to end-of-phase UAT per this project's human_verify_mode=end-of-phase convention."

duration: 4min
completed: 2026-09-25
status: complete
---

# Phase 4 Plan 1: Tracer Rail Chip Summary

**A rail chip presses/releases through App's own gated `press`/`release` path via a new ref-counted hold-count reducer, so a pad, keyboard key, and chip can all hold the same key without desyncing the host or the highlight.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-25T20:54:55+01:00
- **Completed:** 2026-09-25T20:58:37+01:00
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- `src/rail.ts`: pure `pressHold`/`releaseHold` ref-count reducer (forwards only on the 0-to-1 press / 1-to-0 release transition), `heldKeySet`, `padNotesFor` (identity-equal to the canonical bank lookup), `chipVisualState` (held > echo > idle) — 20 new Vitest cases, all passing.
- `App.svelte`: `heldKeys` is now `$derived` from a new `holdCounts` (`$state.raw<HoldCounts>`); `press`/`release` fold every source through the reducer and only call `host.padPressed`/`padReleased` on the forwarding transition (D-04); `clearAllHighlights` resets `holdCounts` to `NO_HOLDS` alongside `latchedKey` so a post-panic press isn't swallowed as a phantom extra hold.
- `SuggestionChip.svelte`: a genuine pad alias — pointer-captured press/release through the passed `onPress`/`onRelease`, resolving MIDI notes via `padNotesFor` (byte-identical array to what the pad hands the host), per-instance `heldHere` state so only the physically-pressed chip goes full orange while every other chip sharing that key echoes.
- `SuggestionRail.svelte`: desktop/iPad inline columns under the pads, keyed by `suggestion.id`, one chip per step keyed by `suggestion.id + ':' + index`; renders the locked empty-bank copy when a bank has no curated suggestions.
- Closed three ways a single source could add a hold it never releases: a second pointer on an already-held pad (`PianoLayout`), a duplicate keydown without the repeat flag (`App.svelte`'s `onKeyDown`), and a second pointer on an already-held chip (`SuggestionChip`) — plus D-07 unmount-triggered idempotent release via `onMount` teardown.
- Verified the rail actually ships: production bundle contains `aria-label="Suggestions"`; `just ci` (check + test + build) is green at 124/124 tests.

## Task Commits

Each task was committed atomically (Task 1 is TDD: RED then GREEN):

1. **Task 1 — RED: failing rail.ts reducer tests** - `e7ea89e` (test)
2. **Task 1 — GREEN: tracer, hold-count gate wired end-to-end** - `1187501` (feat)
3. **Task 2: single-hold guards + D-07 unmount release** - `2d524e5` (fix)

**Plan metadata:** pending (this commit)

## TDD Gate Compliance

Task 1 carried `tdd="true"`. Gate sequence verified present and in order:
- RED: `e7ea89e test(04-01): add failing rail.ts reducer tests` — ran before any real implementation existed; 17/20 tests failed on genuine assertions against an intentionally-wrong stub (not an import/fixture crash), 3 passed incidentally where the stub's always-`forward:false` behavior happened to match the expected stray-release/interleaving edge case.
- GREEN: `1187501 feat(04-01): tracer — a rail chip plays its pad through the hold-count gate` — stub replaced with the real reducer; 20/20 tests pass.
- REFACTOR: none needed — the GREEN implementation was already the intended final shape.

This plan's own `type: execute` frontmatter means the project's stricter `check tdd-red-evidence` verifier (mandatory only for `type: tdd` plans) does not apply here, but the RED→GREEN discipline was followed in full regardless.

## Files Created/Modified

- `src/rail.ts` - Pure hold-count reducer, pad-notes lookup, chip visual precedence (no runes)
- `test/rail.test.ts` - Full behavior-bullet coverage: reducer contract, multi-source interleavings, stray release, panic reset, notes identity, visual precedence
- `src/components/SuggestionChip.svelte` - The one playable chip component (pointer-captured pad alias)
- `src/components/SuggestionRail.svelte` - Desktop/iPad inline columns under the pads
- `src/App.svelte` - Hold-count gate in front of `host.padPressed`/`padReleased`; rail mount; single-hold keyboard guard
- `src/components/PianoLayout.svelte` - Second-pointer guard so a pad holds its key at most once

## Decisions Made

- Second-press-is-a-no-op (not retrigger): a second source pressing an already-held key increments the hold count but never reaches `host.padPressed` again. This resolves CONTEXT.md's "Claude's Discretion" item using the simplest implementation that satisfies the hard no-hang invariant, per Flo's stated indifference to which specific behavior ships.
- `SuggestionRail` renders the RAIL-01/D-15 empty-bank line (`No curated suggestions for this bank yet`, `--fg-2`, 13px) even though Task 1's action prose only detailed the non-empty render branch — this is a Rule 2 (missing critical functionality) fill-in: RAIL-01 is one of this plan's own requirements, and the exact copy/styling was already locked verbatim in `04-UI-SPEC.md` and `04-RESEARCH.md`'s code example, so no new decision was invented.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added the RAIL-01 empty-bank render branch to SuggestionRail**
- **Found during:** Task 1 (SuggestionRail.svelte creation)
- **Issue:** The task's action prose specified only the non-empty (`suggestions.length > 0`) render path; RAIL-01 ("Selecting a bank shows curated suggestions or honest empty state") and D-15 (locked empty-state copy/styling) are both in scope for this plan but the empty branch wasn't spelled out in the action bullet.
- **Fix:** Added an `{:else}` branch rendering `<p class="empty">No curated suggestions for this bank yet</p>` with the exact D-15 styling (`--fg-2`, 13px desktop/iPad, narrows to the same 24px-inset width as the rail on mobile).
- **Files modified:** src/components/SuggestionRail.svelte
- **Verification:** Copy matches UI-SPEC's Copywriting Contract verbatim; styling matches D-15's locked values.
- **Committed in:** 1187501 (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Fills a spec gap the plan's own requirements list already mandated; no scope creep beyond what RAIL-01/D-15 require.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `src/rail.ts`'s exports (`HoldCounts`, `HoldStep`, `NO_HOLDS`, `pressHold`, `releaseHold`, `heldKeySet`, `padNotesFor`, `ChipVisualState`, `chipVisualState`) are stable public contracts for 04-02/04-03/04-04 to extend (balanced row math, chip anatomy helpers, iPhone pager helpers per the phase's "Artifacts this phase produces" table).
- `SuggestionChip.svelte` and `SuggestionRail.svelte` are ready for 04-03 to extend (balanced chip-row grid swap) without touching the press/release/echo contract established here.
- RAIL-08 hardware verification (chip MIDI == pad MIDI on the OP-1/MIDI monitor, chip+pad held together in both release orders, bank-change mid-hold release, latch interaction) is captured in Task 2's `<verify><human-check>` block and deferred to end-of-phase UAT per this project's `human_verify_mode=end-of-phase` default — no blocker, just not yet human-confirmed.
- `src/engines/host.ts` and `src/suggestions.data.json` are untouched, confirming this plan stayed inside its stated boundary (no host-owned play/latch refactor, no catalogue content change).

---
*Phase: 04-read-only-suggestion-rail*
*Completed: 2026-09-25*

## Self-Check: PASSED

All created/modified files present (src/rail.ts, test/rail.test.ts, src/components/SuggestionChip.svelte, src/components/SuggestionRail.svelte, src/App.svelte, src/components/PianoLayout.svelte, this SUMMARY.md). All three task commits (e7ea89e, 1187501, 2d524e5) present in git log.
