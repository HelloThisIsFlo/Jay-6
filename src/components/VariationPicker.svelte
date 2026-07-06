<script lang="ts">
  import {
    variationOptionsForStyle,
    type ArpVariationModel,
    type ArpVariationOption,
    type BeatVariationModel,
    type VariationFeel,
  } from '../variationOptions';
  import type { ArpDirection, PhraseDuration } from '../phrases';
  import type { StyleKind } from '../state.svelte';

  interface Props {
    style: StyleKind;
    variation: number;
    onSelect: (index: number) => void;
  }

  let { style, variation, onSelect }: Props = $props();

  const model = $derived(variationOptionsForStyle(style));

  function currentArpOption(model: ArpVariationModel): ArpVariationOption {
    return model.options.find((option) => option.index === variation) ?? model.options[0]!;
  }

  function selectArpAxis(
    model: ArpVariationModel,
    axis: 'direction' | 'octaveRange' | 'feel',
    value: ArpDirection | 1 | 2 | VariationFeel,
  ): void {
    const current = currentArpOption(model);
    const next = model.options.find((option) => {
      if (axis === 'direction') {
        return option.direction === value
          && option.octaveRange === current.octaveRange
          && option.feel === current.feel;
      }
      if (axis === 'octaveRange') {
        return option.direction === current.direction
          && option.octaveRange === value
          && option.feel === current.feel;
      }
      return option.direction === current.direction
        && option.octaveRange === current.octaveRange
        && option.feel === value;
    });

    if (next) onSelect(next.index);
  }

  function beatOption(model: BeatVariationModel, duration: PhraseDuration, feel: VariationFeel) {
    return model.options.find((option) => option.duration === duration && option.feel === feel);
  }

  function feelHeading(feel: VariationFeel): string {
    return feel === 'triplet' ? 'Triplet' : 'Straight';
  }

  function rangeButtonLabel(model: ArpVariationModel, octaveRange: 1 | 2): string {
    return model.options.find((option) => option.octaveRange === octaveRange)?.rangeLabel
      ?? `${octaveRange} octave${octaveRange === 1 ? '' : 's'}`;
  }
</script>

{#if model.kind === 'arp'}
  {@const current = currentArpOption(model)}
  <section class="variation-picker arp" aria-label="Variation">
    <div class="picker-head">
      <span class="eyebrow">Variation</span>
      <span class="readout">{current.vLabel}</span>
    </div>

    <div class="arp-grid">
      <div class="axis">
        <span>Direction</span>
        <div class="axis-row">
          {#each model.directions as direction (direction)}
            <button
              type="button"
              class:selected={current.direction === direction}
              onclick={() => selectArpAxis(model, 'direction', direction)}
            >
              {model.options.find((option) => option.direction === direction)?.directionLabel ?? direction}
            </button>
          {/each}
        </div>
      </div>

      <div class="axis">
        <span>Range</span>
        <div class="axis-row">
          {#each model.octaveRanges as octaveRange (octaveRange)}
            <button
              type="button"
              class:selected={current.octaveRange === octaveRange}
              onclick={() => selectArpAxis(model, 'octaveRange', octaveRange)}
            >
              {rangeButtonLabel(model, octaveRange)}
            </button>
          {/each}
        </div>
      </div>

      <div class="axis">
        <span>Feel</span>
        <div class="axis-row">
          {#each model.feels as feel (feel)}
            <button
              type="button"
              class:selected={current.feel === feel}
              onclick={() => selectArpAxis(model, 'feel', feel)}
            >
              {feelHeading(feel)}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </section>
{:else if model.kind === 'beat'}
  <section class="variation-picker beat" aria-label="Variation">
    <div class="picker-head">
      <span class="eyebrow">Variation</span>
      <span class="readout">V{String(variation).padStart(2, '0')}</span>
    </div>

    <div class="beat-grid">
      <span class="grid-spacer" aria-hidden="true"></span>
      {#each model.columns as feel (feel)}
        <span class="column-heading">{feelHeading(feel)}</span>
      {/each}

      {#each model.rows as duration (duration)}
        {@const rowLabel = model.options.find((option) => option.duration === duration)?.durationLabel ?? duration}
        <span class="row-heading">{rowLabel}</span>
        {#each model.columns as feel (feel)}
          {@const option = beatOption(model, duration, feel)}
          {#if option}
            <button
              type="button"
              class:selected={variation === option.index}
              onclick={() => onSelect(option.index)}
            >
              {option.vLabel}
            </button>
          {/if}
        {/each}
      {/each}
    </div>
  </section>
{:else if model.kind === 'rhythm'}
  <section class="variation-picker rhythm" aria-label="Variation">
    <div class="picker-head">
      <span class="eyebrow">Variation</span>
      <span class="readout">V{String(variation).padStart(2, '0')}</span>
    </div>

    <div class="rhythm-grid">
      {#each model.options as option (option.index)}
        <button
          type="button"
          class:selected={variation === option.index}
          onclick={() => onSelect(option.index)}
          aria-label={`${option.vLabel} ${option.pattern}`}
        >
          <span class="glyphs" aria-hidden="true">
            {#each option.glyphs as glyph, i (`${option.index}-${i}`)}
              <span>{glyph}</span>
            {/each}
          </span>
          <span class="tile-meta">{option.vLabel}</span>
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  .variation-picker {
    display: grid;
    gap: var(--space-2);
    color: var(--fg-0);
    min-width: min(100%, 320px);
  }

  .picker-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .eyebrow,
  .axis > span,
  .column-heading,
  .row-heading {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
  }

  .readout,
  .tile-meta {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
  }

  .readout {
    color: var(--system);
    font-size: var(--t-readout);
    font-weight: 600;
    line-height: 1.2;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    cursor: pointer;
    font: inherit;
    touch-action: manipulation;
  }

  button:hover,
  button:focus-visible {
    border-color: var(--system);
    background: var(--bg-3);
    outline: none;
  }

  button.selected {
    border-color: var(--system);
    background: var(--system-soft);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--system) 42%, transparent);
  }

  .arp-grid,
  .axis {
    display: grid;
    gap: var(--space-2);
  }

  .axis-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .axis-row button {
    flex: 1 1 84px;
    padding: var(--space-2) var(--space-4);
  }

  .beat-grid {
    display: grid;
    grid-template-columns: minmax(92px, 1fr) repeat(2, minmax(72px, 0.75fr));
    gap: var(--space-2);
    align-items: center;
  }

  .column-heading {
    justify-self: center;
  }

  .row-heading {
    color: var(--fg-1);
  }

  .beat-grid button {
    padding: var(--space-2);
    font-family: var(--mono);
    font-size: var(--t-body);
  }

  .rhythm-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(76px, 1fr));
    gap: var(--space-2);
  }

  .rhythm-grid button {
    display: grid;
    gap: var(--space-1);
    min-height: 64px;
    padding: var(--space-2);
  }

  .glyphs {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    align-items: center;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1;
  }

  .glyphs span {
    display: grid;
    place-items: center;
    min-width: 8px;
    color: var(--fg-1);
  }

  .selected .glyphs span {
    color: var(--fg-0);
  }

  .tile-meta {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    justify-self: end;
  }

  @media (max-width: 760px) {
    .variation-picker {
      min-width: 0;
    }

    .rhythm-grid {
      grid-template-columns: repeat(3, minmax(72px, 1fr));
    }
  }
</style>
