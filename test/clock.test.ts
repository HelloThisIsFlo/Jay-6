import { describe, expect, it } from 'vitest';
import { arpStepMs, noteValueMs, quarterMs, sixteenthMs } from '../src/clock';

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
});
