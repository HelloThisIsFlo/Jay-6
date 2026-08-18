---
phase: 03
slug: catalogue-mechanism-bootstrap
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-18
validated: 2026-08-18
---

# Phase 03 — Validation Strategy

> Nyquist audit result: all Phase 3 requirements have green automated verification.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.1.9 |
| **Config file** | `vite.config.ts` |
| **Focused command** | `npm test -- test/suggestions.test.ts` |
| **Full suite command** | `just ci` |
| **Focused result** | 51/51 passing |
| **Estimated runtime** | Under 15 seconds |

---

## Sampling Rate

- **After catalogue or resolver changes:** Run `npm test -- test/suggestions.test.ts`
- **Before phase verification:** Run `just ci`
- **Max feedback latency:** 15 seconds

---

## Requirement Verification Map

| Requirement | Source Plans | Automated Evidence | Status |
|-------------|--------------|--------------------|--------|
| PROG-01 | 03-01, 03-02 | Exact production-catalogue fixtures and five-field authoring surface in `test/suggestions.test.ts` | ✅ green |
| PROG-02 | 03-01–03-04 | Ordered canonical-key, repetition, sparse-slot, inherited-slot, and accessor-slot tests | ✅ green |
| PROG-03 | 03-01–03-04 | Exact-shape, malformed-field, duplicate, Unicode, descriptor, and hostile-path tests | ✅ green |
| PROG-04 | 03-01, 03-02 | Bank 1 canonical-name and Bank 14 `labelFor()` fallback resolution tests | ✅ green |
| PROG-05 | 03-01, 03-02 | Exhaustive 1–100 lookup plus invalid-index `RangeError` tests | ✅ green |
| PROG-06 | 03-01, 03-02 | Supported-kind validation and exact progression/movement fixture tests | ✅ green |
| PROG-07 | 03-01–03-04 | 51 focused tests plus the `just ci` release gate | ✅ green |
| BOOT-01 | 03-01, 03-02 | Exact three-record bootstrap, inert resolved views, and 98 empty-bank checks | ✅ green |

## Task Verification Map

| Task | Plan | Wave | Requirements | Automated Command | Status |
|------|------|------|--------------|-------------------|--------|
| 03-01-01 | 03-01 | 1 | PROG-02, PROG-03, PROG-06 | `npm test -- test/suggestions.test.ts` | ✅ green |
| 03-01-02 | 03-01 | 1 | PROG-01, PROG-04, PROG-05, PROG-07, BOOT-01 | `npm test -- test/suggestions.test.ts` | ✅ green |
| 03-02-01 | 03-02 | 2 | PROG-01, BOOT-01 | Locked-bootstrap Node assertion | ✅ green |
| 03-02-02 | 03-02 | 2 | PROG-02–PROG-07 | `npm test -- test/suggestions.test.ts && just ci` | ✅ green |
| 03-03-01 | 03-03 | 3 | PROG-02, PROG-03, PROG-07 | Fail-first adversarial regression gate | ✅ green |
| 03-03-02 | 03-03 | 3 | PROG-02, PROG-03, PROG-07 | `npm test -- test/suggestions.test.ts && just ci` | ✅ green |
| 03-04-01 | 03-04 | 4 | PROG-02, PROG-03, PROG-07 | Fail-first public-boundary regression gate | ✅ green |
| 03-04-02 | 03-04 | 4 | PROG-02, PROG-03, PROG-07 | `npm test -- test/suggestions.test.ts && just ci` | ✅ green |

---

## Manual-Only Verifications

No requirement has a manual-only validation gap.

Three product-judgment prohibitions remain recorded in `03-VERIFICATION.md` for human acceptance. They do not reduce automated requirement coverage:

- Catalogue scope remains deliberately small and honest.
- Canonical bank and chord names are not duplicated or invented.
- Suggestion lookup remains inert and carries no playback authority.

---

## Validation Audit 2026-08-18

| Metric | Count |
|--------|-------|
| Requirements audited | 8 |
| Automated gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Focused tests passing | 51 |

---

## Validation Sign-Off

- [x] All tasks have automated verification
- [x] Sampling continuity has no three-task gap
- [x] Wave 0 test contract exists and is green
- [x] No watch-mode flags appear in validation commands
- [x] Feedback latency is under 15 seconds
- [x] All Phase 3 requirements map to passing automated tests
- [x] `nyquist_compliant: true` is set in frontmatter

**Approval:** validated
