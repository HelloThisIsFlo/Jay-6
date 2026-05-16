<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from './components/TopBar.svelte';
  import PianoLayout from './components/PianoLayout.svelte';
  import { EngineHost } from './engines/host';
  import { getBank, type Key } from './banks';
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
  });

  // Bridge reactive UI state → imperative host calls.
  $effect(() => { host.setBpm(ui.bpm); });
  $effect(() => { host.setStyle(ui.style, ui.variation); });
  $effect(() => { host.setTranspose(ui.transpose); });
  $effect(() => { host.setLatch(ui.latch); });
  $effect(() => { host.setGatePercent(ui.gatePercent); });

  let heldKeys = $state<Set<Key>>(new Set());

  function press(key: Key, notes: number[]): void {
    host.padPressed(key, notes);
    heldKeys = new Set(heldKeys).add(key);
  }
  function release(key: Key): void {
    host.padReleased(key);
    const next = new Set(heldKeys);
    next.delete(key);
    heldKeys = next;
  }

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
  <PianoLayout onPress={press} onRelease={release} {heldKeys} />
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
</style>
