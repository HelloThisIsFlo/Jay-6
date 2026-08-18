import { describe, expect, it } from 'vitest';
import {
  getSuggestionsForBank,
  SUGGESTION_KINDS,
  suggestionCatalogue,
  validateSuggestionCatalogue,
} from '../src/suggestions';

const ENTRY_FIELDS = ['id', 'bankIndex', 'label', 'kind', 'steps'];
const TEXT_RULE = 'a nonblank string without surrounding whitespace';
const PAD_KEY_RULE = 'one of: C, C#, D, D#, E, F, F#, G, G#, A, A#, B';

function validEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'fixture-one',
    bankIndex: 1,
    label: 'Fixture one',
    kind: 'progression',
    steps: ['C', 'D', 'E'],
    ...overrides,
  };
}

const BOOTSTRAP_CATALOGUE = [
  {
    id: 'pop-homeward',
    bankIndex: 1,
    label: 'Homeward',
    kind: 'progression',
    steps: ['C', 'A', 'B', 'C'],
  },
  {
    id: 'pop-step-up',
    bankIndex: 1,
    label: 'Step up',
    kind: 'progression',
    steps: ['C', 'D', 'F', 'C'],
  },
  {
    id: 'oct-stack-rise-fall',
    bankIndex: 14,
    label: 'Rise and fall',
    kind: 'movement',
    steps: ['C', 'D', 'E', 'D'],
  },
];

describe('suggestion catalogue validation', () => {
  it('accepts both kinds and preserves authored strings, ordering, and repeated steps', () => {
    const input = [
      validEntry({
        id: 'unicode-sharps',
        label: 'Élan ♯ majeur',
        kind: 'progression',
        steps: ['C#', 'C#', 'D#'],
      }),
      validEntry({
        id: 'movement-example',
        bankIndex: 14,
        label: 'Rise and fall',
        kind: 'movement',
        steps: ['E', 'D', 'E'],
      }),
    ];

    const result = validateSuggestionCatalogue(input);

    expect(SUGGESTION_KINDS).toEqual(['progression', 'movement']);
    expect(result).toEqual({
      ok: true,
      value: input,
    });
    if (!result.ok) {
      throw new Error('expected valid catalogue');
    }
    expect(result.value).not.toBe(input);
    expect(result.value[0]).not.toBe(input[0]);
    expect(result.value[0]!.steps).not.toBe(input[0]!.steps);
  });

  it('accepts an empty catalogue but rejects an entry with empty steps', () => {
    expect(validateSuggestionCatalogue([])).toEqual({ ok: true, value: [] });
    expect(validateSuggestionCatalogue([validEntry({ steps: [] })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-steps',
          path: '$[0].steps',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: [],
          expected: 'a nonempty array of canonical pad keys',
        },
      ],
    });
  });

  it.each([null, {}, 'catalogue', 42])(
    'rejects non-array top-level input %j',
    (input) => {
      expect(validateSuggestionCatalogue(input)).toEqual({
        ok: false,
        issues: [
          {
            code: 'top-level-array',
            path: '$',
            value: input,
            expected: 'an array of suggestion entries',
          },
        ],
      });
    },
  );

  it('rejects primitive, null, and array entries in source order', () => {
    const input = [null, 'entry', 7, []];

    expect(validateSuggestionCatalogue(input)).toEqual({
      ok: false,
      issues: input.map((value, index) => ({
        code: 'entry-object',
        path: `$[${index}]`,
        value,
        expected: 'a non-null object',
      })),
    });
  });

  it('rejects a sparse top-level catalogue slot', () => {
    const input = new Array(1);

    expect(validateSuggestionCatalogue(input)).toEqual({
      ok: false,
      issues: [
        {
          code: 'entry-object',
          path: '$[0]',
          value: undefined,
          expected: 'a non-null object',
        },
      ],
    });
  });

  it('rejects inherited sparse slots instead of projecting prototype values', () => {
    const inheritedCatalogue = new Array(1);
    Object.setPrototypeOf(inheritedCatalogue, { 0: validEntry() });

    const inheritedSteps = ['C', , 'E'];
    Object.setPrototypeOf(inheritedSteps, { 1: 'D' });

    expect({
      catalogue: validateSuggestionCatalogue(inheritedCatalogue),
      steps: validateSuggestionCatalogue([validEntry({ steps: inheritedSteps })]),
    }).toEqual({
      catalogue: {
        ok: false,
        issues: [
          {
            code: 'entry-object',
            path: '$[0]',
            value: undefined,
            expected: 'a non-null object',
          },
        ],
      },
      steps: {
        ok: false,
        issues: [
          {
            code: 'invalid-step',
            path: '$[0].steps[1]',
            entryId: 'fixture-one',
            bankIndex: 1,
            value: undefined,
            expected: PAD_KEY_RULE,
          },
        ],
      },
    });
  });

  it('rejects a top-level accessor slot without invoking its getter', () => {
    let getterCalls = 0;
    let result: ReturnType<typeof validateSuggestionCatalogue> | undefined;
    const input = new Array(1);
    Object.defineProperty(input, '0', {
      get() {
        getterCalls += 1;
        throw new Error('top-level getter executed');
      },
    });

    expect(() => {
      result = validateSuggestionCatalogue(input);
    }).not.toThrow();
    expect(result).toEqual({
      ok: false,
      issues: [
        {
          code: 'entry-object',
          path: '$[0]',
          value: undefined,
          expected: 'a non-null object',
        },
      ],
    });
    expect(getterCalls).toBe(0);
  });

  it('rejects a steps accessor slot without invoking its getter', () => {
    let getterCalls = 0;
    let result: ReturnType<typeof validateSuggestionCatalogue> | undefined;
    const steps = ['C', , 'E'];
    Object.defineProperty(steps, '1', {
      get() {
        getterCalls += 1;
        throw new Error('steps getter executed');
      },
    });

    expect(() => {
      result = validateSuggestionCatalogue([validEntry({ steps })]);
    }).not.toThrow();
    expect(result).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-step',
          path: '$[0].steps[1]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: PAD_KEY_RULE,
        },
      ],
    });
    expect(getterCalls).toBe(0);
  });

  it('reports missing fields in fixed field order before unexpected fields', () => {
    const input = [{ surprise: 'nope' }];

    expect(validateSuggestionCatalogue(input)).toEqual({
      ok: false,
      issues: [
        ...ENTRY_FIELDS.map((field) => ({
          code: 'missing-field',
          path: `$[0].${field}`,
          value: undefined,
          expected: `required field ${field}`,
        })),
        {
          code: 'unexpected-field',
          path: '$[0].surprise',
          value: 'nope',
          expected: 'only id, bankIndex, label, kind, and steps',
        },
      ],
    });
  });

  it.each([
    ['id', '', 'invalid-id', 'a nonblank string without surrounding whitespace'],
    ['id', '  ', 'invalid-id', 'a nonblank string without surrounding whitespace'],
    ['id', ' padded', 'invalid-id', 'a nonblank string without surrounding whitespace'],
    ['label', '', 'invalid-label', 'a nonblank string without surrounding whitespace'],
    ['label', '\t', 'invalid-label', 'a nonblank string without surrounding whitespace'],
    ['label', 'padded ', 'invalid-label', 'a nonblank string without surrounding whitespace'],
  ])('rejects invalid %s value %j without normalization', (field, value, code, expected) => {
    const input = [validEntry({ [field]: value })];
    const issue = {
      code,
      path: `$[0].${field}`,
      value,
      expected,
      ...(field === 'id' ? {} : { entryId: 'fixture-one' }),
      bankIndex: 1,
    };

    expect(validateSuggestionCatalogue(input)).toEqual({ ok: false, issues: [issue] });
  });

  it('rejects inherited and accessor record fields without invoking getters', () => {
    const inheritedId = validEntry();
    delete inheritedId.id;
    Object.setPrototypeOf(inheritedId, { id: 'prototype-id' });

    const accessorCases = [
      {
        field: 'id',
        issue: {
          code: 'invalid-id',
          path: '$[0].id',
          bankIndex: 1,
          value: undefined,
          expected: TEXT_RULE,
        },
      },
      {
        field: 'bankIndex',
        issue: {
          code: 'invalid-bank-index',
          path: '$[0].bankIndex',
          entryId: 'fixture-one',
          value: undefined,
          expected: 'an integer from 1 to 100',
        },
      },
      {
        field: 'label',
        issue: {
          code: 'invalid-label',
          path: '$[0].label',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: TEXT_RULE,
        },
      },
      {
        field: 'kind',
        issue: {
          code: 'invalid-kind',
          path: '$[0].kind',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: 'one of: progression, movement',
        },
      },
      {
        field: 'steps',
        issue: {
          code: 'invalid-steps',
          path: '$[0].steps',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: 'a nonempty array of canonical pad keys',
        },
      },
      {
        field: 'surprise',
        issue: {
          code: 'unexpected-field',
          path: '$[0].surprise',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: 'only id, bankIndex, label, kind, and steps',
        },
      },
    ];
    let getterCalls = 0;
    const captures = accessorCases.map(({ field }) => {
      const input = validEntry();
      Object.defineProperty(input, field, {
        get() {
          getterCalls += 1;
          throw new Error(`${field} getter executed`);
        },
        enumerable: true,
      });
      try {
        return { result: validateSuggestionCatalogue([input]), error: undefined };
      } catch (error) {
        return { result: undefined, error };
      }
    });

    expect(captures.map(({ error }) => error), 'record validation does not throw').toEqual(
      accessorCases.map(() => undefined),
    );
    expect(getterCalls).toBe(0);
    expect(validateSuggestionCatalogue([inheritedId])).toEqual({
      ok: false,
      issues: [
        {
          code: 'missing-field',
          path: '$[0].id',
          bankIndex: 1,
          value: undefined,
          expected: 'required field id',
        },
      ],
    });
    expect(captures.map(({ result }) => result)).toEqual(
      accessorCases.map(({ issue }) => ({ ok: false, issues: [issue] })),
    );
  });

  it('rejects format and control only ids and labels', () => {
    const invisibleCases = [
      ['id', '\u200B'],
      ['id', '\u0000'],
      ['id', '\t\u200B\u0000'],
      ['label', '\u200B'],
      ['label', '\u0000'],
      ['label', '\t\u200B\u0000'],
    ] as const;

    expect(
      invisibleCases.map(([field, value]) => validateSuggestionCatalogue([
        validEntry({ [field]: value }),
      ])),
    ).toEqual(
      invisibleCases.map(([field, value]) => ({
        ok: false,
        issues: [
          {
            code: field === 'id' ? 'invalid-id' : 'invalid-label',
            path: `$[0].${field}`,
            ...(field === 'label' ? { entryId: 'fixture-one' } : {}),
            bankIndex: 1,
            value,
            expected: TEXT_RULE,
          },
        ],
      })),
    );

    const visibleLabel = 'É\u200Blan';
    const visibleInput = [validEntry({ label: visibleLabel })];
    const visibleResult = validateSuggestionCatalogue(visibleInput);
    expect(visibleResult).toEqual({ ok: true, value: visibleInput });
    if (!visibleResult.ok) {
      throw new Error('expected visible Unicode label to validate');
    }
    expect(visibleResult.value[0]!.label).toBe(visibleLabel);
  });

  it.each([0, 101, 1.5, '1'])('rejects invalid bankIndex %j', (bankIndex) => {
    expect(validateSuggestionCatalogue([validEntry({ bankIndex })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-bank-index',
          path: '$[0].bankIndex',
          entryId: 'fixture-one',
          value: bankIndex,
          expected: 'an integer from 1 to 100',
        },
      ],
    });
  });

  it.each(['', 'progressions', 'Movement'])('rejects unsupported kind %j', (kind) => {
    expect(validateSuggestionCatalogue([validEntry({ kind })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-kind',
          path: '$[0].kind',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: kind,
          expected: 'one of: progression, movement',
        },
      ],
    });
  });

  it.each([null, 'C,D', {}])('rejects non-array steps %j', (steps) => {
    expect(validateSuggestionCatalogue([validEntry({ steps })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-steps',
          path: '$[0].steps',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: steps,
          expected: 'a nonempty array of canonical pad keys',
        },
      ],
    });
  });

  it('rejects sparse steps at each physical slot', () => {
    const steps = ['C', , 'E'];

    expect(validateSuggestionCatalogue([validEntry({ steps })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-step',
          path: '$[0].steps[1]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: undefined,
          expected: PAD_KEY_RULE,
        },
      ],
    });
  });

  it('rejects a non-enumerable unexpected own field', () => {
    const input = validEntry();
    Object.defineProperty(input, 'hidden', { value: 'extra', enumerable: false });

    expect(validateSuggestionCatalogue([input])).toEqual({
      ok: false,
      issues: [
        {
          code: 'unexpected-field',
          path: '$[0].hidden',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 'extra',
          expected: 'only id, bankIndex, label, kind, and steps',
        },
      ],
    });
  });

  it('encodes unsafe string and same-description symbol paths unambiguously', () => {
    const input = validEntry();
    const extras = [
      ['safeExtra', 'safe'],
      ['with.dot', 'dot'],
      ['with[brackets]', 'brackets'],
      ['with"quote', 'quote'],
      ['with\nnewline', 'newline'],
      ['with\u2028separator', 'line-separator'],
      ['with\u2029separator', 'paragraph-separator'],
    ] as const;
    for (const [key, value] of extras) {
      Object.defineProperty(input, key, { value, enumerable: true });
    }
    const firstHidden = Symbol('hidden\u2028\u2029');
    const secondHidden = Symbol('hidden\u2028\u2029');
    Object.defineProperty(input, firstHidden, { value: 'first symbol', enumerable: true });
    Object.defineProperty(input, secondHidden, { value: 'second symbol', enumerable: true });

    const expectedPaths = [
      '$[0].safeExtra',
      '$[0]["with.dot"]',
      '$[0]["with[brackets]"]',
      '$[0]["with\\"quote"]',
      '$[0]["with\\nnewline"]',
      '$[0]["with\\u2028separator"]',
      '$[0]["with\\u2029separator"]',
      '$[0][#12:Symbol(hidden\\u2028\\u2029)]',
      '$[0][#13:Symbol(hidden\\u2028\\u2029)]',
    ];
    const result = validateSuggestionCatalogue([input]);

    expect(result).toEqual({
      ok: false,
      issues: expectedPaths.map((path, index) => ({
          code: 'unexpected-field',
          path,
          entryId: 'fixture-one',
          bankIndex: 1,
          value: [...extras.map(([, value]) => value), 'first symbol', 'second symbol'][index],
          expected: 'only id, bankIndex, label, kind, and steps',
      })),
    });
    if (result.ok) {
      throw new Error('expected unexpected fields to fail validation');
    }
    expect(result.issues.map(({ path }) => path)).toEqual(expectedPaths);
    expect(result.issues.every(({ path }) => !/[\r\n\u2028\u2029]/u.test(path))).toBe(true);
  });

  it('reports independent field issues before unexpected fields and step issues', () => {
    const input = [
      validEntry({
        id: ' ',
        bankIndex: 0,
        label: ' padded',
        kind: 'sequence',
        steps: ['c'],
        surprise: true,
      }),
    ];

    expect(validateSuggestionCatalogue(input)).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-id',
          path: '$[0].id',
          value: ' ',
          expected: 'a nonblank string without surrounding whitespace',
        },
        {
          code: 'invalid-bank-index',
          path: '$[0].bankIndex',
          value: 0,
          expected: 'an integer from 1 to 100',
        },
        {
          code: 'invalid-label',
          path: '$[0].label',
          value: ' padded',
          expected: 'a nonblank string without surrounding whitespace',
        },
        {
          code: 'invalid-kind',
          path: '$[0].kind',
          value: 'sequence',
          expected: 'one of: progression, movement',
        },
        {
          code: 'unexpected-field',
          path: '$[0].surprise',
          value: true,
          expected: 'only id, bankIndex, label, kind, and steps',
        },
        {
          code: 'invalid-step',
          path: '$[0].steps[0]',
          value: 'c',
          expected: PAD_KEY_RULE,
        },
      ],
    });
  });

  it('reports every invalid step in step-index order without case folding', () => {
    const steps = ['C', 'c', 'H', 3, 'F#'];

    expect(validateSuggestionCatalogue([validEntry({ steps })])).toEqual({
      ok: false,
      issues: [
        {
          code: 'invalid-step',
          path: '$[0].steps[1]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 'c',
          expected: PAD_KEY_RULE,
        },
        {
          code: 'invalid-step',
          path: '$[0].steps[2]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 'H',
          expected: PAD_KEY_RULE,
        },
        {
          code: 'invalid-step',
          path: '$[0].steps[3]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 3,
          expected: PAD_KEY_RULE,
        },
      ],
    });
  });

  it('pins entry, field, unexpected-field, step, and cross-entry diagnostic order', () => {
    const malformedDuplicate = validEntry({ label: ' ' });
    const input = [
      validEntry(),
      validEntry({ extra: true, steps: ['C', 'c', 'E'] }),
      malformedDuplicate,
      validEntry(),
    ];

    expect(validateSuggestionCatalogue(input)).toEqual({
      ok: false,
      issues: [
        {
          code: 'unexpected-field',
          path: '$[1].extra',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: true,
          expected: 'only id, bankIndex, label, kind, and steps',
        },
        {
          code: 'invalid-step',
          path: '$[1].steps[1]',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 'c',
          expected: PAD_KEY_RULE,
        },
        {
          code: 'invalid-label',
          path: '$[2].label',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: ' ',
          expected: 'a nonblank string without surrounding whitespace',
        },
        {
          code: 'duplicate-id',
          path: '$[3].id',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: 'fixture-one',
          expected: 'a globally unique suggestion id',
          relatedPath: '$[0].id',
        },
        {
          code: 'duplicate-sequence',
          path: '$[3].steps',
          entryId: 'fixture-one',
          bankIndex: 1,
          value: ['C', 'D', 'E'],
          expected: 'a unique ordered step sequence within bank 1',
          relatedPath: '$[0].steps',
        },
      ],
    });
  });

  it('accepts the same sequence in different banks and reordered steps in one bank', () => {
    const input = [
      validEntry({ id: 'bank-one-original' }),
      validEntry({ id: 'bank-two-same', bankIndex: 2 }),
      validEntry({ id: 'bank-one-reordered', steps: ['E', 'D', 'C'] }),
    ];

    expect(validateSuggestionCatalogue(input)).toEqual({ ok: true, value: input });
  });

  it('leaves successful and unsuccessful input unchanged', () => {
    const validInput = [validEntry({ steps: ['C', 'C', 'D'] })];
    const invalidInput = [validEntry({ steps: ['C', 'bad'] })];
    const validClone = structuredClone(validInput);
    const invalidClone = structuredClone(invalidInput);

    validateSuggestionCatalogue(validInput);
    validateSuggestionCatalogue(invalidInput);

    expect(validInput, 'valid input unchanged').toEqual(validClone);
    expect(invalidInput, 'invalid input unchanged').toEqual(invalidClone);
  });
});

describe('production suggestion catalogue', () => {
  it('contains exactly the three locked records in source order', () => {
    expect(suggestionCatalogue).toEqual(BOOTSTRAP_CATALOGUE);
  });

  it('contains only authoring fields and proves both supported kinds', () => {
    for (const suggestion of suggestionCatalogue) {
      expect(Object.keys(suggestion).sort()).toEqual([...ENTRY_FIELDS].sort());
    }
    expect(new Set(suggestionCatalogue.map((suggestion) => suggestion.kind))).toEqual(
      new Set(SUGGESTION_KINDS),
    );
  });
});

describe('canonical suggestion resolution', () => {
  it('resolves both Bank 1 progressions in catalogue order', () => {
    expect(getSuggestionsForBank(1)).toEqual([
      {
        id: 'pop-homeward',
        bankIndex: 1,
        bankName: 'Pop',
        label: 'Homeward',
        kind: 'progression',
        steps: [
          { key: 'C', chordName: 'Cadd9', displayLabel: 'Cadd9' },
          { key: 'A', chordName: 'FM/A', displayLabel: 'FM/A' },
          { key: 'B', chordName: 'G/B', displayLabel: 'G/B' },
          { key: 'C', chordName: 'Cadd9', displayLabel: 'Cadd9' },
        ],
      },
      {
        id: 'pop-step-up',
        bankIndex: 1,
        bankName: 'Pop',
        label: 'Step up',
        kind: 'progression',
        steps: [
          { key: 'C', chordName: 'Cadd9', displayLabel: 'Cadd9' },
          { key: 'D', chordName: 'Dm7', displayLabel: 'Dm7' },
          { key: 'F', chordName: 'FM9', displayLabel: 'FM9' },
          { key: 'C', chordName: 'Cadd9', displayLabel: 'Cadd9' },
        ],
      },
    ]);
  });

  it('keeps Bank 14 chordName empty and derives displayLabel through the fallback', () => {
    expect(getSuggestionsForBank(14)).toEqual([
      {
        id: 'oct-stack-rise-fall',
        bankIndex: 14,
        bankName: 'Oct Stack',
        label: 'Rise and fall',
        kind: 'movement',
        steps: [
          { key: 'C', chordName: '', displayLabel: 'C Oct Stack' },
          { key: 'D', chordName: '', displayLabel: 'D Oct Stack' },
          { key: 'E', chordName: '', displayLabel: 'E Oct Stack' },
          { key: 'D', chordName: '', displayLabel: 'D Oct Stack' },
        ],
      },
    ]);
  });

  it('returns fresh nested projections across resolver calls', () => {
    const first = getSuggestionsForBank(1);
    const second = getSuggestionsForBank(1);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0]!.steps).not.toBe(second[0]!.steps);
    expect(first[0]!.steps[0]).not.toBe(second[0]!.steps[0]);
  });

  it('exposes only inert canonical text fields', () => {
    for (const suggestion of [
      ...getSuggestionsForBank(1),
      ...getSuggestionsForBank(14),
    ]) {
      expect(Object.keys(suggestion).sort()).toEqual(
        ['id', 'bankIndex', 'bankName', 'label', 'kind', 'steps'].sort(),
      );
      for (const step of suggestion.steps) {
        expect(Object.keys(step).sort()).toEqual(
          ['key', 'chordName', 'displayLabel'].sort(),
        );
        expect(Object.values(step).every((value) => typeof value === 'string')).toBe(true);
      }
    }
  });
});

describe('suggestion lookup', () => {
  it('returns exact empty arrays for every unpopulated canonical bank', () => {
    for (let bankIndex = 1; bankIndex <= 100; bankIndex++) {
      if (bankIndex === 1) {
        expect(getSuggestionsForBank(bankIndex)).toHaveLength(2);
      } else if (bankIndex === 14) {
        expect(getSuggestionsForBank(bankIndex)).toHaveLength(1);
      } else {
        expect(getSuggestionsForBank(bankIndex)).toEqual([]);
      }
    }
  });

  it.each([0, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'throws RangeError instead of wrapping invalid bank index %s',
    (bankIndex) => {
      expect(() => getSuggestionsForBank(bankIndex)).toThrow(RangeError);
    },
  );
});
