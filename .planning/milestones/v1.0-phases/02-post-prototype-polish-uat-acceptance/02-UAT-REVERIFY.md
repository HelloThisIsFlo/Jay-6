---
status: complete
phase: 02-post-prototype-polish-uat-acceptance
source: [02-06-SUMMARY.md, 02-07-SUMMARY.md, 02-08-SUMMARY.md, 02-09-SUMMARY.md]
kind: gap-reverify
parent_uat: 02-UAT.md
started: 2026-05-22T00:00:00Z
updated: 2026-05-22T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke (post-fix)
covers: regression — engines + App.svelte mutated by 02-06/07/08/09
expected: |
  Kill any running vite. Hard-reload (Cmd-Shift-R) so no warm state survives.
  `just dev` boots clean; app loads at localhost:5173; defaults visible
  (Bank 1 Cadd9, Style 3 now reads "Beat", BPM 110, latch off); no console errors
  beyond the known webmidi.js advisory.
result: pass
note: |
  Verified headless (Playwright) 2026-05-22, not just server-side. Vite boot clean
  (511ms, 0 errors). HTTP 200, title Jay-6. Rendered DOM defaults confirmed:
  Bank 01 (Cadd9 family pads), Style default Hold, BPM 110, Latch off, Clock Int
  (Ext disabled — no input). Console 0 errors / 0 warnings.

### 2. Pad Release-Edge Race (was test 4, fix 02-08)
covers: gap test 4 — stuck pad/note on drag-off-then-release
expected: |
  Bank 1, Style Hold. Repeat ~10×, fast: press a pad → drag mouse OFF the pad while
  still held → release outside.
  - Pad ALWAYS clears its lit/orange state on release (no stuck-lit pad)
  - MIDI note-off ALWAYS fires (no hanging note on OP-1) — even when release +
    pointer-leave happen near-simultaneously
  Fix: idempotent release across pointerup/pointercancel/lostpointercapture.
result: pass
note: |
  User hammered press→drag-off→release ~10×, plus a cursor-yank-out-of-window trick
  (automation, no mouse move) that fires pointercancel/lostpointercapture. Pad always
  cleared + no hung note. Reliably fixed — the exact paths 02-08 hardened.

### 3. Page-Reload Note-Off (was test 6, fix 02-07)
covers: gap test 6 — hanging MIDI note on browser reload
expected: |
  Bank 1, latch ON, press a pad so a chord is sounding/latched.
  Hit browser reload (Cmd-R).
  - MIDI note STOPS on the OP-1 (no hang) — pagehide/beforeunload fires host.panic()
    → note-offs + All Notes Off before teardown
  - No need to re-press the pad to clear it
result: pass
note: |
  Latched chord → reload → OP-1 goes quiet (no hang). User also tested arp mode →
  also clears cleanly. Confirms host.panic() on pagehide clears ALL engine held-state
  (heldPads/padNotes/currentRawChord), not just the latched chord.

### 4. 'Beat' Rename + Style Selector (was test 10, fix 02-09)
covers: gap test 10 — "Phrase Dur" → "Beat"; regression — style selector intact
expected: |
  - Style-3 selector label reads "Beat (Style 3)" (was "Phrase Dur")
  - All 6 styles still selectable; switching to Beat plays chord stabs at fixed
    durations exactly as before (label-only change; engine unchanged)
  - Rhythm Gate 4 / 5 still their own separate labels (NOT folded under Beat)
result: pass
note: |
  Label verified headless 2026-05-22 (dropdown reads Beat (Style 3); all 6 selectable;
  RG4/RG5 stay separate). Audio confirmed on hardware 2026-05-23 — Beat plays chord
  stabs at fixed durations exactly as the old Phrase Dur. Engine untouched (label-only
  rename). Variation table (V01-06 straight double-whole→16th, V07-12 same triplet)
  re-confirmed against src/phrases.ts STYLE3.

### 5. Rhythm Gate Ext-Clock Alignment (was test 11, fix 02-06)
covers: gap test 11 — first hit must land on OP-1 downbeat, not +278ms off-grid
expected: |
  OP-1 as Input, Clock = Ext, Bank 1, Style Rhythm Gate 4. Start OP-1 playback.
  Hold a pad; focus the previously-suspect variations V04, V06, V08.
  - First audible hit lands ON the OP-1 downbeat (offset ≈ 0, not ~0.42 beat late)
  - Engine arms to OP-1's ABSOLUTE bar position (not a beat counted from pad-press)
  - Pattern stays phase-locked to the OP-1 bar across repeats
result: pass (bug found + fixed in-session 2026-05-23; confirmed via test 8a)
note: |
  CONFIRMED non-provisional: test 8a re-verified the fix in transport context — V01/V04/V06
  first hits wait and land on the OP-1 bar downbeat, [ARM] wait>0.
  ON FIRST TEST: still fired immediately on press (USB + BT), V01 probe. Console [ARM]
  log showed mode:external, externalTick:0, wait:0 every press — yet tempo followed OP-1
  (clock flowing). Root cause: tickSource.attachInputListener() called resetExternalTick(),
  and attach runs on every engine subscribe (activate() at listeners.size===1). So each
  pad-press zeroed the OP-1 bar frame a beat before the arm read it → wait=0 → fire now.
  FIX (in-session): removed resetExternalTick() from attachInputListener; anchored the bar
  frame to setMode + setInputId + host.onTransport(Start/Continue) instead. just test 45/45
  (Int-leak regression intact). User: "looks like it's working" — provisional pass pending
  deeper hardware re-verify of downbeat landing + phase-lock across V04/V06/V08.

### 6. Latch + Space preventDefault (was test 14, fix 02-08 + 02-07)
covers: gap test 14 — Space scrolled page; regression — latch core (fragile machine)
expected: |
  Style Hold, Bank 1.
  - Space toggles latch AND the page does NOT scroll (preventDefault now honored)
  - Latch button toggles too; latched chord stays sounding after release; pad stays
    orange; same-pad re-press retriggers; different-pad swaps smoothly
  - Latch OFF clears highlight + stops sound — AND clears any held-pad highlight
    even when nothing is physically down
result: pass (full latch matrix verified on hardware 2026-05-23 after 2 in-session fixes)
note: |
  Space scroll-portion verified headless 2026-05-22. Hardware latch matrix (A–F:
  latch-first, latch-off-after, latch-off-mid-hold, latch-on-mid-hold, swap, retrigger)
  all consistent after two in-session desync fixes. Core latch behavior intact; visual
  + audio now locked across every transition.
  TWO visual/audio desync bugs found + fixed during this re-test (see Gaps):
  (1) latch-off while mouse-holding cleared highlight but kept sound (keyboard-only
      downKeys guard);
  (2) enabling latch mid-hold → release cleared highlight but kept sound (latchedKey
      captured only at press-time, host uses live latch).
  Both are instances of the dual-store (host audio vs App visual) desync the user
  flagged — logged for architecture interview at end of UAT.

### 7. Arrow Keys preventDefault + Keyboard (was test 15, fix 02-08)
covers: gap test 15 — arrow keys scrolled page
expected: |
  Window focused, no input field selected.
  - ←/→ step banks and do NOT scroll the page
  - ↑/↓ do NOT scroll the page (swallowed; intentionally not yet bound to anything)
  - All 18 pad/transpose/style key bindings still work as before
result: pass (fixed in-session 2026-05-22; scroll-suppression verified headless)
reported: "Space works (no scroll). But up/down still scroll a little bit — NOT on first press, only when held. Also page is a bit too tall and the white border behaves a bit weird."
severity: minor
resolution: |
  FIXED in-session. Root cause: src/App.svelte onKeyDown opened with
  `if (ev.repeat) return;` before any preventDefault, so held-key repeat events
  bypassed the ArrowUp/Down preventDefault (added by 02-08, but downstream).
  Fix: compute isAppKey, call ev.preventDefault() for app-owned keys ABOVE the
  repeat-guard; repeat-guard now only dedups the action. Verified headless via
  synthetic keydown {repeat:true}: ArrowDown/Space repeat → defaultPrevented=true;
  non-app key 'q' → defaultPrevented=false (no over-suppression). `just check` clean.
  NOTE: page-too-tall + white-border observations remain in Polish / Observations
  (pre-existing, re-check during test 9). All-18-bindings audio still pending hardware.

### 8. Transport Sync — Continue / Downbeat / Panic (was test 16, fix 02-06 + 02-07)
covers: gap test 16 — OP-1 Continue, downbeat align, mode-switch panic clears state
expected: |
  OP-1 as Input, Style Arp 1 or Rhythm Gate.
  - Press Play on OP-1 (emits Continue 0xFB, never Start): Jay-6 arms-and-aligns;
    `TRANSPORT-IN continue` appears in console (console.debug)
  - First step lands on the OP-1 downbeat
  - Int + latch + pad highlighted → switch to Ext: audio stops (panic) AND latch +
    pad highlights CLEAR (no stuck-lit pad after the mode switch)
  - Int-leak check: rhythm running under Ext → flip to Int → change OP-1 tempo →
    Jay-6 rhythm does NOT follow (engines on internal clock only)
  - No clock echo while in Ext (no CLOCK-OUT) — confirmed-good, re-confirm
result: pass
note: |
  All 4 sub-parts pass on hardware (USB OP-1) 2026-05-23:
  - 8a downbeat alignment: first hit waits + lands on OP-1 bar; [ARM] wait>0 after the
    test-5 fix; V01/V04/V06 patterns locked to the OP-1 bar (V04="just before the beat",
    V06=on-beat+& doubled — both confirmed against STYLE4 source).
  - 8b mode-switch: Int+latch+pad → flip Ext → audio + highlight clear; latch TOGGLE
    correctly persists (mode, not stuck-lit pad). User-confirmed desired behavior.
  - 8c Int-leak guard: flip Ext→Int → Jay-6 stops following OP-1 tempo; flip back → re-locks.
    The transient leak (was reload-only fix) now clean live.
  - 8d no clock echo: structurally gated (sendClock only inside mode===internal) + prior
    MIDI-monitor confirmation (2026-05-20). No CLOCK-OUT. MIDI monitor not re-run (user's
    MiniMonitor spy currently broken) — code guarantee accepted.

### 9. iPhone iOS Polish — text-select + landscape (was test 19, fix 02-09)
covers: gap test 19 — double-tap selected text; landscape unusable
expected: |
  iPhone via "Web MIDI Browser", load jay-6.kempenich.dev (or .ai).
  - Double-tap / long-press on pads, labels, app body → NO text selection, NO iOS
    long-press callout menu (inputs still editable if any)
  - Landscape: can now SCROLL to reach the keyboard / off-screen keys (was trapped)
  - Portrait still scroll-locked + no rubber-band
result: pass
note: |
  iPhone via Web MIDI Browser, dev build tag A1 confirmed loaded. Both original test-19
  bugs fixed:
  - Text-selection: long-press shows the iOS loupe/magnifier briefly but selects NO text
    + no copy/lookup callout. User happy.
  - Landscape: now scrollable to reach the keys (was fully trapped before). Core gap closed.
  Portrait: usable, slightly cut off (acceptable).
  POLISH (Claude Design, not a gap): landscape scroll is cumbersome — the pad/keyboard
  area can't be used to scroll (pads capture touch by design), so the user must drag from
  the margins. Usable but counterintuitive. White-border eyeball deferred to Claude Design.

### 10. Edge Cases — clear-state on disconnect (was test 20, fix 02-07)
covers: gap test 20 — hot-plug clears latch; Ext→Int fallback
expected: |
  Clock = Ext, latched Arp running, OP-1 connected.
  - Disconnect the OP-1 (input) mid-play:
    - No crash / no console error
    - Pad highlight + latch state CLEAR (not stuck-lit)
    - Clock source FALLS BACK to Int automatically (no longer stuck on Ext with
      no input)
  - Re-plug: port reappears, selectable
  - Switch style while latched still transitions cleanly; browser refresh resets defaults
result: pass (2 follow-on bugs found + fixed in-session 2026-05-23)
reported: "Disconnect clears pad highlight + falls back to Int (latch toggle persists) — very nice. BUT on re-plug, one note hangs. AND in Int mode, unplug leaves the pad highlight stuck."
severity: major
note: |
  Original test-20 clear-state gap confirmed fixed (Ext: highlight clears, Ext→Int
  fallback works, latch toggle persists). Re-verify surfaced TWO follow-on bugs, both
  fixed in-session (see Gaps):
  1. Hung note on re-plug — disconnect note-off couldn't reach the gone port. Fixed:
     All-Notes-Off on output (re)connect. User confirmed cleared on reconnect (Ext).
  2. Int-mode stuck highlight — Int output-disconnect fired no clear path (Ext was
     covered by the clock fallback). Fixed: host.panic() when the selected output
     vanishes. User confirmed highlight clears on unplug (Int).
  Note while unplugged the OP-1 keeps ringing — unavoidable (can't note-off a pulled
  cable); reconnect All-Notes-Off clears it. Both follow-ons are dual-store-architecture
  symptoms → fed into the architecture capture.

### 11. Arp under Ext — alignment regression smoke (neighbor of fix 02-06)
covers: regression — arp.ts shares the same Ext first-fire arm code 02-06 changed
expected: |
  OP-1 as Input, Clock = Ext, Style Arp 1, hold a pad. Start OP-1.
  - First arp note lands on the OP-1 downbeat (same absolute-bar arm as rhythm gate)
  - Arp still runs all directions / octave ranges correctly (no regression from the
    arm-alignment change) — spot-check a couple variations (e.g. V01 UP, V05)
result: pass
note: |
  Arp aligns to OP-1 downbeat (press Play on OP-1 FIRST to anchor the bar; mid-bar play
  anchors mid-bar — expected, the arm keys off transport). V01/V05 + mid-pattern variation
  switch all behaved. The test-5 tickSource fix covers arp too (shared getExternalTick arm).
  WATCH-ITEM (transient, NOT reproducible after reload): user saw an alignment glitch once
  before reloading — possibly stale state lingering from the test-10 disconnect/hung-note.
  Cleared on reload; couldn't repro. Not a blocking gap; flagged in case it resurfaces.

## Summary

total: 11
passed: 11
issues: 0
pending: 0
resolved_in_session: 6
skipped: 0
blocked: 0
note: |
  ALL 11 PASS. 6 bugs found + fixed + committed in-session (one commit each):
  - test 7: ↑/↓/Space key-repeat scrolled the page (preventDefault below repeat-guard)
  - test 6: latch-off-while-mouse-held cleared highlight, kept sound (keyboard-only guard)
  - test 6: enable-latch-mid-hold cleared highlight, kept sound (press-time latchedKey)
  - test 5: Ext-clock arm fired on press not downbeat (externalTick reset on subscribe)
  - test 10: hung note on re-plug (note-off couldn't reach gone port → ANO on reconnect)
  - test 10: Int-mode unplug left pad lit (no clear path → panic on output disconnect)
  Most are dual-store / coupling symptoms → architecture refactor + transport-reset (D-04)
  fed into end-of-session /gsd:capture. Plus dev-only build-id Vite plugin (cache detection).
  Polish/observations + the transient arp watch-item logged below.

## Gaps

- truth: "Holding ↑/↓ (key-repeat) never scrolls the page — preventDefault applies on repeat events too"
  status: resolved  # fixed in-session 2026-05-22, verified headless
  reason: "User reported during re-verify test 7: Space fine, but ↑/↓ scroll a little when HELD (not on first press). Key-repeat events early-returned at App.svelte:115 before reaching the preventDefault."
  severity: minor
  test: 7
  origin: regression-of-fix  # 02-08 added the preventDefault but placed it downstream of the repeat-guard
  root_cause: |
    src/App.svelte:115 `if (ev.repeat) return;` ran before any preventDefault.
    ArrowUp/Down preventDefault (line 138) was downstream → key-repeat scrolled.
  fix: |
    onKeyDown now computes isAppKey and calls ev.preventDefault() for app-owned keys
    ABOVE the repeat-guard; repeat-guard only dedups the action. Verified headless.
  artifacts:
    - path: "src/App.svelte:114-152"
      issue: "FIXED — preventDefault moved ahead of repeat-guard"

- truth: "Latch OFF while a pad is still physically held (mouse) keeps the pad lit AND sounding together — never clears the highlight while the note rings"
  status: resolved  # fixed in-session 2026-05-23
  reason: "User reported during test 6 bonus: mouse-hold pad + latch OFF → highlight cleared but note kept sounding."
  severity: minor
  test: 6
  origin: dual-store-desync
  root_cause: |
    src/App.svelte latch-off $effect cleared heldKeys when `downKeys.size === 0`.
    downKeys is KEYBOARD-only (populated in onKeyDown), so a MOUSE-held pad has an
    empty downKeys → highlight wiped while host kept the note sounding.
  fix: |
    Removed the downKeys heldKeys-wipe. heldKeys already tracks only physically-held
    pads (press adds / release removes), so latch-off needs only latchedKey=null.
  artifacts:
    - path: "src/App.svelte (latch-off $effect)"
      issue: "FIXED — dropped keyboard-only downKeys guard"

- truth: "Enabling latch mid-hold, then releasing, keeps the pad lit AND sounding together (visual matches the host's live-latch rule)"
  status: resolved  # fixed in-session 2026-05-23
  reason: "User reported during test 6 matrix: press pad, enable latch while holding, release → pad turned off but sound continued."
  severity: minor
  test: 6
  origin: dual-store-desync
  root_cause: |
    Visual latchedKey was set only at press-time (press(): `if (ui.latch) latchedKey=key`).
    host.padReleased uses LIVE cfg.latch at release. So latch-enabled-mid-hold → host
    keeps sounding but latchedKey stayed null → release cleared the highlight.
  fix: |
    release() now mirrors host's live rule: `if (ui.latch) latchedKey = key` so the
    released pad becomes the sustained highlight when latch is on at release time.
  artifacts:
    - path: "src/App.svelte (release())"
      issue: "FIXED — adopt live-latch rule, matching host.padReleased"

- truth: "Under Ext clock, the engine arms its first step to the OP-1's next bar downbeat (externalTick reflects the OP-1's live bar position at pad-press)"
  status: resolved  # fixed in-session 2026-05-23, provisional — needs deeper hardware verify
  reason: "Re-verify test 5: still fired immediately on press (USB+BT). Console [ARM] showed externalTick:0 every press despite tempo following OP-1 (clock flowing)."
  severity: major
  test: 5
  also_relevant: [8, 11]  # same arm path in arp.ts / phraseDuration.ts
  root_cause: |
    tickSource.attachInputListener() called resetExternalTick(); attach runs on EVERY
    engine subscribe (activate() when listeners.size hits 1). So each pad-press zeroed the
    OP-1 bar frame a beat before the arm read getExternalTick() → wait=0 → fire instantly.
  fix: |
    Removed resetExternalTick() from attachInputListener (src/tickSource.ts). Bar frame now
    anchored only at setMode (flip), setInputId (new device), and host.onTransport on
    Start/Continue. just check clean; just test 45/45 incl. Int-leak regression.
  artifacts:
    - path: "src/tickSource.ts (attachInputListener / setInputId)"
      issue: "FIXED — reset no longer fires on engine subscribe"
  note: |
    NOTE arp.ts + phraseDuration.ts share the same arm pattern and read getExternalTick()
    too — the fix is in tickSource so it covers all three engines, but re-verify arp (test
    11) + Beat under Ext to confirm.

- truth: "Disconnecting then re-plugging the OP-1 leaves NO hung note — any note sounding at disconnect is silenced (no stuck note on the device after reconnect)"
  status: resolved  # fixed in-session 2026-05-23, user-confirmed (Ext)
  reason: "Test 10: on re-plug after disconnecting a latched/playing OP-1, one note hangs. Note-off missed on disconnect."
  severity: major
  test: 10
  origin: hardware-edge  # note-off can't reach an already-disconnected output port
  root_cause: |
    On disconnect, panic()'s allNotesOff() targets the output port, which is already gone
    → no-op (getChannel returns null). The OP-1 keeps the held note. Reconnect didn't clear it.
  fix: |
    midi.ts: send All-Notes-Off the moment an output (re)connects (onConnected listener),
    so any note left hung on the device is silenced on reconnect.
  artifacts:
    - path: "src/midi.ts (onConnected)"
      issue: "FIXED — All-Notes-Off on output (re)connect"

- truth: "In Int clock mode, unplugging the output device clears the pad highlight (no stuck-lit pad)"
  status: resolved  # fixed in-session 2026-05-23, user-confirmed
  reason: "Test 10: in Int mode, unplug left the pad illuminated on Jay-6. Ext mode was covered by the Ext→Int clock-fallback panic; Int had no equivalent clear path."
  severity: minor
  test: 10
  origin: dual-store-desync
  root_cause: |
    Int-mode output-disconnect fires no mode switch → no panic → highlight (component-owned)
    never cleared. Only the Ext→Int fallback path panicked.
  fix: |
    App.svelte: track the selected output id in the MIDI subscription; host.panic() when it
    vanishes (clears audio + fires onPanic → clearAllHighlights). Pairs with reconnect ANO.
  artifacts:
    - path: "src/App.svelte (subscribeMidi)"
      issue: "FIXED — panic on selected-output disconnect"

## Polish / Observations (non-blocking — surfaced during re-verify)

- Test 9/19 (touch): pattern/variation selector (and Channel/Bank) would feel better as an
  iOS-style picker WHEEL ("one-armed-bandit" roll) on touch devices. Already in original UAT
  Polish Backlog (test 19) + visual-design todo. → Claude Design pass.

- Test 9 (iPhone landscape): scroll is cumbersome — pad/keyboard area can't scroll (pads
  capture touch by design); user must drag from the margins to reach off-screen keys.
  Usable but counterintuitive. → Claude Design pass.

- DEV-ONLY build tag added (src/App.svelte): bottom-of-page `dev build <TAG>` shown only
  under import.meta.env.DEV (jay-6.kempenich.dev tunnel), never the built .ai deploy.
  Bump the tag string when pushing an on-device change so the phone can confirm latest
  code loaded (iOS has no hard-refresh). Current tag: A1. Dev tooling, not a gap.

- OP-1 TRANSPORT SEMANTICS (user finding, 2026-05-23, relevant to test 8): OP-1 sends
  Start (0xFA) ONLY when playback begins at tape position 0; from mid-tape (incl. a loop
  start) it sends Continue (0xFB), never both. 02-06 already routes Start AND Continue
  through the same arm-and-align path, so covered — but the bar frame anchors wherever
  transport fires (may be a loop point, not musical bar 1). Resilience to any controller
  is the stated bar. Re-confirm during test 8.

- "Release stops the OP-1 tape" (user saw once early in test 5, NOT reproducible after
  hard reload, including with latch): suspected Int-mode behavior — host.padReleased sends
  sendTransport('stop') when the last pad releases (host.ts), and Int mode sends transport
  out. In Ext mode Jay-6 shouldn't send transport. Couldn't reproduce in Ext. LOG to
  revisit: confirm whether Int-master should stop the downstream tape on last-pad release
  (likely too aggressive) — candidate gap, needs reproduction first.

- Test 4 (Beat): variation change applies at the NEXT step boundary (setVariation only
  swaps the rate; current note plays out). Correct/musical, but on V01 (double-whole =
  8 beats) it feels like "nothing happened." Two user ideas:
  - Give variations human-readable names (likely already a pending todo — Polish Backlog
    test 8 item "V01 UP 1oct" style suffixes). Makes Beat durations self-explanatory too.
  - NEW idea: brief website-style toast at the bottom — "Variation change applies on the
    next hit" — shown ONLY when the next hit is >~0.5s away (i.e. on slow variations), so
    the user knows the change registered. Conditional, non-intrusive.

- Test 7: page is a bit too tall (scrollable) + white border "behaves a bit weird."
  Page-taller-than-viewport + white-border were ALREADY in the original UAT Polish
  Backlog (tests 15 + 19). The "white border behaving weird" may also interact with
  02-09's app-wide `<main>` overflow / selection-suppression CSS — re-check during
  test 9 (iPhone landscape) to rule out a 02-09 regression vs pre-existing polish.
