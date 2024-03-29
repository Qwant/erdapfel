/**
 * Find the position of the first occurrence of a substring in a string ignoring case
 * @param haystack The string to search in.
 * @param needle
 */
export function findIndexIgnoreCase(haystack: string, needle: string) {
  haystack = normalize(haystack);
  needle = normalize(needle);
  return haystack.toUpperCase().indexOf(needle.toUpperCase());
}

// replace accent by non accentued chars
export function normalize(str: string) {
  if (!str.normalize) {
    // normalize is not available on IE11, but we can still replace
    return str.replace(/[\u0300-\u036f]/g, '');
  }
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slug(str = '') {
  // Remove non-alphanumeric and non-latin characters
  return str.replace(/[^0-9a-zA-Z\u00C0-\u017F\s-_]/g, '').replace(/\s+/g, '_');
}

export function htmlEncode(str: string) {
  return str.replace(/[\u00A0-\u9999<>&]/gim, function (i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
}

export function capitalizeFirst(str = '') {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
}

export function truncate(string: string, length: number) {
  if (string.length <= length) return string;
  string = string.substring(0, length);
  string = string.replace(/\s+\S+?\.*$/, '');
  return string + '...';
}
