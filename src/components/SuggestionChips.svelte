<script lang="ts">
  import type { Key } from '../banks';
  import type { ResolvedSuggestion } from '../suggestions';
  import { fitChipsPerRow } from '../rail';
  import SuggestionChip from './SuggestionChip.svelte';

  interface Props {
    suggestion: ResolvedSuggestion;
    maxPerRow: number;
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
    panicToken: number;
  }

  let { suggestion, maxPerRow, onPress, onRelease, heldKeys, panicToken }: Props = $props();

  let chipsEl = $state<HTMLDivElement>();
  let width = $state(0);

  // Chord-name widths vary wildly (unnamed "C Oct Stack", altered "CM13(no 3)"), so a
  // fixed per-row cap can overflow a 280px column. Measuring the grid's own scrollWidth
  // against its clientWidth and stepping the cap down keeps every row balanced with no
  // horizontal scroll and no truncation (D-02).
  $effect(() => {
    const el = chipsEl;
    const stepCount = suggestion.steps.length;
    void width; // re-run when the column is resized
    if (!el) return;
    const per = fitChipsPerRow(stepCount, maxPerRow, (candidate) => {
      el.style.setProperty('--per', String(candidate));
      return el.scrollWidth <= el.clientWidth;
    });
    el.style.setProperty('--per', String(per));
  });
</script>

<div class="chips" bind:this={chipsEl} bind:clientWidth={width}>
  {#each suggestion.steps as step, index (suggestion.id + ':' + index)}
    <SuggestionChip {step} bankIndex={suggestion.bankIndex} {onPress} {onRelease} {heldKeys} {panicToken} />
  {/each}
</div>

<style>
  .chips {
    display: grid;
    grid-template-columns: repeat(var(--per, 1), minmax(min-content, max-content));
    gap: 8px;
    justify-content: start;
    min-width: 0;
  }
</style>
