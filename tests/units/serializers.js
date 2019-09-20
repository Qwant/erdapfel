import getReqSerializer from '../../bin/serializers/request';
import defaultConfig from '../../config/default_config.yml';

const reqSerializer = getReqSerializer(defaultConfig);

describe('request serializer', () => {
  describe('rejected headers', () => {
    const cases = [
      // exclude header with dot
      { 'x-geoip-region.abc': 'value' },
      // exclude arbitrary headers
      { 'some-header': 'xyz' },
    ];

    cases.map(headers =>
      test(`Exclude header ${Object.keys(headers)}`, () => {
        expect(reqSerializer({ headers })).toEqual({ headers: {} });
      })
    );
  });

  describe('allowed headers', () => {
    const cases = [
      { 'accept-encoding': 'value' },
      { 'host': 'value' },
      { 'user-agent': 'value' },
      { 'x-geoip-region': 'value' },
      { 'x-qwantmaps-query': 'value' },
    ];

    cases.map(headers =>
      test(`Keep header ${Object.keys(headers)}`, () => {
        expect(reqSerializer({ headers })).not.toEqual({ headers: {} });
      })
    );
  });
});
