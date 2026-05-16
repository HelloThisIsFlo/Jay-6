// PLACEHOLDER — replaced by extracted Roland data once the agent verification diff is reconciled.
// Until then, all 100 banks are stubbed with C major triads so the UI compiles + renders.

import type { Bank, Key } from './banks';

const KEYS_LOCAL: readonly Key[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

function placeholderBank(i: number): Bank {
  return {
    index: i,
    name: `Stub ${i}`,
    chords: KEYS_LOCAL.map((key, k) => ({
      key,
      name: `${key}`,
      notes: [60 + k, 64 + k, 67 + k],
    })),
  };
}

export const BANKS_DATA: Bank[] = Array.from({ length: 100 }, (_, i) => placeholderBank(i + 1));
