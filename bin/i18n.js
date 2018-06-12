const yml = require('yml')
const environment = require('environment')
const languages = yaml.readSync('./language.yml')[environment]
const translate = require('i18n')
/*

  [on app load]

  language_list <- language_config

  for each language_list as language
    message_list <- create pair code + messages
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



module.exports = (function() {
  app.locals._ = translate._.bind()
  app.locals._n = translate._n.bind()
})()

