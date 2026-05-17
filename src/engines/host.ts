import { allNotesOff } from '../midi';
import { style1, style2, style3, style4, style5 } from '../phrases';
import type { StyleKind } from '../state.svelte';
import { ArpEngine } from './arp';
import { HoldEngine } from './hold';
import { PhraseDurationEngine } from './phraseDuration';
import { RhythmGateEngine } from './rhythmGate';
import type { Engine } from './types';

interface HostConfig {
  bpm: number;
  styleKind: StyleKind;
  variation: number; // 1..12
  transpose: number; // semitones
  latch: boolean;
  gatePercent: number;
}

function transposeNotes(notes: readonly number[], semitones: number): number[] {
  return notes
    .map((n) => n + semitones)
    .filter((n) => n >= 0 && n <= 127);
}

function buildEngine(cfg: HostConfig): Engine {
  switch (cfg.styleKind) {
    case 'hold':
      return new HoldEngine();
    case 'arp1':
      return new ArpEngine(style1[cfg.variation - 1]!, cfg.bpm);
    case 'arp2':
      return new ArpEngine(style2[cfg.variation - 1]!, cfg.bpm);
    case 'phraseDur':
      return new PhraseDurationEngine(style3[cfg.variation - 1]!, cfg.bpm);
    case 'rhythm4':
      return new RhythmGateEngine(style4[cfg.variation - 1]!, cfg.bpm, cfg.gatePercent);
    case 'rhythm5':
      return new RhythmGateEngine(style5[cfg.variation - 1]!, cfg.bpm, cfg.gatePercent);
  }
}

export class EngineHost {
  private cfg: HostConfig;
  private engine: Engine;
  // pads currently physically held (mouse/key down) — independent of latch
  private heldPads = new Set<string>();
  // padKey → raw chord notes (pre-transpose)
  private padNotes = new Map<string, number[]>();
  // Whether the engine is currently producing sound (latch sustains this past pad release).
  private playing = false;
  // The raw chord most recently sent to the engine — used for "latch + new pad" swap.
  private currentRawChord: number[] = [];
  // The pad key currently sustained by latch (null = nothing latched).
  private latchedKey: string | null = null;

  constructor(cfg: HostConfig) {
    this.cfg = { ...cfg };
    this.engine = buildEngine(this.cfg);
  }

  padPressed(key: string, rawNotes: number[]): void {
    this.heldPads.add(key);
    this.padNotes.set(key, rawNotes);
    const transposed = transposeNotes(rawNotes, this.cfg.transpose);
    this.currentRawChord = rawNotes;
    if (this.cfg.latch && this.playing) {
      // Roland J-6 HOLD convention: same pad re-press retriggers (engine timeline
      // restarts), different pad swaps the chord smoothly (timeline continues).
      // Only the Latch toggle stops sound.
      if (this.latchedKey === key) {
        this.engine.start(transposed);
      } else {
        this.engine.setNotes(transposed);
      }
    } else {
      this.engine.start(transposed);
      this.playing = true;
    }
    if (this.cfg.latch) this.latchedKey = key;
  }

  padReleased(key: string): void {
    this.heldPads.delete(key);
    this.padNotes.delete(key);
    if (this.cfg.latch) {
      // Latch on: keep sounding. Released pad doesn't stop the engine.
      return;
    }
    if (this.heldPads.size === 0) {
      this.engine.stop();
      this.playing = false;
    } else {
      // Another pad still down: swap to the most recently still-held pad.
      const lastKey = Array.from(this.heldPads).at(-1)!;
      const raw = this.padNotes.get(lastKey) ?? [];
      this.currentRawChord = raw;
      this.engine.setNotes(transposeNotes(raw, this.cfg.transpose));
    }
  }

  // Called by UI button (latch is a toggle) or manually to clear sound.
  panic(): void {
    this.engine.stop();
    this.playing = false;
    this.latchedKey = null;
    allNotesOff();
  }

  setBpm(bpm: number): void {
    this.cfg.bpm = bpm;
    this.engine.setBpm(bpm);
  }

  setStyle(kind: StyleKind, variation: number): void {
    const styleChanged = kind !== this.cfg.styleKind;
    const variationChanged = variation !== this.cfg.variation;
    if (!styleChanged && !variationChanged) return;

    if (styleChanged) {
      // Tear down old engine, build new one.
      const wasPlaying = this.playing;
      this.engine.stop();
      this.cfg.styleKind = kind;
      this.cfg.variation = variation;
      this.engine = buildEngine(this.cfg);
      if (wasPlaying && this.currentRawChord.length > 0) {
        this.engine.start(transposeNotes(this.currentRawChord, this.cfg.transpose));
      }
    } else {
      // Same style, just variation change — update in place if engine supports it.
      this.cfg.variation = variation;
      this.updateEngineVariation();
    }
  }

  setTranspose(semitones: number): void {
    this.cfg.transpose = semitones;
    if (this.playing && this.currentRawChord.length > 0) {
      this.engine.setNotes(transposeNotes(this.currentRawChord, semitones));
    }
  }

  setLatch(latch: boolean): void {
    const was = this.cfg.latch;
    this.cfg.latch = latch;
    // Turning latch OFF while engine is playing and no pads held → stop.
    if (was && !latch && this.heldPads.size === 0 && this.playing) {
      this.engine.stop();
      this.playing = false;
    }
    if (!latch) this.latchedKey = null;
  }

  setGatePercent(pct: number): void {
    this.cfg.gatePercent = pct;
    if (this.engine instanceof RhythmGateEngine) {
      this.engine.setGatePercent(pct);
    }
  }

  private updateEngineVariation(): void {
    const v = this.cfg.variation;
    if (this.engine instanceof ArpEngine) {
      const list = this.cfg.styleKind === 'arp1' ? style1 : style2;
      this.engine.setVariation(list[v - 1]!);
    } else if (this.engine instanceof PhraseDurationEngine) {
      this.engine.setVariation(style3[v - 1]!);
    } else if (this.engine instanceof RhythmGateEngine) {
      const list = this.cfg.styleKind === 'rhythm4' ? style4 : style5;
      this.engine.setVariation(list[v - 1]!);
    }
  }
}
