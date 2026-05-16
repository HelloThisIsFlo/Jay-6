# Jay-6 Plan

**Goal**: Browser app where Flo clicks chord pads → MIDI flows out → OP-1 plays.

## References

- J-6 chord set list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- J-6 phrase list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- Ableton "Computer MIDI Keyboard" mapping (for keyboard shortcuts)

## Prototype Scope

**Definition of done**: polished until it's actually fun to play on the OP-1.

**In**: M1, M2, M3, M4, M5, M6, M7, M8, keyboard shortcuts (subset of M10).
**Out**: M9 (Style 6–9 phrases, no source data), rest of M10 polish (velocity, presets, persistence).

## Tech Stack

- **Build**: Vite
- **Framework**: Svelte 5 (using runes: `$state`, `$derived`, `$effect`)
- **Language**: TypeScript
- **Tests**: Vitest (focus: bank data correctness, phrase parsing)
- **MIDI**: WEBMIDI.js wrapper
- **Hosting**: local dev server only (Web MIDI requires non-`file://` origin)
- **Browser**: Chrome / Edge (Web MIDI not in Safari or Firefox)

## Milestones

Work in order. After each: commit, check off items, update Status at the bottom.

### M1: Data extraction

Convert J-6 chord set list and phrase list into structured TS modules.

**Chord banks** (`src/banks.ts`):

- [ ] Fetch Roland chord set page via WebFetch
- [ ] Parse 100 banks × 12 chords (one per chromatic key: C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- [ ] Each cell on Roland page = chord name + 4 notes in scientific notation (`C4`, `G3`); convert to MIDI integers (C4 = 60)
- [ ] Preserve enharmonic spellings as-published (`Bb` stays `Bb`, `A#` stays `A#` — Roland's choice carries musical context)
- [ ] Extract bank names too (needed for selector UI and Bank 14 fallback labels)
- [ ] Output shape: `Bank = { index: number; name: string; chords: Chord[] }`, `Chord = { name: string; notes: [number, number, number, number] }`
- [ ] Empty-chord-name fallback (e.g. Bank 14 "Oct Stack" has no chord names): label = `"${key} ${bankName}"` → `"C Oct Stack"`
- [ ] Verification: run extraction twice via independent agents, diff outputs, investigate mismatches
- [ ] Sanity checks: bank 1 `Cadd9` → `[48, 55, 62, 64]`; bank 14 (Oct Stack) `C` → `[60, 72]`

**Phrase data** (`src/phrases.ts`):

- [ ] Parse Style 1+2 metadata (arp parameters: direction, subdivision, triplet flag) — 12 variations each
- [ ] Parse Style 3 phrase durations (whole, half, quarter, 8th, 16th + triplet variants) — 12 variations
- [ ] Parse Style 4+5 rhythm gate patterns from explicit `o`/`_`/`o~`/`o~~` strings — 24 variations total
- [ ] Notation: `o` = 16th note hit, `_` = 16th rest, `o~` = 8th, `o~~` = dotted 8th
- [ ] Skip Style 6–9 (Roland publishes no note data)

### M2: MIDI plumbing

- [ ] Request MIDI access on load
- [ ] Output port selector dropdown (OP-1 appears as class-compliant USB MIDI device)
- [ ] Channel selector dropdown (1–16)
- [ ] `playChord(notes: number[], velocity: number)` and `releaseChord(notes: number[])`
- [ ] Manual test: hardcoded button sends C major to selected port

### M3: Chord pad UI

- [ ] 12 chord pads in piano layout mirroring J-6 hardware: 5 black-key pads on top row (C#, D#, F#, G#, A#), 7 white-key pads bottom row (C, D, E, F, G, A, B)
- [ ] Bank selector: dropdown listing all 100 banks ("01 — [bank name]") + prev/next arrow buttons
- [ ] Each pad displays the chord name from current bank (or empty-name fallback for banks like Oct Stack)
- [ ] Press → `playChord`, release → `releaseChord`
- [ ] Held-pad feedback: pad fills with accent color (J-6 orange) + subtle outer glow
- [ ] Top bar layout: `[Output ▾] [Channel ▾] [Bank ▾] [‹ ›] [Transpose: 0] [BPM] [Style ▾] [Variation ▾] [Latch ⊙]`

### M4: Arpeggiator

Driven by Style 1 (8th) + Style 2 (16th). 24 variations total.

- [ ] Engine parameterized by: direction (UP / DOWN / UP&DOWN), subdivision (8th / 16th, with triplet flag), octave range (±1, ±2)
- [ ] Driven by M6 clock
- [ ] When active style = Arp, pad press feeds chord notes into the arp engine; release stops the arp
- [ ] Style + variation pickers in UI top bar

### M5: Rhythm gate

Style 4 + Style 5: 24 explicit J-6 rhythm patterns (16-step grids using `o`/`_`/`o~`/`o~~`).

- [ ] Parse phrase strings into per-step events (hit + duration)
- [ ] On each `o`, send the held chord; release at gate length boundary
- [ ] Pattern selector in UI (within Style 4 or Style 5)
- [ ] Gate length control (slider, 0–100% of step)

### M6: Tempo / clock

- [ ] BPM control (40–240, default 110) in top bar
- [ ] Single shared clock drives M4 + M5 + Style 3 phrase durations
- [ ] `setInterval` at small tick (~5ms) is acceptable for prototype — no Web Audio API scheduler yet
- [ ] (Optional, defer) MIDI clock send (24 PPQ)
- [x] MIDI clock receive — TickSource at 24 PPQ, Input port selector + Int/Ext toggle in top bar

### M7: Latch / hold

- [ ] Latch toggle button in top bar
- [ ] Latched: pad press = start, press again = stop
- [ ] Smooth chord change while latched (no audible re-release between pads — chord transition handled gracefully)

### M8: OP-1 end-to-end test

- [ ] Plug OP-1 into Mac via USB
- [ ] Verify it appears in the output dropdown
- [ ] Full loop: pick bank → press pad → cycle through Hold / Arp / Phrase Dur / Rhythm Gate → OP-1 plays
- [ ] Latch test: latch on, switch chords smoothly
- [ ] "Fun to play" subjective check — if it doesn't feel good, iterate before declaring done

### Style selector (cross-cuts M3–M5)

Single dropdown in top bar selects active engine:

- **Hold** — chord pad press = chord on, release = chord off (M3 behavior)
- **Arp (Style 1)** — 8th-note arpeggiator, 12 variations
- **Arp (Style 2)** — 16th-note arpeggiator, 12 variations
- **Phrase Dur (Style 3)** — sustain chord for fixed note length (whole, half, quarter, 8th, 16th + triplets), 12 variations
- **Rhythm Gate (Style 4)** — 12 explicit rhythm patterns
- **Rhythm Gate (Style 5)** — 12 explicit rhythm patterns

Variation dropdown narrows selection within active style.

### Keyboard shortcuts (subset of M10)

Ableton "Computer MIDI Keyboard" mapping:

- **Whites (bottom row pads)**: A=C, S=D, D=E, F=F, G=G, H=A, J=B
- **Blacks (top row pads)**: W=C#, E=D#, T=F#, Y=G#, U=A#
- **Z** = transpose down 1 octave, **X** = transpose up 1 octave
- **C** / **V** = velocity ± (Ableton default, low priority)
- **← / →** = bank prev / next
- **Space** = toggle latch (suggested, confirm during build)

### M9 (out of prototype scope): Phrase library

Style 6–9 (Chord Phrases / Strummed Chord Phrases) — Roland publishes no note data. Options: skip, roll own, defer. Punt to post-prototype.

### M10 (out of prototype scope): Polish

Keyboard shortcuts pulled into prototype. Rest deferred:

- [ ] Velocity control
- [ ] Persist settings between sessions (last bank, BPM, output port, etc.)
- [ ] Save/recall favorite presets

## Status

| Milestone | Status |
|-----------|--------|
| M1 Data | ✅ phrases + 100 chord banks (note voicings need OP-1 spot-check — see M8) |
| M2 MIDI | ✅ WEBMIDI.js plumbing; real audio confirmed at M8 |
| M3 Chord pads | ✅ 5+7 piano layout, J-6 orange held-pad feedback |
| M4 Arp | ✅ Styles 1+2, all 24 variations |
| M5 Rhythm | ✅ Styles 4+5, 24 patterns, gate slider |
| M6 Clock | ✅ BPM 40-240, on-demand start (per Open decision below) |
| M7 Latch | ✅ Top-bar toggle + Space, mid-flight chord swap |
| M8 OP-1 test | ✅ OP-1 connects, banks + rhythm play, latch + transpose + keyboard work; subjective fun confirmed. Tempo sync (clock receive) tracked as immediate post-prototype follow-up. |
| M9 Phrases | ⬜ (out of prototype scope) |
| M10 Polish | 🟡 keyboard shortcuts shipped; velocity / persistence / presets deferred |

Style 3 (Phrase Dur, 12 variations) shipped alongside M4/M5 since they share the clock + engine pattern.

## Decisions

### ✅ Closed

- **Platform**: Web (browser) — iOS considered, dropped for prototype speed
- **Input**: Mouse clicks + keyboard (Ableton mapping)
- **Repo name**: `jay-6`
- **Stack**: Vite + Svelte 5 + TypeScript + Vitest
- **MIDI library**: WEBMIDI.js wrapper
- **Hosting / deploy**: local dev server only
- **Browser target**: Chrome / Edge (Web MIDI restriction)
- **File structure**: modular (Vite/Svelte default — component-per-file, modules for `banks.ts` / `phrases.ts` / MIDI / clock)
- **UI layout style**: 5+7 piano layout mirroring J-6 hardware
- **Bank selector**: dropdown + prev/next arrows
- **Pad feedback**: color flash + glow
- **MIDI channel**: selectable in UI (default 1)
- **Enharmonic handling**: preserve as-published
- **Chord data shape**: `{ name: string; notes: [number, number, number, number] }`
- **Bank 14 (and similar) label fallback**: `"${key} ${bankName}"`
- **Verification approach**: two independent extractions + diff
- **Sequencing scope**: Styles 1–5 in, Styles 6–9 out
- **Clock implementation**: `setInterval` for prototype, Web Audio API scheduler post-prototype if needed
- **Latch**: included in prototype

### 🟡 Open

#### Phrase styles 6–9
**Needed by**: M9 (post-prototype)

Roland publishes no note data for Chord Phrases / Strummed Chord Phrases. Options when M9 comes up: skip, roll own, reverse-engineer.

#### Roland chord voicing fidelity
**Needed by**: M8

Two independent WebFetch extractions of the Roland chord set page diverged on note values for ~30% of the 1,200 chord slots — the HTML table is dense and the summarized fetch loses cells. Shipped the more internally consistent run. Both pass the PLAN sanity checks (Bank 1 Cadd9, Bank 14 Oct Stack). If voicings sound off on the OP-1 during M8, spot-fix against the manual PDF or a hardware reference.

### ✅ Resolved during build

- **Default BPM startup**: clock starts on demand (engines lazy-create their `setInterval` on first `start()`); no surprise sound on load.
- **Latch spacebar binding**: shipped as Space = toggle latch. No conflict observed.
- **Smooth chord change while latched**: engines implement `setNotes()` for hot-swap (no restart). Hold/Phrase Dur release-old-then-play-new (single MIDI-event pair gap, inaudible). Arp keeps timeline position. Rhythm Gate swaps the in-flight hit if one is sounding.
