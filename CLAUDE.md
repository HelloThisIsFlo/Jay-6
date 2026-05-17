# Jay-6

Browser app: J-6-style chord pads → MIDI → OP-1.

## Start here

- **[CURRENT-STATE.md](CURRENT-STATE.md)** — roadmap, what's shipped, what's next, conventions, file layout, architecture-in-a-paragraph. Read this first.
- **[.research/PLAN.md](.research/PLAN.md)** — original plan + decision log.

## Stack

Vite 6 + Svelte 5 (runes) + TypeScript strict + Vitest + WEBMIDI.js v3.
Chrome/Edge desktop for Web MIDI. iPad needs the "Web MIDI Browser" app.

## Common commands

```bash
just              # list recipes
just dev          # vite localhost (use this for Web MIDI dev)
just serve        # vite + Cloudflare tunnel (https://jay-6.kempenich.dev)
just test         # vitest
just check        # svelte-check
just ci           # check + test + build
```

## Project conventions

- Engines subscribe to `tickSource` (24 PPQ); they never own timers.
- UI state lives in `src/state.svelte.ts` ($state runes). `App.svelte` bridges to imperative host + tickSource via `$effect`.
- `src/banks.data.json` is the verified Roland extraction — don't edit by hand; if voicings need correcting, fix the JSON.
- No premature features (no Web Audio scheduler, no presets, no persistence — those are Phase 3 backlog in CURRENT-STATE.md).
- Comments: WHY only. Don't restate the code.
- After meaningful changes: update `CURRENT-STATE.md` so the next agent (or future-you) lands oriented.
