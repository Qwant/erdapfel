function ExtendedString() {}

/**
 * Find the position of the first occurrence of a substring in a string ignoring case
 * @param haystack The string to search in.
 * @param needle
 * @returns {number}
 */
ExtendedString.compareIgnoreCase = function(haystack, needle) {
  haystack = ExtendedString.normalize(haystack);
  needle = ExtendedString.normalize(needle);
  return haystack.toUpperCase().indexOf(needle.toUpperCase());
};

// replace accent by non accentued chars
ExtendedString.normalize = function(str) {
  if (!str.normalize) {
    // normalize is not available on IE11, but we can still replace
    return str.replace(/[\u0300-\u036f]/g, '');
  }
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

ExtendedString.slug = function(str = '') {
  // Remove non-alphanumeric and non-latin characters
  return str.replace(/[^0-9a-zA-Z\u00C0-\u017F\s-_]/g, '').replace(/\s+/g, '_');
};

ExtendedString.htmlEncode = function(str) {
  return str.replace(/[\u00A0-\u9999<>&]/gim, function(i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
};

ExtendedString.capitalizeFirstLetter = function(str) {
  return !str ? str : str[0].toUpperCase() + str.substring(1);
};

export default ExtendedString;
