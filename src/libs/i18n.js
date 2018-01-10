/**
 *
 * i18n lib
 *
 */

function I18n() {
  window._ = this._.bind(this)
  window._n = this._n.bind(this)
  this.message = i18nData.message
  this.getPlural = i18nData.getPlural
}

I18n.prototype.setLang = function(lang, keys) {
  this.lang = lang
  this.keys = keys
}

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

I18n.prototype._n = function(key1 = '', key2, count, context, placeholders) {
  if (key1 === '') {
    return  ''
  }
  let pluralKey = this.getPlural(count) ? this.message[key2][0] : this.message[key2][1]

  return replacePlaceholders(pluralKey, placeholders).replace(/%d/g, count)
}

function replacePlaceholders(string, placeholders) {
  for (let placeholdersKey in placeholders) {
    let placeholder = new RegExp('{' + placeholdersKey + '}', 'g')
    string = string.replace(placeholder, placeholders[placeholdersKey])
  }
  return string
}

export default I18n
