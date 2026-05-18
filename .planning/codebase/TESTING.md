# Testing Patterns

**Analysis Date:** 2026-05-18

## Test Framework

**Runner:**
- Vitest 2 (`^2.1.0`)
- Config: `vite.config.ts` — `test` block, `globals: true`, `environment: 'node'`
- Include pattern: `test/**/*.test.ts`

**Assertion Library:**
- Vitest built-in (`expect`)

**Run Commands:**
```bash
just test          # vitest run (single pass)
npm run test:watch # vitest watch mode (no Just recipe — use npm directly)
just ci            # check + test + build (full gate)
just check         # svelte-check (type errors + accessibility — separate from vitest)
```

## Test File Organization

**Location:** separate `test/` directory at project root — not co-located with source.

**Naming:** `<module>.test.ts` — mirrors the source module name exactly.

**Structure:**
```
test/
  arp.test.ts        → tests src/engines/arp.ts (buildSequence)
  banks.test.ts      → tests src/banks.ts + src/banks.data.json
  clock.test.ts      → tests src/clock.ts
  phrases.test.ts    → tests src/phrases.ts (parseRhythmPattern + style data shapes)
```

## Test Structure

**Suite organization:**
```typescript
import { describe, expect, it } from 'vitest';
import { buildSequence } from '../src/engines/arp';

describe('buildSequence', () => {
  it('UP single octave returns chord in ascending order', () => {
    expect(buildSequence([67, 60, 64], v('UP', 1))).toEqual([60, 64, 67]);
  });

  it('handles empty chord', () => {
    expect(buildSequence([], v('UP', 1))).toEqual([]);
  });
});
```

**Patterns:**
- One `describe` block per exported unit under test
- Multiple `describe` blocks allowed per file when testing related concepts (e.g. `phrases.test.ts` has `parseRhythmPattern` + `style data shape` blocks)
- No `beforeEach` / `afterEach` — tests are stateless, no shared setup
- No `beforeAll` / `afterAll` — no DB connections or heavy setup in scope

## What Is Tested

**In scope for vitest:**
- Bank data correctness (shape, MIDI range, known Roland anchor values)
- Phrase parsing logic (`parseRhythmPattern`)
- Clock math (BPM → ms, BPM → ticks, tick intervals)
- Arp sequence building (`buildSequence` — note ordering, direction, octave expansion)
- Style data shape invariants (12 variations per style, pattern lengths)

**Explicitly out of scope:**
- Web MIDI API — browser-only, not available in Node environment
- Svelte 5 component mounting — no JSDOM / happy-dom setup
- `EngineHost`, `TickSourceImpl`, `ArpEngine` tick callbacks — imperative classes that depend on MIDI or timing
- UI behavior — covered by manual UAT, not vitest

## Mocking

**None used.** All tested modules are pure functions or data. No mocking framework invoked.

**Why no mocks needed:** The test boundary is drawn at pure logic only. MIDI-dependent and Svelte-dependent code is intentionally excluded from the vitest scope.

## Fixtures and Factories

**Helper factories inside test files:**
```typescript
// arp.test.ts — factory for ArpVariation to reduce repetition
function v(direction: ArpVariation['direction'], octaveRange: 1 | 2): ArpVariation {
  return { index: 1, direction, subdivision: '8th', octaveRange, triplet: false };
}
```

**Anchor values** — hardcoded known-correct Roland values as regression guards:
```typescript
it('bank 1 / C is Cadd9 → [48, 55, 62, 64]', () => {
  const c = banks[0]!.chords.find((c) => c.key === 'C')!;
  expect(c.name).toBe('Cadd9');
  expect(c.notes).toEqual([48, 55, 62, 64]);
});

it('bank 14 (Oct Stack) / C is the two-note dyad [60, 72]', () => { ... });
```

These anchor specific Roland manual values and must not change without a verified re-extraction.

## Test Patterns

**Exact equality for MIDI arrays:**
```typescript
expect(buildSequence([67, 60, 64], v('UP', 1))).toEqual([60, 64, 67]);
```

**Floating-point with tolerance:**
```typescript
expect(noteValueMs(120, 'half', true)).toBeCloseTo((1000 * 2) / 3, 6);
expect(arpStepMs(120, '16th', true)).toBeCloseTo(125 * (2 / 3), 6);
```

**Error path testing (throw assertions):**
```typescript
it('rejects wrong length', () => {
  expect(() => parseRhythmPattern('oooo')).toThrow();
});
it('rejects dangling ~', () => {
  expect(() => parseRhythmPattern('~ooo_ooo_ooo_ooo')).toThrow();
});
```

**Structural / shape tests (loop over all data):**
```typescript
it('every chord has MIDI notes in 0..127', () => {
  for (const b of banks) {
    for (const c of b.chords) {
      expect(c.notes.length).toBeGreaterThan(0);
      for (const n of c.notes) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(127);
        expect(Number.isInteger(n)).toBe(true);
      }
    }
  }
});
```

**Wrap-around / boundary tests:**
```typescript
it('getBank wraps 0 -> 100 and 101 -> 1', () => {
  expect(getBank(0).index).toBe(100);
  expect(getBank(101).index).toBe(1);
});
```

## Coverage

**Requirements:** None enforced (no coverage threshold config in `vite.config.ts`).

**Coverage scope note:** By design, coverage is partial — UI, MIDI, and engine runtime paths are excluded from vitest. Coverage metrics are not meaningful for this project without that context.

## UAT (Manual Testing)

**UAT checklist:** `.research/UAT.md` — 19 sections covering all shipped features.

**UAT runner:** `uat-agent` skill at `.claude/skills/uat-agent/SKILL.md`. Triggered by saying "run uat". Walks through checklist one step at a time, updates checkboxes in place (`- [x]` pass / `- [~]` fail / `- [-]` skip), logs bugs + run summary at end of file.

**What UAT covers that vitest does not:**
- MIDI port detection + output (OP-1 hardware)
- Svelte component rendering (pad layout, chord labels, TopBar controls)
- Web MIDI clock receive (OP-1 as external clock source)
- Latch visual state (orange pad highlight)
- Keyboard shortcuts
- iPad / LAN / tunnel connectivity
- Hot-swap behavior (style change while pad held, bank change mid-arp)

**UAT gates Phase 2 close.** All sections must pass before Phase 2 is considered done.

## Type Checking (svelte-check)

`just check` runs `svelte-check --tsconfig ./tsconfig.json` — validates:
- TypeScript types in `.ts` and `.svelte` files
- Svelte 5 rune usage
- Accessibility (a11y) warnings in templates

`just ci` runs `check → test → build` in sequence. All three must pass for a clean CI.

---

*Testing analysis: 2026-05-18*
