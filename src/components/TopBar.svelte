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
    type StyleKind,
  } from '../state.svelte';

  let midiStatus = $state<MidiStatus>('idle');
  let midiOutputs = $state<MidiPortInfo[]>([]);
  let midiInputs = $state<MidiPortInfo[]>([]);
  let selectedOutputId = $state<string | null>(null);
  let selectedInputId = $state<string | null>(null);
  let midiChannel = $state(1);
  let setupOpen = $state(false);

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

  const selectedOutputName = $derived(
    selectedOutputId
      ? midiOutputs.find((output) => output.id === selectedOutputId)?.name ?? 'Missing output'
      : outputFallback(),
  );
  const selectedInputName = $derived(
    selectedInputId
      ? midiInputs.find((input) => input.id === selectedInputId)?.name ?? 'Missing input'
      : inputFallback(),
  );
  const clockLabel = $derived(ui.clockSource === 'external' ? 'Ext' : 'Int');
  const inputClockSummary = $derived(
    ui.clockSource === 'external' ? selectedInputName : 'Internal clock',
  );

  function outputFallback(): string {
    if (midiStatus === 'unsupported') return 'Use Chrome/Edge';
    if (midiStatus === 'requesting') return 'Requesting MIDI';
    if (midiStatus === 'denied') return 'Permission denied';
    if (midiStatus === 'error') return 'MIDI error';
    if (midiStatus === 'ready') return 'No outputs';
    return 'MIDI idle';
  }

  function inputFallback(): string {
    if (midiStatus === 'unsupported') return 'Use Chrome/Edge';
    if (midiStatus === 'requesting') return 'Requesting MIDI';
    if (midiStatus === 'denied') return 'Permission denied';
    if (midiStatus === 'error') return 'MIDI error';
    if (midiStatus === 'ready') return 'No input';
    return 'MIDI idle';
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (setupOpen && event.key === 'Escape') setupOpen = false;
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="topbar">
  <div class="setup-zone">
    <button
      type="button"
      class="setup-pill"
      aria-expanded={setupOpen}
      aria-controls="setup-popover"
      onclick={() => (setupOpen = !setupOpen)}
    >
      <span class="setup-label">Open Setup</span>
      <span class="setup-summary">
        <span>{selectedOutputName}</span>
        <span>{inputClockSummary}</span>
        <span>Ch {midiChannel}</span>
        <span>{ui.bpm} BPM</span>
        <span>{clockLabel}</span>
      </span>
    </button>

    {#if setupOpen}
      <div class="setup-popover" id="setup-popover" role="dialog" aria-label="Setup">
        <div class="popover-head">
          <span>Setup</span>
          <button type="button" class="close" aria-label="Close setup" onclick={() => (setupOpen = false)}>
            ×
          </button>
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

  <div class="performance">
    <label class="field bank">
      <span>Bank</span>
      <div class="bank-row">
        <button type="button" class="arrow" onclick={() => setBank(ui.bankIndex - 1)} aria-label="Prev bank">
          ‹
        </button>
        <select
          value={String(ui.bankIndex)}
          onchange={(e) => setBank(Number((e.currentTarget as HTMLSelectElement).value))}
        >
          {#each banks as bank (bank.index)}
            <option value={String(bank.index)}
              >{String(bank.index).padStart(2, '0')} - {bank.name}</option
            >
          {/each}
        </select>
        <button type="button" class="arrow" onclick={() => setBank(ui.bankIndex + 1)} aria-label="Next bank">
          ›
        </button>
      </div>
    </label>

    <label class="field style">
      <span>Style</span>
      <select
        value={ui.style}
        onchange={(e) => setStyle((e.currentTarget as HTMLSelectElement).value as StyleKind)}
      >
        {#each styleOptions as style (style)}
          <option value={style}>{STYLE_LABELS[style]}</option>
        {/each}
      </select>
    </label>

    <div class="variation-slot">
      <VariationPicker style={ui.style} variation={ui.variation} onSelect={(index) => setVariation(index)} />
    </div>

    <label class="field transpose-field">
      <span>Transpose</span>
      <div class="transpose">
        <button type="button" onclick={() => bumpTranspose(-1)} aria-label="Octave down">-12</button>
        <span class="trval">{ui.transpose >= 0 ? '+' : ''}{ui.transpose}</span>
        <button type="button" onclick={() => bumpTranspose(1)} aria-label="Octave up">+12</button>
      </div>
    </label>

    {#if showGate}
      <label class="field gate-field">
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

    <button type="button" class="latch" class:on={ui.latch} onclick={toggleLatch}>
      <span>Latch</span>
      <span>{ui.latch ? 'On' : 'Off'}</span>
    </button>
  </div>
</div>

<style>
  .topbar {
    position: relative;
    display: grid;
    /* The performance column's floor must be min-content, not 0: .performance is a
       nested grid with its own minmax track minimums, and a 0-floor outer track lets
       the outer grid shrink that cell below what the nested grid actually needs —
       the nested grid then overflows its own cell (Latch bursting past the topbar's
       right edge) since the outer grid has no visibility into the inner minimums.
       setup-zone's floor is 290px (not the old 260px): at 260px the "Internal clock"
       summary cell truncates to "Internal cl..." (14 mono chars ≈ 118px need 2 columns
       of ≥120px each within the pill's padding, which needs ≥290px on the outer track). */
    grid-template-columns: minmax(290px, 0.82fr) minmax(min-content, 2.1fr);
    gap: var(--space-4);
    align-items: start;
    /* 1370px (border-box, hence box-sizing below) is the measured minimum for the
       2-col (setup pill | performance row) layout to fit without squeeze:
       performance's 5 track minimums (220+180+320+140+84 = 944px) + 4×16px gaps
       (64px) + setup-zone min (290px) + the zone gap (16px) + topbar's own
       left/right padding+border (34px) = 1348px, plus a small rounding buffer. A
       tighter cap (e.g. matching .piano's 1100px) reintroduces the squeeze/
       overflow bug this value was chosen to avoid. */
    box-sizing: border-box;
    width: min(100%, 1370px);
    max-width: 1370px;
    margin: 0 auto;
    padding: var(--space-4);
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: var(--radius-lg);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
    /* Capping .topbar's own width (above) decouples its available inline size
       from the viewport, so the reflow breakpoints below must react to that
       container's real width, not window width — otherwise a wide viewport
       with a narrow capped topbar never triggers the 2-col reflow and the
       5-column .performance grid overflows the capped box (Latch bursting
       past the right edge). */
    container-type: inline-size;
    container-name: topbar;
    user-select: none;
    -webkit-user-select: none;
  }

  .setup-zone {
    position: relative;
    z-index: 2;
  }

  .setup-pill {
    width: 100%;
    min-height: 88px;
    display: grid;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--system-soft);
    border-radius: var(--radius-lg);
    background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
    color: var(--fg-0);
    cursor: pointer;
    text-align: left;
  }

  .setup-pill:hover,
  .setup-pill:focus-visible {
    border-color: var(--system);
    outline: none;
  }

  .setup-label,
  .popover-head,
  .field > span,
  .latch span:first-child {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
  }

  .setup-label {
    color: var(--system);
  }

  .setup-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-1) var(--space-2);
    color: var(--fg-0);
    font-family: var(--mono);
    font-size: var(--t-body);
    font-variant-numeric: tabular-nums;
  }

  .setup-summary span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .setup-popover {
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    width: min(420px, calc(100vw - var(--space-8)));
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-lg);
    background: var(--bg-2);
    box-shadow: 0 18px 56px rgb(0 0 0 / 0.48);
  }

  .popover-head {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .performance {
    display: grid;
    grid-template-columns: minmax(220px, 0.95fr) minmax(180px, 0.85fr) minmax(320px, 1.8fr) minmax(140px, 0.65fr) auto;
    gap: var(--space-4);
    /* start (not end): the variation-slot is much taller than Bank/Style/Transpose
       for Arp/Beat/Rhythm Gate styles (a composed multi-row picker vs a single
       select). end-alignment bottom-anchored the short fields, leaving their
       labels floating well below the tall picker's label — a staggered,
       disconnected read. Top-aligning keeps every field's label on one shared
       line, reading as one coherent row regardless of picker height. */
    align-items: start;
  }

  .field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  select,
  input[type='number'] {
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

  select:disabled,
  input:disabled {
    color: var(--fg-3);
    border-color: var(--bg-3);
  }

  .bank-row,
  .transpose,
  .seg {
    display: flex;
    align-items: center;
  }

  .bank-row {
    gap: var(--space-1);
  }

  .bank-row select {
    flex: 1 1 auto;
  }

  .arrow,
  .transpose button,
  .seg button,
  .latch {
    min-width: 44px;
    min-height: 44px;
    border: 1px solid var(--bg-4);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font: inherit;
    touch-action: manipulation;
  }

  .arrow {
    border-radius: var(--radius-md);
    font-size: var(--t-readout);
  }

  .transpose {
    gap: var(--space-2);
  }

  .transpose button {
    border-radius: var(--radius-md);
    padding: var(--space-2);
    font-family: var(--mono);
  }

  .trval,
  .gateval {
    min-width: 4ch;
    color: var(--fg-0);
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  .seg {
    gap: 0;
  }

  .seg button {
    padding: var(--space-2) var(--space-4);
  }

  .seg button:first-child {
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  .seg button:last-child {
    border-left: none;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .seg button.on,
  .latch.on {
    border-color: var(--system);
    background: var(--system-soft);
    color: var(--fg-0);
  }

  .seg button:disabled {
    color: var(--fg-3);
    cursor: not-allowed;
  }

  .variation-slot {
    min-width: 0;
  }

  .gate-field {
    grid-column: 3 / span 2;
  }

  input[type='range'] {
    width: 100%;
    min-height: 44px;
    accent-color: var(--system);
    touch-action: manipulation;
  }

  .latch {
    align-self: start;
    display: grid;
    gap: var(--space-1);
    place-items: center;
    min-width: 84px;
    border-radius: var(--radius-md);
    padding: var(--space-2);
  }

  .latch span:last-child {
    font-family: var(--mono);
    font-size: var(--t-body);
  }

  button:active {
    filter: brightness(1.12);
  }

  /* R5/D-06: below 1120px of the topbar's OWN available width, it stacks to a single
     column, handing .performance the full row width. This is a container query (not
     a viewport media query) because .topbar now caps its own width at 1370px — on a
     wide viewport a viewport-based query would never fire even though the capped
     container is well below the 1120px threshold. The old two-tier split (a squeezed
     5-col row from 900-1120px, then a safe 2-col reflow only below 900px) left a
     "squeeze window" whose summed column minimums (220+180+320+120+auto ≈ 924px +
     64px gaps ≈ 988px) exceed the available content width at the mandated iPad-sized
     1024px viewport (~930px after main+topbar padding) — clipped by main's
     `overflow-x: hidden` rather than scrollable. Merging both rules onto the same
     1120px breakpoint removes the squeeze window entirely so 1024px always gets the
     safe 2-col group reflow. */
  @container topbar (max-width: 1120px) {
    .topbar {
      grid-template-columns: 1fr;
    }

    .performance {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .variation-slot,
    .gate-field {
      grid-column: 1 / -1;
    }

    .latch {
      width: 100%;
    }
  }

  @container topbar (max-width: 620px) {
    .topbar,
    .setup-popover {
      padding: var(--space-2);
    }

    .setup-popover {
      grid-template-columns: 1fr;
      width: calc(100vw - var(--space-4));
    }

    .performance {
      grid-template-columns: 1fr;
    }
  }
</style>
