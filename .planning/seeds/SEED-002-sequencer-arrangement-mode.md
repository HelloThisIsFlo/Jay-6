---
id: SEED-002
status: dormant
planted: 2026-08-23
planted_during: v2.0 Phase 4
trigger_when: when Jay-6 deliberately expands from live instrument into composition and arrangement
scope: large
---

# SEED-002: Sequencer and arrangement mode

## Why This Matters

A sequencer could turn chord-pad ideas into editable arrangements, but it would materially change Jay-6 from a focused live instrument into a composition tool. That product decision should happen before implementation.

## When to Surface

**Trigger:** A future milestone explicitly targets sequencing, arrangement, or song construction.

## Scope Estimate

**Large:** Requires product discovery and likely multiple phases.

Potential surface:

- Chord-pad step grid
- Pattern chaining
- Basic song mode
- Strict sequencer transport mode

## Breadcrumbs

- .planning/PROJECT.md
- .planning/todos/pending/2026-05-23-host-owned-single-source-of-truth-for-play-latch-state.md
- .planning/todos/pending/2026-05-23-transport-reset-record-sync-for-op-1-start-continue.md
- .research/archive/2026-07-29-pre-v2-work-inventory.md

## Notes

Host-owned playback state and OP-1 transport reset may become prerequisites. Keep sequencing outside the current read-only musical-companion contract.
