---
created: 2026-09-25T12:00:00.000Z
title: Suggestion rail design for banks with more than six suggestions
area: ui
files:
  - src/suggestions.data.json
  - .agents/skills/sketch-findings-jay-6/references/progressions.md
---

## Problem

Phase 4 caps the rail at six suggestions per bank. iPad locks body scroll (`pointer: coarse`, ≤1366 wide, >480 tall in `App.svelte`), and the 3×2 desktop/iPad column grid fits the viewport exactly — a seventh suggestion would clip below the fold and be unreachable.

Accepted as a deliberate Phase 4 limitation to avoid over-engineering while the catalogue is tiny.

## Follow-up

- Revisit when any bank is curated past six suggestions.
- Explore a design that scales (paging, per-bank grouping, or a contained scroll region) without breaking the scroll lock or pad primacy.
- Decide whether the catalogue validator should reject >6 entries per bank in the meantime.
