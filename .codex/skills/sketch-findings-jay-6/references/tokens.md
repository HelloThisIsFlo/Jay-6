# Tokens

## Design Decisions

- Palette is locked around instrument chrome:
  - app background `#0e0e0e`
  - topbar `#171717`
  - controls `#1f1f1f`
  - hover `#2a2a2a`
  - border `#3a3a3a`
  - high divider `#4a4a4a`
  - cream pad `#f4f1ea`

- Accent rules are semantic:
  - orange `#ff7a1a` means currently sounding / held pad only
  - steel `oklch(0.68 0.045 250)` means queued, pending, armed, or next

- Typography:
  - system UI for labels and prose
  - JetBrains Mono for numeric or symbolic instrument data:
    - chord names
    - BPM
    - MIDI channel
    - variation IDs

- Type scale:
  - eyebrow: `11px`
  - body: `14px`
  - readout: `18px`
  - display: `28px`

- Spacing:
  - snap to an 8px grid
  - use 4px only for tight internal separations

## CSS Patterns

- Use tokens from `sources/themes/default.css`.
- Keep radii compact:
  - `4px`
  - `6px`
  - `10px`

## What To Avoid

- Do not use orange for queued state.
- Do not introduce colorful secondary accents for black keys or borders.
- Do not make the UI feel like a generic SaaS control panel.

## Origin

Synthesized from sketch: 001-jay-6-visual-redesign.

Source files available in: `sources/001-jay-6-visual-redesign/`.
