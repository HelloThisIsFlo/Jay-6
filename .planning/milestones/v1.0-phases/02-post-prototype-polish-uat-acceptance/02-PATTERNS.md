# Phase 2: Post-prototype polish + UAT acceptance — Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 14 (11 source, 1 test, 2 docs)
**Analogs found:** 13 / 14 (MANUAL.md is the only file with no in-repo analog)

> **Reading guide.** Every pattern is a copy-from instruction with file path + line numbers. The planner should reference these excerpts inside each plan's action steps rather than re-deriving conventions. Where multiple analogs apply, the closest is named first; secondary analogs are noted as "see also."

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/tickSource.ts` | service (singleton) | event-driven (pub-sub) | self (extend in-place) | exact — already owns the surface |
| `src/clock.ts` | utility (pure math) | transform | self + `clock.ts:47-50` (`ticksPerStep`) | exact — same family of helpers |
| `src/engines/host.ts` | service (orchestrator) | event-driven | self (`panic()` lines 102-107, `setLatch` 143-152) | exact — already the home for lifecycle/state |
| `src/engines/rhythmGate.ts` | service (engine) | event-driven (tick-stream) | `arp.ts` start()/onTick() lines 52-88 | exact — same Engine interface |
| `src/engines/phraseDuration.ts` | service (engine) | event-driven (tick-stream) | `rhythmGate.ts` start() lines 42-49 | exact — same Engine interface |
| `src/engines/arp.ts` | service (engine) | event-driven (tick-stream) | self lines 52-61 | exact — modify in-place |
| `src/midi.ts` | service (MIDI I/O wrapper) | event-driven | self lines 107-136 (`getChannel` + `playChord`) | exact — extend with same defensive pattern |
| `src/App.svelte` | component (root bridge) | event-driven (`$effect`) | self lines 27-35 (existing `$effect` bridges + `onMount` subscribe) | exact — add one more bridge in same pattern |
| `src/components/TopBar.svelte` | component (UI controls) | request-response | `PianoLayout.svelte` lines 87-100 (`user-select`, `touch-action`) | role-match — copy CSS contract |
| `src/components/PianoLayout.svelte` | component (UI) | request-response | self lines 134-139 (`.pad.black` block) | exact — edit in-place |
| `test/clock.test.ts` | test (pure math) | unit | self lines 13-65 (existing describe block) | exact — append new describe |
| `test/banks.test.ts` | test (data shape) | unit | self lines 50-95 (anchor-style assertions, 7 already shipped) | exact — verify-only per Open Q1 |
| `MANUAL.md` (NEW) | doc (consumer manual) | doc | `README.md` lines 1-61 (emoji-headed sections, table format) | role-match — repo doc tone reference |
| `README.md` | doc | doc | self (one line addition) | exact — append link |

---

## Pattern Assignments

### `src/clock.ts` — add `nextDownbeatTick()` (utility, transform)

**Analog:** `src/clock.ts:42-50` (existing `ticksPerStep` helper).

**Imports pattern** — none needed; the helper uses only the existing `TICKS_PER_QUARTER` constant. Do not add `import` statements.

**Existing helper pattern to mirror** (lines 42-50):
```typescript
// MIDI clock standard: 24 ticks per quarter note.
export const TICKS_PER_QUARTER = 24;

// Convert a musical step to MIDI ticks. All J-6 step values resolve to
// integers at 24 PPQ (8th=12, 16th=6, triplet 8th=8, triplet 16th=4, etc.).
export function ticksPerStep(duration: PhraseDuration, triplet: boolean): number {
  const base = QUARTER_PER_NOTE[duration] * TICKS_PER_QUARTER;
  return triplet ? Math.round((base * 2) / 3) : base;
}
```

**Apply (per RESEARCH.md Pattern 2 + Pitfall 3):**
```typescript
// Returns the next MIDI tick value (24 PPQ) that lands on a quarter-note boundary.
// At currentTick = 0 → 24, at 23 → 24, at 24 → 48. Never returns currentTick itself.
export function nextDownbeatTick(currentTick: number): number {
  return (Math.floor(currentTick / TICKS_PER_QUARTER) + 1) * TICKS_PER_QUARTER;
}
```

**Conventions enforced:**
- `SCREAMING_SNAKE_CASE` for constants — reuse `TICKS_PER_QUARTER`, don't redeclare `24`.
- Comment is WHY-only (boundary semantics + "never returns currentTick itself").
- Explicit return type `number`.
- Pure function — no module state, no `Date.now()`.

---

### `src/tickSource.ts` — emit `sendClock()` on internal tick (service, pub-sub)

**Analog:** self — `tickSource.ts:111-117` (existing `emitTick`/`emitTransport`) + `midi.ts:107-112` (defensive optional-chain pattern).

**Imports to add at top** (mirror existing line 1):
```typescript
import { WebMidi, type Input } from 'webmidi';   // already present
import { getMidiState } from './midi';            // ADD
```

**Existing `emitTick` to extend** (lines 111-113):
```typescript
private emitTick(): void {
  for (const l of this.listeners) l();
}
```

**Defensive pattern to mirror from `midi.ts:107-112`:**
```typescript
function getChannel(): OutputChannel | null {
  if (state.status !== 'ready' || !state.selectedOutputId) return null;
  const output: Output | undefined = WebMidi.getOutputById(state.selectedOutputId);
  if (!output) return null;
  return output.channels[state.channel] ?? null;
}
```

**Apply (per RESEARCH.md Pattern 3 + Pitfall 1):**
```typescript
private emitTick(): void {
  // D-02: clock send is always-on when Int, never when Ext (we are the slave then).
  if (this.mode === 'internal') {
    const outId = getMidiState().selectedOutputId;
    if (outId) WebMidi.getOutputById(outId)?.sendClock();
  }
  for (const l of this.listeners) l();
}
```

**Conventions enforced:**
- Optional chain `?.sendClock()` — silent no-op when output not ready (matches `playChord`'s guard-and-return style, see `midi.ts:117-122`).
- Comment cites the decision ID (`D-02`) per project convention (`tickSource.ts:74-75` does the same with prototype-drift rationale).
- No new `setInterval` — piggy-backs the existing timer (DEC-engines-time-source-agnostic). RESEARCH.md anti-pattern: "Don't create a separate `transport.ts` module for ~30 lines of wiring."

---

### `src/engines/host.ts` — transport handler + arm/resume + double-trigger guard (orchestrator, event-driven)

**Analog:** self — `host.ts:102-107` (`panic()`), `host.ts:143-152` (`setLatch`), `host.ts:61-99` (`padPressed`/`padReleased`).

**Existing patterns to mirror:**

*Guard + return + cleanup* (lines 102-107):
```typescript
panic(): void {
  this.engine.stop();
  this.playing = false;
  this.latchedKey = null;
  allNotesOff();
}
```

*Conditional state mutation with comment* (lines 143-152):
```typescript
setLatch(latch: boolean): void {
  const was = this.cfg.latch;
  this.cfg.latch = latch;
  // Turning latch OFF while engine is playing and no pads held → stop.
  if (was && !latch && this.heldPads.size === 0 && this.playing) {
    this.engine.stop();
    this.playing = false;
  }
  if (!latch) this.latchedKey = null;
}
```

*Imports* (lines 1-8 — already present; ADD `WebMidi` + `getMidiState`):
```typescript
import { allNotesOff } from '../midi';                  // existing
import { WebMidi } from 'webmidi';                       // ADD
import { getMidiState } from '../midi';                  // ADD (or expand existing line)
```

**Apply (per RESEARCH.md Patterns 4, 5; Pitfall 2, 5):**
```typescript
// D-05 debounce window — single tuneable constant, sourced from CONTEXT.md.
private static readonly START_DEBOUNCE_MS = 200;
private lastStartMs = 0;
private armedPosition: 'fresh' | 'resume' | null = null;

// D-02 (master mode only). Mirrors playChord guard style — no-op on unready output.
private sendTransport(kind: 'start' | 'stop' | 'continue'): void {
  if (this.cfg.clockMode !== 'internal') return;
  const outId = getMidiState().selectedOutputId;
  if (!outId) return;
  const out = WebMidi.getOutputById(outId);
  if (kind === 'start')         out?.sendStart();
  else if (kind === 'stop')     out?.sendStop();
  else                          out?.sendContinue();
}

// Inbound transport from tickSource → engine lifecycle (D-04).
onTransport(kind: 'start' | 'stop' | 'continue'): void {
  if (this.cfg.clockMode !== 'external') return;   // ignore inbound when we're master
  if (kind === 'start') {
    // D-05: monotonic clock — NTP-immune; mirrors performance.now() pattern in
    // browser debounce conventions (NOT Date.now() — see Pitfall 2).
    const now = performance.now();
    if (now - this.lastStartMs < EngineHost.START_DEBOUNCE_MS) return;
    this.lastStartMs = now;
    this.armedPosition = 'fresh';
  } else if (kind === 'continue') {
    this.armedPosition = 'resume';
  } else { // stop
    this.panic();   // reuse existing all-clean path — see Pitfall 5
  }
}

// Mode-switch hard stop (D-03). Called from App.svelte $effect before setMode().
panicForModeSwitch(): void {
  this.panic();   // alias for clarity at the call site; same semantics as user-pressed Panic.
}
```

**Conventions enforced:**
- `private static readonly` for `START_DEBOUNCE_MS` — mirrors `clock.ts:43` `TICKS_PER_QUARTER` constant style at class scope.
- Decision-ID comments (`D-04`, `D-05`, `D-03`) — pattern from `host.ts:67-69` (`Roland J-6 HOLD convention`).
- `performance.now()` not `Date.now()` — explicitly called out in Pitfall 2.
- Reuses `panic()` instead of inventing a new cleanup path — Pitfall 5 explicitly warns against this.
- HostConfig needs a `clockMode: ClockSource` field — add per existing field style at lines 10-17.

**Open: where `sendStart()` is called from on engine first-fire (D-02 cont., RESEARCH.md Pattern 4).** Two acceptable locations per RESEARCH.md:
1. Inside `padPressed()` `if (!this.playing)` branch (line 75-78) — fires on first audible note. **Recommended** — semantic match.
2. Inside `start()` of each engine — rejected per DEC-engine-orchestrator (transport semantics belong in host, not engines).

---

### `src/engines/rhythmGate.ts` — downbeat alignment at start() under Ext (engine, tick-stream)

**Analog:** self — `rhythmGate.ts:42-49` (`start()`), `arp.ts:52-61` (same shape).

**Existing `start()` to extend** (lines 42-49):
```typescript
start(notes: number[]): void {
  this.stop();
  this.heldNotes = [...notes];
  this.tickCount = 0;
  this.unsubscribe = tickSource.subscribe(() => this.onTick());
  if (notes.length === 0) return;
  this.evaluateStep();
}
```

**Apply (per RESEARCH.md Pattern 2 + D-06/D-07):**
```typescript
// Field added near the other tick-related fields (~line 22).
private armUntilTick: number | null = null;

start(notes: number[]): void {
  this.stop();
  this.heldNotes = [...notes];
  this.tickCount = 0;
  this.unsubscribe = tickSource.subscribe(() => this.onTick());
  if (notes.length === 0) return;

  // D-06: under Ext clock, defer first fire until next downbeat (tick % 24 === 0).
  // D-07: Int mode unchanged — fires immediately to preserve live-feel.
  if (tickSource.getMode() === 'external') {
    this.armUntilTick = nextDownbeatTick(this.tickCount);  // = 24 at tickCount=0
  } else {
    this.evaluateStep();
  }
}

// onTick extension — short-circuit while arming. Add at top of existing onTick (line 71).
private onTick(): void {
  if (this.armUntilTick !== null) {
    if (this.tickCount < this.armUntilTick) { this.tickCount += 1; return; }
    this.armUntilTick = null;
    this.evaluateStep();   // first audible hit lands on the downbeat
    return;
  }
  // ... existing logic continues unchanged ...
}
```

**Pitfall 4 fix (CONCERNS.md callout — touch while in the file):** change line 89
```typescript
const stepIndex = (this.tickCount / this.ticksPerStep) % 16;
```
to
```typescript
const stepIndex = Math.floor(this.tickCount / this.ticksPerStep) % 16;
```
Defensive against dropped ticks under external clock (RESEARCH.md Pitfall 4).

**Imports to add:**
```typescript
import { nextDownbeatTick, ticksPerSixteenth } from '../clock';   // extend existing line 2
```

**Conventions enforced:**
- Engine never calls `setTimeout`/`setInterval` (DEC-engines-time-source-agnostic) — alignment uses the same `tickSource.subscribe` stream.
- `armUntilTick: number | null` follows existing nullable-state field style (`active: ActiveHit | null` line 22).
- Decision-ID comments inline.

---

### `src/engines/phraseDuration.ts` — same alignment fix (engine, tick-stream)

**Analog:** `rhythmGate.ts` (the alignment edit above) — apply identical shape.

**Existing `start()`** (lines 26-33):
```typescript
start(notes: number[]): void {
  this.stop();
  this.heldNotes = [...notes];
  this.ticksUntilNext = this.ticksPerStep;
  this.unsubscribe = tickSource.subscribe(() => this.onTick());
  if (notes.length === 0) return;
  this.fire();
}
```

**Apply (mirror rhythmGate alignment block; this engine has its own tickCount-equivalent via `ticksUntilNext`):**
- Track an absolute `tickCount` field if needed for `nextDownbeatTick()` input, OR
- Reset `ticksUntilNext = nextDownbeatTick(0) - 0 = 24` under Ext mode, since this engine fires on `ticksUntilNext` countdown.

**Simpler variant** (RECOMMENDED — fits this engine's countdown shape):
```typescript
start(notes: number[]): void {
  this.stop();
  this.heldNotes = [...notes];
  // D-06: under Ext, first fire waits for the next quarter-note boundary (24 ticks).
  // D-07: under Int, fire immediately (ticksUntilNext=ticksPerStep but fire() called now).
  this.ticksUntilNext = tickSource.getMode() === 'external'
    ? TICKS_PER_QUARTER
    : this.ticksPerStep;
  this.unsubscribe = tickSource.subscribe(() => this.onTick());
  if (notes.length === 0) return;
  if (tickSource.getMode() === 'internal') this.fire();
}
```

**Imports to add:**
```typescript
import { ticksPerStep, TICKS_PER_QUARTER } from '../clock';   // extend existing line 2
```

---

### `src/engines/arp.ts` — same alignment fix (engine, tick-stream)

**Analog:** `phraseDuration.ts` (above) — `arp.ts` uses the same `ticksUntilNext` countdown shape.

**Existing `start()`** (lines 52-61):
```typescript
start(notes: number[]): void {
  this.stop();
  this.heldNotes = [...notes];
  this.sequence = buildSequence(this.heldNotes, this.variation);
  this.idx = 0;
  this.ticksUntilNext = this.ticksPerStep;
  this.unsubscribe = tickSource.subscribe(() => this.onTick());
  if (this.sequence.length === 0) return;
  this.fireNext();
}
```

**Apply (mirror phraseDuration variant — same countdown semantics):**
```typescript
this.ticksUntilNext = tickSource.getMode() === 'external'
  ? TICKS_PER_QUARTER
  : this.ticksPerStep;
// ...
if (tickSource.getMode() === 'internal') this.fireNext();
```

**Imports to add:**
```typescript
import { arpTicksPerStep, TICKS_PER_QUARTER } from '../clock';   // extend existing line 2
```

**Note for planner.** All three engines share this exact shape — the planner may bundle into one "alignment" task if the test plan stays focused on `nextDownbeatTick` math + UAT for live-feel.

---

### `src/midi.ts` — possible `getSelectedOutput()` helper (utility, MIDI I/O)

**Analog:** self — `midi.ts:107-112` (`getChannel()`).

**Decision for planner.** RESEARCH.md mentions this as optional. Two paths:

1. **Inline access** in `tickSource.ts` + `host.ts`:
   ```typescript
   const outId = getMidiState().selectedOutputId;
   WebMidi.getOutputById(outId)?.sendClock();
   ```
   No `midi.ts` change. Smallest diff. **Recommended.**

2. **Add helper** mirroring `getChannel`:
   ```typescript
   // Lines 107-112 pattern:
   export function getSelectedOutput(): Output | null {
     if (state.status !== 'ready' || !state.selectedOutputId) return null;
     return WebMidi.getOutputById(state.selectedOutputId) ?? null;
   }
   ```
   Trades one extra export for two duplicate call sites cleaned up. Worth it if the planner adds ≥3 send-clock/send-transport call sites.

---

### `src/App.svelte` — `$effect` bridge for transport receive (component, event-driven)

**Analog:** self — `App.svelte:27-35` (existing six `$effect` bridges + `onMount` MIDI subscribe).

**Existing pattern to mirror** (lines 26-35):
```typescript
// Bridge reactive UI state → imperative host + tickSource calls.
$effect(() => { host.setBpm(ui.bpm); tickSource.setBpm(ui.bpm); });
$effect(() => { host.setStyle(ui.style, ui.variation); });
$effect(() => { host.setTranspose(ui.transpose); });
$effect(() => { host.setLatch(ui.latch); });
$effect(() => { host.setGatePercent(ui.gatePercent); });
$effect(() => { tickSource.setMode(ui.clockSource); });

onMount(() => subscribeMidi((s) => tickSource.setInputId(s.selectedInputId)));
```

**Apply (per RESEARCH.md Pattern 1 + D-03):**
```typescript
// Forward inbound transport to the host (D-04 hybrid model: arm engines on Start, etc.)
onMount(() => tickSource.subscribeTransport((kind) => host.onTransport(kind)));

// Mode switch = hard stop (D-03). Replaces the existing one-liner on line 32.
$effect(() => {
  host.panicForModeSwitch();   // existing panic() under a clearer name — see host.ts changes
  host.setClockMode(ui.clockSource);  // tell host who the master is (for sendTransport gating)
  tickSource.setMode(ui.clockSource);
});
```

**Conventions enforced:**
- One `$effect` per concern — mirrors the line-per-effect style at lines 27-32.
- `onMount` returns unsubscribe — mirrors line 35's pattern.
- No new state added to `state.svelte.ts` for transport — D-04's "armed" state lives in the host (`armedPosition` field), NOT in UI state. Reason: it's engine-lifecycle state, not user-facing.

---

### `src/components/TopBar.svelte` — iPad CSS pass (component, UI)

**Analog:** `PianoLayout.svelte:87-100` (existing `user-select` + `touch-action`).

**Existing pattern to mirror** (lines 87-100):
```css
.piano {
  display: grid;
  /* ... */
  user-select: none;
  touch-action: none;
}
.pad {
  /* ... */
}
.pad:active { transform: translateY(1px); }
```

**Apply (per UI-SPEC Interaction Contract + RESEARCH.md Pattern 7):**

Extend the existing `.topbar` block (line 205) and per-element selectors:
```css
.topbar {
  /* ... existing styles ... */
  user-select: none;
  -webkit-user-select: none;   /* still needed in Safari 17 / Web MIDI Browser */
}

/* touch-action: manipulation kills 300ms tap delay + double-tap zoom (D-08). */
button, input[type='number'], input[type='range'] {
  touch-action: manipulation;
}

/* Apple HIG 44pt min — per-element, NOT global. Global breaks <select> options.
   (RESEARCH.md Pitfall 6 — leave touch-action OFF on <select> to keep dropdowns
   working on iPad.) */
.arrow, .latch, .seg button, .transpose button {
  min-width: 44px;
  min-height: 44px;
}

/* :active = touch substitute for :hover (UI-SPEC Visual Contract). */
.arrow:active, .latch:active, .seg button:active, .transpose button:active {
  filter: brightness(1.15);
}
```

**Conventions enforced:**
- Scoped Svelte `<style>` block — no global CSS modules.
- Component-scoped CSS extends existing class selectors — no rename, no refactor.
- Per-element `min-width`/`min-height` per RESEARCH.md Pitfall 6 (global selector breaks `<select>` options on iPad).
- Use UI-SPEC fallback ladder (Option B → A → C → D) if first attempt reads poorly on iPad.

**Body scroll lock** belongs in `App.svelte` `<style>` block, NOT here (must be `:global(html), :global(body)` from app root):
```css
/* src/App.svelte <style> addition — RESEARCH.md Pattern 6 */
@media (pointer: coarse) and (max-width: 1366px) {
  :global(html), :global(body) {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    overscroll-behavior: none;
  }
}
```

---

### `src/components/PianoLayout.svelte` — black-key fix (component, UI)

**Analog:** self — `PianoLayout.svelte:134-139` (existing `.pad.black` block).

**Existing block to modify** (lines 134-139):
```css
.pad.black {
  background: #1f1f1f;
  color: #eee;
  min-height: 110px;
  border-color: #2a2a2a;
}
```

**Apply (per UI-SPEC Option B — selected treatment):**
```css
.pad.black {
  background: #2e2e2e;                                  /* was #1f1f1f — D-10 Option B */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);  /* 1px inset top highlight */
  color: #eee;
  min-height: 110px;
  border-color: #2a2a2a;
}
```

**Conventions enforced:**
- Comment cites the decision ID (`D-10`) AND the option letter — preserves traceability if the executor walks the fallback ladder.
- No other selectors changed — held-pad highlight at line 140 keeps `#ff7a1a` (UI-SPEC: locked).
- Held-state `!important` (existing line 141) preserved — needed to override the new `box-shadow`.

**Fallback ladder reminder** (UI-SPEC Option A/C/D) — executor may pivot down without re-invoking `/gsd:ui-phase`. Document the chosen step in verify-phase notes.

---

### `test/clock.test.ts` — nextDownbeatTick cases (test, unit)

**Analog:** self — `clock.test.ts:13-65` (existing describe block) + RESEARCH.md Code Examples section.

**Existing pattern to mirror** (lines 38-44):
```typescript
it('TICKS_PER_QUARTER = 24 (MIDI standard)', () => {
  expect(TICKS_PER_QUARTER).toBe(24);
});

it('ticksPerSixteenth = 6', () => {
  expect(ticksPerSixteenth()).toBe(6);
});
```

**Apply (per RESEARCH.md Code Examples + Pitfall 3):**
```typescript
import { nextDownbeatTick } from '../src/clock';   // extend existing import block lines 2-11

describe('nextDownbeatTick', () => {
  it('returns next downbeat — never returns the same tick when already on one', () => {
    expect(nextDownbeatTick(0)).toBe(24);
    expect(nextDownbeatTick(24)).toBe(48);
    expect(nextDownbeatTick(96)).toBe(120);
  });

  it('rounds up partial counts to next 24-boundary', () => {
    expect(nextDownbeatTick(1)).toBe(24);
    expect(nextDownbeatTick(23)).toBe(24);
    expect(nextDownbeatTick(25)).toBe(48);
    expect(nextDownbeatTick(47)).toBe(48);
  });
});
```

**Conventions enforced:**
- Explicit `import { describe, expect, it } from 'vitest'` style — already at line 1 of the file.
- `it('description, includes the WHY')` — see line 38 for the "MIDI standard" qualifier style.
- Group by helper name in a sibling `describe` block — matches existing `describe('clock', ...)` at line 13.

---

### `test/banks.test.ts` — verify, do not extend (test, unit)

**Analog:** self — lines 50-95 already contain 7 anchors (2 original + 5 reconciliation, shipped commit `f2d5d59`).

**Per RESEARCH.md Open Question Q1.** D-19 says "extend with 3–5 high-confidence reconciled slots." This is **already done**. Existing anchors:

| Line | Bank/Key | Chord | Notes |
|------|----------|-------|-------|
| 51-55 | 1/C  | Cadd9   | `[48, 55, 62, 64]`     | (original)         |
| 57-63 | 14/C | Oct Stack | `[60, 72]`           | (original)         |
| 67-71 | 1/A  | FM/A    | `[45, 57, 60, 65]`     | (f2d5d59)          |
| 73-77 | 30/A | G/B     | `[47, 55, 59, 62]`     | (f2d5d59)          |
| 79-83 | 46/A | Em      | `[52, 59, 67]`         | (f2d5d59)          |
| 85-89 | 79/A | F7/A    | `[57, 63, 65]`         | (f2d5d59)          |
| 91-95 | 95/C | FM7/E   | `[64, 65, 69]`         | (f2d5d59)          |

**Recommended planner action.** Verify-only — no test additions. Add a one-line plan-step task that runs `vitest run test/banks.test.ts` and confirms all 7 anchors pass. D-19's spirit is satisfied at 5 reconciliation anchors (the literal target).

If the user explicitly wants more, add 2-3 from genres not yet covered (e.g., a jazz bank, a triad bank) — but RESEARCH.md recommends skipping.

---

### `MANUAL.md` (NEW at repo root) — consumer manual (doc)

**Analog:** `README.md:1-61` — emoji-headed sections, table format, conversational tone.

**Closest in-repo style anchor** (README.md lines 8-16, 26-36, 41-51):
```markdown
## ✨ What it does

- 🎵 **All 100 Roland J-6 chord banks**, 12 chords each — extracted straight from Roland's manual
- 🎛️ **12-pad piano layout** mirroring the J-6 hardware (5 black on top, 7 white on bottom)
- 🌀 **5 playback styles**: Hold · Arp 8th · Arp 16th · Phrase Duration · Rhythm Gate × 2 — 60 variations total

## ⌨️ Keyboard

| Keys | What |
|---|---|
| `A S D F G H J` | White pads (C D E F G A B) |
```

**External aesthetic anchor** (per D-13, RESEARCH.md): Teenage Engineering Pocket Operator manuals — compact, friendly, function-first, one screen per concept, no apology, no "tip" boxes — just "press this, hear that."

**Anti-reference** (per D-13): Roland J-6 manual itself. Terse, internals-leaking, weak structure.

**Required sections (D-14, in order):**

1. **Setup** — Chrome/Edge requirement, HTTPS vs .dev/.ai URLs, MIDI permission prompt, picking Output/Input/Channel.
2. **Pads + chords** — 100 banks, transpose (`±`/Z/X), latch (button/Space), Ableton-style keyboard mapping (A/W/S/E/...).
3. **Styles** — Hold / Arp 1 / Arp 2 / Phrase Dur / Rhythm Gate 4+5; what each variation does; when to use which.
4. **Clock + transport sync** — Int vs Ext; BPM; chaining OP-1 as master or slave; what Start/Stop/Continue/Record do; iPad workflow under Web MIDI Browser.

**URL matrix to lift from README.md:33-37 + README.md:41-49:**
| Surface | URL | Caveat |
|---|---|---|
| Local dev | `http://localhost:5173` | Run `just dev` |
| Tunnel | `https://jay-6.kempenich.dev` | Run `just serve` from Flo's Mac only |
| Always-on | `https://jay-6.kempenich.ai` | K8s cluster; MIDI is local-machine-only (Web MIDI can't be proxied) |

**Conventions enforced:**
- Emoji on H2 headers ONLY — sub-headers and bullets stay clean (matches README.md style).
- Tables for matrices (browser support, keyboard map, URL list).
- Code fences for shell commands.
- No "Note:" / "Tip:" callout boxes — write the caveat inline (README.md:51 does this).
- Designed to grow — sequencer in v2 adds Section 5 without rewriting 1-4 (D-13).

**Open Question Q3 reminder** (RESEARCH.md): MANUAL.md should explain both URLs with the local-MIDI caveat. Planner can lift the matrix straight from README.md.

---

### `README.md` — link to MANUAL.md (doc)

**Analog:** self — `README.md:53-56` (existing "More docs" section).

**Existing block to extend** (lines 53-56):
```markdown
## 📚 More docs

- [`CURRENT-STATE.md`](CURRENT-STATE.md) — roadmap, what's shipped, what's next
- [`.research/PLAN.md`](.research/PLAN.md) — design rationale and decision log
```

**Apply (D-12 — single line addition):**
```markdown
## 📚 More docs

- [`MANUAL.md`](MANUAL.md) — user guide (how to play, clock sync, iPad setup)
- [`CURRENT-STATE.md`](CURRENT-STATE.md) — roadmap, what's shipped, what's next
- [`.research/PLAN.md`](.research/PLAN.md) — design rationale and decision log
```

**Also update `CURRENT-STATE.md`** — D-12 says it's linked from both. Add to the "Reference" section at line 141:
```markdown
- User manual: [`MANUAL.md`](MANUAL.md)
```

---

## Shared Patterns

### Defensive optional-chain on WebMidi calls
**Source:** `src/midi.ts:107-122` (`getChannel` returns null; `playChord` early-returns).
**Apply to:** `tickSource.ts` (sendClock), `host.ts` (sendStart/Stop/Continue).
```typescript
const outId = getMidiState().selectedOutputId;
if (!outId) return;             // or: if (!outId) is implicit when chained
WebMidi.getOutputById(outId)?.sendClock();   // optional chain handles undefined output
```
**Why.** Phase 2 wires MIDI sends BEFORE the user has selected an Output port. Silent no-op is the right behavior (Pitfall 1).

---

### Decision-ID comments
**Source:** `src/engines/host.ts:67-69` ("Roland J-6 HOLD convention"), `src/tickSource.ts:74-75` ("setInterval drift is acceptable at prototype-level").
**Apply to:** Every Phase 2 code addition.
```typescript
// D-02: clock send is always-on when Int.
// D-05: 200ms debounce — protects against OP-1 Record+Start chatter.
// D-06: under Ext, defer first fire until next downbeat boundary.
```
**Why.** CLAUDE.md project convention: "Comments: WHY only." Decision-ID gives the WHY in two characters and ties code to CONTEXT.md.

---

### Engine lifecycle changes route through `host.panic()`
**Source:** `src/engines/host.ts:102-107` (existing `panic`).
**Apply to:** D-03 mode switch (call `host.panic()` from App.svelte $effect), D-04 inbound Stop (call `host.panic()` from `onTransport('stop')`).
**Why.** Pitfall 5 — engine `stop()` is mostly idempotent but the latch state machine isn't fully traced. `panic()` is the verified all-clean path. Re-use it.

---

### `tickSource.subscribe` returns its own unsubscribe
**Source:** `src/tickSource.ts:45-52` + every engine `start()`/`stop()` pair (e.g., `rhythmGate.ts:46`, `:61`).
**Apply to:** Any new transport subscribe — `tickSource.subscribeTransport()` (line 54) follows the same pattern; `App.svelte:onMount` should return the unsubscribe (mirror line 35).
```typescript
onMount(() => tickSource.subscribeTransport((kind) => host.onTransport(kind)));
//             ^ already returns unsubscribe — onMount auto-cleans on unmount
```

---

### `$effect` per concern in `App.svelte`
**Source:** `src/App.svelte:27-32` (six single-purpose `$effect` blocks).
**Apply to:** Any new transport-related state→host bridge.
**Why.** CLAUDE.md: "UI state lives in `src/state.svelte.ts` (`$state` runes); `App.svelte` bridges to imperative host + tickSource via `$effect`." One line per concern matches the existing density and makes diffs reviewable.

---

### Test files use explicit Vitest imports
**Source:** `test/clock.test.ts:1` — `import { describe, expect, it } from 'vitest';`.
**Apply to:** New `nextDownbeatTick` describe block.
**Why.** Vitest globals are enabled in config but the codebase consistently imports explicitly (CONVENTIONS.md: "tests import explicitly, which is the correct practice").

---

### Pure-math helpers go in `clock.ts`
**Source:** Whole file — `quarterMs`, `ticksPerStep`, `tickIntervalMs` all live here.
**Apply to:** `nextDownbeatTick`.
**Why.** DEC-tests-data-and-math-only. Pure helpers in `clock.ts` are vitest-testable. Anything that touches WebMidi singletons is browser-tested in UAT, not unit-tested.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `MANUAL.md` (NEW) | doc | doc | Closest in-repo style anchor is README.md (linked above), but tone target (TE Pocket Operator) is external. README's emoji-headed table style is the structural pattern to mirror; the consumer-product TONE is on the planner/executor to channel from the aesthetic anchor in D-13. |

All other Phase 2 files have direct in-repo analogs.

---

## Metadata

**Analog search scope:** `src/`, `src/engines/`, `src/components/`, `test/`, repo root markdown.
**Files scanned:** 17 source/component files + 4 test files + 2 root markdowns + 8 planning docs.
**Pattern extraction date:** 2026-05-18.
**Key observation.** Phase 2 is wiring, not building. Every code change has a direct analog (often the same file, in-place edit). The unusual one is MANUAL.md — structurally similar to README.md, tonally aimed at an external aesthetic anchor.
