/* eslint-disable no-irregular-whitespace */
import { buildQueryString, parseQueryString } from '../../src/libs/url_utils';

describe('url_utils', () => {
  describe('parseQueryString()', () => {
    it('should extract all the query params into an object', () => {
      const params = '?foo=foo&bar=bar&size=10';
      const result = parseQueryString(params);
      expect(result).toEqual({ foo: 'foo', bar: 'bar', size: '10' });
    });

    it('should extract all the undefined params', () => {
      const params = '?baz=';
      const result = parseQueryString(params);
      expect(result).toEqual({ baz: '' });
    });
  });

  describe('buildQueryString()', () => {
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
      {
        param: { q: 'myquery', foo: null, bar: undefined, baz: 0, qux: '' },
        expected: '?q=myquery&baz=0&qux=',
      },
    ];

    cases.map(({ param, expected }) =>
      test(`build query string as '${expected}'`, () => {
        expect(buildQueryString(param)).toEqual(expected);
      })
    );
  });
});
