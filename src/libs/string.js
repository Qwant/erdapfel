function ExtendedString() {}

/**
 *
 * @param str
 * @param length
 * return if str longer than
 */
ExtendedString.ellipsis = function (str, length) {
    return str && str.length > length && (str = str.slice(0, length).replace(/ ([^ ]*) [^ ]* ?$/, ' $1&hellip;')), str && -1 == str.indexOf(' ') && str.length > length && (str += '&hellip;'), str
}

ExtendedString.slug = function (str) {
    // Remove non-alphanumeric and non-latin characters
    return str.replace(/[^0-9a-zA-Z\u00C0-\u017F\s-_]/g,'').replace(/\s+/g, '_')
}

export default ExtendedString
