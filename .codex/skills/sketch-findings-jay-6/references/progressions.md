# Progressions

## Design Decisions

- Use Option A chord-chip rail for the display pattern:
  - sits directly below pads
  - each chip shows pad letter plus resolved chord name
  - current step is orange
  - next step is dashed steel

- Mobile:
  - collapse progression display into a sheet
  - show one progression at a time
  - avoid forcing the main pad surface into long vertical scrolling

- Data shape proposal:
  - progression has `id`, `name`, `feel`, `lengthBars`, and `steps`
  - each step maps to a pad key, and the chord name resolves from the current bank

## CSS Patterns

- Progression rows should remain subordinate to the pad grid.
- Feel/category tint is small and quiet.
- Orange/steel state semantics match pad and toast semantics.

## HTML Structures

- Chord chip:
  - small pad key label
  - larger chord name
  - current/queued decoration

- Row:
  - name
  - bars/feel metadata
  - chip timeline
  - compact formula preview

## What To Avoid

- Do not implement progression authoring as part of visual redesign by accident.
- Do not let suggestions compete with pads as the primary performance surface.
- Do not use the bar-notation ribbon as the first implementation target; it reads more sequencer-like.

## Origin

Synthesized from sketch: 001-jay-6-visual-redesign.

Reference screenshot: `sources/001-jay-6-visual-redesign/03-progressions-chip-rail.png`.
