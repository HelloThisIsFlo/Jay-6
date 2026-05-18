import { describe, expect, it } from 'vitest';
import {
  arpStepMs,
  nextDownbeatTick,
  noteValueMs,
  quarterMs,
  sixteenthMs,
  TICKS_PER_QUARTER,
  ticksPerSixteenth,
  ticksPerStep,
  tickIntervalMs,
} from '../src/clock';

describe('clock', () => {
  it('quarterMs at 120 = 500ms', () => {
    expect(quarterMs(120)).toBe(500);
  });

  it('sixteenthMs at 120 = 125ms', () => {
    expect(sixteenthMs(120)).toBe(125);
  });

  it('noteValueMs whole = 4 quarters', () => {
    expect(noteValueMs(120, 'whole', false)).toBe(2000);
  });

  it('noteValueMs triplet half = 2/3 of half', () => {
    expect(noteValueMs(120, 'half', true)).toBeCloseTo((1000 * 2) / 3, 6);
  });

  it('arpStepMs 8th non-triplet at 120 = 250', () => {
    expect(arpStepMs(120, '8th', false)).toBe(250);
  });

  it('arpStepMs 16th triplet at 120 = ~83.33', () => {
    expect(arpStepMs(120, '16th', true)).toBeCloseTo(125 * (2 / 3), 6);
  });

  it('TICKS_PER_QUARTER = 24 (MIDI standard)', () => {
    expect(TICKS_PER_QUARTER).toBe(24);
  });

  it('ticksPerSixteenth = 6', () => {
    expect(ticksPerSixteenth()).toBe(6);
  });

  it('ticksPerStep covers all J-6 step values as integers', () => {
    expect(ticksPerStep('double-whole', false)).toBe(192);
    expect(ticksPerStep('whole',        false)).toBe(96);
    expect(ticksPerStep('half',         false)).toBe(48);
    expect(ticksPerStep('quarter',      false)).toBe(24);
    expect(ticksPerStep('8th',          false)).toBe(12);
    expect(ticksPerStep('16th',         false)).toBe(6);
    // Triplets — 2/3 of base, all integer at 24 PPQ.
    expect(ticksPerStep('double-whole', true)).toBe(128);
    expect(ticksPerStep('whole',        true)).toBe(64);
    expect(ticksPerStep('half',         true)).toBe(32);
    expect(ticksPerStep('quarter',      true)).toBe(16);
    expect(ticksPerStep('8th',          true)).toBe(8);
    expect(ticksPerStep('16th',         true)).toBe(4);
  });

  it('tickIntervalMs at 120 = 500/24 ≈ 20.833', () => {
    expect(tickIntervalMs(120)).toBeCloseTo(500 / 24, 6);
  });
});

describe('nextDownbeatTick', () => {
  // D-06: first rhythm step under Ext clock must land on tick % 24 === 0.
  // At tick 0 the helper returns 24, never 0 — "first step lands on a
  // downbeat" reads as wait-for-next per RESEARCH.md Pitfall 3.
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
