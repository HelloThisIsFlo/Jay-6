import { describe, expect, it } from 'vitest';
import { banks, getBank, labelFor, KEYS } from '../src/banks';

describe('banks data', () => {
  it('has exactly 100 banks indexed 1..100', () => {
    expect(banks).toHaveLength(100);
    for (let i = 0; i < 100; i++) {
      expect(banks[i]!.index).toBe(i + 1);
    }
  });

  it('every bank has 12 chords in chromatic order C..B', () => {
    for (const b of banks) {
      expect(b.chords).toHaveLength(12);
      const keys = b.chords.map((c) => c.key);
      expect(keys).toEqual([...KEYS]);
    }
  });

  it('every chord has MIDI notes in 0..127', () => {
    for (const b of banks) {
      for (const c of b.chords) {
        expect(c.notes.length).toBeGreaterThan(0);
        for (const n of c.notes) {
          expect(n).toBeGreaterThanOrEqual(0);
          expect(n).toBeLessThanOrEqual(127);
          expect(Number.isInteger(n)).toBe(true);
        }
      }
    }
  });

  it('every bank has a non-empty name', () => {
    for (const b of banks) {
      expect(b.name.length).toBeGreaterThan(0);
    }
  });

  it('getBank wraps 0 -> 100 and 101 -> 1', () => {
    expect(getBank(0).index).toBe(100);
    expect(getBank(101).index).toBe(1);
  });

  it('labelFor falls back to "<key> <bankName>" when chord name is empty', () => {
    const fakeBank = { ...banks[0]!, name: 'Stub Bank' };
    expect(labelFor(fakeBank, { key: 'C', name: '', notes: [60] })).toBe('C Stub Bank');
    expect(labelFor(fakeBank, { key: 'C', name: 'Cmaj7', notes: [60] })).toBe('Cmaj7');
  });

  // PLAN.md sanity checks — anchor to known Roland values.
  it('bank 1 / C is Cadd9 → [48, 55, 62, 64]', () => {
    const c = banks[0]!.chords.find((c) => c.key === 'C')!;
    expect(c.name).toBe('Cadd9');
    expect(c.notes).toEqual([48, 55, 62, 64]);
  });

  it('bank 14 (Oct Stack) / C is the two-note dyad [60, 72]', () => {
    const bank = banks[13]!;
    expect(bank.name).toBe('Oct Stack');
    const c = bank.chords.find((c) => c.key === 'C')!;
    expect(c.name).toBe('');
    expect(c.notes).toEqual([60, 72]);
  });

  // Reconciliation anchors — slots where stonefruit + Roland independently agree.
  // Spread across banks/genres so a regression on the JSON shows up loudly.
  it('bank 1 / A is FM/A → [45, 57, 60, 65]', () => {
    const c = banks[0]!.chords.find((c) => c.key === 'A')!;
    expect(c.name).toBe('FM/A');
    expect(c.notes).toEqual([45, 57, 60, 65]);
  });

  it('bank 30 / A is G/B → [47, 55, 59, 62]', () => {
    const c = banks[29]!.chords.find((c) => c.key === 'A')!;
    expect(c.name).toBe('G/B');
    expect(c.notes).toEqual([47, 55, 59, 62]);
  });

  it('bank 46 / A is Em → [52, 59, 67]', () => {
    const c = banks[45]!.chords.find((c) => c.key === 'A')!;
    expect(c.name).toBe('Em');
    expect(c.notes).toEqual([52, 59, 67]);
  });

  it('bank 79 / A is F7/A → [57, 63, 65]', () => {
    const c = banks[78]!.chords.find((c) => c.key === 'A')!;
    expect(c.name).toBe('F7/A');
    expect(c.notes).toEqual([57, 63, 65]);
  });

  it('bank 95 / C is FM7/E → [64, 65, 69]', () => {
    const c = banks[94]!.chords.find((c) => c.key === 'C')!;
    expect(c.name).toBe('FM7/E');
    expect(c.notes).toEqual([64, 65, 69]);
  });
});
