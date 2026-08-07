# Phase 3: Catalogue Mechanism & Bootstrap - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-08-07
**Phase:** 3-catalogue-mechanism-bootstrap
**Areas discussed:** Catalogue authoring contract, validation feedback, tiny bootstrap

---

## Catalogue Authoring Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Flat JSON records | Native to the existing Vite and TypeScript data pipeline. Array order defines lookup order without another dependency. | ✓ |
| Flat YAML list | Friendlier punctuation and comments, but adds a parser and a second static-data path. | |

**User's choice:** Use whichever format makes ongoing curation easiest. After comparing the full editing workflow, lock flat JSON.

**Notes:**

- Curation will normally be agent-assisted, making JSON punctuation negligible.
- Records stay minimal: `id`, `bankIndex`, `label`, `kind`, and ordered `steps`.
- Numeric bank identity and file ordering avoid duplicated names and explicit order metadata.

---

## Validation Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Report all independent problems | Staged validation returns a complete, deterministic repair list in one run. | ✓ |
| Stop at the first problem | Simpler validator, but forces repeated repair and rerun cycles. | |
| Auto-mutating validator | Repairs data itself, but risks concealing intent changes. | |

**User's choice:** Never stop at the first problem. An editing agent should fix obvious mechanical issues before involving Flo.

**Notes:**

- The validator remains pure and non-mutating.
- Editing agents repair JSON formatting, casing, whitespace, and similarly unambiguous issues without asking permission.
- Flo is involved when existing curated entries conflict or a repair would destructively reinterpret established work.
- Musical curation itself is agent work. Raw musical judgment is not automatically an escalation.

---

## Tiny Bootstrap

| Option | Description | Selected |
|--------|-------------|----------|
| Two banks and three entries | Two ordered Pop progressions plus one Oct Stack movement prove every mechanism state and leave 98 banks empty. | ✓ |
| One bank and two entries | Absolute minimum content, but weaker kind semantics and no real unnamed-label fixture. | |

**User's choice:** Two banks and three easy entries that prove the system works. Real curation happens afterwards.

**Notes:**

- Bank 1 Pop: `C → A → B → C` and `C → D → F → C`.
- Bank 14 Oct Stack: `C → D → E → D`.
- The fixtures do not imply broad catalogue coverage or finished editorial curation.

---

## The agent's Discretion

- Exact catalogue filename and TypeScript module boundaries.
- Resolver and diagnostic record shapes.
- Stable IDs and short labels for the three bootstrap records.
- Test decomposition.

## Deferred Ideas

- Future catalogue curation is bank-first and agent-led:
  - Inspect a selected bank.
  - Research suitable ideas.
  - Propose them to Flo for iteration.
  - Write and validate approved records.
- Catalogue expansion remains direct data work after Phase 3.
- Rendering and browsing remain Phase 4.
