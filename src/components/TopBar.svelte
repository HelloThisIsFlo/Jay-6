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

  // One overlay at a time. Custom popovers (not native <select>) so the strip
  // renders identically on iOS Safari, which ignores <select> styling.
  type Popover = 'setup' | 'bank' | 'style' | 'variation';
  let openPopover = $state<Popover | null>(null);
  const isOpen = (p: Popover) => openPopover === p;
  function toggle(p: Popover): void {
    openPopover = openPopover === p ? null : p;
  }
  function closeAll(): void {
    openPopover = null;
  }

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

  const currentBank = $derived(banks.find((b) => b.index === ui.bankIndex) ?? banks[0]!);
  const bankNum = $derived(String(ui.bankIndex).padStart(2, '0'));

  // Short style tag for the compact readout (the full label lives in the picker).
  const styleTag = $derived.by(() => {
    switch (ui.style) {
      case 'hold': return 'Hold';
      case 'arp1': return 'Arp · 8th';
      case 'arp2': return 'Arp · 16th';
      case 'phraseDur': return 'Beat';
      case 'rhythm4': return 'Gate 4';
      case 'rhythm5': return 'Gate 5';
    }
  });

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
  const transposeOctaves = $derived(ui.transpose / 12);
  const transposeLabel = $derived(
    `${transposeOctaves > 0 ? '+' : ''}${transposeOctaves} OCT`,
  );

  function outputFallback(): string {
    if (midiStatus === 'unsupported') return 'Use Chrome/Edge';
    if (midiStatus === 'requesting') return 'Requesting MIDI';
    if (midiStatus === 'denied') return 'Permission denied';
    if (midiStatus === 'error') return 'MIDI error';
    if (midiStatus === 'ready') return 'No output';
    return 'MIDI idle';
  }

  function pickBank(index: number): void {
    setBank(index);
    closeAll();
  }

  function pickStyle(kind: StyleKind): void {
    setStyle(kind);
    // Keep the panel useful: Hold has no variation, so just close; otherwise
    // stay open on the style panel so the user can jump straight to variation.
    closeAll();
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (openPopover !== null && event.key === 'Escape') closeAll();
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="topbar">
  {#if openPopover !== null}
    <button class="backdrop" type="button" aria-label="Close" onclick={closeAll}></button>
  {/if}

  <!-- Status pill: routing + channel + BPM + clock folded into one readout (D-04). -->
  <div class="zone pill-zone">
    <button
      type="button"
      class="status-pill"
      class:open={isOpen('setup')}
      aria-expanded={isOpen('setup')}
      onclick={() => toggle('setup')}
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

    {#if isOpen('setup')}
      <div class="popover setup-popover" role="dialog" aria-label="Setup">
        <div class="popover-head">
          <span>Setup</span>
          <span class="setup-state">
            <span class="setup-dot" class:live={selectedOutputId !== null} aria-hidden="true"></span>
            {selectedOutputId !== null ? 'Connected' : midiStatus === 'ready' ? 'Ready' : 'Offline'}
          </span>
          <button type="button" class="close" aria-label="Close setup" onclick={closeAll}>×</button>
        </div>

        <label class="field full">
          <span>Output</span>
          <select
            disabled={midiStatus !== 'ready'}
            value={selectedOutputId ?? ''}
            onchange={(e) => selectOutput((e.currentTarget as HTMLSelectElement).value || null)}
          >
            {#if midiStatus === 'requesting'}
              <option value="">Requesting MIDI...</option>
            {:else if midiStatus === 'unsupported'}
              <option value="">Use Chrome/Edge</option>
            {:else if midiStatus === 'denied'}
              <option value="">Permission denied</option>
            {:else if midiStatus === 'error'}
              <option value="">MIDI error</option>
            {:else if midiOutputs.length === 0}
              <option value="">No outputs</option>
            {:else}
              {#each midiOutputs as output (output.id)}
                <option value={output.id}>{output.name}</option>
              {/each}
            {/if}
          </select>
        </label>

        <label class="field full">
          <span>Input</span>
          <select
            disabled={midiStatus !== 'ready'}
            value={selectedInputId ?? ''}
            onchange={(e) => selectInput((e.currentTarget as HTMLSelectElement).value || null)}
          >
            {#if midiStatus === 'requesting'}
              <option value="">Requesting MIDI...</option>
            {:else if midiStatus === 'unsupported'}
              <option value="">Use Chrome/Edge</option>
            {:else if midiStatus === 'denied'}
              <option value="">Permission denied</option>
            {:else if midiStatus === 'error'}
              <option value="">MIDI error</option>
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

        <label class="field full">
          <span>BPM</span>
          <div class="bpm-stepper">
            <button
              type="button"
              aria-label="Decrease BPM"
              disabled={ui.clockSource === 'external'}
              onclick={() => setBpm(ui.bpm - 1)}
            >−</button>
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
            <button
              type="button"
              aria-label="Increase BPM"
              disabled={ui.clockSource === 'external'}
              onclick={() => setBpm(ui.bpm + 1)}
            >+</button>
          </div>
        </label>
      </div>
    {/if}
  </div>

  <!-- Bank: ‹ [01 Pop] › — arrows step; the readout opens a scrollable bank list. -->
  <div class="zone bank-zone">
    <button type="button" class="step" onclick={() => setBank(ui.bankIndex - 1)} aria-label="Prev bank">‹</button>
    <button type="button" class="readout bank-readout" class:open={isOpen('bank')} onclick={() => toggle('bank')}>
      <span class="mono num">{bankNum}</span>
      <span class="readout-name">{currentBank.name}</span>
      <span class="chev" aria-hidden="true">▾</span>
    </button>
    <button type="button" class="step" onclick={() => setBank(ui.bankIndex + 1)} aria-label="Next bank">›</button>

    {#if isOpen('bank')}
      <div class="popover list-popover" role="dialog" aria-label="Bank">
        <div class="popover-head">
          <span>Bank</span>
          <button type="button" class="close" aria-label="Close bank list" onclick={closeAll}>×</button>
        </div>
        <ul class="bank-list">
          {#each banks as bank (bank.index)}
            <li>
              <button
                type="button"
                class="list-item"
                class:selected={bank.index === ui.bankIndex}
                onclick={() => pickBank(bank.index)}
              >
                <span class="mono num">{String(bank.index).padStart(2, '0')}</span>
                <span class="list-name">{bank.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <!-- Style readout → style picker; variation readout → variation picker. -->
  <div class="zone style-zone">
    <button
      type="button"
      class="readout style-readout"
      class:joined={hasVariation}
      class:open={isOpen('style')}
      onclick={() => toggle('style')}
    >
      <span class="readout-name">{styleTag}</span>
      <span class="chev" aria-hidden="true">▾</span>
    </button>

    {#if hasVariation}
      <button
        type="button"
        class="readout var-trigger"
        class:open={isOpen('variation')}
        onclick={() => toggle('variation')}
      >
        <span class="mini-glyph" aria-hidden="true">
          {#if ui.style === 'arp1' || ui.style === 'arp2'}
            <svg viewBox="0 0 30 16">
              <polyline points="3,13 10,10 17,6 25,3" />
              <circle cx="3" cy="13" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="17" cy="6" r="1.5" />
              <circle cx="25" cy="3" r="1.5" />
            </svg>
          {:else if ui.style === 'phraseDur'}
            <span class="note-mark">♪</span>
          {:else}
            <span class="gate-mark"><i></i><i></i><i></i><i></i></span>
          {/if}
        </span>
        <span class="var-num">{variationReadout.slice(1)}</span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
    {/if}

    {#if isOpen('style')}
      <div class="popover list-popover style-popover" role="dialog" aria-label="Style">
        <div class="popover-head">
          <span>Style</span>
          <button type="button" class="close" aria-label="Close style list" onclick={closeAll}>×</button>
        </div>
        <ul class="style-list">
          {#each styleOptions as style (style)}
            <li>
              <button
                type="button"
                class="list-item"
                class:selected={style === ui.style}
                onclick={() => pickStyle(style)}
              >
                {STYLE_LABELS[style]}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if isOpen('variation') && hasVariation}
      <div class="popover variation-popover" role="dialog" aria-label="Variation">
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

  <!-- The approved C2 strip uses active latch as its far-right performance anchor. -->
  <button type="button" class="latch" class:on={ui.latch} onclick={toggleLatch} aria-pressed={ui.latch}>
    <span class="latch-icon" aria-hidden="true">⊙</span>
    LATCH
  </button>
</div>

<style>
  .topbar {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 12px 18px;
    background: var(--bg-1);
    border: 0;
    border-bottom: 1px solid var(--bg-3);
    border-radius: 0;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.035);
    user-select: none;
    -webkit-user-select: none;
  }

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
  .pill-zone {
    flex: 0 1 280px;
    min-width: 0;
    z-index: 12;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(100%, 280px);
    min-height: 58px;
    padding: 0 14px 0 12px;
    border: 1px solid var(--bg-4);
    border-radius: 999px;
    background: var(--bg-2);
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
    background: #3eb45c;
    box-shadow: 0 0 0 3px rgb(62 180 92 / 0.2);
  }

  .pill-text {
    flex: 1 1 auto;
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
  }

  .pill-out {
    min-width: 0;
    max-width: 12ch;
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

  /* ── Shared readout buttons (bank, style, variation) ───────────────── */
  .readout {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 54px;
    padding: 0 var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font: inherit;
  }

  .readout:hover,
  .readout:focus-visible,
  .readout.open {
    border-color: var(--system);
    outline: none;
  }

  .readout .num {
    color: var(--fg-2);
  }

  .readout-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bank-readout {
    min-width: 88px;
    min-height: 58px;
    max-width: 160px;
  }

  .style-readout {
    max-width: 140px;
    font-family: var(--mono);
  }

  .style-zone {
    gap: 0;
  }

  .style-readout.joined {
    border-right: 0;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  .var-trigger {
    gap: 6px;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .mono {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
  }

  .var-num {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--fg-1);
    font-weight: 600;
  }

  .mini-glyph {
    display: grid;
    place-items: center;
    width: 30px;
    height: 18px;
    color: var(--fg-2);
  }

  .mini-glyph svg {
    width: 30px;
    height: 16px;
    overflow: visible;
  }

  .mini-glyph polyline {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mini-glyph circle {
    fill: currentColor;
  }

  .note-mark {
    font-family: var(--mono);
    font-size: var(--t-readout);
    line-height: 1;
  }

  .gate-mark {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .gate-mark i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Transpose ─────────────────────────────────────────────────────── */
  .trval {
    min-width: 6ch;
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
    align-items: center;
    justify-content: center;
    min-width: 110px;
    min-height: 66px;
    padding: 0 22px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font-weight: 600;
    font-size: var(--t-body);
    letter-spacing: 0.04em;
  }

  .latch:hover,
  .latch:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  .latch.on {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg-0);
  }

  .latch-icon {
    margin-right: 6px;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1;
  }

  /* ── Shared step buttons (bank arrows + transpose) ─────────────────── */
  .step {
    display: grid;
    place-items: center;
    min-width: 40px;
    min-height: 50px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font-size: var(--t-readout);
    font-family: var(--mono);
    touch-action: manipulation;
  }

  .bank-zone .step {
    min-width: 52px;
  }

  .transpose-zone .step {
    min-width: 40px;
    min-height: 36px;
  }

  .step:hover,
  .step:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  /* ── Popovers ──────────────────────────────────────────────────────── */
  .popover {
    position: absolute;
    box-sizing: border-box;
    top: calc(100% + var(--space-2));
    z-index: 11;
    border: 1px solid var(--bg-4);
    border-radius: 12px;
    background: #1a1a1a;
    box-shadow: 0 18px 56px rgb(0 0 0 / 0.48);
  }

  .setup-popover {
    left: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    width: min(380px, calc(100vw - var(--space-8)));
    padding: 14px;
  }

  .setup-popover > .popover-head {
    grid-column: 1 / -1;
  }

  .setup-state {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    color: var(--fg-3);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
  }

  .setup-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--fg-3);
  }

  .setup-dot.live {
    background: #3eb45c;
    box-shadow: 0 0 0 2px rgb(62 180 92 / 0.18);
  }

  .list-popover {
    left: 0;
    width: min(280px, calc(100vw - var(--space-8)));
    max-height: min(60vh, 440px);
    display: flex;
    flex-direction: column;
    padding: var(--space-2);
  }

  .variation-popover {
    left: 0;
    display: grid;
    gap: var(--space-3, 12px);
    width: min(720px, calc(100vw - var(--space-8)));
    max-height: min(74vh, 600px);
    overflow-y: auto;
    padding: 12px;
    background: #111111;
  }

  .popover-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1) var(--space-2) var(--space-2);
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
  }

  .popover-head.close-only {
    justify-content: flex-end;
    padding-bottom: 0;
    margin-bottom: calc(-1 * var(--space-2));
  }

  .close {
    width: 36px;
    height: 36px;
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

  /* Bank / style scrollable lists */
  .bank-list,
  .style-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 44px;
    padding: 0 var(--space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--fg-1);
    cursor: pointer;
    font: inherit;
    text-align: left;
  }

  .list-item:hover,
  .list-item:focus-visible {
    background: var(--bg-3);
    color: var(--fg-0);
    outline: none;
  }

  .list-item.selected {
    border-color: var(--system);
    background: var(--system-soft);
    color: var(--fg-0);
  }

  .list-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Setup popover fields */
  .field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  .bpm-stepper {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    gap: var(--space-1);
  }

  .bpm-stepper button {
    min-height: 44px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font-family: var(--mono);
    font-size: var(--t-readout);
  }

  .bpm-stepper input[type='number'] {
    font-family: var(--mono);
    font-size: var(--t-readout);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  .bpm-stepper button:disabled {
    color: var(--fg-3);
    cursor: not-allowed;
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
    color: var(--fg-2);
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

  /* The large per-style picker stops being a trigger-anchored popover before
     it can run past the viewport edge. Compact setup/list popovers stay put. */
  @media (max-width: 1200px) {
    .variation-popover {
      position: fixed;
      left: 50%;
      right: auto;
      top: 50%;
      transform: translate(-50%, -50%);
      width: min(720px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      overflow-y: auto;
    }
  }

  /* The approved iPad layout is an intentional two-row instrument strip,
     not whatever happens to fit before flex wraps. */
  @media (max-width: 900px) {
    .topbar {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        'pill pill transpose'
        'bank style latch';
      gap: var(--space-2);
      padding: 12px;
    }

    .pill-zone { grid-area: pill; }
    .bank-zone { grid-area: bank; }
    .style-zone { grid-area: style; }
    .transpose-zone { grid-area: transpose; }
    .latch { grid-area: latch; }

    .pill-zone,
    .style-zone {
      min-width: 0;
    }

    .latch {
      margin-left: 0;
    }

    .close {
      width: 44px;
      height: 44px;
    }
  }

  @media (max-width: 620px) {
    .topbar {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'pill pill'
        'bank latch'
        'style style'
        'transpose transpose';
      padding: var(--space-2);
    }

    .pill-zone {
      width: 100%;
    }

    .bank-zone,
    .style-zone {
      width: 100%;
    }

    .bank-readout {
      flex: 1 1 auto;
      max-width: none;
    }

    .latch {
      margin-left: 0;
    }

    .style-readout {
      flex: 1 1 auto;
      max-width: none;
    }

    /* Anchored dropdowns clip off-screen when their trigger sits mid-strip.
       On narrow screens present every popover as a centered modal instead
       (the backdrop already dims behind it). */
    .popover {
      position: fixed;
      left: var(--space-2);
      right: var(--space-2);
      top: 50%;
      transform: translateY(-50%);
      width: auto;
      max-width: none;
      max-height: 86vh;
      overflow-y: auto;
    }

    .setup-popover {
      grid-template-columns: 1fr;
    }

    .list-popover {
      max-height: 74vh;
    }
  }
</style>
