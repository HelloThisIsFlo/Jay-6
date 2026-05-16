# Jay-6 Plan

**Goal**: Browser app where Flo clicks chord pads → MIDI flows out → OP-1 plays.

## References

- J-6 chord set list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- J-6 phrase list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API

## Milestones

Work in order. After each: commit, check off items, update Status at the bottom.

### M1: Data extraction

Convert J-6 chord set list and phrase list into structured data.

- [ ] Chord banks: 100 banks × 12 chords, with MIDI note numbers
- [ ] Rhythm patterns: 16th-note grids for the rhythmic phrase styles
- [ ] Handle mixed accidentals in source (`Bb` vs `A#`, `Eb` vs `D#`, `Ab` vs `G#`)
- [ ] Sanity checks: bank 1 `Cadd9` → `[48, 55, 62, 64]`; bank 14 (Oct Stack) `C` → `[60, 72]`

### M2: MIDI plumbing

- [ ] Request MIDI access on load
- [ ] Output port selector (OP-1 appears as a class-compliant USB MIDI device)
- [ ] Play / release chord functions
- [ ] Manual test: a hardcoded button sends C major to the OP-1

### M3: Chord pad UI

- [ ] 12 chord pads — layout TBD (see Decisions → UI layout style)
- [ ] Bank selector for the 100 banks
- [ ] Each pad shows the chord name from current bank
- [ ] Press → play, release → stop
- [ ] Visual feedback while held

### M4: Arpeggiator

Phrase styles 1–2 (24 variations).

- [ ] Direction (UP / DOWN / UP&DOWN), subdivision (8th / 16th / triplet), octave range (±1, ±2)
- [ ] Driven by the M6 clock (or simple timing until M6 exists)
- [ ] Controls in UI

### M5: Rhythm gate

Phrase styles 3–6 (~48 patterns).

- [ ] 16-step grid triggers the held chord on each `o`
- [ ] Pattern selector
- [ ] Gate length control

### M6: Tempo / clock

- [ ] BPM (40–240, default 110)
- [ ] Single clock drives M4 + M5
- [ ] Optional: MIDI clock send (24 PPQ)
- [ ] Optional: MIDI clock receive

### M7: Latch / hold

- [ ] Latch toggle
- [ ] Latched: press = start, press again = stop
- [ ] Smooth chord change while latched

### M8: OP-1 end-to-end test

- [ ] Plug OP-1 into Mac via USB
- [ ] Verify it appears in the output dropdown
- [ ] Full loop: pick bank → latch chord → switch arp/rhythm → OP-1 plays

### M9 (optional): Phrase library

Phrase styles 7–9 — Roland doesn't publish the note data. See Decisions → Phrase styles 7–9.

### M10: Polish

- [ ] Keyboard shortcuts for the 12 pads
- [ ] Velocity control
- [ ] MIDI channel selector
- [ ] Persist settings between sessions (last bank, BPM, output port, etc.)
- [ ] Save/recall favorite presets

## Status

| Milestone | Status |
|-----------|--------|
| M1 Data | ⬜ |
| M2 MIDI | ⬜ |
| M3 Chord pads | ⬜ |
| M4 Arp | ⬜ |
| M5 Rhythm | ⬜ |
| M6 Clock | ⬜ |
| M7 Latch | ⬜ |
| M8 OP-1 test | ⬜ |
| M9 Phrases | ⬜ (optional) |
| M10 Polish | ⬜ |

## Decisions

### 🟡 Open

#### Stack
Vanilla HTML/JS, a framework (React, Svelte, etc.), or something else.

#### MIDI library
Native Web MIDI API directly, or a wrapper (WEBMIDI.js, Tone.js, etc.).

#### File structure
Single `index.html`, or multiple files / modules.

#### Hosting / deploy
Open file locally, local dev server, or hosted somewhere (Cloudflare Pages, etc.).

#### UI layout style
**Needed by**: M3

- Single row of 12 pads (piano-key style)
- Grid (2×6 or 3×4)
- Adaptive to viewport

#### Phrase styles 7–9
**Needed by**: M9

Roland doesn't publish note data for "Chord Phrases" / "Strummed Chord Phrases". Options: skip, roll own, defer.

### ✅ Closed

- **Platform**: Web (browser) — iOS considered, dropped for prototype speed
- **Input**: Mouse clicks (for prototype)
- **Repo name**: `jay-6`
