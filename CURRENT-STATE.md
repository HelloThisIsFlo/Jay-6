# Jay-6 — Current State

> Roadmap + progress snapshot. Start here when picking the project back up.
> Full design rationale: [`.research/PLAN.md`](.research/PLAN.md).

## TL;DR

- **What it is**: Browser app. Click chord pads → MIDI flows out → OP-1 (or any MIDI synth) plays.
- **Where we are**: Prototype shipped + verified on hardware. Now in post-prototype polish.
- **How to run**: `just dev` (localhost), `just serve` (Vite + Cloudflare tunnel → `jay-6.kempenich.dev` from this Mac), or always-on at `https://jay-6.kempenich.ai` (home k8s cluster).

## Roadmap

### ✅ Phase 1 — Prototype (M1–M8 + keyboard shortcuts)

Shipped and verified on the OP-1 over USB MIDI. Subjective "fun to play" passed.

| Milestone | What landed |
|---|---|
| M1 Data | 100 Roland J-6 chord banks (`src/banks.data.json` via two-extraction diff). Style 1–5 phrase data (`src/phrases.ts`). |
| M2 MIDI | WEBMIDI.js plumbing, output port + channel select, `playChord` / `releaseChord`. |
| M3 Chord pads | 12 pads in J-6's 5-black + 7-white layout, bank selector + arrows, J-6 orange held-pad fill. |
| M4 Arp | Style 1 (8th) + Style 2 (16th), 24 variations total, direction × octave-range × triplet. |
| M5 Rhythm gate | Style 4 + Style 5, 24 explicit `o`/`_`/`~` patterns, gate-length slider. |
| M6 Clock | Shared BPM, on-demand start, triplet-aware step math. |
| M7 Latch | Roland J-6 HOLD convention — same-pad re-press retriggers, different pad swaps smoothly, latch button toggles off. |
| Keyboard | Ableton Computer-MIDI mapping (A/W/S/E/D/F/T/G/Y/H/U/J = pads, Z/X = transpose, ←/→ = bank, Space = latch, 1-6 = style). |
| M8 OP-1 hands-on | ✅ banks + rhythm + latch + transpose all play through cleanly. |

Style 3 (Phrase Dur, 12 variations) shipped alongside M4/M5 since they share the engine + clock pattern.

### 🚧 Phase 2 — Post-prototype polish (in progress)

| Item | Status |
|---|---|
| MIDI clock **receive** (slave to OP-1) | ✅ TickSource at 24 PPQ, Input port + Int/Ext toggle in top bar |
| Latched pad stays highlighted | ✅ |
| LAN exposure (`vite --host`, `allowedHosts: true`) | ✅ |
| Justfile (`dev`, `tunnel`, `serve`, `test`, `check`, `build`, `ci`) | ✅ |
| Cloudflare tunnel → `jay-6.kempenich.dev` | 🟡 DNS provisioned, ingress added to local YAML, but TheMac tunnel is dashboard-managed in practice — add the public hostname in the Cloudflare Zero Trust dashboard for the tunnel to actually route |
| K8s deploy → `https://jay-6.kempenich.ai` | ✅ `Dockerfile` (nginx:alpine) + `k8s.yaml` (1 replica, 5m/32Mi) + GHCR Action + `./deploy.sh`. Routed via cluster cloudflared — see [`TUNNEL-SETUP.md`](TUNNEL-SETUP.md). |
| UAT pass (`.research/UAT.md` via `uat-agent` skill) | 🟡 Checklist + skill drafted — not yet walked through |

### ⏳ Phase 3 — Backlog (not started)

| Item | Notes |
|---|---|
| MIDI clock **send** (24 PPQ + Start/Stop/Continue) | Flagged optional in M6. Quick add (~50 lines, no UI change). |
| M9 Style 6–9 phrases | Roland publishes no note data. Options: skip / roll own / reverse-engineer. |
| M10 polish | Velocity control, persist last bank/BPM/port, save/recall favorite presets. |
| Chord voicing spot-check | ~30% of slots were inferred during HTML extraction. Cross-check against Roland PDF or hardware if anything sounds off. |
| Rhythm pattern phase alignment under external clock | Engine starts on `engine.start()` rather than on the next OP-1 beat → patterns can land off-beat. Fix: anchor first step to the next clock-tick-mod-24 boundary, or restart on transport `start`. |
| iPad polish | Web MIDI works on iOS via the "Web MIDI Browser" app (Yonemoto). UI itself is desktop-first — touch ergonomics not yet tuned. |

## Project conventions

### Stack

- **Vite 6** + **Svelte 5** (runes: `$state`, `$derived`, `$effect`) + **TypeScript strict**
- **Vitest 2** for unit tests (focus: bank data correctness + phrase parsing + clock math)
- **WEBMIDI.js v3** wrapper for Web MIDI
- **Cloudflare tunnel** + **Just** for serve/expose
- Chrome/Edge only on desktop (Safari/Firefox lack Web MIDI). iPad: Web MIDI Browser app.

### Where things live

```
src/
  banks.ts           types + getBank/labelFor helpers
  banks.data.ts      thin loader for banks.data.json
  banks.data.json    100 Roland chord banks (verified extraction)
  phrases.ts         Style 1–5 data + parseRhythmPattern()
  midi.ts            WebMidi I/O port mgmt + playChord/releaseChord
  clock.ts           BPM → ms / ticks math (24 PPQ)
  tickSource.ts      single 24 PPQ tick stream — internal setInterval or external MIDI clock
  state.svelte.ts    global UI $state + setters
  engines/
    types.ts         Engine interface
    hold.ts          chord on/off, no clock
    arp.ts           Style 1+2
    phraseDuration.ts Style 3
    rhythmGate.ts    Style 4+5
    host.ts          orchestrator: routes pad press → active engine, latch, transpose
  components/
    TopBar.svelte    Output / Input / Ch / Bank / Transpose / Clock / BPM / Style / Var / Gate / Latch
    PianoLayout.svelte 14-col CSS grid, 5 black on top row, 7 white on bottom
  App.svelte         wires EngineHost, $effect bridges state → host + tickSource, keyboard handlers
test/                vitest specs (banks, phrases, arp, clock)
```

### Architecture in one paragraph

`midi.ts` owns WebMidi I/O. `tickSource.ts` is the heartbeat — 24 ticks per quarter, sourced either from an internal `setInterval` (BPM-driven) or from an external MIDI input port's `clock` events. Every time-driven engine (`arp`, `phraseDuration`, `rhythmGate`) subscribes to TickSource and fires on its own tick modulus (8th = 12 ticks, 16th = 6, triplet 8th = 8, …). `engines/host.ts` is the orchestrator: pad press goes through the active engine, with latch + transpose applied at the boundary. `state.svelte.ts` holds reactive UI state; `App.svelte` bridges every state field into the host / tick source via `$effect`.

### Commands

```bash
just              # list recipes
just dev          # vite localhost only (use this for Web MIDI in Chrome/Edge)
just dev-lan      # vite on 0.0.0.0 (LAN viewers — MIDI still requires localhost or HTTPS)
just tunnel       # cloudflared tunnel run TheMac (HTTPS at jay-6.kempenich.dev)
just serve        # dev + tunnel in parallel; Ctrl-C kills both
just test         # vitest run
just check        # svelte-check
just build        # vite build
just ci           # check + test + build
just docker-build # local image sanity check (CI does the real push to GHCR)
just deploy       # ./deploy.sh — apply k8s.yaml to current kubectl context
```

### Conventions

- **Style data is structured, not stringly-typed**: see `phrases.ts` for the `ArpVariation` / `PhraseDurationVariation` / `RhythmVariation` types. Pattern strings (`o_o_o~o_…`) are parsed once via `parseRhythmPattern`.
- **Engines are time-source-agnostic**: they count ticks, never call `Date.now()` or `setInterval` themselves. TickSource owns timing.
- **Latch tracking lives in the host**, not in engines. Engines don't know what a pad is. Engine.setNotes is "swap chord, keep timeline"; Engine.start is "fresh start, fire first hit immediately".
- **Tests cover data + math, not UI** (Web MIDI / Svelte 5 mounting are out of scope for vitest). Smoke-test the UI in the browser.
- **Comments**: WHY only. Identifiers do the WHAT.
- **No premature features**: the prototype intentionally skips Web Audio scheduler, velocity, presets, persistence. Phase 3 backlog.

### MIDI / serving caveats

- Web MIDI requires a **secure context**: `localhost` OR HTTPS. LAN IPs over plain `http://` will deny MIDI access in Chrome/Edge.
- iPad Safari + iPad Chrome both lack Web MIDI. Workaround: **"Web MIDI Browser"** (Yonemoto) app on iOS.
- Web MIDI can't be proxied over the Cloudflare tunnel — the OP-1 must be plugged into the same machine as the browser session.

## Reference

- Plan + decision log: [`.research/PLAN.md`](.research/PLAN.md)
- UAT checklist (run via `uat-agent` skill): [`.research/UAT.md`](.research/UAT.md)
- Roland J-6 chord list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- Roland J-6 phrase list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Roland J-6 manual PDF: https://static.roland.com/assets/media/pdf/J-6_eng02_W.pdf
- Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- WEBMIDI.js v3 docs: https://webmidijs.org/docs/

## Updating this file

Edit when:
- A phase / backlog item flips status
- An open question gets resolved
- A new conventional decision lands (engine pattern, file layout, etc.)

Don't make it long. If a section grows past two screens, move detail into `.research/`.
