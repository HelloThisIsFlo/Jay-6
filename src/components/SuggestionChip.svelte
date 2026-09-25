<script lang="ts">
  import type { Key } from '../banks';
  import type { ResolvedSuggestionStep } from '../suggestions';
  import { padNotesFor, chipVisualState } from '../rail';

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

  function onpointerdown(e: PointerEvent): void {
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
</script>

<button
  type="button"
  class="chip"
  class:held={visual === 'held'}
  class:echo={visual === 'echo'}
  onpointerdown={onpointerdown}
  onpointerup={endPress}
  onpointercancel={endPress}
  onlostpointercapture={endPress}
  oncontextmenu={(e) => e.preventDefault()}
>
  <span class="k">{step.key}</span>
  <span class="n">{step.displayLabel}</span>
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
  .chip.echo:not(.held) {
    background: var(--accent-soft);
    border-color: var(--accent);
  }
  .chip.held {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 14px 2px rgb(255 122 26 / 0.4);
  }
  .chip.held .k,
  .chip.held .n {
    color: var(--bg-0);
  }
  .k {
    font-size: var(--t-eyebrow);
    font-weight: 600;
    line-height: 1.2;
    color: var(--fg-2);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .n {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.15;
  }
</style>
