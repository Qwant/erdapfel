import { localizedUrls, localizedStrings } from 'config/constants.yml';

const getLocalizedUrl = lang => urlName => {
  return localizedUrls?.[lang]?.[urlName] || localizedUrls?.['en']?.[urlName];
};

const getLocalizedString = lang => urlName => {
  return localizedStrings?.[lang]?.[urlName] || localizedStrings?.['en']?.[urlName];
};

export const useI18n = () => {
  const { locale, code: lang } = window.getLang();

  return {
    _: window._,
    _n: window._n,
    locale,
    lang,
    getLocalizedUrl: getLocalizedUrl(lang),
    getLocalizedString: getLocalizedString(lang),
  };
};
