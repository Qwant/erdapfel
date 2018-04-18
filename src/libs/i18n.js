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
  window.setLang = this.setLang.bind(this)
  window.getLang = this.getLang.bind(this)

  this.message = i18nData.message
  this.getPlural = i18nData.getPlural
}

I18n.prototype.setLang = async function(baseLang = navigator.language) {
  this.language = languages.supportedLanguages.find((supportedLanguage) => {
    return baseLang === supportedLanguage.code
  })

  if(!this.language) {
    this.language = languages.defaultLanguage
  }
  await AsyncFileLoader(`message/${this.language.locale}.js`)
  await AsyncFileLoader(`date/${this.language.locale}.json`)
  this.message = i18nData.message
}

I18n.prototype.getLang = function() {
  return this.language
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
