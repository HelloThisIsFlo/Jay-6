import { playChord, releaseChord } from '../midi';
import { arpStepMs } from '../clock';
import type { ArpVariation } from '../phrases';
import type { Engine } from './types';

// Build the played sequence for a given chord + variation:
// 1. Sort the chord ascending.
// 2. Expand across the octave range (octaveRange=1 means chord only; octaveRange=2 adds chord + 12).
// 3. Apply direction (UP / DOWN / UP&DOWN).
export function buildSequence(notes: number[], v: ArpVariation): number[] {
  if (notes.length === 0) return [];
  const sorted = [...notes].sort((a, b) => a - b);

  // Octave-range expansion: octaveRange=1 is just the chord; 2 adds the same notes +12.
  // (Roland's UP1/UP2 etc. — UP1 = one octave span, UP2 = two octaves.)
  const expanded: number[] = [];
  for (let oct = 0; oct < v.octaveRange; oct++) {
    for (const n of sorted) expanded.push(n + oct * 12);
  }

  if (v.direction === 'UP') return expanded;
  if (v.direction === 'DOWN') return [...expanded].reverse();
  // UP&DOWN: up then back down, avoiding doubled top + bottom.
  // [c, e, g] → [c, e, g, e]   (next cycle starts on c again → no dup of bottom either)
  if (expanded.length <= 1) return expanded;
  return [...expanded, ...expanded.slice(1, -1).reverse()];
}

export class ArpEngine implements Engine {
  private variation: ArpVariation;
  private bpm: number;
  private heldNotes: number[] = [];
  private sequence: number[] = [];
  private idx = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentlySounding: number | null = null;

  constructor(variation: ArpVariation, bpm: number) {
    this.variation = variation;
    this.bpm = bpm;
  }

  setVariation(v: ArpVariation): void {
    this.variation = v;
    this.sequence = buildSequence(this.heldNotes, this.variation);
    if (this.idx >= this.sequence.length) this.idx = 0;
    if (this.timer) this.reschedule();
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
    if (this.timer) this.reschedule();
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    this.sequence = buildSequence(this.heldNotes, this.variation);
    this.idx = 0;
    if (this.sequence.length === 0) return;
    // Play first note immediately, then schedule.
    this.tick();
    this.reschedule();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    this.sequence = buildSequence(this.heldNotes, this.variation);
    if (this.idx >= this.sequence.length) this.idx = 0;
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.currentlySounding !== null) {
      releaseChord([this.currentlySounding]);
      this.currentlySounding = null;
    }
    this.heldNotes = [];
    this.sequence = [];
    this.idx = 0;
  }

  private reschedule(): void {
    if (this.timer !== null) clearInterval(this.timer);
    const ms = arpStepMs(this.bpm, this.variation.subdivision, this.variation.triplet);
    this.timer = setInterval(() => this.tick(), ms);
  }

  private tick(): void {
    if (this.sequence.length === 0) return;
    // Release prior note before playing next.
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
