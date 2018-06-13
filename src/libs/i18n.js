import nconf from 'nconf-getter'
import AsyncFileLoader from './async_file_loader'

const Gettext = require('gettext')
const languageConfigs = nconf.get().languages
const supportedLanguages = languageConfigs.supportedLanguages
const defaultLanguage = languageConfigs.defaultLanguage
/**
 *
 * i18n lib
 *
 */
function I18n() {
  this.gettext = new Gettext()
  window._ = this.gettext._.bind(this.gettext)
  window._n = this.gettext._n.bind(this.gettext)
  window.getDay = this.getDay.bind(this)
  window.setLang = this.setLang.bind(this)
  window.getLang = this.getLang.bind(this)
}

I18n.days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

I18n.prototype.setLang = async function(baseLang = navigator.language) {
  this.language = supportedLanguages.find((supportedLanguage) => {
    return baseLang === supportedLanguage.code
  })
  if(!this.language) {
    this.language = defaultLanguage
  }
  try {
    await AsyncFileLoader(`build/javascript/message/${this.language.locale}.js`)
  } catch (e) {
    console.error(e)
  }
  this.gettext.setMessage(window.i18nData.message)

  this.getPlural = window.i18nData.getPlural
  this.date = window.i18nDate
}

/**
 * translate short days
 * @param day short name of the day ex. sa for saturday
 * @param dayKey the dictionary key containing day name can be dayNamesMin, dayNamesShort, dayNames
 * @returns {*}
 */
I18n.prototype.getDay = function(day, dayKey) {
  let pos = I18n.days.indexOf(day)
  /* default key is long day format */
  if(!this.date[dayKey]) {
    dayKey = 'dayNames'
  }
  return this.date[dayKey][pos]
}

I18n.prototype.getLang = function() {
  return this.language
}

/**
 * translate short days
 * @param day short name of the day ex. sa for saturday
 * @param dayKey the dictionary key containing day name can be dayNamesMin, dayNamesShort, dayNames
 * @returns {*}
 */
I18n.prototype.getDay = function(day, dayKey) {
  let pos = I18n.days.indexOf(day)
  /* default key is long day format */
  if(!this.date[dayKey]) {
    dayKey = 'dayNames'
  }
  return this.date[dayKey][pos]
}

export default I18n
