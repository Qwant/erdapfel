const poToJs = require('./src/po_to_js')
const utils = require('loader-utils')

module.exports = function(source) {
  if(this.cacheable) {
    this.cacheable()
  }
  let options = utils.getOptions(this)
  options = options || {}
  return poToJs(source, options)
}
