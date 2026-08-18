---
schema_version: 1
open_count: 0
waived_count: 0
fixed_count: 2
total_count: 2
last_updated: 2026-08-18T19:45:11.518Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 03 | deviation | .planning/ROADMAP.md |  | Repaired generated Phase labels and roadmap table formatting during plan close-out | fixed |  | 2026-08-18T18:50:48.398Z | 2026-08-18T18:51:01.555Z |
| 2 | 03 | deviation | .planning/STATE.md |  | Repaired stale generated state position, phase labels, and roadmap formatting during Plan 03-04 close-out | fixed |  | 2026-08-18T19:44:49.156Z | 2026-08-18T19:45:11.518Z |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/ROADMAP.md",
    "line": null,
    "description": "Repaired generated Phase labels and roadmap table formatting during plan close-out",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-18T18:50:48.398Z",
    "resolved_at": "2026-08-18T18:51:01.555Z"
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "Repaired stale generated state position, phase labels, and roadmap formatting during Plan 03-04 close-out",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-18T19:44:49.156Z",
    "resolved_at": "2026-08-18T19:45:11.518Z"
  }
]
````
