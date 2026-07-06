<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from './components/TopBar.svelte';
  import PianoLayout from './components/PianoLayout.svelte';
  import { EngineHost } from './engines/host';
  import { getBank, type Key } from './banks';
  import { subscribeMidi, getMidiState } from './midi';
  import { tickSource } from './tickSource';
  import { BUILD_ID } from 'virtual:build-id';
  import {
    ui,
    setStyle,
    setBank,
    bumpTranspose,
    toggleLatch,
    setClockSource,
  } from './state.svelte';

  const host = new EngineHost({
    bpm: ui.bpm,
    styleKind: ui.style,
    variation: ui.variation,
    transpose: ui.transpose,
    latch: ui.latch,
    gatePercent: ui.gatePercent,
    clockMode: ui.clockSource,
  });

  // Bridge reactive UI state → imperative host + tickSource calls.
  $effect(() => { host.setBpm(ui.bpm); tickSource.setBpm(ui.bpm); });
  $effect(() => { host.setStyle(ui.style, ui.variation); });
  $effect(() => { host.setTranspose(ui.transpose); });
  $effect(() => { host.setLatch(ui.latch); });
  $effect(() => { host.setGatePercent(ui.gatePercent); });
  // D-03: mode switch is a hard stop (panic + clear latch) BEFORE flipping tickSource.
  // host.setClockMode() gates outbound transport per D-02 (master sends, slave listens).
  $effect(() => {
    host.panicForModeSwitch();
    host.setClockMode(ui.clockSource);
    tickSource.setMode(ui.clockSource);
  });

  // Push selected MIDI input id into the tick source so external clock can attach.
  // Ext→Int fallback: if the selected input vanishes while in Ext mode, the engine
  // has no clock — fall back to Int so state stays coherent (UAT test 20 hot-plug).
  // midi.ts:refreshPorts already nulls selectedInputId when the device disconnects;
  // the clockSource change rides the mode-switch $effect, which panics (clears audio
  // + highlights) too.
  onMount(() => {
    let prevOutputId = getMidiState().selectedOutputId;
    return subscribeMidi((s) => {
      tickSource.setInputId(s.selectedInputId);
      const inputGone =
        s.selectedInputId === null ||
        !s.inputs.find((i) => i.id === s.selectedInputId);
      if (ui.clockSource === 'external' && inputGone) {
        setClockSource('internal');
      }
      // The output we were playing vanished (e.g. OP-1 unplugged): clear stuck audio +
      // highlight. Ext mode already panics via the clock fallback above; this covers Int
      // mode, where an output disconnect fires no mode switch so the pad stayed lit (UAT
      // re-verify test 10).
      const outputGone =
        prevOutputId !== null && !s.outputs.find((o) => o.id === prevOutputId);
      if (outputGone) host.panic();
      prevOutputId = s.selectedOutputId;
    });
  });

  // D-04: forward inbound transport to host; host decides arm vs resume vs stop,
  // with D-05 double-trigger guard inside onTransport().
  onMount(() => tickSource.subscribeTransport((kind) => host.onTransport(kind)));

  let heldKeys = $state<Set<Key>>(new Set());
  let latchedKey = $state<Key | null>(null);

  // Highlight state is component-owned; host signals cleanup via setOnPanic so EVERY
  // panic path (mode switch, transport stop, device disconnect, browser unload) clears
  // the UI — never a stuck-lit pad after the audio stops (UAT tests 16, 20).
  function clearAllHighlights(): void {
    heldKeys = new Set();
    latchedKey = null;
  }
  onMount(() => host.setOnPanic(clearAllHighlights));

  // Pads to render as "held" — physically down pads plus the latched pad (if any).
  const displayKeys = $derived.by(() => {
    if (latchedKey === null) return heldKeys;
    const out = new Set(heldKeys);
    out.add(latchedKey);
    return out;
  });

  function press(key: Key, notes: number[]): void {
    host.padPressed(key, notes);
    heldKeys = new Set(heldKeys).add(key);
    if (ui.latch) latchedKey = key;
  }
  function release(key: Key): void {
    host.padReleased(key);
    const next = new Set(heldKeys);
    next.delete(key);
    heldKeys = next;
    // Mirror host.padReleased: it keeps sounding when latch is LIVE-on at release time
    // (host.ts), regardless of latch state at press time. The visual must use the same
    // live rule, else enabling latch mid-hold leaves latchedKey null → highlight clears
    // while the note keeps sounding (UAT re-verify test 6, second desync).
    if (ui.latch) latchedKey = key;
  }

  // Clear the latched pad when latch is turned off. Do NOT touch heldKeys: it already
  // tracks only physically-held pads (press adds, release removes), so a pad still held
  // (mouse OR keyboard) stays lit AND sounding, while a latched-then-released pad has an
  // empty heldKeys and goes dark via latchedKey=null. The old `downKeys.size === 0` guard
  // was keyboard-only — it wiped the highlight of a MOUSE-held pad while the note kept
  // sounding (visual/audio desync, UAT re-verify test 6 bonus).
  $effect(() => {
    if (!ui.latch) {
      latchedKey = null;
    }
  });

  // Ableton "Computer MIDI Keyboard" mapping.
  const KEY_TO_PAD: Record<string, Key> = {
    a: 'C',  w: 'C#', s: 'D',  e: 'D#', d: 'E',  f: 'F',
    t: 'F#', g: 'G',  y: 'G#', h: 'A',  u: 'A#', j: 'B',
  };
  // Tracks which physical keys are down to ignore key-repeat noise.
  const downKeys = new Set<string>();

  function onKeyDown(ev: KeyboardEvent): void {
    // Don't steal input from form elements (BPM number input, dropdowns).
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) {
      return;
    }
    const k = ev.key.toLowerCase();
    const isAppKey =
      k in KEY_TO_PAD ||
      k === 'z' || k === 'x' ||
      ev.key === 'ArrowLeft' || ev.key === 'ArrowRight' ||
      ev.key === 'ArrowUp' || ev.key === 'ArrowDown' ||
      ev.key === ' ' || k === 'spacebar' ||
      (k >= '1' && k <= '6');
    // preventDefault must run on key-repeat too — otherwise HOLDING a scroll-default key
    // (↑/↓/Space) lets the browser scroll the page (UAT re-verify test 7). The repeat-guard
    // below only dedups the ACTION (note retrigger / bank step), never the scroll-suppression.
    if (isAppKey) ev.preventDefault();
    if (ev.repeat) return;
    if (k in KEY_TO_PAD) {
      const padKey = KEY_TO_PAD[k]!;
      const c = getBank(ui.bankIndex).chords.find((c) => c.key === padKey);
      if (!c) return;
      downKeys.add(k);
      press(padKey, c.notes);
      return;
    }
    if (k === 'z') { bumpTranspose(-1); return; }
    if (k === 'x') { bumpTranspose(1);  return; }
    if (ev.key === 'ArrowLeft')  { setBank(ui.bankIndex - 1); return; }
    if (ev.key === 'ArrowRight') { setBank(ui.bankIndex + 1); return; }
    // ↑/↓ are unbound but still scroll the page (browser default on a focusable body).
    // Swallowed above so the app never scrolls under the player (UAT test 15). Not wired to
    // variation-cycling — that's a Polish Backlog idea, out of scope for gap closure.
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') return;
    if (ev.key === ' ' || k === 'spacebar') { toggleLatch(); return; }
    // Cycle style: number keys 1-6
    if (k >= '1' && k <= '6') {
      const map = ['hold', 'arp1', 'arp2', 'phraseDur', 'rhythm4', 'rhythm5'] as const;
      setStyle(map[Number(k) - 1]!);
    }
  }

  function onKeyUp(ev: KeyboardEvent): void {
    const k = ev.key.toLowerCase();
    if (k in KEY_TO_PAD && downKeys.has(k)) {
      downKeys.delete(k);
      release(KEY_TO_PAD[k]!);
    }
  }

  // Browser reload/close tears down the WebMidi context WITHOUT firing note-offs, so a
  // latched chord hangs on the synth (UAT test 6). The onMount-return panic only runs on
  // Svelte component teardown, NOT on browser unload — so listen for unload directly.
  // pagehide is primary (more reliable on mobile Safari / iOS "Web MIDI Browser");
  // beforeunload is the desktop fallback. Both call the same idempotent panic().
  const onUnload = (): void => host.panic();

  onMount(() => {
    // passive:false — Space + arrow keys scroll a focusable body by default; a passive
    // listener would ignore preventDefault and the page would still scroll (UAT tests 14, 15).
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pagehide', onUnload);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pagehide', onUnload);
      window.removeEventListener('beforeunload', onUnload);
      host.panic();
    };
  });

</script>

<main>
  <TopBar />
  <PianoLayout onPress={press} onRelease={release} heldKeys={displayKeys} />
  <footer>
    <p>
      Keys: <code>A S D F G H J</code> + <code>W E T Y U</code> = pads ·
      <code>Z / X</code> = transpose · <code>← / →</code> = bank ·
      <code>Space</code> = latch · <code>1–6</code> = style
    </p>
    {#if import.meta.env.DEV}
      <p class="dev-tag">dev build {BUILD_ID}</p>
    {/if}
  </footer>
</main>

<style>
  main {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    overflow-x: hidden;
    padding: var(--space-4) clamp(var(--space-2), 3vw, var(--space-12)) var(--space-6);
    font-family: system-ui, sans-serif;
    font-size: var(--t-body);
    color: var(--fg-0);
    background: var(--bg-0);
    min-height: 100vh;
    /* 02-03 only covered .topbar; iPhone double-tap still selected pad labels and
       other surfaces (UAT test 19). Suppress selection app-wide by default and
       kill the iOS long-press callout — editable inputs are re-enabled below. */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  :global(body) {
    margin: 0;
    background: var(--bg-0);
  }
  /* Form fields stay editable/selectable despite the app-wide suppression. */
  main :global(input),
  main :global(textarea) {
    user-select: text;
    -webkit-user-select: text;
  }
  footer {
    width: min(100%, 1100px);
    margin: 0 auto;
    padding: 0 var(--space-2) var(--space-4);
    text-align: center;
    color: var(--fg-3);
    font-size: var(--t-eyebrow);
    line-height: 1.5;
  }
  footer p { margin: 0; }
  footer code {
    display: inline-block;
    margin: 0 var(--space-1);
    padding: 0 var(--space-1);
    border: 1px solid var(--bg-3);
    border-radius: var(--radius-sm);
    background: var(--bg-1);
    color: var(--fg-1);
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    line-height: 1.5;
  }
  .dev-tag {
    margin-top: var(--space-2);
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    color: var(--fg-3);
    font-variant-numeric: tabular-nums;
  }

  /* D-08: iPad body scroll lock — prevents iOS rubber-band scroll / address-bar
     jitter when a pad press starts mid-screen. `max-width: 1366px` guard excludes
     large touchscreen Windows laptops with mice (Pitfall 7). */
  @media (pointer: coarse) and (max-width: 1366px) {
    :global(html), :global(body) {
      overflow: hidden;
      position: fixed;
      width: 100%;
      height: 100%;
      overscroll-behavior: none;
    }
  }
  /* The lock above assumed the UI fits the viewport (true in portrait). iPhone
     landscape is shorter than the UI, so position:fixed trapped the keys off-screen
     with no way to scroll to them (UAT test 19). On short/landscape viewports, restore
     scrollability so off-screen content is reachable; keep overscroll-behavior:none so
     the rubber-band/address-bar containment the lock was added for still holds. */
  @media (pointer: coarse) and (max-width: 1366px) and (max-height: 480px) {
    :global(html), :global(body) {
      overflow-y: auto;
      position: static;
      height: auto;
      overscroll-behavior: none;
    }
  }
</style>
