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

// Sketch 003's winning columns layout caps rows at 4 inside columns of at least 280px
// (the D-02 narrow-container clause); UI-SPEC's general cap of 6 is used instead by the
// wide iPhone panel in 04-04, where a full-width panel has room for more per row.
export const RAIL_COLUMN_MAX_PER_ROW = 4;

// Balanced-row formula (sketch 003 / progressions.md): split n chips across the fewest
// rows that keep every row at or under the cap, then divide as evenly as possible so no
// row is left mostly empty (7 -> 4+3, not 4+2+1 or a lone overflow row).
export function chipsPerRow(stepCount: number, maxPerRow: number): number {
  if (stepCount <= 0) return 0;
  const cap = Math.max(1, maxPerRow);
  const rows = Math.ceil(stepCount / cap);
  return Math.ceil(stepCount / rows);
}

// Steps the per-row cap down from maxPerRow until `fits` accepts a candidate, skipping a
// candidate identical to the one just rejected (lowering the cap further doesn't always
// change the balanced-row outcome, so re-asking the same question is wasted measurement
// work). Cap 1 is a floor that always fits some layout, so it returns without asking.
export function fitChipsPerRow(
  stepCount: number,
  maxPerRow: number,
  fits: (perRow: number) => boolean,
): number {
  if (stepCount <= 0) return 0;
  let cap = Math.max(1, maxPerRow);
  let lastRejected: number | null = null;
  while (cap > 1) {
    const candidate = chipsPerRow(stepCount, cap);
    if (candidate !== lastRejected) {
      if (fits(candidate)) return candidate;
      lastRejected = candidate;
    }
    cap -= 1;
  }
  return chipsPerRow(stepCount, 1);
}

export interface ChordLabelParts {
  readonly main: string;
  readonly bass: string;
}

// Splits at the first slash only, keeping the slash on the bass half — byte-identical to
// PianoLayout's chordName snippet, so a slash chord always breaks at the same point
// whether it's rendered on a pad or a rail chip.
export function splitChordLabel(label: string): ChordLabelParts {
  const slashIndex = label.indexOf('/');
  if (slashIndex === -1) return { main: label, bass: '' };
  return { main: label.slice(0, slashIndex), bass: label.slice(slashIndex) };
}

export function isNaturalKey(key: Key): boolean {
  return !key.includes('#');
}

export interface PageMemory<T> {
  readonly list: T;
  readonly index: number;
}

// D-13: the panel keeps its page across close/reopen while the bank is unchanged, and
// resets to 1 of N on any bank change (even back to the same bank) — comparing list
// identity with `===` (never structural equality) means a freshly-derived suggestions
// array (recreated on every bank change) always resets, while the same array reference
// (close/reopen with no bank change in between) keeps its index.
export function rememberedPage<T>(memory: PageMemory<T> | null, list: T): number {
  if (memory !== null && memory.list === list) return memory.index;
  return 0;
}

// Wraps with a positive modulo in both directions; count <= 0 (and thus count === 1,
// the "1 of 1" case) always returns 0, so a single suggestion's pager steps are inert.
export function stepPage(index: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return (((index + delta) % count) + count) % count;
}

// Sketch 002's viewport-width chip cap for the wide iPhone panel: 4 below 720px, 6 at
// and above (the panel is full-width, unlike the fixed-cap desktop/iPad columns).
export function panelMaxPerRow(viewportWidth: number): number {
  return viewportWidth < 720 ? 4 : 6;
}
