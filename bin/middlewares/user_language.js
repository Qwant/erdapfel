/**
 *
 * @param languageConfig set of language config (list of available config & default lang
 * set res.language with the user config subset or default config subset
 */
module.exports = function(languageConfig) {
  return function (req, res, next) {
    let langHeader = req.acceptsLanguages()
    if (langHeader && langHeader.length > 1) {
      let rawLangCode = langHeader[0]
      let langCode = rawLangCode.slice(0, 2).toLowerCase()
      let selectedLanguage = languageConfig.supportedLanguages.find((language) => {
        return language.code === langCode
      })
      if(selectedLanguage) {
        res.language = selectedLanguage
      } else {
        res.language = languageConfig.defaultLanguage
      }
    } else {
      res.language = languageConfig.defaultLanguage
    }
    next()
  }
}