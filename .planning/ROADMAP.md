# Roadmap: Jay-6

## Overview

Two-phase v1 milestone mirroring shipping reality, not a fresh plan. **Phase 1 (Prototype)** is code-complete + hardware-verified informally and awaits formal UAT sign-off (which happens inside Phase 2). **Phase 2 (Post-prototype polish)** is in progress — closes the open Phase 2 work items + runs `.research/UAT.md` end-to-end via the `uat-agent` skill; that walkthrough is the gate that retroactively validates Phase 1 + closes v1.

> **Sequencer** is deferred to milestone **v2**. Run `/gsd:new-milestone` once Phase 2 UAT passes — sequencer becomes Phase 1 of v2.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work.
- Decimal phases (e.g. 2.1, 2.2): Urgent insertions (marked `INSERTED`) — none yet.

- [x] **Phase 1: Prototype (M1–M8 + keyboard)** — J-6 chord pads + 5 playback styles + latch + keyboard, end-to-end to OP-1 over USB MIDI. _Shipped + informally hardware-verified; awaiting UAT in Phase 2._
- [x] **Phase 2: Post-prototype polish + UAT acceptance** — close open Phase 2 items (transport sync, rhythm phase alignment, voicing audit, iPad polish) and pass the `.research/UAT.md` walkthrough that retroactively signs Phase 1 off. **Closes v1.** (completed 2026-05-18)

## Phase Details

### Phase 1: Prototype (M1–M8 + keyboard)
**Goal**: Reproduce the Roland J-6 chord-pad experience in the browser, driving the OP-1 over USB MIDI — pick a bank, press a pad (mouse or keyboard), cycle through 5 playback styles, latch and swap chords smoothly.
**Depends on**: Nothing (first phase)
**Requirements**: REQ-data-chord-banks, REQ-data-phrases, REQ-midi-output, REQ-midi-input, REQ-chord-pad-ui, REQ-top-bar-layout, REQ-bank-navigation, REQ-transpose, REQ-hold-engine, REQ-arpeggiator, REQ-phrase-duration, REQ-rhythm-gate, REQ-gate-slider, REQ-style-selector, REQ-latch, REQ-clock, REQ-bpm, REQ-keyboard-shortcuts, REQ-op-1-end-to-end
**Success Criteria** (what must be TRUE):
  1. User can plug an OP-1 into the Mac, open the browser app, select the OP-1 from the Output dropdown, and hear the OP-1 play when they press any of the 12 chord pads — for any of the 100 banks.
  2. User can cycle through all 6 active styles (Hold / Arp 1 / Arp 2 / Phrase Dur / Rhythm Gate 4 / Rhythm Gate 5) and pick any variation, and the OP-1 plays the expected rhythm / arpeggiation at the current BPM.
  3. User can latch a chord with the Latch button or `Space` key, then press a different pad and hear the chord swap smoothly (no engine restart artifact); same-pad re-press retriggers per the J-6 HOLD convention.
  4. User can drive the entire app from the Ableton-style keyboard mapping (`A/W/S/E/...` for pads, `Z/X` transpose, `←/→` bank, `Space` latch, `1`–`6` style) without touching the mouse.
  5. Status: **shipped + informally verified on hardware. Formal sign-off happens via REQ-uat-walkthrough in Phase 2.**
**Plans**: TBD (retrospective — no plans authored; code already shipped)
**UI hint**: yes

### Phase 2: Post-prototype polish + UAT acceptance
**Goal**: Close the remaining Phase 2 open items (transport sync, rhythm phase alignment under external clock, voicing audit, iPad polish) + ship a consumer-product MANUAL.md at the repo root, then walk `.research/UAT.md` end-to-end so Phase 1 + Phase 2 are formally signed off. After this phase, Jay-6 is "shipped + acceptance-tested," and Phase 3 scoping can begin.
**Depends on**: Phase 1
**Requirements**: REQ-clock-receive, REQ-clock-send-transport-sync, REQ-rhythm-phase-alignment-ext-clock, REQ-deploy-cloudflare-dev, REQ-deploy-k8s-always-on, REQ-lan-exposure, REQ-ipad-web-midi-browser, REQ-ipad-polish, REQ-voicing-second-pass-audit, REQ-edge-cases, REQ-uat-walkthrough, REQ-gate-slider, REQ-user-manual
**Success Criteria** (what must be TRUE):
  1. User can switch the top-bar Clock toggle to **Ext**, start playback on the OP-1, and hear Jay-6's Rhythm Gate engine lock on-beat to the OP-1 — first hit lands on a downbeat, and Jay-6's engines react to OP-1 Start / Stop / Continue / Record without double-triggering.
  2. User can leave the Clock toggle on **Int**, hit play on a rhythm pattern, and any downstream MIDI device receives 24 PPQ MIDI clock + Start/Stop/Continue from Jay-6 (Jay-6 works as master too, not only as slave).
  3. User can open `https://jay-6.kempenich.dev` on the iPad inside Yonemoto's "Web MIDI Browser" app, see the OP-1 in the Output dropdown, and play comfortably — long-press on TopBar controls no longer triggers iOS text selection.
  4. User can `say "run uat"` and the `uat-agent` skill walks `.research/UAT.md` section-by-section with results recorded in the file; any surfaced bugs are logged with date stamps, and a run-log line is appended per session.
  5. Voicing data in `src/banks.data.json` no longer contains the ~30% inferred slots flagged in the original two-extraction diff — chord-pad output sounds correct vs. the Roland manual / hardware on the audited banks.
  6. `MANUAL.md` exists at the repo root with the four D-14 sections (Setup, Pads + chords, Styles, Clock + transport sync) in consumer-product voice, linked from README.md + CURRENT-STATE.md.
**Plans**: 5 plans
  - [x] 02-01-PLAN.md — Carry-forward acknowledgement for the 5 pre-GSD shipped REQs (clock-receive, deploys, LAN, iPad Web MIDI Browser)
  - [x] 02-02-PLAN.md — `nextDownbeatTick()` pure-math helper + Vitest boundary cases (rhythm phase alignment math)
  - [x] 02-03-PLAN.md — iPad ergonomics CSS pass + black-key Option B (UI-SPEC)
  - [x] 02-04-PLAN.md — Transport sync wiring (clock send + transport receive + downbeat alignment + double-trigger guard + mode-switch hard stop + voicing-anchor verify)
  - [x] 02-05-PLAN.md — MANUAL.md at repo root + README/CURRENT-STATE links + UAT walkthrough handoff
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2. v1 closes on Phase 2 UAT pass; sequencer (v2) is scoped via `/gsd:new-milestone` after that.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Prototype (M1–M8 + keyboard) | N/A — retrospective | Shipped (informal); awaiting UAT in Phase 2 | 2026-05-18 (code-complete) |
| 2. Post-prototype polish + UAT acceptance | 5/5 | Complete   | 2026-05-18 |
