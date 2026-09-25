<script lang="ts">
  import type { Key } from '../banks';
  import { getSuggestionsForBank } from '../suggestions';
  import { ui } from '../state.svelte';
  import { RAIL_COLUMN_MAX_PER_ROW } from '../rail';
  import SuggestionChips from './SuggestionChips.svelte';

  interface Props {
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
  }

  let { onPress, onRelease, heldKeys }: Props = $props();

  const suggestions = $derived(getSuggestionsForBank(ui.bankIndex));
</script>

<section class="rail" aria-label="Suggestions">
  {#if suggestions.length > 0}
    <div class="rail-head">
      <span>Suggestions</span>
      <span class="count">· {suggestions.length}</span>
    </div>
    <div class="cols">
      {#each suggestions as suggestion (suggestion.id)}
        <div class="col">
          <div class="rail-id">
            <span class="s-label">{suggestion.label}</span>
            <span class="kind">{suggestion.kind}</span>
          </div>
          <SuggestionChips
            {suggestion}
            maxPerRow={RAIL_COLUMN_MAX_PER_ROW}
            {onPress}
            {onRelease}
            {heldKeys}
          />
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty">No curated suggestions for this bank yet</p>
  {/if}
</section>

<style>
  .rail {
    box-sizing: border-box;
    display: grid;
    gap: 4px;
    width: min(calc(100% - 56px), 1180px);
    margin: 16px auto 0;
  }
  .rail-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 0 4px 4px;
    color: var(--system);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .rail-head .count {
    font-family: var(--mono);
    letter-spacing: 0;
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0 16px;
  }
  .col {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    align-content: start;
    min-width: 0;
    padding: 8px 4px 12px;
    border-top: 1px solid var(--bg-2);
  }
  .rail-id {
    display: grid;
    gap: 4px;
  }
  .s-label {
    font-size: var(--t-body);
    font-weight: 600;
    line-height: 1.25;
    color: var(--fg-0);
    text-wrap: balance;
  }
  .kind {
    font-size: var(--t-eyebrow);
    font-weight: 400;
    color: var(--system);
    letter-spacing: 0.02em;
  }
  .empty {
    margin: 0;
    padding: 4px;
    font-size: 13px;
    font-weight: 400;
    color: var(--fg-2);
  }

  @media (max-width: 760px) {
    .rail {
      width: calc(100% - 24px);
    }
  }

  /* iPhone landscape starts below the fold for the inline rail (sketch 002), so the
     TopBar strip in 04-04 takes over instead. Same height gate as PianoLayout's own
     compact-pad rule and 04-04's TopBar rule — all three key off the same fold. */
  @media (max-height: 480px) {
    .rail {
      display: none;
    }
  }
</style>
