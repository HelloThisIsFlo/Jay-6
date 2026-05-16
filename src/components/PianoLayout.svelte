<script lang="ts">
  import { getBank, labelFor, type Key } from '../banks';
  import { ui } from '../state.svelte';

  interface Props {
    onPress: (key: Key, notes: number[]) => void;
    onRelease: (key: Key) => void;
    heldKeys: Set<Key>;
  }

  let { onPress, onRelease, heldKeys }: Props = $props();

  const bank = $derived(getBank(ui.bankIndex));

  // Mapping: key → grid column (1-based, 14 cols)
  // 7 whites take 2 cols each; 5 blacks straddle the seams.
  // White cols: C=1-2, D=3-4, E=5-6, F=7-8, G=9-10, A=11-12, B=13-14
  // Black cols: C#=2-3, D#=4-5, F#=8-9, G#=10-11, A#=12-13
  const whiteKeys: { key: Key; col: number }[] = [
    { key: 'C',  col: 1 },
    { key: 'D',  col: 3 },
    { key: 'E',  col: 5 },
    { key: 'F',  col: 7 },
    { key: 'G',  col: 9 },
    { key: 'A',  col: 11 },
    { key: 'B',  col: 13 },
  ];
  const blackKeys: { key: Key; col: number }[] = [
    { key: 'C#', col: 2  },
    { key: 'D#', col: 4  },
    { key: 'F#', col: 8  },
    { key: 'G#', col: 10 },
    { key: 'A#', col: 12 },
  ];

  function chordFor(k: Key) {
    return bank.chords.find((c) => c.key === k);
  }

  function handlePointerDown(e: PointerEvent, k: Key) {
    const c = chordFor(k);
    if (!c) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
    onPress(k, c.notes);
  }
  function handlePointerUp(e: PointerEvent, k: Key) {
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    e.preventDefault();
    onRelease(k);
  }
</script>

<div class="piano">
  {#each blackKeys as { key, col } (key)}
    {@const c = chordFor(key)}
    <button
      class="pad black"
      class:held={heldKeys.has(key)}
      style:grid-column="{col} / span 2"
      style:grid-row="1"
      onpointerdown={(e) => handlePointerDown(e, key)}
      onpointerup={(e) => handlePointerUp(e, key)}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="key">{key}</span>
      <span class="name">{c ? labelFor(bank, c) : ''}</span>
    </button>
  {/each}
  {#each whiteKeys as { key, col } (key)}
    {@const c = chordFor(key)}
    <button
      class="pad white"
      class:held={heldKeys.has(key)}
      style:grid-column="{col} / span 2"
      style:grid-row="2"
      onpointerdown={(e) => handlePointerDown(e, key)}
      onpointerup={(e) => handlePointerUp(e, key)}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="key">{key}</span>
      <span class="name">{c ? labelFor(bank, c) : ''}</span>
    </button>
  {/each}
</div>

<style>
  .piano {
    display: grid;
    grid-template-columns: repeat(14, minmax(0, 1fr));
    grid-template-rows: 1fr 1.3fr;
    gap: 0.5rem;
    padding: 1.5rem;
    max-width: 1100px;
    margin: 2rem auto;
    background: #181818;
    border-radius: 12px;
    user-select: none;
    touch-action: none;
  }
  .pad {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 0.75rem 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    text-align: left;
    border: 1px solid #333;
    transition: background-color 60ms, transform 40ms, box-shadow 80ms;
  }
  .pad:active { transform: translateY(1px); }
  .pad .key {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .pad .name {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.1;
    word-break: break-word;
  }
  .pad.white {
    background: #f4f1ea;
    color: #1a1a1a;
    min-height: 140px;
  }
  .pad.white .key { color: #888; }
  .pad.black {
    background: #1f1f1f;
    color: #eee;
    min-height: 110px;
    border-color: #2a2a2a;
  }
  .pad.held {
    background: #ff7a1a !important;
    color: #111 !important;
    box-shadow: 0 0 24px 4px rgba(255, 122, 26, 0.45);
    border-color: #ff7a1a;
  }
  .pad.held .key { color: #1a1a1a !important; }
</style>
