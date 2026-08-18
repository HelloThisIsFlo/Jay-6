---
phase: 03-catalogue-mechanism-bootstrap
reviewed: 2026-08-18T18:55:49Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/suggestions.data.json
  - src/suggestions.ts
  - test/suggestions.test.ts
findings:
  critical: 1
  warning: 3
  info: 0
  total: 4
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-18T18:55:49Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

The locked three-record catalogue is correct, and both the focused 46-test suite and full `just ci` gate pass. The sparse-array repair is still fail-open when a missing slot has an inherited value: a polluted array prototype can supply a complete catalogue entry or pad key that is then certified as trusted data. The validator also executes accessors despite its pure-data contract, accepts visually blank format-only text, and emits ambiguous paths for unusual unexpected keys.

## Critical Issues

### CR-01: [BLOCKER] Inherited array elements bypass sparse-slot validation

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:128-232`
**Issue:** Both indexed loops read slots with ordinary property access. JavaScript therefore resolves a hole through the prototype chain. A one-slot sparse catalogue with an inherited valid record returns `ok: true`; a sparse `steps` array with an inherited canonical key also returns `ok: true` and projects that inherited key into `readonly Key[]`. This reopens the trust-boundary failure under prototype pollution, even though clean-prototype holes are covered by tests.

**Fix:** Read only own data-property descriptors for array slots. Treat a missing or accessor slot as `undefined`, then let the existing entry/key checks reject it. Add regressions using sparse arrays with custom prototypes.

```ts
function ownArraySlot(array: readonly unknown[], index: number): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(array, String(index));
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

const candidate = ownArraySlot(input, sourceIndex);
const step = ownArraySlot(steps, stepIndex);
```

## Warnings

### WR-01: [WARNING] Validation executes accessors and reports inherited field context

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:141-221`
**Issue:** Direct reads of `candidate.id`, the other allowed fields, and unexpected fields execute getters supplied by an `unknown` input. A throwing getter escapes `validateSuggestionCatalogue()` instead of returning a `ValidationResult`; a side-effecting getter violates D-06 purity. Inherited `id` and `bankIndex` values are also read and attached to missing-field diagnostics even though the exact-field contract requires own properties.

**Fix:** Inspect own property descriptors once. Use only descriptor `value` fields, reject accessors through the existing field-specific issue codes, and avoid `Reflect.get()` when reporting unexpected accessors.

```ts
function ownDataValue(record: object, field: PropertyKey): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(record, field);
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

const id = ownDataValue(candidate, 'id');
const bankIndex = ownDataValue(candidate, 'bankIndex');
```

### WR-02: [WARNING] Format-only Unicode strings pass the blank-text rule

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:77-79`
**Issue:** `trim()` does not remove Unicode format characters such as U+200B ZERO WIDTH SPACE. Consequently, an ID or label containing only `\u200B` validates successfully even though it renders blank, contradicting the requirement that blank labels fail validation. The current tests cover ordinary whitespace and valid Unicode text but not invisible format/control-only strings.

**Fix:** Require at least one non-whitespace, non-format, non-control code point while continuing to preserve authored Unicode verbatim. Add ID and label regressions for zero-width/control-only values.

```ts
const VISIBLE_TEXT = /[^\p{White_Space}\p{Cf}\p{Cc}]/u;

function isAuthoredText(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim() === value
    && VISIBLE_TEXT.test(value);
}
```

### WR-03: [WARNING] Unexpected-field paths are ambiguous and can contain raw line breaks

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:213-223`
**Issue:** Unexpected string keys are appended with raw dot notation, so a key such as `bad\n[duplicate-id]` injects a new diagnostic line and keys containing dots or brackets do not have an unambiguous JSONPath-like location. Multiple symbols with the same description also produce identical paths such as `$[0][Symbol(hidden)]`. This weakens the promised machine-stable, actionable diagnostics precisely for malformed fields.

**Fix:** Use dot notation only for safe identifier keys, JSON-quoted bracket notation for all other strings, and include the stable own-key ordinal for symbols. Add regressions for punctuation, newlines, and two same-description symbols.

```ts
function ownKeyPath(base: string, key: PropertyKey, ordinal: number): string {
  if (typeof key === 'symbol') return `${base}[#${ordinal}:${String(key)}]`;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${base}.${key}`
    : `${base}[${JSON.stringify(key)}]`;
}
```

---

_Reviewed: 2026-08-18T18:55:49Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
