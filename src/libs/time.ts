type IntlDateTimeFormatParams = ConstructorParameters<typeof Intl.DateTimeFormat>;
type IntlDateTimeFormatLocales = IntlDateTimeFormatParams[0];
type IntlDateTimeFormatOptions = IntlDateTimeFormatParams[1];

const getIntlLocales = (): IntlDateTimeFormatLocales => {
  const lang = window?.getLang();
  const locales = [lang.locale].concat(lang.fallback || []);
  // Intl expects '-' in locales, such as "en-GB"
  return locales.map(l => l.replace(/_/g, '-'));
};

export const getTimeFormatter = (format: IntlDateTimeFormatOptions = {}) => {
  return Intl.DateTimeFormat(getIntlLocales(), format);
};

export const stripTimeZone = (isoString: string) => {
  return isoString.substring(0, 19);
};
