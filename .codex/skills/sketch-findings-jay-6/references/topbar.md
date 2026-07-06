# TopBar

## Design Decisions

- Use Option C2:
  - performance-first single row
  - routing collapses into one pill
  - BPM folds into the routing pill because it is set-once
  - setup details open in a popover

- Closed state should prioritize live performance:
  - output/input/channel summary
  - BPM + clock status
  - bank controls
  - style + variation readout
  - transpose stepper
  - latch at the right edge

- Setup popover contains:
  - Output
  - Input
  - Channel
  - Int/Ext clock
  - BPM

- External clock behavior:
  - BPM stays visible
  - BPM becomes read-only when clock is external

- iPad behavior:
  - use the stacked two-row variant below roughly 900px

## CSS Patterns

- TopBar background uses `--bg-1`.
- Controls use `--bg-2`, `--bg-3` hover, compact radii, and small mono readouts.
- Status pill gets the strongest grouping treatment; other controls stay quieter.

## HTML Structures

- TopBar should group routing and tempo as one status component.
- Setup controls should move into an expandable popover rather than occupying permanent row width.

## What To Avoid

- Do not keep all 12 controls equally visible in one row.
- Do not separate BPM into its own persistent heavy control.
- Do not make the setup surface feel like the main performance surface.

## Origin

Synthesized from sketch: 001-jay-6-visual-redesign.

Reference screenshot: `sources/001-jay-6-visual-redesign/01-topbar-c2-recommended.png`.
