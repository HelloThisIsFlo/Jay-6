---
phase: 04-read-only-suggestion-rail
verified: 2026-09-27T19:25:00Z
status: human_needed
score: 13/15 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/ROADMAP.md", ".planning/phases/04-read-only-suggestion-rail/04-01-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-01-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-02-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-02-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-03-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-03-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-04-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-04-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-05-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-05-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-REVIEW-DISPOSITION.md", ".planning/phases/04-read-only-suggestion-rail/04-REVIEW.md", "src/App.svelte", "src/components/PianoLayout.svelte", "src/components/SuggestionChip.svelte", "src/components/SuggestionChips.svelte", "src/components/SuggestionPanel.svelte", "src/components/SuggestionRail.svelte", "src/components/TopBar.svelte", "src/rail.ts", "src/suggestions.ts", "test/rail.test.ts", "test/suggestions.test.ts", "vite.config.ts"]
covered_digest: "v2:sha256:655adecd29df5e47ba88f4b683d591a1da3e16219d71d1178b2bbe1b3de31c0a"
behavior_unverified: 1
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 11/14
  gaps_closed:
    - "A chip held through host.panic() resets its visual 'held' state instead of staying lit after the sound has already stopped (CR-01)"
    - "The iPhone suggestion panel's open/closed state never reopens on its own after a bank-driven detour through an empty bank (WR-01)"
  gaps_remaining: []
  regressions: []
behavior_unverified_items:
  - truth: "Bumping panicToken never makes App's clock-mode $effect depend on it: flipping Int/Ext repeatedly keeps the app responsive with no update-depth loop"
    test: "In a real browser, with nothing held, flip Int/Ext five times in a row, then play a few pads"
    expected: "The app stays responsive, pads play normally, and the console shows no effect_update_depth_exceeded error"
    why_human: "The untrack(() => panicToken) + 1 pattern is the architecturally correct idiom to avoid a self-referential effect loop, but Svelte's reactive scheduling is runtime behavior this project's Vitest suite cannot exercise (Svelte components are out of test scope per src/rail.ts's own header comment); only a live browser proves no loop actually occurs."
human_verification:
  - test: "Hold a suggestion chip on the desktop/iPad rail, then (1) unplug the selected MIDI output, (2) flip Int/Ext in Setup, or (3) let the OP-1 send Stop in Ext mode; after each, lift and press the same chip again."
    expected: "The chip drops from full orange to idle the moment the sound stops, while still pressed, with no other chip showing echo; lifting sends no MIDI; the next press plays and releases normally."
    why_human: "Panic paths need real MIDI hardware or a device disconnect, and the chip's visual state needs a DOM; Vitest runs in Node without either."
  - test: "Repeat the same three panic triggers while holding a chip inside the iPhone-landscape panel (real iPhone or ~852x393 emulation)."
    expected: "Same result as the rail case: the panel chip turns idle the instant the sound stops, without forwarding a release."
    why_human: "iPhone-landscape layout and panic behavior need a real browser viewport and MIDI; Vitest runs in Node without DOM or Web MIDI."
  - test: "On Bank 1, open the panel, step to Bank 2 (no suggestions) without touching the strip, then step to a bank with suggestions again."
    expected: "The panel stays closed on the populated bank until the strip is tapped again; it must not reopen on its own."
    why_human: "The open $state reset is a Svelte $effect; confirming it actually fires across a real navigation sequence needs a DOM."
  - test: "With nothing held, flip Int/Ext five times in a row in the Setup popover, then play a few pads."
    expected: "The app stays responsive, pads play normally, and the browser console shows no effect_update_depth_exceeded error."
    why_human: "See behavior_unverified_items above — untrack prevents the effect from tracking panicToken, but only live execution proves no update-depth loop."
  - test: "Browser verification across desktop/iPad/iPhone-landscape layouts and long-label stress, per 04-03/04-04's own deferred human-checks (RAIL-07)."
    expected: "Steel eyebrow, quiet label/kind text, honest empty state, balanced chip rows, no truncation/scroll, panel anchored over the top bar and never covering a pad."
    why_human: "Visual layout, subordination, and fit across real viewports cannot be asserted without a DOM; Vitest runs in Node."
  - test: "OP-1/MIDI-monitor verification of chip=pad MIDI parity and hold interleavings, per 04-01/04-04's own deferred human-checks (RAIL-08)."
    expected: "Chip MIDI is identical to the pad's; exactly one note-on/off set per hold episode regardless of source/order; no pad or chip stays lit; latch behaves identically through a chip."
    why_human: "Web MIDI output and OP-1 sound are browser/hardware-only; Vitest runs in Node without MIDI or a real device."
---

# Phase 4: Read-Only Suggestion Rail Verification Report

**Phase Goal:** Users can browse bank-aware chord suggestions beneath the pads and play them as shortcuts to their pads, without affecting playback state.
**Verified:** 2026-09-27T19:25:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure plan 04-05

## Goal Achievement

This is a re-verification pass following `04-05-PLAN.md`/`04-05-SUMMARY.md`, which set out to close the two gaps (`CR-01` blocker, `WR-01` warning) recorded in the prior `04-VERIFICATION.md`. Both gaps received full 3-level re-checks below (exists, substantive, wired) plus behavioral test evidence where the underlying truth is a state-transition/cancellation invariant. All twelve previously-passing truths received a regression check against the diff (`04-05` touched `src/App.svelte`, `SuggestionRail.svelte`, `SuggestionChips.svelte`, `SuggestionChip.svelte`, `TopBar.svelte`, `SuggestionPanel.svelte`, `src/rail.ts`, `test/rail.test.ts`) — no regressions found.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Selecting a bank renders its curated suggestions in catalogue order beneath the pads (desktop/iPad), or an honest empty-bank line (RAIL-01) | ✓ VERIFIED | Regression check: `SuggestionRail.svelte`/`SuggestionPanel.svelte` unchanged aside from `panicToken` prop threading; empty-copy string still present in both |
| 2 | Every chip shows its pad key plus the canonical `displayLabel`, with `labelFor` fallback; repeated keys render as separate un-merged instances (RAIL-02) | ✓ VERIFIED | Regression check: `SuggestionChip.svelte` still renders `step.key` + `splitChordLabel(step.displayLabel)` unchanged (lines 96-100); `test/rail.test.ts` label coverage untouched and still passing |
| 3 | Pressing a chip calls the exact same `press(key, notes)` / `release(key)` path as its pad; a per-key hold-count gate lets pad+keyboard+chip hold one key concurrently without hanging or double-releasing (RAIL-03, RAIL-08; D-03/D-04) | ✓ VERIFIED | `App.svelte` `press`/`release` unchanged; chip's `onpointerdown`/`endPress` call `onPress`/`onRelease` identically to before, now routed through `settle()`; `test/rail.test.ts` composed D-04 interleaving (pad/chip/panic) passes |
| 4 | Every other chip whose key is held elsewhere shows soft echo while only the physically-pressed chip shows full orange; the rail is strictly read-only (RAIL-04) | ✓ VERIFIED | `chipVisualState` precedence unchanged in `src/rail.ts`; `grep -rniE "contenteditable\|<(input\|textarea\|select\|form)[ >]"` across all four `Suggestion*.svelte` returns 0 matches (re-confirmed) |
| 5 | A chip that unmounts while held releases its key immediately and exactly once (D-07) | ✓ VERIFIED | `onMount(() => () => settle({ kind: 'unmount' }))`; `endChipHold` unmount case tested (`test/rail.test.ts`: "releases the held key on unmount (D-07)") |
| 6 | Every panic path empties App's own `holdCounts`/`latchedKey` together, so a release arriving after a panic reaches neither the host nor the latch highlight | ✓ VERIFIED | `clearAllHighlights()` unchanged (`holdCounts = NO_HOLDS; latchedKey = null`), now also bumps `panicToken` |
| 7 | **A held suggestion chip's own visual "held" state resets when a panic silences the audio it was showing (CR-01, gap 1 in prior pass)** | ✓ **VERIFIED (fixed)** | `App.svelte` owns `panicToken = $state(0)`, bumped via `untrack(() => panicToken) + 1` inside `clearAllHighlights()`; threaded as a **required** prop through `SuggestionRail`→`SuggestionChips`→`SuggestionChip` and `TopBar`→`SuggestionPanel`→`SuggestionChips`→`SuggestionChip`; `SuggestionChip`'s panic `$effect` calls `settle({kind:'panic'})`, which folds through `endChipHold`'s `'panic'` case (`hold: null, release: null`) — never forwards a release. Behavioral test: `test/rail.test.ts` `endChipHold` describe block (11 tests, incl. the composed D-04 interleaving) — all pass. `just ci`: svelte-check 221 files/0 errors, 177/177 vitest, build succeeds. |
| 8 | Browsing suggestions emits no MIDI and changes no latch/engine/transport/clock state; releasing an actually-held chip is the only sanctioned side effect (RAIL-03; D-08) | ✓ VERIFIED | `grep -rnE "engines/host\|from '../midi'\|tickSource\|setBank\|setStyle\|setVariation\|toggleLatch\|bumpTranspose\|setBpm\|setClockSource\|setGatePercent"` across all four `Suggestion*.svelte` returns 0 matches (re-confirmed after the diff) |
| 9 | The catalogue rejects more than 6 suggestions per bank, failing loudly in tests and at Vite config load (RAIL-05 mechanism; D-16/D-17) | ✓ VERIFIED | Untouched by 04-05; `test/suggestions.test.ts` 60/60 pass; `vite.config.ts` unchanged |
| 10 | Long, altered, parenthesised, slash, repeated, and unnamed chord labels are never truncated or horizontally scrolled (RAIL-06) | ✓ VERIFIED | `splitChordLabel`/`chipsPerRow`/`fitChipsPerRow` in `src/rail.ts` unchanged; `grep -cE "text-overflow\|ellipsis\|overflow-x"` across all four `Suggestion*.svelte` returns 0 |
| 11 | The desktop/iPad rail reads as subordinate to the pads and is hidden in favour of the iPhone TopBar strip at `max-height: 480px` (RAIL-05) | ✓ VERIFIED (code); visual judgment pending human UAT | `SuggestionRail.svelte` `.rail-head`/`.count`/`@media (max-height: 480px)` unchanged aside from `panicToken` pass-through |
| 12 | The iPhone strip opens a nonmodal panel, pages one suggestion at a time with page memory, and closes only via ×, the header collapse control, or Escape (RAIL-01, RAIL-05; D-10 through D-13) | ✓ VERIFIED (code); visual judgment pending human UAT | `TopBar.svelte`/`SuggestionPanel.svelte` close paths, `rememberedPage`/`stepPage` untouched by 04-05 except the new empty-bank `open` reset and the 1-of-1 `disabled` pager fix, both scoped and verified below |
| 13 | **The suggestion panel's open state does not silently reopen after an empty-bank detour (WR-01, gap 2 in prior pass)** | ✓ **VERIFIED (fixed)** | `SuggestionPanel.svelte` now has `$effect(() => { if (suggestions.length === 0) open = false; })` directly below the `open` declaration; scoped to the empty-bank branch only, leaving D-12 close paths and D-13 page-memory identity untouched (confirmed by reading the diff — no other line in `toggle`/`close`/`step`/`closeOnEscape` changed) |
| 14 | Browser verification (desktop/iPad/iPhone-landscape, long-label stress) and OP-1/MIDI-monitor verification (chip MIDI = pad MIDI, hold interleavings, silent browsing) (RAIL-07, RAIL-08) | ? UNCERTAIN — needs human | Still deferred to end-of-phase UAT per `human_verify_mode: end-of-phase`; not yet performed. See Human Verification Required. |
| 15 | **(New, from 04-05-PLAN must_haves) Bumping `panicToken` never makes App's clock-mode `$effect` depend on it: flipping Int/Ext repeatedly keeps the app responsive with no update-depth loop** | ⚠️ **PRESENT_BEHAVIOR_UNVERIFIED** | `panicToken = untrack(() => panicToken) + 1` is the correct Svelte idiom to avoid a self-referential effect dependency, and `svelte-check`/`vite build` are clean, but no test exercises repeated Int/Ext flips at runtime — Svelte component behavior is out of this project's Vitest scope (`src/rail.ts` header comment). Routed to human verification. |

**Score:** 13/15 truths verified (0 failed, 1 present-but-behavior-unverified, 1 needs human — deferred hardware/browser UAT)

### Deferred Items

None — RAIL-07/RAIL-08 are within-phase deferred human-checks (`human_verify_mode: end-of-phase`), not deferred to a later roadmap phase, so they are tracked as Human Verification Required, not as a `deferred` (later-phase) item.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/rail.ts` | Hold-count reducer, pad-notes lookup, chip visual precedence, row/label/pager helpers, **chip settle reducer** | ✓ VERIFIED | All prior exports unchanged; new exports `ChipHold`, `ChipHoldEnd`, `ChipHoldStep`, `endChipHold` present and correctly typed; still a pure module (no runes) |
| `test/rail.test.ts` | Full coverage of the above | ✓ VERIFIED | 64 tests (53 prior + 11 new `endChipHold` tests), all passing |
| `src/App.svelte` | `panicToken` state + untracked bump + pass-through to both suggestion surfaces | ✓ VERIFIED | `let panicToken = $state(0);` (line 83); `panicToken = untrack(() => panicToken) + 1;` inside `clearAllHighlights()` (line 98); passed to `TopBar` (line 241) and `SuggestionRail` (line 243) |
| `src/components/SuggestionChip.svelte` | Playable pad-alias chip with panic-safe hold reset | ✓ VERIFIED (defect closed) | `hold = $state.raw<ChipHold \| null>(null)`; single `settle()` release call site; panic `$effect` uses `untrack(() => settle({kind:'panic'}))`; press/release/echo/unmount-release all still correct |
| `src/components/SuggestionChips.svelte` | Shared balanced/fitted chip grid; required `panicToken` fan-out | ✓ VERIFIED | `panicToken: number` is a required prop (no `?`/default) after Task 2; passed to every `SuggestionChip` mount |
| `src/components/SuggestionRail.svelte` | Desktop/iPad columns + empty state + iPhone hide + panicToken pass-through | ✓ VERIFIED | Unchanged core layout; `panicToken` threaded to `SuggestionChips` |
| `src/components/SuggestionPanel.svelte` | iPhone strip + panel + pager + open-state reset on empty bank + disabled 1-of-1 pager | ✓ VERIFIED (defects closed) | `$effect` resets `open` on empty bank; `disabled={suggestions.length <= 1}` on both pager buttons (count = 2); `panicToken` pass-through to `SuggestionChips` |
| `src/components/TopBar.svelte` | `sugg` grid area, height-gated layout, panel mount + panicToken pass-through | ✓ VERIFIED | `<SuggestionPanel {onPress} {onRelease} {heldKeys} {panicToken} />` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `App.svelte` (panic) | `SuggestionChip.svelte` (visual reset) | `panicToken` fanned out as a required prop through both surfaces; chip's `$effect` settles on panic | ✓ **WIRED (was NOT WIRED — CR-01 closed)** | Confirmed end to end: `App` → `SuggestionRail`/`TopBar` → `SuggestionChips`/`SuggestionPanel` → `SuggestionChips` → `SuggestionChip`; `svelte-check` (221 files/0 errors) enforces every mount supplies it since the prop is required, not optional |
| `SuggestionPanel.svelte` (empty bank) | `SuggestionPanel.svelte` (`open` state) | `$effect` reset on `suggestions.length === 0` | ✓ **WIRED (was NOT WIRED — WR-01 closed)** | `if (suggestions.length === 0) open = false;` directly below the `open` declaration |
| `App.svelte` | `src/rail.ts` | `pressHold`/`releaseHold` gate press/release before calling host | ✓ WIRED | Unchanged |
| `SuggestionChip.svelte` | `src/rail.ts` | `endChipHold` settles every end path (pointer-end, unmount, panic) | ✓ WIRED | `settle()` is the sole call site; `grep -c "onRelease("` in `SuggestionChip.svelte` = 1 (only inside `settle`) |
| `SuggestionChip.svelte` | `App.svelte` | Unmount teardown calls `onRelease` via `settle({kind:'unmount'})` | ✓ WIRED | Unchanged behavior, refactored call path |

### Data-Flow Trace (Level 4)

Not applicable in the usual "renders from a data source" sense — the relevant flow for this re-verification is the panic signal, traced above as a key link (App's `panicToken` counter → every mounted chip's local hold state). No hardcoded/static fallback found anywhere in the chain; the counter is read live via a required prop at every hop.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| RAIL-01 | 04-01, 04-03, 04-04, 04-05 | Bank shows curated suggestions or honest empty state | ✓ SATISFIED | Truth 1, 13 |
| RAIL-02 | 04-01, 04-03 | Chip shows pad key + canonical chord name, with fallback | ✓ SATISFIED | Truth 2 |
| RAIL-03 | 04-01, 04-04, 04-05 | Silent browsing; chip press = pad alias via same press/release path | ✓ SATISFIED — defect closed | Truth 3, 7, 8 (CR-01 caveat removed) |
| RAIL-04 | 04-01, 04-04, 04-05 | Read-only; no scoring/tracking; soft echo of held keys | ✓ SATISFIED — defect closed | Truth 4, 7 (CR-01 caveat removed) |
| RAIL-05 | 04-03, 04-04, 04-05 | Rail subordinate on desktop; contained mobile treatment | ✓ SATISFIED (code); visual confirmation pending | Truth 11, 12; human-check deferred |
| RAIL-06 | 04-03 | Usable with long/altered/slash/repeated/unnamed labels | ✓ SATISFIED | Truth 10 |
| RAIL-07 | 04-03, 04-04 | Browser verification across desktop/iPad/iPhone-landscape | ? NEEDS HUMAN | Truth 14; deferred to end-of-phase UAT |
| RAIL-08 | 04-01, 04-04 | OP-1/MIDI-monitor verification of silent browsing + chip=pad MIDI | ? NEEDS HUMAN | Truth 14; deferred to end-of-phase UAT |

No orphaned requirements: REQUIREMENTS.md maps exactly RAIL-01 through RAIL-08 to Phase 4, and all eight are claimed across the five plans' `requirements:` frontmatter (04-05 re-claims RAIL-01, RAIL-03, RAIL-04, RAIL-05 as the gap-closure plan).

**Documentation drift note (non-blocking):** `.planning/REQUIREMENTS.md`'s checklist and traceability table mark RAIL-02 and RAIL-06 as unchecked/"Gaps Found" while RAIL-03/RAIL-04/RAIL-05 are checked/"Complete" — the inverse of what the evidence in this and the prior verification actually shows (RAIL-02/RAIL-06 were always clean; RAIL-03/RAIL-04 carried the now-closed CR-01 defect). This looks like stale/mismatched bookkeeping in REQUIREMENTS.md rather than a code gap — worth a manual reconciliation pass, but it does not affect this phase's actual goal achievement.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/components/SuggestionChip.svelte` | 35-39 | `settle()`'s local `const step = endChipHold(hold, end)` shadows the enclosing `step: ResolvedSuggestionStep` prop | ⚠️ Warning | Harmless today (`settle` never reads the chord-step prop), but a future edit to `settle` that needs `step.key`/`step.displayLabel` would silently read the wrong object with no compiler error. Identified in `04-REVIEW.md` as **WR-02**; disposition in `04-REVIEW-DISPOSITION.md` is still `open` (recorded, not yet fixed or explicitly deferred). |
| `src/components/SuggestionChip.svelte` | 66-67 | Panic while a chip is held skips `e.preventDefault()`/explicit `releasePointerCapture` on the eventual `pointerup`, because `settle({kind:'panic'})` already nulled `hold` | ℹ️ Info | Not observably harmful — the UA implicitly releases pointer capture regardless, and the chip has no `onclick` handler for a stray synthetic click to affect. Identified in `04-REVIEW.md` as **IN-04**; disposition still `open`. |

Neither finding is a debt marker (no `TBD`/`FIXME`/`XXX`) and neither prevents the phase goal, so neither triggers `gaps_found` on its own — both remain open per `04-REVIEW-DISPOSITION.md` for a future triage pass. No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any file touched by this phase (re-confirmed by grep across every `covered_files` source/test file).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| `endChipHold` settles pointer-end/unmount/panic correctly, including the composed D-04 interleaving | `npm test -- test/rail.test.ts` | 64/64 pass | ✓ PASS |
| Hold-count reducer + chip settle rules + suggestions-cap diagnostics, project-wide | `npm test` (full suite) | 177/177 pass across 9 files | ✓ PASS |
| Strict types across App/TopBar/Suggestion* wiring, including the new required `panicToken` prop | `npm run check` (svelte-check) | 221 files, 0 errors, 0 warnings | ✓ PASS |
| Production build succeeds | `npm run build` | Build succeeded (244.51 kB JS, 27.05 kB CSS) | ✓ PASS |
| `src/engines/host.ts`, `PianoLayout.svelte`, `src/suggestions.ts`, `src/suggestions.data.json` untouched by the gap-closure plan | `git diff --quiet eff233c -- src/engines/host.ts src/components/PianoLayout.svelte src/suggestions.ts src/suggestions.data.json` | exit 0 | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` convention or explicit probe declarations in this phase's PLAN/SUMMARY files; this project verifies through Vitest + `svelte-check` + `vite build`, all exercised above.

### Human Verification Required

See `human_verification` in frontmatter for the full list (6 items). Summary:

1. **CR-01 hardware re-confirmation (rail):** hold a chip through an output unplug, an Int/Ext flip, and an OP-1 Ext Stop — confirm it turns idle the instant the sound stops, with no MIDI on lift.
2. **CR-01 hardware re-confirmation (iPhone panel):** same three triggers, but on a panel chip in iPhone-landscape.
3. **WR-01 real-navigation re-confirmation:** detour through an empty bank with the panel open, confirm it does not reopen unasked.
4. **Effect-loop check (new, truth 15):** flip Int/Ext five times with nothing held; confirm no `effect_update_depth_exceeded` and the app stays responsive.
5. **RAIL-07 browser verification:** desktop/iPad/iPhone-landscape layouts and long-label stress (deferred from 04-03/04-04's own `<human-check>` blocks).
6. **RAIL-08 OP-1/MIDI-monitor verification:** chip=pad MIDI parity and hold interleavings (deferred from 04-01/04-04's own `<human-check>` blocks).

Items 1-4 are new/updated re-verification checks specific to the 04-05 gap-closure diff; items 5-6 carry over unchanged from the prior verification pass (RAIL-07/RAIL-08, `human_verify_mode: end-of-phase`).

### Gaps Summary

Both gaps from the prior verification pass are closed with concrete, tested evidence:

1. **CR-01 (was Blocker) — closed.** `SuggestionChip.svelte`'s per-instance hold state now settles through a unit-tested pure reducer (`endChipHold` in `src/rail.ts`) that clears the local "held" look on any panic without ever forwarding a release. The signal (`panicToken`) is a required prop enforced by `svelte-check` at every chip mount on both surfaces (desktop/iPad rail and iPhone panel), and the App-side bump uses `untrack` to avoid a self-referential effect loop.
2. **WR-01 (was Warning) — closed.** `SuggestionPanel.svelte`'s `open` state now resets to `false` whenever the current bank has zero suggestions, via a small `$effect` scoped to exactly that condition, leaving every other close/reopen/page-memory behavior untouched.

No regressions were found in the twelve previously-passing truths after tracing the 04-05 diff through `App.svelte`, `SuggestionRail.svelte`, `SuggestionChips.svelte`, `SuggestionChip.svelte`, `TopBar.svelte`, `SuggestionPanel.svelte`, and `src/rail.ts`. `just ci` is green (svelte-check 221 files/0 errors/0 warnings, 177/177 tests, build succeeds).

What remains before this phase can reach a clean `passed`:

- **RAIL-07 and RAIL-08** (browser and OP-1/MIDI-monitor verification) — still deferred to end-of-phase UAT by design (`human_verify_mode: end-of-phase`), unchanged from the prior pass.
- **Two new human-check items** introduced by the gap-closure plan itself: re-confirming CR-01/WR-01 on real hardware/viewports (the plan's own Task 1/Task 2/Task 3 `<human-check>` blocks), and confirming the `panicToken` `untrack` pattern doesn't loop under repeated Int/Ext flips (a genuine runtime/scheduling invariant this project's Vitest scope cannot exercise).
- **Two open, non-blocking review findings** (WR-02 variable shadowing, IN-04 skipped `preventDefault` on a post-panic lift) — both explicitly rated harmless by `04-REVIEW.md`, both still `open` in `04-REVIEW-DISPOSITION.md`, neither preventing the phase goal.
- **Documentation drift** in `.planning/REQUIREMENTS.md`'s RAIL-02/RAIL-06 vs. RAIL-03/RAIL-04/RAIL-05 checkbox status, which appears to be stale bookkeeping rather than an actual code gap.

Recommend proceeding to the consolidated end-of-phase `/gsd-verify-work` UAT pass, which should harvest all six human-verification items above together (04-01 through 04-05).

---

_Verified: 2026-09-27T19:25:00Z_
_Verifier: Claude (gsd-verifier)_
