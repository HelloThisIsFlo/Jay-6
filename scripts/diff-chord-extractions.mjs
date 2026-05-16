#!/usr/bin/env node
// Compare two extracted chord JSON files and report mismatches.
// Usage: node scripts/diff-chord-extractions.mjs A.json B.json

import fs from 'node:fs';

const [, , aPath, bPath] = process.argv;
if (!aPath || !bPath) {
  console.error('usage: diff-chord-extractions.mjs <A.json> <B.json>');
  process.exit(2);
}

const a = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const b = JSON.parse(fs.readFileSync(bPath, 'utf8'));

let mismatches = 0;

function eqArr(x, y) {
  if (x.length !== y.length) return false;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

const aBanks = a.banks ?? [];
const bBanks = b.banks ?? [];

if (aBanks.length !== bBanks.length) {
  console.log(`BANK COUNT: A=${aBanks.length} B=${bBanks.length}`);
  mismatches++;
}

const max = Math.max(aBanks.length, bBanks.length);
for (let i = 0; i < max; i++) {
  const A = aBanks[i];
  const B = bBanks[i];
  if (!A || !B) {
    console.log(`Bank ${i + 1}: missing in ${!A ? 'A' : 'B'}`);
    mismatches++;
    continue;
  }
  if (A.name !== B.name) {
    console.log(`Bank ${i + 1} name: A="${A.name}" B="${B.name}"`);
    mismatches++;
  }
  const aCh = A.chords ?? [];
  const bCh = B.chords ?? [];
  for (let j = 0; j < 12; j++) {
    const cA = aCh[j];
    const cB = bCh[j];
    if (!cA || !cB) {
      console.log(`Bank ${i + 1} chord ${j}: missing`);
      mismatches++;
      continue;
    }
    if (cA.key !== cB.key) {
      console.log(`Bank ${i + 1} chord ${j} key: A=${cA.key} B=${cB.key}`);
      mismatches++;
    }
    if (cA.name !== cB.name) {
      console.log(`Bank ${i + 1} chord ${cA.key}: name A="${cA.name}" B="${cB.name}"`);
      mismatches++;
    }
    if (!eqArr(cA.notes, cB.notes)) {
      console.log(`Bank ${i + 1} chord ${cA.key}: notes A=[${cA.notes.join(',')}] B=[${cB.notes.join(',')}]`);
      mismatches++;
    }
  }
}

if (mismatches === 0) {
  console.log('OK — extractions match exactly.');
} else {
  console.log(`\n${mismatches} mismatches.`);
  process.exit(1);
}
