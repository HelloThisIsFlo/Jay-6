# Stack Research

**Domain:** Bank-aware chord-progression suggestions in an existing static Svelte instrument
**Researched:** 2026-07-29
**Confidence:** MEDIUM

## 🎯 Recommendation

**Add no packages.**

- Store progression content in one imported JSON file.
- Add small TypeScript modules for:
  - catalogue types
  - one-time validation
  - deterministic bank filtering
  - pad-key-to-chord resolution
- Mirror the existing `banks.data.json` → `banks.data.ts` adapter pattern rather than inventing a new loading mechanism.
- Render the approved chip rail with existing Svelte 5 primitives.
- Validate content and resolution with existing Vitest.

This keeps the catalogue readable by an agent, preserves the static SPA, and prevents suggestion content from becoming executable playback logic.

## 🧱 Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| JSON | Native Vite 6 import | Progression catalogue | Plain, diffable, agent-editable, and already familiar in this repository. Vite 6 imports JSON without a plugin. |
| TypeScript | Existing `^5.6.0` | Catalogue boundary and pure resolver | Literal unions can model the 12 pad keys; explicit guards can validate semantic constraints that inferred JSON types cannot prove. |
| Svelte | Existing `^5.0.0` | Chord-chip rail | `$derived` handles side-effect-free bank resolution; keyed `{#each}` blocks handle stable progression rows and chips. |
| Vitest | Existing `^2.1.0` | Catalogue and resolver tests | Fits the project's existing data-and-math test boundary. No component test framework is needed. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | N/A | No runtime or authoring dependency | The feature is static data plus deterministic lookup; the platform and current stack already cover it. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `svelte-check` | Type-check TypeScript and Svelte integration | Keep the existing `just check` / `npm run check` gate. Vite transpiles TypeScript but does not type-check it. |
| Vitest | Validate catalogue integrity and pure resolution | Test unique IDs, valid bank indices, valid pad keys, stable source order, and resolved chord labels. |
| Browser smoke test | Verify responsive rail presentation | Retain the project's existing UI-testing boundary; verify desktop, iPad-sized, and iPhone-landscape layouts manually. |

## 📚 Catalogue Contract

Recommended content shape:

```yaml
progressions:
  - id: pop-warm-lift
    name: Warm lift
    feel: uplifting
    lengthBars: 4
    bankIndices: [1]
    steps: [C, A, F, G]
```

- `bankIndices`
  - Uses the existing canonical numeric bank identity.
  - Allows one curated progression to apply to several compatible banks without duplication.
- `steps`
  - Stores only ordered pad keys from the existing 12-key vocabulary.
  - Reuses the existing `Key` domain type from `src/banks.ts`.
  - Never stores MIDI notes or copied chord names.
- `name`, `feel`, `lengthBars`
  - Display metadata only.
  - Must not acquire tempo, duration, gate, trigger, transport, or playback fields.
- Source order
  - Is the deterministic suggestion order.
  - Avoid scores, randomness, or implicit ranking rules in the first milestone.

The resolver should:

1. Validate the imported catalogue once.
2. Filter entries whose `bankIndices` include the selected bank index.
3. Preserve catalogue order.
4. Resolve every step by matching its pad key against the selected bank's canonical `chords`.
5. Return view data containing both pad key and current-bank chord name.

`src/banks.data.json` remains untouched and canonical. The progression catalogue references it; it does not duplicate or override it.

## 📦 Installation

No installation required.

```bash
# Keep the existing dependency graph unchanged.
npm run check
npm test
```

## ⚖️ Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Static JSON catalogue | TypeScript `as const satisfies` data module | Use only if compile-time literal checking is judged more important than strict content/code separation. It is less plain for non-code editing. |
| Small handwritten validator | JSON Schema + Ajv | Use if catalogues become user-supplied, remotely loaded, or maintained by external tooling that needs a formal interchange contract. |
| Bank indices + pad keys | Roman numeral formulas + music-theory resolution | Use for generated/transposable harmony across arbitrary user-defined keys. Jay-6 instead needs curated compatibility with 100 fixed factory voicing banks. |
| Stable source ordering | Ranking/scoring engine | Use after real usage produces meaningful ranking signals or user preferences. Neither exists in this milestone. |
| Existing scoped CSS | Component/UI library | Use only if the whole product adopts a shared third-party design system. The rail already has a validated project-specific visual language. |

## 🚫 What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Music-theory libraries such as Tonal | They solve chord construction, parsing, and transposition; this milestone resolves known pad keys against fixed canonical bank data. They add an unnecessary second interpretation of harmony. | Curated bank applicability plus direct pad-key lookup. |
| Sequencer or timeline libraries | Their event, duration, transport, and playback abstractions conflict with the explicit suggestion-only scope. | Ordered display steps with inert metadata. |
| State machines or external stores | The rail has a small derived view over the existing selected-bank state. A second state model creates synchronization work. | Existing `$state` plus side-effect-free `$derived`. |
| YAML/JSON5 runtime parsers | They add dependencies and build behavior solely for comments or looser syntax. | Standard JSON with clear field names and tests. |
| Runtime content fetching or a backend | Persistence, accounts, and remote authoring are explicitly out of scope; fetching weakens offline/static determinism. | Bundle the catalogue with the SPA. |
| Random suggestions | Makes behavior harder to test and prevents users from building spatial/musical familiarity. | Stable catalogue order per bank. |
| Duplicated chord labels or MIDI notes in catalogue entries | They drift when canonical bank voicings or labels are corrected. | Resolve names and notes only from `banks.data.json`. |

## 🧪 Validation Boundary

TypeScript's JSON inference checks the imported file's static shape, but it does not establish cross-file invariants. A small validator plus Vitest should enforce:

- progression IDs are unique and non-empty
- names and feel labels are non-empty
- `lengthBars` is a positive integer used only for display
- every `bankIndices` item matches a canonical bank
- every step is one of `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`
- every referenced pad key resolves exactly once in every applicable bank
- every target bank has at least one useful suggestion once the initial catalogue coverage target is chosen
- resolver output preserves catalogue order
- changing the active bank changes chord labels without mutating catalogue data

Do not put validation inside Svelte components. Keep it in pure TypeScript so it remains independently testable.

## 🔌 Integration Points

| Existing area | Addition | Boundary |
|---------------|----------|----------|
| `src/banks.data.json` | Read-only input to resolver | Never edit or enrich the canonical extraction for suggestion metadata. |
| Existing data-adapter pattern | Add a progression JSON import plus typed TypeScript adapter | Keep raw content separate from validated domain/view data, as `banks.data.ts` already does. |
| `src/state.svelte.ts` | Selected suggestion UI state only if interaction needs it | Do not add playback position or automated step state. |
| Svelte performance surface | Progression rail below pads | Use keyed progression IDs and chip keys; keep orange reserved for currently sounding pads unless a later requirement defines interactive rail state precisely. |
| Pure TypeScript data layer | Catalogue loader, validator, resolver | No MIDI, host, `tickSource`, timers, or Svelte imports. |
| Vitest suite | Integrity and deterministic resolution tests | Keep component mounting out of scope. |

## 🔢 Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Vite `^6.0.0` | Static JSON catalogue | Vite 6 officially supports direct JSON imports; no loader plugin is needed. |
| TypeScript `^5.6.0` | Vite 6 + imported JSON | Confirm the inherited tsconfig keeps `resolveJsonModule` enabled; the project's existing bank JSON import already demonstrates this path works. |
| Svelte `^5.0.0` | Derived resolver output | `$derived` and keyed `{#each}` are sufficient; no store library is required. |
| Vitest `^2.1.0` | Pure catalogue/resolver modules | No DOM environment is needed for data integrity tests. |

Installed resolutions observed during research were Vite `6.4.2`, Svelte `5.55.7`, TypeScript `5.9.3`, and Vitest `2.1.9`. The milestone should not widen or upgrade package ranges merely to build this feature.

## 📎 Sources

- [Vite 6 Features](https://v6.vite.dev/guide/features)
  - Direct JSON imports and Vite's transpile-only TypeScript behavior.
  - Confidence: MEDIUM.
- [Svelte `{#each}` documentation](https://svelte.dev/docs/svelte/each)
  - Keyed list identity using stable string or number keys.
  - Confidence: MEDIUM.
- [Svelte `$derived` documentation](https://svelte.dev/docs/svelte/%24derived)
  - Side-effect-free state derived from reactive dependencies.
  - Confidence: MEDIUM.
- [TypeScript `resolveJsonModule`](https://www.typescriptlang.org/tsconfig/resolveJsonModule.html)
  - Static JSON imports and inferred types.
  - Confidence: MEDIUM.
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
  - Type guards for values crossing an untrusted or weakly typed boundary.
  - Confidence: MEDIUM.
- [TypeScript `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
  - Compile-time alternative considered for a TypeScript-authored catalogue.
  - Confidence: MEDIUM.
- `.planning/PROJECT.md`
  - Locked milestone scope, architecture constraints, and test boundaries.
  - Confidence: HIGH.
- `.codex/skills/sketch-findings-jay-6/references/progressions.md`
  - Approved chord-chip rail and proposed display metadata.
  - Confidence: HIGH.
- `src/banks.data.json`
  - Canonical shape: 100 indexed banks, each with the same 12 pad keys and bank-specific chord labels/notes.
  - Confidence: HIGH.

---
*Stack research for: Jay-6 v2.0 Musical Companion*
*Researched: 2026-07-29*
