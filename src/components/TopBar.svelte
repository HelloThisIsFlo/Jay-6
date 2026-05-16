<script lang="ts">
  import { getMidiState, initMidi, selectOutput, setChannel, subscribeMidi, type MidiStatus } from '../midi';
  import { banks } from '../banks';
  import { onMount } from 'svelte';
  import {
    ui,
    setStyle,
    setVariation,
    setBank,
    bumpTranspose,
    setBpm,
    toggleLatch,
    setGatePercent,
    STYLE_LABELS,
    STYLE_VARIATION_COUNT,
    type StyleKind,
  } from '../state.svelte';

  let midiStatus = $state<MidiStatus>('idle');
  let midiOutputs = $state<{ id: string; name: string }[]>([]);
  let selectedOutputId = $state<string | null>(null);

  onMount(() => {
    const unsub = subscribeMidi((s) => {
      midiStatus = s.status;
      midiOutputs = [...s.outputs];
      selectedOutputId = s.selectedOutputId;
    });
    initMidi();
    return unsub;
  });

  const variationCount = $derived(STYLE_VARIATION_COUNT[ui.style]);
  const styleOptions: StyleKind[] = ['hold', 'arp1', 'arp2', 'phraseDur', 'rhythm4', 'rhythm5'];
  const showGate = $derived(ui.style === 'rhythm4' || ui.style === 'rhythm5');
</script>

<div class="topbar">
  <label class="field">
    <span>Output</span>
    <select
      disabled={midiStatus !== 'ready'}
      value={selectedOutputId ?? ''}
      onchange={(e) => selectOutput((e.currentTarget as HTMLSelectElement).value || null)}
    >
      {#if midiStatus === 'requesting'}
        <option>Requesting MIDI…</option>
      {:else if midiStatus === 'unsupported'}
        <option>Use Chrome/Edge</option>
      {:else if midiStatus === 'denied'}
        <option>Permission denied</option>
      {:else if midiStatus === 'error'}
        <option>MIDI error</option>
      {:else if midiOutputs.length === 0}
        <option value="">No outputs</option>
      {:else}
        {#each midiOutputs as o (o.id)}
          <option value={o.id}>{o.name}</option>
        {/each}
      {/if}
    </select>
  </label>

  <label class="field">
    <span>Ch</span>
    <select
      value={String(getMidiState().channel)}
      onchange={(e) => setChannel(Number((e.currentTarget as HTMLSelectElement).value))}
    >
      {#each Array.from({ length: 16 }, (_, i) => i + 1) as ch (ch)}
        <option value={String(ch)}>{ch}</option>
      {/each}
    </select>
  </label>

  <label class="field bank">
    <span>Bank</span>
    <div class="bank-row">
      <button class="arrow" onclick={() => setBank(ui.bankIndex - 1)} aria-label="Prev bank">‹</button>
      <select
        value={String(ui.bankIndex)}
        onchange={(e) => setBank(Number((e.currentTarget as HTMLSelectElement).value))}
      >
        {#each banks as b (b.index)}
          <option value={String(b.index)}
            >{String(b.index).padStart(2, '0')} — {b.name}</option
          >
        {/each}
      </select>
      <button class="arrow" onclick={() => setBank(ui.bankIndex + 1)} aria-label="Next bank">›</button>
    </div>
  </label>

  <label class="field">
    <span>Transpose</span>
    <div class="transpose">
      <button onclick={() => bumpTranspose(-1)} aria-label="Octave down">−12</button>
      <span class="trval">{ui.transpose >= 0 ? '+' : ''}{ui.transpose}</span>
      <button onclick={() => bumpTranspose(1)} aria-label="Octave up">+12</button>
    </div>
  </label>

  <label class="field">
    <span>BPM</span>
    <input
      type="number"
      min="40"
      max="240"
      value={ui.bpm}
      onchange={(e) => setBpm(Number((e.currentTarget as HTMLInputElement).value))}
    />
  </label>

  <label class="field">
    <span>Style</span>
    <select
      value={ui.style}
      onchange={(e) => setStyle((e.currentTarget as HTMLSelectElement).value as StyleKind)}
    >
      {#each styleOptions as k (k)}
        <option value={k}>{STYLE_LABELS[k]}</option>
      {/each}
    </select>
  </label>

  {#if variationCount > 0}
    <label class="field">
      <span>Var</span>
      <select
        value={String(ui.variation)}
        onchange={(e) => setVariation(Number((e.currentTarget as HTMLSelectElement).value))}
      >
        {#each Array.from({ length: variationCount }, (_, i) => i + 1) as v (v)}
          <option value={String(v)}>{v}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if showGate}
    <label class="field">
      <span>Gate</span>
      <input
        type="range"
        min="10"
        max="100"
        value={ui.gatePercent}
        oninput={(e) => setGatePercent(Number((e.currentTarget as HTMLInputElement).value))}
      />
      <span class="gateval">{ui.gatePercent}%</span>
    </label>
  {/if}

  <button class="latch" class:on={ui.latch} onclick={toggleLatch}>
    Latch {ui.latch ? '⊙' : '○'}
  </button>
</div>

<style>
  .topbar {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #1a1a1a;
    border-bottom: 1px solid #2a2a2a;
    flex-wrap: wrap;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #888;
  }
  .field > span {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  select, input[type='number'] {
    background: #2a2a2a;
    color: #eee;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 0.35rem 0.5rem;
    font-size: 0.9rem;
    min-width: 4ch;
  }
  select:disabled { color: #666; }
  .bank-row { display: flex; gap: 0.25rem; }
  .arrow {
    background: #2a2a2a;
    color: #eee;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 0 0.6rem;
    cursor: pointer;
    font-size: 1rem;
  }
  .arrow:hover { background: #3a3a3a; }
  .transpose {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .transpose button {
    background: #2a2a2a; color: #eee; border: 1px solid #3a3a3a;
    border-radius: 4px; padding: 0.25rem 0.45rem; cursor: pointer;
    font-size: 0.75rem;
  }
  .trval { min-width: 3ch; text-align: center; color: #eee; font-variant-numeric: tabular-nums; }
  .latch {
    align-self: flex-end;
    background: #2a2a2a; color: #eee; border: 1px solid #3a3a3a;
    border-radius: 4px; padding: 0.45rem 0.9rem; cursor: pointer;
    font-size: 0.9rem;
  }
  .latch.on { background: #ff7a1a; color: #111; border-color: #ff7a1a; }
  .gateval { color: #eee; font-variant-numeric: tabular-nums; min-width: 4ch; }
  input[type='range'] { accent-color: #ff7a1a; }
</style>
