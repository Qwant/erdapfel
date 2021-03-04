import { options as i18nOptions } from "../i18next-scanner.config.js";

const supportedLanguages = i18nOptions.lngs;
const defaultLanguage = i18nOptions.defaultLng;
const messages = {};
supportedLanguages.forEach(lang =>
  import(`../i18n/${lang}/resource.json`)
    .then(resource => messages[lang] = resource)
);

class Gettext {
  constructor(lang = defaultLanguage){
    this.lang = lang;
  }

  _(k) {
    return (messages[this.lang] || {})[k] || k;
  }

  setLang(lang) {
    if (supportedLanguages.indexOf(lang) > -1) {
      this.lang = lang;
    }
    else {
      this.lang = defaultLanguage;
    }
  }
}

const gettext = new Gettext();
const _ = gettext._.bind(gettext);

export { gettext, _ };
