# Phase 4: Read-Only Suggestion Rail - Research

**Researched:** 2026-09-25
**Domain:** Svelte 5 UI (playable chip rail) over an existing pad press/release pipeline; no new external dependencies
**Confidence:** HIGH

## Summary

Phase 4 has no new-library research surface — every dependency (Svelte 5 runes, Vite 6, Vitest 2, WEBMIDI.js) is already installed and locked from Phase 2/2.1/3. The real research work was tracing the exact press/release/highlight pipeline in `App.svelte`, `PianoLayout.svelte`, and `EngineHost` (`src/engines/host.ts`) to find the precise seam a chip must alias, and confirming what does — and does not — already exist for the two new UI surfaces (desktop/iPad inline rail, iPhone-landscape strip + panel).

**The one architectural problem this phase must actually solve:** `heldKeys`/`host.heldPads` are `Set<Key>`, not ref-counted. A chip press reuses the *same* `press`/`release` functions as pad presses and keyboard presses. If a pad and its aliasing chip are held for the same key at once (RAIL-08's explicit test case), releasing either one today would delete the key from `heldKeys` and call `host.padReleased`, silencing/un-highlighting a key the *other* source still holds — the exact hang/desync class this codebase has fought before (UAT tests 4, 6, 16, 20 in `TESTING.md`). This is not a hypothetical: `04-CONTEXT.md`'s "Claude's Discretion" section already names "chip + pad" and "keyboard + mouse" as the same class of problem, and confirms the *same key held twice from any two sources* is currently unguarded. The fix must live in `App.svelte`'s `press`/`release` wrapper (a small per-key hold-count map), not in `EngineHost` — touching `EngineHost`'s Set-based model is the explicitly out-of-scope "host-owned play/latch architecture refactor" (`REQUIREMENTS.md` Out of Scope table).

The second architectural problem: chip "held = full orange" (D-03) is **per chip DOM instance**, not per key — the same key can appear in multiple suggestion chips at once, and only the one instance actually under the pointer gets full orange; every other instance (plus the paired pad) gets soft echo. This must be local component state on the chip (mirroring `PianoLayout`'s per-pad `captured` map pattern), derived against the shared `displayKeys` set for echo.

**Primary recommendation:** Build the rail as pure presentation + a thin App-level hold-count layer, reusing `getSuggestionsForBank()`/`displayLabel` verbatim from Phase 3, and extract the two genuinely-testable pieces of new logic (balanced chip-per-row math, hold-count transitions) into a plain `.ts` module so they get real Vitest coverage — this project's testing convention explicitly excludes Svelte component mounting, so anything left inside `.svelte` files is UAT-only.

## Architectural Responsibility Map

Jay-6 is a single-tier browser app (Vite-bundled Svelte, no server, no persistence) — the generic multi-tier table collapses to one real tier plus its internal layering. Mapped at that granularity:

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Suggestion catalogue lookup + chord-name resolution (`getSuggestionsForBank`) | Browser/Client — data module | — | Bundled at build time (`suggestions.data.json` import), in-memory, already shipped in Phase 3 |
| Catalogue >6-per-bank validation (D-17) | Browser/Client — data module (`suggestions.ts` validator) | — | Extends the existing build/import-time `validateSuggestionCatalogue` trust boundary; no new tier |
| Rail rendering (chips, columns, eyebrow, empty state) | Browser/Client — Svelte component | — | Pure presentational, reads `getSuggestionsForBank(ui.bankIndex)` |
| iPhone strip + nonmodal panel | Browser/Client — Svelte component (mounts inside `TopBar.svelte`) | — | Extends existing `TopBar` per-breakpoint `grid-template-areas` pattern |
| Chip press/release → pad alias, hold-count safety (D-04) | Browser/Client — `App.svelte` state orchestration | — | Must sit beside the existing `press`/`release`/`heldKeys` owner; cannot live in a leaf component |
| Soft echo (D-05/D-06) | Browser/Client — Svelte component (derived from `displayKeys` prop) | — | Pure derivation, no new state owner needed |
| MIDI emission on chip press | Browser/Client — `EngineHost` + WEBMIDI.js | — | Unchanged; chip never talks to `EngineHost` directly, only through `App.svelte`'s existing `press`/`release` |

## User Constraints (from CONTEXT.md)

### Locked Decisions

Full text preserved in `.planning/phases/04-read-only-suggestion-rail/04-CONTEXT.md` §Implementation Decisions (D-01 through D-17). Summarized for planning:

- **D-01** Label-led chip-group header; `progression`/`movement` = quiet steel metadata, never a badge.
- **D-02** Balanced no-scroll chip wrapping, ≤6/row, never truncate; slash chords break only before the bass.
- **D-03** Chip press/release = same path as its pad (`App.press`/`release` → `host.padPressed`/`padReleased`). Pressed chip = full orange + its pad lights. Only the pressed chip gets full orange; echo never overrides it.
- **D-04** Per-key hold safety: releasing a chip never silences a pad still held, and vice versa (see Summary — this is the phase's core plumbing problem).
- **D-05** Soft echo both ways: every *other* chip whose key is lit echoes.
- **D-06** Echo follows `displayKeys` (includes a latched-but-released key).
- **D-07** A held chip that unmounts releases its key immediately, idempotently (bank change, iPhone panel close, paging away). Chips do NOT persist across bank change like pads do — deliberate simplicity/no-hang tradeoff.
- **D-08** Browsing is silent: open/page/close/bank-driven re-render emit no MIDI, touch no latch/engine/transport/clock (D-07's forced release is the only exception).
- **D-09** Desktop/iPad: inline columns under pads, `SUGGESTIONS · N` eyebrow, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` → 3 across at iPad landscape.
- **D-10** iPhone: `Suggestions · N` strip in TopBar's empty middle slot, `grid-template-areas: 'pill sugg transpose' 'bank style latch'` at `max-height: 480px`, 44px tall, zero added height.
- **D-11** Open → nonmodal panel anchored over the top bar only; max-height = space above the pads; never covers a pad.
- **D-12** One suggestion at a time in the panel: label + kind, `‹ 1 of N ›`, ×. Close via × / strip / Escape only — no backdrop dismissal. Bank/style/latch hidden while open (accepted tradeoff).
- **D-13** Panel page memory: keep current page across close/reopen while bank unchanged; bank change resets to `1 of N`.
- **D-14** One chip component everywhere (desktop/iPad columns and iPhone panel) — playable, soft echo, no read-only variant.
- **D-15** Empty bank: quiet muted line `No curated suggestions for this bank yet`, `--fg-2`, 13px desktop/iPad / 12px iPhone-centred. No count/button/icon/orange.
- **D-16** Max 6 suggestions/bank accepted Phase 4 limitation (iPad body-scroll lock means anything below the fold is unreachable).
- **D-17** Catalogue validator rejects banks with >6 suggestions, new issue code in the Phase 3 staged/deterministic/actionable diagnostic style; invalid catalogue fails loudly in tests and the build.

### Claude's Discretion

- **Same key pressed twice** (chip + pad, or keyboard + mouse): simplest implementation that satisfies the hard invariant (never a hanging note/stuck latch/stuck lit pad-chip). Candidates named in CONTEXT.md: per-key hold count in `App` (host sees first press + last release, second press = no-op); or retrigger. Flo: "shouldn't behave as a bug, but how it behaves, I don't care too much." Note: `host.padPressed` today re-runs `engine.start` + transport `start` on a re-press of an already-held key.
- Chip element semantics, focus, a11y: match pads (`button`, `pointerdown` `preventDefault` so focus never steals computer-keyboard pad shortcuts).
- Component decomposition; where rail state lives (`state.svelte.ts` vs component-local); exact breakpoints beyond sketch values.
- Escape handling integration with the existing window `keydown` listener.

### Deferred Ideas (OUT OF SCOPE)

- More than 6 suggestions per bank — `todos/pending/2026-09-25-suggestion-rail-more-than-six-per-bank.md`.
- Showing bank/style/latch while the iPhone panel is open — accepted tradeoff for now.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RAIL-01 | Selecting a bank shows curated suggestions or honest empty state | `getSuggestionsForBank(ui.bankIndex)` returns `[]` cleanly for banks with no entries (Phase 3, verified); empty-state copy is D-15/locked in UI-SPEC |
| RAIL-02 | Every chip shows pad key + canonical chord name, with fallback for unnamed stack-bank pads | `ResolvedSuggestionStep.displayLabel` already applies `labelFor()` fallback (`"${key} ${bankName}"` for empty `chord.name`, e.g. Oct Stack) — chips MUST render `displayLabel`, not raw `chordName` (see Common Pitfalls) |
| RAIL-03 | Browse (open/page/close) triggers no MIDI/state change; chip press = pad's press/release path | `App.svelte`'s `press`/`release` functions are the alias target; hold-count layer (this doc's core finding) required for correctness under concurrent chip+pad hold |
| RAIL-04 | Read-only rail, chips may soft-echo held keys | D-05/D-06; derive from existing `displayKeys` prop, no new global state needed for echo itself |
| RAIL-05 | Rail subordinate to pads on desktop; contained mobile treatment | D-09 (inline columns below `<PianoLayout>`) / D-10-D-13 (iPhone strip+panel); both already spec'd in `04-UI-SPEC.md` |
| RAIL-06 | Usable with long/altered/slash/repeated/unnamed labels | D-02 balanced wrapping + slash-break pattern already proven in `PianoLayout.svelte`'s `chordName` snippet — reuse verbatim |
| RAIL-07 | Browser verification: rail, empty state, desktop/iPad/iPhone-landscape | No Playwright/jsdom in this repo's test stack (`vite.config.ts` test env is `node`) — verification is manual or Playwright-MCP-assisted, not Vitest; see Validation Architecture |
| RAIL-08 | OP-1/MIDI-monitor verification: silent browsing, exact chip=pad MIDI, chip+pad held together releases correctly, core loop intact | Directly exercises the hold-count fix; manual hardware UAT, no automated equivalent possible (Web MIDI is browser-only, excluded from Vitest per `TESTING.md`) |

</phase_requirements>

## Standard Stack

No new libraries this phase. Everything below is already installed (`package.json`, read this session) — confirm via `npm ls <pkg>` before planning if drift is suspected, but no `npm install` step is expected in this phase's plan.

### Core (existing, reused)
| Library | Version (package.json) | Purpose | Why Standard |
|---------|-------------------------|---------|---------------|
| svelte | `^5.0.0` | Component framework, runes (`$state`, `$derived`, `$effect`) | Already the whole app; rail is more Svelte components, same runes idioms |
| vite | `^6.0.0` | Build/dev server | Unchanged |
| vitest | `^2.1.0` | Unit tests for pure logic | `environment: 'node'` per `vite.config.ts` — no DOM, confirmed below |
| webmidi | `^3.1.12` | MIDI I/O | Unchanged; chip never touches this directly (goes through `EngineHost`) |
| typescript | `^5.6.0` | Strict typing | Unchanged |

**No installation step required.** [VERIFIED: package.json, read this session]

## Package Legitimacy Audit

**Not applicable.** This phase introduces zero new npm packages — it is entirely new Svelte components plus small additions to two existing `.ts` modules (`src/suggestions.ts` for D-17, a new pure helper module for hold-count/row-math). No `npm install` occurs; the Package Legitimacy Gate is skipped per its own trigger condition ("every phase that installs external packages").

## Architecture Patterns

### System Architecture Diagram

```mermaid
flowchart LR
    subgraph data["📦 Phase 3 data (unchanged)"]
        J["suggestions.data.json"] --> V["validateSuggestionCatalogue()<br/>+ D-17 max-6 check"]
        V --> G["getSuggestionsForBank(bankIndex)"]
    end

    subgraph rail["🧩 New Phase 4 UI"]
        G --> RC["Rail / Panel component<br/>(open, page — component-local $state)"]
        RC --> CH["Chip instance<br/>(local heldLocally $state)"]
    end

    subgraph orchestration["🎛️ App.svelte (extended, not replaced)"]
        HC["hold-count map<br/>Map&lt;Key, number&gt;<br/>NEW — the D-04 fix"]
        PR["press(key, notes) / release(key)"]
        HK["heldKeys (Set) → displayKeys"]
    end

    subgraph existing["⚙️ Existing pipeline (untouched)"]
        PL["PianoLayout pad<br/>pointerdown/up/cancel"]
        KB["Keyboard a-j / w,e,t,y,u"]
        EH["EngineHost.padPressed/padReleased"]
        MIDI["WEBMIDI.js → OP-1"]
    end

    CH -- "pointerdown → press(key)" --> HC
    PL -- "pointerdown → press(key)" --> HC
    KB -- "keydown → press(key)" --> HC
    HC -- "0→1 transition only" --> PR
    PR -- "1st press" --> EH --> MIDI
    PR --> HK
    HK -- "displayKeys prop" --> CH
    HK -- "displayKeys prop" --> PL
    CH -- "unmount while heldLocally" -.->|D-07 forced release| HC
```

**Reading the diagram:** the only new state owner is the hold-count map inside `App.svelte`. Every press source (pad pointer, keyboard, new chip) already funnels through `press`/`release` — the hold-count map slots in front of the existing `host.padPressed`/`padReleased` calls so a *second* source pressing an already-held key no longer risks a stray release later. Chips get their own `heldLocally` boolean (not derivable from the shared set) because D-03 requires only the *one physically-pressed chip instance* to go full orange even when the same key is visible in several chips at once.

### Recommended Project Structure

```
src/
├── App.svelte                 # extend press/release with hold-count map (NEW logic, existing file)
├── components/
│   ├── PianoLayout.svelte     # unchanged — reference pattern for pointer capture
│   ├── TopBar.svelte          # extend: new 'sugg' grid area + iPhone strip/panel mount point
│   ├── SuggestionRail.svelte  # NEW — desktop/iPad inline columns (D-09)
│   ├── SuggestionPanel.svelte # NEW — iPhone strip + nonmodal panel (D-10–D-13), component-local open/page $state
│   └── SuggestionChip.svelte  # NEW — the one chip component used by both (D-14)
├── suggestions.ts             # extend: D-17 max-6-per-bank validator issue code (existing file, existing pattern)
└── rail.ts                    # NEW — pure helpers: chipsPerRow(), hold-count reducer (testable, no DOM)
test/
├── suggestions.test.ts        # extend: D-17 cap validation cases
└── rail.test.ts               # NEW — chipsPerRow() balanced-row math, hold-count transitions
```

Naming follows `CONVENTIONS.md`: `PascalCase.svelte` for components, `camelCase.ts` for the new pure module — no `.svelte.ts` suffix needed for `rail.ts` since it contains no runes (runes stay component-local per this repo's established rule "No `$effect` in `.ts` modules — runes are component-file only").

### Pattern 1: Per-key hold-count layer in `App.svelte` (the D-04 fix)

**What:** Replace the direct `heldKeys.add/delete` + unconditional `host.padPressed/padReleased` calls with a ref-count gate, so a second source pressing an already-held key does not desync from a first source's later release.

**When to use:** Any place `press`/`release` is called — pads, keyboard, and the new chips all funnel through this single pair of functions already; only the internals change.

**Current code (verified this session, `src/App.svelte` lines 94–109):**
```ts
// Source: src/App.svelte:94-109 (read this session)
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

**Recommended shape (illustrative — exact variable names/placement are the planner's/executor's call):**
```ts
// hold-count: how many independent sources (pad pointer, keyboard, chip) are
// currently holding this key. host.padPressed/padReleased must only fire on
// the 0→1 / 1→0 transition, or a second source's release silences a key the
// first source still holds (D-04).
let holdCounts = new Map<Key, number>();

function press(key: Key, notes: number[]): void {
  const next = (holdCounts.get(key) ?? 0) + 1;
  holdCounts.set(key, next);
  if (next === 1) host.padPressed(key, notes);
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

**Discretion note honored:** per CONTEXT.md, a second physical source pressing an already-held key is explicitly allowed to be a no-op forward to `host` ("simplest implementation... don't care too much") — the shape above chooses no-op-on-second-press (no retrigger) since it is strictly simpler than also reproducing `host.padPressed`'s existing retrigger quirk from a second source. This is a recommendation, not a locked decision — flag as an open question for the plan/checkpoint if the planner wants explicit confirmation.

### Pattern 2: Chip local "am I the pressed instance" state (D-03)

**What:** Each chip tracks its own press locally — the shared `displayKeys` set only tells you a *key* is sounding, not *which chip* the user's finger is on.

**When to use:** Every `SuggestionChip.svelte` instance.

**Example, modeled directly on `PianoLayout.svelte`'s proven idempotent pointer-capture pattern (verified this session, lines 45–65):**
```ts
// Source: src/components/PianoLayout.svelte:45-65 (read this session) — the pattern to mirror
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
  if (captured.get(k) !== e.pointerId) return; // idempotent — only the owning pointer releases
  captured.delete(k);
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
  onRelease(k);
}
```

**Chip-local adaptation (illustrative):**
```ts
// SuggestionChip.svelte — one instance per chip
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
// D-07: unmount while held → idempotent forced release (bank change, panel
// close, paging away all unmount this chip without a pointer event ever firing).
onMount(() => () => {
  if (heldLocally) {
    heldLocally = false;
    onRelease(step.key);
  }
});

const isEcho = $derived(!heldLocally && displayKeys.has(step.key));
```

**Svelte 5 confirms `onMount`'s returned function runs on unmount** [CITED: Context7 `/sveltejs/svelte`, `06-runtime/03-lifecycle-hooks.md` — "If a function is returned from `onMount`, it will be called when the component is unmounted."]. This project already uses this exact `onMount(() => cleanupFn)` shape in `App.svelte` (MIDI subscriptions, window listeners), so it is the established idiom to reuse rather than introducing `onDestroy`.

### Pattern 3: Balanced chip-row math (pure, testable)

**What:** D-02's row-splitting formula, quoted verbatim from the validated sketch findings.

**Source quote (read this session, `.claude/skills/sketch-findings-jay-6/references/progressions.md` lines 66-67):**
```js
// Balanced rows
const rows = Math.ceil(n / maxPer); const per = Math.ceil(n / rows);
```

**Recommended extraction into `src/rail.ts` for Vitest coverage** (this repo's convention is pure functions live in plain `.ts` and get direct unit tests — see `buildSequence`, `parseRhythmPattern`):
```ts
// src/rail.ts
export function chipsPerRow(n: number, maxPerRow = 6): number {
  if (n <= 0) return 0;
  const rows = Math.ceil(n / maxPerRow);
  return Math.ceil(n / rows);
}
```
Bind to CSS via `style:--per={chipsPerRow(chips.length)}` feeding the sketch's `grid-template-columns: repeat(var(--per), minmax(min-content, max-content))` [CITED: `progressions.md` line 56, read this session].

### Pattern 4: TopBar `sugg` grid area — verified absence, not yet built

**Claim checked directly against source, not assumed:** `TopBar.svelte` currently has exactly three `@media` rules, all width-based — `max-width: 1200px` (variation popover), `max-width: 900px`, `max-width: 620px` [VERIFIED: `src/components/TopBar.svelte`, read in full this session; `grep -n "@media"` returned exactly these 3 line numbers: 1019, 1034, 1066]. There is **no** existing `max-height: 480px` breakpoint in `TopBar.svelte` — the iPhone-landscape strip is new, not a small tweak to an existing rule.

**The existing 900px breakpoint's grid** (quoted verbatim, `src/components/TopBar.svelte:1034-1049`, read this session):
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
```
`pill` spans **both** left columns here (`'pill pill transpose'`). D-10's target — `'pill sugg transpose' 'bank style latch'` — is a **3-column split** of that same row, not a superset of it. iPhone landscape widths (roughly 650–930px across current devices) straddle the existing 900px width threshold in both directions, so **the correct gating dimension is height, matching the project's own established pattern**: both `PianoLayout.svelte` (`@media (max-height: 480px) { .piano { ... } }`, lines 241–258, read this session) and `App.svelte`'s body-scroll-lock (`@media (pointer: coarse) and (max-width: 1366px) and (max-height: 480px)`, lines 326–333, read this session) already key iPhone-landscape detection off `max-height: 480px`, independent of / in addition to width. Recommend a **new, height-gated breakpoint** in `TopBar.svelte` (e.g. `@media (max-height: 480px)`, possibly combined with `pointer: coarse` to match the existing App-level pattern) rather than folding the `sugg` area into the existing 900px-width rule.

**This is a planning decision, not a locked one** — CONTEXT.md leaves "exact breakpoints beyond the sketch values" to discretion. Flag as an open question so the planner picks the exact media-query condition deliberately rather than guessing from the UI-SPEC's shorthand ("at `max-height: 480px`").

### Anti-Patterns to Avoid

- **Deriving chip "held" state purely from `displayKeys.has(key)`:** loses per-instance identity — every chip sharing that key would go full orange instead of exactly one. Full orange must come from local `heldLocally`; `displayKeys` only drives echo.
- **Calling `host.padPressed`/`padReleased` unconditionally on every `press`/`release` invocation:** reproduces the exact D-04 hazard this phase must close.
- **Putting rail open/page state in `state.svelte.ts`'s global `ui` object:** that object is exclusively for state bridged to `EngineHost`/`tickSource` via `$effect` (`CONVENTIONS.md`, confirmed by reading `state.svelte.ts` in full — every field is consumed by an `$effect` in `App.svelte`). Rail open/page is ephemeral UI state with no engine consumer — belongs component-local, mirroring `heldKeys`/`latchedKey`'s precedent.
- **Chip rendering `step.chordName` directly:** empty string for unnamed stack-bank pads (Oct Stack etc.) — must render `step.displayLabel`, which already has the `labelFor()` fallback baked in from Phase 3.
- **Adding `jsdom`/`happy-dom` to test Svelte component mounting for this phase:** breaks the project's established Vitest scope (`environment: 'node'`, confirmed in `vite.config.ts`, explicitly excludes "Svelte 5 component mounting" per `TESTING.md`). Extract testable logic into `.ts` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Chord-name resolution + unnamed-pad fallback | A second `labelFor`-equivalent inside the rail | `ResolvedSuggestionStep.displayLabel` from `getSuggestionsForBank()` | Already correct, already tested in Phase 3 (`test/suggestions.test.ts`); duplicating it risks drift from the canonical bank data |
| Catalogue >6 validation | An ad-hoc runtime check in the rail component | Extend `validateSuggestionCatalogue()` in `src/suggestions.ts` (D-17) — same staged, deterministic, own-data-descriptor pattern already used for `duplicate-id`/`duplicate-sequence` (lines 291-329, read this session) | Keeps the "invalid catalogue fails loudly at build time" guarantee the rail depends on for its "never renders invalid data" contract (per UI-SPEC's error-state dismissal) |
| Slash-chord line-break | New CSS/JS for `Cadd9`/`/E` splitting | `PianoLayout.svelte`'s existing `chordName` snippet (`label.split('/')`, lines 70-73) | Byte-for-byte the same requirement (RAIL-06), already solved and visually proven on pads |
| Pointer-capture / idempotent release-on-any-end-path | New pointer plumbing for chips | Mirror `PianoLayout.svelte`'s `captured` Map + `setPointerCapture`/`endPress` pattern (lines 45-65) | Already handles the pointerup/pointercancel/lostpointercapture race this codebase specifically fixed for UAT test 4 |

**Key insight:** almost nothing in this phase is genuinely new logic — it is new *composition* of already-proven patterns (pad pointer capture, `labelFor` fallback, staged catalogue validation) plus exactly one new piece of state (the hold-count map) that doesn't have a precedent yet because nothing before this phase let two independent sources hold the same key.

## Common Pitfalls

### Pitfall 1: Rendering `chordName` instead of `displayLabel` on unnamed stack-bank pads
**What goes wrong:** Chip shows a blank chord name for Oct Stack-style banks (RAIL-02 explicitly requires "a useful fallback for unnamed stack-bank pads").
**Why it happens:** `ResolvedSuggestionStep` exposes both `chordName` (raw, can be `''`) and `displayLabel` (post-`labelFor()`, never empty) — easy to reach for the "canonical" name field and get the wrong one.
**How to avoid:** Chip template always renders `step.displayLabel`; never `step.chordName` directly in UI (chordName exists for callers that need the raw canonical value, not display).
**Warning signs:** A chip in bank 14 (Oct Stack) renders blank or just a key letter with no chord text.

### Pitfall 2: D-04 violated only under a timing-dependent combo
**What goes wrong:** Holding a pad, then also pressing its aliasing chip, then releasing the chip first — the pad silently stops sounding / un-highlights even though the pad pointer is still down.
**Why it happens:** Without the hold-count layer, `release(key)` unconditionally calls `host.padReleased` and deletes from `heldKeys` regardless of how many sources are holding that key.
**How to avoid:** Implement Pattern 1 (hold-count map) and specifically test it — this is RAIL-08's named test case ("holding a chip and its pad together releases correctly").
**Warning signs:** Manual UAT: press-and-hold a pad with the mouse, tap-and-release its chip once — if the pad goes dark/silent, the bug is present.

### Pitfall 3: Iterating a `Set<Key>` for "does any OTHER chip need to echo" without excluding the currently-pressed instance
**What goes wrong:** The pressed chip itself flickers to echo styling instead of staying full orange, or briefly shows both classes.
**Why it happens:** `displayKeys.has(step.key)` is true for the pressed chip's own key too — echo must explicitly exclude `heldLocally`.
**How to avoid:** `isEcho = !heldLocally && displayKeys.has(step.key)` (Pattern 2) — precedence order matches UI-SPEC's Interaction State Reference (held > echo > default).

### Pitfall 4: Forgetting the D-07 unmount-triggered release path
**What goes wrong:** A chip held while the bank changes (or the iPhone panel closes) leaves a stuck-lit pad or hanging note, because the pointer never fires `pointerup`/`pointercancel` on an element that just disappeared from the DOM.
**Why it happens:** Browser pointer events don't fire for elements removed from the DOM out from under an active pointer.
**How to avoid:** `onMount(() => () => { if (heldLocally) { ...forced release... } })` per Pattern 2 — Svelte's effect/mount teardown runs on unmount regardless of pointer event delivery [CITED: Context7 `/sveltejs/svelte`].
**Warning signs:** Hold a chip, switch bank via `←`/`→` mid-hold, watch for a note that keeps sounding or a pad that stays lit after release.

### Pitfall 5: Gating the iPhone `sugg` grid area off the wrong media condition
**What goes wrong:** The strip either never appears on real iPhone-landscape widths, or incorrectly appears on iPad/desktop at certain window sizes.
**Why it happens:** iPhone-landscape widths (≈650–930px) straddle the existing `900px`-width TopBar breakpoint in both directions — width alone is not a reliable discriminator (see Pattern 4).
**How to avoid:** Use the project's own established height-based (or `pointer: coarse` + height) convention already proven in `PianoLayout.svelte` and `App.svelte`, not a new width guess.
**Warning signs:** Strip missing on a real iPhone in landscape, or strip appearing on a narrowed desktop browser window.

## Code Examples

### Reading a suggestion for a bank (Phase 3 API, unchanged)
```ts
// Source: src/suggestions.ts (existing, read this session)
import { getSuggestionsForBank } from '../suggestions';
const suggestions = getSuggestionsForBank(ui.bankIndex);
// suggestions: readonly ResolvedSuggestion[]
// each: { id, bankIndex, bankName, label, kind, steps: readonly { key, chordName, displayLabel }[] }
```

### Empty-state check (RAIL-01)
```svelte
{#if suggestions.length === 0}
  <p class="empty">No curated suggestions for this bank yet</p>
{:else}
  <!-- render columns -->
{/if}
```
Copy is locked verbatim (D-15, UI-SPEC Copywriting Contract) — do not paraphrase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | "No-op on second press" (vs. retrigger) is the right default for the D-04 discretion call | Pattern 1 | Low — CONTEXT.md explicitly says Flo doesn't care which behavior ships, only that nothing hangs; either choice satisfies the hard invariant. Worth a one-line confirmation in the plan, not a blocking question. |
| A2 | The new TopBar breakpoint should be height-gated (`max-height: 480px`), not the existing `900px` width rule | Pattern 4 | Medium — if the planner instead folds `sugg` into the 900px-width rule, the strip may show up on iPad portrait/narrowed-desktop widths that aren't actually iPhone-landscape, or miss real iPhone-landscape widths above 900px. Recommend the planner lock the exact media-query condition as an explicit task decision, not leave it implicit. |
| A3 | A new pure module `src/rail.ts` (rather than adding to `suggestions.ts`) is the right home for `chipsPerRow()` and any hold-count helper extracted for testability | Recommended Project Structure | Low — purely a file-organization call; `CONVENTIONS.md` has no strong precedent against colocating in `suggestions.ts` either. |
| A4 | The new D-17 catalogue issue code name (not chosen here) should follow the existing kebab-ish naming (`duplicate-id`, `invalid-steps`) — something like `too-many-suggestions` | Don't Hand-Roll table | Low — cosmetic; any name satisfying the existing `CatalogueIssueCode` union pattern works, this is a placeholder illustration only. |

**All four assumptions are low-to-medium risk and explicitly flagged for the planner to resolve as deliberate task-level decisions** — none touch a UI-SPEC-locked value (D-01 through D-17 are all directly sourced from `04-CONTEXT.md`, not assumed).

## Open Questions (RESOLVED)

1. **Exact media-query condition for the iPhone `sugg` grid area** — RESOLVED: bare `max-height: 480px` (04-04 Task 1)
   - What we know: must be height-gated (or height + `pointer: coarse`) per the project's own established iPhone-landscape pattern (see Pattern 4/A2); UI-SPEC only says "at `max-height: 480px`".
   - What's unclear: whether to combine with `pointer: coarse` (matching `App.svelte`'s body-scroll-lock condition) or use bare `max-height: 480px` (matching `PianoLayout.svelte`'s piano-sizing condition) — the two existing precedents in this codebase use *different* conditions for what is functionally the same "are we on iPhone landscape" question.
   - Recommendation: planner picks one explicitly in the plan (bare `max-height: 480px` is simpler and matches `PianoLayout.svelte`, the closer analog since both are pure layout-shape changes rather than scroll-behavior changes); note the choice in a code comment referencing this tradeoff.

2. **D-17 issue code name and where the >6-per-bank check groups entries** — RESOLVED: `too-many-suggestions`, one issue per entry beyond the 6th (04-02 Task 1)
   - What we know: the check is a cross-entry, per-bank count, structurally identical to the existing `duplicate-id`/`duplicate-sequence` grouping loop (`src/suggestions.ts:291-329`).
   - What's unclear: exact `CatalogueIssueCode` string value and whether the issue is emitted once per bank or once per offending entry (existing `duplicate-*` codes emit once per offending entry, which is the more consistent precedent).
   - Recommendation: follow the `duplicate-sequence` precedent shape (one issue per entry beyond the 6th, in catalogue order, with a `relatedPath` back to the 6-suggestion boundary if that reads cleanly) — planner's call.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node/npm toolchain | Build, Vitest | ✓ | Node v24.21.0 (confirmed this session via shell) | — |
| Vitest | RAIL-08 unit coverage of pure logic | ✓ | `^2.1.0` in package.json | — |
| Browser (Chrome/Edge desktop) | Web MIDI, RAIL-07/08 verification | Assumed ✓ per `CLAUDE.md` project stack note | — | iPad needs "Web MIDI Browser" app per project CLAUDE.md; not independently probed this session |
| Playwright MCP | RAIL-07 browser verification across desktop/iPad/iPhone-landscape viewports | Stated available by orchestrator context; not directly confirmed by a tool probe in this research session | — | If unavailable at execution time: manual browser resize + visual check, as this project's existing UAT process already does (no Playwright currently in `package.json` devDependencies) |
| OP-1 hardware + MIDI monitor | RAIL-08 hardware verification | Not probeable from this session (physical hardware) | — | None — RAIL-08 is explicitly a manual/hardware-gated requirement, consistent with existing BPM-07/VAR-08 pattern in `REQUIREMENTS.md` |

**Missing dependencies with no fallback:**
- OP-1 hardware + MIDI monitor for RAIL-08 — inherent to the requirement, not a gap to close; must be run by a human with the hardware.

**Missing dependencies with fallback:**
- Playwright MCP (if actually unavailable at plan-execution time) — falls back to the same manual browser-resize verification this project's UAT process already uses for every prior phase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^2.1.0` [VERIFIED: package.json] |
| Config file | `vite.config.ts` — `test: { globals: true, environment: 'node', ... }` [VERIFIED: read this session] |
| Quick run command | `npm run test` (equivalently `just test`) |
| Full suite command | `just ci` (`check` → `test` → `build`) |

**Hard constraint carried over from `TESTING.md` (verified, not assumed):** `environment: 'node'`, no jsdom/happy-dom — "Svelte 5 component mounting" and "UI behavior" are explicitly out of Vitest's scope for this project. This phase must not attempt to mount `SuggestionChip.svelte`/`SuggestionRail.svelte`/`SuggestionPanel.svelte` in Vitest; only pure `.ts` logic extracted from them is unit-testable.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RAIL-01 | Bank with suggestions → non-empty; bank without → `[]` | unit (already covered) | `npm test -- suggestions.test.ts` | ✅ (`getSuggestionsForBank` already tested in Phase 3) |
| RAIL-02 | `displayLabel` fallback for unnamed stack-bank pads | unit (already covered) | `npm test -- suggestions.test.ts` | ✅ (Phase 3 `labelFor`/bank-14 anchor tests exist per `TESTING.md`) |
| RAIL-02 | Chip renders `displayLabel` not `chordName` | manual/visual | Playwright-MCP or manual: open bank 14, confirm chip shows `"C Oct Stack"`-style text, not blank | ❌ Wave 0 — no automated DOM assertion possible (no jsdom) |
| RAIL-03 | Hold-count map: 0→1/1→0 transitions call host exactly once each | unit (NEW) | `npm test -- rail.test.ts` | ❌ Wave 0 |
| RAIL-03 | Browsing (open/page/close) emits no MIDI | manual/hardware | OP-1 + MIDI monitor, per RAIL-08 | ❌ Wave 0 (manual only, no automated equivalent) |
| RAIL-04 | Echo derivation excludes the held instance | unit (NEW, if extracted as pure fn) or manual | `npm test -- rail.test.ts` if extracted; else manual visual check | ❌ Wave 0 |
| RAIL-05 | Rail subordinate to pads (DOM order, layout) | manual/visual | Playwright-MCP screenshot, desktop/iPad/iPhone-landscape | ❌ Wave 0 |
| RAIL-06 | `chipsPerRow()` balanced-row math (7→4+3, 8→4+4) | unit (NEW) | `npm test -- rail.test.ts` | ❌ Wave 0 |
| RAIL-07 | Browser verification across 3 viewport classes | manual/Playwright-MCP | See Environment Availability | ❌ Wave 0 |
| RAIL-08 | Chip+pad held together releases correctly; core loop intact | manual/hardware | OP-1 + MIDI monitor UAT | ❌ Wave 0 (inherently manual) |
| D-17 | Catalogue rejects >6 suggestions per bank | unit (NEW) | `npm test -- suggestions.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test` (fast, `node` environment, no DOM — should stay well under 30s for this project's scale)
- **Per wave merge:** `just ci` (`check` + `test` + `build`)
- **Phase gate:** `just ci` green, plus manual browser verification (RAIL-07) and hardware verification (RAIL-08) both signed off before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `test/rail.test.ts` — covers RAIL-03 (hold-count transitions), RAIL-06 (`chipsPerRow`), and RAIL-04 (echo derivation, if extracted as a pure function)
- [ ] `test/suggestions.test.ts` extension — covers D-17 (>6-per-bank validator rejection), including the boundary case (exactly 6 = valid, 7 = invalid)
- [ ] Manual verification checklist entries for RAIL-01/02/05/07 (visual) and RAIL-03/08 (hardware/MIDI-monitor) — likely an addition to this project's existing `.research/UAT.md`-style manual checklist, per `TESTING.md`'s established UAT pattern
- [ ] No new Vitest framework/config needed — `environment: 'node'` already suffices for all newly-extractable pure logic

## Sources

### Primary (HIGH confidence — read directly this session)
- `src/App.svelte` — press/release/heldKeys/displayKeys/keyboard handling (full file)
- `src/components/PianoLayout.svelte` — pointer-capture pattern, chordName snippet (full file)
- `src/components/TopBar.svelte` — all three `@media` breakpoints, grid-template-areas (lines 1000-1123 read, `@media` occurrences grep-confirmed)
- `src/engines/host.ts` — `padPressed`/`padReleased`/`panic` (lines 1-160)
- `src/suggestions.ts` — full validator + `getSuggestionsForBank` (full file)
- `src/banks.ts` — `labelFor` fallback (full file)
- `src/state.svelte.ts` — `ui` object scope (full file)
- `src/suggestions.data.json` — current bootstrap catalogue (full file)
- `package.json`, `vite.config.ts` — installed versions, Vitest environment
- `.planning/codebase/TESTING.md`, `.planning/codebase/CONVENTIONS.md` — testing scope and Svelte-5-runes conventions
- `.planning/phases/04-read-only-suggestion-rail/04-CONTEXT.md`, `04-UI-SPEC.md` — locked decisions D-01–D-17, UI contract
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md` — RAIL-01..08, Out of Scope table
- `.claude/skills/sketch-findings-jay-6/references/progressions.md` — chip CSS/JS patterns, balanced-row formula (full file)
- Context7 `/sveltejs/svelte` — `onMount`/`$effect` cleanup-on-unmount semantics [CITED]

### Secondary (MEDIUM confidence)
- None — this phase's research surface is entirely internal-codebase; no web search was performed (`.planning/config.json`-derived provider flags `brave_search`/`firecrawl`/`exa_search` all `false` for this project, confirmed via `gsd-tools query init.phase-op`).

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all versions read directly from `package.json`
- Architecture: HIGH — every pattern (pointer capture, `displayLabel` fallback, staged validation, `$effect`/`onMount` cleanup) is either directly quoted from this codebase or Context7-cited official Svelte docs
- Pitfalls: HIGH — each pitfall is derived from a concrete, quoted code path in this repo, not generic advice
- Hold-count design (Pattern 1) and breakpoint choice (Pattern 4): MEDIUM — these are *recommendations* the planner should confirm/lock explicitly, not verified-correct-by-execution (no test was run this session; the shapes shown are illustrative, not copy-paste-final)

**Research date:** 2026-09-25
**Valid until:** No external dependency drift risk (nothing new installed) — valid until the next Phase 3/4 data or codebase change; effectively until this phase is planned (no 30-day decay concern for an internal-pattern research doc).
