---
phase: 03-catalogue-mechanism-bootstrap
reviewed: 2026-08-18T19:50:31Z
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

**Reviewed:** 2026-08-18T19:50:31Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Narrative Findings (AI reviewer)

### Summary

The locked three-record JSON catalogue is correct, and both the focused 51-test suite and full `just ci` gate pass. The current module nevertheless exposes its post-validation trust anchors as mutable JavaScript objects, so a consumer can bypass validation after import and make the resolver return corrupted data or throw. The public validator can also throw on proxy-backed `unknown` input, and its 200-line validation routine is an ordering-sensitive maintenance hazard.

### Critical Issues

#### CR-01: Exported readonly trust anchors remain mutable at runtime

**Classification:** BLOCKER
**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:5`
**Affected lines:** `5`, `117-119`, `353-362`, `370-388`
**Issue:** `as const` and `readonly` protect only TypeScript callers at compile time. The exported `SUGGESTION_KINDS` array, `suggestionCatalogue` array, each catalogue object, and every `steps` array remain mutable JavaScript values. A JS consumer or TS consumer using a cast can append a new kind; `isSuggestionKind()` then accepts that runtime value even though `SuggestionKind` still statically excludes it. A consumer can also replace a validated step with an invalid key; the next `getSuggestionsForBank()` call throws at the canonical chord lookup. This defeats the import-time validation boundary and lets any importer corrupt all subsequent catalogue lookups.

**Fix:** Freeze both exported trust anchors, including the catalogue's nested objects and step arrays, before exposing them. Keep resolver return values as fresh mutable-at-runtime projections because mutations to those copies cannot poison shared state. Add regression tests that attempt to mutate every exported layer and then prove validation and lookup behavior remain unchanged.

```ts
export const SUGGESTION_KINDS = Object.freeze([
  'progression',
  'movement',
] as const);

function freezeSuggestion(suggestion: Suggestion): Suggestion {
  Object.freeze(suggestion.steps);
  return Object.freeze(suggestion);
}

export const suggestionCatalogue: readonly Suggestion[] = Object.freeze(
  validationResult.value.map(freezeSuggestion),
);
```

### Warnings

#### WR-01: Proxy-backed unknown input can escape the validation result contract

**Classification:** WARNING
**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:135-168`
**Issue:** The validator avoids inherited values and ordinary accessors, but `Array.isArray()`, `Object.getOwnPropertyDescriptor()`, and `Reflect.ownKeys()` can still throw for revoked proxies or proxy traps. Because the public API accepts `unknown` and returns a `ValidationResult`, malformed object input should not unexpectedly escape as an exception. The current accessor-focused tests do not cover proxies, so this failure remains invisible to the suite.

**Fix:** Either explicitly narrow and document the accepted domain to parsed JSON values, or catch reflective-operation failures and return a stable issue such as `inaccessible-value` at the closest known path. Add revoked-proxy and throwing-trap regression cases that assert the validator does not throw.

```ts
function safeOwnDataValue(record: object, key: PropertyKey): unknown {
  try {
    return dataValue(Object.getOwnPropertyDescriptor(record, key));
  } catch {
    return undefined;
  }
}
```

#### WR-02: The validator combines too many ordering-sensitive responsibilities

**Classification:** WARNING
**File:** `/Users/flo/Work/Private/Dev/Music/Jay-6/src/suggestions.ts:135-334`
**Issue:** `validateSuggestionCatalogue()` spans roughly 200 lines and handles top-level shape checks, record descriptor reads, five field rules, unexpected-key path creation, step validation, projection, and two duplicate indexes. Its diagnostic ordering is a public contract pinned by tests, so modifying one concern inside this high-branch function can silently reorder or suppress unrelated issues. This exceeds the standard review threshold for function complexity and makes future catalogue rules unnecessarily risky to change.

**Fix:** Extract an entry validator that returns one optional `ValidatedEntry` plus its entry-local issues, and a duplicate-check helper that appends cross-entry issues. Keep the outer function responsible only for source-order iteration and the explicit entry-before-duplicate ordering contract.

---

_Reviewed: 2026-08-18T19:50:31Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
