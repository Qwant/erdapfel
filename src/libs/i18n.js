import AsyncFileLoader from './async_file_loader';
import Error from '../adapters/error';
import Gettext from '@qwant/gettext';

/**
 *
 * i18n lib
 *
 */
function I18n() {
  this.gettext = new Gettext();
  window._ = this.gettext._.bind(this.gettext);
  window._n = this.gettext._n.bind(this.gettext);
  window.setLang = this.setLang.bind(this);
  window.getLang = this.getLang.bind(this);
  window.getBaseLang = this.getBaseLang.bind(this);
}

I18n.prototype.setLang = async function() {
  this.language = window.preferedLanguage;
  try {
    await AsyncFileLoader(`statics/build/javascript/message/${this.language.locale}.js`);
  } catch (e) {
    Error.send('i18n', 'setLang',
      `error getting downloading language file : ${this.language.locale}`, e);
  }
  this.gettext.setMessage(window.i18nData.message);

  this.gettext.getPlural = window.i18nData.getPlural;
};

/* return user language  */
I18n.prototype.getLang = function() {
  return this.language;
};

/* return a supported user language   */
I18n.prototype.getBaseLang = function() {
  return this.language;
};

export default I18n;
