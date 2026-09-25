import { describe, expect, it } from 'vitest';
import { banks, getBank, KEYS, labelFor, type Key } from '../src/banks';
import { getSuggestionsForBank } from '../src/suggestions';
import {
  NO_HOLDS,
  pressHold,
  releaseHold,
  heldKeySet,
  padNotesFor,
  chipVisualState,
  chipsPerRow,
  fitChipsPerRow,
  splitChordLabel,
  isNaturalKey,
  rememberedPage,
  stepPage,
  panelMaxPerRow,
  type HoldCounts,
  type PageMemory,
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

describe('chipsPerRow', () => {
  it('returns 0 for zero steps', () => {
    expect(chipsPerRow(0, 4)).toBe(0);
  });

  it('keeps everything on one row at or under the cap', () => {
    expect(chipsPerRow(1, 4)).toBe(1);
    expect(chipsPerRow(4, 4)).toBe(4);
  });

  it('balances rows evenly past the cap (cap 4: 7 -> 4+3, 8 -> 4+4)', () => {
    expect(chipsPerRow(5, 4)).toBe(3);
    expect(chipsPerRow(6, 4)).toBe(3);
    expect(chipsPerRow(7, 4)).toBe(4);
    expect(chipsPerRow(8, 4)).toBe(4);
  });

  it('balances rows evenly past the cap (cap 6)', () => {
    expect(chipsPerRow(6, 6)).toBe(6);
    expect(chipsPerRow(7, 6)).toBe(4);
    expect(chipsPerRow(8, 6)).toBe(4);
  });

  it('clamps a cap below 1 to behave as 1', () => {
    expect(chipsPerRow(4, 1)).toBe(1);
    expect(chipsPerRow(4, 0)).toBe(1);
    expect(chipsPerRow(4, -3)).toBe(1);
  });
});

describe('fitChipsPerRow', () => {
  it('asks the predicate exactly once when it accepts the initial candidate', () => {
    const calls: number[] = [];
    const alwaysTrue = (per: number): boolean => {
      calls.push(per);
      return true;
    };
    expect(fitChipsPerRow(4, 4, alwaysTrue)).toBe(chipsPerRow(4, 4));
    expect(calls).toEqual([4]);
  });

  it('steps the cap down until the predicate accepts (4 steps, cap 4)', () => {
    const calls: number[] = [];
    const fitsAtMostTwo = (per: number): boolean => {
      calls.push(per);
      return per <= 2;
    };
    expect(fitChipsPerRow(4, 4, fitsAtMostTwo)).toBe(2);
    expect(calls).toEqual([4, 2]);
  });

  it('steps the cap down until the predicate accepts (7 steps, cap 4)', () => {
    const calls: number[] = [];
    const fitsAtMostTwo = (per: number): boolean => {
      calls.push(per);
      return per <= 2;
    };
    expect(fitChipsPerRow(7, 4, fitsAtMostTwo)).toBe(2);
    expect(calls).toEqual([4, 3, 2]);
  });

  it('falls back to 1 per row without asking the predicate at cap 1, skipping a repeated candidate', () => {
    const calls: number[] = [];
    const never = (per: number): boolean => {
      calls.push(per);
      return false;
    };
    expect(fitChipsPerRow(4, 4, never)).toBe(1);
    expect(calls).toEqual([4, 2]);
  });

  it('returns 0 for zero steps without calling the predicate', () => {
    const calls: number[] = [];
    const spy = (per: number): boolean => {
      calls.push(per);
      return true;
    };
    expect(fitChipsPerRow(0, 4, spy)).toBe(0);
    expect(calls).toEqual([]);
  });
});

describe('splitChordLabel', () => {
  it.each([
    ['Cadd9/E', { main: 'Cadd9', bass: '/E' }],
    ['FM/A', { main: 'FM', bass: '/A' }],
    ['E7#9', { main: 'E7#9', bass: '' }],
    ['C Oct Stack', { main: 'C Oct Stack', bass: '' }],
    ['Bb5add9/b13', { main: 'Bb5add9', bass: '/b13' }],
    ['CM9 (no3)/G', { main: 'CM9 (no3)', bass: '/G' }],
    ['A/B/C', { main: 'A', bass: '/B/C' }],
  ] as const)('splits %j into %j', (label, expected) => {
    expect(splitChordLabel(label)).toEqual(expected);
  });

  it('reconstructs the canonical label for every chord in every bank; bass is empty exactly when there is no slash', () => {
    for (const bank of banks) {
      for (const chord of bank.chords) {
        const label = labelFor(bank, chord);
        const { main, bass } = splitChordLabel(label);
        expect(main + bass).toBe(label);
        expect(bass === '').toBe(!label.includes('/'));
      }
    }
  });
});

describe('isNaturalKey', () => {
  it('is true exactly for the natural keys (C, D, E, F, G, A, B)', () => {
    const naturals = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    for (const key of KEYS) {
      expect(isNaturalKey(key)).toBe(naturals.has(key));
    }
  });
});

describe('rememberedPage', () => {
  it('returns memory.index when memory.list is the same reference as list', () => {
    const list = [1, 2, 3];
    const memory: PageMemory<number[]> = { list, index: 2 };
    expect(rememberedPage(memory, list)).toBe(2);
  });

  it('returns 0 for a structurally equal but different list reference', () => {
    const memory: PageMemory<number[]> = { list: [1, 2, 3], index: 2 };
    const list = [1, 2, 3];
    expect(rememberedPage(memory, list)).toBe(0);
  });

  it('returns 0 for null memory', () => {
    expect(rememberedPage(null, [1, 2, 3])).toBe(0);
  });
});

describe('stepPage', () => {
  it.each([
    [0, 1, 3, 1],
    [2, 1, 3, 0],
    [0, -1, 3, 2],
    [0, 1, 1, 0],
    [0, -1, 1, 0],
    [0, 1, 0, 0],
  ] as const)('stepPage(%d, %d, %d) -> %d', (index, delta, count, expected) => {
    expect(stepPage(index, delta, count)).toBe(expected);
  });
});

describe('panelMaxPerRow', () => {
  it.each([
    [667, 4],
    [719, 4],
    [720, 6],
    [852, 6],
    [932, 6],
  ] as const)('panelMaxPerRow(%d) -> %d', (width, expected) => {
    expect(panelMaxPerRow(width)).toBe(expected);
  });
});
