import { localizedUrls } from 'config/constants.yml';

const getLocalizedUrl = lang => urlName => {
  return localizedUrls?.[lang]?.[urlName] || localizedUrls?.['en']?.[urlName];
};

export const useI18n = () => {
  const { locale, code: lang } = window.getLang();

  return {
    _: window._,
    _n: window._n,
    locale,
    lang,
    getLocalizedUrl: getLocalizedUrl(lang),
  };
};
