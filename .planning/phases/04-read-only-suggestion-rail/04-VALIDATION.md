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
| 04-01-T1 | 04-01 | 1 | RAIL-02, RAIL-03, RAIL-04, RAIL-08 (hold gate, notes identity, chip precedence) | — | N/A | unit + build | `npm test -- test/rail.test.ts && just ci` | ❌ W0 (T1 creates `test/rail.test.ts`) | ⬜ pending |
| 04-01-T2 | 04-01 | 1 | RAIL-08 (single hold per source, D-07 teardown) | — | N/A | unit + build + human-check (hardware) | `npm test -- test/rail.test.ts && just ci` | ✅ after T1 | ⬜ pending |
| 04-02-T1 | 04-02 | 1 | RAIL-05 / D-17 (cap diagnostic + build gate) | — | N/A | unit + config-load proof | `npm test -- test/suggestions.test.ts` + temp-copy `loadConfigFromFile` gate proof | ✅ | ⬜ pending |
| 04-02-T2 | 04-02 | 1 | RAIL-05 / D-16, D-17 (boundary pins) | — | N/A | unit + build | `npm test -- test/suggestions.test.ts && just ci` | ✅ | ⬜ pending |
| 04-03-T1 | 04-03 | 2 | RAIL-02, RAIL-06 (row math, fit walk, label split, natural keys) | — | N/A | unit + build | `npm test -- test/rail.test.ts && just ci` | ✅ after 04-01 | ⬜ pending |
| 04-03-T2 | 04-03 | 2 | RAIL-01, RAIL-05, RAIL-07 (rail chrome, empty state) | — | N/A | build + bundle check + human-check (desktop/iPad) | `just ci` + dist copy check | ✅ | ⬜ pending |
| 04-04-T1 | 04-04 | 3 | RAIL-01, RAIL-04, RAIL-05 (strip, panel, TopBar grid) | — | N/A | build + bundle check | `just ci` + dist copy check | ✅ | ⬜ pending |
| 04-04-T2 | 04-04 | 3 | RAIL-03, RAIL-07, RAIL-08 (pager memory, Escape, silent browsing) | — | N/A | unit + build + human-check (iPhone + MIDI monitor) | `npm test -- test/rail.test.ts && just ci` | ✅ after 04-01 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/rail.test.ts` — hold-count transitions (RAIL-03), `chipsPerRow` balanced rows (RAIL-06), echo derivation (RAIL-04, if extracted pure) → created by 04-01-T1 (`chipVisualState` extracted pure); extended by 04-03-T1 and 04-04-T2
- [ ] `test/suggestions.test.ts` extension — D-17 >6-per-bank rejection (6 valid, 7 invalid) → 04-02-T1 and 04-02-T2
- [ ] Manual UAT checklist entries for RAIL-01/02/05/07 (visual) and RAIL-03/08 (hardware/MIDI monitor) → `<human-check>` blocks in 04-01-T2, 04-03-T2, 04-04-T2 (harvested into end-of-phase UAT)

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
