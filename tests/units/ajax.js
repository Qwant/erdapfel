import '../__mocks__/xml_http_mock';
import Ajax from '../../src/libs/ajax';

describe('ajax', () => {
  it('works with promises', () => {
    expect.assertions(1);
    return Ajax.get('localhost', { 'test': true })
      .then(data => {
        expect(data).toEqual({});
      });
  });
});
