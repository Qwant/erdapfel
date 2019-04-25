function ExtendedString() {}

/**
 *
 * @param str
 * @param length
 * @param options : ignoreEllipsis / ignore the ellipsis symbol if the string is shirtened
 * return if str longer than
 */
ExtendedString.ellipsis = function (str, length, options = {}) {
    let ellipsis = ' $1&hellip;'
    if(options.ignoreEllipsis) {
      ellipsis = ' $1'
    }
    return str && str.length > length && (str = str.slice(0, length).replace(/ ([^ ]*) [^ ]* ?$/, ellipsis)), str && -1 == str.indexOf(' ') && str.length > length && (str += ellipsis), str
}
/**
 * Find the position of the first occurrence of a substring in a string ignoring case
 * @param haystack The string to search in.
 * @param needle
 * @returns {number}
 */
ExtendedString.compareIgnoreCase = function (haystack , needle) {
  return haystack.toUpperCase().indexOf(needle.toUpperCase())
}

ExtendedString.slug = function (str) {
    // Remove non-alphanumeric and non-latin characters
    return str.replace(/[^0-9a-zA-Z\u00C0-\u017F\s-_]/g,'').replace(/\s+/g, '_')
}

ExtendedString.htmlEncode = function (str) {
  return str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';'
  })
}

export default ExtendedString
