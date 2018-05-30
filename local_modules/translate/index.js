function Translate() {}

Translate.prototype.setMessage = function(message) {
  this.message = message
}
/**
 * Translate message
 * Ex : _('string', 'home page') -> string
 *
 */
Translate.prototype._ = function(key = '', context, placeholders) {
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
Translate.prototype._n = function(singularMessage = '', pluralMessage, arity, context, placeholders) {
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

module.exports = Translate
