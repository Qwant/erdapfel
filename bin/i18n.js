const yml = require('yml')
const environment = require('environment')
const languages = yaml.readSync('./language.yml')[environment]
const translate = require('i18n')
const langMessages = {}
languages.forEach((language) => {
  langMessages[language.code] = {code : language.code, locale: language.locale, messages : getMessages(`${__dirname}/../language/${language.locale}a`)}
})
/*

  [on app load]

  language_list <- language_config

  for each language_list as language
    message_list <- create pair code + messages accessible on O(1)
  fin pour for each


  [on runtime]

  in : message

  lang <- get user language
  user_lang_message <- get_corresponding message bloc

  translated <- translate message

  out : translated

 */


const messages = languages.map((language) => {
  return {
    code : messages.code,
    message
  }
})

function getMessages() {

}






module.exports = (function() {
  app.locals._ = _
  app.locals._n = _n
})()

