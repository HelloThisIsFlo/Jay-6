---
status: complete
phase: 02-post-prototype-polish-uat-acceptance
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, .research/UAT.md]
started: 2026-05-18T22:13:39Z
updated: 2026-05-19T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running vite. Hard-reload the page (Cmd-Shift-R) so no warm state survives.
  `just dev` boots without errors; app loads at localhost:5173; defaults visible
  (Bank 1 Cadd9, Style Hold, BPM 110, latch off); no console errors.
result: pass
note: |
  WEBMIDI.js console advisory (library-internal, not actionable):
  "Web MIDI will ask a permission to use even if the sysex is not specified
  in the MIDIOptions" — Chrome deprecation flag in webmidi.js?v=592898d6:7373.
  Not a Jay-6 bug. Track upstream webmidi.js release for fix.

### 2. Connectivity
expected: |
  Setup: OP-1 plugged in via USB, Chrome/Edge at localhost.
  - OP-1 appears in Output dropdown
  - Channel dropdown lists 1–16; switching to a channel OP-1 doesn't listen on kills sound, switching back restores it
  - OP-1 appears in Input dropdown
result: pass
note: |
  Tested with OP-1 over Bluetooth MIDI (not USB) — substitutes cleanly.
  Output auto-selects "OP1 Bluetooth"; Input defaults to "none" (acceptable
  default, device available when selected). Channel switching kills/restores
  sound as expected; channel on OP-1 must match channel in Jay-6 dropdown.

### 3. Bank Navigation
expected: |
  - All 100 banks reachable via Bank dropdown
  - `‹` / `›` buttons step ±1
  - `←` / `→` keys step ±1
  - Wrap-around: Bank 100 `›` → Bank 1; Bank 1 `‹` → Bank 100
result: pass
note: All 100 banks walked end-to-end; wrap Bank 100 → Bank 1 confirmed.

### 4. Chord Pads
expected: |
  Bank 1 (Cadd9 family), Style Hold.
  - 12 pads visible in J-6 5-black / 7-white layout
  - Labels show real Roland names (Bank 1: Cadd9, Dm7, etc.)
  - Click pad → MIDI to OP-1; release → note off
  - Pressed pad fills J-6 orange while held
  - Bank 14 (Oct Stack) → pads show fallback `C Oct Stack` / `D Oct Stack` etc.
  - Bank 15 (4th Stack) + Bank 16 (5th Stack) → same fallback pattern
result: issue
reported: "Press pad, move mouse out while still pressed, then release. Sometimes (intermittent — appears when release+pointer-leave happen almost simultaneously) the pad stays in 'enabled' / lit state. CONFIRMED: MIDI note also hangs indefinitely (note-off missed)."
severity: major
note: |
  Surfaced AFTER test passed initial checks. Core pad behavior (12 pads,
  labels, J-6 orange fill, Bank 14/15/16 fallback) all correct. Bug is
  release-edge handling: pointer-leave race condition with mouseup.
  Stuck-note also confirmed downstream on OP-1.

### 5. Transpose
expected: |
  Bank 1, Hold, press pad for baseline pitch.
  - `-12` button drops one octave
  - `+12` button raises one octave
  - `Z` = down 1 octave; `X` = up 1 octave
  - Clamp at `-36` (further presses no-op)
  - Clamp at `+36` (same)
result: pass
note: |
  Nitpick (defer, not blocking): `±12` button labels are in semitones —
  consider `±1` in octave terms since the buttons jump octaves anyway.
  UX polish, not a bug.

### 6. BPM
expected: |
  Style Arp 1, pad held so arp runs.
  - Default BPM = 110 on load
  - Range accepts 40 through 240
  - Live change: nudge BPM up/down while arp running → tempo updates audibly without restart
result: pass
side_finding: |
  Discovered during this test (not BPM-related): browser reload while a latched
  chord is sounding leaves MIDI notes hanging on the downstream synth. Logged as
  separate gap.

### 7. Style: Hold
expected: |
  Bank 1, Style Hold.
  - Press = note on; release = note off
  - No engine ticking / clock activity (silent when no pad held)
result: pass

### 8. Style: Arp 1 (8th) — 12 variations
expected: |
  Bank 1, Style Arp 1, hold a pad.
  Walk all 12 variations (V01–V12). For each: direction (UP / UP&DOWN / DOWN), octave range (1 vs 2), and triplet flag match the name + audibly match the sound.
  Final check: subdivision audibly = 8th-note rate at current BPM.
result: pass
note: |
  All 12 variations walked under Ext clock (internal-clock drift workaround per
  Known Deferrals). V01–V06 straight 8ths + V07–V12 triplet feel both confirmed.
  Mirror ordering (V01–V03: UP/UP&DOWN/DOWN 1-oct ↔ V04–V06: DOWN/UP&DOWN/UP 2-oct)
  cross-checked against Roland phrase list — matches.
  UP&DOWN endpoints not doubled — standard arpeggiator convention.
  Surfaced design insight (logged to Claude Design todo): triplet variations
  visually undistinguished from straight; per-variation pattern graph would
  help.

### 9. Style: Arp 2 (16th) — 12 variations
expected: |
  Bank 1, Style Arp 2, hold a pad.
  Same matrix as Arp 1 at 16th-note rate. All 12 variations match name + sound.
  Subdivision audibly = 16th-note rate at current BPM.
result: pass
note: |
  Verified by counting beats-to-root-return with a 3-note triad (C maj on bank 17).
  Math checks out per variation:
  - V01/V03 (UP/DOWN 1-oct): 3 beats / 4 cycles
  - V02 (UP&DOWN 1-oct): every beat
  - V04/V06 (DOWN/UP 2-oct): 3 beats / 2 cycles
  - V05 (UP&DOWN 2-oct, the outlier): 5 beats / 2 cycles (10-note expanded cycle)
  - V07/V09 (UP/DOWN 1-oct triplet): half-beat per cycle
  - V08 (UP&DOWN 1-oct triplet): 2 beats / 3 cycles
  - V10/V12 (DOWN/UP 2-oct triplet): every beat
  - V11 (UP&DOWN 2-oct triplet): 5 beats / 3 cycles
  All confirmed audibly under Ext clock.

### 10. Style: Phrase Duration — 12 variations
expected: |
  Bank 1, Style Phrase Dur, hold (or latch) a pad.
  All 12 variations: sustain length matches the variation name (double-whole → 16th, plus triplet variants).
result: pass
note: |
  V01–V06 straight (double-whole → 16th) all confirmed audibly.
  V07 (double-whole triplet) initially surprising — sounds floaty/off-grid because
  3 stabs span 4 bars. Verified math: ticks = round(8 × 24 × 2/3) = 128 ticks/stab
  = 5.333 beats. LCM(128, 24) = 384 ticks = 16 beats → 3 stabs per 4 bars. Textbook
  triplet definition ("3 in space of 2"). Confirmed correct per music theory; just
  rare in practice for very long durations. Lock as-is.
  V08–V12 (whole/half/quarter/8th/16th triplet) all aligned cleanly; V10 onwards
  feel increasingly natural as the duration shrinks toward the familiar 8th/16th
  triplet feel.

### 11. Style: Rhythm Gate 4 — 12 variations
expected: |
  Bank 1, Style Rhythm Gate 4, hold a pad.
  All 12 variations play audibly with distinct rhythms.
result: pass (conditional)
note: |
  Verified on Int clock (Ext clock has known alignment bug — gap logged).
  V09–V12 (3-hits-then-rest galloping patterns) and V07 (dotted-8th) audibly
  obvious. V05/V06/V08 (tied 8th-pulse variants) more subtle but distinguishable.
  V01–V04 phase-shift patterns confirmed by feel ("ends on the a").
  CONDITIONAL: V04, V06, V08 are subtle phase/tie variants of nearby patterns —
  hard to verify by ear alone. Mark for re-verification AFTER the Ext-clock
  alignment gap is fixed, so they can be recorded to OP-1 grid and visually
  verified against bar position.

### 12. Style: Rhythm Gate 5 — 12 variations
expected: |
  Bank 1, Style Rhythm Gate 5, hold a pad.
  All 12 variations play audibly with distinct rhythms.
result: pass
note: |
  All 12 variations confirmed audibly. V01–V03 tested on Ext clock (worked
  cleanly — adds weight to "OP-1 record obscures leading silence" theory for
  the earlier Rhythm Gate 4 Ext-clock finding). V04–V12 tested on Int clock.
  V07–V09 (dotted-8th cycling pattern) — bar wrap-around produces close pair
  (steps 15 + 0 of next bar, 1 step apart vs 3-step gaps elsewhere) — expected.
  V08/V09 bar-end "pause" expected per pattern shape.

### 13. Gate Slider ⚠️ (flagged suspect)
expected: |
  Style Rhythm Gate 4 V01 (or any pattern with clear single hits), Bank 1, pad held, BPM ~110.
  - Gate = 10% → hits ultra-staccato (clearly clipped before next step)
  - Gate = 50% → hits sustain about half a step
  - Gate = 100% → hits sustain right up to next step
  - 10% vs 100% audibly different on OP-1
result: not_a_bug
reported: "Gate does change something, but 100% is definitely not 100% — clear gap between hits even at max."
severity: minor
note: |
  RESOLVED by research agent (high confidence): per-step gate is CORRECT — matches
  Roland J-6 family. J-6 manual has no 'Gate'; longer notes = explicit ties, not
  duty cycle. JD-08 sibling confirms (Gate 0-100 + separate G.tie for legato).
  User's "100% = legato" expectation is the model Roland does NOT use. No code fix
  needed. Optional: document per-step semantics in MANUAL.md; consider tie/legato
  value >100% as a v2 feature.

### 14. Latch
expected: |
  Style Hold, Bank 1.
  - Top-bar Latch button toggles latch on
  - `Space` also toggles latch
  - Press pad → chord stays sounding after release
  - Latched pad stays orange after release
  - Same-pad re-press retriggers (J-6 HOLD convention)
  - Press different pad → chord swaps smoothly, no engine restart artifact
  - Toggle latch off → highlight clears, sound stops
result: issue
reported: "Latch functionality works, but pressing Space scrolls the page down."
severity: minor
note: |
  Core latch behavior all correct: toggle via button + Space, chord stays
  sounding, smooth swap, same-pad retrigger, off clears. The bug is the
  Space keyboard handler — page scrolls because preventDefault is missing
  on Space (browser default). Likely also affects arrow keys (bank nav).

### 15. Keyboard Shortcuts
expected: |
  Window focused, no input field selected.
  - Whites: `A`=C, `S`=D, `D`=E, `F`=F, `G`=G, `H`=A, `J`=B
  - Blacks: `W`=C#, `E`=D#, `T`=F#, `Y`=G#, `U`=A#
  - `Z` / `X` transpose ±12
  - `←` / `→` bank prev/next
  - `Space` toggle latch
  - `1`–`6` switch style
result: pass
note: |
  All 18 bindings work correctly (whites + blacks + transpose + bank ± + latch + 6
  style switches). Arrow-key scroll bug confirmed (already covered by test 14 gap).
  Side polish notes logged: viewport sizing (page bigger than viewport allows
  scroll), and feature idea: bind ↑/↓ to cycle variation within current style.

### 16. MIDI Clock + Transport Sync (the big one)
expected: |
  Setup: OP-1 as Input, Style Arp 1.
  [full expected list — see Current Test history]
result: issue
reported: "Receive + Send work. Step 1 (downbeat align) fails — engine waits 1 beat from pad-press, not OP-1 downbeat. Step 2 (Record=Start) fails — no pattern reset. Step 3 (panic) works for audio but latch state/highlight not cleared. Step 4 (double-trigger guard) blocked — Start does nothing visible on Jay-6. Step 5 (no echo) needs MIDI monitor."
severity: major
note: |
  Sub-results:
  - Ext receive (slave to OP-1 tempo): PASS
  - Int send (OP-1 follows Jay-6 BPM): PASS
  - Step 1 downbeat alignment (D-06): FAIL → feeds the Ext-clock-alignment gap (also test 11)
  - Step 2 OP-1 Record = Start (D-04): FAIL → same gap; confounded by OP-1's record-from-first-sound behavior
  - Step 3 Int→Ext panic (D-03): audio stops PASS; latch-state/highlight not cleared → feeds the latch-mode-switch gap
  - Step 4 double-trigger guard (D-05): BLOCKED — OP-1 Start produces no visible Jay-6 reaction, can't test 200ms guard until Start handling works
  - Step 5 no clock echo (Pitfall 8): DEFERRED — needs MIDI monitor (end-of-UAT session)
  All transport-sync sub-failures cluster around the same Ext-clock/Start-handling
  area. End-of-UAT plan: set up a MIDI monitor with the user to observe actual
  in/out bytes, then hand to debugger.

### 17. Bank Label Fallback
expected: |
  Bank 14 (Oct Stack).
  - Pad C → `C Oct Stack`
  - Pad D → `D Oct Stack`
  - Pad C# → `C# Oct Stack`
  - All 12 pads use the `<key> <bankName>` pattern
result: pass
note: Confirmed on Bank 14 (Oct Stack); all 12 pads use `<key> <bankName>`. Partly verified earlier in test 4.

### 18. Tunnel + Always-On Deploy
expected: |
  - `https://jay-6.kempenich.dev` loads the app (via TheMac dev tunnel → localhost:5173)
  - `https://jay-6.kempenich.ai` (always-on k8s) loads the app (live HTTP 200 already confirmed in plan 02-01)
  Note: dev-lan recipe + dev:lan npm script removed 2026-05-20 during UAT — dev tunnel supersedes it. REQ-lan-exposure now fulfilled by the tunnel (HTTPS, MIDI works, reachable from any device).
result: pass
note: |
  Both URLs confirmed loading: jay-6.kempenich.dev (TheMac dev tunnel → localhost
  vite) + jay-6.kempenich.ai (k8s always-on deploy, independent of just dev).
  dev-lan removed during this test (config cleanup, user-authorized) — REQ-lan-exposure
  re-scoped to the tunnel.

### 19. iPad (Web MIDI Browser)
expected: |
  "Web MIDI Browser" app (Yonemoto) installed on iPad, OP-1 plugged via camera kit.
  - App loads `https://jay-6.kempenich.dev`
  - OP-1 appears in Output dropdown
  - Pads send MIDI → OP-1 plays
  - iPad polish (plan 02-03): no text-selection on long-press; 44pt min targets feel comfortable; black pads readable against dark frame; no rubber-band scroll on body
result: issue
reported: "Loads on iPhone via Web MIDI Browser, Bluetooth MIDI connects, pads play — both .dev and .ai work. BUT: text selection still works on double-click (REQ-ipad-polish not effective); landscape on iPhone can't see keys + can't scroll (unusable). White border looks off; channel/bank selectors would be nicer as picker wheels."
severity: major
note: |
  Tested on iPhone (not iPad) via Web MIDI Browser + Bluetooth OP-1. Core load +
  MIDI works on both .dev and .ai. Two real bugs logged as gaps (text-selection
  not suppressed; landscape layout broken). Two polish items logged (white border,
  picker-wheel selectors). iPad-specific (camera kit, larger screen) not tested —
  44pt targets felt decent on iPhone.

### 20. Edge Cases
expected: |
  - Unplug OP-1 mid-session → Output dropdown refreshes (port disappears)
  - Re-plug OP-1 → port reappears, selectable
  - Switch style while pad held → audio transitions cleanly, no stuck notes
  - Browser refresh → state resets to defaults (Bank 1, Hold, BPM 110, latch off)
  - Hot-plug under Ext mode → no crash, transport state coherent
result: issue
reported: "Unplug/re-plug refreshes dropdown cleanly. Switch style while latched = clean transition. Browser refresh resets defaults. Hot-plug Ext: no crash/console error, reconnect works — BUT pad stays lit/latched after disconnect, and Ext stayed selected with no input (had to manually switch to Int)."
severity: minor
note: |
  Most edge cases pass. Two findings, both logged as gaps:
  (1) latch/highlight not cleared on disconnect — folded into the broader
  'clear-state-on-disruption' gap; (2) Ext mode doesn't fall back when input
  device disconnects. Browser-refresh-resets-defaults confirmed (note: separate
  page-reload note-hang gap still stands — that's about MIDI note-off on unload,
  not state reset).

## Summary

total: 20
passed: 14
issues: 5
not_a_bug: 1
pending: 0
skipped: 0
blocked: 0
gaps_logged: 11
note: |
  5 tests marked `issue` (4, 14, 16, 19, 20). Test 13 (gate slider) reclassified
  not_a_bug after research confirmed per-step gate matches Roland J-6 convention.
  11 active fix-gaps in Gaps section — more than issue-count because several
  passing tests surfaced side-findings (e.g. page-reload note hang under test 6,
  internal-clock drift confirmed under test 8 → moved to Known Deferrals). Test 11
  = conditional pass (V04/V06/V08 need re-verify after Ext-clock fix).
  MIDI-MONITOR SESSION (2026-05-20) added hard evidence to 2 gaps: Ext-clock
  alignment (measured +278ms / 0.42-beat off-grid; arm anchors to pad-press not
  OP-1 bar) + a NEW transport-semantics gap (OP-1 emits Continue not Start;
  transport events not reaching engine). No-echo (Pitfall 8) confirmed GOOD.
  Throwaway J6DBG instrumentation added + reverted during the session.

## Gaps

- truth: "On iPad/iPhone, long-press / double-tap on UI does NOT select text (REQ-ipad-polish — user-select: none shipped in plan 02-03)"
  status: failed
  reason: "User reported during test 19: on iPhone (Web MIDI Browser app), double-clicking still selects text. Plan 02-03 added user-select:none + -webkit-user-select:none to .topbar, but it's clearly not fully effective — either not applied to all surfaces (pads, labels) or being overridden. REQ-ipad-polish deliverable not working as specified."
  severity: minor
  test: 19
  artifacts: []
  missing: []

- truth: "On iPhone, landscape orientation shows the keyboard and is usable (or at least scrollable to reach it)"
  status: failed
  reason: "User reported during test 19: on iPhone in landscape, can't see the keys AND can't scroll to reach them — app is unusable in landscape. Portrait is fine. iPad (larger screen) likely unaffected but not confirmed. Layout/viewport breaks in small-screen landscape; the body scroll-lock from plan 02-03 (@media pointer:coarse) may be trapping the viewport so you can't scroll to off-screen content."
  severity: major
  test: 19
  artifacts: []
  missing: []

- truth: "Any disruptive event (clock-mode switch, MIDI device disconnect, stop/panic) clears latch state + all pad highlights + sends note-offs — the UI never shows 'stuck on' state after something stops the audio"
  status: failed
  reason: |
    User's overarching design principle (stated across tests 16 + 20): whenever something stops the audio or the device state changes adversely, Jay-6 should unlatch + clear all pad highlights + release notes. Currently many paths leave state 'stuck on'. Observed manifestations:
    - Test 16: latch on + rhythm gate playing, click Int → rhythm stops but pads stay yellow.
    - Test 16 step 3: Int + latch + pad highlighted, switch to Ext → audio stops (D-03 panic) but latch + highlight stay.
    - Test 20 hot-plug: Ext + latched ARP, disconnect device → no crash but pad stays lit + latched.
    User's explicit ask: mode-switch panic (D-03), device disconnect, and any stop should clear ALL pad highlights + latch state even if a key is physically held.
  severity: minor
  test: 16
  also_observed_in: [20]
  artifacts: []
  missing: []

- truth: "When the selected MIDI input device disconnects while in Ext mode, Jay-6 falls back to Int mode (or otherwise stays coherent) — it doesn't stay stuck on Ext with no input"
  status: failed
  reason: "User reported during test 20 hot-plug: in Ext mode, disconnected the MIDI device → Ext stayed selected even though there was no input anymore. Had to manually switch back to Int. Mode state should fall back / become coherent when the input source vanishes."
  severity: minor
  test: 20
  artifacts: []
  missing: []

- truth: "When OP-1 starts playback under Ext clock, Jay-6 receives the transport event and (per D-04) arms/resets the rhythm engines to step 0 on the downbeat"
  status: failed
  root_cause: |
    Two stacked problems found in the MIDI-monitor session (2026-05-20):
    1. WRONG MESSAGE: the OP-1 emits MIDI **Continue (0xFB)** on Play, NEVER **Start (0xFA)** — confirmed in MIDI Monitor (only Continue + Stop ever appear). Jay-6's D-04 keys the "reset pattern to step 0 / arm fresh" behavior off `start`; OP-1's Continue maps to `armedPosition='resume'`, a no-op stub no engine reads. So the intended Play→reset behavior never fires from this hardware.
    2. EVENTS NOT REACHING ENGINE: even the Continue/Stop the OP-1 does send produced ZERO `TRANSPORT-IN` console logs in Jay-6, despite MIDI Monitor showing them on the wire. Suspect: the engine only subscribes to tickSource on pad-press, and transport listeners may not be wired (or webmidi 'continue'/'start' events not surfacing) when transport arrives. Needs confirmation.
  severity: major
  test: 16
  artifacts:
    - path: "src/engines/host.ts:190-204"
      issue: "onTransport handles 'start' (reset) + 'continue' (resume stub); OP-1 only sends 'continue', so reset path is dead for this hardware"
    - path: "src/tickSource.ts:87-105, 123-125"
      issue: "transport listener attachment + emitTransport — verify events actually fire when OP-1 sends Continue/Stop"
  missing:
    - "Treat Continue (and/or a configurable transport trigger) as a valid sync/arm signal, not just Start"
    - "Confirm transport listeners are attached + firing independent of engine subscription timing"
  midi_session_evidence: |
    MIDI Monitor (wall-clock) showed: Stop, Continue, Continue, Stop, Stop... from OP-1.
    Pressing Play on OP-1 = Continue (0xFB), never Start (0xFA).
    Same window, Jay-6 console logged NO transport-in events at all.
    No-echo (Pitfall 8) CONFIRMED GOOD in the same run: zero CLOCK-OUT lines while in Ext mode.

- truth: "After switching clock to Int, Jay-6's engines stop receiving timing from the OP-1 — they use only the internal clock"
  status: failed
  reason: "User reported during test 16 (transient, not reproducible after page reload): Int mode selected, but Jay-6's rhythm still followed OP-1's tempo changes. State leak in mode switch — possibly tickSource still subscribed to external MIDI clock events even after mode flip. Page reload cleared it."
  severity: major
  test: 16
  artifacts: []
  missing: []

- truth: "Keyboard shortcuts used by Jay-6 (Space, arrow keys) don't trigger default browser actions"
  status: failed
  reason: "User reported during test 14: pressing Space scrolls the page down. Confirmed during test 15: arrow keys ← → also scroll the page (same root cause). Keyboard handler missing event.preventDefault() on all app-handled keys."
  severity: minor
  test: 14
  also_observed_in: [15]
  artifacts: []
  missing: []

- truth: "Gate slider at 100% means notes sustain right up to the next hit (legato feel)"
  status: not_a_bug
  reason: "User reported during test 13: gate at 100% isn't legato — obvious gap between hits. RESEARCH RESOLVED (background agent, high confidence): Jay-6's per-step gate model is CORRECT — matches Roland J-6 family convention. The real J-6 manual has zero 'Gate' references; note length is anchored to the 16th-note step grid and longer notes come from explicit TIES, not a duty-cycle gate. Sibling AIRA JD-08 defines Gate Time 0-100 with a separate 'G.tie' value beyond 100 for legato — confirming gate 100 = one full step, not legato-to-next-hit. User's expectation (legato at 100%) is the duty-cycle model Roland does NOT use. Sources: J-6 manual PDF (static.roland.com/assets/media/pdf/J-6_eng02_W.pdf), JD-08 reference (static.roland.com/manuals/jd-08_reference/eng/17812073.html)."
  severity: minor
  test: 13
  resolution: |
    Behavior is correct as-is — no code change needed for correctness. Optional follow-ups (NOT bugs):
    (1) Document the per-step gate semantics in MANUAL.md so it's not re-questioned.
    (2) Consider exposing a 'tie' / legato value beyond 100% later (matches JD-08) if legato feel is wanted — v2 feature, not a v1 fix.
  artifacts: []
  missing: []

- truth: "Under Ext clock, Rhythm Gate patterns align their 16-step grid to OP-1's bar position — first hit lands on OP-1's downbeat, not at an arbitrary phase."
  status: failed
  root_cause: "CONFIRMED via MIDI-monitor session (2026-05-20). The arm waits a fixed 24 LOCAL ticks from pad-press, not until OP-1's actual downbeat. rhythmGate.ts:54 sets armUntilTick = nextDownbeatTick(this.tickCount) where this.tickCount is the engine's own counter starting at 0 on start() (= pad-press), NOT OP-1's absolute bar position. So the first hit lands one OP-1-quarter after pad-press, wherever that falls in the bar. Same pattern in arp.ts:59-61 + phraseDuration.ts:32-34 (ticksUntilNext = TICKS_PER_QUARTER under Ext) — all three engines affected."
  severity: major
  test: 11
  artifacts:
    - path: "src/engines/rhythmGate.ts:45-58, 80-92"
      issue: "armUntilTick anchored to local tickCount (resets to 0 on pad-press), not OP-1 absolute tick"
    - path: "src/engines/arp.ts:52-65"
      issue: "ticksUntilNext = TICKS_PER_QUARTER from local start — same flaw"
    - path: "src/engines/phraseDuration.ts:26-38"
      issue: "same flaw"
    - path: "src/tickSource.ts"
      issue: "no absolute external-tick counter exposed for engines to align against"
  missing:
    - "TickSource exposes an absolute external-clock tick position (counts incoming MIDI clock bytes, resettable on transport), so engines can compute the true next-downbeat in OP-1's frame"
    - "Engines arm against that absolute position instead of a local tickCount"
  midi_session_evidence: |
    Captured 2026-05-20, OP-1 over Bluetooth, ~90 BPM, Rhythm Gate 4 V01, Ext clock.
    Console (performance.now ms) vs MIDI Monitor:
    - OP-1 downbeats (CLOCK-IN): 174583.3 → 175250.9 → 175917.4 (~667ms apart = 90 BPM)
    - Jay-6 note-ons:           174862.5 → 175528.4 → 176195.7 (~667ms apart — TEMPO locked)
    - Phase offset: every note-on +278ms after the OP-1 downbeat = 0.42 of a beat OFF-GRID, consistently.
    Arm trace:
      174193.9  RG.start (pad press), armUntilTick=24 LOCAL ticks
      174583.3  CLOCK-IN downbeat#6  ← should have fired here (390ms after press)
      174862.3  RG.arm-release, fired step 0  ← actually fired +668ms after press (= 24 local ticks = 1 OP-1 quarter)
    Conclusion: tempo syncs, phase does not. Arm ignores OP-1's bar; counts a fixed beat from pad-press.
    Earlier OP-1-truncates-leading-silence theory (test 12 note) is NOT the cause — the offset is real and measurable on note-on bytes, independent of OP-1's display.

- truth: "Style name 'Phrase Dur' clearly communicates what the style does"
  status: failed
  reason: "User reported during test 10: 'Phrase Dur' / 'Phrase Duration' is confusing and inaccurate — it's not really a 'phrase', it's chord stabs at fixed durations. Better: 'Beat'. UI/conceptual model becomes: Arpeggio (Arp 1/2) vs Beat (Phrase Dur, possibly Rhythm Gate 4/5 too)."
  severity: minor
  test: 10
  artifacts:
    - path: "src/phrases.ts"
      issue: "Type name 'PhraseDuration' + variation label"
    - path: "src/components/TopBar.svelte"
      issue: "Style selector label 'Phrase Dur'"
    - path: "MANUAL.md"
      issue: "Style 3 documentation refers to 'Phrase Duration'"
  missing:
    - "Rename UI label 'Phrase Dur' → 'Beat'"
    - "Decide if Rhythm Gate 4/5 also fold under 'Beat' umbrella or stay separate"
    - "Update MANUAL.md + any in-code identifiers (PhraseDurationVariation type, engine class name) consistent with new label"

- truth: "Browser reload while notes sounding emits MIDI note-offs (and/or CC 123 All Notes Off) so downstream synth doesn't hang"
  status: failed
  reason: "User reported: latched chord playing, hit page reload → MIDI note keeps sounding on synth. Only way to clear is to press the same pad again to retrigger then release. Browser tears down the WebMidi context without firing note-offs."
  severity: major
  test: 6
  artifacts: []
  missing:
    - "pagehide / beforeunload handler that invokes host.panic() before unload"
    - "host.panic() should send note-offs for all sounding notes + CC 123 All Notes Off on the active channel"

- truth: "Releasing pad outside its bounds always cleanly clears pressed/lit state and emits MIDI note-off"
  status: failed
  reason: "User reported: press pad, drag mouse off the pad while still pressed, then release — sometimes (intermittent, fires when release+pointer-leave happen near-simultaneously) the pad stays in 'enabled' / lit state. CONFIRMED: MIDI note-off is also missed — note hangs indefinitely until manual intervention. Suspected race between pointer-leave handler and mouseup handler."
  severity: major
  test: 4
  artifacts: []
  missing: []

## Polish Backlog (non-blocking nitpicks — surfaced during UAT)

- Test 5 (Transpose): `±12` buttons labelled in semitones; consider `±1` in octave terms.
- Test 8 (Arp 1) — also applies to Arp 2 / PhraseDur / Rhythm Gate: variation selector shows numeric labels (V01–V12) with no description of what each does. Add human-readable suffix (e.g. "V01 UP 1oct", "V07 UP 1oct ⅓") so user doesn't need to consult source.
- Test 11 (general): favicon is empty — add a favicon.
- Test 15 (general): page is taller than viewport — scroll appears with arrow keys / Space. Fix viewport sizing so the whole UI fits without scroll.
- Test 15 (feature idea, not bug): bind ↑/↓ arrow keys to cycle variation within current style. Currently up/down aren't bound to anything.
- Test 16: BPM input should display OP-1's current BPM (greyed out, read-only) when in Ext mode — engine clearly knows the value, hiding it is unhelpful.
- Test 16 (open question, not bug): Input dropdown doesn't auto-select OP-1 the way Output does. Decide intentional or not. If not, auto-select with an explicit "none" option preserved.
- Test 19 (iPhone/web): white border around the app looks off — review the page-level margin/border.
- Test 19 (feature idea): on touch devices, Channel + Bank selectors would feel better as an iOS-style picker wheel (rotating "one-armed-bandit" roll) rather than a dropdown.

## Known Deferrals (not gaps — by-design deferrals surfaced/confirmed during UAT)

- **Internal-clock precision** — `tickSource.ts:75-77` `setInterval`-based 24 PPQ tick drifts audibly against external metronome. Inline comment already self-flags as "prototype-level acceptable." Canonical fix = Web Audio scheduler, deferred to Phase 3 / v2 by design. Workaround = use Ext clock. Confirmed during test 8 walk.
