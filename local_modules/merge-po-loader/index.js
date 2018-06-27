const mergePo = require('merge-po')
const utils = require('loader-utils')

module.exports = async function(source) {
  if(this.cacheable) {
    this.cacheable()
  }

  let callback = this.async()
  let options = utils.getOptions(this)

  options = options || {}

  const fallbackPaths = options.fallbackPaths
  if(fallbackPaths && fallbackPaths.length > 0) {
    try {
      let mergedPo = await mergePo(source, fallbackPaths)
      callback(null, mergedPo)
    } catch (e) {
      callback(e)
    }
  } else {
    /* no fallback detected : return original po */
    callback(null, source)
  }
}
