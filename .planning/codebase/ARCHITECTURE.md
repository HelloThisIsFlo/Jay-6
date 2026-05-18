<!-- refreshed: 2026-05-18 -->
# Architecture

**Analysis Date:** 2026-05-18

## System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                         Browser UI                               │
│  TopBar.svelte       PianoLayout.svelte         App.svelte        │
│  `src/components/`   `src/components/`          `src/App.svelte`  │
└──────────┬───────────────────┬──────────────────────┬────────────┘
           │ reads/writes      │ press/release events │ $effect bridges
           ▼                   ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│               Reactive State Layer                               │
│                 `src/state.svelte.ts`                            │
│  $state: bankIndex, style, variation, transpose,                 │
│           bpm, latch, gatePercent, clockSource                   │
└──────────────────────────┬───────────────────────────────────────┘
                           │ imperative calls via $effect
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Engine Host                                │
│                   `src/engines/host.ts`                          │
│  Orchestrates: latch logic, transpose, pad press/release,        │
│  engine lifecycle (build, swap, update variation)                │
└──────────┬───────────────────────────────────────────────────────┘
           │ delegates to active engine
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Engine (one active at a time)                │
│  HoldEngine         ArpEngine         PhraseDurationEngine       │
│  `engines/hold.ts`  `engines/arp.ts`  `engines/phraseDuration.ts`│
│                     RhythmGateEngine                             │
│                     `engines/rhythmGate.ts`                      │
│                                                                  │
│  All clock-driven engines subscribe to tickSource                │
└──────────┬───────────────────┬───────────────────────────────────┘
           │ subscribe         │ playChord / releaseChord
           ▼                   ▼
┌──────────────────┐  ┌────────────────────────────────────────────┐
│  tickSource      │  │  MIDI Layer                                │
│  `src/           │  │  `src/midi.ts`                             │
│  tickSource.ts`  │  │  WebMidi.js I/O, port mgmt,                │
│  24 PPQ stream   │  │  playChord / releaseChord / allNotesOff    │
│  internal or     │  └────────────────────┬───────────────────────┘
│  external MIDI   │                       │
│  clock input     │                       ▼
└──────────────────┘            Physical MIDI Output (OP-1 etc.)
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App.svelte` | Root: mounts host + tickSource, keyboard handlers, `$effect` bridges | `src/App.svelte` |
| `TopBar.svelte` | MIDI port select, bank/style/variation/BPM/clock/latch controls | `src/components/TopBar.svelte` |
| `PianoLayout.svelte` | 12-pad piano grid (5 black + 7 white), pointer events → press/release | `src/components/PianoLayout.svelte` |
| `state.svelte.ts` | Global `$state` rune object + typed setter functions | `src/state.svelte.ts` |
| `EngineHost` | Orchestrates latch, transpose, engine lifecycle, pad events | `src/engines/host.ts` |
| `HoldEngine` | Play/release chord directly, no clock | `src/engines/hold.ts` |
| `ArpEngine` | Arpeggiate chord at configurable subdivision + direction | `src/engines/arp.ts` |
| `PhraseDurationEngine` | Retrigger full chord at configurable note-value interval | `src/engines/phraseDuration.ts` |
| `RhythmGateEngine` | Play chord on explicit 16-step pattern hits with gate length | `src/engines/rhythmGate.ts` |
| `tickSource` | Single 24-PPQ tick stream, internal setInterval or external MIDI clock | `src/tickSource.ts` |
| `midi.ts` | WebMidi.js wrapper: enable, port list, output selection, note on/off | `src/midi.ts` |
| `banks.ts` | `Bank`/`Chord` types, `getBank()`, `labelFor()` helpers | `src/banks.ts` |
| `banks.data.ts` | Thin loader for the verified Roland extraction JSON | `src/banks.data.ts` |
| `banks.data.json` | 100 Roland J-6 chord banks (source of truth — do not edit by hand) | `src/banks.data.json` |
| `phrases.ts` | Style 1–5 variation data + `parseRhythmPattern()` | `src/phrases.ts` |
| `clock.ts` | BPM → ms and BPM → tick math helpers (pure functions, no state) | `src/clock.ts` |

## Pattern Overview

**Overall:** Reactive UI layer → imperative engine layer, bridged by `$effect`

**Key Characteristics:**
- Svelte 5 runes (`$state`, `$derived`, `$effect`) own all UI reactivity
- All imperative/timing-sensitive code lives in plain TypeScript classes (no Svelte primitives)
- `App.svelte` is the only bridge between the two worlds — via `$effect` calls
- Engines are tick-count-based and time-source-agnostic: they never call `Date.now()` or `setInterval`
- `tickSource` is the single timing authority; engines subscribe/unsubscribe on `start()`/`stop()`

## Layers

**UI Layer:**
- Purpose: Render controls and chord pads; dispatch user events
- Location: `src/App.svelte`, `src/components/`
- Contains: Svelte components using `$state`, `$derived`, `$props`, event handlers
- Depends on: State layer (reads `ui` object), EngineHost (calls `padPressed`/`padReleased`)
- Used by: Browser DOM

**State Layer:**
- Purpose: Reactive source of truth for all UI controls
- Location: `src/state.svelte.ts`
- Contains: Single `$state` object `ui` + typed setter functions with validation/clamping
- Depends on: Nothing (no imports from engine or MIDI layers)
- Used by: All Svelte components; `App.svelte` bridges it to the engine layer

**Engine Host Layer:**
- Purpose: Orchestrate latch convention, transpose, engine lifecycle
- Location: `src/engines/host.ts`
- Contains: `EngineHost` class; `buildEngine()` factory; transpose helper
- Depends on: All engine implementations, `midi.ts` (for `allNotesOff`), `phrases.ts` (for style data)
- Used by: `App.svelte` exclusively

**Engine Layer:**
- Purpose: Produce MIDI note-on/note-off calls according to style timing
- Location: `src/engines/` (`hold.ts`, `arp.ts`, `phraseDuration.ts`, `rhythmGate.ts`, `types.ts`)
- Contains: Engine classes implementing `Engine` interface (`start`, `setNotes`, `stop`, `setBpm`)
- Depends on: `midi.ts` (playChord/releaseChord), `tickSource.ts` (subscribe), `clock.ts` (tick math)
- Used by: `EngineHost`

**Timing Layer:**
- Purpose: Emit a 24-PPQ tick stream from either internal setInterval or external MIDI clock input
- Location: `src/tickSource.ts`, `src/clock.ts`
- Contains: `TickSourceImpl` singleton exported as `tickSource`; pure BPM→tick math in `clock.ts`
- Depends on: `webmidi` (for external clock input), `clock.ts`
- Used by: All clock-driven engines; `App.svelte` (to set BPM and mode)

**MIDI Layer:**
- Purpose: WebMidi.js initialisation, port enumeration/selection, note send/receive
- Location: `src/midi.ts`
- Contains: Manual pub/sub state for MIDI port status; `playChord`, `releaseChord`, `allNotesOff`
- Depends on: `webmidi` package
- Used by: Engines, `EngineHost` (panic), `TopBar.svelte` (port select), `App.svelte` (subscribe for input id)

**Data Layer:**
- Purpose: Static Roland J-6 chord and phrase data
- Location: `src/banks.data.json`, `src/banks.data.ts`, `src/banks.ts`, `src/phrases.ts`
- Contains: 100 chord banks (JSON), typed variation arrays for Styles 1–5
- Depends on: Nothing
- Used by: `EngineHost` (style data), `PianoLayout.svelte` (chord notes), `TopBar.svelte` (bank list)

## Data Flow

### Pad Press → MIDI Note On

1. User clicks pad or presses keyboard key (`App.svelte` — `handlePointerDown` / `onKeyDown`)
2. `press(key, notes)` called in `App.svelte` (`src/App.svelte:48`)
3. `host.padPressed(key, rawNotes)` called on `EngineHost` (`src/engines/host.ts:61`)
4. Host applies transpose, evaluates latch convention, calls `engine.start(transposedNotes)` or `engine.setNotes(transposedNotes)`
5. Clock-driven engines (`ArpEngine`, `PhraseDurationEngine`, `RhythmGateEngine`) call `tickSource.subscribe()` and fire on tick modulus
6. `HoldEngine` calls `playChord(notes)` immediately
7. `playChord` → `WebMidi.getOutputById().channels[ch].sendNoteOn()` → MIDI wire (`src/midi.ts:116`)

### TickSource → Engine → MIDI

1. `tickSource` fires tick every `tickIntervalMs(bpm)` ms (internal) or on MIDI `clock` message (external)
2. Each subscribed engine's `onTick()` callback fires (`src/engines/arp.ts:81`, `rhythmGate.ts:71`, `phraseDuration.ts:50`)
3. Engine counts ticks; fires `playChord` / `releaseChord` at calculated modulus boundaries
4. MIDI note events sent via `src/midi.ts`

### State Change → Engine Update

1. User changes BPM/style/variation/transpose/latch/gate in `TopBar.svelte`
2. Setter function mutates `ui` object in `src/state.svelte.ts` (e.g., `setBpm(n)`)
3. `$effect` in `App.svelte` re-runs (e.g., `$effect(() => { host.setBpm(ui.bpm); tickSource.setBpm(ui.bpm); })`)
4. Imperative host/tickSource method called synchronously

### External Clock (Int/Ext Toggle)

1. User selects MIDI input port + clicks "Ext" in `TopBar.svelte`
2. `selectInput(id)` → `midi.ts` state, notifies listeners
3. `App.svelte` `onMount` subscriber calls `tickSource.setInputId(selectedInputId)`
4. `$effect` calls `tickSource.setMode('external')`
5. `tickSource` detaches internal setInterval, attaches MIDI `clock` listener on the input

## Key Abstractions

**`Engine` interface:**
- Purpose: Uniform contract for all playback styles
- File: `src/engines/types.ts`
- Pattern: `start(notes)` = fresh timeline + immediate first hit; `setNotes(notes)` = swap chord, keep timeline; `stop()` = release all, unsubscribe; `setBpm(bpm)` = no-op on all tick-based engines (TickSource owns BPM)

**`TickSourceImpl` singleton:**
- Purpose: Decouple timing source from consumers; supports hot-swap between internal/external clock
- File: `src/tickSource.ts`
- Pattern: `subscribe(fn)` returns unsubscribe; auto-activates on first subscriber, deactivates on last unsubscribe

**`EngineHost`:**
- Purpose: Roland J-6 latch convention + multi-pad state management above the Engine interface
- File: `src/engines/host.ts`
- Pattern: Holds `heldPads` set and `latchedKey`; delegates note events to the active engine only

**`ui` ($state object):**
- Purpose: Single flat reactive state atom for all UI controls
- File: `src/state.svelte.ts`
- Pattern: Exported as `ui`; mutated only through typed setter functions that clamp/validate values

## Entry Points

**`src/main.ts`:**
- Mounts `App` into `#app` DOM element
- Triggers: Vite dev server or built `index.html`
- Responsibilities: Single `mount()` call; nothing else

**`src/App.svelte`:**
- Creates `EngineHost` instance, registers `$effect` bridges, keyboard event handlers, MIDI subscription
- Triggers: Svelte component mount
- Responsibilities: Bridge between reactive state and all imperative subsystems (host, tickSource, keyboard)

## Architectural Constraints

- **Threading:** Single-threaded browser event loop. `tickSource` internal timer uses `setInterval` (drift acceptable per prototype decision). No Web Workers.
- **Global state:** `tickSource` is a module-level singleton (`src/tickSource.ts:120`). `midi.ts` state object is module-level but non-Svelte (manual pub/sub). `ui` in `src/state.svelte.ts` is a module-level `$state` object.
- **Circular imports:** None detected. Dependency direction is strictly: UI → state, UI → engines (via App), engines → midi, engines → tickSource, engines → clock. No upward imports.
- **Web MIDI constraint:** Requires secure context (localhost or HTTPS). MIDI I/O cannot be proxied — the OP-1 must connect to the same machine running the browser session.
- **Svelte $state in .ts:** `$state` runes require `.svelte.ts` extension for non-component files — hence `state.svelte.ts`. `midi.ts` uses plain manual pub/sub because it runs at import time outside a component context.

## Anti-Patterns

### Calling `Date.now()` or `setInterval` inside an Engine

**What happens:** Engine creates its own timer independent of `tickSource`
**Why it's wrong:** Breaks external MIDI clock sync; two timers drift; tempo changes don't propagate
**Do this instead:** Subscribe to `tickSource` in `start()`, count ticks to modulus — see `src/engines/arp.ts:58`

### Mutating `ui` directly without setter functions

**What happens:** `ui.bpm = 300` bypasses clamping
**Why it's wrong:** Out-of-range values (bpm > 240, bankIndex out of 1..100) reach engines unchecked
**Do this instead:** Always use the exported setters (`setBpm`, `setBank`, etc.) in `src/state.svelte.ts`

### Placing imperative engine calls in a Svelte component other than `App.svelte`

**What happens:** A component calls `host.setStyle()` directly on user interaction
**Why it's wrong:** Bypasses the `$effect` bridge; state and engine can desync
**Do this instead:** Mutate `ui` via setters; let `App.svelte`'s `$effect` propagate to the host

## Error Handling

**Strategy:** Fail-fast on invariant violations (e.g., `parseRhythmPattern` throws on bad input); MIDI errors surfaced as `MidiStatus` enum in `midi.ts` state and reflected in UI dropdowns.

**Patterns:**
- MIDI init errors are caught in `initMidi()` and stored as `state.status` / `state.error`; `TopBar.svelte` renders them inline in the Output dropdown
- `parseRhythmPattern` throws on malformed pattern strings — only called at module init time from static data
- Engine `stop()` always cleans up subscriptions and releases notes; called defensively in `start()` before re-subscribing

## Cross-Cutting Concerns

**Logging:** None — no structured logging. Browser devtools console only.
**Validation:** Input clamping in setter functions (`src/state.svelte.ts`). Note range filter in `transposeNotes` (host.ts) and `playChord` (midi.ts).
**Authentication:** None — purely client-side browser app.

---

*Architecture analysis: 2026-05-18*
