---
phase: "4"
slug: "read-only-suggestion-rail"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-25"
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^2.1.0 (`environment: 'node'`, no jsdom — no Svelte component mounting) |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `just ci` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `just ci`
- **Before `/gsd-verify-work`:** Full suite green + manual browser (RAIL-07) and hardware (RAIL-08) sign-off
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD (planner fills) | — | — | RAIL-03 | — | N/A | unit | `npm test -- rail.test.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | RAIL-04 | — | N/A | unit | `npm test -- rail.test.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | RAIL-06 | — | N/A | unit | `npm test -- rail.test.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | D-17 | — | N/A | unit | `npm test -- suggestions.test.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | RAIL-01/02 | — | N/A | unit (existing) | `npm test -- suggestions.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/rail.test.ts` — hold-count transitions (RAIL-03), `chipsPerRow` balanced rows (RAIL-06), echo derivation (RAIL-04, if extracted pure)
- [ ] `test/suggestions.test.ts` extension — D-17 >6-per-bank rejection (6 valid, 7 invalid)
- [ ] Manual UAT checklist entries for RAIL-01/02/05/07 (visual) and RAIL-03/08 (hardware/MIDI monitor)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chip shows `displayLabel` fallback (e.g. bank 14) | RAIL-02 | No jsdom | Open bank 14, confirm chip text non-blank |
| Rail subordinate to pads, usable on 3 viewports | RAIL-05, RAIL-07 | Visual layout | Playwright-MCP screenshots: desktop, iPad, iPhone-landscape |
| Browsing emits no MIDI | RAIL-03 | Hardware | MIDI monitor while open/page/close rail |
| Chip press = pad press, chip+pad held together, core loop intact | RAIL-08 | Hardware | OP-1 + MIDI monitor UAT |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
