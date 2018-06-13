const fs = require('fs')
const poJs = require('po-js')
const langMessages = {}

/**
 * Translate message
 * Ex : _('string', 'home page') -> string
 *
 */
function gettext(messages, key = '', context, placeholders) {
  if (key === '') {
    return ''
  }
  if(messages[key]) {
    return replacePlaceholders(messages[key], placeholders)
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
function ngettext(messages, singularMessage = '', pluralMessage, arity, context, placeholders) {
  if (singularMessage === '') {
    return  ''
  }
  let translated = ''
  /* Generated dictionary store values inside the plural form key. */
  if(messages[pluralMessage] && messages[pluralMessage][0] && messages[pluralMessage][1]) {
    translated = this.getPlural(arity) ? messages[pluralMessage][1] : messages[pluralMessage][0]
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
    let poData = langMessages[res.language.code]
    app.locals._ = function _(key = '', context, placeholders) {
      return gettext(poData.messages, key, context, placeholders)
    }

    app.locals._n = function(singularMessage = '', pluralMessage, arity, context, placeholders) {
      return ngettext(poData.messages, singularMessage, pluralMessage, arity, context, placeholders)
    }

    next()
  }
}

