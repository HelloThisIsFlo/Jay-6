import { describe, expect, it } from 'vitest';
import { getBank, type Key } from '../src/banks';
import { getSuggestionsForBank } from '../src/suggestions';
import {
  NO_HOLDS,
  pressHold,
  releaseHold,
  heldKeySet,
  padNotesFor,
  chipVisualState,
  type HoldCounts,
} from '../src/rail';

// Folds press/release events from NO_HOLDS through the reducers and returns the
// forwarded calls in order (e.g. "press C", "release C") — the host/App only
// ever see forwarded calls, never every raw source event.
type DriveEvent = { kind: 'press' | 'release'; key: Key };

function drive(events: DriveEvent[]): { forwarded: string[]; counts: HoldCounts } {
  let counts: HoldCounts = NO_HOLDS;
  const forwarded: string[] = [];
  for (const event of events) {
    const step =
      event.kind === 'press' ? pressHold(counts, event.key) : releaseHold(counts, event.key);
    counts = step.counts;
    if (step.forward) forwarded.push(`${event.kind} ${event.key}`);
  }
  return { forwarded, counts };
}

describe('pressHold', () => {
  it('gives count 1 and forwards on a fresh key, without mutating the input map', () => {
    const step = pressHold(NO_HOLDS, 'C');
    expect(step.counts.get('C')).toBe(1);
    expect(step.forward).toBe(true);
    expect(NO_HOLDS.size).toBe(0);
  });

  it('increments without forwarding when the key is already held', () => {
    const first = pressHold(NO_HOLDS, 'C');
    const second = pressHold(first.counts, 'C');
    expect(second.counts.get('C')).toBe(2);
    expect(second.forward).toBe(false);
  });

  it('tracks different keys independently', () => {
    const afterC = pressHold(NO_HOLDS, 'C');
    const afterD = pressHold(afterC.counts, 'D');
    expect(afterD.counts.get('C')).toBe(1);
    expect(afterD.counts.get('D')).toBe(1);
    expect(afterD.forward).toBe(true);
  });
});

describe('releaseHold', () => {
  it('decrements from 2 to 1 without forwarding', () => {
    const held = pressHold(pressHold(NO_HOLDS, 'C').counts, 'C').counts;
    const step = releaseHold(held, 'C');
    expect(step.counts.get('C')).toBe(1);
    expect(step.forward).toBe(false);
  });

  it('removes the key and forwards when releasing the last hold', () => {
    const held = pressHold(NO_HOLDS, 'C').counts;
    const step = releaseHold(held, 'C');
    expect(step.counts.has('C')).toBe(false);
    expect(step.forward).toBe(true);
  });

  it('returns the same counts reference and forward:false for a stray release', () => {
    const step = releaseHold(NO_HOLDS, 'C');
    expect(step.counts).toBe(NO_HOLDS);
    expect(step.forward).toBe(false);
  });
});

describe('multi-source interleavings', () => {
  it('forwards exactly [press C, release C] for pad-down, chip-down, pad-up, chip-up', () => {
    const { forwarded } = drive([
      { kind: 'press', key: 'C' },
      { kind: 'press', key: 'C' },
      { kind: 'release', key: 'C' },
      { kind: 'release', key: 'C' },
    ]);
    expect(forwarded).toEqual(['press C', 'release C']);
  });

  it('forwards exactly [press C, release C] for chip-down, pad-down, chip-up, pad-up (reverse release order)', () => {
    const { forwarded } = drive([
      { kind: 'press', key: 'C' }, // chip
      { kind: 'press', key: 'C' }, // pad
      { kind: 'release', key: 'C' }, // chip releases first
      { kind: 'release', key: 'C' }, // pad releases last
    ]);
    expect(forwarded).toEqual(['press C', 'release C']);
  });

  it('forwards exactly [press C, release C] for keyboard + pad + chip all on one key', () => {
    const { forwarded } = drive([
      { kind: 'press', key: 'C' }, // keyboard
      { kind: 'press', key: 'C' }, // pad
      { kind: 'press', key: 'C' }, // chip
      { kind: 'release', key: 'C' }, // pad releases first
      { kind: 'release', key: 'C' }, // keyboard releases next
      { kind: 'release', key: 'C' }, // chip releases last
    ]);
    expect(forwarded).toEqual(['press C', 'release C']);
  });

  it('keeps holds on different keys independent, forwarding each key once', () => {
    const { forwarded } = drive([
      { kind: 'press', key: 'C' },
      { kind: 'press', key: 'D' },
      { kind: 'release', key: 'C' },
      { kind: 'release', key: 'D' },
    ]);
    expect(forwarded).toEqual(['press C', 'press D', 'release C', 'release D']);
  });

  it('leaves the key held when one source presses twice and releases once, forwarding only the first press', () => {
    const { forwarded, counts } = drive([
      { kind: 'press', key: 'C' },
      { kind: 'press', key: 'C' },
      { kind: 'release', key: 'C' },
    ]);
    expect(forwarded).toEqual(['press C']);
    expect(counts.get('C')).toBe(1);
  });

  it('forwards nothing for a stray release after a panic reset, and forwards a fresh press again', () => {
    // App's clearAllHighlights resets holdCounts to a brand-new NO_HOLDS on panic,
    // disconnected from whatever the reducer produced before.
    const strayRelease = releaseHold(NO_HOLDS, 'C');
    expect(strayRelease.forward).toBe(false);
    const freshPress = pressHold(NO_HOLDS, 'C');
    expect(freshPress.forward).toBe(true);
  });
});

describe('heldKeySet', () => {
  it('returns a fresh Set of exactly the held keys', () => {
    const counts = pressHold(pressHold(NO_HOLDS, 'C').counts, 'D').counts;
    const set = heldKeySet(counts);
    expect(set).toEqual(new Set(['C', 'D']));
  });

  it('gives an empty Set for NO_HOLDS', () => {
    expect(heldKeySet(NO_HOLDS)).toEqual(new Set());
  });
});

describe('padNotesFor', () => {
  it('returns the same array object as the canonical bank lookup for Bank 1 C', () => {
    const expected = getBank(1).chords.find((c) => c.key === 'C')!.notes;
    expect(padNotesFor(1, 'C')).toBe(expected);
    expect(padNotesFor(1, 'C')).toEqual([48, 55, 62, 64]);
  });

  it('returns the same array object as the canonical bank lookup for Bank 14 C', () => {
    const expected = getBank(14).chords.find((c) => c.key === 'C')!.notes;
    expect(padNotesFor(14, 'C')).toBe(expected);
    expect(padNotesFor(14, 'C')).toEqual([60, 72]);
  });

  it('returns the same array object for every step of every Bank 1 and Bank 14 suggestion', () => {
    for (const bankIndex of [1, 14]) {
      for (const suggestion of getSuggestionsForBank(bankIndex)) {
        for (const step of suggestion.steps) {
          const expected = getBank(bankIndex).chords.find((c) => c.key === step.key)!.notes;
          expect(padNotesFor(bankIndex, step.key)).toBe(expected);
        }
      }
    }
  });
});

describe('chipVisualState', () => {
  it('is held when heldHere is true, regardless of keyLit', () => {
    expect(chipVisualState(true, true)).toBe('held');
    expect(chipVisualState(true, false)).toBe('held');
  });

  it('is echo when not heldHere but the key is lit', () => {
    expect(chipVisualState(false, true)).toBe('echo');
  });

  it('is idle when neither heldHere nor keyLit', () => {
    expect(chipVisualState(false, false)).toBe('idle');
  });
});
