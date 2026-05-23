# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-23
**Phases:** 2 (Phase 1 prototype — retrospective; Phase 2 — 9 plans) | **Plans:** 9 | **Tests:** 45/45

### What Was Built
- Full J-6 chord-pad → OP-1 loop: 100 banks × 12 chords, 6 playback styles, latch, Ableton-style keyboard control.
- Bidirectional MIDI transport sync — clock-send master (Int) + Start/Stop/Continue/Record slave (Ext) with downbeat alignment, double-trigger guard, mode-switch hard stop.
- Reliable clear-all/panic path — no stuck pads, no hanging notes across mode-switch, disconnect, reload.
- iPad/iPhone touch ergonomics, voicing audit (~30% inferred slots tightened), consumer-product MANUAL.md.

### What Worked
- **UAT-as-acceptance-gate.** The v1 roadmap was deliberately built so the `.research/UAT.md` walkthrough *is* the milestone gate — it retroactively signed off a pre-GSD prototype (Phase 1) without inventing fake plan files. Clean fit for brownfield adoption.
- **CSS-only / wiring-only plans.** 02-03 (ergonomics) and 02-04 (transport) shipped with zero new dependencies and zero JS churn — small, reviewable surface.
- **Pure-math helpers behind the test boundary.** `nextDownbeatTick` / `ticksUntilDownbeatFrom` made the testable slice of an otherwise hardware-only requirement (Ext-clock alignment) actually unit-testable, honoring DEC-tests-data-and-math-only.

### What Was Inefficient
- **UAT surfaced a second wave of work.** The walkthrough found enough bugs to need 4 gap-closure plans (02-06..02-09) after the 5 base plans — the first UAT pass wasn't a sign-off, it was a bug-finding pass. Worth budgeting a gap-closure round into any UAT-gated milestone.
- **Bookkeeping lag.** Plan checkboxes + STATE plan-counts trailed the actual committed work; the milestone CLI also miscounted the retrospective Phase 1 (reported 1 phase / 50%), needing manual correction. Brownfield phases with no plan dir confuse the counters.

### Patterns Established
- **Retrospective phase** — a shipped-before-GSD phase is captured as `[x] retrospective (no plan files)` and validated through a later phase's UAT, not back-filled with synthetic plans.
- **Gap-closure plans** — UAT-surfaced bugs become their own numbered plans (02-06..09) rather than silent edits, keeping the audit trail intact.
- **`host.panic()` as the single clear-all path** — every disruption (mode-switch, stop, disconnect, unload) funnels through one idempotent teardown.

### Key Lessons
1. **A UAT gate finds bugs; plan for the closure round.** Treat the first UAT walkthrough as discovery, not sign-off.
2. **The fragile latch state machine is the real debt.** Four parallel booleans across host + App.svelte with no unit coverage drove most v1 UAT bugs. v2 must move play/latch truth into the host (todo captured). Fixing symptoms (02-07/08) bought a clean ship but not a clean design.
3. **Brownfield + GSD counters disagree.** The milestone CLI counts phases by on-disk plan dirs; a retrospective phase needs manual count correction at close.

### Cost Observations
- Model mix: not tracked this milestone.
- Notable: most Phase 2 plans were single-session, small-diff (CSS-only / wiring-only) — cheap to review, cheap to verify.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 2 | 9 | GSD adopted mid-flight on a brownfield prototype; UAT walkthrough as the milestone acceptance gate |

### Cumulative Quality

| Milestone | Tests | Zero-Dep Additions |
|-----------|-------|--------------------|
| v1.0 | 45/45 | Phase 2 added zero new dependencies |

### Top Lessons (Verified Across Milestones)

1. _(pending v2)_ — UAT gates need a built-in gap-closure round.
2. _(pending v2)_ — host-owned state SSOT vs. dual-store desync: did the v2 refactor actually kill the bug class?
