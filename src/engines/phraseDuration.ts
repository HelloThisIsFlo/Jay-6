import { playChord, releaseChord } from '../midi';
import { noteValueMs } from '../clock';
import type { PhraseDurationVariation } from '../phrases';
import type { Engine } from './types';

// Sustain the full chord for a fixed note length, then retrigger.
export class PhraseDurationEngine implements Engine {
  private variation: PhraseDurationVariation;
  private bpm: number;
  private heldNotes: number[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private sounding: number[] = [];

  constructor(variation: PhraseDurationVariation, bpm: number) {
    this.variation = variation;
    this.bpm = bpm;
  }

  setVariation(v: PhraseDurationVariation): void {
    this.variation = v;
    if (this.timer) this.reschedule();
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
    if (this.timer) this.reschedule();
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    if (notes.length === 0) return;
    this.fire();
    this.reschedule();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    // No immediate retrigger — next fire() picks up new notes.
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.sounding.length > 0) {
      releaseChord(this.sounding);
      this.sounding = [];
    }
    this.heldNotes = [];
  }

  private reschedule(): void {
    if (this.timer !== null) clearInterval(this.timer);
    const ms = noteValueMs(this.bpm, this.variation.duration, this.variation.triplet);
    this.timer = setInterval(() => this.fire(), ms);
  }

  private fire(): void {
    if (this.sounding.length > 0) releaseChord(this.sounding);
    this.sounding = [...this.heldNotes];
    if (this.sounding.length > 0) playChord(this.sounding);
  }
}
