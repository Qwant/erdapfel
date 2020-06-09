import { findIndexIgnoreCase, normalize, slug, htmlEncode } from '../../src/libs/string';

describe('String utils', () => {
  test('findIndexIgnoreCase', () => {
    const cases = [
      { haystack: '', needle: '', index: 0 },
      { haystack: 'Tomato', needle: '', index: 0 },
      { haystack: 'Tomato', needle: 'Ananas', index: -1 },
      { haystack: 'Tomato', needle: 'o', index: 1 },
      { haystack: 'Tomato', needle: 'AtO', index: 3 },
      { haystack: 'Épinard', needle: 'ePî', index: 0 },
    ];
    cases.forEach(({ haystack, needle, index }) => {
      expect(findIndexIgnoreCase(haystack, needle)).toEqual(index);
    });
  });

  test('normalize', () => {
    const cases = [
      { input: '', normalized: '' },
      { input: 'Tomato', normalized: 'Tomato' },
      { input: 'ÅàÉÇî', normalized: 'AaECi' },
    ];
    cases.forEach(({ input, normalized }) => {
      expect(normalize(input)).toEqual(normalized);
    });
  });

  test('slug', () => {
    const cases = [
      { input: '', asSlug: '' },
      { input: 'Tomato', asSlug: 'Tomato' },
      { input: 'To$🗺️|-ma*_tÔ', asSlug: 'To-ma_tÔ' },
    ];
    cases.forEach(({ input, asSlug }) => {
      expect(slug(input)).toEqual(asSlug);
    });
  });

  test('htmlEncode', () => {
    const cases = [
      { input: '', encoded: '' },
      { input: 'Tomato', encoded: 'Tomato' },
      { input: '<TomatÔ>!', encoded: '&#60;Tomat&#212;&#62;!' },
    ];
    cases.forEach(({ input, encoded }) => {
      expect(htmlEncode(input)).toEqual(encoded);
    });
  });
});
