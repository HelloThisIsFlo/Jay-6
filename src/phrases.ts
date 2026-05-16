// Roland J-6 Style data, extracted from the official manual.
// Styles 1+2 = arpeggiator, Style 3 = phrase durations, Styles 4+5 = rhythm gate.

export type ArpDirection = 'UP' | 'DOWN' | 'UP&DOWN';
export type ArpSubdivision = '8th' | '16th';

export interface ArpVariation {
  index: number;
  direction: ArpDirection;
  subdivision: ArpSubdivision;
  octaveRange: 1 | 2;
  triplet: boolean;
}

export type PhraseDuration =
  | 'double-whole'
  | 'whole'
  | 'half'
  | 'quarter'
  | '8th'
  | '16th';

export interface PhraseDurationVariation {
  index: number;
  duration: PhraseDuration;
  triplet: boolean;
}

export interface RhythmVariation {
  index: number;
  pattern: string; // 16 chars of o / _ / ~
}

export interface RhythmStep {
  startStep: number;    // 0..15 — position of the `o`
  durationSteps: number; // 1 = sixteenth, 2 = eighth, 3 = dotted eighth, ...
}

const STYLE1: ArpVariation[] = [
  { index: 1,  direction: 'UP',      subdivision: '8th', octaveRange: 1, triplet: false },
  { index: 2,  direction: 'UP&DOWN', subdivision: '8th', octaveRange: 1, triplet: false },
  { index: 3,  direction: 'DOWN',    subdivision: '8th', octaveRange: 1, triplet: false },
  { index: 4,  direction: 'DOWN',    subdivision: '8th', octaveRange: 2, triplet: false },
  { index: 5,  direction: 'UP&DOWN', subdivision: '8th', octaveRange: 2, triplet: false },
  { index: 6,  direction: 'UP',      subdivision: '8th', octaveRange: 2, triplet: false },
  { index: 7,  direction: 'UP',      subdivision: '8th', octaveRange: 1, triplet: true  },
  { index: 8,  direction: 'UP&DOWN', subdivision: '8th', octaveRange: 1, triplet: true  },
  { index: 9,  direction: 'DOWN',    subdivision: '8th', octaveRange: 1, triplet: true  },
  { index: 10, direction: 'DOWN',    subdivision: '8th', octaveRange: 2, triplet: true  },
  { index: 11, direction: 'UP&DOWN', subdivision: '8th', octaveRange: 2, triplet: true  },
  { index: 12, direction: 'UP',      subdivision: '8th', octaveRange: 2, triplet: true  },
];

const STYLE2: ArpVariation[] = [
  { index: 1,  direction: 'UP',      subdivision: '16th', octaveRange: 1, triplet: false },
  { index: 2,  direction: 'UP&DOWN', subdivision: '16th', octaveRange: 1, triplet: false },
  { index: 3,  direction: 'DOWN',    subdivision: '16th', octaveRange: 1, triplet: false },
  { index: 4,  direction: 'DOWN',    subdivision: '16th', octaveRange: 2, triplet: false },
  { index: 5,  direction: 'UP&DOWN', subdivision: '16th', octaveRange: 2, triplet: false },
  { index: 6,  direction: 'UP',      subdivision: '16th', octaveRange: 2, triplet: false },
  { index: 7,  direction: 'UP',      subdivision: '16th', octaveRange: 1, triplet: true  },
  { index: 8,  direction: 'UP&DOWN', subdivision: '16th', octaveRange: 1, triplet: true  },
  { index: 9,  direction: 'DOWN',    subdivision: '16th', octaveRange: 1, triplet: true  },
  { index: 10, direction: 'DOWN',    subdivision: '16th', octaveRange: 2, triplet: true  },
  { index: 11, direction: 'UP&DOWN', subdivision: '16th', octaveRange: 2, triplet: true  },
  { index: 12, direction: 'UP',      subdivision: '16th', octaveRange: 2, triplet: true  },
];

const STYLE3: PhraseDurationVariation[] = [
  { index: 1,  duration: 'double-whole', triplet: false },
  { index: 2,  duration: 'whole',        triplet: false },
  { index: 3,  duration: 'half',         triplet: false },
  { index: 4,  duration: 'quarter',      triplet: false },
  { index: 5,  duration: '8th',          triplet: false },
  { index: 6,  duration: '16th',         triplet: false },
  { index: 7,  duration: 'double-whole', triplet: true  },
  { index: 8,  duration: 'whole',        triplet: true  },
  { index: 9,  duration: 'half',         triplet: true  },
  { index: 10, duration: 'quarter',      triplet: true  },
  { index: 11, duration: '8th',          triplet: true  },
  { index: 12, duration: '16th',         triplet: true  },
];

const STYLE4: RhythmVariation[] = [
  { index: 1,  pattern: 'o___o___o___o___' },
  { index: 2,  pattern: '_o___o___o___o__' },
  { index: 3,  pattern: '__o___o___o___o_' },
  { index: 4,  pattern: '___o___o___o___o' },
  { index: 5,  pattern: 'o~o_o~o_o~o_o~o_' },
  { index: 6,  pattern: 'o_o~o_o~o_o~o_o~' },
  { index: 7,  pattern: 'o~~oo~~oo~~oo~~o' },
  { index: 8,  pattern: '_o~o_o~o_o~o_o~o' },
  { index: 9,  pattern: 'ooo_ooo_ooo_ooo_' },
  { index: 10, pattern: 'oo_ooo_ooo_ooo_o' },
  { index: 11, pattern: 'o_ooo_ooo_ooo_oo' },
  { index: 12, pattern: '_ooo_ooo_ooo_ooo' },
];

const STYLE5: RhythmVariation[] = [
  { index: 1,  pattern: 'oo__oo__oo__oo__' },
  { index: 2,  pattern: 'o_o_o_o_o_o_o_o_' },
  { index: 3,  pattern: 'o__oo__oo__oo__o' },
  { index: 4,  pattern: '_oo__oo__oo__oo_' },
  { index: 5,  pattern: '_o_o_o_o_o_o_o_o' },
  { index: 6,  pattern: '__oo__oo__oo__oo' },
  { index: 7,  pattern: 'o__o__o__o__o__o' },
  { index: 8,  pattern: '_o__o__o__o__o__' },
  { index: 9,  pattern: '__o__o__o__o__o_' },
  { index: 10, pattern: 'oo_oo_oo_oo_oo_o' },
  { index: 11, pattern: 'o_oo_oo_oo_oo_oo' },
  { index: 12, pattern: '_oo_oo_oo_oo_oo_' },
];

export const style1 = STYLE1;
export const style2 = STYLE2;
export const style3 = STYLE3;
export const style4 = STYLE4;
export const style5 = STYLE5;

// Parse a 16-step pattern into discrete hit events.
// `o`  = hit, 1 step (a sixteenth)
// `~`  = extend prior hit by 1 step (so `o~` = eighth, `o~~` = dotted eighth)
// `_`  = silent step
export function parseRhythmPattern(pattern: string): RhythmStep[] {
  if (pattern.length !== 16) {
    throw new Error(`pattern must be 16 chars, got ${pattern.length}: "${pattern}"`);
  }
  const steps: RhythmStep[] = [];
  let current: RhythmStep | null = null;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === 'o') {
      if (current) steps.push(current);
      current = { startStep: i, durationSteps: 1 };
    } else if (ch === '~') {
      if (!current) {
        throw new Error(`dangling ~ at position ${i} in "${pattern}"`);
      }
      current.durationSteps += 1;
    } else if (ch === '_') {
      if (current) {
        steps.push(current);
        current = null;
      }
    } else {
      throw new Error(`bad char '${ch}' at position ${i} in "${pattern}"`);
    }
  }
  if (current) steps.push(current);
  return steps;
}
