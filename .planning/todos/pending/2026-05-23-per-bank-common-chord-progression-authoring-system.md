---
created: 2026-05-23T18:25:56.994Z
title: Per-bank common chord-progression authoring system
area: general
files: []
---

## Problem

For each bank, it would be nice to show a list of common chord progressions to try — a quick "play these together" suggestion surfaced next to the pads.

## Solution

**Scope of this todo = the SYSTEM, not the content.**

Design a system that lets Flo author progressions in a plain, agent-editable file (markdown or YAML) and have them rendered nicely as progression bars in the UI:

- Author format: simple enough that Flo can quickly edit it with another agent (e.g. "add a ii-V-I to bank X").
- Display: progressions shown as bars in the UI, mapped to the relevant bank.

Flo will author the actual progression content **later** — this todo only covers building the authoring + display mechanism.

**Target:** v2+ / future feature.
