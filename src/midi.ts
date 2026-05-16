import { WebMidi, type Output, type OutputChannel } from 'webmidi';

export interface MidiOutputInfo {
  id: string;
  name: string;
}

export type MidiStatus = 'idle' | 'requesting' | 'ready' | 'unsupported' | 'denied' | 'error';

interface State {
  status: MidiStatus;
  error: string | null;
  outputs: MidiOutputInfo[];
  selectedOutputId: string | null;
  channel: number; // 1..16
}

// Plain $state-like object — Svelte $state can't live in a .ts module that runs at import
// time outside a component, so we expose a tiny manual subscription model.
const state: State = {
  status: 'idle',
  error: null,
  outputs: [],
  selectedOutputId: null,
  channel: 1,
};

type Listener = (s: Readonly<State>) => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const l of listeners) l(state);
}

export function subscribeMidi(l: Listener): () => void {
  listeners.add(l);
  l(state);
  return () => {
    listeners.delete(l);
  };
}

export function getMidiState(): Readonly<State> {
  return state;
}

function refreshOutputs(): void {
  state.outputs = WebMidi.outputs.map((o) => ({ id: o.id, name: o.name }));
  if (state.selectedOutputId && !state.outputs.find((o) => o.id === state.selectedOutputId)) {
    state.selectedOutputId = null;
  }
  if (!state.selectedOutputId && state.outputs.length > 0) {
    state.selectedOutputId = state.outputs[0]!.id;
  }
  notify();
}

export async function initMidi(): Promise<void> {
  if (state.status === 'ready' || state.status === 'requesting') return;
  if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
    state.status = 'unsupported';
    state.error = 'Web MIDI not supported in this browser. Use Chrome or Edge.';
    notify();
    return;
  }
  state.status = 'requesting';
  state.error = null;
  notify();
  try {
    await WebMidi.enable();
    state.status = 'ready';
    refreshOutputs();
    WebMidi.addListener('connected', refreshOutputs);
    WebMidi.addListener('disconnected', refreshOutputs);
  } catch (err) {
    state.status = err instanceof Error && /denied|permission/i.test(err.message) ? 'denied' : 'error';
    state.error = err instanceof Error ? err.message : String(err);
    notify();
  }
}

export function selectOutput(id: string | null): void {
  state.selectedOutputId = id;
  notify();
}

export function setChannel(ch: number): void {
  if (ch < 1 || ch > 16) throw new Error(`channel out of range: ${ch}`);
  state.channel = ch;
  notify();
}

function getChannel(): OutputChannel | null {
  if (state.status !== 'ready' || !state.selectedOutputId) return null;
  const output: Output | undefined = WebMidi.getOutputById(state.selectedOutputId);
  if (!output) return null;
  return output.channels[state.channel] ?? null;
}

const DEFAULT_VELOCITY = 100;

export function playChord(notes: readonly number[], velocity = DEFAULT_VELOCITY): void {
  const ch = getChannel();
  if (!ch) return;
  const valid = notes.filter((n) => n >= 0 && n <= 127);
  if (valid.length === 0) return;
  ch.sendNoteOn(valid as number[], { rawAttack: velocity });
}

export function releaseChord(notes: readonly number[]): void {
  const ch = getChannel();
  if (!ch) return;
  const valid = notes.filter((n) => n >= 0 && n <= 127);
  if (valid.length === 0) return;
  ch.sendNoteOff(valid as number[]);
}

export function allNotesOff(): void {
  const ch = getChannel();
  if (!ch) return;
  ch.sendAllNotesOff();
}
