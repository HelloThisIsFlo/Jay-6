// Roland J-6 chord banks.
// Source: official J-6 chord set list (Roland manual).
// Real data is generated below by importing from `banks.data.ts` (created from extracted JSON).

import { BANKS_DATA } from './banks.data';

export const KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;
export type Key = (typeof KEYS)[number];

export interface Chord {
  key: Key;
  name: string;     // empty string for banks without published chord names (e.g. Oct Stack)
  notes: number[];  // MIDI note numbers, usually 4, sometimes fewer
}

export interface Bank {
  index: number;    // 1..100
  name: string;
  chords: Chord[];  // length 12, chromatic order C..B
}

export const banks: Bank[] = BANKS_DATA;

export function getBank(index: number): Bank {
  const wrapped = ((index - 1 + 100) % 100) + 1;
  return banks[wrapped - 1]!;
}

// Some banks (Oct Stack, Power Chord with no thirds, etc.) don't publish chord names.
// In that case the UI label is `"${key} ${bankName}"` — e.g. "C Oct Stack".
export function labelFor(bank: Bank, chord: Chord): string {
  return chord.name && chord.name.length > 0 ? chord.name : `${chord.key} ${bank.name}`;
}
