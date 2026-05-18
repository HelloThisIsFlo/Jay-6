<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from './components/TopBar.svelte';
  import PianoLayout from './components/PianoLayout.svelte';
  import { EngineHost } from './engines/host';
  import { getBank, type Key } from './banks';
  import { subscribeMidi } from './midi';
  import { tickSource } from './tickSource';
  import {
    ui,
    setStyle,
    setBank,
    bumpTranspose,
    toggleLatch,
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
  onMount(() => subscribeMidi((s) => tickSource.setInputId(s.selectedInputId)));

  // D-04: forward inbound transport to host; host decides arm vs resume vs stop,
  // with D-05 double-trigger guard inside onTransport().
  onMount(() => tickSource.subscribeTransport((kind) => host.onTransport(kind)));

  let heldKeys = $state<Set<Key>>(new Set());
  let latchedKey = $state<Key | null>(null);

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
  }

  // Clear the latched highlight when latch is turned off.
  $effect(() => {
    if (!ui.latch) latchedKey = null;
  });

  // Ableton "Computer MIDI Keyboard" mapping.
  const KEY_TO_PAD: Record<string, Key> = {
    a: 'C',  w: 'C#', s: 'D',  e: 'D#', d: 'E',  f: 'F',
    t: 'F#', g: 'G',  y: 'G#', h: 'A',  u: 'A#', j: 'B',
  };
  // Tracks which physical keys are down to ignore key-repeat noise.
  const downKeys = new Set<string>();

  function onKeyDown(ev: KeyboardEvent): void {
    if (ev.repeat) return;
    // Don't steal input from form elements (BPM number input, dropdowns).
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) {
      return;
    }
    const k = ev.key.toLowerCase();
    if (k in KEY_TO_PAD) {
      const padKey = KEY_TO_PAD[k]!;
      const c = getBank(ui.bankIndex).chords.find((c) => c.key === padKey);
      if (!c) return;
      downKeys.add(k);
      press(padKey, c.notes);
      ev.preventDefault();
      return;
    }
    if (k === 'z') { bumpTranspose(-1); ev.preventDefault(); return; }
    if (k === 'x') { bumpTranspose(1);  ev.preventDefault(); return; }
    if (ev.key === 'ArrowLeft')  { setBank(ui.bankIndex - 1); ev.preventDefault(); return; }
    if (ev.key === 'ArrowRight') { setBank(ui.bankIndex + 1); ev.preventDefault(); return; }
    if (ev.key === ' ' || k === 'spacebar') {
      toggleLatch();
      ev.preventDefault();
      return;
    }
    // Cycle style: number keys 1-6
    if (k >= '1' && k <= '6') {
      const map = ['hold', 'arp1', 'arp2', 'phraseDur', 'rhythm4', 'rhythm5'] as const;
      setStyle(map[Number(k) - 1]!);
      ev.preventDefault();
    }
  }

  function onKeyUp(ev: KeyboardEvent): void {
    const k = ev.key.toLowerCase();
    if (k in KEY_TO_PAD && downKeys.has(k)) {
      downKeys.delete(k);
      release(KEY_TO_PAD[k]!);
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
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
  </footer>
</main>

<style>
  main {
    font-family: system-ui, sans-serif;
    color: #eee;
    background: #111;
    min-height: 100vh;
  }
  footer {
    text-align: center;
    color: #666;
    font-size: 0.8rem;
    padding: 1rem 1rem 2rem;
  }
  footer code {
    background: #222;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    margin: 0 0.05rem;
    font-size: 0.78rem;
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
</style>
