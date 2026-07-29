---
created: 2026-07-29T17:22:29.238Z
title: Design touch-oriented Bank and Channel selectors
area: ui
files:
  - src/components/TopBar.svelte
---

## Problem

The redesigned Bank control uses a custom scrollable popover, while Channel
still uses a native select. The old UAT polish backlog proposed tactile
picker-wheel controls for touch devices, but this is a new interaction design,
not a defect in the current selectors.

## Solution

Explore a touch-oriented picker treatment for Bank and Channel that fits the
instrument visual language, remains usable with mouse and keyboard, and does
not regress the compact desktop or responsive TopBar layouts. Preserve the
existing values and selection semantics.
