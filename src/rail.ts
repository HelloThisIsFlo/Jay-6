// Pure hold-count reducer + pad-notes lookup + chip visual precedence for the
// suggestion rail (Phase 4). No runes here — this module is plain TypeScript so
// it gets real Vitest coverage; Svelte component mounting is out of this
// project's test scope (see .planning/codebase/TESTING.md).
import { getBank, type Key } from './banks';

export type HoldCounts = ReadonlyMap<Key, number>;

export interface HoldStep {
  readonly counts: HoldCounts;
  readonly forward: boolean;
}

export const NO_HOLDS: HoldCounts = new Map();

// The host and App's highlight Set are not ref-counted, so a second source
// pressing (or releasing) an already-held key must never reach them directly —
// only the 0-to-1 press and 1-to-0 release transitions may forward, or a second
// source's later release would silence/un-highlight a key the first source
// still holds (D-04).
export function pressHold(counts: HoldCounts, key: Key): HoldStep {
  const previous = counts.get(key) ?? 0;
  const next = new Map(counts);
  next.set(key, previous + 1);
  return { counts: next, forward: previous === 0 };
}

export function releaseHold(counts: HoldCounts, key: Key): HoldStep {
  const previous = counts.get(key) ?? 0;
  if (previous === 0) {
    // Stray release (no matching hold) — never forward, never allocate.
    return { counts, forward: false };
  }
  const next = new Map(counts);
  if (previous === 1) {
    next.delete(key);
    return { counts: next, forward: true };
  }
  next.set(key, previous - 1);
  return { counts: next, forward: false };
}

export function heldKeySet(counts: HoldCounts): Set<Key> {
  return new Set(counts.keys());
}

export function padNotesFor(bankIndex: number, key: Key): number[] | undefined {
  return getBank(bankIndex).chords.find((c) => c.key === key)?.notes;
}

export type ChipVisualState = 'held' | 'echo' | 'idle';

// Precedence: held > echo > idle (D-03, D-05) — the physically-pressed chip
// instance always wins even when its key is also lit elsewhere.
export function chipVisualState(heldHere: boolean, keyLit: boolean): ChipVisualState {
  if (heldHere) return 'held';
  if (keyLit) return 'echo';
  return 'idle';
}

// RED stub (04-03 Task 1): intentionally wrong bodies so the newly-added tests fail on
// real assertions rather than on missing imports. Replaced with the real implementation
// in the GREEN commit.
export const RAIL_COLUMN_MAX_PER_ROW = 4;

export function chipsPerRow(_stepCount: number, _maxPerRow: number): number {
  return 0;
}

export function fitChipsPerRow(
  _stepCount: number,
  _maxPerRow: number,
  _fits: (perRow: number) => boolean,
): number {
  return 0;
}

export interface ChordLabelParts {
  readonly main: string;
  readonly bass: string;
}

export function splitChordLabel(label: string): ChordLabelParts {
  return { main: label, bass: '' };
}

export function isNaturalKey(_key: Key): boolean {
  return false;
}
