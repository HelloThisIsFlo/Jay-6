---
status: testing
phase: 02-post-prototype-polish-uat-acceptance
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, .research/UAT.md]
started: 2026-05-18T22:13:39Z
updated: 2026-05-18T22:13:39Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running vite. Hard-reload the page (Cmd-Shift-R) so no warm state survives. `just dev` boots without errors; app loads at localhost:5173; defaults visible (Bank 1 Cadd9, Style Hold, BPM 110, latch off); no console errors.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running vite. Hard-reload the page (Cmd-Shift-R) so no warm state survives.
  `just dev` boots without errors; app loads at localhost:5173; defaults visible
  (Bank 1 Cadd9, Style Hold, BPM 110, latch off); no console errors.
result: [pending]

### 2. Connectivity
expected: |
  Setup: OP-1 plugged in via USB, Chrome/Edge at localhost.
  - OP-1 appears in Output dropdown
  - Channel dropdown lists 1–16; switching to a channel OP-1 doesn't listen on kills sound, switching back restores it
  - OP-1 appears in Input dropdown
result: [pending]

### 3. Bank Navigation
expected: |
  - All 100 banks reachable via Bank dropdown
  - `‹` / `›` buttons step ±1
  - `←` / `→` keys step ±1
  - Wrap-around: Bank 100 `›` → Bank 1; Bank 1 `‹` → Bank 100
result: [pending]

### 4. Chord Pads
expected: |
  Bank 1 (Cadd9 family), Style Hold.
  - 12 pads visible in J-6 5-black / 7-white layout
  - Labels show real Roland names (Bank 1: Cadd9, Dm7, etc.)
  - Click pad → MIDI to OP-1; release → note off
  - Pressed pad fills J-6 orange while held
  - Bank 14 (Oct Stack) → pads show fallback `C Oct Stack` / `D Oct Stack` etc.
  - Bank 15 (4th Stack) + Bank 16 (5th Stack) → same fallback pattern
result: [pending]

### 5. Transpose
expected: |
  Bank 1, Hold, press pad for baseline pitch.
  - `-12` button drops one octave
  - `+12` button raises one octave
  - `Z` = down 1 octave; `X` = up 1 octave
  - Clamp at `-36` (further presses no-op)
  - Clamp at `+36` (same)
result: [pending]

### 6. BPM
expected: |
  Style Arp 1, pad held so arp runs.
  - Default BPM = 110 on load
  - Range accepts 40 through 240
  - Live change: nudge BPM up/down while arp running → tempo updates audibly without restart
result: [pending]

### 7. Style: Hold
expected: |
  Bank 1, Style Hold.
  - Press = note on; release = note off
  - No engine ticking / clock activity (silent when no pad held)
result: [pending]

### 8. Style: Arp 1 (8th) — 12 variations
expected: |
  Bank 1, Style Arp 1, hold a pad.
  Walk all 12 variations (V01–V12). For each: direction (UP / UP&DOWN / DOWN), octave range (1 vs 2), and triplet flag match the name + audibly match the sound.
  Final check: subdivision audibly = 8th-note rate at current BPM.
result: [pending]

### 9. Style: Arp 2 (16th) — 12 variations
expected: |
  Bank 1, Style Arp 2, hold a pad.
  Same matrix as Arp 1 at 16th-note rate. All 12 variations match name + sound.
  Subdivision audibly = 16th-note rate at current BPM.
result: [pending]

### 10. Style: Phrase Duration — 12 variations
expected: |
  Bank 1, Style Phrase Dur, hold (or latch) a pad.
  All 12 variations: sustain length matches the variation name (double-whole → 16th, plus triplet variants).
result: [pending]

### 11. Style: Rhythm Gate 4 — 12 variations
expected: |
  Bank 1, Style Rhythm Gate 4, hold a pad.
  All 12 variations play audibly with distinct rhythms.
result: [pending]

### 12. Style: Rhythm Gate 5 — 12 variations
expected: |
  Bank 1, Style Rhythm Gate 5, hold a pad.
  All 12 variations play audibly with distinct rhythms.
result: [pending]

### 13. Gate Slider ⚠️ (flagged suspect)
expected: |
  Style Rhythm Gate 4 V01 (or any pattern with clear single hits), Bank 1, pad held, BPM ~110.
  - Gate = 10% → hits ultra-staccato (clearly clipped before next step)
  - Gate = 50% → hits sustain about half a step
  - Gate = 100% → hits sustain right up to next step
  - 10% vs 100% audibly different on OP-1

  If indistinguishable: check whether MIDI note-off timing actually changes via browser dev tools / MIDI monitor — distinguishes code bug from OP-1 envelope masking.
result: [pending]

### 14. Latch
expected: |
  Style Hold, Bank 1.
  - Top-bar Latch button toggles latch on
  - `Space` also toggles latch
  - Press pad → chord stays sounding after release
  - Latched pad stays orange after release
  - Same-pad re-press retriggers (J-6 HOLD convention)
  - Press different pad → chord swaps smoothly, no engine restart artifact
  - Toggle latch off → highlight clears, sound stops
result: [pending]

### 15. Keyboard Shortcuts
expected: |
  Window focused, no input field selected.
  - Whites: `A`=C, `S`=D, `D`=E, `F`=F, `G`=G, `H`=A, `J`=B
  - Blacks: `W`=C#, `E`=D#, `T`=F#, `Y`=G#, `U`=A#
  - `Z` / `X` transpose ±12
  - `←` / `→` bank prev/next
  - `Space` toggle latch
  - `1`–`6` switch style
result: [pending]

### 16. MIDI Clock + Transport Sync (the big one)
expected: |
  Setup: OP-1 as Input, Style Arp 1.

  Receive (Ext):
  - Click Ext → BPM input disables
  - OP-1 Play → engines slave to OP-1 tempo, audibly track BPM
  - Change OP-1 tempo → Jay-6 follows
  - Switch back to Int → BPM input re-enables; engines use internal clock again

  Send (Int):
  - In Int mode, OP-1 sees Jay-6's clock (OP-1 tempo indicator locks to Jay-6 BPM)

  Phase 2 wiring (plan 02-04):
  - Ext mode, pad press during playback → rhythm engine's first hit lands on the NEXT downbeat (not immediately) — locks to OP-1 grid (D-06)
  - OP-1 Record button → treated as Start (Jay-6 arms rhythm engines + pattern resets to step 0) (D-04)
  - Switch Int → Ext mid-play → all notes off + engine stops + latch clears (hard panic by design, D-03)
  - Double-trigger guard: repeated OP-1 Start within 200ms does NOT double-fire (no audible stutter) (D-05)
  - Ext mode: downstream device receives NO clock pulses from Jay-6 (only listens — does not echo) (Pitfall 8)
result: [pending]

### 17. Bank Label Fallback
expected: |
  Bank 14 (Oct Stack).
  - Pad C → `C Oct Stack`
  - Pad D → `D Oct Stack`
  - Pad C# → `C# Oct Stack`
  - All 12 pads use the `<key> <bankName>` pattern
result: [pending]

### 18. LAN + Tunnel
expected: |
  Stop dev server first.
  - `just dev-lan` starts vite on `0.0.0.0`
  - iPad on same LAN reaches app at LAN IP (view-only — MIDI denied over plain http, expected)
  - `just serve` starts vite + Cloudflare tunnel
  - `https://jay-6.kempenich.dev` loads the app
  - `https://jay-6.kempenich.ai` (always-on k8s) loads the app (live HTTP 200 already confirmed in plan 02-01)
result: [pending]

### 19. iPad (Web MIDI Browser)
expected: |
  "Web MIDI Browser" app (Yonemoto) installed on iPad, OP-1 plugged via camera kit.
  - App loads `https://jay-6.kempenich.dev`
  - OP-1 appears in Output dropdown
  - Pads send MIDI → OP-1 plays
  - iPad polish (plan 02-03): no text-selection on long-press; 44pt min targets feel comfortable; black pads readable against dark frame; no rubber-band scroll on body
result: [pending]

### 20. Edge Cases
expected: |
  - Unplug OP-1 mid-session → Output dropdown refreshes (port disappears)
  - Re-plug OP-1 → port reappears, selectable
  - Switch style while pad held → audio transitions cleanly, no stuck notes
  - Browser refresh → state resets to defaults (Bank 1, Hold, BPM 110, latch off)
  - Hot-plug under Ext mode → no crash, transport state coherent
result: [pending]

## Summary

total: 20
passed: 0
issues: 0
pending: 20
skipped: 0
blocked: 0

## Gaps

[none yet]
