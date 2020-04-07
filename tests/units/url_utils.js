/* eslint-disable no-irregular-whitespace */
import { buildQueryString } from '../../src/libs/url_utils';

describe('url_utils', () => {
  describe('buildQueryString', () => {
    const cases = [
      {
        param: {},
        expected: '',
      },
      {
        param: { q: 'myquery' },
        expected: '?q=myquery',
      },
      {
        param: { q: 'myquery', type: 'restaurant' },
        expected: '?q=myquery&type=restaurant',
      },
    ];

    cases.map(({ param, expected }) =>
      test(`build query string as '${expected}'`, () => {
        expect(buildQueryString(param)).toEqual(expected);
      })
    );
  });
});
