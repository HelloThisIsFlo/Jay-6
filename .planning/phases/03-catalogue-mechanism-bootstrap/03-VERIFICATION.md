---
phase: 03-catalogue-mechanism-bootstrap
verified: 2026-08-18T18:59:30Z
status: gaps_found
score: 6/8 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 6/8
  gaps_closed:
    - "Clean-prototype sparse catalogue and steps holes now fail at their physical indexes."
    - "Non-enumerable string and symbol extra own fields now fail the exact-field contract."
    - "Validator and resolver fresh-reference guarantees now have identity regressions."
  gaps_remaining:
    - "Sparse slots with inherited numeric properties are still accepted and projected as trusted entries or keys."
    - "Malformed accessor records, format-only blank text, and ambiguous unexpected-field paths remain outside the validation and test contract."
    - "Automated checks remain green while the reproduced trust-boundary failures are untested."
  regressions: []
gaps:
  - truth: "Invalid banks, pad keys, duplicate IDs, same-bank duplicate sequences, blank labels, and malformed entries fail validation with actionable errors."
    status: failed
    reason: "The public unknown validator accepts inherited values from sparse array slots, executes accessors that can throw, accepts format-only visually blank IDs and labels, and emits ambiguous multiline paths for unusual unexpected keys."
    artifacts:
      - path: "src/suggestions.ts"
        issue: "Ordinary indexed/property reads and raw path interpolation leave the unknown trust boundary fail-open or non-deterministic for valid JavaScript inputs."
    missing:
      - "Read array slots and record fields from own data-property descriptors only; reject missing and accessor descriptors without invoking getters."
      - "Require an authored ID or label to contain a visible non-whitespace, non-format, non-control code point."
      - "Encode unsafe string keys and distinguish same-description symbols in stable diagnostic paths."
  - truth: "Automated checks prove catalogue integrity, canonical resolution, deterministic lookup, supported-kind handling, and honest empty-bank results."
    status: partial
    reason: "All 99 tests and the production build pass, but no test covers inherited sparse slots, accessor-bearing records, format-only blank text, or ambiguous unexpected-field paths; direct probes reproduce each problem."
    artifacts:
      - path: "test/suggestions.test.ts"
        issue: "The 46 focused tests cover clean holes, hidden own keys, and fresh identities but not the independently confirmed review findings."
    missing:
      - "Add public-validator regressions for inherited array slots and accessor descriptors."
      - "Add ID/label regressions for format/control-only text."
      - "Add deterministic path regressions for unsafe string keys and duplicate symbol descriptions."
unverified_prohibitions:
  - requirement_id: PROG-01
    statement: "The catalogue mechanism must not silently become an authoring workflow, catalogue generator, or claim of comprehensive musical authority."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition: human review recommended"
  - requirement_id: PROG-04
    statement: "Suggestion data must not duplicate or invent factory bank names or chord names, including labels for unnamed stack-bank pads."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition: human review recommended"
  - requirement_id: BOOT-01
    statement: "Suggestion lookup must not audition, sequence, schedule, score, advance, or otherwise alter MIDI, playback, transport, clock, latch, or UI state."
    disposition: non_authoritative_pass
    flag: "unverified-prohibition: human review recommended"
---

# 🔍 Phase 3: Catalogue Mechanism & Bootstrap Verification

**Phase Goal:** Flo and agents can maintain trustworthy bank-aware suggestion data without changing application code.
**Verified:** 2026-08-18T18:59:30Z
**Status:** gaps_found
**Re-verification:** Yes, after Plan 03-03 gap closure

## 🎯 Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | One plain catalogue is the only suggestion-content maintenance surface, with factory bank, ordered keys, and an honest kind. | ✓ VERIFIED | `src/suggestions.data.json` is the sole three-record content source. `src/suggestions.ts:325-334` imports it as `unknown`, validates it, and exports the projection. |
| 2 | Repeated and consecutive steps remain distinct and authored order is preserved. | ✓ VERIFIED | Indexed collection at `src/suggestions.ts:227-245` does not deduplicate or sort. Focused assertions pass in the 46-test suggestion suite. |
| 3 | Invalid and malformed catalogue data fails closed with deterministic actionable issues. | ✗ FAILED | Direct probes show inherited sparse entries/keys return `ok: true`, an ID getter executes and throws, U+200B-only text returns `ok: true`, and a newline-bearing key enters the path verbatim. |
| 4 | Lookup returns zero, one, or several suggestions in source order and retains each suggestion's kind. | ✓ VERIFIED | Guarded `filter().map()` at `src/suggestions.ts:336-361`; exact Bank 1, Bank 14, and exhaustive empty-bank tests pass. |
| 5 | Chord and bank names come only from canonical banks and `labelFor()`, retaining raw blank stack-bank names separately. | ✓ VERIFIED | `src/suggestions.ts:341-359` resolves from `banks` and `labelFor()` only; Bank 1 and Bank 14 exact expectations pass. |
| 6 | The bundled catalogue is exactly the two ordered Bank 1 progressions plus one Bank 14 movement; the other 98 banks are empty. | ✓ VERIFIED | Exact JSON and production-catalogue tests pass; the exhaustive 1..100 lookup test returns entries only for Banks 1 and 14. |
| 7 | Authoring and resolved contracts contain only inert catalogue/canonical text data, without speculative metadata or runtime authority. | ✓ VERIFIED | Exact key-set tests pass. The module imports only JSON plus `banks`, `KEYS`, and `labelFor`; it has no MIDI, state, engine, timing, transport, or callback dependency. |
| 8 | Automated checks prove the complete catalogue integrity contract. | ✗ FAILED | `just ci` passes 99/99 tests, strict checks, and build, but the suite does not exercise the reproduced inherited-slot, accessor, format-only text, or diagnostic-path failures. |

**Score:** 6/8 truths verified

### Roadmap Success Criteria

| # | Roadmap contract | Status | Evidence |
|---|---|---|---|
| 1 | One plain catalogue stores factory bank, ordered keys, and honest kind. | ✓ | Sole JSON catalogue and exact five-field projection exist. |
| 2 | Banks resolve zero/one/several suggestions in deterministic order with canonical names. | ✓ | Resolver implementation and exact/exhaustive tests pass. |
| 3 | Invalid and malformed data fails with actionable errors. | ✗ BLOCKER | Confirmed malformed JavaScript inputs bypass or escape validation. |
| 4 | Tiny representative bootstrap covers both kinds and leaves other banks empty. | ✓ | Three locked records, two kinds, 98 empty banks. |
| 5 | Automated checks prove the integrity and lookup contract. | ✗ BLOCKER | Green suite omits confirmed trust-boundary failures. |

## 📐 Every PLAN Must-Have Accounted For

| Plan | Must-have | Status | Evidence |
|---|---|---|---|
| 03-01 | Repeated/consecutive keys remain distinct. | ✓ | Repetition and authored-order test passes. |
| 03-01 | Empty steps are rejected. | ✓ | Exact `invalid-steps` assertion passes. |
| 03-01 | Accepted step positions remain authored. | ✓ | Indexed projection preserves order; exact arrays pass. |
| 03-01 | Empty catalogue succeeds; missing/blank fields fail. | ⚠️ PARTIAL | Ordinary blank strings fail, but U+200B-only IDs and labels pass. |
| 03-01 | Unicode/sharps survive; whitespace/case mismatch fails. | ✓ | Focused assertions pass without normalization. |
| 03-01 | Blank canonical chord names stay raw; only `labelFor()` supplies display fallback. | ✓ | Bank 14 exact resolution passes. |
| 03-01 | Altered/slash chord labels remain canonical. | ✓ | Bank 1 exact resolution passes. |
| 03-01 | Adjacent progression/movement records retain individual kinds. | ✓ | Exact catalogue and resolved kind assertions pass. |
| 03-01 | Missing, blank, unsupported kinds reject. | ✓ | Exact missing/invalid-kind tests pass. |
| 03-01 | Kind never groups or sorts catalogue order. | ✓ | Resolver filters then maps with no sorting. |
| 03-01 | Bank 1 records remain adjacent; Bank 14 resolves independently. | ✓ | Exact catalogue and resolution tests pass. |
| 03-01 | Every bank other than 1 and 14 returns `[]`. | ✓ | Exhaustive 100-bank test passes. |
| 03-01 | Production catalogue is exactly three locked records in order. | ✓ | Deep-equality production test passes. |
| 03-02 | Content changes occur in one JSON array with deterministic validation and no application-logic edit. | ⚠️ PARTIAL | One data surface exists, but validation is not deterministic/fail-closed for all declared `unknown` inputs. |
| 03-02 | Imported unknown data passes exact staged validation before trust. | ✗ | Inherited sparse slots can cross the boundary; accessors can escape the result contract. |
| 03-02 | Lookup returns fresh zero/one/many results in source order. | ✓ | Resolver and fresh-identity tests pass. |
| 03-02 | Resolution uses only canonical `banks` and `labelFor()`. | ✓ | Direct implementation trace and exact labels pass. |
| 03-02 | Only three records are populated; 98 banks are empty. | ✓ | Locked data plus exhaustive lookup pass. |
| 03-02 | No speculative or mutable runtime fields leak into contracts. | ✓ | Exact authoring/resolved key-set checks pass. |
| 03-03 | Sparse catalogue and step slots never become trusted values. | ✗ | Clean holes reject, but inherited numeric properties in holes validate and project. |
| 03-03 | Every own string/symbol extra is rejected by the five-field contract. | ✓ | `Reflect.ownKeys` plus non-enumerable and symbol regressions pass. |
| 03-03 | Automated regressions prove fresh nested validator/resolver projections. | ✓ | Reference-identity assertions pass for arrays, records, steps, and resolved step objects. |

## 📦 Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/suggestions.data.json` | Sole plain three-record bootstrap catalogue | ✓ VERIFIED | Exists, parses, is substantive, and contains exactly five authored fields per record. |
| `src/suggestions.ts` | Fail-closed validator plus canonical bank-aware resolver | ✗ FAILED | Exists and is wired, but the public validator accepts inherited sparse-slot values and mishandles accessors, format-only blanks, and unsafe diagnostic keys. |
| `test/suggestions.test.ts` | Complete validator, projection, catalogue, and resolver contract | ⚠️ PARTIAL | 575 substantive lines and 46 passing tests; independently confirmed review cases are absent. |

## 🔗 Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `test/suggestions.test.ts` | `src/suggestions.ts` | Public validator/catalogue/resolver imports | ✓ WIRED | GSD key-link query passes and all public exports are exercised. |
| `test/suggestions.test.ts` | `src/banks.ts` | Canonical expected labels | ✓ WIRED | Tests pin canonical Bank 1 and fallback-aware Bank 14 values. |
| `src/suggestions.ts` | `src/suggestions.data.json` | Unknown import, validation, export | ⚠️ PARTIAL | Production JSON is valid, but the declared public unknown boundary is not universally fail-closed. |
| `src/suggestions.ts` | `src/banks.ts` | `KEYS`, `banks`, `labelFor()` | ✓ WIRED | Validation and resolution use canonical vocabulary and names. |
| `src/suggestions.ts` | `ValidationResult` | Dense scans then typed projection | ⚠️ PARTIAL | Clean holes are covered, but inherited values and throwing accessors bypass the intended result boundary. |

## 🌊 Data-Flow Trace

| Artifact | Data | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `suggestionCatalogue` | Validated authored records | `suggestions.data.json` to validator to export | Yes | ⚠️ FLOWING WITH VALIDATION GAP |
| `getSuggestionsForBank()` | Bank-aware resolved suggestions | Validated catalogue plus canonical `banks` and `labelFor()` | Yes | ✓ FLOWING |
| Phase 4 rail | Rendered suggestions | Not part of Phase 3 | N/A | N/A, explicitly deferred |

## 🧪 Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full quality gate | `just ci` | 0 check warnings/errors; 8 files and 99 tests pass; production build succeeds | ✓ PASS |
| Clean sparse arrays and hidden own keys | Included focused suggestion tests | 46/46 pass | ✓ PASS |
| Sparse slots ignore inherited numeric properties | Vite SSR public-validator probe | Inherited record and inherited `C` key both return `ok: true` | ✗ FAIL |
| Validator never invokes accessors | Vite SSR public-validator probe | ID getter runs once and throws `getter executed` | ✗ FAIL |
| Blank authored text is rejected | Vite SSR U+200B ID/label probe | Both return `ok: true` | ✗ FAIL |
| Unexpected-field diagnostics remain single-line and unambiguous | Vite SSR newline-key probe | Path contains a literal line break | ✗ FAIL |

## 🧰 Probe Execution

No PLAN-declared or conventional `scripts/**/tests/probe-*.sh` probe exists. Step 7c is not applicable.

## 📋 Requirements Coverage

| Requirement | Source Plans | Status | Evidence |
|---|---|---|---|
| PROG-01 | 03-01, 03-02 | ✓ SATISFIED | One plain JSON catalogue is the sole content source; valid content edits require no application-code change. |
| PROG-02 | 03-01, 03-02, 03-03 | ✗ BLOCKED | Normal order and repetition work, but a sparse steps slot can inherit and project a prototype key as authored data. |
| PROG-03 | 03-01, 03-02, 03-03 | ✗ BLOCKED | Prototype-supplied slots, accessors, and format-only blank text demonstrate malformed/blank inputs that do not return actionable validation failures. |
| PROG-04 | 03-01, 03-02 | ✓ SATISFIED | Bank and chord names resolve from `banks` and `labelFor()` only. |
| PROG-05 | 03-01, 03-02 | ✓ SATISFIED | Source-order lookup returns deterministic zero, one, or several fresh results. |
| PROG-06 | 03-01, 03-02 | ✓ SATISFIED | Both supported kinds validate and survive lookup without grouping/coalescing. |
| PROG-07 | 03-01, 03-02, 03-03 | ✗ BLOCKED | CI is green but does not cover the confirmed validator failures. |
| BOOT-01 | 03-01, 03-02 | ✓ SATISFIED | Exact three-record bootstrap covers progression/movement; the other 98 banks resolve empty. |

All eight Phase 3 requirement IDs appear in PLAN frontmatter and `REQUIREMENTS.md`. No Phase 3 requirement is orphaned. Requirement checkboxes in `REQUIREMENTS.md` were treated as metadata, not evidence.

## 🧾 Independent Review-Finding Disposition

| Review finding | Verdict | Independent evidence |
|---|---|---|
| CR-01 inherited array elements bypass sparse validation | CONFIRMED, BLOCKER | Custom array prototypes at index 0 make sparse catalogue/steps inputs return `ok: true`. |
| WR-01 accessors execute and inherited context can leak | CONFIRMED, WARNING | Own ID getter executes once and its exception escapes `validateSuggestionCatalogue()`. |
| WR-02 format-only Unicode passes blank rule | CONFIRMED, WARNING | U+200B-only ID and label both validate successfully. |
| WR-03 unexpected-field paths are ambiguous | CONFIRMED, WARNING | A key containing a newline creates a multiline raw path. Code also gives same-description symbols identical text paths. |

## 🚩 Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/suggestions.ts` | 128, 232 | Ordinary property access on sparse unknown arrays | 🛑 BLOCKER | Prototype-inherited values become trusted entries or keys. |
| `src/suggestions.ts` | 141-145, 221 | Direct/reflective reads invoke accessors | ⚠️ WARNING | Validation can mutate, throw, or escape its `ValidationResult` contract. |
| `src/suggestions.ts` | 77-79 | `trim()` alone defines nonblank text | ⚠️ WARNING | Invisible format/control-only labels are accepted. |
| `src/suggestions.ts` | 217-219 | Raw unexpected-key path interpolation | ⚠️ WARNING | Diagnostics can be multiline or ambiguous. |

No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, placeholder, empty-handler, or console-only marker exists in the three phase artifacts.

### Disconfirmation Check

- Partial requirement
  - PROG-03 rejects ordinary malformed JSON-like values but not the full valid-JavaScript `unknown` surface its public signature and Plan 03-03 threat model claim.
- Misleading passing test
  - `rejects a sparse top-level catalogue slot` proves a clean hole only; it does not prove own-slot semantics when the prototype supplies index 0.
- Uncovered error path
  - A throwing getter escapes rather than returning ordered `CatalogueIssue[]`.

## 👤 Human Review Flags

The phase is data-only, so no visual, hardware, external-service, or runtime UAT is required. Three judgment-tier prohibitions remain non-authoritative and flagged:

1. **Catalogue scope stays non-authoring and non-comprehensive**
   - Static inspection agrees, but human review remains recommended.
2. **Canonical musical names are not duplicated or invented**
   - Data contains no bank/chord-name fields; resolver uses canonical sources only.
3. **Lookup remains inert**
   - Module dependencies and outputs are data-only; no MIDI/playback/state surface is referenced.

## ⏭️ Deferred Item Filter

None. Phases 4-6 do not promise to repair the Phase 3 validator or add these regression cases.

## 🧱 Gaps Summary

- 🛑 The phase goal remains unachieved.
  - The clean-hole and hidden-own-key repair is real.
  - The public trust boundary still certifies inherited sparse-slot values and can escape through accessors.
  - Visually blank text and malformed diagnostic keys also violate the roadmap contract.
- 🧪 The test suite is green but incomplete.
  - Add fail-first public regressions for all four confirmed review findings, then repair the descriptor/path/text handling.

---

_Verified: 2026-08-18T18:59:30Z_
_Verifier: the agent (gsd-verifier)_
