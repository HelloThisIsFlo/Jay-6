# Roadmap: Jay-6

## Overview

Jay-6 v2.0 ships the mechanism for read-only bank-aware chord suggestions, not a catalogue-production process. A validated, agent-editable catalogue with deliberately tiny representative bootstrap data feeds the approved chord-chip rail; direct data edits can expand it later. Variation feedback and measured external BPM complete the milestone, with every feature proving itself through its own automation, browser checks, and hardware verification.

## Milestones

- ✅ **v1.0 MVP** — Phases 1–2 (shipped 2026-05-23) — J-6 chord pads → OP-1, six styles, latch, keyboard, and bidirectional transport sync. UAT 11/11 PASS.
- ✅ **Pre-v2 visual redesign** — Phase 02.1 (shipped 2026-07-06) — approved instrument surface, responsive layouts, and per-style variation controls.
- 📋 **v2.0 Musical Companion** — Phases 3–6 (planned) — suggestion mechanism and rail plus focused variation and external-clock feedback.

## Phases

<details>
<summary>✅ Shipped work (Phases 1–2 and 02.1)</summary>

- [x] **Phase 1: Prototype (M1–M8 + keyboard)** — completed 2026-05-18; signed off through Phase 2 UAT.
- [x] **Phase 2: Post-prototype polish + UAT acceptance** — 9/9 plans completed 2026-05-23.
- [x] **Phase 02.1: Visual redesign adoption** — 4/4 plans completed 2026-07-06.

Full v1 detail: [`milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md) · requirements: [`milestones/v1.0-REQUIREMENTS.md`](milestones/v1.0-REQUIREMENTS.md)

</details>

### 📋 v2.0 Musical Companion

**Milestone Goal:** Ship a read-only bank-aware suggestion mechanism with minimal representative data and truthful performance feedback.

- [ ] **Phase 3: Catalogue Mechanism & Bootstrap** - Flo and agents can maintain validated bank-aware suggestion data, with only enough bundled content to prove the mechanism.
- [ ] **Phase 4: Read-Only Suggestion Rail** - Users can browse bank-aware chord suggestions without affecting performance or the core MIDI loop.
- [ ] **Phase 5: Variation Cycling & Queued Feedback** - Keyboard cycling and queued feedback make variation changes fast and truthful.
- [ ] **Phase 6: Measured External BPM** - External clock shows a stable measured tempo without changing the internal tempo setting.

**Dependency note:** Phase 4 depends on Phase 3. Phases 5 and 6 each depend only on shipped Phase 02.1, so they can be reordered or planned as independent workstreams even though phase numbering remains fixed.

## Phase Details

Completed Phase 02.1 detail is preserved in [its archived phase directory](milestones/pre-v2-phases/02.1-visual-redesign-adoption/).

### Phase 3: Catalogue Mechanism & Bootstrap

**Goal**: Flo and agents can maintain trustworthy bank-aware suggestion data without changing application code.
**Depends on**: Phase 02.1
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, BOOT-01
**Success Criteria** (what must be TRUE):

  1. Flo or an agent can add or revise suggestions in one plain data catalogue whose entries identify a factory bank, ordered pad keys, and an honest `progression` or `movement` kind.
  2. A factory bank resolves zero, one, or several suggestions in deterministic catalogue order, with chord names always derived from canonical bank data.
  3. Invalid banks, pad keys, duplicate IDs, same-bank duplicate sequences, blank labels, and malformed entries fail validation with actionable errors.
  4. The bundled catalogue contains only a tiny representative set sufficient to exercise the mechanism and supported kinds; every other bank resolves cleanly to no suggestion.
  5. Automated checks prove catalogue integrity, canonical resolution, deterministic lookup, supported-kind handling, and honest empty-bank results.

**Plans**: TBD

### Phase 4: Read-Only Suggestion Rail

**Goal**: Users can browse bank-aware chord suggestions beneath the pads without affecting performance.
**Depends on**: Phase 3
**Requirements**: RAIL-01, RAIL-02, RAIL-03, RAIL-04, RAIL-05, RAIL-06, RAIL-07, RAIL-08
**Success Criteria** (what must be TRUE):

  1. Selecting a factory bank shows its bundled suggestions or an honest “no curated suggestions yet” state.
  2. Every chip shows its pad key and canonically resolved chord name, including a useful fallback for unnamed stack-bank pads.
  3. Users can browse suggestions without triggering MIDI or changing pads, latch, engines, transport, clock, scoring, or progression position.
  4. Browser verification proves the rail, honest empty state, and long or unusual labels remain subordinate and usable on desktop, iPad-sized, and iPhone-landscape layouts.
  5. OP-1 and MIDI-monitor verification proves browsing is inert and the existing bank → pad → style → MIDI performance loop remains intact.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Variation Cycling & Queued Feedback

**Goal**: Keyboard cycling and queued feedback make variation changes fast and truthful.
**Depends on**: Phase 02.1
**Requirements**: VAR-01, VAR-02, VAR-03, VAR-04, VAR-05, VAR-06, VAR-07, VAR-08
**Success Criteria** (what must be TRUE):

  1. Up/Down cycles the current style’s variations backward or forward with wraparound, while Hold remains inert and existing focus, repeat, scrolling, and keyboard safety is preserved.
  2. A genuinely slow queued change shows one bottom-centre steel toast only while the delay could feel ambiguous; immediate and fast changes add no toast noise.
  3. The user manual makes the new Up/Down variation shortcuts discoverable.
  4. Automated and browser checks prove wraparound, Hold no-op behaviour, focus and scroll safety, keyboard cycling, and slow-versus-immediate toast behaviour.
  5. Hardware verification proves the toast reports the authoritative queued/applied transition without changing variation playback semantics.

**Plans**: TBD
**UI hint**: yes

### Phase 6: Measured External BPM

**Goal**: External clock shows a stable measured tempo without changing the user’s internal tempo setting.
**Depends on**: Phase 02.1
**Requirements**: BPM-01, BPM-02, BPM-03, BPM-04, BPM-05, BPM-06, BPM-07
**Success Criteria** (what must be TRUE):

  1. External mode derives and displays a stable read-only BPM after enough valid incoming 24 PPQ clock data exists.
  2. The external measurement becomes unavailable when its input disconnects, changes, or goes stale instead of leaving a misleading value on screen.
  3. Measuring external tempo never overwrites the configured internal BPM, and returning to internal mode restores that configured value.
  4. Automated checks prove estimator behaviour under jitter, outliers, reset, stale input, and Int↔Ext mode transitions.
  5. Real OP-1 external-clock verification proves truthful display and internal-BPM preservation across clock start, stop, staleness, input change, and mode transitions.

**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Prototype | v1.0 | Retrospective | Shipped | 2026-05-18 |
| 2. Post-prototype polish + UAT | v1.0 | 9/9 | Complete | 2026-05-23 |
| 02.1 Visual redesign adoption | pre-v2 | 4/4 | Complete | 2026-07-06 |
| 3. Catalogue Mechanism & Bootstrap | v2.0 | 0/TBD | Not started | - |
| 4. Read-Only Suggestion Rail | v2.0 | 0/TBD | Not started | - |
| 5. Variation Cycling & Queued Feedback | v2.0 | 0/TBD | Not started | - |
| 6. Measured External BPM | v2.0 | 0/TBD | Not started | - |
