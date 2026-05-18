# Jay-6

Browser app: J-6-style chord pads → MIDI → OP-1.

## Project is GSD-managed

Workflow orchestration via [GSD](https://github.com/Get-Shit-Done). Start here:

- **`.planning/PROJECT.md`** — what we're building + why
- **`.planning/ROADMAP.md`** — phase plan + status
- **`.planning/STATE.md`** — current focus
- **`.planning/phases/`** — per-phase RESEARCH / CONTEXT / PLAN / SUMMARY / UAT artifacts
- **`MANUAL.md`** — user-facing guide

Use `/gsd:progress` to advance work. `/gsd:help` for command index.

## `.research/` directory

Non-GSD scratchpad. Anything not authored by GSD workflows: hand-written notes, pre-GSD design docs, external research, exploration outputs. Free-form — no schema.

## Stack

Vite 6 + Svelte 5 (runes) + TypeScript strict + Vitest + WEBMIDI.js v3.
Chrome/Edge desktop for Web MIDI. iPad needs the "Web MIDI Browser" app.

## Commands

`just` lists recipes. Common: `just dev`, `just test`, `just check`, `just ci`.

## Conventions

- Engines subscribe to `tickSource` (24 PPQ); never own timers.
- UI state in `src/state.svelte.ts` ($state runes); `App.svelte` bridges to imperative host + tickSource via `$effect`.
- `src/banks.data.json` = verified Roland extraction — don't edit by hand.
- Comments: WHY only. No restating code.
