import {
  findIndexIgnoreCase,
  normalize,
  slug,
  htmlEncode,
  capitalizeFirst,
} from '../../src/libs/string';

describe('String utils', () => {
  it('findIndexIgnoreCase', () => {
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

  it('normalize', () => {
    const cases = [
      { input: '', normalized: '' },
      { input: 'Tomato', normalized: 'Tomato' },
      { input: 'ÅàÉÇî', normalized: 'AaECi' },
    ];
    cases.forEach(({ input, normalized }) => {
      expect(normalize(input)).toEqual(normalized);
    });
  });

  it('slug', () => {
    const cases = [
      { input: '', asSlug: '' },
      { input: 'Tomato', asSlug: 'Tomato' },
      { input: 'To$🗺️|-ma*_tÔ', asSlug: 'To-ma_tÔ' },
    ];
    cases.forEach(({ input, asSlug }) => {
      expect(slug(input)).toEqual(asSlug);
    });
  });

  it('htmlEncode', () => {
    const cases = [
      { input: '', encoded: '' },
      { input: 'Tomato', encoded: 'Tomato' },
      { input: '<TomatÔ>!', encoded: '&#60;Tomat&#212;&#62;!' },
    ];
    cases.forEach(({ input, encoded }) => {
      expect(htmlEncode(input)).toEqual(encoded);
    });
  });

  it('capitalizeFirst', () => {
    const cases = [
      { input: '', result: '' },
      { input: 'Tomato', result: 'Tomato' },
      { input: 'tomato', result: 'Tomato' },
      { input: 'épinard', result: 'Épinard' },
    ];
    cases.forEach(({ input, result }) => {
      expect(capitalizeFirst(input)).toEqual(result);
    });
  });
});
