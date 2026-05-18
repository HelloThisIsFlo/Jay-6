# Codebase Concerns

**Analysis Date:** 2026-05-18

## Tech Debt

**setInterval timing (internal clock):**
- Issue: `setInterval` used as the 24 PPQ tick source — known to drift and fire late under CPU load
- Files: `src/tickSource.ts` (line 76), `src/clock.ts` (line 62)
- Impact: BPM drift at high tempos or under system load; latches like Rhythm Gate drift off-beat during long sessions
- Fix approach: Replace with Web Audio API `AudioContext` scheduler (lookahead scheduling). Explicitly deferred to Phase 3 backlog. The comment in `tickSource.ts` acknowledges this: "setInterval drift is acceptable at prototype-level"

**`subscribeTransport` plumbing exists but is wired to nothing:**
- Issue: `tickSource.subscribeTransport()` is implemented and emits 'start'/'stop'/'continue' from OP-1 clock events, but nothing in the app calls it
- Files: `src/tickSource.ts` (lines 54–58, 91–93, 115–117)
- Impact: Incoming OP-1 transport Start/Stop/Continue messages are silently dropped — engines don't react to OP-1 transport control
- Fix approach: Phase 2 open item — wire `host.ts` or `App.svelte` to call `tickSource.subscribeTransport()` and drive engine start/stop accordingly

**MIDI clock out not implemented:**
- Issue: 24 PPQ MIDI clock send from internal clock is absent despite the infrastructure being there
- Files: `src/midi.ts`, `src/tickSource.ts` — no `sendClock()` call anywhere
- Impact: Jay-6 cannot drive external gear tempo when used as master
- Fix approach: Phase 2 open item — on each internal tick, call `output.sendClock()` via WEBMIDI.js

**Voicing data: ~30% of chord slots inferred:**
- Issue: Two independent Roland page extractions diverged on note values for ~30% of the 1,200 chord slots. The more internally consistent run was shipped.
- Files: `src/banks.data.json` (1,200 chord entries)
- Impact: Some chord voicings may be incorrect vs. hardware J-6; could sound off on the OP-1 for certain banks
- Fix approach: Phase 2 open item — spot-check against Roland manual PDF or hardware reference. `test/banks.test.ts` anchors only bank 1 Cadd9 and bank 14 Oct Stack as known-good values.

**Chord type definition allows variable-length notes:**
- Issue: `Chord.notes` is typed `number[]` but the intent (per PLAN.md) was 4-note chords; Oct Stack banks use 2-note dyads, so the type was opened up. No minimum enforced in the type system.
- Files: `src/banks.ts` (line 11)
- Impact: Engines silently handle empty/short chords — not a crash risk, but unexpected short chords from bad voicing data will play without error

## Known Bugs

**Rhythm pattern phase alignment under external clock:**
- Symptoms: First step of a Rhythm Gate or Phrase Duration pattern fires immediately when engine.start() is called, regardless of where the OP-1 clock is in its bar. Under external clock the first hit lands off-beat.
- Files: `src/engines/rhythmGate.ts` (line 48), `src/engines/phraseDuration.ts` (line 28), `src/engines/arp.ts` (line 58)
- Trigger: Switch to Ext clock mode, start a rhythm engine — first hit fires immediately instead of aligning to the next tick-mod-24 boundary
- Workaround: Use Int clock, or accept the phase offset and restart manually

**Ext clock + incoming Start — no double-trigger guard:**
- Symptoms: If OP-1 sends a transport Start while already running in Ext mode, no deduplication exists. Engines could double-fire.
- Files: `src/tickSource.ts` (lines 91–93)
- Trigger: OP-1 Record button or transport restart while Jay-6 engine is mid-pattern
- Workaround: None — acknowledged in PLAN.md Phase 2 transport sync spec

## Security Considerations

**No backend — attack surface is essentially zero:**
- Risk: Static SPA, no server-side logic, no user data, no auth
- Files: `Dockerfile` (nginx:alpine serving `dist/`), `k8s.yaml`
- Current mitigation: App is read-only static assets. No API keys or secrets in source. GHCR push uses `secrets.GITHUB_TOKEN` (scoped to repo).
- Recommendations: None critical. Could add `Content-Security-Policy` headers in `nginx.conf` as defense-in-depth.

**Web MIDI permission prompt — no user-facing recovery path:**
- Risk: If the user dismisses the MIDI permission prompt, status becomes 'denied' and there is no retry button
- Files: `src/midi.ts` (lines 84–86), `src/components/TopBar.svelte` (lines 60–73)
- Current mitigation: Error text shown in Output dropdown ("Permission denied")
- Recommendations: Add a "Try again" / reload prompt for the 'denied' state

## Performance Bottlenecks

**TopBar channel dropdown reads `getMidiState()` directly on render:**
- Problem: `getMidiState().channel` is called on every render cycle in a non-reactive way — if channel changes externally the dropdown may not update
- Files: `src/components/TopBar.svelte` (line 95)
- Cause: `getMidiState()` returns a plain object snapshot, not a reactive value. `setChannel` does `notify()` which propagates to subscribers, but the `value={}` binding in the select calls `getMidiState()` at render time only
- Improvement path: Store selected channel in the same `$state` block as `midiStatus` / `selectedOutputId` inside `TopBar.svelte`, fed via the `subscribeMidi` callback

**`setInterval` jitter at high BPM:**
- Problem: At 240 BPM, tick interval = 10.4 ms — well within `setInterval` resolution but sensitive to main-thread blocking
- Files: `src/tickSource.ts` (line 76)
- Cause: Browser `setInterval` has ~4 ms minimum and suffers from task-queue pressure
- Improvement path: Web Audio scheduler (Phase 3). No short-term mitigation.

## Fragile Areas

**`engines/host.ts` — latch state machine:**
- Files: `src/engines/host.ts` (lines 61–99)
- Why fragile: Four interacting boolean flags (`heldPads`, `padNotes`, `playing`, `latchedKey`) tracking UI latch state in parallel with Svelte `$state` in `App.svelte`. Divergence between the two representations (e.g. latch toggled off while a ghost latchedKey remains) can cause notes to sustain or not release.
- Safe modification: Always update `latchedKey` in the host AND `latchedKey` in `App.svelte` together. Any latch refactor should trace all paths through `padPressed`, `padReleased`, `setLatch`, and `panic`.
- Test coverage: No unit tests for the host latch state machine — only manual/browser testing

**`RhythmGateEngine.evaluateStep()` — stepIndex float arithmetic:**
- Files: `src/engines/rhythmGate.ts` (line 89)
- Why fragile: `stepIndex = (this.tickCount / this.ticksPerStep) % 16` — integer division only holds if `tickCount` is always an exact multiple of `ticksPerStep` (6). Any off-by-one in tick counting (e.g. if a tick is dropped under external clock) will skip or duplicate a step boundary.
- Safe modification: Consider flooring: `Math.floor(this.tickCount / this.ticksPerStep) % 16`
- Test coverage: `test/phrases.test.ts` covers pattern parsing; rhythm engine step-counting is not directly unit-tested

**`midi.ts` manual subscription pattern (not reactive):**
- Files: `src/midi.ts` (lines 32–45)
- Why fragile: Plain `Set<Listener>` pub/sub instead of Svelte `$state`. If a component mounts before `initMidi()` resolves, it gets the 'idle' snapshot and must wait for a `notify()` call. The pattern works but is easy to misuse in future components — any new consumer must remember to call `subscribeMidi` and handle the immediate callback.
- Safe modification: New components should always subscribe inside `onMount` with proper cleanup (the `return unsub` pattern used in `TopBar.svelte`)

## Scaling Limits

**Single MIDI output / single channel:**
- Current capacity: One output port, one channel (1–16)
- Limit: Can't send different chord voices to different channels or split output across ports
- Scaling path: Not planned — backlog item at best

**Banks limited to Roland J-6 factory set:**
- Current capacity: 100 banks × 12 chords (hardcoded JSON)
- Limit: No user-defined banks, no import, no persistence
- Scaling path: Phase 3 backlog — preset save/recall

## Dependencies at Risk

**WEBMIDI.js v3 — Web MIDI API dependency:**
- Risk: Web MIDI is Chrome/Edge only. Safari and Firefox have no implementation timeline. WEBMIDI.js is a thin wrapper — if the underlying API changes, the wrapper must be updated.
- Impact: App is non-functional on Safari, Firefox, and stock iOS/iPadOS browsers
- Migration plan: No good alternative. iPad workaround: "Web MIDI Browser" (Yonemoto) app. Safari/Firefox: no path forward without a native host app.

## Missing Critical Features

**Transport sync (Phase 2 open):**
- Problem: Jay-6 engines don't react to incoming OP-1 Start/Stop/Continue messages
- Blocks: Using Jay-6 as a true MIDI slave — patterns don't start/stop with OP-1 transport
- Files to touch: `src/App.svelte`, `src/engines/host.ts`, `src/tickSource.ts`

**MIDI clock send (Phase 2 open):**
- Problem: Jay-6 cannot send clock to downstream devices
- Blocks: Using Jay-6 as MIDI master for other synths

**iPad `user-select: none` on TopBar (Phase 2 open):**
- Problem: Long-press on TopBar controls (dropdowns, buttons) triggers iOS text selection
- Files: `src/components/TopBar.svelte` — no `user-select: none` in any style block (only `PianoLayout.svelte` has it)
- Blocks: Clean iPad usage

## Test Coverage Gaps

**EngineHost latch state machine — not tested:**
- What's not tested: All paths through `padPressed`/`padReleased`/`setLatch`/`panic` in `src/engines/host.ts`
- Files: `src/engines/host.ts` — zero coverage in `test/`
- Risk: Latch regression could cause stuck notes silently
- Priority: High

**RhythmGateEngine tick counting — not tested:**
- What's not tested: Step boundary evaluation, gate release timing, setNotes mid-pattern behavior
- Files: `src/engines/rhythmGate.ts` — not covered in `test/`
- Risk: Off-by-one tick bugs in rhythm step evaluation go undetected
- Priority: Medium

**PhraseDurationEngine — not tested:**
- What's not tested: Tick countdown logic, fire/release cycle, setNotes behavior
- Files: `src/engines/phraseDuration.ts` — not covered in `test/`
- Risk: Phrase duration engine regressions undetected
- Priority: Medium

**MIDI state machine — not tested:**
- What's not tested: `initMidi` error paths, port hot-plug/unplug handling, channel setter validation
- Files: `src/midi.ts` — WEBMIDI.js mock would be required; currently out of scope per project convention
- Risk: Port disconnect during playback could leave stale IDs in state
- Priority: Low (browser smoke-test adequate per project convention)

---

*Concerns audit: 2026-05-18*
