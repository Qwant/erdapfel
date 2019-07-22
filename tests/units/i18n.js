import I18n from '../../src/libs/i18n';
const i18nData = require('../__data__/i18n').i18nData;
const date = require('../__data__/i18n').date;

describe('i18n', () => {
  const i18n = new I18n();
  /* avoid set lang */
  i18n.getPlural = i18nData.getPlural;
  i18n.gettext.setMessage(i18nData.message);
  i18n.date = date;

  test('_', () => {
    expect(_('fr test')).toEqual('en test');
  });

  test('getDay', () => {
    expect(getDay(1)).toEqual('Monday');
  });
});
