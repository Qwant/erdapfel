/**
 *
 * @param languageConfig set of language config (list of available config & default lang
 * set res.locals.language with the user config subset or default config subset
 */
module.exports = function(languageConfig) {
  return function (req, res, next) {
    let langHeaders = req.acceptsLanguages()
    if (langHeaders) {
      langHeaders.some((rawLangHeader) => {
        /* clean language code */
        let langCode = rawLangHeader.slice(0, 2).toLowerCase()
        let language = languageConfig.supportedLanguages.find((supportedLanguage) => {
          return supportedLanguage.code === langCode
        })
        if(language) {
          res.locals.language = language
          /* language found we interrupt array.some */
          return true
        }
      })
    }
    /* no supported language -> set default language */
    if(!res.locals.language) {
      res.locals.language = languageConfig.defaultLanguage
    }
    next()
  }
}
