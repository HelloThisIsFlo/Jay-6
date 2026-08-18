---
phase: 03
slug: catalogue-mechanism-bootstrap
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.1.9 |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- test/suggestions.test.ts` |
| **Full suite command** | `just ci` |
| **Estimated runtime** | Under 15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- test/suggestions.test.ts`
- **After every plan wave:** Run `just test`
- **Before `$gsd-verify-work`:** `just ci` must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-02 | 03-01 | 1 | PROG-01 | T-03-01 | Exact-shape static data must pass the runtime boundary before export | integration | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-01 | 03-01 | 1 | PROG-02 | T-03-01 | Invalid bank and pad-key references fail closed | unit | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-01 | 03-01 | 1 | PROG-03 | T-03-01 | Malformed and duplicate records cannot enter the resolved catalogue | table-driven unit | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 03-01 | 1 | PROG-04 | T-03-03 | Resolved views expose canonical text only and no playback authority | integration | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 03-01 | 1 | PROG-05 | T-03-02 | Invalid lookup indexes throw instead of wrapping | unit | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-01 | 03-01 | 1 | PROG-06 | T-03-01 | Unsupported kinds fail validation | table-driven unit | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 03-01 | 1 | PROG-07 | T-03-01 | Full catalogue validation remains an automated release gate | suite gate | `just ci` | ❌ W0 | ⬜ pending |
| 03-01-02 | 03-01 | 1 | BOOT-01 | T-03-03 | Exact representative records resolve inertly; every other bank is empty | exhaustive integration | `npm test -- test/suggestions.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/suggestions.test.ts`
  - Add the validator and resolver contract before implementation.
  - Include reusable builders for valid entries and raw malformed fixtures.
- Existing Vitest infrastructure covers the phase; no framework or config changes are required.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15 seconds
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
