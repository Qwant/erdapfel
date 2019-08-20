import ExtendedString from '../../src/libs/string';

describe('ExtendedString', () => {
  test('compareIgnoreCase', () => {
    const cases = [
      { haystack: '', needle: '', index: 0 },
      { haystack: 'Tomato', needle: '', index: 0 },
      { haystack: 'Tomato', needle: 'Ananas', index: -1 },
      { haystack: 'Tomato', needle: 'o', index: 1 },
      { haystack: 'Tomato', needle: 'AtO', index: 3 },
      { haystack: 'Épinard', needle: 'ePî', index: 0 },
    ];
    cases.forEach(({ haystack, needle, index }) => {
      expect(ExtendedString.compareIgnoreCase(haystack, needle)).toEqual(index);
    });
  });

  test('normalize', () => {
    const cases = [
      { input: '', normalized: '' },
      { input: 'Tomato', normalized: 'Tomato' },
      { input: 'ÅàÉÇî', normalized: 'AaECi' },
    ];
    cases.forEach(({ input, normalized }) => {
      expect(ExtendedString.normalize(input)).toEqual(normalized);
    });
  });

  test('slug', () => {
    const cases = [
      { input: '', slug: '' },
      { input: 'Tomato', slug: 'Tomato' },
      { input: 'To$🗺️|-ma*_tÔ', slug: 'To-ma_tÔ' },
    ];
    cases.forEach(({ input, slug }) => {
      expect(ExtendedString.slug(input)).toEqual(slug);
    });
  });

  test('htmlEncode', () => {
    const cases = [
      { input: '', encoded: '' },
      { input: 'Tomato', encoded: 'Tomato' },
      { input: '<TomatÔ>!', encoded: '&#60;Tomat&#212;&#62;!' },
    ];
    cases.forEach(({ input, encoded }) => {
      expect(ExtendedString.htmlEncode(input)).toEqual(encoded);
    });
  });
});
