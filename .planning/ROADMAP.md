# Roadmap: Jay-6

## Milestones

- ✅ **v1.0 MVP** — Phases 1–2 (shipped 2026-05-23) — J-6 chord pads → OP-1, 6 styles, latch, keyboard, bidirectional transport sync. UAT 11/11 PASS.
- 📋 **v2 Sequencer** — Phase 3+ (planned) — step sequencer driving chord-pad presses; pattern chaining; basic song mode. Scope via `/gsd:new-milestone`.

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–2) — SHIPPED 2026-05-23</summary>

- [x] **Phase 1: Prototype (M1–M8 + keyboard)** — retrospective (no plan files) — completed 2026-05-18 (code), signed off via Phase 2 UAT
- [x] **Phase 2: Post-prototype polish + UAT acceptance** (9/9 plans) — completed 2026-05-23

Full detail: [`milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md) · requirements: [`milestones/v1.0-REQUIREMENTS.md`](milestones/v1.0-REQUIREMENTS.md)

</details>

### 📋 v2 Sequencer (Planned)

Run `/gsd:new-milestone` to scope. Candidate Phase 3:

- [ ] **Phase 3: Sequencer** — step sequencer on a grid driving chord-pad presses; pattern chaining; basic song mode. Must slot into the existing 24 PPQ TickSource + `engines/host.ts` without violating DEC-engines-time-source-agnostic / DEC-engine-orchestrator.

Carried-in v2 todos (see `.planning/todos/`): host-owned play/latch SSOT, transport-reset record-sync, variation-change toast, visual-design pass.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Prototype (M1–M8 + keyboard) | v1.0 | N/A — retrospective | Shipped | 2026-05-18 (code) |
| 2. Post-prototype polish + UAT acceptance | v1.0 | 9/9 | Complete | 2026-05-23 |
| 3. Sequencer | v2 | 0/TBD | Not started | — |
