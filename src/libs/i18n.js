/**
 *
 * i18n stub
 *
 */

function I18n(lang, keys) {
  this.lang = lang
  this.keys = keys

  window._ = this._
}

I18n.prototype.setLang = function(lang, keys) {
  this.lang = lang
  this.keys = keys
}

I18n.prototype._ = function(key, context, placeholders) {
  console.log(this)
  return key
}

export default I18n
