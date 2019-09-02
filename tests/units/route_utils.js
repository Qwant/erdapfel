import { formatDuration, formatDistance } from '../../src/libs/route_utils';

describe('route_utils', () => {
  describe('formatDuration', () => {
    const cases = [
      { seconds: 0, result: '1&nbsp;min' },
      { seconds: 37, result: '1&nbsp;min' },
      { seconds: 125, result: '2&nbsp;min' },
      { seconds: 3600, result: '1&nbsp;h' },
      { seconds: 5100, result: '1&nbsp;h&nbsp;25&nbsp;min' },
      { seconds: 36000, result: '10&nbsp;h' },
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
      { meters: 15, result: '15&nbsp;m' },
      { meters: 500, result: '500&nbsp;m' },
      { meters: 1234, result: '1,2&nbsp;km' },
      { meters: 9999, result: '10,0&nbsp;km' },
      { meters: 123456, result: '123&nbsp;km' },
    ];

    cases.map(({ meters, result }) =>
      test(`Formats ${meters} meters as '${result}'`, () => {
        expect(formatDistance(meters)).toEqual(result);
      })
    );
  });
});
