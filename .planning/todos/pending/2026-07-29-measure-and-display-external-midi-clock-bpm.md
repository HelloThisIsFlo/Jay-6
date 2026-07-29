---
created: 2026-07-29T17:21:38.331Z
title: Measure and display external MIDI-clock BPM
area: engines
files:
  - src/tickSource.ts
  - src/state.svelte.ts
  - src/App.svelte
  - src/components/TopBar.svelte
---

## Problem

External-clock mode makes the BPM field read-only, but the displayed value is
still the last internal BPM. Jay-6 does not currently derive tempo from incoming
MIDI clock ticks, so the UI can imply that it is showing the OP-1 tempo when it
is not.

## Solution

Measure incoming 24 PPQ clock timing, stabilize the derived BPM against normal
tick jitter, and expose it to the UI while external-clock mode is active. Keep
the internal BPM setting unchanged so switching back to internal clock restores
the user's configured tempo.
