# Context Intel

> Running notes from DOC-type sources (`CLAUDE.md`, `CURRENT-STATE.md`, `README.md`, `TUNNEL-SETUP.md`). Captured verbatim with attribution; intent is to preserve framing, rationale, and onboarding signal that doesn't fit into decisions / requirements / constraints buckets.

---

## Topic: Project identity & goal

- **Jay-6** = the Roland J-6 spelled out. Same idea, different surface. *(source: `README.md`)*
- One-line goal: "Browser app where Flo clicks chord pads → MIDI flows out → OP-1 plays." *(source: `.research/PLAN.md`)*
- TL;DR: Browser app. Click chord pads → MIDI flows out → OP-1 (or any MIDI synth) plays. *(source: `CURRENT-STATE.md`)*
- Built so Flo could drive the OP-1 with the J-6's beautiful chord library without buying the hardware. *(source: `README.md`)*

## Topic: Current status snapshot

- Prototype shipped + verified on hardware. Now in post-prototype polish. *(source: `CURRENT-STATE.md`)*
- Phase 1 milestones M1–M8 + keyboard shortcuts all shipped and verified on OP-1 over USB MIDI. Subjective "fun to play" passed. *(source: `CURRENT-STATE.md`)*
- Phase 2 closes once UAT passes. *(source: `CURRENT-STATE.md` + `.research/PLAN.md`)*
- Style 3 (Phrase Dur, 12 variations) shipped alongside M4/M5 since they share the engine + clock pattern. *(source: `CURRENT-STATE.md`)*

## Topic: Stack at a glance

- Vite 6 + Svelte 5 (runes: `$state`, `$derived`, `$effect`) + TypeScript strict + Vitest 2 + WEBMIDI.js v3. *(source: `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`)*
- Cloudflare tunnel + Just for serve/expose. *(source: `CURRENT-STATE.md`)*
- Chrome/Edge desktop for Web MIDI. iPad needs Yonemoto's "Web MIDI Browser" app. *(source: `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`)*

## Topic: Documentation entry points

- `CURRENT-STATE.md` = roadmap, what's shipped, what's next, conventions, file layout, architecture-in-a-paragraph. Read this first. *(source: `CLAUDE.md`)*
- `.research/PLAN.md` = original plan + decision log. *(source: `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`)*
- `.research/UAT.md` = feature-by-feature hand-test checklist. Say "run uat" to trigger the `uat-agent` skill that walks Flo through it. *(source: `CLAUDE.md`, `CURRENT-STATE.md`)*
- `TUNNEL-SETUP.md` = K8s + Cloudflare deployment runbook. *(source: `CURRENT-STATE.md`)*

## Topic: How to run

- `just dev` (localhost — use this for Web MIDI dev). *(source: `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`)*
- `just serve` = Vite + Cloudflare tunnel → `https://jay-6.kempenich.dev` from this Mac. *(source: `CLAUDE.md`, `CURRENT-STATE.md`, `README.md`)*
- Always-on at `https://jay-6.kempenich.ai` (home K8s cluster). *(source: `CURRENT-STATE.md`, `TUNNEL-SETUP.md`)*

## Topic: File layout

*(source: `CURRENT-STATE.md` "Where things live")*

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

## Topic: Architecture in a paragraph

> `midi.ts` owns WebMidi I/O. `tickSource.ts` is the heartbeat — 24 ticks per quarter, sourced either from an internal `setInterval` (BPM-driven) or from an external MIDI input port's `clock` events. Every time-driven engine (`arp`, `phraseDuration`, `rhythmGate`) subscribes to TickSource and fires on its own tick modulus (8th = 12 ticks, 16th = 6, triplet 8th = 8, …). `engines/host.ts` is the orchestrator: pad press goes through the active engine, with latch + transpose applied at the boundary. `state.svelte.ts` holds reactive UI state; `App.svelte` bridges every state field into the host / tick source via `$effect`. *(source: `CURRENT-STATE.md`)*

## Topic: Phase 1 — what shipped

*(source: `CURRENT-STATE.md`)*

- **M1 Data**: 100 Roland J-6 chord banks (`src/banks.data.json` via two-extraction diff). Style 1–5 phrase data (`src/phrases.ts`).
- **M2 MIDI**: WEBMIDI.js plumbing, output port + channel select, `playChord` / `releaseChord`.
- **M3 Chord pads**: 12 pads in J-6's 5-black + 7-white layout, bank selector + arrows, J-6 orange held-pad fill.
- **M4 Arp**: Style 1 (8th) + Style 2 (16th), 24 variations total, direction × octave-range × triplet.
- **M5 Rhythm gate**: Style 4 + Style 5, 24 explicit `o`/`_`/`~` patterns, gate-length slider.
- **M6 Clock**: Shared BPM, on-demand start, triplet-aware step math.
- **M7 Latch**: J-6 HOLD convention — same-pad re-press retriggers, different pad swaps smoothly, latch button toggles off.
- **Keyboard**: Ableton Computer-MIDI mapping (full table in CON-keyboard-mapping).
- **M8 OP-1 hands-on**: banks + rhythm + latch + transpose all play through cleanly.

## Topic: Phase 2 — done

*(source: `CURRENT-STATE.md`)*

- MIDI clock receive (slave to OP-1): TickSource at 24 PPQ, Input port + Int/Ext toggle in top bar.
- Latched pad stays highlighted.
- LAN exposure (`vite --host`, `allowedHosts: true`).
- Justfile recipes shipped (`dev`, `tunnel`, `serve`, `test`, `check`, `build`, `ci`).
- Cloudflare tunnel → `jay-6.kempenich.dev`. Public hostname live; `just serve` routes tunnel → `localhost:5173`.
- K8s deploy → `https://jay-6.kempenich.ai`. `Dockerfile` (nginx:alpine) + `k8s.yaml` + GHCR Action + `./deploy.sh`.

## Topic: Phase 2 — open

*(source: `CURRENT-STATE.md` + `.research/PLAN.md`)*

- **Rhythm pattern phase alignment under external clock** (bug): engine `start()` fires immediately → off-beat under OP-1 clock. Fix: anchor first step to next `tick-mod-24` boundary or restart on transport `start`.
- **Transport sync + clock send** (Start/Stop/Continue/Record): 24 PPQ out + react to OP-1 transport → drive Jay-6 engines. Likely folds with the alignment fix.
- **Voicing data second-pass audit**: open. Flo to explore separately. Goal: tighten the ~30% inferred slots.
- **iPad polish (second pass)**: text-selection on long-press → add `user-select: none`. Touch ergonomics worth a re-review.
- **UAT walkthrough**: checklist + skill ready, not yet run. Gates Phase 2 close.

## Topic: Phase 3 — TBD

- Sequencer (primary candidate). Detail TBD. *(source: `CURRENT-STATE.md`, `.research/PLAN.md`)*

## Topic: Backlog (no commitment)

*(source: `CURRENT-STATE.md`, `.research/PLAN.md`)*

- M9 Style 6–9 phrases: Roland publishes no note data. Options: skip / roll own / reverse-engineer.
- Velocity control.
- Persist last bank / BPM / port.
- Save/recall favorite presets.

## Topic: Open / unresolved questions

- **Phrase styles 6–9** (needed by M9, post-prototype): Roland publishes no note data for Chord Phrases / Strummed Chord Phrases. Options: skip, roll own, reverse-engineer. *(source: `.research/PLAN.md`)*
- **Roland chord voicing fidelity** (needed by M8): two independent WebFetch extractions of the Roland chord-set page diverged on note values for ~30% of the 1,200 chord slots. Shipped the more internally consistent run. Both pass PLAN sanity checks (Bank 1 Cadd9, Bank 14 Oct Stack). If voicings sound off on OP-1, spot-fix against the manual PDF or hardware reference. *(source: `.research/PLAN.md`)*

## Topic: Onboarding conventions (load-bearing)

*(source: `CLAUDE.md`)*

- Engines subscribe to `tickSource` (24 PPQ); they never own timers.
- UI state lives in `src/state.svelte.ts` (`$state` runes). `App.svelte` bridges to imperative host + tickSource via `$effect`.
- `src/banks.data.json` is the verified Roland extraction — don't edit by hand; if voicings need correcting, fix the JSON.
- No premature features (no Web Audio scheduler, no presets, no persistence — Phase 3 backlog).
- Comments: WHY only. Don't restate the code.
- After meaningful changes: update `CURRENT-STATE.md` so the next agent (or future-you) lands oriented.

## Topic: When to update `CURRENT-STATE.md`

*(source: `CURRENT-STATE.md` "Updating this file")*

- A phase / backlog item flips status.
- An open question gets resolved.
- A new conventional decision lands (engine pattern, file layout, etc.).
- Don't make it long. If a section grows past two screens, move detail into `.research/`.

## Topic: Cloudflare Tunnel routing detail

*(source: `TUNNEL-SETUP.md`)*

- The app is exposed via the existing cluster Cloudflare Tunnel at `https://jay-6.kempenich.ai`.
- Tunnel = cluster-wide tunnel (also serves `sketchpad.kempenich.ai`, `gprmax.kempenich.ai`).
- Configuration location: [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) > Networks > Tunnels > _tunnel_ > Public Hostname.
- Public hostname route record:
  - Subdomain: `jay-6`
  - Domain: `kempenich.ai`
  - Path: _(empty)_
  - Service Type: HTTP
  - URL: `jay-6.jay-6.svc.cluster.local:80`
- Local-only alternative: `just serve` runs Vite + Cloudflare tunnel → `https://jay-6.kempenich.dev` from this Mac. Use when OP-1 is plugged into the same machine as the browser (Web MIDI can't be proxied across the cluster).
- Cleanup: remove the `jay-6.kempenich.ai` entry from the tunnel's Public Hostname tab → run `./cleanup.sh` to delete the K8s namespace.

## Topic: External reference URLs

*(source: `CURRENT-STATE.md`, `.research/PLAN.md`, `README.md`)*

- Roland J-6 chord list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
- Roland J-6 phrase list: https://static.roland.com/manuals/J-6_manual_v102/eng/28645808.html
- Roland J-6 manual PDF: https://static.roland.com/assets/media/pdf/J-6_eng02_W.pdf
- Roland J-6 product page: https://www.roland.com/global/products/j-6/
- Web MIDI API (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- WEBMIDI.js v3 docs: https://webmidijs.org/docs/

## Topic: Browser support matrix

*(source: `README.md`)*

- Chrome / Edge (desktop): ✅ Web MIDI supported
- Firefox: ❌ no Web MIDI
- Safari: ❌ no Web MIDI
- iPad (any built-in browser): ❌ iOS lacks Web MIDI
- iPad via "Web MIDI Browser" app: ✅ works
- Note: Web MIDI requires a secure context — `localhost` or HTTPS. Plain `http://` LAN IPs will be denied.

## Topic: Feature list (marketing-style summary)

*(source: `README.md`)*

- All 100 Roland J-6 chord banks, 12 chords each — extracted straight from Roland's manual.
- 12-pad piano layout mirroring the J-6 hardware (5 black on top, 7 white on bottom).
- 5 playback styles: Hold · Arp 8th · Arp 16th · Phrase Duration · Rhythm Gate × 2 — 60 variations total.
- Latch that follows the J-6 HOLD convention (same-pad re-press retriggers).
- Ableton-style keyboard shortcuts.
- External MIDI clock receive (slave to OP-1's tempo).
- Transpose, gate length, BPM, per-channel output.
