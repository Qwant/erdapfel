/**
 *
 * @param languageConfig set of language config (list of available config & default lang
 * set res.locals.language with the user config subset or default config subset
 */
module.exports = function (languageConfig) {
  const supportedLanguages = languageConfig.supportedLanguages;
  return function (req, res, next) {
    const langHeaders = req.acceptsLanguages();
    let language;

    // If cookie "l" is set and corresponds to a supported language, use it
    if (req.cookies && req.cookies.l) {
      language = supportedLanguages.find(lang => lang.code === req.cookies.l);
      if (language) {
        res.locals.language = language;
      }
    }

    // Else, fallback to the first accepted language in the headers
    if (!res.locals.language && langHeaders) {
      langHeaders.some(acceptedLocale => {
        language = supportedLanguages.find(lang => {
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
          return true; // interrupt Array.some when a language is found
        }
      });
    }

    // Else, use default language
    if (!res.locals.language) {
      res.locals.language = languageConfig.defaultLanguage;
    }
    next();
  };
};
