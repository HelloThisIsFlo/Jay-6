---
created: 2026-05-23T18:25:56.994Z
title: Host-owned single source of truth for play/latch state
area: architecture
files:
  - src/engines/host.ts
  - src/App.svelte
  - src/state.svelte.ts
---

## Problem

Play/latch state currently has two homes:

- `engines/host.ts` — the audio truth (what's actually playing / latched).
- `App.svelte` — the visual truth (pad highlights), kept in sync **by hand**.

The two stores drift: the highlight says one thing while the audio does another. During Phase 02 UAT, 4+ desyncs were found and point-fixed, all tracing to this dual-store coupling:

- latch-off-while-held
- enable-latch-mid-hold
- Int-mode disconnect highlight
- hung note on output reconnect

The architecture diagram calls this the "dual-store fault line". Point-fixes unblocked v1 sign-off, but the bug *class* is still structurally present.

## Solution

Intent (not prescriptive — implementation decided when this is planned as a phase):

- Host owns a **single source of truth** for play/latch state.
- The UI becomes a **pure projection** — it reads host state and never re-derives the host's decision.
- State transitions are **unit-tested** (plain logic, no MIDI/DOM — fits the existing Vitest "data + math only" scope).

Outcome: the desync class becomes structurally impossible rather than patched case-by-case.

The Svelte 5 mechanism for how the UI subscribes/reads (events vs. observable snapshot, and where the reactive boundary sits relative to `DEC-state-location` / engines-stay-framework-agnostic) is a build-time decision — research the current Svelte best practice then.

**Target:** v2 / sequencer-adjacent.
