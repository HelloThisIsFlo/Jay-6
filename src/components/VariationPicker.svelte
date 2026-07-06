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

  function rangeButtonLabel(octaveRange: 1 | 2): string {
    return octaveRange === 1 ? '1 oct' : '2 oct';
  }

  // Dot-line glyph coordinates (viewBox 0 0 28 16). The shape *is* the label:
  // arp contour for direction, arc height for octave range.
  function dirPts(d: ArpDirection): Array<[number, number]> {
    if (d === 'UP') return [[3, 13], [10, 10], [17, 6], [24, 3]];
    if (d === 'DOWN') return [[3, 3], [10, 6], [17, 10], [24, 13]];
    return [[3, 12], [10, 5], [18, 5], [25, 12]]; // UP&DOWN → arch
  }
  function octPts(range: 1 | 2): Array<[number, number]> {
    return range === 1 ? [[6, 11], [14, 8], [22, 11]] : [[4, 13], [14, 3], [24, 13]];
  }
  const ptsAttr = (pts: Array<[number, number]>) => pts.map((p) => p.join(',')).join(' ');
</script>

{#snippet dotLine(pts: Array<[number, number]>)}
  <svg class="glyph" viewBox="0 0 28 16" aria-hidden="true">
    <polyline points={ptsAttr(pts)} />
    {#each pts as p (p.join(','))}
      <circle cx={p[0]} cy={p[1]} r="1.6" />
    {/each}
  </svg>
{/snippet}

{#snippet feelGlyph(feel: VariationFeel)}
  <svg class="glyph" viewBox="0 0 30 18" aria-hidden="true">
    {#if feel === 'straight'}
      <line class="stem" x1="9" y1="14" x2="9" y2="5" />
      <line class="stem" x1="19" y1="14" x2="19" y2="5" />
      <rect x="8.2" y="4" width="11.6" height="2.4" />
      <ellipse cx="7" cy="14" rx="2.7" ry="2" />
      <ellipse cx="17" cy="14" rx="2.7" ry="2" />
    {:else}
      <line class="stem" x1="6" y1="14" x2="6" y2="5" />
      <line class="stem" x1="14" y1="14" x2="14" y2="5" />
      <line class="stem" x1="22" y1="14" x2="22" y2="5" />
      <rect x="5.2" y="4" width="17.6" height="2.4" />
      <ellipse cx="4" cy="14" rx="2.5" ry="1.9" />
      <ellipse cx="12" cy="14" rx="2.5" ry="1.9" />
      <ellipse cx="20" cy="14" rx="2.5" ry="1.9" />
      <text class="tri3" x="25" y="7">3</text>
    {/if}
  </svg>
{/snippet}

{#snippet beatGlyph(duration: PhraseDuration, triplet: boolean)}
  <svg class="glyph beat-glyph" viewBox="0 0 24 26" aria-hidden="true">
    {#if duration === 'double-whole'}
      <ellipse class="open" cx="12" cy="15" rx="4.6" ry="3.2" />
      <line class="stem" x1="6" y1="9" x2="6" y2="21" />
      <line class="stem" x1="18" y1="9" x2="18" y2="21" />
    {:else if duration === 'whole'}
      <ellipse class="open" cx="12" cy="15" rx="4.6" ry="3.2" />
    {:else if duration === 'half'}
      <ellipse class="open" cx="9" cy="18" rx="3.7" ry="2.7" />
      <line class="stem" x1="12.5" y1="18" x2="12.5" y2="3" />
    {:else if duration === 'quarter'}
      <ellipse cx="9" cy="18" rx="3.7" ry="2.7" />
      <line class="stem" x1="12.5" y1="18" x2="12.5" y2="3" />
    {:else if duration === '8th'}
      <ellipse cx="9" cy="18" rx="3.7" ry="2.7" />
      <line class="stem" x1="12.5" y1="18" x2="12.5" y2="3" />
      <path class="flag" d="M12.5 3 q6.5 2.5 4 8.5" />
    {:else}
      <ellipse cx="9" cy="18" rx="3.7" ry="2.7" />
      <line class="stem" x1="12.5" y1="18" x2="12.5" y2="3" />
      <path class="flag" d="M12.5 3 q6.5 2.5 4 7" />
      <path class="flag" d="M12.5 8 q6.5 2.5 4 7" />
    {/if}
    {#if triplet}<text class="tri3" x="18" y="8">3</text>{/if}
  </svg>
{/snippet}

{#if model.kind === 'arp'}
  {@const current = currentArpOption(model)}
  <section class="picker arp" aria-label="Variation">
    <p class="picker-lede">Compose the arp — tap each axis.</p>

    <div class="axis">
      <span class="axis-label">Direction</span>
      <div class="tiles cols-3">
        {#each model.directions as direction (direction)}
          <button
            type="button"
            class="tile"
            class:selected={current.direction === direction}
            onclick={() => selectArpAxis(model, 'direction', direction)}
          >
            {@render dotLine(dirPts(direction))}
            <span class="tile-label">{model.options.find((o) => o.direction === direction)?.directionLabel ?? direction}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="axis">
      <span class="axis-label">Octave range</span>
      <div class="tiles cols-2">
        {#each model.octaveRanges as octaveRange (octaveRange)}
          <button
            type="button"
            class="tile"
            class:selected={current.octaveRange === octaveRange}
            onclick={() => selectArpAxis(model, 'octaveRange', octaveRange)}
          >
            {@render dotLine(octPts(octaveRange))}
            <span class="tile-label">{rangeButtonLabel(octaveRange)}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="axis">
      <span class="axis-label">Feel</span>
      <div class="tiles cols-2">
        {#each model.feels as feel (feel)}
          <button
            type="button"
            class="tile"
            class:selected={current.feel === feel}
            onclick={() => selectArpAxis(model, 'feel', feel)}
          >
            {@render feelGlyph(feel)}
            <span class="tile-label">{feelHeading(feel)}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="resolves">
      {@render dotLine(dirPts(current.direction))}
      <span class="resolves-text">Resolves to <b>{current.vLabel}</b></span>
    </div>
  </section>
{:else if model.kind === 'beat'}
  <section class="picker beat" aria-label="Variation">
    <div class="beat-grid">
      <span class="corner" aria-hidden="true"></span>
      {#each model.columns as feel (feel)}
        <span class="col-head">{feelHeading(feel)}</span>
      {/each}

      {#each model.rows as duration (duration)}
        {@const rowLabel = model.options.find((o) => o.duration === duration)?.durationLabel ?? duration}
        <span class="row-head">{rowLabel}</span>
        {#each model.columns as feel (feel)}
          {@const option = beatOption(model, duration, feel)}
          {#if option}
            <button
              type="button"
              class="cell"
              class:selected={variation === option.index}
              onclick={() => onSelect(option.index)}
              aria-label={`${rowLabel} ${feelHeading(feel)} ${option.vLabel}`}
            >
              {@render beatGlyph(duration, feel === 'triplet')}
              <span class="cell-num">{option.vLabel}</span>
            </button>
          {/if}
        {/each}
      {/each}
    </div>
    <p class="picker-note">Bar length = duration. Rows: note value · columns: feel.</p>
  </section>
{:else if model.kind === 'rhythm'}
  <section class="picker rhythm" aria-label="Variation">
    <div class="rhythm-grid">
      {#each model.options as option (option.index)}
        <button
          type="button"
          class="tile rhythm-tile"
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
  .picker {
    display: grid;
    gap: var(--space-4);
    color: var(--fg-0);
  }

  .picker-lede,
  .picker-note {
    margin: 0;
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
  }

  /* ── Shared glyph rendering ────────────────────────────────────────── */
  .glyph {
    width: 34px;
    height: 20px;
    color: var(--fg-2);
  }

  .beat-glyph {
    width: 22px;
    height: 26px;
  }

  .glyph polyline,
  .glyph .flag {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .glyph .stem {
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
  }

  .glyph circle,
  .glyph ellipse,
  .glyph rect {
    fill: currentColor;
  }

  .glyph .open {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
  }

  .glyph .tri3 {
    fill: currentColor;
    font-family: var(--mono);
    font-size: 8px;
    font-weight: 600;
  }

  /* Selected tiles/cells drive glyph colour via currentColor. */
  .tile.selected .glyph,
  .cell.selected .glyph {
    color: var(--accent);
  }

  /* ── Arp: axis sections of large glyph tiles ───────────────────────── */
  .axis {
    display: grid;
    gap: var(--space-2);
  }

  .axis-label {
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .tiles {
    display: grid;
    gap: var(--space-2);
  }

  .tiles.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .tiles.cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tile {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: var(--space-2);
    min-height: 72px;
    padding: var(--space-3, 12px) var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-1);
    cursor: pointer;
    font: inherit;
    touch-action: manipulation;
  }

  .tile:hover,
  .tile:focus-visible {
    border-color: var(--fg-3);
    outline: none;
  }

  .tile-label {
    font-size: var(--t-body);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  /* Orange = mock's selected treatment: accent border + soft tint + accent
     text/glyph. NOT the pad's solid fill+glow, so a selected cell never reads
     as a sounding pad (D-03 intent preserved). */
  .tile.selected,
  .cell.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
  }

  .resolves {
    display: flex;
    align-items: center;
    gap: var(--space-3, 12px);
    padding: var(--space-3, 12px);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-1);
  }

  .resolves .glyph {
    color: var(--accent);
  }

  .resolves-text {
    color: var(--fg-1);
    font-size: var(--t-body);
  }

  .resolves-text b {
    color: var(--fg-0);
    font-family: var(--mono);
    font-weight: 600;
  }

  /* ── Beat: 6×2 note-value grid ─────────────────────────────────────── */
  .beat-grid {
    display: grid;
    grid-template-columns: minmax(64px, auto) repeat(2, 1fr);
    gap: var(--space-2);
    align-items: stretch;
  }

  .col-head {
    align-self: end;
    justify-self: center;
    color: var(--fg-2);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .row-head {
    align-self: center;
    color: var(--fg-1);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cell {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 52px;
    padding: var(--space-2);
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-1);
    cursor: pointer;
    font: inherit;
    touch-action: manipulation;
  }

  .cell:hover,
  .cell:focus-visible {
    border-color: var(--fg-3);
    outline: none;
  }

  .cell-num {
    position: absolute;
    top: 3px;
    right: 5px;
    color: var(--fg-3);
    font-family: var(--mono);
    font-size: 9px;
    font-variant-numeric: tabular-nums;
  }

  .cell.selected .cell-num {
    color: var(--accent);
  }

  /* ── Rhythm: 4×3 pattern tiles ─────────────────────────────────────── */
  .rhythm-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(72px, 1fr));
    gap: var(--space-2);
  }

  .rhythm-tile {
    grid-template-rows: auto auto;
    gap: var(--space-1);
    min-height: 60px;
  }

  .glyphs {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    align-items: center;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1;
    color: var(--fg-1);
  }

  .glyphs span {
    display: grid;
    place-items: center;
    min-width: 8px;
  }

  .rhythm-tile.selected .glyphs {
    color: var(--accent);
  }

  .tile-meta {
    color: var(--fg-2);
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    font-variant-numeric: tabular-nums;
  }

  .rhythm-tile.selected .tile-meta {
    color: var(--accent);
  }

  @media (max-width: 620px) {
    .rhythm-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .row-head {
      font-size: 10px;
    }
  }
</style>
