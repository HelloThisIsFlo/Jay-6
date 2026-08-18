import { banks, KEYS, labelFor } from './banks';
import type { Key } from './banks';
import suggestionsJson from './suggestions.data.json';

export const SUGGESTION_KINDS = ['progression', 'movement'] as const;
export type SuggestionKind = (typeof SUGGESTION_KINDS)[number];

export interface Suggestion {
  readonly id: string;
  readonly bankIndex: number;
  readonly label: string;
  readonly kind: SuggestionKind;
  readonly steps: readonly Key[];
}

export type CatalogueIssueCode =
  | 'top-level-array'
  | 'entry-object'
  | 'missing-field'
  | 'unexpected-field'
  | 'invalid-id'
  | 'invalid-bank-index'
  | 'invalid-label'
  | 'invalid-kind'
  | 'invalid-steps'
  | 'invalid-step'
  | 'duplicate-id'
  | 'duplicate-sequence';

export interface CatalogueIssue {
  readonly code: CatalogueIssueCode;
  readonly path: string;
  readonly value: unknown;
  readonly expected: string;
  readonly entryId?: string;
  readonly bankIndex?: number;
  readonly relatedPath?: string;
}

export type ValidationResult =
  | { readonly ok: true; readonly value: readonly Suggestion[] }
  | { readonly ok: false; readonly issues: readonly CatalogueIssue[] };

export interface ResolvedSuggestionStep {
  readonly key: Key;
  readonly chordName: string;
  readonly displayLabel: string;
}

export interface ResolvedSuggestion {
  readonly id: string;
  readonly bankIndex: number;
  readonly bankName: string;
  readonly label: string;
  readonly kind: SuggestionKind;
  readonly steps: readonly ResolvedSuggestionStep[];
}

const ENTRY_FIELDS = ['id', 'bankIndex', 'label', 'kind', 'steps'] as const;
const ENTRY_FIELD_SET = new Set<string>(ENTRY_FIELDS);
const ENTRY_FIELD_RULE = 'only id, bankIndex, label, kind, and steps';
const TEXT_RULE = 'a nonblank string without surrounding whitespace';
const BANK_INDEX_RULE = `an integer from 1 to ${banks.length}`;
const KIND_RULE = `one of: ${SUGGESTION_KINDS.join(', ')}`;
const STEPS_RULE = 'a nonempty array of canonical pad keys';
const PAD_KEY_RULE = `one of: ${KEYS.join(', ')}`;
const VISIBLE_TEXT = /[^\p{White_Space}\p{Cf}\p{Cc}]/u;
const SAFE_PATH_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

interface ValidatedEntry {
  readonly sourceIndex: number;
  readonly value: Suggestion;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAuthoredText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() === value && VISIBLE_TEXT.test(value);
}

function dataValue(descriptor: PropertyDescriptor | undefined): unknown {
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

function ownDataValue(record: object, key: PropertyKey): unknown {
  return dataValue(Object.getOwnPropertyDescriptor(record, key));
}

function escapedJsonString(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function unexpectedKeyPath(base: string, key: string | symbol, ordinal: number): string {
  if (typeof key === 'symbol') {
    const escapedSymbol = escapedJsonString(String(key)).slice(1, -1);
    return `${base}[#${ordinal}:${escapedSymbol}]`;
  }
  return SAFE_PATH_KEY.test(key)
    ? `${base}.${key}`
    : `${base}[${escapedJsonString(key)}]`;
}

function isBankIndex(value: unknown): value is number {
  return (
    typeof value === 'number'
    && Number.isInteger(value)
    && Number.isFinite(value)
    && value >= 1
    && value <= banks.length
  );
}

function isSuggestionKind(value: unknown): value is SuggestionKind {
  return typeof value === 'string' && SUGGESTION_KINDS.some((kind) => kind === value);
}

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && KEYS.some((key) => key === value);
}

function issueContext(
  entryId: unknown,
  bankIndex: unknown,
): Pick<CatalogueIssue, 'entryId' | 'bankIndex'> {
  return {
    ...(isAuthoredText(entryId) ? { entryId } : {}),
    ...(isBankIndex(bankIndex) ? { bankIndex } : {}),
  };
}

export function validateSuggestionCatalogue(input: unknown): ValidationResult {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      issues: [
        {
          code: 'top-level-array',
          path: '$',
          value: input,
          expected: 'an array of suggestion entries',
        },
      ],
    };
  }

  const issues: CatalogueIssue[] = [];
  const validEntries: ValidatedEntry[] = [];

  for (let sourceIndex = 0; sourceIndex < input.length; sourceIndex++) {
    const candidate = ownDataValue(input, String(sourceIndex));
    const entryPath = `$[${sourceIndex}]`;
    if (!isRecord(candidate)) {
      issues.push({
        code: 'entry-object',
        path: entryPath,
        value: candidate,
        expected: 'a non-null object',
      });
      continue;
    }

    const issueCountBeforeEntry = issues.length;
    const descriptors = new Map(
      ENTRY_FIELDS.map((field) => [field, Object.getOwnPropertyDescriptor(candidate, field)]),
    );
    const id = dataValue(descriptors.get('id'));
    const bankIndex = dataValue(descriptors.get('bankIndex'));
    const label = dataValue(descriptors.get('label'));
    const kind = dataValue(descriptors.get('kind'));
    const steps = dataValue(descriptors.get('steps'));
    const context = issueContext(id, bankIndex);

    for (const field of ENTRY_FIELDS) {
      if (descriptors.get(field) === undefined) {
        issues.push({
          code: 'missing-field',
          path: `${entryPath}.${field}`,
          ...context,
          value: undefined,
          expected: `required field ${field}`,
        });
      }
    }

    if (descriptors.get('id') !== undefined && !isAuthoredText(id)) {
      issues.push({
        code: 'invalid-id',
        path: `${entryPath}.id`,
        ...(isBankIndex(bankIndex) ? { bankIndex } : {}),
        value: id,
        expected: TEXT_RULE,
      });
    }

    if (descriptors.get('bankIndex') !== undefined && !isBankIndex(bankIndex)) {
      issues.push({
        code: 'invalid-bank-index',
        path: `${entryPath}.bankIndex`,
        ...(isAuthoredText(id) ? { entryId: id } : {}),
        value: bankIndex,
        expected: BANK_INDEX_RULE,
      });
    }

    if (descriptors.get('label') !== undefined && !isAuthoredText(label)) {
      issues.push({
        code: 'invalid-label',
        path: `${entryPath}.label`,
        ...context,
        value: label,
        expected: TEXT_RULE,
      });
    }

    if (descriptors.get('kind') !== undefined && !isSuggestionKind(kind)) {
      issues.push({
        code: 'invalid-kind',
        path: `${entryPath}.kind`,
        ...context,
        value: kind,
        expected: KIND_RULE,
      });
    }

    if (
      descriptors.get('steps') !== undefined
      && (!Array.isArray(steps) || steps.length === 0)
    ) {
      issues.push({
        code: 'invalid-steps',
        path: `${entryPath}.steps`,
        ...context,
        value: steps,
        expected: STEPS_RULE,
      });
    }

    const ownKeys = Reflect.ownKeys(candidate);
    for (const [ordinal, field] of ownKeys.entries()) {
      if (typeof field === 'symbol' || !ENTRY_FIELD_SET.has(field)) {
        issues.push({
          code: 'unexpected-field',
          path: unexpectedKeyPath(entryPath, field, ordinal),
          ...context,
          value: ownDataValue(candidate, field),
          expected: ENTRY_FIELD_RULE,
        });
      }
    }

    const validatedSteps: Key[] = [];
    let stepsAreValid = false;
    if (Array.isArray(steps) && steps.length > 0) {
      stepsAreValid = true;
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        const step = ownDataValue(steps, String(stepIndex));
        if (isKey(step)) {
          validatedSteps.push(step);
        } else {
          stepsAreValid = false;
          issues.push({
            code: 'invalid-step',
            path: `${entryPath}.steps[${stepIndex}]`,
            ...context,
            value: step,
            expected: PAD_KEY_RULE,
          });
        }
      }
    }

    if (
      issues.length === issueCountBeforeEntry
      && isAuthoredText(id)
      && isBankIndex(bankIndex)
      && isAuthoredText(label)
      && isSuggestionKind(kind)
      && stepsAreValid
    ) {
      validEntries.push({
        sourceIndex,
        value: { id, bankIndex, label, kind, steps: validatedSteps },
      });
    }
  }

  const firstIdPath = new Map<string, string>();
  const firstSequencePath = new Map<string, string>();

  for (const entry of validEntries) {
    const { sourceIndex, value } = entry;
    const idPath = `$[${sourceIndex}].id`;
    const stepsPath = `$[${sourceIndex}].steps`;
    const relatedIdPath = firstIdPath.get(value.id);
    const sequenceSignature = JSON.stringify([value.bankIndex, value.steps]);
    const relatedSequencePath = firstSequencePath.get(sequenceSignature);

    if (relatedIdPath) {
      issues.push({
        code: 'duplicate-id',
        path: idPath,
        entryId: value.id,
        bankIndex: value.bankIndex,
        value: value.id,
        expected: 'a globally unique suggestion id',
        relatedPath: relatedIdPath,
      });
    } else {
      firstIdPath.set(value.id, idPath);
    }

    if (relatedSequencePath) {
      issues.push({
        code: 'duplicate-sequence',
        path: stepsPath,
        entryId: value.id,
        bankIndex: value.bankIndex,
        value: [...value.steps],
        expected: `a unique ordered step sequence within bank ${value.bankIndex}`,
        relatedPath: relatedSequencePath,
      });
    } else {
      firstSequencePath.set(sequenceSignature, stepsPath);
    }
  }

  return issues.length > 0
    ? { ok: false, issues }
    : { ok: true, value: validEntries.map((entry) => entry.value) };
}

function printableValue(value: unknown): string {
  const serialized = JSON.stringify(value);
  return serialized === undefined ? String(value) : serialized;
}

function formatCatalogueIssue(issue: CatalogueIssue): string {
  return [
    `[${issue.code}]`,
    `path=${issue.path}`,
    ...(issue.entryId === undefined ? [] : [`entryId=${printableValue(issue.entryId)}`]),
    ...(issue.bankIndex === undefined ? [] : [`bankIndex=${issue.bankIndex}`]),
    `value=${printableValue(issue.value)}`,
    `expected=${issue.expected}`,
    ...(issue.relatedPath === undefined ? [] : [`relatedPath=${issue.relatedPath}`]),
  ].join(' ');
}

const importedSuggestions: unknown = suggestionsJson;
const validationResult = validateSuggestionCatalogue(importedSuggestions);

if (!validationResult.ok) {
  throw new Error(
    `Invalid suggestion catalogue:\n${validationResult.issues.map(formatCatalogueIssue).join('\n')}`,
  );
}

export const suggestionCatalogue: readonly Suggestion[] = validationResult.value;

export function getSuggestionsForBank(bankIndex: number): readonly ResolvedSuggestion[] {
  if (!isBankIndex(bankIndex)) {
    throw new RangeError(BANK_INDEX_RULE);
  }

  const bank = banks[bankIndex - 1]!;
  return suggestionCatalogue
    .filter((suggestion) => suggestion.bankIndex === bankIndex)
    .map((suggestion) => ({
      id: suggestion.id,
      bankIndex: suggestion.bankIndex,
      bankName: bank.name,
      label: suggestion.label,
      kind: suggestion.kind,
      steps: suggestion.steps.map((key) => {
        const chord = bank.chords.find((candidate) => candidate.key === key);
        if (!chord) {
          throw new Error(`Canonical bank ${bankIndex} is missing chord ${key}`);
        }
        return {
          key,
          chordName: chord.name,
          displayLabel: labelFor(bank, chord),
        };
      }),
    }));
}
