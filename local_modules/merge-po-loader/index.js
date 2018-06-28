const mergePo = require('merge-po')
const utils = require('loader-utils')

module.exports = function(source) {
  if(this.cacheable) {
    this.cacheable()
  }

  let options = utils.getOptions(this)

  options = options || {}

  const fallbackPaths = options.fallbackPaths
  if(fallbackPaths && fallbackPaths.length > 0) {
    try {
      return mergePo(source, fallbackPaths)
    } catch (e) {
      throw(e)
    }
  } else {
    /* no fallback detected : return original po */
   return source
  }
}
