const fs = require('fs')
const poJs = require('po-js')
const Gettext = require('gettext')
const langMessages = {}

/**
 *
 * @param path
 * extract po data from file path given
 */
function getPoData(path) {
  let messageBuffer = fs.readFileSync(path)
  let messageLines = messageBuffer.toString().split(/\n/g)
  return poJs(messageLines)
}

/**
 * Midleware that setup _ et _n for the user lang settings
 * @param app
 * @param languages workaround avoiding parsing yaml on every request
 */
module.exports = function(app, languages) {
  languages.forEach((language) => {
    let poData = getPoData(`${__dirname}/../language/message/${language.locale}.po`)
    let plural =  Function('n', `return ${poData.options.plural}`)

    langMessages[language.code] = {code : language.code, locale: language.locale, messages : poData.entries, getPlural : plural}
  })

  return function (req, res, next) {
    let poData = langMessages[res.locals.language.code]
    let gettext = new Gettext()
    gettext.setMessage(poData.messages)
    gettext.getPlural = poData.getPlural
    res.locals._ = function _(key = '', context, placeholders) {
      return gettext._(key, context, placeholders)
    }

    res.locals._n = function(singularMessage = '', pluralMessage, arity, context, placeholders) {
      return gettext._n(singularMessage, pluralMessage, arity, context, placeholders)
    }
    next()
  }
}
