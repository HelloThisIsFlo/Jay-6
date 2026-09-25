---
phase: 04-read-only-suggestion-rail
reviewed: 2026-09-25T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/App.svelte
  - src/components/PianoLayout.svelte
  - src/components/SuggestionChip.svelte
  - src/components/SuggestionChips.svelte
  - src/components/SuggestionPanel.svelte
  - src/components/SuggestionRail.svelte
  - src/components/TopBar.svelte
  - src/rail.ts
  - src/suggestions.ts
  - test/rail.test.ts
  - test/suggestions.test.ts
  - vite.config.ts
findings:
  critical: 1
  warning: 1
  info: 3
  total: 5
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-09-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the read-only suggestion rail: the `rail.ts` hold-count reducer, the `suggestions.ts` catalogue validator, and the new `SuggestionChip`/`SuggestionChips`/`SuggestionRail`/`SuggestionPanel` component tree, plus the App/PianoLayout/TopBar wiring that threads chips through the same press/release path as pads.

`rail.ts` and `suggestions.ts` are pure functions with excellent, adversarial test coverage (113 passing tests across `rail.test.ts`/`suggestions.test.ts`); I traced the ref-counting reducer, the balanced-row layout math, the pager math, and the catalogue validator's edge cases (sparse arrays, accessor traps, symbol paths, per-bank cap) and found the logic sound. `tsc --noEmit` and `svelte-check` are clean, and the added `PianoLayout` second-finger guard is a correct fix for a real capture-overwrite hazard.

The one blocking finding is in the untested Svelte layer: `SuggestionChip` keeps its own physically-held visual state (`heldHere`) that is only cleared by its own pointer end-events or by component unmount — nothing resets it when `host.panic()` fires (mode switch, external transport stop, MIDI device disconnect), so a chip held during a panic stays lit "held" after the sound has already stopped. This is exactly the stuck-lit/audio-desync class of bug the project fixed at length for `PianoLayout` (UAT 16, 20), reintroduced by the new per-chip local state that `PianoLayout` deliberately doesn't have.

## Critical Issues

### CR-01: Held suggestion chip stays lit after a panic, desyncing from the (now silent) audio

**File:** `src/components/SuggestionChip.svelte:20-49`
**Issue:**
`heldHere`, `pointerId`, and `pressedKey` are per-chip-instance state (by design, per the D-03 comment, so two chips sharing a key don't both light up). They're only cleared by `endPress`/`releaseHeld` (pointer end events) or by the `onMount` teardown callback (component unmount on bank change / panel close / paging).

`host.panic()` — called by:
- `host.panicForModeSwitch()` in `src/App.svelte:39-43`, which re-runs on *every* `ui.clockSource` change (e.g. flipping Int/Ext in the Setup popover),
- `host.onTransport('stop')` while in external clock mode (`src/engines/host.ts:222-225`),
- the MIDI output/input-disconnect handling in `App.svelte`'s `subscribeMidi` callback (`src/App.svelte:51-70`),

stops all sound and calls `App.svelte`'s `clearAllHighlights()` (`src/App.svelte:88-92`), which resets `holdCounts`/`latchedKey` so every `PianoLayout` pad un-highlights immediately (it only reads the shared `heldKeys` set). But nothing tells a currently-held `SuggestionChip` to reset its own `heldHere` — `grep -rn "panic" src/components/Suggestion*.svelte src/rail.ts` returns no matches.

Reproduction: hold a suggestion chip (chord sounds), then with the other hand flip the clock source in the Setup popover, or unplug the selected MIDI output, or (in Ext mode) let the OP-1 send Stop. Sound stops correctly, but the chip you're still touching stays lit orange (`chipVisualState` gives `heldHere` top precedence over `keyLit`) until you lift your finger — a chip visibly "playing" a chord that isn't sounding.

**Fix:**
Give `App.svelte` a way to notify mounted chips of a panic, e.g. a reactive counter bumped inside `clearAllHighlights()` and threaded down as a prop:

```svelte
<!-- App.svelte -->
let panicToken = $state(0);
function clearAllHighlights(): void {
  holdCounts = NO_HOLDS;
  latchedKey = null;
  panicToken++;
}
```

```svelte
<!-- SuggestionChip.svelte -->
let { step, bankIndex, onPress, onRelease, heldKeys, panicToken }: Props = $props();

$effect(() => {
  panicToken; // track
  // Local-only reset — holdCounts/host are already clear, never call onRelease here.
  pointerId = null;
  pressedKey = null;
  heldHere = false;
});
```

(Thread `panicToken` through `SuggestionRail`/`SuggestionPanel` → `SuggestionChips` → `SuggestionChip` alongside the existing `onPress`/`onRelease`/`heldKeys` props.)

## Warnings

### WR-01: Suggestion panel silently reopens after a "no suggestions" detour

**File:** `src/components/SuggestionPanel.svelte:20, 51-53, 60`
**Issue:** `open` is never reset when the current bank has zero suggestions. Sequence: open the panel on a bank with suggestions → step to a bank with none (the component renders the "No curated suggestions for this bank yet" message and unmounts the strip/panel branch — the user never touched the toggle) → step to another bank that has suggestions. `{#if open && current}` re-evaluates true immediately and the panel pops back open on its own, because `open` survived the whole detour in the same component instance.
**Fix:** Reset `open` whenever the suggestion list is empty, e.g.:
```svelte
$effect(() => {
  if (suggestions.length === 0) open = false;
});
```

## Info

### IN-01: Comment justifying `.chip.held[data-color]` misstates CSS specificity

**File:** `src/components/SuggestionChip.svelte:107-123`
**Issue:** The comment claims `.chip.held[data-color]` is needed because `.chip.held` and `.chip[data-color='white']` "tie at the same specificity and source order would decide, silently letting the outline win." Both selectors are in fact tied at specificity (0,2,0) (a class selector and an attribute selector carry equal weight), but `.chip.held` is declared *after* `.chip[data-color='white']` in the same stylesheet, so it already wins on source order alone — the extra `.chip.held[data-color]` compound selector is redundant, not specificity-required.
**Fix:** Either drop the redundant selector or correct the comment so a future edit doesn't reorder the rules under a false assumption about why the duplicate exists.

### IN-02: Pager prev/next buttons are never disabled with a single suggestion

**File:** `src/components/SuggestionPanel.svelte:72-76`
**Issue:** `stepPage` is intentionally inert when `count <= 1`, but the `‹`/`›` buttons stay enabled and clickable, giving a false interactive affordance for a "1 of 1" suggestion.
**Fix:** `disabled={suggestions.length <= 1}` on both `.p-btn` pager buttons.

### IN-03: Duplicated chord lookup between `PianoLayout` and `rail.ts`

**File:** `src/components/PianoLayout.svelte:36-38`, `src/rail.ts:47-49`
**Issue:** `chordFor(k)` (PianoLayout) and `padNotesFor(bankIndex, key)` (rail.ts) both re-implement the identical `bank.chords.find((c) => c.key === k)` lookup.
**Fix:** Not urgent, but if either is touched again, consider having `PianoLayout` delegate to a shared bank/key lookup helper in `rail.ts` to keep the two lookups from drifting.

---

_Reviewed: 2026-09-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
