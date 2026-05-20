import { WebMidi, type Input } from 'webmidi';
import { tickIntervalMs } from './clock';
import { getMidiState } from './midi';

export type ClockSource = 'internal' | 'external';
type TickListener = () => void;
type TransportListener = (kind: 'start' | 'stop' | 'continue') => void;

class TickSourceImpl {
  private listeners = new Set<TickListener>();
  private transportListeners = new Set<TransportListener>();
  private mode: ClockSource = 'internal';
  private bpm = 110;
  private timer: ReturnType<typeof setInterval> | null = null;
  private inputId: string | null = null;
  private detachInput: (() => void) | null = null;
  // Absolute count of inbound MIDI clock bytes under Ext mode — the OP-1's own
  // bar frame. Engines read this at start() to align their first audible step to
  // the OP-1's real downbeat (not a beat counted from pad-press). Never advances
  // under Int (we are the master then; there is no external position to track).
  private externalTick = 0;

  setBpm(bpm: number): void {
    this.bpm = bpm;
    if (this.mode === 'internal' && this.timer !== null) {
      this.startInternalTimer();
    }
  }

  setMode(mode: ClockSource): void {
    if (mode === this.mode) return;
    this.stopInternalTimer();
    this.detachInputListener();
    this.mode = mode;
    // Fresh Ext session counts from a clean base; flipping to Int clears any
    // stale Ext count so a later Ext session never inherits it.
    this.resetExternalTick();
    if (this.listeners.size > 0) this.activate();
  }

  getExternalTick(): number {
    return this.externalTick;
  }

  resetExternalTick(): void {
    this.externalTick = 0;
  }

  setInputId(id: string | null): void {
    if (id === this.inputId) return;
    this.inputId = id;
    if (this.mode === 'external') {
      this.detachInputListener();
      this.attachInputListener();
    }
  }

  getMode(): ClockSource {
    return this.mode;
  }

  subscribe(listener: TickListener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.activate();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.deactivate();
    };
  }

  subscribeTransport(listener: TransportListener): () => void {
    this.transportListeners.add(listener);
    return () => {
      this.transportListeners.delete(listener);
    };
  }

  private activate(): void {
    if (this.mode === 'internal') this.startInternalTimer();
    else this.attachInputListener();
  }

  private deactivate(): void {
    this.stopInternalTimer();
    this.detachInputListener();
  }

  private startInternalTimer(): void {
    this.stopInternalTimer();
    const ms = tickIntervalMs(this.bpm);
    // setInterval drift is acceptable at prototype-level; the J-6 itself uses a
    // similar approach.
    this.timer = setInterval(() => this.emitTick(), ms);
  }

  private stopInternalTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private attachInputListener(): void {
    if (!this.inputId) return;
    const input: Input | undefined = WebMidi.getInputById(this.inputId);
    if (!input) return;
    // (Re)attaching means a fresh Ext session — count the OP-1's bar frame from 0.
    this.resetExternalTick();
    const onClock = (): void => this.emitTick();
    const onStart = (): void => this.emitTransport('start');
    const onStop = (): void => this.emitTransport('stop');
    const onContinue = (): void => this.emitTransport('continue');
    input.addListener('clock', onClock);
    input.addListener('start', onStart);
    input.addListener('stop', onStop);
    input.addListener('continue', onContinue);
    this.detachInput = () => {
      input.removeListener('clock', onClock);
      input.removeListener('start', onStart);
      input.removeListener('stop', onStop);
      input.removeListener('continue', onContinue);
    };
  }

  private detachInputListener(): void {
    this.detachInput?.();
    this.detachInput = null;
  }

  private emitTick(): void {
    // D-02: clock send is always-on when Int, never when Ext (we are the slave then).
    // Optional-chain mirrors midi.ts:107-112 getChannel pattern — silent no-op when
    // output not yet ready (Pitfall 1).
    if (this.mode === 'internal') {
      const outId = getMidiState().selectedOutputId;
      if (outId) WebMidi.getOutputById(outId)?.sendClock();
    } else {
      // One increment per inbound MIDI clock byte — the OP-1's absolute position.
      this.externalTick += 1;
    }
    for (const l of this.listeners) l();
  }

  private emitTransport(kind: 'start' | 'stop' | 'continue'): void {
    for (const l of this.transportListeners) l(kind);
  }
}

export const tickSource = new TickSourceImpl();
