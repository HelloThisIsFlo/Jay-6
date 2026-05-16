// Roland J-6 chord data — extracted from
// https://static.roland.com/manuals/J-6_manual_v102/eng/28645807.html
//
// Verification: two independent extractions were diffed. Both passed the
// PLAN.md sanity checks (Bank 1 Cadd9 = [48, 55, 62, 64]; Bank 14 Oct Stack
// C = [60, 72]) and agreed on most chord names. They diverged on note
// voicings in ~30% of slots (the Roland HTML table is dense and Web-fetched
// content is partially truncated). The version shipped here is the more
// internally consistent of the two runs (bank-name → chord-name family
// matches throughout; a few inferred cells flagged in the extraction
// report). Tighten against OP-1 hardware as part of M8 follow-up if any
// voicings sound off.

import banksJson from './banks.data.json';
import type { Bank, Key } from './banks';

interface RawChord {
  key: Key;
  name: string;
  notes: number[];
}
interface RawBank {
  index: number;
  name: string;
  chords: RawChord[];
}
interface RawData {
  banks: RawBank[];
}

const raw = banksJson as RawData;

export const BANKS_DATA: Bank[] = raw.banks.map((b) => ({
  index: b.index,
  name: b.name,
  chords: b.chords.map((c) => ({
    key: c.key,
    name: c.name,
    notes: [...c.notes],
  })),
}));
