---
phase: 03-catalogue-mechanism-bootstrap
verified: 2026-08-18T18:08:23.084Z
status: gaps_found
score: 6/8 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "Invalid banks, pad keys, duplicate IDs, same-bank duplicate sequences, blank labels, and malformed entries fail validation with actionable errors."
    status: failed
    reason: "The public unknown validator fails open for sparse arrays and for extra symbol or non-enumerable own fields. A sparse steps array returns ok: true with undefined projected into readonly Key[]."
    artifacts:
      - path: "src/suggestions.ts"
        issue: "forEach(), every(), and Object.keys() skip array holes or non-enumerable/symbol own keys at lines 127, 212, 225, and 246."
    missing:
      - "Traverse top-level and steps arrays densely so holes are validated as undefined."
      - "Inspect all own keys when enforcing the exact five-field record contract."
  - truth: "Automated checks prove catalogue integrity, canonical resolution, deterministic lookup, supported-kind handling, and honest empty-bank results."
    status: partial
    reason: "The 41 focused tests and 94-test CI suite pass, but omit the reproduced sparse-array and exact-own-key failures. They also deep-compare fresh projections without asserting reference separation."
    artifacts:
      - path: "test/suggestions.test.ts"
        issue: "No regression cases cover sparse top-level arrays, sparse steps, symbol/non-enumerable fields, or fresh projection identities."
    missing:
      - "Add failing regression tests for sparse top-level and steps arrays."
      - "Add exact-own-key rejection tests and identity assertions for validator and resolver projections."
unverified_prohibitions:
  - requirement_id: PROG-01
    statement: "The catalogue mechanism must not silently become an authoring workflow, catalogue generator, or claim of comprehensive musical authority."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition — human review recommended"
  - requirement_id: PROG-04
    statement: "Suggestion data must not duplicate or invent factory bank names or chord names, including labels for unnamed stack-bank pads."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition — human review recommended"
  - requirement_id: BOOT-01
    statement: "Suggestion lookup must not audition, sequence, schedule, score, advance, or otherwise alter MIDI, playback, transport, clock, latch, or UI state."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition — human review recommended"
---

# 🔍 Phase 3: Catalogue Mechanism & Bootstrap Verification

**Phase Goal:** Flo and agents can maintain trustworthy bank-aware suggestion data without changing application code.
**Verified:** 2026-08-18T18:08:23.084Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## 🎯 Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | One plain catalogue is the only suggestion-content maintenance surface, with factory bank, ordered keys, and an honest kind. | ✓ VERIFIED | `src/suggestions.data.json` is a flat five-field array; `src/suggestions.ts:317-326` imports it as `unknown`, validates it, then exports the projection. No generator, authoring UI, or second suggestion source exists. |
| 2 | Repeated and consecutive steps remain distinct and authored order is preserved. | ✓ VERIFIED | `test/suggestions.test.ts:48-70,357-365`; implementation copies steps without deduplication or sorting at `src/suggestions.ts:248-250`. |
| 3 | Invalid and malformed catalogue data fails closed with deterministic actionable issues. | ✗ FAILED | Direct probe: sparse top-level input returns `{ ok: true, value: [] }`; sparse steps return `ok: true` with `undefined` in the typed steps array. Symbol and non-enumerable extra fields are also accepted. |
| 4 | Lookup returns zero, one, or several suggestions in source order and retains each suggestion's kind. | ✓ VERIFIED | Guarded `filter().map()` at `src/suggestions.ts:328-353`; exhaustive and ordered tests at `test/suggestions.test.ts:397-425,464-482`. |
| 5 | Chord and bank names come only from canonical banks and `labelFor()`, retaining raw blank stack-bank names separately. | ✓ VERIFIED | `src/suggestions.ts:333-351`; exact Bank 1 altered/slash names and Bank 14 blank/fallback labels pass at `test/suggestions.test.ts:397-444`. |
| 6 | The bundled catalogue is exactly the two ordered Bank 1 progressions plus one Bank 14 movement; the other 98 banks are empty. | ✓ VERIFIED | Exact JSON probe passed; locked deep equality and exhaustive bank loop pass at `test/suggestions.test.ts:381-394,464-475`. |
| 7 | Authoring and resolved contracts contain only inert catalogue/canonical text data, without speculative metadata or runtime authority. | ✓ VERIFIED | Exact key-set tests pass at `test/suggestions.test.ts:386-393,446-460`; `src/suggestions.ts` imports only JSON and canonical bank helpers, with no MIDI, state, engine, timing, callbacks, notes, or sorting. |
| 8 | Automated checks prove the complete catalogue integrity contract. | ✗ FAILED | `just ci` passes 94/94 tests, type checks, and build, but the passing suite does not exercise the reproduced fail-open inputs. |

**Score:** 6/8 truths verified (0 present-but-behavior-unverified)

### Every PLAN Must-Have Accounted For

| Plan | Must-have | Status | Evidence |
|---|---|---|---|
| 03-01 | Repeated or consecutive keys remain distinct. | ✓ | Repetition test `48-70`; production repeated C/D steps `397-444`. |
| 03-01 | Empty steps are rejected. | ✓ | Named test `72-87`. |
| 03-01 | Accepted step positions remain authored. | ✓ | Exact arrays `48-70,357-365`. |
| 03-01 | Empty catalogue succeeds; missing/blank fields fail. | ✓ | Tests `72-87,120-160`. |
| 03-01 | Unicode/sharps are preserved; whitespace/case mismatches fail. | ✓ | Tests `48-70,142-160,265-297`. |
| 03-01 | Blank canonical chord names stay blank; only `labelFor()` supplies display fallback. | ✓ | Test `428-444`; resolver `342-351`. |
| 03-01 | Altered and slash chord labels are byte-for-byte canonical. | ✓ | Bank 1 exact expectations `397-425`. |
| 03-01 | Neighbouring progression/movement records retain individual kinds. | ✓ | Exact catalogue and resolution tests `381-443`. |
| 03-01 | Missing, blank, and unsupported kinds are rejected. | ✓ | Missing-field test `120-139`; kind cases `178-192`. |
| 03-01 | Kind does not group or sort catalogue order. | ✓ | `filter().map()` only at `334-353`; ordered result test `397-425`. |
| 03-01 | Bank 1 records stay adjacent and Bank 14 resolves independently. | ✓ | Exact catalogue/resolution `381-444`. |
| 03-01 | Every bank other than 1 and 14 returns exact `[]`. | ✓ | Exhaustive loop `464-475`. |
| 03-01 | Production catalogue is exactly the three locked records in order. | ✓ | Exact probe and test `381-394`. |
| 03-02 | Content changes occur only in one JSON array with deterministic validation and no application-logic edit. | ✓ | Sole data source plus explicit import-time validation `317-326`. |
| 03-02 | Imported unknown data passes exact staged validation before trust. | ✗ | Sparse arrays and hidden/symbol keys bypass the exact validation boundary. |
| 03-02 | Lookup filters zero/one/many readonly results in source order. | ✓ | Implementation `328-353`; exhaustive tests pass. |
| 03-02 | Resolution uses only `banks` and `labelFor()` with raw/fallback separation. | ✓ | Implementation `333-351`; exact tests pass. |
| 03-02 | Only the locked three records are populated; 98 banks are empty. | ✓ | Exact JSON and exhaustive lookup pass. |
| 03-02 | No feel, bars, formula, description, timing, MIDI note, callback, or mutable canonical state leaks into contracts. | ✓ | Exact object-key checks and import scan pass. |

## 📦 Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/suggestions.data.json` | Single editable exact three-record bootstrap | ✓ VERIFIED | Exists, substantive, parses, exact deep-equality probe passes, and contains only five fields per record. |
| `src/suggestions.ts` | Runtime validation boundary and bank-aware resolver | ✗ FAILED | Exists and is wired, but the public validator admits sparse invalid keys and non-exact own-key shapes. |
| `test/suggestions.test.ts` | Complete validator, catalogue, canonical-resolution, and lookup contract | ⚠️ PARTIAL | 483 substantive lines, imported and run by Vitest; lacks regression coverage for the observed validator failures and fresh-reference guarantees. |

## 🔗 Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `test/suggestions.test.ts` | `src/suggestions.ts` | Direct public imports | ✓ WIRED | Validator, constants, catalogue, and lookup are imported and executed. |
| `test/suggestions.test.ts` | `src/banks.ts` | Canonical expected labels | ✓ WIRED | Tests pin canonical Bank 1 and fallback-aware Bank 14 values. |
| `src/suggestions.ts` | `src/suggestions.data.json` | Unknown import → validation → export | ⚠️ PARTIAL | Link exists, but validation is not fail-closed for all accepted `unknown` array shapes. |
| `src/suggestions.ts` | `src/banks.ts` | `KEYS`, `banks`, `labelFor()` | ✓ WIRED | Keys validate vocabulary; direct guarded bank access and `labelFor()` resolve names. |
| `src/suggestions.ts` | `test/suggestions.test.ts` | Public behavior contract | ⚠️ PARTIAL | All declared exports are exercised, but adversarial trust-boundary cases are absent. |

## 🌊 Data-Flow Trace

| Artifact | Data | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `suggestionCatalogue` | Validated suggestion records | `suggestions.data.json` → `unknown` → validator | Yes | ⚠️ FLOWING WITH VALIDATION GAP |
| `getSuggestionsForBank()` | Bank-aware resolved suggestions | Validated catalogue + canonical `banks` + `labelFor()` | Yes | ✓ FLOWING |
| Future Phase 4 UI | Rendered suggestions | Not in Phase 3 scope | N/A | N/A — explicitly deferred to Phase 4 |

## 🧪 Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full quality gate | `just ci` | 0 type warnings/errors; 8 files and 94 tests pass; production build succeeds | ✓ PASS |
| Locked bootstrap | Plan deep-equality `node -e` probe | `locked bootstrap matches` | ✓ PASS |
| Unknown validator rejects sparse arrays | Vite SSR direct module probe | Sparse catalogue and sparse steps both returned `ok: true`; sparse step projected as `undefined` | ✗ FAIL |
| Exact fields reject hidden own keys | Vite SSR direct module probe | Symbol and non-enumerable extras both returned `ok: true` | ✗ FAIL |
| Fresh projections currently exist | Vite SSR identity probe | Validator and resolver arrays, records, and nested steps were distinct | ✓ PASS, unprotected by tests |

## 🧰 Probe Execution

No PLAN-declared or conventional `scripts/**/tests/probe-*.sh` probes exist. Step 7c was not applicable.

## 📋 Requirements Coverage

| Requirement | Source Plans | Status | Evidence |
|---|---|---|---|
| PROG-01 | 03-01, 03-02 | ✓ SATISFIED | One plain JSON catalogue is the sole content source; no application edit is needed for valid content changes. |
| PROG-02 | 03-01, 03-02 | ✗ BLOCKED | Normal records preserve bank/key order, but a sparse steps array is accepted and projects `undefined` as a valid `Key`. |
| PROG-03 | 03-01, 03-02 | ✗ BLOCKED | Named malformed cases reject correctly, but sparse and hidden-own-key malformed inputs fail open. |
| PROG-04 | 03-01, 03-02 | ✓ SATISFIED | Resolver obtains bank/chord names from `banks` and `labelFor()` only. |
| PROG-05 | 03-01, 03-02 | ✓ SATISFIED | Source-order `filter().map()` returns deterministic zero/one/many results. |
| PROG-06 | 03-01, 03-02 | ✓ SATISFIED | Both supported kinds validate and survive unchanged through lookup. |
| PROG-07 | 03-01, 03-02 | ✗ BLOCKED | CI passes, but catalogue-integrity automation misses the reproduced trust-boundary failures. |
| BOOT-01 | 03-01, 03-02 | ✓ SATISFIED | Exact three-record bootstrap and all 98 empty banks are proven. |

All eight Phase 3 requirement IDs appear in both PLAN frontmatters and REQUIREMENTS.md. No Phase 3 requirement is orphaned.

## 🚩 Anti-Patterns and Adversarial Findings

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/suggestions.ts` | 127, 225, 246 | Hole-skipping `forEach()` / `every()` at an `unknown` trust boundary | 🛑 BLOCKER | Sparse invalid entries/steps validate successfully; trusted type can contain `undefined`. |
| `src/suggestions.ts` | 212 | `Object.keys()` used for exact own-field enforcement | ⚠️ WARNING | Symbol and non-enumerable own fields bypass validation. |
| `test/suggestions.test.ts` | 66-69, 364 | Deep equality used where fresh identity is promised | ⚠️ WARNING | A future aliasing regression could pass tests even though current code creates fresh projections. |

No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, placeholder, empty-handler, or console-only implementation markers were found in the three phase files. No dependency or canonical `banks.data.json` change occurred in the phase commits.

### Disconfirmation Check

- Partial requirement
  - PROG-07 passes its normal suite but does not prove the full integrity boundary.
- Misleading passing test
  - `toEqual({ ok: true, value: input })` proves value equality, not fresh reference separation.
- Uncovered error path
  - Sparse array holes and hidden own keys are not represented in the suite.

## 👤 Human Review Flags

No visual, hardware, external-service, or runtime UAT belongs to this data-only phase. The PLANs do carry three judgment-tier prohibitions. Static inspection indicates compliance, but these remain non-authoritative LLM judgments and must not be silently green:

1. **Catalogue scope stays non-authoring and non-comprehensive**
   - Expected: one small static catalogue, with no generator/editor or comprehensive-authority claim.
   - Current evidence: only the three-record JSON, validator/resolver, and tests exist.
   - Flag: `unverified-prohibition — human review recommended`.

2. **Canonical musical names are not duplicated or invented**
   - Expected: authored data contains no bank/chord names; resolution uses canonical bank exports and `labelFor()`.
   - Current evidence: direct code/data inspection agrees.
   - Flag: `unverified-prohibition — human review recommended`.

3. **Lookup remains inert**
   - Expected: lookup does not touch MIDI, playback, transport, clock, latch, or UI state.
   - Current evidence: the module imports only JSON and canonical bank helpers and returns data-only objects.
   - Flag: `unverified-prohibition — human review recommended`.

## ⏭️ Deferred Item Filter

None. Phase 4 covers rendering and read-only browsing; no later milestone phase promises to repair Phase 3's validator or its regression coverage.

## 🧱 Gaps Summary

- 🛑 The phase goal is not yet achieved
  - The claim is a **trustworthy** maintenance mechanism.
  - The exported `unknown` boundary demonstrably certifies malformed data as valid.
- 🧪 The green suite is incomplete
  - Add regressions that fail first for sparse arrays and exact own-key enforcement.
  - Add reference-identity assertions while repairing coverage.

---

_Verified: 2026-08-18T18:08:23.084Z_
_Verifier: the agent (gsd-verifier)_
