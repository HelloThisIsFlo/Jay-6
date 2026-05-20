# Requirements: Jay-6

**Defined:** 2026-05-18
**Core Value:** Drive the OP-1 (USB or BT) with the J-6's chord library + playback styles from a browser, without owning the J-6 hardware.

> Requirements are reverse-extracted from `.research/PLAN.md` (milestone PRD) and `.research/UAT.md` (acceptance checklist). Full per-REQ acceptance criteria + source attribution live in `.planning/intel/requirements.md` — this file is the index + phase mapping.

## v1 Requirements

### Data

- [x] **REQ-data-chord-banks**: 100 Roland J-6 chord banks × 12 chords as typed TS data; enharmonic spellings preserved; empty-name fallback to `"<key> <bankName>"`; verified via two-extraction diff.
- [x] **REQ-data-phrases**: Style 1–5 phrase data — Arp 1 (8th) + Arp 2 (16th) × 12 variations each, Phrase Dur (Style 3) × 12, Rhythm Gate (Style 4+5) × 12 each via explicit `o`/`_`/`o~`/`o~~` strings.

### MIDI I/O

- [x] **REQ-midi-output**: Request MIDI access on load. Output port + channel (1–16, default 1) selectable. `playChord(notes, vel)` / `releaseChord(notes)`. Hot-plug refreshes dropdown.
- [x] **REQ-midi-input**: MIDI input port selector in top bar — feeds clock receive.

### UI

- [x] **REQ-chord-pad-ui**: 12 pads in J-6 5-black-on-top / 7-white-on-bottom layout. Each pad shows current-bank chord name (or fallback). Press = play, release = stop. Held pad fills with J-6 orange + glow.
- [x] **REQ-top-bar-layout**: `[Output ▾] [Input ▾] [Channel ▾] [Bank ▾] [‹ ›] [Transpose] [Clock Int/Ext] [BPM] [Style ▾] [Variation ▾] [Gate] [Latch ⊙]`.
- [x] **REQ-bank-navigation**: Dropdown lists `"01 — name"` through 100; `‹` / `›` buttons; `←` / `→` keys; wrap-around at boundaries.
- [x] **REQ-transpose**: `±12` buttons + `Z`/`X` keys; clamped at `±36`.

### Engines

- [x] **REQ-hold-engine**: Press = chord on, release = chord off. No clock activity when silent.
- [x] **REQ-arpeggiator**: Style 1 (8th) + Style 2 (16th); 24 variations total (direction × subdivision × octave-range × triplet flag). Driven by REQ-clock.
- [x] **REQ-phrase-duration**: Style 3, 12 variations (whole, half, quarter, 8th, 16th + triplet variants).
- [x] **REQ-rhythm-gate**: Style 4 + Style 5, 24 explicit patterns; per-step events parsed from `o`/`_`/`~` strings; pattern selector in UI.
- [x] **REQ-gate-slider**: Gate-length slider audibly controls hit duration from staccato (10%) to full step (100%). _Flagged suspect — needs UAT verification._
- [x] **REQ-style-selector**: Single dropdown selects active engine (Hold / Arp 1 / Arp 2 / Phrase Dur / RG 4 / RG 5); variation dropdown narrows.
- [x] **REQ-latch**: Top-bar Latch button + `Space` key both toggle. Latched: same-pad re-press retriggers (J-6 HOLD), different-pad swap is smooth (no engine restart artifact), pad stays orange after release. Toggle off → clears highlight + sound.

### Clock + Tempo

- [x] **REQ-clock**: Single shared clock drives all time-driven engines. `setInterval`-based for prototype (DEC-clock-setinterval-prototype).
- [x] **REQ-bpm**: BPM input 40–240, default 110. Live tempo updates without engine restart.
- [x] **REQ-clock-receive**: TickSource at 24 PPQ. Input port + Int/Ext toggle in top bar. Ext disables BPM input + slaves engines to OP-1 tempo. Switch back to Int → BPM re-enabled.
- [x] **REQ-clock-send-transport-sync**: 24 PPQ MIDI clock out when Int is active. Send Start/Stop/Continue on engine start/stop. React to incoming Start/Stop/Continue (and OP-1 Record = start) → drive Jay-6 transport. No double-trigger on Ext + Start.
- [x] **REQ-rhythm-phase-alignment-ext-clock**: Under Ext clock, first step lands on-beat (anchor to next `tick-mod-24` boundary, or restart on transport Start). _Open bug._

### Keyboard

- [x] **REQ-keyboard-shortcuts**: Ableton "Computer MIDI Keyboard" layout — whites `A/S/D/F/G/H/J`, blacks `W/E/T/Y/U`. Plus `Z`/`X` transpose, `←`/`→` bank, `Space` latch, `1`–`6` style.

### Hardware Integration

- [x] **REQ-op-1-end-to-end**: OP-1 over USB MIDI visible in Output dropdown. Full loop verified: bank → pad → Hold / Arp / Phrase Dur / Rhythm Gate. Latch + chord-swap clean. Subjective "fun to play" passed.

### Deployment

- [x] **REQ-deploy-cloudflare-dev**: `just serve` runs Vite + Cloudflare tunnel → `https://jay-6.kempenich.dev`. Use case: OP-1 plugged into the same Mac as the browser.
- [x] **REQ-deploy-k8s-always-on**: Container deployed to home K8s cluster, exposed at `https://jay-6.kempenich.ai` via cluster-wide Cloudflare Tunnel. `Dockerfile` (nginx:alpine) + `k8s.yaml` + GHCR Action + `./deploy.sh`.
- [x] **REQ-lan-exposure**: App reachable from devices other than this Mac. Fulfilled by the dev Cloudflare tunnel (`jay-6.kempenich.dev` via TheMac tunnel) — HTTPS, so Web MIDI works on those devices too. (Superseded the earlier `just dev-lan` plain-http `0.0.0.0` approach, which only gave view-only LAN access with MIDI denied; removed 2026-05-20 during Phase 2 UAT cleanup.)
- [x] **REQ-ipad-web-midi-browser**: Jay-6 works on iPad via Yonemoto's "Web MIDI Browser" app. App loads `https://jay-6.kempenich.dev`, OP-1 appears in Output dropdown, pads play.

### Phase 2 polish + acceptance

- [x] **REQ-ipad-polish**: Add `user-select: none` on pads + top-bar controls (long-press currently triggers iOS text selection). Re-review touch ergonomics.
- [x] **REQ-voicing-second-pass-audit**: Tighten the ~30% inferred slots in `banks.data.json` against the J-6 manual / hardware. Verified by ear / manual reference — no automated criterion.
- [x] **REQ-edge-cases**: Hot-plug refresh, re-plug, style swap while held, refresh resets to defaults. _Shipped; verified during UAT walkthrough._
- [x] **REQ-user-manual**: `MANUAL.md` at repo root, consumer-product tone (TE Pocket Operator anchor), 4 required H1 sections per D-14 (Setup, Pads + chords, Styles, Clock + transport sync), linked from README.md + CURRENT-STATE.md. Designed to grow — v2 sequencer adds Section 5 without rewriting 1–4 (D-13). _Added during Phase 2 planning per D-11._
- [x] **REQ-uat-walkthrough**: Walk `.research/UAT.md` end-to-end via `uat-agent` skill. Bugs logged; run-log line appended per session. **Gates Phase 2 close + retroactively signs Phase 1 off.**

## v2 Requirements

_Promoted from Out of Scope via `/gsd:new-milestone` once Phase 2 UAT closes v1._

- **Sequencer** (candidate v2 Phase 1) — step sequencer driving chord-pad presses on a grid; pattern chaining; basic song mode. Must slot into existing TickSource + engine-host without violating DEC-engines-time-source-agnostic or DEC-engine-orchestrator. Scope refined during `/gsd:new-milestone`.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| **REQ-out-of-scope-prototype** — M9 Style 6–9 phrases | Roland publishes no note data. Options (skip / roll own / reverse-engineer) all high-cost / low-confidence. |
| **REQ-out-of-scope-prototype** — Velocity control | Prototype intentionally fixed-velocity. Adds complexity without changing the core loop. |
| **REQ-out-of-scope-prototype** — Persist last bank / BPM / output port | Deferred to Phase 3+. Defaults are fine for a solo tool. |
| **REQ-out-of-scope-prototype** — Save/recall presets | Phase 3+ alongside persistence. |
| Web Audio API scheduler | DEC-no-premature-features. `setInterval` is good enough; revisit only if drift becomes real-use problem. |
| Safari / Firefox support | No Web MIDI implementation in those browsers. iPad workaround = "Web MIDI Browser" app. |
| Multi-channel / multi-output routing | Single output, single channel by design. |
| User-defined banks / chord import | Roland J-6 factory set is the whole point. |
| Backend / accounts / multi-user | Solo tool. Static SPA. No server logic. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-data-chord-banks | Phase 1 | Complete (voicing audit pending in Phase 2) |
| REQ-data-phrases | Phase 1 | Complete |
| REQ-midi-output | Phase 1 | Complete |
| REQ-midi-input | Phase 1 | Complete |
| REQ-chord-pad-ui | Phase 1 | Complete |
| REQ-top-bar-layout | Phase 1 | Complete |
| REQ-bank-navigation | Phase 1 | Complete |
| REQ-transpose | Phase 1 | Complete |
| REQ-hold-engine | Phase 1 | Complete |
| REQ-arpeggiator | Phase 1 | Complete |
| REQ-phrase-duration | Phase 1 | Complete |
| REQ-rhythm-gate | Phase 1 | Complete |
| REQ-gate-slider | Phase 1 | Complete (suspect — retest in UAT) |
| REQ-style-selector | Phase 1 | Complete |
| REQ-latch | Phase 1 | Complete |
| REQ-clock | Phase 1 | Complete |
| REQ-bpm | Phase 1 | Complete |
| REQ-keyboard-shortcuts | Phase 1 | Complete |
| REQ-op-1-end-to-end | Phase 1 | Complete (informal — formal sign-off via UAT in Phase 2) |
| REQ-clock-receive | Phase 2 | Complete |
| REQ-clock-send-transport-sync | Phase 2 | Complete |
| REQ-rhythm-phase-alignment-ext-clock | Phase 2 | Complete (shipped 02-02 — nextDownbeatTick helper + 3-engine arming under Ext) |
| REQ-deploy-cloudflare-dev | Phase 2 | Complete |
| REQ-deploy-k8s-always-on | Phase 2 | Complete |
| REQ-lan-exposure | Phase 2 | Complete |
| REQ-ipad-web-midi-browser | Phase 2 | Complete |
| REQ-ipad-polish | Phase 2 | Complete |
| REQ-voicing-second-pass-audit | Phase 2 | Complete |
| REQ-edge-cases | Phase 2 | Complete (verified during UAT) |
| REQ-user-manual | Phase 2 | Complete (MANUAL.md shipped 02-05) |
| REQ-uat-walkthrough | Phase 2 | Complete (handed off to verify-phase via `uat-agent`; trigger "run uat") |

**Coverage:**
- v1 requirements: 31 total (sequencer dropped to v2; REQ-user-manual added in Phase 2 per D-11)
- Mapped to phases: 31 ✓
- Unmapped: 0
- Plus 1 meta-bucket (REQ-out-of-scope-prototype) routed to "Out of Scope"

---
*Requirements defined: 2026-05-18*
*Last updated: 2026-05-18 — Phase 2 close: marked REQ-uat-walkthrough + REQ-rhythm-phase-alignment-ext-clock complete; added REQ-user-manual (D-11).*
