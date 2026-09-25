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

{#if suggestions.length > 0}
  <section class="rail" aria-label="Suggestions">
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
  </section>
{:else}
  <p class="empty">No curated suggestions for this bank yet</p>
{/if}

<style>
  .rail {
    box-sizing: border-box;
    width: min(calc(100% - 56px), 1180px);
    margin: 16px auto 0;
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
    width: min(calc(100% - 56px), 1180px);
    margin: 16px auto 0;
    color: var(--fg-2);
    font-size: 13px;
  }

  @media (max-width: 760px) {
    .rail,
    .empty {
      width: calc(100% - 24px);
    }
  }
</style>
