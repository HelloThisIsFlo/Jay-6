<!-- Jay-6 user manual. Sections are H1 by design — D-14 locks the four top-level
     sections, each must grep as ^# Heading (trailing emoji OK). Future v2 adds
     Section 5 (Sequencer) here without rewriting 1–4 (D-13). -->

# Jay-6 — User Manual 🎹

> Roland's J-6 is a £200 chord-pad sketchpad: pick a bank, press a pad, get a properly-voiced chord with the right rhythm style underneath. Jay-6 is that same instrument in a browser, sending MIDI to your OP-1 (or anything else with a MIDI input). No J-6 hardware needed — the factory chord library is built in.

This manual is for **playing** Jay-6. Not for hacking on it.

🔌 [Setup](#setup-) · 🎹 [Pads + chords](#pads--chords-) · 🎚️ [Styles](#styles-) · ⏱️ [Clock + transport sync](#clock--transport-sync-) · 📋 [Quick reference](#quick-reference-)

---

# Setup 🔌

## 🌐 The browser problem

Web MIDI only ships in Chrome and Edge on desktop. Firefox and Safari don't implement it, no timeline. iOS Safari and iOS Chrome don't either — Apple has explicitly chosen not to.

The workaround for iPad: a third-party browser called **Web MIDI Browser** (Yonemoto, App Store) that fills the gap.

| Surface | Works |
|---|---|
| 🟢 Chrome / Edge on macOS / Windows / Linux | Yes |
| 🔴 Firefox / Safari, any platform | No |
| 🔴 iPad in stock Safari / Chrome / Edge | No |
| 🟢 iPad in **Web MIDI Browser** app | Yes |

> ⚠️ **Secure context required.** Web MIDI refuses to work over plain `http://` unless the host is `localhost`. Self-hosting on a LAN box → you need HTTPS. No opt-out.

## 🔗 Pick a URL

Three deployments. Each for a different situation.

| URL | When to use it |
|---|---|
| `http://localhost:5173` | `just dev` locally, OP-1 plugged into the same Mac |
| `https://jay-6.kempenich.dev` | `just serve` — your Mac + Cloudflare tunnel. **Use this on the iPad.** |
| `https://jay-6.kempenich.ai` | Always-on K8s. Loads anywhere — but MIDI still goes to a device on the **same physical machine** running the browser. |

> ⚠️ **The `.ai` URL is not a remote OP-1 driver.** Web MIDI can't be proxied. Opening `jay-6.kempenich.ai` on your phone won't drive an OP-1 plugged into your Mac. Browser and OP-1 must share a machine.

## ▶️ First load

1. Open the app → browser pops a **MIDI permission prompt**. Grant it.
2. **Output** dropdown → pick the OP-1.
3. **Channel** → default `1` is fine (OP-1 listens on omni).
4. **Input** → leave empty unless you want external clock (see [Clock + transport sync](#clock--transport-sync-)).

> ⚠️ **If you denied the permission prompt.** No in-app retry. Reload the page and grant it the second time. If Chrome remembered the denial, clear it in `chrome://settings/content/midiDevices`.

## 📱 iPad

1. Install **Web MIDI Browser** by Yonemoto from the App Store
2. Open `https://jay-6.kempenich.dev` inside it
3. Plug the OP-1 via camera-kit cable (USB-A to Lightning, or USB-C)
4. OP-1 shows up in **Output** — play

---

# Pads + chords 🎹

## 🗂️ The 100-bank idea

The whole point of the J-6: someone at Roland already voiced 1,200 chords for you. Banks 1 through 100 each hold 12 chords — one per pad — picked to work together as a song idea.

- Bank 1 = "Pop"
- Bank 14 = "Oct Stack"
- Bank 73 = some lo-fi RnB thing
- ...

👉 You don't pick individual chords. You pick a bank and play it.

## 🔀 Switching banks

| I want to... | Do this |
|---|---|
| Jump to a bank by name | Dropdown in the top bar |
| Step one bank at a time | `‹` / `›` buttons, or `←` / `→` keys |
| Wrap Bank 100 → Bank 1 | Keep pressing `›` — it wraps |

## 🟧 Playing

- 🖱️ Click a pad → chord plays
- ✋ Release → chord stops
- 🟠 Held pads glow J-6 orange

## 🔒 Latch

Top-bar **Latch** button OR `Space` key. With latch on:

- ⏸️ Press a pad → chord stays sounding after release. Pad stays orange.
- 🔁 Re-pressing the **same** pad → re-triggers the chord (J-6 HOLD convention, not a typo)
- 🔀 Pressing a **different** pad → swaps cleanly mid-flight. No engine restart, no glitch.
- ⏹️ Toggle latch off → highlight clears, sound stops

## 🎚️ Transpose

- `−12` / `+12` buttons or `Z` / `X` keys → octave shift
- Clamped at **±36 semitones** (3 octaves either way). Further presses do nothing.

👉 The OP-1 itself has only a handful of useful octaves before notes fall off the keyboard. You'll rarely use more than ±12 in practice.

## ⌨️ Keyboard map

Ableton "Computer MIDI Keyboard" layout. Once your hands know one, they know the other.

| Keys | What they do |
|---|---|
| `A` `S` `D` `F` `G` `H` `J` | White pads — C D E F G A B |
| `W` `E` `T` `Y` `U` | Black pads — C♯ D♯ F♯ G♯ A♯ |
| `Z` / `X` | Transpose by one octave |
| `←` / `→` | Bank prev / next |
| `Space` | Toggle latch |
| `1` – `6` | Switch style |

> ⚠️ **Black pads are not in piano order on the row.** Ableton layout puts them on the top row: `W` `E` then a gap (`R` does nothing — there is no E♯), then `T` `Y` `U`. Same gap as a real piano keyboard between B and C.

---

# Styles 🎚️

Six engines. Each takes the held chord and does something different to it. Pick one with the **Style** dropdown or number keys `1`–`6`. Most styles have a **Variation** dropdown for the specific feel within that engine.

👉 **Right way to think about styles:** the chord is what you hold; the style is what time does to it.

## ✋ Hold — the default

- Just plays the chord. No clock, no rhythm.
- Press = on, release = off.
- 👉 Start here. Use for comping behind something or auditioning voicings.

## 🔼 Arp 1 — 8th-note arpeggiator

Walks through chord notes one at a time, 8th-note rate. **12 variations** cover the matrix:

- **Direction** — up / up-down / down
- **Range** — 1 octave or 2
- **Feel** — straight or triplet (V07–V12 = triplet half)

👉 **V01** is the safe default: plain up, one octave, straight 8ths.

## 🔼🔼 Arp 2 — 16th-note arpeggiator

Same matrix as Arp 1, double the rate.

> 💡 **Picking between Arp 1 and Arp 2.** Use Arp 2 at slow tempos or with sparse chords (3–4 notes). Use Arp 1 when the chord is dense or the tempo is fast — otherwise it sounds like a blur.

## 🎼 Beat — chord-as-rhythm

Re-triggers the entire chord at a fixed musical length. **12 variations**: 2× / 1 / ½ / ¼ / 8th / 16th + triplet counterparts.

- 🐢 Long values (whole, half) → slow pads you want to gently re-articulate
- ⚡ Short values (8th, 16th) → stab patterns, like a horn section
- 🎲 Triplet variants → don't fit a 4/4 grid cleanly; that's the point

## ⏱️ Rhythm Gate 4 — pattern set A

Chord plays on an explicit 16-step pattern. **12 patterns**, each with its own emphasis (4-on-the-floor, syncopated, dotted, etc.). Pair with the **Gate** slider in the top bar:

- `10%` → ultra-staccato, almost percussive
- `100%` → each hit sustains right up to the next step

👉 Most patterns sound right in the **30–60%** range. Pull lower for tighter feel.

## ⏱️ Rhythm Gate 5 — pattern set B

Same engine as RG4, different pattern bank. **12 more patterns**, leaning broken / off-grid. Same Gate slider.

> ℹ️ **About Styles 6–9 from the hardware J-6.** Roland never published the note data. Jay-6 stops at Style 5 by design. Don't go looking for missing styles — they aren't there because Roland didn't tell anyone what they should be.

---

# Clock + transport sync ⏱️

The top-bar **Int / Ext** toggle picks who's in charge of the beat.

## 🎛️ Int — Jay-6 leads

- Jay-6 owns the clock
- Tempo comes from the **BPM** input
- Jay-6 sends 24 PPQ MIDI clock + Start/Stop continuously → any device set to follow Jay-6 locks to it
- Engines fire immediately on pad press (live-instrument feel)

👉 Use this when you're **driving** the OP-1 (or any synth) from Jay-6, or when playing standalone.

## 🛰️ Ext — Jay-6 follows

- Jay-6 follows incoming MIDI clock from the device in the **Input** dropdown
- **BPM** input disables — tempo comes from outside

Two important behaviours under Ext:

- 🎯 **Rhythm engines wait for the next downbeat** after Start before firing their first hit. Patterns lock to the external grid instead of starting wherever you happened to press.
- ⚡ **Chord-pad presses still fire immediately.** Jay-6 stays a live instrument, not a step sequencer. The pattern grid is what waits; the pad press is not.

👉 Use this when the OP-1 (or a DAW, or another sequencer) is driving and you want Jay-6 to lock to it.

## 🔄 The four scenarios

| Jay-6 | Other device | Clock direction | Pad press behavior |
|---|---|---|---|
| Int | listening | Jay-6 → device | Fires immediately |
| Ext | driving (OP-1 playing) | Device → Jay-6 | Pad fires now; rhythm waits for next downbeat |
| Int | also Int | Neither follows | Independent tempos — avoid unless intentional |
| Same as desktop | OP-1 on iPad via camera-kit | Same as desktop | Same as desktop |

## 📨 Transport messages

| Message | What Jay-6 does |
|---|---|
| ▶️ **Start** | Engines arm. Rhythm pattern resets to step 0. |
| ⏹️ **Stop** | Engines stop. All notes off. |
| ⏯️ **Continue** | Engines resume from the saved pattern position. |
| ⏺️ **Record** (OP-1) | Treated as Start. Hitting Record on the OP-1 kicks Jay-6 off too. |

> 🛡️ **Double-trigger guard.** Repeated Start messages within 200ms are ignored. Defends against OP-1 Record + Start chatter doubling up the first hit.

## 🔁 Switching mode mid-play

Flipping **Int ↔ Ext** while something is playing → hard stop:

- 🔇 All notes off
- 🔓 Latch clears
- ⏹️ Engine stops
- 👉 You restart manually

This is by design. Soft-handover semantics would mean reasoning about whether the new clock source is running, whether BPMs match, what to do with a held pattern position. Hard-stop has zero edge cases. Restart is cheap.

## 📱 iPad workflow

- Open Web MIDI Browser app
- Load `https://jay-6.kempenich.dev`
- Plug OP-1 via camera-kit
- OP-1 appears in **Output** — both Int and Ext work the same as desktop

> ⚠️ **Don't use `jay-6.kempenich.ai` for this.** Loads anywhere, including iPad, but MIDI can't be proxied across the internet. OP-1 must be on the same physical machine as the browser. Use the `.dev` URL — it's the local tunnel pointing at your Mac.

---

# Quick reference 📋

## 🎯 I want to...

| ...do this | Use |
|---|---|
| Just play chords through the OP-1 | Bank → pad. Style stays on **Hold**. |
| Lock a chord and tweak around it | `Space` to latch, then change style / bank / transpose |
| Add rhythm to a held chord | Style → **Rhythm Gate 4** or **5**, dial **Gate** to ~40% |
| Add an arpeggio | Style → **Arp 1**, V01 to start; bump to V03 for up-down |
| Have Jay-6 follow the OP-1's tempo | Set **Input** to the OP-1, toggle **Ext** |
| Have the OP-1 follow Jay-6's tempo | Stay on **Int**, set **BPM**, hit play on OP-1 |
| Use the iPad | Web MIDI Browser app + `jay-6.kempenich.dev` + camera-kit cable |
| Play with no mouse | `A`/`S`/`D`/`F`/`G`/`H`/`J` + `W`/`E`/`T`/`Y`/`U`; `Space` latch; `1`–`6` style |
| Reset everything | Reload the page. No global panic button by design — refresh is fast. |

## ⌨️ Keyboard cheat card

```
White pads:  A S D F G H J  (C D E F G A B)
Black pads:  W E . T Y U    (C# D# . F# G# A#)
Transpose:   Z X            (-1 oct / +1 oct)
Bank:        ← →            (prev / next, wraps)
Latch:       Space          (toggle)
Style:       1 2 3 4 5 6    (Hold / Arp1 / Arp2 / Phrase / RG4 / RG5)
```

---

# What's next ➡️

🎛️ **Sequencer** arrives in v2 — Section 5 of this manual will document it without rewriting Sections 1–4.
