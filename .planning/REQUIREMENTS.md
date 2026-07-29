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

### Initial Musical Content

- [ ] **MUSIC-01**: Users receive a reviewed launch catalogue covering a deliberately selected range of useful factory banks.
- [ ] **MUSIC-02**: The launch catalogue includes both a genuine progression and a useful movement study where musically defensible.
- [ ] **MUSIC-03**: Flo reviews the launch catalogue as a single musical UAT and can approve, revise, or remove each suggestion before release.
- [ ] **MUSIC-04**: Banks without approved content show no fabricated or placeholder suggestions.

### Chord-Chip Rail

- [ ] **RAIL-01**: Selecting a bank shows its curated suggestions beneath the pads or an honest "no curated suggestions yet" state.
- [ ] **RAIL-02**: Every chip shows its pad key and canonically resolved chord name, with a useful fallback for unnamed stack-bank pads.
- [ ] **RAIL-03**: Users can browse multiple suggestions without triggering MIDI, changing playback, or affecting latch, engines, transport, or clock state.
- [ ] **RAIL-04**: The rail remains completely read-only and does not track, score, advance with, or correct the player's performance.
- [ ] **RAIL-05**: The rail remains subordinate to the pad surface on desktop and uses the previously designed contained mobile treatment.
- [ ] **RAIL-06**: Suggestion display remains usable with long, altered, slash, repeated, and unnamed chord labels.

### Variation Controls

- [ ] **VAR-01**: Up/Down cycles the current style's variations backward/forward with wraparound.
- [ ] **VAR-02**: Up/Down remains inert for Hold and preserves existing focus safety, page-scroll suppression, and keyboard controls.
- [ ] **VAR-03**: The user manual documents the new variation shortcuts.
- [ ] **VAR-04**: A slow queued variation change shows the existing bottom-centre steel toast only when the delay would otherwise feel ambiguous.
- [ ] **VAR-05**: Immediate or fast variation changes do not produce unnecessary toast noise.

### External MIDI-Clock BPM

- [ ] **BPM-01**: External mode derives a stable BPM measurement from incoming 24 PPQ MIDI-clock ticks.
- [ ] **BPM-02**: External mode displays the measured BPM as read-only once enough valid clock data exists.
- [ ] **BPM-03**: The measurement resets or becomes unavailable when clock input disconnects, changes, or becomes stale.
- [ ] **BPM-04**: Measuring external BPM never overwrites the configured internal BPM.
- [ ] **BPM-05**: Returning to internal mode restores the user's configured internal BPM.

### Acceptance

- [ ] **QA-01**: Automated checks validate catalogue integrity, bank resolution, keyboard cycling, and external-BPM estimation edge cases.
- [ ] **QA-02**: Browser verification covers the rail, empty state, toast, keyboard behaviour, and target responsive layouts.
- [ ] **QA-03**: OP-1 hardware verification confirms useful musical content, truthful external BPM, inert suggestions, and no regression to the core pad-to-MIDI loop.

## Future Requirements

Deferred beyond v2.0 and not included in this roadmap.

### Catalogue Growth

- **FUTURE-01**: Extend catalogue coverage after the launch set is musically validated.
- **FUTURE-02**: Add more suggestions to especially fruitful banks.
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

Populated during roadmap creation. Every v2.0 requirement must map to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|

**Coverage:**
- v2.0 requirements: 29 total
- Mapped to phases: 0
- Unmapped: 29 ⚠️

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after milestone requirements approval*
