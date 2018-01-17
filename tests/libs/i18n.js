import I18n from '../../src/libs/i18n'
window.i18ndata = require('../__data__/i18n')

describe('i18n', () => {
  new I18n()
  test('_', () => {
    expect(_('fr test')).toEqual('en test')
  })
})