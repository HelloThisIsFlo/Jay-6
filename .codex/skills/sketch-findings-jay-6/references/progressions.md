# Suggestion Rail (progressions + movements)

Supersedes the sketch-001 progression rail: no current/next step state, no dashed-steel "next", no bars or timing.

## Design Decisions

- 🏷️ Identity is label-led
  - authored label leads (`Homeward`)
  - kind (`progression` / `movement`) = small borderless steel text (`--system`, 11px), never a badge

- 🧩 Chips
  - each chip = small pad key label + resolved chord name (mono 14px/600)
  - fill `--bg-2`, border `--bg-4`, radius 6px, identical for every chip
  - key-colour hint = **cream outline on naturals only** (`rgb(244 241 234 / .6)`); accidentals keep the default edge
  - balanced no-scroll rows: ≤6 per row, 7→4+3, 8→4+4; narrow containers cap at 4
  - never truncate; slash chords may break before the bass (`Cadd9` / `/E`, bass at .72 opacity)

- 🎹 Chips are playable
  - chip press = the same press/release path as its pad (`onPress`/`onRelease`)
  - pressed chip turns full orange **and** its pad lights
  - per-key hold count: releasing a chip never silences a pad still held (and vice versa)
  - only the pressed chip gets full orange
  - "read-only" now means *no editing/authoring*, not "not playable"

- 🔁 Soft echo (both ways)
  - any held key (from a pad or a chip) lights every *other* chip with that key
  - echo = `rgb(255 122 26 / .18)` fill + `--accent` border
  - the pressed chip always keeps full orange; echo never overrides it

- 🖥️ Desktop / iPad: inline columns under the pads
  - eyebrow `SUGGESTIONS · N` (steel, uppercase, 11px) above the rail
  - `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` → 3 across on iPad landscape
  - **max 6 suggestions per bank**: 3×2 fits the iPad viewport; a 7th clips
  - reason: iPad locks body scroll (`pointer: coarse`, ≤1366 wide, >480 tall in App.svelte), so anything below the fold can't be reached

- 📱 iPhone landscape (`max-height: 480px`): strip in the top bar + anchored panel
  - no room below the pads: top bar ~157px + pads end ~335px vs ≈330–360px usable height
  - `Suggestions · N` strip sits in the empty middle of TopBar row 1 (`grid-template-areas: 'pill sugg transpose' 'bank style latch'`), 44px tall, zero height cost
  - open → nonmodal panel over the top bar only; its max-height = space above the pads, so it never covers a pad
  - one suggestion at a time: label + kind, `‹ 1 of N ›`, ×
  - close via ×, the strip label in the panel header, or Escape; no backdrop dismissal
  - trade-off accepted: bank/style/latch hidden while open
  - panel chips are playable with soft echo too: one chip component everywhere

- 🫥 Empty bank
  - quiet muted line `No curated suggestions for this bank yet` (`--fg-2`, 13px; 12px centred in the iPhone top bar)
  - no count, no button, no icon, no orange

- 🎨 Colour semantics unchanged
  - orange = sounding (pressed chip, lit pad, soft echo)
  - steel = system metadata (kind, strip, eyebrow)

## CSS Patterns

```css
.chips { display: grid; grid-template-columns: repeat(var(--per), minmax(min-content, max-content)); gap: 6px; justify-content: start; }
.chip { display: flex; flex-direction: column; gap: 2px; padding: 5px 9px 6px; border: 1px solid var(--bg-4); border-radius: 6px; background: var(--bg-2); }
.chip[data-color="white"] { border-color: rgb(244 241 234 / .6); }
.chip .n span { white-space: nowrap; }          /* break only between main and /bass */
.chip.held { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 14px 2px rgb(255 122 26 / .4); }
.chip.echo:not(.held) { background: rgb(255 122 26 / .18); border-color: var(--accent); }
.kind { font-size: 11px; color: var(--system); }   /* no border, no fill */
```

```js
// Balanced rows
const rows = Math.ceil(n / maxPer); const per = Math.ceil(n / rows);
```

## HTML Structures

- Chip: `<span class="chip" data-chip="E" data-color="white"><span class="k">E</span><span class="n"><span>Cadd9</span><span class="bass">/E</span></span></span>`
- Column: `.col > .rail-id (label + kind) + .chips`
- iPhone panel: `.panel > .p-head (collapse strip · label/kind · ‹ count › · ×) + .p-body (.chips)`

## What to Avoid

- Inline rail on iPhone landscape: starts below the fold; you can read or play, not both
- Strip under the pads on iPhone: the strip itself falls below the fold
- Bottom sheet on iPhone (sketch 001 idea): covers the white keys
- Rows layout on iPad: a 6-suggestion bank clips ~79px where scroll is locked
- Key-cap hint (tab behind the key label): disliked
- Mini-pad chips (full cream/black fill): too distracting, competes with the pads
- Black-key-filled chips / black bezel ring: read as real pads
- Echo overriding the pressed chip: the press must always win
- Current/next step state, playheads, bar notation

## Origin

Synthesized from sketches: 001 (superseded parts), 002, 003.
Source files: `sources/002-iphone-suggestion-rail/`, `sources/003-desktop-suggestion-rail/`.
