# Jay-6 — UAT Checklist

> Methodical hand-test of every shipped feature. Walk top-to-bottom, flip checkboxes inline, drop notes in the **Notes** field. Run via the `uat-agent` skill (say "run uat") or solo.

Legend: `- [ ]` not run · `- [x]` pass · `- [~]` fail · `- [-]` skipped / blocked

---

## 1. Connectivity

**Setup**: OP-1 plugged in via USB, browser open at `localhost`, Chrome or Edge.

- [ ] OP-1 appears in **Output** dropdown
- [ ] **Channel** dropdown lists 1–16, select changes target channel (verify: switch to a channel OP-1 doesn't listen on → no sound; switch back → sound)
- [ ] OP-1 appears in **Input** dropdown

**Notes**:

---

## 2. Bank navigation

**Setup**: any port + channel selected.

- [ ] All 100 banks reachable via the **Bank** dropdown
- [ ] `‹` / `›` arrow buttons step ±1
- [ ] `←` / `→` keys step ±1
- [ ] Wrap-around: at Bank 100 → `›` lands on Bank 1, at Bank 1 → `‹` lands on Bank 100

**Notes**:

---

## 3. Chord pads

**Setup**: Bank 1 (Cadd9 family), Style = Hold.

- [ ] 12 pads visible in J-6 5-black / 7-white layout
- [ ] Pad labels show real Roland chord names (Bank 1: `Cadd9`, `Dm7`, etc.)
- [ ] Click pad → MIDI to OP-1, release → note off
- [ ] Pressed pad fills J-6 orange while held
- [ ] Bank 14 (Oct Stack) → pads show fallback `C Oct Stack` / `D Oct Stack` / etc.
- [ ] Bank 15 (4th Stack) + Bank 16 (5th Stack) → same fallback pattern

**Notes**:

---

## 4. Transpose

**Setup**: Bank 1, Style = Hold, press a pad to hear baseline pitch.

- [ ] `-12` button drops one octave
- [ ] `+12` button raises one octave
- [ ] `Z` key = down 1 octave, `X` key = up 1 octave
- [ ] Clamp at `-36` (further presses do nothing, pitch unchanged)
- [ ] Clamp at `+36` (same)

**Notes**:

---

## 5. BPM

**Setup**: Style = Arp 1 (any variation), a pad held so the arp runs.

- [ ] Default BPM = 110 on load
- [ ] Range: input accepts 40 (slowest) through 240 (fastest)
- [ ] Live change: nudge BPM up/down while arp is running → tempo updates audibly without restart

**Notes**:

---

## 6. Style: Hold

**Setup**: Style = Hold, Bank 1.

- [ ] Press = note on, release = note off
- [ ] No engine ticking / clock activity (silent when no pad held)

**Notes**:

---

## 7. Style: Arp 1 (8th)

**Setup**: Style = Arp 1, Bank 1, hold a pad.

Walk through all 12 variations. Check direction (UP / UP&DOWN / DOWN), octave range (1 vs 2), triplet flag.

- [ ] V01 — direction + octave + triplet match name + sound
- [ ] V02 — same
- [ ] V03 — same
- [ ] V04 — same
- [ ] V05 — same
- [ ] V06 — same
- [ ] V07 — same
- [ ] V08 — same
- [ ] V09 — same
- [ ] V10 — same
- [ ] V11 — same
- [ ] V12 — same
- [ ] Subdivision audibly = 8th-note rate at current BPM

**Notes**:

---

## 8. Style: Arp 2 (16th)

**Setup**: Style = Arp 2, Bank 1, hold a pad.

Same matrix at 16th-note rate.

- [ ] V01 — direction + octave + triplet match
- [ ] V02
- [ ] V03
- [ ] V04
- [ ] V05
- [ ] V06
- [ ] V07
- [ ] V08
- [ ] V09
- [ ] V10
- [ ] V11
- [ ] V12
- [ ] Subdivision audibly = 16th-note rate at current BPM

**Notes**:

---

## 9. Style: Phrase Duration (Style 3)

**Setup**: Style = Phrase Dur, Bank 1, hold a pad (or latch).

Sustain length should match the variation name (double-whole → 16th, plus triplet variants).

- [ ] V01 — sustain length matches name
- [ ] V02
- [ ] V03
- [ ] V04
- [ ] V05
- [ ] V06
- [ ] V07
- [ ] V08
- [ ] V09
- [ ] V10
- [ ] V11
- [ ] V12

**Notes**:

---

## 10. Style: Rhythm Gate 4

**Setup**: Style = Rhythm Gate 4, Bank 1, hold a pad.

- [ ] V01 — plays audibly, distinct rhythm
- [ ] V02
- [ ] V03
- [ ] V04
- [ ] V05
- [ ] V06
- [ ] V07
- [ ] V08
- [ ] V09
- [ ] V10
- [ ] V11
- [ ] V12

**Notes**:

---

## 11. Style: Rhythm Gate 5

**Setup**: Style = Rhythm Gate 5, Bank 1, hold a pad.

- [ ] V01 — plays audibly, distinct rhythm
- [ ] V02
- [ ] V03
- [ ] V04
- [ ] V05
- [ ] V06
- [ ] V07
- [ ] V08
- [ ] V09
- [ ] V10
- [ ] V11
- [ ] V12

**Notes**:

---

## 12. Gate slider ⚠️

> **Flagged suspect**: feels inert on current build.

**Setup**: Style = Rhythm Gate 4 V01 (or any pattern with clear single hits), Bank 1, hold a pad, BPM ~110.

- [ ] Gate = 10% → hits are ultra-staccato (clearly clipped before next step)
- [ ] Gate = 50% → hits sustain about half a step
- [ ] Gate = 100% → hits sustain right up to next step
- [ ] Difference between 10% and 100% is audible on OP-1

If indistinguishable: note whether the MIDI note-off timing actually changes (browser dev tools / MIDI monitor) — distinguishes a code bug from OP-1 synth-envelope masking.

**Notes**:

---

## 13. Latch

**Setup**: Style = Hold (easiest to hear), Bank 1.

- [ ] Top-bar **Latch** button toggles latch on
- [ ] `Space` key also toggles latch
- [ ] Press a pad → chord stays sounding after release
- [ ] Latched pad stays orange after release
- [ ] Same-pad re-press retriggers (J-6 HOLD convention)
- [ ] Press a different pad → chord swaps smoothly, no engine restart artifact
- [ ] Toggle latch off → highlight clears, sound stops

**Notes**:

---

## 14. Keyboard shortcuts

**Setup**: window focused, no input field selected.

- [ ] Whites: `A`=C, `S`=D, `D`=E, `F`=F, `G`=G, `H`=A, `J`=B
- [ ] Blacks: `W`=C#, `E`=D#, `T`=F#, `Y`=G#, `U`=A#
- [ ] `Z` / `X` transpose ±12
- [ ] `←` / `→` bank prev / next
- [ ] `Space` toggle latch
- [ ] `1`–`6` switch style

**Notes**:

---

## 15. MIDI clock receive

**Setup**: OP-1 selected as Input, Style = Arp 1 (so tempo is audible).

- [ ] Click **Ext** (Int/Ext toggle) → BPM input disables
- [ ] Hit play on OP-1 → engines slave to OP-1 tempo (audibly tracks OP-1 BPM)
- [ ] Switch OP-1 tempo → Jay-6 follows
- [ ] Switch back to **Int** → BPM input re-enables, engines re-use internal clock

**Notes**:

---

## 16. Bank label fallback

**Setup**: Bank 14 (Oct Stack).

- [ ] Pad C → `C Oct Stack`
- [ ] Pad D → `D Oct Stack`
- [ ] Pad C# → `C# Oct Stack`
- [ ] All 12 pads use the `<key> <bankName>` pattern

**Notes**:

---

## 17. LAN + tunnel

**Setup**: stop dev server first.

- [ ] `just dev-lan` starts vite on `0.0.0.0`
- [ ] iPad on same LAN reaches the app at the LAN IP (view-only — MIDI denied over plain http, expected)
- [ ] `just serve` starts vite + Cloudflare tunnel
- [ ] `https://jay-6.kempenich.dev` loads the app (requires dashboard hostname config — see CURRENT-STATE.md Phase 2)

**Notes**:

---

## 18. iPad (Web MIDI Browser)

**Setup**: "Web MIDI Browser" app by Yonemoto installed on iPad, OP-1 plugged into iPad via camera kit.

- [ ] App loads `https://jay-6.kempenich.dev`
- [ ] OP-1 appears in Output dropdown
- [ ] Pads send MIDI → OP-1 plays

**Notes**:

---

## 19. Edge cases

- [ ] Unplug OP-1 mid-session → Output dropdown refreshes (port disappears)
- [ ] Re-plug OP-1 → port reappears in dropdown, selectable
- [ ] Switch style while a pad is held → audio transitions cleanly, no stuck notes
- [ ] Browser refresh → state resets to defaults (Bank 1, Style Hold, BPM 110, latch off)

**Notes**:

---

## Results summary

| Section | Pass | Fail | Skip | Not run |
|---|---|---|---|---|
| 1. Connectivity | | | | |
| 2. Bank navigation | | | | |
| 3. Chord pads | | | | |
| 4. Transpose | | | | |
| 5. BPM | | | | |
| 6. Hold | | | | |
| 7. Arp 1 | | | | |
| 8. Arp 2 | | | | |
| 9. Phrase Dur | | | | |
| 10. Rhythm Gate 4 | | | | |
| 11. Rhythm Gate 5 | | | | |
| 12. Gate slider | | | | |
| 13. Latch | | | | |
| 14. Keyboard | | | | |
| 15. Clock receive | | | | |
| 16. Bank fallback | | | | |
| 17. LAN + tunnel | | | | |
| 18. iPad | | | | |
| 19. Edge cases | | | | |
| **Total** | | | | |

### Bugs surfaced

_Append dated entries here as runs complete. Format: `YYYY-MM-DD — <section> — <bug>`._

### Run log

_Append one line per UAT session: `YYYY-MM-DD — <sections covered> — <pass/fail/skip counts>`._
