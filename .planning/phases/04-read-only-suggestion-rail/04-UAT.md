---
status: testing
phase: 04-read-only-suggestion-rail
source: [04-VERIFICATION.md]
started: 2026-09-27T18:40:00Z
updated: 2026-09-27T18:40:00Z
---

## Current Test

number: 1
name: CR-01 rail chip idles on panic (hardware)
expected: |
  The chip drops from full orange to idle the moment the sound stops, while still pressed, with no other chip showing echo; lifting sends no MIDI; the next press plays and releases normally.
awaiting: user response

## Tests

### 1. CR-01 rail chip idles on panic (hardware)
steps: Hold a suggestion chip on the desktop/iPad rail, then (1) unplug the selected MIDI output, (2) flip Int/Ext in Setup, or (3) let the OP-1 send Stop in Ext mode; after each, lift and press the same chip again.
expected: The chip drops from full orange to idle the moment the sound stops, while still pressed, with no other chip showing echo; lifting sends no MIDI; the next press plays and releases normally.
result: [pending]

### 2. CR-01 iPhone panel chip idles on panic
steps: Repeat the same three panic triggers while holding a chip inside the iPhone-landscape panel (real iPhone or ~852x393 emulation).
expected: Same result as the rail case: the panel chip turns idle the instant the sound stops, without forwarding a release.
result: [pending]

### 3. WR-01 panel stays closed after empty bank
steps: On Bank 1, open the panel, step to Bank 2 (no suggestions) without touching the strip, then step to a bank with suggestions again.
expected: The panel stays closed on the populated bank until the strip is tapped again; it must not reopen on its own.
result: [pending]

### 4. No effect-depth loop on repeated Int/Ext flips
steps: With nothing held, flip Int/Ext five times in a row in the Setup popover, then play a few pads.
expected: The app stays responsive, pads play normally, and the browser console shows no effect_update_depth_exceeded error.
result: [pending]

### 5. RAIL-07 browser layout verification
steps: Browser verification across desktop/iPad/iPhone-landscape layouts and long-label stress, per 04-03/04-04's own deferred human-checks.
expected: Steel eyebrow, quiet label/kind text, honest empty state, balanced chip rows, no truncation/scroll, panel anchored over the top bar and never covering a pad.
result: [pending]

### 6. RAIL-08 OP-1/MIDI parity verification
steps: OP-1/MIDI-monitor verification of chip=pad MIDI parity and hold interleavings, per 04-01/04-04's own deferred human-checks.
expected: Chip MIDI is identical to the pad's; exactly one note-on/off set per hold episode regardless of source/order; no pad or chip stays lit; latch behaves identically through a chip.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
