# Variations

## Design Decisions

- Use per-style pickers, not one universal variation control.

- Arp:
  - composed selector
  - direction x octave range x feel
  - V-number becomes a derived readout, not the primary control

- Beat:
  - 2D grid
  - rows are note values
  - columns are straight/triplet feel

- Rhythm Gate:
  - 4x3 pattern tiles
  - glyph is the score

- Glyph language:
  - Arp glyphs show direction/range shape
  - note glyphs use music notation with noteheads, stems, and flags
  - rhythm hits use circles and capsules rather than blocky rectangles

## CSS Patterns

- Selected variation uses orange only when it maps to the currently active/held performance state.
- Queued/next indicators use steel.
- Variation cards need to remain legible at chip scale and card scale.

## HTML Structures

- Do not expose 12 raw numbers as the main Arp picker.
- Derive the V-number from selected axes and display it as confirmation.

## What To Avoid

- Do not force all variation families into the same picker shape.
- Do not use the iOS picker wheel as the primary desktop/tablet control.
- Do not make rhythm patterns text-first; they need visible pattern tiles.

## Origin

Synthesized from sketch: 001-jay-6-visual-redesign.

Reference screenshots:

- `sources/001-jay-6-visual-redesign/02-variations-arp-composed.png`
- `sources/001-jay-6-visual-redesign/05-variations-beat-grid.png`
- `sources/001-jay-6-visual-redesign/06-variations-rhythm-gate-tiles.png`
