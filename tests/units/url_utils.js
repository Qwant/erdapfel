/**
 * @jest-environment jsdom
 */

import {
  buildQueryString,
  parseQueryString,
  parseMapHash,
  getMapHash,
  getQueryString,
  joinPath,
  getAppRelativePathname,
  toCssUrl,
  updateQueryString,
  shouldShowBackToQwant,
  onDrawerChange,
} from '../../src/libs/url_utils';

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

  describe('parseMapHash()', () => {
    it('should return undefined if `map=` does not exists', () => {
      const result = parseMapHash('#toto=11.09/13.5011125/3.1699838');
      expect(result).not.toBeDefined();
    });

    it('should return undefined if coordinates and zoom are not fully defined (3 parts)', () => {
      const result = parseMapHash('#map=13.5011125/3.1699838');
      expect(result).not.toBeDefined();
    });

    it('should return coordinates if all informations are given', () => {
      const result = parseMapHash('#map=1/2/3');
      expect(result).toEqual({ lat: 2, lng: 3, zoom: 1 });
    });
  });

  describe('getMapHash()', () => {
    it('should return hash map with appropriate .toFixed() values with given parameters', () => {
      const result = getMapHash(10.1066666, 13.4655044666666, 3.2653788666666);
      expect(result).toBe('map=10.11/13.4655045/3.2653789');
    });
  });

  describe('getQueryString()', () => {
    it('should return the query strings', () => {
      expect(getQueryString('/?type=bar#map=16.50/13.6298497/2.9434994')).toBe('type=bar');
      expect(getQueryString('/routes/?mode=driving&pt=true#map=8.26/48.6839087/2.5027326')).toBe(
        'mode=driving&pt=true'
      );
    });
  });

  describe('joinPath()', () => {
    it('should return parts of a path, ignoring middle /', () => {
      expect(joinPath(['/', '/toto'])).toBe('/toto');
      expect(joinPath(['toto/', '/toto'])).toBe('toto/toto');
      expect(joinPath(['/toto/', '/toto/'])).toBe('/toto/toto/');
      expect(joinPath(['toto', 'toto'])).toBe('toto/toto');
    });
  });

  describe('getAppRelativePathname()', () => {
    it('should return a pathname ignoring the base url of the app', () => {
      window.baseUrl = '/maps/';
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/maps/yolo',
        },
      });

      expect(getAppRelativePathname()).toBe('/yolo');
    });
  });

  describe('toCssUrl()', () => {
    it('should return an url string escaped for CSS url()', () => {
      // eslint-disable-next-line prettier/prettier, no-useless-escape
      expect(toCssUrl('http://placeholder.com/"plop"')).toBe("url('http://placeholder.com/\"plop\"')");
    });
  });

  describe('updateQueryString()', () => {
    it('should add to window.location.search the following params', () => {
      window.location.search = '?uno&two=dos';
      expect(updateQueryString({ three: 'tres' })).toBe('?uno=&two=dos&three=tres');
    });
  });

  describe('shouldShowBackToQwant()', () => {
    it('should returns true of user come from IA (multi or single)', () => {
      window.location.search = '?client=search-ia-maps-multi';
      expect(shouldShowBackToQwant()).toBe(true);
      window.location.search = '?client=search-ia-maps-single';
      expect(shouldShowBackToQwant()).toBe(true);
    });

    it('should returns false if client does not match IA', () => {
      window.location.search = '?client=unknown';
      expect(shouldShowBackToQwant()).toBe(false);
    });
  });

  describe('onDrawerChange()', () => {
    it('should returns true of user come from IA (multi or single)', () => {
      const navigateToMock = jest.fn();
      window.app = {
        navigateTo: navigateToMock,
      };

      onDrawerChange('products', true);
      expect(navigateToMock).toHaveBeenCalled();
      expect(navigateToMock?.mock?.calls[0][0]).toMatch(/drawer=products/);
    });
  });
});
