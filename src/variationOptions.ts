import {
  parseRhythmPattern,
  style1,
  style2,
  style3,
  style4,
  style5,
  type ArpDirection,
  type ArpSubdivision,
  type PhraseDuration,
  type RhythmStep,
} from './phrases';
import type { StyleKind } from './state.svelte';

export type VariationFeel = 'straight' | 'triplet';

export interface NoneVariationModel {
  kind: 'none';
  style: 'hold';
  options: [];
}

export interface ArpVariationOption {
  index: number;
  vLabel: string;
  direction: ArpDirection;
  subdivision: ArpSubdivision;
  octaveRange: 1 | 2;
  triplet: boolean;
  feel: VariationFeel;
  directionLabel: string;
  rangeLabel: string;
  feelLabel: string;
}

export interface ArpVariationModel {
  kind: 'arp';
  style: 'arp1' | 'arp2';
  subdivision: ArpSubdivision;
  directions: ArpDirection[];
  octaveRanges: Array<1 | 2>;
  feels: VariationFeel[];
  options: ArpVariationOption[];
}

export interface BeatVariationOption {
  index: number;
  vLabel: string;
  duration: PhraseDuration;
  triplet: boolean;
  feel: VariationFeel;
  durationLabel: string;
  feelLabel: string;
}

export interface BeatVariationModel {
  kind: 'beat';
  style: 'phraseDur';
  rows: PhraseDuration[];
  columns: VariationFeel[];
  options: BeatVariationOption[];
}

export interface RhythmVariationOption {
  index: number;
  vLabel: string;
  pattern: string;
  glyphs: string[];
  steps: RhythmStep[];
}

export interface RhythmVariationModel {
  kind: 'rhythm';
  style: 'rhythm4' | 'rhythm5';
  options: RhythmVariationOption[];
}

export type VariationOptionModel =
  | NoneVariationModel
  | ArpVariationModel
  | BeatVariationModel
  | RhythmVariationModel;

const DIRECTION_LABELS: Record<ArpDirection, string> = {
  UP: 'Up',
  DOWN: 'Down',
  'UP&DOWN': 'Up/Down',
};

const DURATION_LABELS: Record<PhraseDuration, string> = {
  'double-whole': 'Double whole',
  whole: 'Whole',
  half: 'Half',
  quarter: 'Quarter',
  '8th': '8th',
  '16th': '16th',
};

function uniqueInOrder<T>(values: readonly T[]): T[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function vLabel(index: number): string {
  return `V${String(index).padStart(2, '0')}`;
}

function feelFromTriplet(triplet: boolean): VariationFeel {
  return triplet ? 'triplet' : 'straight';
}

function feelLabel(feel: VariationFeel): string {
  return feel === 'triplet' ? 'Triplet' : 'Straight';
}

function rangeLabel(octaveRange: 1 | 2): string {
  return octaveRange === 1 ? '1 octave' : '2 octaves';
}

function glyphsForPattern(pattern: string): string[] {
  return pattern.split('').map((char) => {
    if (char === 'o') return '●';
    if (char === '~') return '━';
    return '·';
  });
}

function buildArpModel(style: 'arp1' | 'arp2'): ArpVariationModel {
  const source = style === 'arp1' ? style1 : style2;
  const options = source.map((option) => {
    const feel = feelFromTriplet(option.triplet);

    return {
      ...option,
      vLabel: vLabel(option.index),
      feel,
      directionLabel: DIRECTION_LABELS[option.direction],
      rangeLabel: rangeLabel(option.octaveRange),
      feelLabel: feelLabel(feel),
    };
  });

  return {
    kind: 'arp',
    style,
    subdivision: source[0]!.subdivision,
    directions: uniqueInOrder(source.map((option) => option.direction)),
    octaveRanges: uniqueInOrder(source.map((option) => option.octaveRange)),
    feels: uniqueInOrder(options.map((option) => option.feel)),
    options,
  };
}

function buildBeatModel(): BeatVariationModel {
  const options = style3.map((option) => {
    const feel = feelFromTriplet(option.triplet);

    return {
      ...option,
      vLabel: vLabel(option.index),
      feel,
      durationLabel: DURATION_LABELS[option.duration],
      feelLabel: feelLabel(feel),
    };
  });

  return {
    kind: 'beat',
    style: 'phraseDur',
    rows: uniqueInOrder(style3.map((option) => option.duration)),
    columns: uniqueInOrder(options.map((option) => option.feel)),
    options,
  };
}

function buildRhythmModel(style: 'rhythm4' | 'rhythm5'): RhythmVariationModel {
  const source = style === 'rhythm4' ? style4 : style5;

  return {
    kind: 'rhythm',
    style,
    options: source.map((option) => ({
      ...option,
      vLabel: vLabel(option.index),
      glyphs: glyphsForPattern(option.pattern),
      steps: parseRhythmPattern(option.pattern),
    })),
  };
}

export function variationOptionsForStyle(style: StyleKind): VariationOptionModel {
  switch (style) {
    case 'hold':
      return { kind: 'none', style: 'hold', options: [] };
    case 'arp1':
    case 'arp2':
      return buildArpModel(style);
    case 'phraseDur':
      return buildBeatModel();
    case 'rhythm4':
    case 'rhythm5':
      return buildRhythmModel(style);
  }
}
