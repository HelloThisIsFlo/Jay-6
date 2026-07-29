# Milestones

## v1.0 MVP (Shipped: 2026-05-23)

**Delivered:** The full Roland J-6 chord-pad experience in the browser, driving the OP-1 over USB MIDI — pick a bank, press a pad (mouse or keyboard), cycle 6 playback styles, latch, and sync transport both ways. **UAT 11/11 PASS on hardware.**

**Scope:** 2 phases (Phase 1 prototype — retrospective, no plan files; Phase 2 polish + acceptance — 9 plans, 19 tasks), 31/31 v1 requirements validated.

**Stats:**

- ~2,133 LOC TS/Svelte · 45/45 unit tests green
- 98 commits · 2026-05-16 → 2026-05-23 (7 days)
- Git range: `3468605` → `0ba1973`

**Key accomplishments:**

- **End-to-end J-6 → OP-1 loop** (Phase 1) — 100 banks × 12 chords, 6 playback styles (Hold / Arp 1 / Arp 2 / Beat / Rhythm Gate 4 / 5), latch, full Ableton-style keyboard control.
- **Bidirectional MIDI transport sync** — 24 PPQ clock send as master (Int), Start/Stop/Continue/Record receive as slave (Ext), with next-downbeat alignment on all three rhythmic engines, 200 ms double-trigger guard, and mode-switch hard stop.
- **Ext-clock phase alignment** — `ticksUntilDownbeatFrom` pure-math helper anchors the first audible step to the OP-1's bar downbeat (no more +278 ms off-beat first hit).
- **Reliable clear-all/panic path** — `host.panic()` wipes engine state + clears all pad highlights, wired to mode-switch, transport-stop, input-disconnect (Ext→Int fallback), and browser-unload — no stuck pads, no hanging notes. Pad release fires on every pointer-end path.
- **iPad/iPhone ergonomics** — app-wide touch text-selection suppressed (inputs still editable), black-key contrast, iPhone-landscape keyboard reachability; `Space`/arrows no longer scroll the page.
- **Voicing audit + consumer manual** — ~30% inferred `banks.data.json` slots tightened against the manual/hardware; `MANUAL.md` shipped at repo root in consumer-product voice.

**Known deferred items at close:** 5 (see STATE.md → Deferred Items) — all intentional v2/polish captures, none blocking.

**Archives:** `milestones/v1.0-ROADMAP.md` · `milestones/v1.0-REQUIREMENTS.md`

---
