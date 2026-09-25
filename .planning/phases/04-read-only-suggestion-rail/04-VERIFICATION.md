---
phase: 04-read-only-suggestion-rail
verified: 2026-09-25T20:43:13Z
status: gaps_found
score: 11/14 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/ROADMAP.md", ".planning/phases/04-read-only-suggestion-rail/04-01-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-01-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-02-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-02-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-03-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-03-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-04-PLAN.md", ".planning/phases/04-read-only-suggestion-rail/04-04-SUMMARY.md", ".planning/phases/04-read-only-suggestion-rail/04-REVIEW.md", "src/App.svelte", "src/components/PianoLayout.svelte", "src/components/SuggestionChip.svelte", "src/components/SuggestionChips.svelte", "src/components/SuggestionPanel.svelte", "src/components/SuggestionRail.svelte", "src/components/TopBar.svelte", "src/rail.ts", "src/suggestions.ts", "test/rail.test.ts", "test/suggestions.test.ts", "vite.config.ts"]
covered_digest: "v1:sha256:db3315b79dbd99ca9e3988335d9ed5182207fb7646f7d1da8588300cd70e8dba"
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "A chip held through host.panic() (clock-source flip, external transport stop, or MIDI output/input disconnect) resets its visual 'held' state instead of staying lit after the sound has already stopped"
    status: failed
    reason: "SuggestionChip.svelte's heldHere/pointerId/pressedKey are per-chip-instance state (by design, so two chips sharing a key don't both light up), cleared only by the chip's own pointer end-events or its onMount unmount teardown. App.svelte's panic hook (clearAllHighlights, wired via host.setOnPanic) only resets the shared holdCounts/latchedKey that PianoLayout reads — nothing notifies a mounted SuggestionChip of a panic. Confirmed by reading the code: grep -rn \"panic\" src/components/Suggestion*.svelte src/rail.ts returns no matches. This directly violates the 04-01-PLAN.md must_haves prohibition (verification: test) that a chip must never stay stuck-lit \"when a release arrives after a panic\" — the same stuck-lit/audio-desync bug class the project fixed at length for PianoLayout (UAT 16, 20), reintroduced by the new per-chip local state PianoLayout deliberately doesn't have. First identified in 04-REVIEW.md as CR-01 (critical)."
    artifacts:
      - path: src/components/SuggestionChip.svelte
        issue: "No effect or prop reacts to a panic; heldHere/pointerId/pressedKey clear only via pointerup/pointercancel/lostpointercapture or onMount teardown (lines 20-49)"
      - path: src/App.svelte
        issue: "clearAllHighlights() (lines 88-92) resets only holdCounts/latchedKey; it has no way to reach mounted SuggestionChip instances"
    missing:
      - "A panic-notification path from App.svelte's clearAllHighlights() down through SuggestionRail/SuggestionPanel/SuggestionChips to SuggestionChip (e.g. a reactive panicToken counter threaded as a prop) that locally resets heldHere/pointerId/pressedKey without calling onRelease (holdCounts/host are already clear)"
  - truth: "The iPhone suggestion panel's open/closed state never reopens on its own after a bank-driven detour through an empty bank"
    status: failed
    reason: "SuggestionPanel.svelte's `open` $state is never reset when the current bank's suggestions list is empty. Sequence: open the panel on a bank with suggestions -> step to a bank with none (renders the empty-line branch, unmounting strip+panel, user never touches the toggle) -> step to another bank that has suggestions. `{#if open && current}` re-evaluates true immediately and the panel pops back open unasked, because `open` survived the whole detour in the same component instance. Confirmed by reading the code (SuggestionPanel.svelte lines 20, 51-53, 60: `open` is set once at declaration and only ever toggled by the strip/collapse/Escape handlers, never reset on the `suggestions.length === 0` branch). First identified in 04-REVIEW.md as WR-01 (warning)."
    artifacts:
      - path: src/components/SuggestionPanel.svelte
        issue: "`open` persists across the `{#if suggestions.length === 0}` branch with no reset effect or derivation tied to the suggestions list"
    missing:
      - "Reset `open` to false whenever `suggestions.length === 0` (e.g. an $effect keyed on the derived suggestions list, as suggested in 04-REVIEW.md WR-01)"
---

# Phase 4: Read-Only Suggestion Rail Verification Report

**Phase Goal:** Users can browse bank-aware chord suggestions and play chips as pad shortcuts without affecting playback state or the core MIDI loop.
**Verified:** 2026-09-25T20:43:13Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Selecting a bank renders its curated suggestions in catalogue order beneath the pads (desktop/iPad), or an honest empty-bank line, with no count/button/icon/orange in the empty case (RAIL-01) | ✓ VERIFIED | `SuggestionRail.svelte`/`SuggestionPanel.svelte` render `getSuggestionsForBank(ui.bankIndex)`; empty-copy string `"No curated suggestions for this bank yet"` confirmed present in both files and in the production bundle (04-03/04-04 plan bundle checks; re-confirmed via `grep`) |
| 2 | Every chip shows its pad key plus the canonical `displayLabel`, with the `labelFor` fallback for unnamed stack-bank pads; repeated keys render as separate un-merged instances in authored/catalogue order (RAIL-02) | ✓ VERIFIED | `SuggestionChip.svelte` renders `step.key` + `splitChordLabel(step.displayLabel)`; `test/rail.test.ts` proves `main + bass === labelFor(bank, chord)` for all 1200 canonical labels across all 100 banks (`npm test -- test/rail.test.ts`: 53/53 pass) |
| 3 | Pressing a chip calls the exact same `press(key, notes)` / `release(key)` path as its pad, with an identical notes-array reference; a per-key hold-count gate lets pad+keyboard+chip hold one key concurrently without hanging or double-releasing (RAIL-03, RAIL-08; D-03/D-04) | ✓ VERIFIED | `src/rail.ts` `pressHold`/`releaseHold`/`padNotesFor`; `App.svelte` `press`/`release` fold every source through them before calling `host.padPressed`/`host.padReleased`; `test/rail.test.ts` covers every interleaving (pad/chip/keyboard, either release order, stray release, panic reset) — 53/53 pass |
| 4 | Every other chip whose key is held elsewhere shows soft echo while only the physically-pressed chip shows full orange; the rail is strictly read-only (no editing/authoring/scoring controls) (RAIL-04) | ✓ VERIFIED | `chipVisualState` precedence (held > echo > idle) in `src/rail.ts`, unit-tested; `grep -rniE "contenteditable|<(input|textarea|select|form)[ >]"` across all four Suggestion* components returns 0 matches |
| 5 | A chip that unmounts while held (bank change, panel close, paging) releases its key immediately and exactly once (D-07) | ✓ VERIFIED | `onMount(() => () => releaseHeld())` in `SuggestionChip.svelte`; chips keyed by `suggestion.id + ':' + index` in `SuggestionChips.svelte`, so a new suggestion/page/bank destroys and re-mounts held chips |
| 6 | Every panic path (mode switch, transport stop while Ext, MIDI device disconnect) empties App's own `holdCounts`/`latchedKey` together, so a release arriving after a panic reaches neither the host nor the latch highlight | ✓ VERIFIED | `App.svelte` `clearAllHighlights()` sets `holdCounts = NO_HOLDS; latchedKey = null`, wired via `host.setOnPanic(clearAllHighlights)`; `releaseHold` on an empty map returns `forward: false` (unit-tested) |
| 7 | **A held suggestion chip's own visual "held" state resets when a panic silences the audio it was showing** | ✗ **FAILED** | See `gaps[0]` above (CR-01). `SuggestionChip.svelte` has no panic-aware reset; a chip held through a clock-source flip, external Stop, or output/input disconnect stays full orange after the sound has stopped, until the finger lifts. Confirmed by code inspection, not just the review narrative — no `panic`/token wiring exists anywhere in the Suggestion* component tree. |
| 8 | Browsing suggestions (open, page, close, bank-driven re-render) emits no MIDI and changes no latch/engine/transport/clock state; releasing an actually-held chip is the only sanctioned side effect (RAIL-03; D-08) | ✓ VERIFIED | `grep -rnE "engines/host|from '../midi'|tickSource|setBank|setStyle|setVariation|toggleLatch|bumpTranspose|setBpm|setClockSource|setGatePercent"` across all four Suggestion* components returns 0 matches; `SuggestionPanel`'s `open`/`step`/`close` mutate only local `$state`/`$state.raw` |
| 9 | The catalogue rejects more than 6 suggestions in one bank, failing loudly in tests and at Vite config load (build/dev/vitest), not just at runtime (RAIL-05 mechanism; D-16/D-17) | ✓ VERIFIED | `src/suggestions.ts` exports `MAX_SUGGESTIONS_PER_BANK = 6` and emits `'too-many-suggestions'`; `vite.config.ts` has a side-effect `import './src/suggestions'`; `npm test -- test/suggestions.test.ts`: 60/60 pass; `npm run build` succeeds against the real (in-cap) catalogue |
| 10 | Long, altered, parenthesised, slash, repeated, and unnamed chord labels are never truncated or horizontally scrolled; chip rows balance and step their per-row cap down under measured overflow (RAIL-06) | ✓ VERIFIED | `chipsPerRow`/`fitChipsPerRow`/`splitChordLabel` in `src/rail.ts`, exhaustively unit-tested (all-banks invariant, boundary/step-down cases); `grep -cE "text-overflow\|ellipsis\|overflow-x"` across all four Suggestion* components returns 0 for every file |
| 11 | The desktop/iPad rail reads as subordinate to the pads (steel eyebrow, orange only on sounding chips) and is hidden in favour of the iPhone TopBar strip at `max-height: 480px` (RAIL-05) | ✓ VERIFIED (code); visual judgment pending human UAT | `SuggestionRail.svelte` `.rail-head`/`.count`/`@media (max-height: 480px) { .rail { display: none } }`; no `<button>` or `var(--accent)` in rail chrome outside chip states (`grep` confirms 0). Actual on-device subordination/fit is a human-check item (see below). |
| 12 | The iPhone strip opens a nonmodal panel anchored over the top bar (never covering a pad), pages one suggestion at a time with page memory keyed to bank identity, and closes only via ×, the header collapse control, or Escape (RAIL-01, RAIL-05; D-10 through D-13) | ✓ VERIFIED (code); visual judgment pending human UAT | `TopBar.svelte` `sugg` grid area + `@media (max-height: 480px)`; `SuggestionPanel.svelte` `rememberedPage`/`stepPage`/`panelMaxPerRow`, all unit-tested (`test/rail.test.ts`); `Escape` handled via component-local `svelte:window`; no backdrop/click-outside dismissal (`grep -c "backdrop"` = 0) |
| 13 | **The suggestion panel's open state does not silently reopen after an empty-bank detour** | ✗ **FAILED** | See `gaps[1]` above (WR-01). Confirmed by code inspection: `open` is declared once and never reset when `suggestions.length === 0`. |
| 14 | Browser verification (desktop/iPad/iPhone-landscape layouts, long-label stress) and OP-1/MIDI-monitor verification (chip MIDI = pad MIDI, hold interleavings, silent browsing) (RAIL-07, RAIL-08) | ? UNCERTAIN — needs human | `human_verify_mode: end-of-phase` deferred these checks from each plan's own `<human-check>` blocks (04-01 Task 2, 04-03 Task 2, 04-04 Task 2) to end-of-phase UAT; they have not yet been run. See Human Verification Required below. |

**Score:** 11/14 truths verified (2 failed, 1 needs human — deferred hardware/browser UAT)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/rail.ts` | Hold-count reducer, pad-notes lookup, chip visual precedence, row/label/pager helpers | ✓ VERIFIED | All exports present (`pressHold`, `releaseHold`, `heldKeySet`, `padNotesFor`, `chipVisualState`, `chipsPerRow`, `fitChipsPerRow`, `splitChordLabel`, `isNaturalKey`, `rememberedPage`, `stepPage`, `panelMaxPerRow`); no Svelte runes; pure module |
| `test/rail.test.ts` | Full coverage of the above | ✓ VERIFIED | 53 tests, all passing |
| `src/suggestions.ts` | `too-many-suggestions` diagnostic + `MAX_SUGGESTIONS_PER_BANK` | ✓ VERIFIED | Both present; wired into the existing cross-entry validation loop |
| `test/suggestions.test.ts` | Cap boundary/independence/ordering pins | ✓ VERIFIED | 60 tests, all passing |
| `vite.config.ts` | Config-time catalogue import | ✓ VERIFIED | `import './src/suggestions';` present; `npm run build` succeeds |
| `src/components/SuggestionChip.svelte` | Playable pad-alias chip | ⚠️ VERIFIED with defect | Press/release/echo/unmount-release all correct; panic-reset missing (Gap 1) |
| `src/components/SuggestionChips.svelte` | Shared balanced/fitted chip grid | ✓ VERIFIED | `fitChipsPerRow(` present and wired to `--per`; reused verbatim by rail and panel |
| `src/components/SuggestionRail.svelte` | Desktop/iPad columns + empty state + iPhone hide | ✓ VERIFIED | Empty copy, eyebrow, `@media (max-height: 480px)` all present |
| `src/components/SuggestionPanel.svelte` | iPhone strip + panel + pager | ⚠️ VERIFIED with defect | Strip/panel/pager/Escape all correct; `open` reset-on-empty missing (Gap 2) |
| `src/components/TopBar.svelte` | `sugg` grid area, height-gated layout, panel mount | ✓ VERIFIED | `<SuggestionPanel>` mounted in `.zone.sugg-zone`; `'pill sugg transpose'` grid area present |
| `src/App.svelte` | Hold-count gate, rail/panel wiring, panic hook | ✓ VERIFIED | `holdCounts`/`pressHold`/`releaseHold` wired; `SuggestionRail`/`TopBar` receive `press`/`release`/`displayKeys`; `clearAllHighlights` resets `holdCounts` |
| `src/components/PianoLayout.svelte` | Second-pointer guard | ✓ VERIFIED | `captured.has(k)` early-return present; diff limited to the guard (per plan acceptance criteria) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `App.svelte` | `src/rail.ts` | `pressHold`/`releaseHold` gate press/release before calling host | ✓ WIRED | Confirmed at `press()`/`release()` in App.svelte |
| `App.svelte` | `SuggestionRail.svelte` | `onPress={press} onRelease={release} heldKeys={displayKeys}` | ✓ WIRED | Line 235 of App.svelte |
| `App.svelte` | `TopBar.svelte` | `onPress={press} onRelease={release} heldKeys={displayKeys}` | ✓ WIRED | Line 233 of App.svelte |
| `TopBar.svelte` | `SuggestionPanel.svelte` | Panel mounted inside `sugg-zone` | ✓ WIRED | `<SuggestionPanel {onPress} {onRelease} {heldKeys} />` |
| `SuggestionChip.svelte` | `src/rail.ts` | `padNotesFor` resolves the canonical notes array | ✓ WIRED | Byte-identical array to the pad's own lookup (unit-tested with `toBe`) |
| `SuggestionChip.svelte` | `App.svelte` | Unmount teardown calls `onRelease` | ✓ WIRED | `onMount(() => () => releaseHeld())` |
| `App.svelte` (panic) | `SuggestionChip.svelte` (visual reset) | *(expected)* a panic-notification path | ✗ **NOT WIRED** | No such link exists — this is Gap 1 (CR-01) |
| `SuggestionPanel.svelte` (empty bank) | `SuggestionPanel.svelte` (`open` state) | *(expected)* reset-on-empty | ✗ **NOT WIRED** | No such link exists — this is Gap 2 (WR-01) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| RAIL-01 | 04-01, 04-03, 04-04 | Bank shows curated suggestions or honest empty state | ✓ SATISFIED | Truth 1 |
| RAIL-02 | 04-01, 04-03 | Chip shows pad key + canonical chord name, with fallback | ✓ SATISFIED | Truth 2 |
| RAIL-03 | 04-01, 04-04 | Silent browsing; chip press = pad alias via same press/release path | ⚠️ SATISFIED — with confirmed defect | Truth 3, 8; Gap 1 caveat (a held chip can visually misrepresent playback state after a panic) |
| RAIL-04 | 04-01, 04-04 | Read-only; no scoring/tracking; soft echo of held keys | ⚠️ SATISFIED — with confirmed defect | Truth 4; Gap 1 caveat (echo can go stale/inaccurate after a panic) |
| RAIL-05 | 04-03, 04-04 | Rail subordinate on desktop; contained mobile treatment | ✓ SATISFIED (code); visual confirmation pending | Truth 11, 12; human-check deferred |
| RAIL-06 | 04-03 | Usable with long/altered/slash/repeated/unnamed labels | ✓ SATISFIED | Truth 10 |
| RAIL-07 | 04-03, 04-04 | Browser verification across desktop/iPad/iPhone-landscape | ? NEEDS HUMAN | Truth 14; deferred to end-of-phase UAT |
| RAIL-08 | 04-01, 04-04 | OP-1/MIDI-monitor verification of silent browsing + chip=pad MIDI | ? NEEDS HUMAN | Truth 14; deferred to end-of-phase UAT |

No orphaned requirements: REQUIREMENTS.md maps exactly RAIL-01 through RAIL-08 to Phase 4, and all eight are claimed across the four plans' `requirements:` frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/components/SuggestionChip.svelte` | 20-49 | No panic/generation-token reset for per-instance `heldHere` state | 🛑 Blocker | Held chip stays visually lit after `host.panic()` silences audio (CR-01 / Gap 1) |
| `src/components/SuggestionPanel.svelte` | 20, 51-53, 60 | `open` never reset on the `suggestions.length === 0` branch | ⚠️ Warning | Panel silently reopens after an empty-bank detour, with no user action (WR-01 / Gap 2) |
| `src/components/SuggestionChip.svelte` | 115-119 | `.chip.held[data-color]` compound selector paired with a comment that misstates *why* it's needed (claims a specificity tie; the rules are actually tied and decided by source order, so the comment would mislead a future reorder) | ℹ️ Info | Low risk today; could mislead a future edit (IN-01) |
| `src/components/SuggestionPanel.svelte` | `.p-nav` pager buttons | `‹`/`›` are never `disabled` at `suggestions.length <= 1`, though `stepPage` is already inert | ℹ️ Info | False interactive affordance on "1 of 1" (IN-02) |
| `src/components/PianoLayout.svelte`, `src/rail.ts` | `chordFor` / `padNotesFor` | Duplicated `bank.chords.find((c) => c.key === k)` lookup in two places | ℹ️ Info | Drift risk if one is edited without the other (IN-03) |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any file touched by this phase.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Hold-count reducer forwards exactly one press/release per interleaving | `npm test -- test/rail.test.ts` | 53/53 pass | ✓ PASS |
| Per-bank cap (6) diagnostic, boundaries, independence | `npm test -- test/suggestions.test.ts` | 60/60 pass | ✓ PASS |
| Strict types across App/TopBar/Suggestion* wiring | `npm run check` (svelte-check) | 221 files, 0 errors, 0 warnings | ✓ PASS |
| Production build succeeds with the real (in-cap) catalogue | `npm run build` | Build succeeded (243.75 kB JS, 27.05 kB CSS) | ✓ PASS |
| An over-cap catalogue fails Vite config load | (proven in 04-02's own gate proof, re-confirmed via `grep -c "import './src/suggestions'" vite.config.ts` = 1) | present | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` convention or explicit probe declarations in this phase's PLAN/SUMMARY files; this project verifies through Vitest + `svelte-check` + `vite build`, all exercised above.

### Human Verification Required

These items were deliberately deferred by the plans themselves (`human_verify_mode: end-of-phase`) from each plan's own `<human-check>` block, harvested here per the phase's verification workflow. None have been performed as part of this automated verification pass.

#### 1. RAIL-01/02/06 desktop & iPad visual contract (04-03 Task 2)

**Test:** Run `just dev`. View Bank 1, Bank 14, Bank 2 on desktop Chrome (~1440x900); iPad landscape (~1180x820) and portrait (~820x1180); then a synthetic long-label stress case on a temporary Bank 60 entry.
**Expected:** Steel uppercase eyebrow "SUGGESTIONS · N" below the pads; quiet label/kind text per column; natural-key chips carry a cream outline; Bank 2 shows only the muted empty line; the whole rail fits without scrolling on iPad; long/altered labels wrap within their column without truncation; six chips split into balanced rows.
**Why human:** Visual layout, subordination, and fit across real viewports cannot be asserted without a DOM; Vitest runs in Node.

#### 2. RAIL-03/04/08 pad/chip MIDI parity and hold interleaving (04-01 Task 2)

**Test:** With OP-1 (or a MIDI monitor) as output, compare pad C vs. the Homeward C chip's MIDI; hold keyboard + chip together in both release orders; on iPad, hold pad + chip with two fingers in both orders; change bank while holding a chip; test latch on/off with a chip.
**Expected:** Chip MIDI is identical to the pad's; exactly one note-on/note-off set per hold episode regardless of source/order; no pad or chip stays lit; other chips sharing the key show soft echo, not full orange; a chip's note stops immediately on a bank change mid-hold; latch behaves identically through a chip.
**Why human:** Web MIDI output and OP-1 sound are browser/hardware-only; Vitest runs in Node without MIDI or a real device.

#### 3. RAIL-01/03/04/05/07/08 iPhone-landscape strip + panel (04-04 Task 2)

**Test:** Real iPhone in landscape (or Chrome emulation at 852x393 and 667x375) with a MIDI monitor: inspect the TopBar row-1 strip; open/page/close the panel via ×, the collapse control, and Escape; change bank while the panel is closed then reopen; hold a panel chip and page/close/Escape away from it; check Bank 14 and Bank 2; resize above 480px height.
**Expected:** Row 1 shows "SUGGESTIONS · N" with zero added height; every pad stays visible while the panel is open; each close path works and nothing else closes it; page resets to 1 of N on any bank change; no MIDI/latch/transport/clock change during browsing; a held chip's note stops immediately on page/close/Escape; above 480px height the strip disappears and the desktop/iPad rail returns.
**Why human:** iPhone-landscape layout and silent-browsing MIDI behaviour need a real browser viewport and a MIDI monitor; Vitest runs in Node without DOM or Web MIDI.

**Also recommended for this same human-verification pass** (not part of the original harvested checks, but directly exercises the two confirmed code gaps and costs nothing extra alongside item 2/3 above):
- Hold a suggestion chip, then flip the clock-source (Int/Ext) in the Setup popover, or unplug the selected MIDI output, or let the OP-1 send Stop in Ext mode — confirm whether the chip stays lit orange after the sound stops (Gap 1 / CR-01).
- On a bank with suggestions, open the panel, step to a bank with none, then step to a bank with suggestions again without tapping the strip — confirm whether the panel reopens on its own (Gap 2 / WR-01).

### Gaps Summary

Phase 4's architecture is sound and thoroughly tested at the unit level: the hold-count gate (`src/rail.ts`), the catalogue cap enforcement, the balanced/fitted chip-row math, and the label-splitting logic all have exhaustive Vitest coverage (113 tests total, all passing) and the full type-check/build pipeline is green. Six of eight requirements (RAIL-01, 02, 05, 06) are cleanly satisfied with no caveats, and the other four (RAIL-03, 04, 07, 08) are satisfied at the code/architecture level but carry two confirmed defects and two categories of still-pending human verification:

1. **Gap 1 (Blocker, CR-01):** `SuggestionChip.svelte`'s per-instance `heldHere` visual state has no path to reset on a `host.panic()` event, so a chip held through a clock-source flip, an external transport Stop, or a MIDI device disconnect stays lit orange after the sound has already stopped — reintroducing, for chips specifically, the exact stuck-lit/audio-desync bug class the project fixed at length for `PianoLayout` in earlier phases. This directly contradicts an explicit, test-tagged prohibition in the 04-01-PLAN.md must_haves ("A chip must never leave a hanging note, stuck latch, or stuck-lit pad or chip... when a release arrives after a panic").
2. **Gap 2 (Warning, WR-01):** `SuggestionPanel.svelte`'s `open` state survives a detour through an empty bank and silently reopens the panel on a later populated bank, with no user action.
3. Both `RAIL-07` and `RAIL-08` (browser and OP-1/MIDI-monitor verification) were deliberately deferred to end-of-phase UAT by the plans themselves and have not yet been performed — this is expected given `human_verify_mode: end-of-phase`, not a code defect, but it means the phase's own stated verification requirements are not yet closed.

Neither gap requires a large fix: both have a concrete, narrow, already-diagnosed remedy in `04-REVIEW.md` (a `panicToken` prop threaded down to `SuggestionChip`, and an `$effect` resetting `open` on an empty suggestions list). Recommend a short closure plan addressing both before this phase ships, followed by the deferred end-of-phase UAT.

---

_Verified: 2026-09-25T20:43:13Z_
_Verifier: Claude (gsd-verifier)_
