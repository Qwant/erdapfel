const mergePo = require('@qwant/merge-po')
const utils = require('loader-utils')

module.exports = function(source) {

  if(this.cacheable) {
    this.cacheable()
  }
  let options = utils.getOptions(this)

  options = options || {}

  const fallbackList = options.fallbackList
  const messagePath = options.messagePath
  if(fallbackList && fallbackList.length > 0) {
    try {
      return mergePo(source, fallbackList, messagePath)
    } catch (e) {
      throw(e)
    }
  } else {/* no fallback detected : return original po */
   return source
  }
}
