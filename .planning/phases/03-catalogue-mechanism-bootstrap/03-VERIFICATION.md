---
phase: 03-catalogue-mechanism-bootstrap
verified: 2026-08-18T19:56:18Z
status: passed
score: 8/8 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 6/8
  gaps_closed:

    - "Invalid and malformed catalogue data now fails closed for inherited slots, accessors, invisible-only text, and hostile diagnostic keys."
    - "Automated public regressions now cover every independently reproduced Phase 3 trust-boundary failure."
  gaps_remaining: []
  regressions: []
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
human_verification:

  - test: "Confirm the catalogue remains a direct, deliberately small data-maintenance surface rather than an authoring workflow or claim of comprehensive musical authority."
    expected: "Only src/suggestions.data.json carries suggestion content, with no generator, editor, or comprehensive-coverage claim."
    why_human: "This is a product-scope judgment-tier prohibition. Static inspection supports it but cannot authoritatively resolve intent."

  - test: "Confirm suggestion content does not duplicate or invent canonical bank and chord names."
    expected: "The catalogue stores no bank or chord-name fields, and unnamed stack-bank display labels come only from labelFor()."
    why_human: "This is a product-integrity judgment-tier prohibition requiring explicit human acceptance."

  - test: "Confirm suggestion lookup remains inert and has no performance authority."
    expected: "Reading suggestions does not audition, schedule, sequence, score, advance, or alter MIDI, playback, transport, clock, latch, or UI state."
    why_human: "The dependency and output surfaces are data-only, but the PLAN explicitly leaves this prohibition for human judgment."
---

# 🔍 Phase 3: Catalogue Mechanism & Bootstrap Verification

**Phase Goal:** Flo and agents can maintain trustworthy bank-aware suggestion data without changing application code.
**Verified:** 2026-08-18T19:56:18Z
**Status:** human_needed
**Re-verification:** Yes, after Plan 03-04 gap closure

## 🎯 Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | One plain catalogue is the only suggestion-content maintenance surface, with factory bank, ordered keys, and an honest kind. | ✓ VERIFIED | `src/suggestions.data.json` is the sole content source. `src/suggestions.ts:353-362` imports it as `unknown`, validates it, and exports only the trusted projection. |
| 2 | Repeated and consecutive steps remain distinct and authored order is preserved. | ✓ VERIFIED | Indexed collection at `src/suggestions.ts:255-287` preserves every valid position without deduplication or sorting. Focused ordering and repetition tests pass. |
| 3 | Invalid and malformed catalogue data fails closed with deterministic actionable issues. | ✓ VERIFIED | Descriptor-only reads at `src/suggestions.ts:83-89,153-175,255-273` reject inherited, missing, and accessor-backed values without getter execution. Visible-text and escaped-path rules are at lines 67-105. Six public gap regressions pass, and an independent Vite SSR probe reproduced the corrected results. |
| 4 | Lookup returns zero, one, or several suggestions in source order and retains each suggestion's kind. | ✓ VERIFIED | Guarded `filter().map()` at `src/suggestions.ts:364-390`; exact Bank 1, Bank 14, and exhaustive 1..100 tests pass. |
| 5 | Chord and bank names come only from canonical banks and `labelFor()`, retaining raw blank stack-bank names separately. | ✓ VERIFIED | `src/suggestions.ts:369-387` resolves only from `banks` and `labelFor()`. Exact Bank 1 altered/slash labels and Bank 14 empty-name fallback tests pass. |
| 6 | The bundled catalogue is exactly the two ordered Bank 1 progressions plus one Bank 14 movement; the other 98 banks are empty. | ✓ VERIFIED | The 38-line JSON contains exactly the three locked records. Production deep-equality and exhaustive empty-bank tests pass. |
| 7 | Authoring and resolved contracts contain only inert catalogue and canonical text data, without speculative metadata or runtime authority. | ✓ VERIFIED | Exact key-set tests pass. `src/suggestions.ts` imports only JSON and canonical bank helpers, with no MIDI, engine, timing, transport, callback, or state dependency. |
| 8 | Automated checks prove the complete catalogue integrity contract. | ✓ VERIFIED | The 51 focused tests include inherited-slot, accessor, invisible-text, hostile-path, identity, canonical-resolution, and empty-bank coverage. `just ci` passes 104/104 tests, strict checks, and the production build. |

**Score:** 8/8 truths verified, 0 present-but-behavior-unverified

### Roadmap Success Criteria

| # | Roadmap contract | Status | Evidence |
|---|---|---|---|
| 1 | One plain catalogue stores factory bank, ordered keys, and honest kind. | ✓ VERIFIED | Sole JSON catalogue plus exact five-field validation and projection. |
| 2 | Banks resolve zero, one, or several suggestions in deterministic order with canonical names. | ✓ VERIFIED | Source-order resolver plus exact and exhaustive tests. |
| 3 | Invalid and malformed data fails with actionable errors. | ✓ VERIFIED | Descriptor-safe public validator and exact adversarial issue assertions. |
| 4 | Tiny representative bootstrap covers both kinds and leaves other banks empty. | ✓ VERIFIED | Three records, two kinds, 98 empty banks. |
| 5 | Automated checks prove integrity and lookup. | ✓ VERIFIED | Focused 51-test suite plus full 104-test CI gate. |

## 📐 Every PLAN Must-Have Accounted For

| Plan | Must-have | Status | Evidence |
|---|---|---|---|
| 03-01 | Repeated or consecutive keys remain distinct. | ✓ | Indexed validation and exact repetition test. |
| 03-01 | Empty steps are rejected. | ✓ | Exact `invalid-steps` test. |
| 03-01 | Accepted step positions remain authored. | ✓ | Dense ordered projection and exact arrays. |
| 03-01 | Empty catalogue succeeds; missing or blank fields fail. | ✓ | Empty, missing, whitespace, format, and control cases pass. |
| 03-01 | Unicode and sharps survive; whitespace or case mismatch fails. | ✓ | Exact preservation and rejection tests pass. |
| 03-01 | Blank canonical names stay raw; only `labelFor()` supplies fallback. | ✓ | Exact Bank 14 resolution test. |
| 03-01 | Altered and slash labels remain canonical. | ✓ | Exact Bank 1 resolution test. |
| 03-01 | Adjacent progression and movement records retain kinds. | ✓ | Exact catalogue and resolved kind assertions. |
| 03-01 | Missing, blank, and unsupported kinds reject. | ✓ | Exact invalid-kind tests, including accessor-backed kind. |
| 03-01 | Kind never groups or sorts source order. | ✓ | Resolver filters then maps without sorting. |
| 03-01 | Bank 1 records remain adjacent; Bank 14 resolves independently. | ✓ | Exact production and resolution tests. |
| 03-01 | Every bank other than 1 and 14 returns `[]`. | ✓ | Exhaustive 100-bank test. |
| 03-01 | Production catalogue is exactly three locked records in order. | ✓ | Deep-equality test against the locked fixture. |
| 03-02 | Content changes occur in one JSON array with deterministic validation and no logic edit. | ✓ | Sole data file flows through staged validation. |
| 03-02 | Imported unknown data passes exact staged validation before trust. | ✓ | Import, validation, fail-fast error, and trusted export at `src/suggestions.ts:353-362`. |
| 03-02 | Lookup returns fresh zero, one, or many results in source order. | ✓ | Resolver and fresh nested identity tests pass. |
| 03-02 | Resolution uses only canonical `banks` and `labelFor()`. | ✓ | Direct source trace and exact labels. |
| 03-02 | Only three records are populated; 98 banks are empty. | ✓ | Locked JSON plus exhaustive lookup. |
| 03-02 | No speculative or mutable runtime fields leak into contracts. | ✓ | Exact authoring and resolved key-set tests plus dependency scan. |
| 03-03 | Sparse catalogue and step slots never become trusted values. | ✓ | Clean and inherited holes reject at physical indexes. |
| 03-03 | Every own string or symbol extra is rejected. | ✓ | Non-enumerable, unsafe-string, and symbol regressions pass. |
| 03-03 | Validator and resolver projections are fresh. | ✓ | Array, record, step-array, and resolved-step identity assertions pass. |
| 03-04 | Sparse slots accept only own data values and never invoke getters. | ✓ | Three dedicated public regressions plus independent probe. |
| 03-04 | Allowed record fields use own data descriptors only. | ✓ | Inherited and all six accessor cases return exact issues with zero getter calls. |
| 03-04 | IDs and labels require a visible code point while preserving valid Unicode. | ✓ | Format/control-only rejection and visible Unicode preservation tests pass. |
| 03-04 | Unexpected paths are escaped, single-line, stable, and unambiguous. | ✓ | Exact unsafe-string and same-description symbol path test passes. |
| 03-04 | Public regressions and full CI retain all earlier semantics. | ✓ | 51 focused and 104 full tests pass; catalogue and canonical data are unchanged by the repair. |

## 📦 Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/suggestions.data.json` | Sole plain three-record bootstrap catalogue | ✓ VERIFIED | Exists, parses, is substantive, and contains exactly five authored fields per record. |
| `src/suggestions.ts` | Fail-closed validator plus canonical bank-aware resolver | ✓ VERIFIED | 390 substantive lines, exported and tested. Descriptor, text, path, import, and resolver wiring are present. |
| `test/suggestions.test.ts` | Complete validator, projection, catalogue, and resolver contract | ✓ VERIFIED | 851 substantive lines and 51 passing tests. The artifact helper's literal `contains: does not invoke getters` check misses the semantically equivalent test titles `without invoking getters`; manual inspection confirms zero-call and no-throw assertions. |

## 🔗 Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `test/suggestions.test.ts` | `src/suggestions.ts` | Public validator, catalogue, kind, and resolver imports | ✓ WIRED | Public exports are exercised by 51 passing focused tests. |
| `test/suggestions.test.ts` | `src/banks.ts` | Canonical expected labels | ✓ WIRED | Tests pin Bank 1 names and Bank 14 fallbacks. |
| `src/suggestions.ts` | `src/suggestions.data.json` | Unknown import, validation, export | ✓ WIRED | Lines 3 and 353-362 form the complete trust path. |
| `src/suggestions.ts` | `src/banks.ts` | `KEYS`, `banks`, and `labelFor()` | ✓ WIRED | Canonical vocabulary validates keys and resolves names. |
| `src/suggestions.ts` | `ValidationResult` | Own descriptors before trusted projection | ✓ WIRED | Lines 83-89 and 153-333 return deterministic result objects without executing accessors. |
| `CatalogueIssue.path` | import-time error formatting | Escaped paths passed to `formatCatalogueIssue()` | ✓ WIRED | Path construction at lines 91-105 flows into lines 341-359. The key-link helper cannot evaluate this PLAN row because its `from` value is a concept rather than a file path; manual trace confirms the link. |

## 🌊 Data-Flow Trace

| Artifact | Data | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `suggestionCatalogue` | Validated authored records | `suggestions.data.json` to unknown import to validator to export | Yes | ✓ FLOWING |
| `getSuggestionsForBank()` | Bank-aware resolved suggestions | Validated catalogue plus canonical `banks` and `labelFor()` | Yes | ✓ FLOWING |
| Phase 4 rail | Rendered suggestions | Explicit later-phase consumer | N/A | ℹ️ DEFERRED TO PHASE 4 |

## 🧪 Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Enumerate focused behavior contract | `vitest list test/suggestions.test.ts` | 51 named tests found, including all gap regressions | ✓ PASS |
| Focused catalogue contract | `vitest run test/suggestions.test.ts` | 51/51 tests pass | ✓ PASS |
| Full quality gate | `just ci` | 0 check errors or warnings, 104/104 tests pass, production build succeeds | ✓ PASS |
| Former trust-boundary failures | Independent Vite SSR public-validator probe | Inherited slots reject; accessors reject with zero getter calls; U+200B-only ID rejects; newline key is escaped | ✓ PASS |

## 🧰 Probe Execution

No PLAN-declared or conventional `scripts/**/tests/probe-*.sh` probe exists. Step 7c is not applicable.

## 📋 Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|---|---|---|---|---|
| PROG-01 | 03-01, 03-02 | One plain agent-editable catalogue | ✓ SATISFIED | Content lives only in `src/suggestions.data.json`; application logic consumes the validated projection. |
| PROG-02 | 03-01, 03-02, 03-03, 03-04 | Factory bank plus ordered valid pad keys | ✓ SATISFIED | Dense own-data traversal preserves order and rejects invalid, missing, inherited, and accessor slots. |
| PROG-03 | 03-01, 03-02, 03-03, 03-04 | Reject invalid, blank, duplicate, and malformed entries | ✓ SATISFIED | Exact staged issues cover bank, key, duplicate, shape, descriptor, invisible-text, and hostile-path cases. |
| PROG-04 | 03-01, 03-02 | Resolve names from canonical bank data | ✓ SATISFIED | Catalogue has no bank or chord-name fields; resolver uses only `banks` and `labelFor()`. |
| PROG-05 | 03-01, 03-02 | Deterministic zero, one, or many lookup | ✓ SATISFIED | Source-order filter-map plus exhaustive lookup tests. |
| PROG-06 | 03-01, 03-02 | Distinguish progression from movement | ✓ SATISFIED | Two-value runtime allowlist, validation, exact bootstrap, and resolved kinds. |
| PROG-07 | 03-01, 03-02, 03-03, 03-04 | Automated integrity and lookup proof | ✓ SATISFIED | 51 focused tests and the 104-test full CI gate pass. |
| BOOT-01 | 03-01, 03-02 | Tiny representative bootstrap and honest empty banks | ✓ SATISFIED | Exactly three records cover both kinds; the other 98 banks return `[]`. |

All eight Phase 3 requirement IDs appear in PLAN frontmatter and in `REQUIREMENTS.md`. No additional requirement maps to Phase 3, so there are no orphaned requirements. REQUIREMENTS checkboxes and traceability status text were treated as metadata, not implementation evidence.

## 🚩 Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| None | N/A | No debt markers, placeholders, empty handlers, console-only implementations, or user-visible hardcoded empty stubs | None | No blocker or warning found. Intentional empty accumulators and empty-bank results are populated or behaviorally tested. |

### Disconfirmation Check

- 🔎 Partial requirement search
  - No positive Phase 3 requirement remains partially implemented.
  - Three judgment-tier prohibitions remain non-authoritative until human acceptance.
- 🧪 Potentially misleading passing test
  - `exposes only inert canonical text fields` checks enumerable key sets, so it is insufficient alone to prove the entire dependency boundary.
  - Source inspection independently confirms object-literal outputs and no MIDI, state, engine, transport, or callback imports.
- 🧯 Uncovered error path
  - The defensive `Canonical bank ... is missing chord` branch at `src/suggestions.ts:380-382` has no direct test.
  - Current validated keys and canonical bank invariants make it unreachable; this is informational, not a Phase 3 gap.

## 👤 Human Verification Required

### 1. Catalogue scope remains honest

**Test:** Review the catalogue maintenance surface and intended scope.
**Expected:** Content changes happen only in `src/suggestions.data.json`; no authoring UI, generator, or comprehensive-authority claim exists.
**Why human:** This is a product-scope judgment-tier prohibition.

### 2. Canonical musical names are not invented

**Test:** Review the catalogue fields and the unnamed stack-bank fallback policy.
**Expected:** No bank or chord names are authored in suggestion data; names come from `banks` and `labelFor()` only.
**Why human:** This is a product-integrity judgment-tier prohibition.

### 3. Lookup remains inert

**Test:** Review or exercise suggestion lookup while observing application state and MIDI output.
**Expected:** Lookup produces read-only text data and causes no audition, sequencing, scheduling, scoring, transport, clock, latch, playback, MIDI, or UI-state change.
**Why human:** Static evidence is strong, but the prohibition is explicitly marked for human judgment.

## ⏭️ Deferred Item Filter

No actionable gap matches a later milestone phase. Phase 4 is the intended suggestion-rail consumer, not a repair for Phase 3.

## 🧱 Gaps Summary

- ✅ Both previously failed truths are closed.
  - Descriptor-safe validation rejects the reproduced malformed inputs without getter execution.
  - Public regressions cover every prior trust-boundary failure and the full CI gate is green.
- 👤 No automated gap remains.
  - The overall status is `human_needed` solely because three judgment-tier prohibitions cannot receive an authoritative autonomous pass.

---

_Verified: 2026-08-18T19:56:18Z_
_Verifier: the agent (gsd-verifier)_
