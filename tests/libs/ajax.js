import '../__mocks__/xml_http_mock'
import ajax from '../../src/libs/ajax'

describe('ajax', () => {

  it('works with promises', () => {
    expect.assertions(1);
    return ajax.query('localhost', {'test' : true})
      .then((data) => {
        expect(data).toEqual({})
    })
  });






})

