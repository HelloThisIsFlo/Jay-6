import { playChord, releaseChord } from '../midi';
import { ticksPerSixteenth } from '../clock';
import { parseRhythmPattern, type RhythmStep, type RhythmVariation } from '../phrases';
import { tickSource } from '../tickSource';
import type { Engine } from './types';

interface ActiveHit {
  notes: number[];
  releaseAtTick: number; // absolute internal tick counter at which to release
}

// Walks a 16-step rhythm pattern at sixteenth-note resolution.
export class RhythmGateEngine implements Engine {
  private steps: RhythmStep[];
  private gatePercent: number;

  private heldNotes: number[] = [];
  private unsubscribe: (() => void) | null = null;

  private tickCount = 0;             // total ticks since start()
  private ticksPerStep: number;      // 6 at 24 PPQ
  private active: ActiveHit | null = null;

  constructor(variation: RhythmVariation, _bpm: number, gatePercent: number) {
    this.steps = parseRhythmPattern(variation.pattern);
    this.gatePercent = gatePercent;
    this.ticksPerStep = ticksPerSixteenth();
  }

  setVariation(v: RhythmVariation): void {
    this.steps = parseRhythmPattern(v.pattern);
  }

  setBpm(_bpm: number): void {
    // TickSource owns BPM.
  }

  setGatePercent(pct: number): void {
    this.gatePercent = pct;
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    this.tickCount = 0;
    this.unsubscribe = tickSource.subscribe(() => this.onTick());
    if (notes.length === 0) return;
    this.evaluateStep();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    if (this.active) {
      releaseChord(this.active.notes);
      this.active.notes = [...notes];
      if (notes.length > 0) playChord(notes);
    }
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.active) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    this.heldNotes = [];
    this.tickCount = 0;
  }

  private onTick(): void {
    if (this.heldNotes.length === 0) {
      this.tickCount += 1;
      return;
    }
    // Release any active hit whose gate window closed.
    if (this.active && this.tickCount >= this.active.releaseAtTick) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    // Step boundary?
    this.tickCount += 1;
    if (this.tickCount % this.ticksPerStep === 0) {
      this.evaluateStep();
    }
  }

  private evaluateStep(): void {
    const stepIndex = (this.tickCount / this.ticksPerStep) % 16;
    const hit = this.steps.find((s) => s.startStep === stepIndex);
    if (!hit) return;
    if (this.active) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    if (this.heldNotes.length === 0) return;
    const notes = [...this.heldNotes];
    playChord(notes);
    const hitTicks = hit.durationSteps * this.ticksPerStep;
    const gateTicks = Math.max(
      this.gatePercent > 0 ? 1 : 0,
      Math.round((hitTicks * this.gatePercent) / 100),
    );
    this.active = { notes, releaseAtTick: this.tickCount + gateTicks };
  }
}
