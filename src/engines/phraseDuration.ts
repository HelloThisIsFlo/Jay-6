import { playChord, releaseChord } from '../midi';
import { ticksPerStep, ticksUntilDownbeatFrom } from '../clock';
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
    const ext = tickSource.getMode() === 'external';
    // Arm against OP-1's ABSOLUTE bar, not a local beat from pad-press (fixes the
    // measured +278ms off-grid, UAT tests 11 + 16). wait===0 → already on the
    // OP-1's downbeat, fire now then resume ticksPerStep cadence.
    // D-07: under Int, fire() runs immediately to preserve live-feel.
    const extWait = ext ? ticksUntilDownbeatFrom(tickSource.getExternalTick()) : 0;
    this.ticksUntilNext = ext && extWait > 0 ? extWait : this.ticksPerStep;
    this.unsubscribe = tickSource.subscribe(() => this.onTick());
    if (notes.length === 0) return;
    if (!ext || extWait === 0) this.fire();
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
