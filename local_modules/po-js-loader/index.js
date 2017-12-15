const poToJs = require('./src/po_to_js')
var utils = require('loader-utils');

module.exports = function(source) {
  this.cacheable();

  let options = utils.getOptions(this)
  options = options || {}
  return poToJs(source, options)
}
