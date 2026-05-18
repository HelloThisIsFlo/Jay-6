<!-- Jay-6 user manual. Sections are H1 by design — D-14 locks the four top-level
     sections, each must grep as ^# Heading. Future v2 adds Section 5 (Sequencer)
     here without rewriting 1–4 (D-13). -->

# Jay-6 — User Manual

Roland's J-6 is a £200 chord-pad sketchpad: pick a bank, press a pad, get a properly-voiced chord with the right rhythm style underneath. Jay-6 is that same instrument in a browser, sending MIDI to your OP-1 (or anything else with a MIDI input). No J-6 hardware needed — the factory chord library is built in.

This manual is for playing Jay-6. It is not a manual for hacking on it.

---

# Setup

## The browser problem

Web MIDI only ships in Chrome and Edge on desktop. Firefox and Safari don't implement it and there is no timeline for them to. iOS Safari and iOS Chrome don't either — Apple has explicitly chosen not to.

The workaround for iPad is a third-party browser called **Web MIDI Browser** (by Yonemoto, on the App Store) that fills the gap. Everything in this manual works inside it.

| Surface | Works |
|---|---|
| Chrome or Edge on macOS / Windows / Linux desktop | Yes |
| Firefox or Safari, any platform | No |
| iPad in Safari / Chrome / Edge | No |
| iPad in Web MIDI Browser app | Yes |

> **Secure context required.** Web MIDI also refuses to work over plain `http://` unless the host is `localhost`. If you self-host on a LAN box, you need HTTPS — there is no opt-out.

## Pick a URL

Three deployments, each for a different situation.

| URL | When to use it |
|---|---|
| `http://localhost:5173` | Running `just dev` locally, OP-1 plugged into the same Mac |
| `https://jay-6.kempenich.dev` | `just serve` — your Mac with a Cloudflare tunnel. Use this on the iPad. |
| `https://jay-6.kempenich.ai` | Always-on K8s deployment. Loads from anywhere, but MIDI still has to go to a device on the **same physical machine** running the browser. |

> **The `.ai` URL is not a remote OP-1 driver.** Web MIDI can't be proxied. Opening `jay-6.kempenich.ai` on your phone won't drive an OP-1 plugged into your Mac. The browser and the OP-1 have to share a machine.

## First load

1. Open the app. The browser pops a MIDI permission prompt. Grant it.
2. **Output** dropdown lists every MIDI device on this machine. Pick the OP-1.
3. **Channel** defaults to `1`. The OP-1 listens on omni out of the box, so leave it.
4. **Input** stays empty unless you want external clock — see [Clock + transport sync](#clock--transport-sync).

> **If you denied the permission prompt.** There is no in-app retry button. Reload the page and grant it the second time. If Chrome remembered the denial, clear it in `chrome://settings/content/midiDevices`.

## iPad-specific

1. Install **Web MIDI Browser** by Yonemoto from the App Store.
2. Open `https://jay-6.kempenich.dev` inside it (or any HTTPS URL serving Jay-6).
3. Plug the OP-1 into the iPad via a camera-kit cable (USB-A to Lightning, or USB-C).
4. OP-1 shows up in the **Output** dropdown. Play.

> **Long-press on TopBar.** Older iPad builds let iOS text-selection trigger on controls; that's fixed. If you ever see a text-selection magnifier pop over a button, file a bug — it shouldn't happen anymore.

---

# Pads + chords

## The 100-bank idea

The whole point of the J-6 is that someone at Roland already voiced 1,200 chords for you. Banks 1 through 100 each hold 12 chords — one for each pad — picked to work together as a song idea. Bank 1 is "Pop," bank 14 is "Oct Stack," bank 73 is some lo-fi RnB thing, and so on.

You don't pick individual chords. You pick a bank and play it.

## Switching banks

| I want to... | Do this |
|---|---|
| Jump to a specific bank by name | Dropdown in the top bar |
| Step one bank at a time | `‹` / `›` buttons, or `←` / `→` keys |
| Wrap from Bank 100 back to Bank 1 | Just keep pressing `›` — it wraps |

## Playing a chord

Click a pad, the chord plays. Release, the chord stops. Held pads glow J-6 orange.

If you want to keep a chord sounding while you change something (transpose, style, swap pads), use **Latch** — either the top-bar button or the `Space` key. With latch on:

- A pressed pad stays sounding after release. Pad stays orange.
- Re-pressing the **same** pad re-triggers the chord. This is the J-6 HOLD convention, not a typo.
- Pressing a **different** pad swaps the chord cleanly mid-flight. No engine restart, no audible glitch.
- Toggling latch off clears the highlight and stops the sound.

## Transpose

`−12` / `+12` buttons or `Z` / `X` keys shift everything by an octave. Clamped at ±36 semitones (three octaves either direction) — further presses do nothing instead of wrapping.

The OP-1 itself has only a handful of useful octaves before notes fall off the keyboard, so you'll rarely use more than ±12 in practice.

## Keyboard layout

The pads map to the Ableton "Computer MIDI Keyboard" layout. Once your hands know one, they know the other.

| Keys | What they do |
|---|---|
| `A` `S` `D` `F` `G` `H` `J` | White pads — C D E F G A B |
| `W` `E` `T` `Y` `U` | Black pads — C♯ D♯ F♯ G♯ A♯ |
| `Z` / `X` | Transpose by one octave |
| `←` / `→` | Bank prev / next |
| `Space` | Toggle latch |
| `1` – `6` | Switch style |

> **The black pads are not in piano order on the keyboard row.** The Ableton layout puts them on the top number row positions, which means `W`/`E` then a gap (`R` does nothing — the gap between E♯ and the next sharp), then `T`/`Y`/`U`. Same gap as a real piano keyboard between B and C.

---

# Styles

Six engines. Each takes the held chord and does something different to it. Pick one with the **Style** dropdown or the number keys `1`–`6`. Most styles have a **Variation** dropdown for picking a specific feel within that engine.

The right way to think about styles: **the chord is what you hold; the style is what time does to it.**

## Hold — the default

Just plays the chord. No clock, no rhythm. Press = on, release = off.

Start here. Use this when you want to comp behind something, or to audition voicings before picking a rhythmic style.

## Arp 1 — 8th-note arpeggiator

Walks through the notes of the chord one at a time at 8th-note rate. 12 variations cover the matrix of:

- **Direction** — up / up-down / down
- **Range** — 1 octave or 2
- **Feel** — straight or triplet (V07–V12 are the triplet half)

V01 is the safe default: plain up, one octave, straight 8ths.

## Arp 2 — 16th-note arpeggiator

Same matrix as Arp 1 but at 16th-note rate. Twice as busy.

> **Picking between Arp 1 and Arp 2.** Use Arp 2 at slow tempos or with sparse chords (3–4 notes); use Arp 1 when the chord is dense or the tempo is fast, otherwise it sounds like a blur.

## Phrase Dur — chord-as-rhythm

Re-triggers the entire chord at a fixed musical length. 12 variations cover double-whole, whole, half, quarter, 8th, 16th — plus triplet counterparts.

- The long values (whole, half) are for slow pads that you want to gently re-articulate.
- The short values (8th, 16th) are stab patterns — like a horn section.
- The triplet variants are where this style gets interesting; they don't fit a 4/4 grid cleanly and that's the point.

## Rhythm Gate 4 — 16-step pattern, set A

The chord plays on an explicit 16-step pattern. 12 patterns, each with its own emphasis: 4-on-the-floor, syncopated, dotted, etc. Pair it with the **Gate** slider that appears in the top bar:

- `10%` — ultra-staccato, almost percussive hits
- `100%` — each hit sustains right up to the next step

Most patterns sound right somewhere in the 30–60% range. Pull it lower for tighter, more rhythmic feel.

## Rhythm Gate 5 — 16-step pattern, set B

Same engine as RG4, different pattern bank. 12 more patterns, leaning toward broken / off-grid feels. Same Gate slider.

> **About Styles 6–9 from the hardware J-6.** Roland never published the note data for them. Jay-6 stops at Style 5 by design. Don't go looking for missing styles — they aren't there because Roland didn't tell anyone what they should be.

---

# Clock + transport sync

The top-bar **Int / Ext** toggle picks who's in charge of the beat.

## Int — Jay-6 is the master

Jay-6 owns the clock. Tempo comes from the **BPM** input. Jay-6 sends 24 PPQ MIDI clock plus Start/Stop continuously, so any slaved gear locks to it. Engines fire immediately the moment you press a pad — that's the live-instrument feel.

Use this when you're driving the OP-1 (or any synth) from Jay-6, or when you're playing standalone.

## Ext — Jay-6 is the slave

Jay-6 follows incoming MIDI clock from the device picked in the **Input** dropdown. The BPM input disables — tempo comes from whatever is feeding the clock.

Use this when the OP-1 (or a DAW, or another sequencer) is the master and you want Jay-6 to lock to it.

Two important behaviours under Ext:

- **Rhythm engines wait for the next downbeat** after a Start message before firing their first hit. This is what makes patterns lock to the master grid instead of starting wherever you happened to press.
- **Chord-pad presses still fire immediately.** Jay-6 stays a live instrument, not a step sequencer. The pattern grid is what waits; the pad press is not.

## The four scenarios

| Jay-6 | Other device | Clock direction | What happens on pad press |
|---|---|---|---|
| Int | listening | Jay-6 → device | Fires immediately |
| Ext | master, playing | Device → Jay-6 | Pad fires now; rhythm waits for next downbeat |
| Int | also Int | Neither follows | Independent tempos. Avoid unless intentional. |
| Same as desktop | OP-1 on iPad via camera-kit | Same as desktop | Same as desktop |

## What the transport messages do

| Message | What Jay-6 does |
|---|---|
| **Start** | Engines arm. Rhythm pattern resets to step 0. |
| **Stop** | Engines stop. All notes off. |
| **Continue** | Engines resume from the saved pattern position. |
| **Record** (OP-1) | Treated as Start. Hitting Record on the OP-1 also kicks Jay-6 off. |

> **Double-trigger guard.** Repeated Start messages within 200ms are ignored. This defends against the OP-1's Record + Start chatter doubling up the first hit.

## Switching mode mid-play

Flipping **Int ↔ Ext** while something is playing stops everything: all notes off, latch clears, engine stops. You restart manually.

This is by design. Soft-handover semantics would mean reasoning about whether the new clock source is running, whether the BPMs match, what to do with a held pattern position, etc. The hard-stop path has zero edge cases. Restart is cheap.

## iPad workflow

Open the Web MIDI Browser app, load `https://jay-6.kempenich.dev`, plug the OP-1 into the iPad via camera-kit. OP-1 appears in **Output**, both Int and Ext modes work the same as on desktop.

> **Don't use `jay-6.kempenich.ai` for this.** It loads anywhere, including the iPad, but MIDI can't be proxied across the internet. The OP-1 has to be on the same physical machine as the browser. Use the `.dev` URL — it's the local tunnel pointing at your Mac.

---

# Quick reference

## I want to...

| ...do this | Use |
|---|---|
| Just play chords through the OP-1 | Bank → pad. Style stays on Hold. |
| Lock a chord and tweak around it | `Space` to latch, then change style / bank / transpose |
| Add rhythm to a held chord | Style → Rhythm Gate 4 or 5, dial **Gate** to ~40% |
| Add an arpeggio | Style → Arp 1, V01 to start; bump to V03 for up-down |
| Drive Jay-6 from the OP-1's tempo | Set **Input** to the OP-1, toggle **Ext** |
| Drive the OP-1's tempo from Jay-6 | Stay on **Int**, set **BPM**, hit play on OP-1 (it'll follow) |
| Use the iPad | Web MIDI Browser app + `jay-6.kempenich.dev` + camera-kit cable |
| Play with no mouse | `A`/`S`/`D`/`F`/`G`/`H`/`J` + `W`/`E`/`T`/`Y`/`U`; `Space` latch; `1`–`6` style |
| Reset everything | Reload the page. There's no global panic button by design — refresh is fast. |

## Keyboard cheat card

```
White pads:  A S D F G H J  (C D E F G A B)
Black pads:  W E . T Y U    (C# D# . F# G# A#)
Transpose:   Z X            (-1 oct / +1 oct)
Bank:        ← →            (prev / next, wraps)
Latch:       Space          (toggle)
Style:       1 2 3 4 5 6    (Hold / Arp1 / Arp2 / Phrase / RG4 / RG5)
```

---

# What's next

Sequencer arrives in v2 — Section 5 of this manual will document it without rewriting Sections 1–4.
