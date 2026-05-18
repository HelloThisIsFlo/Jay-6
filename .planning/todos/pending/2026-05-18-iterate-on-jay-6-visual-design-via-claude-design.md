---
created: 2026-05-18T21:19:21.163Z
title: Iterate on Jay-6 visual design via Claude Design
area: ui
files:
  - src/components/PianoLayout.svelte
  - src/components/TopBar.svelte
  - src/App.svelte
  - .planning/phases/02-post-prototype-polish-uat-acceptance/02-UI-SPEC.md
---

## Problem

Phase 2 shipped iPad ergonomics + black-key Option B → walked to fallback step D (frame `#000`). Flo accepted current state as "fine, not super pretty" — explicitly deferred further visual iteration to a free-form workflow outside GSD execute-phase cycles.

Known visual debt (some flagged in UI-SPEC as out-of-scope acknowledged):

- 🎹 **Black-key contrast** — current Option D (frame `#000`) accepted but not loved. Keys at `#2e2e2e` on true black read but feel flat. Inset top highlight (`rgba(255,255,255,0.08)`) too subtle at desktop zoom; might earn its keep on iPad pixel density. Open question: walk to A (drop highlight) + bump fill toward `#262626`? Or back to a `#181818` frame + brighter key (`#3a3a3a`)? Needs side-by-side eyeball.
- 📏 **Typography scale sprawl** — ~8 distinct font sizes currently in use (0.7 / 0.75 / 0.78 / 0.8 / 0.85 / 0.9 / 1 / 1.05 rem). UI-SPEC Dim 4 FLAG — collapse to ~4 roles (label / body / heading / display).
- 📐 **Spacing scale off-grid token** — `0.75rem` (12px) breaks the 4/8/16/24/32 grid. UI-SPEC Dim 5 FLAG. Decide: round to 0.5rem (8) or 1rem (16) per usage site.
- 🎛️ **TopBar layout** — visually busy (Output/Input/Channel/Bank/‹›/Transpose/Int·Ext/BPM/Style/Variation/Gate/Latch in one row). Group? Collapse? Hide-on-mobile?
- 🎨 **J-6 hardware visual reference** — current Jay-6 looks generic-dark-synth, not J-6-evocative. Could borrow more from the actual J-6's orange/cream/black palette + chunky panel feel.

Out-of-phase: don't run this through `/gsd:discuss-phase` / `/gsd:plan-phase`. Use "Claude Design" (Flo's free-form design iteration workflow) instead — faster turnaround, no execute-phase ceremony for what's mostly tweaking CSS values and judging by eye.

## Solution

TBD. Pick up via Claude Design when ready. Possible flow:

1. Spin up `just dev`, screenshot current state
2. Walk through each debt item — generate 2–3 variants per concern, render with Playwright MCP for side-by-side
3. Pick winners, ship as standalone commits (no PLAN.md ceremony)
4. Update UI-SPEC.md to reflect new locked tokens after the iteration settles

Reference docs when starting:

- `.planning/phases/02-post-prototype-polish-uat-acceptance/02-UI-SPEC.md` — current locked tokens + fallback ladder
- `.planning/codebase/ARCHITECTURE.md` §"Anti-Patterns" — keep CSS scoped per-component
- UI-SPEC Dim 4 + Dim 5 FLAGs for known debt landmines
