<!-- Jay-6 user manual. Sections are H1 by design — D-14 locks the four top-level
     sections, each must grep as ^# Heading. Future v2 adds Section 5 (Sequencer)
     here without rewriting 1-4 (D-13). -->

> Jay-6 — browser-based Roland J-6. Chord pads, 5 playback styles, MIDI out to your gear.

Jump to: [Setup](#setup) · [Pads + chords](#pads--chords) · [Styles](#styles) · [Clock + transport sync](#clock--transport-sync)

---

# Setup

You need Chrome or Edge on desktop. Other browsers don't ship Web MIDI.

| Browser | Works? |
|---|---|
| Chrome / Edge (desktop) | ✅ |
| Firefox / Safari (desktop) | ❌ — no Web MIDI |
| iPad (Safari, Chrome, Edge) | ❌ — iOS lacks Web MIDI |
| iPad via **Web MIDI Browser** app (Yonemoto) | ✅ |

Web MIDI also requires a secure context — `localhost` or HTTPS. Plain `http://` LAN IPs won't get MIDI access.

**Where to open it.**

| Surface | URL | When to use |
|---|---|---|
| Local dev | `http://localhost:5173` | `just dev` from the repo |
| Cloudflare tunnel | `https://jay-6.kempenich.dev` | `just serve` — HTTPS for iPad / phone on same Wi-Fi |
| Always-on | `https://jay-6.kempenich.ai` | Anywhere — but MIDI goes to the OP-1 plugged into the machine running the browser, not to a remote one |

**First-load flow.**

1. Open the app — browser pops a MIDI permission prompt. Grant it.
2. **Output** dropdown lists every MIDI device on this machine. Pick the OP-1 (or any synth).
3. **Channel** picks the MIDI channel (default 1). The OP-1 listens on omni by default, so 1 is usually fine.
4. **Input** is optional — only needed for external clock (see [Clock + transport sync](#clock--transport-sync)).

**iPad.** Install "Web MIDI Browser" by Yonemoto from the App Store, open `https://jay-6.kempenich.dev` inside it, plug the OP-1 in via camera-kit cable. The OP-1 shows up in the Output dropdown.

---

# Pads + chords

**100 banks.** Pop, ballad, jazz, EDM — the full Roland J-6 factory set. Each bank holds 12 chords laid out as 5 black + 7 white pads, just like the hardware.

**Navigate banks.**

- Dropdown — pick any bank by name (`01 — Pop` through `100 — …`)
- `‹` / `›` arrows — step ±1
- `←` / `→` keys — same, hands-on-keyboard
- Wraps at the ends (Bank 100 `›` → Bank 1)

**Play a chord.** Click a pad — chord on. Release — chord off. Pads fill J-6 orange while held.

**Transpose.** `−12` / `+12` buttons or `Z` / `X` keys shift by an octave. Clamped at ±36 semitones (three octaves either way) — further presses do nothing.

**Latch.** Two ways to toggle:

- Top-bar **Latch** button
- `Space` key

With latch on, press a pad → chord stays sounding after you release. The pad keeps its orange highlight. Same-pad re-press retriggers (Roland's HOLD convention). Different pad → chord swaps cleanly mid-flight, no engine restart artifact. Toggle latch off → highlight clears, sound stops.

**Keyboard.** Ableton "Computer MIDI Keyboard" layout — play without a mouse.

| Keys | Pads |
|---|---|
| `A` `S` `D` `F` `G` `H` `J` | White pads — C D E F G A B |
| `W` `E` `T` `Y` `U` | Black pads — C♯ D♯ F♯ G♯ A♯ |
| `Z` / `X` | Transpose ±1 octave |
| `←` / `→` | Bank prev / next |
| `Space` | Toggle latch |
| `1` – `6` | Switch style |

---

# Styles

Six styles. Each turns held chords into something different.

**Hold.** Just plays the chord. No rhythm, no clock activity. Press = on, release = off. Default — start here.

**Arp (Style 1, 8th).** Arpeggiates the chord in 8th notes. 12 variations cover direction (up / up-down / down) × octave range (1 or 2) × triplet feel on/off. V01 is plain up, one octave, straight 8ths. V07–V12 are the same matrix with triplets.

**Arp (Style 2, 16th).** Same matrix as Style 1 but at 16th-note rate — twice as busy. Good for fast tempos or sparse chords.

**Phrase Dur (Style 3).** Re-triggers the whole chord at a fixed musical length. 12 variations cover double-whole / whole / half / quarter / 8th / 16th, with triplet counterparts. Useful for slow pads (whole / half) or repeated stabs (16th).

**Rhythm Gate (Style 4).** Plays the chord in a 16-step pattern — 12 patterns total, each emphasising a different feel (4-on-the-floor, syncopated, dotted). Pair with the **Gate** slider that appears in the top bar: 10% = ultra-staccato hits, 100% = each hit sustains right up to the next step.

**Rhythm Gate (Style 5).** Same engine, different pattern bank — 12 more patterns leaning toward broken / off-grid feels. Same Gate slider.

---

# Clock + transport sync

Two modes, picked with the **Int / Ext** toggle in the top bar.

**Int — Jay-6 is the master.** Jay-6 owns the clock. Set the tempo with the **BPM** input. Jay-6 sends 24 PPQ clock + Start/Stop out continuously so any slaved gear locks to it. Engines fire immediately when you press a pad (live-instrument feel).

**Ext — Jay-6 is the slave.** Jay-6 follows incoming MIDI clock from the device selected in the **Input** dropdown. **BPM** input disables. Rhythm engines wait for the next downbeat after Start before firing their first hit, so patterns lock to the external grid. Chord-pad presses still fire immediately — Jay-6 stays a live instrument, not a step sequencer.

**Four scenarios at a glance.**

| Jay-6 mode | OP-1 mode | Who sends clock? | Pad press behavior |
|---|---|---|---|
| **Int** | slave / listening | Jay-6 → OP-1 | Fires immediately |
| **Ext** | master (or playing) | OP-1 → Jay-6 | Pad fires immediately; rhythm engine arms, first hit on next downbeat |
| **Int** | Int (both) | Neither follows the other | Independent tempos |
| **iPad** | OP-1 plugged into iPad via camera-kit | Same as desktop — depends on Jay-6 toggle | Same as desktop |

**What the transport messages do.**

- **Start** — engines arm, rhythm pattern resets to step 0
- **Stop** — engines stop, all notes off
- **Continue** — engines resume from the saved position
- **OP-1 Record** — treated as Start (so hitting record on the OP-1 also kicks Jay-6 off)

Repeated Start messages within 200ms are ignored — defends against the OP-1's Record + Start chatter doubling up.

**Switching mode mid-play.** Flipping Int ↔ Ext while something's playing stops everything cleanly (all notes off, latch clears). Restart manually. By design — no edge cases.

**iPad workflow.** Web MIDI Browser app → open `https://jay-6.kempenich.dev` → OP-1 plugged into the iPad via camera-kit cable shows up in Output. Pick a mode and play. Note: `https://jay-6.kempenich.ai` loads anywhere, but MIDI only reaches the OP-1 on the same physical machine — Web MIDI can't be proxied.

---

# What's next

Sequencer coming in v2 — section 5 of this manual will document it without changing 1–4.
