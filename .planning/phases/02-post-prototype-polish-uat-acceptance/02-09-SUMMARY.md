---
phase: 02-post-prototype-polish-uat-acceptance
plan: 09
subsystem: ui
tags: [svelte, css, ipad, ios, user-select, touch, label]

# Dependency graph
requires:
  - phase: 02-post-prototype-polish-uat-acceptance (02-03)
    provides: TopBar user-select:none + iPad body scroll-lock that this plan extends/relaxes
provides:
  - "User-facing 'Beat' style label (was 'Phrase Dur') in UI + MANUAL + README"
  - "App-wide text-selection suppression on touch surfaces, inputs still editable"
  - "iPhone-landscape scrollability so off-screen keys are reachable"
affects: [uat-walkthrough, visual-design-todo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "App-wide user-select:none on <main>, re-enabled on input/textarea via :global()"
    - "Short-viewport (max-height:480px) media override relaxes the coarse-pointer scroll-lock for landscape"

key-files:
  created: []
  modified:
    - src/state.svelte.ts
    - MANUAL.md
    - README.md
    - src/components/PianoLayout.svelte
    - src/App.svelte

key-decisions:
  - "Renamed only the user-facing label to 'Beat'; internal phraseDur key/type/PhraseDurationEngine left unchanged for fragile state-machine stability."
  - "Rhythm Gate 4/5 stay their own labelled styles — did NOT fold them under a 'Beat' umbrella (info-architecture redesign is out of scope, owned by visual-design todo)."
  - "Landscape relax keyed on max-height:480px (covers iPhone landscape) rather than orientation:landscape, so tall tablets keep the portrait-style lock."

patterns-established:
  - "Selection suppression: suppress app-wide at root, re-enable narrowly on editable inputs."

requirements-completed: [REQ-ipad-polish, REQ-style-selector]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 02 Plan 09: Close remaining UI/labelling gaps Summary

**'Phrase Dur' relabelled to 'Beat', app-wide touch text-selection suppressed (inputs still editable), and iPhone-landscape made scrollable so the keyboard is reachable.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-20T20:40:00Z
- **Completed:** 2026-05-20T20:41:30Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Style 3 now reads **'Beat (Style 3)'** in the selector, MANUAL.md, and README.md (UAT test 10).
- Text-selection suppressed on pads, pad labels, and the whole app root; `-webkit-touch-callout:none` kills the iOS long-press menu; `<input>`/`<textarea>` stay editable (UAT test 19).
- iPhone landscape (short viewport) restores `overflow-y:auto` + `position:static` so off-screen keys can be scrolled to, while keeping portrait scroll-lock + `overscroll-behavior:none` rubber-band containment (UAT test 19).

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename user-facing 'Phrase Dur' → 'Beat' (label + docs)** - `a130b85` (feat)
2. **Task 2: Suppress text-selection on all touch surfaces** - `cd1ff67` (fix)
3. **Task 3: Make iPhone landscape usable (reachable keyboard)** - `d0b7682` (fix)

## Files Created/Modified
- `src/state.svelte.ts` - `STYLE_LABELS.phraseDur` label → `'Beat (Style 3)'`; WHY-comments noting internal key stays `phraseDur`.
- `MANUAL.md` - "Phrase Dur" section heading → "Beat".
- `README.md` - styles list "Phrase Duration" → "Beat".
- `src/components/PianoLayout.svelte` - `user-select:none` + `-webkit-touch-callout:none` on `.pad` and `.pad .key`/`.pad .name`.
- `src/App.svelte` - app-wide selection suppression on `<main>` with input/textarea re-enable; short-viewport media override restoring landscape scrollability.

## Decisions Made
- **Label-only rename.** Internal `phraseDur` StyleKind key, `PhraseDuration` type, and engine class kept historical for state-machine stability (CONCERNS.md fragile latch/engine machine keys off `phraseDur`). The visible label is authoritative.
- **Rhythm Gate stays separate.** Did not fold RG4/RG5 under a "Beat" umbrella — that's an info-architecture redesign owned by the visual-design todo, out of scope for a label fix.
- **`max-height:480px` for the landscape relax.** Targets iPhone landscape specifically; tall tablets keep the original coarse-pointer lock.
- **`<select>` left non-selectable.** TopBar `<select>` elements aren't editable text and were intentionally excluded from selection rules in 02-03 (Pitfall 6); only `input`/`textarea` get `user-select:text`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. `just check` (0 errors/warnings) and `just test` (45 tests pass) green throughout. No new unit tests added — label + CSS are presentation, covered by DEC-tests-data-and-math-only.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three test-10 / test-19 gaps closed in code; awaiting manual UAT re-verify on real iPhone (double-tap selection + landscape reachability) at the verification gate.
- No blockers introduced.

---
*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-20*
