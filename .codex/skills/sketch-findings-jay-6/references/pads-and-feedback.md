# Pads & Feedback

## Design Decisions

- Use lifted bevel pad treatment:
  - subtle top highlight
  - stronger bottom inner shadow
  - no new chroma on black keys

- Keep the J-6 hardware layout:
  - separate black-key row above
  - clean gap between rows
  - no real-piano overlap

- Held pad state:
  - orange fill/glow
  - reserved exclusively for currently sounding pads

- Queued feedback:
  - Option A bottom-center pill
  - text reads like `Queued · V08 · arms in 2 beats`
  - use steel system accent
  - show only when a pending change would otherwise be ambiguous

## CSS Patterns

- Black keys:
  - base `--black-key`
  - lifted bevel through shadow/highlight
  - keep face dark and quiet

- Toast:
  - bottom center
  - compact pill
  - muted steel border/accent
  - mono for variation ID and countdown

## HTML Structures

- Pad grid should remain two-row hardware mapping rather than piano overlap.
- Toast should be global feedback, not hidden inside a specific control.

## What To Avoid

- Do not revive the real-piano overlap layout.
- Do not use orange borders merely to improve black-key visibility.
- Do not make queued state look like an active held pad.

## Origin

Synthesized from sketch: 001-jay-6-visual-redesign.

Reference screenshots:

- `sources/001-jay-6-visual-redesign/04-full-mock-v2-recommended.png`
- `sources/001-jay-6-visual-redesign/07-toast-bottom-center-pill.png`
  - focused crop of Option A only
