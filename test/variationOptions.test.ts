import { describe, expect, it } from 'vitest';
import {
  variationOptionsForStyle,
  type ArpVariationModel,
  type BeatVariationModel,
  type RhythmVariationModel,
} from '../src/variationOptions';
import type { StyleKind } from '../src/state.svelte';

function expectArpModel(style: StyleKind): ArpVariationModel {
  const model = variationOptionsForStyle(style);
  expect(model.kind).toBe('arp');
  if (model.kind !== 'arp') throw new Error(`expected arp model for ${style}`);
  return model;
}

function expectBeatModel(): BeatVariationModel {
  const model = variationOptionsForStyle('phraseDur');
  expect(model.kind).toBe('beat');
  if (model.kind !== 'beat') throw new Error('expected beat model');
  return model;
}

function expectRhythmModel(style: StyleKind): RhythmVariationModel {
  const model = variationOptionsForStyle(style);
  expect(model.kind).toBe('rhythm');
  if (model.kind !== 'rhythm') throw new Error(`expected rhythm model for ${style}`);
  return model;
}

describe('variationOptionsForStyle', () => {
  it('returns no selectable options for Hold', () => {
    expect(variationOptionsForStyle('hold')).toEqual({
      kind: 'none',
      style: 'hold',
      options: [],
    });
  });

  it('preserves exact Arp Style 1 mappings for representative indices', () => {
    const model = expectArpModel('arp1');

    expect(model.style).toBe('arp1');
    expect(model.subdivision).toBe('8th');
    expect(model.options).toHaveLength(12);
    expect(model.options.filter((option) => option.feel === 'straight').map((option) => option.index))
      .toEqual([1, 2, 3, 4, 5, 6]);
    expect(model.options.filter((option) => option.feel === 'triplet').map((option) => option.index))
      .toEqual([7, 8, 9, 10, 11, 12]);
    expect(model.options.filter((option) => [1, 6, 7, 12].includes(option.index))).toEqual([
      {
        index: 1,
        vLabel: 'V01',
        direction: 'UP',
        subdivision: '8th',
        octaveRange: 1,
        triplet: false,
        feel: 'straight',
        directionLabel: 'Up',
        rangeLabel: '1 octave',
        feelLabel: 'Straight',
      },
      {
        index: 6,
        vLabel: 'V06',
        direction: 'UP',
        subdivision: '8th',
        octaveRange: 2,
        triplet: false,
        feel: 'straight',
        directionLabel: 'Up',
        rangeLabel: '2 octaves',
        feelLabel: 'Straight',
      },
      {
        index: 7,
        vLabel: 'V07',
        direction: 'UP',
        subdivision: '8th',
        octaveRange: 1,
        triplet: true,
        feel: 'triplet',
        directionLabel: 'Up',
        rangeLabel: '1 octave',
        feelLabel: 'Triplet',
      },
      {
        index: 12,
        vLabel: 'V12',
        direction: 'UP',
        subdivision: '8th',
        octaveRange: 2,
        triplet: true,
        feel: 'triplet',
        directionLabel: 'Up',
        rangeLabel: '2 octaves',
        feelLabel: 'Triplet',
      },
    ]);
  });

  it('preserves exact Arp Style 2 mappings for representative indices', () => {
    const model = expectArpModel('arp2');

    expect(model.style).toBe('arp2');
    expect(model.subdivision).toBe('16th');
    expect(model.options).toHaveLength(12);
    expect(model.options.filter((option) => [1, 6, 7, 12].includes(option.index))).toMatchObject([
      { index: 1, direction: 'UP', subdivision: '16th', octaveRange: 1, feel: 'straight' },
      { index: 6, direction: 'UP', subdivision: '16th', octaveRange: 2, feel: 'straight' },
      { index: 7, direction: 'UP', subdivision: '16th', octaveRange: 1, feel: 'triplet' },
      { index: 12, direction: 'UP', subdivision: '16th', octaveRange: 2, feel: 'triplet' },
    ]);
  });

  it('preserves Beat duration and straight/triplet index columns', () => {
    const model = expectBeatModel();

    expect(model.rows).toEqual(['double-whole', 'whole', 'half', 'quarter', '8th', '16th']);
    expect(model.columns).toEqual(['straight', 'triplet']);
    expect(model.options.filter((option) => option.feel === 'straight').map((option) => option.index))
      .toEqual([1, 2, 3, 4, 5, 6]);
    expect(model.options.filter((option) => option.feel === 'triplet').map((option) => option.index))
      .toEqual([7, 8, 9, 10, 11, 12]);
    expect(model.options.filter((option) => [1, 6, 7, 12].includes(option.index))).toMatchObject([
      { index: 1, duration: 'double-whole', feel: 'straight', durationLabel: 'Double whole' },
      { index: 6, duration: '16th', feel: 'straight', durationLabel: '16th' },
      { index: 7, duration: 'double-whole', feel: 'triplet', durationLabel: 'Double whole' },
      { index: 12, duration: '16th', feel: 'triplet', durationLabel: '16th' },
    ]);
  });

  it('preserves Rhythm Gate 4 pattern, glyph, parsed steps, and representative indices', () => {
    const model = expectRhythmModel('rhythm4');

    expect(model.style).toBe('rhythm4');
    expect(model.options).toHaveLength(12);
    expect(model.options.every((option) => option.pattern.length === 16)).toBe(true);
    expect(model.options.filter((option) => [1, 6, 7, 12].includes(option.index))).toMatchObject([
      {
        index: 1,
        pattern: 'o___o___o___o___',
        glyphs: ['●', '·', '·', '·', '●', '·', '·', '·', '●', '·', '·', '·', '●', '·', '·', '·'],
        steps: [
          { startStep: 0, durationSteps: 1 },
          { startStep: 4, durationSteps: 1 },
          { startStep: 8, durationSteps: 1 },
          { startStep: 12, durationSteps: 1 },
        ],
      },
      {
        index: 6,
        pattern: 'o_o~o_o~o_o~o_o~',
        glyphs: ['●', '·', '●', '━', '●', '·', '●', '━', '●', '·', '●', '━', '●', '·', '●', '━'],
      },
      {
        index: 7,
        pattern: 'o~~oo~~oo~~oo~~o',
        glyphs: ['●', '━', '━', '●', '●', '━', '━', '●', '●', '━', '━', '●', '●', '━', '━', '●'],
      },
      {
        index: 12,
        pattern: '_ooo_ooo_ooo_ooo',
        glyphs: ['·', '●', '●', '●', '·', '●', '●', '●', '·', '●', '●', '●', '·', '●', '●', '●'],
      },
    ]);
  });

  it('preserves Rhythm Gate 5 pattern, glyph, parsed steps, and representative indices', () => {
    const model = expectRhythmModel('rhythm5');

    expect(model.style).toBe('rhythm5');
    expect(model.options).toHaveLength(12);
    expect(model.options.every((option) => option.pattern.length === 16)).toBe(true);
    expect(model.options.filter((option) => [1, 6, 7, 12].includes(option.index))).toMatchObject([
      {
        index: 1,
        pattern: 'oo__oo__oo__oo__',
        glyphs: ['●', '●', '·', '·', '●', '●', '·', '·', '●', '●', '·', '·', '●', '●', '·', '·'],
      },
      {
        index: 6,
        pattern: '__oo__oo__oo__oo',
        glyphs: ['·', '·', '●', '●', '·', '·', '●', '●', '·', '·', '●', '●', '·', '·', '●', '●'],
      },
      {
        index: 7,
        pattern: 'o__o__o__o__o__o',
        glyphs: ['●', '·', '·', '●', '·', '·', '●', '·', '·', '●', '·', '·', '●', '·', '·', '●'],
      },
      {
        index: 12,
        pattern: '_oo_oo_oo_oo_oo_',
        glyphs: ['·', '●', '●', '·', '●', '●', '·', '●', '●', '·', '●', '●', '·', '●', '●', '·'],
      },
    ]);
    expect(model.options.find((option) => option.index === 12)?.steps).toEqual([
      { startStep: 1, durationSteps: 1 },
      { startStep: 2, durationSteps: 1 },
      { startStep: 4, durationSteps: 1 },
      { startStep: 5, durationSteps: 1 },
      { startStep: 7, durationSteps: 1 },
      { startStep: 8, durationSteps: 1 },
      { startStep: 10, durationSteps: 1 },
      { startStep: 11, durationSteps: 1 },
      { startStep: 13, durationSteps: 1 },
      { startStep: 14, durationSteps: 1 },
    ]);
  });
});
