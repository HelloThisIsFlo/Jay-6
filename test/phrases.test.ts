import { describe, expect, it } from 'vitest';
import {
  parseRhythmPattern,
  style1,
  style2,
  style3,
  style4,
  style5,
} from '../src/phrases';

describe('parseRhythmPattern', () => {
  it('parses pure sixteenth hits', () => {
    expect(parseRhythmPattern('o_o_o_o_o_o_o_o_')).toEqual([
      { startStep: 0,  durationSteps: 1 },
      { startStep: 2,  durationSteps: 1 },
      { startStep: 4,  durationSteps: 1 },
      { startStep: 6,  durationSteps: 1 },
      { startStep: 8,  durationSteps: 1 },
      { startStep: 10, durationSteps: 1 },
      { startStep: 12, durationSteps: 1 },
      { startStep: 14, durationSteps: 1 },
    ]);
  });

  it('extends with ~', () => {
    // o ~ o _ o ~ o _ o ~ o _ o ~ o _
    // 0 1 2 3 4 5 6 7 8 9 ...
    expect(parseRhythmPattern('o~o_o~o_o~o_o~o_')).toEqual([
      { startStep: 0,  durationSteps: 2 }, // o~ = eighth
      { startStep: 2,  durationSteps: 1 },
      { startStep: 4,  durationSteps: 2 },
      { startStep: 6,  durationSteps: 1 },
      { startStep: 8,  durationSteps: 2 },
      { startStep: 10, durationSteps: 1 },
      { startStep: 12, durationSteps: 2 },
      { startStep: 14, durationSteps: 1 },
    ]);
  });

  it('handles dotted eighth + sixteenth (Style 4 var 7)', () => {
    // o ~ ~ o o ~ ~ o o ~ ~ o o ~ ~ o
    // 0       3 4       7 8       11 12     15
    expect(parseRhythmPattern('o~~oo~~oo~~oo~~o')).toEqual([
      { startStep: 0,  durationSteps: 3 },
      { startStep: 3,  durationSteps: 1 },
      { startStep: 4,  durationSteps: 3 },
      { startStep: 7,  durationSteps: 1 },
      { startStep: 8,  durationSteps: 3 },
      { startStep: 11, durationSteps: 1 },
      { startStep: 12, durationSteps: 3 },
      { startStep: 15, durationSteps: 1 },
    ]);
  });

  it('rejects wrong length', () => {
    expect(() => parseRhythmPattern('oooo')).toThrow();
  });

  it('rejects dangling ~', () => {
    expect(() => parseRhythmPattern('~ooo_ooo_ooo_ooo')).toThrow();
  });
});

describe('style data shape', () => {
  it('has 12 variations per style', () => {
    expect(style1).toHaveLength(12);
    expect(style2).toHaveLength(12);
    expect(style3).toHaveLength(12);
    expect(style4).toHaveLength(12);
    expect(style5).toHaveLength(12);
  });

  it('all rhythm patterns are 16 chars and parse', () => {
    for (const v of [...style4, ...style5]) {
      expect(v.pattern).toHaveLength(16);
      expect(() => parseRhythmPattern(v.pattern)).not.toThrow();
    }
  });

  it('style 1 is 8th, style 2 is 16th', () => {
    expect(style1.every((v) => v.subdivision === '8th')).toBe(true);
    expect(style2.every((v) => v.subdivision === '16th')).toBe(true);
  });
});
