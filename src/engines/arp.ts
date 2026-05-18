import { playChord, releaseChord } from '../midi';
import { arpTicksPerStep, TICKS_PER_QUARTER } from '../clock';
import type { ArpVariation } from '../phrases';
import { tickSource } from '../tickSource';
import type { Engine } from './types';

// Build the played sequence for a given chord + variation:
// 1. Sort the chord ascending.
// 2. Expand across the octave range (octaveRange=1 means chord only; octaveRange=2 adds chord + 12).
// 3. Apply direction (UP / DOWN / UP&DOWN).
export function buildSequence(notes: number[], v: ArpVariation): number[] {
  if (notes.length === 0) return [];
  const sorted = [...notes].sort((a, b) => a - b);

  const expanded: number[] = [];
  for (let oct = 0; oct < v.octaveRange; oct++) {
    for (const n of sorted) expanded.push(n + oct * 12);
  }

  if (v.direction === 'UP') return expanded;
  if (v.direction === 'DOWN') return [...expanded].reverse();
  if (expanded.length <= 1) return expanded;
  return [...expanded, ...expanded.slice(1, -1).reverse()];
}

export class ArpEngine implements Engine {
  private variation: ArpVariation;
  private heldNotes: number[] = [];
  private sequence: number[] = [];
  private idx = 0;
  private ticksPerStep: number;
  private ticksUntilNext = 0;
  private currentlySounding: number | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(variation: ArpVariation, _bpm: number) {
    this.variation = variation;
    this.ticksPerStep = arpTicksPerStep(variation.subdivision, variation.triplet);
  }

  setVariation(v: ArpVariation): void {
    this.variation = v;
    this.ticksPerStep = arpTicksPerStep(v.subdivision, v.triplet);
    this.sequence = buildSequence(this.heldNotes, this.variation);
    if (this.idx >= this.sequence.length) this.idx = 0;
  }

  setBpm(_bpm: number): void {
    // BPM is owned by the TickSource; engine is BPM-agnostic.
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    this.sequence = buildSequence(this.heldNotes, this.variation);
    this.idx = 0;
    // D-06: under Ext, first fire waits for next quarter-note boundary.
    // D-07: Int preserves immediate-fire live-feel.
    this.ticksUntilNext = tickSource.getMode() === 'external'
      ? TICKS_PER_QUARTER
      : this.ticksPerStep;
    this.unsubscribe = tickSource.subscribe(() => this.onTick());
    if (this.sequence.length === 0) return;
    if (tickSource.getMode() === 'internal') this.fireNext();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    this.sequence = buildSequence(this.heldNotes, this.variation);
    if (this.idx >= this.sequence.length) this.idx = 0;
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.currentlySounding !== null) {
      releaseChord([this.currentlySounding]);
      this.currentlySounding = null;
    }
    this.heldNotes = [];
    this.sequence = [];
    this.idx = 0;
  }

  private onTick(): void {
    if (this.sequence.length === 0) return;
    this.ticksUntilNext -= 1;
    if (this.ticksUntilNext <= 0) {
      this.ticksUntilNext = this.ticksPerStep;
      this.fireNext();
    }
  }

  private fireNext(): void {
    if (this.currentlySounding !== null) {
      releaseChord([this.currentlySounding]);
      this.currentlySounding = null;
    }
    const next = this.sequence[this.idx % this.sequence.length]!;
    playChord([next]);
    this.currentlySounding = next;
    this.idx = (this.idx + 1) % this.sequence.length;
  }
}
