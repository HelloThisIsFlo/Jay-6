---
created: 2026-05-23T18:25:56.994Z
title: "Variation change applies on next hit" toast
area: ui
resolves_phase: 5
files:
  - src/App.svelte
---

## Problem

Test 4 in Phase 02 UAT: switching the variation on a slow pattern (e.g. Beat V01) feels like nothing happened. The change is correctly queued but only applies at the next step boundary — which can be up to 8 beats away. No feedback that the change registered.

## Solution

Quality-of-life: show a brief website-style notification (toast) at the bottom of the screen confirming the variation change was registered.

- Show it **only** when the next hit is more than ~0.5s away (slow variations), so fast patterns don't flash a pointless toast.

**Target:** polish / Claude Design.

Cross-ref: variation **semantic visual cues** + iOS picker-wheel selectors live in the separate todo `2026-05-18-iterate-on-jay-6-visual-design-via-claude-design.md` ("Variation selector — semantic visual cues"). This toast is the timing-feedback piece, distinct from those.
