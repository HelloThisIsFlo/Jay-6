<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { Key } from '../banks';
  import type { ResolvedSuggestionStep } from '../suggestions';
  import {
    padNotesFor,
    chipVisualState,
    splitChordLabel,
    isNaturalKey,
    endChipHold,
    type ChipHold,
    type ChipHoldEnd,
  } from '../rail';

  interface Props {
    step: ResolvedSuggestionStep;
    bankIndex: number;
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
    panicToken: number;
  }

  let { step, bankIndex, onPress, onRelease, heldKeys, panicToken }: Props = $props();

  // D-03: a chip is a pad alias — hold is per-instance (this exact chip's
  // pointer), never derived from the shared heldKeys set, or every chip sharing
  // a key would go full orange instead of only the one physically pressed.
  let hold = $state.raw<ChipHold | null>(null);
  const heldHere = $derived(hold !== null);

  // Settle is the only place the chip releases: every end path (pointer end,
  // unmount, panic) folds through the tested endChipHold reducer, which forwards
  // a release only when it actually returns one.
  function settle(end: ChipHoldEnd): void {
    const step = endChipHold(hold, end);
    hold = step.hold;
    if (step.release !== null) onRelease(step.release);
  }

  // host.panic already silenced this key and App already emptied the hold counts,
  // so the chip only drops its local held look and never releases; a release now
  // could only cancel a hold another source took after the panic (D-04). untrack
  // keeps this effect keyed on panicToken alone, because tracking hold would make
  // every fresh press void itself.
  $effect(() => {
    void panicToken;
    untrack(() => settle({ kind: 'panic' }));
  });

  const visual = $derived(chipVisualState(heldHere, heldKeys.has(step.key)));
  const label = $derived(splitChordLabel(step.displayLabel));

  function onpointerdown(e: PointerEvent): void {
    // One hold per chip instance, mirroring the pad guard (D-04).
    if (hold !== null) { e.preventDefault(); return; }
    const notes = padNotesFor(bankIndex, step.key);
    if (!notes) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    hold = { pointerId: e.pointerId, key: step.key };
    // Pads do the same: focus must never steal the computer-keyboard pad shortcuts.
    e.preventDefault();
    onPress(step.key, notes);
  }

  function endPress(e: PointerEvent): void {
    if (hold?.pointerId !== e.pointerId) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    // Settle before releasing pointer capture, so a re-entrant lostpointercapture
    // (fired by releasePointerCapture below) finds no hold and settles to a no-op.
    settle({ kind: 'pointer-end', pointerId: e.pointerId });
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  }

  // D-07: a chip that unmounts while held (bank change, iPhone panel close,
  // paging) releases its key immediately. Reads only local state, never the
  // step prop, because a keyed each block may already be tearing this item down.
  onMount(() => () => settle({ kind: 'unmount' }));
</script>

<button
  type="button"
  class="chip"
  class:held={visual === 'held'}
  class:echo={visual === 'echo'}
  data-color={isNaturalKey(step.key) ? 'white' : 'black'}
  onpointerdown={onpointerdown}
  onpointerup={endPress}
  onpointercancel={endPress}
  onlostpointercapture={endPress}
  oncontextmenu={(e) => e.preventDefault()}
>
  <span class="k">{step.key}</span>
  <span class="n">
    <span class="main">{label.main}</span>
    {#if label.bass}<span class="bass">{label.bass}</span>{/if}
  </span>
</button>

<style>
  .chip {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: 4px 8px;
    border: 1px solid var(--bg-4);
    border-radius: var(--radius-md);
    background: var(--bg-2);
    color: var(--fg-0);
    font-family: var(--mono);
    text-align: left;
    cursor: pointer;
    touch-action: none;
    transition: background-color 60ms, box-shadow 80ms;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  /* Cream outline hint on natural-key chips only (accidentals keep the default edge). */
  .chip[data-color='white'] {
    border-color: rgb(244 241 234 / 0.6);
  }
  .chip.echo:not(.held) {
    background: var(--accent-soft);
    border-color: var(--accent);
  }
  /* .chip.held and .chip[data-color='white'] tie at specificity (0,2,0), so today's
     source order already lets held win; the compound .chip.held[data-color] selector
     sits at (0,3,0), keeping held winning even if the rules are ever reordered. */
  .chip.held,
  .chip.held[data-color] {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 14px 2px rgb(255 122 26 / 0.4);
  }
  .chip.held .k,
  .chip.held .n {
    color: var(--bg-0);
  }
  .k {
    font-family: var(--mono);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
    color: var(--fg-2);
    letter-spacing: 0.06em;
  }
  .n {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    font-family: var(--mono);
    font-size: var(--t-body);
    font-weight: 600;
    line-height: 1.15;
    color: var(--fg-0);
  }
  .main,
  .bass {
    white-space: nowrap;
  }
  .bass {
    opacity: 0.72;
  }
</style>
