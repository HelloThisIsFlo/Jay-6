---
created: 2026-07-29T17:22:09.941Z
title: Cycle variations with up/down keyboard shortcuts
area: ui
resolves_phase: 5
files:
  - src/App.svelte
  - src/state.svelte.ts
  - MANUAL.md
---

## Problem

ArrowUp and ArrowDown are deliberately swallowed to prevent page scrolling but
perform no action. The old UAT polish backlog proposed using them to cycle the
current style's variations, which would complete the keyboard performance
controls without changing existing left/right bank navigation.

## Solution

Bind ArrowUp and ArrowDown to previous/next variation with wraparound for styles
that have variations. Keep them inert for Hold, preserve scroll suppression, and
document the shortcut alongside the existing keyboard controls.
