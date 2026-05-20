import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Seam: tickSource binds its input listeners via WebMidi.getInputById(id). We mock
// the `webmidi` module so attachInputListener resolves to a fake Input that records
// addListener/removeListener calls and lets the test fire events. This keeps the
// regression deterministic state-machine-only (DEC-tests-data-and-math-only) — no
// real MIDI hardware, no engine side-effects asserted, just tickSource's listener
// bookkeeping. getMidiState is stubbed so emitTick's Int-mode clock-send is inert.
type MidiHandler = () => void;

class FakeInput {
  handlers: Record<string, Set<MidiHandler>> = {
    clock: new Set(),
    start: new Set(),
    stop: new Set(),
    continue: new Set(),
  };
  addCalls: string[] = [];
  removeCalls: string[] = [];

  addListener(event: string, fn: MidiHandler): void {
    this.addCalls.push(event);
    this.handlers[event]?.add(fn);
  }

  removeListener(event: string, fn: MidiHandler): void {
    this.removeCalls.push(event);
    this.handlers[event]?.delete(fn);
  }

  fire(event: string): void {
    for (const fn of this.handlers[event] ?? []) fn();
  }

  boundCount(): number {
    return Object.values(this.handlers).reduce((n, s) => n + s.size, 0);
  }
}

let fakeInput: FakeInput;

vi.mock('webmidi', () => ({
  WebMidi: {
    getInputById: () => fakeInput,
    getOutputById: () => undefined,
  },
}));

vi.mock('../src/midi', () => ({
  getMidiState: () => ({ selectedOutputId: null }),
}));

// Import after mocks are registered.
const { tickSource } = await import('../src/tickSource');

const STUB_ID = 'fake-op1';

beforeEach(() => {
  fakeInput = new FakeInput();
  // Start from a known clean Int baseline for every case.
  tickSource.setMode('internal');
  tickSource.setInputId(null);
});

afterEach(() => {
  tickSource.setMode('internal');
});

describe('tickSource Int-switch leak guard (test-16 regression)', () => {
  it('Case A — flip to Int detaches all four listeners and external clock fires no subscriber', () => {
    let ticks = 0;
    tickSource.setMode('external');
    tickSource.setInputId(STUB_ID);
    const unsub = tickSource.subscribe(() => { ticks += 1; });

    expect(fakeInput.boundCount()).toBe(4); // clock/start/stop/continue all bound

    tickSource.setMode('internal');

    // All four removed; nothing left bound on the fake input.
    for (const e of ['clock', 'start', 'stop', 'continue']) {
      expect(fakeInput.removeCalls).toContain(e);
    }
    expect(fakeInput.boundCount()).toBe(0);

    // Stale external clock can no longer reach the subscriber.
    fakeInput.fire('clock');
    expect(ticks).toBe(0);
    expect(tickSource.getExternalTick()).toBe(0);

    unsub();
  });

  it('Case B — under Int, external clock/continue never advance externalTick or subscribers', () => {
    let ticks = 0;
    tickSource.setMode('external');
    tickSource.setInputId(STUB_ID);
    const unsub = tickSource.subscribe(() => { ticks += 1; });

    tickSource.setMode('internal');

    fakeInput.fire('clock');
    fakeInput.fire('continue');
    fakeInput.fire('clock');

    expect(ticks).toBe(0);
    expect(tickSource.getExternalTick()).toBe(0);

    unsub();
  });

  it('Case C — re-flip Ext→Int→Ext rebinds fresh listeners with no double-firing', () => {
    let ticks = 0;
    tickSource.setMode('external');
    tickSource.setInputId(STUB_ID);
    const unsub = tickSource.subscribe(() => { ticks += 1; });

    tickSource.setMode('internal');
    tickSource.setMode('external');

    // Exactly one binding per event after the round-trip.
    expect(fakeInput.boundCount()).toBe(4);

    fakeInput.fire('clock');
    expect(ticks).toBe(1); // fires once, not twice
    expect(tickSource.getExternalTick()).toBe(1);

    unsub();
  });
});
