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

// MIDI clock standard: 24 ticks per quarter note.
export const TICKS_PER_QUARTER = 24;

// Convert a musical step to MIDI ticks. All J-6 step values resolve to
// integers at 24 PPQ (8th=12, 16th=6, triplet 8th=8, triplet 16th=4, etc.).
export function ticksPerStep(duration: PhraseDuration, triplet: boolean): number {
  const base = QUARTER_PER_NOTE[duration] * TICKS_PER_QUARTER;
  return triplet ? Math.round((base * 2) / 3) : base;
}

export function ticksPerSixteenth(): number {
  return ticksPerStep('16th', false); // 6
}

export function arpTicksPerStep(subdivision: '8th' | '16th', triplet: boolean): number {
  return ticksPerStep(subdivision, triplet);
}

// Internal-clock tick interval in ms (one MIDI tick = 1/24 of a quarter).
export function tickIntervalMs(bpm: number): number {
  return quarterMs(bpm) / TICKS_PER_QUARTER;
}
