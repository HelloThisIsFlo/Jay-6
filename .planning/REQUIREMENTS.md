# Requirements: Jay-6 v2.0 Musical Companion

**Defined:** 2026-07-29
**Core Value:** Drive the OP-1 (USB or BT) with the J-6's chord library + playback styles from a browser, without owning the J-6 hardware.

## v2.0 Requirements

Requirements for the Musical Companion milestone. Each maps to exactly one roadmap phase.

### Progression Catalogue

- [ ] **PROG-01**: Flo can add or revise suggestions in one plain, agent-editable catalogue without changing application code.
- [ ] **PROG-02**: Every catalogue entry identifies a factory bank and an ordered sequence of valid pad keys.
- [ ] **PROG-03**: Catalogue validation rejects invalid banks, pad keys, duplicate IDs, duplicate sequences within the same bank, blank labels, and malformed entries.
- [ ] **PROG-04**: Suggestions resolve chord names from canonical bank data rather than duplicating them.
- [ ] **PROG-05**: A bank can contain zero, one, or several suggestions in deterministic catalogue order.
- [ ] **PROG-06**: Suggestions distinguish genuine harmonic `progression` entries from interval or voicing `movement` entries.
- [ ] **PROG-07**: Automated checks validate catalogue integrity, canonical bank resolution, deterministic lookup, supported kinds, and clean empty-bank results.

### Minimal Bootstrap

- [ ] **BOOT-01**: The bundled catalogue contains only a deliberately tiny set of simple representative entries sufficient to exercise the mechanism and rail, including a basic progression and a movement example when useful to prove both supported kinds; every other bank resolves cleanly to no entry.

### Chord-Chip Rail

- [ ] **RAIL-01**: Selecting a bank shows its curated suggestions beneath the pads or an honest "no curated suggestions yet" state.
- [ ] **RAIL-02**: Every chip shows its pad key and canonically resolved chord name, with a useful fallback for unnamed stack-bank pads.
- [ ] **RAIL-03**: Users can browse multiple suggestions without triggering MIDI, changing playback, or affecting latch, engines, transport, or clock state.
- [ ] **RAIL-04**: The rail remains completely read-only and does not track, score, advance with, or correct the player's performance.
- [ ] **RAIL-05**: The rail remains subordinate to the pad surface on desktop and uses the previously designed contained mobile treatment.
- [ ] **RAIL-06**: Suggestion display remains usable with long, altered, slash, repeated, and unnamed chord labels.
- [ ] **RAIL-07**: Browser verification covers the rail, honest empty state, and target desktop, iPad-sized, and iPhone-landscape layouts.
- [ ] **RAIL-08**: OP-1 and MIDI-monitor verification confirms that browsing suggestions emits no MIDI, changes no playback state, and preserves the core pad-to-MIDI loop.

### Variation Controls

- [ ] **VAR-01**: Up/Down cycles the current style's variations backward/forward with wraparound.
- [ ] **VAR-02**: Up/Down remains inert for Hold and preserves existing focus safety, page-scroll suppression, and keyboard controls.
- [ ] **VAR-03**: The user manual documents the new variation shortcuts.
- [ ] **VAR-04**: A slow queued variation change shows the existing bottom-centre steel toast only when the delay would otherwise feel ambiguous.
- [ ] **VAR-05**: Immediate or fast variation changes do not produce unnecessary toast noise.
- [ ] **VAR-06**: Automated checks cover variation wraparound, Hold no-op behaviour, focus ownership, and page-scroll suppression.
- [ ] **VAR-07**: Browser verification confirms keyboard variation cycling and truthful queued-toast behaviour for slow versus immediate changes.
- [ ] **VAR-08**: Hardware verification confirms that queued feedback reflects the authoritative delayed/applied variation transition without changing playback semantics.

### External MIDI-Clock BPM

- [ ] **BPM-01**: External mode derives a stable BPM measurement from incoming 24 PPQ MIDI-clock ticks.
- [ ] **BPM-02**: External mode displays the measured BPM as read-only once enough valid clock data exists.
- [ ] **BPM-03**: The measurement resets or becomes unavailable when clock input disconnects, changes, or becomes stale.
- [ ] **BPM-04**: Measuring external BPM never overwrites the configured internal BPM.
- [ ] **BPM-05**: Returning to internal mode restores the user's configured internal BPM.
- [ ] **BPM-06**: Automated checks cover external-BPM jitter, outliers, reset, stale input, and Int↔Ext mode transitions.
- [ ] **BPM-07**: Real OP-1 external-clock verification confirms truthful measurement across start, stop, stale clock, input change, and Int↔Ext transitions while preserving the configured internal BPM.

## Future Requirements

Deferred beyond v2.0 and not included in this roadmap.

### Catalogue Growth

- **FUTURE-01**: Flo or agents extend catalogue coverage through direct validated data edits outside the GSD phase workflow.
- **FUTURE-02**: Curate or revise suggestions as useful musical ideas emerge, without a comprehensive coverage target.
- **FUTURE-03**: Add runtime progression editing or validated import.

### Guidance

- **FUTURE-04**: Add optional performer-following guidance.
- **FUTURE-05**: Add bar or song-form metadata when its timing meaning is explicit.

## Out of Scope

Explicit exclusions prevent the companion from drifting into a sequencer or unrelated refactor.

| Feature | Reason |
|---------|--------|
| Sequencing, autoplay, chip audition, or timed progression playback | The rail suggests what to play; pads and the player retain exclusive control of performance |
| Host-owned play/latch architecture refactor | Valuable captured technical debt, but unrelated to the focused musical-companion outcome |
| OP-1 transport reset / record sync | v2.0 does not expand transport behaviour |
| Touch-oriented Bank and Channel selector exploration | Separate UX exploration, not required by the companion |
| New styles | No additional playback vocabulary is required for chord discovery |
| Velocity controls | Adds performance complexity without serving the milestone goal |
| Persistence | Current load-with-defaults behaviour is sufficient for v2.0 |
| User-defined chord banks | The editable catalogue describes suggestions for canonical factory banks, not new banks |

## Traceability

Every v2.0 requirement maps to exactly one roadmap phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROG-01 | Phase 3 | Gaps Found |
| PROG-02 | Phase 3 | Gaps Found |
| PROG-03 | Phase 3 | Gaps Found |
| PROG-04 | Phase 3 | Gaps Found |
| PROG-05 | Phase 3 | Gaps Found |
| PROG-06 | Phase 3 | Gaps Found |
| PROG-07 | Phase 3 | Gaps Found |
| BOOT-01 | Phase 3 | Gaps Found |
| RAIL-01 | Phase 4 | Pending |
| RAIL-02 | Phase 4 | Pending |
| RAIL-03 | Phase 4 | Pending |
| RAIL-04 | Phase 4 | Pending |
| RAIL-05 | Phase 4 | Pending |
| RAIL-06 | Phase 4 | Pending |
| RAIL-07 | Phase 4 | Pending |
| RAIL-08 | Phase 4 | Pending |
| VAR-01 | Phase 5 | Pending |
| VAR-02 | Phase 5 | Pending |
| VAR-03 | Phase 5 | Pending |
| VAR-04 | Phase 5 | Pending |
| VAR-05 | Phase 5 | Pending |
| VAR-06 | Phase 5 | Pending |
| VAR-07 | Phase 5 | Pending |
| VAR-08 | Phase 5 | Pending |
| BPM-01 | Phase 6 | Pending |
| BPM-02 | Phase 6 | Pending |
| BPM-03 | Phase 6 | Pending |
| BPM-04 | Phase 6 | Pending |
| BPM-05 | Phase 6 | Pending |
| BPM-06 | Phase 6 | Pending |
| BPM-07 | Phase 6 | Pending |

**Coverage:**

- v2.0 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after mechanism-focused milestone rescope*
