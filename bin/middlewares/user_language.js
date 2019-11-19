/* globals module */

/**
 *
 * @param languageConfig set of language config (list of available config & default lang
 * set res.locals.language with the user config subset or default config subset
 */
module.exports = function(languageConfig) {
  const supportedLanguages = languageConfig.supportedLanguages;
  return function(req, res, next) {
    const langHeaders = req.acceptsLanguages();
    if (langHeaders) {
      langHeaders.some(acceptedLocale => {
        let language = supportedLanguages.find(lang => {
          const supportedLocale = lang.locale.replace(/_/g, '-');
          return supportedLocale === acceptedLocale;
        });
        if (!language) {
          // Fallback to language "code" (and ignore exact locale)
          const langCode = acceptedLocale.slice(0, 2).toLowerCase();
          language = supportedLanguages.find(lang => lang.code === langCode);
        }
        if (language) {
          res.locals.language = language;
          /* language found we interrupt array.some */
          return true;
        }
      });
    }
    /* no supported language -> set default language */
    if (!res.locals.language) {
      res.locals.language = languageConfig.defaultLanguage;
    }
    next();
  };
};
