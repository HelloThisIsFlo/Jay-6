<script lang="ts">
  import { onMount } from 'svelte';
  import type { Key } from '../banks';
  import type { ResolvedSuggestionStep } from '../suggestions';
  import { padNotesFor, chipVisualState, splitChordLabel, isNaturalKey } from '../rail';

  interface Props {
    step: ResolvedSuggestionStep;
    bankIndex: number;
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
  }

  let { step, bankIndex, onPress, onRelease, heldKeys }: Props = $props();

  // D-03: a chip is a pad alias — heldHere is per-instance (this exact chip's
  // pointer), never derived from the shared heldKeys set, or every chip sharing
  // a key would go full orange instead of only the one physically pressed.
  let heldHere = $state(false);
  let pointerId: number | null = null;
  let pressedKey: Key | null = null;

  const visual = $derived(chipVisualState(heldHere, heldKeys.has(step.key)));
  const label = $derived(splitChordLabel(step.displayLabel));

  function onpointerdown(e: PointerEvent): void {
    // One hold per chip instance, mirroring the pad guard (D-04).
    if (pointerId !== null) { e.preventDefault(); return; }
    const notes = padNotesFor(bankIndex, step.key);
    if (!notes) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointerId = e.pointerId;
    pressedKey = step.key;
    heldHere = true;
    // Pads do the same: focus must never steal the computer-keyboard pad shortcuts.
    e.preventDefault();
    onPress(step.key, notes);
  }

  // D-07: idempotent — a second end-path for the same press (or an unmount, see
  // Task 2) must never call onRelease twice for one press.
  function releaseHeld(): void {
    if (pressedKey === null) return;
    const key = pressedKey;
    pressedKey = null;
    heldHere = false;
    onRelease(key);
  }

  function endPress(e: PointerEvent): void {
    if (pointerId !== e.pointerId) return;
    pointerId = null;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    if (heldHere && target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    releaseHeld();
  }

  // D-07: a chip that unmounts while held (bank change now; iPhone panel close and
  // paging in Plan 04-04) releases its key immediately and idempotently. Uses only
  // the stored pressedKey, never the step prop, because a keyed each block may
  // already be tearing this item down.
  onMount(() => () => releaseHeld());
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
  /* held.[data-color] beats the natural-key outline on specificity alone — without it,
     .chip.held and .chip[data-color='white'] tie at the same specificity and source
     order would decide, silently letting the outline win on a held natural-key chip. */
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
