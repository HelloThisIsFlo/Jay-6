---
phase: 03-catalogue-mechanism-bootstrap
reviewed: 2026-08-18T18:03:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/suggestions.data.json
  - src/suggestions.ts
  - test/suggestions.test.ts
findings:
  critical: 1
  warning: 2
  info: 0
  total: 3
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-18T18:03:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Narrative Findings (AI reviewer)

### Summary

The production catalogue is correct and both the focused 41-test suite and full `just ci` gate pass. Adversarial runtime probes still found a fail-open validation path: sparse arrays bypass iteration and can be returned as trusted typed data. Exact-field enforcement also misses non-enumerable and symbol properties, and the tests do not prove the promised fresh-projection boundary.

### Critical Issues

#### CR-01: [BLOCKER] Sparse arrays bypass catalogue and step validation

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:127-253`
**Issue:** `Array.prototype.forEach()` and `every()` skip empty slots. A top-level `new Array(1)` therefore validates as an empty catalogue, silently dropping its missing entry. More seriously, a valid-looking entry whose `steps` is sparse validates with `ok: true`; spreading that array at line 250 materializes the hole as `undefined`, so the returned `Suggestion` violates its `readonly Key[]` type. This breaks the unknown-to-validated trust boundary and can propagate invalid chord keys despite successful validation.

**Fix:** Iterate arrays through their iterators, which visit holes as `undefined`, and use the same dense traversal for the final validity decision. Add regression tests for sparse top-level and `steps` arrays.

```ts
for (const [sourceIndex, candidate] of input.entries()) {
  // Existing entry validation; a hole arrives here as `undefined`.
}

for (const [stepIndex, step] of steps.entries()) {
  if (!isKey(step)) {
    // Emit invalid-step at this index.
  }
}

const allStepsValid = [...steps].every(isKey);
```

### Warnings

#### WR-01: [WARNING] Exact-field validation ignores symbol and non-enumerable properties

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:212-222`
**Issue:** `Object.keys(candidate)` sees only enumerable string keys. The exported `unknown` validator accepts an otherwise valid entry with an extra symbol property or a non-enumerable own property, despite the contract requiring exactly the five allowed fields. The accepted projection silently discards those unvalidated properties.

**Fix:** Inspect all own keys and reject non-string keys as well as disallowed string keys.

```ts
for (const field of Reflect.ownKeys(candidate)) {
  if (typeof field !== 'string' || !ENTRY_FIELD_SET.has(field)) {
    issues.push({
      code: 'unexpected-field',
      path: `${entryPath}[${JSON.stringify(String(field))}]`,
      ...context,
      value: candidate[field],
      expected: ENTRY_FIELD_RULE,
    });
  }
}
```

#### WR-02: [WARNING] Tests do not enforce fresh projection guarantees

**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/test/suggestions.test.ts:48-70`
**Issue:** The tests assert deep equality and that validation does not mutate its input, but never assert reference separation. An implementation returning the caller's array, records, or nested `steps` directly would pass. Resolver tests likewise do not call twice and compare identities, so a cached shared mutable result would pass despite the plan requiring new resolved objects. This leaves the boundary's anti-aliasing guarantee unprotected against regression.

**Fix:** Assert distinct identities at every mutable layer and across resolver calls.

```ts
const result = validateSuggestionCatalogue(input);
expect(result.ok).toBe(true);
if (result.ok) {
  expect(result.value).not.toBe(input);
  expect(result.value[0]).not.toBe(input[0]);
  expect(result.value[0]?.steps).not.toBe(input[0]?.steps);
}

const first = getSuggestionsForBank(1);
const second = getSuggestionsForBank(1);
expect(second).not.toBe(first);
expect(second[0]).not.toBe(first[0]);
expect(second[0]?.steps).not.toBe(first[0]?.steps);
```

---

_Reviewed: 2026-08-18T18:03:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
