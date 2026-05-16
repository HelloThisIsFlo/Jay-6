import { playChord, releaseChord } from '../midi';
import { sixteenthMs } from '../clock';
import { parseRhythmPattern, type RhythmStep, type RhythmVariation } from '../phrases';
import type { Engine } from './types';

interface ActiveHit {
  notes: number[];
  releaseAtStepCount: number; // absolute step counter at which to release
}

// Walks a 16-step rhythm pattern at sixteenth-note resolution.
// On each `o`, fires the held chord; releases at gate-fraction of the hit's duration.
export class RhythmGateEngine implements Engine {
  private steps: RhythmStep[];
  private bpm: number;
  private gatePercent: number; // 0..100 — fraction of hit duration to hold

  private heldNotes: number[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  private stepCount = 0; // monotonically increasing 16th-note counter
  private active: ActiveHit | null = null;

  constructor(variation: RhythmVariation, bpm: number, gatePercent: number) {
    this.steps = parseRhythmPattern(variation.pattern);
    this.bpm = bpm;
    this.gatePercent = gatePercent;
  }

  setVariation(v: RhythmVariation): void {
    this.steps = parseRhythmPattern(v.pattern);
    // Keep stepCount; pattern wraps at 16.
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
    if (this.timer) this.reschedule();
  }

  setGatePercent(pct: number): void {
    this.gatePercent = pct;
  }

  start(notes: number[]): void {
    this.stop();
    this.heldNotes = [...notes];
    this.stepCount = 0;
    if (notes.length === 0) return;
    // Tick once immediately to evaluate step 0, then schedule.
    this.tick();
    this.reschedule();
  }

  setNotes(notes: number[]): void {
    this.heldNotes = [...notes];
    // If a hit is currently sounding with the old chord, swap mid-hit.
    if (this.active) {
      releaseChord(this.active.notes);
      this.active.notes = [...notes];
      if (notes.length > 0) playChord(notes);
    }
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.active) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    this.heldNotes = [];
    this.stepCount = 0;
  }

  private reschedule(): void {
    if (this.timer !== null) clearInterval(this.timer);
    const ms = sixteenthMs(this.bpm);
    this.timer = setInterval(() => {
      this.stepCount += 1;
      this.tick();
    }, ms);
  }

  private tick(): void {
    // Release any active hit that's done.
    if (this.active && this.stepCount >= this.active.releaseAtStepCount) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    const stepInBar = this.stepCount % 16;
    const hit = this.steps.find((s) => s.startStep === stepInBar);
    if (!hit) return;
    // Release any still-active hit before firing the new one.
    if (this.active) {
      releaseChord(this.active.notes);
      this.active = null;
    }
    if (this.heldNotes.length === 0) return;
    const notes = [...this.heldNotes];
    playChord(notes);
    // Release after gate% of the hit's duration (in step counts).
    // gate=100 → exactly at the boundary; lower = earlier release.
    // We round up to keep at least 1 step of sustain for gate>0.
    const gateSteps = Math.max(
      this.gatePercent > 0 ? 1 : 0,
      Math.round((hit.durationSteps * this.gatePercent) / 100),
    );
    this.active = {
      notes,
      releaseAtStepCount: this.stepCount + gateSteps,
    };
  }
}
