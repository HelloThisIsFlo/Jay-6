# Requirements Intel

> Extracted from the two PRDs in the ingest set:
> - `.research/PLAN.md` — milestone-structured requirements (M1–M10 + Phase 2)
> - `.research/UAT.md` — shipped-feature acceptance checklist
>
> Where both PRDs cover the same scope, requirements are merged into a single REQ with a primary acceptance source and an "Also verified by" cross-reference. Divergent acceptance criteria (if any) are flagged in the conflicts report.

---

## REQ-data-chord-banks
- **source (primary)**: `.research/PLAN.md` (M1 → Chord banks)
- **also verified by**: `.research/UAT.md` §3 (Chord pads), §16 (Bank label fallback)
- **scope**: J-6 chord-bank data extraction
- **description**: Provide all 100 Roland J-6 chord banks × 12 chords per bank as structured TS data.
- **acceptance criteria**:
  - 100 banks × 12 chords (one per chromatic key: C, C#, D, D#, E, F, F#, G, G#, A, A#, B).
  - Each chord = name + 4 notes in scientific notation (`C4`, `G3`) converted to MIDI integers (C4 = 60).
  - Enharmonic spellings preserved as-published (`Bb` stays `Bb`).
  - Bank names captured (needed for selector UI + fallback labels).
  - Shape: `Bank = { index: number; name: string; chords: Chord[] }`, `Chord = { name: string; notes: [number, number, number, number] }`.
  - Empty-chord-name fallback: `"${key} ${bankName}"` → `"C Oct Stack"`.
  - Verified via two independent extractions + diff.
  - Sanity: Bank 1 `Cadd9` = `[48, 55, 62, 64]`; Bank 14 (Oct Stack) `C` = `[60, 72]`.
  - UAT spot-checks: Bank 1 labels (`Cadd9`, `Dm7`, …); Banks 14/15/16 all use `<key> <bankName>` fallback.
- **status**: shipped (M1 closed; voicing second-pass audit still open per Phase 2)

## REQ-data-phrases
- **source (primary)**: `.research/PLAN.md` (M1 → Phrase data)
- **scope**: J-6 Style 1–5 phrase data
- **description**: Parse Roland J-6 Styles 1–5 into typed TS data structures.
- **acceptance criteria**:
  - Style 1+2 metadata: direction × subdivision × triplet flag — 12 variations each.
  - Style 3 phrase durations: whole, half, quarter, 8th, 16th + triplet variants — 12 variations.
  - Style 4+5 rhythm gate patterns: explicit `o` / `_` / `o~` / `o~~` strings — 24 variations total.
  - Notation: `o`=16th-note hit, `_`=16th rest, `o~`=8th, `o~~`=dotted 8th.
  - Skip Styles 6–9 (Roland publishes no note data).
- **status**: shipped (M1)

## REQ-midi-output
- **source (primary)**: `.research/PLAN.md` (M2)
- **also verified by**: `.research/UAT.md` §1 (Connectivity), §19 (Edge cases)
- **scope**: MIDI output plumbing
- **description**: Send MIDI from the browser to a selected output port + channel.
- **acceptance criteria**:
  - Request MIDI access on load.
  - Output port selector lists available USB-MIDI devices (OP-1 appears as class-compliant).
  - Channel selector lists 1–16.
  - `playChord(notes: number[], velocity: number)` and `releaseChord(notes: number[])`.
  - Unplug mid-session → Output dropdown refreshes (port disappears). Re-plug → port reappears.
  - Switching to a channel OP-1 doesn't listen on → silence; switching back → sound.
- **status**: shipped (M2)

## REQ-midi-input
- **source (primary)**: `.research/UAT.md` §1, §15
- **also referenced in**: `.research/PLAN.md` (M6 → clock receive checkbox)
- **scope**: MIDI input port selection
- **description**: Expose a MIDI input port selector for clock receive.
- **acceptance criteria**:
  - OP-1 appears in **Input** dropdown.
  - Used by MIDI clock receive (REQ-clock-receive).
- **status**: shipped

## REQ-chord-pad-ui
- **source (primary)**: `.research/PLAN.md` (M3)
- **also verified by**: `.research/UAT.md` §3
- **scope**: 12-pad chord pad UI
- **description**: 12 chord pads in a J-6-mirroring piano layout, press to play / release to stop.
- **acceptance criteria**:
  - 12 pads: 5 black on top row (C#, D#, F#, G#, A#), 7 white on bottom (C, D, E, F, G, A, B).
  - Each pad shows the current bank's chord name (or fallback per REQ-data-chord-banks).
  - Press → `playChord`; release → `releaseChord`.
  - Held-pad feedback: pad fills with J-6 orange + subtle outer glow.
- **status**: shipped (M3)

## REQ-top-bar-layout
- **source (primary)**: `.research/PLAN.md` (M3 → top bar layout)
- **scope**: top-bar control layout
- **description**: Persistent top bar surfaces all live controls.
- **acceptance criteria**:
  - Layout: `[Output ▾] [Input ▾] [Channel ▾] [Bank ▾] [‹ ›] [Transpose: 0] [Clock Int/Ext] [BPM] [Style ▾] [Variation ▾] [Gate] [Latch ⊙]`.
- **status**: shipped

## REQ-bank-navigation
- **source (primary)**: `.research/PLAN.md` (M3 → bank selector)
- **also verified by**: `.research/UAT.md` §2
- **scope**: bank selection + navigation
- **description**: Navigate the 100 banks via dropdown, arrow buttons, and keyboard.
- **acceptance criteria**:
  - Dropdown lists `"01 — [bank name]"` through 100.
  - `‹` / `›` arrow buttons step ±1.
  - `←` / `→` keys step ±1.
  - Wrap-around: 100 + `›` → 1; 1 + `‹` → 100.
- **status**: shipped

## REQ-transpose
- **source (primary)**: `.research/UAT.md` §4
- **also referenced in**: `.research/PLAN.md` (M3 / M10) — keyboard shortcuts include Z/X
- **scope**: octave transpose
- **description**: Shift pitch ±12 semitones at a time, clamped to ±36.
- **acceptance criteria**:
  - `-12` and `+12` buttons in top bar.
  - `Z` = down 1 octave, `X` = up 1 octave.
  - Clamp at `-36` and `+36` (further presses do nothing; pitch unchanged).
- **status**: shipped

## REQ-arpeggiator
- **source (primary)**: `.research/PLAN.md` (M4)
- **also verified by**: `.research/UAT.md` §7 (Arp 1), §8 (Arp 2)
- **scope**: Style 1 (8th) + Style 2 (16th) arpeggiator
- **description**: 24-variation arpeggiator engine driven by Style 1 + Style 2 phrase data.
- **acceptance criteria**:
  - Parameterised by: direction (UP / DOWN / UP&DOWN), subdivision (8th / 16th + triplet flag), octave range (±1, ±2).
  - Driven by REQ-clock.
  - Active style = Arp → pad press feeds chord notes into arp engine; release stops the arp.
  - Style + variation pickers in UI top bar.
  - All 12 variations under Arp 1 and Arp 2 audibly match direction × octave × triplet name.
  - Subdivision audibly equals 8th-note (Arp 1) / 16th-note (Arp 2) rate at current BPM.
- **status**: shipped (M4)

## REQ-phrase-duration
- **source (primary)**: `.research/PLAN.md` (M4 / Style selector — Style 3)
- **also verified by**: `.research/UAT.md` §9
- **scope**: Style 3 phrase-duration engine
- **description**: Sustain chord for a fixed note-length, with 12 variations.
- **acceptance criteria**:
  - 12 variations covering whole, half, quarter, 8th, 16th + triplet variants.
  - Sustain length matches variation name for V01–V12.
- **status**: shipped (alongside M4/M5)

## REQ-rhythm-gate
- **source (primary)**: `.research/PLAN.md` (M5)
- **also verified by**: `.research/UAT.md` §10 (RG4), §11 (RG5), §12 (Gate slider)
- **scope**: Style 4 + Style 5 rhythm-gate engine
- **description**: Play held chord through 24 explicit rhythm patterns (12 per style), with adjustable gate length.
- **acceptance criteria**:
  - Parse phrase strings into per-step events (hit + duration).
  - On each `o`, send the held chord; release at gate-length boundary.
  - Pattern selector in UI (within Style 4 or Style 5).
  - Gate length control (slider, 0–100% of step).
  - All 12 variations under RG4 and RG5 play audibly with a distinct rhythm.
- **status**: shipped (M5) — gate slider flagged suspect (see REQ-gate-slider)

## REQ-gate-slider
- **source**: `.research/UAT.md` §12
- **scope**: rhythm-gate length slider
- **description**: Gate slider audibly controls hit duration from staccato (10%) to full step (100%).
- **acceptance criteria**:
  - Gate=10% → ultra-staccato hits (clearly clipped before next step).
  - Gate=50% → hits sustain about half a step.
  - Gate=100% → hits sustain right up to next step.
  - Difference between 10% and 100% audible on OP-1.
  - If indistinguishable, MIDI note-off timing must still change at the wire (browser dev tools / MIDI monitor) — distinguishes code bug from OP-1 envelope masking.
- **status**: flagged suspect — needs UAT verification

## REQ-clock
- **source (primary)**: `.research/PLAN.md` (M6)
- **scope**: shared tempo / clock
- **description**: Single shared clock drives Arp + Rhythm Gate + Phrase Duration engines.
- **acceptance criteria**:
  - BPM control range 40–240, default 110, in top bar.
  - Single shared clock drives all time-driven engines (M4 + M5 + Style 3).
  - `setInterval` at small tick (~5 ms) is acceptable for the prototype — no Web Audio API scheduler yet (per DEC-clock-setinterval-prototype).
- **status**: shipped (M6)

## REQ-bpm
- **source (primary)**: `.research/UAT.md` §5
- **also referenced in**: `.research/PLAN.md` (M6)
- **scope**: BPM input + live tempo update
- **description**: Top-bar BPM control accepts the documented range with live application.
- **acceptance criteria**:
  - Default BPM = 110 on load.
  - Range: input accepts 40 through 240.
  - Nudging BPM while an arp runs updates tempo audibly without restart.
- **status**: shipped

## REQ-clock-receive
- **source (primary)**: `.research/PLAN.md` (M6 → clock receive) + `CURRENT-STATE.md` Phase 2 Done
- **also verified by**: `.research/UAT.md` §15
- **scope**: external MIDI clock receive
- **description**: Slave Jay-6 engines to an external 24-PPQ MIDI clock from a selected Input port.
- **acceptance criteria**:
  - TickSource at 24 PPQ with Input port selector + Int/Ext toggle in top bar.
  - Selecting **Ext** disables the BPM input.
  - Playing on OP-1 → engines slave to OP-1 tempo; tempo changes track audibly.
  - Switching back to **Int** re-enables BPM input and re-uses the internal clock.
- **status**: shipped (Phase 2)

## REQ-clock-send-transport-sync
- **source (primary)**: `.research/PLAN.md` (Phase 2 → Transport sync + clock send)
- **also referenced in**: `CURRENT-STATE.md` Phase 2 Open
- **scope**: outgoing MIDI clock + Start/Stop/Continue handling
- **description**: Send 24-PPQ MIDI clock when Int is active and react to incoming transport messages.
- **acceptance criteria**:
  - 24 PPQ MIDI clock out when Int clock is active.
  - Send Start / Stop / Continue on Jay-6 engine start / stop.
  - React to incoming Start / Stop / Continue from OP-1 → drive Jay-6 engine transport.
  - OP-1 Record also starts Jay-6 (record = transport start).
  - No double-trigger: Ext clock + incoming Start = one start.
- **status**: open (Phase 2)

## REQ-rhythm-phase-alignment-ext-clock
- **source (primary)**: `.research/PLAN.md` (Phase 2 → Rhythm phase alignment under external clock)
- **also referenced in**: `CURRENT-STATE.md` Phase 2 Open
- **scope**: rhythm-engine downbeat alignment when slaved
- **description**: When slaved to OP-1, the rhythm engine's first step must land on a downbeat.
- **acceptance criteria**:
  - First step lands on-beat when slaved to OP-1 (current bug: `engine.start()` fires immediately and lands off-beat).
  - Fix anchors first step to next `tick-mod-24` boundary, or restarts engine on incoming transport `start`.
  - Verify on OP-1: rhythm gate locked to OP-1 beat across stop/start cycles.
- **status**: open bug (Phase 2)

## REQ-latch
- **source (primary)**: `.research/PLAN.md` (M7)
- **also verified by**: `.research/UAT.md` §13
- **scope**: latch / hold behaviour
- **description**: Latch holds the played chord until toggled off, follows the J-6 HOLD convention, and allows smooth mid-flight chord swaps.
- **acceptance criteria**:
  - Top-bar Latch button + `Space` key both toggle latch.
  - Latched: pad press = start; same-pad re-press retriggers (J-6 HOLD convention).
  - Pressing a different pad while latched swaps the chord smoothly — no engine restart artifact.
  - Latched pad stays orange after release.
  - Toggle latch off → highlight clears, sound stops.
- **status**: shipped (M7)

## REQ-style-selector
- **source (primary)**: `.research/PLAN.md` (Style selector — cross-cuts M3–M5)
- **scope**: active engine selection
- **description**: Single dropdown selects the active engine; variation dropdown narrows within active style.
- **acceptance criteria**:
  - Styles selectable: Hold, Arp (Style 1, 8th), Arp (Style 2, 16th), Phrase Dur (Style 3), Rhythm Gate (Style 4), Rhythm Gate (Style 5).
  - Variation dropdown narrows selection within the active style.
- **status**: shipped

## REQ-hold-engine
- **source (primary)**: `.research/UAT.md` §6
- **also referenced in**: `.research/PLAN.md` (Style selector → Hold)
- **scope**: Hold style behaviour
- **description**: Press = chord on, release = chord off; no clock activity when no pad is held.
- **acceptance criteria**:
  - Press = note on, release = note off.
  - No engine ticking / clock activity when silent.
- **status**: shipped

## REQ-keyboard-shortcuts
- **source (primary)**: `.research/PLAN.md` (Keyboard shortcuts — subset of M10)
- **also verified by**: `.research/UAT.md` §14
- **scope**: Ableton-style keyboard mapping
- **description**: Keyboard mirrors Ableton "Computer MIDI Keyboard" layout for chord pads and adds Jay-6-specific controls.
- **acceptance criteria**:
  - Whites: `A`=C, `S`=D, `D`=E, `F`=F, `G`=G, `H`=A, `J`=B.
  - Blacks: `W`=C#, `E`=D#, `T`=F#, `Y`=G#, `U`=A#.
  - `Z` / `X` transpose ±1 octave (per REQ-transpose).
  - `←` / `→` bank prev / next.
  - `Space` toggle latch.
  - `1`–`6` switch style.
- **status**: shipped (keyboard subset of M10)

## REQ-op-1-end-to-end
- **source (primary)**: `.research/PLAN.md` (M8)
- **scope**: OP-1 hardware integration smoke
- **description**: End-to-end loop from pad press through engines to OP-1 audio.
- **acceptance criteria**:
  - OP-1 plugged into Mac via USB and visible in Output dropdown.
  - Full loop: pick bank → press pad → cycle Hold / Arp / Phrase Dur / Rhythm Gate → OP-1 plays.
  - Latch test: latch on, switch chords smoothly.
  - Subjective "fun to play" check passes — iterate before declaring done if it doesn't feel good.
- **status**: shipped (M8 closed; clock receive tracked as Phase 2 follow-up)

## REQ-deploy-cloudflare-dev
- **source (primary)**: `.research/PLAN.md` (Phase 2 → Deploy)
- **also referenced in**: `TUNNEL-SETUP.md`, `CURRENT-STATE.md`
- **scope**: developer-machine public exposure
- **description**: `just serve` runs Vite + a Cloudflare tunnel to `https://jay-6.kempenich.dev`.
- **acceptance criteria**:
  - Public hostname live in Zero Trust dashboard.
  - `just serve` routes tunnel → `localhost:5173`.
  - Use case: OP-1 plugged into the same Mac as the browser (Web MIDI locality).
- **status**: shipped (Phase 2)

## REQ-deploy-k8s-always-on
- **source (primary)**: `.research/PLAN.md` (Phase 2 → Deploy)
- **also referenced in**: `TUNNEL-SETUP.md`, `CURRENT-STATE.md`
- **scope**: always-on public deployment
- **description**: Container image deployed to home K8s cluster, exposed via cluster-wide Cloudflare Tunnel at `https://jay-6.kempenich.ai`.
- **acceptance criteria**:
  - `Dockerfile` (nginx:alpine) + `k8s.yaml` + GHCR GitHub Action + `./deploy.sh`.
  - Cluster tunnel public hostname `jay-6.kempenich.ai` → `jay-6.jay-6.svc.cluster.local:80`.
- **status**: shipped (Phase 2)

## REQ-lan-exposure
- **source (primary)**: `.research/UAT.md` §17
- **also referenced in**: `CURRENT-STATE.md` Phase 2 Done, `.research/PLAN.md` (Phase 2 → Deploy)
- **scope**: LAN access for view-only iPad use
- **description**: `just dev-lan` exposes Vite on `0.0.0.0` so a LAN device can reach the app (MIDI denied over plain http — expected).
- **acceptance criteria**:
  - `just dev-lan` starts vite on `0.0.0.0`.
  - iPad on same LAN reaches app at LAN IP (view-only — MIDI denied over plain http).
- **status**: shipped (Phase 2)

## REQ-ipad-web-midi-browser
- **source (primary)**: `.research/UAT.md` §18
- **also referenced in**: `.research/PLAN.md` (Phase 2 → iPad polish), `CURRENT-STATE.md`, `README.md`
- **scope**: iPad MIDI playability via Web MIDI Browser app
- **description**: Jay-6 works on iPad via Yonemoto's "Web MIDI Browser" app with OP-1 over USB camera kit.
- **acceptance criteria**:
  - App loads `https://jay-6.kempenich.dev`.
  - OP-1 appears in Output dropdown.
  - Pads send MIDI → OP-1 plays.
- **status**: shipped

## REQ-ipad-polish
- **source (primary)**: `.research/PLAN.md` (Phase 2 → iPad polish)
- **also referenced in**: `CURRENT-STATE.md` Phase 2 Open
- **scope**: iPad touch polish (Phase 2 open)
- **description**: Clean up iPad-specific touch ergonomics issues.
- **acceptance criteria**:
  - Add `user-select: none` on pads + top-bar controls (long-press currently triggers text selection).
  - Re-review general touch ergonomics during the pass.
- **status**: open (Phase 2)

## REQ-voicing-second-pass-audit
- **source (primary)**: `.research/PLAN.md` (Phase 2 → Voicing data second-pass audit)
- **also referenced in**: `CURRENT-STATE.md` Phase 2 Open
- **scope**: chord-bank data fidelity audit
- **description**: Tighten the ~30% inferred slots from the original two-extraction diff against the J-6 manual / hardware.
- **acceptance criteria**:
  - Open. Flo to explore separately. No automated criterion — verified by ear / manual reference.
- **status**: open (Phase 2)

## REQ-uat-walkthrough
- **source (primary)**: `.research/PLAN.md` (Phase 2 → UAT walkthrough)
- **also verified by**: `.research/UAT.md` (entire checklist)
- **scope**: Phase 2 acceptance gate
- **description**: Walk `.research/UAT.md` end-to-end via the `uat-agent` skill. Phase 2 closes after UAT passes.
- **acceptance criteria**:
  - Every section in `.research/UAT.md` walked, every line checked or explicitly noted.
  - Bugs surfaced are logged in the "Bugs surfaced" section with date stamp.
  - Run log line appended per session: `YYYY-MM-DD — <sections covered> — <pass/fail/skip counts>`.
- **status**: pending — checklist + skill ready, walkthrough not yet executed

## REQ-edge-cases
- **source (primary)**: `.research/UAT.md` §19
- **scope**: regression edge cases
- **description**: Hot-plug, refresh, style swap behaviours.
- **acceptance criteria**:
  - Unplug OP-1 mid-session → Output dropdown refreshes (port disappears).
  - Re-plug OP-1 → port reappears in dropdown, selectable.
  - Switch style while a pad is held → audio transitions cleanly, no stuck notes.
  - Browser refresh → state resets to defaults (Bank 1, Style Hold, BPM 110, latch off).
- **status**: shipped — to be verified by UAT walkthrough

## REQ-out-of-scope-prototype
- **source**: `.research/PLAN.md` (M9, M10 backlog; Scope "Out")
- **scope**: explicit non-goals for the prototype
- **description**: Items intentionally deferred from the prototype.
- **acceptance criteria** (negative): not delivered in current scope.
  - M9 Style 6–9 phrases (Roland publishes no note data — skip / roll own / reverse-engineer TBD).
  - Velocity control.
  - Persistence of last bank / BPM / output port.
  - Save/recall favorite presets.
- **status**: backlog (no commitment)

## REQ-phase-3-sequencer
- **source**: `.research/PLAN.md` (Phase 3 — TBD); `CURRENT-STATE.md`
- **scope**: Phase 3 placeholder
- **description**: Sequencer is the primary Phase 3 candidate. Detail TBD.
- **acceptance criteria**: TBD (not yet scoped).
- **status**: TBD
