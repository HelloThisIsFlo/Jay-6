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

Inserted pre-sequencer work, then candidate Phase 3:

- [x] **Phase 02.1: Visual redesign adoption** (INSERTED) — adopt the committed sketch findings before sequencer scope; visual refresh only, no sequencer behavior. (completed 2026-07-06)
- [ ] **Phase 3: Sequencer** — step sequencer on a grid driving chord-pad presses; pattern chaining; basic song mode. Must slot into the existing 24 PPQ TickSource + `engines/host.ts` without violating DEC-engines-time-source-agnostic / DEC-engine-orchestrator.

Carried-in v2 todos (see `.planning/todos/`): host-owned play/latch SSOT, transport-reset record-sync, variation-change toast, visual-design pass.

## Phase Details

### Phase 02.1: Visual redesign adoption

**Goal**: Adopt the committed Jay-6 v3 visual redesign for the existing v1 feature set, without adding progression, sequencer, queued-toast, or new playback behavior.
**Depends on**: Phase 2
**Requirements**: See `.planning/milestones/pre-v2-phases/02.1-visual-redesign-adoption/02.1-SPEC.md` for the six locked requirements covering visual tokens, TopBar C2, pad surface, per-style variation pickers, responsive coverage, and existing behavior preservation.
**Success Criteria** (what must be TRUE):

  1. Desktop, iPad-sized, and iPhone-landscape browser views match the v3 sketch direction without clipped controls, unreadable primary labels, or inaccessible pad rows.
  2. TopBar C2 keeps every existing routing, tempo, and performance control reachable, with BPM visible and read-only under external clock.
  3. Pads retain the existing 5-black/7-white hardware layout and pointer/keyboard/latch behavior, with orange reserved for currently sounding or latched pads.
  4. Per-style variation controls map exactly to existing 1..12 variation indices and preserve current engine playback semantics.
  5. No progression rail, progression authoring, sequencer UI, or queued/countdown toast is added in this phase.
  6. `just ci` passes and browser smoke covers the existing control surface.

**Plans**: 4/4 plans complete
Plans:
**Wave 1**

- [x] 02.1-01-PLAN.md — shared redesign tokens and app shell

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02.1-02-PLAN.md — TopBar C2 and exact per-style variation pickers
- [x] 02.1-03-PLAN.md — lifted pad surface with preserved pointer safety

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02.1-04-PLAN.md — automated gates and desktop/iPad/iPhone browser smoke

**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Prototype (M1–M8 + keyboard) | v1.0 | N/A — retrospective | Shipped | 2026-05-18 (code) |
| 2. Post-prototype polish + UAT acceptance | v1.0 | 9/9 | Complete | 2026-05-23 |
| 02.1 Visual redesign adoption | pre-v2 | 4/4 | Complete | 2026-07-06 |
| 3. Sequencer | v2 | 0/TBD | Not started | — |
