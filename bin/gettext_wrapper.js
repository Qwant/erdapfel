const fs = require('fs');
const path = require('path');
const poJs = require('@qwant/po-js');
const mergePo = require('@qwant/merge-po');
const Gettext = require('@qwant/gettext');
const langMessages = {};

/**
 *
 * @param baseLangPath
 * @param fallbackList list of language fallbpack
 * @param messagePath message (po) location
 * extract po data from file path given
 */
function getPoData(language, baseLangPath, fallbackList, messagePath) {
  let messageBuffer = '';

  if (!language.deprecated) {
    messageBuffer = fs.readFileSync(baseLangPath);
  }

  if (fallbackList && fallbackList.length > 0) {
    messageBuffer = mergePo(messageBuffer, fallbackList, messagePath);
  }
  const messageLines = messageBuffer.toString().split(/\n/g);
  return poJs(messageLines);
}

/**
 * Midleware that setup _ et _n for the user lang settings
 * @param app
 * @param languages workaround avoiding parsing yaml on every request
 */
module.exports = function (app, languages) {
  const messagePath = path.resolve(path.join(__dirname, '..', 'language', 'message'));
  languages.forEach(language => {
    const poData = getPoData(
      language,
      `${__dirname}/../language/message/${language.code}.po`,
      language.fallback,
      messagePath
    );
    const plural = Function('n', `return ${poData.options.plural}`);
    langMessages[language.code] = {
      code: language.code,
      locale: language.locale,
      messages: poData.entries,
      getPlural: plural,
    };
  });

  return function (req, res, next) {
    const poData = langMessages[res.locals.language.code];
    const gettext = new Gettext();
    gettext.setMessage(poData.messages);
    gettext.getPlural = poData.getPlural;
    res.locals._ = function _(key, context, placeholders) {
      return gettext._(key, context, placeholders);
    };

    res.locals._n = function (singularMessage = '', pluralMessage, arity, context, placeholders) {
      return gettext._n(singularMessage, pluralMessage, arity, context, placeholders);
    };
    next();
  };
};
