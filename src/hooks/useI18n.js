export const useI18n = () => {
  const { locale, code: lang } = window.getLang();

  return {
    _: window._,
    locale,
    lang,
  };
};
