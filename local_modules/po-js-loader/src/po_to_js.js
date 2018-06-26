const poToJs = require('po-js')

module.exports = function(buffer, options) {
  return convertTask(buffer, options)
}

/**
 * The actual convert task. Reads the file(s) in src and writes to dest.
 *
 * @param {String|Object} src accepts a path or a {[ns]: [path]} formatted object.
 * @param {String} destPath the destination path for the file.
 * @param {Object} options pass this.options() here.
 */
function convertTask(buffer, options) {
  const lines = buffer.toString().split(/[\r\n]+/g);
  const returnObj = poToJs(lines, options)
  return `i18nData = {
\tgetPlural : function(n) { ${returnObj.options.plural} return plural; },
\tmessage : ${JSON.stringify(returnObj.entries).replace(/\\\\/g,"")}
}`
}
