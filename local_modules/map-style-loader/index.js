const utils = require('loader-utils')
const styleBuilder = require('@qwant/map-style-builder')

module.exports = function(source) {
  if(this.cacheable) {
    this.cacheable()
  }

  const style = JSON.parse(source)

  let options = utils.getOptions(this)
  options = options || {}
  options.styleDir = this.context
  options.ouput = options.ouput || 'dev'
  options.config = require(options.conf)

  return styleBuilder(style, options)
}
