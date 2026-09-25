---
sketch: 002
name: iphone-suggestion-rail
question: "How should Phase 4's read-only suggestions be browsed on iPhone landscape, and how does an empty bank look?"
winner: "B · strip in top bar"
tags: [phase-4, suggestions, iphone, landscape, empty-state]
---

# Sketch 002: iPhone Suggestion Rail

## Design Question
How should read-only suggestions be browsed on iPhone landscape without pushing the pads out of primary position? How should an empty bank look?

## How to View
open .planning/sketches/002-iphone-suggestion-rail/index.html

- Desk: framed at ≈852×342 (iPhone 16 Safari landscape), plus full 852×393 and SE ≈667×331
- Phone (coarse pointer, short viewport): fills the screen; the `002` handle on the left edge opens the sketch controls

## 📏 Real constraints (from src/)
- `max-height: 480px` → pad rows 64/80, piano 8px padding/margin
- ≤900 wide → two-row TopBar grid, ~157px tall (58 pill row + 66 latch row)
- Pads end at ~335px. Safari landscape has ≈330–360px usable height, so no room below the pads
- `pointer: coarse` + short viewport → body scroll re-enabled (App.svelte), overscroll none

## Variants
- **A: Inline rail** — label column + balanced chip rows under the pads. Starts below the fold on every iPhone size
- **B: Strip + anchored panel** — "Suggestions · N" strip; nonmodal panel sits over the top bar only, one suggestion at a time, ‹ › "1 of N", close via ×, strip, or Escape
  - sub-toggle: strip under the pads (below the fold) vs in the empty middle of TopBar row 1 (zero height cost)
- **C: Bottom sheet** (sketch 001 idea) — covers the white keys; shown for contrast

## Stress cases (bank switcher)
- 01 Pop: real Homeward / Step up + long label, 8 chips (4+4), slash chords
- 03 Jazz: altered chords `E7#9`, `D7sus2/C`, 7 chips (4+3)
- 07 Trad Maj: empty bank

## What to Look For
- Can you play every pad with the panel open?
- Does the empty-bank line in the top bar read as quiet or as noise?
- Losing bank/style access while the panel is open: acceptable?

## 🔁 Round 2 (after sketch 003)
- Panel chips are **playable**, using the same press path + per-key hold count as sketch 003
- Soft echo + cream outline carried over, so one chip component serves every surface
