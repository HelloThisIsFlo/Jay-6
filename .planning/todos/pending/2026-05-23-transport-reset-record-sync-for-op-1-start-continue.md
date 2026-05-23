---
created: 2026-05-23T18:25:56.994Z
title: Transport-reset / record-sync for OP-1 Start/Continue
area: engines
files:
  - src/engines/host.ts
---

## Problem

The deferred D-04 feature (`armedPosition` consumer) currently exists only as a stub:

- The `armedPosition` 'resume' hook is wired in `host.ts` (added in 02-06), but **no engine reads it**.
- It was descoped to the v2 sequencer and now lives only in code comments + the decision log → at risk of being lost.

Hardware context (Flo's OP-1 observation): the OP-1 emits Start (0xFA) only from tape position 0, and Continue (0xFB) from mid-tape/loop. 02-06 already routes both through the arm path.

## Solution

Wire OP-1 transport Start/Continue to **reset the running engine to step 0**, so a manual record-start on the OP-1 syncs the arp/pattern to the take — including silence-leading patterns (e.g. RG4 V04) where alignment matters most.

**Target:** v2 / sequencer.
