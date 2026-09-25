# Phase 4: Read-Only Suggestion Rail - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-23 (session 1), 2026-09-25 (session 2, resumed from checkpoint)
**Phase:** 04-read-only-suggestion-rail
**Areas discussed:** Suggestion identity, Long chord sequences, Locked sketch decisions (confirm), Same key twice, Latch + echo, Validator cap, Panel memory, Chip vanishes while held

---

## Suggestion identity (session 1)

| Option | Description | Selected |
|--------|-------------|----------|
| Label-led header | Authored label leads; kind = quiet borderless metadata | ✓ |
| Equal-weight label plus kind badge | Label and kind badge side by side | |

**User's choice:** Label-led header.

## Long chord sequences (session 1)

| Option | Description | Selected |
|--------|-------------|----------|
| Single horizontal scrolling row | One row, scroll overflow | |
| Unconstrained wrapping | Natural wrap | |
| Balanced no-scroll hybrid | ≤6 per row, balanced two rows, never truncate | ✓ |

**User's choice:** Balanced no-scroll hybrid; narrower screens may split earlier.

## Locked sketch decisions (session 2)

The sketches (002 iPhone, 003 desktop/iPad) had already decided these, and commit e0ca7c4 recorded them. They were presented for confirmation only:

- Playable chips with soft echo
- iPhone strip + panel
- Desktop/iPad columns
- Max 6 per bank
- Empty bank line

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, record as-is | Carry forward unchanged | ✓ |
| Something changed | Adjust an item | |

## Same key twice

| Option | Description | Selected |
|--------|-------------|----------|
| No-op, count only | Host sees first press + last release only | |
| Retrigger | Second press restarts engine | |

**User's choice:** Free text. "Whichever is the least difficult to implement… it shouldn't behave as a bug, but how it behaves, I don't care too much."
**Notes:** Recorded as Claude's discretion with a no-hanging-note / no-stuck-latch invariant.

## Latch + echo

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, follow displayKeys | Chips mirror what pads show lit | ✓ |
| Physically held only | Echo only while a finger/key is down | |

## Validator cap

| Option | Description | Selected |
|--------|-------------|----------|
| Reject >6 | New validation issue code; fail loud | ✓ |
| Don't enforce | Convention + follow-up todo | |

**Notes:** "For now we reject, and we already have a to-do to implement more."

## Panel memory

| Option | Description | Selected |
|--------|-------------|----------|
| Remember, reset on bank | Keep page while bank unchanged; bank change → 1 of N | ✓ |
| Always 1 of N | Stateless | |

## Chip vanishes while held

| Option | Description | Selected |
|--------|-------------|----------|
| Release on vanish | Unmount → idempotent release | ✓ |
| Sound until finger lifts | Window-level pointerup tracking | |
| You decide | Simplest bug-free | |

## Claude's Discretion

- Same-key double press implementation (invariant: no bugs)
- Chip semantics/focus matching pads, component decomposition, rail state location, Escape integration

## Deferred Ideas

- More than 6 suggestions per bank (existing todo)
- Bank/style/latch visible while the iPhone panel is open (accepted trade-off)

## Process note

Advisor-mode research agents were skipped. All new gray areas were internal behaviour calls, so they were presented as inline trade-off tables instead.
