function getIntlLocales() {
  const lang = window.getLang();
  const locales = [lang.locale].concat(lang.fallback || []);
  // Intl expects '-' in locales, such as "en-GB"
  return locales.map(l => l.replace(/_/g, '-'));
}

export function getTimeFormatter(format = {}) {
  return Intl.DateTimeFormat(getIntlLocales(), format);
}
