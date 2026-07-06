# Phase 2: Post-prototype polish + UAT acceptance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 2-post-prototype-polish-uat-acceptance
**Areas discussed:** UAT walkthrough timing, Voicing audit scope + method, iPad polish scope, Transport sync UX behavior, User manual (emerged during transport-sync discussion)

---

## UAT walkthrough timing

| Option | Description | Selected |
|--------|-------------|----------|
| Last — single final gate | Finish all polish work, then walk UAT once as the closing v1 gate | ✓ |
| First — surface bugs, then fix | Walk UAT early to discover anything broken, fix everything, re-walk to close | |
| Iterative — UAT each work-item | Run UAT sections per work-item as it lands | |

**User's choice:** Last — single final gate.
**Notes:** User clarified that UAT is the standard `/gsd:verify-work` flow — walk → log gaps → fix → re-verify. Not a phase-level design question, just standard workflow. Follow-up question about gap handling was retracted.

---

## Voicing audit scope + method

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted — ~30% inferred slots only | Audit just the slots flagged in the original two-extraction diff | |
| Full — all 1,200 slots re-verified | Re-extract everything from Roland source + cross-check | ✓ |
| Sample — audit + spot-check verified ones | Audit the ~30% inferred + random 5% spot-check of verified | |

**User's choice:** Full re-verify, and brought a third independent source — `https://stonefruit.github.io/j6/` — for cross-check.
**Notes:** User dispatched two parallel sub-agents in this discuss-phase (not deferred to execute) to cross-check Jay-6 against (a) stonefruit and (b) Roland. Triangulation result: 293 slots flagged by both sources, with stonefruit + Roland in 100% agreement on the correct notes for every one. User then ran reconciliation in a separate chat. Post-fix re-audit returned clean (Roland 1200/1200, stonefruit 1198/1200 with 2 cosmetic whitespace residuals). `REQ-voicing-second-pass-audit` complete BEFORE Phase 2 plan-phase begins.

### Tie-break sub-question (resolved during discussion)

| Option | Description | Selected |
|--------|-------------|----------|
| Roland canonical | Roland = truth; stonefruit + Jay-6 = parallel evidence; ear only for ambiguous | |
| Three-way consensus, ear on ties | Majority of 3 sources wins; true 3-way splits go to ear test | (effectively this — sources converged 100% so no ties) |
| Hardware ear always wins | Sample-test every slot on OP-1 | |

**User's choice:** Roland = source of truth, but mismatches flagged to user (not auto-resolved). Two sub-agents asked to check now rather than at execute time.
**Notes:** Source agreement was so strong (293/293 stonefruit↔Roland match on disputed slots) that the methodology became "auto-patch where two independent sources agree; flag the 3 Roland-only diffs for eyeball."

---

## iPad polish scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — user-select: none only | TopBar + dropdowns parity with PianoLayout | |
| Targeted — + touch-action: manipulation | Above + kill 300ms tap delay | |
| Full ergonomics pass | All of the above + 44pt tap targets + scroll prevention + active-state feedback | ✓ |
| Defer scope to UAT findings | Ship minimal fix now, let UAT surface the rest | |

**User's choice:** Full ergonomics pass + run `/gsd:ui-phase 2` for a design contract.
**Notes:** User added a new sub-item: black-key visibility against dark background is currently low — wants the UI phase to generate options and decide. Treats iPad polish as a real UI work item, not a mechanical CSS patch.

### Black-key visibility sub-question

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle border / lighter shade | Bump fill to ~#2a2a2a + 1px outline | |
| Bigger contrast shift | Fill ~#3a3a3a + bigger outline | |
| Let UI phase decide | Note the issue, let UI phase generate options + pick | ✓ |

**User's choice:** Let UI phase decide.

---

## Transport sync UX behavior

### Clock send activation

| Option | Description | Selected |
|--------|-------------|----------|
| Always on when Int | Free-running 24 PPQ on Int activation | ✓ |
| Only when engine playing | Quiet wire, breaks downstream tempo lock between pads | |
| User-toggleable in TopBar | Default always-on + UI toggle | |

**User's choice:** Whatever is standard — confirmed "always on when Int" as the standard DAW/drum-machine behavior.
**Notes:** User asked for pros/cons before deciding. Also asked what "Int" meant — clarified in-session (Internal clock mode = Jay-6 owns the clock vs Ext = slaves to incoming).

### Mode switch (Int↔Ext) mid-playback

| Option | Description | Selected |
|--------|-------------|----------|
| Hard stop — panic + reset | Fires panic(), stops engine, clears latch; user restarts manually | ✓ |
| Soft swap — keep playing, re-anchor next beat | Engine continues, new source takes over on next downbeat | |
| Soft swap — keep playing, immediate | Engine continues on new source instantly | |

**User's choice:** Hard stop — panic + reset.

### Transport receive (Ext mode — Start/Stop/Continue from OP-1)

**No formal question asked** — user requested an educational walkthrough of MIDI transport conventions instead, since this was their first MIDI app of this kind. After the walkthrough:

**User's choice:** "Let's keep things as standard as possible, and then I can always iterate" → hybrid live-instrument model (option 2 of the 3 presented in the walkthrough).
- Start → engines arm, rhythm pattern position reset to 0
- Pad presses fire immediately on press (live-instrument behavior)
- Rhythm engines anchor step counter to incoming Clock
- Stop → stop engines, all notes off
- Continue → resume from saved position
- OP-1 Record = treated as Start
- Double-trigger guard: ignore Start within 200ms of last Start

**Notes:** User wants ability to "press Record on OP-1 → Jay-6 starts on time." Hybrid model is the simplest standard interpretation; user reserves right to revisit in a future update via the user manual ("if I change my mind, I can always update the behaviour").

---

## User manual (emerged during transport-sync discussion)

### Format + location

| Option | Description | Selected |
|--------|-------------|----------|
| MANUAL.md at repo root | Single markdown file, GitHub-friendly | ✓ |
| docs/ folder with sections | Multi-file structure | |
| In-app help overlay | Built into the app as a modal | |

**User's choice:** MANUAL.md at repo root.

### Sections (multi-select)

| Option | Selected |
|--------|----------|
| Setup (browser, MIDI permission, port select) | ✓ (kept short) |
| Pads + chords (banks, transpose, latch, keyboard) | ✓ |
| Styles (Hold/Arp/Phrase/RG + variations) | ✓ |
| Clock + transport sync (Int/Ext, OP-1 chain) | ✓ |

**User's choice:** All four sections.
**Notes:** User framed it as "if this were a hardware device shipped to a customer, we'd want a nice manual — ideally one that's way better than the Roland manual because the Roland manual is terrible." The manual is the ship gate: "we can consider it shipped if the user manual is clear enough." Setup section kept short — manual is about USE, not internals. Structure designed to grow as v2 (sequencer) adds its own section.

---

## Claude's Discretion

- Black-key visibility palette (deferred to UI phase)
- Which 3–5 reconciled voicing slots become new `test/banks.test.ts` anchors
- Exact wording / layout of MANUAL.md within the agreed structure
- Code structure for transport sync wiring (`App.svelte` $effect vs `host.ts` extension vs new module) — must respect DEC-engines-time-source-agnostic + DEC-engine-orchestrator

## Deferred Ideas

- In-app help overlay (`?` button → MANUAL excerpt modal) — Phase 3+ UX upgrade
- Strict "step sequencer" transport mode (pad press during Ext waits for downbeat) — rejected for v1, can be revisited in a future update if live-feel isn't right
- Sub-agent voicing-audit pattern as a reusable `j6-voicing-cross-check` skill — bespoke for v2 if needed
