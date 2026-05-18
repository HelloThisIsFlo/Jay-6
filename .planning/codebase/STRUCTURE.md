# Codebase Structure

**Analysis Date:** 2026-05-18

## Directory Layout

```
jay-6/
├── src/                       # All application source
│   ├── main.ts                # Vite entry — mounts App.svelte into #app
│   ├── App.svelte             # Root component: $effect bridges, keyboard handlers
│   ├── state.svelte.ts        # Global $state + setter functions
│   ├── midi.ts                # WebMidi.js wrapper, port mgmt, playChord/releaseChord
│   ├── tickSource.ts          # Singleton 24-PPQ tick stream (int/ext switchable)
│   ├── clock.ts               # Pure BPM→ms and BPM→ticks math helpers
│   ├── banks.ts               # Bank/Chord types + getBank() / labelFor() helpers
│   ├── banks.data.ts          # Thin JSON loader (imports banks.data.json)
│   ├── banks.data.json        # 100 Roland J-6 chord banks — DO NOT edit by hand
│   ├── phrases.ts             # Style 1–5 variation data + parseRhythmPattern()
│   ├── vite-env.d.ts          # Vite env type declarations
│   ├── engines/
│   │   ├── types.ts           # Engine interface (start/setNotes/stop/setBpm)
│   │   ├── host.ts            # EngineHost orchestrator (latch, transpose, lifecycle)
│   │   ├── hold.ts            # HoldEngine — direct chord play, no clock
│   │   ├── arp.ts             # ArpEngine — Style 1 (8th) + Style 2 (16th)
│   │   ├── phraseDuration.ts  # PhraseDurationEngine — Style 3 (retrigger at interval)
│   │   └── rhythmGate.ts      # RhythmGateEngine — Style 4+5 (16-step pattern hits)
│   └── components/
│       ├── TopBar.svelte      # All UI controls: MIDI port/ch, bank, style, BPM, latch
│       └── PianoLayout.svelte # 12-pad piano grid, pointer events
├── test/                      # Vitest specs (data + math only, no UI)
│   ├── banks.test.ts          # Bank data integrity checks
│   ├── phrases.test.ts        # parseRhythmPattern + style data correctness
│   ├── arp.test.ts            # buildSequence + ArpEngine tick math
│   └── clock.test.ts          # BPM→ms and BPM→ticks conversions
├── .planning/
│   └── codebase/              # GSD codebase maps (this directory)
├── .research/
│   ├── PLAN.md                # Original design + decision log
│   ├── UAT.md                 # Feature-by-feature hand-test checklist
│   └── diff-chord-extractions.mjs  # Script used during bank data extraction
├── .claude/
│   └── skills/
│       └── uat-agent/         # UAT walkthrough skill (triggered by "run uat")
├── .github/
│   └── workflows/
│       └── build.yml          # CI: svelte-check + vitest + vite build → GHCR Docker push
├── scripts/                   # One-off extraction/migration scripts
├── docs/                      # Static docs / screenshots
├── dist/                      # Vite build output (gitignored)
├── index.html                 # HTML shell — single #app mount point
├── vite.config.ts             # Vite config (allowedHosts: true for LAN/tunnel)
├── svelte.config.ts           # Svelte plugin config
├── tsconfig.json              # TypeScript strict mode config
├── Justfile                   # Task runner recipes (dev, serve, test, ci, deploy)
├── Dockerfile                 # nginx:alpine static serve image
├── nginx.conf                 # nginx config for container
├── k8s.yaml                   # Kubernetes Deployment + Service + Ingress
├── deploy.sh                  # kubectl apply wrapper
├── cleanup.sh                 # Dev cleanup helper
├── CURRENT-STATE.md           # Roadmap, file layout, architecture summary — read first
├── CLAUDE.md                  # Agent orientation file
├── TUNNEL-SETUP.md            # Cloudflare tunnel + k8s deploy notes
└── README.md                  # Public readme with screenshot + keyboard cheatsheet
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Svelte components, TypeScript modules, data files
- Key files: `App.svelte`, `state.svelte.ts`, `tickSource.ts`, `midi.ts`

**`src/engines/`:**
- Purpose: All playback engine implementations + the host orchestrator
- Contains: One file per engine type + the `Engine` interface + `EngineHost`
- Key files: `host.ts` (entry from App), `types.ts` (contract)

**`src/components/`:**
- Purpose: Svelte UI components (no business logic, no engine calls)
- Contains: `TopBar.svelte`, `PianoLayout.svelte`

**`test/`:**
- Purpose: Vitest unit tests — data correctness and math only
- Contains: `.test.ts` files mirroring `src/` module names
- Not co-located: tests live in a separate `test/` directory

**`.research/`:**
- Purpose: Design docs, decision log, UAT checklist
- Generated: No — hand-written
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase maps for planner/executor agents
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (`just build`)
- Committed: No (gitignored)

## Key File Locations

**Entry Points:**
- `src/main.ts`: Vite entry — mounts App
- `index.html`: HTML shell with `<div id="app">`

**Configuration:**
- `vite.config.ts`: Vite build + dev server config
- `tsconfig.json`: TypeScript strict mode
- `Justfile`: All task runner recipes

**Core Logic:**
- `src/state.svelte.ts`: Reactive state + all setters
- `src/engines/host.ts`: Pad event handling + engine orchestration
- `src/tickSource.ts`: 24-PPQ timing authority
- `src/midi.ts`: All MIDI I/O

**Data:**
- `src/banks.data.json`: 100 Roland chord banks (verified, do not edit)
- `src/phrases.ts`: Style 1–5 variation arrays + rhythm pattern parser

**Testing:**
- `test/`: All Vitest specs

**Deploy:**
- `k8s.yaml`: K8s manifest for `https://jay-6.kempenich.ai`
- `.github/workflows/build.yml`: CI pipeline → GHCR image push

## Naming Conventions

**Files:**
- Svelte components: PascalCase with `.svelte` extension (e.g., `TopBar.svelte`, `PianoLayout.svelte`)
- TypeScript modules: camelCase with `.ts` extension (e.g., `tickSource.ts`, `banks.data.ts`)
- Reactive state module: `.svelte.ts` suffix required by Svelte 5 runes (e.g., `state.svelte.ts`)
- Test files: `<module>.test.ts` in `test/` directory

**Classes:**
- Engine implementations: PascalCase + `Engine` suffix (e.g., `ArpEngine`, `HoldEngine`, `RhythmGateEngine`)
- Host orchestrator: `EngineHost`
- TickSource implementation: `TickSourceImpl` (internal), exported singleton as `tickSource`

**Types/Interfaces:**
- PascalCase (e.g., `Engine`, `Bank`, `Chord`, `ArpVariation`, `RhythmStep`)
- Union string types for style kinds: `StyleKind`, `ClockSource`, `MidiStatus`

**Constants:**
- SCREAMING_SNAKE_CASE for module-level constants (e.g., `TICKS_PER_QUARTER`, `STYLE_LABELS`, `STYLE_VARIATION_COUNT`)
- Style data arrays: prefixed `STYLE1`/`STYLE2` etc. (private), exported as `style1`/`style2`

## Where to Add New Code

**New Engine (e.g., Style 6):**
- Implement `Engine` interface: `src/engines/<name>.ts`
- Register in `buildEngine()` factory: `src/engines/host.ts`
- Add style kind to `StyleKind` union and `STYLE_LABELS`/`STYLE_VARIATION_COUNT` maps: `src/state.svelte.ts`
- Add variation data array: `src/phrases.ts`

**New UI Control:**
- Add field to `ui` `$state` object + setter: `src/state.svelte.ts`
- Wire `$effect` bridge to host/tickSource: `src/App.svelte`
- Render control: `src/components/TopBar.svelte`

**New Bank Data:**
- Do not edit `src/banks.data.json` by hand — use extraction tooling in `.research/`
- If correcting voicings: edit the JSON directly with care, document in commit

**New Utility/Math Helper:**
- Pure timing math: `src/clock.ts`
- MIDI I/O helpers: `src/midi.ts`
- Bank/chord helpers: `src/banks.ts`

**New Tests:**
- Add to `test/<module>.test.ts` matching the source module name
- Scope: data correctness + pure math only; no Svelte mounting, no Web MIDI

## Special Directories

**`dist/`:**
- Purpose: Vite production build (HTML + JS + CSS bundles)
- Generated: Yes (`just build`)
- Committed: No

**`.playwright-mcp/`:**
- Purpose: Playwright MCP browser automation state (used during prototyping/UAT capture)
- Generated: Yes
- Committed: No (in practice present; not actively used)

---

*Structure analysis: 2026-05-18*
