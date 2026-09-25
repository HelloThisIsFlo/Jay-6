<script lang="ts">
  import type { Key } from '../banks';
  import { getSuggestionsForBank } from '../suggestions';
  import { ui } from '../state.svelte';
  import SuggestionChips from './SuggestionChips.svelte';

  interface Props {
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
  }

  let { onPress, onRelease, heldKeys }: Props = $props();

  const suggestions = $derived(getSuggestionsForBank(ui.bankIndex));

  // Component-local, never in the global ui state object — that's reserved for
  // engine-bridged state, and browsing must stay silent (D-08).
  let open = $state(false);

  // Task 2 swaps this for the remembered-page derivation (D-13); for now the panel
  // always shows the first suggestion.
  const current = $derived(suggestions[0]);

  function toggle(): void {
    open = !open;
  }
  function close(): void {
    open = false;
  }
</script>

{#if suggestions.length === 0}
  <p class="empty">No curated suggestions for this bank yet</p>
{:else}
  <button type="button" class="strip" aria-expanded={open} onclick={toggle}>
    Suggestions
    <span class="count">· {suggestions.length}</span>
    <span class="chev" aria-hidden="true">{open ? '▴' : '▾'}</span>
  </button>

  {#if open && current}
    <section class="panel" aria-label="Suggestions">
      <div class="p-head">
        <button type="button" class="p-collapse" aria-expanded="true" onclick={close}>
          Suggestions
          <span class="count">· {suggestions.length}</span>
          <span aria-hidden="true">▴</span>
        </button>
        <div class="p-id">
          <span class="s-label">{current.label}</span>
          <span class="kind">{current.kind}</span>
        </div>
        <button type="button" class="p-btn" aria-label="Close suggestions" onclick={close}>×</button>
      </div>
      <div class="p-body">
        <SuggestionChips suggestion={current} maxPerRow={6} {onPress} {onRelease} {heldKeys} />
      </div>
    </section>
  {/if}
{/if}

<style>
  .empty {
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--fg-2);
    text-align: center;
  }

  .strip {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    max-width: 100%;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--bg-3);
    border-radius: var(--radius-md);
    background: var(--bg-1);
    color: var(--system);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }

  .count {
    font-family: var(--mono);
    letter-spacing: 0;
  }

  .chev {
    margin-left: auto;
    color: var(--system);
  }

  .strip[aria-expanded='true'] {
    border-color: var(--system);
  }

  .strip:focus-visible,
  .p-btn:focus-visible,
  .p-collapse:focus-visible {
    outline: 2px solid var(--system);
    outline-offset: 1px;
  }

  /* max-height: 100% of the top bar = the space above the pads; the panel can never
     cover a pad (D-11). */
  .panel {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow-y: auto;
    background: var(--bg-1);
    border-bottom: 1px solid var(--system);
    box-shadow: 0 8px 18px rgb(0 0 0 / 0.45);
  }

  .p-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: 4px 8px 0 12px;
  }

  .p-collapse {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex: none;
    min-height: 40px;
    padding: 0 8px 0 0;
    border: 0;
    background: none;
    color: var(--system);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .p-id {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 8px;
  }

  .s-label {
    font-size: var(--t-body);
    font-weight: 600;
    line-height: 1.25;
    color: var(--fg-0);
  }

  .kind {
    font-size: var(--t-eyebrow);
    font-weight: 400;
    color: var(--system);
    letter-spacing: 0.02em;
  }

  .p-btn {
    display: grid;
    place-items: center;
    flex: none;
    min-width: 44px;
    min-height: 40px;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--fg-1);
    font-size: var(--t-readout);
    cursor: pointer;
    touch-action: manipulation;
  }

  .p-btn:active {
    background: var(--bg-3);
  }

  .p-body {
    padding: 8px 12px 12px;
  }
</style>
