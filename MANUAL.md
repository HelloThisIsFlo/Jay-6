<!-- Jay-6 user manual. Sections are H1 by design — D-14 locks the four top-level
     sections, each must grep as ^# Heading (trailing emoji OK). Future v2 adds
     Section 5 (Sequencer) here without rewriting 1–4 (D-13). -->

# Jay-6 🎹

> Browser-based Roland J-6. Pick a bank, press a pad, OP-1 plays the chord.

🔌 [Setup](#setup) · 🎹 [Pads + chords](#pads--chords) · 🎚️ [Styles](#styles) · ⏱️ [Clock + transport sync](#clock--transport-sync)

---

# Setup 🔌

## ✅ What works

| Surface | Works? |
|---|---|
| Chrome / Edge desktop | ✅ |
| Firefox / Safari desktop | ❌ no Web MIDI |
| iPad in stock browsers | ❌ no Web MIDI |
| iPad in **Web MIDI Browser** (Yonemoto, App Store) | ✅ |

⚠️ Needs secure context — `localhost` or `https://`. Plain `http://` LAN won't get MIDI.

## 🌐 Where to open it

| URL | When |
|---|---|
| `http://localhost:5173` | `just dev` from the repo |
| `https://jay-6.kempenich.dev` | `just serve` — HTTPS, your Mac, iPad over Wi-Fi |
| `https://jay-6.kempenich.ai` | Anywhere — but MIDI still goes to the OP-1 plugged into _this_ machine |

## ▶️ First load

- Grant the **MIDI permission prompt**
- **Output** dropdown → pick the OP-1 (or any synth)
- **Channel** → default `1` is fine (OP-1 listens on omni)
- **Input** → only needed for external clock (see below)

## 📱 iPad

- Install **Web MIDI Browser** (Yonemoto) from the App Store
- Open `https://jay-6.kempenich.dev` inside it
- Plug the OP-1 via camera-kit cable
- OP-1 shows up in **Output**

---

# Pads + chords 🎹

## 🗂️ 100 banks

- Full Roland J-6 factory set — pop, ballad, jazz, EDM, the lot
- Each bank = 12 chords on 5 black + 7 white pads (J-6 hardware layout)

## 🔀 Navigate

- 📜 Dropdown — `01 — Pop` through `100 — …`
- ⏪⏩ `‹` / `›` arrows — step ±1
- ⌨️ `←` / `→` keys — same, hands-on-keyboard
- 🔁 Wraps at the ends (Bank 100 `›` → Bank 1)

## 🟧 Play

- 🖱️ Click a pad → chord on
- ✋ Release → chord off
- 🟠 Pads glow J-6 orange while held

## 🎚️ Transpose

- `−12` / `+12` buttons — octave shift
- `Z` / `X` keys — same
- Clamped at **±36 semitones** (3 octaves either way)

## 🔒 Latch

- Toggle: **Latch** button OR `Space` key
- Press pad → chord stays after release, pad keeps orange glow
- Same-pad re-press → retrigger (Roland HOLD convention)
- Different pad → clean swap mid-flight, no engine restart
- Toggle off → glow clears, sound stops

## ⌨️ Keyboard map

Ableton "Computer MIDI Keyboard" layout — play without touching the mouse.

| Keys | Action |
|---|---|
| `A` `S` `D` `F` `G` `H` `J` | White pads — C D E F G A B |
| `W` `E` `T` `Y` `U` | Black pads — C♯ D♯ F♯ G♯ A♯ |
| `Z` / `X` | Transpose ±1 octave |
| `←` / `→` | Bank prev / next |
| `Space` | Toggle latch |
| `1` – `6` | Switch style |

---

# Styles 🎚️

Six styles. Each turns held chords into something different.

## ✋ Hold

- Just plays the chord — no rhythm, no clock
- Press = on, release = off
- 👉 Default. Start here.

## 🔼 Arp 1 (8th notes)

- 12 variations
- Matrix: **direction** (up / up-down / down) × **range** (1 or 2 oct) × **triplet** on/off
- V01 = plain up, 1 oct, straight 8ths
- V07–V12 = same matrix, triplet feel

## 🔼🔼 Arp 2 (16th notes)

- Same matrix as Arp 1, **double the rate**
- 👉 Good for fast tempos or sparse chords

## 🎼 Phrase Dur

- Re-triggers the whole chord at a fixed musical length
- 12 variations: 2× / 1 / ½ / ¼ / 8th / 16th + triplet counterparts
- 👉 Slow pads on the long values; stabs on the short

## ⏱️ Rhythm Gate 4

- Plays the chord on a 16-step pattern — 12 patterns
- Feels: 4-on-the-floor, syncopated, dotted
- Pair with the **Gate** slider
  - `10%` = ultra-staccato hits
  - `100%` = each hit sustains right up to the next step

## ⏱️ Rhythm Gate 5

- Same engine, **12 more patterns**
- Leans toward broken / off-grid feels
- Same Gate slider

---

# Clock + transport sync ⏱️

Pick **Int** or **Ext** with the top-bar toggle.

## 🎛️ Int — Jay-6 is master

- Jay-6 owns the clock
- **BPM** input sets the tempo
- Sends 24 PPQ clock + Start / Stop continuously → any slaved gear locks to Jay-6
- Engines fire **immediately** on pad press (live-instrument feel)

## 🛰️ Ext — Jay-6 is slave

- Jay-6 follows incoming MIDI clock from the **Input** device
- **BPM** input disables — tempo comes from outside
- Rhythm engines **wait for the next downbeat** after Start (patterns lock to the external grid)
- Chord-pad presses still fire immediately — Jay-6 stays a live instrument, not a step sequencer

## 🔄 Four scenarios

| Jay-6 | Other device | Who sends clock | Pad press |
|---|---|---|---|
| **Int** | listening (any synth) | Jay-6 → out | Fires immediately |
| **Ext** | master (OP-1 playing) | OP-1 → Jay-6 | Pad fires now; rhythm arms for next downbeat |
| **Int** | also Int | Neither follows the other | Independent tempos |
| **iPad** | OP-1 via camera-kit | Same as desktop | Same as desktop |

## 📨 Transport messages

- ▶️ **Start** — engines arm, rhythm resets to step 0
- ⏹️ **Stop** — engines stop, all notes off
- ⏯️ **Continue** — resume from saved position
- ⏺️ **OP-1 Record** = Start (hitting Record on the OP-1 also kicks Jay-6 off)

🛡️ Repeated Start within **200 ms** = ignored. Defends against OP-1 Record + Start chatter doubling up.

## 🔁 Switching mid-play

- Flipping **Int ↔ Ext** while something is playing = hard stop
  - All notes off
  - Latch clears
  - Restart manually
- By design — keeps edge cases at zero

## 📱 iPad workflow

- Web MIDI Browser app → open `https://jay-6.kempenich.dev`
- OP-1 via camera-kit → shows up in **Output**
- Pick a mode, play
- ⚠️ `https://jay-6.kempenich.ai` loads anywhere, but MIDI only reaches the OP-1 on the **same physical machine** — Web MIDI can't be proxied

---

# What's next ➡️

🎛️ **Sequencer** lands in v2 — Section 5 of this manual will document it without rewriting 1–4.
