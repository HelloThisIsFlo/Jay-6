import { WebMidi } from 'webmidi';
import { allNotesOff, getMidiState } from '../midi';
import { style1, style2, style3, style4, style5 } from '../phrases';
import type { StyleKind } from '../state.svelte';
import { tickSource, type ClockSource } from '../tickSource';
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
  clockMode: ClockSource;
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
  // D-05 double-trigger guard window: OP-1 Record+Start chatter can fire two Starts
  // within ~tens of ms; 200ms covers it without rejecting legit user retriggers.
  private static readonly START_DEBOUNCE_MS = 200;

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
  // D-05: monotonic timestamp of the last inbound Start — performance.now() not
  // Date.now() because NTP sync mid-session would invalidate the window (Pitfall 2).
  private lastStartMs = 0;
  // D-04: lifecycle state — Start arms 'fresh' (reset position), Continue arms
  // 'resume'. Lives on host because it's engine-lifecycle state, not UI state.
  private armedPosition: 'fresh' | 'resume' | null = null;
  // Highlight state (heldKeys/latchedKey) is component-owned in App.svelte, so the
  // host can't clear it directly. Every panic path (mode switch, transport stop,
  // disconnect, unload) invokes this so the UI clears too — never a stuck-on state.
  private onPanic: (() => void) | null = null;

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
      this.sendTransport('start');
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
      this.sendTransport('stop');
    } else {
      // Another pad still down: swap to the most recently still-held pad.
      const lastKey = Array.from(this.heldPads).at(-1)!;
      const raw = this.padNotes.get(lastKey) ?? [];
      this.currentRawChord = raw;
      this.engine.setNotes(transposeNotes(raw, this.cfg.transpose));
    }
  }

  // Register the App's highlight-clear hook. Called once on mount so EVERY panic
  // path drives the same UI cleanup, not just user-pressed panic.
  setOnPanic(cb: () => void): void {
    this.onPanic = cb;
  }

  // Called by UI button (latch is a toggle) or manually to clear sound.
  panic(): void {
    this.engine.stop();
    this.playing = false;
    this.latchedKey = null;
    // A disruption clears ALL engine-side held state per the user's "never stuck-on"
    // principle (UAT tests 16, 20): a physically-held key surviving a disconnect must
    // not keep the engine logically "held" and refire on the next event.
    this.heldPads.clear();
    this.padNotes.clear();
    this.currentRawChord = [];
    allNotesOff();
    this.onPanic?.();
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

  setClockMode(mode: ClockSource): void {
    this.cfg.clockMode = mode;
  }

  // D-04: exposed for engines / UAT instrumentation that need to distinguish
  // "fresh" (Start reset position to 0) from "resume" (Continue keeps position).
  // Current rhythm engines align to next downbeat regardless; consumer for the
  // 'resume' branch ships when sequencer arrives (v2).
  getArmedPosition(): 'fresh' | 'resume' | null {
    return this.armedPosition;
  }

  // D-04: forward inbound transport from tickSource. Master mode ignores inbound;
  // only slave (Ext) reacts. Stop reuses panic() per Pitfall 5 (verified all-clean path).
  onTransport(kind: 'start' | 'stop' | 'continue'): void {
    // Intentional UAT instrumentation for the transport re-verify (test 16 step 4):
    // proves inbound transport reaches the engine. console.debug (not log) keeps it
    // out of the default prod console. Tracked-removal follow-up in 02-06-SUMMARY.
    console.debug('TRANSPORT-IN', kind);
    if (this.cfg.clockMode !== 'external') return;
    if (kind === 'start' || kind === 'continue') {
      // OP-1 emits Continue (0xFB) on Play, NEVER Start (0xFA) — confirmed in the
      // 2026-05-20 MIDI Monitor session. Keying align off Continue is required for
      // THIS hardware, so both messages arm-and-align. Debounce covers OP-1
      // Record chatter (D-05 + Pitfall 2: performance.now() is NTP-immune).
      const now = performance.now();
      if (now - this.lastStartMs < EngineHost.START_DEBOUNCE_MS) return;
      this.lastStartMs = now;
      this.armedPosition = 'fresh';
      // Restart the absolute tick at the transport event so ticksUntilDownbeatFrom
      // aligns to the OP-1's just-started bar. (The 'resume'-vs-'fresh' sequencer-v2
      // distinction is noted but no longer blocks alignment on this hardware.)
      tickSource.resetExternalTick();
    } else {
      // Pitfall 5: reuse the verified all-clean path; don't invent a new cleanup.
      this.panic();
    }
  }

  // D-03 mode-switch hard stop. Alias for clarity at the App.svelte call site —
  // semantics identical to user-pressed Panic.
  panicForModeSwitch(): void {
    this.panic();
  }

  // D-02: only master mode sends transport — slave mode listens only.
  // Optional-chain mirrors midi.ts:117-122 playChord guard style.
  private sendTransport(kind: 'start' | 'stop' | 'continue'): void {
    if (this.cfg.clockMode !== 'internal') return;
    const outId = getMidiState().selectedOutputId;
    if (!outId) return;
    const out = WebMidi.getOutputById(outId);
    if (kind === 'start') out?.sendStart();
    else if (kind === 'stop') out?.sendStop();
    else out?.sendContinue();
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
