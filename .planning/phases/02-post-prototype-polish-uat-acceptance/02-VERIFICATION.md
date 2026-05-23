---
phase: 02-post-prototype-polish-uat-acceptance
scope: gap-closure (plans 02-06..02-09 only; 02-01..02-05 verified + shipped earlier)
verified: 2026-05-20T19:44:34Z
human_verified: 2026-05-23
status: verified
verdict: PASS
score: 12/12 code-side must-haves verified + 11/11 hardware/touch UAT passed
overrides_applied: 0
manual_uat_result: "PASS — UAT re-verify 11/11 on hardware (OP-1 over USB MIDI + iPad/iPhone) on 2026-05-23; all 9 human_verification items below confirmed. Closes the human-verification list; verdict upgraded PASS-PENDING-MANUAL-UAT → PASS."
gates:
  just_check: "PASS — 207 files, 0 errors, 0 warnings"
  just_test: "PASS — 45/45 (incl. 3 new tickSource Int-leak + ticksUntilDownbeatFrom bar-alignment)"
human_verification:
  - test: "UAT 11 / 16 step 1-2 — Ext clock downbeat alignment"
    expected: "Under Ext clock, rhythm/arp/phrase first note-on lands on the OP-1's bar downbeat (offset approx 0, not +278ms)"
    why_human: "Requires OP-1 over USB MIDI + MIDI-monitor timing capture; cannot measure note-on offset programmatically"
  - test: "UAT 16 step 4 — TRANSPORT-IN on OP-1 Play"
    expected: "Pressing Play on the OP-1 logs `TRANSPORT-IN continue` in the browser console and arms/aligns the engines"
    why_human: "OP-1 emits Continue on Play; only real hardware confirms the byte reaches onTransport"
  - test: "UAT 16 Int-leak acceptance — flip to Int under live Ext"
    expected: "With rhythm running under Ext, switch Clock to Int, then change OP-1 tempo: Jay-6 must NOT follow the OP-1 anymore (internal clock only)"
    why_human: "Hardware counterpart to the test/tickSource.test.ts regression; needs a live OP-1 tempo change"
  - test: "UAT 6 — hanging-note on browser reload"
    expected: "Latched chord sounding, reload the browser tab: the note stops on the synth (no hang)"
    why_human: "Requires a sounding synth + real browser unload; WebMidi teardown timing not observable in unit tests"
  - test: "UAT 20 — Ext input hot-unplug fallback"
    expected: "Ext + latched arp, disconnect the MIDI input: no crash, pad clears, mode falls back to Int"
    why_human: "Requires physically unplugging a MIDI device mid-session"
  - test: "UAT 4 — pad release-edge race"
    expected: "Rapid press -> drag-off -> release x10: never a stuck-lit pad, never a hanging note"
    why_human: "Pointer-capture/cancel race is timing-dependent on a real pointer device; not unit-testable per DEC-tests-data-and-math-only"
  - test: "UAT 14 / 15 — Space + arrow keys do not scroll"
    expected: "With the app (not a form field) focused, Space/Left/Right/Up/Down do not scroll the page"
    why_human: "Browser scroll default is a live-DOM behavior; verified by eye in the running app"
  - test: "UAT 10 — 'Beat' label"
    expected: "Style selector reads 'Beat (Style 3)'"
    why_human: "Code + docs confirmed 'Beat'; visual confirmation in the running selector is the UAT sign-off (low-risk, code-verified)"
  - test: "UAT 19 — iPhone double-tap selection + landscape reachability"
    expected: "iPhone double-tap selects no text on pads/labels; landscape can scroll to reach the keys"
    why_human: "Requires a real iPhone in the Web MIDI Browser app; -webkit-touch-callout + max-height:480px override are device-specific"
---

# Phase 2 Gap-Closure (02-06..02-09) Verification Report

**Phase Goal (gap-closure subset):** Close the four UAT-surfaced gap clusters in code — Ext-clock transport sync (tests 11, 16), state-cleanup-on-disruption (tests 6, 16, 20), pad release-edge race + keyboard preventDefault (tests 4, 14, 15), and the 'Beat' rename + iOS/landscape polish (tests 10, 19) — leaving only hardware/touch acceptance for the UAT re-run.
**Verified:** 2026-05-20T19:44:34Z
**Verdict:** PASS _(upgraded from PASS-PENDING-MANUAL-UAT)_
**Re-verification:** No — initial verification of the gap-closure run.
**Manual UAT closed:** 2026-05-23 — UAT re-verify ran **11/11 PASS** on hardware (OP-1 over USB MIDI + iPad/iPhone in Web MIDI Browser). All 9 `human_verification` items below confirmed. Code-side PASS + hardware/touch PASS ⇒ full PASS.

## Verdict Rationale

All twelve code-side must-have truths across the four gap plans are verified in the merged source (not just the SUMMARYs). `just check` and `just test` are both green. Every remaining open item is a hardware (OP-1 MIDI clock / hot-plug) or touch-device (iPhone/iPad) acceptance check that the plans explicitly gated to the UAT re-run — these are **code shipped, awaiting hardware sign-off**, not incomplete work. No regressions, no debt markers, no stubs. Status is `human_needed` (the only valid status when a human-verification list is non-empty); the corresponding human-readable verdict is **PASS-PENDING-MANUAL-UAT**.

## Goal Achievement — Observable Truths

### Plan 02-06 — Ext-clock transport sync

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Ext first audible step lands on OP-1's absolute bar downbeat, not a local quarter after pad-press | VERIFIED | `clock.ts:74` `ticksUntilDownbeatFrom`; all 3 engines arm via `ticksUntilDownbeatFrom(tickSource.getExternalTick())` (`rhythmGate.ts:57`, `arp.ts:62`, `phraseDuration.ts:34`) |
| 2 | OP-1 Continue (0xFB) treated as a valid arm/align trigger, not a no-op | VERIFIED | `host.ts:213` `if (kind === 'start' \|\| kind === 'continue')` shared arm path + `tickSource.resetExternalTick()` (`host.ts:225`) |
| 3 | Inbound transport produces a TRANSPORT-IN trace independent of engine subscription timing | VERIFIED | `host.ts:211` `console.debug('TRANSPORT-IN', kind)`; `tickSource.setMode('external')` attaches listeners eagerly (`tickSource.ts:44`), kept bound after last engine unsubscribes (`tickSource.ts:96`) |
| 4 | After flip to Int, no inbound clock/transport reaches engines (test-16 Int-leak) | VERIFIED | `detachInputListener` removes all four listeners (`tickSource.ts:146`); `externalTick` only advances under Ext (`tickSource.ts:155-161`); locked by `test/tickSource.test.ts` Cases A-C (3 tests pass) |

### Plan 02-07 — State cleanup on disruption

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | Any disruption clears latch + ALL highlights + sends note-offs (never stuck-on) | VERIFIED | `panic()` clears playing/latchedKey/heldPads/padNotes/currentRawChord + allNotesOff() + onPanic (`host.ts:127-139`); `App.clearAllHighlights` registered via `setOnPanic` (`App.svelte:70-74`); fires on mode-switch, transport-stop, disconnect, unload |
| 6 | Input disconnect under Ext falls back to Int (not stuck on Ext with no input) | VERIFIED | `App.svelte:48-58` subscribeMidi callback: `if (ui.clockSource === 'external' && inputGone) setClockSource('internal')`, riding mode-switch `$effect` panic |
| 7 | Browser reload while sounding sends note-offs (no hung synth) | VERIFIED | `App.svelte:165` `onUnload = () => host.panic()`; `pagehide` + `beforeunload` registered (`App.svelte:172-173`) |

### Plan 02-08 — Pad release-edge race + keyboard preventDefault

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | Releasing a pad on any pointer-end path (incl. cancel/lost-capture race) clears state + emits note-off, no double-fire | VERIFIED | `PianoLayout.svelte:55-62` idempotent `endPress` gated on captured pointerId; `onpointerup`/`onpointercancel`/`onlostpointercapture` wired on both black + white pads (`:73-76`, `:90-93`) |
| 9 | Space + arrow keys do not scroll the page when app-focused | VERIFIED | `App.svelte:170` keydown registered `{ passive: false }`; `preventDefault` on Space (`:141`), Left/Right (`:133-134`), and unbound Up/Down (`:138`) |

### Plan 02-09 — 'Beat' rename + iOS/landscape polish

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 10 | Style selector + MANUAL + README read 'Beat' (not 'Phrase Dur') | VERIFIED | `state.svelte.ts:18` `phraseDur: 'Beat (Style 3)'`; `MANUAL.md:150` `## Beat`; `README.md:11` `Beat`; grep finds no user-facing 'Phrase Dur'/'Phrase Duration' in those files (internal `phraseDur` key intentionally retained) |
| 11 | iPad/iPhone long-press/double-tap does not select text on any surface | VERIFIED | `App.svelte:205-207` app-wide `user-select:none` + `-webkit-touch-callout:none` on `<main>`, inputs re-enabled (`:210-214`); `.pad` + `.pad .key`/`.pad .name` covered (`PianoLayout.svelte:136-146`) |
| 12 | iPhone landscape keyboard reachable (no longer trapped off-screen) | VERIFIED | `App.svelte:246-253` `@media (...) and (max-height:480px)` restores `overflow-y:auto; position:static; height:auto`, retaining `overscroll-behavior:none` |

**Score:** 12/12 code-side must-haves verified.

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/clock.ts` | `ticksUntilDownbeatFrom` + `TICKS_PER_BAR` | VERIFIED | `:65` `TICKS_PER_BAR=96`, `:74` pure helper, modulo-correct for negatives |
| `src/tickSource.ts` | `getExternalTick`/`resetExternalTick`, Ext-only increment, full detach on Int | VERIFIED | `:48-54`, `:155-161`, `:146-149` |
| `src/engines/{rhythmGate,arp,phraseDuration}.ts` | Ext first-fire from absolute tick | VERIFIED | all import + call `ticksUntilDownbeatFrom(tickSource.getExternalTick())` |
| `src/engines/host.ts` | Continue arm path, panic clear-all, setOnPanic, TRANSPORT-IN | VERIFIED | `:122-139`, `:207-230` |
| `src/App.svelte` | onPanic wiring, Ext->Int fallback, unload panic, passive:false, Up/Down preventDefault, app-wide user-select, landscape relax | VERIFIED | all present (lines cited above) |
| `src/components/PianoLayout.svelte` | idempotent endPress + cancel/lost-capture, user-select on pads | VERIFIED | `:45-62`, `:73-76`, `:90-93`, `:136-146` |
| `src/state.svelte.ts` | `STYLE_LABELS.phraseDur === 'Beat (Style 3)'` | VERIFIED | `:18` |
| `test/clock.test.ts` | `ticksUntilDownbeatFrom` cases | VERIFIED | `:88-106`, all assertions from plan present + passing |
| `test/tickSource.test.ts` | Int-leak Cases A/B/C | VERIFIED (created) | `:69-130`, 3 tests pass |

## Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| rhythmGate/arp/phraseDuration | tickSource | `getExternalTick()` at start() under Ext | WIRED |
| host.onTransport('continue') | tickSource | `resetExternalTick()` | WIRED |
| tickSource.setMode('internal') | webmidi listeners | `detachInputListener()` removes all four | WIRED (proven by regression test) |
| App.svelte | host.ts | `pagehide`/`beforeunload` -> `host.panic()` | WIRED |
| App.svelte | state.svelte | input-disconnect effect -> `setClockSource('internal')` | WIRED |
| host.panic() | App highlight clear | `onPanic` callback via `setOnPanic` | WIRED |
| PianoLayout end-paths | App release(key) | every pointer-end -> `onRelease` (idempotent) | WIRED |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Typecheck/lint clean | `just check` | 207 files, 0 errors, 0 warnings | PASS |
| Full test suite | `just test` | 45/45 passed (5 files) | PASS |
| `ticksUntilDownbeatFrom` math | `test/clock.test.ts` | boundary + mid-bar cases pass | PASS |
| Int-leak regression | `test/tickSource.test.ts` | Cases A/B/C pass (detach, no stale sub, clean re-flip) | PASS |
| MIDI behavior on hardware | n/a | Requires OP-1 / iPhone | SKIP -> human (see list) |

## Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
|-------------|------------|--------|----------|
| REQ-rhythm-phase-alignment-ext-clock | 02-06 | SATISFIED (code) | absolute-bar arming across 3 engines + unit tests |
| REQ-clock-receive | 02-06, 02-07 | SATISFIED (code) | Ext listener attach/detach + Ext->Int fallback |
| REQ-clock-send-transport-sync | 02-06 | SATISFIED (code) | Continue+Start arm; Stop->panic; outbound gated to Int (host.ts:240-248) |
| REQ-edge-cases | 02-07 | SATISFIED (code) | single clear-all path + unload panic + hot-plug fallback (hardware UAT pending) |
| REQ-chord-pad-ui | 02-08 | SATISFIED (code) | idempotent release on all pointer-end paths |
| REQ-keyboard-shortcuts | 02-08 | SATISFIED (code) | non-passive listener + preventDefault on all app keys |
| REQ-ipad-polish | 02-09 | SATISFIED (code) | app-wide selection suppression + landscape scroll relax (device UAT pending) |
| REQ-style-selector | 02-09 | SATISFIED (code) | 'Beat (Style 3)' label live |

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/engines/host.ts` | 211 | `console.debug('TRANSPORT-IN', kind)` | Info | Intentional, documented UAT instrumentation; `console.debug` (not `console.log`) so it stays out of the default prod console. Tracked-removal follow-up recorded in 02-06-SUMMARY Task 5, to be deleted after UAT 16 step 4 hardware re-verify. Not a blocker. |

No `console.log`, `J6DBG`, `FIXME`, `XXX`, `TBD`, `TODO`, `HACK`, or `PLACEHOLDER` markers in `src/`. No stubs introduced. The `armedPosition === 'resume'` branch remains a documented v2-sequencer consumer (pre-existing, out of scope).

## Notable Observations (non-blocking)

- **REQUIREMENTS.md staleness:** `REQ-style-selector` description (line 34) still reads "Phrase Dur". 02-09 scoped the rename to the UI label + MANUAL + README (all done); the requirement-spec wording is an internal phase doc, not user-facing. Cosmetic doc-staleness, not a gap.
- **ROADMAP plan checkboxes:** 02-06..02-09 are still shown unchecked (`[ ]`) in ROADMAP.md line 50-53 and STATE.md reports `completed_plans: 5`. Bookkeeping lag — the work is committed and verified. Orchestrator/`/gsd:progress` should update these on close.
- **`emitTick` increments `externalTick` before notifying listeners** (`tickSource.ts:155-162`), so an engine reading `getExternalTick()` inside a clock callback sees the post-increment value. The engines only read it once at `start()` (before subscribing on the same tick), so the off-by-one does not affect first-fire alignment. Worth a hardware confirm during UAT 11 (already in the manual list).

## Human Verification — CLOSED (UAT 11/11 PASS, 2026-05-23)

✅ **All items below were confirmed on hardware/touch during the UAT re-verify on 2026-05-23 (11/11 PASS).** They are retained for the record; none remain open. See the `human_verification` frontmatter for the structured checklist. Summary:

1. **UAT 11 / 16 (Ext downbeat alignment)** — OP-1 over MIDI: note-ons land on the downbeat (offset approx 0, not +278ms).
2. **UAT 16 step 4 (TRANSPORT-IN)** — OP-1 Play logs `TRANSPORT-IN continue` and arms engines.
3. **UAT 16 (Int-leak)** — flip to Int under live Ext, change OP-1 tempo: Jay-6 must not follow.
4. **UAT 6 (reload)** — latched chord, reload tab: note stops (no hang).
5. **UAT 20 (hot-unplug)** — disconnect Ext input: no crash, pad clears, falls back to Int.
6. **UAT 4 (release race)** — rapid press/drag-off/release x10: no stuck pad, no hanging note.
7. **UAT 14 / 15 (key scroll)** — Space + arrows don't scroll the page.
8. **UAT 10 ('Beat' label)** — selector reads 'Beat (Style 3)' (code-verified; low-risk visual confirm).
9. **UAT 19 (iPhone)** — double-tap selects no text; landscape reaches the keys.

After UAT 16 step 4 passes, perform 02-06 Task 5: remove the `TRANSPORT-IN` `console.debug` from `host.ts:211`.

## Gaps Summary

No code-side gaps. All four gap-closure plans delivered the claimed fixes in the merged code, both quality gates are green (`just check` 0/0, `just test` 45/45), and no regressions or debt markers were introduced. The phase gap-closure goal is achieved at the verifiable (code) bar; final acceptance is gated to the hardware/touch UAT re-run per the plans' explicit design.

---

_Verified: 2026-05-20T19:44:34Z_
_Verifier: Claude (gsd-verifier)_
