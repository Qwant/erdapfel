/* eslint-disable no-irregular-whitespace */
import { formatDuration, formatDistance } from '../../src/libs/route_utils';

describe('route_utils', () => {
  describe('formatDuration', () => {
    const cases = [
      { seconds: 0, result: '1 min' },
      { seconds: 37, result: '1 min' },
      { seconds: 125, result: '2 min' },
      { seconds: 3600, result: '1 h' },
      { seconds: 5100, result: '1 h 25 min' },
      { seconds: 36000, result: '10 h' },
    ];

    cases.map(({ seconds, result }) =>
      test(`Formats ${seconds} seconds as '${result}'`, () => {
        expect(formatDuration(seconds)).toEqual(result);
      })
    );
  });

  describe('formatDistance', () => {
    const cases = [
      { meters: 0, result: '' },
      { meters: 15, result: '15 m' },
      { meters: 500, result: '500 m' },
      { meters: 1234, result: '1,2 km' },
      { meters: 9999, result: '10,0 km' },
      { meters: 123456, result: '123 km' },
    ];

    cases.map(({ meters, result }) =>
      test(`Formats ${meters} meters as '${result}'`, () => {
        expect(formatDistance(meters)).toEqual(result);
      })
    );
  });
});
