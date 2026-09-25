# Phase 4: Read-Only Suggestion Rail - Pattern Map

**Mapped:** 2026-09-25
**Files analyzed:** 8 (4 new components/modules, 2 extended existing files, 2 new/extended test files)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/App.svelte` (extend `press`/`release`) | service/orchestration (state owner in a `.svelte` file) | event-driven | `src/App.svelte` itself (existing `press`/`release`, lines 94-109) | exact — modify in place |
| `src/components/SuggestionChip.svelte` (new) | component | event-driven (pointer press/release) | `src/components/PianoLayout.svelte` (pad button + pointer-capture) | exact — same role, same data flow |
| `src/components/SuggestionRail.svelte` (new) | component | request-response (reads `getSuggestionsForBank`, renders) | `src/components/PianoLayout.svelte` (reads bank, renders grid, no local mutation) | role-match |
| `src/components/SuggestionPanel.svelte` (new) | component (nonmodal panel + pager) | event-driven (open/page/close) + request-response | `src/components/TopBar.svelte` (popover pattern: `openPopover` local `$state`, `<svelte:window onkeydown>` Escape, `aria-expanded`, backdrop-free variant) | role-match |
| `src/components/TopBar.svelte` (extend: `sugg` grid area) | component | request-response | `src/components/TopBar.svelte` itself (existing `@media` breakpoint blocks, lines 1034-1065) | exact — modify in place |
| `src/suggestions.ts` (extend: D-17 max-6 validator issue) | utility/validator (data module) | batch/transform (validate-at-import) | `src/suggestions.ts` itself (existing `duplicate-id`/`duplicate-sequence` grouping loop, lines 291-329) | exact — modify in place |
| `src/rail.ts` (new) | utility (pure helpers) | transform | `src/suggestions.ts` (pure exported functions, no runes, no DOM) | role-match |
| `test/rail.test.ts` (new) | test | batch | `test/suggestions.test.ts` (Vitest, `describe`/`it`, fixture builder function) | exact |
| `test/suggestions.test.ts` (extend: D-17 cases) | test | batch | `test/suggestions.test.ts` itself (existing `duplicate-sequence` test block) | exact — modify in place |

## Pattern Assignments

### `src/App.svelte` — hold-count layer in `press`/`release` (App-level orchestration, event-driven)

**Analog:** `src/App.svelte` itself — this is a targeted edit to existing functions, not a new file.

**Current code to replace** (`src/App.svelte:74-109`, read this session):
```ts
let heldKeys = $state<Set<Key>>(new Set());
let latchedKey = $state<Key | null>(null);

function press(key: Key, notes: number[]): void {
  host.padPressed(key, notes);
  heldKeys = new Set(heldKeys).add(key);
  if (ui.latch) latchedKey = key;
}
function release(key: Key): void {
  host.padReleased(key);
  const next = new Set(heldKeys);
  next.delete(key);
  heldKeys = next;
  if (ui.latch) latchedKey = key;
}
```

**Why this is the core new piece (D-04):** `heldKeys`/`host.heldPads` are `Set<Key>`, not ref-counted. Once `SuggestionChip` presses call the same `press`/`release` a pad does, two independent sources can hold the same key — the current unconditional `host.padPressed`/`padReleased` calls would let a second source's release silence a key the first source still holds. RESEARCH.md Pattern 1 (lines 164-217) has the exact recommended shape: a `Map<Key, number>` hold-count gate in front of the existing `host.padPressed`/`padReleased` calls, firing only on the 0→1 / 1→0 transition. This is a **recommendation to confirm at plan time**, not copy-paste-final — but it is the only correct place for the fix (`App.svelte`, beside the existing `heldKeys` owner — never inside `EngineHost`, which stays untouched per `REQUIREMENTS.md` Out of Scope).

**displayKeys derivation (unchanged, reuse verbatim)** (`src/App.svelte:86-92`):
```ts
const displayKeys = $derived.by(() => {
  if (latchedKey === null) return heldKeys;
  const out = new Set(heldKeys);
  out.add(latchedKey);
  return out;
});
```
This is D-06's echo source — pass straight through to `SuggestionRail`/`SuggestionPanel`/`SuggestionChip` as a prop, exactly as it's already passed to `<PianoLayout heldKeys={displayKeys} />` (`App.svelte:215`).

**Mount point** (`src/App.svelte:213-226`, existing `<main>` markup):
```svelte
<main>
  <TopBar />
  <PianoLayout onPress={press} onRelease={release} heldKeys={displayKeys} />
  <!-- SuggestionRail mounts here, desktop/iPad only, per D-09 -->
  <footer>...</footer>
</main>
```
`SuggestionRail` takes the same `onPress={press} onRelease={release} heldKeys={displayKeys}` props `PianoLayout` already receives — D-03's "same path as its pad" is literally passing the same three props.

---

### `src/components/SuggestionChip.svelte` (new component, event-driven)

**Analog:** `src/components/PianoLayout.svelte` — pointer-capture press model (full file read this session).

**Imports pattern** (`PianoLayout.svelte:1-11`):
```ts
import { getBank, labelFor, type Key } from '../banks';
import { ui } from '../state.svelte';

interface Props {
  onPress: (key: Key, notes: number[]) => void;
  onRelease: (key: Key) => void;
  heldKeys: Set<Key>;
}
let { onPress, onRelease, heldKeys }: Props = $props();
```
Chip props should follow this exact shape (`onPress`/`onRelease`/`heldKeys` names), plus a `step: ResolvedSuggestionStep` (or `key`/`notes`/`displayLabel` individually) and `naturalKey: boolean` for the cream-outline hint.

**Core pointer-capture pattern — copy near-verbatim** (`PianoLayout.svelte:40-65`):
```ts
// Pointer-leave/mouseup race left notes hanging (UAT test 4): a press could end via
// pointerup, pointercancel (touch/gesture interruption), or lostpointercapture (OS
// yanks capture mid-press) — pointerup intermittently never arrived. We track the
// captured pointerId per pad and route every end-path through one idempotent release
// so the note-off always fires exactly once (a second end for the same pointer no-ops).
const captured = new Map<Key, number>();

function handlePointerDown(e: PointerEvent, k: Key) {
  const c = chordFor(k);
  if (!c) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  captured.set(k, e.pointerId);
  e.preventDefault();
  onPress(k, c.notes);
}
function endPress(e: PointerEvent, k: Key) {
  if (captured.get(k) !== e.pointerId) return;
  captured.delete(k);
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  if (target.hasPointerCapture?.(e.pointerId)) {
    target.releasePointerCapture(e.pointerId);
  }
  onRelease(k);
}
```
A **single chip only holds one key**, so this can collapse to a scalar `capturedPointerId: number | null` instead of a `Map<Key, number>` — RESEARCH.md Pattern 2 (lines 219-277) already shows the collapsed shape:
```ts
let heldLocally = $state(false);
let capturedPointerId: number | null = null;

function onPointerDown(e: PointerEvent) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  capturedPointerId = e.pointerId;
  heldLocally = true;
  e.preventDefault();
  onPress(step.key, notes);
}
function endPress(e: PointerEvent) {
  if (capturedPointerId !== e.pointerId) return;
  capturedPointerId = null;
  heldLocally = false;
  e.preventDefault();
  onRelease(step.key);
}
```

**Markup pattern (button element, event wiring)** (`PianoLayout.svelte:78-91`):
```svelte
<button
  class="pad black"
  class:held={heldKeys.has(key)}
  onpointerdown={(e) => handlePointerDown(e, key)}
  onpointerup={(e) => endPress(e, key)}
  onpointercancel={(e) => endPress(e, key)}
  onlostpointercapture={(e) => endPress(e, key)}
  oncontextmenu={(e) => e.preventDefault()}
>
  <span class="key">{key}</span>
  <span class="name">{#if c}{@render chordName(labelFor(bank, c))}{/if}</span>
</button>
```
Chip markup mirrors this exactly (`button`, same 4 pointer event handlers, `oncontextmenu` guard) — this is also the answer to CONTEXT.md's discretion item "chip element semantics, focus, a11y: match pads."

**Slash-chord line-break snippet — copy verbatim** (`PianoLayout.svelte:68-73`):
```svelte
{#snippet chordName(label: string)}
  {@const parts = label.split('/')}
  <span class="cname-main">{parts[0]}</span>{#if parts.length > 1}<span class="cname-bass">/{parts.slice(1).join('/')}</span>{/if}
{/snippet}
```
Reuse for chip chord-name rendering (`step.displayLabel`, never `step.chordName` — see Pitfall 1 below). RAIL-06's "slash chords break only before the bass" is byte-for-byte this pattern.

**D-07 unmount-triggered forced release (new — no direct precedent in `PianoLayout`, since pads never unmount mid-hold):**
```ts
import { onMount } from 'svelte';
// D-07: a chip that unmounts while held must release its key immediately and
// idempotently (bank change, iPhone panel close, paging away all remove this
// chip from the DOM without a pointerup ever firing).
onMount(() => () => {
  if (heldLocally) {
    heldLocally = false;
    onRelease(step.key);
  }
});
```
[CITED: Context7 `/sveltejs/svelte` — `onMount`'s returned function runs on unmount] Same `onMount(() => cleanupFn)` idiom already used in `App.svelte` (e.g. lines 49-68, 195-209) for MIDI subscriptions and window listeners — establishes this as the project's idiom, not a new one.

**Echo derivation (D-05/D-06), precedence order per UI-SPEC Interaction State Reference:**
```ts
const isEcho = $derived(!heldLocally && heldKeys.has(step.key));
```
Held (`heldLocally`) always wins over echo on the same chip — never derive "held" purely from the shared set (see Pitfall 3).

---

### `src/components/SuggestionRail.svelte` (new, desktop/iPad, request-response)

**Analog:** `src/components/PianoLayout.svelte` (reads bank-derived data, renders a grid, no local mutable state beyond pointer capture) + `src/suggestions.ts` (data source).

**Data read pattern** (`src/suggestions.ts`, existing, unchanged):
```ts
import { getSuggestionsForBank } from '../suggestions';
import { ui } from '../state.svelte';
const suggestions = $derived(getSuggestionsForBank(ui.bankIndex));
```
Bank-reactive derivation mirrors `PianoLayout.svelte:13`: `const bank = $derived(getBank(ui.bankIndex));`

**Empty-state check (RAIL-01, D-15) — copy verbatim from RESEARCH.md Code Examples:**
```svelte
{#if suggestions.length === 0}
  <p class="empty">No curated suggestions for this bank yet</p>
{:else}
  <!-- render columns -->
{/if}
```
Copy is locked verbatim (UI-SPEC Copywriting Contract) — do not paraphrase.

**Balanced-row math — new pure helper, extract to `src/rail.ts`** (RESEARCH.md Pattern 3, sourced from `.claude/skills/sketch-findings-jay-6/references/progressions.md:66-67`):
```ts
// src/rail.ts
export function chipsPerRow(n: number, maxPerRow = 6): number {
  if (n <= 0) return 0;
  const rows = Math.ceil(n / maxPerRow);
  return Math.ceil(n / rows);
}
```
Bind via `style:--per={chipsPerRow(chips.length)}` feeding `grid-template-columns: repeat(var(--per), minmax(min-content, max-content))` (UI-SPEC Layout Reference).

**Grid CSS (UI-SPEC-locked values, D-09):**
```css
.rail { /* wraps <section aria-label="Suggestions"> */ }
.cols {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0 16px; /* column-gap 16px (md), row-gap 0 */
}
.chips {
  display: grid;
  grid-template-columns: repeat(var(--per), minmax(min-content, max-content));
  gap: 8px; /* sm */
  justify-content: start;
}
```

---

### `src/components/SuggestionPanel.svelte` (new, iPhone landscape, event-driven + request-response)

**Analog:** `src/components/TopBar.svelte` — popover open/close state machine, `<svelte:window onkeydown>` Escape pattern, `aria-expanded`.

**Local open/page state pattern** (`TopBar.svelte:39-47`):
```ts
type Popover = 'setup' | 'bank' | 'style' | 'variation';
let openPopover = $state<Popover | null>(null);
const isOpen = (p: Popover) => openPopover === p;
function toggle(p: Popover): void {
  openPopover = openPopover === p ? null : p;
}
function closeAll(): void {
  openPopover = null;
}
```
Adapt to a boolean `open` + `page` pair (D-13 page memory): `let open = $state(false); let page = $state(1);` — reset `page` to `1` only on bank change (`$effect` watching `ui.bankIndex`), not on close (panel page memory persists across close/reopen while bank is unchanged).

**Escape-to-close pattern — copy near-verbatim** (`TopBar.svelte:120-125`):
```ts
function closeOnEscape(event: KeyboardEvent): void {
  if (openPopover !== null && event.key === 'Escape') closeAll();
}
```
```svelte
<svelte:window onkeydown={closeOnEscape} />
```
This is the answer to CONTEXT.md's discretion item "Escape handling integration with the existing window `keydown` listener" — `TopBar.svelte` already owns its own **component-local** `<svelte:window onkeydown>` binding, completely independent of `App.svelte`'s separate manual `addEventListener('keydown', onKeyDown)` for pad/transport shortcuts. `SuggestionPanel.svelte` should do the same (its own `<svelte:window onkeydown={closeOnEscape}>`), not thread into `App.svelte`'s listener — the two listeners already coexist without conflict in this codebase (`App.svelte`'s `isEditableOrControlTarget` guard skips app shortcuts when a `button`/`[role=button]` is focused, so the panel's own buttons don't double-fire pad shortcuts).

**No-backdrop-dismissal (D-12) — deviates from `TopBar.svelte`'s popover pattern:** `TopBar.svelte:128-130` renders a `<button class="backdrop" onclick={closeAll}>` for click-outside dismissal. **Do not copy this for `SuggestionPanel`** — D-12 explicitly locks "no backdrop dismissal," close only via × / strip / Escape. This is a deliberate divergence from the closest analog — flag in the plan so the executor doesn't reflexively add a backdrop.

**`aria-expanded` pattern** (`TopBar.svelte:137-138`):
```svelte
<button type="button" class="status-pill" class:open={isOpen('setup')} aria-expanded={isOpen('setup')} onclick={() => toggle('setup')}>
```
Maps directly to the strip button: `aria-expanded={open}` (UI-SPEC Copywriting Contract locks this attribute name verbatim).

**iPhone panel chips reuse `SuggestionChip.svelte`** (D-14) — same component as `SuggestionRail`, one suggestion (`steps` array) rendered per page via the pager (`‹ {page} of {suggestions.length} ›`).

---

### `src/components/TopBar.svelte` (extend: new `sugg` grid area, height-gated breakpoint)

**Analog:** `TopBar.svelte` itself — existing `@media (max-width: 900px)` breakpoint block.

**Existing breakpoint to extend from, not fold into** (`TopBar.svelte:1032-1049`, verified this session — grep confirmed exactly 3 `@media` rules at lines 1019, 1034, 1066, none height-gated):
```css
@media (max-width: 900px) {
  .topbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'pill pill transpose'
      'bank style latch';
    gap: var(--space-2);
    padding: 12px;
  }
  .pill-zone { grid-area: pill; }
  .bank-zone { grid-area: bank; }
  .style-zone { grid-area: style; }
  .transpose-zone { grid-area: transpose; }
  .latch { grid-area: latch; }
}
```
**New rule (recommended shape, not yet written — plan/executor decision on exact media condition):**
```css
/* iPhone landscape: 'pill' no longer spans two columns — 'sugg' takes the second slot.
   Height-gated (not width), matching PianoLayout.svelte's own iPhone-landscape detection,
   since iPhone-landscape widths (~650-930px) straddle the 900px width rule in both
   directions (see 04-RESEARCH.md Pattern 4 / Open Question 1). */
@media (max-height: 480px) {
  .topbar {
    grid-template-areas:
      'pill sugg transpose'
      'bank style latch';
  }
  .sugg-zone { grid-area: sugg; }
}
```
RESEARCH.md's own recommendation (Open Question 1): bare `max-height: 480px` (matching `PianoLayout.svelte:241`, the closer analog since both are pure layout-shape changes) rather than combined with `pointer: coarse` (matching `App.svelte`'s scroll-lock, a different concern). Planner should lock this explicitly.

**Strip zone markup pattern** (mirrors `pill-zone`/`transpose-zone` structure, `TopBar.svelte:133`, `401`):
```svelte
<div class="zone pill-zone">...</div>
<div class="zone sugg-zone"><!-- new strip button --></div>
<div class="zone transpose-zone">...</div>
```

---

### `src/suggestions.ts` (extend: D-17 max-6-per-bank validator issue)

**Analog:** `src/suggestions.ts` itself — existing `duplicate-id`/`duplicate-sequence` per-entry grouping loop.

**Add new issue code to the existing union** (`src/suggestions.ts:16-28`):
```ts
export type CatalogueIssueCode =
  | 'top-level-array'
  | 'entry-object'
  | 'missing-field'
  | 'unexpected-field'
  | 'invalid-id'
  | 'invalid-bank-index'
  | 'invalid-label'
  | 'invalid-kind'
  | 'invalid-steps'
  | 'invalid-step'
  | 'duplicate-id'
  | 'duplicate-sequence'
  | 'too-many-suggestions'; // NEW — D-17, placeholder name per RESEARCH.md A4
```

**Grouping-loop pattern to copy exactly** (`src/suggestions.ts:291-329`, existing `duplicate-id`/`duplicate-sequence` logic):
```ts
const firstIdPath = new Map<string, string>();
const firstSequencePath = new Map<string, string>();

for (const entry of validEntries) {
  const { sourceIndex, value } = entry;
  const idPath = `$[${sourceIndex}].id`;
  const stepsPath = `$[${sourceIndex}].steps`;
  const relatedIdPath = firstIdPath.get(value.id);
  // ... duplicate-id / duplicate-sequence issue pushes ...
}
```
D-17's per-bank count check is structurally identical: group `validEntries` by `bankIndex`, and for the 7th+ entry per bank (in catalogue/source order, matching the `duplicate-*` precedent's "one issue per offending entry"), push:
```ts
{
  code: 'too-many-suggestions',
  path: `$[${sourceIndex}].bankIndex`, // or entry-level path — planner's call
  entryId: value.id,
  bankIndex: value.bankIndex,
  value: countSoFarForThisBank,
  expected: 'at most 6 suggestions per bank',
  relatedPath: /* path of the 6th (boundary) entry for this bank, mirroring relatedPath's existing role */,
}
```
Boundary case: exactly 6 = valid, 7 = invalid (explicit in RESEARCH.md Wave 0 Gaps).

**Error-throw wiring (unchanged, already generic)** (`src/suggestions.ts:353-360`):
```ts
const importedSuggestions: unknown = suggestionsJson;
const validationResult = validateSuggestionCatalogue(importedSuggestions);
if (!validationResult.ok) {
  throw new Error(
    `Invalid suggestion catalogue:\n${validationResult.issues.map(formatCatalogueIssue).join('\n')}`,
  );
}
```
No changes needed here — the new issue code flows through `formatCatalogueIssue` (lines 341-351) automatically, since that formatter is generic over `CatalogueIssue`.

---

### `src/rail.ts` (new, pure helpers module)

**Analog:** `src/suggestions.ts`'s exported pure functions (no runes, no DOM, plain `.ts`) — same "runes are component-file only" convention noted in `CONVENTIONS.md` and RESEARCH.md's Anti-Patterns section.

**Shape (both functions are new logic, no direct precedent — illustrative per RESEARCH.md, confirm final shape at plan time):**
```ts
// src/rail.ts
export function chipsPerRow(n: number, maxPerRow = 6): number {
  if (n <= 0) return 0;
  const rows = Math.ceil(n / maxPerRow);
  return Math.ceil(n / rows);
}

// Hold-count reducer, if extracted out of App.svelte for unit coverage (RESEARCH.md
// recommends extracting this pure transition logic so it's Vitest-testable — App.svelte
// itself cannot be unit-tested per this project's Svelte-mounting exclusion).
export function nextHoldCount(current: number, delta: 1 | -1): number {
  return Math.max(0, current + delta);
}
```

---

### `test/rail.test.ts` (new)

**Analog:** `test/suggestions.test.ts` — Vitest `describe`/`it`, fixture-builder function pattern.

**Structure to copy** (`test/suggestions.test.ts:1-22`):
```ts
import { describe, expect, it } from 'vitest';
import { chipsPerRow } from '../src/rail';

describe('chipsPerRow', () => {
  it('keeps everything on one row at or under the cap', () => {
    expect(chipsPerRow(1)).toBe(1);
    expect(chipsPerRow(6)).toBe(6);
  });
  it('balances rows evenly past the cap (7 -> 4+3, 8 -> 4+4)', () => {
    expect(chipsPerRow(7)).toBe(4);
    expect(chipsPerRow(8)).toBe(4);
  });
});
```
Also add hold-count transition tests (RAIL-03) and, if `isEcho` logic is extracted as a pure function, echo-derivation tests (RAIL-04) — per RESEARCH.md's Phase Requirements → Test Map.

### `test/suggestions.test.ts` (extend: D-17 boundary cases)

**Analog:** the existing `duplicate-sequence` test block in the same file — same `it.each`/fixture-array style already used for `rejects non-array top-level input %j` (`test/suggestions.test.ts:98-113`).

```ts
it('accepts exactly 6 suggestions per bank but rejects the 7th', () => {
  const sixValid = Array.from({ length: 6 }, (_, i) => validEntry({ id: `fixture-${i}`, steps: ['C', 'D'] }));
  expect(validateSuggestionCatalogue(sixValid)).toMatchObject({ ok: true });

  const seven = [...sixValid, validEntry({ id: 'fixture-7', steps: ['E', 'F'] })];
  const result = validateSuggestionCatalogue(seven);
  expect(result.ok).toBe(false);
  // assert 'too-many-suggestions' issue present, boundary at exactly 6
});
```

## Shared Patterns

### Pointer-capture press/release (idempotent, multi-end-path safe)
**Source:** `src/components/PianoLayout.svelte:45-65`
**Apply to:** `SuggestionChip.svelte` (every chip instance)
```ts
const captured = new Map<Key, number>(); // or scalar capturedPointerId for single-key chips
function handlePointerDown(e: PointerEvent, k: Key) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  captured.set(k, e.pointerId);
  e.preventDefault();
  onPress(k, notes);
}
function endPress(e: PointerEvent, k: Key) {
  if (captured.get(k) !== e.pointerId) return; // idempotent
  captured.delete(k);
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
  onRelease(k);
}
```
Wire to all four end-paths: `onpointerup`, `onpointercancel`, `onlostpointercapture`, plus `oncontextmenu={(e) => e.preventDefault()}`.

### Hold-count gate (D-04, the phase's one genuinely new pattern)
**Source:** RESEARCH.md Pattern 1 (recommendation, not yet in codebase) — lands in `src/App.svelte`
**Apply to:** `App.svelte`'s `press`/`release`, which every source (pad, keyboard, chip) already funnels through
```ts
let holdCounts = new Map<Key, number>();
function press(key: Key, notes: number[]): void {
  const next = (holdCounts.get(key) ?? 0) + 1;
  holdCounts.set(key, next);
  if (next === 1) host.padPressed(key, notes); // only the 0->1 transition reaches host
  heldKeys = new Set(heldKeys).add(key);
  if (ui.latch) latchedKey = key;
}
function release(key: Key): void {
  const next = Math.max(0, (holdCounts.get(key) ?? 0) - 1);
  if (next === 0) {
    holdCounts.delete(key);
    host.padReleased(key);
    const nextHeld = new Set(heldKeys);
    nextHeld.delete(key);
    heldKeys = nextHeld;
  } else {
    holdCounts.set(key, next);
  }
  if (ui.latch) latchedKey = key;
}
```

### `onMount(() => cleanupFn)` teardown idiom
**Source:** `src/App.svelte:49-68`, `195-209` (MIDI subscription cleanup, window-listener cleanup)
**Apply to:** `SuggestionChip.svelte`'s D-07 unmount-triggered forced release; any other rail component needing unmount cleanup
```ts
onMount(() => {
  // setup
  return () => {
    // teardown — Svelte 5 confirms this runs on unmount [CITED: Context7 /sveltejs/svelte]
  };
});
```

### `displayLabel` over `chordName` (fallback-safe chord text)
**Source:** `src/suggestions.ts` (`ResolvedSuggestionStep.displayLabel`, already applies `labelFor()` fallback) + `src/banks.ts` (`labelFor`)
**Apply to:** Every chip render — never render `step.chordName` directly (empty string for unnamed stack-bank pads, e.g. Oct Stack bank 14)
```ts
// Chip template:
{@render chordName(step.displayLabel)} // NOT step.chordName
```

### Slash-chord line-break snippet
**Source:** `src/components/PianoLayout.svelte:68-73, 181-188` (Svelte `{#snippet}` + CSS `white-space: nowrap` on both halves)
**Apply to:** `SuggestionChip.svelte` chord-name rendering (RAIL-06)
```svelte
{#snippet chordName(label: string)}
  {@const parts = label.split('/')}
  <span class="cname-main">{parts[0]}</span>{#if parts.length > 1}<span class="cname-bass">/{parts.slice(1).join('/')}</span>{/if}
{/snippet}
```
```css
.cname-main, .cname-bass { white-space: nowrap; }
.cname-bass { opacity: 0.72; }
```

### Component-local `<svelte:window onkeydown>` for Escape (scoped, non-conflicting with App's global listener)
**Source:** `src/components/TopBar.svelte:120-125`
**Apply to:** `SuggestionPanel.svelte` (D-12 Escape-to-close)
```ts
function closeOnEscape(event: KeyboardEvent): void {
  if (open && event.key === 'Escape') close();
}
```
```svelte
<svelte:window onkeydown={closeOnEscape} />
```

### CSS design tokens (verbatim, no new tokens introduced)
**Source:** `src/styles/tokens.css` (full file read this session)
**Apply to:** All new rail components
```css
--bg-0 #0e0e0e; --bg-1 #171717; --bg-2 #1f1f1f; --bg-3 #2a2a2a; --bg-4 #3a3a3a;
--fg-0 #eeeeee; --fg-1 #b8b8b8; --fg-2 #7a7a7a; --fg-3 #555555;
--accent #ff7a1a; --accent-soft rgba(255,122,26,.18);
--system oklch(0.68 0.045 250); --system-soft oklch(0.42 0.04 250 / .35);
--cream #f4f1ea;
--t-eyebrow 11px; --t-body 14px;
--space-1 4px; --space-2 8px; --space-4 16px;
--mono "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```
Held-chip glow reuses the pad's exact treatment (`PianoLayout.svelte:206-214`, `.pad.held`):
```css
background: var(--accent) !important;
color: var(--bg-0) !important;
box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 0 24px 4px rgba(255,122,26,.45);
border-color: var(--accent);
```
(UI-SPEC's chip-held glow is a lighter `0 0 14px 2px rgb(255 122 26 / .4)` — chip and pad glows are visually distinct by design, don't copy the pad's exact shadow value, just the pattern shape.)

## No Analog Found

None. Every new file has a direct or role-matched analog in the existing codebase — this phase is explicitly "new composition of already-proven patterns" per RESEARCH.md's own summary, not new architecture. The one piece of genuinely new logic (the hold-count gate) has no *precedent* in this codebase (nothing before this phase let two independent sources hold the same key) but does have a fully-specified recommended shape in RESEARCH.md Pattern 1, cross-referenced above.

## Metadata

**Analog search scope:** `src/`, `src/components/`, `test/`, `src/styles/` — full read of `App.svelte`, `PianoLayout.svelte`, `TopBar.svelte` (targeted sections), `suggestions.ts`, `state.svelte.ts`, `suggestions.test.ts` (targeted), `tokens.css`.
**Files scanned:** 8 source files + 1 test file, all git-tracked (verified via `git ls-files`).
**Pattern extraction date:** 2026-09-25
