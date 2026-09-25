---
name: sketch-findings-jay-6
description: Validated Jay-6 design decisions from sketch experiments - visual redesign (tokens, TopBar, pads, variations) and the Phase 4 suggestion rail (playable chips, soft echo, iPhone top-bar panel, desktop/iPad columns). Load during Jay-6 UI planning and implementation.
---

<context>
## Project: Jay-6

Browser instrument UI: Roland J-6-style chord pads to MIDI/OP-1. Wrapped design work: the in-between visual redesign (sketch 001, adopted in Phase 2.1) and the Phase 4 suggestion rail (sketches 002-003).

Source design canvas: `sources/001-jay-6-visual-redesign/index.html`

Sketch sessions wrapped: 2026-07-06, 2026-09-25
</context>

<design_direction>
## Overall Direction

Jay-6 should read as a compact hardware instrument: dark restrained chrome, cream pads, small mono readouts, 8px grid spacing, and clear performance-first hierarchy. Orange is reserved for currently sounding pads. Queued/pending state uses muted steel so it cannot be confused with active sound.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Tokens | `references/tokens.md` | Locked dark instrument palette, 8px grid, mono readouts, orange = sounding, steel = system status/metadata |
| TopBar | `references/topbar.md` | Use C2 performance-first bar with routing+BPM status pill and setup popover |
| Pads & Feedback | `references/pads-and-feedback.md` | Lifted bevel pads, separate J-6 rows; queued toast designed but deferred |
| Variations | `references/variations.md` | Use per-style pickers instead of one universal variation control |
| Suggestion Rail | `references/progressions.md` | Playable chips + soft echo + cream outline; columns ≤6 on desktop/iPad, top-bar strip + panel on iPhone landscape |

## Theme

The extracted theme file is at `sources/themes/default.css`.

## Source Files

Original sketch HTML and screenshots are preserved in `sources/001-jay-6-visual-redesign/`, `sources/002-iphone-suggestion-rail/`, `sources/003-desktop-suggestion-rail/`.
</findings_index>

<metadata>
## Processed Sketches

- 001-jay-6-visual-redesign
- 002-iphone-suggestion-rail
- 003-desktop-suggestion-rail
</metadata>
