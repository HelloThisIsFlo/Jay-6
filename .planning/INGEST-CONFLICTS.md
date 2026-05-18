## Conflict Detection Report

### BLOCKERS (0)

_None. No LOCKED-vs-LOCKED contradictions, no UNKNOWN-low-confidence classifications, no ingest-vs-existing-locked conflicts (net-new mode)._

### WARNINGS (0)

_None. No PRD requirements with divergent acceptance criteria on the same scope were detected between `.research/PLAN.md` and `.research/UAT.md`. The two PRDs cover the same feature surface from different angles (PLAN = milestone specs; UAT = hand-test acceptance) and were merged into single REQ entries with cross-references, with no irreconcilable variants._

### INFO (3)

[INFO] No standalone ADRs or SPECs in ingest set
  Note: All 6 ingested docs classified as PRD (2) or DOC (4). The "Decisions" section embedded in .research/PLAN.md and convention statements in CLAUDE.md / CURRENT-STATE.md were extracted into .planning/intel/decisions.md as PROPOSED-status entries. Downstream gsd-roadmapper may promote selected items (e.g., DEC-tick-source-24-ppq, DEC-no-premature-features, DEC-deploy-cloudflare-tunnel) to formal ADRs.
  source: classifications/*.json

[INFO] Navigational cross-ref cycle: UAT.md → CURRENT-STATE.md → .research/PLAN.md → UAT.md
  Note: Three back-edges exist in the cross-ref graph among the ingest docs:
    - .research/UAT.md → CURRENT-STATE.md ("see Phase 2 hostname config")
    - CURRENT-STATE.md → .research/UAT.md ("UAT walkthrough via uat-agent")
    - CURRENT-STATE.md → .research/PLAN.md ("Full design rationale")
    - .research/PLAN.md → .research/UAT.md ("Phase 2 → UAT walkthrough")
  These are navigational "see also" pointers, not definitional inheritance. Per-doc content extraction is independent (no transitive inclusion), so synthesis is unaffected — extraction did not loop. Logged for transparency; no action required.
  source: cross_refs in CURRENT-STATE.md, .research/PLAN.md, .research/UAT.md classifications

[INFO] Auto-resolved: PRD > DOC on Phase 1 scope summary
  Note: .research/PLAN.md (PRD) defines prototype scope as M1–M8 + keyboard shortcuts (subset of M10), with M9/M10 explicitly out. CURRENT-STATE.md (DOC) and README.md (DOC) summarise this consistently; no contradictions found. Per precedence rules (ADR > SPEC > PRD > DOC), PLAN.md's scope statement is the canonical source in .planning/intel/requirements.md (REQ-out-of-scope-prototype), with DOC sources cross-referenced.
  source: .research/PLAN.md (Prototype Scope), CURRENT-STATE.md (Roadmap), README.md (What it does)
