// Pure hold-count reducer + pad-notes lookup + chip visual precedence for the
// suggestion rail (Phase 4). No runes here — this module is plain TypeScript so
// it gets real Vitest coverage; Svelte component mounting is out of this
// project's test scope (see .planning/codebase/TESTING.md).
import type { Key } from './banks';

export type HoldCounts = ReadonlyMap<Key, number>;

export interface HoldStep {
  readonly counts: HoldCounts;
  readonly forward: boolean;
}

export const NO_HOLDS: HoldCounts = new Map();

// RED stub: intentionally wrong so the test suite fails on real assertions
// (not an import crash) before the GREEN implementation lands.
export function pressHold(counts: HoldCounts, _key: Key): HoldStep {
  return { counts, forward: false };
}

export function releaseHold(counts: HoldCounts, _key: Key): HoldStep {
  return { counts, forward: false };
}

export function heldKeySet(_counts: HoldCounts): Set<Key> {
  return new Set();
}

export function padNotesFor(_bankIndex: number, _key: Key): number[] | undefined {
  return undefined;
}

export type ChipVisualState = 'held' | 'echo' | 'idle';

export function chipVisualState(_heldHere: boolean, _keyLit: boolean): ChipVisualState {
  return 'idle';
}
