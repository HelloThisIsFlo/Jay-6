import { playChord, releaseChord } from '../midi';
import type { Engine } from './types';

// Hold = just play the held chord. No clock involvement.
export class HoldEngine implements Engine {
  private sounding: number[] = [];

  start(notes: number[]): void {
    if (this.sounding.length > 0) releaseChord(this.sounding);
    this.sounding = [...notes];
    if (notes.length > 0) playChord(notes);
  }

  setNotes(notes: number[]): void {
    // Smooth swap: release old, play new. Audible gap is ~ms (single MIDI event pair).
    if (this.sounding.length > 0) releaseChord(this.sounding);
    this.sounding = [...notes];
    if (notes.length > 0) playChord(notes);
  }

  stop(): void {
    if (this.sounding.length > 0) releaseChord(this.sounding);
    this.sounding = [];
  }

  setBpm(_bpm: number): void {
    // no-op
  }
}
