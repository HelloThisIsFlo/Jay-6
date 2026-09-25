---
sketch: 003
name: desktop-suggestion-rail
question: "What does the inline suggestion rail look like on desktop and iPad, and does it fit?"
winner: "Columns"
tags: [phase-4, suggestions, desktop, ipad, inline-rail]
---

# Sketch 003: Desktop Suggestion Rail

## Design Question
Companion to 002 (iPhone winner: strip in the top bar). On desktop and iPad the rail sits inline under the pads. Which layout fits, and does it survive a busy bank?

## How to View
open .planning/sketches/003-desktop-suggestion-rail/index.html

- Frames: desktop 1440×860, laptop ≈1280×680, iPad landscape ≈1180×770, iPad portrait ≈820×1110 (scaled to fit the window)
- On a real iPad it fills the screen; the `003` button opens the controls

## 📏 Real constraints
- Desktop: single-row TopBar, pads end ~387px
- iPad (`pointer: coarse`, ≤1366 wide, >480 tall): App.svelte locks body scroll, so anything below the fold **cannot be reached**
- iPad frames emulate that lock

## Variants
- **Rows** — label column + balanced chips (same primitives as 002)
- **Columns** — suggestions side by side, chips capped at 4 per row

## Measured (busy Jazz bank, 6 suggestions)
| Frame | Rows | Columns |
|---|---|---|
| Desktop 1440×860 | fits (ends 849) | fits |
| Laptop ≈1280×680 | needs 169px scroll | — |
| iPad land. ≈1180×770 🔒 | **clipped 79px, unreachable** | fits (ends 731) |
| iPad port. ≈820×1110 🔒 | fits (ends 1011) | fits (ends 950) |

## What to Look For
- Rows vs columns readability with 3 vs 6 suggestions
- Whether a hard cap on the number of suggestions, or columns on iPad landscape, is the right answer to the scroll lock

## 🧪 Round 2 toggles
- **Key-colour hint (round 3, border only):** off / cream outline / key lip (3px bottom edge) / ring (2px, black bezel for accidentals)
  - round 2's key cap and mini pads were rejected (cap disliked, mini pads too distracting)
- **Playable chips:** a chip press goes through the same path as its pad; the chip and its pad both turn orange
  - per-key hold count, so releasing a chip never silences a pad that's still held
- **Echo:** off / soft / full. Holding a key (from a pad or chip) lights every chip with that key
- ✅ Decided:
  - chips are playable
  - hint = **cream outline** (naturals only; accidentals keep the plain edge)
  - echo = **soft** (faint orange fill + orange border on every other chip with the held key; the pressed chip keeps the full orange)
