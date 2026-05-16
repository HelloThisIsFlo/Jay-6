// Time helpers — derive ms-per-step from BPM for various note values.
// Reference: BPM = quarter notes per minute. So 1 quarter = 60_000 / bpm ms.

import type { PhraseDuration } from './phrases';

const QUARTER_PER_NOTE: Record<PhraseDuration, number> = {
  'double-whole': 8,
  whole: 4,
  half: 2,
  quarter: 1,
  '8th': 0.5,
  '16th': 0.25,
};

export function quarterMs(bpm: number): number {
  return 60_000 / bpm;
}

export function noteValueMs(
  bpm: number,
  duration: PhraseDuration,
  triplet: boolean,
): number {
  const q = quarterMs(bpm);
  const base = QUARTER_PER_NOTE[duration] * q;
  // Triplet: 3 notes fit in the space of 2 → each note is 2/3 the length.
  return triplet ? base * (2 / 3) : base;
}

export function sixteenthMs(bpm: number): number {
  return quarterMs(bpm) / 4;
}

export function arpStepMs(
  bpm: number,
  subdivision: '8th' | '16th',
  triplet: boolean,
): number {
  return noteValueMs(bpm, subdivision, triplet);
}
