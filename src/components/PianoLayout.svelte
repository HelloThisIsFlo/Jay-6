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

  // Pointer-leave/mouseup race left notes hanging (UAT test 4): a press could end via
  // pointerup, pointercancel (touch/gesture interruption), or lostpointercapture (OS
  // yanks capture mid-press) — pointerup intermittently never arrived. We track the
  // captured pointerId per pad and route every end-path through one idempotent release
  // so the note-off always fires exactly once (a second end for the same pointer no-ops).
  const captured = new Map<Key, number>();

  function handlePointerDown(e: PointerEvent, k: Key) {
    const c = chordFor(k);
    if (!c) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    captured.set(k, e.pointerId);
    e.preventDefault();
    onPress(k, c.notes);
  }
  function endPress(e: PointerEvent, k: Key) {
    // Idempotent: only release if this pointer is the one still captured for this pad.
    if (captured.get(k) !== e.pointerId) return;
    captured.delete(k);
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    onRelease(k);
  }
</script>

<!-- Chord label split at the slash so it wraps to two clean lines ("Cadd9" / "/E")
     instead of breaking mid-token ("Ca dd 9/ E") on narrow phone pads. -->
{#snippet chordName(label: string)}
  {@const parts = label.split('/')}
  <span class="cname-main">{parts[0]}</span>{#if parts.length > 1}<span class="cname-bass">/{parts.slice(1).join('/')}</span>{/if}
{/snippet}

<div class="piano">
  {#each blackKeys as { key, col } (key)}
    {@const c = chordFor(key)}
    <button
      class="pad black"
      class:held={heldKeys.has(key)}
      style:grid-column="{col} / span 2"
      style:grid-row="1"
      onpointerdown={(e) => handlePointerDown(e, key)}
      onpointerup={(e) => endPress(e, key)}
      onpointercancel={(e) => endPress(e, key)}
      onlostpointercapture={(e) => endPress(e, key)}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="key">{key}</span>
      <span class="name">{#if c}{@render chordName(labelFor(bank, c))}{/if}</span>
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
      onpointerup={(e) => endPress(e, key)}
      onpointercancel={(e) => endPress(e, key)}
      onlostpointercapture={(e) => endPress(e, key)}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <span class="key">{key}</span>
      <span class="name">{#if c}{@render chordName(labelFor(bank, c))}{/if}</span>
    </button>
  {/each}
</div>

<style>
  .piano {
    display: grid;
    grid-template-columns: repeat(14, minmax(0, 1fr));
    grid-template-rows: 1fr 1.3fr;
    column-gap: var(--space-2);
    row-gap: var(--space-4);
    padding: var(--space-6);
    box-sizing: border-box;
    width: min(100%, 1100px);
    max-width: 1100px;
    margin: 0 auto;
    /* D-10 fallback step D: frame dropped to #000 so black keys (#2e2e2e) pop
       against true black. Earlier #181818 frame inverted the visual hierarchy —
       app bg #111 was darker than the frame, making the piano panel feel
       "raised" instead of recessed. */
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0) 28%),
      var(--frame);
    border: 1px solid var(--bg-3);
    border-radius: var(--radius-lg);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -14px 24px rgba(0, 0, 0, 0.52),
      0 20px 36px rgba(0, 0, 0, 0.35);
    user-select: none;
    touch-action: none;
  }
  .pad {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-2) var(--space-2);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--mono);
    text-align: left;
    border: 1px solid transparent;
    min-width: 0;
    overflow: hidden;
    transition:
      background-color 60ms,
      border-color 60ms,
      transform 40ms,
      box-shadow 80ms;
    /* .piano has user-select:none but iOS still independently selected the pad's
       text spans on double-tap, and long-press raised the callout menu (UAT test 19).
       Suppress on the button + its text spans + kill the iOS callout. */
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  .pad:active { transform: translateY(2px); }
  .pad .key,
  .pad .name {
    max-width: 100%;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  .pad .key {
    font-size: var(--t-eyebrow);
    font-weight: 600;
    color: var(--fg-2);
    text-transform: uppercase;
    line-height: 1.2;
  }
  .pad .name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    /* Scales with viewport so 7 white pads across a phone still read without
       breaking mid-token; capped at the readout size on wide screens. */
    font-size: clamp(10px, 2.7vw, 18px);
    font-weight: 600;
    line-height: 1.15;
  }
  /* Tokens never break internally; wrapping happens only between main + bass. */
  .pad .cname-main,
  .pad .cname-bass {
    white-space: nowrap;
  }
  .pad .cname-bass {
    opacity: 0.72;
  }
  .pad.white {
    background: var(--cream);
    color: var(--bg-1);
    min-height: 140px;
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.9),
      inset 0 -12px 18px rgba(96, 78, 54, 0.2),
      0 7px 0 #c8c0b4,
      0 14px 20px rgba(0, 0, 0, 0.28);
  }
  .pad.white .key { color: #6f675f; }
  /* D-10 fallback ladder: walked Option B → D (frame to #000 — applied above) after
     desktop eyeball showed Option B alone read muddy: #2e2e2e keys on the original
     #181818 frame gave Δluma ~22 (visible but indistinct), and the 6%-alpha top
     highlight was lost at desktop zoom. Frame → #000 restores depth contrast.
     Keeping the inset highlight + #2e2e2e fill — if this still reads weak on real
     iPad, drop the highlight and bump fill toward #262626. UI-SPEC ref:
     .planning/phases/02-post-prototype-polish-uat-acceptance/02-UI-SPEC.md §"Fallback
     ladder (executor pivot path)". */
  .pad.black {
    background: var(--black-key);
    color: var(--fg-0);
    min-height: 110px;
    border-color: var(--bg-4);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.1),
      inset 0 -12px 18px rgba(0, 0, 0, 0.55),
      0 7px 0 #161616,
      0 13px 18px rgba(0, 0, 0, 0.36);
  }
  .pad.held {
    background: var(--accent) !important;
    color: var(--bg-0) !important;
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.28),
      inset 0 -10px 18px rgba(80, 34, 0, 0.3),
      0 0 24px 4px var(--accent-soft),
      0 7px 0 #9d3e00;
    border-color: var(--accent);
  }
  .pad.held .key { color: var(--bg-0) !important; }

  @media (max-width: 760px) {
    .piano {
      row-gap: var(--space-2);
      padding: var(--space-4);
    }
    .pad {
      padding: var(--space-2);
    }
    .pad.black {
      min-height: 88px;
    }
    .pad.white {
      min-height: 112px;
    }
  }

  @media (max-height: 480px) {
    .piano {
      row-gap: var(--space-2);
      padding: var(--space-2);
    }
    .pad {
      padding: var(--space-2);
    }
    .pad.black {
      min-height: 64px;
    }
    .pad.white {
      min-height: 80px;
    }
  }
</style>
