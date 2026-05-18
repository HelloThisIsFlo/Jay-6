import { playChord, releaseChord } from '../midi';
import { TICKS_PER_QUARTER, ticksPerStep } from '../clock';
import type { PhraseDurationVariation } from '../phrases';
import { tickSource } from '../tickSource';
import type { Engine } from './types';

export class PhraseDurationEngine implements Engine {
  private heldNotes: number[] = [];
  private ticksPerStep: number;
  private ticksUntilNext = 0;
  private sounding: number[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(variation: PhraseDurationVariation, _bpm: number) {
    this.ticksPerStep = ticksPerStep(variation.duration, variation.triplet);
  }

  setVariation(v: PhraseDurationVariation): void {
    this.ticksPerStep = ticksPerStep(v.duration, v.triplet);
  }

  setBpm(_bpm: number): void {
    // TickSource owns BPM.
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    // D-06: under Ext, first fire waits for the next quarter-note boundary.
    // D-07: under Int, ticksUntilNext follows the variation's step length and
    // fire() runs immediately to preserve live-feel.
    this.ticksUntilNext = tickSource.getMode() === 'external'
      ? TICKS_PER_QUARTER
      : this.ticksPerStep;
    this.unsubscribe = tickSource.subscribe(() => this.onTick());
    if (notes.length === 0) return;
    if (tickSource.getMode() === 'internal') this.fire();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    // Next fire() picks up the new chord.
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.sounding.length > 0) {
      releaseChord(this.sounding);
      this.sounding = [];
    }
    this.heldNotes = [];
  }

  private onTick(): void {
    if (this.heldNotes.length === 0) return;
    this.ticksUntilNext -= 1;
    if (this.ticksUntilNext <= 0) {
      this.ticksUntilNext = this.ticksPerStep;
      this.fire();
    }
  }

  private fire(): void {
    if (this.sounding.length > 0) releaseChord(this.sounding);
    this.sounding = [...this.heldNotes];
    if (this.sounding.length > 0) playChord(this.sounding);
  }
}
