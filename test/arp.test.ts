import { describe, expect, it } from 'vitest';
import { buildSequence } from '../src/engines/arp';
import type { ArpVariation } from '../src/phrases';

function v(direction: ArpVariation['direction'], octaveRange: 1 | 2): ArpVariation {
  return { index: 1, direction, subdivision: '8th', octaveRange, triplet: false };
}

describe('buildSequence', () => {
  it('UP single octave returns chord in ascending order', () => {
    expect(buildSequence([67, 60, 64], v('UP', 1))).toEqual([60, 64, 67]);
  });

  it('DOWN single octave reverses', () => {
    expect(buildSequence([60, 64, 67], v('DOWN', 1))).toEqual([67, 64, 60]);
  });

  it('UP two octaves spans an extra octave', () => {
    expect(buildSequence([60, 64, 67], v('UP', 2))).toEqual([60, 64, 67, 72, 76, 79]);
  });

  it('UP&DOWN avoids doubled endpoints', () => {
    // C E G → up: C E G, then down without repeating top or bottom: E
    expect(buildSequence([60, 64, 67], v('UP&DOWN', 1))).toEqual([60, 64, 67, 64]);
  });

  it('UP&DOWN handles 2-note chords (no middle to mirror)', () => {
    // C G → up: C G, then slice(1, -1) = [] → just [C, G]
    expect(buildSequence([60, 67], v('UP&DOWN', 1))).toEqual([60, 67]);
  });

  it('handles empty chord', () => {
    expect(buildSequence([], v('UP', 1))).toEqual([]);
  });
});
