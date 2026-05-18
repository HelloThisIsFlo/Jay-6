# Phase 2: Post-prototype polish + UAT acceptance - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the remaining open Phase 2 items and walk `.research/UAT.md` end-to-end so v1 ships. Concretely:

- **Bidirectional MIDI transport sync** under the standard master/slave convention (clock send when Int, Start/Stop/Continue receive when Ext, OP-1 Record treated as Start).
- **Rhythm phase alignment under external clock** — first step lands on a downbeat (`tick % 24 == 0`).
- **iPad polish** — full touch ergonomics pass (mechanical CSS fixes + visual touch feedback) with `/gsd:ui-phase 2` producing a design contract first.
- **User manual** — `MANUAL.md` at repo root (new deliverable, see Decisions).
- **UAT walkthrough** — `.research/UAT.md` end-to-end via `uat-agent` skill, run in verify-phase as the v1 close gate.

**Voicing audit was completed pre-phase** (3-source reconciliation: Roland + stonefruit + Jay-6 all agree on 1200/1200 slots). `REQ-voicing-second-pass-audit` is satisfied; planner picks up only the commit + a UAT spot-check.

**Out of phase scope (explicitly):** sequencer (v2), Web Audio scheduler, presets, persistence, additional banks, velocity, multi-output routing.

</domain>

<decisions>
## Implementation Decisions

### Transport sync (REQ-clock-send-transport-sync)

- **D-01: Standard MIDI master/slave convention.** Follow the protocol used by Ableton / Logic / drum-machines so Jay-6 behaves predictably when chained with the OP-1 or any other gear.
- **D-02: Clock send = always-on when Int.** Free-running 24 PPQ as soon as Int clock is active, even when no engine is playing. Stops the moment user switches to Ext.
- **D-03: Mode switch Int↔Ext mid-playback = hard stop.** Switching the toggle fires `panic()` (all notes off), stops the active engine, clears latch. User restarts manually. Zero edge cases, cleanest semantics.
- **D-04: Transport receive (Ext mode) = "hybrid" model** — chord-pad as live instrument, not as step-sequencer:
  - `Start` (`0xFA`) → engines arm, rhythm-engine pattern position reset to 0
  - Pad presses fire **immediately** on press (live-instrument behavior preserved from Phase 1)
  - Rhythm-driven engines (Arp / Phrase Dur / Rhythm Gate) anchor their step counter to incoming Clock so steps land on the external grid
  - `Stop` (`0xFC`) → stop engine, all notes off
  - `Continue` (`0xFB`) → resume from saved pattern position
  - OP-1 Record = treated identically to `Start`
- **D-05: Double-trigger guard.** Ignore an incoming `Start` if one was received within the last 200ms — prevents OP-1 Record + Start chatter from double-firing.

### Rhythm phase alignment (REQ-rhythm-phase-alignment-ext-clock)

- **D-06: First step anchors to `tick % 24 == 0`.** Engine.start() under Ext clock does not fire immediately; it waits for the next downbeat boundary. Applies to `RhythmGateEngine`, `PhraseDurationEngine`, `ArpEngine`.
- **D-07: Int-mode behavior unchanged.** Existing "fires on press, no alignment wait" preserved when Jay-6 owns the clock (Phase 1 live-feel preserved).

### iPad polish (REQ-ipad-polish)

- **D-08: Full ergonomics pass** — not a minimal `user-select:none` patch. Concretely:
  - `user-select: none` on TopBar + dropdowns (parity with PianoLayout)
  - `touch-action: manipulation` on all interactive controls (kills 300ms tap delay + double-tap zoom)
  - 44pt minimum tap target sizes (Apple HIG)
  - Body scroll prevention (lock viewport on iPad)
  - Active-state visual feedback for taps (touch substitute for `:hover`)
- **D-09: Run `/gsd:ui-phase 2` BEFORE `/gsd:plan-phase 2`.** Generates UI-SPEC.md design contract that planner consumes. Roadmap already flags "UI hint: yes".
- **D-10: Black-key visibility on dark background → UI phase decides options.** Currently low-contrast; UI phase generates option set and picks. Captured as part of D-09 scope.

### User manual (NEW: REQ-user-manual)

- **D-11: New Phase 2 deliverable.** Phase is "shipped" once the manual is clear enough for someone to use Jay-6 without source-code-spelunking.
- **D-12: Location + format.** Single `MANUAL.md` at repo root. Linked from `README.md` + `CURRENT-STATE.md`. Plain markdown — renders on GitHub, no build step.
- **D-13: Tone.** Consumer-product manual ("better than Roland's terrible one"). Explains **how to use**, not how it works internally. Designed to grow with future milestones (sequencer in v2 adds its own section without rewriting the existing structure).
- **D-14: Sections** (in this order):
  1. **Setup** (short) — Chrome/Edge requirement, HTTPS vs the .dev/.ai URLs, MIDI permission prompt, picking Output/Input/Channel
  2. **Pads + chords** — 100 banks, transpose (`±`/Z/X), latch (button/Space), Ableton-style keyboard mapping (A/W/S/E/...)
  3. **Styles** — Hold / Arp 1 / Arp 2 / Phrase Dur / Rhythm Gate 4+5; what each variation does; when to use which
  4. **Clock + transport sync** — Int vs Ext; BPM; chaining OP-1 as master or slave; what Start/Stop/Continue/Record do; iPad workflow under Web MIDI Browser

### UAT walkthrough (REQ-uat-walkthrough)

- **D-15: UAT runs in verify-phase as the v1 close gate.** Single final walkthrough, not interleaved. Standard `/gsd:verify-work` flow handles the loop (walk → log gaps → fix → re-walk affected sections → retry close).
- **D-16: REQ-gate-slider + REQ-edge-cases are verified during UAT.** No separate work item — they're checklist items inside `.research/UAT.md`.

### Voicing audit (REQ-voicing-second-pass-audit) — DONE PRE-PHASE

- **D-17: Reconciliation complete.** 3-source cross-check (Roland official + stonefruit third-party + Jay-6 current) using two independent sub-agents. 293 slots auto-patched where Roland + stonefruit agree on the correct notes (Jay-6 was wrong). Post-fix re-audit: Roland 1200/1200 clean, stonefruit 1198/1200 clean (2 residuals are cosmetic whitespace in chord names — notes identical).
- **D-18: Planner picks up only the commit + a UAT spot-check.** No further audit work.
- **D-19: Test anchor extension.** `test/banks.test.ts` currently anchors bank-1 Cadd9 + bank-14 Oct Stack only. Phase 2 should extend with 3–5 additional high-confidence reconciled slots (planner decides which).

### Claude's Discretion

- **Black-key visibility palette** — UI phase generates options + picks (D-10).
- **Which 3–5 reconciled slots become test anchors** (D-19).
- **Exact wording / layout of MANUAL.md** within the D-13/D-14 constraints.
- **Code structure for transport sync wiring** — `App.svelte` $effect bridge vs `host.ts` extension vs new `transport.ts` module is a planner/researcher decision (must respect DEC-engines-time-source-agnostic + DEC-engine-orchestrator).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project + scope
- `.planning/PROJECT.md` — core value, constraints, locked decisions (DEC-*)
- `.planning/REQUIREMENTS.md` — REQ-IDs for Phase 2 scope
- `.planning/ROADMAP.md` §"Phase 2" — goal + success criteria
- `.planning/STATE.md` — current position
- `CURRENT-STATE.md` — convention summary + architecture-in-a-paragraph
- `.research/PLAN.md` — original prototype plan + decision log
- `.research/UAT.md` — feature-by-feature acceptance checklist (v1 close gate)

### Codebase intel
- `.planning/codebase/ARCHITECTURE.md` — system diagram + layer responsibilities (read before touching `host.ts` or `tickSource.ts`)
- `.planning/codebase/CONCERNS.md` — bug catalog including the exact files + line numbers for rhythm phase alignment, transport sync wiring gap, double-trigger guard
- `.planning/codebase/INTEGRATIONS.md` — Web MIDI / WEBMIDI.js v3 / OP-1 details + deployment topology
- `.planning/codebase/CONVENTIONS.md` — comment style, tick-source rules, state-location rules
- `.planning/codebase/STACK.md` + `.planning/codebase/STRUCTURE.md` + `.planning/codebase/TESTING.md` — supporting context

### MIDI external references
- WEBMIDI.js v3 docs: https://webmidijs.org/docs/ — `Output.sendClock()`, `Output.sendStart()`/`sendStop()`/`sendContinue()`, `Input` clock event subscribe
- Roland J-6 chord HTML (now reconciled into `src/banks.data.json`): https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- Roland J-6 phrase HTML: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Stonefruit third-party J-6 extraction (used for cross-check, not as source of truth): https://stonefruit.github.io/j6/

### Voicing reconciliation artifacts (pre-phase audit, archive for traceability)
- `/tmp/voicing-reaudit-roland.md` — final clean Roland audit (1200/1200)
- `/tmp/voicing-reaudit-stonefruit.md` — final stonefruit audit (1198/1200, 2 cosmetic)
- (Move into `.planning/phases/02-.../` if a permanent record is wanted — planner's call)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`src/tickSource.ts` `subscribeTransport()`** — Already implemented, emits `'start'`/`'stop'`/`'continue'` from incoming MIDI clock events (lines 54–58, 91–93, 115–117). Nothing wires it yet. Phase 2 wiring is the work.
- **`src/tickSource.ts` `setMode('internal' | 'external')`** — Hot-swap between internal `setInterval` and external MIDI clock listener already works (proven in Phase 2 already-done items REQ-clock-receive).
- **WEBMIDI.js v3 `Output`** — Already imported in `src/midi.ts`. Has `sendClock()`, `sendStart()`, `sendStop()`, `sendContinue()` ready to call.
- **`src/engines/host.ts` `panic()`** — Existing all-notes-off + clear state. Reusable for D-03 (mode switch hard stop).
- **`PianoLayout.svelte` `user-select: none`** — Existing pattern in the codebase; mirror to TopBar (D-08).

### Established Patterns

- **DEC-engines-time-source-agnostic** — Engines never own timers. Transport sync wiring must subscribe to `tickSource`, not create new timers.
- **DEC-engine-orchestrator** — All pad routing + latch + transpose go through `engines/host.ts`. Transport semantics (arm-on-Start, hard-stop-on-mode-switch) belong here or in a thin layer above, NOT inside individual engine classes.
- **DEC-state-location** — Reactive state in `src/state.svelte.ts` (`$state` runes); `App.svelte` bridges via `$effect`. Any new transport-related UI state follows the same pattern.
- **DEC-banks-data-json-canonical** — Voicing fixes are JSON edits, never code. (Already honored in pre-phase reconciliation.)
- **DEC-tests-data-and-math-only** — Vitest covers `clock.ts`, `phrases.ts`, `banks.ts` math. Transport-sync logic should be split so the pure-math part (e.g., "next downbeat = `Math.ceil((tickCount+1) / 24) * 24`") is unit-testable, while the MIDI-wiring part is browser-tested in UAT.

### Integration Points

- **`src/App.svelte`** — Single `$effect` bridge layer. Likely receives the new transport-subscription wiring (call `tickSource.subscribeTransport(handler)` on mount; handler routes to host).
- **`src/engines/host.ts`** — Already orchestrates engine lifecycle. Best home for `arm()`, `resume()`, `armedPosition` state, double-trigger guard timestamp.
- **`src/components/TopBar.svelte`** — Receives `user-select: none`, `touch-action`, tap-target sizing fixes. UI phase produces design contract for visual changes (black-key contrast + active-state feedback).
- **`src/tickSource.ts`** — Add `sendClock()` call on each internal tick when mode is internal AND clock-send-active. Add `sendStart()`/`sendStop()` on engine lifecycle (called from host).

### Fragile Areas (CONCERNS.md callouts to handle with care)

- **`engines/host.ts` latch state machine** — Four interacting flags (`heldPads`, `padNotes`, `playing`, `latchedKey`). Any transport-sync change that touches engine start/stop paths must trace through `padPressed`, `padReleased`, `setLatch`, `panic`. No unit tests; manual/UAT only.
- **`RhythmGateEngine.evaluateStep()` stepIndex float math** — `(tickCount / ticksPerStep) % 16`. The rhythm-phase-alignment fix should consider `Math.floor(...)` and verify under-tick-drop scenarios.

</code_context>

<specifics>
## Specific Ideas

- **Manual must be better than the Roland J-6 manual.** Roland's is the explicit anti-reference — terse, internals-leaking, weak structure. Jay-6's MANUAL.md should read like a consumer-product manual (Teenage Engineering / pocket-operator style is a good aesthetic anchor).
- **Cosmetic whitespace residuals from voicing audit** (`"D#dim7"` vs `"D# dim7"` in bank 2) are intentional in stonefruit; Jay-6 keeps no-space form. Do NOT "fix" — notes are identical, format consistency wins.
- **3-source agreement methodology** worked well for the voicing audit. Pattern worth reusing for any future data extraction (sequencer pattern data in v2, etc.): scrape from N>=2 independent sources, only auto-trust slots where all sources agree, flag the rest for human review.

</specifics>

<deferred>
## Deferred Ideas

- **In-app help overlay** — a `?` button in TopBar opening a MANUAL.md excerpt as a modal. Considered, deferred. Static MANUAL.md at repo root is enough for v1; in-app help is a Phase 3+ UX upgrade.
- **Strict "step sequencer" transport mode** (where pad press during Ext waits for next downbeat instead of firing immediately). Considered, rejected for v1 in favor of "live instrument" hybrid model. User can revisit in a future update if the live-feel isn't right.
- **Sub-agent voicing-audit pattern as a reusable skill** — current pre-phase work was bespoke. Could become `j6-voicing-cross-check` skill if a similar audit is needed for v2 sequencer data. Not now.

</deferred>

---

*Phase: 2-post-prototype-polish-uat-acceptance*
*Context gathered: 2026-05-18*
