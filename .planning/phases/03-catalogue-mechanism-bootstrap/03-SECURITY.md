---
phase: 3
slug: catalogue-mechanism-bootstrap
status: verified
# threats_open counts OPEN threats at or above workflow.security_block_on severity.
threats_open: 0
asvs_level: 1
created: 2026-08-18
---

# Phase 3 Security

> Per-phase security contract for the catalogue mechanism bootstrap.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Agent-authored catalogue to typed domain data | Local JSON and synthetic JavaScript values remain untrusted until exact validation succeeds. | Local catalogue records; no secrets or personal data |
| Public bank index to canonical bank lookup | Caller input must pass integer and range validation before reaching the wrapping canonical helper. | Numeric bank index |
| Validated catalogue to application consumer | Consumers receive fresh, inert, known-field projections without mutable canonical references or application authority. | Suggestion text, bank identity, kind, and ordered pad keys |
| Malformed JavaScript values to diagnostics | Prototypes, holes, accessors, symbols, invisible text, and unsafe keys must fail closed without side effects or ambiguous paths. | Developer-controlled validation inputs and repair diagnostics |

---

## Threat Register

Plan-qualified references preserve traceability where successive plans reused a threat ID.

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| 03-01/T-03-01 | Tampering | `validateSuggestionCatalogue` contract | medium | mitigate | Exact-shape, allowlist, bounds, duplicate, and deterministic-diagnostic controls in `src/suggestions.ts`; public regressions in `test/suggestions.test.ts`. | closed |
| 03-01/T-03-02 | Tampering | `getSuggestionsForBank` contract | medium | mitigate | Explicit integer and `1..100` range guard throws `RangeError` before canonical lookup; boundary regressions cover invalid values. | closed |
| 03-01/T-03-03 | Information Disclosure | Catalogue diagnostics | low | accept | Diagnostics may contain offending local catalogue values; the catalogue contains no secrets, credentials, network data, or personal data. | closed |
| 03-01/T-03-SC | Tampering | Package supply chain | low | accept | Plan 01 used existing locked tooling and changed no dependency manifest or lockfile. | closed |
| 03-02/T-03-01 | Tampering | JSON import and validator in `src/suggestions.ts` | medium | mitigate | Imported data crosses an `unknown` validation boundary and is projected into fresh known-field records only after complete validation. | closed |
| 03-02/T-03-02 | Tampering | Cross-entry identity and sequence checks | medium | mitigate | Collision-safe duplicate checks run only over valid records and retain both source locations in deterministic issues. | closed |
| 03-02/T-03-03 | Elevation of Privilege | Resolved suggestion boundary | medium | mitigate | Exported values are readonly, data-only projections; the module exposes no MIDI, engine, timer, state, callback, or mutable canonical-array authority. | closed |
| 03-02/T-03-04 | Denial of Service | Import-time validation | low | accept | Linear validation is bounded by a bundled three-record local source; invalid content intentionally blocks startup for repair. | closed |
| 03-02/T-03-SC | Tampering | Package supply chain | low | accept | Plan 02 used existing TypeScript, Vite, Vitest, `Map`, and `Set` under the committed lockfile. | closed |
| 03-03/T-03-G1 | Tampering | Catalogue and step array traversal | high | mitigate | Indexed descriptor reads visit every declared position; sparse top-level and nested arrays have exact public regressions. | closed |
| 03-03/T-03-G2 | Tampering | Exact record-shape enforcement | high | mitigate | `Reflect.ownKeys` covers string, symbol, enumerable, and non-enumerable own keys; only the five declared fields survive projection. | closed |
| 03-03/T-03-G3 | Tampering | Validator and resolver output ownership | medium | mitigate | Identity regressions prove fresh catalogue arrays, records, step arrays, and resolved step objects across validation and resolution calls. | closed |
| 03-03/T-03-G4 | Denial of Service | Dense traversal of local arrays | low | accept | Work remains linear in declared lengths; production input is bundled and synthetic adversarial input is developer controlled. | closed |
| 03-03/T-03-SC | Tampering | Package supply chain | low | accept | Plan 03 used indexed loops, reflection, and existing locked test tooling without dependency changes. | closed |
| 03-04/T-03-G5 | Tampering | Array-slot and record-field reads | high | mitigate | Own data descriptors are required; inherited, missing, and accessor-backed values fail through existing validation issues. | closed |
| 03-04/T-03-G6 | Denial of Service | Accessor-bearing unknown input | high | mitigate | Validator reads never invoke getters; public regressions prove exception containment and zero getter calls. | closed |
| 03-04/T-03-G7 | Tampering | Authored `id` and `label` validation | medium | mitigate | Text must contain a Unicode-visible code point; format-only, control-only, mixed-invisible, and visible-Unicode cases are covered. | closed |
| 03-04/T-03-G8 | Repudiation | `CatalogueIssue.path` construction | medium | mitigate | Unsafe strings and line separators are escaped; symbol ordinals create stable, distinct, single-line paths. | closed |
| 03-04/T-03-G9 | Elevation of Privilege | Validated projection and resolver boundary | medium | mitigate | Exact five-field copying, valid-record-only duplicate checks, fresh projections, and inert resolution remain under the full regression suite. | closed |
| 03-04/T-03-SC | Tampering | Package supply chain | low | accept | Plan 04 used standard ECMAScript descriptors, Unicode regex properties, and existing Vitest tooling without package or lockfile changes. | closed |

*Status: open · closed · open below `high` threshold (non-blocking)*

*Severity: critical > high > medium > low. Only open threats at or above `workflow.security_block_on` count toward `threats_open`.*

*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | 03-01/T-03-03 | Repair diagnostics intentionally expose only non-sensitive local catalogue values. | Phase 3 Plan 01 | 2026-08-18 |
| AR-03-02 | 03-01/T-03-SC, 03-02/T-03-SC, 03-03/T-03-SC, 03-04/T-03-SC | All four plans use existing locked platform and test tooling; none adds or changes a dependency. | Phase 3 Plans 01–04 | 2026-08-18 |
| AR-03-03 | 03-02/T-03-04 | Import-time failure is intentional and linear over a bundled three-record catalogue. | Phase 3 Plan 02 | 2026-08-18 |
| AR-03-04 | 03-03/T-03-G4 | Dense traversal is linear and applies to locally controlled production and developer-test inputs. | Phase 3 Plan 03 | 2026-08-18 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-18 | 20 | 20 | 0 | Codex orchestrator, ASVS L1 |

### Security Audit 2026-08-18

| Metric | Count |
|--------|-------|
| Threats found | 20 |
| Closed | 20 |
| Open | 0 |

- Register authored at plan time
- Summary threat flags found
  - None
- Verification depth
  - ASVS L1 grep-depth classification
- Blocking threshold
  - `high`
- Blocking threats open
  - `0`

---

## Sign-Off

- [x] All threats have a disposition
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-18
