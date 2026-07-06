---
phase: 02-post-prototype-polish-uat-acceptance
plan: 03
subsystem: ui
tags: [svelte, css, ipad, touch, accessibility, apple-hig]

# Dependency graph
requires:
  - phase: 01-prototype
    provides: TopBar, PianoLayout, App.svelte root component, `.pad.black` styling, `.piano` user-select pattern
provides:
  - TopBar iPad touch contract (user-select:none, touch-action:manipulation, 44pt min, :active feedback)
  - Black-key visibility lift on dark frame (UI-SPEC Option B — fill #2e2e2e + 1px inset top highlight)
  - App-root body scroll lock under iPad-shaped media query (`@media (pointer: coarse) and (max-width: 1366px)`)
  - Fallback ladder traceability for black-key treatment (A → C → D) without re-invoking ui-phase
affects: [02-04 transport-sync (App.svelte script extension), 02-05 UAT walkthrough, post-v1 typography/spacing pass]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "iPad CSS contract: user-select:none + touch-action:manipulation + 44pt min + :active feedback (mirror in any new TopBar-like surface)"
    - "Body scroll lock at app root via :global() inside @media (pointer: coarse) and (max-width: 1366px)"
    - "Inline decision-ID comments (D-08, D-10) on every CSS block touched — preserves WHY-only convention"
    - "UI fallback ladder documented at decision site, not just in UI-SPEC — executor can pivot without re-running ui-phase"

key-files:
  created: []
  modified:
    - src/components/TopBar.svelte
    - src/components/PianoLayout.svelte
    - src/App.svelte

key-decisions:
  - "Shipped UI-SPEC Option B as-is (no fallback ladder walk needed at code level — final iPad visual sign-off deferred to UAT §18)"
  - "Excluded <select> from touch-action: manipulation per RESEARCH Pitfall 6 — keeps native iOS dropdown gesture working"
  - "Excluded <select> from 44pt min-height rule — global `button { min-height }` would distort native option rendering on iPad"
  - "Body scroll lock lives in App.svelte (not TopBar) because :global(html), :global(body) needs root-component scope"
  - "App.svelte <script> intentionally untouched — Plan 02-04 owns the transport-sync wiring there; only <style> block modified"

patterns-established:
  - "iPad CSS contract template: extend the existing component <style> with user-select, touch-action (exclude select), per-element 44pt min, :active brightness bump"
  - "Black-key Option B + fallback ladder comment: decision ID + option letter + pointer to UI-SPEC §Fallback ladder lives at the modified CSS block"
  - "iPad media query guard: `@media (pointer: coarse) and (max-width: 1366px)` — coarse pointer + iPad-sized viewport, excludes large touchscreen Windows laptops with mice (Pitfall 7)"

requirements-completed: [REQ-ipad-polish]

# Metrics
duration: 1min
completed: 2026-05-18
---

# Phase 2 Plan 3: iPad polish + black-key visibility Summary

**Three-file CSS-only ergonomics pass: TopBar iPad touch contract (D-08), `.pad.black` Option B fill + inset highlight (D-10), and root-scoped body scroll lock under iPad media query — zero JS touched, zero deps added.**

## Performance

- **Duration:** ~1 min (42 sec wall clock)
- **Started:** 2026-05-18T20:40:56Z
- **Completed:** 2026-05-18T20:41:38Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- TopBar honors the full UI-SPEC iPad ergonomics contract — long-press text selection killed, 300ms tap delay gone (on buttons + numeric/range inputs), 44pt min-target on every TopBar control, visible `:active` feedback as touch substitute for `:hover`
- Black pads readably lifted off the `#181818` frame via Option B (fill `#2e2e2e` + inset `0 1px 0 rgba(255,255,255,0.08)`); held-pad J-6 orange + `!important` regression-guarded and intact
- iOS rubber-band scroll suppressed at the app root via `:global(html), :global(body)` lock inside `@media (pointer: coarse) and (max-width: 1366px)` — desktop and touchscreen Windows laptops unaffected (Pitfall 7 guard)
- Fallback ladder reference (B → A → C → D) baked into the `.pad.black` comment so a future executor can pivot without re-invoking `/gsd:ui-phase`

## Task Commits

Each task was committed atomically:

1. **Task 1: TopBar iPad CSS contract** — `e67f9f9` (feat)
2. **Task 2: Black-key visibility fix (UI-SPEC Option B)** — `428ae0f` (feat)
3. **Task 3: iPad body scroll lock in App.svelte global style** — `1337157` (feat)

**Plan metadata:** _appended after this commit_ (docs)

## Files Created/Modified

- `src/components/TopBar.svelte` — Added `user-select: none` + `-webkit-user-select: none` to `.topbar`; appended `touch-action: manipulation` (excluding `<select>`); 44×44 min-target rule for `.arrow, .latch, .seg button, .transpose button`; matching `:active { filter: brightness(1.15) }`
- `src/components/PianoLayout.svelte` — `.pad.black` fill `#1f1f1f` → `#2e2e2e`, added `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08)`; held-pad orange untouched (UI-SPEC lock)
- `src/App.svelte` — Appended `@media (pointer: coarse) and (max-width: 1366px) { :global(html), :global(body) { overflow:hidden; position:fixed; width:100%; height:100%; overscroll-behavior:none } }` to existing `<style>` block; `<script>` block diff is empty

## Decisions Made

- **Shipped Option B straight (no ladder walk).** UI-SPEC's default treatment for D-10 is Option B. No render evidence yet that it reads poorly — and the plan explicitly defers final iPad visual sign-off to UAT §18. If hardware testing later shows the inset highlight reads as a stuck pixel on Retina, executor can step to A; if lifting fill loses identity, step to C (orange hairline) or D (frame to `#000`). All four documented inline at the `.pad.black` decision site.
- **`<select>` carve-out is a structural choice, not an oversight.** Both `touch-action: manipulation` and the 44pt min-height rule explicitly skip `<select>` per RESEARCH Pitfall 6 — global versions break native iOS dropdown gesture and option-list rendering.
- **Body scroll lock at App.svelte root, not TopBar.** `:global(html), :global(body)` selectors only work cleanly from the root component's `<style>` block. TopBar would have worked but reads as scope-leak; App.svelte is the canonical home.

## Deviations from Plan

None — plan executed exactly as written. Every grep assertion in each task's `<verify>` block matched on first run. `just check` (svelte-check 0 errors, 0 warnings, 206 files), `just test` (39/39 pass across 4 files), and `just ci` (check + test + vite build) all green on first attempt.

## Issues Encountered

None. The plan was tight — each task was a known-good CSS extension with explicit analog patterns (PianoLayout for `user-select`, UI-SPEC for Option B values, RESEARCH Pattern 6 for the scroll-lock media query). No surprises.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **REQ-ipad-polish** satisfied at the code level; final visual sign-off transfers to UAT walkthrough (Plan 02-05, REQ-uat-walkthrough). Walk both desktop Chrome and the iPad target (Web MIDI Browser app) — if Option B reads poorly, pivot down the ladder per `.planning/phases/02-post-prototype-polish-uat-acceptance/02-UI-SPEC.md` §"Fallback ladder (executor pivot path)".
- **App.svelte clean handoff to Plan 02-04.** The `<script>` block was intentionally not modified — Plan 02-04 (Wave 2, transport-sync wiring) can extend the existing `$effect` cluster + `onMount` block without merge conflict.
- **No new test coverage required.** All changes are CSS-only; per DEC-tests-data-and-math-only, visual + interaction verification happens in UAT, not Vitest.
- **Known debt acknowledged out of scope** (UI-SPEC §"Out of Scope"): typography refactor, palette overhaul, `0.75rem` off-grid spacing token, non-iPad touch support, in-app help overlay, MANUAL.md visual style. Do NOT pick these up opportunistically.

## Self-Check: PASSED

- src/components/TopBar.svelte — FOUND (modified, grep assertions all matched)
- src/components/PianoLayout.svelte — FOUND (modified, grep assertions all matched; held-pad regression guard passed)
- src/App.svelte — FOUND (modified, `<style>` only, script diff empty)
- Commit `e67f9f9` — FOUND (Task 1)
- Commit `428ae0f` — FOUND (Task 2)
- Commit `1337157` — FOUND (Task 3)
- `just ci` exit 0: svelte-check 0/0/0, vitest 39/39 pass, vite build 208.94 kB / gzip 49.16 kB

---
*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-18*
