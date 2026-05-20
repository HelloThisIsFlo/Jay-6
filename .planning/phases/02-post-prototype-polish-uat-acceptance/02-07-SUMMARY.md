---
phase: 02-post-prototype-polish-uat-acceptance
plan: 07
subsystem: ui
tags: [svelte, web-midi, latch, panic, lifecycle, hot-plug]

# Dependency graph
requires:
  - phase: 02-post-prototype-polish-uat-acceptance
    provides: "panic()/panicForModeSwitch()/onTransport() transport-sync wiring (02-06) that this plan funnels all cleanup through"
provides:
  - "Single clear-all path: host.panic() clears engine held-state + latch + sends note-offs, and signals the UI via an onPanic callback"
  - "App-side clearAllHighlights() registered through host.setOnPanic — every panic path (mode switch, transport stop, disconnect, unload) clears heldKeys + latchedKey"
  - "Ext→Int clock-source fallback when the selected MIDI input disconnects"
  - "pagehide/beforeunload → host.panic() so reload/close releases notes instead of hanging the synth"
affects: [uat-walkthrough, v2-sequencer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Host→UI cleanup callback: component-owned highlight state cleared via a host-registered onPanic hook so a single panic path drives both audio and UI"
    - "Window pagehide/beforeunload lifecycle hook for Web MIDI note-off-on-unload"

key-files:
  created: []
  modified:
    - src/engines/host.ts
    - src/App.svelte

key-decisions:
  - "Highlight state stays component-owned (DEC-state-location); host signals cleanup via onPanic callback rather than reaching into UI state"
  - "panic() clears ALL engine held-state (heldPads/padNotes/currentRawChord) so a physically-held key surviving a disconnect can't keep the engine logically held"
  - "Ext→Int fallback rides the existing subscribeMidi callback + mode-switch \$effect — no new disconnect listener, reuses midi.ts refreshPorts nulling selectedInputId"
  - "pagehide primary (mobile Safari / iOS Web MIDI Browser), beforeunload desktop fallback — both call the same idempotent panic()"

patterns-established:
  - "onPanic callback: every disruption funnels through host.panic(), which now both does engine cleanup and fires the UI-clear hook"

requirements-completed: [REQ-edge-cases, REQ-clock-receive]

# Metrics
duration: 3min
completed: 2026-05-20
---

# Phase 2 Plan 07: State cleanup on disruption Summary

**Single reliable clear-all path — host.panic() now wipes engine held-state + signals the UI to clear all pad highlights, wired to mode-switch, transport-stop, input-disconnect (Ext→Int fallback), and browser-unload so Jay-6 never leaves a stuck-lit pad or a hanging MIDI note.**

## Performance

- **Duration:** ~3 min
- **Completed:** 2026-05-20
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `panic()` is now a complete clear-all: stops engine, clears `playing`/`latchedKey`, clears `heldPads`/`padNotes`/`currentRawChord`, sends All Notes Off, and fires the UI clear hook.
- App registers `clearAllHighlights()` via `host.setOnPanic()` so every panic path (mode switch, transport stop, device disconnect, unload) clears `heldKeys` + `latchedKey` — not just user-pressed panic.
- Latch-off now clears held-pad highlights when nothing is physically down (fixes the lit-pad-after-latch-off manifestation of UAT test 16).
- Ext→Int fallback: disconnecting the selected input under Ext mode flips `clockSource` to internal (riding the mode-switch `$effect`, which panics to clear audio + highlights).
- `pagehide` + `beforeunload` listeners call `host.panic()` so a latched chord releases note-offs on reload/close instead of hanging on the synth (UAT test 6).

## Task Commits

Each task was committed atomically:

1. **Task 1: panic() complete clear-all + onPanic highlight clear** - `621d2cd` (feat)
2. **Task 2: Ext→Int fallback on input disconnect + unload-time panic** - `1dd20c0` (feat)

## Files Created/Modified
- `src/engines/host.ts` - `panic()` clears all engine held-state; new `setOnPanic()` registers a UI-clear hook fired at the end of every panic.
- `src/App.svelte` - `clearAllHighlights()` registered via `setOnPanic`; latch-off clears held highlights when no pad is down; `subscribeMidi` callback adds Ext→Int fallback; `pagehide`/`beforeunload` → `host.panic()`.

## Decisions Made
- Kept highlight state component-owned and used a host→UI callback (DEC-state-location respected) rather than moving latch/held state into the host.
- Reused the existing `subscribeMidi` callback + mode-switch `$effect` for the Ext→Int fallback instead of adding a separate disconnect listener — `midi.ts:refreshPorts` already nulls `selectedInputId` on disconnect, so the fallback is a pure read of that state.
- No change to `midi.ts`: `allNotesOff()` is already no-op-safe when the output is gone (`getChannel()` returns null early), so the disconnect-then-panic path is safe.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None. Both `just check` (0 errors / 0 warnings) and `just test` (45 passed) green after each task.

## Known Stubs
None. The `armedPosition` 'resume' branch noted in 02-06 remains a documented v2-sequencer consumer, unrelated to this plan; no new stubs introduced.

## Verification Status
- **Automated:** `just check` clean (207 files, 0 errors, 0 warnings); `just test` 45/45 pass. These changes are UI/MIDI side-effects, not data/math, so no new unit tests per DEC-tests-data-and-math-only.
- **Manual UAT re-verify gate (hardware, separate session) — NOT yet run:**
  - Test 6: latched chord sounding → browser reload → note stops on synth (no hang).
  - Test 16: latch on + rhythm playing → switch to Int → pads clear + audio stops + latch off.
  - Test 20: Ext + latched arp → disconnect input → no crash, pad clears, mode falls back to Int.

## Next Phase Readiness
- Disruption-cleanup gap cluster (UAT tests 6, 16, 20) closed in code; awaits hardware UAT re-verify to formally sign off REQ-edge-cases.
- No blockers introduced. Latch state machine remains the flagged-fragile area (CONCERNS.md) — this plan added cleanup paths but did not refactor the four parallel booleans.

---
*Phase: 02-post-prototype-polish-uat-acceptance*
*Completed: 2026-05-20*
