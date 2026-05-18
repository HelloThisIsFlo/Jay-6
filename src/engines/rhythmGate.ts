import { playChord, releaseChord } from '../midi';
import { nextDownbeatTick, ticksPerSixteenth } from '../clock';
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
  // D-06: when non-null, onTick suppresses audio until tickCount reaches this
  // boundary. Set under Ext mode at start(); cleared on first audible step.
  private armUntilTick: number | null = null;

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
    // D-06: under Ext clock, defer first fire until next downbeat (tick % 24 === 0).
    // D-07: Int mode unchanged — fires immediately to preserve live-feel.
    if (tickSource.getMode() === 'external') {
      this.armUntilTick = nextDownbeatTick(this.tickCount); // = 24 at tickCount=0
    } else {
      this.evaluateStep();
    }
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
    // D-06: still arming under Ext — count ticks but emit no audio.
    if (this.armUntilTick !== null) {
      if (this.tickCount < this.armUntilTick) {
        this.tickCount += 1;
        return;
      }
      // Landed on the downbeat: reset tickCount so pattern starts at step 0,
      // drop the arm latch, fire the first audible step.
      this.armUntilTick = null;
      this.tickCount = 0;
      this.evaluateStep();
      return;
    }
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
    // Pitfall 4: Math.floor() defends against dropped ticks under Ext clock —
    // float stepIndex would silently skip a bar. Tick-aligned today, but the
    // floor removes the assumption.
    const stepIndex = Math.floor(this.tickCount / this.ticksPerStep) % 16;
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
