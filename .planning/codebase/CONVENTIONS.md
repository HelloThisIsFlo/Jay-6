# Coding Conventions

**Analysis Date:** 2026-05-18

## Naming Patterns

**Files:**
- `camelCase.ts` for pure TS modules — `clock.ts`, `midi.ts`, `tickSource.ts`, `banks.ts`
- `camelCase.svelte.ts` for modules that contain Svelte 5 runes — `state.svelte.ts` (required by Svelte 5 compiler)
- `PascalCase.svelte` for Svelte components — `TopBar.svelte`, `PianoLayout.svelte`, `App.svelte`
- `camelCase.data.ts` / `camelCase.data.json` for data loaders — `banks.data.ts`, `banks.data.json`
- `camelCase.test.ts` for test files (under `test/`)

**Classes:**
- `PascalCase` — `ArpEngine`, `EngineHost`, `HoldEngine`, `PhraseDurationEngine`, `RhythmGateEngine`, `TickSourceImpl`

**Interfaces / Types:**
- `PascalCase` — `Engine`, `ArpVariation`, `PhraseDurationVariation`, `RhythmVariation`, `MidiPortInfo`, `HostConfig`
- Union string types use `SCREAMING_SNAKE_CASE` values — `'UP' | 'DOWN' | 'UP&DOWN'`, `'internal' | 'external'`

**Functions / Methods:**
- `camelCase` — `playChord`, `releaseChord`, `allNotesOff`, `buildSequence`, `parseRhythmPattern`, `setGatePercent`

**Variables / Constants:**
- `camelCase` for runtime values — `tickSource`, `heldPads`, `latchedKey`
- `SCREAMING_SNAKE_CASE` for module-level constants — `TICKS_PER_QUARTER`, `DEFAULT_VELOCITY`, `STYLE_LABELS`
- `ALLCAPS` prefix for private data arrays — `STYLE1`, `STYLE2`, … exported via lowercase accessor (`style1`, `style2`)

**Svelte state variables:**
- Reactive stores: `ui` (the single `$state` object in `state.svelte.ts`)
- Component-local runes: `let heldKeys = $state<Set<Key>>(new Set())`

## TypeScript Config

**Strict flags in `tsconfig.json`:**
- `strict: true` (enables all strict checks)
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `resolveJsonModule: true` (used for `banks.data.json` import)

**Module system:** ESNext modules, `moduleResolution: "bundler"`.

**Vitest globals:** enabled — `describe`, `it`, `expect` available without imports in test files (but tests import explicitly, which is the correct practice).

## Code Style

**Formatting:**
- No Prettier/ESLint config detected — format implied by TypeScript strict + svelte-check
- Consistent 2-space indentation throughout

**Return type annotations:**
- All public/exported functions annotate return type explicitly — `void`, `number`, `string`, `() => void`
- `async` functions annotate `Promise<void>` / `Promise<T>` explicitly — `initMidi(): Promise<void>`

**Access modifiers:**
- Class fields use `private` for internal state — `private cfg`, `private engine`, `private heldPads`
- No `public` keyword used (TypeScript default)

## Import Organization

**Order (observed pattern):**
1. Third-party packages — `import { WebMidi } from 'webmidi'`
2. Internal modules with `../` or `./` prefix

**No path aliases** — all imports use relative paths.

**No barrel files** — each module imported directly by path.

## Comment Policy

**WHY only. Never restate what the code says.**

Good examples from the codebase:
```ts
// setInterval drift is acceptable at prototype-level; the J-6 itself uses a
// similar approach.

// Plain $state-like object — Svelte $state can't live in a .ts module that runs at import
// time outside a component, so we expose a tiny manual subscription model.

// Roland J-6 HOLD convention: same-pad re-press retriggers (engine timeline
// restarts), different pad swaps the chord smoothly (timeline continues).

// Don't auto-select an input — external clock is opt-in.
```

**Inline comments** over JSDoc — this codebase has zero JSDoc blocks. Inline `//` comments explain architectural decisions, edge-case rationale, and cross-references.

**Block comments at function start** — used only when the WHY requires a multi-line explanation before code, not as documentation headers.

## Svelte 5 Runes Patterns

**Global UI state** lives exclusively in `src/state.svelte.ts`:
```ts
export const ui = $state({
  bankIndex: 1,
  style: 'hold' as StyleKind,
  // ...
});
```

**Component-local reactive state** uses `let x = $state(...)` inside `<script>` — e.g., `heldKeys`, `latchedKey` in `App.svelte`.

**Derived values** use `$derived.by(() => ...)` for non-trivial computations:
```ts
const displayKeys = $derived.by(() => {
  if (latchedKey === null) return heldKeys;
  const out = new Set(heldKeys);
  out.add(latchedKey);
  return out;
});
```

**Bridging reactive → imperative** via `$effect` in `App.svelte`:
```ts
$effect(() => { host.setBpm(ui.bpm); tickSource.setBpm(ui.bpm); });
$effect(() => { host.setStyle(ui.style, ui.variation); });
```
`App.svelte` is the only place `$effect` bridges to the imperative `EngineHost` + `tickSource`. Components don't call engine methods directly.

**No `$effect` in `.ts` modules** — runes are component-file only.

## Engine Pattern

All engines implement `src/engines/types.ts`:
```ts
export interface Engine {
  start(notes: number[]): void;    // fresh start, fire first hit immediately
  setNotes(notes: number[]): void; // swap chord, keep timeline
  stop(): void;
  setBpm(bpm: number): void;
}
```

**Engines are timer-agnostic.** They count ticks, never call `Date.now()` or `setInterval` themselves. Subscribe to `tickSource`:
```ts
this.unsubscribe = tickSource.subscribe(() => this.onTick());
```
Return value from `subscribe()` is an unsubscribe function — always store it and call in `stop()`.

**`setBpm` is a no-op in tick-counting engines** — `tickSource` owns BPM. The method exists to satisfy the interface:
```ts
setBpm(_bpm: number): void {
  // BPM is owned by the TickSource; engine is BPM-agnostic.
}
```

## TickSource Subscription Pattern

`tickSource` is a singleton exported from `src/tickSource.ts`. Subscribers call:
```ts
const unsub = tickSource.subscribe(() => this.onTick());
// later:
unsub();
```
TickSource auto-activates its internal timer on first subscriber, deactivates on last unsubscribe.

## Latch Tracking

Latch state lives in `EngineHost` (`src/engines/host.ts`), not in individual engines. Engines don't know what a pad is. The host applies:
- Same-pad re-press → `engine.start(transposed)` (restart timeline)
- Different pad while latched → `engine.setNotes(transposed)` (swap chord, continue timeline)

## Error Handling

**Guard + return** — no exceptions thrown for invalid/missing state. Soft-fail with early return:
```ts
export function playChord(notes: readonly number[]): void {
  const ch = getChannel();
  if (!ch) return;
  // ...
}
```

**Exceptions only for programmer errors** — `setChannel` throws on out-of-range input:
```ts
if (ch < 1 || ch > 16) throw new Error(`channel out of range: ${ch}`);
```

**`parseRhythmPattern` throws on malformed input** — invalid patterns are programmer error at data-load time.

**Async errors** — `initMidi` catches `WebMidi.enable()` rejection, sets `state.status = 'denied' | 'error'`, notifies subscribers. No unhandled rejections.

## Data Integrity

**`src/banks.data.json` is read-only.** It is the verified Roland extraction. Do not edit by hand — fix the JSON if voicing corrections are needed.

**Style data is structured, not stringly-typed.** `ArpVariation`, `PhraseDurationVariation`, `RhythmVariation` types in `src/phrases.ts`. Pattern strings (`o_o_o~o_…`) are parsed once via `parseRhythmPattern` at test/import time, never interpreted at runtime.

## No Premature Features

Explicitly banned until Phase 3:
- Web Audio scheduler
- Velocity control
- Presets / persistence
- Styles 6–9

---

*Convention analysis: 2026-05-18*
