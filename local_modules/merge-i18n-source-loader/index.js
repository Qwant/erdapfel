const mergeI18n = require('./src/merge_source')
const utils = require('loader-utils')

module.exports = function(source) {
  let callback = this.async()

  if(this.cacheable) {
    this.cacheable()
  }
  let options = utils.getOptions(this)
  options = options || {}
  mergeI18n(source, options.sources).then((i18nData) => {
    callback(null, i18nData)
  }).catch((error) => {
    callback(error)
  })
}
