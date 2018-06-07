const languages = require('../../config/language.yml')
import AsyncFileLoader from './async_file_loader'

/**
 *
 * i18n lib
 *
 */
function I18n() {
  window._ = this._.bind(this)
  window._n = this._n.bind(this)
  window.getDay = this.getDay.bind(this)
  window.setLang = this.setLang.bind(this)
  window.getLang = this.getLang.bind(this)
}

I18n.days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']


I18n.prototype.setLang = async function(baseLang = navigator.language) {
  this.language = languages.supportedLanguages.find((supportedLanguage) => {
    return baseLang === supportedLanguage.code
  })
  if(!this.language) {
    this.language = languages.defaultLanguage
  }
  try {
    await AsyncFileLoader(`/message/${this.language.locale}.js`)
  } catch (e) {
    console.error(e)
  }
  this.message = window.i18nData.message
  this.getPlural = window.i18nData.getPlural
  this.date = window.i18nDate
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

/**
 * Translate message
 * Ex : _('string', 'home page') -> string
 *
 */
I18n.prototype._ = function(key = '', context, placeholders) {
  if (key === '') {
    return ''
  }
  if(this.message[key]) {
    return replacePlaceholders(this.message[key], placeholders)
  } else {
    return replacePlaceholders(key, placeholders)
  }
}

/**
 * Translate singular our plural message corresponding to the given arity.
 * Ex : _n('%d person', '%d people', 1, 'home page') -> 1 person
 *    : _n('%d person', '%d people', 4, 'home page') -> 4 people
 *
 */
I18n.prototype._n = function(singularMessage = '', pluralMessage, arity, context, placeholders) {
  if (singularMessage === '') {
    return  ''
  }
  let translated = ''
  /* Generated dictionary store values inside the plural form key. */
  if(this.message[pluralMessage] && this.message[pluralMessage][0] && this.message[pluralMessage][1]) {
    translated = this.getPlural(arity) ? this.message[pluralMessage][1] : this.message[pluralMessage][0]
  } else {
    translated = this.getPlural(arity) ? pluralMessage : singularMessage
  }
  return replacePlaceholders(translated, placeholders).replace(/%d/g, arity)
}

function replacePlaceholders(string, placeholders) {
  for (let placeholdersKey in placeholders) {
    let placeholder = new RegExp('{' + placeholdersKey + '}', 'g')
    string = string.replace(placeholder, placeholders[placeholdersKey])
  }
  return string
}


export default I18n
