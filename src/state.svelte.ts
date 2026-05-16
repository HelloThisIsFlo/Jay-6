// Global UI state — Svelte 5 runes require .svelte.ts extension.

export type StyleKind =
  | 'hold'
  | 'arp1'
  | 'arp2'
  | 'phraseDur'
  | 'rhythm4'
  | 'rhythm5';

export const STYLE_LABELS: Record<StyleKind, string> = {
  hold: 'Hold',
  arp1: 'Arp (Style 1, 8th)',
  arp2: 'Arp (Style 2, 16th)',
  phraseDur: 'Phrase Dur (Style 3)',
  rhythm4: 'Rhythm Gate (Style 4)',
  rhythm5: 'Rhythm Gate (Style 5)',
};

// Number of variations per style — Hold has none.
export const STYLE_VARIATION_COUNT: Record<StyleKind, number> = {
  hold: 0,
  arp1: 12,
  arp2: 12,
  phraseDur: 12,
  rhythm4: 12,
  rhythm5: 12,
};

export type ClockSourceKind = 'internal' | 'external';

export const ui = $state({
  bankIndex: 1, // 1..100
  style: 'hold' as StyleKind,
  variation: 1, // 1..12 (ignored for hold)
  transpose: 0, // semitones, ±36 reasonable
  bpm: 110,
  latch: false,
  gatePercent: 75, // 0..100 — fraction of step length to hold the chord during rhythm gate
  clockSource: 'internal' as ClockSourceKind,
});

export function setClockSource(k: ClockSourceKind): void {
  ui.clockSource = k;
}

export function setStyle(kind: StyleKind): void {
  ui.style = kind;
  if (STYLE_VARIATION_COUNT[kind] === 0) {
    ui.variation = 1;
  } else if (ui.variation > STYLE_VARIATION_COUNT[kind]) {
    ui.variation = 1;
  }
}

export function setVariation(n: number): void {
  const max = STYLE_VARIATION_COUNT[ui.style];
  if (max === 0) return;
  ui.variation = Math.max(1, Math.min(max, n));
}

export function setBank(n: number): void {
  ui.bankIndex = ((n - 1 + 100) % 100) + 1; // wrap 1..100
}

export function bumpTranspose(deltaOctaves: number): void {
  const next = ui.transpose + deltaOctaves * 12;
  ui.transpose = Math.max(-36, Math.min(36, next));
}

export function setBpm(n: number): void {
  ui.bpm = Math.max(40, Math.min(240, Math.round(n)));
}

export function toggleLatch(): void {
  ui.latch = !ui.latch;
}

export function setGatePercent(n: number): void {
  ui.gatePercent = Math.max(0, Math.min(100, Math.round(n)));
}
