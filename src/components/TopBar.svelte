<script lang="ts">
  import {
    initMidi,
    selectInput,
    selectOutput,
    setChannel,
    subscribeMidi,
    type MidiPortInfo,
    type MidiStatus,
  } from '../midi';
  import { banks } from '../banks';
  import { onMount } from 'svelte';
  import VariationPicker from './VariationPicker.svelte';
  import { variationOptionsForStyle } from '../variationOptions';
  import {
    ui,
    setStyle,
    setVariation,
    setBank,
    bumpTranspose,
    setBpm,
    toggleLatch,
    setGatePercent,
    setClockSource,
    STYLE_LABELS,
    STYLE_VARIATION_COUNT,
    type StyleKind,
  } from '../state.svelte';

  let midiStatus = $state<MidiStatus>('idle');
  let midiOutputs = $state<MidiPortInfo[]>([]);
  let midiInputs = $state<MidiPortInfo[]>([]);
  let selectedOutputId = $state<string | null>(null);
  let selectedInputId = $state<string | null>(null);
  let midiChannel = $state(1);

  // Only one overlay open at a time — opening one closes the other (they share the bar).
  let setupOpen = $state(false);
  let variationOpen = $state(false);

  onMount(() => {
    const unsub = subscribeMidi((s) => {
      midiStatus = s.status;
      midiOutputs = [...s.outputs];
      midiInputs = [...s.inputs];
      selectedOutputId = s.selectedOutputId;
      selectedInputId = s.selectedInputId;
      midiChannel = s.channel;
    });
    initMidi();
    return unsub;
  });

  const styleOptions: StyleKind[] = ['hold', 'arp1', 'arp2', 'phraseDur', 'rhythm4', 'rhythm5'];
  const showGate = $derived(ui.style === 'rhythm4' || ui.style === 'rhythm5');
  const hasVariation = $derived(STYLE_VARIATION_COUNT[ui.style] > 0);

  // Compact V-number for the closed-bar variation trigger (e.g. "V05"). The full
  // per-style picker lives in the popover; the bar only shows the resolved readout.
  const variationReadout = $derived.by(() => {
    const model = variationOptionsForStyle(ui.style);
    if (model.kind === 'none') return '';
    const opt = model.options.find((o) => o.index === ui.variation) ?? model.options[0];
    return opt?.vLabel ?? `V${String(ui.variation).padStart(2, '0')}`;
  });

  const selectedOutputName = $derived(
    selectedOutputId
      ? midiOutputs.find((output) => output.id === selectedOutputId)?.name ?? 'Missing output'
      : outputFallback(),
  );
  const clockLabel = $derived(ui.clockSource === 'external' ? 'EXT' : 'INT');
  const transposeLabel = $derived(`${ui.transpose >= 0 ? '+' : ''}${ui.transpose}`);

  function outputFallback(): string {
    if (midiStatus === 'unsupported') return 'Use Chrome/Edge';
    if (midiStatus === 'requesting') return 'Requesting MIDI';
    if (midiStatus === 'denied') return 'Permission denied';
    if (midiStatus === 'error') return 'MIDI error';
    if (midiStatus === 'ready') return 'No output';
    return 'MIDI idle';
  }

  function openSetup(): void {
    variationOpen = false;
    setupOpen = !setupOpen;
  }

  function openVariation(): void {
    setupOpen = false;
    variationOpen = !variationOpen;
  }

  function closeAll(): void {
    setupOpen = false;
    variationOpen = false;
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if ((setupOpen || variationOpen) && event.key === 'Escape') closeAll();
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="topbar">
  <!-- Backdrop: click anywhere off the open popover to dismiss (mirrors hardware "tap away"). -->
  {#if setupOpen || variationOpen}
    <button class="backdrop" type="button" aria-label="Close" onclick={closeAll}></button>
  {/if}

  <!-- Status pill: routing + channel + BPM + clock folded into one readout (D-04). -->
  <div class="zone pill-zone">
    <button
      type="button"
      class="status-pill"
      class:open={setupOpen}
      aria-expanded={setupOpen}
      aria-controls="setup-popover"
      onclick={openSetup}
    >
      <span class="dot" class:live={selectedOutputId !== null} aria-hidden="true"></span>
      <span class="pill-text">
        <span class="pill-out">{selectedOutputName}</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="pill-seg">Ch {midiChannel}</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="pill-seg"><b>{ui.bpm}</b> BPM</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="pill-seg">{clockLabel}</span>
      </span>
      <span class="chev" aria-hidden="true">▾</span>
    </button>

    {#if setupOpen}
      <div class="popover setup-popover" id="setup-popover" role="dialog" aria-label="Setup">
        <div class="popover-head">
          <span>Setup</span>
          <button type="button" class="close" aria-label="Close setup" onclick={closeAll}>×</button>
        </div>

        <label class="field">
          <span>Output</span>
          <select
            disabled={midiStatus !== 'ready'}
            value={selectedOutputId ?? ''}
            onchange={(e) => selectOutput((e.currentTarget as HTMLSelectElement).value || null)}
          >
            {#if midiStatus === 'requesting'}
              <option>Requesting MIDI...</option>
            {:else if midiStatus === 'unsupported'}
              <option>Use Chrome/Edge</option>
            {:else if midiStatus === 'denied'}
              <option>Permission denied</option>
            {:else if midiStatus === 'error'}
              <option>MIDI error</option>
            {:else if midiOutputs.length === 0}
              <option value="">No outputs</option>
            {:else}
              {#each midiOutputs as output (output.id)}
                <option value={output.id}>{output.name}</option>
              {/each}
            {/if}
          </select>
        </label>

        <label class="field">
          <span>Input</span>
          <select
            disabled={midiStatus !== 'ready'}
            value={selectedInputId ?? ''}
            onchange={(e) => selectInput((e.currentTarget as HTMLSelectElement).value || null)}
          >
            {#if midiStatus === 'requesting'}
              <option>Requesting MIDI...</option>
            {:else if midiStatus === 'unsupported'}
              <option>Use Chrome/Edge</option>
            {:else if midiStatus === 'denied'}
              <option>Permission denied</option>
            {:else if midiStatus === 'error'}
              <option>MIDI error</option>
            {:else}
              <option value="">No input</option>
              {#each midiInputs as input (input.id)}
                <option value={input.id}>{input.name}</option>
              {/each}
            {/if}
          </select>
        </label>

        <label class="field">
          <span>Channel</span>
          <select
            value={String(midiChannel)}
            onchange={(e) => setChannel(Number((e.currentTarget as HTMLSelectElement).value))}
          >
            {#each Array.from({ length: 16 }, (_, i) => i + 1) as ch (ch)}
              <option value={String(ch)}>{ch}</option>
            {/each}
          </select>
        </label>

        <label class="field">
          <span>Clock</span>
          <div class="seg">
            <button
              type="button"
              class:on={ui.clockSource === 'internal'}
              onclick={() => setClockSource('internal')}
            >Int</button>
            <button
              type="button"
              class:on={ui.clockSource === 'external'}
              onclick={() => setClockSource('external')}
              disabled={!selectedInputId}
              title={selectedInputId ? '' : 'Select an Input first'}
            >Ext</button>
          </div>
        </label>

        <label class="field">
          <span>BPM</span>
          <input
            type="number"
            min="40"
            max="240"
            value={ui.bpm}
            disabled={ui.clockSource === 'external'}
            readonly={ui.clockSource === 'external'}
            aria-readonly={ui.clockSource === 'external'}
            onchange={(e) => setBpm(Number((e.currentTarget as HTMLInputElement).value))}
          />
        </label>
      </div>
    {/if}
  </div>

  <!-- Bank stepper: ‹ 01 Pop › — prev/next flank the direct 100-bank select. -->
  <div class="zone bank-zone">
    <button type="button" class="step" onclick={() => setBank(ui.bankIndex - 1)} aria-label="Prev bank">‹</button>
    <div class="bank-select">
      <select
        aria-label="Bank"
        value={String(ui.bankIndex)}
        onchange={(e) => setBank(Number((e.currentTarget as HTMLSelectElement).value))}
      >
        {#each banks as bank (bank.index)}
          <option value={String(bank.index)}>{String(bank.index).padStart(2, '0')} {bank.name}</option>
        {/each}
      </select>
    </div>
    <button type="button" class="step" onclick={() => setBank(ui.bankIndex + 1)} aria-label="Next bank">›</button>
  </div>

  <!-- Style + variation readout: style select, then a trigger that opens the picker popover. -->
  <div class="zone style-zone">
    <div class="style-select">
      <select
        aria-label="Style"
        value={ui.style}
        onchange={(e) => setStyle((e.currentTarget as HTMLSelectElement).value as StyleKind)}
      >
        {#each styleOptions as style (style)}
          <option value={style}>{STYLE_LABELS[style]}</option>
        {/each}
      </select>
    </div>

    {#if hasVariation}
      <button
        type="button"
        class="var-trigger"
        class:open={variationOpen}
        aria-expanded={variationOpen}
        aria-controls="variation-popover"
        onclick={openVariation}
      >
        <span class="var-num">{variationReadout}</span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
    {/if}

    {#if variationOpen && hasVariation}
      <div class="popover variation-popover" id="variation-popover" role="dialog" aria-label="Variation">
        <!-- Title/readout comes from VariationPicker's own head; this head is close-only. -->
        <div class="popover-head close-only">
          <button type="button" class="close" aria-label="Close variation" onclick={closeAll}>×</button>
        </div>

        <VariationPicker style={ui.style} variation={ui.variation} onSelect={(index) => setVariation(index)} />

        {#if showGate}
          <label class="gate-field">
            <span>Gate</span>
            <div class="gate-row">
              <input
                type="range"
                min="10"
                max="100"
                value={ui.gatePercent}
                oninput={(e) => setGatePercent(Number((e.currentTarget as HTMLInputElement).value))}
              />
              <span class="gateval">{ui.gatePercent}%</span>
            </div>
          </label>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Transpose: − +0 + octave stepper. -->
  <div class="zone transpose-zone">
    <button type="button" class="step" onclick={() => bumpTranspose(-1)} aria-label="Octave down">−</button>
    <span class="trval">{transposeLabel}</span>
    <button type="button" class="step" onclick={() => bumpTranspose(1)} aria-label="Octave up">+</button>
  </div>

  <!-- Latch: performance control, pushed to the right edge. Steel when on (orange is
       reserved for sounding/latched pads per D-03), not a solid-orange toggle. -->
  <button type="button" class="latch" class:on={ui.latch} onclick={toggleLatch} aria-pressed={ui.latch}>
    <span class="latch-word">LATCH</span>
    <span class="latch-state">{ui.latch ? 'On' : 'Off'}</span>
  </button>
</div>

<style>
  .topbar {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    width: min(100%, 1100px);
    margin: 0 auto;
    padding: var(--space-2) var(--space-3, 12px);
    background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
    border: 1px solid var(--bg-3);
    border-radius: var(--radius-lg);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
    user-select: none;
    -webkit-user-select: none;
  }

  /* Each control cluster reads as one dark segment on the strip. */
  .zone {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
    border: none;
    background: transparent;
    cursor: default;
  }

  /* ── Status pill ───────────────────────────────────────────────────── */
  /* Content-sized (grow:0) so the folded readout ("No output · Ch 1 · 110 BPM
     · INT") shows in full without ballooning the pill and wrapping LATCH to a
     second row. Latch's margin-left:auto then absorbs the free space and pins
     LATCH to the right edge on one row. Shrinks (pill-out ellipsizes) only when
     the viewport is too narrow for the whole strip. */
  .pill-zone {
    flex: 0 1 auto;
    min-width: 0;
    z-index: 12;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 44px;
    padding: 0 var(--space-3, 12px);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-0);
    color: var(--fg-0);
    cursor: pointer;
    text-align: left;
  }

  .status-pill:hover,
  .status-pill:focus-visible,
  .status-pill.open {
    border-color: var(--system);
    outline: none;
  }

  .dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--fg-3);
    box-shadow: 0 0 0 3px rgb(0 0 0 / 0.35);
  }

  .dot.live {
    background: var(--system);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--system) 22%, transparent);
  }

  .pill-text {
    flex: 1 1 auto;
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    min-width: 0;
    font-family: var(--mono);
    font-size: var(--t-body);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
  }

  .pill-out {
    min-width: 0;
    max-width: 16ch;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--fg-0);
  }

  .pill-seg {
    flex: 0 0 auto;
    color: var(--fg-1);
  }

  .pill-seg b {
    color: var(--fg-0);
    font-weight: 600;
  }

  .sep {
    flex: 0 0 auto;
    color: var(--fg-3);
  }

  .chev {
    flex: 0 0 auto;
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
  }

  /* ── Bank ──────────────────────────────────────────────────────────── */
  .bank-zone .bank-select {
    position: relative;
    min-width: 0;
  }

  .bank-select select {
    max-width: 120px;
  }

  /* ── Style + variation ─────────────────────────────────────────────── */
  .style-zone {
    z-index: 11;
  }

  .style-select select {
    max-width: 210px;
  }

  .var-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-height: 44px;
    padding: 0 var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
  }

  .var-trigger:hover,
  .var-trigger:focus-visible,
  .var-trigger.open {
    border-color: var(--system);
    outline: none;
  }

  .var-num {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--system);
    font-weight: 600;
  }

  /* ── Transpose ─────────────────────────────────────────────────────── */
  .trval {
    min-width: 3ch;
    padding: 0 var(--space-1);
    color: var(--fg-0);
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  /* ── Latch ─────────────────────────────────────────────────────────── */
  .latch {
    margin-left: auto;
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    min-height: 44px;
    padding: 0 var(--space-4);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    letter-spacing: 0.04em;
  }

  .latch:hover,
  .latch:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  .latch.on {
    border-color: var(--system);
    background: var(--system-soft);
  }

  .latch-word {
    font-weight: 600;
    font-size: var(--t-body);
  }

  .latch-state {
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    color: var(--fg-2);
  }

  .latch.on .latch-state {
    color: var(--fg-0);
  }

  /* ── Shared step buttons (bank arrows + transpose) ─────────────────── */
  .step {
    display: grid;
    place-items: center;
    min-width: 40px;
    min-height: 44px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font-size: var(--t-readout);
    font-family: var(--mono);
    touch-action: manipulation;
  }

  .step:hover,
  .step:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  /* ── Native selects on the strip (bank, style) ─────────────────────── */
  .bank-select select,
  .style-select select {
    min-height: 44px;
    min-width: 0;
    width: 100%;
    padding: 0 var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    font: inherit;
    font-family: var(--mono);
  }

  /* ── Popovers (setup + variation share the visual language) ────────── */
  .popover {
    position: absolute;
    top: calc(100% + var(--space-2));
    z-index: 11;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-lg);
    background: var(--bg-2);
    box-shadow: 0 18px 56px rgb(0 0 0 / 0.48);
  }

  .setup-popover {
    left: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    width: min(420px, calc(100vw - var(--space-8)));
    padding: var(--space-4);
  }

  .variation-popover {
    left: 0;
    display: grid;
    gap: var(--space-3, 12px);
    width: min(560px, calc(100vw - var(--space-8)));
    max-height: min(70vh, 560px);
    overflow-y: auto;
    padding: var(--space-4);
  }

  .popover-head {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
  }

  /* Variation popover: close button only, right-aligned (title is the picker's own head). */
  .popover-head.close-only {
    justify-content: flex-end;
    margin-bottom: calc(-1 * var(--space-2));
  }

  .close {
    width: 44px;
    height: 44px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-3);
    color: var(--fg-0);
    cursor: pointer;
    font-size: var(--t-readout);
  }

  .close:hover,
  .close:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  /* Setup popover fields */
  .field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .field > span {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
  }

  .field select,
  .field input[type='number'] {
    min-height: 44px;
    min-width: 0;
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    font: inherit;
  }

  .field select:disabled,
  .field input:disabled {
    color: var(--fg-3);
    border-color: var(--bg-3);
  }

  .seg {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .seg button {
    min-width: 44px;
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--bg-4);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font: inherit;
    touch-action: manipulation;
  }

  .seg button:first-child {
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  .seg button:last-child {
    border-left: none;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .seg button.on {
    border-color: var(--system);
    background: var(--system-soft);
    color: var(--fg-0);
  }

  .seg button:disabled {
    color: var(--fg-3);
    cursor: not-allowed;
  }

  /* Gate lives in the variation popover for rhythm styles. */
  .gate-field {
    display: grid;
    gap: var(--space-1);
  }

  .gate-field > span {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
  }

  .gate-row {
    display: flex;
    align-items: center;
    gap: var(--space-3, 12px);
  }

  input[type='range'] {
    flex: 1 1 auto;
    min-height: 44px;
    accent-color: var(--system);
    touch-action: manipulation;
  }

  .gateval {
    min-width: 4ch;
    color: var(--fg-0);
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  button:active {
    filter: brightness(1.12);
  }

  /* Narrow viewports: the strip wraps; popovers span the padded viewport width. */
  @media (max-width: 620px) {
    .topbar {
      padding: var(--space-2);
    }

    .pill-zone {
      flex-basis: 100%;
    }

    .setup-popover {
      grid-template-columns: 1fr;
      width: calc(100vw - var(--space-4));
    }

    .variation-popover {
      width: calc(100vw - var(--space-4));
    }
  }
</style>
