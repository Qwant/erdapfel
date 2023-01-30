import { boundsFromFlatArray, parseBboxString } from '../../src/libs/bounds';

describe('Bounds utils', () => {
  describe('boundsFromFlatArray', () => {
    it('throws when the array is not 4-items long', () => {
      expect(() => {
        boundsFromFlatArray([1, 2, 3]);
      }).toThrow(/Malformed/);
      expect(() => {
        boundsFromFlatArray([1, 2, 3, 4, 5]);
      }).toThrow(/Malformed/);
    });

    it('throws when the array contains non-numbers', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        boundsFromFlatArray([1, 2, 'foo', 3]);
      }).toThrow(/Malformed/);
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        boundsFromFlatArray([1, NaN, 3, 4]);
      }).toThrow(/Malformed/);
    });

    it('returns a suitable LngLatBoundsLike object', () => {
      expect(boundsFromFlatArray([1, 2, 3, 4])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });

  describe('parseBboxString', () => {
    it('throws on malformed strings', () => {
      const cases = ['foobar', '1.0,2.0,3.0', '1,2,3,4,5', 'string,2,3,4'];
      cases.map(testCase => {
        expect(() => {
          parseBboxString(testCase);
        }).toThrow();
      });
    });

    it('returns a suitable LngLatBoundsLike for correct strings', () => {
      expect(parseBboxString('1,2,3,4')).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(parseBboxString('2.35 , 48.85, 2.75, 49')).toEqual([
        [2.35, 48.85],
        [2.75, 49],
      ]);
    });
  });
});
