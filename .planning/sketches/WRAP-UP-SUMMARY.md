# Sketch Wrap-Up Summary

**Date:** 2026-07-06
**Sketches processed:** 1
**Design areas:** Tokens, TopBar, Pads & Feedback, Variations, Progressions
**Skill output:** `./.codex/skills/sketch-findings-jay-6/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | jay-6-visual-redesign | Imported v3 recommended composition | Tokens, TopBar, Pads & Feedback, Variations, Progressions |

## Excluded Sketches

| # | Name | Reason |
|---|------|--------|
| none | none | none |

## Design Direction

Jay-6 should adopt the v3 visual redesign as an in-between v1.1-style pass before milestone 2 sequencer work. The design should feel like a compact instrument surface: dark hardware chrome, cream pads, small mono readouts, lifted pad tactility, and a performance-first control hierarchy.

## Key Decisions

- Tokens:
  - dark instrument palette
  - 8px grid
  - system UI for labels/prose
  - JetBrains Mono for numeric and symbolic readouts
  - orange only for active sounding pads
  - muted steel for queued/pending/armed state

- TopBar:
  - Option C2
  - routing and BPM folded into one status pill
  - setup popover for output/input/channel/clock/BPM
  - BPM read-only when clock is external
  - iPad uses two-row stacked layout

- Pads:
  - lifted bevel treatment
  - separate J-6 hardware rows
  - no real-piano overlap

- Variations:
  - per-style pickers
  - Arp uses composed direction/range/feel selector
  - Beat uses note-value x feel grid
  - Rhythm Gate uses 4x3 pattern tiles
  - V-number becomes a derived readout where possible

- Toast:
  - Option A bottom-center pill
  - "arms in 2 beats" countdown
  - steel queued accent

- Progressions:
  - chord-chip rail is the selected display pattern
  - mobile collapses to sheet
  - implementation scope remains a phase/spec decision

## Source Artifacts

- `.research/design/Jay-6 Redesign (standalone).html`
- `.research/design/screenshots/01-topbar-c2-recommended.png`
- `.research/design/screenshots/02-variations-arp-composed.png`
- `.research/design/screenshots/03-progressions-chip-rail.png`
- `.research/design/screenshots/04-full-mock-v2-recommended.png`
- `.research/design/screenshots/05-variations-beat-grid.png`
- `.research/design/screenshots/06-variations-rhythm-gate-tiles.png`
- `.research/design/screenshots/07-toast-bottom-center-pill.png`
  - focused crop of Option A only


---

# Sketch Wrap-Up Summary (round 2)

**Date:** 2026-09-25
**Sketches processed:** 2
**Design areas:** Suggestion Rail (replaces Progressions)
**Skill output:** `./.codex/skills/sketch-findings-jay-6/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 002 | iphone-suggestion-rail | B · strip in top bar + panel over top bar | Suggestion Rail |
| 003 | desktop-suggestion-rail | Columns + playable chips + soft echo + cream outline | Suggestion Rail |

## Excluded Sketches

| # | Name | Reason |
|---|------|--------|
| none | none | none |

## Key Decisions

- 📱 iPhone landscape: `Suggestions · N` strip in TopBar row 1; nonmodal panel over the top bar only, one suggestion at a time
- 🖥️ Desktop/iPad: inline columns, 3 × 2 → max 6 suggestions per bank (iPad body scroll lock)
- 🎹 Chips playable through the pad's press path; per-key hold count
- 🔁 Soft echo: held key lights every other chip with that key; the pressed chip keeps full orange
- ⬜ Cream outline on natural-key chips only
- 🫥 Empty bank: quiet muted line, no controls
- ⚠️ Changes Phase 4's "no orange in the rail" rule; "read-only" now means no editing
