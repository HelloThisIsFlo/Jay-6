---
phase: 2
slug: post-prototype-polish-uat-acceptance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | `vite.config.ts` (test block) |
| **Quick run command** | `just test` (alias for `pnpm vitest run`) |
| **Full suite command** | `just ci` (svelte-check + vitest + vite build) |
| **Estimated runtime** | ~5–10 seconds (vitest) / ~30 seconds (full ci) |

> Per **DEC-tests-data-and-math-only**: Vitest covers data + math only. Web MIDI, Svelte component mounting, and browser DOM are out of automated scope. UAT walkthrough (`.research/UAT.md` via `uat-agent` skill) is the manual verification gate that compensates.

---

## Sampling Rate

- **After every task commit:** Run `just test` (vitest)
- **After every plan wave:** Run `just ci` (full check + test + build)
- **Before `/gsd:verify-work`:** Full `just ci` must be green AND `.research/UAT.md` walkthrough complete
- **Max feedback latency:** ~10 seconds (vitest) — UAT is human-paced and runs at verify-phase

---

## Per-Task Verification Map

> Populated by planner during PLAN.md generation. Each task references a REQ + (where applicable) a threat. Tasks without an automated test path land in the Manual-Only Verifications table below.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (planner fills in) | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

> Wave 0 = test scaffolding that must exist before feature waves can verify against it.

- [ ] `test/clock.test.ts` — extend with `nextDownbeatTick(currentTick)` cases (rhythm phase alignment math per D-06)
- [ ] `test/banks.test.ts` — verify 3–5 additional reconciled anchor slots (D-19). **Note:** commit `f2d5d59` may already have added these — planner verifies before adding more (per RESEARCH.md Open Question Q1).
- [ ] No new framework install — vitest + svelte-check already in place

---

## Manual-Only Verifications

> Per **DEC-tests-data-and-math-only**, the following are intentionally NOT automated. They're verified in the UAT walkthrough (`.research/UAT.md`) as the v1 close gate.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bidirectional transport sync (clock send + Start/Stop/Continue receive) | REQ-clock-send-transport-sync | Requires OP-1 hardware + browser Web MIDI session — not mockable in Vitest per project convention | UAT § "Clock + transport sync": switch Int/Ext, press OP-1 transport buttons, verify Jay-6 reacts on-beat |
| Rhythm phase alignment under Ext clock | REQ-rhythm-phase-alignment-ext-clock | Requires OP-1 clock input + audible "on-beat" verification | UAT § "Rhythm phase alignment": start OP-1 clock mid-bar, start Jay-6 rhythm engine, verify first hit lands on downbeat |
| iPad touch ergonomics pass (user-select, touch-action, 44pt targets, scroll lock, :active feedback) | REQ-ipad-polish | Requires real iPad + Web MIDI Browser app for verification of touch behavior | UAT § "iPad polish": each TopBar control gets a long-press test (no text-selection), tap test (no 300ms delay), and visible active-state verification |
| Black-key visibility on dark background | REQ-ipad-polish (UI-SPEC D-10 / Option B) | Visual contrast judgment | UAT § "iPad polish": verify black pads readable on dark frame; if not, walk fallback ladder per UI-SPEC §4 |
| Voicing audit (REQ-voicing-second-pass-audit) | REQ-voicing-second-pass-audit | Already DONE pre-phase (commits f2d5d59, e7f2dec, e752a2f) — only ear spot-check remains | UAT § "Chord pads": play 3–5 random banks on OP-1, confirm chord output matches Roland manual / hardware reference |
| Edge cases (hot-plug, refresh, style-swap mid-hold) | REQ-edge-cases | Browser behavior under real device events | UAT § "Edge cases": unplug OP-1 mid-play, replug, refresh page, swap style while pad held |
| Gate slider audibly distinguishable | REQ-gate-slider | Subjective audio verification | UAT § "Rhythm gate slider": sweep slider 10% → 100%, verify hit duration changes audibly |
| MANUAL.md clarity (REQ-user-manual) | REQ-user-manual (new, per D-11..D-14) | Documentation quality is a human judgment | UAT § final: Flo reads MANUAL.md cold (as if first-time user), confirms it covers setup + pads + styles + clock without source-code-spelunking |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies OR justified entry in Manual-Only table
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (where automated coverage is achievable per project test scope)
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (full ci)
- [ ] UAT walkthrough complete + signed in `.research/UAT.md` (gates v1 close)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
